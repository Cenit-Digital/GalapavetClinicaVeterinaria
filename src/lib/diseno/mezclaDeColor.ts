/**
 * Mezcla en sRGB de dos colores hexadecimales, canal a canal, con redondeo
 * estándar (@s4 de `identidad_visual.feature`): la aritmética real detrás de
 * cada rol nuevo del sistema de color. Toda la tabla de derivaciones de
 * `progress/plan_adaptacion_scss.md` §3 se recalcula con esta función; ningún
 * hexadecimal derivado se duplica a mano dentro de un test (antes vivía
 * repetida dentro de `tokensColor.test.ts`, donde StrykerJS no la veía).
 */

const BASE_HEXADECIMAL = 16
const DOS_DIGITOS_HEX = 2
const CERO_RELLENO = '0'
const INICIO_ROJO = 0
const INICIO_VERDE = 2
const INICIO_AZUL = 4
const FIN_CANAL = 2

interface ComponentesRgb {
  readonly rojo: number
  readonly verde: number
  readonly azul: number
}

/** Hexadecimal de color válido: `#` seguido de exactamente 6 dígitos hexadecimales. */
const PATRON_HEXADECIMAL_VALIDO = /^#[0-9a-fA-F]{6}$/

function validarHexadecimal(valor: string): void {
  if (!PATRON_HEXADECIMAL_VALIDO.test(valor)) {
    throw new Error(`"${valor}" no es un color hexadecimal válido: se esperaba "#" seguido de 6 dígitos hexadecimales`)
  }
}

function aComponentesRgb(hexadecimal: string): ComponentesRgb {
  const sinAlmohadilla = hexadecimal.slice(1)
  return {
    rojo: parseInt(sinAlmohadilla.slice(INICIO_ROJO, INICIO_ROJO + FIN_CANAL), BASE_HEXADECIMAL),
    verde: parseInt(sinAlmohadilla.slice(INICIO_VERDE, INICIO_VERDE + FIN_CANAL), BASE_HEXADECIMAL),
    azul: parseInt(sinAlmohadilla.slice(INICIO_AZUL, INICIO_AZUL + FIN_CANAL), BASE_HEXADECIMAL),
  }
}

function canalAHex(canal: number): string {
  return canal.toString(BASE_HEXADECIMAL).toUpperCase().padStart(DOS_DIGITOS_HEX, CERO_RELLENO)
}

function mezclarCanal(canalBase: number, canalOtro: number, porcentaje: number): number {
  return Math.round(canalBase * (1 - porcentaje) + canalOtro * porcentaje)
}

/**
 * Mezcla `base` con `otro` en la proporción `porcentaje` (de 0 a 1): el
 * resultado es `base` en `(1 - porcentaje)` más `otro` en `porcentaje`,
 * canal a canal, con redondeo estándar. `mezclar('#FFFFFF', '#77286B', 0.08)`
 * da `'#F4EEF3'`, el mismo valor que la tabla de derivaciones del plan.
 */
export function mezclar(base: string, otro: string, porcentaje: number): string {
  validarHexadecimal(base)
  validarHexadecimal(otro)

  const componentesBase = aComponentesRgb(base)
  const componentesOtro = aComponentesRgb(otro)

  const rojo = mezclarCanal(componentesBase.rojo, componentesOtro.rojo, porcentaje)
  const verde = mezclarCanal(componentesBase.verde, componentesOtro.verde, porcentaje)
  const azul = mezclarCanal(componentesBase.azul, componentesOtro.azul, porcentaje)

  return `#${canalAHex(rojo)}${canalAHex(verde)}${canalAHex(azul)}`
}
