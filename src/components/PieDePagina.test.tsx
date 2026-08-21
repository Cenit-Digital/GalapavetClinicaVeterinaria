import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { datosNegocio } from '../lib/site'
import { PieDePagina } from './PieDePagina'

/** Centraliza el render de `PieDePagina` bajo test. */
function renderizarPieDePagina(props: React.ComponentProps<typeof PieDePagina> = {}): ReturnType<typeof render> {
  return render(<PieDePagina {...props} />)
}

const CADENAS_PROHIBIDAS_S1 = ['desde 2013', '2013', '12 años', '8.400', '327', '4,9', '4,6', 'reseñas', '★']

describe('@s1 el bloque de marca identifica al cliente real sin afirmar nada que no esté publicado', () => {
  it('hay exactamente un "contentinfo" con el nombre, la descripción exacta, logo decorativo y sin cifras inventadas', () => {
    renderizarPieDePagina()

    const pies = screen.getAllByRole('contentinfo')
    expect(pies).toHaveLength(1)
    const pie = pies[0]
    if (pie === undefined) {
      throw new Error('No se encontró el elemento con rol "contentinfo"')
    }

    expect(within(pie).getByText('Galapavet')).toBeInTheDocument()
    expect(within(pie).getByText('Centro integral veterinario en Galapagar, Madrid.')).toBeInTheDocument()

    expect(within(pie).queryAllByRole('img')).toHaveLength(0)

    const texto = pie.textContent ?? ''
    for (const prohibida of CADENAS_PROHIBIDAS_S1) {
      expect(texto).not.toContain(prohibida)
    }
  })
})

describe('@s2 el pie presenta tres columnas encabezadas, de cuatro enlaces cada una', () => {
  it('hay 3 "heading" con los nombres "Clínica", "Contenido" y "Contacto" en ese orden, cada uno seguido de una lista de 4 listitems con 1 link cada uno', () => {
    renderizarPieDePagina()
    const pie = screen.getByRole('contentinfo')

    const encabezados = within(pie).getAllByRole('heading')
    expect(encabezados.map((encabezado) => encabezado.textContent)).toEqual(['Clínica', 'Contenido', 'Contacto'])

    for (const encabezado of encabezados) {
      const lista = encabezado.nextElementSibling
      expect(lista).not.toBeNull()
      expect(lista?.tagName.toLowerCase()).toBe('ul')

      const items = within(lista as HTMLElement).getAllByRole('listitem')
      expect(items).toHaveLength(4)
      for (const item of items) {
        expect(within(item).getAllByRole('link')).toHaveLength(1)
      }
    }
  })
})

describe('@s3 la columna "Clínica" lleva a las cuatro secciones de la landing sin salir de la página', () => {
  it('los 4 enlaces son "Servicios", "Equipo", "Reservar cita" y "Galería", en ese orden, con sus anclas exactas y sin atributo target', () => {
    renderizarPieDePagina()
    const pie = screen.getByRole('contentinfo')
    const encabezado = within(pie).getByRole('heading', { name: 'Clínica' })
    const lista = encabezado.nextElementSibling as HTMLElement
    const enlaces = within(lista).getAllByRole('link')

    expect(enlaces.map((enlace) => enlace.textContent)).toEqual(['Servicios', 'Equipo', 'Reservar cita', 'Galería'])
    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual(['#servicios', '#equipo', '#reservar', '#galeria'])
    for (const enlace of enlaces) {
      expect(enlace.hasAttribute('target')).toBe(false)
    }
  })
})

describe('@s4 la columna "Contenido" lleva a las tres subpáginas y a las preguntas frecuentes', () => {
  it('los 4 enlaces son "Blog", "Campañas", "Tienda" y "Preguntas frecuentes", en ese orden, con sus destinos exactos y sin atributo target', () => {
    renderizarPieDePagina()
    const pie = screen.getByRole('contentinfo')
    const encabezado = within(pie).getByRole('heading', { name: 'Contenido' })
    const lista = encabezado.nextElementSibling as HTMLElement
    const enlaces = within(lista).getAllByRole('link')

    expect(enlaces.map((enlace) => enlace.textContent)).toEqual(['Blog', 'Campañas', 'Tienda', 'Preguntas frecuentes'])
    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual(['/blog', '/campanas', '/tienda', '#faq'])
    for (const enlace of enlaces) {
      expect(enlace.hasAttribute('target')).toBe(false)
    }
  })
})

