# Review — feature 39 `retirada_carteleria_urgencias`

> `judge`, 21/09/2026. Cuatro oleadas de TDD (cabecera, contacto, pie,
> transversales) contra los 8 contratos que Pablo aprobó el 20/09/2026.
> Todo lo que digo aquí está MEDIDO por mí en esta máquina, no heredado de los
> informes de las oleadas. No he editado ni una línea de código.

**Veredicto: CHANGES_REQUESTED**

El trabajo de las cuatro oleadas es, en lo sustancial, bueno: la retirada es
limpia, las puertas nuevas muerden, la verificación en navegador es real y las
desviaciones están declaradas en vez de disimuladas. **No apruebo por dos
motivos duros, y ninguno de los dos está en `src/` ni en los tests:**

1. `bin/harness init` termina en **rojo** (exit 1).
2. Tres cláusulas `Then` de contratos APROBADOS (`accesibilidad.feature` @s19 y
   @s20) se quedaron **sin ninguna puerta que las muerda**, y una de ellas está
   escrita en el propio código como «defecto conocido y sin arreglar».

Los dos son trabajo de `craftsman_lead` (ficheros de `features/`,
`project-spec.md`, `feature_list.json`) o de una quinta oleada acotada. Ninguno
exige rehacer nada de lo ya entregado.

---

## 0. Lo que he ejecutado yo (no es cita de los informes)

| Puerta | Resultado medido aquí |
| --- | --- |
| `pnpm run lint` (oxlint --deny-warnings) | **exit 0** |
| `pnpm run typecheck` (tsc -b) | **exit 0** |
| `pnpm run test` (Vitest) | **88 ficheros · 1410 tests · 1410 pasan**, exit 0, 227 s |
| `pnpm run test:e2e` (Playwright, 27 specs) | **174 passed**, exit 0, 51,6 s |
| `bin/harness init` | **EXIT=1 — ROJO** |

El único `[FAIL]` de `harness init`, literal:

```
── 3. feature_list.json y escenarios ───────────────────
[FAIL]  feature 39 (retirada_carteleria_urgencias) en spec_ready sin features/retirada_carteleria_urgencias.feature
── Resumen ─────────────────────────────────────────────
[FAIL]  Entorno NO está listo. Resuelve los errores antes de avanzar.
```

No es un falso positivo del arnés: `.harness/harness.mjs:387-410` exige
`features/<name>.feature` para toda feature `sdd: true` en `spec_ready`,
`in_progress` o `done`, y es literalmente el checkpoint **C6**. Los dos rojos
que las oleadas 1-3 dejaron a propósito **sí están cerrados**: lo confirmo con
mi propia corrida de Playwright (174/174, incluidos
`fidelidad-cabecera.spec.ts:279`, `urgencias.spec.ts:113` y
`datos-reales.spec.ts:268`).

---

## 1. Cobertura de los escenarios NUEVOS, cláusula a cláusula

### `fidelidad_cabecera` @s4 — la franja fija mide el hueco que el documento reserva

| Cláusula | Puerta que la muerde | ¿Muerde? |
| --- | --- | --- |
| `:368` alto de la cabecera, borde incluido == relleno superior del contenedor | `fidelidad-cabecera.spec.ts:218-220` | **[x]** nació rojo (65 contra 64) |
| `:369` sin tolerancia; la red es menor que el grosor del borde fino y se deriva de ese token | `fidelidad-cabecera.spec.ts:215-216` (`grosorDelBordeFino > 0` y `TOLERANCIA_VERTICAL_MAXIMA = grosor/2`, con `toBeLessThan`) | **[x]** y además no hereda el `TOLERANCIA = 1` horizontal de @s1, que es justo lo que el defecto pedía |
| `:370` el primer contenido arranca en el borde inferior, sin píxel tapado ni franja | `fidelidad-cabecera.spec.ts:221-224` | **[x]** |
| `:371` sin mover el token de altura ni el hueco reservado | `fidelidad-cabecera.spec.ts:230-232` + `Cabecera.test.tsx:368-372` (`.cabecera` conserva `min-height: var(--altura-cabecera)`; `.interior` no escribe ningún `px`) | **[x]** — verificado además de hecho: `src/styles/` no aparece en el diff |
| `:372` el bloque de marca no supera ese alto | `fidelidad-cabecera.spec.ts:234` | **[x]** |

