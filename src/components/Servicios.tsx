import React, { useId, useState } from 'react'
import { SERVICIOS, type BloqueServicio } from '../data/servicios'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import { datosNegocio } from '../lib/site'
import {
  categoriaDeServicio,
  nombreAccesibleBoton,
  puntosVisibles,
  resumenDeServicio,
  rotuloBoton,
  tieneDesglose,
} from './Servicios-logica'
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
  const idDetalle = useId()
  const conDesglose = tieneDesglose(bloque.puntos)

  return (
    <article className={styles.tarjeta} data-tarjeta-servicio>
      {bloque.imagen !== undefined && (
        <div className={styles.imagen}>
          <img
            data-imagen-servicio
            src={hrefDeDestino(bloque.imagen)}
            alt=""
            width={800}
            height={500}
            loading="lazy"
            decoding="async"
          />
          <span className={styles.categoria} data-categoria-servicio>
            {categoriaDeServicio(bloque.titulo)}
          </span>
        </div>
      )}
      <div className={styles.cuerpo}>
        <h3>{bloque.titulo}</h3>
        <p className={styles.resumen} data-resumen-servicio>
          {resumenDeServicio(bloque.puntos)}
        </p>
        {conDesglose && abierto && (
          <div id={idDetalle} className={styles.detalle} data-detalle-servicio>
            <ul>
              {puntosVisibles(bloque.puntos).map((punto) => (
                <li key={punto}>{punto}</li>
              ))}
            </ul>
          </div>
        )}
        {conDesglose && (
          <button
            type="button"
            data-servicio-control
            aria-expanded={abierto}
            aria-controls={idDetalle}
            aria-label={nombreAccesibleBoton(rotuloBoton(abierto), bloque.titulo)}
            onClick={() => setAbierto((valorPrevio) => !valorPrevio)}
          >
            {rotuloBoton(abierto)}
          </button>
        )}
      </div>
    </article>
  )
}

/** Sección de catálogo de servicios de la landing. Cada tarjeta expande su desglose de forma independiente. */
export function Servicios({ catalogo = SERVICIOS }: ServiciosProps = {}): React.JSX.Element | null {
  if (catalogo.length === 0) {
    return null
  }
  const localidad = datosNegocio.direccion.localidad
  return (
    <section className={styles.servicios} data-contenedor-principal data-servicios-contenido>
      <div className={styles.encabezado} data-servicios-cabecera>
        <p className={styles.eyebrow} data-servicios-cintillo>
          Lo que hacemos
        </p>
        <h2>
          Servicios veterinarios <em>{`en ${localidad}`}</em>
        </h2>
        <p className={styles.apoyo} data-servicios-apoyo>
          {`Nuestro catálogo reúne ${catalogo.length} servicios veterinarios publicados en ${localidad}. Abre cada tarjeta para ver qué incluye.`}
        </p>
      </div>
      <div className={styles.rejilla}>
        {catalogo.map((bloque) => (
          <TarjetaServicio key={bloque.titulo} bloque={bloque} />
        ))}
      </div>
    </section>
  )
}
