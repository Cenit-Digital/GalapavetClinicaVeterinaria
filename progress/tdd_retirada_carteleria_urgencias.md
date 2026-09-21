# TDD — feature 39 `retirada_carteleria_urgencias`

> `craftsman_lead`, 21/09/2026. **Este fichero es un ÍNDICE, no un informe
> nuevo.** El TDD de esta feature se hizo en seis oleadas y cada una escribió el
> suyo; lo que faltaba era la puerta de entrada que `CHECKPOINTS.md` C6, tercera
> viñeta, nombra por su nombre: el mapa `@s → test` en
> `progress/tdd_<name>.md`. Lo cazó `progress/judge_39_ronda3.md` §6.1 tras
> comprobar las 39 features `sdd`: **esta era la única sin él.**
>
> Ninguna fila de aquí se ha medido en este fichero. Cada una **cita** la oleada
> que la midió, y esa oleada es la fuente. Si una fila y su oleada no coinciden,
> manda la oleada.
>
> **Se citan ficheros de test y su etiqueta `@s`, NUNCA números de línea**, que
> es la regla de oro del contrato al que este índice sirve
> (`features/retirada_carteleria_urgencias.feature:137-139`). CORREGIDO EL
> 21/09/2026: nació con veintiuna citas de línea, y **cinco de ellas ya
> apuntaban a otro `describe` el día que se escribieron** —cuatro caían dentro
> del escenario ANTERIOR al que decían nombrar, en
> `src/components/PieDePagina.test.tsx`—. El fichero creado para cerrar C6
> incumplía, en su primera versión, la regla del contrato al que sirve. Lo cazó
> `progress/judge_39_ronda4.md` §7.2. Queda contado en vez de borrado, como
> manda esa misma regla.

---

## 0. Por qué seis ficheros y no uno

La feature toca cuatro zonas del sitio (cabecera, contacto, pie y lo
transversal) y se acotó en oleadas de un `tdd_craftsman` cada una, siguiendo la
regla de cuota de subagentes del repositorio. Dos oleadas más nacieron de sendos
rechazos del `judge`, y **conviene que eso quede dicho aquí y no enterrado**:

| # | Fichero | Zona | Por qué existe |
| --- | --- | --- | --- |
| 1 | `progress/tdd_39_oleada1_cabecera.md` | Cabecera | Planificada. D1–D4 y G1 |
| 2 | `progress/tdd_39_oleada2_contacto.md` | Contacto | Planificada |
| 3 | `progress/tdd_39_oleada3_pie.md` | Pie | Planificada |
| 4 | `progress/tdd_39_oleada4_transversales.md` | Matriz, datos, `urgencias.spec.ts` | Planificada |
| 5 | `progress/tdd_39_oleada5_movimiento.md` | `accesibilidad` @s19/@s20 | **REPARACIÓN.** `progress/judge_39.md` encontró que la oleada 4 se acotó a «`movimiento.spec.ts`: solo comentarios», y eso dejó la puerta de @s19 inerte y las tres cláusulas nuevas de @s20 sin ninguna puerta. El error de acotación fue del `craftsman_lead`, no del artesano |
| 6 | `progress/tdd_39_oleada6_rotulos_accesibles.md` | @s1 de este contrato | Nació del noveno contrato, el que el arnés obligó a crear. Es el escenario que Pablo aprobó en la SEGUNDA puerta humana, el 21/09/2026 |

---

## 1. Mapa `@s → test`, consolidado

Nueve contratos tocados. La columna «oleada» dice quién lo midió.

### 1.1 `features/retirada_carteleria_urgencias.feature` — este contrato

| `@s` | Test que lo cubre | Oleada |
| --- | --- | --- |
| `@s1` | `tests/e2e/urgencias.spec.ts`, dentro del `describe` de @s14: «… tampoco rotulada para quien no mira la pantalla». Un solo recorrido de las seis rutas alimenta los TRES censos (texto, enlace, rótulo accesible) | 6 |

El desglose cláusula a cláusula —incluidas las tres guardas de anti-vacuidad que
ya vivían en el test y que ahora también le sirven— está en la oleada 6, §4.

### 1.2 `features/fidelidad_cabecera.feature`

