# Feature 39 — Oleada 3 de 4: EL ENLACE DEL PIE (E2)

> `tdd_craftsman`, 20/09/2026. Contratos: `features/pie_de_pagina.feature` @s2
> (con sus tres cláusulas nuevas de las leyes de UI/UX), @s5, @s6 enmendado,
> @s7 y @s15 reapuntado; mediciones en
> `progress/pie_4-4-3_leyes_uiux_20260920.md`; puertas numeradas en
> `progress/contacto_pie_contrato_20260920.md` §4.A.5-9 y §4.B.14.
>
> Estado que dejo: **lint, typecheck y Vitest en VERDE** (88 ficheros · 1410
> tests). Playwright **172 pasan · 2 fallan** de 174; los dos rojos son los dos
> que el contrato asigna a otra oleada (§6), y de paso **cierro el rojo que la
> oleada 1 dejó a propósito para mí**.
>
> **El SCSS del pie no se ha tocado**: `git status --porcelain
> src/components/PieDePagina.module.scss` devuelve vacío. Está byte a byte como
> en HEAD.

---

## 1. Los ciclos Rojo → Verde → Refactor, en orden

### Ciclo 1 — @s15: reapuntar el punto de inyección ANTES de quitar el viejo

El contrato avisa de que @s15 pierde su sujeto: la prop `telefonoUrgencias` era
el único dato que el pie aceptaba por parámetro. Se reapunta **antes** de
retirarla, para que el modo de error no quede ni un ciclo sin puerta.

**De los dos caminos que el contrato deja elegir, elijo la prop
`telefonoClinica`** y no bajar el escenario a la lógica pura. Razón concreta:
la última cláusula de @s15 dice «no se renderiza ningún elemento con rol "link"
cuyo destino empiece por "tel:+34"», que es una afirmación sobre el DOM.
`construirEnlacesContacto` no renderiza nada, así que por el camino (b) esa
tercera cláusula se habría perdido en silencio.

**ROJO — 1 test fallando**, verificado antes de tocar producción:

```
AssertionError: expected [Function] to throw an error
  at src/components/PieDePagina.test.tsx:329
```

El Given pasa de `telefonoUrgencias: '91 851 13'` (ocho dígitos) a
`telefonoClinica: '91 082 92'` (siete), que es literalmente lo que pide el
contrato reapuntado.

**VERDE** — en `PieDePagina.tsx`: prop opcional `telefonoClinica`, con el valor
de la fuente única por defecto, cableada al primer argumento de
`construirEnlacesContacto`. Nada más.

### Ciclo 2 — la retirada del enlace de urgencias

**ROJO — 4 tests fallando**, con los mensajes literales:

| Puerta | Fallo real |
| --- | --- |
| @s2 | `listitems de la columna "Contacto": expected [...] to have a length of 3 but got 4` |
| @s5 | `expected [ …(4) ] to have a length of 3 but got 4` |
| @s6 | `expected 'tel:+34918511393' not to be 'tel:+34918511393'` |
| @s7 | `expected [ …(4) ] to have a length of 3 but got 4` |

Qué hice en cada una:

- **@s2** — el recuento pasa a declararse **columna a columna** en una tabla
  `LISTITEMS_POR_COLUMNA` (4 / 4 / 3) en vez de exigir el mismo número a las
  tres, y se añade la suma explícita `LISTITEMS_DEL_PIE = 11`. El mensaje de
  cada aserción nombra la columna, para que un fallo futuro diga **cuál**.
- **@s5** — fuera la entrada de urgencias del mapa nombre→destino; el array de
  nombres de llamada baja de 3 a 2. **El bucle de consistencia
  dígitos-del-nombre contra dígitos-del-destino se conserva íntegro**: es lo
  que impide retipear un teléfono a mano. Añadido «son exactamente esos 3» con
  la lista completa en orden, que el contrato exige para que la columna no
  admita relleno.
- **@s6** — **ENMENDADO, no borrado**. Sus dos primeras cláusulas vigilaban
  CÓMO se rotulaba el enlace; ahora vigilan que NO esté (ningún `href` a
  `tel:+34918511393`, ningún nombre accesible con «Urgencias», el número no
  aparece en el texto del pie). **La tercera se conserva intacta** —ningún
  `heading` ni `banner` del pie menciona urgencias—: es una afirmación de
  ausencia que E2 no deroga y que es lo que impide reintroducir la cartelería
  por la puerta de un encabezado. Añadidas **dos anti-vacuidades** que el
  original no necesitaba y este sí: `enlaces.length > 0` y
  `encabezados.length > 0`, porque un bucle `for` sobre una lista vacía aprueba
  sin comprobar nada.
