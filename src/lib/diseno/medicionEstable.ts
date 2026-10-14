/**
 * Comprobación estática de `hero_reducido_con_animacion.feature` @s10: todo
 * `test(` de un spec de navegador que MIDE la portada recién cargada lo hace con
 * la entrada del hero ya terminada o con movimiento reducido emulado. Es un
 * MÓDULO PURO (mordible por StrykerJS) que lee el TEXTO de un spec y decide,
 * bloque por bloque —nunca por fichero: un grep del fichero entero es vacuo—,
 * si cada bloque cumple.
 *
 * Un bloque que mide hace UNA de dos cosas antes de su PRIMERA medición, y las dos
 * se atan a la PÁGINA que se mide (la variable que hace el `goto`, la emulación, la
 * espera y la medición: `page`, `paginaSinFuente`…):
 *   (a) espera con `await esperarEntradaTerminada(pagina)`, directamente o por una
 *       función local del mismo fichero (resolución de UN nivel), y ninguna
 *       navegación de esa página (`goto`, `reload`, `goBack`, `goForward`) entre la
 *       espera y la medición. La espera tiene que ejecutarse y su fallo llegar al
 *       test: sin `await` (o con `void`), con `.catch(`/`.then(` o dentro de un
 *       `try` no cuenta;
 *   (b) emula `reduce` con `await pagina.emulateMedia(...)` ANTES del primer `goto`
 *       de esa página, y la última emulación de `reducedMotion` antes de medir sigue
 *       siendo `reduce` (una re-emulación a `no-preference` la deshace).
 * Queda EXENTO el bloque que congela el reloj de animaciones antes de navegar Y
 * coloca (`currentTime`) o cancela las animaciones antes de medir (no puede
 * esperar a que acabe una animación que nunca acaba), y el que no mide nada que
 * una entrada animada pueda falsear.
 *
 * QUÉ CUENTA COMO «MEDIR»: la lista cerrada del contrato. La obligación se acota
 * a lo que mide el hero o la página entera: un localizador del hero
 * (`[data-hero-`, `h1`, un encabezado de nivel 1, «Reservar cita») o `body *`,
 * y `AxeBuilder` sin `.include(` EN SU PROPIA LLAMADA o una captura de la página.
 *
 * QUÉ SE LEE DE CADA SITIO: la estructura (la espera, la navegación, la emulación,
 * colocar, congelar) se busca en el texto SIN cadenas, plantillas ni comentarios,
 * así que citarla en un mensaje de `expect` no la satisface; los literales que SÍ
 * importan (`'reduce'`, `'Animation.setPlaybackRate'`) se leen del texto original
 * solo desde la posición de una llamada real. Las MEDICIONES y los selectores del
 * hero se buscan con las cadenas intactas, porque el selector vive en una cadena.
 *
 * SIN BUCLES QUE PUEDAN NO TERMINAR. Ningún recorrido avanza un índice a mano: el
 * texto se lee con expresiones regulares globales (`matchAll`, `replace`) y con
 * `for…of` sobre iterables finitos. Así ningún defecto del código —ni el que
 * introduce la prueba de mutación— puede dejar la comprobación colgada.
 *
 * LÍMITES CONOCIDOS, a propósito: la lectura es textual, no un análisis de
 * TypeScript. Una "/" abre una expresión regular solo tras `( , = : [ ! & | ? { } ;`
 * o al principio del texto (la heurística clásica: una regex tras `)` o tras una
 * palabra como `return` se leería como división, y un comentario entre el operador
 * y la regex no se salta); una función local que llama a otra que mide no se
 * expande (un solo nivel, como pide el contrato); la precedencia es TEXTUAL, como
 * pide el contrato (una función declarada dentro del test cuenta donde se escribe,
 * no donde se llama); la página de una medición es la variable de página mencionada
 * más cerca antes de ella (un localizador guardado antes de nombrar otra página se
 * ata a esta última); una espera dentro de `Promise.all([…])` no cuenta (no lleva
 * `await` delante); una espera o una navegación en un `test.beforeEach` no la ve el
 * `test(` que mide; un selector guardado en una constante de módulo
 * (`const TITULAR = 'h1'`) no sitúa la medición en el hero; los tipos genéricos con
 * coma dentro de los parámetros de una función ("Map<a, b>") desplazan la
 * correspondencia parámetro-argumento; y las funciones locales con el mismo nombre en
 * dos ámbitos distintos del fichero (dos `describe`) no se distinguen por ámbito sino
 * por cercanía: el bloque ve la declarada más cerca ANTES de él o, si todas van
 * detrás, la primera.
 */

export type Veredicto = 'pasa' | 'incumple' | 'exento'

const PASA = 'pasa' satisfies Veredicto
const INCUMPLE = 'incumple' satisfies Veredicto
const EXENTO = 'exento' satisfies Veredicto

export interface VeredictoDeBloque {
  readonly titulo: string
  readonly veredicto: Veredicto
}

export interface InformeDeMedicionEstable {
  readonly pasa: boolean
  /** Todos los bloques `test(` leídos, también los exentos: anti-vacuidad. */
  readonly bloquesInspeccionados: number
  readonly bloques: readonly VeredictoDeBloque[]
  /** Los títulos de los bloques que incumplen. */
  readonly incumplimientos: readonly string[]
  /** Los títulos de los bloques declarados con `test.only(`: un `only` olvidado deja pasar toda la batería ejecutando uno solo. */
  readonly bloquesConOnly: readonly string[]
}

const NINGUN_BLOQUE = 0
const NO_ENCONTRADO = -1
const ESPACIO = ' '
/** El nombre que Playwright da a la página del test; es la página de una medición que no menciona ninguna otra. */
const PAGINA_DEL_TEST = 'page'

interface Rango {
  readonly inicio: number
  readonly fin: number
}

function rangoContiene(rango: Rango, posicion: number): boolean {
  return rango.inicio <= posicion && posicion < rango.fin
}

