/**
 * La matriz de pares (rol, fondo, uso) que el sistema de color EFECTIVAMENTE
 * pinta, resuelta contra el texto real de `src/styles/_tokens.scss` y pasada
 * por la fórmula de contraste real del repositorio (`src/lib/contraste.ts`).
 *
 * Cubre @s6, @s7, @s8, @s9 y @s11 de `features/rediseno_visual.feature`.
 *
 * Vive en `src/lib/**` y es PURO a propósito: `stryker.config.json` deja
 * escrito que StrykerJS no muta el texto ni los atributos de JSX, así que una
 * decisión escondida en un `.tsx` no la muerde nadie. Toda derivación se
 * afirma aquí POR VALOR.
 */
import { evaluarParDeContraste, type UsoDeColor, type VeredictoDePareja } from '../contraste'
import { VARIANTE_PREDETERMINADA } from './contratoRedisenho'
import { mezclar } from './mezclaDeColor'
import type { FicheroDeTexto } from './rolesDescartados'
import { leerTokenDeVariante, type EntradaDeMatrizDeUso } from './tokensColor'

const LLAVE_ABRE = '{'
const LLAVE_CIERRA = '}'
const SIN_COINCIDENCIA = -1
const PRIMERA_CAPTURA = 1

function patronDeRolDelPrototipo(rol: string): RegExp {
  // Los dos puntos no son decorativos: `--bg:` no casa dentro de `--bg-2:`,
  // igual que `--urg:` no casa dentro de `--urg-soft:`. Es la misma defensa
  // que `tokensColor.ts:188-197` usa para `--color-borde` frente a
  // `--color-borde-control`.
  return new RegExp(`--${rol}:\\s*(#[0-9a-fA-F]{6})`)
}

