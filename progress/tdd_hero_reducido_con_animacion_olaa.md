# TDD — feature 48 `hero_reducido_con_animacion` — ola 1A (retirada del contenido, altura y pruebas de navegador de la portada)

Fecha: 14/10/2026 (trabajo iniciado el 13/10/2026). Agente: `tdd_craftsman`. Contrato firmado por Pablo el 13/10/2026.
Alcance de esta ola: @s1, @s2, @s3 y @s12 (solo CSS + medición sin animación) de `features/hero_reducido_con_animacion.feature`, más las
enmiendas en `hero.feature`, `fidelidad_hero.feature`, `rediseno_visual.feature` (@s18, @s30, @s33, @s51) e `identidad_visual.feature` (@s23).
NADA de animación: es de la ola 2. No se ha tocado `features/`, `feature_list.json`, `progress/current.md` ni `project-spec.md`; no hay `git add/commit`.

## 1. Ficheros tocados

Producción:
- `src/components/Hero.tsx` — sin props, sin imports de datos ni de `enlaceLlamada`; solo titular, párrafo y un botón.
- `src/components/Hero.module.scss` — `min-height: 100svh`, contenido a la izquierda a ras de la columna, centrado en vertical bajo la cabecera; sin píldora, `dl`, cifras, segundo botón ni `@media`.
- `src/components/Hero-logica.ts` y `Hero-logica.test.ts` — BORRADOS con `rm` (la superficie de mutación sale de los patrones de `stryker.config.json`: no hay lista que editar).
- `src/lib/diseno/datosDelSitio.ts` — fuera `digitosDe`, `extraerFragmento` y `DIGITOS` (único consumidor: `Hero-logica.test.ts`, comprobado con grep).

Pruebas:
- `src/components/Hero.test.tsx` (reescrito), `src/lib/diseno/datosDelSitio.test.ts` (fuera el `@s51`), `src/components/Faq.test.tsx` (fuera el `900` y la comparación con el hero).
- `tests/e2e/fidelidad-hero.spec.ts` (reescrito entero, con la puerta nueva de `rediseno_visual` @s33 y una de `hero.feature` @s14), `tests/e2e/tipografia.spec.ts` (@s23), `tests/e2e/hero-reducido.spec.ts` (NUEVO: @s2 y @s12 de la 48).

Solo comentarios: `Equipo.test.tsx`, `Servicios.test.tsx` (excepción de la Enmienda 2 derogada), `Galeria.test.tsx` (ya no cita `Hero-logica.test.ts`), `src/lib/diseno/matrizDeContraste.ts` (fila de foco: un solo botón).

Informe: este fichero.

## 2. Ciclos Rojo → Verde → Refactor

