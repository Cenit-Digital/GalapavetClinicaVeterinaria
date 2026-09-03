import { expect, test, type Locator, type Page } from 'playwright/test'
import { EQUIPO } from '../../src/data/equipo'
import { SUBPATH_DE_PRODUCCION } from './rutas'

// `features/fidelidad_equipo.feature` (feature 31): lo que aquí se mide es la
// geometría PINTADA por el navegador real sobre `dist/`. Los literales
// (rótulos, nombres, textos) van tecleados a mano, con doble anclaje contra
// la fuente única (`EQUIPO`) para que un cambio de datos deje el test en rojo
// en vez de pasar por vacuidad.

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_MOVIL_MINIMO_PX = 320
const ALTO_VENTANA_PX = 900
const TOLERANCIA_PX = 2
const PROPORCION_CUATRO_A_TRES = 4 / 3
const TOLERANCIA_PROPORCION = 0.02

async function cargarEquipo(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: ALTO_VENTANA_PX })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('#equipo section[aria-label="Equipo"]')
}

interface Caja {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

async function cajaDe(locator: Locator): Promise<Caja> {
  const caja = await locator.boundingBox()
  if (caja === null) throw new Error('el elemento no está pintado')
  return caja
}

/** La caja del TEXTO (no de la caja de bloque, que ocupa todo el ancho): lo que de verdad ve centrado el visitante. */
async function cajaDelTexto(locator: Locator): Promise<Caja> {
  return locator.evaluate((elemento) => {
    const rango = document.createRange()
    rango.selectNodeContents(elemento)
    const { x, y, width, height } = rango.getBoundingClientRect()
    return { x, y, width, height }
  })
}

function centroHorizontal(caja: Caja): number {
  return caja.x + caja.width / 2
}

function centroVertical(caja: Caja): number {
  return caja.y + caja.height / 2
}

test.describe('@s1 de fidelidad_equipo: cabecera centrada con recuento derivado de la fuente real', () => {
  test('a 1440px el cintillo, el titular y el párrafo se centran en el eje de la sección y el recuento es el real, sin seis ni colegiados', async ({
    page,
  }) => {
    const seccion = await cargarEquipo(page, ANCHO_ESCRITORIO_PX)
    const cabecera = seccion.locator('[data-equipo-cabecera]')
    const cintillo = cabecera.locator('p').first()
    const titular = cabecera.locator('h2')
    const resumen = cabecera.locator('[data-equipo-resumen]')

    await expect(cintillo).toHaveText('Equipo')
    await expect(titular).toHaveText('Nuestro equipo')

    const ejeDeLaSeccion = centroHorizontal(await cajaDe(seccion))
    const elementosCentrados: readonly (readonly [string, Locator])[] = [
      ['cintillo', cintillo],
      ['titular', titular],
      ['párrafo', resumen],
    ]
    for (const [nombre, elemento] of elementosCentrados) {
      const centro = centroHorizontal(await cajaDelTexto(elemento))
      expect(Math.abs(centro - ejeDeLaSeccion), `${nombre} centrado en el eje de la sección`).toBeLessThanOrEqual(
        TOLERANCIA_PX,
      )
    }

    // Doble anclaje: el literal «Dos» solo es correcto mientras la fuente
    // única publique exactamente dos profesionales.
    expect(EQUIPO).toHaveLength(2)
    await expect(resumen).toContainText('Dos profesionales')
    await expect(resumen).not.toContainText(/seis|colegiad|especialidad/i)
  })
})

test.describe('@s2 de fidelidad_equipo: geometría de tarjeta sin fotografía', () => {
  test('cada tarjeta abre con un panel 4:3 sin imagen, el avatar de iniciales centrado en él y nombre y cargo debajo', async ({
    page,
  }) => {
    const seccion = await cargarEquipo(page, ANCHO_ESCRITORIO_PX)
    const tarjetas = seccion.locator('article')
    await expect(tarjetas).toHaveCount(EQUIPO.length)
    await expect(seccion.locator('img')).toHaveCount(0)

    for (let indice = 0; indice < EQUIPO.length; indice += 1) {
      const tarjeta = tarjetas.nth(indice)
      const panel = tarjeta.locator('[data-equipo-panel]')
      const avatar = panel.locator('span[aria-hidden="true"]')
      const nombre = tarjeta.locator('h3')
      const cargo = tarjeta.locator('[data-equipo-cargo]')

      const cajaTarjeta = await cajaDe(tarjeta)
      const cajaPanel = await cajaDe(panel)
      const cajaAvatar = await cajaDe(avatar)
      const cajaNombre = await cajaDe(nombre)
      const cajaCargo = await cajaDe(cargo)

      expect(Math.abs(cajaPanel.y - cajaTarjeta.y), `tarjeta ${indice}: el panel arranca arriba`).toBeLessThanOrEqual(1)
      expect(
        Math.abs(cajaPanel.width / cajaPanel.height - PROPORCION_CUATRO_A_TRES),
        `tarjeta ${indice}: panel 4:3`,
      ).toBeLessThanOrEqual(TOLERANCIA_PROPORCION)
      await expect(panel.locator('img')).toHaveCount(0)
      await expect(avatar).toHaveText(/^[A-ZÁÉÍÓÚÑ]{1,2}$/)
      expect(
        Math.abs(centroHorizontal(cajaAvatar) - centroHorizontal(cajaPanel)),
        `tarjeta ${indice}: avatar centrado en X`,
      ).toBeLessThanOrEqual(TOLERANCIA_PX)
      expect(
        Math.abs(centroVertical(cajaAvatar) - centroVertical(cajaPanel)),
        `tarjeta ${indice}: avatar centrado en Y`,
      ).toBeLessThanOrEqual(TOLERANCIA_PX)
      expect(cajaNombre.y, `tarjeta ${indice}: el nombre va bajo el panel`).toBeGreaterThanOrEqual(
        cajaPanel.y + cajaPanel.height,
      )
      expect(cajaCargo.y, `tarjeta ${indice}: el cargo va bajo el nombre`).toBeGreaterThanOrEqual(
        cajaNombre.y + cajaNombre.height - 1,
      )
    }
  })
})

test.describe('@s3 de fidelidad_equipo: botón circular «+» solo con formación publicada', () => {
  test('la única tarjeta con formación lleva el «+» circular con aria-expanded que revela su formación; la otra no tiene botón; nadie pinta chips', async ({
    page,
  }) => {
    const seccion = await cargarEquipo(page, ANCHO_ESCRITORIO_PX)
    const conFormacion = seccion.locator('article', { hasText: 'Marcos Pérez' })
    const sinFormacion = seccion.locator('article', { hasText: 'Joaquín Herranz' })
    const boton = conFormacion.getByRole('button')

    await expect(seccion.getByRole('button')).toHaveCount(1)
    await expect(sinFormacion.getByRole('button')).toHaveCount(0)
    await expect(boton).toHaveAttribute('aria-expanded', 'false')
    await expect(boton.locator('[aria-hidden="true"]')).toHaveText('+')

    const cajaBoton = await cajaDe(boton)
    expect(Math.abs(cajaBoton.width - cajaBoton.height), 'el botón es un círculo: ancho = alto').toBeLessThanOrEqual(1)
    expect(await boton.evaluate((elemento) => getComputedStyle(elemento).borderRadius)).toBe('50%')

    await boton.click()
    await expect(boton).toHaveAttribute('aria-expanded', 'true')
    await expect(conFormacion.locator('[data-equipo-ficha]')).toBeVisible()
    await expect(conFormacion.locator('[data-equipo-ficha]')).toContainText(
      'Licenciado en veterinaria por la Universidad Complutense de Madrid',
    )

    // Chips de especialidad: ninguna `ul` mientras la fuente única no publique el dato.
    await expect(seccion.locator('ul')).toHaveCount(0)
  })
})

test.describe('@s4 de fidelidad_equipo: apilado en móvil sin desbordar', () => {
  test('a 320px cada tarjeta cabe entera en la ventana y el documento no desborda en horizontal', async ({ page }) => {
    const seccion = await cargarEquipo(page, ANCHO_MOVIL_MINIMO_PX)
    const tarjetas = seccion.locator('article')
    await expect(tarjetas).toHaveCount(EQUIPO.length)

    const cajas = await tarjetas.evaluateAll((elementos) =>
      elementos.map((elemento) => {
        const { x, y, width, height } = elemento.getBoundingClientRect()
        return { x, y, width, height }
      }),
    )
    for (const [indice, caja] of cajas.entries()) {
      expect(caja.x, `tarjeta ${indice}: borde izquierdo dentro`).toBeGreaterThanOrEqual(0)
      expect(caja.x + caja.width, `tarjeta ${indice}: borde derecho dentro`).toBeLessThanOrEqual(
        ANCHO_MOVIL_MINIMO_PX + TOLERANCIA_PX,
      )
      expect(caja.x, `tarjeta ${indice}: apilada en la misma columna`).toBeCloseTo(cajas[0]?.x ?? 0, 0)
    }

    const dimensiones = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }))
    expect(dimensiones.documento).toBeLessThanOrEqual(dimensiones.ventana + TOLERANCIA_PX)
  })
})