### `fidelidad_cabecera` @s5 — ninguna ruta ofrece acceso a urgencias en la cabecera

| Cláusula | Puerta | ¿Muerde? |
| --- | --- | --- |
| `:402` ningún `tel:` en la cabecera | `fidelidad-cabecera.spec.ts:252` | **[x]** |
| `:403` ningún nombre accesible con "Urgencias" | `fidelidad-cabecera.spec.ts:253-260` (link **y** button) | **[x]** |
| `:404` el texto visible no contiene "Urgencias" | `fidelidad-cabecera.spec.ts:261` | **[x]** |
| `:405` el resto del armazón común tampoco ofrece la llamada | `fidelidad-cabecera.spec.ts:279-294` | **[x] VERDE hoy** — nació rojo en la oleada 1, bajó de 2 a 1 con E1 y lo cerró E2 |
| `:406` recorre las seis rutas, nunca una lista vacía | `:250` (`enlaces.count() > 0` por ruta) + `:266` y `:293` (`rutasRecorridas === RECUENTO_DE_RUTAS`) | **[x]** doble anti-vacuidad |

Refuerzo en CI (Playwright no corre en CI): `Cabecera.test.tsx:225-250` (@s13 de
`cabecera_y_navegacion`) y `PaginaBlog.test.tsx:98-105`.

### `fidelidad_cabecera` @s6 — la píldora de "Tienda"

| Cláusula | Puerta | ¿Muerde? |
| --- | --- | --- |
| `:420` alto visible < 48 | `fidelidad-cabecera.spec.ts:333` | **[x]** |
| `:421` no supera los 36 de la escala | `:334` | **[x]** |
| `:422` no baja de los 24 del mínimo táctil | `:335-337` | **[x]** |
| `:423` objetivo de pulsación >= 44x44 | `:339-340` | **[x]** |
| `:424` tinta fuerte, no el color de texto normal | `:342-343` (las dos caras: `toBe(tintaFuerte)` **y** `not.toBe(colorDeTextoNormal)`) | **[x]** |
| `:425` tamaño de letra de un paso existente de la escala | `:345` contra `PASOS_DE_LA_ESCALA_TIPOGRAFICA_PX` escrito a mano + `Cabecera.test.tsx` (`font-size: paso-tipografico(-1)`) | **[x]** |

La estructura que lo hace posible la blindan seis `it` de
`Cabecera.test.tsx:377-450` sobre el texto real del `.scss`, incluido
`expect(cuerpo).not.toMatch(/:\s*-?[\d.]+px/)` — la traducción literal de «ni un
píxel a mano».

### `fidelidad_cabecera` @s7 — el borde suavizado

| Cláusula | Puerta | ¿Muerde? |
| --- | --- | --- |
| `:471` contrasta menos que el borde de control | `fidelidad-cabecera.spec.ts:402-404`, x5 variantes, con la fórmula real del repo | **[x]** |
| `:472` nunca por debajo de 3:1 | `:405-407` | **[x]** |
| `:473` los demás botones de contorno conservan su borde | `:408-411` (`otrosBotonesDeContorno > 0`) | **[~]** muerde, pero es la más floja: cuenta cuántos siguen pintando el borde de control, no que **ninguno** haya cambiado. Aviso, no bloqueante |
| `:474` una única regla, la misma para las cinco, derivada de tokens | `Cabecera.test.tsx:437-441` (la mezcla exacta) + el bucle de 5 variantes | **[x]** |
| `:475` ningún color literal en la hoja del módulo | `inventarioModulos.test.ts:130-146` (17 ficheros, recuento explícito) | **[x]** — comprobado a mano: `grep -E "#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\("` sobre `Cabecera.module.scss` e `InformacionContacto.module.scss` no devuelve nada |

**Los cuatro escenarios nuevos están cubiertos cláusula a cláusula.**

---

## 2. Escenarios REESCRITOS: cobertura

