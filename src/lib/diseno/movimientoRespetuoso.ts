/**
 * Puertas de movimiento sobre el TEXTO REAL de los ficheros de estilos, con la
 * lectura de bloques de `lectorDeEstilos.ts` (carácter a carácter, con pila de
 * llaves: un bloque que abre y cierra en la misma línea ya no desordena la pila).
 *
 *   · @s33 de `sistema_de_diseno_visual.feature`: toda `animation`/`transition`
 *     vive dentro de un bloque `@media (prefers-reduced-motion: no-preference)`
 *     o de uno `reduce` (donde se asume que la regla existe para anular la
 *     duración).
 *   · @s8 de `hero_reducido_con_animacion.feature`: la AMPLÍA. Lo que pone algo
 *     en movimiento o lo retarda vive SOLO dentro de `no-preference`.
 */

import { leerEstilos, type DeclaracionLeida, type TipoDeBloque } from './lectorDeEstilos'

export interface FicheroEstilos {
  readonly ruta: string
  readonly contenido: string
}

const PATRON_PROPIEDAD_DE_MOVIMIENTO = /^(?:animation|transition)(?:-[\w-]+)?$/

function estaCubiertaPorUnaConsultaDeMovimiento(bloques: readonly TipoDeBloque[]): boolean {
  return bloques.includes('no-preference') || bloques.includes('reduce')
}

interface DeclaracionDeMovimiento {
  readonly linea: number
  readonly cubierta: boolean
}

function extraerDeclaracionesDeMovimiento(contenido: string): readonly DeclaracionDeMovimiento[] {
  return leerEstilos(contenido)
    .declaraciones.filter((declaracion) => PATRON_PROPIEDAD_DE_MOVIMIENTO.test(declaracion.propiedad))
    .map((declaracion) => ({ linea: declaracion.linea, cubierta: estaCubiertaPorUnaConsultaDeMovimiento(declaracion.bloques) }))
}

export interface IncumplimientoDeMovimiento {
  readonly ruta: string
  readonly linea: number
}

export interface InformeMovimientoRespetuoso {
  readonly pasa: boolean
  readonly ficherosComprobados: number
  readonly incumplimientos: readonly IncumplimientoDeMovimiento[]
}

const CERO_FICHEROS = 0

/** Solo los ficheros que declaran alguna propiedad de movimiento cuentan como "comprobados" (@s33). */
export function ejecutarPuertaDeMovimientoRespetuoso(ficheros: readonly FicheroEstilos[]): InformeMovimientoRespetuoso {
  const ficherosConMovimiento = ficheros.filter((fichero) => extraerDeclaracionesDeMovimiento(fichero.contenido).length > CERO_FICHEROS)

  const incumplimientos = ficherosConMovimiento.flatMap((fichero) =>
    extraerDeclaracionesDeMovimiento(fichero.contenido)
      .filter((declaracion) => !declaracion.cubierta)
      .map((declaracion) => ({ ruta: fichero.ruta, linea: declaracion.linea })),
  )

  return {
    pasa: ficherosConMovimiento.length > CERO_FICHEROS && incumplimientos.length === CERO_FICHEROS,
    ficherosComprobados: ficherosConMovimiento.length,
    incumplimientos,
  }
}

export interface IncumplimientoDeEntrada {
  readonly ruta: string
  readonly linea: number
  readonly propiedad: string
}

export interface InformeDeEntradaDelMovimiento {
  readonly pasa: boolean
  readonly ficherosLeidos: number
  readonly incumplimientos: readonly IncumplimientoDeEntrada[]
  /** Todos los `@keyframes` encontrados, estén donde estén: anti-vacuidad sobre el CONJUNTO de las hojas reales. */
  readonly recuentoDeFotogramas: number
  /** Las declaraciones de entrada que SÍ están dentro de `no-preference`: anti-vacuidad sobre el CONJUNTO. */
  readonly recuentoDeDeclaracionesDeEntradaEnNoPreference: number
}

