# TDD — tarea de reparación `regresiones_27_28_29` (03/09/2026, oleada B)

## Alcance y origen

Reparación por TDD de regresiones sobre tres features ya `done` — 27
`fidelidad_cabecera`, 28 `fidelidad_hero`, 29 `fidelidad_servicios` —
detectadas por el judge de campañas (`progress/judge_fidelidad_campanas.md`,
«Fuera del ámbito»). Sin feature nueva ni cambio de estado en
`feature_list.json` (lo gestiona el lead). Sin Stryker (lo corre el lead en
serie). Ficheros compartidos tocados solo con ediciones acotadas releídas
antes: `global.scss`, `matrizDeContraste.ts` + test, `imagenes.spec.ts`,
`datos-reales.spec.ts`.

Puntos encargados (a–e) y dos hallazgos añadidos durante la reparación (f, g),
ambos rojos que seguían tapando los E2E encargados:

| # | Regresión | Sección | Causa medida |
| - | --------- | ------- | ------------ |
| a | Titular «Servicios veterinarios *de principio a fin en Galapagar*» | 29 | Copy del prototipo dentro del `<em>` (Decisión 65 fija «en <localidad>»); ni el unitario (regex laxa) ni el E2E (`toContainText`) lo atrapaban |
| b | `#servicios article h3` con interlineado 1,15 (esperado 1,08) | 29 | `.cuerpo h3 { line-height: 1.15 }` copiado del prototipo pisaba el 1,08 de `global.scss` (`geometria-escalas` @s22) |
| c | Las 5 `img` de servicios y el logotipo sin fondo de reserva en el propio `<img>` | 29 + 27 | El fondo `--color-fondo-alterno` estaba en el `<div>` envolvente; el logotipo no tenía ninguno (`imagenes` @s31) |
| d | Anillo de foco a 1,98:1 sobre el velo del hero | 28 | Los dos botones heredaban `--color-foco` del mixin sobre `--color-tinta` (`accesibilidad` @s38/@s39) |
| e | «Abrir menú» solo para lectores sobresale del viewport a 320 px (326 > 320) | 27 | `.textoSoloLectores` solo recortaba con `clip-path`; la caja absoluta seguía midiendo el ancho del texto (`fidelidad` @s44) |
| f | `imagenes` @s31 seguía rojo tras (c): la cubierta del hero (`/img/hero/clinica.webp`, absoluta, 1280×837) no cumple 16:9 | 28 | Tapado hasta hoy porque el bucle se detenía antes en el logotipo. Es una imagen fuera de flujo: su hueco es el de la sección (`fidelidad_hero` @s2 quitó el `aspect-ratio`). Enmienda del test, no de producción |
| g | `accesibilidad` @s39 seguía rojo tras (d): el control a 1,975:1 era el **enlace de salto** «Saltar al contenido principal», no los botones del hero | 28 (global) | Por SC 2.4.11 aterriza bajo la cabecera fija, que en la portada es ahora el velo del hero; en subpáginas es `--color-fondo`. Un solo color de anillo no sirve a ambos |

## Ciclos rojo → verde → refactor (en orden)

