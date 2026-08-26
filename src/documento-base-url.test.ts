/**
 * @s12 de `features/despliegue_github_pages.feature`: las referencias a
 * `public/` escritas a mano dentro de "index.html" (favicon, apple-touch-icon,
 * los dos preloads de fuente) usan "%BASE_URL%" en vez de una ruta absoluta
 * literal (Decisión 50) — Vite sustituye "%BASE_URL%" por el "base" efectivo
 * al compilar "index.html"; los ficheros de `public/` se copian verbatim,
 * así que sin esta sustitución escrita a mano darían 404 bajo el subpath.
 * Lectura del TEXTO REAL de "index.html" con "?raw" en Vitest.
 *
 * HALLAZGO (documentado en `progress/tdd_despliegue_github_pages.md`): el
 * `.feature` dice "el recuento de referencias a public/... es exactamente 4"
 * (favicon + apple-touch-icon + 2 preloads), pero el documento real declara
 * DOS etiquetas `rel="icon"` (Decisión 36: `favicon.ico` + `favicon-32.png`,
 * el segundo como respaldo PNG) — 5 referencias reales, no 4. El propio
 * `.feature`, en @s14 (navegador real), pide explícitamente que las CINCO
 * respondan 200 bajo el subpath ("recuento de ficheros... es exactamente
 * 5"), así que dejar `favicon-32.png` sin `%BASE_URL%` la rompería en
 * producción — contradiciendo el propio contrato. Se corrige aquí el
 * recuento (documentado, no silencioso), y las 5 referencias reciben
 * "%BASE_URL%".
 */
import { describe, expect, it } from 'vitest'
import indexHtmlTexto from '../index.html?raw'

const PATRON_COMENTARIO_HTML = /<!--[\s\S]*?-->/g
const PATRON_LINK_DE_ICONO_O_PRECARGA = /<link\s+[^>]*(?:rel="icon"|rel="apple-touch-icon"|rel="preload"[^>]*as="font")[^>]*>/g

/** El texto del documento sin sus comentarios: el favicon vectorial (@s28 de `identidad_visual`, aún no publicado) vive comentado y no cuenta como referencia activa. */
function textoActivo(): string {
  return indexHtmlTexto.replace(PATRON_COMENTARIO_HTML, '')
}

function etiquetasDeIconoYPrecarga(): readonly string[] {
  return [...textoActivo().matchAll(PATRON_LINK_DE_ICONO_O_PRECARGA)].map((coincidencia) => coincidencia[0])
}

describe('@s12 el favicon, el apple-touch-icon y los dos preloads de fuente usan la variable de sustitución de Vite', () => {
  it('el "href" de cada "rel=icon" y del "rel=apple-touch-icon" empieza por "%BASE_URL%", no por "/" a secas', () => {
    const etiquetasDeIcono = etiquetasDeIconoYPrecarga().filter(
      (etiqueta) => etiqueta.includes('rel="icon"') || etiqueta.includes('rel="apple-touch-icon"'),
    )

    expect(etiquetasDeIcono.length).toBeGreaterThan(0)
    for (const etiqueta of etiquetasDeIcono) {
      expect(etiqueta).toMatch(/href="%BASE_URL%[^/][^"]*"/)
    }
  })

  it('el "href" de los dos "rel=preload as=font" empieza por "%BASE_URL%", no por "/" a secas', () => {
    const etiquetasDePrecarga = etiquetasDeIconoYPrecarga().filter((etiqueta) => etiqueta.includes('rel="preload"'))

    expect(etiquetasDePrecarga).toHaveLength(2)
    for (const etiqueta of etiquetasDePrecarga) {
      expect(etiqueta).toMatch(/href="%BASE_URL%[^/][^"]*"/)
    }
  })

  it('ninguna de esas referencias es una ruta absoluta literal que empiece por "/" sin pasar por "%BASE_URL%"', () => {
    for (const etiqueta of etiquetasDeIconoYPrecarga()) {
      expect(etiqueta).not.toMatch(/href="\/[^"]*"/)
    }
  })

  it('el recuento de referencias a "public/" efectivamente comprobadas en "index.html" es exactamente 5 (2 iconos + apple-touch-icon + 2 preloads — ver hallazgo en la cabecera del fichero)', () => {
    expect(etiquetasDeIconoYPrecarga()).toHaveLength(5)
  })
})
