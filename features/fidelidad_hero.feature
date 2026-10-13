# =============================================================================
# ENMENDADO 13/10/2026 (feature 48, `hero_reducido_con_animacion`) — LOS TRES
# ESCENARIOS DE ESTE FICHERO SE REESCRIBEN. Sus @sN se conservan.
#
# QUÉ CAMBIÓ Y POR QUÉ. Los tres describían el hero ANTERIOR: todo centrado, con
# una píldora de ubicación, dos botones y una banda de cuatro cifras. Pablo pidió el
# 13/10/2026 (punto 3 de su encargo) reducir el hero a tres elementos —el
# titular, el párrafo y el botón «Reservar cita»— desplazados a la izquierda, y
# «todo el resto de elementos de ese giro central los eliminas». Las palabras
# clave de cada escenario viejo («centra», «cifras», «acciones») son lo que se va.
#
# QUÉ NO DUPLICA ESTE FICHERO. «Exactamente tres elementos, y ni píldora ni
# llamada ni horario ni cifras» lo fija en jsdom hero_reducido_con_animacion @s1.
# Aquí se mide lo que solo se ve en navegador real: dónde están, que no se recortan
# y que caben en 320 px. Los valores de la animación viven en
# hero_reducido_con_animacion @s5-@s7 y @s9.
#
# MEDIR CON LA ENTRADA YA TERMINADA. La entrada dura 940 ms y estos escenarios
# miden cajas: medirlas mientras se mueven daría un verde o un rojo según la
# máquina. Su «Given» lo dice, y hero_reducido_con_animacion @s10 obliga al spec.
#
# La historia de usuario decía literalmente: «Como visitante quiero entender desde
# el primer vistazo dónde estoy y cómo contactar para que la bienvenida tenga la
# jerarquía y presencia del diseño aprobado.» El hero ya no ofrece «cómo
# contactar» por teléfono: ofrece reservar.
# =============================================================================

