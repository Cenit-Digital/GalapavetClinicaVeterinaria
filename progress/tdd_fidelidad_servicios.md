# TDD — fidelidad_servicios (29)

## Contrato y alcance

- Contrato humano aprobado el 03/09/2026: `features/fidelidad_servicios.feature` (@s1–@s4).
- Alcance: composición de Servicios de la portada. No añade prestaciones ni altera el catálogo publicado de cinco bloques.

## Rojo → verde

1. Se creó `tests/e2e/fidelidad-servicios.spec.ts` antes de cambiar la sección. Sus cuatro escenarios fallaron contra la estructura anterior: no había cintillo, apoyo, resumen, pildora superpuesta ni control visual de detalle.
2. Se añadió `resumenDeServicio` a `Servicios-logica.ts`, acompañado por una prueba que descarta vacíos y conserva solo los dos primeros puntos reales.
3. Las tarjetas se reconstruyeron con imagen local decorativa, pildora derivada del título, título, resumen literal y un control accesible independiente. El detalle continúa renderizándose solo al abrir, con `aria-expanded` y `aria-controls` reales.
4. El círculo «+» es decorativo por CSS y gira al expandirse; no duplica texto para lector de pantalla. A 320 px la rejilla se reduce a una única columna sin overflow.
5. La primera pasada global detectó que un `<header>` interno creaba un segundo landmark `banner`. Se sustituyó por un contenedor editorial con `data-servicios-cabecera`. El recorrido de foco, ahora con cinco controles genuinos más, se aceleró sin cambiar su aserción funcional.

## Evidencia final

- `bin/harness test`: 88 archivos, 1309 tests verdes.
- `pnpm run lint` y `pnpm run build`: verdes; CSS gzip 8.68 kB, dentro del techo aprobado de 12,000 B.
- Playwright de Servicios, presupuesto CSS, imágenes y escala tipográfica: 9/9.
- Capturas inspeccionadas: `progress/rediseno/capturas/fidelidad_servicios_{1440,390,comparativa}.png`.

La consola global sigue registrando el iframe sandboxed de OpenStreetMap. Es el fallo conocido, deliberadamente no ocultado, que queda en `fidelidad_contacto`.
