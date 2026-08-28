# TDD — lote «sistema-de-color» de `rediseno_visual` (id 24)

Escenarios asignados: **@s1, @s4, @s5, @s10, @s12** de `features/rediseno_visual.feature`.
Fecha: 26/08/2026. Ámbito de ficheros cerrado (había otros artesanos trabajando
en el mismo árbol a la vez).

---

## 0. Resumen

| Escenario | Estado antes (matriz) | Estado ahora | Defecto de producto encontrado |
| --- | --- | --- | --- |
| @s1  | PARCIAL | CERRADO | Sí: las dos declaraciones del inventario divergían en el ORDEN |
| @s4  | PARCIAL (5 de 15 roles) | CERRADO (15 de 15) | No |
| @s5  | PARCIAL (1 de 4 cláusulas) | CERRADO | **Sí: `--color-urgencia-suave` de `marca` estaba copiado, no derivado** |
| @s10 | PARCIAL (2 cláusulas sin morder) | CERRADO | **Sí: el guion anti-parpadeo reescribía a mano el catálogo** |
| @s12 | PARCIAL (3 de 20 tokens) | CERRADO (20 de 20) | No |

Ficheros de producción tocados: `src/styles/_tokens.scss`, `index.html`,
`src/lib/diseno/tokensColor.ts`, `src/lib/diseno/contratoRedisenho.ts`.
`src/lib/diseno/mezclaDeColor.ts` **no** se tocó: se auditó y la función es
correcta — el defecto estaba en el dato, no en el cálculo.

---

## 1. Ciclos rojo-verde-refactor

### Ciclo 1 — @s1: el literal escrito a mano de veinte nombres

**ROJO.** Escribí en `contratoRedisenho.test.ts` el literal
`VEINTE_NOMBRES_DE_TOKEN_ESPERADOS` (a mano, en el orden en que los declara
`src/styles/_tokens.scss`) y lo confronté contra las **dos** declaraciones
independientes del inventario: `ROLES_DE_COLOR_REDISENO` +
`ROLES_DE_SOMBRA_REDISENO` (`contratoRedisenho.ts:1-22`) e
`INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR` (`tokensColor.ts:82`). Falló al
primer intento, y no por el literal:

```
AssertionError: expected [ '--color-fondo', …(19) ] to deeply equal [ '--color-fondo', …(19) ]
- Expected
+ Received
     "--color-superficie-elevada",
-    "--color-borde",
-    "--color-borde-control",
     "--color-tinta",
     ...
+    "--color-borde-control",
+    "--color-borde",
     "--color-foco",
 ❯ src/lib/diseno/contratoRedisenho.test.ts:105:59
```

Es un hallazgo real: **las dos declaraciones del mismo inventario enumeraban
los roles en orden distinto**. `contratoRedisenho.ts` seguía el orden de la
hoja de estilos; `tokensColor.ts` metía `borde`/`borde-control` diez
posiciones más abajo. Exactamente el terreno en el que la matriz decía que se
podía renombrar un token en los dos sitios y seguir en verde.

**VERDE.** Reordené `RolDeColor` y `ROLES_DE_COLOR` en `tokensColor.ts:26-71`
al orden que declara `_tokens.scss:20-40`, que es el que ya seguía
`contratoRedisenho.ts`. Un único orden canónico, el de la hoja que implementa
el sistema. Ningún consumidor depende del orden (`comprobarInventarioDeTokens`
recorre pares; el resto indexa por nombre).

**REFACTOR.** Corregí el comentario de cabecera de
`INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR`, que seguía diciendo «los 17 tokens
(15 roles de color + 2 de sombra)» cuando ya son 20 (18 + 2), y documenté en
`tokensColor.ts:14-25` por qué el orden importa.

Los diecisiete nombres del sistema anterior **no** los inventé: los copié uno a
uno del literal que enumera `features/identidad_visual.feature:148` (@s1 de
aquel contrato, ya `done`), y lo verifiqué además contra
`git show 93bdf72:src/lib/diseno/tokensColor.ts`.

### Ciclo 2 — @s4: los quince hexadecimales, y que ninguno se ha rederivado

Los quince valores «aprobados antes de este rediseño» los saqué del fichero
**anterior al rediseño**, no del actual:
`git show 93bdf72:src/styles/_tokens.scss`, líneas 59-79. Coinciden con el
fichero de hoy los quince.

