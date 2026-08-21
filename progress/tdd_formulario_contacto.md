# TDD — formulario_contacto (id 11)

> Bitácora ciclo a ciclo (Rojo → Verde → Refactor), un escenario del
> `.feature` a la vez. Mapa de trazabilidad @s → test al final.

## Confirmación previa

`node .harness/harness.mjs init`: **verde** antes del primer test rojo
(232/232 tests, lint + typecheck limpios).

## Diseño previo a la escritura del primer test (arquitectura, no código)

- `src/components/FormularioContacto-logica.ts` — módulo puro (Invariante 6):
  `CamposFormulario`, `ValidezCampos`, `emailTieneFormatoValido`,
  `validarCampos`, `formularioEsValido`. Decide qué campos están vacíos
  (tras `.trim()`, para que "   " cuente como vacío — @s10) y si el email
  tiene forma `local@dominio.tld` (@s11).
- `src/components/FormularioContacto.tsx` — cablea: estado de React
  (`campos`, `validez`, `vista: 'formulario' | 'confirmacion'`), reutiliza
  `datosNegocio` (`src/lib/site.ts`) para los dos teléfonos de la
  confirmación y **reutiliza `construirEnlaceTelefono` de
  `InformacionContacto-logica.ts`** (ya existente, `enlaceLlamada` por
  debajo) para derivar sus enlaces `tel:` — no se reescribe a mano ningún
  `tel:` (Invariante 2, y precedente explícito de `informacion_contacto`).
- **Mecanismo de validación elegido (documentado, decisión del
  `tdd_craftsman` per el propio `.feature` @s9-@s12, líneas 90-94):**
  `<form noValidate>` — se desactiva la validación nativa del navegador
  (que en jsdom es parcial e implica un riesgo real: si el clic en el botón
  de envío dispara el algoritmo de "interactively validate the constraints"
  antes de que el `submit` handler corra, el `onSubmit` de React nunca se
  ejecutaría con campos vacíos y `aria-invalid` nunca se actualizaría por
  JS, dejando el estado observable en manos de un mecanismo que ni siquiera
  jsdom implementa de forma completa). El atributo HTML `required` **se
  mantiene** en los 4 controles obligatorios (Invariante 5 no lo prohíbe;
  es la única vía nativa para que un lector de pantalla anuncie "obligatorio"
  sin JS adicional — @s5 lo pide explícitamente). El `onSubmit` de React
  siempre corre (gracias a `noValidate`), siempre hace
  `preventDefault()` (@s3/Decisión 6: nunca hay envío real), calcula
  `validarCampos(campos)` con la lógica pura propia, y decide: si es válido
  pasa a `vista = 'confirmacion'`; si no, guarda el resultado en
  `validez` y cablea `aria-invalid={validez.<campo>Invalido}` en cada
  control — el estado condicional vive en el atributo ARIA consultable,
  nunca en una clase CSS (Invariante 5, mismo patrón que
  `InformacionContacto`/`ReservaChat`).
- Casilla del aviso legal: el enlace "Aviso legal" (@s2) se renderiza
  **fuera** de la etiqueta de la casilla (no anidado dentro de la misma
  `<label>`), evitando que el nombre accesible de la casilla concatene el
  texto del enlace y quede en tensión con la aserción de "contiene 'acepto
  el aviso legal'" del propio checkbox — la frase de la etiqueta de la
  casilla ("He leído y acepto el aviso legal") ya contiene ese literal en
  minúsculas por construcción, sin depender de mayúsculas del enlace vecino.
- Ningún dato de negocio se reescribe a mano: los dos teléfonos de @s7/@s8
  (`91 082 92 67`, `91 851 13 93`) llegan de `datosNegocio.telefonoClinica`
  / `datosNegocio.telefonoUrgencias` (`src/lib/site.ts`), igual que su
  rótulo real "Urgencias fuera de horario".
- Se sigue TDD estricto: no se escribe `validarCampos` ni el estado
  `validez` hasta que un escenario concreto (@s9) lo exige. Los ciclos
  @s1-@s8 avanzan el marcado con el mínimo cableado directo (formulario sin
  bloqueo aún, porque ningún test hasta @s9 intenta enviar un campo
  inválido).

