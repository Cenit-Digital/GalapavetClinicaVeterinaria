/**
 * Catálogo estático de las páginas legales reales que publica Galapavet.
 * Fuente: `docs/datos-galapavet.md` §11 y `project-spec.md` → Decisión 7.
 * Mismo patrón que `src/data/servicios.ts` / `src/data/equipo.ts` /
 * `src/data/navegacion.ts`: catálogo readonly, sin literales repetidos en el
 * componente. El cliente no publica página de privacidad (PENDIENTE, ver
 * cabecera de `features/pie_de_pagina.feature`): por eso no hay una cuarta
 * entrada "Privacidad" (@s11).
 */
export interface PaginaLegal {
  readonly nombre: string
  readonly destino: string
}

export const PAGINAS_LEGALES: readonly PaginaLegal[] = [
  { nombre: 'Aviso legal', destino: 'https://galapavet.com/aviso-legal' },
  { nombre: 'Política de cookies', destino: 'https://galapavet.com/politica-de-cookies' },
  { nombre: 'Personalizar cookies', destino: 'https://galapavet.com/personalizar-cookies' },
] as const satisfies readonly PaginaLegal[]
