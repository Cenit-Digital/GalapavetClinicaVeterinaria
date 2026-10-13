# Feature 48 — resumen del contrato para firmar (13/10/2026, versión corregida dos veces)

> Escrito para Pablo, sin jerga. El contrato completo vive en
> `features/hero_reducido_con_animacion.feature` (lo nuevo y el índice) y en los
> cinco ficheros que se enmiendan. Aquí solo está el mapa de qué cambia y por qué.
> Esta versión incorpora dos rondas de revisión independiente y tu decisión P5
> (hero de pantalla completa).
> **Nada de esto está firmado todavía y no se escribe código hasta que lo firmes.**

## 1. Qué firmas, en seis líneas

1. El hero de la portada se queda con **tres cosas**: el titular, el párrafo de
   siempre y el botón «Reservar cita». Desaparecen la etiqueta de ubicación, el
   botón «Llamar», la franja de horario y las cuatro cifras.
2. Los tres van **pegados a la izquierda**, justo debajo de donde empieza el logo
   de la cabecera, no centrados.
3. Los tres **entran con una animación suave**: aparecen y se deslizan 40 píxeles
   de izquierda a derecha, 0,7 s cada uno, uno detrás de otro (el párrafo 0,12 s
   más tarde y el botón 0,24 s más tarde). Si el visitante tiene activada en su
   móvil u ordenador la opción de «reducir movimiento», **no se mueve nada** y los
   tres se ven desde el primer instante.
4. **No se pierde ningún dato**: el teléfono, el horario y la localidad siguen
   visibles en Contacto, en las preguntas frecuentes, en el chat de reserva y en
   el pie.
5. Se **borra el código que solo servía para lo retirado**, y se **amplía la regla
   de movimiento del proyecto** (hoy solo permite 0,15 s y 0,3 s) para que quepa
   tu animación de 0,7 s. Tu respuesta P1 del 13/10/2026 es la autorización que la
   regla anterior exigía para volver a poner animaciones.
6. **El hero es de pantalla completa** (tu decisión P5): la sección de bienvenida
   mide **al menos** el alto de la ventana en todos los anchos, también en móvil, y
   **exactamente** ese alto cuando el contenido cabe; su contenido va centrado en
   vertical bajo la cabecera. Hoy mide 837 px a 1440×900 (no los 756 que daba por
   buenos el borrador): la primera pantalla se ve igual que hoy (cabecera de 64 px
   + 836 px de hero), lo que cambia es lo que hay debajo del pliegue. **Hasta que
   llegue la feature 49** (la cabecera sobre la foto), el contenido queda unos 32 px
   más abajo del centro de la sección, porque la cabecera aún no la cubre; con la
   49 el centrado queda exacto.

## 2. Todo lo que cambia, escenario a escenario

«@sN» es el número del escenario dentro de su fichero. «Retirado» significa que el
escenario se quita pero **su número no se vuelve a usar**, y su texto original
queda copiado dentro del fichero como nota.

