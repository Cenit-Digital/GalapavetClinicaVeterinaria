import { describe, expect, it } from 'vitest'
import { esAncla, esPaginaActual, PUNTO_DE_CORTE_NAVEGACION_PX } from './Cabecera-logica'

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

/**
 * Test directo de `esPaginaActual` (`pagina_campanas.feature` @s1: marca con
 * `aria-current="page"` el enlace de navegación de la ruta activa). Igual
 * que con `esAncla`, se ejercita la función pura en sí para que un mutante
 * no dependa únicamente de `App.test.tsx`/`PaginaCampanas.test.tsx`.
 */
describe('esPaginaActual marca como actual solo el destino de subpágina que coincide con la ruta activa', () => {
  it('un destino de subpágina que coincide exactamente con la ruta activa es la página actual', () => {
    expect(esPaginaActual('/campanas', '/campanas')).toBe(true)
  })

  it('un destino de subpágina que NO coincide con la ruta activa no es la página actual', () => {
    expect(esPaginaActual('/campanas', '/tienda')).toBe(false)
  })

  it('un ancla nunca es la página actual, aunque el texto coincida literalmente con la ruta activa', () => {
    expect(esPaginaActual('#servicios', '#servicios')).toBe(false)
  })
})
