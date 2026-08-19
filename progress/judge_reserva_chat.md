# Judge — reserva_chat (id 7), ronda 1

> Revisión contra `features/reserva_chat.feature` (23 escenarios @s1-@s23) y
> `progress/tdd_reserva_chat.md`. No me fío del relato del `tdd_craftsman`:
> verificación independiente propia con sabotaje manual sobre los dos puntos
> de mayor riesgo, revertido byte a byte en ambos casos.

## Veredicto

**CHANGES_REQUESTED**

Dos hallazgos reales, confirmados con sabotaje manual y revertidos, ninguno
cosmético:

1. `ReservaChat.tsx:117` (`setRespuestas(...)` dentro de `reiniciar()`) es
   **código de producción que ningún test rojo pidió** (Ley 1) y esconde un
   **bug de datos real**: tras completar el guion, pulsar "Pedir otra cita" y
   completarlo una segunda vez con respuestas distintas, el resumen de la
   segunda solicitud podría arrastrar campos de la primera si esa línea
   desaparece — y ningún test actual lo detectaría.
2. `ReservaChat.test.tsx:374-376` (dentro de @s16) es un **guarda de
   ausencia vacío**: el bucle `for (const enlace of
   within(widget).queryAllByRole('link'))` itera **cero veces** en el estado
   en el que se ejecuta, así que la aserción de dentro nunca corre y el test
   pasaría igual con cualquier implementación.

Ambos quedan fuera del alcance de `mutation_tester`: `stryker.config.json`
excluye explícitamente los `.tsx` del mutador (comentario propio del
fichero: "StrykerJS no muta ni el texto ni los atributos de JSX"), así que
el `judge` es la única puerta capaz de cazarlos — mismo patrón que motivó el
rechazo de ronda 1 de `equipo` (`toHaveTextContent` de subcadena en vez de
igualdad) y de `servicios` (producción sin test que la pida).

---

## 1. Cobertura @s ↔ test

23/23 escenarios de `features/reserva_chat.feature` tienen un test concreto
y localizable, verificado uno a uno contra los ficheros reales (no solo
contra la tabla de `progress/tdd_reserva_chat.md`):

- @s1-@s20 → un `describe`/`it` propio en `src/components/ReservaChat.test.tsx`
  (20 bloques, confirmado por conteo directo del fichero).
- @s21-@s23 → `src/components/ReservaChat-logica.test.ts` (5 `it`, mapeados
  2+1+2 según la tabla de trazabilidad, coincide con el fichero real).

`pnpm exec vitest run src/components/ReservaChat.test.tsx
src/components/ReservaChat-logica.test.ts` → **25/25 verde** (confirmado por
mí, no solo citado del informe del `tdd_craftsman`).

No hay ningún `@s` sin test ni ningún test "por delante" de un escenario que
aún no toque (revisado ciclo a ciclo en `progress/tdd_reserva_chat.md`: cada
ciclo cita el ROJO exacto y, cuando el test pasó a la primera, hay sabotaje
manual documentado — spot-check propio abajo).

## 2. Patrón `doble-de-test-anclado-al-literal-no-al-simbolo`

**Sin hallazgos.** Revisados los imports de ambos ficheros de test:

- `ReservaChat.test.tsx` solo importa `React`, utilidades de
  `@testing-library/*` y `ReservaChat`. Ningún literal de aserción
  (teléfonos, horario, nombres de servicio, `AVISO_DEMO` en la línea 380,
  mensajes del guion) se deriva de un símbolo importado de producción —
  todos son literales escritos a mano, como exige el propio encabezado del
  `.feature` ("Los literales de este fichero se copian A MANO al test").
  Comprobado en particular que `AVISO_DEMO` (línea 380 del test) NO está
  exportado por `ReservaChat.tsx` — es estructuralmente imposible
  reimportarlo aunque se quisiera.
- `ReservaChat-logica.test.ts` importa las 4 funciones puras bajo test
  (`componerResumen`, `normalizarRespuesta`, `puedeRegistrarRespuesta`,
  `siguientePaso`), que es lo esperado (se testea la función, no se la
  evita), pero **no** importa `OPCION_URGENCIA` para comparar contra ella:
  @s23 compara contra el literal `'Es una urgencia'` escrito a mano. Correcto.

## 3. Patrón `verde-por-vacuidad-en-puerta-de-verificación`

**Un hallazgo confirmado con sabotaje empírico** (ver Hallazgo 2 abajo).
Revisados todos los bucles sobre colecciones potencialmente vacías
(`queryAllByRole` sin guarda previa) y todas las aserciones de ausencia de
texto (`not.toHaveTextContent`) del fichero:

| Línea | Patrón | ¿Vacío por construcción? | Veredicto |
| --- | --- | --- | --- |
| 75-77 (@s3) | `for (...) expect(container).not.toHaveTextContent(...)` | No (`container` no vacío, verificado en la línea anterior) | OK |
| 109-112 (@s4) | `for (const boton of botones) ...` | No (`botones` ya verificado con longitud 4 vía `.toEqual`) | OK |
| 287-290 (@s12) | `for (const enlaceWidget of within(widget).queryAllByRole('link'))` | No — ya se obtuvo 1 link concreto por `getByRole` unas líneas antes en el mismo test | OK |
| 312 (@s13) | `expect(within(widget).queryAllByRole('link')).toHaveLength(0)` | N/A — aserción directa sobre la longitud, no un bucle | OK, patrón correcto |
| **374-376 (@s16)** | `for (const enlace of within(widget).queryAllByRole('link')) { expect(...).not.toBe(...) }` | **Sí — 0 elementos, confirmado empíricamente** | **VACÍO, ver Hallazgo 2** |
| 414-419 (@s18) | `for (const enlace of screen.getAllByRole('link')) ...` | No — `getAllByRole` (no `query...`) **lanza** si no hay ninguno, no puede pasar vacío en silencio | OK |
| 434-436 (@s19) | `for (...) expect(container).not.toHaveTextContent(...)` | No | OK |

## 4. Disciplina TDD (Rojo-Verde-Refactor)

`progress/tdd_reserva_chat.md` documenta 23 ciclos (uno o más por `@s`), con
ROJO citado explícitamente en cada uno que no pasó a la primera, y sabotaje
manual documentado para cada uno que sí pasó a la primera (ciclos 3, 9, 11,
15, 20-23). La bitácora es coherente internamente y con el estado real de
los ficheros.

**Verificación independiente propia (no me fío solo del relato):**

- **Sabotaje 1** — `ReservaChat-logica.ts`, `siguientePaso`, caso
  `'servicio'`: cambiado temporalmente `respuesta === OPCION_URGENCIA ?
  'urgencia' : 'animal'` → `'animal'` (siempre). Resultado:
  `pnpm exec vitest run ReservaChat.test.tsx ReservaChat-logica.test.ts` →
  **4 tests caen** (@s14, @s15, @s16 en DOM + @s23 en lógica pura),
  exactamente los que dependen de la bifurcación de urgencia. Revertido
  byte a byte, vuelto a 25/25 verde. Confirma que el núcleo del
  Invariante 6 sí está mordido de verdad por el DOM y por la lógica pura.
- **Sabotaje 2** — `ReservaChat.tsx`, `reiniciar()`: quitada la línea
  `setRespuestas({ servicio: '', animal: '', cuando: '', nombre: '' })`.
  Resultado: **25/25 siguen en verde** — ningún test lo pide. Este es el
  Hallazgo 1 (abajo), no una confirmación de calidad.
- **Sabotaje 3 (empírico, fichero de test descartable, no comiteado)** —
  añadido un test temporal que fuerza el fallo de
  `expect(within(widget).queryAllByRole('link').length).toBe(-1)`
  inmediatamente después de "Es una urgencia" → "Empezar de nuevo". El
  diff del assertion error confirmó `Received: 0`. Esto es el Hallazgo 2
  (abajo): el bucle de @s16 sobre esa colección nunca ejecuta su cuerpo.
  Fichero temporal borrado tras la comprobación, no queda en el árbol de
  trabajo.

`bin/harness init` (invocado como `node .harness/harness.mjs init` — no hay
`pwsh` en esta máquina, igual que en el resto de la sesión) vuelto a correr
por mí **después** de revertir los 3 sabotajes: **verde**, lint
(`oxlint --deny-warnings`) sin errores, `tsc -b` sin errores, **162/162**
tests.

No quedan `console.*`, `debugger`, `.only`/`.skip` ni TODOs sin contexto en
`ReservaChat.tsx`, `ReservaChat-logica.ts`, `ReservaChat.test.tsx` ni
`ReservaChat-logica.test.ts` (grep propio, sin coincidencias).

## 5. Calidad de artesano, fichero a fichero

- **`src/components/ReservaChat-logica.ts`** — módulo puro correcto:
  4 funciones + 1 tipo + 1 constante exportada, cada una con su comentario
  de qué `@s` la exige, sin efectos secundarios, sin importar nada de React
  ni del DOM. `siguientePaso` es un `switch` exhaustivo sobre `IdPaso`
  (TypeScript lo comprueba). Sin duplicación. Bien.
- **`src/components/ReservaChat.tsx`** — el `.tsx` cablea, no decide (todas
  las decisiones de bifurcación/validación/normalización/resumen delegan en
  `ReservaChat-logica.ts` o en `datosNegocio`/`SERVICIOS`, ninguna reescrita
  a mano). El estado condicional del botón de envío usa `aria-disabled`, no
  una clase (Invariante 5, respetado). `EnlaceLlamada` como componente local
  no exportado repite el patrón ya usado en `Equipo.tsx`
  (`TarjetaProfesional`) para no duplicar el `<a href=...>` cuatro veces —
  buen refactor en verde. Único defecto real: la línea de `reiniciar()` sin
  test que la exija (Hallazgo 1).
