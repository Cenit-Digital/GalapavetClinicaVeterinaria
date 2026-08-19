import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Hero } from './Hero'

/** Centraliza el render de `Hero` bajo test. */
function renderizarHero(props: React.ComponentProps<typeof Hero> = {}): ReturnType<typeof render> {
  return render(<Hero {...props} />)
}

describe('@s1 se muestran la ubicación real y el titular principal', () => {
  it('el h1 tiene el nombre accesible exacto, se ve "Galapagar · Madrid" y no aparece "Miraflores de la Sierra"', () => {
    const { container } = renderizarHero()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cuidamos la salud y la felicidad de tu mascota' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Galapagar · Madrid')).toBeInTheDocument()
    expect(container).not.toHaveTextContent('Miraflores de la Sierra')
  })
})

describe('@s2 el texto descriptivo solo nombra servicios que el cliente presta', () => {
  it('contiene los cinco servicios reales y no contiene "urgencias" ni "24 h"', () => {
    const { container } = renderizarHero()

    for (const servicio of [
      'medicina general',
      'cirugía y anestesia',
      'diagnóstico de imagen',
      'análisis',
      'especialidades',
    ]) {
      expect(container).toHaveTextContent(servicio)
    }
    expect(container).not.toHaveTextContent('urgencias')
    expect(container).not.toHaveTextContent('24 h')
  })
})

describe('@s3 el botón principal lleva a la sección de reserva', () => {
  it('el enlace "Reservar cita" apunta exactamente a "#reservar"', () => {
    renderizarHero()

    expect(screen.getByRole('link', { name: 'Reservar cita' })).toHaveAttribute('href', '#reservar')
  })
})

describe('@s4 el botón secundario inicia una llamada al teléfono real de la clínica', () => {
  it('el enlace "Llamar 91 082 92 67" apunta exactamente a "tel:+34910829267"', () => {
    renderizarHero()

    expect(screen.getByRole('link', { name: 'Llamar 91 082 92 67' })).toHaveAttribute('href', 'tel:+34910829267')
  })
})

describe('@s5 el número visible y el destino de la llamada no pueden divergir', () => {
  it('los dígitos del nombre accesible y los del destino, sin el prefijo "34", son ambos "910829267"', () => {
    renderizarHero()

    const enlace = screen.getByRole('link', { name: /^Llamar/ })
    const digitosDelNombre = (enlace.textContent ?? '').replace(/\D/g, '')
    const digitosDelDestino = (enlace.getAttribute('href') ?? '').replace('tel:+34', '')

    expect(digitosDelNombre).toBe('910829267')
    expect(digitosDelDestino).toBe('910829267')
  })
})

describe('@s6 la franja inferior muestra el horario real de atención', () => {
  it('exactamente 3 entradas: "Lunes a viernes", "Sábados" y "Domingos" con sus horas', () => {
    renderizarHero()

    const rotulos = screen.getAllByRole('term')
    expect(rotulos).toHaveLength(3)

    expect(screen.getByText('Lunes a viernes').nextElementSibling).toHaveTextContent(
      '11:00 a 14:00 y 16:30 a 20:00',
    )
    expect(screen.getByText('Sábados').nextElementSibling).toHaveTextContent('11:00 a 14:00')
    expect(screen.getByText('Domingos').nextElementSibling).toHaveTextContent('Cerrado')
  })
})

describe('@s7 no aparece ninguna cifra de reputación, antigüedad ni volumen', () => {
  it('el texto de la sección no contiene ninguna de las cifras inventadas del prototipo heredado', () => {
    const { container } = renderizarHero()

    for (const cifra of ['12 años', '8.400', '327', '4,9', '4,6', 'reseñas', '★']) {
      expect(container).not.toHaveTextContent(cifra)
    }
  })
})

describe('@s8 la sección de bienvenida no anuncia urgencias', () => {
  it('sin "24 h", sin "Urgencias" y sin ningún enlace a "tel:+34918511393"', () => {
    const { container } = renderizarHero()

    expect(container).not.toHaveTextContent('24 h')
    expect(container).not.toHaveTextContent('Urgencias')
    for (const enlace of screen.getAllByRole('link')) {
      expect(enlace.getAttribute('href')).not.toBe('tel:+34918511393')
    }
  })
})

describe('@s9 sin teléfono en la fuente única no se renderiza el botón de llamada', () => {
  it('no existe ningún enlace "tel:" y sigue existiendo "Reservar cita"', () => {
    renderizarHero({ telefono: null })

    for (const enlace of screen.getAllByRole('link')) {
      expect(enlace.getAttribute('href')).not.toMatch(/^tel:/)
    }
    expect(screen.getByRole('link', { name: 'Reservar cita' })).toBeInTheDocument()
  })
})

describe('@s10 sin horario en la fuente única no se renderiza la franja inferior', () => {
  it('se muestran exactamente 0 entradas de horario y siguen existiendo el h1 y "Reservar cita"', () => {
    renderizarHero({ horario: null })

    expect(screen.queryAllByRole('term')).toHaveLength(0)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cuidamos la salud y la felicidad de tu mascota' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reservar cita' })).toBeInTheDocument()
  })
})

describe('@s11 un teléfono que no normaliza falla cerrado, sin enlace a medias', () => {
  it('renderizar con el teléfono "91 082 92" lanza y no llega a existir ningún enlace "tel:"', () => {
    expect(() => renderizarHero({ telefono: '91 082 92' })).toThrow('91 082 92')
    expect(document.querySelector('a[href^="tel:"]')).toBeNull()
  })
})

describe('@s13 la sección de bienvenida no carga recursos de terceros por atributos DOM', () => {
  it('ningún elemento declara "src"/"srcset" que empiece por "http" y todo destino empieza por "#" o "tel:"', () => {
    const { container } = renderizarHero()

    for (const elemento of container.querySelectorAll('[src], [srcset]')) {
      expect(elemento.getAttribute('src') ?? '').not.toMatch(/^http/)
      expect(elemento.getAttribute('srcset') ?? '').not.toMatch(/^http/)
    }
    for (const enlace of screen.getAllByRole('link')) {
      const destino = enlace.getAttribute('href') ?? ''
      expect(destino.startsWith('#') || destino.startsWith('tel:')).toBe(true)
    }
  })
})
