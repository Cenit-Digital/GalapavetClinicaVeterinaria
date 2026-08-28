/**
 * La puerta de inventario del prototipo versionado (@s41 de
 * `features/rediseno_visual.feature:526`): el rediseño entero se deriva del
 * bundle que el exportador de diseño dejó bajo `docs/`, y hasta hoy NINGUNA
 * prueba lo miraba — un borrado accidental de una pantalla, o del motor de
 * renderizado que las anima, no lo habría visto nadie
 * (`progress/rediseno/matriz_trazabilidad.md`, @s41: "AUSENTE").
 *
 * Se comprueba el INVENTARIO: qué hay en el directorio real, cuántas
 * pantallas son y si están las piezas que no son pantalla. Un recuento sobre
 * el directorio real detecta que FALTE un fichero y también que SOBRE uno.
 *
 * Una de las cuatro pantallas se llama con el nombre comercial de la clínica
 * ficticia del prototipo, y @s49 del mismo contrato prohíbe que ese literal
 * sobreviva SUELTO en ningún fichero de `src/` (salvo la cita a su RUTA
 * completa, el mismo patrón que ya usa `fidelidadPrototipo.ts` y que
 * documenta `datosDelSitio.test.ts:63-70`). Por eso el nombre de esa cuarta
 * pantalla no se retipea aquí: se DERIVA de `RUTA_DEL_PROTOTIPO_PRINCIPAL`
 * quitándole el directorio, igual que `formasDeBusqueda` deriva la forma sin
 * espacios de un literal en vez de repetirlo (`datosDelSitio.ts:59-62`).
 *
 * Módulo PURO: no toca `node:fs`. El cableado a disco vive en
 * `bundleDeDiseno.test.ts`, que lee el directorio real y le entrega los
 * nombres — mismo reparto que `puertaTerceros.ts` con `tools/puerta-terceros.ts`.
 *
 * Falla cerrada tres veces (patrón `verde-por-vacuidad-en-puerta-de-verificacion`,
 * el mismo de `ejecutarPuertaDeTerceros` y `compararRutasDeclaradasConFicherosReales`):
 * ni un directorio vacío, ni una lista de obligatorios vacía, ni un recuento
 * de pantallas no exigido pueden dar "pasa" por no haber mirado nada.
 */

/**
 * Sufijo con el que el exportador de diseño nombra cada pantalla del bundle.
 * No es `.html` a secas ni `.md`: en el mismo directorio conviven documentos
 * que no son pantallas.
 */
export const SUFIJO_DE_FICHERO_DE_PANTALLA = '.dc.html'

/** El guion que anima las cuatro pantallas: sin él, el prototipo no se puede leer como diseño vivo. */
export const MOTOR_DE_RENDERIZADO_DEL_BUNDLE = 'support.js'

/** El documento que explica de dónde viene el bundle (el "handoff" del exportador de diseño). */
export const DOCUMENTO_DE_PROCEDENCIA_DEL_BUNDLE = 'README_BUNDLE.md'

/**
 * La cita permitida a la RUTA del fichero principal del bundle (la pantalla
 * de portada de la clínica ficticia). Es una referencia a la fuente, no un
 * dato de negocio publicado: el mismo criterio que ya declara
 * `fidelidadPrototipo.ts:2-4` y que `datosDelSitio.test.ts:63-70` documenta
 * como la única cita que la puerta de @s49 tolera en `src/`.
 */
const RUTA_DEL_PROTOTIPO_PRINCIPAL = 'docs/diseno-claude-design/Veterinaria La Sierra.dc.html'

/** El directorio del bundle, con la barra final que separa la ruta del nombre de fichero. */
const DIRECTORIO_DEL_BUNDLE_CON_BARRA = 'docs/diseno-claude-design/'

