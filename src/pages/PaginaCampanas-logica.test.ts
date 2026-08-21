import { describe, expect, it } from 'vitest'
import type { CampanaDemo } from '../data/campanas'
import {
  construirCatalogoCampanas,
  decidirComportamientoDesplazamiento,
  resolverVista,
  type CampanaValidada,
} from './PaginaCampanas-logica'

describe('@s33 una campaña con precio hace fallar cerrada la construcción del catálogo', () => {
  it('lanza un error cuyo mensaje contiene "precio no confirmado" y nombra la campaña', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', precio: '49 €' }]

    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/precio no confirmado/)
    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/Vacunaciones/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', precio: '49 €' }]

    let lanzado: unknown
    try {
      construirCatalogoCampanas(catalogo)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe('La campaña "Vacunaciones" declara un precio no confirmado: "49 €"')
  })
})

describe('@s34 una campaña con vigencia hace fallar cerrada la construcción del catálogo', () => {
  it('lanza un error cuyo mensaje contiene "vigencia no confirmada" y nombra la campaña', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', vigencia: 'Hasta el 30 de septiembre' }]

    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/vigencia no confirmada/)
    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/Vacunaciones/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', vigencia: 'Hasta el 30 de septiembre' }]

    let lanzado: unknown
    try {
      construirCatalogoCampanas(catalogo)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe(
      'La campaña "Vacunaciones" declara una vigencia no confirmada: "Hasta el 30 de septiembre"',
    )
  })
})

describe('@s35 una campaña con plazas hace fallar cerrada la construcción del catálogo', () => {
  it('lanza un error cuyo mensaje contiene "plazas no confirmadas" y nombra la campaña', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', plazas: '40 plazas al mes' }]

    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/plazas no confirmadas/)
    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/Vacunaciones/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', plazas: '40 plazas al mes' }]

    let lanzado: unknown
    try {
      construirCatalogoCampanas(catalogo)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe('La campaña "Vacunaciones" declara unas plazas no confirmadas: "40 plazas al mes"')
  })
})

describe('@s36 un punto que el cliente no publica hace fallar cerrada la construcción del catálogo', () => {
  it('lanza un error cuyo mensaje contiene "punto no publicado" y cita el punto rechazado', () => {
    const catalogo: readonly CampanaDemo[] = [
      { titulo: 'Vacunaciones', bloque: 'Medicina general', puntos: ['Vacuna polivalente con revisión incluida'] },
    ]

    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/punto no publicado/)
    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/Vacuna polivalente con revisión incluida/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío', () => {
    const catalogo: readonly CampanaDemo[] = [
      { titulo: 'Vacunaciones', bloque: 'Medicina general', puntos: ['Vacuna polivalente con revisión incluida'] },
    ]

    let lanzado: unknown
    try {
      construirCatalogoCampanas(catalogo)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe(
      'La campaña "Vacunaciones" declara el punto no publicado "Vacuna polivalente con revisión incluida", que no aparece en el catálogo de servicios publicado por el cliente',
    )
  })
})

describe('@s40 una campaña con duración hace fallar cerrada la construcción del catálogo', () => {
  it('lanza un error cuyo mensaje contiene "duración no confirmada" y nombra la campaña', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', duracion: '30 min · una sola visita' }]

    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/duración no confirmada/)
    expect(() => construirCatalogoCampanas(catalogo)).toThrowError(/Vacunaciones/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', duracion: '30 min · una sola visita' }]

    let lanzado: unknown
    try {
      construirCatalogoCampanas(catalogo)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe(
      'La campaña "Vacunaciones" declara una duración no confirmada: "30 min · una sola visita"',
    )
  })
})

describe(
  'refuerzo de mutación — construirCatalogoCampanas resuelve id, bloque e imagen ausentes a sus valores concretos (soporte de @s3/@s4/@s6/@s20)',
  () => {
    it('id y bloque caen a cadena vacía y ninguna clave "imagen" se añade cuando no se declara', () => {
      const catalogo: readonly CampanaDemo[] = [{ titulo: 'Campaña sin datos opcionales' }]

      const resultado = construirCatalogoCampanas(catalogo)

      expect(resultado).toHaveLength(1)
      expect(resultado.map((campana) => campana.id)).toEqual([''])
      expect(resultado.map((campana) => campana.bloque)).toEqual([''])
      expect(resultado.map((campana) => campana.puntos)).toEqual([[]])
      expect(resultado.every((campana) => !Object.hasOwn(campana, 'imagen'))).toBe(true)
    })
  },
)

describe(
  'refuerzo de mutación — construirCatalogoCampanas descarta también un título compuesto solo por espacios (soporte de @s31/@s32)',
  () => {
    it('un título de solo espacios se descarta igual que un título vacío, el resto del catálogo se conserva', () => {
      const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones' }, { titulo: '   ' }, { titulo: 'Odontología' }]

      const resultado = construirCatalogoCampanas(catalogo)

      expect(resultado).toHaveLength(2)
      expect(resultado.map((campana) => campana.titulo)).toEqual(['Vacunaciones', 'Odontología'])
    })
  },
)

describe(
  'refuerzo de mutación — resolverVista recorta los espacios alrededor del id del parámetro "campana" (soporte de @s7/@s8/@s10)',
  () => {
    it('un id con espacios alrededor localiza la misma ficha que el id exacto, sin espacios', () => {
      const vacunaciones: CampanaValidada = {
        id: 'vacunaciones',
        titulo: 'Vacunaciones',
        bloque: 'Medicina general',
        puntos: [],
      }
      const catalogo: readonly CampanaValidada[] = [vacunaciones]

      const vista = resolverVista(catalogo, '  vacunaciones  ')

      expect(vista).toEqual({ tipo: 'ficha', campana: vacunaciones })
    })
  },
)

describe(
  'refuerzo de mutación — resolverVista trata un parámetro "campana" completamente ausente como listado (soporte de @s29)',
  () => {
    it('con idParam nulo (parámetro ausente de la URL), resuelve la vista de listado', () => {
      const catalogo: readonly CampanaValidada[] = []

      const vista = resolverVista(catalogo, null)

      expect(vista).toEqual({ tipo: 'listado' })
    })
  },
)

/** Doble mínimo de `matchMedia`: solo implementa `matches`, lo único que consume la función bajo prueba. */
function consultaDeMedios(coincide: boolean): typeof window.matchMedia {
  return ((consulta: string) => ({ matches: coincide, media: consulta }) as MediaQueryList) as typeof window.matchMedia
}

describe('@s41 la decisión de suavizar el desplazamiento al abrir una ficha es una función pura de la preferencia de movimiento', () => {
  it('con preferencia de reducir el movimiento, el comportamiento es "auto"', () => {
    expect(decidirComportamientoDesplazamiento(consultaDeMedios(true))).toBe('auto')
  })

  it('sin preferencia declarada, el comportamiento es "smooth"', () => {
    expect(decidirComportamientoDesplazamiento(consultaDeMedios(false))).toBe('smooth')
  })

  it('con la preferencia no consultable (sin matchMedia), el comportamiento es "auto"', () => {
    expect(decidirComportamientoDesplazamiento(undefined)).toBe('auto')
  })
})
