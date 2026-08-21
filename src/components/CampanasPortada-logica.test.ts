import { describe, expect, it } from 'vitest'
import type { CampanaDemo } from '../data/campanas'
import { construirModeloCampanas } from './CampanasPortada-logica'

describe('@s9 una campaña con precio hace fallar la construcción de la sección', () => {
  it('lanza un error cuyo mensaje contiene "precio no confirmado"', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', precio: '49 €' }]

    expect(() => construirModeloCampanas(catalogo)).toThrowError(/precio no confirmado/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', precio: '49 €' }]

    let lanzado: unknown
    try {
      construirModeloCampanas(catalogo)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe('La campaña "Vacunaciones" declara un precio no confirmado: "49 €"')
  })
})

describe('@s10 una campaña con vigencia hace fallar la construcción de la sección', () => {
  it('lanza un error cuyo mensaje contiene "vigencia no confirmada"', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', vigencia: 'Hasta el 30 de septiembre' }]

    expect(() => construirModeloCampanas(catalogo)).toThrowError(/vigencia no confirmada/)
  })

  it('lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: 'Vacunaciones', vigencia: 'Hasta el 30 de septiembre' }]

    let lanzado: unknown
    try {
      construirModeloCampanas(catalogo)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeInstanceOf(Error)
    expect((lanzado as Error).message).toBe(
      'La campaña "Vacunaciones" declara una vigencia no confirmada: "Hasta el 30 de septiembre"',
    )
  })
})

describe('@s19 el modelo de la sección de campañas descarta las entradas sin título', () => {
  it('el modelo contiene exactamente 2 entradas, con los títulos restantes en orden', () => {
    const catalogo: readonly CampanaDemo[] = [
      { titulo: 'Vacunaciones' },
      { titulo: '' },
      { titulo: 'Odontología' },
    ]

    const modelo = construirModeloCampanas(catalogo)

    expect(modelo).toHaveLength(2)
    expect(modelo.map((campana) => campana.titulo)).toEqual(['Vacunaciones', 'Odontología'])
  })

  it('descarta también un título compuesto solo por espacios en blanco, no solo la cadena vacía', () => {
    const catalogo: readonly CampanaDemo[] = [
      { titulo: 'Vacunaciones' },
      { titulo: '   ' },
      { titulo: 'Odontología' },
    ]

    const modelo = construirModeloCampanas(catalogo)

    expect(modelo).toHaveLength(2)
    expect(modelo.map((campana) => campana.titulo)).toEqual(['Vacunaciones', 'Odontología'])
  })
})

describe('@s20 el modelo de la sección de campañas queda vacío si ninguna entrada tiene título', () => {
  it('el modelo no contiene ninguna entrada', () => {
    const catalogo: readonly CampanaDemo[] = [{ titulo: '' }, { titulo: '' }, { titulo: '' }]

    const modelo = construirModeloCampanas(catalogo)

    expect(modelo).toHaveLength(0)
  })
})
