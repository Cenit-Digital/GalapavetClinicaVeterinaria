# TDD — `campanas_portada` (id 9)

> Bitácora de `tdd_craftsman`. Feature `features/campanas_portada.feature`, 21
> escenarios (@s1-@s21) con Background compartido, aprobados junto con las
> otras 18 features del contrato reparado (ver `progress/current.md`).

## Aviso de colisión de escritura detectada durante esta sesión

Mientras se escribía esta misma bitácora, el fichero se sobrescribió en disco
con contenido que esta sesión **no escribió** (narrativa distinta: afirmaba
"195/195 tests" al arrancar y proponía **conservar** el borrador sin trazar
verificándolo por sabotaje, en vez de descartarlo). Coincide con el patrón ya
documentado en `progress/current.md` ("Incidente de sesión duplicada",
20/08/2026): otra sesión de Claude Code trabajando en paralelo sobre
`campanas_portada`. `tasklist` mostró 13 procesos `claude.exe` simultáneos al
detectarlo, sin forma fiable de distinguir cuáles son subagentes legítimos de
este mismo workflow. Esta sesión no tiene herramienta para terminar procesos
ajenos, así que **continúa con el mandato recibido explícitamente del
`craftsman_lead`** (descartar el borrador sin bitácora y reconstruir por TDD
estricto, mismo criterio que `galeria`) y dej a esta nota para que el
`craftsman_lead` decida si hace falta intervenir en el proceso, igual que
hizo con la colisión anterior. Verificado en el momento del aviso: los 3
ficheros originales del borrador (`CampanasPortada.tsx`, `src/data/campanas.ts`)
seguían borrados; solo `CampanasPortada.test.tsx` existía, con el contenido
exacto de @s1 escrito por esta sesión (no el de ninguna otra).

## Confirmación previa al primer test rojo

`node .harness/harness.mjs init` **no** estaba limpio de intentos previos al
arrancar la sesión: existían 3 ficheros sin trazar en git
(`src/components/CampanasPortada.tsx`, `src/components/CampanasPortada.test.tsx`,
`src/data/campanas.ts`), dejados por una sesión de Claude Code distinta que
trabajó en paralelo sobre este mismo repo y fue terminada por colisión (ver
`progress/current.md`, entrada "Incidente de sesión duplicada"). No existía
ningún `progress/tdd_campanas_portada.md` que documentara ciclos Rojo-Verde-
Refactor para ese código. El borrador cubría, como mucho, @s1-@s3 (una región
con encabezado, 3 tarjetas con título, estado "Demostración"), pero:

- No tenía ningún módulo `*-logica.ts`: toda la futura lógica de fallo cerrado
  ante precio/vigencia (@s9/@s10/@s18/@s19/@s20/@s21) y de descarte de
  entradas sin título (@s16/@s19/@s20) habría tenido que vivir directamente en
  el `.tsx`, violando el invariante 6 de `project-spec.md`
  (`logica-de-decision-en-modulo-puro-no-en-el-jsx`) y dejando esa lógica
  fuera del glob mordible de Stryker.
- El aviso de demostración (@s4), el `alt` vacío de la imagen (@s5), los
  enlaces de tarjeta y de acción a `/campanas` (@s11/@s12), el origen local de
  las imágenes (@s13) y las ausencias parciales/totales de datos válidos
  (@s14/@s15/@s16/@s17/@s18/@s21) no estaban implementados en absoluto.
