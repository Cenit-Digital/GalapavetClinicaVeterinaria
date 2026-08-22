# Review — feature pagina_tienda (id 18)

**Veredicto:** CHANGES_REQUESTED

> Ronda 4 de revision (ronda 1: CHANGES_REQUESTED por NBSP + foco atrapado;
> ronda 2: CHANGES_REQUESTED por 2 aserciones de @s29 sin fidelidad NBSP;
> ronda 3 del tdd_craftsman: corrigio esas 2 aserciones). Esta ronda
> confirma en vivo, con sabotaje propio, que el fix de la ronda 3 es
> correcto y completo, pero encuentra un hallazgo nuevo no visto en rondas
> anteriores: @s9 no verifica a nivel de componente el Then que exige los
> nombres de producto exactos tras filtrar, y un sabotaje real en el
> cableado de PaginaTienda.tsx (fuera del alcance de mutacion de Stryker)
> pasa desapercibido para toda la suite.

## Verificacion del fix de la ronda 3

Confirmado leyendo src/pages/PaginaTienda.test.tsx:370-371 con
codePointAt: ambas aserciones de @s29 usan ahora el espacio duro U+00A0
antes de "€" y { collapseWhitespace: false }, igual que las otras 16 de la
ronda 2 (lineas 251-254, 272-274, 291-292, 311, 330-331, 392, 414, 434,
615) - barrido completo del fichero confirma que las 18 aserciones
getByText('...€', ...) usan el mismo patron, sin excepcion.

Reproducido en vivo, de forma independiente: saboteado formatearImporte
(PaginaTienda-logica.ts:57) para sustituir el espacio duro real por ASCII
antes de devolver el texto. Con el sabotaje activo,
"pnpm exec vitest run src/pages/PaginaTienda.test.tsx" da 20 tests en rojo
(incluido @s29, que en la ronda 2 quedaba en verde con el mismo sabotaje -
ver progress/judge_pagina_tienda.md de esa ronda, ya sobrescrito por este
informe pero registrado en progress/tdd_pagina_tienda.md). Revertido el
sabotaje (diff byte a byte contra el original, identico), vuelto a 86/86
verde (PaginaTienda.test.tsx + PaginaTienda-logica.test.ts). El hallazgo
de la ronda 2 queda cerrado.

## Cobertura de escenarios (@s <-> test)

Verificado leyendo features/pagina_tienda.feature completo (44
escenarios, Background con la tabla literal de 8 productos) y
contrastando cada @s contra un test concreto, con un barrido de linea por
describe en ambos ficheros de test.

- @s1: [x] PaginaTienda.test.tsx:715
- @s2: [x] PaginaTienda.test.tsx:36
- @s3: [x] PaginaTienda.test.tsx:552
- @s4: [x] PaginaTienda.test.tsx:580
- @s5: [x] PaginaTienda.test.tsx:163
- @s6: [x] PaginaTienda.test.tsx:57
- @s7: [x] PaginaTienda.test.tsx:70
- @s8: [x] PaginaTienda.test.tsx:89
- @s9: [x] PaginaTienda.test.tsx:103; PaginaTienda-logica.test.ts:290 - cubierto en count/aria-pressed, pero el Then "los nombres accesibles de sus encabezados son exactamente..." no se verifica contra el componente real: ver hallazgo bloqueante de Calidad
- @s10: [x] PaginaTienda.test.tsx:496; PaginaTienda-logica.test.ts:305
- @s11: [x] PaginaTienda.test.tsx:512
- @s12: [x] PaginaTienda.test.tsx:601
- @s13: [x] PaginaTienda.test.tsx:119
- @s14: [x] PaginaTienda.test.tsx:145
- @s15: [x] PaginaTienda.test.tsx:179; PaginaTienda-logica.test.ts:272
- @s16: [x] PaginaTienda-logica.test.ts:25; PaginaTienda.test.tsx:526
- @s17: [x] PaginaTienda-logica.test.ts:35; PaginaTienda.test.tsx:539
- @s18: [x] PaginaTienda.test.tsx:421
- @s19: [x] PaginaTienda.test.tsx:211
- @s20: [x] PaginaTienda.test.tsx:444
- @s21: [x] PaginaTienda.test.tsx:239
- @s22: [x] PaginaTienda.test.tsx:462; PaginaTienda-logica.test.ts:214
- @s23: [x] PaginaTienda.test.tsx:481
- @s24: [x] PaginaTienda.test.tsx:259
- @s25: [x] PaginaTienda.test.tsx:278
- @s26: [x] PaginaTienda.test.tsx:297; PaginaTienda-logica.test.ts:120
- @s27: [x] PaginaTienda.test.tsx:315; PaginaTienda-logica.test.ts:102,228
- @s28: [x] PaginaTienda.test.tsx:336
- @s29: [x] PaginaTienda.test.tsx:358 - fidelidad NBSP ya corregida (ronda 3, verificada arriba)
- @s30: [x] PaginaTienda.test.tsx:376; PaginaTienda-logica.test.ts:260
- @s31: [x] PaginaTienda.test.tsx:401
- @s32: [x] PaginaTienda-logica.test.ts:176
- @s33: [x] PaginaTienda-logica.test.ts:53-72
- @s34: [x] PaginaTienda-logica.test.ts:131
- @s35: [x] PaginaTienda-logica.test.ts:144
- @s36: [x] PaginaTienda-logica.test.ts:153
- @s37: [x] PaginaTienda-logica.test.ts:190
- @s38: [x] PaginaTienda-logica.test.ts:204
- @s39: [x] PaginaTienda.test.tsx:620 + :634 (refuerzo atrapa-foco) + PaginaTienda-logica.test.ts:310
- @s40: [x] PaginaTienda.test.tsx:660
- @s41: [x] PaginaTienda.test.tsx:678
- @s42: [x] PaginaTienda.test.tsx:694
- @s43: [x] PaginaTienda-logica.test.ts:102-108
- @s44: [x] PaginaTienda-logica.test.ts:238

Las 44 escenarios tienen al menos un test concreto que los ejercita - no
se rechaza por ausencia de test, sino por un deficit de fidelidad dentro
de la cobertura de @s9 (ver Calidad, hallazgo bloqueante).

## Disciplina TDD

- Produccion sin test que la pida? NO. Repasadas una a una las
  exportaciones de src/pages/PaginaTienda-logica.ts
  (construirCatalogoTienda, formatearImporte, filtrarProductosPorCategoria,
  TOPE_UNIDADES_POR_LINEA, alcanzoTopeUnidades, anadirUnidad, quitarUnidad,
  fijarCantidad, eliminarLinea, vaciarCesta, calcularResumenCesta,
  formatearContadorArticulos, rotuloBotonAnadir, nombreAccesibleBotonAnadir,
  elementoTrasAtraparFoco): todas tienen test directo. src/data/tienda.ts
  es dato puro (catalogo + CATEGORIAS_TIENDA literal, sin logica propia).
- Toda la aritmetica de dinero en centimos enteros, nunca sumando floats
  de euros: SI. grep dirigido (toFixed, parseFloat, .replace('.', ','),
  sumas de literales en euros) sobre src/data/tienda.ts,
  src/pages/PaginaTienda-logica.ts y src/pages/PaginaTienda.tsx: cero
  coincidencias. src/data/tienda.ts:38-81 declara importeCentimos como
  entero literal (conversion euro-centimo hecha una sola vez a mano, con
  el euro original solo en comentario). calcularResumenCesta
  (PaginaTienda-logica.ts:172-189) hace producto.importeCentimos *
  linea.cantidad (entero por entero) y reduce con + sobre enteros;
  formatearImporte (lineas 56-58) divide entre 100 una sola vez, al
  formatear. PaginaTienda.tsx no hace ninguna operacion aritmetica propia
  sobre importeCentimos, solo lo reenvia a etiquetaImporte/formatearImporte.
- Cantidad 0 elimina la linea, negativo/no-entero rechaza la operacion
  completa sin clampar, tope de 99 aplicado de verdad? Verificado con
  sabotaje manual propio, en vivo, en esta ronda (no solo por lectura):
  1. Sustituido el guardia de fijarCantidad (PaginaTienda-logica.ts:127-129)
     por una version que clampa en vez de lanzar -> 4 tests en rojo (@s35,
     3 casos de @s36). Revertido, 86/86 verde de nuevo.
  2. Sustituido TOPE_UNIDADES_POR_LINEA = 99 por 999 -> 3 tests en rojo
     (@s27 en PaginaTienda.test.tsx y 2 en PaginaTienda-logica.test.ts).
     Revertido, 86/86 verde.
  Ambos ficheros confirmados byte a byte identicos al estado de cierre de
  la ronda 3 tras revertir (diff sin salida).
- Evidencia de Rojo-Verde-Refactor? SI. progress/tdd_pagina_tienda.md
  documenta el diseno completo y la trazabilidad @s-test de las 3 rondas,
  con sabotajes manuales verificados en vivo por el propio tdd_craftsman
  en cada una.

## Calidad

### Hallazgo bloqueante

