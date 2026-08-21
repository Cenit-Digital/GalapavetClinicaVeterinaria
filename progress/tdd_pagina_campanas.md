# TDD — pagina_campanas (id 16)

> 41 escenarios (@s1-@s41). La feature más grande del proyecto hasta ahora.
> Ciclo Rojo→Verde→Refactor real, un `@s` a la vez, en orden. Baseline antes
> de tocar nada: `pnpm run test` 343/343 (33 ficheros), `pnpm run verificar`
> (lint+typecheck) limpio.

## Diseño previo (antes del primer ciclo)

- **`src/pages/PaginaCampanas.tsx` + `PaginaCampanas-logica.ts` + sus dos
  `.test`**, mismo patrón `logica-de-decision-en-modulo-puro-no-en-el-jsx`
  que el resto del proyecto. La lógica pura vive en `src/pages/` (no en
  `src/components/`) porque es una página, no un componente de sección — el
  glob de Stryker (`src/**/*-logica.ts`) la cubre igual.
- **`CampanaDemo` (`src/data/campanas.ts`) se extiende con campos NUEVOS,
  todos OPCIONALES**: `id?`, `bloque?`, `puntos?`, `plazas?`, `duracion?`.
  Optactivo a propósito: los literales de test ya aprobados de
  `campanas_portada` (`CampanasPortada-logica.test.ts`,
  `CampanasPortada.test.tsx`) construyen `CampanaDemo` sin esos campos
  (`{ titulo: 'Vacunaciones', precio: '49 €' }`, etc.) — si fueran
  obligatorios, esos ficheros dejarían de compilar. `CAMPANAS_DEMO` (el
  catálogo real, compartido con `campanas_portada`) sí los rellena para sus 3
  entradas. `puntos` se calcula en `campanas.ts` a partir de `SERVICIOS`
  (`src/data/servicios.ts`), nunca retipeado a mano.
- **Vista resuelta con una función pura `resolverVista`** (`listado` /
  `listado-no-encontrada` / `ficha`) a partir del catálogo validado y el
  parámetro `campana` de la URL. Aísla la lógica de "qué se muestra" del
  `.tsx`, que solo cablea.
- **Guardas de fallo cerrado** (precio/vigencia/plazas/duración/punto no
  publicado) en `construirCatalogoCampanas`, mismo estilo que
  `construirModeloCampanas` de `CampanasPortada-logica.ts` (reutilizado como
  referencia de estilo, NO como función compartida: extender la función de
  `campanas_portada` para que también guarde plazas/duración habría sido
  producción sin ningún `@s` de `campanas_portada.feature` que la pidiera —
  esa feature ya está cerrada con mutación 100%).
- **Navegación interna con `<Link>` de `react-router`** (no `<a>` +
  `pushState` manual como hace `Cabecera.tsx`): un `<a>` real sin interceptar
  dispara "navigation to another Document", no implementado en jsdom
  (`Cabecera-logica.ts`, comentario de `esAncla`). Con tantos enlaces
  internos por vista (tarjetas, migas de pan, "otras campañas"), replicar el
  patrón manual de `Cabecera.tsx` en cada uno habría sido duplicación
  significativa; `<Link>` ya produce un `<a href>` real (satisface @s6:
  "es enlace y no botón") y gestiona el `pushState` por dentro.
- **Scroll al abrir ficha (@s21-@s23, @s41): función pura reutiliza
  `prefiereMenosMovimiento` de `Galeria-logica.ts`** (ya implementa
  exactamente el fallo cerrado de 3 vías que pide @s41) en vez de
  reimplementarlo. `decidirComportamientoDesplazamiento` en
  `PaginaCampanas-logica.ts` es una función de una línea que traduce esa
  preferencia a `'auto' | 'smooth'`.

## Cambios fuera de `src/pages/` (todos con un test rojo propio, ninguno "adelantado")

1. **`src/App.tsx` / `src/App-logica.ts`** — añade `<Route path="/campanas"
   element={<PaginaCampanas />} />` real y quita `/campanas` de
   `RUTAS_DE_SUBPAGINA` (antes caía en el catch-all genérico de
   `ensamblaje_landing`). Contract-sanctioned: `ensamblaje_landing.feature` /
   `project-spec.md` PREGUNTA ABIERTA 2 dicen literalmente que el catch-all
   dura "hasta que sus propias features (16, 17, 18) aterricen su propia
   Route". `App.tsx` se reestructura en `App` (declara `<BrowserRouter>`) +
   `AppInterior` (dentro del Router, puede llamar `useLocation()` para darle
   a `Cabecera` la ruta activa — mismo patrón que `ancho`, Decisión 22).
   - Diff conceptual de `App-logica.ts`: nueva constante
     `RUTAS_YA_CON_PAGINA_PROPIA = new Set(['/campanas'])`, y el `filter` de
     `RUTAS_DE_SUBPAGINA` gana una cláusula
     `&& !RUTAS_YA_CON_PAGINA_PROPIA.has(enlace.destino)`.
   - **Por qué no rompe ningún `@s` de `ensamblaje_landing`**: sus 15
     escenarios (`features/ensamblaje_landing.feature`) no fijan qué rutas
     concretas caen en el catch-all como un valor cerrado — @s6/@s12 del
     propio `.feature` (y su criterio de aceptación en `feature_list.json`)
     describen el catch-all como el comportamiento por defecto "hasta que
     aterricen" las páginas propias, exactamente la cláusula que ahora se
     cumple. Los otros 14 escenarios (shell común, anclas, resize, orden de
     secciones, `#root`) no mencionan `/campanas` en absoluto.
   - Tests de `ensamblaje_landing` que SÍ citaban el valor exacto de
     `RUTAS_DE_SUBPAGINA` o la lista de rutas del catch-all se actualizaron
     (no se borraron, se corrigieron para reflejar el nuevo contrato):
     - `src/App-logica.test.ts`: `toEqual(['/campanas','/blog','/tienda'])` →
       `toEqual(['/blog','/tienda'])`, con comentario explicando el porqué.
     - `src/App.test.tsx`, describe `@s12`: `it.each(['/campanas','/blog','/tienda'])`
       → `it.each(['/blog','/tienda'])`, con comentario. La cobertura de que
       `/blog` y `/tienda` siguen sirviendo el catch-all NO se pierde (siguen
       ahí, solo se retira `/campanas` de la lista). El segundo describe de
       `@s12` ("refuerzo — App registra un `<Route>` explícito...") NO
       necesitó cambios: sigue verificando que `/campanas`, `/blog`,
       `/tienda` y `*` aparecen como algún `<Route>` registrado, y eso sigue
       siendo cierto (ahora `/campanas` viene de la `<Route>` explícita
       nueva, no del `.map()`).
