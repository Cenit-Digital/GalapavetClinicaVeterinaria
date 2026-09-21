# Review — feature 39 `retirada_carteleria_urgencias` — RONDA 2

> `judge`, 21/09/2026. Segunda ronda sobre la feature que yo mismo rechacé en
> `progress/judge_39.md`. Todo lo que afirmo aquí está MEDIDO o LEÍDO por mí en
> esta máquina: no he heredado un solo número de los informes de las oleadas 5 y
> 6. No he editado ni una línea de código.

**Veredicto: CHANGES_REQUESTED**

Y quiero que la primera frase sea ésta, porque es la verdad del trabajo: **los
cinco bloqueantes están cerrados en lo SUSTANCIAL, y las dos puertas nuevas
muerden de verdad.** Lo he comprobado leyendo las aserciones una a una, no
creyendo los informes. Rechazo por **dos defectos concretos, baratos y ajenos al
código**, uno de ellos una regla dura del proyecto que yo mismo puse como
condición en la ronda 1 y que nadie ha cumplido.

---

## 0. Lo que he ejecutado yo, sin tubería

Comprobé primero el puerto 4173 (estaba libre: `netstat` no devolvía nada
escuchando), así que ningún `dist/` viejo ha podido darme un falso verde ni un
falso rojo.

| Puerta | Comando | Exit | Resultado |
| --- | --- | --- | --- |
| Lint | `pnpm run lint` | **0** | oxlint --deny-warnings |
| Tipos | `pnpm run typecheck` | **0** | `tsc -b` |
| Arnés | `node .harness/harness.mjs init` | **0** | **88 ficheros · 1422 tests · 1422 pasan**, `grep -c FAIL` = **0**, «Entorno listo» |
| Configuración | `pnpm run test:config` | **0** | pass 5, fail 0 |
| Navegador | `pnpm run test:e2e` | **0** | **174 passed** (51,3 s) |

Coinciden con la referencia del orquestador hasta el último dígito. El `[FAIL]`
de la ronda 1 ha desaparecido: la sección 3 del arnés imprime hoy
`[OK] feature_list.json válido (41 features)`.

---

## 1. Los cinco bloqueantes de la ronda 1, uno a uno

### B1 — `harness init` en rojo por falta del contrato · CERRADO EN LO TÉCNICO, ABIERTO EN LA PUERTA HUMANA

`features/retirada_carteleria_urgencias.feature` existe y el arnés pasa. Sobre
las tres cosas que había que comprobar:

- **¿Duplica los otros ocho contratos? NO.** El fichero tiene **un solo**
  `Scenario` y su «REGLA DE ORO» (`:31-35`) prohíbe copiar escenarios ajenos. La
  sección «LO QUE ESTE FICHERO NO CONTRATA» (`:187-207`) enumera cuatro
  tentaciones y remite cada una a la puerta que ya la muerde. Correcto.
- **¿Miente el índice por omisión? NO por omisión.** Las 10 filas de la tabla
  (B) se corresponden una a una con los 10 `acceptance` de `feature_list.json`,
  y el «noveno fichero» (`pagina_blog`) está declarado aunque no aparezca en el
  diff de `features/`. Pero **sí miente por caducidad**: ver la sección 4.1.
- **¿El hueco de @s1 es REAL? SÍ, verificado en el código, no en el párrafo.**
  Lo he comprobado por los dos lados:
  - `features/fidelidad_cabecera.feature:403` prohíbe el nombre accesible con
    "Urgencias" **solo dentro de la cabecera**; su quinta cláusula (`:405`) sale
    de la cabecera pero solo cuenta **enlaces de llamada**.
  - `tests/e2e/urgencias.spec.ts:150-152` (la puerta de @s14) recorre
    `menciones.etiquetas` y solo exige **corrección** (`toBe(ROTULO_REAL)`); el
    recuento de rótulos no lo fijaba nadie. Los otros dos censos sí
    (`:181`, `:182`).

  Conclusión: un `aria-label` con el rótulo de urgencias colgado de un elemento
  que **no** sea un `tel:`, en el cuerpo de la página, atravesaba las dos puertas
  sin aparecer en ningún recuento. El hueco no está inventado para justificar el
  fichero: es exactamente el tercer censo del criterio 8.

