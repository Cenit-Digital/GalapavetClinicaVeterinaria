# Review — feature datos_negocio (id 2) — re-revisión tras ronda 1 de correcciones de mutación

**Contexto:** revisión previa `APPROVED` (misma feature, antes de que corriera
`mutation_tester`). `mutation_tester` midió después **FAIL** (86/96 = 89.58%,
9 mutantes reales + 1 equivalente, `progress/mutation_datos_negocio.md`).
`tdd_craftsman` aplicó una ronda de correcciones (R1-R6, documentadas en
`progress/tdd_datos_negocio.md`) y remidió con Stryker: 95/95 sobre mutantes
no equivalentes. Esta revisión re-audita el contrato completo (los 21 `@s`)
con atención específica a los tests nuevos de esta ronda.

**Veredicto:** APPROVED

## Cobertura de escenarios (@s ↔ test)
- @s1: [x] `site.test.tsx:17-31` — texto visible, `tel:`, dígitos; + test nuevo de esta ronda (ausencia de la clave `rotulo`, línea 26-30)
- @s2: [x] `site.test.tsx:33-41`
- @s3: [x] `site.test.tsx:43-57`
- @s4: [x] `site.test.tsx:59-72` (rol `link`, `href`, dígitos coincidentes)
- @s5: [x] `site.test.tsx:74-82`
- @s6: [x] `site.test.tsx:84-91`
- @s7: [x] `telefono.test.ts:4-15`
- @s8: [x] `telefono.test.ts:17-48` (+ refuerzo "más de 9 dígitos" y refuerzo nuevo de esta ronda: `instanceof Error`)
- @s9: [x] `telefono.test.ts:50-60`
- @s10: [x] `telefono.test.ts:62-72`
- @s11: [x] `telefono.test.ts:74-84`
- @s12: [x] `telefono.test.ts:86-96`
- @s13: [x] `site.test.tsx:93-102`
- @s14: [x] `site.test.tsx:104-121`
- @s15: [x] `site.test.tsx:123-131`
- @s16: [x] `site.test.tsx:133-141`
- @s17: [x] `site.test.tsx:143-152`
- @s18: [x] `site.test.tsx:154-159`
- @s19: [x] `puertaTelefonoHardcodeado.test.ts:15-33` (+ dos aserciones nuevas de esta ronda: `toHaveLength(3)`, `informe.pasa===false`) + test nuevo `puertaTelefonoHardcodeado.test.ts:35-45` (0 hallazgos → `pasa===true`)
- @s20: [x] `puertaTelefonoHardcodeado.test.ts:48-57`
- @s21: [x] `site.test.tsx:161-169`

Los 21 escenarios siguen cubiertos (no ha cambiado respecto a la revisión
previa, que ya verificó este mapa test a test). Lo nuevo de esta ronda no
introduce ni retira cobertura de ningún `@s`: son refuerzos de mutación sobre
escenarios ya cubiertos (rol explícito que `docs/mutation-testing.md` asigna
al `tdd_craftsman`), salvo el test de `puertaTelefonoHardcodeado.test.ts:35-45`
que amplía el caso "0 hallazgos" dentro del bloque `@s19` sin inventar un
`@s` nuevo en el `.feature` — correcto, no hay reescritura del contrato.

## Atención específica: tests nuevos de esta ronda — ¿vacíos o anclados al símbolo re-importado?

Verificados los cinco puntos, leyendo el código real (no solo la bitácora):

1. **`telefono.test.ts:33-47`** (mata `telefono.ts:16`, `errorTelefonoNoValido`
   vaciado) — compara contra el literal `'91 082 92'` escrito a mano, no
   contra ninguna constante importada de `telefono.ts` (el módulo no exporta
   ninguna). Usa `let error: unknown` fuera del `try`, ambos `expect` fuera
   del `catch` (evita `vitest/no-conditional-expect`, confirmado en verde por
   `pnpm run lint`). No vacío: si `errorTelefonoNoValido` devuelve `undefined`,
   `error` queda `undefined` y `expect(error).toBeInstanceOf(Error)` falla.
   Razonamiento verificado a mano contra el mutante real descrito en
   `progress/mutation_datos_negocio.md` punto 1.

2. **`site.test.tsx:26-30`** (mata `site.ts:22`, condición del `rotulo`
   anulada) — `expect('rotulo' in telefonoClinica).toBe(false)`. No compara
   contra ninguna constante de producción, es una comprobación estructural
   directa sobre el objeto real exportado. No vacío: si el spread condicional
   se sustituye por `true && { rotulo }`, la clave pasa a existir con valor
   `undefined` y la aserción falla (`expected true to be false`).

