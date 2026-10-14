// `features/hero_reducido_con_animacion.feature` @s11: el tiempo de LCP de la portada, medido en NAVEGADOR
// REAL con Playwright, fuera del gate de Vitest/Stryker (Decisión 11 de `project-spec.md`).
//
// QUÉ SE FIJA. En cada carga hay al menos un candidato de LCP; el último candidato está dentro del hero
// (`#inicio`); y la mediana de las 5 cargas de cada tamaño (1440×900 y 390×844) es menor o igual que
// 2500 ms. Los 2500 ms son el umbral «bueno» de LCP de CAMPO (p75, web.dev/articles/lcp), usado aquí solo
// como COTA ABSOLUTA GRUESA; la regresión respecto al «antes» no tiene tolerancia oficial: la juzga Pablo
// con `progress/lcp_hero_linea_base_20261013.md` y `progress/lcp_hero_despues_20261014.md` delante.
//
// EL MÉTODO ES EL DE LA LÍNEA BASE (su apartado 1): contexto nuevo por carga (sin caché), preferencia de
// movimiento declarada de forma explícita (`emulateMedia` antes del `goto`), un `PerformanceObserver` de
// `largest-contentful-paint` instalado con `addInitScript` ANTES del `goto`, `waitUntil: 'networkidle'`
// más 1,5 s, y el ÚLTIMO candidato. Las cargas de la medida real van en SERIE: en paralelo competirían
// por la CPU y falsearían el LCP. NO se usa `esperarEntradaTerminada` (excepción expresa de @s10: esta
// medida es de carga fresca y el LCP del texto con fundido incluye el tiempo de la propia entrada).
//
// LA MEDIDA SOLO ES VÁLIDA CON `animation-fill-mode: backwards` (@s5). Un texto con animación de OPACIDAD
// cuenta como candidato cuando la animación TERMINA y se retira del elemento; con `both` o `forwards` la
// opacidad queda compuesta y el titular NUNCA llega a ser candidato: el resultado saldría artificialmente
// bueno. La comprobación del relleno NO vive aquí: es la cláusula del relleno computado de
// `hero-reducido.spec.ts` (@s5), la única que ve `both`. Aquí se demuestra qué hace esta medida cuando el
// relleno es el malo (ver la sección «la medida muerde»).
//
// LO QUE ESTA MEDIDA NO VE, MEDIDO en Chromium 151 sobre páginas sintéticas (ver también
// `progress/lcp_hero_despues_20261014.md`):
//   · La espera del método termina a unos 2,0 s de la navegación (`networkidle` ≈ 0,5 s en local, más 1,5 s).
//     Una entrada que acabe más tarde, p. ej. un retardo de 3 s, NO llega a observarse: sin otro contenido
//     da 0 candidatos (falla el recuento); con la cabecera delante, el último candidato es la cabecera (falla
//     «el último candidato está en el hero»); y la mediana de 2500 ms NO salta. Solo con una espera de 4 s
//     el candidato aparece, a ~3,7 s, y la mediana falla. Por eso las tres cláusulas van JUNTAS.
//   · Con el relleno `both` o `forwards` y OTRO contenido pintable en la página, el candidato final es ese
//     otro contenido. Con la cabecera de la feature 49 por delante falla la cláusula del elemento; en la 48
//     sola ese contenido es la foto del hero (dentro de `#inicio`) y esta medida no lo distingue: lo
//     distingue solo @s5.
//
// «EL ELEMENTO ESPERADO» es una INTERPRETACIÓN del craftsman (ver el informe de la ola): el contrato no
// exige que el candidato sea la imagen, el titular o el párrafo en concreto, pero sí que la medida no dé
// un verde artificial; que el último candidato esté dentro del hero es lo que separa el hero de la
// cabecera cuando esta tapa la foto (feature 49).
import { expect, test, type Browser, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

// ---------------------------------------------------------------------------
// 1. Los datos de una carga y su valoración (pura: no toca el navegador)
// ---------------------------------------------------------------------------

/** Un candidato de LCP tal como lo entrega el observador, con lo que el informe necesita. */
interface CandidatoDeLcp {
  readonly instanteMs: number
  readonly elemento: string
  readonly areaPx: number
  readonly enElHero: boolean
  readonly animaOpacidad: boolean
  /** El instante en que terminó la animación de opacidad que cubre al candidato; `null` si no hay ninguna. */
  readonly cierreDeAnimacionMs: number | null
}

interface CargaMedida {
  readonly candidatos: readonly CandidatoDeLcp[]
  readonly cls: number
}

/** El umbral «bueno» de LCP en campo (p75, web.dev/articles/lcp): aquí, solo una cota absoluta gruesa. */
const UMBRAL_BUENO_DE_LCP_MS = 2500
const MITAD = 2

function mediana(valores: readonly number[]): number {
  const ordenados = valores.toSorted((a, b) => a - b)
  const centro = Math.floor(ordenados.length / MITAD)
  return ordenados.length % MITAD === 0
    ? ((ordenados[centro - 1] as number) + (ordenados[centro] as number)) / MITAD
    : (ordenados[centro] as number)
}

function fallosDeUnaCarga(carga: CargaMedida, numero: number): string[] {
  const ultimo = carga.candidatos.at(-1)
  if (ultimo === undefined) {
    return [`carga ${numero}: 0 candidatos de LCP observados`]
  }
  return ultimo.enElHero ? [] : [`carga ${numero}: el último candidato (${ultimo.elemento}) no está en el hero`]
}

function fallosDeLaMediana(cargas: readonly CargaMedida[]): string[] {
  const instantes = cargas.flatMap((carga) => carga.candidatos.slice(-1).map((ultimo) => ultimo.instanteMs))
  const valor = mediana(instantes)
  return valor > UMBRAL_BUENO_DE_LCP_MS ? [`la mediana de ${valor} ms supera el umbral de ${UMBRAL_BUENO_DE_LCP_MS} ms`] : []
}

/** LAS TRES CLÁUSULAS, escritas una sola vez: la medida real y las pruebas de que muerden usan esta función. */
function valorarLasCargas(cargas: readonly CargaMedida[]): string[] {
  return [...cargas.flatMap((carga, indice) => fallosDeUnaCarga(carga, indice + 1)), ...fallosDeLaMediana(cargas)]
}

// ---------------------------------------------------------------------------
// 2. La observación dentro de la página
// ---------------------------------------------------------------------------

/** Lo que el sitio real llama `#inicio`: el contenedor de la sección de bienvenida. */
const SELECTOR_DEL_HERO = '#inicio'
const CLAVE_DE_LA_OBSERVACION = '__observacionDeLcp'

interface ObservacionEnLaPagina {
  readonly leer: () => CargaMedida
}

interface ParametrosDeLaObservacion {
  readonly clave: string
  readonly selectorDelHero: string
}

/**
 * Lo que el navegador instala ANTES de cualquier script de la página. Se serializa: no puede cerrar
 * sobre nada de fuera. Guarda TODOS los candidatos de LCP (no solo el último), el desplazamiento de
 * maquetación acumulado y, para cada animación por fotogramas clave, si anima la opacidad y cuándo
 * termina: el texto con fundido cuenta como candidato al TERMINAR su animación, no al empezar.
 */
function instalarLaObservacion({ clave, selectorDelHero }: ParametrosDeLaObservacion): void {
  interface EntradaDeLcp extends PerformanceEntry {
    readonly element: Element | null
    readonly size: number
  }
  interface DesplazamientoDeMaquetacion extends PerformanceEntry {
    readonly value: number
    readonly hadRecentInput: boolean
  }
  interface CandidatoVivo {
    readonly instanteMs: number
    readonly elemento: Element | null
    readonly etiqueta: string
    readonly areaPx: number
    readonly enElHero: boolean
  }
  interface AnimacionVista {
    readonly elemento: Element
    readonly nombre: string
    readonly animaOpacidad: boolean
    terminaMs: number | null
  }
  const candidatos: CandidatoVivo[] = []
  const animaciones: AnimacionVista[] = []
  let cls = 0

  // La pertenencia al hero se decide AQUÍ, al entregar el candidato: más tarde `element` puede ser null.
  const anotarCandidatos = (entradas: PerformanceEntryList): void => {
    for (const entrada of entradas as EntradaDeLcp[]) {
      candidatos.push({
        instanteMs: entrada.startTime,
        elemento: entrada.element,
        etiqueta: entrada.element?.tagName ?? 'SIN-ELEMENTO',
        areaPx: entrada.size,
        enElHero: (entrada.element?.closest(selectorDelHero) ?? null) !== null,
      })
    }
  }
  const sumarDesplazamientos = (entradas: PerformanceEntryList): void => {
    for (const entrada of entradas as DesplazamientoDeMaquetacion[]) {
      cls += entrada.hadRecentInput ? 0 : entrada.value
    }
  }
  const observadorDeLcp = new PerformanceObserver((lista) => anotarCandidatos(lista.getEntries()))
  observadorDeLcp.observe({ type: 'largest-contentful-paint', buffered: true })
  const observadorDeMaquetacion = new PerformanceObserver((lista) => sumarDesplazamientos(lista.getEntries()))
  observadorDeMaquetacion.observe({ type: 'layout-shift', buffered: true })

  window.addEventListener(
    'animationstart',
    (evento) => {
      const objetivo = evento.target as Element
      const animacion = objetivo.getAnimations().find((candidata) => (candidata as CSSAnimation).animationName === evento.animationName)
      const efecto = animacion?.effect as KeyframeEffect | null | undefined
      animaciones.push({
        elemento: objetivo,
        nombre: evento.animationName,
        animaOpacidad: efecto?.getKeyframes().some((fotograma) => fotograma.opacity !== undefined) ?? false,
        terminaMs: null,
      })
    },
    true,
  )
  window.addEventListener(
    'animationend',
    (evento) => {
      const vista = animaciones.find(
        (animacion) => animacion.elemento === evento.target && animacion.nombre === evento.animationName && animacion.terminaMs === null,
      )
      if (vista !== undefined) {
        vista.terminaMs = evento.timeStamp
      }
    },
    true,
  )

  const observacion: ObservacionEnLaPagina = {
    leer: () => {
      anotarCandidatos(observadorDeLcp.takeRecords())
      sumarDesplazamientos(observadorDeMaquetacion.takeRecords())
      return {
        cls,
        candidatos: candidatos.map((visto) => {
          const animada = animaciones.find(
            (animacion) => animacion.animaOpacidad && visto.elemento !== null && animacion.elemento.contains(visto.elemento),
          )
          return {
            instanteMs: visto.instanteMs,
            elemento: visto.etiqueta,
            areaPx: visto.areaPx,
            enElHero: visto.enElHero,
            animaOpacidad: animada !== undefined,
            cierreDeAnimacionMs: animada?.terminaMs ?? null,
          }
        }),
      }
    },
  }
  ;(window as unknown as Record<string, ObservacionEnLaPagina>)[clave] = observacion
}

// ---------------------------------------------------------------------------
// 3. Una carga, con el método de la línea base
// ---------------------------------------------------------------------------

/** La espera del método de la línea base tras `networkidle`. */
const ESPERA_DEL_METODO_MS = 1500

interface VentanaDeMedida {
  readonly nombre: string
  readonly ancho: number
  readonly alto: number
}

const ESCRITORIO: VentanaDeMedida = { nombre: 'escritorio 1440x900', ancho: 1440, alto: 900 }
const MOVIL: VentanaDeMedida = { nombre: 'móvil 390x844', ancho: 390, alto: 844 }

interface PeticionDeCarga {
  readonly browser: Browser
  readonly ventana: VentanaDeMedida
  readonly destino: string
  /** Solo la carga real lo necesita: los contextos que crea `browser.newContext()` no heredan la `baseURL` de la configuración. */
  readonly baseURL?: string
  readonly prepararPagina?: (page: Page) => Promise<void>
  readonly esperaTrasNetworkidleMs?: number
}

/**
 * UNA carga: contexto nuevo (sin caché), preferencia de movimiento declarada de forma explícita,
 * observadores instalados ANTES del `goto`, `networkidle` y la espera.
 */
async function medirCarga({
  browser,
  ventana,
  destino,
  baseURL,
  prepararPagina,
  esperaTrasNetworkidleMs = ESPERA_DEL_METODO_MS,
}: PeticionDeCarga): Promise<CargaMedida> {
  const contexto = await browser.newContext({ viewport: { width: ventana.ancho, height: ventana.alto }, baseURL })
  try {
    const page = await contexto.newPage()
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await prepararPagina?.(page)
    const parametros: ParametrosDeLaObservacion = { clave: CLAVE_DE_LA_OBSERVACION, selectorDelHero: SELECTOR_DEL_HERO }
    await page.addInitScript(instalarLaObservacion, parametros)
    await page.goto(destino, { waitUntil: 'networkidle' })
    await page.waitForTimeout(esperaTrasNetworkidleMs)
    return await page.evaluate((clave) => (window as unknown as Record<string, ObservacionEnLaPagina>)[clave]!.leer(), CLAVE_DE_LA_OBSERVACION)
  } finally {
    await contexto.close()
  }
}

// ---------------------------------------------------------------------------
// 4. La medida REAL: la portada construida y servida
// ---------------------------------------------------------------------------

const RUTA_DE_LA_PORTADA = `${SUBPATH_DE_PRODUCCION}/`
const CARGAS_REALES_POR_TAMANO = 5
/** 5 cargas en SERIE (cada una, `networkidle` más 1,5 s: unos 2,2 s) con mucho margen para una máquina cargada. */
const TIMEOUT_DE_LA_MEDIDA_REAL_MS = 120_000

for (const ventana of [ESCRITORIO, MOVIL]) {
  test(`@s11 de hero_reducido_con_animacion: la portada real a ${ventana.nombre}, 5 cargas en serie con el método de la línea base, tiene candidato en el hero y mediana de LCP de 2500 ms o menos`, async ({
    browser,
    baseURL,
  }, testInfo) => {
    test.setTimeout(TIMEOUT_DE_LA_MEDIDA_REAL_MS)
    const cargas: CargaMedida[] = []

    for (let numero = 1; numero <= CARGAS_REALES_POR_TAMANO; numero += 1) {
      cargas.push(await medirCarga({ browser, ventana, baseURL, destino: RUTA_DE_LA_PORTADA }))
    }

    // Los datos de cada pasada (todos los candidatos, el CLS, el cierre de las animaciones) van adjuntos al informe de la prueba.
    await testInfo.attach(`lcp-${ventana.nombre}.json`, { body: JSON.stringify(cargas, null, 2), contentType: 'application/json' })
    expect(cargas).toHaveLength(CARGAS_REALES_POR_TAMANO)
    expect(valorarLasCargas(cargas)).toEqual([])
  })
}

// ---------------------------------------------------------------------------
// 5. La medida MUERDE: se pone en rojo con páginas que fallan a propósito
//    Las cargas de estas pruebas van en PARALELO a propósito: sus candidatos tienen un margen de
//    segundos (3,7 s frente a 2,5 s; «nunca» frente a «a los 0,8 s»), y la CPU no los mueve.
// ---------------------------------------------------------------------------

const URL_SINTETICA = 'http://sintetica.test/'
const CARGAS_DE_LA_PUERTA = 3
const DURACION_DE_LA_ENTRADA_MS = 700
const RETARDO_DE_3_S_MS = 3000
/** Cubre el retardo de 3 s más la entrada de 700 ms y un margen amplio: la espera del método (1,5 s) no llega. */
const ESPERA_QUE_ALCANZA_EL_RETARDO_MS = 5000
const RETENCION_DE_LA_FOTO_MS = 3000
/** Tolerancia de la comparación entre el cierre de la animación y el LCP: los dos relojes no se leen en el mismo instante. */
const UN_FOTOGRAMA_MS = 16
const PAGINA_VACIA = '<!doctype html><html lang="es"><head><meta charset="utf-8"></head><body></body></html>'

interface PaginaSintetica {
  readonly relleno: 'backwards' | 'both' | 'forwards'
  readonly retardoMs: number
  /** Si lleva un texto estático fuera del hero, como la cabecera de la feature 49. */
  readonly cabecera: boolean
}

function htmlDe({ relleno, retardoMs, cabecera }: PaginaSintetica): string {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
body { margin: 0; font: 32px sans-serif }
@keyframes entrada { from { opacity: 0; transform: translateX(-40px) } to { opacity: 1; transform: none } }
${SELECTOR_DEL_HERO} h1 { margin: 80px 40px; animation: entrada ${DURACION_DE_LA_ENTRADA_MS}ms ease-out ${relleno}; animation-delay: ${retardoMs}ms }
</style></head><body>${cabecera ? '<header style="height: 64px">Galapavet</header>' : ''}
<div id="inicio"><section><h1>Cuidamos la salud y la felicidad de tu mascota</h1></section></div></body></html>`
}

/** Sirve `cuerpo` para cualquier petición: la página se visita con un `goto` REAL, que sí pasa por `addInitScript`. */
function servirPaginaSintetica(cuerpo: string): (page: Page) => Promise<void> {
  return async (page) => {
    await page.route('**/*', (ruta) => ruta.fulfill({ contentType: 'text/html', body: cuerpo }))
  }
}

function peticionSintetica(browser: Browser, pagina: PaginaSintetica, esperaTrasNetworkidleMs?: number): PeticionDeCarga {
  return {
    browser,
    ventana: ESCRITORIO,
    destino: URL_SINTETICA,
    esperaTrasNetworkidleMs,
    prepararPagina: servirPaginaSintetica(htmlDe(pagina)),
  }
}

function medirEnParalelo(peticion: PeticionDeCarga): Promise<CargaMedida[]> {
  return Promise.all(Array.from({ length: CARGAS_DE_LA_PUERTA }, () => medirCarga(peticion)))
}

/** El mismo fallo, y solo ese, en cada una de las `CARGAS_DE_LA_PUERTA` cargas. */
function unFalloPorCarga(fallo: RegExp): unknown[] {
  return Array.from({ length: CARGAS_DE_LA_PUERTA }, () => expect.stringMatching(fallo))
}

const FALLO_DE_RECUENTO = /0 candidatos/
const FALLO_DE_ELEMENTO = /el último candidato \(HEADER\) no está en el hero/
const FALLO_DE_MEDIANA = /la mediana de \d+(\.\d+)? ms supera el umbral de 2500 ms/

test.describe('@s11 de hero_reducido_con_animacion: la medida muerde (páginas sintéticas)', () => {
  test('una portada sana, con el relleno "backwards" y sin retardo, da cargas válidas cuyo último candidato es el titular animado', async ({
    browser,
  }) => {
    const sana = { relleno: 'backwards', retardoMs: 0, cabecera: true } as const

    const cargas = await medirEnParalelo(peticionSintetica(browser, sana))

    expect(valorarLasCargas(cargas)).toEqual([])
    expect(cargas.map((carga) => carga.candidatos.at(-1)?.elemento)).toEqual(['H1', 'H1', 'H1'])
  })

  test('el titular con fundido cuenta al TERMINAR su animación, no en su primer fotograma, y la medida registra el cierre', async ({ browser }) => {
    const sana = { relleno: 'backwards', retardoMs: 0, cabecera: true } as const

    const cargas = await medirEnParalelo(peticionSintetica(browser, sana))

    for (const carga of cargas) {
      const ultimo = carga.candidatos.at(-1)
      expect(ultimo?.animaOpacidad).toBe(true)
      expect(ultimo?.cierreDeAnimacionMs).toBeGreaterThan(DURACION_DE_LA_ENTRADA_MS)
      expect(ultimo?.instanteMs).toBeGreaterThanOrEqual((ultimo?.cierreDeAnimacionMs ?? Infinity) - UN_FOTOGRAMA_MS)
    }
  })

  test('un titular con 3 s de retardo y la espera del método (1,5 s) no llega a verse: sin cabecera, 0 candidatos y falla el recuento', async ({
    browser,
  }) => {
    const tardio = { relleno: 'backwards', retardoMs: RETARDO_DE_3_S_MS, cabecera: false } as const

    const cargas = await medirEnParalelo(peticionSintetica(browser, tardio))

    expect(valorarLasCargas(cargas)).toEqual(unFalloPorCarga(FALLO_DE_RECUENTO))
  })

  test('con ese mismo retardo y una cabecera con texto, el último candidato es la cabecera y falla el elemento: ni el recuento ni la mediana lo ven', async ({
    browser,
  }) => {
    const tardio = { relleno: 'backwards', retardoMs: RETARDO_DE_3_S_MS, cabecera: true } as const

    const cargas = await medirEnParalelo(peticionSintetica(browser, tardio))

    expect(valorarLasCargas(cargas)).toEqual(unFalloPorCarga(FALLO_DE_ELEMENTO))
  })

  test('con una espera más larga que la del método, el titular con 3 s de retardo SÍ se ve y la mediana supera 2500 ms', async ({ browser }) => {
    const tardio = { relleno: 'backwards', retardoMs: RETARDO_DE_3_S_MS, cabecera: true } as const

    const cargas = await medirEnParalelo(peticionSintetica(browser, tardio, ESPERA_QUE_ALCANZA_EL_RETARDO_MS))

    expect(valorarLasCargas(cargas)).toEqual([expect.stringMatching(FALLO_DE_MEDIANA)])
  })

  for (const relleno of ['both', 'forwards'] as const) {
    test(`con el relleno "${relleno}" el titular animado nunca llega a ser candidato: sin otro contenido, 0 candidatos y falla el recuento`, async ({
      browser,
    }) => {
      const compuesto = { relleno, retardoMs: 0, cabecera: false } as const

      const cargas = await medirEnParalelo(peticionSintetica(browser, compuesto))

      expect(valorarLasCargas(cargas)).toEqual(unFalloPorCarga(FALLO_DE_RECUENTO))
    })

    test(`con el relleno "${relleno}" y una cabecera con texto, el candidato se queda en la cabecera: falla el elemento esperado, no un verde artificial`, async ({
      browser,
    }) => {
      const compuesto = { relleno, retardoMs: 0, cabecera: true } as const

      const cargas = await medirEnParalelo(peticionSintetica(browser, compuesto))

      expect(valorarLasCargas(cargas)).toEqual(unFalloPorCarga(FALLO_DE_ELEMENTO))
    })
  }

  test('una página sin ningún contenido pintable da 0 candidatos en cada carga y falla el recuento', async ({ browser }) => {
    const cargas = await medirEnParalelo({
      browser,
      ventana: ESCRITORIO,
      destino: URL_SINTETICA,
      prepararPagina: servirPaginaSintetica(PAGINA_VACIA),
    })

    expect(cargas.map((carga) => carga.candidatos.length)).toEqual([0, 0, 0])
    expect(valorarLasCargas(cargas)).toEqual(unFalloPorCarga(FALLO_DE_RECUENTO))
  })

  test('sobre la portada REAL, con su foto retenida 3 s, la mediana supera 2500 ms: la medida real puede ponerse en rojo', async ({
    browser,
    baseURL,
  }) => {
    const conLaFotoRetenida = async (page: Page): Promise<void> => {
      await page.route('**/clinica.webp', async (ruta) => {
        await new Promise((resolver) => setTimeout(resolver, RETENCION_DE_LA_FOTO_MS))
        await ruta.continue()
      })
    }

    const cargas = await medirEnParalelo({
      browser,
      ventana: ESCRITORIO,
      baseURL,
      destino: RUTA_DE_LA_PORTADA,
      prepararPagina: conLaFotoRetenida,
    })

    expect(valorarLasCargas(cargas)).toEqual([expect.stringMatching(FALLO_DE_MEDIANA)])
    expect(cargas.map((carga) => carga.candidatos.at(-1)?.elemento)).toEqual(['IMG', 'IMG', 'IMG'])
  })
})

// ---------------------------------------------------------------------------
// 6. La valoración, aislada: cada cláusula y sus bordes, sin navegador
// ---------------------------------------------------------------------------

function candidato(instanteMs: number, elemento: string, enElHero: boolean): CandidatoDeLcp {
  return { instanteMs, elemento, areaPx: 0, enElHero, animaOpacidad: false, cierreDeAnimacionMs: null }
}

function cargaDe(...candidatos: CandidatoDeLcp[]): CargaMedida {
  return { candidatos, cls: 0 }
}

function cargaConUltimo(instanteMs: number): CargaMedida {
  return cargaDe(candidato(instanteMs, 'IMG', true))
}

test.describe('@s11 de hero_reducido_con_animacion: la valoración de las cargas, aislada', () => {
  test('cinco cargas dentro del umbral, con candidato en el hero, no dan ningún fallo', () => {
    const cargas = [132, 136, 152, 104, 96].map(cargaConUltimo)

    expect(valorarLasCargas(cargas)).toEqual([])
  })

  test('una carga sin ningún candidato observado es un fallo que nombra esa carga', () => {
    const cargas = [cargaConUltimo(100), cargaDe(), cargaConUltimo(120)]

    expect(valorarLasCargas(cargas)).toEqual([expect.stringMatching(/carga 2.*0 candidatos/)])
  })

  test('un último candidato que no está en el hero (el texto de la cabecera) es un fallo, aunque llegue pronto', () => {
    const cargas = [cargaDe(candidato(28, 'HEADER', false)), cargaConUltimo(120)]

    expect(valorarLasCargas(cargas)).toEqual([expect.stringMatching(/carga 1.*HEADER.*hero/)])
  })

  test('la mediana por encima de 2500 ms es un fallo, y una sola carga lenta entre cinco no lo es (la mediana, no el máximo)', () => {
    const lentas = [3000, 3100, 3200, 100, 100].map(cargaConUltimo)
    const unaLenta = [3156, 220, 296, 220, 264].map(cargaConUltimo)

    expect(valorarLasCargas(lentas)).toEqual([expect.stringMatching(/mediana.*3000.*2500/)])
    expect(valorarLasCargas(unaLenta)).toEqual([])
  })

  test('el umbral es «menor o igual»: 2500 ms pasa y 2501 ms no', () => {
    expect(valorarLasCargas([2500, 2500, 2500].map(cargaConUltimo))).toEqual([])
    expect(valorarLasCargas([2501, 2501, 2501].map(cargaConUltimo))).toEqual([expect.stringMatching(/mediana.*2501/)])
  })

  test('con un número par de medidas la mediana es la media de las dos centrales, ni la menor ni la mayor', () => {
    expect(valorarLasCargas([2000, 2900].map(cargaConUltimo))).toEqual([])
    expect(valorarLasCargas([2400, 2700].map(cargaConUltimo))).toEqual([expect.stringMatching(/mediana.*2550/)])
  })

  test('sin ningún candidato en ninguna carga solo falla el recuento: no hay mediana que juzgar', () => {
    const cargas = [cargaDe(), cargaDe()]

    expect(valorarLasCargas(cargas)).toEqual([expect.stringMatching(/carga 1.*0 candidatos/), expect.stringMatching(/carga 2.*0 candidatos/)])
  })
})
