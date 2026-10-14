import { describe, expect, it } from 'vitest'
import { comprobarMedicionEstable, esFicheroDeTestDePlaywright, type Veredicto } from './medicionEstable'

/**
 * hero_reducido_con_animacion @s10 — «todo test que mide la portada recién
 * cargada lo hace con la entrada ya terminada o con movimiento reducido
 * emulado». Esta es la COMPROBACIÓN ESTÁTICA: un módulo puro que lee el TEXTO
 * de un spec de navegador y decide, bloque `test(` por bloque `test(`, si
 * cumple. Vive aquí (mordible por StrykerJS) y no en `tests/e2e`; el cableado a
 * los specs REALES está en `medicionEstableSpecsReales.test.ts`.
 *
 * Las filas sintéticas están escritas con las MISMAS formas que usan los
 * specs reales: `cargarPortada()` y `cajaDe()` de `fidelidad-hero.spec.ts`, el
 * bucle por rutas con `AxeBuilder` de `accesibilidad.spec.ts`, el `boundingBox`
 * de `tipografia.spec.ts`. Las filas con el prefijo A1…A8 son las de la revisión
 * independiente del 14/10/2026 (ola 4a): cada una fija una forma que la comprobación
 * dejaba pasar en silencio.
 */

const CABECERA_DEL_SPEC = [
  "import { AxeBuilder } from '@axe-core/playwright'",
  "import { expect, test, type Locator, type Page } from 'playwright/test'",
  "import { esperarEntradaTerminada } from './entrada'",
  "import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'",
  '',
].join('\n')

/** Un spec con una cabecera real, funciones locales opcionales y UN bloque `test(`. */
function specConUnBloque(bloque: string, funcionesLocales = ''): string {
  return [CABECERA_DEL_SPEC, funcionesLocales, bloque, ''].join('\n')
}

function veredictoDelUnicoBloque(spec: string): Veredicto {
  const informe = comprobarMedicionEstable(spec)
  expect(informe.bloquesInspeccionados).toBe(1)
  return informe.bloques[0]?.veredicto as Veredicto
}

const CAJA_DE_UN_LOCALIZADOR = [
  'async function cajaDe(locator: Locator) {',
  '  return locator.evaluate((elemento) => {',
  '    const { x, y, width, height } = elemento.getBoundingClientRect()',
  '    return { x, y, width, height }',
  '  })',
  '}',
].join('\n')

const CARGAR_PORTADA_CON_ESPERA = [
  'async function cargarPortada(page: Page) {',
  '  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)',
  '  await esperarEntradaTerminada(page)',
  "  return page.locator('[data-hero-contenido]')",
  '}',
].join('\n')

interface FilaDeLaTabla {
  /** La fila, tal como la escribe el contrato. */
  readonly fila: string
  readonly spec: string
  readonly veredicto: Veredicto
}

const TABLA_DE_FILAS: readonly FilaDeLaTabla[] = [
  {
    fila: 'mide con "getBoundingClientRect" sobre el titular antes de llamar al helper',
    spec: specConUnBloque(
      [
        "test('mide el titular antes de esperar', async ({ page }) => {",
        "  await page.goto('/')",
        "  const caja = await page.getByRole('heading', { level: 1 }).evaluate((titular) => titular.getBoundingClientRect())",
        '  await esperarEntradaTerminada(page)',
        '  expect(caja.x).toBeGreaterThan(0)',
        '})',
      ].join('\n'),
    ),
    veredicto: 'incumple',
  },
  {
    fila: 'llama al helper después de su primera medición',
    spec: specConUnBloque(
      [
        "test('mide, espera y vuelve a medir', async ({ page }) => {",
        "  await page.goto('/')",
        "  const antes = await page.locator('h1').boundingBox()",
        '  await esperarEntradaTerminada(page)',
        "  const despues = await page.locator('h1').boundingBox()",
        '  expect(despues).toEqual(antes)',
        '})',
      ].join('\n'),
    ),
    veredicto: 'incumple',
  },
  {
    fila: 'emula "reduce" con "emulateMedia" después del "goto" y mide el titular',
    spec: specConUnBloque(
      [
        "test('emula tarde', async ({ page }) => {",
        "  await page.goto('/')",
        "  await page.emulateMedia({ reducedMotion: 'reduce' })",
        "  const caja = await page.locator('h1').boundingBox()",
        '  expect(caja).not.toBeNull()',
        '})',
      ].join('\n'),
    ),
    veredicto: 'incumple',
  },
  {
    fila: 'llama al helper y después mide el titular',
    spec: specConUnBloque(
      [
        "test('espera y mide', async ({ page }) => {",
        "  await page.goto('/')",
        '  await esperarEntradaTerminada(page)',
        "  const caja = await page.locator('h1').boundingBox()",
        '  expect(caja).not.toBeNull()',
        '})',
      ].join('\n'),
    ),
    veredicto: 'pasa',
  },
  {
    fila: 'llama a una función local "cargarPortada()" del mismo fichero, que contiene el "goto" y el helper, y después mide el titular',
    spec: specConUnBloque(
      [
        "test('carga con espera y mide', async ({ page }) => {",
        '  const contenido = await cargarPortada(page)',
        "  const caja = await contenido.getByRole('heading', { level: 1 }).boundingBox()",
        '  expect(caja).not.toBeNull()',
        '})',
      ].join('\n'),
      CARGAR_PORTADA_CON_ESPERA,
    ),
    veredicto: 'pasa',
  },
  {
    fila: 'mide el titular por una función local del mismo fichero cuyo cuerpo contiene "getBoundingClientRect", sin esperar antes',
    spec: specConUnBloque(
      [
        "test('mide por cajaDe sin esperar', async ({ page }) => {",
        "  await page.goto('/')",
        "  const caja = await cajaDe(page.getByRole('heading', { level: 1 }))",
        '  expect(caja.width).toBeGreaterThan(0)',
        '})',
      ].join('\n'),
      CAJA_DE_UN_LOCALIZADOR,
    ),
    veredicto: 'incumple',
  },
  {
    fila: 'emula "reduce" antes del "goto" y mide el titular',
    spec: specConUnBloque(
      [
        "test('emula a tiempo', async ({ page }) => {",
        "  await page.emulateMedia({ reducedMotion: 'reduce' })",
        "  await page.goto('/')",
        "  const caja = await page.locator('h1').boundingBox()",
        '  expect(caja).not.toBeNull()',
        '})',
      ].join('\n'),
    ),
    veredicto: 'pasa',
  },
  {
    fila: 'recorre las rutas del inventario con "emulateMedia" antes del bucle y mide con "AxeBuilder" sin ".include("',
    spec: specConUnBloque(
      [
        "test('recorre las rutas', async ({ page }) => {",
        "  await page.emulateMedia({ reducedMotion: 'reduce' })",
        '  for (const { ruta } of RUTAS_DEL_INVENTARIO) {',
        '    await page.goto(ruta)',
        '    const analisis = await new AxeBuilder({ page }).analyze()',
        '    expect(analisis.violations).toEqual([])',
        '  }',
        '})',
      ].join('\n'),
    ),
    veredicto: 'pasa',
  },
  {
    fila: 'mide con "AxeBuilder" sin ".include(" sin ninguna de las dos vías',
    spec: specConUnBloque(
      [
        "test('axe sin esperar', async ({ page }) => {",
        '  for (const { ruta } of RUTAS_DEL_INVENTARIO) {',
        '    await page.goto(ruta)',
        '    const analisis = await new AxeBuilder({ page }).analyze()',
        '    expect(analisis.violations).toEqual([])',
        '  }',
        '})',
      ].join('\n'),
    ),
    veredicto: 'incumple',
  },
  {
    fila: 'hace una captura de píxeles de la página sin ninguna de las dos vías',
    spec: specConUnBloque(
      [
        "test('captura sin esperar', async ({ page }) => {",
        "  await page.goto('/')",
        '  const imagen = await page.screenshot()',
        '  expect(imagen.byteLength).toBeGreaterThan(0)',
        '})',
      ].join('\n'),
    ),
    veredicto: 'incumple',
  },
  {
    fila: 'solo mide "font-size" del titular',
    spec: specConUnBloque(
      [
        "test('tamaño del titular', async ({ page }) => {",
        "  await page.goto('/')",
        "  const tamano = await page.locator('h1').evaluate((titular) => getComputedStyle(titular).fontSize)",
        "  expect(tamano).toBe('48px')",
        '})',
      ].join('\n'),
    ),
    veredicto: 'exento',
  },
  {
    fila: 'solo lee "document.documentElement.scrollWidth"',
    spec: specConUnBloque(
      [
        "test('sin barra horizontal', async ({ page }) => {",
        "  await page.goto('/')",
        '  const ancho = await page.evaluate(() => document.documentElement.scrollWidth)',
        '  expect(ancho).toBeLessThanOrEqual(320)',
        '})',
      ].join('\n'),
    ),
    veredicto: 'exento',
  },
  {
    fila: 'mide con "getBoundingClientRect" una sección que no es del hero, sin esperar',
    spec: specConUnBloque(
      [
        "test('caja del contacto', async ({ page }) => {",
        "  await page.goto('/')",
        "  const caja = await cajaDe(page.locator('#contacto'))",
        '  expect(caja.height).toBeGreaterThan(0)',
        '})',
      ].join('\n'),
      CAJA_DE_UN_LOCALIZADOR,
    ),
    veredicto: 'exento',
  },
  {
    fila: 'congela el reloj antes de navegar, coloca "currentTime" y después mide el titular',
    spec: specConUnBloque(
      [
        "test('congelado y colocado', async ({ page, context }) => {",
        '  const sesion = await context.newCDPSession(page)',
        "  await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })",
        "  await page.goto('/')",
        '  await page.evaluate(() => document.getAnimations().forEach((animacion) => { animacion.currentTime = 0 }))',
        "  const caja = await page.locator('h1').boundingBox()",
        '  expect(caja).not.toBeNull()',
        '})',
      ].join('\n'),
    ),
    veredicto: 'exento',
  },
  {
    fila: 'congela el reloj antes de navegar y mide el titular SIN colocar ni cancelar las animaciones',
    spec: specConUnBloque(
      [
        "test('congelado sin colocar', async ({ page, context }) => {",
        '  const sesion = await context.newCDPSession(page)',
        "  await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })",
        "  await page.goto('/')",
        "  const caja = await page.locator('h1').boundingBox()",
        '  expect(caja).not.toBeNull()',
        '})',
      ].join('\n'),
    ),
    veredicto: 'incumple',
  },
  {
    fila: 'no emula "reduce" ni llama al helper y mide el titular',
    spec: specConUnBloque(
      [
        "test('mide sin más', async ({ page }) => {",
        "  await page.goto('/')",
        "  const caja = await page.locator('h1').boundingBox()",
        '  expect(caja).not.toBeNull()',
        '})',
      ].join('\n'),
    ),
    veredicto: 'incumple',
  },
]

describe('hero_reducido_con_animacion @s10 (tabla de 16 filas del contrato): el veredicto de la comprobación estática sobre cada bloque "test(" sintético', () => {
  it('la tabla tiene exactamente las 16 filas del contrato', () => {
    expect(TABLA_DE_FILAS).toHaveLength(16)
  })

  it.each(TABLA_DE_FILAS)('$veredicto: $fila', ({ spec, veredicto }) => {
    expect(veredictoDelUnicoBloque(spec)).toBe(veredicto)
  })
})

/** Un bloque `test(` cuyo cuerpo son las líneas dadas, con el titular `h1` como sujeto por defecto. */
function cuerpo(...lineas: readonly string[]): string {
  return ["test('bloque de prueba', async ({ page, context }) => {", ...lineas.map((linea) => `  ${linea}`), '})'].join('\n')
}

function veredictoDe(...lineasDelCuerpo: readonly string[]): Veredicto {
  return veredictoDelUnicoBloque(specConUnBloque(cuerpo(...lineasDelCuerpo)))
}

const MIDE_EL_TITULAR = "const caja = await page.locator('h1').boundingBox()"
const ESPERA = 'await esperarEntradaTerminada(page)'
const EMULA_REDUCE = "await page.emulateMedia({ reducedMotion: 'reduce' })"
const NAVEGA = "await page.goto('/')"

