# TDD — faq (id 12)

> Bitácora ciclo a ciclo (Rojo → Verde → Refactor), un escenario del
> `.feature` a la vez. Mapa de trazabilidad @s → test al final.

## Confirmación previa (reanudación de sesión)

`node .harness/harness.mjs test` antes de tocar nada: **verde** — 259/259
tests, incluidos `src/components/Faq.tsx`, `Faq-logica.ts` y `Faq.test.tsx`
ya existentes en disco, cubriendo @s1-@s3. `Faq-logica.ts` tenía 3 entradas
del catálogo con la respuesta placeholder literal `'Respuesta'` (servicios,
atención fuera de horario, divulgativa): hueco real, no trabajo terminado.

## @s1-@s3 — verificados retroactivamente contra el `.feature`

No se re-derivan (ya existían y pasaban antes de esta sesión). Verificación
uno a uno contra `features/faq.feature`:

- **@s1** (5 preguntas colapsadas por defecto, `aria-expanded="false"`, sin
  ninguna región expuesta) → `Faq.test.tsx` `@s1 las cinco preguntas se
  muestran colapsadas por defecto`. Cubre las 3 cláusulas Then del escenario
  (nombres accesibles en orden, `aria-expanded="false"` en los 5, 0
  regiones).
- **@s2** (expandir "horario" muestra la región con el horario verificado)
  → `@s2 expandir una pregunta muestra su respuesta con el horario
  verificado`. Cubre `aria-expanded="true"`, `aria-controls` apuntando al
  `id` real de la región, y los 3 tramos exactos del horario.
- **@s3** (cita: 2 teléfonos verificados, 2 enlaces, sin correo ni reserva
  online) → `@s3 la respuesta sobre cómo pedir cita ofrece los dos
  teléfonos verificados`. Cubre los 2 números, los 2 `role="link"` con sus
  `href` exactos, y la guarda negativa de correo/formulario.

Los tres coinciden exactamente con el contrato del `.feature`; no se detectó
ninguna desviación que exigiera un ciclo adicional.

## Diseño previo a @s4 (arquitectura, no código)

- `src/data/servicios.ts` (feature `servicios`, ya cerrada) es la fuente de
  los 5 títulos exactos que exige @s4: se deriva la respuesta de ese
  catálogo real (`SERVICIOS`), nunca se retipean los títulos a mano en
  `Faq-logica.ts`.
- `src/lib/site.ts` → `datosNegocio.telefonoUrgencias.textoVisible` es la
  fuente del teléfono real de urgencias (@s5/@s13); nunca se hardcodea.
- `src/components/InformacionContacto-logica.ts` → `construirEnlaceTelefono`
  (ya usado por `Faq.tsx` desde antes de esta sesión) sigue siendo el único
  camino para derivar un `tel:`; ningún ciclo nuevo reescribe uno a mano.
- El acordeón excluyente (@s7/@s8) ya vivía en un único estado
  `indiceAbierto: number | null`; lo que faltaba era la semántica de
  "alternar" (pulsar el ya abierto lo cierra), no el propio estado.
- @s11/@s12 exigen un catálogo inyectable desde fuera del componente (mismo
  patrón que `Servicios`/`Equipo`: devolver `null` si el catálogo resultante
  queda vacío tras filtrar). @s13 exige un teléfono de urgencias inyectable
  (mismo patrón `InformacionContacto` @s11: prop opcional con valor por
  defecto tomado de `datosNegocio`).

## Ciclos

### Ciclo @s4 — servicios: 5 bloques publicados

- ROJO: nuevo test exige que la región de "¿Qué servicios ofrecéis?"
  contenga cada uno de los 5 títulos de `SERVICIOS` exactamente una vez, y
  ninguno de "peluquería"/"exóticos"/"etología" → falla, la región mostraba
  el placeholder `'Respuesta'`.
