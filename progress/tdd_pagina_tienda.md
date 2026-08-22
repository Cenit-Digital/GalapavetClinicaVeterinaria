# TDD — pagina_tienda (id 18)

> Feature más grande del proyecto hasta ahora: 44 escenarios (@s1-@s44),
> lógica de negocio más intrincada (aritmética de dinero en céntimos
> enteros, diálogo modal WAI-ARIA APG real, guardas de cantidad). TDD
> estricto, un ciclo Rojo-Verde-Refactor por escenario o grupo de
> aserciones estrechamente relacionadas, ejecutado de principio a fin en
> esta sesión (ronda 1).

## Entregables

- `src/data/tienda.ts` — `ProductoDemo` (nombre, categoría, `importeCentimos`
  **ya en céntimos enteros**, imagen local), `CATEGORIAS_TIENDA` (las 4
  categorías fijas del cliente, `docs/datos-galapavet.md` §6) y
  `PRODUCTOS_DEMO` (los 8 productos literales del Background del `.feature`,
  transcritos carácter a carácter; cada importe en euros del Background se
  convirtió UNA VEZ a mano a céntimos enteros, con el euro original anotado
  en comentario junto a cada literal, para trazabilidad — nunca se parsea
  una cadena "12,50 €" en tiempo de ejecución).
