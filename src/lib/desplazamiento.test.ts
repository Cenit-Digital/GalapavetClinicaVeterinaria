import { describe, expect, it } from 'vitest'
import { decidirComportamientoDesplazamiento } from './desplazamiento'

/** Doble mínimo de `matchMedia`: solo implementa `matches`, lo único que consume la función bajo prueba. */
function consultaDeMedios(coincide: boolean): typeof window.matchMedia {
  return ((consulta: string) => ({ matches: coincide, media: consulta }) as MediaQueryList) as typeof window.matchMedia
}

describe('@s29 el desplazamiento al cambiar de vista respeta la preferencia de movimiento', () => {
  it('con la preferencia "reducir el movimiento", el comportamiento es "auto"', () => {
    expect(decidirComportamientoDesplazamiento(consultaDeMedios(true))).toBe('auto')
  })

  it('sin preferencia declarada, el comportamiento es "smooth"', () => {
    expect(decidirComportamientoDesplazamiento(consultaDeMedios(false))).toBe('smooth')
  })
})
