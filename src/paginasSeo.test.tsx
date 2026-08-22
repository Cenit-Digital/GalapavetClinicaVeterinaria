import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { Landing } from './pages/Landing'

/** Renderiza la app entera en una ruta real, igual que "cargo la página de X" del `.feature`. */
function cargarPagina(ruta: string): ReturnType<typeof render> {
  window.history.pushState(null, '', ruta)
  const arbol: React.JSX.Element = <App />
  return render(arbol)
}

function bloqueDeDatosEstructurados(): Record<string, unknown> {
  const script = document.head.querySelector('script[type="application/ld+json"]')
  return JSON.parse(script?.textContent ?? '{}') as Record<string, unknown>
}

beforeEach(() => {
  window.history.pushState(null, '', '/')
})

const RUTAS_DE_LAS_SEIS_PAGINAS: readonly string[] = [
  '/',
  '/campanas',
  '/campanas?campana=vacunaciones',
  '/blog',
  '/blog/demo-1',
  '/tienda',
]

describe('@s4/@s5 (integración) cada una de las seis rutas reales fija su propio título en document.title', () => {
  it.each(RUTAS_DE_LAS_SEIS_PAGINAS)('la ruta "%s" fija un document.title no vacío que contiene "Galapavet"', (ruta) => {
    cargarPagina(ruta)

    expect(document.title.trim()).not.toBe('')
    expect(document.title).toContain('Galapavet')
  })

  it('las seis rutas reales producen seis títulos distintos entre sí', () => {
    const titulos = RUTAS_DE_LAS_SEIS_PAGINAS.map((ruta) => {
      cargarPagina(ruta)
      return document.title
    })

    expect(new Set(titulos)).toHaveProperty('size', 6)
  })
})

describe('@s12 el bloque describe el mismo negocio en todas las páginas', () => {
  it('las seis rutas reales declaran el mismo nombre, dirección, teléfono y tramos de horario', () => {
    const bloques = RUTAS_DE_LAS_SEIS_PAGINAS.map((ruta) => {
      cargarPagina(ruta)
      return bloqueDeDatosEstructurados()
    })

    for (const bloque of bloques) {
      expect(bloque.name).toEqual(bloques[0]?.name)
      expect(bloque.address).toEqual(bloques[0]?.address)
      expect(bloque.telephone).toEqual(bloques[0]?.telephone)
      expect(bloque.openingHoursSpecification).toEqual(bloques[0]?.openingHoursSpecification)
    }
  })
})

describe('@s10 lo que lee la máquina coincide con lo que lee la persona', () => {
  it('nombre, calle, CP/localidad, teléfono y horario del bloque coinciden con el panel de contacto visible de la portada', () => {
    cargarPagina('/')
    const bloque = bloqueDeDatosEstructurados()
    const direccion = bloque.address as Record<string, unknown>

    expect(bloque.name).toBe('Galapavet')

    const panel = screen.getByRole('region', { name: 'Información de contacto' })
    expect(panel).toHaveTextContent(direccion.streetAddress as string)
    expect(panel).toHaveTextContent(`${direccion.postalCode as string} ${direccion.addressLocality as string}`)

    const enlacesTelefono = within(screen.getByRole('group', { name: 'Teléfonos' })).getAllByRole('link')
    const primerEnlace = enlacesTelefono[0]
    const segundoEnlace = enlacesTelefono[1]
    expect(primerEnlace).toBeDefined()
    expect(segundoEnlace).toBeDefined()

    const digitosDeclarados = String(bloque.telephone).replace(/\D/g, '')
    const digitosPrimerEnlace = (primerEnlace?.textContent ?? '').replace(/\D/g, '')
    const digitosSegundoEnlace = (segundoEnlace?.textContent ?? '').replace(/\D/g, '')
    const digitosUrgencias = (
      within(screen.getByRole('group', { name: 'Urgencias fuera de horario' })).getByRole('link').textContent ?? ''
    ).replace(/\D/g, '')

    expect(digitosDeclarados.endsWith(digitosPrimerEnlace)).toBe(true)
    expect(digitosDeclarados.endsWith(digitosSegundoEnlace)).toBe(false)
    expect(digitosDeclarados.endsWith(digitosUrgencias)).toBe(false)

    const tramos = bloque.openingHoursSpecification as ReadonlyArray<{ opens: string; closes: string }>
    for (const tramo of tramos) {
      expect(panel).toHaveTextContent(`${tramo.opens} a ${tramo.closes}`)
    }
  })
})

describe('@s11 cambiar el dato en la fuente única mueve a la vez el bloque y el texto visible', () => {
  it('con la calle sustituida, el texto visible y la calle del bloque muestran el valor nuevo, y ninguno muestra el anterior', () => {
    const CALLE_NUEVA = 'Avenida de Prueba Sustituida, 5'
    const CALLE_ANTERIOR = 'Carretera de Torrelodones, 11'

    render(
      <BrowserRouter>
        <Landing calleDireccion={CALLE_NUEVA} />
      </BrowserRouter>,
    )

    expect(document.body).toHaveTextContent(CALLE_NUEVA)
    expect(document.body).not.toHaveTextContent(CALLE_ANTERIOR)

    const bloque = bloqueDeDatosEstructurados()
    const direccion = bloque.address as Record<string, unknown>
    expect(direccion.streetAddress).toBe(CALLE_NUEVA)
    expect(JSON.stringify(bloque)).not.toContain(CALLE_ANTERIOR)
  })
})
