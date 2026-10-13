# =============================================================================
# POR QUÉ CAMBIA ESTE CONTRATO (20/09/2026)
# =============================================================================
# Decisión de Pablo del 20/09/2026, CORROBORADA en la grabación de la reunión
# con su socio Roberto Alonso del 16/08/2026 (`2026-08-16 16-14-50.mkv`;
# transcripción literal con marcas de tiempo en
# `progress/transcripcion_reunion_rober_20260816.txt` y tabla de decisiones en
# `progress/decisiones_reunion_rober_20260816.md`, puntos 3, 4 y 9):
#
#   - minuto 02:31 — «Evidentemente arriba le quitas lo de urgencias... todo
#     esto fuera».
#   - minuto 03:02-03:05 — «Urgencia fuera y esto también fuera... eso mueve lo
#     más a la izquierda».
#   - minuto 06:52-07:00 — «La urgencia se va afuera... y el resto se queda
#     como está». Dicho de la SECCIÓN DE CONTACTO: queda FUERA de esta tanda
#     (ver ALCANCE, abajo).
#
# Cuatro cambios, D1 a D4:
#
#   D1  La cabecera deja de tener CUALQUIER control de urgencias: ni el CTA de
#       escritorio ni el del panel móvil.
#   D2  La navegación de escritorio termina exactamente en el borde derecho de
#       la columna de contenido, en espejo con la marca, que arranca en su
#       borde izquierdo. Es consecuencia aritmética de D1 (la fila reparte con
#       `space-between` y pasa de tres hijos visibles a dos), pero HOY NO LO
#       MIDE NINGUNA PUERTA: todas las puertas de alineación del proyecto
#       comparan anchos y bordes IZQUIERDOS, nunca el derecho. Sin la cláusula
#       nueva de @s1, D2 no sería un contrato: sería una coincidencia.
#   D3  Entre el nombre "Galapavet" y su descriptor hay separación visible.
#       Hoy está MEDIDA en 0,00 px: las dos cajas se tocan.
#   D4  El acceso "Tienda" se parece al del prototipo —píldora visible más
#       baja, tinta fuerte y borde más suave— SIN perder el objetivo de
#       pulsación de 44×44 px que este mismo contrato ya exigía (@s2).
#
# -----------------------------------------------------------------------------
# D1 NO ES UN CONTRATO NUEVO: ES UNA RESTAURACIÓN
# -----------------------------------------------------------------------------
# `features/cabecera_y_navegacion.feature`, aprobada por el humano y `done`
# desde el 25/08/2026, YA EXIGE literalmente lo que pide D1:
#
#   - @s13: «el texto de la cabecera no contiene "Urgencias"», tampoco "24 h"
#     ni "640 22 11 90", y «ningún enlace de la cabecera tiene un destino que
#     empiece por "tel:"».
#   - @s7, última cláusula: «ningún elemento del panel tiene un nombre
#     accesible que contenga "Urgencias"».
#   - `features/pagina_blog.feature` @s2 dice lo mismo para el blog: «la
#     cabecera de esta página no contiene ningún enlace ni botón cuyo nombre
#     accesible contenga "Urgencias"».
#
# El 03/09/2026 ESTE contrato (`fidelidad_cabecera`) metió el CTA de urgencias
# en la cabecera y dejó los contratos en contradicción frontal entre sí, con
# dos tests afirmando lo contrario de lo que su propio Gherkin exige
# (`src/components/Cabecera.test.tsx` y `src/pages/PaginaBlog.test.tsx`).
# Además @s13 lleva desde entonces SIN UN SOLO TEST: es una puerta inerte.
# D1 no cambia de opinión: deroga la cláusula intrusa, restaura el contrato
# anterior y por fin le da cobertura ejecutable (@s5, aquí abajo). Es el mismo
# patrón con el que la retirada de la barra de urgencias resolvió, el
# 09/09/2026, la contradicción con `accesibilidad.feature` @s17.
#
# -----------------------------------------------------------------------------
# ALCANCE: SOLO LA CABECERA
# -----------------------------------------------------------------------------
# Esta tanda NO toca el acceso a urgencias fuera de la cabecera: ni la tarjeta
# de `InformacionContacto`, ni el pie, ni la FAQ, ni la confirmación del
# formulario de contacto, ni el chat de reserva, ni el dato de la fuente única.
# El punto 9 de la reunión («urgencias fuera también en Contacto») queda
# identificado como trabajo PENDIENTE de una decisión posterior del cliente.
#
# CONSECUENCIA QUE EL CONTRATO ASUME EXPLÍCITAMENTE: al retirar el CTA de la
# cabecera, el único acceso a urgencias que vive en el armazón común de las
# seis rutas es el PIE. `rediseno_visual.feature` @s14 sigue exigiendo que el
# rótulo real aparezca en el sitio, y su puerta lo comprueba en las seis rutas;
# a partir de ahora esa cobertura descansa en un solo punto. Por eso la última
# cláusula de @s5 lo afirma aquí, en vez de dejarlo a la suerte.
#
# -----------------------------------------------------------------------------
# ACTUALIZACIÓN DEL MISMO DÍA (20/09/2026, SEGUNDA TANDA) — EL ALCANCE DE
# ARRIBA SE QUEDÓ CORTO, Y HAY QUE DECIRLO ANTES DE LA PUERTA HUMANA
# -----------------------------------------------------------------------------
# El punto 9 de la reunión ya NO está pendiente: Pablo lo resolvió el mismo día,
# con la misma grabación del 16/08/2026 como respaldo (minutos 06:52-07:00, «La
# urgencia se va afuera... y el resto se queda como está»). En esa segunda tanda
# se retiran ADEMÁS la tarjeta de urgencias de la sección de contacto (E1,
# `features/informacion_contacto.feature`, `features/fidelidad_contacto.feature`)
# y el enlace de urgencias del pie (E2, `features/pie_de_pagina.feature`).
#
# Dos frases del párrafo anterior quedan DEROGADAS, y se corrigen en vez de
# dejarse:
#   1. «Esta tanda NO toca... ni la tarjeta de `InformacionContacto`, ni el
#      pie»: cierto para ESTA tanda, falso para el estado del sitio cuando las
#      dos lleguen juntas a la puerta humana. Las dos se aprueban a la vez.
#   2. «El único acceso a urgencias que vive en el armazón común de las seis
#      rutas es el PIE»: tras E2 no vive en NINGUNO. El armazón común se queda
#      sin ninguna mención de urgencias, y el texto visible inicial de las seis
#      rutas también (MEDIDO, ruta por ruta).
#
# Consecuencia directa sobre este fichero: la ÚLTIMA cláusula de @s5 —que esta
# tanda escribió a propósito para no dejar la cobertura a la suerte— se vuelve
# FALSA en las seis rutas. Se enmienda ahí mismo, con su nota. Lo que NO cambia
# es D1: la cabecera sigue sin ningún acceso a urgencias, y las cuatro primeras
# cláusulas de @s5 siguen siendo exactamente lo que Pablo pidió.
#
# -----------------------------------------------------------------------------
# TERCERA Y ÚLTIMA ACTUALIZACIÓN DEL MISMO DÍA (20/09/2026, TERCERA TANDA) —
# LO QUE PABLO DECIDIÓ DESPUÉS DE VER MEDICIONES E IMÁGENES
# -----------------------------------------------------------------------------
# Esta tanda NO rediscute D1-D4. Aplica cinco cosas nuevas y deja el conjunto
# coherente; tres caen sobre este fichero:
#
#   F3  El borde del acceso "Tienda" SÍ se suaviza. Pablo cambió su decisión al
#       saber que era barato. Camino APROBADO: el (a) de la nota de @s7 —mezcla
#       local sobre tokens que ya existen—. El camino (b), token nuevo, queda
#       CERRADO: no se abre el inventario congelado.
#       [SUPERADA el 13/10/2026 para la cabecera sobre la foto: ver la nota de @s7.]
#   G1  El @s4 que esta misma mañana se escribió para cazar el defecto de altura
#       de la cabecera NACÍA CIEGO: su «tolerancia de 1 píxel» absorbía
#       exactamente el defecto de 1 píxel que el sitio tiene HOY. Reescrito sin
#       ella, con la medición y el arreglo verificado en su nota.
#   G2  La cláusula que la PRIMERA tanda añadió por su cuenta a @s3 —importar al
#       panel móvil la píldora del acceso "Tienda"— se RETIRA: Pablo no la pidió
#       y va en dirección contraria al prototipo versionado. Ver su nota.
#
# Y una corrección de DATO que afecta a lo que este fichero afirma por escrito:
# F1 borra las dos filas de urgencia de la matriz de uso de color
# (`src/lib/diseno/matrizDeContraste.ts:363` y `:388`). La nota de @s7 decía «la
# matriz de uso clavada en 25 filas y 125 parejas»: desde hoy son 23 filas y 115
# parejas. Corregido ahí mismo, porque es el único número que el artesano leerá
# al elegir el camino del borde.
# =============================================================================

