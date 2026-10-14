/**
 * Lector de hojas de estilos SCSS compartido por las puertas de movimiento
 * (`movimientoRespetuoso.ts`, `escalaMovimiento.ts` y
 * `accesibilidad-movimiento.ts`). Recorre el TEXTO con una pila de bloques
 * `{ }` y devuelve cada declaración con los bloques que la contienen. Existe
 * porque la lectura LÍNEA A LÍNEA de la que partían esas puertas tenía agujeros
 * medidos: un bloque que abre y cierra en una sola línea (`from { opacity: 0; }`)
 * dejaba una llave abierta en la pila, y una declaración repartida en varias
 * líneas solo se leía en la primera.
 *
 * DISEÑO DEL RECORRIDO (B7 y B8 de la revisión de la feature 48). No hay ningún
 * índice que se mueva a mano: el texto se enmascara UNA vez (comentarios,
 * cadenas, escapes e interpolaciones pasan a blancos del mismo largo,
 * conservando los saltos de línea) y después se recorren con `matchAll` solo las
 * posiciones de las llaves, los puntos y coma, las comillas sueltas y los saltos
 * de línea. Eso da dos cosas que el recorrido carácter a carácter no daba: el
 * número de línea sale de un contador que sube con cada salto (lineal, en vez de
 * volver a partir el texto por sentencia) y ninguna mutación puede dejar un bucle
 * que no termina, porque `matchAll` es finito.
 *
 * LO QUE NO SABE LEER SE DECLARA (B1): la profundidad final de la pila y las
 * sentencias no verificables salen en el resultado, y quien lo consume falla
 * CERRADO si hay alguna (`esLecturaFiable`).
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

export interface SentenciaNoVerificable {
  /** Línea (empezando en 1) de la sentencia o de la comilla sin cerrar. */
  readonly linea: number
}

export interface EstilosLeidos {
  readonly declaraciones: readonly DeclaracionLeida[]
  readonly fotogramas: readonly FotogramasLeidos[]
  /**
   * Las llaves que no cuadran: cada `{` sin su `}` y cada `}` sin su `{` suman 1. Una hoja
   * equilibrada acaba con 0; cualquier otro valor significa que la pila de bloques que
   * vio cada declaración no es de fiar y la puerta que la lee debe fallar CERRADA.
   */
  readonly profundidadFinal: number
  /**
   * Lo que el lector NO sabe leer y no descarta en silencio: un nombre de propiedad con
   * una interpolación de Sass (`#{$p}: …`) y una cadena que no se cierra en su línea.
   * Quien lea esta hoja debe fallar CERRADO si no está vacía.
   */
  readonly sentenciasNoVerificables: readonly SentenciaNoVerificable[]
}

const PATRON_DECLARACION = /^((?:[\w-]|#\{[^{}]*\})+)\s*:\s*([\s\S]*)/
const PATRON_ARRANQUE_DE_MEDIA = /^@media(?![\w-])/i
const PATRON_ARRANQUE_DE_FOTOGRAMAS = /^@(?:-[a-z]+-)?keyframes(?![\w-])/i
const PATRON_NO_PREFERENCE = /\(\s*prefers-reduced-motion\s*:\s*no-preference\s*\)/i
const PATRON_REDUCE = /\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/i
const PATRON_QUE_CAMBIA_EL_SENTIDO_DE_LA_CONSULTA = /(?<![\w-])(?:not|or)(?![\w-])|,|#\{/i
/**
 * Los cinco tipos de texto que no son estructura: comentario de bloque (sin
 * cerrar, llega al final de la hoja, como en CSS), comentario de línea, cadena
 * entrecomillada (con sus escapes; una sin cerrar en su línea no casa), una barra
 * invertida con el carácter que escapa (no un salto de línea) e interpolación
 * `#{…}`. Al recorrer el texto de izquierda a derecha, quien empieza antes se
 * queda con lo que contiene: una comilla dentro de un comentario y una "//"
 * dentro de una cadena no cuentan.
 */
const PATRON_LEXICO =
  /\/\*[\s\S]*?(?:\*\/|$)|(?<=^|[\s;{}])\/\/[^\n]*|"(?:[^"\\\n]|\\[\s\S])*"|'(?:[^'\\\n]|\\[\s\S])*'|\\[^\n]|#\{[^{}]*(?:\}|$)/g