- Sin bitácora que demuestre qué test rojo forzó cada línea del borrador, no
  hay forma de confiar en la disciplina Ley 1 de ese código (mismo argumento
  que `progress/tdd_galeria.md`, sección "Confirmación previa al primer test
  rojo").

**Decisión: descartar los 3 ficheros sin trazar y reconstruir la feature
entera por TDD estricto**, un test rojo a la vez, mismo criterio que
`galeria` (id 8). Los 3 ficheros se borraron antes de escribir ningún test:
`src/components/CampanasPortada.tsx`, `src/components/CampanasPortada.test.tsx`,
`src/data/campanas.ts`.

**El catálogo de datos de demo (`src/data/campanas.ts`) se conserva
conceptualmente** porque ya era correcto: tres entradas con los títulos
exactos "Vacunaciones", "Chequeo" y "Odontología" (literales de
`docs/datos-galapavet.md` §5, citados en la cabecera del propio `.feature`),
ninguna con `precio` ni `vigencia` declarados, con rutas de imagen locales
provisionales (`/img/campanas/*.webp`, mismo `PENDIENTE` que
`src/data/galeria.ts`: los ficheros concretos no existen aún en el
repositorio). Aun así, el fichero se **reescribe íntegro** como parte del
propio ciclo @s2, con su propio rojo documentado — no se copia tal cual del
borrador descartado, y el `interface CampanaDemo` se diseña de cero para lo
que @s9/@s10 exigen (campos `precio`/`vigencia` opcionales que
`construirModeloCampanas` rechaza si están presentes).

Antes del descarte, `node .harness/harness.mjs init`: **verde** — 195/195
tests (192 heredados de `galeria` + 3 del borrador de `CampanasPortada.test.tsx`,
@s1-@s3), lint y typecheck sin errores. Tras el descarte, antes del primer
test: **192/192**, lint y typecheck sin errores — confirma que ningún otro
módulo del proyecto dependía de los 3 ficheros borrados (`grep` recursivo sin
resultados).

### Nota de configuración fuera de `src/`

Ninguna. No se tocó `harness.config.json`, `stryker.config.json`,
`.oxlintrc.json` ni `tsconfig*.json` durante esta sesión.

## Diseño previo al primer ciclo (derivado de los `@s`, no anticipado)

- `src/data/campanas.ts` — catálogo de demo, `interface CampanaDemo { titulo,
  imagen?, precio?, vigencia? }` (los dos últimos campos existen solo para que
  `construirModeloCampanas` los rechace; el catálogo de producción real nunca
  los declara).
- `src/components/CampanasPortada-logica.ts` — módulo puro, mordible por
  mutación: `construirModeloCampanas(catalogo)` — para cada entrada, lanza si
  declara `precio` (@s9) o `vigencia` (@s10); descarta las de título vacío
  (@s16/@s19/@s20); devuelve `ModeloCampana[]` (`titulo`, `imagen?`, sin
  `precio` ni `vigencia`: el tipo de salida no puede exponer esos campos,
  @s6/@s7).
- `src/components/CampanasPortada.tsx` — solo cablea: intenta construir el
  modelo dentro de un `try/catch`; si lanza (dato inválido, @s18/@s21) o el
  modelo queda vacío (catálogo vacío @s15, o todos los títulos en blanco
  @s17), no renderiza nada — mismo modo de error "dato ausente → no se
  renderiza el bloque" que `Servicios`/`Equipo`/`Galeria`. Si no, `<section
  aria-label="Campañas de prevención" aria-describedby="...">` con `h2`,
  aviso, `<ul>` de tarjetas-enlace a `/campanas` y el enlace de acción "Ver
  campañas" a `/campanas`.

## Trazabilidad — ciclo a ciclo

### @s1 — La sección se anuncia como una región con su encabezado
- **Rojo:** `CampanasPortada.test.tsx` importa `./CampanasPortada`, no existe
  (se había borrado con el resto del borrador) → fallo de resolución de
  import (Ley 2).
- **Verde:** `CampanasPortada.tsx` mínimo: `<section aria-label="Campañas de
  prevención"><h2>Campañas de prevención</h2></section>`, sin props ni datos
  (ningún test los pedía todavía).
- Test: `@s1 la sección se anuncia como una región con su encabezado`

### @s2 — Se muestra una tarjeta por cada campaña del catálogo de demo
- **Rojo:** `within(region).getAllByRole('listitem')` no encontraba nada.
- **Verde:** se crea `src/data/campanas.ts` (catálogo `CAMPANAS_DEMO`, 3
  entradas, `interface CampanaDemo`) y se cablea `CAMPANAS_DEMO.map(...)` en
  un `<ul>` con `<li><h3>{titulo}</h3></li>` por entrada — este es el ciclo
  en el que el catálogo se reescribe íntegro, según lo acordado en la
  sección "Confirmación previa al primer test rojo".
- Test: `@s2 se muestra una tarjeta por cada campaña del catálogo de demo`

### @s3 — Cada tarjeta muestra su estado, y el único estado admitido es la marca de demostración
- **Rojo:** `within(tarjeta).getByText('Demostración')` no encontraba nada.
- **Verde:** `<span>Demostración</span>` fijo en cada tarjeta (no hay ningún
  campo de estado en el catálogo: el único valor admitido es este literal).
- Test: `@s3 cada tarjeta muestra su estado, y el único estado admitido es la marca de demostración`

### @s4 — El aviso de contenido de demostración es visible y describe la sección
- **Rojo:** `screen.getByText(AVISO_DEMOSTRACION)` (literal exacto, copiado a
  mano de la cabecera del `.feature` en el propio test — patrón
  `doble-de-test-anclado-al-literal-no-al-simbolo`) no encontraba nada.
- **Verde:** `<p id="campanas-aviso-demostracion">` con el literal exacto (el
  JSX de 3 líneas colapsa a espacios simples, sin alterar el texto) y
  `aria-describedby="campanas-aviso-demostracion"` en la `<section>`.
- Test: `@s4 el aviso de contenido de demostración es visible y describe la sección`

### @s5 — El nombre accesible de cada tarjeta lleva su título y la marca de demostración
- **Rojo:** `titulo.closest('a')` era `null` — no había ningún `<a>` todavía.
- **Verde:** se envuelve el contenido de cada tarjeta en `<a>` con `<img
  src={campana.imagen} alt="" />` (alt vacío a propósito, @s5 lo exige
  explícitamente), `<span>Demostración</span>` y `<h3>`. `oxlint`
  (`jsx-a11y/anchor-is-valid`) obligó a añadir `href="/campanas"` de
  inmediato para que el `<a>` fuera válido — el valor concreto lo verifica
  @s11, no este ciclo.
- Test: `@s5 el nombre accesible de cada tarjeta lleva su título y la marca de demostración`

### @s6 — Ninguna tarjeta muestra un precio
- **Verde a la primera** (nada en el código escribe «€», «EUR» ni «%»).
  Verificado por sabotaje manual: `<span>Demostración 49 € SABOTAJE_TEMPORAL</span>`
  → exactamente @s6 (más @s3, colateral porque cambia el texto exacto del
  estado) se puso en rojo. Revertido.
- Sin cambio de producción.
- La cláusula "ninguna tarjeta expone un campo de precio" no se testea con
  una aserción DOM adicional (no hay ningún atributo `data-precio` que
  pudiera existir o no): queda cubierta por la combinación de @s6 (el DOM
  nunca muestra «€»/«%») y @s9 (declarar `precio` hace fallar **toda** la
  construcción del modelo, no solo ese campo — es estructuralmente
  imposible que una tarjeta con precio sobreviva a `construirModeloCampanas`
  y llegue a renderizarse). Documentado aquí en vez de escribir una
  aserción vacía que no mordería ningún mutante real.
- Test: `@s6 ninguna tarjeta muestra un precio`

### @s7 — Ninguna tarjeta muestra fecha ni periodo de vigencia
- **Verde a la primera.** Verificado por sabotaje: `<span>Demostración Hasta
  el 30 de septiembre SABOTAJE_TEMPORAL</span>` → exactamente @s7 (+ @s3
  colateral) en rojo. Revertido.
- Sin cambio de producción. Misma nota que @s6 para "ninguna tarjeta expone
  un campo de vigencia": cubierta por @s7 (DOM) + @s10 (falla cerrado de
  toda la construcción).
