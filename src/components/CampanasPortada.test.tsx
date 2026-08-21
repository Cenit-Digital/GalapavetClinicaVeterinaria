import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SERVICIOS } from '../data/servicios'
import { CampanasPortada } from './CampanasPortada'

/** Centraliza el render de `CampanasPortada` bajo test. */
function renderizarCampanasPortada(
  props: React.ComponentProps<typeof CampanasPortada> = {},
): ReturnType<typeof render> {
  return render(<CampanasPortada {...props} />)
}

describe('@s1 la sección se anuncia como una región con su encabezado', () => {
  it('existe exactamente una región "Campañas de prevención" con un h2 de texto exacto dentro', () => {
    renderizarCampanasPortada()

    const regiones = screen.getAllByRole('region', { name: 'Campañas de prevención' })
    expect(regiones).toHaveLength(1)

    const encabezado = screen.getByRole('heading', { level: 2, name: 'Campañas de prevención' })
    expect(encabezado.textContent).toBe('Campañas de prevención')
    expect(regiones[0]).toContainElement(encabezado)
  })
})

describe('@s2 se muestra una tarjeta por cada campaña del catálogo de demo', () => {
  it('hay exactamente 3 tarjetas, con los 3 títulos reales en orden, cada uno un servicio publicado', () => {
    renderizarCampanasPortada()

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const tarjetas = within(region).getAllByRole('listitem')
    expect(tarjetas).toHaveLength(3)

    const titulos = within(region)
      .getAllByRole('heading', { level: 3 })
      .map((encabezado) => encabezado.textContent)
    expect(titulos).toEqual(['Vacunaciones', 'Chequeo', 'Odontología'])

    const puntosPublicados = SERVICIOS.flatMap((bloque) => bloque.puntos)
    for (const titulo of titulos) {
      expect(puntosPublicados).toContain(titulo)
    }
  })
})

describe('@s3 cada tarjeta muestra su estado, y el único estado admitido es la marca de demostración', () => {
  it('las 3 tarjetas muestran el texto exacto "Demostración" y ninguna muestra otro estado', () => {
    renderizarCampanasPortada()

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const tarjetas = within(region).getAllByRole('listitem')
    expect(tarjetas).toHaveLength(3)
    for (const tarjeta of tarjetas) {
      expect(within(tarjeta).getByText('Demostración')).toBeInTheDocument()
    }
    expect(within(region).getAllByText('Demostración')).toHaveLength(3)
  })
})

const AVISO_DEMOSTRACION =
  'Contenido de demostración. Galapavet no ha confirmado ninguna campaña: estas tarjetas muestran el formato sobre servicios que la clínica sí presta. Precio, vigencia y condiciones están pendientes de confirmar con la clínica.'

describe('@s4 el aviso de contenido de demostración es visible y describe la sección', () => {
  it('el aviso visible es el texto exacto y es la descripción accesible de la región', () => {
    renderizarCampanasPortada()

    const aviso = screen.getByText(AVISO_DEMOSTRACION)
    expect(aviso).toBeVisible()

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const idDescripcion = region.getAttribute('aria-describedby')
    expect(idDescripcion).toBeTruthy()
    expect(document.getElementById(idDescripcion ?? '')).toBe(aviso)
  })
})

describe('@s5 el nombre accesible de cada tarjeta lleva su título y la marca de demostración', () => {
  it('el enlace de la tarjeta "Vacunaciones" incluye el título y "Demostración", y su imagen tiene alt vacío', () => {
    renderizarCampanasPortada()

    const titulo = screen.getByRole('heading', { level: 3, name: 'Vacunaciones' })
    const enlace = titulo.closest('a')
    expect(enlace).not.toBeNull()
    expect(enlace?.textContent).toContain('Vacunaciones')
    expect(enlace?.textContent).toContain('Demostración')

    const imagen = enlace?.querySelector('img')
    expect(imagen).not.toBeNull()
    expect(imagen?.getAttribute('alt')).toBe('')
  })
})

describe('@s6 ninguna tarjeta muestra un precio', () => {
  it('el texto completo de la sección no contiene "€", "EUR" ni "%"', () => {
    renderizarCampanasPortada()

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const texto = region.textContent ?? ''
    expect(texto).not.toContain('€')
    expect(texto).not.toContain('EUR')
    expect(texto).not.toContain('%')
  })
})

const MESES_EN_ESPANOL = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

describe('@s7 ninguna tarjeta muestra fecha ni periodo de vigencia', () => {
  it('el texto completo de la sección no contiene meses, "Hasta el" ni fechas', () => {
    renderizarCampanasPortada()

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const texto = region.textContent ?? ''
    for (const mes of MESES_EN_ESPANOL) {
      expect(texto.toLowerCase()).not.toContain(mes)
    }
    expect(texto).not.toContain('Hasta el')
    expect(texto).not.toMatch(/\d{2}\/\d{2}\/\d{4}/)
    expect(texto).not.toMatch(/20\d{2}/)
  })
})

describe('@s8 ninguna tarjeta afirma disponibilidad, escasez ni política comercial', () => {
  it('el texto completo de la sección no contiene lenguaje comercial ni "24 h"', () => {
    renderizarCampanasPortada()

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const texto = region.textContent ?? ''
    for (const cadena of ['Activa', 'Plazas limitadas', 'plazas', 'precio cerrado', 'descuento']) {
      expect(texto).not.toContain(cadena)
    }
    expect(texto).not.toContain('24 h')
  })
})

