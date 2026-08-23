import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { Cabecera } from './components/Cabecera'
import { PUNTO_DE_CORTE_NAVEGACION_PX } from './components/Cabecera-logica'
import { Faq } from './components/Faq'

/** Aísla cada test de la URL que haya dejado el anterior (`history.pushState` es un singleton de `window`). */
beforeEach(() => {
  window.history.pushState(null, '', '/')
})

/** Sustituye `window.innerWidth` (jsdom lo expone como propiedad de solo lectura por defecto). */
function establecerAnchoDeVentana(px: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: px })
}

/** Centraliza el render bajo test y usa `React` en posición de tipo. */
function renderizar(arbol: React.JSX.Element): ReturnType<typeof render> {
  return render(arbol)
}

/** Selector de los tipos de control que este proyecto usa como interactivos: enlaces, botones, campos de formulario, y cualquier contenedor con `tabindex` propio (p. ej. la pista de `Galeria`). */
const SELECTOR_FOCALIZABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

describe('@s23 la página entera se recorre con el tabulador en el orden de lectura', () => {
  it('todos los controles interactivos de la Landing reciben el foco, en el orden del contenido, sin quedar atrapados', async () => {
    const usuario = userEvent.setup()
    establecerAnchoDeVentana(PUNTO_DE_CORTE_NAVEGACION_PX)
    renderizar(<App />)

    const esperados = Array.from(document.body.querySelectorAll<HTMLElement>(SELECTOR_FOCALIZABLE))
    expect(esperados.length).toBeGreaterThan(0)

    const recorridos: HTMLElement[] = []
    for (let indice = 0; indice < esperados.length; indice += 1) {
      // eslint-disable-next-line no-await-in-loop -- cada tabulación depende del foco dejado por la anterior
      await usuario.tab()
      expect(document.activeElement).not.toBeNull()
      recorridos.push(document.activeElement as HTMLElement)
    }

    expect(recorridos).toEqual(esperados)

    // El foco no queda atrapado: un tab más avanza fuera del último control.
    await usuario.tab()
    expect(document.activeElement).not.toBe(esperados[esperados.length - 1])
  })
})

describe('@s24 el menú móvil se abre con el teclado y anuncia su estado', () => {
  it('con el botón enfocado, Enter lo abre: aria-expanded pasa a "true" y los enlaces son alcanzables', async () => {
    const usuario = userEvent.setup()
    renderizar(<Cabecera ancho={PUNTO_DE_CORTE_NAVEGACION_PX - 1} />)

    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    boton.focus()

    await usuario.keyboard('{Enter}')

    expect(boton).toHaveAttribute('aria-expanded', 'true')
    const idPanel = boton.getAttribute('aria-controls')
    const panel = idPanel === null ? null : document.getElementById(idPanel)
    expect(within(panel as HTMLElement).getAllByRole('link').length).toBeGreaterThan(0)
    expect(boton.textContent).not.toBe('')
  })
})

describe('@s25 el menú móvil se cierra con Escape y devuelve el foco al botón que lo abrió', () => {
  it('Escape cierra el menú, aria-expanded vuelve a "false", el foco vuelve al botón y los enlaces dejan de ser alcanzables', async () => {
    const usuario = userEvent.setup()
    renderizar(<Cabecera ancho={PUNTO_DE_CORTE_NAVEGACION_PX - 1} />)

    const boton = screen.getByRole('button', { name: 'Abrir menú' })
    await usuario.click(boton)
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    const idPanel = boton.getAttribute('aria-controls')
    expect(idPanel).toBeTruthy()

    await usuario.keyboard('{Escape}')

    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(document.activeElement).toBe(boton)
    expect(idPanel === null ? null : document.getElementById(idPanel)).toBeNull()
  })
})

describe('@s26 un panel del acordeón se expande con el teclado y anuncia su estado', () => {
  it('con el primer control de cabecera enfocado, Enter lo activa: aria-expanded pasa a "true", el contenido queda visible, y el foco permanece en el control', async () => {
    const usuario = userEvent.setup()
    renderizar(<Faq />)

    const botones = screen.getAllByRole('button')
    const primero = botones[0] as HTMLButtonElement
    expect(primero).toHaveAttribute('aria-expanded', 'false')
    primero.focus()

    await usuario.keyboard('{Enter}')

    expect(primero).toHaveAttribute('aria-expanded', 'true')
    const idRegion = primero.getAttribute('aria-controls')
    expect(idRegion === null ? null : document.getElementById(idRegion)).not.toBeNull()
    expect(document.activeElement).toBe(primero)
  })
})

describe('@s27 el contenido colapsado del acordeón no es alcanzable con el tabulador', () => {
  it('con todos los paneles colapsados, el tabulador solo se detiene en los controles de cabecera', async () => {
    const usuario = userEvent.setup()
    renderizar(<Faq />)

    const botones = screen.getAllByRole('button')
    expect(botones.length).toBeGreaterThan(0)
    for (const boton of botones) {
      expect(boton).toHaveAttribute('aria-expanded', 'false')
    }

    let paradasEnCabeceras = 0
    for (let indice = 0; indice < botones.length; indice += 1) {
      // eslint-disable-next-line no-await-in-loop -- cada tabulación depende del foco dejado por la anterior
      await usuario.tab()
      expect(botones).toContain(document.activeElement)
      paradasEnCabeceras += 1
    }

    expect(paradasEnCabeceras).toBeGreaterThan(0)
    // Ningún panel colapsado existe en el documento (patrón de renderizado
    // condicional ya usado en `Faq.tsx`): no hay ningún enlace de respuesta
    // (el único tipo de control que viviría dentro de un panel) que pueda
    // robar una parada del recorrido.
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})
