import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../App'
import { Cabecera } from '../components/Cabecera'
import { PUNTO_DE_CORTE_NAVEGACION_PX } from '../components/Cabecera-logica'
import { PieDePagina } from '../components/PieDePagina'
import type { CampanaDemo } from '../data/campanas'
import { CAMPANAS_DEMO } from '../data/campanas'
import { SERVICIOS } from '../data/servicios'
import { PaginaCampanas } from './PaginaCampanas'

/** Sustituye `window.innerWidth` (jsdom lo expone como propiedad de solo lectura por defecto). */
function establecerAnchoDeVentana(px: number): void {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: px })
}

/**
 * Sustituye `window.matchMedia` global por uno que solo coincide con la
 * consulta indicada, escrita a mano (patrón
 * `doble-de-test-anclado-al-literal-no-al-simbolo`: no se importa la
 * consulta de producción). Mismo patrón que `Galeria.test.tsx`.
 */
function fijarPreferenciaDeMovimiento(prefiereMenos: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(
      (consulta: string) => ({ matches: prefiereMenos && consulta === '(prefers-reduced-motion: reduce)' }) as MediaQueryList,
    ),
  )
}

/** El catálogo real, con el título de la campaña indicada vaciado (mismo resto de campos). */
function catalogoConTituloVaciado(tituloAVaciar: string): CampanaDemo[] {
  return CAMPANAS_DEMO.map((campana) => vaciarTituloSiCoincide(campana, tituloAVaciar))
}

function vaciarTituloSiCoincide(campana: CampanaDemo, tituloAVaciar: string): CampanaDemo {
  if (campana.titulo !== tituloAVaciar) {
    return campana
  }
  return Object.assign({}, campana, { titulo: '' })
}

/** Centraliza el render de la app completa (Background: "comparte cabecera y pie con la landing"). */
function renderizarApp(): ReturnType<typeof render> {
  const arbol: React.JSX.Element = <App />
  return render(arbol)
}

/**
 * Igual que `renderizarApp`, pero con un catálogo inyectado (casos límite:
 * @s30-@s32, @s37-@s39). Compone el mismo shell real que `App.tsx`
 * (`Cabecera` + contenido + `PieDePagina`) para poder verificar que un
 * catálogo inválido no se lleva por delante el resto de la página, sin
 * mockear ningún módulo de datos.
 */
function renderizarPaginaConCatalogo(catalogo: readonly CampanaDemo[]): ReturnType<typeof render> {
  const arbol: React.JSX.Element = (
    <BrowserRouter>
      <Cabecera ancho={PUNTO_DE_CORTE_NAVEGACION_PX} />
      <PaginaCampanas catalogo={catalogo} />
      <PieDePagina />
    </BrowserRouter>
  )
  return render(arbol)
}

/** Aísla cada test de la URL y del ancho que haya dejado el anterior (ambos son singletons de `window`). */
beforeEach(() => {
  window.history.pushState(null, '', '/')
  establecerAnchoDeVentana(PUNTO_DE_CORTE_NAVEGACION_PX)
})

describe('@s1 la página comparte cabecera y pie con la landing y se marca como página actual', () => {
  it('existe banner, contentinfo y main; el enlace "Campañas" tiene aria-current="page" y ningún otro enlace lo tiene', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)

    const banner = screen.getByRole('banner')
    const nav = within(banner).getByRole('navigation', { name: 'Navegación principal' })
    const enlaces = within(nav).getAllByRole('link')
    expect(enlaces).toHaveLength(8)

    const enlaceCampanas = within(nav).getByRole('link', { name: 'Campañas' })
    expect(enlaceCampanas).toHaveAttribute('aria-current', 'page')

    const otros = enlaces.filter((enlace) => enlace !== enlaceCampanas)
    expect(otros).toHaveLength(7)
    for (const enlace of otros) {
      expect(enlace).not.toHaveAttribute('aria-current')
    }
  })
})

describe('@s2 el listado se presenta con su encabezado y sus migas de pan', () => {
  it('h1 "Campañas de prevención" y la región "Ruta" con "Inicio" → "/" y "Campañas" como actual (sin enlace)', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    const main = screen.getByRole('main')
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Campañas de prevención')

    const ruta = within(main).getByRole('navigation', { name: 'Ruta' })
    expect(within(ruta).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(within(ruta).getByText('Campañas')).toHaveAttribute('aria-current', 'page')
    expect(within(ruta).queryByRole('link', { name: 'Campañas' })).not.toBeInTheDocument()
  })
})

