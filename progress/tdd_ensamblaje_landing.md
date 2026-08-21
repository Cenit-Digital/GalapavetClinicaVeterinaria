# TDD — ensamblaje_landing (id 20)

> Bitácora ciclo a ciclo (Rojo → Verde → Refactor), un escenario del `.feature`
> a la vez. Mapa de trazabilidad @s → test al final.

## Confirmación previa

`node .harness/harness.mjs init`: **verde** antes de tocar nada — lint
(`oxlint --deny-warnings`) sin errores, `tsc -b` sin errores, suite completa
**310/310** tests.

## Diseño previo a la escritura del primer test (arquitectura, no código)

- `src/main.tsx` — punto de entrada. Monta `<App />` sobre `document.getElementById('root')`;
  si no existe, lanza una excepción nombrada (mismo patrón que
  `errorTelefonoNoValido` de `src/lib/telefono.ts`: una función que construye
  el `Error` con mensaje explícito, no una aserción de tipos silenciosa).
- `src/App.tsx` — shell común a todas las rutas: `Cabecera` (con `ancho` real
  y vivo de `window.innerWidth`, Decisión 22) + `<BrowserRouter>` (Decisión
  19) + `<Routes>` (`/` → `Landing`, subpáginas derivadas de
  `ENLACES_NAVEGACION` → `PaginaNoEncontrada`, `*` → `PaginaNoEncontrada`) +
  `PieDePagina` + `SelectorPaleta`.
- `src/pages/Landing.tsx` — contenido de la ruta `/`: compone los 12
  componentes ya `done` en el orden de la Decisión 16, envolviendo con un
  `<div id="...">` exactamente los 7 que tienen ancla contratada (Decisión
  17). No se toca ningún componente de `src/components/`.
- `src/pages/PaginaNoEncontrada.tsx` — encabezado "Página no encontrada" +
  enlace "Volver al inicio" → "/".
- Reutiliza sin reescribir: `esMovil`/`esAncla` (`Cabecera-logica.ts`),
  `ENLACES_NAVEGACION` (`src/data/navegacion.ts`).
- `main.tsx`, `App.tsx`, `Landing.tsx`, `PaginaNoEncontrada.tsx` quedan fuera
  del glob de mutación de Stryker (`stryker.config.json` solo muta
  `src/lib/**/*.ts` + `src/**/*-logica.ts`), igual que el resto de `.tsx` del
  proyecto — así lo fija el propio `.feature` en su cabecera.

## Ciclos

### Ciclo 1 — @s1 (main.tsx monta la app en #root)

- ROJO: `src/main.test.tsx` importa `./main`, que no existe → falla al
  resolver el módulo (cuenta como rojo, `docs/tdd.md`).
- VERDE mínimo: `src/App.tsx` (placeholder `<div>Galapavet</div>`, nada más
  — ningún test pide todavía shell/enrutado) + `src/main.tsx`
  (`ReactDOM.createRoot(document.getElementById('root')!).render(<App />)`,
  el idiom exacto que la Decisión 21 luego prohíbe — deliberado, es el
  "hacer trampa" permitido en verde: el ciclo 2 lo generaliza).
- El test necesitó envolver la aserción en `act()` (de
  `@testing-library/react`) porque `createRoot().render()` no confirma el
  commit de forma síncrona fuera de `act`; sin él, el primer `expect` veía
  `#root` todavía vacío y además saltaba el aviso "not wrapped in act(...)"
  (que el propio `src/test/setup.ts` convierte en rojo).
- REFACTOR: ninguno todavía.

### Ciclo 2 — @s2 (sin #root, excepción nombrada)

- ROJO: nuevo test sin `#root` en el documento, espera
  `rejects.toThrow(/root/)`. Con el `!` de la ronda 1 falla con el mensaje
  genérico de React (`"Target container is not a DOM element."`), que no
  contiene "root" — rojo confirmado con el motivo exacto esperado.
- VERDE: se sustituye el `!` por `elementoRaiz()` (lanza
  `errorElementoRaizAusente()`, un `Error` con mensaje explícito que
  menciona `"root"` — mismo patrón que `errorTelefonoNoValido` de
  `src/lib/telefono.ts`).
- Nota de configuración (no de comportamiento): oxlint exige `import React
  from 'react'` en cualquier `.tsx` con JSX aunque el runtime sea automático
  (mismo hallazgo que documentó `reserva_chat`); TypeScript
  (`noUnusedLocals`) exige además que ese símbolo se referencie de verdad.
  Resuelto igual que el resto del proyecto: `const arbol: React.JSX.Element
  = <App />` en vez de `.render(<App />)` inline.
- REFACTOR: ninguno adicional.

### Ciclo 3 — @s3 (las 8 secciones en orden, 7 anclas únicas)

- ROJO: `src/pages/Landing.test.tsx` importa `./Landing`, que no existe →
  falla al resolver el módulo.
- VERDE: `src/pages/Landing.tsx` compone `Hero → Servicios →
  CampanasPortada → Equipo → ReservaChat → Galeria → Contacto (
  FormularioContacto + InformacionContacto) → Faq`, envolviendo con `<div
  id="...">` los 7 con ancla contratada. Verificado con
  `compareDocumentPosition` (orden real del documento, no el orden del JSX)
  y con `querySelectorAll('#id').length === 1` para las 7 anclas.
