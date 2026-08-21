# TDD — `galeria` (id 8)

> Bitácora de `tdd_craftsman`. Feature `features/galeria.feature`, 17
> escenarios (@s1-@s17), aprobados por la puerta humana junto con las otras
> 18 features del contrato reparado (ver `progress/current.md`).

## Confirmación previa al primer test rojo

`node .harness/harness.mjs init` (esta máquina no tiene `pwsh`) **no** estaba
limpio al arrancar la sesión: existían 5 ficheros sin trazar en git
(`src/data/galeria.ts`, `src/components/Galeria.tsx`,
`src/components/Galeria-logica.ts`, `src/components/Galeria.test.tsx`,
`src/components/Galeria-logica.test.ts`), sin ningún `progress/tdd_galeria.md`
que documentara ciclos. Eran un intento previo (de esta u otra sesión) que no
llegó a cerrarse: cubrían @s1-@s7 pero con 3 errores de lint reales
(`no-shadow` en `Galeria-logica.ts:34`, y `no-noninteractive-tabindex` +
`prefer-tag-over-role` en `Galeria.tsx:34` sobre el `<div role="group"
tabIndex={0}>` de la pista) y dejaban sin cubrir @s8-@s17, incluido un bug
real: @s10 exige que sin tarjeta medible no se solicite ningún desplazamiento,
y el código pre-existente llamaba `scrollBy` igualmente con
`0 + SEPARACION_ENTRE_TARJETAS_PX`.

Sin bitácora que demuestre qué test roja forzó cada línea, no hay forma de
confiar en la disciplina Ley 1 de ese código. Decisión: **descartar los 5
ficheros sin trazar y reconstruir la feature entera por TDD estricto**, un
test rojo a la vez, igual que el resto del proyecto (mismo criterio que
`progress/tdd_equipo.md`). El catálogo de demostración de datos (nombres,
pies, rutas locales) se conserva conceptualmente porque ya era correcto
(decisiones 1b/9 respetadas), pero se re-escribe como parte del propio ciclo
@s1.

Tras el descarte, `node .harness/harness.mjs init`: **limpio** — 167/167
tests (línea base heredada de `reserva_chat`), lint y typecheck sin errores.

### Nota de configuración fuera de `src/` (documentada, no oculta)

Ninguna. La única configuración tocada durante la investigación
(`.oxlintrc.json`, para probar si la opción `roles` de
`jsx-a11y/no-noninteractive-tabindex` la soporta oxlint — no la soporta para
rol implícito de etiqueta, sí para `role` explícito pero deja
`prefer-tag-over-role` sin resolver) se **revirtió íntegra** antes de escribir
ningún test; el fichero en disco es idéntico al que había al arrancar. La
solución real para el contenedor de pista desplazable (@s4) vive en el propio
`Galeria.tsx`: comentario `oxlint-disable-next-line` con la justificación del
patrón WAI-ARIA APG "scrollable region" (contenedor no interactivo pero
desplazable, focable con `tabIndex=0`), no un cambio de configuración
proyecto-ancho.

## Entregables

- `src/data/galeria.ts` — catálogo de demostración (6 entradas ficticias,
  rutas locales provisionales), `interface EntradaGaleria`.
- `src/components/Galeria-logica.ts` — lógica pura mordible por mutación:
  `entradasValidas`, `calcularSolicitudDeDesplazamiento` (devuelve `null`
  fallando cerrado sin tarjeta medible, @s10), `prefiereMenosMovimiento`
  (falla cerrado hacia "prefiere menos" sin `matchMedia`, @s8),
  `SEPARACION_ENTRE_TARJETAS_PX`.
- `src/components/Galeria-logica.test.ts` — 8 tests directos de apoyo sobre
  esa lógica.
- `src/components/Galeria.tsx` — el componente, solo cablea: `useRef` sobre
  la pista, `desplazar(sentido)` mide la primera tarjeta y delega el cálculo,
  aviso de demostración con `aria-describedby`, `return null` sin entradas
  válidas.