Tres tests nuevos:

1. Los **quince** roles leídos del texto real contra el literal a mano, con
   contador `rolesComprobados === 15`.
2. Los **ocho** roles derivados confrontados contra `mezclar(base, otro, %)`
   **ejecutado de verdad** — la tabla de derivaciones sale de los comentarios
   del propio fichero antes del rediseño (`93bdf72:_tokens.scss:61-73`) y de
   `progress/plan_adaptacion_scss.md` §3. Esto es lo que muerde «ninguno se ha
   rederivado ni redondeado»: si alguien cambia el porcentaje, el color base o
   el redondeo, el hexadecimal deja de cuadrar.
3. Los **siete** roles no derivados, que deben seguir siendo blanco puro o uno
   de los tres colores de `src/lib/tokens.ts`, sin mezcla. Y una aserción de
   cierre: `8 + 7 === 15`, para que no quede ni un rol sin cubrir.

Los tres pasaron a la primera, porque el dato ya era correcto: lo que faltaba
era la puerta. Así que la puse a prueba con sabotaje (ver §3, S-1).

### Ciclo 3 — @s5: el defecto real del producto

**ROJO** genuino en tres de las cuatro cláusulas:

```
FAIL  @s5 el urgencia suave de marca es blanco mezclado con ESE rojo al diez por ciento, calculado con mezclar()
AssertionError: expected '#FDE9E9' to be '#FCE9E9' // Object.is equality
Expected: "#FCE9E9"
Received: "#FDE9E9"
 ❯ src/lib/diseno/tokensColor.test.ts:212:74

FAIL  @s5 el fichero declara por escrito que el rojo de urgencia es semántico y no un cuarto color de marca
AssertionError: expected '// Fuente de verdad de los veinte tok…' to contain 'color SEMÁNTICO de alerta'
```

