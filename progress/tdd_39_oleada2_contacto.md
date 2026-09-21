# Feature 39 — Oleada 2 de 4: LA TARJETA ROJA DE CONTACTO (E1)

> `tdd_craftsman`, 20/09/2026. Contratos: `features/informacion_contacto.feature`
> @s1, @s5 (eliminado), @s6 (invertido), @s12 (eliminado) y @s13;
> `features/fidelidad_contacto.feature` @s1, @s3 (eliminado) y @s5;
> `features/rediseno_visual.feature` @s36; `features/seo_estructura.feature` @s10.
>
> Estado que dejo: **lint, typecheck y Vitest en VERDE**. Playwright **170/171**;
> el único rojo es el que la oleada 1 dejó escrito a propósito para la oleada
> del PIE (E2), y mi cambio lo ha acercado a verde sin poder cerrarlo.

---

## 1. Los ciclos Rojo → Verde → Refactor, en orden

La retirada se partió en **tres ciclos** por una razón concreta: el DOM y el
SCSS los vigilan puertas distintas, y las del SCSS **no fallan suavemente**
(su ayudante `cuerpoDelBloque` LANZA). Separarlos permite que cada rojo sea un
fallo legible y no un error de infraestructura.

### Ciclo 1 — el DOM: fuera la tarjeta del marcado

**ROJO — 4 tests fallando**, verificados antes de tocar una línea de `src/`:

| Puerta | Qué hice |
| --- | --- |
| `InformacionContacto.test.tsx` @s1 | 4 grupos → **3**; fuera «Urgencias fuera de horario» de la lista de nombres y **añadida su ausencia explícita**, para que el grupo no pueda volver por la puerta de atrás. |
| @s5 | **Borrado** el describe entero: el escenario se retira del contrato. |
| @s6 | **INVERTIDO, no borrado**: `getByRole('link', {name:'Llamar ahora'})` → `queryByRole(...).not.toBeInTheDocument()`; ocurrencias del número `1` → **0**; añadido el barrido de `href` contra `tel:+34918511393`. **Las cinco prohibiciones de reclamo se conservan intactas**: son el corazón de @s6 y no dependían de la tarjeta. |
| @s12 | **Borrado**, y sus **dos cláusulas exclusivas reubicadas en @s13** (ver §3). |
| @s13 | 3 grupos → **2**; recibe «sin placeholder» y «sin `tel:` a medias» de @s12. |
| @s36 (DOM) | Borrado el `it` del rótulo de la tarjeta; el `it` del orden de lectura baja a tres bloques y **recoge la cláusula nueva** «no aparece ninguna tarjeta ni banda con el color de urgencia»; borrado el `it` mixto del punto pulsante. |
| `paginasSeo.test.tsx` @s10 | Fuera el bloque del enlace de urgencias; **conservada** la comparación contra el segundo enlace visible. |

**VERDE** — una sola retirada en `InformacionContacto.tsx`: el bloque
`[data-tarjeta-de='urgencia']` entero, la constante `enlaceUrgencias`, el
parámetro y la prop `telefonoUrgencias`, y los dos comentarios que describían
una anatomía de dos tarjetas. **`construirEnlaceTelefono` no se toca**: lo
siguen usando los dos teléfonos de la clínica.

**Nota de honestidad.** Las siete puertas se pusieron en rojo antes del único
paso de verde, no una a una. Las cuatro que fallaban afirman el **mismo**
comportamiento desde cuatro ángulos y la retirada que las satisface es atómica:
quitar solo el `<fieldset>` habría dejado el resto en rojo entre ciclos. Queda
dicho en vez de disimulado (mismo criterio que la oleada 1).

### Ciclo 2 — el SCSS: fuera la banda, y con ella la última animación

**ROJO — 1 test fallando.** Puerta **nueva** sobre el texto real del módulo,
que es la traducción literal de la cláusula de @s36 «no aparece ninguna tarjeta
ni banda con el color de urgencia»: el módulo no declara
`[data-tarjeta-de='urgencia']`, ni `--color-urgencia`, ni `.pulso`, ni
`@keyframes`, ni `animation:`, ni `@container`. Con **anti-vacuidad** (afirma
`toContain("[data-tarjeta-de='datos'] {")` primero, para que no pueda aprobar
leyendo una cadena vacía).

