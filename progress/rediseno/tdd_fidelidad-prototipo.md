# TDD — lote `fidelidad-prototipo` (@s3 de `features/rediseno_visual.feature`)

> Artesano: `tdd_craftsman`. Feature activa: `rediseno_visual` (id 24, `in_progress`).
> Ámbito de ficheros CERRADO y respetado: solo `src/lib/diseno/fidelidadPrototipo.ts`
> y `src/lib/diseno/fidelidadPrototipo.test.ts` (ambos NUEVOS). Ni una línea fuera.

## 0. Qué estaba ausente

`progress/rediseno/matriz_trazabilidad.md:31-40` marca @s3 como **AUSENTE**, sin
ninguna prueba citada, y lo razona: «NINGÚN fichero de test del repositorio lee
`docs/diseno-claude-design/`». Es la puerta que la cabecera del contrato
(`rediseno_visual.feature:72-76`) declara como la que faltaba. Ya no falta:
`src/lib/diseno/fidelidadPrototipo.test.ts` es el primer test del repositorio que
lee el prototipo versionado con `?raw` y lo compara con `src/styles/_tokens.scss`.

## 1. Lo medido antes de escribir una línea (no son conjeturas)

Volcado de los cuatro bloques del prototipo y diff contra `_tokens.scss`,
ejecutado con Node sobre los dos ficheros reales. Resultado: **4 temas × 18
roles = 72 parejas**, de las que difieren **6**:

| Variante | Rol prototipo | Prototipo | Sistema | Naturaleza |
|---|---|---|---|---|
| clinica | `--border` | `rgba(15,32,60,.13)` | `#D8E0EA` | alfa → opaco |
| calida | `--border` | `rgba(120,53,15,.16)` | `#E8D7BA` | alfa → opaco |
| tech | `--border` | `rgba(148,197,255,.18)` | `#405474` | alfa → opaco |
| eco | `--border` | `rgba(4,120,87,.16)` | `#C6E4D7` | alfa → opaco |
| calida | `--muted` | `#8A6C45` | `#84663E` | **valor** (@s6) |
| tech | `--accent-soft` | `rgba(6,182,212,.14)` | `#12394A` | alfa → opaco |
| tech | `--urg-soft` | `rgba(248,113,113,.16)` | `#542A37` | alfa → opaco |

Las sombras (`--shadow`, `--shadow-sm`) coinciden en las cuatro variantes salvo
formato (`.10` frente a `0.1`, espacios tras las comas).

### 1.1 CORRECCIÓN a un hallazgo del orquestador

> El briefing decía: «OJO: el tema "tech" del prototipo NO declara `--accent-soft`
> ni `--urg-soft`».

**Es inexacto, medido byte a byte.** `tech` SÍ los declara, pero con `rgba()`:

```
docs/diseno-claude-design/Veterinaria La Sierra.dc.html:38-39
  --accent:#22D3EE; --accent-ink:#67E8F9; --accent-soft:rgba(6,182,212,.14);
  --urg:#F87171; --urg-soft:rgba(248,113,113,.16);
```

El fondo del aviso era correcto (esas dos parejas son un caso REAL que no puede
tratarse como fallo), pero la causa no es la ausencia: es el **alfa**. Lo
confirma `progress/rediseno/matriz_delta.md:191` (T-11): «`tech` mete `rgba()`
en tres roles de color — `--border`, `--accent-soft` y `--urg-soft` […] obliga a
componer antes de medir: un translúcido no tiene ratio propio». El módulo lo
modela como tal, no como ausencia.

## 2. La tabla de correspondencia, derivada de la lectura real

Los 18 roles del prototipo tienen equivalente; los 2 restantes del sistema no lo
tienen porque el prototipo no los modela. Contrastada con `_tokens.scss` y
coincidente con `matriz_delta.md:106-125`:

| Prototipo | Sistema | | Prototipo | Sistema |
|---|---|---|---|---|
| `--bg` | `--color-fondo` | | `--primary-strong` | `--color-primario-fuerte` |
| `--bg-2` | `--color-fondo-alterno` | | `--on-primary` | `--color-sobre-primario` |
| `--card` | `--color-superficie` | | `--accent` | `--color-acento` |
| `--surface` | `--color-superficie-elevada` | | `--accent-ink` | `--color-acento-tinta` |
| `--border` | `--color-borde` | | `--accent-soft` | `--color-acento-suave` |
| `--ink` | `--color-tinta` | | `--urg` | `--color-urgencia` |
| `--text` | `--color-texto` | | `--urg-soft` | `--color-urgencia-suave` |
| `--muted` | `--color-texto-suave` | | `--shadow` | `--sombra-elevada` |
| `--primary` | `--color-primario` | | `--shadow-sm` | `--sombra-reposo` |

Sin contrapartida en el prototipo: `--color-borde-control` (@s8, «el prototipo no
modela este rol») y `--color-foco` (@s9, «el prototipo no declara ninguna regla
de foco»). Confirmado en `matriz_delta.md:117-118`.

El lado `sistema` está tipado como `NombreDeToken` (`tokensColor.ts:44`), así que
**renombrar un rol en el inventario rompe la compilación aquí**. Es justo el
agujero que la matriz señalaba en @s1 (`matriz_trazabilidad.md:23`).

### 2.1 DECISIÓN EXPLÍCITA que hay que revisar en la puerta humana

El contrato dice «salvo en las **tres** desviaciones declaradas de @s6 y @s7».
La medición da 6 parejas distintas, no 3. La regla con la que se reconcilian, y
que es objetiva y uniforme:

- **`--border` es translúcido en 4/4 temas.** Es una decisión de ROL, sistemática,
  no una desviación de variante. Se aparta como tal, y esa uniformidad **se
  afirma** (`fidelidadPrototipo.test.ts:216`): si el prototipo cambiara uno de
  los cuatro a hexadecimal, la puerta lo diría.
- **`--accent-soft` y `--urg-soft` son translúcidos en 1/4 temas** (solo `tech`).
  Eso sí es una desviación por variante, y entran en la lista de las tres.
- **`calida --muted`** es la tercera: la corrección de contraste de @s6.

Con eso salen **exactamente tres**, y la regla no está hecha a medida.

**Lo que queda impreciso en el contrato, y lo devuelvo como aclaración (no como
bloqueante de código):** de las tres, @s6 nombra la primera y @s7 la familia de
urgencia (`--urg-soft`). **`tech --accent-soft` no lo nombra ninguno de los dos**:
se etiqueta `@s7` porque comparte exactamente el mismo motivo —el aplanado del
alfa de `tech`—, y así queda escrito en el comentario de
`fidelidadPrototipo.ts:178-200`. No he inventado comportamiento: he elegido la
lectura que respeta el número que el contrato fija y la he dejado por escrito.

## 3. Ciclos Rojo → Verde → Refactor

Cada ciclo: un test, verlo fallar con mensaje literal, mínimo de producción, verde.

### Ciclo 1 — la tabla existe
- **ROJO** `fidelidadPrototipo.test.ts:135`.
  `Error: Failed to resolve import "./fidelidadPrototipo" from "src/lib/diseno/fidelidadPrototipo.test.ts". Does the file exist?`
- **VERDE** `TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA` (18 filas).

### Ciclo 2 — la tabla cubre lo que el prototipo declara DE VERDAD
- **ROJO** `:139`. `TypeError: extraerTemasDelPrototipo is not a function`
- **VERDE** `TEMAS_DEL_PROTOTIPO` + `extraerTemasDelPrototipo` (profundidad de
  llaves, el mismo mecanismo de `tokensColor.ts:117-146`).
- Aquí se confirmó además que `import.meta.glob('../../../docs/…', {query:'?raw'})`
  resuelve un fichero **fuera de `src/`** y con espacios en el nombre.

