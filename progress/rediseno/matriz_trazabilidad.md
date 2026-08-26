# Matriz de trazabilidad — rediseno_visual (52 escenarios)

> Auditoría de 10 agentes (7 auditores por sección + 3 escépticos que intentaron
> refutar cada "cubierto"). Solo lectura; ninguna prueba fue modificada al medir.
> Fecha: 26/08/2026. Fuente: contrato `features/rediseno_visual.feature`.

## Resumen

| Estado | Recuento | Escenarios |
| --- | ---: | --- |
| Cubierto | 1 | @s2 |
| Parcial | 39 | @s1, @s4, @s5, @s7, @s8, @s9, @s10, @s12, @s13, @s14, @s16, @s17, @s21, @s25, @s26, @s27, @s28, @s29, @s30, @s31, @s32, @s34, @s35, @s36, @s37, @s38, @s39, @s40, @s42, @s43, @s44, @s45, @s46, @s47, @s48, @s49, @s50, @s51, @s52 |
| Ausente | 12 | @s3, @s6, @s11, @s15, @s18, @s19, @s20, @s22, @s23, @s24, @s33, @s41 |

## Escenario a escenario

### @s1 — El inventario del sistema de color declara exactamente veinte roles

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:24`, `src/lib/diseno/tokensColor.test.ts:25`, `src/lib/diseno/tokensColor.test.ts:26`, `src/lib/diseno/tokensColor.test.ts:27`, `src/lib/diseno/contratoRedisenho.test.ts:12`, `src/lib/diseno/contratoRedisenho.test.ts:13`, `src/lib/diseno/contratoRedisenho.test.ts:14`
- **Cláusulas sin morder:**
  - And los diecisiete nombres que ya existian siguen presentes, ninguno renombrado
- **Nota:** Las tres primeras clausulas si se muerden: toHaveLength(20), filtro '--color-' == 18, filtro '--sombra-' == 2 y arrayContaining de los tres nombres nuevos. Lo que NO existe es el nucleo del escenario: el Given pide 'un literal escrito a mano con los veinte nombres de token esperados' y el When pide comparar el inventario con ese literal, y ninguna asercion del repo hace esa comparacion. Existe un literal a mano de 18 nombres en src/lib/diseno/contratoRedisenho.ts:1-22, pero su test solo comprueba su longitud (contratoRedisenho.test.ts:12) y jamas lo confronta con INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR (src/lib/diseno/tokensColor.ts:76). Consecuencia: renombrar --color-borde por --color-linea en LOS DOS ficheros a la vez deja los recuentos en 20/18/2 y los tres nombres nuevos presentes; toda la suite sigue verde.

### @s2 — Las cinco variantes declaran los veinte tokens en su propio bloque, sin heredar ninguno

- **Estado:** CUBIERTO
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:33`, `src/lib/diseno/tokensColor.test.ts:35`, `src/lib/diseno/tokensColor.test.ts:36`, `src/lib/diseno/tokensColor.test.ts:37`
- **Nota:** Unico escenario del bloque A que muerde entero. El texto real de src/styles/_tokens.scss entra con import.meta.glob('?raw') (tokensColor.test.ts:12-14), no via CSS Modules. Clausula 1: toEqual(['clinica','calida','tech','eco','marca']) sobre extraerVariantesDeTokens, que es ordenado y sin duplicados. Clausula 2: paresComprobados == 100. Clausula 3: faltantes == []. Clausula 4: comprobarInventarioDeTokens delega en declaraTokenEnVariante (tokensColor.ts:194-197), que busca el token dentro del CUERPO del bloque propio de cada variante, extraido siguiendo profundidad de llaves (tokensColor.ts:117-146), asi que un token heredado del :root global se marcaria como faltante. La puerta ademas falla cerrada con catalogo vacio (tokensColor.ts:227).

### @s3 — Los cuatro temas importados valen exactamente lo que declara el prototipo

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then cada rol del prototipo tiene su equivalente declarado en el sistema, segun la tabla de correspondencia
  - And el valor coincide caracter a caracter, salvo en las tres desviaciones declaradas de @s6 y @s7
  - And el recuento de roles efectivamente comparados es mayor que 0
  - And si el prototipo cambiara un solo hexadecimal, esta comprobacion fallaria
