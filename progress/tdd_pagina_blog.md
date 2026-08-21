# TDD — `pagina_blog` (id 17)

> 31 escenarios (`features/pagina_blog.feature`, @s1-@s31). Ronda 1, TDD
> estricto desde cero. Todos los ciclos verificados ROJO→VERDE antes de
> escribir la siguiente pieza; refactor solo en verde.
>
> **Ronda 2 (refuerzo, tras `judge` CHANGES_REQUESTED):** ver sección
> "Ronda 2" al final de este fichero. El resto del documento (ronda 1) queda
> sin tocar, como historial.

## Resumen de entregables

- `src/data/blog.ts` — catálogo de demostración (`ARTICULOS_DEMO`, 6
  artículos), tipos `ArticuloDemo`/`BloqueDeCuerpo` (párrafo/encabezado/cita).
  El tipo **no declara** `autor`/`firma`/`iniciales` (R1 de la cabecera del
  `.feature`) — no hay nada que omitir, la forma del tipo ya lo impide.
- `src/lib/desplazamiento.ts` — `decidirComportamientoDesplazamiento`
  (auto/smooth), helper **nuevo y compartido**, envoltorio de
  `prefiereMenosMovimiento` (`Galeria-logica.ts`). No se tocó
  `PaginaCampanas-logica.ts` (ya `done` y mutado 100%): en vez de triplicar
  literalmente la función por tercera vez, se extrajo a `src/lib/` para que
  cualquier página futura la reutilice sin arrastrar un acoplamiento
  página-a-página.
- `src/pages/PaginaBlog-logica.ts` — lógica pura mordible por Stryker:
  `CATEGORIAS_PUBLICADAS` (derivada de `SERVICIOS.map(s => s.titulo)`,
  nunca retipeada), `normalizarCategoriaSeleccionada` (fail-closed a
  "Todos"), `filtrarPorCategoria`, `construirCatalogoBlog` (validador R1+R3,
  fail-closed), `PATRONES_PROHIBIDOS_DE_CONTENIDO` (exactamente 5),
  `VELOCIDAD_LECTURA_PPM`, `calcularTiempoDeLectura`,
  `formatearTiempoDeLectura`, `resolverArticulo`,
  `MAXIMO_ARTICULOS_RELACIONADOS`, `articulosRelacionados`.
- `src/pages/PaginaBlog.tsx` — listado "/blog" (aviso, filtro de categorías,
  tarjetas) y vista de artículo "/blog/:identificador" (`role="article"`,
  cuerpo semántico, tiempo de lectura, "Sigue leyendo", cierre con CTA). Solo
  cablea la lógica de `PaginaBlog-logica.ts`; ningún literal de negocio vive
  fuera de una constante nombrada.
- `src/App.tsx` / `src/App-logica.ts` / `src/App.test.tsx` /
  `src/App-logica.test.ts` — "/blog" sale del catch-all genérico y pasa a
  tener sus dos `<Route>` reales (ver sección dedicada más abajo).

## Trazabilidad @s → test

### A. El listado

| Escenario | Test(s) |
| --- | --- |
| @s1 | `PaginaBlog.test.tsx` → `@s1 el listado es una página propia con un único contenido principal y su encabezado` |
| @s2 | `PaginaBlog.test.tsx` → `@s2 la página comparte cabecera y pie con la landing y se señala como página actual` |
| @s3 | `PaginaBlog.test.tsx` → `@s3 el aviso de demostración encabeza el listado con su texto literal` |
| @s4 | `PaginaBlog.test.tsx` → `@s4 el listado muestra un enlace por artículo, en el orden del catálogo, con su destino propio` |
| @s5 | `PaginaBlog.test.tsx` → `@s5 cada tarjeta lleva la marca de demostración y ningún otro distintivo` |
| @s6 | `PaginaBlog.test.tsx` → `@s6 ninguna tarjeta atribuye el texto a una persona ni lo fecha` |

### B. El filtro por categoría

