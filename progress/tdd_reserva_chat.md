# TDD — reserva_chat (id 7)

> Bitácora ciclo a ciclo (Rojo → Verde → Refactor), un escenario del `.feature`
> a la vez. Mapa de trazabilidad @s → test al final.

## Confirmación previa

`node .harness/harness.mjs init`: **verde**, sin problemas de configuración
nuevos (137/137 tests, lint+typecheck limpios). No hay `pwsh` en esta
máquina; se invoca con `node .harness/harness.mjs <comando>`.

## Diseño previo a la escritura del primer test (arquitectura, no código)

- `src/components/ReservaChat-logica.ts` — módulo puro (Invariante 6):
  `IdPaso`, `OPCION_URGENCIA`, `puedeRegistrarRespuesta`,
  `normalizarRespuesta`, `componerResumen`, `siguientePaso`.
- `src/components/ReservaChat.tsx` — cablea: contenido literal de cada paso
  (preguntas, opciones) como constantes locales (mismo patrón que
  `Hero.tsx`), reutiliza `datosNegocio` (`src/lib/site.ts`) para teléfonos y
  horario, reutiliza `SERVICIOS` (`src/data/servicios.ts`) para los 5
  títulos de las respuestas rápidas del paso "servicio" (una sola fuente
  para el nombre de cada bloque, en vez de re-escribirlo).
- Se sigue la disciplina real de TDD: no se escribe `siguientePaso` /
  `componerResumen` / `puedeRegistrarRespuesta` hasta que un escenario
  concreto (@s6/@s7 validación, @s11/@s22 resumen, @s14/@s23 bifurcación de
  urgencia) lo exige. Los primeros ciclos (@s1-@s5) avanzan el guion con el
  mínimo cableado directo; se generaliza a los módulos puros en el ciclo que
  primero lo necesita de verdad (REFACTOR en verde), documentado en cada
  entrada.

## Ciclos

### Ciclo 1 — @s1 (arranque del chat)

- ROJO: test nuevo (`ReservaChat.test.tsx`) importa `./ReservaChat`, que no
  existe → falla al resolver el módulo (cuenta como rojo, docs/tdd.md).
- VERDE: `ReservaChat.tsx` mínimo — historial fijo de 1 mensaje, `fieldset
  aria-label="Asistente de reserva de Galapavet"` (role implícito "group"),
  log con el mensaje inicial, `fieldset aria-label="Respuestas rápidas"` con
  los 6 botones (5 títulos de `SERVICIOS` + "Es una urgencia"), sin textbox.
- Nota de configuración (no de comportamiento): `role="group"` explícito en
  un `<div>` dispara `jsx-a11y(prefer-tag-over-role)` en oxlint (categoría
  `correctness`, error aunque no esté listada explícitamente en
  `.oxlintrc.json` — hereda la severidad de categoría del plugin
  `jsx-a11y`). Resuelto usando `<fieldset aria-label="...">` (role "group"
  implícito), no hace falta `<legend>` porque `aria-label` tiene prioridad
  en el cálculo del nombre accesible. Documentado aquí porque no es un
  fallo de comportamiento, es una restricción del linter del proyecto.
- REFACTOR: ninguno necesario (implementación ya mínima).

### Ciclo 2 — @s2 (elegir una respuesta rápida avanza el guion)

- ROJO: test nuevo pulsa "Medicina general" y espera 3 mensajes en el
  historial + textbox "Tu respuesta" + desaparición del grupo de respuestas
  rápidas. Falla: el historial seguía fijo en 1 mensaje (`toHaveLength(3)`
  recibe 1).
- VERDE: se introduce estado (`useState` para `historial` y `paso`,
  `useRef` para el contador de ids de mensaje). `manejarSeleccionServicio`
  empuja "Tú: <opción>" + "Asistente: Entendido. ¿Con qué animal vienes?" y
  pasa `paso` a `'animal'`. En `paso === 'animal'` se renderiza un
  `<input aria-label="Tu respuesta">` sin más (aún no hace falta botón ni
  `value`/`onChange`: ningún test los exige todavía). El paso a `'animal'`
  es, por ahora, incondicional (no hay bifurcación de urgencia todavía —
  llega con @s14/@s23; se generalizará entonces, no antes, por Ley 1).
- Nota de configuración (no de comportamiento): oxlint `react-in-jsx-scope`
  exige el símbolo `React` importado en cualquier fichero con JSX aunque
  `tsconfig` use el runtime automático (`"jsx": "react-jsx"`), y a la vez
  `noUnusedLocals` de TS exige que ese import se referencie de verdad. El
  patrón ya usado en el resto del proyecto (`Hero.test.tsx`,
  `Equipo.test.tsx`…) lo resuelve con `React.ComponentProps<typeof X>` en
  la firma del helper de render; `ReservaChat` no tiene props que
  parametrizar desde ningún test, así que aquí se resuelve igual de
  honesto con una anotación de tipo real: `const elemento: React.JSX.Element
  = <ReservaChat />`. Mismo mecanismo, sin inventar una interfaz de props
  que ningún escenario pide.
