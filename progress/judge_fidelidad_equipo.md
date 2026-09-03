# Review — feature 31 `fidelidad_equipo`

**Veredicto:** APPROVED (con defectos menores; cierre condicionado a `bin/harness init` en verde y a la mutación)

Fecha: 03/09/2026. Juez independiente. Base revisada: `features/fidelidad_equipo.feature` (@s1–@s4),
`progress/tdd_fidelidad_equipo.md`, `progress/fidelidad/delta_equipo.md`, `progress/fidelidad/enmiendas_equipo.md`,
`project-spec.md` («Fidelidad visual de la portada», invariantes y Decisiones 61–67), tramo T4 del handoff
(`convergencia_visual_v2.feature` @s19–@s21), `inventario_red_seguridad.md`, `CHECKPOINTS.md`, el `git diff HEAD` de los
ficheros de la sección (`Equipo.tsx`, `Equipo.module.scss`, `Equipo-logica.ts`, sus dos tests, `src/data/equipo.ts`,
`features/equipo.feature`, `docs/datos-galapavet.md`) y `tests/e2e/fidelidad-equipo.spec.ts` (nuevo), más una sonda
propia de estilos computados y capturas de `#equipo` (cerrado/abierto a 1440 y 390) contra el `dist/` fresco
(19:22:36, posterior a los tres fuentes de Equipo) y el prototipo renderizado con su `support.js` (6 tarjetas).

## Puertas ejecutadas

| Puerta | Resultado |
| --- | --- |
| `pnpm run lint` | verde |
| `pnpm run typecheck` | verde |
| `pnpm exec vitest run Equipo.test.tsx Equipo-logica.test.ts src/lib/diseno` | 23 ficheros / 417 tests verdes (puertas de estilos incluidas: matriz, movimiento, escala, acento, inventario, roles) |
| `bash bin/harness init` | **ROJO, ajeno a la sección**: 1366/1370; los 4 rojos son `src/components/InformacionContacto.test.tsx` (3, @s9 y @s4 de `fidelidad_contacto`, fichero modificado por el artesano de contacto) y `src/lib/puertaTelefonoHardcodeado.test.ts` (5 teléfonos en `src/` en vez de 3: proviene del árbol de contacto). Los 63 tests de Equipo pasan dentro de la suite |
| `playwright test tests/e2e/fidelidad-equipo.spec.ts --workers=1` | 4/4 verde (preview vivo en :4173) |
| Transversales que localizan `#equipo` (geometria-escalas, layout, datos-reales, red-limpia, movimiento, css-presupuesto, fidelidad, tokens-aplicados) | 50/52: los 2 rojos son `fidelidad` @s44 a 320 px (elemento que sobresale = `span._textoSoloLectores` «Abrir menú» de la **cabecera**, derecha 326; verificado con sonda: ningún elemento de `#equipo` sobresale) y `geometria-escalas` @s22 (`#servicios article h3` a 1,15, **Servicios**). Coincide con la atribución del artesano |
| CSS servido | `dist/assets/index-CmLh3Jml.css` 70 909 B crudo; `css-presupuesto` @s49 verde bajo el techo de 12 000 B |

## Medida en pantalla (sonda a 1440 px contra `dist/`)

- Banda `#equipo`: fondo `rgb(248,250,252)` = `--color-fondo` (alternancia de la Decisión 64); sección 1220 px en x=110.
- Cabecera `[data-equipo-cabecera]`: 640 px centrada (x=400–1040); cintillo «EQUIPO» 12,8 px `rgb(4,120,87)` = `--color-acento-tinta`, tracking 1,536 px, 12 px de aire; h2 «Nuestro equipo» 46 px / 600 / `rgb(11,27,51)` = `--color-tinta`; párrafo «Dos profesionales en el equipo de Galapavet. Pulsa el + para ver la formación publicada.» 16 px `--color-texto-suave`, 16 px por encima.
- Rejilla: `390.66px 390.67px 390.66px`, `gap 24px`, `margin-top 48px`; 2 tarjetas en las pistas 1–2, tercera vacía (`auto-fill`).
- Tarjeta: 391×389/390 px cerradas (misma altura), radio 24 px, superficie blanca; panel `[data-equipo-panel]` 389×291 px, ratio **1,333**, fondo `rgb(30,64,175)` = `--color-primario`, sin `img`; avatar 96×96 px centrado (x=257 en tarjeta 110–501), acento suave/acento tinta, 31,25 px.
- Fila: h3 20 px / 600 / tinta (`line-height` 24 px = 1,2); cargo 12,8 px / 400 / texto suave, 4 px bajo el nombre; botón 48×48, `border-radius 50%`, borde 1 px `--color-borde`, acento suave/acento tinta, glifo 25 px, solo en Marcos.
- Abierto: botón `rgb(30,64,175)` / blanco, `matrix(0.707…)` = 45°; ficha con `1px solid` superior, `padding 16px 0 4px`, texto 16 px `--color-texto`; alturas 481 / 390 (la vecina no se estira).
- A 390 px: una pista de 351 px, tarjetas apiladas en la misma x, panel 349×262 (1,333), avatar centrado; el botón flotante de paleta que se superpone es la feature 37.

