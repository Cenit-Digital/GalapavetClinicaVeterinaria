# TDD — feature 48 `hero_reducido_con_animacion` — OLA 4B (el lector de hojas y las tres puertas de movimiento que lo usan)

> `tdd_craftsman`, 14/10/2026. Contrato firmado por Pablo el 13/10/2026 (`features/hero_reducido_con_animacion.feature`
> @s1..@s12 y las enmiendas): **no se ha tocado ningún `.feature`**, ni `feature_list.json`, ni `progress/current.md`,
> ni `project-spec.md`. Nada se marca `done`. Esta ola corrige los hallazgos B1-B8 del panel de revisión sobre
> `lectorDeEstilos.ts` y las tres puertas que lo consumen. Las hojas reales NO han necesitado ningún cambio.

## 1. Ficheros tocados

Producción: `src/lib/diseno/lectorDeEstilos.ts`, `src/lib/diseno/movimientoRespetuoso.ts`,
`src/lib/diseno/escalaMovimiento.ts`, `src/lib/accesibilidad-movimiento.ts`.
Pruebas: los cuatro `.test.ts` de esos módulos y `src/styles/movimiento-global.test.ts` (una aserción nueva).
Informe: este fichero. `src/components/Hero.test.tsx` (que también importa el lector) NO se ha tocado y sigue verde.

## 2. Mapa HALLAZGO → test que lo fija

Fichero · `describe` · caso. Nunca números de línea. Cada comportamiento nuevo se prueba **con LF y con CRLF** (los
ayudantes `leerConLfYCrlf`, `informeConLfYCrlf`, `inventarioConLfYCrlf` y `enCrlf` comparan los dos resultados con
`toEqual`).

