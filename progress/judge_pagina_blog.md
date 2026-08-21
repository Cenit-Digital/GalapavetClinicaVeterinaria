# Review — feature pagina_blog (id 17)

**Veredicto:** APPROVED

## Contexto de esta revisión (ronda 3 — refuerzo de mutación)

Esta ronda evalúa específicamente lo que pide el propio `progress/tdd_pagina_blog.md`
en su sección "Ronda 3 — cierre de huecos de mutación": 13 tests nuevos en
`src/pages/PaginaBlog-logica.test.ts`, cero cambios de producción, tras el
`mutation_tester` ronda 1 con veredicto FAIL (99/118 = 83.90% bruto, 99/116 =
85.34% sobre no equivalentes, 17 supervivientes reales documentados en
`progress/mutation_pagina_blog.md`). El `judge` ronda 2 (histórico, ya en este
mismo fichero antes de esta revisión) había dado APPROVED sobre el estado
previo a la medición de mutación; esta ronda relee el contrato completo desde
cero (no solo el diff) y verifica de forma independiente tanto la cobertura de
los 31 `@s` como el hallazgo de mutación cerrado.

- `features/pagina_blog.feature` releído completo (503 líneas: cabecera con
  los 11 puntos de apartamiento del prototipo, reglas R1/R2/R3, Background de
  6 artículos, 31 escenarios `@s1`-`@s31`, sección PENDIENTE).
- `progress/tdd_pagina_blog.md` releído completo (444 líneas: rondas 1, 2 y 3).
- `progress/mutation_pagina_blog.md` releído completo (informe de la ronda 1
  de mutación, FAIL con 17 supervivientes reales + 2 equivalentes).
- `progress/gherkin_repair_pagina_blog.md` leído para contexto de por qué el
  `.feature` tiene 31 escenarios y no 29 (reparación previa a la puerta
  humana, `@s30`/`@s31` añadidos entonces).
- `project-spec.md` releído en las secciones relevantes (línea 282, sección
  `pagina_blog`; Decisiones 1, 2, 9).
- Producción revisada línea a línea: `src/pages/PaginaBlog.tsx` (242 líneas),
  `src/pages/PaginaBlog-logica.ts` (148 líneas, sin cambios respecto a la
  ronda 2, confirmado), `src/data/blog.ts` (132 líneas), `src/data/servicios.ts`,
  `src/lib/desplazamiento.ts`, `src/App.tsx`, `src/App-logica.ts`.
- Tests revisados línea a línea: `src/pages/PaginaBlog.test.tsx` (644 líneas,
  28 tests), `src/pages/PaginaBlog-logica.test.ts` (435 líneas, 49 tests — 36
  de rondas 1-2 + 13 nuevos de la ronda 3), `src/App.test.tsx`,
  `src/App-logica.test.ts`.
- `node .harness/harness.mjs init` ejecutado de forma independiente: verde
  (lint + typecheck limpios, 484/484 tests, 38/38 ficheros).
- Ejecución acotada adicional: `pnpm exec vitest run src/App.test.tsx
  src/App-logica.test.ts src/pages/PaginaCampanas.test.tsx
  src/pages/PaginaCampanas-logica.test.ts src/pages/PaginaBlog.test.tsx
  src/pages/PaginaBlog-logica.test.ts src/lib/desplazamiento.test.ts` →
  155/155 verde, 7/7 ficheros. Sin regresión en `pagina_campanas`,
  `ensamblaje_landing` ni `cabecera_y_navegacion`.
- Verificación propia de disciplina de mutación (no me fié solo de la
  bitácora): apliqué a mano 2 de los 17 sabotajes que documenta
  `progress/tdd_pagina_blog.md` ronda 3, uno a la vez, con reversión entre
  cada uno:
  - `PaginaBlog-logica.ts:66`, `/\d+\s?€/` → `/\d+\s€/` (id 26 del informe de
    mutación): confirmado 1 solo test rojo de 49
    ("un precio sin espacio antes de € también se rechaza (id 25/26...)"),
    exactamente como afirma la tabla de la ronda 3.
  - `PaginaBlog-logica.ts:112`, `split(/\s+/)` → `split(/\s/)` (id 74):
    confirmado 1 solo test rojo de 49
    ("el espaciado irregular (doble espacio)... (id 74 del informe)"), con
    el mensaje exacto `expected 2 to be 1` que predice la bitácora.
  - Tras cada sabotaje, `diff` byte a byte contra una copia de respaldo del
    fichero original confirmó reversión exacta antes de continuar; la
    ejecución final (`PaginaBlog-logica.test.ts` + `PaginaBlog.test.tsx`)
    volvió a dar 77/77 en verde con la producción real, y `git status` no deja
    ningún cambio inesperado en `src/`.

