# =============================================================================
# seo_estructura — SEO técnico y datos estructurados
# =============================================================================
#
# FUENTE DEL COMPORTAMIENTO
# -------------------------
# - Estudio de prospección del cliente (`Exploración WEB actual.docx`), que
#   califica literalmente el SEO de la web vigente como «SEO inexistente».
#   Esta feature es la respuesta directa a ese hallazgo.
# - project-spec.md → «Transversales → seo_estructura»: lang, metadatos,
#   Open Graph y JSON-LD con el tipo Schema.org correcto para una clínica
#   veterinaria, alimentado por la fuente única.
# - project-spec.md → Invariante 2 (`dato-de-negocio-en-fuente-unica-canonica`):
#   el dato se escribe una vez en `src/lib/site.ts` y TODAS sus formas
#   derivadas —texto visible y JSON-LD entre ellas— se calculan de él.
#   De ahí sale el escenario clave @s10 y su cierre @s11.
# - project-spec.md → Decisión 2 (se elimina todo el reclamo «Urgencias 24 h»)
#   y Decisión 9 / Invariante 3 (cero peticiones automáticas a terceros).
# - project-spec.md → Decisión 13 (18/08/2026, tras revisión adversarial): el
#   alcance de esta feature se amplía de 4 a 6 páginas. Se añaden las dos
#   vistas de detalle —ficha de campaña, artículo del blog—, que ya tienen URL
#   propia y que accesibilidad.feature ya audita como páginas independientes.
#   Cada vista de detalle necesita título y descripción propios, con la misma
#   exigencia que las 4 páginas originales. Ver @s4, @s5, @s12 y @s19.
# - feature_list.json → feature 15, sus 4 criterios de aceptación.
# - docs/datos-galapavet.md → ÚNICA fuente admitida de datos de negocio:
#   §1 identidad, §2 NAP, §3 horario, §8 reputación, §9 datos NO publicados.
#
# RELACIÓN CON EL CONTRATO HEREDADO
# ---------------------------------
# Feature NUEVA. Verificado uno a uno el contenido de docs/contrato-heredado/
# (13 ficheros: barra_urgencias, cabecera_y_navegacion, campanas, equipo, faq,
# formulario_contacto, galeria, hero, informacion_contacto, pie_de_pagina,
# reserva_chat, selector_paleta, servicios): NO existe contrato heredado de
# seo_estructura. El prototipo «Veterinaria La Sierra» no destiló ninguna
# feature de SEO, que es justamente lo que el cliente real necesita. No hay,
# por tanto, interacción aprobada que respetar ni datos que sustituir: todo
# lo que sigue se destila desde cero contra docs/datos-galapavet.md.
#
# INVESTIGACIÓN EN DOCUMENTACIÓN OFICIAL (consultada el 17/08/2026)
# ----------------------------------------------------------------
# 1) TIPO SCHEMA.ORG EXACTO — https://schema.org/VeterinaryCare
#    Definición literal: «A vet's office.» Su jerarquía, leída en la propia
#    página del vocabulario, es UNA sola rama:
#        Thing > Organization > MedicalOrganization > VeterinaryCare
#    https://schema.org/MedicalOrganization confirma que MedicalOrganization
#    desciende de Organization y NO de LocalBusiness, y lista VeterinaryCare
#    entre sus subtipos directos.
#
#    CONSECUENCIA DE DISEÑO (el hallazgo que manda en esta feature):
#    `VeterinaryCare` por sí solo NO hereda `openingHoursSpecification` ni
#    `geo`. Según https://schema.org/LocalBusiness, LocalBusiness sí las tiene
#    porque tiene doble rama —Thing > Organization > LocalBusiness y
#    Thing > Place > LocalBusiness— y ambas propiedades entran por `Place`.
#    Por eso el nodo se declara con tipo MÚLTIPLE:
#        "@type": ["VeterinaryCare", "LocalBusiness"]
#    `VeterinaryCare` aporta la precisión semántica (es una clínica
#    veterinaria, no un comercio genérico) y `LocalBusiness` aporta horario y
#    geolocalización. Declarar solo `VeterinaryCare` dejaría el horario fuera
#    del vocabulario; declarar solo `LocalBusiness` perdería el tipo exacto.
#    Ver @s8.
#
# 2) PROPIEDADES CORRECTAS (nombres exactos verificados en el vocabulario)
#    - Dirección postal — https://schema.org/PostalAddress:
#      `streetAddress`, `postalCode`, `addressLocality`, `addressRegion`,
#      `addressCountry`.
#    - Teléfono — https://schema.org/LocalBusiness: `telephone` (Text).
#    - Horario — https://schema.org/OpeningHoursSpecification:
#      `dayOfWeek` (enumeración DayOfWeek: Monday…Sunday), `opens` y `closes`
#      (tipo Time, formato de 24 horas).
#    - Geolocalización — https://schema.org/GeoCoordinates:
#      `latitude` y `longitude` (WGS 84).
#    - Requisitos del consumidor —
#      https://developers.google.com/search/docs/appearance/structured-data/local-business
#      declara `name` y `address` como obligatorias, y `geo`,
#      `openingHoursSpecification`, `telephone` y `url` como recomendadas.
#
# 3) DÍA CERRADO Y JORNADA PARTIDA
#    La documentación de Google indica, literalmente, que para marcar un día
#    entero cerrado se ponen `opens` y `closes` a `00:00`. AQUÍ NO SE USA esa
#    forma: el domingo simplemente NO se emite. Motivo: la propiedad es una
#    lista de tramos de apertura; un día sin tramo ya significa cerrado, y
#    emitir un tramo `00:00`–`00:00` es ruido que algunos validadores leen
#    como apertura a medianoche. Regla del proyecto: lo que no hay, se omite,
#    no se emite vacío (§ @s14, @s16, @s17).
#    La jornada partida (mañana y tarde con corte al mediodía) no está cubierta
#    por los ejemplos de Google; se resuelve con la vía estándar del
#    vocabulario: DOS entradas `OpeningHoursSpecification` para los mismos
#    días. De ahí los 3 tramos exactos de @s13.
#
# 4) IDIOMA — ESPAÑOL DE ESPAÑA
#    https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes
#    delega el valor de `lang` en BCP 47.
#    https://www.w3.org/International/questions/qa-choosing-language-tags
#    fija que BCP 47 está documentado en RFC 5646, que la subetiqueta de región
#    solo se añade cuando aporta una distinción útil, y que por convención la
#    subetiqueta de idioma va en minúscula y la de región en MAYÚSCULA.
#    Valor adoptado: `es-ES` (guion). Se incluye la región porque el negocio es
#    local de Galapagar (Madrid) y la distinción frente a otras variedades del
#    español sí es informativa para un negocio de proximidad.
#    TRAMPA DOCUMENTADA: Open Graph usa OTRO separador. https://ogp.me/ define
#    `og:locale` «Of the format language_TERRITORY» — es decir `es_ES` con
#    GUION BAJO, no `es-ES`. Los dos valores conviven en la misma página con
#    separadores distintos y no son intercambiables. Ver @s1 y @s20.
#    ogp.me declara además como obligatorias `og:title`, `og:type`, `og:image`
#    y `og:url`.
#
# 5) COINCIDENCIA CON LO VISIBLE
#    https://developers.google.com/search/docs/appearance/structured-data/sd-policies
#    lo exige literalmente: «Don't mark up content that is not visible to
#    readers of the page» y «Don't mark up irrelevant or misleading content».
#    En este proyecto la garantía no es una revisión manual: es estructural,
#    porque bloque y texto visible se derivan del MISMO campo de la fuente
#    única. @s10 lo comprueba y @s11 lo blinda contra la divergencia futura.
#
# DATOS QUE ALIMENTAN EL BLOQUE (todos de docs/datos-galapavet.md)
# ---------------------------------------------------------------
#   name .............. Galapavet                              (§1)
#   descriptor ........ Centro integral veterinario            (§1)
#   streetAddress ..... Carretera de Torrelodones, 11          (§2, VERIFICADA)
#   postalCode ........ 28260                                  (§2)
#   addressLocality ... Galapagar                              (§2)
#   addressRegion ..... Madrid                                 (§2)
#   telephone ......... 91 082 92 67 — el PRIMERO de los dos    (§2)
#                       teléfonos de la clínica; NUNCA el móvil
#                       685 34 31 49 ni el de urgencias (schema.org
#                       `telephone` es un único valor Text, no una
#                       lista: hay que elegir uno). Ver @s10.
#   urgencias ......... 91 851 13 93 (fuera de horario; NO       (§2)
#                       alimenta la propiedad `telephone`)
#   horario ........... L-V 11:00-14:00 y 16:30-20:00 ·
#                       Sáb 11:00-14:00 · Dom CERRADO          (§3)
#
# PENDIENTE (lo que NO he podido verificar y por tanto NO se emite)
# ----------------------------------------------------------------
# - PENDIENTE: COORDENADAS GEOGRÁFICAS. docs/datos-galapavet.md §9 las lista
#   expresamente entre los datos que el cliente NO publica, y project-spec.md
#   las recoge como Riesgo abierto 2. La dirección postal SÍ está verificada;
#   la latitud y la longitud NO. En consecuencia la propiedad `geo` se OMITE
#   por completo (@s15). Falta: que el cliente confirme el par lat/long exacto
#   de Carretera de Torrelodones, 11, o leerlo de una fuente primaria. Hasta
#   entonces, ningún escenario de esta feature puede exigir `geo`.
# - PENDIENTE: `addressCountry`. Se emite `ES` (código ISO 3166-1 alfa-2 de
#   España). No es un dato de negocio nuevo, es la codificación del país que ya
#   se deduce de la dirección verificada (28260 Galapagar, Madrid); se deja
#   anotado para que el `judge` lo revise como derivación y no como invención.
# - PENDIENTE: prefijo internacional del teléfono. Si la fuente única emite el
#   teléfono en forma internacional (`+34`…), el `+34` es derivación del país
#   verificado, no un dato nuevo. Por eso @s10 compara DÍGITOS ignorando
#   espacios y prefijo, en vez de fijar un literal internacional que yo no he
#   leído en ninguna fuente primaria.
# - PENDIENTE: email de contacto y perfiles de redes sociales. §9 los declara
#   no publicados, verificados por ausencia. Las propiedades `email` y `sameAs`
#   NO se emiten (@s16).
# - PENDIENTE: número de registro del centro y años de actividad (§7). No se
#   emiten en ninguna forma.
# - La valoración de Google (4,6 ★ · 189 reseñas, §8) es un dato VIVO y con
#   fecha. No se hornea en el bloque estructurado (@s18).
#
# NOTA PARA EL tdd_craftsman
# --------------------------
# Los `Then` de este contrato se afirman sobre el ATRIBUTO del documento, el
# ROL y el NOMBRE ACCESIBLE del elemento visible, y sobre el JSON YA PARSEADO.
# Ningún escenario depende de una clase CSS ni de un estilo: la suite corre con
# los CSS Modules desactivados. «El bloque de datos estructurados» designa el
# contenido estructurado que la página publica para máquinas; se comprueba
# parseándolo, nunca comparando cadenas de texto crudo.
# La construcción del bloque y la validación de metadatos son decisión pura y
# viven en un módulo `*-logica.ts` (Invariante 6), que es lo que muerde la
# prueba de mutación.
# =============================================================================

