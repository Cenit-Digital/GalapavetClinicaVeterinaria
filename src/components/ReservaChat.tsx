import React, { useRef, useState } from 'react'
import { SERVICIOS } from '../data/servicios'
import { datosNegocio } from '../lib/site'
import {
  componerResumen,
  normalizarRespuesta,
  OPCION_URGENCIA,
  puedeRegistrarRespuesta,
  siguientePaso,
  type IdPaso,
} from './ReservaChat-logica'
import styles from './ReservaChat.module.scss'

const MENSAJE_BIENVENIDA = 'Hola, soy el asistente de Galapavet. ¿Qué necesita tu mascota?'
const MENSAJE_TRAS_SERVICIO = 'Entendido. ¿Con qué animal vienes?'
const MENSAJE_TRAS_ANIMAL = 'Perfecto. ¿Cuándo te viene mejor?'
const MENSAJE_TRAS_CUANDO = 'Ya casi está. ¿Cómo os llamáis tu mascota y tú?'
const MARCADOR_NOMBRE = 'Ej. Nala y Ana Martín'
const MENSAJE_URGENCIA = `Si es una urgencia, no esperes: llama al ${datosNegocio.telefonoUrgencias.textoVisible}, el teléfono de urgencias fuera de horario. Dentro del horario de clínica, llama al ${datosNegocio.telefonoClinica.textoVisible}.`
const AVISO_DEMO = 'Demostración: esta solicitud no se envía a ningún servidor. La cita se cierra por teléfono.'

const OPCIONES_SERVICIO: readonly string[] = [...SERVICIOS.map((bloque) => bloque.titulo), OPCION_URGENCIA]
const OPCIONES_CUANDO: readonly string[] = [
  'Entre semana por la mañana',
  'Entre semana por la tarde',
  'El sábado por la mañana',
  'Lo antes posible',
]

function mensajeAsistente(texto: string): string {
  return `Asistente: ${texto}`
}

function mensajeVisitante(texto: string): string {
  return `Tú: ${texto}`
}

interface Mensaje {
  readonly id: number
  readonly texto: string
}

interface Telefono {
  readonly enlaceLlamada: string
  readonly textoVisible: string
}

interface EnlaceLlamadaProps {
  readonly etiqueta: string
  readonly telefono: Telefono
}

/** Enlace de llamada con el mismo patrón "<etiqueta> · <número>" en todos sus usos (@s12/@s14/@s18). */
function EnlaceLlamada({ etiqueta, telefono }: EnlaceLlamadaProps): React.JSX.Element {
  return <a href={telefono.enlaceLlamada}>{`${etiqueta} · ${telefono.textoVisible}`}</a>
}