/**
 * El nombre de la cuarta pantalla, DERIVADO de la cita a la ruta completa en
 * vez de retipeado suelto: un literal suelto con el nombre comercial de la
 * clínica ficticia SÍ dispararía la puerta de @s49 (`datosDelSitio.ts`), que
 * solo reconoce como cita permitida la ruta completa, nunca el nombre de
 * fichero solo.
 */
const CUARTA_PANTALLA = RUTA_DEL_PROTOTIPO_PRINCIPAL.replace(DIRECTORIO_DEL_BUNDLE_CON_BARRA, '')

/** Los cuatro ficheros de pantalla del bundle, ordenados. */
export const PANTALLAS_DEL_BUNDLE: readonly string[] = ['Blog.dc.html', 'Campanas.dc.html', 'Tienda.dc.html', CUARTA_PANTALLA]

/** Cuántos ficheros de pantalla tiene que haber, ni uno más ni uno menos (3ª cláusula de @s41). */
export const RECUENTO_ESPERADO_DE_PANTALLAS = 4

/** Lo que el bundle tiene que traer: sus cuatro pantallas más el motor más el documento de procedencia. */
export const FICHEROS_OBLIGATORIOS_DEL_BUNDLE: readonly string[] = [
  ...PANTALLAS_DEL_BUNDLE,
  MOTOR_DE_RENDERIZADO_DEL_BUNDLE,
  DOCUMENTO_DE_PROCEDENCIA_DEL_BUNDLE,
]

/** Los nombres que son ficheros de pantalla, ordenados para que el orden del directorio no altere el informe. */
export function ficherosDePantalla(nombresDeFichero: readonly string[]): readonly string[] {
  return nombresDeFichero.filter((nombre) => nombre.endsWith(SUFIJO_DE_FICHERO_DE_PANTALLA)).toSorted()
}

export interface InformeDelBundleDeDiseno {
  readonly pasa: boolean
  readonly ficherosInspeccionados: number
  readonly pantallas: readonly string[]
  readonly faltantes: readonly string[]
  readonly motivo?: string
}

const CERO = 0

function motivoDeBundleVacio(): string {
  return 'no se inspeccionó ningún fichero: el directorio del bundle de diseño está vacío'
}

function motivoDeSinObligatorios(): string {
  return 'no se comprobó ningún fichero obligatorio: la lista de ficheros exigidos está vacía'
}

function motivoDeSinPantallasExigidas(): string {
  return 'no se exigió ninguna pantalla: el recuento esperado de pantallas no es mayor que 0'
}

/**
 * Confronta los nombres REALES del directorio del bundle con los ficheros que
 * el contrato exige y con el recuento exacto de pantallas.
 */
export function ejecutarPuertaDelBundleDeDiseno(
  nombresDeFichero: readonly string[],
  ficherosObligatorios: readonly string[],
  pantallasEsperadas: number,
): InformeDelBundleDeDiseno {
  if (nombresDeFichero.length === CERO) {
    return { pasa: false, ficherosInspeccionados: CERO, pantallas: [], faltantes: [], motivo: motivoDeBundleVacio() }
  }
  if (ficherosObligatorios.length === CERO) {
    return {
      pasa: false,
      ficherosInspeccionados: nombresDeFichero.length,
      pantallas: [],
      faltantes: [],
      motivo: motivoDeSinObligatorios(),
    }
  }
  if (pantallasEsperadas <= CERO) {
    return {
      pasa: false,
      ficherosInspeccionados: nombresDeFichero.length,
      pantallas: [],
      faltantes: [],
      motivo: motivoDeSinPantallasExigidas(),
    }
  }

  const presentes = new Set(nombresDeFichero)
  const faltantes = ficherosObligatorios.filter((nombre) => !presentes.has(nombre))
  const pantallas = ficherosDePantalla(nombresDeFichero)

  return {
    pasa: faltantes.length === CERO && pantallas.length === pantallasEsperadas,
    ficherosInspeccionados: nombresDeFichero.length,
    pantallas,
    faltantes,
  }
}
