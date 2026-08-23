# Investigación técnica para la feature 22 (capa visual)

> Agente: `Explore` (investigación en documentación oficial).
> Fecha: 2026-08-23. Máquina: Windows 11 Home 10.0.26200, Node v22.15.0, pnpm 10.21.0.
> Regla aplicada: **cada afirmación lleva su origen** — URL oficial, `fichero:línea` de
> este repo, o el comando ejecutado y su salida real. Lo que no se pudo confirmar va
> marcado como **NO VERIFICADO**.

## Versiones reales de este repo (verificadas, no recordadas)

`pnpm ls --depth 0`, ejecutado hoy:

```
axe-core 4.13.0 · typescript 6.0.3 · vite 8.2.1 · vitest 4.1.10
```

Y de `package.json:19-42`: react 19.2.8, react-router 8.3.0, sass-embedded 1.102.0,
oxlint 1.78.0, @stryker-mutator/core 10, jsdom 30.0.1, `engines.node: ^20.19.0 || >=22.12.0`.

---

## 1. Playwright junto a Vitest en el mismo repo

### 1.1 Versión y qué se instala

| Paquete | Versión actual | Origen |
|---|---|---|
| `@playwright/test` | **1.62.1** | `https://registry.npmjs.org/@playwright/test/latest` (consultado hoy) |
| `playwright` (dep transitiva) | 1.62.1 | mismo endpoint, campo `dependencies` |
| `@axe-core/playwright` | **4.13.0** | `https://registry.npmjs.org/@axe-core/playwright/latest` |

`@playwright/test@1.62.1` declara `engines.node: ">=20"` y licencia Apache-2.0.
Verificado descargando y abriendo el tarball real, no la metadata del registro:

```
curl -sL registry.npmjs.org/@playwright/test/-/test-1.62.1.tgz | tar xz package/package.json
→ scripts: {}          engines: {"node":">=20"}     deps: {"playwright":"1.62.1"}
curl -sL registry.npmjs.org/playwright/-/playwright-1.62.1.tgz | tar xz package/package.json
→ scripts: undefined   engines: {"node":">=20"}
```

**Hallazgo importante y específico de este repo:** `playwright@1.62.1` **no tiene ningún
script de instalación** (`scripts` ni siquiera existe en su `package.json`). Consecuencias:

1. `pnpm add -D @playwright/test` **no descarga navegadores**. Hay que ejecutar
   explícitamente `pnpm exec playwright install chromium`.
2. La puerta de pnpm 10 sobre scripts de build (`pnpm-workspace.yaml:11-12`,
   `ignoredBuiltDependencies`) **no aplica** a Playwright. No hay que añadir nada a
   `onlyBuiltDependencies`, y no aparecerá el aviso recurrente que ese fichero se
   preocupa de evitar.

### 1.2 Navegadores: comandos, ubicación y peso

Documentación oficial: https://playwright.dev/docs/browsers

- Instalar solo Chromium: `npx playwright install chromium`
- Instalar **solo el shell headless** (sin el Chromium completo, que solo sirve para modo
  headed): `npx playwright install --only-shell` — cita literal del doc: *"if you are only
  running tests in headless shell you can avoid downloading the full Chromium browser by
  passing `--only-shell` during installation"*.
- Ubicación en Windows: `%USERPROFILE%\AppData\Local\ms-playwright`
- Listar: `npx playwright install --list` · Desinstalar: `npx playwright uninstall [--all]`
- Reubicar: `PLAYWRIGHT_BROWSERS_PATH=<ruta>`; `PLAYWRIGHT_BROWSERS_PATH=0` lo instala
  dentro de `node_modules` (hermético).
- El doc solo dice *"These browsers will take a few hundred megabytes of disk space when
  installed"* y muestra un ejemplo de ~281 MB Chromium / 187 MB Firefox / 180 MB WebKit.

**Medición real en ESTA máquina** (`du -sm %USERPROFILE%/AppData/Local/ms-playwright/*`):

```
416 MB  chromium-1228
  4 MB  ffmpeg-1011
  1 MB  winldd-1007
420 MB  TOTAL
```

