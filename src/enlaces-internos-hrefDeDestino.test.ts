/**
 * @s7/@s8 de `features/despliegue_github_pages.feature` (Decisión 48): los 4
 * puntos con enlaces internos literales resuelven su "href" de tipo ruta con
 * "hrefDeDestino", en vez de concatenar a mano el subpath — incluido el
 * panel móvil de "Cabecera", que navega con "window.history.pushState" en
 * vez de un "<a>" normal. Lectura del TEXTO REAL con "?raw" en Vitest.
 */
import { describe, expect, it } from 'vitest'

// "import.meta.glob" en vez de 4 "import ... from '*.tsx?raw'" estáticos
// (mismo patrón que `src/styles/tokens-api.test.ts` y `App-basename.test.ts`):
// oxlint no resuelve el export por defecto de un módulo ".tsx" real con la
// query "?raw" en un import estático.
const TEXTOS_DE_COMPONENTES = import.meta.glob(
  ['./components/Cabecera.tsx', './components/PieDePagina.tsx', './components/CampanasPortada.tsx', './pages/PaginaNoEncontrada.tsx'],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

function textoDe(rutaRelativa: string): string {
  const texto = TEXTOS_DE_COMPONENTES[rutaRelativa]
  if (texto === undefined) {
    throw new Error(`no se pudo leer el texto real de "${rutaRelativa}"`)
  }
  return texto
}

const cabeceraTexto = textoDe('./components/Cabecera.tsx')
const pieDePaginaTexto = textoDe('./components/PieDePagina.tsx')

const FICHEROS_CON_ENLACES_INTERNOS = {
  'Cabecera.tsx': cabeceraTexto,
  'PieDePagina.tsx': pieDePaginaTexto,
  'CampanasPortada.tsx': textoDe('./components/CampanasPortada.tsx'),
  'PaginaNoEncontrada.tsx': textoDe('./pages/PaginaNoEncontrada.tsx'),
} as const

describe('@s7 Cabecera, PieDePagina, CampanasPortada y PaginaNoEncontrada resuelven su href de ruta con hrefDeDestino', () => {
  it.each(Object.entries(FICHEROS_CON_ENLACES_INTERNOS))('"%s" llama a "hrefDeDestino"', (_nombre, texto) => {
    expect(texto).toContain('hrefDeDestino(')
  })

  it.each(Object.entries(FICHEROS_CON_ENLACES_INTERNOS))(
    '"%s" no concatena a mano el literal "/GalapavetClinicaVeterinaria/"',
    (_nombre, texto) => {
      expect(texto).not.toContain('/GalapavetClinicaVeterinaria/')
    },
  )

  it('los enlaces legales del pie (externos, target="_blank") no pasan por hrefDeDestino: siguen renderizando "enlace.destino" tal cual', () => {
    expect(pieDePaginaTexto).toMatch(/enlacesLegales\.map[\s\S]*?href=\{enlace\.destino\}/)
  })

  it('el recuento de ficheros efectivamente inspeccionados es exactamente 4', () => {
    expect(Object.keys(FICHEROS_CON_ENLACES_INTERNOS)).toHaveLength(4)
  })
})

describe('@s8 el panel móvil de la cabecera actualiza la URL visible con la ruta ya resuelta por la base', () => {
  it('el manejador de clic pasa a "window.history.pushState" el "href" ya resuelto por "hrefDeDestino", no el destino crudo', () => {
    expect(cabeceraTexto).toMatch(/window\.history\.pushState\(null, '', hrefDeDestino\(destino\)\)/)
  })

  it('para un destino de tipo ancla el manejador sigue sin llamar a "pushState", exactamente como hoy', () => {
    expect(cabeceraTexto).toContain('if (!esAncla(destino))')
  })
})
