# TDD — lote `matriz-de-contraste` (rediseno_visual, id 24)

Escenarios asignados: **@s6, @s7, @s8, @s9, @s11** de `features/rediseno_visual.feature`.

Ámbito de ficheros respetado al 100 %. Solo se han creado dos ficheros nuevos:

- `src/lib/diseno/matrizDeContraste.ts`
- `src/lib/diseno/matrizDeContraste.test.ts`

`git status --porcelain | grep -v '^??'` al cerrar no lista ninguno de mis
ficheros: los diez ficheros modificados del árbol son de los otros artesanos de
la oleada. `docs/diseno-claude-design/` quedó **byte a byte idéntico** tras los
sabotajes (verificado con `git diff --quiet -- docs/`).

---

## 0. Decisiones de partida (medidas, no supuestas)

Todo lo que sigue se midió ejecutando la fórmula real de `src/lib/contraste.ts`
sobre los valores leídos del texto real de los ficheros.

| Medición | Resultado |
| --- | --- |
| `--muted` / `--bg-2` del tema `calida` del prototipo (`#8A6C45` sobre `#FEF3C7`) | **4.374025184740888** → 4.37 |
| `--color-texto-suave` / `--color-fondo-alterno` de `calida` en el sistema (`#84663E` sobre `#FEF3C7`) | 4.7729890 |
| ídem sobre `--color-fondo` (`#FFFBF2`) | 5.1460200 |
| ídem sobre `--color-superficie` (`#FFFDF8`) | 5.2281570 |
| `--color-sobre-primario` / `--color-urgencia` en `tech` (`#04212B` sobre `#F87171`) | 6.0368 |
| blanco literal sobre el `--urg` de `tech` del prototipo (`#FFFFFF` sobre `#F87171`) | 2.7661 → **2.77** |
| `--color-borde-control` contra el fondo propio | clinica 4.94 · calida 4.72 · tech 9.94 · eco 5.20 · marca 4.23 (mínimo 3) |
| `--color-foco` contra el fondo propio | clinica 8.34 · calida 6.86 · tech 12.32 · eco 7.57 · marca 9.13 (mínimo 3) |
| ocurrencias de `outline:none` en el prototipo | **6** (las cuatro páginas del bundle: solo el `.dc.html` principal las tiene) |
| ocurrencias de `:focus` en el prototipo | **0** |
| roles de custom property declarados por el prototipo | **18**, ninguno de foco ni de borde de control |
| atributos `style` del prototipo con `background:var(--urg)` | **4**, y los cuatro escriben `color:#fff` |

---

## 1. Ciclos rojo → verde → refactor

Cada ciclo cita el mensaje de fallo **literal** que devolvió Vitest en ROJO.

### C1 — andamio de lectura del prototipo (@s6)
- **ROJO**: `Error: Failed to resolve import "./matrizDeContraste" from "src/lib/diseno/matrizDeContraste.test.ts". Does the file exist?`
- **VERDE**: `leerRolDeTemaDelPrototipo` + `extraerBloqueDeTemaDelPrototipo`.
- Incidencia real durante el ciclo: el primer intento construyó los patrones con
  `\\s` dentro de un heredoc y quedó escrito `\s` en el fichero, así que la
  expresión no casaba. Se vio el fallo
  (`no se encontró ningún bloque ":root[data-tema='calida']" en el texto del prototipo`)
  y se corrigió escribiendo el fichero verbatim.

### C2 — @s6 cláusula 1: «el valor del prototipo daba 4.37»
- **ROJO**: `TypeError: evaluarParDelPrototipo is not a function`
- **VERDE**: `evaluarParDelPrototipo` + `conRatioPublicado` (el redondeo a dos
  decimales vive en producción, no en el test, para que StrykerJS lo muerda).

### C3 — @s6 cláusula 2: «el valor declarado en el sistema alcanza al menos 4.5»
- **ROJO**: `TypeError: evaluarParDeVariante is not a function`
- **VERDE**: `evaluarParDeVariante`, que reutiliza `leerTokenDeVariante` de
  `tokensColor.ts` (lee el bloque PROPIO de la variante, nunca uno heredado).

### C4 — @s6 cláusula 3: «sigue aprobando sobre el fondo y sobre la superficie»
- **ROJO**: `TypeError: ejecutarMatrizDeContrasteDeVariantes is not a function`
- **VERDE**: primera versión de la puerta de matriz, con contador de variantes y
  de parejas.

### C5 — @s7: «el color de encima es --color-sobre-primario» + 4.5 en las cinco
- **ROJO**: `TypeError: Cannot read properties of undefined (reading 'filter')`
  (`MATRIZ_DE_USO_DEL_SISTEMA` aún no existía).
- **VERDE**: la matriz nace con **una** fila, la de `sobre-primario` sobre
  `urgencia`, citada a `BarraUrgencias.module.scss:12-13`.

### C6 — @s7: «tech ≥ 6, frente al 2.77 del blanco del prototipo»
- **ROJO**: `TypeError: leerTintasLiteralesSobreRolDelPrototipo is not a function`
- **VERDE**: `leerTintasLiteralesSobreRolDelPrototipo` (mide qué tinta LITERAL
  pinta el prototipo dentro del mismo `style` que pone `background:var(--urg)`)
  + `evaluarTintaSobreRolDelPrototipo`. El `#fff` **no se escribe a mano**: se lee
  del prototipo y se expande a seis dígitos, porque `contraste.ts:26` rechaza la
  forma abreviada.

### C7 — @s8: las cinco declaran el rol y su ratio alcanza 3
- **ROJO**: `AssertionError: expected [] to deeply equal [ Array(1) ]`
  (la matriz no tenía la fila `borde-control` sobre `fondo`).
- **VERDE**: segunda fila de la matriz, citada a `_api.scss:246-255`.

### C8 — @s8: «el prototipo no modela este rol»
- **ROJO**: `TypeError: extraerNombresDeRolDelPrototipo is not a function`
- **VERDE**: `extraerNombresDeRolDelPrototipo`, que devuelve los nombres
  DECLARADOS (no los usados con `var()`), en orden y sin duplicados.

### C9 — @s9: las cinco declaran `--color-foco` y su ratio alcanza 3
- **ROJO**: `AssertionError: expected [] to deeply equal [ Array(1) ]`
- **VERDE**: tercera fila de la matriz, citada a `_api.scss:75`.

### C10 — @s9: «no declara ninguna regla de foco y suprime el contorno en seis controles»
- **ROJO**: `TypeError: comprobarRolesAusentesDelPrototipo is not a function`
- **VERDE**: `comprobarRolesAusentesDelPrototipo`, `contarReglasDeFocoDelPrototipo`
  y `contarSupresionesDeContornoDelPrototipo`.

### C11 — fallo cerrado de la puerta de roles ausentes
En C10 escribí la guarda anti-vacuidad **sin** un test rojo que la pidiera (desliz
de la Ley 1). Se reparó de verdad: se **quitó** la guarda del fichero de
producción, se escribió el test, se vio el rojo y se restauró.
- **ROJO**: `AssertionError: expected true to be false // Object.is equality`
- **VERDE**: guarda restaurada, con su `motivo` literal.