- Test: `@s7 ninguna tarjeta muestra fecha ni periodo de vigencia`

### @s8 — Ninguna tarjeta afirma disponibilidad, escasez ni política comercial
- **Verde a la primera.** Verificado por sabotaje: `<span>Demostración
  Plazas limitadas SABOTAJE_TEMPORAL</span>` → exactamente @s8 (+ @s3
  colateral) en rojo. Revertido.
- Sin cambio de producción.
- Test: `@s8 ninguna tarjeta afirma disponibilidad, escasez ni política comercial`

### @s9 — Una campaña con precio hace fallar la construcción de la sección
- **Rojo:** `CampanasPortada-logica.test.ts` importa
  `construirModeloCampanas` de `./CampanasPortada-logica`, no existe → fallo
  de resolución de import.
- **Verde:** se crea `CampanasPortada-logica.ts` con
  `construirModeloCampanas(catalogo)`: recorre el catálogo y lanza
  `errorPrecioNoConfirmado` si una entrada declara `precio`; si no, devuelve
  el catálogo tal cual (mínimo para este rojo).
- Test: `@s9 una campaña con precio hace fallar la construcción de la sección`

### @s10 — Una campaña con vigencia hace fallar la construcción de la sección
- **Rojo:** con solo el chequeo de `precio`, una entrada con `vigencia` no
  lanzaba nada (`expected [Function] to throw an error` → recibido
  `undefined`).
