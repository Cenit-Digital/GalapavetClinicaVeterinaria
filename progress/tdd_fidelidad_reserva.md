# TDD — fidelidad_reserva (32)

Fecha: 03/09/2026. Contrato humano: `features/fidelidad_reserva.feature` (@s1–@s5).
Insumos: `progress/fidelidad/delta_reserva.md`, tramo T5 de
`progress/rediseno/HANDOFF_CONVERGENCIA_V2.md` (@s27–@s28 de
`convergencia_visual_v2.feature`), `progress/fidelidad/inventario_red_seguridad.md`,
la sección `#reservar` del prototipo (VLS:254-315, runtime VLS:752-776) y su
render `progress/rediseno/prototipo_1440.png`, mirados antes del primer rojo.
Estado en `feature_list.json`: `spec_ready` (el lead gestiona el único
`in_progress` del arnés; instrucción expresa de no tocarlo).

## Contrato y alcance

- Sección Reservar de la portada: dos columnas centradas entre sí; columna de
  texto con cintillo, titular, párrafo, fila «WhatsApp» + «Llamar a la
  clínica» y lista con marcas (= horario real); tarjeta de chat alta con tres
  bandas (cabecera, historial, pie) y controles ≥ 44 px; apilado a 320 px.
- Ficheros propios: `src/components/ReservaChat.tsx`, `ReservaChat.module.scss`,
  `ReservaChat-logica.ts`, `ReservaChat-logica.test.ts`, `ReservaChat.test.tsx`,
  `tests/e2e/fidelidad-reserva.spec.ts` (nuevo),
  `progress/fidelidad/enmiendas_fidelidad_reserva.md` (nuevo).
- Ficheros compartidos, con edición mínima por sustitución exacta:
  `features/reserva_chat.feature` (@s12, @s18 y nota de cabecera),
  `features/datos_negocio.feature` (nota PENDIENTE → RESUELTO),
  `features/rediseno_visual.feature` (@s34, una cláusula),
  `src/lib/diseno/matrizDeContraste.ts` (solo el comentario de la fila
  `borde-control`/`fondo-alterno`, que citaba una línea ya inexistente de
  este módulo; la matriz ya contenía los 25 pares, ninguno nuevo). No se ha
  tocado `Landing.*`, `_api.scss`, `global.scss` ni `tests/e2e/utilidades.ts`.

## Decisiones de diseño tomadas antes del primer rojo

1. **Botón «WhatsApp» como `boton-primario`** (`--color-primario` /
   `--color-sobre-primario`), no con el `--color-acento-tinta` del prototipo
   (VLS:261): el par `sobre-primario`/`acento-tinta` **no está** en la matriz
   de contraste y la instrucción del lead era usar el primario en ese caso.
   Es la única familia de botón relleno del sistema (Hero, campañas,
   contacto). El `href` es `datosNegocio.telefonoMovil.enlaceMensajeria()`
   (`https://wa.me/34685343149`), `target="_blank" rel="noopener noreferrer"`
   como el prototipo.
2. **Las dos píldoras con la misma altura** (`$altura-control-grande`, 56 px)
   en la fila, como la fila de acciones del Hero; el prototipo las iguala a
   48 px. Única redefinición de tamaño del módulo, declarada en el SCSS.
3. **Lista con marcas = horario real** (`reserva_chat` @s19): «✓» en
   `li::before` con `content: '✓' / ''` (alternativa vacía → fuera del árbol
   accesible y del `textContent`). Círculo de 20 px = mitad de
   `$altura-control-pequena`, sobre `--color-acento-suave`.
4. **Tarjeta de tres bandas** con `@include tarjeta` y `--sombra-reposo`
   mantenida en hover (`geometria-escalas` @s24). La altura mínima (480 px =
   5 × `espaciado(96)`, ≥ 470 del contrato) vive en un `div.interior`, no en
   el `fieldset`: la caja anónima de contenido de un `fieldset` no hereda
   `min-height`, así que sus hijos flex no la repartían y el pie quedaba
   155 px por encima del borde inferior (lo detectó el E2E @s4 en su primer
   rojo tras el verde unitario).
