import { describe, expect, it } from 'vitest'
import { RUTAS_DE_SUBPAGINA } from './App-logica'

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
  it('es exactamente ["/tienda"], sin anclas, sin "/campanas" ni "/blog", y sin nada de más', () => {
    // "/campanas" salió de esta lista desde `pagina_campanas` (feature 16) y
    // "/blog" sale ahora desde `pagina_blog` (feature 17): `App.tsx` ya
    // registra su propia `<Route>` real para ambas, así que ya no deben caer
    // en el catch-all genérico. Literal escrito a mano: nunca se compara
    // contra ENLACES_NAVEGACION importado (patrón
    // doble-de-test-anclado-al-literal-no-al-simbolo).
    expect(RUTAS_DE_SUBPAGINA).toEqual(['/tienda'])
  })
})
