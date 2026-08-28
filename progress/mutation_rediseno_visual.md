# Mutación — feature rediseno_visual (24)

**Veredicto:** PASS
**Score bruto:** 1364/1380 = 98.84 % (umbral `harness.config.json` → `mutation.threshold`: 100 %)
**Score sobre mutantes NO equivalentes:** 1364/1364 = 100.00 %

> Esta es la medición FINAL y CONSOLIDADA de `mutation_tester`, y sustituye
> por completo la medición original de esta misma feature (FAIL, 1203/1440 =
> 83.54 % bruto, 235 supervivientes reales en 12 de 14 ficheros). Tras esa
> medición se lanzaron 6 sesiones de refuerzo de tdd_craftsman (una por
> fichero o grupo de ficheros pequeños), cada una con su propia corrida real
> de Stryker y su propia declaración de mutantes equivalentes. Esa
> declaración le corresponde al mutation_tester, no al tdd_craftsman: esta
> medición re-verifica, uno a uno y con mi propio criterio matematico y
> empirico, los 16 mutantes que las 6 sesiones declararon equivalentes, sin
> aceptar ninguno de palabra, y corre Stryker de nuevo, de forma
> completamente independiente, sin usar ninguna cifra reportada por las
> sesiones de refuerzo salvo como hipotesis a contrastar.

## 0. Alcance verificado

Repeti el mismo metodo que la medicion original: `git diff 3cb93ec --name-only`
(commit inmediatamente anterior al inicio de la feature) + `git status
--porcelain` (ficheros nuevos sin trackear), filtrado al patron que
`stryker.config.json` declara como superficie mutable (`src/lib/**/*.ts` +
`src/**/*-logica.ts`, sin `.test.ts`). Confirmo la misma lista de 14 ficheros
que en la medicion original:

- `src/components/Cabecera-logica.ts`
- `src/components/Equipo-logica.ts`
- `src/components/Hero-logica.ts`
- `src/components/SelectorPaleta-logica.ts`
- `src/components/Servicios-logica.ts`
- `src/lib/diseno/contratoRedisenho.ts`
- `src/lib/diseno/inventarioModulos.ts`
- `src/lib/diseno/rolesDescartados.ts`
- `src/lib/diseno/tokensColor.ts`
- `src/lib/diseno/bundleDeDiseno.ts`
- `src/lib/diseno/datosDelSitio.ts`
- `src/lib/diseno/fidelidadPrototipo.ts`
- `src/lib/diseno/matrizDeContraste.ts`
- `src/lib/diseno/usoDelAcento.ts`

Confirmado explicitamente que `src/imagenes-hrefDeDestino.test.ts` (nuevo,
visto en `git status`) NO forma parte de esta superficie: pertenece a la
feature despliegue_github_pages (ya done), y en cualquier caso no encaja en
ninguno de los dos patrones de `stryker.config.json` -> `mutate` (no vive en
`src/lib/**` ni se llama `*-logica.ts`, y ademas es un `.test.ts`, excluido
explicitamente). No se muto.

`tokensColor.ts` tiene ahora menos lineas que en la medicion original: una de
las sesiones de refuerzo (con mi autorizacion como craftsman_lead, misma
decision que ya se habia tomado para `buscarAfirmacionesClinicasProhibidas`
en una sesion anterior de esta feature) borro codigo huerfano sin ningun
consumidor en todo `src/` (MATRIZ_DE_USO_MARCA, resolverMatrizDeUso,
motivoDeVacuidadDeVariantes, ejecutarComprobacionDeContrasteDeVariantes).
Confirme el borrado leyendo el fichero real antes de mutar: el efecto en la
superficie mutable es una caida de 199 a 139 mutantes en ese fichero (-60), y
es la UNICA diferencia de superficie entre esta medicion y la original,
confirmado tambien aritmeticamente en la seccion 1: el total baja de 1440 a
1380, exactamente -60.

Antes de arrancar: `pnpm exec vitest run` de la suite completa en aislamiento
dio 88 ficheros, 1300 tests, verde (linea de partida limpia, sin ningun
sabotaje manual olvidado por ninguna de las 6 sesiones).

