/**
 * Puerta de literales de color: ningún módulo SCSS declara un color a mano
 * (hex, funcional o nombre CSS); todos consumen los tokens de marca.
 */

export interface FicheroScss {
  ruta: string
  contenido: string
}

export interface HallazgoLiteralColor {
  ruta: string
  linea: number
}

export interface InformePuertaDeLiteralesColor {
  pasa: boolean
  ficherosInspeccionados: number
  señalados: readonly HallazgoLiteralColor[]
  motivo?: string
}

const CERO_FICHEROS = 0
const PRIMERA_LINEA = 1

/** Color hexadecimal de 3, 4, 6 u 8 dígitos, en cualquier posición de la línea. */
const PATRON_HEX = /#[0-9a-fA-F]{3,8}\b/

/** Notación funcional CSS de color: rgb(), rgba(), hsl() o hsla(). */
const PATRON_FUNCIONAL = /\b(?:rgba?|hsla?)\(/i

/**
 * Los 16 nombres de color de CSS Color Module Level 1 (el conjunto mínimo,
 * estable y no arbitrario de nombres de color de CSS). NO incluye palabras
 * clave que no fijan un color (`currentColor`, `transparent`, `inherit`):
 * esas se dejan pasar a propósito (@s22).
 */
const NOMBRES_DE_COLOR_CSS = [
  'black',
  'silver',
  'gray',
  'white',
  'maroon',
  'red',
  'purple',
  'fuchsia',
  'green',
  'lime',
  'olive',
  'yellow',
  'navy',
  'blue',
  'teal',
  'aqua',
]
const PATRON_NOMBRE_DE_COLOR = new RegExp(`\\b(?:${NOMBRES_DE_COLOR_CSS.join('|')})\\b`, 'i')

function ejecutarPuertaDeLiteralesColorSinFicheros(): InformePuertaDeLiteralesColor {
  return {
    pasa: false,
    ficherosInspeccionados: CERO_FICHEROS,
    señalados: [],
    motivo: 'no se inspeccionó ningún fichero SCSS: se inspeccionaron 0 ficheros',
  }
}

function declaraColorLiteral(linea: string): boolean {
  return PATRON_HEX.test(linea) || PATRON_FUNCIONAL.test(linea) || PATRON_NOMBRE_DE_COLOR.test(linea)
}

function hallazgosDelFichero(fichero: FicheroScss): readonly HallazgoLiteralColor[] {
  return fichero.contenido
    .split('\n')
    .map((texto, indice) => ({ texto, linea: indice + PRIMERA_LINEA }))
    .filter(({ texto }) => declaraColorLiteral(texto))
    .map(({ linea }) => ({ ruta: fichero.ruta, linea }))
}

export function ejecutarPuertaDeLiteralesColor(ficheros: readonly FicheroScss[]): InformePuertaDeLiteralesColor {
  if (ficheros.length === CERO_FICHEROS) {
    return ejecutarPuertaDeLiteralesColorSinFicheros()
  }

  const señalados = ficheros.flatMap(hallazgosDelFichero)

  return { pasa: señalados.length === CERO_FICHEROS, ficherosInspeccionados: ficheros.length, señalados }
}
