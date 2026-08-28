import React, { useState } from 'react'
import { EQUIPO, type Profesional } from '../data/equipo'
import { inicialesDe, profesionalesValidos, rotuloBoton, tieneFormacion } from './Equipo-logica'
import styles from './Equipo.module.scss'

/**
 * Cintillo de la sección (@s33 de `rediseno_visual.feature`): escrito en
 * minúsculas/mayúscula inicial a propósito — las versalitas las aplica el
 * mixin `eyebrow` (`src/styles/_api.scss:324-332`) vía `text-transform`, no
 * un literal ya en mayúsculas, igual que `ReservaChat.tsx:123`.
 */
const ROTULO_CINTILLO = 'Nuestro equipo'

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
      <span aria-hidden="true" className={styles.avatar}>
        {inicialesDe(profesional.nombre)}
      </span>
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
      <p className={styles.eyebrow}>{ROTULO_CINTILLO}</p>
      <h2>Equipo</h2>
      {validos.map((profesional) => (
        <TarjetaProfesional key={profesional.nombre} profesional={profesional} />
      ))}
    </section>
  )
}
