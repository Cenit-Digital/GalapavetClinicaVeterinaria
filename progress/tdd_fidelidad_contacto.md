# TDD — fidelidad_contacto (34)

> Estado: **ronda de reparación 1 cerrada en verde** (03/09/2026, 20:20).
> Este documento describe el código que hay en el árbol ahora: número visible
> en un `<p>` + píldora «Llamar ahora», banda en rejilla `1fr auto` con
> plegado por consulta de contenedor. Las referencias antiguas a «la píldora
> ES el número» han desaparecido a propósito (defecto 4 del judge).

## Contrato y alcance

- Contrato humano aprobado el 03/09/2026: `features/fidelidad_contacto.feature` (@s1–@s5), con la Decisión 63 (mapa estático local con pin) y las indicaciones del `craftsman_lead` para esta oleada.
- Alcance: la sección de contacto de la portada (cabecera de sección, tarjeta «Escríbenos», banda de urgencias, tarjeta de datos con mapa local) y la retirada del `iframe` de OpenStreetMap, la única petición a un tercero que quedaba.
- Sin módulo nuevo: la cabecera de la sección vive como `CabeceraDeContacto` dentro de `InformacionContacto.tsx` (el inventario sigue en 18 módulos; `usoDelAcento` en 20 ficheros).
- Enmiendas por escrito (antes/después literal, 7 bloques): `progress/fidelidad/enmiendas_fidelidad_contacto.md`. Los `.feature` vigentes llevan la nota «ENMENDADO el 03/09/2026…» encima de cada escenario tocado (`informacion_contacto` @s5/@s6/@s8/@s9/@s10/@s14, `datos_negocio` @s18).

## Trazabilidad @s → test