## Ciclos

### Ciclo 1 — @s1 (formulario por defecto, sin confirmación)

- ROJO: `FormularioContacto.test.tsx` importa `./FormularioContacto`, que no
  existe → falla al resolver el módulo (cuenta como rojo, `docs/tdd.md`).
- VERDE: `FormularioContacto.tsx` mínimo — `<form aria-label="Escríbenos">`
  con el botón "Enviar mensaje", sin nada más.
- REFACTOR: ninguno.

### Ciclo 2 — @s2 (cada campo se localiza por su etiqueta)

- ROJO: `getByRole('textbox', { name: 'Tu nombre' })` (y el resto de
  controles) fallan — ningún control existía todavía.
- VERDE: los 6 controles con `<label htmlFor>` + `id` explícitos (nombre,
  teléfono, email como cuadros de texto; motivo como `<select>`; cuéntanos
  como `<textarea>`; casilla con etiqueta "He leído y acepto el aviso
  legal", que contiene el literal exigido "acepto el aviso legal" en
  minúsculas por construcción de la frase) y el enlace "Aviso legal" **fuera**
  de la etiqueta de la casilla (decisión de diseño documentada arriba: evita
  que el nombre accesible de la casilla concatene el texto del enlace).
- REFACTOR: ninguno.

### Ciclo 3 — @s3 (aviso de no-envío: texto visible + descripción accesible del botón)

- ROJO: el formulario no contenía el texto "Esta maqueta no envía tu mensaje
  a ningún servidor", ni el botón tenía `aria-describedby`.
- VERDE: `<p id="formulario-contacto-aviso-no-envio">` con el aviso +
  `aria-describedby` en el botón "Enviar mensaje" apuntando a ese id — mismo
  patrón que `ReservaChat`/`Galeria` (aviso de demostración como descripción
  accesible, no solo como texto suelto).
- REFACTOR: ninguno.

### Ciclo 4 — @s4 (Motivo: exactamente 5 opciones)

- El test **pasó a la primera** (el ciclo 2 ya construyó `OPCIONES_MOTIVO`
  con los 5 títulos reales, sin placeholder, porque @s4 exige "exactamente"
  5). Verificado con sabotaje manual: se cambió `'Campañas'` por `'Campañas
  y precios'` → el test falló mostrando la opción sobrante. Revertido.
  Sin cambios de producción en este ciclo.

### Ciclo 5 — @s5 (solo 4 controles se anuncian obligatorios)

- ROJO: `toBeRequired()` fallaba en los 4 controles obligatorios (ningún
  `input`/`select` tenía `required` todavía).
- VERDE: `required` añadido a "Tu nombre", "Teléfono", "Email" y la casilla;
  "Motivo" y "Cuéntanos" se dejan sin ese atributo (ya lo estaban, Ley 3: no
  se toca lo que ningún test pide).
- REFACTOR: ninguno.

### Ciclo 6 — @s6 (envío válido con los opcionales vacíos)

- ROJO: no existía ningún `onSubmit`; el formulario no desaparecía ni
  aparecía el encabezado "Formulario completado" tras pulsar "Enviar
  mensaje".
- VERDE: nace el estado `vista: 'formulario' | 'confirmacion'`. `onSubmit`
  hace `preventDefault()` (Decisión 6: nunca hay envío real) y, por ahora
  sin ninguna guarda de validez (ningún test la exige aún), pasa siempre a
  `'confirmacion'`. Vista de confirmación mínima: solo `<h2>Formulario
  completado</h2>`. Se añade `noValidate` al `<form>` desde este mismo
  ciclo (decisión de mecanismo documentada arriba: garantiza que
  `onSubmit` siempre corre, independientemente de qué tan completa esté la
  validación nativa de jsdom).
- REFACTOR: ninguno.

### Ciclo 7 — @s7 (contenido de la confirmación: rol de estado, texto, 2 enlaces reales, botón de reinicio)

- ROJO: `getByRole('status')` no encontraba nada (la vista de confirmación
  solo tenía el `<h2>`).