### C12 — @s11: la matriz completa
- **ROJO**: `AssertionError: expected [ …(3) ] to have a length of 21 but got 3`
- **VERDE**: las 21 filas, **cada una con la cita fichero:línea de la hoja de
  estilo que la pinta de verdad**. `--color-borde` queda fuera a propósito
  (decorativo, `_api.scss:168-170`).

### C13 — @s11: «con una matriz vacía el veredicto sería suspenso»
- **ROJO** (dos tests):
  `AssertionError: expected 'aprobado' to be 'suspenso' // Object.is equality`
  Es exactamente el defecto `verde-por-vacuidad-en-puerta-de-verificacion`: sin
  guarda, `suspensos.length === 0` sobre cero pares daba «aprobado».
- **VERDE**: guarda de fallo cerrado para matriz vacía **y** para catálogo de
  variantes vacío, con `variantesComprobadas: 0` y `parejasComprobadas: 0`.

### C14 — @s11: veredicto aprobado para las cinco + prueba de que la puerta muerde
El test de integración pasó a la primera (la puerta y la matriz ya existían), así
que **no se dio por bueno**: se le añadió en el mismo ciclo un test que dobla el
TEXTO REAL de `_tokens.scss` en memoria (sin tocar el fichero, que es de otro
artesano) degradando `--color-borde-control` de `marca`, y exige que la puerta
señale las tres filas exactas que suspenden con su variante, su rol, su fondo, su
umbral (3) y su ratio (< 3). Ese test es permanente.

### REFACTOR (siempre en verde, 18/18 tras cada paso)
1. Un único sitio publica el ratio redondeado (`conRatioPublicado`), en vez de
   repetir el spread tres veces.
2. `evaluarParDeVariante` movida por encima de su consumidor y extraída
   `suspensosDeVariante` del `flatMap`.
3. `PATRON_TINTA_LITERAL` acotado a la forma abreviada de tres dígitos **con
   anticipación negativa**, para no cortar por la mitad un hexadecimal largo; se
   eliminó así la rama muerta de `expandirHexadecimalAbreviado` (código que
   ningún test ejercitaba y que habría sobrevivido a la mutación).
4. El `expect(TEXTO_TOKENS.length).toBeGreaterThan(0)` que sobraba dentro de un
   test del prototipo se convirtió en una guarda propia de las dos lecturas en
   crudo (texto no vacío + ancla presente en cada fichero).
5. Se cubrieron las dos guardas del lector del prototipo (tema inexistente y
   bloque sin cerrar), que en C1 se habían escrito sin test. Verificadas por
   sabotaje (SABOTAJE H).

---

## 2. Mapa cláusula → aserción

Fichero de tests: `src/lib/diseno/matrizDeContraste.test.ts`.

### @s6 — La variante cálida corrige el único suspenso del prototipo

| Cláusula | Aserción |
| --- | --- |
| `Then el valor del prototipo daba 4.37 y habría suspendido el mínimo de 4.5` | `:55` `ratioRedondeado === 4.37`, `:56` `umbral === 4.5`, `:57` `veredicto === 'suspenso'`; los dos hexadecimales se leen del prototipo en `:53-54` |
| `And el valor declarado en el sistema alcanza al menos 4.5` | `:76` `umbral === 4.5`, `:77` `ratio >= 4.5`, `:79` `veredicto === 'aprobado'`; `:74` prueba que el sistema NO copia el `--muted` del prototipo y `:78` que lo mejora estrictamente |
| `And ese mismo valor sigue aprobando sobre el fondo y sobre la superficie de su variante` | `:88-91` la puerta resuelve las dos parejas (`parejasComprobadas === 2`), `suspensos === []`, `veredicto === 'aprobado'` |

### @s7 — La tinta encima del color de urgencia nunca es blanca por defecto

| Cláusula | Aserción |
| --- | --- |
| `Then el color de encima es siempre "--color-sobre-primario" de esa misma variante` | `:101` la matriz declara **una sola** tinta sobre `urgencia` y es `sobre-primario` (literal escrito a mano); `:115` el hexadecimal resuelto en cada una de las cinco es exactamente `leerTokenDeVariante(..., 'sobre-primario')`. **Cobertura parcial: ver BLOQUEANTE 1** |
| `And el ratio resultante alcanza al menos 4.5 en las cinco variantes` | `:104-107` (`variantesComprobadas === 5`, `parejasComprobadas === 5`, `suspensos === []`) y `:113` `toHaveLength(5)` + `:116-117` por variante |
| `And en la variante "tech" ese par da al menos 6, frente al 2.77 que daría el blanco del prototipo` | `:127` `ratio >= 6`; `:134` las **cuatro** tintas literales que el prototipo pinta sobre `--urg` son blancas; `:143` `ratioRedondeado === 2.77`, `:144` `veredicto === 'suspenso'`, `:145` el del sistema es estrictamente mayor |
| `And ningún fichero de estilos escribe blanco literal sobre el color de urgencia` | Ya mordida fuera de mi lote en `src/lib/diseno/inventarioModulos.test.ts:143-145` (18 `.module.scss` reales con `?raw`, `señalados === 0`). No la duplico. |

### @s8 — El borde de control existe en las cinco y cumple el mínimo de componentes

| Cláusula | Aserción |
| --- | --- |
| `Then las cinco variantes declaran ese rol` | `:156` la lista de variantes que declaran `--color-borde-control` en su bloque propio es igual al literal escrito a mano `['clinica','calida','tech','eco','marca']` |
| `And el ratio alcanza al menos 3 en las cinco` | `:161` el uso declarado es el de componente de interfaz; `:164-167` la puerta (5 variantes, 5 parejas, 0 suspensos, aprobado); `:172` `toHaveLength(5)`; `:174` `umbral === 3` (el umbral sale de la tabla real de `contraste.ts`, no de un literal del test); `:175` `ratio >= 3` |
| `And el prototipo no modela este rol…` | `:185-205` el inventario de roles del prototipo es exactamente los 18 nombres escritos a mano, ninguno de borde de control; `:209` su único `--border` ni siquiera es un hexadecimal (lanza). **La segunda mitad de la cláusula — «se deriva por mezcla del primario con el fondo, con la regla escrita en el propio fichero» — NO queda mordida: ver BLOQUEANTE 2** |

### @s9 — El anillo de foco existe en las cinco y se distingue de su fondo

| Cláusula | Aserción |
| --- | --- |
| `Then las cinco variantes declaran ese rol` | `:220` igual que @s8, con literal escrito a mano |
| `And el ratio alcanza al menos 3 en las cinco` | `:225` uso; `:228-231` puerta (5/5/0/aprobado); `:236` `toHaveLength(5)`; `:238` `umbral === 3`; `:239` `ratio >= 3` |
| `And el prototipo no declara ninguna regla de foco y además suprime el contorno en seis controles…` | `:254` `rolesInspeccionados === 5`, `:255` ninguno presente, `:256` `pasa === true`; `:258` `contarReglasDeFocoDelPrototipo === 0`; `:259` `contarSupresionesDeContornoDelPrototipo === 6` |
| (regla dura del repo: fallo cerrado) | `:265-267` con lista de candidatos vacía → `rolesInspeccionados === 0`, `pasa === false`, `motivo` literal |

