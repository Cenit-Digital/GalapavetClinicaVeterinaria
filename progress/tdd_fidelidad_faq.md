# TDD — `fidelidad_faq` (35)

Contrato: `features/fidelidad_faq.feature`.

| Escenario | Prueba |
| --- | --- |
| @s1 | `tests/e2e/fidelidad-faq.spec.ts` centra cabecera y lista a 1440 px y mide 860 px como máximo. |
| @s2/@s3 | El mismo spec mide el pseudo-elemento circular de 30 px, verifica el nombre accesible y abre/cierra con teclado. |
| @s4 | El spec comprueba las cinco preguntas publicadas y ausencia de desborde a 320 px. |

## Rojo → verde

1. Se añadió el spec de navegador: falló porque el contenedor de lista y el
   indicador no existían en el bundle anterior.
2. Se incorporaron `data-faq-cabecera`, `data-faq-lista`, la regla específica
   contra el máximo de 1220 px de la banda y el pseudo-elemento circular.
3. El segundo rojo mostró que el contenido CSS `+` contaminaba el nombre
   accesible. Se añadió `aria-label={entrada.pregunta}`; el nombre vuelve a ser
   exactamente la pregunta visible y el indicador permanece decorativo.

Evidencia: `Faq.test.tsx` 15/15, `fidelidad-faq.spec.ts` 3/3 y build verde.
No se modificó `Faq-logica.ts`; su validación de mutación oficial previa se
conserva en `progress/mutation_faq.md` (89/90, un mutante equivalente
justificado, 100 % sobre mutantes no equivalentes).
