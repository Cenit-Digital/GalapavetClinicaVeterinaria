import { describe, expect, it } from 'vitest'
import type { ArticuloDemo, BloqueDeCuerpo } from '../data/blog'
import {
  articulosRelacionados,
  calcularTiempoDeLectura,
  CATEGORIAS_PUBLICADAS,
  construirCatalogoBlog,
  filtrarPorCategoria,
  formatearTiempoDeLectura,
  MAXIMO_ARTICULOS_RELACIONADOS,
  normalizarCategoriaSeleccionada,
  PATRONES_PROHIBIDOS_DE_CONTENIDO,
  resolverArticulo,
  VELOCIDAD_LECTURA_PPM,
} from './PaginaBlog-logica'

function articulo(datos: Partial<ArticuloDemo> & Pick<ArticuloDemo, 'identificador' | 'categoria'>): ArticuloDemo {
  return {
    titulo: `Título de ${datos.identificador}`,
    imagen: '/img/blog/prueba.webp',
    textoAlternativoImagen: 'Fotografía de prueba.',
    cuerpo: [{ tipo: 'parrafo', texto: 'Texto de prueba.' }],
    ...datos,
  }
}

describe('@s7 el filtro deriva sus categorías, literalmente, de los cinco bloques de servicio publicados', () => {
  it('CATEGORIAS_PUBLICADAS es exactamente estos 5 títulos, en este orden', () => {
    // Literal escrito a mano (patrón doble-de-test-anclado-al-literal-no-al-simbolo):
    // nunca se compara contra SERVICIOS reimportado.
    expect(CATEGORIAS_PUBLICADAS).toEqual([
      'Cirugía y anestesia',
      'Diagnóstico de imagen',
      'Medicina general',
      'Análisis',
      'Especialidades',
    ])
  })
})

describe('@s9/@s10/@s12 normalizarCategoriaSeleccionada resuelve el parámetro "categoria" de la URL', () => {
  it('un valor que coincide exactamente con una categoría publicada se conserva', () => {
    expect(normalizarCategoriaSeleccionada('Análisis', ['Análisis', 'Especialidades'])).toBe('Análisis')
  })

  it('un parámetro nulo (ausente) cae a "Todos" (null)', () => {
    expect(normalizarCategoriaSeleccionada(null, ['Análisis'])).toBeNull()
  })

  it('una cadena vacía o solo espacios cae a "Todos" (null)', () => {
    expect(normalizarCategoriaSeleccionada('   ', ['Análisis'])).toBeNull()
  })

  it('@s12 un valor corrupto que no coincide con ninguna categoría publicada cae a "Todos" (null), sin lanzar', () => {
    expect(() => normalizarCategoriaSeleccionada('<script>alert(1)</script>', ['Análisis'])).not.toThrow()
    expect(normalizarCategoriaSeleccionada('<script>alert(1)</script>', ['Análisis'])).toBeNull()
  })
})

describe('@s8/@s11 filtrarPorCategoria', () => {
  const catalogo: readonly ArticuloDemo[] = [
    articulo({ identificador: 'a', categoria: 'Análisis' }),
    articulo({ identificador: 'b', categoria: 'Especialidades' }),
    articulo({ identificador: 'c', categoria: 'Análisis' }),
  ]

  it('sin categoría (null) devuelve el catálogo completo', () => {
    expect(filtrarPorCategoria(catalogo, null)).toHaveLength(3)
  })

  it('con una categoría, devuelve exactamente los artículos de esa categoría', () => {
    const resultado = filtrarPorCategoria(catalogo, 'Análisis')
    expect(resultado.map((a) => a.identificador)).toEqual(['a', 'c'])
  })

  it('@s11 con una categoría sin ningún artículo, devuelve un array vacío', () => {
    expect(filtrarPorCategoria(catalogo, 'Diagnóstico de imagen')).toEqual([])
  })
})

function cuerpoConPalabras(cantidad: number): readonly BloqueDeCuerpo[] {
  return [{ tipo: 'parrafo', texto: Array.from({ length: cantidad }, () => 'palabra').join(' ') }]
}

