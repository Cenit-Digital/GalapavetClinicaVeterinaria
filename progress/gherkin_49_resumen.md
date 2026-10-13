# Feature 49 — resumen del contrato para firmar (13/10/2026, actualizado)

> Escrito para Pablo, sin jerga. El contrato completo vive en
> `features/cabecera_sobre_el_hero.feature` (lo nuevo y el índice) y en los cinco
> ficheros que se enmiendan. Aquí solo está el mapa de qué cambia y por qué.
> **Nada de esto está firmado todavía y no se escribe código hasta que lo firmes.**
> Va **después** de la feature 48 (el hero reducido y animado): comparte con ella
> varios ficheros. Esta versión recoge la respuesta del craftsman_lead a las cinco
> dudas de la primera redacción y su auditoría (ver §10).

## 1. Qué firmas, en siete líneas

1. En la **portada**, la foto del hero sube hasta el borde de arriba de la pantalla
   y la cabecera va **transparente encima**, sin desenfoque, mientras el hero siga
   debajo. El hero es pantalla completa (tu decisión P5): mide al menos la pantalla
   y la cabecera no suma altura.
2. En **Blog, Tienda, Campañas y la página «no encontrada»**, y en la portada en
   cuanto bajas del hero, la cabecera es **sólida**: tinta de la paleta y texto
   `sobre-primario`. Es así **desde el primer fotograma**, también si abres la
   portada con un enlace a una sección (`/#contacto`), y mide siempre 64 píxeles.
3. Los **ocho enlaces del menú pasan a 16 px** (paso 0 de la escala, no una
   excepción), caben en **una fila a 1024 px** sin cortar el descriptor «Centro
   integral veterinario», el hueco entre letras queda uniforme y ningún objetivo
   baja de 48 px. Esto cierra la feature 46.
4. El **velo** sobre la foto es el B de la maqueta que viste: un degradado
   horizontal (0,80 · 0,68 · 0,30 · 0,22 al 0 · 45 · 75 · 100 % del ancho) **más una
   franja oscura arriba** (0,55 en el borde, 0 al 22 % de la altura). La franja la
   omitieron por error tus decisiones escritas; ahora es **obligatoria**.
5. El **texto del menú, la marca y el anillo de foco** se miden sobre **los píxeles
   reales** de la foto, en las cinco paletas, incluida `tech`. Las pruebas viejas
   medían contra el fondo de la página y daban verde sin mirar la foto; se
   reescriben y se demuestra que pueden ponerse rojas.
6. El enlace de la **página actual** se subraya y pesa 600; el del **puntero
   encima** se subraya sin cambiar de peso; **ninguna caja del menú se mueve** en
   ningún caso. El **panel del móvil** queda exactamente como está y el **logo
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
| @s4 | `fidelidad_cabecera` | La línea «el primer contenido de la portada arranca justo bajo la cabecera» se **parte en dos**: en las otras 5 rutas sigue igual; en la portada **el hero sube bajo la cabecera** (borde superior en y = 0, solape = alto de la cabecera) | Tu punto 1. El resto de G1 (alto de la cabecera = hueco que reserva la página, sin tolerancia) **sigue en pie** |
| @s6 | `fidelidad_cabecera` | Dos líneas: texto de «Tienda» de «tinta fuerte» a **el mismo color que los otros siete** (`sobre-primario`); su tamaño de letra, de «paso existente» a **16 px, igual que los demás** | Tu P2: un solo juego de colores. La «tinta fuerte» pasaría a ser el fondo y el texto no se vería |
| @s7 | `fidelidad_cabecera` | Reescrito (título, «Given», «When», «Then» y la línea «el valor suavizado…»): el borde de «Tienda» pasa de «más suave que el de los botones, y aun así ≥ 3 a 1» a **≥ 3 a 1 contra los píxeles de detrás, sobre la foto y sobre la cabecera sólida**, con una regla única de tokens existentes | Se calibró sobre fondo claro; sobre tinta o foto esa comparación ya no tiene referencia. La suavidad (F3) sigue siendo la intención, ver §6 |
| @s27 | `sistema_de_diseno_visual` | **Tres líneas añadidas** a 1024 px: ocho enlaces en una fila; descriptor entero y marca sin comprimir; **77 px o más de holgura** (en la portada y en `/blog`) | «No se solapa ni desborda» daba verde aunque el descriptor saliera cortado (pasa a 19-20 px) |
| @s28 | `rediseno_visual` | «La cabecera se mantiene visible» → **su caja ocupa los 64 px de arriba en cualquier posición y en sus dos estados**; **una línea añadida**: el salto a una sección da el mismo resultado desde la cabecera transparente y desde la sólida | La cabecera ya no es una franja con fondo; el salto debe seguir descontando su altura real |
| @s29 | `rediseno_visual` | La línea «When» declara navegador real y estado estable; la línea del velo pasa de «de tokens» a **degradado horizontal + franja superior**; la del contraste, de «calculado contra una parada del velo» a **medido sobre los píxeles de la foto** (titular 3 a 1, párrafo 4,5 a 1) | El velo es de esta feature (P4). **Pierde generalidad**: vale «para esta foto», no «para cualquier foto» |
| @s38 | `identidad_visual` | Una línea reescrita (contraste del anillo **leído de capturas**, no del fondo de un ancestro) y una añadida (la cabecera cuenta entre los controles comprobados) | Las pruebas subían hasta el primer fondo opaco: con la cabecera transparente llegaban a la página, no a la foto |
| @s39 | `identidad_visual` | El «When» ahora lee los píxeles realmente pintados; **dos líneas añadidas** (sobre la foto «el fondo» es el peor píxel; la cabecera cuenta) | Mismo defecto |
| @s18 | `accesibilidad` | Una línea reescrita (contraste del anillo medido sobre píxeles reales) y una añadida (la cabecera cuenta) | Mismo defecto |