/** Una coincidencia con dónde empieza y dónde acaba; `grupos[0]` es el texto entero y los demás, los grupos de captura. */
interface Coincidencia extends Rango {
  readonly grupos: readonly (string | undefined)[]
}

function coincidencias(patron: RegExp, texto: string): readonly Coincidencia[] {
  return [...texto.matchAll(patron)].map((coincidencia) => ({
    inicio: coincidencia.index,
    fin: coincidencia.index + coincidencia[0].length,
    grupos: [...coincidencia],
  }))
}

function escaparIdentificador(nombre: string): string {
  return nombre.replaceAll('$', '\\$')
}

// ---------------------------------------------------------------------------
// 1. ENMASCARAR comentarios y cadenas (la posición de cada carácter se conserva)
// ---------------------------------------------------------------------------

function enBlanco(tramo: string): string {
  return ESPACIO.repeat(tramo.length)
}

/**
 * Lo que NO es código, en este orden de prioridad: un comentario de línea, un
 * comentario de bloque (sin cerrar llega al final), una cadena o plantilla (sin
 * cerrar llega al final) y una expresión regular. Se lee con UNA expresión regular
 * y `replace`, no con un recorrido por índices.
 *
 * Una "/" abre una expresión regular solo si lo anterior (saltando los espacios) es
 * el principio del texto o uno de `( , = : [ ! & | ? { } ;`: tras un identificador,
 * un número, `)` o `]` es una división.
 */
const TRAMOS_QUE_NO_SON_CODIGO =
  /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|(?<comilla>['"`])(?:\\[\s\S]|(?!\k<comilla>)[^\\])*(?:\k<comilla>|$)|\/(?<=(?:^|[(,=:[!&|?{};])\s*\/)(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n[])+\//g

const ABRE_UN_COMENTARIO = /^\/[/*]/

interface TextoEnmascarado {
  /** Los comentarios en blanco; las cadenas y las expresiones regulares intactas (los selectores y los títulos se leen de aquí). */
  readonly sinComentarios: string
  /** Comentarios y cadenas en blanco: solo la estructura (llaves, paréntesis, identificadores). */
  readonly estructura: string
}

function enmascarar(texto: string): TextoEnmascarado {
  return {
    sinComentarios: texto.replace(TRAMOS_QUE_NO_SON_CODIGO, (tramo) => (ABRE_UN_COMENTARIO.test(tramo) ? enBlanco(tramo) : tramo)),
    estructura: texto.replace(TRAMOS_QUE_NO_SON_CODIGO, enBlanco),
  }
}

// ---------------------------------------------------------------------------
// 2. EMPAREJAR paréntesis, corchetes y llaves; el fin de una expresión
// ---------------------------------------------------------------------------

const APERTURAS = new Set(['(', '[', '{'])
const CIERRES = new Set([')', ']', '}'])

interface Emparejado {
  /** La posición de una apertura → la posición SIGUIENTE a su cierre. */
  readonly finDe: ReadonlyMap<number, number>
  /** La posición de un cierre → la de su apertura (o `NO_ENCONTRADO` si no la tiene). */
  readonly aperturaDe: ReadonlyMap<number, number>
}

function emparejar(estructura: string): Emparejado {
  const abiertas: number[] = []
  const finDe = new Map<number, number>()
  const aperturaDe = new Map<number, number>()
  for (const [indice, caracter] of estructura.split('').entries()) {
    if (APERTURAS.has(caracter)) {
      abiertas.push(indice)
    } else if (CIERRES.has(caracter)) {
      // Un cierre sin apertura se empareja con «ninguna»: cierra toda expresión que lo encuentra.
      const apertura = abiertas.pop() ?? NO_ENCONTRADO
      finDe.set(apertura, indice + 1)
      aperturaDe.set(indice, apertura)
    }
  }
  return { finDe, aperturaDe }
}

/** El texto, su estructura (sin comentarios ni cadenas) y los pares de paréntesis, corchetes y llaves de esta. */
interface Lectura {
  /** Sin comentarios y sin los títulos de los tests; con las cadenas y las expresiones regulares intactas. */
  readonly texto: string
  readonly estructura: string
  readonly emparejado: Emparejado
}

/** La posición SIGUIENTE al cierre del paréntesis que se abre en `apertura`; sin cierre, el final del texto. */
function finDelPar({ estructura, emparejado }: Lectura, apertura: number): number {
  return emparejado.finDe.get(apertura) ?? estructura.length
}

/** Un fin de línea seguido de esto no acaba la expresión: la cadena de llamadas o el operador siguen abajo. */
const LA_EXPRESION_SIGUE_EN_LA_LINEA_DE_ABAJO = /^[.?:&|+\-*%]/
/** Una línea que acaba en esto no acaba la expresión: lo que falta está en la línea de abajo. */
const LA_EXPRESION_SIGUE_TRAS_EL_FINAL_DE_LA_LINEA = /[=+\-*/%&|?:,.]$|=>$/
const POSIBLES_FINES_DE_EXPRESION = /[;\n)\]}]/g

/** Un salto de línea acaba la expresión si ni lo de antes ni lo de después la continúan. */
function acabaLaSentencia(estructura: string, desde: number, salto: number): boolean {
  const antes = estructura.slice(desde, salto).trimEnd()
  const despues = estructura.slice(salto + 1).trimStart()
  return !LA_EXPRESION_SIGUE_TRAS_EL_FINAL_DE_LA_LINEA.test(antes) && !LA_EXPRESION_SIGUE_EN_LA_LINEA_DE_ABAJO.test(despues)
}

/**
 * Posición donde acaba la expresión que empieza en `desde`: el primer `;` o salto de
 * línea de NIVEL SUPERIOR (fuera de todo paréntesis, corchete o llave abiertos dentro
 * de la expresión) que no continúe en la línea de abajo, o el cierre de algo abierto
 * ANTES de la expresión (el `)` de la llamada en la que va), o el final del texto.
 */