| Hallazgo | Qué se corrige | Test |
| --- | --- | --- |
| **B1(a)** `//` sin blanco delante | una `//` pegada a `;`, `{` o `}` abre un comentario | `lectorDeEstilos.test.ts` · «lectorDeEstilos B1(a): una "//" pegada a ";", "{" o "}" también abre un comentario» (3 filas); en las puertas: `movimientoRespetuoso.test.ts` «B1: …» → «una "//" pegada a un punto y coma ya no se traga la animación de la línea siguiente»; `escalaMovimiento.test.ts` «B1: …» → mismo título; `accesibilidad-movimiento.test.ts` «@s20 B1: …» → «una "//" pegada a un punto y coma ya no hace desaparecer la "opacity: 0"…» |
| **B1(b)** `//` dentro de una cadena | las cadenas (con escapes) se enmascaran antes de buscar comentarios | `lectorDeEstilos.test.ts` · «B1(b)(c): una cadena entrecomillada es texto, nunca estructura» → «una "//" con blanco delante DENTRO de una cadena (comillas dobles / simples)…», «un "/*" dentro de una cadena…», «una comilla dentro de un comentario no abre una cadena», «una comilla escapada DENTRO de la cadena no la cierra», «una cadena con una comilla del otro tipo»; `escalaMovimiento.test.ts` «B1: …» → «una "//" con blanco delante DENTRO de una cadena no se traga la declaración que la sigue» |
| **B1(c)** llave en cadena / llave escapada | una `{` o `}` dentro de una cadena o escapada con `\` no desordena la pila | mismo `describe` («una llave de apertura / de cierre / las dos… dentro de una cadena no desordena la pila») y «B1(c): la barra invertida escapa el carácter que le sigue» (4 filas: `\{`, `\}`, `\"`, `\'`); en las puertas: `movimientoRespetuoso.test.ts` «la llave dentro de una cadena ya no desordena la pila…», `accesibilidad-movimiento.test.ts` «una llave dentro de una cadena no desordena nada…» |
| **B1(d)** nadie comprueba que la pila acabe vacía | campo ADITIVO `profundidadFinal` (cada `{` sin cerrar y cada `}` sin abrir suman 1) y función `esLecturaFiable`; las cuatro puertas fallan CERRADO | `lectorDeEstilos.test.ts` · «B1(d): la profundidad final de la pila dice si las llaves cuadran» (equilibrada, sin cerrar, 2 niveles, 4 filas de cierres de más) y «esLecturaFiable: …»; las puertas: «una hoja que el lector no puede leer entera hace fallar CERRADA(S) …» en `movimientoRespetuoso.test.ts` (las dos puertas), `escalaMovimiento.test.ts` y `accesibilidad-movimiento.test.ts` |
| **B1(e)** interpolación como nombre de propiedad | se declara NO VERIFICABLE (`sentenciasNoVerificables`, otro campo aditivo) en vez de descartarse; `--#{$n}` (propiedad personalizada) no cuenta; una cadena sin cerrar en su línea también se declara | `lectorDeEstilos.test.ts` · «B1(e): lo que el lector no sabe leer se declara, no se descarta en silencio» (5 formas de nombre interpolado, sin `;` antes de `}`, `--#{$n}`, interpolación en valor / selector, comillas sin cerrar, cadenas bien cerradas) y las mismas filas de «hoja sin lectura fiable» de las tres puertas |
| **B2** clasificador de `@media` | «no-preference» / «reduce» solo si la consulta es exactamente esa condición (a lo sumo con `and`); `not`, `or`, coma, `#{` o las dos condiciones → `media-ajena`; tolera espacios y mayúsculas; `@-webkit-keyframes` y `@KEYFRAMES` son fotogramas | `lectorDeEstilos.test.ts` · «B2: solo es "no-preference" la consulta que es exactamente esa condición» (10 + 6 + 18 + 9 filas, incluidas las palabras `x-not`, `orientation`, `min-color` que NO son operadores) y «B2: los fotogramas con prefijo de fabricante o en mayúsculas también son fotogramas»; efecto en las puertas: `movimientoRespetuoso.test.ts` «B2: una consulta que también se cumple con movimiento reducido no cubre la entrada» (5 consultas, `@media not (…: reduce)` ya no cubre @s33, `@-webkit-keyframes`/`@KEYFRAMES` dentro de `reduce` se señalan y cuentan) |
| **B3** `escalaMovimiento` falla cerrado solo a medias | `0.9S`, `900MS`, `+900ms`, `9e2ms`, `9e02ms`, `9e-01s`… se LEEN; `900ms*2`, `400msx`, `10%`, `#{900}ms`, `1x`… se declaran no verificables; `!important` no enmascara; `ALL` en mayúsculas | `escalaMovimiento.test.ts` · «B3: todo lo que parece un tiempo se lee o falla cerrado, nunca se ignora» (12 duraciones fuera de escala, 14 dentro, 9 retardos, 10 no verificables, 15 números sin unidad que NO se declaran, nombres con dígitos) y «B3: "!important" no enmascara un tiempo ni una palabra clave». El test «un token que solo CONTIENE un tiempo…» se INVIERTE para `400msx` (ver desvíos) |
| **B4** igualdad exacta con `0` y `hidden` | el valor se normaliza (`!important`, mayúsculas) y `opacity` se compara con `parseFloat(valor) === 0` (`0.0`, `0%`, `-0`, `0e3`…) | `accesibilidad-movimiento.test.ts` · «@s20 B4: el estado base oculto se reconoce escrito como se escriba» (18 formas que ocultan, 12 que no, y un `@keyframes` con las mismas grafías que sigue sin ser estado base) |
| **B4** `animation: none` infla la guarda | ni `animation: none` ni `animation-name: none` (con cualquier grafía) son «aparición animada»; criterio compartido con `esDeEntrada` para `animation` | `accesibilidad-movimiento.test.ts` · «@s20 B4: "animation: none" y "animation-name: none" no hacen aparecer nada y no inflan el recuento» (6 grafías, hoja ajena, 5 valores que SÍ cuentan, hoja del hero que conserva solo un `none` NO pasa la guarda); `movimientoRespetuoso.test.ts` · «B4/B6: "animation: none" no es una entrada, escrita como se escriba» (5 grafías, `!important` no disfraza una entrada, y `animation-name: none` SÍ es entrada por la fila firmada) |
| **B5** mayúsculas y prefijo de fabricante | función exportada `nombreCanonicoDeLaPropiedad` (minúsculas, sin `-webkit-`/`-moz-`/`-ms-`/`-o-`/…, sin tocar `--x`) usada por las CUATRO puertas | `lectorDeEstilos.test.ts` · «B5: el nombre canónico de una propiedad no depende de las mayúsculas ni del prefijo de fabricante»; `movimientoRespetuoso.test.ts` «B5: …» (@s33 y @s8), `escalaMovimiento.test.ts` «B5: …» (7 + 4 + `--transition-duration`), `accesibilidad-movimiento.test.ts` «@s20 B5: …» (5 + hoja ajena + `-webkit-animation` con `opacity: 0` + propiedades de animación que no cuentan) |
| **B6** equivalentes no declarados | `'animation'` fuera de `PROPIEDADES_DE_ENTRADA_SIEMPRE` (código muerto); `HOJAS_AUTORIZADAS…` (array de un elemento + `.some`) pasa a `HOJA_AUTORIZADA_A_ANIMAR_LA_ENTRADA` (literal); las ~7 ramas redundantes de `escalaMovimiento` desaparecen al repartir los tiempos por POSICIÓN (`LISTAS_POR_POSICION`) | `accesibilidad-movimiento.test.ts` «@s20 B6: la hoja autorizada es una sola, escrita a mano en el test»; `escalaMovimiento.test.ts` «B6: cada tiempo de una declaración corta ocupa su sitio, y los que sobran se ignoran»; Stryker (§5) confirma que ya no quedan esos supervivientes |
| **B7** `lineaDe` cuadrático / `CERO_FICHEROS` | contador de línea lineal; la constante `CERO_FICHEROS` (que contaba declaraciones) pasa a `NINGUNO` | `lectorDeEstilos.test.ts` · «el coste de leer una hoja grande es lineal» → «lee 20.000 declaraciones en menos de 2 s y cada una lleva SU línea» (ROJO medido: 29,2 s; VERDE medido: 31 ms para 509 KB) |
| **B8** 4 Timeouts del lector | el recorrido ya no tiene índice que avance a mano: `matchAll` sobre las llaves, los `;`, las comillas y los saltos de línea | No hay test (un Timeout es una propiedad del mutante, no del comportamiento): lo prueba Stryker, 0 Timeout en los cuatro módulos (§5) |
| **CRLF** | `\r\n` se normaliza a `\n` al entrar al lector; CRLF y LF dan resultados IDÉNTICOS en las cuatro puertas | `lectorDeEstilos.test.ts` «los finales de línea de Windows dan la misma lectura que los de Unix»; `movimientoRespetuoso.test.ts` «hero_reducido_con_animacion @s8: CRLF y LF dan el mismo informe en cada fila de la tabla» (las 22 filas firmadas) y «@s33 con finales de línea de Windows…»; el resto de los casos nuevos llevan su gemelo CRLF |