5. **Cabecera**: avatar de 40 px (`$altura-control-pequena`) en primario con
   `inicialesDe(datosNegocio.identidad.nombreComercial)` (antes un literal
   `'G'`), nombre comercial en `strong`, «Disponible» con punto de acento y
   tinta de acento, «Asistente de reserva» como tercera línea pequeña (el
   nombre accesible del grupo ya lo dice; visible sigue diciendo que es un
   guion, no una persona).
6. **Burbujas por autor** con `data-autor="asistente|visitante"` (Invariante
   5: atributo, no clase); el rótulo «Asistente:»/«Tú:» sigue en el texto
   (@s20) y se compone en `ReservaChat-logica.ts` (`rotularMensaje`,
   `AUTOR_ASISTENTE`, `AUTOR_VISITANTE`, `AUTORES_DE_MENSAJE`) para que
   Stryker lo muerda. Colas 12/4 px (`$radio-medio`/`$radio-pequeno`) en vez
   de 16/5 (Decisión 24).
7. **Paso de texto**: subcomponente interno `FilaDeTexto` (campo píldora +
   botón redondo de 48 px con «→» `aria-hidden` y `aria-label="Enviar
   respuesta"`), usado en los pasos «animal» y «nombre» (antes dos bloques
   duplicados). Estados final y urgencia con la misma anatomía: acción
   principal `boton-primario` a ancho completo, secundarias `boton-fantasma`.
8. **Sin el cierre por WhatsApp con el resumen prellenado**: no está en
   @s1–@s5; queda como decisión de producto para el lead (ver «Pendiente»).

## Ciclos rojo → verde → refactor

