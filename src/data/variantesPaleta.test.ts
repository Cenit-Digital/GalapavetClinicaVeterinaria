import { describe, expect, it } from 'vitest'
import { VARIANTES_PALETA } from './variantesPaleta'

describe('catálogo de variantes del rediseño', () => {
  it('@s37 ofrece exactamente las cinco variantes del sistema visual, en su orden declarado', () => {
    expect(VARIANTES_PALETA.map(({ id }) => id)).toEqual(['clinica', 'calida', 'tech', 'eco', 'marca'])
  })
})