# =============================================================================
# CUARTA ACTUALIZACIÓN (13/10/2026, feature 49 `cabecera_sobre_el_hero`) — LA
# CABECERA DEJA DE SER UNA FRANJA TRANSLÚCIDA Y SE PONE ENCIMA DE LA FOTO
# =============================================================================
# Lo que Pablo decidió el 13/10/2026 (respuestas P2, P3 y P4 y los puntos 1 y 2 de
# su encargo; ver `progress/decisiones_cabecera_hero_20261013.md`) mueve cinco
# escenarios de este fichero. Cada uno lleva su nota con el texto literal retirado.
# El resto sigue como estaba:
#
#   @s1  REVISADO, sin cambio de letra.
#   @s2  REESCRITO: el objetivo pasa de 44 a 48 px, y se añade el tamaño de letra
#        de los ocho enlaces, que pasa de 12,8 a 16 px.
#   @s3  INTACTO. G2: el panel móvil se queda EXACTAMENTE como está.
#   @s4  UNA CLÁUSULA ENMENDADA: en la portada el primer contenido ya no arranca
#        «justo en el borde inferior de la cabecera», porque el hero sube bajo
#        ella a propósito. G1 sigue en pie en todo lo demás.
#   @s5  INTACTO.
#   @s6  REESCRITO en dos cláusulas: el color y el tamaño del texto de «Tienda».
#   @s7  REESCRITO: el borde de «Tienda» pasa a ser del color de su texto (se RETIRA la
#        suavidad F3 del 20/09/2026, decisión que vuelve a Pablo) y se mide contra
#        lo que hay detrás de verdad.
#
# La cabecera es TRANSPARENTE sobre la foto en la portada y SÓLIDA (tinta de la
# paleta, texto `sobre-primario`) en las demás rutas y al salir del hero. Todo lo
# nuevo vive en `cabecera_sobre_el_hero.feature`, que tiene el ÍNDICE DE
# TRAZABILIDAD. Lo que esa feature NO toca de este fichero: D1 (sin urgencias), D2
# (el borde derecho de la navegación), D3 (los 4 px entre nombre y descriptor), G2
# (el panel móvil) y el inventario de tokens, que sigue CERRADO.
# =============================================================================

