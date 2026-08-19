# Reparación — features/informacion_contacto.feature

Fuente: `progress/revision/VEREDICTO_informacion_contacto.md` (4 hallazgos, los 4 CONFIRMADO).
Directiva del humano: Decisión 11 de `project-spec.md` aplicada solo a `@s9` línea 165
(tipografía/hoja de estilo) y a `@s10` líneas 172-173 (petición diferida real); el resto se repara
según su propio motivo del VEREDICTO.

## Hallazgos atendidos

1. **`@s9` línea 165, bloqueante** — "ninguna imagen, tipografía, hoja de estilo ni script...
   declara un origen ajeno" era vacuamente cierto para tipografía/hoja de estilo porque
   `vite.config.ts` fija `css: false` (ninguna SCSS real llega al DOM de jsdom).
   **Cambio (línea ~179-180):** se separó la aserción en dos. La mitad DOM-observable
   (`imagen`/`script`, sí testable vía atributo `src`) se queda como `And` normal. La mitad
   tipografía/hoja de estilo se movió a un `And` propio, prefijado `[Decisión 11 — verificado con
   navegador real (Claude in Chrome / skill browser-automation), fuera del gate de
   Vitest/Stryker]`, declarando explícitamente en el propio escenario el método de verificación,
   tal como exige la Decisión 11 de `project-spec.md`.

2. **`@s9` línea 167, grave** — "ese aviso es texto visible" se evaluaba con `toBeVisible()` de
   jest-dom, que depende de `getComputedStyle()`; con `css:false` una clase `.sr-only` real nunca
   se resuelve en test, así que un aviso oculto solo para lectores de pantalla pasaría en verde
   igual que uno realmente visible. Por directiva del humano, este hallazgo NO se enruta por
   Decisión 11 (no se declara "verificado con navegador real"): se repara sustituyendo la
   aserción dependiente de CSS por una aserción DOM/ARIA-consultable, coherente con el Invariante 5
   del proyecto (estado condicional en atributo ARIA, no en clase CSS).
   **Cambio (líneas ~182-183):** "ese aviso es texto visible..." pasa a "ese aviso existe como
   texto del documento dentro de la región..., no solo como valor de un atributo aria-label o
   aria-describedby" (impide que la descripción viva solo en un atributo, sin ningún nodo de texto
   real) + nuevo `And` que exige que el elemento portador no declare `aria-hidden="true"` ni
   `hidden` (ambos atributos son consultables sin CSS). Se documenta en la cabecera del fichero
   (punto 3 de "QUÉ CAMBIA") que la distinción fina "visible a la vista" vs. "solo accesible"
   (p. ej. `.sr-only` real) queda fuera de este `.feature` y pasa a la puerta de accesibilidad, ya
   que ninguna reformulación dentro de Vitest con `css:false` puede cerrar ese hueco por completo.

3. **`@s10` líneas 172-173, bloqueante** — "no se ha solicitado nada al proveedor externo mientras
   el marco sigue fuera de la ventana visible" es vacuamente cierto en este stack: `jsdom` no
   dispara peticiones de red reales (no hay `resources: 'usable'` en `vite.config.ts`) y
   `IntersectionObserver` está sustituido por un observador inerte en `src/test/setup.ts` que nunca
   invoca su callback. La primera línea del `Then` ("el marco del mapa declara carga diferida", el
   atributo `loading="lazy"`) el VEREDICTO la da por buena y no se tocó.
   **Cambio (línea ~189):** el segundo `And` se prefijó con
   `[Decisión 11 — verificado con navegador real (Claude in Chrome / skill browser-automation),
   fuera del gate de Vitest/Stryker]`, dejando la primera línea del escenario intacta tal como
   pide la directiva.

4. **`@s3` líneas 112-118, grave** — el modo de error común del proyecto ("teléfono que no
   normaliza → el normalizador lanza, falla cerrado", `project-spec.md` línea 73-74) no lo
   ejercitaba ningún escenario de este fichero, pese a que el panel renderiza 3 enlaces `tel:`
   (2 en `@s3`, 1 en `@s5`). `@s11` prueba un valor válido y `@s12` prueba ausencia, pero ninguno
   prueba "presente pero inválido". `pie_de_pagina.feature` sí lo prueba (`@s15`) sobre su propio
   teléfono de urgencias.
   **Cambio:** nuevo escenario `@s16` añadido al final del fichero (líneas ~231-236), mirror
   directo de `pie_de_pagina.feature @s15`: valor truncado del teléfono real de la clínica
   ("91 082 92", 7 dígitos, derivado mecánicamente del dato real "91 082 92 67" sin inventar nada),
   exige que la operación falle lanzando un error con el valor recibido en el mensaje y que no se
   renderice ningún enlace `tel:` a medias. No se tocó `@s3` ni `@s5`: sus datos y forma ya eran
   correctos, el hueco era de cobertura, no de contenido.

## Cabecera del fichero

Se actualizaron los puntos 3 y 5 de la sección "QUÉ CAMBIA RESPECTO AL CONTRATO HEREDADO" para
documentar: (a) la aplicación de la Decisión 11 a `@s9`/`@s10` y el motivo de que el aviso visible
de `@s9` NO se resuelva por esa misma vía; (b) la existencia de `@s16` y su porqué.

## Hallazgos NO tocados (ninguno)

Los 4 hallazgos CONFIRMADO de la tabla se atendieron todos. Ninguno se descartó por considerarse
ya cubierto.