**Lo que NO está cerrado:** mi bloqueante 1 decía, literal, «Crear el contrato de
la 39 ... **y pasarlo por la puerta humana**». No hay rastro de que eso haya
ocurrido. Ver la sección 3.1.

### B2 — la feature saltó `in_progress` · CERRADO

`feature_list.json` tiene la feature 39 en `"status": "in_progress"`, y es la
**única**: 38 `done`, 1 `in_progress`, 2 `pending`. Las 40 y 41 siguen
`pending`. Las `notas` registran el rechazo de la ronda 1 con sus cinco
bloqueantes y quién causó cada uno. C2, primera y tercera casilla: bien.

### B3 — `project-spec.md` y `progress/current.md` · CERRADO SALVO UN RESIDUO

- **Sección nueva, `project-spec.md:1211-1293`:** decisiones **72-76** más
  «Alcance y evidencia». Las cinco son decisiones de verdad, con su alternativa
  descartada y su porqué; la 75 explica el píxel de solape y por qué @s4 exige
  igualdad EXACTA («una tolerancia de 1 px habría absorbido justamente el
  defecto que existe para cazar»), que es la lección que pedí que quedara
  escrita. La viñeta del rechazo del judge está puesta sin adornos.
- **Las tres descripciones corregidas CON NOTA:** `:988-990` (nota de defecto
  histórico ya reparado), `:1057-1064` (la 27 reescrita, con la procedencia en
  la grabación) y `:1086-1095` (la 34). **Las dos primeras, impecables. La
  tercera, rota:** ver la sección 3.2.
- **`current.md`:** ya NO arrastra el 03/09 ni el 09/09. `git diff --stat`
  confirma **+458 líneas en `progress/history.md`** con las 18 secciones
  archivadas. `current.md` queda con la sesión viva y solo con ella. C2, tercera
  casilla: bien.

### B4 — @s19 inerte (`accesibilidad.feature:477`) · CERRADO, Y BIEN CERRADO

Ésta era la pregunta central del encargo y la he contestado **leyendo el
código**, que es donde se decide si un rojo es posible por construcción.

`tests/e2e/movimiento.spec.ts:115-126` mide el censo tras
`emulateMedia({ reducedMotion: 'no-preference' })`, marca los elementos en el DOM
con `data-movimiento-declarado`, vuelve a `reduce` y los **reencuentra por su
marca** (`:145`) en vez de recontarlos. Las cuatro aserciones:

| Aserción | Línea | ¿Rojo posible por construcción? |
| --- | --- | --- |
| `conMovimientoDeclarado > 0` (A2) | `:166-169` | **SÍ.** Si ninguna hoja declara `transition`, el filtro de `:120-122` da 0. Es la MISMA aserción que antes daba 392 pasara lo que pasara; movido el censo a `no-preference`, el anulador global sobre `*` ya no la alimenta |
| `conMovimientoDeclarado < totalDeElementos` (A1) | `:170-173` | **SÍ, y es la que caza el defecto.** Medida bajo `reduce` era literalmente falsa: 429 < 429 |
| `delCensoInspeccionados === censo` | `:174-176` | **SÍ.** Y no es vacua: si el censo fuera 0, A2 ya habría fallado antes |
| `delCensoAnuladosSinLlegarACero === censo` (A3) | `:177-180` | **SÍ.** `anuladoSinLlegarACero` exige el intervalo **abierto por abajo** (`ms > 0 && ms <= 0.02`, `:141-144`): con el anulador a `0s` el filtro da 0 y 0 no es 49 |