- **@s7** — 4 → 3 enlaces, y la lista literal se factoriza en
  `NOMBRES_DE_CONTACTO`, compartida con @s5 (los dos escenarios afirman la
  misma lista; el contrato de @s7 dice literalmente «los 3 son los del
  escenario @s5»).

**VERDE**, en un solo paso atómico:

- `PieDePagina-logica.ts` — fuera `nombreEnlaceUrgencias`, **fuera la constante
  `SEPARADOR_ROTULO`** (el `' · '`), los dos campos `telefonoUrgencias` y
  `rotuloUrgencias` de `DatosContactoPie`, su desestructuración, la llamada
  `construirEnlaceTelefono(telefonoUrgencias)` y la tercera entrada del array.
  Docblock de «4 enlaces» → **3**.
- `PieDePagina-logica.test.ts` — borrado el describe de refuerzo de cobertura
  (el bloque ~37-47) **en el mismo paso que la función**, y con él el import de
  `construirEnlacesContacto`. Los tres describes de enlaces legales y copyright
  (~4-14, ~16-26, ~28-35) **no se tocan**: cubren otras cosas.
- `PieDePagina.tsx` — fuera la prop `telefonoUrgencias`, su valor por defecto y
  los dos argumentos `telefonoUrgencias` / `rotuloUrgencias`.

**Nota de honestidad sobre el ciclo.** Las cuatro puertas se pusieron en rojo
antes del único paso de verde, no una a una. Afirman el **mismo**
comportamiento desde cuatro ángulos y la retirada que las satisface es atómica:
quitar la entrada del array habría dejado las otras tres en rojo entre ciclos,
y no hay ningún orden que produzca cuatro rojos independientes. Mismo criterio
—y misma nota— que las oleadas 1 y 2.

**Por qué `SEPARADOR_ROTULO` se va con la función.** Es la trampa que el
encargo señalaba y está comprobada: `stryker.config.json` corre con
`break = 100` y muta todo literal de cadena a `""`. Una constante viva sin una
sola referencia produce un mutante que **ningún test puede matar**, porque
ningún camino de ejecución la observa. Se borra en el mismo paso, no después.

### Ciclo 3 — el recuento del pie en navegador real

**ROJO demostrado, no supuesto.** El cambio de producción ya estaba hecho, así
que el rojo se leyó directamente contra el `dist/` reconstruido:

```
tests\e2e\fidelidad-responsive-integral.spec.ts:40
Error: expect(locator).toHaveCount(expected) failed
  Locator:  getByRole('contentinfo').getByRole('link')
  Expected: 15
  Received: 14
```

**VERDE** — `toHaveCount(15)` → `toHaveCount(14)`, con el comentario que
desglosa el número (4 + 4 + 3 de columna + 3 legales) y cita la fecha y el
contrato. Es **una sola aserción**, pero vive dentro del bucle de los cuatro
anchos (700 / 701 / 1023 / 1024), así que cubre los cuatro, como pedía el
encargo. **Es el único cambio que he hecho en ese fichero.**

### Ciclo 4 — las tres cláusulas nuevas de @s2 (leyes de UI/UX)

Tres tests nuevos en `tests/e2e/fidelidad-pie.spec.ts`, uno por ley, cada uno
recorriendo los **seis** anchos que el contrato nombra (320 / 700 / 701 / 1023
/ 1024 / 1440: los dos lados de cada punto de corte del pie y sus extremos).
Todos comparten un único ayudante de medición, `medirColumnasDelPie`.

**Todo es comparativo, ningún número de maquetación escrito a mano:**

| Ley | Qué compara |
| --- | --- |
| Proximidad + Conectividad Uniforme | el ancho de cada columna contra el de **la primera columna**, no contra «215 px»; el `scrollWidth` de cada columna contra **su propio** `clientWidth`; y cada separación vertical contra **la primera separación medida**, juntando las de las tres columnas en una sola lista |
| Semejanza | `new Set(...).size === 1` sobre el par `fontSize\|color` de los 11 enlaces; y el **último** elemento de cada lista contra el **primero de esa misma lista** |
| Fitts | el `min-height` de los 11 contra el del primero; y el **mínimo de la columna corta** contra el **máximo de sus dos hermanas** de 4 |

Anti-vacuidad en los tres: el ancho de referencia `> 0`, la separación de
referencia `> 0`, el alto de referencia `> 0`, `separaciones.length > 0` por
columna, y los recuentos 11 / 3 / 4 / 2 columnas hermanas. Sin ellas, una
columna que desapareciera dejaría los tres tests en verde sobre listas vacías.