## 1. Metodologia: lotes bajo el limite de 365 mutantes, sin cerrojo compartido

`harness.config.json` -> `commands.mutate` es `pnpm exec stryker run` (sin
`--mutate`); invoque Stryker directamente con `--mutate`, en lotes, por el
mismo motivo aritmetico que documente en la medicion original: cualquier
corrida de Stryker con 365 mutantes totales o mas hace que el literal de
cadena que Stryker incrusta en el codigo instrumentado (el numero de mutante,
por ejemplo el mutante 365) aparezca como texto visible dentro de `src/`, y
`rolesDescartados.test.ts` en su escenario s13 lo detecta como una falsa
afirmacion clinica ("365"), tirando el dry run entero antes de mutar nada.
Mantuve cada lote por debajo de 365, verificando la linea "Instrumented N
mutant(s)" de cada corrida antes de dejarla continuar.

Antes de arrancar cualquier lote, comprobe que no habia ninguna corrida de
Stryker activa ni huerfana: una consulta de procesos node.exe no mostro
ningun proceso con stryker/vitest en su linea de comandos (solo procesos
ajenos: agentes ACP de IntelliJ, dos "vite preview" de otra sesion), y el
fichero de cerrojo compartido de sesiones anteriores no existia. Ya no hay
agentes hermanos compitiendo por el cerrojo (todos terminaron sus 6 sesiones
de refuerzo), asi que no use el mecanismo de cerrojo, corri los 6 lotes
estrictamente en serie, esperando cada uno a completar antes de lanzar el
siguiente.

Lotes (mismo agrupamiento que la medicion original, salvo el recuento de
tokensColor.ts):

1. Cabecera-logica.ts + Equipo-logica.ts + Hero-logica.ts + SelectorPaleta-logica.ts + Servicios-logica.ts -- 108 mutantes
2. contratoRedisenho.ts + inventarioModulos.ts + rolesDescartados.ts + bundleDeDiseno.ts -- 241 mutantes
3. tokensColor.ts + usoDelAcento.ts -- 232 mutantes (139 + 93; antes eran 292 = 199 + 93, la diferencia de 60 es exactamente el codigo huerfano borrado)
4. datosDelSitio.ts -- 174 mutantes
5. fidelidadPrototipo.ts -- 318 mutantes
6. matrizDeContraste.ts -- 307 mutantes

Total: 1380 mutantes (1440 menos 60, cuadra exactamente con la unica
diferencia de superficie real). Los seis lotes se mantuvieron muy por debajo
de 365; no hizo falta dividir ninguno mas.

## 2. Resultado consolidado por fichero (corrida real, independiente)

| Fichero | total | killed | timeout | survived | no cov | score bruto | equivalentes (re-verificados) | score no-equiv. | veredicto |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cabecera-logica.ts | 31 | 30 | 0 | 1 | 0 | 96.77% | 1 | 30/30 = 100% | PASS |
| Equipo-logica.ts | 24 | 23 | 0 | 1 | 0 | 95.83% | 1 | 23/23 = 100% | PASS |
| Hero-logica.ts | 10 | 10 | 0 | 0 | 0 | 100.00% | 0 | 100% | PASS |
| SelectorPaleta-logica.ts | 16 | 16 | 0 | 0 | 0 | 100.00% | 0 | 100% | PASS |
| Servicios-logica.ts | 27 | 25 | 0 | 1 | 1 | 92.59% | 2 | 25/25 = 100% | PASS |
| contratoRedisenho.ts | 28 | 28 | 0 | 0 | 0 | 100.00% | 0 | 100% | PASS |
| inventarioModulos.ts | 59 | 59 | 0 | 0 | 0 | 100.00% | 0 | 100% | PASS |
| rolesDescartados.ts | 96 | 94 | 0 | 2 | 0 | 97.92% | 2 | 94/94 = 100% | PASS |
| bundleDeDiseno.ts | 58 | 58 | 0 | 0 | 0 | 100.00% | 0 | 100% | PASS |
| tokensColor.ts | 139 | 133 | 4 | 2 | 0 | 98.56% | 2 | 137/137 = 100% | PASS |
| usoDelAcento.ts | 93 | 92 | 0 | 1 | 0 | 98.92% | 1 | 92/92 = 100% | PASS |
| datosDelSitio.ts | 174 | 174 | 0 | 0 | 0 | 100.00% | 0 | 100% | PASS |
| fidelidadPrototipo.ts | 318 | 310 | 3 | 5 | 0 | 98.43% | 5 | 313/313 = 100% | PASS |
| matrizDeContraste.ts | 307 | 305 | 0 | 2 | 0 | 99.35% | 2 | 305/305 = 100% | PASS |
| Total | 1380 | 1357 | 7 | 15 | 1 | 98.84% | 16 | 1364/1364 = 100% | PASS |

