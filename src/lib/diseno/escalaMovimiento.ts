/**
 * La escala de movimiento del proyecto (Decisión 31, @s16 de
 * `identidad_visual.feature`, ampliada el 13/10/2026 por la respuesta P1 de
 * Pablo): tres duraciones —150 ms para cambios de color, borde y fondo, 300 ms
 * para transformaciones y sombras y 700 ms para la entrada del hero—, tres
 * retardos —0, 120 y 240 ms— y una única curva de salida, "ease-out".
 * Contrastada contra el TEXTO REAL de los 20 ficheros de estilos del inventario
 * (los 3 de `src/styles`, los 12 de `src/components` y los 5 de `src/pages`):
 * ninguna declaración de transición ni de animación puede usar una duración o
 * un retardo fuera de esa escala (salvo el corte "0.01ms" de
 * `prefers-reduced-motion: reduce`, que no es parte de la escala: es su
 * ANULACIÓN, y vale solo como duración), ninguna puede llevar un valor que la
 * puerta no sepa leer y ninguna puede animar la palabra clave "all".
 *
 * FALLA CERRADO ante lo que no sabe leer (B3 de la revisión de la feature 48):
 * una variable, una función o una interpolación (`var()`, `$x`, `calc()`,
 * `#{…}`), y también todo token que EMPIEZA como un número y no es ni un tiempo
 * literal ni un número sin unidad (`900ms*2`, `400msx`, `10%`). Los tiempos
 * literales se leen sin distinguir mayúsculas y con signo `+`, `-` o notación
 * científica (`0.9S`, `+900ms`, `9e2ms`); `!important` no enmascara nada.
 */

import {
  leerFicheros,
  nombreCanonicoDeLaPropiedad,
  rutasSinLecturaFiable,
  valorSinImportante,
  type DeclaracionLeida,
  type FicheroEstilos,
  type FicheroLeido,
} from './lectorDeEstilos'

export interface EscalaDeMovimiento {
  readonly duracionesMs: readonly number[]
  readonly retardosMs: readonly number[]
  readonly curva: string
}

const DURACIONES_DE_MOVIMIENTO_MS: readonly number[] = [150, 300, 700]
const RETARDOS_DE_MOVIMIENTO_MS: readonly number[] = [0, 120, 240]
const CURVA_DE_MOVIMIENTO = 'ease-out'

/** El corte de `prefers-reduced-motion: reduce` (@s15): anula la escala, no forma parte de ella. */
export const DURACION_DE_CORTE_REDUCIDO_MS = 0.01

export function escalaDeMovimientoDeclarada(): EscalaDeMovimiento {
  return {
    duracionesMs: DURACIONES_DE_MOVIMIENTO_MS,
    retardosMs: RETARDOS_DE_MOVIMIENTO_MS,
    curva: CURVA_DE_MOVIMIENTO,
  }
}

export type { FicheroEstilos } from './lectorDeEstilos'

export interface DuracionFueraDeEscala {
  readonly ruta: string
  readonly linea: number
  readonly valorMs: number
}

export interface RetardoFueraDeEscala {
  readonly ruta: string
  readonly linea: number
  readonly valorMs: number
}

export interface ValorNoVerificable {
  readonly ruta: string
  readonly linea: number
  /** El token tal como está escrito en la hoja: `var(--x)`, `$x`, `calc(…)`, `900ms*2`. */
  readonly valor: string
}

export interface UsoDePalabraClaveAll {
  readonly ruta: string
  readonly linea: number
}

export interface InformeEscalaDeMovimiento {
  readonly pasa: boolean
  readonly ficherosInspeccionados: number
  readonly duracionesFueraDeEscala: readonly DuracionFueraDeEscala[]
  readonly retardosFueraDeEscala: readonly RetardoFueraDeEscala[]
  readonly valoresNoVerificables: readonly ValorNoVerificable[]
  readonly usosDePalabraClaveAll: readonly UsoDePalabraClaveAll[]
  /** Las hojas que el lector no pudo leer entera: con una sola, la puerta no pasa. */
  readonly ficherosSinLecturaFiable: readonly string[]
}

const NINGUNO = 0

type ListaDeTiempos = 'duraciones' | 'retardos'

/**
 * Las ÚNICAS propiedades que llevan tiempos, y a qué lista va el tiempo que
 * ocupa cada posición de una entrada: en una declaración corta el primer tiempo
 * es la duración y el segundo el retardo; en una suelta lo dice el nombre. Las
 * demás `animation-*` (`-iteration-count`, `-timing-function`, `-fill-mode`,
 * `-name`) no llevan tiempos: validar su valor contra la escala dejaría roja la
 * regla global de `reduce` de `global.scss`, que declara
 * `animation-iteration-count: 1`.
 */
