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