Los 14 ficheros llegan al 100% sobre mutantes no equivalentes. Los 16
mutantes "no killed" (15 survived + 1 no-cov) son, en su totalidad, los
mismos 16 que las 6 sesiones de refuerzo declararon equivalentes, confirmado
mutante a mutante (fichero:linea:columna) contra reports/mutation/mutation.json
de cada lote, y cada uno resiste el escrutinio independiente de la seccion 4.
Ningun mutante nuevo, no anticipado, sobrevivio.

## 3. Los 7 timeouts: genuinos, mismo conteo ya documentado, sin necesidad de repetir la corrida

- tokensColor.ts: 4 timeout, confirmados via mutation.json en exactamente las
  mismas 4 ubicaciones que documento la sesion de refuerzo de ese fichero (2
  ya presentes en mi medicion original + 2 nuevos, alcanzables ahora porque
  esa sesion anadio un test de "bloque sin cerrar" que ejercita mas
  profundamente el mismo bucle):
  - tokensColor.ts:137:10-72 LogicalOperator (&& -> ||)
  - tokensColor.ts:137:10-35 ConditionalExpression (cursor < textoScss.length -> true)
  - tokensColor.ts:137:74-145:4 BlockStatement (cuerpo del while vaciado) -- ya documentado en la medicion original
  - tokensColor.ts:144:5-144:18 AssignmentOperator (cursor += UNO -> cursor -= UNO) -- ya documentado en la medicion original
- fidelidadPrototipo.ts: 3 timeout, mismo parser de profundidad de llaves
  duplicado (extraerCuerpoDeBloque), confirmados via mutation.json:
  - fidelidadPrototipo.ts:159:10-31 ConditionalExpression
  - fidelidadPrototipo.ts:159:70-167:4 BlockStatement
  - fidelidadPrototipo.ts:166:5-166:18 AssignmentOperator

El conteo (4 y 3) coincide exactamente con el ya documentado por las sesiones
de refuerzo respectivas, que a su vez ya habian reproducido dos veces cada
uno de forma independiente. Regla 4 del encargo: solo repetir la corrida si
el numero de timeout varia respecto a lo documentado, aqui no varia, asi que
no hice una segunda repeticion sobre estos dos lotes.

Mismo argumento que fije en la medicion original (y que las dos sesiones de
refuerzo confirmaron con su propio sabotaje manual): ambas funciones
(extraerBloqueDeVariante en tokensColor.ts y extraerCuerpoDeBloque en
fidelidadPrototipo.ts) son el MISMO parser de profundidad de llaves
duplicado en los dos ficheros. Vaciar el cuerpo del while o invertir el
incremento del cursor produce, en JS, un bucle sin condicion de parada real
(indexar una cadena fuera de rango siempre da undefined, nunca lanza, y
nunca es igual a la llave de apertura o cierre), un cuelgue real, no
contencion de CPU. Verificado aritmeticamente en cada lote: (killed +
timeout) / total reproduce EXACTO el porcentaje que Stryker imprime en su
propia tabla (98.56 para tokensColor.ts = (133+4)/139x100; 98.43 para
fidelidadPrototipo.ts = (310+3)/318x100). Cuento los 7 como matados, misma
convencion ya fijada en la medicion original.

## 4. Los 16 mutantes "equivalentes" -- re-verificados de forma independiente, uno a uno

