# Refuerzo de mutación — rolesDescartados.ts y usoDelAcento.ts (feature rediseno_visual, 24)

**Alcance:** SOLO `src/lib/diseno/rolesDescartados.ts`, `.test.ts`, `usoDelAcento.ts`,
`.test.ts`. Ningún otro fichero tocado.

**Punto de partida:** `progress/mutation_rediseno_visual.md` (FAIL, 83.54 %).
rolesDescartados.ts: 87/96 (7 supervivientes reales + 2 equivalentes ya
aceptados). usoDelAcento.ts: 80/93 (12 supervivientes reales, sin
equivalentes documentados).

**Resultado final (Stryker real, `--mutate` acotado a los 2 ficheros, 189
mutantes, `concurrency: 1`, **0 timeouts** en la única corrida necesaria):**

| Fichero | total | killed | timeout | survived | score bruto |
| --- | --- | --- | --- | --- | --- |
| rolesDescartados.ts | 96 | 94 | 0 | 2 | 97.92 % |
| usoDelAcento.ts | 93 | 92 | 0 | 1 | 98.92 % |
| **Total** | **189** | **186** | **0** | **3** | **98.41 %** |

Los 3 supervivientes finales son equivalentes documentados (2 ya aceptados
previamente + 1 nuevo hallazgo de esta sesión, ver §3). **Score sobre
mutantes NO equivalentes: 186/186 = 100 %** en ambos ficheros — el objetivo
del encargo.

## 1. Metodología

TDD real por cada mutante listado en las secciones "rolesDescartados.ts"
(dentro de "## 4") y "## 7. usoDelAcento.ts" de
`progress/mutation_rediseno_visual.md`: para cada uno,

1. Escribí (o extendí) el test.
2. **Sabotaje manual**: edité `src/` para reproducir la mutación exacta (o la
   más cercana justificable cuando el informe no daba la columna exacta),
   corrí `pnpm exec vitest run <fichero>.test.ts` y confirmé **rojo**.
3. Revertí el sabotaje con `Edit` (nunca con git) y confirmé **verde** de
   nuevo.

Al final, corrí Stryker de verdad sobre los 2 ficheros para la medición
oficial (protocolo de cerrojo compartido con los agentes hermanos: creé
`C:\Users\vhurt\AppData\Local\Temp\claude-stryker-mutex.lock` antes de la
corrida, la solté en cuanto terminó).

## 2. Mapa mutante → test → sabotaje

### rolesDescartados.ts

| Mutante (`progress/mutation_rediseno_visual.md`) | Test añadido/extendido | Sabotaje verificado |
| --- | --- | --- |
| `:202` `variantesSinDeclararlo: []` → relleno (rama sin variantes) | `sin variantes que comprobar falla cerrada...` (+ 2 `expect`) | Rojo confirmado, revertido |
| `:204` `ficherosQueLoUsan: []` → relleno (rama sin variantes) | mismo test | Rojo confirmado, revertido |
| `:212` `variantesSinDeclararlo: []` → relleno (rama sin ficheros) | `sin un solo fichero de estilos falla cerrada...` (+ 2 `expect`) | Rojo confirmado, revertido |
| `:214` `ficherosQueLoUsan: []` → relleno (rama sin ficheros) | mismo test | Rojo confirmado, revertido |
| `:59` `SIN_TEXTO = ''` → texto de relleno | test nuevo `sustituye el comentario recortado por nada, no por un texto de relleno` (aserción de contenido EXACTO, no `.not.toContain`) | Rojo confirmado, revertido |
| `:172` regex `\s*` izquierdo → `\S*` | test nuevo `reconoce el uso aunque haya espacios dentro de "var( ... )"` | Rojo confirmado, revertido |
| `:172` regex `\s*` derecho → `\S*` | mismo test (un único caso con espacio a ambos lados basta para las dos mutaciones) | Rojo confirmado, revertido |