function patronDeEncabezadoDeTema(tema: string): RegExp {
  if (tema === VARIANTE_PREDETERMINADA) {
    // La variante por defecto no lleva atributo `[data-tema]` en el
    // prototipo: es su bloque ":root" base
    // (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html:18`),
    // el mismo que fija `selectorDelTemaDelPrototipo` en
    // `fidelidadPrototipo.ts:106-111`. La anticipación negativa evita casar
    // dentro de ":root[data-tema='calida']", que también empieza por ":root".
    return /:root(?!\[)\s*/
  }
  return new RegExp(`:root\\[data-tema=['"]${tema}['"]\\]\\s*`)
}

/**
 * El cuerpo del bloque `:root[data-tema='<tema>']` del prototipo aprobado
 * (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`), acotado hasta
 * su llave de cierre. El prototipo no anida llaves dentro de sus bloques de
 * tema (verificado leyendo sus líneas 18-49), así que la primera llave de
 * cierre delimita el bloque.
 */
function extraerBloqueDeTemaDelPrototipo(textoHtml: string, tema: string): string {
  const encabezado = textoHtml.match(patronDeEncabezadoDeTema(tema))
  if (!encabezado || encabezado.index === undefined) {
    throw new Error(`no se encontró ningún bloque ":root[data-tema='${tema}']" en el texto del prototipo`)
  }

  const indiceDeApertura = textoHtml.indexOf(LLAVE_ABRE, encabezado.index)
  const indiceDeCierre = textoHtml.indexOf(LLAVE_CIERRA, indiceDeApertura)
  if (indiceDeApertura === SIN_COINCIDENCIA || indiceDeCierre === SIN_COINCIDENCIA) {
    throw new Error(`el bloque ":root[data-tema='${tema}']" del prototipo no se cierra: falta la llave de cierre`)
  }

  return textoHtml.slice(indiceDeApertura, indiceDeCierre)
}

/**
 * Valor real (en mayúsculas) del rol `--<rol>` que el prototipo declara para
 * `tema`. Se lee del TEXTO REAL del prototipo, nunca de un hexadecimal
 * duplicado a mano: si el prototipo cambiara un dígito, esta lectura cambia
 * con él (@s6, @s7).
 */
export function leerRolDeTemaDelPrototipo(textoHtml: string, tema: string, rol: string): string {
  const bloque = extraerBloqueDeTemaDelPrototipo(textoHtml, tema)
  const coincidencia = bloque.match(patronDeRolDelPrototipo(rol))
  if (!coincidencia) {
    throw new Error(`no se encontró el rol "--${rol}" en el tema "${tema}" del prototipo`)
  }
  return (coincidencia[PRIMERA_CAPTURA] as string).toUpperCase()
}

function patronDeRolTranslucidoDelPrototipo(rol: string): RegExp {
  return new RegExp(`--${rol}:\\s*rgba\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*[\\d.]+\\s*\\)`)
}

const CANAL_ROJO_RGBA = 1
const CANAL_VERDE_RGBA = 2
const CANAL_AZUL_RGBA = 3
const BASE_HEXADECIMAL = 16
const DOS_DIGITOS_HEX = 2
const CERO_DE_RELLENO = '0'

function canalDecimalAHexadecimal(canal: string): string {
  return Number(canal).toString(BASE_HEXADECIMAL).toUpperCase().padStart(DOS_DIGITOS_HEX, CERO_DE_RELLENO)
}

/**
 * El hexadecimal que resulta de expandir SOLO los canales `r,g,b` del
 * `rgba(...)` translúcido que el prototipo declara para `--<rol>` en `tema`,
 * IGNORANDO el alfa — no es una composición sobre el fondo (eso es
 * `--color-borde`, un rol distinto, `_tokens.scss:20-47`): es la lectura
 * literal de los tres canales de color (@s8, Enmienda 3). Se lee del TEXTO
 * REAL del prototipo, nunca de un hexadecimal duplicado a mano.
 */
export function leerRgbExpandidoDeRolDelPrototipo(textoHtml: string, tema: string, rol: string): string {
  const bloque = extraerBloqueDeTemaDelPrototipo(textoHtml, tema)
  const coincidencia = bloque.match(patronDeRolTranslucidoDelPrototipo(rol))
  if (!coincidencia) {
    throw new Error(`no se encontró el rol translúcido "--${rol}" en el tema "${tema}" del prototipo`)
  }
  const rojo = canalDecimalAHexadecimal(coincidencia[CANAL_ROJO_RGBA] as string)
  const verde = canalDecimalAHexadecimal(coincidencia[CANAL_VERDE_RGBA] as string)
  const azul = canalDecimalAHexadecimal(coincidencia[CANAL_AZUL_RGBA] as string)
  return `${ALMOHADILLA}${rojo}${verde}${azul}`
}

/**
 * "marca" no tiene tema propio en el prototipo (`fidelidadPrototipo.ts:78-81`),
 * así que su "--color-borde-control" no se importa de ningún sitio: se DERIVA
 * mezclando el primario con el fondo de la propia variante (@s8, Enmienda 3).
 * El 70 % es el mismo que fija el literal del contrato
 * (`mezclar('#FFFFFF', '#77286B', 0.7)` = `#A06997`); aquí se recalcula desde
 * el TEXTO REAL de `_tokens.scss`, nunca desde un hexadecimal duplicado a mano.
 */
const PORCENTAJE_DE_MEZCLA_DEL_BORDE_DE_CONTROL_DE_MARCA = 0.7

export function derivarBordeControlDeMarca(textoScss: string): string {
  const fondo = leerTokenDeVariante(textoScss, 'marca', 'fondo')
  const primario = leerTokenDeVariante(textoScss, 'marca', 'primario')
  return mezclar(fondo, primario, PORCENTAJE_DE_MEZCLA_DEL_BORDE_DE_CONTROL_DE_MARCA)
}

/**
 * El hexadecimal exacto que produce `derivarBordeControlDeMarca`, usado como
 * ANCLA para localizar, en el TEXTO REAL de `_tokens.scss`, el comentario que
 * debe preceder a esa declaración (@s8, Enmienda 3, cuarta cláusula: «con la
 * regla escrita por extenso en "src/styles/_tokens.scss"»). Es el mismo
 * valor que ya deriva la función de arriba, nunca un segundo literal que
 * pudiera desincronizarse.
 */
const HEXADECIMAL_DEL_BORDE_DE_CONTROL_DE_MARCA = '#A06997'

function patronDeComentarioSobreElBordeDeControlDeMarca(): RegExp {
  // Uno o más renglones "//" pegados, inmediatamente encima (sin línea en
  // blanco entre medias) de la declaración exacta del borde de control de
  // "marca". Si el comentario se separase de la declaración, o si otra
  // variante compartiera este mismo hexadecimal, la ancla dejaría de casar.
  return new RegExp(`((?:[ \\t]*//[^\\n]*\\n)+)[ \\t]*--color-borde-control:\\s*${HEXADECIMAL_DEL_BORDE_DE_CONTROL_DE_MARCA};`)
}

/**
 * El bloque de comentarios "//" escrito INMEDIATAMENTE ENCIMA de la
 * declaración `--color-borde-control: #A06997;` de la variante "marca" en
 * `_tokens.scss`, o `undefined` si esa declaración no lleva ningún
 * comentario pegado. Existe para comprobar que la cuarta cláusula de @s8
 * (Enmienda 3) no solo describe un valor cierto: el propio fichero lo
 * escribe "por extenso", el mismo patrón que ya usa para el rojo de urgencia
 * semántico (`_tokens.scss:5-18`).
 */
export function leerComentarioDelBordeDeControlDeMarca(textoScss: string): string | undefined {
  return textoScss.match(patronDeComentarioSobreElBordeDeControlDeMarca())?.[PRIMERA_CAPTURA]
}

/**
 * Decimales con los que el contrato publica un ratio ("daba 4.37", "el 2.77
 * que daría el blanco del prototipo"). El redondeo vive aquí, en producción, y
 * no dentro de un test: así lo muerde StrykerJS.
 */
const DECIMALES_DEL_RATIO_PUBLICADO = 2

/** Un par (rol, fondo) expresado con los nombres que usa el prototipo, no con los del sistema. */
export interface ParDeRolesDelPrototipo {
  readonly rolDelPrototipo: string
  readonly fondoDelPrototipo: string
  readonly uso: UsoDeColor
}

export interface VeredictoConRatioPublicado extends VeredictoDePareja {
  readonly ratioRedondeado: number
}

function conRatioPublicado(veredicto: VeredictoDePareja): VeredictoConRatioPublicado {
  return { ...veredicto, ratioRedondeado: Number(veredicto.ratio.toFixed(DECIMALES_DEL_RATIO_PUBLICADO)) }
}

/**
 * Veredicto de contraste de un par del PROTOTIPO: lee los dos hexadecimales de
 * su texto real y los pasa por `evaluarParDeContraste` (`src/lib/contraste.ts`),
 * que es quien aporta la fórmula WCAG y el umbral de cada uso (@s6, @s7).
 */
export function evaluarParDelPrototipo(
  textoHtml: string,
  tema: string,
  par: ParDeRolesDelPrototipo,
): VeredictoConRatioPublicado {
  const veredicto = evaluarParDeContraste({
    color: leerRolDeTemaDelPrototipo(textoHtml, tema, par.rolDelPrototipo),
    fondo: leerRolDeTemaDelPrototipo(textoHtml, tema, par.fondoDelPrototipo),
    uso: par.uso,
  })
  return conRatioPublicado(veredicto)
}

const PATRON_DECLARACION_DE_ROL_DEL_PROTOTIPO = /(--[a-z0-9-]+)\s*:/g

/**
 * Los nombres de rol que el prototipo DECLARA (no los que usa con `var()`), en
 * orden de primera aparición y sin duplicados. Sirve para demostrar qué roles
 * del sistema no tienen equivalente en el prototipo y son, por tanto, del
 * repositorio (@s8, @s9).
 */
export function extraerNombresDeRolDelPrototipo(textoHtml: string): readonly string[] {
  const nombres: string[] = []
  for (const coincidencia of textoHtml.matchAll(PATRON_DECLARACION_DE_ROL_DEL_PROTOTIPO)) {
    const nombre = coincidencia[PRIMERA_CAPTURA] as string
    if (!nombres.includes(nombre)) {
      nombres.push(nombre)
    }
  }
  return nombres
}

const NINGUN_ROL_INSPECCIONADO = 0

export interface InformeDeRolesAusentesDelPrototipo {
  readonly pasa: boolean
  readonly rolesInspeccionados: number
  readonly presentes: readonly string[]
  readonly motivo?: string
}

/**
 * Comprueba que NINGUNO de los roles `candidatos` esté declarado en el
 * prototipo: es la forma de demostrar que un rol del sistema nace en el
 * repositorio y no se importa (@s8, @s9). Falla cerrada con la lista vacía —
 * "0 candidatos, 0 presentes" no puede dar aprobado por vacuidad.
 */
export function comprobarRolesAusentesDelPrototipo(
  textoHtml: string,
  candidatos: readonly string[],
): InformeDeRolesAusentesDelPrototipo {
  if (candidatos.length === NINGUN_ROL_INSPECCIONADO) {
    return {
      pasa: false,
      rolesInspeccionados: NINGUN_ROL_INSPECCIONADO,
      presentes: [],
      motivo: 'no se inspeccionó ningún rol: la lista de roles candidatos está vacía',
    }
  }

  const declarados = extraerNombresDeRolDelPrototipo(textoHtml)
  const presentes = candidatos.filter((candidato) => declarados.includes(candidato))
  return { pasa: presentes.length === NINGUN_ROL_INSPECCIONADO, rolesInspeccionados: candidatos.length, presentes }
}

const PATRON_PSEUDOCLASE_DE_FOCO = /:focus/g
const PATRON_SUPRESION_DE_CONTORNO = /outline:\s*none/g

/** Cuántas reglas de foco declara el prototipo. Medido, no supuesto (@s9). */
export function contarReglasDeFocoDelPrototipo(textoHtml: string): number {
  return [...textoHtml.matchAll(PATRON_PSEUDOCLASE_DE_FOCO)].length
}

/** Cuántos controles del prototipo suprimen el contorno del navegador (@s9). */
export function contarSupresionesDeContornoDelPrototipo(textoHtml: string): number {
  return [...textoHtml.matchAll(PATRON_SUPRESION_DE_CONTORNO)].length
}

const ALMOHADILLA = '#'
const PATRON_DIGITO_HEXADECIMAL = /[0-9a-fA-F]/g

/**
 * `#fff` → `#FFFFFF`. La fórmula de `src/lib/contraste.ts` solo admite seis
 * dígitos (`PATRON_HEXADECIMAL_VALIDO`, `contraste.ts:26`), y el prototipo
 * escribe sus blancos abreviados: sin esta expansión no se le puede medir.
 */
function expandirHexadecimalAbreviado(hexadecimal: string): string {
  const digitos = hexadecimal.slice(ALMOHADILLA.length)
  return `${ALMOHADILLA}${digitos.replace(PATRON_DIGITO_HEXADECIMAL, '$&$&')}`.toUpperCase()
}

const PATRON_ATRIBUTO_STYLE = / style="([^"]*)"/g

