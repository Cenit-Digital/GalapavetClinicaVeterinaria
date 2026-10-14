# Review — feature 48 `hero_reducido_con_animacion`

**Veredicto:** CHANGES_REQUESTED

`judge`, 14/10/2026, sobre el commit `2267262` (HEAD; árbol de trabajo limpio al empezar y al acabar; todos los sabotajes
restaurados byte a byte con `cmp`). **El código y las pruebas no tienen ningún defecto bloqueante**: los 12 `@s` tienen un test
que muerde, los cuatro mutantes del ayudante mueren con la página que dice el contrato, las tablas de filas sintéticas fallan
de verdad contra su módulo y `bin/harness init` y `pnpm run test:e2e` salen con 0. **Una sola condición de cierre, documental**
(C6, primera casilla): `project-spec.md` no tiene sección de la feature 48 y su entrada de `fidelidad_hero` sigue describiendo
el hero antiguo y nombrando como vivo un módulo que ya no existe (hallazgo H1, `importante`, arreglo de minutos). El resto son
dos hallazgos `menor` (H2, H3) y una confirmación de un límite que la ola 2B ya había declarado (H4).

## Salidas de las puertas que el contrato pide citar (@s4)

| Orden | Resultado |
| --- | --- |
| `bin/harness init` | **EXIT 0** (lint sin errores, `tsc -b` sin errores, `vitest run`: 90 ficheros, 1748 pruebas, 0 fallidas, 0 omitidas; `feature_list.json` válido, 50 features) |
| `pnpm run test:e2e` (una sola vez, con el 4173 libre antes y después) | **EXIT 0**: `267 passed (1.2m)`; JSON del reporter: `expected 267, skipped 0, unexpected 0, flaky 0`, 0 reintentos, `css-presupuesto.spec.ts` presente (2 pruebas) |
| `pnpm run build` | EXIT 0, sin avisos de TypeScript ni de Vite (`built in 858ms`; puerta de terceros: 3 ficheros, 0 referencias) |
| `pnpm run lint` | EXIT 0, 0 errores, 0 avisos (`--deny-warnings`) |
| `tsc -p tsconfig.e2e.json --noEmit` | EXIT 0 |
| `pnpm run test:config` | EXIT 0, 5/5 |
| grep de `.skip`, `.only`, `.fixme`, `.todo`, `test.slow`, `@ts-ignore`, `console.log`, `debugger` en `src/` y `tests/` | 0 coincidencias reales |

La mutación (`bin/harness mutate`) NO se ha ejecutado: es del `mutation_tester`, después de este informe.

Orden real de la sesión: `bin/harness init` (EXIT 0) y los sabotajes de Vitest y de navegador; después `pnpm run test:e2e` UNA vez (EXIT 0, 267); y, tras el último sabotaje restaurado con `cmp`, `bin/harness init` OTRA VEZ como última orden (EXIT 0, 90 ficheros y 1748 pruebas). Ningún servidor quedó escuchando (4173 y 4191 libres); los sabotajes se aplicaron uno a uno sobre el árbol de trabajo con copia previa y `git status` limpio tras cada restauración.

## Cobertura de escenarios (@s ↔ test)

Fichero y nombre. Leí cada test y comprobé las cláusulas, no solo que existiera uno con el nombre.

### `features/hero_reducido_con_animacion.feature`