Los 2 equivalentes de la sección 5 del informe (`:65:57` StringLiteral de
`escapadaParaRegex` y `:58:45` Regex del ancla `$` de
`PATRON_COMENTARIO_DE_LINEA_COMPLETA`) **no se tocaron**: la corrida real de
Stryker los reproduce EXACTAMENTE como los dos únicos supervivientes de este
fichero, confirmando la prueba de equivalencia ya aceptada (releída y
verificada, no solo asumida).

### usoDelAcento.ts

| Mutante | Test añadido | Sabotaje verificado |
| --- | --- | --- |
| `:29:31` regex `\s*` izquierdo → `\S*` | `reconoce el uso aunque haya espacios dentro de "var( ... )"` | Rojo confirmado, revertido |
| `:29:31` regex `\s*` derecho → `\S*` | mismo test | Rojo confirmado, revertido (además rompe 2 tests del corpus real) |
| `:34:23` `SIN_SEPARADOR = -1` → `+1` | `una declaración sin dos puntos tras la última llave no se clasifica por accidente` (línea sintética diseñada para que `slice(0,-1)` produzca "color" si el separador se calcula mal) | Rojo confirmado, revertido |
| `:66:10` ConditionalExpression (condición forzada a `false`) | mismo test | Rojo confirmado, revertido. También probé la variante "forzada a `true`": ya la mataban 9 tests preexistentes, sin necesidad de test nuevo |
| `:66:40` StringLiteral `'' → "Stryker was here!"` | mismo test (cobertura de la rama) | **Sobrevive incluso sabiendo la mutación exacta — ver §3, equivalente** |
| `:84:45` ConditionalExpression de `propiedad === 'fill'` | `clasifica "fill" como relleno igual que las propiedades "background*"` | Rojo confirmado (forzado a `false`), revertido |
| `:84:59` StringLiteral `'fill'` → relleno | mismo test | Rojo confirmado, revertido |
| `:123` `comoTexto: []` → relleno (rama sin ficheros) | `sin un solo fichero de estilos falla cerrada...` (+ 4 `expect`) | Rojo confirmado, revertido |
| `:124` `comoBorde: []` → relleno | mismo test | Rojo confirmado, revertido |
| `:125` `comoRelleno: []` → relleno | mismo test | Rojo confirmado, revertido |
| `:126` `sinClasificar: []` → relleno | mismo test | Rojo confirmado, revertido |
| `:139-140` `&&` entre `comoTexto===0` y `comoBorde===0` → `||` | `suspende con un uso ilegal como texto aunque no haya ni un solo uso como borde` + `...como borde aunque no haya... como texto` (par simétrico) | Rojo confirmado en ambos sentidos, revertido. También verifiqué las 2 variantes ConditionalExpression (cada `=== CERO_USOS` forzado a `true`): cada una solo la mata uno de los 2 tests nuevos, confirmando que el par era necesario |

## 3. Hallazgo: un tercer mutante equivalente (`usoDelAcento.ts:66:40`)

`propiedadDe` solo tiene un consumidor: `papelDe(propiedad)`, que clasifica
así:

```
propiedad === 'color'                              -> 'texto'
propiedad.startsWith('border')                      -> 'borde'
propiedad.startsWith('background') || propiedad==='fill' -> 'relleno'
(cualquier otro valor)                               -> 'sin clasificar'
```

El valor `''` que devuelve la rama "sin separador" no es `'color'` ni
`'fill'`, ni empieza por `'border'`/`'background'`: cae en la rama por
defecto `'sin clasificar'`. **Cualquier cadena que tampoco cumpla esas
condiciones** produce exactamente el mismo resultado observable, sea cual
sea su contenido — incluida la cadena de relleno fija que usa StrykerJS
("Stryker was here!"), que no coincide con ninguno de esos 4
literales/prefijos.

Verificado de dos formas:

1. **Algebraica**: por construcción, la clasificación de `papelDe` es
   invariante para cualquier `propiedad` fuera de las 4 cadenas/prefijos
   reconocidos.
