import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { datosNegocio } from './site'

/** El código fuente en crudo de `site.ts`, leído por Vite (sin `node:fs`: ver `puertaTelefonoHardcodeado.test.ts`). */
const FUENTE_SITE_TS = Object.values(
  import.meta.glob('./site.ts', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
)[0] as string

/** Vista mínima de prueba: pide el teléfono a la fuente única, nunca lo escribe a mano (@s4). */
function VistaTelefonoClinica(): React.JSX.Element {
  const { telefonoClinica } = datosNegocio
  return <a href={telefonoClinica.enlaceLlamada}>{telefonoClinica.textoVisible}</a>
}

describe('@s1 el texto visible del teléfono de la clínica y su enlace de llamada salen del mismo dato', () => {
  it('texto visible "91 082 92 67", enlace "tel:+34910829267" y mismo número nacional en ambos', () => {
    const { telefonoClinica } = datosNegocio

    expect(telefonoClinica.textoVisible).toBe('91 082 92 67')
    expect(telefonoClinica.enlaceLlamada).toBe('tel:+34910829267')
    expect(telefonoClinica.textoVisible.replace(/\s/g, '')).toBe('910829267')
  })

  it('refuerzo mutación: sin rótulo indicado, la clave "rotulo" no existe en absoluto (no queda "rotulo: undefined")', () => {
    const { telefonoClinica } = datosNegocio

    expect('rotulo' in telefonoClinica).toBe(false)
  })
})

describe('@s2 el segundo teléfono publicado deriva su enlace del mismo modo', () => {
  it('texto visible "685 34 31 49", enlace "tel:+34685343149" y destino sin separadores', () => {
    const { telefonoMovil } = datosNegocio

    expect(telefonoMovil.textoVisible).toBe('685 34 31 49')
    expect(telefonoMovil.enlaceLlamada).toBe('tel:+34685343149')
    expect(telefonoMovil.enlaceLlamada).not.toMatch(/[\s.-]/)
  })
})

describe('@s3 el teléfono de urgencias conserva el rótulo real del cliente y nunca anuncia 24 h', () => {
  it('rótulo "Urgencias fuera de horario", texto visible y enlace derivados, sin ninguna mención a 24 h', () => {
    const { telefonoUrgencias } = datosNegocio

    expect(telefonoUrgencias.rotulo).toBe('Urgencias fuera de horario')
    expect(telefonoUrgencias.textoVisible).toBe('91 851 13 93')
    expect(telefonoUrgencias.enlaceLlamada).toBe('tel:+34918511393')

    for (const texto of [telefonoUrgencias.rotulo, telefonoUrgencias.textoVisible]) {
      expect(texto).not.toContain('24 h')
      expect(texto).not.toContain('24h')
      expect(texto).not.toContain('todos los días')
    }
  })
})

describe('@s4 el enlace de llamada renderizado expone el número derivado y no uno escrito a mano', () => {
  it('el enlace tiene rol "link", nombre accesible con el número y destino "tel:+34910829267"', () => {
    render(<VistaTelefonoClinica />)

    const enlace = screen.getByRole('link', { name: /91 082 92 67/ })

    expect(enlace).toHaveAttribute('href', 'tel:+34910829267')

    const digitosDelNombre = (enlace.textContent ?? '').replace(/\D/g, '')
    const digitosDelDestino = (enlace.getAttribute('href') ?? '').replace('tel:+34', '')
    expect(digitosDelNombre).toBe('910829267')
    expect(digitosDelDestino).toBe('910829267')
  })
})

describe('@s5 el enlace de mensajería deriva del mismo dato con el formato propio de ese canal', () => {
  it('sin texto previo, el enlace es "https://wa.me/34685343149" sin "+" ni "?"', () => {
    const enlace = datosNegocio.telefonoMovil.enlaceMensajeria()

    expect(enlace).toBe('https://wa.me/34685343149')
    expect(enlace).not.toContain('+')
    expect(enlace).not.toContain('?')
  })
})

describe('@s6 el texto que acompaña al enlace de mensajería viaja codificado', () => {
  it('con texto "Hola, quiero pedir cita en Galapavet." el enlace lo codifica y no contiene espacios literales', () => {
    const enlace = datosNegocio.telefonoMovil.enlaceMensajeria('Hola, quiero pedir cita en Galapavet.')

    expect(enlace).toBe('https://wa.me/34685343149?text=Hola%2C%20quiero%20pedir%20cita%20en%20Galapavet.')
    expect(enlace).not.toContain(' ')
  })
})

describe('@s13 el horario declarado es exactamente el que publica el cliente, con los domingos cerrados', () => {
  it('exactamente 3 tramos, en orden: laborables, sábados y domingos cerrado', () => {
    const { horario } = datosNegocio

    expect(horario).toHaveLength(3)
    expect(horario[0]).toEqual({ dias: 'Lunes a viernes', horas: '11:00 a 14:00 y 16:30 a 20:00' })
    expect(horario[1]).toEqual({ dias: 'Sábados', horas: '11:00 a 14:00' })
    expect(horario[2]).toEqual({ dias: 'Domingos', horas: 'Cerrado' })
  })
})

describe('@s14 ningún tramo del horario anuncia 24 horas ni apertura en domingo', () => {
  it('ningún tramo contiene "24 h", "24h" ni "todos los días del año", y el tramo de domingo declara "Cerrado"', () => {
    const { horario } = datosNegocio

    for (const tramo of horario) {
      expect(tramo.dias).not.toContain('24 h')
      expect(tramo.dias).not.toContain('24h')
      expect(tramo.dias).not.toContain('todos los días del año')
      expect(tramo.horas).not.toContain('24 h')
      expect(tramo.horas).not.toContain('24h')
      expect(tramo.horas).not.toContain('todos los días del año')
    }

    const tramosDomingo = horario.filter((tramo) => tramo.dias.includes('Domingos'))
    expect(tramosDomingo).toHaveLength(1)
    expect(tramosDomingo[0]?.horas).toBe('Cerrado')
  })
})

describe('@s15 el cliente no publica email, así que la fuente única no lo declara ni lo sustituye', () => {
  it('datosNegocio.email no tiene ningún valor y el código fuente no contiene ningún email ni "mailto:"', () => {
    expect(datosNegocio.email).toBeUndefined()

    expect(FUENTE_SITE_TS).not.toContain('info@galapavet.com')
    expect(FUENTE_SITE_TS).not.toMatch(/@galapavet\.com/)
    expect(FUENTE_SITE_TS).not.toContain('mailto:')
  })
})

describe('@s16 el cliente no publica redes sociales, así que la fuente única no las inventa', () => {
  it('la lista de perfiles está vacía y el código fuente no cita ningún dominio de red social', () => {
    expect(datosNegocio.redesSociales).toEqual([])

    for (const dominio of ['facebook.com', 'instagram.com', 'x.com', 'twitter.com', 'tiktok.com']) {
      expect(FUENTE_SITE_TS).not.toContain(dominio)
    }
  })
})

describe('@s17 la dirección se declara una vez y sus dos formas dicen lo mismo', () => {
  it('líneas visibles y forma de una sola línea derivan del mismo dato', () => {
    const { direccion } = datosNegocio

    expect(direccion.lineas).toEqual(['Carretera de Torrelodones, 11', '28260 Galapagar, Madrid'])
    expect(direccion.unaLinea).toBe('Carretera de Torrelodones, 11, 28260 Galapagar, Madrid')
    expect(direccion.unaLinea).toContain('28260')
    expect(direccion.unaLinea).toContain('Galapagar')
  })
})

describe('@s18 la fuente única no declara coordenadas geográficas porque el cliente no las publica', () => {
  it('no hay coordenadas y la dirección postal sigue disponible para centrar el mapa', () => {
    expect(datosNegocio.coordenadas).toBeUndefined()
    expect(datosNegocio.direccion.unaLinea).toBe('Carretera de Torrelodones, 11, 28260 Galapagar, Madrid')
  })
})

describe('@s21 la identidad del negocio se declara una sola vez y su forma compuesta no diverge', () => {
  it('nombre comercial, descriptor y forma compuesta de descriptor con localidad', () => {
    const { identidad } = datosNegocio

    expect(identidad.nombreComercial).toBe('Galapavet')
    expect(identidad.descriptor).toBe('Centro integral veterinario')
    expect(identidad.descriptorConLocalidad).toBe('Centro integral veterinario en Galapagar, Madrid.')
  })
})
