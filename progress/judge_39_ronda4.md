# Review — feature 39 `retirada_carteleria_urgencias` — RONDA 4

> `judge`, 21/09/2026, noche. Cuarta ronda. **Ni un dato de este informe está
> heredado del encargo, de `mutation_39_ronda3.md`, de `current.md` ni de ningún
> otro informe de agente.** Todo lo que afirmo lo he corrido o leído yo en esta
> máquina, en esta sesión. No he editado ni una línea de código, de test, de
> contrato ni de informe ajeno.
>
> El encargo me avisó de que no me creyera nada. No me he creído nada: he
> rederivado la superficie mutable, he auditado el JSON de Stryker en vez de su
> informe, he verificado el esquema del paquete instalado, y he seguido cinco
> filas del mapa `@s → test` hasta el `describe` real. **De las siete tareas que
> pedí en la ronda 3, las siete están hechas, y la medición que faltaba sale
> limpia.** Rechazo por algo más pequeño y más terco, explicado en §7.

**Veredicto: CHANGES_REQUESTED**

**Lo primero, porque es la verdad del trabajo:** el bloqueante de la ronda 3 está
cerrado y bien cerrado. Los dos módulos que nadie había mutado se han mutado, y
mi sospecha sobre el `.every()` **queda refutada por medición**, no por
argumento. Las cinco puertas salen verdes y clavadas a la referencia. Nada de lo
que rechazo hoy está en `src/`, en los tests ni en la cobertura.

**Rechazo porque tres artefactos —el contrato firmado, el índice de TDD recién
creado y `current.md`— siguen mis instrucciones en la forma y reproducen en el
fondo el defecto exacto que pedí corregir: acreditar esta feature con informes
que la RECHAZAN, y citar líneas que apuntan a otro sitio.** Son seis ediciones de
texto. Ninguna toca código.

---

## 0. Lo que he ejecutado yo, sin tubería, con el 4173 comprobado libre

`netstat -ano | grep 4173` → **sin una sola línea escuchando** antes de medir.
Confirmado: el `vite preview` del orquestador estaba muerto. Playwright tiene
`reuseExistingServer: !CI` (`playwright.config.ts:59`), así que ese dato no es
ceremonia: con el puerto ocupado habría medido un `dist/` prestado. Cada código
de salida se ha leído de su propio comando, sin tubería delante.

| Puerta | Comando | Exit | Medido hoy | Referencia del encargo |
| --- | --- | --- | --- | --- |
| Arnés | `node .harness/harness.mjs init` | **0** | **88 ficheros · 1422 tests · 1422 pasan**, 203,72 s, `grep -c FAIL` = **0**, `[OK] feature_list.json válido (46 features)`, «Entorno listo» | 88 / 1422 / 0 → **coincide** |
| Lint + tipos | dentro del init (`oxlint --deny-warnings`, `tsc -b`) | **0** | «Lint sin errores» | 0 / 0 → **coincide** |
| Navegador | `pnpm run test:e2e` | **0** | **174 `ok` de 174** («Running 174 tests using 12 workers»); 27 ficheros `tests/e2e/*.spec.ts` en el árbol | 174 / 27 → **coincide** |
| Configuración | `pnpm run test:config` | **0** | `# pass 5`, `# fail 0` | 5/5 → **coincide** |

**Las cuatro mediciones del encargo son ciertas, al dígito.** El `46 features`
del init es el único número que difiere de la ronda 3 (41), y es correcto: se
registraron 42-45 y además la 46.

**Dato que sostiene el resto:** desde `progress/judge_39_ronda3.md` (mtime 07:41)
solo han cambiado **siete** ficheros en todo el repositorio, y **ninguno es
código ni test** (`find . -newer`, excluidos `node_modules`, `.git`, `dist`,
`.stryker-tmp`, `reports`):

    features/retirada_carteleria_urgencias.feature · feature_list.json
    progress/current.md · progress/mutation_39_ronda2.md
    progress/mutation_39_ronda3.md · progress/tdd_retirada_carteleria_urgencias.md
    progress/verificacion_navegador_20260921.md

Y `find ./src ./tests -newer progress/mutation_39_ronda3.md` devuelve **vacío**:
ni una fuente se ha tocado después de medir la mutación. Por tanto la
verificación de cobertura aserción a aserción de mis rondas 2 y 3 sigue vigente
byte a byte, y la corrida de Stryker mide el código de hoy.