**Solo notas (letra sin cambiar):** `fidelidad_cabecera` @s1 revisado; `cabecera_y_navegacion`
@s1 revisado y el «PENDIENTE» del 1024 actualizado (se confirma con 78 px medidos);
`rediseno_visual` @s26; `fidelidad_responsive_integral` @s4 y @s6; `sistema_de_diseno_visual`
@s14, @s25 y @s26; `identidad_visual` @s40 y la nota del parque de navegadores;
`accesibilidad` @s17; y 4 notas en `retirada_carteleria_urgencias.feature` (F3, G1, tabla A y
tabla B), que es un fichero firmado: su texto no se ha tocado, comprobado con `diff`.
**No he tocado `hero.feature`**: ningún escenario suyo fija el velo ni la cabecera.

**Cuenta:** 10 escenarios con letra cambiada, en 5 ficheros (`fidelidad_cabecera` 4,
`rediseno_visual` 2, `sistema_de_diseno_visual` 1, `identidad_visual` 2, `accesibilidad` 1),
más 10 revisados sin cambiar la letra.

## 3. Los 23 escenarios nuevos (en `cabecera_sobre_el_hero.feature`)

| # | Qué fija, en una frase |
| --- | --- |
| @s1 | **Quién decide el estado**: la ruta, si el hero sigue bajo la cabecera y, si aún no hay informe, la posición inicial de la página (en lo alto, o con scroll/ancla). 24 combinaciones |
| @s2 | La cabecera cambia de estado cuando **un observador de intersección** lo informa, y el estado vive en **un atributo, no en una clase** |
| @s3 | **Ningún oyente de scroll** en producción (cero, y es un disparador) |
| @s4 | En el navegador: transparente solo en la portada con el hero debajo; **sólida desde el primer fotograma** en las demás rutas; sigue bien al navegar y volver con «Atrás» |
| @s5 | **Sin parpadeo**: con el ancho aún sin medir, ni la hamburguesa sale sobre la foto en escritorio ni el menú de escritorio en un móvil |
| @s6 | La foto llega a y = 0 y la cabecera transparente **no pinta nada** entre sus controles; el hero mide al menos la pantalla contando la cabecera |
| @s7 | La sólida es de **tinta con texto `sobre-primario`**, y el texto tiene el **mismo color** en los dos estados; ninguna opacidad de la cabecera ni de sus ancestros |
| @s8 | **64 px en los dos estados**, cambiar de estado no mueve nada (CLS 0), el hueco de las anclas y el enlace «Saltar al contenido» no cambian |
| @s9 | El **velo B**: degradado horizontal con los cuatro tramos **y franja superior** (se mide con una foto negra y otra blanca) |
| @s10 | **Contraste del texto de la cabecera** sobre el peor píxel real: 220 medidas (5 paletas, 3 anchos, 2 estados) |
| @s11 | **Anillo de foco** a 3 a 1 contra el peor píxel que lo rodea: 200 medidas |
| @s12 | **Las pruebas de píxeles pueden ponerse rojas**: escenas de prueba y cuatro sabotajes del sitio real; y no aprueban lo que no han podido medir |
| @s13 | El tamaño de letra del menú **sale del paso 0 de la escala**, escrito o heredado (no es un 16 px a mano), y «Tienda» no es una excepción |
| @s14 | **Ritmo uniforme entre letras** (no entre cajas), con la píldora «Tienda» como única diferencia intencionada (al menos 8 px más) |
| @s15 | **Ninguna hoja gana un `@media` de anchura nuevo**: el único corte sigue siendo 1024 |
| @s16 | Enlace actual: subrayado + peso 600; puntero encima: subrayado sin cambio de peso; **ninguna caja del menú se mueve** (0,5 px); y se leen |
| @s17 | La **matriz de contraste**: el par del texto del menú con su uso, 23 filas y 115 parejas |
| @s18 | Con **movimiento reducido** la cabecera cambia al instante; con movimiento permitido termina en el estado correcto |
| @s19 | El **panel móvil** y el botón de menú son idénticos con la cabecera en los dos estados |
| @s20 | **LCP** (mediana de 5 cargas ≤ 2500 ms, antes y después a Pablo) y **CLS** de las seis rutas |
| @s21 | El **logo temporal** se ve bien con el tratamiento que se elija (círculo, fondo u opacidad); si es el círculo, deja ver la foto en las esquinas |
| @s22 | **Portada cargada con ancla o desplazada: sólida desde el primer fotograma**, y el primer estado **no se anima** |
| @s23 | **Cierre**: lint, tipos, compilación, pruebas, **`pnpm run test:e2e`** y mutación terminan limpios, y el informe de cierre lo cita |

