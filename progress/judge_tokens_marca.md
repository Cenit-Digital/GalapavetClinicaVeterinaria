# Review — feature tokens_marca (id 1)

**Veredicto:** APPROVED

## Cobertura de escenarios (@s ↔ test)

- @s1: [x] `src/lib/tokens.test.ts:5-15` (dos `it`: hexadecimales exactos por literal + `Object.keys(coloresDeMarca)` = 3)
- @s2: [x] `src/lib/contraste.test.ts:4-9` (negro/blanco = 21.00)
- @s3: [x] `src/lib/contraste.test.ts:11-17` (morado/blanco = 9.13, `>= 4.5`)
- @s4: [x] `src/lib/contraste.test.ts:19-24` (invertido = 9.13)
- @s5: [x] `src/lib/contraste.test.ts:26-31` (minúsculas = 9.13)
- @s6: [x] `src/lib/contraste.test.ts:33-42` (lima/blanco = 1.89, NO apta en los tres usos)
- @s7: [x] `src/lib/contraste.test.ts:44-51` (lima/morado = 4.84, apta texto normal)
- @s8: [x] `src/lib/contraste.test.ts:53-62` (verde/lima = 3.01, apta grande+componente, NO normal)
- @s9: [x] `src/lib/contraste.test.ts:64-68` (4.5 exacto → apta, límite inclusivo)
- @s10: [x] `src/lib/contraste.test.ts:70-74` (4.49 → NO apta)
- @s11: [x] `src/lib/contraste.test.ts:76-80` (3.0 exacto componente → apta)
- @s23: [x] `src/lib/contraste.test.ts:82-86` (3.0 exacto texto grande → apta)
- @s12: [x] `src/lib/contraste.test.ts:88-92` (`toThrow('#ZZ286B')`)
- @s13: [x] `src/lib/contraste.test.ts:94-98`
- @s14: [x] `src/lib/contraste.test.ts:100-104` (rechaza forma abreviada)
- @s15: [x] `src/lib/contraste.test.ts:106-110` (cadena vacía)
- @s16: [x] `src/lib/tokens.test.ts:17-45` (dos `it`: cobertura por uso + ratios ≥ mínimo sobre `catalogoDeContraste` real, y exclusión explícita de `#48704B`/`#B4C718`)
- @s17: [x] `src/lib/contraste.test.ts:112-120` (catálogo vacío falla cerrado, motivo "0 parejas")
- @s18: [x] `src/lib/puertaLiteralesColor.test.ts:4-18`
- @s19: [x] `src/lib/puertaLiteralesColor.test.ts:20-30` (ruta + línea 7)
- @s20: [x] `src/lib/puertaLiteralesColor.test.ts:32-46` (funcional + nombre CSS)
- @s21: [x] `src/lib/puertaLiteralesColor.test.ts:48-56` (0 ficheros falla cerrado)
- @s22: [x] `src/lib/puertaLiteralesColor.test.ts:58-68` (`currentColor`/`transparent`/`inherit` no señalados)

23/23 escenarios con al menos un test concreto. La tabla de trazabilidad de
`progress/tdd_tokens_marca.md` coincide con lo verificado directamente en los
ficheros de test.

## Disciplina TDD

