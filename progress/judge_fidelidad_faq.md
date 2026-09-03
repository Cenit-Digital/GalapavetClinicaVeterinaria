# Review — `fidelidad_faq` (35)

**Veredicto: APPROVED.**

- La regla `:global(#faq) > .faq` gana al contenedor genérico de la landing,
  por lo que el máximo de 860 px ya no queda muerto por especificidad.
- La cabecera se centra sin centrar el contenido de las respuestas.
- El círculo `+` se pinta con un pseudo-elemento; su contenido no entra en el
  nombre accesible gracias al `aria-label` exacto de cada control.
- El acordeón excluyente y la operación por teclado se ejercitan en navegador.

Puertas específicas: 15 unitarias, 3 Playwright y build, todas verdes.
Mutación: no hay lógica nueva; se referencia la medición oficial de la lógica
reutilizada en `progress/mutation_faq.md`.