## 4. Previsión de contraste del menú (cálculo, no medida)

El craftsman_lead calculó el contraste sobre **el peor píxel de la foto** `clinica.webp`
(menú a la derecha de la columna de 1220 px, marca a la izquierda):

| | clinica | calida | eco | marca | tech |
| --- | --- | --- | --- | --- | --- |
| Menú, solo velo horizontal, 1440×900 | 6,43 | 5,91 | 6,01 | 5,98 | **4,86** |
| Menú, solo velo horizontal, 1024×768 | 6,15 | 5,66 | 5,76 | 5,73 | **4,89** |
| Menú **con la franja superior**, 1440 y 1024 | ≥ 8,23 en las cinco (tech: 8,58 y 8,45) | | | | |
| Marca y descriptor | ≥ 9,54 solo horizontal · ≥ 10,83 con la franja | | | | |

El mínimo es 4,5. **Pasa en las cinco**, `tech` con poco margen si no hubiera franja.
Es una **previsión**: la prueba válida son @s10, @s11 y @s12 sobre píxeles reales.
**NO medido:** 375 px (ahí no hay menú de escritorio, solo marca y hamburguesa), el
texto del hero a 1024 y 375 px, el renderizado real con antialiasing, el anillo de
foco y el borde de «Tienda» sobre la foto. Si al medir alguna paleta queda por debajo,
el hallazgo vuelve a ti antes de tocar nada.

## 5. Cosas que he escrito y que NO estaban literales en tus decisiones

Salen de leer el código o de que, sin ellas, lo que pediste quedaría sin poder
comprobarse. Dime si alguna sobra y la quito.

1. **El estado inicial de la portada se decide con el scroll y el hash antes del primer
   dibujo** (@s1, @s22): en lo alto o con `#inicio`, transparente; desplazada o con otro
   ancla, sólida. Y **el primer cambio de estado no se anima**.
2. **«Sólida» = tinta con opacidad efectiva de 0,94 o más** (@s4, @s7). La maqueta que
   viste la pintaba al 94 % con sombra; tú dijiste «oscura sólida».