Feature: Fidelidad visual de la cabecera
  Como visitante quiero reconocer la marca y llegar a las acciones principales
  desde una cabecera alineada con la portada y fiel al diseño aprobado.

  # CLÁUSULA ELIMINADA de @s1 (20/09/2026, Pablo; corroborado por Roberto
  # Alonso en la grabación del 16/08/2026, minutos 02:31 y 03:02-03:05). Decía
  # literalmente: «And su acceso a urgencias comunica exactamente el rótulo
  # real de urgencias fuera de horario y su teléfono real». Se retira porque la
  # cabecera deja de tener control de urgencias (D1).
  #
  # CORREGIDO EL MISMO DÍA (20/09/2026, segunda tanda): esta nota decía «El
  # acceso a urgencias NO se pierde: vive en el pie —presente en las seis
  # rutas— y en la tarjeta de contacto de la portada, y @s5 de este mismo
  # contrato lo exige por escrito». E1 y E2 retiran los dos, así que la frase
  # es falsa. Lo cierto: el DATO no se pierde —sigue en la fuente única, en el
  # FAQ, en la confirmación del formulario y en el chat de reserva—, pero deja
  # de estar accesible sin interactuar. Ver la ACTUALIZACIÓN del bloque de
  # cabecera y la nota de @s5.
  #
  # La cláusula del «bloque compacto» de la marca se REESCRIBE en el mismo
  # paso: decía «la marca muestra el logotipo real, el nombre "Galapavet" y su
  # descriptor en un bloque compacto», y "compacto" es prosa sin medida que hoy
  # se cumple con 0,00 px entre nombre y descriptor — es decir, el contrato
  # estaba bendiciendo el defecto que D3 viene a corregir.
  # @s1 REVISADO (13/10/2026, feature 49): SIN CAMBIO DE LETRA. Con el nav a 16 px y
  # la cabecera transparente sobre la foto siguen siendo ciertas todas sus
  # cláusulas: la cabecera arranca en el borde superior del área visible, la marca y
  # la navegación coinciden con los bordes de la columna de 1220 px (la fila reparte
  # con `space-between`, así que el borde derecho no depende del tamaño de letra) y
  # hay 4 px entre el nombre y el descriptor. LO QUE ESTE ESCENARIO NO VE, y es la
  # razón de que no baste: se mide a 1440 px, donde nada se comprime. Que a 1024 px
  # el descriptor no se trunque y la fila quepa lo fija `sistema_de_diseno_visual`
  # @s27 (enmendado el 13/10/2026).
  @s1
  Scenario: En escritorio la cabecera se alinea con el contenido de la portada
    Given la portada renderizada a 1440 píxeles de ancho
    When se miden la cabecera, su marca, su navegación y el contenido de la sección de servicios
    Then el contenido de la cabecera comparte la columna interior de 1220 píxeles con la portada
    And la cabecera arranca en el borde superior del área visible, sin ninguna franja anclada por encima
    And el borde izquierdo de la marca coincide, con una tolerancia de 1 píxel, con el borde izquierdo del contenido de las secciones
    And el borde derecho de la navegación de escritorio coincide, con la misma tolerancia de 1 píxel, con el borde derecho de ese mismo contenido
    And la marca muestra el logotipo real, el nombre "Galapavet" y el descriptor "Centro integral veterinario"
    And entre la caja del nombre y la caja del descriptor hay exactamente el primer paso de la escala de espaciado del proyecto —4 píxeles—, nunca cero ni un número escrito a mano
    And no se anuncia un servicio de urgencias "24 h", "24h" ni equivalente

  # CLÁUSULA ELIMINADA de @s2 (20/09/2026, misma decisión). Decía literalmente:
  # «And existe un botón "Urgencias" que enlaza al teléfono de urgencias de la
  # fuente única». Se retira por D1.
  #
  # LA CLÁUSULA DE ÁREA TÁCTIL NO SE RELAJA, SE PRECISA: sigue siendo 44×44 px
  # y ahora dice sobre QUÉ caja se mide —el objetivo de pulsación—, porque D4
  # encoge la PÍLDORA VISIBLE del acceso "Tienda" a ~35 px. Las dos cosas son
  # compatibles, y la vía que no abre ninguna puerta nueva es la inversa de la
  # habitual: el enlace conserva sus 44×44 px reales y la píldora se dibuja
  # DENTRO. Ojo, artesano: extender el objetivo con un pseudo-elemento saliente
  # NO vale, porque la caja del propio enlace seguiría midiendo 35.
  # @s2, UNA CLÁUSULA REESCRITA Y UNA AÑADIDA (13/10/2026, feature 49). Texto literal
  # retirado: «And el objetivo de pulsación de cada uno de esos ocho enlaces mide al
  # menos 44 por 44 píxeles». Pasa a 48 por 48: es el criterio 4 de la feature 49 y
  # el criterio 2 de la 46, y es lo que ya miden los ocho (el `min-width` y el
  # `min-height` de los enlaces y de «Tienda» son la altura de control media del
  # sistema, 48 px). La regularidad del nav no se compra rompiendo la
  # accesibilidad. «Tienda» conserva además su suelo de 44 en @s6, que el 48
  # subsume.
  # AÑADIDA: el tamaño de letra computado de los ocho es de 16 px, el paso 0 de la
  # escala (P3, 13/10/2026). Que ese valor SALGA de la escala y no sea un literal lo
  # fija `cabecera_sobre_el_hero` @s13; que el blanco entre glifos sea uniforme, su
  # @s14; que quepan en una fila a 1024 px, `sistema_de_diseno_visual` @s27.
  # PUERTA QUE MUERDE: el nav vuelve a `paso-tipografico(-1)`: 12,8 px. El
  # `min-height` baja a 44: el objetivo no llega a 48. «Tienda» se queda a 12,8 px
  # mientras sus hermanos suben: el tamaño computado de uno de los ocho difiere.
  @s2
  Scenario: En escritorio se ven las acciones principales con destinos reales
    Given una ventana de escritorio y la cabecera sin el menú móvil
    When el visitante inspecciona sus controles visibles
    Then los ocho enlaces de navegación se muestran en una sola fila
    And existe un enlace "Tienda" hacia la página de tienda
    And el objetivo de pulsación de cada uno de esos ocho enlaces mide al menos 48 por 48 píxeles
    And el tamaño de letra computado de cada uno de los ocho enlaces, "Tienda" incluido, es de 16 píxeles, el paso 0 de la escala tipográfica
    And la medición recorre los ocho enlaces, nunca una lista vacía
    And ningún control de la fila tiene un destino que empiece por "tel:"

  # TÍTULO Y CLÁUSULA REESCRITOS de @s3 (20/09/2026, misma decisión). El título
  # decía «En móvil el menú conserva navegación y urgencias sin desbordar» y la
  # cláusula decía «cada enlace de navegación y el botón de urgencias es
  # alcanzable por teclado». Las dos menciones al botón de urgencias se retiran
  # por D1; el panel pasa de nueve enlaces a ocho.
  #
  # ---------------------------------------------------------------------------
  # CLÁUSULA RETIRADA de @s3 (20/09/2026, TERCERA TANDA). Decía literalmente:
  #
  #     And el acceso "Tienda" del panel se dibuja con la misma píldora que en
  #     escritorio: mismo alto visible y mismo color de borde
  #
  # QUIÉN Y POR QUÉ: Pablo, 20/09/2026. La cláusula la añadió por su cuenta la
  # PRIMERA tanda de este mismo día, presentándola como «decisión explícita» para
  # que móvil y escritorio no divergieran. Pablo NO la pidió, y va en dirección
  # CONTRARIA al prototipo versionado.
  #
  # LA PRUEBA ES LITERAL, NO UNA INTERPRETACIÓN. En
  # `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, dentro del
  # <header>, el enlace NORMAL del panel móvil (línea 110, plantilla de los siete
  # destinos) y el enlace "Tienda" del MISMO panel (línea 112) llevan la misma
  # cadena de estilo, carácter a carácter: `padding:13px 12px;
  # border-radius:12px; font-size:16px; font-weight:500; color:var(--ink);
  # min-height:46px; display:flex; align-items:center`. Sin borde, sin radio de
  # píldora, sin peso 600. El diseñador no hizo ahí una fila «parecida» a las
  # otras: usó la MISMA. La píldora del prototipo vive SOLO en escritorio
  # (línea 97: `padding:8px 15px; border-radius:999px; border:1.5px solid
  # var(--border); font-size:13.5px; font-weight:600`).
  #
  # QUÉ HABRÍA HECHO LA CLÁUSULA, MEDIDO en Chromium a 320 px con el panel
  # abierto: importar al panel las DOS propiedades que lo ALEJAN del prototipo
  # —el alto visible, que D4 baja a ~35 px cuando el prototipo pide 46, y el
  # borde suavizado, cuando el prototipo no tiene borde— y dejar fuera la ÚNICA
  # que lo acercaría, la tinta fuerte de @s6. La fila "Tienda" habría pasado de
  # 48 px a ~35, rompiendo la alineación con sus siete hermanas de 48 px y
  # quedando a 11 px del prototipo en vez de a 2.
  #
  # DÓNDE VIVE AHORA LO QUE SE PIERDE: en ningún sitio, y a propósito. El panel
  # móvil se queda HOY EXACTAMENTE COMO ESTÁ —alto 48 px, borde de 1 px del
  # color de borde de control, radio de píldora, peso 600, letra de 16 px y
  # relleno lateral de 24—, que es lo que hoy congela
  # `src/components/Cabecera.test.tsx:331`. Ese `it` va MÁS ALLÁ de su Gherkin:
  # se rotula @s28 de `rediseno_visual.feature`, cuyo Given acota a «una ventana
  # más ancha que el punto de corte», o sea SOLO escritorio. La píldora del panel
  # móvil nunca ha tenido contrato detrás: es una decisión de implementación que
  # un test congeló. Buena noticia para el futuro: retirarla no abrirá una
  # segunda puerta de aprobación humana sobre @s28.
  #
  # ACERCAR EL PANEL MÓVIL AL PROTOTIPO ES TAREA APARTE, con su propio contrato,
  # que Pablo NO ha pedido. Queda anotada en
  # `progress/reconciliacion_contratos_20260920.md` con las cinco divergencias
  # medidas (borde donde el prototipo no tiene, radio 999 contra 12, peso 600
  # contra 500, relleno 24 contra 12 y tinta `--color-texto` #3C4C66 contra la
  # tinta #0B1B33 que usan sus hermanas y el prototipo; el alto, 48 contra 46, es
  # la única cifra que hoy está bien).
  #
  # LAS OTRAS CINCO CLÁUSULAS DE @s3 SE CONSERVAN INTACTAS y son toda su
  # cobertura. En particular «el panel contiene exactamente los ocho destinos de
  # la navegación y ningún enlace más» es la ÚNICA puerta de D1 sobre el panel
  # móvil: el 9 → 8 que retira el CTA de urgencias. Ninguna de las cinco dependía
  # de la píldora.
  # ---------------------------------------------------------------------------
  @s3
  Scenario: En móvil el menú conserva la navegación completa sin desbordar
    Given una ventana de 320 píxeles de ancho
    When el visitante abre el menú de navegación
    Then el botón comunica "aria-expanded" en estado abierto
    And el panel contiene exactamente los ocho destinos de la navegación y ningún enlace más
    And cada enlace de navegación del panel es alcanzable por teclado
    And activar un enlace cierra el menú
    And el documento no desborda horizontalmente

  # @s4 NUEVO (20/09/2026). Cubre el hueco que el incidente del 09/09/2026 dejó
  # al descubierto y que sigue abierto: `progress/current.md` documenta que la
  # cabecera fija arrancaba 32 px más abajo de lo que el documento reservaba, y
  # que lo cazó el humano mirando Chrome porque «no estaba cubierto por ninguna
  # puerta». Se comprobó una por una: la puerta de la hoja global solo lee
  # TEXTO, este contrato solo medía el borde superior, el barrido responsive
  # excluye los elementos fijos y el test del salto al ancla simula la altura.
  # La cabecera declara su alto con `min-height`, así que un bloque de marca
  # más alto la ENSANCHARÍA en silencio. D3 mete 4 px en ese bloque: esta es la
  # puerta que demuestra que siguen cabiendo.
  #
  # ---------------------------------------------------------------------------
  # CORREGIDO EL MISMO DÍA (20/09/2026, TERCERA TANDA) — ESTE ESCENARIO NACÍA
  # CIEGO, Y HAY QUE DECIRLO ANTES DE LA PUERTA HUMANA.
  #
  # CLÁUSULA RETIRADA, literal: «Then el alto renderizado de la cabecera es
  # igual, CON UNA TOLERANCIA DE 1 PÍXEL, al relleno superior que el contenedor
  # de la página reserva».
  #
  # POR QUÉ SE RETIRA: el defecto que este escenario existe para cazar YA ESTÁ
  # PRESENTE, y mide exactamente 1 píxel. MEDIDO hoy en Chromium real
  # (Playwright, perfil Desktop Chrome, DPR 1) sobre `dist/` servido con `vite
  # preview`, a 1440x900: `header` ocupa de y=0 a y=65 (alto 65,00);
  # `[data-cabecera-interior]` mide 64,00; `#root` reserva
  # `padding-block-start: 64px`; `#inicio` arranca en y=64,00. Solape = 1,00 px
  # EXACTO: el borde inferior de la cabecera se apoya sobre el primer píxel de
  # contenido. Con la tolerancia de 1 px, el escenario escrito para cazar ese
  # defecto habría pasado EN VERDE con el defecto dentro. Es la misma familia
  # que el defecto de 32 px del 09/09/2026 que este mismo bloque cita como
  # justificación: una guarda que parece morder y no muerde.
  #
  # DE DÓNDE SALE EL PÍXEL, con el punto exacto: `Cabecera.module.scss:33`.
  # `.cabecera` (`:13`) declara `min-height: var(--altura-cabecera)` y, con
  # `box-sizing: border-box` (`global.scss:66`), POR SÍ SOLA daría 64 exactos con
  # su `border-block-end` dentro. Quien desborda es `.interior`, que REPITE
  # `min-height: var(--altura-cabecera)` dentro de la caja de CONTENIDO: 64 de
  # contenido + 1 de borde = 65 renderizados. El culpable es la línea 33, no
  # la 13.
  #
  # ARREGLO VERIFICADO (inyectado en Chromium y medido antes/después a 1440,
  # 1023 y 320 px; no razonado sobre el CSS): que `.interior` declare
  # `min-height: calc(var(--altura-cabecera) - #{$ancho-borde-fino})`. No toca
  # ningún token, no escribe ningún número a mano y reutiliza el mismo
  # `$ancho-borde-fino` que ya declara el borde en `:20`. Comprobado también que
  # `src/styles/hoja-global.test.ts:123-131` NO se pone en rojo: el `calc` sigue
  # consumiendo `--altura-cabecera` y `.cabecera:13` queda intacta. Y que la
  # marca (40 px) y los controles (48 px) caben de sobra en un interior de 63 px,
  # con 15 px de holgura sobre el control más alto, también después de los 4 px
  # de D3 (el bloque de texto de la marca sube a ~35,75 px y la altura la sigue
  # mandando el logotipo de 40 px). Único efecto cosmético: el centrado flex cae
  # en medio píxel; a DPR 1 no se ve, pero conviene mirar una captura antes de
  # cantar victoria.
  #
  # NO ERA UN CONSUMIDOR DESCUADRADO, ERAN CUATRO, y el mismo arreglo de UNA
  # LÍNEA los cuadra todos (medido antes → después):
  #   · `#root` `padding-block-start: 64px` — solape 1,00 → 0,00.
  #   · `scroll-padding-top: calc(64px + 24px)` (`global.scss:313`) — aire al
  #     saltar a un ancla 23 px → 24,00, que es el `espaciado(24)` que el
  #     contrato pretende. Hoy NO cuadraba.
  #   · `--desplazamiento-al-enfocar: calc(64px + 8px)` (`global.scss:246`) —
  #     hueco del enlace de salto enfocado 7 px → 8,00. Hoy NO cuadraba.
  #   · `.panelMovil { inset-block-start: var(--altura-cabecera) }`
  #     (`Cabecera.module.scss:250`) — a 320 px el panel arrancaba en y=64 con la
  #     cabecera acabando en y=65, así que su primer píxel quedaba TAPADO por el
  #     borde (z-index 10 sobre 9); pasa a quedar a ras.
  #   · `posicionDeScrollParaAncla` (`Cabecera-logica.ts:104`) es INMUNE: mide el
  #     `bottom` REAL de la cabecera en vez de leer el token. Es el único sitio
  #     del proyecto que ya hacía lo correcto.
  # Los tres del medio NO se convierten en cláusulas de @s4: no se contratan
  # comportamientos que Pablo no ha pedido —es la lección de G2, unos escenarios
  # más arriba—. Quedan anotados aquí y en
  # `progress/reconciliacion_contratos_20260920.md` como efecto verificado del
  # arreglo y como tarea abierta si alguna vez se quieren blindar. Lo que SÍ
  # entra como cláusula es la DIRECCIÓN del arreglo, para que la igualdad no se
  # consiga moviendo el hueco que el documento reserva en vez de la franja: por
  # ese camino @s4 volvería a pasar en verde y los otros tres seguirían
  # descuadrados.
  #
  # LA TOLERANCIA QUE QUEDA, Y POR QUÉ: NINGUNA. Medido con el arreglo puesto, la
  # diferencia es 0,00 y todo el cálculo vive en píxeles enteros a DPR 1 (la
  # configuración de Playwright no toca `deviceScaleFactor`). Si el artesano
  # quiere red contra el redondeo subpíxel, el techo duro es ESTRICTAMENTE MENOR
  # que `$ancho-borde-fino` —medio borde, 0,5 px— y derivado del token, JAMÁS
  # 1 px: una tolerancia de 1 px en una comparación vertical puede absorber un
  # borde entero, que es justo el defecto de hoy.
  #
  # AVISO AL ARTESANO, PUERTA DE AL LADO: `tests/e2e/fidelidad-cabecera.spec.ts`
  # ya declara `const TOLERANCIA = 1` en su línea 6, y es el 1 px LEGÍTIMO de las
  # comparaciones HORIZONTALES de @s1. El test de @s4 NO debe heredarlo por
  # inercia: que declare el suyo, derivado del grosor del borde fino, con un
  # comentario que diga por qué la comparación VERTICAL no puede ser 1.
  #
  # Y UN HALLAZGO QUE NO HAY QUE PERDER: `src/styles/global.scss:243-244` dice
  # por escrito «la cabecera fija `y = 0 … 65` (64 de altura más su borde fino)»
  # y concluye «no hay solape». La medición estaba hecha y firmada desde hace
  # semanas; la conclusión es CIERTA del enlace de salto (aterriza en y=72) y
  # FALSA de `#inicio` (arranca en y=64). Alguien midió el defecto, lo anotó y lo
  # leyó como si no fuera uno. Ese comentario hay que reapuntarlo en el mismo
  # paso del arreglo —y con él el «64px de cabecera + 8px de hueco = 72px», que
  # hoy da 7—: es documentación que describe un sitio que no existe.
  #
  # ESTADO EN EL QUE @s4 LLEGA A LA PUERTA HUMANA: NACE EN ROJO, a propósito.
  # Pablo tiene que aprobar un escenario que hoy falla, y el arreglo que lo pone
  # en verde es una línea de SCSS ya verificada.
  # ---------------------------------------------------------------------------
  #
  # @s4, TERCERA CLÁUSULA ENMENDADA (13/10/2026, feature 49). Texto literal retirado:
  #     And el borde superior del primer contenido de la portada coincide con el
  #     borde inferior de la cabecera con esa misma exactitud: ni un píxel tapado,
  #     ni un píxel de franja vacía
  # POR QUÉ. Pablo pidió el 13/10/2026 (punto 1 de su encargo) que la foto del hero
  # ocupe también la cabecera. En la portada el primer contenido es el propio hero,
  # que ahora sube bajo la cabecera A PROPÓSITO: «ni un píxel tapado» pasa a ser
  # falso por diseño. La cláusula se parte en dos. En las otras cinco rutas sigue
  # EXACTAMENTE como estaba (el relleno de `#root` las separa de la cabecera). En la
  # portada se exige el solape, medido, y que la sección de bienvenida cuente esa
  # franja DENTRO de su altura (cabecera_sobre_el_hero @s6).
  # G1 SIGUE EN PIE. Las cláusulas 1, 2, 4 y 5 NO cambian: el alto renderizado de la
  # cabecera sigue siendo exactamente el relleno que `#root` reserva, sin tolerancia,
  # y la igualdad se consigue sin mover ni el token ni ese relleno. De hecho son lo
  # que obliga a hacer el solape con un margen negativo del hero y NO quitando el
  # relleno de `#root` (decisiones §6.6): quitarlo rompería las subpáginas. La
  # cabecera mide 64 px en sus DOS estados (cabecera_sobre_el_hero @s8); el borde
  # inferior de 1 px de hoy tiene que seguir cabiendo DENTRO de esos 64 o no pintarse
  # en el estado transparente, y el alto no puede cambiar.
  # PUERTA QUE MUERDE: se quita el relleno de `#root` para subir el hero: las
  # subpáginas pierden su hueco y la cláusula de las otras cinco rutas falla. El hero
  # no sube: en la portada la sección arranca en y = 64 y falla la nueva.
  @s4
  Scenario: La franja fija mide exactamente el hueco que el documento reserva bajo ella
    Given la portada renderizada a 1440 píxeles de ancho y sin desplazamiento
    When se compara el alto real de la cabecera con el hueco que el documento reserva para ella
    Then el alto renderizado de la cabecera, con su borde inferior incluido, es exactamente igual al relleno superior que el contenedor de la página reserva
    And esa igualdad se comprueba sin tolerancia; si hiciera falta una red contra el redondeo subpíxel, es estrictamente menor que el grosor del borde fino del sistema y se deriva de ese mismo token, nunca del número 1 escrito a mano
    And en cada una de las otras cinco rutas del inventario, cargada a 1440 píxeles y sin desplazamiento, el borde superior del primer contenido coincide con el borde inferior de la cabecera con esa misma exactitud: ni un píxel tapado, ni un píxel de franja vacía
    And en la portada la sección de bienvenida sube bajo la cabecera a propósito: su borde superior está en y = 0 y el solape con la cabecera es exactamente el alto renderizado de ésta, sin tolerancia
    And la igualdad se consigue sin mover el token de altura de cabecera ni el hueco que el contenedor de la página reserva: es la franja la que pasa a medir lo que el documento ya reservaba
    And el bloque de marca —logotipo, nombre y descriptor— no supera ese alto

  # @s5 NUEVO (20/09/2026). Es la contrapartida ejecutable de todo lo que D1
  # elimina: hasta hoy la ausencia de urgencias en la cabecera solo estaba
  # escrita (`cabecera_y_navegacion.feature` @s13, sin un solo test desde el
  # 25/08/2026).
  #
  # CLÁUSULA ELIMINADA EL MISMO DÍA (20/09/2026, segunda tanda). Decía
  # literalmente: «And en esa misma ruta, fuera de la cabecera, sigue existiendo
  # al menos un enlace de llamada cuyo nombre accesible contiene el rótulo real
  # de urgencias fuera de horario».
  #
  # POR QUÉ SE RETIRA, habiéndola escrito esta misma mañana: se escribió a
  # propósito, para que la cobertura de urgencias no quedara a la suerte del
  # pie. Horas después Pablo decidió retirar TAMBIÉN el enlace del pie (E2) y la
  # tarjeta de contacto (E1), con la misma grabación del 16/08/2026 como
  # respaldo (minutos 06:52-07:00). La cláusula se vuelve falsa en las cinco
  # rutas que no son la portada por E2, y en la portada por E1: es decir, en las
  # SEIS. Un contrato no se lleva a la puerta humana con una cláusula que su
  # autor ya sabe falsa, así que se sustituye por su inversa MEDIDA, que sigue
  # mordiendo: si alguien vuelve a colar un `tel:` de urgencias en el armazón
  # común sin pasar por la puerta humana, esta cláusula lo caza.
  #
  # Lo que NO cambia: D1. Las cuatro primeras cláusulas son exactamente lo que
  # Pablo pidió el 20/09/2026 y lo que `cabecera_y_navegacion.feature` @s13 ya
  # exigía desde el 25/08/2026.
  @s5
  Scenario: La cabecera no ofrece ningún acceso a urgencias en ninguna ruta
    Given el sitio construido y servido, en cada una de las seis rutas publicadas
    When se inspecciona únicamente la región de cabecera de cada ruta
    Then ningún enlace de la cabecera tiene un destino que empiece por "tel:"
    And ningún elemento de la cabecera tiene un nombre accesible que contenga "Urgencias"
    And el texto visible de la cabecera no contiene "Urgencias"
    And desde el 20/09/2026 tampoco lo ofrece el resto del armazón común: en esa misma ruta, fuera de la cabecera y sin interactuar, no existe ningún enlace de llamada al teléfono de urgencias
    And la comprobación recorre las seis rutas, nunca una lista vacía

  # @s6 NUEVO (20/09/2026, D4). Los tres números del Then son DERIVABLES de las
  # escalas que el proyecto ya declara, no elegidos a ojo: 48 px es la altura de
  # control media del sistema (mínimo de área táctil 24 + paso de espaciado 24),
  # 36 px es ese mismo mínimo más el paso de espaciado 12, y 24 px es el mínimo
  # de área táctil de SC 2.5.8. El prototipo aterriza en ~35 px con relleno de
  # 8 px y tipo de 13,5 px; 13,5 px NO existe en la escala tipográfica de este
  # repositorio y NO se escribe a mano: el acceso "Tienda" ya usa el paso -1
  # (12,8 px) y lo conserva.
  # @s6, DOS CLÁUSULAS REESCRITAS (13/10/2026, feature 49). Texto literal retirado:
  #     And su texto se pinta con la tinta fuerte de la variante activa, no con el color de texto normal
  #     And su tamaño de letra sigue siendo un paso existente de la escala tipográfica, sin ningún número escrito a mano
  # POR QUÉ. La primera es de cuando la cabecera era clara: la «tinta fuerte»
  # (`--color-tinta`) era el color más oscuro de la variante y daba el contraste.
  # Con la cabecera sólida de tinta, o transparente bajo un velo de tinta,
  # `--color-tinta` es el FONDO: el texto de «Tienda» daría de 1,0 a 2,2:1 sobre el
  # velo (medido en la investigación del 13/10/2026) y no se vería. Pablo decidió
  # (P2) «un solo juego de colores en todos los estados» y las decisiones §6.7 dicen
  # que «Tienda» sigue la regla común, `--color-sobre-primario`, y no
  # `--color-tinta`. La segunda: «Tienda» estaba en el paso -1 (12,8 px) igual que
  # sus siete hermanos; todos pasan al paso 0 (P3, 16 px) y «Tienda» no es una
  # excepción. La nota de arriba que dice que «ya usa el paso -1 y lo conserva»
  # describe el estado del 20/09/2026.
  # QUÉ SE CONSERVA: la píldora más baja que el objetivo (menos de 48, como mucho 36
  # y al menos 24 px) y el objetivo de pulsación de 44 por 44, que @s2 sube a 48 para
  # los ocho.
  # PUERTA QUE MUERDE: el texto de «Tienda» vuelve a `--color-tinta`: su color
  # computado no es el de sus hermanos. Su tamaño vuelve al paso -1 o se escribe a
  # mano. Que el color sea el mismo en los dos estados lo fija
  # cabecera_sobre_el_hero @s7, y que se lea sobre la foto, su @s10 (Tienda es uno de
  # los ocho enlaces que mide).
  @s6
  Scenario: El acceso "Tienda" baja a la píldora del prototipo sin perder su objetivo de pulsación
    Given la portada servida en una ventana más ancha que el punto de corte
    When se mide el acceso "Tienda" de la navegación de escritorio
    Then la superficie visible que dibuja su borde mide de alto menos que la altura de control media del sistema, 48 píxeles
    And ese alto visible no supera los 36 píxeles que produce la propia escala del proyecto al sumar el mínimo de área táctil y un paso de espaciado
    And ese alto visible no baja de los 24 píxeles del mínimo de área táctil
    And su objetivo de pulsación sigue midiendo al menos 44 por 44 píxeles
    And su texto sigue la misma regla de color que los otros siete enlaces: el color de texto de la cabecera, "--color-sobre-primario" de la variante activa, en los dos estados de la cabecera, y no "--color-tinta"
    And su tamaño de letra computado es el mismo que el de los otros siete, 16 píxeles, un paso existente de la escala tipográfica, sin ningún número escrito a mano

  # @s7 NUEVO (20/09/2026, D4). MEDIDO, no supuesto, con la función de contraste
  # del propio repositorio: el borde de control actual da 4,94:1 contra el fondo
  # en `clinica` (el 4,94 que citaba el encargo) y 4,72 / 9,94 / 5,20 / 4,23 en
  # `calida`, `tech`, `eco` y `marca`. El borde del prototipo, #D7E9E4, da
  # 1,20:1: NO cumple SC 1.4.11 y por eso no se copia. El punto de suavidad
  # máxima que todavía cumple 3:1 en las CINCO variantes y contra los CUATRO
  # planos de fondo del sistema es mezclar un 12 % del fondo de la variante
  # dentro del borde de control: peores casos 3,61 / 3,48 / 6,92 / 3,87 / 3,01,
  # y `marca` es la variante que manda (a un 16 % ya suspende, con 2,81).
  #
  # [SUPERADO el 13/10/2026 para la cabecera sobre la foto: ver «@s7 REESCRITO», abajo.]
  # DECIDIDO (20/09/2026, TERCERA TANDA): EL BORDE SÍ SE SUAVIZA, Y POR EL
  # CAMINO (a). Esta nota nació ofreciendo dos caminos y dejando la elección
  # abierta; Pablo la cerró el mismo día, al saber que el (a) era barato. Queda
  # así, y el artesano no tiene nada que elegir:
  #   (a) APROBADO. Mezcla local sobre tokens que YA existen: `color-mix(in
  #       srgb, var(--color-borde-control) 88%, var(--color-fondo))`. NO es un
  #       color literal, así que pasa la puerta de literales de color —que
  #       persigue `#hex`, `rgb()/hsl()` y los 16 nombres CSS—; el patrón ya está
  #       en producción y EN VERDE, incluso para un `border-color`, en
  #       `Hero.module.scss:132`, `:55` y `:181`. NO toca el inventario de
  #       tokens, ni la matriz de uso, ni `contratoRedisenho`, ni `tokensColor`,
  #       ni `fidelidadPrototipo`.
  #   (b) CERRADO. Un token nuevo en el sistema. Abriría el inventario CONGELADO
  #       por contrato humano —`rediseno_visual.feature` @s1 (20 entradas, 18
  #       roles de color) y @s2 (100 parejas comprobadas)—, más la matriz de uso.
  #       Eso es OTRA puerta de aprobación humana y merece su propia feature
  #       pequeña. El artesano NO puede tomar este camino sin volver a la puerta.
  #
  # CORRECCIÓN DE DATO (20/09/2026, TERCERA TANDA): el camino (b) decía «más la
  # matriz de uso clavada en 25 filas y 125 parejas». Desde hoy son 23 FILAS y
  # 115 PAREJAS —F1 borra las dos filas de urgencia de
  # `src/lib/diseno/matrizDeContraste.ts` (`:363` y `:388`), decisión de Pablo
  # del 20/09/2026; ver la nota de @s7 de `rediseno_visual.feature`—. Se corrige
  # el número porque esta es la única nota que el artesano va a leer al tocar el
  # borde, y un número falso ahí es exactamente el defecto que estas notas
  # existen para evitar.
  #
  # `--color-borde-control` NO SE TOCA en ninguno de los dos caminos: está
  # congelado hexadecimal a hexadecimal por @s8 (Enmienda 3) y @s4 de
  # `rediseno_visual`, que lo recalculan desde el prototipo versionado.
  # @s7 REESCRITO (13/10/2026, feature 49; revisado tras el panel de revisión).
  # Texto literal retirado:
  #     Scenario: El borde del acceso "Tienda" se suaviza sin bajar del mínimo de contraste de componente
  #       When se compara el color de borde del acceso "Tienda" con el borde de control del resto de botones de contorno
  #       Then en cada variante el borde del acceso "Tienda" contrasta menos contra el fondo sobre el que se pinta que el borde de control
  #       And aun así su ratio de contraste contra ese fondo no baja de 3 a 1 en ninguna de las cinco variantes
  #       And el valor suavizado sale de una única regla, la misma para las cinco variantes, derivada de tokens que ya existen
  # POR QUÉ. Todo el escenario se calibró sobre un fondo CLARO (`--color-fondo`): el
  # borde de control de la variante, un tono oscuro, contra la cabecera clara. Con la
  # cabecera de tinta o transparente sobre la foto, el «fondo sobre el que se
  # pinta» es la tinta o la fotografía bajo el velo, y el borde de control (oscuro)
  # casi no contrasta con ninguna de las dos. La cláusula «contrasta menos que el borde
  # de control» pierde su referencia, y la suavidad aprobada el 20/09/2026 (F3) deja de
  # ser posible.
  #
  # LA SUAVIDAD F3 SE RETIRA, Y ES UNA DECISIÓN QUE VUELVE A PABLO. MEDIDO por el panel
  # de revisión en Chromium (el borde se mide con una captura en la que él mismo está
  # transparente): la mezcla de entonces, el 88 % del borde de control con
  # `--color-fondo`, da contra lo que hay detrás de la píldora, con la cabecera
  # TRANSPARENTE sobre la foto, de 2,1 a 2,5:1 en `clinica`, `calida`, `eco` y `marca`
  # y 1,12:1 en `tech`; con la cabecera SÓLIDA da de 3,55 a 4,24 en cuatro paletas
  # (aprueba) y 2,06 en `tech`. Suspende el 3:1 de SC 1.4.11 sobre la foto en las
  # CINCO paletas y sobre la tinta solo en `tech`. No existe un borde «más suave» que
  # cumpla 3:1 sobre la foto sin ser casi tan fuerte como el texto.
  # VALOR POR DEFECTO del craftsman_lead (13/10/2026), que Pablo puede vetar: el borde
  # de la píldora es del COLOR DE SU TEXTO (`currentColor`), que es lo que lleva la
  # maqueta que Pablo vio y eligió (`border: 1px solid currentColor`). Si Pablo prefiere
  # conservar un borde suave, tiene que decir qué contraste acepta sobre la foto (el
  # 3:1 de SC 1.4.11 no se puede suavizar) o aceptar un borde de otro tono; la cláusula
  # «el borde es del color de su texto» y la de 3:1 se reescriben entonces juntas.
  # QUÉ SE CONSERVA: el suelo de 3 a 1 (SC 1.4.11), la intocabilidad del borde de
  # control de los demás botones, la regla única derivada de tokens existentes y la
  # ausencia de color literal en la hoja. El camino (b) de la nota de F3, el token
  # nuevo, sigue CERRADO.
  # QUÉ CAMBIA Y CÓMO SE MIDE. El borde se mide contra los PÍXELES reales que hay
  # detrás de él, en los dos estados de la cabecera: se deja el borde con color
  # transparente conservando su caja, se captura la banda que dibuja (la caja de la
  # píldora visible que mide @s6, menos su interior) y se calcula el contraste del color
  # del borde, compuesto con su opacidad efectiva, contra cada píxel de esa banda; la
  # cifra es el MENOR. Con el borde pintado en la captura, su contraste contra sí mismo
  # sería 1,00 y el escenario no podría aprobar nunca. El texto de «Tienda» NO se mide
  # aquí: se mide en cabecera_sobre_el_hero @s10 sobre la caja de su nodo de texto, y el
  # método de píxeles es el de esa nota. Con el borde del color del texto, el contraste
  # del borde queda cerca del del texto, pero no es idéntico: la banda del borde cubre
  # píxeles que la caja del texto no cubre (los de los bordes de la píldora, donde el
  # velo es otro). Por eso se mide.
  # PUERTA QUE MUERDE (las mutaciones que de verdad se ponen en rojo):
  #   · El borde vuelve a la mezcla de antes (88 % del borde de control con
  #     `--color-fondo`): suspende sobre la foto en las cinco paletas (2,1 a 2,5; 1,12 en
  #     `tech`) y sobre la tinta solo en `tech` (2,06), y la cláusula «el borde es del
  #     color del texto» suspende en las cinco.
  #   · El borde pasa a un gris «#424242»: suspende la puerta de píxeles (≈ 2,1 sobre la
  #     foto) y la de color literal.
  #   · El borde se quita (ancho 0 o color transparente): la banda tiene ancho 0 o su
  #     color es transparente; suspende la cláusula «el borde es del color del texto y se
  #     ve» y la medida da «no se midió».
  # La tabla de cabecera_sobre_el_hero @s12 trae las filas de escena que prueban que la
  # propia puerta distingue (el borde en gris suspende; texto y borde blancos sobre
  # negro aprueban con 21,00).
  @s7
  Scenario: El borde del acceso "Tienda" es del color de su texto y alcanza el contraste mínimo de componente contra lo que hay realmente detrás, sobre la foto y sobre el estado sólido
    Given el sitio servido en cada una de las cinco variantes de paleta, con la fotografía del hero decodificada y la entrada del hero en estado estable (hero_reducido_con_animacion @s10)
    When se mide el borde del acceso "Tienda" contra los píxeles que hay realmente detrás de él, con una captura en la que el propio borde está transparente, con la cabecera transparente sobre la foto y con la cabecera sólida, con el método de píxeles de cabecera_sobre_el_hero @s10
    Then en cada variante y en cada uno de los dos estados el contraste del color del borde, compuesto con su opacidad efectiva, contra el peor píxel de la banda del borde no baja de 3 a 1
    And en cada variante y en cada estado el color de borde computado de "Tienda" es el color de texto computado del propio enlace, "--color-sobre-primario" de la variante, y su ancho de borde computado es mayor que 0
    And los demás botones de contorno del sitio conservan su borde de control actual, sin cambiar ni un dígito
    And el valor del borde sale de una única regla, la misma para las cinco variantes y los dos estados, derivada de tokens que ya existen
    And en la hoja de estilos del módulo de la cabecera no aparece ningún color literal
    And el número de píxeles muestreados en la banda del borde es mayor que 0 en cada variante y estado: no se aprueba por vacuidad