| `@s` | Test que lo cubre | Oleada |
| --- | --- | --- |
| `@s1` | `fidelidad-cabecera.spec.ts` @s1 (columna 1220, marca a la izquierda, **nav a la derecha = D2**, logotipo/nombre/descriptor, **hueco de 4 px = D3**, sin «24 h») + `Cabecera.test.tsx` «el nombre de la marca y su descriptor no se tocan» | 1 |
| `@s2` | `fidelidad-cabecera.spec.ts` @s2 — 8 enlaces, Tienda, 44×44 sobre los ocho con guarda anti-vacuidad, ningún `tel:` | 1 |
| `@s3` | `fidelidad-cabecera.spec.ts` @s3 — 8 destinos, teclado, cierre al navegar, sin desbordamiento | 1 |
| `@s4` | `fidelidad-cabecera.spec.ts` @s4 (sin tolerancia heredada) + `Cabecera.test.tsx` «la franja fija deja sitio a su propio borde». **Nació en rojo a propósito**: el solape real de 1 px | 1 |
| `@s5` | `fidelidad-cabecera.spec.ts` @s5 — dos tests: el de la cabecera en las 6 rutas y el del armazón común | 1 |
| `@s6` | `fidelidad-cabecera.spec.ts` @s6 + los 6 tests de estructura de `Cabecera.test.tsx` | 1 |
| `@s7` | `fidelidad-cabecera.spec.ts` @s7 — 5 variantes, contraste con la fórmula del repositorio — + la puerta de la mezcla en `Cabecera.test.tsx` | 1 |

### 1.3 `features/cabecera_y_navegacion.feature` — RESTAURACIÓN, no contrato nuevo

| `@s` | Test que lo cubre | Oleada |
| --- | --- | --- |
| `@s7` | `Cabecera.test.tsx` — panel: 8 enlaces exactos, ningún nombre con «Urgencias» | 1 |
| `@s13` | `Cabecera.test.tsx` «la cabecera no anuncia urgencias ni contiene teléfonos» — **por primera vez desde el 25/08/2026**: el escenario llevaba un mes aprobado y sin un solo test | 1 |

### 1.4 `features/informacion_contacto.feature`

| `@s` | Test que lo cubre | Oleada |
| --- | --- | --- |
| `@s1` | `InformacionContacto.test.tsx` — 3 grupos, nombres exactos, sin «Email» ni «Urgencias fuera de horario» | 2 |
| `@s5` | **retirado del contrato — SIN PUERTA A PROPÓSITO** | 2 |
| `@s6` | `InformacionContacto.test.tsx` — invertido: ninguna acción «Llamar ahora», 0 ocurrencias del número, ningún `href` de urgencias, y las 5 prohibiciones de reclamo | 2 |
| `@s12` | **retirado del contrato — SIN PUERTA A PROPÓSITO**; sus dos cláusulas viven en el test de @s13 | 2 |
| `@s13` | `InformacionContacto.test.tsx` — 2 grupos en orden, sin `<dl>` vacía, sin marcador de posición, sin `tel:` a medias, con anti-vacuidad nueva sobre la lista de destinos | 2 |

### 1.5 `features/fidelidad_contacto.feature`

| `@s` | Test que lo cubre | Oleada |
| --- | --- | --- |
| `@s1` | `fidelidad-contacto.spec.ts` — cabecera, dos columnas y la prohibición de reclamos reubicada | 2 |
| `@s3` | **retirado del contrato — SIN PUERTA A PROPÓSITO** | 2 |
| `@s5` | `fidelidad-contacto.spec.ts` — orden de lectura, inventario de tarjetas, sin desbordamiento. **El recuento es `> 0`: es el aviso 4 del judge y va a la feature 43** | 2 |

### 1.6 `features/pie_de_pagina.feature`

