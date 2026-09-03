# Judge — fidelidad_cabecera (27)

## Veredicto: APROBADA

Revisión hecha contra `features/fidelidad_cabecera.feature`, la fuente única `src/lib/site.ts`, la captura de producción local y los cambios de esta feature.

| Criterio | Evidencia | Veredicto |
| --- | --- | --- |
| @s1: geometría y datos reales | `data-barra-urgencias-interior` y `data-cabecera-interior` se miden a 1220 px en `fidelidad-cabecera.spec.ts`; la barra y el CTA leen `datosNegocio.telefonoUrgencias`. | Pasa |
| @s2: acciones de escritorio | La región de navegación conserva exactamente 8 enlaces, Tienda sigue siendo un destino propio y el CTA `tel:` queda fuera de ella; el navegador midió todos los controles >=44x44. | Pasa |
| @s3: móvil y teclado | A 320 px el menú declara `aria-expanded`, expone sus destinos y urgencias al teclado, se cierra al navegar y no desborda horizontalmente. | Pasa |
| Marca real | La imagen local no decorativa está dentro del enlace de inicio, con `alt=""`; nombre y descriptor se agrupan en el mismo bloque. | Pasa |
| Accesibilidad transversal | @s38/@s39 pasan por las seis rutas. La corrección de CSS Color 4 hace que la medición siga comprobando el contraste real. | Pasa |
| Fidelidad visual limitada al tramo | Comparativa inspeccionada a 1440/390. Barra roja, cabecera blanca translúcida, marca, navegación, Tienda y CTA reproducen la jerarquía del diseño sin introducir sus datos ficticios. | Pasa |

## Límites revisados

- No se han copiado del prototipo cifras, teléfono, promesas «24 h» o la marca ficticia. Los únicos datos publicados proceden de `datosNegocio`.
- La regla CSS anterior para `.interior > div:first-child` ya no correspondía al DOM nuevo y se eliminó; no deja estilo muerto ni añade otra estructura semántica.
- `color-mix()` queda dentro de `@supports`; el fondo sólido sigue funcionando donde no hay `backdrop-filter`.
- No se oculta el fallo conocido del mapa: la captura registra el iframe sandboxed. Su corrección aprobada (mapa estático local) corresponde exclusivamente a `fidelidad_contacto`.

## Addenda — Regresión reparada el 03/09 (oleada B)

Detectada por el judge de campañas y reparada por TDD en la tarea
`regresiones_27_28_29` (`progress/tdd_regresiones_27_28_29.md`):

- **Logotipo sin fondo de reserva** (`imagenes` @s31): `.marca img` no pintaba
  `--color-fondo-alterno` en el propio `<img>`. Ahora `@include
  hueco-de-imagen(1, 1)` (mismo patrón que el pie), anclado por
  `Cabecera.test.tsx` «@s31 de identidad_visual».
- **«Abrir menú» solo para lectores sobresalía del viewport a 320 px**
  (`fidelidad` @s44, borde derecho 326 > 320): `.textoSoloLectores` solo
  recortaba con `clip-path`. Ahora mide 1×1 px además de recortar; anclado
  por `Cabecera.test.tsx` «@s44 de rediseno_visual». Medido: 1×1 px, borde
  derecho 285,6, `scrollWidth` 320.

Verificación: `imagenes.spec.ts`, `fidelidad.spec.ts`, `fidelidad-cabecera.spec.ts`
verdes contra el `dist/` reconstruido; `accesibilidad.spec.ts` 15/15.