Los tres rojos que los informes citan (`< 429 / 429`, `> 0 / 0`, `49 / 0`) son
**posibles por construcción**: los he derivado del código sin fiarme del informe.
`.every` sobre lista vacía no es riesgo aquí: `transitionDuration.split(',')`
devuelve siempre al menos un elemento.

**Y no se ha aflojado nada.** Diff contra HEAD, aserción a aserción: la vieja
`transicionesFueraDeEscala === 0` sobre **todo el documento** bajo `reduce`
sobrevive íntegra como `fueraDeEscalaEnTodoElDocumento` (`:158-161`), con el
mismo alcance y el mismo techo. En HEAD había 3 aserciones en ese bloque; hoy hay
6. **Ninguna se ha retirado ni relajado, y no hay ninguna tolerancia nueva:**
`TECHO_MS_REDUCIDO = 0.02` es el mismo valor que ya estaba escrito en línea.

Se retiró además el bloque «DEFECTO CONOCIDO Y SIN ARREGLAR» de `:82-93`, que ya
no describe el código. Correcto: un comentario que miente es peor que no tenerlo.

### B5 — las tres cláusulas de @s20 sin puerta · CERRADO, Y BIEN CERRADO

`src/lib/accesibilidad-movimiento.ts:122-133` y el último `describe` de
`src/lib/accesibilidad-movimiento.test.ts:236-340`.

| Cláusula | Puerta | ¿Muerde? |
| --- | --- | --- |
| `:501` el inventario se lee del sitio real | `test:161-177` — `import.meta.glob` con `query:'?raw'` sobre `../styles/*.scss`, `../components/*.module.scss` y `../pages/*.module.scss`; `test:240-241` | **[x]** |
| `:502` el recuento es exactamente 0, declarado por escrito | `test:255-262` — `toBe(0)` con `hojasInspeccionadas > 0` DELANTE y `pasa === true` | **[x]** |
| `:503` si vuelve a subir, la puerta lo caza | el mismo `toBe(0)`, más `test:272-280` que exige hoja **y línea** del hallazgo | **[x]** |

**Verificación propia de que el corpus no deja agujeros** (esto es lo que decide
si B2 puede ponerse rojo de verdad): `find src -name "*.scss"` devuelve **20
ficheros**, y he filtrado cuáles escapan a los tres globs del test. **Resultado:
ninguno.** El corpus es completo hoy, así que una `animation:` reintroducida en
cualquier hoja del sitio sube el recuento. El rojo B2 (`expected 1 to be +0`
perturbando `Equipo.module.scss`) es posible por construcción.

**Falla cerrada:** `pasa` exige `hojas.length > 0` (`src:128`) y hay un `it`
dedicado (`test:333-339`). Si el glob se rompiera y devolviera 0 entradas,
`expect(HOJAS_REALES.length).toBeGreaterThan(0)` se pone rojo en vez de aprobar
sobre la nada. Es el mismo patrón que ya usa `escalaMovimiento.test.ts:45-51`.

**Decisión de diseño que merece constar:** exigir la propiedad COMPLETA
(`animation:` / `animation-name:`) y nunca un prefijo (`src:66`, `src:93-98`).
Contar por prefijo dejaría la puerta permanentemente roja sobre el
`animation-duration` del propio anulador de `global.scss`, es decir, sobre su
propia red de seguridad. Hay un `it` que fija esa distinción (`test:300-307`).

---

## 2. @s1 del contrato nuevo: cobertura y mordiente

