# VEREDICTO — features/pie_de_pagina.feature (G2)

Verificador independiente. Alegaciones recogidas de L1_G2.md, L2_G2.md y L3_G2.md,
filtradas a los bloques que citan `features/pie_de_pagina.feature`.

- L1 (satisfacibilidad/mensurabilidad): 1 alegación sobre este fichero (@s1, grave).
- L2 (fidelidad a fuente primaria): 0 alegaciones sobre este fichero.
- L3 (mutación / verde por vacuidad): 2 alegaciones sobre este fichero (@s11 grave, @s13 menor).

Total alegado: 3. Sin solapamiento de ancla entre lentes en este fichero → 0 duplicados colapsados.

## Tabla de veredictos

| ancla | severidad | veredicto | lentes | motivo |
| --- | --- | --- | --- | --- |
| @s1 | grave | CONFIRMADO | L1 | La cláusula `And en todo el pie no aparece "desde 2013", ni "2013", ni ninguna otra cifra de antigüedad, volumen o reputación` (línea 90) es la única aserción negativa de todo el fichero que no ancla a literales: compárese con @s6 (línea 132, enumera `"24 h"`, `"24h"`, `"365"`, `"todos los días"`), @s7 (línea 140, un símbolo único y acotado `"@"`) o @s8 (línea 148, dominios literales concretos). El propio encabezado del fichero (línea 14) declara el patrón organizacional `doble-de-test-anclado-al-literal-no-al-simbolo` como la disciplina exigida, y esta cláusula lo incumple: dos implementadores honestos podrían escoger listas de literales distintas para 'cubrir' la frase abierta, y el `judge` no tiene con qué arbitrar objetivamente entre ellas. |
| @s11 | grave | CONFIRMADO | L3 | El escenario fija `Given la fuente única declara solo dos páginas legales, porque la tercera no está publicada` (línea 172) y solo comprueba `hay exactamente 2 elementos con rol "link"` (línea 174) más dos negativos genéricos (línea 175: ni `"#"`, ni cadena vacía, ni `"PENDIENTE"`) y la ausencia del rótulo obsoleto `"Privacidad"` (línea 176). Ninguna aserción fija los nombres accesibles ni los destinos de los DOS enlaces que sí sobreviven. @s9, que sí ancla identidad completa (línea 156-159), cubre únicamente el caso de las 3 páginas presentes, no este caso de 2; un mutante que invierta la lógica de selección de cuál página se omite deja el conteo en 2, ningún destino es `"#"`/vacío/`"PENDIENTE"`, y el nombre `"Privacidad"` sigue sin aparecer — el mutante sobrevive sin que ningún Then de @s11 lo detecte. |
| @s13 | menor | REFUTADO | L3 | La alegación afirma que "nada en el contrato lo exige" respecto a que el cálculo del año de copyright viva en un módulo puro. Es falso: `project-spec.md` línea 64-65 fija el **Invariante 6**, de alcance para todo el proyecto: "La lógica de decisión vive en módulos puros (`*-logica.ts`), el `.tsx` solo cablea. Patrón `logica-de-decision-en-modulo-puro-no-en-el-jsx`." Este invariante no necesita ser citado en la cabecera de cada `.feature` para aplicar — es una regla general del contrato que el `judge` contrasta en cualquier feature, igual que el Invariante 1 (dato de negocio con fuente) se aplica sin que cada fichero lo repita. Que otras features (`pagina_tienda.feature`, `reserva_chat.feature`, `seo_estructura.feature`) lo citen explícitamente en su cabecera es redundancia documental, no una condición de aplicabilidad. El cálculo de `© {año} Galapavet` a partir de la fecha vigente (@s12/@s13) es exactamente una "decisión/derivación" cubierta por el Invariante 6 ya existente; no hace falta que `pie_de_pagina.feature` lo repita para que el gate de mutación (`stryker.config.json`, `mutate: src/lib/**/*.ts`, `src/**/*-logica.ts`, `break:100`) lo exija sobre cualquier implementación que respete el contrato general. |

## Resumen

- Total alegado: 3
- Confirmados: 2
- Refutados: 1
- Duplicados colapsados: 0
