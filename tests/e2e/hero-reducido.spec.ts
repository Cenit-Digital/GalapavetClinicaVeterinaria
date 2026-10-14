// `features/hero_reducido_con_animacion.feature` @s2 (los datos que salen del
// hero siguen publicados en el resto de la portada) y @s12 (el hero es de
// pantalla completa). NAVEGADOR REAL con Playwright, fuera del gate de
// Vitest/Stryker (Decisión 11 de `project-spec.md`), sobre `dist/` servido por
// `vite preview` (`playwright.config.ts`).
//
// Ambos escenarios cargan la portada con la preferencia de movimiento declarada
// de forma EXPLÍCITA, nunca por omisión. Hoy el hero no anima nada, así que las
// medidas no tienen carrera; el paso de congelar el reloj de animaciones ANTES de
// navegar y colocarlas en su último instante (Given de @s12) lo añade la ola de la
// entrada animada, que es la que crea las animaciones que habría que congelar.
import { expect, test, type Locator, type Page } from 'playwright/test'
import { textoHorario } from '../../src/components/Faq-logica'
import { datosNegocio } from '../../src/lib/site'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const SELECTOR_DEL_HERO = '#inicio [data-a-sangre]'
const PREGUNTA_DE_HORARIO = '¿Qué horario tiene la clínica?'
const PREGUNTA_DE_CITA = '¿Cómo pido cita?'

async function cargarPortada(page: Page, ancho: number, alto: number): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: ancho, height: alto })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  await page.evaluate(() => document.fonts.ready)
}

// ---------------------------------------------------------------------------
// @s2 — ningún dato se pierde
// ---------------------------------------------------------------------------

/** Los tres datos, leídos de la fuente única de datos de negocio: nunca de una lista escrita en el test. */
const TELEFONO_PRINCIPAL = datosNegocio.telefonoClinica.textoVisible
const DIGITOS_DEL_TELEFONO = TELEFONO_PRINCIPAL.replace(/\D/g, '')
const TRAMOS_DE_HORARIO = datosNegocio.horario
const LOCALIDAD = datosNegocio.direccion.localidad

interface DatosABuscar {
  readonly digitosDelTelefono: string
  readonly tramos: readonly { readonly dias: string; readonly horas: string }[]
  readonly localidad: string
}

const DATOS_A_BUSCAR: DatosABuscar = {
  digitosDelTelefono: DIGITOS_DEL_TELEFONO,
  tramos: TRAMOS_DE_HORARIO,
  localidad: LOCALIDAD,
}

/**
 * Cuántas veces aparece cada uno de los tres datos DENTRO de un elemento. Lee
 * `textContent` y compara sin distinguir mayúsculas: la píldora del hero antiguo
 * pintaba la localidad con `text-transform: uppercase`, y su `innerText` salía
 * «GALAPAGAR · MADRID», así que un recuento sensible a mayúsculas sobre
 * `innerText` daría 0 con el defecto presente (un 0 por vacuidad). Sin nada de
 * fuera: Playwright serializa la función.
 */
function contarApariciones(
  elemento: Element,
  datos: DatosABuscar,
): { telefono: number; horario: number; localidad: number } {
  const texto = (elemento.textContent ?? '').toLowerCase()
  const digitos = texto.replace(/\D/g, '')
  const enlacesDeLlamada = elemento.querySelectorAll('a[href^="tel:"]').length
  const coincidencias = (haystack: string, aguja: string): number => haystack.split(aguja).length - 1
  const tramosPresentes = datos.tramos.filter(
    (tramo) => texto.includes(tramo.dias.toLowerCase()) || texto.includes(tramo.horas.toLowerCase()),
  )
  return {
    telefono: coincidencias(digitos, datos.digitosDelTelefono) + enlacesDeLlamada,
    horario: tramosPresentes.length,
    localidad: coincidencias(texto, datos.localidad.toLowerCase()),
  }
}

