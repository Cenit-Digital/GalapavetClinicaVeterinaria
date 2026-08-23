/**
 * Cálculo del ratio de contraste WCAG 2.2 entre dos colores, a partir de la
 * fórmula oficial de luminancia relativa
 * (https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum).
 */

const BASE_HEXADECIMAL = 16
const MAXIMO_CANAL_8_BITS = 255
const UMBRAL_GAMMA_LINEAL = 0.03928
const DIVISOR_GAMMA_LINEAL = 12.92
const DESPLAZAMIENTO_GAMMA = 0.055
const DIVISOR_GAMMA = 1.055
const EXPONENTE_GAMMA = 2.4
const PESO_ROJO = 0.2126
const PESO_VERDE = 0.7152
const PESO_AZUL = 0.0722
const COMPENSACION_LUMINANCIA = 0.05

interface ComponentesRgb {
  rojo: number
  verde: number
  azul: number
}

/** Hexadecimal de color válido: `#` seguido de exactamente 6 dígitos hexadecimales. La forma abreviada de 3 dígitos NO se acepta (@s14). */
const PATRON_HEXADECIMAL_VALIDO = /^#[0-9a-fA-F]{6}$/

function validarHexadecimal(valor: string): void {
  if (!PATRON_HEXADECIMAL_VALIDO.test(valor)) {
    throw new Error(`"${valor}" no es un color hexadecimal válido: se esperaba "#" seguido de 6 dígitos hexadecimales`)
  }
}

function componenteLineal(canal8Bits: number): number {
  const canal = canal8Bits / MAXIMO_CANAL_8_BITS
  return canal <= UMBRAL_GAMMA_LINEAL
    ? canal / DIVISOR_GAMMA_LINEAL
    : ((canal + DESPLAZAMIENTO_GAMMA) / DIVISOR_GAMMA) ** EXPONENTE_GAMMA
}

function luminanciaRelativa({ rojo, verde, azul }: ComponentesRgb): number {
  return (
    PESO_ROJO * componenteLineal(rojo) +
    PESO_VERDE * componenteLineal(verde) +
    PESO_AZUL * componenteLineal(azul)
  )
}

function aComponentesRgb(hexadecimal: string): ComponentesRgb {
  const sinAlmohadilla = hexadecimal.slice(1)
  return {
    rojo: parseInt(sinAlmohadilla.slice(0, 2), BASE_HEXADECIMAL),
    verde: parseInt(sinAlmohadilla.slice(2, 4), BASE_HEXADECIMAL),
    azul: parseInt(sinAlmohadilla.slice(4, 6), BASE_HEXADECIMAL),
  }
}

/**
 * Ratio de contraste WCAG entre `color` y `fondo`. Simétrico: invertir los
 * dos argumentos da el mismo resultado, porque el más claro siempre hace de
 * numerador.
 */
export function calcularRatioContraste(color: string, fondo: string): number {
  validarHexadecimal(color)
  validarHexadecimal(fondo)

  const luminanciaColor = luminanciaRelativa(aComponentesRgb(color))
  const luminanciaFondo = luminanciaRelativa(aComponentesRgb(fondo))
  const masClara = Math.max(luminanciaColor, luminanciaFondo)
  const masOscura = Math.min(luminanciaColor, luminanciaFondo)
  return (masClara + COMPENSACION_LUMINANCIA) / (masOscura + COMPENSACION_LUMINANCIA)
}

/** Los tres usos de color que este catálogo evalúa, con su mínimo WCAG 2.2 AA (1.4.3 / 1.4.11 / 2.4.11). */
export type UsoDeColor = 'texto normal' | 'texto grande' | 'componente de interfaz o borde de foco'

const USOS_DE_COLOR: readonly UsoDeColor[] = [
  'texto normal',
  'texto grande',
  'componente de interfaz o borde de foco',
]

const RATIO_MINIMO_POR_USO: Record<UsoDeColor, number> = {
  'texto normal': 4.5,
  'texto grande': 3,
  'componente de interfaz o borde de foco': 3,
}

/** Si el ratio alcanza (o supera) el mínimo exigido para `uso`. El límite es inclusivo. */
export function esAptoParaUso(ratio: number, uso: UsoDeColor): boolean {
  return ratio >= RATIO_MINIMO_POR_USO[uso]
}

/** Ratio de contraste de la pareja `color`/`fondo` y su aptitud para cada uso del catálogo. */
export function evaluarAptitudPareja(
  color: string,
  fondo: string,
): { ratio: number; apta: Record<UsoDeColor, boolean> } {
  const ratio = calcularRatioContraste(color, fondo)
  const apta = Object.fromEntries(
    USOS_DE_COLOR.map((uso) => [uso, esAptoParaUso(ratio, uso)]),
  ) as Record<UsoDeColor, boolean>
  return { ratio, apta }
}

/** Una pareja color/fondo con el uso que el proyecto declara para ella. */
export interface ParDeContraste {
  color: string
  fondo: string
  uso: UsoDeColor
}

interface ParEvaluada extends ParDeContraste {
  ratio: number
}

export interface InformePuertaDeContraste {
  pasa: boolean
  parejasEvaluadas: number
  parejas: readonly ParEvaluada[]
  motivo?: string
}

const CERO_PAREJAS = 0

function motivoDeVacuidad(): string {
  return 'el catálogo de parejas color/fondo está vacío: se evaluaron 0 parejas'
}

/**
 * Puerta de contraste: calcula el ratio de cada pareja del catálogo y falla
 * cerrada si el catálogo está vacío (nunca "0 parejas evaluadas" en verde).
 */