### @s11 — Ninguna de las cinco suspende su matriz de uso

| Cláusula | Aserción |
| --- | --- |
| `Then el veredicto es aprobado para las cinco` | `:323` `suspensos === []`, `:324` `veredicto === 'aprobado'` |
| `And el recuento de variantes comprobadas es exactamente 5` | `:321` `variantesComprobadas === 5` y `:322` `parejasComprobadas === 105` (21 × 5) |
| `And con una matriz vacía el veredicto sería suspenso, no aprobado por vacuidad` | `:299-302` matriz vacía → suspenso, 0 y 0, con `motivo`; `:308-311` catálogo de variantes vacío → lo mismo |
| (integridad de la matriz, para que el «aprobado» no salga de una matriz encogida) | `:273` 21 filas; `:278` sin pares repetidos; `:282-283` todo rol citado existe en `ROLES_DE_COLOR_REDISENO`; `:288` `--color-borde` excluido; `:291` los dos únicos usos WCAG |
| (prueba de que la puerta muerde) | `:336-353` con el texto real doblado en memoria, la puerta evalúa las 105 parejas y señala **exactamente** `marca: borde-control sobre fondo / sobre fondo-alterno / sobre superficie-elevada`, con `umbral === 3` y `ratio < 3` |

---

## 3. Verificación obligatoria (salida literal)

### 3.1 Tests

```
> pnpm exec vitest run src/lib/diseno/matrizDeContraste.test.ts

 RUN  v4.1.10 C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria

 Test Files  1 passed (1)
      Tests  18 passed (18)
   Start at  20:49:00
   Duration  1.79s (transform 78ms, setup 274ms, import 74ms, tests 19ms, environment 1.15s)
```

Los 18 tests, por nombre:

```
✓ las dos lecturas en crudo traen contenido real, nunca una cadena vacía > los dos ficheros llegan con su texto y con sus anclas, así que ninguna puerta puede aprobar sobre el vacío
✓ @s6 … > el texto suave del prototipo sobre su fondo alterno daba 4.37 y habría suspendido el mínimo de 4.5
✓ @s6 … > el valor declarado en el sistema alcanza al menos 4.5 sobre el fondo alterno de su variante
✓ @s6 … > ese mismo valor sigue aprobando sobre el fondo y sobre la superficie de su variante
✓ @s7 … > el color de encima es "--color-sobre-primario" de esa misma variante y alcanza 4.5 en las cinco
✓ @s7 … > en la variante "tech" ese par da al menos 6, frente al 2.77 que daría el blanco del prototipo
✓ @s8 … > las cinco variantes declaran el rol y su ratio contra el fondo propio alcanza al menos 3
✓ @s8 … > el prototipo no modela este rol: su inventario de dieciocho roles no incluye ningún borde de control
✓ @s9 … > las cinco variantes declaran el rol y su ratio contra el fondo propio alcanza al menos 3
✓ @s9 … > el prototipo no declara ninguna regla de foco y además suprime el contorno en seis controles
✓ @s9 … > la puerta de roles ausentes falla cerrada ante una lista de candidatos vacía
✓ @s11 … > la matriz declara los veintiún pares (rol, fondo, uso) que el sistema pinta de verdad
✓ @s11 … > con una matriz vacía el veredicto es suspenso, no aprobado por vacuidad
✓ @s11 … > con el catálogo de variantes vacío el veredicto también es suspenso
✓ @s11 … > resuelta contra las cinco variantes, el veredicto es aprobado y el recuento es exactamente 5
✓ @s11 … > si un solo token bajara del mínimo, la puerta lo señalaría con su variante y su rol
✓ el lector del prototipo falla ruidosamente, nunca en silencio > lanza si le piden un tema que el prototipo no declara
✓ el lector del prototipo falla ruidosamente, nunca en silencio > lanza si el bloque del tema aparece pero se queda sin cerrar
```

### 3.2 Lint y typecheck

```
pnpm run lint      -> exit 0
pnpm run typecheck -> exit 0
```

Y acotado solo a mis dos ficheros:

```
> pnpm exec oxlint --deny-warnings src/lib/diseno/matrizDeContraste.ts src/lib/diseno/matrizDeContraste.test.ts
OXLINT_EXIT=0
```

Nota de convivencia: a las 20:45 `pnpm run lint` y `pnpm run typecheck` fallaban
por `src/lib/diseno/rolesDescartados.ts:57` (`PATRON_COMENTARIO_DE_BLOQUE`
declarada y no usada) y antes por `src/lib/diseno/usoDelAcento.test.ts:3` — los
dos, ficheros de otros artesanos a medio ciclo. Ninguno de los errores citó
jamás un fichero mío (`pnpm run typecheck | grep -c matrizDeContraste` → `0`).
A las 20:49 el árbol entero volvía a estar en 0 y 0.

### 3.3 Sabotajes (cada puerta vista fallar y restaurada)

**SABOTAJE A** — `--muted:#8A6C45` → `#7A5C35` en el tema `calida` del prototipo:

```
FAIL @s6 … > el texto suave del prototipo … daba 4.37 …
AssertionError: expected '#7A5C35' to be '#8A6C45' // Object.is equality
FAIL @s6 … > el valor declarado en el sistema alcanza al menos 4.5 …
AssertionError: expected 4.77298904337433 to be greater than 5.530883917278132
Tests  2 failed | 13 passed (15)
```

**SABOTAJE B+C** — un `outline:none` → `outline:auto` y un `color:#fff` sobre
`var(--urg)` → `#eee`:

```
FAIL @s7 … > en la variante "tech" ese par da al menos 6 …
AssertionError: expected [ '#EEEEEE', '#FFFFFF', …(2) ] to deeply equal [ '#FFFFFF', '#FFFFFF', …(2) ]
FAIL @s9 … > el prototipo no declara ninguna regla de foco …
AssertionError: expected 5 to be 6 // Object.is equality
Tests  2 failed | 13 passed (15)
```

**SABOTAJE D** — el prototipo pasa a declarar `--border-control:#123456`:

```
FAIL @s8 … > el prototipo no modela este rol …
AssertionError: expected [ '--bg', '--bg-2', '--card', …(16) ] to deeply equal [ '--bg', '--bg-2', '--card', …(15) ]
Tests  1 failed | 14 passed (15)
```

**SABOTAJE E** — el prototipo pasa a declarar `a:focus{outline:2px solid var(--primary)}`:

```
FAIL @s9 … > el prototipo no declara ninguna regla de foco …
AssertionError: expected 1 to be +0 // Object.is equality
Tests  1 failed | 14 passed (15)
```

Tras A, B+C, D y E el prototipo se restauró desde copia y se comprobó con
`git diff --quiet -- "docs/diseno-claude-design/Veterinaria La Sierra.dc.html"` →
`RESTAURADO OK (git diff limpio)`.

**SABOTAJE F** — degradación de tres tokens **en memoria** (no se tocó
`src/styles/_tokens.scss`, que está siendo editado por otro artesano):
`calida --color-texto-suave` → el `#8A6C45` suspenso del prototipo,
`eco --color-foco` → `#FAFFFD`, `tech --color-borde-control` → `#12203A`.