3. **Transparente = no pinta nada**: ni fondo, ni borde, ni sombra, ni desenfoque
   (@s6). Lo compruebo comparando la franja con la cabecera visible y oculta.
4. **Se mide lo pintado, no el valor de un nodo**: la «opacidad efectiva» es la del
   propio color por la de todos sus ancestros (@s4, @s5, @s7, @s10). Una cabecera con
   un ancestro a `opacity: 0` no puede dar verde.
5. **El atributo de estado no tiene nombre fijado** (@s2): cambia exactamente uno,
   `data-` o `aria-`, y la clase no cambia.
6. **Ningún oyente de scroll, como disparador a 0** (@s3).
7. **El velo se mide con una foto negra y otra blanca** (@s9), con tolerancia de 0,02,
   y la franja superior se fija con sus cifras compuestas (0,91 / 0,855 / 0,80 en el
   borde izquierdo; 0,649 / 0,4345 / 0,22 en el derecho).
8. **Contraste**: peor píxel de la caja de cada texto, componiendo la opacidad
   efectiva (@s10); anchos 1440, 1024 y 375; los dos estados. El nombre «Galapavet»
   (20 px, peso 600) y el descriptor cuentan como texto normal (4,5 a 1) por las reglas
   del propio proyecto.
9. **Las puertas de píxeles tienen que poder ponerse rojas** (@s12), con sabotajes que
   de verdad dan rojo en el navegador, y suspenden si no han podido medir.
10. **Matriz: cambio el uso de la fila existente a «texto normal»** en lugar de añadir
    una fila (@s17). Recuentos 23/115 intactos y solo cambia una comprobación del test.
    **Es mía: la firmas o la vetas.**
11. **Ritmo: tolerancia de 2 px** y la píldora «Tienda» al menos 8 px más (@s14). Sale de
    que el mayor sobrante a 16 px es 1,8 px (FAQ), el defecto de la 46 eran 6,47 px y
    el relleno de la píldora es 16 frente a 8.
12. **Holgura a 1024: 77 px o más** en la portada y en `/blog` (78 medidos, menos 1 px)
    (@s27): como el enlace actual reserva su ancho, la fila no es más larga en `/blog`.
13. **Objetivo de 48 px para los ocho** (antes 44) (@s2): es lo que ya miden.
14. **Inventario fechado de `@media` de anchura** como techo (@s15); si la 48 añade uno,
    esta puerta se pone roja y se actualiza en el mismo paso.
15. **Panel móvil**: caja idéntica en los dos estados, enlaces con su anillo de siempre
    (`--color-foco`) y el botón de menú con su fondo propio (@s19).
16. **Anillo de foco del menú = `sobre-primario`**, el mismo recurso que el hero (@s11).
17. **Movimiento**: tras cambiar el atributo de estado, el primer fotograma ya tiene el
    color final con movimiento reducido (@s18). La regla global de «reducir movimiento»
    pierde ante cualquier regla propia (la 48 lo midió con las animaciones; que pase
    igual con una transición suelta es deducción mía, no medida) y no cubre retardos.
18. **El logo**: cuadrado, bien cargado y con tratamiento nombrado en el informe; solo
    si es el círculo (lo que enseñaba la maqueta) se mide que las esquinas dejan ver la
    foto (@s21).
19. **El contenido del hero queda por debajo de la cabecera** (@s6).
20. **Posiciones de scroll «claramente dentro o fuera»** con 100 px de margen (@s4).
21. **El cierre exige `pnpm run test:e2e`** con código 0 y que el informe de cierre lo
    cite (@s23): esa corrida no forma parte de `bin/harness verify`.
22. **Se retira** la cláusula «el borde de Tienda contrasta menos que el de los demás
    botones» (`fidelidad_cabecera` @s7): sin referencia, ver §6.

## 6. Valores por defecto que firmas si no los vetas

(Decisiones §6 y las respuestas del craftsman_lead del 13/10/2026 a mis cinco dudas.)

- **Velo B completo**: horizontal de cuatro tramos **y** franja superior (0,55 → 0 al
  22 % de la altura). Se retira «permitida, no exigida».
- **Portada ya desplazada o con ancla**: se cubre (@s22). Estado inicial por scroll y
  hash, sin esperar al observador; primer cambio sin transición.
