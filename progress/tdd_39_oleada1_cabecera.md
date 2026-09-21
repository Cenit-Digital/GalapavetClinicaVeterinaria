# Feature 39 — Oleada 1 de 4: LA CABECERA (D1, D2, D3, D4, G1, G2)

> `tdd_craftsman`, 20/09/2026. Contratos: `features/fidelidad_cabecera.feature`
> @s1-@s7, `features/cabecera_y_navegacion.feature` @s7 y @s13,
> `features/rediseno_visual.feature` @s26 y @s28.
> Estado que dejo: **Vitest, lint y typecheck en VERDE**. Playwright **171/172**;
> el único rojo es, a propósito, la cláusula de @s5 que le toca a la oleada del pie.

---

## 1. Los ciclos Rojo → Verde → Refactor, en orden

### Ciclo 1 — D1: fuera todo control de urgencias de la cabecera

**ROJO.** Tres puertas de jsdom, las tres inversiones/reubicaciones que el
dosier pedía. Verificado en rojo antes de tocar producción: **3 tests fallando**.

| Fichero | Qué hice |
| --- | --- |
| `Cabecera.test.tsx:108-117` (@s7) | **Invertido**: el panel ya no exige el enlace de urgencias, ahora exige `queryAllByRole('link', {name: /Urgencias/i})` con longitud 0. Y **retirado el filtro `href^="tel:"`** de la línea 109: dejaba la puerta inerte y habría ocultado una regresión. |
| `Cabecera.test.tsx:223-237` | **Convertido en el test de @s13** de `cabecera_y_navegacion`, que llevaba desde el 25/08/2026 sin un solo test. NO borrado: sus tres aserciones ("24 h", "24h", "640 22 11 90") son literalmente lo que @s13 pide, más las dos que le faltaban (texto sin "Urgencias" y ningún `tel:`). |
| `PaginaBlog.test.tsx:80,98-100` (@s2) | **Invertido** y renombrado el `it`. Exigía el enlace que su propio Gherkin prohíbe. |

**VERDE.** Una sola retirada, atómica:

- `Cabecera.tsx` — fuera `EnlaceUrgencias`, su interfaz de props, sus dos usos
  (escritorio y panel), la constante `controlDeUrgencias` y los imports.
  `datosNegocio` **se conserva**: sigue dando nombre comercial y descriptor.
- `Cabecera-logica.ts` — fuera `construirControlDeUrgencias`,
  `TelefonoDeUrgencias` y `ControlDeUrgencias`.
- `Cabecera-logica.test.ts` — fuera sus 4 tests y el import, **en el mismo
  paso** (regla dura: función viva sin tests = mutantes supervivientes).
- `Cabecera.module.scss` — fuera `.urgenciasEscritorio`, `.urgenciasMovil`
  (la de primer nivel y la anidada en `.panelMovil`), `.puntoUrgencias`,
  `.rotuloUrgencias` y `@keyframes pulso-urgencias`.

**Nota de honestidad sobre el ciclo.** Las tres puertas se pusieron en rojo
antes del único paso de verde, en vez de una a una: las tres afirman el MISMO
comportamiento desde tres ángulos y la retirada que las satisface es atómica
(quitar solo el CTA de escritorio habría dejado en rojo la de `PaginaBlog`
entre ciclos). Queda dicho en vez de disimulado.

**REFACTOR en verde.** El comentario de `a[data-enlace-tienda]` citaba «la
tarjeta de urgencias de `InformacionContacto.module.scss`» como precedente del
mixin: se reescribe, porque esa tarjeta la retira E1 en otra oleada.

### Ciclo 2 — D3: separación entre el nombre y el descriptor

**ROJO** → `Cabecera.test.tsx`, puerta nueva sobre el texto REAL del `.scss`:
el bloque `> span` de `.marca` tiene que separar las dos cajas con
`gap: espaciado(4)` y **no** casar `/gap:\s*[\d.]/` (ningún número a mano).
1 test fallando.

**VERDE** → `gap: espaciado(4);` dentro del bloque `.marca > span` **que ya
existía**. No se reestructuró el árbol `a > span > (strong, span)`:
`geometria-escalas.spec.ts:277-282` ancla tres representantes tipográficos ahí,
y el paso −2 es literalmente el `<span>` del descriptor.

### Ciclo 3 — D4: el acceso "Tienda", con patrón INVERTIDO

