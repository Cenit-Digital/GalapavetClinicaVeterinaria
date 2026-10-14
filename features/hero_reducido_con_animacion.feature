# =============================================================================
# FEATURE 48 — hero_reducido_con_animacion
# «Hero reducido a titular, párrafo y un botón, alineado a la izquierda y con
#  entrada animada»
#
# ESTADO: FIRMADO por Pablo el 13/10/2026 (respuesta «Sí, firmo ambos», sin vetar
# ningún valor por defecto). Este fichero y los cinco que enmienda son el contrato
# vigente; la implementación está en los commits eee6be7, 5baf8ce y 2267262 (olas
# 1, 2 y 3a) y la ola 4 corrige lo que encontró el panel de revisión del 14/10/2026
# (ver progress/tdd_hero_reducido_con_animacion.md). Las TABLAS de filas sintéticas
# y el texto de los escenarios no se tocan sin volver a la puerta humana.
#
# REVISADO el 13/10/2026 por un panel de cuatro revisores independientes
# (cobertura, mordiente, consistencia y verdad técnica) y CORREGIDO en consecuencia.
# La pregunta P5 (altura del hero) que esa revisión abrió quedó RESUELTA por Pablo
# el mismo día: el hero es de pantalla completa. Ver H5 y @s12.
#
# QUÉ ES ESTE FICHERO, Y POR QUÉ TIENE POCOS ESCENARIOS PARA LO MUCHO QUE TOCA
#
# La feature 48 ENMIENDA contratos que Pablo ya aprobó: el del hero (píldora, dos
# botones, banda de cifras), el de la política de «cero animaciones» del
# 20/09/2026 y la escala de movimiento de 150/300 ms. Sigue el patrón de la
# feature 39 (`retirada_carteleria_urgencias.feature`): cada comportamiento queda
# escrito en el fichero donde vive su puerta, que es donde alguien lo va a leer
# al tocarlo. Este fichero contiene solo dos cosas:
#
#   1. El ÍNDICE DE TRAZABILIDAD de abajo: ruta y tag de cada parte, incluidos
#      los escenarios que se enmiendan o se retiran en OTROS ficheros.
#   2. Los escenarios genuinamente NUEVOS: los que ningún otro fichero fija.
#
# REGLA DE ORO DE ESTE FICHERO (la misma de la feature 39): aquí NO se copia ni se
# reescribe ningún escenario de los otros ficheros. Dos copias del mismo contrato
# divergen. Si una cláusula cambia, cambia en SU fichero y este índice se
# actualiza en el mismo paso. Se citan ficheros de test y tags, NUNCA números de
# línea: las citas de línea se corren y la nota nace caducada.
#
# -----------------------------------------------------------------------------
# ALCANCE (lo que Pablo pidió y lo que se aplica por defecto)
#
#   H1  El hero conserva SOLO tres elementos: el titular, el párrafo actual y el
#       botón «Reservar cita». Se retiran la píldora de ubicación, el botón
#       «Llamar», la franja de horario y la banda de cifras. PEDIDO EXPLÍCITO de
#       Pablo (13/10/2026, punto 3): «Todo el resto de elementos de ese giro
#       central los eliminas.»
#   H2  Los tres elementos van alineados a la izquierda, en el borde izquierdo de
#       la columna de 1220 px, a ras del borde izquierdo de la marca de la
#       cabecera. VALOR POR DEFECTO (decisiones §6.2): abierto a veto hasta la
#       firma.
#   H3  Ningún dato se pierde: teléfono, horario y localidad siguen publicados en
#       Contacto, FAQ, chat de reserva y pie (decisiones §6.13).
#   H4  El código muerto desaparece y el arnés termina en verde sin avisos.
#   A1  Los tres elementos entran animados: opacidad y desplazamiento horizontal
#       de 40 px, 0,7 s, `ease-out`, retardos 0/120/240 ms, de izquierda a
#       derecha. SOLO con `prefers-reduced-motion: no-preference`. Es la primera
#       animación por fotogramas clave desde el 20/09/2026.
#   A2  La escala de movimiento se amplía de forma escrita (paso de 700 ms y
#       retardos 0/120/240 ms) y su puerta deja de tener dos agujeros: solo leía
#       milisegundos, así que `1.25s` pasaba; y ignoraba `animation-delay`.
#   A3  La puerta de «apariciones animadas» deja de confundir el estado de
#       partida de un `@keyframes` con un estado base invisible.
#   A4  Las declaraciones que ponen algo en movimiento o lo retardan —`animation`,
#       `animation-name`, `animation-delay`— viven SOLO dentro de `no-preference`.
#       La regla global de `reduce` NO es una red de seguridad: tiene especificidad
#       0 y pierde ante cualquier regla del autor que declare `animation` o
#       `animation-duration` (medido en Chromium: con la animación declarada fuera
#       de `no-preference`, bajo `reduce` corre con su duración de 700 ms, no con la
#       de 0,01 ms) y, además, no toca `animation-delay`.
#   A5  Las mediciones de la portada recién cargada no corren contra una
#       animación en curso (carrera temporal).
#   A6  Sin desbordamiento horizontal ni a 320 px, sin layout shift y con el LCP
#       medido antes y después.
#   P1  La política de «cero animaciones» queda enmendada, citando la aprobación
#       de Pablo del 13/10/2026.
#   H5  El hero es de PANTALLA COMPLETA (decisión P5 de Pablo, 13/10/2026): la
#       sección de bienvenida —foto y velo— mide AL MENOS el alto de la ventana
#       (`min-height: 100svh`) en TODOS los anchos, también a ≤ 560 px, y
#       EXACTAMENTE ese alto cuando el contenido cabe. Desaparece la regla
#       `@media (max-width: 560px) { .hero { min-height: 0 } }`, y
#       `clamp(560px, 84svh, 784px)` deja de ser su altura. Su contenido va centrado
#       verticalmente en el alto que queda bajo la cabecera de 64 px. MEDIDO sobre el
#       `dist/` real: hoy el hero mide 837 px a 1440×900 (el contenido empuja su
#       `min-height` de 756), 825 px a 1024×768 (`min-height` de 645,12) y 875 px a
#       375×812 (`min-height` de 0). La primera pantalla de hoy ya es «cabecera de
#       64 px + 836 px de hero» y con `100svh` se ve igual: lo que cambia es lo que
#       hay DEBAJO del pliegue. Pablo pidió «exactamente 100svh»; «al menos, y
#       exactamente cuando cabe» es la decisión (c) del craftsman_lead para las
#       ventanas más bajas que el contenido, VETABLE por Pablo (ver @s12).
#       Consecuencia sobre el LCP: la foto puede dejar de ser candidata cuando la
#       cabecera la cubra, con la 49 (ver @s11).
#
# FUERA DE ALCANCE, y dicho para que nadie lo dé por hecho:
#   · La cabecera transparente sobre la foto, el nav a 16 px, el velo horizontal
#     y el estado de la cabecera por ruta: feature 49 (`cabecera_sobre_el_hero`).
#   · Las animaciones de la galería (feature 40, punto 8 de la reunión con
#     Roberto). La aprobación P1 desbloquea la política, pero cada animación sigue
#     necesitando su propio contrato; @s20 de `accesibilidad.feature` lo hace
#     cumplir (solo el hero puede declarar una animación de entrada).
#   · El logo y el panel móvil.
#   · Los valores de la referencia (vetcruzverde.es: 1,25 s, recorrido del 100 %,
#     retardos de 150 y 200 ms) NO se adoptan. Salen del encargo, no del repo, y
#     la escala del proyecto es la que Pablo aprobó en P1.
#
# -----------------------------------------------------------------------------
# DECISIÓN Y SU PROCEDENCIA (todo en `progress/decisiones_cabecera_hero_20261013.md`)
#
#   13/10/2026, Pablo, respuesta P1 a la pregunta «¿reabrir la política de cero
#   animaciones del 20/09 para la entrada del hero?»: «Sí, 0,7 s escalonada:
#   titular, párrafo (+120 ms) y botón (+240 ms), recorrido de 40 px, se amplía la
#   escala de movimiento con un paso de 0,7 s, sin animación si el sistema pide
#   reducir movimiento.»
#
#   Delegado por Pablo al craftsman («te dejo innovar») y decidido el 13/10/2026:
#   dirección de izquierda a derecha; recorrido de 40 px y no el 100 % de la
#   referencia (el desplazamiento del ancho entero de un titular de 720 px cuenta
#   como movimiento vestibular y no es «relativamente corto»); curva `ease-out`,
#   la única que admite la escala del sistema; solo `opacity` y `transform`
#   (compositor, sin layout shift, sin `will-change` permanente).
#
# -----------------------------------------------------------------------------
# PUERTA HUMANA
#
#   13/10/2026  Pablo aprobó REINTRODUCIR la animación de entrada y AMPLIAR la
#               escala (P1). ESA APROBACIÓN ES LA PUERTA HUMANA que exigía
#               `accesibilidad.feature` @s20 («reintroducir una animación de
#               entrada exige pasar por la puerta humana»).
#   13/10/2026  Pablo pidió retirar píldora, «Llamar», horario y cifras
#               (punto 3 de su encargo).
#   13/10/2026  Pablo decidió P5: el hero es de pantalla completa (H5).
#   13/10/2026  Pablo FIRMÓ este fichero y las enmiendas de los demás (hero,
#               fidelidad_hero, rediseno_visual, accesibilidad, identidad_visual),
#               sin vetar ningún valor por defecto, incluido H2.
#
# -----------------------------------------------------------------------------
# ÍNDICE DE TRAZABILIDAD (A) — POR FICHERO DE CONTRATO
#
# | Contrato (features/…)         | Escenarios                         | Parte      | Puertas                                                   |
# | ----------------------------- | ---------------------------------- | ---------- | --------------------------------------------------------- |
# | hero.feature                  | @s1 (reescrito: sin ubicación)     | H1         | Hero.test.tsx                                              |
# | hero.feature                  | @s4, @s5, @s6, @s9, @s10, @s11     | H1 + H4    | sin puerta, a propósito: su sujeto desaparece. La ausencia |
# |                               | (RETIRADOS con nota; @sN reservado)|            | la fija @s1 de ESTE fichero                                |
# | hero.feature                  | @s13 (apretado: solo destinos "#") | H1         | Hero.test.tsx                                              |
# | hero.feature                  | @s2, @s3, @s7, @s8, @s14 (INTACTOS)| —          | Hero.test.tsx · (@s14) navegador real                      |
# | fidelidad_hero.feature        | @s1 (reescrito)                    | H1 + H2    | fidelidad-hero.spec.ts                                     |
# | fidelidad_hero.feature        | @s2 (reescrito)                    | H1         | fidelidad-hero.spec.ts                                     |
# | fidelidad_hero.feature        | @s3 (reescrito)                    | H1 + A5    | fidelidad-hero.spec.ts                                     |
# | rediseno_visual.feature       | @s18 (reescrito: solo el FAQ)      | H2         | Faq.test.tsx (sale el 900 escrito a mano) · Hero.test.tsx  |
# |                               |                                    |            | (su prueba de «ancho propio < 1220» se retira)             |
# | rediseno_visual.feature       | @s29 (sin cambio por la 48; la 49   | —          | Hero.test.tsx (el contraste lo reescribe la 49)            |
# |                               | enmienda tres: el When y dos Then) |            |                                                            |
# | rediseno_visual.feature       | @s30 y @s51 (RETIRADOS con nota)   | H1 + H4    | sin puerta, a propósito: ver @s1 y @s3 de ESTE fichero     |
# | rediseno_visual.feature       | @s33 (reescrito: sin cintillo)     | H1         | NUEVA, en tests/e2e/fidelidad-hero.spec.ts (recuento en    |
# |                               |                                    |            | navegador). Equipo/Servicios.test.tsx: solo comentarios    |
# | accesibilidad.feature         | nota de política (sección D)       | P1         | —                                                          |
# | accesibilidad.feature         | @s19, @s20, @s22 (reescritos)      | A1 + A3    | movimiento.spec.ts · accesibilidad-movimiento.test.ts      |
# | accesibilidad.feature         | @s21 (REVISADO, sin cambio)        | —          | accesibilidad-movimiento.test.ts                           |
# | identidad_visual.feature      | @s16 (reescrito: escala ampliada)  | A2         | escalaMovimiento.test.ts (módulo puro, 100 % de no equiv.) |
# | identidad_visual.feature      | @s23 (reescrito: párrafo de        | A5         | tests/e2e/tipografia.spec.ts (se medirá antes de cerrar)   |
# |                               | Servicios, no el del hero)         |            |                                                            |
# | retirada_carteleria_urgencias | F2, su fila del índice (A) y la    | P1         | solo comentarios (tres notas de la feature 48): el Gherkin |
# |                               | nota sobre las features 46 y 47    |            | firmado NO se toca                                         |
# | cabecera_sobre_el_hero        | @s4, @s5, @s8 y @s22: EXCEPTUADOS  | A5         | de @s10 por etiqueta (registradores de primer fotograma de |
# |                               | de @s10 por etiqueta. @s14 y @s16  |            | la cabecera, instalados antes del goto); @s14 y @s16 miden |
# |                               | NO se exceptúan                    |            | cajas y hover y la regla de @s10 les aplica con normalidad |
# | fidelidad_lienzo.feature      | @s1 (REVISADO, sin cambio)         | —          | sigue cierto: mide ANCHO (las bandas alcanzan ambos bordes |
# |                               |                                    |            | de la ventana), no alto; 100svh no lo toca                 |
# | ESTE fichero                  | @s1 … @s12 (NUEVOS)                | todas      | ver cada escenario                                         |
#
# CONTRATOS QUE SE CONSERVAN, Y LO QUE NO PROTEGEN. `identidad_visual.feature`
# @s42 y `accesibilidad.feature` @s19 los ejecuta `movimiento.spec.ts`, que ESPERA
# a que no quede movimiento en curso y SOLO DESPUÉS cuenta: el predicado de la
# espera es el de la aserción. Un hero que animara fuera de `no-preference` pasaría
# su espera y seguiría en verde (medido). Por eso @s42 NO protege la entrada del
# hero y no se presenta como si lo hiciera. La protección real es @s6 de ESTE
# fichero (primer fotograma, sin esperar) y @s8 (lectura de las hojas), y la
# cláusula añadida a @s19, que mide también en el primer fotograma.
# `sistema_de_diseno_visual.feature` @s33 (toda `animation`/`transition` dentro de
# una consulta de movimiento) sigue sin tocar; @s8 lo AMPLÍA, no lo sustituye.
#
# AFECTADOS SIN ENMIENDA DE CONTRATO (el texto sigue siendo cierto; cambia su
# prueba, o está en riesgo y @s10 dice cómo se mide):
#   · `Hero.test.tsx`: salen los casos de píldora, «Llamar», horario y cifras; la
#     prueba de rediseno_visual @s18 («el hero declara un ancho propio menor que
#     1220», que lee `width: min(…, 900px)` del SCSS) se RETIRA; la
#     prueba que fija `min-height: clamp(560px, 84svh, 784px)` se REESCRIBE a
#     `100svh` (H5), y la regla `@media (max-width: 560px) { .hero { min-height: 0 } }`
#     del SCSS desaparece.
#   · `Faq.test.tsx` (rediseno_visual @s18): sale el literal `900` escrito a mano
#     que era el ancho del hero; ya no puede ponerse rojo por nada que haga el hero.
#   · `tests/e2e/fidelidad-hero.spec.ts`: se reescribe entero, y acoge la puerta
#     NUEVA del recuento de rótulos en mayúsculas del hero (rediseno_visual @s33).
#   · `tests/e2e/tipografia.spec.ts` (identidad_visual @s23, que SE ENMIENDA para
#     esto): usa el primer `p` de la página, que hoy es la píldora y pasa a ser el
#     párrafo ANIMADO del hero. DECISIÓN: la medida pasa a un párrafo que NO es del
#     hero (el primero de la
#     sección de Servicios), porque medir el alto del párrafo del hero con y sin la
#     fuente de marca arrastra su salto de línea (`max-width: 58ch`, `clamp()` de
#     tamaño) y puede superar la tolerancia de 1 px. Se medirá antes de cerrar; si
#     aun así no cabe en la tolerancia, el hallazgo vuelve a la puerta humana.
#   · `fidelidad_responsive_integral.feature` @s1 y @s6, y los specs de axe, foco
#     y contraste (accesibilidad.feature @s2 y @s18; identidad_visual @s36,
#     @s38, @s39): miden la portada recién cargada. Ver @s10.
#   · `escalaMovimiento.test.ts` fija hoy que un `animation-delay` queda fuera del
#     análisis: ese caso se INVIERTE. `accesibilidad-movimiento.test.ts` fija hoy
#     que el recuento de apariciones animadas es 0: ese caso se INVIERTE.
#   · `datosDelSitio.test.ts`: salen los casos de `digitosDe` y `extraerFragmento`.
#   · `Equipo.test.tsx` y `Servicios.test.tsx`: SOLO hay que corregir los
#     comentarios que mencionan la excepción de la Enmienda 2 del Hero (ver
#     rediseno_visual @s33); sus pruebas no cambian.
#   · `accesibilidad.spec.ts` @s45: hace `goto` y DESPUÉS `emulateMedia`; hay que
#     reordenar, emulando ANTES del `goto` (ver @s10).
#   · Comentarios que quedan falsos, solo comentario: `accesibilidad-movimiento.ts`
#     y `accesibilidad-movimiento.test.ts` (citan `accesibilidad.feature` @s20 con
#     números de línea), `Galeria.test.tsx` (cita `Hero-logica.test.ts`, que se
#     borra).
#   · `matrizDeContraste.ts`: el comentario de procedencia de la fila de foco cita
#     `.acciones a`. La fila sigue válida con un botón.
#   · `project-spec.md`: la Decisión 31 («dos pasos: 150 y 300 ms») y la nota de
#     «fuera de alcance» de la feature 22 quedan desfasadas. Las actualiza el
#     craftsman_lead; este fichero no toca `project-spec.md`. QUE LA DECISIÓN 31
#     QUEDE ACTUALIZADA ES CRITERIO DE CIERRE DEL `judge` (ver @s4).
#
# -----------------------------------------------------------------------------
# ÍNDICE DE TRAZABILIDAD (B) — POR CRITERIO DE `acceptance` DE feature_list.json
#
# | #  | Criterio (abreviado)                                     | Escenario(s) que lo cubren                                         |
# | -- | -------------------------------------------------------- | ------------------------------------------------------------------ |
# | 1  | Exactamente tres elementos; sin píldora, llamada, horario| @s1 de ESTE fichero · fidelidad_hero @s1 y @s2 · hero @s1 y @s13   |
# |    | ni cifras                                                | · rediseno_visual @s33                                             |
# | 2  | Alineado a la izquierda, en la columna de 1220 px, a ras | fidelidad_hero @s1                                                 |
# |    | de la marca                                              |                                                                    |
# | 3  | Ningún dato se pierde                                    | @s2 de ESTE fichero (la composición) · los contratos de cada       |
# |    |                                                          | componente, enlazados en su nota                                   |
# | 4  | Código muerto fuera; lint, typecheck, build y tests a 0  | @s3 y @s4 de ESTE fichero                                          |
# | 5  | Entrada animada con los valores aprobados, SOLO con      | @s5 · @s6 · @s8 de ESTE fichero · accesibilidad @s19 y @s22        |
# |    | `no-preference`; con `reduce`, nada y todo visible       |                                                                    |
# | 6  | Estado base = estado final visible                       | @s7 de ESTE fichero · accesibilidad @s20 (lectura de las hojas)    |
# | 7  | Escala ampliada y su puerta lee segundos y retardos      | identidad_visual @s16                                              |
# | 8  | La puerta de apariciones distingue partida de base       | accesibilidad @s20                                                 |
# | 9  | Hero de pantalla completa (P5, `100svh`)                 | @s12 de ESTE fichero                                               |
# | 10 | Sin desbordamiento a 320 px; CLS <= 0,1 en 6 rutas;      | @s9 · @s10 · @s11 de ESTE fichero · fidelidad_hero @s3 ·           |
# |    | tiempo de LCP medido antes y después                     | identidad_visual @s30 (independiente, complementado por @s9)       |
# | 11 | Política de cero animaciones enmendada                   | accesibilidad: nota de política, @s19-@s22 · identidad_visual @s16 |
# |    |                                                          | · retirada_carteleria_urgencias F2 (solo comentarios)              |
#
# -----------------------------------------------------------------------------
# LO QUE ESTE FICHERO NO CONTRATA, Y POR QUÉ (léase antes de añadir nada aquí)
#
#   · «Los tres elementos son los de hero.feature @s1, @s2 y @s3» — esas tres
#     cláusulas (el titular exacto, el párrafo con sus cinco servicios, el botón a
#     `#reservar`) siguen siendo suyas. @s1 de ESTE fichero las cita, no las repite.
#   · «Cada dato retirado tiene su valor literal» — lo fijan informacion_contacto
#     @s2-@s4, pie_de_pagina @s1 y @s5, faq @s2-@s3 y reserva_chat @s19. @s2 de
#     ESTE fichero fija la composición, no los valores.
#   · «Sin animación sobre el contenido de otras secciones» — lo fija accesibilidad
#     @s20 (solo el hero puede declarar una animación de entrada).
#   · «La cabecera y el velo» — feature 49.
#   · `fidelidad_lienzo.feature` @s1 («las bandas, la de bienvenida incluida,
#     alcanzan ambos bordes de la ventana») mide ANCHO, no alto: sigue cierto con
#     `100svh` y NO se enmienda. Leído el 13/10/2026 junto con su spec.
#   · El prototipo versionado `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`
#     conserva el hero ANTIGUO (píldora, dos botones, cifras): queda como HISTÓRICO,
#     SIN TOCAR (valor por defecto, vetable por Pablo). `rediseno_visual` @s41 solo
#     comprueba el inventario de ficheros del paquete, no que su contenido coincida,
#     así que no se contradice.
#   · La FEATURE 47 (`igualdad_declarada_de_los_botones_del_hero`) queda SIN
#     SUJETO: con un solo botón no hay pareja cuya igualdad declarar. No lleva
#     escenario; se cierra al cerrar la 48. El mixin `boton-fantasma` de
#     `_api.scss` conserva consumidores reales fuera del hero (cabecera,
#     formulario de contacto, chat de reserva y varias páginas): @s3 solo exige que
#     quede al menos uno, sin atar la 48 a la cabecera, que modifica la 49.
# =============================================================================