```
FAIL @s6 … > el valor declarado en el sistema alcanza al menos 4.5 …
AssertionError: expected '#8A6C45' not to be '#8A6C45' // Object.is equality
FAIL @s8 … > las cinco variantes declaran el rol y su ratio … alcanza al menos 3
AssertionError: expected [ { variante: 'tech', …(4) } ] to deeply equal []
FAIL @s9 … > las cinco variantes declaran el rol y su ratio … alcanza al menos 3
AssertionError: expected [ { variante: 'eco', …(4) } ] to deeply equal []
FAIL @s11 … > resuelta contra las cinco variantes, el veredicto es aprobado …
AssertionError: expected [ { variante: 'calida', …(4) }, …(5) ] to deeply equal []
FAIL @s11 … > si un solo token bajara del mínimo, la puerta lo señalaría …
AssertionError: expected [ …(9) ] to deeply equal [ …(3) ]
Tests  5 failed | 10 passed (15)
```

**SABOTAJE G** — la matriz declara `tinta` (y no `sobre-primario`) encima de
`urgencia`:

```
FAIL @s7 … > el color de encima es "--color-sobre-primario" …
AssertionError: expected [ 'tinta' ] to deeply equal [ 'sobre-primario' ]
FAIL @s11 … > resuelta contra las cinco variantes …
AssertionError: expected [ { variante: 'clinica', …(4) }, …(4) ] to deeply equal []
FAIL @s11 … > si un solo token bajara del mínimo …
AssertionError: expected [ …(8) ] to deeply equal [ …(3) ]
Tests  3 failed | 12 passed (15)
```

**SABOTAJE H** — las dos guardas del lector del prototipo devuelven `''` en vez
de lanzar:

```
FAIL … > lanza si le piden un tema que el prototipo no declara
AssertionError: expected [Function] to throw error including 'no se encontró ningún bloque ":root[d…' but got 'no se encontró el rol "--bg" en el te…'
FAIL … > lanza si el bloque del tema aparece pero se queda sin cerrar
AssertionError: expected [Function] to throw error including 'el bloque ":root[data-tema=\'calida\'…' but got 'no se encontró el rol "--bg" en el te…'
Tests  2 failed | 16 passed (18)
```

Los sabotajes F, G y H se hicieron sobre ficheros de mi propio ámbito o en
memoria, y se restauraron desde copia; tras cada restauración la suite volvió a
`18 passed (18)`.

**Sabotajes de vacuidad ya vistos en rojo durante el TDD**, sin necesidad de
repetirlos: C11 (`expected true to be false`) y C13 (`expected 'aprobado' to be
'suspenso'`, dos veces).

---

## 4. Playwright

Este lote **no** escribe ningún spec de Playwright. Todo lo que piden @s6, @s7,
@s8, @s9 y @s11 es aritmética sobre valores declarados en texto: el navegador
real no aporta nada que la fórmula de `src/lib/contraste.ts` no dé ya, y el
único trozo que sí necesita navegador (medir el contorno realmente pintado al
enfocar) ya existe y está fuera de mi ámbito, en
`tests/e2e/accesibilidad.spec.ts:217-268`.

Sí conviene dejar anotado para quien lleve el e2e: ese spec **solo mide la
variante activa** (nunca cambia `data-variante`), así que las otras cuatro
variantes no se miden en navegador. Mi puerta las cubre a nivel de token, que es
lo que @s9 pide, pero no sustituye a la medición en navegador de las otras cuatro.

---

## 5. BLOQUEANTES (medidos, fuera de mi ámbito, NO tocados)

### BLOQUEANTE 1 — `src/components/BarraUrgencias.module.scss:19`

```scss
.barra {
  background-color: var(--color-urgencia);   // línea 12
  color: var(--color-sobre-primario);        // línea 13

  span {
    color: var(--color-acento);              // línea 19  <-- incumple @s7
```

@s7 dice, categórico: *«el color de encima es siempre "--color-sobre-primario"
de esa misma variante»*. El `<span aria-hidden="true">●</span>` de
`src/components/BarraUrgencias.tsx:10` se pinta con `--color-acento` **sobre la
superficie roja de urgencia**. Ratios medidos de ese par con la fórmula real:
clinica 1.90 · calida 1.04 · tech 1.53 · eco 1.61 · marca 2.56. Los cinco
suspenden 4.5 y también 3.

**Qué haría falta**: `src/components/BarraUrgencias.module.scss:19` →
`color: var(--color-sobre-primario);` (o eliminar la declaración, ya que
`.barra` ya fija esa tinta en la línea 13). No lo he tocado porque está fuera de
mi lista de ficheros.

Aviso útil para el orquestador: otro artesano de esta misma oleada está creando
`src/lib/diseno/usoDelAcento.ts` para @s15, cuya regla es que
`var(--color-acento)` **nunca** sea el valor de un `color:`. Esa puerta, cuando
corra sobre el corpus real, cazará exactamente esta línea. Conviene coordinarlos
para que la corrección se haga una sola vez.

### BLOQUEANTE 2 — `src/styles/_tokens.scss` (líneas 12, 36, 60, 84, 108, 132)

Cláusula 3 de @s8: *«su valor se deriva por mezcla del primario con el fondo de
cada variante, con la regla escrita en el propio fichero»*. **Es falsa hoy**, y
lo he medido recorriendo `mezclar(fondo, primario, p)` para `p` de 0 % a 100 %
con la función real `src/lib/diseno/mezclaDeColor.ts`:

| Variante | `--color-borde-control` | ¿Es mezcla de fondo y primario? |
| --- | --- | --- |
| clinica | `#5E6E88` | **no**, ninguna proporción lo produce (es el `--muted` del prototipo) |
| calida | `#8A6C45` | **no** (es el `--muted` del prototipo) |
| tech | `#94C5FF` | **no** (es el `rgb()` del `--border` del prototipo, `rgba(148,197,255,.18)`) |
| eco | `#557368` | **no** (es el `--muted` del prototipo) |
| marca | `#A06997` | **sí**: `mezclar('#FFFFFF', '#77286B', 0.7)` |

Además, `_tokens.scss` **no contiene ninguna regla escrita** de derivación para
este rol (leído entero; la cabecera que otro artesano acaba de añadir habla del
rojo de urgencia, no del borde de control).

**Qué haría falta**, y es decisión de contrato, no mía:
o bien (a) rederivar los cuatro valores de `clinica`, `calida`, `tech` y `eco`
como `mezclar(fondo, primario, p)` y escribir la regla y el porcentaje en el
comentario de cabecera de `_tokens.scss`, o bien (b) enmendar la cláusula del
`.feature` para que diga lo que el sistema hace de verdad (importar el `--muted`
/ el `--border` opaco del prototipo, salvo en `marca`, que sí es una mezcla).
No he tocado `_tokens.scss`: es de otro artesano de esta oleada.