describe('@s18 el tiempo de lectura se calcula del cuerpo a la velocidad declarada', () => {
  it('la velocidad de lectura que exporta el módulo de cálculo es exactamente 200 palabras por minuto', () => {
    expect(VELOCIDAD_LECTURA_PPM).toBe(200)
  })

  it.each([
    [1, 1],
    [200, 1],
    [201, 2],
    [400, 2],
    [401, 3],
  ])('con %i palabras, el tiempo calculado son %i minuto(s)', (palabras, minutosEsperados) => {
    const minutos = calcularTiempoDeLectura(cuerpoConPalabras(palabras))
    expect(minutos).toBe(minutosEsperados)
    expect(formatearTiempoDeLectura(minutos as number)).toBe(`${minutosEsperados} min`)
  })

  it('ningún tiempo de lectura procede de un valor escrito en el catálogo: se recalcula del cuerpo, no de un campo aparte', () => {
    // ArticuloDemo no declara ningún campo "tiempoLectura"; verificado por tipos
    // en tiempo de compilación (si existiera, este test tendría que leerlo de
    // ahí en vez de invocar calcularTiempoDeLectura).
    expect(calcularTiempoDeLectura(cuerpoConPalabras(200))).toBe(1)
  })
})

describe('@s19 caso límite — un cuerpo sin ninguna palabra no produce tiempo de lectura', () => {
  it('un cuerpo vacío devuelve null', () => {
    expect(calcularTiempoDeLectura([])).toBeNull()
  })

  it('un cuerpo con bloques en blanco (solo espacios) también devuelve null', () => {
    expect(calcularTiempoDeLectura([{ tipo: 'parrafo', texto: '   ' }])).toBeNull()
  })
})

describe('@s21 resolverArticulo localiza un artículo por su identificador exacto', () => {
  const catalogo: readonly ArticuloDemo[] = [
    articulo({ identificador: 'demo-1', categoria: 'Medicina general' }),
    articulo({ identificador: 'demo-2', categoria: 'Medicina general' }),
  ]

  it('con un identificador existente, devuelve ese artículo', () => {
    expect(resolverArticulo(catalogo, 'demo-2')?.identificador).toBe('demo-2')
  })

  it('con un identificador que no existe en el catálogo, devuelve undefined', () => {
    expect(resolverArticulo(catalogo, 'no-existe')).toBeUndefined()
  })

  it('sin identificador (undefined), devuelve undefined', () => {
    expect(resolverArticulo(catalogo, undefined)).toBeUndefined()
  })
})

describe('@s22/@s23 articulosRelacionados ofrece artículos de la misma categoría, nunca el actual', () => {
  it('devuelve los otros artículos de la misma categoría, en el orden del catálogo', () => {
    const catalogo: readonly ArticuloDemo[] = [
      articulo({ identificador: 'demo-1', categoria: 'Medicina general' }),
      articulo({ identificador: 'demo-2', categoria: 'Medicina general' }),
      articulo({ identificador: 'demo-3', categoria: 'Medicina general' }),
      articulo({ identificador: 'demo-4', categoria: 'Análisis' }),
    ]
    const actual = catalogo[0] as ArticuloDemo

    const resultado = articulosRelacionados(catalogo, actual)

    expect(resultado.map((a) => a.identificador)).toEqual(['demo-2', 'demo-3'])
  })

  it('@s23 sin otros artículos de su categoría, devuelve un array vacío', () => {
    const catalogo: readonly ArticuloDemo[] = [
      articulo({ identificador: 'demo-6', categoria: 'Especialidades' }),
      articulo({ identificador: 'demo-1', categoria: 'Medicina general' }),
    ]
    const actual = catalogo[0] as ArticuloDemo

    expect(articulosRelacionados(catalogo, actual)).toEqual([])
  })
})