describe('@s3 el listado muestra una tarjeta por cada campaña del catálogo de demo', () => {
  it('exactamente 3 tarjetas con 3 h2 en orden, cada título publicado por el cliente', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    const listado = screen.getByRole('list', { name: 'Listado de campañas' })
    const tarjetas = within(listado).getAllByRole('listitem')
    expect(tarjetas).toHaveLength(3)

    const titulos = within(listado)
      .getAllByRole('heading', { level: 2 })
      .map((encabezado) => encabezado.textContent)
    expect(titulos).toEqual(['Vacunaciones', 'Chequeo', 'Odontología'])

    const puntosPublicados = SERVICIOS.flatMap((bloque) => bloque.puntos)
    for (const titulo of titulos) {
      expect(puntosPublicados).toContain(titulo)
    }
  })
})

describe('@s4 cada tarjeta se rotula como demostración y nombra el bloque publicado del que procede', () => {
  it('las 3 tarjetas dicen "Demostración" y ninguna otra cosa; Vacunaciones/Odontología citan su bloque', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    const listado = screen.getByRole('list', { name: 'Listado de campañas' })
    const tarjetas = within(listado).getAllByRole('listitem')
    expect(tarjetas).toHaveLength(3)
    for (const tarjeta of tarjetas) {
      expect(within(tarjeta).getByText('Demostración')).toBeInTheDocument()
    }
    expect(within(listado).getAllByText('Demostración')).toHaveLength(3)

    const vacunaciones = within(listado).getByRole('heading', { level: 2, name: 'Vacunaciones' }).closest('li')
    const odontologia = within(listado).getByRole('heading', { level: 2, name: 'Odontología' }).closest('li')
    expect(vacunaciones).not.toBeNull()
    expect(odontologia).not.toBeNull()
    expect(within(vacunaciones as HTMLElement).getByText('Bloque de servicios: Medicina general')).toBeInTheDocument()
    expect(within(odontologia as HTMLElement).getByText('Bloque de servicios: Especialidades')).toBeInTheDocument()
  })
})

const AVISO_DEMOSTRACION_PAGINA =
  'Contenido de demostración. Galapavet no ha confirmado ninguna campaña: esta página muestra el formato sobre servicios que la clínica sí presta. Precio, vigencia, plazas y condiciones están pendientes de confirmar con la clínica.'

describe('@s5 el aviso de demostración de la página es visible y literal', () => {
  it('el aviso exacto aparece una sola vez y antes de la primera tarjeta', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    const main = screen.getByRole('main')
    const avisos = within(main).getAllByText(AVISO_DEMOSTRACION_PAGINA)
    expect(avisos).toHaveLength(1)
    const aviso = avisos[0] as HTMLElement

    const listado = screen.getByRole('list', { name: 'Listado de campañas' })
    const primeraTarjeta = within(listado).getAllByRole('listitem')[0] as HTMLElement
    expect((aviso.compareDocumentPosition(primeraTarjeta) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).toBe(true)
  })
})

describe('@s6 cada tarjeta ofrece un enlace propio, distinguible, hacia su ficha', () => {
  it('un enlace por tarjeta, con nombre accesible y destino "/campanas?campana=<id>" propios, en orden', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    const listado = screen.getByRole('list', { name: 'Listado de campañas' })
    const tarjetas = within(listado).getAllByRole('listitem')
    for (const tarjeta of tarjetas) {
      expect(within(tarjeta).getAllByRole('link')).toHaveLength(1)
    }

    const nombresEsperados = ['Ver la ficha de Vacunaciones', 'Ver la ficha de Chequeo', 'Ver la ficha de Odontología']
    const enlaces = nombresEsperados.map((nombre) => within(listado).getByRole('link', { name: nombre }))
    expect(new Set(enlaces.map((enlace) => enlace.textContent)).size).toBe(3)

    const destinosEsperados = [
      '/campanas?campana=vacunaciones',
      '/campanas?campana=chequeo',
      '/campanas?campana=odontologia',
    ]
    enlaces.forEach((enlace, indice) => {
      expect(enlace).toHaveAttribute('href', destinosEsperados[indice])
    })
  })
})

