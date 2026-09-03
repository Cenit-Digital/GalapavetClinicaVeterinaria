# Judge — fidelidad_servicios (29)

## Veredicto: APROBADA

Revisión contra `features/fidelidad_servicios.feature`, `progress/fidelidad/delta_servicios.md`, fuente de datos y captura comparativa construida.

| Criterio | Evidencia | Veredicto |
| --- | --- | --- |
| @s1: jerarquía | A 1440 px el navegador verifica «Lo que hacemos», el h2 de dos partes y la localidad real de `datosNegocio`. El apoyo deriva el recuento actual: 5 servicios. | Pasa |
| @s2: tarjetas | Hay exactamente las cinco tarjetas publicadas. Cada una usa foto local arriba, pildora superpuesta, título y resumen procedente de sus puntos; no se crean las diez tarjetas ficticias del prototipo. | Pasa |
| @s3: detalle | Cada control se expande de forma independiente, anuncia `aria-expanded`, revela solo sus puntos y rota su adorno «+». | Pasa |
| @s4: móvil | A 320 px las cinco tarjetas comparten columna y el documento no desborda en horizontal. | Pasa |
| Accesibilidad transversal | El contenedor editorial no introduce un segundo landmark. El orden de teclado de toda la portada contiene los controles nuevos y sigue siendo completo. | Pasa |
| Fidelidad visual | La comparativa inspeccionada muestra la anatomía del diseño: cintillo, tipografía bicolor, superficie de tarjeta, foto, etiqueta y pie de acción. | Pasa |

## Decisiones revisadas

- Se preservan solo los cinco servicios reales. El prototipo contiene quince, pero completar la cuadrícula con nombres o prestaciones inventados sería una promesa comercial falsa.
- «Galapagar» procede de la fuente única de datos de negocio; no queda repetido como literal de diseño.
- La fotografía es decorativa y local, con carga lazy y decodificación async, como el resto de contenido no LCP.

## Addenda — Regresión reparada el 03/09 (oleada B)

Detectada por el judge de campañas y reparada por TDD en la tarea
`regresiones_27_28_29` (`progress/tdd_regresiones_27_28_29.md`):

- **Titular con copy del prototipo** («Servicios veterinarios *de principio a
  fin en Galapagar*»): la Decisión 65 fija «Servicios veterinarios» + «en
  <localidad>» derivado de `datosNegocio.direccion.localidad`. Este judge lo
  dio por bueno porque el unitario (`/Servicios veterinarios/`) y el E2E
  (`toContainText`) eran laxos. Ahora `Servicios.test.tsx` fija el texto
  exacto del h2 y prohíbe la frase, `fidelidad-servicios.spec.ts` @s1 usa
  `toHaveText`, y `datos-reales.spec.ts` @s52 prohíbe «de principio a fin» en
  las 6 rutas servidas.
- **h3 con interlineado 1,15** (`geometria-escalas` @s22, esperado 1,08): la
  tarjeta pisaba el 1,08 de `global.scss`; se elimina la declaración
  (anclado por `Servicios.test.tsx` «@s22 de rediseno_visual»).
- **Las 5 `img` sin fondo de reserva en el propio `<img>`** (`imagenes`
  @s31): el fondo estaba en el `<div>`; ahora `img { @include
  hueco-de-imagen(8, 5) }` y el envoltorio solo posiciona la píldora
  (anclado por `Servicios.test.tsx` «@s31 de identidad_visual»).

Verificación: `fidelidad-servicios.spec.ts` 4/4, `geometria-escalas.spec.ts`,
`imagenes.spec.ts` y `datos-reales.spec.ts` verdes contra el `dist/` final;
comparativa `progress/rediseno/capturas/regresiones_27_28_29_comparativa.png`
mirada: titular «Servicios veterinarios / en Galapagar».
