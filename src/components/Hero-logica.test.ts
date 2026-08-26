import { describe, expect, it } from 'vitest'
import { construirCifrasBienvenida } from './Hero-logica'

describe('cifras de bienvenida', () => {
  it('@s51 deriva cada cifra de los catálogos reales sin valores escritos a mano', () => {
    expect(construirCifrasBienvenida(['a', 'b'], ['c'], ['d', 'e', 'f'], ['g', 'h'])).toEqual([
      { valor: 2, etiqueta: 'Servicios' },
      { valor: 1, etiqueta: 'Profesionales' },
      { valor: 3, etiqueta: 'Fotos de galería' },
      { valor: 2, etiqueta: 'Franjas horarias' },
    ])
  })
})