- **Hover = subrayado, sin cambio de peso. Enlace actual = subrayado + peso 600 con el
  ancho reservado.** Ninguna caja del menú se mueve (0,5 px) (@s16).
- **Borde de «Tienda»**: sigue siendo suave (F3, 20/09) mientras cumpla ≥ 3 a 1 contra
  los píxeles de detrás sobre la foto y sobre la sólida. La mezcla la elige el
  artesano; ya no es una cláusula comprobable porque no hay referencia.
- **Prototipo** de `docs/diseno-claude-design/`: se deja como histórico, sin tocar
  (igual que en la 48).
- **Cabecera**: sin `backdrop-filter` en el estado transparente; estado por observador
  con la lógica en `Cabecera-logica.ts` (mutación al 100 %) y en un atributo.
- **Hueco**: `#root` conserva su relleno; el hero solapa con margen negativo;
  `scroll-padding-top` y el desplazamiento al enfocar no cambian.
- **«Tienda»**: mismo tamaño y misma regla de color que los otros siete.
- **Colores**: nada de «blanco» literal; en `tech` se usa `sobre-primario`, que es
  oscuro (el inventario de tokens sigue cerrado). **`tech` es la sorpresa**: su tinta
  es casi blanca y su `sobre-primario` casi negro, así que su cabecera «oscura sólida»
  es en realidad **clara con letra oscura**, como su velo del hero.
- **Logo**: el actual, con el tratamiento que se elija (círculo por defecto).

## 7. DUDAS PARA PABLO

Solo lo que sigue sin resolver. Queda **una**, y es de información más que de diseño:

1. **El LCP (el tiempo en que «aparece lo principal») se multiplica por unas tres.**
   Con el hero a pantalla completa, la foto deja de contar como elemento principal y
   pasa a serlo el texto, que entra con fundido: un revisor midió en Chromium 151 que
   un texto con fundido **cuenta al terminar el fundido**, no al empezar. Con tu
   animación (el párrafo a +120 ms durante 700 ms) se espera **del orden de 860 ms**
   frente a **132 ms** (local) o **264 ms** (desplegada) hoy: unas 3 veces, **muy por
   debajo del umbral «bueno» de 2,5 s**. El contrato lo mide antes y después y **no deja
   cerrar la feature sin que lo veas** (@s20). La alternativa técnica es animar solo el
   desplazamiento, sin fundido, y el LCP no se movería (~35 ms). ¿Aceptas el fundido?

(Las cinco dudas de la primera redacción —contraste del menú, ancla, hover, borde de
«Tienda» y prototipo— están respondidas como valores por defecto en §6.)

## 8. Para el `craftsman_lead` (fuera de mi alcance, no lo he tocado)

- **No he cambiado `feature_list.json`**: la 49 sigue en `pending`. La pasas tú a
  `spec_ready` cuando decidas lanzar la firma.
- **`project-spec.md`** y las notas de `feature_list.json` que hablen de la cabecera
  «translúcida» quedan desfasadas. `decisiones_cabecera_hero_20261013.md` §P4 omite la
  franja del velo (lo has reconocido tú).
- **Los specs nuevos de la 49 que midan la portada** deben entrar en la lista de
  `hero_reducido_con_animacion` @s10. Esa lista se lee del repositorio.
- **Informes de cierre** con el nombre de `CLAUDE.md`:
  `progress/judge_cabecera_sobre_el_hero.md`, `progress/mutation_cabecera_sobre_el_hero.md`,
  `progress/tdd_cabecera_sobre_el_hero.md` y `progress/lcp_hero_despues_<fecha>.md`.
- **La 48 y la 49 comparten**: `rediseno_visual` @s29 lleva la nota «revisado, sin cambio de
  letra» de la 48 (ya al día con P5) y, debajo, la mía, que sí cambia la letra por el velo
  y el contraste. Si la 48 renumera su @s10, @s11 o @s12, hay que actualizar las citas de la
  49 (índice, @s6, @s8, @s20 y convención de medida).
- **Pruebas que cambian** (no son contrato): `Cabecera.test.tsx` (tamaño y color del nav
  y de «Tienda», borde de la cabecera), `accesibilidad.spec.ts` (sus dos funciones ciegas),
  `matrizDeContraste.test.ts` (UNA comprobación del uso de la fila; los recuentos no
  cambian) y `Hero.test.tsx` (contraste contra el velo; su `min-height` es de la 48).