---

## 1. La superficie mutable, rederivada por mí: son CINCO. No hay un sexto

No he dado por buena la lista de nadie, porque ya estuvo mal una vez. Método:
`git status --porcelain` completo (seguidos, en índice y **sin seguir**), cruzado
a mano contra los globs de `stryker.config.json:12-17`
(`src/lib/**/*.ts`, `src/**/*-logica.ts`, menos `*.test.ts(x)`):

| Fichero `.ts` de `src/` que la feature toca | ¿Dentro de los globs? | ¿Medido? |
| --- | --- | --- |
| `src/components/Cabecera-logica.ts` | sí (`*-logica.ts`) | ronda 2 (31) |
| `src/components/PieDePagina-logica.ts` | sí (`*-logica.ts`) | ronda 2 (14) |
| `src/lib/accesibilidad-movimiento.ts` | sí (`src/lib`) | ronda 2 (50) |
| `src/lib/diseno/datosDelSitio.ts` | sí (`src/lib`) | **ronda 3 (172)** |
| `src/lib/diseno/matrizDeContraste.ts` | sí (`src/lib`) | **ronda 3 (315)** |

**Ni un sexto.** Todo lo demás que la feature toca es `.tsx`, `.scss`,
`.feature`, `.md`, `*.test.ts(x)` o `tests/e2e/**`, fuera de los globs. **No hay
ningún fichero nuevo sin seguir dentro de `src/`** (los 24 `??` del repo son
todos de `progress/`). La lista del encargo, esta vez, es correcta.

---

## 2. Auditoría de `progress/mutation_39_ronda3.md` contra `reports/mutation/mutation.json`

Leído el JSON con un script propio, no la tabla del informe.

| Lo que afirma el informe | Lo que dice el JSON | ¿Cierto? |
| --- | --- | --- |
| 2 ficheros mutados | `Object.keys(files)` = 2 | **sí** |
| 487 mutantes | 172 + 315 = **487** | **sí** |
| `{ Killed: 485, Survived: 2 }` y nada más | reparto exacto `{Killed:485, Survived:2}`; 0 Timeout, 0 NoCoverage, 0 RuntimeError, 0 CompileError, 0 Ignored | **sí** |
| `datosDelSitio.ts` 172/172 | `{Killed:172}`, sin supervivientes | **sí** |
| Los 2 supervivientes, en `matrizDeContraste.ts` | `44:12` `Regex` y `58:22` `ConditionalExpression` a `false` | **sí, idénticos al catálogo de `mutation_rediseno_visual.md` §4.6, desplazados +4 líneas** |

**La columna que manda (`# timeout` = 0) la he verificado yo sobre el JSON, no
sobre el texto.** El informe la lee primero y cita la regla: método correcto.

### 2.1 Mi sospecha del `.every()`: refutada por medición, y me parece bien

Pedí mirar de frente `datosDelSitio.ts:437` porque `.every()` sobre lista vacía
devuelve `true` y esta feature dejó esa lista vacía en las seis rutas. **Los
cinco mutantes de esa línea están muertos en el JSON**, y los he listado uno a
uno:

    437:11 MethodExpression      every -> some                     Killed
    437:40 ArrowFunction         callback -> () => undefined       Killed
    437:56 ConditionalExpression callback -> true                  Killed
    437:56 ConditionalExpression callback -> false                 Killed
    437:56 EqualityOperator      === -> !==                        Killed

Y las dos guardas de fallo cerrado de los insumos (`:413` y `:422`) suman 8
mutantes, **los 8 muertos**. La puerta @s52 no aprueba por vacuidad. Mi sospecha
era razonable y estaba equivocada: queda dicho.

### 2.2 `vitest.related`: el razonamiento es correcto, y sí hay que escribirlo en `docs/`

Verificado por mí en el paquete instalado, no en el informe:
`node_modules/@stryker-mutator/vitest-runner` es **v10.0.0** y su
`dist/schema/vitest-runner-options.json` declara `related` con
`"default": true`. Es cierto: cada mutante se enfrenta solo a los ficheros de
test que Vitest considera relacionados (3 ficheros, 80 tests), no a los 1422.

**El argumento del `mutation_tester` se sostiene, y le añado la pata que le
falta:**

