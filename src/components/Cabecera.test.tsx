import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { Cabecera } from './Cabecera'
import { PUNTO_DE_CORTE_NAVEGACION_PX } from './Cabecera-logica'

/** Centraliza el render de `Cabecera` bajo test y usa `React` en posición de tipo. */
function renderizarCabecera(props: React.ComponentProps<typeof Cabecera>): ReturnType<typeof render> {
  return render(<Cabecera {...props} />)
}

/**
 * Nombres accesibles de los 8 destinos de navegación, en el orden exigido por
 * @s4. Literal escrito a mano (no importado de `src/data/navegacion.ts`):
 * patrón `doble-de-test-anclado-al-literal-no-al-simbolo`.
 */
const NOMBRES_EN_ORDEN = ['Reservar', 'Servicios', 'Campañas', 'Equipo', 'Blog', 'Contacto', 'FAQ', 'Tienda']

/** Mismos 8 destinos, mismo orden que `NOMBRES_EN_ORDEN`. También literal escrito a mano. */
const DESTINOS_EN_ORDEN = ['#reservar', '#servicios', '/campanas', '#equipo', '/blog', '#contacto', '#faq', '/tienda']

/** Filtra solo los enlaces de NAVEGACIÓN (excluye el del logotipo, que no es "navegación"). */
function enlacesDeNavegacion(): HTMLElement[] {
  return screen.queryAllByRole('link').filter((enlace) => NOMBRES_EN_ORDEN.includes(enlace.textContent ?? ''))
}

/** Aísla cada test de la URL que haya dejado el anterior (`history.pushState` es un singleton de `window`). */
beforeEach(() => {
  window.history.pushState(null, '', '/')
})

describe('@s2 en el ancho exacto del punto de corte se muestra la rama de escritorio', () => {
  it('existe la región "Navegación principal" y no existe el botón "Abrir menú"', () => {
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Abrir menú' })).not.toBeInTheDocument()
  })
})

describe('@s3 un píxel por debajo del punto de corte se muestra la rama móvil', () => {
  it('no existe ninguna región de navegación y existe el botón "Abrir menú"', () => {
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1 })

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument()
  })
})

describe('@s4 en escritorio se ofrecen los ocho destinos en horizontal y en orden', () => {
  it('la navegación principal contiene exactamente 8 enlaces, con estos nombres accesibles en orden', () => {
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    const nombres = within(nav)
      .getAllByRole('link')
      .map((enlace) => enlace.textContent)

    expect(nombres).toEqual(NOMBRES_EN_ORDEN)
    expect(screen.queryByRole('button', { name: 'Abrir menú' })).not.toBeInTheDocument()
  })
})

describe('@s5 cada enlace de la navegación de escritorio apunta a su destino', () => {
  it.each([
    ['Reservar', '#reservar'],
    ['Servicios', '#servicios'],
    ['Campañas', '/campanas'],
    ['Equipo', '#equipo'],
    ['Blog', '/blog'],
    ['Contacto', '#contacto'],
    ['FAQ', '#faq'],
    ['Tienda', '/tienda'],
  ])('el enlace "%s" apunta exactamente a "%s"', (nombre, destino) => {
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(within(nav).getByRole('link', { name: nombre })).toHaveAttribute('href', destino)
  })
})

describe('@s6 por debajo del punto de corte no hay fila horizontal y el botón de menú anuncia que está cerrado', () => {
  it('no hay región de navegación, el botón "Abrir menú" tiene aria-expanded "false" y no hay enlaces de navegación', () => {
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1 })

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
    expect(enlacesDeNavegacion()).toHaveLength(0)
  })
})

describe('@s7 abrir el menú móvil despliega los mismos ocho destinos', () => {
  it('aria-expanded pasa a "true", aria-controls identifica un panel existente con los 8 enlaces en orden', async () => {
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1 })

    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'true')

    const idPanel = boton.getAttribute('aria-controls')
    expect(idPanel).toBeTruthy()
    const panel = idPanel === null ? null : document.getElementById(idPanel)
    expect(panel).not.toBeNull()

    const enlaces = within(panel as HTMLElement).getAllByRole('link')
    expect(enlaces.map((enlace) => enlace.textContent)).toEqual(NOMBRES_EN_ORDEN)
    enlaces.forEach((enlace, indice) => {
      expect(enlace).toHaveAttribute('href', DESTINOS_EN_ORDEN[indice])
    })
    expect(enlaces.every((enlace) => !(enlace.textContent ?? '').includes('Urgencias'))).toBe(true)
  })
})