Para cada uno confirme (a) que la corrida real de esta sesion lo reproduce
como el mutante superviviente exacto (fichero:linea:columna contra
reports/mutation/mutation.json, no solo contra el resumen del informe de
refuerzo), y (b) mi propia prueba de equivalencia, algebraica cuando es
posible, empirica con Node cuando hace falta contrastar con datos, sin dar
por buena la de la sesion de refuerzo de palabra. En los 16 casos mi propia
prueba coincide con la de la sesion que lo declaro, y en ninguno encontre un
hueco real.

### 4.1 Componentes pequenos (4 equivalentes, mutacion_refuerzo_componentes_pequenos.md)

a) Cabecera-logica.ts:19:9 -- if (!(anchoVentana > 0)) pasa a if (!(anchoVentana >= 0))

Mi propia prueba: sea f(x) la funcion esMovil original y f'(x) el mutante.
Para x <= 0, f(x) devuelve true directamente por la guarda. Para x < 0, f'(x)
tambien devuelve true por la misma guarda mutada. El unico punto de
divergencia POSIBLE en la guarda es x = 0: f(0) toma la guarda (true), f'(0)
NO toma la guarda y cae a "return x < PUNTO_DE_CORTE_NAVEGACION_PX", es decir
0 < 1024 = true. Coinciden. Para x = NaN, ambas comparaciones (NaN > 0 y
NaN >= 0) son false, asi que ambas funciones toman la guarda y devuelven true
por igual. No existe ningun valor real de anchoVentana (numero JS, incluido
NaN) donde f(x) sea distinto de f'(x). Equivalente por construccion,
confirmado.

b) Equipo-logica.ts:33:12 -- split(/\s+/) pasa a split(/\s/), con
filter(Boolean) intacto en la linea siguiente

Mi propia prueba: para cualquier cadena S, S.split(/\s+/) produce la lista de
"palabras" (subcadenas maximas no vacias separadas por espacio en blanco)
intercalada como mucho con una cadena vacia en cada extremo si S empieza o
termina en espacio. S.split(/\s/) produce la MISMA lista de palabras, pero
con una cadena vacia adicional por cada caracter de espacio en blanco extra
dentro de cualquier tramo de espacios consecutivos (cada espacio separa por
su cuenta). filter(Boolean) descarta TODAS las cadenas vacias sin importar su
origen, asi que S.split(/\s+/).filter(Boolean) es identico a
S.split(/\s/).filter(Boolean) para cualquier S. Verificado tambien
empiricamente con un caso de dos espacios en los extremos y dos espacios
interiores: ambos produjeron el mismo resultado tras el filtro. Equivalente
por construccion, confirmado.

c) Servicios-logica.ts:44:54 -- trim().split(/\s+/) pasa a trim().split(/\s/)
(solo se lee el elemento en indice 0)

Mi propia prueba: tras trim(), si la cadena no es vacia, empieza siempre por
un caracter no blanco. El elemento en indice 0 de split(/\s+/) y de
split(/\s/) es, en ambos casos, la subcadena desde el indice 0 hasta el
primer caracter de espacio en blanco (o la cadena entera si no hay ninguno):
el punto de inicio del primer separador es identico para las dos expresiones
regulares, solo difiere cuanto CONSUME el separador, lo cual afecta a los
elementos siguientes, nunca al elemento 0. Como categoriaDeServicio solo
desestructura ese primer elemento, el cambio es invisible para cualquier
entrada. Equivalente por construccion, confirmado.

d) Servicios-logica.ts:45:28 -- primeraPalabra ?? '' pasa a primeraPalabra ??
"Stryker was here!"

Mi propia prueba: por especificacion de String.prototype.split, el resultado
NUNCA es un array vacio para ninguna cadena de entrada, como minimo siempre
hay un elemento (una cadena vacia como unico elemento, para cadena vacia o
solo espacios tras trim()). Por tanto la desestructuracion del primer
elemento del resultado del split nunca deja "primeraPalabra" como undefined:
como mucho vale cadena vacia (valor definido, que no dispara el operador ??).
La rama del valor de reserva es codigo muerto para cualquier entrada real,
existe solo para satisfacer el tipo que TypeScript infiere de una
desestructuracion de array, no por una posibilidad real en tiempo de
ejecucion. Equivalente por construccion del lenguaje, confirmado.

