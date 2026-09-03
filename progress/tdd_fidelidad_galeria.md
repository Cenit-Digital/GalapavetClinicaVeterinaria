# TDD — fidelidad_galeria (33)

## Contrato y alcance

- Contrato humano aprobado el 03/09/2026: `features/fidelidad_galeria.feature` (@s1–@s4).
- Análisis de partida: `progress/fidelidad/delta_galeria.md`; tramo T6 de
  `progress/rediseno/HANDOFF_CONVERGENCIA_V2.md` (@s22–@s24 de `convergencia_visual_v2.feature`).
- Alcance: solo la sección de galería de la portada. Ningún dato nuevo: las 6
  entradas de `src/data/galeria.ts` y el aviso literal de `galeria.feature` @s12.
  El titular es «Galería» a secas (nunca «pacientes reales»/«peludos»).
- Ficheros propios: `src/components/Galeria.tsx`, `Galeria.module.scss`,
  `Galeria-logica.ts`, `Galeria-logica.test.ts`, `Galeria.test.tsx`,
  `tests/e2e/fidelidad-galeria.spec.ts`.
- Ficheros compartidos, con ediciones mínimas (Edit, releídos justo antes):
  `src/pages/Landing.tsx` (clase del `div#galeria`), `src/pages/Landing.module.scss`
  (variante `.seccionGaleria`), `src/lib/diseno/matrizDeContraste.ts` (+1 fila,
  1 cita corregida) y `matrizDeContraste.test.ts` (21→22, 105→110, lista de sabotaje).

## Trazabilidad (@s → test)

| @s | Test de navegador real (`tests/e2e/fidelidad-galeria.spec.ts`) | Tests de componente/lógica (Vitest) |
| --- | --- | --- |
| @s1 cabecera con aviso y controles a la derecha | `@s1 de fidelidad_galeria` — cintillo y h2 «Galería», aviso íntegro + `aria-describedby`, h2 alineado con el h2 de Servicios, 2 botones 48×48 ±1 con `border-radius` 50 %, a la derecha del titular, dentro de la fila de cabecera y a ras del borde derecho del contenedor; **cada botón con exactamente un `svg[aria-hidden="true"]` de caja 16×16 ±1 contenida en la caja del botón** (ronda 1); primera tarjeta alineada con la cabecera; pista de x=0 a 1440 | `Galeria.test.tsx` → `@s1 de fidelidad_galeria` (5): cintillo `<p>` antes del único h2 y sin «peludos/pacientes»; aviso en el mismo contenedor que el titular, controles juntos, tras el aviso y antes de la pista, fuera de la cabecera la pista; SCSS de `.cabecera` (`max-width: $ancho-maximo-contenedor`, `space-between`, `flex-end`), `.eyebrow` con `@include eyebrow;` sin `color:`, `.controles` (`$altura-control-media`, `$radio-circulo`, superficie, `$ancho-borde-control`/`--color-borde-control`, `foco-visible`); **«cada control lleva una única flecha svg decorativa (aria-hidden) con un trazo propio, distinto del otro, y ningún texto visible»** (ronda 1) |
| @s2 tarjetas con dos líneas de contexto | `@s2 de fidelidad_galeria` — 6 figuras = `GALERIA.length`, `alt` de cada entrada, `[data-galeria-nombre]`/`[data-galeria-pie]` con su texto, fondo computado = `--color-superficie`, borde > 0, radio > 0; Tab desde «Foto siguiente» llega a la pista | `@s2 de fidelidad_galeria` (2): nombre y pie son dos elementos distintos dentro del `figcaption`; en el bloque `.pista {}` la `figure` lleva `@include tarjeta;` + `scroll-snap-align: start`, la `img` `@include hueco-de-imagen(4, 3);` sin `border-radius`, `.nombre`/`.pie` en bloque con sus tokens |
| @s3 paso exacto, movimiento reducido, sin barra | `@s3 de fidelidad_galeria` — con `reducedMotion: reduce`: `scroll-behavior` auto, `scrollbar-width` none, más de una tarjeta visible; clic en «Foto siguiente» → `scrollLeft` = ancho de la 1.ª figura + `columnGap` (±1) leído al instante; «Foto anterior» → 0 | `@s3 de fidelidad_galeria` (1): en las declaraciones propias de `.pista`, `gap: espaciado(16)`, `scrollbar-width: none`, y `padding-inline-start` = `scroll-padding-inline-start` = `$inicio-de-columna` (resuelta: `var(--sangrado-lateral)` y `$ancho-maximo-contenedor`); `Galeria-logica.test.ts`: `SEPARACION_ENTRE_TARJETAS_PX` = 16 a mano; los @s5–@s8 de `galeria.feature` siguen midiendo «ancho + separación» |
| @s4 sangrado móvil sin desbordar | `@s4 de fidelidad_galeria` — a 320: cabecera con la misma x que `#servicios > *`, Tab llega a la pista, pista de x=0 a 320 con `scrollWidth > clientWidth`, `document.scrollWidth <= innerWidth` | — (geometría real, solo medible en navegador) |