- @s1: [x] `src/components/Hero.test.tsx`, describe «@s1 de hero_reducido_con_animacion…» («la sección real cumple todas las cláusulas y se recorren elementos de verdad», «el encabezado, el párrafo y el enlace tienen el nombre, el texto y el destino exactos…» y 6 mordidas: píldora, «Llamar», franja, cifras, dígito suelto, quitar botón o párrafo, segunda imagen). En navegador: `fidelidad-hero.spec.ts` (tres elementos H1, P, A).
- @s2: [x] `tests/e2e/hero-reducido.spec.ts`, describe «@s2 de hero_reducido_con_animacion…» (3 pruebas: la real, con recuento 0 dentro, guarda de texto del hero mayor que 0 y FAQ en secuencia con `textoHorario` importado de `Faq-logica`; y 2 de mordida con la píldora sintética leída por `textContent` frente a `innerText` en mayúsculas).
- @s3: [x] `Hero.test.tsx`, describe «@s3 de hero_reducido_con_animacion…» (5 pruebas y `it.each` de mordida sobre `restosEnElComponente` y `restosEnLaHoja`; la superficie de Stryker se lee de `stryker.config.json`).
- @s4: [x] ejecución (tabla de arriba) · [ ] mutación y equivalentes por escrito: pendiente del `mutation_tester` · [x] Decisión 31 actualizada (`project-spec.md:118`: tres pasos 150/300/700, retardos 0/120/240, `ease-out`, y el párrafo «Ampliación del 14/10/2026» coincide con `identidad_visual` @s16; la nota de «fuera de alcance» de la feature 22 también).
- @s5: [x] `hero-reducido.spec.ts`, describe «@s5 …: con movimiento permitido…» (1 real, reloj congelado ANTES del `goto`) y «la comprobación muerde» (18 defectos sintéticos) más `Hero.test.tsx`, describe «@s5-@s8… en lo que se lee de la hoja». **Excepción: «las tres empiezan en el mismo instante» es una tautología con el reloj congelado** (ver H3).
- @s6: [x] `hero-reducido.spec.ts`, describe «@s6 …» (2 reales: `reduce` con observador de fotogramas instalado antes del `goto`, y la contraria con `no-preference` que encuentra las 3) más 6 sintéticas y la consulta muerta; y `movimiento.spec.ts`, «@s19 de accesibilidad…».
- @s7: [x] `hero-reducido.spec.ts`, describe «@s7 …» (1 real con la guarda de que antes de cancelar había 3; 7 sintéticas y una de `aria-hidden`). «Recuento de elementos comprobados exactamente 3» se cumple por construcción (un objeto de tres claves; si falta un elemento la medida lanza): inocuo.
- @s8: [x] `src/lib/diseno/movimientoRespetuoso.test.ts`, «hero_reducido_con_animacion @s8 (tabla de 22 filas del contrato)» (cada fila compara las líneas señaladas, `pasa` y los dos recuentos) y «sobre las 20 hojas reales del inventario» (20 ficheros, guardas mayores que 0).
- @s9: [x] `hero-reducido.spec.ts`, «@s9 …» (9 casos y 4 sintéticas) y `hero-entrada-cls.spec.ts`, «@s9 …: sin congelar el reloj…» (6 rutas; la portada anclada en `esperarEntradaTerminada` y al menos 1500 ms tras `load`) con 3 sintéticas del CLS (incluye el salto a 1200 ms).
- @s10: [x] `medicionEstable.test.ts` (tabla de 16 filas) y `medicionEstableSpecsReales.test.ts` (4 pruebas) y `esperar-entrada-terminada.spec.ts` (8 pruebas contra páginas sintéticas).
- @s11: [x] `tests/e2e/lcp-hero.spec.ts` (2 medidas reales de 5 cargas y 18 de mordida) y `progress/lcp_hero_despues_20261014.md` (documentales leídas, abajo).
- @s12: [x] `hero-reducido.spec.ts`, «@s12 …» (5 tamaños y 812×300 con la premisa en voz alta) y `Hero.test.tsx`, «@s12 … (lo que se lee de la hoja)».

### Enmiendas en los otros `.feature`

- hero @s1, @s2, @s3, @s7, @s8, @s13: [x] `Hero.test.tsx`, describes homónimos (@s13: 2 pruebas, con enlaces mayor que 0). hero @s14: [x] `fidelidad-hero.spec.ts`, «@s14 de hero…» (2).
- fidelidad_hero @s1, @s2, @s3: [x] `fidelidad-hero.spec.ts`, «@s1 / @s2 / @s3 de fidelidad_hero…» (carga con `reduce` ANTES del `goto`: vía b).
- rediseno_visual @s18: [x] `Faq.test.tsx`, «@s18 (rediseno_visual)…» (860 menor que 1220, el 900 escrito a mano retirado). @s33: [x] `fidelidad-hero.spec.ts`, «@s33 de rediseno_visual…» (real y mordida). @s29 (sin cambio): [x] `Hero.test.tsx`, «@s29…».
- accesibilidad @s19: [x] `movimiento.spec.ts`, «@s19 de accesibilidad…» (y el `@s42` existente). @s20: [x] `src/lib/accesibilidad-movimiento.test.ts`, «@s20…» (inventario real y tabla de 8). @s21: [x] mismo fichero, «@s21 (parcial, pura)». @s22: [x] `movimiento.spec.ts`, «@s22 de accesibilidad…» (3 pruebas).
- identidad_visual @s16: [x] `escalaMovimiento.test.ts`, «identidad_visual @s16…» (tabla de 30 filas, 20 ficheros). @s23: [x] `tipografia.spec.ts`, «@s23…» (h1, primer párrafo y párrafo de apoyo de Servicios; comprueba que las peticiones de fuente se abortaron y que las dos familias quedan en error).