### 4.2 rolesDescartados.ts (2 equivalentes, ya aceptados en mi medicion original, re-verificados aqui desde cero, no solo releidos)

a) rolesDescartados.ts:65:57 -- el patron de reemplazo de
cadena.replace(CARACTERES_ESPECIALES_DE_REGEX, ...), que inserta la propia
coincidencia escapada mediante el patron especial "$&" precedido de barra
invertida, se sustituye por la cadena vacia "".

Re-verificacion independiente (script de Node propio, ejecutado en esta
sesion): ninguna de las 5 AFIRMACIONES_CLINICAS_PROHIBIDAS ("24 h", "24h",
"365", "todos los dias del ano", "siempre hay alguien de guardia") contiene
ninguno de los caracteres especiales de regex (punto, asterisco, mas,
interrogacion, circunflejo, dolar, llaves, parentesis, barra vertical,
corchetes, ni la propia barra invertida). Con el patron sin ninguna
coincidencia, el replace es una no-operacion para CUALQUIER valor de
reemplazo: el resultado es identico a la cadena de entrada, con o sin escape.
escapadaParaRegex / ejecutarPuertaDeAfirmacionesFalsas no tiene ningun punto
de llamada con datos distintos de AFIRMACIONES_CLINICAS_PROHIBIDAS o una
lista vacia. Equivalente para el sistema tal y como existe hoy, confirmado
independientemente.

b) rolesDescartados.ts:58:45 -- el patron PATRON_COMENTARIO_DE_LINEA_COMPLETA
(anclado con un signo de dolar final en modo multilinea) pierde ese ancla
final.

Re-verificacion independiente (script de Node propio, 11 casos: comentario
simple, con indentacion, con codigo antes, con CRLF, sin espacio final,
vacio, sin salto final, con espacios finales, comentario entre lineas de
codigo, etc.): las dos expresiones producen, para cada caso, exactamente el
mismo conjunto de coincidencias y el mismo resultado del replace. Es
equivalente por construccion: el punto en JS nunca casa un salto de linea
(sin la bandera s), asi que la parte ".*" ya se detiene justo antes del fin
de linea, el mismo punto donde el ancla final en modo multilinea tambien
seria verdadera. Confirmado independientemente, con mi propio script, no
solo releyendo la prueba original.

### 4.3 usoDelAcento.ts:66:40 (1 equivalente nuevo, hallazgo de la sesion de refuerzo de roles/acento)

La rama "sin separador" de propiedadDe devuelve una cadena vacia; el mutante
sustituye esa cadena vacia por el literal "Stryker was here!".

Mi propia prueba: el unico consumidor de propiedadDe(linea) es
papelDe(propiedad), que clasifica asi: igual a 'color' da texto, empieza por
'border' da borde, empieza por 'background' o es igual a 'fill' da relleno,
cualquier otro valor da "sin clasificar". Ni la cadena vacia ni "Stryker was
here!" son 'color' ni 'fill', ni empiezan por 'border' ni 'background':
ambas caen en "sin clasificar", el mismo cubo. El valor de cadena de
propiedadDe nunca se expone tal cual en InformeUsoDelAcento (los objetos que
se devuelven llevan ruta, linea y declaracion, nunca la propiedad calculada);
solo importa a traves de en que cubo cae. Como para cualquier cadena fija que
no coincida con los 4 literales o prefijos reconocidos el resultado
observable es identico, ningun test, con cualquier entrada posible, puede
distinguir el mutante. Equivalente por construccion, confirmado
independientemente.

### 4.4 tokensColor.ts (2 equivalentes, sesion de refuerzo de tokensColor)

a) tokensColor.ts:125:34 -- "coincidenciaEncabezado.index === undefined" pasa
a la constante "false"

Mi propia prueba: patronDeEncabezadoDeVariante construye la regex sin la
bandera g. Por especificacion de ECMAScript, String.prototype.match sin
bandera g se comporta como RegExp.prototype.exec: si hay coincidencia, el
array resultado SIEMPRE trae la propiedad index definida (nunca undefined),
el tipo opcional que declara TypeScript es una sobre-aproximacion del
sistema de tipos (no distingue global de no-global), no una posibilidad real
en este punto de llamada. Por tanto, en la rama donde coincidenciaEncabezado
ya es verdadero, la comparacion contra undefined es SIEMPRE falsa: sustituirla
por la constante false no cambia ningun resultado. Equivalente por
construccion del lenguaje, confirmado independientemente (mismo patron que
usa matrizDeContraste.ts:54:22, ver 4.6b).

