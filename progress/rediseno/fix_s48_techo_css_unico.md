# Fix — @s48 `rediseno_visual.feature`: "el techo se declara en un único sitio"

## Hallazgo del judge (tercera revisión, no bloqueante)

`progress/judge_rediseno_visual.md` (líneas 251-258 y 316-318): la cláusula
`And el techo se declara en un único sitio` de @s48 no tenía ninguna
aserción real. `tests/e2e/css-presupuesto.spec.ts` ya comprobaba que el CSS
servido no supera `TECHO_BYTES_CSS = 8000`, pero nada afirmaba que ese
literal estuviera declarado exactamente una vez en el repositorio.

## Investigación previa (antes de escribir nada)

1. Grep del patrón "declarado ... una sola vez / un único sitio" en todo el
   repo: la única implementación real de una "puerta de declaración única"
   es `buscarDeclaracionesLiteralesDelIdentificador` en
   `src/lib/diseno/contratoRedisenho.ts` (usada por @s10,
   `contratoRedisenho.test.ts:139-184`): recibe un corpus de
   `{ ruta, texto }`, busca el identificador como **literal de cadena
   entero** (con comillas) en cada fichero, y aprueba solo si EXACTAMENTE un
   fichero lo declara (falla cerrada con corpus vacío o identificador
   vacío).
2. Esa función no encaja tal cual para `TECHO_BYTES_CSS`: busca literales de
   **cadena** (`'clinica'`), y aquí el valor a proteger es un literal
   **numérico** sin comillas (`8000`) asignado a un identificador con
   nombre propio. Además el alcance de la tarea (`tests/e2e/css-presupuesto.spec.ts`
   únicamente) no permite tocar `src/lib/diseno/`, así que reutilizar esa
   función habría exigido exportar/adaptar producción fuera del alcance
   autorizado.
3. Repliqué el mismo **mecanismo** (corpus de ficheros de código fuente real,
   leídos del disco, filtrado por si declaran el identificador, aprobar solo
   si hay exactamente uno) de forma autocontenida en el propio fichero de
   test, siguiendo el estilo ya usado en otros specs de `tests/e2e/` para
   leer ficheros reales del repo con `node:fs` + `fileURLToPath`
   (`tests/e2e/despliegue-subpath.spec.ts:9-17,110-118`,
   `tests/e2e/tokens-aplicados.spec.ts:3-11`).
4. Alcance de la búsqueda: grep manual de `"8000"` y de `"TECHO_BYTES_CSS"`
   en todo el repo (excluyendo `node_modules/`, `dist/` y `.stryker-tmp/`,
   que son artefactos generados, no fuentes) confirmó que la única
   declaración real hoy vive en `tests/e2e/css-presupuesto.spec.ts:19`; el
   resto de apariciones de "8000" son prosa narrativa en `feature_list.json`
   (no una declaración de código) y la copia sandbox de Stryker (artefacto).
   No hay ningún fichero de configuración de build (`vite.config.ts`,
   `playwright.config.ts`, `package.json`) que fije este mismo presupuesto
   por otra vía. Decidí que el corpus razonable a vigilar es `src/` +
   `tests/` (TypeScript real): es el universo donde este techo podría
   razonablemente volver a copiarse por accidente; `dist/` y `.stryker-tmp/`
   quedan fuera por ser artefactos generados, no fuentes.

## Ciclo TDD

- **ROJO real (sabotaje primero, no test naturalmente rojo)**: como el
  invariante ya se cumplía en el estado real del repo (una sola
  declaración), no había forma de que el test naciera rojo "solo". Escribí
  la implementación completa y, ANTES de la primera ejecución en verde,
  creé un fichero temporal `src/lib/diseno/_sabotaje_temporal_s48.ts` con
  `export const TECHO_BYTES_CSS = 8000`. Ejecuté
  `pnpm exec playwright test --workers=1 --reporter=list -g "@s48"` y el
  test falló exactamente por la razón esperada: `toEqual` reportó un array
  con 2 rutas (la de sabotaje + la real) donde se esperaba solo la real.
- Borrado el fichero de sabotaje (`rm src/lib/diseno/_sabotaje_temporal_s48.ts`),
  confirmado sin residuo (`git status` no lo lista).
- **VERDE**: re-ejecutado `-g "@s48|@s49"` → 5/5 verdes (incluye @s48 y @s49
  de este fichero, más los @s49 no relacionados de `datos-reales.spec.ts`
  que también matchean el grep por nombre de escenario compartido).

## Trazabilidad @s → test

| Escenario | Test |
| --- | --- |
| @s48 (`features/rediseno_visual.feature:674-680`) | `tests/e2e/css-presupuesto.spec.ts:68-72` — `@s48 el techo de bytes de CSS se declara en un único sitio` › `"TECHO_BYTES_CSS = 8000" solo aparece declarado en este fichero, en todo "src/" y "tests/"`. Cubre las 4 cláusulas: el `Given`/`When`/primer `Then` (existencia y no superación del techo) ya estaban cubiertos por el test de @s49 preexistente en el mismo fichero; esta sesión añade la aserción real que faltaba para el último `And` ("el techo se declara en un único sitio"). |

## Verificación final

- `pnpm exec playwright test --workers=1 --reporter=list -g "@s48|@s49"` →
  5 passed.
- `pnpm exec playwright test --workers=1 --reporter=list` (suite completa) →
  primera pasada con fallos intermitentes de conexión (`ERR_CONNECTION_REFUSED`)
  en tests no relacionados (`tipografia.spec.ts`, `despliegue-subpath.spec.ts`,
  `fidelidad.spec.ts`, `geometria-escalas.spec.ts`, etc., conjuntos de
  fallos DISTINTOS entre dos pasadas consecutivas) — diagnosticado como
  flakiness de máquina ya documentada en el repo (`progress/tdd_accesibilidad.md`
  y otros, "picos reales de CPU compartida"), no una regresión: había un
  proceso `vite preview` huérfano ocupando el puerto 4173 de una ejecución
  anterior (`reuseExistingServer` lo reutilizaba). Matado el proceso huérfano
  (`taskkill /F /PID …`) y repetida la suite completa desde un puerto limpio:
  **112/112 verdes**, sin ningún fallo. Mi cambio (34 líneas añadidas, un
  único fichero de test sin `page.goto` ni red) no puede explicar
  fallos de conexión en specs no relacionados; el patrón de fallos distintos
  entre pasadas confirma que es ambiental, no causado por este cambio.
- `pnpm exec vitest run` → 88 ficheros / 1230 tests, todos verdes.
- `pnpm run lint` (`oxlint --deny-warnings`) → 0 hallazgos, exit 0.
- `pnpm run typecheck` (`tsc -b`) → 0 errores, exit 0.

## Alcance

Solo se editó `tests/e2e/css-presupuesto.spec.ts` (34 líneas añadidas, nada
borrado ni modificado del test de @s49 preexistente). No se tocó ningún
otro fichero de forma permanente: el fichero de sabotaje
(`src/lib/diseno/_sabotaje_temporal_s48.ts`) fue temporal, creado y borrado
dentro de esta misma sesión, sin residuo en `git status`.