Contratos vigentes que se siguen cumpliendo con sus tests intactos:
`galeria.feature` @s1–@s3, @s5–@s16 y @s35 de `rediseno_visual` (bloque
`.pista {` con `overflow-x`, `scroll-snap-type`, `scroll-snap-align`, sin
`flex-direction: column` literal). Enmendados por escrito: @s4 y @s17 de
`galeria.feature`, la constante de separación y la matriz de contraste →
`progress/fidelidad/enmiendas_fidelidad_galeria.md`.

## Ciclos Rojo → Verde → Refactor

0. **Aceptación en rojo.** `tests/e2e/fidelidad-galeria.spec.ts` escrito antes de
   tocar producción; contra el `dist/` vigente, 4/4 rojos (no existían
   `[data-galeria-contenido]`, cabecera, tarjetas ni sangrado).
1. **@s1 cintillo + titular.** Rojo: `getByRole('heading', {level: 2, name: 'Galería'})`
   no existe. Verde: `<p class=eyebrow>Galería</p>` + `<h2>Galería</h2>` delante del aviso.
2. **@s1 estructura.** Rojo: aviso y titular no compartían contenedor; los
   controles flanqueaban la pista. Verde: `div.cabecera[data-contenedor-principal]`
   con `div.texto` (cintillo, h2, aviso) y `div.controles` (2 botones); la
   `<section>` deja de ser el contenedor principal y lleva `data-galeria-contenido`.
   Consecuencia prevista: @s4 de `galeria.feature` cae (2.ª tabulación); enmendado
   a tres tabulaciones con justificación en el propio test.
3. **@s1 SCSS.** Rojo: no había bloques `.cabecera`/`.controles`. Verde: cabecera
   `flex wrap`/`flex-end`/`space-between`, `width: calc(100% - 2 * var(--sangrado-lateral))`
   + `max-width: $ancho-maximo-contenedor` (misma x que las demás secciones sin
   wrapper acotado); controles 48×48 circulares, superficie, borde de control,
   transición `border-color 150ms` bajo `no-preference`. Se retira la rejilla
   `auto 1fr auto` y su comentario, que ya no describían el DOM. (El cambio de
   los glifos «‹ ›» por `svg` inline que este ciclo registraba como «refactor
   visual» NO era refactor: cambia lo que se pinta. Queda como ciclo propio, el 9.)
4. **@s2 pie en dos elementos.** Rojo: `within(figcaption).getByText(nombre)` no
   encuentra nodo propio. Verde: `span.nombre` + `span.pie`. @s17 de
   `galeria.feature` (cadena «nombre · pie») enmendado a `within(figura)`.
5. **@s2 tarjeta.** Rojo: `figure` sin `@include tarjeta;`. Verde: `figure`
   anidada en `.pista` con `tarjeta`, `flex: 0 0 clamp(240px, 32vw, 360px)`,
   `hover` que no eleva (la pista recorta), `img` con `hueco-de-imagen(4, 3)` y
   sin radio propio, `figcaption` 12/16/16, nombre Outfit 600 paso 0 tinta, pie
   paso −1 suave.
6. **@s3 separación y pista.** Rojos: constante 18 ≠ 16; `.pista` sin
   `scrollbar-width` ni `scroll-padding-inline-start`. Verde:
   `SEPARACION_ENTRE_TARJETAS_PX = 16` (comentario reescrito), `$inicio-de-columna`
   = `max(var(--sangrado-lateral), calc((100% - 1220px) / 2))` como `padding` y
   `scroll-padding` inicial, `padding-inline-end: var(--sangrado-lateral)`,
   `padding-block: espaciado(8) espaciado(24)` (sitio para la sombra),
   `margin-block-start: clamp(espaciado(24), 4vw, espaciado(48))`,
   `scrollbar-width: none`. Refactor del test: `resolverVariableSass` para no
   duplicar la expresión en el SCSS.