Ojo: la parte **medible y verificable** de @s8 sí está cubierta —el rol existe en
las cinco y su ratio alcanza 3 en las cinco, medido— y la primera mitad de esta
tercera cláusula («el prototipo no modela este rol») también, con el inventario
de 18 nombres. Lo que falta es solo la afirmación sobre el mecanismo de
derivación.

### Observación (no bloqueante) — el `--color-urgencia-suave` de `marca` cambió bajo mis pies

Mientras trabajaba, otro artesano cambió `src/styles/_tokens.scss:154` de
`#FDE9E9` a `#FCE9E9` (la mezcla real). Mi fila de matriz `urgencia` sobre
`urgencia-suave` sigue aprobando: 4.13 con el valor nuevo, por encima del mínimo
de 3. No hace falta nada.

---

## 6. Estado

- **Cerrados por completo**: @s6, @s9, @s11.
- **Cerrado salvo una cláusula bloqueada**: @s7 (falta el arreglo de
  `BarraUrgencias.module.scss:19`, BLOQUEANTE 1) y @s8 (falta la derivación
  escrita del borde de control, BLOQUEANTE 2).
- Suite de mis ficheros: 18/18 verde. Lint 0. Typecheck 0.
- No he ejecutado `build`, `playwright`, `preview` ni `stryker`, según lo pactado.

---

## 7. Ciclo adicional — reparación del rojo dejado por otra oleada (`ejecutarPuertaDeReconciliacionDeMatriz`, @s11)

Un artesano posterior editó `matrizDeContraste.test.ts` y añadió un test nuevo
al final del fichero (`@s11 la matriz se reconcilia con el TEXTO REAL de las
hojas de estilo`) que exige `ejecutarPuertaDeReconciliacionDeMatriz` y el tipo
`FicheroDeTexto`, ninguno de los dos disponible en el módulo de producción ni
importado en el test. Se retoma el ciclo, en el mismo ámbito cerrado
(`matrizDeContraste.ts` + `matrizDeContraste.test.ts`).

### 7.0 Verificación del contrato

`features/rediseno_visual.feature:272-279` (@s11) sigue siendo el escenario
correcto: su `Given` dice *«la matriz de pares (rol, fondo, uso) que el
sistema efectivamente pinta»* — la reconciliación contra el texto real de las
hojas de estilo es exactamente la comprobación de que esa matriz, escrita a
mano en `MATRIZ_DE_USO_DEL_SISTEMA`, no se ha quedado corta frente a lo que el
código pinta de verdad. No se ha inventado comportamiento fuera del contrato:
es la misma cláusula, reforzada con una segunda puerta.

### 7.1 ROJO real (visto antes de tocar producción)

```
> pnpm exec vitest run src/lib/diseno/matrizDeContraste.test.ts

FAIL src/lib/diseno/matrizDeContraste.test.ts > @s11 la matriz se reconcilia con el TEXTO REAL de las hojas de estilo > señala la pareja que un fichero de estilos pinta de verdad y la matriz no declara
ReferenceError: ejecutarPuertaDeReconciliacionDeMatriz is not defined
 ❯ src/lib/diseno/matrizDeContraste.test.ts:397:21
```

Causa raíz doble, confirmada leyendo el test completo:
1. El bloque de import de `./matrizDeContraste` (líneas 13-25) no incluía
   `ejecutarPuertaDeReconciliacionDeMatriz` → `ReferenceError` en tiempo de
   ejecución (Vitest/esbuild no comprueba tipos, así que el `FicheroDeTexto[]`
   sin importar de la línea 381 no rompía en rojo por sí solo, solo en
   `typecheck`).
2. `FicheroDeTexto` no se importaba en absoluto. El patrón ya establecido en
   este mismo directorio (`usoDelAcento.test.ts:2`, `rolesDescartados.test.ts:7`)
   es `import type { FicheroDeTexto } from './rolesDescartados'` — el tipo ya
   existe ahí, así que no se duplica.

### 7.2 VERDE — ciclo único

- Se corrigió el import del test: se añadió `ejecutarPuertaDeReconciliacionDeMatriz`
  al bloque de `./matrizDeContraste` y `import type { FicheroDeTexto } from
  './rolesDescartados'` (fichero de otro artesano, solo lectura, sin tocarlo).
- Tras el arreglo del import, el ROJO cambió de forma (visto y confirmado):
  `TypeError: ejecutarPuertaDeReconciliacionDeMatriz is not a function` — la
  prueba de que el primer rojo era de verdad un import roto y no solo un
  efecto de un mock.
- Producción mínima en `matrizDeContraste.ts`:
  - `EntradaSinRepresentarEnMatriz` e `InformeDeReconciliacionDeMatriz` (tipos).
  - `representaLaMatriz`: ¿existe (tinta, fondo) en la matriz dada?
  - `paresSinRepresentarDeFichero`: recorre el texto línea a línea con una
    pila de "fondo vigente", igual mecanismo de anidación por llaves que
    `tokensColor.ts:123-152` ya usa para los bloques de variante. El `fondo`
    vigente es el `background-color: var(--color-<rol>)` más cercano y se
    HEREDA en los bloques anidados que no declaran uno propio (así el `span`
    de `BarraUrgencias.module.scss` hereda `urgencia` de `.barra`). Cada
    `color: var(--color-<rol>)` se contrasta contra `matriz`; si no está
    representado, se señala con fichero y línea (1-indexada).
  - `ejecutarPuertaDeReconciliacionDeMatriz`: `flatMap` de todos los ficheros,
    `pasa` = cero pares sin representar.
- Los dos patrones (`PATRON_DECLARACION_DE_FONDO`, `PATRON_DECLARACION_DE_TINTA`)
  van anclados con `^` tras recortar espacios: sin el ancla, la propia línea
  `background-color: var(--color-urgencia);` casaría también como declaración
  de TINTA (contiene el substring `color: var(--color-urgencia)`), y generaría
  un falso positivo. Verificado por sabotaje (ver 7.3, SABOTAJE L).

```
> pnpm exec vitest run src/lib/diseno/matrizDeContraste.test.ts

 Test Files  1 passed (1)
      Tests  19 passed (19)
```

### 7.3 Sabotaje real de cada aserción nueva

Backup restaurado con `cp` tras cada sabotaje; `git status --porcelain` de los
dos ficheros de mi ámbito confirmado limpio al final (siguen `??`, sin diff
frente al estado dejado en este ciclo).

**SABOTAJE I** — `representaLaMatriz` devuelve `true` siempre (nunca hay par
sin representar):

```
FAIL … > señala la pareja que un fichero de estilos pinta de verdad y la matriz no declara
AssertionError: expected [] to deeply equal [ { tinta: 'acento', …(3) } ]
```
Muerde `informe.paresSinRepresentar`.

**SABOTAJE J** — `numeroDeLinea` calculado con un `PRIMERA_LINEA` de más
(desplazamiento de una línea):

```
AssertionError: expected [ { tinta: 'acento', …(3) } ] to deeply equal [ { tinta: 'acento', …(3) } ]
-     "linea": 6,
+     "linea": 7,
```
Muerde específicamente el campo `linea`, no solo la presencia del par.

**SABOTAJE K** — `pasa` invertido (`!==` en vez de `===` contra
`NINGUN_PAR_SIN_REPRESENTAR`):