- **Verde:** se añade el chequeo simétrico de `vigencia` con
  `errorVigenciaNoConfirmada`.
- Test: `@s10 una campaña con vigencia hace fallar la construcción de la sección`

### @s11 — Cada tarjeta entera enlaza a la página de campañas
- **Verde a la primera** (el `href="/campanas"` ya existía desde @s5, forzado
  por el linter). Verificado por sabotaje: `href="/campanas-sabotaje-temporal"`
  → exactamente @s11 en rojo. Revertido.
- Sin cambio de producción.
- Test: `@s11 cada tarjeta entera enlaza a la página de campañas`

### @s12 — El enlace de acción de la sección lleva a la página de campañas
- **Rojo:** `screen.getByRole('link', { name: 'Ver campañas' })` no
  encontraba nada — no existía ningún enlace de acción fuera de las
  tarjetas.
- **Verde:** `<a href="/campanas">Ver campañas</a>` tras el `<ul>`. Sin
  flecha decorativa: al no dibujarla, las cláusulas "no contiene 'activas'"
  y "no contiene '→'" quedan satisfechas por construcción, sin necesitar
  `aria-hidden` (Ley 3: no se añade lo que el rojo no pide).
- Test: `@s12 el enlace de acción de la sección lleva a la página de campañas`

### @s13 — Las imágenes de las tarjetas se sirven en local
- **Verde a la primera** (el catálogo real ya usa rutas locales
  `/img/campanas/*.webp` desde @s2). Verificado por sabotaje: entrada
  "Vacunaciones" con `imagen: 'https://images.pexels.com/sabotaje-temporal.webp'`
  → exactamente @s13 en rojo. Revertido.
- Sin cambio de producción.
- Test: `@s13 las imágenes de las tarjetas se sirven en local`

### @s14 — Una campaña sin imagen sigue mostrando su tarjeta
- **Rojo:** `renderizarCampanasPortada({ catalogo: [...] })` con un catálogo
  de una sola entrada seguía mostrando 3 tarjetas — el componente no
  aceptaba ningún prop `catalogo`, ignoraba el que le pasaba el test.
- **Verde:** se añade `CampanasPortadaProps.catalogo?` (por defecto
  `CAMPANAS_DEMO`) y se cablea `catalogo.map(...)`; el `<img>` pasa a
  renderizarse condicionalmente (`campana.imagen !== undefined && <img .../>`)
  para que una entrada sin `imagen` no rompa ni muestre una imagen rota.
- Test: `@s14 una campaña sin imagen sigue mostrando su tarjeta`

### @s15 — Con el catálogo de demo vacío no se renderiza la sección
- **Rojo:** con `catalogo: []`, la región seguía existiendo (ningún guardián
  de vacuidad todavía).
- **Verde:** `if (catalogo.length === 0) return null` al principio del
  componente (mismo patrón "dato ausente → no se renderiza el bloque" que
  `Servicios`/`Equipo`/`Galeria`).
- Test: `@s15 con el catálogo de demo vacío no se renderiza la sección`

### @s16 — Una campaña sin título se descarta y el resto se sigue mostrando
- **Rojo:** con 3 entradas (la del medio con `titulo: ''`), seguían
  renderizándose 3 tarjetas — el componente mapeaba `catalogo` directo, sin
  pasar por ningún filtro de validez.
- **Verde:** se extiende `construirModeloCampanas` para, tras los chequeos
  de precio/vigencia, `filter((campana) => campana.titulo.trim() !== '')`
  antes de devolver; el componente pasa a llamar
  `construirModeloCampanas(catalogo)` y a mapear `modelo` en vez de
  `catalogo` directamente, y el guardián de vacuidad de @s15 se generaliza
  de `catalogo.length === 0` a `modelo.length === 0` (forzado por este mismo
  rojo: con `catalogo=[]`, `construirModeloCampanas([])` sigue devolviendo
  `[]`, así que el guardián debía leer del resultado filtrado, no del
  catálogo crudo).
- Test: `@s16 una campaña sin título se descarta y el resto se sigue mostrando`

### @s17 — Si ninguna campaña del catálogo es válida no se renderiza la sección
- **Verde a la primera** (ya implicado por la generalización de @s16: con
  las 3 entradas de título vacío, `modelo.length === 0`). Verificado por
  sabotaje: `if (false) return null` en vez de `if (modelo.length === 0)
  return null` → tanto @s15 como @s17 se pusieron en rojo a la vez
  (confirma que ambos dependen del mismo guardián, no de una coincidencia).
  Revertido.
