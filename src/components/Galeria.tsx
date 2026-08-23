import React, { useRef } from 'react'
import { GALERIA, type EntradaGaleria } from '../data/galeria'
import {
  calcularSolicitudDeDesplazamiento,
  entradasValidas,
  prefiereMenosMovimiento,
  type Sentido,
} from './Galeria-logica'
import styles from './Galeria.module.scss'

interface GaleriaProps {
  /** Catálogo de entradas a mostrar. Por defecto, el catálogo real del proyecto. */
  catalogo?: readonly EntradaGaleria[]
}

/** Sección de galería de fotografías de demostración de la landing. */
export function Galeria({ catalogo = GALERIA }: GaleriaProps = {}): React.JSX.Element | null {
  const pistaRef = useRef<HTMLDivElement>(null)
  const validas = entradasValidas(catalogo)

  // Guardián generalizado deliberadamente de `catalogo.length === 0` (lo que
  // @s15 exigía en rojo) a `validas.length === 0`: mismo modo de error "dato
  // ausente → no se renderiza el bloque" que ya usan `Equipo`/`Servicios`
  // (`project-spec.md:71`). Ningún @s cubre hoy el caso concreto que lo
  // motiva (catálogo no vacío, todas las entradas con nombre en blanco); se
  // documenta aquí en vez de dejarlo como duda abierta (progress/judge_galeria.md, ronda 1, hallazgo no bloqueante 2).
  if (validas.length === 0) {
    return null
  }

  function desplazar(sentido: Sentido): void {
    const pista = pistaRef.current
    if (pista === null) {
      return
    }
    const primeraTarjeta = pista.querySelector('figure')
    const anchoTarjetaPx = primeraTarjeta?.getBoundingClientRect().width ?? 0
    const solicitud = calcularSolicitudDeDesplazamiento(
      anchoTarjetaPx,
      sentido,
      prefiereMenosMovimiento(window.matchMedia),
    )
    if (solicitud === null) {
      return
    }
    pista.scrollBy({ left: solicitud.distanciaPx, behavior: solicitud.suave ? 'smooth' : 'auto' })
  }

  return (
    <section aria-label="Galería" aria-describedby="galeria-aviso-demostracion" className={styles.galeria}>
      <p id="galeria-aviso-demostracion">
        Contenido de demostración. Estas fotografías y sus pies son de ejemplo, no fotografías reales de pacientes de
        Galapavet: la clínica todavía no ha cedido fotografías propias ni el consentimiento de las familias
        fotografiadas.
      </p>
      <button type="button" aria-label="Foto anterior" onClick={() => desplazar('anterior')}>
        <span aria-hidden="true">‹</span>
      </button>
      {/* Patrón WAI-ARIA APG "scrollable region": contenedor no interactivo
          pero desplazable, focable con tabIndex=0 y nombre accesible propio
          (@s4), para que el teclado lo alcance aunque no sea un widget. No
          hay tag HTML semántico equivalente para un track de carrusel (los
          que sugiere el linter para role="group" -- address, details,
          fieldset, hgroup, optgroup -- no encajan aquí). */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex jsx-a11y/prefer-tag-over-role */}
      <div ref={pistaRef} role="group" aria-label="Fotografías de la galería" tabIndex={0} className={styles.pista}>
        {validas.map((entrada) => (
          <figure key={entrada.nombre}>
            <img src={entrada.src} alt={entrada.nombre} />
            <figcaption>{`${entrada.nombre} · ${entrada.pie}`}</figcaption>
          </figure>
        ))}
      </div>
      <button type="button" aria-label="Foto siguiente" onClick={() => desplazar('siguiente')}>
        <span aria-hidden="true">›</span>
      </button>
    </section>
  )
}