Feature: Hero reducido a titular, párrafo y un botón, con entrada animada
  Como visitante que llega a la portada quiero ver de un vistazo quién es Galapavet
  y cómo reservar, sin un muro de datos, y con una entrada suave que no me moleste
  si mi sistema me pide menos movimiento.

  # ---------------------------------------------------------------------------
  # @s1 — EXACTAMENTE TRES ELEMENTOS
  #
  # POR QUÉ ESTÁ AQUÍ. Los cuatro elementos que se retiran tenían su contrato
  # POSITIVO («hay una píldora», «hay un botón de llamada», «hay una franja»,
  # «hay cuatro cifras») y ese contrato se retira en su sitio. Sin un escenario que
  # afirme el CONJUNTO, volver a poner cualquiera de los cuatro no pondría nada en
  # rojo: no queda ningún escenario que diga que NO deben estar. `hero.feature`
  # @s7 y @s8 vetan cifras y urgencias sueltas, no el conjunto.
  #
  # PUERTA QUE MUERDE (`Hero.test.tsx`, jsdom). Vuelve la píldora: el recuento de
  # párrafos pasa de 1 a 2 y el texto contiene «Galapagar». Vuelve «Llamar»: el
  # recuento de enlaces pasa de 1 a 2. Vuelve la franja o las cifras: aparece un
  # elemento de lista o de definición y un dígito en el texto. Se quita el botón
  # o el párrafo: el recuento baja de 3 a 2.
  #
  # LA CLÁUSULA DEL DÍGITO NO ES UN ADORNO: el titular y el párrafo no llevan
  # ninguna cifra, así que «ningún dígito» es verdad hoy y atrapa de golpe un
  # teléfono, un horario y cualquiera de las cuatro cifras retiradas, sin
  # enumerarlas.
  # ---------------------------------------------------------------------------
  @s1
  Scenario: La sección de bienvenida contiene exactamente un titular, un párrafo y un botón de reserva
    Given la sección de bienvenida renderizada tal como la monta la portada, sin ninguna prop
    When se recorre todo su contenido
    Then los únicos elementos de la sección que contienen texto propio o son interactivos son exactamente 3: un encabezado de nivel 1, un párrafo y un enlace
    And el encabezado tiene el nombre accesible exacto que fija hero.feature @s1
    And el párrafo conserva el texto descriptivo que fija hero.feature @s2
    And el enlace tiene el nombre accesible exacto "Reservar cita" y su destino es exactamente "#reservar"
    And en toda la sección hay exactamente 1 encabezado, 1 párrafo y 1 enlace
    And en toda la sección hay exactamente 1 imagen, es decorativa (texto alternativo vacío) y no forma parte del contenido de texto
    And la sección no contiene ningún elemento de lista, de lista de definiciones, de término ni de definición
    And el texto de la sección no contiene ningún dígito, ni "Galapagar", ni "Madrid", ni "Llamar", ni "Lunes", ni "Sábados", ni "Domingos"
    And el recuento de elementos recorridos es mayor que 0

  # ---------------------------------------------------------------------------
  # @s2 — NINGÚN DATO SE PIERDE
  #
  # POR QUÉ ESTÁ AQUÍ, Y QUÉ NO DUPLICA. Cada dato ya tiene contrato por
  # componente, y esos contratos NO se tocan:
  #   · localidad  — informacion_contacto @s2 (dirección) y pie_de_pagina @s1
  #   · teléfono   — informacion_contacto @s3, pie_de_pagina @s5 y faq @s3
  #   · horario    — informacion_contacto @s4, faq @s2 y reserva_chat @s19
  # Todos miden UN componente aislado en jsdom, y todos ellos seguirían en verde si
  # alguien, al «limpiar duplicados» del hero, desmontara un componente de la
  # portada o dejara un dato sin sitio. Lo que NINGUNO fija es la COMPOSICIÓN: que
  # en la portada montada el dato que ya no está en el primer pantallazo SIGA a la
  # vista en otro sitio. Es la pregunta de Pablo: «he quitado esto del primer
  # pantallazo, ¿se ha perdido?».
  #
  # PUERTA QUE MUERDE (navegador real). Se retira el teléfono de Contacto o del
  # pie, o el horario del chat: el recuento de lugares de ese dato baja y el
  # escenario falla. Vuelve un dato al hero: el recuento DENTRO del hero deja de
  # ser 0.
  #
  # LA LECTURA DEL TEXTO NO PUEDE SER CIEGA A LAS MAYÚSCULAS. La píldora de hoy
  # lleva `text-transform: uppercase`: su `textContent` es «Galapagar · Madrid» pero
  # su `innerText` es «GALAPAGAR · MADRID» (medido sobre el `dist/` real). Un test
  # que cuente con `innerText` y una coincidencia sensible a mayúsculas da recuento
  # 0 de la localidad dentro del hero CON EL DEFECTO PRESENTE, y el «0» sería un 0
  # por vacuidad. Por eso, para los tres datos y tanto dentro como fuera del hero, se
  # lee con `textContent` o se compara sin distinguir mayúsculas. Y la comprobación
  # del hero tiene su propia prueba de mordida: sobre una portada SINTÉTICA que aún
  # lleve la píldora, el recuento de la localidad dentro del hero tiene que salir
  # mayor que 0 (el sabotaje demuestra que el «0» de la portada real no es vacío).
  #
  # POR QUÉ «AL MENOS» Y NO «EXACTAMENTE». El teléfono de la clínica también está en
  # el chat de reserva («Llamar a la clínica»), y la localidad también está en el
  # titular de Contacto y en el de Servicios: el conjunto exacto de lugares es más
  # grande que el de los contratos citados, y fijarlo en «exactamente» pondría el
  # escenario en rojo sin ninguna regresión. Lo que se fija es el MÍNIMO que el
  # criterio 3 del `acceptance` nombra: nunca menos.
  #
  # EL FAQ ES UN ACORDEÓN EXCLUYENTE. `Faq.tsx` guarda un único índice abierto y
  # desmonta las respuestas cerradas: abrir la segunda cierra la primera. Por eso el
  # When se escribe EN SECUENCIA (abrir una, leerla, abrir la otra, leerla) y no «con
  # las dos abiertas», un estado que no existe y que daría rojo con el código
  # correcto.
  #
  # LA REGLA DE COINCIDENCIA, porque el texto NO es idéntico en todos los sitios:
  #   · Teléfono: por DÍGITOS (el nombre visible lleva espacios y el destino «tel:+34…»).
  #   · Horario en Contacto y en el chat: comparación LITERAL con la fuente única, que
  #     es donde sí coincide (`informacion_contacto` @s4, `reserva_chat` @s19).
  #   · Horario en el FAQ: la respuesta pasa por `textoHorario`, que escribe los días
  #     en minúsculas y cambia « y » por « y de » («de lunes a viernes de 11:00 a
  #     14:00 y de 16:30 a 20:00, … domingos cerrado», faq @s2). El literal de la
  #     fuente única («Lunes a viernes», «11:00 a 14:00 y 16:30 a 20:00», «Cerrado»)
  #     NO es subcadena de ese texto. Se compara contra `textoHorario(datosNegocio.
  #     horario)`, importado de `src/components/Faq-logica` (viable:
  #     `datos-reales.spec.ts` ya importa `datosNegocio`), O por TRAMO, la pareja día
  #     más horas completa. Los tres tramos de hoy: «lunes a viernes de 11:00 a 14:00 y
  #     de 16:30 a 20:00» (o, por cada intervalo junto al día, «de 11:00 a 14:00» y
  #     «de 16:30 a 20:00»), «sábados de 11:00 a 14:00» y «domingos cerrado». NO por
  #     tokens sueltos: si el FAQ dijera «de sábados cerrado, domingos cerrado», los tres
  #     días, los dos intervalos de lunes a viernes y «cerrado» seguirían apareciendo y
  #     una comprobación por tokens pasaría; solo las dos formas fuertes muerden.
  #
  # HONESTIDAD SOBRE EL FAQ: sus respuestas arrancan cerradas, así que el horario
  # y el teléfono solo son visibles allí TRAS abrirlas. El criterio del
  # `acceptance` dice «siguen visibles en … FAQ»; se escribe con esa condición.
  # ---------------------------------------------------------------------------
  @s2
  Scenario: Los datos que salen del hero siguen publicados en el resto de la portada
    Given la portada construida y servida
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige la portada con todas sus secciones montadas
    And el teléfono principal, los tres tramos de horario y la localidad se leen de la fuente única de datos de negocio, nunca de una lista escrita en el propio test
    When se busca cada uno de esos tres datos en el documento, separando lo que está dentro de la sección de bienvenida de lo que está fuera de ella, leyendo el texto con "textContent" o comparando sin distinguir mayúsculas, dentro y fuera del hero, porque el rótulo de ubicación del hero actual se pinta en mayúsculas con CSS y su "innerText" sale en mayúsculas
    And se abre en el acordeón la pregunta "¿Qué horario tiene la clínica?", se lee su respuesta, se abre después "¿Cómo pido cita?" y se lee la suya, una a una porque el acordeón es excluyente y desmonta la respuesta que se cierra
    Then dentro de la sección de bienvenida el recuento de apariciones de cada uno de los tres datos es exactamente 0, y sobre una portada sintética que todavía lleve la píldora de ubicación, la franja y el botón de llamada ese mismo recuento sale mayor que 0
    And el teléfono principal aparece como enlace de llamada, reconocido por sus dígitos, en la región "Información de contacto", en el pie y en la respuesta de "¿Cómo pido cita?"
    And los tres tramos de horario aparecen, con coincidencia literal con la fuente única, en la región "Información de contacto" y en la columna de texto de la sección "Reservar"
    And los tres tramos de horario aparecen en la respuesta de "¿Qué horario tiene la clínica?" con la regla del FAQ: comparados con el texto que produce "textoHorario" a partir de la fuente única, importado de "src/components/Faq-logica", o bien tramo a tramo, cada pareja día más horas completa —"lunes a viernes de 11:00 a 14:00 y de 16:30 a 20:00" (o, por intervalo junto al día, "de 11:00 a 14:00" y "de 16:30 a 20:00"), "sábados de 11:00 a 14:00" y "domingos cerrado"—, sin distinguir mayúsculas y nunca con días, intervalos y "cerrado" sueltos
    And la localidad aparece en la dirección de la región "Información de contacto" y en la descripción del pie
    And cada dato aparece al menos en los lugares citados, y el recuento de lugares donde se encontró cada uno es mayor que 0
    And los valores literales de esos datos los fijan sus propios contratos: este escenario lee cada tramo de la fuente única, por separado, y lo compara como pareja día más horas, sin retipearlo

  # ---------------------------------------------------------------------------
  # @s3 — EL CÓDIGO QUE SOLO EXISTÍA PARA LO RETIRADO DESAPARECE
  #
  # POR QUÉ ES UN ESCENARIO Y NO UNA NOTA. La retirada de los cuatro elementos
  # deja piezas que ninguna puerta de comportamiento ve: un módulo puro que sigue
  # en la superficie de mutación mutando una función que nadie llama, props que
  # nadie pasa, estilos de elementos que ya no existen. «Está muerto» es una
  # afirmación sobre el TEXTO de los ficheros, y se mide leyéndolo.
  #
  # SE BUSCAN IDENTIFICADORES, NO SUBCADENAS. Una búsqueda de «horario» o
  # «telefono» como subcadena también salta con un comentario legítimo que cuente
  # por qué se retiró. Se comprueban las importaciones, las props y el JSX.
  #
  # PUERTA QUE MUERDE (Vitest, lectura "?raw" y lista real de ficheros). Vuelve
  # `Hero-logica.ts` o su test: el fichero existe y la prueba falla. Vuelve el
  # bloque `.cifras` o `a:not(:first-child)` a la hoja: aparece su selector. Vuelve
  # la consulta `(min-width: 561px) and (max-width: 700px)`, que solo existía para
  # las cifras: la cláusula del `@media` falla. Queda `digitosDe` o
  # `extraerFragmento` sin consumidor: se exporta y falla.
  #
  # LA SUPERFICIE DE MUTACIÓN NO TIENE LISTA QUE EDITAR: sale del patrón
  # `src/**/*-logica.ts` de `stryker.config.json`. Borrar el fichero la reduce
  # sola; lo que se comprueba es que no queda ninguno con ese nombre.
  # ---------------------------------------------------------------------------
  @s3
  Scenario: Lo que solo existía para la píldora, el botón de llamada, la franja y las cifras desaparece del código
    Given la lista real de ficheros de "src" y su texto real, leído con "?raw" en Vitest
    When se buscan los restos de la píldora de ubicación, del botón de llamada, de la franja de horario y de la banda de cifras
    Then no existe ningún fichero cuyo nombre empiece por "Hero-logica" y la lista de ficheros que recorre la prueba de mutación no contiene ninguno
    And "Hero.tsx" no importa ni declara los identificadores "enlaceLlamada", "construirCifrasBienvenida", "FranjaHorario" ni "UBICACION", no importa ningún catálogo de servicios, de equipo ni de galería y no declara ninguna prop "telefono" ni "horario"
    And el JSX de "Hero.tsx" no declara los atributos "data-hero-ubicacion" ni "data-hero-cifras"
    And "Hero.module.scss" no declara ningún selector "ubicacion", "puntoUbicacion" ni "cifras", ninguna regla para "dl" y ninguna para "a:not(:first-child)"
    And ningún "@media" de "Hero.module.scss" menciona "cifras", "ubicacion", "puntoUbicacion" ni "dl", y la consulta "(min-width: 561px) and (max-width: 700px)" ya no existe
    And "digitosDe" y "extraerFragmento" ya no se exportan desde "datosDelSitio.ts", y sus pruebas propias se retiran con ellos porque su único consumidor era la prueba de la banda de cifras
    And el mixin "boton-fantasma" sigue teniendo al menos un consumidor fuera de "Hero.module.scss", así que la retirada del segundo botón no deja un mixin huérfano
    And el recuento de ficheros inspeccionados es mayor que 0

  # ---------------------------------------------------------------------------
  # @s4 — EL ARNÉS TERMINA EN VERDE, SIN AVISOS, INCLUIDA LA CORRIDA DE NAVEGADOR
  #
  # POR QUÉ ES UN ESCENARIO. `tsc -b` incluye los tests y `noUnusedLocals` está
  # activo: quitar props de `Hero` sin retirar a la vez los tests que las pasan, o
  # dejar un import huérfano, rompe `pnpm run build`, `bin/harness init` y el CI.
  # `oxlint --deny-warnings` convierte un aviso en error. Retirar y reescribir
  # tests tiene que ocurrir en el MISMO paso. Es la lección de la feature 39:
  # un verde parcial no es un verde.
  #
  # LA CORRIDA DE NAVEGADOR ES PARTE DEL CIERRE. `pnpm run test:e2e` es una puerta
  # SEPARADA a propósito: `harness.config.json` fija `commands.test` a Vitest y
  # `playwright.config.ts` dice que NO se referencia desde ahí; los workflows de CI
  # tampoco la ejecutan. Un verde de `bin/harness verify` NO dice nada de @s2, @s5,
  # @s6, @s7, @s9, @s10, @s11 y @s12 de este fichero, de los tres escenarios de
  # fidelidad_hero ni de accesibilidad @s22: SOLO los acredita esa corrida. La
  # feature 39 cerró con `pnpm run test:e2e` EXIT 0 y su informe lo cita; la 48
  # hace lo mismo. Y `css-presupuesto.spec.ts` (techo de 12 000 B de CSS
  # codificado) entra en esa corrida: la animación y los estilos nuevos cambian el
  # CSS servido.
  #
  # PUERTA QUE MUERDE: dejar `import { enlaceLlamada } from …` sin usar, o pasar
  # `telefono` desde un test a un `Hero` que ya no la declara, pone en rojo
  # `typecheck` y `build` con un código de salida distinto de 0. Un spec de
  # navegador que falla o se omite pone en rojo la corrida de `test:e2e`.
  #
  # NOMBRES DE LOS INFORMES, UNA SOLA CONVENCIÓN (la de CLAUDE.md, por `name`):
  # `progress/tdd_hero_reducido_con_animacion.md`,
  # `progress/judge_hero_reducido_con_animacion.md`,
  # `progress/mutation_hero_reducido_con_animacion.md` y, para el LCP,
  # `progress/lcp_hero_despues_<fecha>.md`.
  #
  # LECTURA HONESTA: este escenario NO sustituye la mutación ni la revisión del
  # `judge`; las acredita cada una con su informe (`progress/mutation_*.md`,
  # `progress/judge_*.md`), como el criterio 10 de la feature 39. Las cláusulas que
  # dicen «lo verifica el judge» son DOCUMENTALES: ninguna prueba automática puede
  # ponerlas en rojo, y por eso se declaran así en vez de fingir una puerta.
  # ---------------------------------------------------------------------------
  @s4
  Scenario: Tras la retirada lint, typecheck, build, pruebas, navegador y mutación terminan limpios
    Given el repositorio con la feature 48 aplicada, en el que "tsc -b" incluye los ficheros de prueba y están activos "noUnusedLocals" y "noUnusedParameters"
    When se ejecutan, cada una por separado y leyendo su código de salida sin tubería, "pnpm run lint", "pnpm run typecheck", "pnpm run build", "pnpm run test" y "pnpm run test:e2e" sobre el sitio construido
    Then las cinco terminan con código de salida 0
    And "pnpm run lint" informa de 0 errores y 0 avisos
    And "pnpm run typecheck" y "pnpm run build" informan de 0 errores de TypeScript
    And "pnpm run build" no emite ningún aviso de TypeScript ni de Vite
    And "pnpm run test" ejecuta más de 0 ficheros de prueba, sin ninguna prueba fallida ni omitida
    And "pnpm run test:e2e" ejecuta más de 0 tests, ninguno queda omitido ni se reintenta, y entre ellos está "css-presupuesto.spec.ts"
    And "bin/harness init" termina con código de salida 0
    And la prueba de mutación ("bin/harness mutate") termina con el 100 % sobre los mutantes NO equivalentes, con 0 mutantes en Timeout, NoCoverage o RuntimeError y sin "Hero-logica" en su superficie
    And cada mutante equivalente está justificado por escrito en "progress/mutation_hero_reducido_con_animacion.md" (lo verifica el judge)
    And el informe de cierre "progress/judge_hero_reducido_con_animacion.md" cita la salida y el código de salida de "pnpm run test:e2e", porque @s2, @s5, @s6, @s7, @s9, @s10, @s11 y @s12 de este fichero, los tres de fidelidad_hero y @s22 de accesibilidad solo los acredita esa corrida (lo verifica el judge)
    And la Decisión 31 de "project-spec.md" queda actualizada con la escala ampliada de identidad_visual @s16 (lo verifica el judge antes de aprobar)

  # ---------------------------------------------------------------------------
  # @s5 — LA ENTRADA ANIMADA, CON LOS VALORES QUE PABLO APROBÓ
  #
  # QUÉ SE FIJA (P1 + lo delegado, decisiones §4 y §5):
  #   | Parámetro   | Valor                                          | Origen          |
  #   | ----------- | ---------------------------------------------- | --------------- |
  #   | Duración    | 700 ms (0,7 s)                                 | P1              |
  #   | Retardos    | titular 0 · párrafo 120 · botón 240 ms         | P1              |
  #   | Recorrido   | 40 px horizontales, de izquierda a derecha     | P1 + delegado   |
  #   | Curva       | `ease-out`                                     | delegado        |
  #   | Propiedades | solo `opacity` y `transform`                   | delegado        |
  #
  # CÓMO SE MIDE SIN QUE DEPENDA DEL RELOJ. El reloj de animaciones del navegador
  # se CONGELA ANTES DE NAVEGAR (por ejemplo, con el protocolo de depuración del
  # navegador fijando a 0 la velocidad de reproducción), y después se colocan las
  # animaciones en el instante pedido (Web Animations: `getAnimations()` sobre el
  # documento, descartando las transiciones, que también aparecen ahí). Congelar
  # DESPUÉS de la carga llegaría tarde en una máquina lenta: la entrada dura 940 ms
  # y empieza unas decenas de milisegundos DESPUÉS de `load` (medido sobre el
  # `dist/` real con la animación simulada: el titular se monta 10-17 ms después de
  # `load` y el primer `animationstart` llega 50-90 ms después), de modo que un
  # `goto` que resuelve en `load` y un reloj congelado «después» compiten con ella; y,
  # con el relleno que exige @s5, una animación terminada desaparece de
  # `getAnimations()` y «había 3 en curso» daría 0 con el código correcto. Es
  # exactamente la intermitencia que @s10 cierra.
  # La medida es entonces de TEMPORIZACIÓN y de GEOMETRÍA, no de «lo que se vio a los
  # 300 ms». La dirección se afirma por geometría (la caja está 40 px a la izquierda
  # al empezar), no por el texto de la regla: da igual que el autor escriba
  # `translateX(-40px)` o `translate3d(-40px, 0, 0)`.
  #
  # QUÉ ES «EL INSTANTE FINAL». NO es `currentTime = endTime`. Con el modo de relleno
  # «hacia atrás» (el que hace falta para que el párrafo y el botón esperen en su
  # estado de partida durante el retardo) la animación DEJA DE APLICARSE en `endTime`
  # y se lee el estilo BASE: todas las cláusulas finales pasarían aunque los
  # fotogramas finales estuvieran mal (medido en Chromium: en `endTime` la opacidad
  # sale 1 y la caja en su sitio con unos fotogramas que acaban en `opacity: 0`; en
  # `endTime − 1 ms`, 0). El instante final es el ÚLTIMO INSTANTE DE LA FASE ACTIVA
  # (`endTime` menos 1 ms), y ADEMÁS se lee el último fotograma (offset 1) con
  # `effect.getKeyframes()`.
  #
  # TOLERANCIAS EXPLÍCITAS EN ESE INSTANTE. En `endTime − 1 ms` la curva `ease-out`
  # aún no ha llegado a 1: medido en Chromium, la opacidad sale 0,999996 y el
  # transform vale −0,000154 px. Una igualdad estricta («opacidad 1», «sin
  # desplazamiento») daría ROJO con el código correcto. Por eso en ese instante se
  # pide opacidad efectiva mayor o igual que 0,999 y desplazamiento horizontal menor
  # que 0,5 px. La EXACTITUD («1», `none` o desplazamiento 0) la fija EN EXCLUSIVA la
  # lectura del fotograma de offset 1 con `getKeyframes()`: un desplazamiento
  # residual de 0,3 px pasa la tolerancia de la caja y solo lo caza esa cláusula
  # (medido). Con un `to` implícito (solo `from` escrito, el estilo del Invariante 4)
  # `getKeyframes()` devuelve igualmente el offset 1 con opacidad `1` y transform
  # `none`: la cláusula no obliga a escribir un `to`.
  #
  # QUÉ OPACIDAD SE MIDE. La EFECTIVA: el producto de la opacidad computada del
  # elemento y la de todos sus ancestros hasta la sección de bienvenida. La opacidad
  # no se hereda en el valor computado, pero sí en lo que se ve. Si la animación
  # colgara de un contenedor del botón (hoy el botón vive dentro de un `div`), medir
  # solo el botón daría VERDE con el botón invisible y ROJO con código correcto.
  #
  # DE DÓNDE SE LEE CADA VALOR. Duración, retardo, iteraciones y `endTime`: del
  # temporizado del efecto (`getComputedTiming()`). La CURVA, NO de ahí: en una
  # animación CSS el `animation-timing-function` se aplica a CADA TRAMO entre
  # fotogramas, y el `easing` del efecto en sí es `linear`. Quien lea la curva del
  # efecto verá `linear` y se verá tentado a relajar la cláusula: se lee del valor
  # computado de `animation-timing-function` de cada elemento (o del `easing` de sus
  # fotogramas).
  #
  # POR QUÉ DURANTE EL RETARDO EL ELEMENTO YA ESTÁ EN SU ESTADO DE PARTIDA. Es la
  # consecuencia de «escalonado»: si el párrafo esperara visible 120 ms en su
  # sitio final y luego se animara, la entrada parpadearía. No sale literal de las
  # fuentes; sale de que sin esta cláusula «0/120/240» sería un efecto roto.
  #
  # EL RELLENO ES `backwards`, Y NO OTRO. Con `forwards` el párrafo sería visible
  # durante su retardo y caería la cláusula del retardo. Con `both` pasarían TODAS las
  # demás cláusulas de este escenario, de @s6, de @s7 y de accesibilidad @s22
  # (medido: instante 0, instante final y último fotograma dan las mismas cifras que con
  # `backwards`) y, sin embargo, la animación de OPACIDAD queda compuesta sobre el
  # elemento y el texto NUNCA llega a ser candidato de LCP: la medida de @s11 saldría
  # artificialmente buena (medido: ~120 ms con `both` frente a ~840-930 ms con
  # `backwards`). Por eso el relleno computado se fija aquí, con su razón.
  #
  # PUERTA QUE MUERDE (navegador real). 700 -> 1250: la duración medida falla.
  # 40 px -> 100 %: la caja del instante 0 no está a 40 px. Se anima `margin-left`,
  # `left` o `width` en vez de `transform`: la lista de propiedades deja de ser
  # {opacity, transform}. Un retardo de 150 en vez de 120: falla. Un `infinite`: el
  # número de iteraciones deja de ser 1. Un `ease` en vez de `ease-out`: falla la
  # curva. Un `will-change: transform` permanente: queda con las animaciones
  # canceladas. Unos fotogramas cuyo último fotograma deja `opacity: 0` o un
  # `transform` distinto de `none`: falla la lectura del fotograma de offset 1 (la
  # cláusula del instante final sola NO lo vería con relleno hacia atrás). `both` (o
  # `forwards`) en lugar de `backwards`: falla la cláusula del relleno computado, que
  # es la ÚNICA que lo ve, porque con `both` todo lo demás pasa.
  # ---------------------------------------------------------------------------
  @s5
  Scenario: Con movimiento permitido los tres elementos entran escalonados con los valores aprobados
    Given la portada construida y servida, en un contexto de navegador con la preferencia de movimiento declarada de forma explícita como "no-preference", nunca por omisión
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige interrogar el motor de animaciones con las hojas de estilo aplicadas
    And el reloj de animaciones del navegador se congela ANTES de navegar, de modo que las animaciones nacen detenidas en su instante 0, no pueden haber terminado cuando se miden y se colocan después en el instante pedido: la medida no depende del reloj ni de la velocidad de la máquina
    When se recogen las animaciones por fotogramas clave de la portada, sin contar las transiciones, y se leen su temporización, sus propiedades, sus fotogramas y la caja de cada elemento en el instante 0 y en el último instante de la fase activa
    Then hay exactamente 3 animaciones, una por cada uno de estos elementos, en este orden de retardo: el titular, el párrafo y el botón "Reservar cita" (o el contenedor que lo envuelve, si lo hay)
    And la duración de las tres es exactamente 700 milisegundos
    And sus retardos son exactamente 0, 120 y 240 milisegundos, en ese orden
    And las tres empiezan en el mismo instante y sus instantes de fin ("endTime") son exactamente 700, 820 y 940 milisegundos
    And la curva de las tres es exactamente "ease-out", leída del "animation-timing-function" computado de cada elemento (o del "easing" de sus fotogramas) y no del "easing" del efecto, que en una animación CSS es "linear"
    And cada una se reproduce una sola vez
    And el relleno de animación ("animation-fill-mode" computado, "fill" de su temporización) de las tres es exactamente "backwards", ni "both" ni "forwards": con relleno hacia delante la animación de opacidad queda compuesta y el texto nunca llega a ser candidato de LCP, de modo que la medida de @s11 saldría artificialmente buena
    And las únicas propiedades que animan son "opacity" y "transform"; ninguna anima ancho, alto, márgenes, posición ni relleno
    And en el instante 0 la opacidad efectiva de cada elemento es 0 y su caja está exactamente 40 píxeles a la izquierda de la que tiene con las animaciones canceladas, a la misma altura, con una tolerancia de 0,5 píxeles
    And en el último instante de la fase activa de cada una, su "endTime" menos 1 milisegundo, la opacidad efectiva de cada elemento es mayor o igual que 0,999 y su desplazamiento horizontal respecto a la caja que tiene con las animaciones canceladas es menor que 0,5 píxeles
    And el último fotograma de cada una, el fotograma cuyo offset es 1 leído con "getKeyframes()", declara con exactitud opacidad "1" y transformación "none" o un desplazamiento horizontal de 0, y esa lectura es la única que fija la exactitud
    And con las animaciones canceladas, ni un solo ancestro de esos elementos, hasta la sección de bienvenida, tiene una opacidad computada distinta de 1
    And durante su retardo el párrafo y el botón ya están en su estado de partida, con opacidad efectiva 0, sin haberse visto antes en su sitio final
    And con las animaciones canceladas, como en @s7, ninguno de los tres elementos declara "will-change" distinto de "auto"

  # ---------------------------------------------------------------------------
  # @s6 — CON MOVIMIENTO REDUCIDO, NADA SE ANIMA Y TODO SE VE DESDE EL PRIMER
  #       FOTOGRAMA
  #
  # LA PREMISA CORREGIDA. La regla global de `reduce` (`global.scss`: `*`,
  # `*::before` y `*::after` con `animation-duration: 0.01ms`) tiene ESPECIFICIDAD 0
  # y pierde ante cualquier regla del autor que declare `animation` o
  # `animation-duration`. NO es una red de seguridad. Medido en Chromium con
  # `reduce` emulado: con la animación declarada FUERA de `no-preference`, el
  # párrafo a los 815 ms está en opacidad 0,995 y siguen 2 animaciones en curso:
  # corre con su duración de 700 ms, no con la de 0,01 ms. Y la regla tampoco toca
  # `animation-delay`. La ÚNICA defensa es que `animation`, `animation-name` y los
  # retardos vivan dentro de `no-preference`: @s8 lo comprueba leyendo las hojas y
  # este escenario lo comprueba en el navegador.
  #
  # QUÉ DETECTA CADA DEFECTO (medido en Chromium, con `reduce` emulado):
  #   · Un RETARDO declarado fuera de `no-preference`, con la animación dentro: el
  #     primer fotograma sale con opacidad 1 y nombre de animación `none`, pero el
  #     retardo computado vale 0,12 s. Es INOCUO visualmente y se detecta por el
  #     retardo computado distinto de 0 s.
  #   · La ANIMACIÓN (y sus fotogramas) fuera de `no-preference`: el nombre de
  #     animación computado deja de ser `none`, la animación corre y el primer
  #     fotograma del párrafo y del botón sale con opacidad 0.
  #   · Una opacidad 0 en el estado base: el primer fotograma sale a 0.
  #
  # CÓMO SE OBSERVA «EL PRIMER FOTOGRAMA». Un observador instalado antes de que la
  # página cargue (`addInitScript`) anota cada fotograma pintado de la sección.
  # Medir después de un `waitForLoadState` llegaría tarde y vería ya el estado
  # final.
  #
  # QUÉ OPACIDAD SE MIDE: la EFECTIVA (producto de la del elemento y la de sus
  # ancestros hasta la sección). Medir solo el elemento daría verde con un
  # contenedor a `opacity: 0` (ver @s5).
  #
  # PUERTA QUE MUERDE (navegador real). Fotogramas o animación declarados fuera de
  # `no-preference`: bajo `reduce` el nombre de animación computado deja de ser
  # `none` y el primer fotograma sale con opacidad 0. Retardo declarado fuera: el
  # retardo computado deja de ser 0 s. Opacidad 0 en el estado base o en un
  # contenedor: falla el primer fotograma. Y el último Then impide que todo esto se
  # cumpla porque la consulta esté muerta.
  # ---------------------------------------------------------------------------
  @s6
  Scenario: Con movimiento reducido no se anima nada y los tres elementos se ven desde el primer fotograma
    Given la portada construida y servida, en un contexto de navegador con "prefers-reduced-motion: reduce" emulado antes de navegar
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige el primer fotograma pintado y el valor computado de propiedades que la regla global de movimiento reducido no anula
    And un observador instalado antes de que cargue la página anota cada fotograma pintado de la sección de bienvenida, desde el primero
    When se carga la portada
    Then en ninguno de los fotogramas anotados existe una animación por fotogramas clave en curso
    And en el primer fotograma anotado la opacidad efectiva del titular, del párrafo y del botón es 1, ningún ancestro de ellos hasta la sección tiene una opacidad computada distinta de 1, y sus cajas coinciden con las que tienen 2 segundos después, con una tolerancia de 0,5 píxeles
    And el nombre de animación computado de los tres es "none"
    And el retardo de animación computado de los tres es exactamente 0 s
    And el recuento de fotogramas anotados es mayor que 0
    And la misma carga con "no-preference" y con el reloj de animaciones congelado antes de navegar, como en @s5, encuentra las 3 animaciones de @s5, lo que demuestra que la consulta discrimina de verdad y no está muerta

  # ---------------------------------------------------------------------------
  # @s7 — SI LA ANIMACIÓN NO CORRE, EL CONTENIDO SE VE: EL ESTADO BASE ES EL
  #       ESTADO FINAL
  #
  # LA REGLA es el Invariante 4 de `project-spec.md` (`estado-base-visible`): el
  # estado base en CSS es el estado final visible, y el estado oculto vive solo
  # dentro de la animación. Es lo que protege a quien no ejecuta la animación
  # por cualquier motivo: un navegador que no entiende la consulta, un fallo al
  # cargar la hoja, una extensión que corta animaciones.
  #
  # POR QUÉ SE MIDE CANCELANDO. `Animation.cancel()` devuelve cada elemento a lo
  # que dice su hoja FUERA de la animación. Si el estado base fuera `opacity: 0`
  # (el patrón clásico: ocultar en CSS y revelar con la animación), cancelar la
  # deja a 0 y el escenario falla. No depende de cómo escriba el autor sus
  # reglas, y es una medida de navegador, no una lectura de texto. La lectura del
  # texto de las hojas (estado base sin `opacity: 0` ni `visibility: hidden`
  # fuera de un `@keyframes`) vive en accesibilidad @s20.
  #
  # POR QUÉ SE COMPARA CON EL ÚLTIMO INSTANTE ACTIVO Y NO CON `endTime`. Con
  # relleno hacia atrás, en `endTime` la animación ya no se aplica y se lee el
  # estado base: comparar la base con `endTime` es comparar la base consigo misma.
  # La caja de referencia se toma ANTES de cancelar, colocando cada animación en
  # `endTime − 1 ms` (ver @s5).
  #
  # PUERTA QUE MUERDE: `opacity: 0` o `visibility: hidden` en el estado base del
  # titular, del párrafo o del botón o de un contenedor suyo; o un `transform:
  # translateX(-40px)` en el estado base en lugar de dentro de los fotogramas.
  # ---------------------------------------------------------------------------
  @s7
  Scenario: Si la animación no se ejecuta, el titular, el párrafo y el botón quedan visibles en su sitio
    Given la portada construida y servida, con la preferencia de movimiento declarada de forma explícita como "no-preference"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md
    And el reloj de animaciones del navegador se congela ANTES de navegar, como en @s5, para que las animaciones no hayan podido terminar antes de cancelarlas
    And la caja de cada uno de los tres elementos se toma con su animación colocada en el último instante de su fase activa, su "endTime" menos 1 milisegundo
    When se cancelan todas las animaciones por fotogramas clave de la portada
    Then el titular, el párrafo y el botón tienen opacidad efectiva 1, visibilidad computada "visible" y transformación computada "none"
    And ni un solo ancestro de ellos, hasta la sección de bienvenida, tiene una opacidad computada distinta de 1
    And la caja de cada uno coincide con la que se tomó en el último instante de su fase activa, con una tolerancia de 0,5 píxeles
    And ninguno está oculto para el árbol de accesibilidad ni fuera de la pantalla
    And el recuento de elementos comprobados es exactamente 3
    And antes de cancelar había exactamente 3 animaciones en curso, para que cancelar «nada» no cumpla el escenario en silencio

  # ---------------------------------------------------------------------------
  # @s8 — LAS DECLARACIONES DE ENTRADA SOLO EXISTEN DENTRO DE `no-preference`
  #
  # QUÉ AÑADE A `sistema_de_diseno_visual.feature` @s33 (que NO se toca). @s33 exige
  # que toda línea `animation*`/`transition*` esté dentro de `no-preference` O de
  # `reduce`, porque dentro de `reduce` asume que la regla existe para anular la
  # duración. Eso es lo contrario de lo que hace falta aquí: dentro de `reduce` un
  # retardo, un nombre de animación o unos fotogramas son PELIGRO, no anulación (ver
  # @s6). Y `@keyframes` no empieza por `animation` ni por `transition`, así que
  # @s33 no los ve.
  #
  # LA REGLA, sin contradicción interna. Lo que ponga algo en movimiento o lo
  # retarde (`animation` con un nombre de fotogramas, `animation-name`,
  # `animation-delay`) vive SOLO dentro de `no-preference`; ni en la raíz del fichero
  # ni dentro de `reduce` ni dentro de otra consulta. Dentro de `reduce` la ÚNICA
  # anulación admitida es `animation: none`; `animation-name: none` y
  # `animation-delay: 0s` allí también incumplen, para que la regla sea una sola y
  # comprobable. `@keyframes` no se admite dentro de `reduce` ni de otra consulta; en
  # la raíz del fichero se admite SIN CONDICIÓN, porque unos fotogramas solos no
  # mueven nada y lo que mueve es la declaración que los usa, que ya la rige la regla
  # de arriba (una condición «mientras nadie fuera de `no-preference` los use» sería
  # lógicamente redundante y dejaría un mutante equivalente sin justificar). La regla
  # global de `reduce` (`animation-duration: 0.01ms`, `animation-iteration-count: 1`)
  # no se señala. `animation: none` (sin nombre de fotogramas) no mueve nada: pasa en
  # la raíz del fichero y en cualquier consulta.
  #
  # A QUÉ SE APLICAN LAS CONDICIONES «MAYOR QUE 0». El recuento de `@keyframes` y el
  # de declaraciones de animación dentro de `no-preference` son una guarda
  # anti-vacuidad sobre el CONJUNTO de las 20 hojas reales: que la puerta haya
  # encontrado algo que comprobar. NO se aplican al veredicto de cada hoja sintética
  # de la tabla: «pasa» e «incumple» son veredictos de la regla SIN esa guarda. (Medido:
  # con la guarda aplicada por hoja, cinco filas cambiarían de veredicto y las de
  # `@keyframes` incumplirían por vacuidad y no por mirar los fotogramas.) Por eso las
  # dos filas de `@keyframes` que dicen «incumple» llevan además, en su hoja
  # sintética, una animación legítima dentro de `no-preference`: dan veredicto por lo
  # que dicen.
  #
  # EL INVENTARIO, FIJADO, Y CÓMO CONVIVE CON LOS QUE YA EXISTEN. 20 ficheros de
  # estilos: los 3 de `src/styles/*.scss` (`_api.scss`, `_tokens.scss`,
  # `global.scss`), los 12 de `src/components/*.module.scss` y los 5 de
  # `src/pages/*.module.scss`. Es una invocación PROPIA de la puerta: SE AÑADE a los
  # catálogos existentes, no los sustituye ni los amplía. `movimientoRespetuoso.test.ts`
  # sigue leyendo sus 17 módulos y `inventarioModulos.test.ts` conserva el glob de 17
  # que exigen @s24 y @s51 de identidad_visual, cuya identidad de recuentos se
  # rompería si se mezclaran; `movimiento-global.test.ts` sigue pasando las 3 hojas
  # globales (`global.scss`, `_api.scss`, `_tokens.scss`) por la puerta @s33. Lo que
  # esta puerta añade sobre `src/styles/`: @s33 solo mira que la declaración esté
  # dentro de ALGUNA consulta de movimiento, y dentro de `reduce` da por buena
  # cualquiera, así que un mixin de ENTRADA (nombre de fotogramas o retardo) escrito
  # en `_api.scss` dentro de `reduce` pasaría @s33; esta regla lo señala. Hoy
  # `_api.scss` declara 4 `transition`, entre ellas la del mixin `boton-primario`, que
  # usa el botón del hero.
  #
  # TRES TRAMPAS DE LA LECTURA LÍNEA A LÍNEA, medidas leyendo la puerta existente:
  #   · Un bloque que abre y cierra en la MISMA línea (`from { opacity: 0; }`)
  #     suma una llave abierta y no resta nada: la pila queda desordenada y el
  #     bloque `no-preference` sigue «abierto» tras su cierre real, de modo que una
  #     animación escrita DESPUÉS, fuera de él, se da por cubierta. Falso verde.
  #   · `reduce` no puede cubrir fotogramas, nombres ni retardos (ver arriba).
  #   · Que no exista ninguna declaración de animación no puede dar «pasa» por
  #     vacuidad: ver la guarda sobre el conjunto de las 20 hojas.
  #
  # PUERTA QUE MUERDE: la tabla de abajo es la lista de mutaciones, una fila por
  # propiedad y lugar. Cada fila que dice «incumple» es una mutación que el módulo
  # debe ver; las que dicen «pasa» impiden que la puerta se vuelva paranoica y
  # señale lo legítimo.
  # ---------------------------------------------------------------------------
  @s8
  Scenario: Las declaraciones de animación del hero solo existen dentro de "no-preference"
    Given el texto real de los 20 ficheros de estilos del inventario —los 3 de "src/styles", los 12 de "src/components" y los 5 de "src/pages"—, leído con "?raw" en Vitest
    And esta verificación se ejecuta como MÓDULO PURO en Vitest, mordible por StrykerJS, siguiendo la profundidad de bloques como la puerta de movimiento ya existente
    And el catálogo de 20 es una invocación propia que se añade a los de 17 módulos y de 3 hojas globales ya existentes, sin ampliar el glob de los 17 ni tocar sus recuentos
    When se busca cada "@keyframes" y cada declaración "animation", "animation-name" y "animation-delay"
    Then el recuento de ficheros leídos es exactamente 20
    And toda declaración "animation" con un nombre de fotogramas, "animation-name" o "animation-delay" está dentro de un bloque "@media (prefers-reduced-motion: no-preference)", y ninguna está en la raíz del fichero ni dentro de "reduce" ni dentro de otra consulta de medios
    And dentro de un bloque "reduce" la única anulación admitida es "animation: none"
    And ningún "@keyframes" está dentro de "reduce" ni de otra consulta de medios, y uno en la raíz del fichero se admite sin condición
    And la regla global de "reduce" ("animation-duration: 0.01ms" y "animation-iteration-count: 1") no se señala
    And sobre el conjunto de las 20 hojas reales, el recuento de "@keyframes" encontrados es mayor que 0 y el de declaraciones de animación dentro de "no-preference" también, y esas dos guardas no se aplican al veredicto de cada hoja sintética de la tabla
    And el veredicto de la regla, sin esas guardas, sobre cada hoja sintética es el de la tabla:
      | hoja sintética                                                                                                                                                  | veredicto |
      | "animation" con un nombre de fotogramas, dentro de "no-preference"                                                                                              | pasa      |
      | "animation-name" dentro de "no-preference"                                                                                                                      | pasa      |
      | "animation-delay: 120ms" dentro de "no-preference"                                                                                                              | pasa      |
      | "@keyframes" y su "animation", ambos dentro de "no-preference"                                                                                                  | pasa      |
      | "@keyframes" en la raíz del fichero y su "animation" dentro de "no-preference"                                                                                  | pasa      |
      | "animation" con un nombre de fotogramas, en la raíz del fichero                                                                                                 | incumple  |
      | "animation-name" en la raíz del fichero                                                                                                                         | incumple  |
      | "animation-delay: 120ms" en la raíz del fichero                                                                                                                 | incumple  |
      | "animation: none" en la raíz del fichero                                                                                                                        | pasa      |
      | "animation" con un nombre de fotogramas, dentro de "reduce"                                                                                                     | incumple  |
      | "animation-name" con un nombre de fotogramas, dentro de "reduce"                                                                                                | incumple  |
      | "animation-name: none" dentro de "reduce"                                                                                                                       | incumple  |
      | "animation-delay: 0s" dentro de "reduce"                                                                                                                        | incumple  |
      | "animation: none" dentro de "reduce"                                                                                                                            | pasa      |
      | "animation-duration: 0.01ms" y "animation-iteration-count: 1" dentro de "reduce", como la regla global                                                          | pasa      |
      | "animation" con un nombre de fotogramas, dentro de "@media (max-width: 560px)"                                                                                  | incumple  |
      | "animation-name" con un nombre de fotogramas, dentro de "@media (max-width: 560px)"                                                                             | incumple  |
      | "animation-delay: 120ms" dentro de "@media (max-width: 560px)"                                                                                                  | incumple  |
      | "@keyframes" dentro de "reduce", en una hoja que además lleva una animación legítima con sus fotogramas dentro de "no-preference"                               | incumple  |
      | "@keyframes" dentro de "@media (max-width: 560px)", en una hoja que además lleva una animación legítima con sus fotogramas dentro de "no-preference"          | incumple  |
      | fotogramas con sus bloques "from" y "to" escritos cada uno en una sola línea, dentro de "no-preference"                                                         | pasa      |
      | lo anterior, seguido de una "animation" con un nombre de fotogramas escrita DESPUÉS del cierre de "no-preference", en la raíz                                   | incumple  |

  # ---------------------------------------------------------------------------
  # @s9 — LA ENTRADA NO MUEVE EL RESTO DE LA PÁGINA NI CREA UNA BARRA HORIZONTAL
  #
  # QUÉ ES ESTE ESCENARIO, SIN MAQUILLAJE. Es una ANTIRREGRESIÓN GLOBAL («sin
  # barra horizontal y CLS <= 0,1»), no el detector de ninguna mutación única
  # conocida. Medido sobre una réplica sintética del hero (el real aún no tiene
  # animación), en Chromium:
  #   · Quitar `overflow: hidden` NO crea barra con una entrada desde la izquierda: la
  #     región desbordada hacia la izquierda es inalcanzable (CSS Overflow 3 §2.3;
  #     `scrollWidth` 320 = ancho de la ventana con el titular en x = −8 a 320 px).
  #     Un recorrido hacia la DERECHA sin recorte sí la crearía.
  #   · Animar `margin-left` o `left` da CLS 0 y no mueve la sección de debajo: esas
  #     mutaciones las caza la lista de propiedades de @s5, NO este escenario.
  #   · Con el hero con un alto mínimo de pantalla completa en todos los anchos
  #     (@s12) su alto ya no depende del contenido en los tamaños habituales, así que
  #     alterar desde dentro las cajas posteriores es todavía más difícil: este
  #     escenario queda como RED DE SEGURIDAD general.
  # Se mide a 320, 375 y 1440 px.
  #
  # CÓMO SE LEE EL CLS. NO basta «load + 940 ms + un fotograma»: medido sobre el
  # `dist/` real con la animación simulada, el titular se monta 10-17 ms DESPUÉS de
  # `load`, la entrada empieza 50-90 ms después de `load` y el tercer `animationend`
  # llega a `load` + 980-1015 ms; una lectura a `load` + 956 ms cae ANTES del fin en
  # 16 de 16 cargas, y un salto de maquetación que ocurriera al terminar la entrada
  # se perdería. Para la PORTADA la lectura se ancla en el registro de @s10 (los tres
  # `animationend` y un fotograma más) o espera como mínimo 1500 ms tras `load` (el
  # método de la línea base de LCP). La espera FIJA de 1500 ms tras `load` y un
  # fotograma queda para las cinco rutas SIN hero, donde no hay titular al que
  # anclarse y el helper anclado de @s10 no sirve. NO «cuando no quede ninguna
  # animación en curso»: esa espera sin ancla devuelve vacía (medido: 14 ms con el
  # hero aún sin montar, y un 0 leído entonces es un 0 por vacuidad).
  #
  # RELACIÓN CON identidad_visual @s30 (que NO se toca). @s30 lee el CLS justo tras
  # el evento `load`, NO tras los 940 ms de la entrada, y con el valor por defecto
  # del navegador; no «ya vigila la entrada». Este escenario lee con «no-preference»
  # explícito y después de la entrada. No es un detector de la animación: no
  # distingue una animación sana de una enferma por sí solo.
  #
  # PUERTA QUE MUERDE (la que hay, sin inflarla): un recorrido hacia la derecha sin
  # recorte que desborde el ancho de la ventana; una animación que altere las cajas
  # de las secciones posteriores o el alto del hero entre el instante 0, la mitad y
  # el último instante activo; y un CLS que suba por encima de 0,1 al terminar la
  # entrada. NO hay una mutación única conocida sobre el hero propio que ponga este
  # escenario en rojo; no se presenta como si la hubiera.
  # ---------------------------------------------------------------------------
  @s9
  Scenario: Durante la entrada no hay barra horizontal, el resto de la página no se mueve y el CLS no sube
    Given la portada construida y servida, con la preferencia de movimiento declarada de forma explícita como "no-preference"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md
    And el reloj de animaciones del navegador congelado ANTES de navegar, como en @s5, y las animaciones de la portada colocadas en el instante 0, en la mitad de la duración de cada una y en el último instante de su fase activa, su "endTime" menos 1 milisegundo
    When se mide, en cada uno de esos tres instantes y a 320, 375 y 1440 píxeles de ancho, el desbordamiento horizontal del documento, el alto del hero y la caja de cada elemento de las secciones posteriores al hero
    Then el ancho del contenido desplazable del documento no supera el ancho de la ventana en ninguno de los nueve casos
    And el alto del hero y la caja de cada elemento de las secciones posteriores son idénticos en los tres instantes, con una tolerancia de 0,5 píxeles
    And el hero no recorta contenido verticalmente en ninguno de los nueve casos
    And sin congelar el reloj en esta cláusula, el desplazamiento acumulado del contenido de la portada, cargada con "no-preference" explícito y leído cuando el registro de "esperarEntradaTerminada" muestra los tres "animationend" más un fotograma, o como mínimo 1500 milisegundos después de "load", es menor o igual que 0.1
    And sin congelar el reloj en esta cláusula, el desplazamiento acumulado del contenido de cada una de las 5 rutas sin hero, leído 1500 milisegundos después de "load" y un fotograma más, es menor o igual que 0.1
    And el recuento de rutas medidas es exactamente 6 y el de instantes medidos por ancho es exactamente 3

  # ---------------------------------------------------------------------------
  # @s10 — LAS MEDICIONES DE LA PORTADA NO CORREN CONTRA UNA ANIMACIÓN EN CURSO
  #
  # EL RIESGO, escrito en las decisiones (§8) y en la nota de `feature_list.json`:
  # varios specs miden la portada recién cargada SIN emular `reduce`. Con la
  # entrada animada, la primera medición cae dentro de los 940 ms de animación:
  #   · el barrido de `fidelidad_responsive_integral` @s6 cuenta como fuera de la
  #     ventana un titular que parte 40 px a la izquierda;
  #   · axe puede calcular el contraste con la opacidad efectiva a media entrada
  #     (hipótesis de la investigación, sin fuente oficial leída: por eso se
  #     cierra por construcción y no se confía en que no pase);
  #   · `fidelidad-hero.spec.ts` mide cajas que se están moviendo.
  # Sin una regla, la suite se vuelve intermitente: verde unas veces y roja otras,
  # según la máquina. Lo que este proyecto ya sabe de las puertas intermitentes es
  # que acaban desactivándose.
  #
  # LA REGLA, CON GRANULARIDAD POR TEST. Un test que mide la portada recién cargada
  # hace UNA de dos cosas, antes de su PRIMERA medición:
  #   (a) llama a UN helper único, `esperarEntradaTerminada`, ANCLADO. Puede vivir
  #       en una función local del mismo fichero que contiene el `goto`
  #       (`cargarPortada()` en `fidelidad-hero.spec.ts` y en
  #       `fidelidad-responsive-integral.spec.ts`), siempre que el test la llame.
  #       El registro de arranque y fin de las animaciones (`animationstart` y
  #       `animationend`) se instala con `page.addInitScript` ANTES del `goto`: o con
  #       una API de DOS FASES, o con el `goto` dentro del helper. Un listener
  #       instalado después compite con `load` (en una página SINTÉTICA que monta el
  #       hero en un script al cargar, 2-9 ms de margen; en la app real el titular
  #       se monta 10-17 ms después de `load`). La espera lee ESE registro y NO
  #       `document.getAnimations()`: con relleno hacia atrás una animación terminada
  #       desaparece de `getAnimations()`, y «había 3» daría 0 en una máquina lenta con
  #       el código correcto. Primero espera a que exista el titular y a que el
  #       registro muestre el arranque de las tres, y SOLO después el fin de las
  #       tres. Con un tope: si vence, el test FALLA y no mide;
  #   (b) o emula `reduce` antes de esa primera medición y con efecto sobre la carga
  #       medida (`emulateMedia` antes del `goto`; si el test navega varias veces,
  #       antes del bucle).
  # Las dos vías miden el MISMO estado final (@s5 y @s7 afirman que la entrada
  # termina en el estado base). Cada test declara cuál usa.
  #
  # EL REGISTRO SE INSTALA EN TODA PÁGINA ABIERTA. También en la que se abre con
  # `context.newPage()` o se cubre con `context.addInitScript`: `tipografia.spec.ts`
  # @s23 abre una segunda página con `context.newPage()` y mide el titular en ella.
  #
  # QUÉ CUENTA COMO «MEDIR». Lista CERRADA de llamadas: `getBoundingClientRect`,
  # `boundingBox`, `scrollWidth`, `scrollHeight`, `clientHeight`, `offsetWidth`,
  # `offsetHeight`, `AxeBuilder`, `getComputedStyle` leyendo posición, opacidad,
  # transform o color, las lecturas de contraste y de foco, y las capturas de píxeles
  # (`page.screenshot`, `locator.screenshot`, `toHaveScreenshot`). La feature 49
  # delega en este escenario sus capturas, que incluyen el hero. «Medir» alcanza
  # también a la llamada a una función LOCAL del mismo fichero cuyo cuerpo contenga
  # una llamada de la lista (resolución de UN nivel, la misma regla que se admite
  # para `cargarPortada`): en `fidelidad-hero.spec.ts` la medición vive en `cajaDe()`,
  # fuera de todo `test(`. La comprobación estática exige que la espera PRECEDA
  # TEXTUALMENTE a la primera medición. Mover la espera DESPUÉS de la primera
  # medición, que es la forma típica de vaciar la puerta, la pone en rojo.
  #
  # A QUÉ TESTS ALCANZA LA OBLIGACIÓN, decidido por TEXTO. Sin acotarla, la lista
  # de llamadas aparece en 20 de los 27 ficheros de `tests/e2e` y la obligación
  # alcanzaría a casi todos, pidiéndoles una espera que no necesitan. Se acota a las
  # mediciones cuyo receptor es del hero o de la página entera: (i) un localizador o
  # selector que contiene `[data-hero-`, `h1`, `heading` de nivel 1 o el texto «Reservar
  # cita»; (ii) `AxeBuilder` sin `.include(`, `'body *'`, o una captura de píxeles de
  # la página. Quedan FUERA los tests que solo miden estilos tipográficos (`font-size`,
  # `letter-spacing`, `line-height`) y las lecturas de `document.documentElement.
  # scrollWidth`: un recorrido hacia la izquierda no puede cambiarlo (medido) y @s9 lo
  # mide precisamente durante la entrada. Contado el 13/10/2026, la obligación alcanza
  # HOY a 4 de los 27 ficheros: `fidelidad-hero`, `fidelidad-responsive-integral`,
  # `tipografia` y `accesibilidad`. Es lo que deja de mínimo la lista nombrada en el
  # Given; las pruebas nuevas de la 49 suman las suyas. Si se prefiriera incluir
  # también `documentElement.scrollWidth`, alcanzaría a 20 de 27.
  #
  # POR QUÉ POR TEST Y NO POR FICHERO. Un grep del fichero entero es VACUO:
  # `accesibilidad.spec.ts` ya emula `reduce` en dos de sus tests (@s40 y @s45) y no
  # en los que miden la portada recién cargada (@s36, @s37, @s38 y @s39); un grep
  # por fichero da verde con esos cuatro midiendo una página en movimiento.
  #
  # BUCLES POR RUTAS. `accesibilidad.spec.ts` (@s36-@s39) recorre
  # `RUTAS_DEL_INVENTARIO` con un `goto` por ruta dentro de UN test, y cinco de las
  # seis rutas no tienen hero: NO se exige el helper anclado donde no hay titular. Se
  # resuelve por la vía (b), con `emulateMedia` antes del bucle, o con el helper solo
  # en la iteración de la portada.
  #
  # A REORDENAR. `accesibilidad.spec.ts` @s45 hace `goto` y DESPUÉS `emulateMedia`: hay
  # que emular ANTES del `goto`.
  #
  # CÓMO SE DESCUBREN: por CRITERIO, no por lista escrita a mano. La lista nombrada
  # es un MÍNIMO («al menos»); la comprobación estática recorre todos los `test(` de
  # `tests/e2e`.
  #
  # EXCEPCIONES. Son PASOS del Given y no una nota, para que la comprobación
  # estática las reconozca por un criterio objetivo:
  #   1. «Congela el reloj antes de navegar Y asigna `currentTime` a las animaciones
  #      (o las cancela) antes de su primera medición», con precedencia textual: los
  #      bloques de @s5, @s7, @s9 y @s12 de este fichero y de accesibilidad @s19 y
  #      @s22. No pueden esperar a que la animación termine, porque nunca termina. El
  #      reloj congelado SIN colocar nada mide el estado inicial (opacidad 0, caja a
  #      −40 px: medido), y por eso la colocación se exige.
  #   2. @s6 pertenece a la vía (b) (emula `reduce`); @s11 mide el LCP en carga fresca
  #      y sin usar el helper, a propósito.
  #   3. @s4, @s5, @s8 y @s22 de `cabecera_sobre_el_hero.feature`, EXPRESAMENTE y por
  #      etiqueta. Son registradores de primer fotograma de la cabecera, instalados
  #      con `addInitScript` ANTES del `goto`, que observan el estado y el alfa de la
  #      cabecera fotograma a fotograma bajo `no-preference` y, por construcción, no
  #      pueden esperar a que termine la entrada del hero. Su registrador NO es una
  #      «medición del hero». CONDICIÓN: el registrador de fotogramas vive en una
  #      utilidad compartida de `tests/e2e`, FUERA del bloque `test(`, y el spec llama
  #      a `esperarEntradaTerminada(page)` DESPUÉS del primer fotograma y ANTES de su
  #      primera medición de geometría del hero, si la hace.
  #   4. @s14 y @s16 de `cabecera_sobre_el_hero.feature` (miden cajas y el hover) NO se
  #      exceptúan: la regla de este escenario se les aplica con normalidad.
  #
  # LA COMPROBACIÓN ESTÁTICA TIENE SU PROPIA PUERTA. Con lo escrito hasta aquí, un
  # comprobador que aceptara todo, o que solo mirara los bloques reales (hoy
  # correctos), cumpliría el escenario: el recuento de bloques es la única guarda. La
  # tabla de abajo la obliga a poder ponerse en rojo. La comprobación es un MÓDULO
  # PURO mordible por StrykerJS; si viviera dentro de `tests/e2e`, el judge ejecutaría
  # a mano cada sabotaje de la tabla (lo verifica el judge).
  #
  # EL HELPER SE PRUEBA AISLADO, con CUATRO páginas sintéticas, y cada mutante lo mata
  # una distinta. Todas usan `animation-fill-mode: backwards` y retardos 0, 120 y
  # 240 ms con duraciones tales que el fin de la primera es anterior al de la última
  # (con tres animaciones iguales «espera una sola» sobrevivía); al volver, el test del
  # helper afirma «titular presente y tres `animationend` registrados»:
  #   · animación de 30 s presente al cargar: el helper falla por el tope. Mata el
  #     mutante «tope inexistente» y NADA MÁS: un helper sin ancla también falla aquí
  #     (medido);
  #   · hero que se monta un segundo o más DESPUÉS de `load`, con animaciones cortas:
  #     el helper no devuelve antes de que exista el titular y hayan terminado las
  #     tres. Mata el mutante «sin ancla», que devuelve a los ~14 ms sin titular
  #     (medido), y «espera el fin de una sola»;
  #   · hero que nunca se monta: el helper falla por el tope;
  #   · animaciones que YA terminaron cuando se llama al helper: debe DEVOLVER, no
  #     fallar. Mata el mutante «lee `document.getAnimations()` en vez del registro»
  #     (con relleno `backwards`; con `both` sobreviviría, y por eso el relleno se
  #     fija).
  # No se ejecuta ningún spec «contra una portada alargada»: esa meta-ejecución se
  # retiró.
  #
  # PUERTA QUE MUERDE. Un test de la lista que mida la portada sin ninguna de las
  # dos vías, o que mida antes de esperar: la comprobación estática de su bloque
  # `test(` lo señala, y la tabla lo demuestra. Cada mutante del helper, en la página
  # que se acaba de decir.
  # ---------------------------------------------------------------------------
  @s10
  Scenario: Todo test que mide la portada recién cargada lo hace con la entrada ya terminada o con movimiento reducido emulado
    Given todo "test(" de "tests/e2e" que mide una carga de la portada con una llamada de la lista cerrada de más abajo sobre un elemento del hero o sobre la página entera, directamente o por una función local del mismo fichero que el test llama
    And la lista cerrada de llamadas que cuentan como medir es: "getBoundingClientRect", "boundingBox", "scrollWidth", "scrollHeight", "clientHeight", "offsetWidth", "offsetHeight", "AxeBuilder", "getComputedStyle" leyendo posición, opacidad, transform o color, las lecturas de contraste y de foco, "page.screenshot", "locator.screenshot" y "toHaveScreenshot"
    And un elemento del hero es todo localizador o selector que contiene "[data-hero-", "h1", un encabezado de nivel 1 o el texto "Reservar cita", y la página entera es "AxeBuilder" sin ".include(", "body *" o una captura de píxeles de la página
    And quedan fuera de la obligación los tests que solo miden estilos tipográficos del titular ("font-size", "letter-spacing", "line-height") y las lecturas de "document.documentElement.scrollWidth", que un recorrido hacia la izquierda no puede cambiar y que @s9 mide durante la entrada
    And se exceptúan los bloques que congelan el reloj de animaciones antes de navegar Y asignan "currentTime" a las animaciones, o las cancelan, antes de su primera medición, con precedencia textual —@s5, @s7, @s9 y @s12 de este fichero y accesibilidad @s19 y @s22—, que la comprobación estática reconoce por ese criterio objetivo, y el de @s11, que mide el LCP en carga fresca sin usar "esperarEntradaTerminada"
    And se exceptúan además, expresamente y por etiqueta, @s4, @s5, @s8 y @s22 de "cabecera_sobre_el_hero.feature": son registradores de primer fotograma de la cabecera, instalados con "addInitScript" antes del "goto", que observan el estado y el alfa de la cabecera fotograma a fotograma bajo "no-preference" y por construcción no pueden esperar a que termine la entrada del hero, y su registrador no es una medición del hero; con la condición de que el registrador de fotogramas viva en una utilidad compartida de "tests/e2e" fuera del bloque "test(" y de que el spec llame a "esperarEntradaTerminada(page)" después del primer fotograma y antes de su primera medición de geometría del hero, si la hace
    And @s14 y @s16 de "cabecera_sobre_el_hero.feature", que miden cajas y el hover, no se exceptúan: la regla se les aplica con normalidad
    And la lista mínima de ficheros alcanzados es "fidelidad-hero", "fidelidad-responsive-integral", "tipografia" y "accesibilidad", «al menos» esos y nunca solo esos: contados el 13/10/2026, la obligación alcanza a 4 de los 27 ficheros de "tests/e2e"
    And la entrada completa del hero dura como máximo 940 milisegundos
    When se lee el texto de cada bloque "test(" de "tests/e2e" y se ejecuta el helper "esperarEntradaTerminada" aislado contra cuatro páginas sintéticas, todas con "animation-fill-mode: backwards" y retardos de 0, 120 y 240 milisegundos con el fin de la primera anterior al de la última: una con una animación de 30 segundos, una con el hero montado un segundo o más después de "load" y animaciones cortas, una en la que el hero nunca se monta y una en la que las animaciones ya terminaron al llamar al helper
    Then cada uno de esos bloques llama al helper "esperarEntradaTerminada", directamente o por una función local del mismo fichero que contiene el "goto", antes de su primera medición, o emula movimiento reducido antes de esa medición y con efecto sobre la carga medida
    And el registro de arranque y fin de las animaciones ("animationstart" y "animationend") se instala con "page.addInitScript" antes del "goto", con una API de dos fases o con el "goto" dentro del helper, también en toda página abierta con "context.newPage()" o cubierta con "context.addInitScript", y la espera lee ese registro y no "document.getAnimations()"
    And el helper espera primero a que exista el titular y a que el registro muestre el arranque de las tres animaciones, y solo después a que muestre el fin de las tres
    And el helper tiene un tope y, si vence con animaciones aún en curso, el test falla en vez de medir
    And con la página de 30 segundos el helper falla por el tope
    And con la página cuyo hero se monta un segundo o más después de "load", el helper no devuelve antes de que exista el titular y hayan terminado las tres animaciones, y al volver el titular está presente y hay tres "animationend" registrados
    And con la página en la que el hero nunca se monta, el helper falla por el tope
    And con la página en la que las animaciones ya terminaron al llamar al helper, este devuelve, con el titular presente y tres "animationend" registrados
    And cada mutante del helper muere con la página que se dijo: «tope inexistente» con la de 30 segundos, «sin ancla» y «espera una sola» con la de montaje tardío, «lee getAnimations()» con la de las ya terminadas (lo verifica el judge, con el sabotaje de cada mutante ejecutado a mano)
    And ningún test de la lista mide con una animación por fotogramas clave en curso y pasa (lo verifica el judge)
    And el veredicto de la comprobación estática sobre cada uno de estos bloques "test(" sintéticos es el de la tabla:
      | bloque "test(" sintético                                                                                                          | veredicto |
      | mide con "getBoundingClientRect" sobre el titular antes de llamar al helper                                                       | incumple  |
      | llama al helper después de su primera medición                                                                                     | incumple  |
      | emula "reduce" con "emulateMedia" después del "goto" y mide el titular                                                             | incumple  |
      | llama al helper y después mide el titular                                                                                          | pasa      |
      | llama a una función local "cargarPortada()" del mismo fichero, que contiene el "goto" y el helper, y después mide el titular       | pasa      |
      | mide el titular por una función local del mismo fichero cuyo cuerpo contiene "getBoundingClientRect", sin esperar antes            | incumple  |
      | emula "reduce" antes del "goto" y mide el titular                                                                                  | pasa      |
      | recorre las rutas del inventario con "emulateMedia" antes del bucle y mide con "AxeBuilder" sin ".include("                        | pasa      |
      | mide con "AxeBuilder" sin ".include(" sin ninguna de las dos vías                                                                  | incumple  |
      | hace una captura de píxeles de la página sin ninguna de las dos vías                                                               | incumple  |
      | solo mide "font-size" del titular                                                                                                  | exento    |
      | solo lee "document.documentElement.scrollWidth"                                                                                    | exento    |
      | mide con "getBoundingClientRect" una sección que no es del hero, sin esperar                                                       | exento    |
      | congela el reloj antes de navegar, coloca "currentTime" y después mide el titular                                                  | exento    |
      | congela el reloj antes de navegar y mide el titular SIN colocar ni cancelar las animaciones                                        | incumple  |
      | no emula "reduce" ni llama al helper y mide el titular                                                                             | incumple  |
    And la comprobación estática es un módulo puro mordible por StrykerJS o, si vive en "tests/e2e", el judge ejecuta a mano cada sabotaje de la tabla (lo verifica el judge)
    And un bloque "test(" de la lista que no use ninguna de las dos vías, o que mida antes de esperar, hace fallar la comprobación estática, que se hace por bloque y no por fichero
    And los bucles por las rutas del inventario no exigen el helper en las rutas sin hero, y "accesibilidad" @s45 emula movimiento reducido antes de su "goto"
    And el recuento de bloques inspeccionados es mayor que 0 y los ficheros se leen del repositorio, no de una lista escrita en la propia comprobación

  # ---------------------------------------------------------------------------
  # @s11 — EL TIEMPO DE LCP SE MIDE ANTES Y DESPUÉS Y NO PASA DEL UMBRAL «BUENO»
  #
  # POR QUÉ HA CAMBIADO. Este escenario vigilaba que la fotografía siguiera siendo
  # el elemento de mayor contenido pintado. La decisión P5 de Pablo (hero de
  # pantalla completa, H5) lo vuelve inexigible: con la foto y el velo cubriendo la
  # ventana entera, con la cabecera encima (feature 49), el área visible de la
  # imagen es IGUAL a la de la ventana y el paso 7 del algoritmo de LCP (spec de LCP,
  # §4.3) la DESCARTA como candidata. El candidato pasa a ser el titular o el
  # párrafo. Hoy la foto sí cuenta porque empieza a 64 px, bajo la cabecera
  # (1440×836 = 1.203.840 px² a 1440×900).
  #
  # EN LA 48 SOLA NO CAMBIA NADA. Mientras la cabecera no se solape con la foto
  # (hasta la feature 49), la sección arranca a 64 px del borde superior, el área
  # visible de la imagen sigue siendo menor que la de la ventana y la foto sigue
  # siendo candidata: el LCP no se mueve aunque el texto entre con retraso (medido:
  # la IMG a 120-168 ms a 1440×900, 128-140 a 1024×768 y 96-140 a 390×844). SOLO la
  # 49 expone el retardo del texto. Por eso este escenario no puede ponerse en rojo
  # por una entrada lenta en la 48 sola y lo hace, de verdad, cuando la 49 está
  # aplicada.
  #
  # QUÉ MIDE EL TITULAR ANIMADO (MEDIDO en Chromium 151, con la foto descartada: no
  # es documentación oficial). Un texto con animación de OPACIDAD cuenta como
  # candidato de LCP cuando la animación TERMINA (duración + retardo + unos 40 ms), NO
  # en su primer fotograma. Sin animación el titular llega a 36-80 ms; con un fundido
  # de 300 ms, a 324-344 ms; de 700 ms, a 724-740 ms; solo con desplazamiento
  # (`transform`) de 700 ms, a 32-36 ms.
  #
  # LAS CIFRAS, POR TAMAÑO Y POR ELEMENTO. Medidas en LOCAL (el `dist/` actual servido,
  # con la entrada SIMULADA por CSS inyectado: NO es la implementación, y se remide
  # con ella) y comparadas SOLO con la línea base LOCAL de hoy (132 ms en escritorio y
  # 120 ms en móvil): en escritorio (1440×900 y 1024×768) el candidato final es el
  # TITULAR, a ~800-850 ms (el párrafo no llega a ser candidato por tamaño); en móvil
  # (390×844) es el PÁRRAFO, a ~930 ms. Eso es unas 6,3 veces la línea base en escritorio
  # y unas 7,8 en móvil, y sigue muy por debajo de 2,5 s. El «3 veces» que a veces se
  # cita sale de comparar esas cifras locales con la línea base de la web
  # desplegada (264/236 ms), justo lo que este escenario prohíbe. La alternativa
  # técnica, animar SOLO el desplazamiento y no el fundido, mide 32-36 ms: es decisión
  # de Pablo si acepta el fundido con estas cifras a la vista.
  #
  # LA LÍNEA BASE YA EXISTE: `progress/lcp_hero_linea_base_20261013.md`. En la web
  # DESPLEGADA, mediana de 5 cargas: 264 ms a 1440×900 y 236 ms a 390×844, elemento
  # IMG y CLS 0. En LOCAL (`dist/` servido con `vite preview`, el entorno en el que
  # se medirá el «después»): 132 ms y 120 ms, elemento IMG y CLS 0. La escribe el
  # craftsman_lead. El informe del DESPUÉS es `progress/lcp_hero_despues_<fecha>.md`.
  #
  # EL ENTORNO. El «después» se mide en el MISMO entorno que la línea base con la que
  # se compara (local contra local, desplegada contra desplegada), o el informe
  # declara su entorno. No se comparan cifras de entornos distintos: un «después»
  # local contra los 264 ms de la web desplegada daría «mejor» por pura diferencia de
  # entorno y enseñaría a Pablo una comparación engañosa.
  #
  # TRAMPA DE MEDICIÓN: EL RELLENO. El titular solo se registra como candidato si la
  # animación TERMINA y se retira del elemento. Con `animation-fill-mode: backwards`
  # (y el estado base ya visible, como exige el contrato) funciona; con `both` o
  # `forwards` la animación de opacidad queda compuesta y el titular NUNCA llega a ser
  # candidato (el LCP se queda en el texto de la cabecera, ~100-160 ms): la métrica
  # saldría artificialmente buena y pasaría el umbral sin ningún mérito. La medida de
  # @s11 solo es válida con el relleno `backwards` que fija @s5, y por eso este
  # escenario exige que se haya observado al menos un candidato en cada carga.
  #
  # QUÉ SE FIJA Y QUÉ NO. Se fija el TIEMPO: la mediana de 5 cargas por tamaño es
  # menor o igual que 2500 ms. Ese 2,5 s es el umbral de LCP «bueno» oficial de
  # CAMPO (percentil 75 de las visitas reales, web.dev/articles/lcp), no una
  # tolerancia de laboratorio ni un límite para una sola carga: se usa aquí solo
  # como COTA ABSOLUTA GRUESA. Lo que NINGUNA fuente da es una TOLERANCIA DE
  # REGRESIÓN (cuánto empeoramiento es aceptable respecto al «antes»): la decide
  # Pablo viendo el «antes» y el «después» que el informe le muestra, y la feature no
  # se cierra sin su visto bueno.
  #
  # CÓMO SE MIDE, para que antes y después sean comparables: con el MISMO método que
  # la línea base (su apartado 1): contexto nuevo sin caché, espera a `networkidle` y
  # 1,5 s, último candidato, mediana de 5 cargas y no una muestra. (En pruebas, el
  # candidato del titular llegó 8-20 ms ANTES que la imagen en 2 de 3 cargas y los
  # instantes variaron 100-140 ms entre cargas: una sola muestra, o leer en `load`,
  # da ruido o el elemento equivocado.)
  #
  # LAS CLÁUSULAS «LO VERIFICA EL JUDGE» SON DOCUMENTALES: ninguna prueba automática
  # puede ponerlas en rojo, y se declaran así para no fingir una puerta.
  #
  # PUERTA QUE MUERDE: con la 49 aplicada, un retardo de entrada que lleve el LCP del
  # texto por encima de 2500 ms (medido: un titular con retardo de 3 s da 3852 ms), y
  # un relleno `both` o `forwards`, que deja la lista de candidatos vacía o en el
  # texto de la cabecera y hace fallar la cláusula del recuento. El empeoramiento
  # relativo, de unos 130 ms a unos 840-930 ms, lo juzga Pablo, no esta cláusula.
  # ---------------------------------------------------------------------------
  @s11
  Scenario: El tiempo de LCP de la portada se mide antes y después y no pasa del umbral «bueno» de campo
    Given la portada construida y servida, con la preferencia de movimiento declarada de forma explícita como "no-preference"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md
    And la línea base de LCP, medida ANTES de tocar "src/", está en "progress/lcp_hero_linea_base_20261013.md": en la web desplegada 264 ms a 1440 por 900 y 236 ms a 390 por 844, y en local 132 ms y 120 ms, mediana de 5 cargas, con la imagen como elemento y CLS 0 (lo escribe el craftsman_lead y lo verifica el judge)
    When se observa con "PerformanceObserver" de tipo "largest-contentful-paint", con el MISMO método que esa línea base —contexto nuevo sin caché, espera a "networkidle" y 1,5 segundos, último candidato—, 5 veces a 1440 por 900 y 5 veces a 390 por 844, sin usar "esperarEntradaTerminada" y en el MISMO entorno que la línea base con la que se compara, o declarando el entorno en el informe
    Then el recuento de candidatos de LCP observados en cada carga es mayor que 0
    And la mediana de las 5 cargas de cada tamaño es menor o igual que 2500 milisegundos
    And la medida solo es válida con el relleno "backwards" que fija @s5: con "both" o "forwards" el titular animado nunca llega a ser candidato y el resultado saldría artificialmente bueno
    And no se exige que el elemento candidato sea la imagen: puede ser el titular o el párrafo animados
    And el informe dice cuál es el elemento candidato en cada carga (lo verifica el judge)
    And para un candidato con animación de opacidad el informe registra el instante de CIERRE de su animación y el instante de LCP medido, porque el texto con fundido cuenta al terminar la animación y no en su primer fotograma (lo verifica el judge)
    And las medianas y los elementos de después quedan escritos, junto a los de la línea base del mismo entorno, en "progress/lcp_hero_despues_<fecha>.md" (lo verifica el judge)
    And no se comparan cifras de entornos distintos sin decirlo (lo verifica el judge)
    And si la mediana de después es peor que la de antes, el informe lo dice y la feature NO se cierra sin que Pablo lo vea y decida si la regresión es aceptable (lo verifica el judge)

  # ---------------------------------------------------------------------------
  # @s12 — EL HERO ES DE PANTALLA COMPLETA (decisión P5 de Pablo, 13/10/2026)
  #
  # QUÉ SE FIJA. La sección de bienvenida —foto y velo— mide AL MENOS el alto de la
  # ventana (`min-height: 100svh`) en TODOS los anchos, también a ≤ 560 px, y
  # EXACTAMENTE ese alto cuando el contenido cabe; su contenido va centrado
  # verticalmente en el alto que queda bajo la cabecera de 64 px
  # (`--altura-cabecera`). Desaparece la regla `@media (max-width: 560px) { .hero {
  # min-height: 0 } }` y `clamp(560px, 84svh, 784px)` deja de ser la altura del hero.
  # «Contenido», en este escenario, es la caja que va del borde superior del titular
  # al borde inferior del botón (no el `div` que los envuelve, con su relleno
  # asimétrico).
  #
  # DECISIÓN POR DEFECTO, VETABLE POR PABLO (decisión (c) del craftsman_lead). La
  # petición de Pablo dice «exactamente 100svh». En una ventana más baja que el
  # contenido (un móvil en horizontal) «exactamente 100svh» y «no recorta contenido»
  # no pueden ser ciertas a la vez; se resuelve a favor de no recortar: la sección
  # CRECE (`min-height`, no `height`). Un `height: 100svh` con `overflow: hidden`
  # pasaría los tamaños habituales y recortaría en una ventana baja: por eso se mide
  # también un tamaño bajo.
  #
  # POR QUÉ 812×300 Y NO 812×375. Medido sobre el `dist/` real con el hero de tres
  # elementos emulado, el contenido (del titular al botón) mide unos 301,5 px: a
  # 812×375 CABE (301,5 + 64 de cabecera = 365,5, menos que los 375 de la ventana) y un
  # `height: 100svh` con `overflow: hidden` pasa sin recortar nada. A 812×300 recorta
  # (el contenido sobresale +29 px con el relleno actual de `.contenido` y +12,8 px
  # sin él) mientras que con `min-height` la sección crece a 504 y 325 px. Por eso el
  # tamaño bajo es 812×300 y el escenario añade una cláusula de PREMISA que falla en
  # voz alta si el contenido deja de superar la ventana a ese tamaño. Las cifras son
  # medidas con un relleno provisional: se remiden con la implementación.
  #
  # QUÉ ES «RECORTAR». El borde inferior del contenido queda por debajo del borde
  # inferior de la sección más 0,5 px, o el borde superior del contenido queda por
  # encima del borde superior de la sección; y, como comprobación adicional, el
  # `scrollHeight` de la sección es mayor que su `clientHeight`.
  #
  # MEDIDO sobre el `dist/` real (que aún tiene píldora, franja y cifras): 837 px a
  # 1440×900 (el contenido empuja su `min-height` de 756), 825 px a 1024×768
  # (`min-height` de 645,12) y 875 px a 375×812 (`min-height` de 0). Hoy la primera
  # pantalla ya es «cabecera de 64 px + 836 px de hero» y con `100svh` se ve igual.
  #
  # LA CABECERA Y LA FOTO. Mientras la cabecera no se solape con la foto (hasta la
  # feature 49), la sección arranca a 64 px del borde superior de la ventana por el
  # hueco de `#root`: sus últimos 64 px quedan bajo el pliegue, y el contenido,
  # centrado según este escenario (descontando los 64 px de cabecera, que todavía no
  # la tapa), queda unos 32 px más abajo del centro de la propia sección. Es
  # TRANSITORIO: con la feature 49 la sección arranca en y = 0 y
  # el centrado queda exacto. Este escenario mide la sección, no su posición en la
  # ventana, y no cambia con la 49.
  #
  # POR QUÉ `svh`. Es el alto de la ventana pequeña: no salta cuando una barra de
  # navegador móvil aparece o desaparece. La medida compara con la altura de la
  # ventana de la prueba.
  #
  # PUERTA QUE MUERDE (navegador real). Vuelve `min-height: clamp(560px, 84svh,
  # 784px)`: a 1440×900 la sección mide 756 o lo que empuje el contenido, no 900.
  # Vuelve la regla de ≤ 560 px con `min-height: 0`: a 375×812 la sección mide lo del
  # contenido, no 812. Un `height: 100svh` con recorte: a 812×300 el contenido se
  # recorta. El contenido vuelve a ir pegado arriba o abajo: los dos huecos dejan de
  # ser iguales.
  # ---------------------------------------------------------------------------
  @s12
  Scenario: La sección de bienvenida mide al menos la altura de la ventana, exactamente esa cuando el contenido cabe, y su contenido se centra en vertical
    Given la portada construida y servida, con la preferencia de movimiento declarada de forma explícita como "no-preference"
    And esta verificación se ejecuta en NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md
    And el reloj de animaciones del navegador congelado ANTES de navegar, como en @s5, y las animaciones colocadas en el último instante de su fase activa: la entrada solo desplaza en horizontal, pero así la medida no tiene carrera
    And "contenido" es la caja que va del borde superior del titular al borde inferior del botón
    And "recortar" es que el borde inferior del contenido quede por debajo del borde inferior de la sección más 0,5 píxeles, o que su borde superior quede por encima del borde superior de la sección; y, como comprobación adicional, que el "scrollHeight" de la sección sea mayor que su "clientHeight"
    When se mide, a 1440 por 900, 1024 por 768, 768 por 1024, 375 por 812 y 320 por 900 píxeles, la altura de la sección de bienvenida y la posición vertical de su contenido, y además a 812 por 300
    Then en los cinco tamaños habituales la altura de la sección es igual a la altura de la ventana, con una tolerancia de 0,5 píxeles
    And a 1440 por 900 la sección mide 900 píxeles y no 756, que era el alto del "clamp(560px, 84svh, 784px)"
    And a 375 y a 320 píxeles de ancho la sección mide lo mismo que la ventana: la regla "min-height: 0" para anchos de hasta 560 píxeles ya no existe
    And la sección no recorta contenido en ninguno de los seis tamaños
    And en los cinco tamaños habituales el hueco entre el borde superior de la zona libre —el borde superior de la sección más 64 píxeles de cabecera— y el borde superior del contenido es igual al hueco entre el borde inferior del contenido y el borde inferior de la sección, con una tolerancia de 1 píxel
    And a 812 por 300 el contenido más los 64 píxeles de cabecera es más alto que la ventana, como premisa que hace fallar el escenario en voz alta si deja de serlo
    And a 812 por 300 la sección mide al menos la altura de la ventana y no recorta contenido, aunque para ello sea más alta que la ventana
    And el recuento de tamaños medidos es exactamente 6