Feature: SEO técnico y datos estructurados
  Como responsable de Galapavet quiero que los buscadores y los asistentes
  entiendan quién soy, dónde estoy y cuándo abro, para dejar de ser invisible
  como señala el estudio de prospección, sin que lo que lee una máquina pueda
  contradecir nunca lo que lee una persona.

  # ---------------------------------------------------------------------------
  # Declaraciones del documento
  # ---------------------------------------------------------------------------

  @s1
  Scenario: El documento declara español de España con la sintaxis de BCP 47
    Given la web publicada
    When cargo la página de inicio
    Then el atributo "lang" del elemento raíz del documento es exactamente "es-ES"
    And la subetiqueta de idioma está en minúscula y la de región en mayúscula
    And el separador es un guion, no un guion bajo

  @s2
  Scenario: El documento declara la codificación de caracteres UTF-8
    Given la web publicada
    When cargo la página de inicio
    Then el documento declara la codificación de caracteres "utf-8"
    And esa declaración aparece antes de cualquier contenido de texto de la página

  @s3
  Scenario: El documento declara un viewport adaptable
    Given la web publicada
    When cargo la página de inicio
    Then el documento declara un viewport con ancho igual al ancho del dispositivo
    And con escala inicial 1
    And el viewport no impide al visitante ampliar el contenido

  # ---------------------------------------------------------------------------
  # Metadatos propios de cada página
  # ---------------------------------------------------------------------------

  @s4
  Scenario: Cada página publicada tiene un título propio, distinto y reconocible como suyo
    Given las seis páginas publicadas: inicio, campañas, ficha de campaña, blog, artículo del blog y tienda
    When recojo el título de cada una de ellas
    Then obtengo exactamente seis títulos
    And ninguno de los seis es una cadena vacía ni solo espacios
    And no hay dos títulos iguales entre sí
    And cada título contiene el nombre "Galapavet"
    And además, cada título contiene un fragmento exclusivo de su propia página, en este orden:
      | Galapagar  |
      | prevención |
      | Ficha      |
      | Blog       |
      | Artículo   |
      | Tienda     |
    And ninguno de esos seis fragmentos aparece en el título de una página distinta a la suya

  @s5
  Scenario: Cada página publicada tiene una descripción propia, distinta y reconocible como suya
    Given las seis páginas publicadas: inicio, campañas, ficha de campaña, blog, artículo del blog y tienda
    When recojo la descripción de cada una de ellas
    Then obtengo exactamente seis descripciones
    And ninguna de las seis es una cadena vacía ni solo espacios
    And no hay dos descripciones iguales entre sí
    And además, cada descripción contiene un fragmento exclusivo de su propia página, en este orden:
      | Galapagar  |
      | prevención |
      | Ficha      |
      | Blog       |
      | Artículo   |
      | Tienda     |
    And ninguno de esos seis fragmentos aparece en la descripción de una página distinta a la suya

  @s6
  Scenario: Dos páginas con la misma descripción hacen fallar la validación nombrando el duplicado
    Given un conjunto de páginas en el que la página de blog y la de tienda declaran la misma descripción
    When se valida el conjunto de metadatos
    Then la validación falla
    And el mensaje de fallo nombra la descripción duplicada
    And el mensaje de fallo nombra las dos páginas que la comparten

  # ---------------------------------------------------------------------------
  # El bloque de datos estructurados
  # ---------------------------------------------------------------------------

  @s7
  Scenario: Cada página publica un único bloque de datos estructurados y es JSON válido
    Given la web publicada
    When cargo la página de inicio
    Then la página contiene exactamente un bloque de datos estructurados
    And el contenido del bloque se parsea como JSON sin lanzar ningún error
    And el resultado del parseo es un objeto, no una cadena ni una lista

  @s8
  Scenario: El bloque declara el tipo exacto de una clínica veterinaria y el que aporta horario
    Given la web publicada
    When leo el bloque de datos estructurados de la página de inicio
    Then el bloque declara el vocabulario de schema.org como contexto
    And el tipo declarado incluye "VeterinaryCare"
    And el tipo declarado incluye "LocalBusiness"
    And el tipo declarado no incluye ningún otro valor

  @s9
  Scenario: La dirección se emite con las propiedades de dirección postal del vocabulario
    Given la web publicada
    When leo la dirección del bloque de datos estructurados
    Then la dirección se declara con el tipo "PostalAddress"
    And su calle es exactamente "Carretera de Torrelodones, 11"
    And su código postal es exactamente "28260"
    And su localidad es exactamente "Galapagar"
    And su región es exactamente "Madrid"
    And su país es exactamente "ES"

  # ---------------------------------------------------------------------------
  # ESCENARIOS CLAVE: máquina y persona no pueden divergir
  # ---------------------------------------------------------------------------

  @s10
  Scenario: Lo que lee la máquina coincide con lo que lee la persona
    Given la página de inicio con su panel de información de contacto visible
    When comparo el bloque de datos estructurados con el contenido visible de la página
    Then el nombre declarado en el bloque coincide carácter a carácter con el nombre visible de la clínica
    And la calle declarada coincide carácter a carácter con la calle del texto visible de la dirección
    And el código postal y la localidad declarados coinciden con los del texto visible de la dirección
    And el teléfono declarado tiene exactamente los mismos dígitos, y en el mismo orden, que el nombre accesible del PRIMERO de los dos enlaces de teléfono visibles del panel de contacto —el de la clínica, "91 082 92 67"—, ignorando espacios y prefijo internacional
    And ese teléfono declarado nunca coincide con el segundo enlace de teléfono visible ni con el enlace de teléfono de urgencias
    And cada uno de los tres tramos declarados —lunes a viernes de 11:00 a 14:00, lunes a viernes de 16:30 a 20:00, y sábado de 11:00 a 14:00— aparece como subcadena dentro del texto visible del horario, aunque el texto visible junte los dos tramos de lunes a viernes en una sola línea
    And el texto visible del horario no muestra ningún horario de apertura que no esté respaldado por alguno de esos tres tramos declarados

  @s11
  Scenario: Cambiar el dato en la fuente única mueve a la vez el bloque y el texto visible
    Given una fuente única de datos de negocio en la que la calle se ha sustituido por otro valor
    When se genera de nuevo la página de inicio
    Then el texto visible de la dirección muestra el valor nuevo
    And la calle del bloque de datos estructurados muestra ese mismo valor nuevo
    And no queda en la página ninguna aparición del valor anterior

  @s12
  Scenario: El bloque describe el mismo negocio en todas las páginas
    Given las seis páginas publicadas: inicio, campañas, ficha de campaña, blog, artículo del blog y tienda
    When leo el bloque de datos estructurados de cada una de ellas
    Then los seis bloques declaran el mismo nombre, la misma dirección y el mismo teléfono
    And los seis bloques declaran el mismo conjunto de tramos de horario

  # ---------------------------------------------------------------------------
  # Horario: el cliente cierra los domingos
  # ---------------------------------------------------------------------------

  @s13
  Scenario: El horario se emite como los tres tramos que el cliente publica
    Given la web publicada
    When leo los tramos de horario del bloque de datos estructurados
    Then hay exactamente tres tramos
    And un tramo cubre de lunes a viernes y abre a las "11:00" y cierra a las "14:00"
    And otro tramo cubre de lunes a viernes y abre a las "16:30" y cierra a las "20:00"
    And el tercer tramo cubre solo el sábado y abre a las "11:00" y cierra a las "14:00"
    And cada tramo se declara con el tipo "OpeningHoursSpecification"

  @s14
  Scenario: El bloque no declara ningún horario de domingo porque la clínica cierra
    Given la web publicada
    When leo los tramos de horario del bloque de datos estructurados
    Then ningún tramo incluye el domingo entre sus días
    And no existe ningún tramo cuya hora de apertura sea igual a su hora de cierre
    And el bloque no declara el domingo bajo ninguna otra forma

  # ---------------------------------------------------------------------------
  # Casos límite: lo que no hay se omite, nunca se emite vacío
  # ---------------------------------------------------------------------------

  @s15
  Scenario: Sin coordenadas verificadas la geolocalización se omite en vez de emitirse a cero
    Given una fuente única sin coordenadas geográficas, porque el cliente no las publica
    When se genera el bloque de datos estructurados
    Then el bloque no contiene ninguna propiedad de geolocalización
    And el bloque no contiene ninguna latitud ni ninguna longitud
    And no se emite ninguna coordenada con valor cero ni con cadena vacía
    And la dirección postal sí se emite completa

  @s16
  Scenario: Un dato opcional ausente en la fuente única omite su propiedad en vez de emitirla vacía
    Given una fuente única sin email de contacto y sin perfiles de redes sociales
    When se genera el bloque de datos estructurados
    Then el bloque no contiene ninguna propiedad de email
    And el bloque no contiene ninguna propiedad de perfiles externos
    And ninguna propiedad del bloque tiene por valor una cadena vacía, una lista vacía ni un valor nulo

  @s17
  Scenario: Una lista de tramos de horario vacía omite la propiedad entera
    Given una fuente única cuya lista de tramos de horario está vacía
    When se genera el bloque de datos estructurados
    Then el bloque no contiene ninguna propiedad de horario
    And el bloque no contiene una lista de tramos vacía
    And el bloque sigue conteniendo el nombre y la dirección

  @s18
  Scenario: La valoración de Google no se hornea en el bloque por ser un dato vivo
    Given la web publicada
    When leo el bloque de datos estructurados de la página de inicio
    Then el bloque no contiene ninguna propiedad de valoración agregada
    And el bloque no contiene ninguna puntuación ni ningún recuento de reseñas
    And el bloque no contiene ningún número de registro sanitario ni año de fundación

  # ---------------------------------------------------------------------------
  # Decisión 2: no existe el reclamo de urgencias 24 h
  # ---------------------------------------------------------------------------

  @s19
  Scenario: Ningún metadato anuncia urgencias 24 h ni ningún otro reclamo del prototipo descartado
    Given las seis páginas publicadas: inicio, campañas, ficha de campaña, blog, artículo del blog y tienda
    When reviso el título, la descripción y el bloque de datos estructurados de cada una
    Then ningún título contiene la expresión "24 h" ni la expresión "24 horas"
    And ninguna descripción contiene la expresión "24 h" ni la expresión "24 horas"
    And ningún título ni ninguna descripción contiene la expresión "todos los días del año" ni la expresión "desde 2013"
    And ningún tramo de horario del bloque cubre las veinticuatro horas del día
    And ningún tramo de horario del bloque cubre los siete días de la semana

  # ---------------------------------------------------------------------------
  # Open Graph
  # ---------------------------------------------------------------------------
  # ENMIENDA (25/08/2026): el `Then` de "og:image" exigía originalmente una
  # ruta RELATIVA. Era un error de fidelidad al estándar: https://ogp.me/
  # define `og:image` como tipo `URL`, que la propia especificación aclara
  # ABSOLUTA. Señalado como PENDIENTE 7 en `features/identidad_visual.feature`
  # (feature 22, ya `done`) al descubrir la contradicción entre este contrato
  # y `MetadatosPagina.tsx`; resuelto por el `craftsman_lead` en cuanto el
  # humano fijó el dominio final de publicación (GitHub Pages,
  # `cenit-digital.github.io`, repo `Cenit-Digital/GalapavetClinicaVeterinaria`).
  # El subpath `/GalapavetClinicaVeterinaria` que tendrá la Page de proyecto
  # es, a propósito, un problema de despliegue APARTE (aún sin resolver,
  # afecta a `vite.config.ts`/`BrowserRouter`) y no entra en esta enmienda.

  @s20
  Scenario: Open Graph se declara con el separador de locale que exige su especificación
    Given la web publicada
    When leo las declaraciones de Open Graph de la página de inicio
    Then se declara un título, un tipo, una imagen y una dirección de la página
    And ninguno de esos cuatro valores es una cadena vacía ni solo espacios
    And el locale declarado es exactamente "es_ES" con guion bajo
    And ese locale no coincide carácter a carácter con el atributo "lang" del documento, que usa guion
    And la imagen declarada es una URL absoluta, con esquema y dominio, tal y como exige https://ogp.me/ para el tipo "og:image"
    And esa URL absoluta usa el dominio real de publicación del sitio, "cenit-digital.github.io"
    And la imagen se sigue sirviendo desde el propio sitio, sin ninguna petición a un tercero

  # ---------------------------------------------------------------------------
  # Casos límite añadidos en reparación: la omisión de un dato ausente no
  # depende de que OTRO dato distinto también esté ausente (cierra el hueco
  # de mutación de operador lógico detectado en @s15 y @s16)
  # ---------------------------------------------------------------------------

  @s21
  Scenario: Con una sola de las dos coordenadas verificada la geolocalización se sigue omitiendo entera
    Given una fuente única con latitud verificada pero sin longitud, porque el cliente solo confirmó una de las dos
    When se genera el bloque de datos estructurados
    Then el bloque no contiene ninguna propiedad de geolocalización
    And el bloque no contiene ninguna latitud ni ninguna longitud
    And la dirección postal sí se emite completa

  @s22
  Scenario: Un dato opcional presente no impide omitir otro dato opcional que sigue ausente
    Given una fuente única con email de contacto pero sin ningún perfil de redes sociales
    When se genera el bloque de datos estructurados
    Then el bloque contiene la propiedad de email con ese valor
    And el bloque no contiene ninguna propiedad de perfiles externos
    And ninguna propiedad del bloque tiene por valor una cadena vacía, una lista vacía ni un valor nulo