**ROJO** → 6 tests nuevos en `Cabecera.test.tsx` sobre el texto real del
`.scss`: mixin conservado + overrides DESPUÉS, enlace sin borde propio con
`isolation: isolate`, píldora como `::before` interior, alto derivado de la
escala, bloque sin ningún `px` a mano, tinta fuerte y la mezcla del borde.
6 tests fallando.

**VERDE** → en `Cabecera.module.scss`:

```scss
$alto-visible-del-acceso-a-tienda: $area-tactil-minima + espaciado(12) - $ancho-borde-fino; // 35px
```

y, dentro de `.navPrincipal a[data-enlace-tienda]`, el `@include
boton-fantasma` **intacto** con los overrides detrás (precedente en verde:
`PaginaTienda.module.scss`): `position: relative`, `isolation: isolate`,
`border: none`, `color: var(--color-tinta)`, y un `&::before` absoluto con
`z-index: -1`, `inset-inline: 0`, `height: $alto-visible-del-acceso-a-tienda` y
`border: $ancho-borde-control solid color-mix(in srgb, var(--color-borde-control) 88%, var(--color-fondo))`.

Un `&:hover::before` reapunta a la píldora el estado con el puntero encima que
el mixin declara sobre un borde que aquí ya no existe: sin él, el `@include`
que @s28 obliga a conservar se quedaba decorativo.

**Ningún literal del preflight copiado.** `35px` sale de
`$area-tactil-minima + espaciado(12) - $ancho-borde-fino`; el relleno lateral se
queda en `espaciado(16)` (el preflight escribía `15px`); `1px` es
`$ancho-borde-fino` y `4px` es `espaciado(4)`.

### Ciclo 4 — G1: @s4, que nacía en rojo a propósito

**ROJO** → puerta nueva en `Cabecera.test.tsx`: `.interior` tiene que descontar
del token de altura el MISMO grosor de borde que `.cabecera` declara. 1 test
fallando. Y en navegador, @s4 medía 65 contra 64.

**VERDE** → una línea en `Cabecera.module.scss:33`:
`min-height: calc(var(--altura-cabecera) - #{$ancho-borde-fino});`.
`src/styles/hoja-global.test.ts` sigue en verde (re-corrido): el `calc` sigue
consumiendo `--altura-cabecera`.

### D2 y G2

- **D2** sale solo de D1 (`space-between` pasa de 3 hijos visibles a 2), pero
  ahora **lo mide una puerta**: `fidelidad-cabecera.spec.ts` @s1 compara
  `nav.right` contra `(#servicios > *).right` MEDIDO, sin escribir 1330.
- **G2**: el panel móvil no se ha tocado. Su `a[data-enlace-tienda]` conserva
  su `@include boton-fantasma` sin overrides, y el comentario deja escrito que
  los de D4 son solo de escritorio.

---

## 2. Mapa `@s` → test

| Escenario | Test que lo cubre |
| --- | --- |
| `fidelidad_cabecera` @s1 | `fidelidad-cabecera.spec.ts` @s1 (columna 1220, marca izq, **nav der = D2**, logotipo/nombre/descriptor, **hueco 4px = D3**, sin "24 h") + `Cabecera.test.tsx` «el nombre de la marca y su descriptor no se tocan» |
| @s2 | `fidelidad-cabecera.spec.ts` @s2 (8 enlaces, Tienda, 44×44 sobre los ocho con guarda anti-vacuidad, ningún `tel:`) |
| @s3 | `fidelidad-cabecera.spec.ts` @s3 (8 destinos, teclado, cierre al navegar, sin overflow) |
| @s4 | `fidelidad-cabecera.spec.ts` @s4 (sin tolerancia heredada) + `Cabecera.test.tsx` «la franja fija deja sitio a su propio borde» |
| @s5 | `fidelidad-cabecera.spec.ts` @s5, dos tests: el de la cabecera en las 6 rutas (**verde**) y el del armazón común (**rojo, es de E2**) |
| @s6 | `fidelidad-cabecera.spec.ts` @s6 + los 6 tests de estructura de `Cabecera.test.tsx` |
| @s7 | `fidelidad-cabecera.spec.ts` @s7 (5 variantes, contraste medido con la fórmula del repo) + la puerta de la mezcla en `Cabecera.test.tsx` |
| `cabecera_y_navegacion` @s7 | `Cabecera.test.tsx:108-119` (panel: 8 enlaces exactos, ningún nombre con "Urgencias") |
| `cabecera_y_navegacion` @s13 | `Cabecera.test.tsx` «la cabecera no anuncia urgencias ni contiene teléfonos» — **por primera vez desde el 25/08/2026** |
| `rediseno_visual` @s26 | `accesibilidad.spec.ts` (1024/1023, con el bucle ya no inerte) |
| `rediseno_visual` @s28 | `Cabecera.test.tsx` (atributo, mixin en escritorio y en panel, salto al ancla) + `rediseno-visual.spec.ts` |
| `pagina_blog` @s2 | `PaginaBlog.test.tsx` (invertido) |

