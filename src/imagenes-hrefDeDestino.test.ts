/**
 * @s19/@s20 de `features/despliegue_github_pages.feature` (enmienda
 * 26/08/2026, Decisiones 53-54): la resolución de "src" con "hrefDeDestino"
 * vive en el ".tsx" que pinta el "<img>", nunca en los ficheros
 * "src/data/*.ts", que siguen declarando la ruta cruda. Lectura del TEXTO
 * REAL con "?raw" en Vitest (mismo patrón que
 * `enlaces-internos-hrefDeDestino.test.ts`).
 */
import { describe, expect, it } from 'vitest'

// "import.meta.glob" en vez de imports estáticos ".tsx?raw" (mismo patrón
// que `enlaces-internos-hrefDeDestino.test.ts`): oxlint no resuelve el
// export por defecto de un import estático de un módulo ".tsx" con "?raw".
const TEXTOS_DE_COMPONENTES = import.meta.glob(
  [
    './components/PieDePagina.tsx',
    './components/Galeria.tsx',
    './components/CampanasPortada.tsx',
    './pages/PaginaCampanas.tsx',
    './pages/PaginaBlog.tsx',
    './pages/PaginaTienda.tsx',
  ],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

const TEXTOS_DE_DATOS = import.meta.glob(
  ['./data/galeria.ts', './data/campanas.ts', './data/blog.ts', './data/tienda.ts'],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

function textoDe(mapa: Record<string, string>, rutaRelativa: string): string {
  const texto = mapa[rutaRelativa]
  if (texto === undefined) {
    throw new Error(`no se pudo leer el texto real de "${rutaRelativa}"`)
  }
  return texto
}

const pieDePaginaTexto = textoDe(TEXTOS_DE_COMPONENTES, './components/PieDePagina.tsx')
const galeriaTexto = textoDe(TEXTOS_DE_COMPONENTES, './components/Galeria.tsx')
const campanasPortadaTexto = textoDe(TEXTOS_DE_COMPONENTES, './components/CampanasPortada.tsx')
const paginaCampanasTexto = textoDe(TEXTOS_DE_COMPONENTES, './pages/PaginaCampanas.tsx')
const paginaBlogTexto = textoDe(TEXTOS_DE_COMPONENTES, './pages/PaginaBlog.tsx')
const paginaTiendaTexto = textoDe(TEXTOS_DE_COMPONENTES, './pages/PaginaTienda.tsx')

const FICHEROS_QUE_PINTAN_IMAGEN = {
  'PieDePagina.tsx': pieDePaginaTexto,
  'Galeria.tsx': galeriaTexto,
  'CampanasPortada.tsx': campanasPortadaTexto,
  'PaginaCampanas.tsx': paginaCampanasTexto,
  'PaginaBlog.tsx': paginaBlogTexto,
  'PaginaTienda.tsx': paginaTiendaTexto,
} as const

/** El patrón que exige el `Then` de @s19: el "src" del "<img>" se calcula con "hrefDeDestino(...)", no con un literal ni una propiedad cruda. */
const PATRON_SRC_CON_HREF_DE_DESTINO = /src=\{hrefDeDestino\(/

describe('@s19 los seis componentes que pintan una imagen local llaman a hrefDeDestino para resolver su src', () => {
  it.each(Object.entries(FICHEROS_QUE_PINTAN_IMAGEN))('"%s" calcula el "src" del "<img>" con "hrefDeDestino"', (_nombre, texto) => {
    expect(texto).toMatch(PATRON_SRC_CON_HREF_DE_DESTINO)
  })

  it('"CampanasPortada.tsx" llama a "hrefDeDestino" una segunda vez, para el "src" de la imagen dentro de la tarjeta (ya la llama para el "href" del enlace, @s7)', () => {
    const llamadas = campanasPortadaTexto.match(/hrefDeDestino\(/g) ?? []
    expect(llamadas.length).toBeGreaterThanOrEqual(2)
  })

  it('"PaginaBlog.tsx" llama a "hrefDeDestino" en sus dos puntos de renderizado de imagen: "Sigue leyendo" y la cabecera del artículo', () => {
    const llamadas = paginaBlogTexto.match(/src=\{hrefDeDestino\(/g) ?? []
    expect(llamadas.length).toBe(2)
  })

  it.each(Object.entries(FICHEROS_QUE_PINTAN_IMAGEN))('"%s" no concatena a mano el literal "/GalapavetClinicaVeterinaria/"', (_nombre, texto) => {
    expect(texto).not.toContain('/GalapavetClinicaVeterinaria/')
  })

  it('el recuento de ficheros efectivamente inspeccionados es exactamente 6', () => {
    expect(Object.keys(FICHEROS_QUE_PINTAN_IMAGEN)).toHaveLength(6)
  })
})

describe('@s20 los cuatro ficheros de datos de imagen siguen declarando la ruta cruda, sin importar hrefDeDestino', () => {
  const FICHEROS_DE_DATOS = {
    'galeria.ts': textoDe(TEXTOS_DE_DATOS, './data/galeria.ts'),
    'campanas.ts': textoDe(TEXTOS_DE_DATOS, './data/campanas.ts'),
    'blog.ts': textoDe(TEXTOS_DE_DATOS, './data/blog.ts'),
    'tienda.ts': textoDe(TEXTOS_DE_DATOS, './data/tienda.ts'),
  } as const

  it.each(Object.entries(FICHEROS_DE_DATOS))('"%s" no importa "hrefDeDestino"', (_nombre, texto) => {
    expect(texto).not.toContain('hrefDeDestino')
  })

  it.each(Object.entries(FICHEROS_DE_DATOS))('"%s" sigue declarando el literal crudo "/img/..."', (_nombre, texto) => {
    expect(texto).toContain('/img/')
  })

  it('el recuento de ficheros de datos efectivamente inspeccionados es exactamente 4', () => {
    expect(Object.keys(FICHEROS_DE_DATOS)).toHaveLength(4)
  })
})
