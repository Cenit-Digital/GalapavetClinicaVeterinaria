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

    // ENMIENDA (fidelidad_galeria @s1, 03/09/2026): los dos controles viven
    // juntos en la cabecera, ANTES de la pista, como en el prototipo; el
    // contrato @s4 solo exige que el teclado alcance la pista, no que sea la
    // segunda parada. Recorrido real: "Foto anterior" → "Foto siguiente" →
    // pista. Ver `progress/fidelidad/enmiendas_fidelidad_galeria.md`.
    await usuario.tab()
    expect(screen.getByRole('button', { name: 'Foto anterior' })).toHaveFocus()
    await usuario.tab()
    expect(screen.getByRole('button', { name: 'Foto siguiente' })).toHaveFocus()

    await usuario.tab()

    const pista = document.activeElement
    expect(pista).not.toBeNull()
    expect(pista?.tagName).not.toBe('BUTTON')
    expect(pista).toBe(screen.getByRole('group', { name: /Fotografías/ }))
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
    // ENMIENDA (fidelidad_galeria @s2, 03/09/2026): el contrato @s17 pide que
    // "las otras dos entradas se muestran con su nombre y su pie", no el formato
    // "nombre · pie" en una sola cadena que este test daba por hecho. Ahora
    // nombre y pie son dos elementos dentro de la figura. Ver
    // `progress/fidelidad/enmiendas_fidelidad_galeria.md`.
    const entradasVisibles: readonly (readonly [nombre: string, pie: string])[] = [
      ['Nala y Coco', 'Primera vacunación'],
      ['Bruno', 'Alta tras cirugía de rodilla'],
    ]
    for (const [nombre, pie] of entradasVisibles) {
      const figura = screen.getByRole('img', { name: nombre }).closest('figure')
      if (figura === null) {
        throw new Error(`No hay figura para "${nombre}"`)
      }
      expect(within(figura).getByText(nombre)).toBeInTheDocument()
      expect(within(figura).getByText(pie)).toBeInTheDocument()
    }
  })
})

/**
 * `Galeria.module.scss` LEÍDO EN CRUDO por Vite (`?raw`), no importado como
 * módulo CSS: `rediseno_visual.feature` @s35 exige propiedades CSS concretas
 * ("scroll-snap-type"/"scroll-snap-align", "overflow-x"), que un CSS Module
 * transformado por jsdom no expone (jsdom no calcula layout ni resuelve
 * hojas de estilo). Mismo patrón que `Hero-logica.test.ts:9-16` y
 * `usoDelAcento.test.ts:152-156`.
 */
