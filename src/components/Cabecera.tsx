import React, { useEffect, useId, useRef, useState } from 'react'
import { ENLACES_NAVEGACION, type EnlaceNavegacion } from '../data/navegacion'
import { decidirComportamientoDesplazamiento } from '../lib/desplazamiento'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import { datosNegocio } from '../lib/site'
import { esAncla, esDestinoTienda, esMovil, esPaginaActual, posicionDeScrollParaAncla } from './Cabecera-logica'
import styles from './Cabecera.module.scss'

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
  /**
   * El panel móvil cierra el menú y, si hace falta, evita la navegación
   * completa (@s9/@s10); la navegación de escritorio calcula el salto a un
   * ancla desde la altura real de la franja fija (@s28). Cada rama pasa su
   * propio manejador.
   */
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
            href={hrefDeDestino(enlace.destino)}
            aria-current={esPaginaActual(enlace.destino, rutaActual) ? 'page' : undefined}
            data-enlace-tienda={esDestinoTienda(enlace.destino) ? '' : undefined}
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
  const refBotonMenu = useRef<HTMLButtonElement>(null)
  const refCabecera = useRef<HTMLElement>(null)

  /**
   * El sitio del ancla de destino se calcula desde la altura REAL de la
   * franja fija en el momento del clic (@s28), nunca desde un número escrito
   * a mano: `refCabecera` arranca justo debajo de `BarraUrgencias`
   * (`App.tsx`), así que su propio `getBoundingClientRect().bottom` ya suma
   * las dos alturas.
   */
  function desplazarAAncla(destino: string, evento: React.MouseEvent<HTMLAnchorElement>): void {
    if (!esAncla(destino)) {
      return
    }
    const elementoDestino = document.querySelector(destino)
    if (elementoDestino === null) {
      return
    }
    evento.preventDefault()
    const alturaFijaReal = refCabecera.current?.getBoundingClientRect().bottom ?? 0
    const distanciaAlElemento = elementoDestino.getBoundingClientRect().top
    window.scrollTo({
      top: posicionDeScrollParaAncla(window.scrollY, distanciaAlElemento, alturaFijaReal),
      behavior: decidirComportamientoDesplazamiento(window.matchMedia),
    })
    // Actualiza el hash sin el salto nativo del navegador (que ya evitó
    // `preventDefault`, arriba): `pushState`, a diferencia de asignar
    // `window.location.hash`, nunca desplaza por sí solo, así que no pisa el
    // scroll recién calculado.
    window.history.pushState(null, '', destino)
  }

  /** Escape cierra el menú móvil abierto y devuelve el foco al botón que lo abrió (@s25). */
  useEffect(() => {
    if (!abierto) {
      return
    }
    function alPulsarTecla(evento: KeyboardEvent): void {
      if (evento.key === 'Escape') {
        setAbierto(false)
        refBotonMenu.current?.focus()
      }
    }
    document.addEventListener('keydown', alPulsarTecla)
    return () => document.removeEventListener('keydown', alPulsarTecla)
  }, [abierto])

  return (
    <header ref={refCabecera} className={styles.cabecera}>
      <div>
        <a href="#inicio">{datosNegocio.identidad.nombreComercial}</a>
        <p>{datosNegocio.identidad.descriptor}</p>
      </div>
      {hayEnlaces && !movil && (
        <nav aria-label="Navegación principal" className={styles.navPrincipal}>
          <ListaDeEnlaces enlaces={enlaces} rutaActual={rutaActual} alPulsar={desplazarAAncla} />
        </nav>
      )}
      {hayEnlaces && movil && (
        <button
          type="button"
          ref={refBotonMenu}
          className={styles.botonMenu}
          aria-expanded={abierto}
          aria-controls={idPanel}
          onClick={() => setAbierto((valorPrevio) => !valorPrevio)}
        >
          Abrir menú
        </button>
      )}
      {hayEnlaces && movil && abierto && (
        <div id={idPanel} className={styles.panelMovil}>
          <ListaDeEnlaces
            enlaces={enlaces}
            rutaActual={rutaActual}
            alPulsar={(destino, evento) => {
              if (!esAncla(destino)) {
                evento.preventDefault()
                window.history.pushState(null, '', hrefDeDestino(destino))
              }
              setAbierto(false)
            }}
          />
        </div>
      )}
    </header>
  )
}