| @s | Test(s) |
| --- | --- |
| @s1 cabecera + dos columnas | `InformacionContacto-logica.test.ts` «@s1 el titular de contacto deriva de la localidad» (2 casos) · `InformacionContacto.test.tsx` «@s1 de fidelidad_contacto: la cabecera de la sección» (2 casos) y «el wrapper de contacto de Landing.tsx…» (`?raw`: rejilla auto-fit, `--hueco-contacto` compartido por `gap` y mínimo de columna, sin `17px`) · `tests/e2e/fidelidad-contacto.spec.ts` @s1 (cintillo `p`, `h2` ≠ «Contacto», párrafo sin promesas; formulario y región con la misma `y` ±1 y el formulario a la izquierda) |
| @s2 tarjeta «Escríbenos» | `FormularioContacto.test.tsx` «@s2 … la tarjeta «Escríbenos»» (h3 visible + `aria-labelledby`; el `<form>` ya no declara `data-contenedor-principal`), «… nombre y teléfono comparten una fila» (envoltorio `.filaDoble` + `?raw` grid auto-fit), «… el botón ocupa todo el ancho» (`?raw` `align-self: stretch`) · e2e @s2 (misma `y` nombre/teléfono; email/motivo/mensaje/botón al ancho interior ±1; `label[for]` de los 6 controles; enviar vacío deja `aria-invalid` en nombre) |
| @s3 tarjeta de urgencias | `InformacionContacto.test.tsx` @s5 (1 enlace «Llamar ahora» → `tel:+34918511393`, número visible, sin «24»), @s6 (una sola acción, número una vez, sin reclamos), @s36 reescritos: «banda roja sólida» (fondo `--color-urgencia`, tinta `--color-sobre-primario`, sin `urgencia-suave`/`border-inline-start`/`tarjeta`), «la banda apila rótulo y número a la izquierda (rejilla 1fr auto)…» (`?raw`: `fieldset` grid `1fr auto`, `legend` col 1/fila 1, `p` col 1/fila 2 en `--fuente-titulares`/`paso-tipografico(2)`, sin `accionesUrgencia`), «la píldora «Llamar ahora» es blanca, pequeña y en negrita…» (`?raw`: `sobre-primario`/`urgencia`/`$radio-completo`/`$altura-control-media`/`paso-tipografico(0)`/700, sin `--fuente-titulares`, col 2 abarcando 2 filas), «la banda estrecha se pliega por consulta de contenedor…» (`?raw`: `container-type: inline-size`, `@container (max-width: 28rem)` → una columna y píldora en fila 3, sin `@media (max-width`), «el rótulo de urgencias lleva un punto decorativo pulsante… solo sin reduce» · `matrizDeContraste.test.ts` (fila `urgencia/sobre-primario` ≥ 4,5 en las 5 variantes) · `paginasSeo.test.tsx` @s10 de `seo_estructura` (dígitos del enlace de urgencias leídos del `href`, no vacíos e iguales al número visible) · e2e @s3 (fondo computado = token de urgencia; sin borde lateral; 1 solo enlace «Llamar ahora» con `tel:`; número en `<p>`; píldora blanco/tinta urgencia; **número debajo del rótulo y alineado ±1; píldora a la derecha del número y dentro de la banda; altura ≥ 44; banda ≤ píldora + 2·24 + 1; `font-size` píldora < número; peso 700**; sin «24 h») |
| @s4 mapa local + bloques | `site.test.tsx` @s18 enmendado · `InformacionContacto-logica.test.ts` «@s4 la posición del pin…» (3 casos: nodo 43,53/50,06; esquinas 0/0 y 100/100; una tesela al este = +25 %) y «@s4 el texto alternativo…» (2 casos) · `InformacionContacto.test.tsx` @s8 (img local, alt derivado, 1024×520, `decoding`, antes que los grupos; pin `left/top` derivados), @s9 (ningún `[src]` ajeno, sin iframe/script, atribución enlazada a la licencia), @s10 (`loading="lazy"`), @s14 (sin dirección: sin img/atribución) y «@s4 de fidelidad_contacto…» (2 casos `?raw`: tarjeta `padding: 0`, `.mapa` relativo con `hueco-de-imagen(1024, 520)` a sangre, `.bloques` grid; teléfonos uno por línea, `dl` sin bordes) · e2e @s4 (img local decodificada con `src` bajo `SUBPATH_DE_PRODUCCION`, a sangre en la tarjeta, pin dentro del mapa, atribución visible, 3 `legend`, datos reales, teléfonos en líneas distintas, Horario abarca la fila, **cero peticiones fuera del origen**) · `red-limpia.spec.ts` @s32/@s34 sin excepción · `despliegue-subpath.spec.ts` @s13/@s23 (26 rutas) |
| @s5 apilado a 320 px | e2e @s5 (formulario termina antes de que empiece la región; `scrollWidth` ≤ ventana; ninguna tarjeta desborda; **la banda se pliega: número en una línea y píldora debajo del número, alineada a su borde izquierdo**) · `layout.spec.ts` @s44 verde |

## Ciclos Rojo → Verde → Refactor (implementación inicial, 19:1x–19:34)

