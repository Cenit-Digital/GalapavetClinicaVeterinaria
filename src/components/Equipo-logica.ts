import type { Profesional } from '../data/equipo'

/**
 * Lógica de decisión de `Equipo`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

/** Rótulo/nombre accesible del botón de una tarjeta, según su estado (@s3/@s4/@s5/@s6). */
export function rotuloBoton(abierto: boolean, nombre: string): string {
  if (abierto) {
    return `Ocultar la formación de ${nombre}`
  }
  return `Ver la formación de ${nombre}`
}

/** Una tarjeta solo ofrece botón de desplegar si el profesional tiene formación publicada (@s3/@s7). */
export function tieneFormacion(formacion: string | undefined): boolean {
  return formacion !== undefined
}

/** Cuántas palabras del nombre aportan inicial al avatar: nombre + primer apellido (@s32). */
const PALABRAS_QUE_APORTAN_INICIAL = 2

/**
 * Iniciales del avatar decorativo de una tarjeta (@s32): la primera letra de
 * las dos primeras palabras del nombre real (nombre + primer apellido), no
 * solo de la primera. Un nombre de una sola palabra devuelve esa única
 * inicial, sin reventar.
 */
export function inicialesDe(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, PALABRAS_QUE_APORTAN_INICIAL)
    .map((palabra) => palabra[0])
    .join('')
}

/** Descarta los profesionales sin nombre publicado (@s9): un nombre vacío no es un profesional real. */
export function profesionalesValidos(listado: readonly Profesional[]): Profesional[] {
  return listado.filter((profesional) => profesional.nombre.length > 0)
}