- **Nota:** NINGUN fichero de test del repositorio lee docs/diseno-claude-design/. Grep de 'dc.html', 'diseno-claude-design' y 'La Sierra' sobre src/**/*.test.* y tests/e2e/*.spec.ts solo devuelve comentarios en prosa y asertos negativos de contenido (que el sitio NO diga 'Veterinaria La Sierra'), nunca una lectura ?raw del prototipo ni una comparacion de hexadecimales. No existe tabla de correspondencia ni funcion que extraiga los bloques ':root[data-tema=...]'. Esta es exactamente la puerta que la cabecera del contrato (lineas 72-76) declara como la que faltaba, y sigue faltando: hoy nadie comprueba que el sitio sea FIEL al diseno, solo que sea coherente consigo mismo.

### @s4 — La variante de marca conserva intactos los quince hexadecimales ya aprobados

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:41`, `src/lib/diseno/tokensColor.test.ts:42`, `src/lib/diseno/tokensColor.test.ts:43`, `src/lib/diseno/tokensColor.test.ts:44`, `src/lib/diseno/tokensColor.test.ts:45`
- **Cláusulas sin morder:**
  - Then cada uno vale exactamente lo que valia antes de este rediseno (solo se afirman 5 de los 15 roles: fondo, texto, primario, acento-tinta y foco; quedan sin ninguna asercion fondo-alterno, superficie, superficie-elevada, borde, borde-control, tinta, texto-suave, primario-fuerte, sobre-primario y acento-suave)
  - And ninguno se ha rederivado ni redondeado
- **Nota:** El test que se titula '@s4 preserva los quince colores ya aprobados de marca' afirma cinco, no quince. Los diez restantes de la variante 'marca' (src/styles/_tokens.scss:125-147) se pueden cambiar sin que falle nada. La segunda clausula ('ninguno se ha rederivado ni redondeado') tampoco se muerde: src/lib/diseno/mezclaDeColor.test.ts:9-19 recalcula ocho mezclas con mezclar(), pero contra literales escritos en el propio test, sin leer nunca _tokens.scss, asi que no ancla los valores del fichero a su derivacion. Los valores si se leen del texto real con ?raw, de modo que las cinco aserciones que existen son solidas.

### @s5 — Los tres roles nuevos de la variante de marca derivan de fuentes declaradas

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:49`, `src/lib/diseno/tokensColor.test.ts:50`, `src/lib/diseno/tokensColor.test.ts:51`, `src/lib/tokens.test.ts:8`
- **Cláusulas sin morder:**
  - And "--color-urgencia" es el mismo rojo semantico que declaran las variantes "clinica" y "eco"
  - And "--color-urgencia-suave" es la mezcla en sRGB de blanco con ese rojo al diez por ciento, calculada con la funcion de mezcla del repositorio
  - And el fichero declara por escrito que el rojo de urgencia es un color SEMANTICO de alerta y no un cuarto color de marca
- **Nota:** Solo la primera clausula queda mordida, y de forma indirecta: tokensColor.test.ts:49 fija --color-acento de 'marca' a '#B4C718' leyendolo del texto real, y src/lib/tokens.test.ts:8 fija coloresDeMarca.lima al mismo literal, asi que la igualdad queda anclada por los dos extremos aunque ninguna asercion los confronte. Las otras tres no: la linea 50 afirma un literal '#DC2626' para 'marca' pero no lee las variantes 'clinica' ni 'eco' (nadie fija su --color-urgencia en ningun test), y la linea 51 afirma el literal '#FDE9E9' sin invocar mezclar(). HALLAZGO: la clausula de la mezcla es ademas FALSA hoy — mezclar('#FFFFFF','#DC2626',0.1) segun src/lib/diseno/mezclaDeColor.ts:46-48 da #FCE9E9 (canal rojo 255*0.9+220*0.1 = 251.5 -> 252 = FC), mientras _tokens.scss:143 declara #FDE9E9. Un test que ejecutara de verdad esta clausula fallaria. La cuarta clausula tampoco tiene soporte: la cabecera de _tokens.scss:1-4 habla de 'roles semanticos' pero no dice que el rojo no sea un cuarto color de marca, y ningun test inspecciona ese texto.

### @s6 — La variante calida corrige el unico suspenso de contraste que traia el prototipo

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then el valor del prototipo daba 4.37 y habria suspendido el minimo de 4.5
  - And el valor declarado en el sistema alcanza al menos 4.5
  - And ese mismo valor sigue aprobando sobre el fondo y sobre la superficie de su variante
- **Nota:** Ningun test calcula ningun ratio de la variante 'calida'. La unica llamada a calcularRatioContraste sobre tokens del rediseno esta en tokensColor.test.ts:58 y es el par sobre-primario/urgencia (@s7). No aparece '4.37' en ningun fichero de test, ni existe asercion sobre --color-texto-suave (#84663E) contra --color-fondo-alterno (#FEF3C7), ni contra --color-fondo (#FFFBF2) ni --color-superficie (#FFFDF8) de esa variante. La desviacion declarada respecto del prototipo no la vigila nadie.

### @s7 — La tinta que va encima del color de urgencia nunca es blanca por defecto

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:58`, `src/lib/diseno/inventarioModulos.test.ts:143`, `src/lib/diseno/inventarioModulos.test.ts:144`, `src/lib/diseno/inventarioModulos.test.ts:145`
- **Cláusulas sin morder:**
  - Then el color de encima es siempre "--color-sobre-primario" de esa misma variante
  - And en la variante "tech" ese par da al menos 6, frente al 2.77 que daria el blanco del prototipo
- **Nota:** Mordidas: la clausula del 4.5 en las cinco variantes (tokensColor.test.ts:54-59 itera las 5, lee ambos tokens del texto real y aplica calcularRatioContraste), y la del blanco literal (inventarioModulos.test.ts:131-146 pasa la puerta de literales de color sobre los 18 .module.scss REALES cargados con ?raw; 'white' esta en NOMBRES_DE_COLOR_CSS, puertaLiteralesColor.ts:41, y se exige ficherosInspeccionados == 18 y señalados == 0). NO mordidas: nadie busca en los ficheros de estilos QUE color se pinta sobre --color-urgencia. Y ahi hay un incumplimiento real sin vigilancia: src/components/BarraUrgencias.module.scss:12 pinta el fondo de urgencia y la linea 13 pone var(--color-sobre-primario), pero la linea 19 pinta el <span> interior con var(--color-acento) sobre esa misma superficie roja — un color de encima que NO es --color-sobre-primario. Tampoco existe asercion del umbral 6 en 'tech' ni de la referencia 2.77 del blanco.

### @s8 — El borde de control existe en las cinco variantes y cumple el minimo de componentes de interfaz

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:33`, `src/lib/diseno/tokensColor.test.ts:35`, `src/lib/diseno/tokensColor.test.ts:36`, `src/lib/diseno/tokensColor.test.ts:37`
- **Cláusulas sin morder:**
  - And el ratio alcanza al menos 3 en las cinco
  - And el prototipo no modela este rol, asi que su valor se deriva por mezcla del primario con el fondo de cada variante, con la regla escrita en el propio fichero
- **Nota:** Solo la primera clausula ('las cinco variantes declaran ese rol') queda mordida, y de rebote: --color-borde-control forma parte de INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR y la comprobacion de 100 parejas con faltantes == [] (tokensColor.test.ts:35-37) prueba que las cinco lo declaran en su bloque propio. El ratio contra el fondo de su propia variante NO se calcula en ningun sitio: grep de 'borde-control' sobre todos los *.test.ts/*.test.tsx/*.spec.ts solo devuelve una cadena de fixture CSS dentro de src/lib/diseno/puertaTerceros.test.ts:13, que es un doble de prueba, no una medicion. La tercera clausula tampoco: _tokens.scss (147 lineas, leidas enteras) no contiene ninguna regla escrita de derivacion por mezcla para este rol, y ningun test inspecciona ese texto.

### @s9 — El anillo de foco existe en las cinco variantes y se distingue de su fondo

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:33`, `src/lib/diseno/tokensColor.test.ts:36`, `src/lib/diseno/tokensColor.test.ts:37`, `tests/e2e/accesibilidad.spec.ts:256`, `tests/e2e/accesibilidad.spec.ts:260`
- **Cláusulas sin morder:**
  - And el ratio alcanza al menos 3 en las cinco
  - And el prototipo no declara ninguna regla de foco y ademas suprime el contorno en seis controles, asi que este rol es del repositorio y no se importa
- **Nota:** 'Las cinco variantes declaran ese rol' queda mordida de rebote por la comprobacion de las 100 parejas (--color-foco esta en el inventario). El ratio >= 3 solo se mide en navegador real y SOLO EN LA VARIANTE ACTIVA: tests/e2e/accesibilidad.spec.ts:217-268 (@s39) recorre las 6 rutas, enfoca controles, lee outlineColor con getComputedStyle, muestrea el color realmente pintado con elementFromPoint y calcula el ratio contra los dos fondos adyacentes — medicion excelente, pero el test nunca cambia data-variante, asi que las otras cuatro variantes quedan sin medir. No existe ninguna asercion a nivel de token que recorra las cinco calculando --color-foco contra --color-fondo. La ultima clausula (que el rol es del repositorio y no se importa del prototipo) no tiene asercion alguna: nadie lee el prototipo.

### @s10 — La variante por defecto es la del diseno y esta escrita en un unico sitio

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/contratoRedisenho.test.ts:20`, `src/lib/diseno/contratoRedisenho.test.ts:21`, `src/components/SelectorPaleta-logica.test.ts:109`, `src/components/SelectorPaleta-logica.test.ts:75`, `src/components/SelectorPaleta-logica.test.ts:84`, `src/components/SelectorPaleta.test.tsx:88`, `src/data/variantesPaleta.test.ts:6`
- **Cláusulas sin morder:**
  - And el identificador aparece declarado una sola vez en todo el proyecto
  - And los otros dos puntos que hoy lo repiten lo consumen de esa unica declaracion
- **Nota:** La primera clausula si se muerde por varios sitios: VARIANTE_PREDETERMINADA == 'clinica' (contratoRedisenho.test.ts:20), resolverVarianteInicial(null, catalogo) == 'clinica' con almacenamiento que lanza (SelectorPaleta-logica.test.ts:109) y el atributo real data-variante == 'clinica' tras renderizar sin preferencia (SelectorPaleta.test.tsx:88, valor de atributo, no className). Las dos clausulas de unicidad no tienen NINGUNA asercion, y ademas son falsas hoy: el guion anti-parpadeo de index.html:34 reescribe a mano el catalogo completo ['clinica','calida','tech','eco','marca'] y deriva de el su VARIANTE_POR_DEFECTO (index.html:35), sin ningun test de integridad que compare ese literal con VARIANTES_REDISENO (src/lib/diseno/contratoRedisenho.ts:24) — el unico test que lee index.html?raw para el selector es SelectorPaleta-logica.test.ts:54-69, y solo comprueba el ORDEN del script y que no lleve defer/async/src. Sintoma de que nadie vigila esa copia: el comentario de index.html:31 sigue diciendo que el identificador corrupto 'cae siempre a marca' cuando el codigo ya cae a 'clinica'.

### @s11 — Ninguna de las cinco variantes suspende su matriz de uso de color

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then el veredicto es aprobado para las cinco
  - And el recuento de variantes comprobadas es exactamente 5
  - And con una matriz vacia el veredicto seria suspenso, no aprobado por vacuidad
- **Nota:** El codigo de produccion existe pero esta MUERTO: MATRIZ_DE_USO_MARCA (src/lib/diseno/tokensColor.ts:267), resolverMatrizDeUso (tokensColor.ts:286) y ejecutarComprobacionDeContrasteDeVariantes (tokensColor.ts:313, con su guarda anti-vacuidad en :316) no los importa ni los invoca ningun test ni ningun modulo — grep de los tres identificadores sobre src y tests solo devuelve sus propias definiciones. src/lib/diseno/tokensColor.test.ts no los importa (ver su bloque de import, lineas 3-10). Ademas la matriz declarada es la de una sola variante ('marca', segun su propio comentario en tokensColor.ts:260-266) y contempla 15 roles, no los 18 actuales, asi que aunque se ejecutara no resolveria las cinco variantes tal y como pide el escenario. Cobertura efectiva: cero.

### @s12 — El bloque de emergencia sin JavaScript declara la variante por defecto

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:64`, `src/lib/diseno/tokensColor.test.ts:33`
- **Cláusulas sin morder:**
  - Then declara los mismos valores que la variante "clinica" (solo se comparan 3 de los 20 tokens: fondo, texto y foco; quedan sin asercion fondo-alterno, superficie, superficie-elevada, borde, borde-control, tinta, texto-suave, primario, primario-fuerte, sobre-primario, acento, acento-tinta, acento-suave, urgencia, urgencia-suave, --sombra-reposo y --sombra-elevada)
- **Nota:** Cuidado con la colision de tags: aqui @s12 es el bloque ':root' sin atributo, no el @s12 de sistema_de_diseno_visual.feature que citan las pruebas e2e. La segunda clausula ('ese bloque no cuenta como una sexta variante en el inventario') SI queda mordida, aunque desde el test de @s2: extraerVariantesDeTokens usa el patron PATRON_SELECTOR_VARIANTE (tokensColor.ts:81), que solo casa ':root[data-variante=...]', y tokensColor.test.ts:33 exige toEqual con exactamente los cinco ids. La primera no: el bucle de tokensColor.test.ts:63 recorre solo ['fondo','texto','foco'], asi que desincronizar cualquiera de los otros 17 tokens entre el :root de _tokens.scss:6-27 y el bloque 'clinica' de _tokens.scss:29-51 no rompe nada. La comparacion que si existe es solida (lee los dos bloques del texto real con ?raw, no un className).

### @s13 — La puerta de urgencias ya no prohíbe el token, prohíbe la afirmación falsa

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/contratoRedisenho.test.ts:24`, `src/lib/diseno/rolesDescartados.test.ts:8`, `src/components/InformacionContacto.test.tsx:100`, `src/components/PieDePagina.test.tsx:129`, `src/components/Faq.test.tsx:120`
- **Cláusulas sin morder:**
  - Given el texto real de todos los ficheros de "src" y el contenido del artefacto de producción — ninguna prueba alimenta la puerta con el corpus real. `buscarAfirmacionesClinicasProhibidas` (src/lib/diseno/contratoRedisenho.ts:28) y `ejecutarPuertaDeRolesDescartados` (src/lib/diseno/rolesDescartados.ts:43) se invocan SOLO desde sus propios tests, con literales sintéticos ('Urgencias 24 h', 'tokens.scss', 'Atención 24 h'). Ningún `import.meta.glob('../**/*.{ts,tsx}', ?raw)` ni lectura de `dist/` los alimenta.
  - When se busca cualquiera de esas afirmaciones (sobre el artefacto de producción) — ninguna prueba lee `dist/` en busca de las afirmaciones. `tests/e2e/rediseno-visual.spec.ts` no busca ninguna de las cinco cadenas; `src/lib/diseno/puertaTerceros.test.ts` sí pega CSS real de `dist/`, pero busca dominios de terceros, no afirmaciones clínicas.
  - Then no aparece "24 h" ni "24h" en ningún texto visible — solo hay barridos por componente en jsdom (Cabecera, Hero, InformacionContacto, Faq, PieDePagina, ReservaChat, CampanasPortada, Galeria, Servicios, FormularioContacto), cada uno sobre su propio `container.textContent`. No hay barrido del sitio completo ni de las seis rutas; Landing, PaginaBlog, PaginaCampanas, PaginaTienda y PaginaNoEncontrada quedan sin ninguna aserción de este tipo.
  - And no aparece "365" ni "todos los días del año" ni "siempre hay alguien de guardia" — "siempre hay alguien de guardia" solo se comprueba en src/components/InformacionContacto.test.tsx:111 (un componente); "365" solo en src/components/PieDePagina.test.tsx:129 (limitado al `textContent` de UN enlace) y src/components/Faq.test.tsx:120 (limitado a UNA región). No existe la afirmación agregada del contrato.
  - And el recuento de ficheros efectivamente inspeccionados es mayor que 0 — CERO aserciones. `informe.ficherosInspeccionados` existe en rolesDescartados.ts:70 pero nunca se afirma en rolesDescartados.test.ts; `buscarAfirmacionesClinicasProhibidas` ni siquiera devuelve un recuento.
- **Nota:** La única cláusula realmente mordida es la de fallo cerrado: src/lib/diseno/contratoRedisenho.test.ts:26 comprueba que con la lista vacía la función devuelve el mensaje de error en vez de cero hallazgos. Todo lo demás es lógica pura probada con dobles sintéticos, nunca aplicada al corpus real. Dos señales de que la puerta no corre de verdad: (a) `rolesDescartados.ts:61` fija `tokenAcentoASecasEncontrado = false` en duro — campo muerto que ningún test afirma; (b) el patrón `PATRON_AFIRMACION_DE_URGENCIA_FALSA` (rolesDescartados.ts:30) es un regex global `/gi` reutilizado entre llamadas con `matchAll`, y nada lo ejercita contra ficheros reales. Existe además colisión de tags: @s13 en src/App.tsx.test, Cabecera, CampanasPortada, Faq, FormularioContacto, Galeria, Hero, InformacionContacto, PieDePagina y ReservaChat significa otra cosa en otros contratos.

