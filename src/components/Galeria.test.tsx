import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GALERIA, type EntradaGaleria } from '../data/galeria'
import { Galeria } from './Galeria'
import { SEPARACION_ENTRE_TARJETAS_PX } from './Galeria-logica'

/** Centraliza el render de `Galeria` bajo test. */
function renderizarGaleria(props: React.ComponentProps<typeof Galeria> = {}): ReturnType<typeof render> {
  return render(<Galeria {...props} />)
}

/** Catálogo mínimo de 2 entradas, con nombre/pie/src distintos, para @s1/@s2. */
const CATALOGO_DOS_ENTRADAS: readonly EntradaGaleria[] = [
  { nombre: 'Nala y Coco', pie: 'Primera vacunación', src: '/img/galeria/prueba-1.webp' },
  { nombre: 'Bruno', pie: 'Alta tras cirugía de rodilla', src: '/img/galeria/prueba-2.webp' },
]

/**
 * Sustituye `window.matchMedia` global por uno que solo coincide con la
 * consulta indicada, escrita a mano (patrón
 * `doble-de-test-anclado-al-literal-no-al-simbolo`: no se importa la
 * consulta de producción).
 */
function fijarPreferenciaDeMovimiento(prefiereMenos: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(
      (consulta: string) => ({ matches: prefiereMenos && consulta === '(prefers-reduced-motion: reduce)' }) as MediaQueryList,
    ),
  )
}

/**
 * Fuerza el ancho medido de la primera tarjeta (figura) de la pista. jsdom no
 * hace layout: `getBoundingClientRect` siempre devuelve un rect en 0 salvo
 * que el propio test lo sustituya (comentario de `src/test/setup.ts`).
 */
function fijarAnchoDePrimeraTarjeta(anchoPx: number): void {
  const primeraFigura = document.querySelector('figure')
  if (primeraFigura === null) {
    throw new Error('No hay ninguna figura en el documento')
  }
  vi.spyOn(primeraFigura, 'getBoundingClientRect').mockReturnValue({
    width: anchoPx,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: () => '',
  } as DOMRect)
}

describe('@s1 cada entrada del catálogo se muestra como una fotografía con texto alternativo', () => {
  it('hay exactamente 2 figuras, cada una con 1 imagen, con nombre accesible no vacío y sin repetir', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const figuras = screen.getAllByRole('figure')
    expect(figuras).toHaveLength(2)

    const nombresAccesibles: string[] = []
    for (const figura of figuras) {
      const imagenes = within(figura).getAllByRole('img')
      expect(imagenes).toHaveLength(1)
      const nombreAccesible = imagenes[0]?.getAttribute('alt') ?? ''
      expect(nombreAccesible.length).toBeGreaterThan(0)
      nombresAccesibles.push(nombreAccesible)
    }
    expect(new Set(nombresAccesibles).size).toBe(nombresAccesibles.length)
  })
})

describe('@s2 cada figura muestra el nombre y el pie de su entrada', () => {
  it('el texto de cada figura contiene su propio nombre y su propio pie, y no el de la otra entrada', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const figuraNala = screen.getByRole('img', { name: 'Nala y Coco' }).closest('figure')
    const figuraBruno = screen.getByRole('img', { name: 'Bruno' }).closest('figure')
    if (figuraNala === null || figuraBruno === null) {
      throw new Error('No se encontró alguna de las dos figuras esperadas')
    }

    expect(figuraNala.textContent).toContain('Nala y Coco')
    expect(figuraNala.textContent).toContain('Primera vacunación')
    expect(figuraNala.textContent).not.toContain('Alta tras cirugía de rodilla')

    expect(figuraBruno.textContent).toContain('Bruno')
    expect(figuraBruno.textContent).toContain('Alta tras cirugía de rodilla')
    expect(figuraBruno.textContent).not.toContain('Primera vacunación')
  })
})

describe('@s3 la región y sus controles exponen nombre accesible', () => {
  it('hay una región "Galería" y dos botones "Foto anterior"/"Foto siguiente" cuyo nombre no viene solo del glifo visible', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    expect(screen.getByRole('region', { name: /Galería/ })).toBeInTheDocument()

    const botonAnterior = screen.getByRole('button', { name: 'Foto anterior' })
    const botonSiguiente = screen.getByRole('button', { name: 'Foto siguiente' })

    // El nombre accesible no puede venir únicamente del glifo visible: si el
    // texto visible del botón coincidiera con su nombre accesible, el nombre
    // dependería del glifo (p. ej. "‹"), no de un rótulo explícito.
    expect(botonAnterior.textContent?.trim()).not.toBe('Foto anterior')
    expect(botonSiguiente.textContent?.trim()).not.toBe('Foto siguiente')
  })
})

