import React, { useState } from 'react'
import { EQUIPO, type Profesional } from '../data/equipo'
import { datosNegocio } from '../lib/site'
import {
  especialidadesVisibles,
  hayFormacionPublicada,
  inicialesDe,
  profesionalesValidos,
  resumenDelEquipo,
  rotuloBoton,
  tieneFormacion,
} from './Equipo-logica'
import styles from './Equipo.module.scss'

/**
 * Cintillo de la sección (@s33 de `rediseno_visual.feature`): escrito en
 * minúsculas/mayúscula inicial a propósito — las versalitas las aplica el
 * mixin `eyebrow` (`src/styles/_api.scss`) vía `text-transform`, no un
 * literal ya en mayúsculas. Cintillo «Equipo» y titular «Nuestro equipo»,
 * como el prototipo (Enmienda 1 de `progress/fidelidad/enmiendas_equipo.md`).
 */
const ROTULO_CINTILLO = 'Equipo'
const TITULO = 'Nuestro equipo'

interface EquipoProps {
  /** Listado de profesionales a mostrar. Por defecto, el listado real del proyecto. */
  listado?: readonly Profesional[]
}

interface TarjetaProfesionalProps {
  profesional: Profesional
}

/** Cada tarjeta guarda su propio abierto/cerrado, independiente del resto (@s8). */
function TarjetaProfesional({ profesional }: TarjetaProfesionalProps): React.JSX.Element {
  const [abierto, setAbierto] = useState(false)
  const conFormacion = tieneFormacion(profesional.formacion)
  const chips = especialidadesVisibles(profesional.especialidades)

  return (
    <article className={styles.tarjeta}>
      <div className={styles.panel} data-equipo-panel>
        <span aria-hidden="true" className={styles.avatar}>
          {inicialesDe(profesional.nombre)}
        </span>
      </div>
      <div className={styles.cuerpo}>
        <div className={styles.fila}>
          <div>
            <h3>{profesional.nombre}</h3>
            <p data-equipo-cargo>{profesional.rol}</p>
          </div>
          {conFormacion && (
            <button
              type="button"
              data-equipo-control
              aria-expanded={abierto}
              aria-label={rotuloBoton(abierto, profesional.nombre)}
              onClick={() => setAbierto((valorPrevio) => !valorPrevio)}
            >
              <span aria-hidden="true">+</span>
            </button>
          )}
        </div>
        {conFormacion && abierto && (
          <div className={styles.ficha} data-equipo-ficha>
            <p>{profesional.formacion}</p>
          </div>
        )}
        {chips.length > 0 && (
          <ul className={styles.chips}>
            {chips.map((chip) => (
              <li key={chip}>{chip}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}

/** Sección de presentación del equipo de la landing. */
export function Equipo({ listado = EQUIPO }: EquipoProps = {}): React.JSX.Element | null {
  const validos = profesionalesValidos(listado)
  if (validos.length === 0) {
    return null
  }
  const resumen = resumenDelEquipo(
    validos.length,
    hayFormacionPublicada(validos),
    datosNegocio.identidad.nombreComercial,
  )
  return (
    <section aria-label="Equipo" className={styles.equipo} data-contenedor-principal>
      <div className={styles.cabecera} data-equipo-cabecera>
        <p className={styles.eyebrow}>{ROTULO_CINTILLO}</p>
        <h2>{TITULO}</h2>
        <p className={styles.resumen} data-equipo-resumen>
          {resumen}
        </p>
      </div>
      <div className={styles.rejilla}>
        {validos.map((profesional) => (
          <TarjetaProfesional key={profesional.nombre} profesional={profesional} />
        ))}
      </div>
    </section>
  )
}
