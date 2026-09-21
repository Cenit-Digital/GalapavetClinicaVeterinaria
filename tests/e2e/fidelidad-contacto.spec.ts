// `features/fidelidad_contacto.feature` (34): la sección de contacto medida
// sobre `dist/` en navegador real. Mismo patrón que el resto de
// `tests/e2e/fidelidad-*.spec.ts`: geometría por `getBoundingClientRect`,
// colores por sonda de tokens, datos por la fuente única.
import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const TOLERANCIA_PX = 1

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

async function cargarContacto(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('#contacto')
}

test.describe('@s1 de fidelidad_contacto: cabecera y dos columnas en escritorio', () => {
  test('a 1440px hay cintillo, titular y párrafo sin promesas, y el formulario y la información comparten fila', async ({ page }) => {
    const contacto = await cargarContacto(page, ANCHO_ESCRITORIO_PX)
    const cabecera = contacto.locator('[data-contacto-cabecera]')
    const cintillo = cabecera.locator('p').first()
    const titular = cabecera.getByRole('heading', { level: 2 })
    const parrafo = cabecera.locator('p').last()

    await expect(cintillo).toHaveText('Contacto')
    await expect(titular).not.toHaveText('Contacto')
    await expect(titular).toContainText('Galapagar')
    await expect(parrafo).not.toContainText(/urgencias|24 h|mismo día|guardia|paseo de casa/i)
    expect(await contacto.getByRole('heading', { name: 'Contacto' }).count()).toBe(0)

    // CLÁUSULA REUBICADA desde el @s3 retirado el 20/09/2026 (E1): no dependía
    // de la tarjeta —se afirma sobre la SECCIÓN entera— y es la única
    // comprobación en NAVEGADOR REAL de los reclamos prohibidos aquí;
    // `informacion_contacto` @s6 solo los caza en jsdom, sobre el panel aislado.
    await expect(contacto).not.toContainText(/24 h|24h|24 horas|todos los días|siempre hay alguien de guardia/i)

    const formulario = contacto.getByRole('form', { name: 'Escríbenos' })
    const informacion = contacto.getByRole('region', { name: 'Información de contacto' })
    const [cajaCabecera, cajaFormulario, cajaInformacion] = await Promise.all([
      cajaDe(cabecera),
      cajaDe(formulario),
      cajaDe(informacion),
    ])

    expect(cajaCabecera.y + cajaCabecera.height).toBeLessThanOrEqual(cajaFormulario.y)
    expect(Math.abs(cajaFormulario.y - cajaInformacion.y)).toBeLessThanOrEqual(TOLERANCIA_PX)
    expect(cajaFormulario.x + cajaFormulario.width).toBeLessThanOrEqual(cajaInformacion.x)
  })
})

test.describe('@s2 de fidelidad_contacto: la tarjeta «Escríbenos» conserva sus campos accesibles', () => {
  test('nombre y teléfono comparten fila; correo, motivo y mensaje y el botón ocupan el ancho de la tarjeta; etiquetas y validación siguen vigentes', async ({ page }) => {
    const contacto = await cargarContacto(page, ANCHO_ESCRITORIO_PX)
    const formulario = contacto.getByRole('form', { name: 'Escríbenos' })
    await expect(formulario.getByRole('heading', { name: 'Escríbenos', level: 3 })).toBeVisible()

    const nombre = formulario.locator('#formulario-contacto-nombre')
    const telefono = formulario.locator('#formulario-contacto-telefono')
    const [cajaNombre, cajaTelefono] = await Promise.all([cajaDe(nombre), cajaDe(telefono)])
    expect(Math.abs(cajaNombre.y - cajaTelefono.y)).toBeLessThanOrEqual(TOLERANCIA_PX)
    expect(cajaNombre.x + cajaNombre.width).toBeLessThanOrEqual(cajaTelefono.x)

    const anchoInterior = await formulario.evaluate((elemento) => elemento.clientWidth - Number.parseFloat(getComputedStyle(elemento).paddingLeft) - Number.parseFloat(getComputedStyle(elemento).paddingRight))
    for (const id of ['#formulario-contacto-email', '#formulario-contacto-motivo', '#formulario-contacto-mensaje']) {
      const caja = await cajaDe(formulario.locator(id))
      expect(Math.abs(caja.width - anchoInterior), id).toBeLessThanOrEqual(TOLERANCIA_PX)
    }
    const cajaBoton = await cajaDe(formulario.getByRole('button', { name: 'Enviar mensaje' }))
    expect(Math.abs(cajaBoton.width - anchoInterior)).toBeLessThanOrEqual(TOLERANCIA_PX)

    for (const id of [
      'formulario-contacto-nombre',
      'formulario-contacto-telefono',
      'formulario-contacto-email',
      'formulario-contacto-motivo',
      'formulario-contacto-mensaje',
      'formulario-contacto-acepta-aviso-legal',
    ]) {
      await expect(formulario.locator(`label[for="${id}"]`)).toHaveCount(1)
    }

    await formulario.getByRole('button', { name: 'Enviar mensaje' }).click()
    await expect(nombre).toHaveAttribute('aria-invalid', 'true')
    await expect(formulario).toBeVisible()
  })
})