3. **`puertaTelefonoHardcodeado.test.ts:26-27`** (mata dos de los tres
   mutantes de `puertaTelefonoHardcodeado.ts:55`) —
   `expect(informe.hallazgos).toHaveLength(3)` y
   `expect(informe.pasa).toBe(false)`, ambos sobre el `informe` real derivado
   de los ficheros reales del repo (vía `import.meta.glob`), no sobre ningún
   literal reimportado de `site.ts`. El `3` es un literal escrito a mano
   (número de teléfonos reales en `site.ts` a fecha de este contrato), acorde
   al patrón `doble-de-test-anclado-al-literal-no-al-simbolo` — no se deriva
   de ninguna constante de `puertaTelefonoHardcodeado.ts` ni de `site.ts`.

4. **`puertaTelefonoHardcodeado.test.ts:35-45`** (mata el tercer mutante de
   la línea 55, `pasa: false` hardcodeado) — usa un `FicheroCodigo` **sintético**
   (`{ ruta: '/src/lib/ejemplo.ts', contenido: 'ningún teléfono en este fichero' }`),
   totalmente desacoplado de `site.ts` y de cualquier constante de producción.
   No vacío: con el mutante `pasa: false` activo, `informe.pasa` sería `false`
   en vez de `true`, y `expect(informe.pasa).toBe(true)` fallaría. El
   comentario del propio test explica correctamente por qué el test de `@s19`
   con datos reales no basta para este mutante concreto (con hallazgos reales
   ya vale `false`, así que un mutante que siempre da `false` no se distingue
   ahí) — razonamiento correcto y verificable.

5. **`site.reimportacion.test.ts`** (mata `site.ts:10-12`, las tres constantes
   de teléfono vaciadas) — las tres aserciones (líneas 27-29) comparan
   `textoVisible` contra los literales `'91 082 92 67'`, `'685 34 31 49'` y
   `'91 851 13 93'` escritos a mano, **no** contra `TELEFONO_CLINICA` /
   `TELEFONO_MOVIL` / `TELEFONO_URGENCIAS` (que ni siquiera se exportan de
   `site.ts`, así que el patrón anclaje-al-símbolo es estructuralmente
   imposible aquí). Diseño del fichero correcto: al no importar `./site` de
   forma estática, la evaluación del módulo (y su posible `throw` en carga)
   ocurre dentro del `it()`, dentro de la ventana que Stryker sí atribuye a
   un test — verificado leyendo el fichero y contrastando con el diagnóstico
   de `progress/mutation_datos_negocio.md` (mutantes `testsCompleted: 0`,
   `coveredBy: []`, `static: true`). No es un test duplicado de `site.test.tsx`:
   ese fichero seguirá matando estos mismos mutantes si algún día el plugin de
   Stryker mejora su atribución de cobertura estática, y mientras tanto es el
   único que Stryker sabe atribuir.

**Ningún test nuevo de esta ronda está vacío ni anclado a la constante de
producción reimportada en vez del literal escrito a mano.** El patrón que la
tarea pedía vigilar específicamente no aparece.

## Disciplina TDD
- ¿Producción sin test que la pida? NO. Los cinco puntos anteriores son
  exclusivamente adiciones de test — ninguno de los tres módulos de
  producción (`site.ts`, `telefono.ts`, `puertaTelefonoHardcodeado.ts`) tiene
  una sola línea distinta de la que ya aprobó la revisión previa. Esto es
  coherente: los 9 mutantes eran huecos de aserción, no defectos de
  comportamiento (el propio `mutation_tester` ya lo documentó módulo a
  módulo). No se infla el alcance (Ley 3 respetada: cero código nuevo).
- ¿Evidencia de Rojo→Verde→Refactor? SÍ, para los 4 tests genuinamente
  nuevos de esta ronda (R1, R2, R4, R6): cada uno documenta en
  `progress/tdd_datos_negocio.md` la aplicación manual del mutante exacto del
  informe de `mutation_tester`, el mensaje de fallo real observado, y la
  reversión a verde. Verificado no solo por lectura de la bitácora sino
  cruzando cada mutante descrito contra el código de producción real leído
  en esta revisión (`telefono.ts`, `site.ts`, `puertaTelefonoHardcodeado.ts`)
  — el razonamiento de cada test se sostiene lógicamente contra el mutante
  citado, no es una afirmación sin verificar.
- Ajuste de disciplina propio de esta ronda: la primera versión del test R1
  usaba `expect` dentro de un `catch` (patrón condicional), rechazado por
  `oxlint` (`vitest/no-conditional-expect`); reescrito moviendo ambos
  `expect` fuera del `catch` sin perder poder de detección. Confirmado:
  `pnpm run lint` en verde ahora mismo (ver checkpoint C1 abajo).
