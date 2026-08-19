import { describe, expect, it } from 'vitest'
import { esAncla, PUNTO_DE_CORTE_NAVEGACION_PX } from './Cabecera-logica'

describe('@s1 este proyecto declara su propio punto de corte y no hereda el ajeno', () => {
  it('el valor declarado es exactamente 1024 píxeles y no 1120, el del prototipo ajeno', () => {
    expect(PUNTO_DE_CORTE_NAVEGACION_PX).toBe(1024)
    expect(PUNTO_DE_CORTE_NAVEGACION_PX).not.toBe(1120)
  })
})

/**
 * Test directo de `esAncla`, soporte de @s9/@s10 (`Cabecera.tsx` decide con
 * ella si intercepta el clic con `preventDefault`+`pushState` o deja la
 * navegación nativa). `progress/mutation_cabecera_y_navegacion.md` (ronda 2)
 * documentó que probarla solo indirectamente a través de `Cabecera.test.tsx`
 * no basta: para un destino tipo "#servicios" ambas rutas (nativa y
 * `pushState`) terminan en el mismo `window.location.hash`, así que un
 * mutante que rompe `esAncla` puede sobrevivir sin que @s9/@s10 lo detecten.
 * Este test ejercita la función pura en sí, sin pasar por `Cabecera.tsx`.
 */
describe('esAncla distingue un destino de sección ("#...") de uno de subpágina', () => {
  it('un destino que empieza por "#" es ancla', () => {
    expect(esAncla('#servicios')).toBe(true)
  })

  it('un destino que NO empieza por "#" no es ancla, aunque termine en "#"', () => {
    expect(esAncla('/tienda')).toBe(false)
    expect(esAncla('tienda#')).toBe(false)
  })
})
