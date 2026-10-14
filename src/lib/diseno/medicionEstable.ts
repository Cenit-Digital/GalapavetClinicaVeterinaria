/**
 * Comprobación estática de `hero_reducido_con_animacion.feature` @s10: todo
 * `test(` de un spec de navegador que MIDE la portada recién cargada lo hace con
 * la entrada del hero ya terminada o con movimiento reducido emulado. Es un
 * MÓDULO PURO (mordible por StrykerJS) que lee el TEXTO de un spec y decide,
 * bloque por bloque —nunca por fichero: un grep del fichero entero es vacuo—,
 * si cada bloque cumple.
 *
 * Un bloque que mide hace UNA de dos cosas antes de su PRIMERA medición:
 *   (a) llama al ayudante `esperarEntradaTerminada`, directamente o por una
 *       función local del mismo fichero (resolución de UN nivel);
 *   (b) emula `reduce` con `emulateMedia` ANTES del primer `goto`.
 * Queda EXENTO el bloque que congela el reloj de animaciones antes de navegar Y
 * coloca (`currentTime`) o cancela las animaciones antes de medir (no puede
 * esperar a que acabe una animación que nunca acaba), y el que no mide nada que
 * una entrada animada pueda falsear.
 *
 * QUÉ CUENTA COMO «MEDIR»: la lista cerrada del contrato. La obligación se acota
 * a lo que mide el hero o la página entera: un localizador del hero
 * (`[data-hero-`, `h1`, un encabezado de nivel 1, «Reservar cita») o `body *`,
 * y `AxeBuilder` sin `.include(` o una captura de la página.
 *
 * LÍMITES CONOCIDOS, a propósito: la lectura es textual, no un análisis de
 * TypeScript. Una "/" abre una expresión regular solo tras `( , = : [ ! & | ? { } ;`
 * o al principio del texto (la heurística clásica: una regex tras `)` o tras una
 * palabra como `return` se leería como división); una función local que llama a
 * otra que mide no se expande (un solo nivel, como pide el contrato); y la
 * precedencia es TEXTUAL, como pide el contrato: una función declarada dentro del
 * test cuenta donde se escribe, no donde se llama.
 */

export type Veredicto = 'pasa' | 'incumple' | 'exento'

export interface VeredictoDeBloque {
  readonly titulo: string
  readonly veredicto: Veredicto
}

export interface InformeDeMedicionEstable {
  readonly pasa: boolean
  /** Todos los `test(` leídos, también los exentos: anti-vacuidad. */
  readonly bloquesInspeccionados: number
  readonly bloques: readonly VeredictoDeBloque[]
  /** Los títulos de los bloques que incumplen. */
  readonly incumplimientos: readonly string[]
}

const NINGUN_BLOQUE = 0
const NO_ENCONTRADO = -1
const SALTO_DE_LINEA = '\n'
const ESPACIO = ' '

// ---------------------------------------------------------------------------
// 1. ENMASCARAR comentarios y cadenas (la posición de cada carácter se conserva)
// ---------------------------------------------------------------------------

const COMILLAS = new Set(["'", '"', '`'])

function enBlanco(tramo: string): string {
  return ESPACIO.repeat(tramo.length)
}

const ABRE_COMENTARIO_DE_LINEA = '//'
const ABRE_COMENTARIO_DE_BLOQUE = '/*'
const CIERRA_COMENTARIO_DE_BLOQUE = '*/'
/** La barra invertida y el carácter que escapa. */
const LARGO_DE_UN_ESCAPE = 2

/** Posición donde termina el comentario que empieza en `inicio`, o `inicio` si ahí no empieza ninguno. */
function finDelComentario(texto: string, inicio: number): number {
  if (texto.startsWith(ABRE_COMENTARIO_DE_LINEA, inicio)) {
    const finDeLinea = texto.indexOf(SALTO_DE_LINEA, inicio)
    return finDeLinea === NO_ENCONTRADO ? texto.length : finDeLinea
  }
  if (texto.startsWith(ABRE_COMENTARIO_DE_BLOQUE, inicio)) {
    const cierre = texto.indexOf(CIERRA_COMENTARIO_DE_BLOQUE, inicio + ABRE_COMENTARIO_DE_BLOQUE.length)
    return cierre === NO_ENCONTRADO ? texto.length : cierre + CIERRA_COMENTARIO_DE_BLOQUE.length
  }
  return inicio
}

