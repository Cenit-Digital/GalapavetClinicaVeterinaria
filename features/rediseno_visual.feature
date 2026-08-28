# ============================================================================
# POR QUÉ EXISTE ESTE FICHERO
# ============================================================================
# El 26/08/2026 el humano abrió el sitio desplegado en GitHub Pages
# (https://cenit-digital.github.io/GalapavetClinicaVeterinaria/, commit
# `3cb93ec`) junto al diseño aprobado en Claude Design, y el veredicto fue
# que «a nivel de colores y de formas de caja no se parece en nada».
#
# Se midió. No se estimó: las dos páginas se cargaron en Chromium real
# (Playwright 1.62.1, 1440×900) y ADEMÁS en el Chrome del propio humano a
# través de la extensión «Claude in Chrome», y las dos herramientas dieron el
# mismo resultado dígito a dígito. Volcado completo en
# `progress/rediseno_mediciones_navegador.md`. El resumen:
#
#   - **Al sitio le faltan TRES roles de color enteros.** `--color-acento`,
#     `--color-urgencia` y `--color-urgencia-suave` devuelven cadena vacía:
#     no es que valgan otra cosa, es que no existen. Sin ellos ningún módulo
#     puede pintar un acento saturado ni nada relacionado con urgencias.
#   - **El contenedor mide 1024 px donde el diseño mide 1220 px** (−196 px).
#   - **El titular mide 48,83 px donde el diseño mide 68 px**, con peso 700 en
#     vez de 600 y sin el tracking óptico de −0,02em.
#   - **El `h2` arrastra el interlineado 1,5 del `body`** donde el diseño
#     declara 1,08: un titular de dos líneas ocupa un 39 % más de alto.
#   - **El ritmo vertical es plano**: 64 px en todas las secciones, donde el
#     diseño alterna 104 px y 90 px.
#   - **Solo hay 3 radios y 1 sombra en uso**, frente a 9 radios y 3 sombras.
#   - **Los campos del formulario miden 25-28 px de alto** frente a los 46 px
#     del diseño: pasan el mínimo de SC 2.5.8 por 1-4 px, y por eso el
#     `checkbox` de 18 px se ve descuadrado junto a ellos.
#   - **No hay una sola fotografía en Hero ni en Servicios.**
#
# ============================================================================
# LA CAUSA RAÍZ, Y POR QUÉ ESTO NO FUE UN DESPISTE
# ============================================================================
# La investigación encontró la causa exacta, y está escrita en el propio
# repositorio: `features/identidad_visual.feature:465-474` (@s11, feature ya
# `done`) PROHÍBE POR NOMBRE los roles de urgencia y el acento a secas, y hay
# una puerta automática que lo vigila (`src/lib/diseno/rolesDescartados.ts:30`
# y `:32`). Su motivo literal:
#
#   «un color de urgencias reintroduciría por la puerta de atrás el servicio
#    de urgencias 24 h que la Decisión 2 suprimió y que Galapavet no presta»
#
# El motivo era **correcto**: `docs/datos-galapavet.md:40-43` y `:94` dejan
# claro que «Urgencias 24 h · todos los días del año» es FALSO para este
# cliente. Pero la regla se pasó de frenada: **Galapavet sí presta urgencias
# fuera de horario**, con un teléfono real y publicado — `91 851 13 93`
# (`docs/datos-galapavet.md:29`, `src/lib/site.ts:12`). Prohibir el COLOR para
# impedir la MENTIRA fue vigilar la cosa equivocada, y el precio ha sido
# quedarse sin la mitad del vocabulario visual del diseño.
#
# **La enmienda que este contrato introduce**, decidida por el humano el
# 26/08/2026: la puerta se INVIERTE. Deja de vigilar el nombre del token y
# pasa a vigilar la afirmación — ninguna cadena de `src/` ni de `dist/` puede
# afirmar «24 h», «24h», «365», «todos los días del año» ni «siempre hay
# alguien de guardia». Así la barra roja existe con el dato REAL, y la mentira
# sigue estando prohibida por automático, que es lo que de verdad importaba.
# Lo mismo con `--color-acento`: se permite el token y se vigila su USO (solo
# relleno, nunca `color:` ni `border-color:`), porque el motivo original —el
# lima da 1,89 sobre blanco y no puede llevar texto— seguía siendo cierto.
#
# ============================================================================
# EL RETO DE ESTE CONTRATO
# ============================================================================
# `identidad_visual.feature` ya aprendió una lección: sus escenarios afirman
# cosas que jsdom no sabe medir (familias tipográficas computadas, rectángulos
# reales, `naturalWidth`, códigos HTTP, ratios calculados). Y aun así se
# entregó un sitio que no se parece al diseño, porque **ningún escenario
# comparaba nada contra el diseño**. Se verificaba que el sitio fuera
# coherente consigo mismo, no que fuera fiel a su referencia.
#
# Aquí no puede volver a pasar. El bloque F de este contrato introduce la
# puerta que faltaba: **escenarios que leen el TEXTO REAL del prototipo
# versionado en `docs/diseno-claude-design/` y lo comparan con lo que el sitio
# pinta**. Si el diseño cambia, el test lo dice. Si el sitio se desvía, el
# test lo dice. Nadie más tiene que abrir dos pestañas y comparar a ojo.
#
# ============================================================================
# DE DÓNDE SALE CADA NÚMERO DE ESTE FICHERO
# ============================================================================
# Ninguno está inventado. Cada uno se traza a una de estas cinco fuentes:
#
# - **El prototipo**, versionado en `docs/diseno-claude-design/` (copia byte a
#   byte del bundle de handoff, verificada contra el proyecto remoto
#   `0e205644-2828-4e9f-976c-b3065e4f609e` con el MCP `claude_design`: los 7
#   ficheros coinciden). Se cita como `VLS` (`Veterinaria La Sierra.dc.html`),
#   `TIE` (`Tienda.dc.html`), `CAM` (`Campanas.dc.html`), `BLO`
#   (`Blog.dc.html`), con número de línea.
# - **La medición en navegador real**, `progress/rediseno_mediciones_navegador.md`.
# - **La matriz de deltas**, `progress/rediseno/matriz_delta.md`, destilada de
#   seis análisis (4.076 líneas) y corregida por tres refutadores
#   adversariales que encontraron 37 errores de cita y de recuento; las 37
#   correcciones están aplicadas y numeradas C-01..C-40.
# - **Los datos reales del cliente**, `docs/datos-galapavet.md` y
#   `src/lib/site.ts` / `src/data/*.ts`. NUNCA el prototipo: sus textos son
#   de otra clínica ficticia («Veterinaria La Sierra», Miraflores de la
#   Sierra, teléfono 640 22 11 90, email hola@veterinarialasierra.es).
# - **Los umbrales WCAG 2.2**, ya implementados en `src/lib/contraste.ts:83-86`
#   (4,5 texto normal · 3 texto grande y componentes de interfaz). Todo ratio
#   citado aquí está calculado con ESA función, no estimado.
#
# ADVERTENCIA sobre el prototipo, verificada leyendo `support.js:611-659`: el
# atributo `hint-placeholder-count` es una pista del editor, NO el conteo
# real. El conteo real vive en el array de datos del `<script type="text/x-dc">`.
#
# ADVERTENCIA sobre la Decisión 24 («No copies estos valores»): la medición
# demostró que **el prototipo no tiene sistema**. Usa 34 tamaños de fuente
# distintos y 18 techos de espaciado distintos, sin progresión. Este contrato
# porta su LENGUAJE VISUAL (qué elementos existen, qué proporciones, qué
# jerarquía), no sus 34 números. Donde un valor del prototipo no cae en la
# rejilla de 8 px o en la escala de radios del repo, manda la escala del repo
# y la desviación se declara.
#
# ============================================================================
# LO QUE ESTE CONTRATO NO HACE
# ============================================================================
# - **No inventa datos de negocio.** Los servicios siguen siendo 5 (no los 12
#   del prototipo), el equipo sigue siendo 2 personas (no 6), no hay email
#   público, no hay precios de campaña, no hay coordenadas y no hay urgencias
#   24 h. Se porta la FORMA de cada módulo; el relleno sale de la fuente única.
# - **No pone retratos de stock bajo los nombres reales del equipo.**
#   `progress/plan_imagenes.md` §0 ya lo prohíbe («sería exactamente la mentira
#   que el contrato evita») y `src/components/Equipo.test.tsx:184` lo verifica.
#   La tarjeta del diseño se replica con avatar de iniciales sobre
#   `--color-acento-suave`, que es además el mismo hueco que el propio
#   prototipo pinta cuando le falta la foto.
# - **No toca la lógica de negocio ya aprobada** de `Servicios-logica`,
#   `Equipo-logica`, `ReservaChat-logica`, `PaginaTienda-logica`,
#   `PaginaBlog-logica` ni `PaginaCampanas-logica`.
#
# ============================================================================

