import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    const enlacesDelPanel = enlaces.filter((enlace) => !enlace.getAttribute('href')?.startsWith('tel:'))
    expect(enlacesDelPanel.map((enlace) => enlace.textContent)).toEqual(NOMBRES_EN_ORDEN)
    enlacesDelPanel.forEach((enlace, indice) => {
      expect(enlace).toHaveAttribute('href', DESTINOS_EN_ORDEN[indice])
    })
    expect(within(panel as HTMLElement).getByRole('link', { name: /Urgencias fuera de horario.*91 851 13 93/ })).toHaveAttribute(
      'href',
      'tel:+34918511393',
    )
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
  it('el enlace de marca agrupa el logotipo real, "Galapavet" y su descriptor, sin el nombre ficticio', () => {
    const { container } = renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    const enlaceLogo = screen.getByRole('link', { name: /Galapavet/ })
    expect(enlaceLogo).toHaveAttribute('href', '#inicio')
    expect(enlaceLogo.querySelector('img')).toHaveAttribute('src', expect.stringMatching(/\/img\/logo-galapavet\.webp$/))
    expect(enlaceLogo).toHaveTextContent('Centro integral veterinario')
    expect(container).not.toHaveTextContent('Veterinaria La Sierra')
  })
})

describe('@s1 de fidelidad_lienzo: el contenido de cabecera tiene un contenedor alineable', () => {
  it('la única caja interior agrupa la marca y la navegación sin crear un landmark adicional', () => {
    const { container } = renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    const cabecera = container.querySelector('header')
    expect(cabecera).not.toBeNull()
    expect(cabecera?.children).toHaveLength(1)
    const interior = cabecera?.firstElementChild
    expect(interior).toHaveAttribute('data-cabecera-interior')
    expect(within(interior as HTMLElement).getByRole('link', { name: /Galapavet/ })).toBeInTheDocument()
    expect(within(interior as HTMLElement).getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
  })
})

describe('@s2 de fidelidad_cabecera: el CTA de urgencias usa solo la fuente única y queda fuera de la navegación', () => {
  it('en escritorio enlaza al teléfono real, conserva los ocho destinos de la navegación y nunca anuncia 24 h', () => {
    const { container } = renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    const enlaceUrgencias = screen.getByRole('link', { name: /Urgencias fuera de horario.*91 851 13 93/ })
    const navegacion = screen.getByRole('navigation', { name: 'Navegación principal' })

    expect(enlaceUrgencias).toHaveAttribute('href', 'tel:+34918511393')
    expect(within(navegacion).getAllByRole('link')).toHaveLength(8)
    expect(within(navegacion).queryByRole('link', { name: /Urgencias/ })).toBeNull()
    expect(container).not.toHaveTextContent('24 h')
    expect(container).not.toHaveTextContent('24h')
    expect(container).not.toHaveTextContent('640 22 11 90')
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

describe('@s28 el acceso a la Tienda lleva un estilo de borde sin relleno, distinto del resto del catálogo', () => {
  it('en la navegación de escritorio, solo el enlace de Tienda lleva el atributo que activa el estilo de borde sin relleno', () => {
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    const enlaces = within(nav).getAllByRole('link')
    const enlaceTienda = within(nav).getByRole('link', { name: 'Tienda' })

    expect(enlaceTienda).toHaveAttribute('data-enlace-tienda')
    expect(enlaces.filter((enlace) => enlace.hasAttribute('data-enlace-tienda'))).toHaveLength(1)
  })

  it('en el panel móvil, el enlace de Tienda también lleva el mismo atributo', async () => {
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX - 1 })

    await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }))

    expect(screen.getByRole('link', { name: 'Tienda' })).toHaveAttribute('data-enlace-tienda')
  })
})

