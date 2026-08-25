import React, { useState } from 'react'
import { EQUIPO, type Profesional } from '../data/equipo'
import { profesionalesValidos, rotuloBoton, tieneFormacion } from './Equipo-logica'
import styles from './Equipo.module.scss'

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

  return (
    <article className={styles.tarjeta}>
      <h3>{profesional.nombre}</h3>
      <p>{profesional.rol}</p>
      {conFormacion && (
        <button type="button" aria-expanded={abierto} onClick={() => setAbierto((valorPrevio) => !valorPrevio)}>
          {rotuloBoton(abierto, profesional.nombre)}
        </button>
      )}
      {conFormacion && abierto && <p>{profesional.formacion}</p>}
    </article>
  )
}

/** Sección de presentación del equipo de la landing. */
export function Equipo({ listado = EQUIPO }: EquipoProps = {}): React.JSX.Element | null {
  const validos = profesionalesValidos(listado)
  if (validos.length === 0) {
    return null
  }
  return (
    <section aria-label="Equipo" className={styles.equipo} data-contenedor-principal>
      <h2>Equipo</h2>
      {validos.map((profesional) => (
        <TarjetaProfesional key={profesional.nombre} profesional={profesional} />
      ))}
    </section>
  )
}
