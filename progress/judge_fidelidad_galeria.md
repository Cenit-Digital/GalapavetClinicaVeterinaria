# Review — feature 33 `fidelidad_galeria`

**Veredicto:** APPROVED (ronda 2, 03/09/2026)

Revisión independiente sobre el árbol de trabajo (sin commit) y el `dist/`
construido a las 19:47, posterior a todos los ficheros de la galería
(19:43–19:44). La ronda 1 (mismo día) rechazó por un solo defecto grave:
`Galeria.tsx:17-42` (`Flecha`, `TRAZO_DE_FLECHA`) sin test que lo exigiera.
Esta ronda comprueba la reparación (ciclo 9) y repite entera la verificación.

## Ejecutado por mí

| Puerta | Resultado |
| --- | --- |
| `pnpm run lint` (oxlint --deny-warnings) | exit 0 |
| `pnpm run typecheck` (tsc -b) | exit 0 |
| `pnpm exec vitest run` sobre `Galeria.test.tsx`, `Galeria-logica.test.ts`, `matrizDeContraste.test.ts`, `Landing.test.tsx`, `accesibilidad-teclado.test.tsx`, `imagenes-hrefDeDestino.test.ts` y `src/lib/diseno` (inventario 18, usoDelAcento 20, matriz 22, escala de movimiento, hoja global) | 26 ficheros, **436/436** |
| `pnpm exec playwright test tests/e2e/fidelidad-galeria.spec.ts --workers=1` | **4/4** (2,0 s) |
| E2E que la sección podía romper: `css-presupuesto`, `datos-reales`, `movimiento`, `tokens-aplicados`, `layout`, `urgencias`, `imagenes`, `geometria-escalas` (--workers=1) | 61/63; los 2 rojos NO son de la galería (ver Calidad) |
| `bash bin/harness init` | Primera corrida en rojo por `accesibilidad-teclado.test.tsx` @s23 (timeout de 5 s del recorrido de la App entera) y @s24, **mientras yo tenía Playwright corriendo en paralelo**; el fichero pasa 5/5 aislado. Segunda corrida sin carga: **89 ficheros, 1373/1373, exit 0** |
| Geometría medida por mí en navegador (script propio contra el preview del 4173 y el HTML del prototipo, a 1440 y 390) | ver «Anatomía» |

## Cobertura de escenarios (@s ↔ test)