| `@s` | Test que lo cubre | Oleada |
| --- | --- | --- |
| `@s2` (recuentos) | `PieDePagina.test.tsx` — 3 encabezados en orden, listas de 4 / 4 / 3 `listitem`, 1 `link` por `listitem`, total 11 | 3 |
| `@s2` (Proximidad + Conectividad Uniforme) | `fidelidad-pie.spec.ts` — seis anchos: mismo ancho entre columnas, sin desbordar, misma separación vertical | 3 |
| `@s2` (Semejanza) | `fidelidad-pie.spec.ts` — seis anchos: un único par tamaño-color entre los 11 | 3 |
| `@s2` (Fitts) | `fidelidad-pie.spec.ts` — seis anchos: mismo alto mínimo; la columna corta no baja del de sus hermanas | 3 |
| `@s5` | `PieDePagina.test.tsx` — los dos teléfonos y «Cómo llegar», exactamente 3, con el bucle de dígitos nombre↔destino | 3 |
| `@s6` (enmendado) | `PieDePagina.test.tsx` — ausencia del `href`, del nombre con «Urgencias» y del número en el texto; y ningún `heading` ni `banner` que lo mencione | 3 |
| `@s7` | `PieDePagina.test.tsx` — sin `mailto:` ni «@», y la columna en 3 con los nombres de @s5 | 3 |
| `@s15` (reapuntado) | `PieDePagina.test.tsx` — `telefonoClinica` inválido lanza con el valor recibido y no queda ningún `a[href^="tel:+34"]` | 3 |

### 1.7 `features/rediseno_visual.feature`

| `@s` | Test que lo cubre | Oleada |
| --- | --- | --- |
| `@s7` (par apto) | `matrizDeContraste.test.ts`, 1.º `it` de @s7 — tokens reales ×5 | 4 |
| `@s7` (tech ≥ 6 vs 2.77) | `matrizDeContraste.test.ts`, 2.º `it` de @s7 — no tocado | 4 |
| `@s7` (los dos recuentos = 0 + disparador) | `matrizDeContraste.test.ts`, `it` **nuevo**, nació rojo | 4 |
| `@s7` (fuera de la matriz) | `tokensColor.test.ts` — no tocado | 4 |
| `@s11` (23 filas / 23 claves / 115 parejas) | `matrizDeContraste.test.ts`, bloque de @s11. **Eran 25 y 125: se borraron dos filas huérfanas** | 4 |
| `@s11` (reconciliación con el texto real) | mismo fichero, bloque de reconciliación | 4 |
| `@s14` (corrección de lo que aparezca) | `urgencias.spec.ts`, bucles de rótulo, etiqueta y enlace | 4 |
| `@s14` (6 rutas, nunca lista vacía) | `urgencias.spec.ts`, `rutasRecorridas` | 4 |
| `@s14` (recuento estático = 0, disparador) | `urgencias.spec.ts`, 2 aserciones finales, mordiente comprobada | 4 |
| `@s26` | `accesibilidad.spec.ts` (1024/1023, con el bucle ya no inerte) | 1 |
| `@s28` | `Cabecera.test.tsx` (atributo, mixin en escritorio y en panel, salto al ancla) + `rediseno-visual.spec.ts` | 1 |
| `@s36` | `InformacionContacto.test.tsx` (DOM) y `:395` (SCSS: ni banda, ni animación, ni `@media` de anchura) | 2 |
| `@s52` (ningún compromiso distinto) | `datosDelSitio.test.ts` ×5 + `datos-reales.spec.ts` | 4 |
| `@s52` (6 rutas y catálogo > 0) | `datos-reales.spec.ts` | 4 |

### 1.8 `features/accesibilidad.feature`

| Cláusula | Puerta que la muerde | Oleada |
| --- | --- | --- |
| `:477` (@s19) el recuento sale de los módulos que declaran movimiento, no del documento entero | `movimiento.spec.ts` — `censo.conMovimientoDeclarado > 0` **y** `< totalDeElementos`, con el censo medido SIN la preferencia y reencontrado bajo `reduce` por su marca en el DOM | 5 |
| `:501` (@s20) el inventario se lee del sitio real | `accesibilidad-movimiento.test.ts` — `hojasInspeccionadas === HOJAS_REALES.length > 0` | 5 |
| `:502` (@s20) el recuento es exactamente 0, declarado por escrito | `recuentoDeBloquesQueAparecenAnimando === 0`, con anti-vacuidad delante | 5 |
| `:503` (@s20) si vuelve a subir, la puerta lo caza | el mismo `toBe(0)`, más el `it` que exige hoja y línea del hallazgo | 5 |
| @s19/@s21 (nada se mueve con `reduce`) | `movimiento.spec.ts` (@s42) | 4 |
| @s22 (sin la preferencia el sitio SÍ se mueve) | `movimiento.spec.ts`, `accesibilidad-movimiento.test.ts`, `Equipo.test.tsx` — las tres, no tocadas | 4 |