describe('@s11 cada tarjeta entera enlaza a la página de campañas', () => {
  it('el destino de la tarjeta "Odontología" y de las 3 tarjetas es exactamente "/campanas"', () => {
    renderizarCampanasPortada()

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const titulo = screen.getByRole('heading', { level: 3, name: 'Odontología' })
    const enlace = titulo.closest('a')
    expect(enlace?.getAttribute('href')).toBe('/campanas')

    const tarjetas = within(region).getAllByRole('listitem')
    for (const tarjeta of tarjetas) {
      const enlaceTarjeta = tarjeta.querySelector('a')
      expect(enlaceTarjeta?.getAttribute('href')).toBe('/campanas')
    }
  })
})

describe('@s12 el enlace de acción de la sección lleva a la página de campañas', () => {
  it('el enlace "Ver campañas" apunta a "/campanas" y no menciona "activas" ni "→"', () => {
    renderizarCampanasPortada()

    const enlace = screen.getByRole('link', { name: 'Ver campañas' })
    expect(enlace.getAttribute('href')).toBe('/campanas')
    expect(enlace.textContent ?? '').not.toContain('activas')
    expect(enlace.textContent ?? '').not.toContain('→')
  })
})

describe('@s13 las imágenes de las tarjetas se sirven en local', () => {
  it('ningún origen de imagen empieza por "http://", "https://" ni "//", ni contiene "pexels"', () => {
    renderizarCampanasPortada()

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const imagenes = within(region).getAllByRole('presentation')
    expect(imagenes).toHaveLength(3)
    for (const imagen of imagenes) {
      const src = imagen.getAttribute('src') ?? ''
      expect(src.startsWith('http://')).toBe(false)
      expect(src.startsWith('https://')).toBe(false)
      expect(src.startsWith('//')).toBe(false)
      expect(src).not.toContain('pexels')
    }
  })
})

describe('@s14 una campaña sin imagen sigue mostrando su tarjeta', () => {
  it('la tarjeta muestra su título y su estado "Demostración", sin ninguna imagen', () => {
    renderizarCampanasPortada({ catalogo: [{ titulo: 'Vacunaciones' }] })

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const tarjetas = within(region).getAllByRole('listitem')
    expect(tarjetas).toHaveLength(1)

    const tarjeta = tarjetas[0]
    expect(tarjeta).toBeDefined()
    if (tarjeta === undefined) {
      throw new Error('tarjeta inesperadamente ausente')
    }
    expect(within(tarjeta).getByRole('heading', { level: 3, name: 'Vacunaciones' })).toBeInTheDocument()
    expect(within(tarjeta).getByText('Demostración')).toBeInTheDocument()
    expect(tarjeta.querySelector('img')).toBeNull()
  })
})

describe('@s15 con el catálogo de demo vacío no se renderiza la sección', () => {
  it('no existe ninguna región "Campañas de prevención" ni ningún enlace "Ver campañas"', () => {
    renderizarCampanasPortada({ catalogo: [] })

    expect(screen.queryByRole('region', { name: 'Campañas de prevención' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Ver campañas' })).toBeNull()
  })
})

describe('@s16 una campaña sin título se descarta y el resto se sigue mostrando', () => {
  it('hay exactamente 2 tarjetas, con los títulos restantes en orden, sin ningún nombre accesible vacío', () => {
    renderizarCampanasPortada({
      catalogo: [{ titulo: 'Vacunaciones' }, { titulo: '' }, { titulo: 'Odontología' }],
    })

    const region = screen.getByRole('region', { name: 'Campañas de prevención' })
    const tarjetas = within(region).getAllByRole('listitem')
    expect(tarjetas).toHaveLength(2)

    const titulos = within(region)
      .getAllByRole('heading', { level: 3 })
      .map((encabezado) => encabezado.textContent)
    expect(titulos).toEqual(['Vacunaciones', 'Odontología'])

    for (const tarjeta of tarjetas) {
      const enlace = tarjeta.querySelector('a')
      expect(enlace?.textContent).not.toBe('')
    }
  })
})

describe('@s17 si ninguna campaña del catálogo es válida no se renderiza la sección', () => {
  it('no existe ninguna región "Campañas de prevención" ni ninguna tarjeta de campaña', () => {
    renderizarCampanasPortada({ catalogo: [{ titulo: '' }, { titulo: '' }, { titulo: '' }] })

    expect(screen.queryByRole('region', { name: 'Campañas de prevención' })).toBeNull()
    expect(screen.queryByRole('listitem')).toBeNull()
  })
})

describe('@s18 un dato de campaña inválido deja la portada sin ninguna tarjeta de campaña', () => {
  it('con una campaña con precio, no existe ninguna región ni ninguna tarjeta de campaña', () => {
    renderizarCampanasPortada({ catalogo: [{ titulo: 'Vacunaciones', precio: '49 €' }] })

    expect(screen.queryByRole('region', { name: 'Campañas de prevención' })).toBeNull()
    expect(screen.queryByRole('listitem')).toBeNull()
  })
})

describe('@s21 una vigencia inválida deja la portada sin ninguna tarjeta de campaña', () => {
  it('con una campaña con vigencia, no existe ninguna región ni ninguna tarjeta de campaña', () => {
    renderizarCampanasPortada({
      catalogo: [{ titulo: 'Vacunaciones', vigencia: 'Hasta el 30 de septiembre' }],
    })

    expect(screen.queryByRole('region', { name: 'Campañas de prevención' })).toBeNull()
    expect(screen.queryByRole('listitem')).toBeNull()
  })
})
