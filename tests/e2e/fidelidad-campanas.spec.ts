import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const TOLERANCIA_PX = 2

async function cargarCampanas(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('[data-campanas-contenido]')
}

test.describe('@s1 de fidelidad_campanas: composición de dos columnas', () => {
  test('a 1440px la presentación y la rejilla comparten fila, con las tarjetas a la derecha', async ({ page }) => {
    const seccion = await cargarCampanas(page, ANCHO_ESCRITORIO_PX)
    const presentacion = seccion.locator('[data-campanas-presentacion]')
    const rejilla = seccion.locator('[data-campanas-rejilla]')
    const [izquierda, derecha] = await Promise.all([presentacion.boundingBox(), rejilla.boundingBox()])

    expect(izquierda).not.toBeNull()
    expect(derecha).not.toBeNull()
    const centroIzquierda = (izquierda?.y ?? 0) + (izquierda?.height ?? 0) / 2
    const centroDerecha = (derecha?.y ?? 0) + (derecha?.height ?? 0) / 2
    expect(Math.abs(centroIzquierda - centroDerecha)).toBeLessThanOrEqual(TOLERANCIA_PX)
    expect((derecha?.x ?? 0)).toBeGreaterThan((izquierda?.x ?? 0) + (izquierda?.width ?? 0))
  })
})

test.describe('@s2 de fidelidad_campanas: tarjetas demostrativas honestas', () => {
  test('el aviso íntegro describe la región y cada tarjeta combina imagen, pildora y detalle publicado sin precio ni vigencia', async ({ page }) => {
    const seccion = await cargarCampanas(page, ANCHO_ESCRITORIO_PX)
    const aviso = seccion.locator('#campanas-aviso-demostracion')
    await expect(aviso).toContainText('Contenido de demostración.')
    await expect(seccion).toHaveAttribute('aria-describedby', 'campanas-aviso-demostracion')
    await expect(seccion).not.toContainText(/€|\bEUR\b|%|hasta el|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre/i)

    const tarjetas = seccion.locator('[data-tarjeta-campana]')
    await expect(tarjetas).toHaveCount(3)
    for (let indice = 0; indice < 3; indice += 1) {
      const tarjeta = tarjetas.nth(indice)
      await expect(tarjeta.locator('[data-imagen-campana]')).toHaveAttribute('src', /\/img\/campanas\//)
      await expect(tarjeta.locator('[data-etiqueta-campana]')).toHaveText('Demostración')
      await expect(tarjeta.locator('[data-detalle-campana]')).toContainText('Bloque de servicios:')
    }
  })
})

test.describe('@s3 de fidelidad_campanas: destinos de la composición', () => {
  test('el CTA primario y las tres tarjetas llevan al listado publicado', async ({ page }) => {
    const seccion = await cargarCampanas(page, ANCHO_ESCRITORIO_PX)
    await expect(seccion.locator('[data-campanas-cta]')).toHaveAccessibleName('Ver campañas')
    await expect(seccion.locator('[data-campanas-cta]')).toHaveAttribute('href', /\/campanas$/)
    const tarjetas = seccion.locator('[data-tarjeta-campana] a')
    await expect(tarjetas).toHaveCount(3)
    for (let indice = 0; indice < 3; indice += 1) await expect(tarjetas.nth(indice)).toHaveAttribute('href', /\/campanas$/)
  })
})

test.describe('@s4 de fidelidad_campanas: lectura móvil', () => {
  test('a 320px la presentación precede a las tarjetas y el documento no desborda', async ({ page }) => {
    const seccion = await cargarCampanas(page, 320)
    const [presentacion, rejilla] = await Promise.all([
      seccion.locator('[data-campanas-presentacion]').boundingBox(),
      seccion.locator('[data-campanas-rejilla]').boundingBox(),
    ])
    expect(presentacion).not.toBeNull()
    expect(rejilla).not.toBeNull()
    expect((presentacion?.y ?? 0) + (presentacion?.height ?? 0)).toBeLessThanOrEqual((rejilla?.y ?? 0) + TOLERANCIA_PX)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320 + TOLERANCIA_PX)
  })
})
