import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const TOLERANCIA_PX = 2

async function cargarServicios(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('#servicios [data-servicios-contenido]')
}

test.describe('@s1 de fidelidad_servicios: jerarquía y catálogo real', () => {
  test('a 1440px muestra el cintillo, titular bicolor con localidad y texto que deriva el recuento publicado', async ({ page }) => {
    const seccion = await cargarServicios(page, ANCHO_ESCRITORIO_PX)
    await expect(seccion.locator('[data-servicios-cintillo]')).toHaveText('Lo que hacemos')
    await expect(seccion.locator('h2')).toContainText('Servicios veterinarios')
    await expect(seccion.locator('h2 em')).toContainText('Galapagar')
    await expect(seccion.locator('[data-servicios-apoyo]')).toContainText('5 servicios')
    await expect(seccion.locator('[data-servicios-apoyo]')).not.toContainText(/urgencias 24|peluquería|animales exóticos/i)
  })
})

test.describe('@s2 de fidelidad_servicios: tarjetas completas', () => {
  test('las cinco tarjetas tienen imagen local arriba, pildora superpuesta, resumen y cuerpo dentro de una superficie', async ({ page }) => {
    const seccion = await cargarServicios(page, ANCHO_ESCRITORIO_PX)
    const tarjetas = seccion.locator('[data-tarjeta-servicio]')
    await expect(tarjetas).toHaveCount(5)

    for (let indice = 0; indice < 5; indice += 1) {
      const tarjeta = tarjetas.nth(indice)
      const imagen = tarjeta.locator('[data-imagen-servicio]')
      const pildora = tarjeta.locator('[data-categoria-servicio]')
      const resumen = tarjeta.locator('[data-resumen-servicio]')
      await expect(imagen).toHaveAttribute('src', /\/img\/servicios\//)
      await expect(pildora).not.toBeEmpty()
      await expect(resumen).not.toBeEmpty()
      const geometria = await tarjeta.evaluate((elemento) => {
        const imagenActual = elemento.querySelector<HTMLElement>('[data-imagen-servicio]')
        const pildoraActual = elemento.querySelector<HTMLElement>('[data-categoria-servicio]')
        if (imagenActual === null || pildoraActual === null) throw new Error('estructura de tarjeta incompleta')
        const tarjetaRect = elemento.getBoundingClientRect()
        const imagenRect = imagenActual.getBoundingClientRect()
        const pildoraRect = pildoraActual.getBoundingClientRect()
        const estilo = getComputedStyle(elemento)
        return {
          imagenEmpiezaArriba: Math.abs(imagenRect.y - tarjetaRect.y) <= 1,
          pildoraDentroDeImagen: pildoraRect.y >= imagenRect.y && pildoraRect.bottom <= imagenRect.bottom,
          radio: Number.parseFloat(estilo.borderTopLeftRadius),
          borde: estilo.borderTopStyle,
        }
      })
      expect(geometria.imagenEmpiezaArriba).toBe(true)
      expect(geometria.pildoraDentroDeImagen).toBe(true)
      expect(geometria.radio).toBeGreaterThan(0)
      expect(geometria.borde).not.toBe('none')
    }
  })
})

test.describe('@s3 de fidelidad_servicios: detalle accesible e independiente', () => {
  test('al abrir una tarjeta muestra solo sus puntos y el círculo decorativo cambia de estado', async ({ page }) => {
    const seccion = await cargarServicios(page, ANCHO_ESCRITORIO_PX)
    const tarjetas = seccion.locator('[data-tarjeta-servicio]')
    const primera = tarjetas.nth(0)
    const control = primera.locator('[data-servicio-control]')
    await expect(control).toHaveAttribute('aria-expanded', 'false')
    await control.click()
    await expect(control).toHaveAttribute('aria-expanded', 'true')
    await expect(primera.locator('[data-detalle-servicio] li')).not.toHaveCount(0)
    await expect(tarjetas.nth(1).locator('[data-servicio-control]')).toHaveAttribute('aria-expanded', 'false')
    expect(await control.evaluate((elemento) => getComputedStyle(elemento, '::after').content)).toContain('+')
    expect(await control.evaluate((elemento) => getComputedStyle(elemento, '::after').transform)).not.toBe('none')
  })
})

test.describe('@s4 de fidelidad_servicios: columna legible a 320px', () => {
  test('las cinco tarjetas comparten una sola columna y el documento no desborda horizontalmente', async ({ page }) => {
    const seccion = await cargarServicios(page, 320)
    const tarjetas = seccion.locator('[data-tarjeta-servicio]')
    await expect(tarjetas).toHaveCount(5)
    const posiciones = await tarjetas.evaluateAll((elementos) => elementos.map((elemento) => elemento.getBoundingClientRect().x))
    for (const posicion of posiciones) expect(posicion).toBeCloseTo(posiciones[0] ?? 0, 0)
    const dimensiones = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }))
    expect(dimensiones.documento).toBeLessThanOrEqual(dimensiones.ventana + TOLERANCIA_PX)
  })
})
