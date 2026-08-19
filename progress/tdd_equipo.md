# TDD — `equipo` (id 6)

> Bitácora de `tdd_craftsman`. Feature `features/equipo.feature`, 11
> escenarios (@s1-@s11), aprobados por la puerta humana junto con las otras
> 18 features del contrato reparado (ver `progress/current.md`).

## Confirmación previa al primer test rojo

`node .harness/harness.mjs init` en verde antes de tocar nada: 121/121 tests,
lint y typecheck limpios. Sin problemas de configuración fuera de `src/` que
reportar en esta sesión.

## Entregables

- `src/data/equipo.ts` — listado estático de los 2 profesionales reales
  (`Profesional { nombre, rol, formacion? }`), fuente
  `docs/datos-galapavet.md` §4. `formacion` es `undefined` para Joaquín
  Herranz (no publicada): no se rellena con un valor plausible.
- `src/components/Equipo-logica.ts` — lógica pura mordible por mutación
  (`rotuloBoton`, `tieneFormacion`, `profesionalesValidos`).
- `src/components/Equipo-logica.test.ts` — tests directos de apoyo sobre esa
  lógica.
- `src/components/Equipo.tsx` — el componente, solo cablea.
- `src/components/Equipo.test.tsx` — un `describe` por `@s`, 11/11 escenarios
  con test concreto.

`pnpm run test`: 137/137 (121 previos + 16 nuevos: 12 de `Equipo.test.tsx` +
4 de `Equipo-logica.test.ts`). `node .harness/harness.mjs init` verde.

## Nota de disciplina: escenarios de guarda (@s2, @s5, @s7, @s11)

