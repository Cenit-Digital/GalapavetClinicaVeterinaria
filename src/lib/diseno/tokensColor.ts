/**
 * Lectura de los tokens de color de las 4 variantes de paleta desde el texto
 * REAL de `src/styles/_tokens.scss` (patrón de memoria organizacional
 * `tokens/contraste-de-tokens-verificado-por-matriz-de-uso.md`): cada valor
 * se recalcula desde el propio fichero de tokens, nunca se duplica a mano.
 *
 * Selector que declara cada variante: `:root[data-variante='<id>']`, el
 * mismo atributo que `document.documentElement.setAttribute('data-variante',
 * id)` ya aplica antes del primer pintado (`index.html:30`,
 * `selector_paleta.feature`, ya `done`).
 */
import type { UsoDeColor } from '../contraste'

/**
 * Los 18 roles de color del sistema (@s1 de `rediseno_visual.feature`), sin
 * el prefijo `--color-`. Quince vienen del sistema anterior (@s1 de
 * `identidad_visual.feature:148`) y tres nacen con el rediseño: `acento`,
 * `urgencia` y `urgencia-suave`.
 *
 * El ORDEN es el que declara `src/styles/_tokens.scss:7-24`, la hoja que
 * implementa el sistema, y es el mismo de `ROLES_DE_COLOR_REDISENO`
 * (`contratoRedisenho.ts:1`): las dos declaraciones del inventario se
 * confrontan contra un único literal escrito a mano en
 * `contratoRedisenho.test.ts`, así que no pueden divergir en silencio (@s1).
 */
export type RolDeColor =
  | 'fondo'
  | 'fondo-alterno'
  | 'superficie'
  | 'superficie-elevada'
  | 'borde'
  | 'borde-control'
  | 'tinta'
  | 'texto'
  | 'texto-suave'
  | 'primario'
  | 'primario-fuerte'
  | 'sobre-primario'
  | 'acento'
  | 'acento-tinta'
  | 'acento-suave'
  | 'urgencia'
  | 'urgencia-suave'
  | 'foco'

/** Los 2 roles de sombra del sistema (@s1), sin el prefijo `--sombra-`. No son color: no pasan por la puerta de contraste. */
export type RolDeSombra = 'reposo' | 'elevada'

/** Nombre completo de un token del sistema, tal y como se escribe en el SCSS. */
export type NombreDeToken = `--color-${RolDeColor}` | `--sombra-${RolDeSombra}`

const ROLES_DE_COLOR: readonly RolDeColor[] = [
  'fondo',
  'fondo-alterno',
  'superficie',
  'superficie-elevada',
  'borde',
  'borde-control',
  'tinta',
  'texto',
  'texto-suave',
  'primario',
  'primario-fuerte',
  'sobre-primario',
  'acento',
  'acento-tinta',
  'acento-suave',
  'urgencia',
  'urgencia-suave',
  'foco',
]

const ROLES_DE_SOMBRA: readonly RolDeSombra[] = ['reposo', 'elevada']

/**
 * El inventario declarado de los 20 tokens del sistema de color (18 roles de
 * color + 2 de sombra, @s1). Construido a partir de `ROLES_DE_COLOR` y
 * `ROLES_DE_SOMBRA`, que son la fuente única de verdad de qué roles existen
 * — el mismo tipo `RolDeColor`/`RolDeSombra` que el resto del módulo usa para
 * leer y comprobar tokens, así que no puede desincronizarse en silencio.
 */
export const INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR: readonly NombreDeToken[] = [
  ...ROLES_DE_COLOR.map((rol): NombreDeToken => `--color-${rol}`),
  ...ROLES_DE_SOMBRA.map((rol): NombreDeToken => `--sombra-${rol}`),
]