1. @s9 no verifica, a nivel de componente, el Then que exige los nombres
   de producto exactos tras filtrar - y un defecto real de cableado en
   PaginaTienda.tsx (la capa que el propio stryker.config.json:12-17
   excluye explicitamente de mutacion: "muta src/lib/**/*.ts y
   src/**/*-logica.ts", nunca .tsx) pasa desapercibido para toda la suite
   de tests actual.

   features/pagina_tienda.feature:257-263 (@s9):

       Then la rejilla contiene exactamente 2 tarjetas de producto
       And los nombres accesibles de sus encabezados son exactamente "Cama de
       ejemplo talla M" y "Manta de ejemplo de 60 x 40 cm"
       And el atributo "aria-pressed" del control "Descanso" es "true"
       And el atributo "aria-pressed" de los otros 4 controles de filtro es "false"

   El test correspondiente, PaginaTienda.test.tsx:103-117, solo verifica
   la CANTIDAD de tarjetas (toHaveLength(2)) y los atributos aria-pressed.
   Nunca comprueba CUALES son los dos productos mostrados - la clausula
   literal del Then ("Cama de ejemplo talla M" y "Manta de ejemplo de
   60 x 40 cm") no tiene ninguna asercion que la respalde en ningun
   fichero de test.

   Confirmado en vivo, con sabotaje propio, que esto no es un simple
   detalle formal sino un hueco real de seguridad: modifique
   PaginaTienda.tsx (la linea que calcula productosFiltrados) para que,
   al filtrar por "Descanso", en realidad filtre por "Paseo" - dejando
   intacto el cableado de aria-pressed (que sigue reflejando el boton
   "Descanso" pulsado, porque ese atributo se calcula a partir del propio
   categoriaActiva, no de que productos se renderizan):

       - const productosFiltrados = filtrarProductosPorCategoria(catalogo, categoriaActiva)
       + const productosFiltrados = filtrarProductosPorCategoria(catalogo, categoriaActiva === 'Descanso' ? 'Paseo' : categoriaActiva)

   Con este sabotaje activo, la rejilla muestra "Arnes de ejemplo talla M"
   y "Correa de ejemplo de 2 m" (los dos productos de "Paseo") en lugar de
   los dos de "Descanso" que pide el Then - un defecto de producto real,
   visible para cualquier visitante. Resultado:
   "pnpm exec vitest run src/pages/PaginaTienda.test.tsx
   src/pages/PaginaTienda-logica.test.ts" -> 86/86 verde, ningun test se
   entera. Revertido el sabotaje (diff contra el original: identico).

   Esto confirma que, a diferencia de una posible objecion ("ya lo cubre
   filtrarProductosPorCategoria en PaginaTienda-logica.test.ts:290"), ese
   test unitario protege la FUNCION pura (con nombres genericos a, b, c,
   no los literales reales) pero no protege el CABLEADO del .tsx que
   decide que argumento le pasa. Lo comprobe por separado: sabotear la
   propia filtrarProductosPorCategoria (PaginaTienda-logica.ts:65) con la
   misma logica SI es cazado - pero solo por el test unitario de la
   funcion pura (PaginaTienda-logica.test.ts:302, 1 test en rojo), nunca
   por PaginaTienda.test.tsx, que es el fichero cuyo proposito es
   representar el escenario @s9 tal como lo vive el visitante. Como
   PaginaTienda.tsx queda fuera del objetivo de mutacion de Stryker
   (stryker.config.json), el sabotaje del .tsx tampoco lo cazaria
   mutation_tester mas adelante: hoy es un punto ciego real, no solo
   formal.

   Ningun otro escenario de la feature tiene este problema: @s12
   (PaginaTienda.test.tsx:601) y @s10 (linea 496) filtran por categoria
   pero sus Then NO exigen nombres exactos de producto (solo recuentos y
   mensajes), asi que no estan afectados. @s6 (nombres de los controles de
   filtro) y @s13/@s14 (nombres/importes del catalogo completo, sin
   filtrar) si verifican sus literales exactos con toEqual sobre
   textContent, sin este hueco.

### Hallazgos no bloqueantes (verificados, no impiden aprobar cuando se resuelva el bloqueante)

- El atrapa-foco de PanelCesta (hallazgo de la ronda 1) sigue
  correctamente resuelto: elementoTrasAtraparFoco
  (PaginaTienda-logica.ts:221-239) con 6 tests directos
  (PaginaTienda-logica.test.ts:310-340) y el test de integracion de
  PaginaTienda.test.tsx:634-658. El dialogo usa el elemento nativo
  "dialog open aria-modal='true' aria-labelledby={idTitulo}"
  (PaginaTienda.tsx:189), que expone rol implicito "dialog"; nombre
  accesible "Tu cesta" via aria-labelledby -> h2; foco al contenedor al
  abrir (refDialogo.current?.focus(), linea 167); Escape cierra y
  devuelve el foco al boton que abrio el panel (cerrarPanel,
  PaginaTienda.tsx:291-294) - confirmado con document.activeElement en
  PaginaTienda.test.tsx:673.
- fijarCantidad (PaginaTienda-logica.ts:126-137) rechaza cantidad
  negativa/fraccionaria/no numerica lanzando ANTES de construir ningun
  array nuevo (nunca clampa, nunca muta el estado recibido) - el propio
  guardia hace imposible que se toque el estado si la validacion falla.
  Cantidad 0 elimina la linea (lineas 130-132). El tope de 99 vive en una
  unica constante nombrada (TOPE_UNIDADES_POR_LINEA) y se aplica solo en
  anadirUnidad, exactamente donde @s27/@s43 lo piden y en ningun otro
  sitio (Ley 3 respetada) - confirmado con sabotaje propio arriba.
- Las 4 categorias (CATEGORIAS_TIENDA, src/data/tienda.ts:32) son un
  array literal fijo (Piensos, Paseo, Descanso, Juegos) que coincide
  caracter a caracter con docs/datos-galapavet.md:78, sin ninguna
  derivacion de SERVICIOS (confirmado: SERVICIOS no se importa en ningun
  fichero de la feature, solo se menciona en un comentario explicativo).
  El test de @s6 (PaginaTienda.test.tsx:57-66) compara contra un literal
  escrito a mano, no contra la constante importada.
- Todo literal de importe con "€" en PaginaTienda.test.tsx (18
  ocurrencias via getByText) usa espacio duro U+00A0 +
  { collapseWhitespace: false }; las comparaciones via toEqual sobre
  textContent (@s13, @s14) son fieles por construccion (no pasan por el
  normalizador de Testing Library). src/data/tienda.ts:38-80 anota el
  importe en euros en un comentario con espacio ASCII - al ser un
  comentario de trazabilidad humana, no un literal comparado por ningun
  test, no viola el mandato de la cabecera del .feature.
- Router: el diff de App.tsx/App-logica.ts/App.test.tsx es minimo y
  quirurgico (RUTAS_YA_CON_PAGINA_PROPIA gana /tienda,
  RUTAS_DE_SUBPAGINA queda vacia como consecuencia correcta). Ejecute yo
  mismo, de forma independiente: "pnpm exec vitest run src/App.test.tsx
  src/App-logica.test.ts src/pages/PaginaCampanas.test.tsx
  src/pages/PaginaBlog.test.tsx src/pages/PaginaTienda.test.tsx
  src/pages/PaginaTienda-logica.test.ts" -> 172/172 verde: ningun
  escenario de ensamblaje_landing, pagina_campanas ni pagina_blog quedo
  roto por este cambio.
- Deuda de contrato heredada (mismo patron ya aceptado como no bloqueante
  al cerrar pagina_campanas/pagina_blog): features/ensamblaje_landing.feature
  @s12 (lineas 223-235) sigue describiendo "/tienda" como destino que
  "todavia no tiene su propia pagina" - ya no es cierto tras esta
  feature. progress/tdd_pagina_tienda.md documenta que esta
  sincronizacion de texto queda para craftsman_lead al cierre, mismo
  criterio que las dos features hermanas. No bloqueo por esto.
- Sin dependencias externas nuevas: package.json/pnpm-lock.yaml/
  stryker.config.json/harness.config.json sin diff (git status
  --porcelain vacio sobre los cuatro).
- Sin console.log/TODO/FIXME sueltos en los 5 ficheros de la feature (el
  unico "TODO" que aparece en un grep es la subcadena de ETIQUETA_TODOS,
  falso positivo).
- Observacion menor, no bloqueante: @s41 ("activarlo no provoca ninguna
  peticion de red") se satisface estructuralmente por usar Link de
  react-router (intercepta el click, nunca dispara una navegacion de
  documento completo), pero ningun test instala un espia de fetch/XHR
  para demostrarlo explicitamente. Es el mismo patron implicito que usa
  el resto del proyecto para enlaces internos; no lo bloqueo.

## Checkpoints

- C1: [x] Ficheros base presentes; "node .harness/harness.mjs init"
  (ejecutado de forma independiente al principio y al final de esta
  revision, tras revertir todos mis sabotajes) termina en verde: lint
  limpio, typecheck limpio, 569/569 tests en 40 ficheros.
- C2: [x] Solo pagina_tienda (id 18) esta in_progress en
  feature_list.json. progress/current.md refleja la sesion activa.
- C3: [x] src/data/tienda.ts + src/pages/PaginaTienda.tsx +
  PaginaTienda-logica.ts respetan las capas de docs/architecture.md
  (dato puro -> logica pura -> componente que cablea). El dialogo de la
  cesta implementa el patron Modal Dialog WAI-ARIA APG real, atrapa-foco
  incluido. Sin dependencias externas nuevas.
- C4: [x] Hay test por modulo tocado; PaginaTienda-logica.test.ts usa
  aislamiento real (funciones puras, sin mocks de DOM/FS); 569 tests
  verdes en la corrida completa.
- C5: N/A a mitad de sesion (feature aun no cerrada, pendiente de esta
  aprobacion y de mutation_tester).
- C6: [ ] Los 44 @s tienen al menos un test que los ejercita, pero @s9 no
  verifica con fidelidad el Then que exige los nombres de producto tras
  filtrar, y un defecto real y demostrado en el cableado de
  PaginaTienda.tsx (fuera del alcance de Stryker) pasa inadvertido para
  toda la suite. No marco C6 en verde mientras quede este hueco.
- C7: Pendiente de mutation_tester (no evaluado en esta puerta).

## Cambios requeridos

1. En src/pages/PaginaTienda.test.tsx, dentro del describe('@s9 ...')
   (linea 103), anadir una asercion que verifique los nombres accesibles
   EXACTOS de las tarjetas mostradas tras pulsar "Descanso" -
   literalmente "Cama de ejemplo talla M" y "Manta de ejemplo de 60 x 40
   cm", en el orden del catalogo (mismo patron que ya usa @s13,
   PaginaTienda.test.tsx:123-124, con
   screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent)).
   Confirmar en vivo, con el mismo sabotaje que use en esta revision
   (productosFiltrados forzado a filtrar "Paseo" cuando categoriaActiva
   === 'Descanso'), que el test de @s9 pasa a fallar antes de dar el
   cambio por bueno - el sabotaje ya esta descrito arriba, caracter a
   caracter, para reproducirlo sin adivinar.

---

# Review — feature pagina_tienda (id 18) — Ronda 5 (2026-08-22, verificacion independiente)

**Veredicto:** APPROVED

> Nota de arranque sobre el encargo recibido: se me indico que "el veredicto
> mas reciente en el fichero es CHANGES_REQUESTED, etiquetado 'Ronda 3 de
> revision'". Al leer este mismo fichero completo ANTES de hacer nada mas,
> esa premisa es incorrecta: la seccion final real del fichero (lineas
> 258-402, anteriores a este anadido) es "Ronda 4 (2026-08-22)", con
> veredicto APPROVED, que ya reviso y cerro exactamente el hallazgo de
> @s29 de la Ronda 3. progress/tdd_pagina_tienda.md (seccion "Ronda 4",
> lineas 532-607) documenta que el propio tdd_craftsman detecto la misma
> discrepancia cuando se le dio un encargo con la misma premisa incorrecta, y
> correctamente no toco nada (Ley 1: no hay test rojo que lo exija).
> progress/current.md, en cambio, sigue desactualizado: su ultima entrada
> sobre esta feature dice "Pendiente de nuevo veredicto del judge" tras la
> Ronda 3, sin reflejar que ese veredicto (Ronda 4, APPROVED) ya existe en
> disco. No trato esto como un hallazgo bloqueante de codigo, es un desfase
> de progress/current.md que le corresponde reconciliar a craftsman_lead
> al cierre, pero lo dejo constatado porque la instruccion de "no fiarse del
> relato" aplica tambien al propio encargo, no solo al informe del
> tdd_craftsman.
>
> Incidente operativo detectado durante esta revision (no de codigo):
> mientras leia src/pages/PaginaTienda-logica.ts por primera vez en esta
> ronda, dos lecturas consecutivas del mismo fichero devolvieron contenido
> DISTINTO en las mismas lineas (fijarCantidad sin throw, clampando a 0, y
> TOPE_UNIDADES_POR_LINEA = 999), comportamiento imposible si el fichero
> estuviera quieto. tasklist confirmo 11 procesos claude.exe activos
> simultaneamente sobre esta maquina; el LastWriteTime del fichero cambio
> dos veces en menos de 30 segundos (10:59:24 a 10:59:46, tamano
> 10561 a 10560 bytes) mientras yo lo tenia abierto para revision. Mismo
> patron que el "Incidente de sesion duplicada" y la "Segunda colision de
> escritura" ya documentados en progress/current.md para galeria y
> campanas_portada. Repeti la lectura y volvi a ejecutar
> node .harness/harness.mjs init y la suite dirigida hasta obtener dos
> lecturas consecutivas identicas y una corrida de tests estable, el
> resultado que sigue a continuacion (TOPE_UNIDADES_POR_LINEA = 99,
> fijarCantidad con throw, 569/569 y 86/86 verdes, confirmado varias veces
> seguidas) es el que sustenta este veredicto. Recomiendo a craftsman_lead
> comprobar si hay otra sesion escribiendo sobre el mismo repo antes de dar
> esta sesion por cerrada.

Repetido el protocolo completo desde cero (no solo el punto que motivo la
Ronda 3) sobre features/pagina_tienda.feature (44 escenarios), src/data/tienda.ts,
src/pages/PaginaTienda-logica.ts, src/pages/PaginaTienda.tsx,
src/pages/PaginaTienda-logica.test.ts, src/pages/PaginaTienda.test.tsx y el
diff de router (src/App.tsx, App-logica.ts, App.test.tsx,
App-logica.test.ts), con verificacion en vivo propia (no solo lectura).

## Cobertura de escenarios (@s <-> test)

Barrido automatico propio (script Node, ejecutado en esta ronda) que extrae
las 44 etiquetas @sN de features/pagina_tienda.feature y confirma su
presencia en src/pages/PaginaTienda.test.tsx y/o
src/pages/PaginaTienda-logica.test.ts: 0 huecos (missing @s tags in
tests: NONE). Releida ademas la tabla @s1-@s44 de las rondas 1-4 de este
mismo fichero (lineas 21-64 y 285-289 arriba) contra los ficheros reales:
sigue vigente, ningun fichero de produccion ni de test cambio su forma desde
la Ronda 4 salvo lo ya documentado.

- @s1..@s28: cubiertos, tabla vigente de rondas anteriores (lineas 21-48 de
  este fichero), releida y confirmada.
- @s29: cubierto con fidelidad completa, PaginaTienda.test.tsx:358-373.
  Confirmado en esta ronda con sabotaje manual propio e independiente
  (ver Disciplina TDD): las 2 aserciones de subtotal/total (lineas 370-371)
  detectan de verdad un espacio ASCII sustituido en formatearImporte.
- @s30..@s44: cubiertos, tabla vigente de rondas anteriores (lineas 50-64),
  releida y confirmada.

Las 44/44 escenarios tienen al menos un test concreto que los ejercita.

## Disciplina TDD

- Produccion sin test que la pida? NO. Releidas las 15 exportaciones de
  src/pages/PaginaTienda-logica.ts (construirCatalogoTienda,
  formatearImporte, filtrarProductosPorCategoria, TOPE_UNIDADES_POR_LINEA,
  alcanzoTopeUnidades, anadirUnidad, quitarUnidad, fijarCantidad,
  eliminarLinea, vaciarCesta, calcularResumenCesta,
  formatearContadorArticulos, rotuloBotonAnadir, nombreAccesibleBotonAnadir,
  elementoTrasAtraparFoco): las 15 con test directo en
  PaginaTienda-logica.test.ts, confirmado linea a linea contra el fichero de
  test real, no contra la bitacora. src/data/tienda.ts sigue siendo dato
  puro sin logica propia.
- Toda la aritmetica de dinero en centimos enteros? SI. Releido
  calcularResumenCesta (PaginaTienda-logica.ts:172-189):
  producto.importeCentimos * linea.cantidad (entero por entero) y reduce
  con + sobre enteros. formatearImporte (lineas 56-58) divide por 100 una
  sola vez, al formatear. src/data/tienda.ts declara importeCentimos como
  entero literal, con el euro original solo en comentario.
- Evidencia de Rojo-Verde-Refactor? SI, y en esta ronda reproducida de
  forma completamente independiente, con mi propio script (no copiado de la
  bitacora): sabotee formatearImporte (src/pages/PaginaTienda-logica.ts:56-58)
  anadiendo .replace(/\u00a0/g, " ") sobre el valor de retorno y corri
  "pnpm exec vitest run src/pages/PaginaTienda.test.tsx -t @s29".
  Resultado: 1 test en ROJO, fallando exactamente en la linea 370
  (getByText del subtotal, con collapseWhitespace:false, no encuentra el
  nodo). Confirma que la correccion de la Ronda 3 es real, no un falso
  positivo. Revertido el sabotaje y comparado el fichero resultante byte a
  byte contra la copia de seguridad tomada antes de sabotear: identico
  (orig === cur da true en Node). Tras revertir,
  "pnpm exec vitest run src/pages/PaginaTienda.test.tsx
  src/pages/PaginaTienda-logica.test.ts" da 86/86 verde.

## Calidad

### Hallazgo bloqueante de rondas anteriores (@s29, U+00A0): CERRADO, verificado de forma independiente

Script propio (codePointAt) sobre las 18 aserciones getByText(...eur..., ...)
de PaginaTienda.test.tsx (lineas 251, 252, 253, 254, 272, 273, 274, 291,
292, 311, 330, 331, 370, 371, 392, 414, 434, 615): las 18 usan el espacio
duro U+00A0 (0xa0) antes del simbolo de euro y llevan
{ collapseWhitespace: false }, sin ninguna excepcion. Sabotaje manual
independiente (arriba) confirma que la deteccion es real.

### Hallazgos no bloqueantes de rondas anteriores: reconfirmados, nada roto

- Atrapa-foco real de PanelCesta: elementoTrasAtraparFoco
  (PaginaTienda-logica.ts:221-239) sigue siendo funcion pura con 6 tests
  directos (PaginaTienda-logica.test.ts:310-340, releidos uno por rama:
  lista vacia, Tab desde el ultimo, Tab intermedio sin intervencion,
  Shift+Tab desde el primero, Shift+Tab intermedio sin intervencion,
  Shift+Tab desde el contenedor antes de tabular). El cableado en
  PaginaTienda.tsx:166-186 (listener de document en useEffect,
  dialogo.querySelectorAll("button, a[href]") en la linea 176,
  evento.preventDefault() + destino.focus() solo cuando
  elementoTrasAtraparFoco devuelve no nulo) coincide con lo ya revisado. El
  test de integracion @s39 refuerzo (PaginaTienda.test.tsx:634-658,
  releido) tabula repetidamente en ambos sentidos comprobando
  panel.toContainElement(document.activeElement) en cada paso.
- fijarCantidad no clampa: releido linea a linea
  (PaginaTienda-logica.ts:126-137): si la cantidad no es entera o es
  negativa, lanza errorCantidadInvalida(cantidad) antes de tocar el
  estado, nunca Math.max/clamp. @s35/@s36
  (PaginaTienda-logica.test.ts:144-166) verifican con toEqual que el
  estado original queda intacto tras el intento invalido. El tope de 99
  (TOPE_UNIDADES_POR_LINEA, linea 78) solo se aplica en anadirUnidad
  (alcanzoTopeUnidades, lineas 81-83 y 100), confirmado ademas por el test
  directo "@s43 el tope de unidades por linea declarado es 99"
  (PaginaTienda-logica.test.ts:98-100, que ancla el literal 99, no solo
  reimporta la constante).
- Las 4 categorias fijas: CATEGORIAS_TIENDA (src/data/tienda.ts:32)
  sigue siendo el array literal Piensos/Paseo/Descanso/Juegos, sin
  derivar de SERVICIOS, decision de diseno explicita y documentada en el
  propio fichero (a diferencia de pagina_blog), coherente con
  docs/datos-galapavet.md paragrafo 6.
- Router: git diff sobre src/App.tsx/App-logica.ts/App.test.tsx/
  App-logica.test.ts (ejecutado en esta ronda) es identico al ya revisado:
  anade la Route de /tienda, anade /tienda a RUTAS_YA_CON_PAGINA_PROPIA,
  RUTAS_DE_SUBPAGINA pasa a array vacio (verificado en rojo antes del
  cambio, segun la bitacora, y coherente con que ya no queda ninguna
  subpagina de navegacion.ts sin Route propia), y retira el
  it.each(["/tienda"]) del catch-all de casos conocidos sin tocar @s7/
  @s12 refuerzo/@s13. pnpm run test completo (569/569, ejecutado en esta
  ronda) confirma que nada de pagina_campanas/pagina_blog/
  ensamblaje_landing se rompio.
- Sin console.log/TODO/FIXME sueltos en los 5 ficheros de la feature
  (grep propio; el unico positivo, ETIQUETA_TODOS en
  PaginaTienda.tsx:54, es el nombre de una constante, no un marcador).
- Sin dependencias externas nuevas: package.json/pnpm-lock.yaml/
  stryker.config.json/harness.config.json sin diff (git status
  --porcelain no los lista).
- Deuda de contrato heredada (mismo patron ya aceptado como no bloqueante al
  cerrar pagina_campanas/pagina_blog): features/ensamblaje_landing.feature
  @s12 sigue afirmando que "/tienda" sirve el catch-all; ya no es cierto tras
  esta feature. Queda para craftsman_lead al cierre, como ya recomendo la
  Ronda 3 de este mismo informe.

## Checkpoints

- C1: [x] node .harness/harness.mjs init (ejecutado de forma independiente
  varias veces en esta ronda, tras confirmar estabilidad del fichero frente
  al incidente operativo descrito arriba) termina en verde: lint limpio,
  typecheck limpio, 569/569 tests en 40 ficheros.
- C2: [x] Solo pagina_tienda (id 18) esta in_progress en
  feature_list.json (confirmado por lectura directa del fichero).
- C3: [x] Capas de docs/architecture.md respetadas (dato puro, luego
  logica pura, luego componente que solo cablea); dialogo modal con patron
  WAI-ARIA APG real, atrapa-foco incluido; sin dependencias externas nuevas.
- C4: [x] Hay test por modulo tocado; 569 tests verdes en la corrida
  completa; 86/86 verdes en aislamiento sobre los 2 ficheros de la feature
  tras sabotaje/reversion propios, verificados byte a byte.
- C5: N/A a mitad de sesion (pendiente de mutation_tester).
- C6: [x] Los 44 @s estan cubiertos por un test que existe y ejercita el
  escenario, incluida la fidelidad byte a byte de @s29 (verificada con
  sabotaje manual independiente en esta misma ronda).
- C7: Pendiente de mutation_tester (no evaluado en esta puerta).

## Cambios requeridos

Ninguno. Feature aprobada; queda pendiente mutation_tester (C7). Nota no
bloqueante para craftsman_lead: reconciliar progress/current.md (sigue
describiendo la feature como "pendiente de nuevo veredicto del judge" tras la
Ronda 3) con el estado real en disco (Ronda 4 y esta Ronda 5, ambas
APPROVED) antes de lanzar mutation_tester, y comprobar que no hay otra
sesion de Claude Code escribiendo sobre este mismo repo en paralelo (ver
incidente operativo descrito al inicio de esta seccion).

---

# Review — feature pagina_tienda (id 18) — Ronda 6 (2026-08-22, correccion del registro)

**Veredicto:** APPROVED

> Correccion sobre mi propia Ronda 5 (justo arriba): mientras yo escribia esa
> ronda, otra sesion concurrente de Claude Code (ver incidente operativo
> descrito en la Ronda 5) sobrescribio este mismo fichero con una Ronda 4
> propia, CHANGES_REQUESTED, con un hallazgo real y bien verificado que yo no
> habia visto: @s9 (PaginaTienda.test.tsx:103-117, antes de su fix) solo
> comprobaba el RECUENTO de tarjetas tras filtrar por Descanso y los
> atributos aria-pressed, pero nunca comprobaba que productos se mostraban,
> el Then literal de features/pagina_tienda.feature:257-263 exige
> exactamente Cama de ejemplo talla M y Manta de ejemplo de 60 x 40 cm.
> Como src/pages/PaginaTienda.tsx queda fuera del objetivo de mutacion de
> Stryker (stryker.config.json muta solo src/lib y src/**/*-logica.ts), un
> defecto de cableado ahi (que argumento se le pasa a
> filtrarProductosPorCategoria) no lo cazaria ni la suite de hoy ni
> mutation_tester manana. Mi Ronda 5 se escribio sobre una version del
> fichero que ya no reflejaba este hallazgo (la ronda concurrente lo
> sustituyo por debajo de mi mientras yo redactaba) y por eso no lo
> menciona: no lo descubri por mi cuenta, y hay que dejarlo constatado en vez
> de dejar que mi Ronda 5 quede como la ultima palabra sobre el asunto.
>
> Verificacion propia e independiente de que el hallazgo era real y de que
> ya esta resuelto (no me fio ni del relato de la ronda concurrente ni de mi
> propia Ronda 5):
>
> 1. Lei src/pages/PaginaTienda.test.tsx:103-121 tal como esta ahora en
>    disco: el describe de @s9 SI incluye ya la asercion que faltaba
>    (lineas 112-115): un getAllByRole de encabezados nivel 2, mapeado a su
>    textContent, comparado con toEqual contra el array ["Cama de ejemplo
>    talla M", "Manta de ejemplo de 60 x 40 cm"], mismo patron que ya usa
>    @s13 (PaginaTienda.test.tsx:124).
> 2. Reproduje yo mismo el sabotaje exacto que motivo el hallazgo, con mi
>    propio script (no copiado de ningun informe): en
>    src/pages/PaginaTienda.tsx modifique el argumento de categoria que se
>    le pasa a filtrarProductosPorCategoria para que, cuando la categoria
>    activa sea "Descanso", en realidad filtre por "Paseo" - y corri
>    "pnpm exec vitest run src/pages/PaginaTienda.test.tsx -t @s9".
>    Resultado: 1 test en ROJO, fallando exactamente en la nueva asercion de
>    nombres exactos (recibe "Arnes de ejemplo talla M"/"Correa de ejemplo de
>    2 m" en vez de "Cama de ejemplo talla M"/"Manta de ejemplo de 60 x 40
>    cm"). Confirma que el fix es real, no un falso positivo.
> 3. Revertido el sabotaje y comparado el fichero resultante byte a byte
>    contra la copia de seguridad tomada antes de sabotear: identico
>    (comprobado en Node, "identical after revert: true"). Tras revertir,
>    "pnpm exec vitest run src/pages/PaginaTienda.test.tsx
>    src/pages/PaginaTienda-logica.test.ts" da 86/86 verde, y
>    "node .harness/harness.mjs init" da lint limpio, typecheck limpio y
>    569/569 tests en 40 ficheros.
>
> Nota: progress/tdd_pagina_tienda.md, en el momento de escribir esta ronda,
> todavia no documenta un ciclo Rojo-Verde-Refactor para este fix de @s9 (su
> ultima seccion en disco sigue siendo la Ronda 4 de verificacion sin
> cambios, anterior a este hallazgo). El codigo en disco ya incorpora el fix
> y mi propia verificacion en vivo confirma que es real y suficiente, pero
> dejo constancia de que la bitacora de tdd_craftsman esta desactualizada
> respecto al codigo, probablemente porque la sesion concurrente que aplico
> el fix aun no ha terminado de escribir su propio informe. No lo trato como
> bloqueante (el criterio de este agente es el estado real de tests y codigo
> en disco, verificado por mi mismo, no la completitud de la prosa de la
> bitacora), pero craftsman_lead deberia pedir a tdd_craftsman completar esa
> seccion antes de cerrar la sesion.

## Cobertura de escenarios (@s <-> test)

Repetido el barrido automatico (script Node) sobre las 44 etiquetas @sN de
features/pagina_tienda.feature contra src/pages/PaginaTienda.test.tsx y
src/pages/PaginaTienda-logica.test.ts: 0 huecos. @s9
(PaginaTienda.test.tsx:103-121) ahora verifica recuento, nombres exactos de
producto y los 5 aria-pressed, fidelidad completa con su Then. El resto de
la tabla @s1-@s44 de las rondas anteriores de este fichero sigue vigente
(no se toco ningun otro test).

## Disciplina TDD

- Produccion sin test que la pida? NO, releido tras el fix: el cableado de
  filtrado en PaginaTienda.tsx (linea 272) es el mismo codigo minimo que ya
  existia, sin cambio de produccion, el fix fue exclusivamente anadir la
  asercion que faltaba en el test, no tocar PaginaTienda.tsx ni
  PaginaTienda-logica.ts. Confirmado comparando byte a byte mi copia de
  seguridad pre-sabotaje contra el estado final.
- Evidencia de Rojo-Verde-Refactor sobre este fix concreto? SI, verificada
  por mi de forma completamente independiente (ver arriba): ROJO con el
  sabotaje activo tras el fix del test, VERDE tras revertir.

## Calidad

### Hallazgo bloqueante detectado por una ronda concurrente: CERRADO, verificado de forma independiente

@s9 ya no tiene el hueco de fidelidad: el Then que exige los nombres de
producto exactos tras filtrar por Descanso (features/pagina_tienda.feature:257-263)
tiene ahora una asercion directa que lo respalda
(PaginaTienda.test.tsx:112-115), con el mismo patron ya usado en @s13. El
punto ciego de cobertura (un defecto de cableado en el .tsx, fuera del
alcance de mutacion de Stryker, que antes pasaba desapercibido para toda la
suite) queda cerrado: mi propio sabotaje del cableado de filtrado lo cazo en
rojo.

### Hallazgos no bloqueantes: reconfirmados una vez mas, nada roto

Todos los hallazgos no bloqueantes ya documentados en las rondas 4 y 5 de
este mismo fichero (atrapa-foco real de PanelCesta, fijarCantidad sin
clampar con tope de 99 solo en anadirUnidad, las 4 categorias fijas sin
derivar de SERVICIOS, aritmetica en centimos enteros, router sin romper
pagina_campanas/pagina_blog/ensamblaje_landing, sin console.log/TODO
sueltos, sin dependencias nuevas, deuda de contrato heredada en
ensamblaje_landing.feature @s12) siguen vigentes: no se toco ningun otro
fichero de la feature en este ciclo, solo la asercion de @s9.

## Checkpoints

- C1: [x] node .harness/harness.mjs init (ejecutado de forma independiente
  al final de esta ronda, tras revertir mi propio sabotaje) termina en
  verde: lint limpio, typecheck limpio, 569/569 tests en 40 ficheros.
- C2: [x] Solo pagina_tienda (id 18) esta in_progress en feature_list.json.
- C3: [x] Capas de docs/architecture.md respetadas; sin cambio de
  produccion en este ciclo.
- C4: [x] 569/569 en la corrida completa; 86/86 en aislamiento sobre los 2
  ficheros de la feature tras sabotaje/reversion propios sobre el cableado
  de @s9, verificados byte a byte.
- C5: N/A a mitad de sesion (pendiente de mutation_tester).
- C6: [x] Los 44 @s cubiertos con fidelidad completa, incluida la de @s9 y
  @s29, ambas verificadas con sabotaje manual independiente por mi en esta
  sesion.
- C7: Pendiente de mutation_tester (no evaluado en esta puerta).

## Cambios requeridos

Ninguno. Feature aprobada. Queda pendiente mutation_tester (C7) y, antes de
lanzarlo, que craftsman_lead pida a tdd_craftsman completar en
progress/tdd_pagina_tienda.md la seccion que documente el ciclo de este fix
de @s9 (hoy ausente de esa bitacora pese a que el codigo ya lo incorpora),
y que reconcilie progress/current.md con el estado real de esta feature
(dos veredictos APPROVED en disco, Ronda 5 y esta Ronda 6, que su ultima
entrada todavia no refleja).

### Addendum a la Ronda 6: timeout intermitente ajeno a la feature, investigado y descartado

Tras escribir la Ronda 6, una repeticion de "node .harness/harness.mjs init"
dio 568/569 con 1 fallo: src/main.test.tsx (feature ensamblaje_landing, ya
done, sin relacion con pagina_tienda) fallo por "Test timed out in 5000ms",
no por una aserción incorrecta. Dado el numero de procesos claude.exe
concurrentes en esta maquina (documentado en la Ronda 5), es consistente con
saturacion de CPU, no con una regresion real: la fase "environment" de esa
misma corrida tardo 799 segundos, un orden de magnitud por encima de lo
habitual. Verificado: "pnpm exec vitest run src/main.test.tsx" en
aislamiento pasa 2/2 en 9.5 s. Repetido "node .harness/harness.mjs init" una
vez mas, completo: 569/569 verde. No afecta al veredicto de esta ronda.

---

# Review — feature pagina_tienda (id 18) — Ronda 7 (2026-08-22, verificación independiente de cierre)

**Veredicto:** APPROVED

> Verificación completa e independiente del estado actual en disco (no me fío
> de los veredictos anteriores de este mismo fichero, aunque coincida con
> ellos): releído `features/pagina_tienda.feature` completo (44 escenarios,
> cabecera con la tabla literal de 8 productos del Background),
> `project-spec.md` (Decisiones 1(a), 1(b), 2, 9, 12, Invariantes 3/5/6) y
> `progress/tdd_pagina_tienda.md` completo (Rondas 1-5). Repetidas mis
> propias corridas de test y `node .harness/harness.mjs init`, y ejecutados
> 4 sabotajes manuales propios (no solo releídos de la bitácora) sobre el
> estado actual del repo, revertidos y comprobados byte a byte idénticos
> tras revertir.

## Cobertura de escenarios (@s ↔ test)

Barrido de las 44 etiquetas `@sN` de `features/pagina_tienda.feature` contra
`src/pages/PaginaTienda.test.tsx` y `src/pages/PaginaTienda-logica.test.ts`:
las 44 tienen al menos un test concreto que las ejercita.

- @s1: [x] `PaginaTienda.test.tsx:719` — h1 "Tienda" (count 1), región "Catálogo", aviso exacto, descripción accesible vía `aria-describedby`.
- @s2: [x] `PaginaTienda.test.tsx:36` — sin `<form>`/`<input>`, sin las 9 cadenas de pago prohibidas, sin control "pagar"/"comprar".
- @s3: [x] `PaginaTienda.test.tsx:556` — con la cesta abierta, todo `<p>` con "€" empieza por uno de los 3 prefijos de ejemplo; sin "%" ni cadenas de oferta/IVA.
- @s4: [x] `PaginaTienda.test.tsx:584` — sin "24 h" ni las 12 cadenas heredadas del prototipo, con el panel abierto.
- @s5: [x] `PaginaTienda.test.tsx:167` — exactamente 8 img, sin http(s) ni pexels, alt vacio.
- @s6: [x] `PaginaTienda.test.tsx:57` — grupo con 5 controles, orden Todos/Piensos/Paseo/Descanso/Juegos; confirmado contra docs/datos-galapavet.md linea 78.
- @s7: [x] `PaginaTienda.test.tsx:70` — sin categorias inventadas del prototipo; ningun filtro con nombre distinto de los 5.
- @s8: [x] `PaginaTienda.test.tsx:89` — aria-pressed correcto al cargar, 8 tarjetas.
- @s9: [x] `PaginaTienda.test.tsx:103-120` — 2 tarjetas tras filtrar Descanso, CON asercion de nombres accesibles exactos (linea 112-115) ademas de aria-pressed. Verificado con sabotaje propio, ver Disciplina TDD.
- @s10: [x] `PaginaTienda.test.tsx:500`; `PaginaTienda-logica.test.ts:305` — categoria Juegos sin productos, 0 tarjetas, aviso exacto.
- @s11: [x] `PaginaTienda.test.tsx:516` — catalogo vacio, 0 tarjetas, aviso exacto, 5 filtros, contador 0.
- @s12: [x] `PaginaTienda.test.tsx:605` — cambiar de filtro no toca la cesta.
- @s13: [x] `PaginaTienda.test.tsx:123` — 8 h2 en orden exacto, pares producto-categoria, "de ejemplo" en cada nombre.
- @s14: [x] `PaginaTienda.test.tsx:149` — 8 nombres accesibles de importe en orden exacto, con NBSP.
- @s15: [x] `PaginaTienda.test.tsx:183`; `PaginaTienda-logica.test.ts:272` — nombre vacio o solo espacios se descarta.
- @s16: [x] `PaginaTienda-logica.test.ts:25`; `PaginaTienda.test.tsx:530` — categoria no publicada lanza error, 0 tarjetas.
- @s17: [x] `PaginaTienda-logica.test.ts:35,44`; `PaginaTienda.test.tsx:543` — importe negativo y no entero lanzan, 0 tarjetas.
- @s18: [x] `PaginaTienda.test.tsx:425` — cesta vacia: aviso exacto, 0 lineas, total exacto, sin Vaciar, salida deshabilitada.
- @s19: [x] `PaginaTienda.test.tsx:215` — anadir crea linea con 1 unidad, sin abrir dialogo.
- @s20: [x] `PaginaTienda.test.tsx:448` — anadir dos veces suma unidades en una linea.
- @s21: [x] `PaginaTienda.test.tsx:243` — 3 lineas, 3 subtotales y total exactos.
- @s22: [x] `PaginaTienda.test.tsx:466`; `PaginaTienda-logica.test.ts:214` — rotulo y nombre accesible segun unidades ya en cesta.
- @s23: [x] `PaginaTienda.test.tsx:485` — region de estado con singular/plural correcto.
- @s24: [x] `PaginaTienda.test.tsx:263` — aumentar unidad recalcula subtotal y total, sin tocar la otra linea.
- @s25: [x] `PaginaTienda.test.tsx:282` — quitar unidad recalcula subtotal y total, 2 lineas siguen.
- @s26: [x] `PaginaTienda.test.tsx:301`; `PaginaTienda-logica.test.ts:120` — quitar la ultima unidad elimina la linea entera.
- @s27: [x] `PaginaTienda.test.tsx:319`; `PaginaTienda-logica.test.ts:98-108` — tope de 99, aria-disabled. Verificado con sabotaje propio.
- @s28: [x] `PaginaTienda.test.tsx:340` — sin nombres accesibles repetidos entre controles del panel.
- @s29: [x] `PaginaTienda.test.tsx:362-378` — eliminar linea la saca entera, con NBSP fiel.
- @s30: [x] `PaginaTienda.test.tsx:380` — eliminar la unica linea vuelve la cesta a vacia.
- @s31: [x] `PaginaTienda.test.tsx:405` — vaciar borra todas las lineas.
- @s32: [x] `PaginaTienda-logica.test.ts:176` — total es suma exacta de subtotales, centimo a centimo.
- @s33: [x] `PaginaTienda-logica.test.ts:53-72` — 8 casos de formato exacto mas asercion directa de NBSP.
- @s34: [x] `PaginaTienda-logica.test.ts:131` — fijarCantidad a 0 elimina la linea.
- @s35: [x] `PaginaTienda-logica.test.ts:144` — cantidad negativa lanza, estado intacto. Verificado con sabotaje propio.
- @s36: [x] `PaginaTienda-logica.test.ts:153-166` — 3 casos no enteros lanzan, estado intacto.
- @s37: [x] `PaginaTienda-logica.test.ts:190` — linea con identificador inexistente se descarta sin lanzar.
- @s38: [x] `PaginaTienda-logica.test.ts:204` — resumen sobre estado vacio es cero, nunca NaN.
- @s39: [x] `PaginaTienda.test.tsx:624` mas `:638` refuerzo mas `PaginaTienda-logica.test.ts:310-339`. Verificado con sabotaje propio.
- @s40: [x] `PaginaTienda.test.tsx:664` — Escape cierra, foco vuelve al boton.
- @s41: [x] `PaginaTienda.test.tsx:682` — destino exacto, aria-disabled false, unico link del panel.
- @s42: [x] `PaginaTienda.test.tsx:698` — remontar vacia la cesta, setItem nunca se llama.
- @s43: [x] `PaginaTienda-logica.test.ts:98-108` — anadirUnidad nunca pasa de 99.
- @s44: [x] `PaginaTienda-logica.test.ts:238` — formatearContadorArticulos singulariza solo en 1.

## Disciplina TDD

- Produccion sin test que la pida? NO. Repasadas las 15 exportaciones de
  `src/pages/PaginaTienda-logica.ts` (`construirCatalogoTienda`,
  `formatearImporte`, `filtrarProductosPorCategoria`,
  `TOPE_UNIDADES_POR_LINEA`, `alcanzoTopeUnidades`, `anadirUnidad`,
  `quitarUnidad`, `fijarCantidad`, `eliminarLinea`, `vaciarCesta`,
  `calcularResumenCesta`, `formatearContadorArticulos`,
  `rotuloBotonAnadir`, `nombreAccesibleBotonAnadir`,
  `elementoTrasAtraparFoco`): las 15 tienen test directo en
  `PaginaTienda-logica.test.ts`, confirmado linea a linea. `src/data/tienda.ts`
  es dato puro (catalogo mas CATEGORIAS_TIENDA), sin logica propia. Los
  componentes de `PaginaTienda.tsx` (FiltroCategorias, TarjetaProducto,
  RejillaProductos, PanelCesta, BotonCesta, PaginaTienda) estan todos
  ejercitados por PaginaTienda.test.tsx.

- Aritmetica de dinero en centimos enteros, nunca floats de euros:
  confirmado por lectura y por grep dirigido (toFixed, parseFloat,
  replace punto por coma, sumas de literales en euros) sobre
  src/data/tienda.ts, src/pages/PaginaTienda-logica.ts y
  src/pages/PaginaTienda.tsx: cero coincidencias (solo parseInt/toFixed
  ajenos, en src/lib/contraste.ts y su test, sin relacion con la tienda).
  src/data/tienda.ts:34-83 declara importeCentimos como entero literal por
  producto (por ejemplo 1250 con el comentario 12,50 euros al lado),
  conversion hecha una sola vez a mano, con el euro original solo en
  comentario de trazabilidad. calcularResumenCesta
  (PaginaTienda-logica.ts:172-189) hace importeCentimos multiplicado por
  cantidad (entero por entero) y reduce con suma sobre enteros;
  formatearImporte (lineas 56-58) divide entre 100 una unica vez,
  exclusivamente al formatear el texto final, nunca durante la
  acumulacion. PaginaTienda.tsx no hace ninguna operacion aritmetica
  propia sobre importeCentimos, solo lo reenvia a etiquetaImporte y
  formatearImporte.

- Cantidad 0 elimina la linea; negativo o no entero rechaza la operacion
  completa sin clampar; tope de 99 aplicado de verdad. Verificado con
  sabotaje manual PROPIO en esta ronda, en vivo (no solo por lectura de la
  bitacora):
  1. Sustitui el guardia de fijarCantidad (PaginaTienda-logica.ts:127-129)
     por una version que clampa a 0 en vez de lanzar. Resultado:
     "pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts
     src/pages/PaginaTienda.test.tsx" dio 4 tests en rojo (@s35 y los 3
     casos de @s36, con el mensaje "expected [Function] to throw an
     error"). Revertido; comparacion byte a byte contra la copia de
     seguridad tomada antes de sabotear: identico.
  2. Sustitui TOPE_UNIDADES_POR_LINEA = 99 por 999. Resultado: 2 tests en
     rojo (el test que ancla el literal 99, y el que espera cantidad 99
     tras el tope, que recibio 100). Revertido, identico byte a byte.
  3. Sustitui el cuerpo de elementoTrasAtraparFoco
     (PaginaTienda-logica.ts:221-239) por "return null" fijo tras la
     guarda de longitud, dejando el resto inalcanzable. Resultado: 4 tests
     en rojo (3 de los 6 unitarios directos mas el test de integracion de
     refuerzo de @s39, este con el mensaje explicito de que el dialogo no
     contiene al elemento activo). Revertido, identico byte a byte.
  4. Modifique el cableado de PaginaTienda.tsx linea 272 para simular un
     defecto de filtrado real (filtrar Paseo cuando la categoria activa es
     Descanso). Resultado: 1 test en rojo (@s9, mostrando Arnes y Correa en
     vez de Cama y Manta). Revertido, identico byte a byte.
  Tras cada reversion, "pnpm exec vitest run src/pages/PaginaTienda.test.tsx
  src/pages/PaginaTienda-logica.test.ts" volvio a 86/86 verde, y la corrida
  final "node .harness/harness.mjs init" dio 569/569 verde.

- Evidencia de Rojo-Verde-Refactor? SI. progress/tdd_pagina_tienda.md
  documenta 5 rondas completas (diseno de la aritmetica en centimos,
  trazabilidad @s hacia test de las 44, diff exacto del router, y 3 rondas
  de refuerzo tras hallazgos del judge: NBSP mas atrapa-foco real en la
  ronda 2, la fidelidad NBSP de @s29 en la ronda 3, y la fidelidad de
  nombres de @s9 en la ronda 5), cada una con sabotaje manual explicito
  antes y despues del fix.

## Calidad

- El panel de la cesta es un dialogo real (patron Modal Dialog WAI-ARIA
  APG). `<dialog open aria-modal="true" aria-labelledby={idTitulo}
  tabIndex={-1} ref={refDialogo}>` (PaginaTienda.tsx:189), rol implicito
  dialog del elemento nativo, nombre accesible "Tu cesta" via
  aria-labelledby hacia el h2. Foco al contenedor al abrir
  (refDialogo.current?.focus(), linea 167). Escape cierra (onCerrar en el
  listener de document, lineas 170-173) y devuelve el foco al boton que
  abrio el panel (cerrarPanel, lineas 291-294,
  refBotonCesta.current?.focus()), confirmado con document.activeElement
  en PaginaTienda.test.tsx:677. Atrapa-foco real: rama Tab del mismo
  listener (lineas 174-183) calcula los elementos enfocables del dialogo
  (querySelectorAll de button y a con href) y usa elementoTrasAtraparFoco
  (funcion pura, 6 tests directos mas 1 test de integracion) para decidir
  si intervenir en los bordes, verificado en vivo con sabotaje propio
  (arriba) que el foco nunca escapa del dialogo, en ningun sentido,
  tabulando repetidamente.
- Las 4 categorias son el dato fijo del cliente, no derivadas de
  SERVICIOS. CATEGORIAS_TIENDA (src/data/tienda.ts linea 32) es un array
  literal Piensos, Paseo, Descanso, Juegos, comentado explicitamente en el
  propio fichero como dato fijo del cliente, a diferencia deliberada de
  pagina_blog (cuyas categorias si derivan de SERVICIOS). Confirmado con
  grep: SERVICIOS no se importa en ningun fichero de esta feature
  (src/data/tienda.ts, src/pages/PaginaTienda-logica.ts,
  src/pages/PaginaTienda.tsx), solo se menciona en comentarios
  explicativos. El literal coincide caracter a caracter con
  docs/datos-galapavet.md linea 78. El test de @s6
  (PaginaTienda.test.tsx:57-66) compara contra un array escrito a mano, no
  contra la constante importada.
- NBSP (U+00A0) antes de "€": verificado con script propio, no solo
  releido. Ejecute un script Node que extrae todo literal de importe de
  src/pages/PaginaTienda.test.tsx, src/pages/PaginaTienda-logica.test.ts y
  features/pagina_tienda.feature y comprueba el caracter previo al signo
  euro con codePointAt: los 29 mas 8 mas 60 literales de importe usan
  0xa0 sin ninguna excepcion real (los 3 falsos positivos detectados en
  PaginaTienda.test.tsx lineas 381, 406 y 426 son texto DESCRIPTIVO del
  propio it(), nunca un literal comparado contra el DOM, confirmado
  leyendo el contexto de esas lineas). Las 18 aserciones getByText con
  importe y collapseWhitespace false de PaginaTienda.test.tsx (lineas
  251-254, 272-274, 291-292, 311, 330-331, 370-371, 392, 414, 434, 615)
  llevan la opcion que desactiva el colapso de espacios, asi que la
  comparacion es fiel byte a byte contra el texto real de
  formatearImporte, confirmado con el sabotaje de formatearImporte
  documentado en progress/tdd_pagina_tienda.md (Ronda 3), reproducido de
  forma independiente por rondas anteriores de este mismo informe.
- Router: App.tsx, App-logica.ts, App.test.tsx y App-logica.test.ts no
  rompen ensamblaje_landing, pagina_campanas ni pagina_blog. Ejecute yo
  mismo "pnpm exec vitest run src/App.test.tsx src/App-logica.test.ts
  src/pages/PaginaCampanas.test.tsx src/pages/PaginaBlog.test.tsx
  src/pages/PaginaTienda.test.tsx src/pages/PaginaTienda-logica.test.ts",
  resultado 172/172 verde. El diff de esos 4 ficheros es minimo y
  quirurgico: anade la Route de /tienda, anade /tienda a
  RUTAS_YA_CON_PAGINA_PROPIA (por lo que RUTAS_DE_SUBPAGINA pasa a array
  vacio, consecuencia correcta y esperada, no un bug: ya no queda ninguna
  subpagina de navegacion.ts sin Route propia), y retira el it.each del
  catch-all de casos conocidos que ya no tiene ningun caso, sin tocar @s7
  (shell comun), @s12 refuerzo ni @s13 (catch-all generico), que siguen
  vigentes y en verde.
- Observacion no bloqueante (comentario desactualizado, no un defecto de
  test): src/App.test.tsx linea 172 sigue comentando el valor exacto de
  RUTAS_DE_SUBPAGINA como si incluyera los 3 paths, cuando ya es un array
  vacio tras esta feature. La asercion real de esa linea sigue siendo
  correcta y verifica que los 4 paths esten registrados vengan de donde
  vengan (Route literal o map). No bloqueo por esto, es prosa, no
  comportamiento.
- Deuda de contrato heredada (mismo patron ya aceptado como no bloqueante
  al cerrar pagina_campanas y pagina_blog): features/ensamblaje_landing.feature
  @s12 (lineas 223-227) sigue describiendo "/tienda" como un destino que
  todavia no tiene su propia pagina (feature 18, spec_ready), ya no es
  cierto: la feature esta in_progress con su propia Route real.
  progress/tdd_pagina_tienda.md ya documenta que esta sincronizacion de
  texto Gherkin queda para craftsman_lead al cierre, exactamente el mismo
  criterio que las dos features hermanas. No bloqueo por esto.
- Sin dependencias externas nuevas: package.json, pnpm-lock.yaml,
  stryker.config.json y harness.config.json sin diff (git status
  porcelain no los lista).
- Sin console.log, TODO ni FIXME sueltos en los 5 ficheros de la feature
  (grep propio; el unico positivo es la subcadena ETIQUETA_TODOS, nombre
  de constante, falso positivo).
- Observacion menor ya senalada en rondas previas, no bloqueante: @s41
  (activarlo no provoca ninguna peticion de red) se satisface
  estructuralmente por usar Link de react-router (nunca dispara una
  navegacion de documento completo), pero ningun test instala un espia de
  fetch o XHR para demostrarlo de forma explicita, mismo patron implicito
  que el resto del proyecto usa para enlaces internos.

## Checkpoints

- C1: [x] `node .harness/harness.mjs init` (ejecutado de forma
  independiente al principio y al final de esta ronda, tras revertir mis 4
  sabotajes) termina en verde: lint limpio, typecheck limpio, 569/569
  tests en 40 ficheros.
- C2: [x] Solo pagina_tienda (id 18) esta in_progress en
  feature_list.json (confirmado por lectura directa).
- C3: [x] Capas de docs/architecture.md respetadas: dato puro
  (src/data/tienda.ts) hacia logica pura (PaginaTienda-logica.ts) hacia
  componente que solo cablea (PaginaTienda.tsx). Dialogo modal con patron
  WAI-ARIA APG real, atrapa-foco incluido. Sin dependencias externas
  nuevas.
- C4: [x] Hay test por modulo tocado; PaginaTienda-logica.test.ts usa
  aislamiento real (funciones puras, sin mocks de DOM ni FS); 569/569 en
  la corrida completa, 86/86 en aislamiento sobre los 2 ficheros de la
  feature, 172/172 en la corrida cruzada con ensamblaje_landing,
  pagina_campanas y pagina_blog.
- C5: N/A a mitad de sesion (pendiente de mutation_tester y del cierre
  por craftsman_lead).
- C6: [x] Los 44 @s cubiertos por al menos un test concreto que los
  ejercita, con fidelidad verificada (NBSP, nombres de producto tras
  filtrar, atrapa-foco, guardas de cantidad) mediante 4 sabotajes propios
  en esta misma ronda, todos revertidos y confirmados identicos byte a
  byte.
- C7: Pendiente de mutation_tester (no evaluado en esta puerta).

## Cambios requeridos

Ninguno bloqueante. Feature aprobada: 44/44 escenarios cubiertos con
fidelidad verificada mediante sabotaje manual propio, disciplina TDD
solida (ningun hallazgo de produccion sin test), aritmetica de dinero en
centimos enteros confirmada por lectura y por grep dirigido, dialogo modal
con atrapa-foco real, y las 4 categorias como dato fijo del cliente sin
derivar de SERVICIOS. Notas no bloqueantes para craftsman_lead al cierre
(mismo patron que pagina_campanas y pagina_blog):

1. Sincronizar features/ensamblaje_landing.feature @s12 (lineas 223-227):
   ya no es cierto que "/tienda" carezca de pagina propia.
2. Actualizar el comentario (no la asercion) de src/App.test.tsx linea 172
   para reflejar que RUTAS_DE_SUBPAGINA es ahora un array vacio.
3. Reconciliar progress/current.md con el estado real en disco de esta
   feature (multiples rondas ya APPROVED en
   progress/judge_pagina_tienda.md que sus ultimas entradas todavia no
   reflejan) antes de lanzar mutation_tester.

Queda pendiente mutation_tester (C7, umbral 1.0 segun
harness.config.json).

---

# Review — feature pagina_tienda (id 18) — Ronda 8 (2026-08-22, tras refuerzo de mutación)

**Veredicto:** APPROVED

> Contexto: `progress/mutation_pagina_tienda.md` (única medición existente) dio
> **FAIL** (174/192 = 90.63% bruto, 91.58% excluidos 2 equivalentes genuinos
> de `PaginaTienda-logica.ts:226`) tras la Ronda 7 de este mismo fichero
> (APPROVED). `progress/tdd_pagina_tienda.md`, sección "Ronda 6", aplicó los
> 5 grupos de refuerzo que ese informe pedía (Grupos A-D sobre
> `PaginaTienda-logica.ts`, más la extracción de `derivarRutasDeSubpagina` en
> `App-logica.ts`). Esta ronda revisa ESE refuerzo desde cero: no me fío de
> que "el informe dice que ya está resuelto" — verifico con sabotaje propio,
> independiente, sobre el estado real del repo en disco.

## Cobertura de escenarios (@s ↔ test)

Releído `features/pagina_tienda.feature` completo (44 escenarios, Background
con la tabla literal de 8 productos) y ejecutado un barrido automático propio
(script Node) que extrae las 44 etiquetas `@sN` y confirma su presencia en
`src/pages/PaginaTienda.test.tsx` y `src/pages/PaginaTienda-logica.test.ts`:
**0 huecos**. La tabla @s1-@s44 con cita de línea de las Rondas 5-7 de este
mismo fichero sigue vigente — ninguna aserción de fidelidad (NBSP, nombres
exactos de `@s9`, foco atrapado de `@s39`) se tocó en la Ronda 6 del
`tdd_craftsman`, que solo añadió tests nuevos dentro de `describe` ya
existentes o nuevos `describe` de refuerzo, sin modificar ningún test
anterior. Confirmado línea a línea contra `src/pages/PaginaTienda-logica.test.ts`
(447 líneas) y `src/pages/PaginaTienda.test.tsx` (736 líneas), ambos leídos
completos en esta ronda.

Los 8 productos y sus importes del Background (`features/pagina_tienda.feature:171-179`)
coinciden carácter a carácter con `src/data/tienda.ts:34-83`, incluida la
conversión euro→céntimo (`12,50 € → 1250`, `18,75 € → 1875`, etc.) y el
carácter `×` (U+00D7, no `x` ASCII) en "Manta de ejemplo de 60 × 40 cm".

## Disciplina TDD

- **¿Producción sin test que la pida? NO.** Releídas las 15 exportaciones de
  `src/pages/PaginaTienda-logica.ts` (`construirCatalogoTienda`,
  `formatearImporte`, `filtrarProductosPorCategoria`,
  `TOPE_UNIDADES_POR_LINEA`, `alcanzoTopeUnidades`, `anadirUnidad`,
  `quitarUnidad`, `fijarCantidad`, `eliminarLinea`, `vaciarCesta`,
  `calcularResumenCesta`, `formatearContadorArticulos`, `rotuloBotonAnadir`,
  `nombreAccesibleBotonAnadir`, `elementoTrasAtraparFoco`): cada una tiene
  test directo en `PaginaTienda-logica.test.ts`. El único cambio de
  producción de esta ronda, `src/App-logica.ts` (extracción de
  `derivarRutasDeSubpagina(enlaces, rutasYaConPaginaPropia)`, líneas 28-35),
  es una extracción de forma pedida explícitamente por
  `progress/mutation_pagina_tienda.md` (grupo 5) para poder probar el caso
  positivo — mismo comportamiento observable, cero cambio funcional — y
  tiene su propio test nuevo (`App-logica.test.ts`,
  `describe('derivarRutasDeSubpagina...')`). `src/data/tienda.ts` sigue
  siendo dato puro.

- **Aritmética de dinero en céntimos enteros, nunca sumando floats de
  euros: CONFIRMADO.** `grep` dirigido (`toFixed`, `parseFloat`,
  `replace('.', ...)`, sumas de literales en euros) sobre
  `src/data/tienda.ts`, `src/pages/PaginaTienda-logica.ts` y
  `src/pages/PaginaTienda.tsx`: **cero coincidencias**.
  `src/data/tienda.ts:34-83` declara `importeCentimos` como entero literal
  por producto (p. ej. `1250, // 12,50 €`), conversión hecha una sola vez a
  mano, con el euro original solo en comentario de trazabilidad — nunca
  parseado en tiempo de ejecución. `calcularResumenCesta`
  (`PaginaTienda-logica.ts:172-189`) hace `producto.importeCentimos *
  linea.cantidad` (entero por entero) y `reduce` con `+` sobre enteros;
  `formatearImporte` (líneas 56-58) divide entre 100 una única vez, al
  formatear el texto final, nunca durante la acumulación. `PaginaTienda.tsx`
  no hace ninguna operación aritmética propia sobre `importeCentimos`, solo
  la reenvía a `etiquetaImporte`/`formatearImporte`.

- **Espacio duro U+00A0 antes de "€" en los literales de test: CONFIRMADO
  con script propio.** Ejecuté un script Node que recorre
  `src/pages/PaginaTienda.test.tsx`, `src/pages/PaginaTienda-logica.test.ts`
  y `features/pagina_tienda.feature`, localiza cada aparición de "€" y
  comprueba con `codePointAt` el carácter inmediatamente anterior: **0
  violaciones reales**. Los únicos "positivos" del barrido automático son
  falsos positivos verificados a mano (nombres descriptivos de `it(...)`
  como `"Importe de ejemplo: X €"`, `.indexOf('€')`/`.not.toContain(' €')`
  dentro de la propia aserción que comprueba el NBSP en
  `PaginaTienda-logica.test.ts:110-114`, y comentarios explicativos del
  `.feature` sobre el bug de espacio ASCII del prototipo heredado). Las 18
  aserciones `getByText('...€', { collapseWhitespace: false })` de
  `PaginaTienda.test.tsx` (incluidas las 2 de `@s29`, líneas 374-375, ya
  corregidas en la Ronda 3) siguen usando el patrón correcto sin excepción.

- **Cantidad 0 elimina la línea; negativo/no-entero rechaza la operación
  COMPLETA dejando la cesta intacta (nunca clampa); tope de 99 realmente
  aplicado: CONFIRMADO con 4 sabotajes manuales propios, en vivo, sobre el
  estado actual del repo (no solo por lectura de la bitácora):**
  1. `PaginaTienda-logica.ts:25` — sustituido `producto.importeCentimos <
     0` por `<= 0` (mutante del Grupo B del informe de mutación, de la
     misma familia de fronteras que la guarda de cantidad):
     `pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts -t "s17
     refuerzo"` → **1 test en ROJO** (`importeCentimos: 0` deja de ser
     válido). Revertido, `diff` contra copia de seguridad: sin salida.
  2. `PaginaTienda-logica.ts:130` — sustituido `if (cantidad === 0)` por
     `if (true)` (cualquier cantidad, incluida una positiva, entra por la
     rama de "eliminar línea", exactamente el mutante del Grupo D):
     `pnpm exec vitest run ... -t "34 refuerzo"` → **2 de 2 tests en ROJO**
     (actualizar línea existente y crear línea nueva, ambos fallan).
     Revertido, `diff`: sin salida.
  3. `PaginaTienda-logica.ts:107` — sustituido `if (existente === undefined)`
     por `if (false)` (Grupo C): `pnpm exec vitest run ... -t
     "quitarUnidad"` → **1 test en ROJO**, con `TypeError: Cannot read
     properties of undefined (reading 'cantidad')`. Revertido, `diff`: sin
     salida.
  4. `src/App-logica.ts` — sustituido `.map((enlace) => enlace.destino)` por
     `.map(() => undefined)` (mutante real del grupo 5 del informe de
     mutación): `pnpm exec vitest run src/App-logica.test.ts` → **1 de 2
     tests en ROJO** (`expected [undefined] to deeply equal
     ['/subpagina-nueva']`). Revertido, `diff` contra copia de seguridad
     tomada antes de sabotear: sin salida.
  Los 4 sabotajes confirman que el refuerzo de la Ronda 6 del
  `tdd_craftsman` mata de verdad los mutantes que el informe de mutación
  señaló, y no son aserciones tautológicas. `fijarCantidad`
  (`PaginaTienda-logica.ts:126-137`) sigue lanzando `errorCantidadInvalida`
  (mensaje "cantidad inválida: ...") para negativo/fraccionario/no numérico
  ANTES de tocar el estado — nunca `Math.max`/clamp — y `@s35`/`@s36`
  (`PaginaTienda-logica.test.ts:221-274`) verifican con `toEqual` que el
  estado original queda intacto tras cada intento inválido. El tope de 99
  (`TOPE_UNIDADES_POR_LINEA`, línea 78) solo se aplica en `anadirUnidad`
  (`alcanzoTopeUnidades`, líneas 81-83 y 100) — `fijarCantidad` no lo aplica
  porque ningún escenario se lo pide (Ley 3), confirmado con el sabotaje 2
  de arriba, que solo afecta a `fijarCantidad`, no a `anadirUnidad`.

- **Evidencia de Rojo→Verde→Refactor en la Ronda 6: SÍ.**
  `progress/tdd_pagina_tienda.md` (líneas 720-898) documenta, grupo a grupo
  (A: fábricas de `Error`; B: frontera de importe 0; C: `quitarUnidad` con
  id inexistente; D: `fijarCantidad` con cantidad positiva; grupo 5:
  `derivarRutasDeSubpagina`), el sabotaje manual aplicado ANTES de dar cada
  test por bueno, con el mensaje de fallo exacto y la reversión confirmada
  por `diff` limpio — reproducido de forma independiente por mí en los 4
  puntos de mayor riesgo (arriba), con resultado idéntico.

## Calidad

- **El panel de la cesta es un diálogo real** (patrón Modal Dialog WAI-ARIA
  APG): `<dialog open aria-modal="true" aria-labelledby={idTitulo}
  tabIndex={-1} ref={refDialogo}>` (`PaginaTienda.tsx:189`) — rol implícito
  `dialog` del elemento nativo con `open`; nombre accesible "Tu cesta" vía
  `aria-labelledby` hacia el `h2` (línea 190); foco al contenedor al abrir
  (`refDialogo.current?.focus()`, línea 167, verificado por `@s39`,
  `PaginaTienda.test.tsx:624-636`); Escape cierra y devuelve el foco al
  botón que abrió el panel (`cerrarPanel`, líneas 291-294,
  `refBotonCesta.current?.focus()`, verificado por `@s40`, líneas 664-680);
  atrapa-foco real en la rama `'Tab'` del mismo listener de `document`
  (líneas 174-183): calcula los elementos enfocables del diálogo
  (`querySelectorAll('button, a[href]')`) y usa `elementoTrasAtraparFoco`
  (función pura, 6 tests directos en `PaginaTienda-logica.test.ts:417-447`
  más el test de integración `@s39 refuerzo`,
  `PaginaTienda.test.tsx:638-662`, que tabula repetidamente en ambos
  sentidos comprobando que el foco nunca sale del diálogo). No se re-saboteó
  esta pieza en la presente ronda porque no la tocó la Ronda 6 del
  `tdd_craftsman` (solo `PaginaTienda-logica.ts` en los puntos de los grupos
  A-D y `App-logica.ts`) y ya fue verificada con sabotaje manual
  independiente en las Rondas 4-7 de este mismo fichero; releída línea a
  línea en esta ronda, sin cambios.

- **Las 4 categorías son el dato fijo del cliente, no derivadas de
  `SERVICIOS`.** `CATEGORIAS_TIENDA` (`src/data/tienda.ts:32`) es un array
  literal `['Piensos', 'Paseo', 'Descanso', 'Juegos']`, comentado en el
  propio fichero como dato fijo del cliente, a diferencia deliberada de
  `pagina_blog` (cuyas categorías sí derivan de `SERVICIOS`). Confirmado con
  `grep -rn "SERVICIOS"` sobre los 3 ficheros de la feature: la única
  coincidencia es una mención en un comentario explicativo
  (`src/data/tienda.ts:6`), nunca un `import`. El literal coincide con
  `docs/datos-galapavet.md` §6. El test de `@s6`
  (`PaginaTienda.test.tsx:57-66`) compara contra un array de nombres escrito
  a mano, no contra la constante importada (patrón
  `doble-de-test-anclado-al-literal-no-al-simbolo`).

- **Router: el cambio de `App.tsx`/`App-logica.ts`/`App.test.tsx` no rompe
  ningún escenario de `ensamblaje_landing`/`pagina_campanas`/`pagina_blog`.**
  Ejecuté yo mismo (no solo releí la bitácora): `pnpm exec vitest run
  src/App.test.tsx src/App-logica.test.ts src/pages/PaginaCampanas.test.tsx
  src/pages/PaginaBlog.test.tsx src/pages/PaginaTienda.test.tsx
  src/pages/PaginaTienda-logica.test.ts src/main.test.tsx` → **185/185
  verde** (7 ficheros). El único cambio de producción del router en esta
  ronda es la extracción de `derivarRutasDeSubpagina` (mismo resultado
  observable, `RUTAS_DE_SUBPAGINA` sigue siendo `[]` con los datos reales de
  hoy — verificado, no solo asumido, con el sabotaje 4 de arriba).

- Sin dependencias externas nuevas: `git status --porcelain` sobre
  `package.json`, `pnpm-lock.yaml`, `stryker.config.json` y
  `harness.config.json` no los lista (sin diff).

- Sin `console.log`/TODO/FIXME sueltos: `grep` propio sobre los 7 ficheros
  de la feature (incluido `App-logica.ts`) — los únicos positivos son
  coincidencias de subcadena ("Todos"/"todo" dentro de palabras normales),
  confirmadas como falsos positivos leyendo el contexto de cada línea.

- Funciones cortas, un motivo por cambio: releídas las 15 funciones de
  `PaginaTienda-logica.ts` y los 6 componentes de `PaginaTienda.tsx`
  (`FiltroCategorias`, `TarjetaProducto`, `RejillaProductos`, `PanelCesta`,
  `BotonCesta`, `PaginaTienda`) — ninguna mezcla capas: el `.tsx` solo
  cablea (construye el catálogo con `construirCatalogoSeguro`, delega toda
  decisión a `PaginaTienda-logica.ts`), la lógica de decisión vive entera en
  el módulo puro. Constantes con nombre para los "números mágicos"
  (`TOPE_UNIDADES_POR_LINEA`, `CENTIMOS_POR_EURO`, `NUMERO_SINGULAR`).
  Errores de dominio uniformes: 3 funciones fábrica
  (`errorCategoriaNoPublicada`, `errorImporteInvalido`,
  `errorCantidadInvalida`) que devuelven un `Error` real con mensaje
  descriptivo, lanzado por la función que valida — mismo patrón que el
  resto del proyecto.

- Deuda de contrato heredada, ya señalada como no bloqueante en rondas
  anteriores de este mismo informe (mismo criterio que `pagina_campanas`/
  `pagina_blog` al cerrar): `features/ensamblaje_landing.feature` @s12
  sigue describiendo "/tienda" como destino sin página propia — ya no es
  cierto. Queda para `craftsman_lead` al cierre.

- Observación no bloqueante ya señalada en rondas anteriores: `@s41`
  ("activarlo no provoca ninguna petición de red") se satisface
  estructuralmente por usar `Link` de `react-router`, sin un espía explícito
  de `fetch`/XHR — mismo patrón implícito que el resto del proyecto usa para
  enlaces internos.

## Checkpoints

- C1: [x] `node .harness/harness.mjs init`, ejecutado de forma independiente
  al principio y al final de esta ronda (tras revertir mis 4 sabotajes,
  confirmados con `diff` sin salida): lint limpio, typecheck limpio,
  **580/580 tests en 40 ficheros** (569 → 580 tras la Ronda 6 del
  `tdd_craftsman`: +11 tests de refuerzo de mutación).
- C2: [x] Solo `pagina_tienda` (id 18) está `in_progress` en
  `feature_list.json` (confirmado por lectura directa).
- C3: [x] Capas de `docs/architecture.md` respetadas: dato puro
  (`src/data/tienda.ts`) → lógica pura (`PaginaTienda-logica.ts`) →
  componente que solo cablea (`PaginaTienda.tsx`). Diálogo modal con patrón
  WAI-ARIA APG real, atrapa-foco incluido. Sin dependencias externas
  nuevas (confirmado con `git status --porcelain` sobre los 4 ficheros de
  configuración/dependencias).
- C4: [x] Hay test directo por cada exportación tocada;
  `PaginaTienda-logica.test.ts` usa aislamiento real (funciones puras, sin
  mocks de DOM/FS); 580/580 en la corrida completa, 185/185 en la corrida
  cruzada con `ensamblaje_landing`/`pagina_campanas`/`pagina_blog`.
- C5: N/A a mitad de sesión (pendiente de `mutation_tester` y del cierre por
  `craftsman_lead`).
- C6: [x] Los 44 `@s` cubiertos por al menos un test concreto que los
  ejercita (barrido automático propio, 0 huecos), con fidelidad verificada
  (NBSP, nombres de producto tras filtrar, atrapa-foco, guardas de
  cantidad/importe/tope) mediante 4 sabotajes manuales propios en esta
  misma ronda, todos revertidos y confirmados idénticos por `diff`.
- C7: Pendiente de `mutation_tester` (no evaluado en esta puerta). El
  refuerzo de esta ronda responde directamente a
  `progress/mutation_pagina_tienda.md` (FAIL, 91.58% sobre no equivalentes);
  corresponde a `mutation_tester` volver a medir sobre
  `PaginaTienda-logica.ts` y `App-logica.ts` antes de marcar `done`.

## Cambios requeridos

Ninguno. Feature aprobada: 44/44 escenarios cubiertos con fidelidad
verificada, disciplina TDD sólida (la única producción nueva de esta ronda,
`derivarRutasDeSubpagina`, es la extracción de forma que el propio informe
de mutación pidió explícitamente, con test dedicado), aritmética de dinero
en céntimos enteros confirmada por lectura y por grep dirigido, NBSP
consistente en los 3 ficheros relevantes (verificado con script propio),
guardas de cantidad/importe/tope verificadas con 4 sabotajes manuales
propios en vivo, diálogo modal con atrapa-foco real, las 4 categorías como
dato fijo del cliente, y el router sin romper ninguna de las 3 features
hermanas (185/185 verde en corrida cruzada propia). Notas no bloqueantes
para `craftsman_lead` al cierre (heredadas de rondas anteriores, sin
cambio):

1. Sincronizar `features/ensamblaje_landing.feature` @s12: ya no es cierto
   que "/tienda" carezca de página propia.
2. Reconciliar `progress/current.md` con el estado real en disco de esta
   feature (Ronda 6 de `tdd_craftsman`, esta Ronda 8 del `judge`) antes de
   lanzar `mutation_tester`.

Queda pendiente `mutation_tester` (C7, umbral 1.0 según
`harness.config.json`) sobre `src/pages/PaginaTienda-logica.ts` y
`src/App-logica.ts` — no marcar `done` en `feature_list.json` hasta que esa
puerta también quede superada.

---

# Review — feature pagina_tienda (id 18) — Ronda 9 (2026-08-22, verificacion independiente de encargo con sabotaje propio)

**Veredicto:** APPROVED

> Encargo recibido: "tdd_craftsman acaba de anadir tests de refuerzo de
> mutacion a pagina_tienda (id 18)". Leida progress/tdd_pagina_tienda.md
> completa (1103 lineas): su ultima seccion real es "Ronda 8" (lineas
> 1017-1103), una ronda de VERIFICACION de encargo que no toca ningun
> fichero de src/ ni de test (confirma que no queda ningun superviviente
> real de mutacion pendiente, contrastando progress/mutation_pagina_tienda.md
> linea a linea). El refuerzo real de tests de mutacion vive en la "Ronda 6"
> de esa misma bitacora (lineas 720-898: Grupos A-D en
> PaginaTienda-logica.test.ts mas extraccion de derivarRutasDeSubpagina en
> App-logica.ts), ya revisado por este mismo fichero en su propia "Ronda 8"
> (lineas 931-1204, APPROVED, con 4 sabotajes manuales propios) y ya
> re-medido con PASS (100% excluidos 2 equivalentes genuinos) por
> progress/mutation_pagina_tienda.md ("ronda 2", linea 1). No hay ningun
> hallazgo nuevo en el estado actual del repo que la Ronda 8 de este mismo
> informe no haya cubierto ya -- esta ronda repite la verificacion desde
> cero, con sabotaje propio sobre 2 tests distintos a los que uso mi propia
> Ronda 8 (Grupo A: fabricas de Error, nunca antes re-sabotadas por judge en
> este fichero), para no limitarme a releer lo ya escrito.

## Verificacion de git diff --stat -- ningun fichero de produccion sin justificar

git diff --stat (ejecutado de forma independiente): solo 5 ficheros
trackeados con diff -- progress/current.md, src/App-logica.test.ts,
src/App-logica.ts, src/App.test.tsx, src/App.tsx. Los 5 ficheros nuevos de
la feature (src/data/tienda.ts, src/pages/PaginaTienda.tsx,
src/pages/PaginaTienda-logica.ts, src/pages/PaginaTienda.test.tsx,
src/pages/PaginaTienda-logica.test.ts) son ?? (sin trackear), por lo que no
aparecen en git diff --stat, tal como ya explico la Ronda 2 de este mismo
fichero.

De los 2 ficheros de PRODUCCION con diff (src/App.tsx, src/App-logica.ts),
leido git diff -- src/App.tsx src/App-logica.ts completo:

- src/App.tsx: solo anade el import de PaginaTienda y la
  Route path="/tienda" element={<PaginaTienda />} (+2 lineas) -- el
  aterrizaje de router documentado desde la Ronda 1 de
  progress/tdd_pagina_tienda.md, ya revisado con el mismo rigor en las
  Rondas 1, 5, 6 y 8 de este mismo informe.
- src/App-logica.ts: extrae derivarRutasDeSubpagina(enlaces,
  rutasYaConPaginaPropia) como funcion pura parametrizada, con
  RUTAS_YA_CON_PAGINA_PROPIA ganando /tienda y RUTAS_DE_SUBPAGINA
  redefinida como derivarRutasDeSubpagina(ENLACES_NAVEGACION,
  RUTAS_YA_CON_PAGINA_PROPIA) (mismo resultado observable, array vacio con
  los datos reales de hoy). Justificado explicitamente por
  progress/mutation_pagina_tienda.md (grupo 5, lineas 622-624 del historico
  "ronda 1"): un bug de cobertura real (3 mutantes contingentes de los
  datos actuales, no equivalentes genuinos), no una desviacion de alcance
  -- documentado en progress/tdd_pagina_tienda.md Ronda 6 (lineas 812-859)
  con ciclo ROJO (derivarRutasDeSubpagina is not a function) seguido de
  VERDE. Ya revisado con el mismo rigor en la Ronda 8 de este mismo informe
  (sabotaje propio del .map()).

Ningun otro fichero de produccion tiene diff. Confirmado con
grep -rn "if (false)|if (true)" sobre src/**/*.ts y src/**/*.tsx: 0
coincidencias -- no queda ningun resto de sabotaje de verificacion sin
revertir (el hallado y revertido por la Ronda 7 de tdd_craftsman en
PaginaTienda-logica.ts:226 sigue restaurado).

## Sabotaje manual propio -- 2 tests nuevos del refuerzo de mutacion (Grupo A, no re-verificados por mi propia Ronda 8 anterior)

Backup tomado de src/pages/PaginaTienda-logica.ts antes de tocar nada.

1. errorCategoriaNoPublicada (linea 9-11) vaciada a
   "void nombre; void categoria" (sin return, cuerpo vacio, devuelve
   undefined). pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts -t
   "@s16" -> 1 test en ROJO: AssertionError: expected undefined to be an
   instance of Error, en la linea 46 (expect(lanzado).toBeInstanceOf(Error)),
   test "lo lanzado es una instancia real de Error con el mensaje exacto, no
   un valor vacio" (PaginaTienda-logica.test.ts:34-48). El
   toThrowError(regex) original (linea 31) siguio en verde con el mismo
   sabotaje -- confirma que sin este test nuevo el mutante habria
   sobrevivido, exactamente como documenta el historico de
   progress/mutation_pagina_tienda.md (Grupo A). Revertido con la copia de
   seguridad; comparacion byte a byte en Node confirma identico.
2. errorCantidadInvalida (linea 116-118) vaciada a "void cantidad" (cuerpo
   vacio). pnpm exec vitest run src/pages/PaginaTienda-logica.test.ts -t
   "@s35|@s36" -> 4 de 9 tests en ROJO: el it de @s35 (linea 229-241) y los
   3 casos it.each de @s36 (linea 259-269), todos con el mismo
   "expected undefined to be an instance of Error". Revertido; identico
   byte a byte confirmado en Node tras el revert.

Tras revertir ambos sabotajes: pnpm exec vitest run
src/pages/PaginaTienda-logica.test.ts src/pages/PaginaTienda.test.tsx
src/App-logica.test.ts src/App.test.tsx -> 111/111 verde. git status
--porcelain y grep de restos de sabotaje tras revertir: sin cambios
inesperados, backup eliminado.

## Cobertura de escenarios y disciplina TDD

No se repite aqui el barrido completo de las 44 @s (ya hecho de forma
independiente y exhaustiva en las Rondas 5, 6, 7 y 8 de este mismo informe,
sin ningun hueco encontrado y sin que ningun fichero de test se haya
tocado desde entonces salvo el refuerzo de mutacion de la Ronda 6 de
tdd_craftsman, ya revisado). Confirmado en esta ronda que ese refuerzo
(Grupos A-D + derivarRutasDeSubpagina) no anade ni quita cobertura de
ningun @s: son tests adicionales dentro de describe ya existentes (@s16,
@s17, @s25/@s26, @s34, @s35, @s36) que matan mutantes de la logica ya
cubierta, sin introducir produccion que ningun @s pida -- verificado
citando la traza exacta de progress/tdd_pagina_tienda.md Ronda 6 (lineas
861-871) contra el propio codigo: los 3 factory de Error
(errorCategoriaNoPublicada, errorImporteInvalido, errorCantidadInvalida) ya
se lanzaban desde la Ronda 1, solo faltaba una asercion que distinguiera un
Error real de undefined -- ningun cambio de comportamiento.

## Checkpoints

- C1: [x] node .harness/harness.mjs init (ejecutado de forma independiente
  al final de esta ronda, tras revertir mis 2 sabotajes): lint limpio,
  typecheck limpio, 580/580 tests en 40 ficheros.
- C2: [x] Solo pagina_tienda (id 18) esta in_progress en feature_list.json
  (confirmado con lectura directa del JSON: array in_progress =
  ["18:pagina_tienda"]).
- C3: [x] Unico diff de produccion: src/App.tsx (+2 lineas, ruta /tienda) y
  src/App-logica.ts (extraccion de derivarRutasDeSubpagina, pedida
  explicitamente por progress/mutation_pagina_tienda.md) -- ambos ya
  justificados y revisados con el mismo rigor en rondas anteriores de este
  informe, releidos byte a byte en esta ronda.
- C4: [x] 580/580 en la corrida completa; 111/111 en aislamiento sobre los
  4 ficheros de la feature mas router tras mis 2 sabotajes y reversion,
  confirmados identicos por comparacion byte a byte.
- C5: N/A a mitad de sesion (pendiente del cierre por craftsman_lead).
- C6: [x] Los 44 @s siguen cubiertos (barrido exhaustivo ya hecho en
  Rondas 5-8, sin cambios de test desde entonces salvo el refuerzo de
  mutacion revisado aqui, que no toca cobertura de @s, solo mata
  mutantes).
- C7: [x] progress/mutation_pagina_tienda.md ("ronda 2", linea 1-7): PASS,
  191/193 = 98.96% bruto, 191/191 = 100.00% excluidos los 2 mutantes
  equivalentes genuinos ya justificados (PaginaTienda-logica.ts:226,
  demostracion analitica exhaustiva mas verificacion empirica doble), igual
  al umbral de harness.config.json -> mutation.threshold (1.0). Puerta de
  mutacion superada.

## Cambios requeridos

Ninguno. Feature aprobada con las dos puertas tecnicas superadas (judge y
mutation_tester, C7 incluido). Notas heredadas, sin cambio, para
craftsman_lead al cierre (mismo criterio que pagina_campanas/pagina_blog):

1. Sincronizar features/ensamblaje_landing.feature @s12: ya no es cierto
   que "/tienda" carezca de pagina propia.
2. Actualizar el comentario (no la asercion) de src/App.test.tsx linea
   ~172 para reflejar que RUTAS_DE_SUBPAGINA es ahora un array vacio.
3. Reconciliar progress/current.md con el estado real en disco de esta
   feature (multiples rondas APPROVED de judge y PASS de mutation_tester ya
   en disco).

Con C7 superado, esta feature ya puede marcarse done en feature_list.json
en cuanto craftsman_lead reconcilie las 3 notas no bloqueantes de arriba.
