# Hallazgos CONFIRMADOS tras verificación independiente

Total: 86 confirmados (de 132 alegados, 5 fusionados por duplicado → 127 veredictos únicos; 42 refutados y descartados).

| Severidad | Confirmados |
| --- | --- |
| Bloqueante | 18 |
| Grave | 61 |
| Menor | 7 |

## BLOQUEANTE (18)

### features/hero.feature @s13

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La guardia anti-terceros solo inspecciona atributos src/srcset y no cubriría una imagen de fondo servida por CSS.
- **Motivo del veredicto (verificador independiente):** El Then de @s13 (línea 155) solo mira atributos DOM src/srcset. La propia cabecera del fichero (líneas 43-48) asigna a @s13 la responsabilidad de vetar el origen de tercero de la futura imagen de fondo pendiente. Confirmé en vite.config.ts línea 49 que test.css:false está activo, así que si esa imagen llega vía background-image en una hoja de estilos, ni el Then actual ni una variante sobre atributo style la detectarían: la CSS ni se evalúa en el test.

### features/informacion_contacto.feature @s9 (línea 165)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** La cláusula sobre tipografía/hoja de estilo con origen ajeno no puede fallar nunca en este stack de test.
- **Motivo del veredicto (verificador independiente):** vite.config.ts línea 49 fija css:false ('Vitest no procesa CSS por defecto: los CSS Modules devuelven un proxy'), así que ningún @font-face ni url() de una hoja SCSS real llega jamás al DOM de jsdom durante el test. La mitad 'tipografía, hoja de estilo' de la línea 165 es estructuralmente inmune a cualquier implementación; ninguna otra .feature del repo cubre origen de fuentes y la cabecera de este fichero no anota esta cláusula como verificación manual/build-time.

### features/informacion_contacto.feature @s10 (líneas 172-173)

- **Lente(s) que lo alegaron:** L1,L3
- **Resumen:** La cláusula sobre no solicitar el mapa fuera de la ventana visible es vacuamente cierta en jsdom, se implemente bien o mal la carga diferida.
- **Motivo del veredicto (verificador independiente):** vite.config.ts líneas 38-41: environmentOptions.jsdom solo fija {url:...}, sin resources:'usable', así que jsdom nunca dispara una petición real por el src del iframe. src/test/setup.ts líneas 52-67: ObservadorInerte sustituye a IntersectionObserver con observe(): void {} que no hace nada, así que ningún test puede simular la entrada/salida del viewport. La línea 173 es cierta en cualquier build dentro de este stack; la línea 172 (loading='lazy') sí es mordible y no se objeta.

### features/pagina_tienda.feature @s14 (+ Background, @s3, @s12, @s19-@s34)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** El Background y @s14 fijan ~60 importes en euros para un catálogo de demo, violando Decisión 1(b) ('sin precios ni credenciales fabricados').
- **Motivo del veredicto (verificador independiente):** project-spec.md:82 dice literalmente 'se construye como demo rotulada como tal, sin precios ni credenciales fabricados'; el Background (líneas 147-156) y @s14 (líneas 287-298) fijan importes concretos en euros. Rotular el campo como 'importe' en vez de 'precio' no cambia que sea una cifra monetaria fabricada para un negocio real. docs/datos-galapavet.md:127 confirma que precios y productos están pendientes del cliente.

### features/pagina_tienda.feature @s5

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Las tres aserciones de @s5 sobre las imágenes son negativas y nunca fijan un recuento no nulo, así que un conjunto vacío las pasa todas.
- **Motivo del veredicto (verificador independiente):** Releí @s5 (líneas 196-201): 'ningún origen contiene http:// ni https://', 'ningún origen contiene pexels', 'cada imagen... tiene texto alternativo vacío'. Busqué en todo el fichero cualquier aserción positiva de cantidad de imágenes y no existe ninguna (grep -i 'imagen' solo devuelve estas tres líneas y comentarios). Un mutante que vacíe la construcción de imágenes sobrevive siempre.

### features/galeria.feature @s9, @s10

- **Lente(s) que lo alegaron:** L1
- **Resumen:** Then sobre scrollLeft físico es verde por vacuidad en jsdom
- **Motivo del veredicto (verificador independiente):** galeria.feature:141 y :151 aseveran sobre scrollLeft físico; jsdom no ejecuta scrollBy/scroll real, y @s7 (l.109) exige desplazamiento 'suavizado', apuntando a scrollBy({behavior:'smooth'}), que en jsdom no mueve scrollLeft exista o no guarda correcta. El propio fichero demuestra la vía correcta en :150 ('no se solicita ningún desplazamiento a la pista'), que @s9 no adopta.

### features/galeria.feature @s14

- **Lente(s) que lo alegaron:** L1
- **Resumen:** Cuarta línea del Then usa un criterio no determinista, rompe el patrón de literalidad del propio escenario
- **Motivo del veredicto (verificador independiente):** galeria.feature:185 rompe el patrón de listas negras literales de :182-184 sin dar tabla de clasificación pie→bloque, no es mecánicamente decidible. El encuadre de 'contradicción con la cabecera' de L1 es discutible (líneas 20-21 son ejemplo del prototipo heredado, no mandato, y :55-56 confirma que el catálogo de demo se declara en implementación), pero el defecto de fondo se sostiene.

### features/galeria.feature CABECERA / @s1-@s4, @s11-@s14

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Ningún escenario ejercita el catálogo real de producción, todos inyectan doble
- **Motivo del veredicto (verificador independiente):** Verificado línea a línea: @s1(:71), @s2(:80), @s3(:88), @s4(:97), @s11(:155), @s12(:164), @s13(:172), @s14(:180) usan todos 'un catálogo de galería con al menos una entrada', nunca el catálogo real/por defecto. Matizo el encuadre estricto de 'mutante inmortal' Stryker: stryker.config.json limita mutate a src/lib/**/*.ts y *-logica.ts, así que si el catálogo vive en src/data/galeria.ts, Stryker no lo mutaría de todos modos bajo la config actual. Pero el defecto de fondo -ninguna protección de regresión del catálogo de producción- es real.

### features/pagina_blog.feature @s22

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El tope de 3 en «Sigue leyendo» nunca se ejercita: la categoría más poblada del Background solo tiene 3 artículos.
- **Motivo del veredicto (verificador independiente):** Background L159-166: Medicina general=3, Análisis=2, Especialidades=1. Para demo-1 quedan como máximo 2 candidatos tras excluir el actual (@s22 L393). Ningún mutante que suba el tope de 3 a 4/5/infinito cambia la salida esperada, bajo thresholds.break:100 confirmado en stryker.config.json.

### features/pagina_blog.feature @s27

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La puerta anti-primera-persona (7 negaciones) no tiene ningún control positivo de que el texto recorrido no esté vacío.
- **Motivo del veredicto (verificador independiente):** L445-453: siete negaciones puras sobre 'el texto completo del listado y de los seis artículos publicados'. Ningún otro escenario ejercita ese MISMO recorrido agregado sobre las 6 páginas de artículo a la vez (@s14/@s16 solo verifican un artículo cargado en su ruta propia); si el recorrido devuelve vacío, los siete Then pasan sin haber mirado nada.

