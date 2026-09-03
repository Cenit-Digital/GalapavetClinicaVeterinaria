# TDD — fidelidad_equipo (31)

Fecha: 03/09/2026. Contrato humano: `features/fidelidad_equipo.feature` (@s1–@s4).
Insumos: `progress/fidelidad/delta_equipo.md`, tramo T4 de
`progress/rediseno/HANDOFF_CONVERGENCIA_V2.md` (@s19–@s21 de
`convergencia_visual_v2.feature`), `progress/fidelidad/inventario_red_seguridad.md`
y la sección `#equipo` del prototipo (VLS:209-253, runtime VLS:738-748),
recortada y mirada antes del primer rojo.

## Contrato y alcance

- Sección Equipo de la portada: cabecera centrada, rejilla de pistas acotadas,
  tarjeta con panel 4:3 de marca (sin fotografía), fila nombre/cargo con «+»
  circular, ficha con línea superior, chips solo desde un campo real.
- Ficheros tocados (solo los de la sección): `src/components/Equipo.tsx`,
  `Equipo.module.scss`, `Equipo-logica.ts`, `Equipo-logica.test.ts`,
  `Equipo.test.tsx`, `src/data/equipo.ts` (campo opcional sin valor),
  `tests/e2e/fidelidad-equipo.spec.ts` (nuevo), `features/equipo.feature`
  (Enmienda 1), `docs/datos-galapavet.md` §9 (dato no publicado),
  `progress/fidelidad/enmiendas_equipo.md` (nuevo). Ningún fichero compartido.

## Decisiones de diseño tomadas antes del primer rojo

1. **Rótulos como el prototipo**: cintillo «Equipo», h2 «Nuestro equipo»;
   la región conserva `aria-label="Equipo"`. Enmienda 1 de `equipo.feature`
   @s1/@s10, antes/después literal en `progress/fidelidad/enmiendas_equipo.md`.
2. **Párrafo derivado, no hueco**: `resumenDelEquipo(recuento, hayFormacion,
   nombreComercial)` → «Dos profesionales en el equipo de Galapavet. Pulsa el
   + para ver la formación publicada.» Recuento en letra (`recuentoEnLetra`,
   1–9; cifra a partir de 10), nombre comercial de `datosNegocio.identidad`.
   Sin «colegiados», sin «verás siempre por aquí» (permanencia), sin «Seis».
3. **Panel en `--color-primario`, avatar en acento suave** (96 px,
   `espaciado(96)`). El mint que el prototipo muestra bajo la foto (VLS:220)
   solo aparece cuando la foto falla; portarlo como panel dejaría el avatar
   invisible u obligaría a enmendar `rediseno_visual` @s32 («sobre el acento
   suave»). Así @s32 y el test que lee `.avatar {}` en crudo siguen intactos.
4. **Chips desde un campo real**: `Profesional.especialidades?` sin valor para
   los dos reales (docs §9); `especialidadesVisibles()` y ruta de render
   probadas con un doble. Hoy ninguna tarjeta pinta chips.
5. **`auto-fill`** en la rejilla (no `auto-fit`): con dos miembros la tercera
   pista queda vacía, como la geometría del prototipo, en vez de estirar cada
   tarjeta a medio contenedor y deformar el 4:3. Si el cliente prefiere las dos
   tarjetas centradas, es una decisión expresa (nota del delta).

## Ciclos rojo → verde → refactor

