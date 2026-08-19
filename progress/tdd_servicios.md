# TDD — servicios (id 5)

> `tdd_craftsman`. Feature: `features/servicios.feature` (19 escenarios,
> `@s1`-`@s19`), aprobada por la puerta humana. Contrato leído completo antes
> de empezar, junto con `AGENTS.md`, `docs/tdd.md`, `docs/architecture.md`,
> `docs/conventions.md`, `project-spec.md` (Decisiones 1, 3, 9; Invariantes
> 1-7) y `docs/datos-galapavet.md` §5.

## Estado previo confirmado

`node .harness/harness.mjs init` (no hay `pwsh` en esta máquina) **limpio**
antes del primer test rojo: lint, typecheck y 96/96 tests en verde. No se
encontró ningún problema de configuración fuera de `src/` que documentar en
este arranque (la sesión anterior ya había resuelto los dos que existían,
ver `progress/current.md`).

## Diseño de la solución

- `src/data/servicios.ts` — catálogo estático (`SERVICIOS`, `BloqueServicio`),
  igual patrón que `src/data/navegacion.ts`: sin lógica, transcrito literal
  de `docs/datos-galapavet.md` §5 y verificado independientemente por los
  tests (que usan sus propios literales escritos a mano, no este símbolo,
  siguiendo `doble-de-test-anclado-al-literal-no-al-simbolo`).
- `src/components/Servicios-logica.ts` — lógica pura mordible por mutación
  (`stryker.config.json` muta `src/**/*-logica.ts`):
  `rotuloBoton`, `puntosVisibles`, `tieneDesglose`, `nombreAccesibleBoton`.
- `src/components/Servicios.tsx` — cablea: `Servicios` (sección) +
  `TarjetaServicio` (una por bloque, con su propio `useState` de
  abierto/cerrado — independencia exigida por @s12/@s13).
- Decisiones de accesibilidad tomadas durante el diseño:
  - El rótulo **visible** del botón no cambia entre tarjetas (Aviso 6 del
    `.feature`: sigue siendo "Ver qué incluye"/"Ocultar detalle"), pero el
    **nombre accesible** sí, vía `aria-label="{rótulo} de {título}"`
    (@s14) — el nombre accesible sigue conteniendo el texto visible
    (WCAG 2.5.3), no diverge.
  - El colapso es real (el `<ul>` no se monta si `abierto` es falso), no
    CSS: satisface @s2/@s11/@s12 sin depender de clases (Invariante 5,
    `estado-condicional-en-atributo-aria-no-en-clase-css`).
  - Sin `<ul>` envolviendo las tarjetas en el nivel de sección (solo los
    `<article>` van directos dentro de `<section>`): así el rol
    `listitem` solo aparece para los puntos de desglose y no colisiona con
    la aserción de @s2 ("ningún punto... es consultable").
  - Catálogo vacío (@s17) ⇒ `Servicios` devuelve `null`: nada se monta, ni
    siquiera un `<section>` vacío.

## Ciclos Rojo-Verde-Refactor

### Lógica pura (`Servicios-logica.ts`)

1. **`rotuloBoton(false)`** → rojo (`is not a function`) → verde (rama
   colapsada). Añadido a continuación `rotuloBoton(true)` como test que
   verificó en verde sin cambio de producción: la implementación ya
   resolvía ambas ramas del ternario en el primer paso (desviación menor de
   la Ley 3 — hecho "de más" en el primer verde — anotada aquí en vez de
   ocultada).
2. **`puntosVisibles(['Uno', '   ', 'Dos'])`** → rojo → verde
   (`filter(p => p.trim().length > 0)`).
3. **`tieneDesglose([])` → `false`** → rojo → verde. El caso `true` (con
   blancos mezclados) se añadió después y ya estaba en verde (misma
   desviación que el punto 1: `puntosVisibles(...).length > 0` ya cubría
   ambas ramas).
4. **`nombreAccesibleBoton('Ver qué incluye', 'Medicina general')`** → rojo
   → verde (plantilla `` `${rotulo} de ${tituloBloque}` ``).

6/6 tests de lógica en verde. `pnpm run lint` limpio tras cada ciclo.

### Componente (`Servicios.tsx`)

5. **@s1** — h2 "Servicios" + 5 h3 en orden → rojo (`Servicios` no existe)
   → verde (versión mínima: sección + `<h3>` por bloque, sin botones).
6. **@s2** — 5 botones, `aria-expanded="false"`, rótulo "Ver qué incluye",
   0 `listitem` → rojo (no había botones) → verde (`TarjetaServicio` con
   `useState` + botón cableado a `rotuloBoton`).