- **`src/components/ReservaChat.test.tsx`** (20 tests) — buena disciplina de
  scoping (`within(widget)` para no acoplarse a la columna de texto
  permanente), buen uso de helpers (`responderServicioYAnimal`,
  `responderTresPrimerosPasos`, `completarGuion`) sin sobre-abstracción.
  Único defecto real: el bucle vacío de @s16 (Hallazgo 2).
- **`src/components/ReservaChat-logica.test.ts`** (5 tests) — literales a
  mano, sin reimportar símbolos de producción para comparar contra sí
  mismos. Bien.

## 6. Fidelidad a los datos verificados

Contrastados a mano contra `docs/datos-galapavet.md` y `src/lib/site.ts` /
`src/data/servicios.ts` (fuentes únicas, ya `done` en features previas):
teléfonos (91 082 92 67 / 685 34 31 49 / 91 851 13 93 y sus `tel:+34...`
derivados), horario (L-V 11:00-14:00 y 16:30-20:00 · Sábados 11:00-14:00 ·
Domingos cerrado) y los 5 títulos de servicio. Todos coinciden exactamente.
Nada inventado, ninguna promesa de plazo/WhatsApp/24h colada.

## 7. CHECKPOINTS.md

- **C1** — ✅ ficheros base presentes; `bin/harness init` (vía
  `node .harness/harness.mjs init`) exit 0.
- **C2** — ✅ una sola feature `in_progress` (`reserva_chat`, id 7);
  `progress/current.md` describe la sesión activa, sin basura de sesiones
  previas.
- **C3** — ✅ `ReservaChat.tsx`/`ReservaChat-logica.ts` siguen el mismo
  patrón arquitectónico que `Hero`/`Equipo`/`Servicios` (ya aprobados); sin
  dependencias nuevas; sin logs de debug ni TODOs sueltos.
- **C4** — ✅ hay test por módulo (`ReservaChat.test.tsx` +
  `ReservaChat-logica.test.ts`); `pnpm run test` da 162 > 0, todos verdes.
- **C5** — N/D a mitad de sesión (no es cierre de sesión); no hay ficheros
  sin trackear sospechosos fuera de los propios de la feature.
- **C6** — ❌ **NO cumple del todo**: "No hay código de producción que
  ningún test rojo haya pedido" falla por el Hallazgo 1
  (`reiniciar()` línea de `respuestas`). El resto de C6 (mapa `@s → test`
  completo, `.feature` con `@s1..@s23` medibles, sección en
  `project-spec.md` bajo "Landing (una sección, una feature)") sí se
  cumple.
- **C7** — pendiente de `mutation_tester`, no evaluado por mí; nota para esa
  puerta: `ReservaChat.tsx` queda fuera del glob por defecto de
  `stryker.config.json` (igual que `Hero.tsx`/`Servicios.tsx`/`Equipo.tsx`
  en features previas) — si se quiere medir su superficie real hay que
  invocar `--mutate src/components/ReservaChat.tsx` explícitamente, como ya
  hizo el `mutation_tester` de `hero`.

---

## Qué tiene que corregir la próxima ronda

1. **`reiniciar()` — el reseteo de `respuestas`.** Añadir un ciclo TDD real:
   un test que complete el guion una vez, pulse "Pedir otra cita", complete
   el guion una segunda vez con respuestas **distintas**, y compruebe que el
   resumen final de la segunda vuelta no contiene ningún dato de la primera
   (por ejemplo, servicio "Medicina general" seguido de servicio "Análisis"
   y comprobar que el resumen final dice "Análisis", no una mezcla). Ese
   test debe fallar en rojo si se quita la línea de `reiniciar()`
   (confirmado por mí que hoy no falla) y pasar en verde con ella. Aplica
   igual a la variante que reinicia desde `'urgencia'` ("Empezar de nuevo")
   si el guion completo antes de derivar a urgencias pudiera dejar
   `respuestas` a medio rellenar (revisar si aplica; si no aplica porque
   `'servicio'` es lo único respondido antes de la bifurcación, documentarlo
   explícitamente en vez de dejarlo sin decir).
2. **@s16 — el guarda de ausencia del enlace de urgencias.** Sustituir el
   `for (const enlace of within(widget).queryAllByRole('link')) {
   expect(...).not.toBe(...) }` por una aserción que sí pueda fallar, en la
   línea de lo que ya hace correctamente @s13:
   `expect(within(widget).queryAllByRole('link')).toHaveLength(0)` (el
   `paso === 'servicio'` no renderiza ningún enlace, así que exigir longitud
   0 es la forma correcta y verificable de expresar "ya no queda el enlace
   de urgencias" para este estado). Si se prefiere conservar la comprobación
   más literal del `.feature` ("cuyo destino sea tel:+34918511393") por
   claridad de intención, combinarla con la aserción de longitud, no
   sustituirla por un bucle que puede quedar vacío.

Tras corregir ambos puntos: releer `progress/tdd_reserva_chat.md`
actualizado, confirmar `bin/harness init` en verde con el nuevo conteo de
tests, y volver a pedir revisión de `judge`.