| Escenario | Test(s) |
| --- | --- |
| @s7 | `PaginaBlog-logica.test.ts` → `@s7 CATEGORIAS_PUBLICADAS es exactamente estos 5 títulos, en este orden` **+** `PaginaBlog.test.tsx` → `@s7 el filtro ofrece «Todos» más las cinco categorías publicadas...` (DOM: orden, 6 botones, `aria-pressed`) |
| @s8 | `PaginaBlog-logica.test.ts` → `filtrarPorCategoria` (con categoría) **+** `PaginaBlog.test.tsx` → `@s8 filtrar por una categoría deja exactamente los artículos de esa categoría` |
| @s9 | `PaginaBlog-logica.test.ts` → `normalizarCategoriaSeleccionada` (valor válido) **+** `PaginaBlog.test.tsx` → `@s9 el filtro aplicado queda escrito en la dirección` |
| @s10 | `PaginaBlog-logica.test.ts` → `normalizarCategoriaSeleccionada` (parámetro nulo/válido) **+** `PaginaBlog.test.tsx` → `@s10 entrar directamente por una dirección filtrada llega ya filtrado` |
| @s11 | `PaginaBlog-logica.test.ts` → `filtrarPorCategoria` (categoría sin artículos → `[]`) **+** `PaginaBlog.test.tsx` → `@s11 caso límite — una categoría publicada sin ningún artículo muestra el aviso de lista vacía` |
| @s12 | `PaginaBlog-logica.test.ts` → `@s12 un valor corrupto que no coincide con ninguna categoría publicada cae a "Todos"` **+** `PaginaBlog.test.tsx` → `@s12 caso límite — un valor de categoría corrupto cae a «Todos» sin escribir basura` |
| @s13 | `PaginaBlog.test.tsx` → `@s13 caso límite — con el catálogo de demostración vacío no se pinta ninguna tarjeta ni texto de relleno` (con `catalogo=[]` inyectado) |

### C. La vista de artículo

| Escenario | Test(s) |
| --- | --- |
| @s14 | `PaginaBlog.test.tsx` → `@s14 abrir un artículo lleva a su propia dirección y lo muestra completo` |
| @s15 | `PaginaBlog.test.tsx` → `@s15 la vista de artículo repite el aviso de demostración antes del cuerpo` |
| @s16 | `PaginaBlog.test.tsx` → `@s16 el cuerpo del artículo se pinta con elementos semánticos reales` (catálogo con doble propio, cuerpo de demo-3 con 2 párrafos + 2 encabezados + 1 cita, per Background) |
| @s17 | `PaginaBlog.test.tsx` → `@s17 el artículo no muestra firma de autor, ni iniciales, ni fecha de publicación` |
| @s18 | `PaginaBlog-logica.test.ts` → `@s18 el tiempo de lectura se calcula del cuerpo a la velocidad declarada` (tabla completa: 1→1, 200→1, 201→2, 400→2, 401→3 min) + assert `VELOCIDAD_LECTURA_PPM === 200` |
| @s19 | `PaginaBlog-logica.test.ts` → `@s19 caso límite — un cuerpo sin ninguna palabra no produce tiempo de lectura` (`[]` y bloques en blanco) **+** `PaginaBlog.test.tsx` → `@s19 caso límite — un cuerpo sin ninguna palabra no muestra tiempo de lectura` (doble de demo-5, DOM: sin "0 min") |
| @s20 | `PaginaBlog.test.tsx` → `@s20 volver al listado conserva el filtro con el que se llegó` |
| @s21 | `PaginaBlog-logica.test.ts` → `resolverArticulo` (id inexistente → `undefined`) **+** `PaginaBlog.test.tsx` → `@s21 caso límite — un identificador de artículo inexistente no pinta un artículo vacío` |
| @s22 | `PaginaBlog-logica.test.ts` → `@s22/@s23 articulosRelacionados ofrece artículos de la misma categoría, nunca el actual` **+** `PaginaBlog.test.tsx` → `@s22 «Sigue leyendo» ofrece artículos de la misma categoría y nunca el actual` |
| @s23 | `PaginaBlog-logica.test.ts` → `@s23 sin otros artículos de su categoría, devuelve un array vacío` **+** `PaginaBlog.test.tsx` → `@s23 caso límite — sin otros artículos de su categoría, el bloque «Sigue leyendo» no existe` |
| @s24 | `PaginaBlog.test.tsx` → `@s24 el cierre del artículo invita a pedir cita sin prometer nada` |

### D. Las puertas del contenido