const TEXTO_REAL_DEL_MODULO_SCSS = (
  import.meta.glob('/src/components/Galeria.module.scss', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>
)['/src/components/Galeria.module.scss'] as string

/**
 * Extrae el bloque completo de una regla top-level del texto SCSS crudo,
 * contando llaves balanceadas. Necesario porque ".pista" contiene reglas
 * ANIDADAS ("figure {}", "img {}", "@media {}"): cortar en la primera "}"
 * (la de la primera regla anidada) truncaría el bloque a la mitad y una
 * declaración real de ".pista" que viniera después del primer hijo anidado
 * quedaría fuera de la comprobación sin que ningún test lo notara.
 */
function extraerBloqueDeRegla(textoScss: string, selector: string): string {
  const inicioSelector = textoScss.indexOf(`${selector} {`)
  if (inicioSelector === -1) {
    throw new Error(`No se encontró el selector "${selector}" en el CSS`)
  }
  const inicioLlave = textoScss.indexOf('{', inicioSelector)
  let profundidad = 0
  let indice = inicioLlave
  do {
    if (textoScss[indice] === '{') {
      profundidad += 1
    } else if (textoScss[indice] === '}') {
      profundidad -= 1
    }
    indice += 1
  } while (profundidad > 0 && indice < textoScss.length)
  return textoScss.slice(inicioLlave, indice)
}

/**
 * Quita los comentarios SCSS ("//" hasta fin de línea y "/* ... *\/") de un
 * bloque antes de buscar una propiedad. Sin esto, un comentario que MENCIONE
 * el nombre de la propiedad (como el de `Galeria.module.scss` sobre
 * "min-width: 0", que cita literalmente `"overflow-x: auto"` para explicar
 * por qué hace falta) haría pasar la comprobación aunque la declaración REAL
 * se hubiera roto: verificado con sabotaje, ver informe.
 */
function quitarComentariosScss(textoScss: string): string {
  return textoScss.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}

describe('@s35 la galería es un carrusel con anclaje de desplazamiento y controles propios', () => {
  it('las fichas se disponen en una pista que se desplaza en horizontal', () => {
    const bloquePista = quitarComentariosScss(extraerBloqueDeRegla(TEXTO_REAL_DEL_MODULO_SCSS, '.pista'))

    // El bloque REAL de ".pista" (sin comentarios) permite el desbordamiento
    // horizontal ("overflow-x") y no fuerza columna: con
    // "flex-direction: column" el eje principal pasaría a ser vertical y las
    // fichas dejarían de desplazarse en horizontal.
    expect(bloquePista).toMatch(/overflow-x:\s*(auto|scroll)/)
    expect(bloquePista).not.toMatch(/flex-direction:\s*column/)
  })

  it('la pista declara anclaje de desplazamiento (scroll-snap-type/scroll-snap-align)', () => {
    const bloquePista = quitarComentariosScss(extraerBloqueDeRegla(TEXTO_REAL_DEL_MODULO_SCSS, '.pista'))

    expect(bloquePista).toMatch(/scroll-snap-type:/)
    expect(bloquePista).toMatch(/scroll-snap-align:/)
  })

  it('hay dos controles con nombre accesible, dado por "aria-label", para ir a la foto anterior y a la siguiente', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const botonAnterior = screen.getByRole('button', { name: 'Foto anterior' })
    const botonSiguiente = screen.getByRole('button', { name: 'Foto siguiente' })

    // Doble anclaje: el ATRIBUTO real del DOM (no solo el nombre accesible
    // calculado, que también podría derivar de texto visible).
    expect(botonAnterior.getAttribute('aria-label')).toBe('Foto anterior')
    expect(botonSiguiente.getAttribute('aria-label')).toBe('Foto siguiente')
  })

  it('cada ficha muestra su imagen, su nombre y su pie', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const figuras = screen.getAllByRole('figure')
    expect(figuras).toHaveLength(CATALOGO_DOS_ENTRADAS.length)

    for (const [indice, entrada] of CATALOGO_DOS_ENTRADAS.entries()) {
      const figura = figuras[indice]
      if (figura === undefined) {
        throw new Error(`No hay ninguna figura en la posición ${indice}`)
      }
      expect(within(figura).getAllByRole('img')).toHaveLength(1)
      expect(figura.textContent).toContain(entrada.nombre)
      expect(figura.textContent).toContain(entrada.pie)
    }
  })

  it('el aviso de contenido de demostración sigue presente', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    expect(screen.getByText(AVISO_DEMOSTRACION)).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// `features/fidelidad_galeria.feature` (33): la anatomía de la sección.
// ---------------------------------------------------------------------------

/** Rótulo del cintillo tecleado a mano — nunca importado de `Galeria.tsx`. */
const ROTULO_CINTILLO = 'Galería'

/** Si `despues` va detrás de `antes` en el orden del documento. */
function vaDespues(antes: Element, despues: Element): boolean {
  return (antes.compareDocumentPosition(despues) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
}

describe('@s1 de fidelidad_galeria: la cabecera abre con cintillo y titular "Galería"', () => {
  it('hay un <p> "Galería" que precede al <h2> "Galería", no es encabezado, y el titular no atribuye las fotos a la clínica', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const seccion = screen.getByRole('region', { name: /Galería/ })
    const titular = within(seccion).getByRole('heading', { level: 2, name: 'Galería' })
    const cintillo = within(seccion)
      .getAllByText(ROTULO_CINTILLO)
      .find((elemento) => elemento.tagName === 'P')
    if (cintillo === undefined) {
      throw new Error('No hay ningún <p> con el rótulo del cintillo')
    }

    // "FOLLOWING" visto desde el cintillo: el titular va DESPUÉS en el documento.
    expect(cintillo.compareDocumentPosition(titular) === Node.DOCUMENT_POSITION_FOLLOWING).toBe(true)
    expect(within(seccion).getAllByRole('heading')).toHaveLength(1)
    expect(titular.textContent).not.toMatch(/peludos|pacientes/i)
  })

  it('el aviso es el párrafo de la cabecera (comparte contenedor con el titular) y los dos controles, juntos, van tras él y antes de la pista', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const titular = screen.getByRole('heading', { level: 2, name: 'Galería' })
    const aviso = screen.getByText(AVISO_DEMOSTRACION)
    const botonAnterior = screen.getByRole('button', { name: 'Foto anterior' })
    const botonSiguiente = screen.getByRole('button', { name: 'Foto siguiente' })
    const pista = screen.getByRole('group', { name: /Fotografías/ })

    expect(aviso.parentElement).toBe(titular.parentElement)
    expect(botonAnterior.parentElement).toBe(botonSiguiente.parentElement)

    expect(vaDespues(aviso, botonAnterior)).toBe(true)
    expect(vaDespues(botonAnterior, botonSiguiente)).toBe(true)
    expect(vaDespues(botonSiguiente, pista)).toBe(true)

    // La cabecera es el abuelo común de titular y controles, y NO contiene la pista.
    const cabecera = titular.parentElement?.parentElement ?? null
    expect(cabecera).not.toBeNull()
    expect(cabecera).toBe(botonAnterior.parentElement?.parentElement)
    expect(cabecera?.contains(pista)).toBe(false)
  })

  it('el SCSS acota la cabecera al ancho compartido, con los controles a la derecha, y el cintillo usa el mixin sin color propio', () => {
    const bloqueCabecera = quitarComentariosScss(extraerBloqueDeRegla(TEXTO_REAL_DEL_MODULO_SCSS, '.cabecera'))
    expect(bloqueCabecera).toMatch(/max-width:\s*\$ancho-maximo-contenedor/)
    expect(bloqueCabecera).toMatch(/justify-content:\s*space-between/)
    expect(bloqueCabecera).toMatch(/align-items:\s*flex-end/)

    const bloqueEyebrow = quitarComentariosScss(extraerBloqueDeRegla(TEXTO_REAL_DEL_MODULO_SCSS, '.eyebrow'))
    expect(bloqueEyebrow).toContain('@include eyebrow;')
    expect(bloqueEyebrow).not.toMatch(/(?<![a-z-])color\s*:/)
  })

  it('el SCSS hace circulares de 48px los dos controles: lado $altura-control-media, radio $radio-circulo, superficie y borde de control', () => {
    const bloqueControles = quitarComentariosScss(extraerBloqueDeRegla(TEXTO_REAL_DEL_MODULO_SCSS, '.controles'))

    expect(bloqueControles).toMatch(/width:\s*\$altura-control-media/)
    expect(bloqueControles).toMatch(/height:\s*\$altura-control-media/)
    expect(bloqueControles).toMatch(/border-radius:\s*\$radio-circulo/)
    expect(bloqueControles).toMatch(/background-color:\s*var\(--color-superficie\)/)
    expect(bloqueControles).toMatch(/border:\s*\$ancho-borde-control solid var\(--color-borde-control\)/)
    expect(bloqueControles).toContain('@include foco-visible;')
  })

  it('cada control lleva una única flecha svg decorativa (aria-hidden) con un trazo propio, distinto del otro, y ningún texto visible', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    const trazos: string[] = []
    for (const nombre of ['Foto anterior', 'Foto siguiente']) {
      const boton = screen.getByRole('button', { name: nombre })
      // El único indicio VISIBLE del sentido es la flecha; el nombre sigue
      // siendo el `aria-label` (@s3 de `galeria.feature`), así que el botón
      // no aporta texto propio (ni glifo de reserva de la fuente).
      expect(boton.textContent?.trim(), `${nombre}: sin texto visible`).toBe('')

      const flechas = boton.querySelectorAll('svg')
      expect(flechas, `${nombre}: una única flecha`).toHaveLength(1)
      const flecha = flechas[0]
      expect(flecha?.getAttribute('aria-hidden'), `${nombre}: decorativa`).toBe('true')

      const trazosDeLaFlecha = flecha?.querySelectorAll('path[d]') ?? []
      expect(trazosDeLaFlecha, `${nombre}: un único trazo`).toHaveLength(1)
      const trazo = trazosDeLaFlecha[0]?.getAttribute('d')?.trim() ?? ''
      expect(trazo.length, `${nombre}: trazo no vacío`).toBeGreaterThan(0)
      trazos.push(trazo)
    }
    // Dos sentidos, dos dibujos: la misma flecha en los dos controles no
    // distinguiría "anterior" de "siguiente" a la vista.
    expect(new Set(trazos).size).toBe(2)
  })
})

