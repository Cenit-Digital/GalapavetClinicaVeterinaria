# Review — feature 39 `retirada_carteleria_urgencias` — RONDA 3

> `judge`, 21/09/2026. Tercera ronda sobre la feature que yo mismo rechacé en
> `progress/judge_39.md` y `progress/judge_39_ronda2.md`. Todo número que aparece
> aquí está MEDIDO o LEÍDO por mí en esta máquina en esta sesión: no he heredado
> ni un dígito de los informes de los artesanos ni del encargo. No he editado ni
> una línea de código.

**Veredicto: CHANGES_REQUESTED**

Y quiero que la primera frase sea la verdad del trabajo: **los dos bloqueantes de
la ronda 2 están cerrados, de verdad y bien cerrados.** La puerta humana se pasó,
el residuo de `project-spec.md` desapareció, y la auto-descripción del `.feature`
está corregida con más alcance del que yo señalé. Las cinco puertas que corrí
salen verdes y clavadas a la referencia.

**Rechazo por UNA cosa que nadie me ha contado y que el encargo me pidió
comprobar dando por buena la premisa equivocada: la feature toca CINCO módulos de
la superficie mutable declarada, no tres. Dos de ellos —481 mutantes entre los
dos en la última medición conocida— no se han mutado ni en la ronda 1 ni en la
ronda 2.** Es un aviso que levanté en la ronda 1, repetí en la ronda 2, y que la
ronda 2 cerró en falso ampliando la corrida a otro fichero distinto.

---

## 0. Lo que he ejecutado yo, sin tubería

Puerto 4173 comprobado **libre** antes de medir (`netstat` no devolvía nada
escuchando), así que ningún `vite preview` zombi ha podido darme un verde
prestado.

| Puerta | Comando | Exit | Resultado medido |
| --- | --- | --- | --- |
| Arnés | `node .harness/harness.mjs init` | **0** | **88 ficheros · 1422 tests · 1422 pasan** (227,18 s); `grep -c FAIL` = **0**; `[OK] feature_list.json válido (41 features)`; «Entorno listo» |
| Lint | `pnpm run lint` | **0** | `oxlint --deny-warnings` |
| Tipos | `pnpm run typecheck` | **0** | `tsc -b` |
| Navegador | `pnpm run test:e2e` | **0** | **174 passed** en **27 specs** (1,3 min) |
| Configuración | `pnpm run test:config` | **0** | pass **5**, fail **0** |

**Coinciden con la referencia de la ronda 2 hasta el último dígito**: init 0 con
88/1422, E2E 174/174 en 27 specs, config 5/5. Nada se ha movido y nada se ha
roto.

Dato que sostiene todo lo demás: **desde que se midió la mutación de la ronda 2
solo han cambiado TRES ficheros en todo el repositorio**, y ninguno es código.
Medido con `find . -newer progress/mutation_39_ronda2.md`:

    ./feature_list.json
    ./features/retirada_carteleria_urgencias.feature
    ./project-spec.md

Ni un fichero de `src/`, ni un test. Por tanto **toda la verificación de
cobertura y de disciplina TDD de mi ronda 2 sigue vigente sin reexaminarla**: lo
que verifiqué aserción a aserción entonces es byte a byte lo mismo hoy.

---

## 1. BLOQUEANTE 1 de la ronda 2 — la puerta humana · CERRADO

Comprobado en los dos sitios, no en un párrafo:

- **`feature_list.json`, feature 39, `notas`:** registra literalmente «SEGUNDA
  PUERTA HUMANA… Pablo lo aprobó expresamente el 21/09/2026, tras ver el
  escenario y el hueco que tapa», y reproduce el razonamiento correcto (@s5
  prohíbe el rótulo accesible solo DENTRO de la cabecera; @s14 solo exige
  corrección de los que aparezcan). Registra además que no cambia el producto:
  «nació en verde, `src/` intacto, medido 0 sobre 84 `aria-label` reales».
- **`features/retirada_carteleria_urgencias.feature:113-132`:** bloque «PUERTA
  HUMANA — QUIÉN APROBÓ ESTE FICHERO Y CUÁNDO», con las dos fechas separadas (el
  20/09 los ocho contratos, el 21/09 este noveno) y la razón de por qué no
  entraba en la primera.

**La puerta es de Pablo y Pablo la pasó. Doy por cerrado mi bloqueante 1.**

### 1.1 @s1: qué he podido verificar y qué NO, dicho sin maquillar

