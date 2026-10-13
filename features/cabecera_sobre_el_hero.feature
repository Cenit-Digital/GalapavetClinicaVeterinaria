# =============================================================================
# FEATURE 49 — cabecera_sobre_el_hero
# «La foto del hero ocupa también la cabecera; nav a 16 px; velo horizontal;
#  cabecera sólida oscura al bajar»
#
# ESTADO: BORRADOR PARA LA PUERTA HUMANA (13/10/2026). Nada de lo que sigue está
# firmado todavía. No se escribe código hasta que Pablo firme este fichero y los
# que enmienda. VA SEGUNDA, después de la feature 48
# (`hero_reducido_con_animacion`): comparte con ella ficheros de contrato y la
# regla de medir la portada con la entrada del hero ya terminada.
#
# QUÉ ES ESTE FICHERO, Y POR QUÉ TIENE POCOS ESCENARIOS PARA LO MUCHO QUE TOCA
#
# La feature 49 ENMIENDA contratos que Pablo ya aprobó: el alto de la cabecera y
# el hueco que el documento le reserva (G1 de la feature 39), el color del acceso
# «Tienda» y de su borde, el punto de corte de 1024 px, el velo de la fotografía y
# las dos puertas de foco y de contraste que miden contra el fondo equivocado.
# Sigue el patrón de la feature 39 (`retirada_carteleria_urgencias.feature`) y el
# de la 48: cada comportamiento queda escrito en el fichero donde vive su puerta,
# que es donde alguien lo va a leer al tocarlo. Este fichero contiene solo dos
# cosas:
#
#   1. El ÍNDICE DE TRAZABILIDAD de abajo: ruta y tag de cada parte, incluidos
#      los escenarios que se enmiendan o se revisan en OTROS ficheros.
#   2. Los escenarios genuinamente NUEVOS: los que ningún otro fichero fija.
#
# REGLA DE ORO DE ESTE FICHERO (la misma de la 39 y de la 48): aquí NO se copia ni
# se reescribe ningún escenario de los otros ficheros. Dos copias del mismo
# contrato divergen. Si una cláusula cambia, cambia en SU fichero y este índice se
# actualiza en el mismo paso. Se citan ficheros de test y tags, NUNCA números de
# línea: las citas de línea se corren y la nota nace caducada.
#
# -----------------------------------------------------------------------------
# ALCANCE (lo que Pablo pidió y lo que se aplica por defecto)
#
#   C1  En la portada la fotografía del hero cubre también la franja de la
#       cabecera, y la cabecera es TRANSPARENTE mientras el hero siga bajo ella,
#       sin desenfoque de fondo. PEDIDO EXPLÍCITO de Pablo (13/10/2026, punto 1).
#       El hero es pantalla completa (P5): la sección de bienvenida mide AL MENOS
#       100svh (`min-height`) y exactamente esa altura cuando el contenido cabe,
#       CONTANDO la franja de la cabecera, que la solapa y no se suma a su altura.
#   C2  Al salir del hero, y desde el primer pintado en las demás rutas (Blog,
#       Tienda, Campañas y la página no encontrada, que no tienen foto detrás), la
#       cabecera es SÓLIDA: color de tinta de la paleta y texto `sobre-primario`,
#       un solo juego de colores. Altura constante de 64 px en los dos estados.
#       DECIDIDO por Pablo (P2).
#   C3  El estado lo decide un módulo puro con mutación al 100 %, se detecta con
#       un IntersectionObserver (nunca con un oyente de scroll) y se expone en un
#       atributo `data-` o `aria-`, no en una clase. Sin parpadeo en el primer
#       render. VALOR POR DEFECTO (decisiones §6.5), abierto a veto hasta la firma.
#   C4  Los ocho enlaces del nav pasan de 12,8 a 16 px (paso 0 de la escala, no
#       una excepción), caben en una fila a 1024 px sin truncar el descriptor, su
#       ritmo es uniforme medido entre glifos y ningún objetivo baja de 48 px.
#       DECIDIDO por Pablo (P3). ABSORBE la feature 46 (ritmo del nav).
#   C5  «Tienda» tiene el mismo tamaño de letra y sigue la misma regla de color
#       que los otros siete; conserva su píldora y su objetivo de pulsación.
#   C6  El velo de la fotografía es el velo B de la maqueta (P4): un degradado
#       horizontal de cuatro tramos MÁS una franja superior de refuerzo, y el
#       contraste de
#       cada texto, medido sobre PÍXELES REALES renderizados (peor píxel tras cada
#       texto), es >= 4,5:1 en texto normal y >= 3:1 en texto grande en las cinco
#       paletas, incluida `tech` (velo claro, texto oscuro).
#   C7  El anillo de foco del nav es >= 3:1 sobre la foto y sobre el estado
#       sólido, también sobre píxeles reales. Las puertas que medían contra el
#       primer fondo opaco de los ancestros se reescriben y PUEDEN ponerse rojas.
#   C8  La matriz de contraste declara el par del texto del nav con su uso, con
#       los recuentos escritos y el cambio aprobado por esta firma.
#   C9  El enlace de la página actual y el hover se distinguen sin depender solo
#       del color. El panel móvil, el hueco bajo la cabecera para las anclas y el
#       desplazamiento al enfocar quedan intactos.
#   C10 El logo actual, que Pablo declara TEMPORAL (13/10/2026), se muestra con el
#       tratamiento que mejor encaje sobre la foto y no bloquea la feature.
#   C11 Rendimiento: el TIEMPO de LCP de la portada (mediana de 5 cargas) no pasa
#       de 2500 ms, se reporta antes y después a Pablo, y el CLS no sube. Con la
#       fotografía cubriendo el viewport entero (P5) la especificación de LCP la
#       descarta como candidata: el elemento LCP deja de estar fijado. No es un
#       criterio del `acceptance` pero lo exigen las decisiones §8.
#
# FUERA DE ALCANCE, y dicho para que nadie lo dé por hecho:
#   · El contenido del hero, su alineación a la izquierda y su entrada animada:
#     feature 48. Aquí solo se MIDE con esa entrada ya terminada.
#   · El panel móvil: queda EXACTAMENTE como está (G2 de la feature 39). Acercarlo
#     al prototipo sigue siendo tarea aparte.
#   · El logo definitivo (pendiente desde el minuto 09:44 de la reunión con
#     Roberto).
#   · La ALTURA del hero (pantalla completa, mínimo de 100svh, decidida en P5): la fija
#     `hero_reducido_con_animacion` @s12 y aquí NO se duplica. Lo que sí fija esta
#     feature es el SOLAPE con la cabecera y que esos 100svh la incluyen (@s6).
#   · Los valores de la referencia (vetcruzverde.es: nav a 18 px, cabecera de 92
#     px, `min-height` de 100 vh, transición de 0,3 s) NO se adoptan. Salen del
#     encargo, no del repo; lo aprobado es lo que Pablo respondió en P2-P4.
#   · Cualquier movimiento de las cajas del nav al pasar el puntero o al ser enlace
#     actual: está PROHIBIDO por @s16, no es una cuestión abierta.
#
# -----------------------------------------------------------------------------
# DECISIÓN Y SU PROCEDENCIA (todo en `progress/decisiones_cabecera_hero_20261013.md`)
#
#   13/10/2026, Pablo, P2, «cabecera al bajar del hero y en el resto de páginas»:
#   «Oscura sólida: color de tinta de la paleta y texto `sobre-primario`; un solo
#   juego de colores en todos los estados.»
#
#   13/10/2026, Pablo, P3, «tamaño de letra de los enlaces del menú»: «16 px (paso
#   0 de la escala, no una excepción).»
#
#   13/10/2026, Pablo, P4, «velo sobre la foto»: «B · degradado horizontal (oscuro
#   bajo el texto, claro a la derecha).» Con los tramos 0,80 / 0,68 / 0,30 / 0,22
#   al 0 / 45 / 75 / 100 % de la anchura (decisiones §3). El velo B que Pablo VIO
#   en la maqueta (`progress/maqueta_cabecera_hero/maqueta.html`, regla
#   `body[data-velo="b"] .hero::after`) lleva ADEMÁS una franja vertical superior:
#   0,55 de opacidad en el borde superior, que baja en línea recta hasta 0 al 22 %
#   de la altura del hero. Las decisiones §P4 la omitieron por ERROR del
#   craftsman_lead (aviso del 13/10/2026): es PARTE del velo y el contrato la
#   EXIGE (@s9). Antes de ese aviso este fichero solo la «permitía».
#
#   13/10/2026, Pablo, P5 (comunicada al escribir este contrato; resumen de la
#   decisión, no cita literal): el hero es PANTALLA COMPLETA. La sección de
#   bienvenida (foto y velo) mide al menos 100svh en todos los anchos (`min-height`;
#   la 48 afina después: exactamente esa altura cuando el contenido cabe), con la
#   cabecera de 64 px encima solapándola con margen negativo, y el contenido
#   centrado verticalmente bajo la cabecera. Sustituye al valor por defecto de las
#   decisiones §6.3 («se mantiene `clamp(560px, 84svh, 784px)`»). Coste medido por
#   el panel de revisión: hoy el hero ya mide 836-837 px a 1440x900 (64 de
#   cabecera más 836 = 900), así que pantalla completa es MANTENER lo de hoy.
#
#   13/10/2026, Pablo, punto 2 de su encargo: enlaces del nav «más grandes y más
#   claros» y «le des la opacidad que necesite para que queden bien con la imagen
#   de fondo». No pidió reposicionarlos: «que queden más o menos en el centro,
#   están bien».
#
#   13/10/2026, Pablo, sobre el logo: «es TEMPORAL, que no hay que preocuparse por
#   él y que se retoque lo que haga falta (opacidad, fondo, recorte) para que
#   encaje sobre la foto.»
#
#   Valores por defecto aplicados SALVO veto (decisiones §6): cabecera sin
#   `backdrop-filter` en el estado transparente; estado por IntersectionObserver
#   con la lógica en `Cabecera-logica.ts`; `#root` conserva su relleno superior y
#   la portada solapa con margen negativo; «Tienda» sigue la regla de color común;
#   nada de «blanco» literal (en `tech` el velo es claro y el texto oscuro: se usa
#   `--color-sobre-primario`; el inventario de tokens sigue CERRADO); foco con
#   `outline-color: var(--color-sobre-primario)`, el mismo recurso que ya usa el
#   hero.
#
#   Respuestas del craftsman_lead a las dudas de la primera redacción (13/10/2026),
#   también VALORES POR DEFECTO que Pablo puede vetar: (1) la franja superior del
#   velo es obligatoria (arriba); (2) el estado INICIAL de la portada se decide con
#   la posición de scroll y el hash que el navegador ya conoce antes del primer
#   dibujo, sin esperar al observador, y el PRIMER cambio de estado se aplica SIN
#   transición (@s1, @s22); (3) al pasar el puntero el enlace se subraya y NO
#   cambia de peso, y el enlace de la página actual se subraya y pesa 600 con el
#   ancho RESERVADO: ninguna caja del nav se mueve (@s16); (4) el borde de «Tienda»
#   sigue siendo suave (F3, 20/09/2026) mientras cumpla 3 a 1 contra lo que hay
#   detrás; la mezcla la elige el artesano (`fidelidad_cabecera` @s7); (5) el
#   prototipo de `docs/diseno-claude-design/` queda como histórico, sin tocar.
#
# -----------------------------------------------------------------------------
# PUERTA HUMANA
#
#   13/10/2026  Pablo respondió P2, P3 y P4 y pidió los puntos 1 y 2 de su
#               encargo (cabecera sobre la foto; nav más grande y más claro).
#   13/10/2026  Pablo declaró el logo actual TEMPORAL: no bloquea nada.
#   PENDIENTE   La firma de ESTE fichero y de las enmiendas de los demás
#               (fidelidad_cabecera, rediseno_visual, sistema_de_diseno_visual,
#               identidad_visual, accesibilidad; y las notas de
#               cabecera_y_navegacion y fidelidad_responsive_integral). También
#               el veto de los valores por defecto, incluidos los cinco que el
#               craftsman_lead fijó el 13/10/2026 al responder a las dudas de la
#               primera redacción (ver «Respuestas del craftsman_lead», arriba).
#
# -----------------------------------------------------------------------------
# ÍNDICE DE TRAZABILIDAD (A) — POR FICHERO DE CONTRATO
#
# | Contrato (features/…)         | Escenarios                            | Parte     | Puertas                                                     |
# | ----------------------------- | ------------------------------------- | --------- | ----------------------------------------------------------- |
# | fidelidad_cabecera.feature    | @s1 (REVISADO, sin cambio de letra)   | C4        | fidelidad-cabecera.spec.ts                                   |
# | fidelidad_cabecera.feature    | @s2 (reescrito: 16 px y 48 px)        | C4 + C5   | fidelidad-cabecera.spec.ts · Cabecera.test.tsx               |
# | fidelidad_cabecera.feature    | @s4 (3.ª cláusula enmendada; G1 vigente) | C1 + C2 | fidelidad-cabecera.spec.ts · Cabecera.test.tsx              |
# | fidelidad_cabecera.feature    | @s6 (reescrito: color y tamaño)       | C5        | fidelidad-cabecera.spec.ts · Cabecera.test.tsx               |
# | fidelidad_cabecera.feature    | @s7 (reescrito: borde sobre lo que hay detrás) | C5 + C6 | fidelidad-cabecera.spec.ts (píxeles reales)        |
# | fidelidad_cabecera.feature    | @s3, @s5 (INTACTOS)                   | G2 / D1   | fidelidad-cabecera.spec.ts                                   |
# | cabecera_y_navegacion.feature | @s1 (REVISADO) y PENDIENTE actualizado | C4       | Cabecera-logica.test.ts                                      |
# | cabecera_y_navegacion.feature | @s14 (INTACTO, compatible con @s5)    | C3        | Cabecera.test.tsx                                            |
# | rediseno_visual.feature       | @s26 (REVISADO, sin cambio de letra)  | C4        | rediseno-visual.spec.ts                                      |
# | rediseno_visual.feature       | @s28 (reescrito: estado y ancla)      | C1 + C2   | Cabecera.test.tsx · fidelidad-cabecera.spec.ts               |
# | rediseno_visual.feature       | @s29 (reescrito: velo y píxeles)      | C6        | rediseno-visual.spec.ts (sustituye al cálculo de Hero.test.tsx) |
# | fidelidad_responsive_integral | @s4, @s6 (REVISADOS, sin cambio)      | C4        | fidelidad-responsive-integral.spec.ts                        |
# | sistema_de_diseno_visual      | @s14, @s25, @s26 (REVISADOS)          | C4        | puntoDeCorte.test.ts · escalaTipografica.test.ts             |
# | sistema_de_diseno_visual      | @s27 (ENMENDADO: fila y descriptor)   | C4        | navegador real a 1024 y 1023 px                              |
# | identidad_visual.feature      | @s38, @s39 (enmendados: píxeles)      | C7        | accesibilidad.spec.ts (reescrito)                            |
# | identidad_visual.feature      | @s40 (REVISADO) y la nota del parque de navegadores (ACTUALIZADA) | C1 | accesibilidad.spec.ts            |
# | accesibilidad.feature         | @s17 (REVISADO)                       | C1        | accesibilidad.spec.ts                                        |
# | accesibilidad.feature         | @s18 (ENMENDADO: píxeles)             | C7        | accesibilidad.spec.ts (reescrito)                            |
# | retirada_carteleria_urgencias | G1, filas de @s2/@s4/@s6/@s7 y criterios 4 y 5 | G1 | solo comentarios: el Gherkin firmado NO se toca            |
# | hero.feature                  | NO SE TOCA: ningún escenario fija el velo ni la cabecera | — | —                                           |
# | hero_reducido_con_animacion   | @s11 (método y umbral del LCP) y @s12 (hero a 100svh): SON DE LA 48; aquí solo se remite | C1 + C11 | navegador real |
# | ESTE fichero                  | @s1 … @s23 (NUEVOS)                   | todas     | ver cada escenario                                           |
#
# CONTRATOS QUE SE CONSERVAN Y QUE AHORA MUERDEN DE VERDAD, sin tocar ni una
# coma:
#   · `identidad_visual.feature` @s14 (`scroll-padding-top` sale de la misma
#     variable que dimensiona la cabecera), `fidelidad_cabecera` @s4 en sus
#     cláusulas 1, 2, 4 y 5 (el alto de la cabecera sigue siendo exactamente el
#     hueco que `#root` reserva) y `rediseno_visual` @s28 en su cláusula del ancla
#     (el salto descuenta la altura REAL de la cabecera): el hueco, el
#     desplazamiento al enfocar y las anclas no cambian. Ver @s8.
#   · `identidad_visual.feature` @s31 (cada hueco de imagen pinta
#     `--color-fondo-alterno`): el logo en círculo es compatible. Ver @s21.
#   · `identidad_visual.feature` @s49 (el peso del CSS servido no supera el
#     techo de 12 000 B codificados): puerta vigente, sin tocar. Margen estimado
#     de unos 2,2 KB, NO medido; la 48 lo comparte.
#   · `ensamblaje_landing.feature` @s11 y `cabecera_y_navegacion.feature` @s14:
#     con el ancho aún sin medir, el ÁRBOL del primer render es la rama móvil.
#     Siguen en pie; @s5 de ESTE fichero fija lo PINTADO, no el árbol.
#
# AFECTADOS SIN ENMIENDA DE CONTRATO (el texto sigue siendo cierto; cambia su
# prueba, o está en riesgo):
#   · `Cabecera.test.tsx`: congela hoy el `font-size: paso-tipografico(-1)` de los
#     enlaces y el de «Tienda», el color `--color-tinta` de «Tienda» y el
#     `border-block-end` de la cabecera. Cambian con @s13 y las enmiendas de
#     `fidelidad_cabecera`.
#   · `tests/e2e/accesibilidad.spec.ts`: sus dos funciones que suben por los
#     ancestros hasta el primer fondo opaco se reescriben (ver @s11 y @s12). Mira
#     solo los 20 primeros controles de cada ruta: la cabecera cae dentro, pero
#     el contrato no puede depender de eso (ver identidad_visual @s39).
#   · `src/lib/diseno/matrizDeContraste.test.ts`: UNA aserción cita el uso de la
#     fila `sobre-primario` sobre `tinta` (ver @s17) y el comentario de historia
#     del recuento. Los recuentos 23, 23 y 115 NO cambian.
#   · `Hero.test.tsx` mide el contraste del texto contra una parada del velo con
#     fotos extremas: con el velo horizontal ya no sirve (ver rediseno_visual @s29).
#     Y fija hoy `min-height: clamp(560px, 84svh, 784px)`: ese cambio es de la 48
#     (@s12, pantalla completa), no de este fichero.
#   · Todo spec nuevo de esta feature que mida la portada recién cargada debe
#     entrar en la lista de `hero_reducido_con_animacion` @s10 (medir con la
#     entrada terminada o con movimiento reducido). Esa lista se lee del
#     repositorio: lo comprueba su propia puerta.
#   · `project-spec.md` y las notas de `feature_list.json` que describan la
#     cabecera «translúcida» quedan desfasadas. Las actualiza el
#     `craftsman_lead`; este fichero no toca ni `project-spec.md` ni
#     `feature_list.json`.
#
# -----------------------------------------------------------------------------
# ÍNDICE DE TRAZABILIDAD (B) — POR CRITERIO DE `acceptance` DE feature_list.json
#
# | #  | Criterio (abreviado)                                     | Escenario(s) que lo cubren                                          |
# | -- | -------------------------------------------------------- | ------------------------------------------------------------------- |
# | 1  | Foto bajo la cabecera, cabecera transparente, sin        | @s6 · @s4 de ESTE fichero · rediseno_visual @s28                    |
# |    | desenfoque de fondo                                      |                                                                     |
# | 2  | Sólida (tinta + sobre-primario) fuera del hero y desde   | @s4 · @s7 · @s8 de ESTE fichero · fidelidad_cabecera @s4            |
# |    | el primer pintado en las demás rutas; 64 px; CLS 0       |                                                                     |
# | 3  | Módulo puro al 100 %; IntersectionObserver; atributo;    | @s1 · @s2 · @s3 · @s5 · @s22 de ESTE fichero                        |
# |    | sin parpadeo en el primer render                         |                                                                     |
# | 4  | Ocho enlaces a 16 px, una fila a 1024 sin truncar, ritmo | @s13 · @s14 · @s15 de ESTE fichero · fidelidad_cabecera @s2 ·       |
# |    | uniforme entre glifos, objetivos >= 48 px                | sistema_de_diseno_visual @s27                                       |
# | 5  | Tienda: mismo tamaño y misma regla de color; píldora y   | fidelidad_cabecera @s6 y @s7 · @s13 y @s10 de ESTE fichero          |
# |    | objetivo conservados                                     | (Tienda es uno de los ocho enlaces medidos)                         |
# | 6  | Velo horizontal; contraste sobre píxeles reales en las   | @s9 · @s10 · @s12 de ESTE fichero · rediseno_visual @s29            |
# |    | cinco paletas, incluida tech                             |                                                                     |
# | 7  | Anillo >= 3:1 sobre foto y sólido; puertas ciegas        | @s11 · @s12 de ESTE fichero · accesibilidad @s18 ·                  |
# |    | reescritas que muerden                                   | identidad_visual @s38 y @s39                                        |
# | 8  | Matriz: par del nav con su uso, recuentos, aprobado      | @s17 de ESTE fichero                                                |
# | 9  | Actual y hover sin solo color; panel móvil, hueco y      | @s16 · @s19 · @s8 de ESTE fichero · identidad_visual @s14 ·         |
# |    | desplazamiento al enfocar intactos                       | rediseno_visual @s28                                                |
# | 10 | Logo temporal con el mejor tratamiento, sin bloquear     | @s21 de ESTE fichero                                                |
# | —  | (encargo) movimiento reducido y estado estable           | @s18 de ESTE fichero · hero_reducido_con_animacion @s10             |
# | —  | (encargo) cierre con la corrida de navegador y mutación  | @s23 de ESTE fichero                                                |
# | —  | (encargo) LCP, CLS y presupuesto de CSS                  | @s20 de ESTE fichero · identidad_visual @s30 y @s49                 |
#
# -----------------------------------------------------------------------------
# LO MEDIDO Y LO NO MEDIDO, DICHO ANTES DE LA PUERTA HUMANA
#
# Cada número lleva la fecha en que se midió. Si envejece, se vuelve a medir.
#
#   MEDIDO el 13/10/2026 (`progress/decisiones_cabecera_hero_20261013.md` §3, en
#   navegador real y sobre la fotografía `clinica.webp`):
#     · Nav en una fila a 1024 px (marca de 256,84 px; relleno lateral de 8 px;
#       hueco de 4 px): a 16 px la holgura entre la marca y el primer enlace es de
#       78 px; a 17 px, 52; a 18 px, 24; a 19 y 20 px la marca se comprime y el
#       descriptor se trunca. Medido en `vite dev` con una barra de desplazamiento
#       clásica de 15 px; con la barra superpuesta de Playwright puede dar hasta
#       15 px MÁS (sin comprobar).
#     · A 16 px «Blog» y «FAQ» miden 48,0 con 0,1 y 1,8 px de sobrante.
#     · Contraste del texto del HERO sobre el velo B, peor píxel bajo cada caja:
#       5,27:1 el titular y 6,06:1 el párrafo. NO consta a qué ancho de ventana ni
#       en qué paleta; se entiende `clinica` y escritorio.
#     · LCP en la web desplegada (Playwright, 5 pasadas): elemento IMG; mediana de
#       264 ms en escritorio (1440x900) y 236 ms en móvil (390x844). CLS 0 en las
#       seis rutas. Son las cifras del hero DE HOY (la foto empieza bajo la
#       cabecera, 836 px de alto): tras P5 hay que REMEDIR con el mismo método.
#       Ver @s20 y `progress/lcp_hero_linea_base_20261013.md`.
#
#   PREVISIÓN, NO MEDIDA EN EL NAVEGADOR (cálculo del craftsman_lead el 13/10/2026
#   sobre el PEOR píxel de `clinica.webp` con la fórmula de `src/lib/contraste.ts`,
#   con el menú a la derecha de la columna de 1220 px, la marca a la izquierda y el
#   texto `sobre-primario` de cada paleta; alfa total de las dos capas del velo =
#   1 − (1 − alfa horizontal) · (1 − alfa vertical)):
#     · Solo con el velo horizontal, MENÚ (los ocho enlaces) a 1440x900: clinica 6,43,
#       calida 5,91, eco 6,01, marca 5,98 y tech 4,86. A 1024x768: 6,15, 5,66, 5,76,
#       5,73 y 4,89. Pasa el mínimo de 4,5 en las cinco, `tech` con poco margen.
#     · CON la franja superior (alfa 0,55 en el borde superior, bajando en línea
#       recta a 0 al 22 % de la altura del hero): menú de 8,23 o más en las cinco
#       paletas a 1440 y a 1024 (en `tech`, 8,58 y 8,45).
#     · Marca y descriptor: solo con el horizontal, 9,54 o más; con la franja,
#       10,83 o más.
#   Son una PREVISIÓN: la prueba válida son @s10, @s11 y @s12 sobre píxeles reales.
#   SI AL MEDIR CON PÍXELES REALES ALGUNA PALETA QUEDA POR DEBAJO de 4,5 (texto) o de
#   3 (anillo y borde), el hallazgo VUELVE A LA PUERTA HUMANA antes de tocar el velo
#   o los colores, como hizo la 39 con su @s4. Qué hacer es una decisión de diseño
#   de Pablo, no del artesano.
#
#   NO MEDIDO:
#     · 375 px: ahí no hay menú de escritorio, solo marca y hamburguesa. Tampoco el
#       texto del HERO a 1024 y a 375 px, donde llega más a la derecha del
#       degradado (los 5,27 y 6,06 del hero no dicen ancho ni paleta).
#     · El renderizado real con antialiasing, que es lo que miden @s10-@s12.
#     · El anillo de foco y el borde de «Tienda» sobre la fotografía.
#     · El parpadeo de la hamburguesa en escritorio en el primer fotograma: es
#       inferencia del código (`App.tsx` arranca con ancho 0).
#     · `public/img/hero/` trae UNA sola fotografía (`clinica.webp`) para las cinco
#       paletas: «cinco paletas» son cinco colores de velo sobre la MISMA foto.
#
#   EL VELO B ES DE DOS CAPAS (decisión de Pablo al elegir B en la maqueta): el
#   degradado horizontal de cuatro tramos y la franja vertical superior de 0,55 a 0
#   al 22 % de la altura de la sección. @s9 exige las dos y mide las dos.
#
# -----------------------------------------------------------------------------
# CONVENCIÓN DE MEDIDA (válida para todos los escenarios de navegador real)
#
#   · «Estado estable»: toda medición de la portada se toma con la entrada
#     animada del hero ya terminada o con movimiento reducido emulado, según
#     `hero_reducido_con_animacion` @s10. La cabecera no se anima, pero la
#     captura de píxeles incluye el hero y su titular.
#   · «Píxeles reales»: los de una captura de pantalla del navegador a una
#     escala de dispositivo de 1. Ningún escenario de este fichero mide contra el
#     color computado del fondo de un ancestro: con la cabecera transparente ese
#     color es el de la página, no el de la foto.
#   · La fotografía debe estar DECODIFICADA antes de medir (`complete` y
#     `naturalWidth` mayores que 0). Si no lo está, el hero pinta su color de
#     tinta opaco y todo daría un contraste altísimo: el fallo es de la medición.
#   · Las posiciones de desplazamiento se eligen CLARAMENTE dentro o fuera del
#     hero (100 px de margen): un IntersectionObserver no es exacto al píxel.
#   · «Alfa efectivo» de la cabecera: el alfa del color de fondo computado POR la
#     opacidad computada de la cabecera y de cada uno de sus ancestros. La opacidad
#     no se hereda en el valor computado, pero SÍ en lo pintado: medir el alfa o el
#     color del propio nodo da verde con un ancestro a `opacity: 0` (lección del
#     panel de revisión de la feature 48). Todo escenario que habla del alfa de la
#     cabecera o de la opacidad de un texto habla del EFECTIVO, y mide lo pintado.
#   · Cada «puerta que muerde» de este fichero se ha pensado con lo que VERÍA el
#     navegador: una mutación que deja el valor computado o el píxel igual no está.
# =============================================================================