describe('@s8 volver a pulsar el botón cierra el menú móvil', () => {
  it('aria-expanded vuelve a "false" y el panel deja de existir en el documento', async () => {
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1 })

    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    await usuario.click(boton)
    const idPanel = boton.getAttribute('aria-controls')

    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(idPanel === null ? null : document.getElementById(idPanel)).toBeNull()
  })
})

describe('@s9 pulsar un enlace de sección en el menú móvil navega y cierra el menú', () => {
  it('el navegador queda en el destino "#servicios", aria-expanded vuelve a "false" y el panel desaparece', async () => {
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1 })

    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    await usuario.click(boton)
    const idPanel = boton.getAttribute('aria-controls')
    const panel = idPanel === null ? null : document.getElementById(idPanel)

    await usuario.click(within(panel as HTMLElement).getByRole('link', { name: 'Servicios' }))

    expect(window.location.hash).toBe('#servicios')
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(idPanel === null ? null : document.getElementById(idPanel)).toBeNull()
  })
})

describe('@s10 pulsar un enlace de subpágina en el menú móvil navega y cierra el menú', () => {
  it('el navegador queda en el destino "/tienda", aria-expanded vuelve a "false" y el panel desaparece', async () => {
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1 })

    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    await usuario.click(boton)
    const idPanel = boton.getAttribute('aria-controls')
    const panel = idPanel === null ? null : document.getElementById(idPanel)

    await usuario.click(within(panel as HTMLElement).getByRole('link', { name: 'Tienda' }))

    expect(window.location.pathname).toBe('/tienda')
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(idPanel === null ? null : document.getElementById(idPanel)).toBeNull()
  })
})

describe('@s11 ensanchar la ventana con el menú abierto no deja el panel colgado', () => {
  it('el panel y el botón desaparecen y aparece la navegación completa de escritorio', async () => {
    const usuario = userEvent.setup()
    const { rerender } = renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1 })

    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    await usuario.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    const idPanel = boton.getAttribute('aria-controls')
    expect(idPanel).toBeTruthy()

    rerender(<Cabecera ancho={PUNTO_DE_CORTE_NAVEGACION_PX} />)

    expect(screen.queryByRole('button', { name: 'Abrir menú' })).not.toBeInTheDocument()
    expect(idPanel === null ? null : document.getElementById(idPanel)).toBeNull()
    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(
      within(nav)
        .getAllByRole('link')
        .map((enlace) => enlace.textContent),
    ).toEqual(NOMBRES_EN_ORDEN)
  })
})

describe('@s12 el logotipo lleva al inicio y rotula al cliente real', () => {
  it('el enlace del logotipo contiene "Galapavet", apunta a "#inicio" y aparece el descriptor real, no el ficticio', () => {
    const { container } = renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    const enlaceLogo = screen.getByRole('link', { name: /Galapavet/ })
    expect(enlaceLogo).toHaveAttribute('href', '#inicio')
    expect(container).toHaveTextContent('Centro integral veterinario')
    expect(container).not.toHaveTextContent('Veterinaria La Sierra')
  })
})

describe('@s13 la cabecera no anuncia urgencias ni contiene teléfonos', () => {
  it('sin "Urgencias", "24 h" ni "640 22 11 90", y ningún enlace apunta a "tel:"', () => {
    const { container } = renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    expect(container).not.toHaveTextContent('Urgencias')
    expect(container).not.toHaveTextContent('24 h')
    expect(container).not.toHaveTextContent('640 22 11 90')
    for (const enlace of screen.getAllByRole('link')) {
      expect(enlace.getAttribute('href')).not.toMatch(/^tel:/)
    }
  })
})

describe('@s14 si el ancho de la ventana no es medible se cae a la rama móvil', () => {
  it.each([
    ['no medido (NaN)', Number.NaN],
    ['cero, que no es positivo', 0],
    ['negativo', -100],
  ])('con un ancho %s, existe el botón "Abrir menú" cerrado y no existe navegación', (_descripcion, ancho) => {
    renderizarCabecera({ ancho })

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('@s15 sin destinos de navegación no se renderiza ninguna navegación vacía', () => {
  it('no hay región de navegación ni botón "Abrir menú", pero el enlace del logotipo sigue existiendo', () => {
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1, enlaces: [] })

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Abrir menú' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Galapavet/ })).toHaveAttribute('href', '#inicio')
  })
})