El encargo me pide comprobar que @s1 y sus cuatro cláusulas son **byte a byte**
los aprobados. **No puedo comprobarlo, y el motivo es un hallazgo en sí mismo:**

> **`features/retirada_carteleria_urgencias.feature` es el ÚNICO de los nueve
> contratos que NO está bajo control de versiones.** `git status --porcelain
> features/` lo devuelve como `??` (sin trackear); los otros ocho salen como
> ` M`. No hay ninguna línea base contra la que diferenciar.

Es decir: **el único contrato del repositorio congelado por una puerta humana es
también el único del que nadie puede demostrar que no se ha tocado.** El propio
fichero declara la congelación en `:129-132` («Desde esa aprobación @s1 y sus
cláusulas quedan CONGELADOS»), y esa congelación es hoy **inaplicable**: se
sostiene solo en la palabra del agente que editó el fichero a las 07:23, después
de que la aprobación quedara registrada a las 07:06 (`mtime` de los dos
ficheros, medidos por mí).

Lo que **sí** he podido verificar, y es tranquilizador:

| Comprobación | Resultado |
| --- | --- |
| Forma del escenario | 8 líneas (`:330-337`): tag, Scenario, Given, When, Then y 3 And. **La misma forma** que el `:263-270` que revisé en la ronda 2 («un escenario de ocho líneas») |
| Cláusulas vinculantes | **4**, ninguna añadida, ninguna retirada, ninguna reordenada |
| Correspondencia una a una con mi tabla de la ronda 2 §2 | `:334` recuento total exactamente 0 · `:335` sale del documento real, nunca de una lista del test · `:336` recorre exactamente las seis rutas, nunca una lista vacía · `:337` el 0 es disparador con mordiente comprobada. **Las cuatro, en el mismo orden** |
| Correspondencia con la tabla del artesano **anterior** a la aprobación (`progress/tdd_39_oleada6_rotulos_accesibles.md` §4, escrita a las 03:54) | **Las cuatro coinciden**, una a una |
| Puerta que las muerde, releída hoy | `tests/e2e/urgencias.spec.ts:200-203`, `:87-89`, `:167-168`. Intacta (el fichero no se ha tocado desde la ronda 2) |

**Conclusión honesta:** tengo dos testigos independientes y anteriores a la
aprobación (mi propia tabla de la ronda 2 y el informe de la oleada 6) que
describen las mismas cuatro cláusulas en el mismo orden, y el escenario de hoy
las reproduce. **No tengo motivo para creer que se hayan tocado.** Pero eso es
una inferencia, no una verificación, y no lo voy a presentar como otra cosa. Se
arregla con un `git add`.

---

## 2. BLOQUEANTE 2 de la ronda 2 — `project-spec.md:1088` · CERRADO

Texto real hoy, `project-spec.md:1086-1090`:

    - **34 `fidelidad_contacto`** — cintillo + titular + párrafo; tarjeta
      «Escríbenos» (nombre/teléfono en dos columnas, email, motivo, mensaje,
      casilla, botón a todo el ancho) a la izquierda; a la derecha, tarjeta con
      mapa estático (Decisión 63) y bloques DIRECCIÓN / TELÉFONOS /
      HORARIO ...

El residuo «a la derecha tarjeta roja de» **ha desaparecido**. La frase es
gramatical y ya **no contradice** la ACTUALIZACIÓN que viene tres líneas más
abajo. Cerrado.

### 2.1 Barrido propio del fichero entero: no queda ninguna otra afirmación VIVA

No me he quedado en la línea que yo mismo señalé. He recorrido las **14**
menciones de «urgencia» de `project-spec.md` y las he clasificado una a una:

| Línea(s) | Qué dice | Veredicto |
| --- | --- | --- |
| `:37`, `:407` | El PROTOTIPO heredado anunciaba urgencias 24 h; se toma solo su arquitectura visual | **Legítima** — habla del prototipo, no de Galapavet |
| `:83`, `:107`, `:108`, `:140` | Decisiones **2, 26, 27 y 58** de la tabla histórica | **Legítimas** — es la tabla de decisiones, con su fecha |
| `:987-990` | Defecto histórico de los selectores de id, **con NOTA**: «describe un DEFECTO histórico ya reparado, no el estado actual» | **Legítima** |
| `:1012` | «Ni un literal del prototipo (… 24 h …)» — prohibición, no descripción | **Legítima** |
| `:1057-1064` | Contorno de la feature 27, reescrito **con ACTUALIZACIÓN** | **Legítima** |
| `:1086-1095` | Contorno de la feature 34, **ya corregido** más su ACTUALIZACIÓN | **Legítima** |
| `:1092-1093` | La frase antigua **citada dentro** de la nota de ACTUALIZACIÓN | **Legítima** — es una cita entrecomillada |
| `:1211-1264` | Sección de la feature 39 (decisiones 72-76) | **Correcta** |