- ¿Producción sin test que la pida? **NO**, con una salvedad transparente y
  ya remediada: `progress/tdd_tokens_marca.md` (sección "Estrategia dentro de
  las Tres Leyes") documenta que las guardas de vacuidad de
  `ejecutarPuertaDeContraste` (@s17) y `ejecutarPuertaDeLiteralesColor` (@s21)
  se escribieron a la vez que la implementación del escenario anterior, sin
  un test rojo propio en ese instante. El propio craftsman lo detectó,
  verificó retroactivamente que quitar la guarda ponía el test de @s17/@s21
  en rojo, y la restauró. En el estado final cada línea de producción tiene
  un test que, al día de hoy, la exige. No hay código muerto ni ramas sin
  cubrir en la lectura manual.
- También documentada una sobre-implementación real detectada y revertida en
  refactor: `parejasNoAptas`/`usosSinPareja`/`motivoDeIncumplimiento` en
  `ejecutarPuertaDeContraste`, eliminada porque ningún `Then` de `@s16` la
  exige (solo pide informar el ratio y cobertura por uso, no que la puerta
  falle por pareja no apta). Buena señal de disciplina, no un hallazgo.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**: bitácora ciclo a ciclo completa
  en `progress/tdd_tokens_marca.md` para los 23 escenarios, con mensajes de
  error concretos capturados en ROJO (`TypeError: ... is not a function`,
  `AssertionError`, fallos de resolución de import) y la razón de "verde a la
  primera" justificada por generalización ya existente en cada caso, no
  asumida sin más (se indica que se re-ejecutó la suite para confirmar).

## Calidad

- `src/lib/contraste.ts`: funciones cortas, un motivo por función
  (`componenteLineal`, `luminanciaRelativa`, `aComponentesRgb`,
  `validarHexadecimal`, `esAptoParaUso`, `evaluarAptitudPareja`,
  `ejecutarPuertaDeContraste`). Constantes con nombre para cada magic number
  (`BASE_HEXADECIMAL`, `MAXIMO_CANAL_8_BITS`, `UMBRAL_GAMMA_LINEAL`,
  `RATIO_MINIMO_POR_USO`, etc.): sin números mágicos sueltos.
- `src/lib/tokens.ts`: módulo trivial, fuente única de los 3 hexadecimales,
  catálogo de contraste con comentario que justifica la exclusión de
  `#48704B`/`#B4C718` citando la EXCEPCIÓN DECIDIDA del `.feature`. Coherente
  con `docs/datos-galapavet.md` §10/§10.1.
- `src/lib/puertaLiteralesColor.ts`: separación clara entre detección
  (`declaraColorLiteral`, `hallazgosDelFichero`) y orquestación
  (`ejecutarPuertaDeLiteralesColor`), guarda de vacuidad aislada en su propia
  función (`ejecutarPuertaDeLiteralesColorSinFicheros`).
- Contrato de errores: `calcularRatioContraste` lanza `Error` con mensaje que
  cita el valor rechazado (exigido literalmente por @s12); no hay retorno
  nulo silencioso en ninguna ruta de fallo. `docs/conventions.md` no fija
  todavía una jerarquía de errores de dominio propia del proyecto (sección
  "Rellena" aún vacía): el uso de `Error` estándar con mensaje descriptivo no
  contradice ningún convenio documentado.
- Tests co-locados junto a su módulo (`*.test.ts` al lado de `*.ts`), nombres
  de `describe`/`it` en español que citan el `@s` y describen el
  comportamiento verificado: conforme a `docs/conventions.md`.
- Patrón doble-de-test-anclado-al-literal-no-al-simbolo respetado: todos
  los ratios en los tests son literales calculados a mano (9.13, 1.89, 4.84,
  3.01...), nunca comparados contra una constante de producción importada;
  `tokens.test.ts:7-9` compara `coloresDeMarca.morado`/`.lima`/`.verdeProfundo`
  contra los literales `#77286B`/`#B4C718`/`#48704B` escritos a mano.
- `docs/architecture.md` sigue siendo la plantilla genérica sin capas
  concretas rellenadas para este proyecto (gap preexistente, no introducido
  por esta feature). No bloquea: `src/lib` como módulo de lógica pura sin I/O
  es consistente con el patrón de memoria organizacional citado
  (logica-de-decision-en-modulo-puro-no-en-el-jsx) y con
  `stryker.config.json` (superficie mutable = `src/lib/**/*.ts`).
- Sin TODOs sueltos ni `console.log`/`debugger` en `src/lib` ni
  `src/test/setup.ts` (grep vacío).

## Checkpoints

- C1: [x] Ficheros base y docs presentes (`AGENTS.md`, `CLAUDE.md`,
  `CHECKPOINTS.md`, `harness.config.json`, `feature_list.json`,
  `progress/current.md`, `docs/workflow.md`, `docs/architecture.md`,
  `docs/conventions.md`, `docs/verification.md`: todos existen).
  `node .harness/harness.mjs init` termina en verde (lint + typecheck +
  25 tests, exit 0), verificado en esta revisión.
- C2: [x] Una sola feature `in_progress` (`tokens_marca`, id 1) en
  `feature_list.json`; el resto `spec_ready`. Ninguna feature `done` todavía
  (no aplica la sub-clausula de tests asociados). `progress/current.md`
  describe la sesión activa, sin basura de sesiones anteriores.
- C3: [x] `src/lib` solo contiene los 3 módulos de esta feature más sus
  tests co-locados; ninguna dependencia externa nueva añadida por esta
  feature (0 imports externos en `src/lib/*.ts`); sin logs de debug ni TODOs
  sueltos.
- C4: [x] Un test por módulo (3 módulos, 3 ficheros de test). Sin mocks
  de sistema de ficheros: son funciones puras sobre datos en memoria.
  `pnpm run test`: 25 tests, 3 ficheros, todos verdes.
- C5: [ ] `progress/history.md` sigue con solo la plantilla de ejemplo,
  sin entrada de las sesiones ya recorridas (spec, revisión adversarial,
  reparación, puerta humana, TDD de esta feature). Es esperable a mitad de
  sesión: el cierre de sesión y el volcado a `history.md` es un paso
  posterior al veredicto del judge, no un requisito para aprobar esta
  feature, pero queda anotado para que no se olvide antes de cerrar la
  sesión.
- C6: [x] `tokens_marca.feature` con `@s1..@s23` (23 escenarios) y sección
  propia en `project-spec.md` (linea 125 y "Decisión 8" en la 57). Cada `@s`
  cubierto por un test concreto (ver tabla arriba). Sin código de producción
  que ningún test rojo haya pedido, con la salvedad documentada y remediada
  arriba.
- C7: pendiente del mutation_tester (fuera del alcance de este veredicto,
  según instrucción explícita de esta revisión).

## Cambios requeridos (si aplica)

Ninguno bloqueante. Sugerencia no bloqueante para el cierre de sesión: volcar
un resumen de las sesiones ya recorridas a `progress/history.md` antes de
cerrar (C5).
