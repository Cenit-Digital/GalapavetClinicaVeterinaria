/**
 * Puerta "toda animación/transición vive dentro de `prefers-reduced-motion`"
 * (@s33 de `sistema_de_diseno_visual.feature`): recorre el texto REAL de
 * cada fichero de estilos, siguiendo la profundidad de bloques `{ }` línea a
 * línea (todo el SCSS del proyecto abre/cierra como mucho un bloque por
 * línea, mismo estilo en los 17 ficheros del inventario), y señala cualquier
 * declaración `animation`/`transition` que no esté anidada dentro de un
 * bloque `@media (prefers-reduced-motion: no-preference)` ni de uno
 * `reduce` (donde se asume que la regla existe para anular la duración).
 */

export interface FicheroEstilos {
  readonly ruta: string
  readonly contenido: string
}

type TipoDeBloque = 'no-preference' | 'reduce' | 'otro'

const PATRON_NO_PREFERENCE = /@media[^{]*prefers-reduced-motion:\s*no-preference/
const PATRON_REDUCE = /@media[^{]*prefers-reduced-motion:\s*reduce\b/
const PATRON_PROPIEDAD_DE_MOVIMIENTO = /^\s*(animation|transition)(-[\w-]+)?\s*:/

function tipoDeAperturaEnLinea(linea: string): TipoDeBloque {
  if (PATRON_NO_PREFERENCE.test(linea)) {
    return 'no-preference'
  }
  if (PATRON_REDUCE.test(linea)) {
    return 'reduce'
  }
  return 'otro'
}

interface DeclaracionDeMovimiento {
  readonly linea: number
  readonly cubierta: boolean
}

function extraerDeclaracionesDeMovimiento(contenido: string): readonly DeclaracionDeMovimiento[] {
  const pila: TipoDeBloque[] = []
  const declaraciones: DeclaracionDeMovimiento[] = []

  contenido.split('\n').forEach((linea, indice) => {
    if (PATRON_PROPIEDAD_DE_MOVIMIENTO.test(linea)) {
      declaraciones.push({ linea: indice + 1, cubierta: pila.includes('no-preference') || pila.includes('reduce') })
    }
    if (linea.includes('{')) {
      pila.push(tipoDeAperturaEnLinea(linea))
    } else if (linea.includes('}')) {
      pila.pop()
    }
  })

  return declaraciones
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
