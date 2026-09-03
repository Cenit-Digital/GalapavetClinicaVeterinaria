import type { EntradaGaleria } from '../data/galeria'

/**
 * Lógica de decisión de `Galeria`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

/**
 * Descarta las entradas sin nombre publicado (@s17): un nombre en blanco no
 * identifica ninguna fotografía real, y no debe arrastrar a las demás
 * entradas del catálogo fuera de la sección.
 */
export function entradasValidas(catalogo: readonly EntradaGaleria[]): EntradaGaleria[] {
  return catalogo.filter((entrada) => entrada.nombre.trim() !== '')
}

/**
 * Separación entre tarjetas: el `gap` REAL de la pista, `espaciado(16)` en
 * `Galeria.module.scss`. El contrato (`features/galeria.feature`, cabecera,
 * PENDIENTE 3) heredaba 18px del prototipo y dejaba dicho que el valor se
 * re-mediría sobre la escala del repo: re-medido en `fidelidad_galeria` @s3
 * (03/09/2026), porque el paso de desplazamiento tiene que ser "ancho de
 * tarjeta + separación efectiva" y 18 no existe en la escala de 8.
 *
 * `Galeria-logica.test.ts` la ancla contra el literal `16` escrito a mano
 * (mismo patrón que `PUNTO_DE_CORTE_NAVEGACION_PX` en
 * `Cabecera-logica.test.ts:6`), para que un mutante que cambie este valor se
 * detecte: el resto de aserciones que la usan como parte del cálculo
 * esperado (`ancho + SEPARACION_ENTRE_TARJETAS_PX`) son tautológicas por sí
 * solas y no bastan (`progress/judge_galeria.md`, ronda 1, hallazgo 1). El
 * ancho de tarjeta en sí no es medible en jsdom (no hay layout), por eso se
 * mockea con `fijarAnchoDePrimeraTarjeta`; eso es independiente de que esta
 * separación quede o no mordida.
 */
export const SEPARACION_ENTRE_TARJETAS_PX = 16

export type Sentido = 'anterior' | 'siguiente'

export interface SolicitudDeDesplazamiento {
  /** Con signo: positivo hacia el final, negativo hacia el principio. */
  readonly distanciaPx: number
  readonly suave: boolean
}

/**
 * Calcula la solicitud de desplazamiento de la pista para el sentido dado.
 * Sin una tarjeta con ancho medible (0, tarjeta aún no montada o layout
 * inexistente) no hay solicitud: falla cerrado devolviendo `null` en vez de
 * desplazar una distancia inventada (@s10).
 */
export function calcularSolicitudDeDesplazamiento(
  anchoTarjetaPx: number,
  sentido: Sentido,
  prefiereMenos: boolean,
): SolicitudDeDesplazamiento | null {
  if (anchoTarjetaPx <= 0) {
    return null
  }
  const paso = anchoTarjetaPx + SEPARACION_ENTRE_TARJETAS_PX
  const signo = sentido === 'siguiente' ? 1 : -1
  return {
    distanciaPx: signo * paso,
    suave: !prefiereMenos,
  }
}

const CONSULTA_MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)'

/**
 * Lee la preferencia real de menos movimiento del sistema. Si la consulta no
 * está disponible (entorno sin `matchMedia`), falla cerrado hacia "prefiere
 * menos movimiento": es la opción segura, nunca revienta y nunca anima de
 * más (@s8).
 */
export function prefiereMenosMovimiento(consultarMedios: typeof window.matchMedia | undefined): boolean {
  if (typeof consultarMedios !== 'function') {
    return true
  }
  return consultarMedios(CONSULTA_MENOS_MOVIMIENTO).matches
}