Además, en las hojas REALES: `ficherosSinLecturaFiable` / `hojasSinLecturaFiable` es `[]` en `movimientoRespetuoso.test.ts` (17 + 20),
`movimiento-global.test.ts` (3), `escalaMovimiento.test.ts` (20) y `accesibilidad-movimiento.test.ts` (20).

## 3. Diseño (lo que cambia respecto de la ola 1B)

- **Una sola pasada de enmascarado** (`PATRON_LEXICO`): comentario de bloque (sin cerrar llega al final de la hoja, como en CSS),
  comentario de línea (al principio, tras blanco o tras `; { }`), cadena entrecomillada con escapes, `\X` fuera de cadenas e
  interpolación `#{…}`. Al recorrer de izquierda a derecha, quien empieza antes se queda con lo que contiene: una comilla dentro de
  un comentario y una `//` dentro de una cadena no cuentan. De ese texto salen DOS copias del mismo largo y con los mismos
  saltos de línea: `sinComentarios` (de donde se cortan propiedad, valor y encabezado, con las cadenas intactas) y
  `estructura` (con cadenas, escapes e interpolaciones en blanco, donde se buscan las llaves).
- **Recorrido sin índice a mano** (B7+B8): `estructura.matchAll(/[{};\n"']/g)`. El número de línea sale de un contador que sube con cada
  salto; la línea de una sentencia es la de su primera palabra (línea de arranque + saltos del blanco inicial).
- **Resultado ADITIVO**: `declaraciones` y `fotogramas` conservan su forma; se añaden `profundidadFinal` y `sentenciasNoVerificables`.
  `Hero.test.tsx` (que filtra `declaraciones` y mira `bloques`) sigue verde sin tocarlo.
- **Ayudantes compartidos** (en `lectorDeEstilos.ts`): `esLecturaFiable`, `leerFicheros`, `rutasSinLecturaFiable`, `nombreCanonicoDeLaPropiedad`,
  `valorSinImportante`, `valorNormalizado` y los tipos `FicheroEstilos`/`FicheroLeido` (el reviewer 2.12 pedía que `FicheroEstilos`
  dejara de estar duplicado; sigue reexportado desde `movimientoRespetuoso.ts` y `escalaMovimiento.ts`, y `HojaDeEstilos` es ahora un alias).
