# Refuerzo de mutación — `src/lib/diseno/matrizDeContraste.ts`

**Encargo:** cerrar los 37 mutantes no muertos que `progress/mutation_rediseno_visual.md`
§10 dejó documentados para `matrizDeContraste.ts` (87.95 %, 270/307), sin tocar
ningún otro fichero.

**Resultado final (Stryker real, `--mutate src/lib/diseno/matrizDeContraste.ts`,
`concurrency: 1`, verificado dos veces):**

| Corrida | total | killed | timeout | survived | no cov | score bruto |
| --- | --- | --- | --- | --- | --- | --- |
| Baseline (informe) | 307 | 270 | 0 | 35 | 2 | 87.95 % |
| Final (esta sesión) | 307 | 305 | 0 | 2 | 0 | **99.35 %** |

Los 2 supervivientes finales son **equivalentes genuinos**, probados por
construcción (álgebra sobre la especificación de ECMAScript) y confirmados
empíricamente con sabotaje manual dos veces (antes y durante la corrida real
de Stryker): **35/35 mutantes reales muertos → 100 % sobre no-equivalentes**.
"# timeout" = 0 en las dos corridas, tal y como exige la regla dura del
proyecto antes de leer el score.

## 1. Los 2 equivalentes documentados

### `matrizDeContraste.ts:40:12` Regex — `:root(?!\[)\s*` → `:root(?!\[)\S*`

`patronDeEncabezadoDeTema` (variante por defecto) se usa así en
`extraerBloqueDeTemaDelPrototipo`:

```ts
const encabezado = textoHtml.match(patronDeEncabezadoDeTema(tema))
if (!encabezado || encabezado.index === undefined) { throw ... }
const indiceDeApertura = textoHtml.indexOf(LLAVE_ABRE, encabezado.index)
```

Solo se lee `encabezado.index` (el punto de INICIO de la coincidencia);
`encabezado[0]` (el texto capturado, incluida la cola `\s*`/`\S*`) nunca se
usa. El cuantificador final `\s*`/`\S*` es de longitud variable pero
**siempre puede casar cero caracteres** (ambos aceptan la cadena vacía), así
que nunca desplaza el punto de inicio de la coincidencia: la posición donde
empieza `:root(?!\[)` es idéntica con cualquiera de los dos cuantificadores,
para cualquier entrada. Cambiar `\s*` por `\S*` es indistinguible por
construcción para esta función, sea cual sea el texto de prueba.

Verificado con sabotaje real: con el mutante aplicado a mano, los 39-41 tests
del fichero (incluidos los 4 nuevos que ejercitan `leerRolDeTemaDelPrototipo`
con la variante por defecto) siguen en verde. Repetido dos veces (antes de
escribir el resto del refuerzo, y de nuevo en la corrida final de Stryker,
que lista exactamente el mismo mutante como `Survived` con el mismo conjunto
de tests ejecutados sin fallar).

### `matrizDeContraste.ts:54:22` ConditionalExpression — `encabezado.index === undefined` → `false`

Misma función, la mitad derecha de la guarda:
`if (!encabezado || encabezado.index === undefined)`. Por la propia
especificación de `String.prototype.match`: cuando el patrón NO lleva la
bandera `g` (ninguno de los patrones de `patronDeEncabezadoDeTema` la lleva),
si hay coincidencia el resultado **siempre** trae `index` definido (solo es
`undefined`, de hecho solo *ausente* del array, cuando se usa `g`, y entonces
tampoco se puede leer `.index` sin más). Por tanto, en cualquier rama donde
`encabezado` es verdadero (superado `!encabezado`), `encabezado.index` NUNCA
es `undefined`: el operando derecho del `||` es, para toda entrada real,
equivalente a la constante `false`. Sustituirlo por `false` no cambia ningún
resultado observable.

Verificado con sabotaje real (`if (!encabezado || false)`): los 39-41 tests
del fichero siguen en verde, dos veces (manual antes del refuerzo final, y de
nuevo confirmado por la propia corrida de Stryker).

