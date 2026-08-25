# Briefing técnico: infraestructura Playwright + axe-core para `identidad_visual` (paso 9/12)

> Producido por un agente de investigación de solo lectura (25/08/2026), a
> petición del `craftsman_lead`, para servir de contexto verificado al
> `tdd_craftsman` que ejecute los pasos 9-12 de
> `progress/plan_adaptacion_scss.md` §5. Todo lo que sigue está verificado
> contra el repo real o contra documentación oficial citada; lo que no se
> pudo verificar está marcado explícitamente. No sustituye la propia
> investigación del `tdd_craftsman` si algo no cuadra al implementar — es
> contexto, no una orden ciega.

## 1. Estado actual relevante del repo

**tsconfig**: `tsconfig.json` raíz solo tiene `"files": []` y `references` a
`tsconfig.app.json` (`include: ["src","tools"]`, `types: ["node","vite/client","vitest/globals","@testing-library/jest-dom"]`)
y `tsconfig.node.json` (`include: ["vite.config.ts"]`, `module: "nodenext"`).
**No existe `tsconfig.e2e.json`** todavía, ni ningún directorio `tests/`.

**package.json**: scripts actuales `dev/build/preview/lint/typecheck/verificar/test/test:watch/test:cobertura/mutate`.
**No existe `test:e2e`**. `engines.node = "^20.19.0 || >=22.12.0"`. Ya hay
`"axe-core": "^4.13.0"` como devDependency (lo usa
`src/lib/accesibilidad-analisis.ts` y `accesibilidad-movimiento.test.ts` —
módulo puro, no navegador), por lo que `@axe-core/playwright@4.13.0` (que
declara `axe-core: "~4.13.0"` como dependencia propia, no peer) convivirá sin
conflicto: pnpm resuelve cada uno en su propio árbol.

**harness.config.json**: `commands.test = "pnpm run test"` (solo Vitest).
Cumple ya el contrato de @s48: el arnés no toca e2e, así que basta con **no
tocar `harness.config.json`** al añadir `test:e2e`.

**Máquina**: Node `v22.15.0`, pnpm `10.21.0` — ambos superan el mínimo de
Playwright 1.62.1 (`engines.node: ">=20"` según el registro npm) y encajan
con `engines` del propio `package.json`.

**Mecanismo `data-variante`** (verificado leyendo el código, no supuesto):
clave de localStorage exacta `'galapavet-variante'` (constante
`CLAVE_ALMACENAMIENTO_VARIANTE` en `SelectorPaleta-logica.ts`), catálogo
`['marca','lima','verde','noche']`, atributo `data-variante` fijado en
**`document.documentElement`** (`<html>`), tanto por el script anti-FOUC de
`index.html:45` como por el `useEffect` de `SelectorPaleta.tsx:22`. Para
forzar una variante en Playwright **antes de navegar**, hay que escribir esa
clave en `localStorage` con `page.addInitScript()` (corre antes de que
exista el bundle, igual que el script anti-FOUC). Para @s25 en concreto, el
propio Gherkin pide elegir la variante *"desde el panel del selector de
paleta ya implementado"*: lo correcto ahí es abrir el panel y hacer clic, no
atajar por `localStorage`.

**Módulo reutilizable para @s36**: `src/lib/accesibilidad-analisis.ts`
(feature 19, `done`) ya expone `ejecutarPuertaDeAnalisisAutomatico(resultado)`,
que espera `{ reglasAplicadas, informes: [{ pagina, cargo, violaciones: [{criterio, elemento}] }] }`
y devuelve el veredicto. @s36 exige *"el veredicto se lee del informe del
análisis y no del código de salida del proceso"* — lo correcto es que la
prueba Playwright mapee cada `AxeBuilder.analyze()` a ese
`ResultadoDeAnalisisAutomatico` y reutilice esta puerta ya probada al 100%,
no que reimplemente el veredicto comparando `violations.length === 0` a
pelo.

## 2. Instalación

```bash
pnpm add -D playwright@1.62.1 @axe-core/playwright@4.13.0
```

Descarga de navegador — solo Chromium, variante ligera "headless shell"
(fuente: `docs/src/browsers.md` del repo oficial de Playwright):

```bash
pnpm exec playwright install chromium --only-shell
```

`--with-deps` instala dependencias de SO vía `apt-get` y **solo tiene efecto
en Ubuntu/Debian**; en esta máquina Windows no hace nada útil (solo
importaría en un CI Linux). El tamaño en disco exacto del `--only-shell`
sigue **NO VERIFICADO** (PENDIENTE 9 del `.feature` sigue abierto; la doc
oficial solo da el ejemplo `281M chromium-XXXXXX` para el build completo).

## 3. `playwright.config.ts` — forma verificada

Fuentes: `playwright.dev/docs/test-webserver` (opción `webServer`) y
`playwright.dev/docs/test-typescript`.

**Sobre el "tercer tsconfig", la razón real (no supuesta)**: Playwright Test
**no type-checkea** — su doc dice literalmente *"Playwright does not check
the types and will run tests even if there are non-critical TypeScript
compilation errors"*, usa esbuild solo para transformar, y de un tsconfig
**"only supports... `allowJs`, `baseUrl`, `paths`, `references` and
`extends`"**. Es decir, Playwright en sí no necesita `tsconfig.e2e.json`
para ejecutar nada. La razón real es otra: `tsconfig.app.json` solo incluye
`["src","tools"]`, así que `tests/e2e/` hoy no está bajo la sombra de ningún
tsconfig — ni `tsc -b` lo tocaría, y como Playwright no type-checkea, un
error de tipos en un test e2e pasaría **completamente silencioso**. Añadir
`tsconfig.e2e.json` como tercera referencia del `tsconfig.json` raíz cierra
ese agujero (`pnpm run typecheck` vuelve a cubrirlo, sin descargar ningún
navegador). Razón secundaria: evita que el editor mezcle `vitest/globals`
con los tipos de `@playwright/test`.