Los **cinco** `it` de SCSS de la banda se borraron **en este mismo paso**, no
después: su ayudante `cuerpoDelBloque` lanza `Error: no se encontró la
cabecera…` en cuanto el bloque desaparece, y de otro modo el ciclo 2 habría
reventado con un error de infraestructura en vez de con el fallo legible de
arriba.

**VERDE** — en `InformacionContacto.module.scss`: fuera
`[data-tarjeta-de='urgencia']` (con su `fieldset` y su `legend`), `.pulso`,
`[data-tarjeta-de='urgencia'] p`, `[data-tarjeta-de='urgencia'] a`, el
`@container (max-width: 28rem)` y `@keyframes pulso`. Corregido el comentario
de cabecera del fichero, que describía «una columna con la banda de urgencias
arriba y la tarjeta de datos debajo».

### Ciclo 3 — el navegador real

**ROJO demostrado, no supuesto.** Como la producción ya estaba cambiada por los
ciclos 1 y 2, el rojo de este ciclo se probó **reconstruyendo el sitio
anterior**: `git stash push` de los dos ficheros de producción → `pnpm run
build` → `playwright test tests/e2e/fidelidad-contacto.spec.ts`. Resultado
contra el `dist/` pre-E1:

```
x  @s5 ... Error: expect(locator).toHaveCount(expected) failed
           Expected: 1
           Received: 2
```

Dos tarjetas donde el contrato nuevo exige una. Después, `git stash pop`,
reconstrucción y verde.

**Honestidad sobre la cláusula reubicada de @s1**: la prohibición de reclamos
(«24 h», «todos los días», «siempre hay alguien de guardia») **pasa también
contra el sitio pre-E1**, y tiene que ser así: es una antirregresión que el
@s3 retirado ya hacía cumplir, no un comportamiento nuevo. Su valor es que
sobrevive a la retirada de su casa, no que cambie de color hoy.

**VERDE** — en `tests/e2e/fidelidad-contacto.spec.ts`:

- **@s1** recibe la prohibición de reclamos sobre la SECCIÓN entera.
- **@s3** borrado, y con él `colorDelToken` y `RELLENO_DE_BANDA_PX`, que solo
  él usaba (si no, `oxlint --deny-warnings` cae por símbolo sin usar).
- **@s5** reescrito: «columna de urgencias y datos» → «tarjeta de datos»; el
  bucle de desbordamiento **se conserva como LISTA** con una sola entrada, con
  `toHaveCount` sobre `[data-tarjeta-de]` para que la lista no sea arbitraria y
  con el recuento explícito `> 0` que pide el contrato. Borrado el bloque del
  plegado de la banda estrecha.

### REFACTOR (en verde)

Reescritos, con la barra verde, los comentarios que habían dejado de describir
el código: el JSDoc de `INTRODUCCION_DE_CONTACTO` (justificaba su silencio
sobre urgencias diciendo «ya lo hace la tarjeta de urgencias»), el JSDoc del
componente, el comentario de la tarjeta de datos y la cabecera del `.module.scss`.

---

## 2. Mapa `@s` → test

| Escenario | Test que lo cubre |
| --- | --- |
| `informacion_contacto` @s1 | `InformacionContacto.test.tsx:14` — 3 grupos, nombres exactos, sin «Email» ni «Urgencias fuera de horario» |
| @s5 | **retirado del contrato** — sin test, a propósito |
| @s6 | `InformacionContacto.test.tsx:79` — invertido: ninguna acción «Llamar ahora», 0 ocurrencias del número, ningún `href` de urgencias, y las 5 prohibiciones de reclamo |
| @s12 | **retirado del contrato**; sus dos cláusulas viven en el test de @s13 |
| @s13 | `InformacionContacto.test.tsx:225` — 2 grupos en orden, sin `<dl>` vacía, sin placeholder, sin `tel:` a medias (con anti-vacuidad nueva sobre la lista de destinos) |
| `rediseno_visual` @s36 | `InformacionContacto.test.tsx:359` (DOM: orden de lectura + 1 sola tarjeta) y `:395` (SCSS: ni banda, ni animación, ni `@media` de anchura) |
| `seo_estructura` @s10 | `paginasSeo.test.tsx:66` — comparación contra el primero y el segundo enlace visibles |
| `fidelidad_contacto` @s1 | `fidelidad-contacto.spec.ts:32` — cabecera, dos columnas **y la prohibición de reclamos reubicada** |
| `fidelidad_contacto` @s3 | **retirado del contrato** — sin test, a propósito |
| `fidelidad_contacto` @s5 | `fidelidad-contacto.spec.ts:166` — orden de lectura, inventario de tarjetas con recuento > 0, sin desbordamiento |