/** Widget de chat guiado de reserva de cita. */
export function ReservaChat(): React.JSX.Element {
  const siguienteId = useRef(1)
  const [historial, setHistorial] = useState<readonly Mensaje[]>([{ id: 0, texto: mensajeAsistente(MENSAJE_BIENVENIDA) }])
  const [paso, setPaso] = useState<IdPaso>('servicio')
  const [textoLibre, setTextoLibre] = useState('')
  const [respuestas, setRespuestas] = useState({ servicio: '', animal: '', cuando: '', nombre: '' })

  function agregarMensajes(textos: readonly string[]): void {
    const nuevos = textos.map((texto) => ({ id: siguienteId.current++, texto }))
    setHistorial((actual) => [...actual, ...nuevos])
  }

  function manejarSeleccionServicio(opcion: string): void {
    const siguiente = siguientePaso('servicio', opcion)
    const mensajeAsistenteSiguiente = siguiente === 'urgencia' ? MENSAJE_URGENCIA : MENSAJE_TRAS_SERVICIO
    agregarMensajes([mensajeVisitante(opcion), mensajeAsistente(mensajeAsistenteSiguiente)])
    setRespuestas((actual) => ({ ...actual, servicio: opcion }))
    setPaso(siguiente)
  }

  function manejarEnvioAnimal(): void {
    if (!puedeRegistrarRespuesta(textoLibre)) {
      return
    }
    agregarMensajes([mensajeVisitante(textoLibre), mensajeAsistente(MENSAJE_TRAS_ANIMAL)])
    setRespuestas((actual) => ({ ...actual, animal: textoLibre }))
    setPaso('cuando')
    setTextoLibre('')
  }

  function manejarSeleccionCuando(opcion: string): void {
    agregarMensajes([mensajeVisitante(opcion), mensajeAsistente(MENSAJE_TRAS_CUANDO)])
    setRespuestas((actual) => ({ ...actual, cuando: opcion }))
    setPaso('nombre')
  }

  function manejarEnvioNombre(): void {
    if (!puedeRegistrarRespuesta(textoLibre)) {
      return
    }
    const nombre = normalizarRespuesta(textoLibre)
    const resumen = componerResumen(respuestas.servicio, respuestas.animal, respuestas.cuando)
    const mensajeFinal = `Gracias, ${nombre}. Anotado: ${resumen}. Para cerrar la cita, llámanos al ${datosNegocio.telefonoClinica.textoVisible} y dinos estos datos.`
    agregarMensajes([mensajeVisitante(nombre), mensajeAsistente(mensajeFinal)])
    setRespuestas((actual) => ({ ...actual, nombre }))
    setPaso('final')
    setTextoLibre('')
  }

  function manejarTeclaEnvioNombre(evento: React.KeyboardEvent<HTMLInputElement>): void {
    if (evento.key === 'Enter') {
      manejarEnvioNombre()
    }
  }

  function reiniciar(): void {
    setHistorial([{ id: siguienteId.current++, texto: mensajeAsistente(MENSAJE_BIENVENIDA) }])
    setPaso('servicio')
    setTextoLibre('')
  }

  return (
    <section className={styles.reservaChat} data-contenedor-principal>
      <div>
        <p className={styles.eyebrow}>Reserva de cita</p>
        <h2>Cuéntanos qué necesita tu mascota</h2>
        <p>Te guiamos paso a paso para preparar tu solicitud con los datos que necesita la clínica.</p>
        <EnlaceLlamada etiqueta="Llamar a la clínica" telefono={datosNegocio.telefonoClinica} />
        <EnlaceLlamada etiqueta="Llamar al móvil" telefono={datosNegocio.telefonoMovil} />
        <ul>
          {datosNegocio.horario.map((tramo) => (
            <li key={tramo.dias}>{`${tramo.dias}: ${tramo.horas}`}</li>
          ))}
        </ul>
      </div>
      <fieldset aria-label="Asistente de reserva de Galapavet">
        <div className={styles.cabeceraChat}>
          <span aria-hidden="true">G</span>
          <div>
            <strong>Asistente de reserva</strong>
            <p>Galapavet</p>
          </div>
        </div>
        <div role="log" aria-live="polite">
          {historial.map((mensaje) => (
            <p key={mensaje.id}>{mensaje.texto}</p>
          ))}
        </div>
        {paso === 'servicio' && (
          <fieldset aria-label="Respuestas rápidas">
            {OPCIONES_SERVICIO.map((opcion) => (
              <button key={opcion} type="button" onClick={() => manejarSeleccionServicio(opcion)}>
                {opcion}
              </button>
            ))}
          </fieldset>
        )}
        {paso === 'animal' && (
          <>
            <input
              type="text"
              aria-label="Tu respuesta"
              value={textoLibre}
              onChange={(evento) => setTextoLibre(evento.target.value)}
            />
            <button type="button" aria-disabled={!puedeRegistrarRespuesta(textoLibre)} onClick={manejarEnvioAnimal}>
              Enviar respuesta
            </button>
          </>
        )}
        {paso === 'cuando' && (
          <fieldset aria-label="Respuestas rápidas">
            {OPCIONES_CUANDO.map((opcion) => (
              <button key={opcion} type="button" onClick={() => manejarSeleccionCuando(opcion)}>
                {opcion}
              </button>
            ))}
          </fieldset>
        )}
        {paso === 'nombre' && (
          <>
            <input
              type="text"
              aria-label="Tu respuesta"
              placeholder={MARCADOR_NOMBRE}
              value={textoLibre}
              onChange={(evento) => setTextoLibre(evento.target.value)}
              onKeyDown={manejarTeclaEnvioNombre}
            />
            <button type="button" aria-disabled={!puedeRegistrarRespuesta(textoLibre)} onClick={manejarEnvioNombre}>
              Enviar respuesta
            </button>
          </>
        )}
        {paso === 'final' && (
          <>
            <fieldset aria-label="Resumen de tu solicitud">
              <ul>
                <li>{`Servicio: ${respuestas.servicio}`}</li>
                <li>{`Animal: ${respuestas.animal}`}</li>
                <li>{`Cuándo: ${respuestas.cuando}`}</li>
                <li>{`Nombre: ${respuestas.nombre}`}</li>
              </ul>
            </fieldset>
            <EnlaceLlamada etiqueta="Llamar para cerrar la cita" telefono={datosNegocio.telefonoClinica} />
            <button type="button" onClick={reiniciar}>
              Pedir otra cita
            </button>
          </>
        )}
        {paso === 'urgencia' && (
          <>
            <EnlaceLlamada etiqueta="Llamar a urgencias fuera de horario" telefono={datosNegocio.telefonoUrgencias} />
            <EnlaceLlamada etiqueta="Llamar a la clínica" telefono={datosNegocio.telefonoClinica} />
            <button type="button" onClick={reiniciar}>
              Empezar de nuevo
            </button>
          </>
        )}
        <p>{AVISO_DEMO}</p>
      </fieldset>
    </section>
  )
}
