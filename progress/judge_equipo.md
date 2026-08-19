# Review — feature 6 (`equipo`) — ronda 2

**Veredicto:** APPROVED

## Contexto de esta ronda

`progress/judge_equipo.md` (ronda 1) pidió un único cambio: `Equipo.test.tsx:130`
usaba `toHaveTextContent('Joaquín HerranzAuxiliar')` — coincidencia de
subcadena — para el tercer `Then` de `@s7` ("se limita a"), que exige
igualdad total. `progress/tdd_equipo.md` §"Ronda 2" documenta el fix y su
verificación por sabotaje. Esta ronda revisa el fix y **repite el resto del
protocolo completo desde cero** (no solo el punto corregido): releída
`features/equipo.feature`, releídos los 5 archivos de la feature contra el
código real, vuelto a correr `bin/harness init`.

## Cobertura de escenarios (@s ↔ test)

Contrastado escenario a escenario contra `features/equipo.feature` y el
código real.

- @s1: [x] `Equipo.test.tsx:34-51` — h2 "Equipo", región "Equipo", exactamente
  2 `<h3>` (igualdad de array completo, no substring), texto de cada tarjeta.
- @s2: [x] `Equipo.test.tsx:53-63` — `not.toContain('Colegiad' | 'Idiomas' |
  'nº')` sobre `seccion.textContent`.
- @s3: [x] `Equipo.test.tsx:65-75` — botón "Ver…" con `aria-expanded="false"`,
  formación ausente (`queryByText(...).not.toBeInTheDocument()`).
- @s4: [x] `Equipo.test.tsx:77-90` — tras click, formación visible y
  `aria-expanded="true"`.
- @s5: [x] `Equipo.test.tsx:92-102` — existe "Ocultar…", no existe "Ver…".
- @s6: [x] `Equipo.test.tsx:104-118` — segundo click restituye
  `aria-expanded="false"`, formación ausente, "Ver…" vuelve.
- @s7: **[x] CERRADO.** `Equipo.test.tsx:120-132`. Los dos primeros `Then`
  (exactamente 1 botón, con el nombre accesible de Marcos) siguen probados
  como en ronda 1. El tercer `Then` ahora es
  `expect(tarjetaJoaquin?.textContent).toBe('Joaquín HerranzAuxiliar')`
  (línea 130) — igualdad exacta sobre el `textContent` completo del
  `<article>`, no `toHaveTextContent` con subcadena. Impone de verdad la
  cláusula "se limita a". Verificado mi propio experimento independiente (ver
  "Disciplina TDD" abajo): esta aserción **sí** falla si la tarjeta tuviera
  cualquier contenido adicional.
- @s8: [x] `Equipo.test.tsx:134-154` — independencia entre "Bea Dos", "Ana
  Uno" y "Ciro Tres" sobre listado de prueba con literales propios (no
  reimporta `EQUIPO`).
- @s9: [x] `Equipo.test.tsx:156-169` — nombre vacío descartado, exactamente 2
  `<h3>` (igualdad de array) y exactamente 2 `<article>`.
- @s10: [x] `Equipo.test.tsx:171-178` — listado vacío ⇒ ni h2 ni región
  (`queryByRole(...).not.toBeInTheDocument()` × 2).
- @s11: [x] `Equipo.test.tsx:180-186` — 0 elementos con rol `img`
  (`queryAllByRole('img')).toHaveLength(0)`).

**11/11 con cobertura completa y correcta.** El hueco de ronda 1 (@s7) queda
cerrado sin dejar ningún otro escenario debilitado.

## Disciplina TDD

