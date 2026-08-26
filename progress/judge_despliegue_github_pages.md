# Review -- feature 23 (despliegue_github_pages)

**Veredicto (enmienda @s18-@s24):** APPROVED

> Primera revision de judge sobre esta feature. Cubre la enmienda
> (@s18-@s24, 26/08/2026) como objetivo principal del encargo, y de pasada
> los 17 escenarios originales (@s1-@s17, 25/08/2026), nunca revisados por
> un judge explicito hasta ahora (confirmado: no existia este fichero
> antes de esta revision, y progress/current.md marca ambas rondas como
> "pendiente de judge/mutation_tester").

## Cobertura de escenarios (@s <-> test)

### Enmienda (@s18-@s24)
- @s18: [x] src/lib/hrefDeDestino.test.ts -- describe @s18 (51 tests: 25 rutas x 2 bases + 1 recuento). Verificado con sabotaje real documentado en progress/tdd_despliegue_github_pages.md (reescritura a return destino, 30/69 en rojo, revertido a 69/69).
- @s19: [x] src/imagenes-hrefDeDestino.test.ts -- describe @s19 (15 tests). Lei el fichero completo: cubre los 6 .tsx, la doble llamada de CampanasPortada.tsx y las dos llamadas de PaginaBlog.tsx.
- @s20: [x] src/imagenes-hrefDeDestino.test.ts -- describe @s20 (9 tests). Confirma que los 4 data/*.ts no importan hrefDeDestino y siguen con el literal crudo.
- @s21: [x] src/imagenOpenGraph-hrefDeDestino.test.ts (3 tests). Confirme por lectura directa que MetadatosPagina.tsx:42 compone DOMINIO_SITIO + hrefDeDestino(RUTA_IMAGEN_OPEN_GRAPH).
- @s22: [x] src/lib/hrefDeDestino.test.ts -- describe @s22 (2 tests), mismo sabotaje que @s18.
- @s23: [x] tests/e2e/despliegue-subpath.spec.ts -- describe @s23 (2 tests, lineas 205-251). Verificado con sabotaje real (ruta inventada en Galeria.tsx + rebuild de dist/) documentado en el TDD; reproducido por mi de forma independiente dentro de la corrida completa de pnpm run test:e2e (verde).
- @s24: [x] ejecucion completa de pnpm run test:e2e -- reproducida por mi de forma independiente: 75/75 verde.

### Originales (@s1-@s17, revision de pasada -- codigo + git diff)
- @s1: [x] src/configuracion-build.test.ts. Confirmado en git diff package.json: build invoca vite build --base=/GalapavetClinicaVeterinaria/; vite.config.ts no declara base.
- @s2/@s4/@s5/@s6: [x] src/lib/hrefDeDestino.test.ts (describes @s2/@s4/@s5/@s6). Lei hrefDeDestino.ts completo: esAncla reutilizada de Cabecera-logica.ts, sinBarraFinal evita doble barra.
- @s3: [x] src/App-basename.test.ts + src/App.test.tsx (17 tests). Confirmado en git diff src/App.tsx: BrowserRouter basename={import.meta.env.BASE_URL}.
- @s7/@s8: [x] src/enlaces-internos-hrefDeDestino.test.ts. Confirmado en Cabecera.tsx (nav de escritorio linea 38 + panel movil linea 107 con pushState(null, '', hrefDeDestino(destino))), PieDePagina.tsx, CampanasPortada.tsx, PaginaNoEncontrada.tsx.
- @s9/@s10: [x] src/lib/tecnicaSpaGithubPages.test.ts. Lei tecnicaSpaGithubPages.ts completo: espejo puro fiel a la tecnica publica citada (rafgraph/spa-github-pages), SEGMENTOS_DE_SUBPATH_A_CONSERVAR = 1.
- @s11: [x] src/documento-github-pages.test.ts. Lei public/404.html e index.html completos: tecnica real presente, script de decodificacion antes del script type=module que carga main.tsx.
- @s12: [x] src/documento-base-url.test.ts -- CON HALLAZGO, ver "Disciplina TDD" abajo: el test verifica correctamente 5 referencias reales (documentado en su propia cabecera), pero el texto del .feature (linea 347) sigue diciendo "exactamente 4". No es una brecha de cobertura -- el test es mas estricto y correcto que el texto obsoleto, y es coherente con @s14 (que exige 5) -- pero es deuda de reconciliacion textual pendiente, no resuelta pese a que las notas de feature_list.json afirman que si.
- @s13-@s16: [x] tests/e2e/despliegue-subpath.spec.ts (describes @s13-@s16). Reproducidos en mi propia corrida completa de pnpm run test:e2e (verde).
- @s17: [x] ejecucion completa pnpm run test:e2e, reproducida por mi (75/75 verde, incluye los 65 heredados de identidad_visual bajo el subpath real).

## Disciplina TDD

- Produccion sin test que la pida? NO. Revise cada archivo .tsx/.ts de produccion tocado (git diff --stat, 29 ficheros) y cada linea de produccion tiene un test correlativo citado arriba. hrefDeDestino.ts y tecnicaSpaGithubPages.ts no cambiaron de comportamiento en la enmienda (solo JSDoc ampliado en el primero; el segundo, cero cambios).
- Evidencia de Rojo->Verde->Refactor? SI. progress/tdd_despliegue_github_pages.md documenta ciclo a ciclo, con sabotaje manual real en los puntos de mayor riesgo: @s18/@s22 (reescritura de hrefDeDestino a return destino, 30/69 tests en rojo, revertido), @s23 (reversion de Galeria.tsx a una ruta inventada + rebuild real de dist/, 1/2 en rojo mostrando las 6 imagenes de galeria rotas, revertido). No son afirmaciones sin evidencia: los numeros de rojo/verde estan documentados con precision.
- Hallazgo textual real (no bloqueante para el codigo, si para el cierre): features/despliegue_github_pages.feature linea 347 sigue afirmando "el recuento de referencias a public/... es exactamente 4" -- la Decision 50, @s14 (linea 371, exige 5) y el propio test de @s12 (src/documento-base-url.test.ts, lineas 64-66) ya operan sobre 5 (2 rel=icon + apple-touch-icon + 2 preloads), documentado transparentemente como hallazgo, no escondido. Ademas, feature_list.json linea 371 afirma una reconciliacion que no se aplico: dice "mismo patron que la reconciliacion ya hecha de @s12, 4 a 5", pero el .feature real todavia dice "4" -- confirmado con lectura directa. Es una inconsistencia real entre lo que las notas de feature_list.json declaran y el estado real del .feature, pendiente de correccion antes de done (ver "Cambios requeridos").

## Calidad

- src/lib/hrefDeDestino.ts lineas 16-23 -- JSDoc ampliado correctamente para documentar el uso dual (enlaces + imagenes) sin ningun cambio de firma ni de comportamiento -- confirmado con git diff: el cuerpo de la funcion es identico, solo cambia el comentario.
- Los 6 puntos de renderizado (PieDePagina.tsx:80-81, Galeria.tsx:75, CampanasPortada.tsx:48,58, PaginaCampanas.tsx:44, PaginaBlog.tsx:174,217, PaginaTienda.tsx:96) -- cambios quirurgicos de una linea cada uno, ningun alt/width/height/loading/decoding tocado, verificado linea a linea en el git diff de cada fichero.
- MetadatosPagina.tsx lineas 1-2,42 -- import anadido, un solo cambio en la linea de composicion de IMAGEN_OPEN_GRAPH, comentario JSDoc actualizado para reflejar la resolucion real (ya no dice "problema aparte, todavia sin resolver").
- tests/e2e/imagenes.spec.ts @s29 (origenPropio, lineas 114-127) -- confirmado con git diff que ninguna asercion de comportamiento cambio (expect status 200, content-type, dimensiones identicos antes/despues); solo la mecanica de construccion de la URL de verificacion, reutilizando el patron origenPropio ya existente en tests/e2e/red-limpia.spec.ts (lineas 26 y 53) -- no un patron inventado para la ocasion.
- Arquitectura: hrefDeDestino.ts y tecnicaSpaGithubPages.ts viven bajo src/lib/**, coherente con stryker.config.json -> mutate y con el patron "logica-de-decision-en-modulo-puro-no-en-el-jsx" de feature_list.json -> rules.notas. Ningun .tsx incorpora logica de decision nueva: solo llamadas directas a la funcion pura ya existente.
- Sin dependencias nuevas: pnpm-lock.yaml no aparece modificado en el git status de esta sesion.
- Sin comentarios decorativos ni magia: los literales (SEGMENTOS_DE_SUBPATH_A_CONSERVAR = 1, SUBPATH_DE_PRODUCCION) estan nombrados y documentados con su porque.
- Observacion de higiene de sesion (no atribuible a esta feature): progress/judge_accesibilidad.md y progress/tdd_accesibilidad.md aparecen modificados en el git status de esta sesion, mezclados con el trabajo de despliegue_github_pages. Confirmado con git diff que son cierres de una ronda de la feature accesibilidad (id 19, blocked) de una sesion anterior, no tocados por el trabajo de la 23 -- coincide con la nota de coordinacion de procesos que el propio tdd_craftsman dejo en progress/tdd_despliegue_github_pages.md (otro agente trabajando accesibilidad en paralelo el 25/08). No bloquea el veredicto de la 23, pero craftsman_lead deberia separar/commitear ese trabajo antes de cerrar sesion para no mezclar dos features en el mismo diff sin commitear.

## Verificacion independiente que yo (judge) ejecute

1. Hipotesis del test colateral de movimiento (@s42), reproducida:
   - Estatica: grep -r "@keyframes" src/ -> 0 resultados, confirmado por mi. La unica transition cercana a una tarjeta con imagen (src/styles/_api.scss lineas 180-182, box-shadow 300ms ease-out) vive dentro de @media (prefers-reduced-motion: no-preference), confirmado leyendo el fichero completo; @s42 corre con page.emulateMedia({ reducedMotion: 'reduce' }) (tests/e2e/movimiento.spec.ts linea 12), el modo exacto en el que esa regla no se aplica.
   - Empirica: corri pnpm exec playwright test tests/e2e/movimiento.spec.ts --workers=1 de forma aislada -- 3/3 verde, incluido @s42 con "0 animaciones en curso". Combinado con la corrida completa de 9 workers (tambien verde), confirmo independientemente la conclusion del tdd_craftsman: la hipotesis de la animacion de "hueco de imagen cargando" queda descartada.
   - Confirmado ademas que no queda ningun resto de sabotaje: tests/e2e/zzz-hipotesis-temporal.spec.ts no existe en el arbol ni en git status.
2. pnpm run test:e2e completo, corrida independiente: Running 75 tests using 9 workers -> 75 passed (27.0s), sin ningun fallo. Incluye @s23 (2/2), @s13-@s16, @s29 (imagenes.spec.ts, con el fix de origenPropio), @s33/@s34 (red-limpia.spec.ts), y @s42 (movimiento.spec.ts).
3. bin/harness init completo, corrida independiente: lint (oxlint --deny-warnings) limpio, tsc -b limpio, Vitest 1046/1046 verde (79 ficheros). Resultado: entorno listo.
4. Fix de imagenes.spec.ts @s29: lei el diff exacto (lineas 1-7, 55-127). Las unicas lineas nuevas son la importacion de SUBPATH_DE_PRODUCCION, la prefijacion de page.goto/request.get con ese subpath (ya presente desde la ronda anterior, @s13-@s17), y la nueva constante origenPropio usada para componer la URL de decodificacion de imagen. Ninguna linea expect(...) cambio su valor esperado.
5. Ninguna de las 6 features done reabre comportamiento: lei Galeria.tsx y PaginaTienda.tsx completos ademas de sus diffs -- alt, width, height, loading, decoding, la cantidad de figure/li y el resto de la estructura JSX son identicos a antes de la enmienda; el unico cambio observable es src={hrefDeDestino(...)} en vez de src={...} a secas.

## Checkpoints

- C1 (arnes completo): [x] Confirmado, bin/harness init termino en verde en mi corrida independiente.
- C2 (estado coherente): [x] Solo la feature 23 esta in_progress en feature_list.json (grep de los 23 status, unico in_progress).
- C3 (arquitectura): [x] hrefDeDestino.ts/tecnicaSpaGithubPages.ts bajo src/lib/**, sin dependencias nuevas, sin logs de depuracion sueltos en el codigo revisado.
- C4 (verificacion real): [x] Cada modulo nuevo tiene test dedicado; los tests de navegador real usan Playwright real contra dist/ real, no mocks.
- C5 (sesion cerrada bien): [ ] No aplica todavia -- la sesion sigue abierta (feature 23 no esta done); ademas hay trabajo mezclado sin commitear de accesibilidad en el arbol (ver "Observacion de higiene de sesion" arriba), a resolver antes del cierre de sesion.
- C6 (contrato Gherkin): [x] con una nota -- los 24 @s tienen test concreto (tabla de arriba). El unico hueco es textual, no de cobertura: @s12 del .feature (linea 347) no esta reconciliado a "5" pese a que feature_list.json afirma que si.
- C7 (prueba de mutacion): [ ] PENDIENTE, no ejecutada todavia. No existe progress/mutation_despliegue_github_pages.md; progress/current.md marca explicitamente ambas rondas (original y enmienda) como "pendiente de judge/mutation_tester". Es el siguiente paso normal del pipeline tras esta aprobacion, no un rechazo.

## Cambios requeridos (si aplica)

Ninguno bloquea la aprobacion de la enmienda @s18-@s24: el codigo, los tests y la verificacion independiente confirman que el trabajo es correcto y esta completo segun su propio alcance declarado. Antes de marcar la feature 23 como done, sin embargo, quedan pendientes (responsabilidad de craftsman_lead, no reapertura de TDD):

1. Ejecutar mutation_tester sobre src/lib/hrefDeDestino.ts y src/lib/tecnicaSpaGithubPages.ts (el unico alcance mordible declarado de esta feature, stryker.config.json -> mutate incluye src/lib/**/*.ts, umbral 1.0 en harness.config.json). Nunca se ha medido para esta feature -- ni la ronda original ni la enmienda tienen progress/mutation_despliegue_github_pages.md. La enmienda no anade superficie mordible nueva (confirmado: hrefDeDestino.ts solo cambio de JSDoc, tecnicaSpaGithubPages.ts no se toco), asi que basta una sola corrida cubriendo ambos ficheros.
2. Reconciliar el texto de features/despliegue_github_pages.feature linea 347 ("exactamente 4" -> "exactamente 5"), consistente con @s14 y con el propio test de @s12. Cambio de texto/hecho ya decidido, no de diseno -- mismo patron que otras reconciliaciones ya aceptadas en este proyecto (@s34 de sistema_de_diseno_visual, "ocho digitos" de pie_de_pagina).
3. Corregir la nota de feature_list.json linea 371, que afirma una reconciliacion de @s12 ("4 a 5") que no se aplico realmente al .feature.
4. Separar el trabajo sin commitear de accesibilidad (progress/judge_accesibilidad.md, progress/tdd_accesibilidad.md, y las porciones de tests/e2e/accesibilidad.spec.ts/movimiento.spec.ts que no son de esta feature) del commit de cierre de despliegue_github_pages, para no mezclar dos features en un mismo commit.