| Escenario | Fichero | Qué cambió (antes → después) | Por qué |
| --- | --- | --- | --- |
| Historia de usuario | `hero.feature` | «Quiero saber quién es, dónde está, cuándo abre y qué hacer / reservo o llamo» → «quién es y qué hacer / reservo» | El hero ya no dice dónde está ni cuándo abre |
| Historia de usuario | `fidelidad_hero.feature` | «dónde estoy y cómo contactar» → «quién es Galapavet y cómo reservar» | El hero ya no ofrece contacto telefónico |
| @s1 | `hero.feature` | Mostraba el titular **y** el texto «Galapagar · Madrid» → solo el titular (y que no aparezca «Miraflores») | La etiqueta de ubicación se va |
| @s4 | `hero.feature` | Botón «Llamar 91 082 92 67» → **retirado** | Lo pediste quitar (punto 3). El teléfono sigue en Contacto y en el pie |
| @s5 | `hero.feature` | El número visible y el enlace de llamada coinciden → **retirado** | Ya no hay enlace de llamada en el hero. La regla sigue valiendo en Contacto y en el pie |
| @s6 | `hero.feature` | Franja con los 3 tramos de horario → **retirado** | Lo pediste quitar. El horario sigue en Contacto, chat y preguntas frecuentes |
| @s9, @s10 | `hero.feature` | «Sin teléfono / sin horario en los datos, no se pinta el botón / la franja» → **retirados** | El hero ya no lee ni teléfono ni horario |
| @s11 | `hero.feature` | «Un teléfono mal escrito rompe el hero» → **retirado** | El hero ya no usa teléfonos. Esa protección sigue en Contacto y en el pie, donde sí hay enlaces de llamada |
| @s13 | `hero.feature` | Los enlaces del hero van a «#…» **o a «tel:…»** → solo a «#…», y tiene que haber al menos uno | Ya no hay enlaces de llamada; si volviera uno, esta prueba se enteraría |
| @s2, @s3, @s7, @s8, @s14 | `hero.feature` | **Sin cambios** | Siguen siendo ciertos tal cual |
| @s1 | `fidelidad_hero.feature` | «Todo centrado, con etiqueta y **dos** botones» → «tres elementos pegados a la izquierda y **un** botón». A 1440 px, a ras del logo; a 1024 y 375 px basta con que los tres compartan el mismo borde izquierdo y sea el de las demás secciones | Tu punto 3. A 1024 y 375 no se ata a la cabecera porque esa la cambia la feature 49 |
| @s2 | `fidelidad_hero.feature` | «Las 4 cifras se ven completas» → «el botón se ve completo, el hero no recorta nada y **no hay ningún número** en el hero» | Sin cifras; «ningún número» cubre también teléfono y horario |
| @s3 | `fidelidad_hero.feature` | A 320 px: «etiqueta, titular, botones y cifras visibles» → «titular, párrafo y botón visibles, dentro de la pantalla, sin barra horizontal» | Lo mismo con menos piezas |
| @s18 | `rediseno_visual.feature` | «Dos secciones estrechas a propósito (hero y FAQ)» → «**solo el FAQ**». Ya no se mide nada del hero aquí | Un hero pegado a la izquierda ya no es un bloque estrecho y centrado; su borde izquierdo lo mide `fidelidad_hero` @s1, que sabe esperar a que acabe la animación |
| @s29 | `rediseno_visual.feature` | **Sin cambio por la 48** (nota): el velo no se toca y la altura pasa a pantalla completa. La feature 49 sí enmienda dos de sus cláusulas | El velo es la feature 49 |
| @s30 | `rediseno_visual.feature` | «Etiqueta, dos botones y banda de cuatro cifras» → **retirado** | Es justo lo que se quita; lo cubre el escenario nuevo @s1 |
| @s33 | `rediseno_visual.feature` | «Todas las secciones llevan su rótulo en mayúsculas, el hero con excepción de color» → «las secciones con fondo de color lo llevan; **el hero no lleva ninguno**» | El único rótulo del hero era la etiqueta de ubicación |
| @s51 | `rediseno_visual.feature` | «Las 4 cifras salen de los datos reales» → **retirado** | Ya no hay cifras. «Ningún número en el hero» lo cubre mejor |
| Nota de política (sección D) | `accesibilidad.feature` | «El sitio no tiene **ninguna** animación de entrada» → «tiene **una** (el hero), aprobada por Pablo el 13/10/2026». El título de la nota antigua del 20/09 queda con el aviso «[SUPERADO EN LO DEL HERO…]» y se retiran dos líneas de comentario («ESTA ES LA ÚNICA NOTA DEL REPOSITORIO QUE LO CUENTA; EL RESTO APUNTAN AQUÍ»), porque ya hay una segunda nota | Tu respuesta P1 es la autorización que se exigía |
| @s19 | `accesibilidad.feature` | «Con “reducir movimiento” nada se anima» → igual, **más dos cláusulas**: los tres elementos del hero cuentan, medidos en el primer fotograma sin esperar, y sin esa opción sí se animan | Para que la prueba no se cumpla «porque no hay nada que apagar» (ver sección 4) |
| @s20 | `accesibilidad.feature` | «Hay exactamente **0** animaciones de entrada» → «hay al menos una y **todas son del hero**»; la puerta aprende a distinguir el punto de partida de una animación de un contenido realmente invisible (tabla de 8 casos) | Ver sección 4 |
| @s21 | `accesibilidad.feature` | **Revisado, sin cambio de letra** (nota) | Sigue siendo cierto y ahora tiene sentido |
| @s22 | `accesibilidad.feature` | «Sin la opción, el sitio se mueve (desplazamiento suave y transiciones)» → añade «la portada tiene exactamente las 3 animaciones del hero, ninguna otra ruta tiene y todo queda visible al acabar, comprobado en el último instante de la animación y en su último fotograma» | La 39 había anunciado que ese escenario recuperaría eso el día que volvieran las animaciones |
| @s16 | `identidad_visual.feature` | Escala de movimiento: **2** duraciones (0,15 s y 0,3 s) → **3** (añade **0,7 s**) y **3 retardos** (0, 0,12 y 0,24 s); la puerta ahora lee segundos, retardos, orden de los tiempos, declaraciones en varias líneas y valores no literales, sobre **20 ficheros** (antes 18: se añaden `_api.scss` y `_tokens.scss`) | Ver sección 4 |
| @s23 | `identidad_visual.feature` | «el alto del titular y **del primer párrafo** de la portada» → «del titular y **del primer párrafo de la sección de Servicios**» | El primer párrafo de la portada pasa a ser el del hero, que se anima y salta de línea con la fuente de respaldo |
| F2, tabla (A) y nota 46/47 | `retirada_carteleria_urgencias.feature` | **Solo comentarios** (tres notas de la feature 48): F2 queda como historia, la fila de accesibilidad avisa del cambio y 47/46 quedan absorbidas | El texto firmado de ese fichero no se ha tocado: comprobado con `diff` |
| @s1 | `fidelidad_lienzo.feature` | **Revisado, sin cambio**: mide el ANCHO de las bandas, no el alto | Con pantalla completa sigue cierto |

