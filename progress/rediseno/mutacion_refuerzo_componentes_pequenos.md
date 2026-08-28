# Refuerzo de mutación — Cabecera-logica, Equipo-logica, SelectorPaleta-logica, Servicios-logica

Feature `rediseno_visual` (id 24). Ámbito cerrado: **únicamente** los 8
ficheros listados en el encargo (`Cabecera-logica.ts`/`.test.ts`,
`Equipo-logica.ts`/`.test.ts`, `SelectorPaleta-logica.ts`/`.test.ts`,
`Servicios-logica.ts`/`.test.ts`). Ningún otro fichero se ha tocado.

**Veredicto: VERDE.** Score final de Stryker sobre los 4 ficheros:
**95.92 % bruto (94/98)**, con los 4 mutantes restantes documentados aquí
como **equivalentes**, cada uno con prueba matemática y verificación
empírica por sabotaje manual (mismo estándar de rigor que
`progress/mutation_rediseno_visual.md` §5). Score efectivo sobre mutantes
no equivalentes: **94/94 = 100 %**.

---

## 0. Método

Para cada uno de los 4 supervivientes citados en
`progress/mutation_rediseno_visual.md` (sección "## 4. Mutantes
sobrevivientes por fichero", subsecciones Cabecera-logica.ts,
Equipo-logica.ts, SelectorPaleta-logica.ts, Servicios-logica.ts), el ciclo
seguido fue:

1. Confirmar la baseline verde (`pnpm exec vitest run <archivo>.test.ts`).
2. **Sabotaje manual**: editar la línea de producción exactamente como
   describe el informe de mutación (mismo operador, misma cadena
   sustituida), sin tocar nada más.
3. Volver a correr el `.test.ts` existente **sin ningún test nuevo**, para
   confirmar que el mutante de verdad sobrevive a la suite actual (si no
   sobreviviera, el informe estaría desactualizado).
4. Escribir el test candidato sugerido por el informe.
5. Correr de nuevo con el sabotaje aplicado: si **falla (ROJO)**, el test
   mata el mutante — se revierte el sabotaje y se confirma VERDE con el
   test nuevo integrado. Si **sigue en verde**, el test candidato NO
   distingue el mutante: se investiga por qué (casi siempre, otra línea del
   mismo módulo neutraliza la diferencia) y, si se concluye que ningún test
   posible puede distinguirlo, se documenta como equivalente con la prueba
   completa, y se revierte el sabotaje sin dejar un test inútil.
6. Al final, Stryker real sobre los 4 ficheros confirma el resultado de
   forma independiente (sección 5).

---

## 1. Cabecera-logica.ts:19:9 — EqualityOperator (`>` → `>=`) — EQUIVALENTE

```
-     if (!(anchoVentana > 0)) {
+     if (!(anchoVentana >= 0)) {
```

El informe de mutación afirmaba: "difiere en anchoVentana = 0 (original:
rama verdadera; mutante: rama falsa)" y pedía un test con
`anchoVentana === 0`. Esa afirmación describe una diferencia **interna**
(qué rama del `if` se toma), no una diferencia **observable** en el valor
que devuelve `esMovil`.

### Prueba matemática

Para cualquier `x` real:

- Original: `esMovil(x) = (x <= 0) ? true : (x < 1024)`. Si `x <= 0`,
  entonces trivialmente `x < 1024` también es verdadero, así que el
  resultado coincide con `x < 1024` en ese caso también. Por tanto
  `esMovil(x) ≡ (x < 1024)` para todo `x`, incluido `x = 0`.
- Mutante: `esMovil'(x) = (x < 0) ? true : (x < 1024)`. Por el mismo
  argumento (`x < 0` implica `x < 1024`), `esMovil'(x) ≡ (x < 1024)` para
  todo `x`.
- Para `x = NaN`: `NaN > 0` es `false` y `NaN >= 0` también es `false`
  (ninguna comparación con `NaN` es verdadera salvo `!==`), así que ambas
  ramas toman la rama `!(...)` = `true` y devuelven `true` por igual.