2. **`src/components/Cabecera.tsx` / `Cabecera-logica.ts`** — @s1 de esta
   feature exige que el enlace "Campañas" de la navegación principal lleve
   `aria-current="page"` cuando la ruta activa es `/campanas`, y ningún otro
   enlace lo tenga. `Cabecera` no tenía forma de saber la ruta activa.
   Añadido, aditivo y retrocompatible (mismo patrón que `ancho`, Decisión
   22): prop opcional `rutaActual?: string` (por defecto `''`, que ningún
   destino real iguala — sin este prop ningún enlace se marca, así que los
   16 escenarios YA aprobados de `Cabecera.test.tsx` (que nunca pasan este
   prop) siguen exactamente igual, verificado corriendo su suite completa
   antes y después) + función pura nueva `esPaginaActual(destino, rutaActual)`
   en `Cabecera-logica.ts` (excluye anclas). `AppInterior` (en `App.tsx`) es
   quien mide la ruta real con `useLocation()` y se la pasa.

## Trazabilidad (@s → test) — se completa ciclo a ciclo

- @s1 (comparte cabecera/pie, aria-current en "Campañas", ningún otro enlace
  lo tiene) → `src/pages/PaginaCampanas.test.tsx`, describe `@s1 la página
  comparte cabecera y pie con la landing y se marca como página actual`.
  Soporte de mutación: `src/components/Cabecera-logica.test.ts`, describe
  `esPaginaActual marca como actual solo el destino de subpágina que
  coincide con la ruta activa` (3 tests directos sobre la función pura).
- @s2 (h1 listado + migas "Ruta") → describe `@s2 el listado se presenta con
  su encabezado y sus migas de pan`.
- @s3 (3 tarjetas, 3 h2 en orden, títulos publicados) → describe `@s3 el
  listado muestra una tarjeta por cada campaña del catálogo de demo`.
- @s4 (badge "Demostración" + "Bloque de servicios: X") → describe `@s4 cada
  tarjeta se rotula como demostración y nombra el bloque publicado del que
  procede`.
- @s5 (aviso literal, una vez, antes de la 1ª tarjeta) → describe `@s5 el
  aviso de demostración de la página es visible y literal`.
- @s6 (1 enlace por tarjeta, nombre y destino propios) → describe `@s6 cada
  tarjeta ofrece un enlace propio, distinguible, hacia su ficha`.
- @s7 (abrir tarjeta → ficha, retira listado) → describe `@s7 abrir una
  tarjeta muestra la ficha de esa campaña y retira el listado`.
- @s8 (URL refleja campaña abierta) → describe `@s8 abrir una tarjeta
  refleja la campaña abierta en la dirección del navegador`. Verificado con
  sabotaje manual (href a un id fijo "OTRA") + reversión: confirmado que el
  test SÍ muerde (pasaba "a la primera", docs/tdd.md lo pide).
- @s9 (foco al h1 de la ficha, tabIndex -1) → describe `@s9 al abrir una
  ficha el foco pasa a su encabezado de nivel 1`.
- @s10 (deep-link directo a ficha) → describe `@s10 entrar directamente por
  la dirección de una ficha muestra esa ficha`.
- @s11 (botón Atrás → listado) → describe `@s11 el botón Atrás del navegador
  devuelve al listado`.
- @s12 (ficha Vacunaciones transcribe 5 puntos de "Medicina general") →
  describe `@s12 la ficha de «Vacunaciones» transcribe los cinco puntos
  publicados de «Medicina general»`.
- @s13 (ficha Odontología transcribe 4 puntos de "Especialidades") →
  describe `@s13 la ficha de «Odontología» transcribe los cuatro puntos
  publicados de «Especialidades»`. Pasó a la primera (generalización de
  @s12: mismo componente, datos distintos) — riesgo bajo, no se sabotea.
- @s14 (mismo aviso literal en la ficha, antes del h2) → describe `@s14 la
  ficha se rotula como demostración con el mismo aviso literal que el
  listado`.
- @s15 (panel "Datos pendientes de confirmar") → describe `@s15 el panel de
  datos pendientes nombra precio, vigencia y plazas sin ninguna cifra`.
- @s16 (tel: real, único) → describe `@s16 la ficha ofrece llamar al
  teléfono real derivado de la fuente única`.
- @s17 ("Reservar cita" → "/#reservar") → describe `@s17 la ficha ofrece
  reservar y lleva a la sección de reserva de la landing`.
- @s18 (migas de la ficha, 3 niveles) → describe `@s18 las migas de la
  ficha tienen tres niveles y la actual se marca con aria-current`.
- @s19 ("Otras campañas", nunca la abierta) → describe `@s19 «Otras
  campañas» lista las demás campañas del catálogo y nunca la abierta`. Este
  ciclo **rompió @s7** (las tarjetas de "Otras campañas" reusaban el texto
  "Ver la ficha de X", que @s7 prohíbe fuera del listado) — corregido
  cambiando el nombre accesible de esos enlaces al título desnudo, sin volver
  a escribir un test nuevo (Ley 2: el rojo ya existía, era @s7 mismo).
- @s20 (imágenes locales, alt vacío) → describe `@s20 ninguna imagen de la
  página se pide a un tercero`.
- @s21 (menos movimiento → sin suavizado) → describe `@s21 con la
  preferencia de menos movimiento, abrir una ficha no desplaza con
  suavizado`.
- @s22 (sin preferencia → con suavizado) → describe `@s22 sin esa
  preferencia, abrir una ficha desplaza con suavizado`. Pasó a la primera
  (generalización de @s21: la rama `!prefiereMenosMovimiento` ya existía).
