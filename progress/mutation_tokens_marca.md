# Mutacion - feature tokens_marca (id 1)

**Veredicto:** PASS
**Score:** 129/130 = 99.23% bruto; 129/129 = 100.00% sobre mutantes no-equivalentes
(umbral: 100%, harness.config.json -> mutation.threshold = 1.0 /
stryker.config.json -> thresholds.break = 100)

Esta es la medicion OFICIAL del mutation_tester sobre el intento 2 del
tdd_craftsman (cierre de huecos tras el intento 1, que midio 119/130 =
91.54% y queda documentado mas abajo como historial). Medida de forma
independiente, sin confiar en la cifra que reporto el tdd_craftsman en
progress/tdd_tokens_marca.md: se volvio a correr Stryker desde cero sobre
los tres ficheros y, ademas, se reprodujo computacionalmente la
justificacion del mutante equivalente (ver seccion correspondiente).

## Como se corrio (ficha de reproduccion)

Siguiendo el patron de memoria organizacional
informe-de-mutacion-con-timeouts-miente: medido fichero a fichero, a
concurrency: 1 (ya fijado en stryker.config.json), sin ninguna otra corrida
de Stryker en paralelo sobre este repo (verificado: tasklist sin procesos
node/stryker antes de empezar). Columna "# timeout" leida ANTES que el score
en las tres corridas: 0 en las tres. El informe es valido.

Nota de entorno (infraestructura del arnes, no un hallazgo de la feature):
node .harness/harness.mjs mutate <target> (que ejecuta
"pnpm exec stryker run --mutate {{target}}" tal cual declara
harness.config.json) se probo primero tal cual pide el protocolo y falla en
esta maquina con "Cannot find TestRunner plugin vitest" - Stryker no
resuelve el plugin @stryker-mutator/vitest-runner via el glob por defecto
["@stryker-mutator/*"] pese a estar instalado (mismo sintoma ya documentado
por el tdd_craftsman en el intento 1). Se repitio cada corrida directamente
con "pnpm exec stryker run --mutate <fichero> --plugins @stryker-mutator/vitest-runner",
que si carga el plugin y corre correctamente. No se toco ningun fichero de
configuracion para esto.

Comandos ejecutados, uno a uno, cada uno esperando a que el anterior terminara:

    pnpm exec stryker run --mutate src/lib/contraste.ts --plugins "@stryker-mutator/vitest-runner"
    pnpm exec stryker run --mutate src/lib/tokens.ts --plugins "@stryker-mutator/vitest-runner"
    pnpm exec stryker run --mutate src/lib/puertaLiteralesColor.ts --plugins "@stryker-mutator/vitest-runner"

## Resultado por fichero (medicion oficial, intento 2)

| Fichero | total | killed | survived | # timeout | # errors | score |
| --- | --- | --- | --- | --- | --- | --- |
| src/lib/contraste.ts | 65 | 64 | 1 | 0 | 0 | 98.46% |
| src/lib/tokens.ts | 12 | 12 | 0 | 0 | 0 | 100.00% |
| src/lib/puertaLiteralesColor.ts | 53 | 53 | 0 | 0 | 0 | 100.00% |
| Total feature | 130 | 129 | 1 | 0 | 0 | 99.23% |

Coincide exactamente con la cifra que el tdd_craftsman reporto en
progress/tdd_tokens_marca.md ("Intento 2"), ahora confirmada por medicion
independiente del mutation_tester.

## Mutante superviviente (1) - equivalente, verificado y excluido

src/lib/contraste.ts:36 (EqualityOperator, mutante generado por Stryker),
dentro de la funcion componenteLineal:

    -     return canal <= UMBRAL_GAMMA_LINEAL
    +     return canal < UMBRAL_GAMMA_LINEAL

componenteLineal solo es alcanzable desde el API publico
(calcularRatioContraste / evaluarAptitudPareja) a traves de
aComponentesRgb, que produce canal8Bits como parseInt de 2 digitos
hexadecimales ya validados por PATRON_HEXADECIMAL_VALIDO: siempre un entero
en [0, 255]. canal = canal8Bits / 255 y UMBRAL_GAMMA_LINEAL = 0.03928.
0.03928 * 255 = 10.0164, que no es entero, asi que ningun entero k en
[0, 255] puede dar k/255 === 0.03928 exactamente: para todo el dominio de
entrada real, "canal <= UMBRAL" y "canal < UMBRAL" producen el mismo
booleano.

Verificacion independiente del mutation_tester (no se dio por buena la
justificacion del tdd_craftsman sin comprobarla; se re-ejecuto el calculo
con Node.js):

    const UMBRAL = 0.03928;
    let diffs = 0;
    for (let k = 0; k <= 255; k++) {
      const canal = k / 255;
      if ((canal <= UMBRAL) !== (canal < UMBRAL)) diffs++;
    }
    // diffs === 0 (comprobado: 0 diferencias en los 256 valores posibles)

Ejecutado sobre los 256 valores posibles de canal8Bits: 0 diferencias.
Confirma que <= y < en esta linea son observacionalmente identicos para
cualquier entrada que este codigo puede recibir en este repositorio (un
hexadecimal valido de 6 digitos, la unica entrada que calcularRatioContraste
acepta tras validarHexadecimal). No hay, ni puede construirse, un test que
los distinga sin cambiar el contrato de entrada de calcularRatioContraste.