**Cuenta:** 20 escenarios cambiados o retirados, en 5 ficheros, más 3 revisados
sin cambio (`rediseno_visual` @s29, `accesibilidad` @s21 y `fidelidad_lienzo` @s1).

- Cambiados o retirados: `hero.feature` 8 (@s1, @s4, @s5, @s6, @s9, @s10, @s11,
  @s13) + `fidelidad_hero.feature` 3 + `rediseno_visual.feature` 4 (@s18, @s30,
  @s33, @s51) + `accesibilidad.feature` 3 (@s19, @s20, @s22) + `identidad_visual.feature`
  2 (@s16, @s23) = **20**, en **5 ficheros**.
- Más 2 historias de usuario reescritas (`hero` y `fidelidad_hero`) y 3 notas (solo
  comentarios) en `retirada_carteleria_urgencias.feature`.

## 3. Los 12 escenarios nuevos (en `hero_reducido_con_animacion.feature`)

| # | Qué fija, en una frase |
| --- | --- |
| @s1 | El hero tiene **exactamente** titular, párrafo y un botón; ningún dígito, ninguna lista, ningún «Galapagar», «Llamar» u horario. Es lo que impide que vuelva cualquiera de las cuatro piezas retiradas |
| @s2 | Teléfono, horario y localidad **siguen publicados** fuera del hero (Contacto, pie, preguntas frecuentes, chat de reserva), y dentro del hero hay 0. Las preguntas frecuentes se abren **una a una** y su horario se compara tramo a tramo («sábados de 11:00 a 14:00»), no con palabras sueltas |
| @s3 | El código que solo servía para lo retirado **ya no existe** (`Hero-logica.ts`, props, estilos, dos funciones sin uso) |
| @s4 | Revisión, tipos, compilación, pruebas, **pruebas de navegador** y mutación terminan limpios; el informe de cierre cita la salida de las pruebas de navegador y la Decisión 31 queda actualizada |
| @s5 | Con movimiento permitido: **3 animaciones**, 0,7 s, retardos 0 / 0,12 / 0,24 s, `ease-out`, solo opacidad y desplazamiento, 40 px hacia la derecha, una sola vez, terminan a los 0,7 / 0,82 / 0,94 s; se comprueba también el último fotograma, con tolerancias escritas |
| @s6 | Con «reducir movimiento»: **nada** se anima y los tres se ven en el primer fotograma (incluye el retardo, que la regla global no apaga) |
| @s7 | Si la animación **no se ejecuta**, el contenido **se ve** igualmente en su sitio (se comprueba cancelándola en el navegador) |
| @s8 | Las declaraciones de animación y de retardo **solo** viven dentro de la opción «sin preferencia de reducir»; ninguna dentro de «reducir» (salvo `animation: none`) ni fuera. Tabla de 21 casos sobre 20 ficheros |
| @s9 | Durante la entrada **no hay barra horizontal**, nada de debajo se mueve y el CLS (saltos de maquetación) no pasa de 0,1 en las 6 rutas, leído tras la entrada. Es una red de seguridad general, no un detector de un fallo concreto |
| @s10 | Cada prueba de navegador que mide la portada recién cargada lo hace **con la animación ya terminada** (con un ayudante único, anclado y con tope, que se prueba aparte con cuatro páginas sintéticas) o con movimiento reducido, para que no den verde unas veces y rojo otras |
| @s11 | El **tiempo de LCP** (cuándo se pinta lo más grande de la portada) se mide antes y después, con la mediana de 5 cargas y en el mismo entorno, y no pasa de 2,5 s; el «antes» ya está medido (en local 132 ms escritorio y 120 ms móvil; en la web desplegada 264 y 236 ms) y tú decides si el «después» es una regresión aceptable |
| @s12 | **El hero es de pantalla completa**: al menos el alto de la ventana y exactamente ese alto cuando el contenido cabe, en todos los anchos, y su contenido está centrado en vertical bajo la cabecera de 64 px |

