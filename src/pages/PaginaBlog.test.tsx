import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ArticuloDemo } from '../data/blog'
import { ARTICULOS_DEMO } from '../data/blog'
import { App } from '../App'
import { PaginaBlog } from './PaginaBlog'

/**
 * Sustituye `window.matchMedia` global por uno que solo coincide con la
 * consulta indicada, escrita a mano (patrón
 * `doble-de-test-anclado-al-literal-no-al-simbolo`: no se importa la
 * consulta de producción). Mismo patrón que `PaginaCampanas.test.tsx`.
 */
function fijarPreferenciaDeMovimiento(prefiereMenos: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(
      (consulta: string) => ({ matches: prefiereMenos && consulta === '(prefers-reduced-motion: reduce)' }) as MediaQueryList,
    ),
  )
}

/** Centraliza el render de la app completa (Background: comparte cabecera y pie con la landing). */
function renderizarApp(): ReturnType<typeof render> {
  const arbol: React.JSX.Element = <App />
  return render(arbol)
}

/**
 * Igual que `renderizarApp`, pero con un catálogo inyectado (casos límite:
 * @s13, @s16, @s19, @s31). Monta las mismas dos rutas que `App.tsx`
 * registrará para el blog, sin el resto del shell — mismo criterio que
 * `renderizarPaginaConCatalogo` de `PaginaCampanas.test.tsx`.
 */
function renderizarBlogConCatalogo(catalogo: readonly ArticuloDemo[]): ReturnType<typeof render> {
  const arbol: React.JSX.Element = (
    <BrowserRouter>
      <Routes>
        <Route path="/blog" element={<PaginaBlog catalogo={catalogo} />} />
        <Route path="/blog/:identificador" element={<PaginaBlog catalogo={catalogo} />} />
      </Routes>
    </BrowserRouter>
  )
  return render(arbol)
}

/** Aísla cada test de la URL que haya dejado el anterior (singleton de `window`). */
beforeEach(() => {
  window.history.pushState(null, '', '/blog')
})

const AVISO_DEMOSTRACION =
  'Contenido de demostración. Galapavet no ha escrito ninguno de estos artículos: son textos de ejemplo para enseñar el formato. No son consejo veterinario ni comprometen a la clínica.'