1. Restringir el conjunto de verdugos solo puede **quitar** oportunidades de
   matar, así que empuja hacia **más** supervivientes. Un 100 % medido así es más
   fuerte, no más débil. Correcto.
2. Lo que ese argumento **no** cubre por sí solo es el riesgo simétrico: un
   **falso muerto** por un test que falla por motivos ajenos al mutante. Eso lo
   descarta otra cosa que sí está medida: el `Initial test run succeeded` con
   **80 tests y 0 fallos** sobre las fuentes intactas. Si los 80 pasan en verde
   sin mutar, cualquier rojo posterior es atribuible al mutante.
3. Tercer flanco, también cerrado por el JSON: si `related` hubiera dejado algún
   mutante sin ningún test, Stryker lo marcaría `NoCoverage`, que **cuenta en
   contra** del score. Hay **0**.

Con las tres patas, el veredicto PASS no cambia. **Y sí: esto debe escribirse en
`docs/mutation-testing.md`** (87 líneas hoy, `grep related` = 0 coincidencias).
No es una nota de esta feature: cambia cómo hay que leer los **39** informes de
mutación del repositorio, incluidos los que dicen «la suite mató estos
mutantes», frase que con `related: true` es falsa. Que el `mutation_tester` lo
flagueara por su cuenta, sin que nadie se lo pidiera y sabiendo que debilitaba la
lectura fácil de su propio informe, es lo mejor de esta ronda.

### 2.3 Integridad de la corrida, comprobada aparte

`datosDelSitio.ts` (mtime 00:49:50) y `matrizDeContraste.ts` (00:34:47) son
**anteriores** a la ventana de corrida (20:30-20:50) y
`reports/mutation/mutation.json` tiene mtime 20:50:01, dentro de ella. Ninguna
fuente se tocó después. El descarte declarado de la corrida contaminada de las
07:49 (máquina suspendida, un `Timeout` artefacto del reloj) es la decisión
correcta según la regla de `feature_list.json` -> `rules.notas`, y **decirlo en
vez de esconderlo** es lo que hay que hacer.

**Estado consolidado de la mutación de la feature 39** (cuadrado por mí con los
informes de las tres rondas): 582 mutantes · 579 muertos · 3 supervivientes, los
**tres** equivalentes con justificación escrita **previa** (`esMovil` desde la
feature 3; los dos de `matrizDeContraste.ts` desde `mutation_rediseno_visual.md`
§4.6). **579/579 no equivalentes = 100 % = umbral.** Cero huecos de test.

---

## 3. Cobertura de escenarios (@s ↔ test)

### 3.1 El contrato propio de la feature

- **@s1** — `[x]` **cubierto**, verificado leyendo las aserciones, no la tabla:
  `tests/e2e/urgencias.spec.ts:113` (el test), `:127` el recolector sale de
  `page.evaluate` sobre el documento real, `:148` acumula el tercer censo,
  `:167-168` `rutasRecorridas === RECUENTO_DE_RUTAS` **y** `=== 6`, y `:200-203`
  el disparador `toBe(0)` con su mensaje. **Las cuatro cláusulas del escenario
  tienen su línea.** La mordiente (invertido a 1, rojo) está acreditada en
  `progress/tdd_39_oleada6_rotulos_accesibles.md`.
- **@s1 no se ha tocado desde la puerta humana**: ahora sí se puede demostrar,
  porque el fichero ya está en el índice de git (mi punto 6 de la ronda 3). Lo he
  verificado yo: el `git diff` entre la versión en índice y la del árbol son **50
  altas y 5 bajas, todas ellas líneas que empiezan por almohadilla**. El bloque
  `Feature:` / `@s1` / `Scenario:` y sus cuatro `And` no aparecen en el diff.
  **Solo cambiaron comentarios.** La afirmación del encargo es cierta.

### 3.2 Los otros ocho contratos

Mapa consolidado en `progress/tdd_retirada_carteleria_urgencias.md` §1 (creado
esta tarde, cierra mi punto 7). He seguido **cinco filas** hasta el `describe`
real:

| Fila del índice | Lo que encontré | ¿Miente? |
| --- | --- | --- |
| `cabecera_y_navegacion` @s13 -> `Cabecera.test.tsx` | el `describe` de @s13 está en la línea 234 | no |
| `seo_estructura` @s10 -> `paginasSeo.test.tsx:66` | el `describe` de @s10 está en `:66` | no |
| `fidelidad_contacto` @s1 y @s5 -> `:32` y `:166` | los dos `test(` están exactamente ahí | no |
| `pie_de_pagina` @s2 -> `PieDePagina.test.tsx:37` | el `describe` de @s2 está en **:48**; **:37 cae dentro de @s1** | **la línea, sí** |
| `pie_de_pagina` @s15 -> `PieDePagina.test.tsx:327` | el `describe` de @s15 está en **:352**; **:327 es la primera línea del `describe` de @s14** | **la línea, sí** |

**En los cinco casos el CONTENIDO descrito coincide con el test correcto** (he
leído los `it` de @s2 y @s15 enteros: 4/4/3 elementos de lista y 11 en total; y
el teléfono inválido de siete dígitos que lanza y deja 0 enlaces `tel:+34`).
**La cobertura es real; lo que está roto es el puntero.** Ver §7.2.

- Los **tres** escenarios sin puerta (`informacion_contacto` @s5 y @s12,
  `fidelidad_contacto` @s3) están retirados del contrato con nota de derogación,
  y su ausencia la muerden @s6 y @s13 del mismo fichero. **Deliberado y bien
  declarado.**

---

## 4. Disciplina TDD

- **¿Producción sin test que la pida?** **NO.** Ni una fuente de `src/` ha
  cambiado desde que lo verifiqué en la ronda 2 aserción a aserción, y lo he
  comprobado hoy con `find`, no con confianza.
- **¿Evidencia de Rojo -> Verde -> Refactor?** **SÍ**, en las seis bitácoras de
  oleada, ahora con puerta de entrada. Dos rojos nacidos a propósito están
  documentados: @s4 de `fidelidad_cabecera` (el solape real de 1 px) y las tres
  cláusulas de @s20 de la oleada 5. @s1 nació **verde**, y eso también está dicho
  y medido en navegador, como el propio contrato exigía.

---

## 5. Las tres decisiones que el encargo me pide juzgar

### 5.1 No arreglar el ritmo del nav dentro de la 39 — DECISIÓN CORRECTA

No es esquivar trabajo, y lo he comprobado en el contrato antes de opinar:

- **Ningún escenario de los nueve contrata el blanco entre enlaces.**
  `fidelidad_cabecera` @s1 (`:154-164`) fija la columna de 1220, los dos bordes,
  el logotipo, los 4 px marca-descriptor y la prohibición del «24 h»; @s2
  (`:177-185`) fija ocho enlaces en una sola fila, el destino de Tienda,
  **44x44 sobre los ocho** con anti-vacuidad, y ningún `tel:`. Nada sobre el
  ritmo. Arreglarlo dentro de la 39 sería producción que ningún test rojo pidió:
  exactamente lo que yo tendría que rechazar.
- **El mecanismo es cierto**, verificado en la fuente y no en el informe:
  `Cabecera.module.scss:131-133` declara `display: inline-flex` y
  `min-width: $altura-control-media` (48) **sin** `justify-content`, mientras la
  píldora `Tienda` (`:226-228`) sí lleva `justify-content: center`. El patrón
  correcto existe en el mismo fichero, como dice el informe.
- **La puerta humana está bien pedida**: los dos arreglos mueven números que hoy
  están fijados por contrato, y elegir entre «seis huecos de 20 y dos saltos» y
  «ocho huecos de 23,24» es una decisión visual de Pablo, no de artesano.
- Y el hallazgo existe **porque alguien miró la página renderizada por primera
  vez**. Eso es lo que faltaba en tres rondas verdes.

### 5.2 La salvedad de los botones del hero — CORRECTO NO ARREGLARLO, MAL NO REGISTRARLO

El diagnóstico es exacto, y lo he verificado en el SCSS:
`Hero.module.scss:107-109` pone `min-height: $altura-control-grande` (56) a todo
`.acciones a`, pero `a:not(:first-child)` incluye `boton-fantasma`, que declara
`min-height: $altura-control-media` (48) en `_api.scss:253` y gana por
especificidad. Los 56 px del fantasma salen del `stretch` del contenedor, no de
una declaración. **No tocarlo dentro de la 39 es correcto**: no hay cláusula que
lo pida y el punto 4 de Pablo se cumple en pantalla.