**Cero afirmaciones vivas del estado retirado.** Y he barrido también fuera del
fichero: `docs/` solo lo menciona en `docs/contrato-heredado/` (el contrato del
prototipo, histórico por definición), en `docs/diseno-claude-design/` (el HTML
del prototipo) y en `docs/datos-galapavet.md:47,101`, que dice exactamente lo
contrario («**no presta un servicio de urgencias 24 h**»; «Urgencias 24 h» marcado
**FALSO**). Ningún residuo. Y en el código: **0** `aria-label` con «urgencia» en
`src/`, y **0** referencias a `BarraUrgencias` en `src/`, `tests/` y `features/`.

---

## 3. La auto-descripción caducada · CERRADA, y con más alcance del que yo señalé

Lo he verificado midiendo, no leyendo. **Las correcciones que el `gherkin_author`
dice haber hecho son ciertas, y las cifras son correctas:**

| Corrección | Texto hoy | ¿Cierto? Medido por mí |
| --- | --- | --- |
| **D3** ya no está en presente | `:46-47` «…exactamente un paso de la escala de espaciado, **donde el 20/09/2026 había 0,00 px**» | **[x]** framing histórico correcto |
| **G1** ya no está en presente | `:68-69` «…**el 20/09/2026 había 1,00 px de solape real**» | **[x]** |
| **Criterio 8 de la tabla (B)** | `:186-188` ahora incluye «**@s1 de ESTE fichero** (rótulos accesibles: el tercer censo)» | **[x]** el criterio 8 ya no se atribuye entero a contratos ajenos |
| **F1 recontado y fechado** | `:59-61` «25 a 23 filas, 125 a 115 parejas. Recontado el 21/09/2026» | **[x] VERIFICADO**: `matrizDeContraste.test.ts:518` `toHaveLength(23)`, `:535` `toBe(23)`, `:581` y `:603` `toBe(115)` |
| **F2 recontado y fechado** | `:62-65` «CERO `animation:` y cero `@keyframes`… Quedan 13 `transition:`… Recontado el 21/09/2026» | **[x] VERIFICADO por mí sobre `src/`**: `animation:` = **0**, `@keyframes` = **0**, `transition:` = **13** (Cabecera 1, Equipo 1, Faq 2, Galeria 1, ReservaChat 1, Servicios 2, `_api.scss` 4, `global.scss` 1) |
| «1410 tests» | `:199-201` dice hoy **1422** y 88 ficheros | **[x]** coincide con mi medición |
| «@s19 y @s20 sin morder» | `:207-226` retirado y sustituido por el estado real, **y `:228-234` declara que la nota nació caducada** en vez de fingir que nunca lo dijo | **[x]** exactamente el criterio que este fichero predica |
| **Preámbulo de @s1** | `:318-328` añade «LO QUE SE MIDIÓ DESPUÉS DE ESCRIBIR TODO LO ANTERIOR» con el resultado real | **[x]** |

Verificado además que el **ÍNDICE (A)** no miente: los `@s1` a `@s7` de
`fidelidad_cabecera.feature` existen (`:154, :177, :249, :364, :398, :416,
:467`), `informacion_contacto.feature` tiene sus `@s5` y `@s12` **eliminados con
nota** (`:239`, `:351`) y `fidelidad_contacto.feature` su `@s3` eliminado con
nota (`:56`). Y la tabla **(B)** tiene 10 filas para los 10 `acceptance` de
`feature_list.json`, una a una.

### 3.1 Pero el mismo bloque estrena DOS notas caducadas nuevas

Esto no me lo ha contado nadie. El `.feature` se editó a las **07:23**; el
bloqueante 2 (`project-spec.md`) se había arreglado a las **04:41**. Dos horas y
media antes. Y sin embargo,
`features/retirada_carteleria_urgencias.feature:236-239` dice hoy:

    # Lo que sigue ABIERTO no está en este fichero: `progress/judge_39_ronda2.md`
    # §3.2 pide una corrección en `project-spec.md` (una frase que todavía describe
    # la tarjeta roja retirada) y su §9 deja siete tareas registradas.