| Escenario | Test(s) |
| --- | --- |
| @s25 | `PaginaBlog-logica.test.ts` → `@s25 el validador rechaza cualquier artículo que declare autor, firma o iniciales` (4 tests: mensaje con id+campo, instancia real de `Error` con mensaje exacto, "firma", "iniciales", y "no se renderiza ningún artículo" verificado como `resultado` nunca asignado tras el `throw`) |
| @s26 | `PaginaBlog-logica.test.ts` → `@s26 el validador rechaza precios, teléfonos, porcentajes de eficacia y promesas de resultado` (longitud exacta de `PATRONES_PROHIBIDOS_DE_CONTENIDO === 5`, `it.each` de las 5 filas literales de la tabla del `.feature`, un artículo limpio que sí pasa, y la comprobación de "nunca se renderiza") |
| @s27 | `PaginaBlog.test.tsx` → `@s27 ningún artículo habla en nombre de la clínica ni hereda nada del prototipo` (recorre el listado + los 6 artículos reales, texto agregado, scoped a `role="article"`/títulos del listado — nunca al aviso de demo compartido, que sí menciona "Galapavet" para aclarar que la clínica no lo escribió) |
| @s28 | `PaginaBlog.test.tsx` → `@s28 las imágenes son locales y solo describen lo que se ve` |
| @s29 | `src/lib/desplazamiento.test.ts` → `@s29 el desplazamiento al cambiar de vista respeta la preferencia de movimiento` (las 2 filas exactas de la tabla del `.feature`) |

### E. Cierres de cobertura

| Escenario | Test(s) |
| --- | --- |
| @s30 | `PaginaBlog-logica.test.ts` → `@s30 caso límite — con más de tres candidatos, articulosRelacionados nunca devuelve más de 3` (5 artículos, uno actual, verifica exactamente `[otro-1, otro-2, otro-3]` y que `otro-4` no aparece) |
| @s31 | `PaginaBlog.test.tsx` → `@s31 el tiempo de lectura calculado se muestra en una página de artículo real` (doble de demo-2 con exactamente 200 palabras, montado por rutas reales, `"1 min"` dentro de `role="article"`) |

Cobertura completa: los 31 `@s` tienen al menos un test concreto: 24 en
`PaginaBlog.test.tsx` (DOM/integración sobre rutas reales), 20 casos
cubiertos también o exclusivamente en `PaginaBlog-logica.test.ts` (lógica
pura), y @s29 en `src/lib/desplazamiento.test.ts`.

## Ciclos Rojo-Verde-Refactor (orden real de ejecución)

1. **`src/lib/desplazamiento.ts`** (@s29). ROJO: `desplazamiento.test.ts`
   falla por módulo inexistente (`Failed to resolve import`). VERDE: se creó
   el módulo, envoltorio de `prefiereMenosMovimiento`. Sin refactor (ya
   mínimo, 2/2 tests en verde).
2. **`src/pages/PaginaBlog-logica.ts`** (@s7-@s12, @s18, @s19, @s21-@s23,
   @s25, @s26, @s30). ROJO: `PaginaBlog-logica.test.ts` (36 tests) falla por
   módulo inexistente. VERDE: se escribió el módulo completo en un solo
   paso, dado que todas las funciones comparten el mismo tipo de entrada
   (`ArticuloDemo`) y el mismo estilo de guarda fail-closed ya usado en
   `PaginaCampanas-logica.ts` — 36/36 en verde a la primera pasada. REFACTOR:
   ninguno necesario (funciones ya cortas, sin duplicación); se verificó con
   `pnpm run lint`/`pnpm run typecheck` (2 hallazgos de lint reales,
   corregidos: `cuerpoConPalabras` local sin captura → movida a scope de
   módulo; `toThrowError()` sin matcher → se añadió `/texto prohibido/`).
3. **`src/pages/PaginaBlog.tsx`** (@s1-@s6, @s7 DOM, @s8-@s17, @s19 DOM,
   @s20-@s24, @s27, @s28, @s31). ROJO: `PaginaBlog.test.tsx` (26 tests) falla
   por módulo inexistente. VERDE: se escribió el componente completo
   (`VistaListado`, `FiltroCategorias`, `TarjetaArticulo`, `VistaArticulo`,
   `CuerpoArticulo`, `CierreArticulo`, `BloqueSigueLeyendo`) más el cableado
   de `App.tsx`/`App-logica.ts` en el mismo paso, porque `PaginaBlog.test.tsx`
   usa `renderizarApp()` (como `PaginaCampanas.test.tsx`) para la mayoría de
   escenarios y no podía pasar sin la ruta real registrada. Primera pasada:
   25/26 verdes, 1 fallo de test (no de producción): `@s11` usaba
   `getAllByRole('link')` sobre un contenedor sin enlaces, que lanza en vez
   de devolver `[]` — corregido a `queryAllByRole`. Segunda pasada: 26/26.
   REFACTOR (en verde): se extrajo `parametroCategoria(categoria)` para
   eliminar la duplicación entre `destinoArticulo`/`destinoListado` (mismo
   condicional `?categoria=…` repetido); se re-verificó 26/26 tras el
   cambio. Lint encontró 4 hallazgos reales adicionales, corregidos sin
   tocar comportamiento: `role="group"` → `<fieldset>` (mapea a role
   "group" igual, jsx-a11y `prefer-tag-over-role`); claves de `.map` por
   índice en `CuerpoArticulo` → clave `${tipo}-${texto}`; dos spreads dentro
   de `.map()` en el test → `Object.assign`; un `expect` condicional en el
   test de @s21 → reescrito como aserción incondicional (`queryByRole` no
   está en el documento, en vez de "si existe, que no esté vacío").
