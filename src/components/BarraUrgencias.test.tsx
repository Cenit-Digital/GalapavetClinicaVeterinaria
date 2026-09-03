import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { datosNegocio } from '../lib/site'
import { BarraUrgencias } from './BarraUrgencias'

describe('barra de urgencias', () => {
  it('@s1 de fidelidad_cabecera separa el rótulo y el teléfono real dentro del único enlace de llamada', () => {
    render(React.createElement(BarraUrgencias))

    const enlace = screen.getByRole('link', { name: new RegExp(datosNegocio.telefonoUrgencias.textoVisible) })
    expect(enlace).toHaveAttribute('href', datosNegocio.telefonoUrgencias.enlaceLlamada)
    expect(enlace.querySelector('strong')).toHaveTextContent(datosNegocio.telefonoUrgencias.rotulo ?? '')
    expect(enlace.querySelector('[data-telefono-urgencias]')).toHaveTextContent(datosNegocio.telefonoUrgencias.textoVisible)
    expect(enlace).not.toHaveTextContent('24 h')
    expect(enlace).not.toHaveTextContent('24h')
  })
})