**Pero:** `grep` sobre `feature_list.json` devuelve **0** coincidencias de esta
salvedad. Vive **solo dentro de un informe de progreso**, que es palabra por
palabra el defecto que yo mismo describí en la ronda 3 §9 («no estaban
registradas en ningún sitio: vivían solo dentro de un informe») y que esta misma
tanda arregló para los otros nueve avisos. Si mañana alguien cambia el
`display: flex` de `.acciones`, los botones pasan a 56 y 48 y **ninguna puerta se
pone roja**.

### 5.3 Los dos comentarios caducados nuevos — BIEN, y verificado

`src/components/Hero.module.scss:116` («mismo recurso que el CTA de urgencias de
`Cabecera.module.scss` sobre su rojo») y `src/data/navegacion.ts:7-9` existen y
dicen lo que el informe dice. Y **sí están registrados**: la `description` de la
feature 42 los incorpora literalmente, con su «AÑADIDO EL 21/09/2026». Hecho como
debe hacerse.

---

## 6. Las siete tareas de mi ronda 3, una a una

| # | Tarea | Estado, verificado por mí |
| --- | --- | --- |
| 1 | Mutar `datosDelSitio.ts` y `matrizDeContraste.ts` | **CERRADA** — §2, auditado contra el JSON |
| 2 | Corregir `mutation_39_ronda2.md:166-167` | **CERRADA** — hoy encabeza su §7 con «CORRECCIÓN (21/09/2026, judge ronda 3): la frase de abajo era FALSA», conserva la frase original y apunta al informe de la ronda 3. Es el criterio correcto |
| 3 | `progress/current.md` al día | **CERRADA en lo que pedí** (segunda puerta humana, rechazo de la ronda 2 con sus dos bloqueantes, estado de la ronda 3) — **y vuelta a caducar en 35 minutos**, §7.3 |
| 4 | `.feature:236-239`, la nota caducada por tercera vez | **CERRADA** — reescrita contando que lo estuvo, y solo cambian comentarios (§3.1) |
| 5 | Fila 10 de la tabla (B): quitar `judge_39.md` y `mutation_39.md` | **CERRADA EN LA FORMA, ABIERTA EN EL FONDO**, §7.1 |
| 6 | `git add` del noveno contrato | **CERRADA** — `AM` en `git status`; por primera vez la congelación de @s1 es verificable, y la he verificado |
| 7 | Crear `progress/tdd_<name>.md` | **CERRADA** — existe, y es un índice honesto: declara los tres escenarios sin puerta y por qué. **Con dos defectos propios**, §7.2 |

Y mi §9: las cuatro tareas están **REGISTRADAS de verdad**. `feature_list.json`
tiene hoy **46** features (38 `done`, 1 `in_progress`, 7 `pending`), con 42-45 y
la 46 nueva, todas en `pending` —el único estado que `.harness/harness.mjs:69`
no obliga a acompañar de su `.feature`— y con `acceptance` que muerden de verdad
(la última de la 42 es «existe una puerta que muerde: una nota que vuelva a
caducar hace fallar algo», que es la única forma de no repetir esto). El init
valida el fichero. **Esta parte está impecable.**

---

## 7. Por qué rechazo: tres artefactos acreditan la feature con informes que la rechazan

### 7.1 Fila 10 del contrato: se cambió un RECHAZO por otro RECHAZO

`features/retirada_carteleria_urgencias.feature:190-193` dice hoy que el criterio
10 «se acredita en los informes VIGENTES, que son los ÚLTIMOS:
`progress/judge_39_ronda3.md` y `progress/mutation_39_ronda2.md`».

- **`progress/judge_39_ronda3.md` es un `CHANGES_REQUESTED`** cuyo C7 está
  literalmente en «[ ] — BLOQUEANTE». Mi punto 5 decía: «sustituir
  `progress/judge_39.md` (un RECHAZO)… por los informes vigentes». La corrección
  retiró un rechazo y puso otro. El criterio 10 del `acceptance` —tests, lint,
  typecheck, build, verificación en navegador y mutación en verde— queda
  acreditado con el documento que declara ese mismo criterio incumplido.
- **`progress/mutation_39_ronda2.md` es la corrida que midió 3 de los 5 módulos**
  y la que contenía la frase falsa. Es, otra vez, la evidencia más débil.
- **`progress/mutation_39_ronda3.md` —la evidencia buena— no aparece por su ruta
  en ninguna parte del contrato**: se alude a ella como «(más la corrida de los
  dos módulos que faltaban, 21/09/2026)». Un auditor que siga el puntero sigue
  llegando al sitio equivocado, que es exactamente lo que describía mi §3.2.
