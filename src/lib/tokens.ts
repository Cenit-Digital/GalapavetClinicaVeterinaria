import type { ParDeContraste } from './contraste'

/**
 * Los tres colores de marca de Galapavet, extraídos por muestreo de píxeles
 * del logo (`docs/datos-galapavet.md` §10, verificado 17/08/2026). Fuente
 * única: ningún otro módulo declara estos hexadecimales de forma literal.
 */
export const coloresDeMarca = {
  morado: '#77286B',
  lima: '#B4C718',
  verdeProfundo: '#48704B',
} as const

const BLANCO = '#FFFFFF'

/**
 * Las parejas color/fondo que el proyecto declara usar, cada una con su uso.
 * Ratios verificados en `docs/datos-galapavet.md` §10.1. Deliberadamente NO
 * incluye la pareja verde profundo (#48704B) sobre lima (#B4C718): pasa el
 * mínimo aritmético por 0.01 (3.01), pero ese margen se decidió no usar (ver
 * la EXCEPCIÓN DECIDIDA en la cabecera de `features/tokens_marca.feature`).
 */
export const catalogoDeContraste: readonly ParDeContraste[] = [
  { color: coloresDeMarca.morado, fondo: BLANCO, uso: 'texto normal' },
  { color: coloresDeMarca.verdeProfundo, fondo: BLANCO, uso: 'texto normal' },
  { color: coloresDeMarca.lima, fondo: coloresDeMarca.morado, uso: 'texto normal' },
  { color: coloresDeMarca.morado, fondo: BLANCO, uso: 'texto grande' },
  { color: coloresDeMarca.morado, fondo: BLANCO, uso: 'componente de interfaz o borde de foco' },
]
