# =============================================================================
# FEATURE 39 — retirada_carteleria_urgencias
# «Retirada de la cartelería de urgencias y afinado de la cabecera»
#
# QUÉ ES ESTE FICHERO, Y POR QUÉ CASI NO TIENE ESCENARIOS
#
# El contrato de esta feature NO se escribió aquí: se escribió el 20/09/2026
# ENMENDANDO OCHO contratos que ya existían —27 escenarios tocados y 4 nuevos—,
# porque la feature es transversal. No añade un componente: RETIRA una pieza que
# vivía repartida por la cabecera, la sección de contacto, el pie, la matriz de
# uso de color y las puertas de movimiento. Cada comportamiento quedó escrito
# donde vive su puerta, que es donde alguien lo va a leer al tocarlo.
#
# Este fichero existe por tres razones, y ninguna es repetir aquello:
#
#   1. El arnés DERIVA la ruta del contrato del `name` de `feature_list.json`
#      (`.harness/harness.mjs:387-410`) y exige `features/<name>.feature` para
#      toda feature `sdd: true` en `spec_ready`, `in_progress` o `done`. Sin
#      este fichero `bin/harness init` termina en rojo, y con él el CI
#      (`.github/workflows/harness-ci.yml` corre `node .harness/harness.mjs
#      init`). Es el checkpoint C6 y el bloqueante nº 1 de `progress/judge_39.md`.
#
#   2. Nadie podía ir del NOMBRE de la feature a su contrato REAL sin rastrear a
#      ciegas ocho ficheros. El ÍNDICE DE TRAZABILIDAD de abajo cierra eso: ruta
#      y tag para cada parte.
#
#   3. Queda UNA cláusula del criterio 8 del `acceptance` que no fija ningún
#      escenario de los ocho. Es el único `Scenario` de este fichero (@s1), y
#      está escrito para no solapar con los dos que muerden a su lado.
#
# REGLA DE ORO DE ESTE FICHERO: aquí NO se copia ni se reescribe ningún escenario
# de los otros ocho. Dos copias del mismo contrato divergen, y esta feature ya ha
# pagado ese precio —`progress/judge_39.md` §6 inventaría las notas que nacieron
# o quedaron caducadas—. Si una cláusula cambia, cambia en SU fichero, y este
# índice se actualiza en el mismo paso.
#
# -----------------------------------------------------------------------------
# ALCANCE APROBADO (D1-D4, E1-E5, F1-F3, G1-G2)
#
#   D1  La cabecera deja de tener cualquier control de urgencias, en escritorio
#       y en el panel móvil. No es un contrato nuevo: RESTAURA lo que
#       `cabecera_y_navegacion.feature` @s13/@s7 exigía desde el 25/08/2026 y que
#       `fidelidad_cabecera` incumplió el 03/09/2026.
#   D2  La navegación de escritorio termina en el borde derecho de la columna de
#       contenido, en espejo con el borde izquierdo de la marca.
#   D3  Separación visible entre "Galapavet" y su descriptor: exactamente un paso
#       de la escala de espaciado, donde el 20/09/2026 había 0,00 px.
#   D4  El acceso "Tienda" baja a la píldora del prototipo —más baja, tinta
#       fuerte, borde más suave— SIN perder el objetivo de pulsación de 44x44.
#   E1  Fuera la tarjeta roja de urgencias de la sección de contacto.
#   E2  Fuera el enlace de urgencias del pie.
#   E3  Se quedan INTACTOS, con sus contratos vigentes como única puerta: el FAQ,
#       la confirmación del formulario, el paso de urgencia del chat de reserva y
#       `telefonoUrgencias` en la fuente única de datos de negocio.
#   E4  Las puertas de PRESENCIA por ruta pasan a puertas de CORRECCIÓN, con el
#       recuento estático fijado como disparador.
#   E5  Reconciliación escrita de lo que cada tanda del día volvió falso de la
#       anterior.
#   F1  Fuera las dos filas huérfanas de la matriz de uso de color
#       (`sobre-primario`x`urgencia` y su inversa): 25 -> 23 filas, 125 -> 115
#       parejas. Recontado el 21/09/2026 en `matrizDeContraste.test.ts`: 23 y 115.
#   F2  Consecuencia medida de D1+E1: el proyecto se queda con CERO declaraciones
#       `animation:` y cero `@keyframes` en `src/`. Quedan 13 `transition:`. El
#       sitio no se queda quieto: pierde los fotogramas clave, no el movimiento.
#       Recontado el 21/09/2026 sobre las hojas de `src/`: 0, 0 y 13, sin cambio.
#   F3  El borde suave de "Tienda" se consigue mezclando tokens existentes; el
#       camino del token nuevo queda CERRADO sin volver a la puerta humana.
#   G1  El alto renderizado de la cabecera pasa a ser exactamente el hueco que el
#       documento reserva bajo ella: el 20/09/2026 había 1,00 px de solape real.
#   G2  Retirada la cláusula de píldora del panel móvil que una de las tandas se
#       había añadido por su cuenta: Pablo no la pidió.
#
# FUERA DE ALCANCE, y dicho para que nadie lo dé por hecho: las animaciones de la
# galería (punto 8 de la reunión), acercar el panel móvil al prototipo, y el
# token `--color-urgencia-suave`, que queda huérfano y es el hilo siguiente.
#
# -----------------------------------------------------------------------------
# DECISIÓN Y SU PROCEDENCIA
#
# Pablo, 20/09/2026, decidiendo sobre MEDICIONES Y CAPTURAS, no sobre
# descripciones. Corroborado en la grabación de la reunión con su socio Roberto
# Alonso del 16/08/2026 (`2026-08-16 16-14-50.mkv`; transcripción literal con
# marcas de tiempo en `progress/transcripcion_reunion_rober_20260816.txt`; tabla
# en `progress/decisiones_reunion_rober_20260816.md`, puntos 3, 4 y 9):
#
#   [02:31]       «Evidentemente arriba le quitas lo de urgencias… todo esto
#                  fuera.»                                            -> D1
#   [03:02-03:05] «Urgencia fuera y esto también fuera… eso mueve lo más a la
#                  izquierda.»                                        -> D1, D2
#   [06:52-07:00] «La urgencia se va afuera. Esto es fuera, sí, esto de urgencia
#                  se va. Y el resto se queda como está.»             -> E1, E2, E3
#
# El criterio, literal: fuera la CARTELERÍA roja, se queda el TEXTO útil.
#
# RATIFICACIÓN EXPLÍCITA EN LA MISMA PUERTA (la decisión de fondo de toda la
# tanda, y la que más cobertura cuesta): Pablo ratificó por escrito que el
# teléfono de urgencias DEJA DE PUBLICARSE DE FORMA ESTÁTICA en las seis rutas.
# Medido ruta por ruta, las seis quedan a cero menciones en su texto inicial: el
# FAQ arranca cerrado y su respuesta no usa la palabra, el chat dice «Es una
# urgencia» en singular y solo deriva tras pulsar, y la confirmación del
# formulario solo existe tras enviar. De los tres caminos posibles —retirar la
# anti-vacuidad, llevar el barrido a los estados interactivos, o aceptarlo y
# decirlo con un número— se aprobó el tercero: el recuento queda fijado en 0
# COMO DISPARADOR, para que volver a publicarlo ponga la puerta en rojo y obligue
# a pasar otra vez por la puerta humana en vez de cambiar de política en
# silencio. El razonamiento completo, con el coste de cada camino, está en
# `progress/contacto_pie_contrato_20260920.md` §3.1.
#
# El DATO no se retira: `datosNegocio.telefonoUrgencias` sigue vivo en la fuente
# única y sigue siendo alcanzable tras interactuar por tres vías distintas (FAQ,
# chat, confirmación del formulario), cada una con su propio contrato vigente.
#
# -----------------------------------------------------------------------------
# PUERTA HUMANA — QUIÉN APROBÓ ESTE FICHERO Y CUÁNDO
#
#   20/09/2026  Pablo aprobó los OCHO contratos enmendados que inventaría el
#               ÍNDICE (A). Registrado en `feature_list.json`, feature 39,
#               campo `notas`. Este fichero NO existía todavía: nació el día
#               siguiente, y por eso no entraba en aquella aprobación.
#
#   21/09/2026  Pablo aprobó ESTE fichero, el NOVENO contrato de la feature.
#               Vio el escenario @s1 entero —sus cuatro cláusulas— y el hueco
#               que tapa: el TERCER censo del criterio 8 del `acceptance`, el
#               de los rótulos accesibles, que no fija ningún escenario de los
#               ocho. Dijo que sí.
#
# Lo exigía el bloqueante 1 de `progress/judge_39_ronda2.md` §3.1: @s1 es una
# cláusula vinculante nueva, la escribió un agente y la implementó otro, así que
# «no lo puede dar por bueno ningún agente». Desde esa aprobación @s1 y sus
# cláusulas quedan CONGELADOS: tocarlos exige volver a esta puerta, no basta con
# que un agente lo crea mejor. Lo de abajo —comentarios, índices y estados
# medidos— sí se mantiene al día, y de hecho hay que hacerlo.
#
# -----------------------------------------------------------------------------
# ÍNDICE DE TRAZABILIDAD (A) — POR FICHERO DE CONTRATO
#
# Los ocho ficheros que Pablo aprobó el 20/09/2026. Se citan ficheros de test,
# NUNCA números de línea: en este repositorio las citas de línea se corren y la
# nota nace caducada (`progress/judge_39.md` §6).
#
# | Contrato (features/…)         | Escenarios                     | Qué parte de la 39 | Puertas                                                    |
# | ----------------------------- | ------------------------------ | ------------------ | ---------------------------------------------------------- |
# | fidelidad_cabecera.feature    | @s1 (reescrito)                | D2 + D3            | fidelidad-cabecera.spec.ts · Cabecera.test.tsx              |
# | fidelidad_cabecera.feature    | @s2, @s3 (reescritos)          | D1 + D4 + G2       | fidelidad-cabecera.spec.ts                                  |
# | fidelidad_cabecera.feature    | @s4 (NUEVO, nació en rojo)     | G1                 | fidelidad-cabecera.spec.ts · Cabecera.test.tsx              |
# | fidelidad_cabecera.feature    | @s5 (NUEVO)                    | D1 + E1 + E2       | fidelidad-cabecera.spec.ts (2 tests: cabecera y armazón)    |
# | fidelidad_cabecera.feature    | @s6, @s7 (NUEVOS)              | D4 + F3            | fidelidad-cabecera.spec.ts · Cabecera.test.tsx              |
# | cabecera_y_navegacion.feature | @s13 y @s7 (contrato INTACTO)  | D1 (restauración)  | Cabecera.test.tsx — @s13 estuvo INERTE desde el 25/08/2026  |
# | informacion_contacto.feature  | @s1, @s13                      | E1                 | InformacionContacto.test.tsx                                |
# | informacion_contacto.feature  | @s6 (INVERTIDO, no borrado)    | E1                 | InformacionContacto.test.tsx                                |
# | informacion_contacto.feature  | @s5, @s12 (ELIMINADOS con nota)| E1                 | sin puerta, a propósito; las 2 cláusulas de @s12 viven en @s13 |
# | fidelidad_contacto.feature    | @s1 (cláusula añadida), @s5    | E1 en navegador    | fidelidad-contacto.spec.ts                                  |
# | fidelidad_contacto.feature    | @s3 (ELIMINADO con nota)       | E1                 | sin puerta: era la única lectura de `--color-urgencia` viva |
# | pie_de_pagina.feature         | @s2 (4/4/3 y 11 + 3 leyes UX)  | E2 + asimetría     | PieDePagina.test.tsx · fidelidad-pie.spec.ts (6 anchos)     |
# | pie_de_pagina.feature         | @s5, @s6 (enmendado), @s7      | E2                 | PieDePagina.test.tsx                                        |
# | pie_de_pagina.feature         | @s15 (REAPUNTADO, no retirado) | E2                 | PieDePagina.test.tsx (prop `telefonoClinica`)               |
# | rediseno_visual.feature       | @s7, @s11 (nota), @s28 (nota)  | F1                 | matrizDeContraste.test.ts · tokensColor.test.ts             |
# | rediseno_visual.feature       | @s14 (de presencia a corrección)| E4 + ratificación | urgencias.spec.ts                                           |
# | rediseno_visual.feature       | @s52                           | E4                 | datosDelSitio.test.ts · datos-reales.spec.ts                |
# | rediseno_visual.feature       | @s26, @s27 (nota), @s28, @s36  | D1 + E1            | rediseno-visual.spec.ts · InformacionContacto.test.tsx      |
# | seo_estructura.feature        | @s10                           | E1                 | paginasSeo.test.tsx                                         |
# | accesibilidad.feature         | @s19, @s20, @s21, @s22         | F2                 | movimiento.spec.ts · accesibilidad-movimiento.test.ts · Equipo.test.tsx |
#
# NOVENO FICHERO, que NO está en la lista porque su contrato no hizo falta
# tocarlo: `features/pagina_blog.feature` @s2 ya prohibía las urgencias en la
# cabecera del blog desde antes. Lo que estaba mal era su test, que exigía lo
# contrario: se INVIRTIÓ en `PaginaBlog.test.tsx`. Queda dicho aquí para que
# nadie lo busque en el diff de `features/`.
#
# -----------------------------------------------------------------------------
# ÍNDICE DE TRAZABILIDAD (B) — POR CRITERIO DE `acceptance` DE feature_list.json
#
# | # | Criterio (abreviado)                              | Escenario(s) que lo cubren                                     |
# | - | ------------------------------------------------- | -------------------------------------------------------------- |
# | 1 | Ninguna cabecera con `tel:`, nombre ni texto      | fidelidad_cabecera @s5 · cabecera_y_navegacion @s13/@s7 ·        |
# |   | "Urgencias", en las seis rutas                     | pagina_blog @s2 (refuerzo que sí corre en CI)                    |
# | 2 | La navegación termina en el borde derecho          | fidelidad_cabecera @s1                                           |
# | 3 | Un paso de la escala entre nombre y descriptor     | fidelidad_cabecera @s1                                           |
# | 4 | "Tienda": 44x44 con píldora del prototipo y borde  | fidelidad_cabecera @s6 y @s7 (y @s2 para el 44x44 de los ocho)   |
# |   | más suave que no baja de 3:1                       |                                                                  |
# | 5 | Alto de cabecera == hueco reservado, sin tolerancia| fidelidad_cabecera @s4                                           |
# | 6 | Contacto conserva formulario, mapa y 3 bloques     | informacion_contacto @s1, @s6, @s13 · fidelidad_contacto @s1 y   |
# |   | sin la tarjeta de urgencias                        | @s5 · rediseno_visual @s36 · seo_estructura @s10                 |
# | 7 | El pie conserva sus tres columnas con la misma     | pie_de_pagina @s2 (las tres cláusulas de leyes de UI/UX), @s5,   |
# |   | rejilla aunque una tenga un enlace menos           | @s6, @s7, @s15                                                   |
# | 8 | Toda mención lleva el rótulo real y su `tel:`      | rediseno_visual @s14 (texto y enlaces) · @s52 · fidelidad_cabecera|
# |   | derivado; el recuento estático queda de disparador | @s5 (última cláusula) · **@s1 de ESTE fichero** (rótulos          |
# |   |                                                    | accesibles: el tercer censo, fijado en `urgencias.spec.ts`)      |
# | 9 | La matriz declara solo lo que el sitio pinta       | rediseno_visual @s7 (dos recuentos a 0) y @s11                   |
# |10 | Lint, typecheck, tests, navegador y mutación verdes| NO es un `Scenario`: es la puerta del arnés (`bin/harness verify`)|
# |   |                                                    | Se acredita con, y SOLO con:                                     |
# |   |                                                    |   · mutación → `progress/mutation_39_ronda3.md` (487 mutantes,   |
# |   |                                                    |     485 muertos, 2 equivalentes catalogados, `# timeout` = 0)    |
# |   |                                                    |   · navegador → `progress/verificacion_navegador_20260921.md`    |
# |   |                                                    |   · revisión → `progress/judge_39_ronda5.md`, **APPROVED** el    |
# |   |                                                    |     21/09/2026. Es la quinta ronda; las cuatro anteriores        |
# |   |                                                    |     (`judge_39.md`, `_ronda2`, `_ronda3`, `_ronda4`) son         |
# |   |                                                    |     RECHAZOS y no acreditan nada. Ninguno de los cinco fue por   |
# |   |                                                    |     el código: los cinco fueron por el entorno de la feature.    |
# |   |                                                    |     Esta línea dijo, durante unas horas, que la aprobación «no   |
# |   |                                                    |     existe» y que mientras tanto la fila NO estaba acreditada.   |
# |   |                                                    |     Era verdad al escribirla, y es lo que había que escribir.    |
# |   |                                                    | CORREGIDO DOS VECES, y la segunda por el mismo defecto:          |
# |   |                                                    |   1) Nació remitiendo a `judge_39.md` —el RECHAZO de la ronda 1— |
# |   |                                                    |      y a `mutation_39.md` —45 mutantes de dos módulos, sin las   |
# |   |                                                    |      99 líneas nuevas de `accesibilidad-movimiento.ts`—.         |
# |   |                                                    |      Lo cazó `progress/judge_39_ronda3.md` §3.2.                 |
# |   |                                                    |   2) La corrección PUSO OTRO RECHAZO: `judge_39_ronda3.md`, que  |
# |   |                                                    |      es un `CHANGES_REQUESTED` con su C7 en «[ ] BLOQUEANTE»; y  |
# |   |                                                    |      dejó `mutation_39_ronda2.md`, que es la corrida de 3 de los |
# |   |                                                    |      5 módulos y la que traía la frase falsa. La evidencia buena |
# |   |                                                    |      ni siquiera aparecía por su ruta. Lo cazó                   |
# |   |                                                    |      `progress/judge_39_ronda4.md` §7.1: «se cambió un RECHAZO   |
# |   |                                                    |      por otro RECHAZO».                                          |
#
# -----------------------------------------------------------------------------
# ESTADO DE LAS PUERTAS — MEDIDO EL 21/09/2026, TARDE
#
# Cada número lleva la fecha en que se midió y el comando con el que se midió.
# Si la fecha ha envejecido, el número también: vuélvase a medir antes de citarlo.
#
#   `node .harness/harness.mjs init`  EXIT 0 — 88 ficheros de Vitest · 1422
#                                     tests · 1422 pasan, sin un solo [FAIL];
#                                     lint y typecheck verdes en la misma pasada.
#   `pnpm run test:e2e`               EXIT 0 — 174 tests de navegador en 27 specs.
#
# Códigos de salida leídos SIN tubería, y con el 4173 comprobado libre antes de
# medir, para que ningún `dist/` viejo diera un verde prestado.
#
# LOS DOS MOTIVOS DE `progress/judge_39.md` (ronda 1) ESTÁN CERRADOS, y ninguno
# estaba en `src/`:
#
#   · `bin/harness init` en rojo por la ausencia de ESTE fichero. Cerrado al
#     crearlo el 21/09/2026: la sección 3 del arnés imprime hoy
#     `[OK] feature_list.json válido` y el init termina en 0 (medido arriba).
#   · Tres cláusulas de `accesibilidad.feature` (@s19 y @s20) sin puerta que las
#     mordiera. CERRADAS el mismo 21/09/2026 por la quinta oleada
#     (`progress/tdd_39_oleada5_movimiento.md`), horas después de escribirse este
#     fichero: @s19 muerde en `tests/e2e/movimiento.spec.ts` —el censo se mide
#     SIN la preferencia y se reencuentra bajo `reduce` por su marca en el DOM,
#     así que ya no puede devolver el documento entero— y @s20 en
#     `src/lib/accesibilidad-movimiento.ts` con su test (8 -> 20 `it`).
#     `progress/judge_39_ronda2.md` §1 las verificó leyendo las aserciones una a
#     una: los rojos son posibles por construcción.
#
# Por tanto, al 21/09/2026: TODAS las entradas de la tabla (A) tienen quien las
# muerda, salvo las dos declaradas SIN PUERTA A PROPÓSITO —los escenarios
# eliminados con nota: `informacion_contacto` @s5 y @s12, y `fidelidad_contacto`
# @s3—.
#
# ESTA NOTA NACIÓ CADUCADA Y SE CORRIGIÓ EL 21/09/2026: decía «1410 tests» (eran
# 1422) y decía que dos entradas de la tabla (A) seguían sin morder, horas
# después de que la oleada 5 las cerrara. Es exactamente el defecto que este
# fichero existe para no cometer, y va contra su propia REGLA DE ORO. Lo cazó
# `progress/judge_39_ronda2.md` §4.1, y queda escrito aquí en vez de borrado por
# lo mismo que el resto del fichero: una nota caducada se corrige contando que lo
# estuvo, no fingiendo que nunca lo dijo.
#
# ESTE MISMO BLOQUE VOLVIÓ A NACER CADUCADO, Y ES LA TERCERA VEZ. Decía, escrito
# a las 07:23 del 21/09/2026:
#
#     «Lo que sigue ABIERTO … `progress/judge_39_ronda2.md` §3.2 pide una
#     corrección en `project-spec.md` (una frase que TODAVÍA describe la tarjeta
#     roja retirada) y su §9 deja siete tareas REGISTRADAS.»
#
# Las dos mitades eran falsas al escribirse:
#
#   · La corrección de `project-spec.md` se había cerrado a las 04:41, DOS HORAS
#     Y MEDIA ANTES. Declarar abierto lo que está cerrado yerra hacia el lado
#     prudente, sí, pero manda al siguiente agente a «arreglar» una línea que ya
#     está bien, que es exactamente como se rompen las líneas que están bien.
#   · «siete tareas registradas»: el siete era correcto; «registradas», no. No
#     estaban registradas en ningún sitio: vivían solo dentro de un informe.
#
# Lo cazó `progress/judge_39_ronda3.md` §3.1. Queda escrito, y no borrado, por lo
# mismo que el resto del fichero y por su propia REGLA DE ORO (`:31-35`): una
# nota caducada se corrige contando que lo estuvo.
#
# ESTADO REAL AL 21/09/2026, TARDE, de lo que NO está en este fichero:
#
#   · `project-spec.md` — CERRADO el 21/09/2026 a las 04:41. El judge de la
#     ronda 3 barrió el fichero entero y no encontró ninguna otra afirmación
#     viva que describiera la cartelería retirada (`judge_39_ronda3.md` §2.1).
#   · Los NUEVE avisos no bloqueantes del judge — ABIERTOS, y ya con número:
#     quedaron REGISTRADOS de verdad en `feature_list.json` el 21/09/2026 como
#     las features 42 `deuda_de_notas_caducadas`, 43
#     `endurecer_guardas_de_recuento`, 44 `token_urgencia_suave_huerfano` (que
#     lleva PUERTA HUMANA y va por la tercera vez que se pide) y 45
#     `limpieza_informacion_contacto`. Las cuatro nacen en `pending`, que es el
#     único estado que el arnés no obliga a tener su `.feature`
#     (`.harness/harness.mjs:69`) — la misma trampa que rompió el CI en la
#     ronda 1 de esta feature.
#   · La mutación de `datosDelSitio.ts` y `matrizDeContraste.ts` — CERRADA el
#     21/09/2026, 20:30-20:50: `progress/mutation_39_ronda3.md`. 487 mutantes,
#     485 muertos, 2 supervivientes y los dos son los equivalentes ya
#     justificados en `progress/mutation_rediseno_visual.md` §4.6, corridos +4
#     líneas porque esta feature agrandó la cabecera del fichero. La sospecha
#     de vacuidad sobre el `.every()` de `datosDelSitio.ts` quedó REFUTADA
#     midiendo, no razonando: 172/172, y mueren los cinco mutantes de esa
#     línea. Esta viñeta dijo «Bloqueante de la ronda 3» durante las horas en
#     que ya no lo era; queda corregida contándolo.
#   · El ritmo del nav y la igualdad de los botones del hero — ABIERTOS, y NO
#     son de esta feature: salieron de mirar la página renderizada por primera
#     vez (`progress/verificacion_navegador_20260921.md`). Registrados como
#     features 46 (`ritmo_del_nav_y_objetivo_de_pulsacion`) y 47
#     (`igualdad_declarada_de_los_botones_del_hero`). CORREGIDO EL 21/09/2026:
#     esta línea dijo «46 y 45»; la 45 es `limpieza_informacion_contacto` y no
#     tiene nada que ver con el hero. Lo cazó `progress/judge_39_ronda5.md` §3.
#
# Dicho aquí para que nadie lea este bloque como un «todo verde» de la feature
# entera.
#
# -----------------------------------------------------------------------------
# LO QUE ESTE FICHERO NO CONTRATA, Y POR QUÉ (léase antes de añadir nada aquí)
#
#   · «En ninguna de las seis rutas queda un enlace de llamada a urgencias» — ya
#     lo muerde `fidelidad_cabecera` @s5, cuya última cláusula recorre las seis
#     rutas y cuenta 0 enlaces al teléfono de urgencias FUERA de la cabecera, sin
#     interactuar. No se repite.
#   · «En ninguna de las seis rutas queda una mención de texto a urgencias» — ya
#     lo muerde `rediseno_visual` @s14, cuyo disparador fija en 0 el recuento de
#     textos y el de enlaces sobre el documento entero de las seis rutas, con el
#     bite comprobado invirtiéndolo a 1.
#   · «El dato sigue declarado en la fuente única» — Given de `rediseno_visual`
#     @s14 (los tres teléfonos distintos entre sí, rótulo no vacío) y las puertas
#     de `datosDelSitio.test.ts`.
#   · «El dato sigue siendo alcanzable tras interactuar» — E3 dice que esos tres
#     componentes se quedan INTACTOS, así que sus contratos vigentes siguen
#     siendo su puerta: `faq.feature` (la respuesta da el teléfono real y procede
#     de la fuente única), `formulario_contacto.feature` (la confirmación lleva el
#     rótulo y el `tel:` derivado) y `reserva_chat.feature` (la derivación de
#     urgencias con su enlace). Si alguien se llevara el dato, esos tres se ponen
#     rojos. Contratar aquí un escenario de extremo a extremo sobre lo mismo
#     sería una segunda copia, y la primera ya muerde.
# =============================================================================