- «Lo que sigue ABIERTO… una frase que **TODAVÍA** describe la tarjeta roja
  retirada» es **falso desde las 04:41**. El fichero creado para que las notas
  dejen de nacer caducadas ha vuelto a publicar una nota caducada, en la misma
  edición cuyo objeto era descaducarlo, y contra su propia REGLA DE ORO
  (`:31-35`). Es la **tercera** vez en esta feature. Yerra hacia el lado prudente
  —declara abierto algo cerrado—, pero manda al siguiente agente a «arreglar» una
  línea que ya está bien, que es como se rompen las líneas que están bien.
- «su §9 deja siete tareas **registradas**»: el recuento (7) es correcto, la
  palabra no. Esas siete tareas **no están registradas en ningún sitio**: viven
  solo en mi informe. Hoy `feature_list.json` tiene 41 features y ninguna es
  ninguna de ellas. Ver §9.

### 3.2 Y la fila 10 de la tabla (B) acredita la feature con informes superados

`:190-191`, en el mismo bloque re-fechado, remite el criterio 10 a
`progress/judge_39.md` y `progress/mutation_39.md`. Los dos son artefactos de la
**ronda 1**. `progress/judge_39.md` es un **RECHAZO**: acreditar el criterio de
cierre de la feature con el informe que la rechazó dice justo lo contrario de lo
que pretende. Y `progress/mutation_39.md` midió **45 mutantes de dos módulos** y
no cubre las 99 líneas nuevas de `accesibilidad-movimiento.ts`; la evidencia
válida es `progress/mutation_39_ronda2.md`. Un auditor que siga este puntero
llega a la evidencia **más débil** de las dos creyendo que llega a la buena.

---

## 4. LO QUE NADIE ME HA CONTADO: EL BLOQUEANTE DE ESTA RONDA

### 4.1 La feature toca CINCO módulos de la superficie mutable. Se han mutado TRES.

El encargo me pide «comprueba… que **los tres módulos de lógica que toca la
feature** están cubiertos». He comprobado la premisa antes que la conclusión, y
**la premisa es falsa**.

`stryker.config.json` declara la superficie mutable del proyecto:

    "mutate": [
      "src/lib/**/*.ts",
      "src/**/*-logica.ts",
      "!src/**/*.test.ts",
      "!src/**/*.test.tsx"
    ]

Los ficheros `.ts` de `src/` que la feature 39 modifica (`git status`, excluidos
los `.tsx` y los tests) son **cinco**, y **los cinco caen dentro de esos globs**:

| Módulo | Dentro de la superficie mutable | Mutado en la ronda 1 | Mutado en la ronda 2 |
| --- | --- | --- | --- |
| `src/components/Cabecera-logica.ts` | sí (`*-logica.ts`) | **sí** (31 mutantes) | **sí** (31) |
| `src/components/PieDePagina-logica.ts` | sí (`*-logica.ts`) | **sí** (14 mutantes) | **sí** (14) |
| `src/lib/accesibilidad-movimiento.ts` | sí (`src/lib`) | no | **sí** (50) |
| **`src/lib/diseno/datosDelSitio.ts`** | **sí (`src/lib`)** | **NO** | **NO** |
| **`src/lib/diseno/matrizDeContraste.ts`** | **sí (`src/lib`)** | **NO** | **NO** |

`progress/mutation_39.md:120-121` acotó a `Cabecera-logica.ts` y
`PieDePagina-logica.ts`. `progress/mutation_39_ronda2.md:168` acotó a esos dos
más `accesibilidad-movimiento.ts`. **En ninguna de las dos rondas entraron
`datosDelSitio.ts` ni `matrizDeContraste.ts`.**

Y `progress/mutation_39_ronda2.md:166-167` afirma, literal: «La corrida se
**acotó deliberadamente a los tres módulos que la feature 39 toca**». **Eso es
falso.** La feature toca cinco. La frase no describe un acotado deliberado:
describe un censo incompleto, y al decir «los tres módulos que la feature toca»
**impide que el lector se pregunte por los otros dos**. Es la frase que me habría
hecho no mirar, si hubiera creído el informe en vez de medir.

### 4.2 No es formalismo: son 481 mutantes y una decisión booleana cambiada

Estos dos módulos **ya se han mutado antes en este repositorio**, así que no hay
duda de que pertenecen a la superficie medida.
`progress/mutation_rediseno_visual.md:119,121`:

| Módulo | Mutantes en la última medición conocida | Equivalentes catalogados |
| --- | --- | --- |
| `datosDelSitio.ts` | **174** | 0 |
| `matrizDeContraste.ts` | **307** | **2** |

**481 mutantes** que esta feature ha modificado y que nadie ha vuelto a medir,
frente a los 95 que sí se midieron. Y no son cambios cosméticos.

**`src/lib/diseno/datosDelSitio.ts` cambia una decisión booleana pura**
(`ejecutarPuertaDeCompromisoDeUrgencias`, `git diff`):

    -    pasa:
    -      compromisosEncontrados.length === UN_UNICO_COMPROMISO &&
    -      compromisosEncontrados[PRIMER_COMPROMISO] === cualificadorDeclarado,
    +    pasa: compromisosEncontrados.every((c) => c === cualificadorDeclarado),

Una conjunción de dos comparaciones se sustituye por un `.every()`. Stryker
genera aquí, como mínimo, `MethodExpression` (`every` a `some`), `ArrowFunction`,
`EqualityOperator`, `ConditionalExpression` y `BooleanLiteral`. **Y hay una
trampa específica: `.every()` sobre lista vacía devuelve `true`**, y esta misma
feature ha dejado `compromisosEncontrados` vacío en las seis rutas reales. Es
exactamente la familia de mutante que sobrevive escondido detrás de una lista
vacía: el defecto que esta feature ha cazado ya tres veces en otros sitios.

**`src/lib/diseno/matrizDeContraste.ts`** pierde dos entradas del array literal
`MATRIZ_DE_USO_DEL_SISTEMA` (307 mutantes en su última medición, **con 2
equivalentes catalogados** que el informe de la ronda 2 ni menciona, porque nunca
miró ese fichero).

### 4.3 Lo peor: lo avisé dos veces y se cerró en falso

- **Ronda 1, §7 C7(b), literal:** «`datosDelSitio.ts` cambia una decisión pura
  bajo umbral 100 y borra dos constantes: el razonamiento de por qué los cinco
  casos matan las cuatro mutaciones está escrito, pero **no está corrido**.»
- **Ronda 2, §8 C7, literal:** «Siguen en pie los dos avisos de la ronda 1
  (`esMovil` equivalente, **`datosDelSitio.ts`**).»
- **Ronda 2:** la corrida se **amplió**, correctamente, a
  `accesibilidad-movimiento.ts`, que era mi OTRO aviso… y `datosDelSitio.ts` se
  quedó fuera **en silencio**, tapado por una frase que afirma que el alcance
  está completo.

Hay tests que ejercitan la función cambiada (`datosDelSitio.test.ts:486-545`,
cinco casos) y el razonamiento escrito del artesano dice que la matan. **Puede
que tenga razón.** Pero bajo `break = 100` este repositorio no acepta «razonado»
como «medido», y la propia ronda 2 lo demostró: el artesano razonó 26 mutantes y
Stryker generó **50**. Razonar el doblaje de mutantes es exactamente lo que no
funciona.

**Esto no lo puedo dar por bueno, igual que no pude dar por buena la puerta
humana.** No pido rehacer nada: pido **medir** los dos ficheros que faltan.

---

## 5. Lo demás del encargo, comprobado

### 5.1 El informe de mutación de la ronda 2: existe, y su método es correcto

- **Existe**: `progress/mutation_39_ronda2.md`, 207 líneas.
- **El `# timeout` se lee ANTES que el score**: **SÍ**, y de forma ejemplar. Es
  la **sección 1** del informe, titulada «Primero la columna que manda:
  `# timeout`», antes de la tabla y antes del veredicto, citando la regla de
  `feature_list.json` (`rules.notas`). Y no se conforma con la tabla de texto:
  verifica el reparto sobre el JSON (94 Killed, 1 Survived, cero Timeout, cero
  NoCoverage, cero RuntimeError, cero Ignored). Eso es hacerlo bien.
- **98,95 % bruto, 100 % sobre no equivalentes, 1 superviviente**: coherente
  (94/95 y 94/94).
- **El superviviente de `esMovil`**: **no lo re-litigo**, como se me pide. Está
  decidido en `progress/decision_mutante_esmovil_20260920.md`, con precedente en
  `progress/mutation_cabecera_y_navegacion.md` (mismo fichero, misma línea, mismo
  mutador), y la feature 39 no lo introduce.
- **Los tres módulos declarados están cubiertos**: sí. **El problema es que son
  cinco (§4).**

### 5.2 Estado del repositorio

