/**
 * @s3 de `features/despliegue_github_pages.feature`: "App.tsx" monta
 * "BrowserRouter" con el "basename" derivado de "BASE_URL" (Decisión 47/48).
 * Lectura del TEXTO REAL de "App.tsx" con "?raw" en Vitest: afirma una
 * declaración estática del elemento, no un comportamiento en tiempo de
 * ejecución — ese lo sigue cubriendo la suite real de "App.test.tsx" sin
 * ningún cambio de aserción (BASE_URL sigue siendo "/" en test, así que
 * `basename="/"` es equivalente a no declarar "basename" — confirmado
 * corriendo la suite completa tras el cambio, no solo asumido).
 */
import { describe, expect, it } from 'vitest'

// "import.meta.glob" en vez de un "import ... from './App.tsx?raw'" estático
// (mismo patrón que `src/styles/tokens-api.test.ts`): oxlint intenta resolver
// el export por defecto de un módulo ".tsx" real incluso con la query "?raw"
// y no lo encuentra (no aplica a ".html"/".ts", donde sí funciona el import
// estático — verificado en vivo, `documento.test.ts`/`configuracion-build.test.ts`
// pasan lint tal cual).
const appTsxTexto = Object.values(
  import.meta.glob('./App.tsx', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
)[0] as string

const PATRON_COMENTARIO_DE_BLOQUE = /\/\*[\s\S]*?\*\//g

/** El texto del módulo sin sus comentarios de bloque: lo que TypeScript compila de verdad. */
function textoActivo(): string {
  return appTsxTexto.replace(PATRON_COMENTARIO_DE_BLOQUE, '')
}

describe('@s3 App.tsx monta BrowserRouter con el basename derivado de BASE_URL', () => {
  it('declara el atributo "basename={import.meta.env.BASE_URL}"', () => {
    expect(textoActivo()).toContain('basename={import.meta.env.BASE_URL}')
  })

  it('no existe ninguna declaración de "<BrowserRouter>" sin ese atributo', () => {
    const declaraciones = textoActivo().match(/<BrowserRouter\b[^>]*>/g) ?? []

    expect(declaraciones.length).toBeGreaterThan(0)
    for (const declaracion of declaraciones) {
      expect(declaracion).toContain('basename={import.meta.env.BASE_URL}')
    }
  })
})
