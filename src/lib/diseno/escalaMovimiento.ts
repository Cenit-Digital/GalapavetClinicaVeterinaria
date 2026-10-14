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
 * puerta no sepa leer (`var()`, `$variable`, `calc()`: falla CERRADO) y
 * ninguna puede animar la palabra clave "all".
 */

import { leerEstilos, type DeclaracionLeida } from './lectorDeEstilos'

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

export interface FicheroEstilos {
  readonly ruta: string
  readonly contenido: string
}

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
  /** El token tal como está escrito en la hoja: `var(--x)`, `$x`, `calc(…)`. */
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
}

const CERO_FICHEROS = 0
const CERO_HALLAZGOS = 0

type PapelDeLaPropiedad = 'duracion' | 'retardo' | 'abreviada'

/**
 * Las ÚNICAS propiedades que llevan tiempos. Las demás `animation-*`
 * (`-iteration-count`, `-timing-function`, `-fill-mode`, `-name`) no: validar
 * su valor contra la escala dejaría roja la regla global de `reduce` de
 * `global.scss`, que declara `animation-iteration-count: 1`.
 */
const PAPEL_DE_LA_PROPIEDAD: ReadonlyMap<string, PapelDeLaPropiedad> = new Map([
  ['animation', 'abreviada'],
  ['transition', 'abreviada'],
  ['animation-duration', 'duracion'],
  ['transition-duration', 'duracion'],
  ['animation-delay', 'retardo'],
  ['transition-delay', 'retardo'],
])

/** Las propiedades de transición que nombran QUÉ se anima, donde puede aparecer la palabra clave "all". */
const PROPIEDADES_QUE_NOMBRAN_LO_ANIMADO: ReadonlySet<string> = new Set(['transition', 'transition-property'])

const PALABRA_CLAVE_ALL = 'all'
const DURACIONES_ADMITIDAS_MS: ReadonlySet<number> = new Set([...DURACIONES_DE_MOVIMIENTO_MS, DURACION_DE_CORTE_REDUCIDO_MS])
const RETARDOS_ADMITIDOS_MS: ReadonlySet<number> = new Set(RETARDOS_DE_MOVIMIENTO_MS)

/** Un tiempo escrito como literal: con o sin signo, con o sin cero inicial (`.7s`), en `ms` o en `s`. */
const PATRON_TIEMPO_LITERAL = /^(-?(?:\d+(?:\.\d+)?|\.\d+))(ms|s)$/

/**
 * Convierte `0.24s` a 240 SIN pasar por una multiplicación en coma flotante
 * (`0.07 * 1000` no da exactamente 70): se corre el exponente en el propio texto.
 */
function milisegundosDe(token: string): number | undefined {
  const coincidencia = PATRON_TIEMPO_LITERAL.exec(token)
  if (coincidencia === null) {
    return undefined
  }
  const [, numero, unidad] = coincidencia
  return unidad === 's' ? Number(`${numero}e3`) : Number(numero)
}

/**
 * Lo que la puerta no sabe leer: una variable de Sass (`$x`, `#{$x}`) o cualquier
 * función (`var()`, `calc()`, también `cubic-bezier()`, que además no es "ease-out").
 */
function esNoVerificable(token: string): boolean {
  return token.includes('$') || token.includes('(')
}

/** Parte por un separador SOLO en el nivel superior: lo que va entre paréntesis (`calc(100ms + 50ms)`) no se parte. */
function partirEnNivelSuperior(texto: string, esSeparador: (caracter: string) => boolean): string[] {
  const partes: string[] = []
  let profundidad = 0
  let parteActual = ''
  for (const caracter of texto) {
    if (caracter === '(') {
      profundidad += 1
    } else if (caracter === ')') {
      profundidad -= 1
    }
    if (profundidad === 0 && esSeparador(caracter)) {
      partes.push(parteActual)
      parteActual = ''
    } else {
      parteActual += caracter
    }
  }
  partes.push(parteActual)
  return partes
}

const esComa = (caracter: string): boolean => caracter === ','
const esBlanco = (caracter: string): boolean => caracter.trim() === ''

interface TiemposLeidos {
  readonly duraciones: number[]
  readonly retardos: number[]
  readonly noVerificables: string[]
}