| Contrato | Puerta | Estado |
| --- | --- | --- |
| `fidelidad_cabecera` @s1 (D2 borde derecho, D3 hueco de 4) | `fidelidad-cabecera.spec.ts:80-103` + `Cabecera.test.tsx:571-578` | [x] |
| `fidelidad_cabecera` @s2, @s3 | `fidelidad-cabecera.spec.ts:130`, `:166` | [x] |
| `cabecera_y_navegacion` @s7, @s13 | `Cabecera.test.tsx:108-119`, `:225-250` | [x] — @s13 tenía puerta INERTE desde el 25/08/2026 |
| `pagina_blog` @s2 | `PaginaBlog.test.tsx:98-105` | [x] invertido |
| `informacion_contacto` @s1, @s6, @s13 | `InformacionContacto.test.tsx:14`, `:79`, `:225` | [x] |
| `fidelidad_contacto` @s1, @s5 | `fidelidad-contacto.spec.ts:45`, `:166-194` | [x] |
| `seo_estructura` @s10 | `paginasSeo.test.tsx:85-97` | [x] |
| `pie_de_pagina` @s2 (4/4/3 y 11) | `PieDePagina.test.tsx:37-74` | [x] |
| `pie_de_pagina` @s2, tres leyes de UI/UX | `fidelidad-pie.spec.ts:192`, `:228`, `:248`, x6 anchos | [x] |
| `pie_de_pagina` @s5, @s6, @s7, @s15 | `PieDePagina.test.tsx:107`, `:139`, `:170`, `:327` | [x] |
| `rediseno_visual` @s7, @s11, @s14, @s26, @s28, @s36, @s52 | `matrizDeContraste.test.ts`, `urgencias.spec.ts`, `datosDelSitio.test.ts`, `datos-reales.spec.ts`, `accesibilidad.spec.ts`, `rediseno-visual.spec.ts`, `InformacionContacto.test.tsx:359/:395` | [x] |
| **`accesibilidad` @s19** | `movimiento.spec.ts:105-109` | **[ ] INERTE — ver §3** |
| **`accesibilidad` @s20** | `accesibilidad-movimiento.test.ts:39-53` | **[ ] SIN PUERTA — ver §3** |
| `accesibilidad` @s22 | `movimiento.spec.ts:124-137`, `accesibilidad-movimiento.test.ts:110-134`, `Equipo.test.tsx:498-510` | [~] cubierto salvo el «recuento de módulos», que nadie cuenta |

---

## 3. BLOQUEANTE de cobertura: tres cláusulas aprobadas sin puerta

Es exactamente lo que el encargo mandaba cazar: «un test que pasa sobre una
lista vacía NO la muerde».

### 3.1 `features/accesibilidad.feature:477` (@s19) — puerta INERTE, y está escrito así en el código

La cláusula aprobada dice que el recuento «se obtiene de los elementos que
declaran movimiento en los módulos que lo declaran de verdad, y no de contar los
elementos a los que la propia consulta de movimiento reducido les anula la
duración, que son todos los del documento».

Lo que hay hoy en `tests/e2e/movimiento.spec.ts:105-109`:

```
expect(
  elementosConTransicionDeclarada,
  'elementos con transición efectivamente inspeccionados (@s19, 4ª cláusula del Then)',
).toBeGreaterThan(0)
```

y siete líneas más arriba, en el propio fichero (`:82-93`), el diagnóstico que
escribió la oleada 4: «DEFECTO CONOCIDO Y SIN ARREGLAR… bajo `reduce` el
anulador global aplica `transition-duration: 0.01ms` sobre `*`: el filtro
"duración > 0" casa con TODOS los elementos del documento… así que el `>= 1` de
abajo se cumple siempre».

Una aserción que **no puede ponerse roja jamás** no es una puerta. La oleada 4
hizo lo correcto —declararlo en vez de taparlo— pero su lista de ficheros decía
«`movimiento.spec.ts` (solo comentarios)», así que el arreglo nunca se asignó.
**El contrato quedó aprobado y la puerta no existe.**

### 3.2 `features/accesibilidad.feature:501-503` (@s20) — tres cláusulas sin ningún test

- `:501` «el inventario de bloques que se recorre se lee del sitio real, nunca de
  una lista escrita en el propio test»
- `:502` «desde el 20/09/2026 el recuento de bloques que aparecen mediante una
  animación es exactamente 0, y la puerta lo declara por escrito en vez de
  aprobar en silencio sobre una lista vacía»