**Veredicto visual**: la anatomía de prioridad alta del delta (equipo-1 cabecera centrada, equipo-2 panel 4:3 con avatar centrado, equipo-3 fila nombre/cargo + «+» circular a la derecha, equipo-4 rejilla de 3 pistas acotadas, equipo-13 sin `espaciado(20)`, equipo-14 sin selectores posicionales) **coincide** con el prototipo; las de prioridad media (5–12) también están (alturas iguales, ficha con línea, ruta de chips, tinta en h2/h3, cargo suave, h3 20 px, estado abierto primario + giro, ritmos). Diferencias deliberadas y honestas: sin fotografías (panel de marca), sin chips, sin «Colegiada/o» ni «Idiomas», dos tarjetas en vez de seis.

## Cobertura de escenarios (@s ↔ test)

| @s | Cláusula | Evidencia (por valor, no solo recuentos) | Estado |
| --- | --- | --- | --- |
| @s1 | cintillo, titular y párrafo centrados a 1440 | `tests/e2e/fidelidad-equipo.spec.ts:59-79`: centro de la caja de TEXTO de los tres vs eje de la sección, ±2 px | [x] |
| @s1 | todo recuento coincide con el real | e2e `:83-84` (`EQUIPO.length === 2` + «Dos profesionales»); `Equipo-logica.test.ts` `resumenDelEquipo` (0/1/2/10, literal completo tecleado) y `recuentoEnLetra` (1–9, 10); `Equipo.test.tsx` `@s1 de fidelidad_equipo` (resumen exacto con datos reales, fuera de `article`) | [x] |
| @s1 | sin «seis», colegiaciones ni especialidades | e2e `:85` (regex); unit (doble sin formación: sin «Pulsa el +», sin seis/colegiad/especialidad) | [x] |
| @s2 | panel superior 4:3 | e2e `:111-115` (ratio ±0,02, arranca arriba); unit `?raw` `.panel {}` con `aspect-ratio: 4 / 3;` | [x] |
| @s2 | sin imagen de persona | e2e `:96,:116` (0 `img` en sección y panel); unit @s2 + vigentes @s11/@s32 | [x] |
| @s2 | avatar centrado en el panel | e2e `:118-125` (centro X e Y ±2 px); unit: único hijo del panel, `aria-hidden`, iniciales «MP»/«JH» | [x] |
| @s2 | nombre y cargo bajo el panel | e2e `:126-131` (y del h3 ≥ pie del panel; cargo bajo el h3); unit (orden DOM panel → h3 → `[data-equipo-cargo]`) | [x] |
| @s3 | solo la tarjeta con formación tiene botón circular «+» | e2e `:145-152` (1 botón en la sección, 0 en Joaquín, ancho = alto, `border-radius: 50%`, glifo «+»); unit (botón en la tarjeta de Marcos, glifo `aria-hidden`, nombre accesible solo por `aria-label`, sin botón en Joaquín); SCSS `?raw` (`$altura-control-media`, `$radio-circulo`, `rotate(45deg)` bajo `&[aria-expanded='true']`, `transition` bajo `no-preference`) | [x] |
| @s3 | activar actualiza `aria-expanded` y revela la formación | e2e `:154-159` (click → `true`, ficha visible con el literal real); unit (`Ocultar la formación de Marcos Pérez`, `[data-equipo-ficha]` solo en esa tarjeta) | [x] |
| @s3 | ninguna tarjeta muestra chips sin dato | e2e `:162` (0 `ul`); unit (datos reales: sin `ul`/`list`; doble `['Uno',' ','Dos']` → `['Uno','Dos']`, vecina sin lista y texto accesible `'Bea DosAuxiliar'`); `especialidadesVisibles` (4 casos) | [x] |
| @s4 | a 320 px cada tarjeta cabe y no hay desborde | e2e `:168-191` (cada `article` en [0, 322], misma x, `scrollWidth ≤ innerWidth + 2`) | [x] |

## Disciplina TDD

