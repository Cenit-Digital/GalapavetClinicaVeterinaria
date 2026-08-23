/**
 * Comprobación de visibilidad sin animación (Bloque D,
 * `features/accesibilidad.feature` @s20) — SC 2.3.3 / técnica C39. Evalúa un
 * inventario DECLARADO de bloques que en condiciones normales aparecen
 * mediante una animación de entrada, y falla si alguno queda invisible
 * cuando esa animación no se ejecuta (Invariante 4:
 * `estado-base-visible-ssg-reduced-motion` — el estado base en CSS es el
 * estado final visible).
 *
 * La animación CSS en curso en sí (@s19) y el resto de @s21/@s22 exigen
 * interrogar el motor de animaciones con las hojas de estilo aplicadas: eso
 * es competencia del navegador real (Decisión 11, project-spec.md).
 */

export interface BloqueQueApareceAnimando {
  readonly nombre: string
  /** Si el contenido de este bloque está en el DOM/visible incluso si su animación no llega a ejecutarse. */
  readonly visibleSinAnimacion: boolean
}

export interface InformeDeVisibilidadSinAnimacion {
  readonly pasa: boolean
  readonly bloquesComprobados: number
  readonly bloquesInvisibles: readonly string[]
}

/** Comprueba que ningún bloque animado queda invisible sin su animación (@s20). */
export function ejecutarComprobacionDeVisibilidadSinAnimacion(
  bloques: readonly BloqueQueApareceAnimando[],
): InformeDeVisibilidadSinAnimacion {
  const bloquesInvisibles = bloques.filter((bloque) => !bloque.visibleSinAnimacion).map((bloque) => bloque.nombre)

  return { pasa: bloquesInvisibles.length === 0, bloquesComprobados: bloques.length, bloquesInvisibles }
}