### @s14 — El único rótulo de urgencias del sitio es el real, con el teléfono real

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/rediseno-visual.spec.ts:46`, `src/components/BarraUrgencias.test.tsx:8`, `src/lib/site.test.tsx:43`, `src/components/PieDePagina.test.tsx:124`, `src/components/Faq.test.tsx:296`
- **Cláusulas sin morder:**
  - When se recorre el texto de las seis rutas buscando la palabra "urgencias" — no existe. El inventario de seis rutas está en tests/e2e/rutas.ts:26, pero la única prueba de navegador que toca urgencias (tests/e2e/rediseno-visual.spec.ts:46) se ejecuta SOLO sobre la portada (`${SUBPATH_DE_PRODUCCION}/`, línea 40) y usa un selector fijo, no un barrido de texto. `grep -rni urgencia tests/e2e/` devuelve exactamente dos líneas, ambas en ese mismo test de portada.
  - Then el rótulo que aparece es exactamente el que declara la fuente única de datos de negocio — en el sitio construido el rótulo se retipea a mano en el selector `aside[aria-label="Urgencias fuera de horario"]` (tests/e2e/rediseno-visual.spec.ts:46): no se compara contra `datosNegocio.telefonoUrgencias.rotulo`. La comparación con la fuente única solo existe en jsdom (src/components/BarraUrgencias.test.tsx:12) y además usa `toHaveTextContent(rotulo ?? '')`, que es subcadena y pasaría con rótulo vacío, no "exactamente".
  - Then el rótulo es el ÚNICO del sitio — ninguna prueba afirma unicidad. src/components/InformacionContacto.test.tsx:114-115 cuenta ocurrencias del número, pero dentro de un solo componente, no del sitio.
  - And el teléfono que lo acompaña es el de urgencias de la fuente única, no el de la clínica ni el móvil — en el sitio construido la única aserción es `toHaveAttribute('href', /^tel:/)` (tests/e2e/rediseno-visual.spec.ts:46), que pasaría igual con `tel:+34910829267` (clínica) o `tel:+34685343149` (móvil). No hay ninguna aserción que excluya esos dos números.
  - And el enlace de llamada se deriva de ese mismo número, sin retipearlo — no se comprueba sobre el sitio construido. En jsdom (src/components/BarraUrgencias.test.tsx:13) sí se compara `href` con `datosNegocio.telefonoUrgencias.enlaceLlamada`, pero eso es un componente aislado, no las seis rutas del artefacto servido; y src/components/PieDePagina.test.tsx:124 usa el literal `'tel:+34918511393'` escrito a mano, que es justo lo contrario de "sin retipearlo".
- **Nota:** Lo que sí muerde de verdad: los valores de la fuente única (src/lib/site.test.tsx:47-49 fija rótulo 'Urgencias fuera de horario', texto '91 851 13 93' y enlace 'tel:+34918511393') y la derivación en el componente BarraUrgencias en jsdom. Lo que el Given exige — sitio construido y servido, seis rutas — solo se cumple en un test de navegador que mira la portada y se conforma con el prefijo `tel:`. Colisión de tags: @s14 en Cabecera.test.tsx:217, App.test.tsx:210, CampanasPortada.test.tsx:194, FormularioContacto.test.tsx:263, Galeria.test.tsx:284, InformacionContacto.test.tsx:266, PieDePagina.test.tsx:301, ReservaChat.test.tsx:316 y SelectorPaleta-logica.test.ts:97 son otros contratos; el `test.describe` de tests/e2e/rediseno-visual.spec.ts:8 cita '@s14' en su título pero no comprueba nada de este escenario más allá de la línea 46.

### @s15 — El acento saturado solo se usa como relleno, nunca como texto ni como borde

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Given el texto real de los ficheros de estilos del inventario de módulos — no hay ninguna prueba que lea los 18 `*.module.scss` en busca de usos de `--color-acento`. Existen barridos reales de esos 18 ficheros (src/lib/diseno/inventarioModulos.test.ts:131, src/lib/diseno/movimientoRespetuoso.test.ts:7, src/lib/diseno/escalaMovimiento.test.ts:20, src/styles/hoja-global.test.ts:33), pero ninguno mira el acento.
  - When se busca cada uso de "--color-acento" — no existe función ni test que clasifique usos por propiedad CSS.
  - Then no aparece como valor de "color" — sin aserción. Y el repositorio LA INCUMPLE hoy: src/components/BarraUrgencias.module.scss:19 y src/components/Hero.module.scss:46 declaran literalmente `color: var(--color-acento);`.
  - And no aparece como valor de "border-color" ni dentro de una declaración abreviada de borde — sin aserción de ningún tipo.
  - And aparece al menos una vez como relleno — sin aserción (de hecho ocurre en src/components/SelectorPaleta.module.scss:69, `background-color: var(--color-acento);`, pero nada lo comprueba).
  - And el recuento de ficheros efectivamente inspeccionados es mayor que 0 — sin aserción.
- **Nota:** Las únicas menciones de `--color-acento` en código de prueba son inventarios de nombres, no de uso: src/lib/diseno/contratoRedisenho.test.ts:15 y src/lib/diseno/tokensColor.test.ts:28 solo comprueban que el nombre está en la lista de 18 roles; src/lib/diseno/rolesDescartados.test.ts:10 lo mete en una cadena sintética para demostrar que la puerta YA NO lo prohíbe. El campo `tokenAcentoASecasEncontrado` de rolesDescartados.ts está cableado a `false` (línea 61) y jamás se afirma. Marco 'ausente' y no 'parcial' porque ninguna de las cuatro cláusulas Then tiene aserción, y además la primera está violada en el código fuente actual: un test honesto de este escenario fallaría en rojo hoy.

### @s16 — Se conserva la mitad buena de la regla anterior sobre el primario fuerte

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/diseno/tokensColor.test.ts:32`, `src/lib/diseno/rolesDescartados.test.ts:27`, `src/lib/diseno/rolesDescartados.test.ts:19`
- **Cláusulas sin morder:**
  - And se usa al menos una vez en algún fichero de estilos del inventario — NO se comprueba contra ficheros reales. `primarioFuerteUsado` (src/lib/diseno/rolesDescartados.ts:63) solo se ejercita con el doble sintético `ESTILOS = [{ ruta: 'boton.scss', contenido: '.boton { background: var(--color-primario-fuerte); }' }]` (rolesDescartados.test.ts:5). Peor: `grep -rn 'var(--color-primario-fuerte)' src --include=*.scss` devuelve UNA sola línea, src/styles/_api.scss:239, que NO pertenece al inventario de módulos (los 18 `components/*.module.scss` + `pages/*.module.scss` que define src/lib/diseno/inventarioModulos.ts:34). Aplicada a los ficheros reales del inventario, esta cláusula fallaría.
  - Given el texto real de los ficheros de estilos del inventario — nunca se alimenta a la puerta. El `Given` de `_tokens.scss` sí se cumple por otra vía (tokensColor.test.ts:13 lo lee con `?raw`), pero la mitad del inventario de estilos no llega a `ejecutarPuertaDeRolesDescartados` en ninguna prueba.
- **Nota:** Cubierto de verdad: 'está declarado en las cinco variantes' — src/lib/diseno/tokensColor.test.ts:32 lee el texto real de `src/styles/_tokens.scss` con `?raw` y afirma `paresComprobados === 100`, `faltantes === []` sobre las 5 variantes × 20 tokens; `primario-fuerte` está en el inventario (src/lib/diseno/tokensColor.ts:55), así que la aserción lo incluye realmente. También cubierto: 'si no se usara, la puerta fallaría' — src/lib/diseno/rolesDescartados.test.ts:27-32 comprueba `primarioFuerteDeclarado === true`, `primarioFuerteUsado === false`, `pasa === false`. Lo que falta es el puente entre la lógica y la realidad: la puerta nunca corre sobre los ficheros del inventario, y si corriera, hoy suspendería.

### @s17 — El contenido tiene un único ancho máximo y es el del diseño

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/layout.spec.ts:43`, `tests/e2e/layout.spec.ts:49`, `tests/e2e/layout.spec.ts:53`, `tests/e2e/layout.spec.ts:58`
- **Cláusulas sin morder:**
  - And ese ancho es 1220 píxeles, el que declara el prototipo
- **Nota:** tests/e2e/layout.spec.ts (describe @s45 de identidad_visual, línea 42) SÍ muerde dos de las tres cláusulas con medida real: a 1600px de ventana recorre las 6 rutas, mide getBoundingClientRect().width de [data-contenedor-principal] (:49), comprueba que el recuento es 6 (:53) y que el Set de anchos tiene tamaño 1 (:58). Pero la única aserción sobre el VALOR es toBeLessThan(1600) (:55): nunca se compara con 1220. El literal 1220 aparece una sola vez en todo el repo, en src/styles/_api.scss:133 ($ancho-maximo-contenedor), y ningún test lo lee ni lo mide. Si el mixin contenedor pasara a 900px o a 1400px, los seis anchos seguirían siendo iguales y menores que 1600, y la puerta seguiría verde. Ojo con la colisión de tags: tests/e2e/rediseno-visual.spec.ts:8 cita '@s17' en el nombre del describe, pero ese bloque solo comprueba overflow horizontal, imágenes rotas y errores de consola — no mide ningún contenedor.

### @s18 — Las dos secciones que el diseño estrecha a propósito lo siguen haciendo

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then los dos son menores que el ancho general del contenedor
  - And cada uno declara su propio ancho máximo, distinto del general y distinto entre sí
- **Nota:** No existe ninguna prueba que mida el ancho del contenido de la sección de bienvenida (#inicio) ni el de preguntas frecuentes (#faq). El único sitio donde se miden anchos de caja en navegador real es tests/e2e/layout.spec.ts:49, y ahí se mide [data-contenedor-principal], no esas dos secciones. Verificado por búsqueda de getBoundingClientRect/boundingBox/getComputedStyle en tests/e2e/*.spec.ts: '#faq' solo aparece en tests/e2e/tokens-aplicados.spec.ts:100, y allí únicamente se lee backgroundColor (:109), nunca width ni max-width. Tampoco hay ningún test de Vitest que lea con ?raw el max-width de Hero.module.scss ni de Faq.module.scss.

### @s19 — El ritmo vertical de las secciones es fluido y alterna, en vez de ser plano

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then a 1440 el relleno de una sección de contenido es mayor que a 320
  - And al menos una sección declara un relleno vertical menor que las demás, como hace el prototipo con la de campañas
  - And ninguna sección conserva el relleno plano de 64 píxeles en los dos extremos
- **Nota:** Ninguna prueba lee padding en ningún sitio. Búsqueda de 'padding'/'relleno' en tests/e2e/*.spec.ts: el único acierto es un comentario en tests/e2e/accesibilidad.spec.ts:176 sobre el anillo de foco. Nadie carga la portada a 320 y a 1440 para comparar paddingBlock computado, ni compara el relleno de la sección de campañas con el de las demás, ni comprueba que ninguna sección se quede en 64px planos. tests/e2e/tokens-aplicados.spec.ts:99-131 recorre las 8 secciones de la portada, pero solo para leer backgroundColor (ritmo de COLOR, @s26 de identidad_visual), no relleno vertical.

### @s20 — Los dos pasos altos de la escala tipográfica son fluidos y alcanzan los extremos del diseño

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then a 320 mide el mínimo que declara el prototipo
  - And a 1220 mide el máximo que declara el prototipo
  - And lo mismo ocurre con el titular de sección, con sus propios dos extremos
  - And los seis pasos inferiores de la escala siguen siendo tamaños fijos, sin tocar
- **Nota:** No hay ninguna medida de fontSize computado en navegador real, en ningún ancho. tests/e2e/tipografia.spec.ts solo lee fontFamily (:19, :20, :49) y altos de caja del h1 con y sin fuente (:107-128); nunca fontSize. src/lib/diseno/escalaTipografica.test.ts no vale para este escenario: prueba el modelo de TypeScript (src/lib/diseno/escalaTipografica.ts), que devuelve minPx === maxPx para TODOS los pasos (comprobado explícitamente en :86) — es decir, modela una escala NO fluida, justo lo contrario de lo que exige @s20, y además usa 1024 como viewport máximo, no 1220. Los dos clamp() reales viven solo en src/styles/_api.scss:35-36 (clamp(28px, 4.2vw, 46px) y clamp(33px, 6.4vw, 68px)) y ningún test lee ese texto: los únicos ficheros que leen _api.scss con ?raw son src/styles/tokens-api.test.ts (solo comprueba que existan 4 nombres de @function/@mixin, :46-57), src/styles/movimiento-global.test.ts (solo transiciones) y tests/e2e/layout.spec.ts:145-147 (solo el mixin tarjeta). Nadie verifica tampoco que los seis pasos inferiores sigan fijos. Ojo: tests/e2e/rediseno-visual.spec.ts:8 cita '@s20' en el nombre del describe sin medir ni un tamaño de fuente.

### @s21 — Los titulares tienen el peso y el tracking óptico del diseño

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/rediseno-visual.spec.ts:43`
- **Cláusulas sin morder:**
  - And el titular de portada declara un espaciado entre letras negativo
  - And el titular de sección declara un espaciado entre letras negativo, menor en valor absoluto que el de la portada
  - Then el peso es 600, no 700 (parcialmente: solo se muerde el h1 de la portada; los titulares de las otras cinco rutas y los titulares de sección quedan sin medir)
