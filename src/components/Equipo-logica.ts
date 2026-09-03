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
 *
 * Recorta los extremos ANTES de partir: así el separador `/\s+/` (una tanda de
 * blancos, no un solo blanco) es lo único que decide dónde acaba cada palabra
 * y no hace falta filtrar huecos después. El `.filter(Boolean)` que había aquí
 * era redundante con `.trim()` y volvía **equivalente** al mutante que quita el
 * cuantificador (`/\s+/` → `/\s/`): filtradas las cadenas vacías, ambas
 * versiones daban el mismo resultado para cualquier entrada y ningún test podía
 * morderlo. Ver `progress/mutation_fidelidad_equipo.md`, medición 2.
 */
export function inicialesDe(nombre: string): string {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, PALABRAS_QUE_APORTAN_INICIAL)
    .map((palabra) => palabra[0])
    .join('')
}

/** Descarta los profesionales sin nombre publicado (@s9): un nombre vacío no es un profesional real. */
export function profesionalesValidos(listado: readonly Profesional[]): Profesional[] {
  return listado.filter((profesional) => profesional.nombre.length > 0)
}

/** Si algún profesional del listado tiene formación publicada, la cabecera puede invitar a pulsar el «+» (@s1 de `fidelidad_equipo`). */
export function hayFormacionPublicada(listado: readonly Profesional[]): boolean {
  return listado.some((profesional) => tieneFormacion(profesional.formacion))
}

/** Los recuentos cortos de la cabecera se escriben en letra, como en el prototipo; el índice es `recuento - 1`. */
const RECUENTOS_EN_LETRA: readonly string[] = ['Un', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve']

/** «Dos» para 2; a partir de diez, la cifra tal cual (@s1 de `fidelidad_equipo`). */
export function recuentoEnLetra(recuento: number): string {
  return RECUENTOS_EN_LETRA[recuento - 1] ?? String(recuento)
}

const PISTA_DE_FORMACION = ' Pulsa el + para ver la formación publicada.'

/**
 * Párrafo de la cabecera de la sección (@s1 de `fidelidad_equipo`): deriva
 * del recuento real y del nombre comercial de la fuente única. No afirma
 * colegiación, antigüedad, permanencia ni disponibilidad (el copy del
 * prototipo, «Seis profesionales colegiados que verás siempre por aquí», es
 * falso y está prohibido por `equipo.feature`, cabecera, punto 4). Sin
 * profesionales no hay nada que derivar.
 */
export function resumenDelEquipo(recuento: number, hayFormacion: boolean, nombreComercial: string): string {
  if (recuento === 0) {
    return ''
  }
  const sujeto = recuento === 1 ? 'Un profesional' : `${recuentoEnLetra(recuento)} profesionales`
  const frase = `${sujeto} en el equipo de ${nombreComercial}.`
  return hayFormacion ? frase + PISTA_DE_FORMACION : frase
}

/**
 * Chips de especialidad de una tarjeta (@s3 de `fidelidad_equipo`): solo las
 * que publique la fuente única en el campo opcional `especialidades`, sin
 * blancos y en su orden. Sin campo no hay chips: los dos profesionales reales
 * no lo tienen (`docs/datos-galapavet.md` §9) y no se inventa ninguno.
 */
export function especialidadesVisibles(especialidades: readonly string[] | undefined): string[] {
  return (especialidades ?? []).map((especialidad) => especialidad.trim()).filter((especialidad) => especialidad.length > 0)
}