- `:503` «si ese recuento vuelve a ser mayor que 0, esta puerta lo caza»

La única puerta de @s20 es `src/lib/accesibilidad-movimiento.test.ts:39-53`, y la
alimenta un literal sintético de **dos entradas escritas en el propio test**
(`'Tarjeta de campaña 1'`, `'Tarjeta de campaña 2'`) — exactamente lo que `:501`
prohíbe. El «recuento = 0» de `:502` no lo afirma nadie, en ningún sitio.

No es formalismo: la feature 39 **retira las dos únicas declaraciones
`animation:` del proyecto**, y `:502` es el disparador que Pablo aprobó para que
esa pérdida no pueda revertirse en silencio. Es el mismo patrón que las oleadas
SÍ construyeron bien en `urgencias.spec.ts:166-167` (`mencionesTotales` a 0) y en
`matrizDeContraste.test.ts` (los dos recuentos a 0). Aquí falta.

### 3.3 Aviso menor: `features/accesibilidad.feature:565` (@s22)

«el recuento de módulos que declaran movimiento dentro de ese bloque es mayor que
0 y se lee del texto real de las hojas de estilo». `Equipo.test.tsx:507` sí lee
texto real y sí muerde, pero afirma **existencia en un módulo**, no un recuento.
Y `escalaMovimiento.test.ts:44` cuenta **ficheros**, no declaraciones: seguiría
verde con el proyecto a cero movimiento. No lo cuento como bloqueante porque hay
una puerta real sobre texto real, pero la cláusula está cubierta a medias.

---

## 4. Los siete puntos que el encargo pedía comprobar

1. **Cláusulas nuevas y reescritas con test que muerde** — §1 y §2. Los cuatro
   escenarios nuevos, **SÍ**, cláusula a cláusula. Las reescritas, sí salvo las
   tres de §3. Sobre vacuidad, dos hallazgos **a favor** de las oleadas:
   `accesibilidad.spec.ts` leía `header > *:visible` y `header` tiene un solo
   hijo desde que existe `.interior` — la puerta llevaba tiempo inerte y la
   oleada 1 la reapuntó a `[data-cabecera-interior] > *:visible`; y
   `Cabecera.test.tsx:108` tenía un filtro `href^="tel:"` que dejaba muerta la
   comprobación del panel, retirado en el mismo paso. Las dos vacuidades que la
   feature 39 **crea** (los bucles de corrección de `urgencias.spec.ts` sobre
   listas hoy vacías, y el `filter(...).toEqual([])` de `datos-reales.spec.ts`)
   están fijadas con disparador explícito (`toBe(0)`, `rutasInspeccionadas`,
   `cualificadoresBuscados > 0`): declaradas, no escondidas.
2. **Ningún literal de color ni número a mano en los `.module.scss` tocados** —
   **SÍ**. Comprobado a mano (0 coincidencias de `#hex`/`rgb()`/`hsl()`) y por
   puerta (`inventarioModulos.test.ts:130`, 17 ficheros con recuento). El único
   valor nuevo es `$alto-visible-del-acceso-a-tienda: $area-tactil-minima +
   espaciado(12) - $ancho-borde-fino` (`Cabecera.module.scss:16`) = 24 + 12 - 1 =
   **35 px**, derivado de `_api.scss:81,117`. Los `px` que quedan en el fichero
   (`:216-217`, `:249-250`, `:116`, `:237`) son preexistentes y ajenos al diff.
3. **Los tests a invertir se invirtieron y no se borraron** — **SÍ, los tres**.
   `Cabecera.test.tsx:108-119` invertido y con el filtro inerte retirado;
   `PaginaBlog.test.tsx:98-105` invertido y renombrado;
   `Cabecera.test.tsx:223-237` reubicado como el test de @s13, conservando sus
   tres aserciones ("24 h", "24h", "640 22 11 90") y ganando dos.
4. **Las dos guardas polizón de `InformacionContacto.test.tsx`** — **SÍ, vivas**:
   `not.toContain('@media (max-width')` en `:409` y
   `not.toContain('accionesUrgencia')` en `:412`, ahora sobre el módulo entero y
   con anti-vacuidad delante (`:397`).
