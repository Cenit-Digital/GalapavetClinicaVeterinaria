import { describe, expect, it } from 'vitest'
import { construirEnlacesContacto, construirEnlacesLegales, textoCopyright } from './PieDePagina-logica'

describe('los enlaces legales separan el rótulo visible del aviso accesible', () => {
  it('conservan el nombre publicado y añaden el aviso de ventana nueva solo al nombre accesible', () => {
    expect(construirEnlacesLegales([{ nombre: 'Aviso legal', destino: 'https://galapavet.com/aviso-legal' }])).toEqual([
      {
        nombreVisible: 'Aviso legal',
        nombreAccesible: 'Aviso legal (se abre en una ventana nueva)',
        destino: 'https://galapavet.com/aviso-legal',
      },
    ])
  })
})

describe('@s12 el aviso de copyright no incluye ningún número de registro', () => {
  it('para el 17 de agosto de 2026 el texto es exactamente "© 2026 Galapavet", sin registro ni nombre heredado', () => {
    const texto = textoCopyright(new Date(2026, 7, 17), 'Galapavet')

    expect(texto).toBe('© 2026 Galapavet')
    expect(texto).not.toContain('28/0791')
    expect(texto).not.toContain('registrado')
    expect(texto).not.toContain('nº')
    expect(texto).not.toContain('Veterinaria La Sierra')
  })
})

describe('@s13 el año del aviso de copyright se calcula de la fecha vigente y no queda horneado', () => {
  it('para el 1 de enero de 2027 el texto es exactamente "© 2027 Galapavet" y no contiene "2026"', () => {
    const texto = textoCopyright(new Date(2027, 0, 1), 'Galapavet')

    expect(texto).toBe('© 2027 Galapavet')
    expect(texto).not.toContain('2026')
  })
})

describe('refuerzo de cobertura (no ligado a un @s: la fuente real siempre declara el rótulo de urgencias)', () => {
  it('sin rótulo declarado, el nombre del enlace de urgencias es solo el teléfono, sin separador "·"', () => {
    const enlaces = construirEnlacesContacto({
      telefonoClinica: '91 082 92 67',
      telefonoMovil: '685 34 31 49',
      telefonoUrgencias: '91 851 13 93',
      rotuloUrgencias: undefined,
    })

    expect(enlaces[2]?.nombre).toBe('91 851 13 93')
  })
})
