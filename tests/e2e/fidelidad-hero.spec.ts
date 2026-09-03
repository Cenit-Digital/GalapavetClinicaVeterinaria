import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const TOLERANCIA_CENTRADO_PX = 2

interface Caja {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

async function cajaDe(locator: Locator): Promise<Caja> {
  return locator.evaluate((elemento) => {
    const { x, y, width, height } = elemento.getBoundingClientRect()
    return { x, y, width, height }
  })
}

async function cargarPortada(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('[data-hero-contenido]')
}

test.describe('@s1 de fidelidad_hero: jerarquía centrada y dos acciones', () => {
  test('a 1440px localidad, textos y acciones se centran dentro de un hero a sangre sin recortar los botones', async ({ page }) => {
    const contenido = await cargarPortada(page, ANCHO_ESCRITORIO_PX)
    const hero = page.locator('#inicio [data-a-sangre]')
    const ubicacion = contenido.locator('[data-hero-ubicacion]')
    const titular = contenido.getByRole('heading', { level: 1 })
    const subtitulo = contenido.locator('[data-hero-subtitulo]')
    const acciones = contenido.locator('[data-hero-acciones]')

    const cajaHero = await cajaDe(hero)
    expect(cajaHero.x).toBeCloseTo(0, 0)
    expect(cajaHero.width).toBe(ANCHO_ESCRITORIO_PX)

    for (const elemento of [ubicacion, titular, subtitulo, acciones]) {
      const caja = await cajaDe(elemento)
      expect(caja.x + caja.width / 2).toBeCloseTo(cajaHero.x + cajaHero.width / 2, 0)
    }
    expect(await ubicacion.textContent()).toContain('Galapagar')

    const botones = acciones.getByRole('link')
    await expect(botones).toHaveCount(2)
    await expect(botones.nth(0)).toHaveAttribute('href', '#reservar')
    await expect(botones.nth(1)).toHaveAttribute('href', /^tel:/)
    for (const boton of [botones.nth(0), botones.nth(1)]) {
      const caja = await cajaDe(boton)
      const relleno = await boton.evaluate((elemento) => getComputedStyle(elemento).paddingInlineStart)
      expect(caja.width).toBeGreaterThan(44)
      expect(Number.parseFloat(relleno)).toBeGreaterThan(0)
      expect(await boton.evaluate((elemento) => elemento.scrollWidth <= elemento.clientWidth)).toBe(true)
    }
  })
})

test.describe('@s2 de fidelidad_hero: cifras completas y derivadas', () => {
  test('las cuatro cifras correctas aparecen por completo dentro del hero, sin un recorte vertical', async ({ page }) => {
    const contenido = await cargarPortada(page, ANCHO_ESCRITORIO_PX)
    const hero = page.locator('#inicio [data-a-sangre]')
    const cifras = contenido.locator('[data-hero-cifras]')

    await expect(cifras.getByRole('listitem')).toHaveCount(4)
    await expect(cifras.getByRole('listitem')).toContainText([
      '5Servicios',
      '2Profesionales',
      '6Fotos de galería',
      '3Franjas horarias',
    ])

    const cajaHero = await cajaDe(hero)
    const cajaCifras = await cajaDe(cifras)
    expect(cajaCifras.y + cajaCifras.height).toBeLessThanOrEqual(cajaHero.y + cajaHero.height + TOLERANCIA_CENTRADO_PX)
    expect(await hero.evaluate((elemento) => elemento.scrollHeight <= elemento.clientHeight)).toBe(true)
  })
})

test.describe('@s3 de fidelidad_hero: adaptación a 320px', () => {
  test('la jerarquía completa cabe dentro del hero y el documento no adquiere overflow horizontal', async ({ page }) => {
    const contenido = await cargarPortada(page, 320)
    const hero = page.locator('#inicio [data-a-sangre]')
    const elementos = [
      contenido.locator('[data-hero-ubicacion]'),
      contenido.getByRole('heading', { level: 1 }),
      contenido.locator('[data-hero-acciones]'),
      contenido.locator('[data-hero-cifras]'),
    ]

    const cajaHero = await cajaDe(hero)
    for (const elemento of elementos) {
      await expect(elemento).toBeVisible()
      const caja = await cajaDe(elemento)
      expect(caja.x).toBeGreaterThanOrEqual(cajaHero.x - TOLERANCIA_CENTRADO_PX)
      expect(caja.x + caja.width).toBeLessThanOrEqual(cajaHero.x + cajaHero.width + TOLERANCIA_CENTRADO_PX)
      expect(caja.y + caja.height).toBeLessThanOrEqual(cajaHero.y + cajaHero.height + TOLERANCIA_CENTRADO_PX)
    }
    const dimensiones = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }))
    expect(dimensiones.documento).toBeLessThanOrEqual(dimensiones.ventana)
  })
})