| @s | Cláusula | Evidencia que fija por valor | Estado |
| --- | --- | --- | --- |
| @s1 | cintillo «Galería» + titular «Galería» | E2E `fidelidad-galeria.spec.ts:62-63` (toHaveText con el literal en `[data-galeria-cintillo]` y en el h2); unit `Galeria.test.tsx` «@s1 … cintillo y titular» (el p precede al único h2, DOCUMENT_POSITION_FOLLOWING, sin «peludos/pacientes») | [x] |
| @s1 | aviso completo | E2E `:64` contra AVISO_DEMOSTRACION tecleado a mano; aria-describedby `:65` | [x] |
| @s1 | controles a la derecha de la cabecera | E2E `:78-82,96-97` (x del botón mayor que el borde derecho del titular; dentro de la caja de la cabecera; borde derecho del segundo botón = borde derecho de la cabecera ±1); unit: mismo padre, tras el aviso, antes de la pista, y la cabecera no contiene la pista | [x] |
| @s1 | 48×48 ±1, circulares | E2E `:75-77` (ancho/alto ±1, borderTopLeftRadius = 50%); unit SCSS `.controles` con `$altura-control-media`, `$radio-circulo`, `--color-superficie`, `$ancho-borde-control solid var(--color-borde-control)`, foco-visible | [x] |
| @s1 | (ronda 1) la flecha de cada control | unit «cada control lleva una única flecha svg decorativa…»: textContent vacío, exactamente 1 `svg[aria-hidden="true"]`, exactamente 1 `path[d]` no vacío, trazos distintos entre sí; E2E `:86-94` toHaveCount(1) y caja 16×16 ±1 contenida en el botón. Visto en rojo con Flecha devolviendo null y con tres sondas más (`tdd_fidelidad_galeria.md`, ciclo 9) | [x] |
| @s2 | 6 fotos con su alt publicado | E2E `:113-119` (GALERIA.length, alt = entrada.nombre por índice) | [x] |
| @s2 | tarjeta con borde, radio y superficie | E2E `:122-134` (fondo computado = `--color-superficie` resuelto, borderTopStyle distinto de none, ancho mayor que 0, radio mayor que 0); unit: figure anidada en `.pista` con `@include tarjeta;`, img con `hueco-de-imagen(4, 3)` y sin border-radius | [x] |
| @s2 | nombre y pie en elementos distintos | E2E `:120-121` (`[data-galeria-nombre]`/`[data-galeria-pie]` con el texto exacto); unit «el pie … dos elementos distintos dentro del figcaption» | [x] |
| @s2 | pista focable por teclado | E2E `:137-139` (Tab desde «Foto siguiente» deja el foco en la pista); unit @s4 de `galeria.feature` enmendado (anterior → siguiente → pista) | [x] |
| @s3 | paso = ancho de tarjeta + separación | E2E `:167-169` (scrollLeft = ancho de la 1.ª figure + columnGap ±1), `:171-172` vuelta a 0; unit `gap: espaciado(16)` en las declaraciones propias de `.pista` **y** SEPARACION_ENTRE_TARJETAS_PX = 16 a mano (`Galeria-logica.test.ts:18`) | [x] |
| @s3 | respeta prefers-reduced-motion | E2E `:145,165` (reducedMotion: reduce → scroll-behavior auto, salto instantáneo); `movimiento.spec.ts` @s42 verde pulsando «Foto siguiente» | [x] |
| @s3 | sin barra nativa | E2E `:164` (scrollbar-width = none); unit `scrollbar-width: none` en `.pista` | [x] |
| @s4 | cabecera alineada a 320 | E2E `:179-181` (x de `[data-galeria-cabecera]` = x de `#servicios > *` ±1) | [x] |
| @s4 | tarjetas desplazables en la pista | E2E `:188-194` (pista de 0 a 320 ±1, scrollWidth mayor que clientWidth) | [x] |
| @s4 | sin desbordamiento del documento | E2E `:196-200` (documentElement.scrollWidth ≤ innerWidth); sonda propia a 320: scrollWidth 320 = clientWidth 320 | [x] |

Los tres escenarios del tramo T6 del handoff (`convergencia_visual_v2.feature`
@s22–@s24: h2 «Galería», aviso presente, 48×48 y 50 %, a la derecha en la fila
de la cabecera; tarjetas con superficie, borde 1 px y radio; figcaption en dos
elementos; scrollbar-width none; pista = ancho de la ventana; h2 en la x del h2
de Servicios) quedan absorbidos por @s1–@s4 y sus tests.

## Disciplina TDD

- ¿Evidencia de Rojo→Verde→Refactor? **SÍ**: 9 ciclos con el rojo concreto de
  cada uno (`tdd_fidelidad_galeria.md`); la aceptación E2E se escribió antes
  de tocar producción (4/4 rojos contra el dist anterior). El ciclo 9 (flecha)
  documenta el rojo con sabotaje (Flecha a null, mismo trazo en los dos, svg
  sin aria-hidden, glifo junto al svg) y la restauración con diff idéntico.
- ¿Producción sin test que la pida? **NO** en lo que cambia el comportamiento:
  la producción de la ronda 1 no cambió y ahora tiene test unitario y E2E que
  muerden. Quedan dos restos menores sin red (abajo, «Cambios sugeridos») que
  no bloquean.
- Refactor en verde: `.cabecera h2` pierde las cuatro declaraciones que
  `global.scss` (h1..h6) ya da; computado idéntico (medido: 600 46px/49.68px
  Outfit, tracking de la regla global).
