# TDD — feature 48 `hero_reducido_con_animacion` — ola 2A: la animación real del hero y sus pruebas de navegador

> `tdd_craftsman`, 14/10/2026. Contrato firmado por Pablo el 13/10/2026.
> Escenarios míos: `hero_reducido_con_animacion` **@s5**, **@s6**, **@s7**, **@s9** (solo los
> tres instantes por tres anchos, con el reloj congelado) y la cláusula pendiente de la ola 1A de
> **@s12** (reloj congelado antes de navegar y animaciones colocadas en el último instante), más las
> guardas «> 0» que la ola 1B dejó pendientes.
>
> **Estado: VERDE** para lo mío. Quedan **3 rojos de e2e en specs AJENOS** (otro agente): dos NO los causa mi
> animación (fallan igual con una build sin ella) y uno es una interacción de diseño. Sección 9.
>
> No se ha ejecutado Stryker. No se ha tocado `features/`, `feature_list.json`, `progress/current.md`,
> `project-spec.md` ni `git add/commit`.

## 0. Estado final, medido en esta máquina

| Puerta | Resultado |
| --- | --- |
| Vitest sobre mis ficheros (`Hero.test.tsx`, `movimientoRespetuoso.test.ts`, `accesibilidad-movimiento.test.ts`) más las puertas de la ola 1B (`escalaMovimiento`, `inventarioModulos`, `puertaTelefonoHardcodeado`) | 6 ficheros · 237 pruebas · verde |
| `pnpm test` completo | **90 ficheros · 1748 pruebas · exit 0** (incluye `medicionEstableSpecsReales.test.ts` del otro agente: mi spec pasa la comprobación estática de @s10) |
| `tests/e2e/hero-reducido.spec.ts` | **50 pruebas, 0 fallos**; y 208/208 con `--repeat-each=4 --workers=6` junto a `css-presupuesto.spec.ts` (sin intermitencias) |
| `css-presupuesto.spec.ts` | verde. CSS servido: 70 583 B sin comprimir, 9 456 B gzip (techo 12 000 B codificados) |
| e2e COMPLETO (`tests/e2e`, 240 + 3) | **240 pasan, 3 fallan, los 3 en specs ajenos** (sección 9). Sobre una build SIN animación (sabotaje S14), `accesibilidad.spec.ts` y `movimiento.spec.ts` dan 17 pasan y 5 fallan: los mismos 2 de `accesibilidad` (ratio 1,1248) y 3 de `movimiento` @s22 (por no haber animaciones que esperar) |
| `pnpm run lint` | 0 errores en MIS ficheros. Falla por ficheros ajenos: `tests/e2e/entrada-del-hero.ts:141` (`preserve-caught-error`) y `tests/e2e/movimiento.spec.ts:431` y `:481` (`no-array-sort`) |
| `pnpm run typecheck` (`tsc -b`) y `tsc -p tsconfig.e2e.json --noEmit` | 0 errores en MIS ficheros. Falla por `tests/e2e/movimiento.spec.ts(342)`: `TS2339`/`TS7006`, porque `animacion.effect` es `AnimationEffect \| null` y `getKeyframes` es de `KeyframeEffect` (mi `leerAnimaciones` lo resuelve con `as KeyframeEffect`). Consecuencia: `pnpm run build` (que empieza por `tsc -b`) y por tanto el `webServer` de `playwright.config.ts` fallarían ahora mismo |
| Stryker | NO ejecutado (regla de la ola) |

Cómo corrí el e2e completo sin pisar `dist/`: `vite build --outDir <scratchpad>` + `vite preview --outDir` en el 4173,
bajo el candado, con `reuseExistingServer`. El `dist/` del repo lo reconstruyeron mis dos primeras ejecuciones (el
`webServer` hizo `pnpm run build`, que entonces compilaba) y contiene la animación; está en `.gitignore`.

## 1. Ficheros

Producción: `src/components/Hero.module.scss` (la entrada animada, solo CSS). `Hero.tsx` NO cambia: el titular se
alcanza desde `.contenido h1`, el párrafo ya tenía `.subtitulo` y `data-hero-subtitulo`, y el contenedor del botón ya
tenía `.acciones` y `data-hero-acciones`.

Pruebas: `src/components/Hero.test.tsx` (lectura de la hoja), `tests/e2e/hero-reducido.spec.ts` (el navegador),
y solo para añadir las guardas `src/lib/diseno/movimientoRespetuoso.test.ts` y `src/lib/accesibilidad-movimiento.test.ts`.