### features/pagina_blog.feature Background (y @s13)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El contrato no dice si la tabla del Background es la constante de producción o un doble, y @s13 inyecta su propio catálogo vacío.
- **Motivo del veredicto (verificador independiente):** L159 'escrito a mano' vs @s13 L299 'no declara ningún artículo' solo tiene sentido si el catálogo es inyectable. accesibilidad.feature @s1 L140 ya cierra este mismo agujero con 'el literal... no se obtiene del inventario que comprueba'; pagina_blog.feature no tiene cláusula equivalente en ningún escenario.

### features/accesibilidad.feature @s2

- **Lente(s) que lo alegaron:** L1
- **Resumen:** "0 violaciones de axe" es imposible/ambiguo bajo jsdom sin layout cuando @s7 arrastra la regla target-size (WCAG 2.2 AA)
- **Motivo del veredicto (verificador independiente):** @s7 obliga a incluir el nivel "WCAG 2.2 AA" en el runOnly, lo que arrastra la regla target-size de axe-core (2.5.8), evaluable solo con getBoundingClientRect real. vite.config.ts fija environment:'jsdom' sin motor de layout y css:false; package.json no trae Playwright/jest-axe. Ni @s2 ni la cabecera aclaran cómo se resuelve esto.

### features/accesibilidad.feature @s17

- **Lente(s) que lo alegaron:** L1
- **Resumen:** Depende de geometría real (bounding rects de cabecera fija, scroll, control) inexistente en jsdom
- **Motivo del veredicto (verificador independiente):** "el control enfocado no queda enteramente tapado" y "al menos parte... dentro del área visible" (L286-287) solo son evaluables con getBoundingClientRect real; jsdom no calcula layout. Ningún Given reduce esto a lógica pura, a diferencia del patrón de literal anclado que el propio fichero usa en @s9/@s18.

### features/accesibilidad.feature @s18 (geometría/contraste de píxeles)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** Exige área y contraste de píxeles efectivamente renderizados en dos estados, imposible sin motor de render
- **Motivo del veredicto (verificador independiente):** L294-295 exigen píxeles renderizados en estado con/sin foco; jsdom no rasteriza nada. La cabecera (L116-118) solo aclara que el VALOR del indicador no está decidido, no cómo se MIDE sin render real.

### features/accesibilidad.feature @s19

- **Lente(s) que lo alegaron:** L1
- **Resumen:** "Animación en curso" exige un motor de animación CSS que jsdom+css:false no tiene
- **Motivo del veredicto (verificador independiente):** vite.config.ts fija css:false (ningún @keyframes se aplica nunca) y environment:'jsdom' sin polyfill de animación en package.json. Ningún Given de @s19 traduce el requisito a estado consultable, contra la propia regla de la cabecera (L98-101).

### features/accesibilidad.feature @s30 (guarda de conteo)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Único de los tres inventarios de contraste sin cláusula de recuento > 0
- **Motivo del veredicto (verificador independiente):** @s29 (L400) y @s31 (L417) llevan recuento > 0; @s30 (L403-409), con el mismo patrón de universal sobre inventario, no lleva ninguno. Incumple la regla que la propia cabecera se autoimpone (L79-80): "la guarda va POR CADA EXTRACTOR INDEPENDIENTE".

### features/accesibilidad.feature @s32

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Ningún escenario prueba el lado de aprobación exacta de los umbrales de contraste/tamaño de texto grande
- **Motivo del veredicto (verificador independiente):** En las 434 líneas no hay ratio==4.5, ratio==3, texto==24px ni ==18.66px negrita aprobando; @s32 solo prueba 4.49 (falla). El único par que sí cubre ambos lados de frontera exacta es @s11(23)/@s12(24) de área táctil, dejando ratio>=X -> ratio>X como mutante EqualityOperator superviviente contra break:100.

### features/accesibilidad.feature CABECERA (lógica fuera de la superficie mutable)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Ningún escenario exige que la lógica de la puerta viva en src/lib/**/*.ts o *-logica.ts
- **Motivo del veredicto (verificador independiente):** Verificado por ausencia: ninguna de las 33 escenarios ni la cabecera contiene "módulo puro", "-logica.ts" ni "src/lib". stryker.config.json confirma mutate limitado a esos globs; si la lógica vive en .tsx o .test.ts, StrykerJS no genera mutantes y la puerta cierra al 100% sobre superficie vacía.

## GRAVE (61)

### features/hero.feature @s12

- **Lente(s) que lo alegaron:** L1
- **Resumen:** El Given activa preferencia de movimiento reducido pero el Then no verifica ningún comportamiento distintivo de esa preferencia.
- **Motivo del veredicto (verificador independiente):** El Given (línea 146) fija la preferencia de movimiento reducido, pero el Then (líneas 148-150) repite exactamente las mismas aserciones de contenido base que ya cubren @s1/@s4-@s5/@s6 sin ese Given: encabezado, 2 enlaces, 3 entradas de horario. Ningún Then de todo el fichero (@s1-@s13) liga una rama de comportamiento a prefers-reduced-motion, así que una implementación que ignore por completo la preferencia pasaría @s12 igual.

### features/equipo.feature @s10 (equipo.feature:134-139)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** La linea 138 niega el literal "Nuestro equipo" que ningun escenario positivo del fichero establece como el rotulo real de la seccion.
- **Motivo del veredicto (verificador independiente):** Busque "Nuestro equipo" en todo equipo.feature: solo aparece en esta negacion (linea 138); tampoco aparece en el contrato heredado (docs/contrato-heredado/equipo.feature, Background: "la seccion 'Equipo'", sin "Nuestro"). Contrastando con el resto del grupo G3, el patron consistente es fijar el literal en positivo antes de negarlo: servicios.feature:90 fija 'Servicios' antes de negarlo en :238; campanas_portada.feature:87 fija 'Campanas de prevencion' antes de negarlo en :191/:205; pagina_campanas.feature:263 fija 'Que publica la clinica' antes de negarlo en :413/:504. equipo.feature rompe ese patron: si la seccion se rotula 'Equipo' a secas (como el resto de secciones, sin prefijo 'Nuestro'), la linea 138 pasa trivialmente aunque la seccion se haya renderizado entera.

### features/equipo.feature @s1 (equipo.feature:69-70) + @s7 (equipo.feature:116)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** "Tarjeta" se usa como unidad de scoping en varios steps pero nunca se define en equipo.feature con rol o nombre accesible propio localizable.
- **Motivo del veredicto (verificador independiente):** Rastree todas las apariciones de 'tarjeta' en equipo.feature: se da por supuesta en Given/Then (lineas 90, 97, 104, 116) pero ningun Then la contrata como contenedor con rol/nombre accesible. El fichero hermano servicios.feature si resuelve esta ambiguedad por escrito en su cabecera (linea 61: 'toda asercion se acota a la tarjeta'); equipo.feature no tiene declaracion equivalente. Sin esa fijacion, 'junto a Marcos Perez se muestra el texto Veterinario' (linea 69) es satisfacible con un getByText global que no comprobaria el emparejamiento correcto rol-persona si los dos roles ('Veterinario'/'Auxiliar') se intercambiaran entre las dos unicas tarjetas del fichero.