5. **@s15 del pie conserva su fallo cerrado, reapuntado al teléfono de la
   clínica** — **SÍ**: `PieDePagina.tsx:53-63` expone `telefonoClinica?: string`
   y `PieDePagina.test.tsx:350-353` renderiza con `'91 082 92'`, exige que lance
   con el valor recibido y que no quede ningún `a[href^="tel:+34"]`. Se eligió la
   prop sobre la lógica pura por la razón correcta: la tercera cláusula habla del
   DOM y la función pura no renderiza nada.
6. **Los números del preflight se cumplen en el código real** — **SÍ, con una
   desviación deliberada y bien justificada**. Verificado por la vía dura: los
   @s1, @s4, @s6 y @s7 de `fidelidad-cabecera.spec.ts` miden `dist/` servido y
   **pasan en mi propia corrida**. La desviación es la caja de "Tienda":
   **73,8 x 48** en vez de los 71,8 x 44 del preflight, porque el preflight
   inyectaba `min-height:44px` y `padding-inline:15px` en crudo y ni 44 ni 15
   existen en las escalas. El contrato pide «al menos 44 por 44» (@s2) y la
   píldora visible aterriza en los 35 exactos del prototipo: **se cumple con
   holgura y por derivación**, que es lo que el propio preflight ordenaba
   (`preflight_cabecera_20260920.md:34-37`). Correcto no copiar los literales.
   Matiz: el barrido de los 7 anchos (solape 0 en 320/700/1023/1024/1220/1600)
   vive solo en el informe de la oleada 1; el Given de @s4 acota a 1440, así que
   la puerta no lo cubre. No es incumplimiento del contrato, pero conviene saber
   que ese dato es una medición, no una red.
7. **Nada fuera del alcance aprobado** — **SÍ**. `git status` limpio de
   temporales; 39 ficheros modificados, todos dentro de las cuatro listas
   declaradas; `src/lib/site.ts` intacto (E3: el dato sobrevive);
   `PieDePagina.module.scss` byte a byte como HEAD (verificado). Las features
   **40 y 41 siguen `pending`** y nadie ha empezado a hacerlas.

---

## 5. Disciplina TDD

**¿Producción que ningún test exige? NO.** Repasado cambio a cambio:

| Cambio de producción | Puerta que lo pidió en rojo |
| --- | --- |
| `Cabecera.module.scss:80` `gap: espaciado(4)` | `Cabecera.test.tsx:571-578` (ciclo 2) |
| `Cabecera.module.scss:44` `min-height: calc(... - $ancho-borde-fino)` | `Cabecera.test.tsx:367-373` (ciclo 4) |
| `Cabecera.module.scss:16` + bloque `::before` + `&:hover::before` | 6 `it` de `Cabecera.test.tsx:377-450` (ciclo 3) |
| `PieDePagina.tsx` prop `telefonoClinica` | `PieDePagina.test.tsx:350` (ciclo 1 del pie, rojo literal citado) |
| `datosDelSitio.ts:437` `every(...)` | `datosDelSitio.test.ts:529-556` (ciclo 2 de transversales) |
| `matrizDeContraste.ts` -2 filas | `matrizDeContraste.test.ts` x5 rojos (ciclo 1 de transversales) |
| Todo lo demás | **eliminación pura** |

Y en la otra dirección, lo que más valoro: **ninguna función quedó viva sin
tests y ningún test quedó vivo sin función**. `Cabecera-logica.test.ts` pierde
sus 4 `it` en el mismo paso que `construirControlDeUrgencias`;
`PieDePagina-logica.test.ts` pierde su describe de refuerzo en el mismo paso que
`nombreEnlaceUrgencias`; y `SEPARADOR_ROTULO` se borra con la función en vez de
quedar huérfana — el diagnóstico de la oleada 3 es exacto: una constante de
cadena sin referencias produce un mutante que ningún test puede matar, y con
`break = 100` eso es rojo garantizado.

**¿Evidencia de Rojo→Verde→Refactor? SÍ**, con tres desviaciones que las cuatro
oleadas **declaran por escrito** en vez de disimular, y que acepto:

- Los ciclos de retirada pusieron 3, 7 y 4 puertas en rojo antes de un único
  paso de verde. Es correcto: las puertas afirman el mismo comportamiento desde
  varios ángulos y la retirada que las satisface es atómica; no existe un orden
  que produzca rojos independientes. Anotado igual en las tres oleadas.