const SIN_HALLAZGOS = 0
const VALOR_SIN_ANIMACION = 'none'
const PROPIEDADES_DE_ENTRADA: ReadonlySet<string> = new Set(['animation', 'animation-name', 'animation-delay'])
const PROPIEDAD_DE_FOTOGRAMAS = '@keyframes'

function esDeEntrada(declaracion: DeclaracionLeida): boolean {
  if (declaracion.propiedad === 'animation') {
    return declaracion.valor !== VALOR_SIN_ANIMACION
  }
  return PROPIEDADES_DE_ENTRADA.has(declaracion.propiedad)
}

function estaEnNoPreference(bloques: readonly TipoDeBloque[]): boolean {
  return bloques.includes('no-preference')
}

function estaEnUnaConsultaAjena(bloques: readonly TipoDeBloque[]): boolean {
  return bloques.includes('media-ajena') || bloques.includes('reduce')
}

interface LecturaDeEntradaDeUnFichero {
  readonly incumplimientos: readonly IncumplimientoDeEntrada[]
  readonly recuentoDeFotogramas: number
  readonly recuentoDeDeclaracionesEnNoPreference: number
}

function leerEntradaDe(fichero: FicheroEstilos): LecturaDeEntradaDeUnFichero {
  const { declaraciones, fotogramas } = leerEstilos(fichero.contenido)
  const deEntrada = declaraciones.filter(esDeEntrada)
  const deEntradaEnNoPreference = deEntrada.filter((declaracion) => estaEnNoPreference(declaracion.bloques))

  const declaracionesFueraDeNoPreference = deEntrada
    .filter((declaracion) => !estaEnNoPreference(declaracion.bloques))
    .map((declaracion) => ({ ruta: fichero.ruta, linea: declaracion.linea, propiedad: declaracion.propiedad }))
  const fotogramasEnConsultaAjena = fotogramas
    .filter((fotograma) => estaEnUnaConsultaAjena(fotograma.bloques))
    .map((fotograma) => ({ ruta: fichero.ruta, linea: fotograma.linea, propiedad: PROPIEDAD_DE_FOTOGRAMAS }))

  return {
    incumplimientos: [...declaracionesFueraDeNoPreference, ...fotogramasEnConsultaAjena],
    recuentoDeFotogramas: fotogramas.length,
    recuentoDeDeclaracionesEnNoPreference: deEntradaEnNoPreference.length,
  }
}

/**
 * hero_reducido_con_animacion @s8: lo que pone algo en movimiento o lo retarda
 * (`animation` con nombre de fotogramas, `animation-name`, `animation-delay`)
 * vive SOLO dentro de `@media (prefers-reduced-motion: no-preference)`; ni la
 * raíz del fichero, ni `reduce`, ni otra consulta lo cubren. Un `@keyframes` no
 * se admite dentro de `reduce` ni de otra consulta, y en la raíz se admite sin
 * condición (unos fotogramas solos no mueven nada: lo que mueve es la
 * declaración que los usa).
 *
 * El veredicto `pasa` NO lleva las guardas "mayor que 0": esas se aplican al
 * conjunto de las hojas reales leyendo los dos recuentos del informe.
 */
export function ejecutarPuertaDeEntradaSoloEnNoPreference(
  ficheros: readonly FicheroEstilos[],
): InformeDeEntradaDelMovimiento {
  const lecturas = ficheros.map(leerEntradaDe)
  const incumplimientos = lecturas.flatMap((lectura) => lectura.incumplimientos)

  return {
    pasa: ficheros.length > SIN_HALLAZGOS && incumplimientos.length === SIN_HALLAZGOS,
    ficherosLeidos: ficheros.length,
    incumplimientos,
    recuentoDeFotogramas: lecturas.reduce((total, lectura) => total + lectura.recuentoDeFotogramas, SIN_HALLAZGOS),
    recuentoDeDeclaracionesDeEntradaEnNoPreference: lecturas.reduce(
      (total, lectura) => total + lectura.recuentoDeDeclaracionesEnNoPreference,
      SIN_HALLAZGOS,
    ),
  }
}
