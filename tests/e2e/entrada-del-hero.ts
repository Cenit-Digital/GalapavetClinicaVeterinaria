// El ayudante `esperarEntradaTerminada` de `features/hero_reducido_con_animacion.feature` @s10.
// Vive en `tests/e2e/` y NO en `src/lib/`: es infraestructura de prueba de navegador real (mismo
// criterio que `utilidades.ts`), fuera de la superficie de StrykerJS. Se prueba aislado, contra
// páginas sintéticas, en `esperar-entrada-terminada.spec.ts`.
//
// API de DOS FASES (la otra posibilidad del contrato era meter el `goto` dentro del ayudante):
//   1. `registrarEntradaDelHero(page | context)` ANTES del `goto`: instala el registro de
//      `animationstart` y `animationend` con `addInitScript`. Un listener instalado después compite
//      con `load` (en la app real el titular se monta 10-17 ms después) y pierde. Sobre un contexto
//      cubre también las páginas abiertas con `context.newPage()`.
//   2. `esperarEntradaTerminada(page)` DESPUÉS del `goto` y ANTES de la primera medición.
// Si la fase 1 se olvida, la 2 falla en voz alta: nunca mide a ciegas.
import { errors, type Page } from 'playwright/test'

/** Dónde cuelga el registro en la `window` de cada documento: un solo literal, compartido con el lado del navegador. */
const CLAVE_DEL_REGISTRO = '__registroDeEntradaDelHero'

/**
 * El contenedor del titular, el párrafo y el botón (`Hero.tsx`). El registro cuenta SOLO las animaciones
 * cuyo objetivo cuelga de él: el documento puede tener otras ajenas a la entrada (la cabecera de la
 * feature 49, un indicador de carga) y, contadas, adelantarían el ancla antes de que arranque la tercera
 * del hero, o impedirían que `fines >= arranques` se cumpliera nunca.
 */
const SELECTOR_DEL_HERO = '[data-hero-contenido]'

/** Las tres animaciones de la entrada del hero (titular, párrafo y botón): @s5 de la feature. */
const ANIMACIONES_DE_ENTRADA_DEL_HERO = 3

/**
 * La entrada completa dura 940 ms y, medido sobre el `dist/` real, su último `animationend` llega a
 * `load` + 980-1015 ms. Este tope es holgura para una máquina lenta, no una espera prevista.
 */
const TOPE_POR_DEFECTO_MS = 10_000

/** Lo que el navegador necesita saber, en UN solo objeto: las funciones que se le envían se serializan y no pueden cerrar sobre constantes del módulo. */
interface ParametrosDelNavegador {
  readonly clave: string
  readonly selectorDelHero: string
  readonly arranquesEsperados: number
}

const PARAMETROS_DEL_NAVEGADOR: ParametrosDelNavegador = {
  clave: CLAVE_DEL_REGISTRO,
  selectorDelHero: SELECTOR_DEL_HERO,
  arranquesEsperados: ANIMACIONES_DE_ENTRADA_DEL_HERO,
}

interface RegistroEnLaPagina {
  arranques: number
  fines: number
}

/**
 * Lo que el navegador instala, ANTES de cualquier script de la página. Se serializa: no puede cerrar
 * sobre nada de fuera. Instalado a la vez en el contexto y en la página, la segunda copia sustituye al
 * registro de la primera y cuenta ella sola: no hay doble recuento.
 */
function instalarElRegistro({ clave, selectorDelHero }: ParametrosDelNavegador): void {
  const registro: RegistroEnLaPagina = { arranques: 0, fines: 0 }
  ;(window as unknown as Record<string, RegistroEnLaPagina>)[clave] = registro
  const esDelHero = (evento: Event): boolean =>
    evento.target instanceof Element && evento.target.closest(selectorDelHero) !== null
  window.addEventListener('animationstart', (evento) => (registro.arranques += esDelHero(evento) ? 1 : 0), true)
  window.addEventListener('animationend', (evento) => (registro.fines += esDelHero(evento) ? 1 : 0), true)
}

/** Lo que el registro dice en este instante, más si el titular del hero ya existe. */
export interface EstadoDelRegistro {
  readonly instalado: boolean
  readonly titular: boolean
  readonly arranques: number
  readonly fines: number
}

export async function leerRegistroDeEntrada(page: Page): Promise<EstadoDelRegistro> {
  return page.evaluate(({ clave, selectorDelHero }) => {
    const registro = (window as unknown as Record<string, RegistroEnLaPagina | undefined>)[clave]
    return {
      instalado: registro !== undefined,
      titular: document.querySelector(`${selectorDelHero} h1`) !== null,
      arranques: registro?.arranques ?? 0,
      fines: registro?.fines ?? 0,
    }
  }, PARAMETROS_DEL_NAVEGADOR)
}

