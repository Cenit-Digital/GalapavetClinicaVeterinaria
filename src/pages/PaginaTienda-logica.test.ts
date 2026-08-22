import { describe, expect, it } from 'vitest'
import type { ProductoDemo } from '../data/tienda'
import {
  alcanzoTopeUnidades,
  anadirUnidad,
  calcularResumenCesta,
  construirCatalogoTienda,
  elementoTrasAtraparFoco,
  eliminarLinea,
  filtrarProductosPorCategoria,
  fijarCantidad,
  formatearContadorArticulos,
  formatearImporte,
  nombreAccesibleBotonAnadir,
  quitarUnidad,
  rotuloBotonAnadir,
  TOPE_UNIDADES_POR_LINEA,
  vaciarCesta,
} from './PaginaTienda-logica'

function producto(datos: Partial<ProductoDemo> & Pick<ProductoDemo, 'nombre' | 'categoria'>): ProductoDemo {
  return { importeCentimos: 100, imagen: '/img/x.webp', ...datos }
}

describe('@s16 un producto en una categoría que el cliente no publica hace fallar la construcción', () => {
  it('lanza un error cuyo mensaje contiene "categoría no publicada"', () => {
    const catalogoCorrupto: ProductoDemo[] = [
      { nombre: 'Producto de ejemplo', categoria: 'Antiparasitarios', importeCentimos: 100, imagen: '/img/x.webp' },
    ]

    expect(() => construirCatalogoTienda(catalogoCorrupto)).toThrowError(/categoría no publicada/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío', () => {
    const catalogoCorrupto: ProductoDemo[] = [
      { nombre: 'Producto de ejemplo', categoria: 'Antiparasitarios', importeCentimos: 100, imagen: '/img/x.webp' },
    ]

    let lanzado: unknown
    try {
      construirCatalogoTienda(catalogoCorrupto)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe('El producto "Producto de ejemplo" declara la categoría no publicada "Antiparasitarios"')
  })
})

describe('@s17 un importe inválido en el catálogo hace fallar la construcción', () => {
  it('un importe negativo lanza un error cuyo mensaje contiene "importe inválido"', () => {
    const catalogoCorrupto: ProductoDemo[] = [
      { nombre: 'Producto de ejemplo', categoria: 'Piensos', importeCentimos: -100, imagen: '/img/x.webp' },
    ]

    expect(() => construirCatalogoTienda(catalogoCorrupto)).toThrowError(/importe inválido/)
  })

  it('un importe que no es un número entero de céntimos lanza el mismo error', () => {
    const catalogoCorrupto: ProductoDemo[] = [
      { nombre: 'Producto de ejemplo', categoria: 'Piensos', importeCentimos: 12.5, imagen: '/img/x.webp' },
    ]

    expect(() => construirCatalogoTienda(catalogoCorrupto)).toThrowError(/importe inválido/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío', () => {
    const catalogoCorrupto: ProductoDemo[] = [
      { nombre: 'Producto de ejemplo', categoria: 'Piensos', importeCentimos: -100, imagen: '/img/x.webp' },
    ]

    let lanzado: unknown
    try {
      construirCatalogoTienda(catalogoCorrupto)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe('El producto "Producto de ejemplo" declara un importe inválido: "-100"')
  })
})

describe('@s17 refuerzo: un importe de exactamente 0 céntimos es válido (mayor o igual que cero)', () => {
  it('construirCatalogoTienda no lanza y conserva el producto con importeCentimos: 0', () => {
    const catalogo: ProductoDemo[] = [
      { nombre: 'Producto de ejemplo', categoria: 'Piensos', importeCentimos: 0, imagen: '/img/x.webp' },
    ]

    expect(() => construirCatalogoTienda(catalogo)).not.toThrow()
    expect(construirCatalogoTienda(catalogo)).toEqual(catalogo)
  })
})

describe('@s33 formatearImporte formatea siempre con dos decimales, coma decimal y espacio duro antes del símbolo', () => {
  it.each([
    [0, `0,00 €`],
    [5, `0,05 €`],
    [90, `0,90 €`],
    [315, `3,15 €`],
    [1250, `12,50 €`],
    [123750, `1237,50 €`],
    [1000000, `10.000,00 €`],
    [123456789, `1.234.567,89 €`],
  ])('%i céntimos se formatea como "%s"', (centimos, texto) => {
    expect(formatearImporte(centimos)).toBe(texto)
  })

  it('el carácter que separa la cifra del símbolo "€" es el espacio duro U+00A0, no el espacio ASCII', () => {
    const resultado = formatearImporte(1250)
    const indice = resultado.indexOf('€')
    expect(resultado.codePointAt(indice - 1)).toBe(0xa0)
    expect(resultado).not.toContain(' €')
  })
})

describe('@s19/@s20/@s43 anadirUnidad crea o incrementa una línea, sin pasar nunca de 99', () => {
  it('sobre un estado vacío, crea la línea con 1 unidad', () => {
    expect(anadirUnidad([], 'Cama de ejemplo talla M')).toEqual([{ identificador: 'Cama de ejemplo talla M', cantidad: 1 }])
  })

  it('sobre una línea ya existente, suma una unidad más', () => {
    const estado = [{ identificador: 'Cama de ejemplo talla M', cantidad: 1 }]
    expect(anadirUnidad(estado, 'Cama de ejemplo talla M')).toEqual([
      { identificador: 'Cama de ejemplo talla M', cantidad: 2 },
    ])
  })

  it('no toca las demás líneas del estado', () => {
    const estado = [
      { identificador: 'a', cantidad: 1 },
      { identificador: 'b', cantidad: 3 },
    ]
    expect(anadirUnidad(estado, 'a')).toEqual([
      { identificador: 'a', cantidad: 2 },
      { identificador: 'b', cantidad: 3 },
    ])
  })

  it('@s43 el tope de unidades por línea declarado es 99', () => {
    expect(TOPE_UNIDADES_POR_LINEA).toBe(99)
  })

  it('@s43 en el tope (99), añadir una unidad más no lanza y la línea se queda en 99', () => {
    const estado = [{ identificador: 'Pienso de ejemplo para perro adulto · 3 kg', cantidad: 99 }]

    expect(() => anadirUnidad(estado, 'Pienso de ejemplo para perro adulto · 3 kg')).not.toThrow()
    expect(anadirUnidad(estado, 'Pienso de ejemplo para perro adulto · 3 kg')).toEqual([
      { identificador: 'Pienso de ejemplo para perro adulto · 3 kg', cantidad: 99 },
    ])
  })
})

describe('@s25/@s26 quitarUnidad resta una unidad, y elimina la línea si llega a 0', () => {
  it('con 2 unidades, resta una y quedan 1', () => {
    const estado = [{ identificador: 'Correa de ejemplo de 2 m', cantidad: 2 }]
    expect(quitarUnidad(estado, 'Correa de ejemplo de 2 m')).toEqual([
      { identificador: 'Correa de ejemplo de 2 m', cantidad: 1 },
    ])
  })

  it('@s26 con 1 unidad, resta una y la línea entera desaparece', () => {
    const estado = [
      { identificador: 'Mordedor de ejemplo de caucho', cantidad: 1 },
      { identificador: 'Manta de ejemplo de 60 × 40 cm', cantidad: 2 },
    ]
    expect(quitarUnidad(estado, 'Mordedor de ejemplo de caucho')).toEqual([
      { identificador: 'Manta de ejemplo de 60 × 40 cm', cantidad: 2 },
    ])
  })

  it('con un identificador que no existe en el estado, lo devuelve sin cambios (ni lanza, ni muta nada)', () => {
    const estado = [{ identificador: 'Correa de ejemplo de 2 m', cantidad: 2 }]

    expect(() => quitarUnidad(estado, 'un-identificador-que-no-esta-en-estado')).not.toThrow()
    expect(quitarUnidad(estado, 'un-identificador-que-no-esta-en-estado')).toEqual(estado)
  })
})

describe('@s34 fijarCantidad a 0 elimina la línea', () => {
  it('con 6 unidades de un producto y 1 de otro, fijar a 0 el primero deja solo el segundo', () => {
    const estado = [
      { identificador: 'Pelota de ejemplo con sonido', cantidad: 6 },
      { identificador: 'Arnés de ejemplo talla M', cantidad: 1 },
    ]

    const resultado = fijarCantidad(estado, 'Pelota de ejemplo con sonido', 0)

    expect(resultado).toEqual([{ identificador: 'Arnés de ejemplo talla M', cantidad: 1 }])
  })
})

describe('@s34 refuerzo: fijarCantidad con una cantidad positiva actualiza o crea la línea', () => {
  it('sobre un identificador que ya tiene línea, actualiza su cantidad exacta y deja las demás intactas', () => {
    const estado = [
      { identificador: 'Pelota de ejemplo con sonido', cantidad: 6 },
      { identificador: 'Arnés de ejemplo talla M', cantidad: 1 },
    ]

    const resultado = fijarCantidad(estado, 'Pelota de ejemplo con sonido', 4)

    expect(resultado).toEqual([
      { identificador: 'Pelota de ejemplo con sonido', cantidad: 4 },
      { identificador: 'Arnés de ejemplo talla M', cantidad: 1 },
    ])
  })

  it('sobre un identificador sin línea todavía, crea una línea nueva con esa cantidad exacta', () => {
    const estado = [{ identificador: 'Arnés de ejemplo talla M', cantidad: 1 }]

    const resultado = fijarCantidad(estado, 'Cama de ejemplo talla M', 5)

    expect(resultado).toEqual([
      { identificador: 'Arnés de ejemplo talla M', cantidad: 1 },
      { identificador: 'Cama de ejemplo talla M', cantidad: 5 },
    ])
  })
})

describe('@s35 una cantidad negativa se rechaza y deja la cesta intacta', () => {
  it('lanza un error cuyo mensaje contiene "cantidad inválida" y no muta el estado original', () => {
    const estado = [{ identificador: 'Cama de ejemplo talla M', cantidad: 2 }]

    expect(() => fijarCantidad(estado, 'Cama de ejemplo talla M', -3)).toThrowError(/cantidad inválida/)
    expect(estado).toEqual([{ identificador: 'Cama de ejemplo talla M', cantidad: 2 }])
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío', () => {
    const estado = [{ identificador: 'Cama de ejemplo talla M', cantidad: 2 }]

    let lanzado: unknown
    try {
      fijarCantidad(estado, 'Cama de ejemplo talla M', -3)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe('cantidad inválida: "-3"')
  })
})

describe('@s36 una cantidad que no es un entero se rechaza y deja la cesta intacta', () => {
  const estado = [{ identificador: 'Cama de ejemplo talla M', cantidad: 2 }]

  it.each([
    ['1,5', 1.5],
    ['un texto', 'dos' as unknown as number],
    ['un valor no numérico', Number.NaN],
  ])('%s lanza un error cuyo mensaje contiene "cantidad inválida"', (_descripcion, valor) => {
    expect(() => fijarCantidad(estado, 'Cama de ejemplo talla M', valor)).toThrowError(/cantidad inválida/)
  })

  it.each([
    ['1,5', 1.5, 'cantidad inválida: "1.5"'],
    ['un texto', 'dos' as unknown as number, 'cantidad inválida: "dos"'],
    ['un valor no numérico', Number.NaN, 'cantidad inválida: "NaN"'],
  ])('%s: lo lanzado es una instancia real de Error con el mensaje exacto', (_descripcion, valor, mensaje) => {
    let lanzado: unknown
    try {
      fijarCantidad(estado, 'Cama de ejemplo talla M', valor)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe(mensaje)
  })

  it('el estado original no se muta tras los intentos inválidos', () => {
    expect(estado).toEqual([{ identificador: 'Cama de ejemplo talla M', cantidad: 2 }])
  })
})

describe('@s32/@s37/@s38 calcularResumenCesta calcula líneas, total y número de artículos en céntimos enteros', () => {
  const catalogo: readonly ProductoDemo[] = [
    producto({ nombre: 'Cama de ejemplo talla M', categoria: 'Descanso', importeCentimos: 2499 }),
    producto({ nombre: 'Pienso de ejemplo para gato esterilizado · 1,5 kg', categoria: 'Piensos', importeCentimos: 995 }),
    producto({ nombre: 'Correa de ejemplo de 2 m', categoria: 'Paseo', importeCentimos: 705 }),
  ]

  it('@s32 el total es exactamente la suma de los subtotales, sin perder ni un céntimo', () => {
    const estado = [
      { identificador: 'Cama de ejemplo talla M', cantidad: 3 },
      { identificador: 'Pienso de ejemplo para gato esterilizado · 1,5 kg', cantidad: 7 },
      { identificador: 'Correa de ejemplo de 2 m', cantidad: 9 },
    ]

    const resumen = calcularResumenCesta(estado, catalogo)

    expect(resumen.lineas.map((linea) => linea.subtotalCentimos)).toEqual([7497, 6965, 6345])
    expect(resumen.totalCentimos).toBe(20807)
    expect(resumen.totalCentimos).toBe(resumen.lineas.reduce((suma, linea) => suma + linea.subtotalCentimos, 0))
  })

  it('@s37 una línea con un identificador que no existe en el catálogo se descarta sin reventar', () => {
    const estado = [
      { identificador: 'Cama de ejemplo talla M', cantidad: 2 },
      { identificador: 'no-existe-en-el-catalogo', cantidad: 4 },
    ]

    const resumen = calcularResumenCesta(estado, catalogo)

    expect(resumen.lineas).toHaveLength(1)
    expect(resumen.lineas[0]?.identificador).toBe('Cama de ejemplo talla M')
    expect(resumen.totalCentimos).toBe(4998)
    expect(resumen.numeroDeArticulos).toBe(2)
  })

  it('@s38 un estado sin ninguna línea da un resumen en cero, no vacío ni indefinido', () => {
    const resumen = calcularResumenCesta([], catalogo)

    expect(resumen.lineas).toHaveLength(0)
    expect(resumen.numeroDeArticulos).toBe(0)
    expect(resumen.totalCentimos).toBe(0)
    expect(Number.isNaN(resumen.totalCentimos)).toBe(false)
  })
})

describe('@s22 el botón de la tarjeta refleja cuántas unidades hay ya en la cesta', () => {
  it('sin unidades en la cesta, el rótulo es "Añadir" y el nombre accesible incluye el producto', () => {
    expect(rotuloBotonAnadir(0)).toBe('Añadir')
    expect(nombreAccesibleBotonAnadir('Correa de ejemplo de 2 m', 0)).toBe('Añadir Correa de ejemplo de 2 m a la cesta')
  })

  it('con unidades ya en la cesta, el rótulo cuenta y el nombre accesible dice "otra unidad"', () => {
    expect(rotuloBotonAnadir(1)).toBe('En la cesta · 1')
    expect(nombreAccesibleBotonAnadir('Arnés de ejemplo talla M', 1)).toBe(
      'Añadir otra unidad de Arnés de ejemplo talla M, 1 en la cesta',
    )
  })
})

describe('@s27 alcanzoTopeUnidades marca cuándo una línea llegó al tope declarado', () => {
  it('por debajo del tope, no lo ha alcanzado', () => {
    expect(alcanzoTopeUnidades(98)).toBe(false)
  })

  it('en el tope exacto, sí lo ha alcanzado', () => {
    expect(alcanzoTopeUnidades(TOPE_UNIDADES_POR_LINEA)).toBe(true)
  })
})

describe('@s44 formatearContadorArticulos singulariza solo en 1', () => {
  it.each([
    [0, '0 artículos'],
    [1, '1 artículo'],
    [2, '2 artículos'],
    [15, '15 artículos'],
  ])('%i artículo(s) se formatea como "%s"', (numero, texto) => {
    expect(formatearContadorArticulos(numero)).toBe(texto)
  })
})

describe('@s29/@s30 eliminarLinea saca la línea entera, sin tocar las demás', () => {
  it('con dos líneas, elimina solo la indicada', () => {
    const estado = [
      { identificador: 'Pelota de ejemplo con sonido', cantidad: 4 },
      { identificador: 'Cama de ejemplo talla M', cantidad: 1 },
    ]
    expect(eliminarLinea(estado, 'Pelota de ejemplo con sonido')).toEqual([
      { identificador: 'Cama de ejemplo talla M', cantidad: 1 },
    ])
  })

  it('@s30 al eliminar la única línea, el estado resultante está vacío', () => {
    const estado = [{ identificador: 'Manta de ejemplo de 60 × 40 cm', cantidad: 5 }]
    expect(eliminarLinea(estado, 'Manta de ejemplo de 60 × 40 cm')).toEqual([])
  })
})

describe('@s31 vaciarCesta deja el estado sin ninguna línea', () => {
  it('el resultado es siempre un array vacío', () => {
    expect(vaciarCesta()).toEqual([])
  })
})

describe('@s15 un producto con el nombre vacío se descarta, el resto se conserva', () => {
  it('de 3 productos con uno con nombre vacío, construirCatalogoTienda devuelve solo los otros 2', () => {
    const catalogo: ProductoDemo[] = [
      producto({ nombre: 'a', categoria: 'Piensos' }),
      producto({ nombre: '', categoria: 'Paseo' }),
      producto({ nombre: 'c', categoria: 'Descanso' }),
    ]

    expect(construirCatalogoTienda(catalogo).map((p) => p.nombre)).toEqual(['a', 'c'])
  })

  it('un nombre solo de espacios también se descarta', () => {
    const catalogo: ProductoDemo[] = [producto({ nombre: '   ', categoria: 'Piensos' })]

    expect(construirCatalogoTienda(catalogo)).toEqual([])
  })
})

describe('@s9/@s10 filtrarProductosPorCategoria', () => {
  const catalogo: readonly ProductoDemo[] = [
    producto({ nombre: 'a', categoria: 'Piensos' }),
    producto({ nombre: 'b', categoria: 'Descanso' }),
    producto({ nombre: 'c', categoria: 'Descanso' }),
  ]

  it('sin categoría (null) devuelve el catálogo completo', () => {
    expect(filtrarProductosPorCategoria(catalogo, null)).toHaveLength(3)
  })

  it('con una categoría, devuelve exactamente los productos de esa categoría, en el orden del catálogo', () => {
    expect(filtrarProductosPorCategoria(catalogo, 'Descanso').map((p) => p.nombre)).toEqual(['b', 'c'])
  })

  it('@s10 con una categoría sin ningún producto, devuelve un array vacío', () => {
    expect(filtrarProductosPorCategoria(catalogo, 'Juegos')).toEqual([])
  })
})

describe('@s39 refuerzo: elementoTrasAtraparFoco (atrapa-foco del diálogo, patrón Modal Dialog WAI-ARIA APG)', () => {
  const primero = document.createElement('button')
  const segundo = document.createElement('button')
  const ultimo = document.createElement('a')
  const elementosFocusables = [primero, segundo, ultimo]
  const elementoAjenoAlDialogo = document.createElement('dialog')

  it('sin ningún elemento focusable, no hay nada a lo que saltar', () => {
    expect(elementoTrasAtraparFoco([], primero, false)).toBeNull()
  })

  it('Tab hacia delante desde el último elemento salta al primero', () => {
    expect(elementoTrasAtraparFoco(elementosFocusables, ultimo, false)).toBe(primero)
  })

  it('Tab hacia delante desde un elemento que no es el último no interviene', () => {
    expect(elementoTrasAtraparFoco(elementosFocusables, segundo, false)).toBeNull()
  })

  it('Shift+Tab hacia atrás desde el primer elemento salta al último', () => {
    expect(elementoTrasAtraparFoco(elementosFocusables, primero, true)).toBe(ultimo)
  })

  it('Shift+Tab hacia atrás desde un elemento que no es el primero no interviene', () => {
    expect(elementoTrasAtraparFoco(elementosFocusables, segundo, true)).toBeNull()
  })

  it('Shift+Tab desde el propio contenedor del diálogo (foco inicial, aún sin tabular) salta al último', () => {
    expect(elementoTrasAtraparFoco(elementosFocusables, elementoAjenoAlDialogo, true)).toBe(ultimo)
  })
})
