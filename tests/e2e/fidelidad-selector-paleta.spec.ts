import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_MOVIL_PX = 320
const LADO_DISPARADOR_PX = 52
const TOLERANCIA_PX = 1
const NOMBRE_DISPARADOR = 'Cambiar paleta de color'

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

async function cargarSelector(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('[data-selector-paleta]')
}

test.describe('@s1 de fidelidad_selector_paleta: disparador circular y discreto', () => {
  test('a 1440px tiene el nombre accesible exacto, ningún texto visible, un disco tricolor y una caja fija circular de 52px abajo a la derecha', async ({ page }) => {
    const selector = await cargarSelector(page, ANCHO_ESCRITORIO_PX)
    const boton = selector.getByRole('button', { name: NOMBRE_DISPARADOR })
    await expect(boton).toHaveAccessibleName(NOMBRE_DISPARADOR)
    await expect(boton).toHaveText('')
    const caja = await cajaDe(boton)
    expect(Math.abs(caja.width - LADO_DISPARADOR_PX)).toBeLessThanOrEqual(TOLERANCIA_PX)
    expect(Math.abs(caja.height - LADO_DISPARADOR_PX)).toBeLessThanOrEqual(TOLERANCIA_PX)
    expect(await boton.evaluate((nodo) => getComputedStyle(nodo).borderRadius)).toBe('50%')
    expect(await boton.evaluate((nodo) => getComputedStyle(nodo).position)).toBe('fixed')
    expect(caja.x + caja.width).toBeLessThanOrEqual(ANCHO_ESCRITORIO_PX)
    expect(caja.y + caja.height).toBeLessThanOrEqual(900)
    const disco = boton.locator('[aria-hidden="true"]')
    await expect(disco).toHaveCount(1)
    expect(await disco.evaluate((nodo) => getComputedStyle(nodo).backgroundImage)).toContain('conic-gradient')
  })
})

test.describe('@s2 y @s3 de fidelidad_selector_paleta: panel y selección', () => {
  test('al abrir hay un título visible, exactamente cinco filas con tres muestras y solo la activa comunica aria-pressed y contorno', async ({ page }) => {
    const selector = await cargarSelector(page, ANCHO_ESCRITORIO_PX)
    await selector.getByRole('button', { name: NOMBRE_DISPARADOR }).click()
    const panel = selector.getByRole('group', { name: 'Paleta de color' })
    await expect(panel.getByText('Paleta de color', { exact: true })).toBeVisible()
    const variantes = panel.getByRole('button')
    await expect(variantes).toHaveCount(5)
    for (let indice = 0; indice < 5; indice += 1) {
      await expect(variantes.nth(indice).locator('[data-muestra-variante] > span')).toHaveCount(3)
    }
    await expect(panel.getByRole('button', { name: /^Clínica/ })).toHaveAttribute('aria-pressed', 'true')
    await panel.getByRole('button', { name: /^Eco/ }).click()
    const activas = panel.locator('button[aria-pressed="true"]')
    await expect(activas).toHaveCount(1)
    await expect(activas).toHaveAccessibleName(/^Eco/)
    expect(await activas.evaluate((nodo) => Number.parseFloat(getComputedStyle(nodo).borderTopWidth))).toBeGreaterThan(0)
  })
})

test.describe('@s4 de fidelidad_selector_paleta: panel contenido en móvil y sin animación reducida', () => {
  test('a 320px el panel abierto queda encima del disparador, dentro de ventana y no hay transición con movimiento reducido', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const selector = await cargarSelector(page, ANCHO_MOVIL_PX)
    const disparador = selector.getByRole('button', { name: NOMBRE_DISPARADOR })
    await disparador.click()
    const panel = selector.getByRole('group', { name: 'Paleta de color' })
    const cajaPanel = await cajaDe(panel)
    const cajaDisparador = await cajaDe(disparador)
    expect(cajaPanel.x).toBeGreaterThanOrEqual(0)
    expect(cajaPanel.x + cajaPanel.width).toBeLessThanOrEqual(ANCHO_MOVIL_PX + TOLERANCIA_PX)
    expect(cajaPanel.y + cajaPanel.height).toBeLessThanOrEqual(cajaDisparador.y + TOLERANCIA_PX)
    // La red de seguridad global conserva 0.01 ms (en vez de 0) para que no
    // se pierdan eventos `transitionend`; esa duración es imperceptible y es
    // el contrato de movimiento reducido del proyecto.
    expect(Number.parseFloat(await panel.evaluate((nodo) => getComputedStyle(nodo).transitionDuration))).toBeLessThanOrEqual(
      0.00001,
    )
    const medidas = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }))
    expect(medidas.documento).toBeLessThanOrEqual(medidas.ventana + TOLERANCIA_PX)
  })
})