describe('@s4 la pista desplazable es alcanzable con el teclado', () => {
  it('tabulando desde el principio del componente el foco llega a la pista, con nombre accesible no vacío', async () => {
    const usuario = userEvent.setup()
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    // El botón "Foto anterior" es el primer elemento focusable del componente.
    await usuario.tab()
    expect(screen.getByRole('button', { name: 'Foto anterior' })).toHaveFocus()

    await usuario.tab()

    const pista = document.activeElement
    expect(pista).not.toBeNull()
    expect(pista?.tagName).not.toBe('BUTTON')
    expect(pista).not.toBe(screen.getByRole('button', { name: 'Foto siguiente' }))
    expect(pista?.getAttribute('aria-label')?.length).toBeGreaterThan(0)
  })
})

describe('@s5 el botón "Foto siguiente" desplaza la pista una tarjeta hacia el final', () => {
  it('solicita a la pista un desplazamiento de exactamente ancho + separación, positivo y suavizado', async () => {
    const usuario = userEvent.setup()
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })
    fijarAnchoDePrimeraTarjeta(240)

    await usuario.click(screen.getByRole('button', { name: 'Foto siguiente' }))

    const pista = screen.getByRole('group', { name: /Fotografías/ })
    expect(pista.scrollBy).toHaveBeenCalledTimes(1)
    expect(pista.scrollBy).toHaveBeenCalledWith({
      left: 240 + SEPARACION_ENTRE_TARJETAS_PX,
      behavior: 'smooth',
    })
  })
})

describe('@s6 el botón "Foto anterior" desplaza la pista una tarjeta hacia el principio', () => {
  it('solicita a la pista un desplazamiento de exactamente ancho + separación, negativo y suavizado', async () => {
    const usuario = userEvent.setup()
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })
    fijarAnchoDePrimeraTarjeta(240)

    await usuario.click(screen.getByRole('button', { name: 'Foto anterior' }))

    const pista = screen.getByRole('group', { name: /Fotografías/ })
    expect(pista.scrollBy).toHaveBeenCalledTimes(1)
    expect(pista.scrollBy).toHaveBeenCalledWith({
      left: -(240 + SEPARACION_ENTRE_TARJETAS_PX),
      behavior: 'smooth',
    })
  })
})

describe('@s7 con la preferencia de menos movimiento el desplazamiento es instantáneo', () => {
  it('no se suaviza, pero la distancia solicitada sigue siendo ancho + separación', async () => {
    const usuario = userEvent.setup()
    fijarPreferenciaDeMovimiento(true)
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })
    fijarAnchoDePrimeraTarjeta(240)

    await usuario.click(screen.getByRole('button', { name: 'Foto siguiente' }))

    const pista = screen.getByRole('group', { name: /Fotografías/ })
    expect(pista.scrollBy).toHaveBeenCalledWith({
      left: 240 + SEPARACION_ENTRE_TARJETAS_PX,
      behavior: 'auto',
    })
  })
})

describe('@s8 si la preferencia de movimiento no se puede consultar se desplaza sin suavizado', () => {
  it('sin matchMedia disponible, la solicitud no se suaviza (y el setup global falla si algo emite a consola)', async () => {
    const usuario = userEvent.setup()
    vi.stubGlobal('matchMedia', undefined)
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })
    fijarAnchoDePrimeraTarjeta(240)

    await usuario.click(screen.getByRole('button', { name: 'Foto siguiente' }))

    const pista = screen.getByRole('group', { name: /Fotografías/ })
    expect(pista.scrollBy).toHaveBeenCalledWith({
      left: 240 + SEPARACION_ENTRE_TARJETAS_PX,
      behavior: 'auto',
    })
  })
})

// Decisión 11 (project-spec.md): el desplazamiento horizontal FÍSICO de la
// pista (scrollLeft) no es medible en jsdom -- scrollBy con
// behavior:'smooth' no llega a moverlo. Las 3 últimas cláusulas de @s9 y la
// última de @s10 se verifican con navegador real (extensión Claude in
// Chrome / skill browser-automation), fuera del gate de Vitest/Stryker. Aquí
// solo se cubre lo medible: la primera cláusula de @s9 (el control sigue
// habilitado) y la primera de @s10 (no se solicita ningún desplazamiento).
describe('@s9 pulsar "Foto anterior" estando ya al principio no mueve la pista ni inutiliza el control', () => {
  it('con la pista en su posición inicial (scrollLeft 0), tras pulsar "Foto anterior" el botón sigue habilitado y conserva su nombre accesible', async () => {
    const usuario = userEvent.setup()
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })
    fijarAnchoDePrimeraTarjeta(240)

    const pista = screen.getByRole('group', { name: /Fotografías/ })
    expect(pista.scrollLeft).toBe(0)

    await usuario.click(screen.getByRole('button', { name: 'Foto anterior' }))

    const botonAnterior = screen.getByRole('button', { name: 'Foto anterior' })
    expect(botonAnterior).toBeEnabled()
  })
})

describe('@s10 sin tarjeta medible no se solicita ningún desplazamiento', () => {
  it('con la primera tarjeta midiendo 0 de ancho, al pulsar "Foto siguiente" no se llama a scrollBy', async () => {
    const usuario = userEvent.setup()
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })
    fijarAnchoDePrimeraTarjeta(0)

    await usuario.click(screen.getByRole('button', { name: 'Foto siguiente' }))

    const pista = screen.getByRole('group', { name: /Fotografías/ })
    expect(pista.scrollBy).not.toHaveBeenCalled()
  })
})