/** En una declaración corta el primer tiempo es la duración y el segundo el retardo; en una suelta lo dice el nombre. */
function repartirPorPapel(tiempos: readonly number[], papel: PapelDeLaPropiedad, destino: TiemposLeidos): void {
  if (papel === 'duracion') {
    destino.duraciones.push(...tiempos)
  } else if (papel === 'retardo') {
    destino.retardos.push(...tiempos)
  } else {
    const [duracion, retardo] = tiempos
    destino.duraciones.push(...(duracion === undefined ? [] : [duracion]))
    destino.retardos.push(...(retardo === undefined ? [] : [retardo]))
  }
}

function leerTiempos(declaracion: DeclaracionLeida, papel: PapelDeLaPropiedad): TiemposLeidos {
  const leidos: TiemposLeidos = { duraciones: [], retardos: [], noVerificables: [] }

  for (const entrada of partirEnNivelSuperior(declaracion.valor, esComa)) {
    const tiempos: number[] = []
    for (const token of partirEnNivelSuperior(entrada, esBlanco)) {
      const milisegundos = milisegundosDe(token)
      if (esNoVerificable(token)) {
        leidos.noVerificables.push(token)
      } else if (milisegundos !== undefined) {
        tiempos.push(milisegundos)
      }
    }
    repartirPorPapel(tiempos, papel, leidos)
  }

  return leidos
}

function animaLaPalabraClaveAll(declaracion: DeclaracionLeida): boolean {
  if (!PROPIEDADES_QUE_NOMBRAN_LO_ANIMADO.has(declaracion.propiedad)) {
    return false
  }
  // En una entrada de `transition` la propiedad puede ir en cualquier posición ("150ms ease-out all" es válida).
  return partirEnNivelSuperior(declaracion.valor, esComa).some((entrada) =>
    partirEnNivelSuperior(entrada, esBlanco).includes(PALABRA_CLAVE_ALL),
  )
}

interface AnalisisDeUnFichero {
  readonly duraciones: DuracionFueraDeEscala[]
  readonly retardos: RetardoFueraDeEscala[]
  readonly noVerificables: ValorNoVerificable[]
  readonly usosDeAll: UsoDePalabraClaveAll[]
}

function analizarFichero(fichero: FicheroEstilos): AnalisisDeUnFichero {
  const analisis: AnalisisDeUnFichero = { duraciones: [], retardos: [], noVerificables: [], usosDeAll: [] }

  for (const declaracion of leerEstilos(fichero.contenido).declaraciones) {
    const { ruta } = fichero
    const { linea } = declaracion
    const papel = PAPEL_DE_LA_PROPIEDAD.get(declaracion.propiedad)
    if (papel !== undefined) {
      const tiempos = leerTiempos(declaracion, papel)
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
 * valor de tiempo que no pueda leer, y cualquier uso de la palabra clave "all"
 * en una declaración de transición.
 */
export function ejecutarPuertaDeEscalaDeMovimiento(ficheros: readonly FicheroEstilos[]): InformeEscalaDeMovimiento {
  if (ficheros.length === CERO_FICHEROS) {
    return {
      pasa: false,
      ficherosInspeccionados: CERO_FICHEROS,
      duracionesFueraDeEscala: [],
      retardosFueraDeEscala: [],
      valoresNoVerificables: [],
      usosDePalabraClaveAll: [],
    }
  }

  const analisis = ficheros.map(analizarFichero)
  const duracionesFueraDeEscala = analisis.flatMap((resultado) => resultado.duraciones)
  const retardosFueraDeEscala = analisis.flatMap((resultado) => resultado.retardos)
  const valoresNoVerificables = analisis.flatMap((resultado) => resultado.noVerificables)
  const usosDePalabraClaveAll = analisis.flatMap((resultado) => resultado.usosDeAll)

  return {
    pasa:
      duracionesFueraDeEscala.length === CERO_HALLAZGOS &&
      retardosFueraDeEscala.length === CERO_HALLAZGOS &&
      valoresNoVerificables.length === CERO_HALLAZGOS &&
      usosDePalabraClaveAll.length === CERO_HALLAZGOS,
    ficherosInspeccionados: ficheros.length,
    duracionesFueraDeEscala,
    retardosFueraDeEscala,
    valoresNoVerificables,
    usosDePalabraClaveAll,
  }
}
