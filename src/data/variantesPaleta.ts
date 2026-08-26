import { VARIANTES_REDISENO } from '../lib/diseno/contratoRedisenho'

/**
 * Catálogo de las cinco variantes del rediseño. Sus colores no viven aquí:
 * cada muestra decorativa hereda los tokens de su bloque de `_tokens.scss`,
 * por lo que el selector no duplica ni inventa hexadecimal alguno.
 */
export interface VariantePaleta {
  readonly id: string
  readonly nombre: string
}

export const VARIANTES_PALETA: readonly VariantePaleta[] = [
  { id: VARIANTES_REDISENO[0], nombre: 'Clínica' },
  { id: VARIANTES_REDISENO[1], nombre: 'Cálida' },
  { id: VARIANTES_REDISENO[2], nombre: 'Tech' },
  { id: VARIANTES_REDISENO[3], nombre: 'Eco' },
  { id: VARIANTES_REDISENO[4], nombre: 'Marca Galapavet' },
] as const satisfies readonly VariantePaleta[]
