/**
 * @s1 de `features/despliegue_github_pages.feature`: el flag "--base" del
 * subpath de GitHub Pages vive SOLO en el script "build" de "package.json",
 * nunca como clave "base" en "vite.config.ts" (Decisión 47) — así
 * `import.meta.env.BASE_URL` sigue siendo "/" en "pnpm run dev" y en
 * "vitest run" (@s2), y ningún test ya "done" que afirma un "href" literal
 * necesita reescribirse. Lectura del TEXTO REAL con "?raw" en Vitest: afirma
 * qué comando ejecuta qué, no un comportamiento en tiempo de ejecución.
 */
import { describe, expect, it } from 'vitest'
import packageJsonTexto from '../package.json?raw'
import viteConfigTexto from '../vite.config.ts?raw'

const SUBPATH_DE_PRODUCCION = '/GalapavetClinicaVeterinaria/'

interface ScriptsDePackageJson {
  readonly scripts: Record<string, string>
}

function leerScripts(): Record<string, string> {
  return (JSON.parse(packageJsonTexto) as ScriptsDePackageJson).scripts
}

describe('@s1 el script "build" fija el subpath con el flag de Vite, y solo ahí', () => {
  it('el script "build" invoca "vite build" con el flag "--base=/GalapavetClinicaVeterinaria/"', () => {
    expect(leerScripts().build).toContain(`vite build --base=${SUBPATH_DE_PRODUCCION}`)
  })

  it('"vite.config.ts" no declara ninguna clave "base" en su configuración', () => {
    expect(viteConfigTexto).not.toMatch(/\bbase\s*:/)
  })

  it('el flag de "package.json" es el único sitio del repositorio donde se fija el "base" de Vite: ni "dev" ni "preview" lo declaran', () => {
    const scripts = leerScripts()
    expect(scripts.dev).not.toContain('--base')
    expect(scripts.preview).not.toContain('--base')
  })
})