- Nota menor, no bloqueante: la narrativa de `progress/tdd_datos_negocio.md`
  describe R1/R2/R3/R5 como "test ya presente al empezar este repaso", lo que
  sugiere que ya existían de una pasada anterior dentro de la misma ronda de
  reparación y este repaso fue de verificación/ajuste de lint más que de
  creación desde cero. No afecta el veredicto: lo que importa es que el
  estado final de cada test es real, no vacío y verificado contra el
  mutante — que es lo que esta revisión comprobó directamente sobre el
  código, no solo sobre el relato.

## Calidad
- `src/lib/telefono.ts`, `src/lib/site.ts`, `src/lib/puertaTelefonoHardcodeado.ts`:
  sin cambios de producción respecto a la revisión previa ya aprobada — se
  mantienen las mismas conclusiones (fuente única coherente con
  `project-spec.md` Invariante 2, falla cerrado con `Error` nombrado, puerta
  anti-teléfono-hardcodeado sin mutar la entrada).
- `src/lib/site.reimportacion.test.ts` es un fichero de test nuevo, fuera del
  patrón "un test co-localizado por módulo" habitual del repo, pero
  justificado explícitamente por una limitación real y verificada de
  atribución de cobertura de `@stryker-mutator/vitest-runner` sobre mutantes
  estáticos — no es una solución de comodidad, tiene una razón técnica
  documentada y comprobable (reproducida en esta revisión leyendo el
  comentario de cabecera del fichero, coherente con el diagnóstico del
  `mutation_tester`).
- Los tests nuevos son cortos, con un solo motivo cada uno, nombres
  descriptivos ("refuerzo mutación: ..."), sin números mágicos sin explicar
  (el `3` de `toHaveLength(3)` tiene comentario inline justificándolo).
- No se detecta ningún literal de teléfono nuevo fuera de `site.ts` en los
  ficheros tocados esta ronda (los literales en los tests son datos de
  prueba, cubiertos por la exclusión de `puertaTelefonoHardcodeado` a los
  ficheros `.test.*`, ya validada por @s19).

## bin/harness init
Ejecutado ahora mismo (`node .harness/harness.mjs init`, no hay `pwsh` en esta
máquina — mismo workaround que sesiones anteriores):
- Entorno: OK (node v22.15.0).
- Ficheros base del arnés: OK.
- `feature_list.json` válido (19 features).
- Lint (`oxlint --deny-warnings` + `tsc -b`): **verde**, sin avisos.
- Tests (`vitest run`): **58/58 tests, 7 ficheros, todos en verde**
  (54 previos + 4 tests genuinamente nuevos de esta ronda: R1 instanceof
  Error, R2 ausencia de `rotulo`, R4 puerta con 0 hallazgos, R6 fichero
  `site.reimportacion.test.ts` — aritmética consistente con la bitácora).
- Resultado: **"Entorno listo."**

## Checkpoints
- C1: [x] Ficheros base y docs presentes; `bin/harness init` termina en
      verde (confirmado en esta revisión, no solo referido).
- C2: [x] Una sola feature `in_progress` (`datos_negocio`) en
      `feature_list.json`; `tokens_marca` sigue `done`.
- C3: [x] `src/` solo contiene los módulos ya previstos; sin dependencias
      nuevas; sin logs de debug ni TODOs sueltos en los ficheros tocados
      esta ronda.
- C4: [x] Un test por módulo nuevo; los tests de `puertaTelefonoHardcodeado`
      y de ausencia de email/mailto:/redes en `site.ts` siguen leyendo los
      ficheros reales del repo vía `import.meta.glob` (sin mocks de sistema
      de ficheros); `bin/harness test` → 58/58 en verde.
- C5: [ ] No evaluado a fondo — sesión sigue activa (feature en
      `in_progress`, pendiente de `mutation_tester`); no bloqueante en este
      punto del pipeline, mismo criterio que la revisión anterior.
- C6: [x] `features/datos_negocio.feature` existe con 21 escenarios
      `@s1..@s21`; mapa `@s → test` completo y verificado en esta revisión;
      sin producción sin test que la pida.

C7 (prueba de mutación) queda para `mutation_tester`: debe re-ejecutar la
medición oficial (no basta con la re-medición que el propio `tdd_craftsman`
documenta en `progress/tdd_datos_negocio.md`, aunque esta revisión encuentra
su razonamiento módulo a módulo, mutante a mutante, sólido y verificable
contra el código real) para certificar de forma independiente que los 9
mutantes reales quedan muertos y que no aparecen mutantes nuevos por los
tests añadidos.

## Cambios requeridos (si aplica)
Ninguno. La ronda 1 de correcciones de mutación queda aprobada: cobertura de
escenarios intacta, disciplina TDD respetada (cero producción nueva, cuatro
tests nuevos justificados con ciclo rojo-verde documentado y verificado),
ningún test vacío ni anclado al símbolo de producción reimportado, calidad
sin regresiones, `bin/harness init` en verde. Pasa a `mutation_tester` para
la medición oficial de C7.
