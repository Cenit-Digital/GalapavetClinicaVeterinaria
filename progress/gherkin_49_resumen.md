# Feature 49 — resumen del contrato para firmar (13/10/2026, tras el panel de revisión)

> Escrito para Pablo, sin jerga. El contrato completo vive en
> `features/cabecera_sobre_el_hero.feature` (lo nuevo y el índice) y en los ficheros
> que se enmiendan. Aquí solo está el mapa de qué cambia y por qué.
> **Nada de esto está firmado todavía y no se escribe código hasta que lo firmes.**
> Va **después** de la feature 48 (el hero reducido y animado): comparte con ella
> varios ficheros. Esta versión recoge la respuesta del craftsman_lead a las cinco
> dudas de la primera redacción (§11) y las correcciones del panel de revisión
> de cuatro revisores independientes (§10).

## 1. Qué firmas, en siete líneas

1. En la **portada**, la foto del hero sube hasta el borde de arriba de la pantalla
   y la cabecera va **transparente encima**, sin desenfoque, mientras el hero siga
   debajo. El hero es pantalla completa (tu decisión P5): mide al menos la pantalla
   y la cabecera no suma altura.
2. En **Blog, Tienda, Campañas y la página «no encontrada»**, y en la portada en
   cuanto bajas del hero, la cabecera es **sólida**: tinta de la paleta y texto
   `sobre-primario`. Mide siempre 64 píxeles. **El cambio de transparente a sólida es
   instantáneo: sin fundido y sin sombra** (ver §7, duda 4). En las demás rutas es
   sólida desde el primer fotograma. En la portada el estado de arranque depende **solo
   de dónde está la página** (en lo alto, transparente; ya desplazada tras una recarga,
   sólida): un enlace como `/#contacto` no lo cambia (ver la observación de §8).
3. Los **ocho enlaces del menú pasan a 16 px** (paso 0 de la escala, no una
   excepción), caben en **una fila a 1024 px** sin cortar el descriptor «Centro
   integral veterinario», el hueco entre letras queda uniforme y ningún objetivo
   baja de 48 px. Esto cierra la feature 46.
4. El **velo** sobre la foto es el B de la maqueta que viste: un degradado
   horizontal (0,80 · 0,68 · 0,30 · 0,22 al 0 · 45 · 75 · 100 % del ancho) **más una
   franja oscura arriba** (0,55 en el borde, 0 al 22 % de la altura). La franja la
   omitieron por error tus decisiones escritas; ahora es **obligatoria**. **En
   pantallas de menos de 1024 px el velo puede ser algo más oscuro** (ver §7, duda 3).
5. El **texto del menú, la marca y el anillo de foco** se miden sobre **los píxeles
   reales** de la foto, en las cinco paletas, incluida `tech`. Las pruebas viejas
   medían contra el fondo de la página y daban verde sin mirar la foto; se
   reescriben y se demuestra que pueden ponerse rojas.
6. El enlace de la **página actual** se subraya y pesa 600; el del **puntero
   encima** se subraya sin cambiar de peso; **ninguna caja del menú se mueve** en
   ningún caso. **El borde de «Tienda» es del color de su texto**, como en la maqueta
   (ver §7, duda 2). El **panel del móvil** queda exactamente como está y el **logo
   temporal** se ve bien sobre la foto con el tratamiento que se elija.
7. La **matriz de contraste** declara el par del texto del menú con su uso, sin
   cambiar sus recuentos (23 filas, 115 parejas), y la feature **no se cierra** sin
   que `pnpm run test:e2e` termine con código 0 y quede citado.

## 2. Todo lo que cambia, escenario a escenario

«@sN» es el número del escenario dentro de su fichero. Aquí va **toda línea que no es
comentario y cambia** en los ficheros enmendados. «Revisado» significa que la letra no
cambia pero queda una nota que explica por qué sigue valiendo. **La 49 no toca
ninguna historia de usuario ni ninguna descripción de `Feature:`.**

