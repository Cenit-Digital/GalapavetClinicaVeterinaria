/**
 * @s21 de `features/despliegue_github_pages.feature` (enmienda 26/08/2026,
 * Decisión 55): "MetadatosPagina.tsx" compone "IMAGEN_OPEN_GRAPH" como
 * "DOMINIO_SITIO" concatenado con "hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH)",
 * nunca con una concatenación cruda de "DOMINIO_SITIO" con
 * "RUTA_IMAGEN_OPEN_GRAPH" a secas. Lectura del TEXTO REAL con "?raw" en
 * Vitest. "import.meta.glob" en vez de un import estático ".tsx?raw" (mismo
 * patrón que `enlaces-internos-hrefDeDestino.test.ts`): oxlint no resuelve el
 * export por defecto de un módulo ".tsx" real con esa query en un import
 * estático.
 */
import { describe, expect, it } from 'vitest'

const TEXTOS = import.meta.glob('./components/MetadatosPagina.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const metadatosPaginaTexto = TEXTOS['./components/MetadatosPagina.tsx']
if (metadatosPaginaTexto === undefined) {
  throw new Error('no se pudo leer el texto real de "MetadatosPagina.tsx"')
}

/**
 * El texto sin comentarios de bloque: el porqué de "DOMINIO_SITIO" cita el
 * subpath en prosa, y esa prosa no cuenta como código (mismo criterio que
 * `documento-base-url.test.ts` con comentarios HTML). No se despoja también
 * comentarios de línea "//": el propio literal "https://cenit-digital.github.io"
 * contiene "//" dentro de una cadena, y este fichero no usa comentarios "//"
 * en ningún otro punto — despojarlos mutilaría el literal real.
 */
const PATRON_COMENTARIO_DE_BLOQUE = /\/\*[\s\S]*?\*\//g
const codigoActivo = metadatosPaginaTexto.replace(PATRON_COMENTARIO_DE_BLOQUE, '')

describe('@s21 MetadatosPagina.tsx compone IMAGEN_OPEN_GRAPH con hrefDeDestino, no con una concatenación cruda', () => {
  it('declara "IMAGEN_OPEN_GRAPH" con "hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH)", no con "RUTA_IMAGEN_OPEN_GRAPH" a secas', () => {
    expect(codigoActivo).toContain('hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH)')
  })

  it('"DOMINIO_SITIO" sigue siendo el literal "https://cenit-digital.github.io", sin el subpath añadido a mano dentro de este fichero', () => {
    expect(codigoActivo).toContain("const DOMINIO_SITIO = 'https://cenit-digital.github.io'")
    expect(codigoActivo).not.toContain('GalapavetClinicaVeterinaria')
  })

  it('no existe ninguna concatenación de DOMINIO_SITIO con RUTA_IMAGEN_OPEN_GRAPH que no pase por hrefDeDestino', () => {
    expect(codigoActivo).not.toMatch(/\$\{DOMINIO_SITIO\}\$\{RUTA_IMAGEN_OPEN_GRAPH\}/)
  })
})