/** Posición siguiente al cierre de la cadena que empieza en `inicio` (con su comilla de apertura). */
function finDeLaCadena(texto: string, inicio: number): number {
  const comilla = texto[inicio]
  let indice = inicio + 1
  while (indice < texto.length) {
    if (texto[indice] === '\\') {
      indice += LARGO_DE_UN_ESCAPE
    } else if (texto[indice] === comilla) {
      return indice + 1
    } else {
      indice += 1
    }
  }
  return texto.length
}

interface TextoEnmascarado {
  /** Los comentarios en blanco; las cadenas intactas (los selectores y los títulos se leen de aquí). */
  readonly sinComentarios: string
  /** Comentarios y cadenas en blanco: solo la estructura (llaves, paréntesis, identificadores). */
  readonly estructura: string
}

/** Tras estos caracteres una "/" abre una expresión regular; tras un identificador, un número, ")" o "]" es una división. */
const ANTES_DE_UNA_EXPRESION_REGULAR = '(,=:[!&|?{};'

/** Posición siguiente al cierre de la expresión regular que empieza en `inicio`; una regex no cruza el fin de línea. */
function finDeLaExpresionRegular(texto: string, inicio: number): number {
  let indice = inicio + 1
  let dentroDeUnaClase = false
  while (indice < texto.length && texto[indice] !== SALTO_DE_LINEA) {
    const caracter = texto[indice]
    if (caracter === '\\') {
      indice += LARGO_DE_UN_ESCAPE
    } else if (caracter === '/' && !dentroDeUnaClase) {
      return indice + 1
    } else {
      dentroDeUnaClase = caracter === '[' || (dentroDeUnaClase && caracter !== ']')
      indice += 1
    }
  }
  return indice
}

function enmascarar(texto: string): TextoEnmascarado {
  let sinComentarios = ''
  let estructura = ''
  let indice = 0
  let ultimoSignificativo = ''

  while (indice < texto.length) {
    const caracter = texto[indice] as string
    const finDeComentario = finDelComentario(texto, indice)
    // Al principio del texto `ultimoSignificativo` es '', que `includes` da por incluido: ahí también abre una regex.
    const esExpresionRegular = caracter === '/' && ANTES_DE_UNA_EXPRESION_REGULAR.includes(ultimoSignificativo)
    if (finDeComentario > indice) {
      const comentario = enBlanco(texto.slice(indice, finDeComentario))
      sinComentarios += comentario
      estructura += comentario
      indice = finDeComentario
    } else if (COMILLAS.has(caracter) || esExpresionRegular) {
      const finDelTramo = esExpresionRegular ? finDeLaExpresionRegular(texto, indice) : finDeLaCadena(texto, indice)
      const tramo = texto.slice(indice, finDelTramo)
      sinComentarios += tramo
      estructura += enBlanco(tramo)
      ultimoSignificativo = caracter
      indice = finDelTramo
    } else {
      sinComentarios += caracter
      estructura += caracter
      ultimoSignificativo = caracter.trim() === '' ? ultimoSignificativo : caracter
      indice += 1
    }
  }

  return { sinComentarios, estructura }
}

// ---------------------------------------------------------------------------
// 2. LOCALIZAR bloques `test(` y funciones locales
// ---------------------------------------------------------------------------

/** Posición del cierre que equilibra la apertura de `abre` en `inicio`, o el final del texto si no cierra. */
function posicionDelCierre(estructura: string, inicio: number, abre: string, cierra: string): number {
  let profundidad = 0
  for (let indice = inicio; indice < estructura.length; indice += 1) {
    if (estructura[indice] === abre) {
      profundidad += 1
    } else if (estructura[indice] === cierra) {
      profundidad -= 1
    }
    if (profundidad === 0) {
      return indice
    }
  }
  return estructura.length - 1
}