### features/equipo.feature @s9 (equipo.feature:126-132)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** El Then de @s9 solo cuenta encabezados h3, no verifica ausencia de marcado huerfano, pese a que el titulo del escenario promete que el profesional sin nombre 'no arrastra al resto'.
- **Motivo del veredicto (verificador independiente):** Verifique el texto exacto: el titulo (linea 127) dice 'no arrastra al resto', pero el unico Then de contenido (linea 130, 'la seccion contiene exactamente 2 encabezados de nivel 3') mas las lineas 131-132 (nombres accesibles de los dos h3) no dicen nada sobre residuos de marcado -boton huerfano, contenedor vacio- para el tercer profesional de nombre vacio. Una implementacion que deje una tarjeta huerfana sin encabezado para ese tercer profesional sigue produciendo exactamente 2 h3 con los nombres correctos, pasando el escenario pese a ser el modo de fallo que el propio titulo dice cubrir.

### features/pie_de_pagina.feature @s1

- **Lente(s) que lo alegaron:** L1
- **Resumen:** 'ninguna otra cifra de antigüedad, volumen o reputación' es una categoría abierta sin literales enumerados, contra el patrón de anclaje literal que el resto del fichero sí sigue.
- **Motivo del veredicto (verificador independiente):** Línea 90: 'And en todo el pie no aparece "desde 2013", ni "2013", ni ninguna otra cifra de antigüedad, volumen o reputación' es la única aserción negativa del fichero sin literales cerrados; compárese con @s6 (línea 132), @s7 (línea 140) y @s8 (línea 148), todas ancladas a literales o símbolos concretos. El propio encabezado (línea 14) exige el patrón 'doble-de-test-anclado-al-literal-no-al-simbolo', que esta cláusula incumple.

### features/pie_de_pagina.feature @s11

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El Then solo cuenta 'exactamente 2 enlaces' sin fijar identidad (nombres/destinos) de cuáles dos páginas legales sobreviven cuando falta la tercera.
- **Motivo del veredicto (verificador independiente):** Líneas 172-176: el Given no dice cuál de las tres páginas falta y el Then solo verifica conteo=2 más negativos genéricos (ni '#', ni vacío, ni 'PENDIENTE', ni el rótulo obsoleto 'Privacidad'). @s9 (líneas 155-159) sí ancla identidad completa pero solo para el caso de las 3 páginas presentes. Un mutante que invierta la lógica de selección de qué página se omite en el caso de 2 deja el conteo en 2 y ningún Then de @s11 lo detecta.

### features/faq.feature @s12 (faq.feature:171-175)

- **Lente(s) que lo alegaron:** L1,L3
- **Resumen:** Fixture de 3 entradas sin nombrar, Then ciego a mutación y caso 'pregunta vacía' del título sin cubrir
- **Motivo del veredicto (verificador independiente):** faq.feature:172 no nombra ninguna de las 3 entradas y faq.feature:175 da por hecho un nombre ('la entrada con respuesta vacía') que el escenario nunca declaró, obligando a inventar el fixture. El Then (174-175) solo fija recuento (2) y una negación, sin nombres accesibles positivos de las 2 supervivientes, por lo que un mutante con 2 controles mal nombrados pasaría. Además el título (faq.feature:171 'pregunta o respuesta vacía') promete dos casos pero el Given solo monta el de respuesta vacía.

### features/tokens_marca.feature @s18

- **Lente(s) que lo alegaron:** L1
- **Resumen:** El Given escanea todos los ficheros SCSS reales del proyecto, pero tokens_marca es la feature id:1, la primera del pipeline, y src/ está vacío (solo .gitkeep): el conteo será 0 por construcción cuando se implemente de forma autónoma.
- **Motivo del veredicto (verificador independiente):** Given todos los ficheros SCSS del proyecto salvo el fichero de tokens de marca (línea 224) frente a feature_list.json líneas 22-23 (id:1, la primera feature) y a que src/ solo contiene .gitkeep: el Then 'el número de ficheros inspeccionados... es mayor que 0' (línea 227) fallará por ausencia de consumidores, no por un defecto de la puerta.

### features/tokens_marca.feature CABECERA / @s8 / @s16

- **Lente(s) que lo alegaron:** L2
- **Resumen:** La cabecera trata como PENDIENTE de decidir una pareja de color que la fuente única ya cerró explícitamente con 'No se usa', y @s16 no excluye esa pareja del catálogo.
- **Motivo del veredicto (verificador independiente):** Cabecera líneas 61-63: 'PENDIENTE:... Confirmar con diseño si se quiere usar o si se prefiere holgura' contra docs/datos-galapavet.md:175 'El par verde sobre lima pasa el 3:1 por una centésima. No se usa'. @s16 (líneas 200-208) no añade cláusula que excluya esa pareja del catálogo declarado. @s8 en sí mismo no es incorrecto (mide la función de aptitud, no una decisión de uso).

### features/tokens_marca.feature @s8

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Falta un escenario de frontera exacta a 3.0 para 'texto grande', a diferencia de 'texto normal' (@s9/@s10) y 'componente' (@s11).
- **Motivo del veredicto (verificador independiente):** @s9 fija 4.5 y @s10 fija 4.49 para texto normal (líneas 147,153); @s11 fija 3.0 para componente (línea 159); pero texto grande solo se prueba en 3.01 (@s8, línea 141), nunca exactamente en su umbral de 3:1 (cabecera línea 46). Un mutante que cambie >= por > solo en la rama de texto grande sobrevive.

### features/tokens_marca.feature @s16

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La guarda anti-vacuidad de @s16 solo comprueba el total de parejas evaluadas, no cada subconjunto por uso.
- **Motivo del veredicto (verificador independiente):** Las cláusulas 'ninguna pareja de uso X queda por debajo de...' (líneas 205-207) se cumplen por vacuidad si esa categoría queda vacía, y la única guarda es el conteo global 'el número de parejas evaluadas... es mayor que 0' (línea 208): una clasificación por uso rota deja pasar la puerta en verde sin haber comprobado dos de las tres categorías.

### features/informacion_contacto.feature @s9 (línea 167)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** 'texto visible' no distingue un elemento visualmente oculto (p. ej. clase .sr-only) porque css:false impide que esa clase se resuelva en el test.
- **Motivo del veredicto (verificador independiente):** toBeVisible() de jest-dom resuelve vía getComputedStyle(); con css:false (vite.config.ts línea 49) cualquier SCSS real, incluida una clase .sr-only, nunca se carga en el DOM de test, así que un implementador que oculte visualmente el aviso con esa clase seguiría pasando toBeVisible() en verde.

### features/informacion_contacto.feature @s3 (líneas 112-118)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Falta un escenario de teléfono inválido que falle cerrado para este panel, pese a que renderiza 3 enlaces tel: derivados de la misma fuente única.
- **Motivo del veredicto (verificador independiente):** project-spec.md líneas 73-74 fija como Modo de error común de todo el proyecto: teléfono que no normaliza -> el normalizador lanza, falla cerrado. pie_de_pagina.feature líneas 203-206 sí lo ejercita ('la operación falla lanzando un error'). Grep de 'falla|error' sobre informacion_contacto.feature completo no devuelve ningún resultado: @s11 prueba un valor válido y @s12 prueba dato ausente, pero ninguno cubre 'presente pero inválido'. Como StrykerJS no muta .tsx (stryker.config.json líneas 3 y 11-17), un manejo de errores propio y erróneo en este panel no lo detectaría ningún escenario ni ninguna mutación.

