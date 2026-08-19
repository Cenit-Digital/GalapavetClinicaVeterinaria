# VEREDICTO — features/equipo.feature (grupo G3)

## Alegaciones recogidas

- **L1_G3.md**: 3 hallazgos sobre `features/equipo.feature` (@s10, @s1+@s7, @s9), todos severidad "grave".
- **L2_G3.md**: 0 hallazgos en todo el informe (declara explícitamente "Hallazgos (0)"); ninguno sobre equipo.feature.
- **L3_G3.md**: 0 hallazgos sobre equipo.feature; el propio informe declara textualmente en su sección de cobertura: "equipo.feature y faq.feature no arrojaron hallazgos de mutación (sus anclas usan datos reales con tabla literal y sus guardas son extractor-específicas)".

Total alegaciones únicas sobre este fichero: **3** (todas de L1, sin solapamiento entre lentes, sin duplicados que colapsar).

## Tabla de veredictos

| Ancla | Severidad | Veredicto | Motivo (cita propia) |
|---|---|---|---|
| @s10 (líneas 134-139) | grave | **CONFIRMADO** | La línea 138 (`Then no existe ningún encabezado de nivel 2 cuyo nombre accesible sea "Nuestro equipo"`) niega un literal ("Nuestro equipo") que ningún escenario positivo de equipo.feature establece jamás — busqué "Nuestro equipo" en todo el fichero y solo aparece esta vez, y el legado (`docs/contrato-heredado/equipo.feature`) tampoco lo usa (su Background dice `la sección "Equipo"`, sin "Nuestro"). El propio guardarraíl de la línea 139 (región "Equipo") tampoco está fijado en positivo en ningún otro escenario del fichero. Contrasté con el resto del corpus: servicios.feature SÍ establece en positivo el literal que luego niega (`servicios.feature:90` fija `"Servicios"` como nombre accesible del h2 antes de que `servicios.feature:238` lo niegue), igual que campanas_portada.feature (`:87` fija `"Campañas de prevención"` antes de negarlo en `:191/:205`) y pagina_campanas.feature (`:263` fija `"Qué publica la clínica"` antes de negarlo en `:413/:504`). equipo.feature rompe ese patrón consistente del resto del contrato: si la implementación rotula la sección "Equipo" a secas (patrón que sí siguen el resto de secciones, sin prefijo "Nuestro"), la línea 138 pasa trivialmente aunque la sección se haya renderizado entera, exactamente el guardarraíl vacío que alega L1. |
| @s1 (línea 69-70) + @s7 (línea 116) | grave | **CONFIRMADO** | Verifiqué que "tarjeta" nunca se define en equipo.feature como unidad con rol/nombre accesible propio — aparece solo en steps que la dan por supuesta (p. ej. línea 90 `Given la tarjeta de "Marcos Pérez" está colapsada`, línea 116 `And el texto accesible de la tarjeta de "Joaquín Herranz" se limita a...`), nunca en un Then que la contrate como contenedor localizable. Contraste decisivo con el fichero hermano del mismo grupo: `servicios.feature:61` declara explícitamente en su cabecera "sección, así que toda aserción se acota a la tarjeta" — es decir, ese fichero resuelve por escrito la ambigüedad que equipo.feature deja abierta. Sin esa declaración ni un rol/contenedor fijado, "junto a «Marcos Pérez» se muestra el texto «Veterinario»" (línea 69) es implementable con un `getByText` global que no comprobaría que el rol está emparejado con la persona correcta si ambos roles se intercambiaran entre las dos únicas tarjetas del fichero. |
| @s9 (líneas 126-132) | grave | **CONFIRMADO** | Comprobé el texto exacto: el título del escenario (línea 127) promete "no arrastra al resto", pero el único Then de contenido (línea 130, `Then la sección contiene exactamente 2 encabezados de nivel 3`) solo cuenta encabezados h3 y fija sus dos nombres accesibles (líneas 131-132); no dice nada sobre ausencia de restos de marcado (botón huérfano, contenedor vacío) para el tercer profesional sin nombre. Una implementación que deje una tarjeta huérfana (p. ej. un `<div>` vacío o un botón sin encabezado asociado) para el profesional de nombre vacío satisface igualmente "exactamente 2 encabezados de nivel 3" y los dos nombres accesibles, pasando el escenario pese a ser precisamente el modo de fallo ("arrastra al resto") que el título dice cubrir. |

## Resumen

- Total alegaciones sobre este fichero: **3**
- Confirmados: **3**
- Refutados: **0**
- Duplicados colapsados: **0**