describe('@s2 de fidelidad_galeria: cada fotografía es una tarjeta con dos líneas de contexto', () => {
  it('el pie de cada figura lleva el nombre y la descripción en dos elementos distintos dentro del figcaption', () => {
    renderizarGaleria({ catalogo: CATALOGO_DOS_ENTRADAS })

    for (const entrada of CATALOGO_DOS_ENTRADAS) {
      const figura = screen.getByRole('img', { name: entrada.nombre }).closest('figure')
      if (figura === null) {
        throw new Error(`No hay figura para "${entrada.nombre}"`)
      }
      const pieDeFigura = figura.querySelector('figcaption')
      if (pieDeFigura === null) {
        throw new Error(`La figura "${entrada.nombre}" no tiene figcaption`)
      }
      const nombre = within(pieDeFigura).getByText(entrada.nombre)
      const pie = within(pieDeFigura).getByText(entrada.pie)
      expect(nombre).not.toBe(pie)
      expect(nombre.textContent).toBe(entrada.nombre)
      expect(pie.textContent).toBe(entrada.pie)
    }
  })

  it('en el SCSS la figura, anidada en la pista, es una tarjeta con la foto en un hueco 4/3 sin radio propio y el pie en dos líneas', () => {
    const bloquePista = quitarComentariosScss(extraerBloqueDeRegla(TEXTO_REAL_DEL_MODULO_SCSS, '.pista'))
    const bloqueFigura = quitarComentariosScss(extraerBloqueDeRegla(bloquePista, 'figure'))
    const bloqueImagen = quitarComentariosScss(extraerBloqueDeRegla(bloqueFigura, 'img'))

    expect(bloqueFigura).toContain('@include tarjeta;')
    expect(bloqueFigura).toMatch(/scroll-snap-align:\s*start/)
    expect(bloqueImagen).toContain('@include hueco-de-imagen(4, 3);')
    expect(bloqueImagen).not.toMatch(/border-radius/)

    const bloqueNombre = quitarComentariosScss(extraerBloqueDeRegla(bloqueFigura, '.nombre'))
    const bloquePie = quitarComentariosScss(extraerBloqueDeRegla(bloqueFigura, '.pie'))
    expect(bloqueNombre).toMatch(/display:\s*block/)
    expect(bloqueNombre).toMatch(/font-family:\s*var\(--fuente-titulares\)/)
    expect(bloqueNombre).toMatch(/color:\s*var\(--color-tinta\)/)
    expect(bloquePie).toMatch(/display:\s*block/)
    expect(bloquePie).toMatch(/color:\s*var\(--color-texto-suave\)/)
  })
})

