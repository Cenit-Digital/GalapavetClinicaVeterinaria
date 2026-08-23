import { describe, expect, it } from 'vitest'
import { ESCALA_DE_ESPACIADO_PX } from './escalaEspaciado'

describe('@s19 la escala de espaciado declara exactamente los 9 pasos de la rejilla de 8px de Material Design', () => {
  it('4, 8, 12, 16, 24, 32, 48, 64 y 96 píxeles, ni uno más ni uno menos', () => {
    // Literal escrito a mano, transcrito de la rejilla de Material Design — NO se obtiene de la escala que se comprueba.
    const pasosAMano = [4, 8, 12, 16, 24, 32, 48, 64, 96]

    expect(ESCALA_DE_ESPACIADO_PX).toHaveLength(pasosAMano.length)
    expect(ESCALA_DE_ESPACIADO_PX.toSorted((a, b) => a - b)).toEqual(pasosAMano)
    for (const paso of ESCALA_DE_ESPACIADO_PX) {
      expect(pasosAMano).toContain(paso)
    }
  })
})

describe('@s20 ningún paso de la escala de espaciado se aparta de la rejilla de 8px', () => {
  it('cada paso es múltiplo de 4, y ninguno es menor que 4 ni mayor que 96', () => {
    const MULTIPLO_DE_LA_REJILLA = 4
    const PASO_MINIMO = 4
    const PASO_MAXIMO = 96

    for (const paso of ESCALA_DE_ESPACIADO_PX) {
      expect(paso % MULTIPLO_DE_LA_REJILLA).toBe(0)
      expect(paso).toBeGreaterThanOrEqual(PASO_MINIMO)
      expect(paso).toBeLessThanOrEqual(PASO_MAXIMO)
    }
  })
})