| Cláusula de @s1 | Puerta | ¿Muerde? |
| --- | --- | --- |
| `:267` el recuento total es exactamente 0 | `urgencias.spec.ts:200-203` | **[x]** el rojo `Expected: 1 / Received: 0` es posible por construcción: el número sale del acumulador `:148`, no de una constante |
| `:268` sale del documento real, nunca de una lista del test | `:87-89` — `document.querySelectorAll('[aria-label]')` dentro de `page.evaluate` | **[x]** |
| `:269` recorre exactamente las seis rutas, nunca una lista vacía | `:167-168` — `rutasRecorridas === RECUENTO_DE_RUTAS` **y** `=== 6` | **[x]** doble |
| `:270` el 0 es disparador con mordiente comprobada | inversión a `toBe(1)` documentada en `progress/tdd_39_oleada6_rotulos_accesibles.md` sección 2, con el fallo literal | **[x]** |

Cero producción tocada: el escenario nació verde y la Ley 1 se respetó. El
recorrido y el recolector se reutilizaron en vez de fabricar un spec nuevo, y la
cabecera del fichero (`:24-30`) declara que sirve a DOS contratos. Bien.

---

## 3. LOS DOS BLOQUEANTES DE ESTA RONDA

### 3.1 BLOQUEANTE — el contrato nuevo NUNCA pasó la puerta humana

Mi bloqueante 1 de la ronda 1 decía, palabra por palabra: «Crear el contrato de
la 39 ... **y pasarlo por la puerta humana**». He buscado el rastro y **no
existe**:

- `feature_list.json`, feature 39, campo `notas`: registra «PUERTA HUMANA
  SUPERADA: Pablo aprobó **los 8 contratos** el 20/09/2026». Ocho. Este fichero
  es el noveno y nació el 21/09/2026.
- `grep -rn "retirada_carteleria_urgencias.feature" progress/ feature_list.json`
  devuelve **cinco** coincidencias: tres en mi propio `judge_39.md` y dos en los
  informes de los artesanos. **Ninguna es una aprobación.**
- `progress/current.md` no la menciona. `progress/history.md` tampoco.

No es formalismo. `@s1`
(`features/retirada_carteleria_urgencias.feature:263-270`) es una **cláusula
vinculante nueva**: fija en 0, como disparador, el censo de rótulos accesibles de
las seis rutas. La escribió un `gherkin_author`, la implementó un
`tdd_craftsman` y ahora la bendeciría yo. Los tres somos agentes. `CLAUDE.md` lo
prohíbe con una regla dura —«No saltes la puerta de aprobación humana sobre los
`features/<name>.feature`»— y esa puerta es de Pablo: **ni el encargo que me
lanzó el orquestador ni ningún informe de agente puede sustituirla, y yo no
puedo darla por buena.**

A favor del fichero, y por eso esto se cierra en minutos y no en otra tanda de
TDD: @s1 **no cambia el producto** (nació verde, `src/` intacto) y es una
derivación honesta del criterio 8 del `acceptance` que Pablo **sí** aprobó («el
recuento estático queda de disparador»). Lo que Pablo tiene que ver es un
escenario de ocho líneas y decir sí o no.

### 3.2 BLOQUEANTE — `project-spec.md:1088`: el arreglo de B3 dejó dentro lo que venía a quitar

Texto real hoy, `project-spec.md:1086-1090`:

```
- **34 `fidelidad_contacto`** — ... casilla, botón a todo el ancho) a la
  izquierda; a la derecha tarjeta roja de
  tarjeta con mapa estático (Decisión 63) y bloques DIRECCIÓN / TELÉFONOS /
  HORARIO ...
```

El `git diff` lo enseña sin discusión: la línea `a la derecha tarjeta roja de` es
**contexto sin tocar**, y lo que se sustituyó fue la línea siguiente. Resultado:
la frase queda como «a la derecha **tarjeta roja de** tarjeta con mapa estático»
—agramatical— y, lo que importa, **sigue afirmando que a la derecha del contacto
hay una tarjeta roja**. Es literalmente la frase que mi bloqueante 3 señaló
(`:1082`), y el arreglo la dejó dentro. La `ACTUALIZACIÓN` que viene detrás dice
lo contrario que la frase que la precede: `project-spec.md` es el documento que
el próximo agente lee para saber qué ES el sitio, y hoy se contradice a sí mismo
en el mismo párrafo. Son tres palabras.