- VERDE: la vista de confirmación pasa a `<div role="status">` con el texto
  de no-envío, los 2 enlaces de teléfono derivados de `datosNegocio`
  (`telefonoClinica`, `telefonoUrgencias`) vía `construirEnlaceTelefono`
  (reutilizado de `InformacionContacto-logica.ts`, sin reescribir ningún
  `tel:` a mano) y el botón "Enviar otro mensaje" (`onClick` que vuelve
  `vista` a `'formulario'`).
- REFACTOR (nota de configuración, no de comportamiento): `oxlint`
  (`jsx-a11y/prefer-tag-over-role`) rechaza `role="status"` explícito en un
  `<div>`, exige el tag semántico `<output>` (que ya tiene ese rol
  implícito). Cambiado `<div role="status">` → `<output>`, mismo
  comportamiento observable, sin tocar ningún test.

### Ciclo 8 — @s8 (la confirmación no promete recepción/plazo/24h; solo 2 teléfonos)

- El test **pasó a la primera** (el texto del ciclo 7 nunca escribió esas 4
  frases, y solo incluye los 2 teléfonos reales). Verificado con sabotaje
  manual: se insertó temporalmente `<p>SABOTAJE_TEMPORAL Mensaje
  recibido</p>` en la vista de confirmación → el test falló exactamente en
  la aserción `not.toContain('Mensaje recibido')`. Revertido. Sin cambios
  de producción en este ciclo.

### Ciclo 9 — @s9 (nombre vacío no completa el formulario)

- ROJO: sin ninguna guarda de validez (ciclo 6), el envío con "Tu nombre"
  vacío completaba igualmente el formulario.
- VERDE: nace `src/components/FormularioContacto-logica.ts` (Invariante 6):
  `CamposFormulario`, `ValidezCampos`, `validarCampos` (por ahora solo
  compara vacío tras `.trim()` para los 4 campos obligatorios —
  `emailInvalido` todavía no valida formato, @s11 lo forzará) y
  `formularioEsValido`. El componente lee los valores actuales por `ref`
  (`refNombre`/`refTelefono`/`refEmail`/`refAceptaAvisoLegal`, sin estado
  controlado: ver nota de diseño sobre por qué esto también resuelve @s13
  sin código adicional) en `manejarEnvio`, calcula `validarCampos(...)`,
  guarda el resultado en el estado `validez` y solo pasa a
  `'confirmacion'` si `formularioEsValido(...)`. Cada control obligatorio
  gana `aria-invalid={validez.<campo>Invalido}` (Invariante 5: el estado
  condicional vive en el atributo ARIA, nunca en una clase).
- REFACTOR: ninguno.

### Ciclo 10 — @s10 (nombre solo espacios tampoco completa el formulario)

- El test **pasó a la primera** (`esTextoVacio` del ciclo 9 ya usa
  `.trim()`, pensado desde el principio para cubrir este caso junto con el
  vacío puro — no es casualidad, pero tampoco tenía un rojo propio hasta
  ahora). Verificado con sabotaje manual: `esTextoVacio` se cambió
  temporalmente a `valor.length === 0` (sin `.trim()`) → **exactamente**
  el test de @s10 falló (los otros 9 siguieron en verde). Revertido.
  Sin cambios de producción en este ciclo.

### Ciclo 11 — @s11 (email con formato inválido no completa el formulario)

- ROJO: con "ana@" en "Email" (sin dominio), `validarCampos` solo miraba si
  el campo estaba vacío — "ana@" no lo está, así que el formulario se
  completaba igual, violando el escenario.
- VERDE: nace `emailTieneFormatoValido` (`PATRON_EMAIL =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/`, exige "local@dominio.tld"; "ana@" no tiene
  dominio, así que no matchea). `validarCampos` combina vacío **o**
  formato inválido para `emailInvalido`. El resto de controles no se ven
  afectados (verificado con las 2 aserciones adicionales del propio test:
  "Tu nombre"/"Teléfono" siguen `aria-invalid="false"`).
- REFACTOR: ninguno.

### Ciclo 12 — @s12 (casilla del aviso legal sin marcar no completa el formulario)