| # | Escenario | ROJO (qué falló y por qué) | VERDE (cambio mínimo) | REFACTOR |
| - | --------- | -------------------------- | --------------------- | -------- |
| 0 | Retiradas sin rojo (por contrato) | — (pruebas de un sujeto retirado: hero @s4 @s5 @s6 @s9 @s10 @s11, rediseno @s30 (x2) y la prueba «ancho propio del hero» de @s18, `Hero-logica.test.ts`) | Se borran con su nota de retirada; `renderizarHero()` pasa a no tener props | `React` solo se usa por `React.createElement` (oxlint pide `React` en alcance y `tsc` prohíbe el import sin uso) |
| 1 | hero @s13 apretado | `el destino de cada enlace empieza por "#"…` falló: el enlace «Llamar» daba `tel:` | Quitar solo el `<a href={enlaceLlamada…}>` de `Hero.tsx` | — |
| 2 | 48 @s1 (conjunto) | `la sección real cumple todas las cláusulas…` falló con 4 cláusulas (píldora, dl, ul, dígitos) y `se quita el botón o el párrafo` también (con la píldora, quitar «el primer p» no bajaba el recuento) | Quitar el `<p>` de la píldora; después el `<dl>` y el `<ul>` | — |
| 3 | 48 @s3 (código muerto) | 4 pruebas rojas: `Hero-logica.ts` existía; `Hero.tsx` conservaba 8 restos; la hoja conservaba 7 (selectores y 2 `@media`); `digitosDe`/`extraerFragmento` se exportaban | `Hero.tsx` reescrito sin props ni imports; se borra `Hero-logica.ts`; se quita lo retirado de la hoja; se borran las dos funciones y su prueba propia | — |
| 4 | 48 @s12 (CSS) | `".hero" declara "min-height: 100svh"…` falló con 4 incumplimientos (clamp, falta 100svh, `min-height: 0`, regla de 560 px) | `min-height: 100svh` y se quita la regla de 560 px de `.hero` | — |
| 5 | fidelidad_hero @s1 + 48 @s12 (navegador) | `fidelidad-hero.spec.ts`: 3 rojos (titular a 360 px frente a marca a 110; a 1024 y a 375 el borde difería 128 y 13,25 px). `hero-reducido.spec.ts`: rojo en el centrado vertical a 1440x900 (hueco superior 100, inferior 392,7) | SCSS final de una vez: `.hero` en rejilla con `align-items: center` y `padding-block-start: var(--altura-cabecera)`; `.contenido` a la izquierda con `padding-inline: max(var(--sangrado-lateral), calc((100% - 1220px) / 2))` (el borde exacto de las demás secciones), relleno vertical simétrico y h1 sin margen superior. En el MISMO paso se renombró `a:first-child` a `a` (un solo botón) y se quitaron `.acciones a { min-height; padding-inline }` (duplicaba el mixin), `justify-content`/`gap`/`wrap` y la última `@media` | **Esto NO fue un refactor en verde:** el renombrado del selector puso en rojo la prueba de foco `@s38/@s39` (`no se encontró "a:first-child {"`). El contrato de foco no cambió; se actualizó la prueba acoplada al selector para que lea `a {` en la hoja sin comentarios, y volvió a verde |
| 6 | rediseno @s33 (puerta nueva), fidelidad_hero @s2/@s3, 48 @s2 | Verdes de inicio (la píldora ya estaba fuera tras el ciclo 2): se demuestra la mordida con páginas sintéticas y con sabotajes reales (sección 4) | — | — |
| 7 | identidad_visual @s23 | — (verde de inicio: el primer `p` de Servicios es el cintillo; ver desvíos). Se endureció después: la prueba comprueba que las peticiones de fuente se abortaron y que `Outfit` y `DM Sans` quedan en `error` | `tipografia.spec.ts` mide el h1 y los párrafos de Servicios, con `reduce` emulado antes del `goto` en las dos páginas | — |
| 8 | hero @s14 (navegador) | — (verde de inicio: no existía ninguna prueba de este escenario en `tests/e2e`; se descubrió al preparar la trazabilidad). Mordida: página sintética y sabotaje real (sección 4) | Solo prueba nueva en `fidelidad-hero.spec.ts` | Una recursión con `flatMap` y spread falló `oxc(no-map-spread)`; se pasó a un acumulador con `push` |

## 3. Trazabilidad `@s → test` (fichero · nombre del test; nunca números de línea)

### `features/hero_reducido_con_animacion.feature`
- **@s1** (exactamente tres elementos) → `src/components/Hero.test.tsx`: describe «@s1 de hero_reducido_con_animacion: …» — «la sección real cumple todas las cláusulas y se recorren elementos de verdad», «el encabezado, el párrafo y el enlace tienen el nombre, el texto y el destino exactos, y la imagen es decorativa», y los siete de mordida («vuelve la píldora…», «vuelve el botón «Llamar»…», «vuelve la franja de horario…», «vuelve la banda de cifras…», «vuelve un dígito suelto…», «se quita el botón o el párrafo…», «una segunda imagen, o una imagen con texto alternativo…»).
- **@s2** (ningún dato se pierde; navegador) → `tests/e2e/hero-reducido.spec.ts`: describe «@s2 de hero_reducido_con_animacion: …» — «dentro de la bienvenida el recuento de cada dato es 0, y fuera siguen el teléfono, los tres tramos de horario y la localidad», «la comprobación muerde: sobre un hero sintético que aún lleve la píldora, la franja y el botón de llamada…», «la comprobación muerde por separado: cada dato suelto…».
- **@s3** (código muerto) → `src/components/Hero.test.tsx`: describe «@s3 de hero_reducido_con_animacion: …» — «no existe ningún fichero cuyo nombre empiece por "Hero-logica"…», «"Hero.tsx" no conserva ningún identificador…», «"Hero.module.scss" no conserva ningún selector, regla ni "@media"…», «"digitosDe" y "extraerFragmento" ya no se exportan…», «el mixin "boton-fantasma" conserva al menos un consumidor…», y el bloque «la comprobación de restos muerde…» (12 casos del componente, 9 de la hoja, comentarios y falso positivo de `dl`).
- **@s12** (hero de pantalla completa) → CSS: `src/components/Hero.test.tsx` describe «@s12 de hero_reducido_con_animacion: … (lo que se lee de la hoja)» (real + 8 sabotajes + anidado + comentario). Navegador: `tests/e2e/hero-reducido.spec.ts` describe «@s12 de hero_reducido_con_animacion: …» — un test que mide 1440x900, 1024x768, 768x1024, 375x812, 320x900 y 812x300 y cuenta exactamente 6.