- Y en el mismo fichero, `:279-281` sigue listando «La mutación de
  `datosDelSitio.ts` y `matrizDeContraste.ts`» bajo lo que está abierto, con el
  rótulo «Bloqueante de la ronda 3». Se midió a las 20:30-20:50 y su informe es
  de las 21:01.

Esto es texto, sí. Pero está en el **único artefacto firmado por un humano**, y
es el puntero que un auditor sigue para creerse la feature. Es la cuarta vez que
este fichero publica una nota que no es verdad, y la segunda vez que el arreglo
reproduce el defecto que documenta.

### 7.2 El índice de TDD nace con cinco citas corridas y una frase falsa

El fichero que pedí (punto 7) está bien pensado, pero:

- **Cinco de sus citas de línea apuntan a otro sitio**, y cuatro caen dentro del
  `describe` de un escenario **distinto** (verificado con `grep -n` de los
  `describe` sobre `src/components/PieDePagina.test.tsx`):

  | Fila del índice | Cita | `describe` real | Dónde cae la cita |
  | --- | --- | --- | --- |
  | `:88` @s2 | `:37` | **:48** | dentro de @s1 |
  | `:92` @s5 | `:107` | **:119** | dentro de @s4 |
  | `:93` @s6 | `:139` | **:148** | dentro de @s5 |
  | `:94` @s7 | `:170` | **:171** | en el límite |
  | `:95` @s15 | `:327` | **:352** | primera línea de @s14 |

  Y esto no es una opinión mía sobre el estilo: **el propio contrato lo prohíbe
  por escrito** en `features/retirada_carteleria_urgencias.feature:137-139` —«Se
  citan ficheros de test, NUNCA números de línea: en este repositorio las citas
  de línea se corren y la nota nace caducada»—. El índice creado para cerrar C6
  incumple la regla de oro del contrato al que sirve, en la misma tanda; y las
  cinco citas ya estaban corridas **el día que se escribieron**: ningún test ha
  cambiado desde entonces (`find ./src ./tests -newer` lo confirma).

- **`progress/tdd_retirada_carteleria_urgencias.md:158-159`**: «No acredita la
  revisión. Eso es el `judge`, y la vigente es `progress/judge_39_ronda3.md`.
  **Las dos anteriores son RECHAZOS**». Las **tres** lo son. La frase, escrita a
  las 20:41 —trece horas después del rechazo que cita—, deja entender que la
  revisión vigente aprueba la feature. Es la misma operación de §7.1 en otro
  fichero.

- `:153-157` y `:160-161` presentan la mutación de los dos módulos y la
  verificación en navegador como pendientes. Las dos estaban hechas 20 y 37
  minutos después; eso es desfase tolerable, pero hay que cerrarlo en el mismo
  viaje.

### 7.3 `current.md` vuelve a ir por detrás

`progress/current.md:112` da la mutación de los dos módulos como **«EN CURSO»**
(terminó a las 20:50: PASS, 485/487, con los 2 equivalentes) y `:144-148` dice
que la **«verificación en navegador real… no la ha hecho nadie todavía»** cuando
existe `progress/verificacion_navegador_20260921.md`, del mismo día a las 21:18.
Y `:127-133` enumera las features 42-45 sin la 46, registrada a las 21:17. El
fichero anti-teléfono-descompuesto va, otra vez, media hora por detrás.

### 7.4 Lo que NO es motivo de rechazo, dicho para que nadie lo arregle de más

- El código, los tests, la cobertura y la mutación: **nada que tocar**.
- El desfase natural de que ningún documento pueda citar todavía este informe.
- Los nueve avisos no bloqueantes: registrados en 42-45, no se re-litigan.
- El `exit 1` de Stryker con `break = 100` por los equivalentes: decisión abierta
  del orquestador desde la feature 3, y **no rompe el CI**, que corre
  `build` + `init` + `test:config` y **no** la mutación
  (`.github/workflows/harness-ci.yml`, verificado por mí).

---

## 8. Calidad (lente de artesano)

- **Arquitectura respetada**: la lógica sigue en módulos puros y los `.tsx`
  cablean. La superficie mutable declarada y la real coinciden (§1).
