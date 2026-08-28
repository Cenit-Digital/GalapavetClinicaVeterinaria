/**
 * La puerta que faltaba (@s3 de `features/rediseno_visual.feature`, bloque F):
 * comparar el TEXTO REAL del prototipo versionado en
 * `docs/diseno-claude-design/Veterinaria La Sierra.dc.html` con el TEXTO REAL
 * de `src/styles/_tokens.scss`.
 *
 * Motivo, literal de la cabecera del contrato (`rediseno_visual.feature:68-70`):
 * «se entregó un sitio que no se parece al diseño, porque NINGÚN escenario
 * comparaba nada contra el diseño. Se verificaba que el sitio fuera coherente
 * consigo mismo, no que fuera fiel a su referencia».
 *
 * Módulo PURO: no lee ficheros. Recibe los dos textos y devuelve un informe
 * con contadores, como exige `stryker.config.json` (una decisión escondida en
 * un `.tsx` no la muerde nadie).
 */

import { VARIANTE_PREDETERMINADA, VARIANTES_REDISENO } from './contratoRedisenho'
import { mezclar } from './mezclaDeColor'
import { declaraTokenEnVariante, leerDeclaracionDeVariante, type NombreDeToken } from './tokensColor'

/**
 * Una fila de la tabla de correspondencia: cómo se llama el mismo rol en cada
 * lado. `sistema` es un `NombreDeToken`, no una cadena suelta: así el
 * compilador ata esta tabla al inventario real de `tokensColor.ts:44`, y
 * renombrar un rol allí rompe aquí en vez de pasar en silencio.
 */
export interface CorrespondenciaDeRol {
  readonly prototipo: string
  readonly sistema: NombreDeToken
}

/**
 * Los 18 roles que el prototipo declara en cada uno de sus cuatro bloques de
 * tema, con el nombre que ese mismo rol recibe en el sistema.
 *
 * Derivada leyendo los bloques reales del prototipo (`VLS:18-49`) y
 * contrastándola con `src/styles/_tokens.scss`; coincide con la tabla 1.1 de
 * `progress/rediseno/matriz_delta.md:106-125`, destilada de la medición en
 * navegador real de los custom properties RESUELTOS.
 *
 * Los otros dos roles del sistema (`--color-borde-control` y `--color-foco`)
 * no aparecen aquí a propósito: el prototipo no los modela — lo dicen @s8
 * («el prototipo no modela este rol») y @s9 («el prototipo no declara ninguna
 * regla de foco»), y lo confirma `matriz_delta.md:117-118`.
 */
export const TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA: readonly CorrespondenciaDeRol[] = [
  { prototipo: '--bg', sistema: '--color-fondo' },
  { prototipo: '--bg-2', sistema: '--color-fondo-alterno' },
  { prototipo: '--card', sistema: '--color-superficie' },
  { prototipo: '--surface', sistema: '--color-superficie-elevada' },
  { prototipo: '--border', sistema: '--color-borde' },
  { prototipo: '--ink', sistema: '--color-tinta' },
  { prototipo: '--text', sistema: '--color-texto' },
  { prototipo: '--muted', sistema: '--color-texto-suave' },
  { prototipo: '--primary', sistema: '--color-primario' },
  { prototipo: '--primary-strong', sistema: '--color-primario-fuerte' },
  { prototipo: '--on-primary', sistema: '--color-sobre-primario' },
  { prototipo: '--accent', sistema: '--color-acento' },
  { prototipo: '--accent-ink', sistema: '--color-acento-tinta' },
  { prototipo: '--accent-soft', sistema: '--color-acento-suave' },
  { prototipo: '--urg', sistema: '--color-urgencia' },
  { prototipo: '--urg-soft', sistema: '--color-urgencia-suave' },
  { prototipo: '--shadow', sistema: '--sombra-elevada' },
  { prototipo: '--shadow-sm', sistema: '--sombra-reposo' },
]

/**
 * Los dos roles del sistema que NO aparecen en la tabla porque el prototipo no
 * los modela. Se declaran aquí, en una lista explícita y afirmada, para que
 * quitar una fila de la tabla no pase inadvertido: el test confronta esta
 * lista con lo que sobra del inventario real de `tokensColor.ts:76`.
 *
 * - `--color-borde-control`: @s8, «el prototipo no modela este rol»
 *   (`matriz_delta.md:117`: ninguna de las 4 paletas desdobla el borde).
 * - `--color-foco`: @s9, «el prototipo no declara ninguna regla de foco y
 *   además suprime el contorno en seis controles» (`VLS:299,368,371,375,378,387`).
 */
