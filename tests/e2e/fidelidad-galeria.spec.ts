import { expect, test, type Locator, type Page } from 'playwright/test'
import { GALERIA } from '../../src/data/galeria'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_MOVIL_PX = 320
const TOLERANCIA_PX = 1
const LADO_DEL_CONTROL_PX = 48
// = `espaciado(16)`, el lado del svg de cada control (`Galeria.module.scss`).
const LADO_DE_LA_FLECHA_PX = 16
const NOMBRE_DE_LA_PISTA = 'Fotografías de la galería'
// Literal cerrado de `galeria.feature` @s12, tecleado a mano: el aviso no se
// importa del componente para que un cambio accidental del texto se note aquí.
const AVISO_DEMOSTRACION =
  'Contenido de demostración. Estas fotografías y sus pies son de ejemplo, no fotografías reales de pacientes de Galapavet: la clínica todavía no ha cedido fotografías propias ni el consentimiento de las familias fotografiadas.'

interface Caja {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

async function cargarGaleria(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('#galeria [data-galeria-contenido]')
}

function pistaDe(seccion: Locator): Locator {
  return seccion.getByRole('group', { name: NOMBRE_DE_LA_PISTA })
}

async function cajaDe(locator: Locator): Promise<Caja> {
  const caja = await locator.boundingBox()
  if (caja === null) throw new Error('el elemento no tiene caja visible')
  return caja
}

function bordeDerecho(caja: Caja): number {
  return caja.x + caja.width
}

/** Resuelve un token de color tal y como lo pinta el navegador en la variante activa. */
async function colorResuelto(page: Page, token: string): Promise<string> {
  return page.evaluate((nombre) => {
    const sonda = document.createElement('div')
    document.body.append(sonda)
    sonda.style.backgroundColor = `var(${nombre})`
    const color = getComputedStyle(sonda).backgroundColor
    sonda.remove()
    return color
  }, token)
}

test.describe('@s1 de fidelidad_galeria: cabecera con aviso y controles a la derecha', () => {
  test('a 1440px hay cintillo y titular "Galería", el aviso íntegro y dos botones circulares de 48px a la derecha de la cabecera', async ({ page }) => {
    const seccion = await cargarGaleria(page, ANCHO_ESCRITORIO_PX)
    const cabecera = seccion.locator('[data-galeria-cabecera]')
    const titular = cabecera.getByRole('heading', { level: 2 })

    await expect(cabecera.locator('[data-galeria-cintillo]')).toHaveText('Galería')
    await expect(titular).toHaveText('Galería')
    await expect(seccion.locator('#galeria-aviso-demostracion')).toHaveText(AVISO_DEMOSTRACION)
    await expect(seccion).toHaveAttribute('aria-describedby', 'galeria-aviso-demostracion')

    const cajaCabecera = await cajaDe(cabecera)
    const cajaTitular = await cajaDe(titular)
    const cajaTitularServicios = await cajaDe(page.locator('#servicios h2').first())
    expect(Math.abs(cajaTitular.x - cajaTitularServicios.x)).toBeLessThanOrEqual(TOLERANCIA_PX)

    for (const nombre of ['Foto anterior', 'Foto siguiente']) {
      const boton = seccion.getByRole('button', { name: nombre })
      const cajaBoton = await cajaDe(boton)
      expect(Math.abs(cajaBoton.width - LADO_DEL_CONTROL_PX), `${nombre}: ancho`).toBeLessThanOrEqual(TOLERANCIA_PX)
      expect(Math.abs(cajaBoton.height - LADO_DEL_CONTROL_PX), `${nombre}: alto`).toBeLessThanOrEqual(TOLERANCIA_PX)
      expect(await boton.evaluate((elemento) => getComputedStyle(elemento).borderTopLeftRadius), `${nombre}: radio`).toBe('50%')
      expect(cajaBoton.x, `${nombre}: a la derecha del titular`).toBeGreaterThan(bordeDerecho(cajaTitular))
      expect(cajaBoton.y, `${nombre}: dentro de la cabecera`).toBeGreaterThanOrEqual(cajaCabecera.y - TOLERANCIA_PX)
      expect(cajaBoton.y + cajaBoton.height, `${nombre}: dentro de la cabecera`).toBeLessThanOrEqual(
        cajaCabecera.y + cajaCabecera.height + TOLERANCIA_PX,
      )

      // La flecha es un svg decorativo PINTADO (caja de 16×16 dentro del
      // botón), no un glifo de texto: la fuente autoalojada no trae "← →".
      const flecha = boton.locator('svg[aria-hidden="true"]')
      await expect(flecha, `${nombre}: una flecha decorativa`).toHaveCount(1)
      const cajaFlecha = await cajaDe(flecha)
      expect(Math.abs(cajaFlecha.width - LADO_DE_LA_FLECHA_PX), `${nombre}: ancho de la flecha`).toBeLessThanOrEqual(TOLERANCIA_PX)
      expect(Math.abs(cajaFlecha.height - LADO_DE_LA_FLECHA_PX), `${nombre}: alto de la flecha`).toBeLessThanOrEqual(TOLERANCIA_PX)
      expect(cajaFlecha.x, `${nombre}: flecha dentro del botón`).toBeGreaterThanOrEqual(cajaBoton.x)
      expect(bordeDerecho(cajaFlecha), `${nombre}: flecha dentro del botón`).toBeLessThanOrEqual(bordeDerecho(cajaBoton))
      expect(cajaFlecha.y, `${nombre}: flecha dentro del botón`).toBeGreaterThanOrEqual(cajaBoton.y)
      expect(cajaFlecha.y + cajaFlecha.height, `${nombre}: flecha dentro del botón`).toBeLessThanOrEqual(cajaBoton.y + cajaBoton.height)
    }
    const cajaSiguiente = await cajaDe(seccion.getByRole('button', { name: 'Foto siguiente' }))
    expect(Math.abs(bordeDerecho(cajaSiguiente) - bordeDerecho(cajaCabecera))).toBeLessThanOrEqual(TOLERANCIA_PX)

    // La pista sangra por la derecha, pero su primera tarjeta arranca donde
    // arranca la cabecera (el prototipo la pegaba a x = 0 por el anclaje
    // "mandatory" sin "scroll-padding": defecto que no se hereda).
    const cajaPrimeraTarjeta = await cajaDe(seccion.locator('figure').first())
    expect(Math.abs(cajaPrimeraTarjeta.x - cajaCabecera.x)).toBeLessThanOrEqual(TOLERANCIA_PX)
    const cajaPista = await cajaDe(pistaDe(seccion))
    expect(cajaPista.x).toBeCloseTo(0, 0)
    expect(Math.abs(bordeDerecho(cajaPista) - ANCHO_ESCRITORIO_PX)).toBeLessThanOrEqual(TOLERANCIA_PX)
  })
})

test.describe('@s2 de fidelidad_galeria: tarjetas con dos líneas de contexto', () => {
  test('las seis fotografías locales van en tarjetas con superficie, borde y radio, con nombre y pie separados, y la pista recibe el foco por teclado', async ({ page }) => {
    const seccion = await cargarGaleria(page, ANCHO_ESCRITORIO_PX)
    const figuras = seccion.locator('figure')
    await expect(figuras).toHaveCount(GALERIA.length)
    const superficie = await colorResuelto(page, '--color-superficie')

    for (const [indice, entrada] of GALERIA.entries()) {
      const figura = figuras.nth(indice)
      await expect(figura.locator('img')).toHaveAttribute('alt', entrada.nombre)
      await expect(figura.locator('figcaption [data-galeria-nombre]')).toHaveText(entrada.nombre)
      await expect(figura.locator('figcaption [data-galeria-pie]')).toHaveText(entrada.pie)
      const estilo = await figura.evaluate((elemento) => {
        const computado = getComputedStyle(elemento)
        return {
          fondo: computado.backgroundColor,
          estiloDeBorde: computado.borderTopStyle,
          anchoDeBorde: Number.parseFloat(computado.borderTopWidth),
          radio: Number.parseFloat(computado.borderTopLeftRadius),
        }
      })
      expect(estilo.fondo, `${entrada.nombre}: superficie`).toBe(superficie)
      expect(estilo.estiloDeBorde, `${entrada.nombre}: borde`).not.toBe('none')
      expect(estilo.anchoDeBorde, `${entrada.nombre}: borde`).toBeGreaterThan(0)
      expect(estilo.radio, `${entrada.nombre}: radio`).toBeGreaterThan(0)
    }

    await seccion.getByRole('button', { name: 'Foto siguiente' }).focus()
    await page.keyboard.press('Tab')
    expect(await pistaDe(seccion).evaluate((elemento) => elemento === document.activeElement)).toBe(true)
  })
})

test.describe('@s3 de fidelidad_galeria: los controles desplazan una tarjeta exacta', () => {
  test('"Foto siguiente" avanza ancho + separación al instante con movimiento reducido, "Foto anterior" lo deshace y no hay barra nativa', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const seccion = await cargarGaleria(page, ANCHO_ESCRITORIO_PX)
    const pista = pistaDe(seccion)

    const partida = await pista.evaluate((elemento) => {
      const primeraTarjeta = elemento.querySelector('figure')
      if (primeraTarjeta === null) throw new Error('la pista no tiene tarjetas')
      const computado = getComputedStyle(elemento)
      return {
        scrollLeft: elemento.scrollLeft,
        anchoDeTarjeta: primeraTarjeta.getBoundingClientRect().width,
        separacion: Number.parseFloat(computado.columnGap),
        barra: computado.getPropertyValue('scrollbar-width'),
        comportamiento: computado.scrollBehavior,
        cabenVarias: elemento.clientWidth > primeraTarjeta.getBoundingClientRect().width,
      }
    })
    expect(partida.scrollLeft).toBe(0)
    expect(partida.cabenVarias).toBe(true)
    expect(partida.barra).toBe('none')
    expect(partida.comportamiento).toBe('auto')

    await seccion.getByRole('button', { name: 'Foto siguiente' }).click()
    const trasSiguiente = await pista.evaluate((elemento) => elemento.scrollLeft)
    expect(Math.abs(trasSiguiente - (partida.anchoDeTarjeta + partida.separacion))).toBeLessThanOrEqual(TOLERANCIA_PX)

    await seccion.getByRole('button', { name: 'Foto anterior' }).click()
    expect(await pista.evaluate((elemento) => elemento.scrollLeft)).toBe(0)
  })
})