## Cobertura de escenarios (@s ↔ test)

- @s1: [x] `PaginaBlog.test.tsx` → el listado es una página propia con un único contenido principal y su encabezado
- @s2: [x] `PaginaBlog.test.tsx` → la página comparte cabecera y pie con la landing y se señala como página actual
- @s3: [x] `PaginaBlog.test.tsx` → el aviso de demostración encabeza el listado con su texto literal
- @s4: [x] `PaginaBlog.test.tsx` → el listado muestra un enlace por artículo, en el orden del catálogo, con su destino propio
- @s5: [x] `PaginaBlog.test.tsx` → cada tarjeta lleva la marca de demostración y ningún otro distintivo
- @s6: [x] `PaginaBlog.test.tsx` → ninguna tarjeta atribuye el texto a una persona ni lo fecha
- @s7: [x] `PaginaBlog-logica.test.ts` (CATEGORIAS_PUBLICADAS literal exacto, orden verificado contra SERVICIOS) + `PaginaBlog.test.tsx` (DOM: 6 botones, orden, aria-pressed)
- @s8: [x] `PaginaBlog-logica.test.ts` (filtrarPorCategoria) + `PaginaBlog.test.tsx` (destinos exactos con ?categoria=Análisis)
- @s9: [x] `PaginaBlog-logica.test.ts` (normalizarCategoriaSeleccionada + refuerzo ronda 3: recorte de espacios) + `PaginaBlog.test.tsx`
- @s10: [x] `PaginaBlog-logica.test.ts` + `PaginaBlog.test.tsx` (entrada directa filtrada)
- @s11: [x] `PaginaBlog-logica.test.ts` (filtrarPorCategoria vacío) + `PaginaBlog.test.tsx` (aviso exacto, 6 botones siguen)
- @s12: [x] `PaginaBlog-logica.test.ts` (valor corrupto cae a "Todos") + `PaginaBlog.test.tsx` (sin fuga de script en el DOM)
- @s13: [x] `PaginaBlog.test.tsx` (catálogo vacío inyectado vía renderizarBlogConCatalogo)
- @s14: [x] `PaginaBlog.test.tsx` → abrir un artículo lleva a su propia dirección y lo muestra completo (pathname real /blog/demo-3, sin query param)
- @s15: [x] `PaginaBlog.test.tsx` → la vista de artículo repite el aviso de demostración antes del cuerpo
- @s16: [x] `PaginaBlog.test.tsx` (cuerpo de prueba con 2 párrafos, 2 encabezados, 1 cita per Background; cuenta exacta de roles heading/blockquote/paragraph)
- @s17: [x] `PaginaBlog.test.tsx` → el artículo no muestra firma de autor, ni iniciales, ni fecha de publicación
- @s18: [x] `PaginaBlog-logica.test.ts` (it.each con la tabla completa 1/200/201/400/401 palabras → 1/1/2/2/3 min, VELOCIDAD_LECTURA_PPM === 200, + refuerzo ronda 3: separador entre bloques cuenta como espacio real)
- @s19: [x] `PaginaBlog-logica.test.ts` (cuerpo vacío/en blanco da null) + `PaginaBlog.test.tsx` (doble de demo-5, sin "0 min" en el DOM)
- @s20: [x] `PaginaBlog.test.tsx` → volver al listado conserva el filtro con el que se llegó
- @s21: [x] `PaginaBlog-logica.test.ts` (resolverArticulo inexistente) + `PaginaBlog.test.tsx` (sin article, sin h1 vacío)
- @s22: [x] `PaginaBlog-logica.test.ts` (articulosRelacionados) + `PaginaBlog.test.tsx` (demo-2 y demo-3, nunca demo-1)
- @s23: [x] `PaginaBlog-logica.test.ts` (sin otros de su categoría da vacío) + `PaginaBlog.test.tsx` (demo-6, sin bloque)
- @s24: [x] `PaginaBlog.test.tsx` → el cierre del artículo invita a pedir cita sin prometer nada
- @s25: [x] `PaginaBlog-logica.test.ts` (5 tests: autor/firma/iniciales inyectados vía cast de tipos sobre un artículo sintético, no el catálogo limpio; mensaje exacto verificado; "no se renderiza" comprobado como resultado nunca asignado)
- @s26: [x] `PaginaBlog-logica.test.ts` (longitud exacta 5 de PATRONES_PROHIBIDOS_DE_CONTENIDO, it.each de las 5 filas literales, artículo limpio que pasa, "nunca se renderiza" + refuerzo ronda 3: 9 tests de variantes sin espacio/separador y fragmento exacto del mensaje)
- @s27: [x] `PaginaBlog.test.tsx` (recorre listado + 6 artículos reales, monta/desmonta por ruta real, agrega texto, 22 términos prohibidos + presencia de los 6 títulos)
- @s28: [x] `PaginaBlog.test.tsx` → las imágenes son locales y solo describen lo que se ve (3 imágenes exactas, src local, alt correcto en la del cuerpo, alt vacío + sin nombre accesible en las 2 miniaturas)
- @s29: [x] `desplazamiento.test.ts` (cálculo puro, 2 filas exactas) + `PaginaBlog.test.tsx` (integración real: clic en el listado, window.scrollTo mockeado, auto/smooth según matchMedia)
- @s30: [x] `PaginaBlog-logica.test.ts` (5 artículos, uno actual, exactamente otro-1/otro-2/otro-3, nunca otro-4)
- @s31: [x] `PaginaBlog.test.tsx` → el tiempo de lectura calculado se muestra en una página de artículo real (doble de demo-2 con exactamente 200 palabras, montado por rutas reales, "1 min" dentro de role="article")