function finDeLaExpresion({ estructura, emparejado }: Lectura, desde: number): number {
  const esFinDeLaExpresion = (posicion: number): boolean => {
    if (CIERRES.has(estructura[posicion] as string)) {
      return (emparejado.aperturaDe.get(posicion) as number) < desde
    }
    const dentroDeUnPar = [...emparejado.finDe].some(([apertura, fin]) => desde <= apertura && rangoContiene({ inicio: apertura, fin }, posicion))
    return !dentroDeUnPar && (estructura[posicion] === ';' || acabaLaSentencia(estructura, desde, posicion))
  }
  return (
    coincidencias(POSIBLES_FINES_DE_EXPRESION, estructura.slice(desde))
      .map((candidato) => desde + candidato.inicio)
      .find(esFinDeLaExpresion) ?? estructura.length
  )
}

/** Parte `a, { b, c }, d` por las comas de nivel superior (las de fuera de todo paréntesis, corchete y llave). */
function partirEnNivelSuperior(texto: string): readonly string[] {
  const piezas = ['']
  let profundidad = 0
  for (const caracter of texto) {
    if (caracter === ',' && profundidad <= 0) {
      piezas.push('')
    } else {
      profundidad += APERTURAS.has(caracter) ? 1 : CIERRES.has(caracter) ? -1 : 0
      piezas[piezas.length - 1] += caracter
    }
  }
  return piezas
}

/** Los argumentos de la llamada cuyo paréntesis de apertura está en `apertura`. */
function argumentosDe(lectura: Lectura, apertura: number): readonly string[] {
  return partirEnNivelSuperior(lectura.estructura.slice(apertura, finDelPar(lectura, apertura)).slice(1, -1))
}

/** El identificador con el que empieza una pieza («page» en `page.locator('h1')`), si lo hay. */
function raizDe(pieza: string | undefined): string | undefined {
  return /^\s*([\w$]+)/.exec(pieza ?? '')?.[1]
}

// ---------------------------------------------------------------------------
// 3. LOCALIZAR los bloques `test(`
// ---------------------------------------------------------------------------

interface BloqueDeTest extends Rango {
  readonly titulo: string
  readonly soloEste: boolean
  /** Dónde está el título dentro del texto, para vaciarlo: lo que dice el titular no cuenta. */
  readonly tituloEn: Rango | undefined
}

