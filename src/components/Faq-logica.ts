import { construirEnlaceTelefono, type EnlaceTelefono, type TramoHorario } from './InformacionContacto-logica'

/**
 * Lógica de decisión de `Faq`, mordible por mutación
 * (`stryker.config.json` muta `src/**\/*-logica.ts`). El componente `.tsx`
 * solo cablea esta lógica; nada aquí toca el DOM.
 */

export interface EntradaFaq {
  readonly pregunta: string
  readonly respuesta: string
}

const CONECTOR_TRAMOS_SEPARADOS = ' y '
const CONECTOR_TRAMOS_SEPARADOS_CON_DE = ' y de '
const HORAS_CERRADO = 'cerrado'

/** El texto de un tramo cerrado no antepone "de" a la palabra "cerrado" (@s2). */
function esTramoCerrado(horas: string): boolean {
  return horas.toLowerCase() === HORAS_CERRADO
}

/** Compone la frase de un único tramo de horario, derivado literalmente de `datosNegocio.horario` (@s2). */
function textoTramo(tramo: TramoHorario): string {
  const dias = tramo.dias.toLowerCase()
  const horas = tramo.horas.toLowerCase()
  if (esTramoCerrado(horas)) {
    return `${dias} ${horas}`
  }
  return `de ${dias} de ${horas.split(CONECTOR_TRAMOS_SEPARADOS).join(CONECTOR_TRAMOS_SEPARADOS_CON_DE)}`
}

/** Compone la respuesta de horario a partir de `datosNegocio.horario`, sin retipear ningún dato (@s2). */
export function textoHorario(horario: readonly TramoHorario[]): string {
  return `El horario es ${horario.map(textoTramo).join(', ')}.`
}

/** Compone la respuesta de cómo pedir cita con los dos teléfonos verificados, sin retipearlos (@s3). */
export function textoCita(telefonoClinica: string, telefonoMovil: string): string {
  return `Puedes pedir cita llamando al ${telefonoClinica} o al ${telefonoMovil}.`
}

const SEPARADOR_LISTA = ', '
const CONECTOR_ULTIMO_ELEMENTO = ' y '

/** Enumera una lista en español: "a, b y c" (@s4). */
function enumerar(elementos: readonly string[]): string {
  if (elementos.length <= 1) {
    return elementos.join('')
  }
  const ultimo = elementos[elementos.length - 1]
  const resto = elementos.slice(0, -1)
  return `${resto.join(SEPARADOR_LISTA)}${CONECTOR_ULTIMO_ELEMENTO}${ultimo}`
}

interface BloqueServicioFaq {
  readonly titulo: string
}

/** Compone la respuesta de servicios a partir de los títulos publicados en `SERVICIOS`, sin retipearlos (@s4). */
export function textoServicios(servicios: readonly BloqueServicioFaq[]): string {
  return `Ofrecemos ${enumerar(servicios.map((bloque) => bloque.titulo))}.`
}

/** Compone la respuesta de atención fuera de horario con el teléfono real de urgencias, sin prometer disponibilidad permanente (@s5). */
export function textoUrgencias(telefonoUrgencias: string): string {
  return `Si tu animal necesita atención fuera del horario de la clínica, llama al ${telefonoUrgencias}.`
}

/**
 * Respuesta divulgativa general sobre la pauta de vacunación: no afirma nada
 * específico de Galapavet (@s6). PENDIENTE: el texto exacto lo debe revisar
 * un veterinario del cliente antes de publicarlo (cabecera de
 * `features/faq.feature`); esta redacción solo respeta la frontera de no
 * afirmar precios, horarios ni el nombre del negocio.
 */
export const RESPUESTA_DIVULGATIVA_VACUNACION =
  'La pauta de vacunación depende de la edad, la especie y el estilo de vida de cada animal: lo habitual es empezar de cachorro o gatito y repetir con refuerzos periódicos a lo largo de su vida. Consulta con tu veterinario para ajustarla al caso concreto de tu mascota.'

interface CatalogoFaqInput {
  readonly horario: readonly TramoHorario[]
  readonly telefonoClinica: string
  readonly telefonoMovil: string
  readonly telefonoUrgencias: string
  readonly servicios: readonly BloqueServicioFaq[]
}

/** El catálogo de preguntas frecuentes que publica la clínica, en el orden publicado (@s1/@s2/@s3/@s4/@s5/@s6). */
export function construirCatalogoFaq({
  horario,
  telefonoClinica,
  telefonoMovil,
  telefonoUrgencias,
  servicios,
}: CatalogoFaqInput): readonly EntradaFaq[] {
  return [
    { pregunta: '¿Qué horario tiene la clínica?', respuesta: textoHorario(horario) },
    { pregunta: '¿Cómo pido cita?', respuesta: textoCita(telefonoClinica, telefonoMovil) },
    { pregunta: '¿Qué servicios ofrecéis?', respuesta: textoServicios(servicios) },
    { pregunta: '¿Qué hago si mi animal necesita atención fuera del horario?', respuesta: textoUrgencias(telefonoUrgencias) },
    { pregunta: '¿Cada cuánto hay que vacunar a un perro o a un gato?', respuesta: RESPUESTA_DIVULGATIVA_VACUNACION },
  ]
}

/** Descarta las entradas sin pregunta o sin respuesta publicada (@s12): un hueco no es una entrada real. */
export function entradasValidas(catalogo: readonly EntradaFaq[]): EntradaFaq[] {
  return catalogo.filter((entrada) => entrada.pregunta.length > 0 && entrada.respuesta.length > 0)
}

/** Alterna el índice abierto del acordeón excluyente: pulsar el que ya estaba abierto lo cierra (@s7/@s8). */
export function siguienteIndiceAbierto(actual: number | null, pulsado: number): number | null {
  return actual === pulsado ? null : pulsado
}

/**
 * Divide un texto en segmentos alternando texto plano y enlaces de teléfono,
 * cuando el texto contiene el número visible de alguno de los `enlaces`
 * (@s3/@s5). Nunca reescribe un `tel:` a mano: los enlaces ya llegan
 * derivados por `construirEnlaceTelefono`.
 */
export function segmentosDeRespuesta(texto: string, enlaces: readonly EnlaceTelefono[]): ReadonlyArray<string | EnlaceTelefono> {
  for (const enlace of enlaces) {
    const posicion = texto.indexOf(enlace.textoVisible)
    if (posicion === -1) {
      continue
    }
    const antes = texto.slice(0, posicion)
    const despues = texto.slice(posicion + enlace.textoVisible.length)
    const restantes = enlaces.filter((candidato) => candidato !== enlace)
    return [...(antes ? [antes] : []), enlace, ...segmentosDeRespuesta(despues, restantes)]
  }
  return texto ? [texto] : []
}

/** Deriva los enlaces de teléfono citables en las respuestas del catálogo, a partir de la fuente única (@s3/@s5/@s13). */
export function enlacesDeContacto(telefonoClinica: string, telefonoMovil: string, telefonoUrgencias: string): readonly EnlaceTelefono[] {
  return [construirEnlaceTelefono(telefonoClinica), construirEnlaceTelefono(telefonoMovil), construirEnlaceTelefono(telefonoUrgencias)]
}
