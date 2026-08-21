import { enlaceLlamada } from '../lib/telefono'

/**
 * Lógica de decisión de `InformacionContacto`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

/** Mismo tipo que las entradas de `datosNegocio.horario` (`src/lib/site.ts`). */
export interface TramoHorario {
  readonly dias: string
  readonly horas: string
}

export interface EnlaceTelefono {
  readonly textoVisible: string
  readonly href: string
}

/**
 * Deriva un enlace de llamada a partir de un teléfono legible: nunca se
 * escribe un `tel:` a mano (Invariante 2), siempre se deriva con
 * `enlaceLlamada`, que falla cerrado si el valor no normaliza (@s16).
 */
export function construirEnlaceTelefono(textoVisible: string): EnlaceTelefono {
  return { textoVisible, href: enlaceLlamada(textoVisible) }
}
