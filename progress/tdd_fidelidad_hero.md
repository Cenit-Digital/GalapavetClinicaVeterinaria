# TDD — fidelidad_hero (28)

## Contrato y alcance

- Contrato humano aprobado el 03/09/2026: `features/fidelidad_hero.feature` (@s1–@s3).
- Alcance: hero de la portada, no las secciones inferiores ni el mapa de contacto.

## Rojo → verde

1. Se escribió `tests/e2e/fidelidad-hero.spec.ts` antes de tocar el componente. Sus tres escenarios fallaron: no existía la estructura centrada exigida, las cifras eran 2/5 en vez de 5/2 y el último contenido caía fuera de la sección.
2. Se sustituyó la relación fija `16 / 9` por un `min-height` fluido gobernado por contenido. El hero sigue siendo a sangre, pero ya no corta el horario ni la banda de cifras.
3. Se añadió la pildora de localidad, la composición central, velo vertical por tokens, botones con relleno real y pista de cifras. La imagen LCP es decorativa (`alt=""`), eager y de prioridad alta.
4. Se corrigió el cableado de `construirCifrasBienvenida`: ahora recibe `SERVICIOS, EQUIPO, GALERIA, horario` en el orden de su firma. La prueba del componente fija los cuatro textos visibles para impedir que se vuelvan a cruzar.
5. Las puertas transversales revelaron dos regresiones de cabecera heredadas: el logo visible no declaraba carga/decodificación y una sonda aún buscaba el descriptor en un `<p>` eliminado. Se corrigieron sin aflojar sus comprobaciones.

## Evidencia final

- `bin/harness test`: 88 archivos, 1307 tests verdes.
- `pnpm run lint`, `pnpm run typecheck` y `pnpm run build`: verdes; CSS gzip 8.32 kB, dentro de 12,000 B.
- Playwright de hero, imágenes de las seis rutas, escalas tipográficas, cabecera, urgencias y presupuesto: 20/20.
- Capturas inspeccionadas: `progress/rediseno/capturas/fidelidad_hero_{1440,390,comparativa}.png`.

El test global de consola todavía encuentra el iframe OpenStreetMap sandboxed de contacto. Es el bloqueo conocido de `fidelidad_contacto`, no se ha rebajado ni ignorado.