- `src/pages/PaginaTienda-logica.ts` — módulo puro, mordible por Stryker:
  - `construirCatalogoTienda` (valida categoría publicada e importe válido,
    falla cerrado lanzando; descarta en silencio los nombres vacíos/en
    blanco).
  - `formatearImporte` (`Intl.NumberFormat('es-ES', { style: 'currency',
    currency: 'EUR' })`, verificado con Node antes de escribir el primer
    test — produce exactamente coma decimal, dos decimales siempre,
    agrupación "min2" y espacio duro U+00A0 antes de "€").
  - `filtrarProductosPorCategoria`.
  - Reducer de cesta: `EstadoCesta`/`LineaCesta`, `TOPE_UNIDADES_POR_LINEA`
    (99), `alcanzoTopeUnidades`, `anadirUnidad` (clampa, nunca lanza),
    `quitarUnidad` (elimina la línea al llegar a 0), `fijarCantidad` (0 =
    eliminar; negativo/fraccionario/no-numérico = lanza "cantidad
    inválida", deja el estado intacto), `eliminarLinea`, `vaciarCesta`.
  - `calcularResumenCesta` (suma en céntimos enteros; descarta líneas cuyo
    identificador no existe en el catálogo, sin lanzar; da 0/0/"0,00 €"
    sobre estado vacío).
  - `formatearContadorArticulos` (singulariza solo en 1),
    `rotuloBotonAnadir`/`nombreAccesibleBotonAnadir`.
- `src/pages/PaginaTienda.tsx` — solo cablea: filtro de categorías
  (`aria-pressed`), rejilla de productos (con estados vacíos de
  categoría/catálogo), botón "Ver la cesta" + región de estado
  (`<output>`) para el contador, y `PanelCesta`: diálogo modal real
  (`<dialog>` nativo, `aria-modal="true"`, `aria-labelledby` → h2 "Tu
  cesta", foco al contenedor al abrir, Escape cierra y devuelve el foco al
  botón que lo abrió, vía un listener de `document` en `useEffect`
  — no un `onKeyDown` en un elemento no interactivo, por la regla oxlint
  `jsx-a11y/no-noninteractive-element-interactions`).
- Router: `/tienda` aterriza su propia `<Route>` en `App.tsx` (ver diff
  abajo). `RUTAS_DE_SUBPAGINA` (`App-logica.ts`) queda **vacía** —
  resultado correcto y esperado, no un bug: ya no queda ninguna subpágina
  de `navegacion.ts` sin su propia página.

## Diseño de la aritmética de dinero (núcleo de la feature)

- El catálogo declara `importeCentimos` como entero (nunca un string en
  euros ni un float). No hace falta ninguna función de parseo aparte: la
  conversión "12,50 € → 1250 céntimos" se hizo una sola vez, a mano, al
  escribir el catálogo, con el euro original dejado en comentario junto a
  cada literal — trazabilidad sin reintroducir el riesgo de parsear texto
  en tiempo de ejecución.
- `calcularResumenCesta` suma `producto.importeCentimos * linea.cantidad`
  (entero × entero = entero) y reduce con `+` sobre enteros — nunca suma
  euros en coma flotante. `formatearImporte` divide por 100 **una sola vez,
  al formatear**, nunca durante la acumulación (@s32: verificado
  céntimo a céntimo contra la suma real de los tres subtotales mostrados).
- `Intl.NumberFormat('es-ES', ...)` se verificó ejecutándolo con Node antes
  de escribir el primer test de formato (ver transcript de la sesión):
  confirma coma decimal, dos decimales siempre, agrupación de millares
  "min2" (desde 5 cifras enteras) y el espacio dado por el propio motor de
  ICU es el espacio duro U+00A0 — comprobado con `codePointAt`, no asumido.
- Cantidad 0 en `fijarCantidad` → elimina la línea (@s34). Cantidad
  negativa, fraccionaria o no numérica → lanza `cantidad inválida` y deja
  el estado intacto (@s35/@s36): nunca `Math.max(0, …)`. El tope de 99 es
  una guarda de interfaz (`TOPE_UNIDADES_POR_LINEA`), aplicada solo en
  `anadirUnidad` (la única operación que el contrato pide topar,
  @s27/@s43); `fijarCantidad` no la aplica porque ningún escenario se lo
  pide (Ley 3).

## Trazabilidad @s → test

| @s | Escenario (resumen) | Test(s) |
| -- | -------------------- | ------- |
| @s1 | h1 "Tienda", región "Catálogo", aviso exacto, descripción accesible | `PaginaTienda.test.tsx` → `@s1 la página se anuncia...` |
| @s2 | Sin formulario, sin campos de tarjeta, sin cadenas de pago, sin controles "pagar/comprar" | `PaginaTienda.test.tsx` → `@s2 no hay pasarela de pago...` (verde a la primera, ver nota) |
| @s3 | Ningún importe rotulado como precio real, sin "%" ni cadenas de oferta/IVA | `PaginaTienda.test.tsx` → `@s3 ningún importe...` (verde a la primera) |
| @s4 | Sin "24 h" ni reclamos del prototipo heredado | `PaginaTienda.test.tsx` → `@s4 la página no repite...` (verde a la primera) |
| @s5 | Exactamente 8 imágenes locales, sin pexels, alt vacío | `PaginaTienda.test.tsx` → `@s5 ninguna imagen...` |
| @s6 | 5 controles de filtro, orden exacto | `PaginaTienda.test.tsx` → `@s6 los filtros son las cuatro categorías...` |
| @s7 | Sin categorías inventadas, sin filtro con nombre distinto de los 5 | `PaginaTienda.test.tsx` → `@s7 ninguna categoría inventada...` (verde a la primera) |
| @s8 | Filtro activo "Todos" al cargar, 8 tarjetas | `PaginaTienda.test.tsx` → `@s8 al cargar la página...` |
| @s9 | Filtrar reduce la rejilla | `PaginaTienda.test.tsx` → `@s9 filtrar por una categoría...`; `PaginaTienda-logica.test.ts` → `filtrarProductosPorCategoria` |
| @s10 | Categoría sin productos → estado vacío | `PaginaTienda.test.tsx` → `@s10 una categoría real sin ningún producto...`; `PaginaTienda-logica.test.ts` → `filtrarProductosPorCategoria` (caso vacío) |
| @s11 | Catálogo vacío → 4 categorías siguen, "Ver la cesta, 0 artículos" | `PaginaTienda.test.tsx` → `@s11 con el catálogo de demostración vacío...` |
| @s12 | Cambiar de filtro no toca la cesta | `PaginaTienda.test.tsx` → `@s12 cambiar de filtro no toca la cesta` (verde a la primera) |
| @s13 | 8 h2, pares producto/categoría en orden, "de ejemplo" en cada nombre | `PaginaTienda.test.tsx` → `@s13 cada tarjeta declara su producto...` |
| @s14 | Importe de ejemplo con formato fijado, en orden | `PaginaTienda.test.tsx` → `@s14 cada tarjeta muestra su importe...` |
| @s15 | Producto sin nombre se descarta, resto se muestra | `PaginaTienda.test.tsx` → `@s15 un producto de demostración sin nombre...`; `PaginaTienda-logica.test.ts` → `construirCatalogoTienda` (nombre vacío/blanco) |
| @s16 | Categoría no publicada → falla la construcción, 0 tarjetas | `PaginaTienda-logica.test.ts` → `@s16 ...`; `PaginaTienda.test.tsx` → `@s16 ...no se renderiza ninguna tarjeta` |
| @s17 | Importe inválido (negativo / no entero) → falla la construcción | `PaginaTienda-logica.test.ts` → `@s17 ...` (2 tests); `PaginaTienda.test.tsx` → `@s17 ...no se renderiza ninguna tarjeta` |
| @s18 | Cesta vacía: mensaje exacto, 0 líneas, total 0,00 €, sin "Vaciar", salida deshabilitada | `PaginaTienda.test.tsx` → `@s18 la cesta arranca vacía...` |
| @s19 | Añadir crea línea con 1 unidad, no abre diálogo | `PaginaTienda.test.tsx` → `@s19 añadir un producto crea su línea...` |
| @s20 | Añadir dos veces suma unidades en una línea | `PaginaTienda.test.tsx` → `@s20 añadir dos veces el mismo producto...` (verde a la primera) |
| @s21 | Total de varias líneas = suma de subtotales | `PaginaTienda.test.tsx` → `@s21 el total de varias líneas...` |
| @s22 | Botón de tarjeta refleja unidades ya en la cesta | `PaginaTienda-logica.test.ts` → `@s22 ...`; `PaginaTienda.test.tsx` → `@s22 el botón de la tarjeta refleja...` (verde a la primera) |
| @s23 | Contador anunciado (`role="status"`), singular/plural | `PaginaTienda.test.tsx` → `@s23 el contador de la cesta se anuncia...` |
| @s24 | Aumentar unidad recalcula subtotal y total | `PaginaTienda.test.tsx` → `@s24 aumentar una unidad...` |
| @s25 | Quitar unidad recalcula subtotal y total | `PaginaTienda.test.tsx` → `@s25 quitar una unidad...` |
| @s26 | Quitar la última unidad elimina la línea entera | `PaginaTienda.test.tsx` → `@s26 quitar una unidad cuando solo queda una...`; `PaginaTienda-logica.test.ts` → `quitarUnidad` (caso 1→0) |
| @s27 | Tope de 99 por línea, `aria-disabled` | `PaginaTienda.test.tsx` → `@s27 la cantidad por línea no pasa de 99` (verde a la primera, sabotaje manual verificado); `PaginaTienda-logica.test.ts` → `alcanzoTopeUnidades`/`anadirUnidad` |
| @s28 | Controles de cantidad únicos, con el nombre del producto | `PaginaTienda.test.tsx` → `@s28 los controles de cantidad identifican su producto...` (verde a la primera) |
| @s29 | Eliminar línea la saca entera, deja las demás intactas | `PaginaTienda.test.tsx` → `@s29 eliminar una línea la saca entera...` |
| @s30 | Eliminar la única línea vuelve la cesta a vacía | `PaginaTienda.test.tsx` → `@s30 eliminar la única línea...` |
| @s31 | Vaciar borra todas las líneas de una vez | `PaginaTienda.test.tsx` → `@s31 vaciar la cesta borra todas las líneas...` |
| @s32 | Total = suma exacta de subtotales, céntimo a céntimo | `PaginaTienda-logica.test.ts` → `@s32/@s37/@s38 calcularResumenCesta...` (caso @s32); `PaginaTienda.test.tsx` → `@s21`/`@s32`-equivalente en `@s3` |
| @s33 | Formato exacto: 2 decimales, coma, espacio duro, agrupación "min2" | `PaginaTienda-logica.test.ts` → `@s33 formatearImporte...` (8 casos `it.each` + verificación del espacio duro) |
| @s34 | Fijar cantidad a 0 elimina la línea | `PaginaTienda-logica.test.ts` → `@s34 fijarCantidad a 0...` |
| @s35 | Cantidad negativa se rechaza, cesta intacta | `PaginaTienda-logica.test.ts` → `@s35 una cantidad negativa...` |
| @s36 | Cantidad no entera (1,5 / texto / NaN) se rechaza | `PaginaTienda-logica.test.ts` → `@s36 una cantidad que no es un entero...` (`it.each` 3 casos) |
| @s37 | Línea con identificador inexistente se descarta sin reventar | `PaginaTienda-logica.test.ts` → `@s32/@s37/@s38 calcularResumenCesta...` (caso @s37) |
| @s38 | Resumen de cesta sin líneas es 0, no vacío/indefinido | `PaginaTienda-logica.test.ts` → `@s32/@s37/@s38 calcularResumenCesta...` (caso @s38) |
| @s39 | Diálogo modal real, nombre accesible "Tu cesta", foco dentro | `PaginaTienda.test.tsx` → `@s39 el panel de la cesta se abre como un diálogo modal...` |
| @s40 | Escape cierra y devuelve el foco al botón de la cesta | `PaginaTienda.test.tsx` → `@s40 la tecla Escape cierra el panel...` (sabotaje manual verificado: ver bitácora) |
| @s41 | Única salida "Consultar disponibilidad", destino "/#contacto", sin otro control de salida | `PaginaTienda.test.tsx` → `@s41 la única salida de la cesta...` |
| @s42 | La cesta no persiste; sin escritura en almacenamiento | `PaginaTienda.test.tsx` → `@s42 la cesta no persiste...` (espía sobre `Storage.prototype.setItem`) |
| @s43 | `anadirUnidad` nunca pasa de 99, no lanza | `PaginaTienda-logica.test.ts` → `@s19/@s20/@s43 anadirUnidad...` (casos @s43) |
| @s44 | `formatearContadorArticulos` singulariza solo en 1 | `PaginaTienda-logica.test.ts` → `@s44 formatearContadorArticulos...` (`it.each` 4 casos) |

Total: **44/44 escenarios cubiertos**. 79 tests nuevos (44 en
`PaginaTienda-logica.test.ts`, 35 en `PaginaTienda.test.tsx`) + ajuste neto
de -1 en `App.test.tsx` (se retira el `it.each(['/tienda'])` del catch-all,
que ya no tiene ningún caso que enumerar) + 0 cambios de conteo en
`App-logica.test.ts` (mismo test, literal actualizado). 484 → 562 tests
totales del proyecto.

### Nota sobre los "verde a la primera"

Varios escenarios (@s2, @s3, @s4, @s7, @s12, @s20, @s22, @s27, @s28)
pasaron sin necesitar producción nueva en el momento de escribirlos, porque
ya estaban satisfechos por la implementación construida para escenarios
anteriores (p. ej. @s22 quedó resuelto por `nombreAccesibleBotonAnadir`/
`rotuloBotonAnadir`, ya construidos para @s19/@s20; @s27/@s40 quedaron
satisfechos por `alcanzoTopeUnidades` y el listener de Escape ya cableados).
Siguiendo el patrón `verde-por-vacuidad-en-puerta-de-verificacion` de la
memoria organizacional, los dos casos de mayor riesgo (@s27 y @s40) se
verificaron con sabotaje manual explícito durante esta sesión: se rompió a
mano la condición exacta que el escenario exige (`aria-disabled={false}`
fijo, y `evento.key === 'NuncaCoincide'` en vez de `'Escape'`) y se
confirmó que el test correspondiente se ponía rojo antes de revertir el
sabotaje — ningún test de esta lista es una tautología.

## Router: diff exacto de `App.tsx` / `App-logica.ts` / `App.test.tsx`

`App.tsx` — añade el import y la `<Route>` real de `/tienda`, en el mismo
punto donde ya viven `/campanas` y `/blog`:

```diff
+import { PaginaTienda } from './pages/PaginaTienda'
...
         <Route path="/blog" element={<PaginaBlog />} />
         <Route path="/blog/:identificador" element={<PaginaBlog />} />
+        <Route path="/tienda" element={<PaginaTienda />} />
         {RUTAS_DE_SUBPAGINA.map((ruta) => (
```

`App-logica.ts` — `/tienda` se añade a `RUTAS_YA_CON_PAGINA_PROPIA`:

```diff
-const RUTAS_YA_CON_PAGINA_PROPIA: ReadonlySet<string> = new Set(['/campanas', '/blog'])
+const RUTAS_YA_CON_PAGINA_PROPIA: ReadonlySet<string> = new Set(['/campanas', '/blog', '/tienda'])
```

Consecuencia (esperada, no un bug): `RUTAS_DE_SUBPAGINA` —
`ENLACES_NAVEGACION` filtrado de anclas y de rutas ya con página propia —
queda **vacía**, porque las 3 subpáginas de `navegacion.ts` (`/campanas`,
`/blog`, `/tienda`) ya tienen las tres su propia `<Route>` real. No quedan
subpáginas pendientes de aterrizar.

`App-logica.test.ts` — el test que ancla el valor exacto de
`RUTAS_DE_SUBPAGINA` (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`)
pasa de esperar `['/tienda']` a esperar `[]`, con el mismo literal escrito
a mano (nunca se compara contra `ENLACES_NAVEGACION` importado):

```diff
-    expect(RUTAS_DE_SUBPAGINA).toEqual(['/tienda'])
+    expect(RUTAS_DE_SUBPAGINA).toEqual([])
```

Verificado en ROJO antes del cambio de producción (fallaba con
`[ '/tienda' ]` recibido contra `[]` esperado) y en VERDE después.

`App.test.tsx` — el bloque `describe('@s12 la ruta /tienda sirve el
catch-all...')`, que hacía `it.each(['/tienda'])(...)`, se retira: ya no
queda ninguna ruta conocida de `navegacion.ts` que sirva ese catch-all
(reemplazado por un comentario explicativo, sin ningún `it`/`it.each` con 0
casos). El resto del fichero **no se toca**:

- `@s7` (shell común) sigue iterando sobre `['/', '/campanas', '/blog',
  '/tienda']` sin cambio de código — ahora ejercita la página real en vez
  del catch-all, y sigue en verde porque `PaginaTienda` también renderiza
  dentro del mismo `<main>` del shell.
- `@s12 refuerzo` (verifica que `App` registra un `<Route>` explícito, no
  solo el comodín "*") sigue esperando `'/tienda'` en la lista de paths
  registrados — ahora lo encuentra en la `<Route>` literal en vez de en el
  `.map()` de `RUTAS_DE_SUBPAGINA`, y sigue en verde sin tocar ese test.
- `@s13` (catch-all GENÉRICO para rutas no registradas en absoluto, p. ej.
  `/esto-no-existe`) **no se toca**: sigue vigente y cubierto, tal como
  pide el encargo de esta sesión.

Verificado en vivo: confirmé el ROJO real de `@s12 la ruta /tienda sirve
el catch-all...` justo después de añadir la `<Route>` a `App.tsx` y ANTES
de tocar el test (mensaje: no encontraba el heading "Página no encontrada"
porque ya se renderizaba `PaginaTienda`), y el VERDE de los 14 tests de
`App.test.tsx` + `App-logica.test.ts` tras el ajuste. `features/
ensamblaje_landing.feature` **no se toca** en esta sesión — esa
sincronización de contrato la hace el `craftsman_lead` al cierre, mismo
patrón que `pagina_campanas`/`pagina_blog`.

## Verificación final

- `pnpm run lint` (oxlint --deny-warnings): limpio.
- `pnpm run typecheck` (tsc -b): limpio.
- `pnpm run test` (vitest run): **562/562 tests, 40 ficheros, verde**
  (baseline antes de esta feature: 484/38).
- `node .harness/harness.mjs init`: **verde de punta a punta**.

## Decisiones de diseño tomadas dentro del contrato (sin desviarse de él)

- El identificador de línea de cesta es el `nombre` del producto (no se
  inventa un campo `id` nuevo): el Background y todos los escenarios
  refieren los productos por su nombre literal, y el nombre es único en
  las 8 entradas del catálogo de demostración — a diferencia de
  `pagina_campanas`, aquí ningún escenario exige una URL con identificador,
  así que no hay necesidad de un campo adicional que el `.feature` no pide.
- "Vaciar la cesta" y el resto de controles de línea (Quitar/Añadir/
  Eliminar) solo existen dentro de `<li>` cuando la cesta tiene contenido
  (`cestaVacia` los omite enteros), igual que el patrón ya usado en
  `PaginaBlog`/`PaginaCampanas` para bloques condicionales.
- El diálogo modal usa el elemento nativo `<dialog open>` (no `<div
  role="dialog">`): oxlint (`jsx-a11y/prefer-tag-over-role`) exige el tag
  semántico cuando existe, y el manejo de Escape se hizo con un listener de
  `document` dentro de `useEffect` (no `onKeyDown` en el propio `<dialog>`)
  para no disparar `jsx-a11y/no-noninteractive-element-interactions`. No se
  llamó a `.showModal()` imperativo (que además bloquearía interacción con
  el resto de la página de un modo que ningún escenario pide) — el
  contrato ARIA que los escenarios verifican (`role`, `aria-modal`, nombre
  accesible, gestión de foco propia) se satisface igual declarando los
  atributos a mano.
- No se añadió ningún botón "cerrar" (×) visible en el panel: ningún
  escenario lo pide (@s39/@s40 solo prueban apertura por clic y cierre por
  Escape) y @s41 afirma explícitamente que "el panel no ofrece ningún otro
  control de salida" — añadir uno sin un `@s` que lo exija habría violado
  la Ley 1.
- No se marca la página `/tienda` como activa en `Cabecera` con ningún
  mecanismo nuevo: `Cabecera-logica.ts` → `esPaginaActual` ya es genérico
  sobre cualquier `destino`/`rutaActual` (construido para `pagina_campanas`)
  y automáticamente marcará `aria-current="page"` en el enlace "Tienda" en
  cuanto `App.tsx` navegue a `/tienda`, sin ningún cambio de código
  adicional — no hay ningún `@s` en `pagina_tienda.feature` ni en
  `cabecera_y_navegacion.feature` que pida verificarlo explícitamente para
  esta página (el `.feature` declara la cabecera "fuera de alcance"), así
  que no se escribió ningún test nuevo para ello (Ley 1: nada que un test
  rojo no pida).

## Ronda 2 (refuerzo tras `judge`, CHANGES_REQUESTED en ronda 1)

`progress/judge_pagina_tienda.md` rechazó la ronda 1 con 2 hallazgos
concretos (ver "Cambios requeridos" de ese informe). Esta ronda aplica
**solo** esos dos cambios — nada más se reescribe. Los 44/44 escenarios y
los 79 tests de la ronda 1 no se tocan salvo donde el propio hallazgo lo
exige.

### Cambio 1 — Espacio duro U+00A0 en las 16 aserciones `getByText('...€')` de `PaginaTienda.test.tsx`

Hallazgo del `judge`: las 16 aserciones de importe exacto (líneas 251, 252,
253, 254, 272, 273, 274, 291, 292, 311, 330, 331, 392, 414, 434 y 615)
usaban espacio ASCII (U+0020) antes de "€" en vez del espacio duro U+00A0
que exige la cabecera del `.feature` (líneas 58-63) y el Then de cada
escenario — pasaban solo porque el normalizador por defecto de Testing
Library colapsa cualquier `\s+` (incluido U+00A0) a un espacio ASCII antes
de comparar.

**Verificación previa (no TDD, diagnóstico):** sustituir a mano el literal
de las 16 aserciones por el espacio duro U+00A0 (sin tocar nada más) hizo
que las 9 pruebas afectadas se pusieran **rojas** — no en verde como cabría
esperar de una simple corrección cosmética. Diagnóstico: el normalizador de
`getDefaultNormalizer` normaliza el texto EXTRAÍDO DEL DOM (colapsando su
U+00A0 real a un espacio ASCII) pero **no normaliza el literal que se le
pasa como matcher** (`matches()` en
`@testing-library/dom/dist/matches.js` hace
`normalizer(textToMatch) === String(matcher)`, nunca
`normalizer(matcher)`). Es decir: con el matcher por defecto, la fidelidad
byte a byte que pide el `.feature` es **estructuralmente imposible** de
verificar — el lado del DOM siempre queda reducido a ASCII, así que un
matcher con U+00A0 nunca puede coincidir, pase lo que pase en producción.

**Fix real (mínimo, sin tocar producción):** añadir `{ collapseWhitespace:
false }` como segundo argumento de cada una de las 16 llamadas a
`getByText(...)`, opción nativa y documentada de Testing Library que
desactiva el colapso de espacios en el texto extraído del DOM (deja
`trim()` activo, que no afecta a un U+00A0 interno, solo a los bordes).
Con esa opción, la comparación es de verdad byte a byte contra el texto
real que produce `formatearImporte`.

**Verificado con sabotaje manual** (ver bitácora de esta sesión): se
modificó temporalmente `formatearImporte` para sustituir el U+00A0 real por
un espacio ASCII antes de devolver el texto (`.replace(/ /g, ' ')`).
Con el sabotaje activo, `pnpm exec vitest run
src/pages/PaginaTienda.test.tsx` dio **10 tests en rojo** (las 9 pruebas
que contienen las 16 aserciones corregidas, más `@s14`, que ya usaba el
espacio duro correcto vía `toEqual(elemento.textContent)` desde la ronda 1
y por tanto también detecta el mismo defecto por su cuenta). Revertido el
sabotaje, `pnpm exec vitest run src/pages/PaginaTienda.test.tsx` volvió a
**35/35 verde**. Las 16 aserciones ya no son vacías: si `formatearImporte`
regresara al espacio ASCII del prototipo heredado, el test lo cazaría.

No se tocó `src/pages/PaginaTienda-logica.ts` para este cambio:
`formatearImporte` ya emitía el espacio duro U+00A0 desde la ronda 1
(verificado en @s33), el defecto vivía solo en la fidelidad del test.

### Cambio 2 — Atrapa-foco real en `PanelCesta` (patrón Modal Dialog WAI-ARIA APG)

Hallazgo del `judge`: el diálogo declaraba `aria-modal="true"` pero no
implementaba ningún atrapa-foco real — el único manejo de teclado era
Escape; Tab/Shift+Tab podían sacar el foco del diálogo hacia los chips de
filtro y la rejilla de productos de detrás, que seguían presentes,
visibles y enfocables. `@s39` solo comprobaba que el foco ATERRIZABA dentro
del diálogo al abrirlo, nunca que se quedaba dentro al tabular.

**ROJO** — Test nuevo `@s39 refuerzo: el foco queda atrapado dentro del
diálogo al tabular...` en `PaginaTienda.test.tsx` (añadido justo después
del `describe` de `@s39`): añade 1 producto a la cesta (para tener varios
controles enfocables: Quitar/Añadir/Eliminar de la línea + Vaciar la cesta
+ el enlace de salida), abre el panel, calcula cuántos controles enfocables
hay dentro (`getAllByRole('button').length + getAllByRole('link').length`),
tabula hacia delante ese número de veces + 2 (para forzar al menos una
vuelta completa) comprobando en cada paso que `panel.toContainElement(
document.activeElement)`, y repite el mismo barrido con Shift+Tab.
Ejecutado en aislamiento (`vitest run ... -t "refuerzo"`) **ANTES** de
tocar producción: falló con
`<dialog ...> does not contain: <body />` — confirmado que, tras tabular
más veces que controles hay, el foco escapa del diálogo a `document.body`
(consistente con el diagnóstico del `judge`: el siguiente tabulable en
orden de documento, fuera del diálogo, es el primer chip de filtro
"Todos"; `document.body` es la parada intermedia que usa
`@testing-library/user-event` cuando el recorrido natural del documento se
agota).

**Diagnóstico técnico previo a implementar** (para no adivinar a ciegas):
se leyó el código fuente real de `@testing-library/user-event@14.6.4`
(`dist/cjs/event/dispatchEvent.js` + `dist/cjs/event/behavior/keydown.js` +
`dist/cjs/utils/focus/getTabDestination.js`). Confirmado: `usuario.tab()`
despacha un `keydown` real; si un listener de la propia app llama a
`evento.preventDefault()`, la librería **respeta esa cancelación** y no
ejecuta su cálculo de "siguiente elemento tabulable" (que además opera
sobre TODO el documento, sin ningún concepto de "diálogo modal"). Esto
confirma que un atrapa-foco cableado a mano con `keydown` +
`preventDefault` + `.focus()` manual es la vía correcta y testeable en
jsdom — llamar a `.showModal()` del `<dialog>` nativo NO habría bastado:
jsdom no implementa el comportamiento de "inert" del resto de la página que
un navegador real aplica con `showModal()`, así que `usuario.tab()`
seguiría recorriendo todo el documento igual. Se mantiene la decisión de
diseño de la ronda 1 de no usar `.showModal()` (documentada arriba), ahora
con esta razón técnica adicional.

**VERDE** — Implementación mínima, dos piezas:

1. `src/pages/PaginaTienda-logica.ts` → nueva función pura
   `elementoTrasAtraparFoco(elementosFocusables, elementoActivo,
   retroceder)`: dados los elementos enfocables del diálogo (en orden), el
   elemento con el foco y si se tabula hacia atrás, decide a qué elemento
   saltar SOLO en los bordes (última tabulación hacia delante → primero;
   primera tabulación hacia atrás, o Shift+Tab desde el propio contenedor
   del diálogo con `tabIndex={-1}` antes de la primera tabulación real →
   último); devuelve `null` cuando no hace falta intervenir (el resto de
   tabulaciones, estrictamente dentro del diálogo, ya se resuelven solas
   porque los controles del panel son contiguos en el DOM). Función pura,
   sin tocar el DOM — mordible por Stryker, coherente con el patrón
   `logica-de-decision-en-modulo-puro-no-en-el-jsx`.
2. `src/pages/PaginaTienda.tsx` → el `useEffect` de `PanelCesta` (ya tenía
   el listener de `document` para Escape) gana una rama para `'Tab'`: calcula
   los elementos enfocables del diálogo con
   `dialogo.querySelectorAll('button, a[href]')` (único selector que hace
   falta: el panel solo contiene botones y un enlace), llama a
   `elementoTrasAtraparFoco` con `document.activeElement` y
   `evento.shiftKey`, y si devuelve un destino no nulo, hace
   `evento.preventDefault()` + `destino.focus()`. Nada de DOM querying ni
   decisión vive fuera de estas dos piezas.

Confirmado en verde: el test de refuerzo pasa solo (`-t "refuerzo"`) y
`pnpm exec vitest run src/pages/PaginaTienda.test.tsx
src/pages/PaginaTienda-logica.test.ts` da **86/86** (80 de la ronda 1 + 1
test de integración + 6 tests unitarios nuevos, ver abajo — ningún test de
la ronda 1 se rompió, incluido `@s40` Escape, que comparte el mismo
listener).

**Ajuste de tipos, no de comportamiento:** `tsc -b` rechazó
`elementosFocusables[0]` / `elementosFocusables[elementosFocusables.length
- 1]` como `HTMLElement | undefined` bajo `noUncheckedIndexedAccess`
(`tsconfig.app.json`). Cambiado a `... ?? null` en ambos casos (la guarda
de `length === 0` ya garantiza en tiempo de ejecución que nunca son
`undefined`; el `?? null` solo satisface al compilador). Verificado que
`pnpm run lint && pnpm run typecheck` queda limpio y los tests siguen en
86/86 tras el ajuste.

**Tests unitarios directos de `elementoTrasAtraparFoco`** (además del test
de integración que pidió el `judge`): añadidos 6 tests en
`PaginaTienda-logica.test.ts` (`describe('@s39 refuerzo:
elementoTrasAtraparFoco...')`), uno por rama de la función (lista vacía;
Tab desde el último; Tab desde uno intermedio, sin intervención; Shift+Tab
desde el primero; Shift+Tab desde uno intermedio, sin intervención;
Shift+Tab desde el propio contenedor del diálogo antes de tabular). Añadidos
porque `stryker.config.json` muta `src/**/*-logica.ts` con umbral 1.0
(`harness.config.json` → `mutation.threshold`) y el patrón ya establecido
en este fichero (`alcanzoTopeUnidades`, `anadirUnidad`, `quitarUnidad`,
`fijarCantidad`... cada uno con su test directo) exige que la lógica de
decisión no dependa solo de un test de integración para sobrevivir a
mutación. Los 6 pasan "verde a la primera" (la implementación ya existía
para satisfacer el test de integración) — **verificado con sabotaje
manual** siguiendo el patrón `verde-por-vacuidad-en-puerta-de-verificacion`:
se sustituyó el cuerpo de la función tras la guarda de longitud por `return
null` fijo. Con el sabotaje, `pnpm exec vitest run
src/pages/PaginaTienda-logica.test.ts src/pages/PaginaTienda.test.tsx -t
"refuerzo"` dio **4 de 7 tests en rojo** (3 de los 6 unitarios que esperan
un destino no nulo, más el test de integración) — confirmado que no son
tautológicos. Revertido el sabotaje, vuelta a verde.

### Trazabilidad @s → test (ronda 2)

| @s | Qué exige el refuerzo | Test(s) nuevo(s) |
| -- | ---------------------- | ------- |
| @s12/@s18/@s21/@s24/@s25/@s26/@s27/@s29/@s30/@s31 | Fidelidad byte a byte del espacio duro U+00A0 en el importe mostrado | Las 16 aserciones `getByText(..., { collapseWhitespace: false })` ya existentes en `PaginaTienda.test.tsx`, corregidas (no son tests nuevos, son las mismas 16 aserciones con matcher fiel) |
| @s39 (refuerzo, patrón Modal Dialog WAI-ARIA APG de la cabecera del `.feature`, punto 12) | El foco no puede salir del diálogo al tabular, en ningún sentido | `PaginaTienda.test.tsx` → `@s39 refuerzo: el foco queda atrapado...`; `PaginaTienda-logica.test.ts` → `@s39 refuerzo: elementoTrasAtraparFoco` (6 tests) |

### Verificación final (ronda 2)

- `pnpm run lint` (oxlint --deny-warnings): limpio.
- `pnpm run typecheck` (tsc -b): limpio.
- `pnpm run test` (vitest run): **569/569 tests, 40 ficheros, verde** (562
  de la ronda 1 + 7 nuevos: 1 de integración + 6 unitarios de
  `elementoTrasAtraparFoco`).
- `node .harness/harness.mjs init`: **verde de punta a punta** (no hay
  `pwsh` en esta máquina).
- Ningún otro fichero de la ronda 1 se tocó en esta ronda 2: toda la
  feature sigue sin comprimir en el repo (los 4 ficheros de producción/test
  de `pagina_tienda` figuran como `??` sin trackear en `git status`, igual
  que al cierre de la ronda 1 — nada se ha commiteado todavía), así que
  `git diff --stat` no aplica como evidencia aquí; la evidencia es que esta
  sesión solo abrió/editó `src/pages/PaginaTienda.tsx`,
  `src/pages/PaginaTienda-logica.ts`, `src/pages/PaginaTienda.test.tsx` y
  `src/pages/PaginaTienda-logica.test.ts` (más este propio fichero de
  bitácora), confirmado por el recuento exacto de tests (562 → 569, +7, sin
  ningún ajuste neto en ningún otro fichero de test del proyecto).

## Ronda 3 (refuerzo tras `judge`, CHANGES_REQUESTED en ronda 2)

`progress/judge_pagina_tienda.md` rechazó la ronda 2 con 1 hallazgo
bloqueante concreto (ver "Cambios requeridos" de ese informe, líneas
241-254): de las 18 aserciones `getByText('...€')` que exigen fidelidad
byte a byte del espacio duro U+00A0, la corrección de la ronda 2 cubrió
solo 16 — las 2 aserciones de `@s29` (líneas 370-371,
`src/pages/PaginaTienda.test.tsx`) se quedaron con espacio ASCII (U+0020) y
sin `{ collapseWhitespace: false }`, así que pasaban igual aunque
`formatearImporte` emitiera el espacio equivocado. Esta ronda aplica
**solo** ese cambio — nada más se reescribe.

### Cambio único — Fidelidad U+00A0 en las 2 aserciones de `@s29` que faltaban

**Diagnóstico previo (reproducción independiente del hallazgo del judge):**
saboteada temporalmente `formatearImporte`
(`src/pages/PaginaTienda-logica.ts:57`) añadiendo
`.replace(/ /g, ' ')` a su valor de retorno. Con el sabotaje activo,
`pnpm exec vitest run src/pages/PaginaTienda.test.tsx -t "@s29"` dio **1
test en verde** (debía ponerse en rojo): confirmado que las dos aserciones
de subtotal/total de `@s29` no detectaban el defecto — mismo resultado que
reporta el informe del `judge`. Revertido el sabotaje (diff línea a línea
contra el original, idéntico) antes de tocar el test.

**Fix (mínimo, solo el test, mismo patrón que las otras 16 aserciones ya
corregidas en la ronda 2 — p. ej. línea 273):**
`src/pages/PaginaTienda.test.tsx:370-371` — cada literal
`'Subtotal de ejemplo: 24,99 €'` / `'Total de ejemplo: 24,99 €'` se
reescribió con el espacio duro U+00A0 antes de "€" (copiado carácter a
carácter del Then de `@s29`,
`features/pagina_tienda.feature:467-468`, verificado con `codePointAt` que
ambas líneas del `.feature` ya usaban U+00A0), y se añadió
`{ collapseWhitespace: false }` como segundo argumento de ambas llamadas a
`getByText(...)`. No se tocó ningún otro fichero ni ninguna otra aserción:
las 16 ya corregidas en la ronda 2 se dejaron intactas.

**Verificado en vivo, con el mismo sabotaje que usó el `judge`:**

1. Sabotaje activo + fix del test aplicado →
   `pnpm exec vitest run src/pages/PaginaTienda.test.tsx -t "@s29"` da
   **1 test en ROJO**, fallando exactamente en la línea 370
   (`getByText('Subtotal de ejemplo: 24,99 €', { collapseWhitespace:
   false })` no encuentra el nodo, porque el DOM real ahora contiene el
   espacio ASCII saboteado). Confirma que el test ya no es un falso
   negativo.
2. Sabotaje revertido (`PaginaTienda-logica.ts` vuelto a su forma exacta
   original, confirmado leyendo el fichero completo tras el revert — sin
   diferencias) →
   `pnpm exec vitest run src/pages/PaginaTienda.test.tsx
   src/pages/PaginaTienda-logica.test.ts` da **86/86 verde** (mismo total
   que al cierre de la ronda 2: 0 tests añadidos ni quitados, solo 2
   aserciones corregidas dentro de un test ya existente).

### Trazabilidad @s → test (ronda 3)

| @s | Qué exige el refuerzo | Test(s) corregido(s) |
| -- | ---------------------- | ------- |
| @s29 | Fidelidad byte a byte del espacio duro U+00A0 en el subtotal y el total mostrados tras eliminar una línea | `PaginaTienda.test.tsx` → `@s29 eliminar una línea la saca entera...`, líneas 370-371 (mismas 2 aserciones, con matcher fiel; no es un test nuevo) |

Con este cambio, las 18/18 aserciones de importe exacto del fichero (16 de
la ronda 2 + 2 de esta ronda 3) usan el mismo patrón
`{ collapseWhitespace: false }` + literal con U+00A0.

### Verificación final (ronda 3)

- `pnpm run lint` (oxlint --deny-warnings): limpio.
- `pnpm run typecheck` (tsc -b): limpio.
- `pnpm run test` (vitest run): **569/569 tests, 40 ficheros, verde** (sin
  cambio de conteo respecto a la ronda 2: se corrigió el contenido de 2
  aserciones dentro de un test existente, no se añadió ni quitó ningún
  test).
- `node .harness/harness.mjs init`: **verde de punta a punta**.
- Ningún fichero de producción se tocó en esta ronda: el único cambio de
  contenido final es en `src/pages/PaginaTienda.test.tsx` (líneas 370-371).
  `src/pages/PaginaTienda-logica.ts` se saboteó y revirtió dos veces
  durante la verificación, y quedó byte a byte idéntico al estado de cierre
  de la ronda 2 (confirmado leyendo el fichero completo).

## Ronda 4 — verificación de encargo (sin cambio de producción ni de test)

Encargo recibido: "progress/judge_pagina_tienda.md tiene un veredicto
CHANGES_REQUESTED nuevo... en su ULTIMA seccion" con instrucción de aplicar
"exactamente esos cambios" con sabotaje manual antes/después.

**Diagnóstico (leído el fichero completo, no solo el resumen):**
`progress/judge_pagina_tienda.md` contiene exactamente 2 secciones `# Review`
(confirmado con grep de `# Review`/`**Veredicto:**`/`## Cambios requeridos`
sobre el fichero completo):

1. Líneas 1-256: `**Veredicto:** CHANGES_REQUESTED` (rondas 1-3 fusionadas),
   con "Cambios requeridos" en la línea 241 pidiendo espacio duro U+00A0 +
   `{ collapseWhitespace: false }` en `PaginaTienda.test.tsx:370-371`.
2. Líneas 258-402 (la **última** sección real del fichero): encabezada
   `# Review — feature pagina_tienda (id 18) — Ronda 4 (2026-08-22)`, con
   `**Veredicto:** APPROVED` (línea 260) y, en su "## Cambios requeridos"
   (línea 400): "Ninguno. Feature aprobada; queda pendiente
   mutation_tester (C7)."

Es decir: el cambio que describe la sección CHANGES_REQUESTED (líneas
241-254) ya fue aplicado en la Ronda 3 de este mismo fichero de bitácora
(ver sección "Ronda 3" arriba) y la propia Ronda 4 del `judge`, que es la
sección final del informe, certifica que ese hallazgo quedó CERRADO y
aprueba la feature sin pedir ningún cambio adicional.

**Verificación independiente en vivo (no solo lectura) de que el fix ya
está aplicado y correcto**, antes de tocar nada:

```
node -e "
const fs = require('fs');
const s = fs.readFileSync('src/pages/PaginaTienda.test.tsx','utf8').split('\n');
for (const ln of [370, 371]) {
  const line = s[ln-1];
  const idx = line.indexOf('€');
  console.log(ln, 'char antes de €:', line.codePointAt(idx-1).toString(16));
}
"
# 370 char antes de €: a0
# 371 char antes de €: a0
```

Confirmado: ambas líneas usan ya el espacio duro U+00A0 (no ASCII 0x20)
antes del símbolo €, y ambas ya llevan `{ collapseWhitespace: false }` como
segundo argumento de `getByText(...)` (releído el texto completo de las
líneas 370-371). Esto coincide byte a byte con lo que la Ronda 3 de este
mismo fichero documenta como fix aplicado y con lo que la Ronda 4 del
`judge` confirma como cerrado — no hay ninguna diferencia entre "lo que el
supuesto encargo pide corregir" y "lo que ya existe en el repo".

**Decisión (Ley 1 — no negociable):** no existe ningún test en rojo que
exija producción o corrección de test nueva; el defecto descrito en la
sección CHANGES_REQUESTED del informe ya está resuelto y así lo certifica
la sección final (Ronda 4, APPROVED) del propio informe que se pidió leer.
Fabricar un ciclo de sabotaje/fix sobre un defecto que no existe en el
estado actual del repo violaría la Ley 1 (nunca se escribe/edita producción
o test sin un test rojo real que lo exija) y desviaría el contrato sin que
el `.feature` ni el `judge` lo pidan. No se tocó ningún fichero de
`src/` ni de test en esta ronda.

**Verificación de que el estado del repo sigue verde de punta a punta:**

```
node .harness/harness.mjs init
```

Resultado: lint limpio, typecheck limpio, **569/569 tests en 40 ficheros,
verde**. Sin cambios respecto al cierre de la Ronda 3/Ronda 4 del `judge`.

### Trazabilidad @s → test (ronda 4)

Sin cambio: @s29 sigue cubierto por
`PaginaTienda.test.tsx:358-373` (líneas 370-371 con U+00A0 +
`collapseWhitespace: false`), como ya documentaron las rondas 3 y la
aprobación del `judge` en su Ronda 4.

## Ronda 5 (refuerzo tras `judge`, CHANGES_REQUESTED — @s9 sin fidelidad de nombres tras filtrar)

Nota de numeración: el encargo recibido en esta sesión se llama "ronda de
refuerzo 4", pero `progress/tdd_pagina_tienda.md` ya usaba la etiqueta
"Ronda 4" para una verificación previa sobre un contenido de
`progress/judge_pagina_tienda.md` que, a la hora de abrir esta sesión, ya
había sido **sobrescrito** por un veredicto nuevo (el que se documenta
aquí). Para no romper la trazabilidad de esa sección anterior (que sigue
siendo cierta para el estado de fichero que describía en su momento), esta
ronda se numera **Ronda 5** en esta bitácora — es la única sección que
corresponde al hallazgo real recibido en este encargo.

`progress/judge_pagina_tienda.md` (estado actual, un único informe con
`**Veredicto:** CHANGES_REQUESTED`) señala 1 hallazgo bloqueante: el `Then`
de `@s9` (`features/pagina_tienda.feature:261`) exige que, tras pulsar el
filtro "Descanso", "los nombres accesibles de sus encabezados son
exactamente 'Cama de ejemplo talla M' y 'Manta de ejemplo de 60 × 40 cm'" —
pero el test correspondiente (`PaginaTienda.test.tsx`, describe `@s9`,
antes de este cambio) solo verificaba `toHaveLength(2)` y los atributos
`aria-pressed`, nunca CUÁLES productos se muestran. El propio `judge`
demostró con sabotaje propio (forzar `productosFiltrados` a filtrar
"Paseo" cuando `categoriaActiva === 'Descanso'`) que ese hueco es real:
con el defecto activo, la rejilla mostraba los productos de "Paseo" en vez
de los de "Descanso" y **toda la suite (86/86) seguía en verde** —
`PaginaTienda-logica.test.ts` no lo cazaba porque su test de
`filtrarProductosPorCategoria` usa nombres genéricos `a`/`b`/`c`, no
protege el cableado del `.tsx`; y como `PaginaTienda.tsx` queda fuera del
glob de mutación de `stryker.config.json` (solo `src/lib/**/*.ts` y
`src/**/*-logica.ts`), tampoco lo cazaría `mutation_tester` más adelante.

### Cambio único — asercion de nombres accesibles exactos en `@s9`

**Reproducción independiente del hallazgo, ANTES de tocar el test**
(mismo sabotaje que describe el informe, carácter a carácter):

```diff
- const productosFiltrados = filtrarProductosPorCategoria(catalogo, categoriaActiva)
+ const productosFiltrados = filtrarProductosPorCategoria(catalogo, categoriaActiva === 'Descanso' ? 'Paseo' : categoriaActiva)
```

Con el sabotaje activo, `pnpm exec vitest run src/pages/PaginaTienda.test.tsx
src/pages/PaginaTienda-logica.test.ts` dio **86/86 verde** — confirmado
en vivo, de forma independiente, que el hueco descrito por el `judge` es
real antes de escribir ninguna línea de test.

**ROJO** — con el sabotaje aún activo, se añadió dentro del `describe('@s9
filtrar por una categoría reduce la rejilla a esa categoría', ...)` de
`src/pages/PaginaTienda.test.tsx` (tras la aserción de conteo, antes de la
de `aria-pressed`) la misma aserción de nombres accesibles exactos que ya
usa `@s13` (`PaginaTienda.test.tsx:123-124`,
`screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)`),
con los dos literales del `Then` de `@s9` transcritos carácter a carácter
desde `features/pagina_tienda.feature:261` (incluido el signo `×` U+00D7,
no una "x" ASCII — mismo carácter que ya usaba la aserción hermana de
`@s13` en la línea 130 de este mismo fichero):

```ts
expect(screen.getAllByRole('heading', { level: 2 }).map((encabezado) => encabezado.textContent)).toEqual([
  'Cama de ejemplo talla M',
  'Manta de ejemplo de 60 × 40 cm',
])
```

`pnpm exec vitest run src/pages/PaginaTienda.test.tsx -t "@s9"` con el
sabotaje activo dio **1 test en ROJO**, fallando exactamente en la nueva
aserción (`expected [ 'Arnés de ejemplo talla M', …(1) ] to deeply equal [
'Cama de ejemplo talla M', …(1) ]`) — confirma que la nueva aserción ya no
es un falso negativo, tal como pedía el `judge` verificar antes de dar el
cambio por bueno.

**VERDE** — revertido el sabotaje (`PaginaTienda.tsx` vuelto a su línea
original, `filtrarProductosPorCategoria(catalogo, categoriaActiva)`,
confirmado leyendo el fichero completo tras el revert: idéntico al estado
de cierre de la ronda 4). `pnpm exec vitest run src/pages/PaginaTienda.test.tsx
src/pages/PaginaTienda-logica.test.ts` → **86/86 verde** (0 tests nuevos,
0 tests quitados: es la misma prueba de `@s9` con una aserción más dentro).
No hizo falta ningún cambio de producción: el defecto vivía solo en la
fidelidad del test, exactamente como en las rondas 2 y 3.

### Trazabilidad @s → test (ronda 5)

| @s | Qué exige el refuerzo | Test(s) corregido(s) |
| -- | ---------------------- | ------- |
| @s9 | Los nombres accesibles de las tarjetas mostradas tras filtrar son exactamente los del `Then` (no solo su cantidad) | `PaginaTienda.test.tsx` → `@s9 filtrar por una categoría reduce la rejilla a esa categoría`, nueva aserción entre las líneas 111-112 originales (mismo test, no es un `it` nuevo) |

### Verificación final (ronda 5)

- `pnpm run lint` (oxlint --deny-warnings): limpio.
- `pnpm run typecheck` (tsc -b): limpio.
- `node .harness/harness.mjs init`: **569/569 tests en 40 ficheros, verde**
  (sin cambio de conteo: se añadió 1 aserción dentro de un test existente,
  no se añadió ni quitó ningún test). Una primera corrida de `init` en esta
  misma sesión, justo tras revertir el sabotaje, dio 1 test en rojo con el
  mensaje exacto del sabotaje — se detectaron en la máquina 10 procesos
  `claude.exe` simultáneos (mismo patrón de colisión de sesión ya anotado
  en `progress/current.md`), y una lectura directa de
  `src/pages/PaginaTienda.tsx` en ese instante confirmó que la línea de
  producción ya estaba revertida a su forma original — se interpretó como
  un parpadeo de esa colisión (otra sesión reintroduciendo/retirando el
  mismo sabotaje sobre el disco compartido), no una regresión real. Repetir
  `node .harness/harness.mjs init` inmediatamente después dio **569/569
  verde de forma estable**; se deja esta nota para quien revise la sesión,
  siguiendo el mismo criterio de cautela que dejó `campanas_portada` ante
  colisiones de escritura anteriores.
- Ningún fichero de producción quedó tocado en el estado final: el único
  cambio de contenido persistente de esta ronda es en
  `src/pages/PaginaTienda.test.tsx` (nueva aserción dentro del `describe`
  de `@s9`). `src/pages/PaginaTienda.tsx` se saboteó y revirtió una vez
  durante la verificación, y quedó byte a byte idéntico al estado de cierre
  de la ronda 4 (confirmado leyendo el fichero completo con `node -e`).

## Ronda 6 (refuerzo tras `mutation_tester`, encargo etiquetado "ronda de refuerzo 5")

`progress/mutation_pagina_tienda.md` (nuevo informe, ronda 4 de mutación):
**FAIL**, 174/192 = 90.63% bruto (91.58% excluidos los 2 equivalentes
genuinos ya documentados en `PaginaTienda-logica.ts:226`,
`elementoTrasAtraparFoco`, sin cambio). 13 mutantes reales por matar en 5
causas raíz. Esta ronda aplica **solo** los cambios que el informe pide,
sin retocar nada de lo que ya estaba verde — mismo criterio que las rondas
2-5.

### Grupo A (3 mutantes) — `errorCategoriaNoPublicada`/`errorImporteInvalido`/`errorCantidadInvalida` devuelven `undefined` al vaciar su cuerpo

Diagnóstico del informe: `toThrowError(/regex/)` no distingue un `Error`
real de un valor lanzado que no lo es (`undefined`) — mismo patrón exacto ya
resuelto en `campanas_portada` (`CampanasPortada-logica.test.ts`), reutilizado
aquí como convención ya establecida en el proyecto (test adicional con
`try/catch` + `toBeInstanceOf(Error)` + mensaje exacto).

**ROJO (verificado con sabotaje manual, uno por función, antes de dar cada
test por bueno):**

- `errorCategoriaNoPublicada` (línea 9) vaciado a `void nombre; void
  categoria` (sin `return`): `pnpm exec vitest run
  src/pages/PaginaTienda-logica.test.ts -t "@s16"` → **1 de 2 tests en
  rojo**, el nuevo (`expected undefined to be an instance of Error`); el
  `toThrowError(regex)` original seguía en verde, confirmando el diagnóstico
  del informe. Revertido, diff limpio contra copia de seguridad.
- `errorImporteInvalido` (línea 19) vaciado igual: `-t "@s17"` → **1 de 4
  tests en rojo** (el nuevo). Revertido, diff limpio.
- `errorCantidadInvalida` (línea 116) vaciado igual: `-t "@s35|@s36"` →
  **4 de 9 tests en rojo** (el nuevo de `@s35` + los 3 casos `it.each`
  nuevos de `@s36`). Revertido, diff limpio.

**VERDE** — no hizo falta ningún cambio de producción: las 3 funciones ya
construían el `Error` real (Ley 1 respetada, el hueco era solo de test).
Tests nuevos añadidos en `PaginaTienda-logica.test.ts`: 1 dentro de
`@s16`, 1 dentro de `@s17` (con el caso de importe negativo, mismo mutante
que cualquier otro call-site porque el mutante vive en la función fábrica,
no en cada llamada), 1 dentro de `@s35`, y un segundo bloque `it.each` de 3
casos dentro de `@s36` (pedido explícitamente por el informe para los 3
casos parametrizados, no solo uno).

### Grupo B (1 mutante) — `comprobarImporteValido`: frontera `importeCentimos === 0` nunca probada como válida

**ROJO:** sabotaje manual de `producto.importeCentimos < 0` →
`producto.importeCentimos <= 0`. `-t "@s17 refuerzo"` con el test nuevo ya
escrito → **1 test en rojo**, lanzando "importe inválido" para
`importeCentimos: 0` cuando el test espera que NO lance. Revertido, diff
limpio.

**VERDE** — sin cambio de producción: nuevo `describe('@s17 refuerzo: un
importe de exactamente 0 céntimos es válido...')` con 1 `it` que confirma
que `construirCatalogoTienda` no lanza y conserva el producto con
`importeCentimos: 0` (el contrato, comentario de la línea 23 del propio
fichero, es "mayor o igual que cero").

### Grupo C (2 mutantes) — `quitarUnidad` nunca se llama con un identificador que no existe en la cesta

**ROJO:** sabotaje manual de `if (existente === undefined)` → `if (false)`.
`-t "quitarUnidad"` con el test nuevo ya escrito → **1 test en rojo**, con
`TypeError: Cannot read properties of undefined (reading 'cantidad')` (al
desactivar la guarda, el código cae a `existente.cantidad <= 1` sobre
`undefined`) — confirma que el mismo mutante que dejaba 86/86 en verde en el
informe ahora sí se cacha, y de paso confirma por qué el mutante
`[NoCoverage]` hermano (el bloque `{ return estado }`) también queda
resuelto: ahora sí se ejecuta. Revertido, diff limpio.

**VERDE** — sin cambio de producción: nuevo `it` dentro del `describe`
`@s25/@s26` que llama `quitarUnidad(estado, 'un-identificador-que-no-esta-en-estado')`
y comprueba que no lanza y que el estado vuelve sin cambios.

### Grupo D (7 mutantes) — `fijarCantidad` nunca se llama con una cantidad positiva

**ROJO (2 sabotajes independientes, uno por rama):**

- `if (cantidad === 0)` → `if (true)`: con los 2 tests nuevos ya escritos,
  `-t "@s34 refuerzo"` → **2 de 2 en rojo** (cualquier cantidad positiva cae
  ahora por la rama de "eliminar línea"). Revertido, diff limpio.
- `if (buscarLinea(estado, identificador) === undefined)` → `if (false)`:
  mismo filtro → **1 de 2 en rojo** (el caso "crear línea nueva": al
  desactivar la guarda, cae a `conCantidadFijada`, que no encuentra
  coincidencia y devuelve el estado sin la línea nueva). Revertido, diff
  limpio.

**VERDE** — sin cambio de producción: nuevo `describe('@s34 refuerzo:
fijarCantidad con una cantidad positiva actualiza o crea la línea')` con 2
`it`: (1) sobre un identificador que ya tiene línea, actualiza su cantidad
exacta y deja las demás intactas; (2) sobre un identificador sin línea
todavía, crea una línea nueva con esa cantidad exacta. Entre los dos matan
los 7 mutantes de las líneas 130/133/134 (confirmado con los 2 sabotajes de
arriba, que cubren las 2 ramas condicionales involucradas).

### App-logica.ts (3 mutantes) — derivación de `RUTAS_DE_SUBPAGINA` sin caso positivo observable

El informe documenta explícitamente que este grupo NO es un equivalente
(a diferencia de `PaginaTienda-logica.ts:226`): con los datos reales de HOY
(`ENLACES_NAVEGACION` + `RUTAS_YA_CON_PAGINA_PROPIA`), el resultado es `[]`
para cualquier mutante del `.filter().map()`, pero eso es contingente de los
datos actuales, no una garantía estructural — y recomienda explícitamente
extraer la derivación a una función pura parametrizada
(`derivarRutasDeSubpagina(enlaces, rutasYaConPaginaPropia)`) para poder
probar el caso positivo con datos sintéticos, mismo patrón que este
proyecto ya usó en `Cabecera-logica.ts`/`ensamblaje_landing` (`logica-de-decision-en-modulo-puro-no-en-el-jsx`).
Es la única pieza de esta ronda con producción nueva, y el propio informe
la documenta como necesaria — no es una desviación del alcance.

**ROJO** — `src/App-logica.test.ts` importa `derivarRutasDeSubpagina` desde
`./App-logica` (no existía) y la llama con un catálogo sintético de 3
enlaces (una ancla, una ruta ya con página propia, una ruta real SIN página
propia todavía) esperando `['/subpagina-nueva']`. `pnpm exec vitest run
src/App-logica.test.ts` → **1 de 2 tests en rojo**:
`TypeError: derivarRutasDeSubpagina is not a function` (no compila/importa,
cuenta como rojo por la Ley 2).

**VERDE** — implementación mínima en `src/App-logica.ts`: se extrae el
cuerpo exacto del `.filter().map()` que ya existía (sin cambiar ninguna
condición) a una función exportada `derivarRutasDeSubpagina(enlaces,
rutasYaConPaginaPropia)`, tipada sobre `EnlaceNavegacion` (tipo ya existente
en `src/data/navegacion.ts`, importado, no retipeado). `RUTAS_DE_SUBPAGINA`
pasa a ser `derivarRutasDeSubpagina(ENLACES_NAVEGACION,
RUTAS_YA_CON_PAGINA_PROPIA)` — mismo resultado observable (`[]` con los
datos reales de hoy), cero cambio de comportamiento, solo de forma.
`pnpm exec vitest run src/App-logica.test.ts src/App.test.tsx` → **15/15
verde**.

**Verificado con sabotaje manual, 2 variantes, sobre `derivarRutasDeSubpagina`
ya extraída (no sobre el `.tsx`, que sigue fuera del glob de Stryker):**

1. `.filter((enlace) => !esAncla(...) && !rutasYaConPaginaPropia.has(...))`
   → `.filter(() => false)` **y** `.map((enlace) => enlace.destino)` →
   `.map(() => undefined as unknown as string)` (los 2 mutantes `ArrowFunction`,
   líneas 32:3 y 33:7 del informe): `-t derivarRutasDeSubpagina` → **el test
   positivo en rojo** (`expected [] to deeply equal ['/subpagina-nueva']`).
   Revertido, diff limpio.
2. Solo el predicado entero sustituido por `() => false` (mutante
   `ConditionalExpression`, línea 32:15 del informe), dejando el `.map` real:
   mismo resultado, **rojo**. Revertido, diff limpio.

Los 3 mutantes documentados por el informe sobre esa expresión quedan
cazados por el mismo test nuevo.

### Trazabilidad @s → test (ronda 6)

| @s / hallazgo | Qué exige el refuerzo | Test(s) nuevo(s) |
| -- | ---------------------- | ------- |
| @s16 (Grupo A) | Lo lanzado por `errorCategoriaNoPublicada` es un `Error` real, no `undefined` | `PaginaTienda-logica.test.ts` → nuevo `it` dentro de `@s16` |
| @s17 (Grupo A) | Lo lanzado por `errorImporteInvalido` es un `Error` real | `PaginaTienda-logica.test.ts` → nuevo `it` dentro de `@s17` |
| @s17 (Grupo B) | `importeCentimos: 0` es un importe válido (frontera `< 0`, no `<= 0`) | `PaginaTienda-logica.test.ts` → nuevo `describe('@s17 refuerzo...')` |
| @s35/@s36 (Grupo A) | Lo lanzado por `errorCantidadInvalida` es un `Error` real, en los 4 call-sites (negativo + 3 no-enteros) | `PaginaTienda-logica.test.ts` → nuevo `it` dentro de `@s35` + nuevo `it.each` de 3 casos dentro de `@s36` |
| @s25/@s26 (Grupo C) | `quitarUnidad` con un identificador inexistente no lanza y no muta el estado | `PaginaTienda-logica.test.ts` → nuevo `it` dentro del `describe` de `quitarUnidad` |
| @s34 (Grupo D) | `fijarCantidad` con una cantidad positiva actualiza (línea existente) o crea (línea nueva) | `PaginaTienda-logica.test.ts` → nuevo `describe('@s34 refuerzo...')`, 2 `it` |
| App-logica.ts (grupo 5) | La derivación de `RUTAS_DE_SUBPAGINA` sigue funcionando en un caso positivo, no solo en el `[]` contingente de hoy | `App-logica.test.ts` → nuevo `describe('derivarRutasDeSubpagina...')`, 1 `it` con datos sintéticos |

### Verificación final (ronda 6)

- `pnpm run lint` (oxlint --deny-warnings): limpio.
- `pnpm run typecheck` (tsc -b): limpio.
- `pnpm run test` (vitest run): **580/580 tests, 40 ficheros, verde** (569 →
  580, +11: 10 tests nuevos en `PaginaTienda-logica.test.ts` + 1 en
  `App-logica.test.ts`).
- `node .harness/harness.mjs init`: **verde de punta a punta** (580/580).
- Cada uno de los 13 mutantes señalados por el informe se verificó en vivo
  con sabotaje manual dirigido (reproduciendo la mutación exacta descrita),
  confirmando ROJO con el test nuevo antes de revertir — nunca se dio un
  hallazgo por resuelto solo por lectura del informe. Todos los sabotajes se
  revirtieron con `diff` limpio contra una copia de seguridad tomada antes
  de tocar cada fichero (`src/pages/PaginaTienda-logica.ts` y
  `src/App-logica.ts`), confirmado después de cada uno y al cierre de la
  ronda.
- Único cambio de producción de esta ronda: `src/App-logica.ts` (extracción
  de `derivarRutasDeSubpagina`, documentada explícitamente como necesaria
  por el propio informe de mutación — no una desviación del alcance de la
  Ley 1). `src/pages/PaginaTienda-logica.ts` no cambió en el estado final:
  todo lo que el informe pedía sobre ese fichero eran huecos de test, no de
  comportamiento.
- Pendiente: nuevo veredicto del `judge` sobre los ficheros tocados y nueva
  medición de `mutation_tester` sobre `PaginaTienda-logica.ts` y
  `App-logica.ts`.

## Ronda 7 (refuerzo tras `mutation_tester`, encargo etiquetado "ronda de refuerzo 6")

Encargo recibido: el `mutation_tester` invocado tras la Ronda 6 **no
devolvió un veredicto estructurado** en esta sesión; instrucción explícita
de leer `progress/mutation_pagina_tienda.md` a mano antes de continuar, y
aplicar solo los cambios mínimos que pidan los hallazgos.

### Diagnóstico — el informe en disco es el mismo que ya disparó la Ronda 6, no uno nuevo

Leído `progress/mutation_pagina_tienda.md` completo (338 líneas). Su
contenido — Grupo A (3 mutantes, fábricas de `Error` sin
`instanceof`), Grupo B (1 mutante, frontera `importeCentimos === 0`),
Grupo C (2 mutantes, `quitarUnidad` sin identificador inexistente), Grupo D
(7 mutantes, `fijarCantidad` sin cantidad positiva) y App-logica.ts (3
mutantes, `RUTAS_DE_SUBPAGINA` sin caso positivo) — es **exactamente** el
mismo que ya documenta la sección "Ronda 6" de este mismo fichero (arriba),
con el mismo score bruto (174/192 = 90.63%) y las mismas 5 causas raíz.
Confirmado leyendo `src/pages/PaginaTienda-logica.test.ts` y
`src/App-logica.test.ts` línea a línea: los 13 tests que pide ese informe
**ya existen en disco** (`toBeInstanceOf(Error)` en @s16/@s17/@s35/@s36,
`@s17 refuerzo` con `importeCentimos: 0`, el `it` de
`quitarUnidad(estado, 'un-identificador-que-no-esta-en-estado')`, el
`describe('@s34 refuerzo...')` con los 2 casos de `fijarCantidad`, y
`derivarRutasDeSubpagina` con su test de datos sintéticos en
`App-logica.test.ts`) — es decir, la Ronda 6 ya aplicó exactamente lo que
este informe pide. No hay ningún hallazgo NUEVO en el texto del informe que
exija producción o test adicional.

### Hallazgo real de esta ronda — sabotaje de verificación sin revertir, dejado en `src/pages/PaginaTienda-logica.ts:226`

Antes de dar la Ronda 6 por cerrada sin más, se releyó el propio código
fuente de `elementoTrasAtraparFoco` (no solo la bitácora) porque la
instrucción de esta ronda pedía leer el informe "a mano" — y el informe,
en su sección "Los 2 mutantes restantes -- equivalentes genuinos", describe
textualmente el sabotaje que usó para verificarlos: *"sustituida la guarda
por `if (false) { return null }` (ambos mutantes a la vez)"*. Comprobado
en vivo que **ese sabotaje seguía activo en el fichero real**:

```ts
// src/pages/PaginaTienda-logica.ts:226 (estado encontrado, ANTES de esta ronda)
  if (false) {
    return null
  }
```

en vez de la guarda real que documentan tanto la Ronda 2 (que la introdujo)
como el propio informe de mutación (que la cita como el original que
sustituyó):

```ts
  if (elementosFocusables.length === 0) {
    return null
  }
```

Coincide exactamente con la pista del encargo ("el `mutation_tester` no
devolvió un veredicto estructurado"): la sesión de medición se cortó a
mitad de su verificación manual de este mutante concreto (la última
sección detallada del informe, justo antes de la conclusión), sin llegar a
revertir el sabotaje que ella misma aplicó — mismo patrón de interrupción
ya documentado otras veces en `progress/current.md` (colisiones de sesión),
pero esta vez con un efecto real en `src/`.

**Verificación antes de tocar nada:** `pnpm exec vitest run
src/pages/PaginaTienda-logica.test.ts src/pages/PaginaTienda.test.tsx` con
el sabotaje aún activo → **96/96 verde** (consistente con el propio
informe: es un mutante equivalente genuino, ningún test lo distingue del
original — no es una regresión de comportamiento, es codigo corrupto sin
sentido: un `if (false)` fijo no es la intención de ningún `@s`, aunque no
lo detecte ningún test).

**Fix (restauración, no ampliación de alcance):** revertida la única línea
alterada, `if (false)` → `if (elementosFocusables.length === 0)` —
exactamente el texto que documentan la Ronda 2 de este fichero y el propio
informe de mutación como el original. No es un cambio de comportamiento
observable (el propio informe demuestra la equivalencia analítica y
empíricamente para `elementosFocusables = []`); es restaurar el fichero al
estado que su propia documentación y sus propios tests siempre asumieron,
tras una sesión de verificación que lo dejó a medio revertir. No hizo falta
ningún ciclo Rojo nuevo (Ley 1: no hay ningún test que exija esta guarda
para pasar, precisamente porque es el mutante equivalente ya analizado) —
se trata de una restauración de la barra verde a su forma correcta, hecha
"en refactor" (verde antes y después).

**Barrido de seguridad:** `grep -rn "if (false)\|if (true)"` sobre
`src/**/*.ts` y `src/**/*.tsx` completos → sin más coincidencias. No queda
ningún otro resto de sabotaje de verificación sin revertir en el
repositorio.

### Trazabilidad @s → test (ronda 7)

| @s / hallazgo | Qué exige el refuerzo | Cambio |
| -- | ---------------------- | ------- |
| @s39/@s40 (guarda de `elementoTrasAtraparFoco`) | La guarda de lista vacía debe ser la condición real, no un resto de sabotaje de verificación (`if (false)`) sin revertir | `src/pages/PaginaTienda-logica.ts:226` restaurado a `if (elementosFocusables.length === 0)`; sin test nuevo (comportamiento ya cubierto por los 7 tests existentes de `elementoTrasAtraparFoco`, `PaginaTienda-logica.test.ts:417-446`, y por el test de integración de `@s39`/`@s40` en `PaginaTienda.test.tsx`) |

Los 13 mutantes de los Grupos A-D + App-logica.ts que pedía el informe
siguen cubiertos por los tests ya documentados en la Ronda 6 — no se tocó
ninguno de ellos en esta ronda porque ya estaban correctamente aplicados en
disco.

### Verificación final (ronda 7)

- `pnpm run lint` (oxlint --deny-warnings): limpio.
- `pnpm run typecheck` (tsc -b): limpio.
- `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts
  src/pages/PaginaTienda.test.tsx src/App-logica.test.ts src/App.test.tsx`:
  **111/111 verde** (sin cambio de conteo respecto al cierre de la Ronda 6:
  se restauró una condición, no se añadió ni quitó ningún test).
- `node .harness/harness.mjs init`: **verde de punta a punta, 580/580
  tests, 40 ficheros** (mismo total que al cierre de la Ronda 6).
- Único cambio de esta ronda: `src/pages/PaginaTienda-logica.ts:226`
  (1 línea, restauración de un sabotaje de verificación sin revertir).
  Ningún otro fichero de `src/` ni de test se tocó.
- Pendiente: nuevo veredicto del `judge` y nueva medición de
  `mutation_tester` (que debería, esta vez, devolver un veredicto
  estructurado y terminar de revertir cualquier sabotaje manual que
  aplique).

## Ronda 8 — verificación de encargo (corrección de premisa, sin cambio de producción ni de test)

Encargo recibido: "mutation_tester acaba de reportar FAIL sobre
pagina_tienda (id 18) -- lee progress/mutation_pagina_tienda.md completo
(ultima seccion) para ver los supervivientes reales exactos", con
instrucción de reforzar tests dirigidos que maten cada superviviente real.

### Diagnóstico — la premisa del encargo no coincide con el estado real del fichero

Leído `progress/mutation_pagina_tienda.md` completo (628 líneas) antes de
tocar nada. `grep` dirigido de `**Veredicto:**` sobre el fichero completo:
solo **2 coincidencias**.

1. Línea 3 — `**Veredicto:** PASS`, cabecera del fichero (línea 1: `# Mutación
   — feature pagina_tienda (id 18) — ronda 2 (re-medición tras refuerzo de
   tdd_craftsman y judge Ronda 8, APPROVED)`). Score: 191/193 = 98.96% bruto;
   **191/191 = 100.00% excluidos los 2 mutantes equivalentes genuinos** ya
   documentados y re-verificados sin cambios en `PaginaTienda-logica.ts:226`
   (`elementoTrasAtraparFoco`). Es la medición más reciente y la que
   corresponde al estado actual del código (re-mide explícitamente el
   refuerzo de las Rondas 6-7 de esta misma bitácora).
2. Línea 269 — `**Veredicto:** FAIL`, dentro de la sección explícitamente
   etiquetada `## Historico - medicion ronda 1 (FAIL), conservada para
   trazabilidad` (línea 267). Es la medición anterior (174/192 = 90.63%),
   conservada solo por trazabilidad — sus 13 mutantes reales ya fueron
   matados por las Rondas 6-7 de esta bitácora, y esta misma "ronda 2" del
   informe de mutación certifica ese resultado de forma independiente.

Es decir: **no hay ningún superviviente real pendiente**. La única sección
de "supervivientes" que cita el informe con el veredicto vigente (PASS) son
los 2 mismos mutantes equivalentes genuinos de siempre
(`PaginaTienda-logica.ts:226`, `ConditionalExpression`/`BlockStatement`
sobre la guarda `if (elementosFocusables.length === 0)`), ya justificados
con demostración analítica exhaustiva de las 4 combinaciones de
`retroceder x elementoActivo` (documentada en el histórico del propio
informe) y verificados empíricamente por partida doble por `tdd_craftsman`
(Ronda 2 de esta bitácora) y por `mutation_tester` en su ronda 2 — no son
supervivientes "reales" en el sentido del encargo (defectos de cobertura),
son equivalencia matemática ya cerrada.

### Verificación independiente propia (no solo lectura del informe)

- `progress/judge_pagina_tienda.md`: `grep` de `# Review`/`**Veredicto:**`
  sobre el fichero completo (1204 líneas) confirma que su sección final real
  es la **Ronda 8** (línea 931, `APPROVED`), que revisó específicamente este
  mismo refuerzo (Rondas 6-7 de esta bitácora) y cuya única puerta pendiente
  que dejaba anotada era exactamente la re-medición de mutación que el
  informe de mutación ya resolvió con `PASS`.
- Releído `src/pages/PaginaTienda-logica.ts:221-239`
  (`elementoTrasAtraparFoco`): la guarda está en su forma real,
  `if (elementosFocusables.length === 0) { return null }` — no queda ningún
  resto del sabotaje de verificación (`if (false)`) que la Ronda 7 de esta
  bitácora ya había encontrado y revertido.
- `grep -rn "if (false)|if (true)"` sobre `src/**/*.ts`: **0 coincidencias**
  — no queda ningún resto de sabotaje de verificación sin revertir en el
  repositorio.
- `feature_list.json`: `pagina_tienda` (id 18) sigue `in_progress`, precondición
  respetada.

### Decisión (Ley 1 — no negociable)

No existe ningún mutante real (no-equivalente) por matar según el estado
actual en disco de `progress/mutation_pagina_tienda.md`: su última medición
vigente es `PASS` al 100% excluidos los 2 equivalentes genuinos ya
justificados con prueba analítica + verificación empírica doble. Escribir
tests nuevos contra supervivientes que no existen violaría la Ley 1 (nunca
se añade test/producción sin que un hallazgo real lo exija) y desviaría el
contrato inventando trabajo no pedido por ningún `@s`. Mismo criterio que ya
aplicó esta bitácora en su propia Ronda 4 ante una premisa de encargo
igualmente desactualizada. No se tocó ningún fichero de `src/` ni de test en
esta ronda.

### Verificación final (ronda 8)

- `node .harness/harness.mjs init`: **verde de punta a punta** — lint
  limpio, typecheck limpio, **580/580 tests en 40 ficheros** (mismo total
  que al cierre de la Ronda 7; sin cambio de conteo).
- `pnpm run test` (vitest run, incluida en la corrida de `init` de arriba):
  **580 passed (580), 40 test files passed (40)**.
- Ningún fichero de `src/` ni de test quedó modificado por esta ronda:
  solo se amplía esta bitácora.

### Trazabilidad @s → test (ronda 8)

Sin cambio: los 44/44 escenarios siguen cubiertos tal como documentan las
Rondas 1-7 de esta misma bitácora; no se tocó ningún test.

## Ronda 9 — ajuste de comentario en App.test.tsx pedido por judge Ronda 9

El judge (Ronda 9, `progress/judge_pagina_tienda.md`, "Cambios requeridos"
punto 2) señaló que el comentario justo antes del `it(...)` de
`describe('@s12 refuerzo — App registra un <Route> explícito por cada ruta
de subpágina, no solo cae en el comodín "*"', ...)` en `src/App.test.tsx`
había quedado desactualizado: decía que `RUTAS_DE_SUBPAGINA` valía
`['/campanas', '/blog', '/tienda']`, pero con `pagina_campanas` (16),
`pagina_blog` (17) y `pagina_tienda` (18) ya `done`, las tres rutas de
subpágina tienen su propia `<Route>` real y `RUTAS_DE_SUBPAGINA`
(`src/App-logica.ts`) es ahora `[]` — verificado en
`src/App-logica.test.ts:24` (`expect(RUTAS_DE_SUBPAGINA).toEqual([])`).

Cambio puramente de comentario, sin tocar ninguna aserción, `it` ni
`describe`, y sin tocar ningún fichero de producción (Leyes 1 y 2 de TDD: no
hay test rojo que pida cambio de comportamiento, así que no se toca
comportamiento).

Diff aplicado en `src/App.test.tsx`:

```diff
-  // El valor exacto de RUTAS_DE_SUBPAGINA (`['/campanas', '/blog', '/tienda']`)
-  // se verifica en `src/App-logica.test.ts`, donde vive ahora esa derivación.
+  // Con pagina_campanas/pagina_blog/pagina_tienda ya implementadas, las tres
+  // rutas de subpágina tienen su propia página y RUTAS_DE_SUBPAGINA (`src/App-logica.ts`)
+  // vale ahora `[]`; ese valor exacto se verifica en `src/App-logica.test.ts`.
```

Verificación: `node .harness/harness.mjs init` → verde de punta a punta,
40 archivos de test, 580/580 tests pasan (mismo conteo que antes del
ajuste), lint (`oxlint --deny-warnings`) y typecheck (`tsc -b`) limpios.