const PATRON_CARACTER_QUE_NO_ES_SALTO = /[^\n]/g
const PATRON_ESTRUCTURA = /[{};\n"']/g
const PATRON_FINAL_DE_LINEA_DE_WINDOWS = /\r\n/g
const PATRON_PREFIJO_DE_FABRICANTE = /^-[a-z]+-/
const PATRON_IMPORTANTE_FINAL = /\s*!\s*important\s*$/i
const SALTO_DE_LINEA = '\n'
const ABRE_BLOQUE = '{'
const CIERRA_BLOQUE = '}'
const COMILLA_DOBLE = '"'
const COMILLA_SIMPLE = "'"
const ABRE_INTERPOLACION = '#{'
const PREFIJO_DE_PROPIEDAD_PERSONALIZADA = '--'
const ESPACIO = ' '

/**
 * "no-preference" y "reduce" solo se dan para una consulta que es exactamente esa
 * condición, a lo sumo unida con `and` a otras. `not`, `or`, una coma (una lista de
 * consultas) o una interpolación hacen que se cumpla también, o solo, con la
 * preferencia contraria, y una consulta con las DOS condiciones no se cumple nunca:
 * todas esas, y cualquier otra, son "media-ajena", que no cubre nada.
 */
function tipoDeConsultaDe(consulta: string): TipoDeBloque {
  if (PATRON_QUE_CAMBIA_EL_SENTIDO_DE_LA_CONSULTA.test(consulta)) {
    return 'media-ajena'
  }
  const sinPreferencia = PATRON_NO_PREFERENCE.test(consulta)
  const reducido = PATRON_REDUCE.test(consulta)
  if (sinPreferencia === reducido) {
    return 'media-ajena'
  }
  return sinPreferencia ? 'no-preference' : 'reduce'
}

function tipoDeBloqueDe(encabezado: string): TipoDeBloque {
  const texto = encabezado.trim()
  if (PATRON_ARRANQUE_DE_MEDIA.test(texto)) {
    return tipoDeConsultaDe(texto)
  }
  return PATRON_ARRANQUE_DE_FOTOGRAMAS.test(texto) ? 'keyframes' : 'regla'
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

function esUnNombreInterpolado(propiedad: string): boolean {
  return propiedad.includes(ABRE_INTERPOLACION)
}

/**
 * Un nombre de propiedad con una interpolación (`#{$p}`, `animation-#{$p}`) no
 * se puede resolver leyendo el texto: podría ser `animation`. Solo se salva el
 * de una propiedad personalizada (`--#{$n}`), que por su prefijo nunca es de
 * movimiento.
 */
function esUnNombreNoVerificable(propiedad: string): boolean {
  return esUnNombreInterpolado(propiedad) && !propiedad.startsWith(PREFIJO_DE_PROPIEDAD_PERSONALIZADA)
}

/**
 * El nombre de una propiedad tal como CSS lo entiende: sin distinguir mayúsculas
 * y sin el prefijo de fabricante (`-webkit-animation` es `animation`). Una
 * propiedad personalizada (`--x`) no lleva prefijo de fabricante y queda como está.
 */
export function nombreCanonicoDeLaPropiedad(propiedad: string): string {
  return propiedad.toLowerCase().replace(PATRON_PREFIJO_DE_FABRICANTE, '')
}

/** El valor sin su `!important` final: marca la prioridad, no cambia lo que dice el valor. */
export function valorSinImportante(valor: string): string {
  return valor.replace(PATRON_IMPORTANTE_FINAL, '')
}

/** El valor tal como se compara con una palabra clave: sin `!important` y sin distinguir mayúsculas. */
export function valorNormalizado(valor: string): string {
  return valorSinImportante(valor).toLowerCase()
}

/**
 * Una hoja se da por leída solo si no queda nada sin cuadrar ni sin leer: con las
 * llaves descuadradas la pila de cada declaración no es de fiar, y una sentencia
 * no verificable podría ser justo la declaración que la puerta busca. Toda puerta
 * que lea una hoja con este lector falla CERRADA cuando esto es `false`.
 */
export function esLecturaFiable(estilos: EstilosLeidos): boolean {
  return estilos.profundidadFinal === 0 && estilos.sentenciasNoVerificables.length === 0
}

/** Sustituye cada carácter menos el salto de línea por un espacio: el largo y las líneas no cambian. */
function enBlanco(texto: string): string {
  return texto.replace(PATRON_CARACTER_QUE_NO_ES_SALTO, ESPACIO)
}

interface TextoEnmascarado {
  /** El texto con los comentarios en blanco: de aquí salen las sentencias. */
  readonly sinComentarios: string
  /** Lo mismo, con las cadenas y las interpolaciones también en blanco: aquí se buscan las llaves y los puntos y coma. */
  readonly estructura: string
}

function esUnComentario(token: string): boolean {
  return token.startsWith('/')
}

/**
 * Los comentarios no cuentan: ni sus llaves ni sus puntos y coma cuentan, los
 * dos lados de un comentario no se pegan en un solo token (el blanco ocupa su
 * sitio) y los números de línea siguen siendo los del fichero. Una "//" solo abre
 * un comentario al principio de la hoja o tras un blanco, un punto y coma o una
 * llave: la de "http://…" dentro de un `url()` no lo es. Las cadenas, los escapes
 * y las interpolaciones `#{…}` se enmascaran solo en `estructura`: sus llaves y
 * sus puntos y coma no abren ni cierran nada, pero su texto sigue formando parte
 * del valor. Los finales de línea de Windows se normalizan al entrar, para que
 * ni el valor de una declaración de varias líneas los lleve dentro.
 */
function enmascarar(contenido: string): TextoEnmascarado {
  const normalizado = contenido.replace(PATRON_FINAL_DE_LINEA_DE_WINDOWS, SALTO_DE_LINEA)
  return {
    sinComentarios: normalizado.replace(PATRON_LEXICO, (token) => (esUnComentario(token) ? enBlanco(token) : token)),
    estructura: normalizado.replace(PATRON_LEXICO, enBlanco),
  }
}

/** Cuántos saltos de línea hay en el blanco que precede a la primera palabra de una sentencia. */
function saltosAntesDeLaPrimeraPalabra(sentencia: string): number {
  const blancos = sentencia.slice(0, sentencia.length - sentencia.trimStart().length)
  return blancos.split(SALTO_DE_LINEA).length - 1
}

interface Recorrido {
  readonly pila: TipoDeBloque[]
  readonly declaraciones: DeclaracionLeida[]
  readonly fotogramas: FotogramasLeidos[]
  readonly noVerificables: SentenciaNoVerificable[]
  /** Línea del carácter que se está leyendo. */
  linea: number
  /** Posición donde arranca la sentencia en curso, y la línea de esa posición. */
  inicioDeLaSentencia: number
  lineaDelInicio: number
  cierresDeMas: number
}

function abrirBloque(recorrido: Recorrido, sentencia: string, lineaDeLaSentencia: number): void {
  const tipo = tipoDeBloqueDe(sentencia)
  if (tipo === 'keyframes') {
    recorrido.fotogramas.push({ linea: lineaDeLaSentencia, bloques: [...recorrido.pila] })
  }
  recorrido.pila.push(tipo)
}

function cerrarSentencia(recorrido: Recorrido, sentencia: string, lineaDeLaSentencia: number, cierraBloque: boolean): void {
  const declaracion = leerDeclaracion(sentencia, lineaDeLaSentencia, [...recorrido.pila])
  if (declaracion !== undefined && esUnNombreNoVerificable(declaracion.propiedad)) {
    recorrido.noVerificables.push({ linea: lineaDeLaSentencia })
  } else if (declaracion !== undefined && !esUnNombreInterpolado(declaracion.propiedad)) {
    recorrido.declaraciones.push(declaracion)
  }
  if (cierraBloque) {
    recorrido.cierresDeMas += recorrido.pila.pop() === undefined ? 1 : 0
  }
}

export function leerEstilos(contenidoOriginal: string): EstilosLeidos {
  const { sinComentarios, estructura } = enmascarar(contenidoOriginal)
  const recorrido: Recorrido = {
    pila: [],
    declaraciones: [],
    fotogramas: [],
    noVerificables: [],
    linea: 1,
    inicioDeLaSentencia: 0,
    lineaDelInicio: 1,
    cierresDeMas: 0,
  }

  for (const evento of estructura.matchAll(PATRON_ESTRUCTURA)) {
    const caracter = evento[0]
    if (caracter === SALTO_DE_LINEA) {
      recorrido.linea += 1
    } else if (caracter === COMILLA_DOBLE || caracter === COMILLA_SIMPLE) {
      // Una comilla que sobrevive al enmascarado es la de una cadena que no se cierra en su línea.
      recorrido.noVerificables.push({ linea: recorrido.linea })
    } else {
      const sentencia = sinComentarios.slice(recorrido.inicioDeLaSentencia, evento.index)
      const lineaDeLaSentencia = recorrido.lineaDelInicio + saltosAntesDeLaPrimeraPalabra(sentencia)
      if (caracter === ABRE_BLOQUE) {
        abrirBloque(recorrido, sentencia, lineaDeLaSentencia)
      } else {
        cerrarSentencia(recorrido, sentencia, lineaDeLaSentencia, caracter === CIERRA_BLOQUE)
      }
      recorrido.inicioDeLaSentencia = evento.index + 1
      recorrido.lineaDelInicio = recorrido.linea
    }
  }

  return {
    declaraciones: recorrido.declaraciones,
    fotogramas: recorrido.fotogramas,
    profundidadFinal: recorrido.pila.length + recorrido.cierresDeMas,
    sentenciasNoVerificables: recorrido.noVerificables,
  }
}

export interface FicheroEstilos {
  readonly ruta: string
  readonly contenido: string
}

export interface FicheroLeido {
  readonly ruta: string
  readonly estilos: EstilosLeidos
}

/** Lee cada fichero, con su ruta y en el mismo orden en que llegan. */
export function leerFicheros(ficheros: readonly FicheroEstilos[]): readonly FicheroLeido[] {
  return ficheros.map((fichero) => ({ ruta: fichero.ruta, estilos: leerEstilos(fichero.contenido) }))
}

/** Las rutas de las hojas que no se pudieron leer enteras (ver `esLecturaFiable`), en el orden en que llegan. */
export function rutasSinLecturaFiable(leidos: readonly FicheroLeido[]): readonly string[] {
  return leidos.filter((leido) => !esLecturaFiable(leido.estilos)).map((leido) => leido.ruta)
}