Mutante genuinamente equivalente. Excluido del computo de huecos reales,
conforme a docs/mutation-testing.md ("Un mutante equivalente... puede
excluirse, pero solo con justificacion explicita"). Sobre el conjunto de
mutantes no-equivalentes: 129/129 = 100%, que si alcanza el umbral de
harness.config.json (1.0) / stryker.config.json (thresholds.break: 100).

No confundir con el mutante hermano de la linea 37
(canal / DIVISOR_GAMMA_LINEAL -> canal * DIVISOR_GAMMA_LINEAL), que en el
intento 1 tambien sobrevivio pero NO era equivalente (el unico valor que
alcanzaba esa rama entonces era canal8Bits=0, indistinguible entre / y *,
pero cualquier byte 1-10 en la misma rama si los distingue). Ese hueco real
ya fue cerrado por el tdd_craftsman en el intento 2 con el test
"@s2 ... refuerzo mutacion: un canal bajo pero no nulo ..." (#010101/#FFFFFF)
y quedo confirmado killed en esta corrida.

## Historial - intento 1 (rechazado, referencia)

El intento 1 (primera medicion del mutation_tester, antes del cierre de
huecos por el tdd_craftsman) midio 119/130 = 91.54%, con 11 supervivientes
(1 equivalente ya identificado entonces + 10 huecos reales de asercion,
ninguno de produccion). Detalle completo de esos 11 mutantes, ubicacion
exacta y que faltaba en cada test, conservado a continuacion para
trazabilidad:

### src/lib/contraste.ts (5, intento 1)

1. src/lib/contraste.ts:36 (EqualityOperator) - canal <= UMBRAL_GAMMA_LINEAL
   -> canal < UMBRAL_GAMMA_LINEAL. EQUIVALENTE (ver justificacion arriba,
   ahora tambien verificada por el mutation_tester). Excluido, no cuenta
   como hueco de test.
2. src/lib/contraste.ts:37 (ArithmeticOperator) - canal / DIVISOR_GAMMA_LINEAL
   -> canal * DIVISOR_GAMMA_LINEAL. Hueco real (byte=0, el unico caso
   cubierto entonces, no distingue / de *). CERRADO en intento 2 con
   #010101/#FFFFFF -> 20.87. Confirmado killed en esta corrida.
3. src/lib/contraste.ts:65 (CallExpression) - validarHexadecimal(fondo) ->
   eliminada. Hueco real (ningun test probaba fondo invalido con color
   valido). CERRADO en intento 2 con
   calcularRatioContraste('#77286B', '#ZZZZZZ'). Confirmado killed.
4. src/lib/contraste.ts:26 (Regex, sin ^) - ningun test probaba basura antes
   de 6 digitos hex validos. CERRADO con
   calcularRatioContraste('X#77286B', '#FFFFFF'). Confirmado killed.
5. src/lib/contraste.ts:26 (Regex, sin $) - simetrico, basura despues.
   CERRADO con calcularRatioContraste('#77286BXY', '#FFFFFF'). Confirmado
   killed.

### src/lib/tokens.ts (3, intento 1)

6-8. src/lib/tokens.ts:24-26 (StringLiteral) - uso: 'texto normal' -> uso:
""  en cualquiera de las 3 parejas de "texto normal". El test de @s16 solo
comprobaba length > 0 y every(...), verdad parcial que sobrevive si una
pareja pierde su etiqueta. CERRADO en intento 2 con aserciones de conteo
exacto (toHaveLength(3)/(1)/(1) por uso). Confirmados killed (3 mutantes,
cubiertos por el mismo test de refuerzo).

### src/lib/puertaLiteralesColor.ts (3, intento 1)

9. src/lib/puertaLiteralesColor.ts:62 (ArrayDeclaration) - senalados: [] ->
   con relleno, en el caso de 0 ficheros. El test de @s21 nunca leia
   informe.senalados. CERRADO anadiendo esa asercion al test existente.
   Confirmado killed.
10. src/lib/puertaLiteralesColor.ts:30 (Regex) - hsla? -> hsla (pierde hsl(
    sin alfa). Ningun test usaba la forma funcional sin alfa. CERRADO con
    un fichero que declara hsl(88, 79%, 44%). Confirmado killed.
11. src/lib/puertaLiteralesColor.ts:56 (StringLiteral, flags de regex) -
    new RegExp(patron, 'i') -> flags "" sobre PATRON_NOMBRE_DE_COLOR. Ningun
    test usaba un nombre de color CSS en mayusculas/mixto. CERRADO con un
    fichero que declara WHITE. Confirmado killed.

## Conclusion

Los 10 huecos reales del intento 1 quedan confirmados killed en esta
medicion oficial (verificado directamente, no asumido a partir de la
bitacora del tdd_craftsman). El unico superviviente restante es el mutante
equivalente contraste.ts:36, verificado computacionalmente por este agente.
Score sobre mutantes no-equivalentes: 129/129 = 100%, igual al umbral
exigido. 0 timeouts en las tres corridas de esta medicion oficial. No se
edito ningun fichero de src/ ni de test durante esta medicion.