7. **@s1/@s4 banda a sangre.** Rojo: los E2E @s1/@s4 (pista acotada a 1220 por
   `.seccion`). Verde: `.seccionGaleria { padding-inline: 0; > * { max-width: none } }`
   en `Landing.module.scss` (después de `.seccionAlterna`; conserva
   `padding-block: var(--ritmo-seccion)` y el fondo de `.seccion`) y
   `className={`${styles.seccion} ${styles.seccionGaleria}`}` en `Landing.tsx`.
   Build + spec: 4/4 verdes.
8. **Matriz de contraste.** Rojo: `toHaveLength(22)` + `toContainEqual` del par
   `borde-control` sobre `superficie`. Verde: fila nueva con cita a
   `.controles button`; cita obsoleta de `fondo-alterno` (apuntaba a la galería en
   banda alterna con `boton-fantasma`) reasignada a `ReservaChat.module.scss:28`;
   `parejasComprobadas` 105→110 y la lista de sabotaje de «marca» gana el par
   nuevo (demuestra que la puerta lo muerde).
9. **@s1 la flecha de cada control (ronda de reparación 1).** Rojo, en
   `Galeria.test.tsx` (bloque `@s1 de fidelidad_galeria`): «cada control lleva
   una única flecha svg decorativa (aria-hidden) con un trazo propio, distinto
   del otro, y ningún texto visible» — por botón: `textContent` vacío,
   exactamente un `svg`, `aria-hidden="true"`, exactamente un `path[d]` con `d`
   no vacío; y los dos trazos distintos entre sí. Rojo en E2E @s1: por botón,
   `svg[aria-hidden="true"]` con `toHaveCount(1)` y caja de 16×16 ±1
   (`LADO_DE_LA_FLECHA_PX` = `espaciado(16)`) contenida en la caja del botón.
   Visto en rojo con `Flecha` devolviendo `null` (copia de seguridad en el
   scratchpad, sabotaje con `perl`, restauración con `cp` y `diff` idéntico):
   Vitest «Foto anterior: una única flecha: expected to have a length of 1 but
   got +0» (1 rojo, 29 verdes: exactamente el agujero que señaló el judge);
   Playwright, con ese sabotaje construido, `toHaveCount(1)` recibe 0 (1 rojo,
   3 verdes). Verde: la implementación de `Flecha` + `TRAZO_DE_FLECHA`
   restaurada tal cual (ya era la mínima: un `svg` decorativo con un `path`
   por sentido). Sondas adicionales, cada una restaurada después: mismo trazo
   en los dos controles → «expected 1 to be 2»; `svg` sin `aria-hidden` →
   «decorativa: expected null to be 'true'»; glifo «‹» junto al `svg` → «sin
   texto visible: expected '‹' to be ''». Refactor con la barra verde:
   `.cabecera h2` pierde `font-family`, `font-weight`, `letter-spacing` y
   `line-height`, que `global.scss` (`h1..h6`) ya da a todo `h2` con el mismo
   valor (menor 2 del judge); 30/30 y 4/4 tras el cambio.

## Ronda de reparación 1 (judge, 03/09/2026)

| Defecto | Qué cambió |
| --- | --- |
| Grave — `Galeria.tsx:17-42` (`Flecha`, `TRAZO_DE_FLECHA`) sin test que lo exija | Ciclo 9: test de componente nuevo en `Galeria.test.tsx` (`@s1 de fidelidad_galeria`) + aserción E2E en `fidelidad-galeria.spec.ts` @s1; ambos vistos en rojo con `Flecha` → `null`; tres sondas más que demuestran que cada cláusula muerde. La producción no cambia. |
| Menor 2 — `.cabecera h2` duplica cuatro declaraciones de `global.scss` | Retiradas (refactor en verde) y comentario de por qué solo quedan `margin`, `color` y `font-size`. Sin cambio computado: misma familia, peso, tracking e interlineado por la regla global. |
| Menor 3 — test en `Landing.test.tsx` de las dos clases del envoltorio `#galeria` | **No hecho, a decidir por el lead.** Ningún test del repo asevera nombres de clase de un CSS Module en jsdom (no hay un solo `import styles from '*.module.scss'` en `*.test.tsx`), así que habría que inventar el patrón en un fichero compartido en mitad de la oleada. La red real del sangrado son los E2E @s1/@s4 de esta feature. |

## Medida del CSS servido

`pnpm run build` con la ronda 1 aplicada: `dist/assets/index-CNHA5mV2.css`
72,69 kB en crudo, **9,61 kB gzip** (techo de `css-presupuesto.spec.ts`:
12 000 B; margen 2,4 kB). El árbol incluye el trabajo en curso de contacto y
equipo (34/35): el módulo de galería es 4 declaraciones más corto que en la
ronda anterior (70,39 kB / 9,21 kB gzip medía solo esta sección).