Feature: Retirada de la cartelería de urgencias y afinado de la cabecera
  Como visitante quiero que el sitio no me ofrezca a gritos una urgencia 24 h que
  la clínica no presta, y como cliente quiero que el teléfono real siga ahí el
  día que lo busque, para que lo que el sitio publica sea lo que el negocio hace.

  # ---------------------------------------------------------------------------
  # @s1 — EL TERCER CENSO, EL ÚNICO QUE NO FIJA NADIE
  #
  # POR QUÉ ESTE ESCENARIO EXISTE Y LOS DEMÁS NO. El criterio 8 del `acceptance`
  # que Pablo aprobó dice «el recuento de menciones estáticas queda fijado como
  # disparador». El recolector de menciones de `tests/e2e/urgencias.spec.ts`
  # recoge TRES censos del documento real de cada ruta: los nodos de TEXTO, los
  # ENLACES de llamada y los RÓTULOS ACCESIBLES (`[aria-label]`). Dos de los tres
  # quedaron fijados en 0 por el disparador de `rediseno_visual` @s14. El
  # tercero, NO: el bucle que comprueba que cada rótulo accesible es exactamente
  # el rótulo real sigue ahí —y debe seguir, es corrección pura—, pero desde el
  # 20/09/2026 recorre una lista vacía en las seis rutas y nadie lo declara.
  # Está escrito como pérdida nº 5 en `progress/contacto_pie_contrato_20260920.md`
  # §3.2: «un `for` que nunca entra. No falla, pasa a ser vacuo».
  #
  # ES EL DEFECTO QUE ESTA FEATURE HA CAZADO DOS VECES EN OTROS SITIOS: @s13 de
  # `cabecera_y_navegacion` llevaba desde el 25/08/2026 sin un solo test, y
  # `accesibilidad.spec.ts` comparaba `header > *:visible` cuando `header` tiene
  # un único hijo. Un test que pasa sobre una lista vacía no es una puerta.
  #
  # QUÉ NO DUPLICA, comprobado cláusula a cláusula antes de escribirlo:
  #   · `fidelidad_cabecera` @s5 prohíbe el nombre accesible con "Urgencias"
  #     SOLO DENTRO DE LA CABECERA; fuera de ella únicamente cuenta enlaces de
  #     llamada. Un `aria-label` de cartelería en el cuerpo de la página lo
  #     atraviesa entero.
  #   · `rediseno_visual` @s14 fija en 0 los textos VISIBLES y los enlaces, y
  #     sobre los rótulos accesibles solo exige CORRECCIÓN de los que aparezcan:
  #     un rótulo accesible que dijera exactamente «Urgencias fuera de horario»
  #     sobre un elemento que no es un `tel:` pasaría las dos puertas y no
  #     aparecería en ningún recuento. Ese es el hueco, y es de la feature
  #     entera: el rótulo que lo alimentaba era el `fieldset` de la tarjeta de
  #     contacto (E1) y antes el control de la cabecera (D1).
  #
  # ESTADO DE PARTIDA, censado en el código y NO medido todavía en navegador: no
  # queda en `src/` ningún `aria-label` cuyo valor pueda contener "urgencias" en
  # el estado inicial —los dinámicos son la pregunta del FAQ («¿Qué hago si mi
  # animal necesita atención fuera del horario?», sin la palabra), los rótulos
  # fijos del chat y los nombres accesibles de los enlaces del pie, que perdieron
  # el de urgencias con E2—. Se espera, por tanto, que este escenario nazca en
  # VERDE. EL ARTESANO TIENE QUE MEDIRLO EN CHROMIUM SOBRE `dist/` SERVIDO, no
  # deducirlo de este párrafo; y si naciera en rojo, el hallazgo vuelve a la
  # puerta humana antes de tocar nada.
  #
  # CÓMO SE SATISFACE, para que no se invente un spec nuevo: el recorrido de las
  # seis rutas, el recolector y la guarda de rutas YA existen en
  # `tests/e2e/urgencias.spec.ts`. Falta acumular el tercer censo y afirmarlo,
  # junto a los dos disparadores que ya están escritos allí.
  #
  # LO QUE SE MIDIÓ DESPUÉS DE ESCRIBIR TODO LO ANTERIOR (21/09/2026). Ni una
  # línea de arriba se ha tocado: es lo que Pablo aprobó y se conserva tal cual.
  # Esto es lo que pasó después. El artesano lo midió EN CHROMIUM SOBRE `dist/`
  # SERVIDO, como el párrafo anterior le exigía, y el escenario NACIÓ VERDE sin
  # tocar `src/`: ninguno de los rótulos accesibles reales de las seis rutas
  # menciona urgencias. Su puerta es el acumulador del tercer censo en
  # `tests/e2e/urgencias.spec.ts`, escrito junto a los dos disparadores que ya
  # vivían allí en vez de fabricar un spec nuevo; la mordiente se comprobó el
  # mismo día invirtiendo la afirmación a 1
  # (`progress/tdd_39_oleada6_rotulos_accesibles.md`). Verificado de nuevo en
  # esta máquina el 21/09/2026: `pnpm run test:e2e` EXIT 0, 174 tests, 27 specs.
  # ---------------------------------------------------------------------------
  @s1
  Scenario: Ninguna de las seis rutas rotula urgencias para quien no mira la pantalla
    Given el sitio construido y servido, en cada una de las seis rutas publicadas
    When se recorre el documento entero de cada ruta sin interactuar con ella, recogiendo los rótulos accesibles que mencionan "urgencias"
    Then el recuento total de rótulos accesibles recogidos en las seis rutas es exactamente 0
    And ese recuento sale de los rótulos accesibles del documento real de cada ruta, nunca de una lista escrita en el propio test
    And el recorrido recorre exactamente las seis rutas del inventario, nunca una lista vacía
    And el 0 es un disparador con mordiente comprobada: invertida la afirmación a 1, la puerta falla
