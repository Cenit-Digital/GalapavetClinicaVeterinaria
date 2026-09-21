# Review — feature 39 `retirada_carteleria_urgencias` — RONDA 5

> `judge`, 21/09/2026, noche. Quinta y última ronda. Todo lo que afirmo aquí lo
> he leído o corrido yo en esta máquina, en esta sesión: el encargo vuelve a
> pedirme que no me crea nada, y no me he creído nada. No he editado ni una
> línea de código, de test, de contrato ni de informe ajeno.

**Veredicto: APPROVED**

Los tres bloqueantes de mi ronda 4 están cerrados, y los tres no bloqueantes
también. **Los he verificado uno a uno en el fichero, no en el resumen del
encargo.** Queda **un** defecto, de un dígito, en un comentario del contrato
(§3), y lo dejo como **condición de cierre** en vez de como sexto rechazo por
una razón que explico entera en §7: el propio texto que el orquestador escribió
en la fila 10 **obliga** a volver a tocar ese fichero después de esta
aprobación, así que pedir una ronda más solo compraría una edición de más sobre
el único artefacto firmado por un humano.

---

## 0. Las puertas: qué he vuelto a medir y por qué

El encargo me dice que no hace falta remedir si nada de `src/` ni de los tests
ha cambiado, **y que lo compruebe yo**. Comprobado:

    find . -newer progress/judge_39_ronda4.md -type f   (sin node_modules, .git,
                                                         dist, .stryker-tmp, reports)
      -> docs/mutation-testing.md
         feature_list.json
         features/retirada_carteleria_urgencias.feature
         progress/current.md
         progress/tdd_retirada_carteleria_urgencias.md

    find ./src ./tests -newer progress/judge_39_ronda4.md   ->  VACÍO

**Cinco ficheros, ninguno de código ni de test.** Así que las cuatro puertas que
corrí yo en la ronda 4 siguen siendo válidas y no las repito por ceremonia:
`test:e2e` **174/174 en 27 specs, exit 0**, y `test:config` **5/5, exit 0**,
medidos por mí con el 4173 comprobado libre antes.

**Pero sí he vuelto a correr el arnés**, y no por prudencia genérica: porque
`feature_list.json` cambió y es **exactamente** lo que la sección 3 del init
valida. Un fichero de features mal formado, o una feature `sdd` fuera de
`pending` sin su `.feature`, rompe el init y con él el CI y el despliegue: es la
trampa que ya rompió el CI en la ronda 1 de esta feature.

| Puerta | Comando | Exit | Medido ahora |
| --- | --- | --- | --- |
| Arnés | `node .harness/harness.mjs init` | **0** | **88 ficheros · 1422 tests · 1422 pasan**, 194,77 s, `grep -c FAIL` = **0**, `[OK] feature_list.json válido (47 features)`, «Entorno listo» |
| Lint + tipos | dentro del init | **0** | «Lint sin errores» |

El único número que se mueve es **47 features** (eran 46): es la 47 nueva, y es
correcto.

---

## 1. El Gherkin firmado por Pablo: INTACTO, verificado de dos formas

Es la cuarta vez que se toca ese fichero, así que no me he quedado con una sola
comprobación:

1. **Diff de contenido sin comentarios**: `git show :features/…` filtrado con
   `grep -v '^[[:space:]]*#'` contra el fichero del árbol filtrado igual →
   `diff` **sin una sola diferencia**.
2. **Diff completo filtrando comentarios al revés**: todas las líneas `+` y `-`
   del `git diff` empiezan por almohadilla. **No hay ni una línea de contenido
   en el diff.**
3. **Lectura literal del bloque**: `Feature:`, las tres líneas de rol, `@s1`,
   el `Scenario:` y sus **cuatro** cláusulas —recuento total 0; sale del
   documento real, nunca de una lista del test; recorre exactamente las seis
   rutas, nunca una lista vacía; el 0 es disparador con mordiente comprobada—,
   en el mismo orden y con las mismas palabras que verifiqué en las rondas 3 y 4.

**La congelación se sostiene, y hoy se puede demostrar** (que era el motivo de
mi punto 6 de la ronda 3: mientras el fichero estaba sin trackear, nadie podía).

---

## 2. Los seis puntos de mi §10, verificados en el fichero

