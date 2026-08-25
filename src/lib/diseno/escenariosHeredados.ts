/**
 * Los doce escenarios de navegador real heredados de `sistema_de_diseno_visual.feature`
 * (feature 21) y de `accesibilidad.feature` (feature 19) que la suite e2e de
 * esta feature EJECUTA (@s50 de `identidad_visual.feature`, Decisión 41):
 * esta feature no los posee ni los redefine, solo construye la maquetación
 * real que hace que puedan pasar de verdad y los automatiza.
 */

export const ESCENARIOS_HEREDADOS_DE_SISTEMA_DE_DISENO_VISUAL: readonly string[] = [
  '@s12',
  '@s27',
  '@s28',
  '@s29',
  '@s30',
  '@s31',
  '@s32',
  '@s34',
]

export const ESCENARIOS_HEREDADOS_DE_ACCESIBILIDAD: readonly string[] = ['@s2', '@s17', '@s18', '@s19']

export const ESCENARIOS_HEREDADOS_DECLARADOS: readonly string[] = [
  ...ESCENARIOS_HEREDADOS_DE_SISTEMA_DE_DISENO_VISUAL,
  ...ESCENARIOS_HEREDADOS_DE_ACCESIBILIDAD,
]

const CERO_DECLARADOS = 0
const DOCE = 12

export interface InformeEscenariosHeredados {
  readonly pasa: boolean
  readonly declarados: number
  readonly noCitados: readonly string[]
}

function citadoEn(identificador: string, textos: readonly string[]): boolean {
  const patron = new RegExp(`${identificador}\\b`)
  return textos.some((texto) => patron.test(texto))
}

/**
 * Comprueba que cada identificador heredado esté citado en AL MENOS UNO de
 * los textos reales de `tests/e2e/*.spec.ts`, con frontera de palabra (para
 * que "@s2" no se dé por citado dentro de "@s27" ni de "@s25").
 */
export function comprobarEscenariosHeredadosCitados(
  declarados: readonly string[],
  textosDePruebasDeNavegador: readonly string[],
): InformeEscenariosHeredados {
  if (declarados.length === CERO_DECLARADOS) {
    return { pasa: false, declarados: CERO_DECLARADOS, noCitados: [] }
  }

  const noCitados = declarados.filter((identificador) => !citadoEn(identificador, textosDePruebasDeNavegador))

  return {
    pasa: noCitados.length === CERO_DECLARADOS && declarados.length === DOCE,
    declarados: declarados.length,
    noCitados,
  }
}
