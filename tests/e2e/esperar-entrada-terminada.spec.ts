// `features/hero_reducido_con_animacion.feature` @s10: el ayudante `esperarEntradaTerminada`
// (`tests/e2e/entrada-del-hero.ts`) se prueba AISLADO, contra páginas sintéticas, porque ningún
// spec real puede ponerlo en rojo con el código correcto: sobre la portada real el ayudante
// siempre acaba bien. Cada mutante del ayudante muere con la página que dice el contrato:
//   · «tope inexistente»      → la de 30 segundos (y la que nunca monta el hero)
//   · «sin ancla»             → la del hero que se monta tarde
//   · «espera una sola»       → la del hero que se monta tarde
//   · «lee getAnimations()»   → la de las animaciones que ya terminaron (variante B: ancla y fin) y la
//                               de la animación infinita AJENA al hero (variante A: solo el fin)
// Y los de la ola 4C (panel de revisión del 14/10/2026), que el contrato no nombra:
//   · «cuenta toda animación del documento» → las dos páginas con animaciones ajenas al hero
//   · «el ancla da por bueno cualquier h1»   → la del titular aparte, con otro h1 en la cabecera
//   · «la relectura del tope tapa su error»  → la que pierde la página justo tras agotarse el tope
//
// Las páginas se sirven con `route.fulfill` y se visitan con un `goto` REAL (no con `setContent`,
// que reescribe el documento en curso y no pasa por `addInitScript`): así se prueba el camino
// por el que el registro se instala de verdad en las páginas reales.
import { expect, test, type BrowserContext, type Page } from 'playwright/test'
import { esperarEntradaTerminada, leerRegistroDeEntrada, registrarEntradaDelHero } from './entrada-del-hero'
import { TOPE_DE_UNA_ESPERA_MS } from './utilidades'

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
  /**
   * Animaciones de elementos de FUERA del hero, presentes ya al cargar: dos cortas (como las de una cabecera con su
   * propia entrada) o una infinita (como un indicador de carga). Solo las del hero cuentan para el ayudante.
   */
  readonly animacionesAjenas?: 'cortas' | 'infinita'
}

/** El marcado del hero real: `Hero.tsx` lo pone en el contenedor del titular, el párrafo y el botón. */
const MARCA_DEL_HERO = 'data-hero-contenido'