Feature: Cabecera transparente sobre la foto del hero, sólida fuera de ella
  Como visitante que llega a la portada quiero ver la fotografía hasta el borde
  superior sin perder el menú, y como visitante de cualquier otra página quiero
  una cabecera que se lea siempre, para que ninguna de las dos cosas me cueste
  poder leer ni poder pulsar.

  # ---------------------------------------------------------------------------
  # @s1 — EL ESTADO LO DECIDE UN MÓDULO PURO, Y «AÚN SIN OBSERVAR» TIENE RESPUESTA
  #
  # POR QUÉ ESTÁ AQUÍ. Ningún otro fichero fija de qué depende el estado de la
  # cabecera: hoy no hay estado. La decisión vive en `Cabecera-logica.ts`, que ya
  # está en la superficie de mutación por el patrón `src/**/*-logica.ts`, y depende
  # de DOS cosas y de nada más: la ruta y si el hero sigue bajo la cabecera. La
  # tabla incluye un tercer valor del hero, «aún sin observar», porque un
  # IntersectionObserver informa DESPUÉS del primer pintado: sin una fila para él,
  # el módulo no tendría respuesta para el primer fotograma de la portada y la
  # respuesta saldría por accidente de lo que devolviera un `undefined`.
  #
  # LAS FILAS «aún sin observar» SON VALORES POR DEFECTO ESCRITOS AQUÍ, respuesta del
  # craftsman_lead (13/10/2026) a una duda de la primera redacción. El estado
  # INICIAL no espera al observador: se decide con lo que el navegador ya sabe antes
  # del primer dibujo, la posición de scroll y el hash. Si la portada se abre en lo
  # alto y sin ancla (o con el ancla de la propia portada, «#inicio»), es
  # «transparente», el caso que se ve sobre la foto. Si se abre ya desplazada o con
  # ancla a otra sección (por ejemplo «#contacto»), es «sólida»: de lo contrario
  # habría un fotograma de letra clara sobre una sección clara. En las otras cinco
  # rutas el valor por defecto NUNCA es transparente. Lo que mide el primer fotograma
  # real es @s22.
  #
  # LA RUTA es el `pathname` que entrega el enrutador, sin el subpath de publicación
  # (`BrowserRouter` usa `basename`): el mismo que ya recibe `Cabecera` como
  # `rutaActual`. La ficha de campaña (`?campana=…`) comparte pathname con
  # "/campanas": la consulta no entra en la decisión. La fila de la ruta no
  # registrada impide que «todo lo que no sea una ruta conocida» pueda ser
  # transparente por omisión.
  #
  # PUERTA QUE MUERDE (módulo puro, StrykerJS al 100 %). La condición «es la
  # portada» pasa a «empieza por "/"», que cumplen todas: las filas de "/blog/demo-1"
  # y de la ruta no registrada dejan de dar «sólida». Se ignora la ruta y se mira
  # solo el hero: la fila de "/blog" con el hero «bajo la cabecera» da «transparente».
  # «Aún sin observar» se trata siempre como «fuera»: la fila de la portada en lo
  # alto da «sólida». Se trata siempre como «bajo»: la fila de la portada con ancla da
  # «transparente». Se invierten los dos estados: falla la primera. El umbral del
  # 100 % de mutación lo fija `harness.config.json`, no este escenario: aquí solo se
  # exige que el módulo esté dentro de la superficie y que el escenario lo ejercite
  # entero.
  # ---------------------------------------------------------------------------
  @s1
  Scenario: El estado de la cabecera depende solo de la ruta y de si el hero sigue bajo ella, y solo la portada puede ser transparente
    Given el módulo de lógica de la cabecera ("Cabecera-logica.ts"), que recibe la ruta activa tal como la entrega el enrutador, la posición del hero respecto a la cabecera —"bajo la cabecera", "fuera de la cabecera" o "aún sin observar"— y, mientras no hay informe, la posición inicial de la página que el navegador ya conoce antes del primer dibujo: "en lo alto" (sin desplazamiento y sin ancla, o con el ancla "#inicio" de la propia portada) o "desplazada o con ancla a otra sección"
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, sin DOM ni observador
    When se consulta el estado de la cabecera para cada combinación de las seis rutas "/", "/campanas", "/blog", "/blog/demo-1", "/tienda" y "/esto-no-existe" con cada una de las cuatro situaciones del hero: bajo la cabecera, fuera de ella, aún sin observar con la página en lo alto y aún sin observar con la página desplazada o con ancla
    Then el veredicto de cada combinación es el de la tabla:
      | ruta                                                               | situación del hero                                  | estado       |
      | "/"                                                                | bajo la cabecera                                    | transparente |
      | "/"                                                                | fuera de la cabecera                                | sólida       |
      | "/"                                                                | aún sin observar, página en lo alto                 | transparente |
      | "/"                                                                | aún sin observar, página desplazada o con ancla     | sólida       |
      | "/campanas", "/blog", "/blog/demo-1", "/tienda", "/esto-no-existe" | cualquiera de las cuatro                            | sólida       |
    And el módulo solo puede devolver uno de dos valores, «transparente» o «sólida», y ninguna combinación devuelve otra cosa
    And el recuento de combinaciones evaluadas es exactamente 24, seis rutas por cuatro situaciones
    And la ruta "/campanas" da el mismo estado con y sin la consulta "?campana=vacunaciones", porque el módulo recibe el pathname
    And el módulo está dentro de la superficie de la prueba de mutación y esta termina con el umbral de 100 % que declara "harness.config.json", sin mutantes supervivientes que no estén catalogados como equivalentes por escrito

  # ---------------------------------------------------------------------------
  # @s2 — EL ESTADO SE ACTUALIZA CON UN OBSERVADOR Y VIVE EN UN ATRIBUTO
  #
  # POR QUÉ ESTÁ AQUÍ. `project-spec.md` fija el Invariante 5 (el estado
  # condicional vive en un atributo ARIA consultable, nunca en un `className`) y
  # `accesibilidad.feature` lo repite en su cabecera. Pero «hay un atributo» no se
  # puede afirmar por nombre: las decisiones dicen «un atributo `data-` o `aria-`»
  # sin nombrarlo. Se afirma por DIFERENCIA: entre los dos estados cambia
  # exactamente uno y, mientras tanto, el atributo `class` es idéntico. Sirve con
  # cualquier nombre y falla si el estado se implementa como clase, como estilo en
  # línea o como dos atributos a la vez.
  #
  # POR QUÉ jsdom. El doble global de IntersectionObserver del arnés
  # (`src/test/setup.ts`) es inerte y no emite nada; este escenario instala el
  # suyo, que emite a mano, y lo restaura al terminar. En jsdom los CSS Modules
  # están desactivados, así que el escenario NO mide cómo se ve nada: lo mide @s4,
  # en navegador real.
  #
  # PUERTA QUE MUERDE. El estado pasa a una clase: el atributo `class` cambia. El
  # estado se escribe en dos atributos: cambian dos. La cabecera deja de crear el
  # observador: el atributo nunca cambia. La ruta "/blog" lee el informe del
  # observador en vez de la ruta: el atributo cambia donde no debe.
  # ---------------------------------------------------------------------------
  @s2
  Scenario: La cabecera cambia de estado cuando el observador de intersección lo informa, y el estado vive en un atributo y no en una clase
    Given la aplicación completa montada en jsdom, con un doble controlable de IntersectionObserver que sustituye al doble inerte del arnés y se restaura al terminar la prueba
    And esta verificación se ejecuta en jsdom y Vitest, porque el doble emite a mano lo que un navegador real emitiría; la geometría real se mide en @s4
    When en la ruta "/" el doble informa de que la sección de bienvenida deja de estar bajo la cabecera y, después, de que vuelve a estarlo, y se repiten los dos informes en la ruta "/blog"
    Then en "/" cambia exactamente un atributo del elemento de cabecera, y su nombre empieza por "data-" o por "aria-"
    And en "/" ese atributo ya vale el del estado transparente antes de que el doble informe nada, vale el del estado sólido tras el primer informe y recupera exactamente su valor original tras el segundo
    And el atributo "class" del elemento de cabecera es idéntico antes y después de cada informe: el estado no vive en una clase
    And en "/blog" ese mismo atributo vale el del estado sólido en todo momento y no cambia, aunque el doble diga que el hero está bajo la cabecera
    And el recuento de observadores que la aplicación crea en "/" es mayor que 0 y observan al menos un elemento de la portada

  # ---------------------------------------------------------------------------
  # @s3 — NINGÚN OYENTE DE DESPLAZAMIENTO EN PRODUCCIÓN
  #
  # POR QUÉ ESTÁ AQUÍ. «Nunca con un listener de scroll» es una prohibición, y una
  # prohibición se hace cumplir mirando el texto: MDN advierte de que `scroll` se
  # dispara a un ritmo alto y de que limitarlo con `requestAnimationFrame` no
  # ayuda, porque ese callback corre al mismo ritmo (investigación del 13/10/2026,
  # docs-oficiales-rendimiento-y-css §6). El estado de la cabecera sale de un
  # observador. El censo de partida es 0 (hoy solo hay lecturas puntuales de
  # `window.scrollY` al pulsar un enlace) y se fija como DISPARADOR, como hizo la
  # 39 con las menciones de urgencias: si algún día hace falta un oyente, vuelve a
  # esta puerta humana en vez de colarse.
  #
  # SI AL MEDIR NACIERA EN ROJO (un oyente ajeno a la cabecera, p. ej. en la
  # galería), el hallazgo vuelve a la puerta humana antes de tocar nada: este
  # escenario fija 0 SOLO si hoy es 0.
  #
  # PUERTA QUE MUERDE (Vitest, lectura "?raw" y lista real de ficheros). Un
  # `window.addEventListener('scroll', …)` en `Cabecera.tsx`, un `onScroll` en un
  # componente o un `onscroll =` en un módulo: el recuento pasa de 0 a 1.
  # ---------------------------------------------------------------------------
  @s3
  Scenario: Ningún fichero de producción registra un oyente del evento de desplazamiento y la detección usa un observador de intersección
    Given la lista real de ficheros de producción de "src" (los que no son pruebas) y su texto real, leído con "?raw" en Vitest
    When se busca cada forma de oír el desplazamiento: addEventListener con "scroll", la propiedad "onscroll", el atributo "onScroll" de JSX y la suscripción a "scroll" de cualquier utilidad propia
    Then el recuento de ocurrencias en ficheros de producción es exactamente 0
    And ese 0 es un disparador con mordiente comprobada: un fichero sintético con "window.addEventListener('scroll', …)" lo pone en 1 y la puerta falla
    And al menos un fichero de producción construye un "IntersectionObserver"
    And el recuento de ficheros recorridos es mayor que 0, y la lista se lee del repositorio, no de una lista escrita en la propia comprobación

  # ---------------------------------------------------------------------------
  # @s4 — EL ESTADO REAL, RUTA POR RUTA Y POSICIÓN POR POSICIÓN
  #
  # POR QUÉ ESTÁ AQUÍ. La cabecera es el armazón común de las seis rutas y solo "/"
  # tiene fotografía detrás (`src/App.tsx` la monta fuera de `<Routes>`): un enlace
  # claro sobre un fondo claro es ilegible, así que el estado tiene que ser sólido
  # DESDE EL PRIMER PINTADO en las otras cinco y en la ruta no registrada. Medir
  # «después de cargar» no demuestra eso: demuestra que acabó siendo sólida. Por eso
  # un registrador instalado ANTES de la carga (`addInitScript`) anota cada
  # fotograma pintado, desde el primero. Es el mismo recurso que usa
  # `hero_reducido_con_animacion` @s6 para el primer fotograma del hero.
  #
  # EL ESTADO SE LEE DE LO PINTADO, no de un nombre de atributo: el alfa EFECTIVO del
  # fondo de la cabecera (el del color de fondo computado, por la opacidad de la
  # cabecera y de sus ancestros: ver la convención de medida). Así el escenario sirve
  # con cualquier atributo (el nombre lo elige el artesano; @s2 fija que sea `data-`
  # o `aria-`), no depende de que el atributo y el color digan lo mismo y no da verde
  # con una cabecera cuyo propio fondo es opaco pero que un ancestro o una
  # `opacity` hace invisible.
  #
  # LAS POSICIONES SE ELIGEN CLARAMENTE DENTRO Y CLARAMENTE FUERA: con el borde
  # inferior del hero al menos 100 px por debajo, o al menos 100 px por encima, del
  # borde inferior de la cabecera. Un IntersectionObserver no es exacto al píxel
  # (MDN: «no sirve para lógica de píxel exacto»); la frontera exacta se fija en
  # @s1 con un booleano, no aquí con un desplazamiento.
  #
  # LO QUE NO CUBRE: la carga con ancla o ya desplazada, que decide el estado INICIAL
  # con el primer fotograma. Es @s22.
  #
  # «SÓLIDA» = ALFA DE 0,94 O MÁS. Pablo pidió «oscura sólida» (P2); la maqueta que
  # vio la pintaba a 0,94 con una sombra. El contrato admite de 0,94 a 1: es un
  # valor de la maqueta, no de las decisiones, y está en «COSAS QUE HE ESCRITO» del
  # resumen para que pueda vetarlo.
  #
  # PUERTA QUE MUERDE. La cabecera de las subpáginas nace transparente y se
  # oscurece al medir el ancho: el primer fotograma de "/blog" tiene alfa 0. El
  # observador no se reengancha tras navegar con «Atrás»: la portada, al volver y
  # desplazarse, se queda transparente sobre una sección clara. La cabecera pasa a
  # transparente a partir de otra posición: falla la posición clara.
  # ---------------------------------------------------------------------------
  @s4
  Scenario: La cabecera es transparente solo en la portada y mientras el hero siga bajo ella, y sólida desde el primer fotograma en las demás rutas
    Given el sitio construido y servido, con la preferencia de movimiento declarada de forma explícita como "no-preference", en una ventana de 1440 por 900 píxeles
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige fotogramas pintados, la geometría real del hero y un observador real
    And un registrador instalado ANTES de que cargue la página anota, en cada fotograma pintado y desde el primero en que existe la cabecera, su alfa efectivo, el del color de fondo computado por la opacidad de la cabecera y de sus ancestros
    When se carga cada una de las seis rutas del inventario y una ruta no registrada sin desplazar; en la portada se desplaza hasta dejar el hero claramente fuera de la cabecera y se vuelve arriba; y se navega sin recargar de "/" a "/blog" y de vuelta con el botón "Atrás"
    Then en la portada cargada en lo alto, en todos los fotogramas anotados desde el primero, el alfa efectivo del fondo de la cabecera es 0
    And en las otras cinco rutas del inventario y en la ruta no registrada, en todos los fotogramas anotados desde el primero, el fondo de la cabecera es el de "--color-tinta" y su alfa efectivo es de 0,94 o más
    And en la portada, con el borde inferior del hero al menos 100 píxeles por debajo del borde inferior de la cabecera, el alfa efectivo es 0; con el hero al menos 100 píxeles por encima, es de 0,94 o más; y al volver arriba es otra vez 0, una vez terminada cualquier transición en curso
    And tras navegar sin recargar de "/" a "/blog" el alfa efectivo es de 0,94 o más en todos los fotogramas posteriores a la navegación, y tras volver con "Atrás" a la portada en lo alto es 0 y, al desplazarse de nuevo fuera del hero, vuelve a ser 0,94 o más: el observador sigue vivo
    And el recuento de cargas medidas es exactamente 7 y el de fotogramas anotados es mayor que 0 en cada una

  # ---------------------------------------------------------------------------
  # @s5 — EL PRIMER RENDER NO PARPADEA: NI LA HAMBURGUESA SOBRE LA FOTO NI EL MENÚ
  #       DE ESCRITORIO EN UN MÓVIL
  #
  # POR QUÉ ESTÁ AQUÍ. `App.tsx` arranca con un ancho de 0 (`ANCHO_ANTES_DE_MEDIR`),
  # que por construcción cae en la rama móvil, y lo mide en un efecto DESPUÉS. En
  # escritorio el primer fotograma puede pintar el botón de menú —que lleva su
  # propio fondo de superficie— y al siguiente cambiarlo por los ocho enlaces. Hoy
  # eso pasa sobre una franja sólida; con la cabecera transparente pasaría SOBRE LA
  # FOTO, un fogonazo de baldosa clara encima de la imagen. Es inferencia del código,
  # NO se ha medido: si nace en verde es porque el motor no llega a pintar ese
  # fotograma, y entonces el escenario queda como trinquete.
  #
  # LO QUE ESTE ESCENARIO NO TOCA, a propósito. `ensamblaje_landing` @s11 y
  # `cabecera_y_navegacion` @s14 fijan el ÁRBOL del primer render (ancho sin medir:
  # existe «Abrir menú» y no existe la navegación), y siguen en pie TAL CUAL. Lo que
  # este escenario fija es lo PINTADO: ningún fotograma muestra la rama que no toca.
  # Se pueden cumplir los dos a la vez (por ejemplo, no pintando el menú ni la
  # hamburguesa hasta tener el ancho); elegir cómo es del artesano. La MARCA no
  # cuenta como control de navegación: es un enlace que se pinta en las dos ramas, y
  # contarla haría fallar justo esa solución. Si no se pudieran
  # cumplir los dos, el hallazgo vuelve a la puerta humana: no se enmienda @s11 en
  # silencio.
  #
  # PUERTA QUE MUERDE. El ancho se sigue midiendo en un efecto posterior al primer
  # pintado y la rama móvil se pinta un fotograma a 1440 px: el recuento de
  # fotogramas con el botón visible es 1. El estado transparente de la portada se
  # calcula tras medir el ancho y el primer fotograma sale sólido: el alfa del
  # primer fotograma no es 0.
  # ---------------------------------------------------------------------------
  @s5
  Scenario: Con el ancho aún sin medir la cabecera no pinta nunca la rama que no le toca
    Given el sitio construido y servido, con la preferencia de movimiento declarada de forma explícita como "no-preference"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige los fotogramas realmente pintados desde el primero
    And un registrador instalado ANTES de que cargue la página anota, en cada fotograma pintado, qué controles de la cabecera están visibles: existen, tienen visibilidad "visible", opacidad efectiva mayor que 0 y una caja no vacía
    When se carga la portada en una ventana de 1440 por 900 píxeles y, por separado, en una de 390 por 844
    Then a 1440 píxeles el recuento de fotogramas anotados en los que el botón "Abrir menú" está visible es exactamente 0
    And a 1440 píxeles el primer fotograma en el que la cabecera tiene algún control de navegación visible, un enlace de la navegación o el botón de menú y no la marca, ya muestra los ocho enlaces de la navegación horizontal
    And a 390 píxeles el recuento de fotogramas en los que la navegación horizontal está visible es exactamente 0, y el primer fotograma con algún control de navegación visible, con la misma definición, ya muestra el botón "Abrir menú"
    And en la portada cargada en lo alto el alfa efectivo del fondo de la cabecera es 0 en todos esos fotogramas, también en los anteriores a la medición del ancho
    And el recuento de fotogramas anotados con la cabecera presente es mayor que 0 en los dos anchos

  # ---------------------------------------------------------------------------
  # @s6 — LA FOTO LLEGA HASTA ARRIBA Y LA CABECERA NO PINTA NADA ENCIMA DE ELLA
  #
  # QUÉ SE FIJA. Dos cosas. (1) La geometría de P5: la sección de bienvenida
  # arranca en y = 0 y, cuando su contenido cabe, su borde inferior está en el alto de
  # la ventana. Los 100svh MÍNIMOS que fija `hero_reducido_con_animacion` @s12 (la
  # sección mide al menos el alto de la ventana y exactamente ese alto cuando el
  # contenido cabe) CUENTAN la franja de la cabecera: la
  # cabecera solapa al hero con margen negativo y no se suma a su altura. Sin esa
  # cláusula una sección de 100svh que arrancara bajo la cabecera, o que subiera sin
  # compensar, mediría 100svh + 64 px y empujaría la siguiente sección fuera de la
  # primera pantalla. La altura en sí es de la 48 y NO se duplica aquí. (2) Que
  # «transparente» es transparente, y no «casi». El método es el
  # único que no se deja engañar por un fondo al 1 %, una sombra o un borde: se
  # COMPARA la franja de 64 px con la cabecera visible y con la cabecera oculta
  # (`visibility: hidden`, solo para esa captura). Fuera de la caja de la marca y de
  # los ocho enlaces, las dos capturas tienen que ser idénticas: lo que la cabecera
  # pinta entre sus controles es nada. El `backdrop-filter` se mira APARTE, porque
  # desenfoca lo que hay detrás aunque el fondo sea transparente, y eso sí cambiaría
  # el píxel; la comparación lo atrapa, y el valor computado lo nombra.
  #
  # POR QUÉ SIN `backdrop-filter`. Decisiones §6.4 y `docs-oficiales-rendimiento-y-css`
  # §8: es coste de GPU por fotograma sobre una foto grande, y además un
  # `backdrop-filter` es el bloque contenedor del panel móvil (`position: fixed` y
  # descendiente de la cabecera): alternarlo entre estados cambiaría ese bloque.
  # @s19 fija que el panel no se mueve.
  #
  # POR QUÉ SE COMPRUEBA QUE LA FOTO ESTÁ. Sin ella el hero pinta su color de tinta
  # plano y «idénticas» sería verdad con cualquier cabecera: la precondición de que
  # la franja contiene al menos dos colores distintos impide ese verde por vacuidad.
  #
  # PUERTA QUE MUERDE. El fondo de la cabecera pasa a 0,05: las dos capturas
  # difieren. Vuelve el `backdrop-filter` o el borde inferior de 1 px: difieren (el
  # borde cae en la fila 63, dentro de la franja). La sección de bienvenida arranca
  # en y = 64 (la imagen no sube): falla la primera cláusula. La sección sube a y = 0
  # pero conserva 100svh de alto sin compensar el solape: su borde inferior queda 64
  # px por debajo del alto de la ventana y falla la segunda mitad de la primera
  # cláusula. El contenido del hero sube con la foto y queda bajo la cabecera: falla
  # la que mide que empieza por debajo de ella.
  # ---------------------------------------------------------------------------
  @s6
  Scenario: En la portada la foto ocupa también la franja de la cabecera y la cabecera transparente no pinta nada sobre ella
    Given la portada construida y servida en 1440 por 900 píxeles, sin desplazamiento, con la entrada del hero en estado estable (hero_reducido_con_animacion @s10) y la fotografía decodificada
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige píxeles pintados
    When se capturan los 64 píxeles superiores con la cabecera visible y, después, con la cabecera oculta solo para esa captura
    Then el borde superior de la sección de bienvenida y el de su imagen están exactamente en y = 0, y, cuando el contenido cabe, el borde inferior de la sección está exactamente en el alto de la ventana: los 100svh mínimos que fija hero_reducido_con_animacion @s12 cuentan la franja de la cabecera, no se suman a ella
    And a 1024 por 768 y a 390 por 844 píxeles la sección arranca también en y = 0 y, cuando el contenido cabe, termina en el alto de la ventana, y a los tres anchos el titular, el párrafo y el botón empiezan por debajo del borde inferior de la cabecera
    And el alfa efectivo del fondo de la cabecera es 0, y no declara sombra ni borde visible (ancho de borde computado 0 o color de borde con alfa 0), y ni la cabecera ni ninguno de sus ancestros tiene una opacidad computada distinta de 1
    And el valor computado de "backdrop-filter" de la cabecera es "none"
    And en todos los píxeles de la franja que no caen bajo la caja de la marca ni bajo la de ninguno de los ocho enlaces, la captura con la cabecera visible y la captura con la cabecera oculta son idénticas
    And la franja contiene al menos dos colores distintos, lo que demuestra que la fotografía está pintada, y el recuento de píxeles comparados es mayor que 0

  # ---------------------------------------------------------------------------
  # @s7 — LA CABECERA SÓLIDA: TINTA DE LA PALETA, TEXTO `sobre-primario`, UN SOLO
  #       JUEGO DE COLORES
  #
  # QUÉ SE FIJA (P2): el fondo es el `--color-tinta` de la variante y el texto el
  # `--color-sobre-primario`, en los dos estados. «Un solo juego de colores en todos
  # los estados» se afirma de la única forma medible: el color computado de cada
  # texto es el MISMO con la cabecera transparente y con la sólida.
  #
  # `tech` ES LA PALETA DE LA SORPRESA. Su `--color-tinta` es #F1F5F9 (casi blanco)
  # y su `--color-sobre-primario` es #04212B (casi negro): su cabecera «oscura
  # sólida» es en realidad CLARA con letra oscura, igual que su velo del hero. Es lo
  # que sale de P2 aplicado a esa paleta; está dicho en el resumen para que Pablo lo
  # sepa. Nada de «blanco» literal: lo prohíbe la puerta de literales de color y el
  # inventario de tokens está CERRADO (`fidelidad_cabecera.feature`, nota de @s7).
  #
  # LA OPACIDAD DEL TEXTO. Pablo pidió «la opacidad que necesite» para los enlaces
  # (punto 2): el color puede llevar alfa menor que 1, pero no puede cambiar de
  # matiz. Se compara el color SIN su alfa, y lo que hace que valga lo mide @s10.
  #
  # PUERTA QUE MUERDE. El fondo sólido pasa a `--color-fondo` o a un literal: los
  # canales dejan de ser los de la tinta. Los enlaces pasan a `--color-tinta` en el
  # estado sólido (el patrón de «Tienda» antes de esta feature): el color deja de ser
  # el de `sobre-primario`. El texto cambia de color entre estados: la igualdad
  # falla.
  # ---------------------------------------------------------------------------
  @s7
  Scenario: Fuera del hero la cabecera es de tinta con texto sobre-primario, y el texto tiene el mismo color en los dos estados
    Given el sitio servido en cada una de las cinco variantes de paleta
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige el valor de las variables de color efectivamente resuelto por el motor
    When se leen los colores computados de la cabecera y de sus textos con la cabecera transparente (portada en lo alto) y con la sólida (portada con el hero claramente fuera de la cabecera), y el fondo de la sólida también en "/blog"
    Then el fondo de la cabecera sólida, en la portada y en "/blog", tiene los mismos canales de color que un elemento de prueba con "background-color: var(--color-tinta)", y un alfa efectivo de 0,94 o más
    And en la portada, el nombre de la marca, el descriptor y cada uno de los ocho enlaces tienen los mismos canales de color que "--color-sobre-primario", aunque su alfa pueda ser menor que 1
    And en la portada el color computado de cada uno de esos diez textos, alfa incluido, es idéntico con la cabecera transparente y con la sólida; el enlace de la página actual de "/blog" se distingue a propósito (@s16) y no entra en esta comparación
    And ni la cabecera ni ninguno de sus ancestros tiene una opacidad computada distinta de 1 en ninguno de los dos estados: la cabecera no se atenúa con "opacity", porque eso cambiaría lo pintado sin cambiar el color computado de ningún texto
    And en cada una de las cinco variantes el recuento de textos medidos por estado es exactamente 10 y el de variantes es exactamente 5

  # ---------------------------------------------------------------------------
  # @s8 — 64 PX EN LOS DOS ESTADOS, NADA SE MUEVE Y EL HUECO DE LAS ANCLAS NO CAMBIA
  #
  # QUÉ SE FIJA. «Altura constante de 64 px en los dos estados (CLS 0)». El CLS
  # se mide, no se deduce: web.dev lo penaliza solo si un elemento desplaza a otros
  # visibles, y `position: fixed` queda fuera del flujo, pero un cambio de altura
  # movería el panel móvil (`inset-block-start: var(--altura-cabecera)`) y el
  # `scroll-padding-top`. NO ENCONTRADO como caso explícito en la documentación
  # oficial (investigación del 13/10/2026): por eso se mide, con un
  # `PerformanceObserver` de tipo "layout-shift", y se exige 0 y no «<= 0,1».
  #
  # QUÉ CONSERVA, y por qué está aquí y no solo en sus escenarios. Los cuatro
  # consumidores del hueco (`#root`, `scroll-padding-top`,
  # `--desplazamiento-al-enfocar` y el panel móvil) siguen haciendo falta en las
  # subpáginas. `identidad_visual` @s14 y `fidelidad_cabecera` @s4 los fijan por
  # TEXTO y por geometría de las subpáginas; ninguno mide, con la portada solapada
  # por el hero, que el relleno de `#root` sigue siendo el mismo ni que el enlace de
  # salto enfocado sigue aterrizando a 8 px de la cabecera. Lo hace este escenario:
  # 88 y 72 son 64 más 24 y 64 más 8, los valores que ya medía el repositorio.
  #
  # LO QUE NO ESTÁ AQUÍ: el salto desde un enlace del menú hasta una sección, que
  # fija `rediseno_visual` @s28 (enmendado), y la altura del hero, que fija
  # `hero_reducido_con_animacion` @s12.
  #
  # PUERTA QUE MUERDE. El `.interior` vuelve a declarar `min-height:
  # var(--altura-cabecera)` sin descontar el borde de 1 px (el defecto que corrigió
  # G1 de la feature 39) en el estado sólido: la cabecera sólida mide 65 y falla la
  # altura. La cabecera crece a 72 px al hacerse sólida: fallan la altura y el CLS.
  # Se quita el relleno de `#root` para que el hero suba sin margen negativo: el
  # relleno computado de las seis rutas deja de ser 64. Se escribe
  # `scroll-padding-top: 80px`: deja de valer 88 (que el valor salga del token y no
  # de un número lo fija `identidad_visual` @s14, por texto).
  # ---------------------------------------------------------------------------
  @s8
  Scenario: La cabecera mide 64 píxeles en sus dos estados, cambiar de estado no mueve nada y el hueco de las anclas no cambia
    Given el sitio construido y servido, con la preferencia de movimiento declarada de forma explícita como "no-preference", la entrada del hero en estado estable (hero_reducido_con_animacion @s10) y la fotografía decodificada
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige geometría real y un "PerformanceObserver" de tipo "layout-shift"
    And un registrador de fotogramas y el observador de "layout-shift" instalados antes de que cargue la página
    When en la portada se desplaza hasta dejar el hero claramente fuera de la cabecera y se vuelve arriba, a 1440 y a 390 píxeles de ancho
    Then la altura de la caja de la cabecera es exactamente 64 píxeles, la de "--altura-cabecera", en todos los fotogramas anotados y en los dos estados
    And la suma de los valores de "layout-shift" registrados durante el cruce, en un sentido y en el otro, es exactamente 0
    And en las seis rutas del inventario "#root" conserva un relleno superior computado igual a "--altura-cabecera", 64 píxeles
    And "scroll-padding-top" de "html" vale 88 píxeles y el enlace "Saltar al contenido principal", enfocado, ocupa desde y = 72
    And el recuento de fotogramas anotados es mayor que 0 y el de cruces medidos por ancho es exactamente 2

  # ---------------------------------------------------------------------------
  # @s9 — EL VELO B: DEGRADADO HORIZONTAL DE CUATRO TRAMOS Y FRANJA SUPERIOR DE REFUERZO
  #
  # QUÉ SE FIJA. El velo B de la maqueta que Pablo vio y eligió (P4): DOS capas.
  #   (1) Degradado HORIZONTAL (decisiones §3): opacidad 0,80, 0,68, 0,30 y 0,22 al 0,
  #       45, 75 y 100 % de la ANCHURA, con el `--color-tinta` de la variante. El
  #       alfa cambia con x, no con y.
  #   (2) Franja VERTICAL superior: 0,55 en el borde superior de la sección, en línea
  #       recta hasta 0 al 22 % de su altura. Las decisiones §P4 la omitieron por
  #       error del craftsman_lead; es PARTE del velo y es OBLIGATORIA.
  # Las dos se componen: alfa total = 1 − (1 − alfa horizontal) · (1 − alfa
  # vertical).
  #
  # CÓMO SE MIDE, que es lo que hace posible un escenario así en un navegador. Leer
  # el texto del degradado de una hoja de estilos es frágil (las variantes de
  # `color-mix` se serializan distinto en cada motor) y lo evalúa un test de CSS
  # Modules desactivado en jsdom, que no ve nada. Se mide el RESULTADO: se sustituye
  # la fotografía por una imagen plana negra y, en otra carga, por una plana blanca;
  # lo que el velo pone encima se deduce de la diferencia entre los dos píxeles,
  # `píxel sobre blanco − píxel sobre negro = 255 · (1 − alfa)`, independiente de
  # qué foto haya y de qué color tenga el velo. El contenido del hero y el texto de
  # la cabecera se ocultan solo para el muestreo.
  #
  # LAS CIFRAS DE LA FRANJA. En x = 0 %: 0,91 en el borde superior, 0,855 al 11 % de
  # la altura y 0,80 al 22 % (1 − 0,20 · 0,45; 1 − 0,20 · 0,725; 1 − 0,20 · 1). En x =
  # 100 %: 0,649, 0,4345 y 0,22 (1 − 0,78 · 0,45; 1 − 0,78 · 0,725; 1 − 0,78 · 1). Por
  # debajo del 22 % no hay componente vertical: el alfa en una misma columna es el
  # mismo al 35, el 50 y el 80 % de la altura. Sin la franja la previsión del menú
  # baja de 8,23 a entre 4,86 y 6,43 (ver «LO MEDIDO Y LO NO MEDIDO»).
  #
  # PUERTA QUE MUERDE. El velo vuelve a ser el vertical de antes de esta feature
  # (0,88 / 0,76 / 0,92): en x = 100 % a mitad de altura el alfa es 0,77 y no 0,22.
  # Se quita la franja: en x = 100 %, y = 0 el alfa es 0,22 y no 0,649. La franja se
  # estira hasta el 40 % de la altura: al 22 % el alfa en x = 100 % es 0,41 y no 0,22.
  # Se invierte el sentido (oscuro a la derecha): el alfa aumenta con x. Se cambia el
  # segundo tramo a 0,55: falla 0,68. Un velo «uniforme más claro» de 0,60: en x = 0
  # el alfa es 0,60 y no 0,80.
  # ---------------------------------------------------------------------------
  @s9
  Scenario: El velo de la fotografía es el degradado horizontal aprobado más la franja superior de refuerzo
    Given la portada construida y servida en 1440 por 900 píxeles, en cada una de las cinco variantes de paleta, con la entrada del hero en estado estable (hero_reducido_con_animacion @s10)
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige leer píxeles pintados
    And la petición de la fotografía del hero se intercepta y se sirve en su lugar una imagen plana negra y, en una segunda carga, una plana blanca, del mismo tamaño
    And el contenido del hero y los textos de la cabecera se ocultan solo para el muestreo, de modo que ningún texto contamine los píxeles
    When se lee, en cada una de las dos cargas, el color del píxel en x = 0, 45, 75 y 100 % de la anchura a la altura del centro del hero, cada 5 % de la anchura a esa misma altura, en las columnas de x = 0 % y x = 100 % a las alturas del 0, el 11 y el 22 % de la sección, y en x = 100 % a las alturas del 35, el 50 y el 80 %
    Then el alfa efectivo del velo en x = 0, 45, 75 y 100 %, deducido en cada canal de la diferencia entre las dos cargas, vale 0,80, 0,68, 0,30 y 0,22, con una tolerancia de 0,02
    And el color que se superpone es el de "--color-tinta" de la variante: sobre la foto negra, cada canal del píxel es el del token multiplicado por el alfa, con una tolerancia de 2 niveles sobre 255
    And muestreado cada 5 % de la anchura, el alfa de cada punto es menor o igual que el del anterior, con la misma tolerancia: no aumenta nunca hacia la derecha
    And en x = 100 % el alfa a las alturas del 35, el 50 y el 80 % de la sección es el mismo, con una tolerancia de 0,02: por debajo del 22 % de la altura el degradado no tiene componente vertical
    And la franja superior es la que fija la maqueta: el alfa total en x = 0 % a las alturas del 0, el 11 y el 22 % es 0,91, 0,855 y 0,80, y en x = 100 % es 0,649, 0,4345 y 0,22, con una tolerancia de 0,02, componiendo las dos capas como 1 menos el producto de lo que cada una deja pasar
    And la imagen servida es la plana: la caja de la imagen del hero ocupa toda la sección, y el recuento de píxeles muestreados es mayor que 0 en las diez cargas, dos por variante

  # ---------------------------------------------------------------------------
  # @s10 — EL TEXTO DE LA CABECERA SE LEE SOBRE LA FOTO REAL, EN LAS CINCO PALETAS
  #
  # QUÉ SE FIJA (C6, SC 1.4.3). El contraste del texto de la cabecera contra los
  # píxeles que hay REALMENTE detrás de él, no contra un color calculado. Con la
  # cabecera transparente, el «fondo» de un texto es una fotografía bajo un velo, y
  # SC 1.4.3 no dice qué zona de una imagen se mide: la regla operativa es F83 del
  # W3C («comprobación rápida» contra la zona más clara si el texto es claro, y
  # después letra a letra) con los procedimientos de G18 y G145. Este escenario
  # aplica la versión más estricta de las dos: TODOS los píxeles de la caja de cada
  # texto, y manda el PEOR. Es el criterio de las decisiones §3 («peor píxel bajo
  # cada caja de texto»).
  #
  # CLASE DE CADA TEXTO (los umbrales del propio repositorio, `accesibilidad`
  # @s28 y @s30): texto grande si mide al menos 24 px, o al menos 18,66 px en
  # negrita (peso 700 o más). Ninguno de los diez textos de la cabecera lo es: el
  # nombre «Galapavet» mide 20 px con peso 600, el descriptor 10,24 px y los ocho
  # enlaces 16 px con peso 500. Todos piden 4,5:1. (El titular del hero, que sí es
  # texto grande, se mide en `rediseno_visual` @s29 con este mismo método.)
  #
  # EL MÉTODO, escrito una vez y citado desde `rediseno_visual` @s29,
  # `identidad_visual` @s38/@s39 y `accesibilidad` @s18:
  #   1. Se oculta el TEXTO del elemento conservando su caja (color transparente y
  #      sin sombra de texto) y se captura esa caja.
  #   2. Para cada píxel de la captura se calcula el contraste entre el color
  #      computado del texto —COMPUESTO con su opacidad EFECTIVA sobre ESE píxel:
  #      el alfa del propio color, por la opacidad computada del elemento y de TODOS
  #      sus ancestros, porque la opacidad no se hereda en el valor computado pero sí
  #      en lo pintado; Pablo pidió poder dar «la opacidad que necesite» a los
  #      enlaces— y el píxel, con la fórmula de `src/lib/contraste.ts`.
  #   3. La cifra del texto es el MENOR de esos contrastes. En `tech`, donde el
  #      texto es oscuro, el peor píxel es el más oscuro; el método no necesita
  #      saberlo, porque calcula el cociente contra todos y se queda con el menor.
  #
  # PRECONDICIONES CONTRA EL VERDE POR VACUIDAD. La puerta anterior daba verde sin
  # mirar la foto (subía por los ancestros hasta `body`). Esta exige, antes de
  # medir: la fotografía decodificada; la cabecera en el estado que toca (se lee
  # del alfa de su fondo); y, en el estado transparente, que los píxeles
  # muestreados NO sean todos del mismo color (si la foto no está, el hero pinta
  # su tinta plana y el contraste saldría altísimo). Si una precondición falla, el
  # veredicto es suspenso: «no se midió». @s12 comprueba que es así.
  #
  # POR QUÉ NO LO CUBRE LA MATRIZ. `matrizDeContraste.ts` compara pares de tokens
  # OPACOS: `sobre-primario` contra `tinta` da 17:1 en `clinica` aunque el píxel
  # real sea mucho más claro que la tinta (el velo es de 0,80 a 0,22, no de 1). La
  # fila de @s17 es exacta para el estado sólido y solo un sustituto en el
  # transparente; la legibilidad real sobre la foto es ESTE escenario.
  #
  # PUEDE NACER EN ROJO, aunque la PREVISIÓN de «LO MEDIDO Y LO NO MEDIDO» dice que
  # no debería: menú de 4,86 a 6,43 solo con el velo horizontal y de 8,23 o más con
  # la franja; marca y descriptor de 9,54 o más. Es un cálculo sobre el peor píxel,
  # no una medida del navegador: la prueba válida es este escenario. Quedan sin
  # medir 375 px y el renderizado real con antialiasing. Si alguna paleta queda por
  # debajo de 4,5 al medir, el hallazgo vuelve a la puerta humana; qué hacer es de
  # Pablo.
  #
  # PUERTA QUE MUERDE. Los ocho enlaces pasan a `--color-tinta`: el cociente cae a
  # 1-2 en las cinco paletas. A la lista del nav (un ANCESTRO) se le aplica
  # `opacity: 0.3`: el color computado de cada enlace no cambia, pero el efectivo sí,
  # y la medición, que compone la opacidad de los ancestros, lo suspende. En `tech` el
  # texto de los enlaces pasa a un blanco: sobre el velo claro el cociente es ≈ 1.
  # ---------------------------------------------------------------------------
  @s10
  Scenario: Todo texto de la cabecera alcanza 4,5 a 1 contra el peor píxel que tiene detrás, sobre la foto y sobre el estado sólido
    Given el sitio construido y servido en cada una de las cinco variantes de paleta, con la fotografía del hero decodificada y la entrada del hero en estado estable (hero_reducido_con_animacion @s10)
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige píxeles realmente pintados
    And el método de píxeles de la nota de este escenario: texto oculto conservando su caja, contraste contra cada píxel con la opacidad EFECTIVA del texto compuesta sobre ese píxel, y cifra igual al menor
    When se mide cada texto de la cabecera a 1440, a 1024 y a 375 píxeles de ancho, con la cabecera transparente (portada en lo alto) y con la cabecera sólida (portada con el hero claramente fuera de la cabecera)
    Then el peor píxel de cada uno de los diez textos de escritorio, el nombre "Galapavet", el descriptor "Centro integral veterinario" y los ocho enlaces, da un contraste de 4,5 a 1 o más, a 1440 y a 1024 píxeles
    And a 375 píxeles el peor píxel del nombre y del descriptor da 4,5 a 1 o más, y el botón de menú no se mide como texto porque lleva su propio fondo
    And con la cabecera transparente los píxeles muestreados de cada caja de texto contienen al menos dos colores distintos, lo que demuestra que la fotografía está pintada
    And el recuento de textos medidos es exactamente 220: cinco variantes por 22 textos por estado (10 a 1440, 10 a 1024 y 2 a 375) por dos estados, y el de píxeles muestreados es mayor que 0 en todos
    And el menor contraste medido por variante y estado se escribe en el informe de la feature, para que Pablo vea el margen y no solo el veredicto

  # ---------------------------------------------------------------------------
  # @s11 — EL ANILLO DE FOCO DE LA CABECERA, CONTRA LO QUE HAY DETRÁS DE VERDAD
  #
  # QUÉ SE FIJA (C7, SC 1.4.11, SC 2.4.13 como objetivo propio del proyecto y C40).
  # El anillo mide al menos 2 px y contrasta 3:1 o más contra el PEOR píxel de la
  # banda que lo rodea, con la cabecera transparente sobre la foto y con la sólida.
  # El anillo es el `--color-sobre-primario` de la variante, el mismo recurso que ya
  # usa el hero (decisiones §6.10): el anillo global `--color-foco` daba 1,98:1
  # sobre el velo oscuro (`global.scss` y `Hero.module.scss` ya lo documentan) y no
  # sirve sobre la foto. La técnica C40 del W3C avisa de que el indicador de dos
  # colores solo garantiza 3:1 sobre fondos SÓLIDOS, y que sobre imágenes hace
  # falta comprobar píxel a píxel: es lo que hace este escenario.
  #
  # LA ZONA DEL ANILLO, capturada SIN foco: la banda que va del borde de la caja del
  # control, separada por el `outline-offset`, hasta esa separación más el grosor
  # del anillo. Se captura antes de dar el foco, para que el anillo no se mida
  # contra sí mismo. Después se calcula como en @s10, con el color del anillo en
  # lugar del del texto.
  #
  # LAS PUERTAS CIEGAS. `accesibilidad.spec.ts` resuelve hoy el fondo subiendo por
  # los ancestros hasta el primer color no transparente (una función para @s38 de
  # identidad_visual y otra para @s39): con la cabecera transparente llegan a
  # `body`, miden contra `--color-fondo` y dan VERDE POR VACUIDAD aunque el anillo
  # no se vea sobre la foto —o un falso ROJO si el anillo es claro y el fondo de la
  # página también—. Se reescriben (identidad_visual @s38/@s39 y accesibilidad @s18)
  # y este escenario es la comprobación de que la medición de la cabecera es de
  # píxeles. Además solo miran los 20 primeros controles de cada ruta: la cabecera
  # cae dentro hoy, pero el contrato lo exige con su propio recuento.
  #
  # PUEDE NACER EN ROJO, por lo mismo que @s10.
  #
  # PUERTA QUE MUERDE. El anillo vuelve a `--color-foco`: sobre el velo oscuro de la
  # marca (a la izquierda, donde el velo vale 0,80) da menos de 3 (1,98:1 medido en el
  # hero con el velo vertical de antes) y el escenario falla; lo demuestra @s12. En
  # `tech` el anillo pasa a un blanco: sobre el velo claro no se ve.
  # ---------------------------------------------------------------------------
  @s11
  Scenario: El anillo de foco de cada control de la cabecera alcanza 3 a 1 contra el peor píxel que tiene alrededor, sobre la foto y sobre el estado sólido
    Given el sitio construido y servido en cada una de las cinco variantes de paleta, con la fotografía del hero decodificada y la entrada del hero en estado estable (hero_reducido_con_animacion @s10)
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige píxeles realmente pintados en dos estados
    And el método de píxeles de @s10 aplicado a la banda del anillo capturada sin foco, con el color del anillo en lugar del del texto
    When cada control de la cabecera recibe el foco por teclado, con la cabecera transparente y con la sólida: la marca y los ocho enlaces a 1440 y a 1024 píxeles, y la marca y el botón de menú a 375
    Then el color del anillo de cada control tiene los mismos canales que "--color-sobre-primario" de la variante y su grosor computado es de 2 píxeles o más
    And el contraste del anillo contra el peor píxel de su banda es de 3 a 1 o más, en las cinco variantes, en los tres anchos y en los dos estados
    And con la cabecera transparente los píxeles de cada banda contienen al menos dos colores distintos
    And el recuento de controles medidos es exactamente 200: cinco variantes por 20 controles por estado (9 a 1440, 9 a 1024 y 2 a 375) por dos estados
    And el contraste mínimo medido por variante y estado se escribe en el informe de la feature

  # ---------------------------------------------------------------------------
  # @s12 — LA PUERTA DE PÍXELES MUERDE: PUEDE PONERSE ROJA Y NO APRUEBA POR VACUIDAD
  #
  # POR QUÉ ESTÁ AQUÍ. Es el criterio 7 del `acceptance` (cambiado el velo o el
  # color, el test se pone en rojo) y el defecto de la puerta que sustituye: nadie
  # comprobó nunca que pudiera ponerse roja sobre una foto. Un escenario que mide el
  # sitio real no puede demostrarlo, porque el sitio real es lo que se espera que
  # pase. Se demuestra de dos maneras que no dependen de si el sitio está bien:
  #   · ESCENAS SINTÉTICAS: una página mínima con un fondo conocido (plano, o con
  #     una franja de un solo píxel de alto) y un texto o un anillo. La función de
  #     medida tiene que dar el veredicto de la tabla, y su causa nombrada.
  #   · SABOTAJES DEL SITIO REAL: se inyecta una hoja de estilos que rompe una cosa
  #     y la puerta de @s10 o de @s11 tiene que suspender. Las cuatro alteraciones
  #     son las que, juntas, reproducen cómo falló la puerta anterior.
  # Se mide en la variante `clinica`; el barrido de las cinco es de @s10 y @s11.
  #
  # EL «NO SE MIDIÓ». Bloquear la petición de la fotografía deja el hero en su
  # tinta plana: todos los contrastes saldrían altísimos. La puerta tiene que
  # distinguir «contraste alto» de «no he podido medir» y suspender en el segundo.
  #
  # LOS RATIOS DE LA TABLA salen de `src/lib/contraste.ts`: blanco sobre negro
  # 21,00; blanco sobre blanco 1,00; blanco al 50 % de opacidad sobre negro ≈ 5,3;
  # blanco al 30 % sobre negro ≈ 2,5. Los umbrales de 4,5 y de 3 se anclan a los
  # literales de `accesibilidad` @s28 y no se obtienen del valor que comprueban.
  #
  # PUERTA QUE MUERDE: la tabla ES la lista de mutaciones. Una fila que dice
  # «suspenso» es una mutación que la puerta debe ver; las que dicen «aprobado»
  # impiden que la puerta se vuelva paranoica y suspenda lo legítimo.
  # ---------------------------------------------------------------------------
  @s12
  Scenario: Las puertas de píxeles de @s10 y de @s11 se ponen rojas ante lo ilegible y no aprueban lo que no han podido medir
    Given la función de medida de @s10 y de @s11, ejecutada en un navegador real sobre escenas sintéticas y sobre la portada de la variante "clinica" con una hoja de estilos inyectada
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige píxeles pintados
    When se pasa cada fila de la tabla por la puerta correspondiente
    Then el veredicto de cada fila es el de la tabla:
      | caso                                                                                             | puerta | veredicto                                          |
      | escena: texto blanco sobre una imagen plana negra                                                | texto  | aprobado, ratio 21,00                              |
      | escena: texto blanco sobre una imagen plana blanca                                               | texto  | suspenso, ratio 1,00                               |
      | escena: texto blanco sobre una imagen negra con una franja blanca de 1 píxel tras una sola letra | texto  | suspenso: manda el peor píxel, no la media         |
      | escena: texto blanco con opacidad 0,5 sobre una imagen plana negra                               | texto  | aprobado, ratio ≈ 5,3: la opacidad se compone     |
      | escena: texto blanco con opacidad 0,3 sobre una imagen plana negra                               | texto  | suspenso, ratio ≈ 2,5: la opacidad se compone     |
      | escena: texto oscuro sobre una imagen plana clara                                                | texto  | aprobado                                           |
      | escena: texto oscuro sobre una imagen clara con una franja negra de 1 píxel tras una sola letra  | texto  | suspenso: el peor píxel es el más oscuro           |
      | escena: texto sobre una imagen cuya petición se bloquea                                          | texto  | suspenso: «no se midió», 0 píxeles muestreados     |
      | escena: anillo blanco sobre una imagen plana negra                                               | anillo | aprobado                                           |
      | escena: anillo blanco sobre una imagen plana blanca                                              | anillo | suspenso                                           |
      | escena: anillo claro sobre una imagen con una franja blanca de 1 píxel en su banda               | anillo | suspenso: manda el peor píxel                      |
      | sitio: el velo del hero se hace transparente y la fotografía se sustituye por una imagen plana blanca | texto  | suspenso en alguna caja de texto                   |
      | sitio: el color de los ocho enlaces pasa a "--color-tinta"                                       | texto  | suspenso en los ocho enlaces                       |
      | sitio: el anillo de los controles de la cabecera pasa a "--color-foco"                           | anillo | suspenso                                           |
      | sitio: se bloquea la petición de la fotografía del hero                                          | texto  | suspenso: «no se midió», no «aprobado»             |
      | sitio: se bloquea la petición de la fotografía del hero                                          | anillo | suspenso: «no se midió», no «aprobado»             |
    And el informe de cada suspenso nombra el texto o el control, el contraste medido y el umbral exigido
    And ninguna fila se aprueba por vacuidad: el recuento de píxeles muestreados de cada fila aprobada es mayor que 0

  # ---------------------------------------------------------------------------
  # @s13 — EL TAMAÑO DE LETRA DEL NAV SALE DE LA ESCALA, NO ES UNA EXCEPCIÓN
  #
  # QUÉ SE FIJA (P3). «16 px (paso 0 de la escala, no una excepción).» El valor
  # computado de 16 px lo mide `fidelidad_cabecera` @s2 en navegador real; lo que
  # aquí se fija es DE DÓNDE SALE. La escala tipográfica (`_api.scss`,
  # `$escala-tipografica`) ya trae 16 px como paso 0, y ninguna puerta prohíbe un
  # `font-size` literal en general (investigación del 13/10/2026,
  # restricciones-sistema-de-diseno §2): sin este escenario, un `16px` escrito a
  # mano pasaría todas las medidas y dejaría el nav fuera de la escala sin avisar.
  #
  # POR QUÉ ENTRA «TIENDA». Hoy el acceso «Tienda» declara su propio `font-size`
  # (`paso-tipografico(-1)`, el mismo valor que sus hermanos, escrito dos veces) y
  # `Cabecera.test.tsx` lo congela. Si el tamaño de los siete cambia y el de
  # «Tienda» no, el escenario falla: es la regla de las decisiones §6.7 («Tienda
  # pasa al mismo tamaño que el resto») hecha comprobable.
  #
  # SE ADMITE LA HERENCIA. `.cabecera` ya declara `font-size: paso-tipografico(0)`:
  # si el artesano borra las declaraciones de los enlaces y de «Tienda» para que
  # hereden ese tamaño, es la solución más limpia y el escenario la acepta. Lo que
  # se mide es el tamaño que acaba aplicándose a cada una de las dos reglas, propio o
  # heredado, y que sea el paso 0.
  #
  # PUERTA QUE MUERDE (módulo puro, lectura "?raw"). Un `font-size: 16px` o
  # `1rem` en `.navPrincipal a`: la declaración no se escribe con la función de la
  # escala. «Tienda» queda en `paso-tipografico(-1)` mientras los demás pasan a 0:
  # las declaraciones difieren. Se sube el nav a `paso-tipografico(1)` (20 px): no
  # cabe a 1024 y lo ve sistema_de_diseno_visual @s27, y aquí falla porque no es el
  # paso 0.
  # ---------------------------------------------------------------------------
  @s13
  Scenario: Los ocho enlaces del nav declaran su tamaño de letra con el paso 0 de la escala
    Given el texto real de "Cabecera.module.scss", leído con "?raw" en Vitest
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS
    When se resuelve el tamaño de letra de la regla de los enlaces de la navegación principal y de la regla del acceso "Tienda", tanto si lo declaran ellas como si lo heredan de la regla de la cabecera
    Then el tamaño de cada una de las dos reglas, propio o heredado, se escribe con "paso-tipografico(0)": ningún literal en píxeles, rem, em, vw ni clamp, ni otro paso
    And "Tienda" no declara un tamaño propio distinto del de los otros siete enlaces
    And el recuento de reglas resueltas es exactamente 2 y el de declaraciones de tamaño leídas, propias o heredadas, es mayor que 0

  # ---------------------------------------------------------------------------
  # @s14 — EL RITMO DEL NAV, MEDIDO ENTRE GLIFOS (ABSORBE LA FEATURE 46)
  #
  # QUÉ SE FIJA. La feature 46 documentó que, a 12,8 px, «Blog» (25,53 px) y «FAQ»
  # (24,13 px) son más estrechos que los 32 px de contenido que deja el relleno, se
  # estiran hasta los 48 px del objetivo de pulsación y TODO el sobrante cae a la
  # derecha del texto: seis huecos de 20,00 px y dos de 26,47 y 35,88. Un ritmo
  # regular con dos saltos visibles. Pablo no eligió entre las dos soluciones que la
  # 46 proponía: eligió 16 px (P3), y a ese tamaño «Blog» y «FAQ» miden 48,0 con 0,1
  # y 1,8 px de sobrante. La 46 se cierra al cerrar la 49, comprobando esto.
  #
  # POR QUÉ ENTRE GLIFOS Y NO ENTRE CAJAS. Entre las CAJAS de dos enlaces
  # consecutivos hay siempre 4 px (el `gap` del contenedor), también en el defecto
  # de la 46: una medida de cajas habría dado verde sobre el defecto que justifica la
  # feature. Se mide con un rango de texto sobre el nodo de texto de cada enlace
  # (`Range.getBoundingClientRect()`), que es donde se ve el sobrante.
  #
  # LA TOLERANCIA, y por qué es de 2 px. Las fuentes no dicen «cuánto de uniforme».
  # Salen de los propios datos: a 16 px el mayor sobrante de un enlace de texto es el
  # de «FAQ», 1,8 px, y el defecto que la 46 quería corregir eran 6,47 px: una
  # tolerancia estrictamente menor que 2 px admite lo medido a 16 px y rechaza el
  # defecto. NO es un valor aprobado por Pablo: va en «COSAS QUE HE ESCRITO» del
  # resumen. De esos dos sobrantes medidos (0,1 y 1,8 px) se DEDUCE, sin haberlo
  # medido, que a 16 px los seis huecos de texto difieren en 0,1 px (el sobrante de
  # «Blog» cae a su derecha) y que el de «FAQ» cae en el par FAQ-«Tienda».
  #
  # LA PÍLDORA «TIENDA» ES LA ÚNICA DIFERENCIA INTENCIONADA (criterio 4 de la 46).
  # Su relleno propio es de 16 px contra los 8 de los demás: el par FAQ-«Tienda» mide
  # más, a propósito. El escenario lo declara como UNA clase aparte de un solo par,
  # y no como una excepción dentro de la tolerancia: así no puede esconder a un
  # segundo par roto.
  #
  # SE MIDE TAMBIÉN EN "/blog". Allí «Blog» es el enlace actual: pesa 600 y su ancho
  # está RESERVADO (@s16), así que el ritmo entre glifos y el sobrante de las cajas
  # no pueden cambiar por ello. Medir solo en la portada no vería nunca ese enlace.
  #
  # PUERTA QUE MUERDE. El nav vuelve a 12,8 px: «Blog» y «FAQ» se estiran de nuevo y
  # los dos sobrantes (6,47 y 7,88 px) y el hueco de «Blog» superan los 2 px. El
  # relleno de «Tienda» se iguala al de los demás: el hueco FAQ-«Tienda» pasa a
  # superar al mayor de los otros solo en 1,7 px, no en 8 o más (con el relleno
  # igualado, 20 + 1,84 de sobrante de «FAQ»). Se mide con las cajas y no con los
  # glifos: la distancia entre cajas es la misma en todos los pares y no se acepta
  # como prueba.
  # ---------------------------------------------------------------------------
  @s14
  Scenario: El blanco entre las letras de dos enlaces consecutivos es el mismo para todos los pares de la misma clase
    Given la portada servida con la cabecera transparente y "/blog" servida con la cabecera sólida y "Blog" como enlace actual, a 1440 por 900 y a 1024 por 768 píxeles
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige la caja de cada glifo: se mide con un rango de texto sobre el nodo de texto de cada enlace, nunca con la caja del enlace
    When se mide, de izquierda a derecha, el espacio entre el último glifo de cada enlace y el primero del siguiente, y el espacio entre el borde de la caja de cada enlace y su propio texto por la izquierda y por la derecha
    Then los seis huecos entre enlaces de texto, entre "Reservar", "Servicios", "Campañas", "Equipo", "Blog", "Contacto" y "FAQ", difieren entre sí en menos de 2 píxeles
    And el hueco entre "FAQ" y la píldora "Tienda" supera en 8 píxeles o más al mayor de los seis huecos de texto: es la única diferencia intencionada de la fila, la del relleno propio de la píldora (16 píxeles frente a 8), y se mide como una clase aparte de un solo par
    And en cada uno de los siete enlaces de texto el espacio de su caja a la izquierda del texto y a la derecha difieren en menos de 2 píxeles: el sobrante de un enlace estrecho no se acumula en un solo lado
    And la distancia entre las cajas de dos enlaces consecutivos no se acepta como evidencia de uniformidad: la medida es siempre la de los glifos
    And el recuento de enlaces medidos es exactamente 8 y el de pares exactamente 7, seis de texto y uno de píldora, en cada una de las dos rutas y de los dos anchos

  # ---------------------------------------------------------------------------
  # @s15 — NINGUNA HOJA GANA UN @media DE ANCHURA NUEVO: EL ÚNICO CORTE SIGUE SIENDO 1024
  #
  # POR QUÉ ESTÁ AQUÍ. «Punto de corte único de 1024 sin `@media` de anchura nuevos»
  # es una restricción de las decisiones (§7) que ningún escenario hace cumplir fuera
  # de la hoja de la cabecera: `sistema_de_diseno_visual` @s25 lee SOLO
  # `Cabecera.module.scss`. Pero el riesgo de esta feature no está ahí: está en
  # donde se resuelve el solape de la portada (`Landing.module.scss`,
  # `global.scss`, `Hero.module.scss`) y en cualquier ajuste del nav para que quepa
  # «solo en este ancho». Un `@media (min-width: 1280px)` en cualquiera de esas hojas
  # abre la franja intermedia que el proyecto cierra con un único literal.
  #
  # INVENTARIO FECHADO (13/10/2026, leído de `src/` con `grep`; si envejece, se
  # vuelve a leer antes de citarlo):
  #   · `Cabecera.module.scss`: DOS veces `(min-width: 1024px)`.
  #   · `Hero.module.scss`: `(max-width: 560px)` y `(min-width: 561px) and
  #     (max-width: 700px)`. La feature 48 retira los que solo existían para la
  #     píldora de ubicación y las cifras, y P5 retira el de `max-width: 560px`; este
  #     inventario es el TECHO, no lo que debe quedar.
  #   · `PieDePagina.module.scss`: `(max-width: 700px)` y `(min-width: 701px) and
  #     (max-width: 1023px)`.
  #   · Ningún otro fichero de estilos de `src/` condiciona por anchura (las demás
  #     apariciones de «@media» son de `prefers-reduced-motion`).
  #
  # SI LA 48 AÑADIERA UNA CONDICIÓN NUEVA en `Hero.module.scss`, este escenario se
  # pone rojo y se actualiza el inventario en el mismo paso: es la regla de oro de
  # este fichero, no un fallo.
  #
  # PUERTA QUE MUERDE (módulo puro, lectura "?raw"). Un `@media (min-width: 1280px)`
  # en `Cabecera.module.scss`, `Landing.module.scss` o `global.scss`: el par
  # (fichero, condición) no está en el inventario.
  # ---------------------------------------------------------------------------
  @s15
  Scenario: Ninguna hoja de estilos declara una condición de anchura que no esté en el inventario del 13/10/2026
    Given el texto real de todos los ficheros de estilos de "src", los módulos, "global.scss" y los parciales, leído con "?raw" en Vitest
    And el inventario fechado el 13/10/2026 de condiciones de anchura por fichero, escrito a mano en el propio escenario: "Cabecera.module.scss" dos veces "(min-width: 1024px)"; "Hero.module.scss" "(max-width: 560px)" y "(min-width: 561px) and (max-width: 700px)"; "PieDePagina.module.scss" "(max-width: 700px)" y "(min-width: 701px) and (max-width: 1023px)"; ningún otro fichero
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS
    When se busca cada "@media" y cada "@container" que condicione por anchura
    Then cada par (fichero, condición) hallado está en el inventario fechado: ninguno es nuevo
    And "Cabecera.module.scss" declara únicamente "(min-width: 1024px)" y su valor es el de "PUNTO_DE_CORTE_NAVEGACION_PX"
    And "Landing.module.scss", "global.scss" y "_api.scss" no declaran ninguna condición de anchura
    And el recuento de condiciones leídas es mayor que 0, y el inventario está escrito a mano y no se obtiene de los ficheros que comprueba

  # ---------------------------------------------------------------------------
  # @s16 — EL ENLACE ACTUAL Y EL HOVER SE DISTINGUEN POR ALGO MÁS QUE EL COLOR, Y
  #        NINGUNA CAJA DEL NAV SE MUEVE
  #
  # QUÉ SE FIJA (decisiones §6.9, y la respuesta del craftsman_lead del 13/10/2026 a
  # la duda del movimiento, valor por defecto que Pablo puede vetar). Hoy el enlace de
  # la página actual se pinta con `--color-primario` y el hover con acento sobre un
  # fondo de acento: sobre una cabecera oscura el color primario no contrasta, y un
  # cambio que depende solo del color no lo percibe quien no distingue colores (la
  # razón de SC 1.4.1, Uso del color; su página oficial no se ha leído para este caso
  # y no se cita como exigencia, es criterio de diseño de la feature). Decisión:
  #   · HOVER = subrayado, SIN cambio de peso.
  #   · ENLACE ACTUAL (`aria-current="page"`) = subrayado + peso 600, con el ancho
  #     RESERVADO: la caja del enlace no cambia por ser el actual.
  #
  # POR QUÉ NO SE MUEVE NADA. Un enlace más grueso es más ancho y empujaría a sus
  # vecinos unos píxeles: justo el defecto de ritmo que la feature 46 vino a corregir.
  # Se mide comparando la MISMA fila en "/", donde ninguno es el actual, y en "/blog"
  # y "/campanas", donde lo son «Blog» (corto) y «Campañas» (largo, así que su cambio
  # de ancho se vería mejor), y comparando la fila en reposo con la fila con el
  # puntero encima. El 0,5 px de tolerancia es el de la 48 para las cajas.
  #
  # NO SE ESCRIBE OTRO NÚMERO DE PESO que el 600 del enlace actual y el 500 de reposo
  # de hoy. «Tienda» ya pesa 600 en reposo y no entra en las comparaciones de peso.
  #
  # `aria-current` SOLO EXISTE EN LAS SUBPÁGINAS (`esPaginaActual` descarta las anclas
  # y el nav no tiene destino "/"), donde la cabecera ya es sólida. Por eso el enlace
  # actual se mide en "/blog" y "/campanas" y el hover en las dos cabeceras.
  #
  # PUERTA QUE MUERDE. El hover pasa a peso 600 sin reservar ancho: la caja del enlace
  # crece y los vecinos se desplazan, y falla tanto «el peso del hover es el de
  # reposo» como «las cajas no se mueven». El enlace actual pasa a 600 sin reservar
  # ancho: en "/campanas" su caja y las de sus vecinos difieren de las de "/" en más
  # de 0,5 px. El enlace actual vuelve a distinguirse solo por color (`--color-primario`):
  # falla el subrayado. Un enlace en reposo hereda un subrayado: falla la clase de
  # reposo. El texto del enlace actual queda en un color que no contrasta con la
  # cabecera: falla el contraste real.
  # ---------------------------------------------------------------------------
  @s16
  Scenario: El enlace de la página actual y el que tiene el puntero encima se distinguen por subrayado, ninguna caja del nav se mueve y siguen siendo legibles
    Given la portada en lo alto con la cabecera transparente, y "/blog" y "/campanas" con la cabecera sólida, donde "Blog" y "Campañas" son el enlace actual, a 1440 por 900 y a 1024 por 768 píxeles, en cada una de las cinco variantes de paleta
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige estilos computados con el puntero encima, cajas reales y píxeles pintados
    When se compara el enlace actual y, por separado, un enlace con el puntero encima, con un enlace en reposo, y se miden las cajas de los ocho enlaces en cada caso
    Then el enlace actual lleva subrayado computado y un peso computado de 600, y cada uno de los siete enlaces de texto en reposo no lleva subrayado y tiene un peso computado de 500
    And un enlace con el puntero encima lleva subrayado computado y su peso computado es el MISMO que en reposo, tanto con la cabecera transparente como con la sólida
    And la caja del enlace actual mide lo mismo, de ancho y de alto, que la de ese mismo enlace en "/", donde no es el actual, y la posición de la caja de cada uno de los ocho enlaces en "/blog" y en "/campanas" difiere de la que tiene en "/" en 0,5 píxeles o menos
    And con el puntero encima de un enlace, la posición y el tamaño de las cajas de los ocho enlaces difieren de los que tienen en reposo en 0,5 píxeles o menos
    And el texto del enlace actual y el del enlace con el puntero encima alcanzan 4,5 a 1 contra el peor píxel que tienen detrás, con el método de @s10, en las cinco variantes
    And el recuento de enlaces actuales medidos es exactamente 2 por variante y ancho, y el de enlaces con el puntero encima es exactamente 2 por variante y ancho, uno por estado

  # ---------------------------------------------------------------------------
  # @s17 — LA MATRIZ DE CONTRASTE DECLARA EL PAR DEL TEXTO DEL NAV, CON SU USO
  #
  # EL PROBLEMA, medido en `matrizDeContraste.ts` y en su test (investigación del
  # 13/10/2026). El par «texto `sobre-primario` sobre `tinta`» YA está en la matriz,
  # con el uso «componente de interfaz o borde de foco» (3:1), por el anillo de foco
  # de los botones del hero. El texto del nav, la marca y el descriptor son TEXTO
  # NORMAL sobre ese mismo par (4,5:1). Una segunda fila del mismo par choca con la
  # unicidad por «rol sobre fondo», que ignora el uso (el test lo calcula sin él y
  # espera 23 claves únicas), y subiría los recuentos 23 filas y 115 parejas.
  #
  # LAS DOS VÍAS que las decisiones §7 dejaron abiertas, y cuál se escribe:
  #   (a) ESCRITA: CAMBIAR el uso de la fila existente a «texto normal». Recuentos
  #       sin cambio (23, 23 y 115). Cambia UNA aserción de `matrizDeContraste.test.ts`
  #       (la que cita el uso de esa fila; un `grep` de «tinta» en el test no da otra
  #       que dependa del uso) y el comentario de historia del recuento. El reparto
  #       por uso pasa de 16 «texto normal» y 7 «componente» a 17 y 6.
  #   (b) DESCARTADA: AÑADIR una fila (24 filas, 120 parejas). Obligaría a redefinir
  #       la unicidad (la clave pasaría a incluir el uso), a cambiar los cuatro
  #       recuentos y a una nueva puerta humana por el cambio de recuento, como la
  #       que necesitó el borrado de F1 de la feature 39.
  # POR QUÉ (a): 4,5 implica 3. Una fila que exige 4,5:1 sigue verificando el anillo
  # de foco a fortiori: no se pierde cobertura, solo se pierde el rótulo del uso
  # secundario (el comentario de procedencia de la fila cita los dos). Es una
  # DECISIÓN QUE HE TOMADO YO por ser la de menor superficie rota; Pablo la firma o
  # la veta con este fichero (y el recuento no cambia, así que no hay segunda puerta).
  #
  # LA ADVERTENCIA QUE NO SE PUEDE OMITIR. La matriz compara tokens OPACOS: no
  # modela el velo translúcido ni la fotografía. La fila es EXACTA para el estado
  # sólido y solo un SUSTITUTO en el transparente. Que la fila apruebe NO prueba que
  # el menú se lea sobre la foto: eso lo prueba @s10. Y la puerta de reconciliación
  # de la matriz solo ve `background-color: var(--color-X)` declarado, que una
  # cabecera transparente no tiene: el par hay que declararlo a mano y ninguna puerta
  # avisará si se olvida (hueco ya anotado en `rediseno_visual` @s11).
  #
  # PUERTA QUE MUERDE (módulo puro, StrykerJS). Se devuelve el uso de la fila a
  # «componente de interfaz o borde de foco»: la comprobación de @s17 falla. Se
  # añade una segunda fila del par: 24 filas, y las claves únicas siguen en 23.
  # ---------------------------------------------------------------------------
  @s17
  Scenario: La matriz de uso declara el texto del nav sobre la tinta como texto normal, sin cambiar sus recuentos
    Given la matriz de uso del sistema ("MATRIZ_DE_USO_DEL_SISTEMA"), el texto real de "_tokens.scss" y el texto real de "matrizDeContraste.ts" leído con "?raw", que es donde viven los comentarios, inexistentes en tiempo de ejecución
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS
    When se lee la fila del rol "sobre-primario" sobre el fondo "tinta" y se resuelve la matriz contra las cinco variantes
    Then existe exactamente una fila de ese par y su uso es "texto normal"
    And la matriz tiene exactamente 23 filas y 23 claves únicas de "rol sobre fondo", y el recuento de parejas comprobadas es exactamente 115
    And el reparto por uso es de 17 filas de "texto normal" y 6 de "componente de interfaz o borde de foco"
    And el veredicto es aprobado en las cinco variantes, también en "tech", donde el par es oscuro sobre claro
    And el comentario de esa fila, leído del texto de "matrizDeContraste.ts", nombra los dos usos del par, el texto del nav y el anillo de foco, y declara que la fila es exacta para el estado sólido y solo un sustituto para el transparente

  # ---------------------------------------------------------------------------
  # @s18 — EL CAMBIO DE ESTADO RESPETA EL MOVIMIENTO REDUCIDO
  #
  # POR QUÉ ESTÁ AQUÍ. La política de movimiento es de otro fichero y ya está
  # cubierta de TEXTO: `sistema_de_diseno_visual` @s33 exige que toda `transition` o
  # `animation` esté dentro de `no-preference` (o anulada en `reduce`) e
  # `identidad_visual` @s16 que sus tiempos y curvas sean los de la escala. Y
  # `identidad_visual` @s42 mide que, con `reduce`, no queda ninguna en curso — pero
  # su recorrido (el selector de paleta, un desplegable, el acordeón, las flechas de
  # la galería) NO DESPLAZA LA PORTADA: nunca cruza el límite del hero, así que
  # nunca ejercita el cambio de estado de la cabecera. Es el hueco de este
  # escenario: sin él, una transición de fondo de la cabecera declarada fuera de
  # `no-preference` pasaría @s42 sin que nadie la viera.
  #
  # LA CABECERA NO TIENE POR QUÉ ANIMARSE. Pablo no pidió una transición del fondo
  # (la de 0,3 s es de la referencia, que no se adopta). Si el artesano no declara
  # ninguna, este escenario se cumple con un recuento de 0 que la última cláusula
  # hace explícito; si declara una (por ejemplo, de color de fondo con una duración
  # de la escala), tiene que vivir solo bajo `no-preference` y terminar en el estado
  # correcto.
  #
  # PUERTA QUE MUERDE. Una `transition: background-color 300ms` en la cabecera,
  # declarada fuera de `no-preference`: la regla global de `reduce`
  # (`*, *::before, *::after`, sin `!important`) tiene especificidad 0 y pierde ante
  # cualquier regla del autor. La feature 48 lo MIDIÓ en Chromium con las
  # animaciones (corren sus 700 ms bajo `reduce`); para las transiciones es
  # inferencia de la misma lógica, no medida. Si es así, bajo `reduce` la transición
  # corre sus 300 ms: aparecen fotogramas con alfa intermedio y el escenario falla.
  # Un `transition-delay`, que el anulador tampoco toca: el primer fotograma tras el
  # cambio de atributo sigue con el alfa anterior y falla. La puerta ESTÁTICA de
  # `sistema_de_diseno_visual` @s33 ve que la declaración esté fuera de la consulta;
  # esta ve el EFECTO. Una transición que se queda a medias: falla el estado final
  # con `no-preference`.
  # ---------------------------------------------------------------------------
  @s18
  Scenario: Con movimiento reducido la cabecera cambia de estado al instante y con movimiento permitido termina en el estado correcto
    Given el sitio construido y servido en 1440 por 900 píxeles, con la entrada del hero en estado estable (hero_reducido_con_animacion @s10) y la fotografía decodificada
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige interrogar el motor de animaciones con las hojas de estilo aplicadas
    And un contexto con "prefers-reduced-motion: reduce" emulado y, por separado, otro con "no-preference" declarado de forma explícita
    When en la portada se desplaza hasta dejar el hero claramente fuera de la cabecera y se vuelve arriba
    Then con "reduce", en el primer fotograma en el que cambia el atributo de estado de la cabecera (el único atributo "data-" o "aria-" que cambia entre los dos estados, según @s2), o en el siguiente, el alfa efectivo de su fondo ya es el del estado final, y ningún fotograma anotado tiene un alfa efectivo de fondo intermedio, distinto de 0 y de 0,94 o más
    And con "no-preference", terminada cualquier transición en curso con un tope de espera (si vence con una transición en curso, el test falla en vez de medir), el alfa efectivo es 0,94 o más fuera del hero y 0 dentro de él: el mismo estado final que con "reduce"
    And si la hoja de la cabecera declara alguna transición sobre la propia cabecera, con "no-preference" se observa al menos una en el cruce, para que el 0 de "reduce" no se cumpla por vacuidad; si no declara ninguna, el recuento de declaraciones leído del texto es exactamente 0 y esta cláusula se cumple con ese 0
    And el recuento de cruces medidos es exactamente 4: dos preferencias por dos sentidos

  # ---------------------------------------------------------------------------
  # @s19 — EL PANEL MÓVIL QUEDA EXACTAMENTE COMO ESTÁ, CON LA CABECERA EN LOS DOS ESTADOS
  #
  # QUÉ SE FIJA (G2 de la feature 39, decisiones §6.11). El panel es un
  # descendiente `position: fixed` de la cabecera. Su bloque contenedor es hoy la
  # propia cabecera por su `backdrop-filter`. Cambiar el estado de la cabecera
  # (quitar o alternar el `backdrop-filter`, aplicar una transformación o una
  # opacidad para animarla) CAMBIA ese bloque contenedor y puede mover, recortar o
  # tapar el panel. El panel debe ser idéntico, en geometría y en colores, con la
  # cabecera transparente sobre la foto y con la sólida, y tampoco debe moverse si
  # el estado cambia con él abierto.
  #
  # LOS ENLACES DEL PANEL SON DESCENDIENTES DE `<header>` Y SE PINTAN SOBRE
  # `--color-fondo`, que es CLARO. Si la regla de anillo de los enlaces del nav
  # (`--color-sobre-primario`, blanco en cuatro paletas) o la de color de texto de la
  # cabecera se heredara por el panel, el anillo blanco sobre un panel casi blanco no
  # llegaría a 3:1. Se mide el anillo y el contraste del texto del panel con el
  # método de @s10.
  #
  # EL BOTÓN DE MENÚ conserva su fondo propio (decisiones §6.11): sobre la foto es
  # lo que lo hace visible. Se mide su fondo y su borde de control; su icono es
  # `--color-tinta` sobre `--color-superficie`, un par que ya está en la matriz.
  #
  # LO QUE SÍ Y LO QUE NO MUEVE EL PANEL. Con la cabecera fija en y = 0, sin
  # transformar y a todo el ancho, el panel (`inset-block-start: var(--altura-cabecera)`,
  # `inset-inline: 0`) queda en el mismo sitio con o sin `backdrop-filter`: su bloque
  # contenedor, la propia cabecera, tiene el mismo rectángulo que el viewport en esas
  # dos dimensiones (deducción de las reglas de CSS, no medida). El riesgo real es que el estado MUEVA o TRANSFORME la cabecera
  # (por ejemplo, para animarla): el panel, hijo suyo, se movería con ella.
  #
  # PUERTA QUE MUERDE. El estado sólido desplaza la cabecera con
  # `transform: translateY(-8px)`: el panel se mueve con ella y su y deja de ser 64.
  # Una regla `.cabecera a:focus-visible { outline-color: var(--color-sobre-primario) }`
  # más específica que la del panel: el anillo de los enlaces del panel deja de ser
  # `--color-foco` y, en `clinica`, blanco sobre un panel casi blanco, cae por debajo
  # de 3. El botón de menú pasa a transparente: su fondo deja de ser el de superficie.
  # ---------------------------------------------------------------------------
  @s19
  Scenario: El panel móvil y el botón de menú son idénticos con la cabecera transparente y con la sólida
    Given el sitio construido y servido en 390 por 844 píxeles, en cada una de las cinco variantes de paleta, con la fotografía decodificada y la entrada del hero en estado estable (hero_reducido_con_animacion @s10)
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige geometría real y píxeles pintados
    When se abre el menú con la cabecera transparente (portada en lo alto) y, por separado, con la cabecera sólida (portada con el hero claramente fuera), y con el menú abierto se cruza el límite del hero
    Then la caja del panel, su x, su y, su ancho y su alto, es idéntica con la cabecera transparente y con la sólida, con una tolerancia de 0 píxeles; arranca en y = 64 y mide el ancho de la ventana
    And la caja del panel es la misma antes y después de cruzar el límite del hero con el menú abierto
    And el panel conserva en los dos estados "position: fixed", "z-index: 9", "max-height: 70vh", su fondo "--color-fondo" opaco, su borde inferior y su sombra elevada, los mismos valores que tenía antes de esta feature
    And el anillo de foco de cada enlace del panel es "--color-foco", no "--color-sobre-primario", y alcanza 3 a 1 contra el peor píxel de su banda, y el texto de cada enlace alcanza 4,5 a 1 contra el peor píxel de su caja, con el método de @s10
    And el botón de menú conserva en los dos estados un fondo opaco igual a "--color-superficie" y un borde igual a "--color-borde-control", y el recuento de enlaces del panel medidos es exactamente 8 por variante y estado

  # ---------------------------------------------------------------------------
  # @s20 — EL TIEMPO DE LCP NO EMPEORA SIN QUE PABLO LO VEA CON LA CABECERA SOBRE LA
  #        FOTO, Y EL CLS NO SUBE
  #
  # QUÉ ES DE LA 48 Y QUÉ DE LA 49. `hero_reducido_con_animacion` @s11 fija el método,
  # el umbral (mediana de 5 cargas de 2500 ms o menos) y el informe del LCP, y @s12
  # fija el hero a pantalla completa (P5). Aquí NO se copia ninguno de los dos. Lo que
  # añade la 49 es REPETIR esa medida cuando ya está aplicada la 49: la cabecera
  # transparente encima de la foto, el velo y el nav a 16 px cambian lo que se pinta
  # en el primer pantallazo, y un LCP medido solo tras la 48 no vale para firmar la
  # 49. El «antes» de la 49 es la medida con la 48 aplicada y sin haber tocado
  # todavía `src/` para la 49.
  #
  # POR QUÉ NO SE EXIGE QUE EL ELEMENTO SEA LA FOTO (P5), Y LO QUE SE ESPERA DE VERDAD.
  # Con el hero a pantalla completa y la foto cubriendo el viewport, la especificación
  # de LCP (§4.3 paso 7) descarta una imagen cuya área visible es la del viewport: el
  # candidato pasa al titular o al párrafo, que entran animados. MEDIDO por un revisor
  # en Chromium 151 (`progress/lcp_hero_linea_base_20261013.md` §4; página sintética
  # con la foto real y una cabecera fija encima, tres cargas por caso): un texto con
  # animación de OPACIDAD cuenta como candidato al TERMINAR la animación (duración +
  # retardo + 30-40 ms), no al empezar; con solo desplazamiento, sin opacidad, cuenta
  # a los ~35 ms. Una redacción anterior de esta nota decía lo contrario («cuenta en
  # el primer fotograma de su animación»), presentado como inferencia a medir: la
  # medida la desmiente. Con la entrada de la 48 (titular a 0 ms, párrafo a +120 ms,
  # 700 ms cada uno) el LCP esperado es del orden de 860 ms —el párrafo: 120 + 700 +
  # ~40—, unas TRES VECES la línea base local de hoy y muy por debajo de 2,5 s. Es la
  # consecuencia de animar con opacidad el elemento que pasa a ser candidato, y que
  # Pablo la acepte es SU decisión: la alternativa técnica es animar solo el
  # desplazamiento, sin fundido. Ver «DUDAS PARA PABLO».
  #
  # LAS LÍNEAS BASE, cada una en su entorno y SIN cruzarse
  # (`progress/lcp_hero_linea_base_20261013.md`). Desplegada (§2, Playwright sobre
  # GitHub Pages): IMG; 264 ms a 1440x900 y 236 ms a 390x844; CLS 0. LOCAL (§2 bis,
  # `dist/` servido con `vite preview`, el entorno en el que se medirá el «después»):
  # IMG; 132 ms a 1440x900 y 120 ms a 390x844; CLS 0. Son las del hero DE HOY, no el de
  # P5. La primera pasada de escritorio en la web desplegada fue de 3156 ms (arranque
  # en frío de la CDN de GitHub Pages): la mediana de cinco la descarta, y no se debe a
  # la página.
  #
  # EL UMBRAL. 2500 ms es el umbral «bueno» oficial (web.dev/articles/lcp, p75 en
  # CAMPO). La medida es de LABORATORIO: sirve de tope absoluto, no de certificado.
  # NINGUNA FUENTE OFICIAL DA UNA TOLERANCIA DE REGRESIÓN y no se inventa un margen
  # relativo: si la mediana de «después» es peor que la de «antes», el informe lo dice
  # y la feature no se cierra sin que Pablo lo vea. Aquí «peor» es ~3 veces: se espera.
  #
  # EL ENTORNO. «Después» se mide en el entorno LOCAL de §2 bis y se compara con 132 y
  # 120 ms; si además se mide sobre la web desplegada tras el despliegue, se compara con
  # 264 y 236. Nunca cruzado.
  #
  # EL INFORME registra, de cada pasada, el elemento del último candidato, el instante de
  # LCP y, si el candidato es un texto animado, el instante en que TERMINA su animación
  # (duración + retardo), que es el que explica el LCP.
  #
  # PUERTA QUE MUERDE. El titular recibe un retardo de entrada de 3 s, o el código que
  # monta la portada se retrasa: el candidato llega tarde y la mediana pasa de 2500 ms.
  # La cabecera introduce un salto de maquetación: el CLS de alguna ruta supera 0,1. La
  # prioridad de la imagen del hero NO es lo que se vigila aquí (con la foto descartada
  # como candidata, un `loading` perezoso no mueve el LCP): la fija `identidad_visual`
  # @s30.
  # ---------------------------------------------------------------------------
  @s20
  Scenario: Con la cabecera sobre la foto la mediana del LCP de la portada sigue en 2500 ms o menos, se compara con el antes y el CLS de las seis rutas no sube
    Given la portada construida y servida con la feature 49 aplicada, con la preferencia de movimiento declarada de forma explícita como "no-preference", en un contexto nuevo por pasada y sin caché
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, con el método, el umbral y el informe de hero_reducido_con_animacion @s11, que esta feature no redefine
    And la medida «antes» de la 49, tomada con la 48 ya aplicada y sin haber tocado todavía "src/" para la 49, y las líneas base del 13/10/2026 del hero de hoy (local: 132 milisegundos a 1440 por 900 y 120 a 390 por 844; desplegada: 264 y 236; en las dos el elemento IMG y un CLS de 0) escritas en "progress/lcp_hero_despues_<fecha>.md"
    When se miden cinco pasadas a 1440 por 900 píxeles y cinco a 390 por 844
    Then la mediana del instante de LCP de las cinco pasadas es de 2500 milisegundos o menos en cada ancho
    And el elemento del último candidato, su instante de LCP y, si es un texto animado, el instante en que termina su animación, en cada pasada, y las dos medianas junto a la medida «antes» de la 49 y a la línea base de su mismo entorno, se escriben en una sección propia de la 49 de ese informe, sin exigir que el elemento sea la fotografía
    And si alguna mediana es peor que la medida «antes» de la 49 o que la línea base de su entorno, el informe lo dice con las dos cifras y la feature no se cierra sin que Pablo lo vea
    And el informe declara si «después» se midió en el entorno local o sobre la web desplegada, y no compara cifras de entornos distintos
    And el desplazamiento acumulado del contenido durante la carga de cada una de las seis rutas es 0,1 o menos, la puerta vigente de identidad_visual @s30, y el de la portada es 0, igual que en las líneas base

  # ---------------------------------------------------------------------------
  # @s21 — EL LOGO TEMPORAL SE VE BIEN SOBRE LA FOTO CON EL TRATAMIENTO QUE SE ELIJA,
  #        Y NO BLOQUEA NADA
  #
  # QUÉ SE FIJA (C10; decisiones §6.12). El logo actual es un WebP de 201x201 con un
  # disco blanco opaco, esquinas transparentes y sin versión clara. Pablo respondió el
  # 13/10/2026 que es TEMPORAL y que se retoque «lo que haga falta (opacidad, fondo,
  # recorte)» para que encaje. El criterio de esta feature dice lo mismo: se exige que
  # se vea bien con el tratamiento que se elija —círculo, fondo u opacidad— y que no
  # bloquee. Por eso el contrato NO impone el tratamiento: el VALOR POR DEFECTO es el
  # círculo (lo que enseñaba la maqueta) y solo si se elige el círculo se mide su
  # forma. Cuál se eligió lo nombra el informe de la feature.
  #
  # POR QUÉ HAY QUE ELEGIR ALGUNO. Sin tratamiento, el `<img>` pinta sus esquinas
  # transparentes con `--color-fondo-alterno` (hueco de imagen, `identidad_visual`
  # @s31) y sobre el velo oscuro se vería una BALDOSA CLARA con un disco blanco
  # dentro. «Que se vea bien» no es medible sin fijar la estética, y la estética es de
  # Pablo; lo medible es, en cualquier caso, que el logo esté cuadrado y decodificado
  # y, para el círculo, que sus esquinas dejan ver la foto.
  #
  # COMPATIBLE CON `identidad_visual` @s31. Ese escenario exige que cada hueco de
  # imagen pinte `--color-fondo-alterno`; el recorte en círculo no lo quita, lo
  # recorta. Quitar el fondo del hueco SÍ lo rompería: por eso no se permite.
  #
  # NO BLOQUEA. El escenario NO depende de los píxeles del logo: sustituir el
  # temporal por el definitivo no pone nada en rojo mientras siga siendo cuadrado y
  # decodificado, y redondeado si se eligió el círculo.
  #
  # PUERTA QUE MUERDE. Con el círculo elegido, el logo vuelve a la baldosa de
  # `border-radius` medio: sus esquinas pintan `--color-fondo-alterno` y difieren del
  # píxel de la foto. El logo se quita de la caja con `display: none`: deja de estar
  # decodificado y medido. El informe no nombra ningún tratamiento.
  # ---------------------------------------------------------------------------
  @s21
  Scenario: El logo de la cabecera se muestra con un tratamiento nombrado sobre la foto y, si es el círculo por defecto, deja ver la foto en las esquinas de su caja
    Given la portada construida y servida en 1440 por 900 píxeles, con la fotografía decodificada y la entrada del hero en estado estable (hero_reducido_con_animacion @s10)
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige píxeles pintados
    When se inspecciona la imagen del logo con la cabecera transparente y con la sólida, y se comparan los píxeles de las cuatro esquinas de su caja, a un píxel de cada vértice, con el logo visible y con el logo oculto solo para esa captura
    Then la imagen del logo es cuadrada, su caja mide más de 0 de ancho y de alto, y está decodificada
    And el tratamiento elegido es uno de estos tres, círculo, fondo propio u opacidad, y el informe de la feature lo nombra
    And si el tratamiento es el círculo, su radio de borde computado es de al menos la mitad de su lado y los píxeles de las cuatro esquinas de su caja son idénticos con el logo visible y con el logo oculto, en los dos estados: sobre la foto se ve la foto y no una baldosa clara
    And el logo sigue declarando ancho y alto y carga inmediata, y su hueco sigue pintando "--color-fondo-alterno" como exige identidad_visual @s31, que no cambia
    And el logo sigue siendo el enlace "#inicio" con un nombre accesible que contiene "Galapavet", como exige cabecera_y_navegacion @s12, que no cambia
    And el recuento de esquinas comparadas es exactamente 8, cuatro por estado, si el tratamiento es el círculo, y 0 en los demás casos

  # ---------------------------------------------------------------------------
  # @s22 — LA PORTADA CARGADA CON ANCLA O YA DESPLAZADA PINTA SÓLIDA EN EL PRIMER
  #        FOTOGRAMA, Y EL PRIMER ESTADO NO SE ANIMA
  #
  # POR QUÉ ESTÁ AQUÍ. Un IntersectionObserver informa DESPUÉS del primer dibujo: el
  # procesamiento de las observaciones es un subpaso de «actualizar el renderizado» y
  # su callback corre en una tarea posterior (MDN: `observe()` dispara el callback en
  # el primer ciclo de render con el estado inicial). Si el estado INICIAL de la
  # cabecera esperara a ese informe, una portada abierta con ancla (`/#contacto`) o
  # recargada desplazada pintaría un fotograma TRANSPARENTE, con letra clara, sobre una
  # sección clara: ilegible. Pregunta que el contrato dejó abierta en su primera
  # redacción y que el craftsman_lead resolvió el 13/10/2026 como VALOR POR DEFECTO que
  # Pablo puede vetar: el estado inicial se decide con lo que el navegador ya sabe antes
  # del primer dibujo —la posición de scroll y el hash—, sin esperar al observador, y
  # el PRIMER cambio de estado se aplica SIN transición; la transición, si existe
  # (@s18), es solo para los cambios posteriores.
  #
  # CÓMO SE HACE MEDIBLE. Un registrador instalado con `addInitScript`, que anota cada
  # fotograma pintado desde el primero en que existe la cabecera SIN esperar a ningún
  # evento de carga (esperar a `load` vería ya el estado final y no el primer
  # fotograma), con su alfa efectivo, la posición de desplazamiento y el hash. Con una
  # ancla, `location.hash` está disponible en el primer render siempre y la caso es
  # determinista. La RECARGA tras desplazar es menos segura: el navegador restaura la
  # posición cuando puede, y con una página que se pinta con JavaScript puede no haberla
  # restaurado aún en el primer fotograma. Por eso solo CUENTA si el registrador ve
  # una posición mayor que 0 en ese primer fotograma; si ve 0, el caso se declara «no
  # aplicable» en el informe y no se inventa un desplazamiento. Hay SIEMPRE las tres
  # cargas con ancla, que no admiten esa salida.
  #
  # LA CONTRAPRUEBA «#inicio»: el ancla de la propia portada es el hero, que sigue bajo
  # la cabecera, así que la cabecera es TRANSPARENTE desde el primer fotograma. Sin ella
  # una implementación que pintara sólida «siempre que haya hash» pasaría las otras dos.
  #
  # PUERTA QUE MUERDE. Decidir el estado solo por el observador: con "#contacto" el
  # primer fotograma tiene alfa efectivo 0 (el valor por defecto de la portada) y falla.
  # Mirar el scroll pero no el hash: con "#contacto" el primer fotograma sigue en 0,
  # porque el navegador aún no ha desplazado nada. Mirar el hash y tratar «#inicio»
  # como cualquier otro: la contraprueba sale sólida y falla. Aplicar la transición del
  # fondo también al primer cambio: aparecen fotogramas con alfa intermedio.
  # ---------------------------------------------------------------------------
  @s22
  Scenario: La portada cargada con ancla a una sección clara o ya desplazada pinta la cabecera sólida desde el primer fotograma, y el primer estado no se anima
    Given el sitio construido y servido en 1440 por 900 píxeles, con la preferencia de movimiento declarada de forma explícita como "no-preference"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige el primer fotograma pintado y un observador real
    And un registrador instalado ANTES de que cargue la página con "addInitScript", sin esperar a ningún evento de carga, anota en cada fotograma pintado, desde el primero en que existe la cabecera, su alfa efectivo, la posición de desplazamiento y el hash
    When se carga la portada con el ancla "#contacto", después con "#servicios", después con "#inicio" y, por último, se desplaza la portada hasta una sección clara y se recarga
    Then con "#contacto" y con "#servicios", en todos los fotogramas anotados desde el primero, el alfa efectivo del fondo de la cabecera es de 0,94 o más
    And con "#inicio", en todos los fotogramas anotados desde el primero, el alfa efectivo del fondo de la cabecera es 0
    And en la recarga tras desplazar, si en el primer fotograma anotado la posición de desplazamiento ya es mayor que 0, el alfa efectivo es de 0,94 o más desde ese fotograma; si es 0, el informe declara el caso no aplicable y no lo cuenta
    And en las cargas con ancla ningún fotograma anotado tiene un alfa efectivo intermedio, distinto de 0 y de 0,94 o más: el primer estado no se anima
    And el recuento de cargas con ancla medidas es exactamente 3 y el de fotogramas anotados es mayor que 0 en cada una

  # ---------------------------------------------------------------------------
  # @s23 — EL CIERRE: TODO EL ARNÉS EN VERDE, INCLUIDA LA CORRIDA DE NAVEGADOR
  #
  # POR QUÉ ES UN ESCENARIO. Casi todo lo que fija este fichero se ejecuta en
  # `tests/e2e/*.spec.ts` con Playwright, y esa corrida NO forma parte del gate de
  # `bin/harness init|verify`: `harness.config.json` fija `commands.test` en
  # `pnpm run test` (Vitest) y `playwright.config.ts` dice que ese fichero no se
  # referencia desde ahí. Un «verde» de `bin/harness verify` no dice nada de @s4-@s6,
  # @s8-@s12, @s14, @s16, @s18-@s22. La feature 39 cerró con `pnpm run test:e2e` EXIT
  # 0 y 174 tests en 27 specs (21/09/2026); la 49 también. Lección del panel de
  # revisión de la 48: el verde parcial no es un verde.
  #
  # LA MUTACIÓN. `Cabecera-logica.ts` está en la superficie por el patrón
  # `src/**/*-logica.ts` y el umbral es el de `harness.config.json`: 100 % sobre los
  # mutantes NO equivalentes, cada equivalente justificado por escrito ANTES de
  # contarlo, con 0 mutantes en `Timeout`, `NoCoverage` y `RuntimeError` leídos ANTES
  # que el score (como hizo la 39). Un score del 100 % con mutantes sin cubrir no es
  # un 100 %.
  #
  # LA PRUEBA DE QUE SE HA EJECUTADO. El informe de cierre
  # `progress/judge_cabecera_sobre_el_hero.md` CITA la salida de `pnpm run test:e2e`
  # (código de salida y recuento de tests y de specs), la de `pnpm run test:config` y
  # la de la mutación (`progress/mutation_cabecera_sobre_el_hero.md`), como hicieron
  # `progress/judge_39_ronda5.md` y `progress/mutation_39_ronda3.md`; la secuencia de
  # TDD queda en `progress/tdd_cabecera_sobre_el_hero.md`. Son los nombres de
  # `CLAUDE.md` (`judge_<name>.md`, `mutation_<name>.md`, `tdd_<name>.md`, con el
  # `name` de la feature). Lo que no se cita no está acreditado.
  #
  # PUERTA QUE MUERDE: dejar `import { … } from …` sin usar o pasar una prop que el
  # componente ya no declara rompe `typecheck` y `build` (con `noUnusedLocals` activo);
  # un escenario de navegador en rojo rompe `pnpm run test:e2e`.
  # ---------------------------------------------------------------------------
  @s23
  Scenario: Lint, tipos, compilación, pruebas, corrida de navegador y mutación terminan limpios
    Given el repositorio con la feature 49 aplicada, en el que "tsc -b" incluye los ficheros de prueba y están activos "noUnusedLocals" y "noUnusedParameters"
    When se ejecutan, cada una por separado y leyendo su código de salida sin tubería, "pnpm run lint", "pnpm run typecheck", "pnpm run build", "pnpm run test", "pnpm run test:config" y "pnpm run test:e2e"
    Then las seis terminan con código de salida 0
    And "pnpm run lint" informa de 0 errores y 0 avisos, y "pnpm run typecheck" y "pnpm run build" informan de 0 errores de TypeScript
    And "pnpm run test:e2e" ejecuta más de 0 tests, ninguno queda omitido ni con reintentos, y entre ellos están los de cada escenario de navegador de este fichero y el de "css-presupuesto.spec.ts"
    And "bin/harness init" termina con código de salida 0
    And la prueba de mutación ("bin/harness mutate") alcanza el umbral de 100 % de "harness.config.json" sobre los mutantes no equivalentes, con cada equivalente justificado por escrito y con 0 mutantes en Timeout, NoCoverage y RuntimeError, leídos antes que el score
    And "progress/judge_cabecera_sobre_el_hero.md" cita la salida de "pnpm run test:e2e", con su código de salida y su recuento de tests y de specs