- Alcance acotado a la sección; ficheros compartidos con ediciones mínimas:
  `Landing.tsx:66` (segunda clase), `Landing.module.scss:54-64`
  (`.seccionGaleria`, tras `.seccionAlterna`, misma especificidad) y
  `matrizDeContraste.ts:371-372` (+1 fila, 1 cita corregida) con su test
  (21→22, 105→110, lista de sabotaje con el par nuevo).
- Enmiendas por escrito con antes/después literal
  (`progress/fidelidad/enmiendas_fidelidad_galeria.md`): tests de
  `galeria.feature` @s4 y @s17 (el contrato no cambia), constante 18→16 (la
  cabecera del contrato preveía re-medirla), matriz de contraste y traslado de
  data-contenedor-principal al div de cabecera. Justificación en cada test
  enmendado (`Galeria.test.tsx:119-124,339-343`, `Galeria-logica.test.ts:11-16`,
  `matrizDeContraste.test.ts:437-440`).

## Calidad

- **Datos e invariantes**: titular «Galería» a secas (contrato); 6 entradas de
  `src/data/galeria.ts`; aviso literal @s12 intacto; alt = nombre. Ningún
  literal del prototipo («Nuestros peludos», «Pacientes reales», «9 semanas»,
  «−1,8 kg»…); sin «urgencias», «24 h» ni «365» en la sección
  (`datos-reales.spec.ts` @s49/@s50/@s52 y `urgencias.spec.ts` @s14 verdes).
  Imágenes con width/height/loading/decoding y src vía hrefDeDestino; cero
  peticiones a terceros (src locales; `puertaTerceros` en el build).
- **Lógica en -logica.ts**: el .tsx cablea; único cambio de lógica el literal
  16, anclado a mano. `Flecha` es presentación pura (un svg por sentido).
- **SCSS**: sin colores literales, sin selectores de id, escala respetada
  (espaciado 4/8/12/16/24/48 existen todos en `$escala-espaciado`;
  paso-tipografico -1/0/4; `$radio-circulo`; `$radio-grande` vía `tarjeta`;
  `$altura-control-media`; `$ancho-borde-control`); única transición nueva
  `border-color 150ms ease-out` dentro de no-preference. `56ch` y
  `line-height: 1.7` son idioma del repo (Servicios, Campañas, Equipo, FAQ,
  Hero, Contacto los usan), no literales del prototipo. `$inicio-de-columna`
  como relleno y scroll-padding inicial corrige el defecto del prototipo
  (primera tarjeta en x = 0): medido, cabecera x = 110 y primera tarjeta
  x = 110 a 1440.
- **Puertas que leen ficheros**: sin módulo nuevo, así que inventario 18 y
  usoDelAcento 20 siguen iguales y verdes; matriz 22 con borde-control sobre
  superficie (aprueba en las 5 variantes; la lista de sabotaje demuestra que
  muerde). Cita obsoleta de fondo-alterno reasignada a ReservaChat.
- **CSS servido**: `dist/assets/index-ElS_7cg_.css` 72 866 B en crudo (incluye
  el trabajo en curso de 34/35); `css-presupuesto.spec.ts` @s49 verde.
- **Anatomía vs prototipo (verificación propia, 1440)**. Web: cintillo 12,8 px
  700 versalitas acento-tinta; h2 Outfit 600 46 px tinta; aviso 16 px / 1,7
  suave en columna de 613 px (56ch); dos círculos de 48 px (x 1226 y 1282,
  borde derecho 1330 = borde de la cabecera) alineados a la base del párrafo,
  svg 16×16 centrado; pista x 0→1440, gap 16, padding-inline-start 110,
  scrollbar-width none, margen superior 48, relleno 8/24; tarjetas de 360 con
  borde 1 px, radio 24, --sombra-reposo, superficie blanca, foto 358×269 (4:3)
  a sangre, pie 12/16/16 con nombre Outfit 600 16 px y pie 12,8 px suave;
  cuarta tarjeta cortada por el borde de la ventana (x 1238→1598). Prototipo:
  misma anatomía con radio 20, gap 18, margen 42, pie 14/16/16, borde de
  control rgba(15,32,60,.13) y primera tarjeta en x = 0. A 390: en ambos los
  controles bajan bajo el párrafo (a la izquierda), la pista sangra por la
  derecha y no hay barra. Desviaciones declaradas y aceptables (escala del
  repo y SC 1.4.11). Coincide en todo lo que el contrato y el delta (prioridad
  alta: galeria-1 a -6) exigen.