- **Fallo cerrado de las cuatro puertas**: cada informe lleva un campo aditivo nuevo (`ficherosSinLecturaFiable` en @s33, @s8 y @s16;
  `hojasSinLecturaFiable` en el inventario de @s20) y `pasa` exige que esté vacío, **también para una hoja sin ninguna declaración
  de movimiento** (no se puede saber que no la hay si no se pudo leer entera).
- **`escalaMovimiento.ts`**: tiempo literal `^[+-]?(entero|.decimal)(e[+-]?\d+)?(ms|s)$` sin distinguir mayúsculas; el exponente se
  corre en el propio texto (`Number("9e2")`), nunca se multiplica en coma flotante; todo token que EMPIEZA como número y no es
  ni tiempo literal ni número sin unidad (el contador de iteraciones) falla cerrado.

## 4. Ciclos Rojo → Verde → Refactor (en orden)

Honestidad sobre el ritmo: las FAMILIAS de filas de una misma tabla se escribieron juntas antes del verde; la Ley 3 se respetó por familia.
Cada ROJO se leyó en la salida de Vitest antes de escribir producción.

| # | Hallazgo | ROJO observado | VERDE (mínimo) | REFACTOR |
| --- | --- | --- | --- | --- |
| 1 | B7 | `lee 20.000 declaraciones en menos de 2 s…` → `expected 29178.8966 to be less than 2000` | `leerEstilos` reescrito: enmascarado único + `matchAll` + contador de líneas (las 258 pruebas previas siguen verdes) | `saltosAntesDeLaPrimeraPalabra` |
| 2 | B1(a) | 3 rojos (`;//`, `{//`, `}//` + salto + declaración) | lookbehind `(?<=^|[\s;{}])` | — |
| 3 | CRLF | `valor` con `\r` dentro con CRLF | normalizar `\r\n` al entrar | — |
| 4 | B1(b) cadenas | 6 rojos | alternativas de cadena `"…"` y `'…'` con escapes en `PATRON_LEXICO` | `esUnComentario` |
| 5 | B1(c) escapes + B1(d) profundidad | 12 rojos (campo inexistente) | alternativa `\\[…]`; `cierresDeMas`; `profundidadFinal` | — |
| 6 | B1(e) | 14 rojos | `sentenciasNoVerificables`; nombre con `#{`; comillas que sobreviven al enmascarado | `Recorrido` + `abrirBloque` / `cerrarSentencia` |
| 7 | B1 (helpers) | 27 rojos (`esLecturaFiable`, `nombreCanonicoDeLaPropiedad`, `valorSinImportante`, `valorNormalizado` no existen) | las cuatro funciones | — |
| 8 | B2 | 25 rojos (consultas con `not`/`or`/coma, mayúsculas, espacios, `@-webkit-keyframes`…) | `tipoDeConsultaDe` con patrones entre paréntesis + `PATRON_QUE_CAMBIA_EL_SENTIDO…` | — |
| 9 | `leerFicheros`, `rutasSinLecturaFiable` | 3 rojos | las dos funciones (el cableado ya estaba duplicado en las puertas) | extraídas de las puertas |
| 10 | B5 + B4 + B1 en `movimientoRespetuoso` | 21 rojos | `esDeMovimiento`/`esDeEntrada` sobre el nombre canónico y el valor normalizado; `ficherosSinLecturaFiable` | `PROPIEDADES_DE_ENTRADA_SIEMPRE` sin `animation` (B6); `NINGUNO` (B7); una sola lectura por fichero |
| 11 | B3 + B5 + B1 en `escalaMovimiento` | 47 rojos | patrón de tiempo ampliado, `esNoVerificable`, `valorSinImportante`, `LISTAS_POR_POSICION`, `ficherosSinLecturaFiable` | reparto por posición (B6) |
| 12 | B4 + B5 + B6 + B1 en `accesibilidad-movimiento` | 40 rojos | criterio de ocultación por propiedad, `none` fuera de la guarda, `HOJA_AUTORIZADA…`, `hojasSinLecturaFiable` | — |
| 13 | Stryker, serie 1 del lector (7 supervivientes) | ver §5 | tests nuevos + `\\[^\n]` fuera de cadenas | — |
| 14 | Stryker, serie 2 de `escalaMovimiento` (8 supervivientes + 1 NoCoverage) | ver §5 | tests nuevos + desestructuración sin valores por defecto | — |
| 15 | Stryker, serie 3 de `escalaMovimiento` (1 equivalente: `partes = ["Stryker was here"]`) | no hay prueba que lo distinga: se quita el código que lo produce | la parte en curso es el último elemento de `partes` (`['']`) | `partirEnNivelSuperior` sin variable aparte; serie 4: 233/233 |

