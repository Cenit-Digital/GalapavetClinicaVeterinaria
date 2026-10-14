/**
 * @s48 de `features/identidad_visual.feature`: la verificación en navegador
 * real es una puerta PROPIA y SEPARADA del arranque de sesión, no un peaje de
 * cada `bin/harness init`. Lee el TEXTO REAL de "package.json",
 * "harness.config.json" y "playwright.config.ts" (paso 12 de
 * `progress/plan_adaptacion_scss.md` §5) — nunca importa los símbolos que
 * comprueba, para que un cambio silencioso de la configuración real se
 * detecte igual que si lo hiciera un humano leyendo el fichero.
 */
import ts from 'typescript'
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

  // hero_reducido_con_animacion @s4 acredita @s5-@s12 por el código de salida de `pnpm run test:e2e`.
  // Sin "forbidOnly", un `test.only` olvidado deja esa corrida en verde ejecutando SOLO ese test (medido:
  // «1 passed», código 0, y los demás ni se ejecutan). Va SIN condición de entorno: el proyecto ya fija
  // "retries: 0" a propósito para no tener verdes engañosos, y una condición de CI dejaría pasar el
  // `.only` en la máquina de quien cierra la feature. La línea ha de estar sola y viva: un comentario que
  // citara `forbidOnly: true,` no la sustituye.
  it('"playwright.config.ts" declara "forbidOnly: true" sin condición de entorno', () => {
    expect(textoDePlaywrightConfig()).toMatch(/^\s*forbidOnly:\s*true\s*,\s*$/m)
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

// ---------------------------------------------------------------------------
// Las esperas de los specs de navegador llevan un tope explícito (hero_reducido_con_animacion,
// panel de revisión del 14/10/2026, hallazgo C5)
// ---------------------------------------------------------------------------
//
// En Playwright 1.62 `page.waitForFunction` espera SIN tope por omisión (el valor por defecto de su
// opción `timeout` es 0; MEDIDO leyendo `PageWaitForFunctionOptions` en `playwright-core`, no en la
// documentación oficial) y `playwright.config.ts` no declara `actionTimeout`. Una espera que nunca
// se cumple solo la corta el tiempo del test entero, y falla con «Test timeout of 60000ms exceeded»,
// sin decir QUÉ esperaba. Con un tope propio el fallo nombra la espera.
//
// Se lee el ÁRBOL del código y no su texto: una mención en un comentario o en una cadena no es una
// llamada, y la firma es `(función, argumento, opciones)`: unas opciones escritas como SEGUNDO
// parámetro serían el argumento de la función, no el tope.

const LLAMADA_A_LA_ESPERA = 'waitForFunction'
const POSICION_DE_LAS_OPCIONES = 2
const NOMBRE_DEL_TOPE = 'timeout'
/** Un tope de 0 es, para Playwright, «sin tope». */
const TOPE_SIN_LIMITE = '0'

function nombreDeLaPropiedad(propiedad: ts.ObjectLiteralElementLike): string | undefined {
  return (ts.isPropertyAssignment(propiedad) || ts.isShorthandPropertyAssignment(propiedad)) && ts.isIdentifier(propiedad.name)
    ? propiedad.name.text
    : undefined
}

function declaraUnTope(opciones: ts.Expression | undefined): boolean {
  if (opciones === undefined || !ts.isObjectLiteralExpression(opciones)) {
    return false
  }
  const tope = opciones.properties.find((propiedad) => nombreDeLaPropiedad(propiedad) === NOMBRE_DEL_TOPE)
  const valorEscrito = tope !== undefined && ts.isPropertyAssignment(tope) ? tope.initializer.getText() : undefined
  return tope !== undefined && valorEscrito !== TOPE_SIN_LIMITE
}

/** Todas las llamadas a `waitForFunction` de un texto TypeScript, por su árbol. */
function llamadasALaEspera(texto: string): readonly ts.CallExpression[] {
  const fichero = ts.createSourceFile('espera.ts', texto, ts.ScriptTarget.Latest, true)
  const llamadas: ts.CallExpression[] = []
  const recorrer = (nodo: ts.Node): void => {
    if (ts.isCallExpression(nodo) && ts.isPropertyAccessExpression(nodo.expression) && nodo.expression.name.text === LLAMADA_A_LA_ESPERA) {
      llamadas.push(nodo)
    }
    ts.forEachChild(nodo, recorrer)
  }
  recorrer(fichero)
  return llamadas
}

/** Las que no declaran un tope: su primera línea, para nombrarlas. */
function esperasSinTope(texto: string): readonly string[] {
  return llamadasALaEspera(texto)
    .filter((llamada) => !declaraUnTope(llamada.arguments[POSICION_DE_LAS_OPCIONES]))
    .map((llamada) => llamada.getText().split('\n')[0] as string)
}

const FICHEROS_DE_NAVEGADOR = import.meta.glob('../../../tests/e2e/**/*.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

describe('las esperas de los specs de navegador real llevan un tope explícito', () => {
  const FILAS: ReadonlyArray<readonly [string, string, number]> = [
    ['sin ninguna opción', 'await page.waitForFunction(() => hecho())', 1],
    ['con argumento y sin opciones', 'await page.waitForFunction((x) => x, 1)', 1],
    ['unas opciones escritas como SEGUNDO parámetro: son el argumento de la función, no el tope', 'await page.waitForFunction(fn, { timeout: 5000 })', 1],
    ['un tope de 0, que Playwright entiende como «sin tope»', 'await page.waitForFunction(fn, undefined, { timeout: 0 })', 1],
    ['unas opciones sin tope', 'await page.waitForFunction(fn, undefined, { polling: 100 })', 1],
    ['unas opciones que no son un literal (no se pueden leer)', 'await page.waitForFunction(fn, undefined, opciones)', 1],
    ['un tope escrito con una constante', 'await page.waitForFunction(fn, undefined, { timeout: TOPE_MS })', 0],
    ['un tope escrito como número', 'await page.waitForFunction(fn, arg, { timeout: 5000 })', 0],
    ['un tope escrito en abreviado', 'await page.waitForFunction(fn, arg, { timeout })', 0],
    ['una mención en un comentario no es una llamada', '// page.waitForFunction(fn)\n/* page.waitForFunction(fn) */', 0],
    ['una mención en una cadena no es una llamada', "const nota = 'page.waitForFunction(fn)'", 0],
  ]

  it.each(FILAS)('%s', (_descripcion, texto, sinTope) => {
    expect(esperasSinTope(texto)).toHaveLength(sinTope)
  })

  it('las llamadas se cuentan por el árbol: una mención en un comentario o en una cadena no cuenta', () => {
    expect(llamadasALaEspera('page.waitForFunction(a)\n// page.waitForFunction(b)\nconst c = "page.waitForFunction(c)"')).toHaveLength(1)
  })

  it('en tests/e2e hay esperas de verdad y ninguna carece de tope', () => {
    const esperas = Object.values(FICHEROS_DE_NAVEGADOR).reduce((suma, texto) => suma + llamadasALaEspera(texto).length, 0)
    const sinTope = Object.entries(FICHEROS_DE_NAVEGADOR).flatMap(([ruta, texto]) =>
      esperasSinTope(texto).map((llamada) => `${ruta.split('/').pop()}: ${llamada}`),
    )

    expect(esperas).toBeGreaterThan(0)
    expect(sinTope).toEqual([])
  })
})