/** `true` si `anterior` aparece antes que `siguiente` en el orden real del documento. */
function apareceAntes(anterior: Element, siguiente: Element): boolean {
  return (anterior.compareDocumentPosition(siguiente) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
}

describe('@s1 el listado es una página propia con un único contenido principal y su encabezado', () => {
  it('existe exactamente un "main" con un único h1 "Blog", y ningún h1 fuera de él', () => {
    renderizarApp()

    const mains = screen.getAllByRole('main')
    expect(mains).toHaveLength(1)
    const main = mains[0] as HTMLElement

    expect(within(main).getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Blog')

    const h1FueraDeMain = screen.getAllByRole('heading', { level: 1 }).filter((encabezado) => !main.contains(encabezado))
    expect(h1FueraDeMain).toHaveLength(0)
  })
})

describe('@s2 la página comparte cabecera y pie con la landing y se señala como página actual', () => {
  it('banner y contentinfo únicos; "Blog" tiene aria-current="page" y es el único; sin "Urgencias" en la cabecera', () => {
    renderizarApp()

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)

    const banner = screen.getByRole('banner')
    const nav = within(banner).getByRole('navigation', { name: 'Navegación principal' })
    const enlaceBlog = within(nav).getByRole('link', { name: 'Blog' })
    expect(enlaceBlog).toHaveAttribute('aria-current', 'page')

    const otrosEnlaces = within(nav)
      .getAllByRole('link')
      .filter((enlace) => enlace !== enlaceBlog)
    for (const enlace of otrosEnlaces) {
      expect(enlace).not.toHaveAttribute('aria-current')
    }

    const urgencias = within(banner).queryAllByRole('link', { name: /Urgencias/ })
    const botonesUrgencias = within(banner).queryAllByRole('button', { name: /Urgencias/ })
    expect(urgencias).toHaveLength(0)
    expect(botonesUrgencias).toHaveLength(0)
  })
})

describe('@s3 el aviso de demostración encabeza el listado con su texto literal', () => {
  it('el aviso literal es visible, único, y aparece antes que el primer enlace de artículo', () => {
    renderizarApp()

    const main = screen.getByRole('main')
    const aviso = within(main).getByText(AVISO_DEMOSTRACION)
    expect(aviso).toBeVisible()

    const primerEnlace = within(main).getAllByRole('link')[0] as HTMLElement
    expect(apareceAntes(aviso, primerEnlace)).toBe(true)
  })
})

describe('@s4 el listado muestra un enlace por artículo, en el orden del catálogo, con su destino propio', () => {
  it('6 enlaces con destinos "/blog/demo-1".."/blog/demo-6" en orden, sin nombres accesibles repetidos', () => {
    renderizarApp()

    const main = screen.getByRole('main')
    const enlaces = within(main)
      .getAllByRole('link')
      .filter((enlace) => (enlace.getAttribute('href') ?? '').startsWith('/blog/'))
    expect(enlaces).toHaveLength(6)

    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual([
      '/blog/demo-1',
      '/blog/demo-2',
      '/blog/demo-3',
      '/blog/demo-4',
      '/blog/demo-5',
      '/blog/demo-6',
    ])

    const nombres = enlaces.map((enlace) => enlace.textContent)
    expect(new Set(nombres).size).toBe(6)
  })
})

describe('@s5 cada tarjeta lleva la marca de demostración y ningún otro distintivo', () => {
  it('las 6 tarjetas dicen "Demostración", su nombre accesible incluye título+"Demostración", sin "Destacado" ni otro distintivo', () => {
    renderizarApp()

    const main = screen.getByRole('main')
    expect(within(main).getAllByText('Demostración')).toHaveLength(6)

    for (const articuloDemo of ARTICULOS_DEMO) {
      const enlace = within(main).getByRole('link', { name: new RegExp(articuloDemo.titulo) })
      expect(enlace.textContent ?? '').toContain('Demostración')
      expect(enlace.textContent ?? '').toContain(articuloDemo.titulo)
    }

    expect(within(main).queryByText('Destacado')).not.toBeInTheDocument()
  })
})

describe('@s6 ninguna tarjeta atribuye el texto a una persona ni lo fecha', () => {
  it('sin nombres, iniciales, fechas ni imágenes en las tarjetas del listado', () => {
    renderizarApp()

    const main = screen.getByRole('main')
    expect(main.querySelectorAll('img')).toHaveLength(0)

    const texto = main.textContent ?? ''
    for (const cadena of [
      'Dra. Elena Vargas',
      'Dr. Marcos Nieto',
      'Dra. Lucía Ferrer',
      'Sergio Ibáñez',
      'Marcos Pérez',
      'Joaquín Herranz',
    ]) {
      expect(texto).not.toContain(cadena)
    }
  })
})

describe('@s7 el filtro ofrece «Todos» más las cinco categorías publicadas, y solo «Todos» está aplicado', () => {
  it('grupo "Filtrar por categoría" con 6 botones en orden, solo "Todos" con aria-pressed "true"', () => {
    renderizarApp()

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    const botones = within(grupo).getAllByRole('button')
    expect(botones.map((boton) => boton.textContent)).toEqual([
      'Todos',
      'Cirugía y anestesia',
      'Diagnóstico de imagen',
      'Medicina general',
      'Análisis',
      'Especialidades',
    ])

    expect(within(grupo).getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
    const otros = botones.filter((boton) => boton.textContent !== 'Todos')
    expect(otros).toHaveLength(5)
    for (const boton of otros) {
      expect(boton).toHaveAttribute('aria-pressed', 'false')
    }

    for (const nombreProhibido of ['Salud', 'Gatos', 'Cachorros', 'Urgencias']) {
      expect(within(grupo).queryByRole('button', { name: nombreProhibido })).not.toBeInTheDocument()
    }
  })
})

describe('@s8 filtrar por una categoría deja exactamente los artículos de esa categoría', () => {
  it('pulsar "Análisis" deja 2 enlaces con destinos con "?categoria=An%C3%A1lisis" y actualiza aria-pressed', async () => {
    const usuario = userEvent.setup()
    renderizarApp()

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    await usuario.click(within(grupo).getByRole('button', { name: 'Análisis' }))

    const main = screen.getByRole('main')
    const enlaces = within(main)
      .getAllByRole('link')
      .filter((enlace) => (enlace.getAttribute('href') ?? '').startsWith('/blog/'))
    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual([
      '/blog/demo-4?categoria=An%C3%A1lisis',
      '/blog/demo-5?categoria=An%C3%A1lisis',
    ])

    expect(within(grupo).getByRole('button', { name: 'Análisis' })).toHaveAttribute('aria-pressed', 'true')
    const otros = within(grupo)
      .getAllByRole('button')
      .filter((boton) => boton.textContent !== 'Análisis')
    expect(otros).toHaveLength(5)
    for (const boton of otros) {
      expect(boton).toHaveAttribute('aria-pressed', 'false')
    }

    expect(within(main).queryByText('No hay artículos de demostración en esta categoría.')).not.toBeInTheDocument()
  })
})

describe('@s9 el filtro aplicado queda escrito en la dirección', () => {
  it('pulsar "Medicina general" conserva el pathname "/blog", escribe "categoria" y deja 3 enlaces', async () => {
    const usuario = userEvent.setup()
    renderizarApp()

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    await usuario.click(within(grupo).getByRole('button', { name: 'Medicina general' }))

    expect(window.location.pathname).toBe('/blog')
    expect(new URLSearchParams(window.location.search).get('categoria')).toBe('Medicina general')

    const main = screen.getByRole('main')
    const enlaces = within(main)
      .getAllByRole('link')
      .filter((enlace) => (enlace.getAttribute('href') ?? '').startsWith('/blog/'))
    expect(enlaces).toHaveLength(3)
  })
})

describe('@s10 entrar directamente por una dirección filtrada llega ya filtrado', () => {
  it('con "?categoria=Especialidades", 1 enlace a "/blog/demo-6?categoria=Especialidades" y ese botón activo', () => {
    window.history.pushState(null, '', '/blog?categoria=Especialidades')
    renderizarApp()

    const main = screen.getByRole('main')
    const enlaces = within(main)
      .getAllByRole('link')
      .filter((enlace) => (enlace.getAttribute('href') ?? '').startsWith('/blog/'))
    expect(enlaces).toHaveLength(1)
    expect(enlaces[0]).toHaveAttribute('href', '/blog/demo-6?categoria=Especialidades')

    const grupo = screen.getByRole('group', { name: 'Filtrar por categoría' })
    expect(within(grupo).getByRole('button', { name: 'Especialidades' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(grupo).getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('@s11 caso límite — una categoría publicada sin ningún artículo muestra el aviso de lista vacía', () => {
  it('con "Diagnóstico de imagen" no hay enlaces, se lee el aviso exacto, y los 6 botones siguen presentes', () => {
    window.history.pushState(null, '', '/blog?categoria=Diagn%C3%B3stico%20de%20imagen')
    renderizarApp()

    const main = screen.getByRole('main')
    const enlacesDeArticulo = within(main)
      .queryAllByRole('link')
      .filter((enlace) => (enlace.getAttribute('href') ?? '').startsWith('/blog/'))
    expect(enlacesDeArticulo).toHaveLength(0)

    expect(within(main).getByText('No hay artículos de demostración en esta categoría.')).toBeInTheDocument()

    const grupo = within(main).getByRole('group', { name: 'Filtrar por categoría' })
    expect(within(grupo).getAllByRole('button')).toHaveLength(6)
    expect(within(grupo).getByRole('button', { name: 'Diagnóstico de imagen' })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('@s12 caso límite — un valor de categoría corrupto cae a «Todos» sin escribir basura', () => {
  it('con un valor "<script>", se muestran los 6 enlaces, "Todos" activo, y el texto recibido no aparece en la página', () => {
    window.history.pushState(null, '', '/blog?categoria=%3Cscript%3Ealert(1)%3C%2Fscript%3E')
    renderizarApp()

    const main = screen.getByRole('main')
    const enlaces = within(main)
      .getAllByRole('link')
      .filter((enlace) => (enlace.getAttribute('href') ?? '').startsWith('/blog/'))
    expect(enlaces).toHaveLength(6)

    const grupo = within(main).getByRole('group', { name: 'Filtrar por categoría' })
    expect(within(grupo).getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(grupo).queryByRole('button', { name: /script/i })).not.toBeInTheDocument()

    expect(main.textContent ?? '').not.toContain('<script>alert(1)</script>')
  })
})

describe('@s13 caso límite — con el catálogo de demostración vacío no se pinta ninguna tarjeta ni texto de relleno', () => {
  it('h1 "Blog" sigue presente, aviso de catálogo vacío, sin enlaces ni grupo de filtro', () => {
    window.history.pushState(null, '', '/blog')
    renderizarBlogConCatalogo([])

    const main = screen.getByRole('main')
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Blog')
    expect(within(main).getByText('Todavía no hay ningún artículo de demostración que mostrar.')).toBeInTheDocument()
    expect(within(main).queryAllByRole('link')).toHaveLength(0)
    expect(within(main).queryByRole('group', { name: 'Filtrar por categoría' })).not.toBeInTheDocument()
  })
})

describe('@s14 abrir un artículo lleva a su propia dirección y lo muestra completo', () => {
  it('pulsar el artículo 3 navega a "/blog/demo-3" y muestra main→article con h1/imagen/cuerpo, con "volver" fuera', async () => {
    const usuario = userEvent.setup()
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: /Artículo de demostración 3/ }))

    expect(window.location.pathname).toBe('/blog/demo-3')
    expect(screen.getAllByRole('main')).toHaveLength(1)
    const main = screen.getByRole('main')
    expect(within(main).getAllByRole('article')).toHaveLength(1)
    const article = within(main).getByRole('article')

    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Artículo de demostración 3')
    expect(within(article).getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(article.querySelectorAll('img')).toHaveLength(1)

    const enlaceVolver = within(main).getByRole('link', { name: 'Volver al listado del blog' })
    expect(within(article).queryByRole('link', { name: 'Volver al listado del blog' })).not.toBeInTheDocument()
    expect(main.contains(enlaceVolver)).toBe(true)
    expect(article.contains(enlaceVolver)).toBe(false)
  })
})

describe('@s15 la vista de artículo repite el aviso de demostración antes del cuerpo', () => {
  it('el aviso literal, carácter por carácter igual al del listado, aparece antes del primer bloque del cuerpo', () => {
    window.history.pushState(null, '', '/blog/demo-3')
    renderizarApp()

    const main = screen.getByRole('main')
    const aviso = within(main).getByText(AVISO_DEMOSTRACION)
    expect(aviso).toBeInTheDocument()

    const article = within(main).getByRole('article')
    const primerParrafo = within(article).getAllByRole('paragraph')[0] as HTMLElement
    expect(apareceAntes(aviso, primerParrafo)).toBe(true)
  })
})

describe('@s16 el cuerpo del artículo se pinta con elementos semánticos reales', () => {
  it('2 encabezados de nivel 2, 1 blockquote y 2 paragraph dentro de "article", ninguno sin rol', () => {
    const cuerpoDePrueba: ArticuloDemo['cuerpo'] = [
      { tipo: 'parrafo', texto: 'Primer párrafo de prueba.' },
      { tipo: 'encabezado', texto: 'Primer encabezado de prueba' },
      { tipo: 'cita', texto: 'Una cita de prueba.' },
      { tipo: 'encabezado', texto: 'Segundo encabezado de prueba' },
      { tipo: 'parrafo', texto: 'Segundo párrafo de prueba.' },
    ]
    const catalogo = ARTICULOS_DEMO.map((articuloDemo) =>
      articuloDemo.identificador === 'demo-3' ? Object.assign({}, articuloDemo, { cuerpo: cuerpoDePrueba }) : articuloDemo,
    )
    window.history.pushState(null, '', '/blog/demo-3')
    renderizarBlogConCatalogo(catalogo)

    const article = screen.getByRole('article')
    expect(within(article).getAllByRole('heading', { level: 2 })).toHaveLength(2)
    expect(within(article).getAllByRole('blockquote')).toHaveLength(1)
    expect(within(article).getAllByRole('paragraph')).toHaveLength(2)
    expect(within(article).queryAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})

describe('@s17 el artículo no muestra firma de autor, ni iniciales, ni fecha de publicación', () => {
  it('sin nombres, roles profesionales, fechas, ni ningún elemento nombrado "Autor"/"Escrito por"', () => {
    window.history.pushState(null, '', '/blog/demo-3')
    renderizarApp()

    const main = screen.getByRole('main')
    const texto = main.textContent ?? ''
    for (const cadena of [
      'Dra. Elena Vargas',
      'Dr. Marcos Nieto',
      'Dra. Lucía Ferrer',
      'Sergio Ibáñez',
      'Marcos Pérez',
      'Joaquín Herranz',
      'Directora clínica',
      'Cirujano jefe',
      'Auxiliar técnico veterinario',
    ]) {
      expect(texto).not.toContain(cadena)
    }

    expect(within(main).queryByText(/Autor/)).not.toBeInTheDocument()
    expect(within(main).queryByText(/Escrito por/)).not.toBeInTheDocument()
  })
})

describe('@s19 caso límite — un cuerpo sin ninguna palabra no muestra tiempo de lectura', () => {
  it('demo-5 sin palabras: sin tiempo de lectura, sin "0 min", con el h1 presente', () => {
    const catalogo = ARTICULOS_DEMO.map((articuloDemo) =>
      articuloDemo.identificador === 'demo-5' ? Object.assign({}, articuloDemo, { cuerpo: [] }) : articuloDemo,
    )
    window.history.pushState(null, '', '/blog/demo-5')
    renderizarBlogConCatalogo(catalogo)

    const main = screen.getByRole('main')
    expect(main.textContent ?? '').not.toContain('0 min')
    expect(main.textContent ?? '').not.toMatch(/\d+ min/)
    expect(within(main).getByRole('heading', { level: 1 })).toHaveTextContent('Artículo de demostración 5')
  })
})

describe('@s20 volver al listado conserva el filtro con el que se llegó', () => {
  it('con "?categoria=Análisis", el enlace "Volver al listado del blog" apunta a "/blog?categoria=An%C3%A1lisis" sin target', () => {
    window.history.pushState(null, '', '/blog/demo-4?categoria=An%C3%A1lisis')
    renderizarApp()

    const enlaces = screen.getAllByRole('link', { name: 'Volver al listado del blog' })
    expect(enlaces).toHaveLength(1)
    const enlace = enlaces[0] as HTMLElement
    expect(enlace).toHaveAttribute('href', '/blog?categoria=An%C3%A1lisis')
    expect(enlace).not.toHaveAttribute('target')
  })
})

describe('@s21 caso límite — un identificador de artículo inexistente no pinta un artículo vacío', () => {
  it('se lee el aviso exacto, hay un enlace "Volver al listado del blog" a "/blog", y no hay "article" ni h1 vacío', () => {
    window.history.pushState(null, '', '/blog/no-existe')
    renderizarApp()

    expect(screen.getByText('No hemos encontrado ese artículo.')).toBeInTheDocument()

    const enlace = screen.getByRole('link', { name: 'Volver al listado del blog' })
    expect(enlace).toHaveAttribute('href', '/blog')

    expect(screen.queryByRole('article')).not.toBeInTheDocument()
    const main = screen.getByRole('main')
    // Sin encabezado de nivel 1 en absoluto en esta vista: ninguno vacío que mostrar.
    expect(within(main).queryByRole('heading', { level: 1 })).not.toBeInTheDocument()

    expect(window.location.pathname).toBe('/blog/no-existe')
  })
})

describe('@s22 «Sigue leyendo» ofrece artículos de la misma categoría y nunca el actual', () => {
  it('h2 "Sigue leyendo" con 2 enlaces a demo-2 y demo-3, nunca a demo-1, y como mucho 3', () => {
    window.history.pushState(null, '', '/blog/demo-1')
    renderizarApp()

    const encabezados = screen.getAllByRole('heading', { level: 2, name: 'Sigue leyendo' })
    expect(encabezados).toHaveLength(1)
    const bloque = encabezados[0]?.closest('section') as HTMLElement
    const enlaces = within(bloque).getAllByRole('link')
    expect(enlaces).toHaveLength(2)
    expect(enlaces.map((enlace) => enlace.getAttribute('href'))).toEqual(['/blog/demo-2', '/blog/demo-3'])
    expect(enlaces.some((enlace) => enlace.getAttribute('href') === '/blog/demo-1')).toBe(false)
    expect(enlaces.length).toBeLessThanOrEqual(3)
  })
})

describe('@s23 caso límite — sin otros artículos de su categoría, el bloque «Sigue leyendo» no existe', () => {
  it('demo-6 (única "Especialidades"): sin encabezado "Sigue leyendo" ni tarjeta relacionada ni relleno', () => {
    window.history.pushState(null, '', '/blog/demo-6')
    renderizarApp()

    expect(screen.queryByRole('heading', { name: 'Sigue leyendo' })).not.toBeInTheDocument()
    const main = screen.getByRole('main')
    const article = within(main).getByRole('article')
    const fueraDelArticulo = [...main.querySelectorAll('a')].filter((enlace) => !article.contains(enlace))
    const enlacesRelacionados = fueraDelArticulo.filter((enlace) => (enlace.getAttribute('href') ?? '').startsWith('/blog/demo-'))
    expect(enlacesRelacionados).toHaveLength(0)
  })
})

describe('@s24 el cierre del artículo invita a pedir cita sin prometer nada', () => {
  it('h2 exacto, enlace "Reservar cita" a "/#reservar", sin teléfono ni "24 h"/"gratis"/"sin coste"/plazos', () => {
    window.history.pushState(null, '', '/blog/demo-3')
    renderizarApp()

    const encabezado = screen.getByRole('heading', { level: 2, name: '¿Tienes una duda con tu animal?' })
    const cierre = encabezado.closest('section') as HTMLElement

    const enlace = within(cierre).getByRole('link', { name: 'Reservar cita' })
    expect(enlace).toHaveAttribute('href', '/#reservar')

    const texto = cierre.textContent ?? ''
    expect(texto).not.toMatch(/\d{2,3}[\s.]?\d{2}[\s.]?\d{2}[\s.]?\d{2}/)
    for (const cadena of ['24 h', 'gratis', 'sin coste']) {
      expect(texto).not.toContain(cadena)
    }
  })
})

describe('@s27 ningún artículo habla en nombre de la clínica ni hereda nada del prototipo', () => {
  it('el texto de los 6 artículos y los títulos del listado no contienen ningún término prohibido, y sí los 6 títulos', () => {
    window.history.pushState(null, '', '/blog')
    const primera = renderizarApp()
    const main = screen.getByRole('main')
    const titulosDelListado = within(main)
      .getAllByRole('heading', { level: 2 })
      .map((encabezado) => encabezado.textContent ?? '')
      .join(' ')
    primera.unmount()

    const textosDeArticulos = ARTICULOS_DEMO.map((articuloDemo) => {
      window.history.pushState(null, '', `/blog/${articuloDemo.identificador}`)
      const { unmount } = renderizarApp()
      const texto = screen.getByRole('article').textContent ?? ''
      unmount()
      return texto
    })

    const textoCompleto = [titulosDelListado, ...textosDeArticulos].join(' ')

    expect(textoCompleto.trim()).not.toBe('')
    for (const articuloDemo of ARTICULOS_DEMO) {
      expect(textoCompleto).toContain(articuloDemo.titulo)
    }

    const terminosProhibidos = [
      'Galapavet',
      'nuestra clínica',
      'nuestro equipo',
      'en consulta atendemos',
      'recomendamos',
      'Veterinaria La Sierra',
      'Miraflores',
      'Ctra. de la Sierra',
      '640 22 11 90',
      '918 44 21 60',
      '640221190',
      '918442160',
      '24 h',
      '24h',
      'todos los días del año',
      '€',
      '%',
      'Salud',
      'Prevención',
      'Gatos',
      'Cachorros',
      'Urgencias',
    ]
    for (const termino of terminosProhibidos) {
      expect(textoCompleto).not.toContain(termino)
    }
  })
})

describe('@s28 las imágenes son locales y solo describen lo que se ve', () => {
  it('exactamente 3 imágenes (cuerpo + 2 miniaturas de "Sigue leyendo"), locales, con alt correcto', () => {
    window.history.pushState(null, '', '/blog/demo-1')
    renderizarApp()

    const main = screen.getByRole('main')
    const imagenes = main.querySelectorAll('img')
    expect(imagenes).toHaveLength(3)

    for (const imagen of imagenes) {
      const src = imagen.getAttribute('src') ?? ''
      expect(src.startsWith('/')).toBe(true)
      expect(src).not.toContain('http://')
      expect(src).not.toContain('https://')
      expect(src).not.toContain('pexels.com')
    }

    const articuloDemo = ARTICULOS_DEMO.find((entrada) => entrada.identificador === 'demo-1') as ArticuloDemo
    const article = screen.getByRole('article')
    const imagenArticulo = article.querySelector('img') as HTMLImageElement
    expect(imagenArticulo.getAttribute('alt')).toBe(articuloDemo.textoAlternativoImagen)
    expect(imagenArticulo.getAttribute('alt')).not.toBe('')

    const miniaturas = [...imagenes].filter((imagen) => imagen !== imagenArticulo)
    expect(miniaturas).toHaveLength(2)
    for (const miniatura of miniaturas) {
      expect(miniatura.getAttribute('alt')).toBe('')
      const enlace = miniatura.closest('a') as HTMLElement
      expect(enlace).not.toBeNull()
    }

    const bloque = screen.getByRole('heading', { level: 2, name: 'Sigue leyendo' }).closest('section') as HTMLElement
    const enlacesRelacionados = within(bloque).getAllByRole('link')
    expect(enlacesRelacionados.map((enlace) => enlace.textContent)).toEqual([
      'Artículo de demostración 2',
      'Artículo de demostración 3',
    ])
  })
})

describe('@s29 el desplazamiento al abrir un artículo respeta la preferencia de movimiento', () => {
  it('con la preferencia de menos movimiento, window.scrollTo se llama con behavior "auto"', async () => {
    fijarPreferenciaDeMovimiento(true)
    const usuario = userEvent.setup()
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: /Artículo de demostración 3/ }))

    expect(window.location.pathname).toBe('/blog/demo-3')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  it('sin esa preferencia, window.scrollTo se llama con behavior "smooth"', async () => {
    fijarPreferenciaDeMovimiento(false)
    const usuario = userEvent.setup()
    renderizarApp()

    await usuario.click(screen.getByRole('link', { name: /Artículo de demostración 3/ }))

    expect(window.location.pathname).toBe('/blog/demo-3')
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })
})

describe('@s31 el tiempo de lectura calculado se muestra en una página de artículo real', () => {
  it('con exactamente 200 palabras en demo-2, aparece "1 min" dentro del elemento "article"', () => {
    const doscientasPalabras = Array.from({ length: 200 }, () => 'palabra').join(' ')
    const catalogo = ARTICULOS_DEMO.map((articuloDemo) =>
      articuloDemo.identificador === 'demo-2'
        ? Object.assign({}, articuloDemo, { cuerpo: [{ tipo: 'parrafo' as const, texto: doscientasPalabras }] })
        : articuloDemo,
    )
    window.history.pushState(null, '', '/blog/demo-2')
    renderizarBlogConCatalogo(catalogo)

    const article = screen.getByRole('article')
    expect(article.textContent ?? '').toContain('1 min')
  })
})