### Ciclo 3 — cada rol tiene equivalente declarado en el bloque propio
- **ROJO** `:150`. `TypeError: ejecutarPuertaDeFidelidadDelPrototipo is not a function`
- **VERDE** la puerta, delegando la existencia en `declaraTokenEnVariante`
  (`tokensColor.ts:194`): un token heredado del `:root` global cuenta como ausente.

### Ciclo 3b — los dos roles sin modelo, en lista explícita
- **ROJO** `:156`. `AssertionError: expected undefined to deeply equal [ '--color-borde-control', …(1) ]`
- **VERDE** `ROLES_DEL_SISTEMA_SIN_MODELO_EN_EL_PROTOTIPO`.

### Ciclo 4a — la forma canónica
- **ROJO** `:166`. `TypeError: normalizarValorCss is not a function`
- **VERDE** `normalizarValorCss`. Un hexadecimal **solo** se pasa a mayúsculas:
  meterlo en la canonicalización numérica convertiría `#00FF00` en `#0FF00`.

### Ciclo 4b — las dos listas de exclusión, escritas
- **ROJO** `:184`. `AssertionError: expected undefined to deeply equal [ { variante: 'calida', …(4) }, …(2) ]`
- **VERDE** `DESVIACIONES_DECLARADAS` (3) y `PAREJAS_TRANSLUCIDAS_DEL_PROTOTIPO` (6).

### Ciclo 4c — cada desviación es REAL
- Pasó a la primera (es una aserción de verificación, no pide producción nueva).
  **No me fié**: sabotaje inmediato de `valorDelSistema` `#84663E` → `#84663F`:
  `AssertionError: expected '#84663E' to be '#84663F' // Object.is equality` (2 tests rojos). Restaurado.

### Ciclo 4d — los translúcidos, derivados del texto real
- **ROJO** `:211`. `TypeError: extraerParejasTranslucidasDelPrototipo is not a function`
- **VERDE** `esColorTranslucido` anclado a `^rgba(`: las dos sombras llevan
  `rgba()` DENTRO y no son colores translúcidos. Afirmado en `:220`.

### Ciclo 5 — la comparación carácter a carácter y los tres contadores
- **ROJO** `:225`. `AssertionError: expected undefined to deeply equal []`
- **VERDE** los tres cubos (comparado / desviación / translúcido) y
  `72 = 65 + 3 + 4`, afirmado en `:233`: ninguna pareja se queda sin mirar.

### Ciclo 6a — falla cerrada con prototipo ilegible
- **ROJO** `:239`. `Error: el prototipo no declara ningún bloque ":root"` (lanzaba
  en vez de informar).
- **VERDE** `MOTIVO_PROTOTIPO_ILEGIBLE` + `declaraLosCuatroTemas`.

### Ciclo 6b — falla cerrada con la tabla vacía
- **ROJO** `:254`. `AssertionError: expected true to be false // Object.is equality`
- **VERDE** tercer parámetro inyectable + `MOTIVO_TABLA_VACIA`.

### Ciclo 7 — «si el prototipo cambiara un solo hexadecimal»
- `:265`. Sabotaje sobre COPIA EN MEMORIA (`--primary:#1E40AF` → `#1E40AE`); el
  fichero versionado nunca se toca, y `:277` lo comprueba.
- Pasó a la primera. **Verificado por sabotaje de producción**: dejando
  `discrepanciasSiNoCoinciden` en `return []` → `AssertionError: expected true to be false`. Restaurado.

### Ciclo 8 — las exclusiones NO son agujeros
- **ROJO REAL** `:281`. `AssertionError: expected [ { variante: 'calida', …(6) } ] to deeply equal [ { variante: 'calida', …(3) } ]`
- **Defecto propio encontrado y corregido**: `comprobarDesviacion` derramaba
  `valorDelPrototipo`, `valorDelSistema` y `escenario` dentro de la
  `Discrepancia` (spread de la desviación entera). Ahora recibe la pareja.
