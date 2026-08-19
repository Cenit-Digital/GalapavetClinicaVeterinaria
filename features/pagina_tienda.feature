# =============================================================================
# features/pagina_tienda.feature — Tienda: catálogo, filtros y cesta local
# =============================================================================
#
# FUENTE DEL COMPORTAMIENTO
#
# - INTERACCIÓN (heredada del prototipo y aprobada): Claude Design
#   «Tienda.dc.html» (308 líneas, extracción forense completa en el informe
#   `12-diseno-tienda.md` de la sesión). De ahí se conserva el esqueleto de
#   interacción: fila de chips de categoría con un único filtro activo, rejilla
#   de tarjetas de producto con botón de añadir, panel lateral de cesta con
#   contador en la cabecera, líneas con controles «−» / cantidad / «+»,
#   subtotal por línea y total al pie.
# - DATOS: docs/datos-galapavet.md §6 — las CUATRO categorías que el cliente
#   publica: Piensos · Paseo · Descanso · Juegos. Es lo único real que existe de
#   esta página. §6 también deja constancia de que el cliente **no publica ni un
#   solo producto ni un solo precio**, y §9 los lista como dato pendiente.
# - DECISIONES: project-spec.md — Decisión 1(a) (un precio es una afirmación
#   sobre el negocio: sin dato verificado no se publica), Decisión 1(b) (el
#   catálogo de la demo se construye ROTULADO COMO DEMOSTRACIÓN), Decisión 2
#   (fuera todo reclamo de «Urgencias 24 h»), Decisión 9 e Invariante 3 (cero
#   peticiones automáticas a terceros: imágenes locales), Invariante 5 (el
#   estado condicional vive en un atributo ARIA, nunca en una clase CSS),
#   Invariante 6 (la decisión vive en un módulo puro; el .tsx solo cablea) y
#   «Modos de error comunes» (dato ausente → no se renderiza; dato inválido en
#   la fuente → se falla cerrado, nunca a medias).
# - feature_list.json → feature 18 `pagina_tienda`, sus 4 criterios de
#   aceptación.
#
# QUÉ CAMBIA RESPECTO AL PROTOTIPO Y POR QUÉ
#
#  1. LAS CATEGORÍAS. El prototipo derivaba las categorías DE LOS PRODUCTOS
#     (`['Todo'].concat(PRODUCTOS.map(p => p.categoria)…)`) y sacaba cinco
#     inventadas: Alimentación, Dietas veterinarias, Antiparasitarios, Higiene y
#     Accesorios. Ninguna es del cliente. Aquí las categorías son un dato FIJO
#     del cliente (las cuatro de §6) y los productos se clasifican dentro de
#     ellas. Consecuencia deliberada: una categoría PUEDE quedarse sin producto,
#     y entonces hay que enseñar un estado vacío (@s10, @s11). En el prototipo
#     ese camino era inalcanzable por construcción y por eso no existía.
#  2. LOS 12 PRODUCTOS Y SUS 12 PRECIOS del prototipo se eliminan enteros. Eran
#     invención («Dieta renal perro 8 kg · 74,00 €», «Pipetas antiparasitarias ·
#     34,50 €»…). Se sustituyen por OCHO productos de DEMOSTRACIÓN cuyo propio
#     nombre lleva la marca «de ejemplo», de modo que la rotulación no depende
#     de que alguien recuerde poner un aviso al lado.
#  3. NINGÚN IMPORTE SE PRESENTA COMO PRECIO. Los importes de la demo existen
#     —sin ellos la cesta no tendría nada que calcular, y el cálculo es el
#     corazón de esta feature— pero el nombre accesible de todo importe empieza
#     literalmente por «Importe de ejemplo», «Subtotal de ejemplo» o «Total de
#     ejemplo» (@s3). No se rotula ninguno como «Precio», «PVP» ni «Total a
#     pagar».
#  4. EL FORMATO DEL IMPORTE SE FIJA Y SE CORRIGE. El prototipo usaba
#     `n.toFixed(2).replace('.', ',') + ' €'`: sin agrupación de millares y con
#     espacio ASCII (U+0020) antes del símbolo. Aquí el formato es el de
#     `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })`,
#     comprobado ejecutándolo: coma decimal, dos decimales SIEMPRE, agrupación
#     de millares con punto SOLO a partir de cinco cifras enteras (regla CLDR
#     es-ES «min2»: «1237,50 €» va sin punto y «10.000,00 €» con él) y ESPACIO
#     DURO U+00A0 antes de «€». Queda fijado en @s33. Por eso TODO importe
#     literal de este fichero —Background y escenarios— usa ese mismo espacio
#     duro U+00A0 antes de «€», sin excepción: es un único carácter consistente
#     en todo el fichero. La única cadena que conserva el espacio ASCII
#     (U+0020) es, a propósito, la cita literal del código del prototipo dos
#     líneas más arriba: muestra el bug que se corrigió, no el formato vigente.
#  5. EL IMPORTE SE CALCULA EN CÉNTIMOS ENTEROS, no acumulando coma flotante.
#     El prototipo sumaba `precio * cantidad` en flotante y formateaba al final,
#     de modo que el total podía descuadrar un céntimo respecto a la suma de los
#     subtotales mostrados. Aquí ese descuadre está prohibido por contrato
#     (@s32). No es teórico-decorativo: es la afirmación que obliga a la
#     aritmética exacta.
#  6. CANTIDAD 0 Y CANTIDAD NEGATIVA DEJAN DE SER EL MISMO CASO. El prototipo
#     hacía `Math.max(0, n + delta)`, que traga en silencio cualquier valor
#     negativo. Aquí: 0 significa «elimina la línea» (@s34) y un valor negativo,
#     fraccionario o no numérico es INVÁLIDO y se rechaza dejando la cesta
#     intacta (@s35, @s36). Falla cerrado, no clampa.
#  7. SE AÑADE ELIMINAR LÍNEA Y VACIAR LA CESTA. El prototipo no tenía ninguno
#     de los dos: la única forma de sacar un producto era pulsar «−» tantas
#     veces como unidades hubiera, y vaciar la cesta era imposible salvo
#     recargando. Ambos entran al contrato (@s29, @s31).
#  8. SE AÑADE UN TOPE DE 99 UNIDADES POR LÍNEA. El prototipo no tenía techo
#     («se pueden encargar 999 dietas renales»). Es una GUARDA DE INTERFAZ, no
#     una afirmación de stock: el cliente no publica existencias y esta página
#     no reserva nada. Ver PENDIENTE.
#  9. SE ELIMINA LA SECCIÓN «GARANTÍAS» del prototipo. Sus tres tarjetas
#     afirmaban política comercial que el cliente no ha declarado: «No hay
#     marcas por acuerdo comercial», «Recogida en clínica en 24 h» —que además
#     contiene el «24 h» prohibido por la Decisión 2—, «Envío gratuito dentro
#     del municipio» y «revisión de control incluida a las cuatro semanas».
# 10. SE ELIMINAN LAS INSIGNIAS «Más vendido», «Con receta» y «Campaña»: las
#     tres afirman hechos comerciales o clínicos inexistentes. Con ellas cae la
#     incoherencia del prototipo de permitir añadir con un clic un producto
#     rotulado «Solo bajo prescripción» sin ninguna validación.
# 11. CAE EL TITULAR «Solo vendemos lo que recetamos» y el subtítulo que promete
#     «si vives en el municipio, te lo acercamos sin coste». Son política
#     comercial y logística no publicadas.
# 12. EL PANEL DE LA CESTA PASA A SER UN DIÁLOGO DE VERDAD. El prototipo usaba
#     un `<aside>` sin `role`, sin `aria-modal`, sin nombre accesible, sin foco
#     gestionado y sin ningún manejador de teclado (Escape no cerraba nada).
#     Aquí se contrata según el patrón Modal Dialog de la WAI-ARIA APG (@s39,
#     @s40).
# 13. LOS CHIPS DE FILTRO COMUNICAN SU ESTADO CON `aria-pressed`. En el
#     prototipo el filtro activo se distinguía SOLO por color, lo que además
#     choca con el Invariante 5 del proyecto y con el hecho de que este repo
#     corre los tests con los CSS Modules desactivados.
# 14. EL CONTADOR DE LA CESTA SE ANUNCIA (`role="status"`) y singulariza
#     correctamente («1 artículo» / «2 artículos»). El prototipo lo dejaba en un
#     `<span>` mudo, siempre en plural implícito.
# 15. LAS IMÁGENES REMOTAS DE PEXELS SE SUSTITUYEN POR IMÁGENES LOCALES
#     (Decisión 9). El prototipo pedía 12 fotos a `images.pexels.com`, además
#     con textos alternativos que describían la foto y no el producto.
#
# TODO IMPORTE, TODO NOMBRE DE PRODUCTO Y TODA CATEGORÍA-CON-PRODUCTOS DE ESTE
# FICHERO SON DATO DE DEMOSTRACIÓN. Lo único que procede del cliente son los
# cuatro NOMBRES de categoría. El `tdd_craftsman` copia los literales tal cual
# al test (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`).
#
# POR QUÉ ESTE FICHERO SÍ PERMITE EL CARÁCTER «€» Y pagina_campanas.feature NO
#   Decisión 12 de project-spec.md. El importe de esta tienda es contenido
#   editorial/catálogo de demostración bajo la Decisión 1(b): se construye
#   ROTULADO COMO DEMOSTRACIÓN (@s3, @s14), nunca como precio real. No es el
#   mismo campo que el precio de campaña que docs/datos-galapavet.md §9 lista
#   como dato pendiente sin publicar: ahí no existe ninguna cifra, ni siquiera
#   de ejemplo, así que `pagina_campanas.feature` prohíbe el carácter «€» por
#   completo (@s15, @s24) para que nadie rellene ese hueco con un número
#   inventado. Aquí, en cambio, el importe de ejemplo existe a propósito —sin
#   él la cesta no tendría nada que sumar— y lo que exige el contrato no es su
#   ausencia sino que quede rotulado sin ambigüedad como «de ejemplo, no real»
#   (ver el aviso literal más abajo). Son dos campos distintos con reglas
#   distintas, no una contradicción entre ficheros que haya que resolver
#   igualando la regla más estricta a los dos.
#
# TEXTO LITERAL DEL AVISO DE DEMOSTRACIÓN (Decisión 12: rótulo explícito e
# inequívoco de "precio de ejemplo, no real", mismo patrón que el aviso de
# demostración de campanas_portada.feature:108)
#   "Demostración: los productos y los precios de esta tienda son de ejemplo,
#   no reales. Galapavet no publica todavía su catálogo ni sus precios. Esta
#   página no procesa ningún pago, no envía ningún pedido y la cesta se borra
#   al recargar."
#
# PENDIENTE (nada de esto se afirma como hecho del negocio en ningún escenario)
#
# - PENDIENTE: el catálogo real. El cliente no publica ni un producto ni un
#   importe (docs/datos-galapavet.md §6 y §9). Los ocho productos de este
#   contrato son andamiaje de demostración y se sustituyen enteros el día que la
#   clínica entregue el suyo. Mientras tanto @s3, @s4, @s16 y @s17 obligan a
#   fallar cerrado si alguien mete un dato con pinta de real.
# - PENDIENTE: existencias, plazos, envío y recogida. El cliente no publica
#   nada. El tope de 99 unidades por línea es una guarda de interfaz elegida por
#   este proyecto, NO un dato de stock; se revisa cuando el cliente diga cómo
#   funciona realmente su tienda.
# - PENDIENTE: qué pasa después de la cesta. Hoy la única salida es consultar
#   disponibilidad en la clínica por los canales reales. No hay ni habrá
#   pasarela de pago mientras no haya backend (project-spec.md, «Qué NO es
#   objetivo»).
# - PENDIENTE: las fotografías de producto. El contrato solo exige que su origen
#   sea local (@s5); qué se ve en ellas queda a decisión de diseño.
# - PENDIENTE: la ruta "/tienda" y el destino "/#contacto" son convención de
#   enrutado de este proyecto, no un dato del cliente. Si el enrutado cambia,
#   @s41 se actualiza con él.
# - FUERA DE ALCANCE: la cabecera y el pie compartidos con la landing pertenecen
#   a `cabecera_y_navegacion` y `pie_de_pagina`. Aquí solo se contrata el botón
#   de la cesta, que es propio de esta página.
# =============================================================================

