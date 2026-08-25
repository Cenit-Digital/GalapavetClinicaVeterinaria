# ============================================================================
# FUENTE DEL COMPORTAMIENTO
# ============================================================================
# - feature_list.json, feature 21 «sistema_de_diseno_visual» (7 criterios de
#   aceptación, status "pending", sdd: true).
# - project-spec.md → Decisión 23 (nace la feature: el repo, a 22/08/2026, no
#   tiene ni un solo fichero .scss/.css ni un componente que importe estilos —
#   `find src -iname "*.scss" -o -iname "*.css"` → 0, `grep` de imports
#   `.module.scss/.css` en `src/**/*.tsx` → 0 — y axe-core real sobre la
#   portada construida con `vite build && vite preview` reporta 21 violaciones
#   de `target-size` solo en la portada) y Decisión 24 (fuente de los valores
#   numéricos: NO el prototipo heredado, que dispersa `font-size` en 20
#   valores entre 10px y 26px sin ratio sistemático — solo su arquitectura
#   general, ya validada en dos repos hermanos, WebEmpresa/NailsLashStudioWeb).
# - project-spec.md → «Arquitectura» (ya la declaraba antes de esta feature):
#   `src/styles/_tokens.scss` como fuente de tokens y `<X>.module.scss`
#   co-localizado por componente/página. Esta feature EJECUTA esa arquitectura
#   ya decidida, no inventa una nueva.
# - Mecanismo de paleta YA implementado y probado (`selector_paleta`, feature
#   14, done): `document.documentElement.setAttribute('data-variante', id)`
#   con `id` ∈ {'marca','lima','verde','noche'} — `index.html:30` (script
#   anti-FOUC) y `SelectorPaleta.tsx:21`. Esta feature CONSUME ese atributo y
#   sus 4 identificadores; no los toca ni los reabre.
# - Breakpoint YA fijado y probado en JS: `PUNTO_DE_CORTE_NAVEGACION_PX = 1024`
#   (`src/components/Cabecera-logica.ts:10`, ya `done` vía
#   `cabecera_y_navegacion.feature` @s1).
# - Colores base: `src/lib/tokens.ts` (`coloresDeMarca`: morado `#77286B`,
#   lima `#B4C718`, verdeProfundo `#48704B`) y `docs/datos-galapavet.md` §10 /
#   §10.1 (muestreo de píxeles del logo, ratios ya medidos con la fórmula real:
#   morado/blanco 9,13:1, verde/blanco 5,68:1, lima/morado 4,84:1, lima/blanco
#   1,89:1, negro/lima 11,12:1). Fórmula de contraste: `src/lib/contraste.ts`
#   (`calcularRatioContraste`, ya `done` y probada exhaustivamente por
#   `tokens_marca.feature`; esta feature la REUTILIZA, no la reescribe).
# - Escala tipográfica: metodología de escala fluida de Utopia
#   (https://utopia.fyi/type/calculator/), ratio 1.25 («tercera mayor»), base
#   16px, rango de viewport 320-1024px (el máximo es literalmente
#   `PUNTO_DE_CORTE_NAVEGACION_PX`, no un valor nuevo).
# - Escala de espaciado: rejilla de 8px de Material Design
#   (https://m3.material.io/foundations/layout/understanding-layout/spacing),
#   pasos 4/8/12/16/24/32/48/64/96.
# - Contrato heredado (`Downloads/ClinicaVeterinariaGalapavet.zip` →
#   `Veterinaria La Sierra.dc.html`): se descartan sus valores numéricos de
#   `font-size` y su paleta azul/naranja/cian/verde (ya descartada por
#   Decisión 8). Se reutiliza SOLO su arquitectura general (custom properties
#   CSS conmutadas por atributo de raíz, `clamp()` para tipografía fluida,
#   patrón de `prefers-reduced-motion` que anula duración de
#   animación/transición), según `github.md` del zip original.
#
# ============================================================================
# LOS COLORES DE LAS 4 VARIANTES, VERIFICADOS CON LA FÓRMULA REAL ANTES DE FIJARSE
# ============================================================================
# Cada ratio de este fichero se recalculó a mano el 22/08/2026 con una réplica
# exacta del algoritmo de `src/lib/contraste.ts` (mismos pesos de luminancia
# relativa, misma compensación 0.05), NO a ojo y NO con otra herramienta. Los
# valores de control (morado/blanco 9.13, verde/blanco 5.68, lima/morado 4.84,
# lima/blanco 1.89, negro/blanco 21.00) coinciden dígito a dígito con los ya
# aprobados en `tokens_marca.feature`, lo que confirma que la réplica usa la
# misma fórmula. `tdd_craftsman` debe re-verificar estos números él mismo con
# el módulo real antes de fijarlos en `_tokens.scss` (Decisión 23), no darlos
# por buenos sin repetir el cálculo.
#
#   | variante | fondo     | mezcla                          | texto     | ratio texto/fondo |
#   | marca    | #FFFFFF   | (ninguna, ya done en tokens.ts) | #77286B   | 9.13               |
#   | lima     | #F8F9E8   | blanco + 10% lima (rango 8-15%) | #77286B   | 8.57               |
#   | verde    | #F0F4F1   | blanco + 8% verde (rango 6-10%) | #48704B   | 5.12               |
#   | noche    | #000000   | negro puro (opción de Decisión 24, la más trazable: el par blanco/negro ya está verificado 21.00 en tokens_marca.feature @s2) | #FFFFFF | 21.00 |
#
# Los porcentajes de mezcla 10% (lima) y 8% (verde) son una decisión de este
# fichero dentro de los rangos que fija Decisión 24 (8-15% y 6-10%): con esos
# dos valores exactos, mezclando canal a canal blanco con el color de marca
# (redondeo estándar), el fondo resultante es #F8F9E8 y #F0F4F1 — los mismos
# hexadecimales de ejemplo que ya cita el encargo de esta feature. Un
# porcentaje distinto dentro del rango es una decisión de implementación
# legítima siempre que el ratio recalculado con `contraste.ts` siga
# cumpliendo los mínimos de @s3/@s5; si `tdd_craftsman` elige otro punto del
# rango, actualiza estos escenarios en el mismo commit.
#
# Colores de foco por variante (deben dar ≥3:1 contra el FONDO REAL de esa
# variante, no contra un fondo genérico): morado (#77286B) sirve en
# marca/lima/verde (9.13 / 8.57 / 8.22); lima (#B4C718) sirve en noche
# (11.12, idéntico al ya citado «negro sobre lima» de datos-galapavet.md
# §10.1 — el ratio no cambia según cuál de los dos colores hace de texto y
# cuál de fondo); lima sobre blanco puro NO sirve (1.89, @s10).
#
# El morado en la variante «noche» (2.30 contra negro puro) es la misma
# consecuencia mecánica que `tokens_marca.feature` (PENDIENTE) y
# `selector_paleta.feature` (PENDIENTE) ya predijeron sin resolver: «el
# morado no alcanza 3:1 contra ningún fondo más oscuro que él mismo… 2,30:1
# máximo contra negro puro». Este fichero la CIERRA (@s8): en «noche» el
# morado solo puede usarse como fondo o superficie, nunca como texto ni como
# borde/foco.
#
# ============================================================================
# PATRONES DE MEMORIA ORGANIZACIONAL CITADOS (`.memoria-cache/patterns/`)
# ============================================================================
# - `tokens/contraste-de-tokens-verificado-por-matriz-de-uso.md`: el contraste
#   de un sistema de tokens se verifica con una MATRIZ DE USO — la lista
#   explícita de pares (color, fondo, uso) que la página pinta de verdad,
#   recalculada DESDE EL TEXTO REAL de `_tokens.scss`, no con hexadecimales
#   duplicados a mano que puedan divergir del fichero real sin que ninguna
#   prueba se entere. @s2/@s3/@s5/@s6/@s7/@s8 siguen ese principio: leen el
#   valor declarado del propio fichero de tokens antes de calcular el ratio.
# - `responsive/red-css-para-rama-solo-js-en-ssg.md`: toda bifurcación de UI
#   decidida en JS necesita una red CSS en el MISMO breakpoint. Este proyecto
#   es CSR puro (`ReactDOM.createRoot`, sin prerender SSG — `src/main.tsx`),
#   así que el riesgo específico de HTML horneado pre-hidratación NO aplica
#   («Cuándo NO aplica» del propio patrón), pero el PRINCIPIO subyacente sí:
#   si la maquetación de la cabecera declarase un punto de corte de CSS
#   distinto del que usa `esMovil()` en JS, existiría un ancho de ventana en
#   el que la rama que React ya decidió y la rama que el CSS maquetaría no
#   coincidirían — la misma «franja intermedia» del patrón, con otra causa.
#   @s25-@s27 lo cierran.
# - `testing/verificacion-en-vivo-en-navegador-real-caza-el-verde-que-no-funciona.md`:
#   ninguna puerta unitaria (jsdom, lectura de texto SCSS, mutación) ve lo que
#   el motor de render REALMENTE compone. Por eso @s12, @s27, @s28, @s29,
#   @s30, @s31, @s32 y @s34 se verifican sobre el `dist/` de producción
#   (`vite build && vite preview`) con navegador real, declarado
#   explícitamente en cada uno, después de que las puertas unitarias estén en
#   verde — nunca en su lugar.
#
# ============================================================================
# QUÉ CIERRA ESTA FEATURE (COMO CONSECUENCIA, NO COMO ESCENARIO PROPIO)
# ============================================================================
# `accesibilidad.feature` (feature 19, status «in_progress») dejó 4 escenarios
# sin poder pasar en verde de verdad porque no había ninguna maquetación real
# que auditar: @s2/@s7 (la regla `target-size` de axe-core, que @s7 incluye
# dentro del nivel «WCAG 2.2 AA» que @s2 audita), @s17 (la cabecera fija no
# tapa el foco), @s18 (área y contraste del indicador de foco) y @s19 (ninguna
# animación en curso con menos movimiento). Esta feature NO redefine esos
# cuatro escenarios ni los copia aquí: construye la maquetación real que hace
# que, al ejecutarlos, pasen. @s28, @s30, @s31, @s32 y @s34 de este fichero
# citan expresamente en su Then cuál de los cuatro cierran.
#
# ============================================================================
# QUÉ NO SE REABRE
# ============================================================================
# Ningún Given/When/Then de `cabecera_y_navegacion.feature`,
# `selector_paleta.feature`, `tokens_marca.feature` ni de las 17 features de
# sección/página restantes cambia. Esta feature maqueta lo que esos ficheros
# ya describen en prosa (p. ej. «en escritorio se ven todos los enlaces de
# navegación en horizontal» de `cabecera_y_navegacion.feature`), sin tocar su
# árbol accesible, sus atributos ARIA ni sus datos. `calcularRatioContraste`
# y `esAptoParaUso` (`src/lib/contraste.ts`) se REUTILIZAN tal cual, ya
# probados al 100 % por `tokens_marca.feature`; ningún escenario de aquí
# vuelve a probar esas dos funciones en abstracto, solo las aplica a los
# nuevos pares de color de las 4 variantes.
#
# ============================================================================
# POR QUÉ NINGÚN THEN HABLA DE CLASES CSS
# ============================================================================
# Este repositorio corre los tests con los CSS Modules desactivados. Todo
# Then de este fichero se afirma sobre: el valor de un custom property leído
# del propio fichero de tokens, un ratio de contraste calculado con la
# fórmula real, un tamaño en píxeles CSS declarado o medido, la presencia de
# un fichero de estilos co-localizado, o una magnitud vista en NAVEGADOR REAL
# (rectángulo delimitador, `getComputedStyle`, animaciones en curso).
# Ninguna aserción lee ni compara un `className`.
#
# ============================================================================
# ALCANCE FUERA DE ESTA FEATURE
# ============================================================================
# Pixel-perfect de diseño creativo, ilustraciones o iconografía a medida, y
# cualquier animación decorativa nueva más allá de transiciones funcionales
# mínimas (hover, expansión de acordeón/tarjeta) con su propio respeto de
# `prefers-reduced-motion`. El objetivo es un sitio real, coherente, con la
# marca correcta y WCAG 2.2 AA cumplido de verdad — no un rediseño creativo.
#
# ============================================================================
# PENDIENTE
# ============================================================================
# - PENDIENTE: el número exacto de pasos de la escala tipográfica y su tamaño
#   en píxeles en cada extremo del viewport (aparte del paso base, fijado en
#   @s15 porque ratio^0 = 1 hace que sea el mismo valor en los dos extremos
#   por construcción, sin depender de ninguna convención de redondeo de la
#   calculadora). Decisión 24 exige la metodología Utopia (ratio 1.25, base
#   16px, 320-1024px), pero fijar los píxeles concretos de cada paso es tarea
#   de `tdd_craftsman`, consultando la calculadora oficial
#   (https://utopia.fyi/type/calculator/) — no se inventan aquí. @s13-@s18
#   fijan los parámetros y las propiedades estructurales de la escala
#   (fluidez válida, orden creciente, saturación fuera de rango); no fijan
#   los valores intermedios.
# - PENDIENTE: los roles de color más allá de fondo/texto/foco (superficie,
#   borde de tarjeta, color de enlace visitado, etc.) no se fijan en este
#   fichero. Cualquier rol nuevo que `tdd_craftsman` necesite debe pasar por
#   la misma matriz de uso y el mismo cálculo con `contraste.ts` que @s2-@s10
#   ya exigen, aunque el hexadecimal exacto de ese rol quede abierto aquí.
# - PENDIENTE: si el shell común (`App.tsx`, de `ensamblaje_landing`, feature
#   20, ya done) necesita su propio fichero de estilos para el esqueleto
#   visual (p. ej. que el pie de página no quede flotando en páginas cortas),
#   no se fija en este fichero: `App.tsx` no es ni un «componente» de
#   `src/components/` ni una «página» de `src/pages/`, así que el criterio de
#   aceptación 2 de la feature 21 («cada componente y página ya done») no lo
#   alcanza literalmente. Se deja como refuerzo posterior si el navegador real
#   lo revela como necesario, no se esconde.
# - PENDIENTE: `MetadatosPagina` (`src/components/MetadatosPagina.tsx`) queda
#   fuera del inventario de @s21 a propósito: no tiene representación visual
#   (`return null`), solo escribe en `<head>`. No necesita maquetación.
# ============================================================================