- @s23 (preferencia no consultable → sin suavizado, fallo cerrado) →
  describe `@s23 si la preferencia de movimiento no se puede consultar se
  desplaza sin suavizado`. Pasó a la primera: reutilizar
  `prefiereMenosMovimiento` (`Galeria-logica.ts`) ya trae ese fallo cerrado
  probado en su feature de origen — confirma que la reutilización (en vez de
  reimplementar) fue la decisión correcta.

- @s24 (sin "€"/"%"/lenguaje de precio; "Precio" solo como etiqueta) →
  describe `@s24 ningún texto del contenido principal muestra un precio` (2
  bloques: listado sin la palabra, 3 fichas con exactamente 1 aparición
  como elemento propio).
- @s25 (sin fechas/meses/vigencia; "Vigencia"/"Plazas" solo como etiqueta) →
  describe `@s25 ningún texto del contenido principal muestra una fecha ni
  un periodo de vigencia` (mismo patrón de 2 bloques que @s24).
- @s26 (sin urgencias/24h/datos del prototipo ajeno; único estado
  "Demostración") → describe `@s26 ningún texto del contenido principal
  anuncia urgencias 24 h ni arrastra datos del prototipo ajeno`.
- @s27 (id desconocido → listado + aviso "status") → describe `@s27 un
  identificador desconocido muestra el listado y avisa de que no existe`.
- @s28 (aviso no reproduce el valor recibido, ni error en consola) →
  describe `@s28 el aviso de campaña no encontrada no reproduce el valor
  recibido`. Pasó a la primera: el aviso es un literal fijo, nunca
  interpola el parámetro recibido — diseño ya a prueba de esto.
- @s29 (id vacío → listado sin aviso) → describe `@s29 un identificador
  vacío se trata como el listado, sin aviso de error`.
- @s30 (catálogo vacío → aviso de vacío, sigue banner/contentinfo) →
  describe `@s30 caso límite — con el catálogo vacío la página se
  renderiza sin tarjetas y lo dice`. Introduce `renderizarPaginaConCatalogo`
  (helper de test que compone `Cabecera`+`PaginaCampanas`+`PieDePagina`, el
  mismo shell real que `App.tsx`, para poder inyectar un catálogo de prueba
  y a la vez verificar que no se lleva por delante el resto de la página) y
  el prop `catalogo?` de `PaginaCampanas` (mismo patrón que
  `CampanasPortada`/`Galeria`).
- @s31 (todas sin título → mismo aviso de vacío) → describe `@s31 caso
  límite — si ninguna campaña del catálogo es válida se muestra el mismo
  aviso de vacío`. Cazó un bug real de React (keys duplicadas `key={''}`)
  antes incluso de llegar a la aserción — confirma que el filtro de título
  vacío (@s31/@s32) hacía falta, no solo por el aviso.
- @s32 (una sin título se descarta, el resto se sigue mostrando) → describe
  `@s32 caso límite — una campaña sin título se descarta y el resto se
  sigue mostrando`. Pasó a la primera (generalización de @s31: mismo
  filtro).
- @s33 (precio → fallo cerrado) → `PaginaCampanas-logica.test.ts`, describe
  `@s33 una campaña con precio hace fallar cerrada la construcción del
  catálogo`.
- @s34 (vigencia → fallo cerrado) → describe `@s34 una campaña con
  vigencia hace fallar cerrada la construcción del catálogo`.
- @s35 (plazas → fallo cerrado) → describe `@s35 una campaña con plazas
  hace fallar cerrada la construcción del catálogo`.
- @s36 (punto no publicado → fallo cerrado) → describe `@s36 un punto que
  el cliente no publica hace fallar cerrada la construcción del catálogo`.
- @s37 (punto en blanco no pinta `<li>` vacío) → `PaginaCampanas.test.tsx`,
  describe `@s37 caso límite — un punto en blanco no pinta un elemento de
  lista vacío`. Forzó separar "filtrar blancos" de "validar publicados"
  (los blancos se descartan ANTES de comprobar publicación, si no un punto
  en blanco se rechazaba como "no publicado" en vez de simplemente
  omitirse).
- @s38 (bloque sin puntos → sin encabezado ni lista vacía) → describe `@s38
  caso límite — una campaña cuyo bloque no publica ningún punto no muestra
  encabezado ni lista vacía`.
- @s39 (ficha sin otras → sin sección "Otras campañas") → describe `@s39
  caso límite — una ficha sin otras campañas no muestra la sección «Otras
  campañas»`.
- @s40 (duración → fallo cerrado) → `PaginaCampanas-logica.test.ts`,
  describe `@s40 una campaña con duración hace fallar cerrada la
  construcción del catálogo`.
- @s41 (decisión de suavizado es función pura, 3 vías) → describe `@s41 la
  decisión de suavizar el desplazamiento al abrir una ficha es una función
  pura de la preferencia de movimiento`. Extrae `decidirComportamientoDesplazamiento`
  a `PaginaCampanas-logica.ts` (antes inline en el efecto de `VistaFicha`)
  — refactor en verde, cero cambio de comportamiento observable, confirmado
  por la suite completa siguiendo en verde antes y después.

## Nota de orden: @s37-@s39 después de @s40

El ciclo real no siguió el orden numérico estricto en el tramo final:
@s33→@s34→@s35→@s36 se hicieron en orden, pero @s40 (duración) se
implementó inmediatamente después de @s36, antes de volver a @s37/@s38/@s39.
Motivo: @s33-@s36 y @s40 comparten el mismo mecanismo (guarda de fallo
cerrado en `comprobarDatosPendientesNoDeclarados`/`comprobarPuntosPublicados`)
y se encadenaron sin darse cuenta del salto hasta revisar el `.feature` de
nuevo. Ningún escenario se dejó sin su propio ciclo Rojo→Verde dedicado (se
verificó cada uno en rojo antes de implementar), así que la cobertura es
completa; se documenta aquí la desviación de orden por transparencia, no
para ocultarla.

## Bitácora ciclo a ciclo

### @s1 — La página comparte cabecera y pie con la landing y se marca como página actual

- **ROJO**: `src/pages/PaginaCampanas.test.tsx` nuevo, renderiza `<App />`
  completa en `/campanas` (Background: ancho ≥ punto de corte) y comprueba
  banner/contentinfo/main (exactamente 1 cada uno), nav "Navegación
  principal" con 8 enlaces, `aria-current="page"` solo en "Campañas".
  Confirmado en rojo: `role "main"` no existía en ningún sitio (ni
  `/campanas` ni el resto de la app) — `PaginaNoEncontrada` no lo declara.
