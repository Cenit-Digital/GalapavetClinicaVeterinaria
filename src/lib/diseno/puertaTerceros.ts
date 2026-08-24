/**
 * La puerta de build de terceros (nivel B-2, `plan_adaptacion_scss.md` §4.2 y
 * §5 paso 7): ningún fichero de `dist/` puede contener una referencia a un
 * dominio de terceros — `fonts.googleapis.com`, `fonts.gstatic.com`, el
 * banco de imágenes (`images.pexels.com`) — porque eso es exactamente lo que
 * el contrato prohíbe (Decisión 9, `project-spec.md` → identidad_visual,
 * "Cero peticiones a terceros"). Mide el CSS ya COMPILADO y minificado, no
 * los `import` de `src/`: un dominio de terceros que entrara por otra vía
 * (una dependencia, una copia-pega) también se cazaría aquí.
 *
 * Módulo PURO: no toca `node:fs`. El humilde cableado a disco vive en
 * `tools/puerta-terceros.ts`, fuera del glob de mutación de Stryker.
 */

/** Un fichero ya compilado de `dist/`, con su ruta y su texto real. */
export interface ArchivoDeSalida {
  readonly ruta: string
  readonly contenido: string
}

/** Un dominio de terceros encontrado dentro de un fichero de `dist/`. */
export interface HallazgoDeTercero {
  readonly ruta: string
  readonly dominio: string
}

export interface InformePuertaDeTerceros {
  readonly pasa: boolean
  readonly archivosInspeccionados: number
  readonly hallazgos: readonly HallazgoDeTercero[]
  readonly motivo?: string
}

/**
 * Los dominios de terceros que el contrato prohíbe citar en el CSS servido
 * (Decisión 9): las dos fuentes de Google Fonts, nunca autoalojadas por este
 * proyecto, y el banco de imágenes que las 24 fotografías de demostración
 * usan como fuente pero nunca como origen servido.
 */
export const DOMINIOS_DE_TERCEROS_PROHIBIDOS: readonly string[] = ['fonts.googleapis.com', 'fonts.gstatic.com', 'images.pexels.com']

const CERO = 0

function motivoDeDistVacio(): string {
  return 'no se inspeccionó ningún archivo: dist/ está vacío (0 archivos)'
}

function motivoDeDominiosVacios(): string {
  return 'no se comprobó ningún dominio prohibido: la lista de dominios está vacía'
}

function hallazgosDelArchivo(archivo: ArchivoDeSalida, dominiosProhibidos: readonly string[]): readonly HallazgoDeTercero[] {
  return dominiosProhibidos.filter((dominio) => archivo.contenido.includes(dominio)).map((dominio) => ({ ruta: archivo.ruta, dominio }))
}

/**
 * Falla cerrada dos veces (patrón `verde-por-vacuidad-en-puerta-de-verificacion`):
 * ni "dist/ vacío" ni "lista de dominios vacía" pueden dar "pasa" por no
 * haber mirado nada. Con las dos listas no vacías, señala cada (archivo,
 * dominio) donde aparece una referencia prohibida.
 */
export function ejecutarPuertaDeTerceros(archivos: readonly ArchivoDeSalida[], dominiosProhibidos: readonly string[]): InformePuertaDeTerceros {
  if (archivos.length === CERO) {
    return { pasa: false, archivosInspeccionados: CERO, hallazgos: [], motivo: motivoDeDistVacio() }
  }
  if (dominiosProhibidos.length === CERO) {
    return { pasa: false, archivosInspeccionados: archivos.length, hallazgos: [], motivo: motivoDeDominiosVacios() }
  }

  const hallazgos = archivos.flatMap((archivo) => hallazgosDelArchivo(archivo, dominiosProhibidos))

  return { pasa: hallazgos.length === CERO, archivosInspeccionados: archivos.length, hallazgos }
}
