/**
 * Gemelo puro y testeable de la técnica de `rafgraph/spa-github-pages`
 * (Decisión 49, MIT License, <https://github.com/rafgraph/spa-github-pages>).
 * `codificarRedireccion404` espeja el script de `public/404.html`:
 * GitHub Pages sirve ese fichero ante cualquier ruta que no existe como
 * fichero real, y el script codifica `pathname`/`search`/`hash` en la query
 * string antes de redirigir a la raíz del sitio de proyecto.
 * `decodificarRedireccion404` espeja el segundo script, en `index.html`:
 * reconstruye la ruta original con `history.replaceState` antes de que
 * `BrowserRouter` monte. Mismo patrón que el resto del repo usa para scripts
 * inline que no pueden importar código: «espejado por un gemelo puro
 * testeable» (Decisión 8).
 */

/**
 * Sitio de PROYECTO (no de usuario/organización): el primer segmento de
 * cualquier ruta es siempre el nombre del repositorio, y hay que
 * conservarlo. El literal no necesita conocer el NOMBRE del repositorio,
 * solo su profundidad (@s9).
 */
export const SEGMENTOS_DE_SUBPATH_A_CONSERVAR = 1

export interface RutaCompleta {
  /** Siempre empieza por "/", igual que "window.location.pathname". */
  readonly pathname: string
  /** Cadena vacía si no hay query, o empieza por "?", igual que "window.location.search". */
  readonly search: string
  /** Cadena vacía si no hay hash, o empieza por "#", igual que "window.location.hash". */
  readonly hash: string
}

const SEPARADOR_DE_SEGMENTOS = '/'
const PREFIJO_DE_QUERY_CODIFICADA = '?/'
const MARCADOR_DE_AMPERSAND = '~and~'
const PATRON_AMPERSAND_LITERAL = /&/g
const PATRON_MARCADOR_DE_AMPERSAND = /~and~/g

/** Escapa cada "&" para que no se confunda con el separador que añade la propia codificación. */
function escaparAmpersands(texto: string): string {
  return texto.replace(PATRON_AMPERSAND_LITERAL, MARCADOR_DE_AMPERSAND)
}

/** Inversa de `escaparAmpersands`. */
function restaurarAmpersands(texto: string): string {
  return texto.replace(PATRON_MARCADOR_DE_AMPERSAND, '&')
}

/** Espejo puro del script de "public/404.html" (@s9). */
export function codificarRedireccion404(ruta: RutaCompleta): RutaCompleta {
  const segmentos = ruta.pathname.split(SEPARADOR_DE_SEGMENTOS)
  const prefijoConservado = segmentos.slice(0, 1 + SEGMENTOS_DE_SUBPATH_A_CONSERVAR).join(SEPARADOR_DE_SEGMENTOS)
  const restoDeRuta = escaparAmpersands(
    ruta.pathname.slice(1).split(SEPARADOR_DE_SEGMENTOS).slice(SEGMENTOS_DE_SUBPATH_A_CONSERVAR).join(SEPARADOR_DE_SEGMENTOS),
  )
  const queryOriginalCodificada = ruta.search === '' ? '' : `&${escaparAmpersands(ruta.search.slice(1))}`

  return {
    pathname: `${prefijoConservado}${SEPARADOR_DE_SEGMENTOS}`,
    search: `${PREFIJO_DE_QUERY_CODIFICADA}${restoDeRuta}${queryOriginalCodificada}`,
    hash: ruta.hash,
  }
}

/** Espejo puro del segundo script, en "index.html" (@s10). */
export function decodificarRedireccion404(ruta: RutaCompleta): RutaCompleta {
  if (ruta.search[1] !== '/') {
    return ruta
  }

  const rutaDecodificada = ruta.search
    .slice(1)
    .split('&')
    .map((segmento) => restaurarAmpersands(segmento))
    .join('?')
  const urlReconstruida = new URL(`${ruta.pathname.slice(0, -1)}${rutaDecodificada}${ruta.hash}`, 'http://localhost')

  return {
    pathname: urlReconstruida.pathname,
    search: urlReconstruida.search,
    hash: urlReconstruida.hash,
  }
}
