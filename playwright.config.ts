// ============================================================================
// CONFIGURACIÓN DE LA PUERTA DE NAVEGADOR REAL — Galapavet
// ============================================================================
// Paso 12 de `progress/plan_adaptacion_scss.md` §5, @s48 de
// `features/identidad_visual.feature`. Puerta PROPIA y SEPARADA del arranque
// de sesión: `harness.config.json` → `commands.test` sigue siendo solo
// `pnpm run test` (Vitest) — este fichero NO se referencia desde ahí, a
// propósito, para que verificar el entorno no exija descargar un navegador
// de cientos de megas ni construir el sitio entero.
//
// Import de "playwright/test", NO de "@playwright/test": este repo instala
// "playwright@1.62.1" (no el paquete separado), que expone el subpath
// "playwright/test" con la MISMA API (`test`, `expect`, `defineConfig`,
// `devices`) — verificado leyendo `node_modules/playwright/test.d.ts` y
// `test.mjs`, que reexportan literalmente esos cuatro símbolos. Discrepancia
// con el snippet del briefing (que citaba "@playwright/test", paquete que
// este repo no instala): confirmada y documentada, no un despiste.
import { defineConfig, devices } from 'playwright/test'

const PUERTO_DE_PREVIEW = 4173
// Subpath real de GitHub Pages (Decisión 44/47, `despliegue_github_pages.feature`
// @s13-@s17): "vite preview" sirve "dist/" bajo este prefijo, igual que
// "pnpm run build" ya lo aplica al bundle. Toda ruta con la que los specs
// navegan ya lleva este prefijo por delante (`tests/e2e/rutas.ts`), así que
// esta URL base solo necesita aportar el origen — pero coincide a propósito
// con la raíz real (con barra final) para que el "health check" del propio
// "webServer" (más abajo) compruebe la URL que de verdad sirve contenido.
const URL_BASE = `http://localhost:${PUERTO_DE_PREVIEW}/GalapavetClinicaVeterinaria/`
const TIMEOUT_ARRANQUE_SERVIDOR_MS = 120_000
// Algunos escenarios recorren las 6 rutas dentro de UN solo test (p. ej.
// @s36, seis análisis de axe-core secuenciales): el timeout POR DEFECTO de
// Playwright (30 s) es ajustado para eso incluso sin contención, y esta
// máquina de desarrollo mide picos reales de CPU compartida (documentado ya
// en `progress/tdd_identidad_visual.md` para Vitest/Stryker). Esto es un
// timeout de INTENTO ÚNICO, no un reintento: "retries" sigue en 0.
const TIMEOUT_POR_TEST_MS = 60_000

export default defineConfig({
  testDir: './tests/e2e',
  timeout: TIMEOUT_POR_TEST_MS,
  // 0 reintentos A PROPÓSITO, contradiciendo la recomendación de 2 para
  // integración continua (@s48): un reintento convierte una prueba
  // inestable en verde y esconde justo lo que esta feature existe para
  // destapar (el sitio real sin CSS del 23/08/2026 pasaba con la suite de
  // jsdom en verde).
  retries: 0,
  webServer: {
    // SIEMPRE `dist/` vía `vite preview`, NUNCA el servidor de desarrollo
    // (@s48): es la única forma de que "0 font-family en el CSS generado"
    // sea reproducible como test, porque el dev server no pasa por Lightning
    // CSS ni por la puerta anti-terceros de `pnpm run build`. `--base` aquí
    // es el mismo literal que ya lleva el script "build" de `package.json`
    // (Decisión 47/51, `despliegue_github_pages.feature`): sin él, "vite
    // preview" serviría "dist/" desde la raíz del origen en vez de bajo el
    // subpath real de GitHub Pages, y el prefijo de los assets (@s13/@s14)
    // no sería reproducible.
    command: 'pnpm run build && pnpm exec vite preview --base=/GalapavetClinicaVeterinaria/ --port 4173 --strictPort',
    url: URL_BASE,
    reuseExistingServer: !process.env.CI,
    timeout: TIMEOUT_ARRANQUE_SERVIDOR_MS,
  },
  use: {
    baseURL: URL_BASE,
    ...devices['Desktop Chrome'],
  },
})