| # | Lo que pedí | Lo que he encontrado hoy | Estado |
| --- | --- | --- | --- |
| 1 | Fila 10 sin rechazos como acreditación | `features/…:190-209`: acredita con, y solo con, `progress/mutation_39_ronda3.md` **por su ruta** (487/485/2, `# timeout` = 0), `progress/verificacion_navegador_20260921.md` **por su ruta**, y «el `judge` que APRUEBE la feature. Al 21/09/2026 no existe: las cuatro rondas son `CHANGES_REQUESTED`. **Mientras no exista, esta fila NO está acreditada**». Y cuenta las DOS correcciones, citando mi §7.1 | **CERRADO, y mejor de lo que pedí** |
| 2 | Sacar la mutación de lo abierto en `:279-281` | `:288-296`: CERRADA con su ventana (20:30-20:50), su informe, su resultado y la refutación del `.every()`; y añade «Esta viñeta dijo *Bloqueante de la ronda 3* durante las horas en que ya no lo era: queda corregida contándolo» | **CERRADO** |
| 3 | Quitar las cinco citas corridas del índice | `grep` de citas `fichero:línea` sobre `progress/tdd_retirada_carteleria_urgencias.md` → **cero coincidencias**. No quitó cinco: quitó **las veintiuna**, y la cabecera (`:14-23`) cuenta que nació incumpliendo la regla de oro del contrato al que sirve y que cinco ya estaban corridas el día que se escribieron | **CERRADO, con más alcance del que pedí, y es la lectura correcta de la regla**: dice «NUNCA números de línea», no «citas correctas» |
| 4 | «las dos anteriores son RECHAZOS» | §3 del índice: «Al 21/09/2026 hay CUATRO rondas y **las cuatro son `CHANGES_REQUESTED`**», con las cuatro rutas. Y la mutación y el navegador ya figuran como HECHOS, con sus informes | **CERRADO** |
| 5 | `current.md` al día | `:112` mutación en **PASS** (487/485/2, `# timeout` = 0, `datosDelSitio.ts` 172/172) y fila nueva con el consolidado **582 · 579 · 3 equivalentes = 100 %**; `:160-172` la verificación en navegador con sus cuatro medidas (0 menciones, 0,00 px, 4,00 px, 56 px); `:173-178` mi rechazo de la ronda 4 dicho sin maquillar («por algo que duele porque es mío»); y las features **46 y 47** en la lista | **CERRADO** |
| 6 | `docs/mutation-testing.md` | Sección nueva de 46 líneas: `vitest.related` en `true` por defecto citando el esquema del paquete instalado **y** el enlace de Vitest; el ejemplo medido (3 ficheros y 80 `it`, no 88 y 1422); **las tres patas** tal como las dejé —sesgo hacia más supervivientes · `Initial test run succeeded` descarta el falso muerto · `NoCoverage` = 0 descarta el mutante sin verdugo—; «la suite de 1422 tests mató estos mutantes» marcada como **falsa**; y qué debe escribir todo `progress/mutation_<name>.md` de ahora en adelante, con `# timeout` antes que el score y el descarte de la corrida entera si la máquina se suspendió | **CERRADO** |

Los tres bloqueantes (1, 2, 3 y 4) y los tres del mismo viaje (5, 6 y el punto 7
del encargo, §4 de aquí) están hechos. **No he encontrado ninguna de las siete
afirmaciones del encargo que sea falsa**, salvo el dígito de §3.

---

## 3. El único defecto que queda: un dígito, y está en el contrato

`features/retirada_carteleria_urgencias.feature:298-300` dice:

    #   · El ritmo del nav y la igualdad de los botones del hero — ABIERTOS, y NO
    #     son de esta feature: … Registrados como features 46 y 45.

**Son la 46 y la 47.** Lo he comprobado en `feature_list.json`: la **45** es
`limpieza_informacion_contacto` (el `gap: espaciado(16)` sobre un contenedor con
un solo hijo, nada que ver con el hero) y la **47** es
`igualdad_declarada_de_los_botones_del_hero`. El puntero manda al lector a una
feature real **que trata de otra cosa**, que es la peor variante de cita
equivocada: no falla, engaña.