1. **@s1** `titularDeContacto` — rojo (no existe) → `Estamos en ${localidad}`.
2. **@s1** `CabeceraDeContacto` — rojo (sin export) → `<p>` cintillo + `h2` derivado + párrafo neutro (sin «urgencias»).
3. **@s1** e2e — rojo contra `dist/` (sin cabecera) → cableado en `Landing.tsx` dentro de `[data-contacto-contenido]`, `.cabecera { grid-column: 1 / -1; max-width: 40rem }`. **Hallazgo**: con tres ítems, `auto-fit minmax(320px)` abría una TERCERA columna (el ítem que abarca la fila ya no deja pistas vacías que colapsar) y las tarjetas medían 384 px. Verde: mínimo de columna «mitad del ancho menos medio hueco» en `Landing.module.scss` (dos columnas como máximo, sin `@media`).
4. **@s2** h3 visible — rojo → `<h3 id>` + `aria-labelledby` (el nombre accesible «Escríbenos» se conserva).
5. **@s2** fila doble — rojo → envoltorios `.campo` (etiqueta + control, `gap: 8`) y `.filaDoble` (`auto-fit minmax(230px)`).
6. **@s2** botón a todo el ancho — rojo (`align-self: flex-start`) → `align-self: stretch`; refactor de la tarjeta: `padding: 32`, `gap: 16`, sin `margin-block-end`, etiquetas paso −1, casilla en texto pequeño/apagado, aviso como nota, `accent-color`.
7. **@s3** tests @s36 reescritos + punto pulsante — rojo → banda `--color-urgencia`/`--color-sobre-primario`, `legend { float: left }` para que la leyenda participe como ítem (rótulo a la izquierda, píldora a la derecha), `.pulso` con `animation: pulso 1.6s` solo en `no-preference` (mismo patrón que `BarraUrgencias`), píldora `sobre-primario`/`urgencia`. **Hallazgo** en e2e: la banda medía 288 px porque `.informacionContacto` seguía siendo una rejilla de dos columnas → `flex-direction: column`. (En esta versión la píldora ERA el número; ver ciclo 16.)
8. **@s3** matriz de contraste — rojo → sale `urgencia/urgencia-suave` (ya no se pinta), entra `urgencia/sobre-primario` (4,83 · 5,18 · 6,04 · 4,83 · 4,83).
9. **@s4** `site.test.tsx` @s18 enmendado — rojo → `COORDENADAS` del nodo OSM en `site.ts`.
10. **@s4** `posicionDelPin` / `describirMapa` — rojo → proyección Web Mercator de teselas (`InformacionContacto-logica.ts`); encuadre en `src/data/mapa.ts` (ruta, 1024×520, zoom 16, tesela 32038/24671, recorte 198, atribución, URL de licencia).
11. **@s4** @s8/@s9/@s10/@s14 enmendados + `?raw` de tarjeta/bloques — rojo → `<img>` local vía `hrefDeDestino` con `alt` derivado, `width/height`, `loading="lazy"`, `decoding="async"`; pin `aria-hidden` con `left/top` en % derivados; `<p class="atribucion"><a href=copyright>© OpenStreetMap contributors</a></p>`; `.bloques` en rejilla; teléfonos uno por línea; horario en líneas compactas. Retirados `SRC_MAPA_TERCERO`, `sandbox`, el aviso de terceros y las excepciones `openstreetmap.org` de `red-limpia.spec.ts` y `despliegue-subpath.spec.ts`.
12. **@s4** e2e — rojo (`naturalWidth` aún 0 tras el scroll) → `expect.poll` sobre la carga diferida; verde.
13. **Refactor visual** (verde): el último bloque impar abarca la fila (`fieldset:last-child:nth-child(odd) { grid-column: 1 / -1 }`) para que Horario no deje una celda vacía; aserción añadida al e2e @s4.
14. **@s5** e2e a 320 px — verde a la primera con la rejilla existente (documentado; el apilado lo da el `auto-fit` que ya cubría @s1).
15. **Puerta de teléfonos** (`puertaTelefonoHardcodeado` @s19) se puso roja por el id del nodo OSM (10 dígitos que empiezan por 6) en dos comentarios de `site.ts` → se cita `docs/datos-galapavet.md` §2bis en vez del número.

## Cambio de rumbo durante la revisión del judge (19:39–19:46) — no fue de este artesano

Entre las 19:39 y las 19:46 una sesión paralela (mtimes en
`progress/judge_fidelidad_contacto.md`) cambió el árbol de «píldora = número»
a «número en `<p>` + píldora "Llamar ahora"», enmendó @s5/@s6 en prosa, dejó un
`throw` de depuración en el e2e y una regla `.accionesUrgencia` sin test. El
judge lo rechazó (19:52). La dirección «Llamar ahora» es la del contrato @s3 y
de la spec aprobados por Pablo; el judge y el lead la ratificaron en la ronda
de reparación 1 (quién/cuándo, en la Enmienda 7). Lo que sigue es cómo la dejé
por TDD.

## Ronda de reparación 1 — ciclos (20:00–20:20), por defecto del judge

### Defecto 1 (bloqueante): `bin/harness init` rojo — `throw` de depuración y `paginasSeo` @s10