## 4. Las dos «puertas» que se endurecen (qué falla hoy, dicho sin jerga)

Una «puerta» es una prueba automática que impide que algo se rompa. Dos de las
del proyecto tienen un agujero que se habría notado justo con esta animación:

1. **La regla de tiempos de movimiento** (`@s16` de identidad visual). Hoy solo
   entiende milisegundos, así que un `1.25s` (la duración de la web de referencia)
   **pasaría sin que nadie lo viera**. Tampoco mira los retardos. Además solo lee
   18 hojas de estilo —`global.scss` y los 17 módulos—: no lee `_api.scss` (donde
   está el estilo del botón del hero) ni `_tokens.scss`. Y no ve los valores que no
   son un número escrito (`var(--x)`). El contrato exige que entienda segundos, que
   mire retardos, que sepa cuál de los dos números de una línea es la duración y
   cuál el retardo (un `120 ms` de duración con `700 ms` de retardo tiene los dos
   números «bien» y está mal), que lea las declaraciones partidas en varias líneas,
   que lea las 20 hojas y que **falle si no puede leer un valor**.
2. **La regla de «contenido invisible hasta que se anima»** (`@s20` de
   accesibilidad). Hoy da por «invisible» cualquier animación cuya hoja contenga
   un `opacity: 0`, y toda animación de entrada **empieza** en opacidad 0 dentro
   de sus fotogramas: se pondría roja contra algo correcto. El contrato exige que
   distinga «punto de partida de la animación» de «el contenido está de verdad
   oculto», y que **siga poniéndose roja** si el contenido está oculto de verdad
   (también si está escrito en una sola línea, otro agujero que hoy existe).

Lo que **no** protege la entrada del hero (aunque lo parezca): `identidad_visual`
@s42 y `accesibilidad` @s19, tal como se ejecutan hoy, esperan a que acabe el
movimiento y solo después cuentan; un hero que animara cuando no debe pasaría su
espera. Por eso los protectores reales son los escenarios nuevos @s6 y @s8 y las
dos cláusulas que se añaden a `accesibilidad` @s19, que miden en el primer
fotograma sin esperar.

Cada escenario del contrato lleva, además, una nota «puerta que muerde»: qué cambio
concreto en el código lo pondría en rojo.

## 5. Cosas que he escrito y que NO estaban literales en tus decisiones

Salen de leer el código o de que, sin ellas, lo que pediste quedaría roto. Dime si
alguna sobra y la quito.

1. **Durante su retardo, el párrafo y el botón esperan invisibles** (@s5). Si no,
   aparecerían de golpe en su sitio y luego «volverían a entrar» (parpadeo).
2. **La regla de tiempos lee también declaraciones partidas en varias líneas,
   rechaza retardos negativos y distingue duración de retardo** (@s16). Hallazgo
   mío: la forma en que ya está escrito el módulo del equipo no se lee más allá de
   su primera línea; así que un `1.25s` en la segunda línea se colaría.
3. **Una animación escrita en una sola línea desordena la regla de cobertura**
   (@s8): el fichero dejaría de contar bien qué está dentro de «sin preferencia»
   y una animación mal colocada pasaría por buena. Y dentro de «reducir» solo se
   admite `animation: none`. **Matiz de criterio mío:** unos `@keyframes` escritos
   en la raíz del fichero se admiten sin condición (por sí solos no mueven nada;
   lo que mueve es la declaración que los usa, y esa sí está regulada); si
   prefieres que estén siempre dentro de «sin preferencia», lo cambio.
4. **«Ningún número en el hero»** (@s1 y `fidelidad_hero` @s2): atrapa de golpe
   teléfono, horario y cifras sin tener que listarlos. **Es más estricto que lo
   que pediste**: veta también cualquier cifra futura en el titular o el párrafo.
   *Alternativa:* una lista negativa de números concretos (el teléfono, las horas,
   las cuatro cifras retiradas).
5. **Sin «will-change» permanente** tras la entrada (@s5): sale de tus decisiones
   §5 («sin will-change permanente»), pero ahí no tenía escenario.
6. **La escala ampliada (0,7 s y retardos de 0,12 y 0,24 s) vale para todo el
   sitio**, no solo para el hero (@s16). Es fiel a tu «se amplía la escala», pero
   también es una decisión. *Alternativa:* limitar el paso de 0,7 s y los retardos
   al hero, y dejar el resto en 0,15 y 0,3 s.