- `src/components/Galeria.test.tsx` — un `describe` por `@s`, 17/17
  escenarios con test concreto.

`pnpm run test`: **191/191** (167 previos + 24 nuevos: 16 de
`Galeria.test.tsx` + 8 de `Galeria-logica.test.ts`). `node
.harness/harness.mjs init` verde (lint, typecheck, tests).

## Nota de disciplina: escenarios de guarda pasados a la primera (@s6, @s9, @s11, @s13, @s14, @s16)

Seis escenarios son cláusulas negativas o quedan implicados por una
implementación ya generalizada en un ciclo anterior — al escribir su test,
pasaba en verde a la primera sin ningún cambio de producción (`docs/tdd.md`:
"un test que pasa a la primera no demuestra nada: ajústalo o sospecha del
montaje"). En los seis casos se verificó el ROJO genuino por sabotaje manual
antes de aceptar el ciclo como válido: se introdujo a mano el defecto exacto
que el escenario prohíbe (en producción o en el dato real de
`src/data/galeria.ts`), se confirmó que el test (y solo ese test, o los
esperables) se ponía en rojo, y se revirtió el sabotaje sin tocar nada más.
Detalle en cada ciclo de la trazabilidad de abajo.

## Trazabilidad — ciclo a ciclo

### @s1 — Cada entrada del catálogo se muestra como una fotografía con texto alternativo
- **Rojo:** `Galeria.test.tsx` importa `./Galeria` y `../data/galeria`,
  ninguno existe → fallo de resolución de import (Ley 2).
- **Verde:** `src/data/galeria.ts` (catálogo real, 6 entradas, `interface
  EntradaGaleria`) + `src/components/Galeria.tsx` mínimo: `<section
  aria-label="Galería">` con un `<figure><img src alt/></figure>` por
  entrada.
- **Refactor:** ninguno necesario, código ya mínimo.
- Test: `@s1 cada entrada del catálogo se muestra como una fotografía con texto alternativo`

### @s2 — Cada figura muestra el nombre y el pie de su entrada
- **Rojo:** `figuraNala.textContent` no contenía el pie (`''` esperado
  `'Nala y Coco'` porque `closest('figure')` devolvía la figura sin
  `figcaption`, el `toContain` fallaba en la primera aserción real).
- **Verde:** `<figcaption>{`${entrada.nombre} · ${entrada.pie}`}</figcaption>`.
- Test: `@s2 cada figura muestra el nombre y el pie de su entrada`

### @s3 — La región y sus controles exponen nombre accesible
- **Rojo:** `getByRole('button', { name: 'Foto anterior' })` no encontraba
  nada — no había botones todavía.
- **Verde:** los dos `<button aria-label="Foto anterior/siguiente">` con un
  `<span aria-hidden="true">` de glifo visible (el nombre accesible viene del
  `aria-label`, no del glifo).
- Test: `@s3 la región y sus controles exponen nombre accesible`

### @s4 — La pista desplazable es alcanzable con el teclado
- **Rojo:** tras dos `Tab`, `document.activeElement` era el botón "Foto
  siguiente" (`tagName === 'BUTTON'`) — no existía ningún elemento entre los
  dos botones.
- **Verde:** `<div role="group" aria-label="Fotografías de la galería"
  tabIndex={0}>` envolviendo las figuras. Requirió resolver 2 errores de
  lint reales (`jsx-a11y/no-noninteractive-tabindex` y
  `jsx-a11y/prefer-tag-over-role`, investigados empíricamente antes de tocar
  el componente — ver nota de configuración arriba): se resolvieron con un
  comentario `oxlint-disable-next-line` con la justificación del patrón
  WAI-ARIA APG "scrollable region", no con un cambio de `.oxlintrc.json`.
- Test: `@s4 la pista desplazable es alcanzable con el teclado`

### @s5 — El botón "Foto siguiente" desplaza la pista una tarjeta hacia el final
- **Rojo (lógica):** `Galeria-logica.test.ts` importa
  `calcularSolicitudDeDesplazamiento`, no existe → fallo de import.
- **Verde (lógica):** `src/components/Galeria-logica.ts` con
  `calcularSolicitudDeDesplazamiento(anchoTarjetaPx, sentido, prefiereMenos)`
  y `SEPARACION_ENTRE_TARJETAS_PX = 18`.
- **Rojo (componente):** `pista.scrollBy` con 0 llamadas — el botón no tenía
  `onClick`.
- **Verde (componente):** `useRef` sobre la pista, `desplazar(sentido)` mide
  `getBoundingClientRect().width` de la primera `<figure>` y llama a
  `pista.scrollBy(...)`.
- Test lógica: `"siguiente" pide una distancia positiva de exactamente ancho + separación, suavizada`
- Test componente: `@s5 el botón "Foto siguiente" desplaza la pista una tarjeta hacia el final`

### @s6 — El botón "Foto anterior" desplaza la pista una tarjeta hacia el principio
- **Rojo (genuino, por sabotaje):** ambos tests (lógica y componente) pasaron
  a la primera — la implementación de @s5 ya generalizaba el signo con un
  ternario (`sentido === 'siguiente' ? 1 : -1`), no era un "fake it" de
  constante fija. Sabotaje: `const signo = 1 // SABOTAJE_TEMPORAL` →
  exactamente esos 2 tests se pusieron en rojo, ningún otro. Revertido.
- **Verde:** sin cambio de producción adicional.
- Test lógica: `"anterior" pide la misma magnitud en negativo`
- Test componente: `@s6 el botón "Foto anterior" desplaza la pista una tarjeta hacia el principio`

### @s7 — Con la preferencia de menos movimiento el desplazamiento es instantáneo
- **Rojo (lógica, lo nuevo):** `prefiereMenosMovimiento` no existía →
  `TypeError: prefiereMenosMovimiento is not a function`.
- **Rojo (genuino, por sabotaje, lo ya implicado):** el test de `suave` sobre
  `calcularSolicitudDeDesplazamiento` pasó a la primera (`suave:
  !prefiereMenos` ya lo cubría desde @s5). Sabotaje: `suave: true //
  SABOTAJE_TEMPORAL` → exactamente ese test se puso en rojo. Revertido.
- **Verde (lógica):** `prefiereMenosMovimiento(consultarMedios)` lee
  `consultarMedios('(prefers-reduced-motion: reduce)').matches`.
- **Rojo (componente):** `pista.scrollBy` recibía `behavior: 'smooth'` en vez
  de `'auto'` (el componente pasaba `false` fijo, sin consultar el sistema).
- **Verde (componente):** `desplazar` pasa
  `prefiereMenosMovimiento(window.matchMedia)` en vez de `false`.
- Test lógica (suave): `con preferencia de menos movimiento, la solicitud no es suave`
- Test lógica (consulta): `devuelve el "matches" de la consulta "(prefers-reduced-motion: reduce)"`
- Test componente: `@s7 con la preferencia de menos movimiento el desplazamiento es instantáneo`

### @s8 — Si la preferencia de movimiento no se puede consultar se desplaza sin suavizado
- **Rojo (lógica):** `prefiereMenosMovimiento(undefined)` lanzaba
  `TypeError: consultarMedios is not a function` (fallo real, no solo de
  tipos: `docs/tdd.md` cuenta que no compile/importe como fallar, y aquí
  además revienta en tiempo de ejecución).
- **Verde (lógica):** guarda `if (typeof consultarMedios !== 'function')
  return true` — falla cerrado hacia "prefiere menos movimiento".
- **Rojo (componente, ya cubierto por la guarda de lógica):** el test de
  componente (`matchMedia` global sustituido por `undefined`) pasó a la
  primera una vez la guarda de lógica ya existía — la causa real ya había
  sido forzada por el rojo de lógica, no hacía falta un segundo rojo de
  componente. Verificado igualmente por sabotaje: se desactivó la guarda
  (`if (false) { ... }`) y **ambos** tests (lógica y componente) se pusieron
  en rojo con el `TypeError` real propagado hasta `onClick` (excepción no
  capturada, `exit 1`). Revertido.
- Test lógica: `si no hay función de consulta disponible, cae a "prefiere menos" (falla cerrado hacia sin suavizado)`
- Test componente: `@s8 si la preferencia de movimiento no se puede consultar se desplaza sin suavizado`

### @s9 — Pulsar "Foto anterior" estando ya al principio no mueve la pista ni inutiliza el control
- **Alcance:** solo la primera cláusula (el botón sigue habilitado) es
  medible en jsdom; las 3 restantes (scrollLeft) son Decisión 11, verificadas
  en navegador real, fuera de este gate — declarado en el propio `.feature`.
- **Rojo (genuino, por sabotaje):** el test pasó a la primera (nada
  deshabilita nunca el botón). Sabotaje: `disabled` fijo en el botón "Foto
  anterior" → el test de `toBeEnabled()` se puso en rojo (además de romper,
  colateralmente, @s4 y @s6, que dependen de que el botón sea focable/
  clicable — confirma que la aserción es real, no un adorno). Revertido.