- REFACTOR: ninguno necesario.

### Ciclo 3 — @s3 (catálogo del paso servicio, sin servicios inventados)

- El test se escribió y **pasó a la primera** (ver `docs/tdd.md`: "un test
  que pasa a la primera no demuestra nada: ajústalo o sospecha del
  montaje"). Causa identificada, no ocultada: en el ciclo 1,
  `OPCIONES_SERVICIO` ya se construyó reutilizando `SERVICIOS` (fuente
  única de los 5 títulos) en vez de un array literal aparte, así que este
  escenario queda satisfecho por construcción, no por casualidad.
- Verificación de que el test sí muerde (sustituto de un ROJO que nunca
  llegó de forma natural): sabotaje manual — se añadió el literal
  `'Peluquería'` a `OPCIONES_SERVICIO` — el test falló exactamente como se
  esperaba (longitud 7 en vez de 6, y `not.toHaveTextContent('Peluquería')`
  roto), confirmando que no es una aserción vacía. Revertido el sabotaje,
  vuelto a verde.
- Sin cambios de producción en este ciclo.

### Ciclo 4 — @s4 (paso "cuándo": solo horario real)

- ROJO: el test responde servicio + animal (necesita enviar el textbox, que
  aún no tenía botón de envío) y falla en `getByRole('button', { name:
  'Enviar respuesta' })` — no existía.
- VERDE: se añade `OPCIONES_CUANDO` (4 opciones literales, no derivadas de
  ninguna fuente porque es contenido propio de este guion) y
  `MENSAJE_TRAS_ANIMAL`. `paso === 'animal'` ahora renderiza un
  `<input aria-label="Tu respuesta">` controlado + botón "Enviar
  respuesta" que llama a `manejarEnvioAnimal` (sin guarda de validación
  todavía: ningún test la exige aquí). Nuevo paso `'cuando'` con
  `fieldset aria-label="Respuestas rápidas"` y los 4 botones (sin
  `onClick` todavía, @s4 no pulsa ninguno).
- REFACTOR: ninguno.

### Ciclo 5 — @s5 (paso "nombre": campo libre con marcador)

- ROJO: tras responder los 3 primeros pasos (se necesita pulsar un botón
  del paso "cuándo", que aún no tenía `onClick`), el mensaje final
  esperado no aparecía — seguía en "Perfecto. ¿Cuándo te viene mejor?".
- VERDE: `manejarSeleccionCuando` (cablea el clic de "cuándo", empuja los 2
  mensajes, pasa a `'nombre'`); nuevo paso `'nombre'` con textbox +
  `placeholder={MARCADOR_NOMBRE}` + botón "Enviar respuesta" (aún sin
  `onClick` ni `aria-disabled`: @s5 no los pide).
- REFACTOR: ninguno.

### Ciclo 6 — @s6 (envío vacío no avanza el guion — paso "nombre")

- ROJO: pulsar "Enviar respuesta" con el campo vacío no exponía
  `aria-disabled`.
- VERDE: nace `src/components/ReservaChat-logica.ts` (Invariante 6) con
  `puedeRegistrarRespuesta(texto)` (`texto.trim().length > 0`). Se cablea
  `aria-disabled={!puedeRegistrarRespuesta(textoLibre)}` y
  `onClick={manejarEnvioNombre}` en el botón del paso "nombre";
  `manejarEnvioNombre` hace guarda-y-nada-más por ahora (permitido "hacer
  trampa" en verde, docs/tdd.md: ningún test todavía exige qué pasa en el
  caso válido).
- REFACTOR: ninguno.

### Ciclo 7 — @s7 (envío vacío no avanza el guion — paso "animal")

- ROJO: mismo caso que @s6 pero en el paso "animal" (solo espacios): el
  botón no exponía `aria-disabled` porque `manejarEnvioAnimal` nunca
  llegó a guardarse contra `puedeRegistrarRespuesta`.
- VERDE/REFACTOR (generalización forzada por el segundo caso, tal como
  anticipa `docs/tdd.md`): se añade la misma guarda a
  `manejarEnvioAnimal` y el mismo `aria-disabled` a su botón. Ya no hay
  duplicación de la regla de validación: ambos pasos de texto libre la
  comparten desde el módulo puro.

### Ciclo 8 — @s8 (Intro equivale a Enviar, mensaje final con resumen)