const LISTAS_POR_POSICION: ReadonlyMap<string, readonly ListaDeTiempos[]> = new Map<string, readonly ListaDeTiempos[]>([
  ['animation', ['duraciones', 'retardos']],
  ['transition', ['duraciones', 'retardos']],
  ['animation-duration', ['duraciones']],
  ['transition-duration', ['duraciones']],
  ['animation-delay', ['retardos']],
  ['transition-delay', ['retardos']],
])

/** Las propiedades de transición que nombran QUÉ se anima, donde puede aparecer la palabra clave "all". */
const PROPIEDADES_QUE_NOMBRAN_LO_ANIMADO: ReadonlySet<string> = new Set(['transition', 'transition-property'])

const PALABRA_CLAVE_ALL = 'all'
const DURACIONES_ADMITIDAS_MS: ReadonlySet<number> = new Set([...DURACIONES_DE_MOVIMIENTO_MS, DURACION_DE_CORTE_REDUCIDO_MS])
const RETARDOS_ADMITIDOS_MS: ReadonlySet<number> = new Set(RETARDOS_DE_MOVIMIENTO_MS)

/**
 * Un tiempo escrito como literal: con signo o sin él, con o sin cero inicial
 * (`.7s`), con exponente (`9e2ms`), en `ms` o en `s` y con cualquier mayúscula.
 */
const PATRON_TIEMPO_LITERAL = /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:e([+-]?\d+))?(ms|s)$/i
const PATRON_NUMERO_SIN_UNIDAD = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/i
const PATRON_EMPIEZA_COMO_NUMERO = /^[+-]?\.?\d/
const PATRON_SINTAXIS_QUE_NO_SE_LEE = /[$(){}]/
const UNIDAD_EN_SEGUNDOS = 's'
/** De segundos a milisegundos se corre el exponente tres lugares. */
const EXPONENTE_DE_SEGUNDOS_A_MILISEGUNDOS = 3

/**
 * Convierte `0.24s` a 240 SIN pasar por una multiplicación en coma flotante
 * (`0.07 * 1000` no da exactamente 70): se corre el exponente en el propio texto.
 */
function milisegundosDe(token: string): number | undefined {
  const coincidencia = PATRON_TIEMPO_LITERAL.exec(token)
  if (coincidencia === null) {
    return undefined
  }
  const mantisa = coincidencia[1] as string
  const exponente = Number(coincidencia[2] ?? NINGUNO)
  const unidad = (coincidencia[3] as string).toLowerCase()
  const corrimiento = unidad === UNIDAD_EN_SEGUNDOS ? EXPONENTE_DE_SEGUNDOS_A_MILISEGUNDOS : NINGUNO
  return Number(`${mantisa}e${exponente + corrimiento}`)
}

/**
 * Lo que la puerta no sabe leer: una variable de Sass (`$x`, `#{$x}`) o cualquier
 * función (`var()`, `calc()`, también `cubic-bezier()`, que además no es
 * "ease-out"), y todo token que empieza como un número y no es un tiempo literal
 * ni un número sin unidad (el contador de iteraciones, por ejemplo).
 */
function esNoVerificable(token: string): boolean {
  return (
    PATRON_SINTAXIS_QUE_NO_SE_LEE.test(token) ||
    (PATRON_EMPIEZA_COMO_NUMERO.test(token) && !PATRON_NUMERO_SIN_UNIDAD.test(token))
  )
}

/** Parte por un separador SOLO en el nivel superior: lo que va entre paréntesis (`calc(100ms + 50ms)`) no se parte. */
function partirEnNivelSuperior(texto: string, esSeparador: (caracter: string) => boolean): string[] {
  // Siempre hay una parte en curso (la última): empieza vacía, cada carácter se le añade y cada
  // separador de nivel superior abre otra. Sin una variable aparte para la parte en curso, una
  // parte que no nace vacía o un trozo de más delante de las reales corrompe un token de verdad.
  const partes = ['']
  let profundidad = 0
  for (const caracter of texto) {
    if (caracter === '(') {
      profundidad += 1
    } else if (caracter === ')') {
      profundidad -= 1
    }
    if (profundidad === 0 && esSeparador(caracter)) {
      partes.push('')
    } else {
      partes.push(`${partes.pop()}${caracter}`)
    }
  }
  return partes
}

const esComa = (caracter: string): boolean => caracter === ','
const esBlanco = (caracter: string): boolean => caracter.trim() === ''

interface TiemposLeidos {
  readonly duraciones: number[]
  readonly retardos: number[]
  readonly noVerificables: string[]
}

/** Cada tiempo de una entrada va a la lista que dice la posición que ocupa; los que sobran no tienen papel. */
function repartirPorPosicion(tiempos: readonly number[], listas: readonly ListaDeTiempos[], destino: TiemposLeidos): void {
  listas.forEach((lista, posicion) => {
    const milisegundos = tiempos[posicion]
    if (milisegundos !== undefined) {
      destino[lista].push(milisegundos)
    }
  })
}