## Evidencia

- `pnpm exec vitest run src/components/Galeria.test.tsx`: **30/30** (29 + el
  test del ciclo 9). Suite completa `pnpm run test`: **89 ficheros, 1372/1373**;
  el único rojo es `src/paginasSeo.test.tsx` @s10 («… coinciden con el panel
  de contacto visible de la portada»: compara la región «Información de
  contacto» y el grupo «Urgencias fuera de horario» con el bloque SEO), del
  panel de contacto de la feature 34 en curso; ningún fichero de galería
  interviene.
- `pnpm exec oxlint --deny-warnings` sobre `Galeria.tsx`, `Galeria.test.tsx`,
  `Galeria-logica*.ts` y `fidelidad-galeria.spec.ts`: 0 hallazgos (exit 0).
  `pnpm exec tsc -b`: 0 errores.
- `pnpm exec playwright test tests/e2e/fidelidad-galeria.spec.ts --workers=1`:
  **4/4** (@s1 con la aserción de la flecha).
- Suite Playwright completa (ronda anterior, `dist/` de esta sección):
  133/140; los 7 fallos diagnosticados en navegador y **ninguno de la galería**:
  - `fidelidad-contacto.spec.ts` @s2: feature 34 en curso.
  - `fidelidad.spec.ts` @s44 (320 px): el elemento que sobresale es el `span`
    solo-lectores «Abrir menú» de la cabecera (derecha 326), no la galería (la
    pista termina en x = 320 y sus tarjetas cuelgan de `overflow-x: auto`).
  - `imagenes.spec.ts` @s31: imágenes sin `--color-fondo-alterno` propio son el
    logotipo y las 5 de Servicios (`.imagen` pinta el fondo en el `div`, no en la
    `img`); las 6 de la galería lo llevan por `hueco-de-imagen`.
  - `accesibilidad.spec.ts` @s38/@s39: fondo propio `rgb(11, 27, 51)` =
    `--color-tinta`, que solo pinta el hero; ningún control de la galería tiene
    tinta de fondo en ningún estado (superficie sobre fondo; hover solo cambia
    el borde).
  - `geometria-escalas.spec.ts` @s22: `h3` de tarjeta de Servicios con 1,15.
  - `tipografia.spec.ts` @s23: alto del `h1` del hero con/sin fuente.
- Capturas de cierre (ronda 1): `progress/rediseno/capturas/fidelidad_galeria_{1440,390,comparativa}.png`
  (`node tools/captura-comparativa.mjs fidelidad_galeria --sin-build`).

## Veredicto visual propio

Comparada a tamaño real la sección `#galeria` de la web (1440) con la del
prototipo (`prototipo_1440.png`, y ≈ 5900–6700): misma anatomía — cintillo
«GALERÍA», titular grande, párrafo de apoyo (aquí el aviso de demostración) a
la izquierda; dos círculos de 48 px a la derecha, alineados a la base del
párrafo, cada uno con su flecha (← →) pintada como `svg` de 16 px en tinta;
tarjetas blancas con borde, radio, sombra de reposo, foto 4:3 a sangre y pie
en dos líneas (nombre en Outfit 600, pie suave); tres tarjetas enteras y la
cuarta cortada por el borde derecho de la ventana. Mejora deliberada sobre el
prototipo: la primera tarjeta arranca en la x de la cabecera (el prototipo la
pegaba a x = 0 por el anclaje sin `scroll-padding`). A 390: cabecera acotada,
controles bajo el párrafo (el `wrap` del prototipo), pista sangrando por la
derecha y sin barra. Desviaciones declaradas: radio 24 (`$radio-grande`)
frente a 20; `gap` 16 frente a 18; separación cabecera→pista 48 frente a 42 a
1440; borde de los controles `--color-borde-control` (SC 1.4.11) frente al
decorativo del prototipo. El refactor del `h2` (ciclo 9) no mueve nada: la
regla global ya daba los mismos valores.

## Pendiente para el lead

- Stryker sobre `src/components/Galeria-logica.ts` (único cambio: el literal
  16 y su comentario; el test lo ancla a mano). No se ha ejecutado aquí.
- Judge (ronda 2: basta con el ciclo 9, la aserción E2E, el refactor del `h2`
  y este informe) y, tras ambos, el paso a `done`.
- Decidir el menor 3 del judge (test en `Landing.test.tsx` del envoltorio
  `#galeria`): ver la tabla de la ronda 1.