Cláusulas `Then/And` que ningún test puede poner en rojo: «las tres empiezan en el mismo instante» (@s5, H3); «recuento exactamente 3» de @s7 (por construcción, inocuo); las marcadas «lo verifica el judge» de @s4, @s10 y @s11 (las verifico aquí); mutación y mutantes equivalentes por escrito (pendientes).

## Sabotajes ejecutados (cada uno con copia previa en el scratchpad y `cmp` tras restaurar)

### (a) @s10, los cuatro mutantes del ayudante `tests/e2e/entrada-del-hero.ts`

Corrida sobre `esperar-entrada-terminada.spec.ts` con un `playwright.config` propio sin servidor (las páginas son sintéticas).

| Mutante (diff) | Resultado |
| --- | --- |
| «tope inexistente»: `{ timeout: topeMs }` por `{ timeout: 0 }` (2 sitios) | **ROJO por la razón correcta**: la página de 30 s da `Received promise resolved instead of rejected`; la del hero que nunca se monta agota los 60 s del test (espera infinita) |
| «sin ancla»: se quita `await esperarAlAncla(page, topeMs)` | **ROJO** (5 pruebas): la del montaje tardío, con `titular: Expected true, Received false`; también 30 s, nunca se monta y contexto |
| «espera una sola»: `registro.fines >= registro.arranques` por `registro.fines >= 1` | **ROJO** (2): montaje tardío y contexto, `Expected: 3, Received: 2` (margen de 60 ms entre el segundo y el tercer fin, por diseño de la página) |
| «lee getAnimations()», variante B (ancla y fin leen `document.getAnimations()`) | **ROJO** (2): la de las animaciones YA terminadas, `se agotó el tope de 3000 ms… (titular: true, arranques: 3, fines: 3)` |
| «lee getAnimations()», variante A (solo la segunda espera: `getAnimations().length === 0`) | **sobrevive (8/8)**. Casi equivalente: con el ancla leyendo el registro, tras `arranques >= 3` solo difiere si hay una animación o transición AJENA al hero. No es un hueco del contrato (el mutante de la tabla es la variante B); queda dicho para el `mutation_tester` |

### (b) @s10, la comprobación estática contra los specs REALES (`medicionEstableSpecsReales.test.ts`, rojo en 3 de sus 4 pruebas)

| Sabotaje en el spec real | Resultado |
| --- | --- |
| `fidelidad-hero.spec.ts`: se quita `emulateMedia(reduce)` de `cargarPortada()` (función local) | ROJO: 5 bloques de `fidelidad-hero` incumplen; «la obligación de @s10 no alcanza a fidelidad-hero» |
| `fidelidad-responsive-integral.spec.ts`: `emulateMedia` movido DESPUÉS del `goto` en `cargarPortada()` | ROJO: «cada 16px entre 320 y 1600…» incumple |
| `tipografia.spec.ts`: se quita `emulateMedia(reduce)` antes del primer `goto` | ROJO: el bloque de @s23 incumple |
| `accesibilidad.spec.ts` @s45: `emulateMedia` dentro del bucle y DESPUÉS del `goto` | ROJO: «las 5 variantes × 6 rutas…» incumple |
| `accesibilidad.spec.ts` @s38 o @s39: se quita `esperarEntradaTerminada` de la iteración de la portada | **VERDE (4/4)**: la comprobación estática no los alcanza (H4). Quitada la de @s39 y corrido en navegador 3 veces, también pasan 3/3 |

### (c) Tablas de filas sintéticas contra el módulo real (no por vacuidad)