- **Contrato de errores**: intacto y mordido — `PieDePagina.test.tsx:352` exige
  que un teléfono inválido **lance con el valor recibido** y que no quede ningún
  enlace `tel:+34` a medias. Fallar cerrado, no pintar a medias.
- **Anti-vacuidad**: es la mejor costumbre de esta feature.
  `urgencias.spec.ts:167-168` fija las seis rutas antes de afirmar ceros, y
  `:109-110` comprueba que los tres teléfonos son distintos antes de afirmar que
  uno no es el otro.
- **Deuda concreta que queda, con su fila y ya registrada**:
  `tests/e2e/urgencias.spec.ts:100` devuelve `enlacesTelefonicos` y **nadie lo
  lee** (aparece en `:63`, `:91`, `:92` y `:100`, y en ninguna aserción). Es la
  guarda de universo que le falta a @s1 y está en la feature 43.
- **Sin `TODO`, sin logs de depuración, sin dependencias nuevas.**

---

## 9. Checkpoints

- **C1 — El arnés está completo:** **[x]** — ficheros base y docs presentes;
  `node .harness/harness.mjs init` **exit 0**, `grep -c FAIL` = **0**.
- **C2 — El estado es coherente:** **[~]** — una sola feature en `in_progress`,
  sin basura de sesiones anteriores, pero `current.md` va media hora por detrás
  en tres puntos (§7.3).
- **C3 — El código respeta la arquitectura:** **[x]**.
- **C4 — La verificación es real:** **[x]** — 1422 unitarias y 174 de navegador
  sobre `dist/` servido, con el puerto comprobado libre; 5/5 de configuración.
- **C5 — La sesión se cerró bien:** **[~]** — sin ficheros sospechosos sin
  trackear (los 24 `??` son informes de `progress/`); la entrada de
  `history.md` se escribe al cerrar.
- **C6 — Contrato Gherkin:** **[~]** — el `.feature` existe y está en git, la
  puerta humana está pasada y **es verificable por primera vez**, @s1 tiene test
  concreto, no hay producción sin test rojo, y ya existe `progress/tdd_<name>.md`.
  Falla en que ese índice nace con cinco citas corridas y una frase falsa (§7.2)
  y en que la fila 10 del contrato acredita con un rechazo (§7.1).
- **C7 — Prueba de mutación:** **[x]** — los **cinco** módulos de la superficie
  mutable están medidos; 579/579 no equivalentes muertos = **100 %** = umbral;
  `# timeout` = 0 verificado sobre el JSON; los 3 supervivientes son equivalentes
  con justificación **previa**. **Mi bloqueante de la ronda 3 está cerrado.**

---

## 10. Cambios requeridos

**Bloqueantes** (los tres son ediciones de texto; ninguno toca `src/` ni tests):

1. **`features/retirada_carteleria_urgencias.feature:190-193`** — el criterio 10
   no puede acreditarse con `progress/judge_39_ronda3.md`, que es un
   `CHANGES_REQUESTED` con C7 en «[ ]». Cítense los informes que de verdad
   sostienen el criterio, **por su ruta**: `progress/mutation_39_ronda3.md` (la
   corrida de los dos módulos que faltaban) y el judge que apruebe la feature.
   Y en `:279-281`, sacar la mutación de esos dos módulos de la lista de lo que
   sigue abierto: se midió el 21/09/2026, 20:30-20:50. Como manda la regla de oro
   del fichero, contando que estuvo mal, no fingiendo que no lo dijo.
2. **`progress/tdd_retirada_carteleria_urgencias.md:88, 92, 93, 94, 95`** — cinco
   citas de línea que apuntan a otro `describe` (tabla de §7.2). Lo coherente con
   `features/…:137-139` es **quitar los números de línea** y dejar fichero y tag,
   que es lo que no caduca. Si se prefieren mantener, que apunten a `:48`,
   `:119`, `:148`, `:171` y `:352`.
3. **`progress/tdd_retirada_carteleria_urgencias.md:158-159`** — «las dos
   anteriores son RECHAZOS»: son **tres**. Y en `:153-157` y `:160-161`, dar por
   hechas la mutación (`progress/mutation_39_ronda3.md`) y la verificación en
   navegador (`progress/verificacion_navegador_20260921.md`).

**En el mismo viaje, porque hay que volver a tocar esos ficheros:**

