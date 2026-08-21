# Review — feature ensamblaje_landing (id 20)

> Revisión ronda 2 (post refuerzo de mutación). Contra
> `features/ensamblaje_landing.feature` (15 escenarios @s1-@s15),
> `project-spec.md` sección "Ensamblaje — nueva feature: ensamblaje_landing"
> y Decisiones 15-22, y `progress/tdd_ensamblaje_landing.md` (14 ciclos +
> "Ronda de refuerzo 2"). Verificación propia e independiente: lectura
> completa de `src/main.tsx`, `src/App.tsx`, `src/App-logica.ts`,
> `src/pages/Landing.tsx`, `src/pages/PaginaNoEncontrada.tsx`,
> `src/data/navegacion.ts`, `src/components/Cabecera.tsx` +
> `Cabecera-logica.ts`, `src/main.test.tsx`, `src/App.test.tsx`,
> `src/App-logica.test.ts`, `src/pages/Landing.test.tsx`; `grep` sobre los
> 12 componentes ya `done` en busca de `id=` de ancla; `git status`/`git
> diff --stat` sobre `src/components/`; ejecución propia de `bin/harness
> init`, `pnpm run build` y `pnpm run preview` + `curl` reales
> (reproducidos en esta sesión de revisión, no solo releídos de la
> bitácora).

**Veredicto:** APPROVED

## Contexto de esta ronda