7. **@s3** — el texto completo de la tarjeta colapsada es exactamente
   título + rótulo → **verde sin cambio de producción** (ya era cierto por
   construcción: no hay categoría ni descripción en ningún sitio del
   código). Test de regresión legítimo, no un ciclo vacío: si alguien
   añadiera esos elementos en el futuro, este test lo detectaría.
8. **@s4** — desplegar «Cirugía y anestesia» lista sus 7 puntos → rojo
   (`getAllByRole('listitem')` no encuentra nada, el botón sí cambia a
   "Ocultar detalle") → verde (`<ul>` condicionado a `abierto`, usando
   `puntosVisibles`).
9. **@s5-@s8** — mismo mecanismo genérico ya generalizado por el ciclo 8,
   ejercitado ahora contra los otros 4 bloques reales del catálogo por
   defecto (`SERVICIOS`). **Verdes sin cambio de producción**: cada uno es
   una verificación end-to-end distinta (dato real de
   `src/data/servicios.ts` transcrito correctamente), con su propio
   literal de tabla escrito a mano en el test — no una copia del símbolo
   de producción.
10. **@s9** — `aria-expanded` pasa de "false" a "true" al pulsar → verde
    sin cambio de producción (ya cableado desde el ciclo 6).
11. **@s10** — el rótulo cambia a "Ocultar detalle" al pulsar → verde sin
    cambio de producción (ya cableado desde el ciclo 6).
12. **@s11** — plegar tras desplegar oculta de nuevo el desglose,
    `aria-expanded` y rótulo vuelven → verde sin cambio de producción (el
    `useState` con toggle ya lo daba gratis).
13. **@s12** — desplegar una tarjeta no afecta a las otras 4 → verde sin
    cambio de producción (cada `TarjetaServicio` tiene su propio estado).
14. **@s13** — desplegar una segunda tarjeta no pliega la primera → verde
    sin cambio de producción (mismo motivo que 13).
15. **@s14** — nombre accesible distinto por tarjeta, conteniendo el
    título → **rojo real**
    (`getByRole('button', { name: titulo, exact: false })` no encontraba
    nada: los 5 botones tenían nombre accesible idéntico, el propio texto
    visible). Verde con `aria-label={nombreAccesibleBoton(...)}`.
    - Nota técnica encontrada en este ciclo: `getByRole` de
      `@testing-library/dom@10.4.1` **no reenvía la opción `exact` al
      filtro de `name`** (confirmado leyendo
      `node_modules/@testing-library/dom/dist/queries/role.js`: el
      destructuring de opciones no incluye `exact`, y el filtro de nombre
      llama a `matches(...)` sin ese argumento). `exact: false` no tiene
      ningún efecto en `getByRole`, a diferencia de `getByText`. El test
      se corrigió para usar `name: new RegExp(titulo)` (coincidencia de
      subcadena real vía regex), no `exact: false`.
16. **@s15** — bloque con desglose vacío no ofrece botón ni lista → rojo
    (el botón se renderizaba igual con `puntos: []`) → verde
    (`conDesglose = tieneDesglose(bloque.puntos)` condiciona botón y
    lista).
17. **@s16** — un punto en blanco no genera un `<li>` vacío → verde sin
    cambio de producción (ya resuelto por `puntosVisibles` desde el ciclo
    8; verificado end-to-end contra un catálogo de fixture propio del
    test, no contra `SERVICIOS`).
18. **@s17** — catálogo vacío no renderiza nada → rojo (el `<h2>` seguía
    apareciendo) → verde (`if (catalogo.length === 0) return null`).
19. **@s18** — sin texto prohibido, conjunto exacto de 26 puntos con las 5
    tarjetas desplegadas → verde sin cambio de producción (verificación
    end-to-end de datos + lógica ya implementados).
20. **@s19** — 0 imágenes hoy; invariante anti-terceros / anti-suplantación
    para el futuro → verde sin cambio de producción (no existe ningún
    `<img>` en el árbol; assertions genéricas quedan como red de seguridad
    si algún día se añade una imagen, mismo patrón que `Hero.test.tsx`
    @s13).

### Hallazgo de lint durante REFACTOR (no de comportamiento)

Tras completar los 19 escenarios, `bin/harness init` marcó
`eslint(no-await-in-loop)` en el bucle `for...of` con `await` de @s18
(`src/components/Servicios.test.tsx`). Corregido desenrollando los 5
`await pulsarBoton(...)` de forma explícita (un usuario real tampoco pulsa 5
botones a la vez) en vez de silenciar la regla o paralelizar con
`Promise.all`. `pnpm run lint` limpio después.