describe('hero_reducido_con_animacion @s10: cómo se leen los bloques', () => {
  it('un fichero sin ningún "test(" no inspecciona nada y NO pasa: la guarda anti-vacuidad', () => {
    const informe = comprobarMedicionEstable("import { test } from 'playwright/test'\n")

    expect(informe.bloquesInspeccionados).toBe(0)
    expect(informe.bloques).toEqual([])
    expect(informe.incumplimientos).toEqual([])
    expect(informe.pasa).toBe(false)
  })

  it('cada bloque se juzga por separado: el informe nombra solo los que incumplen y el fichero no pasa', () => {
    const spec = [
      CABECERA_DEL_SPEC,
      "test.describe('un grupo', () => {",
      `  ${cuerpo(NAVEGA, ESPERA, MIDE_EL_TITULAR).replace("'bloque de prueba'", "'cumple'")}`,
      `  ${cuerpo(NAVEGA, MIDE_EL_TITULAR).replace("'bloque de prueba'", "'no cumple'")}`,
      `  ${cuerpo(NAVEGA).replace("'bloque de prueba'", "'no mide nada'")}`,
      '})',
    ].join('\n')

    const informe = comprobarMedicionEstable(spec)

    expect(informe.bloquesInspeccionados).toBe(3)
    expect(informe.bloques).toEqual([
      { titulo: 'cumple', veredicto: 'pasa' },
      { titulo: 'no cumple', veredicto: 'incumple' },
      { titulo: 'no mide nada', veredicto: 'exento' },
    ])
    expect(informe.incumplimientos).toEqual(['no cumple'])
    expect(informe.pasa).toBe(false)
  })

  it('un fichero con todos los bloques en regla pasa', () => {
    const informe = comprobarMedicionEstable(specConUnBloque(cuerpo(NAVEGA, ESPERA, MIDE_EL_TITULAR)))

    expect(informe.pasa).toBe(true)
    expect(informe.incumplimientos).toEqual([])
  })

  it('"test.describe(", "test.beforeEach(" y "test.use(" no son bloques de test', () => {
    const spec = [
      CABECERA_DEL_SPEC,
      "test.use({ viewport: { width: 320, height: 900 } })",
      "test.describe('grupo', () => {",
      '  test.beforeEach(async ({ page }) => {',
      `    ${NAVEGA}`,
      '  })',
      `  ${cuerpo(MIDE_EL_TITULAR)}`,
      '})',
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(1)
  })

  it('un identificador que solo TERMINA en "test" ("minitest(", "contest(") o es una propiedad ("obj.test(") no es un bloque', () => {
    const spec = ['minitest("a", () => {})', 'contest("b", () => {})', 'obj.test("c", () => {})', 'test_("d", () => {})', '$test("e", () => {})', cuerpo(MIDE_EL_TITULAR)].join('\n')

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(1)
  })

  it('un "test(" con espacio antes del paréntesis también es un bloque', () => {
    expect(comprobarMedicionEstable("test ('x', async () => {})").bloquesInspeccionados).toBe(1)
  })

  it('el titular puede llevar llaves, paréntesis y comillas sin desbalancear la lectura de los bloques siguientes', () => {
    const spec = [
      "test('regla { sin cerrar ( y \"comillas\" y \\'escapadas\\'', async ({ page }) => {",
      `  ${NAVEGA}`,
      '})',
      cuerpo(NAVEGA, MIDE_EL_TITULAR),
    ].join('\n')

    const informe = comprobarMedicionEstable(spec)

    expect(informe.bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('el titular de un bloque con plantilla ("`${pagina} …`") se lee, y un "test(" dentro de un bucle cuenta', () => {
    const spec = ['for (const pagina of PAGINAS) {', "  test(`${pagina} ruta`, async ({ page }) => {", `    ${NAVEGA}`, '  })', '}'].join('\n')

    const informe = comprobarMedicionEstable(spec)

    expect(informe.bloques).toEqual([{ titulo: '${pagina} ruta', veredicto: 'exento' }])
  })

  it('un "test(" sin titular de cadena se lee como bloque de titular vacío', () => {
    const informe = comprobarMedicionEstable('test(nombreDelTest, async ({ page }) => {\n  await page.goto("/")\n})')

    expect(informe.bloques).toEqual([{ titulo: '', veredicto: 'exento' }])
  })

  it('lo que dice el TITULAR no cuenta: ni nombrar el ayudante lo satisface, ni nombrar una medición o el titular obliga', () => {
    const spec = [
      "test('espera con esperarEntradaTerminada(page) y mide con boundingBox el h1', async ({ page }) => {",
      `  ${NAVEGA}`,
      "  const otra = await page.locator('#contacto').evaluate((seccion) => seccion.offsetWidth)",
      '})',
      "test('llama a esperarEntradaTerminada(page) con emulateMedia({ reducedMotion: \"reduce\" })', async ({ page }) => {",
      `  ${NAVEGA}`,
      `  ${MIDE_EL_TITULAR}`,
      '})',
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('los comentarios no cuentan: ni uno que nombre el ayudante, ni uno que nombre la emulación, ni uno que nombre una medición', () => {
    expect(
      veredictoDe(NAVEGA, `// ${ESPERA}`, `/* ${EMULA_REDUCE} */`, MIDE_EL_TITULAR),
    ).toBe('incumple')
    expect(veredictoDe(NAVEGA, '// const caja = await page.locator("h1").boundingBox()', '/* getBoundingClientRect del h1 */')).toBe('exento')
  })

  it('un "test(" escrito dentro de una cadena o de un comentario no es un bloque', () => {
    const spec = ['// test("falso", () => {})', '/* test("otro", () => {}) */', 'const texto = \'test("tercero", () => {})\'', cuerpo(NAVEGA)].join('\n')

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(1)
  })

  it('una expresión regular con comillas y paréntesis ("/url\\("?([^")]+)"?\\)/g") no desbalancea la lectura', () => {
    const spec = [
      'const URL_DE_FONDO = /url\\("?([^")]+)"?\\)/g',
      'const hayJpg = /\\.jpg$/.test(nombre)',
      cuerpo(NAVEGA, MIDE_EL_TITULAR),
      'const ultima = /\'/.test(texto)',
      cuerpo(NAVEGA),
    ].join('\n')

    const informe = comprobarMedicionEstable(spec)

    expect(informe.bloques.map((bloque) => bloque.veredicto)).toEqual(['incumple', 'exento'])
  })

  it('una expresión regular con una "/" dentro de una clase de caracteres ("[/]") termina donde debe', () => {
    const spec = ['const separador = /[/]"/', cuerpo(NAVEGA, MIDE_EL_TITULAR)].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['incumple'])
  })

  it('una división NO es una expresión regular: lo que sigue a una "/" tras un identificador o un paréntesis sigue contando', () => {
    const spec = [
      "test('con divisiones', async ({ page }) => {",
      '  const centro = calcular(ancho / 2) + alto / 3',
      `  ${NAVEGA}`,
      '})',
      cuerpo(NAVEGA, MIDE_EL_TITULAR),
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('una "/" tras una cadena ("\'a\' / 2") es una división y no abre una expresión regular', () => {
    const spec = ["test('x', async ({ page }) => {", "  const mitad = Number('4') / Number('2') + (alto / 2)", '})', cuerpo(NAVEGA, MIDE_EL_TITULAR)].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('una hoja con finales de línea de Windows se lee igual', () => {
    const spec = specConUnBloque(cuerpo(NAVEGA, ESPERA, MIDE_EL_TITULAR)).replaceAll('\n', '\r\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['pasa'])
  })
})

describe('hero_reducido_con_animacion @s10: funciones locales del mismo fichero (un nivel)', () => {
  it('una función flecha con tipo de retorno se resuelve igual que una declarada', () => {
    const funciones = [
      'const cajaDe = async (locator: Locator): Promise<Caja> => {',
      '  return locator.evaluate((elemento) => elemento.getBoundingClientRect())',
      '}',
    ].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await cajaDe(page.locator('h1'))"), funciones))).toBe('incumple')
  })

  it('una función con un tipo de retorno que lleva llaves ("Promise<{ ancho: number }>") encuentra su cuerpo de verdad', () => {
    const funciones = [
      'async function medir(page: Page): Promise<{ ancho: number }> {',
      "  return page.locator('h1').evaluate((titular) => ({ ancho: titular.offsetWidth }))",
      '}',
    ].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, 'await medir(page)'), funciones))).toBe('incumple')
  })

  it('una función flecha de expresión (sin llaves) SÍ se resuelve: su cuerpo es la expresión (A1 de la revisión del 14/10/2026)', () => {
    const funciones = 'const cajaDe = (locator: Locator) => locator.boundingBox()'

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await cajaDe(page.locator('h1'))"), funciones))).toBe('incumple')
  })

  it('una función local que el test NO llama no cuenta, aunque mida o espere', () => {
    const funciones = ['async function sinUso(page: Page) {', '  await esperarEntradaTerminada(page)', "  return page.locator('h1').boundingBox()", '}'].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA), funciones))).toBe('exento')
    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, MIDE_EL_TITULAR), funciones))).toBe('incumple')
  })

  it('la llamada a la función local cuenta por su POSICIÓN en el test: si espera DESPUÉS de medir, incumple', () => {
    const funciones = CARGAR_PORTADA_CON_ESPERA

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(MIDE_EL_TITULAR, 'await cargarPortada(page)'), funciones))).toBe('incumple')
  })

  it('dentro de UNA función local el orden interno manda: medir y luego esperar incumple, esperar y luego medir pasa', () => {
    const midiendoAntes = ['async function cargar(page: Page) {', "  const caja = await page.locator('h1').boundingBox()", '  await esperarEntradaTerminada(page)', '  return caja', '}'].join('\n')
    const esperandoAntes = ['async function cargar(page: Page) {', '  await esperarEntradaTerminada(page)', "  return page.locator('h1').boundingBox()", '}'].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo('await cargar(page)'), midiendoAntes))).toBe('incumple')
    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo('await cargar(page)'), esperandoAntes))).toBe('pasa')
  })

  it('la resolución es de UN nivel: una función que llama a otra que mide no se expande', () => {
    const funciones = [
      "async function interior(page: Page) {",
      "  return page.locator('h1').boundingBox()",
      '}',
      'async function exterior(page: Page) {',
      '  return interior(page)',
      '}',
    ].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, 'await exterior(page)'), funciones))).toBe('exento')
  })

  it('un método con el mismo nombre ("objeto.cajaDe(") o un nombre que solo lo contiene ("micajaDe(") no es una llamada a la función local', () => {
    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await objeto.cajaDe(page.locator('h1'))"), CAJA_DE_UN_LOCALIZADOR))).toBe('exento')
    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await micajaDe(page.locator('h1'))"), CAJA_DE_UN_LOCALIZADOR))).toBe('exento')
  })

  it('una llamada con espacio antes del paréntesis ("cajaDe (…)") sigue siendo una llamada', () => {
    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await cajaDe (page.locator('h1'))"), CAJA_DE_UN_LOCALIZADOR))).toBe('incumple')
  })

  it('un nombre de función con "$" se llama y se resuelve igual', () => {
    const funciones = ['async function $caja(locator: Locator) {', '  return locator.boundingBox()', '}'].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await $caja(page.locator('h1'))"), funciones))).toBe('incumple')
  })

  it('una función declarada DENTRO de un bloque test(...) no es una función local: ya forma parte del bloque y cuenta donde se escribe', () => {
    const declaradaDespuesDelGoto = [
      "test('con una función interna', async ({ page }) => {",
      `  ${NAVEGA}`,
      '  async function esperar(p: Page) {',
      '    await esperarEntradaTerminada(p)',
      '  }',
      '  await esperar(page)',
      `  ${MIDE_EL_TITULAR}`,
      '})',
    ].join('\n')
    // A2 (d): con la declaración ANTES del "goto" la precedencia textual pone la espera antes de navegar, y el
    // "goto" posterior la invalida. Es la lectura estricta del contrato ("la espera precede textualmente").
    const declaradaAntesDelGoto = declaradaDespuesDelGoto
      .replace(`  ${NAVEGA}\n`, '')
      .replace('  await esperar(page)\n', `  ${NAVEGA}\n  await esperar(page)\n`)

    const informe = comprobarMedicionEstable(specConUnBloque(declaradaDespuesDelGoto))

    expect(informe.bloquesInspeccionados).toBe(1)
    expect(informe.bloques[0]?.veredicto).toBe('pasa')
    expect(veredictoDelUnicoBloque(specConUnBloque(declaradaAntesDelGoto))).toBe('incumple')
  })

  it('las funciones locales declaradas dentro de un "test.describe" (fuera de todo test) también se resuelven', () => {
    const spec = [
      CABECERA_DEL_SPEC,
      "test.describe('grupo', () => {",
      '  async function cajaDelTitular(page: Page) {',
      "    return page.locator('h1').boundingBox()",
      '  }',
      `  ${cuerpo(NAVEGA, 'await cajaDelTitular(page)')}`,
      '})',
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloques[0]?.veredicto).toBe('incumple')
  })

  it('un localizador del hero que vive en la función local (el "[data-hero-contenido]" de cargarPortada) pone el bloque en el ámbito del hero', () => {
    const funciones = [
      'async function cargarPortada(page: Page) {',
      "  await page.goto('/')",
      "  return page.locator('[data-hero-contenido]')",
      '}',
    ].join('\n')

    const bloque = cuerpo('const contenido = await cargarPortada(page)', 'const caja = await contenido.boundingBox()')

    expect(veredictoDelUnicoBloque(specConUnBloque(bloque, funciones))).toBe('incumple')
  })
})

describe('hero_reducido_con_animacion @s10: qué cuenta como medir (la lista cerrada del contrato)', () => {
  it.each([
    ['getBoundingClientRect', "await page.locator('h1').evaluate((e) => e.getBoundingClientRect())"],
    ['boundingBox', "await page.locator('h1').boundingBox()"],
    ['scrollWidth de un elemento', "await page.locator('h1').evaluate((e) => e.scrollWidth)"],
    ['scrollHeight', "await page.locator('h1').evaluate((e) => e.scrollHeight)"],
    ['clientHeight', "await page.locator('h1').evaluate((e) => e.clientHeight)"],
    ['offsetWidth', "await page.locator('h1').evaluate((e) => e.offsetWidth)"],
    ['offsetHeight', "await page.locator('h1').evaluate((e) => e.offsetHeight)"],
    ['getComputedStyle leyendo opacity', "await page.locator('h1').evaluate((e) => getComputedStyle(e).opacity)"],
    ['getComputedStyle leyendo transform', "await page.locator('h1').evaluate((e) => getComputedStyle(e).transform)"],
    ['getComputedStyle leyendo color', "await page.locator('h1').evaluate((e) => getComputedStyle(e).color)"],
    ['getComputedStyle leyendo la posición', "await page.locator('h1').evaluate((e) => getComputedStyle(e).position)"],
    ['getComputedStyle leyendo un borde (top)', "await page.locator('h1').evaluate((e) => getComputedStyle(e).top)"],
    ['getComputedStyle leyendo un borde (left)', "await page.locator('h1').evaluate((e) => getComputedStyle(e).left)"],
    ['getComputedStyle leyendo un borde (right)', "await page.locator('h1').evaluate((e) => getComputedStyle(e).right)"],
    ['getComputedStyle leyendo un borde (bottom)', "await page.locator('h1').evaluate((e) => getComputedStyle(e).bottom)"],
    ['getComputedStyle leyendo translate', "await page.locator('h1').evaluate((e) => getComputedStyle(e).translate)"],
    ['captura de un localizador (locator.screenshot)', "await page.locator('h1').screenshot()"],
    ['toHaveScreenshot sobre un localizador', "await expect(page.locator('h1')).toHaveScreenshot()"],
  ])('%s sobre el titular, sin esperar, incumple', (_nombre, medicion) => {
    expect(veredictoDe(NAVEGA, medicion)).toBe('incumple')
  })

  it.each([
    ['getComputedStyle leyendo font-size', "await page.locator('h1').evaluate((e) => getComputedStyle(e).fontSize)"],
    ['getComputedStyle leyendo letter-spacing', "await page.locator('h1').evaluate((e) => getComputedStyle(e).letterSpacing)"],
    ['getComputedStyle leyendo line-height', "await page.locator('h1').evaluate((e) => getComputedStyle(e).lineHeight)"],
    ['una lectura de document.documentElement.scrollWidth', 'await page.evaluate(() => document.documentElement.scrollWidth)'],
    ['una captura de un localizador que no es del hero', "await page.locator('#contacto').screenshot()"],
    ['AxeBuilder acotado con .include(', "await new AxeBuilder({ page }).include('#contacto').analyze()"],
    ['una lectura que NO está en la lista cerrada (clientWidth)', "await page.locator('h1').evaluate((e) => e.clientWidth)"],
  ])('%s, sin esperar, queda exento', (_nombre, lectura) => {
    expect(veredictoDe(NAVEGA, lectura)).toBe('exento')
  })

  it('una medición tipográfica junto a una de posición, opacidad o color SÍ obliga', () => {
    expect(
      veredictoDe(NAVEGA, "await page.locator('h1').evaluate((e) => [getComputedStyle(e).fontSize, getComputedStyle(e).opacity])"),
    ).toBe('incumple')
  })

  it('"scrollWidth" de un elemento obliga aunque el documento lleve otra lectura de "document.documentElement.scrollWidth"', () => {
    expect(
      veredictoDe(NAVEGA, 'await page.evaluate(() => document.documentElement.scrollWidth)', "await page.locator('h1').evaluate((e) => e.scrollWidth)"),
    ).toBe('incumple')
  })

  it('"AxeBuilder" sin ".include(" obliga a cualquier página, aunque no mencione el hero; con ".include(" en el bloque, no', () => {
    expect(veredictoDe(NAVEGA, 'await new AxeBuilder({ page }).analyze()')).toBe('incumple')
    expect(veredictoDe(NAVEGA, "await new AxeBuilder({ page }).include('#contacto').analyze()")).toBe('exento')
    expect(veredictoDe(NAVEGA, 'await new AxeBuilder ({ page }).analyze()')).toBe('incumple')
  })

  it('el ".include(" de una función local que construye el AxeBuilder lo acota, y su ausencia lo deja página entera', () => {
    const acotado = ['async function analizar(page: Page) {', "  return new AxeBuilder({ page }).include('#contacto').analyze()", '}'].join('\n')
    const entero = ['async function analizar(page: Page) {', '  return new AxeBuilder({ page }).analyze()', '}'].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, 'await analizar(page)'), acotado))).toBe('exento')
    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, 'await analizar(page)'), entero))).toBe('incumple')
  })

  it('una captura de la página entera ("page.screenshot(" o "expect(page).toHaveScreenshot(") obliga aunque no mencione el hero', () => {
    expect(veredictoDe(NAVEGA, 'await page.screenshot()')).toBe('incumple')
    expect(veredictoDe(NAVEGA, 'await expect(page).toHaveScreenshot()')).toBe('incumple')
    expect(veredictoDe(NAVEGA, 'await expect( page ).toHaveScreenshot ()')).toBe('incumple')
  })

  it.each([
    ['un atributo "[data-hero-"', "page.locator('[data-hero-contenido]')"],
    ['el selector "h1"', "page.locator('h1')"],
    ['un encabezado de nivel 1', "page.getByRole('heading', { level: 1 })"],
    ['un encabezado de nivel 1 escrito sin espacios', "page.getByRole('heading', {level:1})"],
    ['el texto «Reservar cita»', "page.getByRole('link', { name: 'Reservar cita' })"],
    ['"body *"', "page.locator('body *')"],
  ])('%s sitúa la medición en el ámbito del hero', (_nombre, localizador) => {
    expect(veredictoDe(NAVEGA, `await ${localizador}.first().boundingBox()`)).toBe('incumple')
  })

  it('lo que solo PARECE un localizador del hero no lo es ("#ah1b", "level: 10", "h10", "data-heroe")', () => {
    for (const impostor of ["page.locator('#ah1b')", "page.getByRole('heading', { level: 10 })", "page.locator('h10')", "page.locator('[data-heroe]')", "page.locator('body')"]) {
      expect(veredictoDe(NAVEGA, `await ${impostor}.boundingBox()`)).toBe('exento')
    }
  })

  it('un identificador que solo contiene el nombre de una medición ("miboundingBox", "getBoundingClientRectX") no mide', () => {
    expect(veredictoDe(NAVEGA, "await page.locator('h1').miboundingBox()", "await page.locator('h1').getBoundingClientRectX()")).toBe('exento')
  })
})

