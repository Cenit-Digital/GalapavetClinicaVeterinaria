import { expect, test, type Locator, type Page } from 'playwright/test'
import { SERVICIOS } from '../../src/data/servicios'
import { datosNegocio } from '../../src/lib/site'
import { SUBPATH_DE_PRODUCCION } from './rutas'
import { colorComputadoAHex, esTransparente } from './utilidades'

// `features/fidelidad_reserva.feature` (feature 32): lo que aquí se mide es la
// geometría PINTADA por el navegador real sobre `dist/`. Los literales
// (nombres, destinos, tramos de horario) van tecleados a mano, con doble
// anclaje contra la fuente única (`datosNegocio`, `SERVICIOS`) para que un
// cambio de datos deje el test en rojo en vez de pasar por vacuidad.

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_MOVIL_MINIMO_PX = 320
const ALTO_VENTANA_PX = 900
const TOLERANCIA_PX = 2
const ALTURA_MINIMA_TARJETA_PX = 470
const AREA_TACTIL_MINIMA_PX = 44
const RELLENO_LATERAL_MINIMO_PX = 16
const AVATAR_PX = 40
const SELECTOR_WIDGET = 'fieldset[aria-label="Asistente de reserva de Galapavet"]'
const SELECTOR_CHIPS = 'fieldset[aria-label="Respuestas rápidas"] button'

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

function centroVertical(caja: Caja): number {
  return caja.y + caja.height / 2
}

function bordeInferior(caja: Caja): number {
  return caja.y + caja.height
}

async function cargarReserva(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: ALTO_VENTANA_PX })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('#reservar section[data-contenedor-principal]')
}

/** El hexadecimal (en mayúsculas) que la variante activa declara para un token de color. */
async function tokenDeColor(page: Page, token: string): Promise<string> {
  const valor = await page.evaluate((nombre) => getComputedStyle(document.documentElement).getPropertyValue(nombre), token)
  return valor.trim().toUpperCase()
}

async function fondoDe(locator: Locator): Promise<string> {
  return locator.evaluate((elemento) => getComputedStyle(elemento).backgroundColor)
}

async function noDesbordaEnHorizontal(page: Page): Promise<void> {
  const dimensiones = await page.evaluate(() => ({
    documento: document.documentElement.scrollWidth,
    ventana: window.innerWidth,
  }))
  expect(dimensiones.documento).toBeLessThanOrEqual(dimensiones.ventana + TOLERANCIA_PX)
}

test.describe('@s1 de fidelidad_reserva: dos columnas equilibradas en escritorio', () => {
  test('a 1440px el bloque informativo y la tarjeta comparten fila, la tarjeta mide al menos 470px y ambos se centran verticalmente', async ({
    page,
  }) => {
    const seccion = await cargarReserva(page, ANCHO_ESCRITORIO_PX)
    const informacion = seccion.locator('[data-reserva-informacion]')
    const tarjeta = seccion.locator(SELECTOR_WIDGET)

    const cajaInformacion = await cajaDe(informacion)
    const cajaTarjeta = await cajaDe(tarjeta)

    expect(cajaTarjeta.x, 'la tarjeta va a la derecha del bloque informativo').toBeGreaterThanOrEqual(
      cajaInformacion.x + cajaInformacion.width,
    )
    expect(cajaTarjeta.y, 'comparten fila').toBeLessThan(bordeInferior(cajaInformacion))
    expect(bordeInferior(cajaTarjeta), 'comparten fila').toBeGreaterThan(cajaInformacion.y)
    expect(cajaTarjeta.height).toBeGreaterThanOrEqual(ALTURA_MINIMA_TARJETA_PX)
    expect(
      Math.abs(centroVertical(cajaInformacion) - centroVertical(cajaTarjeta)),
      'la tarjeta se alinea verticalmente con el bloque informativo',
    ).toBeLessThanOrEqual(TOLERANCIA_PX)
  })
})