- ROJO: tras escribir "Nala y Ana Martín{Enter}" en el paso "nombre", el
  historial no ganaba ningún mensaje nuevo (Intro no hacía nada;
  `manejarEnvioNombre` seguía siendo la guarda-y-nada-más del ciclo 6).
- VERDE: nace `componerResumen(servicio, animal, cuando)` en
  `ReservaChat-logica.ts` (`[servicio, animal, cuando].join(' · ')`). Se
  añade estado `respuestas` (guarda las 3 respuestas crudas en cada
  transición) y se completa `manejarEnvioNombre`: compone el mensaje final
  `Gracias, <nombre>. Anotado: <resumen>. Para cerrar la cita, llámanos al
  <datosNegocio.telefonoClinica.textoVisible> y dinos estos datos.` — el
  teléfono se deriva de la fuente única (Invariante 2), no se re-escribe.
  Nuevo paso terminal `'final'` (sin render propio todavía: ningún test
  exige aún qué se ve ahí — @s11/@s12 lo completarán). Se añade
  `manejarTeclaEnvioNombre` (`onKeyDown`, solo en el input del paso
  "nombre": ningún escenario pide Intro en el paso "animal").
- REFACTOR: ninguno (la guarda de validación ya vivía en el módulo puro
  desde el ciclo 7, se reutiliza sin cambios).

### Ciclo 9 — @s9 (Intro con el campo en blanco no hace nada)

- El test **pasó a la primera** (la guarda de `manejarEnvioNombre` del
  ciclo 6 ya cubre también la vía de Intro cableada en el ciclo 8).
  Verificado con sabotaje manual: se quitó temporalmente la guarda de
  `manejarEnvioNombre` → tanto @s6 como @s9 fallaron exactamente como se
  esperaba (historial con 9 mensajes en vez de 7). Revertido, vuelto a
  verde. Sin cambios de producción en este ciclo.

### Ciclo 10 — @s10 (recorte de espacios sobrantes al registrar)

- ROJO: con `'  Nala y Ana Martín  '` en el campo, el historial no
  contenía `'Tú: Nala y Ana Martín'` (contenía la versión con espacios sin
  recortar).
- VERDE: `manejarEnvioNombre` pasa a usar `normalizarRespuesta(textoLibre)`
  (ya existía en `ReservaChat-logica.ts` desde el diseño del ciclo 8, pero
  no se usaba todavía — Ley 1 respetada: no se invocó hasta que un test lo
  exigió) tanto para el mensaje del visitante como para el saludo final.
- REFACTOR: ninguno.

### Ciclo 11 — @s11 (mensaje final exacto con resumen y teléfono real)

- El test **pasó a la primera** (la plantilla del mensaje final ya se
  construyó completa en el ciclo 8, y el ciclo 10 ya la alimenta con el
  valor recortado). Verificado con sabotaje manual: se invirtió el orden
  de los argumentos de `componerResumen` (`animal, servicio, cuando`) → el
  test falló mostrando el resumen desordenado. Revertido. Sin cambios de
  producción en este ciclo.

### Ciclo 12 — @s12 (estado final: resumen, enlace de llamada, "Pedir otra cita")

- ROJO: no existía ningún grupo "Resumen de tu solicitud" ni enlace de
  llamada en el paso `'final'` (ese paso no renderizaba nada en el pie
  todavía).
- VERDE: `respuestas` gana el campo `nombre` (guardado en
  `manejarEnvioNombre`, pendiente desde el ciclo 10 porque hasta ahora
  ningún test lo necesitaba). Nuevo bloque `paso === 'final'`:
  `fieldset aria-label="Resumen de tu solicitud"` con una `<ul>` de 4
  `<li>` (`Servicio:`/`Animal:`/`Cuándo:`/`Nombre:`), un enlace que
  reutiliza `datosNegocio.telefonoClinica.enlaceLlamada` (ya calculado en
  la fuente única, `src/lib/site.ts` — no se recompone `tel:` a mano) y un
  botón "Pedir otra cita" **sin `onClick` todavía** (@s12 solo comprueba
  que existe con ese nombre accesible; su comportamiento de reinicio lo
  exige @s13, no antes).
- REFACTOR: ninguno.

### Ciclo 13 — @s13 ("Pedir otra cita" reinicia el guion)

- ROJO: pulsar "Pedir otra cita" no cambiaba nada (el botón no tenía
  `onClick` desde el ciclo 12) — historial seguía en 9 mensajes.
- VERDE: nace `reiniciar()` — vuelve `historial` a su único mensaje de
  bienvenida (con un id nuevo del mismo contador, no se reutiliza el `0`
  para no arriesgar colisión de `key` con un remonte futuro), `paso` a
  `'servicio'`, `textoLibre` a `''` y `respuestas` a su forma vacía. Se
  cablea en el `onClick` de "Pedir otra cita".