/** PRIMERA FASE: instala el registro de `animationstart` y `animationend`. Antes del `goto`. */
export async function registrarEntradaDelHero(destino: Pick<Page, 'addInitScript'>): Promise<void> {
  await destino.addInitScript(instalarElRegistro, PARAMETROS_DEL_NAVEGADOR)
}

export interface OpcionesDeLaEspera {
  /** Cuánto esperar, como máximo, en cada una de las dos esperas. Mayor que 0. */
  readonly topeMs?: number
}

function describirElEstado(estado: EstadoDelRegistro): string {
  return `titular: ${estado.titular}, arranques: ${estado.arranques}, fines: ${estado.fines}`
}

/**
 * El estado del registro para el mensaje del tope. Si la página ya no responde (se cerró, navegó), la
 * lectura falla: ese fallo NO debe tapar al del tope, que es el que explica por qué se paró la espera.
 */
async function describirElEstadoSiSePuede(page: Page): Promise<string> {
  try {
    return describirElEstado(await leerRegistroDeEntrada(page))
  } catch (error) {
    return `no se pudo leer el registro: ${error instanceof Error ? error.message : String(error)}`
  }
}

/** El ANCLA: existe el titular del hero y el registro muestra el arranque de las tres. */
async function esperarAlAncla(page: Page, topeMs: number): Promise<void> {
  await page.waitForFunction(
    ({ clave, selectorDelHero, arranquesEsperados }) => {
      const registro = (window as unknown as Record<string, RegistroEnLaPagina | undefined>)[clave]
      return (
        document.querySelector(`${selectorDelHero} h1`) !== null &&
        registro !== undefined &&
        registro.arranques >= arranquesEsperados
      )
    },
    PARAMETROS_DEL_NAVEGADOR,
    { timeout: topeMs },
  )
}

/** Que ninguna de las que arrancaron siga en curso. */
async function esperarAQueNoQuedeNingunaEnCurso(page: Page, topeMs: number): Promise<void> {
  await page.waitForFunction(
    (clave) => {
      const registro = (window as unknown as Record<string, RegistroEnLaPagina | undefined>)[clave]
      return registro !== undefined && registro.fines >= registro.arranques
    },
    CLAVE_DEL_REGISTRO,
    { timeout: topeMs },
  )
}

async function exigirElRegistro(page: Page): Promise<void> {
  if (!(await leerRegistroDeEntrada(page)).instalado) {
    throw new Error(
      'esperarEntradaTerminada: esta página no tiene el registro de animaciones; llama a registrarEntradaDelHero(page) ANTES del goto (instalado después, no existe en el documento ya cargado)',
    )
  }
}

/**
 * SEGUNDA FASE: espera a que la entrada del hero haya terminado, leyendo el registro y NO
 * `document.getAnimations()` (con relleno hacia atrás una animación terminada desaparece de ahí, y
 * «había 3» daría 0 en una máquina lenta con el código correcto).
 *
 * Dos esperas, en este orden. Primero el ANCLA: que exista el titular y que el registro muestre el
 * arranque de las tres; sin ella, un hero que se monta después de `load` hace que
 * `fines >= arranques` se cumpla con 0 y 0, y la espera vuelve a los ~14 ms sin haber visto nada.
 * Solo después, que no quede ninguna en curso. Las dos cuentan únicamente las animaciones del hero.
 *
 * Con TOPE: si vence con la entrada sin terminar, LANZA un error y el test falla en vez de medir una
 * página en movimiento. El tope ha de ser mayor que 0: Playwright entiende `timeout: 0` como «espera
 * para siempre», que es justo el mutante «tope inexistente».
 */
export async function esperarEntradaTerminada(page: Page, opciones: OpcionesDeLaEspera = {}): Promise<void> {
  const topeMs = opciones.topeMs ?? TOPE_POR_DEFECTO_MS
  if (!(topeMs > 0)) {
    throw new Error(`esperarEntradaTerminada: el tope tiene que ser mayor que 0 (recibido ${topeMs}); con 0 Playwright espera para siempre`)
  }
  await exigirElRegistro(page)

  try {
    await esperarAlAncla(page, topeMs)
    await esperarAQueNoQuedeNingunaEnCurso(page, topeMs)
  } catch (error) {
    if (!(error instanceof errors.TimeoutError)) {
      throw error
    }
    throw new Error(
      `esperarEntradaTerminada: se agotó el tope de ${topeMs} ms con la entrada del hero sin terminar (${await describirElEstadoSiSePuede(page)}); no se mide una portada en movimiento`,
      { cause: error },
    )
  }
}