Los 31/31 escenarios tienen al menos un test concreto que los verifica. La
tabla de trazabilidad de `progress/tdd_pagina_blog.md` es fiel a lo que
encontré en el código, incluidos los 13 tests nuevos de la ronda 3.

## Disciplina TDD

- ¿Producción sin test que la pida? NO. `src/pages/PaginaBlog-logica.ts`
  no cambió en esta ronda (confirmado leyendo el fichero completo y
  comparándolo con la versión citada en la ronda 2 del propio
  `progress/tdd_pagina_blog.md`; la propia bitácora lo afirma con `git diff
  --stat` vacío, y lo confirmé independientemente restaurando mis propios
  sabotajes de verificación byte a byte). Los 13 tests nuevos de
  `PaginaBlog-logica.test.ts` (líneas 296-434) están cada uno dirigido a un
  mutante concreto ya documentado en `progress/mutation_pagina_blog.md`
  (id 25/26, id 24, id 46/47, id 45, id 49, id 28/30/33/43/35/40, id 2, id 4,
  id 53, id 74), citado por número en el propio nombre del test — no amplían
  el contrato: cada formato ejercitado ("49€", "90%", "24h", teléfonos sin un
  separador) ya está prohibido implícitamente por `@s27`, que cita
  literalmente esas mismas variantes sin espacio ("640221190", "918442160",
  "24h") como texto que no debe aparecer en ningún artículo.
- ¿Evidencia de Rojo→Verde→Refactor? SÍ, y de forma inusualmente verificable:
  dado que la producción de esta ronda no cambió, el "rojo" de cada test
  nuevo no pudo verificarse contra la propia producción en su momento de
  escritura (no había ningún comportamiento nuevo que provocarlo); en su
  lugar, la bitácora documenta que cada uno de los 17 mutantes del informe se
  aplicó a mano, se confirmó el rojo exacto, y se revirtió antes del
  siguiente — nunca dos sabotajes activos a la vez. Esta ronda de revisión
  reprodujo independientemente 2 de esos 17 (id 26, id 74) con el mismo
  resultado exacto que la tabla predice (1 solo test rojo cada vez, con el
  mensaje de fallo esperado), lo que da confianza razonable en que el resto
  de la tabla también es fiel al mismo patrón metódico. No hubo fase de
  Refactor en esta ronda porque no había duplicación que extraer (13 tests
  dirigidos, agrupados en 3 describe temáticos ya cohesionados).

## Calidad