- REFACTOR: ninguno.

### Ciclo 14 — @s14 (bifurcación de urgencia — el núcleo del Invariante 6)

- ROJO: tras pulsar "Es una urgencia", el guion seguía preguntando por el
  animal (mensaje "Entendido. ¿Con qué animal vienes?" en vez del mensaje
  de derivación a urgencias).
- VERDE: nace `siguientePaso(pasoActual, respuesta)` en
  `ReservaChat-logica.ts`, junto con el tipo `IdPaso` (movido aquí desde
  el `.tsx`, ahora con `'urgencia'` añadido) y la constante
  `OPCION_URGENCIA` (también movida aquí: la decisión de qué respuesta
  corta el guion vive en el módulo puro, no en el componente). Este es el
  ciclo que exige de verdad la generalización que los ciclos 2-5 dejaron
  pendiente a propósito (avanzar siempre a `'animal'` de forma
  incondicional): `manejarSeleccionServicio` ahora llama a
  `siguientePaso('servicio', opcion)` y elige el mensaje del asistente
  según el resultado (`MENSAJE_URGENCIA` si es `'urgencia'`,
  `MENSAJE_TRAS_SERVICIO` si no). Nuevo bloque de render
  `paso === 'urgencia'` con los dos enlaces de llamada (urgencias +
  clínica), ambos derivados de `datosNegocio` (Invariante 2).
- REFACTOR: ninguno adicional (la generalización del párrafo anterior ES
  el refactor de este ciclo, hecho en verde).

### Ciclo 15 — @s15 (tras urgencia no se pregunta animal/cuándo/nombre)

- El test **pasó a la primera**: el bloque `paso === 'urgencia'` del
  ciclo 14 no renderiza textbox, respuestas rápidas ni resumen por
  construcción (son ramas `if` mutuamente excluyentes por `paso`).
  Verificado con sabotaje manual: se añadió temporalmente un
  `<input aria-label="Tu respuesta">` dentro del bloque de urgencia → el
  test falló exactamente en la aserción `queryByRole('textbox')`.
  Revertido. Sin cambios de producción en este ciclo.

### Ciclo 16 — @s16 ("Empezar de nuevo" desde urgencia)

- ROJO: no existía ningún botón "Empezar de nuevo" en el estado de
  urgencia.
- VERDE: se añade el botón "Empezar de nuevo" al bloque
  `paso === 'urgencia'`, reutilizando el mismo `reiniciar()` del ciclo 13
  (sin duplicar la lógica de reinicio).
- REFACTOR: ninguno.

### Ciclo 17 — @s17 (aviso de demo visible en todos los estados)

- ROJO: en el paso "servicio" no se veía ningún texto "Demostración: esta
  solicitud...".
- VERDE: nace `AVISO_DEMO` y se renderiza como `<p>{AVISO_DEMO}</p>` **al
  final del `fieldset` del widget, fuera de los bloques condicionales por
  `paso`** — así se ve en los 6 estados sin necesidad de repetirlo en cada
  bloque. "en línea" nunca se escribe en ningún sitio, así que esa parte
  de la aserción no exige código nuevo.
- REFACTOR: ninguno.

### Ciclo 18 — @s18 (columna de texto: llamar directamente, sin WhatsApp ni mailto)

- ROJO: no existía ningún enlace "Llamar a la clínica · 91 082 92 67" ni
  "Llamar al móvil · 685 34 31 49" fuera del widget.
- VERDE: nueva columna de texto (`<div>` antes del `fieldset` del widget,
  dentro de la misma `<section>`) con los dos enlaces, ambos derivados de
  `datosNegocio` (Invariante 2, mismo patrón que el enlace del estado
  final). Sin WhatsApp ni `mailto:`: no se escriben porque el PENDIENTE de
  `features/reserva_chat.feature` (canal de mensajería, Decisión 14 de
  `project-spec.md`) sigue sin resolver.
- REFACTOR: ninguno. Nota de diseño de test (no de producción): a partir
  de aquí la columna de texto y el widget pueden compartir el mismo texto
  accesible para un enlace (p. ej. "Llamar a la clínica · 91 082 92 67"
  aparece en la columna siempre y en el widget solo en el estado de
  urgencia) — los tests de @s14/@s16 ya usaban `within(widget)` desde que
  se escribieron (ver ciclos 14/16), así que no hicieron falta cambios
  retroactivos.

### Ciclo 19 — @s19 (horario real en la columna de texto, sin promesas)