**LOS TRES PASARON A LA PRIMERA, Y ESO NO DEMUESTRA NADA POR SÍ SOLO.** El
contrato es explícito: «el SCSS del pie ya cumple, y está medido; estas
cláusulas son una red para que siga cumpliendo, no un encargo de cambio». Así
que el rojo se fabricó a propósito, **perturbando el SCSS y reconstruyendo**,
en dos pasadas para que ninguna cláusula quedase tapada por otra:

*Pasada A* — se inyectan a la vez `max-width: 60%` sobre la última columna,
`gap` distinto en su lista y `font-size` / `min-height` propios de su último
enlace. Resultado: **los tres tests en rojo**, cada uno por su ley:

```
x  Ley de Proximidad   → "Contacto" mide lo mismo que sus hermanas a 320px
                         Expected: <= 0.015625   Received: 108.8125
x  Ley de la Semejanza → pares tamaño-color distintos a 320px
                         Expected: 1             Received: 2
x  Ley de Fitts        → alto mínimo compartido a 320px
                         Expected: 24            Received: 16
```

*Pasada B* — se inyecta **solo** el `gap` distinto, porque en la pasada A la
cláusula de separación vertical quedó detrás del fallo de ancho y no llegó a
evaluarse. Resultado: **1 rojo, el suyo**, y los otros dos en verde:

```
x  Ley de Proximidad   → separación idéntica en las tres columnas a 320px
                         Expected: <= 0.015625   Received: 16
```

Después de cada pasada se retiró el bloque inyectado y se verificó contra HEAD:
`git status --porcelain src/components/PieDePagina.module.scss` **devuelve
vacío**. El SCSS queda byte a byte como estaba.

**La tolerancia de subpíxel, medida y no inventada.** La primera versión del
test de Proximidad comparaba los anchos con igualdad estricta y **falló a
1440 px**: `Expected: 215.203125 · Received: 215.1875`. La diferencia es
exactamente **1/64 px**, que es la unidad `LayoutUnit` con la que Blink resuelve
las pistas de rejilla — no una diferencia de diseño. Se introduce
`TOLERANCIA_SUBPIXEL_PX = 1 / 64` con esa justificación escrita al lado y los
números reales que la motivan. A 320, 700, 701, 1023 y 1024 px la igualdad es
**exacta**, y la perturbación de la pasada A la rompe por 108 px: la tolerancia
no afloja la puerta, la hace cierta.

### REFACTOR (en verde)

Con la barra verde, reescritos los comentarios que habían dejado de describir
el código: el docblock de `construirEnlacesContacto` («los 4 enlaces» → los 3, y
por qué ya no se separa ningún rótulo) y el de `resolverDestinos` en el `.tsx`
(«la columna "Contacto" mezcla "tel:" ya resueltos con un ancla» → «los dos
"tel:"»). Extraída `NOMBRES_DE_CONTACTO`, que @s5 y @s7 repetían.

---

## 2. Mapa `@s` → test

| Escenario | Test que lo cubre |
| --- | --- |
| `pie_de_pagina` @s2 (recuentos) | `PieDePagina.test.tsx:37` — 3 headings en orden, listas de 4 / 4 / 3 `listitem` y 1 `link` por `listitem`, con el total en 11 |
| @s2, cláusula de Proximidad + Conectividad Uniforme | `fidelidad-pie.spec.ts:192` — seis anchos: mismo ancho entre columnas, sin desbordar, misma separación vertical |
| @s2, cláusula de Semejanza | `fidelidad-pie.spec.ts:228` — seis anchos: un único par tamaño-color entre los 11; último = primero por lista |
| @s2, cláusula de Fitts | `fidelidad-pie.spec.ts:248` — seis anchos: mismo alto mínimo; la columna corta no baja del de sus hermanas |
| @s5 | `PieDePagina.test.tsx:107` — los dos teléfonos y «Cómo llegar», exactamente 3, con el bucle de dígitos nombre↔destino sobre los dos de llamada |
| @s6 (enmendado) | `PieDePagina.test.tsx:139` — ausencia del `href`, del nombre con «Urgencias», del número en el texto; y ningún `heading` ni `banner` que lo mencione |
| @s7 | `PieDePagina.test.tsx:170` — sin `mailto:` ni «@», y la columna en 3 con los nombres de @s5 |
| @s15 (reapuntado) | `PieDePagina.test.tsx:327` — `telefonoClinica: '91 082 92'` lanza con el valor recibido y no queda ningún `a[href^="tel:+34"]` |
| `fidelidad_responsive_integral` @s3 | `fidelidad-responsive-integral.spec.ts:40` — 14 enlaces en el pie, en los cuatro anchos del bucle |

