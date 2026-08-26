/**
 * @s48 de `features/identidad_visual.feature`: la verificación en navegador
 * real es una puerta PROPIA y SEPARADA del arranque de sesión, no un peaje de
 * cada `bin/harness init`. Lee el TEXTO REAL de "package.json",
 * "harness.config.json" y "playwright.config.ts" (paso 12 de
 * `progress/plan_adaptacion_scss.md` §5) — nunca importa los símbolos que
 * comprueba, para que un cambio silencioso de la configuración real se
 * detecte igual que si lo hiciera un humano leyendo el fichero.
 */
import { describe, expect, it } from 'vitest'

function unicoTexto(ficheros: Record<string, string>, descripcion: string): string {
  const [texto] = Object.values(ficheros)
  if (texto === undefined) {
    throw new Error(`no se pudo leer el texto real de ${descripcion}`)
  }
  return texto
}

const textoDePackageJson = (): string =>
  unicoTexto(
    import.meta.glob('../../../package.json', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
    '"package.json"',
  )

const textoDeHarnessConfig = (): string =>
  unicoTexto(
    import.meta.glob('../../../harness.config.json', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
    '"harness.config.json"',
  )

const textoDePlaywrightConfig = (): string =>
  unicoTexto(
    import.meta.glob('../../../playwright.config.ts', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
    '"playwright.config.ts"',
  )

describe('identidad_visual @s48 — la puerta de navegador real es propia y separada', () => {
  it('"package.json" declara un guion propio "test:e2e"', () => {
    expect(textoDePackageJson()).toMatch(/"test:e2e"\s*:\s*"playwright test"/)
  })

  it('el comando de test del arnés no incluye "test:e2e"', () => {
    const harness = JSON.parse(textoDeHarnessConfig()) as { commands: { test: string } }
    expect(harness.commands.test).not.toContain('test:e2e')
    expect(harness.commands.test).toBe('pnpm run test')
  })

  it('"playwright.config.ts" ancla "testDir" a "tests/e2e"', () => {
    expect(textoDePlaywrightConfig()).toMatch(/testDir:\s*'\.\/tests\/e2e'/)
  })

  it('"playwright.config.ts" declara 0 reintentos', () => {
    expect(textoDePlaywrightConfig()).toMatch(/retries:\s*0\s*,/)
  })

  it('el "webServer" construye y sirve "dist/" con "vite preview" en el puerto 4173, nunca el servidor de desarrollo', () => {
    const texto = textoDePlaywrightConfig()
    // ACTUALIZADO (`despliegue_github_pages.feature` @s13-@s17, Decisión 47/51):
    // "vite preview" pasa a llevar el mismo "--base" que ya lleva "pnpm run
    // build", para servir "dist/" bajo el subpath real — mismo servidor,
    // mismo puerto, sigue sin ser el servidor de desarrollo.
    expect(texto).toMatch(
      /command:\s*'pnpm run build && pnpm exec vite preview --base=\/GalapavetClinicaVeterinaria\/ --port 4173 --strictPort'/,
    )
    expect(texto).not.toMatch(/\bvite\s+dev\b/)
    expect(texto).not.toContain("command: 'vite'")
  })
})