### features/pagina_campanas.feature CABECERA / @s15 / @s34 / @s35 (campo duracion)

- **Lente(s) que lo alegaron:** L1,L3
- **Resumen:** La cabecera promete para 'duracion' el mismo tratamiento de fallo cerrado y rotulo pendiente que vigencia/plazas, pero ningun escenario lo protege.
- **Motivo del veredicto (verificador independiente):** Cabecera :43-45 dice 'duracion... Igual tratamiento: pendiente rotulado y fallo cerrado (@s34, @s35)', pero @s34 (:469-475) y @s35 (:477-483) solo cubren vigencia y plazas; la tabla de @s15 (:300-303) solo tiene filas Precio/Vigencia/Plazas; @s24/@s25 no listan ninguna cadena de duracion. El hueco de cobertura es real.

### features/pagina_campanas.feature @s5 / @s14 / CABECERA (aviso 'Galapavet no publica ninguna campana')

- **Lente(s) que lo alegaron:** L2
- **Resumen:** El aviso visible afirma un hecho categorico sobre el negocio que la fuente citada no sostiene en esa amplitud.
- **Motivo del veredicto (verificador independiente):** @s5 (:205) y @s14 (:291) publican 'Galapavet no publica ninguna campana' como texto visible; la unica fuente citada en cabecera (:15-18) es docs/datos-galapavet.md SS7, que solo marca como NO VERIFICABLE las 'Campanas con precios' del prototipo, no 'ninguna campana' en general; SS9 (verificado por ausencia, :115-127) no incluye campanas en su lista. La regla propia del fichero fuente (docs/datos-galapavet.md:3-5) exige cita que sostenga la afirmacion, y aqui no la sostiene en esa amplitud.

### features/pagina_campanas.feature @s20 (imagenes, verde por vacuidad)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Los tres Then de @s20 sobre imagenes pasan igual con cero imagenes en el DOM.
- **Motivo del veredicto (verificador independiente):** @s20 (:344-350) solo tiene aserciones negativas/universales ('ningun origen contiene http/https/pexels', 'cada imagen que acompana a una tarjeta...'), ninguna ancla un recuento minimo; grep de 'imagen' en todo el fichero confirma que ningun otro escenario fija cuantas imagenes deben existir. Un array de imagenes vacio pasa el escenario en verde.

### features/pagina_campanas.feature @s21 / @s22 / @s23 (rama de movimiento reducido)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La rama de tres vias del scroll suave se contrata solo via interaccion DOM, sin escenario de logica pura.
- **Motivo del veredicto (verificador independiente):** Los tres escenarios (:352-374) estan redactados en terminos de clic e interaccion DOM, a diferencia de @s33-@s36 que contratan 'se construye el catalogo...' como operacion pura. stryker.config.json declara explicitamente que StrykerJS no muta JSX/.tsx, y project-spec.md Invariante 6 exige que la logica de decision viva en modulo puro; sin un escenario que ejercite la rama fuera del DOM, una implementacion inline en el .tsx queda fuera de la superficie mutable declarada.

### features/datos_negocio.feature @s19 (líneas 198-203) — inclusión de ficheros de test en el barrido

- **Lente(s) que lo alegaron:** L1
- **Resumen:** El Given 'todos los ficheros de código de la web' no excluye los ficheros de test, que por mandato de la propia cabecera contienen los mismos literales de teléfono.
- **Motivo del veredicto (verificador independiente):** Cabecera líneas 10-12: 'CADA valor esperado de este contrato está escrito a mano aquí abajo y el tdd_craftsman debe copiarlo literal al test'. Given línea 200 no acota el conjunto, a diferencia del análogo tokens_marca.feature @s18 línea 224 ('...salvo el fichero de tokens de marca'), que sí lo hace. Bajo lectura amplia de 'código de la web' el escenario se autocontradice.

### features/datos_negocio.feature CABECERA — datos de identidad (§1: nombre comercial, descriptor, localidad) fuera de la fuente única

- **Lente(s) que lo alegaron:** L2,L3
- **Resumen:** La feature acota su alcance a §2/§3/§9 y deja el §1 (identidad) sin ningún escenario, y ese dato ya se escribe a mano y de forma divergente en dos features distintas.
- **Motivo del veredicto (verificador independiente):** Cabecera línea 14 limita el alcance a '§2 (NAP), §3 (horario) y §9'. Verificado que features/cabecera_y_navegacion.feature:203 escribe 'Centro integral veterinario' y features/pie_de_pagina.feature:88 escribe la frase compuesta distinta 'Centro integral veterinario en Galapagar, Madrid.' sin puerta que los ate — exactamente la divergencia silenciosa que la cabecera de este mismo fichero (líneas 20-26) dice venir a cerrar.

### features/datos_negocio.feature @s19 — sin escenario gemelo de conjunto vacío

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La puerta anti-teléfono-hardcodeado no exige fallar si el barrido inspecciona 0 ficheros, a diferencia de las puertas equivalentes de tokens_marca.feature.
- **Motivo del veredicto (verificador independiente):** Confirmado que datos_negocio.feature tiene un único @s19 sin escenario de conjunto vacío, mientras tokens_marca.feature @s17 (líneas 210-216) y @s21 (líneas 244-250) sí exigen 'la puerta falla' y 'declara que evaluó/inspeccionó 0 [parejas/ficheros]' en ese caso.

### features/campanas_portada.feature @s9, @s10 (líneas 144-149)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** El When solo construye el modelo puro pero el segundo Then exige un hecho de la capa de render sin When que la invoque
- **Motivo del veredicto (verificador independiente):** Línea 147 ('se construye el modelo') no invoca render, pero línea 149 ('no se renderiza ninguna tarjeta') exige un hecho de render; rompe el plano único que @s15/@s17 sí respetan ('se renderiza la portada' → Then solo de render). stryker.config.json línea 3 excluye .tsx de mutación, así que el contrato no dice quién atrapa la excepción ni si esa aserción cae en la superficie mutada.

### features/campanas_portada.feature @s13 (líneas 173-178)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La puerta anti-terceros de imágenes no cubre URLs protocol-relative (//host/...)
- **Motivo del veredicto (verificador independiente):** galeria.feature:157 rechaza cualquier origen que no empiece por 'http://', 'https://' ni por '//'; campanas_portada.feature:177-178 solo rechaza 'http://', 'https://' y la cadena 'pexels'. Un origen '//cdn.otrohost.com/foto.jpg' no contiene ninguna de esas tres cadenas y pasaría @s13 pese a ser una petición real a un tercero, violando la Decisión 9/Invariante 3 citada en la propia cabecera (líneas 14-15).

### features/campanas_portada.feature @s16 (líneas 194-199)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El Then de @s16 solo cuenta y niega vacío, sin anclar qué 2 títulos concretos deben sobrevivir
- **Motivo del veredicto (verificador independiente):** Líneas 198-199 solo afirman 'hay exactamente 2 tarjetas' y 'ninguna... vacía'; ningún escenario del fichero (ni @s2, que cubre solo el catálogo íntegro de 3) ancla qué 2 títulos concretos sobreviven al filtro. Un mutante que descarte la campaña equivocada o duplique una superviviente mantiene recuento=2 y ningún nombre vacío, y sobrevive.