**El defecto.** `_tokens.scss` declaraba `--color-urgencia-suave: #FDE9E9` en
la variante `marca`. `mezclar('#FFFFFF', '#DC2626', 0.10)` da `#FCE9E9`
(canal rojo `255·0.9 + 220·0.1 = 251.5 → 252 = FC`). El `#FDE9E9` es el
`--urg-soft` que el prototipo asigna a su tema `eco`
(`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, bloque
`[data-tema=eco]`): estaba **copiado en vez de derivado**.

**VERDE.** `src/styles/_tokens.scss:157`: `#FDE9E9` → `#FCE9E9`, **solo en el
bloque `marca`**. La línea 133 (`eco`) sigue en `#FDE9E9`, que es lo que exige
@s3 — verificado con `grep`: los únicos `FDE9E9`/`FCE9E9` del árbol están en
`eco` (importado del prototipo) y en `marca` (derivado).

También añadí la declaración escrita que pide la cuarta cláusula
(`_tokens.scss:5-18`): por qué el rojo de urgencia es un color semántico de
alerta y no un cuarto color de marca, con las tres fuentes citadas
(`src/lib/tokens.ts`, `docs/datos-galapavet.md` §10, la derivación con
`mezclaDeColor.ts`) y la nota de qué era el `#FDE9E9` anterior.

Las otras dos cláusulas quedan ancladas por los dos extremos, no por dos
literales: `--color-acento` se compara contra `coloresDeMarca.lima` importado
de `src/lib/tokens.ts`, y el rojo de urgencia de `marca` se compara contra el
que se **lee del fichero** para `clinica` y `eco`, con contador `=== 2`.

> Nota deliberada: `calida` (`#C2410C`) y `tech` (`#F87171`) quedan fuera de
> esa comparación porque traen su propio rojo del prototipo. Lo medí:
> `mezclar('#FFFFFF','#C2410C',0.1)` = `#F9ECE7` ≠ `#FDEBE0` declarado, y
> `mezclar('#FFFFFF','#F87171',0.1)` = `#FEF1F1` ≠ `#542A37`. Es decir, esas
> variantes **no** derivan su suave por mezcla, y hacerlas pasar por esta regla
> rompería @s3. Por eso la lista de variantes que comparten el rojo es
> explícita y está justificada en el propio test.

### Ciclo 4 — @s12: los veinte tokens del bloque de emergencia

**ROJO.** `TypeError: leerDeclaracionDeRaizSinAtributo is not a function`
(`tokensColor.test.ts:248`). El único lector del `:root` sin atributo que
existía (`leerTokenDeRaizSinAtributo`) solo admite hexadecimales de seis
dígitos, y dos de los veinte tokens son sombras (`0 6px 18px rgba(...)`).

**VERDE.** `tokensColor.ts:254-263`: `leerDeclaracionDeRaizSinAtributo`.

**REFACTOR.** Extraje `leerDeclaracionDelBloque` (`tokensColor.ts:177-183`),
que ahora comparten `leerDeclaracionDeVariante` y el lector nuevo; antes la
expresión regular y el lanzamiento estaban duplicados.

El test recorre los **veinte** tokens del inventario comparando `:root` con
`clinica`, con contador `tokensComparados === 20`. Y la segunda cláusula («no
cuenta como una sexta variante») se afirma sin vacuidad: el fichero tiene
**seis** bloques `:root` y aun así `extraerVariantesDeTokens` devuelve **cinco**
ids. Si el sexto bloque no existiera, la afirmación sería vacua y el contador
de bloques lo delataría.

### Ciclo 5 — @s10: una sola declaración, dos consumidores

**ROJO 1** (función pura ausente):
`TypeError: buscarDeclaracionesLiteralesDelIdentificador is not a function`.

**VERDE 1.** `contratoRedisenho.ts:28-96`:
`buscarDeclaracionesLiteralesDelIdentificador(fuentes, identificador)`. Busca
el identificador escrito como literal de cadena **entero** (con sus comillas:
`'/img/hero/clinica.webp'` contiene la palabra pero no declara el
identificador — `src/components/Hero.tsx:48` es exactamente ese caso).
Devuelve `ficherosInspeccionados`, `ficherosQueDeclaran` y `pasa`, y **falla
cerrada** con corpus vacío o identificador vacío. Sin expresiones regulares
construidas a partir de la entrada: compara con las tres comillas de
JavaScript/HTML.

**ROJO 2** (la puerta sobre el corpus real):

```
FAIL  de los TRES puntos que el escenario nombra, solo el catálogo de variantes escribe el identificador
AssertionError: expected [ …(2) ] to deeply equal [ Array(1) ]
  [
    "../lib/diseno/contratoRedisenho.ts",
+   "index.html",
  ]

FAIL  el guion anti-parpadeo consume esa declaración: lista exactamente las variantes NO predeterminadas
Error: el guion anti-parpadeo de "index.html" ya no declara "IDS_NO_PREDETERMINADOS"
```

**VERDE 2.** Reescribí el guion anti-parpadeo de `index.html:23-59`. Ya no
escribe el identificador de la variante por defecto: lista solo las variantes
que **no** son la predeterminada, y **no toca el atributo** cuando no hay
preferencia guardada válida. El documento se pinta entonces con el bloque
`:root` sin atributo de `_tokens.scss`, que @s12 acaba de anclar token a token
a los valores de `clinica`. Es decir: el guion consume la única declaración
por complemento, y el bloque de emergencia de @s12 es lo que hace que eso sea
seguro. Las dos piezas del contrato encajan.

Diferencias de comportamiento, medidas contra el guion anterior:

| Estado del almacenamiento | Antes | Ahora | Píxel resultante |
| --- | --- | --- | --- |
| vacío | `data-variante="clinica"` | sin atributo | idéntico (`:root` = `clinica`, @s12) |
| `"tech"` | `data-variante="tech"` | `data-variante="tech"` | idéntico |
| `"clinica"` | `data-variante="clinica"` | sin atributo | idéntico (`:root` = `clinica`, @s12) |
| basura | `data-variante="clinica"` | sin atributo | idéntico, y ya no se escribe basura |
| `localStorage` lanza | `data-variante="clinica"` | sin atributo | idéntico |

En los cinco casos, en cuanto React monta, `SelectorPaleta.tsx:22` fija el
atributo al valor de `resolverVarianteInicial`. Comprobé que ninguna prueba
depende del atributo antes de ese momento: jsdom no ejecuta los scripts en
línea de `index.html`, y los dos specs de navegador que leen `data-variante`
(`tests/e2e/rediseno-visual.spec.ts:80` y `tests/e2e/tokens-aplicados.spec.ts`)
lo hacen **después** de pulsar un botón del selector. También verifiqué con
`grep` que nada más en `src/`, `tests/` ni `tools/` referencia
`IDS_DEL_CATALOGO`, `VARIANTE_POR_DEFECTO` del guion ni
`aplicarVarianteAntesDelPintado`.

Y arreglé el comentario que la matriz señalaba como síntoma de que nadie
vigilaba esa copia: decía que un identificador corrupto «cae siempre a marca»
cuando el código ya caía a `clinica`.

---

## 2. Mapa cláusula → aserción

### @s1 — El inventario declara exactamente veinte roles

| Cláusula | Aserción |
| --- | --- |
| Given: literal a mano con los 20 nombres | `contratoRedisenho.test.ts:20-41` (+ guarda `:98-99`) |
| When: se compara el inventario con ese literal | `contratoRedisenho.test.ts:106` y `:107` (las **dos** declaraciones) |
| Then el inventario tiene exactamente 20 entradas | `contratoRedisenho.test.ts:111`; `tokensColor.test.ts:125` |
| And 18 de color y 2 de sombra | `contratoRedisenho.test.ts:112-117`; `tokensColor.test.ts:126-127` |
| And las tres entradas nuevas son acento/urgencia/urgencia-suave | `contratoRedisenho.test.ts:125-126` (diferencia real contra el sistema anterior, no un `arrayContaining`) |
| And los diecisiete que ya existían siguen presentes, ninguno renombrado | `contratoRedisenho.test.ts:130`, `:136`, `:137` |

### @s4 — La variante de marca conserva los quince hexadecimales

| Cláusula | Aserción |
| --- | --- |
| Given: los quince valores que `identidad_visual` dejó aprobados | `tokensColor.test.ts:52-77` (literal a mano de `93bdf72:_tokens.scss:59-79`) |
| Then cada uno vale exactamente lo que valía antes | `tokensColor.test.ts:150`, `:154`, `:160` (contador = 15) |
| And ninguno se ha rederivado ni redondeado | `tokensColor.test.ts:164`, `:168` (`mezclar()` ejecutado), `:172`; y `:176`, `:180`, `:184`, `:187` (los 7 no derivados + cierre 8+7=15) |

### @s5 — Los tres roles nuevos derivan de fuentes declaradas

| Cláusula | Aserción |
| --- | --- |
| Then `--color-acento` es el lima que declara `src/lib/tokens.ts` | `tokensColor.test.ts:201` (contra `coloresDeMarca.lima` importado) |
| And `--color-urgencia` es el mismo rojo que `clinica` y `eco` | `tokensColor.test.ts:209`, `:213` (contador = 2) |
| And `--color-urgencia-suave` es blanco + ese rojo al 10 %, con la función de mezcla del repositorio | `tokensColor.test.ts:219-221` (`mezclar()` ejecutado sobre el rojo **leído del fichero**); ancla adicional `:195` |
| And el fichero lo declara por escrito | `tokensColor.test.ts:225`, `:226` ← `_tokens.scss:5-18` |

### @s10 — La variante por defecto está escrita en un único sitio

| Cláusula | Aserción |
| --- | --- |
| Then la variante por defecto es `clinica` | `contratoRedisenho.test.ts:141`; `SelectorPaleta-logica.test.ts:234` (`resolverVarianteInicial(null, …)`) |
| And el identificador aparece declarado una sola vez | `SelectorPaleta-logica.test.ts:211-213` (3 puntos, 1 declara) y `:219-228` (barrido de los 80 ficheros ejecutables + `index.html`) |
| And los otros dos puntos lo consumen de esa única declaración | lógica del selector: `SelectorPaleta-logica.test.ts:232-233`; guion anti-parpadeo: `:241-243` (su literal, extraído del texto real de `index.html`, tiene que ser `VARIANTES_REDISENO` menos la predeterminada) |
| (fallo cerrado de la puerta) | `contratoRedisenho.test.ts:178-184` |

### @s12 — El bloque de emergencia sin JavaScript

| Cláusula | Aserción |
| --- | --- |
| Then declara los mismos valores que `clinica` | `tokensColor.test.ts:248-250`, contador `:254` (**20 de 20**, sombras incluidas); se conserva `:237-240` |
| And no cuenta como una sexta variante | `tokensColor.test.ts:261` (6 bloques `:root`), `:264`, `:265` (5 variantes) |

---

## 3. Sabotajes (toda puerta que no se ha visto fallar no está verificada)

**S-1 · @s4 — el agujero de los diez roles sin aserción.**
`_tokens.scss:146` (`--color-borde-control` de `marca`) `#A06997` → `#A06998`:

```
× @s4 los QUINCE roles de color de marca valen exactamente lo que valían antes de este rediseño
  AssertionError: expected '#A06998' to be '#A06997'
× @s4 ninguno de los quince se ha rederivado ni redondeado: los ocho derivados siguen dando la misma mezcla
  AssertionError: expected '#A06998' to be '#A06997'
```

El `#A06997` esperado del segundo no es un literal: es lo que devuelve
`mezclar('#FFFFFF', '#77286B', 0.7)`. **Restaurado.**

**S-2 · @s1 — renombrar un token en los DOS ficheros a la vez** (el escenario
que la matriz describía como indetectable). `--color-borde` → `--color-linea`
en `contratoRedisenho.ts` y en `tokensColor.ts` simultáneamente:

```
× @s1 confronta el literal escrito a mano de veinte nombres con las DOS listas que el proyecto declara
    "--color-superficie-elevada",
-   "--color-borde",
+   "--color-linea",
× @s1 las tres entradas nuevas respecto del sistema anterior son el acento y los dos roles de urgencia
× @s1 los diecisiete nombres que ya existían siguen presentes, ninguno renombrado
```

**Restaurado.**

**S-3 · @s5 — el rojo compartido.** `_tokens.scss:60` (`clinica`) `#DC2626` →
`#DC2627`:

```
× @s5 el rojo de urgencia de marca es el mismo que declaran las variantes "clinica" y "eco"
  AssertionError: expected '#DC2627' to be '#DC2626'
```

**Restaurado.**

**S-4 · @s5 — el acento contra la fuente de marca.** `_tokens.scss:153`
`#B4C718` → `#B5C718`:

```
× @s5 el acento de marca es el MISMO hexadecimal del lima que declara "src/lib/tokens.ts"
  AssertionError: expected '#B5C718' to be '#B4C718'
```

**Restaurado.**

**S-5 · @s5 — la declaración escrita.** Cambié en `_tokens.scss` «es un color
SEMÁNTICO de alerta» por «es un color de alerta»:

```
× @s5 el fichero declara por escrito que el rojo de urgencia es semántico y no un cuarto color de marca
  AssertionError: expected '// Fuente de verdad de los veinte tok…' to contain 'color SEMÁNTICO de alerta'
```

**Restaurado.**

**S-6 · @s12 — desincronizar el bloque de emergencia.** Dos sabotajes, uno de
color y otro de sombra, para probar que la puerta cubre los veinte y no solo
los dieciocho de color. `:root` `--color-acento` `#10B981` → `#10B982`:

```
× @s12 el ":root" sin atributo declara los VEINTE tokens con los mismos valores que "clinica"
  AssertionError: expected '#10B982' to be '#10B981'
```

y `:root` `--sombra-elevada` `rgba(15, 32, 60, 0.1)` → `0.11`:

```
× @s12 el ":root" sin atributo declara los VEINTE tokens con los mismos valores que "clinica"
  AssertionError: expected '0 18px 45px rgba(15, 32, 60, 0.11)' to be '0 18px 45px rgba(15, 32, 60, 0.1)'
```

**Restaurados los dos.**

**S-7 · @s10 — un punto de consumo vuelve a escribir el identificador.**
`SelectorPaleta-logica.ts:17`: `= VARIANTE_PREDETERMINADA` → `= 'clinica'`:

```
× de los TRES puntos que el escenario nombra, solo el catálogo de variantes escribe el identificador
  [ "../lib/diseno/contratoRedisenho.ts", + "./SelectorPaleta-logica.ts" ]
× en todo el código ejecutable, ningún punto que consume la variante vuelve a escribir el identificador
  AssertionError: expected [ './SelectorPaleta-logica.ts', …(2) ] to not include './SelectorPaleta-logica.ts'
```

**Restaurado.**

**S-8 · @s10 — cambiar CUÁL es la predeterminada en la única declaración.**
`VARIANTES_REDISENO` reordenado a `['marca', 'clinica', 'calida', 'tech', 'eco']`:

```
× el guion anti-parpadeo consume esa declaración: lista exactamente las variantes NO predeterminadas
  AssertionError: expected [ 'calida', 'tech', 'eco', 'marca' ] to deeply equal [ 'clinica', 'calida', 'tech', 'eco' ]
```

Es la prueba de que el guion **consume de verdad** el catálogo: cambiar la
predeterminada en un único sitio obliga a actualizar el guion. **Restaurado.**

---

## 4. Salida literal de los comandos de verificación

### 4.1 Vitest sobre mis ficheros (y los que consumen lo que cambié)

```
$ pnpm exec vitest run src/lib/diseno/contratoRedisenho.test.ts \
    src/lib/diseno/tokensColor.test.ts src/lib/diseno/mezclaDeColor.test.ts \
    src/components/SelectorPaleta-logica.test.ts src/components/SelectorPaleta.test.tsx \
    src/documento.test.ts src/documento-base-url.test.ts src/documento-fuentes.test.ts \
    src/documento-github-pages.test.ts src/documento-iconos.test.ts \
    src/data/variantesPaleta.test.ts src/styles/tokens-api.test.ts

 RUN  v4.1.10 C:/Users/vhurt/.../GalapavetClinicaVeterinaria

 Test Files  12 passed (12)
      Tests  83 passed (83)
```

(el bloque final, tras restaurar todos los sabotajes, con los diez primeros
ficheros: `Test Files 10 passed (10) · Tests 75 passed (75)`)

### 4.2 Suite completa

```
$ pnpm exec vitest run
 Test Files  2 failed | 84 passed (86)
      Tests  1 failed | 1069 passed (1070)
```

Los dos fallos son de **otros artesanos**, en ficheros fuera de mi ámbito y
que yo no he tocado (verificado con `git diff --numstat`):

- `src/lib/diseno/rolesDescartados.ts:142` — no compila:
  `Identifier 'PATRON_PRIMARIO_FUERTE_USADO' has already been declared`.
- `src/lib/diseno/matrizDeContraste.test.ts:266` — un ciclo rojo en curso
  (`la puerta de roles ausentes falla cerrada ante una lista de candidatos
  vacía: expected true to be false`).

### 4.3 Lint

```
$ pnpm exec oxlint --deny-warnings index.html src/lib/diseno/contratoRedisenho.ts \
    src/lib/diseno/contratoRedisenho.test.ts src/lib/diseno/tokensColor.ts \
    src/lib/diseno/tokensColor.test.ts src/lib/diseno/mezclaDeColor.ts \
    src/lib/diseno/mezclaDeColor.test.ts src/components/SelectorPaleta-logica.ts \
    src/components/SelectorPaleta-logica.test.ts src/documento.test.ts
LINT_EXIT=0
```

`pnpm run lint` sobre el árbol entero da 4 errores, los **cuatro** en ficheros
de otros artesanos: `rolesDescartados.test.ts:168`, `rolesDescartados.ts:142`,
`matrizDeContraste.ts:187`, `Hero-logica.test.ts:57`.

### 4.4 Typecheck

```
$ pnpm exec tsc -p tsconfig.lote-color.json --noEmit   # tsconfig temporal que extiende tsconfig.app.json
                                                        # e incluye solo mis ficheros y sus dependencias
TYPECHECK_LOTE_EXIT=0
```

`pnpm run typecheck` sobre el árbol entero da 1 error, en fichero de otro
artesano:
`src/components/Hero-logica.test.ts(57,58): error TS2352: Conversion of type '(readonly unknown[])[]' to type 'readonly [readonly unknown[], …]' may be a mistake…`.

### 4.5 Comandos NO ejecutados (prohibidos en paralelo)

`pnpm run build`, `pnpm exec playwright test`, `vite preview` y
`pnpm exec stryker run` **no** se ejecutaron.

---

## 5. Qué debe medir la pasada de navegador (para el orquestador)

No escribí ningún spec de Playwright porque `tests/e2e/` está fuera de mi
ámbito de ficheros. Lo que la pasada de navegador debería confirmar del cambio
de `index.html`, y con qué dato se compara:

1. **Sin preferencia guardada, el fondo computado del `body` es el de
   `clinica`.** Se compara `getComputedStyle(document.body).backgroundColor`,
   convertido a hexadecimal, contra
   `leerTokenDeVariante(textoDeTokens(), 'clinica', 'fondo')` — el mismo
   mecanismo que ya usa `tests/e2e/tokens-aplicados.spec.ts:63-99`. Mide que el
   bloque `:root` sin atributo cubre de verdad el hueco que el guion ya no
   rellena.
2. **Con `galapavet-variante = 'tech'` sembrado con `page.addInitScript`, el
   documento ya tiene `data-variante="tech"` antes del primer pintado.**
   Se compara el atributo de `<html>` leído inmediatamente tras
   `page.goto(..., { waitUntil: 'commit' })` contra el literal `'tech'`. Mide
   que el anti-destello sigue haciendo su trabajo para las cuatro variantes que
   el guion sí lista.
3. **Con `galapavet-variante = 'clinica'` sembrado, no hay salto de color.**
   Se compara el `backgroundColor` computado en el primer pintado con el del
   estado ya montado: deben ser el mismo valor, porque `:root` y `clinica`
   declaran los mismos veinte tokens (@s12).

Los tres son de bajo riesgo: los cinco caminos del guion se resuelven al mismo
píxel que antes (tabla del §1, ciclo 5), y el atributo queda fijado por
`SelectorPaleta.tsx:22` en cuanto React monta.

---

## 6. Notas para el `judge`

- **Alcance del corpus de @s10.** La puerta ancha recorre los 80 `.ts`/`.tsx`
  de `src` que no son tests, más `index.html`, y afirma dos cosas estables: que
  el catálogo **sí** declara el identificador y que **ningún punto de consumo**
  lo repite. No exige que el catálogo sea el único fichero del árbol que
  contiene la palabra, y eso no es comodidad: lo medí, y hay dos sitios que la
  nombran con motivo y que no son declaraciones de cuál es la predeterminada —
  `src/lib/diseno/fidelidadPrototipo.ts:96` (la tabla de correspondencia con el
  tema del prototipo, de @s3, escrita por otro artesano mientras yo trabajaba)
  y `src/styles/_tokens.scss:43` (el selector CSS que declara los valores de la
  variante; una hoja de estilos no puede nombrar un tema sin escribirlo). La
  puerta estrecha, la de los **tres puntos que el Given enumera**, sí exige
  igualdad exacta: `ficherosQueDeclaran === ['../lib/diseno/contratoRedisenho.ts']`.
- **Ninguna aserción existente se debilitó.** Los tests previos de @s1, @s4,
  @s5, @s7 y @s12 siguen en su sitio; lo único que cambió de un test anterior
  es el hexadecimal esperado en `tokensColor.test.ts:195`, y cambió porque el
  valor del producto era incorrecto.
- **`mezclaDeColor.ts` no se tocó.** El encargo lo autorizaba «solo si
  encuentras un defecto real en la función». Lo verifiqué ejecutando la
  aritmética canal a canal por separado y coincide con la función: el defecto
  estaba en el dato de `_tokens.scss`, no en el cálculo. Su test tampoco
  necesitó cambios; ahora, además, las ocho mezclas que ya recalculaba quedan
  **ancladas al fichero real** desde `tokensColor.test.ts:163-173`, que es
  justo lo que la matriz señalaba que faltaba.
- **Anti-vacuidad.** Todas las puertas nuevas que recorren una colección
  exponen y afirman un contador: 15, 8, 7, 2, 20, 3, `> 3`, y las dos funciones
  puras nuevas fallan cerradas ante entrada vacía con motivo comprobado.

---

## 7. Ficheros tocados

| Fichero | Qué |
| --- | --- |
| `src/styles/_tokens.scss` | `--color-urgencia-suave` de `marca`: `#FDE9E9` → `#FCE9E9`; declaración escrita del rojo semántico en la cabecera |
| `index.html` | Guion anti-parpadeo: deja de declarar el identificador de la variante por defecto y lo consume por complemento del catálogo |
| `src/lib/diseno/tokensColor.ts` | Orden canónico de `RolDeColor`/`ROLES_DE_COLOR`; `leerDeclaracionDeRaizSinAtributo`; extracción de `leerDeclaracionDelBloque`; cabecera corregida |
| `src/lib/diseno/contratoRedisenho.ts` | `buscarDeclaracionesLiteralesDelIdentificador` + sus tipos |
| `src/lib/diseno/tokensColor.test.ts` | @s4 (3 tests), @s5 (4 tests), @s12 (2 tests) |
| `src/lib/diseno/contratoRedisenho.test.ts` | @s1 (4 tests), @s10 (3 tests de la función pura) |
| `src/components/SelectorPaleta-logica.test.ts` | @s10 (4 tests sobre el corpus real y el texto de `index.html`) |