Feature: Rediseño visual: el sitio se parece al diseño aprobado, con los datos reales
  Como responsable de Galapavet quiero que la web publicada tenga el lenguaje
  visual del diseño aprobado en Claude Design, sin que ni un solo dato deje de
  ser cierto, para que el sitio represente a la clínica y no a una maqueta.

  # ---------------------------------------------------------------------------
  # A. EL SISTEMA DE COLOR UNIFICADO: 5 variantes × 20 roles
  #    Herramienta: lectura del TEXTO REAL con "?raw" + Vitest, y la fórmula
  #    real de `src/lib/contraste.ts`.
  # ---------------------------------------------------------------------------

  @s1
  Scenario: El inventario del sistema de color declara exactamente veinte roles
    Given el inventario de roles del sistema de color
    And un literal escrito a mano con los veinte nombres de token esperados
    When se compara el inventario declarado con ese literal
    Then el inventario tiene exactamente 20 entradas
    And 18 de ellas son roles de color y 2 son roles de sombra
    And las tres entradas nuevas respecto del sistema anterior son "--color-acento", "--color-urgencia" y "--color-urgencia-suave"
    And los diecisiete nombres que ya existían siguen presentes, ninguno renombrado

  @s2
  Scenario: Las cinco variantes declaran los veinte tokens en su propio bloque, sin heredar ninguno
    Given el texto real de "src/styles/_tokens.scss"
    And esta verificación se ejecuta leyendo el TEXTO REAL del fichero con "?raw" en Vitest
    When se comprueba cada pareja (variante, token) del inventario
    Then las variantes declaradas son exactamente "clinica", "calida", "tech", "eco" y "marca", en ese orden
    And el recuento de parejas comprobadas es exactamente 100
    And no falta ninguna pareja
    And ningún token se hereda de otra variante

  # ---------------------------------------------------------------------------
  # ENMIENDA 1, aprobada por el humano el 26/08/2026. Antes y después literal en
  # `progress/rediseno/enmiendas_contrato.md`.
  #
  # QUÉ SE MIDIÓ. La cláusula original decía «salvo en las tres desviaciones
  # declaradas de @s6 y @s7», y las parejas que NO pueden coincidir carácter a
  # carácter no son tres sino SIETE: el prototipo declara `--border` con alfa en
  # los CUATRO temas (VLS:20, :28, :36, :44) y `--accent-soft` y `--urg-soft`
  # con alfa solo en `tech` (VLS:38-39), mientras que el sistema declara los
  # veinte roles de color como hexadecimal opaco; la séptima es el `--muted` de
  # `calida` (#8A6C45, VLS:28), que @s6 ya corrige por contraste. La primera
  # implementación reconcilió el número apartando las cuatro parejas de
  # `--border` sin comparar nada, y el precio medido fue que daba por VERDE
  # `--color-borde: #FF0000` y `--color-borde: #000000`. Se midió además que el
  # `--color-borde` de `clinica` valía `#D8E0EA`, que no es la composición del
  # rgba del prototipo ni sobre `--color-fondo` (#DADEE3) ni sobre
  # `--color-superficie` (#E0E2E6): un número sin derivación trazable que
  # ningún test del repositorio fijaba.
  #
  # QUÉ DECIDE EL HUMANO: DERIVAR EL BORDE. Las cuatro parejas de `--color-borde`
  # dejan de ser excepciones y pasan a ser derivaciones verificables, con UNA
  # sola regla de composición para las cuatro variantes. Las desviaciones que
  # quedan se escriben por LISTA —nombre a nombre y motivo a motivo—, nunca por
  # recuento, para que añadir o quitar una obligue a enmendar este contrato otra
  # vez; con eso desaparece además la ambigüedad que la implementación devolvió
  # como aclaración (`progress/rediseno/tdd_fidelidad-prototipo.md` §2.1: ni @s6
  # ni @s7 nombraban `tech --accent-soft`).
  # ---------------------------------------------------------------------------
  @s3
  Scenario: Los cuatro temas importados valen exactamente lo que declara el prototipo
    Given el texto real de "src/styles/_tokens.scss" y el texto real de "docs/diseno-claude-design/Veterinaria La Sierra.dc.html"
    And esta verificación se ejecuta leyendo el TEXTO REAL de los dos ficheros con "?raw" en Vitest
    When se extraen los bloques ":root" y ":root[data-tema=…]" del prototipo y se comparan rol a rol con las variantes "clinica", "calida", "tech" y "eco"
    Then cada rol del prototipo tiene su equivalente declarado en el sistema, según la tabla de correspondencia
    And en todo rol que el prototipo declara opaco el valor coincide carácter a carácter, salvo en las desviaciones que este escenario enumera por su nombre
    And los cuatro "--color-borde" no se apartan de la comparación: se DERIVAN, componiendo el rgba del prototipo sobre el rol de fondo de su propia variante con la función de mezcla del repositorio, "mezclar(fondo de la variante, color del rgba, alfa del rgba)"
    And esa regla de composición es UNA sola para las cuatro variantes y queda escrita por extenso en "src/styles/_tokens.scss", igual que la del rojo de urgencia
    And en "clinica" el valor exigido es el de "mezclar('#F8FAFC', '#0F203C', 0.13)", que da "#DADEE3", de modo que el "#D8E0EA" declarado hasta esta enmienda —que no es la composición ni sobre el fondo ni sobre la superficie— sale en rojo
    And la comparación de un rol que el prototipo declara translúcido nunca se da por buena con un hexadecimal cualquiera: exige el valor COMPUESTO, así que "--color-borde: #FF0000" y "--color-borde: #000000" salen en rojo
    And las desviaciones que quedan se declaran por LISTA, con su nombre y su motivo, y ninguna aserción las cuenta: añadir o quitar una obliga a enmendar este contrato
    And "tech --color-acento-suave" es desviación declarada, porque el prototipo lo escribe con alfa solo en ese tema —"rgba(6,182,212,.14)"— mientras que en "clinica", "calida" y "eco" lo da opaco y el sistema lo copia carácter a carácter: no hay regla uniforme que derivar y el opaco de "tech" lo pone el repositorio
    And "tech --color-urgencia-suave" es desviación declarada por el mismo motivo, sobre "rgba(248,113,113,.16)"
    And "calida --color-texto-suave" es desviación declarada porque el "#8A6C45" del prototipo da 4.37 sobre el fondo alterno de su variante y suspende el mínimo de 4.5 que @s6 exige
    And el recuento de roles efectivamente comparados es mayor que 0
    And si el prototipo cambiara un solo hexadecimal, esta comprobación fallaría

  @s4
  Scenario: La variante de marca conserva intactos los quince hexadecimales ya aprobados
    Given el texto real de "src/styles/_tokens.scss"
    And los quince valores de la variante "marca" que "identidad_visual" ya dejó aprobados
    When se leen los quince roles de color de la variante "marca"
    Then cada uno vale exactamente lo que valía antes de este rediseño
    And ninguno se ha rederivado ni redondeado

  @s5
  Scenario: Los tres roles nuevos de la variante de marca derivan de fuentes declaradas
    Given el texto real de "src/styles/_tokens.scss"
    When se leen los tres roles nuevos de la variante "marca"
    Then "--color-acento" es el lima de marca, el mismo hexadecimal que "src/lib/tokens.ts" ya declara
    And "--color-urgencia" es el mismo rojo semántico que declaran las variantes "clinica" y "eco"
    And "--color-urgencia-suave" es la mezcla en sRGB de blanco con ese rojo al diez por ciento, calculada con la función de mezcla del repositorio
    And el fichero declara por escrito que el rojo de urgencia es un color SEMÁNTICO de alerta y no un cuarto color de marca

  @s6
  Scenario: La variante cálida corrige el único suspenso de contraste que traía el prototipo
    Given el texto real de "src/styles/_tokens.scss"
    And la fórmula de contraste real del repositorio
    When se calcula el ratio del texto suave sobre el fondo alterno de la variante "calida"
    Then el valor del prototipo daba 4.37 y habría suspendido el mínimo de 4.5
    And el valor declarado en el sistema alcanza al menos 4.5
    And ese mismo valor sigue aprobando sobre el fondo y sobre la superficie de su variante

  @s7
  Scenario: La tinta que va encima del color de urgencia nunca es blanca por defecto
    Given el texto real de "src/styles/_tokens.scss" y el de los ficheros de estilos del inventario de módulos
    And la fórmula de contraste real del repositorio
    When se busca qué color se pinta sobre "--color-urgencia" en cada variante
    Then el color de encima es siempre "--color-sobre-primario" de esa misma variante
    And el ratio resultante alcanza al menos 4.5 en las cinco variantes
    And en la variante "tech" ese par da al menos 6, frente al 2.77 que daría el blanco del prototipo
    And ningún fichero de estilos escribe blanco literal sobre el color de urgencia

  # ---------------------------------------------------------------------------
  # ENMIENDA 3, aprobada por el humano el 28/08/2026. Antes y después literal en
  # `progress/rediseno/enmiendas_contrato.md`.
  #
  # QUÉ SE MIDIÓ. La cláusula original decía que `--color-borde-control` «se
  # deriva por mezcla del primario con el fondo de cada variante, con la regla
  # escrita en el propio fichero». Medido recorriendo `mezclar(fondo, primario,
  # p)` para `p` de 0% a 100% con la función real
  # `src/lib/diseno/mezclaDeColor.ts` (`progress/rediseno/tdd_matriz-de-
  # contraste.md`, BLOQUEANTE 2): NINGUNA proporción produce el valor de
  # `clinica` (#5E6E88), `calida` (#8A6C45), `tech` (#94C5FF) ni `eco`
  # (#557368) —los tres primeros son el `--muted` del tema de su propia
  # variante en el prototipo, y `tech` es el `rgb()` de su `--border`
  # translúcido, `rgba(148,197,255,.18)`—, y `_tokens.scss` no contiene
  # ninguna regla escrita de derivación para este rol. Solo `marca` SÍ es
  # mezcla genuina: `mezclar('#FFFFFF', '#77286B', 0.7)` = `#A06997`. La parte
  # medible que ya cumplía no cambia: las cinco variantes declaran el rol y su
  # ratio alcanza 3 contra su propio fondo (clinica 4.94 · calida 4.72 · tech
  # 9.94 · eco 5.20 · marca 4.23), y el prototipo no modela este rol
  # (inventario de 18 roles, ninguno de borde de control).
  #
  # QUÉ DECIDE EL HUMANO: ENMENDAR EL CONTRATO, NO LOS COLORES. Ningún
  # hexadecimal ya aprobado se toca. @s8 pasa a describir con precisión el
  # mecanismo real: las cuatro variantes importadas del prototipo declaran el
  # valor que ya trae su propio tema, y solo `marca` —que no tiene tema en el
  # prototipo— deriva por mezcla, con la regla escrita en `_tokens.scss`.
  # ---------------------------------------------------------------------------
  @s8
  Scenario: El borde de control existe en las cinco variantes y cumple el mínimo de componentes de interfaz
    Given el texto real de "src/styles/_tokens.scss"
    And la fórmula de contraste real del repositorio
    When se calcula el ratio de "--color-borde-control" contra el fondo de su propia variante
    Then las cinco variantes declaran ese rol
    And el ratio alcanza al menos 3 en las cinco
    And el prototipo no modela este rol: su inventario de dieciocho roles no incluye ningún borde de control
    And por eso cada variante lo resuelve a su manera, y esa manera se declara aquí por su nombre, no por una regla única para las cinco
    And "clinica", "calida" y "eco" importan el valor que ya trae el "--muted" del tema de su propia variante en el prototipo versionado "docs/diseno-claude-design/Veterinaria La Sierra.dc.html": "#5E6E88", "#8A6C45" y "#557368" respectivamente
    And "tech" importa el mismo rol de otra fuente de su propio tema: el "rgb()" del "--border" translúcido del prototipo, "rgba(148,197,255,.18)", que da "#94C5FF"
    And "marca", que no tiene tema propio en el prototipo, es la ÚNICA variante donde el valor SÍ se deriva por mezcla del primario con el fondo, "mezclar('#FFFFFF', '#77286B', 0.7)" = "#A06997", con la regla escrita por extenso en "src/styles/_tokens.scss"

  @s9
  Scenario: El anillo de foco existe en las cinco variantes y se distingue de su fondo
    Given el texto real de "src/styles/_tokens.scss"
    And la fórmula de contraste real del repositorio
    When se calcula el ratio de "--color-foco" contra el fondo de su propia variante
    Then las cinco variantes declaran ese rol
    And el ratio alcanza al menos 3 en las cinco
    And el prototipo no declara ninguna regla de foco y además suprime el contorno en seis controles, así que este rol es del repositorio y no se importa

  @s10
  Scenario: La variante por defecto es la del diseño y está escrita en un único sitio
    Given el catálogo de variantes, la lógica del selector de paleta y el guion anti-parpadeo del documento
    When se busca cuál es la variante que se aplica sin preferencia guardada
    Then la variante por defecto es "clinica"
    And el identificador aparece declarado una sola vez en todo el proyecto
    And los otros dos puntos que hoy lo repiten lo consumen de esa única declaración

  @s11
  Scenario: Ninguna de las cinco variantes suspende su matriz de uso de color
    Given el texto real de "src/styles/_tokens.scss"
    And la matriz de pares (rol, fondo, uso) que el sistema efectivamente pinta
    When se resuelve la matriz contra cada variante y se pasa por la puerta de contraste
    Then el veredicto es aprobado para las cinco
    And el recuento de variantes comprobadas es exactamente 5
    And con una matriz vacía el veredicto sería suspenso, no aprobado por vacuidad

  @s12
  Scenario: El bloque de emergencia sin JavaScript declara la variante por defecto
    Given el texto real de "src/styles/_tokens.scss"
    When se lee el bloque ":root" que no lleva atributo de variante
    Then declara los mismos valores que la variante "clinica"
    And ese bloque no cuenta como una sexta variante en el inventario

  # ---------------------------------------------------------------------------
  # B. LA ENMIENDA: la puerta deja de vigilar el nombre y pasa a vigilar la
  #    afirmación (supersede a @s11 de `identidad_visual.feature`)
  # ---------------------------------------------------------------------------

  @s13
  Scenario: La puerta de urgencias ya no prohíbe el token, prohíbe la afirmación falsa
    Given el texto real de todos los ficheros de "src" y el contenido del artefacto de producción
    And un literal escrito a mano con las afirmaciones prohibidas
    When se busca cualquiera de esas afirmaciones
    Then no aparece "24 h" ni "24h" en ningún texto visible
    And no aparece "365" ni "todos los días del año" ni "siempre hay alguien de guardia"
    And el recuento de ficheros efectivamente inspeccionados es mayor que 0
    And con la lista de afirmaciones vacía la puerta falla cerrada, en vez de dar cero hallazgos por bueno

  @s14
  Scenario: El único rótulo de urgencias del sitio es el real, con el teléfono real
    Given el sitio construido y servido
    When se recorre el texto de las seis rutas buscando la palabra "urgencias"
    Then el rótulo que aparece es exactamente el que declara la fuente única de datos de negocio
    And el teléfono que lo acompaña es el de urgencias de la fuente única, no el de la clínica ni el móvil
    And el enlace de llamada se deriva de ese mismo número, sin retipearlo

  @s15
  Scenario: El acento saturado solo se usa como relleno, nunca como texto ni como borde
    Given el texto real de los ficheros de estilos del inventario de módulos
    When se busca cada uso de "--color-acento"
    Then no aparece como valor de "color"
    And no aparece como valor de "border-color" ni dentro de una declaración abreviada de borde
    And aparece al menos una vez como relleno
    And el recuento de ficheros efectivamente inspeccionados es mayor que 0

  @s16
  Scenario: Se conserva la mitad buena de la regla anterior sobre el primario fuerte
    Given el texto real de "src/styles/_tokens.scss" y el de los ficheros de estilos del inventario
    When se busca el primario fuerte
    Then está declarado en las cinco variantes
    And se usa al menos una vez en algún fichero de estilos del inventario
    And no basta con que esté declarado: si no se usara, la puerta fallaría

  # ---------------------------------------------------------------------------
  # C. GEOMETRÍA Y ESCALAS
  #    Herramienta: navegador real (Playwright) sobre el artefacto de producción.
  # ---------------------------------------------------------------------------

  @s17
  Scenario: El contenido tiene un único ancho máximo y es el del diseño
    Given el sitio construido y servido, en una ventana de 1600 píxeles de ancho
    When se mide el ancho del contenedor principal de cada una de las seis rutas
    Then el ancho es el mismo en las seis
    And ese ancho es 1220 píxeles, el que declara el prototipo
    And el recuento de rutas efectivamente medidas es exactamente 6

  @s18
  Scenario: Las dos secciones que el diseño estrecha a propósito lo siguen haciendo
    Given la portada construida y servida, en una ventana de 1600 píxeles de ancho
    When se mide el ancho del contenido de la sección de bienvenida y el de la sección de preguntas frecuentes
    Then los dos son menores que el ancho general del contenedor
    And cada uno declara su propio ancho máximo, distinto del general y distinto entre sí

  @s19
  Scenario: El ritmo vertical de las secciones es fluido y alterna, en vez de ser plano
    Given la portada construida y servida
    When se mide el relleno vertical de cada sección a 320 píxeles de ancho y a 1440
    Then a 1440 el relleno de una sección de contenido es mayor que a 320
    And al menos una sección declara un relleno vertical menor que las demás, como hace el prototipo con la de campañas
    And ninguna sección conserva el relleno plano de 64 píxeles en los dos extremos

  @s20
  Scenario: Los dos pasos altos de la escala tipográfica son fluidos y alcanzan los extremos del diseño
    Given el sitio construido y servido
    When se mide el tamaño computado del titular de la portada a 320 píxeles de ancho y a 1220
    Then a 320 mide el mínimo que declara el prototipo
    And a 1220 mide el máximo que declara el prototipo
    And lo mismo ocurre con el titular de sección, con sus propios dos extremos
    And los seis pasos inferiores de la escala siguen siendo tamaños fijos, sin tocar

  @s21
  Scenario: Los titulares tienen el peso y el tracking óptico del diseño
    Given el sitio construido y servido
    When se leen el peso y el espaciado entre letras computados de los titulares de las seis rutas
    Then el peso es 600, no 700
    And el titular de portada declara un espaciado entre letras negativo
    And el titular de sección declara un espaciado entre letras negativo, menor en valor absoluto que el de la portada

  @s22
  Scenario: Los titulares declaran su propio interlineado en vez de heredar el del cuerpo
    Given el sitio construido y servido
    When se calcula la razón entre el interlineado y el tamaño de fuente de cada nivel de titular
    Then en ningún nivel de titular esa razón es la del cuerpo del documento
    And en todos los niveles la razón es menor que la del cuerpo
    And el recuento de niveles de titular efectivamente medidos es mayor que 0

  @s23
  Scenario: La escala de radios cubre el vocabulario de formas del diseño
    Given el texto real de la API de Sass y el sitio construido y servido
    When se cuentan los valores de radio distintos que el sitio pinta de verdad
    Then hay más de tres valores distintos en uso
    And existe un radio de píldora, un radio de círculo, un radio de tarjeta, un radio de campo de formulario y un radio de etiqueta
    And cada radio de la escala se deriva de la escala de espaciado o es un mecanismo de CSS, nunca un número copiado del prototipo

  @s24
  Scenario: El sistema tiene tres niveles de elevación y los usa
    Given el sitio construido y servido
    When se cuentan los valores de sombra distintos que el sitio pinta de verdad
    Then hay al menos dos valores distintos en uso, además del estado sin sombra
    And la sombra de reposo se usa en más elementos que la elevada
    And al menos un elemento sube de la sombra de reposo a la elevada al pasar el puntero por encima

  @s25
  Scenario: Los controles de formulario alcanzan la altura del diseño
    Given el sitio construido y servido
    When se mide el alto real de cada campo de texto, desplegable y botón del formulario de contacto y del chat de reserva
    Then ninguno mide menos de 44 píxeles de alto
    And la casilla de consentimiento queda alineada con la primera línea de su etiqueta
    And todos siguen cumpliendo el mínimo de área táctil que ya exigía el contrato anterior

  @s26
  Scenario: El punto de corte de la navegación sube y sigue coincidiendo en JavaScript y en CSS
    Given el sitio construido y servido
    When se carga la portada justo en el punto de corte y un píxel por debajo
    Then justo en el punto de corte la navegación horizontal es visible
    And un píxel por debajo lo que se ve es el botón de menú
    And el valor del punto de corte es el mismo en la lógica y en la hoja de estilos
    And en el punto de corte ningún elemento de la cabecera se desborda ni se superpone con otro, con la barra de urgencias y los dos botones nuevos ya presentes

  # ---------------------------------------------------------------------------
  # D. ANATOMÍA DE LOS MÓDULOS DE LA PORTADA
  # ---------------------------------------------------------------------------

  @s27
  Scenario: La portada abre con una barra de urgencias fija, con el dato real
    Given la portada construida y servida
    When se carga la página
    Then existe una barra por encima de la cabecera
    And su fondo es el color de urgencia de la variante activa, resuelto desde el token
    And su texto es el rótulo real de urgencias de la fuente única de datos
    And contiene un enlace de llamada al teléfono real de urgencias
    And su indicador pulsante deja de animarse cuando la preferencia de menos movimiento está activa

  @s28
  Scenario: La cabecera lleva la navegación, el acceso a urgencias y el acceso a la tienda
    Given la portada construida y servida, en una ventana más ancha que el punto de corte
    When se inspecciona la cabecera
    Then muestra los enlaces de navegación del catálogo
    And muestra un control de urgencias con el color de urgencia de la variante activa
    And muestra un acceso a la tienda con borde y sin relleno
    And la cabecera se mantiene visible al desplazar la página
    And el sitio del ancla de destino al saltar a una sección se calcula desde la altura real de la cabecera más la barra de urgencias, no desde un número escrito a mano

  @s29
  Scenario: La sección de bienvenida se pinta sobre una fotografía a sangre
    Given la portada construida y servida
    When se inspecciona la sección de bienvenida
    Then declara una imagen de fondo que responde con código 200 y no queda con anchura natural cero
    And la imagen queda cubierta por un velo cuyos colores salen de tokens, nunca de un hexadecimal escrito a mano
    And el texto que va encima alcanza el mínimo de contraste de texto normal contra el velo
    And la sección reserva su alto antes de que la imagen decodifique, sin desplazar el contenido de debajo

  @s30
  Scenario: La bienvenida lleva la píldora de ubicación, los dos botones y la banda de cuatro cifras
    Given la portada construida y servida
    When se inspecciona el contenido de la sección de bienvenida
    Then hay una píldora con la localidad y la provincia reales
    And hay un botón principal de reserva y un botón secundario de llamada
    And debajo hay una banda separada por una línea, con exactamente cuatro cifras
    And cada una de las cuatro se deriva de la fuente única de datos o del catálogo de servicios, ninguna escrita a mano
    And ninguna de las cuatro afirma nada que la fuente única no declare

  @s31
  Scenario: Cada tarjeta de servicio lleva su fotografía y su píldora de categoría
    Given la portada construida y servida
    When se inspeccionan las tarjetas de la sección de servicios
    Then hay exactamente tantas tarjetas como bloques declara el catálogo real de servicios
    And cada una muestra una imagen que responde con código 200, con su anchura y su altura declaradas
    And la relación de aspecto de esa imagen es la del prototipo
    And sobre la imagen hay una píldora de categoría derivada del propio título del bloque
    And el pie de la tarjeta lleva el control de desplegar, separado por una línea y anclado abajo
    And los pies de todas las tarjetas de una misma fila quedan alineados aunque su texto sea desigual

  @s32
  Scenario: Cada tarjeta del equipo lleva un avatar de iniciales, nunca una fotografía
    Given la portada construida y servida
    When se inspeccionan las tarjetas de la sección de equipo
    Then no hay ni una sola imagen en toda la sección
    And cada tarjeta muestra un avatar con las iniciales del nombre real, sobre el acento suave de la variante
    And cada tarjeta muestra el nombre y el rol reales
    And la ficha ampliada solo aparece en quien tiene formación publicada
    And ninguna tarjeta muestra número de colegiado ni idiomas, porque el cliente no los publica

  # ---------------------------------------------------------------------------
  # ENMIENDA 2, aprobada por el humano el 26/08/2026. Antes y después literal en
  # `progress/rediseno/enmiendas_contrato.md`.
  #
  # QUÉ SE MIDIÓ. La cláusula original exigía acento tinta en TODOS los
  # cintillos, y el de la sección de bienvenida va encima del velo fotográfico
  # al que @s29 le exige el mínimo de texto normal (4,5). Medido con
  # `src/lib/contraste.ts` en la parada del 92 % del velo, con la fotografía de
  # debajo en sus dos extremos (la más oscura y la más clara posibles),
  # `--color-acento-tinta` SUSPENDE en las CINCO variantes. La tinta que sí
  # cumple es la que la propia sección ya declara para el resto de su texto,
  # `--color-sobre-primario`. El bloqueo quedó documentado por la
  # implementación en `progress/rediseno/fix_uso_del_acento.md` y anotado en
  # `src/components/Hero.module.scss:44-55` con los diez ratios.
  #
  # QUÉ DECIDE EL HUMANO: EXCEPTUAR EL HERO. El resto de cintillos sigue
  # llevando acento tinta; la excepción se escribe como condición MEDIBLE
  # —fondo de token frente a fondo de imagen, con los dos recuentos afirmados—,
  # no como nota al pie, para que no pueda crecer sin enmendar el contrato.
  # ---------------------------------------------------------------------------
  @s33
  Scenario: Cada sección de la portada abre con su cintillo en versalitas
    Given la portada construida y servida
    When se recorren las secciones con titular propio
    Then cada una lleva por delante un rótulo corto en mayúsculas con espaciado entre letras
    And las secciones se reparten en dos grupos por un criterio medible: las que pintan su fondo con un rol de color del sistema y la que lo pinta con la fotografía a sangre de @s29
    And en toda sección cuyo fondo es un rol de color del sistema ese rótulo usa el color de acento tinta de la variante activa
    And la sección de bienvenida queda exceptuada, y su cintillo usa "--color-sobre-primario", la misma tinta que esa sección ya declara para el resto de su texto
    And el motivo de la excepción es medido y queda escrito: sobre la parada del 92 % del velo, "--color-acento-tinta" da 3.21 · 2.04 · 1.10 · 1.97 · 2.40 en "clinica", "calida", "tech", "eco" y "marca" con la fotografía más oscura, y 2.53 · 1.52 · 1.33 · 1.48 · 1.81 con la más clara, y suspende el mínimo de 4.5 de texto normal en las cinco
    And "--color-sobre-primario" sobre ese mismo velo da 17.60 · 14.43 · 12.73 · 15.15 · 13.63 con la fotografía más oscura y 13.86 · 10.76 · 15.37 · 11.39 · 10.28 con la más clara, y aprueba el 4.5 en las cinco por los dos extremos
    And el rótulo no es un encabezado, para no romper la jerarquía de niveles
    And el recuento de secciones con fondo de token efectivamente comprobadas es mayor que 0, y el de secciones sobre fotografía es exactamente 1

  @s34
  Scenario: La reserva por chat se presenta en dos columnas, con la cabecera de conversación del diseño
    Given la portada construida y servida, en una ventana más ancha que el punto de corte
    When se inspecciona la sección de reserva
    Then a la izquierda hay un texto con su cintillo, su titular y una lista de ventajas con marcas de verificación
    And a la derecha hay un panel de conversación con esquina redondeada y sombra
    And el panel abre con un avatar circular, el nombre comercial real y un indicador de disponibilidad
    And el aviso de que la solicitud no se envía a ningún servidor sigue presente

  @s35
  Scenario: La galería es un carrusel con anclaje de desplazamiento y controles propios
    Given la portada construida y servida
    When se inspecciona la sección de galería
    Then las fichas se disponen en una pista que se desplaza en horizontal
    And la pista declara anclaje de desplazamiento
    And hay dos controles con nombre accesible para ir a la foto anterior y a la siguiente
    And cada ficha muestra su imagen, su nombre y su pie
    And el aviso de contenido de demostración sigue presente

  @s36
  Scenario: La sección de contacto lleva el formulario, la tarjeta de urgencias y el mapa con los cuatro bloques de datos
    Given la portada construida y servida, en una ventana más ancha que el punto de corte
    When se inspecciona la sección de contacto
    Then a la izquierda hay una tarjeta con el formulario
    And a la derecha hay una tarjeta con el color de urgencia, el rótulo real y un botón de llamada
    And debajo hay una tarjeta con el mapa y los bloques de datos que el cliente sí publica
    And no aparece ningún bloque de correo electrónico, porque el cliente no publica ninguno
    And cada rótulo de bloque va en versalitas con el color de acento tinta

  @s37
  Scenario: El selector de paleta ofrece las cinco variantes y sus muestras salen de los tokens
    Given el sitio construido y servido
    When se abre el selector de paleta
    Then ofrece exactamente cinco variantes
    And la que está marcada como activa es la que el documento tiene aplicada
    And las muestras de color de cada variante se leen de los tokens de esa variante, no de una lista escrita aparte
    And al elegir una variante el documento la aplica y la recuerda para la siguiente visita

  # ---------------------------------------------------------------------------
  # E. LAS TRES SUBPÁGINAS
  # ---------------------------------------------------------------------------

  @s38
  Scenario: La tienda adopta el lenguaje visual del diseño sin cambiar su catálogo
    Given la página de tienda construida y servida
    When se inspecciona la página
    Then el encabezado de página lleva su cintillo y su titular con el ritmo del sistema
    And cada tarjeta de producto usa el mismo patrón de tarjeta que la portada
    And la imagen de cada producto conserva su relación de aspecto y sus dimensiones declaradas
    And el rótulo de precio de ejemplo sigue siendo inequívoco
    And el catálogo tiene exactamente los mismos productos que antes de este rediseño

  @s39
  Scenario: La página de campañas adopta el lenguaje visual sin declarar precios
    Given la página de campañas construida y servida
    When se inspecciona la página
    Then el encabezado de página lleva su cintillo y su titular
    And cada ficha usa el patrón de tarjeta del sistema
    And ninguna ficha muestra precio, plazas ni vigencia
    And el aviso de contenido de demostración sigue presente

  @s40
  Scenario: El blog adopta el lenguaje visual y conserva su prosa
    Given la página de blog construida y servida
    When se inspecciona la página
    Then el listado usa el patrón de tarjeta del sistema, con imagen y categoría
    And el artículo abierto conserva su ancho de lectura y su interlineado de prosa
    And el aviso de contenido de demostración sigue presente

  # ---------------------------------------------------------------------------
  # F. LA PUERTA QUE FALTABA: fidelidad medida contra el diseño
  #    Herramienta: navegador real sobre el artefacto de producción, y lectura
  #    del texto real del prototipo versionado.
  # ---------------------------------------------------------------------------

  @s41
  Scenario: El prototipo versionado es idéntico al proyecto remoto de diseño
    Given los ficheros de "docs/diseno-claude-design"
    When se comprueba el inventario del bundle
    Then existen los cuatro ficheros de pantalla y el motor de renderizado
    And existe el documento que explica de dónde viene el bundle
    And el recuento de ficheros de pantalla es exactamente 4

  @s42
  Scenario: Los tokens que el navegador resuelve coinciden con los que el fichero declara, en las cinco variantes
    Given el sitio construido y servido
    When se aplica cada variante y se leen los veinte tokens resueltos del documento
    Then cada valor resuelto equivale al declarado en el fichero de tokens
    And el fondo y el color del cuerpo del documento equivalen a los de la variante activa
    And el recuento de variantes efectivamente verificadas es exactamente 5

  @s43
  Scenario: Ninguna imagen nueva del rediseño está rota ni viene de un origen remoto
    Given el sitio construido y servido
    When se recorren las seis rutas
    Then toda imagen renderizada tiene anchura natural mayor que cero
    And ninguna imagen se pide a un origen distinto del propio sitio
    And la imagen de fondo de la sección de bienvenida responde con código 200
    And el recuento de rutas de imagen efectivamente comprobadas coincide con el inventario declarado

  @s44
  Scenario: Ninguna ruta desborda en horizontal en la ventana más estrecha, con el diseño nuevo
    Given el sitio construido y servido, en una ventana de 320 píxeles de ancho
    When se recorren las seis rutas
    Then la anchura de desplazamiento no supera la anchura visible en ninguna
    And ningún elemento sobresale por la derecha
    And el recuento de rutas efectivamente comprobadas es exactamente 6

  @s45
  Scenario: El análisis automático de accesibilidad sigue sin reportar violaciones, en las cinco variantes
    Given el sitio construido y servido
    When se ejecuta el análisis automático sobre las seis rutas con cada una de las cinco variantes aplicadas
    Then el recuento de violaciones es 0 en todas las combinaciones
    And el recuento de combinaciones efectivamente analizadas es exactamente 30
    And el análisis usa las cinco etiquetas acumulativas de siempre, sin mecanismo de opciones

  @s46
  Scenario: Cargar cualquier ruta sigue sin disparar una sola petición a un tercero
    Given el sitio construido y servido
    When se recorren las seis rutas
    Then ninguna petición sale hacia un dominio prohibido
    And las fotografías nuevas se sirven desde el propio origen
    And la puerta de terceros del artefacto de producción declara cero hallazgos

  @s47
  Scenario: Ninguna ruta escribe un error ni un aviso en la consola con el diseño nuevo
    Given el sitio construido y servido
    When se recorren las seis rutas y se interactúa con el selector de paleta, un desplegable de servicios, una ficha de equipo y un elemento del acordeón
    Then el recuento de errores de consola es 0
    And el recuento de avisos de consola es 0
    And el recuento de excepciones no capturadas es 0

  @s48
  Scenario: El peso del CSS servido no supera el techo declarado para el diseño nuevo
    Given la portada construida y servida
    When se suman los bytes de las hojas de estilo que la página carga
    Then la suma no supera el techo declarado
    And el techo está escrito a mano y es mayor que cero
    And el techo se declara en un único sitio

  # ---------------------------------------------------------------------------
  # G. LOS DATOS SIGUEN SIENDO LOS REALES
  # ---------------------------------------------------------------------------

  @s49
  Scenario: Ni un solo literal de la clínica ficticia del prototipo sobrevive en el sitio
    Given el texto real de todos los ficheros de "src" y el contenido del artefacto de producción
    And un literal escrito a mano con los datos de la clínica ficticia del prototipo
    When se busca cada uno de esos literales
    Then no aparece el nombre comercial de la clínica ficticia
    And no aparece su localidad
    And no aparece ninguno de sus teléfonos
    And no aparece su dirección de correo electrónico
    And el recuento de ficheros efectivamente inspeccionados es mayor que 0

  @s50
  Scenario: Los recuentos que el sitio muestra son los reales, no los del prototipo
    Given el sitio construido y servido
    When se cuentan los elementos de cada listado de la portada
    Then el número de bloques de servicio es el del catálogo real, no los doce del prototipo
    And el número de profesionales es el del listado real, no los seis del prototipo
    And el número de fotografías de galería es el del catálogo real, no las nueve del prototipo
    And ningún recuento se ha tomado de la pista de vista previa del editor de diseño

  @s51
  Scenario: Las cuatro cifras de la bienvenida se derivan de la fuente única, sin retipear
    Given el catálogo de servicios y la fuente única de datos de negocio
    When se construye el modelo de la banda de cifras
    Then cada cifra se calcula a partir de esos datos
    And cambiar un dato en la fuente única cambia la cifra correspondiente
    And ninguna cifra está escrita a mano en el componente

  @s52
  Scenario: El sitio no afirma en ningún sitio que preste un servicio que no presta
    Given el sitio construido y servido
    When se recorre el texto visible de las seis rutas
    Then ninguna frase afirma atención continuada las veinticuatro horas
    And ninguna frase afirma atención todos los días del año
    And el único compromiso de urgencias que aparece es el que declara la fuente única de datos