| Tabla y módulo | Sabotaje | Resultado |
| --- | --- | --- |
| @s10 (16 filas: 8 incumple, 4 pasa, 4 exento), `medicionEstable.ts` | `veredictoDelBloque` devuelve siempre `pasa`, siempre `incumple` o siempre `exento` | ROJO en **12 / 8 / 12** filas, exactamente las que no coinciden |
| @s8 (22 filas), `movimientoRespetuoso.ts` | `pasa: true`; `estaEnNoPreference` siempre `true`; `estaEnUnaConsultaAjena` siempre `false`; `animation-delay` fuera del conjunto | ROJO en 15, 15, 3 y 5 pruebas |
| identidad_visual @s16 (30 filas), `escalaMovimiento.ts` | `pasa: true`; admite 1250 ms; `animation-delay` sin papel; segundos ignorados | ROJO en 21, 4, 6 y 8 pruebas |
| accesibilidad @s20 (8 filas), `accesibilidad-movimiento.ts` | `pasa: true`; el `@keyframes` cuenta como base invisible; base invisible nunca detectada; toda hoja autorizada | ROJO en 5, 8, 9 y 4 pruebas |

### (d) @s5 a @s7 y @s12, sobre `src/components/Hero.module.scss` (build real y Playwright con `CI=1`, un trabajador)

| Sabotaje | `Hero.test.tsx` (sin build) | Navegador |
| --- | --- | --- |
| `fill-mode both` (x3) | ROJO (hoja) | ROJO @s5: `relleno del efecto: ["both"…] y debe ser ["backwards"…]` y relleno computado |
| retardo `130ms` | ROJO | ROJO @s5: `retardos: [0,130,240]… instantes de fin: [700,830,940]` |
| curva `ease` (x3) | ROJO | ROJO @s5: curva computada y de los fotogramas |
| `translateX(40px)` | ROJO | ROJO @s5: `la caja está -40 px… y debe estar 40` (la dirección se mide por geometría) |
| `opacity: 0` en el estado base de `.acciones` | ROJO | ROJO @s5, @s7, @s6 y accesibilidad @s22 |
| `animation` del titular fuera de `no-preference` | ROJO | ROJO @s6 y accesibilidad @s19 (el nombre computado del titular es `_entrada-del-hero_3mycl_1` y no `none`) |
| `min-height: clamp(560px, 84svh, 784px)` | ROJO | ROJO @s12: `Expected <= 0.5, Received 144` |
| `height: 100svh` | ROJO | ROJO @s12 (recorta a 812×300) |
| `align-items: start` | sin cobertura en Vitest (no es lo que lee) | ROJO @s12: huecos desiguales, `Received 428.7` |

Con `both`, como dice el contrato, en navegador cae solo la cláusula del relleno de @s5 (más la lectura de la hoja en Vitest).

## Disciplina TDD

- ¿Producción sin test que la pida? **NO.** `Hero.tsx` solo pierde elementos; `Hero.module.scss` añade el bloque de entrada que piden `Hero.test.tsx` y las pruebas de navegador (selectores, valores y estado base fijados por la hoja real); los `data-hero-*` que quedan los usan los specs; `medicionEstable.ts`, `lectorDeEstilos.ts` y `entrada-del-hero.ts` tienen cada uno su prueba (la del ayudante, aislada contra páginas sintéticas). Misma configuración de Stryker, mismo `package.json` y `pnpm-lock.yaml`: ninguna dependencia nueva.
- ¿Evidencia de Rojo→Verde→Refactor? **SÍ.** Cada informe de ola trae su tabla de ciclos con la columna ROJO (qué falló y por qué), y los verdes de inicio están declarados como tales con su mordida por sabotaje (ola 1A ciclos 6-8; ola 2A ciclo 5: «no era un fallo del código, era mi expectativa»). Los 21 sabotajes de la ola 2A y los de la 2B los reproduzco por muestra arriba.
- Colocación: `docs/architecture.md` y `docs/conventions.md` son la plantilla sin rellenar, así que el estándar vigente es la sección «Arquitectura» de `project-spec.md`: módulos puros en `src/lib/diseno/` (superficie de Stryker, 100 %), el ayudante de navegador en `tests/e2e/` fuera de `src/` (Decisiones 11, 37, 38) y pruebas co-locadas. Correcto.

## Calidad (lente de artesano)