const NOMBRE_DEL_TEST = 'test'
/** `const t = test` o `const t = test.extend(…)`: `t(` es entonces un test. */
const PATRON_ALIAS_DE_TEST = /\b(?:const|let|var)\s+([\w$]+)\s*(?::[^=\n]+)?=\s*test(?:\s*\.\s*extend\b|[ \t]*(?=[;\r\n]|$))/g
const MODIFICADORES_QUE_PUEDEN_SER_CONDICIONALES = new Set(['fail', 'fixme', 'skip'])
const MODIFICADOR_DE_UN_SOLO_TEST = 'only'
const PATRON_FUNCION_DE_CUERPO = /=>|\bfunction\b/
/** El primer argumento de una llamada cuando es una cadena: su título. */
const PATRON_ARGUMENTO_CADENA = /\(\s*((?<comilla>['"`])((?:\\[\s\S]|(?!\k<comilla>)[^\\])*)\k<comilla>)/g

function patronDeLlamadaATest(estructura: string): RegExp {
  const alias = coincidencias(PATRON_ALIAS_DE_TEST, estructura).map((declaracion) => declaracion.grupos[1] as string)
  const nombres = [NOMBRE_DEL_TEST, ...alias].map(escaparIdentificador).join('|')
  return new RegExp(`(?<![\\w.$])(?:${nombres})(?:\\s*\\.\\s*(only|fail|fixme|skip))?\\s*(?=\\()`, 'g')
}

/** `test.skip(condicion, 'razón')` dentro de un test es una sentencia, no un bloque: no lleva función de cuerpo. */
function esUnaCondicion(modificador: string | undefined, argumentos: string): boolean {
  return MODIFICADORES_QUE_PUEDEN_SER_CONDICIONALES.has(modificador as string) && !PATRON_FUNCION_DE_CUERPO.test(argumentos)
}

function bloquesDeTest(lectura: Lectura): readonly BloqueDeTest[] {
  const { texto, estructura } = lectura
  const titulos = new Map(coincidencias(PATRON_ARGUMENTO_CADENA, texto).map((titulo) => [titulo.inicio, titulo] as const))
  return coincidencias(patronDeLlamadaATest(estructura), estructura)
    .map((llamada) => ({ llamada, fin: finDelPar(lectura, llamada.fin), titulo: titulos.get(llamada.fin) }))
    .filter(({ llamada, fin }) => !esUnaCondicion(llamada.grupos[1], estructura.slice(llamada.fin, fin)))
    .map(({ llamada, fin, titulo }) => ({
      titulo: titulo?.grupos[3] ?? '',
      inicio: llamada.inicio,
      fin,
      soloEste: llamada.grupos[1] === MODIFICADOR_DE_UN_SOLO_TEST,
      tituloEn: titulo === undefined ? undefined : { inicio: titulo.fin - (titulo.grupos[1] as string).length, fin: titulo.fin },
    }))
}

/** El texto con cada título vaciado: lo que dice el titular no cuenta como espera, ni como medición, ni como selector. */
function sinLosTitulos(sinComentarios: string, bloques: readonly BloqueDeTest[]): string {
  return bloques.reduce((texto, { tituloEn }) => {
    if (tituloEn === undefined) {
      return texto
    }
    return texto.slice(0, tituloEn.inicio) + enBlanco(texto.slice(tituloEn.inicio, tituloEn.fin)) + texto.slice(tituloEn.fin)
  }, sinComentarios)
}

// ---------------------------------------------------------------------------
// 4. FUNCIONES LOCALES (declaradas con `function` o con `const f = (…) =>`)
// ---------------------------------------------------------------------------

interface FuncionLocal {
  readonly nombre: string
  /** El nombre de cada parámetro, en orden; `undefined` si no es un identificador (un parámetro desestructurado). */
  readonly parametros: readonly (string | undefined)[]
  readonly declaracion: Rango
  readonly cuerpo: Rango
  /** El bloque `test(` en el que está declarada: una función así cuenta donde se escribe, no donde se llama. */
  readonly dentroDe: BloqueDeTest | undefined
}

const PATRON_FUNCION_DECLARADA = /\bfunction\s+([\w$]+)\s*(?=\()/g
const PATRON_FUNCION_FLECHA =
  /(?<![\w$.])(?:const|let)\s+([\w$]+)\s*(?::[^=]+)?=\s*(?:async\s*)?(\((?:[^()]|\([^()]*\))*\)|[\w$]+)\s*(?::[^=]+)?=>/g

function nombreDelParametro(pieza: string): string | undefined {
  return /^\s*(?:\.\.\.)?([\w$]+)/.exec(pieza)?.[1]
}

/** Los nombres de los parámetros de `(a, b: T, { c })` o de `a`. */
function parametrosDe(textoDeLosParametros: string): readonly (string | undefined)[] {
  const sinParentesis = textoDeLosParametros.startsWith('(') ? textoDeLosParametros.slice(1, -1) : textoDeLosParametros
  return partirEnNivelSuperior(sinParentesis).map(nombreDelParametro)
}

/** Los `<` y los `>` de un tipo cuadran; el `>` de un `=>` no es un ángulo. */
function tieneLosAngulosEquilibrados(tipo: string): boolean {
  const cuenta = (simbolo: RegExp): number => (tipo.match(simbolo) ?? []).length
  return cuenta(/</g) === cuenta(/(?<!=)>/g)
}

/**
 * La `{` que abre el cuerpo de una función, a partir de `desde`: la primera cuyos
 * ángulos anteriores (los de un tipo `Promise<{ … }>` o `() => Promise<T>`) están
 * equilibrados. Sin cuerpo (una firma sin más), el final del texto.
 */
function aperturaDelCuerpo(estructura: string, desde: number): number {
  return (
    coincidencias(/\{/g, estructura.slice(desde))
      .map((llave) => desde + llave.inicio)
      .find((apertura) => tieneLosAngulosEquilibrados(estructura.slice(desde, apertura))) ?? estructura.length
  )
}

/** El cuerpo de una flecha: lo que empieza tras `=>` y sigue hasta donde acaba la expresión (un bloque `{ … }` incluido). */
function rangoDelCuerpoDeUnaFlecha(lectura: Lectura, tras: number): Rango {
  const inicio = tras + (/\S/.exec(lectura.estructura.slice(tras))?.index ?? 0)
  return { inicio, fin: finDeLaExpresion(lectura, inicio) }
}

function funcionesDeclaradas(lectura: Lectura, bloques: readonly BloqueDeTest[]): readonly FuncionLocal[] {
  const { estructura } = lectura
  const dentroDe = (posicion: number): BloqueDeTest | undefined => bloques.find((bloque) => rangoContiene(bloque, posicion))
  const declarada = (inicio: number, nombre: string | undefined, parametros: string, cuerpo: Rango): FuncionLocal => ({
    nombre: nombre as string,
    parametros: parametrosDe(parametros),
    declaracion: { inicio, fin: cuerpo.fin },
    cuerpo,
    dentroDe: dentroDe(inicio),
  })

  const conFunction = coincidencias(PATRON_FUNCION_DECLARADA, estructura).map((funcion) => {
    const finDeLosParametros = finDelPar(lectura, funcion.fin)
    const apertura = aperturaDelCuerpo(estructura, finDeLosParametros)
    const cuerpo = { inicio: apertura, fin: finDelPar(lectura, apertura) }
    return declarada(funcion.inicio, funcion.grupos[1], estructura.slice(funcion.fin, finDeLosParametros), cuerpo)
  })
  const conFlecha = coincidencias(PATRON_FUNCION_FLECHA, estructura).map((flecha) =>
    declarada(flecha.inicio, flecha.grupos[1], flecha.grupos[2] as string, rangoDelCuerpoDeUnaFlecha(lectura, flecha.fin)),
  )
  return [...conFunction, ...conFlecha].toSorted((a, b) => a.declaracion.inicio - b.declaracion.inicio)
}

// ---------------------------------------------------------------------------
// 5. EVENTOS: qué hace el texto, y en qué orden
// ---------------------------------------------------------------------------

type TipoDeEvento = 'espera' | 'navega' | 'emula-reduce' | 'emula-otra' | 'congela' | 'coloca' | 'mide-geometria' | 'lee-estilo' | 'mide-pagina'

/** Lo que el texto dice en una posición, con la página sobre la que lo dice si el propio texto la nombra. */
interface EventoCrudo {
  readonly tipo: TipoDeEvento
  readonly posicion: number
  /** El receptor de la navegación, de la emulación o de la espera, o la página de una captura. Sin ella, se busca la que se nombra antes. */
  readonly pagina: string | undefined
}

/** Un `await` o un `return` delante: la promesa de la llamada llega al test y su fallo lo hace fallar. */
const PATRON_ESPERA = /(?<=\b(?:await|return)\s+)esperarEntradaTerminada\s*(?=\()/g
const PATRON_NAVEGA = /([\w$]+)\s*\.\s*(?:goto|reload|goBack|goForward)\s*(?=\()/g
const PATRON_EMULA = /(?<=\b(?:await|return)\s+)([\w$]+)\s*\.\s*emulateMedia\s*(?=\()/g
const PATRON_CLAVE_DE_MOVIMIENTO = /\breducedMotion\s*:/
const PATRON_MOVIMIENTO_REDUCIDO = /\breducedMotion\s*:\s*(['"`])reduce\1/
/** Congelar el reloj de animaciones ANTES de navegar: por el protocolo de depuración, o por el ayudante que lo envuelve. */
const PATRON_CONGELA = /(?<![\w$])congelarRelojDeAnimaciones\s*(?=\()|\.\s*send\s*\(\s*(['"`])Animation\.setPlaybackRate\1/g
const PATRON_COLOCA = /\bcurrentTime\s*=(?!=)|\.cancel\s*\(/g
const PATRON_GEOMETRIA =
  /\b(?:getBoundingClientRect|boundingBox|scrollHeight|clientHeight|offsetWidth|offsetHeight)\b|(?<!document\.documentElement)\.scrollWidth\b|\.screenshot\s*\(|toHaveScreenshot\s*\(/g
const PATRON_LECTURA_DE_ESTILO = /\bgetComputedStyle\s*\(/g
const PATRON_ESTILO_QUE_SE_LEE = /\b(?:opacity|transform|translate|color|position|top|left|right|bottom)\b/
const PATRON_AXE = /\bAxeBuilder\s*(?=\()/g
const PATRON_PAGINA_DE_AXE = /\bpage\b(?:\s*:\s*([\w$]+))?/
const PATRON_INCLUDE = /\.\s*include\s*\(/
const PATRON_CAPTURA_DE_LA_PAGINA = /\bpage\.screenshot\s*\(|expect\s*\(\s*page\s*\)\s*\.toHaveScreenshot/g
const PATRON_FALLO_TRAGADO = /^\s*\.\s*(?:catch|then)\s*\(/
const PATRON_TRY = /(?<![\w$.])try\s*(?=\{)/g

/** Un localizador del hero o de la página entera. */
const PATRON_DEL_HERO = /\[data-hero-|\bh1\b|\blevel\s*:\s*1\b|Reservar cita|body \*/

function eventoCrudo(tipo: TipoDeEvento, posicion: number, pagina?: string): EventoCrudo {
  return { tipo, posicion, pagina }
}

/** Una espera cuyo fallo se traga: con `.catch(`/`.then(` detrás o dentro de un `try`. */
function esUnaEsperaTragada(lectura: Lectura, espera: Coincidencia): boolean {
  const dentroDeUnTry = coincidencias(PATRON_TRY, lectura.estructura).some((intento) =>
    rangoContiene({ inicio: intento.fin, fin: finDelPar(lectura, intento.fin) }, espera.fin),
  )
  return dentroDeUnTry || PATRON_FALLO_TRAGADO.test(lectura.estructura.slice(finDelPar(lectura, espera.fin)))
}

function eventosDeEspera(lectura: Lectura): readonly EventoCrudo[] {
  return coincidencias(PATRON_ESPERA, lectura.estructura)
    .filter((espera) => !esUnaEsperaTragada(lectura, espera))
    .map((espera) => eventoCrudo('espera', espera.inicio, raizDe(argumentosDe(lectura, espera.fin)[0])))
}

function eventosDeNavegacion({ estructura }: Lectura): readonly EventoCrudo[] {
  return coincidencias(PATRON_NAVEGA, estructura).map((navegacion) => eventoCrudo('navega', navegacion.inicio, navegacion.grupos[1]))
}

/** Una emulación solo cuenta si toca `reducedMotion`; si lo hace, vale `reduce` solo con ese literal. */
function eventosDeEmulacion(lectura: Lectura): readonly EventoCrudo[] {
  const { texto, estructura } = lectura
  return coincidencias(PATRON_EMULA, estructura)
    .map((emulacion) => ({ emulacion, opciones: { inicio: emulacion.fin, fin: finDelPar(lectura, emulacion.fin) } }))
    .filter(({ opciones }) => PATRON_CLAVE_DE_MOVIMIENTO.test(estructura.slice(opciones.inicio, opciones.fin)))
    .map(({ emulacion, opciones }) =>
      eventoCrudo(
        PATRON_MOVIMIENTO_REDUCIDO.test(texto.slice(opciones.inicio, opciones.fin)) ? 'emula-reduce' : 'emula-otra',
        emulacion.inicio,
        emulacion.grupos[1],
      ),
    )
}

/** Una coincidencia en el texto con cadenas que EMPIEZA en código: la que empieza dentro de una cadena no es una llamada. */
function empiezaEnCodigo({ estructura }: Lectura, coincidencia: Coincidencia): boolean {
  return estructura[coincidencia.inicio] !== ESPACIO
}

function eventosDeCongelarYColocar(lectura: Lectura): readonly EventoCrudo[] {
  return [
    ...coincidencias(PATRON_CONGELA, lectura.texto)
      .filter((congelar) => empiezaEnCodigo(lectura, congelar))
      .map((congelar) => eventoCrudo('congela', congelar.inicio)),
    ...coincidencias(PATRON_COLOCA, lectura.estructura).map((colocar) => eventoCrudo('coloca', colocar.inicio)),
  ]
}

/** Un `AxeBuilder` solo mide la página entera si NINGUNA llamada de su cadena acota con `.include(`; mide la página de su `{ page }`. */
function eventosDeAxe(lectura: Lectura): readonly EventoCrudo[] {
  const { estructura } = lectura
  return coincidencias(PATRON_AXE, estructura)
    .filter((axe) => !PATRON_INCLUDE.test(estructura.slice(axe.inicio, finDeLaExpresion(lectura, axe.inicio))))
    .map((axe) => {
      const pagina = PATRON_PAGINA_DE_AXE.exec(argumentosDe(lectura, axe.fin)[0] as string)
      return eventoCrudo('mide-pagina', axe.inicio, pagina === null ? undefined : (pagina[1] ?? PAGINA_DEL_TEST))
    })
}

function eventosDeMedicion(lectura: Lectura): readonly EventoCrudo[] {
  const { texto } = lectura
  const sinPagina = (tipo: TipoDeEvento) => (medicion: Coincidencia) => eventoCrudo(tipo, medicion.inicio)
  return [
    ...coincidencias(PATRON_GEOMETRIA, texto).map(sinPagina('mide-geometria')),
    ...coincidencias(PATRON_LECTURA_DE_ESTILO, texto).map(sinPagina('lee-estilo')),
    ...coincidencias(PATRON_CAPTURA_DE_LA_PAGINA, texto).map((captura) => eventoCrudo('mide-pagina', captura.inicio, PAGINA_DEL_TEST)),
    ...eventosDeAxe(lectura),
  ]
}

/** Todos los eventos del fichero. */
function eventosCrudos(lectura: Lectura): readonly EventoCrudo[] {
  return [
    ...eventosDeEspera(lectura),
    ...eventosDeNavegacion(lectura),
    ...eventosDeEmulacion(lectura),
    ...eventosDeCongelarYColocar(lectura),
    ...eventosDeMedicion(lectura),
  ]
}

// ---------------------------------------------------------------------------
// 6. USOS de las funciones locales y PÁGINA de cada evento
// ---------------------------------------------------------------------------

/** Una aparición del nombre de una función local; con paréntesis es una llamada, sin ellos una referencia (`evaluate(cajaDe)`). */
interface Uso {
  readonly funcion: FuncionLocal
  readonly posicion: number
  /** Dónde acaba el uso: el cierre de la llamada o, sin ella, el propio nombre. */
  readonly finDelUso: number
  readonly argumentos: readonly string[]
}

function usosDe(lectura: Lectura, funcion: FuncionLocal): readonly Uso[] {
  const patron = new RegExp(`(?<![\\w.$])${escaparIdentificador(funcion.nombre)}(?![\\w$])(\\s*\\()?`, 'g')
  return coincidencias(patron, lectura.estructura).map((uso) => {
    const apertura = uso.fin - 1
    const esUnaLlamada = uso.grupos[1] !== undefined
    return {
      funcion,
      posicion: uso.inicio,
      finDelUso: esUnaLlamada ? finDelPar(lectura, apertura) : uso.fin,
      argumentos: partirEnNivelSuperior(esUnaLlamada ? lectura.estructura.slice(apertura, finDelPar(lectura, apertura)).slice(1, -1) : ''),
    }
  })
}

/** Sin nombre no hay página que traducir: el resultado tampoco la tiene. */
type Traduccion = (nombre: string | undefined) => string | undefined

const SIN_TRADUCCION: Traduccion = (nombre) => nombre

/** De los parámetros de una función a la página con la que se la llama: `medirAltos(paginaSinFuente)` hace de `pagina` → `paginaSinFuente`. */
function traduccionDe(funcion: FuncionLocal, argumentos: readonly string[]): Traduccion {
  const correspondencias = funcion.parametros
    .map((parametro, indice) => [parametro, raizDe(argumentos[indice])] as const)
    .filter(([parametro]) => parametro !== undefined)
  const paginas = new Map(correspondencias)
  return (nombre) => paginas.get(nombre) ?? nombre
}

/** La página de las páginas dadas que el texto nombra más cerca ANTES de `referencia`, dentro del rango. */
function paginaMencionadaEn(estructura: string, paginas: Iterable<string>, rango: Rango, referencia: number): string | undefined {
  const alternativas = [...paginas].map(escaparIdentificador).join('|')
  const menciones = coincidencias(new RegExp(`(?<![\\w.$])(?:${alternativas})(?![\\w$])`, 'g'), estructura.slice(rango.inicio, referencia))
  return menciones.at(-1)?.grupos[0]
}

type ResolverPagina = (paginas: ReadonlySet<string>) => string

/**
 * Un trozo de texto cuyos eventos se leen juntos: el propio bloque, el cuerpo de una
 * función declarada en él o el cuerpo de una función local que el bloque llama.
 */
interface Unidad {
  readonly rango: Rango
  /** ¿Es de esta unidad el evento de esta posición? El bloque no lleva los de las funciones declaradas dentro de él. */
  readonly contiene: (posicion: number) => boolean
  /** Las páginas que se reconocen al nombrarlas; sin ellas, las de todo el bloque. */
  readonly paginas: ReadonlySet<string> | undefined
  /** De los nombres de la unidad a los de quien la usa: `pagina` → `paginaSinFuente`. */
  readonly traducir: Traduccion
  /** La página de una medición que no nombra ninguna: la de la llamada. */
  readonly paginaDeLaLlamada: ResolverPagina
  /** La posición de la llamada que sitúa los eventos de la unidad; sin ella, cada evento va donde se escribe. */
  readonly llamada: number | undefined
}

/** Un evento con su página ya decidida (`pagina`) o por decidir cuando se conozcan todas las páginas del bloque (`resolver`). */
interface EventoPendiente {
  readonly tipo: TipoDeEvento
  readonly pagina: string | undefined
  readonly resolver: ResolverPagina | undefined
  /** Dónde va en el orden del bloque: la posición del texto, o la de la llamada y, dentro de ella, la propia. */
  readonly sitio: readonly [number, number]
}

interface Evento {
  readonly tipo: TipoDeEvento
  readonly pagina: string | undefined
}

const TIPOS_DE_MEDICION: ReadonlySet<TipoDeEvento> = new Set(['mide-geometria', 'lee-estilo', 'mide-pagina'])

function esUnaMedicion(tipo: TipoDeEvento): boolean {
  return TIPOS_DE_MEDICION.has(tipo)
}

function eventosDeLaUnidad(lectura: Lectura, crudos: readonly EventoCrudo[], unidad: Unidad): readonly EventoPendiente[] {
  return crudos
    .filter((evento) => unidad.contiene(evento.posicion))
    .map((evento) => {
      const sitio = unidad.llamada === undefined ? ([evento.posicion, 0] as const) : ([unidad.llamada, evento.posicion] as const)
      if (evento.pagina !== undefined || !esUnaMedicion(evento.tipo)) {
        return { tipo: evento.tipo, pagina: unidad.traducir(evento.pagina), resolver: undefined, sitio }
      }
      const resolver: ResolverPagina = (paginasDelBloque) => {
        const mencionada = paginaMencionadaEn(lectura.estructura, unidad.paginas ?? paginasDelBloque, unidad.rango, evento.posicion)
        const traducida = unidad.traducir(mencionada) as string
        return paginasDelBloque.has(traducida) ? traducida : unidad.paginaDeLaLlamada(paginasDelBloque)
      }
      return { tipo: evento.tipo, pagina: undefined, resolver, sitio }
    })
}

function porSitio(a: EventoPendiente, b: EventoPendiente): number {
  return a.sitio[0] - b.sitio[0] || a.sitio[1] - b.sitio[1]
}

// ---------------------------------------------------------------------------
// 7. VEREDICTO
// ---------------------------------------------------------------------------

function esDelTipo(...tipos: readonly TipoDeEvento[]): (evento: Evento) => boolean {
  return (evento) => tipos.includes(evento.tipo)
}

function esReduce(emulacion: Evento | undefined): boolean {
  return emulacion?.tipo === 'emula-reduce'
}

/** Los eventos hasta el primero que cumple el predicado (todos, si ninguno lo cumple). */
function hastaElPrimero(eventos: readonly Evento[], predicado: (evento: Evento) => boolean): readonly Evento[] {
  const indice = eventos.findIndex(predicado)
  return indice === NO_ENCONTRADO ? eventos : eventos.slice(0, indice)
}

/**
 * El veredicto de UNA página medida, sobre los eventos anteriores a su primera
 * medición: la espera tiene que ser posterior a su última navegación; la emulación,
 * `reduce` tanto antes de su primera navegación como al medir; y la excepción es
 * congelar el reloj antes de navegar y colocar o cancelar las animaciones.
 */
function veredictoDeLaPagina(eventos: readonly Evento[], pagina: string | undefined): Veredicto {
  const anteriores = hastaElPrimero(eventos, (evento) => esUnaMedicion(evento.tipo) && evento.pagina === pagina)
  const suyo = (...tipos: readonly TipoDeEvento[]) => (evento: Evento) => evento.pagina === pagina && esDelTipo(...tipos)(evento)

  const ultimaNavegacion = anteriores.findLastIndex(suyo('navega'))
  if (anteriores.slice(ultimaNavegacion + 1).some(suyo('espera'))) {
    return PASA
  }

  const antesDeNavegar = hastaElPrimero(anteriores, suyo('navega'))
  const ultimaEmulacion = (hasta: readonly Evento[]) => hasta.findLast(suyo('emula-reduce', 'emula-otra'))
  if (esReduce(ultimaEmulacion(antesDeNavegar)) && esReduce(ultimaEmulacion(anteriores))) {
    return PASA
  }

  return antesDeNavegar.some(esDelTipo('congela')) && anteriores.some(esDelTipo('coloca')) ? EXENTO : INCUMPLE
}

function combinar(veredictos: readonly Veredicto[]): Veredicto {
  if (veredictos.includes(INCUMPLE)) {
    return INCUMPLE
  }
  return veredictos.every((veredicto) => veredicto === EXENTO) ? EXENTO : PASA
}

interface Contexto {
  readonly lectura: Lectura
  readonly funciones: readonly FuncionLocal[]
  readonly crudos: readonly EventoCrudo[]
  readonly usos: readonly Uso[]
}

const PATRON_DECLARACION_DE_NOMBRE = /(?<![\w$.])(?:function|const|let|var)\s+([\w$]+)/g

/** Las páginas que nombra una función: sus parámetros, la del test y los receptores de sus navegaciones, emulaciones y esperas. */
function paginasDeLaFuncion(funcion: FuncionLocal, crudos: readonly EventoCrudo[]): ReadonlySet<string> {
  const receptores = crudos
    .filter((evento) => evento.pagina !== undefined && rangoContiene(funcion.cuerpo, evento.posicion))
    .map((evento) => evento.pagina as string)
  const parametros = funcion.parametros.filter((parametro) => parametro !== undefined)
  return new Set([PAGINA_DEL_TEST, ...parametros, ...receptores])
}

/** Las unidades de un bloque (él mismo, las funciones declaradas en él y las funciones locales del fichero que llama) y los trozos de texto que alcanza. */
function unidadesDelBloque(contexto: Contexto, bloque: BloqueDeTest): { unidades: readonly Unidad[]; ambito: readonly Rango[] } {
  const { lectura, funciones, crudos, usos } = contexto
  const declaradasAqui = new Set(coincidencias(PATRON_DECLARACION_DE_NOMBRE, lectura.estructura.slice(bloque.inicio, bloque.fin)).map((c) => c.grupos[1]))
  const usosDelBloque = usos.filter((uso) => rangoContiene(bloque, uso.posicion))
  const locales = funciones.filter((funcion) => funcion.dentroDe === bloque)
  const delFichero = funciones.filter((funcion) => funcion.dentroDe === undefined)
  // De varias funciones del fichero con el mismo nombre solo cuenta la que ve el bloque; si no, cada llamada expandiría todas.
  const laQueVeElBloque = (funcion: FuncionLocal): boolean => {
    const homonimas = delFichero.filter((otra) => otra.nombre === funcion.nombre)
    return (homonimas.findLast((otra) => otra.declaracion.fin <= bloque.inicio) ?? homonimas[0]) === funcion
  }
  const llamadas = usosDelBloque.filter((uso) => !declaradasAqui.has(uso.funcion.nombre) && laQueVeElBloque(uso.funcion))
  const paginaPorOmision: ResolverPagina = () => PAGINA_DEL_TEST
  const paginaTrasLaLlamada =
    (finDelUso: number): ResolverPagina =>
    (paginas) =>
      paginaMencionadaEn(lectura.estructura, paginas, bloque, finDelUso) ?? PAGINA_DEL_TEST

  const delBloque: Unidad = {
    rango: bloque,
    contiene: (posicion) => rangoContiene(bloque, posicion) && !locales.some((local) => rangoContiene(local.cuerpo, posicion)),
    paginas: undefined,
    traducir: SIN_TRADUCCION,
    paginaDeLaLlamada: paginaPorOmision,
    llamada: undefined,
  }
  // Una función declarada en el bloque que nadie usa no se ejecuta nunca: no aporta eventos (ni su espera).
  const usadasEnElBloque = locales
    .map((funcion) => ({ funcion, primerUso: usosDelBloque.find((uso) => uso.funcion === funcion && !rangoContiene(funcion.declaracion, uso.posicion)) }))
    .filter(({ primerUso }) => primerUso !== undefined)
  const declaradasEnElBloque = usadasEnElBloque.map(
    ({ funcion, primerUso }): Unidad => ({
      rango: funcion.cuerpo,
      contiene: (posicion) => rangoContiene(funcion.cuerpo, posicion),
      paginas: paginasDeLaFuncion(funcion, crudos),
      traducir: traduccionDe(funcion, (primerUso as Uso).argumentos),
      paginaDeLaLlamada: paginaTrasLaLlamada((primerUso as Uso).finDelUso),
      llamada: undefined,
    }),
  )
  const llamadasDelFichero = llamadas.map((llamada): Unidad => ({
    rango: llamada.funcion.cuerpo,
    contiene: (posicion) => rangoContiene(llamada.funcion.cuerpo, posicion),
    paginas: paginasDeLaFuncion(llamada.funcion, crudos),
    traducir: traduccionDe(llamada.funcion, llamada.argumentos),
    paginaDeLaLlamada: paginaTrasLaLlamada(llamada.finDelUso),
    llamada: llamada.posicion,
  }))
  return {
    unidades: [delBloque, ...declaradasEnElBloque, ...llamadasDelFichero],
    ambito: [bloque, ...llamadas.map((llamada) => llamada.funcion.cuerpo)],
  }
}

/** Los eventos del bloque con sus páginas, más el texto que alcanza (el del bloque y el de cada función local que llama). */
function eventosDelBloque(contexto: Contexto, bloque: BloqueDeTest): { eventos: readonly Evento[]; ambito: readonly string[] } {
  const { lectura, crudos } = contexto
  const { unidades, ambito } = unidadesDelBloque(contexto, bloque)
  const pendientes = unidades.flatMap((unidad) => eventosDeLaUnidad(lectura, crudos, unidad)).toSorted(porSitio)
  const paginas = new Set([PAGINA_DEL_TEST, ...pendientes.filter((evento) => evento.pagina !== undefined).map((evento) => evento.pagina as string)])
  return {
    eventos: pendientes.map((evento) => ({ tipo: evento.tipo, pagina: evento.resolver === undefined ? evento.pagina : evento.resolver(paginas) })),
    ambito: ambito.map((rango) => lectura.texto.slice(rango.inicio, rango.fin)),
  }
}

function veredictoDelBloque(contexto: Contexto, bloque: BloqueDeTest): Veredicto {
  const { eventos, ambito } = eventosDelBloque(contexto, bloque)
  const mideElHero = ambito.some((texto) => PATRON_DEL_HERO.test(texto))
  const leeEstilo = ambito.some((texto) => PATRON_ESTILO_QUE_SE_LEE.test(texto))
  const cuentaComoMedicion = (evento: Evento): boolean =>
    evento.tipo === 'mide-pagina' || (mideElHero && (evento.tipo === 'mide-geometria' || leeEstilo))
  const relevantes = eventos.filter((evento) => !esUnaMedicion(evento.tipo) || cuentaComoMedicion(evento))
  const paginasMedidas = new Set(relevantes.filter((evento) => esUnaMedicion(evento.tipo)).map((evento) => evento.pagina))
  return combinar([...paginasMedidas].map((pagina) => veredictoDeLaPagina(relevantes, pagina)))
}

/** Lee el texto de un spec de navegador y decide, bloque `test(` por bloque, si cumple la regla de @s10. */
export function comprobarMedicionEstable(textoDelSpec: string): InformeDeMedicionEstable {
  const enmascarado = enmascarar(textoDelSpec)
  const provisional: Lectura = { texto: enmascarado.sinComentarios, estructura: enmascarado.estructura, emparejado: emparejar(enmascarado.estructura) }
  const bloques = bloquesDeTest(provisional)
  const lectura: Lectura = { ...provisional, texto: sinLosTitulos(provisional.texto, bloques) }
  const funciones = funcionesDeclaradas(lectura, bloques)
  const contexto: Contexto = {
    lectura,
    funciones,
    crudos: eventosCrudos(lectura),
    usos: funciones.flatMap((funcion) => usosDe(lectura, funcion)),
  }
  const veredictos = bloques.map((bloque) => ({ titulo: bloque.titulo, veredicto: veredictoDelBloque(contexto, bloque) }))
  const incumplimientos = veredictos.filter((bloque) => bloque.veredicto === INCUMPLE).map((bloque) => bloque.titulo)
  const bloquesConOnly = bloques.filter((bloque) => bloque.soloEste).map((bloque) => bloque.titulo)

  return {
    pasa: bloques.length > NINGUN_BLOQUE && incumplimientos.length === NINGUN_BLOQUE && bloquesConOnly.length === NINGUN_BLOQUE,
    bloquesInspeccionados: bloques.length,
    bloques: veredictos,
    incumplimientos,
    bloquesConOnly,
  }
}

const PATRON_DE_FICHERO_DE_TEST_DE_PLAYWRIGHT = /\.(?:spec|test)\.[cm]?[jt]sx?$/

/**
 * ¿Ejecuta Playwright este fichero? Es su `testMatch` por defecto (cualquier `.spec` o
 * `.test` con extensión js, ts, mjs, mts, cjs, cts, jsx o tsx, a cualquier profundidad),
 * que `playwright.config.ts` no cambia. El cableado a los specs reales lo usa para
 * comprobar que ningún test que se ejecuta queda sin inspeccionar.
 */
export function esFicheroDeTestDePlaywright(ruta: string): boolean {
  return PATRON_DE_FICHERO_DE_TEST_DE_PLAYWRIGHT.test(ruta)
}
