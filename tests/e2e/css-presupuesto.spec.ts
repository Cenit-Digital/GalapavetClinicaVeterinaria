// @s49 de `features/identidad_visual.feature` (Bloque J: las puertas del
// arnés). NAVEGADOR REAL con Playwright, sumando los bytes de las
// respuestas de tipo hoja de estilo de la portada.
import { expect, test } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

// ESCRITO A MANO — no se recalcula del "dist/" que comprueba (PENDIENTE 2 del
// contrato, @s49). Medido sobre el primer "dist/" verde tras el paso 10 del
// plan (`progress/plan_adaptacion_scss.md` §5, diseño fino de los 17
// ".module.scss"): la respuesta real de "vite preview" para la hoja de la
// portada mide "encodedBodySize" 5791 B (comprimida por el propio servidor
// de preview; el fichero sin comprimir en "dist/assets/" pesa ~48 KB — la
// diferencia es la compresión de transporte real, no un error de medición).
// Se usa "encodedBodySize" y no "transferSize" por el mismo motivo que @s22:
// "transferSize" añade una estimación de cabeceras HTTP (~300 B) ajena al
// peso del propio CSS. 8000 B deja un margen del ~38% sobre lo medido, para
// que este techo siga funcionando como trinquete SIN romperse por cualquier
// cambio mínimo.
const TECHO_BYTES_CSS = 8000

test.describe('@s49 el peso del CSS servido no supera el techo declarado', () => {
  test('la portada: suma de bytes de hoja de estilo <= techo, techo > 0 y escrito a mano', async ({ page }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.waitForLoadState('networkidle')

    const bytesTotales = await page.evaluate(() => {
      const entradas = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      return entradas.filter((entrada) => entrada.initiatorType === 'link' && entrada.name.endsWith('.css')).reduce(
        (total, entrada) => total + entrada.encodedBodySize,
        0,
      )
    })

    expect(TECHO_BYTES_CSS).toBeGreaterThan(0)
    expect(bytesTotales).toBeLessThanOrEqual(TECHO_BYTES_CSS)
    expect(bytesTotales).toBeGreaterThan(0)
  })
})