7. **@s10** (medir en estado estable): tus decisiones §8 pedían «decidir y escribir
   cómo se miden». He fijado una regla por prueba (no por fichero): un ayudante
   único que espera a que acabe la animación, con tope, o movimiento reducido
   emulado antes de cargar. La lista de pruebas afectadas se descubre por criterio
   (qué llamadas cuentan como «medir»), no a mano.
8. **El reloj de animaciones se congela antes de cargar la página** en las pruebas
   que miden la propia animación (@s5, @s7, @s9, @s12, `accesibilidad` @s19 y
   @s22). Sin eso, en un ordenador lento la animación (que dura 0,94 s) podría
   haber terminado cuando la prueba va a medirla, y daría rojo con el código
   correcto.
9. **La curva `ease-out` se lee del valor de cada elemento, no del «efecto»** (@s5):
   en una animación CSS el efecto en sí es siempre lineal y la curva se aplica a
   cada tramo; leerla del sitio equivocado haría fallar el código correcto.
10. **@s2 pide «al menos» esos lugares, no «exactamente» esos**: el chat de reserva
    también tiene el teléfono de la clínica y los titulares de Contacto y Servicios
    también nombran la localidad, así que «exactamente» se pondría rojo sin que
    nadie hubiera roto nada.
11. **A 1024 y 375 px, `fidelidad_hero` @s1 no compara con el logo** sino con el
    resto de secciones (ver tabla): comparar con el logo a esos anchos ataba la 48
    a la cabecera, que es de la feature 49.
12. **El último fotograma de la animación se comprueba aparte, con tolerancias
    escritas** (@s5, @s7, @s9, `accesibilidad` @s22). Con el modo de relleno que
    necesita el escalonado, una animación terminada se lee como «sin animación»;
    por eso se mide en el último instante activo (1 ms antes del final), donde la
    curva aún no ha llegado del todo a 1 (opacidad 0,999996 medida): se piden
    opacidad ≥ 0,999 y desplazamiento < 0,5 px, y la exactitud se lee del último
    fotograma de la propia animación.
13. **`tipografia.spec.ts` y `identidad_visual` @s23 pasan a medir un párrafo que no
    es del hero** (el primero de Servicios), porque el primer párrafo de la página
    pasa a ser el animado. Se medirá antes de cerrar.
14. **El LCP del titular animado cuenta al terminar el fundido, no al empezar**
    (@s11; medido en Chromium 151): ver el punto (a) de la sección 6.

## 6. Valores por defecto que firmas si no los vetas

(Decisiones §6 y lo que antes eran «dudas»; todo vetable hasta la firma.)

- **Contenido:** se conserva el párrafo actual y el botón «Reservar cita»; el
  titular no cambia.
- **Alineación:** a la izquierda, en el borde izquierdo de la columna de 1220 px,
  a ras del logo.
- **Altura (tu decisión P5, con una concreción mía vetable):** pantalla completa:
  la sección mide **al menos** el alto de la ventana y **exactamente** ese alto
  cuando el contenido cabe. Tú dijiste «exactamente», pero en una ventana más baja
  que el contenido (un móvil en horizontal, 812×375) «exactamente» obligaría a
  recortar texto, y he elegido que la sección crezca en vez de recortar. Si
  prefieres recortar, dímelo. El punto anterior de este apartado («la del hero
  actual, `clamp(560px, 84svh, 784px)`») queda **sustituido**: esa cifra tampoco
  era la altura de hoy (hoy mide 837 px a 1440×900, 825 px a 1024×768 y 875 px a
  375×812, porque el contenido empuja).
- **(a) Tiempo de LCP, sin margen numérico propuesto por mí.** El «antes» ya está
  medido en `progress/lcp_hero_linea_base_20261013.md`: en local 132 ms
  (escritorio) y 120 ms (móvil); en la web desplegada 264 y 236 ms. Medido en
  Chromium 151, un texto con **fundido de opacidad cuenta como «lo más grande» al
  TERMINAR el fundido**, no al empezar. Con la foto fuera de juego (cuando la
  cabecera la cubra, feature 49) el LCP esperado es del orden de **860 ms** (el
  párrafo a +120 ms, más 700 ms de fundido, más unos 40 ms) frente a los 132 ms de
  hoy en local (unas 6,5 veces) o los 264 ms de la web desplegada (unas 3 veces):
  muy por debajo del umbral «bueno» de 2,5 s, pero claramente más lento. En la 48
  sola no cambia nada (la foto sigue contando). El contrato exige mediana de 5
  cargas ≤ 2,5 s, informar del «antes» y del «después» en el mismo entorno, y que
  **decidas tú** si la regresión es aceptable; ninguna fuente oficial da una
  tolerancia y no me la he inventado. *Alternativa técnica:* animar solo el
  desplazamiento y no el fundido (medido: 32-36 ms de LCP), a costa de una entrada
  menos suave.
