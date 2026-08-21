/**
 * Catálogo de demostración de las campañas de salud destacadas en la
 * portada. Contenido editorial y de catálogo de la demo bajo la Decisión
 * 1(b) de `project-spec.md`: Galapavet no ha confirmado ninguna campaña
 * (`docs/datos-galapavet.md` §7/§9), así que estas tres entradas están
 * construidas sobre servicios que la clínica SÍ presta y publica
 * (`src/data/servicios.ts`: "Vacunaciones" y "Chequeo" en "Medicina
 * general"; "Odontología" en "Cirugía y anestesia"/"Especialidades").
 * Ninguna entrada declara `precio` ni `vigencia`:
 * `construirModeloCampanas` (`CampanasPortada-logica.ts`) lanza si alguna lo
 * hiciera (@s9/@s10).
 *
 * PENDIENTE: los ficheros de imagen locales concretos no existen aún en el
 * repositorio — rutas provisionales, mismo PENDIENTE que
 * `src/data/galeria.ts`.
 */
export interface CampanaDemo {
  readonly titulo: string
  readonly imagen?: string
  /** No confirmado por el cliente. Declararlo hace fallar la construcción del modelo (@s9). */
  readonly precio?: string
  /** No confirmado por el cliente. Declararlo hace fallar la construcción del modelo (@s10). */
  readonly vigencia?: string
}

export const CAMPANAS_DEMO: readonly CampanaDemo[] = [
  { titulo: 'Vacunaciones', imagen: '/img/campanas/vacunaciones.webp' },
  { titulo: 'Chequeo', imagen: '/img/campanas/chequeo.webp' },
  { titulo: 'Odontología', imagen: '/img/campanas/odontologia.webp' },
] as const satisfies readonly CampanaDemo[]
