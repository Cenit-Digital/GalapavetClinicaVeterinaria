/**
 * Puerta de nivel A del paso 6 y del paso 8 del plan (`identidad_visual`,
 * feature 22): compara las rutas de fuente y de imagen que el CÓDIGO declara
 * contra los ficheros REALES que existen en `public/`. Existe por el mismo
 * diagnóstico del 23/08/2026 que motiva toda la feature: `public/` no existía
 * y los 26 huecos de imagen del código, el logo del pie y el favicon daban
 * 404 — y ninguna prueba lo veía porque nada comparaba la lista declarada
 * contra el árbol de ficheros real.
 *
 * Fail-closed a propósito (mismo patrón que `ejecutarPuertaDeContraste` de
 * `src/lib/contraste.ts` y `ejecutarPuertaDeTerceros` de `puertaTerceros.ts`):
 * ni una lista de rutas declaradas vacía ni una lista de ficheros reales
 * vacía puede dar "pasa" por vacuidad, porque eso sería exactamente el
 * verde-por-vacuidad que esta feature existe para destapar.
 */

/** Toda ruta local de imagen entre comillas: `/img/<algo>.<extensión-de-imagen>`. */
const PATRON_RUTA_DE_IMAGEN = /['"](\/img\/[^'"]+\.(?:webp|png|jpe?g|svg))['"]/g

/** Toda ruta local de fuente que un `@font-face` real (no de respaldo) referencia con `url(...)`. */
const PATRON_RUTA_DE_FUENTE = /url\('(\/fuentes\/[^']+\.woff2)'\)/g

function extraerConPatron(textos: readonly string[], patron: RegExp): readonly string[] {
  const rutas = new Set<string>()
  for (const texto of textos) {
    for (const coincidencia of texto.matchAll(patron)) {
      rutas.add(coincidencia[1] as string)
    }
  }
  return [...rutas].toSorted()
}

/** Las rutas de imagen local declaradas como literal de cadena en un conjunto de textos fuente, sin repetir. */
export function extraerRutasDeImagenDeclaradas(textos: readonly string[]): readonly string[] {
  return extraerConPatron(textos, PATRON_RUTA_DE_IMAGEN)
}

/** Las rutas de fuente local que las `@font-face` reales de un texto SCSS referencian con `url(...)`, sin repetir. */
export function extraerRutasDeFuenteDeclaradas(textoScss: string): readonly string[] {
  return extraerConPatron([textoScss], PATRON_RUTA_DE_FUENTE)
}

export interface InformeInventarioDeActivos {
  readonly pasa: boolean
  readonly rutasDeclaradas: number
  readonly rutasFaltantes: readonly string[]
}

const CERO_RUTAS = 0

/**
 * Compara cada ruta declarada contra el catálogo de ficheros reales servidos
 * desde `public/`. Sirve igual para imágenes que para fuentes: ambas son
 * "una ruta declarada tiene que tener un fichero real detrás".
 */
export function compararRutasDeclaradasConFicherosReales(rutasDeclaradas: readonly string[], rutasRealesDePublic: readonly string[]): InformeInventarioDeActivos {
  const catalogoReal = new Set(rutasRealesDePublic)
  const rutasFaltantes = rutasDeclaradas.filter((ruta) => !catalogoReal.has(ruta))

  return {
    pasa: rutasDeclaradas.length > CERO_RUTAS && rutasRealesDePublic.length > CERO_RUTAS && rutasFaltantes.length === CERO_RUTAS,
    rutasDeclaradas: rutasDeclaradas.length,
    rutasFaltantes,
  }
}
