# Reparación de features/equipo.feature — revisión adversarial (grupo G3)

Fuente: `progress/revision/VEREDICTO_equipo.md`. Los 3 hallazgos del fichero
están marcados CONFIRMADO; los tres quedan atendidos.

## Hallazgo 1 — @s10 (líneas 134-139 originales): guardarraíl vacío, "Nuestro equipo" nunca se fija en positivo

- **Qué cambié:** en `@s1` (línea 66-67 tras la reparación) añadí dos `Then`/`And`
  nuevos que fijan en positivo, con los datos reales, exactamente lo que `@s10`
  niega: `Then la sección tiene un encabezado de nivel 2 cuyo nombre accesible es
  "Equipo"` y `And existe una región cuyo nombre accesible es "Equipo"`. Sigue el
  mismo patrón que `servicios.feature:90` (fija antes de negar) y
  `campanas_portada.feature:83-87` (región + encabezado establecidos en un
  escenario dedicado).
- **Y en `@s10`** (línea 141 tras la reparación): cambié el literal negado de
  `"Nuestro equipo"` a `"Equipo"`, que es el único rótulo que aparece en todo el
  fichero (Background, `@s1`, `@s2`, `@s7`, `@s9`, el propio `@s10` en su segunda
  aserción) y en el contrato heredado (`docs/contrato-heredado/equipo.feature`:
  "la sección «Equipo»"). "Nuestro equipo" no tenía ninguna fuente ni aparecía
  en ningún otro sitio: era el guardarraíl vacío que alegaba el hallazgo.

## Hallazgo 2 — @s1 (líneas 69-70 originales) + @s7 (línea 116): "tarjeta" nunca se contrata como contenedor con rol/nombre propio

- **Qué cambié:** en `@s1` (líneas 71-72 tras la reparación) sustituí `And junto
  a "Marcos Pérez" se muestra el texto "Veterinario"` / `"Joaquín Herranz" /
  "Auxiliar"` por `And dentro de la tarjeta de "Marcos Pérez" se muestra el
  texto "Veterinario"` / `"Joaquín Herranz" / "Auxiliar"`. "junto a" era
  proximidad textual global (implementable con un `getByText` sin comprobar el
  emparejamiento persona↔rol); "dentro de la tarjeta de X" reutiliza el mismo
  vocabulario que el propio fichero ya usa para localizar de forma inequívoca
  cada tarjeta por el nombre del profesional (`Given la tarjeta de "Marcos
  Pérez" está colapsada` en `@s3`/`@s4`/`@s5`/`@s6`, y `el texto accesible de la
  tarjeta de "Joaquín Herranz"` en `@s7`), así que ahora las dos aserciones de
  rol quedan ancladas al mismo contenedor que ya identifica de forma única el
  encabezado de nivel 3 fijado dos líneas antes en el mismo escenario.
- **@s7 (línea 118 tras la reparación) no se tocó**: ya usaba `el texto
  accesible de la tarjeta de "Joaquín Herranz" se limita a...`, que es
  precisamente el patrón de anclaje por tarjeta que el hallazgo pedía extender
  a `@s1`. Se cita como evidencia en el veredicto, no como línea a reescribir.

## Hallazgo 3 — @s9 (líneas 126-132 originales): el título promete "no arrastra al resto" pero el Then no lo comprueba

- **Qué cambié:** añadí `And la sección contiene exactamente 2 tarjetas de
  profesional` como última línea de `@s9` (línea 135 tras la reparación). Los
  dos `Then` anteriores solo contaban encabezados de nivel 3 y fijaban sus dos
  nombres, lo que deja pasar una implementación que renderice una tercera
  tarjeta huérfana (contenedor vacío o botón sin encabezado) para el
  profesional de nombre vacío. La nueva línea obliga a que el número total de
  tarjetas coincida con el número de encabezados (2), cerrando exactamente el
  modo de fallo que el título del escenario dice cubrir. El rótulo "tarjeta de
  profesional" sigue el mismo patrón ya usado en el proyecto para contar
  contenedores por dominio ("tarjeta de producto" en `pagina_tienda.feature`,
  "tarjeta de campaña" en `campanas_portada.feature`/`pagina_campanas.feature`),
  con "profesional" tomado del propio vocabulario de
  `docs/datos-galapavet.md` §4 y `project-spec.md` (Decisión 4): no es un
  literal nuevo, es la aplicación mecánica de un patrón ya existente al
  hallazgo concreto.

## Resumen

| Hallazgo | Ancla | Acción |
| --- | --- | --- |
| 1 | @s10 (antes 134-139) | Fijado positivo en `@s1` (nuevas líneas 66-67) + literal corregido en `@s10` (línea 141) |
| 2 | @s1 (antes 69-70) + @s7 (116) | Reescritas líneas 71-72 de `@s1` con anclaje "dentro de la tarjeta de X"; `@s7` sin cambios (ya correcto) |
| 3 | @s9 (antes 126-132) | Añadida guarda anti-vacuidad (línea 135) |

3 de 3 hallazgos CONFIRMADO atendidos. 0 hallazgos REFUTADO (no se tocan).