| Escenario | Fichero | Qué cambió (antes → después) | Por qué |
| --- | --- | --- | --- |
| @s2 | `fidelidad_cabecera` | Línea del objetivo de pulsación: **44×44 → 48×48** para los ocho enlaces. **Se añade** una línea: tamaño de letra **16 px, paso 0** de la escala | Tu P3; lo exige también la feature 46. Ya medían 48 |
| @s4 | `fidelidad_cabecera` | La línea «el primer contenido de la portada arranca justo bajo la cabecera» se **parte en dos**: en las otras 5 rutas sigue igual; en la portada **el hero sube bajo la cabecera** (borde superior en y = 0, solape = alto de la cabecera). Ese «y = 0» vive **solo aquí** | Tu punto 1. El resto de G1 (alto de la cabecera = hueco que reserva la página, sin tolerancia) **sigue en pie** |
| @s6 | `fidelidad_cabecera` | Dos líneas: texto de «Tienda» de «tinta fuerte» a **el mismo color que los otros siete** (`sobre-primario`); su tamaño de letra, de «paso existente» a **16 px, igual que los demás** | Tu P2: un solo juego de colores. La «tinta fuerte» pasaría a ser el fondo y el texto no se vería |
| @s7 | `fidelidad_cabecera` | **Reescrito entero** (título, «Given», «When», «Then»). Líneas **retiradas**: «el borde de Tienda contrasta menos contra el fondo que el borde de control»; **«aun así su ratio de contraste contra ese fondo no baja de 3 a 1»** (pasa al nuevo «Then»); «el valor suavizado sale de una única regla…». **Nuevas**: el borde es **del color del texto** de «Tienda» y se ve (ancho mayor que 0); el contraste del borde contra el peor píxel de detrás, **medido con el propio borde transparente en la captura**, ≥ 3 a 1 sobre la foto y sobre la sólida; los demás botones conservan su borde; regla única de tokens existentes; sin color literal; píxeles muestreados > 0 | La suavidad F3 (borde «más suave») **no se puede cumplir** sobre la foto: medido, da de 2,1 a 2,5 a 1 en cuatro paletas y 1,12 en `tech`, y el mínimo es 3. **Vuelve a ti, ver §7 duda 2** |
| (hueco) | `fidelidad_cabecera` | Una **línea en blanco** añadida antes del bloque «CUARTA ACTUALIZACIÓN» (solo formato; no es ninguna cláusula) | Separar el bloque nuevo |
| @s27 | `sistema_de_diseno_visual` | **Tres líneas añadidas** a 1024 px: ocho enlaces en una fila; descriptor entero y marca sin comprimir (256,84 px); **92 px o más** de holgura entre marca y menú (en la portada y en `/blog`), con la barra de desplazamiento superpuesta. **Cuarta línea**: el relleno lateral de los siete enlaces de texto es el de la escala (8 px) | «No se solapa ni desborda» daba verde aunque el descriptor saliera cortado (pasa a 20 px). La cifra depende del entorno, ver §5 punto 12 |
| @s28 | `rediseno_visual` | «La cabecera se mantiene visible» → **su caja ocupa los 64 px de arriba en cualquier posición y en sus dos estados**; **una línea añadida**: el salto a una sección da el mismo resultado desde la cabecera transparente y desde la sólida | La cabecera ya no es una franja con fondo; el salto debe seguir descontando su altura real |
| @s29 | `rediseno_visual` | **Tres cláusulas**: el «When» (de «se inspecciona la sección de bienvenida» a «en un navegador real, con la entrada del hero en estado estable»); la línea del velo pasa de «de tokens» a **degradado horizontal + franja superior**; la del contraste, de «calculado contra una parada del velo» a **medido sobre los píxeles de la foto** (titular 3 a 1, párrafo 4,5 a 1) **a 1440, 1024 y 375 px** | El velo es de esta feature (P4). **Pierde generalidad**: vale «para esta foto», no «para cualquier foto» |
| @s38 | `identidad_visual` | Una línea reescrita (contraste del anillo **leído de capturas**, no del fondo de un ancestro) y una añadida (la marca y los ocho enlaces cuentan entre los controles comprobados: **portada con la cabecera transparente y una subpágina con la sólida**) | Las pruebas subían hasta el primer fondo opaco: con la cabecera transparente llegaban a la página, no a la foto |
| @s39 | `identidad_visual` | El «When» ahora lee los píxeles realmente pintados; **dos líneas añadidas** (sobre la foto «el fondo» es el peor píxel; la cabecera cuenta, en sus dos estados) | Mismo defecto |
| @s18 | `accesibilidad` | Una línea reescrita (contraste del anillo medido sobre píxeles reales) y una añadida (la cabecera cuenta, en sus dos estados) | Mismo defecto |

**Solo notas (letra sin cambiar):** `fidelidad_cabecera` @s1 revisado; `cabecera_y_navegacion`
@s1 revisado y el «PENDIENTE» del 1024 actualizado (las cifras de holgura, por entorno);
`rediseno_visual` @s26; `fidelidad_responsive_integral` @s4 y @s6; `sistema_de_diseno_visual`
@s14, @s25 y @s26; `identidad_visual` @s30 (la foto deja de ser el elemento principal),
@s40 y la nota del parque de navegadores; `accesibilidad` @s17; y 4 notas en
`retirada_carteleria_urgencias.feature` (F3, G1, tabla A y tabla B), que es un fichero
firmado: **su texto no comentado no se ha tocado**, comprobado con `diff`. La nota de F3
dice ahora que la suavidad se retira (una nota, no una cláusula).
**No he tocado `hero.feature`**: ningún escenario suyo fija el velo ni la cabecera.