### features/campanas_portada.feature @s16/@s17 (líneas 197, 202) vs @s9/@s10 (línea 147)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Asimetría de verbo: 'se construye el modelo' en @s9/@s10 frente a 'se renderiza' en @s16/@s17 deja el filtro de título vacío fuera de la superficie mutada
- **Motivo del veredicto (verificador independiente):** Línea 147 usa 'se construye el modelo de la sección de campañas' (@s9); línea 197 usa 'se renderiza la sección de campañas' (@s16); línea 202 usa 'se renderiza la portada' (@s17). stryker.config.json (comentario línea 3) solo muta src/lib/**/*.ts y *-logica.ts, con la disciplina explícita de extraer toda decisión a un módulo puro. Al no exigir @s16/@s17 el mismo verbo que @s9/@s10, nada impide que el filtro de título vacío viva entero dentro del .tsx, fuera del 100% que Stryker certifica.

### features/seo_estructura.feature @s10 (telephone)

- **Lente(s) que lo alegaron:** L1,L2
- **Resumen:** El Then no desambigua cuál de los tres teléfonos publicados alimenta la propiedad telephone del JSON-LD.
- **Motivo del veredicto (verificador independiente):** Línea 267 usa singular ('el nombre accesible del enlace de teléfono visible') pero docs/datos-galapavet.md §2 publica tres números con roles distintos: 'Teléfono 1 91 082 92 67', 'Teléfono 2 685 34 31 49' y 'Urgencias fuera de horario 91 851 13 93'. A diferencia de streetAddress, que @s9 fija letra a letra (línea 250), ningún Then de todo el fichero fija el literal de telephone; @s12 (línea 282) solo exige consistencia entre páginas, no corrección del valor elegido.

### features/seo_estructura.feature @s10 (correspondencia de tramos de horario)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** No se define cómo comparar los tramos JSON-LD contra el horario visible cuando ambos modelos tienen estructuras distintas.
- **Motivo del veredicto (verificador independiente):** @s13 fija 3 tramos JSON-LD con lunes-viernes partido en dos entradas (líneas 294-295); features/informacion_contacto.feature líneas 121-126 fija el horario visible en 3 filas donde lunes-viernes es una sola fila de texto combinado y añade una fila de domingo cerrado sin tramo JSON-LD equivalente (por diseño, @s14). Los conteos coinciden por casualidad (3=3) pero las estructuras no, y la línea 268 ('sin sobrar ni faltar ninguno') no dice si la comparación es de cardinalidad, de subcadena o bidireccional.

### features/seo_estructura.feature @s19

- **Lente(s) que lo alegaron:** L2
- **Resumen:** El cribado de urgencias 24h en título/descripción solo cubre dos literales y deja pasar 'todos los días', '24/7' o un año de fundación.
- **Motivo del veredicto (verificador independiente):** Líneas 352-353 solo criban '24 h' y '24 horas'. features/datos_negocio.feature @s14 línea 164 sí criba además 'todos los días del año' sobre la fuente. seo_estructura @s19 no replica esa cláusula ni añade '24/7' o cifras de años, pese a que la propia cabecera de este fichero declara PENDIENTE 'años de actividad' (línea 144) y documenta el copy heredado 'urgencias 24 h desde 2013'. Una meta descripción con 'abierto todos los días' o 'desde 2013' pasaría las 20 puertas del fichero.

### features/seo_estructura.feature @s5

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Los Then de las descripciones por página solo cuentan y comparan distinción, sin ancla de contenido reconocible.
- **Motivo del veredicto (verificador independiente):** Líneas 212-214 exigen 'exactamente cuatro descripciones', 'ninguna vacía' y 'no hay dos iguales', sin ninguna cláusula de contenido, a diferencia de @s4 (línea 206, 'cada título contiene el nombre Galapavet'). Cuatro cadenas basura distintas satisfacen el escenario completo. Rebajo la severidad de 'bloqueante' (L3) a 'grave': el escenario es perfectamente satisfacible y medible tal cual está — el defecto es de cobertura de mutación/contenido, no de imposibilidad de verificación.

### features/seo_estructura.feature @s4

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El único ancla de contenido de los títulos ('Galapavet') es una subcadena compartida por las cuatro páginas, no distingue cuál título va con cuál página.
- **Motivo del veredicto (verificador independiente):** Línea 206 exige que 'cada título contiene el nombre Galapavet', subcadena presente por construcción en las cuatro páginas. Ningún Then fija, para una página concreta, un fragmento distintivo de su propio título. Un mutante que intercambie qué título sirve cada página sigue cumpliendo 'cuatro distintos, todos con Galapavet' sin que ningún Then del fichero lo detecte.

### features/seo_estructura.feature @s20

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Título, tipo, imagen y url de Open Graph solo se verifican por existencia, sin valor ni no-vacío, a diferencia de og:locale en la misma escena.
- **Motivo del veredicto (verificador independiente):** Línea 365 ('se declara un título, un tipo, una imagen y una dirección de la página') solo exige presencia de cuatro claves, mientras la misma escena fija og:locale letra a letra dos líneas después. No hay clausula 'no vacío' para og:title/og:type/og:url, a diferencia de @s4/@s5 que sí la exigen para título y descripción HTML. Un og:type incorrecto o un og:title vacío pasarían si el test solo comprueba existencia de la clave.

### features/seo_estructura.feature @s15 / @s16

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Las guardas de omisión de geo y de email/redes solo se prueban con ambos campos ausentes a la vez, dejando indetectable un mutante de operador lógico.
- **Motivo del veredicto (verificador independiente):** @s15 (línea 313) y @s16 (línea 322) dan como Given ambos campos ausentes simultáneamente, sin variante de 'solo uno presente'. Revisé @s1-@s20 completos del fichero y ninguna otra escena cubre el caso intermedio. Si la lógica real de omisión combina dos condiciones con un operador lógico, un mutante que cambie Y por O solo se distingue cuando exactamente uno de los dos campos está presente, caso que este fichero nunca ejercita.

### features/pagina_tienda.feature @s3 (frente a pagina_campanas @s24 y @s15)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** pagina_tienda permite el carácter € en su contenido mientras pagina_campanas lo prohíbe explícitamente sobre el mismo dato pendiente.
- **Motivo del veredicto (verificador independiente):** Verifiqué features/pagina_campanas.feature:380 (@s24: 'ese texto no contiene el carácter "€"') y :304-305 (@s15, misma prohibición). features/pagina_tienda.feature:185 (@s3) solo prohíbe '%', nunca '€', y de hecho exige que existan importes con '€'. Dos features del mismo lote aplican reglas opuestas al mismo dato §9 pendiente.

### features/pagina_tienda.feature @s33

- **Lente(s) que lo alegaron:** L2
- **Resumen:** Los 60 literales monetarios del fichero usan espacio ASCII antes de € pero @s33 exige espacio duro U+00A0.
- **Motivo del veredicto (verificador independiente):** Escaneé programáticamente el fichero: 60 apariciones de '€' precedidas de U+0020 y 0 de U+00A0, incluida la propia tabla de @s33 (línea 490: '1237,50 €'). @s33 (línea 493) exige exactamente U+00A0. Es un defecto verificable a nivel de bytes.