## 2. El SCSS (diseño fijado por el lead, sin cambios)

Un único bloque `@media (prefers-reduced-motion: no-preference)` al final de `Hero.module.scss`:
`animation: entrada-del-hero 700ms ease-out backwards` sobre `.contenido h1`, `.subtitulo` y `.acciones` (el contenedor
del botón, no el enlace), con `animation-delay` de `0ms`, `120ms` y `240ms` en literal, y `@keyframes entrada-del-hero`
(`from { opacity: 0; transform: translateX(-40px) }`, `to { opacity: 1; transform: none }`) dentro de la misma consulta.
Nada en `reduce`, ninguna `opacity: 0` ni `visibility: hidden` fuera de los fotogramas, sin `will-change`.
Con esta hoja las puertas de la ola 1B (escala @s16, `no-preference` @s8, inventario @s20 y @s33) siguen en verde sobre
las 20 hojas reales: es la prueba de que puertas y animación encajan.

Lightning CSS la minifica a `animation:.7s ease-out .12s backwards _entrada-del-hero_airh8_1` y escribe el fotograma
inicial como `transform:translate(-40px)`; el final se queda en `none` (MEDIDO sobre el `dist/`).

## 3. Ciclos Rojo → Verde → Refactor

| # | `@s` | ROJO | VERDE (mínimo) | REFACTOR |
| - | ---- | ---- | -------------- | -------- |
| 1 | @s8 y @s20, guardas | `movimientoRespetuoso.test.ts`: `recuentoDeFotogramas` esperaba > 0 y daba 0; `accesibilidad-movimiento.test.ts`: `recuentoDeBloquesQueAparecenAnimando` esperaba > 0 y daba 0 | (se cierran con el ciclo 2) | — |
| 2 | @s5/@s6/@s7/@s8 (la hoja) | `Hero.test.tsx`: «la hoja real declara la entrada…» (`hay 0 bloques "@media (prefers-reduced-motion: no-preference)"`) y «el lector común… ve… tres "animation"…» (0 declaraciones). Las 23 hojas sintéticas con defecto y las dos bien escritas nacieron verdes: solo prueban la auditoría | el bloque `@media … no-preference` con las tres reglas y los fotogramas | un fallo de MI test (un fragmento esperado sin `;`) y `inventarioModulos` @s24 en rojo: **mi comentario de la hoja decía «una red de seguridad»** y `puertaLiteralesColor` lee línea a línea nombres de color CSS, `red` incluido; reescrito («no protege de nada»). Lección para quien escriba comentarios en `.scss`: ni `red`, `green`, `white`, `gray`, `lime`, `blue`… ni como palabra suelta |
| 3 | @s5, @s7, @s9, @s12 (navegador) | Rojo equivalente al estado de partida: el sabotaje S14 (la hoja SIN la animación) pone en rojo 4 pruebas reales de `hero-reducido.spec.ts` (@s5, @s7, @s6 «la consulta discrimina» y @s9) y las guardas | ya estaba el SCSS del ciclo 2 | **Honestidad:** escribí el SCSS antes que el spec de navegador (lo pedían la hoja y las guardas en rojo), así que el spec de navegador NACIÓ verde. No me fío de ese verde: lo respaldan las 18+7+6+4 páginas sintéticas con defecto (sección 6) y los 21 sabotajes reales (sección 5) |
| 4 | @s5 (mordida) | `incumple: una animación "infinite"`: `Failed to set the 'currentTime' … non-finite` (un `endTime` infinito) | `colocarAnimaciones` coloca una animación infinita al final de su primera vuelta; la auditoría la señala por `iteraciones` y `instantes de fin` | — |
| 5 | @s7 (mordida) | `incumple: un transform en el estado base del contenedor del botón`: esperaba `su transform es` y salió `su caja cancelada difiere` | **no era un fallo del código, era mi expectativa**: el transform del CONTENEDOR no está en el enlace que se mide; lo ve la caja. Se separó en dos filas: titular (`su transform es`) y contenedor (`su caja cancelada difiere`) | — |
| 6 | @s10 (comprobación estática sobre MI spec) | Un script del scratchpad pasó `comprobarMedicionEstable` por mi spec con 9 sabotajes de ORDEN (medir antes de colocar, congelar después de navegar, no congelar, observador antes de emular `reduce`…): **5 salían VERDE** | los selectores LITERALES (`h1`, `[data-hero-subtitulo]`) dentro del cuerpo de cada función de medida, no en una constante del módulo | con los literales dentro, los 9 sabotajes de orden salen ROJO y el spec real sale `pasa: true`. La comprobación es textual: una constante con el selector es invisible para ella y el bloque salía «exento» por vacuidad |
| 7 | @s7 | — | tres `toBeVisible()` por rol (`getByRole('heading', { level: 1 })`, `[data-hero-subtitulo]`, `getByRole('link', { name: 'Reservar cita' })`) tras cancelar: el árbol de accesibilidad no lo cubría `aria-hidden` ni `display: none` | — |

