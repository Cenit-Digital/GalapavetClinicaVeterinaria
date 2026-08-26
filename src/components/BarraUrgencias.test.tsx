import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { datosNegocio } from '../lib/site'
import { BarraUrgencias } from './BarraUrgencias'

describe('barra de urgencias', () => {
  it('@s27 muestra el rótulo y el enlace de llamada derivados de la fuente única', () => {
    render(React.createElement(BarraUrgencias))

    const enlace = screen.getByRole('link', { name: new RegExp(datosNegocio.telefonoUrgencias.textoVisible) })
    expect(enlace).toHaveTextContent(datosNegocio.telefonoUrgencias.rotulo ?? '')
    expect(enlace).toHaveAttribute('href', datosNegocio.telefonoUrgencias.enlaceLlamada)
  })
})