- Sin cambio de producción.
- Test: `@s17 si ninguna campaña del catálogo es válida no se renderiza la sección`

### @s18 — Un dato de campaña inválido deja la portada sin ninguna tarjeta de campaña
- **Rojo:** con una entrada `{ titulo: 'Vacunaciones', precio: '49 €' }`, el
  render lanzaba una excepción no capturada (`Error: La campaña
  "Vacunaciones" declara un precio no confirmado…`) que reventaba el árbol
  de React — el test fallaba por la excepción, no por una aserción.
- **Verde:** se añade `construirModeloSeguro(catalogo)` en `CampanasPortada.tsx`,
  que envuelve la llamada a `construirModeloCampanas` en un `try/catch` y
  devuelve `[]` si lanza; el componente pasa a usar `construirModeloSeguro`
  en vez de llamar a la función pura directamente. La función pura sigue
  lanzando de verdad (@s9/@s10 no se tocan: siguen probando
  `construirModeloCampanas` sin el envoltorio).
- Test: `@s18 un dato de campaña inválido deja la portada sin ninguna tarjeta de campaña`

### @s19 — El modelo de la sección de campañas descarta las entradas sin título
- **Verde a la primera** (el filtro ya existía desde @s16). Verificado por
  sabotaje: `catalogo.filter(() => true)` en vez del filtro real →
  exactamente @s19 (+ @s16/@s17, colaterales porque comparten la misma
  llamada) se pusieron en rojo. Revertido.
- Sin cambio de producción — es la prueba directa de unidad sobre la lógica
  pura que faltaba (hasta ahora solo se ejercitaba indirectamente vía el
  componente).
- Test: `@s19 el modelo de la sección de campañas descarta las entradas sin título`

### @s20 — El modelo de la sección de campañas queda vacío si ninguna entrada tiene título
- **Verde a la primera.** Verificado por sabotaje (mismo mecanismo que
  @s19): `catalogo.filter(() => true)` → @s19 y @s20 en rojo a la vez.
  Revertido.
- Sin cambio de producción.
- Test: `@s20 el modelo de la sección de campañas queda vacío si ninguna entrada tiene título`

### @s21 — Una vigencia inválida deja la portada sin ninguna tarjeta de campaña
- **Verde a la primera** (mismo `construirModeloSeguro` de @s18, genérico
  para cualquier excepción). Verificado por sabotaje, esta vez apuntado
  específicamente a la rama de vigencia: `if (false &&
  campana.vigencia !== undefined)` → @s10 y @s21 en rojo a la vez (y solo
  esos dos, confirmando que la rama de precio seguía intacta). Revertido.
- Sin cambio de producción.
- Test: `@s21 una vigencia inválida deja la portada sin ninguna tarjeta de campaña`

## Refactor final

Un único refactor en verde: `construirModeloCampanas` devolvía
`catalogo.filter(...) as CampanaDemo[]` con una aserción de tipo
innecesaria (`Array<T>.filter` sobre `readonly T[]` ya infiere `T[]`) —
eliminada. `pnpm run lint`, `pnpm run typecheck` y los 21 tests de
`CampanasPortada*` siguen en verde tras el cambio. Sin más refactor: ambos
ficheros de producción (`CampanasPortada.tsx`, 52 líneas;
`CampanasPortada-logica.ts`, 33 líneas) quedan ya mínimos tras cada ciclo,
sin duplicación ni funciones largas.

## Trazabilidad — mapa @s → test

