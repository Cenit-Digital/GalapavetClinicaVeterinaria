import React from 'react'
import { CAMPANAS_DEMO, type CampanaDemo } from '../data/campanas'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import { construirModeloCampanas, detalleDeCampana } from './CampanasPortada-logica'
import styles from './CampanasPortada.module.scss'

interface CampanasPortadaProps {
  /** Catálogo de demo a mostrar. Por defecto, el catálogo real del proyecto. */
  catalogo?: readonly CampanaDemo[]
}

/** No propaga al árbol datos comerciales no confirmados: la sección falla cerrada. */
function construirModeloSeguro(catalogo: readonly CampanaDemo[]): CampanaDemo[] {
  try {
    return construirModeloCampanas(catalogo)
  } catch {
    return []
  }
}

/** Sección de portada que adelanta campañas demostrativas sin prometer precio ni vigencia. */
export function CampanasPortada({ catalogo = CAMPANAS_DEMO }: CampanasPortadaProps = {}): React.JSX.Element | null {
  const modelo = construirModeloSeguro(catalogo)
  if (modelo.length === 0) return null

  return (
    <section
      aria-label="Campañas de prevención"
      aria-describedby="campanas-aviso-demostracion"
      className={styles.campanasPortada}
      data-campanas-contenido
      data-contenedor-principal
    >
      <div className={styles.presentacion} data-campanas-presentacion>
        <p className={styles.eyebrow} data-campanas-cintillo>
          Prevención
        </p>
        <h2>Campañas de prevención</h2>
        <p className={styles.aviso} id="campanas-aviso-demostracion">
          Contenido de demostración. Galapavet no ha confirmado ninguna campaña: estas tarjetas muestran el formato
          sobre servicios que la clínica sí presta. Precio, vigencia y condiciones están pendientes de confirmar con la clínica.
        </p>
        <a className={styles.cta} data-campanas-cta href={hrefDeDestino('/campanas')}>
          Ver campañas
        </a>
      </div>
      <ul className={styles.rejilla} data-campanas-rejilla>
        {modelo.map((campana) => {
          const detalle = detalleDeCampana(campana.bloque)
          return (
            <li key={campana.titulo} data-tarjeta-campana>
              <a href={hrefDeDestino('/campanas')}>
                {campana.imagen !== undefined && (
                  <img
                    data-imagen-campana
                    src={hrefDeDestino(campana.imagen)}
                    alt=""
                    width={800}
                    height={450}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className={styles.cuerpo}>
                  <span data-etiqueta-campana>Demostración</span>
                  <h3>{campana.titulo}</h3>
                  {detalle !== null && <p data-detalle-campana>{detalle}</p>}
                </div>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