- `feature_list.json`: **38 `done`, 1 `in_progress` (la 39, única), 2 `pending`**
  (40 `animaciones_galeria`, 41 `panel_movil_hacia_el_prototipo`). Correcto.
- Sin residuos de la retirada en código: `BarraUrgencias`, 0 apariciones.
- `--color-urgencia-suave`: sigue **huérfano y declarado** en las 6 variantes de
  `_tokens.scss` (`:66, :90, :114, :138, :162, :200`) y congelado por
  `contratoRedisenho.ts:18` y `fidelidadPrototipo.ts:62`, sin que **ningún**
  `.module.scss` lo pinte. Sigue siendo **puerta humana**, como dije dos veces.

---

## 6. Mis avisos no bloqueantes: cuáles siguen ABIERTOS

Comprobados uno a uno hoy, en el código, no en un informe. **Nueve siguen
abiertos; ninguno se ha tocado en 24 horas.** Por eso §9 los convierte en tareas
con número.

| # | Aviso | Estado hoy, verificado | Dónde |
| --- | --- | --- | --- |
| 1 | Errata «cartelíería» | **ABIERTO** | `src/lib/diseno/matrizDeContraste.ts:9` |
| 2 | Comentario que describe un control inexistente | **ABIERTO y engañoso**: «NO el CTA de urgencias de la cabecera: a 320px… ese control solo existe dentro del panel plegado». Ese control **no existe en ninguna parte** | `tests/e2e/geometria-escalas.spec.ts:279-280` |
| 3 | `--color-urgencia-suave` huérfano | **ABIERTO** — puerta humana | `_tokens.scss`, 6 variantes |
| 4 | `toBeGreaterThan(0)` donde la cláusula dice «sin cambiar ni un dígito» | **ABIERTO** | `tests/e2e/fidelidad-cabecera.spec.ts:408-411` |
| 5 | «el recuento de módulos… es mayor que 0» afirmado como existencia en uno solo | **ABIERTO** | `features/accesibilidad.feature:565` |
| 6 | `gap: espaciado(16)` sobre un contenedor con un solo hijo | **ABIERTO** | `src/components/InformacionContacto.module.scss:7-10` |
| 7 | Corpus fijado con `> 0` donde el repo tiene precedente de recuento explícito | **ABIERTO** | `src/lib/accesibilidad-movimiento.test.ts:240` |
| 8 | `enlacesTelefonicos` declarado, tipado, calculado y **nunca leído** (la guarda de universo que le falta a @s1) | **ABIERTO** | `tests/e2e/urgencias.spec.ts:63, :91, :100` |
| 9 | Citas de línea corridas | **ABIERTO**, y encontré una más: `features/accesibilidad.feature:348-349` sigue diciendo en presente «Las ÚNICAS dos declaraciones `animation:` de todo `src/` **son**…» y cita `Cabecera.module.scss:188`, que ya no existe | varios |

**Cerrados** (verificados en la ronda 2 y confirmados hoy): el comentario de
`urgencias.spec.ts:18` y el de `Hero.test.tsx:330`.

### 6.1 Hallazgo nuevo de proceso: falta el `progress/tdd_<name>.md`

He comprobado las **39** features `sdd` en `done` o `in_progress`:

> **La feature 39 es la ÚNICA de las 39 que no tiene `progress/tdd_<name>.md`.**
> No existe `progress/tdd_retirada_carteleria_urgencias.md`; el TDD vive
> repartido en seis `progress/tdd_39_oleadaN_*.md`.

`CHECKPOINTS.md` C6, tercera viñeta, nombra ese fichero exacto (el mapa de cada
`@s` a su test «en `progress/tdd_<name>.md`»), y el protocolo del propio `judge`
manda abrirlo. La sustancia existe y la he verificado; lo que falta es la puerta
de entrada. Un índice que enlace las seis oleadas con el mapa consolidado lo
cierra.

---

## 7. Checkpoints

- **C1 — El arnés está completo:** **[x]** — ficheros base y docs presentes;
  `node .harness/harness.mjs init` **exit 0**, `grep -c FAIL` = **0**.
- **C2 — El estado es coherente:** **[~]** — una sola feature en `in_progress` y
  sin basura de sesiones anteriores, **pero `progress/current.md` se quedó en la
  ronda 2**: dice «Ronda 2, en curso (21/09/2026)» y **no menciona el noveno
  contrato, ni la segunda puerta humana, ni el rechazo de la ronda 2**. Mi
  bloqueante 1 de la ronda 2 pedía registrar la aprobación en **dos** sitios
  —`feature_list.json` **y `progress/current.md`**—; está en uno.