/** Abre una pregunta del acordeón excluyente (cierra la que hubiera abierta) y devuelve su respuesta. */
async function abrirRespuestaDelFaq(page: Page, pregunta: string): Promise<Locator> {
  await page.getByRole('button', { name: pregunta }).click()
  const respuesta = page.locator('#faq').locator(`section[aria-label="${pregunta}"]`)
  await expect(respuesta).toBeVisible()
  return respuesta
}

/** Cuántos enlaces de llamada dentro del ámbito se reconocen por sus dígitos, tanto en el nombre visible como en el destino. */
async function contarEnlacesDelTelefono(ambito: Locator): Promise<number> {
  return ambito.locator('a[href^="tel:"]').evaluateAll(
    (enlaces, digitos) =>
      enlaces.filter(
        (enlace) =>
          (enlace.textContent ?? '').replace(/\D/g, '') === digitos &&
          (enlace.getAttribute('href') ?? '').replace(/\D/g, '').endsWith(digitos),
      ).length,
    DIGITOS_DEL_TELEFONO,
  )
}

test.describe('@s2 de hero_reducido_con_animacion: los datos que salen del hero siguen publicados en el resto de la portada', () => {
  test('dentro de la bienvenida el recuento de cada dato es 0, y fuera siguen el teléfono, los tres tramos de horario y la localidad', async ({
    page,
  }) => {
    await cargarPortada(page, 1440, 900)

    // Dentro del hero: cero apariciones de cada dato.
    const dentro = await page.locator(SELECTOR_DEL_HERO).evaluate(contarApariciones, DATOS_A_BUSCAR)
    expect(dentro).toEqual({ telefono: 0, horario: 0, localidad: 0 })
    expect(await page.locator(SELECTOR_DEL_HERO).evaluate((hero) => (hero.textContent ?? '').length)).toBeGreaterThan(0)

    // Teléfono principal, como enlace de llamada reconocido por sus dígitos.
    const contacto = page.getByRole('region', { name: 'Información de contacto' })
    const pie = page.locator('footer')
    const enContacto = await contarEnlacesDelTelefono(contacto)
    const enElPie = await contarEnlacesDelTelefono(pie)
    const respuestaDeCita = await abrirRespuestaDelFaq(page, PREGUNTA_DE_CITA)
    const enLaRespuestaDeCita = await contarEnlacesDelTelefono(respuestaDeCita)
    expect(enContacto).toBeGreaterThan(0)
    expect(enElPie).toBeGreaterThan(0)
    expect(enLaRespuestaDeCita).toBeGreaterThan(0)

    // Los tres tramos de horario, con coincidencia literal con la fuente única, en Contacto y en la columna de Reservar.
    for (const tramo of TRAMOS_DE_HORARIO) {
      const enContactoPorPareja = await contacto
        .locator('dl > div')
        .evaluateAll(
          (filas, buscado) =>
            filas.filter(
              (fila) =>
                fila.querySelector('dt')?.textContent === buscado.dias &&
                fila.querySelector('dd')?.textContent === buscado.horas,
            ).length,
          tramo,
        )
      const enReservarPorPareja = await page
        .locator('#reservar [data-reserva-horario] li')
        .evaluateAll(
          (filas, buscado) =>
            filas.filter(
              (fila) => (fila.textContent ?? '').includes(buscado.dias) && (fila.textContent ?? '').includes(buscado.horas),
            ).length,
          tramo,
        )
      expect(enContactoPorPareja, `Contacto: ${tramo.dias}`).toBeGreaterThan(0)
      expect(enReservarPorPareja, `Reservar: ${tramo.dias}`).toBeGreaterThan(0)
    }

    // El FAQ es un acordeón excluyente: se abre una, se lee, se abre la otra y se lee la suya.
    const respuestaDeHorario = await abrirRespuestaDelFaq(page, PREGUNTA_DE_HORARIO)
    const textoDeHorario = (await respuestaDeHorario.textContent()) ?? ''
    expect(textoDeHorario.toLowerCase()).toContain(textoHorario(TRAMOS_DE_HORARIO).toLowerCase())

    // La localidad, en la dirección de Contacto y en la descripción del pie.
    const direccion = (await contacto.getByRole('group', { name: 'Dirección' }).textContent()) ?? ''
    const descripcionDelPie = (await page.locator('footer [data-pie-marca]').textContent()) ?? ''
    expect(direccion.toLowerCase()).toContain(LOCALIDAD.toLowerCase())
    expect(descripcionDelPie.toLowerCase()).toContain(LOCALIDAD.toLowerCase())
  })

  test('la comprobación muerde: sobre un hero sintético que aún lleve la píldora, la franja y el botón de llamada, cada recuento sale mayor que 0', async ({
    page,
  }) => {
    // El hero ANTIGUO, construido con los datos de la fuente única. La píldora
    // pinta la localidad en mayúsculas con CSS, como la real.
    const franja = TRAMOS_DE_HORARIO.map((tramo) => `<div><dt>${tramo.dias}</dt><dd>${tramo.horas}</dd></div>`).join('')
    await page.setContent(`
      <section>
        <p style="text-transform: uppercase">${LOCALIDAD} · ${datosNegocio.direccion.region}</p>
        <h1>Titular</h1>
        <div><a href="#reservar">Reservar cita</a><a href="tel:+34${DIGITOS_DEL_TELEFONO}">Llamar ${TELEFONO_PRINCIPAL}</a></div>
        <dl>${franja}</dl>
      </section>`)

    const hero = page.locator('section')
    const recuentos = await hero.evaluate(contarApariciones, DATOS_A_BUSCAR)

    expect(recuentos.telefono).toBeGreaterThan(0)
    expect(recuentos.horario).toBe(TRAMOS_DE_HORARIO.length)
    expect(recuentos.localidad).toBeGreaterThan(0)
    // La trampa que evita leer `textContent`: lo que se VE sale en mayúsculas.
    expect(await hero.evaluate((nodo) => (nodo as HTMLElement).innerText)).toContain(LOCALIDAD.toUpperCase())
  })

  test('la comprobación muerde por separado: cada dato suelto en un hero sintético se detecta', async ({ page }) => {
    for (const [dato, html] of [
      ['telefono', `<p>Llámanos al ${TELEFONO_PRINCIPAL}</p>`],
      ['horario', `<p>${TRAMOS_DE_HORARIO[0]?.dias}</p>`],
      ['localidad', `<p>${LOCALIDAD}</p>`],
    ] as const) {
      await page.setContent(`<section>${html}</section>`)
      const recuentos = await page.locator('section').evaluate(contarApariciones, DATOS_A_BUSCAR)
      expect(recuentos[dato], `un hero con solo «${dato}» debe contarlo`).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// @s12 — el hero es de pantalla completa
// ---------------------------------------------------------------------------

interface TamanoDeVentana {
  readonly ancho: number
  readonly alto: number
}

/** Los cinco tamaños habituales: la sección mide exactamente el alto de la ventana. */
const TAMANOS_HABITUALES: readonly TamanoDeVentana[] = [
  { ancho: 1440, alto: 900 },
  { ancho: 1024, alto: 768 },
  { ancho: 768, alto: 1024 },
  { ancho: 375, alto: 812 },
  { ancho: 320, alto: 900 },
]
/** El tamaño bajo: el contenido más la cabecera no caben y la sección debe crecer en vez de recortar. */
const TAMANO_BAJO: TamanoDeVentana = { ancho: 812, alto: 300 }
const TOLERANCIA_DE_ALTURA_PX = 0.5
const TOLERANCIA_DE_CENTRADO_PX = 1
const TOTAL_DE_TAMANOS = 6

interface MedidaDelHero {
  readonly seccionTop: number
  readonly seccionBottom: number
  readonly contenidoTop: number
  readonly contenidoBottom: number
  readonly alturaDeLaCabecera: number
  readonly scrollHeight: number
  readonly clientHeight: number
}

/** La caja del contenido va del borde superior del titular al borde inferior del botón. */
async function medirElHero(page: Page): Promise<MedidaDelHero> {
  return page.locator(SELECTOR_DEL_HERO).evaluate((seccion) => {
    const cajaDe = (selector: string): DOMRect => (seccion.querySelector(selector) as Element).getBoundingClientRect()
    const titular = cajaDe('h1')
    const boton = cajaDe('a')
    const caja = seccion.getBoundingClientRect()
    const alturaDeLaCabecera = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--altura-cabecera'),
    )
    return {
      seccionTop: caja.top,
      seccionBottom: caja.bottom,
      contenidoTop: titular.top,
      contenidoBottom: boton.bottom,
      alturaDeLaCabecera,
      scrollHeight: seccion.scrollHeight,
      clientHeight: seccion.clientHeight,
    }
  })
}

/** Se «recorta» si el contenido sobresale de la sección por abajo o por arriba, o si la sección desborda su propio alto. */
function recortaContenido(medida: MedidaDelHero): boolean {
  return (
    medida.contenidoBottom > medida.seccionBottom + TOLERANCIA_DE_ALTURA_PX ||
    medida.contenidoTop < medida.seccionTop ||
    medida.scrollHeight > medida.clientHeight
  )
}

test.describe('@s12 de hero_reducido_con_animacion: la sección de bienvenida mide al menos la altura de la ventana, exactamente esa cuando el contenido cabe, y su contenido se centra en vertical', () => {
  test('en los cinco tamaños habituales mide exactamente la altura de la ventana (900 y no 756 a 1440x900; la de la ventana también a 375 y a 320), no recorta y centra su contenido bajo la cabecera', async ({
    page,
  }) => {
    let tamanosMedidos = 0

    for (const { ancho, alto } of TAMANOS_HABITUALES) {
      await cargarPortada(page, ancho, alto)
      const medida = await medirElHero(page)
      const tamano = `${ancho}x${alto}`
      const alturaDeLaSeccion = medida.seccionBottom - medida.seccionTop

      expect(Math.abs(alturaDeLaSeccion - alto), `${tamano}: la sección mide ${alturaDeLaSeccion}`).toBeLessThanOrEqual(
        TOLERANCIA_DE_ALTURA_PX,
      )
      expect(recortaContenido(medida), `${tamano}: el hero no recorta contenido`).toBe(false)

      // La zona libre empieza a la altura de la cabecera por debajo del borde superior de la sección.
      const huecoSuperior = medida.contenidoTop - (medida.seccionTop + medida.alturaDeLaCabecera)
      const huecoInferior = medida.seccionBottom - medida.contenidoBottom
      expect(medida.alturaDeLaCabecera, `${tamano}: altura de la cabecera leída`).toBeGreaterThan(0)
      expect(
        Math.abs(huecoSuperior - huecoInferior),
        `${tamano}: hueco superior ${huecoSuperior} frente al inferior ${huecoInferior}`,
      ).toBeLessThanOrEqual(TOLERANCIA_DE_CENTRADO_PX)
      tamanosMedidos += 1
    }

    await cargarPortada(page, TAMANO_BAJO.ancho, TAMANO_BAJO.alto)
    const medidaBaja = await medirElHero(page)
    // Premisa: si el contenido dejara de superar la ventana a 812x300, el escenario fallaría en voz alta.
    const alturaDelContenido = medidaBaja.contenidoBottom - medidaBaja.contenidoTop
    expect(alturaDelContenido + medidaBaja.alturaDeLaCabecera).toBeGreaterThan(TAMANO_BAJO.alto)
    // La sección CRECE (`min-height`, no `height`): al menos la ventana, y sin recortar.
    expect(medidaBaja.seccionBottom - medidaBaja.seccionTop).toBeGreaterThanOrEqual(TAMANO_BAJO.alto)
    expect(recortaContenido(medidaBaja), 'a 812x300 el hero no recorta contenido').toBe(false)
    tamanosMedidos += 1

    expect(tamanosMedidos).toBe(TOTAL_DE_TAMANOS)
  })
})