---

## 3. Lo que NO se ha perdido, porque se ha reubicado

Tres guardas viajaban dentro de tests que había que borrar y **no dependían de
la tarjeta**. Las tres están vivas:

1. `not.toContain('@media (max-width')` — la **ÚNICA** guarda de «este módulo
   no maqueta por anchura de ventana». Estaba dentro del `it` de la banda
   estrecha; ahora se afirma sobre el módulo entero en `:395`.
2. `not.toContain('accionesUrgencia')` — antirregresión de un nombre de clase
   retirado el 03/09/2026. Estaba dentro del `it` de la rejilla de la banda;
   ahora también en `:395`.
3. Las dos cláusulas exclusivas de @s12 —«sin placeholder» y «sin `tel:` a
   medias»— reescritas en el test de @s13, sobre el dato opcional que sobrevive
   (`horario: []`). **Con una mejora**: el bucle de destinos `tel:` lleva ahora
   `expect(destinosTelefono.length).toBeGreaterThan(0)`, que el @s12 original
   no tenía y que impide que apruebe por vacuidad.
4. La prohibición de reclamos en **navegador real**, de @s3 a @s1 del spec.

---

## 4. Lo que SÍ se pierde, sin maquillar

1. **La última lectura de `--color-urgencia` resuelto por el navegador.** Con
   @s3 se va `colorDelToken`. Ninguna puerta de Playwright comprueba ya que ese
   rojo se pinte en pantalla. Estaba anunciado en el contrato; queda medido.
2. **El plegado de la banda estrecha a 320 px** (número encima, píldora debajo,
   alineados por la izquierda). No se reubica: no queda banda.
3. **El patrón «dato ausente → el bloque desaparece» deja de ejercitarse sobre
   un TELÉFONO** en este panel. Sobreviven `horario: []` (@s13) y
   `direccion: null` (@s14). El modo «teléfono presente pero inválido» sigue
   ejercitado en @s16, con el de la clínica.
4. **La comparación explícita de `telephone` contra el enlace de urgencias**
   (@s10 de `seo_estructura`). Se conserva la del segundo enlace visible, que
   es la que demuestra lo que el escenario quiere.

---

## 5. Los números

| Puerta | Línea base (20/09) | Tras la oleada 1 | **Ahora** |
| --- | --- | --- | --- |
| `pnpm run lint` | exit 0 | exit 0 | **exit 0** |
| `pnpm run typecheck` | exit 0 | exit 0 | **exit 0** |
| `pnpm run test` (Vitest) | 88 ficheros · 1415 tests | 88 · 1419 | **88 ficheros · 1411 tests · 1411 pasan** |
| `pnpm run test:config` | 5 / 5 | — | **5 / 5** |
| `pnpm run build` | — | exit 0 | **exit 0** (puerta de terceros incluida) |
| Playwright (**no corre en CI**) | 167 / 167 | 171 pasan · 1 falla | **170 pasan · 1 falla** (171) |

**Aritmética del −8 en Vitest** (de 1419 a 1411), toda en mis dos ficheros de
Vitest, que pasan de 43 a 35 tests:

| Concepto | Delta |
| --- | --- |
| @s5 de `informacion_contacto`, borrado | −1 |
| @s12, borrado (sus cláusulas se funden en el `it` de @s13) | −1 |
| @s36, los 2 `it` de DOM de la tarjeta (rótulo real, punto pulsante) | −2 |
| @s36, los 5 `it` de SCSS de la banda | −5 |
| @s36, la puerta nueva «ni banda, ni animación, ni `@media`» | **+1** |
| `paginasSeo.test.tsx` @s10 (pierde aserciones, no `it`) | 0 |
| **Total** | **−8** |