Tres matices que NO se esconden:
- En el ciclo 5 los cuatro casos de escape (`\{`, `\}`, `\"`, `\'`) salieron rojos por una razón INCORRECTA (el campo `profundidadFinal` aún no existía **y** la herramienta de escritura de
  mi entorno había colapsado la barra invertida de dos de las filas). Lo detecté al ver que el rojo no cambiaba al implementar el escape, reescribí las filas y las verifiqué con el sabotaje
  «la barra invertida no escapa nada» (§6): 2 pruebas rojas.
- En el ciclo 10 varias pruebas de B2 en `movimientoRespetuoso.test.ts` nacieron VERDES porque el clasificador ya estaba en el lector (ciclo 8); su mordida está en el sabotaje «not/or/coma… no cambian el sentido» (§6).
- La prueba de rendimiento depende del reloj: su cota (2 s) es holgada a propósito (31 ms medidos frente a 29 s); solo separa lo lineal de lo cuadrático.

## 5. Prueba de mutación (StrykerJS, acotado a cada módulo, `concurrency 1`, `break 100`, con el candado)

Comando: `pnpm exec stryker run --mutate "src/lib/diseno/<fichero>.ts"` (el último, `src/lib/accesibilidad-movimiento.ts`). El JSON se copia del
`reports/mutation/mutation.json` compartido DENTRO del candado, antes de liberarlo (Stryker sale con código 1 cuando hay algún superviviente; el candado se libera
con `;`, no con `&&`). El reparto de estados se lee del JSON, no de la tabla. `# timeout` es 0 en TODAS las ejecuciones, también en las de la serie 1.

«Initial test run succeeded» (con `vitest.related` cada mutante NO se enfrenta a la suite entera, sino a los ficheros relacionados; ver `docs/mutation-testing.md`):

| Módulo | Ficheros de prueba que enfrenta | Pruebas del «Initial test run» |
| --- | --- | --- |
| `lectorDeEstilos.ts` | 6 (`lectorDeEstilos`, `movimientoRespetuoso`, `escalaMovimiento`, `accesibilidad-movimiento`, `movimiento-global`, `Hero.test.tsx`) | 587 en 15 s |
| `movimientoRespetuoso.ts` | 2 (`movimientoRespetuoso`, `movimiento-global`) | 103 en 6 s |
| `escalaMovimiento.ts` | 1 | 155 en 2 s (serie 4) |
| `accesibilidad-movimiento.ts` | 1 | 98 en 3 s |

Las 587 pruebas de la primera fila pasan en verde sobre las fuentes intactas ANTES de mutar, así que cualquier rojo posterior es atribuible al mutante.

| Módulo | Mutantes | Killed | Survived | Timeout | NoCoverage | RuntimeError | Código de salida de Stryker |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `lectorDeEstilos.ts` (serie 1) | 231 | 224 | 7 | 0 | 0 | 0 | 1 |
| `lectorDeEstilos.ts` (serie 2, DEFINITIVA) | 229 | **229** | **0** | **0** | **0** | **0** | 0 |
| `movimientoRespetuoso.ts` (serie 2, DEFINITIVA) | 98 | **98** | **0** | **0** | **0** | **0** | 0 |
| `accesibilidad-movimiento.ts` (serie 2, DEFINITIVA) | 76 | **76** | **0** | **0** | **0** | **0** | 0 |
| `escalaMovimiento.ts` (serie 2) | 236 | 227 | 8 | 0 | 1 | 0 | 1 |
| `escalaMovimiento.ts` (serie 3) | 235 | 234 | 1 | 0 | 0 | 0 | 1 (el superviviente EQUIVALENTE de abajo) |
| `escalaMovimiento.ts` (serie 4, DEFINITIVA) | 233 | **233** | **0** | **0** | **0** | **0** | 0 |

Antes de esta ola (predicción de la revisión de vacuidad): lector 4 Timeouts + 1 superviviente no equivalente (L132 `indice - 1`); movimientoRespetuoso 1; escalaMovimiento 7; accesibilidad-movimiento 1.
Ahora: **100 % en los cuatro módulos, 0 supervivientes, 0 Timeout, 0 NoCoverage, 0 RuntimeError, código de salida 0, y NINGÚN mutante equivalente que justificar.**
Los cambios posteriores a cada serie definitiva son solo de comentarios (el lector: el comentario de `PATRON_LEXICO`, tras la serie 2); no necesitan serie nueva.