## 4. Trazabilidad `@s` → test (fichero · nombre del test; nunca números de línea)

### `features/hero_reducido_con_animacion.feature`

- **@s5** (valores aprobados) → `tests/e2e/hero-reducido.spec.ts`, describe «@s5 de hero_reducido_con_animacion: con movimiento permitido los tres elementos entran escalonados con los valores aprobados» › «hay exactamente 3 animaciones con la duración, los retardos, la curva, el relleno y las propiedades aprobados, y en el instante 0 y en el último activo están donde deben». Cada cláusula del contrato vive en la función `incumplimientosDeLosValoresAprobados`: recuento 3, destinos por orden de retardo, duración 700, retardos 0/120/240, fines 700/820/940, mismo `startTime` (**DOCUMENTAL, no es una puerta**: ver el desvío 10), curva computada Y de los fotogramas, 1 iteración, relleno del efecto y computado `backwards`, propiedades `{opacity, transform}`, último fotograma (offset 1) `opacity 1` y `transform none`, instante 0 (opacidad efectiva 0, caja 40 px a la izquierda, misma altura, ±0,5), `endTime − 1 ms` (opacidad ≥ 0,999, desplazamiento < 0,5), ancestros con opacidad 1 y `will-change: auto` con las animaciones canceladas, y «durante su retardo el párrafo y el botón ya están en su estado de partida» (el instante 0 de las dos animaciones con retardo). Mordida: describe «@s5 de hero_reducido_con_animacion: la comprobación muerde (páginas sintéticas con el reloj congelado antes de navegar)»: 2 «no incumple nada: …» y 18 «incumple: …».
- **@s6** (movimiento reducido) → describe «@s6 de hero_reducido_con_animacion: con movimiento reducido no se anima nada y los tres elementos se ven desde el primer fotograma» › «con "reduce" emulado antes de navegar ningún fotograma tiene una animación en curso, los tres se ven en el primero, sin nombre de animación ni retardo» y › «la misma carga con "no-preference" y el reloj congelado antes de navegar encuentra las 3 animaciones: la consulta discrimina y no está muerta». Mordida: describe «@s6 …: la comprobación muerde (páginas sintéticas con "reduce" emulado)»: 1 «no incumple nada», 6 «incumple: …» y «incumple: la consulta muerta…».
- **@s7** (si la animación no corre, todo se ve) → describe «@s7 de hero_reducido_con_animacion: si la animación no se ejecuta, el titular, el párrafo y el botón quedan visibles en su sitio» › «cancelando las animaciones los tres tienen opacidad 1, visibilidad visible, transform none y la caja del último instante activo». Mordida: describe «@s7 …: la comprobación muerde (páginas sintéticas)»: 7 «incumple: …» más «incumple: un elemento oculto para el árbol de accesibilidad (aria-hidden)…» (sobre datos construidos a mano: ninguna hoja puede provocarlo).
- **@s9** (solo los tres instantes por tres anchos) → describe «@s9 de hero_reducido_con_animacion: durante la entrada no hay barra horizontal y el resto de la página no se mueve» › «a 320, 375 y 1440 px y en el instante 0, la mitad y el último instante activo: sin desbordamiento, sin recorte y con las secciones posteriores quietas» (cuenta exactamente 9 casos y 3 anchos). Mordida: describe «@s9 …: la comprobación muerde (páginas sintéticas a 375 px)»: «no incumple nada» y 4 «incumple: …» (recorrido a la derecha sin recorte, alto del hero cambiante, secciones posteriores movidas, hero de alto fijo que recorta). **Las dos cláusulas de CLS sin congelar y el recuento de 6 rutas son del otro agente.**
- **@s12** (la cláusula pendiente de la 1A) → describe «@s12 de hero_reducido_con_animacion: la sección de bienvenida mide al menos la altura de la ventana…» › «en los cinco tamaños habituales mide exactamente la altura de la ventana (900 y no 756 a 1440x900; la de la ventana también a 375 y a 320), no recorta y centra su contenido bajo la cabecera»: ahora llama a `congelarRelojDeAnimaciones` antes del primer `goto` y a `colocarAnimaciones(page, 'final')` antes de cada `medirElHero`, en los cinco tamaños y en 812×300.
- **Hoja de estilos de @s5–@s8** → `src/components/Hero.test.tsx`, describe «@s5-@s8 de hero_reducido_con_animacion: la entrada animada, en lo que se lee de la hoja del hero»: «la hoja real declara la entrada de los tres elementos con los valores aprobados, solo dentro de "no-preference", y deja el estado base visible», «el lector común de las puertas de movimiento ve en la hoja real tres "animation", tres "animation-delay" y unos fotogramas, todo dentro de "no-preference"», «una hoja sintética bien escrita no incumple nada (…)», `it.each` «una hoja con %s incumple» (23 defectos) y «"opacity: 0.5" y "will-change" dentro de un comentario no son una opacidad 0 ni un "will-change"».
- **Guardas «> 0» de la 1B** → `src/lib/diseno/movimientoRespetuoso.test.ts`, describe «hero_reducido_con_animacion @s8 sobre las 20 hojas reales del inventario» › «lee exactamente 20 ficheros (3 + 12 + 5) y ninguno declara entrada fuera de "no-preference" ni fotogramas fuera de sitio» (ahora con `recuentoDeFotogramas > 0` y `recuentoDeDeclaracionesDeEntradaEnNoPreference > 0`) y `src/lib/accesibilidad-movimiento.test.ts`, describe «@s20 el inventario de bloques que aparecen animando se lee del sitio real y desde el 13/10/2026 solo puede ser el del hero» › «sobre las hojas reales ninguna aparición animada queda fuera de la hoja del hero ni queda invisible sin su animación» (ahora con `recuentoDeBloquesQueAparecenAnimando > 0`, `inventario.pasa === true` y `visibilidad.pasa === true`).