---

## 3. Los números

| Puerta | Línea base (20/09) | Ahora |
| --- | --- | --- |
| `pnpm run lint` | exit 0 | **exit 0** |
| `pnpm run typecheck` | exit 0 | **exit 0** |
| `pnpm run test` (Vitest) | 88 ficheros · 1415 tests | **88 ficheros · 1419 tests · 1419 pasan** |
| `pnpm run build` | — | **exit 0** (puerta de terceros incluida) |
| Playwright (no corre en CI) | 167/167 | **171 pasan · 1 falla** (172) |

Aritmética del +4 en Vitest: −4 (los de `construirControlDeUrgencias`),
+1 D3, +6 D4, +1 G1; el describe de urgencias no se suma ni se resta, se
convirtió en el de @s13.

### Los 7 anchos, medidos sobre `dist/` servido (Chromium, DPR 1)

| Comprobación | 320 | 700 | 1023 | 1024 | 1220 | 1440 | 1600 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `header` alto == `#root` padding | 64 | 64 | 64 | 64 | 64 | 64 | 64 |
| Solape con `#inicio` | **0** | **0** | **0** | **0** | **0** | **0** | **0** |
| Hueco nombre ↔ descriptor | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| `marca.x` == `#servicios.x` | 16 | 24 | 24 | 24 | 24 | 110 | 190 |
| `nav.right` == `#servicios.right` | — | — | — | 1000 | 1196 | 1330 | 1410 |
| Caja de "Tienda" | — | — | — | 73,8×48 | idem | idem | idem |
| Píldora visible | — | — | — | **35** | **35** | **35** | **35** |
| Desbordamiento | no | no | no | no | no | no | no |
| Errores/avisos de consola | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

**Única desviación respecto del preflight, y es deliberada:** la caja del
enlace de Tienda mide **73,8 × 48** y no 71,8 × 44. El preflight inyectaba
`min-height: 44px` y `padding-inline: 15px` en crudo; el encargo dice que esos
literales se DERIVAN, y ni 44 ni 15 existen en las escalas del proyecto. Se
conservan `$altura-control-media` (48) y `espaciado(16)`, que es lo que ya había.
El contrato pide «al menos 44 por 44»: 48 y 73,8 lo cumplen con holgura, y la
píldora visible aterriza en los 35 px exactos del prototipo.

---

## 4. Lo que dejo en ROJO, a propósito, para la oleada del PIE

`tests/e2e/fidelidad-cabecera.spec.ts` → @s5 → segundo test:
«fuera de la cabecera y sin interactuar, el armazón común tampoco ofrece la
llamada a urgencias (E2)».

- **Mide**: 2 elementos con `a[href="tel:+34918511393"]` en la portada (el pie
  y la tarjeta de contacto) y 1 en las otras cinco rutas (el pie).
- **Por qué está escrito aquí**: es la última cláusula de @s5, y
  `fidelidad-cabecera.spec.ts` es fichero de ESTA oleada. Nadie más puede
  escribirla.
- **Por qué no la puedo poner en verde**: la satisfacen `PieDePagina*` (E2) e
  `InformacionContacto*` (E1), que esta oleada tiene **prohibido** tocar.
- **Aviso para esa oleada**: `tests/e2e/urgencias.spec.ts:113` exige HOY
  `menciones > 0` por ruta y **sigue en verde** tras D1 (el superviviente es el
  pie, como preveía el dosier). Cuando E2 retire el enlace del pie, ese test
  pasará a rojo y hay que reescribirlo en el mismo paso.

---

## 5. Lo que he tenido que corregir sobre lo previsto (medido, no supuesto)