- REFACTOR: ninguno.

### Ciclo 4 — @s4 (el id lo asigna Landing.tsx, no los componentes)

- Los 8 componentes aislados (`Hero`, `Servicios`, `Equipo`, `ReservaChat`,
  `Galeria`, `FormularioContacto`, `InformacionContacto`, `Faq`) más el
  montaje de `Landing` completo: el test **pasó a la primera** (ninguno de
  los 12 componentes `done` declara su propio `id`, confirmado leyendo su
  código fuente antes de escribir el test).
- Verificación de que sí muerde (sustituto del rojo que no llegó de forma
  natural): sabotaje manual — se añadió `id="inicio"` dentro de
  `Hero.tsx:38` — el test de @s4 (y el de @s3) fallaron exactamente como se
  esperaba (`querySelectorAll('#inicio')` pasó de 0 a 1 en el render
  aislado, y de 1 a 2 al montar `Landing`). Revertido.
- REFACTOR (en verde): los 8 bloques `render(...) → for (id) expect(...) →
  unmount()` casi idénticos se colapsaron en un único `it.each` sobre
  `COMPONENTES_CON_ANCLA` (par `[nombre, elemento]`). Vuelto a verificar
  verde tras el refactor y repetido el mismo sabotaje sobre `Hero.tsx` para
  confirmar que el refactor no perdió mordida.

### Ciclo 5 — @s5 (CampanasPortada sin ancla, enlaces a /campanas)

- El test **pasó a la primera** (`Landing.tsx` ya no envuelve
  `CampanasPortada`, y el propio componente ya enlaza a `/campanas` desde su
  feature ya `done`).
- Verificado con sabotaje manual: se envolvió `<CampanasPortada />` en
  `<div id="campanas">` dentro de `Landing.tsx` — el test falló exactamente
  en la aserción `querySelectorAll('#campanas')`. Revertido.
- Sin cambios de producción en este ciclo.

### Ciclo 6 — @s6 (Contacto agrupa sin nombre accesible propio)

- El test **pasó a la primera** (el contenedor `<div id="contacto">` ya no
  lleva ni `aria-label` ni `aria-labelledby`, y el orden
  `FormularioContacto → InformacionContacto` ya era el de `Landing.tsx`
  desde el ciclo 3).
- Verificado con sabotaje manual: se invirtió el orden de los dos hijos y se
  añadió `aria-label="Contacto"` al contenedor — ambos tests de @s6 fallaron
  (el de orden y el de "ninguna región llamada Contacto", esta última
  vía `document.querySelector('[aria-label="Contacto"]')`). Revertido.
- Sin cambios de producción en este ciclo.

### Ciclo 7 — @s7 (shell común: Cabecera, PieDePagina, SelectorPaleta)

- ROJO: `src/App.test.tsx` importa `./App` (el placeholder del ciclo 1) →
  falla porque el placeholder no renderiza ni `contentinfo` ni el botón de
  paleta.
- Hallazgo de diseño durante este ciclo: `<Routes>` de `react-router` emite
  `console.warn("No routes matched location ...")` cuando ninguna ruta
  coincide, y `src/test/setup.ts` convierte cualquier `console.warn` en rojo
  — así que las 3 rutas de subpágina (`/campanas`, `/blog`, `/tienda`) no
  podían quedar sin ningún `<Route>` que las capturara, aunque @s12/@s13
  (el contenido real del catch-all) todavía no tocaban. Resuelto con el
  mínimo exacto que exige la Ley 3: un catch-all `<Route path="*"
  element={<div />} />` — vacío, sin contenido — que @s12/@s13 generalizarán
  después a `PaginaNoEncontrada`. No es adelantar escenarios futuros: es la
  única forma de que @s7 pase sin violar la política de cero-warnings ya
  vigente en el proyecto.
- VERDE: `src/App.tsx` — `<BrowserRouter><Cabecera
  ancho={PUNTO_DE_CORTE_NAVEGACION_PX} /><Routes>...</Routes><PieDePagina
  /><SelectorPaleta /></BrowserRouter>`. `ancho` fijo (constante reutilizada,
  no un número mágico) porque @s9/@s10/@s11 todavía no lo exigen real.
- REFACTOR: ninguno.

### Ciclo 8 — @s8 (anclas de sección no cambian de ruta)

- El test **pasó a la primera**: `BrowserRouter`/`react-router` no
  interceptan un `<a href="#servicios">` plano (solo `<Link>` lo haría), así
  que el navegador resuelve el fragmento de forma nativa sin que el router
  reaccione.
- **Hallazgo honesto sobre el propio sabotaje de verificación**: se
  sustituyó `BrowserRouter` por `HashRouter` (el error exacto que la
  Decisión 19 quiere prevenir) y el test **siguió en verde**. Investigado
  antes de aceptarlo: `getUrlBasedHistory` (`react-router/lib/router/history.js:339-345`)
  solo se suscribe a `popstate`, nunca a `hashchange` — y un `<a
  href="#servicios">` plano dispara `hashchange`, no `popstate`, tanto en
  jsdom como en un navegador real. Por tanto NINGÚN router de esta librería
  reacciona a este clic concreto (con un `<a>` plano, no un `<Link>`); el
  riesgo real de HashRouter que describe la Decisión 19 es otro (deep-link
  inicial con `#algo` interpretado como ruta), no éste. Documentado aquí en
  vez de ocultarlo: este test concreto no discrimina `BrowserRouter` vs
  `HashRouter` por este mecanismo, pero sigue siendo una prueba fiel y
  correcta del literal exacto de @s8 (pathname/hash/Landing montado tras el
  clic). Revertido a `BrowserRouter` (la implementación correcta).