Y es la quinta nota de este fichero que nace diciendo algo que no es verdad, en
la edición cuyo objeto era, otra vez, quitar notas que no son verdad. Queda
dicho con todas las letras porque es el patrón de la feature entera.

**`progress/current.md:166` sí lo dice bien** («feature 47»), así que el estado
vivo no está contaminado: el dígito equivocado está solo en el contrato.

---

## 4. La pregunta del punto 7: ¿la 47 infla el backlog?

**No. La decisión es correcta y el argumento del orquestador es el bueno.**

Meter «los botones del hero miden igual por accidente» dentro de una feature que
se **llama** `limpieza_informacion_contacto` habría hecho mentir a su propio
nombre, y un nombre que miente es exactamente el defecto que llevamos cinco
rondas persiguiendo. Agrupar es virtud cuando el grupo tiene un criterio; la 42
y la 43 lo tienen (notas caducadas; guardas de recuento con `> 0`). Aquí no lo
había: el único parentesco era «salió el mismo día».

Y la 47 no es una entrada de relleno. Su `acceptance` muerde:

- «Los dos botones miden lo mismo porque una declaración lo dice, **no porque su
  contenedor los estire**».
- «La puerta mide el alto de los dos y **los compara entre sí**, no contra un
  número escrito a mano».
- «La puerta muerde: **cambiado el `align-items` del contenedor, el test sigue
  en verde** porque la igualdad ya no depende de él; **cambiado el `min-height`
  de uno de los dos, el test falla**».

Esa tercera cláusula es una prueba de mordiente escrita al revés —exige un verde
donde hoy habría uno falso— y es la forma correcta de contratar «declarado en
vez de emergente». La `description` lleva el mecanismo entero y coincide con lo
que yo verifiqué en el SCSS en la ronda 4: `min-height: $altura-control-grande`
(56) en `.acciones a` contra `min-height: $altura-control-media` (48) del mixin
`boton-fantasma`, que gana por la especificidad de `a:not(:first-child)`.

---

## 5. Cobertura, TDD, calidad: sin cambios, y por una razón medida

`find ./src ./tests -newer progress/judge_39_ronda4.md` devuelve **vacío**. Por
tanto todo lo que verifiqué aserción a aserción en las rondas 2, 3 y 4 vale hoy
byte a byte, y no lo reescribo:

- **Cobertura de escenarios.** @s1 —el único `Scenario` de este contrato—
  `[x]` cubierto en `tests/e2e/urgencias.spec.ts`: el recolector sale del
  documento real (`page.evaluate`), el tercer censo se acumula, las seis rutas
  se fijan con `rutasRecorridas === RECUENTO_DE_RUTAS` **y** `=== 6`, y el
  disparador es un `toBe(0)` con mordiente comprobada. Los 27 escenarios
  enmendados de los otros ocho contratos tienen su test en el mapa del índice,
  que hoy cita **fichero y etiqueta**, que es lo que no caduca. Los **tres**
  escenarios sin puerta están retirados del contrato con nota de derogación, y
  su ausencia la muerden @s6 y @s13 de `informacion_contacto`.
- **Disciplina TDD.** Ni una línea de producción sin test que la pida; seis
  bitácoras de oleada con sus rojos, dos de ellos nacidos rojos a propósito
  (@s4 de `fidelidad_cabecera` y las tres cláusulas de @s20).
- **Mutación (C7).** Los **cinco** módulos de la superficie mutable están
  medidos: 582 mutantes, 579 muertos, 3 supervivientes y los **tres** son
  equivalentes con justificación **previa**. **579/579 = 100 % = umbral.**
  Auditado por mí contra `reports/mutation/mutation.json` en la ronda 4, y el
  JSON no se ha tocado desde entonces.

---

## 6. Checkpoints

- **C1 — El arnés está completo:** **[x]** — `init` exit **0**, `grep -c FAIL`
  = **0**, `feature_list.json` válido (47 features).
- **C2 — El estado es coherente:** **[x]** — una sola feature en `in_progress`;
  `current.md` describe la sesión activa y por fin **sin desfase**.
- **C3 — El código respeta la arquitectura:** **[x]**.
- **C4 — La verificación es real:** **[x]** — 1422 unitarias + 174 de navegador
  sobre `dist/` servido + 5/5 de configuración.