- ¿Evidencia de Rojo → Verde → Refactor? **SÍ** (`progress/tdd_fidelidad_equipo.md`, 4 ciclos con el rojo citado: 19 fallos por símbolo inexistente, 8 rojos tras la enmienda, 2, 8; refactor documentado: `.cabecera p:last-child` → `.resumen`). Con dos reservas menores: cada ciclo escribe un `describe` entero antes del verde (docs/tdd.md pide un test a la vez), y el spec E2E se escribió completo; @s4 nunca estuvo en rojo (la anatomía vieja tampoco desbordaba) y queda como trinquete declarado.
- ¿Producción sin test que la pida? **NO en lo sustantivo**. Cada función de `Equipo-logica.ts` tiene sus tests por valor; cada rama del `.tsx` (cabecera, panel, botón, ficha, chips) tiene su test de DOM. Quedan declaraciones SCSS que ningún test exige y no cambian nada visible (ver Calidad 1–2).
- Lógica en `*-logica.ts`: **SÍ** (`hayFormacionPublicada`, `recuentoEnLetra`, `resumenDelEquipo`, `especialidadesVisibles`; sin DOM). El `.tsx` cablea. Estado en `aria-expanded`, nunca en clase.

## Contratos vigentes y enmiendas

- **Enmendada por escrito**: `equipo.feature` @s1/@s10 (h2 «Equipo» → «Nuestro equipo»; la región sigue siendo «Equipo»). Antes/después literal en `progress/fidelidad/enmiendas_equipo.md`; comentario en el propio `.feature` (`:62-64`) y en `Equipo.test.tsx:24-33` sobre `obtenerSeccionEquipo`. Cambio de una palabra en rótulos neutros, coherente con la descripción registrada de la feature 31. Correcta.
- **Respetadas (verificadas)**: `equipo.feature` @s2/@s7/@s11 (texto accesible de Joaquín intacto; sin `dl`; sin `img`); `rediseno_visual` @s19 (sin `padding-block` en el módulo; @s19 E2E verde), @s23 (primer `span[aria-hidden]` de `#equipo` sigue siendo el avatar al 50 %), @s24 (`@include tarjeta`, sombra reposo), @s32 (`.avatar { background-color: var(--color-acento-suave); }` en crudo), @s33 (`.eyebrow {}` solo `@include eyebrow` + margen); `identidad_visual` movimiento (300/150 ms `ease-out` bajo `no-preference`; `movimiento.spec` verde); `datos_negocio`/@s49/@s52 (ningún literal del prototipo; `datos-reales` verde); `layout` @s47 (los `article` salen de la muestra al ir dentro de `.rejilla`; spec verde).
- Puertas que leen ficheros: sin módulo nuevo → inventario 18 y `usoDelAcento` 20 no cambian (tests verdes). Matriz de contraste: todos los pares nuevos ya están dados de alta (`matrizDeContraste.ts:343-367`: tinta/fondo, texto-suave/fondo, acento-tinta/fondo, tinta/superficie, texto-suave/superficie, texto/superficie, acento-tinta/acento-suave, sobre-primario/primario); ningún fichero compartido tocado por esta feature.
- Invariantes: la palabra «urgencias» no aparece en la sección; ningún `aria-label` nuevo la contiene; sin `24 h`/`365`; sin colores literales, sin selectores de id, sin `espaciado(20)` (pasos usados: 4, 8, 12, 16, 24, 48, 96, todos en la escala); cero peticiones a terceros (`red-limpia` verde); `docs/datos-galapavet.md` §9 recoge el dato no publicado (especialidades).

## Calidad (lente de artesano) — hallazgos, todos menores

