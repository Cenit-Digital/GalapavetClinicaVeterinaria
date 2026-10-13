# Decisiones — cabecera sobre el hero (features 48 y 49) — 13/10/2026

> `craftsman_lead`. Este documento es la **fase de conversación** del proceso SDD
> para las features 48 y 49: lo pedido, lo medido, lo que decidió Pablo y lo que
> se aplica por defecto mientras él no lo vete. De aquí destilan los
> `features/*.feature`. Los informes completos de la investigación viven en
> `progress/investigacion_cabecera_hero_20261013/`.

---

## 1. Lo que pidió Pablo (13/10/2026, cuatro puntos)

1. **La imagen del hero ocupa también la cabecera y la barra de navegación**
   (cabecera transparente sobre la foto, como https://vetcruzverde.es/).
2. **Enlaces del nav más grandes y más claros** («le des la opacidad que
   necesite para que queden bien con la imagen de fondo»). No pidió reposicionarlos:
   «nuestra web, que queden más o menos en el centro, están bien».
3. **Contenido del hero reducido a tres elementos, desplazado a la izquierda:**
   H1 («Cuidamos la salud y la felicidad de tu mascota»), el párrafo actual y un
   botón («Reservar cita»). «Todo el resto de elementos de ese giro central los
   eliminas.»
4. **Animación de entrada** suave, elegante y «relativamente corta», con
   libertad para innovar (izquierda→derecha o al revés).

Cierre del encargo: «Cualquier duda que tengas me puedes preguntar… cada mínimo
detalle lo tenemos que acordar para que todo salga estupendamente y perfecto.»

Recursos: web de referencia https://vetcruzverde.es/ ; web desplegada
https://cenit-digital.github.io/GalapavetClinicaVeterinaria/ ; los dos PDF
«Exploración WEB actual» (auditoría de la web ANTIGUA de Galapavet, mismo texto en
las dos copias, no tocan este encargo) ; la grabación `2026-08-16 16-14-50.mkv`
(reunión con Roberto, ya transcrita en `progress/transcripcion_reunion_rober_20260816.txt`;
no contiene este encargo).

## 2. La referencia, medida en navegador real (vetcruzverde.es, 13/10/2026)

| Aspecto | Valor medido |
| --- | --- |
| Cabecera | Transparente sobre el vídeo; `position: fixed`; al bajar pasa a `rgb(43,45,69)` con sombra `0 4px 10px rgba(0,0,0,.15)`; transición `background-color .3s, min-height .3s`; alto 92 px |
| Nav | Manrope 18 px, peso 500, blanco, opacidad 1, relleno lateral 20 px, caja de 46 px de alto |
| Hero | `min-height` = 100 vh (932 px a ese viewport) |
| H1 | 63 px, peso 800, interlineado 75,6 px, tracking −1 px, borde izquierdo a 46 px, `text-align: start` |
| Entrada | Titular `fadeInLeft` 1,25 s `ease` sin retardo; párrafo `fadeInLeft` con retardo 150 ms; botón `fadeIn` con retardo 200 ms. Keyframes: `0% {opacity:0; transform:translate3d(-100%,0,0)}` → `100% {opacity:1; transform:none}` |

## 3. Nuestras medidas (web desplegada en `8f80dbe`, 13/10/2026)

- Cabecera sólida translúcida de 64 px; nav a 12,8 px (paso −1 de la escala), peso 500.
- **Ajuste del nav en una fila** (ocho enlaces + marca de 256,84 px, relleno lateral
  de 8 px, hueco de 4 px entre enlaces), holgura a 1024 px: **16 px → 78 px**,
  17 px → 52 px, **18 px → 24 px**, 19–20 px → la marca se comprime y el descriptor
  se trunca. A 16 px «Blog» y «FAQ» dejan de estirarse hasta 48 px (sobrante 0,1 y
  1,8 px): el ritmo del nav queda uniforme (absorbe la feature 46).
- **Contraste del texto blanco sobre la foto real** (`clinica.webp`), peor píxel bajo
  cada caja de texto: velo actual ≥ 9:1; velo uniforme 0,60 → 5,62:1 (H1) y 6,02:1
  (párrafo); **velo horizontal B (el elegido) → 5,27:1 (H1) y 6,06:1 (párrafo)**. Mi
  primera versión de B daba 4,22:1 en el párrafo y NO cumplía el mínimo de 4,5:1;
  por eso B quedó con 0,80 / 0,68 / 0,30 / 0,22 en 0 / 45 / 75 / 100 % de la anchura.
- Franja de cabecera (0–64 px) con el velo vertical: ≥ 5,25:1 incluso a opacidad 0,30.
- **Menú y marca sobre el velo B** (medido el 13/10/2026 sobre la foto real, peor píxel; menú = los 626 px de la derecha de la columna de 1220, marca = sus 257 px de la izquierda; texto `sobre-primario` de cada paleta):

  | Medida | clinica | calida | eco | marca | tech |
  | --- | --- | --- | --- | --- | --- |
  | Menú, 1440×900, solo velo horizontal | 6,43 | 5,91 | 6,01 | 5,98 | **4,86** |
  | Menú, 1024×768, solo velo horizontal | 6,15 | 5,66 | 5,76 | 5,73 | **4,89** |
  | Menú, 1440×900, CON franja superior | 10,25 | 8,61 | 8,91 | 8,66 | 8,58 |
  | Menú, 1024×768, CON franja superior | 9,77 | 8,23 | 8,53 | 8,29 | 8,45 |
  | Marca + descriptor, 1440, solo horizontal / con franja | 12,21 / 14,30 | 9,92 / 11,41 | 10,37 / 11,98 | 9,83 / 11,09 | 11,31 / 12,87 |

  Mínimo exigido 4,5:1 (texto normal). El menú pasa en las cinco paletas incluso sin la franja, pero `tech` con solo 0,36 de margen; con la franja el margen es de 3,7 puntos. Por eso la franja es OBLIGATORIA. NO medido: 375 px (ahí no hay menú de escritorio) ni el renderizado real con antialiasing; eso lo miden las puertas de píxeles reales del contrato.

## 4. Decisiones de Pablo (13/10/2026, respuestas a la ronda de preguntas)

| # | Pregunta | Respuesta |
| --- | --- | --- |
| P1 | ¿Reabrir la política de «cero animaciones» del 20/09 para la entrada del hero? | **Sí, 0,7 s escalonada**: titular, párrafo (+120 ms) y botón (+240 ms), recorrido de 40 px, se amplía la escala de movimiento con un paso de 0,7 s, sin animación si el sistema pide reducir movimiento |
| P2 | Cabecera al bajar del hero y en el resto de páginas | **Oscura sólida**: color de tinta de la paleta y texto `sobre-primario`; un solo juego de colores en todos los estados |
| P3 | Tamaño de letra de los enlaces del menú | **16 px** (paso 0 de la escala, no una excepción) |
| P4 | Velo sobre la foto | **B · degradado horizontal** (oscuro bajo el texto, claro a la derecha). *Inferencia del craftsman_lead, vetable por Pablo:* la maqueta que él vio y eligió llevaba además una **franja superior de refuerzo** (alfa 0,55 en el borde superior, bajando linealmente a 0 al 22 % de la altura) y mi primera versión de este documento la omitió por error. La franja es **OBLIGATORIA** (da margen en la paleta `tech`, ver §3) |
| P5 | Altura del hero (planteada tras el panel de revisión, que midió que hoy mide 837 px y no 756) | **Pantalla completa**: la sección de bienvenida mide al menos 100svh en todos los anchos (exactamente 100svh cuando el contenido cabe; tras la feature 49 la cabecera la solapa). A 1440×900 es como se ve hoy la primera pantalla (a 1024×768 y 375×812 el hero se acorta unos 57 y 63 px) y es como la referencia. La foto deja de ser el candidato a LCP: se vigila el TIEMPO de LCP |

La política de «cero animaciones» (`accesibilidad.feature` @s20, `retirada_carteleria_urgencias.feature` F2)
exige puerta humana para reintroducir una animación de entrada: **esta aprobación
de Pablo ES esa puerta**, y el contrato que la recoja la cita.

## 5. Delegado por Pablo al craftsman («te dejo innovar») y decisión tomada

- **Dirección:** de izquierda a derecha (coherente con el texto alineado a la izquierda y con la referencia).
- **Recorrido:** 40 px, no el 100 % de la referencia (un desplazamiento del ancho entero de un H1 de 720 px cuenta como movimiento vestibular y no es «relativamente corto»).
- **Curva:** `ease-out`, la única que admite la escala del sistema (`escalaMovimiento.ts`). La maqueta usó una curva más marcada; no se adopta para no abrir una segunda excepción.
- **Propiedades:** solo `opacity` y `transform` (compositor; sin layout shift; sin `will-change` permanente).
- **Escalonado:** 0 / 120 / 240 ms.

## 6. Valores por defecto aplicados SALVO veto de Pablo

1. **Contenido:** se conserva el párrafo actual y el botón «Reservar cita»; el H1 no cambia.
2. **Alineación:** el texto del hero arranca en el borde izquierdo de la columna de 1220 px, alineado con la marca (como ya exige `fidelidad_cabecera` @s1 para las demás secciones).
3. **Altura (ACTUALIZADO el 13/10/2026 con P5):** **pantalla completa**. La sección de bienvenida (foto y velo; tras la feature 49, con la cabecera encima) mide **al menos el alto de la ventana (`min-height: 100svh`) y exactamente ese alto cuando el contenido cabe**, en todos los anchos (decisión del craftsman_lead tras la revisión: con `height: 100svh` un móvil en horizontal recortaría el contenido; a 812×300 el contenido más la cabecera no cabe); desaparece la regla `@media (max-width: 560px) { min-height: 0 }` y el `clamp(560px, 84svh, 784px)` deja de ser la altura del hero. *Corrección de un dato mío:* este punto decía «se mantiene la del hero actual, 756 px». Era falso: **hoy el hero mide 837 px a 1440×900** (el `min-height` computado es 756 pero el contenido que se retira lo empuja; cabecera 64 + hero 836 = 900, o sea que hoy la primera pantalla ya es toda hero), 825 px a 1024×768 y 875 px a 375×812. Con la foto cubriendo el viewport entero la spec de LCP (§4.3 paso 7) la descarta como candidata: el LCP pasa al titular o al párrafo y el contrato vigila el TIEMPO de LCP (mediana de 5 cargas ≤ 2500 ms, umbral «bueno» oficial de campo), no el elemento. Línea base en `progress/lcp_hero_linea_base_20261013.md`.
4. **Cabecera sobre la foto:** sin `backdrop-filter` en NINGÚN estado (decisión del craftsman_lead tras la revisión independiente: la sólida es opaca ≥ 0,94 y no necesita desenfoque, y así el panel móvil, descendiente `position: fixed` de la cabecera, nunca cambia de bloque contenedor al alternar el estado).
5. **Estado de la cabecera:** transparente SOLO en `/` y mientras el hero siga bajo ella; sólida (tinta) desde el primer pintado en las demás rutas y al salir del hero. Altura constante de 64 px en ambos estados (CLS 0). Cambio de estado por `IntersectionObserver` (nunca por listener de scroll); la lógica de decisión en `Cabecera-logica.ts` (módulo puro, mutación al 100 %); el estado en un atributo `data-`/`aria-`, no en una clase.
6. **Hueco:** `#root` conserva `padding-block-start` para las subpáginas; la portada solapa con margen negativo (menor superficie de contrato rota). `scroll-padding-top` y `--desplazamiento-al-enfocar` no se tocan.
7. **Tienda** pasa al mismo tamaño que el resto de enlaces; su texto sigue la regla común (token `sobre-primario`), no `--color-tinta`.
8. **Colores:** nada de «blanco» literal (la paleta `tech` tiene velo claro y texto oscuro; `puertaLiteralesColor` lo prohíbe): se usa `--color-sobre-primario` y `color-mix`. Sin tokens nuevos (inventario CERRADO, nota (b) de @s7 en `fidelidad_cabecera.feature`).
9. **Enlace actual (`aria-current`)** y **hover:** se distinguen por subrayado y peso, no solo por color (el color primario no contrasta sobre la cabecera oscura).
10. **Foco:** anillo con el mismo recurso que ya usa el hero (`outline-color: var(--color-sobre-primario)`), medido sobre la foto real.
11. **Panel móvil:** sigue exactamente como está (G2 de la feature 39); el botón del menú conserva su fondo propio.
12. **Logo:** el actual (raster 201×201 con fondo blanco, sin versión clara). **Pablo respondió el 13/10/2026 que es TEMPORAL, que no hay que preocuparse por él y que se retoque lo que haga falta (opacidad, fondo, recorte) para que encaje sobre la foto.** Por defecto, recortado en círculo; no bloquea ninguna feature. El logo definitivo sigue pendiente desde el min. 09:44 de la reunión con Roberto.
13. **Lo que sale del hero** (píldora de ubicación, botón «Llamar», franja de horario, banda de cifras) sigue vivo en Contacto, el chat de reserva, el FAQ y el pie; no se pierde ningún dato.

## 7. Reparto en dos features (una sola `in_progress` a la vez, en este orden)

**Feature 48 `hero_reducido_con_animacion`** — retirada pura + animación.
- Retira del hero: píldora de ubicación, botón «Llamar», franja de horario, banda de cifras; texto a la izquierda.
- Supera: `hero.feature` @s1 (cláusula de la ubicación), @s4, @s5, @s6, @s9, @s10, @s11, @s13 (cláusula `tel:`); `fidelidad_hero.feature` @s1, @s2 (cifras), @s3 (píldora y banda); `rediseno_visual.feature` @s18 (reescrito: solo el FAQ es estrecho a propósito), @s30, @s51, @s33 (en lo del hero) y @s29 revisado sin cambio por la 48; `identidad_visual.feature` @s23 (la prueba de tipografía pasa a medir un párrafo que no es del hero).
- Código muerto: `Hero-logica.ts` y su test, props `telefono`/`horario`, `FranjaHorario`, imports huérfanos, estilos `.ubicacion`, `.puntoUbicacion`, `a:not(:first-child)`, `dl`, `.cifras` y sus `@media`; `digitosDe` y `extraerFragmento` sin consumidor. `tsc -b` incluye los tests y `noUnusedLocals` está activo: retirar y reescribir en el mismo paso.
- Animación (bloque separable): supera `accesibilidad.feature` @s20 y @s22, revisa @s19 y @s21; enmienda `identidad_visual.feature` @s16 (escala) y la nota F2 de la 39. **Endurece dos agujeros de la puerta de escala** (`escalaMovimiento.ts` solo lee `ms`, así que `1.25s` pasa sin ser detectado; `animation-delay` suelto se ignora). La heurística de `accesibilidad-movimiento.ts` marca como «invisible sin animación» un `@keyframes { from { opacity: 0 } }` legítimo: hay que enseñarle a distinguir el estado base del estado de partida de la animación. Bajo `reduce`, ni keyframes ni retardos fuera de `@media (prefers-reduced-motion: no-preference)`. *Corrección del panel de revisión (medida en Chromium):* el anulador global de `reduce` (`global.scss`) tiene especificidad 0 y pierde ante cualquier regla con selector propio que declare `animation`: NO es una red de seguridad; por eso fotogramas, `animation`, `animation-name` y retardos viven SOLO dentro de `no-preference`. (Mi frase anterior decía solo que no anula `animation-delay`; es cierto pero no era lo importante.)
- Absorbe la feature 47 (un solo botón: sin sujeto).

**Feature 49 `cabecera_sobre_el_hero`** — shell, matriz, nav y velo.
- Supera: `fidelidad_cabecera` @s4 (cláusula «el primer contenido arranca justo en el borde inferior»), @s6 (color del texto de Tienda), @s7 (contraste del borde contra `--color-fondo`); revisa @s1, @s2, @s6 (tamaño de letra), G1 y criterio 5 de la 39; `rediseno_visual` @s28 y @s26; `cabecera_y_navegacion` @s1 (1024); `fidelidad_responsive_integral` @s4 y @s6; `sistema_de_diseno_visual` @s14/@s25–@s27.
- **Reescribe las puertas ciegas:** las funciones `fondoSinFoco` y `colorPintadoEnPunto` de `accesibilidad.spec.ts` suben por los ancestros hasta el primer fondo no transparente: con la cabecera transparente llegan a `body` y miden contra el fondo de la página, no contra la foto → **verde por vacuidad**. La nueva medición se hace sobre píxeles reales renderizados (peor píxel bajo cada texto, criterio F83 del W3C) y tiene que poder ponerse roja.
- Matriz de contraste: par `sobre-primario` sobre `tinta` con uso `texto normal` (choca con la fila existente de foco: se decide entre cambiar su uso, manteniendo 23/115, o añadir fila, 24/120; los dos cambian cuatro asserts de `matrizDeContraste.test.ts` y cualquier cambio de recuento fue puerta humana antes).
- Nav a 16 px; punto de corte único 1024 sin `@media` nuevos (`puntoDeCorte.test.ts`). Recoge y cierra la feature 46.

## 8. Riesgos conocidos que el Gherkin debe cubrir

- La cabecera es shell común de **6 rutas** y solo `/` tiene foto: estado por ruta.
- Primer render con `ancho = 0` cae a la rama móvil (hamburguesa) antes de pasar a nav de escritorio: no puede parpadear sobre la foto.
- Los e2e que miden la portada recién cargada sin emular `reduce` (`fidelidad-responsive-integral.spec.ts` @s6, axe @s36, `fidelidad-hero.spec.ts`) corren contra una animación en curso: carrera temporal. Hay que decidir y escribir cómo se miden (esperar a `animationend`, o emular `reduce` en su `Given`).
- `tests/e2e/tipografia.spec.ts:100-129` usa `page.locator('p').first()`, que hoy es la píldora y pasaría a ser el párrafo.
- `Hero.test.tsx:287-294` fija `min-height: clamp(560px, 84svh, 784px)`; `Hero.test.tsx:248-285` mide el contraste contra la parada del 76 %, que deja de ser la más clara con un velo horizontal.
- Presupuesto de CSS: 12 000 B codificados (`css-presupuesto.spec.ts`); margen estimado ≈ 2,2 KB.
- Medir LCP real antes y después (`PerformanceObserver`) y CLS ≤ 0,1 en las seis rutas.
- Safari y `overflow: clip`: sin confirmar; el hero ya recorta con `overflow: hidden`, se mantiene.

## 9. Puertas humanas (resumen)

| Puerta | Estado |
| --- | --- |
| Reintroducir animación de entrada y ampliar la escala de movimiento | **Aprobada por Pablo** el 13/10/2026 (P1) |
| Cabecera sólida oscura, nav 16 px, velo B | **Aprobadas** (P2–P4); la franja superior del velo es inferencia del craftsman_lead (obligatoria, vetable) |
| Altura del hero a pantalla completa | **Decidida por Pablo** (P5, 13/10/2026) |
| Retirar píldora, «Llamar», horario y cifras del hero | **Pedido explícito** de Pablo (punto 3) |
| Firma de los `.feature` 48 y 49 (enmiendan contratos aprobados) | **PENDIENTE** — no se escribe código sin ella |
| Logo | **RESUELTO** (13/10/2026): el actual es temporal y se puede retocar; el definitivo no bloquea nada |
| Veto de los valores por defecto del apartado 6 | Abierto hasta la firma |

## 10. Decisiones del craftsman_lead tras las revisiones independientes (13/10/2026)

Tres rondas de revisión de la 48 y una de la 49 (cada una con revisores que midieron
en Chromium sobre el `dist/` real y páginas sintéticas) cambiaron o precisaron el
contrato. Todo lo de esta sección es un **valor por defecto vetable por Pablo** salvo
que se diga lo contrario; las dudas que de verdad le tocan están en los resúmenes
`gherkin_48_resumen.md` y `gherkin_49_resumen.md`.

| # | Decisión | Por qué |
| --- | --- | --- |
| D1 | El borde de «Tienda» pasa a ser del color del texto (como en la maqueta); se RETIRA la suavidad F3 del 20/09 para la cabecera sobre foto y sólida oscura | Medido: la mezcla 88/12 da 2,1-2,5:1 sobre la foto en 4 paletas y 1,12 en `tech`; un borde ≥ 3:1 contra el fondo y un texto ≥ 4,5:1 contra el mismo píxel no pueden coexistir si se mide la caja entera del enlace |
| D2 | El contraste del texto se mide sobre la caja del NODO DE TEXTO (`Range.getBoundingClientRect()`), no sobre la caja del enlace | Misma razón: la caja del enlace incluye el borde de la píldora |
| D3 | El cambio de estado de la cabecera es instantáneo: sin fundido y sin sombra | Simplifica las puertas (sin fotogramas intermedios) y evita contradecir «sólida desde el primer fotograma tras navegar». La maqueta llevaba un fundido de 0,3 s y una sombra bajo la sólida; no se adoptan |
| D4 | El estado de la cabecera vive en un atributo `data-*`; se propone enmendar el Invariante 5 de `project-spec.md` («ARIA») para permitir `data-*` en estados puramente visuales | Un `aria-*` inventado viola axe (`aria-valid-attr`, probado) y `accesibilidad` @s36 lo pondría en rojo |
| D5 | En pantallas estrechas (`@media (max-width: 1023px)`, la complementaria del único corte de 1024) el velo de la foto puede ser más oscuro, lo mínimo para cumplir 4,5:1 (párrafo) y 3:1 (titular) a 375 y 1024 | Medido: el velo B solo está calibrado a 1440; a 375 el párrafo da 2,9-4,1:1 según la paleta. En móvil la foto se verá algo más oscura |
| D6 | Los enlaces con ancla (`/#contacto`) NO llevan hoy a la sección al cargar (scrollY = 0 durante 3 s, medido): defecto previo del sitio, registrado como feature 50. El estado de la cabecera en el primer fotograma depende solo del scroll de ese fotograma | La premisa de «cubrir la carga con ancla» era falsa |
| D7 | La sección de bienvenida mide AL MENOS el alto de la ventana (`min-height: 100svh`) y exactamente ese alto cuando el contenido cabe | Con `height: 100svh` un móvil en horizontal recortaría el contenido (812×300) |
| D8 | La animación de entrada usa `animation-fill-mode: backwards` | Con `both`/`forwards` el titular nunca llega a ser candidato de LCP y la métrica sale artificialmente buena (medido: ~120 ms frente a ~840-930 ms) |
| D9 | LCP esperado con la 48 + la 49: titular ~770-850 ms en escritorio y párrafo ~860-930 ms en móvil, unas 6,5 veces la línea base LOCAL (132 ms) o 3 veces la desplegada (264 ms), sin mezclar entornos | Corrige mi cifra anterior («3 veces»), que cruzaba entornos |
| D10 | El suelo numérico de holgura del nav a 1024 pasa a ≥ 92 px (entorno de las puertas: Playwright, barra superpuesta) y la cláusula principal es «descriptor entero y marca sin comprimir» | Los 78 px se midieron con barra clásica de 15 px; en el entorno que ejecuta la puerta son 93,17 px |