Feature: Tienda con catálogo de demostración, filtros por categoría real y cesta local
  Como visitante que quiere saber qué vende Galapavet
  Quiero recorrer las categorías de la tienda y reunir productos en una cesta
  Para llevar una lista concreta a la clínica, sabiendo en todo momento que lo que veo es una demostración y que aquí no se paga nada.

  Background:
    Given el catálogo de demostración declara ocho productos repartidos en las cuatro categorías que Galapavet publica:
      | producto                                          | categoria | importe  |
      | Pienso de ejemplo para perro adulto · 3 kg        | Piensos   | 12,50 €  |
      | Pienso de ejemplo para gato esterilizado · 1,5 kg | Piensos   | 9,95 €   |
      | Arnés de ejemplo talla M                          | Paseo     | 18,75 €  |
      | Correa de ejemplo de 2 m                          | Paseo     | 7,05 €   |
      | Cama de ejemplo talla M                           | Descanso  | 24,99 €  |
      | Manta de ejemplo de 60 × 40 cm                    | Descanso  | 6,30 €   |
      | Mordedor de ejemplo de caucho                     | Juegos    | 4,45 €   |
      | Pelota de ejemplo con sonido                      | Juegos    | 3,15 €   |
    And el visitante ha abierto la página de la tienda con la cesta vacía

  # ---------------------------------------------------------------------------
  # A. La página se declara demostración y declara que no hay pasarela de pago
  # ---------------------------------------------------------------------------

  @s1
  Scenario: La página se anuncia con su encabezado y lleva el aviso de demostración
    When el visitante mira la página de la tienda
    Then existe exactamente un encabezado de nivel 1 cuyo texto es exactamente "Tienda"
    And existe exactamente una región cuyo nombre accesible es "Catálogo"
    And el aviso visible de la página es exactamente "Demostración: los productos y los precios de esta tienda son de ejemplo, no reales. Galapavet no publica todavía su catálogo ni sus precios. Esta página no procesa ningún pago, no envía ningún pedido y la cesta se borra al recargar."
    And la descripción accesible de la región "Catálogo" es ese mismo texto

  @s2
  Scenario: No hay pasarela de pago ni forma alguna de comprar
    When el visitante recorre todos los controles de la página
    Then no existe ningún formulario en la página
    And no existe ningún campo de entrada de tarjeta, titular, caducidad ni código de seguridad
    And el texto de la página no contiene ninguna de las cadenas "Pagar", "Comprar", "Finalizar compra", "Tramitar pedido", "Pasarela", "Tarjeta", "PayPal", "Redsys" ni "Stripe"
    And no existe ningún control cuyo nombre accesible contenga "pagar" ni "comprar"

  @s3
  Scenario: Ningún importe de la página se presenta como un precio real
    Given la cesta contiene 1 unidad de "Cama de ejemplo talla M"
    When el visitante lee el nombre accesible de todos los importes visibles, con el panel de la cesta abierto
    Then el nombre accesible de cada importe empieza por "Importe de ejemplo", por "Subtotal de ejemplo" o por "Total de ejemplo"
    And ningún importe está rotulado como "Precio", "PVP", "Precio final" ni "Total a pagar"
    And el texto de la página no contiene el carácter "%"
    And el texto de la página no contiene ninguna de las cadenas "Oferta", "Descuento", "Rebaja", "IVA" ni "gastos de envío"

  @s4
  Scenario: La página no repite ninguna afirmación del prototipo heredado
    When el visitante lee todo el texto de la página, con el panel de la cesta abierto
    Then ese texto no contiene la cadena "24 h"
    And ese texto no contiene ninguna de las cadenas "Urgencias", "Más vendido", "Con receta", "Campaña" ni "Solo bajo prescripción"
    And ese texto no contiene ninguna de las cadenas "Solo vendemos lo que recetamos", "Elegido por el equipo clínico", "Envío gratuito", "sin coste" ni "Recogida en clínica"
    And ese texto no contiene ninguna de las cadenas "en stock", "últimas unidades" ni "plazo de entrega"

  @s5
  Scenario: Ninguna imagen de la página se pide a un tercero
    When el visitante lee el origen de todas las imágenes de la página
    Then existen exactamente 8 imágenes de producto, una por cada tarjeta de la rejilla
    And ningún origen contiene "http://" ni "https://"
    And ningún origen contiene "pexels"
    And cada imagen de producto tiene texto alternativo vacío, de modo que no aporta ninguna palabra al nombre accesible de su tarjeta

  # ---------------------------------------------------------------------------
  # B. Filtros: exactamente las cuatro categorías reales del cliente
  # ---------------------------------------------------------------------------

  @s6
  Scenario: Los filtros son las cuatro categorías publicadas por el cliente, más el control "Todos"
    When el visitante mira el grupo cuyo nombre accesible es "Filtrar por categoría"
    Then el grupo contiene exactamente 5 controles de filtro
    And sus nombres accesibles son, en este orden:
      | Todos    |
      | Piensos  |
      | Paseo    |
      | Descanso |
      | Juegos   |
    And los cuatro nombres distintos de "Todos" son exactamente las categorías de docs/datos-galapavet.md §6

  @s7
  Scenario: Ninguna categoría inventada por el prototipo sobrevive
    When el visitante lee todo el texto de la página
    Then ese texto no contiene ninguna de las cadenas "Alimentación", "Dietas veterinarias", "Antiparasitarios", "Higiene" ni "Accesorios"
    And no existe ningún control de filtro cuyo nombre accesible sea distinto de "Todos", "Piensos", "Paseo", "Descanso" o "Juegos"

  @s8
  Scenario: Al cargar la página el filtro activo es "Todos" y se ven las ocho tarjetas
    When el visitante mira la rejilla de productos
    Then el atributo "aria-pressed" del control "Todos" es "true"
    And el atributo "aria-pressed" de los controles "Piensos", "Paseo", "Descanso" y "Juegos" es "false"
    And la rejilla contiene exactamente 8 tarjetas de producto

  @s9
  Scenario: Filtrar por una categoría reduce la rejilla a esa categoría
    Given el filtro activo es "Todos"
    When el visitante pulsa el control de filtro "Descanso"
    Then la rejilla contiene exactamente 2 tarjetas de producto
    And los nombres accesibles de sus encabezados son exactamente "Cama de ejemplo talla M" y "Manta de ejemplo de 60 × 40 cm"
    And el atributo "aria-pressed" del control "Descanso" es "true"
    And el atributo "aria-pressed" de los otros 4 controles de filtro es "false"

  @s10
  Scenario: Caso límite — una categoría real sin ningún producto de demostración muestra un estado vacío
    Given el catálogo de demostración no declara ningún producto de la categoría "Juegos"
    When el visitante pulsa el control de filtro "Juegos"
    Then la rejilla contiene exactamente 0 tarjetas de producto
    And se muestra el texto exacto "No hay productos de ejemplo en esta categoría."
    And el atributo "aria-pressed" del control "Juegos" es "true"
    And los 5 controles de filtro siguen presentes

  @s11
  Scenario: Caso límite — con el catálogo de demostración vacío se siguen ofreciendo las cuatro categorías del cliente
    Given el catálogo de demostración no declara ningún producto
    When el visitante mira la página de la tienda
    Then la rejilla contiene exactamente 0 tarjetas de producto
    And se muestra el texto exacto "No hay ningún producto de ejemplo en el catálogo."
    And el grupo "Filtrar por categoría" sigue conteniendo exactamente 5 controles
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 0 artículos"

  @s12
  Scenario: Cambiar de filtro no toca la cesta
    Given la cesta contiene 3 unidades de "Pienso de ejemplo para perro adulto · 3 kg"
    When el visitante pulsa el control de filtro "Juegos"
    Then la rejilla contiene exactamente 2 tarjetas de producto
    And la cesta sigue conteniendo exactamente 1 línea
    And el nombre accesible del total de la cesta es exactamente "Total de ejemplo: 37,50 €"
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 3 artículos"

  # ---------------------------------------------------------------------------
  # C. La rejilla de productos
  # ---------------------------------------------------------------------------

  @s13
  Scenario: Cada tarjeta declara su producto y su categoría real
    When el visitante lee las ocho tarjetas de la rejilla
    Then cada tarjeta tiene un encabezado de nivel 2 con el nombre del producto
    And los pares producto/categoría mostrados son, en este orden:
      | Pienso de ejemplo para perro adulto · 3 kg        | Piensos   |
      | Pienso de ejemplo para gato esterilizado · 1,5 kg | Piensos   |
      | Arnés de ejemplo talla M                          | Paseo     |
      | Correa de ejemplo de 2 m                          | Paseo     |
      | Cama de ejemplo talla M                           | Descanso  |
      | Manta de ejemplo de 60 × 40 cm                    | Descanso  |
      | Mordedor de ejemplo de caucho                     | Juegos    |
      | Pelota de ejemplo con sonido                      | Juegos    |
    And el nombre de cada uno de los 8 productos contiene la cadena "de ejemplo"

  @s14
  Scenario: Cada tarjeta muestra su importe de ejemplo con el formato fijado
    When el visitante lee el nombre accesible del importe de cada tarjeta
    Then los ocho nombres accesibles son, en este orden:
      | Importe de ejemplo: 12,50 € |
      | Importe de ejemplo: 9,95 €  |
      | Importe de ejemplo: 18,75 € |
      | Importe de ejemplo: 7,05 €  |
      | Importe de ejemplo: 24,99 € |
      | Importe de ejemplo: 6,30 €  |
      | Importe de ejemplo: 4,45 €  |
      | Importe de ejemplo: 3,15 €  |

  @s15
  Scenario: Caso límite — un producto de demostración sin nombre se descarta y el resto se sigue mostrando
    Given uno de los ocho productos del catálogo de demostración tiene el nombre vacío
    When el visitante mira la rejilla de productos
    Then la rejilla contiene exactamente 7 tarjetas de producto
    And ninguna tarjeta tiene el nombre accesible vacío
    And ninguna tarjeta muestra un importe sin nombre de producto

  @s16
  Scenario: Caso límite — un producto en una categoría que el cliente no publica hace fallar la construcción
    Given un producto del catálogo de demostración declara la categoría "Antiparasitarios"
    When se construye el modelo del catálogo
    Then la construcción lanza un error cuyo mensaje contiene "categoría no publicada"
    And no se renderiza ninguna tarjeta de producto

  @s17
  Scenario: Caso límite — un importe inválido en el catálogo hace fallar la construcción
    Given un producto del catálogo de demostración declara un importe negativo
    When se construye el modelo del catálogo
    Then la construcción lanza un error cuyo mensaje contiene "importe inválido"
    And no se renderiza ninguna tarjeta de producto
    And el mismo error se produce si el importe declarado no es un número entero de céntimos

  # ---------------------------------------------------------------------------
  # D. La cesta vacía
  # ---------------------------------------------------------------------------

  @s18
  Scenario: La cesta arranca vacía, con su total a cero y sin acciones que no procedan
    When el visitante abre el panel de la cesta
    Then el panel muestra el texto exacto "Todavía no has añadido nada. Elige productos del catálogo y aquí verás el resumen para consultarlo en la clínica."
    And el panel contiene exactamente 0 líneas de cesta
    And el nombre accesible del total es exactamente "Total de ejemplo: 0,00 €"
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 0 artículos"
    And no existe ningún control cuyo nombre accesible sea "Vaciar la cesta"
    And el atributo "aria-disabled" del control "Consultar disponibilidad en la clínica" es "true"

  # ---------------------------------------------------------------------------
  # E. Añadir a la cesta
  # ---------------------------------------------------------------------------

  @s19
  Scenario: Añadir un producto crea su línea con una unidad y actualiza el total
    Given la cesta está vacía
    When el visitante pulsa el botón de añadir de la tarjeta "Cama de ejemplo talla M"
    Then la cesta contiene exactamente 1 línea, la del producto "Cama de ejemplo talla M"
    And la cantidad mostrada en esa línea es exactamente "1"
    And el nombre accesible del subtotal de esa línea es exactamente "Subtotal de ejemplo: 24,99 €"
    And el nombre accesible del total es exactamente "Total de ejemplo: 24,99 €"
    And no existe ningún elemento con rol de diálogo en la página, porque añadir no abre el panel

  @s20
  Scenario: Añadir dos veces el mismo producto suma unidades en una sola línea
    Given la cesta contiene 1 unidad de "Pienso de ejemplo para gato esterilizado · 1,5 kg"
    When el visitante pulsa otra vez el botón de añadir de la tarjeta "Pienso de ejemplo para gato esterilizado · 1,5 kg"
    Then la cesta contiene exactamente 1 línea
    And la cantidad mostrada en esa línea es exactamente "2"
    And el nombre accesible del subtotal de esa línea es exactamente "Subtotal de ejemplo: 19,90 €"
    And el nombre accesible del total es exactamente "Total de ejemplo: 19,90 €"

  @s21
  Scenario: El total de varias líneas es la suma de todos los subtotales
    Given la cesta contiene 3 unidades de "Pienso de ejemplo para perro adulto · 3 kg" y 2 unidades de "Mordedor de ejemplo de caucho"
    When el visitante pulsa el botón de añadir de la tarjeta "Manta de ejemplo de 60 × 40 cm"
    Then la cesta contiene exactamente 3 líneas
    And los nombres accesibles de sus subtotales son "Subtotal de ejemplo: 37,50 €", "Subtotal de ejemplo: 8,90 €" y "Subtotal de ejemplo: 6,30 €"
    And el nombre accesible del total es exactamente "Total de ejemplo: 52,70 €"
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 6 artículos"

  @s22
  Scenario: El botón de la tarjeta refleja cuántas unidades hay ya en la cesta
    Given la cesta contiene 1 unidad de "Arnés de ejemplo talla M"
    When el visitante mira la tarjeta "Arnés de ejemplo talla M"
    Then el rótulo visible de su botón es exactamente "En la cesta · 1"
    And el nombre accesible de ese botón es exactamente "Añadir otra unidad de Arnés de ejemplo talla M, 1 en la cesta"
    And el rótulo visible del botón de la tarjeta "Correa de ejemplo de 2 m" es exactamente "Añadir"
    And el nombre accesible de ese otro botón es exactamente "Añadir Correa de ejemplo de 2 m a la cesta"

  @s23
  Scenario: El contador de la cesta se anuncia y singulariza correctamente
    Given la cesta está vacía
    When el visitante pulsa el botón de añadir de la tarjeta "Pelota de ejemplo con sonido"
    Then existe una región de estado cuyo texto es exactamente "1 artículo"
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 1 artículo"
    And ese texto está en singular: ni la región ni el botón dicen "1 artículos"

  # ---------------------------------------------------------------------------
  # F. Cambiar cantidades
  # ---------------------------------------------------------------------------

  @s24
  Scenario: Aumentar una unidad recalcula el subtotal de la línea y el total
    Given la cesta contiene 2 unidades de "Correa de ejemplo de 2 m" y 1 unidad de "Cama de ejemplo talla M"
    When el visitante pulsa el control "Añadir una unidad de Correa de ejemplo de 2 m"
    Then la cantidad mostrada en la línea "Correa de ejemplo de 2 m" es exactamente "3"
    And el nombre accesible del subtotal de esa línea es exactamente "Subtotal de ejemplo: 21,15 €"
    And el nombre accesible del subtotal de la línea "Cama de ejemplo talla M" sigue siendo "Subtotal de ejemplo: 24,99 €"
    And el nombre accesible del total es exactamente "Total de ejemplo: 46,14 €"

  @s25
  Scenario: Quitar una unidad recalcula el subtotal de la línea y el total
    Given la cesta contiene 3 unidades de "Correa de ejemplo de 2 m" y 1 unidad de "Cama de ejemplo talla M"
    When el visitante pulsa el control "Quitar una unidad de Correa de ejemplo de 2 m"
    Then la cantidad mostrada en la línea "Correa de ejemplo de 2 m" es exactamente "2"
    And el nombre accesible del subtotal de esa línea es exactamente "Subtotal de ejemplo: 14,10 €"
    And el nombre accesible del total es exactamente "Total de ejemplo: 39,09 €"
    And la cesta sigue conteniendo exactamente 2 líneas

  @s26
  Scenario: Caso límite — quitar una unidad cuando solo queda una elimina la línea entera
    Given la cesta contiene 1 unidad de "Mordedor de ejemplo de caucho" y 2 unidades de "Manta de ejemplo de 60 × 40 cm"
    When el visitante pulsa el control "Quitar una unidad de Mordedor de ejemplo de caucho"
    Then la cesta contiene exactamente 1 línea, la del producto "Manta de ejemplo de 60 × 40 cm"
    And no existe ninguna línea del producto "Mordedor de ejemplo de caucho"
    And ninguna línea muestra la cantidad "0"
    And el nombre accesible del total es exactamente "Total de ejemplo: 12,60 €"

  @s27
  Scenario: Caso límite — la cantidad por línea no pasa de 99
    Given la cesta contiene 99 unidades de "Pienso de ejemplo para perro adulto · 3 kg"
    When el visitante pulsa el control "Añadir una unidad de Pienso de ejemplo para perro adulto · 3 kg"
    Then la cantidad mostrada en esa línea sigue siendo exactamente "99"
    And el nombre accesible del subtotal de esa línea es exactamente "Subtotal de ejemplo: 1237,50 €"
    And el nombre accesible del total es exactamente "Total de ejemplo: 1237,50 €"
    And el atributo "aria-disabled" de ese control es "true"

  @s28
  Scenario: Los controles de cantidad identifican su producto y no se repiten entre líneas
    Given la cesta contiene 1 unidad de "Arnés de ejemplo talla M" y 1 unidad de "Correa de ejemplo de 2 m"
    When el visitante recorre los controles del panel de la cesta
    Then no hay dos controles del panel con el mismo nombre accesible
    And el nombre accesible de cada control de cantidad contiene el nombre del producto de su línea
    And existen los controles "Quitar una unidad de Arnés de ejemplo talla M" y "Añadir una unidad de Arnés de ejemplo talla M"

  # ---------------------------------------------------------------------------
  # G. Eliminar líneas y vaciar la cesta
  # ---------------------------------------------------------------------------

  @s29
  Scenario: Eliminar una línea la saca entera y deja intactas las demás
    Given la cesta contiene 4 unidades de "Pelota de ejemplo con sonido" y 1 unidad de "Cama de ejemplo talla M"
    When el visitante pulsa el control "Eliminar Pelota de ejemplo con sonido de la cesta"
    Then la cesta contiene exactamente 1 línea, la del producto "Cama de ejemplo talla M"
    And el nombre accesible del subtotal de esa línea sigue siendo "Subtotal de ejemplo: 24,99 €"
    And el nombre accesible del total es exactamente "Total de ejemplo: 24,99 €"
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 1 artículo"

  @s30
  Scenario: Caso límite — eliminar la única línea devuelve la cesta a su estado vacío
    Given la cesta contiene 5 unidades de "Manta de ejemplo de 60 × 40 cm"
    When el visitante pulsa el control "Eliminar Manta de ejemplo de 60 × 40 cm de la cesta"
    Then la cesta contiene exactamente 0 líneas
    And se muestra el texto exacto "Todavía no has añadido nada. Elige productos del catálogo y aquí verás el resumen para consultarlo en la clínica."
    And el nombre accesible del total es exactamente "Total de ejemplo: 0,00 €"
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 0 artículos"
    And el atributo "aria-disabled" del control "Consultar disponibilidad en la clínica" es "true"

  @s31
  Scenario: Vaciar la cesta borra todas las líneas de una vez
    Given la cesta contiene 3 líneas y 9 artículos en total
    When el visitante pulsa el control "Vaciar la cesta"
    Then la cesta contiene exactamente 0 líneas
    And el nombre accesible del total es exactamente "Total de ejemplo: 0,00 €"
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 0 artículos"
    And ya no existe ningún control cuyo nombre accesible sea "Vaciar la cesta"
    And el rótulo visible del botón de todas las tarjetas vuelve a ser "Añadir"

  # ---------------------------------------------------------------------------
  # H. El cálculo del importe: formato exacto y casos límite de la lógica pura
  # ---------------------------------------------------------------------------

  @s32
  Scenario: El total es exactamente la suma de los subtotales mostrados, sin perder ni un céntimo
    Given la cesta contiene 3 unidades de "Cama de ejemplo talla M", 7 unidades de "Pienso de ejemplo para gato esterilizado · 1,5 kg" y 9 unidades de "Correa de ejemplo de 2 m"
    When el visitante lee los subtotales y el total del panel de la cesta
    Then los nombres accesibles de los subtotales son "Subtotal de ejemplo: 74,97 €", "Subtotal de ejemplo: 69,65 €" y "Subtotal de ejemplo: 63,45 €"
    And el nombre accesible del total es exactamente "Total de ejemplo: 208,07 €"
    And el importe del total coincide céntimo a céntimo con la suma de los tres subtotales mostrados

  @s33
  Scenario: El importe se formatea siempre con dos decimales, coma decimal y espacio duro antes del símbolo
    Given los siguientes importes expresados en céntimos enteros
    When se formatea cada uno de ellos
    Then el texto resultante es, en cada caso:
      | centimos  | texto          |
      | 0         | 0,00 €         |
      | 5         | 0,05 €         |
      | 90        | 0,90 €         |
      | 315       | 3,15 €         |
      | 1250      | 12,50 €        |
      | 123750    | 1237,50 €      |
      | 1000000   | 10.000,00 €    |
      | 123456789 | 1.234.567,89 € |
    And el carácter que separa la cifra del símbolo "€" es el espacio duro U+00A0, no el espacio ASCII
    And ningún importe se formatea con uno, tres ni cero decimales

  @s34
  Scenario: Caso límite — fijar la cantidad de una línea a cero elimina la línea
    Given un estado de cesta con 6 unidades de "Pelota de ejemplo con sonido" y 1 unidad de "Arnés de ejemplo talla M"
    When se fija a 0 la cantidad de "Pelota de ejemplo con sonido"
    Then el estado de cesta resultante tiene exactamente 1 línea
    And no queda ninguna línea de "Pelota de ejemplo con sonido"
    And ninguna línea del estado resultante tiene cantidad 0
    And el total del estado resultante es exactamente "18,75 €"

  @s35
  Scenario: Caso límite — una cantidad negativa se rechaza y deja la cesta intacta
    Given un estado de cesta con 2 unidades de "Cama de ejemplo talla M"
    When se intenta fijar a -3 la cantidad de "Cama de ejemplo talla M"
    Then la operación lanza un error cuyo mensaje contiene "cantidad inválida"
    And el estado de cesta sigue teniendo exactamente 1 línea con 2 unidades
    And el total sigue siendo exactamente "49,98 €"
    And en ningún momento se almacena una cantidad menor que cero

  @s36
  Scenario: Caso límite — una cantidad que no es un entero se rechaza y deja la cesta intacta
    Given un estado de cesta con 2 unidades de "Cama de ejemplo talla M"
    When se intenta fijar la cantidad de "Cama de ejemplo talla M" a un valor que no es un entero
    Then la operación lanza un error cuyo mensaje contiene "cantidad inválida" para el valor 1,5, para el texto "dos" y para un valor no numérico
    And el estado de cesta sigue teniendo exactamente 1 línea con 2 unidades
    And el total sigue siendo exactamente "49,98 €"

  @s37
  Scenario: Caso límite — una línea con un producto que no existe en el catálogo se descarta sin reventar
    Given un estado de cesta corrupto con 2 unidades de "Cama de ejemplo talla M" y 4 unidades de un identificador que no existe en el catálogo
    When se calcula el resumen de la cesta
    Then el cálculo no lanza ningún error
    And el resumen contiene exactamente 1 línea, la del producto "Cama de ejemplo talla M"
    And el total es exactamente "49,98 €"
    And el número de artículos es exactamente 2, sin contar las unidades de la línea descartada

  @s38
  Scenario: Caso límite — el resumen de una cesta sin ninguna línea es cero, no vacío ni indefinido
    Given un estado de cesta sin ninguna línea
    When se calcula el resumen de la cesta
    Then el número de líneas es exactamente 0
    And el número de artículos es exactamente 0
    And el total es exactamente "0,00 €"
    And el total no es una cadena vacía ni el texto "NaN"

  # ---------------------------------------------------------------------------
  # I. El panel de la cesta y la salida hacia la clínica
  # ---------------------------------------------------------------------------

  @s39
  Scenario: El panel de la cesta se abre como un diálogo modal con nombre accesible
    Given el panel de la cesta está cerrado
    When el visitante pulsa el botón de la cesta
    Then existe un elemento con rol de diálogo cuyo nombre accesible es "Tu cesta"
    And su atributo "aria-modal" es "true"
    And el diálogo contiene un encabezado de nivel 2 cuyo texto es exactamente "Tu cesta"
    And el foco queda dentro del diálogo

  @s40
  Scenario: La tecla Escape cierra el panel y devuelve el foco al botón de la cesta
    Given el panel de la cesta está abierto y contiene 1 línea
    When el visitante pulsa la tecla Escape
    Then no existe ningún elemento con rol de diálogo en la página
    And el foco vuelve al botón de la cesta
    And el nombre accesible del botón de la cesta sigue anunciando el mismo número de artículos que antes de cerrar

  @s41
  Scenario: La única salida de la cesta es consultar en la clínica, y no envía nada
    Given la cesta contiene 2 unidades de "Mordedor de ejemplo de caucho"
    When el visitante lee el control "Consultar disponibilidad en la clínica"
    Then su atributo "aria-disabled" es "false"
    And su destino es exactamente "/#contacto"
    And activarlo no provoca ninguna petición de red
    And el panel no ofrece ningún otro control de salida

  @s42
  Scenario: Caso límite — la cesta no persiste y el aviso lo dice antes de que ocurra
    Given la cesta contiene 3 líneas y 5 artículos en total
    When el visitante recarga la página de la tienda
    Then la cesta contiene exactamente 0 líneas
    And el nombre accesible del botón de la cesta es exactamente "Ver la cesta, 0 artículos"
    And el aviso visible de la página contiene la cadena "la cesta se borra al recargar"
    And no se ha escrito ningún dato de la cesta en el almacenamiento del navegador

  # ---------------------------------------------------------------------------
  # J. Gemelos de lógica pura añadidos en reparación (ver
  #    progress/gherkin_repair_pagina_tienda.md): mismo patrón que @s33-@s36 —
  #    ejercitan el estado o el formateo directamente, para que el
  #    `tdd_craftsman` los resuelva en un módulo `*-logica.ts` mordible por
  #    Stryker, en vez de cablearlos solo en el `.tsx` (excluido del objetivo
  #    de mutación por `stryker.config.json`).
  # ---------------------------------------------------------------------------

  @s43
  Scenario: Caso límite — la función pura que añade unidades nunca deja una línea por encima de 99
    Given un estado de cesta con 99 unidades de "Pienso de ejemplo para perro adulto · 3 kg"
    When se añade 1 unidad de "Pienso de ejemplo para perro adulto · 3 kg" al estado
    Then el estado de cesta resultante tiene esa línea con exactamente 99 unidades
    And la función no lanza ningún error
    And el total del estado resultante sigue siendo exactamente "1237,50 €"

  @s44
  Scenario: Caso límite — la función pura que formatea el contador de artículos solo singulariza en 1
    Given los siguientes números de artículos en la cesta
    When se formatea el contador de cada uno
    Then el texto resultante es, en cada caso:
      | articulos | texto        |
      | 0         | 0 artículos  |
      | 1         | 1 artículo   |
      | 2         | 2 artículos  |
      | 15        | 15 artículos |
    And ningún texto usa la forma singular para una cantidad distinta de 1