test.describe('@s2 de fidelidad_reserva: los dos canales confirmados de la fuente única', () => {
  test('"WhatsApp" hacia el wa.me del móvil y "Llamar a la clínica" hacia el tel: de la clínica, en una fila, con relleno, de al menos 44px y sin desbordar su texto', async ({
    page,
  }) => {
    const seccion = await cargarReserva(page, ANCHO_ESCRITORIO_PX)
    const enlaces = seccion.locator('[data-reserva-acciones] a')
    await expect(enlaces).toHaveCount(2)

    // Doble anclaje: destinos tecleados a mano y confrontados con la fuente única.
    expect(datosNegocio.telefonoMovil.enlaceMensajeria()).toBe('https://wa.me/34685343149')
    expect(datosNegocio.telefonoClinica.enlaceLlamada).toBe('tel:+34910829267')
    await expect(enlaces.nth(0)).toHaveText('WhatsApp')
    await expect(enlaces.nth(0)).toHaveAttribute('href', 'https://wa.me/34685343149')
    await expect(enlaces.nth(1)).toHaveText('Llamar a la clínica')
    await expect(enlaces.nth(1)).toHaveAttribute('href', 'tel:+34910829267')

    const cajas = [await cajaDe(enlaces.nth(0)), await cajaDe(enlaces.nth(1))] as const
    expect(Math.abs(cajas[0].y - cajas[1].y), 'los dos enlaces comparten fila').toBeLessThanOrEqual(TOLERANCIA_PX)
    for (const [indice, caja] of cajas.entries()) {
      const enlace = enlaces.nth(indice)
      expect(caja.height, `enlace ${indice}: alto`).toBeGreaterThanOrEqual(AREA_TACTIL_MINIMA_PX)
      expect(caja.width, `enlace ${indice}: ancho`).toBeGreaterThanOrEqual(AREA_TACTIL_MINIMA_PX)
      const relleno = await enlace.evaluate((elemento) => Number.parseFloat(getComputedStyle(elemento).paddingInlineStart))
      expect(relleno, `enlace ${indice}: relleno lateral`).toBeGreaterThanOrEqual(RELLENO_LATERAL_MINIMO_PX)
      expect(
        await enlace.evaluate((elemento) => elemento.scrollWidth <= elemento.clientWidth),
        `enlace ${indice}: no desborda su texto`,
      ).toBe(true)
    }

    // El primero es el botón relleno del sistema (primario); el segundo, de contorno.
    const fondoPrimero = await fondoDe(enlaces.nth(0))
    expect(esTransparente(fondoPrimero)).toBe(false)
    expect(colorComputadoAHex(fondoPrimero)).toBe(await tokenDeColor(page, '--color-primario'))
    expect(esTransparente(await fondoDe(enlaces.nth(1)))).toBe(true)
  })
})

test.describe('@s3 de fidelidad_reserva: la lista con marcas reproduce solo los tres tramos de horario reales', () => {
  test('bajo las acciones hay exactamente los tres tramos publicados, cada uno con una marca decorativa fuera de su texto, y ninguna promesa', async ({
    page,
  }) => {
    const seccion = await cargarReserva(page, ANCHO_ESCRITORIO_PX)
    const lista = seccion.locator('[data-reserva-horario]')
    const tramos = lista.locator('li')

    expect(datosNegocio.horario).toHaveLength(3)
    await expect(tramos).toHaveText([
      'Lunes a viernes: 11:00 a 14:00 y 16:30 a 20:00',
      'Sábados: 11:00 a 14:00',
      'Domingos: Cerrado',
    ])

    const cajaAcciones = await cajaDe(seccion.locator('[data-reserva-acciones]'))
    const cajaLista = await cajaDe(lista)
    expect(cajaLista.y, 'la lista va bajo las acciones').toBeGreaterThanOrEqual(bordeInferior(cajaAcciones))

    const total = await tramos.count()
    for (let indice = 0; indice < total; indice += 1) {
      const marca = await tramos.nth(indice).evaluate((tramo) => {
        const estilo = getComputedStyle(tramo, '::before')
        return {
          contenido: estilo.content,
          ancho: Number.parseFloat(estilo.width),
          alto: Number.parseFloat(estilo.height),
          fondo: estilo.backgroundColor,
        }
      })
      expect(marca.contenido, `tramo ${indice}: la marca es un pseudoelemento`).toContain('✓')
      expect(marca.ancho, `tramo ${indice}: marca circular`).toBeCloseTo(marca.alto, 0)
      expect(esTransparente(marca.fondo), `tramo ${indice}: marca con relleno`).toBe(false)
      expect(await tramos.nth(indice).innerText(), `tramo ${indice}: la marca no entra en el texto`).not.toContain('✓')
    }

    const textoDeLaSeccion = await seccion.innerText()
    expect(textoDeLaSeccion).not.toMatch(/en menos de|Recordatorio|sin coste|24 ?h|en línea/i)
  })
})

