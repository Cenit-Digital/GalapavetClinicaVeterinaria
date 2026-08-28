/**
 * EL USO DEL ACENTO SATURADO (@s15 de `features/rediseno_visual.feature`).
 *
 * La enmienda del 26/08/2026 devolvió al sistema el token `--color-acento`,
 * que la regla anterior prohibía por nombre. Pero el motivo original de aquella
 * prohibición seguía siendo cierto y se conserva convertido en una regla de
 * USO: el lima de marca da **1,89 de ratio sobre blanco** (calculado con
 * `src/lib/contraste.ts`, muy por debajo del 4,5 de SC 1.4.3), así que no
 * puede llevar texto jamás, ni dibujar el borde que identifica un control
 * (SC 1.4.11 pide 3:1). Sí puede rellenar: como fondo, el contraste que
 * importa es el del texto que va ENCIMA, no el del propio lima.
 *
 * De ahí las tres cláusulas del escenario: nunca como valor de `color`, nunca
 * dentro de una declaración de borde, y al menos una vez como relleno — esta
 * última para que la puerta no dé por bueno un token que nadie usa.
 *
 * Módulo PURO a propósito (`stryker.config.json`): StrykerJS no muta el texto
 * ni los atributos de JSX, así que toda decisión vive aquí y se afirma por
 * valor, nunca sobre un `className`.
 */

import type { FicheroDeTexto } from './rolesDescartados'

/**
 * Un uso del acento a secas. `--color-acento-tinta` y `--color-acento-suave`
 * NO son este token: son roles distintos, con contraste propio, y por eso el
 * patrón exige el cierre del paréntesis o la coma del valor de reserva.
 */
const PATRON_USO_DEL_ACENTO = /var\(\s*--color-acento\s*[,)]/

const CERO_FICHEROS = 0
const CERO_USOS = 0
const PRIMERA_LINEA = 1
const SIN_SEPARADOR = -1

export interface UsoDeAcento {
  readonly ruta: string
  readonly linea: number
  readonly declaracion: string
}

export interface InformeUsoDelAcento {
  readonly pasa: boolean
  readonly ficherosInspeccionados: number
  readonly usosTotales: number
  readonly comoTexto: readonly UsoDeAcento[]
  readonly comoBorde: readonly UsoDeAcento[]
  readonly comoRelleno: readonly UsoDeAcento[]
  readonly sinClasificar: readonly UsoDeAcento[]
  readonly motivo?: string
}

const MOTIVO_SIN_ESTILOS = 'no se inspeccionó ningún fichero de estilos: el inventario está vacío'

const SEPARADOR_DE_DECLARACION = ':'
const APERTURA_DE_BLOQUE = '{'

/**
 * La propiedad CSS que pinta esta línea. Se corta por la última llave de
 * apertura para que una regla anidada en una sola línea
 * (`&:hover { color: var(--color-acento); }`) declare "color" y no "&".
 */
function propiedadDe(linea: string): string {
  const trasLaLlave = linea.slice(linea.lastIndexOf(APERTURA_DE_BLOQUE) + PRIMERA_LINEA)
  const separador = trasLaLlave.indexOf(SEPARADOR_DE_DECLARACION)
  return separador === SIN_SEPARADOR ? '' : trasLaLlave.slice(CERO_USOS, separador).trim().toLowerCase()
}

type Papel = 'texto' | 'borde' | 'relleno' | 'sin clasificar'

/**
 * Cualquier propiedad que empiece por `border` cubre a la vez `border-color` y
 * la declaración abreviada (`border`, `border-inline-start`…), que es lo que
 * pide la segunda cláusula del escenario. `border-width` o `border-radius` no
 * admiten un color, así que la aproximación no produce falsos negativos.
 */
function papelDe(propiedad: string): Papel {
  if (propiedad === 'color') {
    return 'texto'
  }
  if (propiedad.startsWith('border')) {
    return 'borde'
  }
  if (propiedad.startsWith('background') || propiedad === 'fill') {
    return 'relleno'
  }
  return 'sin clasificar'
}

interface UsoClasificado extends UsoDeAcento {
  readonly papel: Papel
}

function usosDe(fichero: FicheroDeTexto): readonly UsoClasificado[] {
  return fichero.contenido
    .split('\n')
    .map((linea, indice) => ({ linea: linea.trim(), numero: indice + PRIMERA_LINEA }))
    .filter(({ linea }) => PATRON_USO_DEL_ACENTO.test(linea))
    .map(({ linea, numero }) => ({
      ruta: fichero.ruta,
      linea: numero,
      declaracion: linea,
      papel: papelDe(propiedadDe(linea)),
    }))
}

function conPapel(usos: readonly UsoClasificado[], papel: Papel): readonly UsoDeAcento[] {
  return usos.filter((uso) => uso.papel === papel).map(({ ruta, linea, declaracion }) => ({ ruta, linea, declaracion }))
}

/**
 * Recorre el texto real de los ficheros de estilos y clasifica CADA uso de
 * `var(--color-acento)` por la propiedad que lo pinta. Falla cerrada sin
 * ficheros que inspeccionar, y también si nadie usa el acento como relleno:
 * «cero usos como texto» no significa nada si no se ha mirado nada.
 */
export function ejecutarPuertaDeUsoDelAcento(ficherosDeEstilos: readonly FicheroDeTexto[]): InformeUsoDelAcento {
  if (ficherosDeEstilos.length === CERO_FICHEROS) {
    return {
      pasa: false,
      ficherosInspeccionados: CERO_FICHEROS,
      usosTotales: CERO_USOS,
      comoTexto: [],
      comoBorde: [],
      comoRelleno: [],
      sinClasificar: [],
      motivo: MOTIVO_SIN_ESTILOS,
    }
  }

  const usos = ficherosDeEstilos.flatMap(usosDe)
  const comoTexto = conPapel(usos, 'texto')
  const comoBorde = conPapel(usos, 'borde')
  const comoRelleno = conPapel(usos, 'relleno')
  const sinClasificar = conPapel(usos, 'sin clasificar')

  return {
    pasa:
      comoTexto.length === CERO_USOS &&
      comoBorde.length === CERO_USOS &&
      sinClasificar.length === CERO_USOS &&
      comoRelleno.length > CERO_USOS,
    ficherosInspeccionados: ficherosDeEstilos.length,
    usosTotales: usos.length,
    comoTexto,
    comoBorde,
    comoRelleno,
    sinClasificar,
  }
}