## 5. Sabotajes REALES sobre `Hero.module.scss` (cada uno: aplicar → construir → Vitest → restaurar y `cmp` → Playwright sobre lo construido)

Los 21 se restauraron y se verificaron con `cmp` (todos «restaurado (cmp igual)»; la hoja final es idéntica a la que entrego).
La línea base sin sabotaje (S00) da 0 rojos de Vitest (229 pruebas) y 0 de Playwright (7 pruebas reales). «Playwright» son las 7 pruebas reales de `hero-reducido.spec.ts` (sin las páginas sintéticas); «Vitest» son `Hero.test.tsx`, `movimientoRespetuoso`, `accesibilidad-movimiento`, `escalaMovimiento` y `movimiento-global`.

| Id | Sabotaje | Vitest | Playwright |
| -- | -------- | ------ | ---------- |
| S01 | `700ms` → `1250ms` | ROJO (hoja del hero, escala @s16 ×2) | ROJO @s5 |
| S02 | retardo del párrafo `150ms` | ROJO (hoja, escala ×2) | ROJO @s5 |
| S03 | relleno `both` | ROJO (hoja) | ROJO @s5 |
| S04 | relleno `forwards` | ROJO (hoja) | ROJO @s5 |
| S05 | curva `ease` | ROJO (hoja) | ROJO @s5 |
| S06 | `to { opacity: 0 }` | ROJO (hoja) | ROJO @s5 |
| S07 | `translateX(40px)` (desde la derecha) | ROJO (hoja) | ROJO @s5 |
| S08 | `translateX(-100%)` | ROJO (hoja) | ROJO @s5 |
| S09 | `margin-left` en vez de `transform` | ROJO (hoja) | ROJO @s5 |
| S10 | `will-change: transform` en el titular | ROJO (hoja) | ROJO @s5 |
| S11 | `@media all` en vez de `no-preference` | ROJO ×4 (hoja, lector común, @s33, @s8 de las 20 hojas) | ROJO @s6 |
| S12 | `animation-delay` del párrafo en la raíz | ROJO ×4 (idem) | ROJO @s6 |
| S13 | `opacity: 0` en el estado base del párrafo | ROJO ×2 (hoja, @s20 de las 20 hojas) | ROJO @s7 y @s6 |
| S14 | sin ninguna animación | ROJO ×4 (hoja, lector, @s20, @s8 con las guardas «> 0») | ROJO ×4 (@s5, @s7, @s6 «discrimina», @s9) |
| S15 | `.contenido { opacity: .5 }` (un ancestro) | **verde** (el Vitest no lo mira: lo mata solo el navegador) | ROJO ×3 (@s5, @s7, @s6) |
| S16 | la animación cuelga del enlace y no del contenedor | ROJO (la hoja fija el contenedor) | **verde por diseño**: el contrato admite «el botón o el contenedor que lo envuelve» |
| S17 | sin `overflow: hidden` en el hero | verde | **verde (SUPERVIVIENTE DECLARADO)**: es lo que anuncia el contrato en @s9 («quitar `overflow: hidden` NO crea barra con una entrada desde la izquierda»); no se presenta como cubierto |
| S18 | recorrido de `120vw` y sin `overflow: hidden` | ROJO (hoja) | ROJO @s5 y @s9 |
| S19 | último fotograma con `translateX(0.3px)` | ROJO (hoja) | ROJO @s5 (solo lo caza la lectura del offset 1: ±0,5 px de caja lo deja pasar) |
| S20 | `infinite` | ROJO (hoja) | ROJO @s5 |
| S21 | `transform: translateX(-40px)` en el estado base del contenedor | ROJO (hoja) | ROJO @s5 y @s7 |