### Verificación de los puntos (a)-(f) pedidos

- (a) Ruta de artículo como SEGMENTO real, no query param: confirmado.
  `src/App.tsx:55-56` registra `<Route path="/blog">` y
  `<Route path="/blog/:identificador">` como dos Route reales;
  `PaginaBlog.tsx:229` lee el identificador con useParams(). Los tests de
  @s4 y @s14 verifican href="/blog/demo-N" (sin "?") y
  window.location.pathname === "/blog/demo-3" tras un clic real, no un
  cambio de estado interno. El filtro de categoría sí usa query param
  (?categoria=...), correctamente distinto del identificador de artículo,
  tal como exige @s8/@s9.
- (b) App.tsx/App-logica.ts/App.test.tsx no rompen ensamblaje_landing ni
  pagina_campanas: confirmado por ejecución independiente de esta revisión
  (pnpm exec vitest run acotado a 7 ficheros → 155/155 verde) y por git
  status (ningún fichero de PaginaCampanas, Cabecera, Landing.tsx ni
  main.tsx aparece modificado). App.test.tsx:157-178 documenta
  explícitamente por qué @s12 pasó de iterar ['/blog', '/tienda'] a solo
  ['/tienda'], con la cobertura de contenido real de "/blog" remitida a
  PaginaBlog.test.tsx. Matiz no bloqueante heredado: ensamblaje_landing.feature
  sigue sin sincronizar su texto (ver más abajo).
- (c) El modelo de datos NO declara ni un campo opcional de autor, firma o
  iniciales: confirmado. src/data/blog.ts:43-50 define ArticuloDemo sin esas
  claves en absoluto (ni siquiera con "?"); no hay nada que omitir al
  renderizar, la forma del tipo ya lo impide en tiempo de compilación.
- (d) El validador falla cerrado con artículos de prueba que declaran los
  campos/textos prohibidos, no solo con el catálogo limpio: confirmado y
  reforzado en esta ronda. PaginaBlog-logica.test.ts:192-294 (rondas 1-2)
  inyecta autor/firma/iniciales mediante "as unknown as ArticuloDemo" sobre
  artículos sintéticos, no el catálogo real; los 9 tests nuevos de @s26
  (líneas 303-407) hacen lo mismo con variantes de formato (precio/porcentaje
  sin espacio, teléfono sin cada uno de los 3 separadores, "24h" sin
  espacio) — verificado en vivo por mí mismo con sabotaje real sobre 2 de
  esos casos, con resultado idéntico al documentado.
- (e) Las 5 categorías derivan de SERVICIOS, no están retipeadas: confirmado.
  PaginaBlog-logica.ts:15 — CATEGORIAS_PUBLICADAS = SERVICIOS.map((bloque) =>
  bloque.titulo). Verificado contra src/data/servicios.ts:16-51: el orden
  real (Cirugía y anestesia, Diagnóstico de imagen, Medicina general,
  Análisis, Especialidades) coincide carácter a carácter con @s7 y con el
  literal escrito a mano en PaginaBlog-logica.test.ts:31-37 (nunca comparado
  contra SERVICIOS reimportado).
- (f) El tiempo de lectura y "Sigue leyendo" viven en *-logica.ts, mordibles
  por Stryker: confirmado. calcularTiempoDeLectura, formatearTiempoDeLectura
  y articulosRelacionados viven en src/pages/PaginaBlog-logica.ts, dentro del
  glob mutate de stryker.config.json (src/**/*-logica.ts, verificado leyendo
  el fichero de configuración línea 12). PaginaBlog.tsx solo cablea sus
  resultados (líneas 202-203, 212).

### Hallazgos no bloqueantes (heredados de rondas anteriores, sin cambios)

1. Duplicación menor entre src/lib/desplazamiento.ts y
   PaginaCampanas-logica.ts (decidirComportamientoDesplazamiento definida dos
   veces con cuerpo idéntico). Ya razonado y aceptado en la ronda 2: no se
   reabre PaginaCampanas-logica.ts (ya done, mutado al 100%) solo para
   deduplicar 4 líneas triviales. Sigue como candidato a consolidación
   futura, no bloqueante.