2. **Empírica, con sabotaje manual exacto**: reproduje la mutación literal
   (`'' -> "Stryker was here!"`) en `propiedadDe` y corrí
   `usoDelAcento.test.ts` completo (14 tests, incluidos los 2 nuevos que
   ejercitan la rama "sin separador" y el corpus real de 20 ficheros): **los
   14 pasan en verde**, confirmando que ningún test — ni siquiera uno
   diseñado a propósito para esta rama — puede distinguir el mutante a
   través de la API pública (`InformeUsoDelAcento` solo expone los 4
   bucket-arrays por papel, nunca la cadena `propiedad` en sí).

Mismo patrón argumental que los 2 equivalentes ya aceptados de
`rolesDescartados.ts` (§5 del informe de mutación): una diferencia sintáctica
sin ningún efecto observable a través de la API pública del sistema tal y
como existe hoy. `propiedadDe` es privada al módulo y `''` es un valor
centinela deliberado ("propiedad desconocida, clasifícalo como 'sin
clasificar' para que lo revise una persona"), no una decisión que dependa de
su contenido exacto.

**No inventé un test que fingiera matarlo.** La Ley 2 del TDD ("no escribas
más test del necesario") y la honestidad del proceso pesan más que forzar un
número: dejo esto marcado con precisión para que `judge`/`mutation_tester`
confirmen o rechacen la equivalencia con la misma autoridad con la que
aceptaron las 2 anteriores. El propio encargo de esta sesión definía el
objetivo como "100 % sobre no-equivalentes" — con este hallazgo,
usoDelAcento.ts alcanza exactamente eso: 92/92 mutantes no-equivalentes
muertos.

## 4. Verificación final

1. `pnpm exec vitest run src/lib/diseno/rolesDescartados.test.ts src/lib/diseno/usoDelAcento.test.ts`
   → **verde**: 2 ficheros, 34 tests (20 + 14; eran 18 + 8 antes de esta
   sesión).
2. `pnpm exec vitest run` (suite completa) → **verde**: 88 ficheros, 1292
   tests. (Una corrida intermedia mostró 2 ficheros ajenos a mi alcance en
   rojo — `matrizDeContraste.test.ts`, `PaginaCampanas.test.tsx`,
   `fidelidadPrototipo.test.ts`, `accesibilidad-teclado.test.tsx`, en
   distintas combinaciones entre corridas — consistente con el sabotaje
   manual concurrente de los 5 agentes hermanos trabajando en paralelo sobre
   otros ficheros de la misma superficie de mutación; ninguno de mis 2
   ficheros apareció nunca en esa lista. La corrida final, en solitario, dio
   88/88 verde.)
3. `pnpm run lint` (`oxlint --deny-warnings`) → limpio, exit 0.
4. `pnpm run typecheck` (`tsc -b`) → limpio, exit 0.
5. `pnpm exec stryker run --mutate "src/lib/diseno/rolesDescartados.ts,src/lib/diseno/usoDelAcento.ts"`
   (con cerrojo compartido, `concurrency: 1` de `stryker.config.json`, única
   corrida, **0 timeouts** verificados antes de leer el score) →
   **186/189 = 98.41 % bruto, 186/186 = 100 % sobre no-equivalentes**
   (3 equivalentes: los 2 ya aceptados de rolesDescartados.ts + el nuevo
   hallazgo de usoDelAcento.ts documentado en §3).

## 5. Ficheros tocados

- `src/lib/diseno/rolesDescartados.test.ts` (2 tests nuevos, 2 tests
  extendidos con más aserciones)
- `src/lib/diseno/usoDelAcento.test.ts` (6 tests nuevos, 1 test extendido con
  más aserciones)
- `src/lib/diseno/rolesDescartados.ts` — **sin cambios netos** (solo
  sabotajes temporales, todos revertidos; confirmado con lectura completa
  tras el revert)
- `src/lib/diseno/usoDelAcento.ts` — **sin cambios netos**, mismo patrón

Corresponde ahora una nueva ronda de `judge` (cambios solo en tests, no
debería requerir ronda completa) y una nueva medición de `mutation_tester`
acotada a estos 2 ficheros, con la petición explícita de confirmar o
rechazar el tercer equivalente documentado en §3.
