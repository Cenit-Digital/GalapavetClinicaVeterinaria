# =============================================================================
# features/pagina_blog.feature — Página de blog de la web piloto de Galapavet
# =============================================================================
#
# FUENTE DEL COMPORTAMIENTO
#
# - INTERACCIÓN (heredada del prototipo y conservada): análisis forense completo de
#   «Blog.dc.html» del proyecto de Claude Design (383/383 líneas leídas). De ahí se
#   conservan las cuatro piezas que dan valor a la página: (a) listado de tarjetas,
#   (b) filtro por categoría con chips, (c) vista de artículo con cuerpo, imagen y
#   cierre con llamada a la acción, y (d) bloque «Sigue leyendo» al final del
#   artículo. Estado del prototipo: `abierto`, `categoria`, `ancho`.
# - DATOS: docs/datos-galapavet.md — §5 (los cinco bloques de servicio publicados,
#   de donde salen LAS CATEGORÍAS del blog, literales), §7 (todo lo del prototipo
#   que es falso o no verificable) y §9 (lo que el cliente no publica).
# - DECISIONES: project-spec.md — Decisión 1(a) y 1(b) (afirmación sobre el negocio
#   vs. contenido editorial de demo rotulado), Decisión 2 (no existe «Urgencias
#   24 h»), Decisión 9 (nada de imágenes remotas de terceros), Invariantes 1, 3, 5
#   y 6, y «Modos de error comunes» (dato ausente → no se renderiza; dato inválido
#   → falla cerrado).
# - feature_list.json → feature 17 `pagina_blog`, sus 4 criterios de aceptación.
# - features/pie_de_pagina.feature @s4 y features/cabecera_y_navegacion.feature @s5
#   fijan ya la ruta del listado: «/blog». Esta feature la implementa y añade la
#   ruta de artículo (ver PENDIENTE).
# - features/accesibilidad.feature @s1 inventaría «Blog» y «Artículo del blog» como
#   DOS páginas auditables distintas: por eso el artículo tiene dirección propia.
#
# EL CAMBIO DE FONDO: EL BLOG SE RECONSTRUYE COMO CONTENIDO DE DEMOSTRACIÓN
#
# Galapavet no ha escrito ni un artículo: no hay contenido editorial suyo que
# reutilizar, así que el blog entero se construye como demo rotulada como tal
# (Decisión 1b, project-spec.md). Los 6 artículos del prototipo son de la clínica
# FICTICIA «Veterinaria La Sierra» y arrastran, uno a uno, afirmaciones que sobre un
# negocio real serían falsas o temerarias:
#   - Firmas de profesionales inventados: «Dra. Elena Vargas · Directora clínica»,
#     «Dr. Marcos Nieto · Cirujano jefe», «Dra. Lucía Ferrer», «Sergio Ibáñez».
#     Galapavet publica DOS profesionales (§4) y ninguno ha consentido firmar nada.
#   - Afirmaciones clínicas con cifras: «hasta un 10 % de esos cachorros se quedan
#     sin inmunizar», «reduce el riesgo por encima del 90 %», «multiplica por tres
#     la ingesta». Ninguna está contrastada (el propio informe forense §15.7 lo
#     marca como NO VERIFICADO) y todas se leerían como consejo clínico DE
#     GALAPAVET.
#   - Servicios que la clínica no presta y datos falsos: el artículo «urgencias»
#     dice literalmente «llama al 640 22 11 90», teléfono que no es de Galapavet
#     (§7), y da por hecho una atención de urgencias permanente (Decisión 2).
#   - Fechas de publicación («4 de agosto de 2026»…) que afirman que la clínica
#     publicó algo ese día. No publicó nada.
# Por eso el contenido se rehace entero como DEMO ROTULADA COMO TAL (Decisión 1b),
# con tres reglas duras que este contrato hace exigibles y falibles:
#   R1. El artículo no tiene autor. El modelo de datos NO declara campo de autor,
#       firma ni iniciales, y el validador rechaza el que lo declare (@s25). Así no
#       se puede firmar con una persona real sin su consentimiento ni resucitar a
#       los profesionales inventados del prototipo.
#   R2. Ningún artículo habla en nombre de la clínica: su texto no contiene
#       «Galapavet» ni ninguna fórmula en primera persona del plural (@s27).
#   R3. Ningún artículo lleva precio, teléfono, porcentaje de eficacia ni promesa
#       de resultado: el validador falla cerrado (@s26).
#
# QUÉ MÁS SE APARTA DEL PROTOTIPO, Y POR QUÉ
#
#  1. LA TAXONOMÍA NO SE INVENTA. El prototipo usaba las categorías «Salud»,
#     «Prevención», «Gatos», «Cachorros» y «Urgencias». «Urgencias» como sección
#     editorial vuelve a insinuar un servicio que la clínica no presta como tal
#     (Decisión 2). Aquí las categorías son, literalmente, los cinco bloques de
#     servicio publicados en §5 — así ni la taxonomía puede prometer algo que la
#     clínica no haga. Los chips son «Todos» + esos cinco, SIEMPRE los seis, en el
#     orden de §5 y no en el orden de aparición de los artículos (@s7).
#  2. LISTADO VACÍO Y FILTRO SIN RESULTADOS DEJAN DE SER UN HUECO MUDO. El
#     prototipo pintaba una rejilla sin hijos y sin mensaje en 4 de sus 6
#     categorías (forense §14.3). Aquí hay aviso explícito y literal (@s11, @s13).
#  3. DESAPARECE EL DISTINTIVO «Destacado». En el prototipo no era un dato: era
#     `visibles[0]`, de modo que al filtrar, el único artículo de la categoría
#     quedaba ascendido a «destacado» por accidente posicional (forense §14.2).
#     Anunciar como destacado un texto de relleno es, además, ruido. El único
#     distintivo admitido en una tarjeta es la marca de demostración (@s5).
#  4. LAS TARJETAS SON ENLACES, NO BOTONES, Y EL ARTÍCULO TIENE DIRECCIÓN PROPIA.
#     El prototipo conmutaba vistas con estado interno: no se podía compartir el
#     enlace de un artículo, el botón «atrás» sacaba de la página y al recargar se
#     perdía todo (forense §14.19). Aquí el listado vive en «/blog» y cada artículo
#     en «/blog/<identificador>» (@s4, @s14), y el filtro activo viaja en la
#     dirección (@s9, @s10), de modo que un valor corrupto tiene un camino de
#     recuperación contratado (@s12), igual que la paleta corrupta del selector.
#  5. EL CUERPO DEL ARTÍCULO SE PINTA CON ELEMENTOS SEMÁNTICOS REALES. El prototipo
#     renderizaba párrafos, encabezados y citas como el MISMO `<div>` con estilo
#     en línea (forense §14.11): ningún encabezado existía para un lector de
#     pantalla ni para el índice del documento. Aquí los tres tipos de bloque son
#     encabezado de nivel 2, cita y párrafo de verdad (@s16). Este repositorio corre
#     los tests con los CSS Modules desactivados y prohíbe aseverar sobre clases,
#     así que el estilo en línea no es siquiera observable: solo el rol lo es.
#  6. «SIGUE LEYENDO» PASA A ESTAR RELACIONADO CON ALGO. El prototipo ofrecía
#     siempre los tres primeros artículos del array, sin relación temática, y dejaba
#     dos artículos inalcanzables por esa vía (forense §14.4). Aquí son artículos de
#     la MISMA categoría, nunca el actual, y si no hay ninguno la sección no se
#     pinta (@s22, @s23).
#  7. LOS CHIPS ANUNCIAN SU ESTADO. El prototipo transmitía el filtro activo
#     EXCLUSIVAMENTE por color (forense §14.12). Aquí van agrupados y con
#     `aria-pressed`, que es el atributo consultable que exige el Invariante 5.
#  8. FUERA LA BARRA Y EL BOTÓN DE URGENCIAS DE LA CABECERA DEL BLOG. El prototipo
#     ponía un botón rojo con punto pulsante a `tel:+34640221190` — teléfono falso
#     (§7) — y encima lo ocultaba justo en móvil (forense §14.6). Esta página usa la
#     cabecera y el pie de la landing, sin añadidos (@s2), y en toda ella no aparece
#     ningún reclamo de 24 horas (@s27).
#  9. EL TIEMPO DE LECTURA SE CALCULA, NO SE ESCRIBE. En el prototipo «6 min» era un
#     literal del array. Aquí sale del recuento de palabras del propio cuerpo a una
#     velocidad declarada (@s18), lógica pura y por tanto mordible por mutación
#     (Invariante 6). No es un dato de negocio: no afirma nada sobre la clínica.
# 10. IMÁGENES LOCALES. Los 6 identificadores de Pexels del prototipo desaparecen
#     (Decisión 9 e Invariante 3). Las miniaturas de «Sigue leyendo» pasan a ser
#     decorativas: repetían en su alternativo lo que ya dice el título contiguo
#     (forense §14.21).
# 11. EL DESPLAZAMIENTO RESPETA LA PREFERENCIA DE MOVIMIENTO. El prototipo forzaba
#     `behavior:'smooth'`, que anula la regla CSS de `prefers-reduced-motion`
#     (forense §14.10). Aquí el comportamiento se decide en lógica pura (@s29).
#
# TEXTOS LITERALES DE ESTE CONTRATO (el `tdd_craftsman` los copia carácter a
# carácter al test — patrón `doble-de-test-anclado-al-literal-no-al-simbolo`):
#   AVISO DE DEMO:
#     "Contenido de demostración. Galapavet no ha escrito ninguno de estos artículos:
#     son textos de ejemplo para enseñar el formato. No son consejo veterinario ni
#     comprometen a la clínica."
#   CATEGORÍA SIN ARTÍCULOS: "No hay artículos de demostración en esta categoría."
#   CATÁLOGO VACÍO: "Todavía no hay ningún artículo de demostración que mostrar."
#   ARTÍCULO INEXISTENTE: "No hemos encontrado ese artículo."
#   DISTINTIVO DE TARJETA: "Demostración"
#
# PENDIENTE (nada de esto está verificado; ningún escenario lo afirma como hecho)
#
#   - PENDIENTE: el TEXTO EDITORIAL de los artículos de demostración. Este contrato
#     fija la forma, las puertas y la interacción, y deliberadamente NO fija el
#     contenido de ningún artículo: escribirlo aquí sería convertir el contrato en
#     el sitio donde se inventa. El texto que finalmente se publique debe pasar las
#     puertas @s25, @s26 y @s27 y, antes de salir a producción, una revisión
#     veterinaria que este arnés no puede dar.
#   - PENDIENTE: si el cliente quiere blog de verdad. Mientras no lo diga, TODO el
#     contenido de esta página es demostración y debe sustituirse antes de publicar
#     (project-spec.md, «Riesgos abiertos» 4).
#   - PENDIENTE: las FOTOGRAFÍAS. El cliente no publica ninguna. El contrato solo
#     exige que sean locales y que su alternativo no esté vacío ni afirme ningún
#     servicio (@s28); qué se ve en ellas y cómo se describe es decisión de diseño.
#   - PENDIENTE: la ruta de artículo «/blog/<identificador>» es convención de este
#     proyecto, hermana de «/campanas» y «/tienda». Si el enrutado adopta otros
#     slugs, se corrige aquí, que es donde queda escrito. La ruta del listado
#     «/blog» NO es negociable aquí: la fijan ya pie_de_pagina @s4 y
#     cabecera_y_navegacion @s5.
#   - PENDIENTE: la velocidad de lectura de 200 palabras por minuto es una constante
#     de presentación elegida por este contrato, no un dato del cliente ni una
#     medición. Si se cambia, se cambia en @s18.
#   - Fuera de alcance deliberado: el título del documento, la descripción, el Open
#     Graph y el JSON-LD de esta página son de la feature 15 `seo_estructura`; el
#     análisis automático de accesibilidad de «Blog» y «Artículo del blog» es de la
#     feature 19 `accesibilidad`; la cabecera y el pie son de las features 3 y 13.
# =============================================================================

