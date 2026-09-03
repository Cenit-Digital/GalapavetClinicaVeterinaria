/**
 * LA PUERTA INVERTIDA (@s13 y @s16 de `features/rediseno_visual.feature`).
 *
 * Hasta el 26/08/2026 este módulo prohibía por NOMBRE los roles de urgencia y
 * el acento a secas (@s11 de `identidad_visual.feature`). El motivo era
 * correcto —«Urgencias 24 h · todos los días del año» es FALSO para Galapavet,
 * `docs/datos-galapavet.md:40-43`— pero la regla vigilaba la cosa equivocada:
 * prohibir el COLOR para impedir la MENTIRA dejó al sitio sin la mitad de su
 * vocabulario visual, y Galapavet SÍ presta urgencias fuera de horario, con un
 * teléfono real y publicado (`src/lib/site.ts:12`).
 *
 * La enmienda, decidida por el humano el 26/08/2026 y escrita en la cabecera
 * del contrato (`features/rediseno_visual.feature:52-60`): la puerta deja de
 * mirar el nombre del token y pasa a mirar la AFIRMACIÓN. Aquí viven las dos
 * mitades que quedan:
 *
 *  1. `ejecutarPuertaDeAfirmacionesFalsas` — ninguna cadena del texto visible
 *     de `src/` ni del artefacto de producción puede afirmar «24 h», «24h»,
 *     «365», «todos los días del año» ni «siempre hay alguien de guardia».
 *  2. `ejecutarPuertaDePrimarioFuerte` — la mitad BUENA de la regla anterior,
 *     que se conserva: `--color-primario-fuerte` no basta con que exista,
 *     tiene que USARSE, o repite el defecto medido del prototipo
 *     (`--primary-strong` declarado 4 veces y usado 0).
 *
 * El uso legítimo de `--color-acento` (solo relleno, nunca texto ni borde,
 * porque el lima da 1,89 sobre blanco) lo vigila `usoDelAcento.ts` (@s15).
 */

import { declaraTokenEnVariante } from './tokensColor'

/**
 * Las cinco afirmaciones clínicas que NINGÚN texto del sitio puede hacer,
 * escritas a mano desde `features/rediseno_visual.feature:262-263`. Son
 * falsas para este cliente: `docs/datos-galapavet.md:40-43` y `:94` dejan
 * claro que «Urgencias 24 h · todos los días del año» no es lo que Galapavet
 * presta. Lo que sí presta —urgencias FUERA DE HORARIO, con teléfono real—
 * vive en `src/lib/site.ts:12-13` y es lo único que el sitio puede rotular.
 */
export const AFIRMACIONES_CLINICAS_PROHIBIDAS: readonly string[] = [
  '24 h',
  '24h',
  '365',
  'todos los días del año',
  'siempre hay alguien de guardia',
]

export interface FicheroDeTexto {
  readonly ruta: string
  readonly contenido: string
}

const CERO_FICHEROS = 0
const CERO_HALLAZGOS = 0
const CERO_AFIRMACIONES = 0
const CERO_VARIANTES = 0

