import React from 'react'
import { hrefDeDestino } from '../lib/hrefDeDestino'
import styles from './PaginaNoEncontrada.module.scss'

/**
 * Catch-all de cualquier ruta de subpágina que todavía no aterriza contenido
 * propio (`/campanas`, `/blog`, `/tienda`, ya `spec_ready` pero fuera de
 * alcance de esta feature) y de cualquier deep-link no registrado (@s12/@s13).
 */
export function PaginaNoEncontrada(): React.JSX.Element {
  return (
    <section className={styles.paginaNoEncontrada} data-contenedor-principal>
      <h1>Página no encontrada</h1>
      <a href={hrefDeDestino('/')}>Volver al inicio</a>
    </section>
  )
}