- **C3 — El código respeta la arquitectura:** **[x]** — sin cambios desde la
  ronda 2; lógica en módulos puros, los `.tsx` solo cablean, sin `TODO` ni logs.
- **C4 — La verificación es real:** **[x]** — 1422 unitarias y 174 de navegador
  en 27 specs, todas verdes, midiendo `dist/` servido.
- **C5 — La sesión se cerró bien:** **[~]** — sin ficheros sospechosos, pero ver
  C2; la entrada de `history.md` se escribe al cerrar, después de la mutación.
- **C6 — Contrato Gherkin:** **[~]** — el fichero existe, **la puerta humana está
  pasada**, la sección de `project-spec.md` existe y está limpia, cada `@s` tiene
  test concreto y no hay producción sin test rojo que la pida. Falla en dos
  viñetas menores: el `progress/tdd_<name>.md` que C6 nombra (§6.1) y las dos
  notas caducadas nuevas del propio contrato (§3.1, §3.2).
- **C7 — Prueba de mutación:** **[ ] — BLOQUEANTE.** La medición **no cubre dos
  de los cinco módulos que la feature toca dentro de la superficie mutable
  declarada** (§4), uno de ellos con una decisión booleana cambiada bajo
  `break = 100`, y el informe afirma que el alcance está completo cuando no lo
  está.

---

## 8. Cambios requeridos

### Bloqueante

1. **Mutar `src/lib/diseno/datosDelSitio.ts` y
   `src/lib/diseno/matrizDeContraste.ts`.** Son parte de la superficie que
   `stryker.config.json` declara, la feature 39 los modifica, y **no se han
   medido en ninguna de las dos rondas**. Corrida acotada, `concurrency: 1`,
   `# timeout` leído antes que el score, y **los dos equivalentes ya catalogados
   de `matrizDeContraste.ts` (`progress/mutation_rediseno_visual.md` §4.6)
   reconocidos como tales, no redescubiertos**. Miraría primero el `.every()` de
   `ejecutarPuertaDeCompromisoDeUrgencias` y su comportamiento sobre lista vacía.
   **No vale el razonamiento escrito: hay que correrlo.**
2. **Corregir `progress/mutation_39_ronda2.md:166-167`**, que afirma «los tres
   módulos que la feature 39 toca». Son cinco. Esa frase es la que impide ver el
   hueco, y tiene que decir la verdad aunque el resto del informe se dé por
   bueno.

### En el mismo viaje, porque hay que volver a tocar esos ficheros

3. **`progress/current.md`**: registrar la **segunda puerta humana** (Pablo, el
   noveno contrato, 21/09/2026), el rechazo de la ronda 2 con sus dos
   bloqueantes, y el estado real (ronda 3). Es el fichero
   anti-teléfono-descompuesto y hoy va dos rondas por detrás.
4. **`features/retirada_carteleria_urgencias.feature:236-239`**: retirar la
   afirmación de que la corrección de `project-spec.md` «sigue ABIERTA» (se cerró
   a las 04:41, dos horas y media antes de escribirla), y cambiar «siete tareas
   registradas» por «siete tareas **pendientes de registrar**» mientras no lo
   estén. Aplíquese el criterio del propio fichero: contar que la nota estuvo
   caducada, no fingir que no lo dijo.
5. **`features/retirada_carteleria_urgencias.feature:190-191`** (fila 10 de la
   tabla B): sustituir `progress/judge_39.md` (un RECHAZO) y
   `progress/mutation_39.md` (45 mutantes, 2 módulos) por los informes vigentes.
6. **`git add features/retirada_carteleria_urgencias.feature`.** Es el único de
   los nueve contratos sin trackear, y el único congelado por una puerta humana
   (§1.1). Mientras siga `??`, la congelación que declara en `:129-132` no la
   puede verificar nadie, ni yo.
7. **Crear `progress/tdd_retirada_carteleria_urgencias.md`** como índice de las
   seis oleadas con el mapa consolidado de cada `@s` a su test (§6.1). Es la
   única feature de 39 sin él, y C6 lo nombra.

---

## 9. Tareas a REGISTRAR en `feature_list.json`, no a dejar sueltas otra vez

Los nueve avisos de §6 llevan **dos rondas** sin tocarse. No los vuelvo a dejar
en un informe. Propuesta de agrupación en features nuevas, para que el
orquestador les dé número (todas fuera del alcance de la 39):

