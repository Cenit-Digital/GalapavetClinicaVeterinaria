import React from 'react'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App, ANCHO_ANTES_DE_MEDIR } from './App'
import { Cabecera } from './components/Cabecera'

/**
 * Refuerzo de mutación (ronda 2, `progress/mutation_ensamblaje_landing.md`):
 * el catch-all "*" absorbe visualmente cualquier fallo en la generación de
 * `<Route>` por subpágina (mismo componente `PaginaNoEncontrada`), así que
 * ningún test de DOM distingue "hay una Route explícita para /campanas" de
 * "no hay ninguna y cae en el comodín". Se intercepta `jsxDEV` (runtime real
 * de JSX en este proyecto, `tsconfig.app.json` -> `"jsx": "react-jsx"`, modo
 * desarrollo/test) para observar con qué `type`/`props` se construye cada
 * elemento, independientemente de si React llega a montarlo. Envuelve la
 * implementación real (`vi.fn(real.jsxDEV)`): el render no cambia de
 * comportamiento, solo queda instrumentado.
 */
vi.mock('react/jsx-dev-runtime', async (importOriginal) => {
  const real = await importOriginal<typeof import('react/jsx-dev-runtime')>()
  return {
    ...real,
    jsxDEV: vi.fn<typeof real.jsxDEV>(real.jsxDEV),
  }
})

/** Centraliza el render de `App` bajo test y usa `React` en posición de tipo. */
function renderizarApp(): ReturnType<typeof render> {
  const arbol: React.JSX.Element = <App />
  return render(arbol)
}

const ANCHO_INNERWIDTH_POR_DEFECTO = window.innerWidth

/** Sustituye `window.innerWidth` (jsdom lo expone como propiedad de solo lectura por defecto). */
function establecerAnchoDeVentana(px: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: px })
}

/** Aísla cada test de la URL y del ancho que haya dejado el anterior (ambos son singletons de `window`). */
beforeEach(() => {
  window.history.pushState(null, '', '/')
  establecerAnchoDeVentana(ANCHO_INNERWIDTH_POR_DEFECTO)
})