**Cuenta:** 10 escenarios con letra cambiada, en 5 ficheros (`fidelidad_cabecera` 4,
`rediseno_visual` 2, `sistema_de_diseno_visual` 1, `identidad_visual` 2, `accesibilidad` 1),
más 11 revisados sin cambiar la letra.

## 3. Los 23 escenarios nuevos (en `cabecera_sobre_el_hero.feature`)

| # | Qué fija, en una frase |
| --- | --- |
| @s1 | **Quién decide el estado**: la ruta, si el hero sigue bajo la cabecera y, si aún no hay informe, **solo la posición de la página** (3 situaciones, 18 combinaciones; el ancla no cuenta) |
| @s2 | La cabecera cambia de estado cuando **un observador de intersección** lo informa, y el estado vive en **un atributo `data-*`, no en una clase** (ver §8) |
| @s3 | **Ningún oyente de scroll** en los ficheros de la cabecera y de la portada (cero, y es un disparador) |
| @s4 | En el navegador: transparente solo en la portada con el hero debajo; **sólida desde el primer fotograma** en las demás rutas; sigue bien al navegar sin recargar (Campañas → «Inicio») y al volver con «Atrás» |
| @s5 | **Sin parpadeo**: con el ancho aún sin medir, ni la hamburguesa sale sobre la foto en escritorio ni el menú de escritorio en un móvil, y **la cabecera nunca está sin ningún control de navegación visible** |
| @s6 | La foto llega a y = 0 y la cabecera transparente **no pinta nada** entre sus controles; el hero mide al menos la pantalla contando la cabecera y la sección siguiente arranca justo debajo |
| @s7 | La sólida es de **tinta con texto `sobre-primario`**, y el texto tiene el **mismo color** en los dos estados; ninguna opacidad de la cabecera ni de sus ancestros; **sin desenfoque ni sombra en ningún estado** |
| @s8 | **64 px en los dos estados**, cambiar de estado no mueve nada (CLS 0), el hueco de las anclas y el enlace «Saltar al contenido» no cambian |
| @s9 | El **velo B**: degradado horizontal con los cuatro tramos **y franja superior** (se mide con una foto negra y otra blanca); en pantallas estrechas **nunca más claro** que en escritorio |
| @s10 | **Contraste del texto de la cabecera** sobre el peor píxel real **de la caja del texto**: 220 medidas (5 paletas, 3 anchos, 2 estados) |
| @s11 | **Anillo de foco** a 3 a 1 contra el peor píxel que lo rodea: 200 medidas |
| @s12 | **Las pruebas de píxeles pueden ponerse rojas**: 23 filas de prueba (escenas y sabotajes del sitio real, incluidos el borde de «Tienda» y la foto bloqueada); y no aprueban lo que no han podido medir |
| @s13 | El tamaño de letra del menú **sale del paso 0 de la escala**, escrito o heredado (no es un 16 px a mano), y «Tienda» no es una excepción |
| @s14 | **Ritmo uniforme entre letras** (no entre cajas, tolerancia 3 px), con la píldora «Tienda» como única diferencia intencionada (al menos 8 px más) |
| @s15 | **Ninguna hoja de las que tocan las features 48 y 49 gana un `@media` de anchura nuevo**, salvo **una** autorizada: el velo más oscuro de las pantallas estrechas |
| @s16 | Enlace actual: subrayado + peso 600; puntero encima: subrayado sin cambio de peso; **ninguna caja del menú se mueve** (0,5 px); y se leen |
| @s17 | La **matriz de contraste**: el par del texto del menú con su uso, 23 filas y 115 parejas |
| @s18 | **El cambio de estado es instantáneo** con y sin movimiento reducido: 0 fotogramas con el fondo a medias |
| @s19 | El **panel móvil** y el botón de menú son idénticos con la cabecera en los dos estados; el texto de «Tienda» del panel se mide sobre su caja de texto |
| @s20 | **LCP** (mediana de 5 cargas ≤ 2500 ms, antes y después a la vista de Pablo) y **CLS**: el candidato de LCP tiene que estar en el hero |
| @s21 | El **logo temporal** se ve bien con el tratamiento que se elija (círculo, fondo u opacidad); si es el círculo, deja ver la foto en las esquinas (8 puntos por estado) |
| @s22 | **Portada cargada con ancla o recargada ya desplazada**: sin parpadeo; con ancla la página queda en lo alto y la cabecera es transparente desde el primer fotograma; recargada desplazada, sólida desde el primero |
| @s23 | **Cierre**: lint, tipos, compilación, pruebas, **`pnpm run test:e2e`** y mutación terminan limpios, y el informe de cierre lo cita |

## 4. Previsión de contraste (cálculo, no medida)

El craftsman_lead calculó el contraste sobre **el peor píxel de la foto** `clinica.webp`
(menú a la derecha de la columna de 1220 px, marca a la izquierda). **Los dos revisores
que lo recalcularon obtuvieron valores entre un 1 y un 10 % distintos**, así que aquí van
rangos y no cifras exactas:

| | Previsión |
| --- | --- |
| Menú, solo con el velo horizontal, 1440 y 1024 | de **4,75** (`tech`, el peor caso) a **6,4** |
| Menú **con la franja superior** | de **7,3** a **9,6** |
| Marca y descriptor | **9,4 o más** solo con el horizontal · **10,5 o más** con la franja |
| Texto del hero a 1440 en `clinica` | titular 5,27 · párrafo 6,06 (medidos) |
| Texto del hero a **1024** | `calida` y `marca` de 4,2 a 4,6 (**por debajo del mínimo de 4,5**, previsión del panel) |
| Texto del hero a **375** | párrafo de 3,2 a 4,1 en `clinica` y de 2,9 a 3,9 en `calida` y `marca` (**en rojo**, previsión del panel) |

El mínimo es 4,5 (3 para el titular, que es texto grande). **El menú pasa en las cinco**,
`tech` con poco margen si no hubiera franja. **El texto del hero no pasa a 1024 ni a 375**
en la previsión, y por eso la duda 3 de §7. Todo esto es una **previsión**: la prueba
válida son @s10, @s11 y @s12 sobre píxeles reales. **NO medido:** la marca a 1024 y a
375 px, el renderizado real con antialiasing, el anillo de foco y el borde de «Tienda»
sobre la foto. Si al medir alguna paleta queda por debajo, el hallazgo vuelve a ti antes
de tocar nada.

## 5. Cosas que he escrito y que NO estaban literales en tus decisiones

Salen de leer el código o de que, sin ellas, lo que pediste quedaría sin poder
comprobarse. Dime si alguna sobra y la quito. Las marcadas con (*) son **ampliaciones de
alcance** que los revisores señalaron y que puedes preferir no tener.

1. **El estado inicial de la portada se decide con la posición de la página antes del
   primer dibujo** (@s1, @s22): en lo alto, transparente; ya desplazada, sólida. **El
   enlace a una sección (`#contacto`) no cuenta**: en este sitio el navegador no
   desplaza la página a la sección al cargar (medido: la página se queda en lo alto en
   todos los fotogramas), así que la regla es una sola y valdría también si algún día lo hiciera.
2. **«Sólida» = tinta con opacidad efectiva de 0,94 o más** (@s4, @s7). La maqueta que
   viste la pintaba al 94 % con sombra; tú dijiste «oscura sólida».
3. **Transparente = no pinta nada**: ni fondo, ni borde, ni sombra, ni desenfoque
   (@s6). Lo compruebo comparando la franja con la cabecera visible y oculta.
4. **Se mide lo pintado, no el valor de un nodo**: la «opacidad efectiva» es la del
   propio color por la de todos sus ancestros (@s4, @s5, @s7, @s10). Una cabecera con
   un ancestro a `opacity: 0` no puede dar verde.
5. **El estado vive en un atributo `data-*`** (@s2): cambia exactamente uno y la clase
   no cambia. Un atributo `aria-` inventado haría fallar la prueba de accesibilidad
   (medido) y por eso no se admite. Su nombre lo elige el artesano.
6. **Ningún oyente de scroll, como disparador a 0** (@s3), **acotado a los ficheros de
   la cabecera y de la portada** (*), no a todo `src`.
7. **El velo se mide con una foto negra y otra blanca** (@s9), con tolerancia de 0,02,
   y la franja superior se fija con sus cifras compuestas (0,91 / 0,855 / 0,80 en el
   borde izquierdo; 0,649 / 0,4345 / 0,22 en el derecho).
8. **Contraste**: peor píxel de la caja **del texto** (no del enlace entero: la caja de
   «Tienda» incluye su borde y haría el contrato imposible), componiendo la opacidad
   efectiva (@s10); anchos 1440, 1024 y 375; los dos estados. El nombre «Galapavet»
   (20 px, peso 600) y el descriptor cuentan como texto normal (4,5 a 1): criterio
   conservador de esta feature, solo se tiene por negrita el peso 700 o más.
9. **Las puertas de píxeles tienen que poder ponerse rojas** (@s12), con sabotajes que
   de verdad dan rojo en el navegador, y suspenden si no han podido medir (foto
   bloqueada, color que no entienden).
10. **Matriz: cambio el uso de la fila existente a «texto normal»** en lugar de añadir
    una fila (@s17). Recuentos 23/115 intactos y solo cambia una comprobación del test.
    **Es mía: la firmas o la vetas.**
11. **Ritmo: tolerancia de 3 px** (admite el sobrante de 1,84 px de FAQ, rechaza el
    defecto de 6,47 px de la 46) y la píldora «Tienda» al menos 8 px más (@s14). El
    relleno de la píldora es 16 frente a 8.