interface BloqueDeTest {
  readonly titulo: string
  /** El texto del bloque, SIN comentarios y con el título en blanco: solo lo que el test hace. */
  readonly texto: string
  readonly inicio: number
  readonly fin: number
}

const PATRON_LLAMADA_A_TEST = /(?<![\w.$])test\s*\(/g

function tituloYTextoDelBloque(sinComentarios: string, inicio: number, fin: number): { titulo: string; texto: string } {
  const llamada = sinComentarios.slice(inicio, fin)
  const argumentos = llamada.slice(llamada.indexOf('(') + 1)
  const aperturaDelTitulo = llamada.length - argumentos.trimStart().length
  if (!COMILLAS.has(llamada[aperturaDelTitulo] as string)) {
    return { titulo: '', texto: llamada }
  }
  const finDelTitulo = finDeLaCadena(llamada, aperturaDelTitulo)
  const tituloConComillas = llamada.slice(aperturaDelTitulo, finDelTitulo)
  return {
    titulo: tituloConComillas.slice(1, -1),
    texto: llamada.slice(0, aperturaDelTitulo) + enBlanco(tituloConComillas) + llamada.slice(finDelTitulo),
  }
}

function bloquesDeTest({ sinComentarios, estructura }: TextoEnmascarado): readonly BloqueDeTest[] {
  return [...estructura.matchAll(PATRON_LLAMADA_A_TEST)].map((coincidencia) => {
    const inicio = coincidencia.index
    const aperturaDeLaLlamada = inicio + coincidencia[0].length - 1
    const fin = posicionDelCierre(estructura, aperturaDeLaLlamada, '(', ')') + 1
    const { titulo, texto } = tituloYTextoDelBloque(sinComentarios, inicio, fin)
    return { titulo, texto, inicio, fin }
  })
}

const PATRON_FUNCION_DECLARADA = /\bfunction\s+([\w$]+)\s*\(/g
const PATRON_FUNCION_FLECHA = /(?<![\w.$])(?:const|let)\s+([\w$]+)\s*(?::[^=]+)?=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*(?::[^=]+)?=>/g

/** Posición de la `{` que abre el cuerpo, a partir de `desde`, sin contar las de un tipo `Promise<{ … }>`. */
function aperturaDelCuerpo(estructura: string, desde: number): number | undefined {
  let anguloAbierto = 0
  for (let indice = desde; indice < estructura.length; indice += 1) {
    if (estructura[indice] === '<') {
      anguloAbierto += 1
    } else if (estructura[indice] === '>') {
      anguloAbierto -= 1
    } else if (estructura[indice] === '{' && anguloAbierto === 0) {
      return indice
    }
  }
  return undefined
}

function cuerpoDe(sinComentarios: string, estructura: string, apertura: number | undefined): string {
  if (apertura === undefined) {
    return ''
  }
  return sinComentarios.slice(apertura, posicionDelCierre(estructura, apertura, '{', '}') + 1)
}

/** Las funciones declaradas FUERA de todo bloque `test(`: nombre → texto de su cuerpo. */
function funcionesLocales(texto: TextoEnmascarado, bloques: readonly BloqueDeTest[]): ReadonlyMap<string, string> {
  const { sinComentarios, estructura } = texto
  const funciones = new Map<string, string>()
  const estaDentroDeUnTest = (posicion: number): boolean => bloques.some((bloque) => posicion >= bloque.inicio && posicion < bloque.fin)

  for (const coincidencia of estructura.matchAll(PATRON_FUNCION_DECLARADA)) {
    if (!estaDentroDeUnTest(coincidencia.index)) {
      const cierreDeParametros = posicionDelCierre(estructura, coincidencia.index + coincidencia[0].length - 1, '(', ')')
      funciones.set(coincidencia[1] as string, cuerpoDe(sinComentarios, estructura, aperturaDelCuerpo(estructura, cierreDeParametros)))
    }
  }
  // Una flecha declarada dentro de un test se llama siempre DESPUÉS de declararse: registrarla no cambia ningún veredicto.
  for (const coincidencia of estructura.matchAll(PATRON_FUNCION_FLECHA)) {
    const finDeLaFlecha = coincidencia.index + coincidencia[0].length
    const siguiente = estructura.slice(finDeLaFlecha).trimStart()[0]
    const apertura = siguiente === '{' ? estructura.indexOf('{', finDeLaFlecha) : undefined
    funciones.set(coincidencia[1] as string, cuerpoDe(sinComentarios, estructura, apertura))
  }
  return funciones
}

// ---------------------------------------------------------------------------
// 3. EVENTOS de un texto: qué hace, y en qué orden
// ---------------------------------------------------------------------------

type TipoDeEvento = 'espera' | 'navega' | 'emula-reduce' | 'congela' | 'coloca' | 'mide-geometria' | 'mide-pagina'

interface Evento {
  readonly tipo: TipoDeEvento
  readonly posicion: number
}

/** El nombre que fija el contrato. */
const PATRON_ESPERA = /(?<![\w.$])esperarEntradaTerminada\s*\(/g
const PATRON_NAVEGA = /\.goto\s*\(/g
const PATRON_EMULA_REDUCE = /\.emulateMedia\s*\(\s*\{[^}]*reducedMotion\s*:\s*['"`]reduce['"`]/g
/** Congelar el reloj de animaciones ANTES de navegar: por el protocolo de depuración, o por el ayudante que lo envuelve. */
const PATRON_CONGELA = /Animation\.setPlaybackRate|congelarRelojDeAnimaciones/g
const PATRON_COLOCA = /\bcurrentTime\s*=(?!=)|\.cancel\s*\(/g
const PATRON_GEOMETRIA =
  /\b(?:getBoundingClientRect|boundingBox|scrollHeight|clientHeight|offsetWidth|offsetHeight)\b|(?<!document\.documentElement)\.scrollWidth\b|\.screenshot\s*\(|toHaveScreenshot\s*\(/g
const PATRON_LECTURA_DE_ESTILO = /\bgetComputedStyle\s*\(/g
const PATRON_ESTILO_QUE_SE_LEE = /\b(?:opacity|transform|translate|color|position|top|left|right|bottom)\b/
const PATRON_AXE = /\bAxeBuilder\s*\(/g
const PATRON_CAPTURA_DE_LA_PAGINA = /\bpage\.screenshot\s*\(|expect\s*\(\s*page\s*\)\s*\.toHaveScreenshot/g

/** Un localizador del hero o de la página entera. */
const PATRON_DEL_HERO = /\[data-hero-|\bh1\b|\blevel\s*:\s*1\b|Reservar cita|body \*/

function posicionesDe(patron: RegExp, texto: string): readonly number[] {
  return [...texto.matchAll(patron)].map((coincidencia) => coincidencia.index)
}

function eventosDeTipo(tipo: TipoDeEvento, patron: RegExp, texto: string): readonly Evento[] {
  return posicionesDe(patron, texto).map((posicion) => ({ tipo, posicion }))
}

function eventosDelTexto(texto: string, textoCompleto: string): readonly Evento[] {
  const leeEstilo = PATRON_ESTILO_QUE_SE_LEE.test(textoCompleto)
  const hayInclude = textoCompleto.includes('.include(')

  return [
    ...eventosDeTipo('espera', PATRON_ESPERA, texto),
    ...eventosDeTipo('navega', PATRON_NAVEGA, texto),
    ...eventosDeTipo('emula-reduce', PATRON_EMULA_REDUCE, texto),
    ...eventosDeTipo('congela', PATRON_CONGELA, texto),
    ...eventosDeTipo('coloca', PATRON_COLOCA, texto),
    ...eventosDeTipo('mide-geometria', PATRON_GEOMETRIA, texto),
    ...(leeEstilo ? eventosDeTipo('mide-geometria', PATRON_LECTURA_DE_ESTILO, texto) : []),
    ...(hayInclude ? [] : eventosDeTipo('mide-pagina', PATRON_AXE, texto)),
    ...eventosDeTipo('mide-pagina', PATRON_CAPTURA_DE_LA_PAGINA, texto),
  ]
}

function posicionesDeLasLlamadasA(nombre: string, texto: string): readonly number[] {
  const nombreEscapado = nombre.replaceAll('$', '\\$')
  return posicionesDe(new RegExp(`(?<![\\w.$])${nombreEscapado}\\s*\\(`, 'g'), texto)
}

/**
 * Los eventos del bloque más los de cada función local que llama, UN nivel: los
 * de la función se sitúan en la posición de la llamada, con su orden interno
 * conservado en la parte fraccionaria (siempre menor que 1).
 */
function eventosDelBloque(bloque: string, funciones: ReadonlyMap<string, string>): { eventos: readonly Evento[]; textoCompleto: string } {
  const llamadas = [...funciones].flatMap(([nombre, cuerpo]) =>
    posicionesDeLasLlamadasA(nombre, bloque).map((posicion) => ({ posicion, cuerpo })),
  )
  const textoCompleto = [bloque, ...llamadas.map((llamada) => llamada.cuerpo)].join(SALTO_DE_LINEA)
  const eventosDeLasFunciones = llamadas.flatMap(({ posicion, cuerpo }) =>
    eventosDelTexto(cuerpo, textoCompleto).map((evento) => ({
      tipo: evento.tipo,
      posicion: posicion + evento.posicion / (cuerpo.length + 1),
    })),
  )
  return { eventos: [...eventosDelTexto(bloque, textoCompleto), ...eventosDeLasFunciones], textoCompleto }
}

// ---------------------------------------------------------------------------
// 4. VEREDICTO
// ---------------------------------------------------------------------------

function primeraPosicion(eventos: readonly Evento[], ...tipos: readonly TipoDeEvento[]): number {
  return Math.min(...eventos.filter((evento) => tipos.includes(evento.tipo)).map((evento) => evento.posicion))
}

function veredictoDelBloque(bloque: string, funciones: ReadonlyMap<string, string>): Veredicto {
  const { eventos, textoCompleto } = eventosDelBloque(bloque, funciones)
  const mideElHero = PATRON_DEL_HERO.test(textoCompleto)
  const primeraMedicion = Math.min(
    primeraPosicion(eventos, 'mide-pagina'),
    mideElHero ? primeraPosicion(eventos, 'mide-geometria') : Infinity,
  )
  if (primeraMedicion === Infinity) {
    return 'exento'
  }

  const primeraNavegacion = Math.min(primeraPosicion(eventos, 'navega'), primeraMedicion)
  if (primeraPosicion(eventos, 'espera') < primeraMedicion) {
    return 'pasa'
  }
  if (primeraPosicion(eventos, 'emula-reduce') < primeraNavegacion) {
    return 'pasa'
  }
  if (primeraPosicion(eventos, 'congela') < primeraNavegacion && primeraPosicion(eventos, 'coloca') < primeraMedicion) {
    return 'exento'
  }
  return 'incumple'
}

/** Lee el texto de un spec de navegador y decide, bloque `test(` por bloque, si cumple la regla de @s10. */
export function comprobarMedicionEstable(textoDelSpec: string): InformeDeMedicionEstable {
  const texto = enmascarar(textoDelSpec)
  const bloques = bloquesDeTest(texto)
  const funciones = funcionesLocales(texto, bloques)
  const veredictos = bloques.map((bloque) => ({ titulo: bloque.titulo, veredicto: veredictoDelBloque(bloque.texto, funciones) }))
  const incumplimientos = veredictos.filter((bloque) => bloque.veredicto === 'incumple').map((bloque) => bloque.titulo)

  return {
    pasa: bloques.length > NINGUN_BLOQUE && incumplimientos.length === NINGUN_BLOQUE,
    bloquesInspeccionados: bloques.length,
    bloques: veredictos,
    incumplimientos,
  }
}