test.describe('@s4 de fidelidad_reserva: tres bandas y controles accesibles de la tarjeta', () => {
  test('cabecera con avatar circular primario de 40px, historial con burbujas por autor y pie con chips, campo píldora y botón redondo "Enviar respuesta", todos de al menos 44px', async ({
    page,
  }) => {
    const seccion = await cargarReserva(page, ANCHO_ESCRITORIO_PX)
    const widget = seccion.locator(SELECTOR_WIDGET)
    const cabecera = widget.locator('fieldset[aria-label="Cabecera del chat"]')
    const historial = widget.locator('[role="log"]')
    const pie = widget.locator('[data-reserva-pie]')
    const primario = await tokenDeColor(page, '--color-primario')

    // Banda 1: cabecera pegada arriba, con avatar, nombre real y estado.
    const cajaWidget = await cajaDe(widget)
    const cajaCabecera = await cajaDe(cabecera)
    expect(Math.abs(cajaCabecera.y - cajaWidget.y)).toBeLessThanOrEqual(TOLERANCIA_PX)
    const avatar = cabecera.locator('span[aria-hidden="true"]').first()
    const cajaAvatar = await cajaDe(avatar)
    expect(cajaAvatar.width).toBeCloseTo(AVATAR_PX, 0)
    expect(cajaAvatar.height).toBeCloseTo(AVATAR_PX, 0)
    expect(await avatar.evaluate((elemento) => getComputedStyle(elemento).borderRadius)).toBe('50%')
    expect(colorComputadoAHex(await fondoDe(avatar))).toBe(primario)
    await expect(avatar).toHaveText('G')
    await expect(cabecera).toContainText('Galapavet')
    await expect(cabecera).toContainText('Disponible')
    await expect(cabecera).not.toContainText('en línea')

    // Banda 3: pie pegado abajo, con los chips de al menos 44px y el aviso.
    const cajaPie = await cajaDe(pie)
    expect(Math.abs(bordeInferior(cajaPie) - bordeInferior(cajaWidget))).toBeLessThanOrEqual(TOLERANCIA_PX)
    await expect(pie).toContainText('Demostración: esta solicitud no se envía a ningún servidor.')
    const chips = pie.locator(SELECTOR_CHIPS)
    await expect(chips).toHaveCount(SERVICIOS.length + 1)
    for (let indice = 0; indice < SERVICIOS.length + 1; indice += 1) {
      const cajaChip = await cajaDe(chips.nth(indice))
      expect(cajaChip.height, `chip ${indice}`).toBeGreaterThanOrEqual(AREA_TACTIL_MINIMA_PX)
      expect(await chips.nth(indice).evaluate((elemento) => getComputedStyle(elemento).borderRadius)).toBe('999px')
    }

    // Banda 2: entre ambas, el historial; tras responder, burbujas distinguibles por autor.
    const cajaHistorial = await cajaDe(historial)
    expect(cajaHistorial.y).toBeGreaterThanOrEqual(bordeInferior(cajaCabecera) - TOLERANCIA_PX)
    expect(bordeInferior(cajaHistorial)).toBeLessThanOrEqual(cajaPie.y + TOLERANCIA_PX)

    await chips.first().click()
    const burbujas = historial.locator('p')
    await expect(burbujas).toHaveCount(3)
    const pintado = await burbujas.evaluateAll((elementos) =>
      elementos.map((elemento) => ({
        autor: elemento.getAttribute('data-autor'),
        lado: getComputedStyle(elemento).alignSelf,
        fondo: getComputedStyle(elemento).backgroundColor,
        texto: elemento.textContent ?? '',
      })),
    )
    expect(pintado.map((burbuja) => burbuja.autor)).toEqual(['asistente', 'visitante', 'asistente'])
    expect(pintado.map((burbuja) => burbuja.lado)).toEqual(['flex-start', 'flex-end', 'flex-start'])
    expect(colorComputadoAHex(pintado[1]!.fondo)).toBe(primario)
    expect(colorComputadoAHex(pintado[0]!.fondo)).not.toBe(primario)
    expect(pintado[1]!.texto).toMatch(/^Tú: /)
    expect(pintado[0]!.texto).toMatch(/^Asistente: /)

    // Paso de texto libre: campo píldora y botón redondo en la misma fila.
    const campo = widget.getByRole('textbox', { name: 'Tu respuesta' })
    const boton = widget.getByRole('button', { name: 'Enviar respuesta' })
    const cajaCampo = await cajaDe(campo)
    const cajaBoton = await cajaDe(boton)
    expect(cajaCampo.height).toBeGreaterThanOrEqual(AREA_TACTIL_MINIMA_PX)
    expect(cajaBoton.height).toBeGreaterThanOrEqual(AREA_TACTIL_MINIMA_PX)
    expect(cajaBoton.width).toBeGreaterThanOrEqual(AREA_TACTIL_MINIMA_PX)
    expect(Math.abs(cajaBoton.width - cajaBoton.height), 'el botón de envío es redondo').toBeLessThanOrEqual(1)
    expect(await boton.evaluate((elemento) => getComputedStyle(elemento).borderRadius)).toBe('50%')
    expect(await campo.evaluate((elemento) => getComputedStyle(elemento).borderRadius)).toBe('999px')
    expect(Math.abs(centroVertical(cajaCampo) - centroVertical(cajaBoton)), 'campo y botón en la misma fila').toBeLessThanOrEqual(
      TOLERANCIA_PX,
    )
    expect(cajaBoton.x).toBeGreaterThanOrEqual(cajaCampo.x + cajaCampo.width)
    await expect(boton.locator('[aria-hidden="true"]')).toHaveText('→')
  })
})

