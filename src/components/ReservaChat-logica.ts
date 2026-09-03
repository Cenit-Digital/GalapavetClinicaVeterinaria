/**
 * Lógica de decisión de `ReservaChat`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

/** Una respuesta hecha solo de espacios no cuenta como respuesta (@s6/@s7/@s21). */
export function puedeRegistrarRespuesta(texto: string): boolean {
  return texto.trim().length > 0
}

/** El valor que se registra en el historial va sin espacios sobrantes (@s10/@s21). */
export function normalizarRespuesta(texto: string): string {
  return texto.trim()
}

const SEPARADOR_RESUMEN = ' · '

/** Compone el resumen "A · B · C" a partir de las tres primeras respuestas (@s8/@s11/@s22). */
export function componerResumen(servicio: string, animal: string, cuando: string): string {
  return [servicio, animal, cuando].join(SEPARADOR_RESUMEN)
}

/** Identificador de cada paso del guion, incluidos los dos estados terminales. */
export type IdPaso = 'servicio' | 'animal' | 'cuando' | 'nombre' | 'final' | 'urgencia'

/** La única opción del paso "servicio" que corta el guion en vez de continuarlo (@s14/@s23). */
export const OPCION_URGENCIA = 'Es una urgencia'

/**
 * Deriva el paso siguiente a partir del paso actual y la respuesta dada.
 * Elegir "Es una urgencia" en el paso "servicio" deriva a `'urgencia'` en vez
 * de continuar a `'animal'` (@s14/@s23, Decisión 5 de `project-spec.md`); los
 * dos estados terminales (`'final'`, `'urgencia'`) no tienen paso siguiente y
 * se devuelven a sí mismos.
 */
export function siguientePaso(pasoActual: IdPaso, respuesta: string): IdPaso {
  switch (pasoActual) {
    case 'servicio':
      return respuesta === OPCION_URGENCIA ? 'urgencia' : 'animal'
    case 'animal':
      return 'cuando'
    case 'cuando':
      return 'nombre'
    case 'nombre':
      return 'final'
    case 'final':
    case 'urgencia':
      return pasoActual
  }
}

/** Quién dice cada mensaje del historial; es también el valor de `data-autor` de su burbuja (@s20, @s4 de `fidelidad_reserva`). */
export type AutorDeMensaje = 'asistente' | 'visitante'

export const AUTOR_ASISTENTE: AutorDeMensaje = 'asistente'
export const AUTOR_VISITANTE: AutorDeMensaje = 'visitante'

/** Los dos autores posibles, en el orden en que abren el guion. */
export const AUTORES_DE_MENSAJE: readonly AutorDeMensaje[] = [AUTOR_ASISTENTE, AUTOR_VISITANTE]

const ROTULO_POR_AUTOR: Readonly<Record<AutorDeMensaje, string>> = {
  asistente: 'Asistente',
  visitante: 'Tú',
}

const SEPARADOR_DE_ROTULO = ': '

/**
 * Antepone al texto el rótulo de su autor ("Asistente: …" / "Tú: …"): cada
 * mensaje dice quién lo dice sin depender del color de la burbuja (@s20).
 */
export function rotularMensaje(autor: AutorDeMensaje, texto: string): string {
  return `${ROTULO_POR_AUTOR[autor]}${SEPARADOR_DE_ROTULO}${texto}`
}
