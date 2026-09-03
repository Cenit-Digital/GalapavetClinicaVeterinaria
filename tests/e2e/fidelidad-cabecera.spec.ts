import { expect, test, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO = 1440
const ANCHO_CONTENEDOR = 1220
const TOLERANCIA = 1

interface Caja {
  readonly x: number
  readonly width: number
  readonly height: number
}

async function cajaDe(page: Page, selector: string): Promise<Caja> {
  return page.locator(selector).evaluate((elemento) => {
    const { x, width, height } = elemento.getBoundingClientRect()
    return { x, width, height }
  })
}

test.describe('@s1 de fidelidad_cabecera: barra y cabecera alineadas', () => {
  test('a 1440px comparten la columna de 1220px y muestran solamente los datos reales', async ({ page }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const [barra, cabecera, servicios] = await Promise.all([
      cajaDe(page, '[data-barra-urgencias-interior]'),
      cajaDe(page, '[data-cabecera-interior]'),
      cajaDe(page, '#servicios > *'),
    ])

    for (const [nombre, caja] of [
      ['barra', barra],
      ['cabecera', cabecera],
    ] as const) {
      expect(caja.width, `${nombre}: ancho`).toBeCloseTo(ANCHO_CONTENEDOR, 0)
      expect(Math.abs(caja.x - servicios.x), `${nombre}: alineación`).toBeLessThanOrEqual(TOLERANCIA)
    }

    const aviso = page.locator('aside[aria-label="Urgencias fuera de horario"]')
    await expect(aviso).toHaveText('Urgencias fuera de horario · 91 851 13 93')
    await expect(aviso.getByRole('link')).toHaveAttribute('href', 'tel:+34918511393')
    await expect(page.locator('[data-cabecera-interior] a[href="#inicio"] img')).toHaveAttribute('src', /\/img\/logo-galapavet\.webp$/)
    await expect(page.locator('[data-cabecera-interior] a[href="#inicio"]')).toContainText('Galapavet')
    await expect(page.locator('[data-cabecera-interior] a[href="#inicio"]')).toContainText('Centro integral veterinario')

    const textoDeUrgencias = await page.locator('body').innerText()
    expect(textoDeUrgencias).not.toMatch(/urgencias\s+24\s*h|24h|todos los días del año/i)
  })
})

test.describe('@s2 de fidelidad_cabecera: acciones de escritorio', () => {
  test('la fila contiene navegación, urgencias y tienda con destinos y áreas táctiles válidos', async ({ page }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const navegacion = page.getByRole('navigation', { name: 'Navegación principal' })
    const enlaces = navegacion.getByRole('link')
    await expect(enlaces).toHaveCount(8)
    await expect(navegacion.locator('ul')).toHaveCSS('flex-direction', 'row')

    const urgencias = page.locator('[data-cabecera-interior] a[href="tel:+34918511393"]')
    const tienda = navegacion.getByRole('link', { name: 'Tienda', exact: true })
    await expect(urgencias).toHaveAccessibleName(/Urgencias\s*fuera de horario.*91 851 13 93/)
    await expect(tienda).toHaveAttribute('href', /\/tienda$/)

    const controles = [...(await enlaces.all()), urgencias]
    for (const [indice, control] of controles.entries()) {
      const caja = await control.evaluate((elemento) => {
        const { width, height } = elemento.getBoundingClientRect()
        return { width, height }
      })
      expect(caja.width, `control ${indice}: ancho`).toBeGreaterThanOrEqual(44)
      expect(caja.height, `control ${indice}: alto`).toBeGreaterThanOrEqual(44)
    }

    await page.setViewportSize({ width: 1024, height: 900 })
    await expect(navegacion).toBeVisible()
    await expect(urgencias).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})

test.describe('@s3 de fidelidad_cabecera: menú móvil', () => {
  test('a 320px abre, ofrece enlaces focalizables y urgencias, cierra al navegar y no crea overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const boton = page.getByRole('button', { name: 'Abrir menú' })
    await boton.click()
    await expect(boton).toHaveAttribute('aria-expanded', 'true')

    const idPanel = await boton.getAttribute('aria-controls')
    expect(idPanel).toBeTruthy()
    const enlaces = page.locator(`#${idPanel} a`)
    await expect(enlaces).toHaveCount(9)
    await expect(page.locator(`#${idPanel} a[href="tel:+34918511393"]`)).toHaveAccessibleName(
      /Urgencias\s*fuera de horario.*91 851 13 93/,
    )
    expect(await enlaces.evaluateAll((elementos) => elementos.every((elemento) => elemento.tabIndex >= 0))).toBe(true)

    await page.locator(`#${idPanel}`).getByRole('link', { name: 'Servicios', exact: true }).click()
    await expect(boton).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator(`#${idPanel}`)).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})