test.describe('@s4 de fidelidad_galeria: sangrado por la derecha sin ensanchar el móvil', () => {
  test('a 320px la cabecera sigue alineada con el contenedor, la pista llega al borde y se desplaza, y el documento no desborda', async ({ page }) => {
    const seccion = await cargarGaleria(page, ANCHO_MOVIL_PX)
    const cajaCabecera = await cajaDe(seccion.locator('[data-galeria-cabecera]'))
    const cajaContenedorServicios = await cajaDe(page.locator('#servicios > *'))
    expect(Math.abs(cajaCabecera.x - cajaContenedorServicios.x)).toBeLessThanOrEqual(TOLERANCIA_PX)

    const pista = pistaDe(seccion)
    await seccion.getByRole('button', { name: 'Foto siguiente' }).focus()
    await page.keyboard.press('Tab')
    expect(await pista.evaluate((elemento) => elemento === document.activeElement)).toBe(true)

    const medidas = await pista.evaluate((elemento) => {
      const { x, right } = elemento.getBoundingClientRect()
      return { x, derecha: right, scrollWidth: elemento.scrollWidth, clientWidth: elemento.clientWidth }
    })
    expect(medidas.x).toBeCloseTo(0, 0)
    expect(Math.abs(medidas.derecha - ANCHO_MOVIL_PX)).toBeLessThanOrEqual(TOLERANCIA_PX)
    expect(medidas.scrollWidth).toBeGreaterThan(medidas.clientWidth)

    const documento = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }))
    expect(documento.scrollWidth).toBeLessThanOrEqual(documento.ventana)
  })
})