### features/pagina_tienda.feature @s27

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El tope de 99 unidades solo se contrata vía interacción de UI, a diferencia de @s34-@s38 formulados como operaciones puras.
- **Motivo del veredicto (verificador independiente):** Comparé @s27 (línea 419, Given/When de interacción de UI) con @s34-@s38 (líneas 496-538, formulados como 'un estado de cesta con...' / 'se fija a 0 la cantidad...', operaciones puras) y con @s33 (formateo como función pura). stryker.config.json excluye explícitamente los .tsx del objetivo de mutación ('StrykerJS no muta ni el texto ni los atributos de JSX'); si el tope de 99 queda cableado en el .tsx, la métrica de mutación se declara sana sin haber probado el límite. Es una inconsistencia interna real del propio fichero.

### features/selector_paleta.feature CABECERA fila lima / @s2 (líneas 21, 25, 85)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** La nota 'Lima protagonista/Lima sobre claro' no distingue el uso apto (superficie) del prohibido (texto/borde)
- **Motivo del veredicto (verificador independiente):** Verifiqué las citas exactas en el fichero y en docs/datos-galapavet.md:160-168 ('Cualquier uso del lima como color de texto o de borde sobre fondo claro es un defecto de accesibilidad'). 'Lima protagonista' connota precisamente el uso prohibido. tokens_marca.feature @s6 mitiga el riesgo de que llegue a producción, pero no resuelve la ambigüedad de la especificación, que es el defecto alegado.

### features/selector_paleta.feature CABECERA fila noche (líneas 23, 55-57; tokens_marca.feature:64-66)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** Referencia circular entre ficheros deja sin fijar el hex del fondo oscuro, y morado no puede alcanzar 3:1 contra ningún fondo más oscuro que él
- **Motivo del veredicto (verificador independiente):** Confirmé la referencia circular citando ambos ficheros directamente. Recalculé de forma independiente la luminancia de #77286B (L≈0,0650) y su ratio máximo contra negro puro (2,30:1, por debajo de 3:1). Fui más allá que L2: despejé que ningún fondo más oscuro que el propio morado puede darle 3:1 (exige L_fondo≤-0,0117, imposible), probando que 'Morado y lima sobre oscuro' es aritméticamente irrealizable como combinación legible y que el círculo de referencias nunca lo resuelve.

### features/servicios.feature @s2 (servicios.feature:105)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** La negación de accesibilidad del desglose no se acota a la sección Servicios y colisiona con títulos de campanas_portada.feature
- **Motivo del veredicto (verificador independiente):** servicios.feature:105 no acota el ámbito; Background (línea 85) monta la landing completa; campanas_portada.feature:78 declara tarjetas tituladas 'Vacunaciones' y 'Chequeo', que son exactamente puntos de desglose de 'Medicina general' (servicios.feature:147,149). Rebajado de bloqueante a grave. Corrijo el ancla de L1: @s12 (línea 202) ya está bien acotado ('de las otras 4 tarjetas') y no comparte el defecto.

### features/servicios.feature @s19 (servicios.feature:259-261)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** El criterio de alt text es un juicio semántico no mensurable y hoy se ejercita sobre un conjunto vacío de imágenes
- **Motivo del veredicto (verificador independiente):** servicios.feature:261 exige que el alt 'describa la fotografía, no un servicio', juicio sin procedimiento determinista; servicios.feature:68 confirma que hoy no hay ninguna imagen publicada, por lo que las tres líneas de @s19 son vacuamente ciertas.

### features/servicios.feature @s18 (servicios.feature:253)

- **Lente(s) que lo alegaron:** L1
- **Resumen:** 'Ninguna promesa de plazo ni cifra de volumen' es negación de mundo abierto, rompe el patrón de lista negra literal del resto del escenario
- **Motivo del veredicto (verificador independiente):** servicios.feature:253 usa categorías abstractas frente a las ocho líneas hermanas (245-252) que usan literales exactos entre comillas; ningún literal cierra el conjunto de frases prohibidas.

### features/servicios.feature @s16, Then (servicios.feature:231-232)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El Then de @s16 solo cuenta y niega vacío, no ancla la identidad ni el orden de los 5 puntos supervivientes
- **Motivo del veredicto (verificador independiente):** servicios.feature:231-232 no fija cuáles son los 5 puntos supervivientes, a diferencia de @s4-@s8 que tabulan el contenido literal completo. Un mutante que reordene, duplique o sustituya uno de los 5 puntos reales de Análisis (manteniendo recuento 5, ninguno vacío) sobrevive sin detección. Defecto distinto del alegado por L1 sobre el mismo ancla (ese versaba sobre el Given).

### features/servicios.feature @s18 (servicios.feature:254)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El bullet de los '26 puntos' remite a docs externo en vez de fijar una comprobación de conjunto positiva sobre las tablas ya literales
- **Motivo del veredicto (verificador independiente):** servicios.feature:254 remite a docs/datos-galapavet.md §5 en vez de comprobar la unión de las tablas literales de @s4-@s8 (que suman 7+4+5+6+4=26, verificado). Riesgo real de Then ciego a duplicados/mezcla entre bloques y de implementación tautológica si el step compara contra la misma constante de producción de la que deriva el propio 26.

### features/galeria.feature @s12

- **Lente(s) que lo alegaron:** L1
- **Resumen:** Aviso de demostración descrito por paráfrasis, sin literal fijado
- **Motivo del veredicto (verificador independiente):** galeria.feature:166 es paráfrasis ('declara que...son contenido de demostración'). Contraste directo: campanas_portada.feature:108 fija el aviso análogo como literal cerrado ('es exactamente «Contenido de demostración...»'). galeria.feature no replica ese patrón pese a proteger un aviso igual de sensible.

### features/galeria.feature @s4

- **Lente(s) que lo alegaron:** L1
- **Resumen:** Recorrido de tabulador acoplado al orden global de foco de toda la landing
- **Motivo del veredicto (verificador independiente):** galeria.feature:98 es una frase única en el repo: accesibilidad.feature:276 prueba foco con 'cada control interactivo recibe el foco por teclado', más local. Acoplar el escenario al tabulado desde el inicio de toda la landing lo hace frágil ante cambios en secciones ajenas, sin cota de pulsaciones. La objeción sobre exigir tabindex explícito es más discutible (Then describe resultado, no mecanismo), pero la fragilidad por acoplamiento global es real.

### features/galeria.feature @s1, @s2

- **Lente(s) que lo alegaron:** L3
- **Resumen:** 'Al menos una entrada' permite fixture de 1 elemento, vacía comprobaciones de unicidad
- **Motivo del veredicto (verificador independiente):** galeria.feature:71 admite un fixture de una sola entrada; con una sola entrada, :76 ('ninguna imagen tiene el mismo nombre accesible que otra') y :84 ('el pie de cada figura es el de su propia entrada y no el de otra') no tienen nada que comparar y pasan vacuamente. El cuantificador no exige mínimo 2.

### features/galeria.feature @s1 (caso límite ausente)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Falta escenario de entrada de catálogo con nombre/pie en blanco
- **Motivo del veredicto (verificador independiente):** Revisados los 15 escenarios uno a uno: ninguno prueba una entrada con nombre o pie en blanco, a diferencia de equipo.feature @s9 (:127-130), servicios.feature @s16 (:229-232) y faq.feature @s12 (:172-175), los tres con escenario dedicado a esa entrada corrupta. galeria.feature:75 presupone un fixture ya válido sin forzar el caso límite.