**Cómo se mataron los supervivientes** (cada uno con su prueba, en `lectorDeEstilos.test.ts` salvo que se diga otra cosa):
1. Lector `(?:\*\/|$)` → `(?:\*\/)`: «un comentario de bloque sin cerrar llega hasta el final de la hoja…».
2. Lector, 5 mutaciones del escape `\\[\s\S]` dentro de las cadenas (`[\S\S]`, `[^\s\S]`, `[\s\s]`, en las dos clases de comillas): «una cadena con comillas dobles / simples puede seguir en la línea siguiente con una barra invertida…» y «…que lleva su propia comilla escapada y una llave detrás…».
3. Lector `\s*!\s*important\s*$` → `\S*$`: la fila `['hidden !important  ', 'hidden']` de «el valor sin "!important"».
4. Lector, la barra invertida FUERA de cadena: `\\[\s\S]` y `\\[\S\S]` eran equivalentes entre sí (solo cambiaba si se tragaba un blanco o un salto de línea, que no son estructura); se cambió a `\\[^\n]` (una barra invertida seguida de salto de línea no escapa nada en CSS) y se añadió «una barra invertida al final de una línea FUERA de una cadena no escapa el salto de línea».
5. Escala `(?:e([+-]?\d+))?` → `\d` y las cuatro mutaciones de `PATRON_NUMERO_SIN_UNIDAD`: filas `9e02ms`, `9e-01s`, `0.09e+04ms` y los números sin unidad `12`, `120`, `1.25`, `.25`, `3e12`, `3e+2`, `3e-2`, `-12.5e+3`.
6. Escala, valores por defecto de la desestructuración (`exponente = '0'`, `unidad = ''`, 1 NoCoverage + 1 superviviente): eran inalcanzables (la expresión regular siempre captura la unidad); se QUITARON (`coincidencia[1] as string`, `Number(coincidencia[2] ?? NINGUNO)`).
7. Escala, `const partes: string[] = []` → `["Stryker was here"]` (el ÚNICO equivalente de la serie 3: un trozo de texto delante de los tokens reales que ningún consumidor mira, porque `leerTiempos` y `animaLaPalabraClaveAll` descartan todo lo que no es un tiempo, un token que empieza como número, sintaxis sin leer o `all`).
   Se ELIMINÓ el código que lo producía en vez de justificarlo: la parte en curso es ahora el último elemento de `partes` (`['']`, cada carácter se añade al último, cada separador de nivel superior abre uno), sin variable aparte. Los mutantes que nacen de ahí (`[]`, `"Stryker was here!"` en la semilla y en cada `push('')`, la plantilla vacía) CORROMPEN un token real y mueren por las filas `animation-duration: 1.25s`, `transition: color 150ms…` y sus vecinas. Pasa `tsc` con `noUncheckedIndexedAccess` sin ningún `?? ''` (`${partes.pop()}`), y la serie 4 lo confirma.

## 6. Sabotajes reales (a mano, además de Stryker)

Método: copia previa del fichero, UN cambio textual, `vitest run` sobre los tests del módulo, restauración desde la copia y `cmp` byte a byte (siempre OK). Se ejecutaron DENTRO del candado de Stryker porque mutan en su sitio y Stryker copia el
repositorio entero a su sandbox al arrancar. Resultado, tal como lo dejó cada tanda (los números salen de los ficheros de salida, no de memoria):

- **Tanda 1** (38 casos, contra el código de aquella hora): 36 MUERTOS, 0 supervivientes y **2 «NO-APLICA»** (el texto a sabotear ya no existía porque, entre medias, quité los valores por defecto de la desestructuración de `milisegundosDe`; se rehicieron en la tanda 2).
- **Tanda 2** (7 casos contra el código definitivo de `escalaMovimiento.ts`): 5 MUERTOS y **2 «NO-APLICA»** (error mío: la herramienta que escribió el fichero de casos había colapsado las barras invertidas de las dos expresiones regulares y el texto no se encontraba).
- **Tanda 3** (esos 2 casos, ya con el texto correcto): 2 MUERTOS.
- Total: **43 sabotajes distintos aplicados, 43 MUERTOS, 0 supervivientes**; cada uno por la razón correcta (la primera prueba roja es la del hallazgo que dice protegerse). Los 4 «NO-APLICA» no cuentan como sabotajes, y los cuatro se repitieron con éxito.
- Tras cada caso el fichero se restauró desde su copia y se comprobó con `cmp` (los tres de producción de la última tanda, idénticos; el lector solo difiere de la copia de la tanda 1 en su comentario de `PATRON_LEXICO`, que reescribí después, y lo he comprobado con `diff`).

