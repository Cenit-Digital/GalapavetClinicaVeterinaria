// `features/fidelidad_contacto.feature` (34): la sección de contacto medida
// sobre `dist/` en navegador real. Mismo patrón que el resto de
// `tests/e2e/fidelidad-*.spec.ts`: geometría por `getBoundingClientRect`,
// colores por sonda de tokens, datos por la fuente única.
import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const TOLERANCIA_PX = 1
/** Relleno vertical de la banda de urgencias: `espaciado(24)` de `_api.scss` (literal a propósito: nivel C, fuera de `src/`). */
const RELLENO_DE_BANDA_PX = 24

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

/** Color computado que la variante activa da a un token: sonda sobre un elemento efímero (mismo recurso que `fidelidad-lienzo.spec.ts`). */
async function colorDelToken(page: Page, token: string): Promise<string> {
  return page.evaluate((nombre) => {
    const sonda = document.createElement('div')
    document.body.append(sonda)
    sonda.style.backgroundColor = `var(${nombre})`
    const color = getComputedStyle(sonda).backgroundColor
    sonda.remove()
    return color
  }, token)
}

test.describe('@s3 de fidelidad_contacto: la tarjeta de urgencias comunica solo el servicio real fuera de horario', () => {
  test('banda con el fondo de urgencia, el rótulo y teléfono reales, y la píldora blanca de llamada', async ({ page }) => {
    const contacto = await cargarContacto(page, ANCHO_ESCRITORIO_PX)
    const tarjeta = contacto.locator('[data-tarjeta-de="urgencia"]')
    const grupo = tarjeta.getByRole('group', { name: 'Urgencias fuera de horario' })
    const [fondoUrgencia, blanco] = await Promise.all([colorDelToken(page, '--color-urgencia'), colorDelToken(page, '--color-sobre-primario')])

    await expect(tarjeta).toHaveCSS('background-color', fondoUrgencia)
    await expect(tarjeta).toHaveCSS('border-left-width', '0px')
    await expect(grupo.locator('legend')).toHaveText('Urgencias fuera de horario')

    // El número real queda visible en un párrafo y la píldora blanca nombra la
    // acción (informacion_contacto @s5/@s6 enmendados el 03/09/2026, Enmienda 7
    // de `progress/fidelidad/enmiendas_fidelidad_contacto.md`); la prohibición
    // de anunciar 24 h se mantiene.
    const enlaces = grupo.getByRole('link')
    await expect(enlaces).toHaveCount(1)
    const pildora = enlaces.first()
    const numero = grupo.locator('p')
    await expect(pildora).toHaveAttribute('href', /^tel:\+34\d{9}$/)
    await expect(pildora).toHaveText('Llamar ahora')
    await expect(numero).toHaveText('91 851 13 93')
    await expect(pildora).toHaveCSS('background-color', blanco)
    await expect(pildora).toHaveCSS('color', fondoUrgencia)
    await expect(contacto.getByRole('link', { name: 'Llamar ahora' })).toHaveCount(1)

    // Anatomía del prototipo (`delta_contacto.md`, contacto-4): rótulo y número
    // apilados a la izquierda, alineados por su borde izquierdo; la píldora a la
    // derecha del número; todo en UNA fila, así que la banda no mide más que la
    // píldora más su relleno vertical (espaciado(24) arriba y abajo).
    const [cajaRotulo, cajaNumero, cajaPildora, cajaTarjeta] = await Promise.all([
      cajaDe(grupo.locator('legend')),
      cajaDe(numero),
      cajaDe(pildora),
      cajaDe(tarjeta),
    ])
    expect(cajaNumero.y).toBeGreaterThanOrEqual(cajaRotulo.y + cajaRotulo.height)
    expect(Math.abs(cajaNumero.x - cajaRotulo.x)).toBeLessThanOrEqual(TOLERANCIA_PX)
    expect(cajaNumero.x + cajaNumero.width).toBeLessThanOrEqual(cajaPildora.x)
    expect(cajaPildora.y).toBeGreaterThanOrEqual(cajaTarjeta.y)
    expect(cajaPildora.y + cajaPildora.height).toBeLessThanOrEqual(cajaTarjeta.y + cajaTarjeta.height)
    expect(cajaPildora.height).toBeGreaterThanOrEqual(44)
    expect(cajaTarjeta.height).toBeLessThanOrEqual(cajaPildora.height + 2 * RELLENO_DE_BANDA_PX + TOLERANCIA_PX)

    // La píldora es pequeña y en negrita; el número es el elemento grande de la banda.
    const tamanoDeFuente = (locator: Locator): Promise<number> =>
      locator.evaluate((elemento) => Number.parseFloat(getComputedStyle(elemento).fontSize))
    const [fuentePildora, fuenteNumero] = await Promise.all([tamanoDeFuente(pildora), tamanoDeFuente(numero)])
    expect(fuentePildora).toBeLessThan(fuenteNumero)
    await expect(pildora).toHaveCSS('font-weight', '700')

    await expect(contacto).not.toContainText(/24 h|24h|24 horas|todos los días|siempre hay alguien/i)
  })
})

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

test.describe('@s5 de fidelidad_contacto: el contacto se apila en móvil sin desbordar', () => {
  test('a 320px el formulario precede a la columna de urgencias y datos, y el documento no desborda', async ({ page }) => {
    const contacto = await cargarContacto(page, 320)
    const [cajaFormulario, cajaInformacion] = await Promise.all([
      cajaDe(contacto.getByRole('form', { name: 'Escríbenos' })),
      cajaDe(contacto.getByRole('region', { name: 'Información de contacto' })),
    ])
    expect(cajaFormulario.y + cajaFormulario.height).toBeLessThanOrEqual(cajaInformacion.y + TOLERANCIA_PX)

    const dimensiones = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }))
    expect(dimensiones.documento).toBeLessThanOrEqual(dimensiones.ventana)
    for (const tarjeta of ['[data-tarjeta-de="urgencia"]', '[data-tarjeta-de="datos"]']) {
      expect(await contacto.locator(tarjeta).evaluate((elemento) => elemento.scrollWidth <= elemento.clientWidth), tarjeta).toBe(true)
    }

    // Banda estrecha: la banda se pliega como el `flex-wrap` del prototipo —
    // el número sigue en UNA línea (más bajo que la píldora) y la píldora baja
    // debajo del número, alineada con su borde izquierdo, en vez de partir el
    // número en dos líneas para hacerle sitio.
    const urgencia = contacto.locator('[data-tarjeta-de="urgencia"]')
    const [cajaNumero, cajaPildora] = await Promise.all([cajaDe(urgencia.locator('p')), cajaDe(urgencia.getByRole('link'))])
    expect(cajaNumero.height).toBeLessThan(cajaPildora.height)
    expect(cajaPildora.y).toBeGreaterThanOrEqual(cajaNumero.y + cajaNumero.height)
    expect(Math.abs(cajaPildora.x - cajaNumero.x)).toBeLessThanOrEqual(TOLERANCIA_PX)
  })
})