export const ROLES_DEL_SISTEMA_SIN_MODELO_EN_EL_PROTOTIPO: readonly NombreDeToken[] = [
  '--color-borde-control',
  '--color-foco',
]

/** Un tema del prototipo y el selector CSS con el que lo declara. */
export interface TemaDelPrototipo {
  readonly variante: string
  readonly selector: string
}

/**
 * El tema BASE del prototipo no lleva atributo: es el bloque `:root` a secas,
 * sobre el que los otros conmutan con `[data-tema]` (`matriz_delta.md:133-135`).
 * Por eso el sistema declara esa misma variante como predeterminada (@s10) y la
 * repite en el `:root` de emergencia (@s12).
 */
export const SELECTOR_DEL_TEMA_BASE = ':root'

/**
 * El selector con el que el prototipo declara el tema de `variante`.
 *
 * El identificador NO se reescribe aquí: sale de `VARIANTE_PREDETERMINADA`
 * (`contratoRedisenho.ts:26`), la única declaración que @s10 permite en todo el
 * proyecto. Este módulo la CONSUME; hasta el 26/08/2026 la copiaba, y por eso
 * la puerta de declaración única de `SelectorPaleta-logica.test.ts` daba dos
 * ficheros declarantes en vez de uno.
 */
export function selectorDelTemaDelPrototipo(variante: string): string {
  if (variante === VARIANTE_PREDETERMINADA) {
    return SELECTOR_DEL_TEMA_BASE
  }
  return `${SELECTOR_DEL_TEMA_BASE}[data-tema='${variante}']`
}

/**
 * Los temas que el prototipo declara DE VERDAD, en el orden del catálogo único
 * de variantes (`VARIANTES_REDISENO`, `contratoRedisenho.ts:24`) y filtrados
 * por lo que el TEXTO REAL del bundle contiene (`VLS:18,26,34,42`).
 *
 * La variante que el repositorio añade y el prototipo no modela cae sola: el
 * prototipo no declara su bloque, así que el filtro la descarta sin que este
 * módulo tenga que nombrarla.
 */
export function temasDelPrototipo(textoPrototipo: string): readonly TemaDelPrototipo[] {
  return VARIANTES_REDISENO.map((variante) => ({
    variante,
    selector: selectorDelTemaDelPrototipo(variante),
  })).filter(({ selector }) => textoPrototipo.includes(selector + LLAVE_ABRE))
}

/** Los custom properties declarados en un bloque, del nombre al valor tal cual se escribe. */
export type DeclaracionesDeTema = Readonly<Record<string, string>>

const LLAVE_ABRE = '{'
const LLAVE_CIERRA = '}'
const SIN_COINCIDENCIA = -1
const UNO = 1
const PROFUNDIDAD_CERRADA = 0
const NOMBRE = 1
const VALOR = 2

const PATRON_DECLARACION = /(--[a-z0-9-]+)\s*:\s*([^;]+);/g

/**
 * El cuerpo del bloque `selector` siguiendo la profundidad de llaves, el mismo
 * mecanismo que `tokensColor.ts:117-146` ya usa para `_tokens.scss`: un
 * `[^}]*` se cortaría en la primera llave anidada.
 */
export function extraerCuerpoDeBloque(texto: string, selector: string): string {
  // Se busca `selector{` y no `selector`: `:root` es prefijo de
  // `:root[data-tema='calida']`, así que buscarlo suelto dependería de que el
  // tema base apareciera primero en el fichero.
  const indiceLlave = texto.indexOf(selector + LLAVE_ABRE)
  if (indiceLlave === SIN_COINCIDENCIA) {
    throw new Error(`el prototipo no declara ningún bloque "${selector}"`)
  }

  const cuerpoEmpieza = indiceLlave + selector.length + UNO
  let profundidad = UNO
  let cursor = cuerpoEmpieza
  while (cursor < texto.length && profundidad > PROFUNDIDAD_CERRADA) {
    if (texto[cursor] === LLAVE_ABRE) {
      profundidad += UNO
    }
    if (texto[cursor] === LLAVE_CIERRA) {
      profundidad -= UNO
    }
    cursor += UNO
  }

  if (profundidad > PROFUNDIDAD_CERRADA) {
    throw new Error(`el bloque "${selector}" del prototipo no se cierra`)
  }

  return texto.slice(cuerpoEmpieza, cursor - UNO)
}