- **C5 — La sesión se cerró bien:** **[~]** — sin ficheros sospechosos; falta la
  entrada de `progress/history.md`, que se escribe **al cerrar**, y el paso de
  la 39 a `done`. Son los dos actos del cierre, no deuda.
- **C6 — Contrato Gherkin:** **[x]** — el `.feature` existe, está en git y su
  Gherkin está intacto (§1); la puerta humana está pasada y **es verificable**;
  @s1 tiene test concreto; no hay producción sin test rojo; y
  `progress/tdd_<name>.md` existe, sin una sola cita de línea. Con el dígito de
  §3 pendiente de corrección en el cierre.
- **C7 — Prueba de mutación:** **[x]** — §5.

---

## 7. Por qué apruebo con un defecto vivo, dicho sin rodeos

En la ronda 4 rechacé por esta misma familia de defecto. Hoy apruebo con uno
vivo, y me obligo a explicar la diferencia en vez de esconderla:

1. **El daño no es el mismo.** Lo de la ronda 4 eran tres artefactos que
   acreditaban **el cierre de esta feature** con informes que la rechazaban: un
   lector concluía que la feature había pasado una puerta que no había pasado.
   Lo de hoy es un cruce equivocado hacia un elemento de **backlog ajeno a la
   feature**, en una viñeta cuyo propio texto dice «NO son de esta feature».
   Nadie deduce de ahí que la 39 esté verde.
2. **La corrección ya está forzada por el propio contrato.** La fila 10 dice,
   escrito por el orquestador y verificado por mí: «se acredita con… el `judge`
   que APRUEBE la feature. Al 21/09/2026 no existe… Mientras no exista, esta
   fila NO está acreditada». Es decir: **ese fichero tiene que volver a tocarse
   después de esta aprobación, sí o sí**, para citar este informe por su ruta.
   El dígito se arregla en esa misma pasada.
3. **Cada edición del contrato tiene coste y riesgo.** Es el único artefacto
   firmado por un humano y van cuatro ediciones; en cada una he tenido que
   volver a demostrar que el Gherkin sigue intacto. Pedir una ronda entera para
   cambiar `45` por `47` compra **una edición de más** sobre ese fichero, y la
   evidencia de estas cinco rondas es que cada edición trae su propia errata.
   Dos ediciones en vez de una no es más seguridad: es una oportunidad más de
   romper lo firmado.
4. **Un juez que no puede llegar nunca al verde no es un juez, es un bucle.**
   Las cinco puertas están verdes, los cinco módulos mutables medidos al 100 %
   sobre no equivalentes, los nueve contratos cubiertos y el Gherkin intacto. Lo
   que queda es una errata de una cifra. Si eso bloquea, ya no estoy podando:
   estoy impidiendo que nada salga.

Lo que **no** hago es dejarlo a la buena voluntad: va como condición de cierre
en §8, y si el commit se hace sin ella, el contrato firmado queda en la historia
con un puntero que engaña.

---

## 8. Condiciones de cierre (una sola edición, antes del commit)

No son una ronda nueva ni vuelven al `judge`. Son los actos del cierre:

1. **`features/retirada_carteleria_urgencias.feature:300`** — «features 46 y
   45» → «features **46 y 47**». La 45 es `limpieza_informacion_contacto`.
2. **`features/retirada_carteleria_urgencias.feature:195-197`** (fila 10) —
   sustituir «el `judge` que APRUEBE la feature. Al 21/09/2026 no existe…» por
   la cita de **`progress/judge_39_ronda5.md`** por su ruta, que es este
   informe y es la aprobación que la fila esperaba. Con eso la fila queda
   acreditada por los tres informes y no por ninguna promesa.
3. **`progress/tdd_retirada_carteleria_urgencias.md` §3, segunda viñeta** —
   dice «hay CUATRO rondas y las cuatro son `CHANGES_REQUESTED`». Con esta son
   cinco y la quinta **aprueba**. Mismo criterio de siempre: corregirlo
   contando lo que decía.
4. **`progress/current.md`** — la ronda 5 y su veredicto; después, mover el
   resumen a `progress/history.md` (C5) y dejar `current.md` con su plantilla.
5. **`feature_list.json`** — feature 39 a **`done`**, con sus `notas`
   apuntando a `progress/judge_39_ronda5.md` y `progress/mutation_39_ronda3.md`.