describe('hero_reducido_con_animacion @s10: las dos vías y la excepción', () => {
  it('(a) basta con esperar antes de la PRIMERA medición, aunque haya más después', () => {
    expect(veredictoDe(NAVEGA, ESPERA, MIDE_EL_TITULAR, "await page.locator('h1').boundingBox()")).toBe('pasa')
  })

  it('(a) esperar en la misma línea o con espacios antes del paréntesis cuenta; un método con ese nombre, o un nombre que lo contiene, no', () => {
    expect(veredictoDe(NAVEGA, 'await esperarEntradaTerminada (page)', MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe(NAVEGA, 'await objeto.esperarEntradaTerminada(page)', MIDE_EL_TITULAR)).toBe('incumple')
    expect(veredictoDe(NAVEGA, 'await miesperarEntradaTerminada(page)', MIDE_EL_TITULAR)).toBe('incumple')
    expect(veredictoDe(NAVEGA, 'await esperarEntradaTerminadaYa(page)', MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('(b) emular "reduce" cuenta con cualquier tipo de comillas y entre otras opciones', () => {
    expect(veredictoDe('await page.emulateMedia({ reducedMotion: "reduce" })', NAVEGA, MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe('await page.emulateMedia({ reducedMotion: `reduce` })', NAVEGA, MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe("await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })", NAVEGA, MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe("await page.emulateMedia({reducedMotion:'reduce'})", NAVEGA, MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe("await page.emulateMedia ({ reducedMotion : 'reduce' })", NAVEGA, MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('(b) emular "no-preference", o emular otra cosa, no es movimiento reducido', () => {
    expect(veredictoDe("await page.emulateMedia({ reducedMotion: 'no-preference' })", NAVEGA, MIDE_EL_TITULAR)).toBe('incumple')
    expect(veredictoDe("await page.emulateMedia({ colorScheme: 'dark' })", NAVEGA, MIDE_EL_TITULAR)).toBe('incumple')
    expect(veredictoDe("await page.emulateMedia({ colorScheme: 'reduce' })", NAVEGA, MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('(b) la emulación tiene que ser una llamada a "emulateMedia", no la palabra suelta', () => {
    expect(veredictoDe("const opciones = { reducedMotion: 'reduce' }", NAVEGA, MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('(b) sin ningún "goto" en el bloque, basta con emular antes de medir; emular después de medir no sirve', () => {
    expect(veredictoDe(EMULA_REDUCE, MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe(MIDE_EL_TITULAR, EMULA_REDUCE)).toBe('incumple')
  })

  it('(b) emular dentro de la función local que navega, antes de su "goto", vale; después de su "goto", no', () => {
    const emulaAntes = ['async function cargarPortada(page: Page) {', `  ${EMULA_REDUCE}`, `  ${NAVEGA}`, '}'].join('\n')
    const emulaDespues = ['async function cargarPortada(page: Page) {', `  ${NAVEGA}`, `  ${EMULA_REDUCE}`, '}'].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo('await cargarPortada(page)', MIDE_EL_TITULAR), emulaAntes))).toBe('pasa')
    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo('await cargarPortada(page)', MIDE_EL_TITULAR), emulaDespues))).toBe('incumple')
  })

  it('(b) con varios "goto" (un bucle de rutas) la emulación tiene que preceder al PRIMERO', () => {
    expect(veredictoDe(EMULA_REDUCE, 'for (const ruta of rutas) {', '  await page.goto(ruta)', '  await new AxeBuilder({ page }).analyze()', '}')).toBe('pasa')
    expect(veredictoDe('for (const ruta of rutas) {', '  await page.goto(ruta)', `  ${EMULA_REDUCE}`, '  await new AxeBuilder({ page }).analyze()', '}')).toBe('incumple')
  })

  it('(c) congelar el reloj con el ayudante "congelarRelojDeAnimaciones" y colocar las animaciones con ".cancel()" exime', () => {
    expect(
      veredictoDe('await congelarRelojDeAnimaciones(page)', NAVEGA, 'await page.evaluate(() => document.getAnimations().forEach((a) => a.cancel()))', MIDE_EL_TITULAR),
    ).toBe('exento')
  })

  it('(c) congelar DESPUÉS de navegar no exime: el reloj ya corría', () => {
    expect(
      veredictoDe(NAVEGA, "await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })", 'await page.evaluate(() => { animacion.currentTime = 0 })', MIDE_EL_TITULAR),
    ).toBe('incumple')
  })

  it('(c) colocar las animaciones DESPUÉS de medir no exime', () => {
    expect(
      veredictoDe("await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })", NAVEGA, MIDE_EL_TITULAR, 'await page.evaluate(() => { animacion.currentTime = 0 })'),
    ).toBe('incumple')
  })

  it('(c) una COMPARACIÓN con "currentTime" ("currentTime === 0") no es colocar las animaciones', () => {
    expect(
      veredictoDe("await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })", NAVEGA, 'await page.evaluate(() => animacion.currentTime === 0)', MIDE_EL_TITULAR),
    ).toBe('incumple')
  })

  it('(c) sin ningún "goto", congelar y colocar antes de medir exime', () => {
    expect(veredictoDe("await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })", 'await page.evaluate(() => { animacion.currentTime = 0 })', MIDE_EL_TITULAR)).toBe('exento')
  })

  it('(c) solo colocar, sin congelar el reloj, no exime', () => {
    expect(veredictoDe(NAVEGA, 'await page.evaluate(() => { animacion.currentTime = 0 })', MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('un bloque que mide el hero y cumple por la vía (a) es "pasa", no "exento", aunque además congele y coloque', () => {
    expect(
      veredictoDe(
        "await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })",
        NAVEGA,
        'await page.evaluate(() => { animacion.currentTime = 0 })',
        ESPERA,
        MIDE_EL_TITULAR,
      ),
    ).toBe('pasa')
  })
})

describe('hero_reducido_con_animacion @s10: casos límite de la lectura del texto', () => {
  const dosBloquesSegun = (antes: string): readonly Veredicto[] =>
    comprobarMedicionEstable([antes, cuerpo(NAVEGA), cuerpo(NAVEGA, MIDE_EL_TITULAR)].join('\n')).bloques.map((bloque) => bloque.veredicto)

  it('un "/*/" abre un comentario de bloque que NO se cierra con su propia barra: lo que va dentro no es un test', () => {
    expect(dosBloquesSegun('/*/ test("falso", () => {}) */')).toEqual(['exento', 'incumple'])
  })

  it('un comentario de bloque pegado a un paréntesis ("calcular(/* nota */ \'x\')") no desordena la lectura', () => {
    const spec = [
      "test('con un comentario en una llamada', async ({ page }) => {",
      "  const valor = calcular(/* nota */ 'x')",
      `  ${NAVEGA}`,
      '})',
      cuerpo(NAVEGA, MIDE_EL_TITULAR),
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('el titular con una comilla escapada se lee entero, y una cadena de comillas dobles con comillas escapadas no abre otra', () => {
    const spec = [
      "const dicho = \"dijo \\\"hola\\\" y test('falso', () => {})\"",
      "test('no es de \\'esos\\' y no', async ({ page }) => {",
      `  ${NAVEGA}`,
      '})',
      cuerpo(NAVEGA, MIDE_EL_TITULAR),
    ].join('\n')

    const informe = comprobarMedicionEstable(spec)

    expect(informe.bloques.map((bloque) => bloque.titulo)).toEqual(["no es de \\'esos\\' y no", 'bloque de prueba'])
    expect(informe.bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('una cadena de comillas dobles que contiene un "test(" no es un bloque', () => {
    expect(comprobarMedicionEstable(`const texto = "test('falso', () => {})"\n${cuerpo(NAVEGA)}`).bloquesInspeccionados).toBe(1)
  })

  it('una cadena sin cerrar enmascara el resto del texto: no hay nada que leer tras ella', () => {
    expect(comprobarMedicionEstable(`const roto = "sin cerrar\n${cuerpo(NAVEGA)}`).bloquesInspeccionados).toBe(0)
  })

  it('una expresión regular al PRINCIPIO del texto, tras "(" o tras "," abre una expresión regular y no una división', () => {
    expect(dosBloquesSegun('/"/g.exec(texto)')).toEqual(['exento', 'incumple'])
    expect(dosBloquesSegun('probar(/"/g)')).toEqual(['exento', 'incumple'])
    expect(dosBloquesSegun('probar(texto, /"/g)')).toEqual(['exento', 'incumple'])
  })

  it('una expresión regular con una barra escapada ("\\/") no termina en ella', () => {
    expect(dosBloquesSegun('const ruta = /\\/"/')).toEqual(['exento', 'incumple'])
  })

  it('una clase de caracteres que se cierra deja de proteger las barras siguientes', () => {
    const spec = [
      "test('regex con clase', async ({ page }) => {",
      '  expect(/[a]/.test(texto)).toBe(true)',
      `  ${NAVEGA}`,
      '})',
      cuerpo(NAVEGA, MIDE_EL_TITULAR),
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('una barra tras un escape ("/\\d/") cierra la expresión regular: lo que sigue en la línea se lee como código', () => {
    const spec = [
      "test('regex con escape', async ({ page }) => {",
      '  expect(/\\d/.test(texto)).toBe(true)',
      `  ${NAVEGA}`,
      '})',
      cuerpo(NAVEGA, MIDE_EL_TITULAR),
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('una "expresión regular" sin cerrar termina con la línea: lo que sigue se lee como código', () => {
    expect(dosBloquesSegun('probar(/ sin cerrar')).toEqual(['exento', 'incumple'])
  })

  it('tras una cadena una "/" es una división, no una expresión regular, aunque antes hubiera un paréntesis', () => {
    const spec = [
      "test('division tras una cadena', async ({ page }) => {",
      "  const m = calcular('4' / 2) + 1",
      `  ${NAVEGA}`,
      '})',
      cuerpo(NAVEGA, MIDE_EL_TITULAR),
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })

  it('un bloque cuya llamada no se cierra nunca llega hasta el final del texto, con todo lo que contiene', () => {
    const spec = ["test('sin cerrar', async ({ page }) => {", `  ${NAVEGA}`, `  ${MIDE_EL_TITULAR}`].join('\n')

    expect(comprobarMedicionEstable(spec).bloques).toEqual([{ titulo: 'sin cerrar', veredicto: 'incumple' }])
  })

  it('un "$test(" no es un bloque', () => {
    expect(comprobarMedicionEstable(`$test('falso', () => {})\n${cuerpo(NAVEGA)}`).bloquesInspeccionados).toBe(1)
  })

  it('espacios entre el paréntesis y el titular no se confunden con otro texto: el titular se lee igual', () => {
    const informe = comprobarMedicionEstable("test(   'con espacios', async ({ page }) => {\n  await page.goto('/')\n})")

    expect(informe.bloques).toEqual([{ titulo: 'con espacios', veredicto: 'exento' }])
  })

  it('un salto de línea entre el paréntesis y el titular tampoco', () => {
    const informe = comprobarMedicionEstable("test(\n  'en su línea',\n  async ({ page }) => {\n    await page.goto('/')\n  },\n)")

    expect(informe.bloques).toEqual([{ titulo: 'en su línea', veredicto: 'exento' }])
  })

  it('una función declarada justo tras el cierre de un test (sin separación) ya no está dentro de él: se resuelve', () => {
    const spec = [
      "test('a', async () => {})function cajaDe(locator: Locator) { return locator.boundingBox() }",
      cuerpo(NAVEGA, "await cajaDe(page.locator('h1'))"),
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)).toEqual(['exento', 'incumple'])
  })
})

describe('hero_reducido_con_animacion @s10: otras formas de escribir las funciones locales y su resolución', () => {
  it.each([
    ['con "let"', "let cajaDe = async (locator: Locator) => { return locator.boundingBox() }"],
    ['con un solo parámetro sin paréntesis', 'const cajaDe = async locator => { return locator.boundingBox() }'],
    ['con un tipo en la variable', 'const cajaDe: Medidor = async (locator: Locator) => { return locator.boundingBox() }'],
    ['sin "async"', 'const cajaDe = (locator: Locator) => { return locator.boundingBox() }'],
  ])('una función flecha %s se resuelve', (_nombre, funcion) => {
    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await cajaDe(page.locator('h1'))"), funcion))).toBe('incumple')
  })

  it('una flecha de expresión sin llaves NO toma el cuerpo de la función que viene después', () => {
    const funciones = [
      'const contar = (locator: Locator) => locator.count()',
      "async function otra(page: Page) { return page.locator('h1').boundingBox() }",
    ].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await contar(page.locator('h1'))"), funciones))).toBe('exento')
  })

  it('una función declarada dentro del test pero DESPUÉS de usarse cuenta donde se escribe: la precedencia es textual', () => {
    const bloque = [
      "test('declarada al final', async ({ page }) => {",
      `  ${NAVEGA}`,
      '  await esperar(page)',
      `  ${MIDE_EL_TITULAR}`,
      '  async function esperar(p: Page) {',
      '    await esperarEntradaTerminada(p)',
      '  }',
      '})',
    ].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(bloque))).toBe('incumple')
  })

  it('una palabra que solo CONTIENE "function" ("confunction cajaDe(") no declara una función local', () => {
    const funciones = ['confunction cajaDe(locator) {', '  return locator.boundingBox()', '}'].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await cajaDe(page.locator('h1'))"), funciones))).toBe('exento')
  })

  it('"function" y el nombre van separados: la llamada "functioncajaDe(" no declara "cajaDe"', () => {
    const funciones = ['functioncajaDe(1)', 'async function otra(page: Page) { return page.locator("h1").boundingBox() }'].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await cajaDe(page.locator('h1'))"), funciones))).toBe('exento')
  })

  it('el orden interno de una función local se conserva aunque su cuerpo sea más largo que la distancia hasta lo que viene después', () => {
    const funciones = [
      'async function cargarYMedir(page: Page) {',
      "  const relleno = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'",
      "  return page.locator('h1').boundingBox()",
      '}',
    ].join('\n')

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo('await cargarYMedir(page)', ESPERA), funciones))).toBe('incumple')
  })
})

describe('hero_reducido_con_animacion @s10: los detalles de lo que cuenta como medir y como esperar', () => {
  it('"goto" es una llamada con punto: "ayudante.segoto(" no cuenta como navegar, y "page.goto (" con espacio sí', () => {
    expect(veredictoDe("await ayudante.segoto('/')", EMULA_REDUCE, MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe("await page.goto ('/')", EMULA_REDUCE, MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('la emulación es una llamada con punto, con espacios dentro del paréntesis, y no una función suelta que se llame igual', () => {
    expect(veredictoDe("await page.emulateMedia( { reducedMotion: 'reduce' } )", NAVEGA, MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe("await emulateMedia({ reducedMotion: 'reduce' })", NAVEGA, MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('"currentTime" tiene que ser la propiedad entera: "ultimocurrentTime = 1" no coloca nada', () => {
    expect(
      veredictoDe("await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })", NAVEGA, 'const ultimocurrentTime = 1', MIDE_EL_TITULAR),
    ).toBe('incumple')
  })

  it('con el titular delante, leer document.documentElement.scrollWidth sigue sin ser medir, y ".scrollWidthTotal" no es "scrollWidth"', () => {
    expect(veredictoDe(NAVEGA, "await expect(page.locator('h1')).toBeVisible()", 'await page.evaluate(() => document.documentElement.scrollWidth)')).toBe('exento')
    expect(veredictoDe(NAVEGA, "await expect(page.locator('h1')).toBeVisible()", 'await page.evaluate(() => miFuncion().scrollWidthTotal)')).toBe('exento')
  })

  it('una palabra que solo contiene "top" o "color" ("topeEsperado", "colorines") no es leer posición ni color', () => {
    expect(
      veredictoDe(NAVEGA, "const topeEsperado = 48", "const tamano = await page.locator('h1').evaluate((e) => getComputedStyle(e).fontSize)"),
    ).toBe('exento')
    expect(
      veredictoDe(NAVEGA, "const colorines = 3", "const tamano = await page.locator('h1').evaluate((e) => getComputedStyle(e).fontSize)"),
    ).toBe('exento')
  })

  it('"getComputedStyle (" con un espacio antes del paréntesis es la misma lectura', () => {
    expect(veredictoDe(NAVEGA, "await page.locator('h1').evaluate((e) => getComputedStyle (e).opacity)")).toBe('incumple')
  })

  it('un nombre que contiene "include(" sin ser ".include(" no acota el AxeBuilder', () => {
    expect(veredictoDe(NAVEGA, 'await noinclude(page)', 'await new AxeBuilder({ page }).analyze()')).toBe('incumple')
  })

  it('"AxeBuilder" sin "new" también cuenta, y un nombre que lo contiene ("crearAxeBuilder(") no', () => {
    expect(veredictoDe(NAVEGA, 'await AxeBuilder({ page }).analyze()')).toBe('incumple')
    expect(veredictoDe(NAVEGA, 'await crearAxeBuilder({ page }).analyze()')).toBe('exento')
  })

  it('una captura de otra "page" ("subpage.screenshot(") no es una captura de la página', () => {
    expect(veredictoDe(NAVEGA, 'await subpage.screenshot()')).toBe('exento')
  })

  it('un selector que solo contiene "h1" dentro de otra palabra ("#ah1") no es el titular', () => {
    expect(veredictoDe(NAVEGA, "await page.locator('#ah1').boundingBox()")).toBe('exento')
  })
})

// ---------------------------------------------------------------------------
// LA REVISIÓN INDEPENDIENTE DEL 14/10/2026 (ola 4a). Cada bloque cita el hallazgo
// (A1…A9) que cierra. Las filas son specs SINTÉTICOS escritos con las formas que
// la comprobación dejaba pasar en silencio: la tabla firmada de 16 filas de arriba
// sigue entera y estas filas la AMPLÍAN, no la sustituyen.
// ---------------------------------------------------------------------------

const EMULA_SIN_PREFERENCIA = "await page.emulateMedia({ reducedMotion: 'no-preference' })"
const CONGELA_EL_RELOJ = "await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })"
const COLOCA_LAS_ANIMACIONES = 'await page.evaluate(() => { animacion.currentTime = 0 })'

function veredictosDe(spec: string): readonly Veredicto[] {
  return comprobarMedicionEstable(spec).bloques.map((bloque) => bloque.veredicto)
}

/** El veredicto de UN bloque `test(` con las funciones locales dadas declaradas fuera de él. */
function veredictoConFunciones(funciones: string, ...lineas: readonly string[]): Veredicto {
  return veredictoDelUnicoBloque(specConUnBloque(cuerpo(...lineas), funciones))
}

describe('hero_reducido_con_animacion @s10, A1 de la revisión: una función local que mide cuenta sea cual sea la forma en que se escribe y se usa', () => {
  const LLAMA_A_MEDIR = 'await medir(page)'

  it.each([
    ['una flecha de expresión', "const medir = (page: Page) => page.locator('h1').boundingBox()"],
    ['una flecha de expresión con "await"', "const medir = async (page: Page) => await page.locator('h1').boundingBox()"],
    [
      'una flecha de expresión que devuelve un objeto entre paréntesis',
      "const medir = async (page: Page) => ({ caja: await page.locator('h1').boundingBox() })",
    ],
    ['una flecha de expresión terminada en punto y coma', "const medir = (page: Page) => page.locator('h1').boundingBox();"],
    [
      'una flecha de expresión cuya cadena de llamadas sigue en las líneas de abajo',
      ['const medir = (page: Page) =>', '  page', "    .locator('h1')", '    .boundingBox()'].join('\n'),
    ],
    [
      'una flecha de expresión con un parámetro por defecto que llama a otra función',
      "const medir = (page: Page, escala = obtener(10, 20)) => page.locator('h1').boundingBox()",
    ],
    [
      'una flecha con parámetros desestructurados',
      "const medir = async ({ page }: { page: Page }) => { return page.locator('h1').boundingBox() }",
    ],
    [
      'una función con un tipo de retorno que es una función ("(): () => Promise<void>")',
      ['async function medir(page: Page): () => Promise<void> {', "  return () => page.locator('h1').boundingBox()", '}'].join('\n'),
    ],
    [
      'una función con parámetros desestructurados',
      ['async function medir({ page }: { page: Page }) {', "  return page.locator('h1').boundingBox()", '}'].join('\n'),
    ],
  ])('%s se resuelve: el bloque que la llama mide el titular, incumple sin esperar y pasa si espera antes', (_nombre, funcion) => {
    expect(veredictoConFunciones(funcion, NAVEGA, LLAMA_A_MEDIR)).toBe('incumple')
    expect(veredictoConFunciones(funcion, NAVEGA, ESPERA, LLAMA_A_MEDIR)).toBe('pasa')
  })

  it('una flecha de expresión termina donde acaba la expresión: ni el punto y coma ni la sentencia siguiente son suyos', () => {
    const conPuntoYComa = ['const contar = (locator: Locator) => locator.count();', "async function otra(page: Page) { return page.locator('h1').boundingBox() }"].join('\n')
    const seguidaDeUnaSentencia = ['const contar = (locator: Locator) => locator.count()', "const otra = (page: Page) => page.locator('h1').boundingBox()"].join('\n')

    expect(veredictoConFunciones(conPuntoYComa, NAVEGA, "await contar(page.locator('h1'))")).toBe('exento')
    expect(veredictoConFunciones(seguidaDeUnaSentencia, NAVEGA, "await contar(page.locator('h1'))")).toBe('exento')
  })

  it('una flecha de expresión que acaba en un operador sigue en la línea de abajo, y una que empieza con uno continúa la anterior', () => {
    const terminaEnOperador = ['const medir = (page: Page) => page.locator("h1") ||', '  page.locator("p").boundingBox()'].join('\n')
    const empiezaConOperador = ['const medir = (page: Page) => page.locator("p").count()', '  ?? page.locator("h1").boundingBox()'].join('\n')

    expect(veredictoConFunciones(terminaEnOperador, NAVEGA, LLAMA_A_MEDIR)).toBe('incumple')
    expect(veredictoConFunciones(empiezaConOperador, NAVEGA, LLAMA_A_MEDIR)).toBe('incumple')
  })

  it('una flecha de expresión dentro de una llamada acaba donde se cierra esa llamada', () => {
    const funciones = ["const contar = registrar((locator: Locator) => locator.count())", "const otra = (page: Page) => page.locator('h1').boundingBox()"].join('\n')

    expect(veredictoConFunciones(funciones, NAVEGA, "await contar(page.locator('h1'))")).toBe('exento')
  })

  it('una función pasada por referencia ("locator.evaluate(cajaDe)") cuenta como uso de esa función', () => {
    const funcion = ['function cajaDe(elemento: Element) {', '  return elemento.getBoundingClientRect()', '}'].join('\n')
    const referencia = "await page.locator('h1').evaluate(cajaDe)"

    expect(veredictoConFunciones(funcion, NAVEGA, referencia)).toBe('incumple')
    expect(veredictoConFunciones(funcion, NAVEGA, ESPERA, referencia)).toBe('pasa')
  })

  it('una referencia a una función con otro nombre que lo contiene ("micajaDe", "objeto.cajaDe") no es un uso', () => {
    const funcion = ['function cajaDe(elemento: Element) {', '  return elemento.getBoundingClientRect()', '}'].join('\n')

    expect(veredictoConFunciones(funcion, NAVEGA, "await page.locator('h1').evaluate(micajaDe)")).toBe('exento')
    expect(veredictoConFunciones(funcion, NAVEGA, "await page.locator('h1').evaluate(objeto.cajaDe)")).toBe('exento')
  })
})

interface FilaDeLaRevision {
  /** El hallazgo y la forma que se escapaba. */
  readonly fila: string
  readonly spec: string
  readonly veredicto: Veredicto
}

function filaDeLaRevision(fila: string, veredicto: Veredicto, lineas: readonly string[], funciones = ''): FilaDeLaRevision {
  return { fila, veredicto, spec: specConUnBloque(cuerpo(...lineas), funciones) }
}

const MEDIR_ALTOS = ['async function medirAltos(pagina: Page) {', "  return pagina.locator('h1').first().boundingBox()", '}'].join('\n')
const ABRIR_OTRA_PAGINA = 'const paginaSinFuente = await context.newPage()'
const EMULA_REDUCE_EN_LA_OTRA = "await paginaSinFuente.emulateMedia({ reducedMotion: 'reduce' })"

const FILAS_DE_LA_REVISION: readonly FilaDeLaRevision[] = [
  // A2 (a): la espera tiene que ejecutarse y su fallo tiene que llegar al test.
  filaDeLaRevision('A2a: la espera SIN "await" delante', 'incumple', [NAVEGA, 'esperarEntradaTerminada(page)', MIDE_EL_TITULAR]),
  filaDeLaRevision('A2a: la espera precedida de "void"', 'incumple', [NAVEGA, 'void esperarEntradaTerminada(page)', MIDE_EL_TITULAR]),
  filaDeLaRevision('A2a: la espera con ".catch(" que traga el fallo', 'incumple', [
    NAVEGA,
    'await esperarEntradaTerminada(page).catch(() => {})',
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A2a: la espera con ".then(" que no relanza el fallo', 'incumple', [
    NAVEGA,
    'await esperarEntradaTerminada(page)\n    .then(() => undefined)',
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A2a: la espera dentro de un "try" que traga el error', 'incumple', [
    NAVEGA,
    'try {',
    '  await esperarEntradaTerminada(page)',
    '} catch {',
    '  // sigue midiendo',
    '}',
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A2a: la espera tras "return" de una función local', 'pasa', ['await cargarYEsperar(page)', MIDE_EL_TITULAR], [
    'async function cargarYEsperar(page: Page) {',
    "  await page.goto('/')",
    '  return esperarEntradaTerminada(page)',
    '}',
  ].join('\n')),
  filaDeLaRevision('A2a: la espera con "await" y opciones, tras un "try" ya cerrado', 'pasa', [
    NAVEGA,
    'try {',
    '  await page.waitForTimeout(1)',
    '} finally {',
    '  await page.waitForTimeout(1)',
    '}',
    'await esperarEntradaTerminada(page, { topeMs: 5000 })',
    MIDE_EL_TITULAR,
  ]),
  // A2 (b): la espera y la emulación se atan a la PÁGINA que navega y mide.
  filaDeLaRevision('A2b: la emulación de "reduce" es sobre OTRA página y se mide "page"', 'incumple', [
    "await otra.emulateMedia({ reducedMotion: 'reduce' })",
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A2b: la espera es sobre OTRA página y se mide "page"', 'incumple', [NAVEGA, 'await esperarEntradaTerminada(otra)', MIDE_EL_TITULAR]),
  filaDeLaRevision('A2b: dos páginas (context.newPage()), la segunda sin emular "reduce", medida por una función local', 'incumple', [
    EMULA_REDUCE,
    NAVEGA,
    'const conFuente = await medirAltos(page)',
    ABRIR_OTRA_PAGINA,
    "await paginaSinFuente.goto('/')",
    'const sinFuente = await medirAltos(paginaSinFuente)',
  ], MEDIR_ALTOS),
  filaDeLaRevision('A2b: dos páginas (context.newPage()), cada una con su emulación antes de su "goto"', 'pasa', [
    EMULA_REDUCE,
    NAVEGA,
    'const conFuente = await medirAltos(page)',
    ABRIR_OTRA_PAGINA,
    EMULA_REDUCE_EN_LA_OTRA,
    "await paginaSinFuente.goto('/')",
    'const sinFuente = await medirAltos(paginaSinFuente)',
  ], MEDIR_ALTOS),
  filaDeLaRevision('A2b: la primera página sin emular y la segunda emulada: la que no se emuló incumple', 'incumple', [
    NAVEGA,
    'const conFuente = await medirAltos(page)',
    ABRIR_OTRA_PAGINA,
    EMULA_REDUCE_EN_LA_OTRA,
    "await paginaSinFuente.goto('/')",
    'const sinFuente = await medirAltos(paginaSinFuente)',
  ], MEDIR_ALTOS),
  filaDeLaRevision('A2b: una función local espera en la página que recibe, con otro nombre de parámetro', 'pasa', [NAVEGA, 'await esperar(page)', MIDE_EL_TITULAR], [
    'async function esperar(pagina: Page) {',
    '  await esperarEntradaTerminada(pagina)',
    '}',
  ].join('\n')),
  filaDeLaRevision('A2b: una función local espera en OTRA página que la que se mide', 'incumple', [NAVEGA, 'await esperar(otra)', MIDE_EL_TITULAR], [
    'async function esperar(pagina: Page) {',
    '  await esperarEntradaTerminada(pagina)',
    '}',
  ].join('\n')),
  filaDeLaRevision('A2b: la función local que navega y emula recibe la página con otro nombre', 'pasa', ['await cargar(page)', MIDE_EL_TITULAR], [
    'async function cargar(pagina: Page) {',
    "  await pagina.emulateMedia({ reducedMotion: 'reduce' })",
    "  await pagina.goto('/')",
    '}',
  ].join('\n')),
  filaDeLaRevision('A2b: una medición a través de un localizador guardado en una variable se ata a la página que navega', 'incumple', [
    NAVEGA,
    "const titular = page.locator('h1')",
    'const caja = await titular.boundingBox()',
  ]),
  // A2 (c): la ÚLTIMA emulación antes de navegar manda.
  filaDeLaRevision('A2c: "reduce" y después "no-preference" antes del "goto"', 'incumple', [EMULA_REDUCE, EMULA_SIN_PREFERENCIA, NAVEGA, MIDE_EL_TITULAR]),
  filaDeLaRevision('A2c: "no-preference" y después "reduce" antes del "goto"', 'pasa', [EMULA_SIN_PREFERENCIA, EMULA_REDUCE, NAVEGA, MIDE_EL_TITULAR]),
  filaDeLaRevision('A2c: "reduce" y después "reducedMotion: null" (la restablece) antes del "goto"', 'incumple', [
    EMULA_REDUCE,
    'await page.emulateMedia({ reducedMotion: null })',
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A2c: "reduce" y después otra emulación que no toca el movimiento ("colorScheme")', 'pasa', [
    EMULA_REDUCE,
    "await page.emulateMedia({ colorScheme: 'dark' })",
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A2c: "reduce", "goto", "no-preference" y "reload": la recarga se mide sin movimiento reducido', 'incumple', [
    EMULA_REDUCE,
    NAVEGA,
    EMULA_SIN_PREFERENCIA,
    'await page.reload()',
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A2c: la emulación de "reduce" sin "await" delante', 'incumple', [
    "page.emulateMedia({ reducedMotion: 'reduce' })",
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  // A2 (d): una navegación posterior invalida la espera.
  filaDeLaRevision('A2d: otro "goto" tras la espera y antes de medir', 'incumple', [NAVEGA, ESPERA, "await page.goto('/otra')", MIDE_EL_TITULAR]),
  filaDeLaRevision('A2d: un "reload" tras la espera y antes de medir', 'incumple', [NAVEGA, ESPERA, 'await page.reload()', MIDE_EL_TITULAR]),
  filaDeLaRevision('A2d: un "goBack" tras la espera y antes de medir', 'incumple', [NAVEGA, ESPERA, 'await page.goBack()', MIDE_EL_TITULAR]),
  filaDeLaRevision('A2d: un "goForward" tras la espera y antes de medir', 'incumple', [NAVEGA, ESPERA, 'await page.goForward()', MIDE_EL_TITULAR]),
  filaDeLaRevision('A2d: la espera ANTES del "goto" no espera nada de lo que se mide', 'incumple', [ESPERA, NAVEGA, MIDE_EL_TITULAR]),
  filaDeLaRevision('A2d: dos "goto" y la espera tras el último', 'pasa', [NAVEGA, "await page.goto('/otra')", ESPERA, MIDE_EL_TITULAR]),
  filaDeLaRevision('A2d: la navegación de OTRA página tras la espera no la invalida', 'pasa', [
    NAVEGA,
    ESPERA,
    "await otra.goto('/otra')",
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A2d: "reduce" antes del "goto" y un "reload" después: la emulación sigue en vigor', 'pasa', [
    EMULA_REDUCE,
    NAVEGA,
    'await page.reload()',
    MIDE_EL_TITULAR,
  ]),
  // A2 (e): el ".include(" se evalúa POR LLAMADA, no por bloque.
  filaDeLaRevision('A2e: un AxeBuilder con ".include(" y otro sin él en el mismo bloque', 'incumple', [
    NAVEGA,
    "await new AxeBuilder({ page }).include('#contacto').analyze()",
    'await new AxeBuilder({ page }).analyze()',
  ]),
  filaDeLaRevision('A2e: un AxeBuilder sin ".include(" y otro con él, en ese orden', 'incumple', [
    NAVEGA,
    'await new AxeBuilder({ page }).analyze()',
    "await new AxeBuilder({ page }).include('#contacto').analyze()",
  ]),
  filaDeLaRevision('A2e: dos AxeBuilder, los dos con ".include("', 'exento', [
    NAVEGA,
    "await new AxeBuilder({ page }).include('#contacto').analyze()",
    "await new AxeBuilder({ page }).include('#faq').analyze()",
  ]),
  filaDeLaRevision('A2e: el ".include(" va en una línea de la cadena de llamadas', 'exento', [
    NAVEGA,
    'await new AxeBuilder({ page })',
    "  .withTags(['wcag2a'])",
    "  .include('#contacto')",
    '  .analyze()',
  ]),
  filaDeLaRevision('A2e: la cadena de llamadas repartida en líneas, sin ".include("', 'incumple', [
    NAVEGA,
    'const analisis = await new AxeBuilder({ page })',
    "  .withTags(['wcag2a'])",
    '  .analyze()',
    'expect(analisis.violations).toEqual([])',
  ]),
  filaDeLaRevision('A2e: el AxeBuilder va como argumento de otra llamada y el ".include(" es suyo', 'exento', [
    NAVEGA,
    "expect((await new AxeBuilder({ page }).include('#contacto').analyze()).violations).toEqual([])",
  ]),
  filaDeLaRevision('A2e: un AxeBuilder sobre "{ page: pagina }" se mide en esa página, que no esperó', 'incumple', [
    NAVEGA,
    ESPERA,
    ABRIR_OTRA_PAGINA,
    "await paginaSinFuente.goto('/')",
    'await new AxeBuilder({ page: paginaSinFuente }).analyze()',
  ]),
  // A3: las cadenas y las plantillas no son código.
  filaDeLaRevision('A3: el nombre de la espera citado en el mensaje de un expect', 'incumple', [
    NAVEGA,
    "expect(1, 'sin esperarEntradaTerminada(page) se mediría').toBe(1)",
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: el nombre de la espera citado en una plantilla', 'incumple', [
    NAVEGA,
    'expect(1, `sin esperarEntradaTerminada(page) se mediría`).toBe(1)',
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: la espera ENTERA, con su "await", escrita dentro de una cadena', 'incumple', [
    NAVEGA,
    "const nota = 'await esperarEntradaTerminada(page)'",
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: la emulación de "reduce" escrita dentro de una cadena', 'incumple', [
    "const nota = \"await page.emulateMedia({ reducedMotion: 'reduce' })\"",
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: un "page.goto(" dentro de una cadena no es la primera navegación', 'pasa', [
    "expect(1, 'tras page.goto(x)').toBe(1)",
    EMULA_REDUCE,
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: congelar y colocar citados en una cadena no eximen', 'incumple', [
    'const nota = "congelarRelojDeAnimaciones(page) y animacion.currentTime = 0"',
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: "Animation.setPlaybackRate" como SEGUNDO argumento de "send(" no congela el reloj', 'incumple', [
    "await sesion.send('Otro.metodo', 'Animation.setPlaybackRate')",
    NAVEGA,
    COLOCA_LAS_ANIMACIONES,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: "Animation.setPlaybackRate" citado en un "console.log" no congela el reloj', 'incumple', [
    "console.log('Animation.setPlaybackRate')",
    NAVEGA,
    COLOCA_LAS_ANIMACIONES,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: congelar con "send(" y una plantilla como primer argumento exime', 'exento', [
    'await sesion.send(`Animation.setPlaybackRate`, { playbackRate: 0 })',
    NAVEGA,
    COLOCA_LAS_ANIMACIONES,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: congelar con "send (" y comillas dobles, con espacios, exime', 'exento', [
    'await sesion.send ( "Animation.setPlaybackRate", { playbackRate: 0 })',
    NAVEGA,
    COLOCA_LAS_ANIMACIONES,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: "reducedMotion" con el literal "reduce" entre comillas dobles y con espacios', 'pasa', [
    'await page.emulateMedia({ reducedMotion : "reduce" })',
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: "reducedMotion" con una variable no es un literal "reduce"', 'incumple', [
    'await page.emulateMedia({ reducedMotion: movimiento })',
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: una cadena con la forma de la emulación dentro de OTRA opción de "emulateMedia" no es la emulación', 'incumple', [
    "await page.emulateMedia({ colorScheme: \"reducedMotion: 'reduce'\" })",
    NAVEGA,
    MIDE_EL_TITULAR,
  ]),
  filaDeLaRevision('A3: un texto de expresión regular con "Reservar cita" sitúa la medición en el hero', 'incumple', [
    NAVEGA,
    "await page.getByRole('link', { name: /Reservar cita/ }).boundingBox()",
  ]),
]

describe('hero_reducido_con_animacion @s10, A2 y A3 de la revisión: la espera y la emulación se atan a la página, al "await" y al código (no a las cadenas)', () => {
  it('la tabla de la revisión tiene filas de los hallazgos A2 y A3 y ninguna se llama igual que otra', () => {
    const nombres = FILAS_DE_LA_REVISION.map(({ fila }) => fila)

    expect(FILAS_DE_LA_REVISION.length).toBeGreaterThan(0)
    expect(new Set(nombres).size).toBe(nombres.length)
  })

  it.each(FILAS_DE_LA_REVISION)('$veredicto: $fila', ({ spec, veredicto }) => {
    expect(veredictoDelUnicoBloque(spec)).toBe(veredicto)
  })
})

describe('hero_reducido_con_animacion @s10, A4 de la revisión: una función declarada dentro de un test es de ese test', () => {
  const cargarSinEspera = ['const cargar = async (p: Page) => {', "  await p.goto('/')", '}'].join('\n')
  const cargarConEspera = ['const cargar = async (p: Page) => {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
  const bloqueConLaFuncion = (titulo: string, funcion: string): string =>
    [`test('${titulo}', async ({ page }) => {`, ...funcion.split('\n').map((linea) => `  ${linea}`), '  await cargar(page)', `  ${MIDE_EL_TITULAR}`, '})'].join('\n')

  it('un test posterior que declara una flecha con el mismo nombre no cambia el veredicto de otro anterior', () => {
    const spec = [CABECERA_DEL_SPEC, bloqueConLaFuncion('sin espera', cargarSinEspera), bloqueConLaFuncion('con espera', cargarConEspera)].join('\n')

    expect(veredictosDe(spec)).toEqual(['incumple', 'pasa'])
  })

  it('y al revés: el orden de los tests no cambia el veredicto de ninguno', () => {
    const spec = [CABECERA_DEL_SPEC, bloqueConLaFuncion('con espera', cargarConEspera), bloqueConLaFuncion('sin espera', cargarSinEspera)].join('\n')

    expect(veredictosDe(spec)).toEqual(['pasa', 'incumple'])
  })

  it('una función declarada con "function" dentro de un test tampoco se ve desde otro test', () => {
    const conEspera = ['async function cargar(p: Page) {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const declarante = bloqueConLaFuncion('declara y llama', conEspera)
    const llamante = ["test('solo llama', async ({ page }) => {", '  await cargar(page)', `  ${MIDE_EL_TITULAR}`, '})'].join('\n')

    expect(veredictosDe([CABECERA_DEL_SPEC, declarante, llamante].join('\n'))).toEqual(['pasa', 'incumple'])
  })

  it('una flecha declarada dentro del test cuenta donde se escribe: declarada antes de medir con la espera dentro, vale', () => {
    const bloque = [
      "test('flecha propia', async ({ page }) => {",
      `  ${NAVEGA}`,
      '  const esperar = async (p: Page) => {',
      '    await esperarEntradaTerminada(p)',
      '  }',
      '  await esperar(page)',
      `  ${MIDE_EL_TITULAR}`,
      '})',
    ].join('\n')

    expect(veredictosDe(specConUnBloque(bloque))).toEqual(['pasa'])
  })

  it('una función local del fichero NO se resuelve en un test que declara otra con el mismo nombre', () => {
    const delFichero = ['async function cargar(p: Page) {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const spec = specConUnBloque(bloqueConLaFuncion('con la suya', cargarSinEspera), delFichero)

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  describe('dos funciones del fichero con el mismo nombre (dos "describe"): el bloque ve la declarada más cerca ANTES de él', () => {
    const sinEspera = ['async function cargar(p: Page) {', "  await p.goto('/')", '}'].join('\n')
    const conEspera = ['async function cargar(p: Page) {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const flechaConEspera = ['const cargar = async (p: Page) => {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const bloque = (titulo: string): string => ["test('" + titulo + "', async ({ page }) => {", '  await cargar(page)', `  ${MIDE_EL_TITULAR}`, '})'].join('\n')
    const spec = (...partes: readonly string[]): string => [CABECERA_DEL_SPEC, ...partes].join('\n')

    it('cada bloque ve la suya, en un orden y en el otro', () => {
      expect(veredictosDe(spec(sinEspera, bloque('uno'), conEspera, bloque('dos')))).toEqual(['incumple', 'pasa'])
      expect(veredictosDe(spec(conEspera, bloque('uno'), sinEspera, bloque('dos')))).toEqual(['pasa', 'incumple'])
    })

    it('si todas van detrás del bloque, ve la primera', () => {
      expect(veredictosDe(spec(bloque('uno'), sinEspera, conEspera))).toEqual(['incumple'])
      expect(veredictosDe(spec(bloque('uno'), conEspera, sinEspera))).toEqual(['pasa'])
    })

    it('una flecha y una función con el mismo nombre se ordenan por dónde se declaran, no por cómo', () => {
      expect(veredictosDe(spec(sinEspera, flechaConEspera, bloque('uno')))).toEqual(['pasa'])
      expect(veredictosDe(spec(flechaConEspera, sinEspera, bloque('uno')))).toEqual(['incumple'])
    })
  })

  it('una función local del fichero se resuelve en el test que no declara ninguna con ese nombre', () => {
    const delFichero = ['async function cargar(p: Page) {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const llamante = ["test('usa la del fichero', async ({ page }) => {", '  await cargar(page)', `  ${MIDE_EL_TITULAR}`, '})'].join('\n')

    expect(veredictosDe(specConUnBloque(llamante, delFichero))).toEqual(['pasa'])
  })
})

describe('hero_reducido_con_animacion @s10, A5 de la revisión: test.only, test.fail, test.fixme, test.skip y los alias también son bloques', () => {
  const bloqueQueMideSinEsperar = (llamada: string): string =>
    [`${llamada}('mide sin esperar', async ({ page }) => {`, `  ${NAVEGA}`, `  ${MIDE_EL_TITULAR}`, '})'].join('\n')
  const otroTestCorrecto = cuerpo(NAVEGA, ESPERA, MIDE_EL_TITULAR).replace("'bloque de prueba'", "'correcto'")

  it.each(['test.only', 'test.fail', 'test.fixme', 'test.skip', 'test .only', 'test.only ', 'test . skip'])(
    '"%s(" con título y cuerpo es un bloque que se inspecciona aunque el fichero tenga otro test() correcto',
    (llamada) => {
      const spec = [CABECERA_DEL_SPEC, otroTestCorrecto, bloqueQueMideSinEsperar(llamada)].join('\n')

      expect(comprobarMedicionEstable(spec).bloques).toEqual([
        { titulo: 'correcto', veredicto: 'pasa' },
        { titulo: 'mide sin esperar', veredicto: 'incumple' },
      ])
    },
  )

  it('un "test.only(" hace que el fichero NO pase, aunque su bloque esté en regla, y se nombra', () => {
    const informe = comprobarMedicionEstable(specConUnBloque(cuerpo(NAVEGA, ESPERA, MIDE_EL_TITULAR).replace('test(', 'test.only(')))

    expect(informe.bloques.map((bloque) => bloque.veredicto)).toEqual(['pasa'])
    expect(informe.bloquesConOnly).toEqual(['bloque de prueba'])
    expect(informe.pasa).toBe(false)
  })

  it('sin ningún "test.only(" la lista de bloques con "only" está vacía y el fichero pasa', () => {
    const informe = comprobarMedicionEstable(specConUnBloque(cuerpo(NAVEGA, ESPERA, MIDE_EL_TITULAR)))

    expect(informe.bloquesConOnly).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it.each(['fail', 'fixme', 'skip'])('un "test.%s(" CONDICIONAL (sin función de cuerpo) no es un bloque', (modificador) => {
    const spec = [
      CABECERA_DEL_SPEC,
      "test('con una condición', async ({ page, browserName }) => {",
      `  test.${modificador}(browserName === 'firefox', 'no aplica')`,
      `  ${NAVEGA}`,
      '})',
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(1)
  })

  it('un "test.skip(" con una función flecha o con "function" como cuerpo SÍ es un bloque', () => {
    const spec = [
      CABECERA_DEL_SPEC,
      "test.skip('con flecha', async ({ page }) => {})",
      "test.fixme('con function', async function ({ page }) {})",
    ].join('\n')

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(2)
  })

  it('"test.describe.only(", "test.step(" y "test.use(" no son bloques', () => {
    const spec = [
      CABECERA_DEL_SPEC,
      "test.describe.only('grupo', () => {",
      `  ${cuerpo(NAVEGA).replace("'bloque de prueba'", "'uno'")}`,
      '})',
      "test('con un paso', async ({ page }) => {",
      "  await test.step('paso', async () => {",
      `    ${NAVEGA}`,
      '  })',
      '})',
    ].join('\n')

    const informe = comprobarMedicionEstable(spec)

    expect(informe.bloques.map((bloque) => bloque.titulo)).toEqual(['uno', 'con un paso'])
    expect(informe.bloquesConOnly).toEqual([])
  })

  it('un alias del test ("const t = test") se lee como el propio test, también con ".only"', () => {
    const spec = [
      CABECERA_DEL_SPEC,
      'const t = test',
      otroTestCorrecto,
      bloqueQueMideSinEsperar('t'),
      bloqueQueMideSinEsperar('t.only').replace('mide sin esperar', 'solo este'),
    ].join('\n')

    const informe = comprobarMedicionEstable(spec)

    expect(informe.bloques).toEqual([
      { titulo: 'correcto', veredicto: 'pasa' },
      { titulo: 'mide sin esperar', veredicto: 'incumple' },
      { titulo: 'solo este', veredicto: 'incumple' },
    ])
    expect(informe.bloquesConOnly).toEqual(['solo este'])
  })

  it.each([
    ['con "let" y punto y coma', 'let t = test;'],
    ['con "var" y un tipo', 'var t: typeof test = test'],
    ['con "const" y espacios de más', 'const   t   =   test   '],
    ['extendido con fixtures ("test.extend(")', "const t = test.extend<{ ayuda: string }>({ ayuda: 'x' })"],
  ])('un alias %s también declara bloques', (_nombre, declaracion) => {
    const spec = [CABECERA_DEL_SPEC, declaracion, bloqueQueMideSinEsperar('t')].join('\n')

    expect(comprobarMedicionEstable(spec).bloques).toEqual([{ titulo: 'mide sin esperar', veredicto: 'incumple' }])
  })

  it('una variable que se llama como el test pero vale otra cosa ("const t = test.describe", "const t = otro") no es un alias', () => {
    const spec = [CABECERA_DEL_SPEC, 'const t = otro', 'const u = test.describe', bloqueQueMideSinEsperar('t'), bloqueQueMideSinEsperar('u')].join('\n')

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(0)
  })

  it('un alias "$t" con signo de dólar se escapa en la búsqueda: no se confunde con otro nombre', () => {
    const spec = [CABECERA_DEL_SPEC, 'const $t = test', bloqueQueMideSinEsperar('$t'), bloqueQueMideSinEsperar('xt')].join('\n')

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(1)
  })
})

describe('hero_reducido_con_animacion @s10, A6 de la revisión: cada patrón se lee con cualquier espaciado y las lecturas de borde no inventan bloques', () => {
  const COLOCA = 'await page.evaluate(() => document.getAnimations().forEach((animacion) => { %COLOCA% }))'
  const eximido = (colocar: string): Veredicto => veredictoDe(CONGELA_EL_RELOJ, NAVEGA, COLOCA.replace('%COLOCA%', colocar), MIDE_EL_TITULAR)

  it.each([
    ['"currentTime" sin espacios alrededor del "="', 'animacion.currentTime=0'],
    ['"currentTime" con varios espacios alrededor del "="', 'animacion.currentTime   =   0'],
    ['".cancel" con un espacio antes del paréntesis', 'animacion.cancel ()'],
    ['".cancel" con varios espacios antes del paréntesis', 'animacion.cancel   ()'],
  ])('colocar las animaciones con %s exime', (_nombre, colocar) => {
    expect(eximido(colocar)).toBe('exento')
  })

  it.each([
    ['".screenshot (" con un espacio', "await page.locator('h1').screenshot ()"],
    ['".screenshot  (" con dos espacios', "await page.locator('h1').screenshot  ()"],
    ['"toHaveScreenshot (" con un espacio', "await expect(page.locator('h1')).toHaveScreenshot ()"],
    ['"toHaveScreenshot  (" con dos espacios', "await expect(page.locator('h1')).toHaveScreenshot  ()"],
    ['"level : 1" con espacios antes de los dos puntos', "await page.getByRole('heading', { level : 1 }).boundingBox()"],
    ['"level  :  1" con varios espacios', "await page.getByRole('heading', { level  :  1 }).boundingBox()"],
  ])('medir con %s sitúa la medición en el hero y obliga', (_nombre, medicion) => {
    expect(veredictoDe(NAVEGA, medicion)).toBe('incumple')
  })

  it.each([
    ['"page.screenshot (" con un espacio', 'await page.screenshot ()'],
    ['"page.screenshot  (" con dos espacios', 'await page.screenshot  ()'],
    ['"expect (page)" con un espacio', 'await expect (page).toHaveScreenshot()'],
    ['"expect(  page  )" con espacios dentro', 'await expect(  page  ).toHaveScreenshot()'],
    ['") .toHaveScreenshot" con un espacio', 'await expect(page) .toHaveScreenshot()'],
    ['")  .toHaveScreenshot" con dos espacios', 'await expect(page)  .toHaveScreenshot()'],
    ['") .toHaveScreenshot" con un salto de línea', 'await expect(page)\n    .toHaveScreenshot()'],
  ])('capturar la página con %s obliga aunque no mencione el hero', (_nombre, captura) => {
    expect(veredictoDe(NAVEGA, captura)).toBe('incumple')
  })

  it.each([
    ['"function  f(" con dos espacios', 'function  cajaDe(locator: Locator) { return locator.boundingBox() }'],
    ['"function f (" con un espacio antes del paréntesis', 'function cajaDe (locator: Locator) { return locator.boundingBox() }'],
    ['"function f   (" con varios espacios antes del paréntesis', 'function cajaDe   (locator: Locator) { return locator.boundingBox() }'],
    ['"const  f  =" con espacios de más', 'const  cajaDe  =  (locator: Locator)  =>  { return locator.boundingBox() }'],
    ['"const f=async(" sin espacios', 'const cajaDe=async(locator: Locator)=>{ return locator.boundingBox() }'],
    ['"const f = async  (" con dos espacios tras async', 'const cajaDe = async  (locator: Locator) => { return locator.boundingBox() }'],
    ['"let f =  async  x =>" con un parámetro sin paréntesis', 'let cajaDe =  async  locator => { return locator.boundingBox() }'],
    ['"const f : T = " con un tipo', 'const cajaDe : Medidor = async (locator: Locator) : Promise<Caja> => { return locator.boundingBox() }'],
  ])('una función local escrita con %s se resuelve', (_nombre, funcion) => {
    expect(veredictoConFunciones(funcion, NAVEGA, "await cajaDe(page.locator('h1'))")).toBe('incumple')
  })

  it('un comentario de línea al FINAL del texto, sin salto de línea, no inventa bloques', () => {
    const spec = `${specConUnBloque(cuerpo(NAVEGA, MIDE_EL_TITULAR))}// test('falso', async () => {})`

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(1)
  })

  it('un comentario de bloque sin cerrar al FINAL del texto no inventa bloques', () => {
    const spec = `${specConUnBloque(cuerpo(NAVEGA, MIDE_EL_TITULAR))}/* test('falso', async () => {})`

    expect(comprobarMedicionEstable(spec).bloquesInspeccionados).toBe(1)
  })

  it('un comentario de línea en una línea con CRLF acaba en el salto de línea y no se come la línea siguiente', () => {
    const spec = [CABECERA_DEL_SPEC, '// comentario', cuerpo(NAVEGA, MIDE_EL_TITULAR)].join('\r\n')

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  it('una función con la espera, declarada dentro de un test, NO se ve desde OTRO test que la llama', () => {
    const declarante = [
      "test('declara', async ({ page }) => {",
      '  async function cargar(p: Page) {',
      "    await p.goto('/')",
      '    await esperarEntradaTerminada(p)',
      '  }',
      '  await cargar(page)',
      `  ${MIDE_EL_TITULAR}`,
      '})',
    ].join('\n')
    const llamante = ["test('llama', async ({ page }) => {", '  await cargar(page)', `  ${MIDE_EL_TITULAR}`, '})'].join('\n')

    expect(veredictosDe([CABECERA_DEL_SPEC, declarante, llamante].join('\n'))).toEqual(['pasa', 'incumple'])
  })

  it('una función declarada entre dos tests (fuera de todos) se ve desde los dos', () => {
    const entreLosDos = ['async function cargar(p: Page) {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const uno = ["test('uno', async ({ page }) => {", '  await cargar(page)', `  ${MIDE_EL_TITULAR}`, '})'].join('\n')
    const dos = uno.replace("'uno'", "'dos'")

    expect(veredictosDe([CABECERA_DEL_SPEC, uno, entreLosDos, dos].join('\n'))).toEqual(['pasa', 'pasa'])
  })

  it('una flecha con parámetros desestructurados y un tipo con llaves resuelve su cuerpo', () => {
    const funcion = ['const medir = async ({ page }: { page: Page }) => {', "  return page.locator('h1').boundingBox()", '}'].join('\n')

    expect(veredictoConFunciones(funcion, NAVEGA, 'await medir({ page })')).toBe('incumple')
  })

  it('una función con un parámetro por defecto que lleva paréntesis resuelve su cuerpo', () => {
    const funcion = ['async function medir(page: Page, escala = obtener(1)) {', "  return page.locator('h1').boundingBox()", '}'].join('\n')

    expect(veredictoConFunciones(funcion, NAVEGA, 'await medir(page)')).toBe('incumple')
  })
})

describe('hero_reducido_con_animacion @s10, A8 de la revisión: la comprobación lee los mismos ficheros que ejecuta Playwright', () => {
  it.each([
    'tests/e2e/accesibilidad.spec.ts',
    'tests/e2e/hero/portada.spec.ts',
    'tests/e2e/a/b/c/profunda.spec.ts',
    'tests/e2e/otra.test.ts',
    'tests/e2e/modulo.spec.mts',
    'tests/e2e/comun.spec.cts',
    'tests/e2e/script.spec.js',
    'tests/e2e/script.test.mjs',
    'tests/e2e/script.spec.cjs',
    'tests/e2e/pagina.spec.tsx',
    'tests/e2e/pagina.test.jsx',
    'accesibilidad.spec.ts',
    'tests\\e2e\\windows.spec.ts',
  ])('"%s" es un fichero de test que Playwright ejecuta y por tanto se lee', (ruta) => {
    expect(esFicheroDeTestDePlaywright(ruta)).toBe(true)
  })

  it.each([
    'tests/e2e/entrada-del-hero.ts',
    'tests/e2e/rutas.ts',
    'tests/e2e/utilidades.ts',
    'tests/e2e/spec.ts',
    'tests/e2e/test.ts',
    'tests/e2e/accesibilidad.spec.ts.bak',
    'tests/e2e/accesibilidad.spec.md',
    'tests/e2e/accesibilidad.spec.json',
    'tests/e2e/accesibilidad.specs.ts',
    'tests/e2e/accesibilidad.mspec.ts',
    'tests/e2e/accesibilidad-spec.ts',
    'tests/e2e/accesibilidad.spec.d.ts',
    'tests/e2e/accesibilidad.spec.xts',
    'tests/e2e/accesibilidad.spec.tss',
    'tests/e2e/accesibilidad.spec.ctsx.map',
  ])('"%s" no es un fichero de test de Playwright y no se lee', (ruta) => {
    expect(esFicheroDeTestDePlaywright(ruta)).toBe(false)
  })
})

describe('hero_reducido_con_animacion @s10, A6 y A7 de la revisión: la lectura del texto, sin recorridos por índices, conserva cada comportamiento', () => {
  it('un selector XPath ("//h1") es una cadena y no un comentario: el titular que nombra sitúa la medición en el hero', () => {
    expect(veredictoDe(NAVEGA, "await page.locator('//h1').boundingBox()")).toBe('incumple')
  })

  it('un comentario de bloque se cierra en SU "*/": el código que hay entre dos comentarios de bloque se lee', () => {
    const spec = ['/* uno */', cuerpo(NAVEGA, MIDE_EL_TITULAR), '/* dos */'].join('\n')

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  it('un comentario de bloque de varias líneas se enmascara entero, con lo que lleva dentro', () => {
    const spec = ['/*', ' * test("falso", async () => {', ' *   await page.locator("h1").boundingBox()', ' * })', ' */', cuerpo(NAVEGA)].join('\n')

    expect(comprobarMedicionEstable(spec).bloques).toEqual([{ titulo: 'bloque de prueba', veredicto: 'exento' }])
  })

  it('una plantilla de varias líneas con comillas dentro se lee entera y no deja ver lo que cita', () => {
    const plantilla = ['const nota = `primera línea con una \' y un "', "esperarEntradaTerminada(page) en la segunda `"].join('\n')
    const spec = [plantilla, cuerpo(NAVEGA, MIDE_EL_TITULAR)].join('\n')

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  it('una cadena que acaba en una barra invertida escapada (`\\\\\'`) se cierra donde debe y no se come lo que sigue', () => {
    const spec = ["const ruta = 'C:\\\\dir\\\\'", cuerpo(NAVEGA, MIDE_EL_TITULAR)].join('\n')

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  it('una expresión regular tras cada carácter que la admite ("(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";") no desordena la lectura', () => {
    const regex = "/'\"`/"
    const previos = ['probar(', 'probar(a, ', 'x = ', '{ a: ', '[', '!', 'a &', 'a |', 'a ? ', '{ ', '} ', 'a; ']

    for (const previo of previos) {
      const spec = [`${previo}${regex}`, cuerpo(NAVEGA, MIDE_EL_TITULAR)].join('\n')

      expect(veredictosDe(spec), `tras «${previo}»`).toEqual(['incumple'])
    }
  })

  it('una expresión regular tras un salto de línea y sangría (con la línea anterior acabada en "=") se reconoce', () => {
    const spec = ['const patron =', "    /'\"`/", cuerpo(NAVEGA, MIDE_EL_TITULAR)].join('\n')

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  it('una flecha de expresión entre paréntesis y en varias líneas se lee entera', () => {
    const funciones = ['const medir = (page: Page) => (', "  page.locator('h1').boundingBox()", ')'].join('\n')

    expect(veredictoConFunciones(funciones, NAVEGA, 'await medir(page)')).toBe('incumple')
  })

  it('una flecha de expresión cuya primera palabra es un evento (una navegación) lo cuenta como suyo', () => {
    const funciones = "const recargar = (pagina: Page) => pagina.goto('/otra')"

    expect(veredictoConFunciones(funciones, ESPERA, 'await recargar(page)', MIDE_EL_TITULAR)).toBe('incumple')
  })
})

/** Una función local que espera en la página que recibe como parámetro `pagina`, tras los demás parámetros dados. */
function funcionQueEsperaEn(parametros: string): string {
  return [`async function esperarEn(${parametros}) {`, '  await esperarEntradaTerminada(pagina)', '}'].join('\n')
}

describe('hero_reducido_con_animacion @s10, A2 de la revisión: los parámetros de una función local se corresponden con los argumentos de la llamada', () => {
  it.each([
    ['un array con comas', 'esperarEn([1, 2], page)', 'primero: number[], pagina: Page'],
    ['un objeto con comas', 'esperarEn({ a: 1, b: 2 }, page)', 'primero: object, pagina: Page'],
    ['una llamada con comas', 'esperarEn(sumar(1, 2), page)', 'primero: number, pagina: Page'],
    ['una cadena con comas', "esperarEn('a, b', page)", 'primero: string, pagina: Page'],
    ['espacios alrededor de los argumentos', 'esperarEn( 1 ,  page )', 'primero: number, pagina: Page'],
    ['un parámetro con valor por defecto', 'esperarEn(1, page)', 'primero = 1, pagina: Page'],
    ['un parámetro opcional', 'esperarEn(1, page)', 'primero?: number, pagina: Page'],
    ['un parámetro con $ en el nombre', 'esperarEn(1, page)', '$primero: number, pagina: Page'],
  ])('con %s antes del argumento de la página, la espera se ata a esa página', (_nombre, llamada, parametros) => {
    expect(veredictoConFunciones(funcionQueEsperaEn(parametros), NAVEGA, `await ${llamada}`, MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('un argumento que no es un identificador ("{ page }") no corresponde a ninguna página: la espera no cuenta', () => {
    expect(veredictoConFunciones(funcionQueEsperaEn('pagina: Page'), NAVEGA, 'await esperarEn({ page })', MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('un argumento con otro identificador por delante ("(await abrir(page))") se ata al primero', () => {
    expect(veredictoConFunciones(funcionQueEsperaEn('pagina: Page'), NAVEGA, 'await esperarEn(page.mainFrame().page())', MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('un parámetro de una flecha sin paréntesis ("async pagina =>") y uno con "$" se corresponden con su argumento', () => {
    const sinParentesis = ['const esperarEn = async pagina => {', '  await esperarEntradaTerminada(pagina)', '}'].join('\n')
    const conDolar = ['const esperarEn = async ($pagina: Page) => {', '  await esperarEntradaTerminada($pagina)', '}'].join('\n')

    expect(veredictoConFunciones(sinParentesis, NAVEGA, 'await esperarEn(page)', MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoConFunciones(conDolar, NAVEGA, 'await esperarEn(page)', MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('una página con "$" en el nombre se ata igual: no se confunde con otra', () => {
    const lineas = ["await $pagina.emulateMedia({ reducedMotion: 'reduce' })", "await $pagina.goto('/')", "await $pagina.locator('h1').boundingBox()"]

    expect(veredictoDe(...lineas)).toBe('pasa')
    expect(veredictoDe("await pagina.emulateMedia({ reducedMotion: 'reduce' })", "await $pagina.goto('/')", "await $pagina.locator('h1').boundingBox()")).toBe('incumple')
  })

  it('una llamada con MENOS argumentos que parámetros no toma los argumentos de lo que viene después', () => {
    const lineas = [NAVEGA, 'await esperarEn(1)', 'registrar(otra, page)', MIDE_EL_TITULAR]

    expect(veredictoConFunciones(funcionQueEsperaEn('primero: number, pagina: Page'), ...lineas)).toBe('incumple')
  })

  it('una llamada SIN argumentos deja a la función con sus propios nombres: un parámetro "page" sigue siendo "page"', () => {
    const funcion = ['async function esperar(page: Page) {', '  await esperarEntradaTerminada(page)', '}'].join('\n')

    expect(veredictoConFunciones(funcion, NAVEGA, 'await esperar()', MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('un argumento que es un objeto ("{ otra }") no es la página "otra": la espera de la función no se ata a ella', () => {
    const funcion = ['async function esperar(p: Page) {', '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const lineas = ["await otra.goto('/')", 'await esperar({ otra })', "await otra.locator('h1').boundingBox()"]

    expect(veredictoConFunciones(funcion, ...lineas)).toBe('incumple')
  })

  it('un parámetro desestructurado ("{ page }") no se corresponde con el argumento: la función conserva el nombre "page"', () => {
    const funcion = ['async function esperar({ page }: Fixtures) {', '  await esperarEntradaTerminada(page)', '}'].join('\n')

    expect(veredictoConFunciones(funcion, NAVEGA, 'await esperar(fixtures)', MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('una función pasada por referencia ("ejecutar(esperarPortada)") conserva sus nombres: su parámetro "page" sigue siendo "page"', () => {
    const funcion = ['async function esperarPortada(page: Page) {', '  await esperarEntradaTerminada(page)', '}'].join('\n')

    expect(veredictoConFunciones(funcion, NAVEGA, 'await ejecutar(esperarPortada)', MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('una función pasada por referencia se sitúa con la página que el bloque nombra a su altura, no con la que nombra después', () => {
    const funcion = ['function cajaDe(elemento: Element) {', '  return elemento.getBoundingClientRect()', '}'].join('\n')
    const lineas = [NAVEGA, ESPERA, "await page.locator('h1').evaluate(cajaDe)", "await otra.goto('/')"]

    expect(veredictoConFunciones(funcion, ...lineas)).toBe('pasa')
  })

  it('con dos páginas por parámetro cada medición se ata a SU página', () => {
    const funcion = [
      'async function comparar(a: Page, b: Page) {',
      "  await a.locator('h1').boundingBox()",
      "  await b.locator('h1').boundingBox()",
      '}',
    ].join('\n')
    const lineas = [NAVEGA, "await otra.emulateMedia({ reducedMotion: 'reduce' })", "await otra.goto('/')", 'await comparar(page, otra)']

    expect(veredictoConFunciones(funcion, ...lineas)).toBe('incumple')
  })

  it('una función que abre y mide su propia página se lee entera: la emulación y la medición son de la página que ella abre', () => {
    const funcion = [
      'async function medirEnOtra(context: BrowserContext) {',
      '  const otra = await context.newPage()',
      "  await otra.emulateMedia({ reducedMotion: 'reduce' })",
      "  await otra.goto('/')",
      "  return otra.locator('h1').boundingBox()",
      '}',
    ].join('\n')

    expect(veredictoConFunciones(funcion, 'await medirEnOtra(context)')).toBe('pasa')
    expect(veredictoConFunciones(funcion.replace("  await otra.emulateMedia({ reducedMotion: 'reduce' })\n", ''), 'await medirEnOtra(context)')).toBe('incumple')
  })

  it('una función sin parámetros que usa la "page" del fichero se ata a "page", aunque el bloque nombre otra página justo antes de llamarla', () => {
    const funcion = ['async function medirPortada() {', "  return page.locator('h1').boundingBox()", '}'].join('\n')
    const lineas = [NAVEGA, ESPERA, "await otra.goto('/')", 'await medirPortada()']

    expect(veredictoConFunciones(funcion, ...lineas)).toBe('pasa')
  })

  it('una función sin ninguna mención de página mide la página que el bloque nombró más cerca antes de llamarla', () => {
    const funcion = ['async function medirElTitular() {', "  return document.querySelector('h1').getBoundingClientRect()", '}'].join('\n')
    const lineas = [NAVEGA, ESPERA, "await otra.goto('/')", 'await medirElTitular()']

    expect(veredictoConFunciones(funcion, ...lineas)).toBe('incumple')
  })

  it('un cierre de paréntesis de MÁS (sin apertura) acaba la flecha de expresión en la que está', () => {
    const funciones = "const contar = (locator: Locator) => locator.count()) + page.locator('h1').boundingBox()"

    expect(veredictoConFunciones(funciones, NAVEGA, "await contar(page.locator('h1'))")).toBe('exento')
  })
})

describe('hero_reducido_con_animacion @s10, A6 de la revisión: dónde acaba una expresión y cómo se juntan las líneas', () => {
  const llamadaAContar = "await contar(page.locator('h1'))"

  it('una flecha de expresión que contiene otra flecha en su primera línea acaba igualmente donde acaba la línea', () => {
    const funciones = [
      'const contar = (locator: Locator) => locator.evaluate((elemento) => elemento.textContent)',
      "const medir = (page: Page) => page.locator('h1').boundingBox()",
    ].join('\n')

    expect(veredictoConFunciones(funciones, NAVEGA, llamadaAContar)).toBe('exento')
  })

  it('una flecha de expresión acaba en su ";" aunque la sentencia siguiente siga en la misma línea', () => {
    const funciones = "const contar = (locator: Locator) => locator.count(); const medir = (page: Page) => page.locator('h1').boundingBox()"

    expect(veredictoConFunciones(funciones, NAVEGA, llamadaAContar)).toBe('exento')
  })

  it('una flecha de expresión con la cabeza entre paréntesis y la cadena de llamadas detrás se lee entera', () => {
    const funciones = "const medir = (page: Page) => (page.locator('h1')).boundingBox()"

    expect(veredictoConFunciones(funciones, NAVEGA, 'await medir(page)')).toBe('incumple')
  })

  it('un operador al final de una línea con fin de línea de Windows (CRLF) sigue en la línea de abajo', () => {
    const funciones = ['const medir = (page: Page) => page.locator("h1") ||', '  page.locator("p").boundingBox()'].join('\r\n')

    expect(veredictoConFunciones(funciones, NAVEGA, 'await medir(page)')).toBe('incumple')
  })

  it.each([
    ['"="', 'const medir = (page: Page) => resultado ='],
    ['"+"', 'const medir = (page: Page) => 1 +'],
    ['"-"', 'const medir = (page: Page) => 1 -'],
    ['"*"', 'const medir = (page: Page) => 2 *'],
    ['"/"', 'const medir = (page: Page) => 4 /'],
    ['"%"', 'const medir = (page: Page) => 4 %'],
    ['"&&"', 'const medir = (page: Page) => hay &&'],
    ['"||"', 'const medir = (page: Page) => hay ||'],
    ['"?"', 'const medir = (page: Page) => hay ?'],
    ['":"', 'const medir = (page: Page) => hay ? 1 :'],
    ['","', 'const medir = (page: Page) => hay,'],
    ['"."', 'const medir = (page: Page) => page.'],
    ['"=>"', 'const medir = (page: Page) => (p: Page) =>'],
  ])('una línea que acaba en %s sigue en la línea de abajo', (_nombre, cabeza) => {
    const funciones = [cabeza, "  page.locator('h1').boundingBox()"].join('\n')

    expect(veredictoConFunciones(funciones, NAVEGA, 'await medir(page)')).toBe('incumple')
  })

  it.each([
    ['"."', '  .boundingBox()'],
    ['"?"', "  ?? page.locator('h1').boundingBox()"],
    ['":"', "  : page.locator('h1').boundingBox()"],
    ['"&"', "  && page.locator('h1').boundingBox()"],
    ['"|"', "  || page.locator('h1').boundingBox()"],
    ['"+"', "  + page.locator('h1').boundingBox()"],
    ['"-"', "  - page.locator('h1').boundingBox()"],
    ['"*"', "  * page.locator('h1').boundingBox()"],
    ['"%"', "  % page.locator('h1').boundingBox()"],
  ])('una línea que empieza por %s continúa la anterior', (_nombre, siguiente) => {
    const funciones = ["const medir = (page: Page) => page.locator('h1')", siguiente].join('\n')

    expect(veredictoConFunciones(funciones, NAVEGA, 'await medir(page)')).toBe('incumple')
  })

  it('una línea que acaba en un identificador, un número o un cierre NO sigue en la línea de abajo', () => {
    for (const final of ['resultado', '42', 'lista[0]', 'funcion()', 'objeto!']) {
      const funciones = [`const contar = (page: Page) => ${final}`, "const medir = (page: Page) => page.locator('h1').boundingBox()"].join('\n')

      expect(veredictoConFunciones(funciones, NAVEGA, 'await contar(page)'), `tras «${final}»`).toBe('exento')
    }
  })

  it('una flecha de expresión escrita al final del texto, sin salto de línea, llega hasta el final', () => {
    const spec = `${specConUnBloque(cuerpo(NAVEGA, 'await medir(page)'))}const medir = (page: Page) => page.locator('h1').boundingBox()`

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  it('una flecha de expresión con "=>" y un salto de línea antes del cuerpo, sin salto al final del texto, se lee', () => {
    const spec = `${specConUnBloque(cuerpo(NAVEGA, 'await medir(page)'))}const medir = (page: Page) =>\n  page.locator('h1').boundingBox()`

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  it('un ".include(" de lo que sigue a la cadena del AxeBuilder, tras su cierre, no la acota', () => {
    const lineas = [NAVEGA, 'expect((await new AxeBuilder({ page }).analyze()).violations).toEqual(lista.include(1))']

    expect(veredictoDe(...lineas)).toBe('incumple')
  })

  it('una flecha sin nada tras su "=>", al final del texto, no mete en el ámbito del bloque que la llama el texto de los demás', () => {
    const sinElHero = ["test('sin hero', async ({ page }) => {", `  ${NAVEGA}`, '  await medir(page)', "  await page.locator('#contacto').boundingBox()", '})'].join('\n')
    const conElHero = cuerpo(NAVEGA, MIDE_EL_TITULAR).replace("'bloque de prueba'", "'con hero'")
    const spec = [CABECERA_DEL_SPEC, sinElHero, conElHero, 'const medir = (page: Page) =>'].join('\n')

    expect(veredictosDe(spec)).toEqual(['exento', 'incumple'])
  })

  it('una función declarada sin cuerpo ("function medir(page: Page): void" al final) no tiene nada que medir', () => {
    const spec = `${specConUnBloque(cuerpo(NAVEGA, 'await medir(page)'))}function medir(page: Page): void`

    expect(veredictosDe(spec)).toEqual(['exento'])
  })
})

describe('hero_reducido_con_animacion @s10, A6 de la revisión: las coincidencias de cada patrón con cualquier espaciado', () => {
  it.each([
    ['un espacio antes del punto', "await page .goto('/otra')"],
    ['un espacio tras el punto', "await page. goto('/otra')"],
    ['un salto de línea antes del punto (cadena de llamadas)', "await page\n    .goto('/otra')"],
    ['un espacio antes del paréntesis', "await page.goto ('/otra')"],
    ['"reload" con un espacio antes del paréntesis', 'await page.reload ()'],
  ])('una navegación con %s invalida la espera anterior', (_nombre, navegacion) => {
    expect(veredictoDe(NAVEGA, ESPERA, navegacion, MIDE_EL_TITULAR)).toBe('incumple')
  })

  it.each([
    ['dos espacios tras "await"', "await  page.emulateMedia({ reducedMotion: 'reduce' })"],
    ['un salto de línea tras "await"', "await\n    page.emulateMedia({ reducedMotion: 'reduce' })"],
    ['un espacio antes del punto', "await page .emulateMedia({ reducedMotion: 'reduce' })"],
    ['un espacio tras el punto', "await page. emulateMedia({ reducedMotion: 'reduce' })"],
    ['un salto de línea antes del punto', "await page\n    .emulateMedia({ reducedMotion: 'reduce' })"],
    ['"return" en vez de "await"', "return page.emulateMedia({ reducedMotion: 'reduce' })"],
  ])('una emulación con %s cuenta', (_nombre, emulacion) => {
    expect(veredictoDe(emulacion, NAVEGA, MIDE_EL_TITULAR)).toBe('pasa')
  })

  it.each([
    ['dos espacios tras "await"', 'await  esperarEntradaTerminada(page)'],
    ['un salto de línea tras "await"', 'await\n    esperarEntradaTerminada(page)'],
    ['"return" en vez de "await"', 'return esperarEntradaTerminada(page)'],
  ])('una espera con %s cuenta', (_nombre, espera) => {
    expect(veredictoDe(NAVEGA, espera, MIDE_EL_TITULAR)).toBe('pasa')
  })

  it.each([
    ['un espacio antes del paréntesis de "send"', "await sesion.send ('Animation.setPlaybackRate', { playbackRate: 0 })"],
    ['un espacio tras el punto de "send"', "await sesion. send('Animation.setPlaybackRate', { playbackRate: 0 })"],
    ['un salto de línea antes del punto de "send"', "await sesion\n    .send('Animation.setPlaybackRate', { playbackRate: 0 })"],
    ['el ayudante con un espacio antes del paréntesis', 'await congelarRelojDeAnimaciones (page)'],
  ])('congelar el reloj con %s exime', (_nombre, congelar) => {
    expect(veredictoDe(congelar, NAVEGA, COLOCA_LAS_ANIMACIONES, MIDE_EL_TITULAR)).toBe('exento')
  })

  it.each([
    ['un espacio antes del paréntesis', "await new AxeBuilder({ page }).include ('#contacto').analyze()"],
    ['un espacio tras el punto', "await new AxeBuilder({ page }). include('#contacto').analyze()"],
    ['un salto de línea tras el punto', "await new AxeBuilder({ page }).\n    include('#contacto').analyze()"],
  ])('un ".include(" con %s acota el AxeBuilder', (_nombre, analisis) => {
    expect(veredictoDe(NAVEGA, analisis)).toBe('exento')
  })

  it.each([
    ['un espacio antes del punto', 'await esperarEntradaTerminada(page) .catch(() => {})'],
    ['un espacio tras el punto', 'await esperarEntradaTerminada(page). catch(() => {})'],
    ['un espacio antes del paréntesis de "catch"', 'await esperarEntradaTerminada(page).catch (() => {})'],
    ['un espacio antes del paréntesis de "then"', 'await esperarEntradaTerminada(page).then (() => 1)'],
  ])('una espera con %s y "catch" o "then" detrás se traga', (_nombre, espera) => {
    expect(veredictoDe(NAVEGA, espera, MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('un ".then(" o un ".catch(" de OTRA llamada, más adelante en el fichero, no traga la espera', () => {
    expect(veredictoDe(NAVEGA, ESPERA, MIDE_EL_TITULAR, 'await otra.then(() => 1)', 'await uno.catch(() => 2)')).toBe('pasa')
  })

  it.each([
    ['sin espacio antes de la llave', 'try{'],
    ['con dos espacios antes de la llave', 'try  {'],
    ['con un salto de línea antes de la llave', 'try\n{'],
  ])('una espera dentro de un "try" escrito %s se traga', (_nombre, intento) => {
    expect(veredictoDe(NAVEGA, intento, ESPERA, '} catch {}', MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('una espera ANTES de un "try" y otra DESPUÉS de uno, ya cerrado, no están dentro de él', () => {
    const intento = ['try {', '  await page.waitForTimeout(1)', '} catch {', '}']

    expect(veredictoDe(NAVEGA, ESPERA, ...intento, MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoDe(NAVEGA, ...intento, ESPERA, MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('un ".try(" o un "retry(" no son un "try"', () => {
    expect(veredictoDe(NAVEGA, 'await retry({', `  ${ESPERA}`, '})', MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('un "const  f =" con espacios de más en el bloque declara su propio nombre: oculta el de la función del fichero', () => {
    const delFichero = ['async function cargar(p: Page) {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const lineas = ['const   cargar = async (p: Page) => {', "  await p.goto('/')", '}', 'await cargar(page)', MIDE_EL_TITULAR]

    expect(veredictoConFunciones(delFichero, ...lineas)).toBe('incumple')
  })

  it('una función declarada en el bloque y que nadie usa no aporta nada: ni su espera, aunque su parámetro se llame "page"', () => {
    const conOtroNombre = [NAVEGA, 'async function sinUso(p: Page) {', '  await esperarEntradaTerminada(p)', '}', MIDE_EL_TITULAR]
    const conPage = [NAVEGA, 'async function sinUso(page: Page) {', '  await esperarEntradaTerminada(page)', '}', MIDE_EL_TITULAR]
    const conPageYUsada = [...conPage.slice(0, -1), 'await sinUso(page)', MIDE_EL_TITULAR]

    expect(veredictoDe(...conOtroNombre)).toBe('incumple')
    expect(veredictoDe(...conPage)).toBe('incumple')
    expect(veredictoDe(...conPageYUsada)).toBe('pasa')
  })

  it('una función declarada en el bloque y solo pasada por referencia SÍ se usa', () => {
    const lineas = [NAVEGA, 'async function esperar(page: Page) {', '  await esperarEntradaTerminada(page)', '}', 'await ejecutar(esperar)', MIDE_EL_TITULAR]

    expect(veredictoDe(...lineas)).toBe('pasa')
  })

  it('con dos funciones declaradas en el bloque, cada una se traduce con SU primera llamada', () => {
    const lineas = [
      NAVEGA,
      'async function abrir(x: Page) {',
      "  await x.goto('/otra')",
      '}',
      'async function esperar(p: Page) {',
      '  await esperarEntradaTerminada(p)',
      '}',
      'await abrir(otra)',
      'await esperar(page)',
      MIDE_EL_TITULAR,
    ]

    expect(veredictoDe(...lineas)).toBe('pasa')
  })

  it('una medición dentro de una función declarada en el bloque se ata a SU página, no a la que el bloque nombra antes', () => {
    const lineas = [
      NAVEGA,
      ESPERA,
      "await otra.goto('/')",
      'async function medirEn(p: Page) {',
      "  return p.locator('h1').boundingBox()",
      '}',
      'await medirEn(page)',
    ]

    expect(veredictoDe(...lineas)).toBe('pasa')
  })

  it('una medición sin ninguna página nombrada antes se ata a "page"', () => {
    expect(veredictoDe(NAVEGA, ESPERA, "await contenedor.locator('h1').boundingBox()")).toBe('pasa')
  })

  it('una medición se ata a la página nombrada ANTES, no a la que se nombra después', () => {
    expect(veredictoDe(NAVEGA, ESPERA, MIDE_EL_TITULAR, "await otra.goto('/')")).toBe('pasa')
  })

  it('una emulación sin "reducedMotion" no se confunde con la que viene después, más abajo en el fichero', () => {
    const lineas = ["await page.emulateMedia({ colorScheme: 'dark' })", NAVEGA, MIDE_EL_TITULAR, EMULA_REDUCE]

    expect(veredictoDe(...lineas)).toBe('incumple')
  })

  it('una captura de la página entera se ata a "page", no a la última página que el bloque nombra', () => {
    const lineas = [
      "await otra.emulateMedia({ reducedMotion: 'reduce' })",
      "await otra.goto('/')",
      NAVEGA,
      'await page.screenshot()',
    ]

    expect(veredictoDe(...lineas)).toBe('incumple')
    expect(veredictoDe(...lineas.slice(0, 3), 'await expect(page).toHaveScreenshot()')).toBe('incumple')
  })

  it('un AxeBuilder sin "page" en sus opciones mide la página que el bloque nombra más cerca antes', () => {
    const lineas = [NAVEGA, ESPERA, "await otra.goto('/')", 'await new AxeBuilder({ ...opciones }).analyze()']

    expect(veredictoDe(...lineas)).toBe('incumple')
    expect(veredictoDe(NAVEGA, ESPERA, 'await new AxeBuilder({ page }).analyze()')).toBe('pasa')
    expect(veredictoDe(NAVEGA, ESPERA, "await otra.goto('/')", 'await new AxeBuilder({ page }).analyze()')).toBe('pasa')
    expect(veredictoDe(NAVEGA, ESPERA, "await otra.goto('/')", 'await new AxeBuilder({ page: page }).analyze()')).toBe('pasa')
  })

  it.each([
    ['con espacios alrededor de los dos puntos', 'await new AxeBuilder({ page : otra }).analyze()'],
    ['sin espacios', 'await new AxeBuilder({page:otra}).analyze()'],
  ])('un AxeBuilder con "{ page: otra }" %s mide la página "otra"', (_nombre, analisis) => {
    expect(veredictoDe(NAVEGA, ESPERA, "await otra.goto('/')", analisis)).toBe('incumple')
  })

  it('un AxeBuilder con una opción que solo CONTIENE "page" ("{ subpage }") no nombra ninguna página', () => {
    expect(veredictoDe(NAVEGA, ESPERA, "await otra.goto('/')", 'await new AxeBuilder({ subpage }).analyze()')).toBe('incumple')
    expect(veredictoDe(NAVEGA, ESPERA, 'await new AxeBuilder({ subpage }).analyze()')).toBe('pasa')
  })

  it('una opción que solo CONTIENE "reducedMotion" ("noreducedMotion") o un valor que solo EMPIEZA por "reduce" ("reduced") no es movimiento reducido', () => {
    expect(veredictoDe("await page.emulateMedia({ noreducedMotion: 'reduce' })", NAVEGA, MIDE_EL_TITULAR)).toBe('incumple')
    expect(veredictoDe("await page.emulateMedia({ reducedMotion: 'reduced' })", NAVEGA, MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('una flecha de expresión que es un array en varias líneas se lee entera', () => {
    const funciones = ['const medir = (page: Page) => [', "  page.locator('h1').boundingBox(),", ']'].join('\n')

    expect(veredictoConFunciones(funciones, NAVEGA, 'await medir(page)')).toBe('incumple')
  })

  it('una espera con un argumento que no es un identificador ("{ page }") no se ata a ninguna página', () => {
    expect(veredictoDe(NAVEGA, 'await esperarEntradaTerminada({ page })', MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('un texto con la página en una captura y el nombre de otra función que no es la del hero no mide el hero', () => {
    expect(veredictoDe(NAVEGA, "await page.locator('#contacto').boundingBox()")).toBe('exento')
  })
})

describe('hero_reducido_con_animacion @s10, A6 de la revisión: las cadenas, los comentarios y los alias de los tests', () => {
  it('una cadena con una barra invertida y un salto de línea (continuación de línea) se lee entera y no deja ver lo que cita', () => {
    const lineas = ["const nota = 'primera \\", "page.goto(x)'", EMULA_REDUCE, NAVEGA, MIDE_EL_TITULAR]

    expect(veredictoDe(...lineas)).toBe('pasa')
  })

  it('un título con una barra invertida y un espacio se lee entero', () => {
    const spec = "test('con \\ espacio', async ({ page }) => {\n  await page.goto('/')\n})"

    expect(comprobarMedicionEstable(spec).bloques).toEqual([{ titulo: 'con \\ espacio', veredicto: 'exento' }])
  })

  it.each([
    ['con un espacio antes del punto', "const t = test .extend({})"],
    ['con un espacio tras el punto', "const t = test. extend({})"],
    ['sin salto de línea al final del texto', 'const t = test'],
  ])('un alias %s declara bloques', (_nombre, declaracion) => {
    const spec = `${specConUnBloque(cuerpo(NAVEGA, MIDE_EL_TITULAR).replace('test(', 't('))}${declaracion}`

    expect(veredictosDe(spec)).toEqual(['incumple'])
  })

  it('congelar y colocar: solo la colocación es código, el nombre del ayudante en una cadena no congela', () => {
    expect(veredictoDe('const nota = "congelarRelojDeAnimaciones(page)"', NAVEGA, COLOCA_LAS_ANIMACIONES, MIDE_EL_TITULAR)).toBe('incumple')
    expect(veredictoDe('const nota = "sesion.send(\'Animation.setPlaybackRate\', 0)"', NAVEGA, COLOCA_LAS_ANIMACIONES, MIDE_EL_TITULAR)).toBe('incumple')
  })

  it('el orden de los eventos de una función local de varios eventos se conserva entero', () => {
    const ordenada = [
      'async function cargar(pagina: Page) {',
      "  await pagina.goto('/')",
      '  await esperarEntradaTerminada(pagina)',
      '  await pagina.reload()',
      '  await esperarEntradaTerminada(pagina)',
      '}',
    ].join('\n')
    const desordenada = ordenada.replace('  await esperarEntradaTerminada(pagina)\n}', '}')

    expect(veredictoConFunciones(ordenada, 'await cargar(page)', MIDE_EL_TITULAR)).toBe('pasa')
    expect(veredictoConFunciones(desordenada, 'await cargar(page)', MIDE_EL_TITULAR)).toBe('incumple')
  })
})

describe('hero_reducido_con_animacion @s10, A6 de la revisión: lo que la primera corrida de StrykerJS dejó vivo', () => {
  it('un ";" acaba la flecha de expresión aunque la sentencia que sigue empiece por un operador ("-1 + …")', () => {
    const funciones = "const contar = (locator: Locator) => locator.count(); -1 + page.locator('h1').boundingBox()"

    expect(veredictoConFunciones(funciones, NAVEGA, "await contar(page.locator('h1'))")).toBe('exento')
  })

  it('una llamada con menos argumentos que parámetros deja al parámetro que falta con su propio nombre ("page")', () => {
    const funcion = ['async function esperar(primero: number, page: Page) {', '  await esperarEntradaTerminada(page)', '}'].join('\n')

    expect(veredictoConFunciones(funcion, NAVEGA, 'await esperar(1)', MIDE_EL_TITULAR)).toBe('pasa')
  })

  it('una flecha de expresión con varias líneas en blanco antes del cuerpo lo lee entero', () => {
    const funciones = ['const medir = (page: Page) =>', '', '', '', "    page.locator('h1').boundingBox()"].join('\n')

    expect(veredictoConFunciones(funciones, NAVEGA, 'await medir(page)')).toBe('incumple')
  })

  it('un argumento desestructurado en el que la función espera ("esperarEntradaTerminada({ page })") no ata la espera a la página que recibe', () => {
    const funcion = ['async function esperar({ page }: Fixtures) {', '  await esperarEntradaTerminada({ page })', '}'].join('\n')
    const lineas = ["await otra.goto('/')", 'await esperar(otra)', "await otra.locator('h1').boundingBox()"]

    expect(veredictoConFunciones(funcion, ...lineas)).toBe('incumple')
  })

  it('la función del fichero se ve aunque OTRO test declare dentro una con el mismo nombre', () => {
    const delFichero = ['async function cargar(p: Page) {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const conLaSuya = [
      "test('declara la suya', async ({ page }) => {",
      '  async function cargar(p: Page) {',
      "    await p.goto('/')",
      '  }',
      '  await cargar(page)',
      `  ${MIDE_EL_TITULAR}`,
      '})',
    ].join('\n')
    const laDelFichero = ["test('usa la del fichero', async ({ page }) => {", '  await cargar(page)', `  ${MIDE_EL_TITULAR}`, '})'].join('\n')

    expect(veredictosDe([CABECERA_DEL_SPEC, delFichero, conLaSuya, laDelFichero].join('\n'))).toEqual(['incumple', 'pasa'])
  })

  it('una función del fichero pegada al test que la llama ("}test(") es la más cercana ANTES de él', () => {
    const sinEspera = ['async function cargar(p: Page) {', "  await p.goto('/')", '}'].join('\n')
    const conEspera = ['async function cargar(p: Page) {', "  await p.goto('/')", '  await esperarEntradaTerminada(p)', '}'].join('\n')
    const bloque = ["test('pegado', async ({ page }) => {", '  await cargar(page)', `  ${MIDE_EL_TITULAR}`, '})'].join('\n')

    expect(veredictosDe([CABECERA_DEL_SPEC, sinEspera, `${conEspera}${bloque}`].join('\n'))).toEqual(['pasa'])
  })

  it('una función declarada en el bloque y llamada sin página nombrada mide la que el bloque nombró más cerca antes de llamarla', () => {
    const lineas = [
      NAVEGA,
      ESPERA,
      "await otra.goto('/')",
      'async function medir() {',
      "  return document.querySelector('h1').getBoundingClientRect()",
      '}',
      'await medir()',
    ]

    expect(veredictoDe(...lineas)).toBe('incumple')
  })

  it('una medición que no nombra ninguna página, tras una función que navega y espera con la "page" del fichero, se ata a "page"', () => {
    const funcion = ['async function cargarPortada() {', "  await page.goto('/')", '  await esperarEntradaTerminada(page)', '}'].join('\n')
    // Ni siquiera la firma del test nombra "page": no hay ninguna mención en el bloque entero.
    const bloque = ["test('sin ninguna página nombrada', async (fixtures) => {", '  await cargarPortada()', "  await contenedor.locator('h1').boundingBox()", '})'].join('\n')

    expect(veredictosDe(specConUnBloque(bloque, funcion))).toEqual(['pasa'])
    expect(veredictoConFunciones(funcion, 'await cargarPortada()', "await contenedor.locator('h1').boundingBox()")).toBe('pasa')
  })

  it('una lectura de estilo en el bloque cuenta aunque la función que llama no lea ninguno', () => {
    const funcion = ['async function medir(page: Page) {', '  return page.url()', '}'].join('\n')
    const lineas = [NAVEGA, 'await medir(page)', "await page.locator('h1').evaluate((e) => getComputedStyle(e).opacity)"]

    expect(veredictoConFunciones(funcion, ...lineas)).toBe('incumple')
  })
})
