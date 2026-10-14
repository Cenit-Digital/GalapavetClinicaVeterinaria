import React from 'react'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import styles from './Hero.module.scss'

const TITULAR = 'Cuidamos la salud y la felicidad de tu mascota'
const TEXTO_DESCRIPTIVO =
  'En Galapavet cuidamos a tu mascota con medicina general, cirugía y anestesia, diagnóstico de imagen, análisis clínicos y especialidades como oftalmología o traumatología.'

/**
 * Sección de bienvenida de la landing: titular, párrafo y una única acción.
 * Ningún dato de contacto vive aquí (teléfono, horario y localidad siguen
 * publicados en Contacto, FAQ, chat de reserva y pie), así que no recibe props.
 */
export function Hero(): React.JSX.Element {
  return (
    <section className={styles.hero} data-a-sangre data-contenedor-principal>
      <img
        src={hrefDeDestino('/img/hero/clinica.webp')}
        alt=""
        width={1600}
        height={900}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <div className={styles.contenido} data-hero-contenido>
        <h1>{TITULAR}</h1>
        <p className={styles.subtitulo} data-hero-subtitulo>
          {TEXTO_DESCRIPTIVO}
        </p>
        <div className={styles.acciones} data-hero-acciones>
          <a href="#reservar">Reservar cita</a>
        </div>
      </div>
    </section>
  )
}