describe('@s7 abrir una tarjeta muestra la ficha de esa campaña y retira el listado', () => {
  it('h1 pasa a ser el título de la campaña, desaparece el h1 del listado y los enlaces "Ver la ficha de"', async () => {
    const usuario = userEvent.setup()
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: 'Ver la ficha de Vacunaciones' }))

    const main = screen.getByRole('main')
    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Vacunaciones')
    expect(within(main).queryByRole('heading', { level: 1, name: 'Campañas de prevención' })).not.toBeInTheDocument()
    expect(
      within(main)
        .queryAllByRole('link')
        .filter((enlace) => (enlace.textContent ?? '').startsWith('Ver la ficha de')),
    ).toHaveLength(0)
  })
})

describe('@s8 abrir una tarjeta refleja la campaña abierta en la dirección del navegador', () => {
  it('la URL pasa a ser exactamente "/campanas?campana=chequeo", conservando la ruta "/campanas"', async () => {
    const usuario = userEvent.setup()
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: 'Ver la ficha de Chequeo' }))

    expect(window.location.pathname + window.location.search).toBe('/campanas?campana=chequeo')
    expect(window.location.pathname).toBe('/campanas')
  })
})

describe('@s9 al abrir una ficha el foco pasa a su encabezado de nivel 1', () => {
  it('el h1 "Odontología" recibe el foco y tiene tabIndex -1 (enfocable por programa, fuera del tab order)', async () => {
    const usuario = userEvent.setup()
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: 'Ver la ficha de Odontología' }))

    const h1 = screen.getByRole('heading', { level: 1, name: 'Odontología' })
    expect(document.activeElement).toBe(h1)
    expect(h1).toHaveAttribute('tabIndex', '-1')
  })
})

describe('@s10 entrar directamente por la dirección de una ficha muestra esa ficha', () => {
  it('h1 "Vacunaciones", sin aviso de no encontrada, y con el texto "Demostración"', () => {
    window.history.pushState(null, '', '/campanas?campana=vacunaciones')
    renderizarApp()

    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Vacunaciones')
    expect(within(main).queryByRole('status')).not.toBeInTheDocument()
    // Puede haber más de un texto "Demostración" (la ficha y cada tarjeta de
    // "Otras campañas"); basta con que exista al menos uno.
    expect(within(main).getAllByText('Demostración').length).toBeGreaterThan(0)
  })
})

describe('@s11 el botón Atrás del navegador devuelve al listado', () => {
  it('la URL vuelve a "/campanas" y el listado con sus 3 tarjetas reaparece', async () => {
    const usuario = userEvent.setup()
    window.history.pushState(null, '', '/campanas')
    renderizarApp()
    await usuario.click(screen.getByRole('link', { name: 'Ver la ficha de Vacunaciones' }))
    expect(window.location.pathname + window.location.search).toBe('/campanas?campana=vacunaciones')

    window.history.back()
    await waitFor(() => expect(window.location.search).toBe(''))

    expect(window.location.pathname + window.location.search).toBe('/campanas')
    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Campañas de prevención')
    const listado = within(main).getByRole('list', { name: 'Listado de campañas' })
    expect(within(listado).getAllByRole('listitem')).toHaveLength(3)
  })
})

describe('@s12 la ficha de «Vacunaciones» transcribe los cinco puntos publicados de «Medicina general»', () => {
  it('h2 "Qué publica la clínica", párrafo introductorio exacto y lista de 5 puntos en orden', () => {
    window.history.pushState(null, '', '/campanas?campana=vacunaciones')
    renderizarApp()

    const main = screen.getByRole('main')
    const bloque = within(main).getByRole('heading', { level: 2, name: 'Qué publica la clínica' }).closest('section')
    expect(bloque).not.toBeNull()
    const dentro = within(bloque as HTMLElement)

    expect(
      dentro.getByText('«Vacunaciones» es uno de los puntos que Galapavet publica dentro del bloque «Medicina general».'),
    ).toBeInTheDocument()

    const items = dentro.getAllByRole('listitem')
    expect(items).toHaveLength(5)
    expect(items.map((elemento) => elemento.textContent)).toEqual([
      'Preventiva',
      'Vacunaciones',
      'Desparasitaciones',
      'Chequeo',
      'Identificación con microchip',
    ])
  })
})

