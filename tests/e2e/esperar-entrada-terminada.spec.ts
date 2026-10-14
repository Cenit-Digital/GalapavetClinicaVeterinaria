// `features/hero_reducido_con_animacion.feature` @s10: el ayudante `esperarEntradaTerminada`
// (`tests/e2e/entrada-del-hero.ts`) se prueba AISLADO, contra páginas sintéticas, porque ningún
// spec real puede ponerlo en rojo con el código correcto: sobre la portada real el ayudante
// siempre acaba bien. Cada mutante del ayudante muere con la página que dice el contrato:
//   · «tope inexistente»      → la de 30 segundos (y la que nunca monta el hero)
//   · «sin ancla»             → la del hero que se monta tarde
//   · «espera una sola»       → la del hero que se monta tarde
//   · «lee getAnimations()»   → la de las animaciones que ya terminaron
//
// Las páginas se sirven con `route.fulfill` y se visitan con un `goto` REAL (no con `setContent`,
// que reescribe el documento en curso y no pasa por `addInitScript`): así se prueba el camino
// por el que el registro se instala de verdad en las páginas reales.
import { expect, test, type BrowserContext, type Page } from 'playwright/test'
import { esperarEntradaTerminada, leerRegistroDeEntrada, registrarEntradaDelHero } from './entrada-del-hero'

const URL_SINTETICA = 'http://sintetica.test/'
/** Los retardos que fija @s5 de la feature: el fin de la primera es anterior al de la última. */
const RETARDOS_MS = [0, 120, 240] as const
/** Un tope muy por debajo del tiempo de espera del test (60 s) y por encima de la entrada más larga sana. */
const TOPE_DE_LA_PRUEBA_MS = 3000
const ANIMACIONES_DE_ENTRADA = 3
/**
 * Con 60 ms y retardos de 0/120/240 las tres son SECUENCIALES: cada una termina (60, 180, 300 ms) antes de
 * que arranque la siguiente (120, 240). Así «espera una sola» y un ancla de solo dos arranques no pueden
 * pasar por azar de fotogramas: la entrada real, de 700 ms, las solapa y no distinguiría esos mutantes.
 */
const DURACION_CORTA_MS = 60
/** «Un segundo o más después de `load`»: el contrato lo mide con el hero real montándose 10-17 ms después; aquí, muy por encima. */
const HERO_TARDIO_MS = 1200
/** Cuánto después de `load` aparece el titular en la página donde las tres animaciones son de OTROS elementos. */
const TITULAR_TARDIO_MS = 1000
const ANIMACION_DE_30_S_MS = 30_000

interface PaginaSintetica {
  /** Duración de cada animación. */
  readonly duracionMs: number
  /** Cuánto tarda en montarse el hero tras `load`; `null` = nunca; 0 = ya está en el documento. */
  readonly montarTrasMs: number | null
  /** Si se da, el titular NO se anima y aparece este tiempo después de `load`: las tres animaciones son de otros elementos. */
  readonly titularAparteTrasMs?: number
}

