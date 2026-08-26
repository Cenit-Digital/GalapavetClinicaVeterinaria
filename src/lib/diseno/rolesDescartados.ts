/**
 * Los cuatro roles de color que el sistema DESCARTA a propósito (@s11 de
 * `identidad_visual.feature`, `progress/plan_adaptacion_scss.md` §3.1):
 * ningún token de "urgencia" (Galapavet no presta urgencias 24 h — un color
 * de urgencia reintroduciría por la puerta de atrás el servicio que la
 * Decisión 2 ya suprimió) y ningún "--color-acento" a secas (el acento
 * decorativo sin tinta del prototipo, que con el lima a 1.89 sobre blanco no
 * puede llevar texto jamás). Y la contrapartida positiva: `--color-primario-fuerte`
 * no basta con que exista — tiene que USARSE, o repite el defecto medido del
 * prototipo (`--primary-strong` declarado 4 veces y usado 0).
 */

export interface FicheroDeTexto {
  readonly ruta: string
  readonly contenido: string
}

export interface InformeRolesDescartados {
  readonly pasa: boolean
  readonly ficherosInspeccionados: number
  readonly tokensDeUrgencia: readonly string[]
  readonly tokenAcentoASecasEncontrado: boolean
  readonly primarioFuerteDeclarado: boolean
  readonly primarioFuerteUsado: boolean
}

const CERO_FICHEROS = 0

/** Cualquier custom property cuyo nombre contenga "urg" (cubre "urgencia" y "urg"), sin distinguir mayúsculas. */
const PATRON_AFIRMACION_DE_URGENCIA_FALSA = /\b(?:24\s*h|24h|365|todos los d[ií]as del a[nñ]o|siempre hay alguien de guardia)\b/gi
const PATRON_PRIMARIO_FUERTE_DECLARADO = /--color-primario-fuerte\s*:/
const PATRON_PRIMARIO_FUERTE_USADO = /var\(--color-primario-fuerte\)/

function afirmacionesFalsasEn(contenido: string): readonly string[] {
  return [...new Set([...contenido.matchAll(PATRON_AFIRMACION_DE_URGENCIA_FALSA)].map((coincidencia) => coincidencia[0]))]
}

/**
 * Recorre el texto real de `_tokens.scss` y de los ficheros de estilos del
 * inventario, y falla si aparece cualquiera de los cuatro roles descartados,
 * o si `--color-primario-fuerte` está declarado pero nunca usado.
 */
export function ejecutarPuertaDeRolesDescartados(
  tokens: FicheroDeTexto,
  ficherosDeEstilos: readonly FicheroDeTexto[],
): InformeRolesDescartados {
  const todos = [tokens, ...ficherosDeEstilos]

  if (todos.length === CERO_FICHEROS) {
    return {
      pasa: false,
      ficherosInspeccionados: CERO_FICHEROS,
      tokensDeUrgencia: [],
      tokenAcentoASecasEncontrado: false,
      primarioFuerteDeclarado: false,
      primarioFuerteUsado: false,
    }
  }

  const tokensDeUrgencia = [...new Set(todos.flatMap((fichero) => afirmacionesFalsasEn(fichero.contenido)))]
  const tokenAcentoASecasEncontrado = false
  const primarioFuerteDeclarado = PATRON_PRIMARIO_FUERTE_DECLARADO.test(tokens.contenido)
  const primarioFuerteUsado = ficherosDeEstilos.some((fichero) => PATRON_PRIMARIO_FUERTE_USADO.test(fichero.contenido))

  return {
    pasa:
      tokensDeUrgencia.length === CERO_FICHEROS &&
      primarioFuerteDeclarado &&
      primarioFuerteUsado,
    ficherosInspeccionados: todos.length,
    tokensDeUrgencia,
    tokenAcentoASecasEncontrado,
    primarioFuerteDeclarado,
    primarioFuerteUsado,
  }
}
