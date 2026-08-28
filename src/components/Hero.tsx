import React from 'react'
import { datosNegocio } from '../lib/site'
import { enlaceLlamada } from '../lib/telefono'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import { EQUIPO } from '../data/equipo'
import { GALERIA } from '../data/galeria'
import { SERVICIOS } from '../data/servicios'
import { construirCifrasBienvenida } from './Hero-logica'
import styles from './Hero.module.scss'

/** Misma forma que las entradas de `datosNegocio.horario` (`src/lib/site.ts`). */
export interface FranjaHorario {
  readonly dias: string
  readonly horas: string
}

interface HeroProps {
  /**
   * Teléfono principal de la clínica, en escritura legible. Omitido: el de la
   * fuente única (comportamiento por defecto). `null`: la fuente única no
   * declara teléfono principal (@s9) — `undefined` no sirve como sentinela
   * porque un parámetro por defecto de JS también se dispara con `undefined`.
   */
  telefono?: string | null
  /**
   * Franjas horarias de la franja inferior. Omitido: las de la fuente única
   * (comportamiento por defecto). `null`: la fuente única no declara ninguna
   * franja horaria (@s10), mismo motivo que `telefono`.
   */
  horario?: readonly FranjaHorario[] | null
}

const TITULAR = 'Cuidamos la salud y la felicidad de tu mascota'
/** La localidad y la provincia reales de la fuente única (@s30): nunca retecleadas. */
const UBICACION = `${datosNegocio.direccion.localidad} · ${datosNegocio.direccion.region}`
const TEXTO_DESCRIPTIVO =
  'En Galapavet cuidamos a tu mascota con medicina general, cirugía y anestesia, diagnóstico de imagen, análisis clínicos y especialidades como oftalmología o traumatología.'

/** Sección de bienvenida de la landing. `enlaceLlamada` falla cerrado (@s11): un teléfono que no normaliza revienta el render entero, sin `tel:` a medias. */
export function Hero({
  telefono = datosNegocio.telefonoClinica.textoVisible,
  horario = datosNegocio.horario,
}: HeroProps = {}): React.JSX.Element {
  const cifras = construirCifrasBienvenida(EQUIPO, SERVICIOS, GALERIA, horario ?? [])

  return (
    <section className={styles.hero} data-contenedor-principal>
      <img
        src={hrefDeDestino('/img/hero/clinica.webp')}
        alt="Perro con su familia al aire libre"
        width={1600}
        height={900}
        loading="lazy"
        decoding="async"
      />
      <div className={styles.contenido}>
        <p>{UBICACION}</p>
        <h1>{TITULAR}</h1>
        <p>{TEXTO_DESCRIPTIVO}</p>
        <div>
          <a href="#reservar">Reservar cita</a>
          {telefono !== null && <a href={enlaceLlamada(telefono)}>{`Llamar ${telefono}`}</a>}
        </div>
        {horario !== null && (
          <dl>
            {horario.map((tramo) => (
              <div key={tramo.dias}>
                <dt>{tramo.dias}</dt>
                <dd>{tramo.horas}</dd>
              </div>
            ))}
          </dl>
        )}
        <ul className={styles.cifras} aria-label="Resumen de Galapavet">
          {cifras.map((cifra) => (
            <li key={cifra.etiqueta}>
              <strong>{cifra.valor}</strong>
              <span>{cifra.etiqueta}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