Cuatro escenarios son cláusulas negativas o quedan implicados por la
implementación mínima de un ciclo anterior — al escribir su test, pasaba en
verde a la primera sin ningún cambio de producción (`docs/tdd.md`: "un test
que pasa a la primera no demuestra nada: ajústalo o sospecha del montaje").
En los cuatro casos se verificó el ROJO genuino por sabotaje manual antes de
aceptar el ciclo como válido: se introdujo a mano el defecto exacto que el
escenario prohíbe, se confirmó que el test (y solo ese test, o los
esperables) se ponía en rojo, y se revirtió el sabotaje sin tocar nada más.
Detalle en cada ciclo de la trazabilidad de abajo.

## Trazabilidad — ciclo a ciclo

### @s1 — Se muestran exactamente los dos profesionales publicados, con su nombre y su rol
- **Rojo:** `Equipo.test.tsx` importa `./Equipo`, que no existe → fallo de
  import (Ley 2: no compilar cuenta como fallar).
- **Verde:** `src/data/equipo.ts` (listado de 2) + `src/components/Equipo.tsx`
  mínimo: `<section aria-label="Equipo"><h2>Equipo</h2>` + un `<article>` con
  `<h3>{nombre}</h3><p>{rol}</p>` por profesional.
- **Refactor:** ninguno necesario, código ya mínimo.
- Test: `@s1 se muestran exactamente los dos profesionales publicados...`

### @s2 — Ningún dato de colegiación ni de idiomas aparece en la sección
- **Rojo (genuino, por sabotaje):** el test pasó a la primera. Se sabotéo
  `src/data/equipo.ts` (`rol: 'Veterinario Colegiada nº 28-7412 Idiomas'`),
  se confirmó el fallo exacto (`not.toContain('Colegiad')` roto), se revirtió.
- **Verde:** sin cambio de producción — el dato real nunca contuvo esas
  cadenas.
- Test: `@s2 ningún dato de colegiación ni de idiomas aparece en la sección`

### @s3 — La tarjeta de un profesional con formación publicada arranca colapsada
- **Rojo:** `getByRole('button', { name: 'Ver la formación de Marcos Pérez' })`
  no encuentra nada — no hay botón todavía.
- **Verde:** `src/components/Equipo-logica.ts` (`rotuloBoton`,
  `tieneFormacion`, con sus propios tests directos de apoyo en
  `Equipo-logica.test.ts`, RED→GREEN independientes: `rotuloBoton` ya
  existía por necesidad del propio ciclo, `tieneFormacion` se rojeó primero
  con `TypeError: tieneFormacion is not a function`). `TarjetaProfesional`
  gana `useState` y renderiza el botón solo si `conFormacion`.
- Test: `@s3 la tarjeta de un profesional con formación publicada arranca colapsada`

### @s4 — Desplegar la tarjeta muestra exactamente la formación publicada
- **Rojo:** tras el clic, `getByText(formación)` no se encuentra —
  `aria-expanded` sí cambiaba (por @s3) pero el texto no se pintaba.
- **Verde:** `{conFormacion && abierto && <p>{profesional.formacion}</p>}`.
- Test: `@s4 desplegar la tarjeta muestra exactamente la formación publicada`

### @s5 — El nombre accesible del botón cambia al desplegar
- **Rojo (genuino, por sabotaje):** pasó a la primera (ya implicado por
  `rotuloBoton` de @s3/@s4). Sabotaje: `rotuloBoton` ignora `abierto` y
  siempre devuelve "Ver…" → tanto @s4 como @s5 se pusieron en rojo
  (`Ocultar…` no aparece). Revertido.
- **Verde:** sin cambio de producción adicional.
- Test: `@s5 el nombre accesible del botón cambia al desplegar`

### @s6 — Volver a pulsar colapsa la tarjeta y restituye el nombre accesible
- **Rojo (genuino, por sabotaje):** pasó a la primera. Sabotaje:
  `onClick={() => setAbierto(true)}` (nunca vuelve a `false`) → solo @s6 se
  puso en rojo (los demás, con un único clic, seguían en verde). Revertido a
  `setAbierto((valorPrevio) => !valorPrevio)`.
- **Verde:** sin cambio de producción adicional.
- Test: `@s6 volver a pulsar colapsa la tarjeta y restituye el nombre accesible`

### @s7 — Un profesional sin formación publicada no ofrece botón de desplegar
- **Rojo (genuino, por sabotaje):** pasó a la primera (ya implicado por
  `tieneFormacion` de @s3, y Joaquín Herranz ya no tiene `formacion` en el
  dato real). Sabotaje: `tieneFormacion` siempre `true` → tanto el test
  directo de `tieneFormacion(undefined)` como este escenario se pusieron en
  rojo (2 botones en vez de 1). Revertido.
- **Verde:** sin cambio de producción adicional.
- Test: `@s7 un profesional sin formación publicada no ofrece botón de desplegar`

### @s8 — Cada tarjeta con formación se despliega de forma independiente de las demás
- **Rojo:** el componente aún no acepta `listado`; con la prop ignorada se
  renderiza el catálogo real (Marcos/Joaquín) y `getByRole('button', {name:
  'Ver la formación de Bea Dos'})` no existe.
- **Verde:** `EquipoProps.listado?: readonly Profesional[]`, con
  `EQUIPO` como valor por defecto.
- Test: `@s8 cada tarjeta con formación se despliega de forma independiente de las demás`

### @s9 — Un profesional sin nombre no se renderiza y no arrastra al resto
- **Rojo:** con un tercer profesional de nombre `''`, aparecían 3 `<h3>`
  (incluido uno vacío) en vez de 2.
- **Verde:** `profesionalesValidos` (`Equipo-logica.ts`, con test directo de
  apoyo RED→GREEN: `TypeError: profesionalesValidos is not a function` →
  implementado) filtra `nombre.length > 0`; `Equipo` lo aplica antes de
  mapear.
- Test: `@s9 un profesional sin nombre no se renderiza y no arrastra al resto`

### @s10 — Con el listado de profesionales vacío la sección no se renderiza
- **Rojo:** con `listado={[]}`, el `<h2>Equipo</h2>` seguía apareciendo
  (`profesionalesValidos([])` da `[]`, pero la sección se pintaba igual).
- **Verde:** `if (validos.length === 0) return null` (mismo patrón que
  `Servicios`).
- Test: `@s10 con el listado de profesionales vacío la sección no se renderiza`

### @s11 — Sin retratos verificados ninguna tarjeta muestra una fotografía del profesional
- **Rojo (genuino, por sabotaje):** pasó a la primera (nunca se implementó
  imagen). Sabotaje: se añadió `<img src="/retrato.jpg" alt={nombre} />` a
  `TarjetaProfesional` → el test se puso en rojo (2 imágenes encontradas).
  Revertido.
- **Verde:** sin cambio de producción — la decisión "sin retratos" ya
  documentada en la cabecera del `.feature` (PENDIENTE) se mantiene.
- Test: `@s11 sin retratos verificados ninguna tarjeta muestra una fotografía del profesional`

## Refactor final (housekeeping, sin cambio de comportamiento)

`Equipo.test.tsx` importaba `React` sin usarlo (JSX automático de
`tsconfig.app.json`, `"jsx": "react-jsx"`), lo que `tsc` marcaba como
`TS6133` (`noUnusedLocals`) al quitarlo, y que `oxlint` (`react-in-jsx-scope`,
que no reconoce el runtime automático) exigía de vuelta al quitarlo del
todo. Se resolvió con el mismo patrón que ya usa `Servicios.test.tsx`:
un helper `renderizarEquipo(props: React.ComponentProps<typeof Equipo> = {})`
que referencia `React` a nivel de tipo (satisface `tsc`) y mantiene el
import (satisface `oxlint`), y sustituye las 11 llamadas sueltas a
`render(<Equipo .../>)`. `node .harness/harness.mjs init` verde tras el
cambio: 137/137 tests, lint y typecheck limpios.

## Resumen final (ronda 1)

`pnpm run test`: **137/137** verde (121 previos + 16 de esta feature).
`node .harness/harness.mjs init`: verde. Los 11 escenarios de
`features/equipo.feature` tienen test concreto. No se marca `done` en
`feature_list.json` — falta `judge` y `mutation_tester` (umbral 1.0).

## Ronda 2 — corrección de `progress/judge_equipo.md` (CHANGES_REQUESTED)

`progress/mutation_equipo.md` no existía todavía (el `judge` de la ronda 1
cortó antes de llegar a mutación), así que esta ronda solo corrige el único
cambio requerido del veredicto `CHANGES_REQUESTED`.

### Cambio requerido único: `Equipo.test.tsx:130` — aserción de subcadena en vez de igualdad exacta (@s7)

El `judge` señaló que `expect(tarjetaJoaquin).toHaveTextContent('Joaquín HerranzAuxiliar')`
usa coincidencia de subcadena (`toHaveTextContent` con un `string`), por lo
que no impone la cláusula "se limita a" del tercer `Then` de `@s7`: pasaría
igual si la tarjeta tuviera contenido adicional.

- **Fix (solo test, sin tocar producción):** sustituido por
  `expect(tarjetaJoaquin?.textContent).toBe('Joaquín HerranzAuxiliar')` —
  igualdad exacta sobre el `textContent` completo de la tarjeta.
- **Verde inmediato:** con la producción actual (`Equipo.tsx` no renderiza
  nada más para un profesional sin formación), el fix pasa sin más cambios:
  `pnpm exec vitest run src/components/Equipo.test.tsx` → 11/11.
- **Verificación de que el hueco queda cerrado (sabotaje manual, tal y como
  pidió el `judge`):** se añadió temporalmente `<p>SABOTAJE_TEMPORAL</p>`
  dentro de `TarjetaProfesional` (`Equipo.tsx`), entre el `<p>{rol}</p>` y el
  bloque del botón. Resultado: **exactamente 1 test** se puso en rojo — el de
  `@s7` (`AssertionError: expected 'Joaquín HerranzAuxiliarSABOTAJE_TEMPO…' to
  be 'Joaquín HerranzAuxiliar'`), los otros 10 siguieron en verde. Confirma
  que la nueva aserción exacta sí detecta contenido extra en la tarjeta de un
  profesional sin formación, cerrando el hueco que señaló el `judge`.
  Sabotaje revertido íntegramente después (solo esa línea añadida y quitada;
  nada más tocado en `Equipo.tsx`).

### Resumen final (ronda 2)

`pnpm run test`: **137/137** verde (sin cambio de cantidad: el fix es una
sola línea de aserción, no un escenario nuevo). `node .harness/harness.mjs
init`: verde (lint, typecheck y 137/137 tests). Único cambio de
`progress/judge_equipo.md` aplicado y verificado por sabotaje. No se toca
nada fuera de `Equipo.test.tsx:130`. Pendiente: nueva pasada de `judge` y de
`mutation_tester` (umbral 1.0) antes de marcar `done` en `feature_list.json`.