function leerTiempos(declaracion: DeclaracionLeida, listas: readonly ListaDeTiempos[]): TiemposLeidos {
  const leidos: TiemposLeidos = { duraciones: [], retardos: [], noVerificables: [] }

  for (const entrada of partirEnNivelSuperior(valorSinImportante(declaracion.valor), esComa)) {
    const tiempos: number[] = []
    for (const token of partirEnNivelSuperior(entrada, esBlanco)) {
      const milisegundos = milisegundosDe(token)
      if (milisegundos !== undefined) {
        tiempos.push(milisegundos)
      } else if (esNoVerificable(token)) {
        leidos.noVerificables.push(token)
      }
    }
    repartirPorPosicion(tiempos, listas, leidos)
  }

  return leidos
}

function animaLaPalabraClaveAll(declaracion: DeclaracionLeida): boolean {
  if (!PROPIEDADES_QUE_NOMBRAN_LO_ANIMADO.has(nombreCanonicoDeLaPropiedad(declaracion.propiedad))) {
    return false
  }
  // En una entrada de `transition` la propiedad puede ir en cualquier posición ("150ms ease-out all" es válida).
  return partirEnNivelSuperior(valorSinImportante(declaracion.valor), esComa).some((entrada) =>
    partirEnNivelSuperior(entrada, esBlanco).some((token) => token.toLowerCase() === PALABRA_CLAVE_ALL),
  )
}

interface AnalisisDeUnFichero {
  readonly duraciones: DuracionFueraDeEscala[]
  readonly retardos: RetardoFueraDeEscala[]
  readonly noVerificables: ValorNoVerificable[]
  readonly usosDeAll: UsoDePalabraClaveAll[]
}

function analizarFichero(fichero: FicheroLeido): AnalisisDeUnFichero {
  const analisis: AnalisisDeUnFichero = { duraciones: [], retardos: [], noVerificables: [], usosDeAll: [] }

  for (const declaracion of fichero.estilos.declaraciones) {
    const { ruta } = fichero
    const { linea } = declaracion
    const listas = LISTAS_POR_POSICION.get(nombreCanonicoDeLaPropiedad(declaracion.propiedad))
    if (listas !== undefined) {
      const tiempos = leerTiempos(declaracion, listas)
      analisis.duraciones.push(
        ...tiempos.duraciones.filter((valorMs) => !DURACIONES_ADMITIDAS_MS.has(valorMs)).map((valorMs) => ({ ruta, linea, valorMs })),
      )
      analisis.retardos.push(
        ...tiempos.retardos.filter((valorMs) => !RETARDOS_ADMITIDOS_MS.has(valorMs)).map((valorMs) => ({ ruta, linea, valorMs })),
      )
      analisis.noVerificables.push(...tiempos.noVerificables.map((valor) => ({ ruta, linea, valor })))
    }
    if (animaLaPalabraClaveAll(declaracion)) {
      analisis.usosDeAll.push({ ruta, linea })
    }
  }

  return analisis
}

/**
 * Recorre el texto real de cada fichero del inventario y señala cualquier
 * duración o retardo de movimiento fuera de la escala declarada, cualquier
 * valor de tiempo que no pueda leer, cualquier uso de la palabra clave "all"
 * en una declaración de transición y cualquier hoja que el lector no pueda
 * leer entera.
 */
export function ejecutarPuertaDeEscalaDeMovimiento(ficheros: readonly FicheroEstilos[]): InformeEscalaDeMovimiento {
  if (ficheros.length === NINGUNO) {
    return {
      pasa: false,
      ficherosInspeccionados: NINGUNO,
      duracionesFueraDeEscala: [],
      retardosFueraDeEscala: [],
      valoresNoVerificables: [],
      usosDePalabraClaveAll: [],
      ficherosSinLecturaFiable: [],
    }
  }

  const leidos = leerFicheros(ficheros)
  const analisis = leidos.map(analizarFichero)
  const duracionesFueraDeEscala = analisis.flatMap((resultado) => resultado.duraciones)
  const retardosFueraDeEscala = analisis.flatMap((resultado) => resultado.retardos)
  const valoresNoVerificables = analisis.flatMap((resultado) => resultado.noVerificables)
  const usosDePalabraClaveAll = analisis.flatMap((resultado) => resultado.usosDeAll)
  const ficherosSinLecturaFiable = rutasSinLecturaFiable(leidos)

  return {
    pasa:
      duracionesFueraDeEscala.length === NINGUNO &&
      retardosFueraDeEscala.length === NINGUNO &&
      valoresNoVerificables.length === NINGUNO &&
      usosDePalabraClaveAll.length === NINGUNO &&
      ficherosSinLecturaFiable.length === NINGUNO,
    ficherosInspeccionados: ficheros.length,
    duracionesFueraDeEscala,
    retardosFueraDeEscala,
    valoresNoVerificables,
    usosDePalabraClaveAll,
    ficherosSinLecturaFiable,
  }
}