---

## 4. Lo que NO bloquea pero hay que registrar

### 4.1 El contrato nuevo se describe a sí mismo con datos ya falsos

`features/retirada_carteleria_urgencias.feature:172-184`, «ESTADO DE LAS PUERTAS
AL 21/09/2026», dice hoy dos cosas falsas:

- `:174` «1410 tests de Vitest». Son **1422**, medidos por mí hace minutos.
- `:181-184` «Tres cláusulas de `accesibilidad.feature` (@s19 y @s20) quedaron
  SIN puerta ... dos de las veinte entradas de la tabla (A) están sin morder».
  La oleada 5 las cerró **el mismo día**, horas después.

Yerra hacia el lado prudente (declara menos cobertura de la que hay), pero es una
nota **nacida caducada** dentro del fichero creado para que las notas dejen de
nacer caducadas, y contra su propia REGLA DE ORO (`:31-35`: «Si una cláusula
cambia, cambia en SU fichero, y este índice se actualiza en el mismo paso»). Como
hay que volver a la puerta humana (3.1), se corrige en el mismo viaje.

### 4.2 Mis cinco avisos de la ronda 1: estado real, comprobado

| Aviso ronda 1 | Estado hoy |
| --- | --- |
| 5 · comentario caducado `urgencias.spec.ts:18` | **CERRADO** por el refactor de la oleada 6 (`:17-22` explica que el literal citado ya no existe) |
| 5 · `Hero.test.tsx:330` | **CERRADO** (`:330-332` ya dice «dejó de existir el 20/09/2026») |
| 5 · `geometria-escalas.spec.ts:277-282` | **ABIERTO y ahora peor**: `:279-280` sigue explicando «NO el CTA de urgencias de la cabecera: a 320px ... ese control solo existe dentro del panel plegado». Ese control **no existe en ninguna parte** desde esta feature |
| 5 · `fidelidad.spec.ts:149`, `accesibilidad.feature:398-399` | **ABIERTOS** |
| 6 · errata `matrizDeContraste.ts` | **ABIERTO**: «cartelíería» sigue en la línea **9** (en la ronda 1 dije `:8`; era `:9`) |
| 7 · `--color-urgencia-suave` huérfano | **ABIERTO** — puerta humana, como dije |
| 8 · `fidelidad-cabecera.spec.ts:408-411` y `accesibilidad.feature:565` | **ABIERTOS** |
| 9 · `gap` sin función en `InformacionContacto.module.scss:5-8` | **ABIERTO** |

**Seis de nueve siguen abiertos, y ninguno se ha tocado en 24 horas.** Ésa es la
razón por la que no los dejo sueltos otra vez: van a tareas registradas para que
el orquestador les dé número, no para que vuelvan a aparecer en mi ronda 3.

### 4.3 Hallazgos nuevos, no bloqueantes

- **`tests/e2e/urgencias.spec.ts:100` — `enlacesTelefonicos` sigue declarado,
  calculado y nunca leído.** Verificado en `git show HEAD`: ya estaba muerto antes
  de esta feature, así que **no lo crea la 39**. Pero es la guarda de universo que
  le falta a @s1: hoy el `toBe(0)` de `:203` se apoya solo en
  `rutasRecorridas === 6`, y una página que renderizara en blanco daría 0 igual.
  El riesgo real es nulo (173 specs más lo cazarían), y el artesano hizo bien en
  no cablearlo sin cláusula que lo pidiera (Ley 3). Es material para una oleada
  de una línea.
- **`src/lib/accesibilidad-movimiento.ts:93-98` — evasión por formato.**
  `declaraUnaAparicionAnimada` exige que la declaración **empiece** la línea, así
  que una regla escrita entera en una sola línea no se contaría. Prettier impide
  que eso ocurra hoy; queda dicho.