- Los rojos que no se podían obtener con la producción ya cambiada se
  **fabricaron**: la oleada 2 reconstruyó el sitio pre-E1 con `git stash` y leyó
  el fallo literal («Expected: 1, Received: 2»); la oleada 3 perturbó el SCSS del
  pie en **dos pasadas** —la segunda porque en la primera una cláusula quedaba
  tapada detrás de otra— y verificó después que `git status --porcelain` del
  `.module.scss` volvía vacío. Eso separa una red de verdad de un test
  decorativo.
- El disparador de @s14 nacía verde por construcción, así que la oleada 4
  comprobó que **muerde** invirtiéndolo a `toBe(1)` y viendo el spec fallar.

La `TOLERANCIA_SUBPIXEL_PX = 1/64` de `fidelidad-pie.spec.ts` está bien
justificada: es la `LayoutUnit` de Blink (215,203125 contra 215,1875 a 1440 px),
la igualdad es exacta en los otros cinco anchos y la perturbación la rompe por
108 px. No afloja la puerta.

---

## 6. Calidad (lente de artesano)

Lo bueno, que es casi todo:

- `Cabecera.module.scss:158-208` — el «patrón invertido» de D4 es la decisión de
  diseño más fina de la tanda: el `<a>` conserva su caja de 44x44 (que se mide
  sobre su `getBoundingClientRect`) y la píldora se dibuja **dentro** con un
  `::before` y `isolation: isolate`. Un pseudo-elemento que saliera del enlace no
  habría cambiado el rect. El `@include boton-fantasma` se conserva con los
  overrides detrás (precedente en verde: `PaginaTienda.module.scss`), y el
  `&:hover::before` existe para que el `@include` que @s28 obliga a conservar no
  se quede decorativo. Está razonado en el comentario, no adivinado.
- `fidelidad-cabecera.spec.ts:307-313` — el comentario que explica por qué NO se
  suman los bordes al `height` del pseudo-elemento (con `box-sizing: border-box`
  ya es la caja de borde; sumarlos daba 37 y contaba dos veces el perímetro). Un
  «por qué» no obvio, corregido al medir y no al razonar. Igual el de `:353-360`
  sobre la transición de 150 ms que hacía leer `calida` a media interpolación.
- `PieDePagina.test.tsx:38-47` — el recuento pasa a declararse **columna a
  columna**, con el mensaje nombrando la columna, en vez de un único número para
  las tres. Un fallo futuro dirá cuál.
- `matrizDeContraste.test.ts:509-515` — la entrada del 20/09/2026 en el histórico
  del recuento (22 a 24 a 25 a 23), con la decisión y su motivo. Un recuento sin
  historia es el que nadie sabe por qué cambió.

Hallazgos concretos (ninguno bloqueante):

- `src/lib/diseno/matrizDeContraste.ts:8` — errata: «cartelíería».
- `src/components/InformacionContacto.module.scss:5-8` — `.informacionContacto`
  conserva `display:flex; flex-direction:column; gap: espaciado(16)` con **un
  solo hijo**: el `gap` ya no separa nada. La oleada 2 decidió no tocarlo porque
  ningún test rojo lo pedía (Ley 1) y el contrato no lo menciona. De acuerdo con
  la decisión; queda como limpieza para una puerta que la justifique.
- `src/lib/diseno/matrizDeContraste.test.ts` — la ausencia de filas con fondo
  `urgencia` se afirma **dos veces** (en el `it` disparador de @s7 y en el último
  `describe`). Duplicación menor; no resta mordiente.
- `tests/e2e/fidelidad-cabecera.spec.ts:408-411` — ya señalado en la sección 1:
  `> 0` donde la cláusula dice «sin cambiar ni un dígito».
- Arquitectura: **respetada**. Toda la decisión sigue en módulos puros `.ts`
  (`Cabecera-logica.ts`, `PieDePagina-logica.ts`, `datosDelSitio.ts`) y los
  `.tsx` solo cablean. Ningún módulo nuevo, ninguna ampliación del inventario de
  17 hojas con estilos, ninguna dependencia nueva, ni un `TODO` suelto ni un log
  de depuración en el diff.