## Veredicto sobre la feature COMPLETA (24 escenarios)

NO lista para done todavia -- no por ningun defecto de diseno o cobertura (@s1-@s24 estan cubiertos, verificados por mi de forma independiente, cero produccion sin test), sino porque la puerta de mutacion (C7) nunca se ha ejecutado para esta feature: ni en la ronda original (@s1-@s17) ni en la enmienda (@s18-@s24). El propio harness.config.json fija mutation.threshold en 1.0 y require_mutation_to_close en true, y docs/workflow.md es explicito en que el mutation_tester corre despues de la aprobacion del judge -- este es exactamente ese punto del pipeline, no una senal de que algo este mal.

Con la aprobacion de esta revision, el siguiente paso correcto es: mutation_tester sobre src/lib/hrefDeDestino.ts + src/lib/tecnicaSpaGithubPages.ts (unico alcance mordible declarado, sin cambios de comportamiento en la enmienda) -> si PASS al 100% sobre no equivalentes, craftsman_lead reconcilia los 2 hallazgos textuales de arriba (items 2 y 3) y separa el commit de accesibilidad (item 4) -> recien entonces marcar done en feature_list.json.

## Refuerzo mutación (26/08/2026)

**Veredicto:** APPROVED

Revisión puntual del refuerzo de `tdd_craftsman` sobre los 4 mutantes
supervivientes que `mutation_tester` reportó en `progress/mutation_despliegue_github_pages.md`
(91.30%, 2 en `hrefDeDestino.ts:5`, 2 en `tecnicaSpaGithubPages.ts:55`).

