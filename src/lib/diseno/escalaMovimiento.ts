/**
 * La escala de movimiento del proyecto (Decisión 31, @s16 de
 * `identidad_visual.feature`): exactamente dos duraciones — 150 ms para
 * cambios de color/borde/fondo, 300 ms para transformaciones y sombras — y
 * una única curva de salida, "ease-out". Contrastada contra el TEXTO REAL de
 * los ficheros de estilos del inventario (los 17 `.module.scss` más las 3
 * hojas globales ya cubiertas por `movimientoRespetuoso.ts`/
 * `movimiento-global.test.ts`): ninguna declaración de transición puede usar
 * una duración fuera de esa escala (salvo el corte "0.01ms" de
 * `prefers-reduced-motion: reduce`, que no es parte de la escala: es su
 * ANULACIÓN), y ninguna puede animar la palabra clave "all".
 */

export interface EscalaDeMovimiento {
  readonly duracionesMs: readonly number[]
  readonly curva: string
}

const DURACIONES_DE_MOVIMIENTO_MS: readonly number[] = [150, 300]
const CURVA_DE_MOVIMIENTO = 'ease-out'

/** El corte de `prefers-reduced-motion: reduce` (@s15): anula la escala, no forma parte de ella. */
export const DURACION_DE_CORTE_REDUCIDO_MS = 0.01

export function escalaDeMovimientoDeclarada(): EscalaDeMovimiento {
  return { duracionesMs: DURACIONES_DE_MOVIMIENTO_MS, curva: CURVA_DE_MOVIMIENTO }
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

export interface UsoDePalabraClaveAll {
  readonly ruta: string
  readonly linea: number
}

export interface InformeEscalaDeMovimiento {
  readonly pasa: boolean
  readonly ficherosInspeccionados: number
  readonly duracionesFueraDeEscala: readonly DuracionFueraDeEscala[]
  readonly usosDePalabraClaveAll: readonly UsoDePalabraClaveAll[]
}

const CERO_FICHEROS = 0
const CERO_HALLAZGOS = 0

/** Una línea que declara "transition"/"animation" o su forma "-duration" (nunca "-timing-function" a secas). */
const PATRON_LINEA_DE_MOVIMIENTO = /^\s*(?:animation|transition)(?:-duration)?\s*:/
/** Cada número de milisegundos que aparezca en esa línea (una declaración puede listar varias, separadas por comas). */
const PATRON_DURACION_MS = /(\d+(?:\.\d+)?)ms/g
/** "all" como palabra de propiedad completa (evita falsos positivos como "all-caps"). */
const PATRON_PALABRA_CLAVE_ALL = /(?:animation|transition)(?:-property)?\s*:\s*all\b|,\s*all\b/

const VALORES_DE_ESCALA_MS: ReadonlySet<number> = new Set([...DURACIONES_DE_MOVIMIENTO_MS, DURACION_DE_CORTE_REDUCIDO_MS])

function duracionesDeLaLinea(linea: string): readonly number[] {
  return [...linea.matchAll(PATRON_DURACION_MS)].map((coincidencia) => Number(coincidencia[1]))
}

function analizarFichero(fichero: FicheroEstilos): {
  duraciones: DuracionFueraDeEscala[]
  usosDeAll: UsoDePalabraClaveAll[]
} {
  const duraciones: DuracionFueraDeEscala[] = []
  const usosDeAll: UsoDePalabraClaveAll[] = []

  fichero.contenido.split('\n').forEach((linea, indice) => {
    if (!PATRON_LINEA_DE_MOVIMIENTO.test(linea)) {
      return
    }
    const numeroDeLinea = indice + 1
    duracionesDeLaLinea(linea)
      .filter((valorMs) => !VALORES_DE_ESCALA_MS.has(valorMs))
      .forEach((valorMs) => duraciones.push({ ruta: fichero.ruta, linea: numeroDeLinea, valorMs }))
    if (PATRON_PALABRA_CLAVE_ALL.test(linea)) {
      usosDeAll.push({ ruta: fichero.ruta, linea: numeroDeLinea })
    }
  })

  return { duraciones, usosDeAll }
}

/**
 * Recorre el texto real de cada fichero del inventario y señala cualquier
 * duración de movimiento fuera de la escala declarada, y cualquier uso de la
 * palabra clave "all" en una declaración de animación o transición.
 */
export function ejecutarPuertaDeEscalaDeMovimiento(ficheros: readonly FicheroEstilos[]): InformeEscalaDeMovimiento {
  if (ficheros.length === CERO_FICHEROS) {
    return { pasa: false, ficherosInspeccionados: CERO_FICHEROS, duracionesFueraDeEscala: [], usosDePalabraClaveAll: [] }
  }

  const analisis = ficheros.map(analizarFichero)
  const duracionesFueraDeEscala = analisis.flatMap((resultado) => resultado.duraciones)
  const usosDePalabraClaveAll = analisis.flatMap((resultado) => resultado.usosDeAll)

  return {
    pasa: duracionesFueraDeEscala.length === CERO_HALLAZGOS && usosDePalabraClaveAll.length === CERO_HALLAZGOS,
    ficherosInspeccionados: ficheros.length,
    duracionesFueraDeEscala,
    usosDePalabraClaveAll,
  }
}