describe('@s11 todas las fotografías se sirven desde el propio sitio', () => {
  it('con el catálogo real, ninguna imagen apunta a un origen externo ni hay iframes en la sección', () => {
    renderizarGaleria()

    const imagenes = screen.getAllByRole('img')
    expect(imagenes.length).toBeGreaterThan(0)
    for (const imagen of imagenes) {
      const src = imagen.getAttribute('src') ?? ''
      expect(src.startsWith('http://')).toBe(false)
      expect(src.startsWith('https://')).toBe(false)
      expect(src.startsWith('//')).toBe(false)
      expect(src).not.toContain('images.pexels.com')
      expect(imagen.hasAttribute('srcset')).toBe(false)
    }

    const seccion = screen.getByRole('region', { name: /Galería/ })
    expect(seccion.querySelectorAll('iframe').length).toBe(0)
  })
})

const AVISO_DEMOSTRACION =
  'Contenido de demostración. Estas fotografías y sus pies son de ejemplo, no fotografías reales de pacientes de Galapavet: la clínica todavía no ha cedido fotografías propias ni el consentimiento de las familias fotografiadas.'

describe('@s12 el contenido de la galería está rotulado como demostración', () => {
  it('la sección muestra el aviso exacto, sin interacción, y es su descripción accesible', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const aviso = screen.getByText(AVISO_DEMOSTRACION)
    expect(aviso).toBeVisible()

    const seccion = screen.getByRole('region', { name: /Galería/ })
    const idDescripcion = seccion.getAttribute('aria-describedby')
    expect(idDescripcion).toBeTruthy()
    expect(document.getElementById(idDescripcion ?? '')).toBe(aviso)
  })
})

describe('@s13 la sección no afirma que las fotografías sean pacientes de Galapavet', () => {
  it('el texto de la sección no contiene "pacientes reales" ni "con permiso de sus familias"', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const seccion = screen.getByRole('region', { name: /Galería/ })
    expect(seccion.textContent).not.toContain('pacientes reales')
    expect(seccion.textContent).not.toContain('con permiso de sus familias')
  })
})

describe('@s14 los pies de demostración no mencionan servicios que el cliente no publica', () => {
  it('con el catálogo real, ningún pie menciona peluquería, exóticos, urgencias 24 h, nutrición y etología, ni microchip y viajes', () => {
    renderizarGaleria()

    const seccion = screen.getByRole('region', { name: /Galería/ })
    expect(seccion.textContent).not.toContain('peluquería')
    expect(seccion.textContent).not.toContain('exóticos')
    expect(seccion.textContent).not.toContain('urgencias 24 h')
    expect(seccion.textContent).not.toContain('nutrición y etología')
    expect(seccion.textContent).not.toContain('microchip y viajes')
  })
})

describe('@s15 con el catálogo vacío la sección no se renderiza', () => {
  it('no existe ninguna región "Galería", ningún botón de navegación ni ninguna figura', () => {
    renderizarGaleria({ catalogo: [] })

    expect(screen.queryByRole('region', { name: /Galería/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Foto anterior' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Foto siguiente' })).not.toBeInTheDocument()
    expect(screen.queryAllByRole('figure')).toHaveLength(0)
  })
})

describe('@s16 el catálogo de galería de producción no está vacío', () => {
  it('el módulo de producción exporta más de 0 entradas, y renderizando sin sustituirlo el número de figuras coincide', () => {
    expect(GALERIA.length).toBeGreaterThan(0)

    renderizarGaleria()

    expect(screen.getAllByRole('figure')).toHaveLength(GALERIA.length)
  })
})

describe('@s17 una entrada del catálogo con el nombre en blanco no se renderiza y no arrastra a las demás', () => {
  it('con 3 entradas y la segunda de nombre en blanco, solo se muestran 2 figuras, con su nombre y su pie', () => {
    const catalogoConNombreEnBlanco: readonly EntradaGaleria[] = [
      { nombre: 'Nala y Coco', pie: 'Primera vacunación', src: '/img/galeria/prueba-1.webp' },
      { nombre: '   ', pie: 'Pie huérfano', src: '/img/galeria/prueba-huerfana.webp' },
      { nombre: 'Bruno', pie: 'Alta tras cirugía de rodilla', src: '/img/galeria/prueba-2.webp' },
    ]
    renderizarGaleria({ catalogo: catalogoConNombreEnBlanco })

    const figuras = screen.getAllByRole('figure')
    expect(figuras).toHaveLength(2)
    expect(screen.queryByText('Pie huérfano', { exact: false })).not.toBeInTheDocument()

    expect(screen.getByRole('img', { name: 'Nala y Coco' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Bruno' })).toBeInTheDocument()
    expect(screen.getByText('Nala y Coco · Primera vacunación')).toBeInTheDocument()
    expect(screen.getByText('Bruno · Alta tras cirugía de rodilla')).toBeInTheDocument()
  })
})