### Enmiendas
- `hero.feature` @s1 → `Hero.test.tsx` «@s1 se muestra el titular principal»; @s2 → «@s2 el texto descriptivo solo nombra servicios…»; @s3 → «@s3 el botón principal lleva a la sección de reserva»; @s7 → «@s7 no aparece ninguna cifra…»; @s8 → «@s8 la sección de bienvenida no anuncia urgencias»; @s13 → «@s13 … » (dos tests: atributos `src`/`srcset` y «el destino de cada enlace empieza por "#" … y hay al menos uno»).
- `hero.feature` @s14 → `tests/e2e/fidelidad-hero.spec.ts` describe «@s14 de hero: ninguna hoja de estilo de la sección apunta a un fondo de imagen de un tercero» (real + «la comprobación muerde…»). Estaba sin prueba propia en el repo.
- `hero.feature` @s4, @s5, @s6, @s9, @s10, @s11 → RETIRADOS: sus pruebas desaparecen de `Hero.test.tsx` (la ausencia la fija 48 @s1).
- `fidelidad_hero.feature` @s1 → `tests/e2e/fidelidad-hero.spec.ts` describe «@s1 de fidelidad_hero: …» (4 tests: 1440 a ras de la marca y `text-align`; 1024 y 375 contra `#servicios > *`; botonera y ancho a sangre). @s2 → describe «@s2 de fidelidad_hero: el hero se ve completo…». @s3 → describe «@s3 de fidelidad_hero: el hero se adapta a móvil…» (a 320 px).
- `rediseno_visual.feature` @s18 → `src/components/Faq.test.tsx` describe «@s18 (rediseno_visual) … declara su propio ancho máximo, distinto del general» (sin el 900); la prueba «ancho propio del hero» ya no existe. @s30 y @s51 → RETIRADOS (`Hero.test.tsx` sin los dos `@s30`; `datosDelSitio.test.ts` sin `@s51`; `Hero-logica.test.ts` borrado). @s33 (puerta nueva) → `fidelidad-hero.spec.ts` describe «@s33 de rediseno_visual: …» (recuento real = 0 y página sintética = 1).
- `identidad_visual.feature` @s23 → `tests/e2e/tipografia.spec.ts` describe «@s23 si la fuente de marca no llega…».
- Sin cambio por la 48 y que sigue verde: `rediseno_visual` @s29 (velo y contraste) y `accesibilidad` @s38/@s39 (foco del botón) en `Hero.test.tsx`.

## 4. Mordida: sabotajes REALES ejecutados (con `dist/` reconstruido en cada uno, fichero restaurado después y comprobado con `cmp`)

Scripts en el scratchpad de la sesión (no en el repo). Cada sabotaje se aplicó, se construyó con `vite build` y se ejecutaron los specs afectados:

| Sabotaje | Resultado |
| -------- | --------- |
| S1 `min-height: clamp(560px, 84svh, 784px)` | ROJO: @s12 (altura) |
| S2 vuelve `@media (max-width: 560px) { .hero { min-height: 0 } }` | ROJO: @s12 (375 y 320) |
| S3 `height: 100svh` en vez de `min-height` | ROJO: @s12 (812x300: premisa y recorte) |
| S4 el h1 recupera `margin-top: 24px` | ROJO: @s12 (centrado) |
| S5 contenido centrado (`align-items: center`, `text-align: center`) | ROJO: 3 pruebas de fidelidad_hero @s1 (1440, 1024 y 375) |
| S6 vuelve la píldora «Galapagar · Madrid» en mayúsculas CSS | ROJO en 7 pruebas: fidelidad_hero @s1 (1440, 1024 y 375), fidelidad_hero @s3, @s33 (recuento ≠ 0), @s2 de la 48 (recuento de localidad dentro del hero ≠ 0 leyendo `textContent`) y @s12 |
| S7 vuelve el botón «Llamar» | ROJO en 4: fidelidad_hero @s1 (1440 y botonera) y @s2, y @s2 de la 48 |
| S8 sin relleno superior de cabecera | ROJO: @s12 (centrado) |
| S9 `background-image: url('https://images.pexels.com/…')` en `.hero` | ROJO: hero @s14 |
| S10 `--fuente-texto: 'DM Sans', monospace` (respaldo que cambia los saltos de línea) | ROJO: @s23 (diferencia de 34 px en un párrafo de Servicios) |
| S11 `--fuente-texto: 'DM Sans', serif` | **SOBREVIVE**: @s23 sigue verde, porque la prueba mide solo ALTURAS y con `serif` los párrafos mantienen el mismo número de líneas. Es un límite del método que fija el contrato (alto con tolerancia de 1 px), no un fallo de la prueba; lo anoto aquí para que lo vea el `judge` |

Además, en jsdom y en navegador cada comprobación tiene su caso sintético que la pone en rojo (sección 3).

## 5. Estado de las puertas al terminar

- `pnpm run test:e2e` LITERAL (construye con `tsc -b` y sirve su propio `vite preview`; con 4173 libre antes y después): **código de salida 0, 185 pasadas, 0 fallos, 55 s**, incluido `css-presupuesto.spec.ts` (CSS servido: 70,17 kB sin comprimir; su techo es de 12 000 B codificados). Repetido: 183 antes de añadir la prueba de @s14. Mis specs con `--repeat-each=4` y 12 trabajadores: 88/88.
- Vitest, `pnpm exec vitest run src/components src/lib/diseno/datosDelSitio.test.ts src/lib/diseno/matrizDeContraste.test.ts src/pages`: 33 ficheros, 812 pruebas, verde (`Hero.test.tsx`: 59).
- `pnpm test` (suite completa, última pasada 14/10 00:34): 88 ficheros verdes y 1 fallo AJENO a esta ola: `src/lib/puertaTelefonoHardcodeado.test.ts` @s19, porque el fichero del otro agente `src/lib/diseno/escalaMovimiento.ts` contiene el literal `70.0000000`, que el patrón de teléfono español (9 dígitos con separador opcional) interpreta como teléfono. Lo verifiqué recorriendo `src` con el mismo patrón: solo `escalaMovimiento.ts` y `site.ts`. No lo he tocado.
- `pnpm run lint`: 0 avisos en mis ficheros. Quedan 2 errores en ficheros del otro agente (`movimientoRespetuoso.test.ts` `no-array-sort`, `medicionEstable.ts` `no-map-spread`).
- `pnpm run typecheck` (`tsc -b`): limpio al final (durante la ola hubo errores transitorios en ficheros del otro agente, ya resueltos por él). `tsc -p tsconfig.e2e.json --noEmit`: limpio.
- No ejecuté Stryker (lo hace el `mutation_tester`). Superficie: esta ola solo QUITA mutantes (`Hero-logica.ts`, `digitosDe`, `extraerFragmento`); no añade lógica en `src/lib` ni en `*-logica.ts`. Toda la lógica nueva de las pruebas vive en ficheros de test (no se muta) y cada comprobación tiene su caso sintético que la pone en rojo.
- Procesos: ningún servidor ni proceso node mío queda abierto (4173 libre; sin `vite`/`playwright` en la lista de procesos).

## 6. Desvíos y ambigüedades del contrato (no inventados: decididos de forma conservadora)