| # | @s | ROJO (test que falló primero) | VERDE (cambio mínimo) | Refactor |
| - | -- | ----------------------------- | --------------------- | -------- |
| 1 | @s1 | `Equipo-logica.test.ts`: `recuentoEnLetra` (10 casos), `resumenDelEquipo` (6), `hayFormacionPublicada` (3) → 19 fallos por símbolo inexistente | `Equipo-logica.ts`: las tres funciones, literales tecleados a mano en test y producción | — |
| 2 | @s1 | `Equipo.test.tsx` describe `@s1 de fidelidad_equipo` (3 tests: DOM de la cabecera en orden y fuera de `article`; listado sin formación → sin «Pulsa el +», sin seis/colegiad/especialidad; SCSS `.cabecera {}` con `text-align: center`, `margin-inline: auto`, `max-width` < 1220) + los 5 tests que anclaban el h2 «Equipo» → 8 fallos | `Equipo.tsx`: `<div data-equipo-cabecera>` con cintillo/h2/resumen, import de `datosNegocio`; SCSS: bloque `.cabecera` (con `grid-column: 1 / -1` mientras `.equipo` seguía siendo rejilla) | (se absorbe en el ciclo 3: `.equipo` deja de ser rejilla) |
| — | @s1–@s4 | `tests/e2e/fidelidad-equipo.spec.ts` escrito entero y lanzado contra el `dist/` **sin reconstruir**: @s1, @s2 y @s3 en rojo (sin `[data-equipo-cabecera]`, sin panel, sin glifo «+»); **@s4 ya pasaba** con la anatomía vieja (la maqueta anterior tampoco desbordaba a 320 px; queda como trinquete y lo cubre también `fidelidad.spec.ts` @s44) | — | — |
| 3 | @s2 | `Equipo.test.tsx` describe `@s2` (2 tests: primer hijo del `article` = `div[data-equipo-panel]` cuyo único hijo es el `span aria-hidden` con las iniciales y texto accesible vacío; h3 y `p[data-equipo-cargo]` después; SCSS `.panel {}` con `aspect-ratio: 4 / 3`, `place-items: center`, `background-color: var(--color-primario)` y sin `color:`; `.rejilla {}` con `repeat(auto-fill, minmax(min(300px, 100%), 1fr))` y `align-items: start`; sin `espaciado(20)`) → 2 fallos | SCSS reescrito por escala: `.equipo` flex columna, `.rejilla`, `.tarjeta { @include tarjeta }`, `.panel`, `.avatar` plano, `.cuerpo`, `.fila`, `.fila > div { min-width: 0 }`, `.fila h3/p`; TSX: panel + cuerpo + fila, tarjetas dentro de `.rejilla` | — |
| 4 | @s3 | `Equipo-logica.test.ts`: `especialidadesVisibles` (4) · `Equipo.test.tsx` describe `@s3` (5 tests: único botón en la tarjeta con formación, glifo «+» `aria-hidden`, texto accesible del botón vacío, nombre accesible por `aria-label`; click → `aria-expanded="true"` y `[data-equipo-ficha]` solo en esa tarjeta; datos reales → ninguna `ul`/`list`; doble con `especialidades: ['Uno',' ','Dos']` → lista `['Uno','Dos']` y la vecina sin lista ni texto extra; SCSS `.fila button {` con `width/height: $altura-control-media`, `border-radius: $radio-circulo`, `&[aria-expanded='true']` → `rotate(45deg)`, `transition` solo bajo `no-preference`; `.ficha {}` con `border-block-start`) → 8 fallos | `especialidadesVisibles`; `especialidades?` en `Profesional`; botón con `data-equipo-control`, `aria-label`, `<span aria-hidden>+</span>`; `.ficha` y `.chips` en TSX; SCSS del botón (48 px, acento suave/tinta; abierto primario/sobre-primario + giro; 300/150 ms `ease-out` bajo `@media`), `.ficha`, `.chips li`; docs §9 | `.cabecera p:last-child` → clase `.resumen` (fuera el selector posicional, lección del defecto 2 del delta); tests, build y E2E repetidos en verde |

Cada ciclo se cerró con `pnpm exec vitest run` sobre los dos ficheros de la
sección: 30 → 22 (tras la enmienda, 8 rojos) → 22 → 24 → 63 verdes.

## Trazabilidad (@s → tests)

| Escenario | Tests que lo muerden |
| --- | --- |
| @s1 cabecera centrada, recuento real, sin seis/colegiaciones/especialidades | `Equipo-logica.test.ts` (`recuentoEnLetra`, `resumenDelEquipo`, `hayFormacionPublicada`); `Equipo.test.tsx` `@s1 de fidelidad_equipo` (3); `fidelidad-equipo.spec.ts` @s1 (centro del TEXTO de cintillo/h2/párrafo vs eje de la sección ±2 px a 1440; «Dos profesionales» con doble anclaje `EQUIPO.length === 2`; sin `seis|colegiad|especialidad`) |
| @s2 panel 4:3 sin imagen, avatar centrado, nombre y cargo debajo | `Equipo.test.tsx` `@s2` (2) y los vigentes @s11/@s32 (sin `img`); `fidelidad-equipo.spec.ts` @s2 (panel arranca arriba, proporción 4:3 ±0,02, sin `img`, avatar centrado en X e Y ±2 px, h3 bajo el panel, cargo bajo el h3) |
| @s3 «+» circular solo con formación, `aria-expanded`, sin chips | `Equipo-logica.test.ts` (`especialidadesVisibles`, `rotuloBoton`, `tieneFormacion`); `Equipo.test.tsx` `@s3` (5) y los vigentes @s3–@s8; `fidelidad-equipo.spec.ts` @s3 (1 botón en la sección, 0 en la tarjeta sin formación, ancho = alto, `border-radius: 50%`, glifo «+», click → `true` + ficha visible con la formación real, 0 `ul`) |
| @s4 apilado a 320 px sin desbordar | `fidelidad-equipo.spec.ts` @s4 (cada `article` dentro de [0, 322], misma x, `scrollWidth ≤ innerWidth + 2`); `fidelidad.spec.ts` @s44 |

## Contratos vigentes: respetados / enmendados

- **Enmendado**: `equipo.feature` @s1 y @s10 (h2 «Equipo» → «Nuestro
  equipo»), con comentario en el `.feature` y antes/después literal en
  `progress/fidelidad/enmiendas_equipo.md`. Los literales de @s1/@s10/@s33 en
  `Equipo.test.tsx` cambian solo en esa palabra, con la justificación sobre
  `obtenerSeccionEquipo`.