function leerDeclaraciones(cuerpo: string): DeclaracionesDeTema {
  const declaraciones: Record<string, string> = {}
  for (const coincidencia of cuerpo.matchAll(PATRON_DECLARACION)) {
    declaraciones[coincidencia[NOMBRE] as string] = (coincidencia[VALOR] as string).trim()
  }
  return declaraciones
}

/**
 * Los custom properties que declara cada uno de los cuatro temas del
 * prototipo, leídos del TEXTO REAL del bundle versionado.
 */
export function extraerTemasDelPrototipo(textoPrototipo: string): ReadonlyMap<string, DeclaracionesDeTema> {
  return new Map(
    temasDelPrototipo(textoPrototipo).map(({ variante, selector }) => [
      variante,
      leerDeclaraciones(extraerCuerpoDeBloque(textoPrototipo, selector)),
    ]),
  )
}

/** Una pareja (variante, rol del prototipo) señalada por una de las dos listas de exclusión. */
export interface ParejaDelPrototipo {
  readonly variante: string
  readonly rolDelPrototipo: string
}

/** Una desviación declarada: la pareja, los dos valores y el escenario que la autoriza. */
export interface DesviacionDeclarada extends ParejaDelPrototipo {
  readonly valorDelPrototipo: string
  readonly valorDelSistema: string
  readonly escenario: string
}

/**
 * Las TRES desviaciones declaradas: las únicas parejas en las que el sistema
 * NO reproduce el valor del prototipo (@s3, «salvo en las tres desviaciones
 * declaradas de @s6 y @s7»).
 *
 * Que estén excluidas de la comparación contra el prototipo NO las deja sin
 * vigilancia: cada una fija LOS DOS valores, así que la puerta las sigue
 * comparando carácter a carácter — contra el valor declarado en vez de contra
 * el del prototipo. Si cualquiera de los dos ficheros se mueve, salta.
 *
 * - `calida --muted` (@s6): el prototipo declara `#8A6C45`, que sobre
 *   `--bg-2` `#FEF3C7` da 4.37 y suspende el mínimo de 4.5 de texto normal
 *   (`analisis_contraste_paletas.md:129`). Es el único suspenso que traía el
 *   prototipo y el sistema lo corrige.
 * - `tech --accent-soft` y `tech --urg-soft` (@s7): el prototipo los declara
 *   TRANSLÚCIDOS solo en `tech`, y un translúcido no tiene ratio propio
 *   (`matriz_delta.md:191`, T-11: «obliga a componer antes de medir»), así que
 *   el sistema tiene que declararlos ya opacos para poder medirlos. Decisión
 *   explícita de este módulo: el contrato atribuye las tres desviaciones a
 *   «@s6 y @s7» y solo `--urg-soft` es de la familia de urgencia; se etiqueta
 *   `--accent-soft` con @s7 porque comparte exactamente el mismo motivo — el
 *   aplanado del alfa de `tech` — y no porque @s7 lo nombre.
 */
export const DESVIACIONES_DECLARADAS: readonly DesviacionDeclarada[] = [
  {
    variante: 'calida',
    rolDelPrototipo: '--muted',
    valorDelPrototipo: '#8A6C45',
    valorDelSistema: '#84663E',
    escenario: '@s6',
  },
  {
    variante: 'tech',
    rolDelPrototipo: '--accent-soft',
    valorDelPrototipo: 'rgba(6,182,212,.14)',
    valorDelSistema: '#12394A',
    escenario: '@s7',
  },
  {
    variante: 'tech',
    rolDelPrototipo: '--urg-soft',
    valorDelPrototipo: 'rgba(248,113,113,.16)',
    valorDelSistema: '#542A37',
    escenario: '@s7',
  },
]

const PATRON_HEXADECIMAL = /^#[0-9a-f]{3,8}$/i
const PATRON_ESPACIO_JUNTO_A_SIGNO = /\s*([(),])\s*/g
const PATRON_ESPACIOS_SEGUIDOS = /\s+/g
const PATRON_NUMERO = /\d*\.?\d+/g
const UN_ESPACIO = ' '

