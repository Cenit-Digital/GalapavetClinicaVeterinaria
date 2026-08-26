import React from 'react'
import { datosNegocio } from '../lib/site'
import styles from './BarraUrgencias.module.scss'

/** Aviso de urgencias fuera de horario con los únicos datos publicados por la clínica. */
export function BarraUrgencias(): React.JSX.Element {
  const { telefonoUrgencias } = datosNegocio
  return (
    <aside className={styles.barra} aria-label={telefonoUrgencias.rotulo}>
      <span aria-hidden="true">●</span>
      <a href={telefonoUrgencias.enlaceLlamada}>{`${telefonoUrgencias.rotulo} · ${telefonoUrgencias.textoVisible}`}</a>
    </aside>
  )
}