const PATRON_COMENTARIO_DE_BLOQUE = /\/\*[\s\S]*?\*\//g
const PATRON_COMENTARIO_DE_LINEA_COMPLETA = /^[ \t]*\/\/.*$/gm
// Stryker instrumenta cada expresión con llamadas como
// `stryMutAct_ab12("365")` y `stryCov_ab12("365", "366")`. Esos números
// son IDs internos, no texto servido ni una promesa de la clínica. El patrón
// exige el nombre generado Y una lista completa de IDs numéricos: un literal
// "365" escrito por la aplicación fuera de esa llamada sigue siendo visible
// para la puerta.
const PATRON_IDENTIFICADORES_STRYKER = /\bstry(?:MutAct|Cov)_[A-Za-z0-9_]+\(\s*(?:["']\d+["']\s*,?\s*)+\)/g
const SIN_TEXTO = ''

const CARACTERES_ESPECIALES_DE_REGEX = /[.*+?^${}()|[\]\\]/g

/** Escapa una afirmación antes de meterla en una `RegExp`: no lleva ninguno de estos caracteres hoy, pero una futura afirmación con paréntesis o punto no debe romper el patrón. */
function escapadaParaRegex(cadena: string): string {
  return cadena.replace(CARACTERES_ESPECIALES_DE_REGEX, '\\$&')
}

/**
 * "365" no puede delatar `--color-borde: #273650;` (`src/styles/_tokens.scss`,
 * Enmienda 1): esa "365" es una subcadena cruda de "273650", el hexadecimal
 * derivado del borde, no la afirmación clínica. La puerta busca la afirmación
 * como PALABRA suelta —con `\p{L}`/`\p{N}` Unicode, para que una tilde no
 * rompa el límite— así que "365" solo cuenta si no hay letra ni dígito pegado
 * justo antes o después. Una afirmación en prosa real («365 días», «365.»,
 * «365» a final de frase) conserva el límite de todos modos: lo que la rodea
 * ahí es un espacio, una puntuación o el final de la cadena, nunca otro
 * carácter alfanumérico.
 */
function comoAfirmacionDePalabraSuelta(afirmacionEnMinusculas: string): RegExp {
  const afirmacionEscapada = escapadaParaRegex(afirmacionEnMinusculas)
  return new RegExp(`(?<![\\p{L}\\p{N}])${afirmacionEscapada}(?![\\p{L}\\p{N}])`, 'u')
}

/**
 * El "texto visible" que pide el Then de @s13
 * (`features/rediseno_visual.feature:262`): el contenido del fichero sin sus
 * comentarios. Un comentario no llega jamás al usuario —el artefacto de
 * producción los borra, medido sobre `dist/`— y varios comentarios legítimos
 * del repositorio CITAN la afirmación prohibida precisamente para explicar
 * que está prohibida (`src/pages/PaginaBlog-logica.ts:62`).
 *
 * Solo se descarta el comentario de bloque y el de línea COMPLETA: una barra
 * doble en mitad de una línea puede ser una URL (`https://wa.me/`,
 * `src/lib/telefono.ts:44`) y recortar ahí podría esconder una afirmación
 * escrita detrás. La puerta recorta de menos a propósito.
 */
export function textoVisibleDe(contenido: string): string {
  return contenido
    .replace(PATRON_COMENTARIO_DE_BLOQUE, SIN_TEXTO)
    .replace(PATRON_IDENTIFICADORES_STRYKER, SIN_TEXTO)
    .replace(PATRON_COMENTARIO_DE_LINEA_COMPLETA, SIN_TEXTO)
}

/** Una afirmación prohibida encontrada, con el fichero exacto donde está escrita. */
export interface HallazgoDeAfirmacion {
  readonly ruta: string
  readonly afirmacion: string
}

export interface InformeDeAfirmacionesFalsas {
  readonly pasa: boolean
  readonly ficherosInspeccionados: number
  readonly hallazgos: readonly HallazgoDeAfirmacion[]
  readonly motivo?: string
}

const MOTIVO_SIN_AFIRMACIONES = 'la lista de afirmaciones prohibidas está vacía: no se comprobó ninguna'
const MOTIVO_SIN_FICHEROS = 'no se inspeccionó ningún fichero: el corpus está vacío'

/**
 * Las dos vacuidades que este repositorio trata como defecto
 * (`verde-por-vacuidad-en-puerta-de-verificacion`, y la última cláusula de
 * @s13): sin afirmaciones que buscar, o sin ficheros donde buscarlas, «cero
 * hallazgos» no significa «limpio» — significa «no se ha mirado».
 */
function vacuidadDe(
  ficheros: readonly FicheroDeTexto[],
  afirmacionesProhibidas: readonly string[],
): InformeDeAfirmacionesFalsas | undefined {
  if (afirmacionesProhibidas.length === CERO_AFIRMACIONES) {
    return { pasa: false, ficherosInspeccionados: ficheros.length, hallazgos: [], motivo: MOTIVO_SIN_AFIRMACIONES }
  }
  if (ficheros.length === CERO_FICHEROS) {
    return { pasa: false, ficherosInspeccionados: CERO_FICHEROS, hallazgos: [], motivo: MOTIVO_SIN_FICHEROS }
  }
  return undefined
}

/**
 * La puerta INVERTIDA de la enmienda (`features/rediseno_visual.feature:257-265`):
 * ya no vigila el NOMBRE de ningún token —`--color-urgencia` y `--color-acento`
 * son vocabulario visual legítimo— sino la AFIRMACIÓN falsa, en el texto real
 * de `src/` y en el del artefacto de producción.
 */
export function ejecutarPuertaDeAfirmacionesFalsas(
  ficheros: readonly FicheroDeTexto[],
  afirmacionesProhibidas: readonly string[],
): InformeDeAfirmacionesFalsas {
  const vacuidad = vacuidadDe(ficheros, afirmacionesProhibidas)
  if (vacuidad !== undefined) {
    return vacuidad
  }

  const hallazgos = ficheros.flatMap((fichero) => {
    // Sin distinguir mayúsculas: «Atención 24 H» miente exactamente igual que
    // «atención 24 h», y una puerta que solo viera una de las dos formas
    // invitaría a esquivarla con la tecla de bloqueo de mayúsculas.
    const visible = textoVisibleDe(fichero.contenido).toLocaleLowerCase()
    return afirmacionesProhibidas
      .filter((afirmacion) => comoAfirmacionDePalabraSuelta(afirmacion.toLocaleLowerCase()).test(visible))
      .map((afirmacion) => ({ ruta: fichero.ruta, afirmacion }))
  })

  return {
    pasa: hallazgos.length === CERO_HALLAZGOS,
    ficherosInspeccionados: ficheros.length,
    hallazgos,
  }
}

const TOKEN_PRIMARIO_FUERTE = '--color-primario-fuerte'
/** Un USO real del token: `var(--color-primario-fuerte)` o `var(--color-primario-fuerte, …)`. */
const PATRON_PRIMARIO_FUERTE_USADO = /var\(\s*--color-primario-fuerte\s*[,)]/

const MOTIVO_SIN_VARIANTES = 'no se comprobó ninguna variante: el catálogo está vacío'
const MOTIVO_SIN_ESTILOS = 'no se inspeccionó ningún fichero de estilos: el inventario está vacío'

export interface InformePrimarioFuerte {
  readonly pasa: boolean
  readonly variantesComprobadas: number
  readonly variantesSinDeclararlo: readonly string[]
  readonly ficherosDeEstiloInspeccionados: number
  readonly ficherosQueLoUsan: readonly string[]
  readonly motivo?: string
}

/**
 * La mitad BUENA de la regla anterior, que la enmienda conserva (@s16,
 * `features/rediseno_visual.feature:284-290`): `--color-primario-fuerte` tiene
 * que estar declarado en las cinco variantes Y usarse de verdad. Con que solo
 * esté declarado no basta: así es exactamente como el prototipo dejó muerto su
 * `--primary-strong` (declarado 4 veces, usado 0).
 */
export function ejecutarPuertaDePrimarioFuerte(
  tokens: FicheroDeTexto,
  variantes: readonly string[],
  ficherosDeEstilos: readonly FicheroDeTexto[],
): InformePrimarioFuerte {
  if (variantes.length === CERO_VARIANTES) {
    return {
      pasa: false,
      variantesComprobadas: CERO_VARIANTES,
      variantesSinDeclararlo: [],
      ficherosDeEstiloInspeccionados: ficherosDeEstilos.length,
      ficherosQueLoUsan: [],
      motivo: MOTIVO_SIN_VARIANTES,
    }
  }
  if (ficherosDeEstilos.length === CERO_FICHEROS) {
    return {
      pasa: false,
      variantesComprobadas: variantes.length,
      variantesSinDeclararlo: [],
      ficherosDeEstiloInspeccionados: CERO_FICHEROS,
      ficherosQueLoUsan: [],
      motivo: MOTIVO_SIN_ESTILOS,
    }
  }

  const variantesSinDeclararlo = variantes.filter(
    (variante) => !declaraTokenEnVariante(tokens.contenido, variante, TOKEN_PRIMARIO_FUERTE),
  )
  const ficherosQueLoUsan = ficherosDeEstilos
    .filter((fichero) => PATRON_PRIMARIO_FUERTE_USADO.test(fichero.contenido))
    .map((fichero) => fichero.ruta)

  return {
    pasa: variantesSinDeclararlo.length === CERO_VARIANTES && ficherosQueLoUsan.length > CERO_FICHEROS,
    variantesComprobadas: variantes.length,
    variantesSinDeclararlo,
    ficherosDeEstiloInspeccionados: ficherosDeEstilos.length,
    ficherosQueLoUsan,
  }
}