- El test **pasó a la primera** (`avisoLegalInvalido: !campos.aceptaAvisoLegal`
  ya existía desde el ciclo 9, sin caso de uso propio hasta ahora).
  Verificado con sabotaje manual: `avisoLegalInvalido` se fijó
  temporalmente a `false` (constante) → exactamente el test de @s12 falló.
  Revertido. Sin cambios de producción en este ciclo.

### Ciclo 13 — @s13 ("Enviar otro mensaje" limpia todos los campos)

- El test **pasó a la primera**: al pulsar "Enviar otro mensaje" la vista
  vuelve a `'formulario'`, lo que desmonta por completo el `<form>` de la
  vista de confirmación y monta un `<form>` nuevo — como los controles son
  **no controlados** (por `ref`, sin `value`/`defaultValue` persistido),
  el nuevo árbol nace con sus valores HTML por defecto (cadenas vacías,
  casilla sin marcar), sin necesitar ningún código de "reinicio" explícito.
  Verificado con sabotaje manual: se añadió `defaultChecked` a la casilla
  (simulando que "olvidara" desmarcarse) → el test de @s13 falló (`not
  .toBeChecked()`), junto con otros 4 tests que dependían de que la
  casilla arrancara sin marcar (confirma que el mecanismo de remonte es
  real, no una tautología: cualquier control con un valor inicial
  distinto de vacío rompe la aserción). Revertido. Sin cambios de
  producción en este ciclo.

### Ciclo 14 — @s14 (ninguna dirección de correo publicada)

- El test **pasó a la primera** (ningún `mailto:` ni arroba se escribió en
  ningún momento del marcado; el valor tecleado en "Email" vive en el
  atributo `value` del `<input>`, que no forma parte de `textContent`, así
  que no puede colar por ese lado). Verificado con sabotaje manual: se
  añadió temporalmente `<a href="mailto:info@galapavet.com">SABOTAJE_TEMPORAL</a>`
  junto al enlace "Aviso legal" → el test falló en la aserción
  `not.toMatch(/^mailto:/)`. Revertido. Sin cambios de producción en este
  ciclo.

### Refuerzo de mutación (sin escenario `@s` nuevo, mismo patrón que `reserva_chat` ronda 3 / `galeria` ronda 2)

Nuevo fichero `FormularioContacto-logica.test.ts`: 8 tests directos contra
el módulo puro, sin pasar por `render`/`userEvent`. Ninguno de los 14
escenarios del `.feature` deja "Teléfono" vacío en ningún momento (siempre
aparece ya relleno en el `Given` de cada escenario que lo toca), así que la
rama `telefonoInvalido: true` de `validarCampos` nunca se ejercitaba desde
la UI — un mutante que la sustituyera por `false` habría sobrevivido. Se
añade el test directo que la ejercita (`telefono: ''` y `telefono: '   '`
→ `telefonoInvalido === true`), simétrico al que ya cubre "Tu nombre" desde
la UI. El resto de tests de este fichero (`emailTieneFormatoValido` con
más casos límite, `formularioEsValido` con las 4 combinaciones de un solo
campo inválido) son refuerzo directo de las mismas ramas que @s9-@s12 ya
ejercitan por UI, para que Stryker las atribuya con literales propios en
vez de depender solo del camino largo `render` → `userEvent.click`.

## Verificación final de la sesión

- `pnpm exec vitest run src/components/FormularioContacto.test.tsx
  src/components/FormularioContacto-logica.test.ts`: **22/22 verde** (14
  escenarios de DOM + 8 tests de lógica pura, incluido el refuerzo de
  mutación de "Teléfono").
- `node .harness/harness.mjs init`: **verde** — `oxlint --deny-warnings`
  sin errores, `tsc -b` sin errores, suite completa **254/254** (232
  preexistentes + 22 nuevos).
- No se toca `feature_list.json`: la feature queda `in_progress`, a la
  espera de `judge` y `mutation_tester` (regla dura del `craftsman_lead`,
  no me corresponde marcarla `done`).
- No quedan `console.*`, `debugger`, `.only`/`.skip`, `TODO` ni restos de
  "SABOTAJE" en ninguno de los 4 ficheros tocados (verificado con `grep`).

