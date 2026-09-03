import React, { useRef, useState } from 'react'
import { SERVICIOS } from '../data/servicios'
import { datosNegocio } from '../lib/site'
import { inicialesDe } from './Equipo-logica'
import {
  AUTOR_ASISTENTE,
  AUTOR_VISITANTE,
  componerResumen,
  normalizarRespuesta,
  OPCION_URGENCIA,
  puedeRegistrarRespuesta,
  rotularMensaje,
  siguientePaso,
  type AutorDeMensaje,
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

interface Mensaje {
  readonly id: number
  readonly autor: AutorDeMensaje
  readonly texto: string
}

type MensajeSinId = Omit<Mensaje, 'id'>

function deAsistente(texto: string): MensajeSinId {
  return { autor: AUTOR_ASISTENTE, texto }
}

function deVisitante(texto: string): MensajeSinId {
  return { autor: AUTOR_VISITANTE, texto }
}

interface Telefono {
  readonly enlaceLlamada: string
  readonly textoVisible: string
}

interface EnlaceLlamadaProps {
  readonly etiqueta: string
  readonly telefono: Telefono
  readonly className?: string | undefined
}

/** Enlace de llamada con el mismo patrón "<etiqueta> · <número>" en todos sus usos (@s12/@s14). */
function EnlaceLlamada({ etiqueta, telefono, className }: EnlaceLlamadaProps): React.JSX.Element {
  return (
    <a className={className} href={telefono.enlaceLlamada}>
      {`${etiqueta} · ${telefono.textoVisible}`}
    </a>
  )
}

interface FilaDeTextoProps {
  readonly valor: string
  readonly marcador?: string
  readonly onCambio: (valor: string) => void
  readonly onEnviar: () => void
  readonly onTecla?: (evento: React.KeyboardEvent<HTMLInputElement>) => void
}

/**
 * El paso de texto libre (VLS:298-301): el campo y, en la misma fila, el botón
 * redondo de enviar. Su nombre accesible sigue siendo "Enviar respuesta"
 * (@s5/@s6/@s7 de `reserva_chat`) aunque lo visible sea la flecha decorativa.
 */
function FilaDeTexto({ valor, marcador, onCambio, onEnviar, onTecla }: FilaDeTextoProps): React.JSX.Element {
  return (
    <div className={styles.filaDeTexto} data-reserva-fila-de-texto>
      <input
        type="text"
        aria-label="Tu respuesta"
        placeholder={marcador}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
        onKeyDown={onTecla}
      />
      <button type="button" aria-label="Enviar respuesta" aria-disabled={!puedeRegistrarRespuesta(valor)} onClick={onEnviar}>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

/** Widget de chat guiado de reserva de cita. */
export function ReservaChat(): React.JSX.Element {
  const siguienteId = useRef(1)
  const [historial, setHistorial] = useState<readonly Mensaje[]>([{ id: 0, ...deAsistente(MENSAJE_BIENVENIDA) }])
  const [paso, setPaso] = useState<IdPaso>('servicio')
  const [textoLibre, setTextoLibre] = useState('')
  const [respuestas, setRespuestas] = useState({ servicio: '', animal: '', cuando: '', nombre: '' })

  function agregarMensajes(nuevos: readonly MensajeSinId[]): void {
    const conId = nuevos.map((mensaje) => ({ ...mensaje, id: siguienteId.current++ }))
    setHistorial((actual) => [...actual, ...conId])
  }

  function manejarSeleccionServicio(opcion: string): void {
    const siguiente = siguientePaso('servicio', opcion)
    const respuestaDelAsistente = siguiente === 'urgencia' ? MENSAJE_URGENCIA : MENSAJE_TRAS_SERVICIO
    agregarMensajes([deVisitante(opcion), deAsistente(respuestaDelAsistente)])
    setRespuestas((actual) => ({ ...actual, servicio: opcion }))
    setPaso(siguiente)
  }

  function manejarEnvioAnimal(): void {
    if (!puedeRegistrarRespuesta(textoLibre)) {
      return
    }
    agregarMensajes([deVisitante(textoLibre), deAsistente(MENSAJE_TRAS_ANIMAL)])
    setRespuestas((actual) => ({ ...actual, animal: textoLibre }))
    setPaso('cuando')
    setTextoLibre('')
  }

  function manejarSeleccionCuando(opcion: string): void {
    agregarMensajes([deVisitante(opcion), deAsistente(MENSAJE_TRAS_CUANDO)])
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
    agregarMensajes([deVisitante(nombre), deAsistente(mensajeFinal)])
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
    setHistorial([{ id: siguienteId.current++, ...deAsistente(MENSAJE_BIENVENIDA) }])
    setPaso('servicio')
    setTextoLibre('')
  }

  return (
    <section className={styles.reservaChat} data-contenedor-principal>
      <div className={styles.informacion} data-reserva-informacion>
        <p className={styles.eyebrow}>Reserva de cita</p>
        <h2>Cuéntanos qué necesita tu mascota</h2>
        <p className={styles.descripcion}>
          Te guiamos paso a paso para preparar tu solicitud con los datos que necesita la clínica.
        </p>
        {/* Los dos canales confirmados (Decisión 66, `docs/datos-galapavet.md` §2bis): el
            móvil atiende WhatsApp, así que el primer enlace es el de mensajería que la
            fuente única ya derivaba; el segundo, la llamada a la clínica (@s2 de
            `fidelidad_reserva`, enmienda de `reserva_chat` @s18). */}
        <div className={styles.acciones} data-reserva-acciones>
          <a href={datosNegocio.telefonoMovil.enlaceMensajeria()} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <a href={datosNegocio.telefonoClinica.enlaceLlamada}>Llamar a la clínica</a>
        </div>
        <ul className={styles.horario} data-reserva-horario>
          {datosNegocio.horario.map((tramo) => (
            <li key={tramo.dias}>{`${tramo.dias}: ${tramo.horas}`}</li>
          ))}
        </ul>
      </div>
      <fieldset className={styles.tarjeta} aria-label="Asistente de reserva de Galapavet">
        {/* `fieldset` en vez de un `div` con `role="group"`: oxlint (jsx-a11y/prefer-tag-over-role)
            exige la etiqueta semántica real cuando existe una equivalente, y su rol implícito
            YA es "group" — el resto del fichero agrupa contenido no-formulario del mismo modo
            (p. ej. "Resumen de tu solicitud" más abajo), y el reset `.tarjeta fieldset { border: none; ... }`
            de `ReservaChat.module.scss` cubre cualquier `fieldset` anidado dentro de la tarjeta.
            El `div` interior es quien mide la altura mínima y reparte las tres bandas: la caja
            anónima de contenido de un `fieldset` no hereda `min-height` (ver `.interior` en el SCSS). */}
        <div className={styles.interior}>
          <fieldset className={styles.cabeceraChat} aria-label="Cabecera del chat">
            <span aria-hidden="true">{inicialesDe(datosNegocio.identidad.nombreComercial)}</span>
            <div>
              <strong>{datosNegocio.identidad.nombreComercial}</strong>
              {/* Indicador de disponibilidad real (@s34): NO dice "en línea" —
                  esa promesa la prohíbe @s17, porque no hay ninguna persona
                  conectada al otro lado, solo un guion que corre en el propio
                  navegador y que por eso está disponible siempre que la página
                  carga. */}
              <p className={styles.disponibilidad}>
                <span aria-hidden="true" className={styles.puntoDisponible} />
                Disponible
              </p>
              <p>Asistente de reserva</p>
            </div>
          </fieldset>
          <div role="log" aria-live="polite">
            {historial.map((mensaje) => (
              <p key={mensaje.id} data-autor={mensaje.autor}>
                {rotularMensaje(mensaje.autor, mensaje.texto)}
              </p>
            ))}
          </div>
          <div className={styles.pie} data-reserva-pie>
            {paso === 'servicio' && (
              <fieldset aria-label="Respuestas rápidas">
                {OPCIONES_SERVICIO.map((opcion) => (
                  <button key={opcion} type="button" onClick={() => manejarSeleccionServicio(opcion)}>
                    {opcion}
                  </button>
                ))}
              </fieldset>
            )}
            {paso === 'animal' && <FilaDeTexto valor={textoLibre} onCambio={setTextoLibre} onEnviar={manejarEnvioAnimal} />}
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
              <FilaDeTexto
                valor={textoLibre}
                marcador={MARCADOR_NOMBRE}
                onCambio={setTextoLibre}
                onEnviar={manejarEnvioNombre}
                onTecla={manejarTeclaEnvioNombre}
              />
            )}
            {paso === 'final' && (
              <>
                <fieldset className={styles.resumen} aria-label="Resumen de tu solicitud">
                  <ul>
                    <li>{`Servicio: ${respuestas.servicio}`}</li>
                    <li>{`Animal: ${respuestas.animal}`}</li>
                    <li>{`Cuándo: ${respuestas.cuando}`}</li>
                    <li>{`Nombre: ${respuestas.nombre}`}</li>
                  </ul>
                </fieldset>
                <EnlaceLlamada
                  className={styles.primario}
                  etiqueta="Llamar para cerrar la cita"
                  telefono={datosNegocio.telefonoClinica}
                />
                <button type="button" className={styles.secundario} onClick={reiniciar}>
                  Pedir otra cita
                </button>
              </>
            )}
            {paso === 'urgencia' && (
              <>
                <EnlaceLlamada
                  className={styles.primario}
                  etiqueta="Llamar a urgencias fuera de horario"
                  telefono={datosNegocio.telefonoUrgencias}
                />
                <EnlaceLlamada className={styles.secundario} etiqueta="Llamar a la clínica" telefono={datosNegocio.telefonoClinica} />
                <button type="button" className={styles.secundario} onClick={reiniciar}>
                  Empezar de nuevo
                </button>
              </>
            )}
            <p className={styles.aviso}>{AVISO_DEMO}</p>
          </div>
        </div>
      </fieldset>
    </section>
  )
}