| Escenario | Test |
| --- | --- |
| @s1 | `CampanasPortada.test.tsx` → `@s1 la sección se anuncia como una región con su encabezado` |
| @s2 | `CampanasPortada.test.tsx` → `@s2 se muestra una tarjeta por cada campaña del catálogo de demo` |
| @s3 | `CampanasPortada.test.tsx` → `@s3 cada tarjeta muestra su estado, y el único estado admitido es la marca de demostración` |
| @s4 | `CampanasPortada.test.tsx` → `@s4 el aviso de contenido de demostración es visible y describe la sección` |
| @s5 | `CampanasPortada.test.tsx` → `@s5 el nombre accesible de cada tarjeta lleva su título y la marca de demostración` |
| @s6 | `CampanasPortada.test.tsx` → `@s6 ninguna tarjeta muestra un precio` (+ @s9 para la cláusula de "campo de precio") |
| @s7 | `CampanasPortada.test.tsx` → `@s7 ninguna tarjeta muestra fecha ni periodo de vigencia` (+ @s10 para "campo de vigencia") |
| @s8 | `CampanasPortada.test.tsx` → `@s8 ninguna tarjeta afirma disponibilidad, escasez ni política comercial` |
| @s9 | `CampanasPortada-logica.test.ts` → `@s9 una campaña con precio hace fallar la construcción de la sección` |
| @s10 | `CampanasPortada-logica.test.ts` → `@s10 una campaña con vigencia hace fallar la construcción de la sección` |
| @s11 | `CampanasPortada.test.tsx` → `@s11 cada tarjeta entera enlaza a la página de campañas` |
| @s12 | `CampanasPortada.test.tsx` → `@s12 el enlace de acción de la sección lleva a la página de campañas` |
| @s13 | `CampanasPortada.test.tsx` → `@s13 las imágenes de las tarjetas se sirven en local` |
| @s14 | `CampanasPortada.test.tsx` → `@s14 una campaña sin imagen sigue mostrando su tarjeta` |
| @s15 | `CampanasPortada.test.tsx` → `@s15 con el catálogo de demo vacío no se renderiza la sección` |
| @s16 | `CampanasPortada.test.tsx` → `@s16 una campaña sin título se descarta y el resto se sigue mostrando` |
| @s17 | `CampanasPortada.test.tsx` → `@s17 si ninguna campaña del catálogo es válida no se renderiza la sección` |
| @s18 | `CampanasPortada.test.tsx` → `@s18 un dato de campaña inválido deja la portada sin ninguna tarjeta de campaña` |
| @s19 | `CampanasPortada-logica.test.ts` → `@s19 el modelo de la sección de campañas descarta las entradas sin título` |
| @s20 | `CampanasPortada-logica.test.ts` → `@s20 el modelo de la sección de campañas queda vacío si ninguna entrada tiene título` |
| @s21 | `CampanasPortada.test.tsx` → `@s21 una vigencia inválida deja la portada sin ninguna tarjeta de campaña` |

## Verificación final

`pnpm exec vitest run src/components/CampanasPortada.test.tsx
src/components/CampanasPortada-logica.test.ts`: **21/21** (17 de componente +
4 de lógica). `node .harness/harness.mjs init`: **verde** — lint sin errores,
typecheck sin errores, **213/213** tests (192 heredados + 21 nuevos).

## Pendiente antes de `done`

No se marca `done` en `feature_list.json` — falta `judge` y
`mutation_tester` (umbral 1.0 en `harness.config.json`). Ningún escenario de
esta feature queda fuera del gate de Vitest/Stryker (a diferencia de
`galeria`, aquí no hay scroll físico ni `matchMedia`): las 21 cláusulas son
medibles en jsdom.

## Nota de una segunda sesión concurrente (misma tarea, mismo intervalo)

Otra instancia de `tdd_craftsman`, lanzada de forma independiente con el
mismo encargo (`campanas_portada`, id 9), estuvo activa en paralelo a la que
escribió el resto de este fichero: verificó por sabotaje manual @s1-@s3 del
mismo borrador huérfano (mismo resultado: los 3 caían en rojo juntos, no
vacío) e intentó documentarlo aquí mismo, pero sus escrituras chocaron con
las de la sesión que ya tenía el mandato explícito del `craftsman_lead`
(ver `progress/current.md`, "Incidente de sesión duplicada") de descartar el
borrador y reconstruir desde cero. `tasklist` mostró 13 procesos
`claude.exe` en el momento de la colisión, sin forma de distinguir cuáles
son legítimos. Esta segunda instancia se retira sin tocar `src/` a partir de
aquí (su único cambio en `src/` fue el sabotaje-y-reversión ya descrito, que
no altera comportamiento) para no competir por escritura con la sesión que sí
tiene el diseño y el mandato correctos, y deja constancia aquí para que el
`craftsman_lead` decida si hace falta matar algún proceso adicional. No
declara `green` ni añade ningún ciclo propio: el trabajo real de
`@s4`-`@s21` queda a cargo de la otra instancia, cuyo diseño (sección
"Diseño previo al primer ciclo" de este mismo fichero) esta segunda sesión
revisó y considera correcto, sin objeciones.

## Ronda 2 — invocada por el `craftsman_lead`, sin cambios aplicados (bloqueada)

