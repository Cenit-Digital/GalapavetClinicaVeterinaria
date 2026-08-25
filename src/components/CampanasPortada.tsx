import React from 'react'
import { CAMPANAS_DEMO, type CampanaDemo } from '../data/campanas'
import { construirModeloCampanas } from './CampanasPortada-logica'
import styles from './CampanasPortada.module.scss'

interface CampanasPortadaProps {
  /** Catálogo de demo a mostrar. Por defecto, el catálogo real del proyecto. */
  catalogo?: readonly CampanaDemo[]
}

/**
 * Construye el modelo sin dejar que un dato inválido en el catálogo (precio
 * o vigencia declarados) reviente el árbol de render: falla cerrado a "sin
 * campañas" en vez de propagar la excepción hacia arriba (@s18/@s21).
 */
function construirModeloSeguro(catalogo: readonly CampanaDemo[]): CampanaDemo[] {
  try {
    return construirModeloCampanas(catalogo)
  } catch {
    return []
  }
}

/** Sección de portada que adelanta las campañas de salud de la clínica. */
export function CampanasPortada({ catalogo = CAMPANAS_DEMO }: CampanasPortadaProps = {}): React.JSX.Element | null {
  const modelo = construirModeloSeguro(catalogo)
  if (modelo.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Campañas de prevención"
      aria-describedby="campanas-aviso-demostracion"
      className={styles.campanasPortada}
      data-contenedor-principal
    >
      <h2>Campañas de prevención</h2>
      <p id="campanas-aviso-demostracion">
        Contenido de demostración. Galapavet no ha confirmado ninguna campaña: estas tarjetas muestran el formato
        sobre servicios que la clínica sí presta. Precio, vigencia y condiciones están pendientes de confirmar con la
        clínica.
      </p>
      <ul>
        {modelo.map((campana) => (
          <li key={campana.titulo}>
            <a href="/campanas">
              {campana.imagen !== undefined && (
                <img src={campana.imagen} alt="" width={800} height={450} loading="lazy" decoding="async" />
              )}
              <span>Demostración</span>
              <h3>{campana.titulo}</h3>
            </a>
          </li>
        ))}
      </ul>
      <a href="/campanas">Ver campañas</a>
    </section>
  )
}