## Desviaciones de la Ley 3 (documentadas, no ocultadas)

En los ciclos 1 y 3 de la lógica pura, la primera implementación resolvió
ambas ramas del condicional en vez de solo la exigida por el test rojo en
curso; el test de la rama que faltaba se añadió después y verificó en verde
sin tocar producción, en vez de forzar un rojo previo. Mismo patrón que el
`tdd_craftsman` de `tokens_marca` documentó como "guardas de vacuidad sin
test rojo propio en el instante, verificadas retroactivamente". No afecta a
la trazabilidad (todas las ramas tienen su test) ni a la mutación (ambas
ramas están cubiertas).

## Verificación final

- `node .harness/harness.mjs init`: **verde** — lint, typecheck y
  **121/121** tests (96 previos + 6 de `Servicios-logica.test.ts` + 19 de
  `Servicios.test.tsx`).
- `pnpm run lint && pnpm run typecheck`: limpio.
- No se marcó nada como `done` en `feature_list.json`: corresponde al
  `judge` y al `mutation_tester` (umbral 1.0 en `harness.config.json`)
  antes de que el `craftsman_lead` lo decida.

## Trazabilidad — @s → test

| Escenario | Test |
| --- | --- |
| @s1 | `Servicios.test.tsx` › `@s1 la sección muestra exactamente los cinco bloques publicados, en orden` |
| @s2 | `Servicios.test.tsx` › `@s2 al cargar la página las cinco tarjetas están colapsadas` |
| @s3 | `Servicios.test.tsx` › `@s3 la tarjeta colapsada solo afirma el título del bloque` |
| @s4 | `Servicios.test.tsx` › `@s4 desplegar «Cirugía y anestesia» lista sus 7 puntos publicados` |
| @s5 | `Servicios.test.tsx` › `@s5 desplegar «Diagnóstico de imagen» lista sus 4 puntos publicados` |
| @s6 | `Servicios.test.tsx` › `@s6 desplegar «Medicina general» lista sus 5 puntos publicados` |
| @s7 | `Servicios.test.tsx` › `@s7 desplegar «Análisis» lista sus 6 puntos publicados` |
| @s8 | `Servicios.test.tsx` › `@s8 desplegar «Especialidades» lista sus 4 puntos publicados` |
| @s9 | `Servicios.test.tsx` › `@s9 el estado de expansión se comunica con aria-expanded` |
| @s10 | `Servicios.test.tsx` › `@s10 el rótulo del botón cambia al desplegar` |
| @s11 | `Servicios.test.tsx` › `@s11 plegar una tarjeta desplegada vuelve a ocultar su desglose` |
| @s12 | `Servicios.test.tsx` › `@s12 desplegar una tarjeta no despliega ninguna de las otras cuatro` |
| @s13 | `Servicios.test.tsx` › `@s13 desplegar una segunda tarjeta no pliega la primera` |
| @s14 | `Servicios.test.tsx` › `@s14 cada botón de la sección tiene un nombre accesible distinto` |
| @s15 | `Servicios.test.tsx` › `@s15 caso límite — un bloque con el desglose vacío no ofrece botón de desplegar` |
| @s16 | `Servicios.test.tsx` › `@s16 caso límite — un punto en blanco no pinta un elemento de lista vacío` |
| @s17 | `Servicios.test.tsx` › `@s17 caso límite — un catálogo vacío no renderiza la sección` |
| @s18 | `Servicios.test.tsx` › `@s18 la sección no afirma ningún servicio que el cliente no publique` |
| @s19 | `Servicios.test.tsx` › `@s19 hoy la sección no publica ninguna imagen; si en el futuro se añade alguna no se pide a un tercero ni suplanta un servicio` |

Apoyo de mutación (no mapeado 1:1 a un `@s`, mismo patrón que
`Cabecera-logica.test.ts` con `esAncla`), en `Servicios-logica.test.ts`:
`rotuloBoton` (ambas ramas, apoya @s2/@s10/@s11), `puntosVisibles` (apoya
@s16), `tieneDesglose` (ambas ramas, apoya @s15) y `nombreAccesibleBoton`
(apoya @s14).

## Entregables