---

## 3. Lo que NO se ha perdido

1. **El bucle de consistencia dígitos-nombre / dígitos-destino de @s5** sigue
   recorriendo todos los enlaces de llamada que quedan (los dos de la clínica).
   Es lo que impide que alguien retipee un teléfono en el rótulo sin tocar el
   `tel:`.
2. **La tercera cláusula de @s6**, íntegra. Es la puerta contra reintroducir
   cartelería de urgencias por la puerta de un encabezado, y no dependía del
   enlace.
3. **@s15 entero, con sus tres cláusulas**, incluida la del DOM que el camino
   de la lógica pura habría perdido.
4. **Los tres describes de `PieDePagina-logica.test.ts`** que cubren enlaces
   legales y copyright, y sus imports.
5. **`construirEnlacesContacto` sigue mordida por mutación** aunque ya no tenga
   test en su propio fichero `-logica`: Stryker corre toda la suite de Vitest y
   `PieDePagina.test.tsx` la ejercita por los dos caminos, el válido (@s5/@s7) y
   el que lanza (@s15). Confirmado en §5.

---

## 4. Lo que SÍ se pierde, sin maquillar

1. **El caso «rótulo no declarado»** que cubría el describe de refuerzo
   (`rotuloUrgencias: undefined` → el nombre es solo el teléfono). Desaparece
   con la función, que es lo correcto: ya no hay ningún rótulo compuesto en el
   pie. Queda dicho para que nadie lo busque.
2. **El pie deja de ser un punto de inyección de datos de urgencias.** Era el
   único sitio del componente que aceptaba un teléfono por parámetro distinto
   del de la clínica.

---

## 5. Los números

| Puerta | Línea base (20/09) | Tras la oleada 2 | **Ahora** |
| --- | --- | --- | --- |
| `pnpm run lint` | exit 0 | exit 0 | **exit 0** |
| `pnpm run typecheck` | exit 0 | exit 0 | **exit 0** |
| `pnpm run test` (Vitest) | 88 ficheros · 1415 tests | 88 · 1411 | **88 ficheros · 1410 tests · 1410 pasan** |
| Playwright (**no corre en CI**) | 167 / 167 | 170 pasan · 1 falla (171) | **172 pasan · 2 fallan (174)** |

**Aritmética del −1 en Vitest** (1411 → 1410): el describe de refuerzo de
`PieDePagina-logica.test.ts`, borrado con su función. Mis dos ficheros de
Vitest pasan de 19 a 18 tests; ningún otro fichero cambia de recuento.

**Aritmética del +3 en Playwright** (171 → 174): las tres cláusulas nuevas de
@s2, una por ley, en `fidelidad-pie.spec.ts` (de 3 a 6 tests).

### Mutación

`pnpm exec stryker run --mutate "src/components/PieDePagina-logica.ts"`
→ **14 mutantes · 14 muertos · 0 supervivientes · 100.00 %**, exit 0
(«Final mutation score of 100.00 is greater than or equal to break threshold
100»), en 3 min 4 s, 24,43 tests por mutante de media.

El denominador **sí se mueve** con E2, como anticipaba el contrato (§4.C.16):
el módulo pierde `nombreEnlaceUrgencias`, la constante `SEPARADOR_ROTULO`, una
llamada a `construirEnlaceTelefono` y una entrada de objeto del array. Los 14
que quedan mueren todos, lo que confirma dos cosas concretas:

- **La trampa de `SEPARADOR_ROTULO` estaba bien diagnosticada y está cerrada.**
  Si se hubiera dejado la constante huérfana, su mutación a `""` habría
  sobrevivido y el `break = 100` habría dado rojo.
- **`construirEnlacesContacto` sigue mordida sin test en su fichero `-logica`**
  (§3.5): quien la mata es `PieDePagina.test.tsx`, porque Stryker corre toda la
  suite de Vitest. Era lo que el contrato preveía en §4.C.17.

---

## 6. Lo que dejo en ROJO, y por qué no puedo cerrarlo

Los dos son los que el contrato asigna explícitamente a otra oleada
(`progress/contacto_pie_contrato_20260920.md` §4.B.12 y §4.B.13) y los dos
estaban **anunciados y medidos** por la oleada 2 en su §6: «el único
superviviente que los mantiene verdes es el enlace del pie; en cuanto E2 lo
retire, los dos se ponen rojos».

