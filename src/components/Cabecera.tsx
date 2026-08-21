import React, { useId, useState } from 'react'
import { ENLACES_NAVEGACION, type EnlaceNavegacion } from '../data/navegacion'
import { datosNegocio } from '../lib/site'
import { esAncla, esMovil, esPaginaActual } from './Cabecera-logica'

interface CabeceraProps {
  /** Ancho de la ventana en píxeles, medido por quien integra el componente. */
  ancho: number
  /** Destinos de la navegación. Por defecto, el catálogo real del proyecto. */
  enlaces?: readonly EnlaceNavegacion[]
  /**
   * Ruta activa (`pathname`), medida por quien integra el componente (mismo
   * patrón que `ancho`, Decisión 22). Por defecto una cadena que ningún
   * destino real iguala, así que sin este prop ningún enlace se marca como
   * actual — retrocompatible con cualquier integración que aún no lo pase.
   */
  rutaActual?: string
}

interface ListaDeEnlacesProps {
  enlaces: readonly EnlaceNavegacion[]
  rutaActual: string
  /** Solo el panel móvil lo usa: cierra el menú y, si hace falta, evita la navegación completa (@s9/@s10). */
  alPulsar?: (destino: string, evento: React.MouseEvent<HTMLAnchorElement>) => void
}

const NINGUNA_RUTA_ACTUAL = ''

/** La misma lista de enlaces sirve para la navegación de escritorio y el panel móvil (@s7). */
function ListaDeEnlaces({ enlaces, rutaActual, alPulsar }: ListaDeEnlacesProps): React.JSX.Element {
  return (
    <ul>
      {enlaces.map((enlace) => (
        <li key={enlace.destino}>
          <a
            href={enlace.destino}
            aria-current={esPaginaActual(enlace.destino, rutaActual) ? 'page' : undefined}
            onClick={alPulsar && ((evento) => alPulsar(enlace.destino, evento))}
          >
            {enlace.nombre}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function Cabecera({
  ancho,
  enlaces = ENLACES_NAVEGACION,
  rutaActual = NINGUNA_RUTA_ACTUAL,
}: CabeceraProps): React.JSX.Element {
  const movil = esMovil(ancho)
  const hayEnlaces = enlaces.length > 0
  const [abierto, setAbierto] = useState(false)
  const idPanel = useId()

  return (
    <header>
      <div>
        <a href="#inicio">{datosNegocio.identidad.nombreComercial}</a>
        <p>{datosNegocio.identidad.descriptor}</p>
      </div>
      {hayEnlaces && !movil && (
        <nav aria-label="Navegación principal">
          <ListaDeEnlaces enlaces={enlaces} rutaActual={rutaActual} />
        </nav>
      )}
      {hayEnlaces && movil && (
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={idPanel}
          onClick={() => setAbierto((valorPrevio) => !valorPrevio)}
        >
          Abrir menú
        </button>
      )}
      {hayEnlaces && movil && abierto && (
        <div id={idPanel}>
          <ListaDeEnlaces
            enlaces={enlaces}
            rutaActual={rutaActual}
            alPulsar={(destino, evento) => {
              if (!esAncla(destino)) {
                evento.preventDefault()
                window.history.pushState(null, '', destino)
              }
              setAbierto(false)
            }}
          />
        </div>
      )}
    </header>
  )
}