## 4. `AxeBuilder` — forma verificada

Fuentes: README oficial de `dequelabs/axe-core-npm` y
`playwright.dev/docs/accessibility-testing`. El export soporta ambas formas
(verificado en `dist/index.d.ts`: `export { AxeBuilder, AxeBuilder as default }`).

**Advertencia real**: `withTags()` **no es aditivo entre llamadas** — cada
llamada reemplaza la anterior (pasar las 5 etiquetas en **una sola
llamada**). Sobre `.options()`, la doc dice *"Will override any other
configured options, including calls to `AxeBuilder#withRules()` and
`AxeBuilder#withTags()"`* — confirma la prohibición del contrato.

**Sobre si `.options()` hace falta para `target-size`, verificado a nivel de
código fuente**: leído `lib/core/utils/rule-should-run.js` de axe-core. Con
`runOnly.type === 'tag'` (lo que produce `withTags`), la selección mira solo
la intersección de tags, **ignorando `rule.enabled`** por completo; ese flag
solo se consulta cuando no se pasa ningún tag. El `tagExclude` por defecto
es `['experimental']`, y `target-size` no lleva ese tag. `target-size.json`
declara `tags: ['cat.sensory-and-visual-cues', 'wcag22aa', 'wcag258']` — de
las 5 etiquetas del contrato, solo `wcag22aa` aparece ahí. **Conclusión
verificada a nivel de código**: `withTags([...5 etiquetas])` activa
`target-size` por sí solo; `.options()` no hace falta para nada del
contrato.

## 5. Incompatibilidades / sorpresas reales

- **`waitForLoadState('networkidle')` está oficialmente desaconsejado**
  (*"DISCOURAGED... rely on web assertions instead"*), por su propensión a
  timeouts impredecibles. Varios escenarios (@s27, @s32) piden "esperar a
  que la red quede en reposo" — con `retries: 0` a propósito, un
  `networkidle` flaky es peligroso: mejor esperar una condición concreta
  donde sea posible.
- `package.json` ya tiene `"type": "module"` — el patrón `__dirname` (común
  en configs de ejemplo) rompe en ESM; usar `fileURLToPath(new URL(...))`,
  igual que ya hace `vite.config.ts`.
- No se encontró ninguna incompatibilidad documentada específica entre
  Playwright 1.62.1 y Vite 8.2.1.

## 6. Lo que NO se pudo verificar

- Tamaño en disco exacto de `chromium --only-shell` en esta máquina.
- Si hay alguna regla de axe-core fuera de las 5 etiquetas que el contrato
  pudiera necesitar (no se encontró ninguna candidata, pero no es una lista
  exhaustiva regla por regla).
- Fecha de publicación exacta de Playwright 1.62.1 (el registro npm no
  expuso el campo `time` por versión).

---

## Snippets verificados

**1. `playwright.config.ts`:**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  retries: 0, // a propósito — Decisión 38 / @s48
  webServer: {
    command: 'pnpm build && vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  use: {
    baseURL: 'http://localhost:4173',
    ...devices['Desktop Chrome'],
  },
})
```

**2. `AxeBuilder` con las 5 etiquetas, sin `.options()`:**

```ts
import { AxeBuilder } from '@axe-core/playwright'

const resultados = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze()

// resultados.violations se mapea hacia ejecutarPuertaDeAnalisisAutomatico()
// (src/lib/accesibilidad-analisis.ts), no se compara a pelo.
```

**3. Reduced motion** (propiedad `reducedMotion` disponible desde v1.50):

```ts
test.use({ reducedMotion: 'reduce' })
// o por página:
await page.emulateMedia({ reducedMotion: 'reduce' })
```

**4. `getComputedStyle` / fuentes cargadas:**

```ts
await page.evaluate(() => document.fonts.ready)
const familiaBody = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
const cargada = await page.evaluate(() => document.fonts.check('16px "DM Sans"'))
```

**5. Peticiones de red por dominio / código de estado:**

```ts
const respuestas: { url: string; status: number }[] = []
page.on('response', (r) => respuestas.push({ url: r.url(), status: r.status() }))
await page.goto('/')
await page.waitForLoadState('domcontentloaded') // preferible a networkidle cuando se pueda acotar
```

**6. Viewport 320px:**

```ts
await page.setViewportSize({ width: 320, height: 640 })
```

**7. Tabulación y foco no tapado:**

```ts
await page.keyboard.press('Tab')
const activo = page.locator(':focus')
const caja = await activo.boundingBox()
```

**8. Forzar variante de paleta antes de pintar:**

```ts
await page.addInitScript((variante) => {
  window.localStorage.setItem('galapavet-variante', variante)
}, 'noche')
await page.goto('/')
```

Ficheros reales consultados por el agente de investigación: `package.json`,
`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`,
`harness.config.json`, `index.html`, `src/components/SelectorPaleta-logica.ts`,
`src/components/SelectorPaleta.tsx`, `src/lib/accesibilidad-analisis.ts`,
`features/identidad_visual.feature` (953 líneas completas),
`progress/plan_adaptacion_scss.md` (secciones 4.3, 4.4 y 5). No se instaló
ni modificó nada dentro del repo real durante la investigación.