- **Verde:** sin cambio de producción — nunca hubo lógica de deshabilitado.
- Test: `@s9 pulsar "Foto anterior" estando ya al principio no mueve la pista ni inutiliza el control`

### @s10 — Sin tarjeta medible no se solicita ningún desplazamiento
- **Rojo (lógica):** `calcularSolicitudDeDesplazamiento(0, 'siguiente',
  false)` devolvía `{ distanciaPx: 18, suave: true }` en vez de `null` — bug
  real heredado del borrador descartado (ver nota de configuración arriba):
  con ancho 0 seguía pidiendo `0 + separación` en vez de fallar cerrado.
- **Verde (lógica):** `if (anchoTarjetaPx <= 0) return null`, tipo de
  retorno `SolicitudDeDesplazamiento | null`.
- **Rojo (componente):** excepción no capturada (`Cannot read properties of
  null (reading 'distanciaPx')`) al desestructurar `solicitud` sin comprobar
  `null` — Vitest reporta la suite como fallida (`exit 1`) pese a que el
  `expect` de ese test en concreto no llegaba a ejecutarse tras el `catch`
  interno de React; confirmado empíricamente con `echo EXIT:$?`.
- **Verde (componente):** `if (solicitud === null) return` antes de llamar a
  `scrollBy`.