- **(b) El prototipo guardado en `docs/diseno-claude-design/`** conserva el hero
  antiguo (etiqueta, dos botones y cifras) y **se deja como histórico, sin tocar**.
  `rediseno_visual` @s41 solo comprueba el inventario de ficheros, no que el
  contenido coincida, así que no hay contradicción.
- **(c)** La sección **crece** en una ventana más baja que el contenido (ver
  Altura).

## 7. DUDAS PARA PABLO

**Ninguna abierta.** Lo que en la versión anterior eran tres dudas (la tolerancia
del LCP, el prototipo guardado y qué hacer en una ventana más baja que el
contenido) pasan a **valores por defecto vetables** de la sección 6, con la cifra a
la vista. Solo hace falta que digas **sí** o **veto** a cada uno.

## 8. Para el `craftsman_lead` (fuera de mi alcance)

**Ya hecho por ti (no hay que repetirlo):** `feature_list.json` (P5 añadido como
criterio 9, `@s18` en la nota de la 48, criterio de LCP corregido) y las
correcciones de `decisiones_cabecera_hero_20261013.md` §6.3 y §7. La nota de la 49
ya dice @s12 para la altura.

**Pendiente de ti:**
- `feature_list.json`: dejar la 48 en `spec_ready` cuando lances la firma; quedan
  desfasadas la **aceptación 8 de la feature 22** («dos duraciones, 150/300 ms»),
  la **descripción de la feature 4** («dónde está»), el `acceptance` de las
  features 4, 27 y 28 y el resumen de la 28 en `project-spec.md` (píldora, dos
  botones, cifras). Si quieres trazabilidad, añade `identidad_visual @s23` a la
  nota de la 48.
- `project-spec.md`: la **Decisión 31** («dos pasos: 150 y 300 ms») y la nota de
  «fuera de alcance» de la feature 22 quedan desfasadas. **Es criterio de cierre del
  `judge`** (escrito en @s4) que la Decisión 31 quede actualizada.
- **Nombres de los informes de cierre** (una sola convención, la de CLAUDE.md):
  `progress/tdd_hero_reducido_con_animacion.md`,
  `progress/judge_hero_reducido_con_animacion.md` (cita la salida de
  `pnpm run test:e2e`), `progress/mutation_hero_reducido_con_animacion.md` (cada
  equivalente justificado) y `progress/lcp_hero_despues_<fecha>.md`.
- La **feature 47** se cierra al cerrar la 48 (sin sujeto). `boton-fantasma` sigue
  teniendo consumidores fuera del hero (cabecera, formulario, chat y varias
  páginas), así que no queda mixin huérfano.
- Pruebas que hay que **reescribir o invertir** (no son contrato, pero rojo
  seguro): `Hero.test.tsx` (píldora, llamar, horario, cifras, el `clamp` de
  `min-height` y la prueba de `rediseno_visual` @s18 «ancho propio del hero
  < 1220», que se **retira**), `Faq.test.tsx` (sale el 900 escrito a mano),
  `fidelidad-hero.spec.ts` (entero, y acoge la puerta nueva del recuento de rótulos
  en mayúsculas), `Hero-logica.test.ts` (se borra), `datosDelSitio.test.ts` (casos
  de `digitosDe` y `extraerFragmento`), `escalaMovimiento.test.ts` (el caso que
  fija que `animation-delay` se ignora, y su inventario de 18 a 20 ficheros),
  `accesibilidad-movimiento.test.ts` (el que fija que el recuento es 0),
  `tipografia.spec.ts` (mide el párrafo de Servicios) y `accesibilidad.spec.ts`
  @s45 (emular movimiento reducido antes del `goto`). Y la regla
  `@media (max-width: 560px) { .hero { min-height: 0 } }` del SCSS desaparece.
- **Comentarios que quedan falsos** (solo comentario; se cita fichero y frase, no
  línea): `accesibilidad-movimiento.test.ts` y `accesibilidad-movimiento.ts`, que
  citan `accesibilidad.feature` @s20 por número de línea; `Galeria.test.tsx`, que
  cita `Hero-logica.test.ts`; `Equipo.test.tsx` y `Servicios.test.tsx`, que
  mencionan la excepción de la Enmienda 2 del Hero; y el de procedencia de la fila
  de foco de `matrizDeContraste.ts` (cita `.acciones a`).
- Con la animación en marcha pueden volverse intermitentes si no se miden con
  @s10: `fidelidad-responsive-integral`, axe, foco/contraste de `accesibilidad`,
  `tipografia`.