// @s3 ELIMINADO el 20/09/2026 (E1, decisión de Pablo corroborada en la reunión
// del 16/08/2026, minutos 06:52-07:00): comprobaba la tarjeta roja de
// urgencias, que ya no existe. Su última cláusula —la prohibición de reclamos—
// vive ahora en @s1, arriba. Con él se va `colorDelToken`, la sonda que solo él
// usaba: era la ÚNICA lectura de `--color-urgencia` RESUELTO POR EL NAVEGADOR
// de todo el proyecto, y esa cobertura se pierde entera (ver la nota de @s3 en
// `features/fidelidad_contacto.feature`).

test.describe('@s4 de fidelidad_contacto: la tarjeta de datos usa un mapa local con pin y datos separados', () => {
  test('mapa local a sangre con pin y atribución visible; tres bloques con los datos reales; ninguna petición fuera del propio origen', async ({ page, baseURL }) => {
    const peticionesExternas: string[] = []
    const origenPropio = new URL(baseURL ?? 'http://localhost:4173').origin
    page.on('request', (peticion) => {
      if (new URL(peticion.url()).origin !== origenPropio) peticionesExternas.push(peticion.url())
    })

    const contacto = await cargarContacto(page, ANCHO_ESCRITORIO_PX)
    const informacion = contacto.getByRole('region', { name: 'Información de contacto' })
    const tarjeta = informacion.locator('[data-tarjeta-de="datos"]')
    const mapa = tarjeta.locator('[data-mapa-de-contacto] img')
    const pin = tarjeta.locator('[data-mapa-de-contacto] [aria-hidden="true"]')

    await expect(informacion.locator('iframe')).toHaveCount(0)
    await mapa.scrollIntoViewIfNeeded()
    await expect(mapa).toHaveAttribute('src', new RegExp(`^${SUBPATH_DE_PRODUCCION}/img/mapa/`))
    await expect(mapa).toHaveAttribute('alt', /Galapavet/)
    await expect.poll(() => mapa.evaluate((imagen: HTMLImageElement) => imagen.complete && imagen.naturalWidth > 0)).toBe(true)

    const [cajaTarjeta, cajaMapa, cajaPin] = await Promise.all([cajaDe(tarjeta), cajaDe(mapa), cajaDe(pin)])
    expect(Math.abs(cajaMapa.y - cajaTarjeta.y)).toBeLessThanOrEqual(TOLERANCIA_PX + 1)
    expect(Math.abs(cajaMapa.width - cajaTarjeta.width)).toBeLessThanOrEqual(TOLERANCIA_PX * 2)
    expect(cajaPin.x).toBeGreaterThan(cajaMapa.x)
    expect(cajaPin.x + cajaPin.width).toBeLessThan(cajaMapa.x + cajaMapa.width)
    expect(cajaPin.y).toBeGreaterThan(cajaMapa.y)
    expect(cajaPin.y + cajaPin.height).toBeLessThan(cajaMapa.y + cajaMapa.height)

    const atribucion = tarjeta.getByRole('link', { name: '© OpenStreetMap contributors' })
    await expect(atribucion).toBeVisible()
    await expect(atribucion).toHaveAttribute('href', 'https://www.openstreetmap.org/copyright')

    const rotulos = tarjeta.locator('legend')
    await expect(rotulos).toHaveText(['Dirección', 'Teléfonos', 'Horario'])
    await expect(tarjeta.getByRole('group', { name: 'Dirección' })).toContainText('Carretera de Torrelodones, 11')
    await expect(tarjeta.getByRole('group', { name: 'Dirección' })).toContainText('28260 Galapagar, Madrid')
    const telefonos = tarjeta.getByRole('group', { name: 'Teléfonos' }).getByRole('link')
    await expect(telefonos).toHaveText(['91 082 92 67', '685 34 31 49'])
    const [cajaPrimero, cajaSegundo] = await Promise.all([cajaDe(telefonos.nth(0)), cajaDe(telefonos.nth(1))])
    expect(cajaSegundo.y).toBeGreaterThanOrEqual(cajaPrimero.y + cajaPrimero.height)
    await expect(tarjeta.getByRole('group', { name: 'Horario' }).locator('dt')).toHaveText(['Lunes a viernes', 'Sábados', 'Domingos'])
    // Tres bloques en una rejilla de dos columnas: el último (impar) abarca la fila entera en vez de dejar una celda vacía.
    const [cajaDireccion, cajaHorario] = await Promise.all([
      cajaDe(tarjeta.getByRole('group', { name: 'Dirección' })),
      cajaDe(tarjeta.getByRole('group', { name: 'Horario' })),
    ])
    expect(cajaHorario.y).toBeGreaterThanOrEqual(cajaDireccion.y + cajaDireccion.height)
    expect(cajaHorario.width).toBeGreaterThan(cajaDireccion.width * 1.5)
    await expect(tarjeta).not.toContainText(/Miraflores|Ctra\. de la Sierra|@|24 h/i)

    await page.waitForLoadState('networkidle')
    expect(peticionesExternas).toEqual([])
  })
})

