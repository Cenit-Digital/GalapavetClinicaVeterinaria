import React from 'react'
import { datosNegocio } from '../lib/site'
import styles from './BarraUrgencias.module.scss'

/** Aviso de urgencias fuera de horario con los únicos datos publicados por la clínica. */
export function BarraUrgencias(): React.JSX.Element {
  const { telefonoUrgencias } = datosNegocio
  return (
    <aside className={styles.barra} aria-label={telefonoUrgencias.rotulo}>
      <div className={styles.interior} data-barra-urgencias-interior>
        <span className={styles.punto} aria-hidden="true" />
        <a href={telefonoUrgencias.enlaceLlamada}>
          <strong>{telefonoUrgencias.rotulo}</strong>
          <span aria-hidden="true"> · </span>
          <span data-telefono-urgencias>{telefonoUrgencias.textoVisible}</span>
        </a>
      </div>
    </aside>
  )
}