/**
 * Forma canónica de un valor CSS: borra SOLO diferencias de formato, nunca de
 * valor. El prototipo y el sistema escriben lo mismo con distinta ortografía
 * — `rgba(15,32,60,.10)` (`VLS:24`) frente a `rgba(15, 32, 60, 0.1)`
 * (`_tokens.scss:26`) — y esa diferencia no es una desviación de diseño.
 *
 * Un hexadecimal solo se pasa a mayúsculas: sus dígitos NO entran en la
 * canonicalización numérica, que convertiría `#00FF00` en `#0FF00`.
 */
export function normalizarValorCss(valor: string): string {
  const limpio = valor.trim()
  if (PATRON_HEXADECIMAL.test(limpio)) {
    return limpio.toUpperCase()
  }

  return limpio
    .replace(PATRON_ESPACIO_JUNTO_A_SIGNO, '$1')
    .replace(PATRON_ESPACIOS_SEGUIDOS, UN_ESPACIO)
    .replace(PATRON_NUMERO, (numero) => String(Number(numero)))
}

const PATRON_COLOR_TRANSLUCIDO = /^rgba\(/i

/**
 * Si el valor es un COLOR con alfa. Se ancla al principio de la cadena a
 * propósito: las dos sombras llevan `rgba()` dentro (`0 18px 45px rgba(...)`)
 * y no son colores translúcidos, son listas de sombra.
 */
export function esColorTranslucido(valor: string): boolean {
  return PATRON_COLOR_TRANSLUCIDO.test(valor.trim())
}

/**
 * Las parejas (variante, rol) que el prototipo declara con alfa, derivadas de
 * su TEXTO REAL. Es la lista que afirma `PAREJAS_TRANSLUCIDAS_DEL_PROTOTIPO`:
 * si el diseño cambiara un `rgba()` por un hexadecimal, dejarían de coincidir.
 */
export function extraerParejasTranslucidasDelPrototipo(textoPrototipo: string): readonly ParejaDelPrototipo[] {
  const temas = extraerTemasDelPrototipo(textoPrototipo)
  return [...temas.entries()].flatMap(([variante, declaraciones]) =>
    TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA.filter((fila) =>
      esColorTranslucido(declaraciones[fila.prototipo] ?? ''),
    ).map((fila) => ({ variante, rolDelPrototipo: fila.prototipo })),
  )
}

/** Una pareja (variante, rol) del prototipo cuyo equivalente el sistema no declara. */
export interface RolSinEquivalente {
  readonly variante: string
  readonly rolDelPrototipo: string
  readonly rolDelSistema: NombreDeToken
}

export interface InformeDeFidelidad {
  readonly pasa: boolean
  readonly motivo?: string
  readonly equivalenciasComprobadas: number
  readonly valoresComparados: number
  readonly desviacionesVerificadas: number
  readonly derivacionesVerificadas: number
  readonly rolesSinEquivalente: readonly RolSinEquivalente[]
  readonly discrepancias: readonly Discrepancia[]
}

/** Un valor que no es el que debía ser. */
export interface Discrepancia extends ParejaDelPrototipo {
  readonly esperado: string
  readonly encontrado: string
}

/**
 * El rol con el que el prototipo declara el fondo de cada tema (`VLS:19,27,35,43`).
 * Es el lienzo sobre el que se compone cualquier rol que el prototipo escriba
 * con alfa, y es carácter a carácter el `--color-fondo` de esa misma variante
 * en el sistema — cosa que esta misma puerta comprueba, porque `--bg` es una de
 * las parejas que compara.
 */
const ROL_DE_FONDO_DEL_PROTOTIPO = '--bg'

const PATRON_COLOR_CON_ALFA = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d*\.?\d+)\s*\)$/i
const PATRON_HEXADECIMAL_DE_SEIS = /^#[0-9a-f]{6}$/i
const CANAL_ROJO = 1
const CANAL_VERDE = 2
const CANAL_AZUL = 3
const CANAL_ALFA = 4
const BASE_HEXADECIMAL = 16
const DIGITOS_POR_CANAL = 2
const CERO_DE_RELLENO = '0'

export function canalAHexadecimal(canal: string): string {
  return Number(canal).toString(BASE_HEXADECIMAL).toUpperCase().padStart(DIGITOS_POR_CANAL, CERO_DE_RELLENO)
}