### features/galeria.feature @s5 (lógica atrapada en .tsx)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Cálculo de desplazamiento sin pista textual que lo ancle a módulo puro
- **Motivo del veredicto (verificador independiente):** Contraste textual directo: campanas_portada.feature:147,154 usa 'se construye el modelo de la sección de campañas' para empujar la validación a función pura; galeria.feature:106-109 usa 'el visitante pulsa el botón' seguido de 'se solicita a la pista un desplazamiento...' sin verbo que ancle el cálculo a un módulo puro. stryker.config.json excluye explícitamente los .tsx del mutate: si la aritmética queda en el manejador .tsx, el umbral break:100 no la protege pese al detalle del contrato.

### features/reserva_chat.feature CABECERA — PENDIENTE WhatsApp (L92-96)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** El PENDIENTE de mensajería presupone que, si el cliente confirma tener WhatsApp, el número ya verificado (móvil, solo como voz) es también el canal, sin exigir re-verificar CUÁL es el número del canal.
- **Motivo del veredicto (verificador independiente):** datos_negocio.feature @s5/@s6 (L91-104) es un contrato de FORMATO genérico, no un dato de Galapavet: su propia cabecera dice 'que ese número atienda mensajería está SIN CONFIRMAR' (L33-36); docs/datos-galapavet.md §2 registra 685 34 31 49 solo como enlace tel: de voz y §9 confirma que no hay ningún enlace de redes verificado. La cabecera de reserva_chat.feature da por bueno ese número como 'ya formateado' para cuando se confirme WhatsApp, saltando la re-verificación del número real del canal.

### features/reserva_chat.feature @s14 (L228-235)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** En la derivación de urgencia solo el teléfono fuera de horario recibe un enlace tel:; el teléfono de clínica citado en el mismo mensaje queda como texto no accionable.
- **Motivo del veredicto (verificador independiente):** features/informacion_contacto.feature L55 establece como norma del proyecto que 'los teléfonos del panel pasan a ser enlaces de llamada. El prototipo los pintaba como texto [plano]' (defecto corregido allí). En @s14 el teléfono de clínica '91 082 92 67' no tiene ninguna aserción de enlace, mientras docs/datos-galapavet.md §3 (L39-43) confirma que ese es precisamente el número correcto durante el horario de apertura; un visitante que consulta en horario abierto ve como único enlace pulsable el número reservado para cuando la clínica está cerrada.

### features/reserva_chat.feature CABECERA — Invariante 6 sin Then que lo falsee

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Los 20 escenarios son todos aserciones sobre el DOM; ninguno ejercita directamente un módulo puro, dejando la superficie mutable de src/lib/*-logica.ts sin cobertura de este fichero.
- **Motivo del veredicto (verificador independiente):** project-spec.md L64-65 define el Invariante 6 ('La lógica de decisión vive en módulos puros... el .tsx solo cablea'), citado en la cabecera (L12). Revisados los 20 escenarios, todos usan Given/When/Then de DOM (roles, aria-*, historial), a diferencia de datos_negocio.feature que sí tiene escenarios de función pura ('Given la fuente única declara...'). stryker.config.json (L11-17) confirma mutate limitado a src/lib/**/*.ts y *-logica.ts: sin escenarios de lógica pura en este fichero, mutantes en el módulo de guion (guarda de envío, recorte, resumen 'A · B · C', corte por urgencia) pueden sobrevivir aunque el DOM pase.

### features/reserva_chat.feature @s3 (L133-141) — extractor sin control positivo

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Las cuatro negaciones sobre 'todo el texto visible del widget' no tienen ningún Then positivo que confirme que ese extractor devuelve contenido real.
- **Motivo del veredicto (verificador independiente):** El When fija 'se recorre todo el texto visible del widget de reserva' (L136); las cuatro negaciones (L138-141) actúan sobre ese texto, pero el único Then positivo (L137) usa un extractor distinto (nombres accesibles de botones). Grep confirma que la frase del When no se repite en ningún otro escenario del fichero, así que no hay control positivo en ningún sitio: si el extractor de 'todo el texto visible' se implementa devolviendo cadena vacía, las cuatro negaciones pasan en verde sin comprobar nada.

### features/pagina_blog.feature @s28

- **Lente(s) que lo alegaron:** L1
- **Resumen:** El alt de la imagen del artículo exige que "describa la fotografía", juicio de prosa libre sin literal contra el que comparar.
- **Motivo del veredicto (verificador independiente):** L461: 'el texto alternativo de la imagen del artículo describe la fotografía y no afirma ningún servicio'. La cabecera (L136-138) admite que 'qué se ve en ellas es decisión de diseño', a diferencia del texto editorial del cuerpo, que la cabecera SÍ excluye de cualquier Then (L127-132). Aquí 'describe la fotografía' sí queda dentro de un Then sin esa salvedad.

### features/pagina_blog.feature @s3 (y @s15, CABECERA)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** El aviso de demo afirma "Galapavet no tiene blog", hecho sobre el negocio real no verificado en docs/datos-galapavet.md.
- **Motivo del veredicto (verificador independiente):** grep -i blog docs/datos-galapavet.md no devuelve nada; el §9 (L117-127) enumera lo NO publicado (email, redes, coordenadas, precios, años de actividad) sin blog. El propio fichero se declara obligatorio (L2-5): 'aquí solo entra lo que se ha verificado... y contra el que el judge contrasta cualquier dato que aparezca en la UI'.

### features/pagina_blog.feature @s28

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Los cinco Then de la puerta de imágenes son universales/negaciones sin ningún recuento que pruebe que se inspeccionó alguna imagen.
- **Motivo del veredicto (verificador independiente):** L458-463: ningún Then del tipo 'el recuento de imágenes inspeccionadas es N'. @s28 es el único escenario de todo el fichero que menciona imágenes; con el conjunto vacío, los cinco Then pasan en verde sin haber mirado ninguna.

### features/pagina_blog.feature @s19

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Ningún Then del fichero afirma un tiempo de lectura POSITIVO sobre una página de artículo realmente renderizada.
- **Motivo del veredicto (verificador independiente):** grep 'min' solo encuentra la tabla de @s18 (L355-359, que prueba la función pura sin renderizar página) y la negación de @s19 (L367). Si el cableado función→vista se rompe por completo, @s18 sigue verde y @s19 también, sin que ningún test detecte que el tiempo nunca se pinta.

### features/pagina_blog.feature @s18

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La velocidad de 200 ppm entra como dato de prueba por el Given, sin ningún Then que la fije como constante de producción.
- **Motivo del veredicto (verificador independiente):** L351: 'Given la velocidad de lectura declarada es de 200 palabras por minuto' — un Given, no una aserción sobre el módulo. La cabecera (L144-146) confirma que @s18 es el único lugar donde ese valor se fija, y lo hace como parámetro de entrada, no como comprobación del símbolo exportado.

### features/pagina_blog.feature @s26

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El catálogo de patrones prohibidos del validador no está anclado contra una lista completa: solo se ejercitan 5 casos.
- **Motivo del veredicto (verificador independiente):** L431-441: la tabla fija 5 textos y el único cierre es que un cuerpo limpio pasa la validación (camino feliz). A diferencia de @s7 (L250, 'ningún botón del grupo se llama Salud, ni Gatos...'), @s26 no tiene un Then que declare la lista de patrones prohibidos como cerrada; patrones adicionales de producción quedarían sin ejercitar bajo break:100.