- **Nota:** La única aserción real es tests/e2e/rediseno-visual.spec.ts:43, toHaveCSS('font-weight','600') sobre el h1 dentro de #inicio de la portada. Es medida de navegador real y sí distingue 600 de 700, pero el When exige leer 'los titulares de las seis rutas' y solo se cubre uno de una. Sobre letter-spacing NO hay ninguna aserción en todo el repo: búsqueda de letter-spacing/letterSpacing en src/**/*.test.ts(x) y tests/e2e/*.spec.ts devuelve cero aciertos reales (el único match es el volcado de CSS de terceros en src/lib/diseno/puertaTerceros.test.ts:13, que es un fixture de texto, no una aserción sobre estos valores). Los valores existen en src/styles/global.scss:177 (-0.015em, todos los titulares) y :182 (-0.02em, h1), pero ningún test los lee ni con getComputedStyle ni con ?raw, así que nadie comprueba que sean negativos ni la relación de valor absoluto entre los dos.

### @s22 — Los titulares declaran su propio interlineado en vez de heredar el del cuerpo

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then en ningún nivel de titular esa razón es la del cuerpo del documento
  - And en todos los niveles la razón es menor que la del cuerpo
  - And el recuento de niveles de titular efectivamente medidos es mayor que 0
- **Nota:** No existe ninguna prueba que calcule la razón lineHeight/fontSize de ningún titular. Búsqueda de line-height/lineHeight en pruebas: src/lib/diseno/hojaGlobal.test.ts:149 y :219 son cadenas de FIXTURES sintéticos ('  line-height: 1.5;') dentro de casos construidos a mano, no medidas del documento real; src/styles/hoja-global.test.ts:196-197 solo mira los rangos font-weight de los dos @font-face. Los valores reales viven en src/styles/global.scss:122 (body 1.5) y :178 (h1-h6 1.08) y ningún test los lee ni los compara. Sin medida en navegador real, ninguna de las tres cláusulas está mordida.

### @s23 — La escala de radios cubre el vocabulario de formas del diseño

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then hay más de tres valores distintos en uso
  - And existe un radio de píldora, un radio de círculo, un radio de tarjeta, un radio de campo de formulario y un radio de etiqueta
  - And cada radio de la escala se deriva de la escala de espaciado o es un mecanismo de CSS, nunca un número copiado del prototipo