- Test lógica: `con ancho de tarjeta 0 (sin medida real) no hay solicitud de desplazamiento: devuelve null`
- Test componente: `@s10 sin tarjeta medible no se solicita ningún desplazamiento`

### @s11 — Todas las fotografías se sirven desde el propio sitio
- **Rojo (genuino, por sabotaje):** el test (contra el catálogo real, sin
  doble) pasó a la primera. Sabotaje: `src/data/galeria.ts`, entrada
  "Bruno" con `src: 'https://images.pexels.com/SABOTAJE_TEMPORAL.webp'` →
  exactamente ese test se puso en rojo. Revertido.
- **Verde:** sin cambio de producción — el catálogo real ya usaba rutas
  locales (`/img/galeria/...`) desde @s1, sin `srcset`, sin `<iframe>`.
- Test: `@s11 todas las fotografías se sirven desde el propio sitio`

### @s12 — El contenido de la galería está rotulado como demostración
- **Rojo:** `screen.getByText(AVISO_DEMOSTRACION)` (literal exacto del
  `.feature`) no encontraba nada — no existía ningún aviso.
- **Verde:** `<p id="galeria-aviso-demostracion">…</p>` con el literal exacto
  (el `whitespace` de las 3 líneas de JSX se colapsa a espacios simples, sin
  alterar el texto), enlazado con `aria-describedby="galeria-aviso-demostracion"`
  en la `<section>`.
- Test: `@s12 el contenido de la galería está rotulado como demostración`

### @s13 — La sección no afirma que las fotografías sean pacientes de Galapavet
- **Rojo (genuino, por sabotaje):** pasó a la primera. Sabotaje: aviso
  sustituido temporalmente por texto con "pacientes reales" y "con permiso
  de sus familias" → exactamente ese test (y el de @s12, que sí depende del
  literal exacto del aviso) se pusieron en rojo. Revertido.