- **VERDE, mínimo**:
  - `src/pages/PaginaCampanas.tsx`: `<main></main>` vacío (ninguna otra
    cláusula de @s1 lo exige todavía).
  - `src/App.tsx`: añade `<Route path="/campanas" element={<PaginaCampanas />} />`;
    extrae `AppInterior` (dentro de `<BrowserRouter>`) para poder llamar
    `useLocation()` y pasarle `rutaActual={pathname}` a `Cabecera`.
  - `src/App-logica.ts`: quita `/campanas` de `RUTAS_DE_SUBPAGINA`
    (`RUTAS_YA_CON_PAGINA_PROPIA`).
  - `src/components/Cabecera-logica.ts`: `esPaginaActual`.
  - `src/components/Cabecera.tsx`: prop `rutaActual`, `aria-current`
    condicional en `ListaDeEnlaces`.
  - Ajustes mecánicos para no romper el contrato ya aprobado de
    `ensamblaje_landing` (ver sección de arriba): `src/App-logica.test.ts`,
    `src/App.test.tsx` (`@s12`, primer describe).
- **Lint**: `RUTAS_YA_CON_PAGINA_PROPIA` como `string[]` disparó
  `unicorn/prefer-set-has` de oxlint → cambiado a `ReadonlySet<string>` +
  `.has()`. `PaginaCampanas.test.tsx` necesitó `import React from 'react'`
  usado en posición de tipo (`React.JSX.Element`) para satisfacer a la vez
  `react-in-jsx-scope` (oxlint) y `noUnusedLocals` (tsc) — mismo patrón que
  `App.test.tsx`.
- **Verificado**: `pnpm run test` 343/343 (34 ficheros; -1 por reducir el
  `it.each` de `@s12` de 3 a 2 casos, +1 por el nuevo test de @s1, neto 0).
  `pnpm run verificar` limpio. `Cabecera.test.tsx` (16 tests) y
  `Cabecera-logica.test.ts` re-verificados en verde sin cambios de
  comportamiento para sus escenarios ya aprobados.
- **REFACTOR**: ninguno necesario todavía (implementación mínima, sin
  duplicación introducida).

### @s2-@s6 — Listado: encabezado, migas, tarjetas, badge/bloque, aviso, enlace propio

Cinco ciclos Rojo-Verde cortos y directos, todos sobre `src/pages/PaginaCampanas.tsx`
+ `src/pages/PaginaCampanas.test.tsx` (renderizando `<App/>` en `/campanas`).

- **@s2**: ROJO — `role "main"` sin `h1` ni nav "Ruta" (solo existía `<main>` vacío
  de @s1). VERDE — `RutaListado` (nav aria-label "Ruta", `<Link to="/">Inicio</Link>` +
  `<li aria-current="page">Campañas</li>`) + `<h1>Campañas de prevención</h1>`.
- **@s3**: ROJO — "listitem" ambiguo (el `<li>` de la miga de pan también cuenta);
  corregido escopando la aserción a `getByRole('list', {name:'Listado de campañas'})`
  antes de reintentar. VERDE — `<ul aria-label="Listado de campañas">` mapeando
  `CAMPANAS_DEMO` (todavía sin `construirCatalogoCampanas`, Ley 3: lo mínimo que
  este rojo pide) a `<li><h2>{titulo}</h2></li>`.
- **@s4**: ROJO — sin badge ni texto de bloque. VERDE — `<span>Demostración</span>` +
  `<p>Bloque de servicios: {campana.bloque}</p>`. Esto **exigió extender
  `CampanaDemo`/`CAMPANAS_DEMO`** (`src/data/campanas.ts`): campos nuevos `id?`,
  `bloque?`, `puntos?`, `plazas?`, `duracion?`, todos opcionales (ver "Diseño previo").
  `puntos` se calcula con `puntosDelBloque(bloque)` (busca en `SERVICIOS` importado,
  lanza si el bloque no existe — error de programación, no de dato ausente), nunca
  retipeado a mano. Reverificado tras el cambio: `CampanasPortada.test.tsx` +
  `CampanasPortada-logica.test.ts` (24 tests: 17 + 7) siguen en verde sin tocarlos.
- **@s5**: ROJO — aviso ausente. VERDE — `AVISO_DEMOSTRACION` (literal exacto de la
  cabecera del `.feature`) en un `<p>` entre el `h1` y la `<ul>`.
- **@s6**: ROJO — 0 enlaces por tarjeta. VERDE — `<Link to={\`/campanas?campana=${campana.id}\`}>Ver la ficha de {campana.titulo}</Link>`
  dentro de cada `<li>`. Se eligió `<Link>` de `react-router` (no `<a>` + `pushState`
  manual como hace `Cabecera.tsx`): un `<a>` sin interceptar dispara "navigation to
  another Document", no implementado en jsdom — con tantos enlaces internos en esta
  página, replicar el patrón manual en cada uno habría sido duplicación significativa.

Refactor aplicado en verde durante este tramo: extraídos `TarjetaCampana`,
`VistaListado` como componentes con props tipadas (evita un único `PaginaCampanas`
monolítico desde el principio, ya con 3 tarjetas × 4 piezas de contenido cada una).

### @s7-@s11 — Ficha: apertura, URL, foco, deep-link, Atrás

- **@s7**: ROJO — clic en "Ver la ficha de Vacunaciones" no cambiaba el `h1` (seguía
  "Campañas de prevención"). VERDE — introducido `src/pages/PaginaCampanas-logica.ts`
  (`construirCatalogoCampanas`: mapea `CampanaDemo[]` opcional a `CampanaValidada[]`
  con campos resueltos, sin guardas todavía — Ley 3, se generalizará cuando @s31+ lo
  pidan; `resolverVista`: 2 variantes `listado`/`ficha` según `campana.find(id)`,
  se generalizará a 3 en @s27) + `PaginaCampanas` usa `useSearchParams` para
  ramificar entre `VistaListado`/`VistaFicha`.
- **@s8**: pasó a la primera (mecanismo de `<Link>` ya cablea `pushState`). Verificado
  que el test SÍ muerde: sabotaje manual (`campana.id` → literal `'OTRA'` en el
  `href`), confirmado rojo, revertido a verde.
