import { describe, expect, it } from 'vitest'
import { DESTINO_TIENDA } from '../data/navegacion'
import { esAncla, esDestinoTienda, esPaginaActual, posicionDeScrollParaAncla, PUNTO_DE_CORTE_NAVEGACION_PX } from './Cabecera-logica'

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

/**
 * @s28 de `rediseno_visual.feature`: "muestra un acceso a la tienda con
 * borde y sin relleno". `Cabecera.tsx` deriva el estilo del enlace de Tienda
 * de su propio destino (nunca de una prop nueva "es-tienda"), comparándolo
 * contra `DESTINO_TIENDA` — la MISMA constante que ya declara el destino real
 * en `src/data/navegacion.ts:22`, para que los dos no puedan divergir.
 */
describe('esDestinoTienda distingue el destino de la Tienda del resto del catálogo (@s28)', () => {
  it('el destino real de la Tienda ("/tienda", DESTINO_TIENDA) es el de la Tienda', () => {
    expect(esDestinoTienda(DESTINO_TIENDA)).toBe(true)
    expect(esDestinoTienda('/tienda')).toBe(true)
  })

  it('ningún otro destino del catálogo es el de la Tienda', () => {
    expect(esDestinoTienda('#servicios')).toBe(false)
    expect(esDestinoTienda('/campanas')).toBe(false)
    expect(esDestinoTienda('/blog')).toBe(false)
  })
})

/**
 * @s28: "el sitio del ancla de destino al saltar a una sección se calcula
 * desde la altura real de la cabecera más la barra de urgencias, no desde un
 * número escrito a mano". Función pura: los tres números de entrada son
 * SIEMPRE medidos en el momento del clic (`Cabecera.tsx`, con
 * `getBoundingClientRect()`/`window.scrollY`), nunca literales. Se prueba
 * aquí en aislado, con literales de test escritos a mano confrontados contra
 * el resultado — nunca contra la propia fórmula de producción.
 */
describe('posicionDeScrollParaAncla calcula el nuevo scroll desde alturas REALES, nunca desde un número escrito a mano (@s28)', () => {
  it('suma el scroll ya acumulado a la distancia del elemento y resta la altura fija real medida', () => {
    // 200px ya desplazados + el destino está a 500px del borde superior de la
    // ventana - 96px de franja fija real (barra + cabecera) = 604.
    expect(posicionDeScrollParaAncla(200, 500, 96)).toBe(604)
  })

  it('si la altura fija real medida cambia, el resultado cambia con ella: no es un número fijo', () => {
    // Misma distancia y mismo scroll que el caso anterior, pero con una
    // franja fija real de 150px (p. ej. porque la barra de urgencias mide
    // más en este momento): el resultado tiene que ser DISTINTO de 604.
    const conFranjaMayor = posicionDeScrollParaAncla(200, 500, 150)
    expect(conFranjaMayor).toBe(550)
    expect(conFranjaMayor).not.toBe(604)
  })
})
