# VEREDICTO — features/campanas_portada.feature (G3)

Verificador independiente. Fuentes de alegaciones: `progress/revision/L1_G3.md`,
`progress/revision/L2_G3.md` (0 hallazgos), `progress/revision/L3_G3.md`.
Fuentes primarias contrastadas: `features/campanas_portada.feature`,
`docs/datos-galapavet.md`, `project-spec.md`, `stryker.config.json`,
`vite.config.ts`, `features/galeria.feature` (comparación citada por L3).

Total alegado sobre este fichero: **6** (3 de L1, 0 de L2, 3 de L3).
Ninguna pareja de alegaciones coincide en el mismo defecto de fondo → 0 duplicados colapsados.

| Ancla | Severidad | Veredicto | Motivo (cita propia) |
| --- | --- | --- | --- |
| Background (líneas 78-80) vs @s9/@s10/@s15 | grave | **REFUTADO** | Los pasos `Given`/`And` de Gherkin son procedimentales, no proposiciones simultáneas: el Background se ejecuta y se satisface primero (línea 79, cierto en ese instante), y el `Given` propio de cada escenario muta el estado *después* (línea 146: "declara el precio «49 €»"; línea 189: "el catálogo de demo no tiene ninguna campaña"). Es el mismo patrón «base + anulación puntual» que usa @s15 sin que ningún lente lo objetara allí, luego no es un patrón inconsistente del fichero, es el idioma normal de este contrato. |
| @s9, @s10 (líneas 144-149) | grave | **CONFIRMADO** | El `When` de la línea 147 ("se construye el modelo de la sección de campañas") solo nombra la construcción pura, pero la segunda línea del `Then` (línea 149: "no se renderiza ninguna tarjeta de campaña") exige un hecho de la capa de render sin que ningún `When` la invoque — rompe la disciplina de plano único que el propio fichero usa en @s15/@s17 ("When se renderiza la portada" → Then solo sobre render). Y `stryker.config.json` línea 3 excluye explícitamente `.tsx` de mutación ("StrykerJS no muta... JSX"), así que el contrato no dice quién atrapa la excepción ni si esa segunda aserción cae dentro de la superficie mutada. |
| @s16 (líneas 194-199), "falla a medias" vs política fail-closed | grave | **REFUTADO** | `project-spec.md` líneas 69-74 fija DOS reglas distintas, no una: "Dato de negocio ausente → no se renderiza el bloque" y, aparte, "Dato de negocio inválido en la fuente... falla cerrado". La cabecera del propio fichero (líneas 12-13) las cita ambas. Un título vacío es el caso "dato ausente" de esa tarjeta concreta → aplica la regla 1 (esa tarjeta no se renderiza), exactamente lo que hace @s16. Precio/vigencia declarados es el caso "dato inválido en la fuente" → aplica la regla 2 (falla cerrado toda la sección), exactamente lo que hacen @s9/@s10. No hay una política, hay dos, cada escenario aplica la que le corresponde. |
| @s13 (líneas 173-178), puerta anti-terceros más débil que su análoga | grave | **CONFIRMADO** | `features/galeria.feature:157` rechaza cualquier origen que no empiece por "http://", "https://" **ni por "//"**; `campanas_portada.feature:177-178` solo rechaza "http://", "https://" y la cadena "pexels". Un origen `"//cdn.otrohost.com/foto.jpg"` no contiene ninguna de esas tres cadenas y pasaría @s13 pese a ser una petición real a un tercero, violando la Decisión 9/Invariante 3 que la propia cabecera cita (líneas 14-15). |
| @s16 (líneas 194-199), `Then` ciego a la identidad de los supervivientes | grave | **CONFIRMADO** | Líneas 198-199 solo afirman "hay exactamente 2 tarjetas" y "ninguna... vacía"; ningún escenario del fichero (ni @s2, que solo cubre el catálogo íntegro de 3) ancla qué 2 títulos concretos deben sobrevivir al filtro. Un mutante que descarte la campaña equivocada o duplique una superviviente en vez de mostrar las 2 correctas mantiene recuento=2 y ningún nombre vacío, y sobrevive. |
| @s16/@s17 (líneas 197, 202) vs @s9/@s10 (línea 147), asimetría "construye modelo" / "renderiza" | grave | **CONFIRMADO** | Comparación literal: línea 147 usa "se construye el modelo de la sección de campañas" (@s9); línea 197 usa "se renderiza la sección de campañas" (@s16); línea 202 usa "se renderiza la portada" (@s17). `stryker.config.json` (comentario línea 3) solo muta `src/lib/**/*.ts` y `*-logica.ts`, con la disciplina explícita de que "toda decisión o derivación se extrae a un módulo puro". Al no exigir @s16/@s17 el mismo verbo "se construye el modelo" que @s9/@s10, nada en el contrato impide que el filtro de título vacío viva entero dentro del `.tsx`, fuera de la superficie que Stryker certifica al 100 %. |

## Resumen

- Total alegado: 6
- Confirmados: 4
- Refutados: 2
- Duplicados colapsados: 0