- He ejecutado **una vez** `pnpm run build` (solo escribe `dist/`, que Git ignora):
  termina con código 0 y **sin ningún aviso** de TypeScript ni de Vite. No hay hoy
  ninguna prueba omitida (`.skip`, `.todo`, `test.fixme`: 0). **No** he ejecutado
  lint, pruebas unitarias ni pruebas de navegador.

## 9. Cómo lo he comprobado

- `git show :features/retirada_carteleria_urgencias.feature | grep -v "^\s*#"`
  contra el fichero actual y contra `HEAD` → **INTACTO**. Solo hay comentarios
  añadidos (tres notas de la 48 y las de la 49).
- Las únicas líneas **no comentario** que cambian en los otros cinco ficheros son
  las de los escenarios de la tabla de la sección 2 y las dos historias de
  usuario (comparado línea a línea contra `HEAD`, descontando lo que escribe la
  feature 49 en los ficheros compartidos).
- Un revisor de estructura Gherkin escrito para la ocasión (no hay `cucumber` en
  el repo): 0 problemas; etiquetas `@sN` únicas por fichero; ninguna reutilizada;
  todas las referencias «fichero @sN» de la 48 apuntan a un escenario vivo.
- `rediseno_visual.feature` conserva sus finales de línea CRLF originales
  (uniformes); los demás, LF; todos en UTF-8 sin BOM.
- `pnpm run build` en verde y sin avisos (ver sección 8).

## 10. Para la feature 49 (anotado, no editado)

- `fidelidad_lienzo` @s1 («las bandas alcanzan ambos bordes de la ventana»): leído
  junto con su spec, mide ancho y no alto; con el hero a pantalla completa **sigue
  cierto** y no hace falta enmendarlo.
- Mientras la cabecera no cubra la foto, el hero arranca a 64 px del borde superior
  y sus últimos 64 px quedan bajo el pliegue; **la 49 hace que arranque en y = 0**.
  @s12 mide la sección y el centrado dentro de ella (descontando los 64 px de
  cabecera), no la posición en la ventana, así que **no cambia con la 49**.
- Con la foto bajo la cabecera, la spec de LCP la descarta como candidata (área
  visible = ventana): ahí es donde @s11 pasa a medir el titular o el párrafo
  animados, que cuentan **al terminar el fundido**, no al empezar. Lo que la 49
  mida de contraste sobre el titular debe hacerse con la entrada terminada (@s10).
- `fidelidad_hero` @s1 deja a propósito sin fijar la coincidencia con la marca a
  1024 y 375 px: si la 49 quiere fijarla, es suyo.
- La 49 enmienda dos cláusulas de `rediseno_visual` @s29: el contraste del hero deja
  de comprobarse con la prueba actual de `Hero.test.tsx`.

## 11. Correcciones tras la revisión independiente

### Primera ronda

Cuatro revisores independientes pidieron corregir 2 puntos bloqueantes, 19
importantes y 21 menores. Los 40 importantes y menores (19 + 21) se agrupan en 14 +
10 temas, porque varios revisores señalaron lo mismo; los 2 bloqueantes son B1 y B2.

| Tema | Corrección |
| --- | --- |
| B1 último instante de la animación | Se mide en el último instante activo y se lee el último fotograma (@s5, @s7, @s9, `accesibilidad` @s22) |
| B2 cambio no listado | Historia de usuario de `fidelidad_hero` añadida a la tabla; aviso del título de la nota antigua y líneas retiradas |
| I1 @s4 | Exige también las pruebas de navegador y la mutación «100 % sobre no equivalentes» |
| I2 @s2 | Preguntas frecuentes abiertas una a una; regla de coincidencia del horario |
| I3 @s18 | Se quita la medida del hero (la hace `fidelidad_hero` @s1); puertas reales corregidas |
| I4 @s33 | La puerta del recuento de rótulos es nueva, en `fidelidad-hero.spec.ts` |
| I5 @s10 | Regla por prueba con ayudante único y anclado; sin meta-ejecución |
| I6 premisas de @s6 | El anulador global no es red de seguridad; un retardo mal puesto se detecta por el retardo computado |
| I7 opacidad | Se mide la opacidad efectiva (con los ancestros) |
| I8 @s19 / @s42 | Quitada la afirmación de que protegen el hero; @s19 mide el primer fotograma |
| I9 @s9 | Red de seguridad declarada; se mide a 375 px |
| I10, I11 @s16 | Más casos en la tabla e inventario fijado en 20 ficheros |
| I12 @s8 | Tabla por propiedad y lugar; única anulación en «reducir»: `animation: none` |
| I13 altura | 837 px y no 756; sustituido por tu decisión P5 (@s12) |
| I14 LCP | Umbral de campo explicado, línea base citada, mediana de 5 cargas |
| M1 … M10 | Fin de la animación a 0,7/0,82/0,94 s; igualdad con el logo solo a 1440 px; nota de @s3 sin barra horizontal; «cinco añadidas» y fila de `visibility`; punto 5 como historia; @s3 por identificadores; `tipografia` mide otro párrafo; ampliaciones declaradas con su alternativa; comentarios falsos listados; cláusulas documentales marcadas |

