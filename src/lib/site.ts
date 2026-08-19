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

/** Las líneas visibles de la dirección son el único dato declarado; la forma de una línea se deriva de ellas (@s17). */
function crearDireccion(lineas: readonly [string, string]): { lineas: readonly [string, string]; unaLinea: string } {
  return { lineas, unaLinea: lineas.join(SEPARADOR_UNA_LINEA) }
}

const LOCALIDAD = 'Galapagar'
const PROVINCIA = 'Madrid'

const DIRECCION = crearDireccion(['Carretera de Torrelodones, 11', `28260 ${LOCALIDAD}, ${PROVINCIA}`])

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
  /** El cliente no publica coordenadas exactas (`docs/datos-galapavet.md` §9): no se inventan (@s18). */
  coordenadas: undefined as { latitud: number; longitud: number } | undefined,
  identidad: IDENTIDAD,
}