test.describe('@s5 de fidelidad_contacto: el contacto se apila en móvil sin desbordar sus tarjetas', () => {
  test('a 320px el formulario precede a la tarjeta de datos, ninguna tarjeta desborda su ancho y el documento tampoco', async ({ page }) => {
    const contacto = await cargarContacto(page, 320)
    const [cajaFormulario, cajaInformacion] = await Promise.all([
      cajaDe(contacto.getByRole('form', { name: 'Escríbenos' })),
      cajaDe(contacto.getByRole('region', { name: 'Información de contacto' })),
    ])
    expect(cajaFormulario.y + cajaFormulario.height).toBeLessThanOrEqual(cajaInformacion.y + TOLERANCIA_PX)

    const dimensiones = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }))
    expect(dimensiones.documento).toBeLessThanOrEqual(dimensiones.ventana)

    // ENMENDADO el 20/09/2026 (E1): el inventario se queda con UNA entrada al
    // retirarse la tarjeta de urgencias. Se CONSERVA como lista, y con su
    // recuento explícito, para que siga siendo evidente que se recorre un
    // inventario y no una caja suelta — y para que el bucle no pueda aprobar
    // por vacuidad si el selector dejara de casar.
    //
    // Lo que se pierde con la banda, dicho sin maquillar: la comprobación de su
    // plegado a 320 px (número encima, píldora debajo, alineados por la
    // izquierda). No se reubica en ningún sitio, porque no queda banda.
    const TARJETAS_DE_LA_SECCION = ['[data-tarjeta-de="datos"]']
    await expect(contacto.locator('[data-tarjeta-de]')).toHaveCount(TARJETAS_DE_LA_SECCION.length)

    let tarjetasComprobadas = 0
    for (const tarjeta of TARJETAS_DE_LA_SECCION) {
      await expect(contacto.locator(tarjeta)).toHaveCount(1)
      expect(await contacto.locator(tarjeta).evaluate((elemento) => elemento.scrollWidth <= elemento.clientWidth), tarjeta).toBe(true)
      tarjetasComprobadas += 1
    }
    expect(tarjetasComprobadas).toBeGreaterThan(0)
  })
})