- **`src/lib/accesibilidad-movimiento.test.ts:240` — `toBeGreaterThan(0)` donde
  el repositorio tiene precedente de recuento explícito**
  (`inventarioModulos.test.ts` fija 17 ficheros). Con `> 0`, una hoja nueva creada
  en un subdirectorio quedaría fuera del corpus **en silencio**. No lo cuento como
  bloqueante porque es exactamente el patrón que `escalaMovimiento.test.ts:45` ya
  usa y porque hoy el corpus está completo (20/20, comprobado por mí), pero fijar
  el número es una línea.
- **`accesibilidad.feature:497` («animación o transición») solo tiene inventario
  para la animación.** `inventariarBloquesQueAparecenAnimando` no mira
  `transition:`, y quedan 13. No es regresión —antes no lo miraba nadie— y el lado
  de la transición lo toca `movimiento.spec.ts:185-188` para los dos desplegables.
  Media cláusula, heredada.

---

## 5. Saldo de cobertura: la feature RETIRA código y aun así SUMA

Mi bloqueante de la ronda 1 era que una retirada no puede dejar menos cobertura
de la que había. Medido contra `progress/linea_base_20260920.md` (estado ANTES de
tocar nada):

| | Línea base 20/09 | Hoy, medido por mí | Neto |
| --- | --- | --- | --- |
| Ficheros de Vitest | 88 | 88 | 0 |
| Tests de Vitest | **1415** | **1422** | **+7** |
| Tests de navegador | **167** | **174** | **+7** |
| `test:config` | 5/5 | 5/5 | 0 |

**Neto: +14 puertas**, y eso **después** de que la feature borre tests junto con
las funciones que morían con ellos: `Cabecera-logica.test.ts` 14 a 10 `it` (con
`construirControlDeUrgencias`), `PieDePagina-logica.test.ts` 4 a 3 (con
`nombreEnlaceUrgencias`). La oleada 5 sola aporta +12 en
`accesibilidad-movimiento.test.ts` (8 a 20 `it`). **No se ha perdido cobertura en
neto, y las pérdidas declaradas (`fidelidad_contacto` @s3, `informacion_contacto`
@s5 y @s12) siguen siendo las mismas que ya autoricé.**

---

## 6. Disciplina TDD de las oleadas 5 y 6

**¿Producción que ningún test exige? NO.** La única producción nueva es
`src/lib/accesibilidad-movimiento.ts:45-133`, y la pidió en rojo B1
(`inventariarBloquesQueAparecenAnimando is not a function`); la derivación de
`visibleSinAnimacion` la pidió B3. He repasado que cada constante tenga quien la
mate: `.trim()` con el `it` de CRLF (`test:325-331`), `replaceAll(ESPACIO)` con el
`it` del espacio antes de los dos puntos (`test:317-323`), `replaceAll(FIN)` con
`HOJA_CON_ENTRADA_OCULTA` (sin quitar el punto y coma, `opacity:0;` no casaría el
`Set`), `indice + PRIMERA_LINEA` con las aserciones de `:2` y `:3`, y
`hojas.length > 0` con el `it` de 0 hojas. La oleada 6 no tocó `src/`: correcto,
el escenario nació verde.

**¿Evidencia de Rojo-Verde-Refactor? SÍ**, con una honestidad que quiero dejar
escrita: la oleada 5 **declara** que 8 de sus `it` nacieron verdes y los presenta
como «armadura de mutación», no como rojos. Eso es exactamente lo contrario de
maquillar un ciclo. Y los rojos que no se podían obtener de otra forma se
fabricaron perturbando el sitio real (13 `transition` renombradas, el anulador a
`0s`, una `animation:` inyectada en `Equipo.module.scss`), con **restauración
verificada**: las hojas de estilo tocadas siguen siendo solo las dos que ya
traían las oleadas 1-3. Lo he comprobado yo: hoy hay 43 ficheros modificados y
**ninguna hoja de estilos ajena** está entre ellos.

