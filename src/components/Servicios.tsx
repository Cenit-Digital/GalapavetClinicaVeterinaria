import React, { useState } from 'react'
import { SERVICIOS, type BloqueServicio } from '../data/servicios'
import { nombreAccesibleBoton, puntosVisibles, rotuloBoton, tieneDesglose } from './Servicios-logica'
import styles from './Servicios.module.scss'

interface ServiciosProps {
  /** Catálogo de bloques a mostrar. Por defecto, el catálogo real del proyecto. */
  catalogo?: readonly BloqueServicio[]
}

interface TarjetaServicioProps {
  bloque: BloqueServicio
}

/** Cada tarjeta guarda su propio abierto/cerrado, independiente del resto (@s12/@s13). */
function TarjetaServicio({ bloque }: TarjetaServicioProps): React.JSX.Element {
  const [abierto, setAbierto] = useState(false)
  const conDesglose = tieneDesglose(bloque.puntos)

  return (
    <article className={styles.tarjeta}>
      <h3>{bloque.titulo}</h3>
      {conDesglose && (
        <button
          type="button"
          aria-expanded={abierto}
          aria-label={nombreAccesibleBoton(rotuloBoton(abierto), bloque.titulo)}
          onClick={() => setAbierto((valorPrevio) => !valorPrevio)}
        >
          {rotuloBoton(abierto)}
        </button>
      )}
      {conDesglose && abierto && (
        <ul>
          {puntosVisibles(bloque.puntos).map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ul>
      )}
    </article>
  )
}

/** Sección de catálogo de servicios de la landing. Cada tarjeta expande su desglose de forma independiente. */
export function Servicios({ catalogo = SERVICIOS }: ServiciosProps = {}): React.JSX.Element | null {
  if (catalogo.length === 0) {
    return null
  }
  return (
    <section className={styles.servicios}>
      <h2>Servicios</h2>
      {catalogo.map((bloque) => (
        <TarjetaServicio key={bloque.titulo} bloque={bloque} />
      ))}
    </section>
  )
}