Ya existe una caché de Playwright aquí (revisión 1228, dejada por otra herramienta).
Playwright 1.62.1 pide la revisión **1234** de chromium y chromium-headless-shell
(leído de `playwright-core@1.62.1/browsers.json`), así que descargará una nueva y
recolectará la vieja automáticamente (*"Playwright automatically removes unused browser
versions"*, doc oficial).

Tamaño del `.zip` de descarga: solo se pudo medir el de ffmpeg,
**1 411 741 bytes**, con `curl -sIL` contra `cdn.playwright.dev`. El de chromium y el del
headless-shell **NO VERIFICADO**: la pasarela de Microsoft
(`playwright.download.prss.microsoft.com`) responde `400 GatewayServiceFileDetails Response
is not in success state` a peticiones `HEAD` y a rangos `Range: 0-0`, así que no se puede
leer su `Content-Length` sin bajar el fichero entero. La cifra fiable disponible es la
medición en disco de arriba (416 MB para el Chromium completo).

**Recomendación de coste:** `--only-shell`. La verificación de esta feature es headless por
definición y el shell evita el Chromium completo.

### 1.3 `playwright.config.ts` contra `vite preview` (build de producción, no dev)

`webServer` es la pieza. Doc oficial: https://playwright.dev/docs/test-webserver

Propiedades relevantes, del doc:

| Propiedad | Significado |
|---|---|
| `command` | comando que arranca el servidor |
| `url` | endpoint que debe devolver 2xx/3xx/400/401/402/403 antes de empezar |
| `reuseExistingServer` | reutiliza uno ya levantado; recomendado `!process.env.CI` |
| `timeout` | ms de espera al arranque, **por defecto 60000** |
| `stdout` / `stderr` | `"pipe"` o `"ignore"` (defaults `"ignore"` / `"pipe"`) |
| `cwd`, `env`, `gracefulShutdown`, `name` | resto |
| `port` | **deprecado**, usar `url` |

Puerto por defecto de `vite preview`: **4173**. Doble verificación:
- https://vite.dev/config/preview-options → `preview.port` default `4173`.
- Código realmente instalado: `node_modules/.pnpm/vite@8.2.1_.../vite/dist/node/chunks/node.js:690`
  → `const DEFAULT_PREVIEW_PORT = 4173;` y línea 35683 → `port: preview?.port ?? 4173`.

Aviso literal del doc de la CLI (https://vite.dev/guide/cli): *"Locally preview the
production build. **Do not use this as a production server as it's not designed for it.**"*
Para verificación es exactamente lo que queremos: sirve `dist/`, sin HMR, sin transformación
en caliente, con el CSS ya extraído y minificado — es decir, mide lo que el visitante recibe.

Configuración recomendada (el `command` incluye el `build` para que nunca se mida un `dist/`
rancio, y `strictPort` para que no se cuele otro puerto):

```ts
webServer: {
  command: 'pnpm run build && pnpm exec vite preview --port 4173 --strictPort',
  url: 'http://127.0.0.1:4173/',
  reuseExistingServer: !process.env.CI,
  timeout: 180_000,   // el build entero cabe holgado; el default de 60 s puede no bastar
  stdout: 'ignore',
  stderr: 'pipe',
}
```

### 1.4 Cómo se separan Vitest y Playwright — VERIFICADO EJECUTÁNDOLO

La separación **ya está resuelta por construcción** gracias a cómo está escrito
`vite.config.ts` hoy. No hace falta tocar `test.exclude`.

**Lado Vitest.** `vite.config.ts:44` declara
`include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)']` — anclado a `src/`. El default de
Vitest 4.1.10 sería `**/*.{test,spec}...`, que sí barrería todo el repo; este repo ya lo
tiene acotado. Defaults leídos del código realmente instalado,
`node_modules/vitest/dist/chunks/defaults.9aQKnqFk.js:5-6`:

```js
const defaultInclude = ["**/*.{test,spec}.?(c|m)[jt]s?(x)"];
const defaultExclude = ["**/node_modules/**", "**/.git/**"];
```

(Ojo: en Vitest 4 el `exclude` por defecto es solo esas dos entradas, mucho más corto que en
Vitest 1/2. No hay ninguna exclusión de `tests/` regalada.)

**Lado Playwright.** `testDir` *"Defaults to the directory of the configuration file"* y
`testMatch` por defecto es `**/*.@(spec|test).?(c|m)[jt]s?(x)`
(https://playwright.dev/docs/api/class-testconfig). Fijando `testDir: './tests/e2e'`,
Playwright no mira `src/` jamás.

**Comprobación empírica hecha hoy.** Creé `tests/e2e/humo.spec.ts` (import de
`@playwright/test` + `AxeBuilder`, que ni siquiera están instalados) y ejecuté:

```
pnpm exec vitest list --run | grep -c humo   →  0   (Vitest NO lo recoge)
pnpm run typecheck  (tsc -b)                 →  EXIT=0
pnpm exec oxlint --deny-warnings tests/e2e/  →  EXIT=0, sin diagnósticos
```

Tres conclusiones, todas medidas:
1. Vitest no lo recoge. La separación por directorio funciona sin tocar `exclude`.
2. `tsc -b` pasa **a pesar de que el import no resuelve** → `tests/` está hoy fuera del
   typecheck. Es la buena noticia (no rompe) y a la vez el agujero (el código e2e quedaría
   sin verificar). Ver 1.5.
3. oxlint no da falsos positivos, ni siquiera con el plugin `vitest` activo
   (`.oxlintrc.json:2`). Era un riesgo real —`no-console` es `error` y el plugin `vitest`
   podría haber disparado `expect-expect` sobre `test()` de Playwright— y no se materializa.

**Riesgo residual:** el binario `playwright test` corre en cuanto se ejecuta, y `stryker`
usa `vitest` como runner (`stryker.config.json:5`); ninguno de los dos toca al otro.

### 1.5 Encaje con `tsc -b`

Estructura actual: `tsconfig.json` es un fichero de referencias vacío
(`files: []`, referencias a `tsconfig.app.json` y `tsconfig.node.json`).
`tsconfig.app.json` incluye `["src"]`; `tsconfig.node.json` incluye `["vite.config.ts"]`.
Por tanto `playwright.config.ts` y `tests/e2e/**` no los cubre nadie — demostrado arriba
con EXIT=0 sobre un import roto.

Doc oficial (https://playwright.dev/docs/test-typescript): *"Playwright does not check the
types and will run tests even if there are non-critical TypeScript compilation errors"* y
*"Playwright **only supports** the following tsconfig options: `allowJs`, `baseUrl`,
`paths`, `references` and `extends`"*. Es decir, **el typecheck del e2e es responsabilidad
nuestra**, no de Playwright, y hay que dárselo a `tsc -b` a mano.

Solución: un **tercer proyecto** `tsconfig.e2e.json`, referenciado desde `tsconfig.json`.
Debe ser un proyecto separado y no ampliar `tsconfig.app.json`, por una razón concreta:
`tsconfig.app.json:6` declara `"types": ["vite/client","vitest/globals","@testing-library/jest-dom"]`,
y `vitest/globals` inyecta `test`/`expect`/`describe` **globales** que colisionarían
conceptualmente con los `test`/`expect` **importados** de `@playwright/test`. Separar los
proyectos elimina el problema de raíz.

```jsonc
// tsconfig.e2e.json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.e2e.tsbuildinfo",
    "target": "es2023",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "types": ["node"],              // NO vitest/globals: aquí test/expect se importan
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["tests/e2e", "playwright.config.ts"]
}
```
y añadir `{ "path": "./tsconfig.e2e.json" }` a las `references` de `tsconfig.json`.
`lib` necesita `DOM` porque los `page.evaluate()` ejecutan código de navegador.

### 1.6 Headless y determinista

- `headless` es el **valor por defecto** de Playwright; no hay que declararlo.
- Viewport por defecto **1280×720**, `deviceScaleFactor` 1, `colorScheme` `'light'`,
  `locale` `'en-US'` (https://playwright.dev/docs/api/class-testoptions). Para este sitio
  hay que fijar `locale: 'es-ES'` explícitamente: la web es `<html lang="es-ES">`
  (`index.html:2`) y el locale del navegador afecta a formatos y a algún check de axe.
- Fijar viewport: en `use` del config, o `test.use({ viewport: { width, height } })` por
  fichero. Importante del doc de emulación: *"`viewport` should be defined after
  destructuring devices since devices already specify viewport dimensions"* — o sea, el
  spread de `devices[...]` va primero.
- `reducedMotion`: *"Emulates prefers-reduced-motion media feature, supported values are
  `'reduce'` and `'no-preference'`. Passing `null` resets emulation to system defaults."*
  Esto permite **verificar de verdad** la promesa de `prefers-reduced-motion` del repo
  (`src/lib/accesibilidad-movimiento.ts`, `src/lib/diseno/movimientoRespetuoso.ts`) en un
  navegador real, cosa que jsdom no puede hacer.
- Anti-flaky, del doc de buenas prácticas (https://playwright.dev/docs/best-practices):
  aserciones web-first (*"Playwright will wait until the expected condition is met"*),
  nada de `isVisible()` a pelo (*"the test won't wait a single second"*), nada de
  `waitForTimeout`, localizadores por rol, y aislamiento total entre tests.
- **`retries: 0`.** Aquí discrepo del default recomendado por Playwright para CI (`retries: 2`):
  el contrato de este repo es «0 fallos, 0 errores, 0 warnings». Un reintento convierte un
  test inestable en verde y esconde exactamente lo que esta feature existe para destapar.
  Si un e2e parpadea, se arregla el test, no se reintenta.
- `forbidOnly: !!process.env.CI` y `fullyParallel: true` son seguros: cada test abre su
  propio contexto de navegador aislado.
- **Determinismo real:** todo se mide contra `dist/`, que es un artefacto fijo, y contra un
  único proyecto Chromium. Sin animaciones pendientes al medir → usar
  `await expect(locator).toBeVisible()` antes de cualquier `boundingBox()`.

### 1.7 Config completa propuesta

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

const PUERTO = 4173
const BASE = `http://127.0.0.1:${PUERTO}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,                       // ver 1.6: un reintento esconde el fallo que buscamos
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]]
                           : [['list'], ['html', { open: 'never' }]],
  outputDir: './reports/e2e',       // ya está en .gitignore (reports/)
  use: {
    baseURL: BASE,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'movil',      use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `pnpm run build && pnpm exec vite preview --port ${PUERTO} --strictPort`,
    url: `${BASE}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
```

`outputDir` apunta a `reports/`, que `.gitignore:15` ya ignora — así los trazos y capturas
no se versionan nunca. `playwright-report/` y `test-results/` (defaults) habría que añadirlos
al `.gitignore`; apuntando a `reports/` no hace falta.

---

## 2. axe-core dentro de Playwright

### 2.1 Paquete y uso

`@axe-core/playwright@4.13.0`, con `dependencies: { "axe-core": "~4.13.0" }` y
`peerDependencies: { "playwright-core": ">= 1.0.0" }`. **Encaja exacto con el `axe-core
4.13.0` que este repo ya tiene instalado** (`package.json:32`), así que no habrá dos
versiones de axe-core en el árbol.

Ejemplo oficial (https://playwright.dev/docs/accessibility-testing), literal:

```js
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('homepage', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('https://your-site.com/');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

API de `AxeBuilder` (README oficial del paquete, dequelabs/axe-core-npm):
`include(sel)`, `exclude(sel)`, `withTags(tags)`, `withRules(ids)`, `disableRules(ids)`,
`options(opts)`, `setLegacyMode()`, `analyze()`.

Adjuntar el informe al reporte de Playwright, del doc oficial:

```js
await testInfo.attach('accessibility-scan-results', {
  body: JSON.stringify(accessibilityScanResults, null, 2),
  contentType: 'application/json'
});
```

### 2.2 Pedir WCAG 2.2 AA — y el detalle que casi todo el mundo falla

La etiqueta de WCAG 2.2 nivel AA en axe-core es **`wcag22aa`**. Verificado enumerando las
etiquetas del `axe-core@4.13.0` realmente instalado: aparece `wcag22aa` y `wcag258`.

**El detalle crítico:** en axe-core 4.13.0 la regla `target-size` viene **DESACTIVADA por
defecto**. Salida real de `axe.getRules()` sobre el paquete instalado:

```json
{"ruleId":"target-size",
 "description":"Ensure touch targets have sufficient size and space",
 "help":"All touch targets must be 24px large, or leave sufficient space",
 "tags":["cat.sensory-and-visual-cues","wcag22aa","wcag258"],
 "enabled":false}
```

La pregunta que decide el diseño de los tests es: ¿`withTags(['wcag22aa'])` la ejecuta
igualmente, o hay que activarla a mano? El doc de axe **no lo aclara**. Se resolvió de dos
formas independientes:

**(a) Leyendo el código fuente instalado.** `node_modules/.pnpm/axe-core@4.13.0/.../axe.js:20569`,
`ruleShouldRun()`, rama `runOnly.type === 'tag'` → llama a `matchTags(rule, values)`. Y
`matchTags` (misma fuente, línea 20541):

```js
var matching = include.some(function(tag) { return rule.tags.indexOf(tag) !== -1; });
if (matching || include.length === 0 && rule.enabled !== false) { ... }
```

`rule.enabled !== false` solo se consulta cuando `include.length === 0`. Si se pasan
etiquetas, **`matching` decide por sí solo y el flag `enabled: false` queda ignorado**.

**(b) Ejecutándolo.** Script real contra jsdom + axe-core 4.13.0:

```
runOnly {type:'tag', values:['wcag22aa']}  →  reglas seleccionadas: ["target-size"]
                                              incluye target-size?  true
axe.run(document, {})  (sin opciones)      →  incluye target-size?  false
```

**Conclusión verificada: `withTags(['wcag22aa'])` SÍ ejecuta `target-size`.** No hace falta
`.options({ rules: { 'target-size': { enabled: true } } })` — y de hecho conviene evitarlo,
porque el README de `@axe-core/playwright` dice de `options()`: *"Will override any other
configured options"*, o sea que mezclar `withTags()` con `options()` puede anular las
etiquetas. **NO VERIFICADO** si en 4.13.0 el override es total o parcial; como no hace falta
usar `options()`, la duda es irrelevante en la práctica.

Segundo detalle: `wcag22aa` **es la única etiqueta que trae `target-size`, y `target-size`
es la única regla con esa etiqueta** (por eso el experimento devolvió una lista de un solo
elemento). Si se pasa `withTags(['wcag22aa'])` a secas se pierde todo lo demás. La lista
correcta es acumulativa:

```ts
const resultados = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
  .analyze()
expect(resultados.violations).toEqual([])
```

### 2.3 Qué añade esto sobre lo que el repo ya tiene

El repo ya calcula la matemática de WCAG en puro TypeScript y la muerde con mutación:
`src/lib/contraste.ts` (`calcularRatioContraste`, `esAptoParaUso`, `ejecutarPuertaDeContraste*`)
y `src/lib/accesibilidad-areaTactil.ts` (`AREA_TACTIL_MINIMA_PX = 24`, excepciones
«en línea» y «espaciado»). Eso demuestra que **las fórmulas son correctas**.
Lo que no puede demostrar es que **los píxeles pintados** cumplan esas fórmulas, porque
jsdom no hace layout. Playwright + axe cierra justo ese hueco: `target-size` mide cajas
reales y `color-contrast` (`wcag143`, habilitada por defecto) mide colores computados
reales. Son complementarios, no sustitutos — y la mutación sigue viviendo en `src/lib`,
donde `stryker.config.json:11-17` la tiene declarada.

---

## 3. Autoalojar Outfit y DM Sans

### 3.1 Origen legítimo y licencia — verificada, no asumida

**Ambas son SIL Open Font License 1.1.** Comprobado descargando los ficheros y leyendo el
`LICENSE` que viene dentro, no fiándome de un blog:

- **Outfit** — repositorio oficial `github.com/Outfitio/Outfit-Fonts`, con `OFL.txt` en la
  raíz. El `LICENSE` del paquete npm dice literalmente:
  `Copyright 2021 The Outfit Project Authors (https://github.com/Outfitio/Outfit-Fonts)` /
  `This Font Software is licensed under the SIL Open Font License, Version 1.1.`
  Su `metadata.json` declara `"license": {"type":"OFL-1.1","url":"https://openfontlicense.org"}`.
- **DM Sans** — repositorio oficial `github.com/googlefonts/dm-fonts`, encargada a Colophon
  Foundry, también OFL. El paquete npm declara `license: OFL-1.1`.

La OFL **permite explícitamente redistribuir** el fichero de fuente junto con la web (lo que
prohíbe es venderla suelta). Autoalojar es un uso previsto de la licencia. Esto satisface la
Decisión 9 del spec: **cero peticiones a `fonts.googleapis.com` / `fonts.gstatic.com`**, es
decir cero fuga de IP del visitante a un tercero.

**De dónde bajar los `.woff2` ya subseteados.** Los repos de arriba publican TTF/variable
TTF, no `woff2` con `unicode-range`. La vía limpia es **Fontsource**, que empaqueta en npm
exactamente los mismos ficheros que sirve Google Fonts, con la misma OFL, y que se instala
como devDependency (o se descarga una vez y se copia a `public/`):

| Paquete | Versión | `license` declarada |
|---|---|---|
| `@fontsource-variable/outfit` | 5.3.0 | `OFL-1.1` |
| `@fontsource-variable/dm-sans` | 5.3.0 | `OFL-1.1` |
| `@fontsource/outfit` (estáticas) | 5.3.0 | `OFL-1.1` |
| `@fontsource/dm-sans` (estáticas) | 5.3.0 | `OFL-1.1` |

### 3.2 Peso REAL de los subconjuntos (medido, `find -printf %s`)

**Variables (todo el rango de pesos en un fichero):**

| Fichero | bytes |
|---|---|
| `outfit-latin-wght-normal.woff2` | **32 292** |
| `outfit-latin-ext-wght-normal.woff2` | 14 808 |
| `dm-sans-latin-wght-normal.woff2` | **36 932** |
| `dm-sans-latin-ext-wght-normal.woff2` | 18 228 |

**Estáticas, subconjunto latin, un peso por fichero:**

| Peso | Outfit | DM Sans |
|---|---|---|
| 100 | 13 184 | 14 220 |
| 200 | 13 956 | 14 476 |
| 300 | 13 956 | 13 708 |
| 400 | 14 032 | 14 200 |
| 500 | 13 528 | 14 304 |
| 600 | 14 140 | 14 144 |
| 700 | 14 060 | 14 348 |
| 800 | 14 048 | 14 404 |
| 900 | 13 500 | 14 232 |

**El cálculo que decide:** con tres pesos estáticos de Outfit (400+600+700) son
14 032+14 140+14 060 = **42 232 B**, frente a **32 292 B** de la variable que trae los nueve.
Con tres de DM Sans (400+500+700) son 42 852 B frente a 36 932 B. **La variable gana ya a
partir de tres pesos**, y además regala los intermedios para la jerarquía tipográfica.

**Total propuesto: 32 292 + 36 932 = 69 224 B ≈ 68 KB** para toda la tipografía del sitio.

### 3.3 `unicode-range`: el subconjunto `latin` BASTA para español

`unicode-range` real del subconjunto latin (copiado de `index.css` de Fontsource, idéntico
en ambas familias):

```
U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
U+2212, U+2215, U+FEFF, U+FFFD
```

Comprobado por script contra el repertorio que esta web necesita:

```
probados: áéíóúÁÉÍÓÚñÑüÜ¿?¡!«»·—–…“”‘’€ºªçÇ
NO cubiertos por el subconjunto latin: ninguno
```

`ñ`=U+00F1, `Ñ`=U+00D1, `¿`=U+00BF, `¡`=U+00A1, `«»`=U+00AB/00BB, `·`=U+00B7 (el que usa el
`<title>` en `index.html:6`) están todos dentro de U+0000-00FF; los tipográficos (— – … “ ” ‘ ’)
dentro de U+2000-206F; el euro en U+20AC.

**Por tanto NO hay que descargar ni servir `latin-ext`.** Ahorra 14 808 + 18 228 = 33 036 B
de peso muerto. Aun así **hay que declarar el `unicode-range`** en el `@font-face`: sin él el
navegador descarga la fuente aunque la página no use ningún glifo suyo.

### 3.4 `font-display`

Valores oficiales (https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/font-display):

| Valor | Periodo de bloqueo | Periodo de intercambio |
|---|---|---|
| `block` | corto | infinito |
| `swap` | extremadamente corto | infinito |
| `fallback` | extremadamente corto | corto |
| `optional` | extremadamente corto | ninguno |

Durante el *block period* el texto se pinta **invisible**; durante el *swap period* se pinta
con la fuente de respaldo y se cambia al llegar la buena.

**Recomendación: `font-display: swap`** (que es lo que ya trae Fontsource) **combinado con
la `@font-face` de respaldo con métricas ajustadas de 3.5**. `swap` garantiza que el texto
sea legible desde el primer pintado —nunca invisible—, y el ajuste de métricas neutraliza su
único defecto, que es el salto de layout al cambiar de fuente. `optional` evitaría el salto
pero a costa de que en una conexión lenta la fuente de marca sencillamente no se use;
para una web de clínica que se ve una vez, eso significa que muchos visitantes nunca verían
la tipografía de marca.

### 3.5 Evitar el CLS con `size-adjust` y overrides — valores CALCULADOS, no a ojo

`size-adjust` (https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust):
*"All metrics associated with this font are scaled by the given percentage. This includes
glyph advances, baseline tables, and overrides provided by `@font-face` descriptors."*
Valor inicial `100%`. Baseline widely available desde septiembre de 2023.

La técnica: declarar una **familia de respaldo sintética** que apunta a una fuente local
(`local('Arial')`) pero con `size-adjust` + `ascent-override` + `descent-override` +
`line-gap-override` retocados para que ocupe **exactamente** el mismo espacio que la fuente
web. Así el intercambio de `swap` no mueve un solo píxel → CLS 0.

Métricas reales de las tres fuentes, leídas de `@capsizecss/metrics@4.2.0` (que las extrae
de las tablas `head`/`OS/2`/`hhea` de los ficheros reales):

| Fuente | unitsPerEm | ascent | descent | lineGap | capHeight | xHeight | xWidthAvg |
|---|---|---|---|---|---|---|---|
| Outfit | 1000 | 1000 | −260 | 0 | 694 | 475 | 445 |
| DM Sans | 1000 | 992 | −310 | 0 | 700 | 504 | 466 |
| Arial | 2048 | 1854 | −434 | 67 | 1467 | 1062 | 913 |

Fórmula oficial (leída del código de `@capsizecss/core@4.1.3`, `dist/index.mjs:113-124`):

```
sizeAdjust       = (xWidthAvg_web / upm_web) / (xWidthAvg_fallback / upm_fallback)
adjustedEmSquare = upm_web * sizeAdjust
ascentOverride   = ascent_web    / adjustedEmSquare
descentOverride  = |descent_web| / adjustedEmSquare
lineGapOverride  = lineGap_web   / adjustedEmSquare
```

**Resultado de ejecutar `createFontStack()` de verdad** (no de estimarlo):

```css
/* pila: Outfit, "Outfit Fallback", Arial */
@font-face {
  font-family: "Outfit Fallback";
  src: local('Arial'), local('ArialMT');
  ascent-override: 100.18%;
  descent-override: 26.0468%;
  line-gap-override: 0%;
  size-adjust: 99.8204%;
}

/* pila: "DM Sans", "DM Sans Fallback", Arial */
@font-face {
  font-family: "DM Sans Fallback";
  src: local('Arial'), local('ArialMT');
  ascent-override: 94.9001%;
  descent-override: 29.6563%;
  line-gap-override: 0%;
  size-adjust: 104.531%;
}
```

**Estos valores se calculan UNA VEZ (ya están calculados, arriba) y se escriben a mano en el
SCSS.** `@capsizecss/*` **no debe** entrar como dependencia del proyecto: se usó aquí como
herramienta de investigación, su salida es estática y una dependencia más es superficie que
mantener. Se documenta en el propio SCSS de dónde salen los números.

### 3.6 Servir desde `public/` en Vite 8 y precargar

Doc oficial (https://vite.dev/guide/assets): los ficheros de `public/` *"are served at root
path `/` during dev, and copied to the root of the dist directory as-is"*, **nunca llevan
hash ni se procesan**, y se referencian con **ruta absoluta desde la raíz**. Configurable con
`publicDir`. Hoy `public/` **no existe** en este repo (`ls public` → *No such file or
directory*), lo que explica los ~20 404 diagnosticados.

Layout propuesto: `public/fuentes/outfit-latin-wght-normal.woff2` y
`public/fuentes/dm-sans-latin-wght-normal.woff2`, referenciados como
`url('/fuentes/outfit-latin-wght-normal.woff2')`.

Matiz honesto: el propio doc de Vite recomienda *"prefer importing assets unless you
specifically need the guarantees provided by the `public` directory"*. Aquí **sí** queremos
esa garantía: nombre estable y ruta conocida, porque el `<link rel="preload">` va escrito a
mano en `index.html`, que no pasa por el grafo del bundler para esa URL.

Precarga (https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/rel/preload):

```html
<link rel="preload" href="/fuentes/outfit-latin-wght-normal.woff2"  as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/fuentes/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin />
```

`crossorigin` es **obligatorio aunque el fichero sea del mismo origen**. Cita literal del
doc: *"The attribute needs to be set to match the resource's CORS and credentials mode,
**even when the fetch is not cross-origin**"*, porque las fuentes se piden siempre en modo
CORS anónimo (CSS Fonts, *font fetching requirements*). Sin `crossorigin` el navegador
descarga el fichero **dos veces** y la precarga no sirve de nada.

El doc también avisa contra precargar de más (*"specifying preloading for multiple types of
the same resource is discouraged"*). Dos ficheros —una familia de titulares y una de
texto, ambas usadas above the fold— es el número correcto. No precargar `latin-ext`
(no se sirve) ni las cursivas.

### 3.7 `@font-face` completo propuesto

```scss
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 100 900;           // variable: un fichero, todo el rango
  font-display: swap;
  src: url('/fuentes/outfit-latin-wght-normal.woff2') format('woff2-variations');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
                 U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122,
                 U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* + el mismo bloque para 'DM Sans' con font-weight: 100 1000 */
/* + las dos @font-face de respaldo de 3.5 */

--tipo-titulares: 'Outfit', 'Outfit Fallback', Arial, sans-serif;
--tipo-texto:     'DM Sans', 'DM Sans Fallback', Arial, sans-serif;
```

Nota: el `font-weight` del bloque variable es `100 900` para Outfit y `100 1000` para DM Sans
— rangos leídos del `index.css` real de cada paquete, no inventados.

---

## 4. WCAG 2.2 AA: los criterios que hoy no se pueden verificar

### 4.1 SC 2.5.8 Target Size (Minimum) — nivel AA

https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

Texto normativo: *"The size of the target for pointer inputs is at least **24 by 24 CSS
pixels**, except when:"* — y las cinco excepciones, literales:

1. **Spacing:** *"Undersized targets (those less than 24 by 24 CSS pixels) are positioned so
   that if a 24 CSS pixel diameter circle is centered on the bounding box of each, the
   circles do not intersect another target or the circle for another undersized target"*
2. **Equivalent:** *"The function can be achieved through a different control on the same
   page that meets this criterion"*
3. **Inline:** *"The target is in a sentence or its size is otherwise constrained by the
   line-height of non-target text"*
4. **User Agent Control:** *"The size of the target is determined by the user agent and is
   not modified by the author"*
5. **Essential:** *"A particular presentation of the target is essential or is legally
   required for the information being conveyed"*

El círculo de la excepción de espaciado tiene **24 px de diámetro** y se centra **en el
bounding box** del control, no en su centro visual.

Esto ya está modelado en `src/lib/accesibilidad-areaTactil.ts` (`AREA_TACTIL_MINIMA_PX = 24`,
excepciones «en línea» y «espaciado») — pero contra un inventario declarado a mano. axe
`target-size` lo mide sobre cajas reales.

### 4.2 SC 1.4.3 Contrast (Minimum) — nivel AA

https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

*"The visual presentation of text and images of text has a contrast ratio of at least
**4.5:1**"*, salvo:
- **Large Text:** *"Large-scale text and images of large-scale text have a contrast ratio of
  at least **3:1**"*, siendo grande *"at least 18 point or 14 point bold"*.
- **Incidental:** texto de componente inactivo, decoración pura, invisible, o parte de una
  imagen con otro contenido visual relevante → sin requisito.
- **Logotypes:** *"Text that is part of a logo or brand name has no contrast requirement."*

Conversión oficial, literal: *"The ratio between sizes in points and CSS pixels is
1pt = 1.333px, therefore 14pt and 18pt are equivalent to approximately 18.5px and 24px."*
Cuadra con `src/lib/contraste.ts:153-154` (`TAMANO_TEXTO_GRANDE_PX = 24`,
`TAMANO_TEXTO_GRANDE_NEGRITA_PX = 18.66`). Los umbrales del repo son correctos.

Regla de axe: `color-contrast`, tags `["cat.color","wcag2aa","wcag143",...]`, **habilitada
por defecto**.

**La excepción de logotipos importa aquí:** el morado de marca #77286B puede usarse en el
logo sin cumplir 4.5:1, pero **no** como color de texto corrido. Es exactamente la distinción
que la matriz de `src/lib/tokens.ts` (`catalogoDeContraste`) debe seguir respetando cuando se
añadan roles nuevos.

### 4.3 SC 1.4.11 Non-text Contrast — nivel AA

https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html

*"The visual presentation of the following have a contrast ratio of at least **3:1** against
adjacent color(s): **User Interface Components** — Visual information required to identify
user interface components and states, except for inactive components or where the appearance
of the component is determined by the user agent and not modified by the author;
**Graphical Objects** — Parts of graphics required to understand the content, except when a
particular presentation of graphics is essential to the information being conveyed."*

Sobre el foco: *"In combination with 2.4.7 Focus Visible, the visual focus indicator for a
component must have sufficient contrast against the adjacent background when the component is
focused"*.

Sobre bordes, matiz que ahorra trabajo: *"This success criterion does not require that
controls have a visual boundary indicating the hit area. If a control has visible content
(such as text or a sufficiently contrasting icon)... a border or other indication of the
overall boundary of the hit area is not required."* Pero si **no** hay otro indicador
visual, entonces *"the boundary must have sufficient non-text contrast"*.

**Consecuencia de diseño:** todo rol de color nuevo que sea borde de tarjeta, borde de input,
icono informativo, separador con significado o el propio `--color-foco` debe pasar por
`esAptoParaUso(ratio, 'componente de interfaz o borde de foco')` de `src/lib/contraste.ts:90`
con umbral 3:1. Los separadores puramente decorativos, no.

### 4.4 SC 2.4.11 Focus Not Obscured (Minimum) — nivel AA. **El crítico aquí.**

https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html

*"When a user interface component receives keyboard focus, the component is not **entirely**
hidden due to author-created content."*

El propio documento nombra el escenario de este sitio: *"Typical types of content that can
overlap focused items are sticky footers, **sticky headers**, and non-modal dialogs."*

Técnica suficiente oficial: **C43: Using CSS scroll-padding to un-obscure content**
(https://www.w3.org/WAI/WCAG22/Techniques/css/C43) — *"content in the viewport scrolls up to
always display the item with keyboard focus using scroll padding"*.

Este sitio tiene cabecera fija (`src/components/Cabecera.tsx`). Sin `scroll-padding-top`, al
tabular hacia abajo y volver a subir, el elemento enfocado **puede quedar completamente
tapado** por la cabecera → incumplimiento AA directo. Es el criterio que hoy es
literalmente inverificable en jsdom (no hay scroll, no hay layout, no hay sticky) y que un
test de Playwright sí puede comprobar: enfocar cada elemento tabulable y comprobar que su
`boundingBox()` no queda íntegramente por debajo del borde inferior de la cabecera.

**No hay regla de axe para 2.4.11.** Hay que escribirlo como test de Playwright a mano.

### 4.5 SC 2.4.13 Focus Appearance — **nivel AAA, no AA**

https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html

Corrección importante respecto al enunciado de la tarea: **2.4.13 es AAA**, no AA. El
equivalente obligatorio en AA es **2.4.7 Focus Visible** (nivel AA) más **1.4.11** para el
contraste del propio indicador.

Texto normativo de 2.4.13: *"When the keyboard focus indicator is visible, an area of the
focus indicator meets all the following: is at least as large as the area of a **2 CSS pixel
thick perimeter** of the unfocused component or sub-component, and has a **contrast ratio of
at least 3:1** between the same pixels in the focused and unfocused states."*
Excepción: *"The focus indicator is determined by the user agent and cannot be adjusted by
the author, or the focus indicator and the indicator's background color are not modified by
the author."*

Recomendación: **cumplirlo igualmente**, aunque sea AAA. Sale casi gratis
(`outline: 2px solid var(--color-foco); outline-offset: 2px`), y este repo ya declara
`outline: $grosor-foco solid var(--color-foco)` en `src/styles/_tokens.scss:123`. Solo hay
que asegurar que `$grosor-foco >= 2px` y que `--color-foco` pasa 3:1 contra **ambos**
fondos adyacentes (el del componente y el de la página) — no solo contra uno.

Y anotarlo como AAA en el spec, no venderlo como AA.

---

## 5. Reset CSS moderno (2026)

Diagnóstico de partida: **0 reglas para `html` o `body` en todo el CSS de `dist/`**.
La UA stylesheet manda sin oposición. Regla por regla, con su porqué y su fuente:

### 5.1 `box-sizing: border-box` en todo

```css
*, *::before, *::after { box-sizing: border-box; }
```

Por defecto es `content-box` (valor inicial del estándar CSS): `width` aplica **solo al
contenido** y el padding y el borde **se suman**. MDN: *"It is often useful to set
`box-sizing` to `border-box` to lay out elements. This makes dealing with the sizes of
elements much easier, and generally eliminates a number of pitfalls."* Con `content-box`,
cuatro cajas al 25% con cualquier padding desbordan el contenedor. Sin esta regla, todo el
sistema de espaciado (`src/lib/diseno/escalaEspaciado.ts`) miente.

### 5.2 Márgenes: `body { margin: 0 }` y márgenes de bloque a 0

El margen de 8px del `body` **es la UA stylesheet**, confirmado en la especificación HTML
(https://html.spec.whatwg.org/multipage/rendering.html): *"a default value of **8px** is
expected to be used for that property"*. Es la causa directa del margen espurio medido en
`dist/`.

La misma sección da los márgenes por defecto de los bloques de texto:
`h1 { margin-block: 0.67em; font-size: 2.00em }`, `h2 { 0.83em / 1.50em }`,
`h3 { 1.00em / 1.17em }`, `h4 { 1.33em / 1.00em }`, `h5 { 1.67em / 0.83em }`,
`h6 { 2.33em / 0.67em }`, `p { margin-block: 1em }`,
`blockquote { margin-block: 1em; margin-inline: 40px }`.

Son márgenes **en `em`**, o sea que cambian con el tamaño de fuente y colapsan entre sí:
imposible construir un ritmo vertical predecible encima de ellos. Se ponen a 0 y el ritmo lo
gobierna la escala de espaciado del repo.

```css
body { margin: 0; }
h1,h2,h3,h4,h5,h6, p, blockquote, figure, dl, dd { margin-block: 0; }
blockquote, figure { margin-inline: 0; }
```

### 5.3 Los controles de formulario NO heredan la fuente

La spec de rendering resetea explícitamente `letter-spacing`, `word-spacing`,
`line-height`, `text-transform` y `text-indent` a `initial` en `input, button, textarea,
select`, y la familia tipográfica de los controles la fija el sistema operativo. Sin esto,
**los botones y los campos del formulario de contacto seguirían sin usar DM Sans aunque el
`body` sí la use**:

```css
input, button, textarea, select { font: inherit; color: inherit; }
```

### 5.4 Imágenes y medios

```css
img, picture, video, canvas, svg { display: block; max-width: 100%; }
```

`display: block` mata el hueco fantasma bajo las imágenes (son `inline` por defecto y se
sientan en la línea base, dejando el descender como espacio). `max-width: 100%` evita el
desbordamiento horizontal. **Esto no sustituye a `width`/`height` en el `<img>`**: MDN es
explícita en que los atributos son lo que reserva el espacio y evita el CLS —
*"this aspect ratio is used to reserve the space needed to display the image, reducing or
even preventing a layout shift"*.

### 5.5 `text-wrap: balance` y `pretty`

https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap-style — **Baseline 2024**,
disponible desde octubre de 2024.

- `balance`: equilibra el número de caracteres por línea. Limitado por el navegador a
  **6 líneas o menos en Chromium, 10 o menos en Firefox**; por eso su coste es
  *"negligible"*. Es para **titulares**, donde evita la línea huérfana de una palabra.
- `pretty`: *"favors better typography over speed"*, minimiza huérfanas al final del
  párrafo. MDN avisa: *"Has a negative performance impact—use cautiously."*

```css
h1, h2, h3, h4, h5, h6, blockquote, figcaption { text-wrap: balance; }
p, li { text-wrap: pretty; }
```

Aplicar `pretty` a `body` entero, como se ve por ahí, es justo lo que MDN desaconseja.

### 5.6 `-webkit-font-smoothing` — usar con reservas y saber por qué

https://developer.mozilla.org/en-US/docs/Web/CSS/font-smooth — **no está estandarizada**.
Aviso literal de MDN: *"This feature is not standardized. We do not recommend using
non-standard features in production, as they have limited browser support, and may change or
be removed."*

Datos concretos: `-webkit-font-smoothing` **solo funciona en macOS**;
`-moz-osx-font-smoothing` también **solo en macOS**. `antialiased` suaviza a nivel de píxel
en vez de subpíxel, y *"switching from subpixel rendering to anti-aliasing for light text on
dark backgrounds makes it look lighter"* — o sea, **adelgaza el texto**.

**Recomendación matizada:** no ponerlo globalmente. En este sitio hay una variante de paleta
`noche` (fondo #000000, texto #FFFFFF — `src/styles/_tokens.scss:60-63`), que es
exactamente el caso «texto claro sobre fondo oscuro» donde el subpíxel engorda el texto.
Ahí `-webkit-font-smoothing: antialiased` está justificado, acotado a esa variante, y
documentado como no estándar y solo-macOS. En el resto, ninguna.

### 5.7 `scroll-behavior` y su obligación con `prefers-reduced-motion`

https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior — valores `auto` (instante)
y `smooth`. Nota clave del doc: *"When this property is specified on the root element, it
applies to the viewport instead. This property specified on the `body` element will **not**
propagate to the viewport."* → va en `html`, no en `body`.

`prefers-reduced-motion` (https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion):
valores `no-preference` y `reduce`; *"`@media (prefers-reduced-motion)` is equivalent to
`@media (prefers-reduced-motion: reduce)`"*.

Un desplazamiento suave es movimiento sin control del usuario: un desencadenante vestibular
de manual. La forma correcta es **activarlo solo por opt-in**, no declararlo y desactivarlo
después (así el default, que es lo que ve quien no ha configurado nada, sigue siendo
seguro y no depende de que la segunda regla gane la cascada):

```css
@media (prefers-reduced-motion: no-preference) {
  html { scroll-behavior: smooth; }
}
```

Y el corte general de animaciones y transiciones:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
(0.01ms en vez de 0: mantiene vivos los eventos `transitionend`/`animationend` de los que
puede depender la lógica de React, y evita romper componentes en vez de solo calmarlos.)

Esto es verificable de verdad con `test.use({ reducedMotion: 'reduce' })` de Playwright, y
enlaza con `src/lib/accesibilidad-movimiento.ts` y `src/lib/diseno/movimientoRespetuoso.ts`,
que hoy solo pueden aseverar sobre la lógica.

### 5.8 `scroll-padding-top` por la cabecera fija

https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-padding — *"The `scroll-padding`
property enables defining offsets for the optimal viewing region of the scrollport: the
region used as the target region for placing elements in view of the user."* Caso de uso
citado literalmente: *"to make room for objects that might obscure the content, such as
**fixed-positioned toolbars** or sidebars"*.

```css
html { scroll-padding-top: calc(var(--altura-cabecera) + var(--espacio-3)); }
```

**Esta regla no es cosmética: es la técnica suficiente C43 del W3C para SC 2.4.11 (AA).**
Con el enlace «Saltar al contenido» y los anclas de navegación de la cabecera, sin ella el
destino aterriza debajo de la cabecera y el foco queda tapado. La altura debe salir de la
misma variable que dimensiona la cabecera, nunca de un número repetido a mano.

### 5.9 El resto del mínimo

```css
html { -webkit-text-size-adjust: 100%; }   /* evita el reescalado automático de iOS en horizontal */
body { min-height: 100svh; line-height: 1.5; background: var(--color-fondo); color: var(--color-texto); }
#root { isolation: isolate; }               /* contexto de apilamiento propio para el sticky y los overlays */
ul[role='list'], ol[role='list'] { list-style: none; padding-inline: 0; }
:target { scroll-margin-block-start: var(--espacio-6); }
```

`body { background/color }` es la regla que arregla el diagnóstico de raíz: los tokens
`--color-fondo` y `--color-texto` **ya existen y ya resuelven** (`src/styles/_tokens.scss:40-41`),
pero nadie los aplicaba al documento. `100svh` en vez de `100vh` evita el salto por la barra
de direcciones móvil. `line-height: 1.5` es además el mínimo de SC 1.4.12 Text Spacing (AA).

---

## 6. Conversión de imágenes a `.webp` en Windows

### 6.1 Qué hay REALMENTE en esta máquina (comprobado, no supuesto)

```
magick -version   →  command not found      (NO hay ImageMagick)
cwebp -version    →  command not found      (NO hay libwebp CLI)
ffmpeg -version   →  ffmpeg 8.1.1-essentials_build-www.gyan.dev   OK
ffmpeg -encoders | grep webp
   V....D libwebp_anim   libwebp WebP image (codec webp)
   V....D libwebp        libwebp WebP image (codec webp)          OK
node -v  →  v22.15.0        pnpm -v  →  10.21.0
```

**ImageMagick no está instalado.** ffmpeg 8.1.1 sí, y **con `libwebp` compilado dentro**.
No hay que instalar nada.

### 6.2 Receta que funciona aquí — EJECUTADA, con salida verificada

```bash
# fuente de prueba 2400x1600
ffmpeg -f lavfi -i "testsrc=size=2400x1600:duration=1:rate=1" -frames:v 1 src.png -y

# juego responsive
for w in 480 800 1200 1600; do
  ffmpeg -hide_banner -loglevel error -i FUENTE.jpg \
    -vf "scale=$w:-2:flags=lanczos" \
    -c:v libwebp -quality 82 -compression_level 6 -preset picture \
    salida-$w.webp -y
done
```

Salida real (bytes) y dimensiones confirmadas con `ffprobe`:

| fichero | bytes | ancho×alto (ffprobe) |
|---|---|---|
| `out-480.webp` | 4 500 | 480×320 |
| `out-800.webp` | 7 692 | 800×534 |
| `out-1200.webp` | 11 132 | 1200×800 |
| `out-1600.webp` | 15 610 | 1600×1066 |

Notas de los parámetros, todas comprobadas:
- `scale=$w:-2` fija el ancho y deduce el alto **conservando la proporción**, redondeando a
  par. Verificado: 2400×1600 → 1600×1066.
- `flags=lanczos` es el remuestreo de calidad para reducir.
- `-quality 82` es el rango dulce para fotografía; `-preset picture` afina para foto.
- **Lee `.webp` de entrada**: probado con el `logo galapavet.webp` del repo → `webp,200,200`.
- **Borra los metadatos**. `ffprobe -show_entries format_tags` sobre la salida devuelve
  **vacío**. Relevante para el RGPD: las fotos de stock (y sobre todo las futuras fotos
  reales hechas con móvil en la clínica) llevan EXIF con modelo de cámara y a veces
  **coordenadas GPS**. Este paso las elimina sin trabajo extra.
- **Cuidado con `-lossless 1`**: probado sobre el logo a 200×200 → **17 298 bytes**, frente a
  los **4 744** del `.webp` original con pérdida. Para logos e ilustraciones planas no es
  automáticamente mejor; hay que medir cada caso.

### 6.3 Alternativa: `sharp` sin instalarlo en el proyecto

`pnpm dlx sharp-cli` **funciona en esta máquina**, verificado:

```
pnpm dlx sharp-cli --version   →  6.0.0
pnpm dlx sharp-cli --input src.png --output DIR --format webp --quality 82 resize 800
→  DIR/src.webp  ·  7 662 bytes  ·  ffprobe: webp,800,533
```

Sintaxis que **falla** y conviene documentar: `-o sh2/` con barra final da
`ls: Not a directory` (crea un fichero llamado así); el directorio de salida debe existir y
pasarse **sin barra final**. `pnpm dlx` lo resuelve en caché temporal, así que **no ensucia
`package.json` ni el lockfile**.

**Comparativa a igual calidad (q82, 800 px):** ffmpeg 7 692 B vs sharp-cli 7 662 B — un 0,4%
de diferencia. Empate técnico.

**Recomendación: ffmpeg.** Ya está instalado, no necesita red, no depende de binarios
nativos por plataforma, y quita el EXIF. `sharp-cli` queda como plan B documentado.

### 6.4 Tamaños responsive y `srcset`

Doc oficial: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img

- Descriptor `w`: entero positivo que **debe coincidir con el ancho intrínseco real** del
  fichero. Descriptor `x`: densidad de píxel.
- **"Do not mix width and pixel density descriptors in the same `srcset`."**
- `sizes` es **obligatorio** con descriptores `w` y se omite con `x`. Cada entrada es una
  condición de medio + un tamaño; la última va sin condición.
- `width`/`height` en el `<img>`: *"the aspect ratio is used to reserve the space needed to
  display the image, reducing or even preventing a layout shift when the image is downloaded
  and painted"*. Y sobre `loading="lazy"`: *"Explicit width and height are especially
  important for lazy-loaded images to prevent layout shifts, as unloaded images have a width
  and height of 0."*

Anchos propuestos, alineados con la escala de puntos de corte que el repo ya tiene
(`src/lib/diseno/puntoDeCorte.ts`): **480 / 800 / 1200 / 1600**.

```html
<img
  src="/imagenes/consulta-800.webp"
  srcset="/imagenes/consulta-480.webp   480w,
          /imagenes/consulta-800.webp   800w,
          /imagenes/consulta-1200.webp 1200w,
          /imagenes/consulta-1600.webp 1600w"
  sizes="(max-width: 48rem) 100vw, 50vw"
  width="1600" height="1066"
  loading="lazy" decoding="async"
  alt="…" />
```

**Excepción para la imagen del hero:** `loading="eager"` + `fetchpriority="high"` y **sin**
`lazy`. Es el LCP; diferirla lo empeora directamente. El `alt` sale de los módulos de
`src/data/`, nunca del prototipo.

---

# Decisiones técnicas recomendadas (para el `spec_partner`)

Numeradas para que se puedan convertir en decisiones del proyecto tal cual.

**D-A. Motor de verificación visual: Playwright 1.62.1 + @axe-core/playwright 4.13.0.**
Se añaden como devDependencies. Los navegadores **no** se descargan solos (verificado:
`playwright@1.62.1` no tiene script de instalación) → se instala solo el shell headless con
`pnpm exec playwright install --only-shell chromium`, documentado en `init`. Coste medido en
disco para el Chromium completo en esta máquina: **416 MB**; con `--only-shell` menos
(cifra exacta NO VERIFICADA).

**D-B. Los e2e viven en `tests/e2e/`, no en `src/`.** Con eso la separación de Vitest y
Playwright es automática y **no se toca `vite.config.ts`**: el `include` de Vitest
(`vite.config.ts:44`) ya está anclado a `src/**`, y `testDir` de Playwright se ancla a
`tests/e2e`. Verificado ejecutándolo: `vitest list` no recoge el fichero, `oxlint` sale
limpio (EXIT=0), `tsc -b` sale EXIT=0.

**D-C. Se añade `tsconfig.e2e.json` como tercer proyecto referenciado.** Hoy `tests/` está
fuera del typecheck (demostrado: `tsc -b` pasa con un import irresoluble). Debe ser un
proyecto **separado** de `tsconfig.app.json` porque este declara `vitest/globals`
(`tsconfig.app.json:6`) y colisiona conceptualmente con los `test`/`expect` importados de
Playwright. Playwright no comprueba tipos (*"Playwright does not check the types"*): el
typecheck es nuestro.

**D-D. La verificación mide `dist/`, no el dev server.** `webServer.command` incluye el
`build`, y `vite preview --port 4173 --strictPort` sirve el artefacto real. Es la única forma
de que el diagnóstico («0 `font-family` en el CSS generado») sea reproducible como test.

**D-E. `retries: 0`.** Se rechaza a propósito el `retries: 2` que recomienda Playwright para
CI: contradice el contrato de «0 fallos, 0 warnings» del repo. Un e2e que parpadea se
arregla, no se reintenta.

**D-F. Etiquetas de axe: `['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']`.**
`wcag22aa` es imprescindible y **suficiente** para activar `target-size`, que viene
`enabled: false` — verificado por lectura de fuente (`axe.js:20541-20581`) y por ejecución
real. **No usar `.options()`**, porque *"Will override any other configured options"*
anularía las etiquetas.

**D-G. Tipografía: variables, subconjunto `latin` únicamente, autoalojadas en
`public/fuentes/`.** Outfit `latin` variable = **32 292 B**, DM Sans `latin` variable =
**36 932 B**, total **≈ 68 KB** para todos los pesos 100-900. `latin-ext` **no se sirve**:
verificado por script que el rango latin cubre ñ, Ñ, ¿, ¡, «», ·, —, …, comillas
tipográficas, €, º, ª, ç — **ningún carácter del español queda fuera**. Ahorra 33 036 B.

**D-H. Ambas fuentes son SIL OFL 1.1, verificado leyendo el `LICENSE` de los ficheros
descargados**, no un blog. Origen: `Outfitio/Outfit-Fonts` y `googlefonts/dm-fonts`,
empaquetadas por Fontsource 5.3.0 (`license: OFL-1.1`). La OFL permite redistribuir con la
web. Cero peticiones a `fonts.googleapis.com` → Decisión 9 del spec satisfecha.

**D-I. `font-display: swap` + `@font-face` de respaldo con métricas ajustadas.** Los cuatro
valores están **calculados y listos** (sección 3.5): Outfit → `size-adjust: 99.8204%`,
`ascent-override: 100.18%`, `descent-override: 26.0468%`; DM Sans → `size-adjust: 104.531%`,
`ascent-override: 94.9001%`, `descent-override: 29.6563%`. Se escriben a mano en el SCSS.
**`@capsizecss/*` NO entra como dependencia**: fue herramienta de investigación, su salida es
estática.

**D-J. Precarga con `crossorigin` obligatorio.** Dos `<link rel="preload" as="font"
type="font/woff2" crossorigin>` en `index.html`, uno por familia. Sin `crossorigin` el
fichero se descarga **dos veces** y la precarga es contraproducente. No precargar nada más.

**D-K. Se crea `public/` con `fuentes/` e `imagenes/`.** Hoy no existe (verificado) y de ahí
los ~20 recursos en 404. Los ficheros de `public/` no llevan hash y se copian tal cual a
`dist/` — justo la garantía que necesita un `<link rel="preload">` escrito a mano.

**D-L. Reset CSS propio y explícito**, con las nueve familias de reglas de la sección 5, cada
una con su justificación citada. Las tres que arreglan el diagnóstico de raíz son
`body { margin: 0 }` (el 8px es UA stylesheet, spec HTML), `body { background / color }`
usando los tokens que ya existen y nadie aplicaba, e `input, button, textarea, select
{ font: inherit }` (los controles **no** heredan la fuente, spec de rendering).

**D-M. `scroll-padding-top` es requisito de accesibilidad, no de estética.** Es la técnica
suficiente **C43** del W3C para **SC 2.4.11 Focus Not Obscured (Minimum), nivel AA**, y este
sitio tiene cabecera fija. Su valor sale de la misma variable que dimensiona la cabecera.
**No hay regla de axe para 2.4.11**: hay que escribir el test de Playwright a mano
(enfocar cada tabulable y comprobar que su caja no queda íntegramente bajo la cabecera).

**D-N. Movimiento por opt-in.** `scroll-behavior: smooth` se declara **dentro** de
`@media (prefers-reduced-motion: no-preference)`, no se declara y se revoca. Verificable de
verdad con `test.use({ reducedMotion: 'reduce' })`.

**D-O. Corrección de nivel: 2.4.13 Focus Appearance es AAA, no AA.** El obligatorio en AA es
2.4.7 Focus Visible más 1.4.11 para el contraste del indicador. Se recomienda **cumplir 2.4.13
igualmente** (`outline: 2px` + 3:1, que `src/styles/_tokens.scss:123` casi ya hace) pero
**documentarlo como AAA en el spec**, no venderlo como AA.

**D-P. Todo rol de color nuevo pasa por `src/lib/contraste.ts` antes de fijarse.** Texto
normal 4.5:1, texto grande 3:1 (≥24px, o ≥18.66px en negrita — los umbrales de
`contraste.ts:153-154` coinciden con la conversión oficial 1pt=1.333px), y **3:1 para bordes,
iconos informativos y el anillo de foco** por SC 1.4.11. Los separadores decorativos y el
logotipo quedan exentos por las excepciones normativas citadas.

**D-Q. Imágenes con ffmpeg 8.1.1, que ya está en la máquina.** ImageMagick **no** está
instalado (verificado). Receta ejecutada y con salida comprobada por `ffprobe` en 6.2.
Anchos 480/800/1200/1600, `-quality 82 -preset picture -vf scale=W:-2:flags=lanczos`.
Beneficio colateral: **borra los metadatos EXIF/GPS** (verificado), relevante para las fotos
reales de la clínica que sustituirán al stock. `pnpm dlx sharp-cli@6.0.0` queda como plan B
documentado (también verificado funcionando; diferencia de peso: 0,4%).

**D-R. `srcset` con descriptores `w` + `sizes` obligatorio, y `width`/`height` siempre.**
Nunca mezclar descriptores `w` y `x` (prohibido por la spec). La imagen del hero va
`loading="eager"` + `fetchpriority="high"` porque es el LCP; el resto, `loading="lazy"` +
`decoding="async"`, y con `lazy` los atributos `width`/`height` pasan de recomendables a
imprescindibles (una imagen sin cargar mide 0×0).

---

# Lo que NO se pudo verificar

1. **Tamaño exacto en bytes del `.zip` de `chromium-1234` y `chromium-headless-shell-1234`.**
   `playwright.download.prss.microsoft.com` responde `400
   GatewayServiceFileDetails Response is not in success state` a `HEAD` y a `Range: 0-0`.
   Lo que sí se midió: **416 MB en disco** para `chromium-1228` ya instalado en esta máquina,
   y **1 411 741 bytes** para el zip de `ffmpeg-1011`. Las cifras del doc oficial (~281 MB
   Chromium) no coinciden con la medición local, así que se usa la medición local.
2. **Si `.options()` de `@axe-core/playwright` 4.13.0 anula parcial o totalmente a
   `withTags()`.** El README dice *"Will override any other configured options"*, pero no se
   leyó la fuente del paquete (no está instalado). Es irrelevante en la práctica: se demostró
   que `withTags` basta para activar `target-size`, así que `.options()` no se usa.
3. **Valor por defecto de `reducedMotion` en Playwright.** El doc dice solo *"system
   defaults"*, sin nombrar un valor concreto.
4. **Puerto por defecto de `vite dev`** — la página de CLI de Vite no lo declara. Irrelevante
   aquí: toda la verificación va contra `preview` (4173, doblemente verificado).
5. **Comportamiento de las reglas del plugin `vitest` de oxlint sobre ficheros de Playwright
   con `@playwright/test` REALMENTE instalado.** La prueba de hoy salió limpia (EXIT=0), pero
   con el paquete ausente. Hay que repetir `pnpm run lint` tras instalarlo.
6. **Peso de `chromium --only-shell` en disco.** No se instaló para no alterar la máquina sin
   permiso. El doc habla de un shell separado; la cifra concreta habrá que medirla al
   instalarlo.
7. **Si el sitio necesitará las cursivas de DM Sans.** Si el diseño final las usa, hay que
   sumar `dm-sans-latin-wght-italic.woff2` = **39 712 B** (medido). Outfit no publica cursiva.
