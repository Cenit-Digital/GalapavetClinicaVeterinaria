import { coloresDeMarca } from '../lib/tokens'

/**
 * Catálogo de las 4 variantes de la marca real de Galapavet. Fuente:
 * Decisión 8 de `project-spec.md` y cabecera de
 * `features/selector_paleta.feature`. Los tokens exactos de la variante
 * "noche" (fondo, superficies) están PENDIENTES de `tokens_marca`: este
 * catálogo no inventa ningún hexadecimal no verificado, y reutiliza los tres
 * colores de marca ya verificados como muestras decorativas para las cuatro
 * variantes (`aria-hidden`, @s4).
 */
export interface VariantePaleta {
  readonly id: string
  readonly nombre: string
  readonly muestras: readonly [string, string, string]
}

const MUESTRAS_DE_MARCA: readonly [string, string, string] = [
  coloresDeMarca.morado,
  coloresDeMarca.lima,
  coloresDeMarca.verdeProfundo,
]

export const VARIANTES_PALETA: readonly VariantePaleta[] = [
  { id: 'marca', nombre: 'Marca Galapavet', muestras: MUESTRAS_DE_MARCA },
  { id: 'lima', nombre: 'Lima de superficie', muestras: MUESTRAS_DE_MARCA },
  { id: 'verde', nombre: 'Verde profundo', muestras: MUESTRAS_DE_MARCA },
  { id: 'noche', nombre: 'Marca en oscuro', muestras: MUESTRAS_DE_MARCA },
] as const satisfies readonly VariantePaleta[]