- `src/data/servicios.ts` (nuevo)
- `src/components/Servicios-logica.ts` (nuevo)
- `src/components/Servicios-logica.test.ts` (nuevo, 6 tests)
- `src/components/Servicios.tsx` (nuevo)
- `src/components/Servicios.test.tsx` (nuevo, 19 tests)

## Pendiente para las siguientes puertas

- `judge`: revisar los 19 escenarios contra el código real, en particular
  el diseño de `aria-label` de @s14 y la nota técnica sobre `exact` en
  `getByRole`.
- `mutation_tester`: medir `src/components/Servicios-logica.ts` (único
  fichero de este entregable dentro del glob mordible de
  `stryker.config.json`) contra el umbral 1.0, `--concurrency 1`, leyendo
  `# timeout` antes del score.

## Ronda 2 — corrección tras `progress/judge_servicios.md` (CHANGES_REQUESTED)

> Alcance: exactamente el punto "Cambios requeridos" de
> `progress/judge_servicios.md` (hallazgo bloqueante de "Disciplina TDD").
> No se toca nada más de la ronda 1.

### Estado previo confirmado

`node .harness/harness.mjs init` **verde** antes de tocar nada: lint,
typecheck y **121/121** tests (baseline igual al que cerró la ronda 1).

### Ciclo 21 — quitar producción sin test que la pida (`Servicios.tsx:49-50`)

El `judge` señaló que `<section aria-labelledby="servicios-titulo"
id="servicios">` / `<h2 id="servicios-titulo">` en `Servicios.tsx` no los
exige ningún `@s` de `features/servicios.feature` ni los consulta ningún
test de `Servicios.test.tsx` (verificado de nuevo por mí antes de tocar
nada: `grep -n "servicios-titulo\|aria-labelledby\|id=.servicios"` sobre
`Servicios.test.tsx` → 0 coincidencias; releído `features/servicios.feature`
completo, ningún escenario menciona `id` ni `aria-labelledby`).

Esto no es un ciclo Rojo-Verde clásico (no hay comportamiento nuevo que
pedir con un test): es retirar código de producción que viola la Ley 1 del
TDD ("no escribes código de producción salvo para hacer pasar un test que
falla"). La verificación equivalente es la inversa de un rojo: confirmar que
**quitar** el código dejado sin red **no** hace fallar ningún test — si
fallara, algo lo necesitaba y habría que reponerlo con un test primero, tal
y como advierte el propio "Cambios requeridos" del `judge`.

- Antes del cambio: `pnpm exec vitest run src/components/Servicios.test.tsx`
  → 19/19 verde (confirmación de partida, mismo resultado que ya había
  verificado el `judge` con su mutación manual).
- Cambio único, sin tocar nada más del fichero:

  ```diff
  - <section aria-labelledby="servicios-titulo" id="servicios">
  -   <h2 id="servicios-titulo">Servicios</h2>
  + <section>
  +   <h2>Servicios</h2>
  ```

- Después del cambio: `pnpm exec vitest run src/components/Servicios.test.tsx`
  → **19/19 sigue en verde**, sin ningún ajuste de test.
- `grep -rn "servicios-titulo" src/` → sin resultados: ningún otro fichero
  del árbol dependía del `id` retirado (ni `src/data/navegacion.ts`, que fija
  `href="#servicios"` para la cabecera pero no exige que exista un elemento
  con ese `id` hasta que una feature de ensamblado de página o una cláusula
  explícita de `cabecera_y_navegacion.feature` lo pida con un test, tal y
  como señala el propio `judge` en "Cambios requeridos").

### Verificación final (ronda 2)

- `node .harness/harness.mjs init`: **verde** — lint, typecheck y
  **121/121** tests (mismo recuento que la ronda 1: la corrección no añade
  ni quita ningún test, solo retira producción no exigida).
- `src/components/Servicios.tsx` releído completo tras el cambio: el resto
  del fichero es idéntico a la ronda 1, solo difieren las dos líneas del
  diff anterior.
- No se marcó nada como `done` en `feature_list.json`: corresponde al
  `judge` (segunda pasada) y al `mutation_tester` antes de que el
  `craftsman_lead` lo decida.

### Pendiente para las siguientes puertas (ronda 2)

- `judge`: confirmar que `Servicios.tsx:49-50` ya no contiene atributos sin
  test que los exija y, si el resto del entregable sigue sin objeciones,
  emitir veredicto de aprobación.
- `mutation_tester`: sin cambios de alcance respecto a la ronda 1 (sigue
  siendo `src/components/Servicios-logica.ts` contra el umbral 1.0); esta
  ronda no tocó ningún fichero dentro del glob mordible.
