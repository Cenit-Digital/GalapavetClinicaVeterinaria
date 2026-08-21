import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectorPaleta } from './SelectorPaleta'

/** Centraliza el render de `SelectorPaleta` bajo test. */
function renderizarSelectorPaleta(
  props: React.ComponentProps<typeof SelectorPaleta> = {},
): ReturnType<typeof render> {
  return render(<SelectorPaleta {...props} />)
}

describe('@s1 el selector se ofrece cerrado al cargar la página', () => {
  it('existe el botón "Cambiar paleta de color" con aria-expanded "false" y sin panel abierto', () => {
    renderizarSelectorPaleta()

    const boton = screen.getByRole('button', { name: 'Cambiar paleta de color' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('group', { name: 'Paleta de color' })).not.toBeInTheDocument()
  })
})

describe('@s2 abrir el panel lista exactamente las cuatro variantes de marca', () => {
  it('el botón pasa a aria-expanded "true" y el grupo lista los 4 nombres esperados', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()

    const boton = screen.getByRole('button', { name: 'Cambiar paleta de color' })
    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'true')

    const grupo = screen.getByRole('group', { name: 'Paleta de color' })
    const botonesDeVariante = within(grupo).getAllByRole('button')
    expect(botonesDeVariante).toHaveLength(4)

    const nombres = botonesDeVariante.map((elemento) => elemento.textContent ?? '')
    for (const esperado of ['Marca Galapavet', 'Lima de superficie', 'Verde profundo', 'Marca en oscuro']) {
      expect(nombres.filter((nombre) => nombre.includes(esperado))).toHaveLength(1)
    }
  })
})

describe('@s3 volver a pulsar el botón flotante cierra el panel', () => {
  it('aria-expanded vuelve a "false" y el grupo deja de existir', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()

    const boton = screen.getByRole('button', { name: 'Cambiar paleta de color' })
    await usuario.click(boton)
    expect(screen.getByRole('group', { name: 'Paleta de color' })).toBeInTheDocument()

    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('group', { name: 'Paleta de color' })).not.toBeInTheDocument()
  })
})

describe('@s4 las muestras de color no ensucian el nombre accesible de la variante', () => {
  it('cada botón de variante trae 3 muestras aria-hidden y su nombre accesible empieza por el nombre de la variante', async () => {
    const usuario = userEvent.setup()
    const { container } = renderizarSelectorPaleta()

    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))

    const grupo = screen.getByRole('group', { name: 'Paleta de color' })
    const botonesDeVariante = within(grupo).getAllByRole('button')
    expect(botonesDeVariante).toHaveLength(4)

    for (const nombre of ['Marca Galapavet', 'Lima de superficie', 'Verde profundo', 'Marca en oscuro']) {
      const boton = within(grupo).getByRole('button', { name: new RegExp('^' + nombre) })
      const muestras = boton.querySelectorAll('[aria-hidden="true"]')
      expect(muestras).toHaveLength(3)
    }

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(12)
  })
})

describe('@s5 sin preferencia guardada la variante activa es la de marca', () => {
  it('data-variante vale "marca", el botón "Marca Galapavet" está presionado y los otros 3 no', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))

    expect(document.documentElement).toHaveAttribute('data-variante', 'marca')

    const grupo = screen.getByRole('group', { name: 'Paleta de color' })
    const botonMarca = within(grupo).getByRole('button', { name: /^Marca Galapavet/ })
    expect(botonMarca).toHaveAttribute('aria-pressed', 'true')

    const otros = within(grupo)
      .getAllByRole('button')
      .filter((elemento) => elemento !== botonMarca)
    expect(otros).toHaveLength(3)
    for (const boton of otros) {
      expect(boton).toHaveAttribute('aria-pressed', 'false')
    }
  })
})

describe('@s6 elegir una variante la aplica de inmediato y traslada la marca de activa', () => {
  it('data-variante pasa a "noche", el botón "Marca en oscuro" queda presionado y es el único', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })

    await usuario.click(within(grupo).getByRole('button', { name: /^Marca en oscuro/ }))

    expect(document.documentElement).toHaveAttribute('data-variante', 'noche')
    const presionados = within(grupo)
      .getAllByRole('button')
      .filter((elemento) => elemento.getAttribute('aria-pressed') === 'true')
    expect(presionados).toHaveLength(1)
    expect(presionados[0]).toHaveAccessibleName(/^Marca en oscuro/)
  })
})

describe('@s7 elegir una variante la guarda en el almacenamiento del navegador', () => {
  it('el almacenamiento local contiene solo la clave "galapavet-variante" con el texto exacto "noche"', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })

    await usuario.click(within(grupo).getByRole('button', { name: /^Marca en oscuro/ }))

    expect(window.localStorage.getItem('galapavet-variante')).toBe('noche')
    expect(Object.keys(window.localStorage)).toEqual(['galapavet-variante'])
  })
})

describe('@s8 la variante elegida se recuerda en la siguiente visita', () => {
  it('con "verde" ya guardado, data-variante vale "verde" y "Verde profundo" queda presionado al abrir', async () => {
    window.localStorage.setItem('galapavet-variante', 'verde')
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()

    expect(document.documentElement).toHaveAttribute('data-variante', 'verde')

    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })
    expect(within(grupo).getByRole('button', { name: /^Verde profundo/ })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('@s15 el almacenamiento que lanza al escribir no rompe el cambio de variante', () => {
  it('data-variante cambia, el botón queda presionado y la interacción no lanza', async () => {
    const espiaEscritura = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota excedida')
    })
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })

    await usuario.click(within(grupo).getByRole('button', { name: /^Marca en oscuro/ }))

    expect(document.documentElement).toHaveAttribute('data-variante', 'noche')
    expect(within(grupo).getByRole('button', { name: /^Marca en oscuro/ })).toHaveAttribute('aria-pressed', 'true')

    espiaEscritura.mockRestore()
  })
})

describe('@s16 sin variantes en el catálogo el selector no se renderiza', () => {
  it('no existe el botón "Cambiar paleta de color" y data-variante vale "marca"', () => {
    renderizarSelectorPaleta({ catalogo: [] })

    expect(screen.queryByRole('button', { name: 'Cambiar paleta de color' })).not.toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-variante', 'marca')
  })
})