También quiero que conste el incidente del `vite preview` zombi que la oleada 5
documenta (su sección 4.1): es una trampa reutilizable y la dejó escrita en vez de
callarla. Por eso yo comprobé el 4173 antes de medir.

---

## 7. Calidad (lente de artesano)

- `movimiento.spec.ts:26-33` — `instalarLectorDeDuraciones` en un `addInitScript`
  para que **las dos pasadas midan lo mismo por construcción**. El razonamiento
  está escrito (`:22-25`) y es el correcto: si las dos mediciones se desviaran
  entre sí, comparar el censo consigo mismo no probaría nada. Extraer el lector no
  es cosmética: es lo que hace válida la comparación.
- `movimiento.spec.ts:123` — marcar en el DOM y **reencontrar por la marca** en
  vez de recontar bajo la otra preferencia. Es la diferencia entre comparar dos
  poblaciones y comparar la misma población consigo misma.
- `accesibilidad-movimiento.ts:58-65` y `:68-76` — los dos comentarios que
  explican un **porqué no obvio**: por qué no se cuenta por prefijo (el anulador)
  y por qué el estado base se busca en la hoja entera y no en la regla (haría
  falta un parser de SCSS y la cascada real; el sesgo se elige hacia el rojo y se
  dice). Funciones cortas, un motivo para cambiar cada una, nombres que revelan.
- `accesibilidad-movimiento.test.ts:45-55` — los dos `it` sintéticos que yo señalé
  no se borran: se **degradan por escrito** a lo que de verdad son (tests de la
  aritmética del veredicto) y se deja la puerta real aparte. Conservar y
  reclasificar es mejor que borrar: la aritmética también hay que morderla.
- Arquitectura **respetada**: la lógica nueva es un módulo puro en `src/lib/`, el
  spec de Playwright no importa de `src/` salvo donde el contrato lo exige
  (`urgencias.spec.ts:39-40`, ya justificado). Ningún `TODO`, ningún log de
  depuración, ninguna dependencia nueva, ningún fichero fuera de alcance.
- Errata viva: `src/lib/diseno/matrizDeContraste.ts:9` — «cartelíería».

---

## 8. Checkpoints

- **C1 — El arnés está completo:** **[x]** — ficheros base, docs y
  `node .harness/harness.mjs init` **exit 0**, sin un solo `[FAIL]`.
- **C2 — El estado es coherente:** **[x]** — una sola feature en `in_progress`
  (la 39); `current.md` describe la sesión viva y solo ella; las 458 líneas del
  03/09 y el 09/09 archivadas en `history.md`.
- **C3 — El código respeta la arquitectura:** **[x]**.
- **C4 — La verificación es real:** **[x]** — 1422 unitarias y 174 de navegador,
  todas verdes, midiendo `dist/` servido y no maquetas.
- **C5 — La sesión se cerró bien:** **[x]** — sin ficheros sospechosos sin
  trackear (los 20 son informes de `progress/` y el contrato nuevo); la última
  sesión cerrada está en `history.md`; la 39 refleja su estado correcto. La
  entrada de ESTA sesión se escribe al cerrarla, después de la mutación.
- **C6 — Contrato Gherkin:** **[ ]** — el fichero existe, la sección de
  `project-spec.md` existe, cada `@s` tiene test y no hay producción sin test
  rojo que la pida. **Falla por 3.1: el contrato no ha pasado la puerta humana**,
  y 3.2 deja `project-spec.md` describiendo lo que la feature retiró.
