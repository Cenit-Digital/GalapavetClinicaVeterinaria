// @s20-@s23 de `features/identidad_visual.feature` (Bloque C, tipografía
// autoalojada en navegador real). NAVEGADOR REAL con Playwright, sobre
// `dist/` servido por `vite preview` (playwright.config.ts → webServer).
import { expect, test } from 'playwright/test'
import { RUTAS_DEL_INVENTARIO } from './rutas'

const FAMILIA_TEXTO = 'DM Sans'
const FAMILIA_TITULARES = 'Outfit'
const FAMILIA_POR_DEFECTO_DEL_AGENTE = 'Times New Roman'
const TECHO_BYTES_FUENTES = 69224 // @s22: suma medida de los dos subconjuntos latinos variables (Outfit 32292 B + DM Sans 36932 B).
const TOLERANCIA_PX = 1

test.describe('@s20 el texto del sitio real se pinta con las tipografías de marca', () => {
  for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
    test(`${pagina} (${ruta}): body en "${FAMILIA_TEXTO}", h1 en "${FAMILIA_TITULARES}"`, async ({ page }) => {
      await page.goto(ruta)
      await page.evaluate(() => document.fonts.ready)

      const familiaCuerpo = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
      const familiaH1 = await page.locator('h1').first().evaluate((elemento) => getComputedStyle(elemento).fontFamily)

      expect(familiaCuerpo).toContain(FAMILIA_TEXTO)
      expect(familiaH1).toContain(FAMILIA_TITULARES)
      expect(familiaCuerpo).not.toBe(FAMILIA_POR_DEFECTO_DEL_AGENTE)
      expect(familiaH1).not.toBe(FAMILIA_POR_DEFECTO_DEL_AGENTE)
    })
  }

  test('el recuento de rutas efectivamente comprobadas es exactamente 6', () => {
    expect(RUTAS_DEL_INVENTARIO).toHaveLength(6)
  })
})

test.describe('@s21 los controles de formulario del sitio real también usan la tipografía de marca', () => {
  test('cada campo de texto, área, desplegable y botón del formulario de contacto y del chat de reserva usa "DM Sans" u "Outfit"', async ({
    page,
  }) => {
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    const selectorDeControles = 'input, textarea, select, button'
    const zonasDeControl = ['#contacto', '#reservar']

    let controlesMedidos = 0
    for (const zona of zonasDeControl) {
      const controles = page.locator(zona).locator(selectorDeControles)
      const total = await controles.count()
      for (let indice = 0; indice < total; indice += 1) {
        const familia = await controles.nth(indice).evaluate((elemento) => getComputedStyle(elemento).fontFamily)
        const usaFamiliaDeMarca = familia.includes(FAMILIA_TEXTO) || familia.includes(FAMILIA_TITULARES)
        expect(usaFamiliaDeMarca, `control #${indice} de "${zona}" computó "${familia}"`).toBe(true)
        controlesMedidos += 1
      }
    }

    expect(controlesMedidos).toBeGreaterThan(0)
  })
})

test.describe('@s22 los dos ficheros de fuente se sirven en local, responden 200 y no superan su techo de peso medido', () => {
  test('exactamente 2 ficheros ".woff2", 200, suma <= 69224 B, solo subconjunto latino, sin cursiva', async ({
    page,
    baseURL,
  }) => {
    const respuestasDeFuente: { url: string; status: number; bytes: number }[] = []

    page.on('response', (respuesta) => {
      if (/\.woff2(\?|$)/.test(respuesta.url())) {
        respuestasDeFuente.push({ url: respuesta.url(), status: respuesta.status(), bytes: 0 })
      }
    })

    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)

    expect(respuestasDeFuente).toHaveLength(2)
    for (const respuestaDeFuente of respuestasDeFuente) {
      expect(respuestaDeFuente.status).toBe(200)
      expect(respuestaDeFuente.url.startsWith(baseURL ?? '')).toBe(true)
      expect(respuestaDeFuente.url).not.toMatch(/latin-ext|italic/i)
    }

    // "encodedBodySize", no "transferSize": el techo de 69224 B es la suma de
    // los BYTES DEL FICHERO en disco (@s22 lo dice explícitamente), y
    // "transferSize" añade una estimación del tamaño de las cabeceras HTTP
    // que no forma parte de ese número (medido: +300 B por respuesta).
    const bytesTotales = await page.evaluate(async () => {
      const entradas = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return entradas
        .filter((entrada) => entrada.name.endsWith('.woff2'))
        .reduce((total, entrada) => total + entrada.encodedBodySize, 0)
    })

    // El techo está ESCRITO A MANO y no se recalcula de las respuestas que comprueba (@s22).
    expect(bytesTotales).toBeLessThanOrEqual(TECHO_BYTES_FUENTES)
    expect(TECHO_BYTES_FUENTES).toBe(69224)
  })
})

test.describe('@s23 si la fuente de marca no llega, el texto de respaldo ocupa el mismo alto y no salta nada', () => {
  test('el alto del h1 y del primer párrafo coincide con y sin las fuentes de marca (tolerancia 1px), y el texto es visible desde el primer pintado', async ({
    page,
    context,
  }) => {
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const cajaH1ConFuente = await page.locator('h1').first().boundingBox()
    const cajaParrafoConFuente = await page.locator('p').first().boundingBox()

    await context.route('**/fuentes/**', (ruta) => ruta.abort())
    const paginaSinFuente = await context.newPage()
    await paginaSinFuente.goto('/')

    // "font-display: swap" pinta con el respaldo desde el primer pintado, sin esperar a que
    // decida cargar o no la fuente de marca: el texto ya es visible aquí.
    const h1Visible = await paginaSinFuente.locator('h1').first().isVisible()
    expect(h1Visible).toBe(true)

    const cajaH1SinFuente = await paginaSinFuente.locator('h1').first().boundingBox()
    const cajaParrafoSinFuente = await paginaSinFuente.locator('p').first().boundingBox()
    await paginaSinFuente.close()

    if (!cajaH1ConFuente || !cajaH1SinFuente || !cajaParrafoConFuente || !cajaParrafoSinFuente) {
      throw new Error('no se pudo medir el rectángulo del h1 o del primer párrafo')
    }

    expect(Math.abs(cajaH1ConFuente.height - cajaH1SinFuente.height)).toBeLessThanOrEqual(TOLERANCIA_PX)
    expect(Math.abs(cajaParrafoConFuente.height - cajaParrafoSinFuente.height)).toBeLessThanOrEqual(TOLERANCIA_PX)
  })
})