Existe un `progress/judge_ensamblaje_landing.md` previo (ronda 1, aprobado
antes de medir mutación) y un `progress/mutation_ensamblaje_landing.md` que
documenta el **FAIL** de esa primera medición (18/27 = 66.67%, 9
supervivientes: 1 en `main.tsx`, 8 en `App.tsx`). `tdd_craftsman` respondió
con una "Ronda de refuerzo 2" (documentada íntegramente en
`progress/tdd_ensamblaje_landing.md`, sección homónima) que: (1) añadió una
aserción `rejects.toBeInstanceOf(Error)` en `src/main.test.tsx` (mata el
superviviente de `main.tsx`), (2) añadió un test de limpieza de listener en
`src/App.test.tsx` (mata los 2 supervivientes de la función de cleanup del
`useEffect` de resize), (3) extrajo `RUTAS_DE_SUBPAGINA` a un módulo puro
nuevo `src/App-logica.ts` (obligado por `oxlint`
`react-refresh/only-export-components`, no por preferencia) con su propio
`App-logica.test.ts` (mata los 4 supervivientes de la derivación de rutas),
(4) instrumentó `jsxDEV` vía `vi.mock` en `App.test.tsx` para verificar que
se registra un `<Route>` explícito por cada subpágina, no solo el comodín
`*` (mata el superviviente de la generación de `<Route>`), y (5) dejó
documentado y sin resolver con test un único superviviente
(`src/App.tsx:39:6`, array de dependencias del `useEffect` vaciado a
`['Stryker was here']`) con una investigación reproducible de por qué es un
mutante equivalente bajo la semántica de comparación de dependencias de
React — señalado explícitamente para que `mutation_tester` lo evalúe de
forma independiente, tal como exige `docs/mutation-testing.md` ("solo el
`mutation_tester` mide y excluye, con justificación explícita"). Esta
revisión sustituye a la de ronda 1: cubre el código en su estado actual,
incluida esta ronda de refuerzo.

## Cobertura de escenarios (@s ↔ test)

- @s1: [x] "el elemento con id `root` deja de estar vacío tras ejecutar main.tsx" — `src/main.test.tsx:15-27`
- @s2: [x] "lanza una excepción cuyo mensaje menciona `root`, es instancia de `Error`, y no monta nada" — `src/main.test.tsx:29-45` (la aserción `rejects.toBeInstanceOf(Error)` es la adición de la ronda de refuerzo)
- @s3: [x] orden de las 8 secciones (`compareDocumentPosition`) + unicidad de los 7 id — `src/pages/Landing.test.tsx:44-61`
- @s4: [x] `it.each(COMPONENTES_CON_ANCLA)` (8 renders aislados sin ningún id de ancla) + montaje completo con los 7 id presentes — `src/pages/Landing.test.tsx:75-90`
- @s5: [x] sin `id="campanas"`, tarjetas/enlace apuntan a `/campanas` — `src/pages/Landing.test.tsx:92-105`
- @s6: [x] orden Formulario→Información dentro de `#contacto`, sin `aria-label`/`aria-labelledby` propio, sin región/encabezado "Contacto" adicional — `src/pages/Landing.test.tsx:107-127`
- @s7: [x] `it.each` de 4 rutas: un `contentinfo`, botón de paleta, logotipo `href="#inicio"` antes del pie — `src/App.test.tsx:48-65`
- @s8: [x] clic en `#servicios` no cambia el pathname, sí el hash, Landing sigue montado — `src/App.test.tsx:67-79`
- @s9: [x] ancho de escritorio antes de montar → navegación con 8 enlaces, sin botón "Abrir menú" — `src/App.test.tsx:81-91`
- @s10: [x] resize real (`window.dispatchEvent`) cambia de rama sin recarga — `src/App.test.tsx:93-107`; refuerzo de limpieza de listener (mata mutantes 38:12/38:45) — `src/App.test.tsx:109-145`
- @s11: [x] `ANCHO_ANTES_DE_MEDIR` cae en rama móvil antes de medir — `src/App.test.tsx:147-155`
- @s12: [x] `it.each` de 3 rutas de subpágina: catch-all + enlace de vuelta + shell común — `src/App.test.tsx:157-170`; refuerzo con `<Route>` explícito por subpágina vía `jsxDEV` — `src/App.test.tsx:172-191`; valor exacto de `RUTAS_DE_SUBPAGINA` — `src/App-logica.test.ts:14-20`
- @s13: [x] `/esto-no-existe` recibe el mismo catch-all + shell común — `src/App.test.tsx:193-203`
- @s14: [x] botón de paleta no se interpone entre las 8 secciones — `src/App.test.tsx:210-238`
- @s15: [x] cubierto con evidencia cruda real, no una afirmación. Reproducido de forma independiente en esta revisión, con comandos propios, no solo releído de la bitácora: `pnpm run build` produce código de salida 0, `tsc -b` limpio, `vite build` genera `dist/assets/index-CxRbSSM7.js` (hash distinto al de la bitácora porque el build de esta revisión es posterior, mismo patrón y mismo resultado: build limpio); `pnpm run preview` (puerto 4173) arrancado en segundo plano, `curl -s -D -` real devuelve `HTTP/1.1 200 OK` en `/`; `curl -s -o /dev/null -w` real devuelve `200` en `/campanas`, `/blog`, `/tienda` y `/esto-no-existe`; el cuerpo de `/` contiene `<div id="root">` vacío y `<script type="module" src="/assets/index-CxRbSSM7.js">`, confirmando que sirve el bundle recién construido. Servidor de preview detenido tras la verificación. Documentado también en `progress/tdd_ensamblaje_landing.md:269-359`, con límite honesto declarado (sin navegador real disponible en la sesión de TDD; jsdom no ejecuta `<script type="module">`). Correctamente fuera del gate de Vitest/Stryker por Decisión 11, declarado explícitamente en el propio `.feature`.

15/15 escenarios cubiertos.

## Puntos de atención especial del encargo

**(a) Ningún componente `done` se autoasigna un id de ancla (Decisión 17, precedente `servicios` ronda 1).**
`grep -n "id="` sobre los 9 componentes con ancla contratada más `CampanasPortada.tsx` (Hero, Servicios, Equipo, ReservaChat, Galeria, FormularioContacto, InformacionContacto, Faq, CampanasPortada): los únicos `id` presentes son internos y ya aprobados en sus propias features — campos de formulario (`ID_NOMBRE`/`ID_TELEFONO`/etc.), `campanas-aviso-demostracion`, `galeria-aviso-demostracion`, `faq-respuesta-${indice}` del acordeón (`src/components/Faq.tsx:16`, literalmente nunca igual a `"faq"`, confirmado además por @s3/@s4 en verde: si colisionara, `querySelectorAll('#faq')` daría 2). Ninguno coincide con `inicio`/`servicios`/`equipo`/`reservar`/`galeria`/`contacto`/`faq`. Confirmado con `git diff --stat HEAD -- src/components/` (salida vacía: ningún fichero de `src/components/` fue tocado por esta feature) y con `git status --porcelain` (solo `progress/current.md`, `progress/judge_*`/`mutation_*`/`tdd_*` y los 7 ficheros nuevos de `src/main*`, `src/App*`, `src/pages/` aparecen como pendientes; ningún componente). `src/pages/Landing.tsx:20-44` es quien envuelve cada componente con `<div id="...">`, exactamente como exige la Decisión 17. El precedente de `servicios` ronda 1 no se reabrió.

**(b) BrowserRouter, nunca HashRouter (Decisión 19).**
`src/App.tsx:2` importa `BrowserRouter` de `react-router`. `grep -rn HashRouter src/` no encuentra ninguna coincidencia en todo el árbol. Confirmado además con evidencia de build/preview real reproducida en esta revisión: las 4 rutas (`/`, `/campanas`, `/blog`, `/tienda`, `/esto-no-existe`) devuelven `200` con `vite preview`, comportamiento del fallback SPA que exige `BrowserRouter` (con `HashRouter` no haría falta ese fallback en absoluto: el servidor nunca vería el fragmento).

**(c) Ancho de Cabecera desde `window.innerWidth` real, con listener y limpieza correctos; valor inicial cae en rama móvil.**
`src/App.tsx:18-32` (`useAnchoDeVentana`): `useState(ANCHO_ANTES_DE_MEDIR)` (línea 20, `ANCHO_ANTES_DE_MEDIR = 0`, línea 16) — `esMovil` (`src/components/Cabecera-logica.ts:17-22`) cae a móvil para cualquier valor que no sea mayor que 0 (`!(anchoVentana > 0)`), así que `0` cae limpiamente en la rama móvil por construcción, sin reimplementar la regla. El `useEffect` (líneas 22-29) llama a `leerAncho()` de inmediato al montar, suscribe `window.addEventListener('resize', leerAncho)` y devuelve la función de limpieza `() => window.removeEventListener('resize', leerAncho)` — sin fuga de listener, y ahora verificado explícitamente (no solo por inspección de código): `src/App.test.tsx:109-126` espía `addEventListener`/`removeEventListener`, desmonta con `unmount()` y confirma que `removeEventListener` se llama con el mismo manejador que registró `addEventListener`; `src/App.test.tsx:128-145` confirma que el listener se suscribe una única vez pese a un `resize` real que fuerza un re-render. `Cabecera.tsx:34-35` recibe `ancho` como prop pura y nunca toca `window.innerWidth` por su cuenta (`grep` confirma cero referencias a `innerWidth`/`resize` en `Cabecera.tsx`) — el cableado vive enteramente en `App.tsx`, tal como exige la Decisión 22.

**(d) `#contacto` sin `aria-label`/`aria-labelledby` propio; `aria-label` de los hijos intactos.**
`src/pages/Landing.tsx:37-40`: `<div id="contacto">` sin ningún atributo `aria-*`. Verificado con test explícito (`Landing.test.tsx:117-118`: `not.toHaveAttribute('aria-label')` / `'aria-labelledby'`, más `Landing.test.tsx:121-126`: ninguna región/encabezado/`[aria-label="Contacto"]` adicional en todo el documento). Los dos hijos conservan sus `aria-label` ya aprobados, sin tocar: `FormularioContacto.tsx` (`aria-label="Escríbenos"`) e `InformacionContacto.tsx` (`aria-label="Información de contacto"`) — confirmado por `git diff --stat` vacío sobre ambos ficheros (fuera del alcance de esta feature) y por los propios tests de `Landing.test.tsx:107-119`, que localizan el formulario y la región exactamente por esos nombres accesibles.

**(e) Rutas `/campanas`, `/blog`, `/tienda` derivadas de `src/data/navegacion.ts`, no retipeadas.**
`src/App-logica.ts:18-20`: `RUTAS_DE_SUBPAGINA = ENLACES_NAVEGACION.filter((enlace) => !esAncla(enlace.destino)).map((enlace) => enlace.destino)` — deriva directamente del catálogo (`src/data/navegacion.ts`, sin tocar), reutilizando `esAncla` de `Cabecera-logica.ts` en vez de reimplementar el criterio "empieza por #". `grep` sobre `App.tsx`/`Landing.tsx`/`main.tsx` no encuentra ningún literal de esas tres rutas retipeado a mano (el único literal vive en `src/data/navegacion.ts` y, como doble de test anclado al literal, en `App-logica.test.ts:18`, que es fuente de verdad de test, no de producción). `App.tsx:46-50` genera un `<Route>` por cada elemento de ese array derivado, verificado ahora no solo por su efecto visual (absorbido por el catch-all genérico) sino por la instrumentación de `jsxDEV` en `App.test.tsx:172-191`, que confirma que efectivamente se registran `<Route path="/campanas">`, `<Route path="/blog">` y `<Route path="/tienda">` como elementos distintos, no solo el comodín `*`.

## Disciplina TDD

- ¿Producción sin test que la pida? NO. Cada fichero de producción (main.tsx, App.tsx, App-logica.ts, Landing.tsx, PaginaNoEncontrada.tsx) tiene su ciclo documentado en `progress/tdd_ensamblaje_landing.md` (Ciclos 1-14 + Ronda de refuerzo 2), con "verde a la primera" verificado mediante sabotaje manual y reversión en los casos donde el primer test pasó sin cambio de producción (@s4, @s5, @s6, @s8, @s9, @s14). La extracción de `RUTAS_DE_SUBPAGINA` a `App-logica.ts` en la ronda de refuerzo no es código nuevo sin test: es el mismo comportamiento ya exigido por @s12/@s7, reubicado por una restricción real de lint (verificada por el propio `tdd_craftsman` corriendo `bin/harness init` con el `export` en `App.tsx` y viendo fallar exactamente con `react-refresh/only-export-components`), con su propio test (`App-logica.test.ts`) y con los 4 sabotajes manuales de la derivación documentados uno a uno.
- ¿Evidencia de Rojo→Verde→Refactor? SÍ. 14 ciclos explícitos con su fase ROJO/VERDE/REFACTOR (o la ausencia justificada), más la Ronda de refuerzo 2 con 5 sub-ciclos dirigidos a cada mutante superviviente concreto del informe de mutación (cada uno con ROJO/VERDE y sabotaje manual reproduciendo el mutante exacto antes de revertir). El hallazgo de entorno del Ciclo 11 (import nombrado inexistente no revienta en `vitest run`, sí en `tsc -b`) está bien documentado y resuelto sin atajos. Ningún refactor se hizo en rojo.

## Calidad

- `src/main.tsx` — `elementoRaiz()`/`errorElementoRaizAusente()` cortos, un solo motivo de cambio cada uno, mismo patrón de excepción nombrada que `errorTelefonoNoValido` (`src/lib/telefono.ts`), sin valores nulos silenciosos (Decisión 21 respetada literalmente).
- `src/App.tsx` — `useAnchoDeVentana()` y `App()` cortos y de responsabilidad única; `ANCHO_ANTES_DE_MEDIR`/`PUNTO_DE_CORTE_NAVEGACION_PX` (reutilizado, no redeclarado) evitan números mágicos; ya no calcula `RUTAS_DE_SUBPAGINA` inline (movido a `App-logica.ts` tras el hallazgo de lint de la ronda de refuerzo). El `.tsx` vuelve a "solo cablear", coherente con el patrón `logica-de-decision-en-modulo-puro-no-en-el-jsx` ya vigente en el proyecto.
- `src/App-logica.ts` — módulo puro de una sola derivación, con comentario que explica el por qué del traslado (no decorativo); cae ahora bajo el glob por defecto de Stryker (`src/**/*-logica.ts`), efecto colateral correcto, no buscado pero coherente con la arquitectura declarada.
- `src/pages/Landing.tsx` — una sola función de composición, sin lógica condicional ni estado; los 7 `<div id="...">` son la única responsabilidad del fichero, coherente con la Decisión 17 y con `project-spec.md` §Arquitectura.
- `src/pages/PaginaNoEncontrada.tsx` — trivial, sin duplicación.
- Contrato de errores correcto: el único estado de error de esta feature (`#root` ausente) lanza una excepción nombrada y verificable por mensaje (`/root/`) e instancia (`instanceof Error`, refuerzo de esta ronda), no un valor `null`/`undefined` silencioso.
- Arquitectura respetada: `main.tsx` → `App.tsx` (shell) → `pages/Landing.tsx` (contenido) → `components/*` (sin tocar) → `data/navegacion.ts` (fuente), exactamente el diagrama de `project-spec.md` §Arquitectura.
- `App.test.tsx` — el `vi.mock('react/jsx-dev-runtime', ...)` de la ronda de refuerzo envuelve la implementación real (`vi.fn(real.jsxDEV)`) sin cambiar comportamiento de render; `restoreMocks: true` (`vite.config.ts:66`) y el aislamiento por fichero de Vitest evitan fuga hacia otros ficheros de test.
- Sin `console.*`, `debugger`, `.only`/`.skip`, `TODO` en ningún fichero nuevo de esta feature (grep propio sobre los 9 ficheros: sin coincidencias).
- No hay dependencias externas nuevas no justificadas: `react-router` ya estaba en `package.json` desde antes de esta feature (Decisión 19 lo cita explícitamente).
- Fuera del glob de mutación por defecto de Stryker los `.tsx` de esta feature (main.tsx, App.tsx, Landing.tsx, PaginaNoEncontrada.tsx); `App-logica.ts` sí cae dentro del glob por defecto -- mordido y verificado a mano en la ronda de refuerzo (4/4 mutantes de la derivación matados por sabotaje).

## bin/harness init

Ejecutado de forma independiente en esta revisión: verde -- lint (oxlint --deny-warnings) sin errores, tsc -b sin errores, suite completa 343/343 tests (33 ficheros).

`pnpm run build` ejecutado de forma independiente: código de salida 0, tsc -b limpio, bundle generado. `pnpm run preview` + curl reales ejecutados de forma independiente: HTTP 200 OK en /, 200 en /campanas, /blog, /tienda y /esto-no-existe. Servidor de preview detenido tras la verificación.

## Checkpoints

- C1 -- [x] ficheros base presentes (AGENTS.md, CLAUDE.md, CHECKPOINTS.md, harness.config.json, feature_list.json, progress/current.md); docs presentes; bin/harness init exit 0 (verificado arriba).
- C2 -- [x] una sola feature in_progress (ensamblaje_landing, id 20, feature_list.json:307); toda feature done conserva sus tests en verde (343/343 incluye las 19 features previas); progress/current.md describe la sesión activa (bitácora acumulada de features previas ya cerradas, mismo formato aceptado en revisiones anteriores de este mismo proyecto -- no es basura suelta).
- C3 -- [x] src/ solo contiene los módulos previstos por project-spec.md §Arquitectura (main.tsx, App.tsx, App-logica.ts, pages/Landing.tsx, pages/PaginaNoEncontrada.tsx); sin dependencias externas nuevas no justificadas; sin logs de debug ni TODOs sin contexto.
- C4 -- [x] hay test por módulo nuevo (main.test.tsx, App.test.tsx, App-logica.test.ts, Landing.test.tsx); aislamiento real (jsdom + window/document reales del entorno de test); bin/harness test (parte de init) muestra 343 > 0 tests, todos verdes.
- C5 -- N/D a mitad de sesión (no es cierre de sesión: falta mutation_tester y el marcado done de craftsman_lead). No hay ficheros sin trackear sospechosos: git status --porcelain solo muestra progress/current.md (modificado) y los ficheros nuevos esperados de esta feature.
- C6 -- [x] features/ensamblaje_landing.feature existe con 15 escenarios @s1-@s15, cada Then mide algo concreto; sección propia en project-spec.md (Ensamblaje + Decisiones 15-22); mapa @s -> test completo en progress/tdd_ensamblaje_landing.md; sin código de producción que ningún test rojo haya pedido (ver Disciplina TDD arriba).
- C7 -- [ ] pendiente de medición independiente por mutation_tester, tras esta aprobación. progress/mutation_ensamblaje_landing.md actual documenta la medición de ronda 1 (FAIL, 66.67%, previa al refuerzo); queda desactualizado respecto al código de esta revisión y debe volver a medirse sobre el estado actual (main.tsx, App.tsx con App-logica.ts extraído, Landing.tsx, PaginaNoEncontrada.tsx), incluyendo la evaluación independiente del único superviviente documentado como candidato a equivalente (src/App.tsx:39:6, array de dependencias del useEffect) antes de excluirlo del score, tal como exige docs/mutation-testing.md.

## Cambios requeridos (si aplica)

Ninguno para esta puerta. Los 15 escenarios están cubiertos (14 por Vitest, @s15 por evidencia cruda real de pnpm run build/pnpm run preview reproducida de forma independiente en esta revisión), ninguno de los 12 componentes done fue tocado ni se autoasignó un id de ancla, el enrutador es BrowserRouter (sin rastro de HashRouter en el árbol), el ancho de Cabecera viene de window.innerWidth real con listener y limpieza correctos (ahora verificados con test explícito) y valor inicial en rama móvil, #contacto no lleva nombre accesible propio y los aria-label de sus dos hijos siguen intactos, y las tres rutas de subpágina derivan literalmente de ENLACES_NAVEGACION sin retipear. bin/harness init termina en verde. Pasa a mutation_tester para una medición nueva (C7), sobre el código posterior a la ronda de refuerzo 2.