Ambos casos siguen el mismo patrón que los 2 equivalentes que
`mutation_rediseno_visual.md` §5 ya documentó para `rolesDescartados.ts`:
prueba algebraica + verificación empírica con la suite completa, sin inventar
un test que no puede fallar de verdad (violaría la Ley 2 del TDD).

## 2. Los 35 mutantes reales, agrupados

### 2.1 `leerRgbExpandidoDeRolDelPrototipo` — rama "rol translúcido no encontrado" (3 mutantes: 108:22-110:4, 109:21, 108:7)

Nuevo test: `lanza si el rol translúcido pedido no existe en el tema del
prototipo` → `toThrow('no se encontró el rol translúcido "--inexistente"...')`.
Sabotaje (`if (false) { throw new Error('Stryker was here!') }`) → rojo
(`TypeError: Cannot read properties of null`, no matchea el mensaje).

### 2.2 `extraerBloqueDeTemaDelPrototipo` — "bloque sin abrir/cerrar", cada mitad del OR (60:7, LogicalOperator + ConditionalExpression x2)

Dos tests nuevos: uno con apertura SÍ encontrada pero sin cierre (con una
llave de cierre suelta en OTRO sitio del texto para no confundirse con el
caso ya existente donde faltan las dos), y otro con apertura NO encontrada
pero con una llave de cierre suelta. Sabotaje de `||`→`&&`, y de la condición
completa a `false` → ambos dan rojo en los dos tests nuevos (y el existente).

### 2.3 `leerComentarioDelBordeDeControlDeMarca` — OptionalChaining (161:10)

Nuevo test con el TEXTO REAL de `_tokens.scss` saboteado EN MEMORIA (patrón
"sabotaje permanente" ya usado en el resto del fichero): se quita el bloque
de comentarios `//` que precede a `--color-borde-control:#A06997;`, sin
tocar `_tokens.scss`. Espera `undefined`. Sabotaje del `?.` → rojo
(`TypeError: Cannot read properties of null (reading '1')`).

### 2.4 `comprobarRolesAusentesDelPrototipo` (246:18, 252:39, 253:18)

- Añadida `expect(informe.presentes).toEqual([])` al test de candidatos
  vacíos (mataba `presentes: []` → `["Stryker was here"]`).
- Nuevo test con candidatos NO vacíos donde uno SÍ está presente (`--bg`) y
  otro no (`--focus-ring`): mata el `.filter` vaciado a mano y la condición
  `presentes.length === NINGUN_ROL_INSPECCIONADO` forzada.

### 2.5 `contarReglasDeFocoDelPrototipo` (261:10)

Nuevo test con un texto que sí declara `:focus`, esperando `> 0`.

### 2.6 `leerTintasLiteralesSobreRolDelPrototipo` (305:10-309:66, 309:51, y los 3+1 mutantes de `PATRON_TINTA_LITERAL` en 294:30)

Tres tests nuevos:
- `style` con fondo pero sin tinta de 3 dígitos → `[]` (mata el filtro
  `tinta !== null` forzado a `true`).
- `style` con espacios reales alrededor de `color:` (el prototipo real
  siempre escribe `color:#fff` sin espacio) → mata las dos mutaciones `\s*`
  → `\S*` de `PATRON_TINTA_LITERAL`.
- `style` con la tinta AL PRINCIPIO del propio atributo (antes de cualquier
  `;`) → mata la mutación de la alternancia `(?:^|;)` → `(?:;)` (la rama
  `^` nunca se ejercitaba: el prototipo real siempre escribe primero el
  fondo). Las variantes `\s*`→`\s+` de ese mismo patrón ya estaban muertas
  por los tests existentes con el texto real del prototipo (cero espacios).

### 2.7 `ejecutarMatrizDeContrasteDeVariantes` — `suspensos: []` (459:18)

Añadida `expect(informe.suspensos).toEqual([])` a los dos tests de vacuidad
ya existentes (matriz vacía / catálogo de variantes vacío).