## 6. Las páginas sintéticas con defecto (la MORDIDA de cada comprobación)

Todas con la forma del hero real (`#inicio > section[data-a-sangre]`), servidas con `page.route` en un origen falso y
`goto`, con el reloj congelado ANTES de navegar. La MISMA función de auditoría la usan el test real y la sintética: si
midieran con reglas distintas, la mordida no probaría nada del test real.

- **@s5, 18 defectos:** duración 1250, retardo 150, `both`, `forwards`, sin relleno (el párrafo esperaría visible), curva `ease`, `infinite`, desplazamiento desde la derecha, del 100 %, se anima el ancho, se anima `margin-left`, último fotograma con opacidad 0, con 0,3 px, `will-change` permanente, un ancestro a media opacidad, una cuarta animación, falta la del botón, retardos invertidos. Más dos que CUMPLEN: la entrada bien escrita y la animación colgada del enlace.
- **@s6, 6 defectos:** la animación y sus fotogramas fuera de `no-preference` (3 filas, cada una afirma una cláusula distinta: animación en curso, nombre computado, primer fotograma a 0), el retardo fuera con la animación dentro, `opacity: 0` en el titular y en un contenedor; y la consulta muerta con el reloj congelado.
- **@s7, 7 defectos y 1 sobre datos a mano:** opacidad 0, visibilidad oculta, transform en el titular, transform en el contenedor, ancestro a 0, párrafo fuera de pantalla, falta la animación del botón; y `aria-hidden`.
- **@s9, 4 defectos:** recorrido a la derecha sin recorte, alto del hero cambiante, secciones posteriores movidas sin cambiar el hero, hero de alto fijo que recorta.

## 7. MEDIDO en Chromium 151.0.7922.34 (no es documentación oficial)

1. **El reloj congelado sobrevive a la navegación.** Sesión CDP creada con `page.context().newCDPSession(page)` ANTES del primer `goto` y `Animation.setPlaybackRate({ playbackRate: 0 })`: tras TRES `goto` seguidos de la misma página, con `setViewportSize` entre ellos, las tres animaciones nacen con `currentTime` 0 y `startTime` 0 y siguen en 0 tras 1 s de reloj real. **No hace falta `Animation.enable`** (medido con y sin él: idéntico). No hizo falta `await animacion.ready`.
2. **`currentTime =` coloca y se queda.** En `endTime − 1 ms`: opacidad 0,999996 y `matrix(1, 0, 0, 1, -0.000154008, 0)`, exactamente las cifras del contrato. Medio de la fase activa (`retardo + 350`): opacidad 0,684643 y desplazamiento −12,6143 px.
3. **Sobre el `dist/` real:** `animationName` computado `_entrada-del-hero_airh8_1` (CSS Modules lo renombra); duración 0,7 s; retardos 0 s, 0,12 s, 0,24 s; `animation-timing-function` `ease-out`; `animation-fill-mode` `backwards` (el efecto dice `fill: backwards`); `will-change: auto`; `easing` del EFECTO `linear` y `easing` de cada fotograma `ease-out`; `endTime` 700, 820, 940; `iterations` 1; `getKeyframes()` devuelve el offset 0 con `transform: translate(-40px)` y `opacity: 0` y el offset 1 con `transform: none` y `opacity: 1`.
4. **Geometría a 1440×900:** la caja del titular, del párrafo y del enlace está en x = 110 sin animación, en x = 70 en el instante 0 (40 px), con la misma `y`. El enlace tiene `transform: none` aunque el contenedor se desplace: **su caja es lo que lo delata, no su transform**.
5. **Con `infinite`**, `endTime` es `Infinity`: asignar `currentTime = endTime - 1` lanza `non-finite`.
6. Las 3 animaciones y ninguna transición: `getAnimations()` también devuelve `CSSTransition`; se filtra con `instanceof CSSAnimation`.