const PATRON_SELECTOR_VARIANTE = /:root\[data-variante=['"]([a-z]+)['"]\]/g

/**
 * Ids de las variantes declaradas en el texto de tokens, en el orden en que
 * aparecen, sin duplicados (@s1).
 */
export function extraerVariantesDeTokens(textoScss: string): readonly string[] {
  const variantes: string[] = []
  for (const coincidencia of textoScss.matchAll(PATRON_SELECTOR_VARIANTE)) {
    const id = coincidencia[1] as string
    if (!variantes.includes(id)) {
      variantes.push(id)
    }
  }
  return variantes
}

const LLAVE_ABRE = '{'
const LLAVE_CIERRA = '}'
const SIN_COINCIDENCIA = -1
const UNO = 1
const PROFUNDIDAD_CERRADA = 0

function patronDeEncabezadoDeVariante(variante: string): RegExp {
  return new RegExp(`:root\\[data-variante=['"]${variante}['"]\\]\\s*`)
}

/**
 * El cuerpo (sin las llaves) del bloque `:root[data-variante='<variante>']`
 * del texto de tokens, siguiendo la profundidad de llaves — el mismo
 * mecanismo que `movimientoRespetuoso.ts` ya usa en este repo — en vez de la
 * antigua `[^}]*`. La antigua se cortaba en la PRIMERA `}` que encontrara,
 * así que un bloque de variante con cualquier llave anidada (un `@media`, un
 * `&`) le devolvía el cuerpo cortado a la mitad (PENDIENTE 12 del contrato,
 * `plan_adaptacion_scss.md` §2.5.C).
 */
function extraerBloqueDeVariante(textoScss: string, variante: string): string {
  const coincidenciaEncabezado = textoScss.match(patronDeEncabezadoDeVariante(variante))
  if (!coincidenciaEncabezado || coincidenciaEncabezado.index === undefined) {
    throw new Error(`no se encontró ningún bloque ":root[data-variante='${variante}']" en el texto de tokens`)
  }

  const indiceDeLlaveDeApertura = textoScss.indexOf(LLAVE_ABRE, coincidenciaEncabezado.index)
  if (indiceDeLlaveDeApertura === SIN_COINCIDENCIA) {
    throw new Error(`no se encontró ningún bloque ":root[data-variante='${variante}']" en el texto de tokens`)
  }

  const cuerpoEmpieza = indiceDeLlaveDeApertura + UNO
  let profundidad = UNO
  let cursor = cuerpoEmpieza
  while (cursor < textoScss.length && profundidad > PROFUNDIDAD_CERRADA) {
    if (textoScss[cursor] === LLAVE_ABRE) {
      profundidad += UNO
    }
    if (textoScss[cursor] === LLAVE_CIERRA) {
      profundidad -= UNO
    }
    cursor += UNO
  }

  if (profundidad > PROFUNDIDAD_CERRADA) {
    throw new Error(`el bloque ":root[data-variante='${variante}']" no se cierra: falta la llave de cierre`)
  }

  return textoScss.slice(cuerpoEmpieza, cursor - UNO)
}

function leerTokenDelBloque(bloque: string, rol: RolDeColor, mensajeSiAusente: string): string {
  const patronToken = new RegExp(`--color-${rol}:\\s*(#[0-9a-fA-F]{6})\\s*;`)
  const coincidencia = bloque.match(patronToken)
  if (!coincidencia) {
    throw new Error(mensajeSiAusente)
  }
  return (coincidencia[1] as string).toUpperCase()
}

/**
 * Valor real (en mayúsculas) del token `--color-<rol>` dentro del bloque de
 * `variante`, leído del texto de `_tokens.scss` (patrón de memoria
 * `tokens/contraste-de-tokens-verificado-por-matriz-de-uso.md`): cada
 * escenario recalcula desde el fichero real, nunca desde un literal
 * duplicado a mano (@s2-@s10).
 */
export function leerTokenDeVariante(textoScss: string, variante: string, rol: RolDeColor): string {
  const bloque = extraerBloqueDeVariante(textoScss, variante)
  return leerTokenDelBloque(bloque, rol, `no se encontró el token "--color-${rol}" para la variante "${variante}"`)
}

const PRIMERA_CAPTURA = 1

function leerDeclaracionDelBloque(bloque: string, nombreDeToken: NombreDeToken, mensajeSiAusente: string): string {
  const coincidencia = bloque.match(new RegExp(`${nombreDeToken}:\\s*([^;]+);`))
  if (!coincidencia) {
    throw new Error(mensajeSiAusente)
  }
  return (coincidencia[PRIMERA_CAPTURA] as string).trim()
}

/**
 * Valor declarado de CUALQUIER token dentro del bloque de `variante`, tal
 * cual lo escribe el fichero y sin interpretarlo. Existe porque
 * `--sombra-reposo`/`--sombra-elevada` valen una lista con `rgba()` y
 * `leerTokenDeVariante` solo admite un hexadecimal de 6 dígitos (@s1, @s2 —
 * PENDIENTE 12 del contrato). El lector estricto NO se relaja: los dos
 * conviven.
 */
export function leerDeclaracionDeVariante(textoScss: string, variante: string, nombreDeToken: NombreDeToken): string {
  const bloque = extraerBloqueDeVariante(textoScss, variante)
  return leerDeclaracionDelBloque(
    bloque,
    nombreDeToken,
    `no se encontró el token "${nombreDeToken}" para la variante "${variante}"`,
  )
}

/**
 * Si `variante` declara `nombreDeToken` en su PROPIO bloque, sin heredarlo
 * (@s2). Los dos puntos del patrón no son decorativos: `--color-borde:` no
 * casa dentro de `--color-borde-control: …`, así que un rol nunca se
 * confunde con otro que comparte el mismo prefijo.
 */
export function declaraTokenEnVariante(textoScss: string, variante: string, nombreDeToken: NombreDeToken): boolean {
  const bloque = extraerBloqueDeVariante(textoScss, variante)
  return new RegExp(`${nombreDeToken}:\\s*[^;]+;`).test(bloque)
}

/** Un token del inventario ausente en el bloque propio de una variante (@s2). */
export interface TokenFaltante {
  readonly variante: string
  readonly token: NombreDeToken
}

export interface InformeInventarioDeTokens {
  readonly pasa: boolean
  readonly paresComprobados: number
  readonly faltantes: readonly TokenFaltante[]
}

const CERO_PARES = 0

/**
 * Comprueba que cada token del inventario esté declarado en el bloque PROPIO
 * de cada variante — nunca heredado en silencio de otra — y falla cerrada si
 * el catálogo de variantes o el de tokens está vacío, en vez de dar
 * "0 de 0" por bueno (@s2, patrón `verde-por-vacuidad-en-puerta-de-verificacion`).
 */
export function comprobarInventarioDeTokens(
  textoScss: string,
  variantes: readonly string[],
  tokens: readonly NombreDeToken[],
): InformeInventarioDeTokens {
  const pares = variantes.flatMap((variante) => tokens.map((token) => ({ variante, token })))
  const faltantes = pares.filter(({ variante, token }) => !declaraTokenEnVariante(textoScss, variante, token))

  return { pasa: pares.length > CERO_PARES && faltantes.length === CERO_PARES, paresComprobados: pares.length, faltantes }
}

const PATRON_ROOT_SIN_ATRIBUTO = /:root\s*\{([^}]*)\}/

/**
 * El bloque `:root` SIN `[data-variante]` de `_tokens.scss`: la red de
 * seguridad de runtime para cuando el atributo no llega a aplicarse (JS
 * deshabilitado). No es una quinta variante: `PATRON_SELECTOR_VARIANTE` solo
 * matchea `:root[data-variante=…]`, así que este bloque queda fuera del
 * inventario de `extraerVariantesDeTokens` (paso 2 de `plan_adaptacion_scss.md`).
 */
function extraerBloqueRaizSinAtributo(textoScss: string): string {
  const coincidencia = textoScss.match(PATRON_ROOT_SIN_ATRIBUTO)
  if (!coincidencia) {
    throw new Error('no se encontró ningún bloque ":root" sin atributo en el texto de tokens')
  }
  return coincidencia[1] as string
}

/** Valor real (en mayúsculas) del token `--color-<rol>` dentro del `:root` sin atributo. */
export function leerTokenDeRaizSinAtributo(textoScss: string, rol: RolDeColor): string {
  const bloque = extraerBloqueRaizSinAtributo(textoScss)
  return leerTokenDelBloque(bloque, rol, `no se encontró el token "--color-${rol}" en el ":root" sin atributo`)
}

/**
 * Valor declarado de CUALQUIER token dentro del `:root` sin atributo, tal cual
 * lo escribe el fichero. Mismo motivo que `leerDeclaracionDeVariante`: las dos
 * sombras del inventario no son hexadecimales, y @s12 exige comparar los
 * VEINTE tokens del bloque de emergencia con los de la variante por defecto,
 * no solo los de color.
 */
export function leerDeclaracionDeRaizSinAtributo(textoScss: string, nombreDeToken: NombreDeToken): string {
  const bloque = extraerBloqueRaizSinAtributo(textoScss)
  return leerDeclaracionDelBloque(bloque, nombreDeToken, `no se encontró el token "${nombreDeToken}" en el ":root" sin atributo`)
}

/** Una fila de la matriz de uso: qué rol se pinta sobre qué fondo, y con qué uso WCAG (@s5, @s6, @s7). */
export interface EntradaDeMatrizDeUso {
  readonly rol: RolDeColor
  readonly fondo: RolDeColor
  readonly uso: UsoDeColor
}