- **Verde:** sin cambio de producción — el aviso real de @s12 nunca contuvo
  esas cadenas (usa "no fotografías reales de pacientes" y "el consentimiento
  de las familias fotografiadas", en otro orden y con otras palabras).
- Test: `@s13 la sección no afirma que las fotografías sean pacientes de Galapavet`

### @s14 — Los pies de demostración no mencionan servicios que el cliente no publica
- **Rojo (genuino, por sabotaje):** pasó a la primera (contra el catálogo
  real, sin doble). Sabotaje: pie de "Luna" con `'Revisión anual y
  peluquería (SABOTAJE_TEMPORAL)'` → exactamente ese test se puso en rojo.
  Revertido.
- **Verde:** sin cambio de producción — el catálogo real nunca mencionó
  peluquería, exóticos, urgencias 24 h, nutrición y etología, ni microchip y
  viajes.
- Test: `@s14 los pies de demostración no mencionan servicios que el cliente no publica`

### @s15 — Con el catálogo vacío la sección no se renderiza
- **Rojo:** con `catalogo={[]}`, la región "Galería" seguía existiendo (el
  componente no comprobaba la longitud del catálogo).
- **Verde:** `if (catalogo.length === 0) return null` (mismo patrón que
  `Equipo`/`Servicios`), tras el `useRef` (orden de hooks intacto).
- Test: `@s15 con el catálogo vacío la sección no se renderiza`

### @s16 — El catálogo de galería de producción no está vacío
- **Rojo (genuino, por sabotaje):** pasó a la primera (importa `GALERIA`
  real, sin doble). Sabotaje: `GALERIA` vaciado a `[]` en
  `src/data/galeria.ts` → se puso en rojo tanto este test como, de rebote,
  los de @s11 y @s14 (que también renderizan sin doble): confirma que los
  tres ejercitan de verdad el catálogo de producción, ninguno vía doble.
  Revertido.
- **Verde:** sin cambio de producción — el catálogo real siempre tuvo 6
  entradas.
- Test: `@s16 el catálogo de galería de producción no está vacío`

### @s17 — Una entrada del catálogo con el nombre en blanco no se renderiza y no arrastra a las demás
- **Rojo (lógica):** `entradasValidas` no existía →
  `TypeError: entradasValidas is not a function`.
- **Verde (lógica):** `entradasValidas(catalogo)` filtra `entrada.nombre.trim()
  !== ''`, con test directo de apoyo (3 entradas, la del medio en blanco,
  conserva el orden de las otras 2).
- **Rojo (componente):** con 3 entradas (la segunda de nombre en blanco) se
  renderizaban 3 figuras en vez de 2.
- **Verde (componente):** `const validas = entradasValidas(catalogo)`,
  `validas.map(...)` sustituye a `catalogo.map(...)`, y la guarda de @s15 se
  generaliza de `catalogo.length === 0` a `validas.length === 0` (forzado por
  este mismo rojo, no un cambio especulativo).
- Test lógica: `descarta las entradas con el nombre en blanco y conserva el resto en su orden`
- Test componente: `@s17 una entrada del catálogo con el nombre en blanco no se renderiza y no arrastra a las demás`

## Refactor final

Código ya mínimo tras cada ciclo; no hizo falta ningún refactor adicional al
cerrar. `node .harness/harness.mjs init`: **verde** (lint, typecheck, 191/191
tests). Los 17 escenarios de `features/galeria.feature` tienen test concreto.

## Trazabilidad — mapa @s → test

| Escenario | Test |
| --- | --- |
| @s1 | `Galeria.test.tsx` → `@s1 cada entrada del catálogo se muestra como una fotografía con texto alternativo` |
| @s2 | `Galeria.test.tsx` → `@s2 cada figura muestra el nombre y el pie de su entrada` |
| @s3 | `Galeria.test.tsx` → `@s3 la región y sus controles exponen nombre accesible` |
| @s4 | `Galeria.test.tsx` → `@s4 la pista desplazable es alcanzable con el teclado` |
| @s5 | `Galeria-logica.test.ts` → `"siguiente" pide una distancia positiva…` + `Galeria.test.tsx` → `@s5 el botón "Foto siguiente"…` |
| @s6 | `Galeria-logica.test.ts` → `"anterior" pide la misma magnitud en negativo` + `Galeria.test.tsx` → `@s6 el botón "Foto anterior"…` |
| @s7 | `Galeria-logica.test.ts` → `con preferencia de menos movimiento, la solicitud no es suave` + `devuelve el "matches"…` + `Galeria.test.tsx` → `@s7 con la preferencia de menos movimiento…` |
| @s8 | `Galeria-logica.test.ts` → `si no hay función de consulta disponible…` + `Galeria.test.tsx` → `@s8 si la preferencia de movimiento no se puede consultar…` |
| @s9 | `Galeria.test.tsx` → `@s9 pulsar "Foto anterior" estando ya al principio…` (solo cláusula medible en jsdom; resto Decisión 11, navegador real) |
| @s10 | `Galeria-logica.test.ts` → `con ancho de tarjeta 0 (sin medida real)…` + `Galeria.test.tsx` → `@s10 sin tarjeta medible…` (última cláusula: Decisión 11) |
| @s11 | `Galeria.test.tsx` → `@s11 todas las fotografías se sirven desde el propio sitio` |
| @s12 | `Galeria.test.tsx` → `@s12 el contenido de la galería está rotulado como demostración` |
| @s13 | `Galeria.test.tsx` → `@s13 la sección no afirma que las fotografías sean pacientes de Galapavet` |
| @s14 | `Galeria.test.tsx` → `@s14 los pies de demostración no mencionan servicios que el cliente no publica` |
| @s15 | `Galeria.test.tsx` → `@s15 con el catálogo vacío la sección no se renderiza` |
| @s16 | `Galeria.test.tsx` → `@s16 el catálogo de galería de producción no está vacío` |
| @s17 | `Galeria-logica.test.ts` → `descarta las entradas con el nombre en blanco…` + `Galeria.test.tsx` → `@s17 una entrada del catálogo con el nombre en blanco…` |

## Pendiente antes de `done`

No se marca `done` en `feature_list.json` — falta `judge` y
`mutation_tester` (umbral 1.0 en `harness.config.json`). Verificación en
navegador real (Decisión 11: @s9 cláusulas 2-4, @s10 última cláusula) sigue
pendiente, declarada explícitamente en el propio `.feature`, no oculta.

## Ronda 2 — correcciones sobre `progress/judge_galeria.md` (ronda 1, CHANGES_REQUESTED)

> Alcance estricto: solo lo señalado en "Cambios requeridos" de
> `progress/judge_galeria.md` ronda 1. No hay `progress/mutation_galeria.md`
> previo (el `judge` rechazó antes de que corriera `mutation_tester`).

### Cambio 1 (bloqueante) — anclar `SEPARACION_ENTRE_TARJETAS_PX` a un literal escrito a mano

- **Hallazgo del judge:** `Galeria-logica.test.ts` y `Galeria.test.tsx`
  solo reimportaban el símbolo `SEPARACION_ENTRE_TARJETAS_PX` y lo usaban
  para *calcular* el valor esperado (`240 + SEPARACION_ENTRE_TARJETAS_PX`),
  nunca lo comparaban contra un literal escrito a mano. Un mutante que
  cambia la constante sobrevive porque ambos lados de la comparación mutan
  igual (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`).
- **Rojo:** añadido `src/components/Galeria-logica.test.ts` — nuevo
  `describe('SEPARACION_ENTRE_TARJETAS_PX (apoyo de implementación, no
  escenario de negocio)')` con `expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(18)`
  (mismo patrón que `Cabecera-logica.test.ts:4-9`,
  `PUNTO_DE_CORTE_NAVEGACION_PX`). Al escribirlo pasó en verde a la primera
  (el valor real ya es 18, igual que @s6/@s9/@s11/@s13/@s14/@s16 en la ronda
  1) — se verificó el rojo genuino por sabotaje manual: se cambió
  temporalmente `src/components/Galeria-logica.ts:28` a
  `18 + 47 // SABOTAJE_TEMPORAL_TDD` y se corrió
  `pnpm exec vitest run src/components/Galeria-logica.test.ts` →
  **1 failed, 7 passed**: solo el nuevo test se puso en rojo
  (`expected 65 to be 18`), los 7 tests preexistentes que calculan el valor
  esperado a partir del símbolo siguieron en verde — confirma exactamente el
  hallazgo del judge (esos 7 no muerden la constante) y que el nuevo test sí
  la muerde. Revertido a `= 18` inmediatamente; confirmado con `grep` que el
  fichero quedó exactamente como estaba.
- **Verde:** sin más cambio de producción — el valor real ya era correcto,
  solo faltaba el test que lo ancla.
- **Alcance no ampliado:** el propio hallazgo dejaba dicho que no era
  estrictamente necesario tocar las 4 aserciones de `Galeria.test.tsx`
  (@s5/@s6/@s7/@s8) que usan el símbolo como parte del valor esperado si
  existe esta única aserción de apoyo — no se tocaron, para no exceder lo
  señalado.
- **Refactor (en verde):** el comentario de cabecera de
  `SEPARACION_ENTRE_TARJETAS_PX` (`Galeria-logica.ts:18-28`) afirmaba
  "Producción y test importan este mismo símbolo (nunca un literal duplicado
  en dos sitios)" — la misma frase que el propio `judge` señaló como
  engañosa, porque mezclaba "el ancho de tarjeta no es medible en jsdom" con
  "la separación no necesita literal". Se reescribió para documentar el
  patrón real (la constante queda anclada por el literal a mano en el test
  nuevo, independientemente del mock de ancho de tarjeta
  `fijarAnchoDePrimeraTarjeta`), citando expresamente
  `progress/judge_galeria.md` ronda 1, hallazgo 1.
- Test: `Galeria-logica.test.ts` → `el valor declarado es exactamente 18
  píxeles, escrito a mano y no derivado del símbolo`

### Cambio 2 (no bloqueante) — documentar la generalización del guardián `validas.length === 0`

- **Hallazgo del judge:** `Galeria.tsx:20` generaliza el guardián de
  `catalogo.length === 0` (lo único que el rojo de @s17 exigía) a
  `validas.length === 0` sin que ningún `@s` cubra hoy el caso que lo
  motiva (catálogo con entradas, todas de nombre en blanco). El judge pidió
  decidir y dejarlo trazado, no como duda abierta — explícitamente sin
  exigir un escenario nuevo.
- **Sin cambio de comportamiento ni test nuevo** (no aplica TDD rojo→verde:
  es una nota de trazabilidad, no una corrección de lógica). Se añadió un
  comentario en `src/components/Galeria.tsx` junto al guardián,
  documentando la decisión deliberada (mismo modo de error "dato ausente →
  no se renderiza el bloque" que `Equipo`/`Servicios`, `project-spec.md:71`)
  y remitiendo al hallazgo no bloqueante 2 de `progress/judge_galeria.md`
  ronda 1, para que quede cerrado con una frase en el propio código en vez
  de como pregunta pendiente.

### Verificación final

`pnpm exec vitest run src/components/Galeria.test.tsx
src/components/Galeria-logica.test.ts`: **25/25** (24 previos + 1 nuevo).
`node .harness/harness.mjs init`: **verde** — lint sin errores, typecheck
sin errores, **192/192** tests (191 previos + 1 nuevo).

## Pendiente antes de `done` (ronda 2)

No se marca `done` en `feature_list.json` — pendiente `judge` (ronda 2) y
`mutation_tester` (umbral 1.0). Verificación en navegador real (Decisión 11:
@s9 cláusulas 2-4, @s10 última cláusula) sigue pendiente, sin cambios desde
la ronda 1.