- **Nota:** Cero pruebas sobre radios. Búsqueda de borderRadius/border-radius/'radio-' en src/**/*.test.ts(x) y tests/e2e/*.spec.ts: el único acierto es src/lib/puertaLiteralesColor.test.ts:22, una cadena de fixture sintético para la puerta de literales de color, sin relación con este escenario. La escala real existe en src/styles/_api.scss:106-110 ($radio-pequeno..$radio-circulo, derivados de espaciado(4)/(12)/(24) más 999px y 50%), pero ningún test lee ese texto para comprobar la derivación, y ningún test de navegador cuenta cuántos valores de border-radius pinta el sitio de verdad ni identifica píldora/círculo/tarjeta/campo/etiqueta. src/styles/tokens-api.test.ts solo comprueba la existencia de cuatro nombres de @function/@mixin (paso-tipografico, espaciado, foco-visible, area-tactil-minima), ninguno de radio.

### @s24 — El sistema tiene tres niveles de elevación y los usa

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then hay al menos dos valores distintos en uso, además del estado sin sombra
  - And la sombra de reposo se usa en más elementos que la elevada
  - And al menos un elemento sube de la sombra de reposo a la elevada al pasar el puntero por encima
- **Nota:** Lo único que existe sobre sombras son recuentos de TOKENS DECLARADOS, no de sombras pintadas: src/lib/diseno/contratoRedisenho.test.ts:11-17 (ROLES_DE_SOMBRA_REDISENO tiene longitud 2) y src/lib/diseno/tokensColor.test.ts:26 (dos tokens que empiezan por '--sombra-') y :69 (el valor textual de --sombra-elevada en la variante tech). Ninguno de esos toca el DOM real. Ninguna prueba de navegador lee boxShadow computado, ni cuenta valores distintos en uso, ni compara cuántos elementos usan reposo frente a elevada, ni dispara :hover para ver la subida de elevación. El mecanismo existe en src/styles/_api.scss:171-187 (mixin tarjeta: box-shadow var(--sombra-reposo) y :hover a var(--sombra-elevada)), pero está sin puerta: tests/e2e/layout.spec.ts:145-147 lee ese mismo mixin y solo comprueba que no fije 'height'.

### @s25 — Los controles de formulario alcanzan la altura del diseño

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/accesibilidad.spec.ts:75`, `tests/e2e/accesibilidad.spec.ts:91`, `src/lib/accesibilidad-areaTactil.test.ts:15`
- **Cláusulas sin morder:**
  - Then ninguno mide menos de 44 píxeles de alto
  - And la casilla de consentimiento queda alineada con la primera línea de su etiqueta
- **Nota:** Solo la tercera cláusula está mordida: tests/e2e/accesibilidad.spec.ts:75-92 recorre las 6 rutas, mide boundingBox() de cada control visible y exige >= 24x24 px CSS (:91), con el mínimo escrito a mano en src/lib/accesibilidad-areaTactil.test.ts:15 — eso es exactamente 'el mínimo de área táctil que ya exigía el contrato anterior'. Pero 24 no es 44: el literal 44 no aparece como umbral en ninguna prueba (los únicos '44' en pruebas son el teléfono '918 44 21 60' y datos de ejemplo con anchoPx/altoPx 44 en src/lib/accesibilidad-areaTactil.test.ts:28 y :62, que son ENTRADAS de un caso conforme, no un umbral exigido). Nadie mide específicamente los campos, desplegables y botones de #contacto y #reservar contra 44px de alto: tests/e2e/tipografia.spec.ts:41-53 sí recorre 'input, textarea, select, button' de esas dos zonas, pero solo lee fontFamily. Y no hay ninguna aserción sobre la alineación de la casilla de consentimiento con la primera línea de su etiqueta (búsqueda de 'consentimiento'/'checkbox' en tests/e2e: cero aciertos).

### @s26 — El punto de corte de la navegación sube y sigue coincidiendo en JavaScript y en CSS

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/accesibilidad.spec.ts:378`, `tests/e2e/accesibilidad.spec.ts:381`, `tests/e2e/accesibilidad.spec.ts:385`, `tests/e2e/accesibilidad.spec.ts:389`, `tests/e2e/accesibilidad.spec.ts:405`, `src/lib/diseno/puntoDeCorte.test.ts:14`, `src/lib/diseno/puntoDeCorte.test.ts:19`
- **Cláusulas sin morder:**
  - And en el punto de corte ningún elemento de la cabecera se desborda ni se superpone con otro, con la barra de urgencias y los dos botones nuevos ya presentes
- **Nota:** Las tres primeras cláusulas sí tienen aserción real. tests/e2e/accesibilidad.spec.ts:378-386 carga la portada a 1024 y a 1023 en navegador real y comprueba visibilidad de la navegación y del botón 'Abrir menú' en cada lado. src/lib/diseno/puntoDeCorte.test.ts:14-20 lee el TEXTO REAL de src/components/Cabecera.module.scss con ?raw, extrae los @media y exige que el único punto de corte declarado sea PUNTO_DE_CORTE_NAVEGACION_PX (importado, no retipeado) — eso muerde 'el mismo valor en la lógica y en la hoja de estilos'. La cuarta cláusula NO está cubierta en su premisa: tests/e2e/accesibilidad.spec.ts:389-411 comprueba desbordamiento y superposición de los hijos directos de <header> a 1024 y 1023, pero hoy src/components/Cabecera.tsx solo renderiza el bloque de identidad y, según el ancho, la nav o el botón de menú — no existe control de urgencias ni acceso a la tienda, y la barra de urgencias es un <aside> FUERA del <header> (tests/e2e/rediseno-visual.spec.ts:46), así que ningún test la incluye en la medida de solapes. Es decir, la comprobación pasa sobre una cabecera vacía de los elementos que el escenario exige presentes: verde por vacuidad. Advertencia adicional sobre la premisa 'sube': el punto de corte sigue en 1024 (src/components/Cabecera-logica.ts:10) y src/components/Cabecera-logica.test.ts:6-7 lo CLAVA con expect(...).toBe(1024) y expect(...).not.toBe(1120), y el e2e hardcodea 1024/1023 en vez de importar la constante.

### @s27 — La portada abre con una barra de urgencias fija, con el dato real

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/BarraUrgencias.test.tsx:8`, `src/components/BarraUrgencias.test.tsx:12`, `src/components/BarraUrgencias.test.tsx:13`, `tests/e2e/rediseno-visual.spec.ts:46`, `src/lib/diseno/movimientoRespetuoso.test.ts:5`
- **Cláusulas sin morder:**
  - Then existe una barra por encima de la cabecera
  - And su fondo es el color de urgencia de la variante activa, resuelto desde el token
- **Nota:** Solo muerden los dos datos: BarraUrgencias.test.tsx:12 compara el texto con datosNegocio.telefonoUrgencias.rotulo y :13 el href con enlaceLlamada (valores de datos reales); tests/e2e/rediseno-visual.spec.ts:46 confirma en el artefacto construido que aside[aria-label='Urgencias fuera de horario'] tiene un enlace tel:. El pulso queda mordido de forma genérica por src/lib/diseno/movimientoRespetuoso.test.ts:5, que lee el texto real de todos los components/*.module.scss y exige que toda animation/transition viva dentro de prefers-reduced-motion (la animación 'pulso' de src/components/BarraUrgencias.module.scss:22 está dentro de no-preference). NADA mide la posición de la barra respecto a la cabecera (ni en jsdom ni en navegador: src/App.test.tsx:48 solo compara logotipo vs contentinfo) ni lee el fondo computado contra el token --color-urgencia. tests/e2e/movimiento.spec.ts no sirve de apoyo: en su línea 28 pulsa un botón 'Marca en oscuro' que ya no existe en el catálogo de cinco variantes.

### @s28 — La cabecera lleva la navegación, el acceso a urgencias y el acceso a la tienda

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/Cabecera.test.tsx:51`, `src/components/Cabecera.test.tsx:65`, `src/styles/hoja-global.test.ts:92`
- **Cláusulas sin morder:**
  - And muestra un control de urgencias con el color de urgencia de la variante activa
  - And muestra un acceso a la tienda con borde y sin relleno
  - And la cabecera se mantiene visible al desplazar la página
  - And el sitio del ancla de destino al saltar a una sección se calcula desde la altura real de la cabecera más la barra de urgencias, no desde un número escrito a mano
- **Nota:** Solo la primera cláusula está mordida: src/components/Cabecera.test.tsx:51 exige los 8 nombres accesibles en orden dentro de nav 'Navegación principal' y :65 el destino exacto de cada uno. El resto no tiene asercion y ademas contradice al codigo: src/components/Cabecera.tsx no renderiza ningun control de urgencias ni boton de tienda (solo el enlace de nav 'Tienda'), y src/components/Cabecera.test.tsx:204 afirma justo lo contrario del contrato nuevo (sin 'Urgencias' y sin ningun href tel: en la cabecera). Nadie mide position:fixed ni la visibilidad tras desplazar. Para el ancla, src/styles/hoja-global.test.ts:92-127 solo comprueba que scroll-padding-top usa UNA variable (no un numero) y que esa variable es la de la altura de la cabecera; el valor real (src/styles/global.scss:243) es calc(var(--altura-cabecera) + espaciado(16)) y NO suma --altura-barra-urgencias, asi que la clausula tal como la escribe este contrato no esta ni implementada ni probada.

### @s29 — La sección de bienvenida se pinta sobre una fotografía a sangre

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/imagenes.spec.ts:24`, `tests/e2e/imagenes.spec.ts:150`, `tests/e2e/imagenes.spec.ts:186`, `tests/e2e/rediseno-visual.spec.ts:38`, `src/lib/diseno/inventarioModulos.test.ts:131`
- **Cláusulas sin morder:**
  - And la imagen queda cubierta por un velo cuyos colores salen de tokens, nunca de un hexadecimal escrito a mano
  - And el texto que va encima alcanza el mínimo de contraste de texto normal contra el velo
- **Nota:** La primera cláusula queda medio mordida: tests/e2e/imagenes.spec.ts:37-39 mide naturalWidth > 0 de TODA imagen de las 6 rutas (incluida la del hero) y tests/e2e/rediseno-visual.spec.ts:44 exige exactamente 1 img dentro de #inicio; nadie comprueba un código HTTP 200 para esa imagen (los status 200 de imagenes.spec.ts solo se piden a favicon y og:image). La última cláusula sí está cubierta con medición real: tests/e2e/imagenes.spec.ts:166-177 exige width+height declarados en todas las imágenes y CLS <= 0.1 en las 6 rutas, y :217-222 mide, con /img/ bloqueado, alto > 0 y relación de aspecto conservada. Del velo solo se muerde media clausula por via indirecta: src/lib/diseno/inventarioModulos.test.ts:131-146 pasa la puerta de literales de color sobre los 18 module.scss reales, lo que impide un hexadecimal escrito a mano en src/components/Hero.module.scss, pero ningun test comprueba que el ::after exista ni que cubra la imagen. Del contraste del texto sobre el velo no hay nada: src/lib/tokens.ts:23 declara solo 5 parejas de marca y ninguna es texto-sobre-velo, y ninguna prueba de navegador mide ese ratio.

### @s30 — La bienvenida lleva la píldora de ubicación, los dos botones y la banda de cuatro cifras

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/Hero.test.tsx:11`, `src/components/Hero.test.tsx:41`, `src/components/Hero.test.tsx:49`, `src/components/Hero.test.tsx:85`, `src/components/Hero-logica.test.ts:5`
- **Cláusulas sin morder:**
  - And debajo hay una banda separada por una línea, con exactamente cuatro cifras
  - And cada una de las cuatro se deriva de la fuente única de datos o del catálogo de servicios, ninguna escrita a mano
- **Nota:** Cubiertas: la ubicación (src/components/Hero.test.tsx:18 exige el texto 'Galapagar · Madrid'), el botón de reserva (:45, href '#reservar'), el de llamada (:53, href 'tel:+34910829267' y :65 la coherencia dígito a dígito) y la última cláusula por denylist (:89 comprueba que no aparecen '12 años', '8.400', '327', '4,9', '4,6', 'reseñas' ni '★'). Sin morder: NINGÚN test cuenta las cuatro cifras efectivamente renderizadas por src/components/Hero.tsx:73-80 ni comprueba la línea que separa la banda (border-block-start vive solo en Hero.module.scss:94, sin asercion). src/components/Hero-logica.test.ts:5 prueba que construirCifrasBienvenida deriva 4 valores de las longitudes de sus 4 argumentos sinteticos, pero nadie comprueba que Hero le pase SERVICIOS/EQUIPO/GALERIA/horario reales, que es justo lo que exige 'ninguna escrita a mano'.

### @s31 — Cada tarjeta de servicio lleva su fotografía y su píldora de categoría

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/Servicios.test.tsx:89`, `src/components/Servicios.test.tsx:400`, `tests/e2e/imagenes.spec.ts:24`, `tests/e2e/imagenes.spec.ts:150`, `tests/e2e/layout.spec.ts:104`, `tests/e2e/rediseno-visual.spec.ts:38`
- **Cláusulas sin morder:**
  - And la relación de aspecto de esa imagen es la del prototipo
  - And sobre la imagen hay una píldora de categoría derivada del propio título del bloque
  - And el pie de la tarjeta lleva el control de desplegar, separado por una línea y anclado abajo
- **Nota:** Cubiertas: el recuento de tarjetas (src/components/Servicios.test.tsx:96 exige exactamente los 5 títulos en orden y tests/e2e/rediseno-visual.spec.ts:45 exactamente 5 img en #servicios); la imagen por tarjeta con dimensiones declaradas (src/components/Servicios.test.tsx:405-419 más tests/e2e/imagenes.spec.ts:167-170, que exige width y height no nulos en toda imagen de las 6 rutas; el 'código 200' se sustituye por naturalWidth > 0 en imagenes.spec.ts:37-39, no hay comprobación de status); y los pies alineados por fila, medidos de verdad en tests/e2e/layout.spec.ts:130-139 sobre 'section[data-contenedor-principal] > article' de la portada, que es exactamente la rejilla de Servicios. Sin morder: nadie compara la relación de aspecto con la del prototipo (imagenes.spec.ts:220 solo compara la medida con la declarada por el propio elemento, es autoconsistente); la píldora de categoría NO se deriva del título — src/components/Servicios.tsx:26 pinta el literal fijo 'Atención veterinaria' y src/components/Servicios.test.tsx:120 lo afirma tal cual, así que la cláusula está contradicha, no probada; y no hay asercion sobre la línea separadora ni sobre el anclaje abajo del pie.

### @s32 — Cada tarjeta del equipo lleva un avatar de iniciales, nunca una fotografía

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/Equipo.test.tsx:34`, `src/components/Equipo.test.tsx:53`, `src/components/Equipo.test.tsx:65`, `src/components/Equipo.test.tsx:120`, `src/components/Equipo.test.tsx:180`
- **Cláusulas sin morder:**
  - And cada tarjeta muestra un avatar con las iniciales del nombre real, sobre el acento suave de la variante
- **Nota:** Cubiertas: nombre y rol reales (src/components/Equipo.test.tsx:42-49), ficha ampliada solo con formación publicada (:70 y :124-130, que exige exactamente 1 botón y que la tarjeta sin formación se limite a 'Joaquín HerranzAuxiliar'), y ausencia de colegiado/idiomas (:59-61). 'No hay ni una sola imagen' se apoya en :184, que cuenta queryAllByRole('img') === 0 — asercion real, aunque un <img alt=""> decorativo tiene rol de presentación y no caería en ese contador. Sin morder por completo: la función inicialesDe vive en src/components/Equipo.tsx:15 (fuera de *-logica.ts, o sea tampoco la muta Stryker) y NINGÚN test comprueba que la tarjeta pinte 'MP'/'JH' ni que el avatar use --color-acento-suave; grep de 'inicial|avatar' sobre todo src y tests no devuelve ni una asercion.

### @s33 — Cada sección de la portada abre con su cintillo en versalitas

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then cada una lleva por delante un rótulo corto en mayúsculas con espaciado entre letras
  - And ese rótulo usa el color de acento tinta de la variante activa
  - And el rótulo no es un encabezado, para no romper la jerarquía de niveles
  - And el recuento de secciones efectivamente comprobadas es mayor que 0
- **Nota:** No existe ninguna prueba, en ningún nivel. El mixin eyebrow (src/styles/_api.scss:324, con text-transform/letter-spacing y --color-acento-tinta) solo lo aplican hoy src/components/Hero.module.scss:44, src/components/ReservaChat.module.scss:34 y src/pages/PaginaTienda.module.scss:64, y ningún test lee ese texto ni mide nada en navegador. En jsdom un cintillo sería además incomprobable por clase (CSS Modules desactivados). Tampoco existe el contador 'secciones comprobadas > 0' que la cuarta cláusula exige explícitamente: el grep de 'recuento' devuelve contadores para rutas, familias tipográficas, parejas de contraste y escenarios heredados, ninguno para cintillos.

### @s34 — La reserva por chat se presenta en dos columnas, con la cabecera de conversación del diseño

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/ReservaChat.test.tsx:383`
- **Cláusulas sin morder:**
  - Then a la izquierda hay un texto con su cintillo, su titular y una lista de ventajas con marcas de verificación
  - And a la derecha hay un panel de conversación con esquina redondeada y sombra
  - And el panel abre con un avatar circular, el nombre comercial real y un indicador de disponibilidad
- **Nota:** Solo la última cláusula está mordida: src/components/ReservaChat.test.tsx:383-400 comprueba que el aviso 'Demostración: esta solicitud no se envía a ningún servidor…' se ve en el paso servicio, en el final y en la derivación a urgencias. Las tres primeras no tienen asercion y varias están contradichas por el código o por los propios tests: no existe ninguna 'lista de ventajas con marcas de verificación' (src/components/ReservaChat.tsx:128-132 pinta el horario), el nombre del panel es el literal <p>Galapavet</p> (:139) y no datosNegocio.identidad.nombreComercial, no hay indicador de disponibilidad alguno — y ese mismo test :384 afirma explícitamente 'no hay indicador "en línea"'. Las dos columnas, el radio y la sombra viven solo en ReservaChat.module.scss (grid + mixin tarjeta) y nadie los mide en navegador real.

### @s35 — La galería es un carrusel con anclaje de desplazamiento y controles propios

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/Galeria.test.tsx:58`, `src/components/Galeria.test.tsx:77`, `src/components/Galeria.test.tsx:97`, `src/components/Galeria.test.tsx:260`, `src/components/Galeria.test.tsx:133`
- **Cláusulas sin morder:**
  - Then las fichas se disponen en una pista que se desplaza en horizontal
  - And la pista declara anclaje de desplazamiento
- **Nota:** Cubiertas: los dos controles con nombre accesible (src/components/Galeria.test.tsx:101-112, que además exige que el nombre no venga solo del glifo), la imagen+nombre+pie de cada ficha (:59-75 y :78-95) y el aviso de demostración (:261-272, incluido su papel de aria-describedby). Sin morder: el anclaje de desplazamiento — 'scroll-snap-type: x proximity' vive en src/components/Galeria.module.scss:38 y el grep de 'scroll-snap|proximity' no encuentra NINGUNA asercion (la única aparición fuera del .scss es un literal de fixture en src/lib/diseno/puertaTerceros.test.ts:13). La disposición horizontal tampoco: src/components/Galeria.test.tsx:133-166 solo comprueba que se llame a scrollBy con un 'left' positivo/negativo sobre una pista mockeada en jsdom (sin layout, con el ancho de la figura falsificado), nunca que overflow-x/flex coloquen las fichas en horizontal en un navegador real.

### @s36 — La sección de contacto lleva el formulario, la tarjeta de urgencias y el mapa con los cuatro bloques de datos

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/pages/Landing.test.tsx:107`, `src/components/InformacionContacto.test.tsx:13`, `src/components/InformacionContacto.test.tsx:82`, `src/components/InformacionContacto.test.tsx:118`, `src/components/InformacionContacto.test.tsx:138`
- **Cláusulas sin morder:**
  - Then a la izquierda hay una tarjeta con el formulario
  - And a la derecha hay una tarjeta con el color de urgencia, el rótulo real y un botón de llamada
  - And debajo hay una tarjeta con el mapa y los bloques de datos que el cliente sí publica
  - And cada rótulo de bloque va en versalitas con el color de acento tinta
- **Nota:** Solo 'no aparece ningún bloque de correo electrónico' está mordida entera: src/components/InformacionContacto.test.tsx:118-137 exige que no exista grupo Email/Correo, ni enlace mailto:, ni arroba en el texto. Las otras cuatro quedan a medias o sin nada. De la izquierda/derecha/debajo solo hay ORDEN de documento, nunca posición medida: src/pages/Landing.test.tsx:113-115 comprueba que el form 'Escríbenos' aparece antes que la región 'Información de contacto'. De la tarjeta de urgencias se muerden el rótulo y la llamada (InformacionContacto.test.tsx:82-98: exactamente 1 enlace, nombre y href exactos) pero NO el color de urgencia (ninguna lectura de --color-urgencia). Del bloque de mapa+datos se muerden los 4 grupos en orden (:14-30) y el iframe con su título (:139-161), pero ese mismo test afirma que el mapa va ANTES de los grupos, no 'debajo'. Y de las versalitas con acento tinta no hay nada: los rótulos son aria-label de fieldset sin leyenda visible, y ningún test lee color ni text-transform.

### @s37 — El selector de paleta ofrece las cinco variantes y sus muestras salen de los tokens

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/SelectorPaleta.test.tsx:24`, `src/components/SelectorPaleta.test.tsx:82`, `src/components/SelectorPaleta.test.tsx:104`, `src/components/SelectorPaleta.test.tsx:122`, `src/components/SelectorPaleta.test.tsx:136`, `src/data/variantesPaleta.test.ts:5`, `tests/e2e/rediseno-visual.spec.ts:55`
- **Cláusulas sin morder:**
  - And las muestras de color de cada variante se leen de los tokens de esa variante, no de una lista escrita aparte
- **Nota:** Cubiertas: las cinco variantes (src/components/SelectorPaleta.test.tsx:25-44 lista los 5 nombres y src/data/variantesPaleta.test.ts:5 el catálogo), la coincidencia entre la marcada como activa y el data-variante del documento (:83-103 sin preferencia guardada, :105-121 al elegir 'Tech', y tests/e2e/rediseno-visual.spec.ts:60-64 en navegador real para las cinco), y aplicar+recordar (:123-135 comprueba que localStorage guarde solo 'galapavet-variante' = 'tech'; :137-149 que con 'eco' guardado arranque en 'eco'). Sin morder: las muestras. src/components/SelectorPaleta.test.tsx:62-81 solo cuenta 3 <span> aria-hidden por botón; nadie lee su background computado ni lo compara con el token de ESA variante. Además el CSS lo desmiente: src/components/SelectorPaleta.module.scss:64-74 pinta las tres muestras con var(--color-primario)/--color-acento/--color-urgencia de la variante ACTIVA, y el atributo data-muestra-variante que pone SelectorPaleta.tsx:46 no lo usa ninguna regla.

### @s38 — La tienda adopta el lenguaje visual del diseño sin cambiar su catálogo

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/pages/PaginaTienda.test.tsx:90`, `src/pages/PaginaTienda.test.tsx:124`, `src/pages/PaginaTienda.test.tsx:150`, `src/pages/PaginaTienda.test.tsx:557`, `tests/e2e/imagenes.spec.ts:152`
- **Cláusulas sin morder:**
  - Then el encabezado de página lleva su cintillo y su titular con el ritmo del sistema
  - And cada tarjeta de producto usa el mismo patrón de tarjeta que la portada
  - And la imagen de cada producto conserva su relación de aspecto y sus dimensiones declaradas
- **Nota:** Cubierto de verdad solo el bloque de catálogo/precio. PaginaTienda.test.tsx:124 fija los 8 nombres de producto y sus categorías EN ORDEN y :150 los 8 importes literales ('Importe de ejemplo: 12,50 €'...), y :90 cuenta 8 tarjetas: eso muerde entera la cláusula 'el catálogo tiene exactamente los mismos productos que antes de este rediseño' (valores de datos, no className). PaginaTienda.test.tsx:557 (@s3 de pagina_tienda.feature) muerde 'el rótulo de precio de ejemplo sigue siendo inequívoco': recorre todo <p> con '€' y exige prefijo 'Importe/Subtotal/Total de ejemplo', y prohíbe 'Precio', 'PVP', 'Total a pagar', '%'. — Cintillo: NO existe ni en producción. src/pages/PaginaTienda.tsx pinta '<h1>Tienda</h1>' seguido del párrafo de aviso, sin ningún elemento de cintillo; PaginaTienda.module.scss aplica @include eyebrow solo a '> li > p:first-of-type' (la categoría DENTRO de la tarjeta de producto), nunca al encabezado de página. Ninguna prueba busca un cintillo de encabezado ni mide el 'ritmo del sistema' (espaciado/paso tipográfico) de ese encabezado. — Patrón de tarjeta: ninguna prueba compara la tarjeta de tienda con la de la portada. Lo más cercano es tests/e2e/layout.spec.ts:105 (@s47 de identidad_visual), que mide en navegador real la alineación de los pies DENTRO de cada rejilla por separado y lee el texto de '@mixin tarjeta' de _api.scss solo para negar un 'height' fijo; no afirma en ningún momento que la rejilla de tienda y la de la portada usen el mismo patrón. Tampoco hay ningún test que lea PaginaTienda.module.scss y compruebe el '@include tarjeta' (grep de 'tarjeta'/'eyebrow'/'prosa' sobre todos los .test.ts/.test.tsx/.spec.ts: solo aparece en layout.spec.ts:142,146). — Imagen: tests/e2e/imagenes.spec.ts:152 recorre las 6 rutas (incluida /tienda) y solo exige que los atributos width/height NO sean null, más loading/decoding y CLS<=0.1; no fija los valores 800×600 que declara PaginaTienda.tsx ni comprueba relación de aspecto alguna. La ÚNICA medida real de relación de aspecto es imagenes.spec.ts:187, y navega exclusivamente a '/' (la portada), nunca a /tienda. En Vitest no hay una sola aserción sobre width/height en PaginaTienda.test.tsx (grep de 'width|height|800|600' sobre sus 736 líneas: 0 coincidencias).

### @s39 — La página de campañas adopta el lenguaje visual sin declarar precios

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/pages/PaginaCampanas.test.tsx:541`, `src/pages/PaginaCampanas.test.tsx:595`, `src/pages/PaginaCampanas.test.tsx:165`, `src/pages/PaginaCampanas-logica.test.ts:11`, `src/pages/PaginaCampanas-logica.test.ts:34`, `src/pages/PaginaCampanas-logica.test.ts:59`
- **Cláusulas sin morder:**
  - Then el encabezado de página lleva su cintillo y su titular
  - And cada ficha usa el patrón de tarjeta del sistema
- **Nota:** Las dos cláusulas de contenido sí están mordidas por texto renderizado real, no por className. 'Ninguna ficha muestra precio, plazas ni vigencia': PaginaCampanas.test.tsx:541 navega a /campanas y sobre el textContent del <main> del listado prohíbe todo lenguaje de precio y exige 0 elementos con texto exacto 'Precio'; :595 prohíbe los 12 meses, 'Hasta el', 'Todo el año', 'Empieza en', los patrones dd/mm/aaaa y /20\d{2}/, y exige 0 elementos con texto exacto 'Vigencia' y 0 con 'Plazas'. Reforzado por las guardas de fallo cerrado sobre los DATOS en PaginaCampanas-logica.test.ts:11 (precio), :34 (vigencia) y :59 (plazas), que exigen que construirCatalogoCampanas lance con mensaje concreto. 'El aviso de contenido de demostración sigue presente': PaginaCampanas.test.tsx:165 comprueba que el aviso literal aparece exactamente una vez y ANTES de la primera tarjeta (compareDocumentPosition). — Cintillo: no existe. src/pages/PaginaCampanas.tsx:68-70 pinta '<h1>{TITULO_LISTADO}</h1>' y a continuación el párrafo de aviso; el '<span>Demostración</span>' de :47/:180/:232 es una píldora (@include pildora-etiqueta en PaginaCampanas.module.scss), no un cintillo de encabezado, y ningún test lo interpreta como tal ni exige un cintillo. — Patrón de tarjeta: PaginaCampanas.module.scss sí hace '@include tarjeta' en "ul[aria-label='Listado de campañas'] li", pero ninguna prueba lo lee ni lo mide. En jsdom los CSS Modules están desactivados, y en navegador real ninguna spec de tests/e2e toca /campanas más allá de overflow, consola, imágenes rotas, tipografía y márgenes; tests/e2e/layout.spec.ts:105 solo mide las rejillas de servicios y de tienda, nunca la de campañas.

### @s40 — El blog adopta el lenguaje visual y conserva su prosa

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/pages/PaginaBlog.test.tsx:106`, `src/pages/PaginaBlog.test.tsx:351`
- **Cláusulas sin morder:**
  - Then el listado usa el patrón de tarjeta del sistema, con imagen y categoría
  - And el artículo abierto conserva su ancho de lectura y su interlineado de prosa
- **Nota:** Solo la tercera cláusula está mordida: PaginaBlog.test.tsx:106 exige el aviso literal visible y único en el listado, antes del primer enlace de artículo, y :351 lo exige otra vez en la vista de artículo, carácter por carácter igual y antes del primer párrafo del cuerpo. — CONFLICTO ACTIVO en la primera cláusula, no solo ausencia de prueba: la tarjeta del listado (src/pages/PaginaBlog.tsx:52-60) pinta únicamente '<span>{DISTINTIVO_DEMOSTRACION}</span>' (el texto es 'Demostración', NO la categoría) y un '<h2>', sin ningún '<img>'; y existe un test verde que lo BLINDA así — src/pages/PaginaBlog.test.tsx:160 (@s6 de pagina_blog.feature) afirma expect(main.querySelectorAll('img')).toHaveLength(0) sobre el listado. Es decir, 'con imagen' no solo no está probado: está prohibido por una prueba viva, y añadirlo pondría en rojo esa suite. 'Con categoría' tampoco está probado: PaginaBlog.test.tsx:142 (@s5) exige las 6 marcas 'Demostración' y ningún otro distintivo, lo que apunta en dirección contraria. PaginaBlog.module.scss aplica '@include tarjeta' al li del listado, pero ningún test lee ese fichero ni mide la tarjeta en navegador. — Ancho de lectura e interlineado de prosa: cero cobertura. PaginaBlog.module.scss declara 'max-width: 760px' y '@include prosa' sobre '> article', pero un grep de '760', '1.8', 'line-height', 'lineHeight', 'max-width', 'maxWidth', 'interlineado' y 'ancho de lectura' sobre todos los .test.ts/.test.tsx/.spec.ts no devuelve ninguna aserción sobre el artículo: ni getComputedStyle en Playwright (ningún spec de tests/e2e mide line-height ni anchos de /blog/demo-N; solo overflow, consola, imágenes y tipografía), ni rectángulo medido, ni lectura con ?raw del módulo SCSS. El único 'interlineado' probado es el del <body> en src/lib/diseno/hojaGlobal.test.ts:128, que es otra cosa (la línea 1.5 general, precisamente la que el mixin 'prosa' sustituye).

### @s41 — El prototipo versionado es idéntico al proyecto remoto de diseño

- **Estado:** AUSENTE
- **Pruebas citadas:** ninguna
- **Cláusulas sin morder:**
  - Then existen los cuatro ficheros de pantalla y el motor de renderizado
  - And existe el documento que explica de dónde viene el bundle
  - And el recuento de ficheros de pantalla es exactamente 4
- **Nota:** No existe NINGUNA prueba que lea docs/diseno-claude-design. Grep repo-wide de 'diseno-claude-design', 'dc.html', 'README_BUNDLE' y 'support.js' sobre src/, tests/ y tools/: cero coincidencias en código de test (solo aparece en el .feature y en ficheros de progress/). Los ficheros existen en disco (Blog.dc.html, Campanas.dc.html, Tienda.dc.html, 'Veterinaria La Sierra.dc.html', support.js, README_BUNDLE.md, github.md) pero nadie los inventaría ni cuenta las 4 pantallas de forma automática.

### @s42 — Los tokens que el navegador resuelve coinciden con los que el fichero declara, en las cinco variantes

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/tokens-aplicados.spec.ts:50`, `tests/e2e/tokens-aplicados.spec.ts:90`, `tests/e2e/tokens-aplicados.spec.ts:91`, `tests/e2e/tokens-aplicados.spec.ts:95`
- **Cláusulas sin morder:**
  - Then cada valor resuelto equivale al declarado en el fichero de tokens (solo se resuelven 2 de los 20 tokens: 'fondo' y 'texto'; los otros 18 --color-*/--sombra-* nunca se leen del documento en navegador)