- **Rojos E2E ajenos a la galería** (diagnosticados por mí): `imagenes.spec.ts`
  @s31 → sin fondo de reserva están el logotipo y las 5 fotos de Servicios
  (rgba(0,0,0,0)); las 6 de la galería pintan rgb(237,242,249).
  `geometria-escalas.spec.ts` @s22 → h3 de tarjeta de Servicios.
  `fidelidad.spec.ts` @s44 a 320 → el único elemento que sobresale es el span
  solo-lectores «Abrir menú» de la cabecera (derecha 326). Pertenecen a las
  features 27/29/34: para el lead.

## Checkpoints

- C1 [x] Ficheros base y docs presentes; `bash bin/harness init` → exit 0
  (lint, tsc -b, 89 ficheros / 1373 tests).
- C2 [x] Una sola in_progress (34 `fidelidad_contacto`); 33 sigue en
  spec_ready hasta que el lead la mueva; `progress/current.md` describe la
  sesión activa.
- C3 [x] Sin dependencias nuevas, sin logs ni TODOs; lógica en -logica.ts, el
  .tsx cablea, SCSS con tokens y escala, sin selectores de id.
- C4 [x] Tests por módulo; harness test mayor que 0 y verde.
- C5 [ ] `progress/history.md` sin entrada de esta sesión (sesión abierta:
  tarea del lead al cerrar). Sin temporales sospechosos.
- C6 [x] .feature, sección de spec y mapa @s→test correctos; el bloque de
  producción sin test de la ronda 1 ya tiene test rojo documentado.
- C7 [ ] Mutación pendiente (Stryker sobre `Galeria-logica.ts`, la corre el
  lead en serie; único cambio: el literal 16, anclado a mano).

## Cambios sugeridos (ninguno bloquea)

1. Menor — `src/components/Galeria.tsx:93`: `data-galeria-controles` no lo usa
   ningún test ni spec (grep en src/ y tests/: solo la producción). Es un
   gancho muerto: retirarlo o usarlo en el E2E @s1 para localizar el
   contenedor de los controles.
2. Menor — `src/components/Galeria.module.scss:22-24` (`.texto { max-width:
   56ch }`) y `:42-47` (`.aviso`: line-height 1.7, --color-texto-suave,
   paso-tipografico(0)): son los valores del delta galeria-7 (prioridad media)
   y ningún test los fija; solo el E2E @s1 los vigila de rebote (si el aviso
   ocupara toda la fila, los controles bajarían y la x del botón dejaría de
   superar el borde del titular). Añadir en el bloque «@s1 de
   fidelidad_galeria» de `Galeria.test.tsx` una aserción sobre el texto real de
   `.texto`/`.aviso`, o en el E2E @s1 el lineHeight computado (1,7 × fontSize)
   y el ancho del aviso ≤ 56ch.
3. Menor (heredado de la ronda 1, a decidir por el lead) — `Landing.tsx:66` /
   `Landing.module.scss:58-64`: el envoltorio #galeria con `styles.seccion` +
   `styles.seccionGaleria` solo lo exigen los E2E @s1/@s4, que no corren en
   CI. Un test en `Landing.test.tsx` contra `styles.*` cerraría el hueco;
   habría que fijar el patrón (hoy ningún *.test.tsx importa un *.module.scss).

Siguiente puerta: `mutation_tester` sobre `src/components/Galeria-logica.ts`
(nunca en paralelo con otro Stryker) y, con ambas verdes, paso a `done`.