## Trazabilidad @s → test

| Escenario | Test | Fichero |
| --- | --- | --- |
| @s1 | `hay un formulario "Escríbenos" con un botón "Enviar mensaje"...` | `FormularioContacto.test.tsx` |
| @s2 | `los 6 controles y el enlace "Aviso legal" existen con su nombre accesible exacto` | `FormularioContacto.test.tsx` |
| @s3 | `el texto se ve y es también la descripción accesible del botón "Enviar mensaje"` | `FormularioContacto.test.tsx` |
| @s4 | `las opciones son exactamente las 5 reales, en este orden, sin "y precios"` | `FormularioContacto.test.tsx` |
| @s5 | `4 controles están marcados obligatorios y 2 no lo están` | `FormularioContacto.test.tsx` |
| @s6 | `con Motivo en su opción inicial y Cuéntanos vacío, enviar muestra la confirmación...` | `FormularioContacto.test.tsx` |
| @s7 | `rol de estado, texto de no-envío, los 2 enlaces de teléfono reales y el botón de reinicio` | `FormularioContacto.test.tsx` |
| @s8 | `no contiene ninguna de las 4 frases prohibidas y solo aparecen los 2 teléfonos reales` | `FormularioContacto.test.tsx` |
| @s9 | `no aparece la confirmación, el formulario sigue mostrándose y "Tu nombre" queda inválido` (+ refuerzo directo en `FormularioContacto-logica.test.ts`) | `FormularioContacto.test.tsx` / `FormularioContacto-logica.test.ts` |
| @s10 | `con "   " en "Tu nombre" no aparece la confirmación y el control queda inválido` | `FormularioContacto.test.tsx` |
| @s11 | `con "ana@" en "Email" no aparece la confirmación, "Email" queda inválido y "Tu nombre"/"Teléfono" no` (+ refuerzo directo) | `FormularioContacto.test.tsx` / `FormularioContacto-logica.test.ts` |
| @s12 | `sin marcar la casilla no aparece la confirmación y la casilla queda inválida` (+ refuerzo directo) | `FormularioContacto.test.tsx` / `FormularioContacto-logica.test.ts` |
| @s13 | `tras reiniciar, "Escríbenos" reaparece con los 4 controles vacíos, la casilla desmarcada...` | `FormularioContacto.test.tsx` |
| @s14 | `no hay ningún enlace "mailto:" ni ningún texto con arroba entre palabras...` | `FormularioContacto.test.tsx` |

## Ficheros de producción entregados

- `src/components/FormularioContacto-logica.ts` — módulo puro:
  `CamposFormulario`, `ValidezCampos`, `emailTieneFormatoValido`,
  `validarCampos`, `formularioEsValido`.
- `src/components/FormularioContacto.tsx` — el formulario + la vista de
  confirmación, reutilizando `datosNegocio` (`src/lib/site.ts`) y
  `construirEnlaceTelefono` (`InformacionContacto-logica.ts`) para los 2
  teléfonos de la confirmación.
- `src/components/FormularioContacto.test.tsx` (14 tests) y
  `src/components/FormularioContacto-logica.test.ts` (8 tests).

## Problemas de configuración encontrados (fuera de `src/`, documentados, no ocultados)

Ninguno nuevo esta sesión: `node .harness/harness.mjs init` estaba limpio
antes del primer test rojo (232/232). El único hallazgo de esta sesión fue
de comportamiento del linter dentro de `src/` (no de configuración del
arnés): `jsx-a11y/prefer-tag-over-role` de `oxlint` rechaza `role="status"`
explícito en un `<div>` — resuelto usando `<output>` (rol "status"
implícito), documentado en el Ciclo 7.

## Ronda 2 — refuerzo tras mutación (`progress/mutation_formulario_contacto.md`, veredicto FAIL, 34/36 = 94.44%)