/** Todas con `animation-fill-mode: backwards`, como la entrada real: una animación terminada desaparece de `getAnimations()`. */
function htmlDe({ duracionMs, montarTrasMs, titularAparteTrasMs, animacionesAjenas }: PaginaSintetica): string {
  const retardos = RETARDOS_MS.map((retardo, indice) => `.e${indice} { animation-delay: ${retardo}ms }`).join('\n')
  const primerElemento = titularAparteTrasMs === undefined ? '<h1 class="e e0">Titular</h1>' : '<div class="e e0">Otro</div>'
  const titularAparte =
    titularAparteTrasMs === undefined
      ? ''
      : `setTimeout(() => document.querySelector('section').insertAdjacentHTML('afterbegin', '<h1>Titular</h1>'), ${titularAparteTrasMs});`
  // Con el titular aparte hay otro `h1` FUERA del hero desde el principio (la marca de una cabecera): no es el titular de la entrada y no puede dar el ancla por cumplida.
  const titularDeLaCabecera = titularAparteTrasMs === undefined ? '' : '<header><h1>Galapavet</h1></header>'
  const ajenas = {
    cortas: '<header><div class="ajena">Ajena</div><div class="ajena">Ajena</div></header>',
    infinita: '<header><div class="ajena infinita">Ajena</div></header>',
  }
  const montaje =
    montarTrasMs === null ? '' : `window.addEventListener('load', () => setTimeout(montar, ${montarTrasMs}))`
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@keyframes entrada { from { opacity: 0; transform: translateX(-40px) } }
.e { animation: entrada ${duracionMs}ms ease-out backwards }
.ajena { animation: entrada ${DURACION_CORTA_MS}ms ease-out backwards }
.ajena.infinita { animation: entrada 400ms ease-in-out infinite alternate }
${retardos}
</style></head><body>${titularDeLaCabecera}${animacionesAjenas === undefined ? '' : ajenas[animacionesAjenas]}<div id="raiz"></div><script>
function montar() {
  document.getElementById('raiz').innerHTML =
    '<section ${MARCA_DEL_HERO}>${primerElemento}<p class="e e1">Parrafo</p><a class="e e2" href="#reservar">Reservar cita</a></section>'
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

/** Cuántas animaciones por fotogramas clave del HERO siguen vivas: en curso o esperando su retardo (con el relleno `backwards`). Es independiente del registro. */
function animacionesDelHeroVivas(page: Page): Promise<number> {
  return page.evaluate(
    (marca) =>
      document
        .getAnimations()
        .filter(
          (animacion) =>
            animacion instanceof CSSAnimation &&
            animacion.effect instanceof KeyframeEffect &&
            animacion.effect.target?.closest(`[${marca}]`) != null,
        ).length,
    MARCA_DEL_HERO,
  )
}

/** Un tope corto, para la prueba en la que el ayudante tiene que agotarlo. */
const TOPE_CORTO_MS = 500
const MENSAJE_DE_PAGINA_CERRADA = 'Target page, context or browser has been closed'

/**
 * La misma página, pero tras su PRIMERA lectura con `evaluate` (la que comprueba que el registro está instalado)
 * todas las demás fallan como falla una página cerrada. El resto de la API es la real.
 */
function paginaQueSePierdeTrasLaPrimeraLectura(page: Page): Page {
  let lecturas = 0
  return new Proxy(page, {
    get(destino, propiedad) {
      if (propiedad === 'evaluate') {
        return (...argumentos: Parameters<Page['evaluate']>) => {
          lecturas += 1
          return lecturas === 1 ? destino.evaluate(...argumentos) : Promise.reject(new Error(MENSAJE_DE_PAGINA_CERRADA))
        }
      }
      const valor: unknown = Reflect.get(destino, propiedad)
      return typeof valor === 'function' ? valor.bind(destino) : valor
    },
  })
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
    await page.waitForFunction(
      () => document.getAnimations().length === 0 && document.querySelector('h1') !== null,
      undefined,
      { timeout: TOPE_DE_UNA_ESPERA_MS },
    )
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

  // El registro cuenta SOLO las animaciones del hero (`data-hero-contenido`): con la cabecera de la
  // feature 49, o un indicador de carga, el documento tiene animaciones que no son de la entrada.
  // La comprobación de estos dos tests NO lee el registro: con un registro global, `fines` ya
  // contaría las ajenas y daría 3 con el ayudante roto. Mira cuántas animaciones del hero siguen vivas.
  test('las animaciones de FUERA del hero no cuentan: con dos ajenas ya terminadas, no vuelve hasta que han terminado las tres del hero', async ({
    page,
  }) => {
    await servirPagina(page, { duracionMs: DURACION_CORTA_MS, montarTrasMs: HERO_TARDIO_MS, animacionesAjenas: 'cortas' })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)

    await esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })

    expect(await animacionesDelHeroVivas(page), 'animaciones del hero que siguen vivas al volver').toBe(0)
    const registro = await leerRegistroDeEntrada(page)
    expect(registro.titular).toBe(true)
    expect(registro.arranques).toBe(ANIMACIONES_DE_ENTRADA)
    expect(registro.fines).toBe(ANIMACIONES_DE_ENTRADA)
  })

  test('una animación INFINITA de fuera del hero (un indicador de carga) no impide que la espera termine', async ({ page }) => {
    await servirPagina(page, { duracionMs: DURACION_CORTA_MS, montarTrasMs: 0, animacionesAjenas: 'infinita' })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)

    await esperarEntradaTerminada(page, { topeMs: TOPE_DE_LA_PRUEBA_MS })

    expect(await animacionesDelHeroVivas(page), 'animaciones del hero que siguen vivas al volver').toBe(0)
    expect((await leerRegistroDeEntrada(page)).fines).toBe(ANIMACIONES_DE_ENTRADA)
  })

  test('si la página se pierde al agotarse el tope, el error que se ve sigue siendo el del tope, con el estado ilegible dicho', async ({
    page,
  }) => {
    await servirPagina(page, { duracionMs: DURACION_CORTA_MS, montarTrasMs: null })
    await registrarEntradaDelHero(page)
    await page.goto(URL_SINTETICA)

    // La primera lectura (que el registro existe) es real; la de después del tope, la que cierra el
    // mensaje, falla como lo haría una página cerrada. Con la lectura sin guardia, ese fallo tapaba al del tope.
    const fallo = esperarEntradaTerminada(paginaQueSePierdeTrasLaPrimeraLectura(page), { topeMs: TOPE_CORTO_MS })

    await expect(fallo).rejects.toThrow(/se agotó el tope de 500 ms.*no se pudo leer el registro.*Target page, context or browser has been closed/s)
  })
})