### Segunda ronda

Tres revisores independientes más (aplicación, consistencia, mordiente y verdad):
0 bloqueantes, 13 importantes y 23 menores. Se aplicó esto:

1. **Tolerancias del último instante (@s5 y `accesibilidad` @s22):** a 1 ms del
   final la curva aún no llega a 1 (medido 0,999996), así que se piden opacidad
   ≥ 0,999 y desplazamiento < 0,5 px; la exactitud la fija solo la lectura del
   último fotograma, y se explica en la nota.
2. **@s10, excepciones:** pasan de un comentario a un paso del Given, reconocibles
   por «congela el reloj antes de navegar» (@s5, @s7, @s9, @s12, `accesibilidad`
   @s19 y @s22) y el de @s11.
3. **@s10, ayudante:** el registro de arranque y fin de las animaciones se instala
   antes de cargar y la espera lo lee (no `getAnimations()`); se prueba aparte con
   cuatro páginas sintéticas y se atribuye cada fallo a la suya.
4. **@s10, criterio de descubrimiento:** lista cerrada de llamadas que cuentan como
   «medir» y espera que las precede; vale una función local del mismo fichero; los
   bucles por rutas y los tests tipográficos quedan fuera; `accesibilidad.spec.ts`
   @s45 se reordena.
5. **@s11, premisa falsa del LCP:** el texto con fundido cuenta al terminar la
   animación, no al empezar; el informe registra el cierre y el instante medido; la
   «puerta que muerde» se limita a la 49 y las cifras (≈860 ms frente a 132/264 ms)
   están en la sección 6 para que decidas.
6. **@s11, entorno:** el «después» se mide en el mismo entorno que su línea base
   (citada la local: 132 ms y 120 ms) y desaparece «imagen decodificada y un
   fotograma más» del «mismo método».
7. **Altura (decisión (c) del lead):** al menos la ventana y exactamente ese alto
   cuando cabe; @s12 gana un tamaño bajo (812×375) y define «contenido»; el aviso
   de los 32 px, en el apartado 1.6; la antigua duda 3 pasa a valor por defecto.
8. **Índice (B) y sección 8:** renumerados a los 11 criterios de `feature_list.json`;
   lo que ya hiciste queda marcado como hecho.
9. **@s2, horario de las preguntas frecuentes:** se compara con el texto de la
   propia función o tramo a tramo; fuera «de forma equivalente»; los valores no se
   retipean.
10. **@s9, lectura del CLS:** tras `load`, 940 ms fijos y un fotograma, no «cuando
    no quede animación» (esa espera sin ancla devuelve vacía).
11. **@s8:** corregida la frase del inventario (la prueba de escala leía 18 hojas;
    `movimiento-global.test.ts` ya cubre las 3 globales); explicado cómo convive el
    catálogo de 20; fila de `animation-name` en consulta ajena; `@keyframes` en la
    raíz «sin condición».
12. **`identidad_visual` @s16:** filas `animation-delay: 0.24s` y
    `transition-delay: 0.12s` dentro de escala.
13. **Cláusulas documentales:** «lo verifica el judge» en las dos de @s11 y en la
    justificación de equivalentes de @s4; una sola convención de nombres de
    informe (la de CLAUDE.md).
14. **`identidad_visual` @s23:** enmendado («primer párrafo de la sección de
    Servicios») con su nota; cuenta ahora 20 escenarios enmendados.
15. **Notas y citas:** @s19 «dos cláusulas» y qué muerde cada una; «todos ellos» en
    @s2; «punto 3» y «palabras clave» en `fidelidad_hero`; cita literal en la nota
    de @s22; línea retirada y comillas corregidas en @s33; `Hero.test.tsx` @s18
    «se retira» en todos los sitios.
16. **Resumen:** quitadas las citas de número de línea; este apartado ampliado; la
    duda del prototipo corregida (@s41 solo mira el inventario) y las tres dudas
    pasadas a valores por defecto vetables; línea sobre el prototipo en el
    contrato.
17. **Conflictos con la 49:** @s29 «sin cambio por la 48 (la 49 enmienda dos
    cláusulas)» y «el contraste lo reescribe la 49»; la nota F2 dice «tres notas de
    la feature 48» sin recuento absoluto; «@s29 (que la 48 no cambia)».