1. `src/components/Equipo.module.scss:119` — `line-height: 1.2` en `.fila h3`: número del prototipo (VLS:226) que ningún test pide; el vocabulario del repo para titulares es 1,08 (`global.scss:179`) y `geometria-escalas.spec.ts:406` lo mide a 1,08 (hoy está rojo por el 1,15 de Servicios; si el h3 de Equipo fuera el primero medido, caería igual). Quitar la línea (hereda 1,08) o fijarla con test y enmienda escrita.
2. `Equipo.module.scss:40-42` (`.cabecera h2`: `margin: 0`, `font-family`), `:114-117` (`.fila h3`: `font-family`), `:171-173` (`.ficha p { margin: 0 }`): duplican `global.scss:79-91` (`margin-block: 0`) y `:176` (`font-family: var(--fuente-titulares)` en h1–h6). Bytes de CSS sin test; dejar solo `font-size`/`color`/`line-height`.
3. `src/components/Equipo.tsx:73` `key={chip}` con `especialidadesVisibles` (`Equipo-logica.ts:83-85`) sin deduplicar: dos especialidades iguales en datos emitirían un aviso de React y pondrían rojo `red-limpia` @s34 (0 avisos). Deduplicar en la función (test: `['A', 'A']` → `['A']`).
4. `Equipo-logica.ts:51-56` y `:72`: `RECUENTOS_EN_LETRA[0] = 'Un'` es inalcanzable desde producción porque `resumenDelEquipo` trata el 1 aparte («Un profesional»); conocimiento duplicado. Sugerencia: `${recuentoEnLetra(recuento)} ${recuento === 1 ? 'profesional' : 'profesionales'}` conservando los tests.
5. `progress/fidelidad/enmiendas_equipo.md`: la convención de la oleada (instrucción del lead y `enmiendas_fidelidad_galeria.md`) es `enmiendas_fidelidad_equipo.md`. Renombrar y actualizar las cuatro referencias (`features/equipo.feature:64`, `Equipo.test.tsx:27`, `Equipo.tsx:20`, `progress/tdd_fidelidad_equipo.md:20,26,70`).
6. `src/components/Equipo.test.tsx:330-335`: el comentario del test @s33 dice que la banda de Equipo es `.seccionAlterna` → `--color-fondo-alterno`; desde `fidelidad_lienzo` es `.seccion` → `--color-fondo` (`Landing.tsx:60`, medido `rgb(248,250,252)`). Actualizar el comentario (el test sigue siendo correcto).
7. Composición con dos miembros: la tercera pista queda vacía a partir de ≈980 px (`Equipo.module.scss:57-63`, `auto-fill`, decisión 5 del tdd). El handoff T4 proponía `max-width: 760px; margin-inline: auto` (dos tarjetas centradas). Es una decisión de cliente que el contrato no fija: el lead debe plantearla; si se cambia, va con test y enmienda.
8. Granularidad TDD (ver arriba): describes enteros por ciclo y @s4 sin rojo previo. No bloquea; se anota para el próximo artesano.

## Checkpoints

- C1: [ ] `bin/harness init` rojo por 4 tests ajenos (contacto); ficheros base y docs presentes. Debe repetirse en verde antes de `done`.
- C2: [ ] `feature_list.json`: la 31 sigue `spec_ready` con el código ya en el árbol y la 34 en `in_progress` (estado gestionado por el lead en esta oleada); `progress/current.md` describe la sesión activa.
- C3: [x] sin dependencias nuevas; sin logs ni TODOs; capas respetadas (datos → lógica pura → componente).
- C4: [x] test por módulo; 63 tests de Equipo verdes en aislamiento y dentro de la suite (1366/1370, rojos ajenos).
- C5: [ ] cierre de sesión pendiente del lead (capturas `codex_*.png` sin trackear ajenas; `progress/history.md`).
- C6: [x] contrato + sección de spec; @s1–@s4 con `Then` medibles; mapa @s → test completo; sin producción sustantiva sin test (solo las declaraciones SCSS de Calidad 1–2).
- C7: [ ] mutación pendiente: `pnpm exec stryker run --mutate src/components/Equipo-logica.ts` (superficie nueva: 4 funciones, cada literal con test por valor).

## Cambios requeridos

Ninguno bloqueante. Los ocho puntos de «Calidad» son menores y pueden entrar en el mismo commit de cierre o en un ciclo corto del artesano; condiciones de cierre para el lead: `bin/harness init` en verde una vez aterrice contacto, mutación de `Equipo-logica.ts` al 100 %, y decisión del cliente sobre el punto 7.

## Cierre de puertas — 03/09/2026 20:59

La condición de mutación pendiente se cumplió sobre el árbol final: 65/65
mutantes eliminados, 100 %, sin timeout. La decisión estética conservadora se
mantiene: con dos profesionales publicados no se inventan tarjetas,
fotografías o especialidades. La suite global se repite al cierre de toda la
portada; esta sección pasa a `done` con sus pruebas propias, navegador y
mutación acreditados.

## Fuera del ámbito de equipo (para `craftsman_lead`)

- `fidelidad_cabecera` (27, DONE): a 320 px el `span._textoSoloLectores` «Abrir menú» sobresale (derecha 326) y pone rojo `fidelidad.spec.ts` @s44. Regresión o rojo heredado; no es de esta sección.
- `fidelidad_servicios` (29, DONE): `#servicios article h3` con `line-height` 1,15 (`Servicios.module.scss:99`) deja rojo `geometria-escalas` @s22 (ya anotado en `judge_fidelidad_campanas.md`).
- `fidelidad_contacto` (34, en curso): `InformacionContacto.test.tsx` (3 rojos) y `puertaTelefonoHardcodeado.test.ts` (5 teléfonos en `src/`) mantienen `bin/harness init` en rojo para todas las features de la oleada.