describe('@s30 caso límite — con más de tres candidatos, articulosRelacionados nunca devuelve más de 3', () => {
  it('con 5 artículos de la misma categoría (uno el actual), devuelve como mucho 3, en orden, y nunca el 4º excedente', () => {
    expect(MAXIMO_ARTICULOS_RELACIONADOS).toBe(3)

    const catalogo: readonly ArticuloDemo[] = [
      articulo({ identificador: 'otro-1', categoria: 'Medicina general' }),
      articulo({ identificador: 'otro-2', categoria: 'Medicina general' }),
      articulo({ identificador: 'actual', categoria: 'Medicina general' }),
      articulo({ identificador: 'otro-3', categoria: 'Medicina general' }),
      articulo({ identificador: 'otro-4', categoria: 'Medicina general' }),
    ]
    const actual = catalogo.find((a) => a.identificador === 'actual') as ArticuloDemo

    const resultado = articulosRelacionados(catalogo, actual)

    expect(resultado).toHaveLength(3)
    expect(resultado.map((a) => a.identificador)).toEqual(['otro-1', 'otro-2', 'otro-3'])
    expect(resultado.map((a) => a.identificador)).not.toContain('otro-4')
  })
})

const CUERPO_LIMPIO: readonly BloqueDeCuerpo[] = [{ tipo: 'parrafo', texto: 'Un párrafo de prueba sin nada prohibido.' }]

function articuloValido(identificador: string): ArticuloDemo {
  return articulo({ identificador, categoria: 'Medicina general', cuerpo: CUERPO_LIMPIO })
}

describe('@s25 el validador rechaza cualquier artículo que declare autor, firma o iniciales', () => {
  it('un artículo que declara "autor" hace fallar la validación con un error que nombra el artículo y el campo', () => {
    const conAutor = { ...articuloValido('demo-x'), autor: 'Marcos Pérez' } as unknown as ArticuloDemo

    expect(() => construirCatalogoBlog([conAutor])).toThrowError(/demo-x/)
    expect(() => construirCatalogoBlog([conAutor])).toThrowError(/autor/)
  })

  it('el error lanzado es una instancia real de Error con el mensaje exacto', () => {
    const conAutor = { ...articuloValido('demo-x'), autor: 'Marcos Pérez' } as unknown as ArticuloDemo

    let lanzado: unknown
    try {
      construirCatalogoBlog([conAutor])
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe('El artículo "demo-x" declara el campo prohibido "autor"')
  })

  it('falla igual si el campo declarado es "firma", sea cual sea el nombre declarado', () => {
    const conFirma = { ...articuloValido('demo-y'), firma: 'M.P.' } as unknown as ArticuloDemo

    expect(() => construirCatalogoBlog([conFirma])).toThrowError(/demo-y/)
    expect(() => construirCatalogoBlog([conFirma])).toThrowError(/firma/)
  })

  it('falla igual si el campo declarado es "iniciales", sea cual sea el nombre declarado', () => {
    const conIniciales = { ...articuloValido('demo-z'), iniciales: 'M.P.' } as unknown as ArticuloDemo

    expect(() => construirCatalogoBlog([conIniciales])).toThrowError(/demo-z/)
    expect(() => construirCatalogoBlog([conIniciales])).toThrowError(/iniciales/)
  })

  it('no se renderiza ningún artículo del catálogo: la función nunca devuelve un valor cuando lanza', () => {
    const conAutor = { ...articuloValido('demo-x'), autor: 'Marcos Pérez' } as unknown as ArticuloDemo

    let resultado: readonly ArticuloDemo[] | undefined
    try {
      resultado = construirCatalogoBlog([conAutor])
    } catch {
      // se ignora a propósito: solo interesa que "resultado" nunca se asigne.
    }

    expect(resultado).toBeUndefined()
  })
})

describe('@s26 el validador rechaza precios, teléfonos, porcentajes de eficacia y promesas de resultado', () => {
  it('la lista de patrones prohibidos que declara el validador tiene exactamente 5 y ningún otro', () => {
    expect(PATRONES_PROHIBIDOS_DE_CONTENIDO).toHaveLength(5)
  })

  const casos: ReadonlyArray<[string, string, string]> = [
    ['precio', '49 €', '€'],
    ['teléfono', 'llama al 640 22 11 90', '640 22 11 90'],
    ['porcentaje de eficacia', 'reduce el riesgo por encima del 90 %', '%'],
    ['promesa de resultado', 'garantiza la curación', 'garantiza'],
    ['urgencias 24 h', 'Urgencias 24 h', '24 h'],
  ]

  it.each(casos)('rechaza el texto prohibido de %s y el mensaje contiene "%s" (buscado: "%s")', (_categoria, frase) => {
    const conTextoProhibido = articulo({
      identificador: 'demo-prohibido',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: `Frase de prueba: ${frase}.` }],
    })

    expect(() => construirCatalogoBlog([conTextoProhibido])).toThrowError(/texto prohibido/)

    let lanzado: unknown
    try {
      construirCatalogoBlog([conTextoProhibido])
    } catch (error) {
      lanzado = error
    }
    expect((lanzado as Error).message).toContain('demo-prohibido')
  })

  it('un artículo cuyo cuerpo no contiene ninguno de esos textos pasa la validación', () => {
    const limpio = articuloValido('demo-limpio')
    expect(construirCatalogoBlog([limpio])).toEqual([limpio])
  })

  it('ninguno de los artículos con texto prohibido llega a "renderizarse": la función nunca devuelve valor cuando lanza', () => {
    const conTextoProhibido = articulo({
      identificador: 'demo-prohibido',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'Esto garantiza algo.' }],
    })

    let resultado: readonly ArticuloDemo[] | undefined
    try {
      resultado = construirCatalogoBlog([conTextoProhibido])
    } catch {
      // se ignora a propósito
    }

    expect(resultado).toBeUndefined()
  })
})

