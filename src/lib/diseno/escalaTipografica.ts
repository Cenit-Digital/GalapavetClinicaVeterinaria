/**
 * Escala tipográfica fluida (metodología Utopia,
 * https://utopia.fyi/type/calculator/, ratio 1.25 "tercera mayor", base
 * 16px, viewport 320-1024px — Decisión 24 de `project-spec.md`). El ancho de
 * viewport máximo es literalmente `PUNTO_DE_CORTE_NAVEGACION_PX`
 * (`Cabecera-logica.ts`, ya `done`), no un valor nuevo (@s14): se IMPORTA en
 * vez de repetirse como literal, para que un cambio futuro de ese valor
 * vuelva roja esta comprobación sola.
 */
import { PUNTO_DE_CORTE_NAVEGACION_PX } from '../../components/Cabecera-logica'

export interface ParametrosEscalaTipografica {
  readonly ratio: number
  readonly baseNormalPx: number
  readonly viewportMinPx: number
  readonly viewportMaxPx: number
}

const RATIO_TIPOGRAFICO = 1.25
const BASE_NORMAL_PX = 16
const VIEWPORT_MIN_PX = 320

export function parametrosEscalaTipografica(): ParametrosEscalaTipografica {
  return {
    ratio: RATIO_TIPOGRAFICO,
    baseNormalPx: BASE_NORMAL_PX,
    viewportMinPx: VIEWPORT_MIN_PX,
    viewportMaxPx: PUNTO_DE_CORTE_NAVEGACION_PX,
  }
}

/**
 * Los pasos declarados de la escala, de "letra pequeña" (-2) a "titular" (5)
 * — 8 pasos, número y rango dejados explícitamente pendientes por la
 * cabecera de `sistema_de_diseno_visual.feature` dentro de la metodología
 * Utopia; esta es la decisión de `tdd_craftsman`.
 */
export const PASOS_ESCALA_TIPOGRAFICA: readonly number[] = [-2, -1, 0, 1, 2, 3, 4, 5]

export interface TamanoDePaso {
  readonly paso: number
  readonly minPx: number
  readonly maxPx: number
}

const DECIMALES_DE_REDONDEO = 100

function redondear(numero: number): number {
  return Math.round(numero * DECIMALES_DE_REDONDEO) / DECIMALES_DE_REDONDEO
}

/**
 * Tamaño de `paso` en cada extremo del viewport: `base * ratio^paso`. Con
 * los parámetros de la Decisión 24 (un único ratio y una única base, sin un
 * segundo valor para el extremo máximo), la fórmula da el MISMO resultado en
 * los dos extremos para cualquier paso — no solo el paso 0 (@s15) — lo que
 * @s16 ("menor o igual") y @s18 (saturación) admiten explícitamente.
 */
export function calcularTamanoDePaso(paso: number): TamanoDePaso {
  const { ratio, baseNormalPx } = parametrosEscalaTipografica()
  const tamanoPx = redondear(baseNormalPx * ratio ** paso)
  return { paso, minPx: tamanoPx, maxPx: tamanoPx }
}

/**
 * Tamaño de `paso` para un ancho de ventana dado: satura al tamaño del
 * viewport mínimo por debajo de él, al del máximo por encima, e interpola
 * linealmente entre ambos dentro del rango (@s18).
 */
export function tamanoEnViewport(paso: number, anchoViewportPx: number): number {
  const { viewportMinPx, viewportMaxPx } = parametrosEscalaTipografica()
  const { minPx, maxPx } = calcularTamanoDePaso(paso)

  if (anchoViewportPx <= viewportMinPx) {
    return minPx
  }
  if (anchoViewportPx >= viewportMaxPx) {
    return maxPx
  }

  const pendiente = (maxPx - minPx) / (viewportMaxPx - viewportMinPx)
  return redondear(minPx + pendiente * (anchoViewportPx - viewportMinPx))
}