- El test demuestra que **volver al valor del prototipo también es rojo**
  (sería la regresión de contraste de 4.37 de @s6).

### Ciclo 9 — la puerta mira los DOS lados
- `:314`. `rediseno_visual.feature:74-75` pide las dos direcciones: «Si el diseño
  cambia, el test lo dice. Si el sitio se desvía, el test lo dice».

### Refactor (siempre en verde, 13/13 tras cada paso)
1. El bloque se localiza por `selector{` y no por `selector`: `:root` es prefijo
   de `:root[data-tema='calida']`, así que buscarlo suelto dependía de que el
   tema base apareciera primero en el fichero.
2. `DesviacionDeclarada` movida por delante de la constante que la usa.
3. `declaraLosCuatroTemas` reutiliza la misma forma `selector + LLAVE_ABRE`.
4. Lint: `.sort()` a `.toSorted()` y `Array.includes` a `Set.has`.

## 4. Mapa cláusula → aserción

| Cláusula de @s3 | Aserción (fichero:línea) |
|---|---|
| *Given* el texto real de los dos ficheros, con `?raw` | `fidelidadPrototipo.test.ts:9-17` (prototipo) y `:26-32` (`_tokens.scss`) |
| *When* se extraen los bloques `:root` y `:root[data-tema=…]` y se comparan rol a rol con las 4 variantes | `:141` (los 4 temas, en orden) · `:146` (los 18 roles de cada tema) · `:225-236` (la puerta) |
| **Then** cada rol del prototipo tiene su equivalente declarado en el sistema, según la tabla de correspondencia | `:136` (tabla = literal a mano) · `:146` (la tabla cubre lo que el prototipo declara) · `:152` `rolesSinEquivalente == []` · `:153` `equivalenciasComprobadas == 72` · `:157` y `:163` (los 2 roles sin modelo, confrontados con el inventario real) |
| **And** el valor coincide carácter a carácter, salvo en las tres desviaciones declaradas de @s6 y @s7 | `:228` `discrepancias == []` · `:229` `valoresComparados == 65` · `:185` (las 3 desviaciones = literal a mano) · `:199-200` (los 2 valores de cada una, leídos de los ficheros reales) · `:203` (cada exclusión excluye algo de verdad) · `:208` `toHaveLength(3)` · `:186`, `:213`, `:216`, `:220` (las 6 parejas translúcidas) · `:169-181` (la forma canónica no borra valor) |
| **And** el recuento de roles efectivamente comparados es mayor que 0 | `:240` `toBeGreaterThan(0)` · `:233` (65+3+4 == 72) · falla cerrada: `:244-251` (prototipo ilegible) y `:257-262` (tabla vacía) |
| **And** si el prototipo cambiara un solo hexadecimal, esta comprobación fallaría | `:265-279` (sabotaje sobre copia en memoria; `:277` comprueba que el fichero versionado sigue intacto) · `:281-311` (las exclusiones tampoco son agujeros) · `:314-326` (deriva del lado del sistema) |

Los 14 tests llevan `@s3` en el título: la trazabilidad es legible desde el runner.

## 5. Verificación obligatoria — salida literal

### 5.1 `pnpm exec vitest run src/lib/diseno/fidelidadPrototipo.test.ts`

```
 RUN  v4.1.10 C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria

 Test Files  1 passed (1)
      Tests  14 passed (14)
   Start at  20:29:36
   Duration  8.57s (transform 196ms, setup 1.01s, import 130ms, tests 20ms, environment 3.86s)
```

### 5.2 `pnpm run lint` y `pnpm run typecheck` — 0 y 0 en mis ficheros