function patronDeFondoDelPrototipo(rol: string): RegExp {
  // `var(--urg)` con el paréntesis de cierre pegado: así `--urg-soft` no cuela.
  return new RegExp(`background:\\s*var\\(--${rol}\\)`)
}

// Solo la forma abreviada de tres dígitos, que es la que el prototipo usa
// (medido: sus cuatro rótulos de urgencia escriben `color:#fff`). La
// anticipación negativa evita cortar un hexadecimal de seis dígitos por la
// mitad; si el prototipo pasara a escribirlos largos, esta lectura devolvería
// menos tintas y el recuento del test caería en rojo, nunca en silencio.
const PATRON_TINTA_LITERAL = /(?:^|;)\s*color:\s*(#[0-9a-fA-F]{3})(?![0-9a-fA-F])/

/**
 * Los colores LITERALES que el prototipo pinta como `color:` dentro del mismo
 * atributo `style` en el que pone `background: var(--<rol>)`, en el orden en
 * que aparecen y ya expandidos a seis dígitos (@s7). Es la medición de lo que
 * el prototipo hace de verdad, no una suposición: si dejara de escribir blanco
 * sobre el rojo, esta lista cambiaría.
 */
export function leerTintasLiteralesSobreRolDelPrototipo(textoHtml: string, rol: string): readonly string[] {
  const patronDeFondo = patronDeFondoDelPrototipo(rol)
  return [...textoHtml.matchAll(PATRON_ATRIBUTO_STYLE)]
    .map((coincidencia) => coincidencia[PRIMERA_CAPTURA] as string)
    .filter((estilo) => patronDeFondo.test(estilo))
    .map((estilo) => estilo.match(PATRON_TINTA_LITERAL))
    .filter((tinta): tinta is RegExpMatchArray => tinta !== null)
    .map((tinta) => expandirHexadecimalAbreviado(tinta[PRIMERA_CAPTURA] as string))
}

/**
 * Veredicto de contraste de una tinta LITERAL (la que el prototipo escribe a
 * mano) sobre el rol `rolDeFondo` del tema `tema` del prototipo (@s7).
 */
export function evaluarTintaSobreRolDelPrototipo(
  textoHtml: string,
  tema: string,
  tinta: string,
  rolDeFondo: string,
  uso: UsoDeColor,
): VeredictoConRatioPublicado {
  const veredicto = evaluarParDeContraste({
    color: tinta,
    fondo: leerRolDeTemaDelPrototipo(textoHtml, tema, rolDeFondo),
    uso,
  })
  return conRatioPublicado(veredicto)
}

/**
 * LA MATRIZ DE USO DEL SISTEMA: los pares (rol, fondo, uso) que las hojas de
 * estilo del proyecto pintan DE VERDAD, con su uso WCAG declarado. No es la
 * combinación exhaustiva de los 18 roles: es la lista de decisiones de diseño
 * reales, y cada fila cita el fichero:línea que la pinta (@s11).
 *
 * `--color-borde` queda fuera a propósito: es decorativo y nunca identifica un
 * control (@s7 de `identidad_visual.feature`, `_api.scss:168-170`).
 */
export const MATRIZ_DE_USO_DEL_SISTEMA: readonly EntradaDeMatrizDeUso[] = [
  // Texto corrido sobre los cuatro planos de fondo del sistema.
  { rol: 'texto', fondo: 'fondo', uso: 'texto normal' }, // `global.scss:123-124` (body)
  { rol: 'texto', fondo: 'fondo-alterno', uso: 'texto normal' }, // `Landing.module.scss:39-42` (.seccionAlterna)
  { rol: 'texto', fondo: 'superficie', uso: 'texto normal' }, // `PieDePagina.module.scss:12-13`
  { rol: 'texto', fondo: 'superficie-elevada', uso: 'texto normal' }, // `FormularioContacto.module.scss:31-34` (campo con `color: inherit`)

  // Titulares y rótulos fuertes.
  { rol: 'tinta', fondo: 'fondo', uso: 'texto normal' }, // `global.scss:243-244`
  { rol: 'tinta', fondo: 'fondo-alterno', uso: 'texto normal' }, // `CampanasPortada.module.scss` dentro de `Landing.tsx` `.seccionAlterna`
  { rol: 'tinta', fondo: 'superficie', uso: 'texto normal' }, // `PieDePagina.module.scss:12` + `:29`

  // Texto secundario: es el rol que el prototipo dejaba por debajo del mínimo
  // en la variante cálida (@s6).
  { rol: 'texto-suave', fondo: 'fondo', uso: 'texto normal' }, // `_api.scss:355-356` (blockquote de `prosa`)
  { rol: 'texto-suave', fondo: 'fondo-alterno', uso: 'texto normal' }, // `Faq.module.scss:47` dentro de `Landing.tsx:71`
  { rol: 'texto-suave', fondo: 'superficie', uso: 'texto normal' }, // `PieDePagina.module.scss:12` + `:75`

  // Tinta sobre relleno saturado. El rojo de urgencia entra AQUÍ, nunca con
  // blanco literal (@s7).
  { rol: 'sobre-primario', fondo: 'primario', uso: 'texto normal' }, // `_api.scss:227-228` (mixin `boton-primario`)
  { rol: 'sobre-primario', fondo: 'primario-fuerte', uso: 'texto normal' }, // `_api.scss:238-239` (mismo botón con el puntero encima)
  { rol: 'sobre-primario', fondo: 'urgencia', uso: 'texto normal' }, // `BarraUrgencias.module.scss:12-13`

  // Acento legible: nunca `--color-acento` a secas, siempre su tinta.
  { rol: 'acento-tinta', fondo: 'acento-suave', uso: 'texto normal' }, // `_api.scss:281-282` (mixin `pildora-etiqueta`)
  { rol: 'acento-tinta', fondo: 'fondo', uso: 'texto normal' }, // `_api.scss:330-331` (mixin `eyebrow`)
  { rol: 'acento-tinta', fondo: 'fondo-alterno', uso: 'texto normal' }, // `CampanasPortada.module.scss` (`.eyebrow`) dentro de `Landing.tsx` `.seccionAlterna`
  { rol: 'acento-tinta', fondo: 'superficie', uso: 'texto normal' }, // `Servicios.module.scss:52` dentro de `tarjeta`

  // Bordes que IDENTIFICAN un control: mínimo de 3:1 por SC 1.4.11 (@s8).
  { rol: 'borde-control', fondo: 'fondo', uso: 'componente de interfaz o borde de foco' }, // `_api.scss:246-255` (mixin `boton-fantasma`)
  { rol: 'borde-control', fondo: 'fondo-alterno', uso: 'componente de interfaz o borde de foco' }, // `ReservaChat.module.scss` (`.acciones a:not(:first-child)`, `boton-fantasma`) dentro de `Landing.tsx` `.seccionAlterna`
  { rol: 'borde-control', fondo: 'superficie', uso: 'componente de interfaz o borde de foco' }, // `Galeria.module.scss` (`.controles button`: borde de control sobre su propio relleno de superficie)
  { rol: 'borde-control', fondo: 'superficie-elevada', uso: 'componente de interfaz o borde de foco' }, // `FormularioContacto.module.scss:31-33`

  // Anillo de foco: mínimo de 3:1 por SC 2.4.11 (@s9).
  { rol: 'foco', fondo: 'fondo', uso: 'componente de interfaz o borde de foco' }, // `_api.scss:75` (mixin `foco-visible`)
  { rol: 'foco', fondo: 'superficie', uso: 'componente de interfaz o borde de foco' }, // `PieDePagina.module.scss:12` + `:42-43`
  // Sobre el velo oscuro del hero el anillo global no llega a 3:1; los dos
  // botones lo cambian a la tinta ya validada de la sección (fidelidad_hero,
  // reparación del 03/09/2026: `accesibilidad` @s38/@s39).
  { rol: 'sobre-primario', fondo: 'tinta', uso: 'componente de interfaz o borde de foco' }, // `Hero.module.scss` (`.acciones a … &:focus-visible`)

  // La píldora del teléfono de urgencias de contacto (fidelidad_contacto @s3):
  // la tinta de urgencia sobre el relleno "sobre-primario" — el par simétrico
  // al de la barra, así que da el mismo ratio en las cinco variantes.
  { rol: 'urgencia', fondo: 'sobre-primario', uso: 'texto normal' }, // `InformacionContacto.module.scss` (`[data-tarjeta-de='urgencia'] a`)
]

/**
 * Veredicto de contraste de una fila de la matriz de uso resuelta contra UNA
 * variante del sistema: los nombres de rol se convierten en los hexadecimales
 * que `src/styles/_tokens.scss` declara de verdad (vía `leerTokenDeVariante`,
 * que ya lee el bloque PROPIO de la variante y nunca uno heredado) y el par
 * pasa por la fórmula real de contraste (@s6, @s7, @s8, @s9, @s11).
 */
export function evaluarParDeVariante(
  textoScss: string,
  variante: string,
  entrada: EntradaDeMatrizDeUso,
): VeredictoConRatioPublicado {
  const veredicto = evaluarParDeContraste({
    color: leerTokenDeVariante(textoScss, variante, entrada.rol),
    fondo: leerTokenDeVariante(textoScss, variante, entrada.fondo),
    uso: entrada.uso,
  })
  return conRatioPublicado(veredicto)
}

/** Una fila de la matriz que suspende, con la variante donde suspende (@s11). */
export interface ParSuspenso {
  readonly variante: string
  readonly rol: string
  readonly fondo: string
  readonly ratio: number
  readonly umbral: number
}

export interface InformeDeMatrizDeContraste {
  readonly veredicto: 'aprobado' | 'suspenso'
  readonly variantesComprobadas: number
  readonly parejasComprobadas: number
  readonly suspensos: readonly ParSuspenso[]
  readonly motivo?: string
}

const NADA_COMPROBADO = 0

function suspensosDeVariante(
  textoScss: string,
  variante: string,
  matriz: readonly EntradaDeMatrizDeUso[],
): readonly ParSuspenso[] {
  return matriz
    .map((entrada) => ({ entrada, evaluado: evaluarParDeVariante(textoScss, variante, entrada) }))
    .filter(({ evaluado }) => evaluado.veredicto === 'suspenso')
    .map(({ entrada, evaluado }) => ({
      variante,
      rol: entrada.rol,
      fondo: entrada.fondo,
      ratio: evaluado.ratio,
      umbral: evaluado.umbral,
    }))
}


/**
 * Resuelve `matriz` contra cada variante de `variantes` y pasa todos los pares
 * por la puerta de contraste (@s11).
 *
 * FALLA CERRADA si la matriz o el catálogo de variantes están vacíos: sin esta
 * guarda, `suspensos.length === 0` sobre cero pares daría "aprobado" por
 * verdad vacua — el defecto que este repositorio llama
 * `verde-por-vacuidad-en-puerta-de-verificacion`.
 */
export function ejecutarMatrizDeContrasteDeVariantes(
  textoScss: string,
  variantes: readonly string[],
  matriz: readonly EntradaDeMatrizDeUso[],
): InformeDeMatrizDeContraste {
  if (variantes.length === NADA_COMPROBADO || matriz.length === NADA_COMPROBADO) {
    return {
      veredicto: 'suspenso',
      variantesComprobadas: NADA_COMPROBADO,
      parejasComprobadas: NADA_COMPROBADO,
      suspensos: [],
      motivo: 'no se comprobó ninguna pareja: la matriz de uso o el catálogo de variantes está vacío',
    }
  }

  const suspensos = variantes.flatMap((variante) => suspensosDeVariante(textoScss, variante, matriz))

  return {
    veredicto: suspensos.length === NADA_COMPROBADO ? 'aprobado' : 'suspenso',
    variantesComprobadas: variantes.length,
    parejasComprobadas: variantes.length * matriz.length,
    suspensos,
  }
}

/**
 * Una pareja (tinta, fondo) que el TEXTO REAL de una hoja de estilos pinta de
 * verdad y que `MATRIZ_DE_USO_DEL_SISTEMA` no declara: la matriz es una lista
 * de decisiones escritas a mano (@s11), así que puede quedarse corta cuando
 * un fichero de estilos aprende un par nuevo. Esta puerta la reconcilia
 * contra el texto real en vez de fiarse de que nadie la olvidó actualizar.
 */
export interface EntradaSinRepresentarEnMatriz {
  readonly tinta: string
  readonly fondo: string
  readonly ruta: string
  readonly linea: number
}

export interface InformeDeReconciliacionDeMatriz {
  readonly pasa: boolean
  readonly paresSinRepresentar: readonly EntradaSinRepresentarEnMatriz[]
}

const PRIMERA_LINEA = 1
const NINGUN_PAR_SIN_REPRESENTAR = 0

// Ancladas al INICIO de la línea (tras recortar espacios): así
// `background-color:` nunca cuela como si fuera `color:`, la misma defensa
// que el resto del fichero usa para no confundir un rol con su prefijo.
const PATRON_DECLARACION_DE_FONDO = /^background-color:\s*var\(--color-([a-z0-9-]+)\)/
const PATRON_DECLARACION_DE_TINTA = /^color:\s*var\(--color-([a-z0-9-]+)\)/

function representaLaMatriz(matriz: readonly EntradaDeMatrizDeUso[], tinta: string, fondo: string): boolean {
  return matriz.some((entrada) => entrada.rol === tinta && entrada.fondo === fondo)
}

/**
 * Las parejas (tinta, fondo) que UN fichero pinta de verdad y que `matriz` no
 * cubre. Sigue la anidación de bloques con una pila: el `fondo` vigente es el
 * del `background-color` declarado más cerca, heredado por los selectores
 * anidados que no fijan uno propio — igual que lo haría el cascada real de
 * CSS/SCSS.
 */
function paresSinRepresentarDeFichero(
  fichero: FicheroDeTexto,
  matriz: readonly EntradaDeMatrizDeUso[],
): readonly EntradaSinRepresentarEnMatriz[] {
  const sinRepresentar: EntradaSinRepresentarEnMatriz[] = []
  const pilaDeFondos: Array<string | undefined> = []
  let fondoVigente: string | undefined

  fichero.contenido.split('\n').forEach((linea, indice) => {
    const numeroDeLinea = indice + PRIMERA_LINEA
    const trimmed = linea.trim()

    const fondoDeclarado = trimmed.match(PATRON_DECLARACION_DE_FONDO)
    if (fondoDeclarado) {
      fondoVigente = fondoDeclarado[PRIMERA_CAPTURA]
    }

    const tintaDeclarada = trimmed.match(PATRON_DECLARACION_DE_TINTA)
    if (tintaDeclarada) {
      const tinta = tintaDeclarada[PRIMERA_CAPTURA] as string
      if (fondoVigente !== undefined && !representaLaMatriz(matriz, tinta, fondoVigente)) {
        sinRepresentar.push({ tinta, fondo: fondoVigente, ruta: fichero.ruta, linea: numeroDeLinea })
      }
    }

    if (trimmed.includes(LLAVE_ABRE)) {
      pilaDeFondos.push(fondoVigente)
    }
    if (trimmed.includes(LLAVE_CIERRA)) {
      fondoVigente = pilaDeFondos.pop()
    }
  })

  return sinRepresentar
}

/**
 * Reconcilia `matriz` contra el TEXTO REAL de `estilos`: por cada par
 * (tinta, fondo) que un fichero pinta de verdad y que la matriz no declara,
 * lo señala con su fichero y su línea (@s11).
 */
export function ejecutarPuertaDeReconciliacionDeMatriz(
  estilos: readonly FicheroDeTexto[],
  matriz: readonly EntradaDeMatrizDeUso[],
): InformeDeReconciliacionDeMatriz {
  const paresSinRepresentar = estilos.flatMap((fichero) => paresSinRepresentarDeFichero(fichero, matriz))
  return { pasa: paresSinRepresentar.length === NINGUN_PAR_SIN_REPRESENTAR, paresSinRepresentar }
}