- El `throw` del e2e y la lectura del `href` en `paginasSeo.test.tsx` ya no estaban en el árbol cuando arranqué (los retiró la misma sesión paralela, 19:48–19:53); lint y Vitest de la sección en verde al empezar.
- **Ciclo 16 (test-side, verde → verde reforzado).** `paginasSeo.test.tsx` @s10: cita la Enmienda 7 en un comentario y, además de leer los dígitos del `href`, exige que no estén vacíos y que coincidan con el número visible del grupo (`within(grupo).getByText(/\d{2} \d{3} \d{2} \d{2}/)`), para que un `endsWith('')` nunca vuelva a aprobar por accidente.

### Defecto 2 (bloqueante): anatomía de la banda ≠ prototipo, `.accionesUrgencia` sin test

- **Ciclo 17 — ROJO.** e2e @s3: número debajo del rótulo (`cajaNumero.y ≥ cajaRotulo.y + h`), alineado (`|Δx| ≤ 1`), píldora a la derecha del número y dentro de la banda, banda ≤ píldora + 2·24 + 1, `font-size` píldora < número, peso 700. Rojo medido contra `dist/` fresco: el número compartía fila con el rótulo (`5572,95 < 5601,30`). Unitario `?raw` (dos `it` nuevos en @s36): rojo («no se encontró la cabecera `[data-tarjeta-de='urgencia'] p {`»; la píldora no tenía `paso-tipografico(0)`).
- **Ciclo 17 — VERDE.** `InformacionContacto.tsx`: `<p>` y `<a>` hijos directos del `fieldset` (sin envoltorio). `InformacionContacto.module.scss`: `fieldset { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: espaciado(4) espaciado(16) }`; `legend { float: left; grid-column: 1; grid-row: 1; line-height: 1.2 }` (el `float` es lo que saca al `legend` de su papel de «leyenda renderizada» para que sea ítem de la rejilla; la rejilla lo ignora para maquetar); `[data-tarjeta-de='urgencia'] p { grid-column: 1; grid-row: 2; --fuente-titulares; paso-tipografico(2); 600; line-height: 1.1 }`; `[data-tarjeta-de='urgencia'] a { grid-column: 2; grid-row: 1 / span 2; min-height: $altura-control-media; paso-tipografico(0); 700 }` sin `--fuente-titulares`. Sin `.accionesUrgencia` ni `.contenidoUrgencia`. Medido a 1440: banda **96 px** (= 48 + 2·24), rótulo 15,3 px, número 27,5 px, píldora 150×48 px, fuentes 16/25 px.
- **Sonda a otros anchos** (no supuesta: `getBoundingClientRect` en Playwright): a 1100 sigue en una fila (96 px); a 900/760/390 el rótulo se partía en 2-3 líneas y a **320 el NÚMERO se partía en dos líneas** (55 px de alto) porque la columna `1fr` baja hasta el `min-content` («851»). No desborda (por eso @s5 seguía verde), pero no es el plegado del prototipo (`flex-wrap`: la píldora baja).
- **Ciclo 18 — ROJO.** e2e @s5 (320 px): número en UNA línea (`altura número < altura píldora`), píldora debajo del número y alineada a su borde izquierdo → rojo (`55 ≥ 48`). Unitario `?raw`: `container-type: inline-size` + `@container (max-width: 28rem)` con una columna y píldora en fila 3, sin `@media (max-width` → rojo.
- **Ciclo 18 — VERDE.** Consulta de contenedor en la tarjeta (`container-type: inline-size`) y `@container (max-width: 28rem) { fieldset { grid-template-columns: 1fr } a { grid-column: 1; grid-row: 3; justify-self: start; margin-block-start: espaciado(8) } }`. Depende del ancho de la PROPIA banda, no de la ventana: pliega igual a 320 px que en las columnas intermedias del escritorio (760–1000 px). Se retiró el `@media (max-width: 35rem)` que quedaba. Medido: 1440/1100 → 96 px en una fila; 900/760/390 → rótulo y número en una línea cada uno, píldora debajo a la izquierda; 320 → rótulo en dos líneas (columna de 240 px), número en una, píldora debajo. La puerta `puntoDeCorte.test.ts` solo lee `Cabecera.module.scss`; `Hero.module.scss` ya usa un `@media` de anchura, así que el repo no prohíbe la consulta.
- **Refactor (verde):** comentarios del `.tsx` y del `.module.scss` describen «número visible + píldora "Llamar ahora"» y el porqué del `float: left`; nombres de los tests dicen lo que afirman (menor 5).