```
$ pnpm exec oxlint --deny-warnings src/lib/diseno/fidelidadPrototipo.ts src/lib/diseno/fidelidadPrototipo.test.ts
EXIT=0

$ pnpm exec tsc --noEmit -p tsconfig.mio.json     # extends tsconfig.app.json, include = mis 2 ficheros
EXIT=0

$ pnpm run lint      | grep -c fidelidadPrototipo   ->  0
$ pnpm run typecheck | grep -c fidelidadPrototipo   ->  0
```

`pnpm run lint` y `pnpm run typecheck` GLOBALES **no** salen en 0, pero **ningún
error es mío** (ver §7): son de ficheros de otros artesanos en vuelo.

### 5.3 Sabotajes — cada puerta se ha visto fallar

Nueve sabotajes sobre el módulo de producción y dos sobre el cableado `?raw`.
Todos restaurados; `diff -q` contra la copia original: **ficheros idénticos**.

| # | Sabotaje | Resultado |
|---|---|---|
| 1 | Quito la fila `--urg` de la tabla | 5 rojos. `AssertionError: expected [ { prototipo: '--bg', …(1) }, …(16) ] to deeply equal [ { prototipo: '--bg', …(1) }, …(17) ]` |
| 2 | Añado `--color-acento` a los «no modelados» | 1 rojo. `AssertionError: expected [ '--color-borde-control', …(2) ] to deeply equal [ '--color-borde-control', …(1) ]` |
| 3 | La forma canónica deja de canonicalizar números | 4 rojos. `AssertionError: expected '0 6px 18px rgba(15,32,60,.07)' to be '0 6px 18px rgba(15,32,60,0.07)'` |
| 4 | `valorDelSistema` `#84663E` → `#84663F` | 2 rojos. `AssertionError: expected '#84663E' to be '#84663F' // Object.is equality` |
| 5 | Quito `tech/--border` de los translúcidos | 5 rojos. `AssertionError: expected [ { variante: 'clinica', …(1) }, …(4) ] to deeply equal [ …(5) ]` |
| 6 | `discrepanciasSiNoCoinciden` → `return []` | 1 rojo. `AssertionError: expected true to be false // Object.is equality` |
| 7 | Quito la guarda de prototipo ilegible | 1 rojo. `Error: el prototipo no declara ningún bloque ":root"` |
| 8 | Quito la guarda de tabla vacía | 1 rojo. `AssertionError: expected undefined to be 'la tabla de correspondencia está vací…'` |
| 9 | `comprobarTranslucido` → `return []` | 1 rojo. `AssertionError: expected true to be false // Object.is equality` |
| A | El glob apunta a `Tienda.dc.html` | **7 rojos** — la puerta está atada a ESE prototipo, no a cualquiera |
| B | El glob de `_tokens.scss` apunta a un fichero inexistente | 6 rojos |

Los sabotajes A y B prueban el cableado: los dos textos salen de los ficheros
REALES. Ningún sabotaje tocó `docs/diseno-claude-design/` ni `src/styles/_tokens.scss`
— los cuatro sabotajes de DATOS viven dentro de los tests, sobre copias en
memoria (`:267`, `:285`, `:298`, `:318`), tal como exige la última cláusula de @s3.

### 5.4 Suite completa

`pnpm exec vitest run` → `Test Files 4 failed | 82 passed (86)`, `Tests 15 failed | 1042 passed (1057)`.
Los 15 rojos están en `src/accesibilidad-teclado.test.tsx`,
`src/lib/diseno/contratoRedisenho.test.ts`, `src/lib/diseno/datosDelSitio.test.ts` y
`src/lib/diseno/rolesDescartados.test.ts` — todos de otros artesanos, en vuelo.
`fidelidadPrototipo.test.ts`: 14/14 verdes.

## 6. Cumplimiento de las reglas duras

- **Nada de `className`**: cero aserciones sobre clases. Todo valor sale del TEXTO
  REAL de un fichero leído con `import.meta.glob(..., {query:'?raw'})`.
