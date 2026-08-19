# TDD — hero (id 4)

> Bitácora en vivo, un ciclo Rojo→Verde→Refactor a la vez. `tdd_craftsman`.

## Pre-condiciones verificadas

- `feature_list.json`: id 4 `hero`, status `in_progress`. ✔
- `features/hero.feature` existe, aprobado por el humano (puerta humana
  superada para las 19 features, ver `progress/current.md`). ✔
- `node .harness/harness.mjs init`: **verde** antes del primer test rojo
  (84/84 tests, lint+typecheck sin avisos). Ningún problema de configuración
  nuevo detectado en este arranque (a diferencia de sesiones anteriores, no
  hizo falta tocar nada fuera de `src/`).

## Decisiones de diseño tomadas antes del primer test (justificadas contra el contrato)

1. **`telefono` y `horario` son props explícitas de `Hero`, con valor por
   defecto la fuente única real (`datosNegocio.telefonoClinica.textoVisible`
   / `datosNegocio.horario`).** Mismo patrón que `enlaces` en `Cabecera`
   (`progress/tdd_cabecera_y_navegacion.md`, decisión 3): permite inyectar
   variaciones de "la fuente única no declara X" (@s9, @s10, @s11) sin tocar
   `src/lib/site.ts` ni mockear el módulo, y toda llamada `renderizarHero()`
   sin overrides (la mayoría de los ciclos) ejercita la ruta de producción
   real, no un doble.
2. **El sentinela de ausencia es `null`, no `undefined`.** Un parámetro por
   defecto de JS se dispara con `undefined` tanto si la prop se omite como si
   se pasa explícitamente `undefined` — probado en el propio ciclo 9 (ver
   más abajo): `renderizarHero({ telefono: undefined })` seguía mostrando el
   teléfono real, porque el valor por defecto se sustituye igual. `null` sí
   es distinguible (los parámetros por defecto de JS no lo tratan como
   ausente), así que `telefono?: string | null` / `horario?: readonly
   FranjaHorario[] | null` usan `null` para "la fuente única no lo declara".
   Documentado en el JSDoc de `HeroProps` para que no se repita el error.