describe('@s13 la ficha de «Odontología» transcribe los cuatro puntos publicados de «Especialidades»', () => {
  it('párrafo introductorio exacto, lista de 4 puntos en orden, todos publicados por el cliente', () => {
    window.history.pushState(null, '', '/campanas?campana=odontologia')
    renderizarApp()

    const main = screen.getByRole('main')
    const bloque = within(main).getByRole('heading', { level: 2, name: 'Qué publica la clínica' }).closest('section')
    expect(bloque).not.toBeNull()
    const dentro = within(bloque as HTMLElement)

    expect(
      dentro.getByText('«Odontología» es uno de los puntos que Galapavet publica dentro del bloque «Especialidades».'),
    ).toBeInTheDocument()

    const items = dentro.getAllByRole('listitem')
    expect(items).toHaveLength(4)
    const textos = items.map((elemento) => elemento.textContent)
    expect(textos).toEqual(['Odontología', 'Oftalmología', 'Traumatología', 'Endoscopia'])

    const puntosPublicados = SERVICIOS.flatMap((elemento) => elemento.puntos)
    for (const texto of textos) {
      expect(puntosPublicados).toContain(texto)
    }
  })
})

describe('@s14 la ficha se rotula como demostración con el mismo aviso literal que el listado', () => {
  it('"Demostración" y el aviso literal aparecen, el aviso antes del h2 "Qué publica la clínica"', () => {
    window.history.pushState(null, '', '/campanas?campana=chequeo')
    renderizarApp()

    const main = screen.getByRole('main')
    expect(within(main).getAllByText('Demostración').length).toBeGreaterThan(0)
    const aviso = within(main).getByText(AVISO_DEMOSTRACION_PAGINA)
    expect(aviso).toBeInTheDocument()

    const encabezado = within(main).getByRole('heading', { level: 2, name: 'Qué publica la clínica' })
    expect((aviso.compareDocumentPosition(encabezado) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).toBe(true)
  })
})

const PENDIENTE = 'Pendiente de confirmar con la clínica'

/** Busca el `<dd>` inmediatamente siguiente al `<dt>` con este texto exacto. */
function valorDelTermino(contenedor: HTMLElement, termino: string): string | null {
  const dt = within(contenedor)
    .getAllByRole('term')
    .find((elemento) => elemento.textContent === termino)
  const dd = dt?.nextElementSibling
  return dd?.tagName === 'DD' ? dd.textContent : null
}

describe('@s15 el panel de datos pendientes nombra precio, vigencia y plazas sin ninguna cifra', () => {
  it('región "Datos pendientes de confirmar" con h2, 3 pares término/valor y sin dígitos ni "€"/"%"', () => {
    window.history.pushState(null, '', '/campanas?campana=vacunaciones')
    renderizarApp()

    const region = screen.getByRole('region', { name: 'Datos pendientes de confirmar' })
    expect(within(region).getByRole('heading', { level: 2, name: 'Datos pendientes de confirmar' })).toBeInTheDocument()

    expect(valorDelTermino(region, 'Precio')).toBe(PENDIENTE)
    expect(valorDelTermino(region, 'Vigencia')).toBe(PENDIENTE)
    expect(valorDelTermino(region, 'Plazas')).toBe(PENDIENTE)

    const texto = region.textContent ?? ''
    expect(texto).not.toMatch(/\d/)
    expect(texto).not.toContain('€')
    expect(texto).not.toContain('%')
  })
})

describe('@s16 la ficha ofrece llamar al teléfono real derivado de la fuente única', () => {
  it('un enlace con "91 082 92 67" en su nombre accesible, destino "tel:+34910829267" y único "tel:" en la página', () => {
    window.history.pushState(null, '', '/campanas?campana=vacunaciones')
    renderizarApp()

    const main = screen.getByRole('main')
    const enlaceLlamada = within(main)
      .getAllByRole('link')
      .find((enlace) => (enlace.textContent ?? '').includes('91 082 92 67'))
    expect(enlaceLlamada).toBeDefined()
    expect(enlaceLlamada).toHaveAttribute('href', 'tel:+34910829267')

    const destinosTel = within(main)
      .getAllByRole('link')
      .map((enlace) => enlace.getAttribute('href'))
      .filter((href): href is string => href !== null && href.startsWith('tel:'))
    expect(new Set(destinosTel)).toEqual(new Set(['tel:+34910829267']))
  })
})

describe('@s17 la ficha ofrece reservar y lleva a la sección de reserva de la landing', () => {
  it('enlace "Reservar cita" con destino exacto "/#reservar", sin la palabra "campaña"', () => {
    window.history.pushState(null, '', '/campanas?campana=odontologia')
    renderizarApp()

    const main = screen.getByRole('main')
    const enlace = within(main).getByRole('link', { name: 'Reservar cita' })
    expect(enlace).toHaveAttribute('href', '/#reservar')
    expect(enlace.textContent ?? '').not.toContain('campaña')
  })
})

describe('@s18 las migas de la ficha tienen tres niveles y la actual se marca con aria-current', () => {
  it('"Inicio"→"/", "Campañas"→"/campanas", y "Chequeo" actual sin enlace, en ese orden', () => {
    window.history.pushState(null, '', '/campanas?campana=chequeo')
    renderizarApp()

    const ruta = screen.getByRole('navigation', { name: 'Ruta' })
    const elementos = ruta.querySelectorAll('li')
    expect(elementos).toHaveLength(3)

    const primero = elementos[0] as HTMLElement
    const segundo = elementos[1] as HTMLElement
    const tercero = elementos[2] as HTMLElement

    expect(within(primero).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
    expect(within(segundo).getByRole('link', { name: 'Campañas' })).toHaveAttribute('href', '/campanas')
    expect(tercero).toHaveTextContent('Chequeo')
    expect(tercero).toHaveAttribute('aria-current', 'page')
    expect(within(tercero).queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('@s19 «Otras campañas» lista las demás campañas del catálogo y nunca la abierta', () => {
  it('h2 "Otras campañas", 2 tarjetas (Chequeo/Odontología), nunca Vacunaciones, con "Demostración" y sus destinos', () => {
    window.history.pushState(null, '', '/campanas?campana=vacunaciones')
    renderizarApp()

    const encabezado = screen.getByRole('heading', { level: 2, name: 'Otras campañas' })
    expect(encabezado.textContent).not.toContain('abiertas')
    const bloque = encabezado.closest('section')
    expect(bloque).not.toBeNull()
    const dentro = within(bloque as HTMLElement)

    const tarjetas = dentro.getAllByRole('listitem')
    expect(tarjetas).toHaveLength(2)

    const titulos = tarjetas.map((tarjeta) => tarjeta.querySelector('h3')?.textContent)
    expect(titulos).toEqual(['Chequeo', 'Odontología'])
    expect(titulos).not.toContain('Vacunaciones')

    for (const tarjeta of tarjetas) {
      expect(within(tarjeta).getByText('Demostración')).toBeInTheDocument()
    }

    const destinos = dentro.getAllByRole('link').map((enlace) => enlace.getAttribute('href'))
    expect(destinos).toEqual(['/campanas?campana=chequeo', '/campanas?campana=odontologia'])
  })
})

describe('@s20 ninguna imagen de la página se pide a un tercero', () => {
  it('exactamente 3 imágenes locales (una por tarjeta), sin "http(s)://" ni "pexels", con alt vacío', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    const main = screen.getByRole('main')
    const imagenes = main.querySelectorAll('img')
    expect(imagenes).toHaveLength(3)
    for (const imagen of imagenes) {
      const src = imagen.getAttribute('src') ?? ''
      expect(src).not.toContain('http://')
      expect(src).not.toContain('https://')
      expect(src).not.toContain('pexels')
      expect(imagen.getAttribute('alt')).toBe('')
    }
  })
})

describe('@s21 con la preferencia de menos movimiento, abrir una ficha no desplaza con suavizado', () => {
  it('window.scrollTo se llama con behavior "auto" y el h1 "Vacunaciones" se muestra', async () => {
    fijarPreferenciaDeMovimiento(true)
    const usuario = userEvent.setup()
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: 'Ver la ficha de Vacunaciones' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    expect(screen.getByRole('heading', { level: 1, name: 'Vacunaciones' })).toBeInTheDocument()
  })
})

describe('@s22 sin esa preferencia, abrir una ficha desplaza con suavizado', () => {
  it('window.scrollTo se llama con behavior "smooth" y el h1 "Vacunaciones" se muestra', async () => {
    fijarPreferenciaDeMovimiento(false)
    const usuario = userEvent.setup()
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: 'Ver la ficha de Vacunaciones' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(screen.getByRole('heading', { level: 1, name: 'Vacunaciones' })).toBeInTheDocument()
  })
})

describe('@s23 si la preferencia de movimiento no se puede consultar se desplaza sin suavizado', () => {
  it('sin "matchMedia" disponible, window.scrollTo se llama con behavior "auto" (y el setup falla si algo emite a consola)', async () => {
    vi.stubGlobal('matchMedia', undefined)
    const usuario = userEvent.setup()
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: 'Ver la ficha de Chequeo' }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})

/** Las cuatro direcciones que recorren el listado y las tres fichas (@s24/@s25/@s26). */
const CUATRO_VISTAS = [
  '/campanas',
  '/campanas?campana=vacunaciones',
  '/campanas?campana=chequeo',
  '/campanas?campana=odontologia',
]

/** Comprueba las cláusulas comunes de @s24 sobre el texto completo del contenido principal. */
function comprobarSinLenguajeDePrecio(main: HTMLElement): void {
  const texto = main.textContent ?? ''
  expect(texto).not.toContain('€')
  expect(texto).not.toContain('%')
  for (const cadena of ['EUR', 'IVA', 'tarifa', 'descuento', 'precio cerrado', 'Ahorras', 'ahorro', 'gratis', 'gratuita']) {
    expect(texto).not.toContain(cadena)
  }
}

describe('@s24 ningún texto del contenido principal muestra un precio', () => {
  it('en el listado ("/campanas"), sin lenguaje de precio y sin la palabra "Precio" como elemento propio', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    const main = screen.getByRole('main')
    comprobarSinLenguajeDePrecio(main)
    // "La palabra Precio" como elemento propio (nombre exacto, no cualquier
    // sustring dentro de una frase más larga como el aviso de demostración,
    // que la cita como parte de una oración, no como etiqueta).
    expect(within(main).queryAllByText('Precio', { exact: true })).toHaveLength(0)
  })

  it.each(CUATRO_VISTAS.slice(1))('en la ficha "%s", "Precio" aparece una sola vez, como etiqueta del panel pendiente', (ruta) => {
    window.history.pushState(null, '', ruta)
    renderizarApp()

    const main = screen.getByRole('main')
    comprobarSinLenguajeDePrecio(main)
    expect(within(main).queryAllByText('Precio', { exact: true })).toHaveLength(1)

    const region = screen.getByRole('region', { name: 'Datos pendientes de confirmar' })
    expect(valorDelTermino(region, 'Precio')).toBe(PENDIENTE)
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

/** Comprueba las cláusulas comunes de @s25 sobre el texto completo del contenido principal. */
function comprobarSinLenguajeDeFecha(main: HTMLElement): void {
  const texto = main.textContent ?? ''
  for (const mes of MESES_EN_ESPANOL) {
    expect(texto.toLowerCase()).not.toContain(mes)
  }
  for (const cadena of ['Hasta el', 'Todo el año', 'Empieza en']) {
    expect(texto).not.toContain(cadena)
  }
  expect(texto).not.toMatch(/\d{2}\/\d{2}\/\d{4}/)
  expect(texto).not.toMatch(/20\d{2}/)
}

describe('@s25 ningún texto del contenido principal muestra una fecha ni un periodo de vigencia', () => {
  it('en el listado ("/campanas"), sin lenguaje de fecha y sin "Vigencia"/"Plazas" como elementos propios', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarApp()

    const main = screen.getByRole('main')
    comprobarSinLenguajeDeFecha(main)
    expect(within(main).queryAllByText('Vigencia', { exact: true })).toHaveLength(0)
    expect(within(main).queryAllByText('Plazas', { exact: true })).toHaveLength(0)
  })

  it.each(CUATRO_VISTAS.slice(1))(
    'en la ficha "%s", "Vigencia" y "Plazas" aparecen una sola vez, como etiquetas del panel pendiente',
    (ruta) => {
      window.history.pushState(null, '', ruta)
      renderizarApp()

      const main = screen.getByRole('main')
      comprobarSinLenguajeDeFecha(main)

      const region = screen.getByRole('region', { name: 'Datos pendientes de confirmar' })
      for (const palabra of ['Vigencia', 'Plazas']) {
        expect(within(main).queryAllByText(palabra, { exact: true })).toHaveLength(1)
        expect(valorDelTermino(region, palabra)).toBe(PENDIENTE)
      }
    },
  )
})

describe('@s26 ningún texto del contenido principal anuncia urgencias 24 h ni arrastra datos del prototipo ajeno', () => {
  it.each(CUATRO_VISTAS)('en "%s", sin urgencias/24h, sin datos del prototipo ajeno, y el único estado es "Demostración"', (ruta) => {
    window.history.pushState(null, '', ruta)
    renderizarApp()

    const main = screen.getByRole('main')
    const texto = main.textContent ?? ''
    for (const cadena of ['24 h', '24 horas', 'Urgencias']) {
      expect(texto).not.toContain(cadena)
    }
    for (const cadena of ['Veterinaria La Sierra', 'Miraflores', 'Ctra. de la Sierra']) {
      expect(texto).not.toContain(cadena)
    }
    for (const cadena of ['918 44 21 60', '640 22 11 90']) {
      expect(texto).not.toContain(cadena)
    }
    for (const cadena of ['Activa', 'Plazas limitadas', 'campañas abiertas', 'Prevenir cuesta menos que curar']) {
      expect(texto).not.toContain(cadena)
    }

    const estados = within(main)
      .getAllByText(/./, { exact: true, selector: 'span' })
      .map((elemento) => elemento.textContent)
    expect(new Set(estados)).toEqual(new Set(['Demostración']))
  })
})

describe('@s27 un identificador desconocido muestra el listado y avisa de que no existe', () => {
  it('rol "status" con el aviso exacto, listado de 3 tarjetas, sin bloque "Qué publica la clínica"', () => {
    window.history.pushState(null, '', '/campanas?campana=vacunacion-anual-2026')
    renderizarApp()

    expect(screen.getByRole('status')).toHaveTextContent('No encontramos esa campaña de demostración.')

    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Campañas de prevención')
    const listado = within(main).getByRole('list', { name: 'Listado de campañas' })
    expect(within(listado).getAllByRole('listitem')).toHaveLength(3)
    expect(within(main).queryByRole('heading', { level: 2, name: 'Qué publica la clínica' })).not.toBeInTheDocument()
  })
})

describe('@s28 el aviso de campaña no encontrada no reproduce el valor recibido', () => {
  it('el rol "status" dice el literal exacto, sin la cadena recibida ni una imagen añadida por ella', () => {
    window.history.pushState(null, '', '/campanas?campana=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E')
    renderizarApp()

    const estado = screen.getByRole('status')
    expect(estado).toHaveTextContent('No encontramos esa campaña de demostración.')

    const main = screen.getByRole('main')
    const texto = main.textContent ?? ''
    expect(texto).not.toContain('<img')
    expect(texto).not.toContain('onerror')
    expect(main.querySelectorAll('img')).toHaveLength(3)
  })
})

describe('@s29 un identificador vacío se trata como el listado, sin aviso de error', () => {
  it('h1 "Campañas de prevención", 3 tarjetas, sin ningún rol "status"', () => {
    window.history.pushState(null, '', '/campanas?campana=')
    renderizarApp()

    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Campañas de prevención')
    const listado = within(main).getByRole('list', { name: 'Listado de campañas' })
    expect(within(listado).getAllByRole('listitem')).toHaveLength(3)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})

describe('@s30 caso límite — con el catálogo vacío la página se renderiza sin tarjetas y lo dice', () => {
  it('h1 "Campañas de prevención", aviso de catálogo vacío, sin tarjetas ni h2, y sigue existiendo banner/contentinfo', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarPaginaConCatalogo([])

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()

    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Campañas de prevención')
    expect(within(main).getByText('No hay ninguna campaña de demostración que mostrar.')).toBeInTheDocument()
    expect(within(main).queryByRole('list', { name: 'Listado de campañas' })).not.toBeInTheDocument()
    expect(within(main).queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
  })
})

describe('@s31 caso límite — si ninguna campaña del catálogo es válida se muestra el mismo aviso de vacío', () => {
  it('con las tres campañas sin título, el mismo aviso de catálogo vacío, sin tarjetas ni "Ver la ficha de"', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarPaginaConCatalogo([{ titulo: '' }, { titulo: '' }, { titulo: '' }])

    const main = screen.getByRole('main')
    expect(within(main).getByText('No hay ninguna campaña de demostración que mostrar.')).toBeInTheDocument()
    expect(within(main).queryByRole('list', { name: 'Listado de campañas' })).not.toBeInTheDocument()
    expect(
      within(main)
        .queryAllByRole('link')
        .filter((enlace) => (enlace.textContent ?? '').startsWith('Ver la ficha de')),
    ).toHaveLength(0)
  })
})

describe('@s32 caso límite — una campaña sin título se descarta y el resto se sigue mostrando', () => {
  it('exactamente 2 tarjetas (Vacunaciones/Odontología), ninguna con nombre accesible vacío, sin enlace a "chequeo"', () => {
    window.history.pushState(null, '', '/campanas')
    renderizarPaginaConCatalogo(catalogoConTituloVaciado('Chequeo'))

    const listado = screen.getByRole('list', { name: 'Listado de campañas' })
    const tarjetas = within(listado).getAllByRole('listitem')
    expect(tarjetas).toHaveLength(2)

    const titulos = within(listado)
      .getAllByRole('heading', { level: 2 })
      .map((encabezado) => encabezado.textContent)
    expect(titulos).toEqual(['Vacunaciones', 'Odontología'])

    for (const tarjeta of tarjetas) {
      const enlace = within(tarjeta).getByRole('link')
      expect(enlace.textContent).not.toBe('')
    }

    expect(within(listado).queryByRole('link', { name: /chequeo/i })).not.toBeInTheDocument()
    const destinos = within(listado)
      .getAllByRole('link')
      .map((enlace) => enlace.getAttribute('href'))
    expect(destinos).not.toContain('/campanas?campana=chequeo')
  })
})

describe('@s37 caso límite — un punto en blanco no pinta un elemento de lista vacío', () => {
  it('la lista de "Qué publica la clínica" tiene exactamente 4 elementos, ninguno con nombre accesible vacío', () => {
    window.history.pushState(null, '', '/campanas?campana=odontologia')
    const catalogoConPuntoEnBlanco = CAMPANAS_DEMO.map((campana) =>
      campana.titulo === 'Odontología' ? Object.assign({}, campana, { puntos: [...(campana.puntos ?? []), ' '] }) : campana,
    )
    renderizarPaginaConCatalogo(catalogoConPuntoEnBlanco)

    const bloque = screen.getByRole('heading', { level: 2, name: 'Qué publica la clínica' }).closest('section')
    expect(bloque).not.toBeNull()
    const items = within(bloque as HTMLElement).getAllByRole('listitem')
    expect(items).toHaveLength(4)
    for (const item of items) {
      expect(item.textContent).not.toBe('')
    }
  })
})

describe('@s38 caso límite — una campaña cuyo bloque no publica ningún punto no muestra encabezado ni lista vacía', () => {
  it('h1 "Odontología", sin h2 "Qué publica la clínica", sin listas vacías, con el panel de pendientes intacto', () => {
    window.history.pushState(null, '', '/campanas?campana=odontologia')
    const catalogoSinPuntos = CAMPANAS_DEMO.map((campana) =>
      campana.titulo === 'Odontología' ? Object.assign({}, campana, { puntos: [] }) : campana,
    )
    renderizarPaginaConCatalogo(catalogoSinPuntos)

    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Odontología')
    expect(within(main).queryByRole('heading', { level: 2, name: 'Qué publica la clínica' })).not.toBeInTheDocument()

    for (const lista of main.querySelectorAll('ul')) {
      expect(lista.children).not.toHaveLength(0)
    }

    expect(screen.getByRole('region', { name: 'Datos pendientes de confirmar' })).toBeInTheDocument()
  })
})

describe('@s39 caso límite — una ficha sin otras campañas no muestra la sección «Otras campañas»', () => {
  it('h1 "Vacunaciones", sin h2 "Otras campañas" ni tarjetas, con la región "Ruta" intacta', () => {
    window.history.pushState(null, '', '/campanas?campana=vacunaciones')
    const unicaCampana = CAMPANAS_DEMO.filter((campana) => campana.titulo === 'Vacunaciones')
    renderizarPaginaConCatalogo(unicaCampana)

    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Vacunaciones')
    expect(within(main).queryByRole('heading', { level: 2, name: 'Otras campañas' })).not.toBeInTheDocument()
    expect(within(main).queryAllByRole('heading', { level: 3 })).toHaveLength(0)
    expect(screen.getByRole('navigation', { name: 'Ruta' })).toBeInTheDocument()
  })
})