```
AssertionError: expected true to be false // Object.is equality
```
Muerde `informe.pasa` de forma independiente del array: la aserción del
booleano no es redundante con la del array.

**SABOTAJE L** — se quita el ancla `^` de `PATRON_DECLARACION_DE_TINTA`:

```
AssertionError: expected [ { tinta: 'urgencia', …(3) }, …(1) ] to deeply equal [ { tinta: 'acento', …(3) } ]
+     "linea": 2,
+     "ruta": "src/components/BarraUrgencias.module.scss",
+     "tinta": "urgencia",
```
Confirma que sin el ancla, `background-color: var(--color-urgencia);` cuela
como si fuera una declaración de `color:` — la defensa documentada en el
comentario de producción (`matrizDeContraste.ts:403-405`) muerde de verdad.

Los cuatro sabotajes se hicieron sobre `matrizDeContraste.ts` (mi propio
ámbito) y se restauraron desde la copia de respaldo; tras cada restauración la
suite volvió a `19 passed (19)`.

### 7.4 Verificación

```
> pnpm exec vitest run src/lib/diseno/matrizDeContraste.test.ts
 Test Files  1 passed (1)
      Tests  19 passed (19)

> pnpm exec oxlint --deny-warnings src/lib/diseno/matrizDeContraste.ts src/lib/diseno/matrizDeContraste.test.ts
OXLINT_EXIT=0

> pnpm run typecheck
TYPECHECK_EXIT=0

> pnpm run lint
LINT_EXIT=0
```

### 7.5 Mapa cláusula → aserción (añadido)

| Cláusula | Aserción |
| --- | --- |
| `Given la matriz de pares (rol, fondo, uso) que el sistema efectivamente pinta` (reforzado: la matriz no puede quedarse corta frente al texto real) | `matrizDeContraste.test.ts:397-410`: `ejecutarPuertaDeReconciliacionDeMatriz` sobre un fichero real de `BarraUrgencias.module.scss` señala el único par (`acento`, `urgencia`) que la matriz no cubre, con fichero y línea exactos, y `informe.pasa === false` |

### 7.6 Estado del ciclo adicional

- Test ya escrito por otra oleada, RED real visto y documentado (7.1).
- Import del test reparado (`FicheroDeTexto` desde `./rolesDescartados`,
  `ejecutarPuertaDeReconciliacionDeMatriz` desde `./matrizDeContraste`).
- Producción mínima añadida y sabotajes reales (I, J, K, L) confirmando que
  cada aserción nueva muerde.
- Suite del fichero: 19/19 verde. `pnpm run lint` 0. `pnpm run typecheck` 0.
- Ámbito respetado: solo `matrizDeContraste.ts` y `matrizDeContraste.test.ts`
  tocados; `rolesDescartados.ts` solo se lee (import), no se edita.

---

## 8. Ciclo adicional — Enmienda 3 sobre @s8, cláusula 3 (28/08/2026)

Contexto: la Enmienda 3, aprobada por el humano, sustituyó la afirmación
genérica falsa de BLOQUEANTE 2 («se deriva por mezcla del primario con el
fondo de cada variante») por CUATRO afirmaciones concretas
(`features/rediseno_visual.feature:282-284`):

1. `clinica`, `calida` y `eco` **importan** el `--muted` del tema de su propia
   variante del prototipo: `#5E6E88`, `#8A6C45`, `#557368`.
2. `tech` **importa** el `rgb()` expandido de su `--border` translúcido:
   `rgba(148,197,255,.18)` → `#94C5FF`.
3. `marca` (sin tema propio en el prototipo) es la ÚNICA que **deriva** por
   mezcla: `mezclar('#FFFFFF', '#77286B', 0.7)` = `#A06997`.

Ninguna de las tres estaba mordida. Se retoma el ciclo en el mismo ámbito
cerrado (`matrizDeContraste.ts` + `matrizDeContraste.test.ts`), sin tocar
`_tokens.scss`, el prototipo ni los tres ficheros de referencia
(`tokensColor.ts`, `mezclaDeColor.ts`, `fidelidadPrototipo.ts`).

### 8.0 Medición previa (antes de escribir ningún test)

Confrontado carácter a carácter contra el texto real:

| Variante | Prototipo (VLS) | Sistema (`_tokens.scss`) | Coincide |
| --- | --- | --- | --- |
| `clinica` | `--muted:#5E6E88` (bloque `:root` base, VLS:18-25, **sin** `[data-tema]`) | `--color-borde-control:#5E6E88` (`:55` y `:79`) | sí |
| `calida` | `--muted:#8A6C45` (VLS:26-33) | `--color-borde-control:#8A6C45` (`:103`) | sí |
| `eco` | `--muted:#557368` (VLS:42-49) | `--color-borde-control:#557368` (`:151`) | sí |
| `tech` | `--border:rgba(148,197,255,.18)` (VLS:34-41) → rgb expandido `#94C5FF` | `--color-borde-control:#94C5FF` (`:127`) | sí |
| `marca` | (no tiene tema en el prototipo) | `--color-borde-control:#A06997` (`:175`); `--color-fondo:#FFFFFF` (`:170`), `--color-primario:#77286B` (`:179`) | `mezclar('#FFFFFF','#77286B',0.7)` = `#A06997` (recalculado con `src/lib/diseno/mezclaDeColor.ts`) |

Hallazgo aparte (documentado, no bloqueante para los tests que sí escribí):
`src/styles/_tokens.scss` cabecera (líneas 1-47) escribe por extenso la regla
de derivación de `--color-borde` (las cuatro variantes importadas, composición
con alfa) y la de `--color-urgencia-suave` de `marca`, pero **no** contiene
ningún comentario que escriba la regla `mezclar('#FFFFFF', '#77286B', 0.7)`
para `--color-borde-control` de `marca` — leído el fichero entero
(190 líneas) y confirmado por `grep` de `77286B`/`0.7`/`A06997`/`borde-control`.
La cláusula del contrato dice «con la regla escrita por extenso en
`src/styles/_tokens.scss`»: el VALOR y la FÓRMULA son ciertos y están
recalculados por el test nuevo desde el texto real (ver 8.2, tercer ciclo),
pero el COMENTARIO que la describa en el propio fichero, si se lee
literalmente la cláusula, todavía no existe. No lo he escrito: `_tokens.scss`
está fuera de mi ámbito («NO toques `_tokens.scss`»). Lo dejo anotado para el
`craftsman_lead`; no es un bloqueante de mis tests porque lo que ellos miden
—el valor y la fórmula— es verdad medida, no supuesta.

### 8.1 Ciclo 1 — cláusula 1: `clinica`, `calida` y `eco` importan el `--muted`

**ROJO** (`leerRolDeTemaDelPrototipo(TEXTO_PROTOTIPO, 'clinica', 'muted')`):

```
Error: no se encontró ningún bloque ":root[data-tema='clinica']" en el texto del prototipo
 ❯ extraerBloqueDeTemaDelPrototipo src/lib/diseno/matrizDeContraste.ts:54:11
 ❯ leerRolDeTemaDelPrototipo src/lib/diseno/matrizDeContraste.ts:73:18
```