describe('@s7 Cabecera, PieDePagina y SelectorPaleta forman un shell común a todas las rutas', () => {
  it.each(['/', '/campanas', '/blog', '/tienda'])(
    'en la ruta "%s" hay exactamente un "contentinfo", el botón de paleta y el logotipo antes que el pie',
    (ruta) => {
      window.history.pushState(null, '', ruta)
      renderizarApp()

      expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Cambiar paleta de color' })).toBeInTheDocument()

      const logotipo = screen.getByRole('link', { name: /Galapavet/ })
      expect(logotipo).toHaveAttribute('href', '#inicio')

      const contentinfo = screen.getByRole('contentinfo')
      expect((logotipo.compareDocumentPosition(contentinfo) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).toBe(true)
    },
  )
})

describe('@s8 BrowserRouter mantiene las anclas de sección como navegación dentro de la misma página', () => {
  it('pulsar "#servicios" no cambia el pathname, sí el hash, y Landing sigue montado', async () => {
    const usuario = userEvent.setup()
    renderizarApp()

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    await usuario.click(within(nav).getByRole('link', { name: 'Servicios' }))

    expect(window.location.pathname).toBe('/')
    expect(window.location.hash).toBe('#servicios')
    expect(screen.getByRole('heading', { level: 1, name: /Cuidamos la salud/ })).toBeInTheDocument()
  })
})

describe('@s9 Cabecera arranca con la rama correspondiente al ancho real de la ventana en el momento del montaje', () => {
  it('con un ancho de escritorio antes de montar, se ve la navegación principal con sus 8 enlaces', () => {
    establecerAnchoDeVentana(1300)

    renderizarApp()

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(within(nav).getAllByRole('link')).toHaveLength(8)
    expect(screen.queryByRole('button', { name: 'Abrir menú' })).not.toBeInTheDocument()
  })
})

describe('@s10 redimensionar la ventana real actualiza la rama de Cabecera sin recargar la página', () => {
  it('al pasar a un ancho móvil y disparar "resize", desaparece la navegación y aparece "Abrir menú"', () => {
    establecerAnchoDeVentana(1300)
    renderizarApp()
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()

    establecerAnchoDeVentana(500)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument()
  })
})

describe('@s10 refuerzo — el listener de "resize" añadido al montar se retira al desmontar', () => {
  it('unmount() llama a removeEventListener("resize", manejador) con el mismo manejador que addEventListener registró al montar', () => {
    const espiaAgregar = vi.spyOn(window, 'addEventListener')
    const espiaQuitar = vi.spyOn(window, 'removeEventListener')

    const arbol = renderizarApp()

    const llamadaDeMontaje = espiaAgregar.mock.calls.find(([evento]) => evento === 'resize')
    expect(llamadaDeMontaje).toBeDefined()
    const manejadorDeResize = (llamadaDeMontaje as [string, EventListener])[1]

    arbol.unmount()

    expect(espiaQuitar).toHaveBeenCalledWith('resize', manejadorDeResize)

    espiaAgregar.mockRestore()
    espiaQuitar.mockRestore()
  })

  it('el listener de "resize" se suscribe una sola vez, incluso tras un resize real que provoca un re-render', () => {
    const espiaAgregar = vi.spyOn(window, 'addEventListener')

    establecerAnchoDeVentana(1300)
    renderizarApp()
    const llamadasAlMontar = espiaAgregar.mock.calls.filter(([evento]) => evento === 'resize').length
    expect(llamadasAlMontar).toBe(1)

    establecerAnchoDeVentana(500)
    act(() => {
      window.dispatchEvent(new Event('resize'))
    })
    const llamadasTrasElReRender = espiaAgregar.mock.calls.filter(([evento]) => evento === 'resize').length
    expect(llamadasTrasElReRender).toBe(1)

    espiaAgregar.mockRestore()
  })
})

describe('@s11 antes de la primera medición, Cabecera recibe un ancho inicial que cae en la rama móvil', () => {
  it('con el primer ancho que App.tsx le pasa, existe "Abrir menú" y no existe "Navegación principal"', () => {
    const arbol: React.JSX.Element = <Cabecera ancho={ANCHO_ANTES_DE_MEDIR} />
    render(arbol)

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('@s12 las rutas /blog y /tienda sirven el catch-all "Página no encontrada" con enlace de vuelta', () => {
  // "/campanas" queda fuera de esta lista a propósito: desde `pagina_campanas`
  // (feature 16) ya no es 404 — tiene su propia `<Route>` real
  // (`src/pages/PaginaCampanas.tsx`). "/blog" y "/tienda" siguen sin página
  // propia (features 17/18, aún no aterrizadas) y por tanto siguen sirviendo
  // este catch-all: se conserva su cobertura tal cual.
  it.each(['/blog', '/tienda'])(
    'en "%s" hay un encabezado "Página no encontrada" y un enlace "Volver al inicio" a "/"',
    (ruta) => {
      window.history.pushState(null, '', ruta)
      renderizarApp()

      expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
      expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
      expect(screen.getByRole('link', { name: /Galapavet/ })).toHaveAttribute('href', '#inicio')
    },
  )
})

describe('@s12 refuerzo — App registra un <Route> explícito por cada ruta de subpágina, no solo cae en el comodín "*"', () => {
  // El valor exacto de RUTAS_DE_SUBPAGINA (`['/campanas', '/blog', '/tienda']`)
  // se verifica en `src/App-logica.test.ts`, donde vive ahora esa derivación.
  it('App registra un <Route> explícito con ese path por cada ruta de subpágina, además del comodín "*"', async () => {
    const { jsxDEV } = await import('react/jsx-dev-runtime')
    const espiaJsxDev = jsxDEV as ReturnType<typeof vi.fn>
    espiaJsxDev.mockClear()

    renderizarApp()

    const pathsDeRouteRegistrados = espiaJsxDev.mock.calls
      .filter(([tipo]) => tipo === Route)
      .map(([, props]) => (props as { path?: string }).path)

    // Si App.tsx:57:33 vacía `RUTAS_DE_SUBPAGINA.map(...)` a `() => undefined`,
    // ningún <Route> con estos 3 paths se construye (solo sobrevive el "*"):
    // esta lista deja de contenerlos aunque el DOM final sea idéntico.
    expect(pathsDeRouteRegistrados).toEqual(expect.arrayContaining(['/campanas', '/blog', '/tienda', '*']))
  })
})

describe('@s13 cualquier otra ruta no registrada por deep-link recibe el mismo catch-all', () => {
  it('en "/esto-no-existe" se ve el mismo encabezado, el mismo enlace y el shell común', () => {
    window.history.pushState(null, '', '/esto-no-existe')
    renderizarApp()

    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getByRole('link', { name: /Galapavet/ })).toHaveAttribute('href', '#inicio')
  })
})

/** `true` si `anterior` aparece antes que `siguiente` en el orden real del documento. */
function apareceAntes(anterior: Element, siguiente: Element): boolean {
  return (anterior.compareDocumentPosition(siguiente) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
}

describe('@s14 SelectorPaleta no altera el orden de las 8 secciones ancladas de la landing', () => {
  it('el botón "Cambiar paleta de color" no se interpone entre dos de las 8 secciones', () => {
    renderizarApp()

    const marcadores = [
      document.getElementById('inicio'),
      document.getElementById('servicios'),
      screen.getByRole('region', { name: 'Campañas de prevención' }),
      document.getElementById('equipo'),
      document.getElementById('reservar'),
      document.getElementById('galeria'),
      document.getElementById('contacto'),
      document.getElementById('faq'),
    ].map((elemento) => {
      expect(elemento).not.toBeNull()
      return elemento as Element
    })

    for (let indice = 0; indice < marcadores.length - 1; indice += 1) {
      expect(apareceAntes(marcadores[indice] as Element, marcadores[indice + 1] as Element)).toBe(true)
    }

    const botonPaleta = screen.getByRole('button', { name: 'Cambiar paleta de color' })
    const primeraSeccion = marcadores[0] as Element
    const ultimaSeccion = marcadores[marcadores.length - 1] as Element
    const botonQuedaFueraDelRango = apareceAntes(botonPaleta, primeraSeccion) || apareceAntes(ultimaSeccion, botonPaleta)
    expect(botonQuedaFueraDelRango).toBe(true)
  })
})