### Defecto 3 (bloqueante): trazabilidad de enmiendas

- `progress/fidelidad/enmiendas_fidelidad_contacto.md` reconstruido con los **7 bloques literales** antes (`git show 61556d8:…`) / después (árbol): `informacion_contacto` @s8, @s9, @s10, @s14; `datos_negocio` @s18; las aserciones @s36 de `rediseno_visual` en `InformacionContacto.test.tsx` (2 `it` → 4 `it`); y la **Enmienda 7** (@s5/@s6, Gherkin literal) con quién decidió «Llamar ahora» y cuándo (Pablo en la puerta de contratos; judge + lead en la ronda 1; la sesión paralela que lo aplicó a las 19:39–19:46 no fue este artesano). Las notas «# ENMENDADO el 03/09/2026…» sobre @s5 y @s6 ya estaban en `features/informacion_contacto.feature` (19:54) y remiten a este fichero.

### Defecto 4 (grave): este documento

- Reescrito entero: trazabilidad @s3 y @s5 fieles al código, ciclos 16–18 de la ronda, evidencia y captura nuevas (abajo). El bloque «Corrección posterior del CTA» que otra sesión añadió a las 19:55 (ciclos «16–18» suyos, con `legend` absoluto y `.accionesUrgencia`) describía código que ya no existe y se ha sustituido por esta sección.

### Menores 5–10

- **5** nombres de test: `InformacionContacto.test.tsx` @s6 («hay una única acción «Llamar ahora»…»), e2e @s3 («… la píldora blanca de llamada»), comentarios SCSS actualizados.
- **6** `Landing.module.scss`: rojo (`?raw` exige `--hueco-contacto` compartido y ningún `17px`) → `--hueco-contacto: clamp(#{espaciado(24)}, 3vw, 34px)`; `gap: var(--hueco-contacto)`; mínimo de columna `calc((100% - var(--hueco-contacto)) / 2)` (la mitad exacta del ancho que queda tras un hueco: dos columnas caben justas, tres nunca). Edición pequeña en fichero compartido.
- **7** `FormularioContacto.tsx`: rojo (`expect(formulario).not.toHaveAttribute('data-contenedor-principal')`) → atributo retirado del `<form>` y del `<output>` (son ítems de la rejilla, no el contenedor principal; `layout.spec.ts` y `geometria-escalas.spec.ts` siguen leyendo `.first()` = Servicios; verificados en verde).
- **8** e2e @s4: `new RegExp(`^${SUBPATH_DE_PRODUCCION}/img/mapa/`)` en vez del literal retipeado.
- **9** `docs/mapa-estatico.md` ya decía 43,53 % / 50,06 % al arrancar la ronda (lo alineó la sesión paralela a las 19:53); coherente con `posicionDelPin` y sus tests.
- **10** (diseño, anotado, sin cambio): `CabeceraDeContacto` sigue en `InformacionContacto.tsx` por la regla de la oleada (inventario de 18 módulos intocable en paralelo); candidato a `Contacto.tsx` cuando el inventario pueda tocarse en serie. El `<h2>Formulario completado</h2>` de la confirmación (delta contacto-22, prioridad baja) queda fuera de este contrato.

## Incidencia de concurrencia (para el lead)

Durante esta ronda otra sesión editó **mis** ficheros mientras yo trabajaba:
`InformacionContacto.module.scss`/`.tsx` a las 20:06:42, 20:07:47 y 20:09:01
(respondiendo a mis tests rojos con `legend { float: none }`, un envoltorio
`.contenidoUrgencia { display: contents }` y un `@media (max-width: 35rem)`; su
versión daba 4/5 con la banda a 99,2 px). Mi ciclo 17 sustituyó ese tramo
entero (parche por rango, no por texto) y desde las 20:09:06 no ha vuelto a
tocarlos (mtimes comprobados a las 20:20). Los ficheros de mi sección y su
estado final son los de la tabla de evidencia; si el lead ve otro mtime
posterior, no es mío.