- Funciones cortas y nombres reveladores en `medicionEstable.ts`, `lectorDeEstilos.ts`, `escalaMovimiento.ts`, `movimientoRespetuoso.ts`, `accesibilidad-movimiento.ts` y `entrada-del-hero.ts`; las constantes con nombre (`LARGO_DE_UN_ESCAPE`, `CLAVE_DEL_REGISTRO`) evitan números mágicos. El ayudante falla con un mensaje propio y accionable (tope, registro sin instalar) en vez de medir a ciegas.
- Menor, sin acción pedida: `incumplimientosDeLosValoresAprobados` (`hero-reducido.spec.ts`) es una función de unas 70 líneas con muchas cláusulas; legible porque cada una es una línea `comparar(...)`.
- Límite ya declarado en la cabecera de `medicionEstable.ts`: lectura textual (el `if (ruta === RUTA_DE_LA_PORTADA)` que envuelve la espera en @s38 y @s39 no se evalúa).
- Sin logs de depuración, sin TODO, sin `@ts-ignore`.

## Hallazgos

### H1 — `importante` — La documentación del proyecto no está al día y falta la sección de la feature (C6, primera casilla)

1. `project-spec.md` no tiene sección de la feature 48 (solo están la Decisión 31 y la nota de la 22, que sí están bien): `git grep -n -i -e hero_reducido -e "feature 48" HEAD -- project-spec.md` devuelve únicamente la línea 118. `CHECKPOINTS.md` C6 exige «una sección en `project-spec.md`» para toda feature `sdd: true` en `in_progress`, y la propia historia del repo lo trata como bloqueante (la primera ronda del judge de la 39 rechazó, entre otras cosas, por «esta misma sección sin escribir»). Las decisiones viven hoy en `progress/decisiones_cabecera_hero_20261013.md`.
2. `project-spec.md:1071-1074` (entrada «28 `fidelidad_hero`») describe el hero antiguo —«píldora de localidad… dos botones… banda inferior… con las cifras derivadas de la fuente única que ya define `Hero-logica.ts`»— y nombra como vivo un módulo que la 48 borra. La entrada de la 27 ya muestra el patrón correcto («ACTUALIZACIÓN (20/09/2026, feature 39)»).
3. La nota de la feature 48 en `feature_list.json` conserva «Riesgo conocido: … el contrato debe decir como se miden», que el contrato ya dice (@s10), y no refleja que las olas están hechas ni la puerta humana de LCP pendiente.

- **Cómo reproducirlo:** el `git grep` de arriba; `git show HEAD:project-spec.md | sed -n 1071,1074p`; `grep -n "Riesgo conocido" feature_list.json`.
- **Arreglo propuesto:** añadir en `project-spec.md` una sección corta «Hero reducido con animación — feature 48» (decisiones P1 y P5, escala de movimiento, la regla de `no-preference`, alcance y evidencia, con enlace a `progress/decisiones_cabecera_hero_20261013.md` y a los informes de las olas); añadir una «ACTUALIZACIÓN (13-14/10/2026, feature 48)» a la entrada 28; poner al día la nota de `feature_list.json`. Solo documentos: lo puede hacer el `craftsman_lead` sin pasar por el `tdd_craftsman`.

### H2 — `menor` — Comentarios que afirman que `src/` no declara ninguna `animation:` (falso desde la 48) y un encabezado del `.feature` que dice «no firmado»

- `tests/e2e/fidelidad.spec.ts:58-59` y `:153-160` («SE CONSERVA EL "reduce" AUNQUE YA NO HAYA NINGUNA ANIMACIÓN… en `src/` no queda ninguna declaración `animation:`»), `tests/e2e/movimiento.spec.ts:64-66` («no queda ninguna `animation:` en `src/`») y `tests/e2e/accesibilidad.spec.ts:329-331`. Justo debajo de `movimiento.spec.ts:66` hay un AVISO que sí lleva «revisado el 14/10/2026, feature 48» y esas líneas quedaron sin revisar; ningún informe de ola las declara como mantenidas a propósito (miré el de la 3B y `gherkin_48_resumen.md`).
- `features/hero_reducido_con_animacion.feature:6-8` («ESTADO: BORRADOR… Nada de lo que sigue está firmado todavía») y `:126-128` («PENDIENTE La firma de ESTE fichero»): el contrato está firmado desde el 13/10/2026 (`git show 952212e`).
- **Cómo reproducirlo:** `git grep -n -e "no queda ninguna" -e "YA NO HAYA NINGUNA" -e "sin ninguna declaración" HEAD -- tests` y `git grep -n -e BORRADOR -e "PENDIENTE   La firma" HEAD -- features/hero_reducido_con_animacion.feature`.
- **Arreglo:** reescribir esas líneas (solo comentarios; en el `.feature` solo líneas que empiezan por `#`, sin tocar un solo `Scenario`) con «hasta la 48» o con lo cierto hoy.