| # | @s | ROJO (test que falló primero) | VERDE (cambio mínimo) | Refactor |
| - | -- | ----------------------------- | --------------------- | -------- |
| 1 | @s1 | `ReservaChat.test.tsx` `@s1 de fidelidad_reserva` (2 tests: `[data-reserva-informacion]` hermano previo del widget con el h2; SCSS `.reservaChat {` con `align-items: center` y la rejilla `auto-fit`, `.tarjeta {` con `@include tarjeta`, `min-height` y hover en reposo) → 2 fallos | atributo `data-reserva-informacion`, `className={styles.tarjeta}`; SCSS `align-items: center`, `gap: clamp(24px, 4vw, 48px)`, bloque `.tarjeta` | — |
| 2 | @s2 | `@s2 de fidelidad_reserva` (2 tests: dos enlaces en `[data-reserva-acciones]`, «WhatsApp» → `https://wa.me/34685343149` con `target`/`rel`, «Llamar a la clínica» → `tel:+34910829267`, tras el h2; SCSS `.acciones {` flex/wrap, `a:first-child` primario, `a:not(:first-child)` fantasma, sin `espaciado(20)`) + enmienda de `@s18` y `@s12` (justificación en el propio test) → 3 fallos | `<div className={styles.acciones} data-reserva-acciones>` con los dos enlaces desde `datosNegocio`; bloque `.acciones` | ambas píldoras a 56 px (`min-height` tras el `@include` del fantasma) |
| 3 | @s3 | `@s3 de fidelidad_reserva` (2 tests: `[data-reserva-horario]` tras las acciones, 3 `listitem` sin hijos y textos exactos, sin «Confirmamos/en menos de/Recordatorio/sin coste/en línea»; SCSS `.horario {` sin viñetas y `li::before {` con `content: '✓' / ''`, círculo, acento suave/tinta) → 2 fallos | `className={styles.horario} data-reserva-horario`; bloque `.horario` | `math.div` → `* 0.5` (`sass:math` no está en los módulos) |
| 4a | @s4 | `ReservaChat-logica.test.ts` `@s4 de fidelidad_reserva` (4 tests: `rotularMensaje` exacto por autor, formato «X: texto», `AUTORES_DE_MENSAJE`) → 4 fallos (símbolos inexistentes) | `AutorDeMensaje`, `AUTOR_*`, `AUTORES_DE_MENSAJE`, `ROTULO_POR_AUTOR`, `rotularMensaje` | se detectó y retiró una definición duplicada (`as const` + ternario) escrita en paralelo en el mismo fichero |
| 4b | @s4 | `ReservaChat.test.tsx` `@s4 de fidelidad_reserva` (5 tests: orden avatar → nombre → «Disponible» con punto `aria-hidden`; `data-autor` de las 3 burbujas + textos; `[data-reserva-pie]` con chips y aviso, fuera del `log`; botón «Enviar respuesta» con `aria-label`, hijo «→` `aria-hidden` y mismo padre `[data-reserva-fila-de-texto]` que el campo; SCSS de las tres bandas) → 4 fallos | `.tsx` reescrito: `deAsistente`/`deVisitante`, `FilaDeTexto`, `EnlaceLlamada` con `className`, cabecera reordenada, `data-autor`, `div.pie`, `.primario`/`.secundario`/`.resumen`/`.aviso`; SCSS reescrito por bandas | `button {}` e `input {}` globales del módulo retirados; `> div:first-child` → `.informacion`/`.descripcion` |
| — | @s1–@s5 | `tests/e2e/fidelidad-reserva.spec.ts` escrito entero y lanzado contra el `dist/` recién construido: **@s4 en rojo** (pie 155 px por encima del borde inferior: el `fieldset` no reparte su `min-height`) | `div.interior` con `display: flex; flex-direction: column; min-height`; el test unitario de @s1 pasa a leer `.interior {` | re-indentado del bloque |
| 5 | @s5 | `@s5 de fidelidad_reserva` (acciones antes que el widget en el orden del documento; SCSS `.tarjeta {` y `.tarjeta fieldset {` con `min-inline-size: 0`, `.filaDeTexto input` con `min-width: 0`) → 1 fallo | las tres declaraciones | — |

Tras cada ciclo: `pnpm exec vitest run` sobre los dos ficheros de la sección
(25 → 27 → 29 → 14+34 → 49 verdes).

## Trazabilidad (@s → tests)

| Escenario | Tests que lo muerden |
| --- | --- |
| @s1 dos columnas, tarjeta ≥ 470 px, alineación vertical | `ReservaChat.test.tsx` `@s1 de fidelidad_reserva` (2); `fidelidad-reserva.spec.ts` @s1 (tarjeta a la derecha y en la misma fila, `height ≥ 470`, centros verticales ±2 px a 1440) |
| @s2 «WhatsApp» (wa.me del móvil) y «Llamar a la clínica» (tel:), relleno, ≥ 44×44, sin desborde | `ReservaChat.test.tsx` `@s2 de fidelidad_reserva` (2) y `@s18` enmendado; `ReservaChat-logica` no aplica; `fidelidad-reserva.spec.ts` @s2 (nombres, destinos con doble anclaje a `datosNegocio`, misma fila, `padding-inline-start ≥ 16`, cajas ≥ 44, `scrollWidth ≤ clientWidth`, primero relleno en `--color-primario`, segundo transparente) |
| @s3 exactamente los 3 tramos, marca decorativa fuera del texto, sin promesas | `ReservaChat.test.tsx` `@s3 de fidelidad_reserva` (2) y `@s19` vigente; `fidelidad-reserva.spec.ts` @s3 (`toHaveText` de los 3 tramos, `::before` con «✓», circular y con relleno, `innerText` sin «✓», texto de la sección sin promesas) |
| @s4 cabecera (avatar, nombre, disponible), historial con burbujas por autor, pie con chips/campo/«Enviar respuesta» ≥ 44 | `ReservaChat-logica.test.ts` `@s4` (4); `ReservaChat.test.tsx` `@s4 de fidelidad_reserva` (5) y `@s25`/`@s34` vigentes; `fidelidad-reserva.spec.ts` @s4 (bandas pegadas arriba/abajo, avatar 40×40 `50%` primario «G», chips 6 × ≥ 44 con radio 999, `align-self`/fondo por autor, campo píldora + botón redondo 48 en la misma fila, «→») |
| @s5 apilado a 320 px, canales antes del chat, sin desborde | `ReservaChat.test.tsx` `@s5 de fidelidad_reserva`; `fidelidad-reserva.spec.ts` @s5 (acciones sobre la tarjeta y en la misma columna, tarjeta dentro de [0, 322], `scrollWidth ≤ innerWidth + 2` antes y después de abrir el paso de texto); `fidelidad.spec.ts` @s44 |

## Contratos vigentes: respetados / enmendados

Antes/después literal de cada enmienda en
`progress/fidelidad/enmiendas_fidelidad_reserva.md`:

- **Enmendado** `reserva_chat` @s18 (dos llamadas → «WhatsApp» + «Llamar a la
  clínica»; se conserva la prohibición de `mailto:`), @s12 (la cláusula «ni
  wa.me» pasa a «la llamada es el único enlace del widget»), notas de cabecera
  de `reserva_chat` y `datos_negocio` (Decisión 66, `docs/datos-galapavet.md`
  §2bis) y `rediseno_visual` @s34 («lista de ventajas» → «lista con marcas
  cuyos ítems son los tramos de horario reales»).
- **Respetados**: `reserva_chat` @s1–@s11, @s13–@s17, @s19, @s20 (los 20
  tests vigentes siguen verdes sin cambios salvo @s12/@s18); `rediseno_visual`
  @s24 (sombra de reposo), @s25 (bloque literal `[aria-label='Respuestas
  rápidas'] button {`), @s15 (acento solo como relleno), @s11 (todos los
  pares tinta/fondo del módulo ya estaban en la matriz); escala de movimiento
  (una transición nueva, 150 ms `ease-out`, bajo `no-preference`);
  `escalaEspaciado` (pasos 4/8/12/16/24/48/96, sin `espaciado(20)`);
  `puertaTelefonoHardcodeado`, `datosDelSitio` (prototipo citado solo como
  `VLS:<línea>`), `urgencias` @s14 (ningún `aria-label` nuevo con esa palabra).

## Evidencia

- `pnpm exec vitest run` sección (2 ficheros): 49/49.
- `pnpm run test` (suite completa): **89 ficheros, 1 412 tests, todos verdes**.
- `pnpm exec oxlint --deny-warnings` sobre los 6 ficheros de la sección:
  limpio. `pnpm run typecheck`: verde.
- `node .harness/harness.mjs init` (lint + typecheck + 1 412 tests + ficheros base):
  **verde de punta a punta** («Entorno listo»), ejecutado al cierre.
- `pnpm run build`: verde. **CSS servido: `dist/assets/index-C51_F8Ha.css`
  76,22 kB en crudo / 10,05 kB gzip** (techo 12 000 B; `css-presupuesto.spec.ts`
  verde en la suite completa).
- `pnpm exec playwright test tests/e2e/fidelidad-reserva.spec.ts --workers=1`:
  5/5 (3,0 s) contra el `dist/` fresco (antes, @s4 en rojo por el `fieldset`).
- `pnpm exec playwright test --workers=1` (suite completa, 150 tests):
  **149 verdes, 1 rojo ajeno a esta sección** — `tipografia.spec.ts` @s23
  (el `h1` del hero mide 71 px de diferencia con y sin fuentes de marca;
  el `h1` es el del Hero, feature 28 / reparación en curso de otro artesano).
  Verdes todos los que localizan `#reservar`: `geometria-escalas` (@s24
  sombra de reposo de la tarjeta, @s25 chips/campo/botón ≥ 44),
  `tipografia` @s21, `tokens-aplicados` @s26, `layout`/`fidelidad` @s44,
  `accesibilidad` (axe en 5 variantes), `urgencias` @s14, `datos-reales`,
  `red-limpia`, `css-presupuesto`, `despliegue-subpath`.
- Captura de cierre: `node tools/captura-comparativa.mjs fidelidad_reserva --sin-build`
  → `progress/rediseno/capturas/fidelidad_reserva_{1440,390,comparativa}.png`,
  miradas. Además, ocho capturas de la sección sola (inicial, paso de texto,
  final y urgencia a 1440 y 390 px) en el scratchpad de la sesión, miradas.

## Veredicto visual propio

La sección se parece al prototipo: banda alterna; a la izquierda cintillo
RESERVA DE CITA en versalitas de acento, titular en dos líneas, párrafo suave
de dos líneas, una fila con la píldora rellena «WhatsApp» y la de contorno
«Llamar a la clínica» (mismo alto, con relleno lateral: ya no desbordan) y
los tres tramos de horario con su círculo «✓»; a la derecha la tarjeta blanca
de 24 px de radio, más alta que el texto y centrada con él, con cabecera
(avatar «G» azul de 40 px, «Galapavet» en negrita, «● Disponible» en verde,
«Asistente de reserva» pequeño), historial sobre el fondo de página con la
burbuja del asistente a la izquierda y, tras responder, la del visitante en
azul a la derecha con cola, y pie con los seis chips en dos filas y la nota
de demostración en pequeño; en el paso de texto, campo píldora y botón
redondo «→»; en el final, panel de resumen, botón azul a ancho completo y
«Pedir otra cita» de contorno; en urgencia, la misma anatomía. A 390 px se
apila: texto, dos píldoras en fila, horario y después la tarjeta, sin
desborde. Diferencias deliberadas: WhatsApp en primario (par validado) en vez
del verde de acento; colas 12/4 en vez de 16/5; sombra de reposo en vez de la
elevada; radio 24 en vez de 22; nombre y estado más «Asistente de reserva»
en tres líneas; copy propio (sin «en menos de un minuto» ni ventajas).

## Pendiente para el lead

- **Mutación** (no ejecutada aquí, por la regla de un Stryker a la vez):
  `pnpm exec stryker run --mutate src/components/ReservaChat-logica.ts`.
  Superficie nueva: `AUTOR_ASISTENTE`/`AUTOR_VISITANTE`/`AUTORES_DE_MENSAJE`
  (igualdad exacta del array), `ROTULO_POR_AUTOR` (dos literales fijados por
  valor), `SEPARADOR_DE_ROTULO` (regex `^[^:]+: …$`), `rotularMensaje`.
- `judge` → `progress/judge_fidelidad_reserva.md`.
- **Decisión de producto abierta**: el cierre del chat sigue siendo la
  llamada (@s12 enmendado así). Con el canal confirmado, el prototipo cierra
  con «Enviar la solicitud por WhatsApp» y el resumen prellenado
  (`enlaceMensajeria(texto)`, `datos_negocio` @s6, ya listo). No está en
  @s1–@s5 y no se ha implementado por adelantado; si el cliente lo quiere, es
  un escenario nuevo (o una segunda enmienda de @s12), no un ajuste de estilo.
- **Concurrencia detectada**: durante los ciclos 4-5 otro proceso escribió
  en `ReservaChat-logica.ts`, `.tsx`, `.module.scss` y `.test.tsx` (una
  definición duplicada de `rotularMensaje`, una versión intermedia del SCSS,
  la corrección del `no-conditional-expect` de @s18 y el `| undefined` de
  `className`). Se reconcilió releyendo antes de cada escritura; el estado
  final es el descrito aquí y los ficheros llevan estables desde las 20:27.
  Conviene que el lead confirme que no hay otro artesano asignado a Reserva.
- Observación fuera de contrato: el historial (`max-height: 320px`, como el
  prototipo) no desplaza solo al último mensaje; en el estado final hay que
  desplazar dentro de la tarjeta para leer el resumen del asistente (el panel
  «Resumen de tu solicitud» sí queda a la vista). Es el comportamiento
  anterior; un `scrollIntoView` del último mensaje sería un escenario nuevo.
- A 390 px el botón flotante «Cambiar paleta de color» se superpone a los
  chips: es la feature 37 (`fidelidad_selector_paleta`), no esta.
- Rojo transversal ajeno: `tipografia.spec.ts` @s23 (h1 del Hero).
