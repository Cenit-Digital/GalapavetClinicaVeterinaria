// @s49 de `features/identidad_visual.feature` (Bloque J: las puertas del
// arnés). NAVEGADOR REAL con Playwright, sumando los bytes de las
// respuestas de tipo hoja de estilo de la portada.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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
// peso del propio CSS. 12000 B es el techo aprobado por Pablo para permitir
// la convergencia visual de las doce secciones sin convertir cambios de
// maquetación necesarios en una falsa regresión de presupuesto.
const TECHO_BYTES_CSS = 12000

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

// @s48 de `features/rediseno_visual.feature`: "el techo se declara en un
// único sitio". Mismo mecanismo de "puerta de declaración única" que @s10
// (`src/lib/diseno/contratoRedisenho.ts`,
// `buscarDeclaracionesLiteralesDelIdentificador`), pero self-contained en
// este fichero por alcance: aquí no hay un catálogo de variantes que
// consumir desde producción, solo una constante de test. Se inspecciona
// "src/" y "tests/" (TypeScript real) — no "dist/" ni ".stryker-tmp/" (son
// artefactos generados, no fuentes) — porque ese es el universo donde este
// techo podría razonablemente volver a copiarse.
const RAIZ_DEL_REPO = fileURLToPath(new URL('../..', import.meta.url))
const RUTA_DE_ESTE_FICHERO = fileURLToPath(import.meta.url).replaceAll('\\', '/')
const ES_TYPESCRIPT = /\.tsx?$/
const PATRON_DE_DECLARACION_DEL_TECHO = /TECHO_BYTES_CSS\s*=\s*12000\b/

function rutasTypeScriptBajo(directorio: string): readonly string[] {
  return readdirSync(directorio, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile() && ES_TYPESCRIPT.test(entrada.name))
    .map((entrada) => `${entrada.parentPath}/${entrada.name}`.replaceAll('\\', '/'))
}

function ficherosQueDeclaranElTecho(): readonly string[] {
  const corpus = [...rutasTypeScriptBajo(`${RAIZ_DEL_REPO}/src`), ...rutasTypeScriptBajo(`${RAIZ_DEL_REPO}/tests`)]

  return corpus.filter((ruta) => PATRON_DE_DECLARACION_DEL_TECHO.test(readFileSync(ruta, 'utf8')))
}

test.describe('@s48 el techo de bytes de CSS se declara en un único sitio', () => {
  test('"TECHO_BYTES_CSS = 12000" solo aparece declarado en este fichero, en todo "src/" y "tests/"', () => {
    expect(ficherosQueDeclaranElTecho()).toEqual([RUTA_DE_ESTE_FICHERO])
  })
})