12. **Holgura a 1024: 92 px o más** entre la marca y el menú, en la portada y en `/blog`
    (@s27): 93,17 px medidos con la barra de desplazamiento superpuesta (la de las
    pruebas), menos 1 px. Con la barra clásica de 15 px la misma fila da 78, y esa era la
    cifra de antes. **La clave es que el descriptor se vea entero y la marca no se
    comprima**; la cifra es el aviso previo. **Pendiente de remedir** con la reserva de
    ancho del enlace actual, que quita unos 9 px (84,30 medidos con todos los enlaces
    a 600): si el suelo de 92 resultara imposible, vuelve a ti (*).
13. **Objetivo de 48 px para los ocho** (antes 44) (@s2): es lo que ya miden.
14. **Inventario fechado de `@media` de anchura** como techo (@s15), acotado a las hojas
    que tocan las features 48 y 49 (*); si la 48 añade uno, esta puerta se pone roja y
    se actualiza en el mismo paso.
15. **Panel móvil**: caja idéntica en los dos estados, enlaces con su anillo de siempre
    (`--color-foco`) y el botón de menú con su fondo propio (@s19).
16. **Anillo de foco del menú = `sobre-primario`**, el mismo recurso que el hero (@s11).
17. **Cambio de estado instantáneo** con y sin movimiento reducido (@s18): sin fundido,
    sin fotogramas intermedios. Es la duda 4 de §7.
18. **El logo**: cuadrado, bien cargado y con tratamiento nombrado en el informe; solo
    si es el círculo (lo que enseñaba la maqueta) se mide que las esquinas dejan ver la
    foto, con ocho puntos por estado (@s21).
19. **El contenido del hero queda por debajo de la cabecera** (@s6).
20. **Posiciones de scroll «claramente dentro o fuera»** con 100 px de margen (@s4); y
    todo cruce del límite del hero se hace con desplazamiento instantáneo y esperando
    a que el atributo de estado cambie (si no cambia, la prueba falla en vez de medir).
21. **El cierre exige `pnpm run test:e2e`** con código 0 y que el informe de cierre lo
    cite (@s23): esa corrida no forma parte de `bin/harness verify`.
22. **Se retira la suavidad del borde de «Tienda»** (`fidelidad_cabecera` @s7): ver §7,
    duda 2.
23. **El registrador del primer fotograma** de @s4, @s5, @s8 y @s22 vive en una utilidad
    compartida de `tests/e2e` y esos cuatro escenarios son la excepción pactada con
    `hero_reducido_con_animacion` @s10; @s14 y @s16 no lo son.

## 6. Valores por defecto que firmas si no los vetas

(Decisiones §6, las respuestas del craftsman_lead del 13/10/2026 y las del panel.)

- **Velo B completo**: horizontal de cuatro tramos **y** franja superior (0,55 → 0 al
  22 % de la altura). Se retira «permitida, no exigida».
- **Portada cargada con enlace a sección o recargada**: se cubre (@s22), sin que el
  enlace cambie el estado (ver §5 punto 1 y §8).
- **Hover = subrayado, sin cambio de peso. Enlace actual = subrayado + peso 600 con el
  ancho reservado.** Ninguna caja del menú se mueve (0,5 px) (@s16).
- **Borde de «Tienda» = color de su texto** (retirada de F3): duda 2 de §7.
- **Cabecera sin fundido y sin sombra** (la maqueta llevaba las dos): duda 4 de §7.
- **Velo más oscuro en pantallas estrechas**, con una sola condición nueva
  `(max-width: 1023px)` en la hoja del hero: duda 3 de §7.
- **Prototipo** de `docs/diseno-claude-design/`: se deja como histórico, sin tocar
  (igual que en la 48).
- **Cabecera**: **sin `backdrop-filter` en ningún estado** (ni transparente ni sólida);
  estado por observador con la lógica en `Cabecera-logica.ts` (mutación al 100 %) y en
  un atributo `data-*`.
- **Hueco**: `#root` conserva su relleno; el hero solapa con margen negativo;
  `scroll-padding-top` y el desplazamiento al enfocar no cambian.
- **«Tienda»**: mismo tamaño y misma regla de color que los otros siete.
- **Colores**: nada de «blanco» literal; en `tech` se usa `sobre-primario`, que es
  oscuro (el inventario de tokens sigue cerrado). **`tech` es la sorpresa**: su tinta
  es casi blanca y su `sobre-primario` casi negro, así que su cabecera «oscura sólida»
  es en realidad **clara con letra oscura**, como su velo del hero.
- **Logo**: el actual, con el tratamiento que se elija (círculo por defecto).

## 7. DUDAS PARA PABLO

Solo lo que sigue sin resolver. Son **cuatro**:

1. **¿Aceptas el fundido de entrada del hero, aunque el LCP se multiplique por unas 6,5
   en local?** El LCP es el tiempo en que «aparece lo principal». Con el hero a pantalla
   completa, la foto deja de contar y pasa a serlo el texto, que entra con fundido: un
   texto con fundido **cuenta al terminar el fundido**, no al empezar. Con tu animación
   se espera **del orden de 770-850 ms (el titular, en escritorio)** y **de 860 a 930 ms
   (el párrafo, en móvil)**, frente a **132 y 120 ms** de hoy en local: **unas 6,5 veces**.
   Sobre la web desplegada la comparación es contra 264 y 236 ms: unas 3 veces (nunca se
   mezclan los dos entornos). Sigue **muy por debajo del umbral «bueno» de 2,5 s** y el
   contrato lo mide antes y después y **no deja cerrar la feature sin que lo veas** (@s20).
   **Alternativa técnica**: animar solo el desplazamiento, sin fundido; el LCP quedaría
   en unos 35-80 ms.
2. **El borde de «Tienda» pasa a ser del color de su texto** (como en la maqueta que
   viste) y **se retira la suavidad que aprobaste el 20/09 (F3)**. Motivo medido: el
   borde suave da de 2,1 a 2,5 a 1 sobre la foto en cuatro paletas y 1,12 en `tech`, y el
   mínimo de accesibilidad para un borde de control es 3 a 1; no existe un borde más
   suave que cumpla. Si prefieres un borde suave, hay que decir qué contraste aceptas.
3. **En pantallas de menos de 1024 px el velo de la foto se oscurece algo más que en
   escritorio.** La previsión da el texto del hero por debajo del mínimo de legibilidad en
   móvil (el párrafo, de 2,9 a 4,1 a 1 contra 4,5) con el velo de la maqueta, que está
   calibrado a 1440. La única condición nueva que se autoriza es esa, para oscurecer lo
   mínimo necesario. Consecuencia que verás: **en el móvil la foto se ve algo más oscura**.
   Y una limitación: a 1024 px exactos manda el diseño de escritorio, así que ahí el velo
   es el de escritorio; si no llega, vuelve a ti.
4. **La cabecera cambia de transparente a sólida sin fundido y sin sombra.** La maqueta
   que viste llevaba un fundido de 0,3 s y una sombra bajo la cabecera sólida; no se
   adoptan, para que el cambio no deje fotogramas a medias (más fácil de comprobar y sin
   efecto de «parpadeo»). Se puede añadir un fundido corto si lo quieres, a costa de
   volver a medir.

## 8. Para el `craftsman_lead` (fuera de mi alcance, no lo he tocado)

- **No he cambiado `feature_list.json`**: la 49 sigue en `pending`. La pasas tú a
  `spec_ready` cuando decidas lanzar la firma. Su `acceptance` cita **5,27 y 6,06** del
  hero sin decir que son **a 1440 px y en `clinica`**; conviene quitar la cita o
  precisarla, porque a 1024 y a 375 px no estaban medidos y salen en rojo en la previsión.
- **`project-spec.md`, Invariante 5**: exige el estado condicional en un atributo ARIA,
  pero un `aria-*` inventado falla la prueba de accesibilidad (medido). La 49 propone
  **enmendarlo para permitir `data-*` en estados puramente visuales**; esa enmienda la
  escribes tú. Las notas de `feature_list.json` que hablen de la cabecera «translúcida»
  quedan desfasadas, y `decisiones_cabecera_hero_20261013.md` §P4 omite la franja del velo.
- **OBSERVACIÓN para Pablo (no se arregla aquí)**: **los enlaces profundos
  (`/#contacto`) no llevan hoy a la sección**; el navegador no desplaza la página porque
  la aplicación se pinta después de cargar. Es un defecto previo del sitio, no de la
  49; el lead lo registrará como feature aparte.
- **Los specs nuevos de la 49 que midan la portada** deben entrar en la lista de
  `hero_reducido_con_animacion` @s10 (la 48 admite por etiqueta @s4, @s5, @s8 y @s22 de la
  49 como excepción para los registradores de primer fotograma). Esa lista se lee del
  repositorio.
- **Informes de cierre** con el nombre de `CLAUDE.md`:
  `progress/judge_cabecera_sobre_el_hero.md` (con la sección «márgenes de contraste,
  tratamiento del logo y casos no aplicables»), `progress/mutation_cabecera_sobre_el_hero.md`,
  `progress/tdd_cabecera_sobre_el_hero.md` y `progress/lcp_hero_despues_<fecha>.md`.
- **La 48 y la 49 comparten**: `rediseno_visual` @s29 lleva la nota «revisado, sin cambio de
  letra» de la 48 (ya al día con P5) y, debajo, la mía, que sí cambia la letra por el velo
  y el contraste. Si la 48 renumera su @s5, @s10, @s11 o @s12, hay que actualizar las citas
  de la 49 (índice, @s6, @s8, @s20, @s22 y convención de medida). El relleno de animación
  `backwards` lo fija la 48 @s5.