El `craftsman_lead` me reinvocó con el encargo: "ronda 2, el `judge` rechazó,
corrige exactamente lo que pide". Antes de tocar `src/`, releí la entrada más
reciente de `progress/judge_campanas_portada.md` completa, de punta a punta.

**Lo que hay realmente en el fichero, verificado línea a línea:** una única
entrada, `## Ronda 1 — 2026-08-20`, **Veredicto: APPROVED**, con la sección
final `## Cambios requeridos` conteniendo exactamente `Ninguno.`. No existe
ninguna sección `## Ronda 2` ni ningún veredicto `CHANGES_REQUESTED` /
`REJECTED` en el fichero. Confirmado que el fichero no cambió entre dos
lecturas consecutivas (misma longitud, mismo contenido) durante esta sesión,
así que no es un artefacto de estar leyendo a mitad de una escritura en
curso.

**Contexto que hace esto plausible, no ruido:** en el momento de esta
invocación, `tasklist` mostró **13 procesos `claude.exe` simultáneos** —
exactamente la misma cifra y el mismo patrón que las dos colisiones de
escritura ya documentadas en esta sesión para esta misma feature (ver
`progress/current.md`, "Incidente de sesión duplicada" y "Segunda colisión de
escritura... sobre `progress/tdd_campanas_portada.md`", y la sección de este
mismo fichero "Aviso de colisión de escritura detectada durante esta
sesión"). Es razonable sospechar que el `craftsman_lead` leyó (o recibió de
otra instancia de `judge` corriendo en paralelo) una versión de
`judge_campanas_portada.md` con un veredicto de rechazo real que después fue
sobrescrita en disco por la instancia que sí dejó su ronda 1 como APPROVED —
mismo mecanismo exacto que ya causó que la narrativa de descarte del borrador
se sobrescribiera a mitad de escritura durante la ronda 1 de esta bitácora.

**Por qué no invento la corrección:** la Ley 1 y el protocolo de este agente
exigen partir de un hallazgo real y concreto ("exactamente lo que pide" el
`judge`). No hay ningún "Cambios requeridos" que leer en el fichero actual:
la única entrada dice "Ninguno.". Adivinar qué pudo haber rechazado una
ronda 2 fantasma y tocar `src/` sobre esa base sería inventar alcance, algo
que este rol tiene prohibido explícitamente ("no inventas comportamiento" /
Ley 1: nada de producción sin un test rojo real que la pida).

**Estado verificado del código, sin tocar nada:** `node .harness/harness.mjs
init` corrido de nuevo por mí en este punto: **verde**, 213/213 tests
(20 ficheros), lint y typecheck sin errores — el mismo estado que certificó
la ronda 1 del `judge`. `feature_list.json` sigue con `campanas_portada`
(id 9) como única `in_progress`. No se ha modificado ningún fichero de
`src/` ni de test en esta ronda.

**Pido al `craftsman_lead`:** confirmar cuál es el veredicto real y vigente
de `judge` para esta feature — si el rechazo existe en algún otro artefacto
(otra ruta, otra instancia aún no consolidada) o si esta ronda 2 se disparó
sobre una lectura obsoleta que ya no aplica porque la ronda 1 quedó
APPROVED. Si hay una colisión de procesos activa (13 `claude.exe`
simultáneos, mismo patrón que las anteriores), puede que convenga repetir el
mismo procedimiento de saneamiento que se aplicó con `galeria` (confirmar
PID propio, terminar procesos ajenos con autorización explícita del usuario)
antes de reintentar esta ronda.

## Ronda 3 — refuerzo de mutación (`mutation_tester` ronda 1: FAIL, 18/21 = 85.71%)

Encargo del `craftsman_lead`: la medición oficial de mutación
(`progress/mutation_campanas_portada.md`, entrada única) dio **FAIL** sobre
`src/components/CampanasPortada-logica.ts` — 18/21 mutantes, 3
supervivientes, 0 timeouts. Se lee esa entrada completa antes de tocar nada
(sección "Mutantes sobrevivientes").

**Los 3 mutantes, verificados no equivalentes por el propio informe** (los
tres cambian comportamiento observable real): dos por la misma causa raíz
(`toThrowError(regex)` no distingue "lanzó un `Error` con mensaje X" de
"lanzó `undefined`", porque el matcher solo compara el mensaje si hay un
valor capturado truthy) y uno por ausencia de un caso "título solo
espacios" que ejercite `.trim()`.