describe('@s3 de fidelidad_galeria: la pista separa las tarjetas el paso de la escala, oculta la barra nativa y ancla en el contenedor', () => {
  it('el bloque real de la pista declara gap espaciado(16) (= SEPARACION_ENTRE_TARJETAS_PX), scrollbar-width none y el mismo inicio para padding y scroll-padding', () => {
    const bloquePista = quitarComentariosScss(extraerBloqueDeRegla(TEXTO_REAL_DEL_MODULO_SCSS, '.pista'))
    // Solo las declaraciones PROPIAS de la pista: sin los bloques anidados.
    const declaracionesPropias = bloquePista.replaceAll(/\b[\w.&:-]+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '')

    expect(declaracionesPropias).toMatch(/gap:\s*espaciado\(16\)/)
    expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(16)
    expect(declaracionesPropias).toMatch(/scrollbar-width:\s*none/)

    const inicio = /(?<![\w-])padding-inline-start:\s*([^;]+);/.exec(declaracionesPropias)?.[1]
    const inicioDeAnclaje = /scroll-padding-inline-start:\s*([^;]+);/.exec(declaracionesPropias)?.[1]
    expect(inicio).toBeDefined()
    expect(inicioDeAnclaje).toBe(inicio)
    const expresionDeInicio = resolverVariableSass(TEXTO_REAL_DEL_MODULO_SCSS, inicio ?? '')
    expect(expresionDeInicio).toContain('var(--sangrado-lateral)')
    expect(expresionDeInicio).toContain('$ancho-maximo-contenedor')
  })
})

/** Si `valor` es una variable Sass del módulo (`$nombre`), devuelve su definición; si no, el propio valor. */
function resolverVariableSass(textoScss: string, valor: string): string {
  if (!valor.startsWith('$')) {
    return valor
  }
  const definicion = new RegExp(`\\${valor}:\\s*([^;]+);`).exec(quitarComentariosScss(textoScss))?.[1]
  if (definicion === undefined) {
    throw new Error(`La variable Sass "${valor}" no está definida en el módulo`)
  }
  return definicion
}
