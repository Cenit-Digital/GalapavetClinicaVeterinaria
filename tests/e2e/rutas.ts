// El inventario de las 6 rutas reales del sitio, literal, tomado de
// `src/lib/accesibilidad-analisis.ts` (`INVENTARIO_DE_PAGINAS`, ya `done`) y
// de las rutas reales registradas en `src/App.tsx`/`src/pages/PaginaCampanas.tsx`
// (verificado en el briefing técnico, §1). NO se importa desde `src/`: los
// specs de navegador real viven fuera del gate de Vitest/StrykerJS a
// propósito (nivel C, `progress/plan_adaptacion_scss.md` §4.3), y este
// literal es la versión "escrita a mano" que varios escenarios exigen.
export interface RutaDelInventario {
  readonly pagina: string
  readonly ruta: string
}

export const RUTAS_DEL_INVENTARIO: readonly RutaDelInventario[] = [
  { pagina: 'Landing', ruta: '/' },
  { pagina: 'Campañas', ruta: '/campanas' },
  { pagina: 'Ficha de campaña', ruta: '/campanas?campana=vacunaciones' },
  { pagina: 'Blog', ruta: '/blog' },
  { pagina: 'Artículo del blog', ruta: '/blog/demo-1' },
  { pagina: 'Tienda', ruta: '/tienda' },
]

export const RECUENTO_DE_RUTAS = RUTAS_DEL_INVENTARIO.length