test.describe('@s5 de fidelidad_reserva: apilado en móvil sin perder los canales ni el chat', () => {
  test('a 320px los canales reales aparecen antes de la tarjeta en el orden de lectura y el documento no desborda, tampoco en el paso de texto', async ({
    page,
  }) => {
    const seccion = await cargarReserva(page, ANCHO_MOVIL_MINIMO_PX)
    const acciones = seccion.locator('[data-reserva-acciones]')
    const widget = seccion.locator(SELECTOR_WIDGET)
    await expect(acciones.locator('a')).toHaveCount(2)

    const cajaAcciones = await cajaDe(acciones)
    const cajaWidget = await cajaDe(widget)
    expect(bordeInferior(cajaAcciones), 'los canales van antes que la tarjeta').toBeLessThanOrEqual(cajaWidget.y + TOLERANCIA_PX)
    expect(Math.abs(cajaAcciones.x - cajaWidget.x), 'apilados en la misma columna').toBeLessThanOrEqual(TOLERANCIA_PX)
    expect(cajaWidget.x).toBeGreaterThanOrEqual(0)
    expect(cajaWidget.x + cajaWidget.width).toBeLessThanOrEqual(ANCHO_MOVIL_MINIMO_PX + TOLERANCIA_PX)
    await noDesbordaEnHorizontal(page)

    await widget.locator(SELECTOR_CHIPS).first().click()
    const cajaFila = await cajaDe(widget.locator('[data-reserva-fila-de-texto]'))
    expect(cajaFila.x + cajaFila.width).toBeLessThanOrEqual(ANCHO_MOVIL_MINIMO_PX + TOLERANCIA_PX)
    await noDesbordaEnHorizontal(page)
  })
})
