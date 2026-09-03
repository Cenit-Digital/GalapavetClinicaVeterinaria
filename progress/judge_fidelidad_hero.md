# Judge — fidelidad_hero (28)

## Veredicto: APROBADA

Revisión contra `features/fidelidad_hero.feature`, `progress/fidelidad/delta_hero.md`, la fuente única y las capturas construidas.

| Criterio | Evidencia | Veredicto |
| --- | --- | --- |
| @s1: composición | Playwright mide hero a sangre y centra localidad, h1, subtítulo y acciones a 1440 px. Los dos enlaces conservan destino real, relleno y texto sin recorte. | Pasa |
| @s2: banda final | Las cifras visibles son 5 servicios, 2 profesionales, 6 fotos y 3 franjas; su caja queda dentro del hero y el contenido no desborda verticalmente. | Pasa |
| @s3: 320 px | Pildora, h1, acciones y cifras son visibles, quedan dentro de la caja del hero y el documento no obtiene scroll horizontal. | Pasa |
| Datos y promesas | Se corrigió el orden de datos; no aparecen cifras ficticias ni «24 h». El segundo CTA llama al teléfono real de clínica, no inventa una urgencia. | Pasa |
| Carga y accesibilidad | La foto de fondo es decorativa, local, eager, `fetchPriority=high`, mantiene dimensiones y no desplaza el documento. El resto de imágenes sigue lazy/async. | Pasa |
| Fidelidad visual | La comparativa a 1440 y la vista 390 muestran la anatomía del diseño: velo, pildora, titular centrado, acciones y banda de cifras completa. | Pasa |

## Decisiones revisadas

- Se conserva el horario publicado entre las acciones y las cifras. No se elimina información real aunque el prototipo use datos ficticios; ya no tiene línea adicional, sangrado de `dd` ni recorte.
- El velo usa solo tokens. Su parada central al 76% supera 4.5:1 contra los extremos de fotografía para las cinco variantes, comprobado por test unitario.
- La resolución del iframe de OpenStreetMap sigue fuera de este alcance y continúa anotada como bloqueo conocido de `fidelidad_contacto`.

## Addenda — Regresión reparada el 03/09 (oleada B)

Detectada por el judge de campañas y reparada por TDD en la tarea
`regresiones_27_28_29` (`progress/tdd_regresiones_27_28_29.md`):

- **Anillo de foco de los dos botones a 1,98:1 sobre el velo de
  `--color-tinta`** (`accesibilidad` @s38/@s39): cada botón declara ahora
  `outline-color: var(--color-sobre-primario)` bajo `:focus-visible` (mismo
  recurso que la barra de urgencias sobre su rojo); par nuevo en la matriz de
  contraste (`sobre-primario` sobre `tinta`, componente de interfaz, 25 pares)
  y test en `Hero.test.tsx` que verifica ≥ 3 en las cinco variantes contra la
  tinta y contra el velo al 76 % sobre negro y blanco.
- **Enlace de salto «Saltar al contenido principal»** (el control que en
  realidad fallaba primero en @s39): aterriza bajo la cabecera fija, que en la
  portada es el hero a sangre. `global.scss` le da un halo opaco de
  `--color-fondo` bajo el anillo, solo con foco (`src/styles/hoja-global.test.ts`).
- **Cubierta del hero frente a `imagenes` @s31** (tapado hasta hoy por el
  logotipo): la fotografía de fondo, fuera de flujo, no puede cumplir 16:9
  porque su alto lo fija el contenido (este mismo judge aprobó quitar el
  `aspect-ratio`). Enmienda del test, con antes/después literal, en
  `progress/fidelidad/enmiendas_regresiones_27_28_29.md`.

Verificación: `accesibilidad.spec.ts` 15/15 (@s38/@s39 en las 6 rutas),
`imagenes.spec.ts` y `fidelidad-hero.spec.ts` verdes contra el `dist/` final.