Feature: Sistema de diseño visual: tokens SCSS reales y maquetación de todos los componentes
  Como equipo del proyecto quiero que el sitio real tenga los tokens de color,
  tipografía y espaciado que su arquitectura ya declaraba, aplicados a cada
  componente y página ya construidos, para dejar de servir HTML sin estilos y
  para que las verificaciones de accesibilidad que dependen de layout real
  puedan por fin pasar en verde de verdad.

  # ---------------------------------------------------------------------------
  # A. TOKENS DE COLOR DE LAS 4 VARIANTES (custom properties conmutadas por [data-variante])
  # ---------------------------------------------------------------------------

  @s1
  Scenario: El inventario de variantes con tokens de color es exactamente el ya fijado por el selector de paleta
    Given un literal escrito a mano con los 4 identificadores de variante ya fijados por selector_paleta.feature: "marca", "lima", "verde" y "noche"
    When se consulta el inventario de variantes para las que existen tokens de color
    Then el inventario contiene exactamente esas 4 variantes
    And el inventario no contiene ninguna variante que no esté en ese literal
    And el literal del escenario está escrito a mano y no se obtiene del inventario que comprueba

  @s2
  Scenario: La variante "marca" reutiliza el fondo blanco y el texto morado ya verificados
    Given los tokens de color reales declarados para la variante "marca"
    When leo el valor de su token de fondo y de su token de texto
    Then el token de fondo vale exactamente "#FFFFFF"
    And el token de texto vale exactamente "#77286B"
    And el ratio de contraste calculado entre esos dos valores con la fórmula de contraste.ts, redondeado a dos decimales, es 9.13
    And ese ratio es mayor o igual que 4.5

  @s3
  Scenario: La variante "lima" deriva su fondo de una mezcla de blanco y lima dentro del rango decidido
    Given los tokens de color reales declarados para la variante "lima"
    When leo el valor de su token de fondo y de su token de texto
    Then el token de fondo vale exactamente "#F8F9E8"
    And ese fondo es blanco mezclado con un 10% de lima de marca, dentro del rango 8-15% de la Decisión 24
    And el token de texto vale exactamente "#77286B"
    And el ratio de contraste calculado entre esos dos valores, redondeado a dos decimales, es 8.57
    And ese ratio es mayor o igual que 4.5

  @s4
  Scenario: La variante "lima" nunca declara el lima de marca como color de texto
    Given los tokens de color reales declarados para la variante "lima"
    When leo qué color hace de texto en esa variante
    Then el color de texto declarado no es "#B4C718"
    And el ratio calculado del lima de marca sobre el fondo de esa variante, redondeado a dos decimales, es 1.77
    And ese ratio es menor que 4.5

  @s5
  Scenario: La variante "verde" deriva su fondo de una mezcla de blanco y verde profundo dentro del rango decidido
    Given los tokens de color reales declarados para la variante "verde"
    When leo el valor de su token de fondo y de su token de texto
    Then el token de fondo vale exactamente "#F0F4F1"
    And ese fondo es blanco mezclado con un 8% de verde profundo de marca, dentro del rango 6-10% de la Decisión 24
    And el token de texto vale exactamente "#48704B"
    And el ratio de contraste calculado entre esos dos valores, redondeado a dos decimales, es 5.12
    And ese ratio es mayor o igual que 4.5

  @s6
  Scenario: La variante "noche" usa fondo negro puro y texto blanco con el ratio máximo ya verificado
    Given los tokens de color reales declarados para la variante "noche"
    When leo el valor de su token de fondo y de su token de texto
    Then el token de fondo vale exactamente "#000000"
    And el token de texto vale exactamente "#FFFFFF"
    And el ratio de contraste calculado entre esos dos valores, redondeado a dos decimales, es 21.00
    And ese ratio es idéntico al ya verificado en tokens_marca.feature @s2 para negro sobre blanco

  @s7
  Scenario: La variante "noche" usa el lima de marca como color de foco, apto sobre fondo negro
    Given los tokens de color reales declarados para la variante "noche"
    When leo qué color hace de foco en esa variante
    Then el token de foco vale exactamente "#B4C718"
    And el ratio de contraste calculado entre ese color y el fondo de la variante, redondeado a dos decimales, es 11.12
    And ese ratio es mayor o igual que 3
    And ese mismo ratio 11.12 ya está verificado como «negro sobre lima» en docs/datos-galapavet.md §10.1: el ratio no cambia según cuál de los dos colores hace de texto y cuál de fondo

  @s8
  Scenario: La variante "noche" nunca declara el morado de marca como texto ni como foco
    Given los tokens de color reales declarados para la variante "noche"
    When calculo el ratio de contraste del morado de marca "#77286B" contra el fondo de esa variante
    Then el ratio calculado, redondeado a dos decimales, es 2.30
    And ese ratio es menor que 3
    And ni el token de texto ni el token de foco de la variante "noche" valen "#77286B"
    And ese literal 2.30 ya está citado como consecuencia mecánica en tokens_marca.feature y en selector_paleta.feature: no se reabre, se cumple

  @s9
  Scenario: El color de foco de cada variante clara alcanza el mínimo de componente de interfaz contra su propio fondo
    Given los tokens de color reales declarados para las variantes "marca", "lima" y "verde"
    When calculo el ratio de contraste entre el token de foco y el token de fondo de cada una
    Then el ratio de "marca", redondeado a dos decimales, es 9.13
    And el ratio de "lima", redondeado a dos decimales, es 8.57
    And el ratio de "verde", redondeado a dos decimales, es 8.22
    And los tres ratios son mayores o iguales que 3

  @s10
  Scenario: El lima de marca no sirve como color de foco sobre un fondo blanco puro
    Given el lima de marca "#B4C718" y el fondo blanco puro "#FFFFFF"
    When calculo su ratio de contraste
    Then el ratio calculado, redondeado a dos decimales, es 1.89
    And ese ratio es menor que 3
    And ningún token de foco de ninguna variante clara vale "#B4C718"

  @s11
  Scenario: Con el catálogo de variantes de color vacío la comprobación de contraste falla cerrada
    Given un catálogo de tokens de color de variantes sin ninguna entrada
    When se ejecuta la comprobación de contraste de las variantes de paleta
    Then el recuento de variantes efectivamente comprobadas es 0
    And el veredicto es suspenso
    And el informe declara que no se comprobó ninguna variante
    And el veredicto no es aprobado pese a que el recuento de violaciones también sea 0

  @s12
  Scenario: Cambiar de variante con el selector ya implementado cambia de verdad el color computado en el navegador
    Given el sitio de Galapavet construido ("vite build && vite preview") con el selector de paleta ya implementado
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige el valor de un custom property CSS efectivamente resuelto por el motor de render
    When se elige, una por una, cada una de las 4 variantes desde el panel del selector
    Then el valor computado del custom property de color de fondo del elemento raíz cambia a cada uno de los 4 valores de fondo declarados
    And el recuento de variantes verificadas en el navegador es exactamente 4

  # ---------------------------------------------------------------------------
  # B. ESCALA TIPOGRÁFICA FLUIDA (metodología Utopia, ratio 1.25, base 16px, 320-1024px)
  # ---------------------------------------------------------------------------

  @s13
  Scenario: Los parámetros de la escala tipográfica son exactamente los de la metodología citada
    Given un literal escrito a mano con los parámetros de la escala tipográfica, transcritos de la calculadora oficial de Utopia (https://utopia.fyi/type/calculator/): ratio 1.25 ("tercera mayor"), tamaño base 16 píxeles, ancho de viewport mínimo 320 píxeles y ancho de viewport máximo 1024 píxeles
    When se consultan los parámetros declarados de la escala tipográfica del proyecto
    Then el ratio declarado es exactamente 1.25
    And el tamaño base declarado es exactamente 16
    And el ancho de viewport mínimo declarado es exactamente 320
    And el ancho de viewport máximo declarado es exactamente 1024
    And esos cuatro literales están escritos a mano y no se obtienen de los parámetros que comprueban

  @s14
  Scenario: El viewport máximo de la escala tipográfica nunca diverge del punto de corte de la cabecera
    Given el ancho de viewport máximo declarado de la escala tipográfica
    And la constante PUNTO_DE_CORTE_NAVEGACION_PX ya fijada y probada en Cabecera-logica.ts, importada en esta comprobación en vez de repetida como literal
    When se comparan ambos valores
    Then son exactamente iguales
    And si Cabecera-logica.ts cambiara ese valor en el futuro, esta comprobación se volvería roja sola

  @s15
  Scenario: En el paso base la escala produce el mismo tamaño en los dos extremos del viewport
    Given el paso base (paso 0) de la escala tipográfica
    When se calcula su tamaño en el viewport mínimo y en el viewport máximo
    Then ambos tamaños son exactamente 16 píxeles
    And no varían entre viewports, porque cualquier ratio elevado a la potencia 0 es 1

  @s16
  Scenario: Cada paso declarado produce un tamaño mínimo menor o igual que su tamaño máximo
    Given el conjunto de pasos declarados de la escala tipográfica
    When se calcula el tamaño de cada paso en el viewport mínimo y en el viewport máximo
    Then el tamaño en el viewport mínimo de cada paso es menor o igual que su tamaño en el viewport máximo
    And el recuento de pasos efectivamente comprobados es mayor que 0

  @s17
  Scenario: Los pasos declarados están ordenados de forma estrictamente creciente en los dos extremos del viewport
    Given el conjunto de pasos declarados de la escala tipográfica, ordenados de menor a mayor
    When se compara el tamaño de cada paso con el del paso anterior, tanto en el viewport mínimo como en el máximo
    Then cada paso produce un tamaño estrictamente mayor que el del paso anterior en ambos extremos
    And ningún paso invierte ese orden entre el viewport mínimo y el máximo

  @s18
  Scenario: Fuera del rango de viewport el tamaño se satura en vez de seguir creciendo o encogiendo
    Given un paso cualquiera de la escala tipográfica, distinto del paso base
    When se calcula su tamaño para un ancho de ventana menor que 320 píxeles y para uno mayor que 1024 píxeles
    Then el tamaño calculado para el ancho menor que 320 es exactamente igual a su tamaño en el viewport mínimo
    And el tamaño calculado para el ancho mayor que 1024 es exactamente igual a su tamaño en el viewport máximo

  # ---------------------------------------------------------------------------
  # C. ESCALA DE ESPACIADO (rejilla de 8px de Material Design)
  # ---------------------------------------------------------------------------

  @s19
  Scenario: La escala de espaciado declara exactamente los 9 pasos de la rejilla de 8px de Material Design
    Given un literal escrito a mano con los 9 pasos, transcritos de la rejilla de 8px de Material Design (https://m3.material.io/foundations/layout/understanding-layout/spacing): 4, 8, 12, 16, 24, 32, 48, 64 y 96 píxeles
    When se consulta la escala de espaciado declarada del proyecto
    Then la escala contiene exactamente esos 9 valores
    And la escala no contiene ningún valor que no esté en ese literal
    And ese literal está escrito a mano y no se obtiene de la escala que comprueba

  @s20
  Scenario: Ningún paso de la escala de espaciado se aparta de la rejilla de 8px
    Given la escala de espaciado declarada del proyecto
    When se comprueba cada paso contra la rejilla de Material Design
    Then cada paso es un múltiplo de 4 píxeles
    And ningún paso es menor que 4 ni mayor que 96

  # ---------------------------------------------------------------------------
  # D. MAQUETACIÓN CO-LOCALIZADA DE CADA COMPONENTE Y PÁGINA YA DONE
  # ---------------------------------------------------------------------------

  @s21
  Scenario: El inventario de módulos con maquetación propia coincide con la lista escrita a mano de 17 nombres
    Given un literal escrito a mano con 17 nombres: los 12 componentes visuales de src/components ("Cabecera", "CampanasPortada", "Equipo", "Faq", "FormularioContacto", "Galeria", "Hero", "InformacionContacto", "PieDePagina", "ReservaChat", "SelectorPaleta", "Servicios") y las 5 páginas de src/pages ("Landing", "PaginaBlog", "PaginaCampanas", "PaginaNoEncontrada", "PaginaTienda")
    When se consulta el inventario de módulos que deben tener su propio fichero de estilos co-localizado
    Then el inventario contiene exactamente esos 17 nombres
    And el inventario no contiene ningún nombre que no esté en ese literal
    And el inventario no contiene "MetadatosPagina", por no tener representación visual propia
    And ese literal está escrito a mano y no se obtiene del inventario que comprueba

  @s22
  Scenario: Cada nombre del inventario tiene su propio fichero de estilos co-localizado junto a su componente
    Given el inventario de 17 módulos de @s21
    When se comprueba, para cada uno, si existe un fichero "<Nombre>.module.scss" en la misma carpeta que "<Nombre>.tsx"
    Then los 17 módulos tienen su fichero de estilos co-localizado
    And el recuento de módulos efectivamente comprobados es exactamente 17
    And ningún módulo queda sin comprobar por no reconocerse su carpeta

  @s23
  Scenario: Con el inventario de módulos vacío la comprobación de co-localización falla cerrada
    Given un inventario de módulos sin ninguna entrada
    When se ejecuta la comprobación de ficheros de estilos co-localizados
    Then el recuento de módulos efectivamente comprobados es 0
    And el veredicto es suspenso
    And el informe declara que no se comprobó ningún módulo
    And el veredicto no es aprobado pese a que el recuento de módulos sin fichero también sea 0

  @s24
  # Reutiliza la puerta de literales de color YA construida y probada por
  # tokens_marca.feature (@s18-@s22) — no se reescribe ni se vuelve a probar
  # en abstracto, solo se aplica al inventario REAL de esta feature en vez de
  # a los ficheros de prueba con los que tokens_marca.feature la probó.
  Scenario: Ningún fichero de estilos del inventario declara un color literal fuera de los tokens
    Given los 17 ficheros de estilos del inventario de @s21, ya escritos
    When se comprueba si alguno declara un color hexadecimal, una función rgb()/rgba() o un nombre de color CSS fuera del fichero de tokens
    Then ningún fichero es señalado
    And el número de ficheros inspeccionados es exactamente 17
    And la comprobación pasa

  # ---------------------------------------------------------------------------
  # E. PUNTO DE CORTE DE LA CABECERA: SIN DIVERGENCIA ENTRE JS Y CSS
  # ---------------------------------------------------------------------------

  @s25
  Scenario: El punto de corte usado por la maquetación de la cabecera es exactamente el mismo que usa su lógica en JS
    Given el valor de PUNTO_DE_CORTE_NAVEGACION_PX ya fijado y probado en Cabecera-logica.ts (1024)
    And el punto de corte declarado en la maquetación de la cabecera, leído como texto de su propio fichero de estilos
    When se comparan ambos valores
    Then son exactamente iguales
    And ninguna otra regla de la maquetación de la cabecera declara un punto de corte distinto de ese valor

  @s26
  Scenario: Un punto de corte de CSS un píxel distinto del de JS deja un ancho con las dos ramas en desacuerdo
    Given un punto de corte de CSS hipotético de 1025 píxeles, un píxel mayor que PUNTO_DE_CORTE_NAVEGACION_PX
    When se evalúa un ancho de ventana de exactamente 1024 píxeles con la regla de JS (esMovil) y con ese punto de corte de CSS hipotético
    Then esMovil(1024) determina la rama de escritorio
    And ese punto de corte de CSS hipotético seguiría aplicando la maquetación de móvil a ese mismo ancho de 1024 píxeles
    And esa divergencia es exactamente la «franja intermedia» que este proyecto evita fijando un único literal de 1024 para ambos

  @s27
  Scenario: En el ancho exacto del punto de corte la cabecera real muestra la maquetación de escritorio, y un píxel por debajo la de móvil
    Given el sitio de Galapavet construido ("vite build && vite preview")
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque exige el layout real que aplica el CSS junto con la rama que ya decide React
    When se mide la cabecera con la ventana en 1024 píxeles de ancho y, por separado, en 1023 píxeles de ancho
    Then a 1024 píxeles la fila de navegación horizontal está presente y ocupa un ancho mayor que 0
    And a 1023 píxeles la fila de navegación horizontal no está presente y el botón de menú sí lo está
    And ningún elemento de la cabecera se desborda ni se superpone con otro en ninguno de los dos anchos

  # ---------------------------------------------------------------------------
  # F. ÁREA TÁCTIL MÍNIMA EN EL SITIO REAL (cierra accesibilidad.feature @s2/@s7)
  # ---------------------------------------------------------------------------

  @s28
  Scenario: Sobre el sitio real construido, el análisis automático con la regla target-size no reporta ninguna violación
    Given el sitio de Galapavet construido ("vite build && vite preview")
    And esta verificación se ejecuta con navegador real (Claude in Chrome / skill browser-automation), fuera del gate de Vitest/Stryker, según la Decisión 11 de project-spec.md, porque la regla target-size de axe-core exige el layout real que jsdom no calcula
    When se ejecuta axe-core con la regla target-size sobre la portada
    Then el recuento de violaciones de target-size es exactamente 0
    And esto cierra @s2/@s7 de accesibilidad.feature (feature 19) como consecuencia de esta maquetación, no como un escenario propio de ese fichero

  @s29
  Scenario: Cada enlace de navegación, de pie de página y de teléfono mide al menos 24 por 24 píxeles CSS en el sitio real
    Given el sitio de Galapavet construido ("vite build && vite preview")
    And esta verificación se ejecuta con navegador real, por el mismo motivo que @s28
    When se mide el rectángulo delimitador real de cada enlace de navegación, de pie de página y de teléfono de la portada
    Then el ancho medido de cada uno es mayor o igual que 24 píxeles CSS
    And el alto medido de cada uno es mayor o igual que 24 píxeles CSS
    And el recuento de enlaces efectivamente medidos es mayor que 0

  # ---------------------------------------------------------------------------
  # G. INDICADOR DE FOCO EN EL SITIO REAL (cierra accesibilidad.feature @s17/@s18)
  # ---------------------------------------------------------------------------

  @s30
  Scenario: El indicador de foco real alcanza el área mínima de un perímetro de 2 píxeles CSS
    Given el sitio de Galapavet construido ("vite build && vite preview")
    And esta verificación se ejecuta con navegador real, según la Decisión 11 de project-spec.md, porque exige píxeles efectivamente renderizados en dos estados
    When cada control interactivo de la portada recibe el foco por teclado
    Then el área del indicador de foco de cada control es al menos la de un perímetro de 2 píxeles CSS de grosor alrededor del control sin foco
    And el recuento de controles comprobados es mayor que 0
    And esto cierra la primera mitad de @s18 de accesibilidad.feature (feature 19)

  @s31
  Scenario: El contraste real del indicador de foco alcanza 3:1 entre el estado con foco y sin foco
    Given el sitio de Galapavet construido ("vite build && vite preview")
    And esta verificación se ejecuta con navegador real, por el mismo motivo que @s30
    When cada control interactivo de la portada recibe el foco por teclado
    Then el ratio de contraste calculado entre los mismos píxeles en estado con foco y sin foco es mayor o igual que 3
    And esto cierra la segunda mitad de @s18 de accesibilidad.feature (feature 19)

  @s32
  Scenario: La cabecera fija real no tapa por completo el control que recibe el foco
    Given el sitio de Galapavet construido ("vite build && vite preview"), desplazado de modo que el siguiente control enfocable quedaría bajo la cabecera fija
    And esta verificación se ejecuta con navegador real, según la Decisión 11 de project-spec.md, porque depende del rectángulo real de la cabecera fija y del control
    When ese control recibe el foco por teclado
    Then al menos parte del rectángulo del control enfocado queda fuera del rectángulo de la cabecera fija
    And esto cierra @s17 de accesibilidad.feature (feature 19)

  # ---------------------------------------------------------------------------
  # H. PREFERS-REDUCED-MOTION (cierra accesibilidad.feature @s19)
  # ---------------------------------------------------------------------------

  @s33
  Scenario: Toda regla de animación o transición introducida vive dentro de la consulta prefers-reduced-motion
    Given los ficheros de estilos del inventario de @s21 que declaran alguna propiedad "animation" o "transition"
    When se lee su texto
    Then cada una de esas reglas está contenida dentro de un bloque "@media (prefers-reduced-motion: no-preference)", o su duración se anula dentro de un bloque "@media (prefers-reduced-motion: reduce)"
    And el recuento de ficheros con animación o transición efectivamente comprobados es mayor que 0

  @s34
  Scenario: Con la preferencia de menos movimiento activa ninguna animación ni transición introducida está en curso en el sitio real
    Given el sitio de Galapavet construido ("vite build && vite preview") y un visitante que ha pedido menos movimiento en su sistema
    And esta verificación se ejecuta con navegador real, según la Decisión 11 de project-spec.md, porque exige interrogar el motor de animaciones CSS con las hojas de estilo aplicadas
    When se carga la portada y se interactúa con cualquier control que en condiciones normales anima (por ejemplo, expandir una tarjeta del acordeón)
    Then ningún elemento tiene una animación en curso
    And ninguna transición se ejecuta con una duración perceptible: el techo real es "0.01ms" (no "0" literal), a propósito, para que sigan disparándose los eventos "transitionend"/"animationend" que algo pueda estar esperando (ver src/styles/global.scss)
    And esto cierra @s19 de accesibilidad.feature (feature 19)