Causa: `clinica` es `VARIANTE_PREDETERMINADA` y su tema en el prototipo es el
bloque `:root` BASE, sin atributo `[data-tema]` (el mismo hecho que
`fidelidadPrototipo.ts:106-111` ya modela con `selectorDelTemaDelPrototipo`).
`patronDeEncabezadoDeTema` solo sabía construir el patrón con atributo.

**VERDE**: import de `VARIANTE_PREDETERMINADA` desde `./contratoRedisenho`
(lectura, no edición) y una rama en `patronDeEncabezadoDeTema` que, para la
variante por defecto, busca `:root` con anticipación negativa `(?!\[)` — así
no casa dentro de `:root[data-tema='calida']`, que también empieza por
`:root`.

### 8.2 Ciclo 2 — cláusula 2: `tech` importa el `rgb()` expandido de su `--border`

**ROJO**:

```
TypeError: leerRgbExpandidoDeRolDelPrototipo is not a function
 ❯ src/lib/diseno/matrizDeContraste.test.ts:250:12
```

**VERDE**: `leerRgbExpandidoDeRolDelPrototipo`, que localiza `--border:
rgba(r,g,b,a)` dentro del bloque del tema y expande SOLO los tres canales
`r,g,b` a hexadecimal — sin componer el alfa sobre el fondo, que es lo que
hace `--color-borde` (rol distinto, ya cubierto por Enmienda 1 en
`fidelidadPrototipo.ts`).

### 8.3 Ciclo 3 — cláusula 3: `marca` deriva por mezcla

**ROJO**:

```
TypeError: derivarBordeControlDeMarca is not a function
 ❯ src/lib/diseno/matrizDeContraste.test.ts:261:22
```

**VERDE**: `derivarBordeControlDeMarca(textoScss)`, que lee `--color-fondo` y
`--color-primario` del bloque PROPIO de `marca` (vía `leerTokenDeVariante`,
ya existente) y aplica `mezclar(fondo, primario, 0.7)` (`mezclaDeColor.ts`,
ya existente). El 70 % es una constante nombrada
(`PORCENTAJE_DE_MEZCLA_DEL_BORDE_DE_CONTROL_DE_MARCA`), no un número mágico.

### REFACTOR

Ninguno necesario más allá de nombrar constantes (`CANAL_ROJO_RGBA`,
`BASE_HEXADECIMAL`, `DOS_DIGITOS_HEX`, `CERO_DE_RELLENO`,
`PORCENTAJE_DE_MEZCLA_DEL_BORDE_DE_CONTROL_DE_MARCA`): cada función quedó
corta (≤ 10 líneas) a la primera, sin duplicación nueva dentro del fichero.

### 8.4 Sabotaje real de cada aserción nueva

Los tres se hicieron sobre `matrizDeContraste.ts` (mi propio ámbito),
editando y restaurando el mismo texto exacto; verificado con
`git status --porcelain` limpio (sigue `??`, sin diff frente al estado
dejado) tras cada restauración.

**SABOTAJE M** — la rama de la variante por defecto deja de activarse
(`tema === VARIANTE_PREDETERMINADA` → `tema === 'SABOTAJE_M_NUNCA_COINCIDE'`):

```
FAIL … > "clinica", "calida" y "eco" importan el "--muted" …
Error: no se encontró ningún bloque ":root[data-tema='clinica']" en el texto del prototipo
Tests  1 failed | 21 passed (22)
```

**SABOTAJE N** — el canal rojo lee el índice del canal verde
(`CANAL_ROJO_RGBA = 1` → `2`):

```
FAIL … > "tech" importa el "rgb()" expandido …
AssertionError: expected '#C5C5FF' to be '#94C5FF' // Object.is equality
Tests  1 failed | 21 passed (22)
```

**SABOTAJE O** — el porcentaje de mezcla de `marca` cambia de 0.7 a 0.5:

```
FAIL … > "marca", que no tiene tema propio … es la ÚNICA variante que deriva …
AssertionError: expected '#BB94B5' to be '#A06997' // Object.is equality
Tests  1 failed | 21 passed (22)
```

Tras cada sabotaje se restauró el texto exacto y la suite volvió a
`22 passed (22)`.

### 8.5 Mapa cláusula → aserción (añadido)

| Cláusula (`rediseno_visual.feature:282-284`) | Aserción |
| --- | --- |
| `"clinica", "calida" y "eco" importan el valor que ya trae el "--muted" del tema de su propia variante… "#5E6E88", "#8A6C45" y "#557368"` | `matrizDeContraste.test.ts` describe `@s8 Enmienda 3`, primer `it`: literales `#5E6E88`/`#8A6C45`/`#557368` confrontados con `leerRolDeTemaDelPrototipo` sobre el texto real del prototipo, y ese mismo valor confrontado con `leerTokenDeVariante(TEXTO_TOKENS, variante, 'borde-control')` sobre el texto real de `_tokens.scss` |
| `"tech" importa el mismo rol de otra fuente… "rgb()" del "--border" translúcido…, "rgba(148,197,255,.18)", que da "#94C5FF"` | segundo `it`: literal `#94C5FF` confrontado con `leerRgbExpandidoDeRolDelPrototipo(TEXTO_PROTOTIPO, 'tech', 'border')` y con `leerTokenDeVariante(TEXTO_TOKENS, 'tech', 'borde-control')` |
| `"marca"… es la ÚNICA variante donde el valor SÍ se deriva por mezcla del primario con el fondo, "mezclar('#FFFFFF', '#77286B', 0.7)" = "#A06997"` | tercer `it`: literal `#A06997` confrontado con `derivarBordeControlDeMarca(TEXTO_TOKENS)` (que lee `--color-fondo`/`--color-primario` reales de `marca` y aplica `mezclar()` real), con `mezclar('#FFFFFF', '#77286B', 0.7)` llamado directamente en el test, y con `leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'borde-control')` |
| `"…con la regla escrita por extenso en 'src/styles/_tokens.scss'"` | NO mordida como afirmación textual (¿existe el comentario?): ver 8.0, hallazgo aparte. El VALOR y la FÓRMULA que esa regla produciría sí están mordidos por el tercer `it` |

### 8.6 Verificación

```
> pnpm exec vitest run src/lib/diseno/matrizDeContraste.test.ts
 Test Files  1 passed (1)
      Tests  22 passed (22)

> pnpm exec oxlint --deny-warnings src/lib/diseno/matrizDeContraste.ts src/lib/diseno/matrizDeContraste.test.ts
OXLINT_EXIT=0

> pnpm run typecheck
TYPECHECK_EXIT=0
```

### 8.7 Estado del ciclo adicional

- Las tres afirmaciones nuevas de @s8 cláusula 3 quedan mordidas con doble
  anclaje (literal a mano + lectura real de ambos ficheros).
- `_tokens.scss`, el prototipo y los tres ficheros de referencia
  (`tokensColor.ts`, `mezclaDeColor.ts`, `fidelidadPrototipo.ts`) — no
  tocados, solo leídos/importados.