/** Localiza la lista de enlaces de la columna "Contacto". */
function obtenerListaContacto(): HTMLElement {
  const pie = screen.getByRole('contentinfo')
  const encabezado = within(pie).getByRole('heading', { name: 'Contacto' })
  return encabezado.nextElementSibling as HTMLElement
}

describe('@s5 la columna "Contacto" muestra los teléfonos reales y su destino sale del mismo dato', () => {
  it('contiene los tres teléfonos reales y "Cómo llegar", con destinos exactos y dígitos consistentes entre nombre y destino', () => {
    renderizarPieDePagina()
    const lista = obtenerListaContacto()
    const enlaces = within(lista).getAllByRole('link')

    const porNombre = new Map(enlaces.map((enlace) => [enlace.textContent, enlace.getAttribute('href')]))
    expect(porNombre.get('91 082 92 67')).toBe('tel:+34910829267')
    expect(porNombre.get('685 34 31 49')).toBe('tel:+34685343149')
    expect(porNombre.get('Urgencias fuera de horario · 91 851 13 93')).toBe('tel:+34918511393')
    expect(porNombre.get('Cómo llegar')).toBe('#contacto')

    const nombresDeLlamada = ['91 082 92 67', '685 34 31 49', 'Urgencias fuera de horario · 91 851 13 93']
    for (const nombre of nombresDeLlamada) {
      const destino = porNombre.get(nombre) ?? ''
      const digitosNombre = (nombre.match(/\d/g) ?? []).join('')
      const digitosDestino = (destino.match(/\d/g) ?? []).join('')
      expect(digitosDestino.endsWith(digitosNombre)).toBe(true)
    }
  })
})

describe('@s6 el enlace de urgencias del pie conserva el rótulo real del cliente y no anuncia 24 horas', () => {
  it('el nombre empieza por "Urgencias fuera de horario", no contiene "24 h"/"24h"/"365"/"todos los días", y ningún heading ni banner menciona urgencias', () => {
    renderizarPieDePagina()
    const lista = obtenerListaContacto()
    const enlace = within(lista).getByRole('link', { name: /^Urgencias fuera de horario/ })
    expect(enlace.getAttribute('href')).toBe('tel:+34918511393')

    const nombre = enlace.textContent ?? ''
    expect(nombre.startsWith('Urgencias fuera de horario')).toBe(true)
    for (const prohibida of ['24 h', '24h', '365', 'todos los días']) {
      expect(nombre).not.toContain(prohibida)
    }

    const pie = screen.getByRole('contentinfo')
    for (const heading of within(pie).getAllByRole('heading')) {
      expect((heading.textContent ?? '').toLowerCase()).not.toContain('urgencias')
    }
    expect(screen.queryByRole('banner')).toBeNull()
  })
})

describe('@s7 sin email publicado, el pie no ofrece ningún enlace de correo', () => {
  it('la fuente única no declara email, no hay ningún "mailto:" ni "@" en el pie, y "Contacto" sigue con los 4 enlaces de @s5', () => {
    expect(datosNegocio.email).toBeUndefined()

    renderizarPieDePagina()
    const pie = screen.getByRole('contentinfo')

    for (const enlace of within(pie).getAllByRole('link')) {
      expect(enlace.getAttribute('href')).not.toMatch(/^mailto:/)
    }
    expect(pie.textContent ?? '').not.toContain('@')

    const lista = obtenerListaContacto()
    const enlaces = within(lista).getAllByRole('link')
    expect(enlaces).toHaveLength(4)
    expect(enlaces.map((enlace) => enlace.textContent)).toEqual([
      '91 082 92 67',
      '685 34 31 49',
      'Urgencias fuera de horario · 91 851 13 93',
      'Cómo llegar',
    ])
  })
})

