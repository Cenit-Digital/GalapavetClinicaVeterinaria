/**
 * @s11 de `features/despliegue_github_pages.feature`: "public/404.html" y el
 * script de decodificación de "index.html" contienen de VERDAD la técnica de
 * `rafgraph/spa-github-pages` (Decisión 49) — no solo su gemelo puro
 * (`src/lib/tecnicaSpaGithubPages.ts`, verificado por @s9/@s10). Lectura del
 * TEXTO REAL de ambos ficheros con "?raw" en Vitest, mismo patrón que
 * `src/documento.test.ts`.
 */
import { describe, expect, it } from 'vitest'
import html404Texto from '../public/404.html?raw'
import indexHtmlTexto from '../index.html?raw'
import viteConfigTexto from '../vite.config.ts?raw'

describe('@s11 public/404.html y el script de decodificación de index.html contienen la técnica real', () => {
  it('"public/404.html" declara "pathSegmentsToKeep" con el valor 1', () => {
    expect(html404Texto).toMatch(/pathSegmentsToKeep\s*=\s*1\b/)
  })

  it('"public/404.html" codifica "pathname", "search" y "hash" antes de redirigir a la raíz', () => {
    expect(html404Texto).toMatch(/l\.pathname/)
    expect(html404Texto).toMatch(/l\.search/)
    expect(html404Texto).toMatch(/l\.hash/)
    expect(html404Texto).toMatch(/l\.replace\(/)
  })

  it('"index.html" contiene un segundo script que llama a "window.history.replaceState"', () => {
    expect(indexHtmlTexto).toContain('window.history.replaceState')
  })

  it('ese script de "index.html" aparece ANTES de la etiqueta que carga la aplicación', () => {
    const indiceScriptDeDecodificacion = indexHtmlTexto.indexOf('window.history.replaceState')
    const indiceScriptDeLaApp = indexHtmlTexto.indexOf('<script type="module" src="/src/main.tsx">')

    expect(indiceScriptDeDecodificacion).toBeGreaterThan(-1)
    expect(indiceScriptDeLaApp).toBeGreaterThan(-1)
    expect(indiceScriptDeDecodificacion).toBeLessThan(indiceScriptDeLaApp)
  })

  it('"public/404.html" no es una entrada de Vite: "vite.config.ts" no declara ningún "input" de build', () => {
    expect(viteConfigTexto).not.toContain('input')
    expect(viteConfigTexto).not.toContain('404.html')
  })
})