### 2.8 `representaLaMatriz` (503:10 `.some`→`.every`, 503:60 `entrada.fondo === fondo`→`true`)

- El `.some`→`.every` lo mata la propia batería de tests con matriz `[]`
  (vacía): `.every` sobre `[]` es `true` por vacuidad, `.some` es `false` —
  divergencia inmediata.
- Nuevo test dedicado con una matriz NO vacía donde el ROL coincide pero el
  FONDO no (`texto` sobre `fondo` declarado, fichero pinta `texto` sobre
  `superficie`): mata la comparación de `fondo` forzada a `true`.

### 2.9 La familia de la pila de fondos — 9 mutantes (518:51, 533:11, 538:9 x2, 538:39-540:6, 539:7, 541:9, 541:41-543:6)

Fichero de estilos SINTÉTICO con un selector anidado dentro de otro, cada uno
con su propio `background-color` (formatos mezclados: compacto sin espacio y
con tres espacios, mismo patrón de hueco de formato del resto de la
feature), más tres tests pequeños dedicados:

- Anidación real (`.exterior { background-color:… .interior { background-color:… color:… } color:… }`):
  ejercita push al abrir el selector interior y pop al cerrarlo, verificando
  que la tinta de DESPUÉS del bloque anidado recupera el fondo del exterior,
  no el del interior.
- Una tinta ANTES de cualquier `background-color` (pila vacía, `fondoVigente`
  aún `undefined`): no se señala. Mata `fondoVigente !== undefined` forzado
  a `true`.
- Una llave de cierre SUELTA sin apertura previa: la pila arranca vacía y el
  `pop()` sobre `[]` debe devolver `undefined`, no un residuo. Mata
  `pilaDeFondos: [] ` → `['Stryker was here']` (pila inicial no vacía).

### 2.10 `ejecutarPuertaDeReconciliacionDeMatriz` — caso que aprueba (559:18)

Nuevo test con un fichero cuya única pareja SÍ está representada en la
matriz: `paresSinRepresentar: []`, `pasa: true`. Hasta ahora solo se probaba
el caso que falla.

### 2.11 Canales RGBA de un solo dígito hexadecimal (19:20 y 91:25 — ver nota)

El informe cita "19:20" para `ALMOHADILLA`, pero esa línea real es
`LLAVE_ABRE = '{'` (columna 20 de la línea 19 coincide por casualidad con el
literal `'{'`); la declaración real de `ALMOHADILLA` vive en la línea 269.
Verificado con sabotaje en las DOS ubicaciones: mutar `LLAVE_ABRE` a `''`
rompe la suite entera (mutante trivialmente detectable, no es de esta
familia); mutar `ALMOHADILLA` a `''` en la línea 269 SÍ es el mutante real,
y ya lo mataba el test existente de `"tech"` (usa un rol translúcido real).
El nuevo test (`rgba(5, 10, 255, .4)`, canales de 1 dígito hex: `5`→`A`)
mata además `CERO_DE_RELLENO` (línea 91, confirmado con sabotaje: sin el
relleno de cero da `#5AFF` en vez de `#050AFF`).

### 2.12 Regex de formato de espaciado — el resto (204:49, 257:38, 499:37 x2, 500:37 x2)

- `PATRON_DECLARACION_DE_ROL_DEL_PROTOTIPO` (`extraerNombresDeRolDelPrototipo`):
  nuevo test con `--rol-nuevo :#112233` (espacio antes de los dos puntos).
- `PATRON_SUPRESION_DE_CONTORNO`: nuevo test con `outline: none` (espacio).
- `PATRON_DECLARACION_DE_FONDO`/`PATRON_DECLARACION_DE_TINTA`: la variante
  `\s*`→`\S*` la mata el fichero anidado de 2.9 (formato compacto sin
  espacio en una de sus líneas); la variante `\s*`→`\s+` la mata el mismo
  fichero (línea con espacio real en la otra declaración). Además, un
  mutante NO documentado en el informe original (`^background-color:`→
  `background-color:` sin ancla) apareció como superviviente en la primera
  corrida real de Stryker: nuevo test con un `background-color:` precedido
  de un comentario pegado (`/* nota */background-color:...`), que NO debe
  reconocerse como declaración de fondo por no empezar la línea.