### H3 — `menor` — «Las tres empiezan en el mismo instante» (@s5) se puede probar de verdad; hoy es una tautología

- Juicio: como cláusula documental es honesta (el comentario de `hero-reducido.spec.ts` lo dice y la ola 2A lo declaró en su desvío 10), pero la aserción `comparar("empiezan en el mismo instante", new Set(inicios).size, 1)` no puede ponerse en rojo (con el reloj congelado `startTime` vale 0 para toda animación) y conviene no dejarla como si comprobara algo.
- **Prueba real, medida por mí** (spec de un solo uso en el scratchpad, fuera del repo): sin congelar el reloj, un `animationstart` en fase de captura, instalado con `addInitScript`, que en el PRIMER arranque (el titular, retardo 0) guarda `document.getAnimations()` filtrado por `CSSAnimation` con sus `startTime`. Portada REAL: 3 animaciones con `startTime` 97.587 las tres, y la comprobación pasa. Hero sintético con el botón montado 300 ms DESPUÉS (otro commit): 2 animaciones, y la misma comprobación se pone en rojo. Control sintético sano: 3 y un solo `startTime`, pasa. No depende del reloj de la máquina porque se lee DENTRO del primer `animationstart`.
- **Arreglo propuesto (opcional):** sustituir esa aserción por esa prueba en `hero-reducido.spec.ts` y quitar la línea tautológica.

### H4 — CONFIRMACIÓN, no hallazgo nuevo (no va al esquema de hallazgos) — La comprobación estática de @s10 no alcanza a `accesibilidad` @s37, @s38 y @s39; la espera que se les añadió no la vigila nadie (ya declarado en la ola 2B, desvío 2 y apartado 6.4; lo confirmo y lo mido)

- Con la comprobación sobre el texto real de `accesibilidad.spec.ts`, de 10 bloques solo 2 salen `pasa` (@s36 y @s45); @s17, @s37, @s38 y @s39 salen `exento` (miden por `SELECTOR_INTERACTIVO` o `elementFromPoint`, sin `[data-hero-`, `h1` ni «Reservar cita»).
- Quitar `esperarEntradaTerminada` de @s38 o de @s39 deja `medicionEstableSpecsReales.test.ts` en **verde 4/4**, y @s39 sin la espera pasa **3 de 3** en navegador (la entrada ya ha terminado cuando el Tab llega al botón). Hoy ningún test mide con la entrada en curso y pasa (lo que el contrato pide verificar al judge), pero la guarda de esas dos esperas es solo una convención.
- **Cómo reproducirlo:** quitar de @s39, en `tests/e2e/accesibilidad.spec.ts`, el bloque `if (ruta === RUTA_DE_LA_PORTADA)` que llama a `esperarEntradaTerminada`, y correr `pnpm exec vitest run src/lib/diseno/medicionEstableSpecsReales.test.ts` (verde) y, con `CI=1`, `pnpm exec playwright test accesibilidad` filtrando por @s39 (verde). Con las dos esperas quitadas, `tsc -b` falla por el import sin usar.
- **Arreglo:** o se amplía el criterio textual de `medicionEstable.ts` (p. ej. el selector interactivo que incluye el botón del hero) con su fila en la tabla, o se anota en el informe que @s37 a @s39 quedan fuera por diseño. Decisión del `craftsman_lead`: el contrato firmado cuenta 4 de 27 ficheros, que ya se cumple por @s36 y @s45.

## Cláusulas documentales de @s11 (leídas en `progress/lcp_hero_despues_20261014.md` y `progress/lcp_hero_linea_base_20261013.md`)