// Ronda 3 de refuerzo de mutación (progress/mutation_pagina_blog.md, score 83.90%,
// 17 supervivientes reales sobre src/pages/PaginaBlog-logica.ts). Cada test de
// aquí en adelante está dirigido a un mutante concreto documentado en ese
// informe; ninguno amplía el contrato de @s26/@s9/@s10/@s12/@s18 más allá de lo
// que sus propios patrones ya prometían detectar — solo ejercita formatos que
// el `.feature` ya da por prohibidos en otro sitio (@s27: "640221190",
// "918442160", "24h", el símbolo "€", el símbolo "%", todos sin separador).
describe('@s26 refuerzo de mutación — variantes de formato sin espacio y fragmento exacto del mensaje (ronda 3)', () => {
  it('un precio sin espacio antes de "€" también se rechaza (id 25/26 del informe de mutación)', () => {
    const conPrecioSinEspacio = articulo({
      identificador: 'demo-precio-sin-espacio',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'El tratamiento cuesta 49€ en total.' }],
    })

    expect(() => construirCatalogoBlog([conPrecioSinEspacio])).toThrowError(/texto prohibido/)
  })

  it('el mensaje de error del precio contiene el importe completo capturado, no un dígito recortado (id 24 del informe)', () => {
    const conPrecio = articulo({
      identificador: 'demo-precio',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'Frase de prueba: 49 €.' }],
    })

    let lanzado: unknown
    try {
      construirCatalogoBlog([conPrecio])
    } catch (error) {
      lanzado = error
    }

    expect((lanzado as Error).message).toContain('"49 €"')
  })

  it('un porcentaje sin espacio antes de "%" también se rechaza (id 46/47 del informe)', () => {
    const conPorcentajeSinEspacio = articulo({
      identificador: 'demo-porcentaje-sin-espacio',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'Reduce el riesgo en un 90% de los casos.' }],
    })

    expect(() => construirCatalogoBlog([conPorcentajeSinEspacio])).toThrowError(/texto prohibido/)
  })

  it('el mensaje de error del porcentaje contiene la cifra completa capturada, no un dígito recortado (id 45 del informe)', () => {
    const conPorcentaje = articulo({
      identificador: 'demo-porcentaje',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'Frase de prueba: reduce el riesgo por encima del 90 %.' }],
    })

    let lanzado: unknown
    try {
      construirCatalogoBlog([conPorcentaje])
    } catch (error) {
      lanzado = error
    }

    expect((lanzado as Error).message).toContain('"90 %"')
  })

  it('el reclamo "24h" sin espacio también se rechaza (id 49 del informe)', () => {
    const con24hSinEspacio = articulo({
      identificador: 'demo-24h-sin-espacio',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'Atendemos Urgencias 24h todos los casos graves.' }],
    })

    expect(() => construirCatalogoBlog([con24hSinEspacio])).toThrowError(/texto prohibido/)
  })

  it('un teléfono escrito sin el primer separador también se rechaza (id 28/30/33/43 del informe)', () => {
    const conTelefonoSinSeparador1 = articulo({
      identificador: 'demo-telefono-sin-sep1',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'Llama al 64022 11 90 para más información.' }],
    })

    expect(() => construirCatalogoBlog([conTelefonoSinSeparador1])).toThrowError(/texto prohibido/)
  })

  it('un teléfono escrito sin el segundo separador también se rechaza (id 35 del informe)', () => {
    const conTelefonoSinSeparador2 = articulo({
      identificador: 'demo-telefono-sin-sep2',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'Llama al 640 2211 90 para más información.' }],
    })

    expect(() => construirCatalogoBlog([conTelefonoSinSeparador2])).toThrowError(/texto prohibido/)
  })

  it('un teléfono escrito sin el tercer separador también se rechaza (id 40 del informe)', () => {
    const conTelefonoSinSeparador3 = articulo({
      identificador: 'demo-telefono-sin-sep3',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'Llama al 640 22 1190 para más información.' }],
    })

    expect(() => construirCatalogoBlog([conTelefonoSinSeparador3])).toThrowError(/texto prohibido/)
  })

  it('una referencia corta de 7 dígitos sin separadores, que no es un teléfono, pasa la validación (id 28/33/43 del informe)', () => {
    const conReferenciaCorta = articulo({
      identificador: 'demo-referencia-corta',
      categoria: 'Medicina general',
      cuerpo: [{ tipo: 'parrafo', texto: 'El expediente número 1234567 queda archivado.' }],
    })

    expect(construirCatalogoBlog([conReferenciaCorta])).toEqual([conReferenciaCorta])
  })
})

