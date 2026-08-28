# TDD — lote `bundle-de-diseno` (rediseno_visual, id 24)

Escenario asignado: **@s41** de `features/rediseno_visual.feature:586-592`
("El prototipo versionado es idéntico al proyecto remoto de diseño").

Este lote **retoma un ciclo TDD interrumpido**: `src/lib/diseno/bundleDeDiseno.ts`
y `src/lib/diseno/bundleDeDiseno.test.ts` ya existían, sin commitear, con el
test importando `PANTALLAS_DEL_BUNDLE` — un símbolo que el módulo de
producción no exportaba. `tsc -b` fallaba con `TS2305` y bloqueaba el build de
todo el proyecto.

Ámbito de ficheros respetado al 100 %: solo se han tocado los dos ficheros
del lote.

```
> git status --porcelain -- src/lib/diseno/bundleDeDiseno.ts src/lib/diseno/bundleDeDiseno.test.ts
?? src/lib/diseno/bundleDeDiseno.test.ts
?? src/lib/diseno/bundleDeDiseno.ts
```

`docs/diseno-claude-design/` quedó byte a byte idéntico tras los sabotajes:

```
> git diff --quiet -- "docs/diseno-claude-design/" && echo PROTOTIPO_INTACTO
PROTOTIPO_INTACTO
```

---

## 0. El rojo real de partida

```
> pnpm exec vitest run src/lib/diseno/bundleDeDiseno.test.ts

 ❯ src/lib/diseno/bundleDeDiseno.test.ts (20 tests | 3 failed)
     × declara exactamente los cuatro ficheros de pantalla del bundle
     × el recuento de ficheros de pantalla exigido es exactamente 4
     × los ficheros obligatorios son las cuatro pantallas más el motor más el documento de procedencia

AssertionError: expected undefined to deeply equal [ 'Blog.dc.html', …(3) ]
 ❯ src/lib/diseno/bundleDeDiseno.test.ts:27:34
    expect(PANTALLAS_DEL_BUNDLE).toEqual(PANTALLAS_A_MANO)

AssertionError: Target cannot be null or undefined.
 ❯ src/lib/diseno/bundleDeDiseno.test.ts:31:34
    expect(PANTALLAS_DEL_BUNDLE).toHaveLength(4)

AssertionError: expected [ 'support.js', 'README_BUNDLE.md' ] to deeply equal [ 'Blog.dc.html', …(5) ]
 ❯ src/lib/diseno/bundleDeDiseno.test.ts:41:46
    expect(FICHEROS_OBLIGATORIOS_DEL_BUNDLE).toEqual(OBLIGATORIOS_A_MANO)

 Test Files  1 failed (1)
      Tests  3 failed | 17 passed (20)
```

Solo faltaba UN símbolo (`PANTALLAS_DEL_BUNDLE`) y su efecto en cascada sobre
`FICHEROS_OBLIGATORIOS_DEL_BUNDLE`. Los otros 17 tests del fichero (incluidos
los que ejercitan `ejecutarPuertaDelBundleDeDiseno` y `ficherosDePantalla`, ya
completos) ya estaban en verde: el ciclo interrumpido se cortó exactamente ahí.

---

## 1. Decisión de partida — la tensión real del contrato (medida, no supuesta)

Antes de escribir producción hacía falta resolver una tensión genuina entre
dos exigencias del propio repositorio, ambas verificables:

1. El test pide `PANTALLAS_DEL_BUNDLE` con los CUATRO nombres reales,
   incluida `'Veterinaria La Sierra.dc.html'` (línea 20 del test,
   `PANTALLAS_A_MANO`).
2. El propio docstring de `bundleDeDiseno.ts` (escrito en el mismo ciclo
   interrumpido) advertía: *"el nombre de una de las pantallas contiene el
   nombre comercial de la clínica ficticia del prototipo, y @s49 del mismo
   contrato prohíbe que ese literal sobreviva en ningún fichero de `src/`.
   [...] retipear ese nombre aquí pondría en rojo una puerta ya aprobada"*.

Medí la puerta de @s49 real (`src/lib/diseno/datosDelSitio.ts` +
`src/lib/diseno/datosDelSitio.test.ts`, fuera de mi ámbito) para saber
EXACTAMENTE qué tolera:

- Escanea `/src/**/*.{ts,tsx,scss}` **excluyendo** `*.test.{ts,tsx}` y
  `src/test/**` (`datosDelSitio.test.ts:41`) — así que el literal en
  `bundleDeDiseno.test.ts` (fichero de test) nunca lo dispara.
- En los ficheros de producción SÍ mira, y solo perdona UNA cita completa:
  la ruta entera `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`
  (`datosDelSitio.test.ts:70`, `CITA_DEL_PROTOTIPO_VERSIONADO`) — el mismo
  patrón que ya usa `fidelidadPrototipo.ts:4` (fichero de producción, fuera
  de mi ámbito, que cita esa misma ruta en su cabecera sin que @s49 se
  dispare).
- Un nombre de fichero SUELTO (`'Veterinaria La Sierra.dc.html'`, sin el
  prefijo `docs/diseno-claude-design/`) **no** coincide con esa cita
  permitida y por tanto SÍ dispara la puerta.

Confirmación empírica, en línea base (antes de tocar nada):

```
> pnpm exec vitest run src/lib/diseno/datosDelSitio.test.ts
 Test Files  1 passed (1)
      Tests  32 passed (32)
```

**Solución** (no es una desviación del contrato, es el mismo idioma que ya
usa este repositorio en `datosDelSitio.ts:59-62`, `formasDeBusqueda`: "no se
retipea, se deriva"): el nombre de la cuarta pantalla no se escribe suelto en
`bundleDeDiseno.ts`. Se DERIVA en tiempo de ejecución de la cita completa a la
ruta (`RUTA_DEL_PROTOTIPO_PRINCIPAL`), quitándole el prefijo del directorio
con `.replace(...)`. El único literal contiguo que el fichero de producción
contiene con el nombre de la clínica es la ruta ENTERA — exactamente la cita
que @s49 ya perdona — y nunca el nombre de fichero suelto.

Verificado empíricamente tras el cambio (ver §3): la puerta de @s49 sigue en
32/32 verde, y `bundleDeDiseno.ts` no está importado por ningún componente ni
página (`grep -rl bundleDeDiseno src` → solo él mismo y su test), así que
tampoco puede aparecer en el artefacto de producción que escanea
`tests/e2e/datos-reales.spec.ts`.

No hubo, por tanto, bloqueante real: la tensión se resolvió con datos
medidos, sin inventar comportamiento y sin tocar ningún fichero fuera de mi
ámbito.

---

## 2. Ciclo rojo → verde → refactor

### C1 (único ciclo de este lote) — `PANTALLAS_DEL_BUNDLE` y su efecto en `FICHEROS_OBLIGATORIOS_DEL_BUNDLE`

- **ROJO** (visto arriba, §0): `AssertionError: expected undefined to deeply
  equal [ 'Blog.dc.html', …(3) ]` en `PANTALLAS_DEL_BUNDLE`, con dos fallos en
  cascada más.
- **VERDE**: se añaden a `bundleDeDiseno.ts`:
  - `RUTA_DEL_PROTOTIPO_PRINCIPAL` (la cita completa permitida).
  - `DIRECTORIO_DEL_BUNDLE_CON_BARRA` (el prefijo a quitar).
  - `CUARTA_PANTALLA = RUTA_DEL_PROTOTIPO_PRINCIPAL.replace(DIRECTORIO_DEL_BUNDLE_CON_BARRA, '')`.
  - `PANTALLAS_DEL_BUNDLE = ['Blog.dc.html', 'Campanas.dc.html', 'Tienda.dc.html', CUARTA_PANTALLA]`.
  - `FICHEROS_OBLIGATORIOS_DEL_BUNDLE` reordenado a
    `[...PANTALLAS_DEL_BUNDLE, MOTOR_DE_RENDERIZADO_DEL_BUNDLE, DOCUMENTO_DE_PROCEDENCIA_DEL_BUNDLE]`
    (antes solo llevaba motor + procedencia).

  ```
  > pnpm exec vitest run src/lib/diseno/bundleDeDiseno.test.ts
   Test Files  1 passed (1)
        Tests  20 passed (20)
  ```

### REFACTOR (en verde)
- Se actualizó el docstring de cabecera del módulo: ya no dice "las pantallas
  se cuentan, no se nombran" (quedó falso tras C1), sino que documenta la
  DERIVACIÓN y por qué existe (evitar el literal suelto de @s49).
- No hizo falta extraer más funciones: la derivación es una expresión y tres
  constantes con nombre, sin duplicación ni números mágicos.
- Verificado en verde tras cada paso del refactor (20/20 repetido dos veces).

No hicieron falta más ciclos: los otros 17 tests del fichero (sobre
`ficherosDePantalla` y `ejecutarPuertaDelBundleDeDiseno`) ya estaban escritos,
en verde y sin tocar producción de más — Ley 3 respetada: ni una línea de
producción que no la pidiera un test en rojo.

---

## 3. Trazabilidad — @s41 → aserción

Fichero de tests: `src/lib/diseno/bundleDeDiseno.test.ts`.

| Cláusula de @s41 | Aserción |
| --- | --- |
| `Given los ficheros de "docs/diseno-claude-design"` | `:140` `nombresRealesDelBundle()` lee el directorio REAL con `readdirSync` (no un doble) |
| `When se comprueba el inventario del bundle` | `:148-152` invoca `ejecutarPuertaDelBundleDeDiseno` sobre los nombres reales |
| `Then existen los cuatro ficheros de pantalla y el motor de renderizado` | `:154` `informe.faltantes` vacío, `:155` `informe.pasa === true` (incluye `MOTOR_DE_RENDERIZADO_DEL_BUNDLE` en `FICHEROS_OBLIGATORIOS_DEL_BUNDLE`) |
| `And existe el documento que explica de dónde viene el bundle` | mismo informe: `DOCUMENTO_DE_PROCEDENCIA_DEL_BUNDLE` está en `FICHEROS_OBLIGATORIOS_DEL_BUNDLE` y por tanto en `faltantes === []`; `:164-170` además se lee su TEXTO real y se comprueban las tres frases de procedencia |
| `And el recuento de ficheros de pantalla es exactamente 4` | `:159-162` `ficherosDePantalla(nombresRealesDelBundle())` tiene longitud 4 y coincide con `PANTALLAS_A_MANO`; `:32` `RECUENTO_ESPERADO_DE_PANTALLAS === 4` |

Cobertura unitaria complementaria (no @s41 per se, pero sostiene la puerta):
`:25-48` el inventario declarado (`PANTALLAS_DEL_BUNDLE`,
`FICHEROS_OBLIGATORIOS_DEL_BUNDLE`, sufijo, motor, procedencia);
`:50-66` `ficherosDePantalla` (filtro, orden, no-confundir-prefijo-con-sufijo,
lista vacía); `:68-131` `ejecutarPuertaDelBundleDeDiseno` con los tres fallos
cerrados (bundle vacío, sin obligatorios, sin pantallas exigidas) y los casos
de motor ausente, procedencia ausente y pantalla sobrante.

---

## 4. Verificación obligatoria (salida literal)

### 4.1 Tests — mi fichero

```
> pnpm exec vitest run src/lib/diseno/bundleDeDiseno.test.ts

 RUN  v4.1.10 C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria

 Test Files  1 passed (1)
      Tests  20 passed (20)
```

Los 20, por nombre (`--reporter=verbose`):

```
✓ rediseno_visual @s41 el inventario declarado del bundle de diseño > declara exactamente los cuatro ficheros de pantalla del bundle
✓ rediseno_visual @s41 el inventario declarado del bundle de diseño > el recuento de ficheros de pantalla exigido es exactamente 4
✓ rediseno_visual @s41 el inventario declarado del bundle de diseño > declara el motor de renderizado y el documento de procedencia por su nombre real
✓ rediseno_visual @s41 el inventario declarado del bundle de diseño > los ficheros obligatorios son las cuatro pantallas más el motor más el documento de procedencia
✓ rediseno_visual @s41 el inventario declarado del bundle de diseño > el sufijo que distingue un fichero de pantalla es el del exportador de diseño
✓ ficherosDePantalla > se queda solo con los nombres que acaban en el sufijo de pantalla
✓ ficherosDePantalla > devuelve los nombres ordenados, no en el orden en que el directorio los entrega
✓ ficherosDePantalla > no confunde un nombre que solo EMPIEZA por el sufijo con uno que acaba en él
✓ ficherosDePantalla > con una lista vacía no encuentra ninguna pantalla
✓ ejecutarPuertaDelBundleDeDiseno > pasa cuando están los seis ficheros obligatorios y las pantallas son las esperadas
✓ ejecutarPuertaDelBundleDeDiseno > falla cerrada y lo motiva cuando el directorio del bundle está vacío
✓ ejecutarPuertaDelBundleDeDiseno > falla cerrada y lo motiva cuando no se le exige ningún fichero obligatorio
✓ ejecutarPuertaDelBundleDeDiseno > falla cerrada y lo motiva cuando no se le exige ninguna pantalla
✓ ejecutarPuertaDelBundleDeDiseno > detecta y nombra el motor de renderizado ausente, aunque el recuento de pantallas cuadre
✓ ejecutarPuertaDelBundleDeDiseno > detecta y nombra el documento de procedencia ausente
✓ ejecutarPuertaDelBundleDeDiseno > suspende cuando sobra una pantalla, aunque no falte ninguno de los obligatorios
✓ rediseno_visual @s41 el bundle versionado en "docs/diseno-claude-design" > el recuento de ficheros efectivamente inspeccionados es mayor que 0
✓ rediseno_visual @s41 el bundle versionado en "docs/diseno-claude-design" > existen los cuatro ficheros de pantalla, el motor de renderizado y el documento de procedencia
✓ rediseno_visual @s41 el bundle versionado en "docs/diseno-claude-design" > el recuento de ficheros de pantalla del directorio real es exactamente 4
✓ rediseno_visual @s41 el bundle versionado en "docs/diseno-claude-design" > el documento de procedencia explica de dónde viene el bundle
```

### 4.2 Puerta de @s49 (fuera de mi ámbito, verificada en verde antes y después)

```
> pnpm exec vitest run src/lib/diseno/datosDelSitio.test.ts
 Test Files  1 passed (1)
      Tests  32 passed (32)
```

### 4.3 Suite completa

```
> pnpm exec vitest run
 Test Files  2 failed | 86 passed (88)
      Tests  5 failed | 1140 passed (1145)
```

Los 5 fallos son en `src/accesibilidad-teclado.test.tsx` (3) y
`src/lib/diseno/matrizDeContraste.test.ts` (1 de 18) — **ninguno cita
`bundleDeDiseno`** y ninguno de los dos ficheros está en mi ámbito. Coinciden
con ficheros que otros artesanos tienen a medio ciclo en este mismo instante
(`git status --porcelain` los lista como `M`, no `??`): p. ej.
`src/components/BarraUrgencias.module.scss` está modificado por otro
artesano, y es precisamente la fila que hace fallar
`matrizDeContraste.test.ts` (el `BLOQUEANTE 1` de
`progress/rediseno/tdd_matriz-de-contraste.md`, en curso de resolverse bajo
mis pies). No los he tocado.

### 4.4 Lint y typecheck — proyecto completo

```
> pnpm run lint       -> exit 0
> pnpm run typecheck  -> exit 0   (tsc -b sin errores; el TS2305 original ya no aparece)
```

### 4.5 Lint acotado a mis dos ficheros

```
> pnpm exec oxlint --deny-warnings src/lib/diseno/bundleDeDiseno.ts src/lib/diseno/bundleDeDiseno.test.ts
OXLINT_EXIT=0
```

### 4.6 Sabotajes (cada aserción nueva vista fallar y restaurada)

**SABOTAJE A** — se rompe el prefijo de derivación
(`DIRECTORIO_DEL_BUNDLE_CON_BARRA = 'docs/diseno-claude-desing/'`, con typo,
así que `.replace()` ya no encuentra el prefijo y `CUARTA_PANTALLA` se queda
con la ruta entera sin recortar):

```
FAIL … > declara exactamente los cuatro ficheros de pantalla del bundle
AssertionError: expected [ …(3), 'docs/diseno-claude-design/Veterinaria La…' ] to deeply equal [ …(3), 'Veterinaria La Sierra.dc.html' ]
FAIL … > los ficheros obligatorios son las cuatro pantallas más el motor más el documento de procedencia
AssertionError: expected [ 'Blog.dc.html', …(5) ] to deeply equal [ 'Blog.dc.html', …(5) ]
  - "Veterinaria La Sierra.dc.html"
  + "docs/diseno-claude-design/Veterinaria La Sierra.dc.html"
FAIL … > existen los cuatro ficheros de pantalla, el motor de renderizado y el documento de procedencia
AssertionError: expected [ Array(1) ] to deeply equal []
Tests  3 failed | 17 passed (20)
```

Restaurado: `20 passed (20)`.

**SABOTAJE B** — se reordena `FICHEROS_OBLIGATORIOS_DEL_BUNDLE` (motor y
procedencia antes que las pantallas, en vez de después):

```
FAIL … > los ficheros obligatorios son las cuatro pantallas más el motor más el documento de procedencia
AssertionError: expected [ 'support.js', …(5) ] to deeply equal [ 'Blog.dc.html', …(5) ]
  [
  +   "support.js",
  +   "README_BUNDLE.md",
      "Blog.dc.html",
      "Campanas.dc.html",
      "Tienda.dc.html",
      "Veterinaria La Sierra.dc.html",
  -   "support.js",
  -   "README_BUNDLE.md",
  ]
Tests  1 failed | 19 passed (20)
```

Restaurado: `20 passed (20)`.

**SABOTAJE C** — se cambia un literal hardcodeado sin derivar
(`'Tienda.dc.html'` → `'Tiendas.dc.html'`):

```
FAIL … > declara exactamente los cuatro ficheros de pantalla del bundle
AssertionError: expected [ …(2), 'Tiendas.dc.html', … ] to deeply equal [ …(2), 'Tienda.dc.html', … ]
FAIL … > los ficheros obligatorios son las cuatro pantallas más el motor más el documento de procedencia
AssertionError: expected [ 'Blog.dc.html', …(5) ] to deeply equal [ 'Blog.dc.html', …(5) ]
FAIL … > existen los cuatro ficheros de pantalla, el motor de renderizado y el documento de procedencia
AssertionError: expected [ 'Tiendas.dc.html' ] to deeply equal []
Tests  3 failed | 17 passed (20)
```

Restaurado: `20 passed (20)`, y confirmado
`git diff --quiet -- "docs/diseno-claude-design/" → PROTOTIPO_INTACTO`
(los sabotajes fueron todos en `bundleDeDiseno.ts`, nunca en el prototipo
versionado).

Los otros 17 tests del fichero (sobre `ficherosDePantalla` y
`ejecutarPuertaDelBundleDeDiseno`) no son nuevos de este lote: ya estaban
escritos y en verde antes de que yo interviniera, y su cobertura por
sabotaje corresponde al ciclo que los escribió, no a este informe.

---

## 5. Playwright

Este lote no toca ni añade ningún spec de Playwright. `@s41` es "los ficheros
de `docs/diseno-claude-design`" — un inventario de disco, no algo que el
navegador aporte. `tests/e2e/fidelidad.spec.ts` (fuera de mi ámbito) es el que
ya cubre la parte de @s41 que necesita servidor real, si la hubiera.

---

## 6. Estado

- **Cerrado por completo**: @s41, sin bloqueantes.
- Suite de mi fichero: 20/20 verde. Lint (proyecto completo) 0. Typecheck
  (proyecto completo, `tsc -b`) 0 — el `TS2305` que bloqueaba el build de
  todo el proyecto ya no aparece.
- Puerta de @s49 (`datosDelSitio.test.ts`), fuera de mi ámbito: 32/32 verde,
  antes y después de mi cambio.
- Los 5 fallos de la suite completa son de otros dos ficheros (de otros
  artesanos, a medio ciclo en este mismo instante) y no citan
  `bundleDeDiseno` en ningún mensaje de fallo.
- No he ejecutado `build`, `playwright`, `preview` ni `stryker`.