2. features/ensamblaje_landing.feature desactualizado — su línea ~101 sigue
   citando la ruta de blog entre las que sirven el catch-all genérico, ya no
   cierto desde que App.tsx:55-56 le da su propia Route. Mismo patrón ya
   resuelto una vez al cerrar pagina_campanas. No afecta la cobertura de
   tests (App.test.tsx ya refleja el estado real). Queda, como en la ronda 2,
   como cambio de seguimiento para craftsman_lead al aceptar esta feature.

No encontré hallazgos nuevos de calidad en esta ronda: los 13 tests añadidos
son legibles, cada uno prueba una sola cosa, sin números mágicos sin nombrar
(las cifras de las regex sabotadas están citadas por su id del informe de
mutación en el propio nombre del test), y no introducen ninguna dependencia
ni patrón nuevo.

## Checkpoints

- C1: [x] Ficheros base y docs presentes; `node .harness/harness.mjs init`
  termina verde (lint y typecheck limpios, 484/484 tests, 38/38 ficheros),
  ejecutado de forma independiente en esta revisión.
- C2: [x] Una sola feature in_progress (pagina_blog, id 17, confirmado sobre
  feature_list.json como única coincidencia). Toda feature done conserva sus
  tests en verde (confirmado con la corrida acotada de 155 tests).
  progress/current.md describe la sesión activa de forma consistente con el
  resto de la bitácora.
- C3: [x] src/ solo contiene los módulos previstos por project-spec.md
  (catálogo del blog, páginas del blog, módulo compartido de desplazamiento,
  extensión aditiva de App.tsx/App-logica.ts). Sin dependencias nuevas no
  justificadas, sin console.log ni TODO sueltos en los ficheros tocados
  (verificado por búsqueda de texto). Matiz no bloqueante: duplicación menor
  con PaginaCampanas-logica.ts (ver arriba).
- C4: [x] Hay tests para cada módulo nuevo; sin dobles de sistema de
  ficheros; la corrida completa muestra 484 tests, todos verdes.
- C5: [ ] No evaluable del todo por el judge: la feature sigue in_progress a
  la espera de que mutation_tester repita su medición oficial y de que
  craftsman_lead la marque done y sincronice el seguimiento no bloqueante de
  ensamblaje_landing.feature. Mismo criterio aplicado en rondas anteriores
  del propio proyecto.
- C6: [x] Cobertura de escenarios completa, 31/31, sin código sin test que lo
  pida. Los 13 tests nuevos de la ronda 3 están correctamente atados a sus
  escenarios (@s9/@s10/@s12/@s18/@s26), ninguno se ancla a la constante de
  producción reimportada en vez del literal escrito a mano (verificado línea
  a línea en PaginaBlog-logica.test.ts).
- C7: [ ] No evaluado por el judge — corresponde a mutation_tester repetir su
  medición oficial sobre src/pages/PaginaBlog-logica.ts tras esta aprobación,
  para confirmar de forma independiente que los 17 ids documentados en
  progress/mutation_pagina_blog.md pasan a Killed y que el score alcanza el
  umbral (100% sobre no equivalentes, harness.config.json → mutation.threshold).
  Mi verificación propia de 2 de los 17 (arriba) da confianza razonable, pero
  no sustituye la medición oficial de Stryker.

## Cambios requeridos (si aplica)

Ninguno bloqueante. Dos notas de seguimiento no bloqueantes, heredadas sin
cambios desde la ronda 2, quedan documentadas arriba para cuando
craftsman_lead acepte la feature:

1. Sincronizar features/ensamblaje_landing.feature (línea ~101 y su nota de
   cabecera) para que deje de citar la ruta de blog entre las que sirven el
   catch-all genérico, igual que ya se hizo para la ruta de campañas al
   cerrar pagina_campanas.
2. Opcional, no urgente: cuando una tercera página necesite
   decidirComportamientoDesplazamiento, consolidar PaginaCampanas-logica.ts
   para que reexporte desde src/lib/desplazamiento.ts en vez de mantener dos
   copias idénticas — no antes, para no reabrir sin necesidad una feature ya
   cerrada y mutada al 100%.

Siguiente paso del pipeline: mutation_tester repite su medición oficial sobre
src/pages/PaginaBlog-logica.ts (y, por completitud, src/App-logica.ts y
src/lib/desplazamiento.ts, que ya cerraron 100% en la ronda 1 y no cambiaron)
para confirmar el cierre del umbral antes de que craftsman_lead marque la
feature done.
