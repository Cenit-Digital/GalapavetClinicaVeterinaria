/**
 * Setup global de la suite.
 *
 * Dos trabajos:
 *  1. Rellenar lo que jsdom NO implementa y esta app sí usa. Verificado sobre el
 *     código de jsdom 30: no existen `matchMedia`, `IntersectionObserver` ni
 *     `ResizeObserver`; `Element.prototype.scrollIntoView/scrollBy/scrollTo`
 *     tampoco existen; y `window.scroll*` sí existe pero es un stub que emite un
 *     `jsdomError` de tipo "not-implemented" a la consola de Node.
 *  2. Convertir cualquier `console.error` o `console.warn` en un test ROJO. El
 *     proyecto se entrega con cero warnings, y un warning que solo se imprime es
 *     un warning que nadie lee.
 *
 * La forma de cada doble sigue la especificación de MDN para que producción no
 * note la diferencia; el mecanismo (`vi.stubGlobal`, `vi.fn`) es API oficial de
 * Vitest.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

/** `MediaQueryList` mínimo pero con la forma real: `EventTarget` + `matches` + `media`. */
function listaDeMedios(consulta: string, coincide: boolean): MediaQueryList {
  const objetivo = new EventTarget()
  return {
    matches: coincide,
    media: consulta,
    onchange: null,
    addEventListener: objetivo.addEventListener.bind(objetivo),
    removeEventListener: objetivo.removeEventListener.bind(objetivo),
    dispatchEvent: objetivo.dispatchEvent.bind(objetivo),
    // Deprecados en MDN, pero aún presentes en la interfaz: si producción los
    // llamara y no existieran, reventaría con un TypeError opaco.
    addListener: () => {},
    removeListener: () => {},
  } as MediaQueryList
}

/**
 * `matchMedia` por defecto: nada coincide. Un test que necesite una preferencia
 * concreta (móvil, `prefers-reduced-motion`) la impone él, anclando la consulta
 * a un literal escrito a mano — nunca a la constante importada de producción,
 * o el doble mutaría con ella y el mutante sobreviviría.
 */
function instalarMatchMedia(): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((consulta: string) => listaDeMedios(consulta, false)),
  )
}

class ObservadorInerte {
  readonly root: Element | null = null
  readonly rootMargin: string = '0px 0px 0px 0px'
  readonly thresholds: readonly number[] = [0]
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

function instalarObservadores(): void {
  vi.stubGlobal('IntersectionObserver', ObservadorInerte)
  vi.stubGlobal('ResizeObserver', ObservadorInerte)
}

/**
 * jsdom no hace layout, así que no puede desplazar nada. Se sustituyen por
 * espías: los tests afirman que se pidió el desplazamiento y con qué argumentos,
 * no que el píxel se moviera —eso solo lo puede verificar un navegador real—.
 */
function instalarDesplazamiento(): void {
  vi.stubGlobal('scrollTo', vi.fn<typeof window.scrollTo>())
  vi.stubGlobal('scrollBy', vi.fn<typeof window.scrollBy>())
  Element.prototype.scrollIntoView = vi.fn<Element['scrollIntoView']>()
  Element.prototype.scrollTo = vi.fn<
    (x?: number | ScrollToOptions, y?: number) => void
  >() as unknown as Element['scrollTo']
  Element.prototype.scrollBy = vi.fn<
    (x?: number | ScrollToOptions, y?: number) => void
  >() as unknown as Element['scrollBy']
}

let espiaError: ReturnType<typeof vi.spyOn>
let espiaAviso: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  instalarMatchMedia()
  instalarObservadores()
  instalarDesplazamiento()
  localStorage.clear()

  espiaError = vi.spyOn(console, 'error').mockImplementation(() => {})
  espiaAviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()

  const emitidos = [...espiaError.mock.calls, ...espiaAviso.mock.calls]
  espiaError.mockRestore()
  espiaAviso.mockRestore()

  if (emitidos.length > 0) {
    throw new Error(
      'La consola emitió ' +
        emitidos.length +
        ' aviso(s) durante el test; el proyecto se entrega con cero warnings:\n' +
        emitidos.map((llamada) => llamada.map(String).join(' ')).join('\n'),
    )
  }
})