describe('@s8 sin perfiles publicados, el pie no renderiza el bloque de redes sociales', () => {
  it('la fuente única declara una lista vacía, no hay heading ni lista "redes"/"Síguenos", no hay enlaces a redes, y siguen exactamente 3 encabezados', () => {
    expect(datosNegocio.redesSociales).toEqual([])

    renderizarPieDePagina()
    const pie = screen.getByRole('contentinfo')

    const encabezados = within(pie).getAllByRole('heading')
    for (const heading of encabezados) {
      const texto = heading.textContent ?? ''
      expect(texto.toLowerCase()).not.toContain('redes')
      expect(texto).not.toContain('Síguenos')
    }
    for (const lista of within(pie).getAllByRole('list')) {
      const nombreAccesible = lista.getAttribute('aria-label') ?? ''
      expect(nombreAccesible.toLowerCase()).not.toContain('redes')
      expect(nombreAccesible).not.toContain('Síguenos')
    }
    for (const enlace of within(pie).getAllByRole('link')) {
      const destino = enlace.getAttribute('href') ?? ''
      for (const dominio of ['facebook.com', 'instagram.com', 'x.com', 'twitter.com', 'tiktok.com']) {
        expect(destino).not.toContain(dominio)
      }
    }
    expect(encabezados).toHaveLength(3)
  })
})

/** Localiza los enlaces legales de la barra inferior. */
function obtenerEnlacesLegales(): HTMLElement[] {
  const lista = screen.getByRole('list', { name: 'Enlaces legales' })
  return within(lista).getAllByRole('link')
}

describe('@s9 los enlaces legales apuntan a las páginas legales reales que el cliente ya publica', () => {
  it('hay exactamente 3 enlaces, con nombre y destino exactos, y ninguno es "#faq", "#" ni vacío', () => {
    renderizarPieDePagina()
    const enlaces = obtenerEnlacesLegales()
    expect(enlaces).toHaveLength(3)

    expect(enlaces[0]?.textContent?.startsWith('Aviso legal')).toBe(true)
    expect(enlaces[0]?.getAttribute('href')).toBe('https://galapavet.com/aviso-legal')
    expect(enlaces[1]?.textContent?.startsWith('Política de cookies')).toBe(true)
    expect(enlaces[1]?.getAttribute('href')).toBe('https://galapavet.com/politica-de-cookies')
    expect(enlaces[2]?.textContent?.startsWith('Personalizar cookies')).toBe(true)
    expect(enlaces[2]?.getAttribute('href')).toBe('https://galapavet.com/personalizar-cookies')

    for (const enlace of enlaces) {
      const destino = enlace.getAttribute('href') ?? ''
      expect(destino).not.toBe('#faq')
      expect(destino).not.toBe('#')
      expect(destino).not.toBe('')
    }
  })
})

describe('@s10 cada enlace legal se abre en una ventana nueva, lo anuncia y no deja manipular la página de origen', () => {
  it('los 3 enlaces declaran target="_blank", rel con "noopener" y "noreferrer", y el nombre accesible termina en el aviso; el primero es exacto', () => {
    renderizarPieDePagina()
    const enlaces = obtenerEnlacesLegales()
    expect(enlaces).toHaveLength(3)

    for (const enlace of enlaces) {
      expect(enlace.getAttribute('target')).toBe('_blank')
      const rel = enlace.getAttribute('rel') ?? ''
      expect(rel).toContain('noopener')
      expect(rel).toContain('noreferrer')
      expect(enlace.textContent?.endsWith('(se abre en una ventana nueva)')).toBe(true)
    }

    expect(enlaces[0]?.textContent).toBe('Aviso legal (se abre en una ventana nueva)')
  })
})