**Decisión: reforzar solo tests, sin tocar producción.** Ninguno de los 3
hallazgos es un bug de comportamiento real del código actual (que sí
devuelve `Error` con mensaje y sí usa `.trim()`); son huecos de aserción que
dejarían pasar una regresión futura sin detectarla. Mismo criterio que
`datos_negocio` (9 mutantes, 0 producción) y `galeria` (1 mutante, aserción
de apoyo).

### R3.1 — mutante id 0 (`errorPrecioNoConfirmado` → bloque vacío, `throw undefined`)

- Test nuevo en `CampanasPortada-logica.test.ts`, dentro del `describe` de
  `@s9`: captura el valor lanzado por `try/catch` y asegura explícitamente
  `expect(lanzado).toBeInstanceOf(Error)` + el mensaje exacto por
  igualdad (`.toBe(...)`), no por patrón regex.
- **Verificación por sabotaje manual** (reproduce el mutante exacto citado
  en el informe): `errorPrecioNoConfirmado` reescrita para devolver
  `undefined as unknown as Error` en vez de `new Error(...)`. Confirmado:
  **exactamente** el nuevo test se pone en rojo (`expected undefined to be
  an instance of Error`), los otros 6 de ese fichero siguen en verde.
  Revertido byte a byte; `git diff` sobre el fichero de producción confirma
  0 cambios netos tras el ciclo.

### R3.2 — mutante id 2 (`errorVigenciaNoConfirmada` → bloque vacío, `throw undefined`)

- Mismo patrón que R3.1, simétrico, dentro del `describe` de `@s10`.
- **Verificación por sabotaje manual**: `errorVigenciaNoConfirmada`
  reescrita igual que en R3.1. Confirmado: exactamente el nuevo test de
  `@s10` se pone en rojo, el resto en verde. Revertido; `git diff` sin
  cambios netos.

### R3.3 — mutante id 19 (`catalogo.filter(titulo.trim() !== '')` → sin `.trim()`)

- Test nuevo dentro del `describe` de `@s19`: catálogo con una entrada de
  título `'   '` (solo espacios), junto a dos títulos válidos; asegura que
  el modelo sigue teniendo longitud 2 y descarta la de solo espacios, igual
  que descarta la cadena vacía.
- **Verificación por sabotaje manual**: `catalogo.filter((campana) =>
  campana.titulo !== '')` en vez de `.trim() !== ''` (mutante id 19 citado
  literalmente). Confirmado: exactamente el nuevo test se pone en rojo
  (`expected length 2 but got 3`), los otros 23 tests de los dos ficheros
  `CampanasPortada*` siguen en verde. Revertido; `git diff` sin cambios
  netos.

### Verificación final de la ronda

`git diff src/components/CampanasPortada-logica.ts`: **vacío** — cero
cambios de producción en esta ronda, tal como exige la Ley 1 (los 3
hallazgos eran huecos de aserción, no defectos de comportamiento).

`pnpm exec vitest run src/components/CampanasPortada-logica.test.ts`:
**7/7** (4 originales + 3 nuevos). `node .harness/harness.mjs init`:
**verde** — lint sin errores, typecheck sin errores, **216/216** tests (213
previos + 3 nuevos).

### Trazabilidad — mapa mutante → test (ronda 3)

| Mutante (informe oficial) | Test que lo mata |
| --- | --- |
| id 0, `CampanasPortada-logica.ts:9`, `errorPrecioNoConfirmado` → bloque vacío | `@s9` → `lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío` |
| id 2, `CampanasPortada-logica.ts:13`, `errorVigenciaNoConfirmada` → bloque vacío | `@s10` → `lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío` |
| id 19, `CampanasPortada-logica.ts:33`, quita `.trim()` | `@s19` → `descarta también un título compuesto solo por espacios en blanco, no solo la cadena vacía` |

### Pendiente antes de `done`

No se marca `done` — falta que `mutation_tester` repita la medición oficial
sobre `src/components/CampanasPortada-logica.ts` y confirme 21/21 = 100%
(o, si algún mutante sigue sobreviviendo por otra razón, un nuevo hallazgo
concreto). El `judge` ya había aprobado la ronda 1 sin cambios requeridos;
esta ronda no toca ningún fichero que el `judge` ya revisara salvo el de
test, así que no debería requerir una relectura completa, pero queda a
criterio del `craftsman_lead`.