- ¿Producción sin test que la pida? **NO.** Comparación byte a byte con la
  ronda 1: `src/data/equipo.ts` (24 líneas), `src/components/Equipo-logica.ts`
  (25 líneas) y `src/components/Equipo.tsx` (47 líneas) son **idénticos** a
  los ya aprobados en ronda 1 — el fix de esta ronda es exclusivamente en el
  test, tal y como exigió el cambio requerido ("No hace falta tocar
  producción"). Ningún archivo de producción creció.
- ¿Evidencia de Rojo→Verde→Refactor para el cambio de esta ronda?
  **SÍ.** `progress/tdd_equipo.md` líneas 162-184: fix aplicado
  (verde inmediato porque la producción ya cumplía la cláusula), y
  **verificación del hueco cerrado por sabotaje manual** — se insertó
  `<p>SABOTAJE_TEMPORAL</p>` dentro de `TarjetaProfesional` entre `<p>{rol}</p>`
  y el bloque del botón, se confirmó que **exactamente 1 test** (el de @s7) se
  puso en rojo con el mensaje esperado (`'Joaquín HerranzAuxiliarSABOTAJE_TEMPO…'
  to be 'Joaquín HerranzAuxiliar'`), los otros 10 de `Equipo.test.tsx` siguieron
  en verde, y el sabotaje se revirtió íntegramente. Esto es precisamente la
  prueba que pedí en el cambio requerido de ronda 1 ("confirma que las 11
  aserciones de @s7 fallarían de verdad si `TarjetaProfesional` filtrara
  contenido extra").
- **Patrón doble-de-test-anclado-al-literal-no-al-simbolo:** verificado
  ausente. `Equipo.test.tsx:5` importa `Profesional` **solo como tipo**
  (`import type`); `Equipo-logica.test.ts` no importa nada de
  `src/data/equipo.ts`. `EQUIPO` (el array de producción) no se reimporta en
  ningún test como valor — todos los literales ("Marcos Pérez", "Joaquín
  Herranz", "Veterinario", "Auxiliar", "Licenciado en veterinaria por la
  Universidad Complutense de Madrid", y el `'Joaquín HerranzAuxiliar'` nuevo
  de la línea 130) están escritos a mano. Un cambio accidental en el dato de
  producción (p. ej. cambiar `rol: 'Auxiliar'` a otra cosa) rompería el test,
  como debe ser — confirmado por inspección directa, no solo por la bitácora.
- **Patrón verde-por-vacuidad-en-puerta-de-verificación:** ausente. Repasadas
  las 8 aserciones de ausencia/guardia del archivo (@s2 ×3, @s3, @s5 ×2, @s6
  ×2, @s7 —ahora exacta—, @s10 ×2, @s11): ninguna es estructuralmente
  incapaz de fallar. Las 4 que pasaron a la primera sin cambio de producción
  (@s2, @s5, @s7, @s11) tienen sabotaje manual documentado con el mensaje de
  fallo exacto y el recuento de tests afectados, no solo la afirmación de que
  se hizo. El hueco real de ronda 1 (una guarda **más débil que su
  enunciado**, no vacía en sentido estricto) queda cerrado con la misma
  disciplina de sabotaje que exige el patrón para las guardas genuinamente
  vacías.

## Calidad

- `src/data/equipo.ts:1-24` — sin cambios desde ronda 1. Correcto: fuente
  citada, `formacion` opcional sin relleno plausible, `readonly` + `as const
  satisfies`.
- `src/components/Equipo-logica.ts:1-25` — sin cambios desde ronda 1. Tres
  funciones puras, un motivo cada una, JSDoc con su(s) `@s`.
- `src/components/Equipo.tsx:1-47` — sin cambios desde ronda 1. Cablea
  `useState` + los tres helpers; `aria-expanded` como atributo ARIA, no
  clase CSS; guarda de lista vacía consistente con `Servicios.tsx`.
- `src/components/Equipo.test.tsx:1-186` — único archivo tocado esta ronda.
  El cambio es quirúrgico y exacto a lo pedido: **1 línea** (130), sin tocar
  las otras 10 aserciones que ya eran correctas en ronda 1. Nombres
  descriptivos, `renderizarEquipo`/`obtenerSeccionEquipo`/
  `LISTADO_TRES_CON_FORMACION` evitan duplicación entre los 11 `describe`.
  Sin hallazgos nuevos.
- `src/components/Equipo-logica.test.ts:1-37` — sin cambios desde ronda 1.
  Sin hallazgos.
- Consistencia con `docs/architecture.md` y el precedente del proyecto
  (`Servicios`, `Cabecera`, `Hero`): capas `data` → `lógica pura` →
  `.tsx` de cableado respetadas, sin dependencias nuevas.
- `grep` de `console.*`/`TODO`/`debugger`/`FIXME` sobre `Equipo.tsx` y
  `equipo.ts`: limpio.

## Checkpoints (`CHECKPOINTS.md`)

- **C1** — [x] Ficheros base y docs existen. `node .harness/harness.mjs init`
  → "Entorno listo. Puedes empezar a trabajar." (exit 0, verificado en esta
  revisión).
- **C2** — [x] Única feature `in_progress` es `equipo` (id 6) en
  `feature_list.json`. `progress/current.md` describe la sesión activa sin
  basura de sesiones previas. Features 1-5 `done` siguen con tests que pasan
  (incluidos en el 137/137).
- **C3** — [x] `src/` solo contiene `components/`, `data/`, `lib/`, `test/`.
  Sin dependencias externas nuevas. Sin logs de debug ni TODOs sueltos en los
  archivos de esta feature.
- **C4** — [x] `equipo.ts` cubierto indirectamente por `Equipo.test.tsx`;
  `Equipo-logica.ts` tiene test directo propio. `bin/harness test` (vía
  `init`): **137/137** verdes.
- **C5** — [ ] No aplica todavía a mitad de sesión (mismo criterio que ronda
  1 y que el resto de features de este proyecto: se cierra al finalizar la
  sesión, no bloqueante ahora).
- **C6** — [x] `features/equipo.feature` con @s1-@s11 y sección en
  `project-spec.md` (Decisión 4). Cada `Then` medible. Mapa `@s → test`
  completo en `progress/tdd_equipo.md`. Sin producción sin test que la pida.
  El matiz de ronda 1 (@s7 con test que no imponía completamente su tercer
  `Then`) queda **resuelto**: ya no hay salvedad.
- **C7** — [ ] Pendiente — corresponde a `mutation_tester` (umbral 1.0), no a
  esta puerta.

## Cambios requeridos

Ninguno. El único hallazgo de ronda 1 queda cerrado, verificado por sabotaje,
sin efectos colaterales en el resto de la cobertura ni en producción.
Siguiente paso: `mutation_tester` sobre `src/components/Equipo-logica.ts`
(único fichero mordible bajo `stryker.config.json`, mismo criterio que
`Servicios-logica.ts`/`Cabecera-logica.ts`).