- **Nota:** tokens-aplicados.spec.ts @s25 sí es navegador real: recorre las 5 variantes correctas (clinica/calida/tech/eco/marca), lee getComputedStyle(document.body) y lo compara contra leerTokenDeVariante() sobre el texto real de src/styles/_tokens.scss, con expect(variantesVerificadas).toBe(5) en :95. Cubre por tanto la 2ª y 3ª cláusula. Pero el When exige 'los veinte tokens resueltos del documento' y solo lee dos. El inventario de 20 (18 color + 2 sombra) está declarado en src/lib/diseno/tokensColor.ts:76 y solo se comprueba contra el TEXTO del SCSS (src/lib/diseno/tokensColor.test.ts:24-34), nunca contra lo que el navegador resuelve. Único getPropertyValue() de un token en toda la suite e2e: tests/e2e/imagenes.spec.ts:193, y es un solo token.

### @s43 — Ninguna imagen nueva del rediseño está rota ni viene de un origen remoto

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/imagenes.spec.ts:38`, `tests/e2e/imagenes.spec.ts:39`, `tests/e2e/imagenes.spec.ts:42`, `tests/e2e/imagenes.spec.ts:45`, `tests/e2e/red-limpia.spec.ts:47`, `tests/e2e/despliegue-subpath.spec.ts:242`, `tests/e2e/despliegue-subpath.spec.ts:248`
- **Cláusulas sin morder:**
  - And la imagen de fondo de la sección de bienvenida responde con código 200
  - And el recuento de rutas de imagen efectivamente comprobadas coincide con el inventario declarado
- **Nota:** Cláusulas 1 y 2 sí mordidas: imagenes.spec.ts @s27 fuerza 'eager' en todas las lazy, espera a img.complete y exige naturalWidth != 0 en las 6 rutas (:38-39), y prohíbe http/https/// y 'unsplash' en cada src (:42-45); red-limpia.spec.ts:44-47 exige además que toda petición de imagen salga del propio origen. Las dos que faltan: (a) NINGÚN test pide /img/hero/clinica.webp (Hero.tsx:48, la foto a sangre de la bienvenida) y comprueba su status 200 — el literal escrito a mano de rutas de imagen de despliegue-subpath.spec.ts:170-195 son las 24 rutas VIEJAS, sin hero ni servicios; grep de 'hero/clinica' en tests: cero coincidencias. (b) El 'recuento' de despliegue-subpath.spec.ts:248-249 es expect(RUTAS_DE_IMAGEN_CRUDAS.length + 1).toBe(25), una tautología sobre su propio literal, y está desfasado: public/img/ tiene 31 ficheros reales (hero/clinica.webp + los 5 de servicios/ del rediseño quedan fuera), así que no 'coincide con el inventario declarado' del rediseño. inventarioActivosPublicos.test.ts:126-137 compara rutas declaradas en src/data contra ficheros reales por fs, pero no es HTTP ni incluye Hero.tsx.

### @s44 — Ninguna ruta desborda en horizontal en la ventana más estrecha, con el diseño nuevo

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/layout.spec.ts:33`, `tests/e2e/layout.spec.ts:37`, `tests/e2e/layout.spec.ts:38`
- **Cláusulas sin morder:**
  - And ningún elemento sobresale por la derecha
