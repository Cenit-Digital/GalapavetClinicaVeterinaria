# TDD — `pie_de_pagina` (id 13)

Feature nueva desde cero: no existía ningún fichero de esta feature en disco
antes de esta ronda (ni componente, ni datos, ni esta bitácora). 15 escenarios
(`@s1..@s15`) + `Background` (teléfonos de la fuente única), recorridos en
orden estricto, un ciclo Rojo→Verde→Refactor por escenario (algunos con más
de un ciclo cuando el escenario tenía más de una arista).

## Entregables

- `src/data/pieDePaginaEnlaces.ts` — catálogo readonly `ENLACES_CLINICA`
  (@s3) y `ENLACES_CONTENIDO` (@s4): anclas/rutas internas fijas del propio
  `.feature`, no derivadas de `datosNegocio`. Mismo patrón que
  `src/data/navegacion.ts`, con un conjunto de destinos propio (el pie
  reparte 4+4 en dos columnas; la cabecera enlaza 8 destinos en una lista).
- `src/data/paginasLegales.ts` — catálogo readonly `PAGINAS_LEGALES` (@s9):
  las 3 páginas legales reales del cliente, mismo patrón que
  `src/data/servicios.ts`/`equipo.ts`/`navegacion.ts`.
- `src/components/PieDePagina-logica.ts` — lógica pura, mordible por
  mutación: `construirEnlacesLegales` (@s9/@s10/@s11), `textoCopyright`
  (@s12/@s13), `construirEnlacesContacto` + `nombreEnlaceUrgencias` privada
  (@s5/@s6/@s15). Reutiliza `construirEnlaceTelefono` de
  `InformacionContacto-logica.ts` — ningún `tel:` se reescribe a mano.
- `src/components/PieDePagina.tsx` — solo cablea: arma las 3 columnas
  (`ColumnaEnlaces`), la barra legal y el bloque de marca a partir de la
  lógica pura y de `datosNegocio` (`src/lib/site.ts`).
- `src/components/PieDePagina.test.tsx` — 15 tests, uno por escenario
  (render completo).
- `src/components/PieDePagina-logica.test.ts` — 3 tests: `textoCopyright`
  para @s12 y @s13 a nivel de lógica pura (la redacción del propio Gherkin,
  "se calcula el texto... para esa fecha", pide probar la función, no solo
  el render) + 1 test de refuerzo de cobertura sobre la rama sin rótulo de
  `nombreEnlaceUrgencias` (nunca se ejerce vía escenario porque la fuente
  real siempre declara el rótulo; sin este test esa rama queda mordible por
  mutación pero sin ningún test que la mate).

## Ciclos Rojo → Verde → Refactor

- **@s1** — ROJO: `PieDePagina.test.tsx` importa un componente que no existe
  (falla en `import`, cuenta como rojo). VERDE: `PieDePagina.tsx` mínimo con
  `<footer>` (rol `contentinfo` implícito), bloque de marca (`nombreComercial`
  + `descriptorConLocalidad` de `datosNegocio.identidad`) y `<img alt="">`
  decorativo.