b) tokensColor.ts:137:10 -- "cursor < textoScss.length" pasa a "cursor <=
textoScss.length"

Mi propia prueba: cuando el bloque SI cierra, el bucle termina siempre por el
lado "profundidad > 0" volviendose falso en la MISMA iteracion que procesa la
llave de cierre, el AND corta ahi, sin importar el valor de la comparacion de
cursor. Cuando el bloque NO cierra, la unica diferencia que introduce el
operador relajado es una iteracion extra que lee un caracter en la posicion
exactamente igual a la longitud del texto; en JS, indexar una cadena en o mas
alla de su longitud siempre da undefined (nunca lanza), que no es igual a la
llave de apertura ni de cierre, asi que la profundidad no cambia por esa
iteracion extra, y el bucle sigue terminando por la misma razon (con el
cursor un paso mas adelante) cayendo en la MISMA rama de error, con el MISMO
mensaje (que no depende del valor del cursor). Ninguna entrada posible hace
observable la diferencia entre el operador estricto y el relajado.
Equivalente por construccion, confirmado independientemente (mismo argumento
que fidelidadPrototipo.ts:159:10, ver 4.5a, el mismo parser duplicado).

### 4.5 fidelidadPrototipo.ts (5 equivalentes, sesion de refuerzo de fidelidadPrototipo)

a) fidelidadPrototipo.ts:159:10 -- "cursor < texto.length" pasa a "cursor <=
texto.length"

Mismo parser duplicado que tokensColor.ts:137:10 (seccion 4.4b), mismo
argumento, verificado independientemente sobre el codigo real de este
fichero: equivalente por construccion.

b) fidelidadPrototipo.ts:304:59 -- dentro de
extraerParejasTranslucidasDelPrototipo, el valor de reserva de una lectura
que puede faltar (declaraciones[fila.prototipo] con valor de reserva cadena
vacia) pasa a tener como reserva el literal "Stryker was here!"

Mi propia prueba: el resultado se pasa DIRECTAMENTE a
esColorTranslucido(valor), que solo comprueba si el valor recortado empieza
por "rgba(" (insensible a mayusculas). Ni la cadena vacia ni "Stryker was
here!" empiezan por "rgba(", asi que ambos producen false: el booleano, y
por tanto la lista que devuelve el filtro, es identico con cualquiera de los
dos valores. Confirmado leyendo el codigo real de esColorTranslucido (linea
291-293). Equivalente por construccion, independientemente de si la rama es
alcanzada por algun test real o no.

c) fidelidadPrototipo.ts:537:56 -- dentro de la llamada a
comprobarDerivacionPorComposicion, el valor de reserva de
declaraciones[ROL_DE_FONDO_DEL_PROTOTIPO] pasa de cadena vacia a "Stryker was
here!"

Mi propia prueba: el resultado entra en componerTranslucidoSobreElFondo como
el parametro fondo, y ahi solo se usa para comprobar si casa el patron
anclado de 6 digitos hexadecimales tras la almohadilla. Ni la cadena vacia ni
"Stryker was here!" (recortadas) casan ese patron: ambas toman la rama que
devuelve null. El valor de cadena en si nunca se filtra a la salida (solo
aparece la constante fija del motivo de no componible). Confirmado leyendo el
codigo real de componerTranslucidoSobreElFondo (linea 370-382). Equivalente
por construccion, confirmado independientemente.

d) y e) fidelidadPrototipo.ts:552:7 -- "parejas.length > NINGUNO" pasa a la
constante "true" (ConditionalExpression), y por separado pasa a
"parejas.length >= NINGUNO" (EqualityOperator)

