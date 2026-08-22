import { esAncla } from './components/Cabecera-logica'
import { ENLACES_NAVEGACION, type EnlaceNavegacion } from './data/navegacion'

/**
 * Rutas de subpágina que ya aterrizaron su propia `<Route>` en `App.tsx` y
 * por tanto deben dejar de caer en el catch-all genérico
 * (`features/ensamblaje_landing.feature`: "hasta que sus propias features
 * aterricen su propia Route"). `pagina_campanas` (feature 16) fue la
 * primera; `pagina_blog` (feature 17) añadió "/blog"; `pagina_tienda`
 * (feature 18) añade "/tienda" al aterrizar `src/pages/PaginaTienda.tsx`.
 * Con las tres, `RUTAS_DE_SUBPAGINA` (abajo) queda vacía: ya no queda
 * ninguna subpágina de `ENLACES_NAVEGACION` sin su propia página.
 */
const RUTAS_YA_CON_PAGINA_PROPIA: ReadonlySet<string> = new Set(['/campanas', '/blog', '/tienda'])

/**
 * Deriva las rutas de subpágina de un catálogo de enlaces (Decisión 20):
 * excluye anclas (`esAncla`, `Cabecera-logica.ts`) y destinos que ya tienen
 * su propia página (`rutasYaConPaginaPropia`). Parametrizada (no atada a
 * `ENLACES_NAVEGACION`) para que un test pueda ejercitar el caso positivo con
 * datos sintéticos: con los datos reales de HOY, `RUTAS_DE_SUBPAGINA` (abajo)
 * es `[]` para cualquier catálogo real existente, así que ningún mutante del
 * `.filter()`/`.map()` produce diferencia observable sobre esos datos
 * (refuerzo de mutación, `progress/mutation_pagina_tienda.md`: 3
 * supervivientes contingentes de los datos actuales, no equivalentes
 * genuinos).
 */
export function derivarRutasDeSubpagina(
  enlaces: readonly EnlaceNavegacion[],
  rutasYaConPaginaPropia: ReadonlySet<string>,
): string[] {
  return enlaces
    .filter((enlace) => !esAncla(enlace.destino) && !rutasYaConPaginaPropia.has(enlace.destino))
    .map((enlace) => enlace.destino)
}

/**
 * Rutas de subpágina derivadas de `ENLACES_NAVEGACION` (Decisión 20): no se
 * retipean como literales nuevos.
 *
 * Extraído de `App.tsx` a este módulo puro (refuerzo de mutación, ronda 2 de
 * `progress/mutation_ensamblaje_landing.md`): exportar esta derivación desde
 * `App.tsx` violaba `react-refresh/only-export-components` de oxlint (un
 * `.tsx` que exporta un componente solo puede exportar constantes-literal
 * junto a él, no el resultado de un `.filter().map()`). Además, así queda
 * dentro del glob por defecto de Stryker (`src/**\/*-logica.ts`), en línea
 * con el patrón `logica-de-decision-en-modulo-puro-no-en-el-jsx` del
 * proyecto: el `.tsx` solo cablea, la derivación vive en un módulo puro.
 */
export const RUTAS_DE_SUBPAGINA = derivarRutasDeSubpagina(ENLACES_NAVEGACION, RUTAS_YA_CON_PAGINA_PROPIA)