- VERDE: `Faq-logica.ts` gana `enumerar()` (une una lista en español, "a, b
  y c") y `textoServicios(servicios)`, que enumera los títulos de la entrada
  inyectada (nunca los retipea). `construirCatalogoFaq` gana el parámetro
  `servicios` y sustituye el placeholder de esa entrada. `Faq.tsx` importa
  `SERVICIOS` de `../data/servicios` y lo pasa como argumento.
- REFACTOR: ninguno necesario.

### Ciclo @s5 — atención fuera de horario: teléfono real de urgencias

- ROJO: nuevo test exige que la región contenga "91 851 13 93" como enlace,
  y ninguna de "24 h"/"24 horas"/"365"/"todos los días del año"/"recargo" →
  falla, la región mostraba el placeholder `'Respuesta'`.
- VERDE: `Faq-logica.ts` gana `textoUrgencias(telefonoUrgencias)`.
  `construirCatalogoFaq` gana el parámetro `telefonoUrgencias` y sustituye
  el placeholder de esa entrada. `Faq.tsx` pasa
  `datosNegocio.telefonoUrgencias.textoVisible`. El enlace surge gratis: el
  número ya viaja en `enlacesDeContacto`, que `segmentosDeRespuesta` ya
  convertía en `<a>` desde el ciclo de @s3/@s5 original.
- REFACTOR: ninguno necesario.

### Ciclo @s6 — divulgativa: sin afirmar nada de la clínica

- Primer intento del test **pasó a la primera** contra el placeholder
  `'Respuesta'` (una cadena vacía de contenido real no puede violar ninguna
  guarda negativa: verde por vacuidad, no demuestra nada —
  `docs/tdd.md`). Se añadió una aserción positiva
  (`texto.toLowerCase()).toContain('vacun')`) que el placeholder no puede
  satisfacer, forzando el ROJO real.
- ROJO confirmado: `expected 'respuesta' to contain 'vacun'`.
- VERDE: `Faq-logica.ts` gana la constante `RESPUESTA_DIVULGATIVA_VACUNACION`
  (texto fijo, PENDIENTE explícito de revisión veterinaria del cliente, sin
  precios/horas/teléfonos/nombre del negocio). `construirCatalogoFaq`
  sustituye el tercer y último placeholder por esta constante. **Con este
  ciclo se sustituyen los 3 placeholders `'Respuesta'` que quedaban** —
  ninguno se tocó sin un test rojo que lo exigiera primero.
- REFACTOR: ninguno necesario.

### Ciclo @s7 — abrir una pregunta nueva cierra la que estuviera abierta

- El test se escribió y **pasó a la primera**: el único estado
  `indiceAbierto` ya implicaba exclusión mutua desde el diseño original de
  @s1-@s3. Por `docs/tdd.md`, un verde a la primera no demuestra nada:
  sabotaje manual — se cambió el `onClick` a
  `setIndiceAbierto((prev) => (prev === null ? indice : prev))` (ignora el
  segundo clic si ya hay algo abierto). Resultado: **rojo confirmado**
  ("servicios" no llegaba a `aria-expanded="true"`). Revertido. Cero
  producción tocada por este ciclo (ya cubierto por el diseño previo).

### Ciclo @s8 — cerrar la pregunta que ya estaba abierta

- ROJO: nuevo test pulsa dos veces el mismo botón ("¿Cómo pido cita?") y
  exige `aria-expanded="false"`, 0 controles expandidos y 0 regiones → falla,
  el segundo clic con `setIndiceAbierto(indice)` no cambiaba el estado (ya
  estaba en `indice`), la pregunta seguía abierta.
- VERDE: `Faq-logica.ts` gana `siguienteIndiceAbierto(actual, pulsado)`
  (pulsar el que ya estaba abierto devuelve `null`; cualquier otro devuelve
  `pulsado`). `Faq.tsx` cablea `onClick` a través de esta función pura en
  vez de asignar el índice directamente.
- REFACTOR: ninguno necesario.

### Ciclo @s9 — despliegue con teclado (Enter, foco conservado)

- El test se escribió y **pasó a la primera**: un `<button>` real ya recibe
  Enter como equivalente semántico de clic y conserva el foco de forma
  nativa. Sabotaje manual: se cambió el control de `<button type="button">`
  a `<div role="button" tabIndex={0}>` con el mismo `onClick`. Resultado:
  **rojo confirmado** (`aria-expanded` seguía en `"false"` tras `{Enter}`,
  el `div` no tiene la semántica de teclado nativa del botón). Revertido.
  Cero producción tocada.

### Ciclo @s10 — guarda negativa sobre el catálogo completo

- ROJO: nuevo test abre las 5 preguntas del catálogo real (sin props),
  concatena el texto de las 5 regiones y exige la ausencia de "€",
  "financiación"/"cuotas"/"sin intereses"/"plan anual"/"tarifa", "24
  h"/"24 horas"/"urgencias 24", "peluquería"/"exóticos"/"etología", y que
  todo número de teléfono encontrado esté entre los 3 permitidos → **pasó a
  la primera** (ya cubierto por los ciclos @s4-@s6). Sabotaje manual: se
  añadió `" desde 49 €."` al final de `textoServicios`. Resultado: **rojo
  confirmado** (`expected ... not to contain '€'`). Revertido. Cero
  producción tocada por este ciclo.

### Ciclo @s11 — catálogo vacío no renderiza la sección

- ROJO: nuevo test renderiza `<Faq catalogo={[]} />` y exige que no exista
  el encabezado "Preguntas frecuentes", ni ningún control, ni ningún texto
  de relleno → falla, `Faq` no aceptaba props todavía (la prop extra se
  ignoraba y el catálogo real de 5 preguntas seguía renderizándose).
- VERDE: `Faq` gana `FaqProps.catalogo?: readonly EntradaFaq[]` (por
  defecto, el catálogo real construido con `datosNegocio`/`SERVICIOS`,
  mismo patrón que `Servicios`/`Equipo`/`InformacionContacto`). Si el
  catálogo resultante tiene longitud 0, el componente devuelve `null`.
- REFACTOR: ninguno necesario.

### Ciclo @s12 — entrada con pregunta o respuesta vacía se descarta

- ROJO: nuevo test inyecta un catálogo de 4 entradas (2 válidas, 1 sin
  respuesta, 1 sin pregunta) vía la prop `catalogo` y exige exactamente 2
  controles, en el orden de las entradas válidas → falla, las 4 entradas se
  renderizaban (el filtro todavía no existía).
- VERDE: `Faq-logica.ts` gana `entradasValidas(catalogo)` (descarta
  entradas con `pregunta` o `respuesta` de longitud 0; sin `.trim()` — Ley 3,
  ningún escenario del `.feature` pide descartar una entrada
  solo-espacios). `Faq.tsx` filtra `catalogoCompleto` con esta función antes
  de decidir el `return null` y antes del `.map`.
- REFACTOR: ninguno necesario.

### Ciclo @s13 — teléfono de urgencias inyectable desde la fuente única

- ROJO: nuevo test renderiza `<Faq telefonoUrgencias="900 000 000" />` (sin
  `catalogo`, para forzar la construcción interna real), abre la pregunta de
  atención fuera de horario y exige que la región contenga "900 000 000" y
  no "91 851 13 93" → falla, `Faq` no aceptaba la prop todavía.
- VERDE: `Faq` gana `FaqProps.telefonoUrgencias?: string` (por defecto,
  `datosNegocio.telefonoUrgencias.textoVisible`, mismo patrón que
  `InformacionContacto` @s11). El parámetro sustituye el valor fijo tanto en
  `construirCatalogoFaq` como en `enlacesDeContacto`, así el enlace `tel:`
  también refleja el doble de test.
- REFACTOR: ninguno necesario.

## Fix de configuración tras el ciclo @s13 (no es comportamiento nuevo)

`pnpm run lint && pnpm run typecheck` con los 13 escenarios en verde
detectó 3 problemas que ningún `@s` pide arreglar como comportamiento, pero
que son gate duro del proyecto (`docs/conventions.md` → "el linter no da
avisos"), todos en `Faq.test.tsx`:

1. `no-await-in-loop` en el test de @s10 (`for` con `await usuario.click`
   dentro) — se reescribe con una función auxiliar
   `abrirYLeerRespuesta(usuario, pregunta)` y 5 llamadas secuenciales
   explícitas, mismo patrón de "desenrollar" ya usado en
   `ReservaChat.test.tsx`/`Cabecera.test.tsx` (ningún test del repo usa un
   `for` con `await` dentro).
2. `React` importado pero no usado (`noUnusedLocals`, TS6133) — `Faq.test.tsx`
   nunca referenciaba `React.` explícitamente. Se alinea `renderizarFaq`
   con el mismo patrón que el resto del repo
   (`Cabecera.test.tsx`/`Equipo.test.tsx`/`Servicios.test.tsx`/
   `CampanasPortada.test.tsx`): acepta
   `props: React.ComponentProps<typeof Faq> = {}` y los 3 tests nuevos que
   inyectan props (@s11/@s12/@s13) pasan a usar `renderizarFaq({ ... })` en
   vez de `render(<Faq ... />)` directo.
3. `noUncheckedIndexedAccess` (TS2345) en el test de @s10 — indexar
   `PREGUNTAS_EN_ORDEN[0..4]` devuelve `string | undefined`. Se tipa la
   constante como tupla exacta `readonly [string, string, string, string,
   string]` (semánticamente ya lo era: 5 preguntas fijas en orden fijo) y
   se desestructura en vez de indexar.

`node .harness/harness.mjs init`: **verde** — 269/269 tests, lint y
typecheck limpios.

## Trazabilidad @s → test

- @s1 (5 preguntas colapsadas por defecto) → `Faq.test.tsx` `@s1 las cinco
  preguntas se muestran colapsadas por defecto` (verificado retroactivo)
- @s2 (horario verificado) → `@s2 expandir una pregunta muestra su
  respuesta con el horario verificado` (verificado retroactivo)
- @s3 (cita, 2 teléfonos verificados) → `@s3 la respuesta sobre cómo pedir
  cita ofrece los dos teléfonos verificados` (verificado retroactivo)
- @s4 (servicios, 5 bloques) → `@s4 la respuesta sobre servicios enumera
  los cinco bloques publicados`
- @s5 (atención fuera de horario, teléfono real) → `@s5 la respuesta sobre
  atención fuera del horario da el teléfono real de urgencias`
- @s6 (divulgativa, sin afirmar nada de la clínica) → `@s6 la pregunta
  divulgativa no afirma nada específico sobre la clínica`
- @s7 (abrir cierra la anterior) → `@s7 abrir una pregunta nueva cierra
  automáticamente la que estuviera abierta` (verde a la primera, sabotaje
  verificado)
- @s8 (cerrar la ya abierta) → `@s8 cerrar la pregunta que ya estaba
  abierta deja el acordeón sin ninguna expandida`
- @s9 (teclado: Enter expande, foco conservado) → `@s9 la pregunta se
  despliega con el teclado` (verde a la primera, sabotaje verificado)
- @s10 (guarda negativa sobre el catálogo completo) → `@s10 ninguna
  respuesta publicada afirma precios, planes ni servicios no publicados`
  (verde a la primera, sabotaje verificado)
- @s11 (catálogo vacío → sin sección) → `@s11 un catálogo de preguntas
  vacío no renderiza la sección`
- @s12 (entrada con pregunta o respuesta vacía se descarta) → `@s12 una
  entrada con pregunta o respuesta vacía se omite del acordeón`
- @s13 (teléfono de urgencias inyectable) → `@s13 el teléfono de urgencias
  de la respuesta procede de la fuente única de datos`

13/13 escenarios con al menos un test concreto (más los 3 retroactivos
@s1-@s3). `node .harness/harness.mjs init`: verde, 269/269 tests (259
previos + 10 nuevos de esta ronda), lint + typecheck limpios.

## Entregables de esta ronda

- `src/components/Faq-logica.ts` — nuevas funciones puras: `enumerar`,
  `textoServicios`, `textoUrgencias`, la constante
  `RESPUESTA_DIVULGATIVA_VACUNACION`, `entradasValidas`,
  `siguienteIndiceAbierto`; `construirCatalogoFaq` gana los parámetros
  `telefonoUrgencias` y `servicios` y sustituye sus 3 placeholders
  `'Respuesta'` por contenido real.
- `src/components/Faq.tsx` — importa `SERVICIOS` de `../data/servicios`;
  gana `FaqProps` (`catalogo?`, `telefonoUrgencias?`) con valores por
  defecto de `datosNegocio`; filtra con `entradasValidas` y devuelve `null`
  si el catálogo resultante queda vacío; el `onClick` del acordeón pasa por
  `siguienteIndiceAbierto`.
- `src/components/Faq.test.tsx` — 10 `describe` nuevos (@s4-@s13),
  `renderizarFaq` ahora acepta props inyectables (mismo patrón que el resto
  del repo).

## Pendiente, no bloqueante para cerrar esta ronda

El texto exacto de `RESPUESTA_DIVULGATIVA_VACUNACION` (@s6) está marcado
como PENDIENTE en su propio comentario: debe revisarlo un veterinario del
cliente antes de publicarse. El contrato (`features/faq.feature`, cabecera)
solo exige que no afirme nada específico de Galapavet, no valida contenido
clínico — eso queda fuera del alcance de este ciclo TDD.

---

## Ronda 2 — refuerzo de mutación (`progress/mutation_faq.md`, FAIL 82.22%, 16 no-killed)

> Alcance: exactamente los 16 mutantes supervivientes/sin cobertura que
> señala `progress/mutation_faq.md` sobre `src/components/Faq-logica.ts`
> (único fichero mordible de la feature). No se toca `Faq.tsx` ni
> `Faq.test.tsx`: los 16 huecos son de aserción/cobertura del módulo puro,
> ninguno exige DOM. Cero producción tocada de forma permanente — solo el
> fichero nuevo `src/components/Faq-logica.test.ts` (mismo patrón que
> `Galeria-logica.test.ts`/`CampanasPortada-logica.test.ts`, ya señalado
> como observación no bloqueante por el `judge` en la ronda 1).

### Estado previo confirmado

`pnpm exec vitest run src/components/Faq-logica.test.ts` antes de escribir
nada: el fichero no existía. `node .harness/harness.mjs init` en el
baseline de la ronda 1: verde, 269/269.

### Diseño de los 7 tests nuevos

El informe agrupaba los 16 mutantes en 4 grupos (A: formato del listado en
español, 6/7 mutantes; B: rama `elementos.length <= 1` de `enumerar` sin
cobertura, 2 `NoCoverage`; C: `segmentosDeRespuesta` sin verificar por
`textContent`/estructura exacta, 5; D: extremos de `segmentosDeRespuesta`
sin cobertura, 2 `NoCoverage`). Antes de escribir cada test se calculó a
mano (y se verificó con un script Node independiente reproduciendo la
lógica real) la salida exacta esperada, para no adivinar el literal:

1. `textoHorario` con un `TramoHorario[]` de 3 tramos (mismo patrón que
   `datosNegocio.horario`, sin reimportar la fuente real — doble de test
   anclado al literal, no al símbolo) → literal exacto con las 2 comas y el
   punto final. Apunta a **Grupo A / línea 35**.
2. `textoServicios` con 3 títulos → literal exacto `"Ofrecemos Uno, Dos y
   Tres."`. Apunta a **Grupo A / líneas 43, 44, 48×2 (conditional `true`,
   equality `> 1`)**.
3. `textoServicios` con 1 título → literal exacto `"Ofrecemos Único."`.
   Apunta a **Grupo A / línea 48×2 (conditional `false`, equality `< 1`)**
   y **Grupo B / línea 48 (`BlockStatement` vaciado)**.
4. `segmentosDeRespuesta('Llama al 111 ahora.', [enlace])` → verifica el
   array completo `['Llama al ', enlace, ' ahora.']`. Apunta a **Grupo C /
   líneas 127, 128 (`MethodExpression` y `ArithmeticOperator`)**.
5. `segmentosDeRespuesta('Tel 111 y tel 111.', [enlace])` (el número
   aparece dos veces) → verifica que la segunda aparición queda como texto
   plano sin re-envolver: `['Tel ', enlace, ' y tel 111.']`. Apunta a
   **Grupo C / línea 129 (`MethodExpression` y `ConditionalExpression` del
   `filter`)**.
6. `segmentosDeRespuesta('111 es el teléfono.', [enlace])` (el número está
   al principio, `antes === ''`) → `[enlace, ' es el teléfono.']`. Apunta a
   **Grupo D / línea 130**.
7. `segmentosDeRespuesta('Llama al 111', [enlace])` (el número es lo
   último, `despues === ''` en la recursión final) → `['Llama al ',
   enlace]`. Apunta a **Grupo D / línea 132**.

### Verificación "verde a la primera" (docs/tdd.md)

Los 7 tests, escritos contra la producción real tal cual, **pasaron a la
primera** (`pnpm exec vitest run src/components/Faq-logica.test.ts` →
7/7): la lógica ya era correcta, el hueco era solo de aserción/cobertura,
no de comportamiento. Siguiendo `docs/tdd.md` ("un test que pasa a la
primera no demuestra nada"), el "rojo" de cada test lo aporta el propio
mutante del informe: se aplicó a mano, uno a la vez, el diff exacto que
describe `progress/mutation_faq.md` (o el equivalente literal cuando el
informe describe la transformación en prosa), se confirmó qué test(s) —y
solo esos— se ponían en rojo, y se revirtió el sabotaje byte a byte antes
de seguir con el siguiente. Mismo patrón que la Ronda 3 de
`progress/tdd_reserva_chat.md`.

| Mutante (`Faq-logica.md`) | Sabotaje aplicado | Test(s) en rojo | Confirmado |
| --- | --- | --- | --- |
| L35 `StringLiteral` `.join(', ')`→`.join('')` | `join('')` en `textoHorario` | test 1 | único test en rojo, texto sin comas |
| L43 `StringLiteral` `SEPARADOR_LISTA`→`''` | `SEPARADOR_LISTA = ''` | test 2 | único test en rojo, `"UnoDos y Tres"` |
| L44 `StringLiteral` `CONECTOR_ULTIMO_ELEMENTO`→`''` | `CONECTOR_ULTIMO_ELEMENTO = ''` | test 2 | único test en rojo, `"Uno, DosTres"` |
| L48 `ConditionalExpression`→`true` | `if (true)` | test 2 | único test en rojo, `"UnoDosTres"` |
| L48 `ConditionalExpression`→`false` | `if (false)` | test 3 | único test en rojo, `" y Único"` |
| L48 `EqualityOperator` `<=1`→`<1` | `elementos.length < 1` | test 3 | único test en rojo, `" y Único"` |
| L48 `EqualityOperator` `<=1`→`>1` | `elementos.length > 1` | tests 2 y 3 | ambos en rojo (cada uno ya lo mataba por su cuenta) |
| L48 `BlockStatement` (NoCoverage) vaciado | `if (...) {}` | test 3 | único test en rojo |
| L49 `StringLiteral` (NoCoverage) `join('')`→`join('Stryker was here!')` | `elementos.join('Stryker was here!')` | **ninguno** | los 20 tests de `Faq-logica.test.ts` + `Faq.test.tsx` siguen en verde — ver análisis de equivalencia abajo |
| L127 `MethodExpression` `texto.slice(0,posicion)`→`texto` | `const antes = texto` | tests 4, 5, 6, 7 | los 4 tests de `segmentosDeRespuesta` en rojo |
| L128 `MethodExpression` `texto.slice(...)`→`texto` | `const despues = texto` | tests 4, 5, 6, 7 | los 4 tests de `segmentosDeRespuesta` en rojo |
| L128 `ArithmeticOperator` `posicion+len`→`posicion-len` | `posicion - enlace.textoVisible.length` | tests 4, 5, 6, 7 | los 4 tests de `segmentosDeRespuesta` en rojo |
| L129 `MethodExpression` `enlaces.filter(...)`→`enlaces` | `const restantes = enlaces` | test 5 | único test en rojo (el resto no repite el número) |
| L129 `ConditionalExpression` predicado→`true` | `enlaces.filter(() => true)` | test 5 | único test en rojo, mismo resultado que el mutante anterior |
| L130 `ArrayDeclaration` (NoCoverage) rama `antes` vacía | `(antes ? [antes] : ['Stryker was here'])` | test 6 | único test en rojo |
| L132 `ArrayDeclaration` (NoCoverage) rama `texto` vacía | `texto ? [texto] : ['Stryker was here']` | test 7 | único test en rojo |

Tras cada sabotaje se releyó `Faq-logica.ts` completo y se confirmó
idéntico al original antes de continuar; al final de la ronda,
`git status --short -- src/components/Faq-logica.ts` sigue mostrando `??`
(fichero nuevo de la ronda 1, sin modificar en esta ronda) — cero
producción tocada de forma permanente.

### Hallazgo propio: L49 (`StringLiteral`, `NoCoverage`) es un mutante equivalente genuino

El informe de mutación (`progress/mutation_faq.md`, Grupo B) afirmaba
"0 equivalentes" para los 16 supervivientes y sugería que el mismo test de
un único elemento que mata el `BlockStatement` de la línea 48 "cerraría
ambos" (el `BlockStatement` y este `StringLiteral`). Verificado
matemáticamente antes de aceptarlo: dentro de la rama `elementos.length <=
1`, `elementos` tiene 0 o 1 elementos. `Array.prototype.join(separador)`
**nunca aplica el separador** cuando hay 0 o 1 elementos — `[].join(x) ===
''` y `[y].join(x) === String(y)` para cualquier `x`, propiedad del
lenguaje, no del código de este proyecto. Comprobado con un script Node
aislado (`[].join('X') === ''`, `['Unico'].join('X') === 'Unico'`) y, ya
sobre el propio código, aplicando el mutante exacto (`elementos.join('')`
→ `elementos.join('Stryker was here!')`) y ejecutando toda la suite
(`Faq-logica.test.ts` + `Faq.test.tsx`, 20 tests): **los 20 siguen en
verde**, incluidos los tests 2 y 3 de esta ronda que sí cubren la rama.
Ningún input posible de `enumerar`/`textoServicios` puede distinguir el
comportamiento del original del mutado en este punto — mismo patrón que
los equivalentes ya documentados y aceptados en este proyecto
(`src/lib/telefono.ts:13` en `datos_negocio`, `src/lib/contraste.ts:36` en
`tokens_marca`). No se añade ningún test artificial para intentar matarlo
por decreto (violaría la Ley 2: no escribir más test del necesario, y
cualquier test así seguiría sin poder fallar). Queda documentado aquí para
que el `mutation_tester` lo verifique de forma independiente y decida si
lo excluye con justificación explícita (mismo protocolo que los otros dos
equivalentes de este proyecto) o si mide con él como superviviente
aceptado bajo el criterio que aplique en ese momento — no me corresponde
a mí, como `tdd_craftsman`, declarar la puerta de mutación superada.

### Verificación final (ronda 2)

- `pnpm exec vitest run src/components/Faq-logica.test.ts`: **7/7 verde**
  con la producción real (sin ningún sabotaje activo).
- `node .harness/harness.mjs init`: **verde** — lint (`oxlint
  --deny-warnings`) sin errores, `tsc -b` sin errores, suite completa
  **276/276** (269 previos + 7 nuevos).
- `src/components/Faq.tsx` y `src/components/Faq.test.tsx`: **sin cambios**
  en esta ronda (`git status --short` los sigue marcando `??`, idénticos a
  como los dejó la ronda 1; el refuerzo entero vive en el fichero nuevo
  `Faq-logica.test.ts`).
- No quedan `console.*`, `debugger`, `.only`/`.skip`, `TODO` ni restos de
  "Stryker was here"/"SABOTAJE" en ningún fichero de `faq` (`grep` propio
  sin coincidencias).
- No se toca `feature_list.json`: la feature sigue `in_progress`, a la
  espera de que `judge` revise esta ronda y de que `mutation_tester` repita
  su medición oficial — no me corresponde marcarla `done`.

### Mapa mutante → test (ronda 2)

| Mutante (línea, tipo) | Test que lo mata | Fichero |
| --- | --- | --- |
| L35 `StringLiteral` | `textoHorario ... literal exacto` | `Faq-logica.test.ts` |
| L43 `StringLiteral` (`SEPARADOR_LISTA`) | `textoServicios ... tres o más títulos` | `Faq-logica.test.ts` |
| L44 `StringLiteral` (`CONECTOR_ULTIMO_ELEMENTO`) | `textoServicios ... tres o más títulos` | `Faq-logica.test.ts` |
| L48 `ConditionalExpression` → `true` | `textoServicios ... tres o más títulos` | `Faq-logica.test.ts` |
| L48 `ConditionalExpression` → `false` | `textoServicios ... un único título` | `Faq-logica.test.ts` |
| L48 `EqualityOperator` `<1` | `textoServicios ... un único título` | `Faq-logica.test.ts` |
| L48 `EqualityOperator` `>1` | `textoServicios ... tres o más títulos` / `... un único título` (ambos) | `Faq-logica.test.ts` |
| L48 `BlockStatement` (NoCoverage) | `textoServicios ... un único título` | `Faq-logica.test.ts` |
| L49 `StringLiteral` (NoCoverage) | **ninguno — equivalente genuino, ver análisis arriba** | — |
| L127 `MethodExpression` | los 4 tests de `segmentosDeRespuesta` | `Faq-logica.test.ts` |
| L128 `MethodExpression` | los 4 tests de `segmentosDeRespuesta` | `Faq-logica.test.ts` |
| L128 `ArithmeticOperator` | los 4 tests de `segmentosDeRespuesta` | `Faq-logica.test.ts` |
| L129 `MethodExpression` | `segmentosDeRespuesta ... segunda aparición` | `Faq-logica.test.ts` |
| L129 `ConditionalExpression` | `segmentosDeRespuesta ... segunda aparición` | `Faq-logica.test.ts` |
| L130 `ArrayDeclaration` (NoCoverage) | `segmentosDeRespuesta ... al principio del texto` | `Faq-logica.test.ts` |
| L132 `ArrayDeclaration` (NoCoverage) | `segmentosDeRespuesta ... lo último del texto` | `Faq-logica.test.ts` |

15/16 mutantes cerrados con test dirigido y verificados uno a uno por
sabotaje manual + reversión; 1/16 (L49) documentado como equivalente
genuino con verificación matemática y empírica, no ignorado ni ocultado.

### Pendiente para las siguientes puertas (ronda 2)

- `judge`: revisar que los 7 tests nuevos de `Faq-logica.test.ts` están
  correctamente etiquetados como refuerzo de mutación (no escenarios
  nuevos), que `Faq.tsx`/`Faq.test.tsx` no se tocaron, y el análisis de
  equivalencia de L49 antes de dar por bueno que no hace falta más trabajo
  ahí.
- `mutation_tester`: repetir la medición oficial sobre
  `src/components/Faq-logica.ts` para confirmar de forma independiente
  cuántos de los 16 quedan `Killed` y si L49 se acepta como equivalente
  documentado (siguiendo el mismo protocolo que
  `docs/mutation-testing.md` ya aplicó a `telefono.ts:13` y
  `contraste.ts:36`) o si exige justificación adicional antes de dar la
  puerta por superada.