- **Deuda documental heredada que esta tanda no cierra** (las oleadas la
  declararon; la listo para que no se pierda): `global.scss:241-244` (la
  aritmética del «64 + 8 = 72» sigue mal explicada aunque la conclusión ya sea
  cierta), `urgencias.spec.ts:18` (cita `PieDePagina.test.tsx:124`, que hoy es
  otra cosa: el comentario **nace caducado**), `fidelidad.spec.ts:149` y
  `geometria-escalas.spec.ts:277-282` (citas de línea corridas),
  `Hero.test.tsx:330` y `accesibilidad.feature:398-399` (`Cabecera:127`, hoy
  `:144`).
- **Token huérfano:** `--color-urgencia-suave` ya no lo pinta ningún fichero de
  `src/`, pero sigue declarado y congelado en las cinco variantes por
  `rediseno_visual` @s1/@s2, `contratoRedisenho.ts` y el mapeo `--urg-soft` de
  `fidelidadPrototipo.ts`. Coincido con la oleada 4: **es puerta humana**, no
  decisión de artesano. Por la misma lógica de Pablo —que lo declarado sea lo que
  se pinta— es el hilo siguiente.

---

## 7. Checkpoints

- **C1 — El arnés está completo:** `[ ]` — ficheros base y docs, sí;
  `bin/harness init` **exit 1**.
- **C2 — El estado es coherente:** `[ ]` — dos defectos. (a) La feature 39 nunca
  pasó a `in_progress`: se ha hecho TDD completo sobre una feature en
  `spec_ready`, saltándose el estado que define `docs/workflow.md`, y es justo lo
  que dispara el fallo de C1. (b) `progress/current.md` solo registra la
  **oleada 1** («Playwright 171/172», ya falso) y arrastra sesiones del 03/09 y
  el 09/09. Las oleadas 2-4 no lo tocaron por acuerdo entre ellas, razonable para
  no pisarse, así que le toca al orquestador.
- **C3 — El código respeta la arquitectura:** `[x]`.
- **C4 — La verificación es real:** `[x]` — 1410 tests verdes, 174 de navegador
  verdes, aislamiento real (se mide `dist/` servido, no maquetas).
- **C5 — La sesión se cerró bien:** `[ ]` — sin ficheros sospechosos (bien), pero
  `progress/history.md` no tiene entrada de esta sesión y el estado de la 39 no
  está reflejado.
- **C6 — Contrato Gherkin:** `[ ]` — **dos incumplimientos**. No existe
  `features/retirada_carteleria_urgencias.feature`, y `project-spec.md` no tiene
  sección para la feature 39: sigue describiendo el estado anterior en `:987`,
  `:1055-1056` («botón rojo de urgencias con el rótulo real») y `:1082`. La
  tercera viñeta de C6 falla por la sección 3.
- **C7 — Prueba de mutación:** pendiente del `mutation_tester`, como debe ser. Le
  dejo dos avisos ya verificados por las oleadas: (a) el superviviente de
  `Cabecera-logica.ts` (`esMovil`, de mayor-que a mayor-o-igual) es
  **equivalente** —en el valor 0 las dos ramas devuelven `true`—, no lo introduce
  esta feature (el diff de ese fichero es eliminación pura y `esMovil` queda byte
  a byte igual) y está decidido y documentado en
  `progress/decision_mutante_esmovil_20260920.md` con precedente en
  `mutation_cabecera_y_navegacion.md`; (b) `datosDelSitio.ts` cambia una decisión
  pura bajo umbral 100 y borra dos constantes: el razonamiento de por qué los
  cinco casos matan las cuatro mutaciones está escrito, pero **no está corrido**.

---

## 8. Cambios requeridos

### Bloqueantes (sin estos no hay aprobación)

1. **Poner `bin/harness init` en verde.** Falta
   `features/retirada_carteleria_urgencias.feature`
   (`.harness/harness.mjs:406-410`). La tanda amplió 8 contratos existentes en
   vez de crear uno propio —decisión defendible para una feature transversal—
   pero el arnés y el checkpoint C6 exigen el fichero derivado del `name`. Crear
   el contrato de la 39 (aunque sea el índice que enlaza los 8 enmendados y fije
   sus propios `@s`) y pasarlo por la puerta humana, o reestructurar la entrada
   de `feature_list.json` de forma que la regla se cumpla de verdad. **No
   desactivar la comprobación.**