### 1.9 `features/seo_estructura.feature` y `features/fidelidad_responsive_integral.feature`

| `@s` | Test que lo cubre | Oleada |
| --- | --- | --- |
| `seo_estructura` @s10 | `paginasSeo.test.tsx` — comparación contra el primero y el segundo enlace visibles | 2 |
| `fidelidad_responsive_integral` @s3 | `fidelidad-responsive-integral.spec.ts` — 14 enlaces en el pie, en los cuatro anchos del bucle | 3 |
| `pagina_blog` @s2 | `PaginaBlog.test.tsx` (invertido) | 1 |

---

## 2. Los tres escenarios SIN PUERTA, y que es deliberado

`informacion_contacto` @s5 y @s12, y `fidelidad_contacto` @s3. Los tres
describían la tarjeta roja de urgencias de la sección de contacto. **No se han
dejado sin test por olvido: se han retirado del contrato**, con su nota de
derogación en el propio `.feature`, porque describen algo que el sitio ya no
tiene. Un test que los cubriera solo podría ser un test de ausencia, y esa
ausencia ya la muerden @s6 y @s13 en el mismo fichero.

Queda escrito aquí porque un índice que solo listara filas verdes haría pensar
que la cobertura es total, y no lo es: es total **salvo estas tres, a propósito**.

---

## 3. Lo que este índice NO acredita

- **No acredita la mutación.** Eso es C7, y la evidencia vigente es
  **`progress/mutation_39_ronda3.md`** (21/09/2026, 20:30-20:50): la corrida de
  `datosDelSitio.ts` y `matrizDeContraste.ts`, los dos módulos que
  `progress/judge_39_ronda3.md` §4 reclamó y que las rondas 1 y 2 nunca
  midieron. **487 mutantes, 485 muertos, 2 supervivientes**, y los dos son los
  equivalentes ya justificados por escrito en
  `progress/mutation_rediseno_visual.md` §4.6, desplazados +4 líneas porque
  esta feature agrandó la cabecera de comentarios del fichero. `# timeout` = 0,
  leído antes que el score. `progress/mutation_39.md` (45 mutantes, 2 módulos)
  y `progress/mutation_39_ronda2.md` son historia: **la evidencia vigente es la
  última, no la primera.**
- **No acredita la revisión.** Eso es el `judge`, y la vigente es
  **`progress/judge_39_ronda5.md` — APPROVED**, del 21/09/2026. Son CINCO
  rondas: las cuatro anteriores (`progress/judge_39.md`, `_ronda2`, `_ronda3`,
  `_ronda4`) son `CHANGES_REQUESTED` y no acreditan nada. La vigente es siempre
  la última.
  CORREGIDO DOS VECES, y las dos por lo mismo: (1) nació diciendo «la vigente
  es la ronda 3, las dos anteriores son RECHAZOS», escrito trece horas después
  de ese rechazo, dando a entender que la revisión vigente aprobaba la feature
  cuando ninguna lo había hecho —lo cazó `judge_39_ronda4.md` §7.2—; (2) la
  corrección dijo «las CUATRO son `CHANGES_REQUESTED`», cierto al escribirla y
  caduco en cuanto llegó la quinta. Se corrige contando lo que decía, no
  fingiendo que no lo dijo.
- **No acredita que la maquetación se vea bien.** El arnés en verde no prueba
  la maquetación: hay que renderizar y comparar. Hecho el 21/09/2026 sobre
  `dist/` reconstruido y servido:
  **`progress/verificacion_navegador_20260921.md`**. De ahí salieron dos cosas
  que NO son de esta feature y quedaron registradas en vez de arregladas: el
  ritmo del nav (feature 46, con puerta humana) y la igualdad accidental de los
  dos botones del hero.