- ROJO: no existía ninguna lista de horario fuera del widget.
- VERDE: `<ul>` que mapea `datosNegocio.horario` (fuente única) a
  `<li>{"${dias}: ${horas}"}</li>`. Las cuatro cláusulas de ausencia ("en
  menos de 2 horas", "Recordatorio", "sin coste", "24 h"/"24h") no piden
  código: nunca se escriben.
- REFACTOR: ninguno.

### Ciclo 20 — @s20 (cada mensaje dice quién lo dice, sin depender del color)

- El test **pasó a la primera**: `mensajeAsistente`/`mensajeVisitante`
  (ciclo 1/2) ya prefijan cada mensaje. Verificado con sabotaje manual:
  `mensajeVisitante` se hizo devolver el texto sin el prefijo "Tú: " → el
  propio @s20 falló (y, como daño colateral esperado, otros 4 tests que
  comprueban el prefijo literal). Revertido, vuelto a verde. Sin cambios
  de producción en este ciclo.

### Ciclos 21-23 — @s21/@s22/@s23 (cobertura directa del módulo puro)

- Nuevo fichero `ReservaChat-logica.test.ts`. Los tres escenarios **pasaron
  a la primera**: es el comportamiento pretendido por el propio `.feature`
  (cabecera, Añadido #13: "para que el Invariante 6 tenga superficie de
  test que un `mutation_tester` pueda de verdad matar, los @s1-@s20 solo
  observan el resultado en pantalla"). `puedeRegistrarRespuesta`,
  `normalizarRespuesta`, `componerResumen` y `siguientePaso` ya existían
  íntegros desde los ciclos 6, 8, 10 y 14 respectivamente, forzados en su
  momento por escenarios de DOM (@s6/@s7, @s10, @s8/@s11, @s14). Estos
  tres ciclos no añaden lógica nueva: añaden la segunda vía de mordida
  directa contra el módulo puro que exige el propio contrato, sin pasar
  por `render`/`userEvent`. No se consideran "verde por vacuidad": cada
  aserción compara con el literal exacto exigido por su `@s`, y las
  funciones ya fueron verificadas mordiendo de verdad en sus ciclos de
  origen (sabotajes manuales de los ciclos 3, 9, 11, 15, 20 y las guardas
  reales de los ciclos 6/7).
- Sin cambios de producción en estos tres ciclos.

### Refactor final (en verde, tras cerrar los 23 escenarios)

Los cuatro enlaces `Llamar <etiqueta> · <número>` (columna de texto ×2,
estado final ×1, estado urgencia ×2) repetían el mismo patrón
`<a href={tel.enlaceLlamada}>{`${etiqueta} · ${tel.textoVisible}`}</a>`.
Extraído a un componente local `EnlaceLlamada({ etiqueta, telefono })`
dentro de `ReservaChat.tsx` (mismo patrón que `TarjetaProfesional` en
`Equipo.tsx`: componente local no exportado, cablea presentación, cero
lógica de decisión). Comportamiento idéntico verificado: los 25 tests de
`reserva_chat` siguen en verde, igual que `pnpm run lint` y `pnpm run
typecheck`.

## Verificación final de la sesión

- `pnpm exec vitest run src/components/ReservaChat.test.tsx
  src/components/ReservaChat-logica.test.ts`: **25/25 verde** (20
  escenarios de DOM + 5 tests de lógica pura para @s21/@s22/@s23).
- `node .harness/harness.mjs init`: **verde** — lint (`oxlint
  --deny-warnings`) sin errores, `tsc -b` sin errores, suite completa
  **162/162** (137 preexistentes + 25 nuevos).
- No se toca `feature_list.json`: la feature queda `in_progress`, a la
  espera de `judge` y `mutation_tester` (regla dura del `craftsman_lead`,
  no me corresponde marcarla `done`).
- No quedan `console.*`, `debugger`, `.only`/`.skip` ni TODOs sin contexto
  en los ficheros tocados (verificado con `grep`).

## Trazabilidad @s → test

| Escenario | Test | Fichero |
| --- | --- | --- |
| @s1 | `hay un grupo "Asistente de reserva de Galapavet"...` | `ReservaChat.test.tsx` |
| @s2 | `tras pulsar "Medicina general" el historial pasa a 3 mensajes...` | `ReservaChat.test.tsx` |
| @s3 | `el texto recorrido contiene los 5 servicios reales...` | `ReservaChat.test.tsx` |
| @s4 | `hay 4 respuestas rápidas de horario real...` | `ReservaChat.test.tsx` |
| @s5 | `se ve la pregunta del nombre, el textbox con su marcador...` | `ReservaChat.test.tsx` |
| @s6 | `pulsar "Enviar respuesta" con el campo vacío expone aria-disabled...` | `ReservaChat.test.tsx` |
| @s7 | `con solo espacios en el paso del animal, "Enviar respuesta" expone aria-disabled...` | `ReservaChat.test.tsx` |
| @s8 | `con "Nala y Ana Martín" escrito, Intro añade el mensaje...` | `ReservaChat.test.tsx` |
| @s9 | `el historial sigue en 7 mensajes, el campo sigue vacío...` | `ReservaChat.test.tsx` |
| @s10 | `con espacios de sobra alrededor, el mensaje añadido...` | `ReservaChat.test.tsx` |
| @s11 | `el último mensaje es exactamente el saludo con el resumen...` | `ReservaChat.test.tsx` |
| @s12 | `hay un resumen de 4 líneas, un enlace de llamada...` | `ReservaChat.test.tsx` |
| @s13 | `el historial vuelve a 1 mensaje, vuelven las 6 respuestas rápidas...` (Pedir otra cita) | `ReservaChat.test.tsx` |
| @s14 | `el historial registra la urgencia y hay enlaces a urgencias y a la clínica...` | `ReservaChat.test.tsx` |
| @s15 | `el historial se queda en 3 mensajes y no quedan ni preguntas posteriores...` | `ReservaChat.test.tsx` |
| @s16 | `el historial vuelve a 1 mensaje, vuelven las 6 respuestas rápidas...` (Empezar de nuevo) | `ReservaChat.test.tsx` |
| @s17 | `el aviso se ve en el paso servicio, en el estado final y en la derivación a urgencias...` | `ReservaChat.test.tsx` |
| @s18 | `hay enlaces a la clínica y al móvil, y en toda la sección no hay WhatsApp ni mailto` | `ReservaChat.test.tsx` |
| @s19 | `se ven exactamente los 3 tramos de horario reales...` | `ReservaChat.test.tsx` |
| @s20 | `cada mensaje empieza por "Asistente:" o "Tú:"...` | `ReservaChat.test.tsx` |
| @s21 | `acepta "Nala y Ana Martín"...` + `el valor normalizado de "  Nala y Ana Martín  "...` | `ReservaChat-logica.test.ts` |
| @s22 | `el resumen es exactamente "Medicina general · Una gata de 4 años · Entre semana por la mañana"` | `ReservaChat-logica.test.ts` |
| @s23 | `desde "servicio" con "Es una urgencia" el paso siguiente es "urgencia"...` + `desde "urgencia" el paso siguiente no es ni "animal"...` | `ReservaChat-logica.test.ts` |

## Ficheros de producción entregados

- `src/components/ReservaChat-logica.ts` — módulo puro:
  `puedeRegistrarRespuesta`, `normalizarRespuesta`, `componerResumen`,
  `IdPaso`, `OPCION_URGENCIA`, `siguientePaso`.
- `src/components/ReservaChat.tsx` — el widget de chat + la columna de
  texto de la sección "Reservar" (llamada directa + horario), reutilizando
  `datosNegocio` (`src/lib/site.ts`) y `SERVICIOS` (`src/data/servicios.ts`).
- `src/components/ReservaChat.test.tsx` (20 tests) y
  `src/components/ReservaChat-logica.test.ts` (5 tests).

## Problemas de configuración encontrados (fuera de `src/`, documentados, no ocultados)

Ninguno nuevo esta sesión: `node .harness/harness.mjs init` estaba limpio
antes del primer test rojo (137/137, lint y typecheck sin errores). El
único hallazgo de esta sesión fue de comportamiento del linter dentro de
`src/` (no de configuración del arnés): `jsx-a11y(prefer-tag-over-role)`
de oxlint rechaza `role="group"` explícito en un `<div>` aunque no esté
listado por nombre en `.oxlintrc.json` (hereda la severidad `error` de la
categoría `correctness` del plugin `jsx-a11y`, activo por defecto).
Resuelto usando `<fieldset aria-label="...">` (role "group" implícito) en
vez de `<div role="group">`, documentado en el Ciclo 1.

---

## Ronda 2 — corrección tras `progress/judge_reserva_chat.md` (CHANGES_REQUESTED)

> Alcance: exactamente los dos "Qué tiene que corregir la próxima ronda" del
> veredicto (Hallazgo 1: línea de `reiniciar()` sin test que la pida;
> Hallazgo 2: guarda de ausencia vacío en @s16). No se toca nada más de la
> ronda 1. No existe `progress/mutation_reserva_chat.md` todavía (el `judge`
> de la ronda 1 cortó antes de llegar a mutación, igual que le pasó a
> `equipo` en su ronda 1).

### Estado previo confirmado

`node .harness/harness.mjs init` **verde** antes de tocar nada: lint,
typecheck y **162/162** tests (mismo baseline que cerró la ronda 1 y que
verificó el propio `judge`).

### Hallazgo 2 primero — @s16, guarda de ausencia vacío (`ReservaChat.test.tsx:374-376`)

El `judge` señaló que `for (const enlace of within(widget).queryAllByRole('link')) { expect(...).not.toBe(...) }`
itera 0 veces en el estado en el que corre (`paso === 'servicio'` tras
"Empezar de nuevo" no renderiza ningún `link`), así que el `expect` de
dentro nunca se ejecuta y el test pasa con cualquier implementación.

- **Fix (solo test, sin tocar producción)**, siguiendo el mismo patrón que
  ya usa correctamente @s13 (`toHaveLength(0)`), combinado con la aserción
  más literal del `.feature` por claridad de intención, tal y como sugirió
  el propio veredicto en vez de sustituir un patrón por otro sin ganancia:

  ```diff
  - for (const enlace of within(widget).queryAllByRole('link')) {
  -   expect(enlace.getAttribute('href')).not.toBe('tel:+34918511393')
  - }
  + expect(within(widget).queryAllByRole('link')).toHaveLength(0)
  + expect(
  +   within(widget).queryByRole('link', { name: 'Llamar a urgencias fuera de horario · 91 851 13 93' }),
  + ).not.toBeInTheDocument()
  ```

- **Verde inmediato:** con la producción actual (paso `'servicio'` tras
  `reiniciar()` no renderiza ningún `<a>` dentro del widget), el fix pasa
  sin más cambios: `pnpm exec vitest run ReservaChat.test.tsx
  ReservaChat-logica.test.ts` → 25/25.
- **Verificación de que el hueco queda cerrado (sabotaje manual):** se
  añadió temporalmente `<a href="tel:+34918511393">SABOTAJE_TEMPORAL</a>`
  justo antes del bloque `paso === 'urgencia'` en `ReservaChat.tsx` (fuera
  de cualquier condicional de `paso`, para que sobreviva a cualquier
  estado). Resultado: **2 tests** se pusieron en rojo —
  `AssertionError: expected [ <a href="tel:+34918511393"></a> ] to have a
  length of +0 but got 1` — tanto @s13 (que ya tenía la aserción correcta
  desde la ronda 1) como @s16 (la nueva). Confirma que la nueva aserción de
  @s16 sí muerde de verdad, cerrando el hueco que señaló el `judge`.
  Sabotaje revertido íntegramente después (solo esa línea añadida y
  quitada; nada más tocado en `ReservaChat.tsx`).

### Hallazgo 1 — la línea de `respuestas` en `reiniciar()` (`ReservaChat.tsx:117`)

El `judge` pidió un ciclo TDD real: completar el guion una vez, pulsar
"Pedir otra cita", completarlo una segunda vez con respuestas **distintas**,
y comprobar que el resumen final de la segunda vuelta no arrastra ningún
dato de la primera; ese test debía fallar en rojo si se quitaba la línea
`setRespuestas({ servicio: '', animal: '', cuando: '', nombre: '' })` de
`reiniciar()`.

**Investigación antes de escribir producción (Ley 1: ni una línea sin que un
rojo la pida) — el test prescrito no se puede poner en rojo, y he verificado
por qué en vez de asumirlo:**

1. Escrito el test exacto que describe el veredicto en un fichero de sondeo
   descartable (`src/components/sondaje.test.tsx`, no comiteado): completa
   el guion con "Medicina general" / "Una gata de 4 años" / "Entre semana
   por la mañana" / "Nala y Ana Martín", pulsa "Pedir otra cita", completa
   de nuevo con datos totalmente distintos ("Análisis" / "Un perro de 2
   años" / "El sábado por la mañana" / "Pablo"), y comprueba que el resumen
   final es exactamente el de la segunda vuelta.
2. Ejecutado contra la producción tal cual (con la línea de `reiniciar()`
   presente): **verde**, como se esperaba.
3. Sabotaje: quitada la línea `setRespuestas(...)` de `reiniciar()` (la
   misma que sabotajeó el `judge`). Reejecutado el test de sondeo:
   **sigue en verde**. La línea no se puede poner en rojo con el escenario
   que pidió el veredicto.
4. Causa raíz identificada: `paso === 'final'` (donde se lee y se muestra
   `respuestas.servicio/.animal/.cuando/.nombre`) solo es alcanzable
   recorriendo la máquina de estados de forma estrictamente lineal
   `'servicio' → 'animal' → 'cuando' → 'nombre' → 'final'` (ver
   `siguientePaso` en `ReservaChat-logica.ts`), y **cada uno** de esos
   cuatro pasos escribe su propio campo de `respuestas` antes de avanzar
   (`manejarSeleccionServicio`, `manejarEnvioAnimal`,
   `manejarSeleccionCuando`, `manejarEnvioNombre`). Por construcción, para
   que el estado `'final'` sea visible los 4 campos han tenido que
   reescribirse *en esa misma vuelta*, reinicie o no `reiniciar()` el objeto
   `respuestas` de partida — el valor viejo queda pisado antes de leerse,
   nunca a la vista. La variante de urgencia (`'urgencia'`) tampoco expone
   el hueco: ese bloque de render no muestra ningún campo de `respuestas`
   (solo enlaces `tel:` estáticos derivados de `datosNegocio`), así que da
   igual qué contenga `respuestas.animal/.cuando/.nombre` al llegar ahí.
   Aplica igual a la variante que el `judge` pidió revisar explícitamente
   ("si el guion completo antes de derivar a urgencias pudiera dejar
   `respuestas` a medio rellenar"): no aplica, porque `'servicio'` es lo
   único que se responde antes de la bifurcación (confirmado releyendo
   `siguientePaso`: el caso `'servicio'` es el único con una rama que no
   sea "avanza al siguiente paso fijo").
5. Confirmado además que **ningún** test de los 25 existentes (ronda 1)
   depende de esa línea: con la línea quitada,
   `pnpm exec vitest run ReservaChat.test.tsx ReservaChat-logica.test.ts` →
   **25/25 verde** igualmente (mismo resultado que ya había reportado el
   `judge` con su Sabotaje 2).
6. Fichero de sondeo `src/components/sondaje.test.tsx` borrado tras la
   comprobación; no queda en el árbol de trabajo.

**Decisión, aplicando la Ley 1 de forma consistente con el precedente de
`servicios` ronda 2 (Ciclo 21, `progress/tdd_servicios.md`):** si ningún
rojo posible puede exigir una línea de producción, la corrección correcta
no es inventar un test artificial que la fuerce a existir por decreto — es
**quitar la línea**, exactamente el mismo movimiento que ya aprobó esta
disciplina cuando `Servicios.tsx` tenía atributos sin test que los pidiera.
No es una discrepancia con el fondo del hallazgo del `judge` (Ley 1 seguía
violada: había producción sin rojo que la exigiera) — es la resolución que
esa misma ley exige cuando, al intentar tapar el hueco con el test que se
propuso, se descubre que el hueco no es alcanzable por ningún camino de la
UI.

- Cambio único, sin tocar nada más del fichero:

  ```diff
    function reiniciar(): void {
      setHistorial([{ id: siguienteId.current++, texto: mensajeAsistente(MENSAJE_BIENVENIDA) }])
      setPaso('servicio')
      setTextoLibre('')
  -   setRespuestas({ servicio: '', animal: '', cuando: '', nombre: '' })
    }
  ```

- Después del cambio: `pnpm exec vitest run ReservaChat.test.tsx
  ReservaChat-logica.test.ts` → **25/25 verde** (mismo recuento: no se
  añade ni se quita ningún test, solo se retira producción no exigida).

### Verificación final (ronda 2)

- `node .harness/harness.mjs init`: **verde** — lint (`oxlint
  --deny-warnings`) sin errores, `tsc -b` sin errores, suite completa
  **162/162** (mismo recuento que la ronda 1: ambas correcciones son
  test-only o retirada de producción muerta, ningún escenario nuevo).
- `src/components/ReservaChat.tsx` y `src/components/ReservaChat.test.tsx`
  releídos completos tras los cambios: el resto de ambos ficheros es
  idéntico a la ronda 1; solo difieren la línea retirada de `reiniciar()` y
  el bloque de aserciones de @s16 descrito arriba.
- No quedan `console.*`, `debugger`, `.only`/`.skip`, `TODO` ni restos de
  "SABOTAJE" en ninguno de los dos ficheros (`grep` propio, sin
  coincidencias).
- No se toca `feature_list.json`: la feature sigue `in_progress`, a la
  espera de `judge` (segunda pasada) y de `mutation_tester` — no me
  corresponde marcarla `done`.

### Pendiente para las siguientes puertas (ronda 2)

- `judge`: confirmar que (a) `ReservaChat.tsx:113-117` ya no contiene
  código sin test que lo exija — y revisar la investigación de esta ronda
  sobre por qué el escenario propuesto no podía ponerse en rojo, en vez de
  solo la ausencia de la línea — y (b) `ReservaChat.test.tsx:358-379` (@s16)
  ya no tiene ningún bucle sobre una colección vacía por construcción.
- `mutation_tester`: sin cambios de alcance respecto a la ronda 1;
  `ReservaChat.tsx` sigue fuera del glob por defecto de
  `stryker.config.json` (hay que invocarlo con `--mutate
  src/components/ReservaChat.tsx` si se quiere medir su superficie real,
  nota que ya dejó el `judge` en la ronda 1).