Hecho esto, `bin/harness init` debe volver a correrse una vez —cambia
`feature_list.json`, que es lo que valida— y ese es el último acto.

---

## 9. ¿`done`, commit, push y despliegue?

1. **¿`done`?** **SÍ**, en cuanto se hagan los cinco actos de §8. Las dos
   puertas que el `craftsman_lead` tiene prohibido saltarse están pasadas:
   `judge` **APPROVED** (este informe) y mutación por encima del umbral
   (`mutation.threshold = 1.0` sobre no equivalentes: **579/579 = 100 %**, con
   los tres equivalentes justificados por escrito y **antes** de esta feature).
2. **¿Commit y push?** **SÍ, en un único commit, y después de §8.** He
   comprobado los dos flujos que se disparan con el push, no me fío de memoria:
   - `.github/workflows/harness-ci.yml` → `pnpm install`, `pnpm run build`,
     `node .harness/harness.mjs init` y `pnpm run test:config`. **No corre la
     mutación**, así que el `exit 1` que Stryker devuelve por `break = 100` con
     los equivalentes vivos **no** puede poner rojo el CI.
   - `.github/workflows/deploy-pages.yml` → `build` + `init` y publicación de
     `dist/`. Mismo orden, y el init lo acabo de ver verde en local.
   El árbol no tiene ficheros sospechosos sin trackear: los `??` son todos
   informes de `progress/`, que es donde deben estar.
3. **¿Despliegue para que lo revise Pablo?** **Adelante**, y con los cuatro
   puntos de su encargo medidos en navegador real, no deducidos: urgencias a
   **0** textos y **0** rótulos accesibles en el documento entero de las seis
   rutas y **0** de 8 enlaces en el panel móvil; nav a **0,00 px** del borde
   derecho del contenido; **4,00 px** entre «Galapavet» y su descriptor; y los
   dos botones del hero a **56 px**. Contacto con sus tres bloques y pie 4/4/3.

   **Y dígasele lo que no está arreglado**, porque lo va a ver: el ritmo del nav
   (`Blog` y `FAQ` con el sobrante caído a la derecha — feature **46**, con
   puerta humana y dos arreglos costeados) y que la igualdad de los botones del
   hero **hoy es un efecto lateral del `stretch`**, no una decisión escrita
   (feature **47**). Las dos salieron de mirar la página renderizada, que es lo
   que ninguna de las tres primeras rondas hizo.

---

## 10. Lo que queda dicho de estas cinco rondas

1. **Ni un solo rechazo de las cinco fue por el código.** Los cinco fueron por
   el entorno de la feature: un contrato que no existía, una puerta humana
   saltada, una medición que nadie había corrido y, dos veces, frases que decían
   que algo estaba bien cuando no lo estaba. El `tdd_craftsman` no ha tenido que
   volver a `src/` ni una vez desde la ronda 1.
2. **El bloqueante más caro se cerró midiendo.** Mi sospecha sobre el `.every()`
   sobre lista vacía era razonable y **estaba equivocada**: los cinco mutantes
   de esa línea mueren. Ese es el valor de la mutación frente al razonamiento, y
   vale también cuando el que razona es el juez.
3. **El hallazgo más útil de la tanda no lo pidió nadie:** `vitest.related` en
   `true` por defecto, encontrado por el `mutation_tester` en contra de la
   lectura fácil de su propio informe, y hoy escrito en `docs/mutation-testing.md`
   para los 39 informes del repositorio.
4. **La lección que queda, y que la feature 42 tiene que convertir en puerta:**
   en este repositorio la prosa envejece más rápido que el código, y ninguna de
   las notas caducadas de estas cinco rondas la habría cazado un test. Hasta que
   exista esa puerta, el único filtro es leer cada cita hasta el final.
5. **Y una a favor del orquestador:** en las cinco rondas no ha discutido ni un
   rechazo, ha traído sus propios errores por delante —«el peor era mío»— y en
   dos ocasiones ha cerrado con **más** alcance del que yo pedí (las veintiuna
   citas de línea en vez de cinco, y la fila 10 declarándose a sí misma no
   acreditada). Eso es lo que hace que una quinta ronda sea corta.

**APPROVED.** Hechos los cinco actos de §8, la feature 39 se marca `done`, se
comitea y se despliega.