## 3. Trazabilidad @s → test (solo los tests nuevos; los preexistentes ya
   estaban mapeados en `progress/rediseno/tdd_matriz-de-contraste.md`)

- @s7 → "omite un estilo que declara el fondo del rol pero no escribe
  ninguna tinta literal", "reconoce una tinta literal aunque el estilo use
  espacios alrededor de los dos puntos", "reconoce una tinta literal que
  abre el propio atributo style, sin ningún punto y coma antes"
- @s8 → "reconoce un rol declarado con espacio antes de los dos puntos"
- @s8 Enmienda 3 → "lanza si el rol translúcido pedido no existe en el tema
  del prototipo", "expande a hexadecimal de dos dígitos un canal rgba
  decimal menor que 16, con el relleno de cero", "devuelve undefined si la
  declaración del borde de control de 'marca' no lleva ningún comentario
  pegado encima"
- @s9 → "detecta un rol candidato que sí está declarado en el prototipo,
  entre otros que no lo están", "cuenta más de cero reglas de foco cuando
  el texto sí las declara", "cuenta una supresión de contorno aunque haya
  un espacio entre los dos puntos y 'none'"
- @s11 → "lanza si el bloque abre pero nunca cierra…", "lanza si el bloque
  nunca llega a abrir…", "aprueba cuando el fichero de estilos solo pinta
  parejas ya representadas en la matriz", "sigue la anidación de bloques
  con una pila…", "una tinta declarada antes de cualquier
  'background-color'…", "una llave de cierre suelta…", "un rol candidato
  que coincide pero con un fondo distinto al declarado…", "un
  'background-color' que no abre la línea…"

## 4. Verificación final

1. `pnpm exec vitest run src/lib/diseno/matrizDeContraste.test.ts` → **41/41
   verde** (23 preexistentes + 18 nuevos).
2. `pnpm exec vitest run` (suite completa) → **1300/1300 verde, 88/88
   ficheros**. (Una corrida intermedia tuvo 4 fallos transitorios en
   `src/accesibilidad-teclado.test.tsx` —fichero ajeno a esta sesión, sin
   tocar— por contención de CPU con las corridas paralelas de Stryker de los
   agentes hermanos sobre el mismo repo; reproducido aislado en verde 5/5 y
   confirmado limpio en una segunda corrida completa, 1300/1300.)
3. `pnpm run lint` → limpio (`oxlint --deny-warnings`, exit 0).
4. `pnpm run typecheck` → limpio (`tsc -b`, exit 0).
5. `pnpm exec stryker run --mutate src/lib/diseno/matrizDeContraste.ts`
   (protocolo de cerrojo compartido respetado en las dos corridas; nunca dos
   Stryker a la vez): **99.35 % bruto (305/307), 0 timeout, 2 survived — los
   2 equivalentes documentados en la sección 1. 100 % sobre no-equivalentes
   (305/305).**

Producción (`src/lib/diseno/matrizDeContraste.ts`) verificada byte a byte
idéntica al estado previo a esta sesión tras cada sabotaje manual (ningún
residuo dejado): cero líneas de producción nuevas, todo el refuerzo vive en
`matrizDeContraste.test.ts` (18 tests nuevos + 3 aserciones añadidas a tests
existentes).

## 5. Siguiente paso

Corresponde una nueva ronda de `judge` sobre `matrizDeContraste.test.ts` y
una remedición del `mutation_tester` acotada a este fichero (o a toda la
feature, si el resto de artesanos hermanos ya cerraron los suyos), para que
`craftsman_lead` reconcilie el veredicto agregado de `rediseno_visual` (24).
