import type { VariantePaleta } from '../data/variantesPaleta'

/**
 * Lógica de decisión de `SelectorPaleta`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 *
 * `resolverVarianteInicial` es además el GEMELO PURO del script anti-destello
 * de `index.html` (patrón `logica-pre-pintado-inline-se-espeja-en-gemelo-puro-testeable`):
 * el inline no se puede importar (corre antes de que exista el bundle), así
 * que se le pone esta réplica testeable y se ancla su fidelidad con un test
 * de integridad que lee `index.html` como texto (@s10).
 */

export const CLAVE_ALMACENAMIENTO_VARIANTE = 'galapavet-variante'
export const VARIANTE_POR_DEFECTO = 'marca'

export interface AlmacenamientoDeLectura {
  getItem(clave: string): string | null
}

/**
 * Lee el valor crudo guardado bajo la clave del selector, sin lanzar nunca
 * (@s14): un almacenamiento que lanza al leer no debe impedir cargar la
 * página, cae a `null` como si no hubiera preferencia guardada.
 */
export function leerVarianteAlmacenada(almacenamiento: AlmacenamientoDeLectura): string | null {
  try {
    return almacenamiento.getItem(CLAVE_ALMACENAMIENTO_VARIANTE)
  } catch {
    return null
  }
}

export interface AlmacenamientoDeEscritura {
  setItem(clave: string, valor: string): void
}

/**
 * Persiste la variante elegida, sin lanzar nunca (@s15): un almacenamiento
 * que lanza al escribir no debe romper el cambio de variante en pantalla.
 */
export function guardarVarianteElegida(almacenamiento: AlmacenamientoDeEscritura, id: string): void {
  try {
    almacenamiento.setItem(CLAVE_ALMACENAMIENTO_VARIANTE, id)
  } catch {
    // Intencionalmente silencioso: la interacción en pantalla no debe verse afectada (@s15).
  }
}

/** Ids del catálogo, en el mismo orden en que aparecen. */
function idsDelCatalogo(catalogo: readonly VariantePaleta[]): readonly string[] {
  return catalogo.map((variante) => variante.id)
}

/**
 * Réplica pura de la lógica del script anti-destello: decide qué variante
 * aplicar a partir del valor crudo ya leído de `localStorage` (que puede ser
 * `null`, cadena vacía, un id desconocido o texto corrupto) y el catálogo
 * vigente. Nunca lanza y nunca devuelve un id fuera del catálogo
 * (@s5/@s9/@s11/@s12/@s13).
 */
export function resolverVarianteInicial(stored: string | null, catalogo: readonly VariantePaleta[]): string {
  if (stored !== null && idsDelCatalogo(catalogo).includes(stored)) {
    return stored
  }
  return VARIANTE_POR_DEFECTO
}