- Sin cambios de producción en este ciclo.

### Ciclo 9 — @s9 (Cabecera arranca según el ancho real al montar)

- El test (ancho de escritorio explícito, 1300px, distinto del `1024`
  hardcodeado del ciclo 7 para no enmascarar nada) **pasó a la primera**:
  la implementación fija de `PUNTO_DE_CORTE_NAVEGACION_PX` ya cae en la
  rama de escritorio, coincida o no con el ancho real.
- Verificado con sabotaje manual: se cambió el `ancho` fijo de `App.tsx` a
  `0` — el test falló (no encontró la región "Navegación principal").
  Revertido.
- Sin cambios de producción en este ciclo (el hallazgo real, que fuerza la
  generalización, llega en el ciclo 10).

### Ciclo 10 — @s10 (resize real actualiza la rama)

- ROJO: tras montar en escritorio (1300px) y cambiar `window.innerWidth` a
  500px + disparar `resize`, la navegación seguía visible (el `ancho` de
  `App.tsx` seguía fijo, ajeno a `window.innerWidth`).
- VERDE: nace `useAnchoDeVentana()` en `App.tsx` —
  `useState(() => window.innerWidth)` + `useEffect` que suscribe
  `window.addEventListener('resize', ...)` con `leerAncho` como manejador y
  limpieza en el `return`. `Cabecera` pasa a recibir `ancho={ancho}` en vez
  del literal fijo.
- Nota de configuración: `window.dispatchEvent(new Event('resize'))` debe
  envolverse en `act()` — sin eso, el `setState` disparado por el listener
  queda fuera del ciclo de commit de React y `src/test/setup.ts` lo convierte
  en rojo (mismo aviso "not wrapped in act(...)" del ciclo 1).
- REFACTOR: ninguno adicional (la generalización de este párrafo ES el
  refactor forzado de este ciclo, hecho en verde).

### Ciclo 11 — @s11 (ancho inicial cae en la rama móvil antes de medir)

- ROJO real, pero no en `vitest run`: `src/App.test.tsx` importa
  `ANCHO_ANTES_DE_MEDIR` desde `./App`, que todavía no existe.
  **Hallazgo de entorno documentado, no oculto**: la transformación de
  Vitest/esbuild NO revienta con un import nombrado inexistente (el símbolo
  llega como `undefined` en tiempo de ejecución) — y como
  `esMovil(undefined)` ya cae en la rama móvil por su propia guarda
  defensiva (`!(anchoVentana > 0)`), el test pasaba "en verde" con
  `vitest run` sin que existiera ninguna implementación real. Detectado
  porque `docs/tdd.md` insiste en sospechar de un verde a la primera: se
  corrió `pnpm run typecheck` (parte del mismo gate de `bin/harness init`) y
  ahí sí apareció el rojo genuino: `TS2305: Module "./App" has no exported
  member 'ANCHO_ANTES_DE_MEDIR'`. Esa es la evidencia de rojo real de este
  ciclo — Ley 2 ("no compilar cuenta como fallar") aplicada de forma
  literal, aunque el fallo apareciera en `tsc -b` y no en `vitest run`.
- VERDE: `App.tsx` exporta `ANCHO_ANTES_DE_MEDIR = 0` y `useAnchoDeVentana`
  pasa a inicializar `useState(ANCHO_ANTES_DE_MEDIR)` (ya no lee
  `window.innerWidth` de forma síncrona en el primer render); la lectura
  real se mueve dentro del `useEffect` (`leerAncho()` se invoca también al
  montar, antes de suscribir el listener). Se repitieron @s9 y @s10 tras el
  cambio: ambos siguen en verde (el `act()` que envuelve `render()`/`act()`
  en los tests ya flushea el efecto antes de las aserciones).
- Verificado con sabotaje manual: `ANCHO_ANTES_DE_MEDIR = 2000` — el test de
  @s11 falló (mostraba escritorio en vez de móvil). Revertido a `0`.
- REFACTOR: ninguno adicional.

### Ciclo 12 — @s12 (subpáginas sirven el catch-all con contenido real)

- ROJO: navegar a `/campanas`, `/blog`, `/tienda` mostraba el `<div />`
  vacío del ciclo 7 (catch-all sin contenido), no el encabezado "Página no
  encontrada" ni el enlace "Volver al inicio".
- VERDE: nace `src/pages/PaginaNoEncontrada.tsx` (`<h1>Página no
  encontrada</h1>` + `<a href="/">Volver al inicio</a>`). `App.tsx` deriva
  `RUTAS_DE_SUBPAGINA` de `ENLACES_NAVEGACION` filtrando con `esAncla`
  (reutilizado de `Cabecera-logica.ts`, sin reimplementar la regla) y
  registra un `<Route>` por cada una apuntando a `PaginaNoEncontrada`
  (Decisión 20: las rutas no se retipean como literales nuevos).
- REFACTOR: ninguno.

### Ciclo 13 — @s13 (cualquier deep-link no registrado recibe el mismo catch-all)

