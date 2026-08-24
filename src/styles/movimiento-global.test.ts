/**
 * Amplía la puerta @s33 (`movimientoRespetuoso.ts`, ya `done`) a las hojas
 * GLOBALES: `global.scss`, `_api.scss` y `_tokens.scss` (paso 5 de
 * `progress/plan_adaptacion_scss.md` §5, divergencia D-11 de su §9). Se
 * invocan como catálogo SEPARADO del de los 17 `.module.scss`
 * (`inventarioModulos.test.ts`), nunca ampliando ese glob: una hoja global no
 * es ni un componente ni una página, y mezclar los dos catálogos rompería la
 * identidad de recuentos que @s24/@s51 ya exigen sobre los 17.
 *
 * Antes de este test, `_base.scss`/`global.scss` podía declarar una
 * `transition` o una `animation` fuera de `prefers-reduced-motion` y NINGUNA
 * puerta se enteraría (patrón `verde-por-vacuidad-en-puerta-de-verificacion`
 * con otro disfraz).
 */
import { describe, expect, it } from 'vitest'
import { ejecutarPuertaDeMovimientoRespetuoso, type FicheroEstilos } from '../lib/diseno/movimientoRespetuoso'

const HOJAS_GLOBALES_REALES = {
  ...(import.meta.glob('./global.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>),
  ...(import.meta.glob('./_api.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>),
  ...(import.meta.glob('./_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>),
}

describe('(paso 5 del plan) @s33 ampliado: toda animación o transición de las hojas GLOBALES vive dentro de "prefers-reduced-motion"', () => {
  it('las 3 hojas reales (global.scss, _api.scss, _tokens.scss): la única transición real vive en "no-preference", y se comprobó más de 0 ficheros', () => {
    const ficheros: readonly FicheroEstilos[] = Object.entries(HOJAS_GLOBALES_REALES).map(([ruta, contenido]) => ({ ruta, contenido }))
    expect(ficheros).toHaveLength(3)

    const informe = ejecutarPuertaDeMovimientoRespetuoso(ficheros)

    expect(informe.ficherosComprobados).toBeGreaterThan(0)
    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })

  it('una transición sintética fuera de todo bloque "prefers-reduced-motion" en una hoja global se señala como incumplimiento', () => {
    const hojaSinCobertura: FicheroEstilos = {
      ruta: '/prueba/global-sin-cobertura.scss',
      contenido: 'body {\n  transition: color 150ms ease-out;\n}\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([hojaSinCobertura])

    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/global-sin-cobertura.scss', linea: 2 }])
    expect(informe.pasa).toBe(false)
  })
})