- **Pruebas que cambian** (no son contrato): `Cabecera.test.tsx` (tamaño y color del nav
  y de «Tienda», **la mezcla 88/12 del borde de «Tienda»**, borde de la cabecera),
  `accesibilidad.spec.ts` (sus dos funciones ciegas), `matrizDeContraste.test.ts` (UNA
  comprobación del uso de la fila; los recuentos no cambian) y `Hero.test.tsx` (contraste
  contra el velo; su `min-height` es de la 48).
- **Pendiente para el TDD** (se deja anotado, no se ha cerrado en el contrato): (a) la
  **remedición de la holgura** a 1024 con la reserva de ancho del enlace actual; (b) el
  **valor del velo estrecho**, que mide el artesano; (c) las **cifras de contraste** de §4
  son previsión: la medida real en las cinco paletas a 1440, 1024 y 375 px decide; (d) la
  nota del Understanding de SC 2.4.11 (superposiciones semitransparentes y SC 1.4.11) la
  citó el panel y **no se ha vuelto a leer** en esta sesión; (e) la holgura de `/blog` no se
  midió por separado; (f) el entorno de las cifras es Chromium headless sobre servidor
  local: no verificado en Chrome con cabeza ni sobre GitHub Pages.
- **Ninguna prueba existente se ha ejecutado** ni se ha tocado `src/` ni `tests/`.

## 9. Cómo lo he comprobado

- `git show HEAD:features/retirada_carteleria_urgencias.feature | grep -v "^\s*#"`
  contra el fichero actual → **INTACTO** (repetido tras cada edición de ese fichero).
- Cada fichero: etiquetas `@sN` únicas, ninguna reutilizada, sin BOM, UTF-8.
  `rediseno_visual.feature` conserva sus finales de línea CRLF (cada `LF` va con su
  `CR`); los demás, LF.
- El fichero nuevo: 23 escenarios, cada uno con un solo `Given`, un solo `When` y un
  solo `Then`, y notas «puerta que muerde» con mutaciones pensadas con lo que **vería el
  navegador**; las cláusulas que ninguna prueba puede poner en rojo llevan «(lo verifica
  el judge)».
- Las citas de la 48 son por etiqueta y se han comprobado contra su fichero actual
  (@s5 relleno `backwards`, @s10 estado estable, @s11 LCP, @s12 altura).
- Comprobado contra el repositorio: no hay ningún oyente de scroll ni
  `IntersectionObserver` en `src/` de producción; las únicas condiciones de anchura de
  las hojas son las del inventario de @s15; `movimiento.spec.ts` no desplaza la portada;
  `Cabecera.test.tsx` congela el tamaño -1, el color `--color-tinta` de «Tienda» y el
  borde de la cabecera; `harness.config.json` no ejecuta Playwright.

## 10. Correcciones tras el panel de revisión

Cuatro revisores independientes midieron en Chromium 151 sobre la web construida. Había
**3 fallos bloqueantes**, unos 30 importantes y unos 33 menores. Esto es lo que cambió,
sin jerga.

**Los tres bloqueantes**
1. **«Tienda» era imposible de aprobar.** Se medía el texto sobre la caja del enlace, que
   incluye su borde, y el borde no puede contrastar con el fondo y con el texto a la
   vez. Ahora el texto se mide sobre **su propia caja** (también el de «Tienda» en el
   panel móvil), y el borde, **con su propio color transparente en la captura**. Para que
   cuadre, el borde pasa a ser del color del texto y se retira la suavidad F3 (duda 2).
2. **El panel móvil**: el texto de «Tienda» del panel se mide así, y el panel conserva
   sus ocho enlaces.
3. **El ancla no desplaza la página** en este sitio (medido). Se quitan las filas de
   «ancla a otra sección» (24 → 18 combinaciones) y @s22 se reescribe: la página queda
   en lo alto y la cabecera transparente desde el primer fotograma; recargada ya
   desplazada, sólida desde el primero.

**Importantes** (las decisiones tomadas por ti, vetables, están en §7 y §6)
- @s5: la «mutación» describía el código de hoy y daba 0; ahora se mide que **nunca hay
  una cabecera sin ningún control visible** y se reconoce qué cláusulas son trinquete.
- Foto bloqueada: «dos colores» no demostraba nada; la única señal fiable es que la imagen
  esté decodificada. @s12 prueba también con `tech` y exige la causa.
- Convención de medida: los cruces del hero se hacen instantáneos y se espera al
  atributo de estado (con tope: si vence, la prueba falla).
- **Cambio instantáneo, sin fundido ni sombra** (duda 4); @s18 reescrito.
- @s4: el camino «sin recargar» es Campañas → «Inicio», no `/` → `/blog`.
- Excepción acordada con la 48 para los registradores de primer fotograma (§5 punto 23).
- **Velo más oscuro en pantallas estrechas** (duda 3), con la única excepción de @s15 y
  la cláusula de «nunca más claro» en @s9; `rediseno_visual` @s29 a 1440, 1024 y 375.
