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
import { SERVICIOS } from './servicios'

export interface CampanaDemo {
  readonly titulo: string
  readonly imagen?: string
  /** No confirmado por el cliente. Declararlo hace fallar la construcción del modelo (@s9). */
  readonly precio?: string
  /** No confirmado por el cliente. Declararlo hace fallar la construcción del modelo (@s10). */
  readonly vigencia?: string
  /**
   * Identificador de la campaña para "/campanas?campana=<id>"
   * (`features/pagina_campanas.feature`). Opcional para no romper los
   * literales de test ya aprobados de `campanas_portada` (que no lo
   * declaran): `CAMPANAS_DEMO`, el catálogo real, sí lo rellena para sus 3
   * entradas.
   */
  readonly id?: string
  /**
   * Título del bloque de `src/data/servicios.ts` del que procede esta
   * campaña (`features/pagina_campanas.feature`, tabla de cabecera). Mismo
   * motivo de opcionalidad que `id`.
   */
  readonly bloque?: string
  /**
   * Puntos que la ficha transcribe literalmente, derivados de `SERVICIOS`
   * (nunca retipeados a mano). Mismo motivo de opcionalidad que `id`.
   */
  readonly puntos?: readonly string[]
  /** No confirmado por el cliente. Declararlo hace fallar la construcción del catálogo de la página (@s35). */
  readonly plazas?: string
  /** No confirmado por el cliente. Declararlo hace fallar la construcción del catálogo de la página (@s40). */
  readonly duracion?: string
}

/** Puntos publicados de un bloque de `SERVICIOS`, por su título exacto. Lanza si el bloque no existe: un error de programación propio (typo en `bloque`), no un dato de negocio ausente. */
function puntosDelBloque(bloque: string): readonly string[] {
  const encontrado = SERVICIOS.find((candidato) => candidato.titulo === bloque)
  if (encontrado === undefined) {
    throw new Error(`No existe el bloque de servicios "${bloque}" en SERVICIOS`)
  }
  return encontrado.puntos
}

const BLOQUE_MEDICINA_GENERAL = 'Medicina general'
const BLOQUE_ESPECIALIDADES = 'Especialidades'

export const CAMPANAS_DEMO: readonly CampanaDemo[] = [
  {
    id: 'vacunaciones',
    titulo: 'Vacunaciones',
    imagen: '/img/campanas/vacunaciones.webp',
    bloque: BLOQUE_MEDICINA_GENERAL,
    puntos: puntosDelBloque(BLOQUE_MEDICINA_GENERAL),
  },
  {
    id: 'chequeo',
    titulo: 'Chequeo',
    imagen: '/img/campanas/chequeo.webp',
    bloque: BLOQUE_MEDICINA_GENERAL,
    puntos: puntosDelBloque(BLOQUE_MEDICINA_GENERAL),
  },
  {
    id: 'odontologia',
    titulo: 'Odontología',
    imagen: '/img/campanas/odontologia.webp',
    bloque: BLOQUE_ESPECIALIDADES,
    puntos: puntosDelBloque(BLOQUE_ESPECIALIDADES),
  },
] as const satisfies readonly CampanaDemo[]
