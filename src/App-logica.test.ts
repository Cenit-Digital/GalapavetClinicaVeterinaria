import { describe, expect, it } from 'vitest'
import { derivarRutasDeSubpagina, RUTAS_DE_SUBPAGINA } from './App-logica'

/**
 * Refuerzo de mutación (ronda 2, `progress/mutation_ensamblaje_landing.md`):
 * @s12/@s13 solo comprueban el resultado visual de 3 rutas ya conocidas
 * contra el catch-all genérico, que absorbe cualquier fallo de esta
 * derivación con el mismo componente. Este test verifica el valor exacto de
 * `RUTAS_DE_SUBPAGINA`, independiente del DOM: mata el `filter` eliminado
 * (App-logica.ts, antes App.tsx:16:28), el predicado del `filter` vaciado
 * (16:54), la negación de `esAncla` invertida (16:66) y el `map` final
 * vaciado (17:3).
 */
describe('RUTAS_DE_SUBPAGINA deriva exactamente los destinos no-ancla de ENLACES_NAVEGACION que aún no tienen página propia', () => {
  it('es exactamente [] (array vacío): ya no queda ninguna subpágina de navegacion.ts sin su propia página', () => {
    // "/campanas" salió de esta lista desde `pagina_campanas` (feature 16),
    // "/blog" desde `pagina_blog` (feature 17) y "/tienda" desde
    // `pagina_tienda` (feature 18, esta feature): `App.tsx` ya registra su
    // propia `<Route>` real para las tres, así que ninguna cae ya en el
    // catch-all genérico. Resultado correcto y esperado, no un bug: no queda
    // ninguna subpágina de `ENLACES_NAVEGACION` sin página propia. Literal
    // escrito a mano: nunca se compara contra ENLACES_NAVEGACION importado
    // (patrón doble-de-test-anclado-al-literal-no-al-simbolo).
    expect(RUTAS_DE_SUBPAGINA).toEqual([])
  })
})

/**
 * Refuerzo de mutación (`progress/mutation_pagina_tienda.md`, ronda tras
 * `pagina_tienda`): con los datos reales de `ENLACES_NAVEGACION` de HOY,
 * `RUTAS_DE_SUBPAGINA` es `[]` para cualquier mutante del `.filter().map()`
 * (los 3 destinos reales ya tienen página propia, las 5 anclas cortocircuitan
 * el `&&`), así que el test de arriba nunca demuestra que la propia
 * derivación sigue funcionando. `derivarRutasDeSubpagina` es la misma lógica
 * parametrizada con datos sintéticos: un caso positivo con una entrada de
 * ruta real SIN página propia todavía sí distingue el `.filter`/`.map` real
 * de una versión mutada.
 */
describe('derivarRutasDeSubpagina (función pura parametrizada, caso positivo con datos sintéticos)', () => {
  it('incluye un destino de ruta real que todavía no tiene página propia, y excluye anclas y rutas ya cubiertas', () => {
    const enlaces = [
      { nombre: 'Ancla', destino: '#ancla' },
      { nombre: 'Ya tiene página', destino: '/ya-tiene-pagina' },
      { nombre: 'Subpágina nueva', destino: '/subpagina-nueva' },
    ]
    const rutasYaConPaginaPropia = new Set(['/ya-tiene-pagina'])

    expect(derivarRutasDeSubpagina(enlaces, rutasYaConPaginaPropia)).toEqual(['/subpagina-nueva'])
  })
})