- **C7 — Prueba de mutación:** pendiente del `mutation_tester`. Le dejo **un
  aviso nuevo**: `src/lib/accesibilidad-movimiento.ts` estrena unas 80 líneas de
  lógica pura bajo `break = 100`. La oleada 5 dice haber matado 26 mutantes a
  mano; **yo no he corrido Stryker** y ese veredicto no es mío. Miraría primero
  los literales de cadena y el `BooleanLiteral` sobre
  `!declaraUnEstadoBaseOculto`. Siguen en pie los dos avisos de la ronda 1
  (`esMovil` equivalente, `datosDelSitio.ts`).

---

## 9. Cambios requeridos

### Bloqueantes

1. **Pasar `features/retirada_carteleria_urgencias.feature` por la puerta
   humana.** Pablo tiene que ver @s1 (`:263-270`) y decir sí o no. Es un
   escenario de ocho líneas que no cambia el producto. Registrar la aprobación
   donde se registró la de los otros ocho: `feature_list.json` (feature 39,
   `notas`) y `progress/current.md`. **No lo puede dar por bueno ningún agente,
   ni yo.**
2. **Arreglar `project-spec.md:1088`.** Quitar el residuo «a la derecha tarjeta
   roja de», que sobrevivió al arreglo del bloqueante 3 y sigue afirmando que el
   contacto tiene una tarjeta roja a la derecha, en contradicción con la
   `ACTUALIZACIÓN` que viene tres líneas después.

### En el mismo viaje, porque hay que volver a tocar ese fichero

3. Actualizar `features/retirada_carteleria_urgencias.feature:172-184`: 1410 a
   **1422**, y retirar la afirmación de que @s19 y @s20 están sin morder (4.1).

### A registrar como tarea, NO a dejar sueltos otra vez (4.2 y 4.3)

4. Comentarios caducados y citas corridas: `geometria-escalas.spec.ts:277-282`
   (describe un control que ya no existe), `fidelidad.spec.ts:149`,
   `accesibilidad.feature:398-399`.
5. Errata `matrizDeContraste.ts:9` («cartelíería»).
6. `--color-urgencia-suave` huérfano: **puerta humana**, es el hilo siguiente.
7. Endurecer `fidelidad-cabecera.spec.ts:408-411` y `accesibilidad.feature:565`.
8. `gap` sin función en `InformacionContacto.module.scss:5-8`.
9. Guarda de universo para @s1: cablear `enlacesTelefonicos`
   (`urgencias.spec.ts:100`), hoy muerto desde antes de esta feature.
10. Fijar el recuento del corpus en `accesibilidad-movimiento.test.ts:240`
    (hoy `> 0`; el repositorio tiene precedente de recuento explícito).

---

## 10. Lo que quiero dejar dicho a favor de esta ronda

Rechazo por dos cosas que se arreglan en una tarde, y ninguna está en el código.
Cuatro que merecen constar:

1. **Las dos puertas nuevas muerden de verdad.** Lo he comprobado leyendo las
   aserciones, no creyendo los informes: los cinco rojos que los artesanos citan
   son posibles por construcción. En una sesión con siete puertas vacuas
   descubiertas, éstas no lo son.
2. **Se reparó una puerta que llevaba declarada como inerte en su propio
   fichero** —«DEFECTO CONOCIDO Y SIN ARREGLAR»— y el comentario se retiró porque
   dejó de ser cierto, no porque estorbara.
3. **Nada se aflojó al cerrar los bloqueantes.** Diff contra HEAD: 0 aserciones
   retiradas, 0 relajadas, 0 tolerancias nuevas, +3 aserciones en
   `movimiento.spec.ts`, +12 `it` en `accesibilidad-movimiento.test.ts`. Y una
   retirada de código que aun así deja **+14 puertas** sobre la línea base.
4. **La oleada 5 declaró que 8 de sus `it` nacieron verdes** en vez de
   presentarlos como rojos, y la 6 declaró que su escenario nacía verde y no
   escribió producción para justificarse. Es la clase de honestidad que hace que
   valga la pena leer un informe.

Cerrados los dos bloqueantes de la sección 3, esto se aprueba sin más discusión.