describe('@s11 una página legal que el cliente no publica no se pinta como enlace muerto', () => {
  it('con solo 2 páginas inyectadas, hay exactamente 2 enlaces, con destinos exactos, sin "#"/""/"PENDIENTE", y sin "Privacidad"', () => {
    renderizarPieDePagina({
      paginasLegales: [
        { nombre: 'Aviso legal', destino: 'https://galapavet.com/aviso-legal' },
        { nombre: 'Política de cookies', destino: 'https://galapavet.com/politica-de-cookies' },
      ],
    })

    const enlaces = obtenerEnlacesLegales()
    expect(enlaces).toHaveLength(2)
    expect(enlaces[0]?.textContent?.startsWith('Aviso legal')).toBe(true)
    expect(enlaces[0]?.getAttribute('href')).toBe('https://galapavet.com/aviso-legal')
    expect(enlaces[1]?.textContent?.startsWith('Política de cookies')).toBe(true)
    expect(enlaces[1]?.getAttribute('href')).toBe('https://galapavet.com/politica-de-cookies')

    for (const enlace of enlaces) {
      const destino = enlace.getAttribute('href') ?? ''
      expect(destino).not.toBe('#')
      expect(destino).not.toBe('')
      expect(destino).not.toBe('PENDIENTE')
    }
    expect(screen.queryByRole('link', { name: 'Privacidad' })).toBeNull()
  })
})

describe('@s12 el aviso de copyright se muestra en la barra inferior, calculado de la fecha inyectada', () => {
  it('con la fecha del 17 de agosto de 2026, la barra inferior muestra exactamente "© 2026 Galapavet"', () => {
    renderizarPieDePagina({ fecha: new Date(2026, 7, 17) })

    const lista = screen.getByRole('list', { name: 'Enlaces legales' })
    const barraInferior = lista.parentElement as HTMLElement
    expect(within(barraInferior).getByText('© 2026 Galapavet')).toBeInTheDocument()
  })
})

describe('@s13 el año del aviso de copyright se calcula de la fecha vigente y no queda horneado', () => {
  it('con la fecha del 1 de enero de 2027, la barra inferior muestra exactamente "© 2027 Galapavet"', () => {
    renderizarPieDePagina({ fecha: new Date(2027, 0, 1) })

    const lista = screen.getByRole('list', { name: 'Enlaces legales' })
    const barraInferior = lista.parentElement as HTMLElement
    expect(within(barraInferior).getByText('© 2027 Galapavet')).toBeInTheDocument()
    expect(barraInferior.textContent ?? '').not.toContain('2026')
  })
})

const CADENAS_HEREDADAS = [
  'Veterinaria La Sierra',
  'Miraflores',
  '28792',
  'Ctra. de la Sierra',
  '918 44 21 60',
  '640 22 11 90',
  '918442160',
  '640221190',
  'hola@veterinarialasierra.es',
  '24 h',
  '24h',
  'nº 28/0791',
]

describe('@s14 en el pie no sobrevive ningún dato del prototipo heredado', () => {
  it('ningún texto ni ningún destino del pie contiene ninguna cadena del prototipo heredado', () => {
    renderizarPieDePagina()
    const pie = screen.getByRole('contentinfo')
    const texto = pie.textContent ?? ''

    for (const prohibida of CADENAS_HEREDADAS) {
      expect(texto).not.toContain(prohibida)
    }

    for (const enlace of within(pie).getAllByRole('link')) {
      const destino = enlace.getAttribute('href') ?? ''
      for (const prohibida of CADENAS_HEREDADAS) {
        expect(destino).not.toContain(prohibida)
      }
    }
  })
})

describe('@s15 un teléfono que no valida hace fallar al pie en vez de pintar un enlace a medias', () => {
  it('renderizar con "91 851 13" (ocho dígitos) lanza con el valor recibido, y no llega a existir ningún enlace "tel:+34"', () => {
    expect(() => renderizarPieDePagina({ telefonoUrgencias: '91 851 13' })).toThrow('91 851 13')
    expect(document.querySelector('a[href^="tel:+34"]')).toBeNull()
  })
})