| Propuesta | Contenido | Por qué juntas |
| --- | --- | --- |
| **42 `deuda_de_notas_caducadas`** | Avisos **1, 2, 9**: errata «cartelíería» (`matrizDeContraste.ts:9`), el comentario de `geometria-escalas.spec.ts:279-280` que describe un control inexistente, `accesibilidad.feature:348-349` en presente citando `Cabecera.module.scss:188`, y las citas corridas de `fidelidad.spec.ts` | Todas son comentarios que **mienten sobre el estado actual**. Es el defecto recurrente de esta feature: merece una pasada con puerta, no parches sueltos |
| **43 `endurecer_guardas_de_recuento`** | Avisos **4, 5, 7, 8**: `fidelidad-cabecera.spec.ts:408-411` (censo real, no `> 0`), `accesibilidad.feature:565` (recuento de módulos, hoy existencia en uno), `accesibilidad-movimiento.test.ts:240` (fijar el corpus), `urgencias.spec.ts:100` (cablear `enlacesTelefonicos` como guarda de universo de @s1) | Los cuatro son la **misma** debilidad: `> 0` donde el repositorio tiene precedente de recuento explícito. `accesibilidad.feature:565` toca contrato, así que lleva **puerta humana** |
| **44 `token_urgencia_suave_huerfano`** | Aviso **3**: decidir sobre `--color-urgencia-suave`, declarado en 6 variantes y pintado por 0 módulos | **PUERTA HUMANA.** Lo dije en las rondas 1 y 2: por la misma lógica de Pablo —que lo declarado sea lo que se pinta— es el hilo siguiente. No es decisión de artesano |
| **45 `limpieza_informacion_contacto`** | Aviso **6**: el `gap: espaciado(16)` sobre un contenedor con un solo hijo | Necesita una puerta que lo justifique antes de tocarlo (Ley 1) |

Y dos de higiene que no merecen feature, pero sí quedar escritas:

- `.stryker-tmp/` acumula **29 sandboxes** de agosto y septiembre pese a
  `cleanTempDir: true` (lo declara `mutation_39_ronda2.md:203-206`). Barrer.
- La **puerta global de mutación del proyecto** (50 ficheros, 3229 mutantes,
  `break = 100`) **sigue sin medirse nunca**, y el CI seguirá terminando en
  código 1 mientras el equivalente de `esMovil` siga vivo. Es una decisión
  abierta del orquestador, y lleva abierta desde la feature 3.

---

## 10. Lo que quiero dejar dicho a favor de esta ronda

Rechazo por **una** cosa, y es una que se cierra con una corrida de Stryker.
Cinco que merecen constar:

1. **La puerta humana se pasó de verdad.** No un agente bendiciendo a otro:
   Pablo, con el escenario delante, registrado en dos sitios. Era el bloqueante
   más serio que he puesto en esta feature y está cerrado sin atajos.
2. **El residuo de tres palabras desapareció, y barrí el fichero entero detrás.**
   Las 14 menciones de «urgencia» de `project-spec.md` están clasificadas: cero
   afirmaciones vivas del estado retirado. El arreglo no se quedó en la línea que
   yo señalé.
3. **El `gherkin_author` encontró más de lo que yo señalé y lo midió.** D3, G1,
   el criterio 8, F1 y F2 recontados **con fecha**. He verificado los recuentos
   por mi cuenta —23 filas, 115 parejas, 0 `animation:`, 0 `@keyframes`, 13
   `transition:`— y **los cinco son correctos**. Y cuando corrigió la nota
   caducada, **contó que lo estuvo** en vez de borrarla. Ése es el criterio
   correcto.
4. **El informe de mutación pone el `# timeout` primero**, con su propia sección
   y citando la regla, y lo verifica sobre el JSON en vez de sobre la tabla de
   texto. El método es impecable: lo que falla es el censo de ficheros, no el
   rigor.
5. **Nada se ha movido desde la ronda 2.** Tres ficheros cambiados, ninguno de
   código, y las cinco puertas clavadas al dígito. Nadie ha aprovechado la ronda
   para colar nada.

Y una que me digo a mí mismo: **el encargo me dio la premisa equivocada de buena
fe** («los tres módulos de lógica que toca la feature»), y si la hubiera creído
en vez de abrir `stryker.config.json` y `git status`, habría firmado el verde.
Las tres rondas han encontrado lo mismo: lo que nadie mira es lo que está mal.

**Medida la mutación de los dos módulos que faltan, esto se aprueba.**