## Evidencia (03/09/2026, 20:15–20:20)

- `pnpm exec vitest run` de la sección (`InformacionContacto.test.tsx`, `InformacionContacto-logica.test.ts`, `FormularioContacto.test.tsx`, `paginasSeo.test.tsx`, `Landing.test.tsx`): **78/78** (33 en `InformacionContacto.test.tsx`).
- `pnpm run test` completo: **89 ficheros, 1410 tests verdes** (20:18; otros artesanos añaden tests en paralelo: 1407 a las 20:17).
- `pnpm exec oxlint --deny-warnings` sobre mis ficheros y `pnpm run typecheck`: verdes.
- `pnpm run build` (tsc + vite + puerta de terceros): verde («3 archivo(s) inspeccionados, ninguna referencia a un dominio de terceros»). Un intento anterior (20:12) falló por `ReservaChat-logica.ts` (feature 32, en curso, ajena); el reintento fue verde.
- Playwright sobre `dist/` fresco (`--workers=1`): `fidelidad-contacto.spec.ts` **5/5**; con `layout`, `geometria-escalas`, `fidelidad-lienzo`, `css-presupuesto`, `red-limpia`: **38/38**.
- **CSS servido**: `dist/assets/index-*.css` 75 236 B en crudo, **9 846 B gzip -9** (Vite informa 9,91 kB; incluye ya el CSS de otras secciones en curso) — bajo el techo de 12 000 B (`css-presupuesto.spec.ts` @s49 verde).
- **Peticiones a terceros de la portada: 0** (e2e @s4 recoge todas las peticiones; `red-limpia` @s32 sin excepción).
- **`bash bin/harness init`: exit 1 por una causa ajena** — lint rojo en `src/components/ReservaChat.test.tsx:422-423` (`vitest(no-conditional-expect)`, feature 32 en curso); en ese mismo `init` la suite dio 1410/1410. Ningún fichero de esta sección tiene avisos. Se reintenta al cierre (ver «Pendiente»).

## Veredicto visual propio

`progress/rediseno/capturas/fidelidad_contacto_comparativa.png` (20:17, y `_1440.png`, `_390.png`), más capturas de elemento de `#contacto` a 1440, 900 y 390 miradas una a una:

- **1440**: cintillo «CONTACTO», «Estamos en Galapagar», párrafo apagado acotado; tarjeta blanca «Escríbenos» a la izquierda (nombre/teléfono en fila, email, motivo, mensaje, casilla, botón azul a todo el ancho); a la derecha la banda roja de **una fila**: «● URGENCIAS FUERA DE HORARIO» y debajo «91 851 13 93» grande, píldora blanca «Llamar ahora» pequeña a la derecha; debajo la tarjeta con el mapa a sangre (pin sobre la carretera de Torrelodones), «© OpenStreetMap contributors», DIRECCIÓN / TELÉFONOS (un número por línea) / HORARIO a lo ancho. Es la anatomía de `Veterinaria La Sierra.dc.html` #contacto (contacto-4 del delta) con datos reales.
- **900**: dos columnas estrechas; la banda se pliega (rótulo, número, píldora debajo a la izquierda) sin desbordar.
- **390**: todo apilado; banda plegada; mapa, atribución y bloques en columna.
- Diferencias deliberadas respecto al prototipo: sin «24 h», sin bloque EMAIL, mapa local 1024×520 en vez de un iframe de 240 px, titular derivado, rótulo real más largo («fuera de horario»). El botón flotante «Cambiar paleta de color» que tapa parte de Horario en las capturas es el selector (feature 37, pendiente), no esta sección.

## Pendiente para el lead

- `bash bin/harness init` en verde en cuanto se corrija `ReservaChat.test.tsx:422-423` (feature 32); todo lo mío ya lo está.
- `judge` (segunda ronda) y `mutation_tester` sobre `InformacionContacto-logica.ts` (`titularDeContacto`, `posicionDelPin`, `describirMapa`, `construirEnlaceTelefono`) y `src/lib/site.ts` (`COORDENADAS`). No se ha ejecutado Stryker (regla de la oleada).
- No se ha tocado `feature_list.json`.