**Contexto:** `judge` había aprobado la ronda 1 sin cambios requeridos, pero
`mutation_tester` reportó 2 mutantes sobrevivientes en
`src/components/FormularioContacto-logica.ts:27`, ambos sobre el literal
`PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/` de `emailTieneFormatoValido`
(@s11): un `Regex` que elimina el ancla de inicio `^` (mutante id 5) y otro
que elimina el ancla de fin `$` (mutante id 6). Ningún test existente hasta
ahora probaba basura *antes* o *después* de un email por lo demás válido —
solo formato roto (`ana@`) o casos vacíos/sin arroba/sin punto.

### Ciclo 15 — refuerzo de mutación (mismo patrón que rondas anteriores de `reserva_chat`/`galeria`: no hay `@s` nuevo, el `.feature` no cambia)

- Se añaden 2 tests directos en `FormularioContacto-logica.test.ts`, dentro
  del `describe` ya existente de @s11:
  - `emailTieneFormatoValido(' ana@correo.es')` → `false` (ataca el
    mutante que elimina `^`: con basura — un espacio — antes de un email
    por lo demás válido, el patrón real no encuentra ninguna posición de
    inicio válida porque exige empezar en la posición 0, mientras que sin
    `^` el motor de regex prueba otras posiciones de inicio y encuentra el
    match a partir del índice 1).
  - `emailTieneFormatoValido('ana@correo.es basura')` → `false` (ataca el
    mutante que elimina `$`: con basura después de un email por lo demás
    válido, el patrón real no puede hacer que el grupo final llegue
    exactamente al final del string, mientras que sin `$` el match se
    detiene en "ana@correo.es" e ignora el resto).
- Ambos tests **pasaron a la primera** (`PATRON_EMAIL` ya era correcto en
  producción — el reporte de mutación no reveló ningún bug de
  comportamiento, solo huecos de cobertura de test). Verificado con
  sabotaje manual, uno por uno, replicando exactamente cada mutante del
  informe:
  - `PATRON_EMAIL` → `/[^\s@]+@[^\s@]+\.[^\s@]+$/` (mutante 5, sin `^`):
    falló **exactamente** el test de "ancla de inicio" (9/10 verdes, 1
    rojo). Revertido.
  - `PATRON_EMAIL` → `/^[^\s@]+@[^\s@]+\.[^\s@]+/` (mutante 6, sin `$`):
    falló **exactamente** el test de "ancla de fin" (9/10 verdes, 1 rojo).
    Revertido.
  - Ningún otro test de la suite (incluida `FormularioContacto.test.tsx`)
    se vio afectado por ninguno de los dos sabotajes, confirmando que el
    refuerzo es preciso, no un efecto colateral de otra aserción.
- Sin cambios de producción: `FormularioContacto-logica.ts` queda
  exactamente igual que al cierre de la ronda 1. Regla dura respetada:
  "Prioriza reforzar solo tests sin tocar producción, salvo que el informe
  revele un bug real de comportamiento" — el informe no reveló ningún bug,
  solo cobertura insuficiente.

### Verificación final de la ronda 2

- `pnpm exec vitest run src/components/FormularioContacto-logica.test.ts
  src/components/FormularioContacto.test.tsx`: **24/24 verde** (10 tests de
  lógica pura + 14 escenarios de DOM).
- `node .harness/harness.mjs init`: **verde** — `oxlint --deny-warnings` sin
  errores, `tsc -b` sin errores, suite completa **256/256** (254
  preexistentes al cierre de ronda 1 + 2 nuevos de refuerzo).
- `feature_list.json` sigue sin tocarse: la feature permanece `in_progress`,
  a la espera de que `judge` revise el diff mínimo (2 tests nuevos) y de que
  `mutation_tester` repita la medición sobre
  `src/components/FormularioContacto-logica.ts`.

### Trazabilidad @s → test (actualización ronda 2)

| Escenario | Test añadido | Fichero |
| --- | --- | --- |
| @s11 (refuerzo mutación, ancla `^`) | `refuerzo mutación (ancla de inicio): basura antes de un email por lo demás válido es inválido` | `FormularioContacto-logica.test.ts` |
| @s11 (refuerzo mutación, ancla `$`) | `refuerzo mutación (ancla de fin): basura después de un email por lo demás válido es inválido` | `FormularioContacto-logica.test.ts` |