/**
 * El valor OPACO que el sistema debe declarar donde el prototipo puso alfa
 * (@s3, ENMIENDA 1 de `progress/rediseno/enmiendas_contrato.md:57-62`): el
 * color del `rgba()` compuesto sobre el fondo de su propia variante, con
 * `mezclar()` (`mezclaDeColor.ts`), la misma función con la que @s5 deriva
 * `--color-urgencia-suave`.
 *
 * Es UNA sola regla para las cuatro variantes importadas: lo único que cambia
 * entre ellas son los ingredientes que el propio prototipo declara.
 *
 * Devuelve `null` —y la puerta lo trata como discrepancia— si el translúcido
 * no se deja parsear o el fondo no es un hexadecimal de seis dígitos: fallar
 * cerrada, nunca dar por bueno lo que no se ha podido calcular.
 */
export function componerTranslucidoSobreElFondo(fondo: string, valorTranslucido: string): string | null {
  const partes = valorTranslucido.trim().match(PATRON_COLOR_CON_ALFA)
  const fondoLimpio = fondo.trim()
  if (partes === null || !PATRON_HEXADECIMAL_DE_SEIS.test(fondoLimpio)) {
    return null
  }

  const color = `#${canalAHexadecimal(partes[CANAL_ROJO] as string)}${canalAHexadecimal(
    partes[CANAL_VERDE] as string,
  )}${canalAHexadecimal(partes[CANAL_AZUL] as string)}`

  return mezclar(fondoLimpio, color, Number(partes[CANAL_ALFA]))
}

/**
 * Lo que la puerta pone en `esperado` cuando ni siquiera puede calcular la
 * composición. No es «cualquier hexadecimal vale»: es «no se ha podido
 * derivar», y sale en rojo.
 */
export const MOTIVO_TRANSLUCIDO_NO_COMPONIBLE = 'el valor compuesto sobre el fondo de su variante'

const NINGUNO = 0

/**
 * El prototipo tiene que declarar SUS temas conmutables. Sin esta guarda, un
 * texto vacío (una ruta de glob mal escrita, un fichero movido) recorrería cero
 * parejas y la puerta daría «cero discrepancias» por bueno: el defecto que
 * este repositorio llama `verde-por-vacuidad-en-puerta-de-verificacion`.
 */
export const MOTIVO_TABLA_VACIA =
  'la tabla de correspondencia está vacía: la puerta falla cerrada en vez de dar cero comparaciones por buenas'

export const MOTIVO_PROTOTIPO_ILEGIBLE =
  'el texto del prototipo no declara los temas del catálogo de variantes: la puerta falla cerrada en vez de dar cero comparaciones por buenas'

function informeFallidoCerrado(motivo: string): InformeDeFidelidad {
  return {
    pasa: false,
    motivo,
    equivalenciasComprobadas: NINGUNO,
    valoresComparados: NINGUNO,
    desviacionesVerificadas: NINGUNO,
    derivacionesVerificadas: NINGUNO,
    rolesSinEquivalente: [],
    discrepancias: [],
  }
}

/**
 * Un texto que solo trae el bloque base no sirve: sin los temas conmutables no
 * hay nada que comparar y la puerta daría «cero discrepancias» por bueno.
 */
const SOLO_EL_TEMA_BASE = 1

function elPrototipoDeclaraSusTemas(textoPrototipo: string): boolean {
  return temasDelPrototipo(textoPrototipo).length > SOLO_EL_TEMA_BASE
}

function mismaPareja(a: ParejaDelPrototipo, b: ParejaDelPrototipo): boolean {
  return a.variante === b.variante && a.rolDelPrototipo === b.rolDelPrototipo
}

function discrepanciasSiNoCoinciden(
  pareja: ParejaDelPrototipo,
  esperado: string,
  encontrado: string,
): readonly Discrepancia[] {
  if (normalizarValorCss(esperado) === normalizarValorCss(encontrado)) {
    return []
  }
  return [{ ...pareja, esperado, encontrado }]
}

/**
 * Una pareja que el prototipo declara translúcida y que NO es una desviación
 * declarada: no se aparta de la comparación, se DERIVA (@s3). El sistema tiene
 * que declarar exactamente el color compuesto sobre el fondo de su variante.
 *
 * Hasta el 26/08/2026 esta función solo comprobaba que el valor del sistema
 * fuese un hexadecimal, e ignoraba por completo `enElPrototipo`: medido sobre
 * el texto real, `#FF0000` y `#000000` salían en VERDE. Ese era el agujero.
 */