1. **«Primer párrafo de la sección de Servicios» (identidad_visual @s23).** El primer `<p>` de `#servicios` es el cintillo «Servicios» (una sola línea, mayúsculas), no el párrafo de apoyo de varias líneas (`data-servicios-apoyo`), que es el que de verdad podía saltar de línea. Medí con y sin fuentes de marca a 1440, 1024, 375 y 320: el h1, el párrafo del hero, el cintillo y el apoyo de Servicios dan alturas IDÉNTICAS (diferencia 0), gracias al respaldo de métricas ajustadas, así que el hallazgo NO vuelve a la puerta humana. Verifiqué que las fuentes estaban de verdad bloqueadas (2 peticiones `.woff2` fallidas; `Outfit:error` y `DM Sans:error` en `document.fonts`) y la prueba ahora lo exige. Mide el primer `p` (letra del contrato) y además el apoyo, para que no sea trivial: es un añadido sobre la letra, dilo si se prefiere solo el literal. Límite del método: ver S11.
2. **`@s10` de la 48 (espera de la entrada).** `fidelidad-hero` y `tipografia` cumplen por la vía (b): `emulateMedia({ reducedMotion: 'reduce' })` ANTES del `goto`, dentro de `cargarPortada` (función local que contiene el `goto`) y sobre cada página. `hero-reducido.spec.ts` declara `no-preference` explícito, como pide @s12, pero SIN congelar el reloj ni colocar animaciones: hoy no hay ninguna que congelar. **El Given de @s12 «reloj congelado antes de navegar y animaciones colocadas en su último instante» no puede implementarse hasta que existan animaciones (ola 2)**; cuando llegue, la medición con `getBoundingClientRect` del titular y el botón tendrá que añadir ese paso para quedar exceptuada por @s10. Está dicho en el encabezado del spec.
3. **@s14 de hero (origen de los fondos).** El contrato dice «ninguna regla declara un origen que empiece por "http://", "https://" ni "//"». El valor computado de `background-image` siempre sale como URL absoluta de la propia página, así que esa comparación literal daría rojo con el código correcto. La prueba compara por ORIGEN (distinto del de la página) y por «images.pexels.com», sobre el valor computado de cada elemento y pseudoelemento y sobre el texto de cada regla de las hojas que afecta a la sección. Equivalente en intención; es una lectura mía del contrato.
4. **Tolerancia de «a ras de la marca» a 1440.** Se compara la caja del enlace de la marca (`[data-cabecera-interior] a[href="#inicio"]`, el mismo selector de `fidelidad-cabecera.spec.ts`) con ±1 px; los tres elementos miden 110 px. A 1024 y 375 se compara con la caja de `#servicios > *` (mismo método que `fidelidad_cabecera` @s1).
5. **El `div.acciones` se conserva** como contenedor del único botón (`data-hero-acciones`): `fidelidad_hero` @s1 habla de «la botonera» y @s5 de la 48 admite «el contenedor que lo envuelve, si lo hay». No lo exige ninguna prueba de esta ola; decide la ola 2 si la animación cuelga de él o del enlace.
6. **Contenido a 812x300.** Con el relleno vertical simétrico de 32 px la sección mide más que la ventana y no recorta (medido); el contenido (titular a botón) más 64 px de cabecera supera 300 px, que es la premisa que la prueba exige.

## 7. Pendientes y avisos para el `craftsman_lead` / otras olas

- Ola 2: añadir el congelado del reloj + colocación de animaciones a `@s12` de `hero-reducido.spec.ts` (ver desvío 2) y decidir sobre qué elemento cuelga la animación (`div.acciones` o el enlace).
- Comentarios con números de línea o selectores del hero que ahora son falsos, en ficheros que NO eran de esta ola: `src/components/ReservaChat.module.scss` (cita `Hero.module.scss`, `.acciones a`), `src/components/Equipo.module.scss` (cita el ancho de 720 px del hero), `src/pages/PaginaTienda.module.scss` y `PaginaCampanas.module.scss` (citan líneas de `Hero.module.scss`), `src/lib/diseno/contratoRedisenho.ts` y su test (citan `Hero.tsx:48`), `tests/e2e/geometria-escalas.spec.ts`, `tests/e2e/fidelidad.spec.ts` e `imagenes.spec.ts` (citan líneas de `Hero.module.scss`).
- `feature_list.json` cita `Hero-logica.ts` en notas históricas de una feature `done`: es historia, no hace falta tocarla.
- El fichero del otro agente `src/lib/diseno/escalaMovimiento.ts` rompe `puertaTelefonoHardcodeado.test.ts` por `70.0000000` (ver sección 5); y dos errores de lint en `movimientoRespetuoso.test.ts` y `medicionEstable.ts`.
- `docs/diseno-claude-design/Veterinaria La Sierra.dc.html` queda como histórico, sin tocar, como dice el contrato.