/** Todas con `animation-fill-mode: backwards`, como la entrada real: una animación terminada desaparece de `getAnimations()`. */
function htmlDe({ duracionMs, montarTrasMs, titularAparteTrasMs }: PaginaSintetica): string {
  const retardos = RETARDOS_MS.map((retardo, indice) => `.e${indice} { animation-delay: ${retardo}ms }`).join('\n')
  const primerElemento = titularAparteTrasMs === undefined ? '<h1 class="e e0">Titular</h1>' : '<div class="e e0">Otro</div>'
  const titularAparte =
    titularAparteTrasMs === undefined
      ? ''
      : `setTimeout(() => document.querySelector('section').insertAdjacentHTML('afterbegin', '<h1>Titular</h1>'), ${titularAparteTrasMs});`
  const montaje =
    montarTrasMs === null ? '' : `window.addEventListener('load', () => setTimeout(montar, ${montarTrasMs}))`
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@keyframes entrada { from { opacity: 0; transform: translateX(-40px) } }
.e { animation: entrada ${duracionMs}ms ease-out backwards }
${retardos}
</style></head><body><div id="raiz"></div><script>
function montar() {
  document.getElementById('raiz').innerHTML =
    '<section>${primerElemento}<p class="e e1">Parrafo</p><a class="e e2" href="#reservar">Reservar cita</a></section>'
  ${titularAparte}
}
${montarTrasMs === 0 ? 'montar()' : montaje}
</script></body></html>`
}

async function servirPagina(destino: Page | BrowserContext, pagina: PaginaSintetica): Promise<void> {
  await destino.route('**/*', (ruta) => ruta.fulfill({ contentType: 'text/html', body: htmlDe(pagina) }))
}

/** Las animaciones por fotogramas clave que `getAnimations()` ve en este instante. */
function animacionesQueVeGetAnimations(page: Page): Promise<number> {
  return page.evaluate(() => document.getAnimations().filter((animacion) => animacion instanceof CSSAnimation).length)
}

test.describe('@s10 de hero_reducido_con_animacion: el ayudante esperarEntradaTerminada, aislado', () => {
  test('con las animaciones YA terminadas al llamarlo, devuelve con el titular presente y tres "animationend" registrados', async ({
    page,
  }) => {
    await servirPagina(page, { duracionMs: DURACION_CORTA_MS, montarTrasMs: 0 })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)
    // Precondición, la que hace morir al mutante «lee getAnimations()»: las tres terminaron y, con el
    // relleno `backwards`, YA no existen para `getAnimations()`. Solo el registro las recuerda.
    await page.waitForFunction(() => document.getAnimations().length === 0 && document.querySelector('h1') !== null)
    expect(await animacionesQueVeGetAnimations(page)).toBe(0)

    await esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })

    const registro = await leerRegistroDeEntrada(page)
    expect(registro.titular).toBe(true)
    expect(registro.fines).toBe(ANIMACIONES_DE_ENTRADA)
  })

  test('con el hero montado un segundo o más DESPUÉS de "load", no vuelve antes de que exista el titular y hayan terminado las tres', async ({
    page,
  }) => {
    await servirPagina(page, { duracionMs: DURACION_CORTA_MS, montarTrasMs: HERO_TARDIO_MS })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)

    await esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })

    // Lectura SIN reintentos (`evaluate`, no `toHaveCount`): una aserción con espera automática
    // taparía un ayudante que vuelve antes de tiempo, y es justo lo que hay que cazar.
    const registro = await leerRegistroDeEntrada(page)
    expect(registro.titular).toBe(true)
    expect(registro.arranques).toBe(ANIMACIONES_DE_ENTRADA)
    expect(registro.fines).toBe(ANIMACIONES_DE_ENTRADA)
  })

  test('el titular es parte del ancla: con las tres animaciones ya terminadas pero sin titular todavía, espera a que exista', async ({
    page,
  }) => {
    await servirPagina(page, {
      duracionMs: DURACION_CORTA_MS,
      montarTrasMs: 0,
      titularAparteTrasMs: TITULAR_TARDIO_MS,
    })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)

    await esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })

    const registro = await leerRegistroDeEntrada(page)
    expect(registro.titular).toBe(true)
    expect(registro.fines).toBe(ANIMACIONES_DE_ENTRADA)
  })

  test('con una animación de 30 segundos presente al cargar, falla por el tope en vez de esperar o medir', async ({
    page,
  }) => {
    await servirPagina(page, { duracionMs: ANIMACION_DE_30_S_MS, montarTrasMs: 0 })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)

    // El mensaje concreto del tope, no «rechaza» a secas: un rechazo cualquiera (registro sin instalar,
    // tiempo de espera del test) también pasaría. Y la espera no se pasa del tope por mucho.
    const inicio = Date.now()
    await expect(esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })).rejects.toThrow(
      /tope de 3000 ms.*arranques: 3, fines: 0/s,
    )
    expect(Date.now() - inicio).toBeLessThan(TOPE_DE_LA_PRUEBA_MS * 2)
  })

  test('con un hero que NUNCA se monta, falla por el tope: sin titular y sin arranques no hay entrada que esperar ni medir', async ({
    page,
  }) => {
    await servirPagina(page, { duracionMs: DURACION_CORTA_MS, montarTrasMs: null })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)

    await expect(esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })).rejects.toThrow(
      /tope de 3000 ms.*titular: false, arranques: 0, fines: 0/s,
    )
  })

  test('sin la primera fase, o con ella DESPUÉS del goto, falla en voz alta y de inmediato en vez de esperar al tope', async ({
    page,
  }) => {
    await servirPagina(page, { duracionMs: DURACION_CORTA_MS, montarTrasMs: 0 })
    const avisoEsperado = /registrarEntradaDelHero.*ANTES del goto/s

    await page.goto(URL_SINTETICA)
    const inicio = Date.now()
    await expect(esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })).rejects.toThrow(avisoEsperado)

    // Un registro instalado tras la navegación no existe en el documento ya cargado: no vale.
    await registrarEntradaDelHero(page)
    await expect(esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })).rejects.toThrow(avisoEsperado)
    expect(Date.now() - inicio).toBeLessThan(TOPE_DE_LA_PRUEBA_MS)
  })

  test('el registro instalado en el CONTEXTO cubre la página abierta con context.newPage(), y instalarlo también en la página no cuenta cada evento dos veces', async ({
    context,
  }) => {
    await servirPagina(context, { duracionMs: DURACION_CORTA_MS, montarTrasMs: 0 })
    await registrarEntradaDelHero(context)
    const paginaNueva = await context.newPage()
    await registrarEntradaDelHero(paginaNueva)
    await paginaNueva.goto(URL_SINTETICA)

    await esperarEntradaTerminada(paginaNueva, { topeMs: TOPE_DE_LA_PRUEBA_MS })

    const registro = await leerRegistroDeEntrada(paginaNueva)
    expect(registro.arranques).toBe(ANIMACIONES_DE_ENTRADA)
    expect(registro.fines).toBe(ANIMACIONES_DE_ENTRADA)
  })

  test('un tope que no sea mayor que 0 se rechaza de inmediato: en Playwright, un timeout de 0 espera para siempre', async ({
    page,
  }) => {
    await servirPagina(page, { duracionMs: ANIMACION_DE_30_S_MS, montarTrasMs: 0 })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)

    const inicio = Date.now()
    await expect(esperarEntradaTerminada(page, { topeMs: 0 })).rejects.toThrow(/tope.*mayor que 0/)
    await expect(esperarEntradaTerminada(page, { topeMs: -5 })).rejects.toThrow(/tope.*mayor que 0/)
    expect(Date.now() - inicio).toBeLessThan(TOPE_DE_LA_PRUEBA_MS)
  })
})
