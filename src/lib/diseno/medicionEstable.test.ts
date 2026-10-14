import { describe, expect, it } from 'vitest'
import { comprobarMedicionEstable, type Veredicto } from './medicionEstable'

/**
 * hero_reducido_con_animacion @s10 — «todo test que mide la portada recién
 * cargada lo hace con la entrada ya terminada o con movimiento reducido
 * emulado». Esta es la COMPROBACIÓN ESTÁTICA: un módulo puro que lee el TEXTO
 * de un spec de navegador y decide, bloque `test(` por bloque `test(`, si
 * cumple. Vive aquí (mordible por StrykerJS) y no en `tests/e2e`; el cableado a
 * los specs REALES lo hace la ola siguiente, cuando esos specs ya se hayan
 * actualizado.
 *
 * Las filas sintéticas están escritas con las MISMAS formas que usan los
 * specs reales: `cargarPortada()` y `cajaDe()` de `fidelidad-hero.spec.ts`, el
 * bucle por rutas con `AxeBuilder` de `accesibilidad.spec.ts`, el `boundingBox`
 * de `tipografia.spec.ts`.
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

  it('una función flecha de expresión (sin llaves) no se resuelve: no hay cuerpo que leer', () => {
    const funciones = 'const cajaDe = (locator: Locator) => locator.boundingBox()'

    expect(veredictoDelUnicoBloque(specConUnBloque(cuerpo(NAVEGA, "await cajaDe(page.locator('h1'))"), funciones))).toBe('exento')
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

  it('una función declarada DENTRO de un bloque test(...) no es una función local: ya forma parte del bloque', () => {
    const bloque = [
      "test('con una función interna', async ({ page }) => {",
      '  async function esperar(p: Page) {',
      '    await esperarEntradaTerminada(p)',
      '  }',
      `  ${NAVEGA}`,
      '  await esperar(page)',
      `  ${MIDE_EL_TITULAR}`,
      '})',
    ].join('\n')

    // La espera vive en una función interna que NO se resuelve: el bloque no la ve como espera previa… salvo
    // porque su texto, con la espera dentro, ya está en el propio bloque. Lo importante es que no cuente DOS veces.
    const informe = comprobarMedicionEstable(specConUnBloque(bloque))

    expect(informe.bloquesInspeccionados).toBe(1)
    expect(informe.bloques[0]?.veredicto).toBe('pasa')
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