1. **La píldora no se mide sumando los bordes.** Mi primera versión hacía
   `height + borderTop + borderBottom` y daba **37**. Con el reset global
   `box-sizing: border-box`, `getComputedStyle(el, '::before').height` YA
   devuelve la caja de borde: sumarlos contaba dos veces el mismo perímetro.
   Corregido y comentado en el spec; ahora da 35.
2. **@s7 se medía a media transición.** `boton-fantasma` transiciona
   `border-color` 150 ms; al recorrer las cinco variantes, la primera pasaba y
   `calida` daba **cero** botones con el borde de control. Resuelto con
   `emulateMedia({reducedMotion:'reduce'})` + espera a que no quede ninguna
   animación viva — el mismo recurso que ya usa `fidelidad.spec.ts` para que
   `aplicarVariante` converja. No cambia ningún color.

---

## 6. MUTACIÓN: un superviviente que NO es de esta oleada, y es EQUIVALENTE

`pnpm exec stryker run --mutate "src/components/Cabecera-logica.ts"` →
**30 muertos, 1 superviviente, 96,77 %**, por debajo del `break = 100`.

- **El mutante**: `EqualityOperator` en `esMovil`, `if (!(anchoVentana > 0))`
  → `if (!(anchoVentana >= 0))`.
- **Es EQUIVALENTE, con la cuenta hecha.** El único valor en que las dos
  guardas se comportan distinto es `0`: el original entra y devuelve `true`; el
  mutante NO entra y cae en `0 < 1024`, que también es `true`. Para `NaN` y
  para los negativos ninguna de las dos entra en la rama distinta. Ningún test
  puede matarlo, porque no hay entrada que produzca un resultado distinto.
- **No lo ha introducido esta oleada.** Mi diff sobre `Cabecera-logica.ts` es
  una eliminación pura del bloque de urgencias: `esMovil` queda byte a byte
  igual y sus tests (`Cabecera.test.tsx` @s2/@s3/@s14) no se han tocado. Los 4
  tests que sí borré no ejecutaban `esMovil`, así que no podían matarlo.
  Y al ser equivalente, tampoco lo mataban ANTES: el 100 % de la nota de la
  feature 38 era de una mutación DIRIGIDA al bloque nuevo, no de este fichero.
- **No lo he arreglado, y es deliberado.** Tocar la guarda de `esMovil` es
  reescribir lógica de `cabecera_y_navegacion` @s14 (`done`), sin ningún test
  en rojo que lo pida y fuera de D1-D4/G1-G2. **Decisión para el
  `craftsman_lead`**: o se reescribe la guarda para que la distinción sea
  observable, o se documenta como equivalente — pero `bin/harness mutate` va a
  dar rojo en este fichero mientras no se decida, y no por culpa de esta tanda.

---

## 7. Lo que NO he tocado y alguien tiene que tocar

1. `src/styles/global.scss:241-244` — **punto 21 del informe de
   reconciliación, y es de G1**. Dice por escrito «64px de cabecera + 8px de
   hueco = 72px» y «no hay solape»: lo primero daba 7 y ahora sí da 8, lo
   segundo era falso de `#inicio` y ahora sí es cierto. El comentario describe
   bien el sitio por primera vez, pero la aritmética del 72 sigue mal explicada.
   **Fuera de mi lista de ficheros**; lo dejo dicho en vez de hacerlo.
2. `src/lib/diseno/matrizDeContraste.ts:363` — la cita apunta a
   `Cabecera.module.scss:163-164` (el CTA de urgencias), que ya no existe. Es
   F1 y es de otra oleada.
3. `tests/e2e/fidelidad.spec.ts:149` — su comentario cita
   `Cabecera.module.scss:188`, `pulso-urgencias`, que acabo de borrar. El test
   sigue en verde; el comentario ya no describe nada. Es de otra oleada.
4. `tests/e2e/urgencias.spec.ts:110-113` — ver §4.
5. `tests/e2e/geometria-escalas.spec.ts:277-282` — sus tres citas de número de
   línea de `Cabecera.module.scss` se han desplazado con mis cambios. Los
   localizadores siguen bien y el spec está en verde; solo los comentarios
   quedan corridos.
6. `feature_list.json` — **no lo he tocado**: la 39 sigue en `spec_ready` y no
   me corresponde a mí moverla, ni hay nada que dar por `done` hasta que
   aterricen las cuatro oleadas.
