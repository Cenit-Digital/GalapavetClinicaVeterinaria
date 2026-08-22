/**
 * Lógica de decisión de SEO (`seo_estructura`, feature 15), mordible por
 * mutación (`stryker.config.json` muta `src/lib/**\/*.ts`). Ningún componente
 * `.tsx` construye el bloque de datos estructurados ni valida metadatos: solo
 * cablean lo que este módulo produce.
 */

import { normalizarTelefono } from './telefono'

/** Título y descripción propios de una de las seis páginas publicadas (@s4/@s5). */
export interface MetadatosPagina {
  readonly clave: string
  readonly titulo: string
  readonly descripcion: string
}

export const METADATOS_INICIO: MetadatosPagina = {
  clave: 'inicio',
  titulo: 'Galapavet · Centro veterinario en Galapagar',
  descripcion:
    'Galapavet, tu centro veterinario en Galapagar (Madrid): consultas, cirugía, diagnóstico por imagen y mucho más.',
}

export const METADATOS_CAMPANAS: MetadatosPagina = {
  clave: 'campanas',
  titulo: 'Campañas de prevención · Galapavet',
  descripcion: 'Campañas de prevención veterinaria de Galapavet: revisiones, vacunación y chequeos periódicos.',
}

export const METADATOS_FICHA_CAMPANA: MetadatosPagina = {
  clave: 'fichaCampana',
  titulo: 'Ficha de campaña · Galapavet',
  descripcion: 'Ficha con el detalle completo de una campaña de salud de Galapavet.',
}

export const METADATOS_BLOG: MetadatosPagina = {
  clave: 'blog',
  titulo: 'Blog de Galapavet',
  descripcion: 'Blog veterinario de Galapavet: consejos de salud y cuidado para tu mascota.',
}

export const METADATOS_ARTICULO_BLOG: MetadatosPagina = {
  clave: 'articuloBlog',
  titulo: 'Artículo del blog · Galapavet',
  descripcion: 'Artículo del blog de Galapavet con información práctica sobre el cuidado de tu mascota.',
}

export const METADATOS_TIENDA: MetadatosPagina = {
  clave: 'tienda',
  titulo: 'Tienda de Galapavet',
  descripcion: 'Tienda de Galapavet con productos para el cuidado de tu mascota, pendiente de catálogo y precios.',
}

/** Las seis páginas publicadas (@s4/@s5/@s12/@s19), en el mismo orden que enumera el `.feature`. */
export const METADATOS_PAGINAS: readonly MetadatosPagina[] = [
  METADATOS_INICIO,
  METADATOS_CAMPANAS,
  METADATOS_FICHA_CAMPANA,
  METADATOS_BLOG,
  METADATOS_ARTICULO_BLOG,
  METADATOS_TIENDA,
]

/** Resultado de `validarMetadatos` (@s6): válido, o inválido con el motivo nombrado. */
export interface ResultadoValidacionMetadatos {
  readonly valida: boolean
  readonly mensaje?: string
}

function mensajeDescripcionDuplicada(descripcion: string, claveAnterior: string, claveActual: string): string {
  return `Descripción duplicada "${descripcion}" en las páginas "${claveAnterior}" y "${claveActual}".`
}

/** Falla si dos páginas declaran la misma descripción, nombrando la descripción y ambas páginas (@s6). */
export function validarMetadatos(paginas: readonly MetadatosPagina[]): ResultadoValidacionMetadatos {
  const claveDePaginaPorDescripcion = new Map<string, string>()

  for (const pagina of paginas) {
    const claveAnterior = claveDePaginaPorDescripcion.get(pagina.descripcion)
    if (claveAnterior !== undefined) {
      return { valida: false, mensaje: mensajeDescripcionDuplicada(pagina.descripcion, claveAnterior, pagina.clave) }
    }
    claveDePaginaPorDescripcion.set(pagina.descripcion, pagina.clave)
  }

  return { valida: true }
}

// ---------------------------------------------------------------------------
// El bloque de datos estructurados (JSON-LD)
// ---------------------------------------------------------------------------

/** Dirección postal estructurada; mismo dato que `datosNegocio.direccion` (`src/lib/site.ts`), nunca retipeado (@s9). */
export interface DireccionSeo {
  readonly calle: string
  readonly codigoPostal: string
  readonly localidad: string
  readonly region: string
}

