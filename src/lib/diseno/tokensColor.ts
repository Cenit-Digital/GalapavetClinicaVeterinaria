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
import { ejecutarPuertaDeContraste, type ParDeContraste } from '../contraste'

/** Cada variante de paleta declara estos tres roles de color, como mínimo. */
export type RolDeColor = 'fondo' | 'texto' | 'foco'

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

function extraerBloqueDeVariante(textoScss: string, variante: string): string {
  const patron = new RegExp(`:root\\[data-variante=['"]${variante}['"]\\]\\s*\\{([^}]*)\\}`)
  const coincidencia = textoScss.match(patron)
  if (!coincidencia) {
    throw new Error(`no se encontró ningún bloque ":root[data-variante='${variante}']" en el texto de tokens`)
  }
  return coincidencia[1] as string
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
  const patronToken = new RegExp(`--color-${rol}:\\s*(#[0-9a-fA-F]{6})\\s*;`)
  const coincidencia = bloque.match(patronToken)
  if (!coincidencia) {
    throw new Error(`no se encontró el token "--color-${rol}" para la variante "${variante}"`)
  }
  return (coincidencia[1] as string).toUpperCase()
}

const CERO_VARIANTES = 0

export interface InformeContrasteDeVariantes {
  readonly veredicto: 'aprobado' | 'suspenso'
  readonly variantesComprobadas: number
  readonly motivo?: string
}

function motivoDeVacuidadDeVariantes(): string {
  return 'no se comprobó ninguna variante: el catálogo de variantes está vacío'
}

/**
 * Comprobación de contraste de las variantes de paleta: reutiliza
 * `ejecutarPuertaDeContraste` de `contraste.ts` (ya `done`, ya probada al
 * 100 %) y falla cerrada si el catálogo está vacío, ANTES de delegarle nada
 * — un `catalogo.every(...)` sobre un array vacío da `true` por verdad
 * vacua, lo que produciría un "aprobado" falso sin esta guarda (@s11).
 */
export function ejecutarComprobacionDeContrasteDeVariantes(
  catalogo: readonly ParDeContraste[],
): InformeContrasteDeVariantes {
  if (catalogo.length === CERO_VARIANTES) {
    return { veredicto: 'suspenso', variantesComprobadas: CERO_VARIANTES, motivo: motivoDeVacuidadDeVariantes() }
  }

  const informe = ejecutarPuertaDeContraste(catalogo)
  return { veredicto: informe.pasa ? 'aprobado' : 'suspenso', variantesComprobadas: informe.parejasEvaluadas }
}