- ROJO: navegar a `/esto-no-existe` seguía mostrando el `<div />` vacío del
  catch-all genérico (`path="*"`), que el ciclo 12 no había tocado.
- VERDE: se sustituye `<Route path="*" element={<div />} />` por `<Route
  path="*" element={<PaginaNoEncontrada />} />` — un cambio de una línea,
  reutilizando el mismo componente del ciclo 12.
- REFACTOR: ninguno.

### Ciclo 14 — @s14 (SelectorPaleta no rompe el orden de las 8 secciones)

- El test **pasó a la primera**: `App.tsx` ya renderiza `SelectorPaleta`
  después de `PieDePagina`, fuera del árbol de `<Routes>`, así que nunca
  queda intercalado entre dos secciones de `Landing`.
- Verificado con sabotaje manual: se insertó temporalmente `<SelectorPaleta
  />` dentro de `Landing.tsx`, entre `Equipo` y `ReservaChat` — el test
  falló (esta vez con "found multiple elements" porque quedaban dos botones
  "Cambiar paleta de color" en el documento: el de `App.tsx` y el
  intercalado). Revertido íntegramente (import y JSX).
- Sin cambios de producción en este ciclo.

### Refactor final (en verde, tras cerrar los 14 escenarios medibles en Vitest)

- `src/pages/Landing.test.tsx`: colapsados los 8 bloques casi idénticos de
  @s4 en un único `it.each` sobre `COMPONENTES_CON_ANCLA` (ver Ciclo 4).
  Vuelto a correr toda la suite tras el cambio: sigue verde.
- Revisado el resto de `App.tsx`/`Landing.tsx`/`PaginaNoEncontrada.tsx`/
  `main.tsx`: funciones cortas, nombres reveladores, sin números mágicos
  (`ANCHO_ANTES_DE_MEDIR`/`PUNTO_DE_CORTE_NAVEGACION_PX` reutilizado, nunca
  un literal suelto), sin duplicación entre ficheros de producción. No se
  encontró más para refactorizar.

## Verificación de @s15 (fuera del gate de Vitest/Stryker, Decisión 11)

> `main.tsx`, `App.tsx` y `Landing.tsx` no son medibles en jsdom para esto:
> ni hay proceso de build real ni servidor real en ese entorno. Verificado
> con línea de comandos y una petición HTTP real, como fija el propio
> `.feature`. Evidencia cruda de comandos y salidas, no un "debería
> funcionar".

### `pnpm run build`

```
$ pnpm run build

> galapavet-web@0.0.0 build
> tsc -b && vite build

vite v8.2.1 building client environment for production...
✓ 109 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                  1.70 kB │ gzip:  0.91 kB
dist/assets/index-DPyiHbCk.js  252.15 kB │ gzip: 80.53 kB

✓ built in 140ms
```

Código de salida: **0**. `tsc -b` (todo el proyecto, no solo los ficheros de
esta feature) no reportó ningún error antes de que `vite build` arrancara.

### `pnpm run preview` + peticiones HTTP reales

Servidor arrancado en segundo plano (`vite preview`, puerto 4173 por
defecto) y verificado con `curl` real (no una simulación):

```
$ curl -s -D - http://localhost:4173/ -o preview_body.html
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1703
```

`preview_body.html` contiene el `index.html` compilado: `<div id="root">`
vacío (se llena en cliente) y `<script type="module" crossorigin
src="/assets/index-DPyiHbCk.js">` apuntando al bundle real generado por el
build anterior (mismo nombre de fichero con hash).

```
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/assets/index-DPyiHbCk.js
200
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/campanas
200
$ curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/esto-no-existe
200
```