### features/accesibilidad.feature @s10

- **Lente(s) que lo alegaron:** L1
- **Resumen:** Mecanismo de medición del área de contacto ambiguo (declarada vs medida), sin aclaración equivalente a la de tokens_marca
- **Motivo del veredicto (verificador independiente):** El When dice "área de contacto declarada" pero el Then dice "ancho medido" (L220-222); a diferencia de @s29 (cuyo PENDIENTE de cabecera aclara "no se extrae del render"), aquí no hay aclaración. Rebajado de bloqueante porque Invariante 6 (módulo puro) ya da un camino de resolución no inventado.

### features/accesibilidad.feature @s18 (guarda de conteo)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Consume el inventario de controles sin recuento > 0, a diferencia de su gemelo @s16
- **Motivo del veredicto (verificador independiente):** @s16 (L279) lleva "recuento de controles a los que se dio foco es mayor que 0"; @s18 consume el mismo inventario (L292) sin esa cláusula. Con inventario vacío ambos universales de @s18 son verdes vacíos, incumpliendo la regla de la propia cabecera (L79-80) de guarda por extractor independiente.

### features/accesibilidad.feature @s20 (y @s21)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Universal sobre contenido animado sin recuento, a diferencia de sus hermanos @s19/@s22
- **Motivo del veredicto (verificador independiente):** @s19 (L309) y @s22 (L332) llevan recuento > 0; @s20 (L312-317) y @s21 (L319-325) cuantifican sobre "todo el contenido... mediante animación" sin ningún recuento. Con conjunto vacío ambos son verdes vacíos en los escenarios que protegen el Invariante 4.

### features/accesibilidad.feature @s27

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El único recuento del escenario es un cero también cierto si el tabulador no se moviera
- **Motivo del veredicto (verificador independiente):** "el foco solo se detiene en los controles de cabecera" (L377) es universal, y el único recuento es "paradas dentro de paneles colapsados es exactamente 0" (L379). A diferencia de @s23 (L346, recuento > 0 sobre toda la página), @s27 no tiene recuento positivo propio.

### features/accesibilidad.feature @s13 (y @s14)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La cabecera transcribe 5 excepciones de SC 2.5.8 y los escenarios solo contratan 2
- **Motivo del veredicto (verificador independiente):** Cabecera L23-29 lista (a) Spacing, (b) Equivalent, (c) Inline, (d) User Agent Control, (e) Essential. @s13 contrata solo Inline (L247) y @s14 solo Spacing (L256); Equivalent/UAC/Essential no tienen ningún escenario, contra break:100.

## MENOR (7)

### features/pagina_tienda.feature @s23

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La singularización '1 artículo'/'N artículos' solo se contrata vía UI, sin escenario paralelo de función pura como el que sí existe para el importe (@s33).
- **Motivo del veredicto (verificador independiente):** Verifiqué features/pagina_tienda.feature:378-384 (@s23): es Given/When de interacción de UI sin tabla de casos puros, mientras @s33 sí formula el formateo de importes como función pura con tabla de 8 casos. Con .tsx fuera del objetivo de mutación de stryker.config.json, la pluralización podría cablearse sin quedar bajo la métrica de mutación; es la misma inconsistencia interna que en @s27, aquí de severidad menor porque @s23 sí cubre el riesgo funcional en ejecución normal.

### features/selector_paleta.feature CABECERA general (líneas 2-9, 15-17)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** La interacción y los descriptores de paleta 'heredados' no existen en ningún artefacto del repositorio
- **Motivo del veredicto (verificador independiente):** Verifiqué con find/grep: no hay ningún .dc.html en todo el repo; el zip archivado solo contiene 13 .feature + README; docs/contrato-heredado/selector_paleta.feature no contiene 'Cambiar paleta de color' ni 'azul cobalto'/'cian neón'/'esmeralda'. La cabecera afirma herencia aprobada de literales que ningún artefacto sostiene. Corrijo un error menor de L2: cita 'seis escenarios' pero solo lista y en efecto son 5 (@s1,@s2,@s3,@s4,@s16); no invalida el fondo del hallazgo.

### features/servicios.feature CABECERA (servicios.feature:51-53)

- **Lente(s) que lo alegaron:** L3
- **Resumen:** Desfase de uno en la numeración de anclas citadas para los casos límite
- **Motivo del veredicto (verificador independiente):** servicios.feature:51-53 cita (@s14,@s15,@s16) pero el @s14 real (líneas 212-216) es 'Cada botón de la sección tiene un nombre accesible distinto', no un caso límite de catálogo; los tres casos límite reales son @s15, @s16 y @s17 (líneas 218, 227, 234). Confirmado por comparación directa; defecto de comentario, no de comportamiento.

### features/reserva_chat.feature CABECERA — '4 opciones son ventanas...(§3)' vs @s4 (L45-46 / L148)

- **Lente(s) que lo alegaron:** L2
- **Resumen:** La cabecera afirma que las 4 opciones del paso 'cuándo' son ventanas horarias reales, pero 'Lo antes posible' no es una franja de §3.
- **Motivo del veredicto (verificador independiente):** docs/datos-galapavet.md §3 (L35-37) solo publica tres tramos reales; @s4 (L148) fija como cuarta opción 'Lo antes posible', que no es ventana horaria. La cabecera se autocontradice con el escenario que ella misma describe: es una inexactitud de redacción verificable y de bajo riesgo.

### features/reserva_chat.feature @s20 (L289) — 'sin recurrir a su color ni a su posición'

- **Lente(s) que lo alegaron:** L1
- **Resumen:** El inciso de color no añade ninguna aserción nueva y comprobable respecto a las dos líneas anteriores.
- **Motivo del veredicto (verificador independiente):** vite.config.ts confirma environment: 'jsdom' (L37) y css: false (L49). Las líneas 287-288 ya garantizan que el autor se lee en el propio texto (prefijo 'Asistente:'/'Tú:' + recuento exacto 2/1); con CSS desactivado en jsdom ningún test puede observar color, así que 'sin recurrir a su color ni a su posición' es prosa redundante, no una aserción nueva.

### features/pagina_blog.feature @s29

- **Lente(s) que lo alegaron:** L3
- **Resumen:** El último Then, sobre orden de llamadas internas, no corresponde a ningún mutante nombrable y exige espiar la implementación.
- **Motivo del veredicto (verificador independiente):** L473. stryker.config.json confirma que `mutate` cubre solo src/lib/**/*.ts y *-logica.ts, excluyendo explícitamente el cableado .tsx donde vive esta cláusula. La tabla L469-472 ya agota la mutación de la lógica pura; esta cláusula solo añade una obligación de orden de llamadas testeable con espía frágil, sin ganancia de cobertura.

### features/accesibilidad.feature @s33

- **Lente(s) que lo alegaron:** L3
- **Resumen:** La guarda de fallo cerrado no dice a cuál de los tres inventarios de color se aplica
- **Motivo del veredicto (verificador independiente):** "un inventario de parejas de color sin ninguna entrada" (L429) no distingue texto normal (@s29), texto grande (@s30) o componentes UI (@s31). Refuerza el hallazgo confirmado sobre @s30: una sola guarda genérica podría darse por cumplida dejando los otros dos inventarios sin fallo cerrado propio.