- **@s9**: ROJO — `document.activeElement` no era el `h1`. VERDE — `useRef` +
  `useEffect(() => encabezadoRef.current?.focus(), [campana.id])` +
  `tabIndex={FUERA_DEL_TAB_ORDER}` (`-1`, constante nombrada, sin números mágicos).
- **@s10**: ROJO — deep-link directo a `/campanas?campana=vacunaciones` mostraba el
  h1 correcto (ya funcionaba por @s7-@s9) pero sin el texto "Demostración" en la
  ficha. VERDE — badge `<span>Demostración</span>` añadido a `VistaFicha`.
- **@s11**: ROJO — `window.history.back()` no actualizaba `window.location`
  síncronamente en jsdom (jsdom 30 lo resuelve como tarea async real, no una
  actualización síncrona); la primera versión del test (con `act(async () => {...
  waitFor ...})`) disparó el aviso de React "environment not configured to support
  act(...)" (falla cerrada por el arnés: cualquier warning de consola es un test
  rojo, `src/test/setup.ts`). Corregido sin anidar `waitFor` dentro de `act()`: solo
  `window.history.back()` seguido de `await waitFor(...)` a nivel de test. VERDE —
  ningún cambio de producción hizo falta (el `popstate` que ya escucha `BrowserRouter`
  internamente basta); el ciclo fue 100% de ajuste del arnés de test, documentado
  aquí para que quede trazado por qué el primer intento falló.

### @s12-@s20 — Ficha: puntos publicados, aviso, panel pendiente, CTAs, migas, imágenes

- **@s12/@s13**: ROJO — sin bloque "Qué publica la clínica". VERDE — `BloquePublicado`
  (h2 + párrafo con el título/bloque interpolados entre comillas latinas + `<ul>` de
  `campana.puntos`). @s13 (Odontología/Especialidades) pasó a la primera:
  generalización directa de @s12 sobre datos distintos, sin tocar producción.
- **@s14**: ROJO — sin aviso en la ficha. VERDE — mismo `AVISO_DEMOSTRACION` (constante
  compartida) añadido a `VistaFicha`.
