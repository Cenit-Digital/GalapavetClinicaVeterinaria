/**
 * Lógica de decisión de `Servicios`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

const ROTULO_CERRADO = 'Ver qué incluye'

/** Rótulo visible del botón de una tarjeta, según su estado de expansión (@s2/@s10/@s11). */
export function rotuloBoton(abierto: boolean): string {
  if (abierto) {
    return 'Ocultar detalle'
  }
  return ROTULO_CERRADO
}

/** Descarta los puntos en blanco del desglose publicado (@s16): un espacio no es un punto real. */
export function puntosVisibles(puntos: readonly string[]): string[] {
  return puntos.filter((punto) => punto.trim().length > 0)
}

/** Si el bloque no tiene ni un punto real, no ofrece botón de desplegar ni lista (@s15). */
export function tieneDesglose(puntos: readonly string[]): boolean {
  return puntosVisibles(puntos).length > 0
}

/**
 * Nombre accesible del botón de una tarjeta: el rótulo visible es el mismo en
 * las 12 tarjetas del prototipo heredado, así que se identifica el bloque
 * dentro del `aria-label` sin cambiar el texto visible (@s14, Aviso 6 de
 * `features/servicios.feature`).
 */
export function nombreAccesibleBoton(rotulo: string, tituloBloque: string): string {
  return `${rotulo} de ${tituloBloque}`
}

/**
 * Píldora de categoría de una tarjeta de servicio: la primera palabra
 * significativa del título del bloque (@s31). Deriva SIEMPRE del título
 * real -- nunca un literal fijo -- así que dos bloques con títulos
 * distintos muestran píldoras distintas.
 */
export function categoriaDeServicio(tituloBloque: string): string {
  const [primeraPalabra] = tituloBloque.trim().split(/\s+/)
  return primeraPalabra ?? ''
}
