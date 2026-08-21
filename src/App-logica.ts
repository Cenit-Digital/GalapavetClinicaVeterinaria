import { esAncla } from './components/Cabecera-logica'
import { ENLACES_NAVEGACION } from './data/navegacion'

/**
 * Rutas de subpágina que ya aterrizaron su propia `<Route>` en `App.tsx` y
 * por tanto deben dejar de caer en el catch-all genérico
 * (`features/ensamblaje_landing.feature`: "hasta que sus propias features
 * aterricen su propia Route"). `pagina_campanas` (feature 16) es la primera;
 * `pagina_blog`/`pagina_tienda` (17/18) añadirán la suya cuando aterricen.
 */
const RUTAS_YA_CON_PAGINA_PROPIA: ReadonlySet<string> = new Set(['/campanas'])

/**
 * Rutas de subpágina derivadas de `ENLACES_NAVEGACION` (Decisión 20): no se
 * retipean como literales nuevos. Reutiliza `esAncla` (`Cabecera-logica.ts`)
 * para distinguir un destino de ruta de un destino de ancla interna, y
 * excluye las que ya tienen página propia (arriba).
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
export const RUTAS_DE_SUBPAGINA = ENLACES_NAVEGACION.filter(
  (enlace) => !esAncla(enlace.destino) && !RUTAS_YA_CON_PAGINA_PROPIA.has(enlace.destino),
).map((enlace) => enlace.destino)