4. **`progress/current.md:112, 127-133, 144-148`** — la mutación ya no está «EN
   CURSO» (PASS, 485/487, 100 % sobre no equivalentes); la verificación en
   navegador ya existe; y falta la feature **46** en la lista de registradas.
5. **Registrar la salvedad de los botones del hero** (§5.2): hoy solo vive en
   `progress/verificacion_navegador_20260921.md` §1.1. `min-height` propio 56
   (`Hero.module.scss:108`) contra 48 (`_api.scss:253`, vía `boton-fantasma`),
   con la igualdad sostenida por el `stretch` del contenedor. Encaja como
   criterio de la **45** o como entrada propia; lo que no puede es quedarse
   dentro de un informe, que es el defecto que esta misma tanda arregló para los
   otros nueve avisos.
6. **`docs/mutation-testing.md`** — documentar `vitest.related: true` por defecto
   en `@stryker-mutator/vitest-runner` v10, qué ficheros de test enfrenta
   realmente cada mutante, y la dirección del sesgo con sus tres patas (§2.2).
   Afecta a cómo se leen los 39 informes de mutación del repositorio, no solo a
   este.

---

## 11. Las tres preguntas del encargo, contestadas

1. **¿Se puede marcar la 39 `done`?** **Todavía no.** Falta mi aprobación, y esa
   es la única puerta que queda: los puntos §10.1-§10.3 son tres ediciones de
   texto. Hechas, se aprueba. **No hay nada pendiente en código, tests,
   cobertura ni mutación**, y eso lo he medido yo.
2. **¿Se puede hacer commit y push?** **Sí en cuanto a riesgo técnico; todavía
   no en cuanto a orden.** El CI no corre la mutación, así que el `exit 1` de
   Stryker por los equivalentes no lo pondrá rojo; `build`, `init` y
   `test:config` los he corrido y salen verdes. Pero hacer el commit **antes**
   de §10.1 congela en la historia un contrato firmado por Pablo que acredita su
   criterio de cierre con un informe que lo rechaza. Evitarlo cuesta media hora;
   no evitarlo es irreversible. **Primero las seis ediciones; luego un único
   commit con la feature en `done`.**
3. **¿Y el despliegue que pide Pablo?** Lo construido es lo que él quiere ver, y
   está medido en navegador real: cabecera sin rastro rojo, nav a 0,00 px del
   borde, 4,00 px entre marca y descriptor, contacto con sus tres bloques y pie
   4/4/3. **Adelante con el despliegue en cuanto el commit esté bien ordenado**,
   y dígasele lo que esta ronda encontró y NO arregló: el ritmo del nav (feature
   46, con su puerta humana) y la igualdad accidental de los botones del hero.

---

## 12. Lo que quiero dejar dicho a favor de esta ronda

1. **El bloqueante se cerró midiendo, no argumentando.** Pedí 481 mutantes y
   salieron 487, con el reparto exacto verificable en el JSON. Y la sospecha que
   yo mismo levanté —el `.every()` sobre lista vacía— **se refutó con los cinco
   mutantes muertos de esa línea**. Así se cierra un bloqueante.
2. **El `mutation_tester` flagueó en contra de su propio informe.** Nadie le
   preguntó por `vitest.related`: lo buscó, lo verificó en el esquema del paquete
   instalado y lo escribió sabiendo que complicaba la lectura de su 100 %. Es el
   hallazgo más valioso de la tanda y trasciende esta feature.
3. **La corrida contaminada se descartó y se contó.** Un `Timeout` provocado por
   una máquina suspendida es justo lo que se calla sin que nadie se entere.
4. **Alguien miró por fin la página renderizada**, y a la primera salieron dos
   cosas que tres rondas verdes no podían ver. La 46 nace con puerta humana y con
   los dos arreglos costeados: así se pasa un hallazgo.
5. **Las cuatro tareas de mi §9 están registradas de verdad**, con `acceptance`
   que muerden, y no dentro de un informe.

Y una a la contra, que es por lo que rechazo: **este es el cuarto informe seguido
en el que el defecto no está en el código, sino en una frase que dice que algo
está bien cuando no lo está.** Las tres rondas anteriores encontraron lo mismo.
La feature 42 existe precisamente para eso, y su cuarto criterio pide una puerta
que muerda. Hasta que esa puerta exista, el único filtro es leer cada cita hasta
el final, que es lo que he hecho.

**Hechas las seis ediciones de §10, esto se aprueba.**