1. **(a) titular** — ROJO: `Servicios.test.tsx` «@s1 de fidelidad_servicios (Decisión 65)» (h2 con nombre accesible exacto «Servicios veterinarios en Galapagar», `<em>` = «en Galapagar», sin «de principio a fin») + `fidelidad-servicios.spec.ts` @s1 endurecido a `toHaveText` + frase prohibida en `datos-reales.spec.ts` @s52; los tres fallaron (el E2E contra el `dist/` sin reconstruir). VERDE: `Servicios.tsx` `<em>{`en ${localidad}`}</em>`. Sin refactor (una línea).
2. **(b) interlineado** — ROJO: `Servicios.test.tsx` «@s22 de rediseno_visual» (el bloque `.cuerpo h3 {` no declara `line-height`). VERDE: se quita `line-height: 1.15` (hereda 1,08 de `global.scss` h1..h6). Medido: 27 px / 25 px = 1,08.
3. **(c1) imágenes de servicios** — ROJO: `Servicios.test.tsx` «@s31 de identidad_visual» (`img` dentro de `.imagen` incluye `hueco-de-imagen(8, 5)`), con ayudante `cuerpoDelBloque` (mismo que Cabecera/Contacto). VERDE: `.imagen img { @include hueco-de-imagen(8, 5); }`. REFACTOR en verde: `.imagen` deja de duplicar `aspect-ratio`, `overflow` y `background-color` (los da el mixin) y conserva solo `position: relative` para la píldora superpuesta.
4. **(c2) logotipo** — ROJO: `Cabecera.test.tsx` «@s31 de identidad_visual» (`img` dentro de `.marca` incluye `hueco-de-imagen(1, 1)`). VERDE: mismo patrón que `PieDePagina.module.scss` (mixin + tamaño de icono `$altura-control-pequena`).
5. **(d) anillo del hero** — ROJO: `Hero.test.tsx` «@s38/@s39 de accesibilidad» (`a:first-child` y `a:not(:first-child)` declaran `outline-color: var(--color-sobre-primario)` bajo `&:focus-visible`). VERDE: dos bloques `&:focus-visible` en `Hero.module.scss` (uno por botón: el `:focus-visible` del mixin lleva la especificidad de cada selector). Test de justificación (verde desde el principio, no dirige producción): `--color-sobre-primario` contra `--color-tinta` y contra el velo al 76 % sobre negro/blanco ≥ 3 en las cinco variantes (`calcularRatioContraste` + `mezclar`). Matriz: ROJO `matrizDeContraste.test.ts` (25 pares, `toContainEqual` sobre-primario/tinta) → VERDE fila nueva citando `Hero.module.scss`; los dos recuentos «× 5 variantes» pasan de 120 a 125. Lint: la forma `expect(x, mensaje)` la rechaza oxlint (`vitest/valid-expect`); se quitó.
6. **(e) texto solo para lectores** — ROJO: `Cabecera.test.tsx` «@s44 de rediseno_visual» (`.textoSoloLectores`: absoluto, 1×1 px, `overflow: hidden`, `clip-path: inset(50%)`, `text-wrap: nowrap`). VERDE: `width: 1px; height: 1px`. Se conserva `text-wrap: nowrap` (convención del repo; `white-space` no se usa en ningún módulo). Medido a 320 px: span 1×1, borde derecho 285,6; `scrollWidth` 320.
7. **(g) enlace de salto** — ROJO: `src/styles/hoja-global.test.ts` «@s39 de accesibilidad» (`.salto-contenido` declara `&:focus::before` absoluto, `z-index: -1`, `inset: -espaciado(8)`, `background-color: var(--color-fondo)`). VERDE: halo opaco de `--color-fondo` bajo el anillo, solo con foco (indicador a dos tonos); el par foco/fondo ya lo valida la matriz en las cinco variantes. Medido enfocado en la portada: a 1 px y a 5 px del enlace, `elementFromPoint` devuelve el propio `<a>` con `rgb(248, 250, 252)`; sin foco no queda ninguna franja visible.
8. **(f) cubierta del hero** — enmienda del test `imagenes.spec.ts` @s31 (antes/después literal en `progress/fidelidad/enmiendas_regresiones_27_28_29.md`): una imagen de cubierta (`position: absolute` con los cuatro lados a 0) compara su rectángulo con el del contenedor que cubre; el resto sigue usando los atributos. Alto > 0 y fondo de reserva se exigen a todas.

## Trazabilidad (@s → test)

- Decisión 65 / `fidelidad_servicios` @s1 → `src/components/Servicios.test.tsx` «@s1 de fidelidad_servicios (Decisión 65)»; `tests/e2e/fidelidad-servicios.spec.ts` @s1 (`toHaveText` exacto); `tests/e2e/datos-reales.spec.ts` @s52 (frase «de principio a fin» prohibida en las 6 rutas).
- `rediseno_visual` @s22 → `Servicios.test.tsx` «@s22 de rediseno_visual: el h3 hereda el interlineado»; `tests/e2e/geometria-escalas.spec.ts` @s22.
- `identidad_visual` @s31 → `Servicios.test.tsx` «@s31 … hueco 8/5»; `src/components/Cabecera.test.tsx` «@s31 … logotipo 1/1»; `tests/e2e/imagenes.spec.ts` @s31 (con la Enmienda 1 para la cubierta).
- `accesibilidad.feature` @s18 / `sistema_de_diseno_visual` @s30-@s31 (ejecutados por `accesibilidad.spec.ts` @s38/@s39) → `src/components/Hero.test.tsx` «@s38/@s39 … anillo» (2 tests); `src/lib/diseno/matrizDeContraste.test.ts` @s11 (par sobre-primario/tinta); `src/styles/hoja-global.test.ts` «@s39 … enlace de salto»; `tests/e2e/accesibilidad.spec.ts` @s38/@s39.
- `rediseno_visual` @s44 → `Cabecera.test.tsx` «@s44 … texto solo para lectores»; `tests/e2e/fidelidad.spec.ts` @s44.

## Enmiendas y ficheros compartidos

- `progress/fidelidad/enmiendas_regresiones_27_28_29.md`: Enmienda 1 (`identidad_visual` @s31, cubierta) con antes/después literal; endurecimientos y ampliaciones (E2E @s1 de servicios, lista de afirmaciones prohibidas, fila de la matriz) anotados como no-enmiendas.
- Compartidos, ediciones acotadas releyendo antes: `src/styles/global.scss` (bloque `&:focus::before` del enlace de salto), `src/lib/diseno/matrizDeContraste.ts` (+1 fila) y su test (24 → 25; los otros artesanos ya habían subido de 22 a 24), `tests/e2e/imagenes.spec.ts`, `tests/e2e/datos-reales.spec.ts`.
- No se tocó `src/lib/diseno/datosDelSitio.ts`: la puerta de afirmaciones admite cualquier frase; el catálogo vive, por diseño, en los tests.

