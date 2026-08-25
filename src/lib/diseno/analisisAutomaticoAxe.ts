/**
 * La configuración del análisis automático de accesibilidad en navegador
 * real (@s35 de `identidad_visual.feature`, Decisión 39): las cinco
 * etiquetas ACUMULATIVAS de conformidad, en una sola llamada a `withTags`
 * (no aditiva entre llamadas — verificado en el briefing técnico contra el
 * código fuente real de axe-core), y NUNCA el mecanismo `.options()`, cuya
 * propia documentación advierte de que anularía cualquier otra opción
 * configurada, incluidas las etiquetas.
 *
 * `wcag22aa` es imprescindible y suficiente para activar `target-size`
 * (viene `enabled: false` por defecto y es la única de las cinco etiquetas
 * que la trae — verificado leyendo `rule-should-run.js` y `target-size.json`
 * de axe-core 4.13.0).
 *
 * Este módulo NO importa `axe-core` ni `@axe-core/playwright`: solo declara
 * el catálogo de etiquetas, consumido tal cual por
 * `tests/e2e/accesibilidad.spec.ts` (fuera del alcance de Vitest/StrykerJS,
 * @s36-@s41) y verificado aquí como módulo puro.
 */

export const ETIQUETAS_AXE_ACUMULATIVAS: readonly string[] = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const ETIQUETA_QUE_ACTIVA_AREA_TACTIL = 'wcag22aa'

export interface ConfiguracionDeAnalisisAxe {
  readonly etiquetas: readonly string[]
  readonly usaOpciones: false
}

/**
 * La configuración declarada del análisis automático: las cinco etiquetas,
 * y `usaOpciones: false` de forma explícita (nunca `.options()`).
 */
export function configuracionDeAnalisisAxeDeclarada(): ConfiguracionDeAnalisisAxe {
  return { etiquetas: ETIQUETAS_AXE_ACUMULATIVAS, usaOpciones: false }
}

/** @s35: "wcag22aa" es imprescindible porque es la única etiqueta que trae la regla de área táctil. */
export function etiquetasIncluyenLaQueActivaAreaTactil(): boolean {
  return ETIQUETAS_AXE_ACUMULATIVAS.includes(ETIQUETA_QUE_ACTIVA_AREA_TACTIL)
}
