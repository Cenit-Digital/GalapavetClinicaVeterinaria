/**
 * Lector de hojas de estilos SCSS compartido por las puertas de movimiento
 * (`movimientoRespetuoso.ts`, `escalaMovimiento.ts` y
 * `accesibilidad-movimiento.ts`). Recorre el TEXTO carácter a carácter, con una
 * pila de bloques `{ }`, y devuelve cada declaración con los bloques que la
 * contienen. Existe porque la lectura LÍNEA A LÍNEA de la que partían esas
 * puertas tenía agujeros medidos: un bloque que abre y cierra en una sola línea
 * (`from { opacity: 0; }`) dejaba una llave abierta en la pila, y una
 * declaración repartida en varias líneas solo se leía en la primera.
 */

export type TipoDeBloque = 'no-preference' | 'reduce' | 'media-ajena' | 'keyframes' | 'regla'

export interface DeclaracionLeida {
  readonly propiedad: string
  readonly valor: string
  /** Línea (empezando en 1) donde arranca la declaración. */
  readonly linea: number
  /** Los bloques que la contienen, del más externo al más interno. */
  readonly bloques: readonly TipoDeBloque[]
}

export interface FotogramasLeidos {
  /** Línea donde arranca el `@keyframes`. */
  readonly linea: number
  /** Los bloques que lo contienen, del más externo al más interno. */
  readonly bloques: readonly TipoDeBloque[]
}

export interface EstilosLeidos {
  readonly declaraciones: readonly DeclaracionLeida[]
  readonly fotogramas: readonly FotogramasLeidos[]
}

const PATRON_DECLARACION = /^([\w-]+)\s*:\s*([\s\S]*)/
const PATRON_NO_PREFERENCE = /prefers-reduced-motion:\s*no-preference/
const PATRON_REDUCE = /prefers-reduced-motion:\s*reduce\b/
const PATRON_COMENTARIO = /\/\*[\s\S]*?\*\/|(?<=^|\s)\/\/[^\n]*/g
const SALTO_DE_LINEA = '\n'
const ESPACIO = ' '

function tipoDeConsultaDe(consulta: string): TipoDeBloque {
  if (PATRON_NO_PREFERENCE.test(consulta)) {
    return 'no-preference'
  }
  return PATRON_REDUCE.test(consulta) ? 'reduce' : 'media-ajena'
}

function tipoDeBloqueDe(encabezado: string): TipoDeBloque {
  const texto = encabezado.trim()
  if (texto.startsWith('@media')) {
    return tipoDeConsultaDe(texto)
  }
  return texto.startsWith('@keyframes') ? 'keyframes' : 'regla'
}

/** La línea (empezando en 1) de una posición del texto: los saltos de línea que la preceden, más uno. */
function lineaDe(contenido: string, posicion: number): number {
  return contenido.slice(0, posicion).split(SALTO_DE_LINEA).length
}

function lineaDelPrimerCaracter(contenido: string, sentencia: string, posicionDeInicio: number): number {
  const espaciosIniciales = sentencia.length - sentencia.trimStart().length
  return lineaDe(contenido, posicionDeInicio + espaciosIniciales)
}

function leerDeclaracion(
  sentencia: string,
  linea: number,
  bloques: readonly TipoDeBloque[],
): DeclaracionLeida | undefined {
  const coincidencia = PATRON_DECLARACION.exec(sentencia.trim())
  if (coincidencia === null) {
    return undefined
  }
  return { propiedad: coincidencia[1] as string, valor: coincidencia[2] as string, linea, bloques }
}

/**
 * Sustituye cada línea de un comentario por un espacio (conservando los saltos
 * de línea), de modo que ni sus llaves ni sus puntos y coma cuenten, los dos
 * lados de un comentario no se peguen en un solo token y los números de línea
 * sigan siendo los del fichero. Una "//" solo abre un comentario al principio de
 * la hoja o tras un blanco: la de "http://…" dentro de un `url()` no lo es.
 */
function sinComentarios(contenido: string): string {
  return contenido.replace(PATRON_COMENTARIO, (comentario) =>
    comentario
      .split(SALTO_DE_LINEA)
      .map(() => ESPACIO)
      .join(SALTO_DE_LINEA),
  )
}

/** Posición de la llave que cierra la interpolación `#{…}` cuya llave de apertura está en `apertura`. */
function posicionDeCierreDeLaInterpolacion(texto: string, apertura: number): number {
  let profundidad = 0
  for (let indice = apertura; indice < texto.length; indice += 1) {
    if (texto[indice] === '{') {
      profundidad += 1
    } else if (texto[indice] === '}') {
      profundidad -= 1
    }
    if (profundidad === 0) {
      return indice
    }
  }
  return texto.length - 1
}

export function leerEstilos(contenidoOriginal: string): EstilosLeidos {
  const contenido = sinComentarios(contenidoOriginal)
  const pila: TipoDeBloque[] = []
  const declaraciones: DeclaracionLeida[] = []
  const fotogramas: FotogramasLeidos[] = []
  let sentencia = ''
  let posicionDeInicio = 0

  for (let indice = 0; indice < contenido.length; indice += 1) {
    const caracter = contenido[indice]
    if (contenido.startsWith('#{', indice)) {
      const cierre = posicionDeCierreDeLaInterpolacion(contenido, indice + 1)
      sentencia += contenido.slice(indice, cierre + 1)
      indice = cierre
    } else if (caracter === '{') {
      const tipo = tipoDeBloqueDe(sentencia)
      if (tipo === 'keyframes') {
        fotogramas.push({ linea: lineaDelPrimerCaracter(contenido, sentencia, posicionDeInicio), bloques: [...pila] })
      }
      pila.push(tipo)
      sentencia = ''
      posicionDeInicio = indice + 1
    } else if (caracter === ';' || caracter === '}') {
      const linea = lineaDelPrimerCaracter(contenido, sentencia, posicionDeInicio)
      const declaracion = leerDeclaracion(sentencia, linea, [...pila])
      if (declaracion !== undefined) {
        declaraciones.push(declaracion)
      }
      if (caracter === '}') {
        pila.pop()
      }
      sentencia = ''
      posicionDeInicio = indice + 1
    } else {
      sentencia += caracter
    }
  }

  return { declaraciones, fotogramas }
}