## Evidencia

- Unitarios por fichero tras cada ciclo: `Servicios.test.tsx` 25/25, `Cabecera.test.tsx` 35/35, `Hero.test.tsx` 21/21, `matrizDeContraste.test.ts` 43/43, `hoja-global.test.ts` + `hojaGlobal.test.ts` + `escalaMovimiento.test.ts` 89/89.
- `pnpm run test` (suite completa): primera corrida, con otros artesanos editando a la vez, 88/89 ficheros y 1410/1411 tests — el único rojo, `src/pages/PaginaCampanas.test.tsx` @s11 (fichero de la 30, en reparación en paralelo), pasó 49/49 repetido aislado; **segunda corrida completa al cierre: 89/89 ficheros, 1411/1411 tests**.
- `pnpm run lint`: durante la tarea solo señalaba dos `vitest/no-conditional-expect` de `src/components/ReservaChat.test.tsx` (feature 32, otro artesano), ya corregidos por su artesano al cierre: **lint limpio**. `pnpm run typecheck`: verde. `pnpm run build`: verde (un primer intento chocó con un build concurrente; el reintento inmediato compiló).
- Playwright contra el `dist/` final, `--workers=1`: `accesibilidad.spec.ts` **15/15** (1,1 min; @s38/@s39 verdes en las 6 rutas); `fidelidad-servicios` + `imagenes` + `geometria-escalas` + `fidelidad` + `datos-reales` + `fidelidad-cabecera` + `fidelidad-hero` **51/51**. Los rojos de partida se reprodujeron antes de cada arreglo (datos-reales @s52 y fidelidad-servicios @s1 contra el `dist/` viejo; imagenes @s31; accesibilidad @s39; el unitario de cada ciclo).
- Medidas en navegador (1440 px, `dist/` servido): h2 «Servicios veterinarios en Galapagar»; `#servicios article h3` 27 px / 25 px = 1,08; `background-color` de las 5 `img` de servicios y del logotipo = `rgb(237, 242, 249)` = `--color-fondo-alterno`; anillo de los dos botones del hero `rgb(255, 255, 255)`; a 320 px el span «Abrir menú» mide 1×1 px con borde derecho 285,6.
- CSS servido tras el build final: `dist/assets/index-C5tGXkMr.css` 75,38 kB crudo / **9,95 kB gzip** (techo 12 000 B; incluye el trabajo simultáneo de las otras secciones de la oleada). Aportación neta de esta tarea: dos `@include hueco-de-imagen`, dos `outline-color`, el halo del enlace de salto, menos cuatro declaraciones duplicadas de `.imagen`/`.cuerpo h3`.

## Veredicto visual propio

`progress/rediseno/capturas/regresiones_27_28_29_comparativa.png` (prototipo | web a 1440 px) y `_390.png`, generadas con `tools/captura-comparativa.mjs` contra el `dist/` final y miradas: la cabecera (barra roja de urgencias con el rótulo real, marca con logotipo, navegación, «Tienda» en contorno, CTA rojo), el hero (velo, píldora «Galapagar · Madrid», titular centrado, dos botones, horario y banda íntegra de cuatro cifras derivadas) y servicios (cintillo «Lo que hacemos», titular bicolor «Servicios veterinarios / en Galapagar», apoyo con recuento derivado, cinco tarjetas con foto, píldora, título, resumen, pie «Ver qué incluye» y círculo «+») reproducen la anatomía del prototipo. Diferencias deliberadas y documentadas: 5 tarjetas frente a 15, cifras reales frente a «+12 años / 24 h / 4,9 ★», sin «de principio a fin». Recortes de verificación (scratchpad de la sesión, no versionados): anillo blanco en los botones del hero; halo claro del enlace de salto enfocado sobre el hero y nada visible sin foco; botón hamburguesa íntegro a 320 px.

## Fuera de esta tarea (visto, no tocado)

- `src/components/ReservaChat.test.tsx`: dos errores de lint (`no-conditional-expect`) durante la tarea, feature 32 en curso; resueltos por su artesano antes del cierre.
- `src/pages/PaginaCampanas.test.tsx` @s11: rojo transitorio en la primera corrida completa, verde aislado y en la segunda corrida; feature 30 en reparación.
- `feature_list.json`: sin tocar (regla 3 de la oleada); addendas «Regresión reparada el 03/09 (oleada B)» añadidas a `progress/judge_fidelidad_{cabecera,hero,servicios}.md`.