// ----------------------------------------------------------------------------
// Texto REAL de los estilos propios de esta cabecera (`?raw`), mismo patrón que
// `InformacionContacto.test.tsx` (`cuerpoDelBloque`): la puerta lee el fichero
// de verdad, nunca un símbolo de producción, así que un sabotaje del
// `.module.scss` se ve reflejado sin tocar este test.
const TEXTO_CABECERA_SCSS = Object.values(
  import.meta.glob('./Cabecera.module.scss', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>,
)[0] as string

/**
 * El cuerpo (sin las llaves que lo delimitan) del bloque cuya cabecera literal
 * es `encabezadoDelBloque` (p. ej. `".navPrincipal {"`), casando llaves
 * anidadas. Falla con un mensaje que nombra la cabecera buscada si no la
 * encuentra, en vez de devolver un fragmento a medias.
 */
function cuerpoDelBloque(texto: string, encabezadoDelBloque: string): string {
  const indiceDeCabecera = texto.indexOf(encabezadoDelBloque)
  if (indiceDeCabecera === -1) {
    throw new Error(`no se encontró la cabecera "${encabezadoDelBloque}" en el texto`)
  }
  const indiceDeAperturaLlave = indiceDeCabecera + encabezadoDelBloque.length - 1
  let profundidad = 1
  let indice = indiceDeAperturaLlave + 1
  while (profundidad > 0) {
    if (texto[indice] === '{') profundidad++
    if (texto[indice] === '}') profundidad--
    indice++
  }
  return texto.slice(indiceDeAperturaLlave + 1, indice - 1)
}

describe('@s28 el estilo de borde sin relleno del acceso a la Tienda vive de verdad en la hoja de estilos, con el mixin compartido', () => {
  it('lee de verdad el fichero de estilos propio: el corpus no está vacío', () => {
    expect(TEXTO_CABECERA_SCSS.length).toBeGreaterThan(0)
  })

  it('en la navegación de escritorio, el selector del enlace de Tienda incluye el mixin "boton-fantasma"', () => {
    const cuerpoNav = cuerpoDelBloque(TEXTO_CABECERA_SCSS, '.navPrincipal {')
    const cuerpoEnlaceTienda = cuerpoDelBloque(cuerpoNav, 'a[data-enlace-tienda] {')

    expect(cuerpoEnlaceTienda).toContain('@include boton-fantasma')
  })

  it('en el panel móvil, el selector del enlace de Tienda incluye el mismo mixin "boton-fantasma"', () => {
    const cuerpoPanel = cuerpoDelBloque(TEXTO_CABECERA_SCSS, '.panelMovil {')
    const cuerpoEnlaceTienda = cuerpoDelBloque(cuerpoPanel, 'a[data-enlace-tienda] {')

    expect(cuerpoEnlaceTienda).toContain('@include boton-fantasma')
  })
})

// ----------------------------------------------------------------------------
// Salto a una sección desde un ancla de la navegación de escritorio (@s28):
// el sitio de destino se mide en el momento del clic, nunca un número escrito
// a mano. jsdom no hace layout real, así que cada rect se sustituye a mano
// (mismo patrón que `Galeria.test.tsx`, `fijarAnchoDePrimeraTarjeta`).

/** Elementos insertados directamente en `document.body` (no vía `render`, que `cleanup()` de `src/test/setup.ts` no toca) para simular una sección real de la portada. Se retiran tras cada test. */
let elementosDeDestino: HTMLElement[] = []

function crearElementoDeDestino(id: string): HTMLElement {
  const elemento = document.createElement('div')
  elemento.id = id
  document.body.appendChild(elemento)
  elementosDeDestino.push(elemento)
  return elemento
}

afterEach(() => {
  elementosDeDestino.forEach((elemento) => elemento.remove())
  elementosDeDestino = []
})

/** Rect medido a mano para un elemento, sustituyendo lo que jsdom nunca calcula. */
function fijarRectMedido(elemento: Element, valores: Partial<DOMRect>): void {
  vi.spyOn(elemento, 'getBoundingClientRect').mockReturnValue({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => '',
    ...valores,
  } as DOMRect)
}

/** Mismo patrón que `PaginaCampanas.test.tsx` (`fijarPreferenciaDeMovimiento`): ancla la consulta a un literal escrito a mano, nunca a la constante de producción. */
function fijarPreferenciaDeMovimiento(prefiereMenos: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(
      (consulta: string) => ({ matches: prefiereMenos && consulta === '(prefers-reduced-motion: reduce)' }) as MediaQueryList,
    ),
  )
}