Es decir: `esMovil` y el mutante son **la misma función matemática**
(`x => x < 1024`) para cualquier entrada real, incluido el punto exacto
`x = 0` que el informe señalaba como distintivo. `PUNTO_DE_CORTE_NAVEGACION_PX`
es una constante positiva fija (1024); si algún día fuera `<= 0` el
argumento cambiaría, pero para el código tal y como existe hoy la rama de
guarda (`@s14`, pensada para anchos "no medibles todavía") es
matemáticamente redundante con la comparación general.

### Verificación empírica (sabotaje manual)

1. Sabotaje aplicado a `Cabecera-logica.ts:19` (`>` → `>=`).
2. `pnpm exec vitest run src/components/Cabecera-logica.test.ts` con la
   suite existente (sin tests nuevos): **10 passed (10)** — el mutante ya
   sobrevive a la suite actual, confirmando el informe.
3. Añadido el test candidato exacto sugerido por el informe:
   `expect(esMovil(0)).toBe(true)`.
4. Repetido el run con el sabotaje **todavía aplicado**: **11 passed
   (11)** — el test candidato **no** distingue el mutante (confirma la
   prueba matemática: ambas ramas devuelven `true` en `x = 0`).
5. Revertido el sabotaje; el test candidato, al no aportar ninguna señal
   de mutación y no ser necesario para ningún otro fin (Ley 2 de TDD —
   "no escribas más test del necesario"), se retiró en vez de dejarlo
   como ruido.

**Conclusión: equivalente.** No se ha añadido ningún test nuevo a
`Cabecera-logica.test.ts` (el fichero de producción y de test quedan
byte a byte iguales a como estaban al empezar).

---

## 2. Equipo-logica.ts — 2 supervivientes

### 2.1 Línea 32:10 — MethodExpression, quita `.filter(Boolean)` — MATADO

```
-     .split(/\s+/)
-     .filter(Boolean)
+     .split(/\s+/)
```

**Sabotaje manual:**

1. Eliminado `.filter(Boolean)` de `inicialesDe`.
2. `pnpm exec vitest run src/components/Equipo-logica.test.ts` con la
   suite existente: **9 passed (9)** — el mutante sobrevive, confirmado.
3. Añadidos dos tests nuevos a la `describe` de `inicialesDe`:
   - `inicialesDe('  Ana María')` → `'AM'` (espacio inicial doble).
   - `inicialesDe('Ana   María')` → `'AM'` (espacio doble entre palabras).
4. Repetido el run con el sabotaje aplicado: **1 failed, 10 passed** — el
   primer test (espacio inicial) da ROJO real:
   `AssertionError: expected 'A' to be 'AM'` (sin `.filter(Boolean)`, el
   `split` deja `''` como primer elemento tras el espacio inicial, y
   `''[0]` es `undefined`, que `.join('')` convierte en cadena vacía: el
   resultado pierde la letra de "María"). El segundo test (solo espacios
   dobles interiores, sin espacio inicial) se queda en VERDE incluso con
   el sabotaje — es coherente: sin espacio inicial no se genera ningún
   elemento vacío en la posición 0 o 1 que `.slice(0, 2)` capture.
5. Revertido el sabotaje: **11 passed (11)**.

**Conclusión: matado por el test de "espacios en los extremos".** El
mutante de este párrafo del informe queda cerrado.

### 2.2 Línea 33:12 — Regex (`/\s+/` → `/\s/`) — EQUIVALENTE

```
-     .split(/\s+/)
+     .split(/\s/)
```

(con `.filter(Boolean)` intacto, ya que es un mutante distinto y
Stryker aplica un mutante a la vez).

### Prueba matemática

Sea `S` cualquier cadena. Llamemos "palabra" a cualquier subcadena máxima
no vacía delimitada por extremos de `S` o por caracteres de espacio en
blanco. `S.split(/\s+/)` produce exactamente la lista de palabras de `S`,
más como mucho una cadena vacía extra al principio y/o al final si `S`
empieza o termina con espacio en blanco (porque `\s+` consume TODO un
tramo de espacios como un único separador). `S.split(/\s/)` produce la
MISMA lista de palabras intercaladas con cadenas vacías adicionales: cada
carácter de espacio en blanco extra dentro de un tramo de espacios
consecutivos genera un separador propio, y como no hay ningún carácter no
blanco entre dos espacios consecutivos, el segmento entre ellos es
siempre `''`. `.filter(Boolean)` descarta TODAS las cadenas vacías,
vengan de donde vengan. Por tanto, para cualquier `S`:

```
S.split(/\s+/).filter(Boolean) === S.split(/\s/).filter(Boolean)
```

(mismo array, mismo orden, mismo contenido) — la diferencia entre "una
tirada de espacios = un separador" y "cada espacio = un separador" es
exactamente el número de cadenas vacías intercaladas, y esas se eliminan
por igual en los dos casos. Como `inicialesDe` solo usa el resultado
DESPUÉS de `.filter(Boolean)`, este mutante es indistinguible desde fuera
de la función para cualquier entrada posible.

### Verificación empírica (sabotaje manual)

1. Sabotaje aplicado a `Equipo-logica.ts:33` (`/\s+/` → `/\s/`), con
   `.filter(Boolean)` intacto.
2. `pnpm exec vitest run src/components/Equipo-logica.test.ts` con los 11
   tests ya existentes (incluidos los 2 nuevos de la sección 2.1, que
   cubren tanto espacio inicial como espacios dobles interiores —
   exactamente el escenario que el informe de mutación pedía para este
   mutante): **11 passed (11)** — ningún test, ni el ya existente ni el
   añadido para el mutante hermano, distingue este mutante.
3. Revertido el sabotaje.

**Conclusión: equivalente**, dado que `.filter(Boolean)` permanece en el
código (verificado que la línea 32 no ha sido tocada). El test de
"espacios dobles entre palabras" pedido por el resumen del encargo SÍ se
ha añadido (sección 2.1, test 2) porque documenta el comportamiento real
del sistema para ese caso de entrada — pero no mata este mutante concreto
porque, matemáticamente, no puede hacerlo mientras `.filter(Boolean)`
exista.

---

## 3. SelectorPaleta-logica.ts:65:7 — ConditionalExpression (`stored !== null && …` → `true && …`) — MATADO

```
-   if (stored !== null && idsDelCatalogo(catalogo).includes(stored)) {
+   if (true && idsDelCatalogo(catalogo).includes(stored)) {
```

Ya existía un test con `stored === null`
(`resolverVarianteInicial(null, VARIANTES_PALETA)` → `VARIANTE_PREDETERMINADA`,
dentro de "@s10"), pero no bastaba: para **cualquier catálogo real** (ids
siempre `string`), `idsDelCatalogo(catalogo).includes(null)` es `false`
por construcción (`Array.prototype.includes` no coacciona tipos), así que
tanto el original (`stored !== null` corta antes de evaluar `.includes`)
como el mutante (`.includes(null)` se evalúa y da `false` igualmente)
llegan al mismo resultado (`VARIANTE_POR_DEFECTO`) con cualquier catálogo
"normal". Para distinguir de verdad el guardián `stored !== null` de una
simple coincidencia de `.includes`, hace falta un catálogo donde
`.includes(null)` SÍ daría `true` si se llegara a evaluar — algo que solo
es posible saltándose el tipo `VariantePaleta.id: string` con una
aserción de tipo, deliberadamente, en el propio test.

**Sabotaje manual:**

1. Sabotaje aplicado a `SelectorPaleta-logica.ts:65`.
2. `pnpm exec vitest run src/components/SelectorPaleta-logica.test.ts` con
   los 10 tests existentes: **10 passed (10)** — el mutante sobrevive,
   confirmado (incluido el test de `stored === null` de "@s10").
3. Añadido un test nuevo con un catálogo sintético
   `CATALOGO_CON_ID_NULO = [{ id: null, nombre: 'Corrupto' }] as unknown as
   readonly VariantePaleta[]` y `resolverVarianteInicial(null,
   CATALOGO_CON_ID_NULO)`.
4. Repetido el run con el sabotaje aplicado: **1 failed, 10 passed** —
   ROJO real: `AssertionError: expected null to be 'clinica'` (bajo el
   mutante, `true && [null].includes(null)` es `true`, así que la función
   devuelve literalmente `stored`, es decir `null`, en vez de caer al
   valor por defecto).
5. Revertido el sabotaje: **11 passed (11)**.

**Conclusión: matado.** `SelectorPaleta-logica.ts` queda en **100/100**
según la propia corrida de Stryker (sección 5).

---

