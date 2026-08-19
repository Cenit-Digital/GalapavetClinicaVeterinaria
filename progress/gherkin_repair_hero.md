# Reparación de features/hero.feature — hallazgos CONFIRMADOS (VEREDICTO_hero.md)

Fuente del veredicto: `progress/revision/VEREDICTO_hero.md`. 2 hallazgos CONFIRMADOS, 0 refutados. Los dos se atendieron.

## `@s12` — grave (L1) — CONFIRMADO

**Motivo original:** el Given fijaba `prefers-reduced-motion`, pero el Then repetía en vacío las
aserciones de contenido de `@s1`/`@s4`-`@s5`/`@s6` sin depender en ningún punto de esa preferencia:
una implementación que ignorase por completo `prefers-reduced-motion` pasaba el escenario igual.

**Qué cambié y dónde:**
- Eliminé el escenario `@s12` completo (antiguas líneas 144-150: `Con movimiento reducido el
  contenido del hero sigue siendo accesible`). No lo sustituí por una variante corregida porque el
  propio veredicto concluye que no hay ninguna lógica en `hero.feature` que ramifique por movimiento
  reducido — el hero no tiene comportamiento propio condicionado a esa preferencia (a diferencia del
  carrusel de `galeria.feature`, que sí decide "suavizado" vs "instantáneo" en lógica propia). Inventar
  una animación de entrada para el hero solo para tener algo que verificar habría violado la regla de
  "no inventar nada nuevo": ningún documento fuente (`project-spec.md`, contrato heredado,
  `docs/datos-galapavet.md`) describe una animación propia del hero.
  - El invariante 4 (estado base visible) para esta sección ya lo cubre de forma transversal
    `accesibilidad.feature` `@s19`-`@s22` sobre las seis páginas (Landing incluida), así que no se
    pierde cobertura del requisito real, solo se retira el duplicado vacuo.
  - Actualicé la cabecera del fichero (nuevo punto 6, líneas ~43-53) para que el `.feature` no siga
    reclamando "el estado base con movimiento reducido" como algo que `hero.feature` verifica por su
    cuenta (era la frase del antiguo punto 5, ahora corregida en la línea 41-42), evitando dejar una
    afirmación de cabecera que ya no es cierta tras el borrado.
- No renombré `@s13` a `@s12` para no reasignar un tag ya citado por el propio veredicto a un
  escenario distinto; queda un hueco deliberado en la numeración.

## `@s13` — bloqueante (L3) — CONFIRMADO

**Motivo original:** el Then de `@s13` solo miraba atributos DOM `src`/`srcset`. La cabecera del
fichero ya asignaba a `@s13` la responsabilidad de vetar el origen de tercero de la futura imagen de
fondo del hero, pero con `test.css: false` (`vite.config.ts`) una imagen servida como
`background-image` de una hoja de estilos nunca se evalúa en Vitest: ni el Then original ni una
variante sobre `style` la detectarían.

**Qué cambié y dónde:**
- Retitulé `@s13` (línea 165) a "La sección de bienvenida no carga recursos de terceros por atributos
  DOM" para acotar su alcance real (solo lo medible en Vitest/jsdom) sin tocar sus Then/And, que
  siguen siendo válidos y verificables tal cual.
- Añadí un escenario nuevo, `@s14` (líneas 170-176), "Ninguna hoja de estilo de la sección apunta a un
  fondo de imagen de un tercero": declara explícitamente en el propio Given que es una verificación en
  navegador real, fuera del gate de Vitest/Stryker, invocando la Decisión 11 de `project-spec.md`
  (añadida el 18/08/2026 precisamente para este tipo de cláusula — "origen real de una hoja de
  estilo" es uno de sus ejemplos literales). Cubre el origen de la propiedad CSS `background-image`
  calculada, con el mismo literal `"images.pexels.com"` ya usado por `galeria.feature:159` (ninguna
  cadena nueva inventada) y una guarda anti-vacuidad ("el número de hojas de estilo inspeccionadas es
  mayor que 0") para que la comprobación no pueda pasar en verde sin haber inspeccionado nada.
- Actualicé la cabecera: la lista de Decisiones citadas (líneas 9-13) ahora incluye la Decisión 11, el
  nuevo punto 6 (líneas 43-60) documenta el porqué de `@s14`, y el bloque PENDIENTE sobre la imagen de
  fondo (líneas 62-68) referencia ahora `@s13` y `@s14` en vez de solo `@s13`.

## Hallazgos no tocados

Ninguno: los dos únicos hallazgos de `VEREDICTO_hero.md` estaban marcados CONFIRMADO y ambos quedan
atendidos arriba.