describe('@s28 el salto a una sección desde la navegación de escritorio se calcula desde la altura real de la cabecera más la barra de urgencias, no desde un número escrito a mano', () => {
  it('llama a window.scrollTo con el scroll ya acumulado más la distancia real al elemento menos la altura real de la cabecera (que arranca justo debajo de la barra de urgencias, así que su "bottom" ya incluye las dos)', async () => {
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })
    const seccionServicios = crearElementoDeDestino('servicios')

    fijarRectMedido(screen.getByRole('banner'), { bottom: 96 })
    fijarRectMedido(seccionServicios, { top: 500 })
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(200)

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    await usuario.click(within(nav).getByRole('link', { name: 'Servicios' }))

    // 200 (ya desplazado) + 500 (distancia real al elemento) - 96 (altura
    // real de la cabecera, franja fija completa) = 604. Literal calculado a
    // mano (mismo patrón que `Cabecera-logica.test.ts`), nunca delegado en la
    // propia fórmula de producción.
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 604, behavior: 'smooth' })
  })

  it('también deja el hash de la URL en el destino pulsado, sin que ese cambio de por sí desplace nada (usa "pushState", no "location.hash")', async () => {
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })
    const seccionServicios = crearElementoDeDestino('servicios')
    fijarRectMedido(screen.getByRole('banner'), { bottom: 96 })
    fijarRectMedido(seccionServicios, { top: 500 })

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    await usuario.click(within(nav).getByRole('link', { name: 'Servicios' }))

    expect(window.location.hash).toBe('#servicios')
    expect(window.location.pathname).toBe('/')
  })

  it('con la preferencia de menos movimiento activa, pide el desplazamiento sin suavizado ("auto")', async () => {
    fijarPreferenciaDeMovimiento(true)
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })
    const seccionFaq = crearElementoDeDestino('faq')

    fijarRectMedido(screen.getByRole('banner'), { bottom: 96 })
    fijarRectMedido(seccionFaq, { top: 500 })
    vi.spyOn(window, 'scrollY', 'get').mockReturnValue(200)

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    await usuario.click(within(nav).getByRole('link', { name: 'FAQ' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 604, behavior: 'auto' })
  })

  it('si la sección de destino no existe todavía en el documento, no llama a window.scrollTo y deja la navegación nativa del ancla seguir su curso', async () => {
    const usuario = userEvent.setup()
    renderizarCabecera({ ancho: PUNTO_DE_CORTE_NAVEGACION_PX })

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    await usuario.click(within(nav).getByRole('link', { name: 'Contacto' }))

    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(window.location.hash).toBe('#contacto')
  })
})

/**
 * Reparación del 03/09/2026 (oleada B): `imagenes.spec.ts` @s31 de
 * `identidad_visual` bloquea `/img/**` y exige que TODA `<img>` pinte su hueco
 * con `--color-fondo-alterno` en el propio elemento; el logotipo de la marca
 * (`/img/logo-galapavet.webp`, 201×201) quedaba transparente. Mismo mecanismo
 * a escala de icono que ya usa el pie (`PieDePagina.module.scss`, `.marca img`).
 */
describe('@s31 de identidad_visual: el logotipo de la marca reserva su hueco 1/1 con el mixin compartido', () => {
  it('el bloque "img" dentro de ".marca" incluye "hueco-de-imagen(1, 1)"', () => {
    const cuerpoMarca = cuerpoDelBloque(TEXTO_CABECERA_SCSS, '.marca {')
    const cuerpoImg = cuerpoDelBloque(cuerpoMarca, 'img {')

    expect(cuerpoImg).toContain('@include hueco-de-imagen(1, 1);')
  })
})

/**
 * Reparación del 03/09/2026 (oleada B): `fidelidad.spec.ts` @s44 de
 * `rediseno_visual` midió a 320 px que el `<span>` solo para lectores «Abrir
 * menú» del botón hamburguesa sobresalía del viewport (borde derecho 326 >
 * 320): la clase solo recortaba con `clip-path`, pero la caja absoluta seguía
 * midiendo el ancho del texto y nacía en el borde del botón, pegado al margen
 * derecho. La técnica de ocultación visual tiene que reducir la caja a 1×1 px
 * ADEMÁS de recortarla, para que nunca salga del botón que la contiene.
 */
describe('@s44 de rediseno_visual: el texto solo para lectores no ocupa sitio fuera de su botón', () => {
  it('".textoSoloLectores" es absoluto, mide 1×1 px, recorta con overflow y clip-path, y no parte líneas', () => {
    const cuerpo = cuerpoDelBloque(TEXTO_CABECERA_SCSS, '.textoSoloLectores {')

    expect(cuerpo).toContain('position: absolute;')
    expect(cuerpo).toContain('width: 1px;')
    expect(cuerpo).toContain('height: 1px;')
    expect(cuerpo).toContain('overflow: hidden;')
    expect(cuerpo).toContain('clip-path: inset(50%);')
    expect(cuerpo).toContain('text-wrap: nowrap;')
  })
})