- **@s2** — ROJO: falta `getByRole('heading')` dentro del `contentinfo`.
  VERDE: 3 columnas (`ColumnaEnlaces`) con **contenido placeholder**
  (`ENLACES_PROVISIONALES`, 4 enlaces "Enlace 1".."Enlace 4"): es la trampa
  legítima de `docs/tdd.md` ("devolver una constante si aún no hay test que
  lo desmienta") — el test de @s2 solo pide 3 headings + 4 listitems/lista +
  1 link/listitem, no el contenido real.
  Verificación de adyacencia: cada `<h3>` es hermano inmediato del `<ul>`
  (`nextElementSibling`), interpretación literal de "va seguido de".
- **@s3** — ROJO: los 4 nombres/destinos de "Clínica" no coinciden con el
  placeholder. VERDE: creado `src/data/pieDePaginaEnlaces.ts` con
  `ENLACES_CLINICA` (Servicios/Equipo/Reservar cita/Galería →
  `#servicios`/`#equipo`/`#reservar`/`#galeria`), cableado en la columna.
- **@s4** — ROJO: mismo patrón para "Contenido". VERDE: añadido
  `ENLACES_CONTENIDO` al mismo fichero de datos (Blog/Campañas/Tienda/FAQ →
  `/blog`/`/campanas`/`/tienda`/`#faq`).
- **@s5** — ROJO: la columna "Contacto" seguía con el placeholder. VERDE:
  `construirEnlacesContacto` (en el propio `.tsx` en este ciclo, movida a
  `-logica.ts` en el refactor) deriva los 3 enlaces de llamada con
  `construirEnlaceTelefono` (reutilizado de `InformacionContacto-logica.ts`,
  cero teléfonos reescritos a mano) + el enlace fijo "Cómo llegar" →
  `#contacto`.
- **@s6** — Verde a la primera (el nombre "Urgencias fuera de horario · ..."
  ya lo construía @s5). Verificado que el test muerde: sabotaje manual
  (`nombreEnlaceUrgencias` → añadir `"24 h"` al rótulo) confirmó 2 tests en
  rojo (@s5 y @s6), revertido byte a byte.
- **@s7** — Verde a la primera: nunca se escribió código de `mailto:` en
  ningún ciclo anterior (Ley 1 respetada: ningún test lo pidió nunca), así
  que la ausencia es estructural, no un caso especial. El test ancla su
  premisa a la fuente real (`expect(datosNegocio.email).toBeUndefined()`)
  en vez de asumir la ausencia sin verificarla — la "guarda de ausencia" que
  pide el enunciado de la tarea vive en el test, no en un `if` de producción
  que ningún escenario llegaría a ejercitar en su rama verdadera.
- **@s8** — Verde a la primera, mismo razonamiento que @s7: nunca existió
  código de "redes sociales"/"Síguenos". Test ancla su premisa a
  `expect(datosNegocio.redesSociales).toEqual([])`.
- **@s9** — ROJO: no existía ninguna lista `"Enlaces legales"`. Creado
  `src/data/paginasLegales.ts` (`PAGINAS_LEGALES`, 3 páginas reales) y
  renderizada la barra inferior con un `<ul aria-label="Enlaces legales">`
  (permite escopar "la barra inferior" sin inventar un `data-testid`, y no
  rompe el conteo de `@s2` porque ese conteo es solo sobre `heading`, no
  sobre `list`).
- **@s10** — ROJO: sin `target`/`rel`/sufijo de nombre. VERDE: creado
  `src/components/PieDePagina-logica.ts` con `construirEnlacesLegales`
  (añade `" (se abre en una ventana nueva)"` al nombre) + `target="_blank"
  rel="noopener noreferrer"` fijos en el `.tsx` (literales, sin rama que
  mutar).
- **@s11** — ROJO: `PieDePagina` no aceptaba props. VERDE: prop
  `paginasLegales?: readonly PaginaLegal[]` con valor por defecto
  `PAGINAS_LEGALES`, inyectable sin tocar producción en el test.
- **@s12** — Dos partes, ambas con su propio ciclo:
  1. `PieDePagina-logica.test.ts` (ROJO: `textoCopyright` no existe) → VERDE:
     `textoCopyright(fecha, nombreComercial)` — recibe la fecha como
     parámetro, nunca `Date.now()` implícito.
  2. `PieDePagina.test.tsx` (ROJO: la barra inferior no mostraba ningún
     aviso de copyright) → VERDE: prop `fecha?: Date` + `<p>{copyright}</p>`
     en la barra inferior, cableando `textoCopyright`.
- **@s13** — Mismo patrón en dos partes; **ambas verdes a la primera** (la
  función y el cableado de @s12 ya eran genéricos, no había nada horneado
  que generalizar). Verificado que el test de lógica muerde: sabotaje manual
  (`textoCopyright` → devolver `© 2026 ...` fijo) confirmó el test de @s13
  en rojo, revertido.
- **@s14** — Verde a la primera (barrido final sobre todo el texto y todos
  los destinos del pie contra las cadenas del prototipo heredado). No forzó
  ningún cambio de producción porque ningún ciclo anterior introdujo esas
  cadenas.
- **@s15** — ROJO: `PieDePagina` no aceptaba `telefonoUrgencias` como prop,
  así que `.toThrow('91 851 13')` fallaba. VERDE: prop
  `telefonoUrgencias?: string` (por defecto, el de la fuente única),
  propagada sin `try/catch` a `construirEnlacesContacto` →
  `construirEnlaceTelefono` → `enlaceLlamada` (`src/lib/telefono.ts`), que
  ya falla cerrado. Mismo patrón que `Hero.tsx`/`InformacionContacto.tsx`.

## Refactor (en verde, tras @s15)

- Movida toda la lógica de decisión que vivía en el `.tsx`
  (`nombreEnlaceUrgencias`, `construirEnlacesContacto`) a
  `PieDePagina-logica.ts`, para cumplir la Invariante 6 del proyecto ("la
  lógica de decisión vive en módulos puros, el `.tsx` solo cablea") y para
  que quede mordible por mutación (`stryker.config.json` solo muta
  `src/lib/**` y `src/**/*-logica.ts`, nunca `.tsx`).
- Unificado el tipo de "enlace de columna": se eliminó la interfaz duplicada
  `EnlacePieColumna` del `.tsx` en favor de `EnlacePieDePagina`, ya
  declarada en `src/data/pieDePaginaEnlaces.ts` (evita literales/tipos
  repetidos, `docs/conventions.md`).
- Fix de lint (`oxlint`, regla `no-object-type-as-default-prop`): `fecha =
  new Date()` como valor por defecto de una prop desestructurada se
  recreaba en cada render; cambiado a `fecha` sin valor por defecto en la
  desestructuración + `fecha ?? new Date()` dentro del cuerpo de la función.
  Verificado con tests y lint tras el cambio: sigue verde.
- Añadido 1 test de refuerzo (`PieDePagina-logica.test.ts`) para la rama sin
  rótulo de `nombreEnlaceUrgencias`, ya explicado arriba.

Cada cambio de refactor se verificó re-ejecutando la suite completa de esta
feature (`pnpm exec vitest run src/components/PieDePagina.test.tsx
src/components/PieDePagina-logica.test.ts`) tras cada paso; nunca se
refactorizó en rojo.

## Trazabilidad @s → test

| Escenario | Test | Fichero |
| --- | --- | --- |
| @s1 | `hay exactamente un "contentinfo" con el nombre, la descripción exacta, logo decorativo y sin cifras inventadas` | `PieDePagina.test.tsx` |
| @s2 | `hay 3 "heading" con los nombres "Clínica", "Contenido" y "Contacto" en ese orden, cada uno seguido de una lista de 4 listitems con 1 link cada uno` | `PieDePagina.test.tsx` |
| @s3 | `los 4 enlaces son "Servicios", "Equipo", "Reservar cita" y "Galería"...` | `PieDePagina.test.tsx` |
| @s4 | `los 4 enlaces son "Blog", "Campañas", "Tienda" y "Preguntas frecuentes"...` | `PieDePagina.test.tsx` |
| @s5 | `contiene los tres teléfonos reales y "Cómo llegar", con destinos exactos y dígitos consistentes...` | `PieDePagina.test.tsx` |
| @s6 | `el nombre empieza por "Urgencias fuera de horario"...` | `PieDePagina.test.tsx` |
| @s7 | `la fuente única no declara email, no hay ningún "mailto:" ni "@" en el pie...` | `PieDePagina.test.tsx` |
| @s8 | `la fuente única declara una lista vacía, no hay heading ni lista "redes"/"Síguenos"...` | `PieDePagina.test.tsx` |
| @s9 | `hay exactamente 3 enlaces, con nombre y destino exactos, y ninguno es "#faq", "#" ni vacío` | `PieDePagina.test.tsx` |
| @s10 | `los 3 enlaces declaran target="_blank", rel con "noopener" y "noreferrer"...` | `PieDePagina.test.tsx` |
| @s11 | `con solo 2 páginas inyectadas, hay exactamente 2 enlaces...` | `PieDePagina.test.tsx` |
| @s12 | `para el 17 de agosto de 2026 el texto es exactamente "© 2026 Galapavet"...` (lógica) + `con la fecha del 17 de agosto de 2026, la barra inferior muestra exactamente "© 2026 Galapavet"` (render) | `PieDePagina-logica.test.ts` + `PieDePagina.test.tsx` |
| @s13 | `para el 1 de enero de 2027 el texto es exactamente "© 2027 Galapavet"...` (lógica) + `con la fecha del 1 de enero de 2027, la barra inferior muestra exactamente "© 2027 Galapavet"` (render) | `PieDePagina-logica.test.ts` + `PieDePagina.test.tsx` |
| @s14 | `ningún texto ni ningún destino del pie contiene ninguna cadena del prototipo heredado` | `PieDePagina.test.tsx` |
| @s15 | `renderizar con "91 851 13" (ocho dígitos) lanza con el valor recibido, y no llega a existir ningún enlace "tel:+34"` | `PieDePagina.test.tsx` |
| (refuerzo, no ligado a un `@s`) | `sin rótulo declarado, el nombre del enlace de urgencias es solo el teléfono, sin separador "·"` | `PieDePagina-logica.test.ts` |

Los 15 escenarios quedan cubiertos, ninguno sin test.

## Verificaciones "verde a la primera"

Cuatro escenarios pasaron sin escribir producción nueva en su propio ciclo
(@s6, @s7, @s8, @s14) o en una de sus dos partes (@s13-render). Para las dos
que dependían de lógica ya escrita en el ciclo anterior (@s6, @s13-lógica)
se verificó con sabotaje manual + reversión que el test realmente muerde
(documentado arriba, en cada ciclo). @s7/@s8/@s14 no dependen de ninguna
rama de producción existente (la ausencia es estructural, nunca se escribió
código para el caso contrario), así que no hay nada que sabotear: su
verificación es que el propio test ancla su premisa a la fuente real
(`datosNegocio.email`/`datosNegocio.redesSociales`), no a una suposición.

## Verificación final

- `pnpm exec vitest run src/components/PieDePagina.test.tsx
  src/components/PieDePagina-logica.test.ts` → **18/18 verde** (15 + 3).
- `pnpm run lint` (`oxlint --deny-warnings`) → limpio.
- `pnpm run typecheck` (`tsc -b`) → limpio.
- `pnpm run test` (suite completa del proyecto) → **294/294 verde**.
- `node .harness/harness.mjs init` → **verde de punta a punta**.

## Pendiente, no bloqueante

- El fichero de imagen local del logotipo (`/img/logo-galapavet.webp`) no
  existe aún en el repositorio — ruta provisional, mismo PENDIENTE ya
  documentado en `src/data/galeria.ts`/`src/data/campanas.ts`.
- Mutación (`mutation_tester`, umbral 1.0) y revisión (`judge`) quedan para
  las siguientes puertas del pipeline; esta ronda no marca `done`.