- Hallazgo no bloqueante documentado en 8.0: el comentario que «escriba por
  extenso» la regla de `marca` en `_tokens.scss` no existe todavía; el valor
  y la fórmula que describiría sí están verificados contra texto real.
- Suite del fichero: 22/22 verde. Oxlint acotado: 0. Typecheck global: 0.

---

## 9. Ciclo adicional — cierre del hallazgo 8.0: el comentario que falta en `_tokens.scss` (28/08/2026)

Contexto: el hallazgo no bloqueante de 8.0 quedaba pendiente porque
`_tokens.scss` estaba fuera de mi ámbito en aquel ciclo. Esta vez el ámbito
se amplía explícitamente a `src/styles/_tokens.scss` (solo un comentario
junto a la línea 175, ningún hexadecimal) además de mis dos ficheros
habituales, para cerrar la cuarta cláusula de @s8 (Enmienda 3,
`features/rediseno_visual.feature:284`): «…con la regla escrita por extenso
en "src/styles/_tokens.scss"».

### 9.1 ROJO real

Test nuevo en el mismo `describe('@s8 Enmienda 3…')`, llamando a una función
que aún no existía:

```
FAIL src/lib/diseno/matrizDeContraste.test.ts > @s8 Enmienda 3: la tercera cláusula nombra el mecanismo real de cada variante > "_tokens.scss" escribe por extenso, junto a la declaración de "marca", la regla de mezcla que produce su borde de control
TypeError: leerComentarioDelBordeDeControlDeMarca is not a function
 ❯ src/lib/diseno/matrizDeContraste.test.ts:285:24
```

### 9.2 VERDE — dos pasos

1. **Producción mínima que hace el test EJECUTABLE** (`matrizDeContraste.ts`):
   `leerComentarioDelBordeDeControlDeMarca`, que busca en el TEXTO REAL de
   `_tokens.scss` uno o más renglones `//` pegados INMEDIATAMENTE ENCIMA
   (sin línea en blanco entre medias) de la declaración exacta
   `--color-borde-control: #A06997;` — el mismo hexadecimal que ya deriva
   `derivarBordeControlDeMarca`, usado como ancla porque es único en el
   fichero (ninguna otra variante comparte ese valor). Tras este paso el test
   seguía en rojo, con un mensaje distinto, la prueba de que el primer rojo
   no era un efecto secundario de un mock:

   ```
   AssertionError: expected undefined to be defined
    ❯ src/lib/diseno/matrizDeContraste.test.ts:286:24
   ```

2. **El comentario en `_tokens.scss`**, insertado ÚNICAMENTE entre
   `--color-borde: #DDC9DA;` y `--color-borde-control: #A06997;` del bloque
   `[data-variante='marca']` (línea 175 de entonces), con el mismo tono y
   rigor del comentario ya existente sobre el rojo de urgencia
   (`_tokens.scss:5-18`): cita la cláusula del contrato, el porqué (`marca`
   no tiene tema en el prototipo), la fórmula literal
   `mezclar('#FFFFFF', '#77286B', 0.7) = #A06997` y la fuente
   (`mezclaDeColor.ts`). Ningún hexadecimal se tocó.

```
> pnpm exec vitest run src/lib/diseno/matrizDeContraste.test.ts
 Test Files  1 passed (1)
      Tests  23 passed (23)
```

### 9.3 Sabotaje real

Se quitó el bloque de 14 líneas de comentario de `_tokens.scss` (dejando
`--color-borde: #DDC9DA;` seguido directamente de
`--color-borde-control: #A06997;`, tal y como estaba antes de este ciclo):

```
FAIL … > "_tokens.scss" escribe por extenso, junto a la declaración de "marca" …
AssertionError: expected undefined to be defined
 ❯ src/lib/diseno/matrizDeContraste.test.ts:286:24
Tests  1 failed | 22 passed (23)
```

Restaurado desde copia de respaldo tomada justo tras el paso 9.2; la suite
volvió a `23 passed (23)`.

### 9.4 Verificación

```
> pnpm exec vitest run src/lib/diseno/matrizDeContraste.test.ts
 Test Files  1 passed (1)
      Tests  23 passed (23)

> pnpm run lint
LINT_EXIT=0

> pnpm run typecheck
TYPECHECK_EXIT=0
```

`git diff -- src/styles/_tokens.scss` contra `HEAD` mezcla mi cambio con
trabajo previo sin commitear de otros artesanos de esta misma oleada
(recalibración de `--color-borde` por la Enmienda 1 y de
`--color-urgencia-suave` por @s5, ya presentes en el árbol antes de empezar
este ciclo). Aislando mi propio delta —comparado contra el estado exacto del
fichero al inicio de este ciclo, leído íntegro antes de tocar nada—, el único
cambio es la inserción de las 14 líneas de comentario entre
`--color-borde: #DDC9DA;` y `--color-borde-control: #A06997;` del bloque
`marca`: ningún hexadecimal, de `marca` o de cualquier otra variante, se
tocó en este ciclo.

### 9.5 Mapa cláusula → aserción (añadido)

| Cláusula (`rediseno_visual.feature:284`, fracción final) | Aserción |
| --- | --- |
| `"…con la regla escrita por extenso en 'src/styles/_tokens.scss'"` | `matrizDeContraste.test.ts` describe `@s8 Enmienda 3`, cuarto `it`: `leerComentarioDelBordeDeControlDeMarca(TEXTO_TOKENS)` está definido y contiene literalmente `"mezclar('#FFFFFF', '#77286B', 0.7)"`, leído del TEXTO REAL de `_tokens.scss`, no supuesto |

### 9.6 Estado del ciclo adicional

- La cuarta cláusula de @s8 (Enmienda 3) queda mordida por completo: las tres
  primeras (valor y fórmula de cada variante) ya lo estaban desde la
  sección 8; esta cuarta (el comentario "por extenso" en el propio fichero)
  se cierra aquí.
- Ámbito respetado: `matrizDeContraste.ts`, `matrizDeContraste.test.ts` y,
  esta vez con permiso explícito, un comentario en `src/styles/_tokens.scss`
  — sin tocar ningún hexadecimal.
- Suite del fichero: 23/23 verde. Lint global 0. Typecheck global 0.
- Sin bloqueantes nuevos. El hallazgo 8.0 queda cerrado.

**Corrección de regresión (28/08/2026)**: el comentario de la línea 35 de
`matrizDeContraste.ts` citaba el nombre del prototipo suelto
(`` `Veterinaria La Sierra.dc.html:18` ``, sin el prefijo de ruta), lo que
hacía fallar @s49 (`datosDelSitio.test.ts`, "ni un solo literal de la clínica
ficticia del prototipo sobrevive en el sitio"). Corregido a la ruta completa
`` `docs/diseno-claude-design/Veterinaria La Sierra.dc.html:18` `` — igual
que ya hacía la línea 46 del mismo fichero. Cambio de texto de comentario
únicamente, sin tocar código ejecutable. Verificado: `datosDelSitio.test.ts`
32/32, `matrizDeContraste.test.ts` 23/23 (sin cambio de comportamiento),
`pnpm run lint` 0, `pnpm run typecheck` 0, suite completa 88/88 ficheros y
1149/1149 tests en verde.