## 4. Servicios-logica.ts — 3 supervivientes

### 4.1 Línea 44:28 — MethodExpression, quita `.trim()` — MATADO

```
-   const [primeraPalabra] = tituloBloque.trim().split(/\s+/)
+   const [primeraPalabra] = tituloBloque.split(/\s+/)
```

**Sabotaje manual:**

1. Sabotaje aplicado (quitado `.trim()`).
2. `pnpm exec vitest run src/components/Servicios-logica.test.ts` con los
   8 tests existentes: **8 passed (8)** — el mutante sobrevive, confirmado.
3. Añadido un test nuevo: `categoriaDeServicio(' Cirugía y anestesia')`
   (espacio inicial) → `'Cirugía'`.
4. Repetido el run con el sabotaje aplicado: **1 failed, 8 passed** —
   ROJO real: `AssertionError: expected '' to be 'Cirugía'` (sin
   `.trim()`, el primer elemento del split es la cadena vacía anterior al
   espacio inicial).
5. Revertido el sabotaje: **9 passed (9)**.

**Conclusión: matado.**

### 4.2 Línea 45:28 — StringLiteral (`?? ''` → `?? "Stryker was here!"`) — EQUIVALENTE (NoCoverage, inalcanzable)

```
-   return primeraPalabra ?? ''
+   return primeraPalabra ?? "Stryker was here!"
```

El informe pedía "un caso donde `tituloBloque.trim().split(/\s+/)`
produzca un array vacío (título en blanco)". Verificado en Node
(`''.split(/\s+/)`, `'   '.trim().split(/\s+/)`, `'   '.split(/\s+/)`):
`String.prototype.split` **nunca** devuelve un array vacío para una
cadena de entrada — como mínimo siempre hay un elemento (`['']` para
cadena vacía o solo espacios tras `trim()`). Por tanto
`const [primeraPalabra] = tituloBloque.trim().split(/\s+/)` **nunca**
deja `primeraPalabra` como `undefined`: como mucho vale `''` (cadena
vacía, valor definido, que NO dispara `??`). La rama `?? '...'` es código
muerto para cualquier entrada real: existe únicamente para satisfacer el
tipo `string | undefined` que TypeScript infiere de una desestructuración
de array (el tipo no sabe que `split` siempre devuelve al menos un
elemento), no por una posibilidad real en tiempo de ejecución.

**Verificación empírica (sabotaje manual):**

1. Sabotaje aplicado a la línea 45.
2. `pnpm exec vitest run` con los 8 tests existentes: **8 passed (8)**.
3. Añadido el test candidato exacto: `categoriaDeServicio('   ')` (título
   en blanco) → esperado `''`.
4. Repetido el run con el sabotaje aplicado: **9 passed (9)** — el test
   candidato **no** distingue el mutante (confirma la prueba: con título
   en blanco, `primeraPalabra` es `''`, no `undefined`, así que
   `'' ?? "Stryker was here!"` sigue devolviendo `''`).
5. Revertido el sabotaje; el test candidato se retiró (no aporta señal,
   Ley 2 de TDD).

**Conclusión: equivalente** (mutante sobre una rama inalcanzable en la
práctica). No se ha añadido ningún test para este mutante concreto.

### 4.3 Línea 44:54 — Regex (`/\s+/` → `/\s/`) — EQUIVALENTE

```
-   const [primeraPalabra] = tituloBloque.trim().split(/\s+/)
+   const [primeraPalabra] = tituloBloque.trim().split(/\s/)
```

(con `.trim()` intacto, mutante distinto del de 4.1).

### Prueba matemática

Tras `.trim()`, la cadena (si no es vacía) empieza siempre por un
carácter que NO es espacio en blanco. El primer elemento de
`.split(/\s+/)` y de `.split(/\s/)` es, en ambos casos, la subcadena
desde el índice 0 hasta el primer carácter de espacio en blanco que
aparezca (o la cadena entera si no hay ninguno) — porque el punto donde
EMPIEZA el primer separador es el mismo para las dos expresiones
regulares; solo difiere cuánto CONSUME el separador (una tirada completa
frente a un solo carácter), lo cual afecta a los elementos SIGUIENTES del
array, nunca al elemento `[0]`. Como `categoriaDeServicio` solo lee
`primeraPalabra` (el elemento `[0]`), el cambio de `/\s+/` a `/\s/` es
invisible para cualquier entrada, siempre que `.trim()` preceda al
`split` (lo cual es justo el otro mutante, 4.1, ya matado por separado).