export function ejecutarPuertaDeContraste(catalogo: readonly ParDeContraste[]): InformePuertaDeContraste {
  if (catalogo.length === CERO_PAREJAS) {
    return { pasa: false, parejasEvaluadas: CERO_PAREJAS, parejas: [], motivo: motivoDeVacuidad() }
  }

  const parejas = catalogo.map((par) => ({
    ...par,
    ratio: calcularRatioContraste(par.color, par.fondo),
  }))

  return { pasa: true, parejasEvaluadas: parejas.length, parejas }
}

/**
 * Umbrales de contraste WCAG 2.2 AA que esta puerta exige (SC 1.4.3 / SC
 * 1.4.11), y el tamaño a partir del cual un texto se considera "grande"
 * (`features/accesibilidad.feature` @s28): 18pt = 24px, 14pt negrita =
 * 18.66px (conversión 1pt = 1.333px).
 */
export const TAMANO_TEXTO_GRANDE_PX = 24
export const TAMANO_TEXTO_GRANDE_NEGRITA_PX = 18.66

export interface UmbralesDeContraste {
  readonly textoNormal: number
  readonly textoGrande: number
  readonly tamanoTextoGrandePx: number
  readonly tamanoTextoGrandeNegritaPx: number
}

/** Los umbrales que esta puerta exige, tal y como los consulta cualquier caller (@s28). */
export function umbralesDeContraste(): UmbralesDeContraste {
  return {
    textoNormal: RATIO_MINIMO_POR_USO['texto normal'],
    textoGrande: RATIO_MINIMO_POR_USO['texto grande'],
    tamanoTextoGrandePx: TAMANO_TEXTO_GRANDE_PX,
    tamanoTextoGrandeNegritaPx: TAMANO_TEXTO_GRANDE_NEGRITA_PX,
  }
}

/** Si un texto de `tamanoPx`, con o sin negrita, se clasifica como "grande" (@s30). El límite es inclusivo. */
export function esTextoGrande(tamanoPx: number, negrita: boolean): boolean {
  return tamanoPx >= (negrita ? TAMANO_TEXTO_GRANDE_NEGRITA_PX : TAMANO_TEXTO_GRANDE_PX)
}

export interface VeredictoDePareja {
  readonly veredicto: 'aprobado' | 'suspenso'
  readonly ratio: number
  readonly umbral: number
  readonly color: string
  readonly fondo: string
}

/**
 * Formula el veredicto de una pareja ya con su ratio calculado (@s32/@s34):
 * separado de `evaluarParDeContraste` para poder anclar los tests a un ratio
 * exacto escrito a mano, sin depender de encontrar un hexadecimal real que
 * produzca ese ratio con precisión de dos decimales.
 */
export function formularVeredictoDePareja(par: ParDeContraste, ratio: number): VeredictoDePareja {
  return {
    veredicto: esAptoParaUso(ratio, par.uso) ? 'aprobado' : 'suspenso',
    ratio,
    umbral: RATIO_MINIMO_POR_USO[par.uso],
    color: par.color,
    fondo: par.fondo,
  }
}

/** Calcula el ratio real de la pareja y formula su veredicto. */
export function evaluarParDeContraste(par: ParDeContraste): VeredictoDePareja {
  return formularVeredictoDePareja(par, calcularRatioContraste(par.color, par.fondo))
}

export interface InformePuertaDeContrastePorUso {
  readonly pasa: boolean
  readonly parejasEvaluadas: number
  readonly parejas: readonly ParEvaluada[]
  readonly motivo?: string
}

/**
 * Puerta de contraste para UN solo uso (texto normal / texto grande /
 * componente de interfaz), con guarda de vacuidad propia: cada extractor de
 * color del bloque F necesita la suya, no una genérica compartida entre los
 * tres (@s33/@s35/@s36 — patrón `verde-por-vacuidad-en-puerta-de-verificacion`).
 */
function ejecutarPuertaDeContrasteParaUso(
  catalogo: readonly ParDeContraste[],
  motivoDeVacuidadParaUso: string,
): InformePuertaDeContrastePorUso {
  if (catalogo.length === CERO_PAREJAS) {
    return { pasa: false, parejasEvaluadas: CERO_PAREJAS, parejas: [], motivo: motivoDeVacuidadParaUso }
  }

  const parejas = catalogo.map((par) => ({ ...par, ratio: calcularRatioContraste(par.color, par.fondo) }))
  const todasAptas = parejas.every((par) => esAptoParaUso(par.ratio, par.uso))

  return { pasa: todasAptas, parejasEvaluadas: parejas.length, parejas }
}

/** Puerta de contraste de texto normal (@s29/@s33). */
export function ejecutarPuertaDeContrasteTextoNormal(
  catalogo: readonly ParDeContraste[],
): InformePuertaDeContrastePorUso {
  return ejecutarPuertaDeContrasteParaUso(catalogo, 'no se calculó ninguna pareja de color de texto normal: el catálogo está vacío')
}

/** Puerta de contraste de texto grande (@s30/@s35). */
export function ejecutarPuertaDeContrasteTextoGrande(
  catalogo: readonly ParDeContraste[],
): InformePuertaDeContrastePorUso {
  return ejecutarPuertaDeContrasteParaUso(catalogo, 'no se calculó ninguna pareja de color de texto grande: el catálogo está vacío')
}

/** Puerta de contraste de componentes de interfaz (@s31/@s36). */
export function ejecutarPuertaDeContrasteComponentesInterfaz(
  catalogo: readonly ParDeContraste[],
): InformePuertaDeContrastePorUso {
  return ejecutarPuertaDeContrasteParaUso(
    catalogo,
    'no se calculó ningún componente de interfaz: el catálogo está vacío',
  )
}