/** Mismo dato que las entradas de `datosNegocio.horario` (`src/lib/site.ts`): nunca se retipea (@s13/@s14). */
export interface TramoHorarioSeo {
  readonly dias: string
  readonly horas: string
}

/** Forma mínima de la fuente única que necesita el bloque de datos estructurados (Invariante 2). */
export interface DatosNegocioSeo {
  readonly nombreComercial: string
  readonly direccion: DireccionSeo
  readonly telefonoClinica: string
  readonly horario: readonly TramoHorarioSeo[]
  readonly email?: string | undefined
  readonly redesSociales: readonly string[]
  readonly coordenadas?: { readonly latitud?: number; readonly longitud?: number } | undefined
}

const CONTEXTO_SCHEMA_ORG = 'https://schema.org'
const TIPOS_SCHEMA: readonly string[] = ['VeterinaryCare', 'LocalBusiness']
const PAIS_ISO = 'ES'

function construirDireccionPostal(direccion: DireccionSeo): Record<string, unknown> {
  return {
    '@type': 'PostalAddress',
    streetAddress: direccion.calle,
    postalCode: direccion.codigoPostal,
    addressLocality: direccion.localidad,
    addressRegion: direccion.region,
    addressCountry: PAIS_ISO,
  }
}

/**
 * Días de la semana (enumeración `DayOfWeek` de schema.org) para cada etiqueta
 * legible que declara `datosNegocio.horario` (@s13). Una etiqueta que no está
 * aquí (p. ej. "Domingos") no produce ningún tramo — fallo cerrado (@s14).
 */
const DIAS_SEMANA_POR_ETIQUETA: Readonly<Record<string, readonly string[]>> = {
  'Lunes a viernes': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  Sábados: ['Saturday'],
}

/** Cada "HH:MM a HH:MM" dentro de la escritura legible de un tramo; ninguno si el texto no contiene horas (p. ej. "Cerrado"). */
const PATRON_TRAMO_HORAS = /(\d{2}:\d{2}) a (\d{2}:\d{2})/g

function extraerTramosDeHoras(horas: string): ReadonlyArray<{ opens: string; closes: string }> {
  return Array.from(horas.matchAll(PATRON_TRAMO_HORAS), (coincidencia) => ({
    opens: coincidencia[1] as string,
    closes: coincidencia[2] as string,
  }))
}

/** Una `OpeningHoursSpecification` por cada tramo horario real (@s13); omite los días sin apertura conocida (@s14/@s17). */
function construirEspecificacionesHorario(horario: readonly TramoHorarioSeo[]): readonly Record<string, unknown>[] {
  return horario.flatMap((entrada) => {
    const diasSemana = DIAS_SEMANA_POR_ETIQUETA[entrada.dias]
    if (diasSemana === undefined) {
      return []
    }
    return extraerTramosDeHoras(entrada.horas).map((tramo) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...diasSemana],
      opens: tramo.opens,
      closes: tramo.closes,
    }))
  })
}

/**
 * Construye el bloque de datos estructurados de la clínica (@s7-@s9, @s12-@s22).
 * Omite lo que la fuente única no declara.
 *
 * `datos.coordenadas` (latitud/longitud) NUNCA se lee aquí, a propósito: el
 * cliente no las publica (`docs/datos-galapavet.md` §9) y no hay ninguna cita
 * verificada de las que sí exige `PENDIENTE` en la cabecera del `.feature`.
 * La propiedad `geo` queda fuera de este bloque por completo, hoy — no solo
 * cuando falta un dato, sino incondicionalmente (@s15/@s21).
 */
export function construirDatosEstructurados(datos: DatosNegocioSeo): Record<string, unknown> {
  const especificacionesHorario = construirEspecificacionesHorario(datos.horario)

  return {
    '@context': CONTEXTO_SCHEMA_ORG,
    '@type': [...TIPOS_SCHEMA],
    name: datos.nombreComercial,
    address: construirDireccionPostal(datos.direccion),
    telephone: normalizarTelefono(datos.telefonoClinica),
    ...(especificacionesHorario.length > 0 && { openingHoursSpecification: especificacionesHorario }),
    ...(datos.email !== undefined && { email: datos.email }),
    ...(datos.redesSociales.length > 0 && { sameAs: [...datos.redesSociales] }),
  }
}
