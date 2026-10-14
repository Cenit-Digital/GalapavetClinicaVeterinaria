/**
 * Puertas de movimiento sobre el TEXTO REAL de los ficheros de estilos, con la
 * lectura de bloques de `lectorDeEstilos.ts` (con pila de llaves, que entiende
 * comentarios, cadenas, escapes e interpolaciones: un bloque que abre y cierra en
 * la misma línea o una llave dentro de una cadena ya no desordenan la pila).
 *
 *   · @s33 de `sistema_de_diseno_visual.feature`: toda `animation`/`transition`
 *     vive dentro de un bloque `@media (prefers-reduced-motion: no-preference)`
 *     o de uno `reduce` (donde se asume que la regla existe para anular la
 *     duración).
 *   · @s8 de `hero_reducido_con_animacion.feature`: la AMPLÍA. Lo que pone algo
 *     en movimiento o lo retarda vive SOLO dentro de `no-preference`.
 *
 * Las dos FALLAN CERRADAS ante una hoja que el lector no puede leer entera
 * (llaves que no cuadran, un nombre de propiedad con interpolación, una cadena
 * sin cerrar): la nombran en `ficherosSinLecturaFiable` y no pasan.
 */

import {
  leerFicheros,
  nombreCanonicoDeLaPropiedad,
  rutasSinLecturaFiable,
  valorNormalizado,
  type DeclaracionLeida,
  type FicheroEstilos,
  type FicheroLeido,
  type TipoDeBloque,
} from './lectorDeEstilos'

export type { FicheroEstilos } from './lectorDeEstilos'

const NINGUNO = 0
const PATRON_PROPIEDAD_DE_MOVIMIENTO = /^(?:animation|transition)(?:-[\w-]+)?$/

function estaCubiertaPorUnaConsultaDeMovimiento(bloques: readonly TipoDeBloque[]): boolean {
  return bloques.includes('no-preference') || bloques.includes('reduce')
}

function esDeMovimiento(declaracion: DeclaracionLeida): boolean {
  return PATRON_PROPIEDAD_DE_MOVIMIENTO.test(nombreCanonicoDeLaPropiedad(declaracion.propiedad))
}

export interface IncumplimientoDeMovimiento {
  readonly ruta: string
  readonly linea: number
}

export interface InformeMovimientoRespetuoso {
  readonly pasa: boolean
  readonly ficherosComprobados: number
  readonly incumplimientos: readonly IncumplimientoDeMovimiento[]
  /** Las hojas que el lector no pudo leer entera: con una sola, la puerta no pasa. */
  readonly ficherosSinLecturaFiable: readonly string[]
}

/** Solo los ficheros que declaran alguna propiedad de movimiento cuentan como "comprobados" (@s33). */
export function ejecutarPuertaDeMovimientoRespetuoso(ficheros: readonly FicheroEstilos[]): InformeMovimientoRespetuoso {
  const leidos = leerFicheros(ficheros)
  const conMovimiento = leidos
    .map((leido) => ({ ruta: leido.ruta, declaraciones: leido.estilos.declaraciones.filter(esDeMovimiento) }))
    .filter((leido) => leido.declaraciones.length > NINGUNO)
  const incumplimientos = conMovimiento.flatMap((leido) =>
    leido.declaraciones
      .filter((declaracion) => !estaCubiertaPorUnaConsultaDeMovimiento(declaracion.bloques))
      .map((declaracion) => ({ ruta: leido.ruta, linea: declaracion.linea })),
  )
  const ficherosSinLecturaFiable = rutasSinLecturaFiable(leidos)

  return {
    pasa: conMovimiento.length > NINGUNO && incumplimientos.length === NINGUNO && ficherosSinLecturaFiable.length === NINGUNO,
    ficherosComprobados: conMovimiento.length,
    incumplimientos,
    ficherosSinLecturaFiable,
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
  /** Las hojas que el lector no pudo leer entera: con una sola, la puerta no pasa. */
  readonly ficherosSinLecturaFiable: readonly string[]
}

const VALOR_SIN_ANIMACION = 'none'
const PROPIEDADES_DE_ENTRADA_SIEMPRE: ReadonlySet<string> = new Set(['animation-name', 'animation-delay'])
const PROPIEDAD_DE_FOTOGRAMAS = '@keyframes'

/**
 * `animation` es de entrada salvo que valga `none` (la anulación que `reduce`
 * admite, escrita como se escriba: `NONE`, `none !important`). `animation-name` y
 * `animation-delay` lo son SIEMPRE, también con `none`: la fila firmada de @s8
 * ("animation-name: none" dentro de "reduce" incumple) lo exige.
 */
function esDeEntrada(declaracion: DeclaracionLeida): boolean {
  const propiedad = nombreCanonicoDeLaPropiedad(declaracion.propiedad)
  if (propiedad === 'animation') {
    return valorNormalizado(declaracion.valor) !== VALOR_SIN_ANIMACION
  }
  return PROPIEDADES_DE_ENTRADA_SIEMPRE.has(propiedad)
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

function leerEntradaDe(leido: FicheroLeido): LecturaDeEntradaDeUnFichero {
  const { declaraciones, fotogramas } = leido.estilos
  const deEntrada = declaraciones.filter(esDeEntrada)
  const deEntradaEnNoPreference = deEntrada.filter((declaracion) => estaEnNoPreference(declaracion.bloques))

  const declaracionesFueraDeNoPreference = deEntrada
    .filter((declaracion) => !estaEnNoPreference(declaracion.bloques))
    .map((declaracion) => ({ ruta: leido.ruta, linea: declaracion.linea, propiedad: declaracion.propiedad }))
  const fotogramasEnConsultaAjena = fotogramas
    .filter((fotograma) => estaEnUnaConsultaAjena(fotograma.bloques))
    .map((fotograma) => ({ ruta: leido.ruta, linea: fotograma.linea, propiedad: PROPIEDAD_DE_FOTOGRAMAS }))

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
  const leidos = leerFicheros(ficheros)
  const lecturas = leidos.map(leerEntradaDe)
  const incumplimientos = lecturas.flatMap((lectura) => lectura.incumplimientos)
  const ficherosSinLecturaFiable = rutasSinLecturaFiable(leidos)

  return {
    pasa: ficheros.length > NINGUNO && incumplimientos.length === NINGUNO && ficherosSinLecturaFiable.length === NINGUNO,
    ficherosLeidos: ficheros.length,
    incumplimientos,
    recuentoDeFotogramas: lecturas.reduce((total, lectura) => total + lectura.recuentoDeFotogramas, NINGUNO),
    recuentoDeDeclaracionesDeEntradaEnNoPreference: lecturas.reduce(
      (total, lectura) => total + lectura.recuentoDeDeclaracionesEnNoPreference,
      NINGUNO,
    ),
    ficherosSinLecturaFiable,
  }
}