describe('@s9/@s10/@s12 refuerzo de mutación — normalizarCategoriaSeleccionada ancla el recorte y el repliegue exactos (ronda 3)', () => {
  it('una categoría válida rodeada de espacios se recorta y coincide con la categoría publicada (id 2 del informe)', () => {
    expect(normalizarCategoriaSeleccionada(' Análisis ', ['Análisis'])).toBe('Análisis')
  })

  it('con categoriaParam nulo y una categoriasValidas que admite la cadena vacía, el repliegue real ("") se conserva (id 4 del informe)', () => {
    expect(normalizarCategoriaSeleccionada(null, [''])).toBe('')
  })
})

describe('@s18 refuerzo de mutación — separador entre bloques y espaciado irregular del tiempo de lectura (ronda 3)', () => {
  it('el separador entre bloques del cuerpo cuenta como espacio real: 100+101 palabras en 2 bloques dan 201 palabras, no 200 (id 53 del informe)', () => {
    const bloque1: BloqueDeCuerpo = { tipo: 'parrafo', texto: Array.from({ length: 100 }, () => 'palabra').join(' ') }
    const bloque2: BloqueDeCuerpo = { tipo: 'parrafo', texto: Array.from({ length: 101 }, () => 'palabra').join(' ') }

    expect(calcularTiempoDeLectura([bloque1, bloque2])).toBe(2)
  })

  it('el espaciado irregular (doble espacio) entre palabras no infla el recuento: 200 palabras separadas por doble espacio siguen siendo 200, no 399 (id 74 del informe)', () => {
    const cuerpoConEspaciadoIrregular: readonly BloqueDeCuerpo[] = [
      { tipo: 'parrafo', texto: Array.from({ length: 200 }, () => 'palabra').join('  ') },
    ]

    expect(calcularTiempoDeLectura(cuerpoConEspaciadoIrregular)).toBe(1)
  })
})