### Cambios verificados

- `src/lib/hrefDeDestino.ts` / `src/lib/tecnicaSpaGithubPages.ts` (producción):
  **sin cambios**. `sha256sum` calculado por mí de forma independiente ANTES
  de tocar nada: `e2b79550...` y `bdb14388...` respectivamente — coinciden
  exactamente con los hashes que `tdd_craftsman` citó en
  `progress/tdd_despliegue_github_pages.md` ("Refuerzo mutación
  (26/08/2026)"). Confirmado también que el código citado por
  `mutation_tester` en su informe (líneas 45-47 y 85 de
  `progress/mutation_despliegue_github_pages.md`) coincide carácter a
  carácter con el contenido real actual de ambos ficheros (línea 5:
  `base.endsWith('/') ? base.slice(0, -1) : base`; línea 55:
  `ruta.search === '' ? '' : \`&${escaparAmpersands(ruta.search.slice(1))}\``).
- `src/lib/hrefDeDestino.test.ts`: **1 test nuevo**, dentro de
  `describe('@s5 ...')` (líneas 57-61), con
  `hrefDeDestino('/campanas', '/GalapavetClinicaVeterinaria')` (base que
  empieza pero NO termina en barra) y `toBe` exacto. Confirmado leyendo el
  fichero completo: no se tocó ningún otro `it`/`describe`.
- `src/lib/tecnicaSpaGithubPages.test.ts`: **0 tests nuevos**, 1 `expect`
  añadido al `it` YA EXISTENTE de `@s9` (línea 23,
  `expect(resultado.search).toBe('?/campanas')`), manteniendo el
  `not.toContain` original. Confirmado leyendo el fichero completo.

### Los 4 sabotajes, reproducidos por mí de forma independiente (los 4, no una muestra)

Metodología: backup de ambos ficheros de producción en el scratchpad de esta
sesión, sabotaje quirúrgico con Node (`fs.readFileSync`/`replace`/
`writeFileSync` sobre el literal exacto), `pnpm exec vitest run` del fichero
de test correspondiente, restauración desde el backup, `sha256sum` para
confirmar restauración exacta antes de pasar al siguiente. Ninguna edición
quedó activa entre sabotajes ni al final.

1. `hrefDeDestino.ts:5` `endsWith('/')` → `startsWith('/')` (MethodExpression):
   rojo confirmado — 1/70 en rojo, exactamente el test nuevo de `@s5`
   (`'/GalapavetClinicaVeterinari/campanas'` recibido vs.
   `'/GalapavetClinicaVeterinaria/campanas'` esperado). Restaurado, hash
   `e2b79550...` confirmado de nuevo.
2. `hrefDeDestino.ts:5` `endsWith('/')` → `endsWith('')` (StringLiteral):
   rojo confirmado — mismo test, mismo fallo exacto. Restaurado, hash
   confirmado.
3. `tecnicaSpaGithubPages.ts:55` `ruta.search === ''` → `false`
   (ConditionalExpression): rojo confirmado — 1/8 en rojo, exactamente el
   `it` de `@s9` reforzado (`'?/campanas&'` recibido vs. `'?/campanas'`
   esperado). Restaurado, hash `bdb14388...` confirmado de nuevo.
4. `tecnicaSpaGithubPages.ts:55` `ruta.search === ''` →
   `ruta.search === 'Stryker was here!'` (StringLiteral): rojo confirmado —
   mismo test, mismo fallo exacto. Restaurado, hash confirmado.

Los 4 mutantes citados por `mutation_tester` quedan matados por el refuerzo,
cada uno reproducido y verificado por mí de forma directa, no por confianza
en el reporte de `tdd_craftsman`.

### Verificación independiente del estado del árbol

- `pnpm run test`: **1047/1047 verde**, corrida completa mía, independiente.
- `bash bin/harness init`: **verde** de punta a punta (lint `oxlint
  --deny-warnings`, `tsc -b`, 1047/1047 Vitest), corrida completa mía,
  independiente.
- `git status --porcelain -uall` sobre los 4 ficheros relevantes: solo `??`
  (untracked, sin trackear desde el origen de la feature, como se esperaba);
  `grep -r "Stryker was here" src/` → 0 resultados. Ningún residuo de
  sabotaje activo.

### Disciplina TDD del refuerzo

- ¿Producción sin test que la pida? NO — cero cambios de producción en esta
  ronda de refuerzo (confirmado por hash).
- ¿Evidencia de Rojo→Verde→Refactor? SÍ, en el sentido de esta ronda
  puntual (mutación, no un escenario nuevo): cada uno de los 2 tests
  reforzados fue verificado en rojo contra los 2 mutantes exactos que debía
  matar, y en verde contra la producción real — por `tdd_craftsman` primero,
  y ahora replicado íntegramente por mí, con el mismo resultado.

### Veredicto sobre el desbloqueo de la feature 23 completa

Con este refuerzo APROBADO, los 2 únicos módulos mordibles declarados de la
feature 23 (`src/lib/hrefDeDestino.ts`, `src/lib/tecnicaSpaGithubPages.ts`,
alcance ya fijado en la revisión anterior de este mismo fichero) quedan
listos para que `mutation_tester` remida. Los 24 escenarios (`@s1`-`@s24`)
siguen cubiertos exactamente como se documentó en la revisión previa (sin
cambios de cobertura en esta ronda, solo refuerzo de mutación). Si
`mutation_tester` confirma 100% sobre mutantes no equivalentes, no queda
ningún bloqueo de diseño/cobertura/mutación pendiente para esta feature —
solo los 2 hallazgos textuales y la separación de commit ya señalados en la
sección anterior de este documento (puntos 2-4 de "Cambios requeridos"),
que siguen siendo responsabilidad de `craftsman_lead`, no de una nueva
ronda de TDD.