- **@s15**: ROJO — sin panel "Datos pendientes de confirmar". VERDE — `PanelDatosPendientes`
  (`<section aria-label>` + `<dl>` de 3 pares término/valor, todos "Pendiente de
  confirmar con la clínica").
- **@s16/@s17**: ROJO — sin CTAs. VERDE — `LlamadasAAccion` (enlace `tel:` derivado de
  `datosNegocio.telefonoClinica` de `src/lib/site.ts`, nunca escrito a mano; enlace
  "Reservar cita" a "/#reservar").
- **@s18**: ROJO — sin migas de 3 niveles en la ficha. VERDE — `RutaFicha` (Inicio →
  Campañas → título actual).
- **@s19**: ROJO — sin bloque "Otras campañas". VERDE — `otrasCampanas` (lógica pura,
  `PaginaCampanas-logica.ts`) + `BloqueOtrasCampanas`/`OtraCampanaTarjeta`. **Rompió
  @s7** (el enlace de "otras campañas" reusaba el texto "Ver la ficha de X", que @s7
  prohíbe fuera del listado) — corregido sin escribir un test nuevo (el rojo ya
  existía, era @s7 mismo): el nombre accesible de esos enlaces pasa a ser solo el
  título, envuelto en `<h3>`.
- **@s20**: ROJO — 0 imágenes. VERDE — `<img src={campana.imagen} alt="" />` en cada
  tarjeta del listado (alt vacío, no aporta palabras al nombre accesible del enlace
  contiguo).

### @s21-@s23 — Scroll con `prefers-reduced-motion`

Diseño explícito (pedido por el encargo): reutilizar `prefiereMenosMovimiento`
(`Galeria-logica.ts`) en vez de reimplementar el fallo cerrado de 3 vías, ya que esa
función ya lo resuelve exactamente (`consulta no disponible → true`). Se citó
literalmente en el encargo que "no hay precedente exacto en Galería" (el disparador
es distinto: abrir una ficha vs. pulsar un botón de carrusel) — pero la PREFERENCIA en
sí es la misma preferencia del sistema, así que reutilizar su lectura es la decisión
correcta, no una desviación del encargo.

- **@s21**: ROJO — `window.scrollTo` nunca se llamaba. VERDE — `useEffect` de
  `VistaFicha` añade `window.scrollTo({ top: 0, behavior: ... })`, con la preferencia
  fijada a "reduce" en el test (`fijarPreferenciaDeMovimiento(true)`, mismo patrón que
  `Galeria.test.tsx`).
- **@s22**: pasó a la primera (rama `!prefiereMenosMovimiento` ya existía desde @s21).
- **@s23**: pasó a la primera (`prefiereMenosMovimiento` ya falla cerrado a "true" sin
  `matchMedia`, probado y cerrado en su feature de origen). Confirma que la
  reutilización fue la decisión correcta: cero código nuevo necesario para el caso
  límite más delicado.

### @s24-@s26 — Prohibiciones de contenido en las 4 vistas

Hallazgo real durante @s24: el aviso de demostración (`AVISO_DEMOSTRACION`, literal
exacto exigido por @s5/@s14) contiene la palabra "Precio" dentro de la frase
"Precio, vigencia, plazas y condiciones están pendientes de confirmar con la
clínica." — un `expect(texto).match(/Precio/g)).length === 1` contaba 2 apariciones
en las fichas (aviso + etiqueta del panel), aparentemente contradiciendo "la única
aparición... es la etiqueta del panel". Resuelto sin tocar ningún literal ya
aprobado: la cláusula se interpreta como "la palabra como ELEMENTO PROPIO" (nombre
exacto de un nodo, `within(main).queryAllByText('Precio', {exact:true})`), no como
subcadena dentro de una frase más larga — la mención en el aviso es parte de una
oración, no una etiqueta. Mismo criterio aplicado a "Vigencia"/"Plazas" en @s25
(en el aviso aparecen en minúscula, "vigencia"/"plazas", así que ni siquiera
coinciden con el `exact: true` de las etiquetas capitalizadas). Los `it.each`
originales de @s24/@s25 se reescribieron como dos bloques (listado / 3 fichas) para
evitar `expect` condicional (`vitest(no-conditional-expect)` de oxlint).

- **@s24**: ROJO → VERDE sin cambio de producción (el catálogo ya no tenía lenguaje de
  precio); el ciclo fue enteramente de ajuste del test tras el hallazgo de arriba.
- **@s25**: pasó a la primera tras aplicar el mismo criterio de @s24.
- **@s26**: pasó a la primera (sin urgencias/24h/datos ajenos en ningún literal ya
  escrito; el único "estado" (`<span>`) es siempre "Demostración" por construcción).

### @s27-@s32 — Fallback de id desconocido/vacío, catálogo vacío, títulos inválidos

- **@s27**: ROJO — sin aviso "status" ni rama de fallback. VERDE — `resolverVista` se
  generaliza de 2 a 3 variantes (`listado` / `listado-no-encontrada` / `ficha`);
  `VistaListado` gana el prop `noEncontrada` que renderiza un `<output>` (oxlint
  `jsx-a11y/prefer-tag-over-role` prohíbe `<p role="status">`; `<output>` tiene rol
  "status" implícito) con el literal exacto.
- **@s28**: pasó a la primera — el aviso es un literal fijo, nunca interpola el
  parámetro recibido (ni siquiera hace falta escapar nada: el diseño ya lo evita por
  construcción, no por sanitización defensiva).
- **@s29**: pasó a la primera (`resolverVista` ya trata id vacío como "listado" desde
  su primera versión en @s7).
- **@s30**: ROJO — `PaginaCampanas` no aceptaba `catalogo` y no había aviso de vacío.
  VERDE — prop `catalogo?` (mismo patrón que `CampanasPortada`) + rama
  `catalogo.length === 0` en `VistaListado`. Introduce el helper de test
  `renderizarPaginaConCatalogo` (compone `Cabecera`+`PaginaCampanas`+`PieDePagina`,
  el mismo shell que `App.tsx`) para poder inyectar catálogos de prueba y a la vez
  verificar que el caso límite no descuelga el resto de landmarks de la página.
- **@s31**: ROJO — con 3 títulos vacíos, React lanzaba un warning real de claves
  duplicadas (`key={''}` en las 3 tarjetas) antes de llegar siquiera a la aserición
  de contenido — el arnés lo convirtió en test rojo (cero warnings tolerados). VERDE
  — `construirCatalogoCampanas` filtra `titulo.trim() !== ''` antes de mapear (mismo
  patrón que `CampanasPortada-logica.ts`).
- **@s32**: pasó a la primera (generalización directa de @s31: mismo filtro, catálogo
  mixto en vez de tres vacíos).

### @s33-@s36, @s40 — Guardas de fallo cerrado (lógica pura)

Mismo patrón que `CampanasPortada-logica.ts` (@s9/@s10 de esa feature), extendido a
plazas y duración sin tocar esa función ya cerrada (violaría Ley 1 sobre una feature
`done` con mutación 100%): `PaginaCampanas-logica.ts` tiene su PROPIA
`comprobarDatosPendientesNoDeclarados`, con el mismo estilo de mensaje
(`errorXNoConfirmado(titulo, valor)`).

- **@s33/@s34/@s35/@s40** (precio/vigencia/plazas/duración): 4 ciclos idénticos en
  `PaginaCampanas-logica.test.ts` — ROJO (guarda ausente) → VERDE (una cláusula `if`
  más en `comprobarDatosPendientesNoDeclarados`, con su propio mensaje literal).
- **@s36** (punto no publicado): ROJO — sin validación de puntos. VERDE —
  `comprobarPuntosPublicados` valida cada punto contra `PUNTOS_PUBLICADOS` (`Set`
  derivado de `SERVICIOS.flatMap(...)`, nunca retipeado a mano).

### @s37-@s39 — Casos límite de puntos y "Otras campañas"

- **@s37**: ROJO — un punto en blanco se rechazaba como "no publicado" (el guardián de
  @s36 no distinguía "blanco" de "inválido"). VERDE — se separa `puntosNoVacios`
  (filtra blancos) de `comprobarPuntosPublicados` (valida lo que queda): los blancos
  se descartan ANTES de validar publicación, nunca llegan a la comprobación ni al
  render.
- **@s38**: ROJO — con `puntos: []`, `BloquePublicado` seguía pintando el h2 y una
  `<ul>` vacía. VERDE — `BloquePublicado` devuelve `null` si `campana.puntos.length
  === 0`.
- **@s39**: ROJO — con una única campaña, `BloqueOtrasCampanas` pintaba igualmente el
  h2 "Otras campañas" con una lista vacía. VERDE — devuelve `null` si
  `campanas.length === 0` (mismo patrón que @s38).

### @s41 — La decisión de suavizado como función pura, extraída y testeada directamente

ROJO — `decidirComportamientoDesplazamiento` no existía como símbolo exportado (el
cálculo vivía inline en el `useEffect` de `VistaFicha` desde @s21). VERDE — extraída a
`PaginaCampanas-logica.ts` (una línea: `prefiereMenosMovimiento(...) ? 'auto' :
'smooth'`), con 3 tests directos (uno por fila de la tabla del escenario) usando un
doble mínimo de `matchMedia` propio (no importado de producción, patrón
`doble-de-test-anclado-al-literal-no-al-simbolo`). REFACTOR en verde: `VistaFicha`
pasa a llamar `decidirComportamientoDesplazamiento(window.matchMedia)` en vez de
repetir el cálculo — cero cambio de comportamiento observable, confirmado por la
suite completa (`PaginaCampanas.test.tsx` + `PaginaCampanas-logica.test.ts`) en verde
antes y después del refactor.

## Verificación final

- `pnpm run test`: **401/401** (35 ficheros; baseline 343/33 + 58 tests nuevos de
  esta feature: 44 en `PaginaCampanas.test.tsx`, 12 en `PaginaCampanas-logica.test.ts`,
  3 nuevos en `Cabecera-logica.test.ts` para `esPaginaActual`, neto −1 en
  `App.test.tsx` por reducir el `it.each` de @s12 de 3 a 2 casos — 343 + 44 + 12 + 3
  − 1 = 401 ✓).
- `pnpm run verificar` (`oxlint --deny-warnings` + `tsc -b`): limpio.
- `node .harness/harness.mjs init`: **verde de punta a punta** (entorno, ficheros
  base, `feature_list.json`, lint, 401/401 tests).
- **Regresión de `campanas_portada` (id 9, ya `done`, 216 tests, 100% mutación)**:
  re-ejecutada explícitamente tras extender `CampanaDemo`/`CAMPANAS_DEMO`
  (`src/components/CampanasPortada.test.tsx` + `CampanasPortada-logica.test.ts`, 28
  tests) — verde sin ninguna modificación a esos dos ficheros ni a
  `CampanasPortada.tsx`/`CampanasPortada-logica.ts`.
- **Regresión de `cabecera_y_navegacion` (id 3, ya `done`, 100% mutación)**:
  `Cabecera.test.tsx` (16 tests, ninguno modificado) sigue en verde tras añadir el
  prop opcional `rutaActual` — ningún test de ese fichero pasa ese prop, así que
  ninguno cambia de comportamiento.
- **Regresión de `ensamblaje_landing` (id 20, ya `done`, 100% mutación sobre no
  equivalentes)**: `App.test.tsx` y `App-logica.test.ts` actualizados
  deliberadamente (no accidentalmente) para reflejar que `/campanas` ya no es
  catch-all — diff documentado en la sección "Cambios fuera de `src/pages/`" al
  principio de este fichero. El resto de sus escenarios (shell común, anclas,
  resize, `#root`, orden de secciones) no se tocaron.

## Pendiente, no bloqueante

- Los ficheros de imagen locales concretos de las 3 campañas
  (`/img/campanas/*.webp`) no existen aún en el repositorio — mismo PENDIENTE ya
  anotado en `src/data/campanas.ts` desde `campanas_portada`, no introducido por
  esta feature.
- Verificación en navegador real de las cláusulas de @s21-@s23 no medibles en jsdom
  con precisión de píxel (Decisión 11 de `project-spec.md`): jsdom no hace layout,
  así que `window.scrollTo`/`Element.prototype.focus` se verifican como espías
  (se pidió la llamada correcta), no como movimiento físico real. Mismo patrón ya
  aceptado en `galeria.feature` @s9/@s10.
- El catálogo de servicios (`SERVICIOS`) declara "Odontología" en dos bloques
  ("Cirugía y anestesia" y "Especialidades"); esta feature ancla la campaña
  "Odontología" a "Especialidades", igual que `campanas_portada` — PENDIENTE ya
  anotado en la cabecera del `.feature`, no resuelto aquí (requiere confirmación del
  cliente).

## Ronda 2 — refuerzo de mutación (`mutation_tester` ronda 1: FAIL, 93.75%)

Encargo del `craftsman_lead`: la medición oficial de mutación
(`progress/mutation_pagina_campanas.md`, ronda 1) dio **FAIL** sobre
`src/pages/PaginaCampanas-logica.ts` — 87/95 mutantes no-equivalentes,
8 supervivientes agrupados en 5 huecos de test, 0 timeouts. Se lee esa
entrada completa (sección "Mutantes sobrevivientes reales") antes de tocar
nada.

**Los 8 mutantes, verificados no equivalentes por el propio informe** (los
ocho cambian comportamiento observable real, ninguno es un defecto de diseño
irreproducible): son huecos de aserción/cobertura, no bugs del código actual
(que ya devuelve `Error` real en `errorPuntoNoPublicado`, ya recorta
`idParam`, ya usa `.trim()` en el filtro de título, ya resuelve
`id`/`bloque`/`imagen` a valores concretos y ya distingue `null` de `''` en
`idParam`). Mismo criterio que la Ronda 3 de `campanas_portada`
(`progress/tdd_campanas_portada.md`) y que `datos_negocio`/`galeria`.

**Decisión: reforzar solo tests, sin tocar producción.**

### R2.1 — mutante `errorPuntoNoPublicado` body emptied (línea 54-58, @s36)

- Test nuevo en `PaginaCampanas-logica.test.ts`, dentro del `describe` de
  `@s36`: captura el valor lanzado por `try/catch` y asegura
  `expect(lanzado).toBeInstanceOf(Error)` + el mensaje exacto con `.toBe(...)`,
  mismo patrón que el segundo test de @s33/@s34/@s35/@s40 (y que R3.1/R3.2 de
  `campanas_portada`).
- **Verificación por sabotaje manual** (reproduce el mutante citado
  literalmente en el informe): `errorPuntoNoPublicado` reescrita para
  devolver `undefined as unknown as Error` en vez de `new Error(...)`.
  Confirmado: **exactamente** el nuevo test se pone en rojo (`expected
  undefined to be an instance of Error`), los otros 16 siguen en verde.
  Revertido byte a byte.

### R2.2-R2.4 — `normalizarCampana`: defaults de `id`/`bloque` y rama de `imagen` ausente (líneas 77/79/82-84)

- `NoCoverage` en los tres porque ningún test previo construye un catálogo
  válido (que no lance) con una entrada a la que le falten `id`, `bloque` o
  `imagen`: todos los catálogos de `PaginaCampanas-logica.test.ts` (@s33-@s36
  /@s40) llevan un campo prohibido que lanza antes de llegar a
  `normalizarCampana`, y los de `PaginaCampanas.test.tsx` siempre parten de
  `CAMPANAS_DEMO`, que rellena los tres campos en sus tres entradas.
- Test nuevo, describe dedicado (`construirCatalogoCampanas resuelve id,
  bloque e imagen ausentes...`, soporte de @s3/@s4/@s6/@s20 — los escenarios
  que dan por hecho que esos campos ya llegan resueltos): catálogo de una
  única entrada `{ titulo: 'Campaña sin datos opcionales' }` (sin `id`, sin
  `bloque`, sin `imagen`, sin `puntos`, sin ningún campo prohibido, así que
  no lanza). Asserts: `id` y `bloque` caen a `''`, `puntos` cae a `[]`, y
  **ninguna clave `imagen` se añade al objeto** (`!Object.hasOwn(campana,
  'imagen')`) — esta última aserción, no `toEqual`, porque `toEqual` ignora
  propiedades con valor `undefined` y no distinguiría "la clave no existe" de
  "la clave existe con valor `undefined`", que es exactamente lo que produce
  cada uno de los tres mutantes de este grupo.
- **Verificación por sabotaje manual, mutante por mutante** (los 3 recreados
  literalmente):
  - `id: campana.id ?? 'Stryker was here!'` + `bloque: campana.bloque ??
    'Stryker was here!'`: el nuevo test cae en la primera aserción de `id`
    (`expected [ 'Stryker was here!' ] to deeply equal [ '' ]`).
  - `if (false) { return validada }` (mutante de la condición
    `campana.imagen === undefined` a `false`): el nuevo test cae en la
    aserción de `Object.hasOwn` (`expected false to be true`) — con la
    condición forzada a `false`, el código cae siempre al `return { ...
    validada, imagen: campana.imagen }`, que añade `imagen: undefined` como
    clave explícita.
  - `if (campana.imagen === undefined) { }` (bloque vaciado, la guarda sigue
    evaluándose pero ya no hace nada): mismo resultado y misma aserción que
    el punto anterior, confirmado con la condición original intacta.
  - En los tres casos, exactamente el nuevo test cae; los otros 16 (o 17, en
    el primer caso) siguen en verde. Revertido byte a byte tras cada uno.

### R2.5 — mutante `.trim()` eliminado del filtro de título (línea 98, soporte de @s31/@s32)

- Mismo patrón que R3.3 de `campanas_portada`: test nuevo, describe dedicado,
  catálogo de 3 entradas con la del medio a título `'   '` (solo espacios),
  junto a dos títulos válidos; asegura longitud 2 y que la de solo espacios
  se descarta igual que una cadena vacía.
- **Verificación por sabotaje manual**: `catalogo.filter((campana) =>
  campana.titulo !== '')` en vez de `.trim() !== ''` (mutante citado
  literalmente). Confirmado: exactamente el nuevo test cae (`expected length
  2 but got 3`), los otros 16 siguen en verde. Revertido.

### R2.6 — mutante `.trim()` eliminado de `idParam` (línea 113, soporte de @s7/@s8/@s10)

- Test nuevo, describe dedicado, unitario sobre `resolverVista` (la función
  pura exportada, no a través de render): catálogo de una campaña
  `vacunaciones`, se llama `resolverVista(catalogo, '  vacunaciones  ')`
  (id real con espacios alrededor) y se espera `{ tipo: 'ficha', campana:
  vacunaciones }`.
- **Verificación por sabotaje manual**: `const id = idParam ?? ''` (sin
  `.trim()`, mutante citado literalmente). Confirmado: exactamente el nuevo
  test cae (`expected { tipo: 'listado-no-encontrada' } to deeply equal {
  tipo: 'ficha', ... }` — sin recortar, el id con espacios no coincide con
  ningún id del catálogo). Revertido.

### R2.7 — mutante del valor por defecto `''` de `idParam` (línea 113, soporte de @s29)

- Test nuevo, describe dedicado, unitario sobre `resolverVista`: llama
  `resolverVista([], null)` (parámetro `campana` completamente ausente de la
  URL, no presente-y-vacío como en @s29) y espera `{ tipo: 'listado' }`. Se
  eligió el nivel unitario sobre la función pura en vez de un render
  completo porque es la forma mínima (Ley 2) de aislar exactamente el
  camino `idParam === null` sin depender de la codificación de
  `useSearchParams`.
- **Verificación por sabotaje manual**: `const id = (idParam ?? 'Stryker was
  here!').trim()` (mutante citado literalmente). Confirmado: exactamente el
  nuevo test cae (`expected { tipo: 'listado-no-encontrada' } to deeply
  equal { tipo: 'listado' }`). Revertido.

### Verificación final de la ronda

`git diff src/pages/PaginaCampanas-logica.ts`: **vacío** — cero cambios de
producción en esta ronda (los 8 hallazgos eran huecos de aserción/cobertura,
no defectos de comportamiento), verificado tras cada sabotaje y al cierre.

`pnpm exec vitest run src/pages/PaginaCampanas-logica.test.ts`: **17/17**
(12 originales + 5 nuevos: uno añade un segundo `it` a @s36, cuatro son
describes nuevos de refuerzo). `pnpm run test`: **406/406** (401 previos +
5 nuevos). `pnpm run verificar` (`oxlint --deny-warnings` + `tsc -b`):
limpio. `bin/harness init`: **verde de punta a punta**.

### Trazabilidad — mapa mutante → test (ronda 2)

| Mutante (informe oficial, `mutation_pagina_campanas.md`) | Test que lo mata |
| --- | --- |
| `errorPuntoNoPublicado` body emptied (línea 54-58) | `@s36` → `lo lanzado es una instancia real de Error con el mensaje exacto, no un valor vacío` |
| `id` default `''` → literal Stryker (línea 77, NoCoverage) | `refuerzo... resuelve id, bloque e imagen ausentes...` (soporte @s3/@s4/@s6/@s20) → `id y bloque caen a cadena vacía...` |
| `bloque` default `''` → literal Stryker (línea 79, NoCoverage) | mismo test que el anterior |
| `campana.imagen === undefined` → `false` (línea 82, Survived) | mismo test, aserción `Object.hasOwn` |
| bloque `return validada` vaciado (línea 82-84, NoCoverage) | mismo test, aserción `Object.hasOwn` |
| `.trim()` eliminado del filtro de título (línea 98) | `refuerzo... descarta también un título compuesto solo por espacios...` (soporte @s31/@s32) |
| `.trim()` eliminado de `idParam` (línea 113, MethodExpression) | `refuerzo... resolverVista recorta los espacios...` (soporte @s7/@s8/@s10) |
| default `''` de `idParam` → literal Stryker (línea 113, StringLiteral) | `refuerzo... resolverVista trata un parámetro "campana" completamente ausente...` (soporte @s29) |

### Pendiente antes de `done`

No se marca `done` — falta que `mutation_tester` repita la medición oficial
sobre `src/pages/PaginaCampanas-logica.ts` (y, por completitud del
`git diff --stat` de la feature, `src/App-logica.ts` y
`src/components/Cabecera-logica.ts`, que ya estaban al 100%/equivalente en
la ronda 1 y no se tocaron aquí) y confirme 100% sobre no-equivalentes. El
`judge` ya había aprobado la ronda 1 sin cambios requeridos; esta ronda solo
añade tests, no toca ningún fichero de `src/` de producción.