2. **Dar puerta a las tres cláusulas de la sección 3.** Una quinta oleada
   acotada:
   - `accesibilidad.feature:477` : arreglar `movimiento.spec.ts:94-101`, que hoy
     cuenta todos los elementos del documento bajo `reduce`, para que el recuento
     salga de los elementos de los **6 módulos que declaran movimiento de
     verdad** (Cabecera, Equipo, Faq x2, Galeria, ReservaChat, Servicios x2). Es
     código, no comentario.
   - `accesibilidad.feature:501-503` : `accesibilidad-movimiento.test.ts` tiene
     que leer el inventario del **sitio real** (el patrón ya existe en el repo:
     `import.meta.glob` con `query: raw`, como `matrizDeContraste.test.ts:57-61`
     o `escalaMovimiento.test.ts:12-30`) y afirmar el **recuento 0 explícito**
     como disparador, con anti-vacuidad. Mismo patrón que
     `urgencias.spec.ts:166-167`, que esta misma tanda ya hizo bien.
   - Si la decisión fuera que esas cláusulas no deben existir todavía, entonces
     **se retiran del contrato con nota y vuelven a la puerta humana**, pero no
     se dejan aprobadas y sin puerta.
3. **Sección de la feature 39 en `project-spec.md`** (C6), y corregir `:987`,
   `:1055-1056` y `:1082`, que siguen describiendo la cartelería retirada.
4. **Mover la 39 a `in_progress`** en `feature_list.json` y actualizar
   `progress/current.md` con el estado real de las cuatro oleadas (hoy dice
   «171/172»; son **174/174**), dejándolo sin la basura del 03/09 y el 09/09.

### No bloqueantes, pero que alguien debe recoger

5. Reescribir el comentario caducado de `urgencias.spec.ts:18` y las citas de
   línea corridas de `fidelidad.spec.ts:149`, `geometria-escalas.spec.ts:277-282`,
   `Hero.test.tsx:330` y `accesibilidad.feature:398-399`.
6. Errata `matrizDeContraste.ts:8` («cartelíería»).
7. Decidir sobre `--color-urgencia-suave`, huérfano: **puerta humana**.
8. Endurecer `fidelidad-cabecera.spec.ts:408-411` (comparar contra el censo real
   de botones de contorno, no contra cero) y `accesibilidad.feature:565`
   (recuento de módulos, hoy afirmado como existencia en uno solo).
9. Limpiar el `gap` sin función de `InformacionContacto.module.scss:5-8`, con una
   puerta que lo justifique.

---

## 9. Lo que quiero dejar dicho a favor de esta tanda

Rechazo por lo que falta fuera del código, no por lo que hay dentro. Cuatro cosas
que merecen constar:

1. **La cláusula escrita en rojo a propósito por quien no podía satisfacerla**
   (`fidelidad-cabecera.spec.ts:279`), heredada oleada a oleada con el número
   exacto de enlaces que quedaban (2, luego 1, luego 0) y cerrada por E2. Es
   coordinación entre agentes hecha con honestidad y con medida.
2. **Los rojos fabricados** cuando no se podían obtener de otra forma: `git
   stash` para reconstruir el sitio anterior, dos pasadas de perturbación del
   SCSS del pie, la inversión del disparador a `toBe(1)`. Nadie presentó un test
   verde como si hubiera nacido rojo, y donde sí pasó (el primer `it` de @s7 de
   la oleada 4), lo dijeron.
3. **Las desviaciones declaradas en vez de disimuladas**: los rojos múltiples
   antes de un verde atómico, la caja de 73,8 x 48 contra el preflight, la
   cobertura que se pierde con la banda roja, el mutante equivalente entregado al
   orquestador en vez de «arreglado» por su cuenta.
4. **Dos puertas inertes descubiertas y reparadas de paso** (el selector de hijos
   de cabecera en `accesibilidad.spec.ts`, el filtro `tel:` de
   `Cabecera.test.tsx:108`) y una que llevaba desde el 25/08/2026 sin un solo
   test (@s13 de `cabecera_y_navegacion`), ahora cubierta.

Corregidos los cuatro bloqueantes, esto se aprueba.
