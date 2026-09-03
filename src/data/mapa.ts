/**
 * El mapa estático LOCAL de la sección de contacto (Decisión 63 de
 * `project-spec.md`, `fidelidad_contacto` @s4). Procedencia y licencia en
 * `docs/mapa-estatico.md`: mosaico de 12 teselas de OpenStreetMap (zoom 16,
 * x 32038–32041, y 24671–24673) compuesto en 1024×768 y recortado a 1024×520
 * desde y = 198. Datos © OpenStreetMap contributors, ODbL 1.0: la atribución
 * tiene que verse junto al mapa. Sustituye al marco embebido de un tercero:
 * el sitio vuelve a no hacer ni una sola petición fuera del propio origen.
 *
 * El pin NO va pintado en la imagen: se coloca en CSS con la posición que
 * `posicionDelPin` (`InformacionContacto-logica.ts`) deriva de las
 * coordenadas de la fuente única (`src/lib/site.ts`) y de este encuadre.
 */

/** Cómo se compuso la imagen: tesela superior izquierda del mosaico, recorte y tamaño final. */
export interface EncuadreDeMapa {
  readonly zoom: number
  readonly teselaX: number
  readonly teselaY: number
  readonly recorteY: number
  readonly ancho: number
  readonly alto: number
}

export interface MapaEstatico {
  readonly ruta: string
  readonly encuadre: EncuadreDeMapa
  readonly atribucion: string
  readonly urlDeLicencia: string
}

export const MAPA_ESTATICO: MapaEstatico = {
  ruta: '/img/mapa/galapagar.webp',
  encuadre: { zoom: 16, teselaX: 32038, teselaY: 24671, recorteY: 198, ancho: 1024, alto: 520 },
  atribucion: '© OpenStreetMap contributors',
  urlDeLicencia: 'https://www.openstreetmap.org/copyright',
}
