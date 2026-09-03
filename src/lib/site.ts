/**
 * Fuente única canónica de los datos de negocio de Galapavet. Cada dato se
 * declara una sola vez; todas sus formas derivadas (texto visible, `tel:`,
 * `wa.me`, JSON-LD…) se calculan a partir de ese único valor. Fuente:
 * `docs/datos-galapavet.md`.
 */

import { enlaceLlamada, enlaceMensajeria } from './telefono'

const TELEFONO_CLINICA = '91 082 92 67'
const TELEFONO_MOVIL = '685 34 31 49'
const TELEFONO_URGENCIAS = '91 851 13 93'
const ROTULO_URGENCIAS = 'Urgencias fuera de horario'

interface Telefono {
  rotulo?: string
  textoVisible: string
  enlaceLlamada: string
}

function crearTelefono(textoVisible: string, rotulo?: string): Telefono {
  return { ...(rotulo !== undefined && { rotulo }), textoVisible, enlaceLlamada: enlaceLlamada(textoVisible) }
}

interface TramoHorario {
  dias: string
  horas: string
}

/** El horario literal que publica el cliente, con los domingos cerrados (@s13, @s14). */
const HORARIO: readonly TramoHorario[] = [
  { dias: 'Lunes a viernes', horas: '11:00 a 14:00 y 16:30 a 20:00' },
  { dias: 'Sábados', horas: '11:00 a 14:00' },
  { dias: 'Domingos', horas: 'Cerrado' },
]

const SEPARADOR_UNA_LINEA = ', '

interface DireccionEstructurada {
  readonly calle: string
  readonly codigoPostal: string
  readonly localidad: string
  readonly region: string
}

/**
 * Calle, código postal, localidad y región son el único dato declarado (§2 de
 * `docs/datos-galapavet.md`); las dos formas visibles ya existentes
 * (`lineas`, `unaLinea`) Y la forma estructurada que consume el bloque de
 * datos estructurados (`seo_estructura.feature` @s9) se derivan de ellos, sin
 * retipear nada (Invariante 2).
 */
function crearDireccion(estructurada: DireccionEstructurada): DireccionEstructurada & {
  lineas: readonly [string, string]
  unaLinea: string
} {
  const segundaLinea = `${estructurada.codigoPostal} ${estructurada.localidad}, ${estructurada.region}`
  const lineas = [estructurada.calle, segundaLinea] as const
  return { ...estructurada, lineas, unaLinea: lineas.join(SEPARADOR_UNA_LINEA) }
}

const LOCALIDAD = 'Galapagar'
const PROVINCIA = 'Madrid'

const DIRECCION = crearDireccion({
  calle: 'Carretera de Torrelodones, 11',
  codigoPostal: '28260',
  localidad: LOCALIDAD,
  region: PROVINCIA,
})

/** Nodo `amenity=veterinary` «Galapavet» de OpenStreetMap (id citado en `docs/datos-galapavet.md` §2bis), verificado sobre la dirección de §2. */
const COORDENADAS = { latitud: 40.5772872, longitud: -4.0004445 }

const NOMBRE_COMERCIAL = 'Galapavet'
const DESCRIPTOR = 'Centro integral veterinario'

/** El nombre comercial, el descriptor y la localidad se declaran una vez; la forma compuesta se deriva de ellos (@s21). */
const IDENTIDAD = {
  nombreComercial: NOMBRE_COMERCIAL,
  descriptor: DESCRIPTOR,
  descriptorConLocalidad: `${DESCRIPTOR} en ${LOCALIDAD}, ${PROVINCIA}.`,
}

export const datosNegocio = {
  telefonoClinica: crearTelefono(TELEFONO_CLINICA),
  telefonoMovil: {
    ...crearTelefono(TELEFONO_MOVIL),
    enlaceMensajeria: (texto?: string) => enlaceMensajeria(TELEFONO_MOVIL, texto),
  },
  telefonoUrgencias: crearTelefono(TELEFONO_URGENCIAS, ROTULO_URGENCIAS),
  horario: HORARIO,
  /** El cliente no publica ningún email (`docs/datos-galapavet.md` §9): no se declara ni se sustituye (@s15). */
  email: undefined as string | undefined,
  /** El cliente no publica ningún perfil de red social (`docs/datos-galapavet.md` §9): la lista se declara vacía, no se inventa (@s16). */
  redesSociales: [] as readonly string[],
  direccion: DIRECCION,
  /**
   * El cliente no publica coordenadas (`docs/datos-galapavet.md` §9); las de
   * aquí son las del nodo público de OpenStreetMap «Galapavet» (id y consulta
   * citados en `docs/datos-galapavet.md` §2bis; datos © OpenStreetMap
   * contributors, ODbL), adoptadas con la Decisión 63 para el pin del mapa
   * estático local (@s18 enmendado el 03/09/2026).
   */
  coordenadas: COORDENADAS,
  identidad: IDENTIDAD,
}