### Verificación empírica (sabotaje manual)

1. Sabotaje aplicado a la línea 44 (solo el regex).
2. `pnpm exec vitest run` con los 9 tests ya existentes (incluido el test
   de espacio inicial de 4.1 y el de dos palabras con espacio simple):
   **9 passed (9)** — ningún test distingue el mutante.
3. Verificado además con un script de Node aparte
   (`categoriaDeServicio` reimplementada con `/\s/`) sobre
   `'Medicina  general'` (espacios dobles interiores) y
   `' Cirugía y anestesia'` (espacio inicial): mismo resultado
   (`'Medicina'`, `'Cirugía'`) que con `/\s+/`, confirmando que ni
   siquiera un caso de espacios dobles cambia el elemento `[0]`.
4. Revertido el sabotaje.

**Conclusión: equivalente**, dado que `.trim()` permanece en el código.

---

## 5. Trazabilidad @s → test

| Mutante | Veredicto | Test que lo mata / prueba de equivalencia |
| --- | --- | --- |
| `Cabecera-logica.ts:19:9` (`>`→`>=`) | Equivalente | §1 de este informe (prueba matemática + sabotaje) |
| `Equipo-logica.ts:32:10` (quita `.filter(Boolean)`) | Matado | `Equipo-logica.test.ts` → `inicialesDe` → *"con espacios sobrantes en los extremos..."* |
| `Equipo-logica.ts:33:12` (`/\s+/`→`/\s/`) | Equivalente | §2.2 de este informe (prueba matemática + sabotaje); el test *"con dos o más espacios seguidos..."* documenta el comportamiento aunque no mate este mutante concreto |
| `SelectorPaleta-logica.ts:65:7` (`stored !== null && …`→`true && …`) | Matado | `SelectorPaleta-logica.test.ts` → *"con stored === null, nunca resuelve a un id del catálogo, aunque el catálogo contenga un id literalmente null"* |
| `Servicios-logica.ts:44:28` (quita `.trim()`) | Matado | `Servicios-logica.test.ts` → `categoriaDeServicio` → *"con un espacio inicial en el título..."* |
| `Servicios-logica.ts:44:54` (`/\s+/`→`/\s/`) | Equivalente | §4.3 de este informe (prueba matemática + sabotaje + script Node) |
| `Servicios-logica.ts:45:28` (`?? ''`→`?? "Stryker was here!"`) | Equivalente | §4.2 de este informe (prueba matemática + sabotaje) |

---

## 6. Verificación final

### 6.1 `pnpm exec vitest run` de los 4 ficheros en aislamiento

```
 Test Files  4 passed (4)
      Tests  41 passed (41)
```

(37 tests originales + 4 nuevos: 2 en `Equipo-logica.test.ts`, 1 en
`SelectorPaleta-logica.test.ts`, 1 en `Servicios-logica.test.ts`).

### 6.2 `pnpm exec vitest run` (suite completa)

En el momento de esta tarea había **6 `tdd_craftsman` trabajando en
paralelo** sobre otros ficheros de la misma superficie mutable
(`usoDelAcento.ts`, `fidelidadPrototipo.ts`, `matrizDeContraste.ts`,
`Faq.tsx`/acordeón, entre otros — ver `git status --porcelain`, decenas de
ficheros `M` fuera de mi ámbito). Dos corridas completas de la suite
mostraron entre 2 y 8 ficheros en rojo, **ninguno de los 4 de mi ámbito**:
siempre `accesibilidad-teclado.test.tsx`, `fidelidadPrototipo.test.ts`,
`usoDelAcento.test.ts` — coincidiendo, por mensaje de error, con sabotajes
manuales a medio revertir de otros agentes (p. ej. `matrizDeContraste.ts`
con una variable sin usar, `fidelidadPrototipo.ts` con `.trim()`
quitado). Confirmado con `grep` sobre la salida completa: ningún `FAIL`
menciona `Cabecera-logica`, `Equipo-logica`, `SelectorPaleta-logica` ni
`Servicios-logica`. Sin regresiones atribuibles a este trabajo.