- @s20: cifras corregidas (6,5 veces en local, 3 en desplegada, sin mezclar; titular en
  escritorio, párrafo en móvil), último candidato obligatorio en el hero, prueba sintética
  de que la puerta suspende si el candidato es de la cabecera, y alternativa a Pablo.
- @s19: la mutación del anillo ahora tiene mayor especificidad (antes no cambiaba nada) y
  se corrige la lista de causas que cambian el bloque contenedor.
- @s27 y la cifra de holgura: **por entorno** (78 con barra clásica, 93,17 superpuesta),
  suelo de 92, mutación de 19 px corregida (solo cae la cláusula numérica), cuentas del
  relleno corregidas (siete enlaces; «Tienda» lleva su propio relleno), remedición
  pendiente (§5 punto 12).
- Cláusulas documentales marcadas «(lo verifica el judge)» en @s10, @s11, @s20, @s21, @s22
  y @s23, con el fichero que las recoge; una «mutación» que era un informe, retirada.
- **Sin `backdrop-filter` en ningún estado** (cláusula y mutación en @s7).
- **Atributo `data-*`** en lugar de `aria-*` (§8).
- @s21: ocho puntos de muestreo por estado; los vértices a 1 px no distinguían nada.
- @s6: la sección siguiente arranca justo debajo del hero (900, 768, 844 px); mutación
  real; «y = 0» queda en un solo sitio (`fidelidad_cabecera` @s4).
- Previsión de contraste (§4): rangos honestos en lugar de cifras que no se reproducían.

**Menores** (todos aplicados): @s8 (la mutación de los 72 px cae por la altura, no por
el CLS), @s14 (siete huecos, 3 px, fuentes cargadas), @s9 («0,78»), @s3 acotado, @s15
acotado, `fidelidad_cabecera` @s7 con la línea retirada «aun así…» y la línea en blanco
antes de «CUARTA ACTUALIZACIÓN», `rediseno_visual` @s29 con tres cláusulas, `identidad_visual`
@s38/@s39 (títulos y lista de controles igualada con la de `accesibilidad` @s18) y @s30
(nota nueva), @s40 y `accesibilidad` @s17 (cita del Understanding), normalización de
colores (`rgb`, `rgba`, `color(srgb … / a)`; si no se entiende, «no se midió») con su fila
en @s12, tolerancia y notas de @s10/@s4/@s22/@s1/@s23.

**Lo que no se ha podido o querido cerrar** está en §8 («Pendiente para el TDD»).

## 11. Correcciones tras la respuesta del craftsman_lead (historial)

**Decisiones recogidas** (las cinco dudas de la primera redacción): franja obligatoria;
ancla y scroll cubiertos (ahora corregido en §10); hover sin movimiento; borde de
«Tienda» suave (ahora retirado en §10); prototipo histórico.

**Corregido por la auditoría con las mismas lentes del panel de la 48:**
1. *Se medía el elemento equivocado*: el alfa de la cabecera y la opacidad del texto son
   ahora **efectivos** (con los ancestros) en @s4, @s5, @s7, @s10; y @s7 prohíbe una
   opacidad en la cabecera o en sus ancestros.
2. *Mutaciones que no ponían nada en rojo* (corregidas): `scroll-padding-top` escrito
   con el mismo valor (@s8, ahora `80px`); «velo transparente» sobre una foto oscura
   (@s12, ahora con la foto real); «relleno de Tienda igualado» (@s14, ahora exige 8 px
   más); `transform` en la cabecera sólida con panel que no se movía (@s19);
   opacidad 0,5 a los enlaces (@s10, ahora `opacity` 0,3 en la lista, un ancestro);
   «imagen del hero perezosa» para el LCP (@s20, ya no cuenta: la foto no es candidata);
   `display:none` del logo (@s21, ahora la caja mide más de 0); «el velo se aclara»
   (@s11 y `accesibilidad` @s18).
3. *Cierre sin la corrida de navegador*: nuevo @s23.
4. *Estado estable*: todas mis precondiciones remiten a `hero_reducido_con_animacion` @s10
   por etiqueta, sin copiar su criterio.
5. *LCP*: la premisa «el texto cuenta en el primer fotograma» era falsa (medida en
   Chromium 151). @s20 y su nota están corregidas, con las dos líneas base separadas
   (local 132/120 ms, desplegada 264/236 ms).
6. *Hero*: «al menos 100svh, exactamente esa altura cuando el contenido cabe» (@s6 y el
   índice), sin duplicar `hero_reducido_con_animacion` @s12.
7. *Nombres de los informes de cierre*: `judge_cabecera_sobre_el_hero.md` y compañeros.