4. **`src/App.tsx` / `src/App-logica.ts` / `src/App.test.tsx` /
   `src/App-logica.test.ts`** — ver sección dedicada abajo.

## Cambio en `App.tsx` / `App-logica.ts` / `App.test.tsx`

Mismo patrón que `pagina_campanas` aplicó a "/campanas" (ver
`progress/tdd_pagina_campanas.md`), con la diferencia de que la ruta de
detalle del blog es un **segmento de ruta** (`/blog/:identificador`), no un
parámetro de query (`?campana=`) — así lo fija el propio `.feature` (@s4/@s14).

### `src/App-logica.ts`

```diff
- const RUTAS_YA_CON_PAGINA_PROPIA: ReadonlySet<string> = new Set(['/campanas'])
+ const RUTAS_YA_CON_PAGINA_PROPIA: ReadonlySet<string> = new Set(['/campanas', '/blog'])
```

Efecto: `RUTAS_DE_SUBPAGINA` (derivada de `ENLACES_NAVEGACION` filtrando
anclas y rutas ya aterrizadas) pasa de `['/blog', '/tienda']` a
`['/tienda']`. Verificado en `src/App-logica.test.ts` (literal escrito a
mano, nunca reimportado de `ENLACES_NAVEGACION`).

### `src/App.tsx`

```diff
  import { Landing } from './pages/Landing'
+ import { PaginaBlog } from './pages/PaginaBlog'
  import { PaginaCampanas } from './pages/PaginaCampanas'
  import { PaginaNoEncontrada } from './pages/PaginaNoEncontrada'
  ...
        <Route path="/" element={<Landing />} />
        <Route path="/campanas" element={<PaginaCampanas />} />
+       <Route path="/blog" element={<PaginaBlog />} />
+       <Route path="/blog/:identificador" element={<PaginaBlog />} />
        {RUTAS_DE_SUBPAGINA.map((ruta) => (
```

Dos `<Route>` reales, no una: el listado ("/blog") y el artículo
("/blog/:identificador") son dos vistas de la misma página con distinto
parámetro de ruta — mismo componente `PaginaBlog`, que decide internamente
con `useParams()` si `identificador` está presente.

### `src/App.test.tsx`

El test iterado `@s12` (`it.each(['/blog', '/tienda'])`, verificaba que
ambas rutas servían el catch-all "Página no encontrada") pasa a
`it.each(['/tienda'])`, con un comentario explícito explicando el motivo
("/blog" ya no es 404, tiene su propia `<Route>` real) y remitiendo la
cobertura de contenido real de "/blog" a `PaginaBlog.test.tsx`. El resto de
`App.test.tsx` (@s7-@s11, @s13, @s14) no cambió: itera literales `['/',
'/campanas', '/blog', '/tienda']` para verificar propiedades genéricas del
shell (banner/contentinfo únicos, logotipo antes del pie) que siguen siendo
ciertas para "/blog" con contenido real — no se tocaron esos tests porque
seguían en verde sin cambios.

### Por qué no rompe `pagina_campanas` ni `ensamblaje_landing`

- **`pagina_campanas`**: no se tocó `PaginaCampanas.tsx`,
  `PaginaCampanas-logica.ts` ni sus tests; `/campanas` sigue en
  `RUTAS_YA_CON_PAGINA_PROPIA` sin cambios. Los 41 escenarios de esa feature
  se re-verificaron en la corrida completa (`pnpm exec vitest run`, 469/469)
  sin ninguna modificación de esos ficheros.
- **`cabecera_y_navegacion`**: `Cabecera.tsx`/`Cabecera-logica.ts` no se
  tocaron; el nuevo `aria-current="page"` de "Blog" en `/blog` reutiliza
  `rutaActual`/`esPaginaActual`, ya construidos y ya probados por
  `pagina_campanas`. `Cabecera.test.tsx` (16 tests) sigue en verde sin
  cambios.