- **Ninguna prueba existente se ha ejecutado** ni se ha tocado `src/` ni `tests/`.

## 9. Cómo lo he comprobado

- `git show HEAD:features/retirada_carteleria_urgencias.feature | grep -v "^\s*#"`
  contra el fichero actual → **INTACTO** (repetido tras cada edición de ese fichero).
- Cada fichero: etiquetas `@sN` únicas, ninguna reutilizada, sin BOM, UTF-8.
  `rediseno_visual.feature` conserva sus finales de línea CRLF (cada `LF` va con su
  `CR`); los demás, LF.
- El fichero nuevo: 23 escenarios, cada uno con un solo `Given`, un solo `When` y un
  solo `Then`, y notas «puerta que muerde» en todos. Cada mutación citada se ha
  pensado con lo que **vería el navegador** (ver §10).
- Las citas de la 48 son por etiqueta y se han comprobado contra su fichero actual
  (@s10 estado estable, @s11 LCP, @s12 altura).
- Comprobado contra el repositorio: no hay ningún oyente de scroll ni
  `IntersectionObserver` en `src/` de producción; las únicas condiciones de anchura de
  las hojas son las del inventario de @s15; `movimiento.spec.ts` no desplaza la portada;
  `Cabecera.test.tsx` congela el tamaño -1, el color `--color-tinta` de «Tienda» y el
  borde de la cabecera; `harness.config.json` no ejecuta Playwright.

## 10. Correcciones tras la respuesta del craftsman_lead

**Decisiones recogidas** (las cinco dudas): franja obligatoria; ancla y scroll cubiertos;
hover sin movimiento; borde de «Tienda» suave; prototipo histórico.

**Corregido por la auditoría con las mismas lentes del panel de la 48:**
1. *Se medía el elemento equivocado*: el alfa de la cabecera y la opacidad del texto son
   ahora **efectivos** (con los ancestros) en @s4, @s5, @s7, @s10; y @s7 prohíbe una
   opacidad en la cabecera o en sus ancestros.
2. *Mutaciones que no ponían nada en rojo* (corregidas): `scroll-padding-top` escrito
   con el mismo valor (@s8, ahora `80px`); «velo transparente» sobre una foto oscura
   (@s12, ahora sobre una plana blanca); «relleno de Tienda igualado» (@s14, ahora
   exige 8 px más); `transform` en la cabecera sólida con panel que no se movía (@s19,
   ahora `translateY` y un anillo más específico); opacidad 0,5 a los enlaces (@s10,
   ahora `opacity` 0,3 en la lista, un ancestro); «imagen del hero perezosa» para el LCP
   (@s20, ya no cuenta: la foto no es candidata); `display:none` del logo (@s21, ahora
   la caja mide más de 0); «el velo se aclara» (@s11 y `accesibilidad` @s18); la
   explicación de la regla de movimiento reducido (@s18, ahora con la especificidad
   medida por la 48).
3. *Cierre sin la corrida de navegador*: nuevo @s23.
4. *Estado estable*: todas mis precondiciones remiten a `hero_reducido_con_animacion` @s10
   por etiqueta, sin copiar su criterio.
5. *Afirmaciones sin verificar*: las de §9 se comprobaron contra el repositorio; lo
   deducido sin medir lleva su etiqueta (panel, retardos).
6. *LCP*: la premisa «el texto cuenta en el primer fotograma» era falsa (medida en
   Chromium 151). @s20 y su nota están corregidas, con las dos líneas base separadas
   (local 132/120 ms, desplegada 264/236 ms) y el informe registra el instante en que
   termina la animación del candidato.
7. *Hero*: «al menos 100svh, exactamente esa altura cuando el contenido cabe» (@s6 y el
   índice), sin duplicar `hero_reducido_con_animacion` @s12.
8. *Nombres de los informes de cierre*: `judge_cabecera_sobre_el_hero.md` y compañeros
   (antes `judge_49.md`).
9. *Este resumen*: lista toda línea no comentada que cambia (§2) y solo deja la duda que
   de verdad está abierta (§7).