1. **`tests/e2e/urgencias.spec.ts:113`** → @s14 →
   `Landing: ninguna mención de urgencias — Expected: > 0, Received: 0`.
   Es la anti-vacuidad global de presencia por ruta. El contrato la reescribe
   como puerta de CORRECCIÓN y deja la decisión de fondo (§3.1: el camino
   «(iii) aceptar que el dato deja de publicarse estáticamente y decirlo con un
   número») a la puerta humana.
2. **`tests/e2e/datos-reales.spec.ts:268`** → @s52 →
   `expect(informe.compromisosEncontrados).toEqual([cualificadorDeclarado])`,
   recibido 1 elemento contra 3 esperados. **Aviso importante que el contrato
   subraya**: `informe.pasa` viene de lógica pura que Stryker muta con umbral
   100, así que relajar esa condición obliga a tocar la función **y sus tests
   unitarios**, no solo el spec.

**Ninguno de los dos ficheros está en mi lista**, así que no los he tocado.

**En cambio, sí he cerrado un rojo ajeno**: `tests/e2e/fidelidad-cabecera.spec.ts:279`
→ @s5 → «fuera de la cabecera y sin interactuar, el armazón común tampoco
ofrece la llamada a urgencias (E2)». Lo escribió la oleada 1 a propósito para
esta oleada, la oleada 2 lo bajó de 2 enlaces a 1, y E2 retira el último.
**Ahora pasa.**

---

## 7. Lo que NO he tocado y alguien tiene que mirar

1. **`tests/e2e/urgencias.spec.ts:18`** — su comentario cita textualmente
   «`src/components/PieDePagina.test.tsx:124` (usa el prefijo `tel:`)» como el
   sitio donde vive la comprobación del enlace de urgencias del pie. Ese enlace
   ya no existe y esa línea es ahora otra cosa. **El comentario nace caducado**
   y hay que reescribirlo en la misma oleada que enmiende el spec. Fuera de mi
   lista: lo digo en vez de hacerlo.
2. **`src/components/PieDePagina.module.scss`** — no se toca, y está
   comprobado que no hacía falta: los tres tests nuevos miden el SCSS **tal
   cual** en los seis anchos y pasan. Además he verificado a mano lo que el
   análisis afirmaba: el único `:last-child` del fichero es `> p:last-child`
   (`:84`), dentro del bloque de marca, y no hay ningún `:nth-child`.
3. **`src/lib/site.ts` y `datosNegocio.telefonoUrgencias`** — intactos (E3). El
   dato sigue declarado con su rótulo; lo que se retira es el consumo del pie.
   `src/lib/diseno/datosDelSitio.test.ts:467`, `site.test.tsx` y
   `site.reimportacion.test.ts` siguen en verde sin tocarlos.
4. **`progress/current.md`** — no lo he tocado: está fuera de mi lista y lo
   comparten las cuatro oleadas. Mismo criterio que la oleada 2.
5. **`feature_list.json`** — no lo he tocado. La 39 sigue en `spec_ready`; no me
   corresponde moverla, ni hay nada que dar por `done` hasta que aterricen las
   cuatro oleadas y pasen `judge` y `mutation_tester`.
6. **Puerta humana pendiente que roza esta oleada**: `project-spec.md` sigue
   describiendo un pie con cuatro enlaces por columna
   (`progress/contacto_pie_contrato_20260920.md` §6.11). Fuera de mi lista.

---

## 8. Lo que le dejo a la oleada 4

1. **`tests/e2e/urgencias.spec.ts`** — las dos exigencias de presencia por ruta,
   más el comentario de `:18` que cita una línea de `PieDePagina.test.tsx` que
   ya no describe nada. **Conservar íntegros**, como dice el contrato: el primer
   test (anti-vacuidad sobre la fuente única, no sobre el sitio), el recorrido
   de las seis rutas y los bucles de corrección.
2. **`tests/e2e/datos-reales.spec.ts` @s52** — con el aviso de que `informe.pasa`
   es lógica pura bajo umbral 100 de mutación.
3. **El estado de partida para esa oleada, medido hoy**: Vitest 88 · 1410 en
   verde; Playwright 174 con exactamente esos 2 rojos y ninguno más.
4. **Ya no queda ningún enlace ni texto de urgencias en el armazón común**: la
   última puerta que lo comprobaba desde fuera de la cabecera
   (`fidelidad-cabecera.spec.ts:279`) está en verde. Las filas huérfanas de
   `src/lib/diseno/matrizDeContraste.ts:363` y `:388` siguen esperando a F1.