- **`ensamblaje_landing`**: `src/main.tsx`, `src/pages/Landing.tsx` y
  `src/pages/PaginaNoEncontrada.tsx` no se tocaron. El único fichero de esa
  feature que cambia de comportamiento observable es el catch-all genérico,
  que deja de cubrir "/blog" — cambio **ya previsto** por el propio
  criterio de aceptación de esa feature ("catch-all... hasta que sus propias
  features aterricen su propia Route") y ya practicado una vez con
  "/campanas". `features/ensamblaje_landing.feature` **no se ha tocado en
  esta sesión** (@s12 de ese `.feature` seguía citando solo "/blog"/"/tienda"
  tras el cierre de `pagina_campanas"; ahora con `pagina_blog` cerrada
  quedará desactualizado en el mismo sentido que ya se corrigió una vez para
  "/campanas") — corresponde al `craftsman_lead` sincronizar ese texto al
  cerrar esta feature, igual que hizo para `pagina_campanas`
  (`progress/current.md`, entrada del 20-21/08/2026, "Deuda de contrato
  detectada y resuelta en el cierre").

## Verificación final

- `pnpm exec vitest run` → **469/469 tests, 38/38 ficheros**, sin tocar
  ningún test de una feature `done` (solo se añadieron/actualizaron
  `App.test.tsx`/`App-logica.test.ts`, ya justificado arriba).
- `pnpm run lint` (`oxlint --deny-warnings`) → limpio.
- `pnpm run typecheck` (`tsc -b`) → limpio.
- `pnpm run build` (`tsc -b && vite build`) → éxito, `dist/` generado.
- `node .harness/harness.mjs init` → **verde de punta a punta** (lint,
  typecheck, 469/469 tests).

No se ha ejecutado la prueba de mutación en esta ronda (corresponde al
`mutation_tester`, tras el veredicto del `judge`).

---

## Ronda 2 (refuerzo tras `judge` CHANGES_REQUESTED)

`progress/judge_pagina_blog.md` completo (veredicto de la ronda 1).

### Hallazgo 1 (bloqueante) — `src/lib/desplazamiento.ts` era código muerto

`decidirComportamientoDesplazamiento` tenía test propio
(`desplazamiento.test.ts`) pero ningún fichero de producción lo invocaba:
abrir un artículo desde el listado (@s14) no disparaba ningún
`window.scrollTo`. El `judge` señaló el patrón gemelo ya establecido en
`src/pages/PaginaCampanas.tsx:211-217` (`useEffect` en `VistaFicha` que
llama `window.scrollTo({ top: 0, behavior: decidirComportamientoDesplazamiento(window.matchMedia) })`
al cambiar de campaña, con test de integración que mockea
`window.scrollTo` en `PaginaCampanas.test.tsx:482-518`) y pidió cablear el
mismo patrón en `VistaArticulo` de `PaginaBlog.tsx`, o retirar el módulo y
reabrir `@s29` con `gherkin_author`. Se eligió la primera vía (la
coherente con la cabecera del propio contrato, punto 11: "el comportamiento
se decide en lógica pura (@s29)" — @s29 nunca dijo que no debía *usarse*,
solo que su cálculo es lógica pura y por tanto mordible).

**Ciclo Rojo-Verde-Refactor (único, un solo ciclo para todo el hallazgo):**

- **ROJO**: se añadió `describe('@s29 el desplazamiento al abrir un
  artículo respeta la preferencia de movimiento', …)` en
  `PaginaBlog.test.tsx`, con 2 tests (mismo patrón que
  `PaginaCampanas.test.tsx` @s21/@s22: helper `fijarPreferenciaDeMovimiento`
  copiado literalmente de ese fichero, doble de `matchMedia` anclado a mano
  a la consulta `'(prefers-reduced-motion: reduce)'`, nunca a la constante
  de producción). Se clicó el enlace al "Artículo de demostración 3" desde
  el listado y se afirmó `window.scrollTo` llamado con
  `{ top: 0, behavior: 'auto' }` (preferencia "menos movimiento") y con
  `{ top: 0, behavior: 'smooth' }` (sin esa preferencia). Ejecución
  independiente confirmó el fallo esperado, por el motivo correcto (`Number
  of calls: 0` — nunca se llamaba a `window.scrollTo`, no un error de
  compilación ni de selector): 2 tests rojos, los 26 anteriores seguían
  verdes.
- **VERDE**: en `src/pages/PaginaBlog.tsx`, `VistaArticulo` importa
  `decidirComportamientoDesplazamiento` de `../lib/desplazamiento` y añade
  un `useEffect` (antes del `return` condicional de "artículo no
  encontrado", para respetar las reglas de hooks) que llama
  `window.scrollTo({ top: 0, behavior: decidirComportamientoDesplazamiento(window.matchMedia) })`
  con dependencia `[identificador]` — mismo patrón exacto que
  `PaginaCampanas.tsx:211-217`, adaptado a la prop `identificador` (segmento
  de ruta) en vez de `campana.id`. Ejecución independiente: 28/28 en verde
  en `PaginaBlog.test.tsx`.
- **REFACTOR**: ninguno necesario — el cambio ya es mínimo (1 import, 1
  `useEffect` de 3 líneas, sin duplicación con `PaginaCampanas.tsx` porque
  ambos ya comparten el helper `decidirComportamientoDesplazamiento` de
  `src/lib/desplazamiento.ts`, que es justamente el módulo que este hallazgo
  obligaba a *usar*, no a *reescribir*). `pnpm run lint` y `pnpm run
  typecheck` limpios sin cambios adicionales.

**Trazabilidad actualizada de @s29**: ahora cubierto por
`src/lib/desplazamiento.test.ts` (cálculo puro, sin cambios) **+**
`PaginaBlog.test.tsx` → `@s29 el desplazamiento al abrir un artículo
respeta la preferencia de movimiento` (integración real: el módulo puro
gobierna de verdad lo que ve el visitante al abrir un artículo).

### Hallazgo 2 (no bloqueante, seguimiento) — `ensamblaje_landing.feature` desactualizado

El propio informe del `judge` lo asigna explícitamente al `craftsman_lead`
al aceptar la feature ("no bloquea `pagina_blog`, pero queda como cambio de
seguimiento para `craftsman_lead` al aceptar esta feature"), mismo patrón
ya practicado al cerrar `pagina_campanas`. No se toca
`features/ensamblaje_landing.feature` desde esta ronda de `tdd_craftsman`:
fuera de mandato, corresponde a la puerta de cierre.

### Verificación final de la ronda 2

- `pnpm exec vitest run src/pages/PaginaBlog.test.tsx` → **28/28** (26 de la
  ronda 1 + 2 nuevos de @s29), verificado en rojo antes y en verde después.
- `pnpm exec vitest run` (suite completa) → **471/471 tests, 38/38
  ficheros** (469 de la ronda 1 + 2 nuevos), ningún test de una feature
  `done` tocado ni roto.
- `pnpm run lint` (`oxlint --deny-warnings`) → limpio.
- `pnpm run typecheck` (`tsc -b`) → limpio.
- `node .harness/harness.mjs init` → verde de punta a punta.

### Ficheros tocados en esta ronda

- `src/pages/PaginaBlog.tsx` — import de `decidirComportamientoDesplazamiento`
  + `useEffect` en `VistaArticulo` (única producción nueva de la ronda).
- `src/pages/PaginaBlog.test.tsx` — helper `fijarPreferenciaDeMovimiento` +
  describe `@s29` (2 tests).

Ningún otro fichero de producción ni de test se tocó. `src/lib/desplazamiento.ts`
y `src/lib/desplazamiento.test.ts` quedan exactamente como en la ronda 1 —
el hallazgo pedía darle un consumidor real, no rehacer su lógica.

---

## Ronda 3 — cierre de huecos de mutación (`judge` APPROVED en ronda 2, `mutation_tester` FAIL: 99/118 = 83.90% bruto, 99/116 = 85.34% sobre no equivalentes)

> Alcance: exactamente los 17 mutantes reales (2 equivalentes ya excluidos por
> el propio `mutation_tester`) que documenta `progress/mutation_pagina_blog.md`,
> los 17 concentrados en `src/pages/PaginaBlog-logica.ts` (líneas 27, 66-70,
> 74, 112). No se toca nada del veredicto `judge` (APPROVED, sin cambios
> pedidos) ni ningún fichero fuera de ese único módulo.

### Decisión de diseño

Los 17 supervivientes son, en la propia lectura del informe, huecos de
aserción/entrada — nunca defectos de comportamiento: la producción real ya
implementa exactamente los cinco patrones y las dos funciones (`normalizarCategoriaSeleccionada`,
`calcularTiempoDeLectura`/`contarPalabras`) que exige el contrato; lo que
faltaba eran casos de prueba que ejercitaran formatos límite (importe/porcentaje
sin espacio, teléfono corto o sin un separador, categoría con espacios
sobrantes, valor de repliegue con una lista que admite `''`, cuerpo de varios
bloques, espaciado irregular) y, en dos casos (id 24 y 45), una aserción sobre
el fragmento exacto capturado en el mensaje de error en vez de solo
`.toContain('demo-prohibido')`. Mismo criterio ya aplicado en esta sesión a
`reserva_chat` ronda 3 y `tokens_marca` intento 2 (citados también por el
propio informe de mutación): cuando el comportamiento correcto ya existe y
solo falta la entrada/aserción que lo distinga del mutante, la corrección es
un test dirigido, no producción que ningún rojo de comportamiento observable
pide (Ley 1 en sentido estricto — y en sentido contrario, Ley 3: no se toca
`PaginaBlog-logica.ts`).

**Cero cambios en `PaginaBlog-logica.ts` en esta ronda** — confirmado con
`git diff --stat src/pages/PaginaBlog-logica.ts` vacío tras la ronda completa
(ver "Verificación final de la ronda 3" más abajo).

### Nota de honestidad sobre "rojo" (mismo patrón que `reserva_chat` ronda 3 / `tokens_marca` intento 2)

Los 13 tests nuevos de `src/pages/PaginaBlog-logica.test.ts` no se pusieron en
rojo contra la producción real (que ya era correcta). El "rojo" de cada uno lo
provocó el mutante exacto que documenta `progress/mutation_pagina_blog.md`,
aplicado a mano uno a la vez sobre `PaginaBlog-logica.ts`, confirmado en rojo,
y revertido antes de aplicar el siguiente — nunca dos sabotajes activos a la
vez. Los 17 ids del informe quedaron verificados uno a uno:

| Mutante(s) del informe | Sabotaje aplicado (línea) | Test que cae en rojo | Resultado exacto observado |
| --- | --- | --- | --- |
| id 26 | `/\d+\s?€/` → `/\d+\s€/` (línea 66) | "un precio sin espacio antes de € también se rechaza" | única falla: `to throw` recibe `undefined` |
| id 25 | `/\d+\s?€/` → `/\D+\s?€/` | mismo test + "el mensaje... contiene el importe completo" | 2 fallas (el mismo mutante también rompe el anclaje de fragmento, ya que `\D+` captura solo el espacio) |
| id 24 | `/\d+\s?€/` → `/\d\s?€/` | "el mensaje de error del precio contiene el importe completo capturado" | única falla: mensaje trae `"9 €"` en vez de `"49 €"`; el test de "sin espacio" sigue verde (confirmado no-distinguible por existencia, tal como documentó el informe) |
| id 28 | `\d{2,3}` (1er grupo) → `\d` (línea 67) | "una referencia corta de 7 dígitos... pasa la validación" | única falla: lanza sobre "1234567" cuando no debería |
| id 33 | `\d{2}` (2º grupo) → `\d` | mismo test | única falla, mismo motivo |
| id 43 | `\d{2}` (4º grupo) → `\d` | mismo test | única falla, mismo motivo |
| id 30 | `[\s.]?` (1er separador) → `[\s.]` | "un teléfono escrito sin el primer separador también se rechaza" | única falla: `to throw` recibe `undefined` sobre "64022 11 90" |
| id 35 | `[\s.]?` (2º separador) → `[\s.]` | "...sin el segundo separador..." | única falla sobre "640 2211 90" |
| id 40 | `[\s.]?` (3er separador) → `[\s.]` | "...sin el tercer separador..." | única falla sobre "640 22 1190" |
| id 47 | `/\d+\s?%/` → `/\d+\s%/` (línea 68) | "un porcentaje sin espacio antes de % también se rechaza" | única falla: `to throw` recibe `undefined` |
| id 46 | `/\d+\s?%/` → `/\D+\s?%/` | mismo test + "el mensaje... contiene la cifra completa" | 2 fallas, mismo patrón que id 25 |
| id 45 | `/\d+\s?%/` → `/\d\s?%/` | "el mensaje de error del porcentaje contiene la cifra completa capturada" | única falla: mensaje trae `"0 %"` en vez de `"90 %"` |
| id 49 | `/24\s?h\b/i` → `/24\sh\b/i` (línea 70) | "el reclamo 24h sin espacio también se rechaza" | única falla: `to throw` recibe `undefined` |
| id 2 | `.trim()` eliminado (línea 27) | "una categoría válida rodeada de espacios se recorta..." | única falla: `' Análisis '` no coincide, devuelve `null` en vez de `'Análisis'` |
| id 4 | `''` → `'Stryker was here!'` (línea 27, repliegue) | "con categoriaParam nulo y una categoriasValidas que admite la cadena vacía..." | única falla: devuelve `null` en vez de `''` |
| id 53 | `.join(' ')` → `.join('')` (línea 74) | "el separador entre bloques del cuerpo cuenta como espacio real: 100+101 palabras..." | única falla: `1` en vez de `2` minutos (201 vs 200 palabras) |
| id 74 | `split(/\s+/)` → `split(/\s/)` (línea 112) | "el espaciado irregular (doble espacio)... siguen siendo 200, no 399" | única falla: `2` en vez de `1` minuto |

Tras cada sabotaje se confirmó `PaginaBlog-logica.ts` idéntico al original
(releído/`git diff` vacío) antes de continuar con el siguiente.

### Tests añadidos (`src/pages/PaginaBlog-logica.test.ts`, 13 tests nuevos, cero producción)

Tres describes nuevos al final del fichero, cada uno rotulado explícitamente
como refuerzo de mutación de la ronda 3, con el/los id del informe citados en
el nombre del test:

- `@s26 refuerzo de mutación — variantes de formato sin espacio y fragmento
  exacto del mensaje` (9 tests): precio sin espacio ("49€"), fragmento exacto
  del precio ("49 €"), porcentaje sin espacio ("90%"), fragmento exacto del
  porcentaje ("90 %"), "24h" sin espacio, teléfono sin cada uno de los 3
  separadores, y una referencia corta de 7 dígitos sin separadores que
  **pasa** la validación (no es un teléfono real). Ninguno de estos formatos
  amplía el contrato: `@s27` ya los cita literalmente como texto prohibido
  ("640221190", "918442160", "24h", el símbolo "€", el símbolo "%", todos sin
  espacio) — este refuerzo solo hace que el patrón de `@s26` los detecte con
  la misma exigencia que `@s27` ya presupone.
- `@s9/@s10/@s12 refuerzo de mutación — normalizarCategoriaSeleccionada ancla
  el recorte y el repliegue exactos` (2 tests): categoría válida rodeada de
  espacios, y `categoriaParam` nulo con una `categoriasValidas` que admite
  explícitamente `''`.
- `@s18 refuerzo de mutación — separador entre bloques y espaciado irregular
  del tiempo de lectura` (2 tests): cuerpo de 2 bloques (100+101 palabras) que
  solo suma 201 si el espacio entre bloques cuenta de verdad; cuerpo de 200
  palabras separadas por doble espacio que debe seguir contando 200, no 399.

### Verificación final de la ronda 3

- `pnpm exec vitest run src/pages/PaginaBlog-logica.test.ts
  src/pages/PaginaBlog.test.tsx`: **77/77 verde** (49 en `-logica.test.ts` = 36
  previos + 13 refuerzo; 28 en `.test.tsx`, sin cambios) con la producción
  real, sin sabotajes activos.
- `git diff --stat src/pages/PaginaBlog-logica.ts`: **vacío** — cero cambios
  de producción en esta ronda, confirmando Ley 3.
- `node .harness/harness.mjs init`: **verde** de punta a punta (lint,
  typecheck, suite completa).
- No se toca `feature_list.json`: la feature sigue `in_progress`, a la espera
  de que `judge` revise los 13 tests nuevos y de que `mutation_tester` repita
  su propia medición oficial — no me corresponde marcarla `done`.

### Pendiente para las siguientes puertas (ronda 3)

- `judge`: revisar que los 13 tests nuevos de `PaginaBlog-logica.test.ts`
  están correctamente atados a sus escenarios (`@s26`/`@s9`/`@s10`/`@s12`/`@s18`,
  sin escenario Gherkin nuevo), que ninguno se ancla a la constante de
  producción reimportada en vez del literal escrito a mano, y que
  `PaginaBlog-logica.ts` sigue exactamente igual que en la ronda 2 (sin
  cambios pedidos ahí).
- `mutation_tester`: repetir su propia medición oficial sobre
  `src/pages/PaginaBlog-logica.ts` para confirmar de forma independiente que
  los 17 ids listados arriba pasan a `Killed` y que el score alcanza el
  umbral (100% sobre no equivalentes, `harness.config.json` → `mutation.threshold`).