- Elemento candidato en cada carga: [x] tablas de los apartados 3, 4 y 10 (`IMG` en las 20 pasadas, con el `SPAN` de la cabecera como candidato previo en varias).
- Cierre de la animación y LCP medido: [x] apartado 6: en la 48 sola la cláusula **no aplica** (el candidato final es la foto, que no se anima) y lo dice con el porqué; el experimento con la foto abortada registra cierre y LCP de 15 candidatos animados (2-22 ms después del cierre; 824 ms en escritorio y 928 ms en móvil).
- Medianas junto a las del MISMO entorno y sin comparar entornos: [x] el apartado 5 compara solo con la línea base LOCAL (132 y 120 ms) y dice expresamente que 264 y 236 ms son otro entorno.
- Si la mediana de después es peor, el informe lo dice y la feature NO se cierra sin que Pablo lo vea: [x] el informe reconoce la ejecución 1 de escritorio PEOR (164 frente a 132 ms, +32 ms) y NO la sustituye por la remedida del lead en reposo (116 y 128 ms, ninguna peor), que añade en el apartado 10 con su explicación; el apartado 9 lo deja para Pablo.
- Aviso honesto: el límite del apartado 7 (la ventana de observación de unos 2 s no ve un retardo de entrada de 3 s) es real y es de la 49, no de la 48.

## Puertas humanas pendientes (NO son motivo para rechazar el código)

1. **Visto bueno de Pablo sobre las cifras de LCP** (@s11): sigue pendiente; el `craftsman_lead` se las va a presentar. Que la ejecución 1 saliera peor que la línea base (+32 ms, con otro agente ejecutando Vitest en paralelo) y las remedidas en reposo no, está escrito; la decisión es suya. La feature no debe pasar a `done` sin ello.
2. Antes de cerrar la 49: Pablo debe ver el apartado 6 (824 y 928 ms con la foto fuera de juego) y el límite de observación del apartado 7 (la 49 necesita un suelo de observación: cambio de contrato).
3. Vetos de valores por defecto: Pablo dio su firma («Sí, firmo ambos») sin vetar ninguno.

## Sin verificar en documentación oficial

- Que `Animation.setPlaybackRate` de CDP sea por contrato la velocidad del reloj del documento y su persistencia entre navegaciones (medido en Chromium 151: funciona; el reloj congelado se comprueba además por `currentTime` 0 en la prueba de @s22).
- Que `startTime` coincida para animaciones creadas en el mismo recálculo de estilos (lo medí, H3, pero no leí la especificación de Web Animations).
- La especificación de LCP (apartado 4.3) y el umbral de 2,5 s de web.dev: citados por el contrato, no consultados (sin internet).

## Checkpoints

- C1: [x] ficheros base y docs presentes; `bin/harness init` EXIT 0.
- C2: [x] una sola feature `in_progress` (la 48); [x] las `done` con tests que pasan (1748 y 267); [x] `progress/current.md` describe la sesión activa.
- C3: [x] `src/` solo con módulos previstos por `project-spec.md` (sección «Arquitectura»; `docs/architecture.md` y `docs/conventions.md` son la plantilla sin rellenar); [x] sin dependencias nuevas; [x] sin logs de depuración ni TODO.
- C4: [x] cada módulo nuevo con su test; [x] aislamiento real (texto real de las hojas con `?raw`, navegador real, `dist/` real, sin simular el sistema de ficheros); [x] `bin/harness test` con más de 0 pruebas y verde.
- C5: [x] sin ficheros sospechosos sin trackear (`git status` limpio, artefactos en `.gitignore`); [ ] `progress/history.md` sin entrada de esta sesión (corresponde al cierre: la feature sigue `in_progress`); [x] la feature en su estado correcto.
- C6: [ ] **sección en `project-spec.md`** (H1) · [x] `.feature` con `@s1` a `@s12` y cada `Then` medible · [x] cada `@s` con test concreto · [x] ninguna producción sin test.
- C7: **pendiente: lo valida el `mutation_tester`** (`bin/harness mutate`, 100 % sobre mutantes no equivalentes; los equivalentes por escrito en `progress/mutation_hero_reducido_con_animacion.md`). Nota para él: la variante A del mutante «lee getAnimations()» (solo la segunda espera) sobrevive en navegador y es casi equivalente; `tests/e2e/**` y los `*.test.ts` no están en su superficie.

## Cambios requeridos

1. (H1, `importante`) Escribir la sección de la feature 48 en `project-spec.md`, la «ACTUALIZACIÓN» de la entrada 28 y poner al día la nota de `feature_list.json`. Solo documentos.
2. (H2 y H3, `menor`; H4 es solo una confirmación) A criterio del `craftsman_lead`; ninguno bloquea. Si se hace H2, que sea en el mismo paso que H1 (también solo comentarios).

Tras el punto 1 basta una relectura de `project-spec.md` y de la nota de `feature_list.json`: no hace falta repetir los sabotajes ni la corrida de navegador, que no dependen de documentos.