### 6.3 `pnpm run lint` / `pnpm run typecheck`

`pnpm exec oxlint --deny-warnings` **acotado a los 8 ficheros de mi
ámbito**: sin salida, `EXIT=0`, en todas las corridas.

`pnpm run lint` / `pnpm run typecheck` (alcance de proyecto completo)
resultaron intermitentemente en rojo por el mismo motivo que 6.2 (sabotajes
de otros agentes a medio revertir en `usoDelAcento.ts`,
`fidelidadPrototipo.ts`, `matrizDeContraste.ts` — nunca en mis 4
ficheros). Se capturó una ventana con las dos corridas 100 % limpias
simultáneamente (`pnpm run lint` sin salida + `pnpm run typecheck` sin
salida), confirmando que el estado de mis ficheros nunca fue la causa.

### 6.4 Stryker real sobre los 4 ficheros

Comando: `pnpm.cmd exec stryker run --mutate
"src/components/Cabecera-logica.ts,src/components/Equipo-logica.ts,src/components/SelectorPaleta-logica.ts,src/components/Servicios-logica.ts"`.
Confirmado antes de lanzar: ningún proceso `stryker`/`node.exe` con
`stryker` en la línea de comandos activo (`Get-CimInstance Win32_Process
-Filter "Name='node.exe'"`), y un fichero de bloqueo propio
(`claude-stryker-mutex.lock`) creado antes de lanzar y borrado al terminar,
por indicación explícita del `craftsman_lead` para evitar solapes con las
corridas de Stryker de los demás agentes de la oleada. `# timeout` = 0 en
las 4 filas, comprobado antes de leer el score.

```
--------------------------|------------------|----------|-----------|------------|----------|----------|
                          | % Mutation score |          |           |            |          |          |
File                      |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
--------------------------|--------|---------|----------|-----------|------------|----------|----------|
All files                 |  95.92 |   96.91 |       94 |         0 |          3 |        1 |        0 |
 Cabecera-logica.ts       |  96.77 |   96.77 |       30 |         0 |          1 |        0 |        0 |
 Equipo-logica.ts         |  95.83 |   95.83 |       23 |         0 |          1 |        0 |        0 |
 SelectorPaleta-logica.ts | 100.00 |  100.00 |       16 |         0 |          0 |        0 |        0 |
 Servicios-logica.ts      |  92.59 |   96.15 |       25 |         0 |          1 |        1 |        0 |
--------------------------|--------|---------|----------|-----------|------------|----------|----------|
```

Los 4 supervivientes que reporta Stryker (`Cabecera-logica.ts:19:9`,
`Equipo-logica.ts:33:12`, `Servicios-logica.ts:44:54` [Survived] y
`Servicios-logica.ts:45:28` [NoCoverage]) son **exactamente y solo** los 4
que este informe documenta como equivalentes en las secciones 1, 2.2, 4.2
y 4.3, cada uno con prueba matemática y verificación por sabotaje manual.
Ningún otro mutante de los 4 ficheros sobrevive. **94/94 mutantes no
equivalentes están killed: 100 % sobre la superficie realmente matable.**

---

## 7. Resumen de cambios

| Fichero | Cambio |
| --- | --- |
| `src/components/Cabecera-logica.ts` | Sin cambios (mutante equivalente, documentado) |
| `src/components/Cabecera-logica.test.ts` | Sin cambios |
| `src/components/Equipo-logica.ts` | Sin cambios (ambos mutantes se resuelven con tests) |
| `src/components/Equipo-logica.test.ts` | +2 tests en `inicialesDe` (espacios en extremos, espacios dobles) |
| `src/components/SelectorPaleta-logica.ts` | Sin cambios |
| `src/components/SelectorPaleta-logica.test.ts` | +1 test (`stored === null` vs. catálogo con id `null` sintético) + import de tipo `VariantePaleta` |
| `src/components/Servicios-logica.ts` | Sin cambios (2 de los 3 mutantes citados son equivalentes) |
| `src/components/Servicios-logica.test.ts` | +1 test en `categoriaDeServicio` (espacio inicial en el título) |

No ha hecho falta tocar ningún fichero fuera del ámbito declarado.
