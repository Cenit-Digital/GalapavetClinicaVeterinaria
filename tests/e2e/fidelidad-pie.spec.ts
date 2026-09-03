import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_MOVIL_PX = 320
const TOLERANCIA_PX = 1

interface Caja {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

async function cajaDe(locator: Locator): Promise<Caja> {
  const caja = await locator.boundingBox()
  if (caja === null) throw new Error('el elemento no tiene caja visible')
  return caja
}

async function cargarPie(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.getByRole('contentinfo')
}

async function colorDeToken(page: Page, token: string): Promise<string> {
  return page.evaluate((nombre) => {
    const sonda = document.createElement('span')
    sonda.style.color = `var(${nombre})`
    document.body.append(sonda)
    const color = getComputedStyle(sonda).color
    sonda.remove()
    return color
  }, token)
}

test.describe('@s1 de fidelidad_pie: marca y tres columnas alineadas', () => {
  test('a 1440px la marca y Clínica, Contenido y Contacto comparten fila, la marca es más ancha y logo y Galapavet comparten línea', async ({ page }) => {
    const pie = await cargarPie(page, ANCHO_ESCRITORIO_PX)
    const superior = pie.locator('[data-pie-superior]')
    const marca = superior.locator('[data-pie-marca]')
    const columnas = superior.locator('[data-pie-columna]')
    await expect(columnas).toHaveCount(3)
    await expect(columnas.locator('h3')).toHaveText(['Clínica', 'Contenido', 'Contacto'])

    const cajaMarca = await cajaDe(marca)
    const cajasColumnas = await columnas.evaluateAll((elementos) =>
      elementos.map((elemento) => {
        const { x, y, width, height } = elemento.getBoundingClientRect()
        return { x, y, width, height }
      }),
    )
    for (const caja of cajasColumnas) {
      expect(Math.abs(caja.y - cajaMarca.y)).toBeLessThanOrEqual(TOLERANCIA_PX)
      expect(cajaMarca.width).toBeGreaterThan(caja.width)
    }

    const cabeceraMarca = marca.locator('[data-pie-marca-cabecera]')
    const logo = cabeceraMarca.locator('img')
    const nombre = cabeceraMarca.getByText('Galapavet')
    const cajaLogo = await cajaDe(logo)
    const cajaNombre = await cajaDe(nombre)
    expect(Math.abs(cajaLogo.y + cajaLogo.height / 2 - (cajaNombre.y + cajaNombre.height / 2))).toBeLessThanOrEqual(
      TOLERANCIA_PX,
    )
  })
})

test.describe('@s2 y @s3 de fidelidad_pie: enlaces y barra legal legibles', () => {
  test('los enlaces de columna no se subrayan en reposo, cambian a primario al hover y los legales quedan en línea con aviso solo accesible', async ({ page }) => {
    const pie = await cargarPie(page, ANCHO_ESCRITORIO_PX)
    const enlace = pie.locator('[data-pie-columna]').first().getByRole('link').first()
    expect(await enlace.evaluate((nodo) => getComputedStyle(nodo).textDecorationLine)).toBe('none')
    await enlace.hover()
    expect(await enlace.evaluate((nodo) => getComputedStyle(nodo).color)).toBe(await colorDeToken(page, '--color-primario'))

    const barra = pie.locator('[data-pie-barra-legal]')
    const copyright = barra.getByText(/^© \d{4} Galapavet$/)
    const legales = barra.getByRole('list', { name: 'Enlaces legales' }).getByRole('link')
    await expect(legales).toHaveCount(3)
    const cajaCopyright = await cajaDe(copyright)
    const cajasLegales = await legales.evaluateAll((elementos) =>
      elementos.map((elemento) => {
        const { x, y, width, height } = elemento.getBoundingClientRect()
        return { x, y, width, height }
      }),
    )
    expect(cajasLegales[0]?.x ?? 0).toBeGreaterThan(cajaCopyright.x + cajaCopyright.width)
    for (const caja of cajasLegales) expect(Math.abs(caja.y - cajaCopyright.y)).toBeLessThanOrEqual(TOLERANCIA_PX)
    for (let indice = 0; indice < 3; indice += 1) {
      const legal = legales.nth(indice)
      await expect(legal).toHaveAccessibleName(/se abre en una ventana nueva/)
      const aviso = legal.locator('span')
      const cajaAviso = await cajaDe(aviso)
      expect(cajaAviso.width).toBe(1)
      expect(cajaAviso.height).toBe(1)
      expect(await aviso.evaluate((nodo) => getComputedStyle(nodo).position)).toBe('absolute')
    }
  })
})

test.describe('@s4 de fidelidad_pie: apilado móvil', () => {
  test('a 320px el logotipo local queda cargado y la marca y columnas se apilan sin desbordar', async ({ page }) => {
    const pie = await cargarPie(page, ANCHO_MOVIL_PX)
    const logo = pie.locator('[data-pie-marca] img')
    await logo.scrollIntoViewIfNeeded()
    await expect(logo).toHaveJSProperty('naturalWidth', 201)
    const cajas = await pie.locator('[data-pie-superior] > *').evaluateAll((elementos) =>
      elementos.map((elemento) => ({ y: elemento.getBoundingClientRect().y, x: elemento.getBoundingClientRect().x })),
    )
    expect(cajas[1]?.y ?? 0).toBeGreaterThan(cajas[0]?.y ?? 0)
    const medidas = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }))
    expect(medidas.documento).toBeLessThanOrEqual(medidas.ventana + TOLERANCIA_PX)
  })
})