### Mutación

`pnpm exec stryker run --mutate "src/components/InformacionContacto-logica.ts"`
→ **33 mutantes, 33 muertos, 0 supervivientes, 100 %**.

Confirmado lo que el contrato preveía: **E1 no mueve el denominador**.
`InformacionContacto-logica.ts` no ha perdido ningún export y el fichero está
**byte a byte intacto** (`git diff --stat` vacío). `construirEnlaceTelefono`
sigue mordido por los dos teléfonos de la clínica.

---

## 6. Lo que dejo en ROJO, y por qué no puedo cerrarlo

`tests/e2e/fidelidad-cabecera.spec.ts:279` → @s5 → «fuera de la cabecera y sin
interactuar, el armazón común tampoco ofrece la llamada a urgencias (E2)».

- **Lo escribió la oleada 1** a propósito, y avisó de ello en su §4.
- **Mi cambio lo ha acercado a verde**: en la portada medía **2** enlaces
  `a[href="tel:+34918511393"]` (el pie y la tarjeta de contacto) y ahora mide
  **1**. El fallo literal es ahora `Landing: llamada a urgencias visible sin
  interactuar — Expected: 0, Received: 1`.
- **El superviviente es el PIE**, que retira E2 en la oleada 3, sobre ficheros
  que esta oleada tiene prohibido tocar.

**Aviso a la oleada 3, medido hoy y no supuesto**: `tests/e2e/urgencias.spec.ts`
y `tests/e2e/datos-reales.spec.ts` (@s52) **siguen en VERDE tras E1**. El único
superviviente que los mantiene verdes es el enlace del pie. En cuanto E2 lo
retire, los dos se ponen rojos y hay que reescribirlos **en el mismo paso**.

---

## 7. Lo que NO he tocado y alguien tiene que mirar

1. **`src/components/InformacionContacto.module.scss:5-8`** —
   `.informacionContacto` sigue siendo `display: flex; flex-direction: column;
   gap: espaciado(16)` y ahora tiene **un solo hijo**, así que el `gap` ya no
   separa nada. No lo he tocado: **ningún test rojo lo pedía** (Ley 1) y el
   contrato no lo menciona. Es una limpieza de una línea que conviene hacer con
   una puerta que la justifique, no de tapadillo.
2. **`src/lib/diseno/matrizDeContraste.ts:363` y `:388`** — las **dos** filas de
   urgencia quedan hoy sin ningún módulo que las pinte: `:388` cita literalmente
   `InformacionContacto.module.scss ([data-tarjeta-de='urgencia'] a)`, que acabo
   de borrar. Es F1 y es de otra oleada; el contrato ya trae la decisión de
   Pablo (borrarlas: 25 → 23 filas, 125 → 115 parejas, con coste medido en 6
   tests rojos de un único fichero).
3. **`tests/e2e/fidelidad.spec.ts:148-150` y `tests/e2e/accesibilidad.spec.ts`**
   — **NO he retirado** ninguna llamada a `emulateMedia({reducedMotion:'reduce'})`,
   como me indicaba el encargo: son de la oleada 4. Pero dejo confirmado el
   hecho que obliga a reescribir sus comentarios: **tras D1 + E1 no queda ni una
   sola declaración `animation:` en todo `src/`** (verificado: el `grep` de
   `animation` sobre mi módulo devuelve 0 líneas).
4. **`src/lib/diseno/movimientoRespetuoso.test.ts`** — verificado que **no hay
   que tocarlo**: su recuento es `ficherosComprobados`, que cuenta todos los
   `*.module.scss` globbeados (no solo los que tienen movimiento), así que sigue
   `> 0` con margen. Igual `escalaMovimiento.test.ts`, que cuenta
   `ficherosInspeccionados`.
5. **`progress/current.md`** — no lo he tocado: está fuera de mi lista de
   ficheros y lo comparten las cuatro oleadas.
6. **`feature_list.json`** — no lo he tocado. La 39 sigue en `spec_ready`; no me
   corresponde moverla, ni hay nada que dar por `done` hasta que aterricen las
   cuatro oleadas y pasen `judge` y `mutation_tester`.
