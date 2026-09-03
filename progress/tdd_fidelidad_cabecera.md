# TDD — fidelidad_cabecera (27)

## Contrato y alcance

- Contrato humano aprobado el 03/09/2026: `features/fidelidad_cabecera.feature` (@s1–@s3).
- Alcance: barra superior, cabecera fija, marca, navegación, CTA de urgencias y menú a 320 px. No incluye hero, ni contacto, ni el mapa estático; esos tramos tienen features propias.

## Ciclos rojo → verde

1. `BarraUrgencias.test.tsx`: se exigieron rótulo y teléfono como nodos diferenciados dentro de un único `tel:` y se comprobó que no se declara «24 h». Se cambió la barra a una columna interior de 1220 px, punto decorativo real y teléfono subrayado.
2. `Cabecera.test.tsx`: se exigieron el logotipo real, descriptor dentro de la marca y el CTA de urgencias fuera de la navegación de ocho destinos. Se añadió el bloque de marca, el CTA y sus destinos derivados de la fuente única.
3. `fidelidad-cabecera.spec.ts`: se escribieron las medidas reales a 1440, 1024 y 320 px antes de terminar estilos. Sus tres escenarios comprueban alineación 1220, controles de 44 px, `tel:` real, ARIA, teclado, cierre del panel y ausencia de overflow.
4. `Cabecera-logica.test.ts`: primero falló porque `construirControlDeUrgencias` no existía. Se implementó la derivación pura de rótulo, teléfono, `tel:` y texto compuesto; después se añadieron los casos sin rótulo, rótulo vacío y rótulo de solo espacios para fallar cerrado.

## Regresiones encontradas y resueltas

El fondo translúcido con `color-mix()` devuelve en Chrome `color(srgb …)`. La prueba de contraste solo reconocía `rgb/rgba`, por lo que fallaba sin evaluar el contraste. `tests/e2e/utilidades.ts` reconoce ahora CSS Color 4 y traduce sus canales sRGB normalizados a hexadecimal. No se rebajó ni se desactivó la prueba: @s38 y @s39 volvieron a pasar sobre las seis rutas.

## Evidencia final

- `bin/harness test`: 88 archivos, 1307 tests verdes.
- `pnpm run lint`, `pnpm run typecheck` y `pnpm run build`: verdes. CSS servido: 8.11 kB gzip, bajo el techo humano de 12,000 B.
- Playwright: `fidelidad-cabecera`, `urgencias` y `css-presupuesto`: 7/7; foco y contraste @s38/@s39: 2/2.
- Capturas revisadas a 1440 y 390: `progress/rediseno/capturas/fidelidad_cabecera_{1440,390,comparativa}.png`.

La captura sigue emitiendo el error del iframe OpenStreetMap heredado. Está documentado y aislado para `fidelidad_contacto`; no se presenta como resuelto en esta feature.