| Sabotaje | Pruebas rojas | Primera prueba roja |
| --- | --- | --- |
| B1a: `//` solo tras blanco (la regla vieja) | 3 | «B1(a)… pegada a un punto y coma» |
| B1b: el lector no conoce las cadenas | 12 | «B1(b)(c)… una "//" con blanco delante DENTRO de una cadena» |
| B1c: la barra invertida no escapa nada | 2 | «B1(c)… una llave de apertura en un selector» |
| B1d: la profundidad no cuenta las llaves de cierre de más / siempre 0 | 4 / 10 | «B1(d)… una llave de cierre de más al final» |
| B1e: un nombre con interpolación nunca es no verificable / una comilla sin cerrar no se declara | 8 / 2 | «B1(e)… la interpolación es el nombre entero» / «una cadena con comillas dobles que no se cierra…» |
| `esLecturaFiable` ignora las sentencias no verificables / la profundidad | 3 / 5 | «esLecturaFiable…» |
| CRLF no se normaliza al entrar | 3 | «los finales de línea de Windows…» |
| B2: `not/or/coma/#{` no cambian el sentido / la coma no lo cambia / las dos condiciones cuentan / `@-webkit-keyframes` / `@MEDIA` en mayúsculas | 6 / 3 / 2 / 3 / 2 | «B2…» |
| B5: el nombre canónico no quita el prefijo / no pasa a minúsculas | 7 / 3 | «B5…» |
| B7: el número de línea se calcula partiendo todo el texto | 1 | «el coste de leer una hoja grande es lineal» |
| @s33 / @s8: fallan abiertas ante una hoja sin lectura fiable | 4 / 4 | «B1: una hoja que el lector no puede leer entera…» |
| @s33: no canonicaliza el nombre / @s8: `animation: none !important` cuenta como entrada / `animation-name: none` deja de ser entrada | 5 / 3 / 2 | «B5…», «B4/B6…», «"animation-name: none" SÍ cuenta como entrada (fila firmada…)» |
| @s16: `!important` enmascara el tiempo / un token que parece tiempo se ignora / el literal distingue mayúsculas / `ALL` en mayúsculas / no canonicaliza / falla abierta ante hoja rota / el segundo tiempo es duración | 3 / 9 / 15 / 3 / 7 / 4 / 5 | «B3…», «B5…», «B1…», «B6…» |
| @s16 (código definitivo, tandas 2 y 3): el exponente se ignora / los segundos no corren el exponente / la unidad distingue mayúsculas / el exponente de una sola cifra / el número sin unidad de una cifra / la parte en curso no nace vacía / un separador no abre otra parte | 15 / 24 / 5 / 3 / 3 / 46 / 52 | «B3…», «tabla de 30 filas del contrato…» |
| @s20: `animation: none` cuenta / opacidad con `=== '0'` / sin normalizar el valor / sin canonicalizar el nombre / falla abierta ante hoja rota / la hoja se casa por «contiene» | 8 / 8 / 4 / 4 / 4 / 1 | «@s20 B4…», «@s20 B1…», «solo el fichero del hero está autorizado» |

## 7. Verificaciones

- `pnpm exec vitest run` sobre mis cinco ficheros + `Hero.test.tsx`: 6 ficheros, **598 pruebas** verdes (antes de la ola: 258).
  Por fichero: lector 155, movimientoRespetuoso 100, escalaMovimiento 155, accesibilidad-movimiento 98; `movimiento-global` y `Hero.test.tsx` sin cambios de recuento.