Feature: Fidelidad visual de la bienvenida
  Como visitante quiero entender desde el primer vistazo quién es Galapavet y cómo
  reservar para que la bienvenida tenga la jerarquía y presencia del diseño aprobado.

  # @s1 REESCRITO ENTERO (13/10/2026, feature 48). Texto literal retirado:
  #     Scenario: El hero centra todos sus elementos y muestra las dos acciones
  #       Given la portada renderizada a 1440 píxeles de ancho
  #       When se inspecciona la sección de bienvenida
  #       Then la localidad real derivada de la fuente única se muestra en una píldora centrada
  #       And el titular, el subtítulo y la botonera están centrados dentro de la sección
  #       And existe una acción principal hacia la reserva y una acción secundaria hacia un contacto real
  #       And los dos botones muestran relleno horizontal y ninguno corta su texto
  # QUÉ SE CONSERVA: que el hero es de ancho completo (a sangre), y que el botón
  # muestra relleno horizontal y no corta su texto. QUÉ SE VA: la píldora, el
  # centrado y la acción secundaria. QUÉ ENTRA: la alineación a la izquierda, a ras
  # de la marca, en la columna de 1220 px (valor por defecto de las decisiones
  # §6.2, abierto a veto hasta la firma).
  #
  # POR QUÉ SE MIDE EL BORDE Y TAMBIÉN `text-align`. Un bloque a todo el ancho de
  # la columna con `text-align: center` arranca exactamente en el borde de la
  # columna y se ve centrado. Medir solo la caja daría verde sobre un hero centrado.
  # Medir solo `text-align` daría verde sobre un bloque estrecho puesto a la
  # derecha. Se piden las dos cosas.
  #
  # POR QUÉ A TRES ANCHOS, Y QUÉ SE EXIGE EN CADA UNO. A 1440 la columna de 1220 deja
  # 110 px a cada lado, y ahí el borde izquierdo de los tres coincide con el de la
  # MARCA de la cabecera (fidelidad_cabecera @s1 fija esa columna). A 1024 y a 375 el
  # borde lo pone el sangrado lateral, y la posición de la marca depende de la
  # cabecera, que es territorio de la feature 49 y que ningún contrato fija a esos
  # anchos: para no acoplar la 48 a ella, ahí solo se exige que los tres elementos
  # compartan el mismo borde izquierdo ENTRE SÍ y que sea el de las demás secciones.
  # Es una AMPLIACIÓN respecto a las decisiones §6.2 (que solo hablan de 1440) y
  # está declarada en el resumen.
  #
  # PUERTA QUE MUERDE (`tests/e2e/fidelidad-hero.spec.ts`, navegador real). El
  # contenedor vuelve a `margin-inline: auto` con `width: min(100% - …, 900px)`: a
  # 1440 el borde izquierdo queda a 270 px y no a 110. El contenido vuelve a
  # `align-items: center` o a `text-align: center`: falla `text-align` o el borde.
  # Se añade un segundo botón: la botonera deja de tener una sola acción.
  @s1
  Scenario: El hero alinea a la izquierda sus tres elementos y ofrece una única acción
    Given la portada renderizada a 1440 píxeles de ancho, con la entrada animada ya terminada o con movimiento reducido
    When se inspecciona la sección de bienvenida
    Then el titular, el párrafo y el botón "Reservar cita" son los tres únicos elementos de contenido visibles de la sección
    And el borde izquierdo de cada uno de los tres coincide, con una tolerancia de 1 píxel, con el borde izquierdo de la marca de la cabecera, que es el borde izquierdo de la columna de 1220 píxeles
    And el "text-align" computado del titular y del párrafo es "start" o "left", nunca "center"
    And a 1024 y a 375 píxeles de ancho los tres comparten el mismo borde izquierdo, con una tolerancia de 1 píxel, y ese borde es el del contenido de la sección de servicios: el sangrado lateral es el del resto de secciones
    And la botonera tiene exactamente una acción, con destino "#reservar", con relleno horizontal y sin cortar su texto
    And la sección conserva su ancho completo, a sangre, desde el borde izquierdo de la ventana

  # @s2 REESCRITO (13/10/2026, feature 48). Texto literal retirado:
  #     Scenario: La banda inferior del hero se ve completa y usa solo cifras derivadas
  #       Given la sección de bienvenida está lista para verse en un navegador de escritorio
  #       When se mide el último contenido de la sección
  #       Then las cuatro cifras derivadas por "construirCifrasBienvenida" se ven por completo antes de terminar el hero
  #       And el hero no recorta contenido verticalmente
  #       And no se muestra una cifra de antigüedad, reputación, volumen o equipo que no provenga de los datos publicados
  # QUÉ SE VA: la banda y la función que la derivaba (`construirCifrasBienvenida`
  # desaparece con `Hero-logica.ts`). QUÉ SE CONSERVA, tal cual: «el hero no recorta
  # contenido verticalmente». QUÉ SE ADAPTA: lo que antes era «las cifras se ven por
  # completo antes de terminar el hero» pasa a ser lo mismo del ÚLTIMO contenido del
  # hero, que ahora es el botón. La tercera cláusula, que vetaba cifras no
  # publicadas, se endurece al límite: el hero ya no tiene NINGUNA cifra, y un
  # teléfono o un horario también son dígitos.
  #
  # PUERTA QUE MUERDE: vuelve la banda, el teléfono o el horario: aparece un dígito
  # en el texto. El hero crece y recorta el botón: falla la primera cláusula.
  @s2
  Scenario: El hero se ve completo, sin recortar contenido ni mostrar ninguna cifra
    Given la sección de bienvenida está lista para verse en un navegador de escritorio, con la entrada animada ya terminada o con movimiento reducido
    When se mide el último contenido de la sección
    Then el botón "Reservar cita" se ve por completo antes de terminar el hero
    And el hero no recorta contenido verticalmente
    And el texto de la sección no contiene ningún dígito: ninguna cifra de antigüedad, reputación, volumen o equipo, ni teléfono, ni horario

  # @s3 REESCRITO (13/10/2026, feature 48). Texto literal retirado:
  #     Scenario: El hero se adapta a móvil sin ocultar acciones ni crear una barra horizontal
  #       Given una ventana de 320 píxeles de ancho
  #       When se carga la portada en su posición inicial
  #       Then la píldora, el titular, las acciones y la banda de cifras siguen siendo visibles y alcanzables
  #       And el documento no tiene desbordamiento horizontal
  # QUÉ SE VA: la píldora, la banda de cifras y el plural de «acciones». QUÉ SE
  # CONSERVA: titular y acción visibles y alcanzables, y sin barra horizontal. QUÉ
  # SE AÑADE: que las cajas de los tres elementos caben en la ventana. Con la
  # entrada animada el titular parte 40 px a la izquierda de su sitio; ya terminada
  # no puede quedar nada fuera. Lo que pasa DURANTE la entrada lo fija
  # hero_reducido_con_animacion @s9.
  #
  # PUERTA QUE MUERDE: el titular pasa a tener un ancho fijo de 720 px y a 320 px
  # sobresale por la derecha: falla la cláusula de las cajas. La de la barra
  # horizontal NO cae por esto: con `overflow: hidden` el hero recorta el titular y
  # no crea barra (medido); esa cláusula es una antirregresión, no el detector.
  @s3
  Scenario: El hero se adapta a móvil sin ocultar la acción ni crear una barra horizontal
    Given una ventana de 320 píxeles de ancho, con la entrada animada ya terminada o con movimiento reducido
    When se carga la portada en su posición inicial
    Then el titular, el párrafo y el botón siguen siendo visibles y alcanzables
    And las cajas de los tres quedan dentro de la ventana, de 0 a 320 píxeles
    And el documento no tiene desbordamiento horizontal