- **Sin verde por vacuidad**: tres contadores (`equivalenciasComprobadas`,
  `valoresComparados`, `desviacionesVerificadas` + `translucidosVerificados`),
  afirmados por número exacto, con la suma cuadrada contra el total (`:233`), y
  DOS guardas de fallo cerrado con mensaje escrito a mano en el test (`:248`, `:260`).
- **Lógica en módulo puro**: `fidelidadPrototipo.ts` no lee ficheros ni toca el DOM;
  recibe los dos textos. Cero `.tsx`. Todo se afirma POR VALOR.
- **Doble anclado al literal**: la tabla (`:16-33`), las 3 desviaciones (`:44-70`),
  las 6 parejas translúcidas (`:78-89`), los 2 roles sin modelo (`:113`), los 4
  temas (`:34`) y los dos mensajes de fallo cerrado están escritos A MANO en el
  test y confrontados con lo que declara el código y con lo que declaran los
  ficheros reales.
- **Español, y el porqué con su fuente**: cada comentario cita `fichero:línea`,
  `@sNN` o el documento de medición.
- **Sin reintentos, sin `skip`, sin `fixme`.** Ninguna aserción existente debilitada
  (no se tocó ningún fichero ajeno).
- **No ejecutado, por prohibición explícita**: `pnpm run build`, `playwright test`,
  `vite preview`, `stryker run`. No he escrito ningún spec de Playwright: @s3 es
  íntegramente de Vitest sobre texto real.

## 7. Bloqueantes / cosas fuera de mi ámbito

Ninguna me impide cerrar @s3. Las devuelvo medidas:

1. **`src/lib/diseno/datosDelSitio.test.ts`** — 10 errores de `tsc` (p. ej.
   `datosDelSitio.test.ts(2,46): error TS2305: Module '"./datosDelSitio"' has no
   exported member 'LITERALES_DE_LA_CLINICA_FICTICIA'` y nueve
   `TS2554: Expected 3 arguments, but got 2`) y 1 test rojo (`:213`). Otro artesano.
2. **`src/components/SelectorPaleta-logica.test.ts:11` y `:18`** —
   `TS6133 / no-unused-vars`: `VARIANTES_REDISENO` y `VARIANTE_POR_DEFECTO`
   importados y no usados. Rompe `pnpm run lint` y `pnpm run typecheck` globales.
3. **`src/lib/diseno/rolesDescartados.test.ts:152`** —
   `unicorn(consistent-function-scoping)`: `rutas` no captura nada del ámbito padre.
   Además 3 tests rojos (`:139`, `:161`, `:173`).
4. **`src/lib/diseno/matrizDeContraste.ts:122`** — `unicorn(no-useless-spread)`.
5. **`src/lib/diseno/contratoRedisenho.test.ts`** — 3 rojos (`:144`, `:162`, `:175`).
6. **`src/accesibilidad-teclado.test.tsx`** — 3 rojos (`:30`, `:104`, `:126`).

7. **ACLARACIÓN DE CONTRATO (no bloquea, pero conviene fijarla en la puerta
   humana)**: @s3 dice «las tres desviaciones declaradas de @s6 y @s7».
   Medido, @s6 declara una (`calida --muted`) y @s7 la familia de urgencia
   (`tech --urg-soft`); la tercera, `tech --accent-soft`, **no la nombra ninguno
   de los dos**. Está resuelta con la regla objetiva de §2.1 y documentada en el
   código, pero si el humano prefiere otra lectura (por ejemplo meter las cuatro
   parejas de `--border` en la lista), cambia el número y hay que enmendar el
   `.feature`, no el test.

## 8. Ficheros tocados

- `src/lib/diseno/fidelidadPrototipo.ts` — NUEVO, módulo puro.
- `src/lib/diseno/fidelidadPrototipo.test.ts` — NUEVO, 14 tests, todos `@s3`.
- `progress/rediseno/tdd_fidelidad-prototipo.md` — este informe.

Ni un fichero fuera del ámbito asignado.