- `pnpm test` completo a las 12:39: **90 ficheros, 2374 pruebas** verdes (con los ficheros de los otros dos agentes tal como estaban en ese momento; desde entonces solo cambió `escalaMovimiento.ts` y comentarios).
- Al final de la ola, con el código definitivo: `pnpm run lint` (oxlint `--deny-warnings`) salida 0, 0 errores y 0 avisos; `pnpm run typecheck` (`tsc -b`) salida 0;
  `pnpm exec tsc -p tsconfig.e2e.json --noEmit` salida 0; `pnpm exec tsc -p tsconfig.app.json --noEmit` salida 0.
  (`pnpm run typecheck` falló UNA vez, a mitad de la ola, por `TOPE_DE_UNA_ESPERA_MS` en `tests/e2e/hero-reducido.spec.ts`: un fichero del agente C a medias, no mío; después quedó limpio.)
- Las 20 hojas reales (3 + 12 + 5) pasan las cuatro puertas SIN ningún cambio en ellas y con `ficherosSinLecturaFiable = []`. CRLF y LF dan informes idénticos.
  (`src/components/Hero.module.scss` fue modificado por otro agente durante la ola — solo comentarios `//` —: las cuatro puertas siguen en verde.)

## 8. Desvíos del contrato y puntos que NO se pueden cerrar sin decisión

1. **`animation-name: none` es entrada en @s8 y NO es aparición animada en @s20.** La fila firmada de @s8 («`animation-name: none` dentro de `reduce` → incumple») obliga a
   contarla como entrada; en @s20 no hay fila firmada sobre `none` y la guarda «el recuento es mayor que 0» no puede inflarse con algo que no hace aparecer nada. El encargo decía
   que `esDeEntrada` «sí excluye `none`»: solo lo hace para `animation` (la fila lo exige), no para `animation-name`. Unificado lo que se podía unificar (`animation: none`, con cualquier grafía).
2. **El export `HOJAS_AUTORIZADAS_A_ANIMAR_LA_ENTRADA` (array) pasa a `HOJA_AUTORIZADA_A_ANIMAR_LA_ENTRADA` (literal).** Solo lo importaba `accesibilidad-movimiento.test.ts`. La cláusula de @s20
   dice «la lista de hojas autorizadas está escrita a mano en este escenario —solo la del hero—»: el literal escrito a mano sigue en el test («la hoja autorizada … es exactamente la del hero»), pero el módulo ya no
   exporta una lista. Es el cierre pedido en B6 («simplifica el código»). Si el judge prefiere conservar el array, se puede volver, y el `.some`/`.every` quedaría como equivalente justificado.
3. **Se INVIERTE una aserción de la ola 1B** (no es una fila firmada): «un token que solo CONTIENE un tiempo (el nombre "fade400ms", la unidad "400msx") no es un tiempo» ya no da 0 valores
   no verificables para `400msx` (ahora falla cerrado, que es lo que pide B3); `fade400ms` sigue siendo un nombre.
4. **Más de lo que pedía B1**: una cadena sin cerrar en su línea y un `}` sin `{` también se declaran (fallan cerrado); un comentario de bloque sin cerrar llega al final de la hoja (como en CSS); una propiedad
   personalizada con interpolación (`--#{$n}`) se ignora a propósito (por su prefijo nunca es de movimiento).
5. **Límites que SIGUEN ABIERTOS (no pedidos):** propiedades anidadas de Sass (`transition: { duration: 1s }`, que el lector lee como `duration`); `visibility: collapse`, `display: none`, `clip-path`, `transform: scale(0)`
   y `opacity: var(--x)` / `calc(0)` como estado base oculto (B4 solo cubría las grafías de `0` y `hidden`); `//` tras `,` o `)` sin blanco; la curva (`ease-in`, `linear`) no se vigila en las declaraciones
   (solo `cubic-bezier()`/`steps()` fallan, por llevar paréntesis). Se dejan dichos, no arreglados.
6. **Sin verificar en documentación oficial** (no hay internet y no lo he medido): que CSS acepte las unidades de tiempo y el exponente `e` sin distinguir mayúsculas (se ASUME; si no fuera así, `0.9S` sería una declaración
   inválida que el navegador descartaría y la puerta la señalaría de más, es decir, por el lado seguro); que una cadena sin cerrar termine en el salto de línea (CSS Syntax «bad-string»; mi implementación la declara no verificable en vez de fiarse); la semántica
   exacta de `not`/`or` dentro de paréntesis en `@media` (da igual: cualquier consulta con `not`, `or`, coma o `#{` es `media-ajena`, que no cubre nada).
7. **Lo que sí MEDÍ**: tiempo de lectura de 20.000 declaraciones (509 KB): 31 ms con el lector nuevo frente a 29,2 s en la prueba antes del arreglo (en una máquina con otros procesos; el revisor midió 8 s en reposo).