## 8. SIN verificar en documentación oficial (para que el lead lo consulte)

- Que `Animation.setPlaybackRate` del dominio Animation de CDP sea, por contrato, la velocidad del reloj del DOCUMENTO y que su persistencia entre navegaciones esté garantizada y no sea un detalle de implementación de Chromium 151. Lo medí; no pude leer el protocolo.
- Qué serializa exactamente `effect.getKeyframes()` (aquí `translate(-40px)` para un `translateX(-40px)` escrito en la fuente: la minificación y/o la serialización del navegador lo normalizan) y que `computedOffset === 1` exista siempre con un `to` implícito (el contrato lo afirma; yo sólo lo vi con un `to` escrito).
- Que el `requestAnimationFrame` equivalga al «fotograma pintado» de @s6. Es la aproximación habitual (el estilo que se lee ahí es el que se pinta en ese fotograma), pero no consulté la especificación del ciclo de renderizado. El observador cuenta además los `animationstart`, que cubren una animación que ya hubiera terminado al leer.
- Los modos de relleno y sus consecuencias sobre LCP (la cláusula `backwards` de @s5) son del contrato; yo no los medí (@s11 es de otro).

## 9. Pendientes y lo que NO he arreglado (specs ajenos)

Tres pruebas de e2e fallan en specs que no son míos y que el otro agente está cubriendo:

1. `tests/e2e/accesibilidad.spec.ts` › «@s38 el indicador de foco del sitio real tiene perímetro y contraste suficientes entre sus dos estados» › «las 6 rutas: perímetro >= 2px CSS y ratio >= 3 entre foco y sin foco, ningún control suprim…» (ratio 1,1248 en la portada).
2. `tests/e2e/accesibilidad.spec.ts` › «@s39 el anillo de foco contrasta con los dos fondos que tiene al lado, no solo con uno» › «las 6 rutas: ratio >= 3 contra el fondo del propio control y contra el de su superficie…» (el mismo 1,1248).
   **No las causa mi SCSS:** MEDIDO, fallan IGUAL (mismo ratio 1,1248191513193695) sobre una build SIN ninguna animación (sabotaje S14). Lo que ha cambiado es `accesibilidad.spec.ts`, que el otro agente edita (`git diff` muestra que añadió `await page.emulateMedia({ reducedMotion: 'reduce' })` al principio de @s38 y @s39, vía (b) de @s10). HIPÓTESIS, NO MEDIDA: con `reduce` emulado en TODA la prueba el anillo de foco se mide en un estado distinto (la regla global de `reduce` pone `transition-duration: 0.01ms` a todo) y sale 1,12. Lo que SÍ está medido es que fallan con y sin mi animación y que el único cambio visible del spec es ese `emulateMedia`; en la ola 1A, con el spec sin tocar, la corrida completa dio 185 pasadas. Lo habrá de resolver quien lo toca.
3. `tests/e2e/movimiento.spec.ts` › «@s22 de accesibilidad: sin la preferencia de menos movimiento el sitio sí se mueve, solo en la portada, y todo queda visible al terminar» › «con el reloj congelado antes de navegar la portada tiene exa…»: `boton: el nombre de animación computado sin la preferencia — Expected: not "none"`. **Es una interacción de diseño, no un fallo del SCSS:** la animación cuelga del CONTENEDOR `[data-hero-acciones]` (diseño fijado por el lead), así que el nombre computado del ENLACE es `none`. Ese spec debe leer el elemento animado (el contenedor) o el destino de la animación (`effect.target`), como hace mi `leerAnimaciones`. (En la build sin animación ese bloque entero se agota por tiempo, como es de esperar.)