function comprobarDerivacionPorComposicion(
  pareja: ParejaDelPrototipo,
  fondoDelTema: string,
  enElPrototipo: string,
  enElSistema: string,
): readonly Discrepancia[] {
  const compuesto = componerTranslucidoSobreElFondo(fondoDelTema, enElPrototipo)
  if (compuesto === null) {
    return [{ ...pareja, esperado: MOTIVO_TRANSLUCIDO_NO_COMPONIBLE, encontrado: enElSistema }]
  }
  return discrepanciasSiNoCoinciden(pareja, compuesto, enElSistema)
}

/**
 * Una desviación declarada sigue comparándose carácter a carácter: contra los
 * DOS valores que la propia desviación fija. Así la exclusión no es un agujero
 * por el que se pueda colar una regresión en ninguno de los dos ficheros.
 */
function comprobarDesviacion(
  pareja: ParejaDelPrototipo,
  desviacion: DesviacionDeclarada,
  enElPrototipo: string,
  enElSistema: string,
): readonly Discrepancia[] {
  return [
    ...discrepanciasSiNoCoinciden(pareja, desviacion.valorDelPrototipo, enElPrototipo),
    ...discrepanciasSiNoCoinciden(pareja, desviacion.valorDelSistema, enElSistema),
  ]
}

/**
 * Compara el prototipo con el sistema, pareja a pareja (@s3). La existencia se
 * delega en `declaraTokenEnVariante` (`tokensColor.ts:194`), que exige que el
 * token esté en el bloque PROPIO de la variante: un rol heredado del `:root`
 * global cuenta como ausente, igual que en @s2.
 *
 * Cada pareja cae en exactamente uno de los tres cubos, y los tres contadores
 * suman el total: nada se queda sin mirar.
 */
export function ejecutarPuertaDeFidelidadDelPrototipo(
  textoPrototipo: string,
  textoTokens: string,
  tabla: readonly CorrespondenciaDeRol[] = TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA,
): InformeDeFidelidad {
  if (tabla.length === NINGUNO) {
    return informeFallidoCerrado(MOTIVO_TABLA_VACIA)
  }

  if (!elPrototipoDeclaraSusTemas(textoPrototipo)) {
    return informeFallidoCerrado(MOTIVO_PROTOTIPO_ILEGIBLE)
  }

  const temas = extraerTemasDelPrototipo(textoPrototipo)
  const parejas = [...temas.entries()].flatMap(([variante, declaraciones]) =>
    tabla.map((fila) => ({ variante, fila, declaraciones })),
  )

  const rolesSinEquivalente: RolSinEquivalente[] = []
  const discrepancias: Discrepancia[] = []
  let valoresComparados = NINGUNO
  let desviacionesVerificadas = NINGUNO
  let derivacionesVerificadas = NINGUNO

  for (const { variante, fila, declaraciones } of parejas) {
    const pareja: ParejaDelPrototipo = { variante, rolDelPrototipo: fila.prototipo }

    if (!declaraTokenEnVariante(textoTokens, variante, fila.sistema)) {
      rolesSinEquivalente.push({ ...pareja, rolDelSistema: fila.sistema })
      continue
    }

    const enElPrototipo = declaraciones[fila.prototipo] ?? ''
    const enElSistema = leerDeclaracionDeVariante(textoTokens, variante, fila.sistema)
    const desviacion = DESVIACIONES_DECLARADAS.find((candidata) => mismaPareja(candidata, pareja))

    if (desviacion) {
      discrepancias.push(...comprobarDesviacion(pareja, desviacion, enElPrototipo, enElSistema))
      desviacionesVerificadas += 1
      continue
    }

    if (esColorTranslucido(enElPrototipo)) {
      discrepancias.push(
        ...comprobarDerivacionPorComposicion(
          pareja,
          declaraciones[ROL_DE_FONDO_DEL_PROTOTIPO] ?? '',
          enElPrototipo,
          enElSistema,
        ),
      )
      derivacionesVerificadas += 1
      continue
    }

    discrepancias.push(...discrepanciasSiNoCoinciden(pareja, enElPrototipo, enElSistema))
    valoresComparados += 1
  }

  return {
    pasa:
      parejas.length > NINGUNO && rolesSinEquivalente.length === NINGUNO && discrepancias.length === NINGUNO,
    equivalenciasComprobadas: parejas.length,
    valoresComparados,
    desviacionesVerificadas,
    derivacionesVerificadas,
    rolesSinEquivalente,
    discrepancias,
  }
}
