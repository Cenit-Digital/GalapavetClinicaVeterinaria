/**
 * Puerta anti-teléfono-hardcodeado: ningún módulo de la web escribe un
 * teléfono a mano fuera de la fuente única (`src/lib/site.ts`).
 */

export interface FicheroCodigo {
  ruta: string
  contenido: string
}

export interface HallazgoTelefono {
  ruta: string
  telefono: string
}

export interface InformePuertaTelefonoHardcodeado {
  pasa: boolean
  ficherosInspeccionados: number
  hallazgos: readonly HallazgoTelefono[]
  motivo?: string
}

const CERO_FICHEROS = 0
const CERO_HALLAZGOS = 0

/** Separador opcional entre dígitos: espacio, punto o guion. */
const SEPARADOR = '[ .-]?'

/** Secuencia con forma de teléfono español: 9 dígitos empezando por 6, 7, 8 o 9, con o sin prefijo "+34" y con o sin separadores. */
const PATRON_TELEFONO_ESPANOL = new RegExp(`(?:\\+34${SEPARADOR})?[6789](?:${SEPARADOR}\\d){8}`, 'g')

function motivoDeVacuidad(): string {
  return 'no se inspeccionó ningún fichero de código: se inspeccionaron 0 ficheros'
}

function hallazgosDelFichero(fichero: FicheroCodigo): readonly HallazgoTelefono[] {
  const coincidencias = fichero.contenido.match(PATRON_TELEFONO_ESPANOL) ?? []
  return coincidencias.map((telefono) => ({ ruta: fichero.ruta, telefono }))
}

/**
 * Busca secuencias con forma de teléfono español en cada fichero y falla
 * cerrada si no inspecciona ninguno (nunca "0 ficheros inspeccionados" en
 * verde).
 */
export function ejecutarPuertaTelefonoHardcodeado(
  ficheros: readonly FicheroCodigo[],
): InformePuertaTelefonoHardcodeado {
  if (ficheros.length === CERO_FICHEROS) {
    return { pasa: false, ficherosInspeccionados: CERO_FICHEROS, hallazgos: [], motivo: motivoDeVacuidad() }
  }

  const hallazgos = ficheros.flatMap(hallazgosDelFichero)

  return { pasa: hallazgos.length === CERO_HALLAZGOS, ficherosInspeccionados: ficheros.length, hallazgos }
}