Otros pendientes:
- Lint y `tsc -b` globales siguen rojos por ficheros del otro agente (sección 0); en particular `getKeyframes` sobre `AnimationEffect` (cast a `KeyframeEffect`).
- Las dos cláusulas de CLS sin congelar de @s9 y el recuento de 6 rutas (otro agente).
- El cableado de @s10 a los specs reales ya lo tiene el otro agente (`medicionEstableSpecsReales.test.ts`): con mi spec da verde. Comprobé además, con un script del scratchpad, que 9 sabotajes de ORDEN sobre mi spec lo ponen en rojo.
- `fidelidad.spec.ts` @s43, que la 1B señaló como obligado por `getComputedStyle(...).position`, ya no salta en esa comprobación (no es mío).

## 10. Desvíos y ambigüedades del contrato (no inventados)

1. **«En la mitad de la duración de cada una» (@s9).** Lo leí como `retardo + duración / 2` (la mitad de la fase activa de cada animación); la otra lectura, `duración / 2` igual para las tres, dejaría al botón (retardo 240) todavía en su fase de espera. Si el lead prefiere la otra, es una línea en `colocarAnimaciones`.
2. **La hoja se fija más que el contrato** (`Hero.test.tsx`): selectores `.contenido h1`, `.subtitulo` y `.acciones` (exactamente tres reglas de entrada y la animación en el CONTENEDOR del botón), forma `animation: <nombre> 700ms ease-out backwards` más `animation-delay` por regla, y fotogramas `from`/`to` exactos. El contrato admite el enlace o su contenedor; el diseño del lead es el contenedor y la hoja lo fija. S16 lo demuestra: rojo en Vitest, verde en navegador.
3. **`animation-delay: 0ms` explícito en el titular.** Es redundante, pero hace visible en la hoja el 0/120/240 y deja la hoja leíble por la puerta de la escala sin depender de un valor por defecto.
4. **Los selectores están escritos dentro de cada función de medida y no en una constante.** Es lo que obliga la comprobación estática de @s10 (textual): una constante es invisible para ella y el bloque sale «exento» por vacuidad (ciclo 6).
5. **@s6, «el primer fotograma».** Es el primer callback de `requestAnimationFrame` en el que existen los tres elementos; el registro dura 3 s desde el inicio de la navegación y el test espera 2 s tras `load`.
6. **@s7, «fuera de la pantalla»** se mide en horizontal (`x ≥ 0` y `x + ancho ≤ ancho de la ventana`).
7. **Sabotaje EN SITIO de la hoja.** Apliqué los 21 sabotajes sobre `src/components/Hero.module.scss` durante ~25 s cada uno (construcción y Vitest; lo servido salió de un directorio del scratchpad). Si el otro agente corrió Vitest sobre `Hero.*` en esas ventanas, pudo ver rojos falsos. Siempre restaurada y comprobada con `cmp`.
8. **Un proceso mío quedó vivo** (`vite preview` en el 4311, de un script de medida) y lo cerré al terminar. El 4173 está libre.
9. **`scrollWidth` del documento** se lee con `documentElement.scrollWidth` (entero redondeado): una barra de 0,4 px no se vería. La lista cerrada de @s10 ya lo excluye de la obligación por esa razón.
10. **«Las tres empiezan en el mismo instante» (@s5) no se puede probar con el reloj congelado.** MEDIDO en Chromium 151 (`medir_starttime.mjs`, scratchpad): con `Animation.setPlaybackRate` a 0, `startTime` vale 0 para TODA animación, también para una que nace 400 ms de reloj real después de `load` (sin congelar, la misma salió con `startTime` 426,4). La comparación `new Set(startTimes).size === 1` de `incumplimientosDeLosValoresAprobados` es verdadera por construcción: **ninguna de las 18 mordidas la ataca y ninguna hoja de estilos puede ponerla en rojo**. No invento una medida sin congelar (sería la dependencia del reloj que @s5 prohíbe). Lo que garantiza que empiecen juntas es que los tres elementos se montan en el mismo commit de React; lo dejo como cláusula documental en el código y aquí.