- **Nota:** layout.spec.ts @s44 sí abre las 6 rutas a 320×640 (setViewportSize en :17) y afirma scrollWidth <= clientWidth (:33), y el recuento exacto de 6 rutas (:37-38). Pero el elemento culpable SÍ se calcula (:23-29, recorriendo todos los nodos y quedándose con el primero cuyo rect.right > clientWidth + 1) y NUNCA se afirma: 'culpable' solo se interpola en el mensaje de error del expect de scrollWidth. Un elemento que sobresale dentro de un contenedor con overflow oculto pasaría la puerta sin que nada falle. Falta un expect(culpable).toBeNull().

### @s45 — El análisis automático de accesibilidad sigue sin reportar violaciones, en las cinco variantes

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/accesibilidad.spec.ts:32`, `tests/e2e/accesibilidad.spec.ts:46`, `tests/e2e/accesibilidad.spec.ts:47`, `tests/e2e/accesibilidad.spec.ts:48`, `src/lib/diseno/analisisAutomaticoAxe.test.ts:34`, `src/lib/diseno/analisisAutomaticoAxe.test.ts:47`, `src/lib/diseno/analisisAutomaticoAxe.test.ts:53`, `src/lib/diseno/analisisAutomaticoAxe.test.ts:54`
- **Cláusulas sin morder:**
  - Then el recuento de violaciones es 0 en todas las combinaciones (solo se analiza la variante por defecto: 6 de las 30 combinaciones)
  - And el recuento de combinaciones efectivamente analizadas es exactamente 30 (el test afirma paginasAnalizadas = 6, nunca 30)
- **Nota:** El único AxeBuilder de toda la suite e2e está en accesibilidad.spec.ts:32 (grep de 'AxeBuilder' en tests/e2e: esa sola línea). Recorre RUTAS_DEL_INVENTARIO sin tocar data-variante en ningún momento, así que solo mide la paleta por defecto; el expect es paginasAnalizadas = 6 (:46), violaciones = [] (:47) y violacionesTotales = 0 (:48). No hay bucle de variantes ni ninguna aparición del número 30. La 3ª cláusula sí está mordida por partida doble: analisisAutomaticoAxe.test.ts:34 fija las cinco etiquetas contra un literal escrito a mano, :47 afirma usaOpciones = false, y :53-54 leen con ?raw el texto real de tests/e2e/accesibilidad.spec.ts para exigir 'withTags([...ETIQUETAS_AXE_ACUMULATIVAS])' y prohibir '.options('.

### @s46 — Cargar cualquier ruta sigue sin disparar una sola petición a un tercero

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/red-limpia.spec.ts:36`, `tests/e2e/red-limpia.spec.ts:41`, `tests/e2e/red-limpia.spec.ts:47`, `tests/e2e/despliegue-subpath.spec.ts:141`, `tests/e2e/despliegue-subpath.spec.ts:142`, `tests/e2e/despliegue-subpath.spec.ts:150`, `tests/e2e/despliegue-subpath.spec.ts:151`
- **Nota:** REFUTADO por el escepico: Las 7 lineas citadas existen y contienen las aserciones alegadas, pero el juego de citas NO establece la cobertura del segundo Then. Clausula 1 ('ninguna peticion sale hacia un dominio prohibido'): SI cubierta, tests/e2e/red-limpia.spec.ts:36 (denylist de 3 dominios) y tests/e2e/red-limpia.spec.ts:41 (allowlist real: 'dominiosNoDelMapa' debe ser [], solo openstreetmap.org tolerado) sobre las 6 rutas de RUTAS_DEL_INVENTARIO en navegador real. Clausula 3 ('la puerta de terceros del artefacto de produccion declara cero hallazgos'): SI cubierta, tests/e2e/despliegue-subpath.spec.ts:141 y :142 ejecutan 'ejecutarPuertaDeTerceros' sobre el 'dist/' real con el mismo filtro de ficheros que tools/puerta-terceros.ts:27,33, y afirman pasa===true y hallazgos===[]; tests/e2e/despliegue-subpath.spec.ts:150 y :151 lo refuerzan sobre dist/404.html y dist/index.html. Clausula 2 ('las fotografias nuevas se sirven desde el propio origen'): la cita tests/e2e/red-limpia.spec.ts:47 es VACUA para exactamente las fotografias nuevas. (a) tests/e2e/red-limpia.spec.ts se modifico por ultima vez en el commit 30de7c3, ANTERIOR a 21f81f2, que es el commit que introduce tanto el contrato features/rediseno_visual.feature como las fotografias nuevas public/img/hero/clinica.webp y public/img/servicios/*.webp; su propia cabecera declara que implementa @s32-@s34 de identidad_visual.feature. (b) Todas las fotografias nuevas son diferidas: src/components/Hero.tsx:52 y src/components/Servicios.tsx:24 llevan loading="lazy". (c) tests/e2e/red-limpia.spec.ts no fuerza 'eager' ni hace scroll en ningun punto (grep de lazy|eager|scroll: sin resultados), a diferencia de tests/e2e/imagenes.spec.ts:17-22 y tests/e2e/despliegue-subpath.spec.ts:198, que si lo hacen. Por tanto el filtro de tests/e2e/red-limpia.spec.ts:44-46 puede operar sobre un conjunto con CERO fotografias nuevas y :47 pasa igual; el unico limite inferior, tests/e2e/red-limpia.spec.ts:24, es peticiones.length>0 sobre TODAS las peticiones (HTML/JS/CSS ya lo satisfacen), no sobre imagenes. (d) El inventario de imagenes de tests/e2e/despliegue-subpath.spec.ts:171-196 (24 rutas) omite por completo /img/hero/* y /img/servicios/*: ninguna prueba ancla a las rutas nuevas por su nombre. CORRECCION DE LA EVIDENCIA (no listo la clausula como no cubierta porque si existe asercion real, solo que en un fichero NO citado): tests/e2e/imagenes.spec.ts:37 (imagenes.length>0), :38-39 (ninguna con naturalWidth===0) y :42-45 (ningun src que empiece por http://, https:// o //), ejecutadas DESPUES de cargarImagenesDiferidas (tests/e2e/imagenes.spec.ts:17-22, que fuerza eager y espera img.complete) sobre las 6 rutas, si enumeran document.images en tiempo de ejecucion e incluyen por tanto las fotografias nuevas; una foto servida desde un tercer origen haria fallar :42-43. Resumen: el escenario esta cubierto de hecho, pero NO por las pruebas citadas para la clausula 2; la cita correcta es tests/e2e/imagenes.spec.ts:37-45, y persiste el hueco de que ninguna asercion ancla a las 6 rutas de imagen nuevas por su literal, de modo que si Servicios o Hero dejaran de renderizar su <img>, ninguna prueba lo detectaria (las imagenes de fondo por CSS quedarian solo bajo el paraguas de red-limpia.spec.ts:41, ya que no forman parte de document.images).

### @s47 — Ninguna ruta escribe un error ni un aviso en la consola con el diseño nuevo

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/red-limpia.spec.ts:129`, `tests/e2e/red-limpia.spec.ts:130`, `tests/e2e/red-limpia.spec.ts:131`
- **Cláusulas sin morder:**
  - Then el recuento de errores de consola es 0 — medido con un When incompleto y hoy roto
  - And el recuento de avisos de consola es 0 — mismo When incompleto y roto
  - And el recuento de excepciones no capturadas es 0 — mismo When incompleto y roto
- **Nota:** Los tres contadores SÍ tienen expect real (red-limpia.spec.ts:129-131, sobre page.on('console') y page.on('pageerror') acumulados en las 6 rutas). Pero el When de ESTE contrato no se ejecuta: (a) falta por completo la interacción con una ficha de equipo — el test solo pulsa selector de paleta (:120), un desplegable de servicios (:123-124) y un ítem del acordeón FAQ (:126); grep de 'Equipo' en tests/e2e: solo aparece como texto de ancla en despliegue-subpath.spec.ts:19 y en comentarios, nunca como interacción. (b) Más grave: la línea 121 pulsa getByRole('button', { name: 'Lima de superficie' }), un botón que YA NO EXISTE — las cinco variantes del rediseño se rotulan Clínica / Cálida / Tech / Eco / Marca Galapavet (src/data/variantesPaleta.ts:14-18) y 'Lima' no aparece en ningún otro sitio del repo (grep: única coincidencia esa línea del spec). El test no puede pasar tal cual contra el diseño nuevo, así que sus tres aserciones no muerden nada hoy.

### @s48 — El peso del CSS servido no supera el techo declarado para el diseño nuevo

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/css-presupuesto.spec.ts:34`, `tests/e2e/css-presupuesto.spec.ts:35`, `tests/e2e/css-presupuesto.spec.ts:36`
- **Cláusulas sin morder:**
  - And el techo está escrito a mano (el 'mayor que cero' sí está en :34; que el literal esté escrito a mano y no recalculado del dist/ no tiene ninguna aserción)
  - And el techo se declara en un único sitio
- **Nota:** css-presupuesto.spec.ts suma encodedBodySize de las entradas de tipo link con nombre .css en la portada real servida por vite preview (:26-32) y afirma bytesTotales <= TECHO_BYTES_CSS (:35) y > 0 (:36), más TECHO_BYTES_CSS > 0 (:34): la 1ª cláusula y la mitad de la 2ª están cubiertas. Lo que falta: ningún test lee con ?raw el texto de css-presupuesto.spec.ts para demostrar que el 8000 es un literal a mano (el comentario :7-18 lo afirma, nadie lo verifica) ni que aparece una sola vez en todo el repo — grep de 'TECHO_BYTES_CSS' devuelve solo las 3 líneas de ese mismo fichero, pero eso es una observación mía, no una puerta automática. Aviso adicional: el techo de 8000 B se midió sobre el dist/ ANTERIOR al rediseño (comentario :8-13, dist/assets/index-DYgsknih.css), y el artefacto actual es dist/assets/index-D3B6EixL.css — el techo no se ha recalibrado 'para el diseño nuevo' que exige el título del escenario.

### @s49 — Ni un solo literal de la clínica ficticia del prototipo sobrevive en el sitio

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/lib/puertaTelefonoHardcodeado.test.ts:10`, `src/lib/puertaTelefonoHardcodeado.test.ts:30`, `src/lib/puertaTelefonoHardcodeado.test.ts:31`, `src/components/PieDePagina.test.tsx:286`, `src/components/PieDePagina.test.tsx:307`, `src/components/PieDePagina.test.tsx:313`, `src/components/Hero.test.tsx:19`, `src/components/Cabecera.test.tsx:200`, `src/components/InformacionContacto.test.tsx:133`, `src/pages/PaginaBlog.test.tsx:542`, `src/pages/PaginaCampanas.test.tsx:633`
- **Cláusulas sin morder:**
  - no aparece el nombre comercial de la clínica ficticia
  - no aparece su localidad
  - no aparece su dirección de correo electrónico
  - el recuento de ficheros efectivamente inspeccionados es mayor que 0
- **Nota:** La prueba que el plan declaraba para este escenario (progress/rediseno/plan_pruebas_rediseno.md:53 → 'Nueva src/lib/diseno/datosFicticiosProhibidos.test.ts') NO EXISTE: no hay ningún fichero con ese nombre en el repositorio, ni ningún otro barrido que cruce una lista literal de la clínica ficticia contra todo 'src' y contra 'dist'. Lo único que barre src entero es src/lib/puertaTelefonoHardcodeado.test.ts:10, que globa '/src/**/*.{ts,tsx}' con '?raw' (excluyendo tests) y en :30-:31 afirma not.toContain('640221190') y not.toContain('918442160'). Eso muerde la cláusula de los teléfonos SOLO en parte: (a) únicamente las dos formas sin espacios, no '918 44 21 60' ni '640 22 11 90'; (b) únicamente .ts/.tsx de src — quedan fuera .scss, index.html, public/ y src/data no-TS; (c) no toca 'dist/' en absoluto, y el Given exige 'el contenido del artefacto de producción'. El resto de citas (PieDePagina.test.tsx:286-314 con CADENAS_HEREDADAS, Hero.test.tsx:19, Cabecera.test.tsx:200, InformacionContacto.test.tsx:133, PaginaBlog.test.tsx:542, PaginaCampanas.test.tsx:633) son asserts sobre el textContent de un componente renderizado en jsdom, no sobre 'el texto real de todos los ficheros de src': demuestran que ese componente concreto no pinta el literal, no que el literal no sobreviva en el repositorio ni en el artefacto. Ningún test afirma 'ficherosInspeccionados > 0' para una puerta de datos ficticios (no existe tal puerta); el fallo-cerrado por 0 ficheros que sí existe (puertaTelefonoHardcodeado.test.ts:50) es de otro contrato y de otra puerta.