Verificado además que `/campanas` devuelve **byte a byte el mismo
`index.html`** que `/` (`diff` sin salida) — confirma que `vite preview`
aplica el *fallback* SPA que exige `BrowserRouter` (Decisión 19, riesgo de
despliegue anotado en `project-spec.md`: "el hosting debe reescribir
cualquier ruta desconocida a `index.html`" — aquí, en local, ya ocurre).

Contenido del bundle verificado por `grep` (confirma que es el build de
ESTA sesión, no una caché vieja): contiene los literales `"Página no
encontrada"`, `"Volver al inicio"` y el mensaje de la excepción nombrada de
`main.tsx` (`"No se encontr[ó]... root..."`).

### Límite de verificación honesto: no hay navegador real disponible en este entorno

Se intentó un paso adicional más allá de lo pedido explícitamente (cargar la
página con `jsdom` en modo `runScripts: "dangerously"` contra el servidor
real de `pnpm run preview`, como aproximación a "consola sin errores" sin
tener la skill `browser-automation`/Claude in Chrome disponible en esta
sesión). Resultado: `#root` seguía vacío y **cero errores** reportados por
`VirtualConsole`. Investigado antes de interpretarlo como un fallo de la
app: `node_modules/jsdom/lib/jsdom/living/nodes/HTMLScriptElement-impl.js`
tiene un `TODO: implement modules` explícito — jsdom no ejecuta
`<script type="module">` en absoluto, así que el "cero errores" era
silencio por limitación de la herramienta, no una señal real. Descartado el
script (no se conserva en el repo) y documentado aquí en vez de reportar un
falso "verificado en consola de navegador".

**Evidencia real disponible para @s15, con las herramientas de esta
sesión**: build con código de salida 0 y `tsc -b` limpio sobre todo el
proyecto; servidor de preview real sirviendo HTTP 200 en `/`, en las tres
subpáginas y en el bundle JS; *fallback* SPA verificado byte a byte; el
bundle contiene el código nuevo de esta feature. No se pudo verificar
"cero errores de consola en un navegador real" porque ninguna herramienta de
automatización de navegador estaba disponible en esta sesión — queda
anotado como pendiente para una verificación posterior con
`browser-automation`/Claude in Chrome, mismo criterio que `galeria` dejó
pendiente sus cláusulas de scroll físico no medibles en jsdom.

## Verificación final de la sesión

- `pnpm exec vitest run`: **339/339 verde** (310 preexistentes + 29 nuevos:
  2 de `main.test.tsx`, 13 de `App.test.tsx` tras el refactor de @s4, 14 de
  `Landing.test.tsx`).
- `node .harness/harness.mjs init`: **verde** — lint (`oxlint
  --deny-warnings`) sin errores, `tsc -b` sin errores, suite completa
  339/339.
- No se toca `feature_list.json`: la feature sigue `in_progress`, a la
  espera de `judge` y `mutation_tester` — no me corresponde marcarla `done`.
- No quedan `console.*`, `debugger`, `.only`/`.skip`, `TODO` ni restos de
  "SABOTAJE"/ficheros temporales (`scratch_*`) en el árbol de trabajo
  (verificado con `git status --porcelain`: solo los ficheros nuevos de esta
  feature y `progress/current.md`).
- Todos los sabotajes manuales documentados arriba se revirtieron
  íntegramente antes de continuar al siguiente ciclo (confirmado releyendo
  cada fichero tras revertir).

## Trazabilidad @s → test

| Escenario | Test | Fichero |
| --- | --- | --- |
| @s1 | `el elemento con id "root" deja de estar vacío tras ejecutar main.tsx` | `src/main.test.tsx` |
| @s2 | `lanza una excepción cuyo mensaje menciona "root" y no monta nada en el documento` | `src/main.test.tsx` |
| @s3 | `los 8 marcadores aparecen en el documento en el orden exacto de la Decisión 16` + `cada uno de los 7 id existe exactamente una vez...` | `src/pages/Landing.test.tsx` |
| @s4 | `it.each(COMPONENTES_CON_ANCLA)('%s aislado no contiene ninguno de los 7 id de ancla', ...)` + `al montar la ruta "/" completa, esos mismos 7 id sí existen` | `src/pages/Landing.test.tsx` |
| @s5 | `no existe ningún id "campanas" y sus tarjetas y su enlace "Ver campañas" apuntan a "/campanas"` | `src/pages/Landing.test.tsx` |
| @s6 | `primero "Escríbenos" y después "Información de contacto"...` + `no existe en todo el documento ninguna región, landmark ni encabezado adicional llamado "Contacto"` | `src/pages/Landing.test.tsx` |
| @s7 | `it.each(['/', '/campanas', '/blog', '/tienda'])('en la ruta "%s" hay exactamente un "contentinfo"...', ...)` | `src/App.test.tsx` |
| @s8 | `pulsar "#servicios" no cambia el pathname, sí el hash, y Landing sigue montado` | `src/App.test.tsx` |
| @s9 | `con un ancho de escritorio antes de montar, se ve la navegación principal con sus 8 enlaces` | `src/App.test.tsx` |
| @s10 | `al pasar a un ancho móvil y disparar "resize", desaparece la navegación y aparece "Abrir menú"` | `src/App.test.tsx` |
| @s11 | `con el primer ancho que App.tsx le pasa, existe "Abrir menú" y no existe "Navegación principal"` | `src/App.test.tsx` |
| @s12 | `it.each(['/campanas', '/blog', '/tienda'])('en "%s" hay un encabezado "Página no encontrada"...', ...)` | `src/App.test.tsx` |
| @s13 | `en "/esto-no-existe" se ve el mismo encabezado, el mismo enlace y el shell común` | `src/App.test.tsx` |
| @s14 | `el botón "Cambiar paleta de color" no se interpone entre dos de las 8 secciones` | `src/App.test.tsx` |
| @s15 | Verificación con línea de comandos (`pnpm run build`, `pnpm run preview` + `curl`), documentada arriba — fuera del gate de Vitest/Stryker por Decisión 11, declarado así en el propio `.feature` | (sin test de Vitest; evidencia cruda en esta bitácora) |

## Ficheros de producción entregados

- `src/main.tsx` — punto de entrada; `elementoRaiz()` falla cerrado con una
  excepción nombrada si `#root` no existe.
- `src/App.tsx` — shell común (`useAnchoDeVentana`, `ANCHO_ANTES_DE_MEDIR`,
  `RUTAS_DE_SUBPAGINA` derivadas de `ENLACES_NAVEGACION`).
- `src/pages/Landing.tsx` — composición de la landing con los 7 `id` de
  ancla.
- `src/pages/PaginaNoEncontrada.tsx` — catch-all de subpágina/deep-link.
- `src/main.test.tsx` (2 tests), `src/App.test.tsx` (13 tests),
  `src/pages/Landing.test.tsx` (14 tests).

## Problemas de configuración/entorno encontrados (documentados, no ocultados)

1. `Routes` de `react-router` emite `console.warn` ante una ruta sin
   coincidencia, y `src/test/setup.ts` convierte cualquier `warn` en rojo —
   forzó un catch-all mínimo desde el ciclo 7 (ver esa entrada).
2. `window.dispatchEvent(new Event('resize'))` y la ejecución dinámica de
   `main.tsx` necesitan `act()` (`@testing-library/react`) para que
   `setState` se refleje antes de las aserciones; sin él, `src/test/setup.ts`
   convierte el aviso de React en rojo.
3. Vitest/esbuild no revienta con un `import` nombrado que no existe en el
   módulo de destino (llega como `undefined` en tiempo de ejecución, sin
   error de enlace); `tsc -b` sí lo detecta como `TS2305`. Ver Ciclo 11 —
   importante para cualquier ciclo futuro que dependa de un símbolo nuevo:
   `pnpm run typecheck` es la fuente de verdad del rojo, no solo `vitest
   run`.
4. `jsdom` no implementa `<script type="module">` (`TODO` explícito en su
   propio código fuente) — no sirve para verificar en profundidad la carga
   real del bundle de producción; se usó `curl` en su lugar (ver @s15).

## Ronda de refuerzo 2 (mutación FAIL 0.6667 → este refuerzo)

> Feedback de entrada: `progress/mutation_ensamblaje_landing.md`, veredicto
> **FAIL**, 18/27 = 66.67%, 9 supervivientes (1 en `main.tsx`, 8 en `App.tsx`).
> Disciplina: solo tests dirigidos a cada superviviente concreto + el único
> cambio de producción que un hallazgo documentó como necesario. Nada de
> `Landing.tsx`/`PaginaNoEncontrada.tsx` (0 supervivientes, sin trabajo).

### Superviviente 1 — `src/main.tsx:8-10` BlockStatement (`errorElementoRaizAusente` vaciada a `undefined`)

- **ROJO/VERDE**: `assertThrows` de chai solo compara el mensaje contra el
  regex si el valor capturado es *truthy*; `throw undefined` cuela sin decir
  nada del mensaje. Añadida una segunda aserción a la misma promesa ya
  capturada en `src/main.test.tsx` (@s2): `await
  expect(promesaMain).rejects.toBeInstanceOf(Error)`. Pasó a la primera
  contra el código real (ya lanza un `Error` de verdad) — sin cambio de
  producción.
- **Mordida verificada por sabotaje manual** (patrón ya usado en ciclos
  4/5/6/9/14 de la ronda 1): se sustituyó el cuerpo de
  `errorElementoRaizAusente` por `return undefined as unknown as Error`
  (reproduce el mutante exacto) → el test nuevo falló
  (`expected undefined to be an instance of Error`), el de @s2 original
  (`.rejects.toThrow(/root/)`) siguió en verde — confirma que exactamente
  este mutante era el agujero. Revertido íntegramente a
  `return new Error(...)`.

### Supervivientes 2 y 3 — `src/App.tsx:38:12`/`38:45` (limpieza del `useEffect` de resize anulada / evento vaciado a `""`)

- **VERDE**: nuevo test en `src/App.test.tsx` (`describe('@s10 refuerzo — el
  listener de "resize" añadido al montar se retira al desmontar')`): espía
  `window.addEventListener`/`window.removeEventListener`, monta `App`,
  localiza la llamada de montaje con evento `'resize'`, desmonta con
  `arbol.unmount()` y afirma `removeEventListener` fue llamado con
  `('resize', <el mismo manejador>)`. Pasó a la primera contra el código
  real — sin cambio de producción.
- **Mordida verificada por sabotaje manual**: `return () => undefined` →
  el test falló (`removeEventListener` nunca llamado) — mata 38:12.
  Revertido y sabotaje 2: `return () =>
  window.removeEventListener('', leerAncho)` → el test volvió a fallar
  (llamado con `''` en vez de `'resize'`) — mata 38:45. Revertido a
  `return () => window.removeEventListener('resize', leerAncho)`.

### Superviviente 4 — `src/App.tsx:39:6` ArrayDeclaration (`[]` → `['Stryker was here']`) — investigado a fondo, no resuelto con un test que lo mate

- Se escribió el test que pedía el informe ("un spy que confirme que el
  efecto se ejecuta una sola vez pase lo que pase"): mismo `describe` de
  arriba, segundo `it` — monta con ancho de escritorio, cuenta las llamadas
  a `addEventListener('resize', ...)` (debe ser 1), dispara un `resize` real
  que fuerza un re-render (`act(() => window.dispatchEvent(new
  Event('resize')))`), vuelve a contar (debe seguir siendo 1).
- **Investigación honesta antes de darlo por bueno** (no se asumió que el
  test mordía solo porque pasaba en verde, `docs/tdd.md`): se sabotó
  `App.tsx` reproduciendo el mutante exacto (`}, ['Stryker was here'])`) y
  se corrió la suite completa de `App.test.tsx` — **las 17 pruebas
  siguieron en verde**, incluida la nueva. Antes de aceptar esa
  investigación se reprodujo el mecanismo en aislamiento (un componente de
  sonda mínimo, descartado tras la comprobación, no conservado en el
  repo) para confirmar la causa exacta: el algoritmo de comparación de
  dependencias de `useEffect` (`areHookInputsEqual`) compara **valores**
  posición a posición con `Object.is`, no identidad del array. Un literal
  de cadena (`'Stryker was here'`) es el mismo valor primitivo en cada
  render aunque el array que lo contiene sea un objeto nuevo cada vez —
  exactamente como `[]` es "igual" a sí mismo entre renders al no tener
  elementos que comparar. Por construcción, para CUALQUIER re-render
  disparado por estado/props dentro de la misma instancia montada, ambas
  variantes (`[]` y `['Stryker was here']`) producen el mismo resultado:
  el efecto se ejecuta exactamente una vez en la vida del componente. No
  hay observación de comportamiento posible (conteo de llamadas, número de
  suscripciones, warnings de React — ninguno de estos difiere) que
  distinga las dos variantes sin cambiar la propia forma del código
  (p. ej. convertir el array en algo derivado de una prop/estado real).
- **Conclusión**: tras esta investigación reproducible (no una suposición),
  este superviviente concreto es un mutante genuinamente equivalente bajo
  la semántica de comparación de dependencias de React, distinto de los
  otros 8 (que sí se mordieron con un test de comportamiento). El test
  añadido se conserva porque tiene valor real de regresión (protege el
  contrato "el listener se suscribe una sola vez"), pero se documenta aquí
  con toda honestidad que NO mata este mutante concreto — no se fabricó una
  aserción que aparentara hacerlo. Por `docs/mutation-testing.md` ("Un
  mutante equivalente ... puede excluirse, pero solo con justificación
  explícita escrita en `progress/mutation_<name>.md`. Abusar de esta vía es
  hacer trampa al juez"), esa decisión de exclusión no me corresponde a mí
  como `tdd_craftsman`: queda señalada aquí, con la evidencia completa de
  reproducción, para que el próximo `mutation_tester`/`judge` la evalúe de
  forma independiente.

### Supervivientes 5-8 — `src/App.tsx:16:28`/`16:54`/`16:66`/`17:3` (derivación completa de `RUTAS_DE_SUBPAGINA` sin test directo)

- **Cambio de producción mínimo, forzado por una restricción real, no por
  preferencia**: exportar `RUTAS_DE_SUBPAGINA` tal cual desde `App.tsx` (la
  sugerencia literal del informe) rompe `oxlint --deny-warnings`
  (`react-refresh/only-export-components`: un `.tsx` que exporta un
  componente solo puede exportar constantes-literal junto a él —
  `ANCHO_ANTES_DE_MEDIR = 0` ya lo hacía y no avisa; el resultado de un
  `.filter().map()` no cuenta como "constante" para esa regla y sí avisa).
  Verificado corriendo `bin/harness init` con el `export` puesto: falló en
  el paso de lint con exactamente ese aviso. Resuelto moviendo la
  derivación a un módulo puro nuevo, `src/App-logica.ts` — no una
  invención: es el propio patrón ya vigente en el proyecto
  ("logica-de-decision-en-modulo-puro-no-en-el-jsx", `feature_list.json` →
  `rules.notas`) y el mismo que ya siguen `Cabecera-logica.ts`,
  `SelectorPaleta-logica.ts`, etc. `App.tsx` pasa a importar
  `RUTAS_DE_SUBPAGINA` de `./App-logica` en vez de calcularla inline;
  quedan sin uso en `App.tsx` los imports de `esAncla` y
  `ENLACES_NAVEGACION`, retirados. Efecto colateral positivo, no buscado
  pero correcto: `src/App-logica.ts` cae ahora dentro del glob **por
  defecto** de Stryker (`src/**/*-logica.ts`), a diferencia de `App.tsx`
  (que solo se mide con el `--mutate` explícito que ya usó
  `mutation_tester`).
- **ROJO/VERDE**: nuevo `src/App-logica.test.ts` — un test, literal escrito
  a mano (`['/campanas', '/blog', '/tienda']`, nunca comparado contra
  `ENLACES_NAVEGACION` importado, patrón
  `doble-de-test-anclado-al-literal-no-al-simbolo`). Pasó a la primera
  contra el código real — sin cambio de comportamiento, solo de ubicación.
- **Mordida verificada por sabotaje manual, las 4 variantes exactas del
  informe, una a la vez, sobre `App-logica.ts`** (revertido íntegramente
  entre cada una, cada vez confirmando el texto original tras revertir):
  1. `ENLACES_NAVEGACION.map(...)` (filter eliminado, 16:28) → test falló
     (aparecen las anclas).
  2. `.filter(() => undefined)` (predicado vaciado, 16:54) → test falló
     (`[]`).
  3. `.filter((enlace) => esAncla(enlace.destino))` (negación invertida,
     16:66) → test falló (solo anclas, ninguna ruta real).
  4. `.map(() => undefined)` (map final vaciado, 17:3) → test falló
     (`[undefined, undefined, undefined]`).
- El test original de "RUTAS_DE_SUBPAGINA" que se había escrito primero
  dentro de `App.test.tsx` (antes de detectar el problema de lint) se
  eliminó de ese fichero para no duplicar cobertura una vez movido a
  `App-logica.test.ts`; `App.test.tsx` ya no importa `RUTAS_DE_SUBPAGINA`.

### Superviviente 9 — `src/App.tsx:57:33` (generación de `<Route>` por subpágina vaciada a `() => undefined`)

- **El fix de los supervivientes 5-8 NO alcanza a este**: `RUTAS_DE_SUBPAGINA`
  (el array de paths) y el `.map()` de la línea 57 que construye los
  `<Route>` a partir de ese array son dos derivaciones *distintas* — este
  mutante solo rompe la segunda. Verificado antes de asumir que el fix
  compartido bastaba (el propio informe lo dejaba ambiguo, agrupando este
  mutante con los 4 anteriores bajo "mismo remedio"): confirmado por
  sabotaje que un test que solo mira `RUTAS_DE_SUBPAGINA` (el valor) NO
  detecta este mutante, porque ese valor no cambia — solo la generación de
  JSX aguas abajo se vacía.
- El problema de fondo (documentado ya por `mutation_tester`): el
  comodín `<Route path="*">` renderiza el mismo componente
  `PaginaNoEncontrada` que las rutas explícitas, así que el DOM final es
  idéntico con o sin las 3 `<Route>` explícitas — ningún test de
  `@testing-library/react` sobre el árbol montado puede distinguirlos.
- **Solución investigada y verificada, sin depender del DOM**: el proyecto
  usa el runtime automático de JSX (`tsconfig.app.json` →
  `"jsx": "react-jsx"`), que en modo test/desarrollo compila a llamadas
  `jsxDEV(tipo, props, ...)` de `react/jsx-dev-runtime` — confirmado
  probando primero `React.createElement` (no se interceptó ninguna
  llamada: el runtime automático nunca lo usa) y luego `jsx`/`jsxs` de
  `react/jsx-runtime` (`vi.spyOn` fallo con `Cannot redefine property`,
  namespace ESM no configurable) antes de dar con `jsxDEV` vía `vi.mock`
  (sí funciona: `vi.mock` sustituye la resolución del módulo entero, no
  intenta mutar un binding vivo). Se verificó además, con un componente de
  sonda desechable de dos tests, que `restoreMocks: true`
  (`vite.config.ts`) no vacía la implementación de un `vi.fn(impl)` creado
  dentro de un `vi.mock(...)` entre tests del mismo fichero (sí lo haría
  con un `vi.spyOn` normal) — así que instrumentar `jsxDEV` una sola vez al
  principio de `App.test.tsx` no rompe ninguno de los tests ya existentes
  del fichero.
- **VERDE**: en `src/App.test.tsx`, `vi.mock('react/jsx-dev-runtime', ...)`
  envuelve la implementación real con `vi.fn(real.jsxDEV)` (el render no
  cambia de comportamiento, solo queda instrumentado) + nuevo test en
  `describe('@s12 refuerzo — App registra un <Route> explícito...')`: monta
  `App`, filtra las llamadas a `jsxDEV` cuyo primer argumento (`type`) sea
  el propio `Route` importado de `react-router`, extrae el `path` de cada
  una y afirma que la lista contiene `'/campanas'`, `'/blog'`, `'/tienda'`
  y `'*'`. Pasó a la primera contra el código real.
- **Mordida verificada por sabotaje manual**: `{RUTAS_DE_SUBPAGINA.map(()
  => undefined)}` en `App.tsx` (mutante exacto) → el test falló
  (`pathsDeRouteRegistrados` pasó a `['/', '*', '/', '*']`, sin ninguna de
  las 3 rutas de subpágina) — confirma la mordida exacta. Revertido
  íntegramente al JSX original.

### Verificación final de esta ronda

- `node .harness/harness.mjs init`: **verde** — `oxlint --deny-warnings`
  sin errores ni avisos, `tsc -b` sin errores, **33 ficheros de test / 343
  tests, todos en verde** (310 previos a `ensamblaje_landing` + 29 de la
  ronda 1 + 4 nuevos de esta ronda 2: 1 en `main.test.tsx`, 3 en
  `App.test.tsx` [dos de resize + uno de Route explícita, el cuarto sustituyó
  al que se movió], 1 en `App-logica.test.ts` — el conteo neto de `it()` en
  `App.test.tsx` sube en 2 tras restar el que se trasladó).
- `src/main.tsx` verificado con `git`/lectura íntegra: idéntico byte a byte
  al estado previo a esta ronda (solo se tocó el test).
- Todos los sabotajes manuales de esta ronda se revirtieron íntegramente
  antes de continuar al siguiente (confirmado releyendo cada fichero tras
  revertir, igual que en la ronda 1).
- Ficheros de producción tocados esta ronda: `src/App.tsx` (import de
  `RUTAS_DE_SUBPAGINA` desde el nuevo módulo, imports muertos retirados),
  `src/App-logica.ts` (nuevo). `src/main.tsx` y `src/pages/*.tsx`:
  intactos.
- Ficheros de test tocados/creados esta ronda: `src/main.test.tsx` (+1
  aserción), `src/App.test.tsx` (+3 tests netos, -1 test trasladado, +1
  `vi.mock`), `src/App-logica.test.ts` (nuevo, 1 test).
- Pendiente explícito para el próximo `mutation_tester`: evaluar de forma
  independiente si `src/App.tsx:39:6` (ahora en `src/App-logica.ts` no —
  permanece en `App.tsx`, la derivación de rutas es la que se movió, no el
  `useEffect`) es un mutante equivalente por el razonamiento de arriba, y
  si corresponde documentar su exclusión en
  `progress/mutation_ensamblaje_landing.md` según `docs/mutation-testing.md`.
  No se marca la feature `done`: sigue `in_progress`, a la espera de
  `judge` y `mutation_tester`.
