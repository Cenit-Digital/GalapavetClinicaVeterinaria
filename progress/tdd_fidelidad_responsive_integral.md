# TDD — fidelidad_responsive_integral (feature 38)

Contrato humano aprobado por Pablo el 03/09/2026 en
`features/fidelidad_responsive_integral.feature`.

## Ciclos rojo → verde

| Escenario | Rojo observado | Cambio mínimo que lo llevó a verde | Prueba que lo demuestra |
| --- | --- | --- | --- |
| @s3 | A 768 px el pie conservaba cuatro pistas comprimidas. | Media query de 701 a 1023 px: dos pistas y marca a ancho completo. | `a 768px el pie redistribuye…` y `el pie usa una, dos y cuatro pistas…` |
| @s5 | El botón de menú medía 37,83 px a 320 px al poder encogerse como ítem flex. | Base flex, ancho y alto de 48 px. | `el menú móvil tiene un objetivo táctil…` |
| @s5 | Cada opción de paleta medía 24 px de alto. | `min-height: $altura-control-media` en sus botones. | `los paneles de menú y paleta…` |
| @s6 | A 576 px el grid de cuatro cifras empujaba el contenido del hero fuera de la ventana y su `overflow: hidden` lo ocultaba. | Dos pistas entre 561 y 700 px. | `cada 16px entre 320 y 1600…` |
| Puerta transversal @s37 | Los tres enlaces legales solo medían 17 px de alto. | Área táctil mínima y alineación de los enlaces legales. | `accesibilidad.spec.ts` @s37, seis rutas. |
| Puerta transversal @s23 | Al bloquear las fuentes, `16ch` tomaba el ancho de Arial y el h1 pasaba de dos a tres líneas (71,39 px). | `width: min(100%, 720px)`, equivalente a los ~16ch de Outfit del diseño pero estable durante `font-display: swap`. | `tipografia.spec.ts` @s23. |
| Puerta transversal @s42 | Tras navegar con movimiento reducido, el test podía medir las transiciones de 0,01 ms antes de que acabasen. | Espera por el estado real sin animaciones, igual que tras las interacciones que el test ya cubría. | `movimiento.spec.ts` @s42, seis rutas e interacciones. |

## Trazabilidad completa

- @s1 teléfonos: `cada teléfono conserva las secciones críticas sin recorte, overflow ni errores de consola`.
- @s2 tabletas: `los anchos intermedios conservan controles y secciones dentro de la ventana`.
- @s3 pie: las dos pruebas de rejilla, con límites 700/701/1023/1024.
- @s4 cabecera: `1023px conserva el menú móvil…`.
- @s5 controles dinámicos: las pruebas de objetivo táctil y recorrido por teclado.
- @s6 barrido: cada 16 px entre 320 y 1600, excluyendo únicamente la pista de galería intencionadamente desplazable.

## Resultado

`pnpm exec playwright test tests/e2e/fidelidad-responsive-integral.spec.ts`:
8/8 verdes. La puerta Playwright completa cerró posteriormente en 167/167.