Mi propia prueba, verificada leyendo el codigo real de
ejecutarPuertaDeFidelidadDelPrototipo: antes de llegar a esta linea, dos
guardas ya garantizan invariantes. Primera guarda: si la tabla de
correspondencia esta vacia, la funcion devuelve temprano, asi que en el punto
mutado "tabla.length" es siempre mayor o igual a 1. Segunda guarda: la
funcion elPrototipoDeclaraSusTemas exige que el numero de temas del
prototipo sea mayor que la constante SOLO_EL_TEMA_BASE, cuyo valor es 1
(confirmado leyendo la constante en el fichero real), asi que el numero de
temas es siempre mayor o igual a 2 cuando se llega a la linea mutada.
"parejas" se construye como el numero de temas multiplicado por el numero de
filas de la tabla, asi que "parejas.length" es siempre mayor o igual a 2
multiplicado por 1, es decir mayor que 0, SIEMPRE que el codigo llegue a esa
linea: la clausula original es verdadera en el 100% de las entradas
alcanzables, indistinguible de sustituirla por el literal true o de relajar
el operador estricto al no estricto. Equivalente por construccion, para las
dos mutaciones, confirmado independientemente con lectura directa de las tres
funciones implicadas.

### 4.6 matrizDeContraste.ts (2 equivalentes, sesion de refuerzo de matrizDeContraste)

a) matrizDeContraste.ts:40:12 -- el cuantificador de cero-o-mas espacios en
blanco al final del patron de encabezado de tema por defecto pasa a un
cuantificador de cero-o-mas caracteres no-espacio

Mi propia prueba: en extraerBloqueDeTemaDelPrototipo, solo se lee
encabezado.index (linea 58); el texto capturado por la coincidencia entera
(incluida la cola del cuantificador) nunca se usa. Ambos cuantificadores son
de longitud variable pero SIEMPRE pueden casar cero caracteres, asi que
ninguno de los dos desplaza el punto de INICIO de la coincidencia, la
posicion donde empieza el resto del patron es identica para cualquier
entrada, con cualquiera de los dos cuantificadores. Equivalente por
construccion, confirmado independientemente.

b) matrizDeContraste.ts:54:22 -- "encabezado.index === undefined" pasa a la
constante "false"

Mismo argumento que tokensColor.ts:125:34 (seccion 4.4a): patronDeEncabezadoDeTema
tampoco lleva la bandera g, asi que por especificacion de
String.prototype.match, si encabezado es verdadero, index nunca es
undefined. Equivalente por construccion del lenguaje, confirmado
independientemente.

## 5. Ficheros 100% limpios, sin ningun mutante superviviente ni equivalente

Hero-logica.ts, SelectorPaleta-logica.ts, contratoRedisenho.ts,
inventarioModulos.ts, bundleDeDiseno.ts y datosDelSitio.ts llegan a 100.00%
bruto (sin ningun survived, no-cov ni timeout), confirmado en esta corrida
real, independiente de cualquier informe de refuerzo.

## 6. Conclusion

Los 16 mutantes que las 6 sesiones de refuerzo declararon "equivalentes"
resisten mi propio escrutinio independiente, con prueba algebraica (basada
en la especificacion de ECMAScript/regex, o en invariantes que el propio
codigo de produccion ya garantiza antes de la linea mutada) y, donde hizo
falta, verificacion empirica con scripts de Node propios ejecutados en esta
sesion, no heredados de ninguna sesion de refuerzo. Ninguno es un hueco de
test disfrazado de equivalente. Los 7 timeouts genuinos (mismo parser de
profundidad de llaves duplicado en dos ficheros) mantienen el mismo conteo ya
documentado, sin variacion, y se cuentan como matados por la convencion
aritmetica ya fijada en la medicion original.

Score final: 1364/1364 = 100.00% sobre mutantes no equivalentes, igual o por
encima del umbral de harness.config.json -> mutation.threshold (100%). Los 14
ficheros de la superficie mutable de rediseno_visual llegan al 100%.

Veredicto: PASS. No he tocado ningun fichero de src/ ni de test durante esta
medicion (confirmado con pnpm exec vitest run al final: 88 ficheros, 1300
tests, verde, identico al estado de partida). Corresponde a craftsman_lead
decidir marcar la feature done en feature_list.json y proceder con
commit/push.