Feature: Página de blog: listado, filtro y artículo
  Como visitante que quiere ver qué aspecto tendría el blog de Galapavet
  Quiero recorrer los artículos, filtrarlos por categoría y leer uno entero
  Para juzgar el formato sabiendo en todo momento que el contenido es una demostración y no un consejo de la clínica.

  Background:
    Given el catálogo de demostración escrito a mano declara seis artículos, en este orden:
      | identificador | título                     | categoría        |
      | demo-1        | Artículo de demostración 1 | Medicina general |
      | demo-2        | Artículo de demostración 2 | Medicina general |
      | demo-3        | Artículo de demostración 3 | Medicina general |
      | demo-4        | Artículo de demostración 4 | Análisis         |
      | demo-5        | Artículo de demostración 5 | Análisis         |
      | demo-6        | Artículo de demostración 6 | Especialidades   |
    And esa tabla escrita a mano es el catálogo que exporta el módulo de producción del blog; ningún escenario la sustituye por un doble salvo que declare explícitamente su propio catálogo o cuerpo de artículo en el Given
    And ninguno de esos seis artículos declara autor, firma, iniciales ni fecha de publicación
    And las categorías admitidas son, literalmente, los cinco bloques de servicio publicados por el cliente

  # ---------------------------------------------------------------------------
  # A. EL LISTADO — ruta "/blog"
  # ---------------------------------------------------------------------------

  @s1
  Scenario: El listado es una página propia con un único contenido principal y su encabezado
    Given el visitante abre la dirección "/blog"
    When se renderiza la página
    Then existe exactamente un elemento con rol "main"
    And dentro de él hay exactamente un encabezado de nivel 1 cuyo nombre accesible es exactamente "Blog"
    And no existe ningún encabezado de nivel 1 fuera de ese elemento

  @s2
  Scenario: La página comparte cabecera y pie con la landing y se señala como página actual
    Given el visitante abre la dirección "/blog"
    When se renderiza la página
    Then existe exactamente un elemento con rol "banner" y exactamente un elemento con rol "contentinfo"
    And el enlace de navegación cuyo nombre accesible es "Blog" declara el atributo "aria-current" con el valor exacto "page"
    And ningún otro enlace de navegación declara el atributo "aria-current"
    And la cabecera de esta página no contiene ningún enlace ni botón cuyo nombre accesible contenga "Urgencias"

  @s3
  Scenario: El aviso de demostración encabeza el listado con su texto literal
    Given el visitante abre la dirección "/blog"
    When se renderiza el listado
    Then dentro del rol "main" se lee, exactamente, "Contenido de demostración. Galapavet no ha escrito ninguno de estos artículos: son textos de ejemplo para enseñar el formato. No son consejo veterinario ni comprometen a la clínica."
    And ese aviso aparece antes que el primer enlace de artículo en el orden del documento
    And ese aviso es texto visible, no solo un atributo de accesibilidad

  @s4
  Scenario: El listado muestra un enlace por artículo, en el orden del catálogo, con su destino propio
    Given el visitante abre la dirección "/blog"
    When se renderiza el listado
    Then hay exactamente 6 elementos con rol "link" que apuntan a un artículo
    And sus destinos son, en este orden, exactamente:
      | /blog/demo-1 |
      | /blog/demo-2 |
      | /blog/demo-3 |
      | /blog/demo-4 |
      | /blog/demo-5 |
      | /blog/demo-6 |
    And no hay dos de esos enlaces con el mismo nombre accesible

  @s5
  Scenario: Cada tarjeta lleva la marca de demostración y ningún otro distintivo
    Given el visitante abre la dirección "/blog"
    When se renderiza el listado
    Then cada uno de los 6 enlaces de artículo muestra el texto exacto "Demostración"
    And el nombre accesible de cada uno contiene su título y contiene "Demostración"
    And ninguna tarjeta muestra el texto "Destacado"
    And ninguna tarjeta muestra ningún otro distintivo de estado

  @s6
  Scenario: Ninguna tarjeta atribuye el texto a una persona ni lo fecha
    Given el visitante abre la dirección "/blog"
    When se renderiza el listado
    Then ninguna tarjeta muestra un nombre de persona
    And ninguna tarjeta muestra iniciales de autor ni ningún elemento con rol "img" que las represente
    And ninguna tarjeta muestra una fecha de publicación
    And en todo el listado no aparece "Dra. Elena Vargas", ni "Dr. Marcos Nieto", ni "Dra. Lucía Ferrer", ni "Sergio Ibáñez"
    And en todo el listado no aparece "Marcos Pérez", ni "Joaquín Herranz"

  # ---------------------------------------------------------------------------
  # B. EL FILTRO POR CATEGORÍA
  # ---------------------------------------------------------------------------

  @s7
  Scenario: El filtro ofrece «Todos» más las cinco categorías publicadas, y solo «Todos» está aplicado
    Given el visitante abre la dirección "/blog"
    When se renderiza el filtro de categorías
    Then existe exactamente un grupo cuyo nombre accesible es "Filtrar por categoría"
    And ese grupo contiene exactamente 6 botones, cuyos nombres accesibles son, en este orden:
      | Todos                 |
      | Cirugía y anestesia   |
      | Diagnóstico de imagen |
      | Medicina general      |
      | Análisis              |
      | Especialidades        |
    And el atributo "aria-pressed" del botón "Todos" es "true"
    And el atributo "aria-pressed" de los otros 5 botones es "false"
    And ningún botón del grupo se llama "Salud", ni "Gatos", ni "Cachorros", ni "Urgencias"

  @s8
  Scenario: Filtrar por una categoría deja exactamente los artículos de esa categoría
    Given el visitante está en "/blog" sin ningún filtro aplicado
    When el visitante pulsa el botón "Análisis"
    Then quedan exactamente 2 enlaces de artículo, con destinos "/blog/demo-4?categoria=An%C3%A1lisis" y "/blog/demo-5?categoria=An%C3%A1lisis"
    And el atributo "aria-pressed" del botón "Análisis" pasa a "true"
    And el atributo "aria-pressed" de los otros 5 botones del grupo es "false"
    And no se muestra ningún aviso de lista vacía

  @s9
  Scenario: El filtro aplicado queda escrito en la dirección
    Given el visitante está en "/blog" sin ningún filtro aplicado
    When el visitante pulsa el botón "Medicina general"
    Then el camino de la dirección del navegador sigue siendo exactamente "/blog"
    And el parámetro "categoria" de la dirección vale exactamente "Medicina general"
    And quedan exactamente 3 enlaces de artículo

  @s10
  Scenario: Entrar directamente por una dirección filtrada llega ya filtrado
    Given el visitante abre la dirección "/blog" con el parámetro "categoria" igual a "Especialidades"
    When se renderiza el listado
    Then hay exactamente 1 enlace de artículo, con destino "/blog/demo-6?categoria=Especialidades"
    And el atributo "aria-pressed" del botón "Especialidades" es "true"
    And el atributo "aria-pressed" del botón "Todos" es "false"

  @s11
  Scenario: Caso límite — una categoría publicada sin ningún artículo muestra el aviso de lista vacía
    Given el visitante abre la dirección "/blog" con el parámetro "categoria" igual a "Diagnóstico de imagen"
    When se renderiza el listado
    Then no hay ningún enlace de artículo
    And se lee, exactamente, "No hay artículos de demostración en esta categoría."
    And los 6 botones del grupo "Filtrar por categoría" siguen presentes
    And el atributo "aria-pressed" del botón "Diagnóstico de imagen" es "true"
    And no se muestra ningún artículo de otra categoría en su lugar

  @s12
  Scenario: Caso límite — un valor de categoría corrupto cae a «Todos» sin escribir basura
    Given el visitante abre la dirección "/blog" con el parámetro "categoria" igual a "<script>alert(1)</script>"
    When se renderiza el listado
    Then se muestran los 6 enlaces de artículo
    And el atributo "aria-pressed" del botón "Todos" es "true"
    And ningún botón del grupo tiene un nombre accesible que contenga "script"
    And en la página no aparece en ningún sitio el texto recibido "<script>alert(1)</script>"
    And no se lanza ningún error

  @s13
  Scenario: Caso límite — con el catálogo de demostración vacío no se pinta ninguna tarjeta ni texto de relleno
    Given el catálogo de demostración no declara ningún artículo
    When el visitante abre la dirección "/blog"
    Then el encabezado de nivel 1 "Blog" sigue presente
    And se lee, exactamente, "Todavía no hay ningún artículo de demostración que mostrar."
    And no hay ningún enlace de artículo
    And no existe ningún grupo cuyo nombre accesible sea "Filtrar por categoría"
    And no se muestra ninguna tarjeta de ejemplo, ni ningún texto de relleno, ni ningún recuadro vacío

  # ---------------------------------------------------------------------------
  # C. LA VISTA DE ARTÍCULO — ruta "/blog/<identificador>"
  # ---------------------------------------------------------------------------

  @s14
  Scenario: Abrir un artículo lleva a su propia dirección y lo muestra completo
    Given el visitante está en "/blog" sin ningún filtro aplicado
    When el visitante pulsa el enlace del artículo "Artículo de demostración 3"
    Then la dirección del navegador es exactamente "/blog/demo-3"
    And existe exactamente un elemento con rol "main"
    And existe exactamente un elemento con rol "article" dentro de él
    And el encabezado de nivel 1 de la página es exactamente "Artículo de demostración 3"
    And ese encabezado, la imagen del artículo y todo el cuerpo están dentro del elemento con rol "article"
    And el enlace de volver al listado está fuera del elemento con rol "article"

  @s15
  Scenario: La vista de artículo repite el aviso de demostración antes del cuerpo
    Given el visitante abre la dirección "/blog/demo-3"
    When se renderiza el artículo
    Then se lee, exactamente, "Contenido de demostración. Galapavet no ha escrito ninguno de estos artículos: son textos de ejemplo para enseñar el formato. No son consejo veterinario ni comprometen a la clínica."
    And ese aviso aparece antes del primer bloque del cuerpo en el orden del documento
    And el texto de ese aviso es carácter por carácter el mismo que el del listado

  @s16
  Scenario: El cuerpo del artículo se pinta con elementos semánticos reales
    Given el artículo "demo-3" declara un cuerpo con dos párrafos, dos encabezados y una cita
    When el visitante abre la dirección "/blog/demo-3"
    Then dentro del elemento con rol "article" hay exactamente 2 encabezados de nivel 2 procedentes del cuerpo
    And hay exactamente 1 elemento con rol "blockquote"
    And hay exactamente 2 elementos con rol "paragraph"
    And ningún bloque del cuerpo se representa con un contenedor sin rol accesible
    And ningún encabezado del cuerpo tiene nivel 1

  @s17
  Scenario: El artículo no muestra firma de autor, ni iniciales, ni fecha de publicación
    Given el visitante abre la dirección "/blog/demo-3"
    When se renderiza el artículo
    Then no se muestra ningún nombre de persona
    And no se muestra ningún rol profesional del tipo "Directora clínica", "Cirujano jefe" ni "Auxiliar técnico veterinario"
    And no se muestra ninguna fecha de publicación ni ninguna fecha de actualización
    And no existe ningún elemento cuyo nombre accesible contenga "Autor" ni "Escrito por"

  @s18
  Scenario: El tiempo de lectura se calcula del cuerpo a la velocidad declarada
    Given la velocidad de lectura declarada es de 200 palabras por minuto
    When se calcula el tiempo de lectura de cada uno de estos cuerpos
    Then la velocidad de lectura que exporta el módulo de cálculo es exactamente 200 palabras por minuto
    And el resultado es, respectivamente, exactamente:
      | palabras del cuerpo | tiempo mostrado |
      | 1                   | 1 min           |
      | 200                 | 1 min           |
      | 201                 | 2 min           |
      | 400                 | 2 min           |
      | 401                 | 3 min           |
    And ningún tiempo de lectura procede de un valor escrito en el catálogo

  @s19
  Scenario: Caso límite — un cuerpo sin palabras no muestra tiempo de lectura
    Given el artículo "demo-5" declara un cuerpo sin ninguna palabra
    When el visitante abre la dirección "/blog/demo-5"
    Then no se muestra ningún tiempo de lectura
    And en la página no aparece "0 min"
    And el encabezado de nivel 1 "Artículo de demostración 5" sigue presente

  @s20
  Scenario: Volver al listado conserva el filtro con el que se llegó
    Given el visitante abre la dirección "/blog/demo-4" con el parámetro "categoria" igual a "Análisis"
    When se renderiza el artículo
    Then existe exactamente un enlace cuyo nombre accesible es "Volver al listado del blog"
    And su destino es exactamente "/blog?categoria=An%C3%A1lisis"
    And ese enlace no declara el atributo target

  @s21
  Scenario: Caso límite — un identificador de artículo inexistente no pinta un artículo vacío
    Given el visitante abre la dirección "/blog/no-existe"
    When se renderiza la página
    Then se lee, exactamente, "No hemos encontrado ese artículo."
    And existe un enlace cuyo nombre accesible es "Volver al listado del blog" con destino exactamente "/blog"
    And no existe ningún elemento con rol "article"
    And no se muestra ningún encabezado de nivel 1 vacío
    And no se redirige silenciosamente al listado

  @s22
  Scenario: «Sigue leyendo» ofrece artículos de la misma categoría y nunca el actual
    Given el visitante abre la dirección "/blog/demo-1"
    When se renderiza el bloque de artículos relacionados
    Then existe exactamente un encabezado de nivel 2 cuyo nombre accesible es "Sigue leyendo"
    And bajo él hay exactamente 2 enlaces, con destinos "/blog/demo-2" y "/blog/demo-3"
    And ninguno de esos enlaces apunta a "/blog/demo-1"
    And ninguno de esos enlaces apunta a un artículo de otra categoría
    And nunca se ofrecen más de 3 enlaces en ese bloque

  @s23
  Scenario: Caso límite — sin otros artículos de su categoría, el bloque «Sigue leyendo» no existe
    Given el visitante abre la dirección "/blog/demo-6", único artículo de la categoría "Especialidades"
    When se renderiza el artículo
    Then no existe ningún encabezado cuyo nombre accesible sea "Sigue leyendo"
    And no se muestra ninguna tarjeta de artículo relacionado
    And no se muestra ningún texto de relleno en su lugar

  @s24
  Scenario: El cierre del artículo invita a pedir cita sin prometer nada
    Given el visitante abre la dirección "/blog/demo-3"
    When se renderiza el cierre del artículo
    Then se lee un encabezado de nivel 2 cuyo nombre accesible es exactamente "¿Tienes una duda con tu animal?"
    And existe exactamente un enlace cuyo nombre accesible es exactamente "Reservar cita" con destino exactamente "/#reservar"
    And el texto del cierre no contiene ningún número de teléfono
    And el texto del cierre no contiene "24 h", ni "gratis", ni "sin coste", ni ningún plazo de respuesta

  # ---------------------------------------------------------------------------
  # D. LAS PUERTAS DEL CONTENIDO — lo que impide que la demo mienta
  # ---------------------------------------------------------------------------

  @s25
  Scenario: El validador rechaza cualquier artículo que declare autor, firma o iniciales
    Given un artículo de demostración que declara el autor "Marcos Pérez", que es un profesional real del cliente
    When se valida el catálogo de demostración
    Then la validación falla lanzando un error
    And el mensaje del error contiene el identificador del artículo rechazado
    And el mensaje del error contiene el nombre del campo prohibido
    And no se renderiza ningún artículo del catálogo
    And la misma validación falla igual si el campo declarado es la firma o las iniciales, y sea cual sea el nombre declarado

  @s26
  Scenario: El validador rechaza precios, teléfonos, porcentajes de eficacia y promesas de resultado
    Given un artículo de demostración por cada uno de estos textos prohibidos en su cuerpo:
      | 49 €                                     |
      | llama al 640 22 11 90                    |
      | reduce el riesgo por encima del 90 %     |
      | garantiza la curación                    |
      | Urgencias 24 h                           |
    When se valida cada uno de esos artículos
    Then cada validación falla lanzando un error
    And el mensaje de cada error contiene el texto prohibido encontrado
    And ninguno de esos artículos llega a renderizarse
    And un artículo cuyo cuerpo no contiene ninguno de esos textos pasa la validación
    And la lista de patrones prohibidos que declara el validador contiene exactamente estos 5 y ningún otro

  @s27
  Scenario: Ningún artículo habla en nombre de la clínica ni hereda nada del prototipo
    Given el visitante recorre el texto completo del listado y de los seis artículos publicados
    When se inspecciona todo ese texto y todos sus destinos
    Then el texto recorrido no está vacío y contiene el título de cada uno de los seis artículos del catálogo
    And no aparece "Galapavet" dentro del texto de ningún artículo
    And no aparece "nuestra clínica", ni "nuestro equipo", ni "en consulta atendemos", ni "recomendamos"
    And no aparece "Veterinaria La Sierra", ni "Miraflores", ni "Ctra. de la Sierra"
    And no aparece "640 22 11 90", ni "918 44 21 60", ni "640221190", ni "918442160"
    And no aparece "24 h", ni "24h", ni "todos los días del año"
    And no aparece el símbolo "€", ni el símbolo "%"
    And no aparece ningún nombre de servicio que no esté entre los cinco bloques publicados por el cliente

  @s28
  Scenario: Las imágenes son locales y solo describen lo que se ve
    Given el visitante abre la dirección "/blog/demo-1"
    When se inspeccionan todas las imágenes del listado y del artículo
    Then se han inspeccionado exactamente 3 imágenes: la del cuerpo del artículo y las 2 miniaturas del bloque "Sigue leyendo"
    And el atributo "src" de cada imagen es una ruta del propio sitio
    And ninguna imagen apunta a "images.pexels.com" ni a ningún otro host externo
    And el texto alternativo de la imagen del artículo no está vacío y no afirma ningún servicio
    And las miniaturas del bloque "Sigue leyendo" son decorativas: su texto alternativo está vacío y no aportan nombre accesible al enlace
    And la página no realiza ninguna petición automática a un tercero

  @s29
  Scenario: El desplazamiento al cambiar de vista respeta la preferencia de movimiento
    Given la lógica de desplazamiento consulta la preferencia de movimiento del visitante
    When se calcula el comportamiento de desplazamiento para cada preferencia
    Then el resultado es, respectivamente, exactamente:
      | preferencia declarada       | comportamiento |
      | reducir el movimiento       | auto           |
      | sin preferencia declarada   | smooth         |

  # ---------------------------------------------------------------------------
  # E. CIERRES DE COBERTURA (reparación del 18/08/2026 contra la revisión adversarial)
  # ---------------------------------------------------------------------------

  @s30
  Scenario: Caso límite — con más de tres candidatos, «Sigue leyendo» nunca ofrece más de 3
    Given una categoría de demostración con 5 artículos en este orden, uno de ellos el artículo actual:
      | identificador | es el artículo actual |
      | otro-1        | no                     |
      | otro-2        | no                     |
      | actual        | sí                     |
      | otro-3        | no                     |
      | otro-4        | no                     |
    When se renderiza el bloque de artículos relacionados del artículo actual
    Then bajo el encabezado de nivel 2 "Sigue leyendo" hay exactamente 3 enlaces
    And esos 3 enlaces apuntan, en este orden, a "otro-1", "otro-2" y "otro-3"
    And ninguno de esos enlaces apunta a "otro-4"

  @s31
  Scenario: El tiempo de lectura calculado se muestra en una página de artículo real
    Given el artículo "demo-2" declara un cuerpo con exactamente 200 palabras
    When el visitante abre la dirección "/blog/demo-2"
    Then dentro del elemento con rol "article" aparece el texto "1 min"
