// El inventario de las 6 rutas reales del sitio, literal, tomado de
// `src/lib/accesibilidad-analisis.ts` (`INVENTARIO_DE_PAGINAS`, ya `done`) y
// de las rutas reales registradas en `src/App.tsx`/`src/pages/PaginaCampanas.tsx`
// (verificado en el briefing técnico, §1). NO se importa desde `src/`: los
// specs de navegador real viven fuera del gate de Vitest/StrykerJS a
// propósito (nivel C, `progress/plan_adaptacion_scss.md` §4.3), y este
// literal es la versión "escrita a mano" que varios escenarios exigen.

/**
 * El subpath real de publicación (Decisión 44/47, `despliegue_github_pages.feature`
 * @s13-@s17): `vite preview` de este arnés sirve `dist/` bajo este prefijo
 * (`playwright.config.ts` → `webServer.command`, con `--base` igual que
 * `pnpm run build`), así que toda ruta absoluta con la que Playwright navega
 * o pide un fichero tiene que llevarlo por delante — igual que en GitHub
 * Pages real. Literal único en este fichero (mismo criterio que la Decisión
 * 47 para el lado de producción): el resto de specs lo importa de aquí, no
 * lo retipea.
 */
export const SUBPATH_DE_PRODUCCION = '/GalapavetClinicaVeterinaria'

export interface RutaDelInventario {
  readonly pagina: string
  readonly ruta: string
}

export const RUTAS_DEL_INVENTARIO: readonly RutaDelInventario[] = [
  { pagina: 'Landing', ruta: `${SUBPATH_DE_PRODUCCION}/` },
  { pagina: 'Campañas', ruta: `${SUBPATH_DE_PRODUCCION}/campanas` },
  { pagina: 'Ficha de campaña', ruta: `${SUBPATH_DE_PRODUCCION}/campanas?campana=vacunaciones` },
  { pagina: 'Blog', ruta: `${SUBPATH_DE_PRODUCCION}/blog` },
  { pagina: 'Artículo del blog', ruta: `${SUBPATH_DE_PRODUCCION}/blog/demo-1` },
  { pagina: 'Tienda', ruta: `${SUBPATH_DE_PRODUCCION}/tienda` },
]

export const RECUENTO_DE_RUTAS = RUTAS_DEL_INVENTARIO.length