3. **`enlaceLlamada` (de `src/lib/telefono.ts`, ya al 100% de mutación por la
   feature `datos_negocio`) se reutiliza tal cual para @s11 ("falla
   cerrado").** No se crea una función `*-logica.ts` propia de `Hero` para
   normalizar teléfono: sería duplicar lógica ya mordida por mutación en
   otra feature, violando la fuente única (invariante 2 de
   `project-spec.md`). `Hero.tsx` solo cablea: llama a `enlaceLlamada`
   dentro de la rama `telefono !== null`, sin `try/catch` — si lanza, el
   render entero lanza (comportamiento exigido literalmente por @s11).
4. **Sin `Hero.module.scss` en este ciclo.** Ningún escenario Vitest del
   `.feature` ejercita estilo o clases CSS (`vite.config.ts` tiene
   `test.css: false`, y el propio proyecto prohíbe aseverar sobre clases).
   Mismo criterio ya aplicado a `Cabecera` (`progress/tdd_cabecera_y_navegacion.md`,
   decisión 6): añadir un módulo SCSS sin ningún test que lo pida sería
   producción sin test rojo (Ley 1). Pendiente para un futuro pase de diseño
   visual.
5. **@s14 (fondo CSS de terceros) queda fuera de este ciclo TDD.** Ver
   sección "Pendiente explícito" — el propio escenario, tal como quedó
   redactado tras la reparación del contrato, declara explícitamente que se
   verifica en navegador real, fuera del gate de Vitest/Stryker (Decisión 11
   de `project-spec.md`). No hay `@s12`: fue retirado en la reparación del
   18/08/2026 (ver cabecera del `.feature`).
6. **Sin franja horaria: se omite el `<dl>` entero (no un `<dl>` vacío).**
   Mismo criterio que `Cabecera` con `nav`/botón cuando `enlaces` está vacío:
   guardar con `horario !== null &&` en vez de renderizar contenedor vacío,
   para que "0 entradas" sea observable simplemente como "no hay ningún
   elemento con rol `term`".

## Pendiente explícito (no bloqueante, documentado)

- **@s14 no tiene test de Vitest.** Es, por diseño del propio contrato
  (Decisión 11, `project-spec.md`), una cláusula verificada en navegador
  real fuera del gate de Vitest/Stryker. Además, hoy es **doblemente
  imposible de verificar en la práctica**: no existe todavía ningún
  `App.tsx`/`main.tsx` que ensamble `Hero` en una página real navegable (el
  mismo pendiente que dejó `cabecera_y_navegacion`, ver
  `progress/tdd_cabecera_y_navegacion.md` → "Pendiente explícito"), así que
  no hay página que cargar en Claude in Chrome / `browser-automation` para
  inspeccionar `background-image` calculado. Mientras tanto, `Hero` no
  renderiza ningún `<img>` ni referencia ninguna imagen de fondo (la imagen
  del hero sigue como PENDIENTE del cliente, según la cabecera del propio
  `.feature`), así que @s13 sí queda cubierto por Vitest sin ambigüedad.
- **Estilo visual (`Hero.module.scss`)** fuera de alcance, igual que en
  `cabecera_y_navegacion`, hasta un futuro pase de diseño.
- **`App`/`main.tsx`** que ensamble `Hero` (y `Cabecera`) en una página real
  siguen sin existir; no es objeto de esta feature de sección aislada.

## Ciclos

### Ciclo 1 — @s1 (ubicación real y titular principal)
- ROJO: `src/components/Hero.test.tsx` importa `Hero` de un módulo
  inexistente → falla al resolver el import (Ley 2).
- VERDE: creado `src/components/Hero.tsx` con `<section><p>Galapagar ·
  Madrid</p><h1>Cuidamos la salud y la felicidad de tu mascota</h1></section>`.
- REFACTOR: ninguno (trivial).

### Ciclo 2 — @s2 (el texto descriptivo solo nombra servicios reales)
- ROJO: test comprueba que el `container` contiene los 5 nombres de
  servicio reales (`docs/datos-galapavet.md` §5) y no contiene "urgencias"
  ni "24 h"; falla porque `Hero` aún no tiene párrafo descriptivo.
- VERDE: añadido `TEXTO_DESCRIPTIVO`, una frase editorial propia de esta
  sección (no es un dato de negocio repetido, así que no vive en
  `src/lib/site.ts`) que contiene literalmente las 5 frases exigidas y
  evita "urgencias"/"24 h".
- REFACTOR: ninguno.

### Ciclo 3 — @s3 (botón principal → #reservar)
- ROJO: `getByRole('link', {name: 'Reservar cita'})` no existía.
- VERDE: añadido `<a href="#reservar">Reservar cita</a>`.
- REFACTOR: ninguno.

### Ciclo 4 — @s4 (botón secundario → tel: real)
- ROJO: `getByRole('link', {name: 'Llamar 91 082 92 67'})` no existía.
- VERDE: `Hero` gana la prop `telefono` (por defecto
  `datosNegocio.telefonoClinica.textoVisible`) y un segundo enlace `<a
  href={enlaceLlamada(telefono)}>{'Llamar ' + telefono}</a>`, importando
  `enlaceLlamada` de `../lib/telefono` (ya existente, feature
  `datos_negocio`).
- REFACTOR: ninguno.

### Ciclo 5 — @s5 (dígitos del nombre y del destino no divergen)
- Escrito el test (extrae dígitos del `textContent` y del `href`, compara
  ambos contra `'910829267'`) y **pasó a la primera**: consecuencia directa
  de que el ciclo 4 ya deriva ambos del mismo `telefono` recibido, sin
  reescribirlo. Siguiendo `docs/tdd.md` ("un test que pasa a la primera no
  demuestra nada"), lo verifiqué de verdad: mutado a mano el texto del
  enlace a un literal `'Llamar 685 34 31 49'` (dígitos distintos de los del
  `href`, que seguía derivando del `telefono` real), confirmado que **este**
  test y @s4 se ponen rojos, revertido. Ningún cambio de producción en este
  ciclo (Ley 3).

### Ciclo 6 — @s6 (franja inferior con el horario real)
- ROJO: `getAllByRole('term')` (rol implícito de `<dt>` dentro de `<dl>`)
  devolvía 0 elementos.
- VERDE: `Hero` gana la prop `horario` (por defecto `datosNegocio.horario`)
  y un `<dl>` que mapea cada tramo a `<div><dt>{dias}</dt><dd>{horas}</dd></div>`.
- REFACTOR: ninguno.

### Ciclo 7 — @s7 (sin cifras de reputación/antigüedad/volumen)
- Test de guarda (ausencia de "12 años", "8.400", "327", "4,9", "4,6",
  "reseñas", "★"): pasó a la primera porque `Hero` nunca ha renderizado ese
  contenido — mismo patrón ya aceptado en el proyecto para guardas de
  ausencia (`src/components/Cabecera.test.tsx` @s13,
  `src/lib/site.test.tsx` @s3/@s14/@s16). No se fuerza un rojo artificial.

### Ciclo 8 — @s8 (la sección no anuncia urgencias)
- Test de guarda (sin "24 h", sin "Urgencias", ningún enlace a
  `tel:+34918511393`): pasó a la primera por el mismo motivo que el ciclo 7
  — el único enlace `tel:` que `Hero` renderiza es el de `telefonoClinica`,
  nunca el de `telefonoUrgencias`.

### Ciclo 9 — @s9 (sin teléfono en la fuente única no hay botón de llamada)
- Primer intento: `renderizarHero({ telefono: undefined })` — **no se puso
  rojo**, seguía mostrando "tel:+34910829267". Investigado: un parámetro por
  defecto de JS (`telefono = datosNegocio.telefonoClinica.textoVisible`) se
  dispara también cuando el valor recibido es `undefined` explícito, no solo
  cuando se omite la prop, así que no hay forma de distinguir "usa el
  default" de "no hay teléfono" con ese tipo. Cambiado el test a
  `renderizarHero({ telefono: null })` (decisión de diseño 2, más arriba) →
  **ahora sí ROJO real**: `TypeError` al intentar `enlaceLlamada(null)`
  (`.replace` sobre lo que sea que reciba, tipo aparte porque TS aún no
  reflejaba el cambio de tipo de la prop).
- VERDE: `HeroProps.telefono` pasa a `string | null`; el segundo enlace se
  guarda con `{telefono !== null && <a ...>}`.

### Ciclo 10 — @s10 (sin horario en la fuente única no hay franja)
- ROJO: `renderizarHero({ horario: null })` → `TypeError: Cannot read
  properties of null (reading 'map')` (mismo tipo de fallo que el ciclo 9,
  esta vez genuino desde el primer intento porque ya conocía el patrón
  `null`).
- VERDE: `HeroProps.horario` pasa a `readonly FranjaHorario[] | null`; el
  `<dl>` se guarda con `{horario !== null && (...)}`.

### Ciclo 11 — @s11 (teléfono que no normaliza falla cerrado)
- Test: `expect(() => renderizarHero({ telefono: '91 082 92' }))
  .toThrow('91 082 92')` + comprobación de que no queda ningún `a[href^="tel:"]`
  en el documento. **Pasó a la primera**: consecuencia directa de que el
  ciclo 4 ya llama a `enlaceLlamada(telefono)` sin `try/catch` dentro de la
  rama `telefono !== null`, y `enlaceLlamada`/`normalizarTelefono` (feature
  `datos_negocio`, ya al 100% de mutación) ya fallan cerrado para un valor
  de 7 dígitos como `'91 082 92'`. Verificado que no es vacuo: mutado a mano
  el `href` del enlace de llamada a un literal fijo `'tel:+34000000000'`
  (bypaseando la llamada real a `enlaceLlamada`), confirmado que **este**
  test y @s4/@s5 se ponen rojos, revertido. Ningún cambio de producción en
  este ciclo.
- Verificado también, antes de aceptar el test como válido, que React 19 +
  jsdom 30 en este entorno **no** enruta el error de render no capturado a
  través de `console.error` (la guarda global de `src/test/setup.ts` que
  convierte cualquier `console.error`/`console.warn` en rojo no se disparó
  para este test): la suite completa quedó en verde sin necesidad de espiar
  ni silenciar la consola dentro del test.

### Ciclo 12 — @s13 (sin recursos de terceros por atributos DOM)
- Test de guarda: ningún elemento con `src`/`srcset` que empiece por
  "http", y todo `href` de enlace empieza por "#" o "tel:". Pasó a la
  primera — `Hero` no tiene ningún `<img>` (la imagen de fondo sigue
  PENDIENTE del cliente, ver cabecera del `.feature`) y sus dos únicos
  enlaces (`#reservar`, `tel:+34910829267`) ya cumplían la regla desde el
  ciclo 4.

### Refactor final (en verde, tras el ciclo 12)
- Añadidos comentarios JSDoc explicando el sentinela `null` en `HeroProps` y
  un comentario sobre `Hero` que documenta el "falla cerrado" de @s11, en el
  mismo estilo que `Cabecera.tsx`.
- `pnpm run lint` (oxlint `--deny-warnings`) señaló `vitest
  (require-to-throw-message)` sobre el `toThrow()` sin mensaje del ciclo 11;
  corregido a `toThrow('91 082 92')` (mismo patrón que
  `src/lib/telefono.test.ts`).
- `pnpm run lint && pnpm run typecheck` y `pnpm run test` (suite completa)
  verdes tras el refactor.

## Trazabilidad (@s → test)

Todos en `src/components/Hero.test.tsx`.

- @s1 → `describe('@s1...')`
- @s2 → `describe('@s2...')`
- @s3 → `describe('@s3...')`
- @s4 → `describe('@s4...')`
- @s5 → `describe('@s5...')`
- @s6 → `describe('@s6...')`
- @s7 → `describe('@s7...')`
- @s8 → `describe('@s8...')`
- @s9 → `describe('@s9...')`
- @s10 → `describe('@s10...')`
- @s11 → `describe('@s11...')`
- @s13 → `describe('@s13...')`
- @s14 → **sin test de Vitest**, por diseño (Decisión 11 de
  `project-spec.md`; ver "Pendiente explícito" arriba). No hay `@s12` en el
  `.feature` (retirado en la reparación del 18/08/2026).

Total: 12/13 escenarios del `.feature` cubiertos por Vitest (todos los que
el propio contrato asigna al gate de Vitest/Stryker), 1 fuera de gate por
decisión explícita y documentada del proyecto, 12 tests concretos (uno por
`describe`).

## Ficheros de producción creados en esta sesión

- `src/components/Hero.tsx` — el componente (`Hero` exportado, interfaz
  `FranjaHorario` exportada para futura reutilización, p. ej.
  `informacion_contacto`).

Ningún fichero de `src/lib` ni `src/data` tocado: `Hero` reutiliza
`datosNegocio` y `enlaceLlamada` tal cual, sin duplicar lógica ya mordida
por mutación en `datos_negocio`.

## Estado final

- `pnpm exec vitest run`: **96/96 verdes** (84 previos + 12 nuevos de esta
  feature, todos en `src/components/Hero.test.tsx`).
- `pnpm run lint && pnpm run typecheck`: sin errores ni avisos.
- `node .harness/harness.mjs init`: verde de punta a punta.
- No se marca `done` en `feature_list.json`: falta `judge` y
  `mutation_tester` (regla dura del propio rol; además `Hero.tsx` no cae en
  ningún glob de `stryker.config.json` — no hay lógica propia de la feature
  que mutar más allá de la ya cubierta por `datos_negocio`, así que la
  mutación de esta ronda, si el `judge` la pide, medirá superficie 0 en esta
  feature y corresponde documentarlo, no inventar un `Hero-logica.ts` sin
  test rojo que lo pida).
- Nada pendiente escondido: los tres puntos de "Pendiente explícito" siguen
  abiertos y documentados arriba, ninguno bloquea el cierre de esta feature
  por sí mismo.