- **Respetados** (tabla completa en el fichero de enmiendas): @s2/@s7/@s11 de
  `equipo`; @s19/@s23/@s24/@s32/@s33 de `rediseno_visual`; escala de
  movimiento; matriz de contraste (pares nuevos ya representados:
  tinta/superficie, texto-suave/superficie, acento-tinta/acento-suave,
  sobre-primario/primario, tinta/fondo, texto-suave/fondo); `usoDelAcento`;
  `escalaEspaciado` (sin `espaciado(20)`); `datosDelSitio`/`rolesDescartados`.

## Evidencia

- `pnpm exec vitest run` Equipo (2 ficheros): 63/63.
- `pnpm run test` (suite completa, tras el refactor): ver «Cierre».
- `pnpm run typecheck`: verde. `pnpm exec oxlint --deny-warnings` sobre los 6
  ficheros de la sección: limpio. (`pnpm run lint` global falla en
  `Galeria.test.tsx:507`, trabajo en curso del artesano de galería.)
- `pnpm run build`: verde. **CSS servido: `dist/assets/index-*.css` 70,78 kB
  en crudo / 9,27 kB gzip** (techo 12 000 B; `css-presupuesto.spec.ts` verde).
- `pnpm exec playwright test tests/e2e/fidelidad-equipo.spec.ts --workers=1`:
  4/4 (1,5 s) contra el `dist/` fresco; antes, 3 rojos contra el viejo.
- Specs transversales que localizan `#equipo` (`geometria-escalas`, `layout`,
  `datos-reales`, `red-limpia`, `movimiento`, `css-presupuesto`, `fidelidad`,
  `tokens-aplicados`): **50 verdes, 2 rojos ajenos a esta sección**, medidos en
  el navegador para atribuirlos:
  1. `fidelidad.spec.ts` @s44 a 320 px: el elemento que sobresale (derecha 326)
     es el `span._textoSoloLectores` «Abrir menú» de la **cabecera**.
  2. `geometria-escalas.spec.ts` @s22: el «h3 (tarjeta de servicio)» medido es
     «Cirugía y anestesia» de **Servicios**, con `line-height: 1.15`
     (`Servicios.module.scss`, `.cuerpo h3`), no 1,08. Mi h3 de equipo va a
     1,2 como el prototipo pero no es el primero del documento.
- Captura de cierre: `node tools/captura-comparativa.mjs fidelidad_equipo --sin-build`
  → `progress/rediseno/capturas/fidelidad_equipo_{1440,390,comparativa}.png`,
  miradas. Además, tres capturas ampliadas de la sección (cerrada, abierta,
  390 px) en el scratchpad de la sesión.

## Veredicto visual propio

La sección se parece al prototipo: cabecera centrada en un bloque de 640 px
(cintillo EQUIPO en versalitas verdes, «Nuestro equipo» en tinta, párrafo de
dos líneas en texto suave); rejilla de tres pistas con las dos tarjetas reales
a la izquierda y la tercera vacía; cada tarjeta con panel 4:3 azul de marca y
el círculo mint de iniciales centrado; fila con nombre (20 px) y cargo
(12,8 px, suave) a la izquierda y el «+» circular de 48 px a la derecha, solo
en Marcos; las dos tarjetas cerradas miden lo mismo. Al abrir: el botón pasa a
primario con «×», aparece la ficha con línea superior y la tarjeta vecina no
se estira. A 390 px las tarjetas se apilan enteras (el botón flotante de
paleta que se superpone es la feature 37). Diferencias deliberadas: sin
fotografías (retratos no entregados), sin chips (dato no publicado), sin
«Colegiada/o» ni «Idiomas» (falsos), panel azul en lugar de foto.

## Pendiente para el lead

- **Mutación** (no ejecutada aquí, por la regla de un Stryker a la vez):
  `pnpm exec stryker run --mutate src/components/Equipo-logica.ts`. Superficie
  nueva: `hayFormacionPublicada`, `recuentoEnLetra` (array de 9 cadenas +
  `??`), `resumenDelEquipo` (3 ramas + 2 literales), `especialidadesVisibles`
  (`??`, `trim`, `filter`). Cada literal y rama tiene su test con el valor
  tecleado a mano.
- `judge` → `progress/judge_fidelidad_equipo.md`.
- Los dos rojos transversales ajenos (cabecera «Abrir menú» a 320 px;
  `line-height` del h3 de Servicios) y el fallo de
  `FormularioContacto.test.tsx` (@s2 de `fidelidad_contacto`, en curso) no
  son de esta feature: no se han tocado.

## Cierre

`pnpm run test` (suite completa, tras el refactor): **89 ficheros, 6 fallos en
2 ficheros ajenos a esta sección y 0 en los de Equipo** —
`src/components/InformacionContacto.test.tsx` (@s36 de `fidelidad_contacto`,
tres tests) y `src/lib/diseno/matrizDeContraste.test.ts` (dos tests que ya
esperan la píldora de urgencias de contacto): ambos ficheros aparecen
modificados en el árbol por el artesano de contacto, que trabaja en paralelo.
En la primera pasada completa (antes del refactor) el único rojo era
`FormularioContacto.test.tsx` @s2 de `fidelidad_contacto`, también suyo. Los
tests de `Equipo.test.tsx` y `Equipo-logica.test.ts` (63) pasaron en las dos
pasadas.