### @s50 — Los recuentos que el sitio muestra son los reales, no los del prototipo

- **Estado:** PARCIAL
- **Pruebas citadas:** `tests/e2e/rediseno-visual.spec.ts:45`, `src/components/Servicios.test.tsx:105`, `src/components/Servicios.test.tsx:405`, `src/components/Equipo.test.tsx:42`, `src/components/Galeria.test.tsx:310`, `src/components/Galeria.test.tsx:314`
- **Cláusulas sin morder:**
  - ningún recuento se ha tomado de la pista de vista previa del editor de diseño
- **Nota:** Solo la primera cláusula se muerde con el Given que el escenario exige ('el sitio construido y servido'): tests/e2e/rediseno-visual.spec.ts:45 cuenta en el dist servido por 'vite preview' expect(page.locator('#servicios img')).toHaveCount(5) — 5, no 12. Las cláusulas de profesionales y de galería NO tienen ninguna medición sobre el sitio construido: he barrido tests/e2e/*.spec.ts y no hay ni un solo toHaveCount ni conteo sobre '#equipo' ni sobre '#galeria' (las únicas apariciones de esos selectores en e2e son tokens-aplicados.spec.ts:100, que solo lee estilos, y despliegue-subpath.spec.ts:19, que solo comprueba anclas). Su evidencia es de jsdom: Equipo.test.tsx:42 fija exactamente los dos profesionales reales ['Marcos Pérez','Joaquín Herranz'] (src/data/equipo.ts exporta 2 entradas, no 6) y Galeria.test.tsx:310/:314 comprueba GALERIA.length > 0 y que las figuras renderizadas son exactamente GALERIA.length (el catálogo real tiene 6 entradas, no 9). Son asserts sobre valores de datos reales, así que cuentan como sustancia, pero se hacen sobre el componente aislado, no sobre 'los listados de la portada' del artefacto servido, y ambas citas pertenecen a los tags @s1/@s16 de equipo.feature y galeria.feature. La cuarta cláusula ('ningún recuento se ha tomado de la pista de vista previa del editor de diseño') no tiene ninguna aserción en ningún fichero: no hay puerta que compare los recuentos publicados contra los hints del editor de diseño ni que prohíba su procedencia.

### @s51 — Las cuatro cifras de la bienvenida se derivan de la fuente única, sin retipear

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/Hero-logica.test.ts:5`, `src/components/Hero-logica.test.ts:6`
- **Cláusulas sin morder:**
  - cambiar un dato en la fuente única cambia la cifra correspondiente
  - ninguna cifra está escrita a mano en el componente
- **Nota:** Existe la prueba y es del tag correcto de ESTE contrato (src/components/Hero-logica.test.ts:5), pero muerde una sola cláusula y con un solo disparo. En :6-:11 hay UNA única llamada, construirCifrasBienvenida(['a','b'],['c'],['d','e','f'],['g','h']) → [2,1,3,2] con sus cuatro etiquetas. Eso demuestra 'cada cifra se calcula a partir de esos datos' para ese fixture, pero NO hay una segunda llamada con una fuente cambiada, así que la cláusula 'cambiar un dato en la fuente única cambia la cifra correspondiente' no tiene aserción: el propio plan pedía 'fixture que cambia cada fuente y mata las cifras hardcodeadas' (progress/rediseno/plan_pruebas_rediseno.md, fila @s51) y ese segundo fixture no está. Además el Given ('el catálogo de servicios y la fuente única de datos de negocio') no se ejerce nunca: el test usa arrays sintéticos de strings, jamás importa SERVICIOS, EQUIPO, GALERIA ni datosNegocio.horario, y nada verifica que src/components/Hero.tsx:42 les pase precisamente esos cuatro catálogos. La cláusula 'ninguna cifra está escrita a mano en el componente' tampoco tiene aserción: he leído src/components/Hero.test.tsx entero (150 líneas, @s1 a @s13) y no contiene ni una sola aserción sobre la banda de cifras — nunca consulta el ul con aria-label 'Resumen de Galapavet' ni compara los <strong> renderizados con las longitudes de los catálogos reales; y no hay ninguna lectura '?raw' de Hero.tsx que prohíba un número literal (el único glob '?raw' de un .tsx suelto es App-basename.test.ts:20, sobre App.tsx).

### @s52 — El sitio no afirma en ningún sitio que preste un servicio que no presta

- **Estado:** PARCIAL
- **Pruebas citadas:** `src/components/Hero.test.tsx:99`, `src/components/Cabecera.test.tsx:209`, `src/components/InformacionContacto.test.tsx:107`, `src/components/InformacionContacto.test.tsx:110`, `src/components/PieDePagina.test.tsx:129`, `src/components/Faq.test.tsx:120`, `src/components/Faq.test.tsx:238`, `src/components/Servicios.test.tsx:381`, `src/components/CampanasPortada.test.tsx:145`, `src/components/BarraUrgencias.test.tsx:11`, `tests/e2e/rediseno-visual.spec.ts:46`
- **Cláusulas sin morder:**
  - el único compromiso de urgencias que aparece es el que declara la fuente única de datos
- **Nota:** El Given/When de este escenario ('el sitio construido y servido' + 'se recorre el texto visible de las seis rutas') NO está implementado en ninguna parte: he barrido tests/e2e/*.spec.ts y ninguno lee el texto visible de las rutas — las únicas lecturas de texto en e2e son accesibilidad.spec.ts:428 (textContent de encabezados, para la jerarquía) y despliegue-subpath.spec.ts:150-151 (texto de dist/404.html y dist/index.html, y solo contra dominios de terceros). La 'afirmacionesProhibidas.test.ts' que el plan declaraba para @s52 NO EXISTE. La puerta que sí codifica el patrón /24\s*h|24h|365|todos los días del año|siempre hay alguien de guardia/ está en src/lib/diseno/rolesDescartados.ts:31, pero su único consumidor es src/lib/diseno/rolesDescartados.test.ts, que la llama tres veces con ficheros inventados a mano ('tokens.scss', 'boton.scss', 'contenido.tsx' con 'Atención 24 h'): jamás se ejecuta contra ficheros reales del proyecto (grep de ejecutarPuertaDeRolesDescartados: 0 usos fuera de su propio test), así que no prueba nada sobre el sitio. Las dos primeras cláusulas tienen evidencia real pero troceada por componente y en jsdom, y toda ella etiquetada con tags de OTROS contratos (@s5/@s6/@s8/@s13/@s14/@s18): Hero.test.tsx:99, Cabecera.test.tsx:209, InformacionContacto.test.tsx:107-110, PieDePagina.test.tsx:129, Faq.test.tsx:120/238-240, Servicios.test.tsx:381-391, CampanasPortada.test.tsx:145, Galeria.test.tsx:291. Quedan rutas enteras sin barrer: nada comprueba ausencia de '24 h'/'todos los días del año' en PaginaTienda, PaginaBlog, la ficha de campaña ni en ReservaChat (PaginaBlog.test.tsx:542-544 y PaginaCampanas.test.tsx:633 solo miran los literales de la clínica ficticia, no las afirmaciones de disponibilidad). La tercera cláusula no tiene aserción de unicidad en ningún sitio: BarraUrgencias.test.tsx:11-13 prueba que ESE componente deriva rótulo y enlace de datosNegocio.telefonoUrgencias, y tests/e2e/rediseno-visual.spec.ts:46 solo comprueba que en la portada construida existe un aside[aria-label='Urgencias fuera de horario'] cuyo enlace empieza por 'tel:' — ninguno de los dos afirma que ese sea el ÚNICO compromiso de urgencias que aparece en las seis rutas, ni cuenta apariciones.

