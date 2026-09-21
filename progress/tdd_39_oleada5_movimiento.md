# TDD — feature 39, oleada 5: los dos huecos de cobertura sobre movimiento

> `tdd_craftsman`, 21/09/2026. Cierra los bloqueantes **A** y **B** del
> `progress/judge_39.md` §3 (las cláusulas `accesibilidad.feature:477`,
> `:501`, `:502` y `:503`). Los otros tres bloqueantes del judge los llevaba el
> `craftsman_lead` en paralelo.
>
> **Ficheros tocados: exactamente 3**, los de mi encargo y ninguno más:
> `tests/e2e/movimiento.spec.ts`, `src/lib/accesibilidad-movimiento.ts`,
> `src/lib/accesibilidad-movimiento.test.ts`. No he tocado `features/*.feature`,
> `feature_list.json`, `project-spec.md`, `progress/current.md` ni ningún
> fichero de las cuatro oleadas anteriores.

---

## 0. Estado final, medido en esta máquina

| Puerta | Resultado |
| --- | --- |
| `pnpm run lint` (oxlint --deny-warnings) | **exit 0** |
| `pnpm run typecheck` (tsc -b) | **exit 0** |
| `pnpm run test` (Vitest) | **88 ficheros · 1422 tests · 1422 pasan**, exit 0 |
| `pnpm run test:e2e` (Playwright, 27 specs) | **174 passed**, 51,1 s, exit 0 |
| `node .harness/harness.mjs init` | **EXIT=0 — VERDE, sin un solo `[FAIL]`** |

1410 → **1422** tests: los 12 que añade esta oleada en
`accesibilidad-movimiento.test.ts` (de 8 `it` a 20). Los 174 de navegador y los
27 specs son exactamente la referencia del judge: esta oleada no añade specs de
Playwright, **repara** el que había.

`harness init` salió verde entero: el `[FAIL]` que el encargo me avisaba que
podía aparecer sobre `features/retirada_carteleria_urgencias.feature` ya no
existe — el agente paralelo creó el fichero mientras yo trabajaba. No lo he
tocado.

---

## 1. BLOQUEANTE A — `accesibilidad.feature:477` (@s19, 4ª cláusula del Then)

### 1.1 El defecto, confirmado midiéndolo

La cláusula pide que el recuento «se obtenga de los elementos que declaran
movimiento en los módulos que lo declaran de verdad, y no de contar los
elementos a los que la propia consulta de movimiento reducido les anula la
duración, que son todos los del documento».

La causa raíz estaba escrita por la oleada 4 en `movimiento.spec.ts:82-93` y la
he **verificado midiéndola**, no heredándola. La razón de fondo es más concreta
de lo que decía el aviso: **las 8 declaraciones `transition:` de los 6
`.module.scss` viven todas DENTRO de un
`@media (prefers-reduced-motion: no-preference)`** (verificado: 14 aperturas de
ese `@media` en `src/**/*.scss` — 9 en los `.module.scss`, 1 en `global.scss` y
4 en `_api.scss`). Bajo `reduce` esas reglas **no aplican en absoluto**, y
lo único que da duración a un elemento es el anulador de `global.scss:337-343`,
que la aplica sobre `*`. Medido en el navegador real:

```
BAJO REDUCE      : { total: 392, conDuracion: 392 }
SIN PREFERENCIA  : { total: 392, conDuracion: 48 }
```

392 de 392. El `toBeGreaterThan(0)` no podía bajar de 392 ni con el sitio entero
sin movimiento.

### 1.2 El arreglo

El censo se mide **sin la preferencia**, donde el anulador global no aplica y los
únicos elementos con duración > 0 son aquellos a los que una hoja del sitio se
la declara de verdad. Se marcan en el DOM (`data-movimiento-declarado`), se
vuelve a `reduce` y se **reencuentran por su marca**, no se recuentan. Cuatro
aserciones, que encierran la cláusula por los dos lados:

- `censo.conMovimientoDeclarado` **> 0** — hay sujeto.
- `censo.conMovimientoDeclarado` **< `censo.totalDeElementos`** — y no es el
  documento entero. Ésta es la que caza el defecto: era literalmente falsa.
- `delCensoInspeccionados` **=== el censo** — bajo `reduce` se inspeccionan los
  mismos, ni uno menos (anti-vacuidad de la segunda pasada).
- `delCensoAnuladosSinLlegarACero` **=== el censo** — `reduce` los anula a
  0,01 ms, **todos y ninguno a 0**. Sustituye a un `fueraDeEscala === 0`
  restringido al censo que habría sido redundante con el del documento entero:
  esta versión añade el intervalo abierto por abajo, que es la decisión que
  `global.scss` documenta («con "0" los eventos `transitionend` nunca se
  disparan y algo que espere a uno se queda colgado»).

Se conserva `fueraDeEscalaEnTodoElDocumento === 0`, que es estrictamente más
fuerte que restringirlo al censo y no es vacuo (392 elementos).

Números que quedan escritos en el código, medidos el 21/09/2026: bajo `reduce`,
429 de 429; sin la preferencia, 49 de 429 en ese punto del escenario (48 de 392
en la portada recién cargada, antes de abrir los dos desplegables).

### 1.3 Los rojos, literales

**ROJO A1 — el defecto documentado, reproducido y cazado.** Escribí primero las
aserciones nuevas dejando el censo medido bajo `reduce`, es decir, tal y como
estaba hasta hoy:

```
Error: ...y ese recuento NO es el documento entero, que es lo que contaba el anulador de "reduce"
expect(received).toBeLessThan(expected)

Expected: < 429
Received:   429
```

Verde en cuanto el censo pasó a medirse bajo `no-preference`.

**ROJO A2 — fabricado: el sitio se queda sin movimiento.** Renombré por script
la propiedad de las **13** declaraciones `transition`/`transition-duration` de
`src/**/*.scss` a una propiedad inexistente, reconstruí (`0 transition` en el
CSS generado, comprobado) y corrí el spec:

```
Error: elementos con transición DECLARADA por una hoja del sitio (@s19, 4ª cláusula del Then)
expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

Es **la misma aserción** que antes daba 392 pasara lo que pasara. Ahora muerde.

**ROJO A3 — fabricado: el anulador puesto a `0`.** Cambié
`global.scss` de `transition-duration: 0.01ms` a `0s`, reconstruí y corrí:

```
Error: elementos del censo que "reduce" anula a 0,01 ms: todos, y ninguno a 0
expect(received).toBe(expected)

Expected: 49
Received: 0
```

La cuarta aserción protege la decisión del «0,01 ms y no 0».

**Restauración verificada.** Las 20 hojas de `src/**/*.scss` se copiaron antes
de perturbar y se restauraron desde esa copia; `filecmp` byte a byte devuelve
igualdad para las 20, y `git status --porcelain "*.scss"` vuelve a listar solo
`Cabecera.module.scss` e `InformacionContacto.module.scss` — las dos que ya
traían las oleadas anteriores. Ninguna hoja de estilos queda tocada por esta
oleada.

### 1.4 Refactor (en verde)

- `esperarAQueNoQuedeMovimientoEnCurso(page)`: la espera de «ninguna animación
  en curso» estaba copiada tres veces.
- `instalarLectorDeDuraciones(page)`: el lector de duraciones vivía duplicado
  dentro de cada `page.evaluate`. Ahora va en un `addInitScript` (precedente en
  el repo: `imagenes.spec.ts:136`) **para que las dos pasadas midan lo mismo por
  construcción**: si una se desviara de la otra, la comparación entre censo y
  medición no probaría nada.
- Se retiró el bloque «DEFECTO CONOCIDO Y SIN ARREGLAR» de `:82-93`: ya no
  describe el código.

---

## 2. BLOQUEANTE B — `accesibilidad.feature:501-503` (@s20)

### 2.1 Lo que había

La única puerta de @s20 la alimentaba un literal sintético de dos entradas
(`'Tarjeta de campaña 1'`, `'Tarjeta de campaña 2'`) escritas en el propio test
— exactamente lo que `:501` prohíbe. Y ninguna tarjeta de campaña ha tenido
jamás una `animation:` en `src/`, así que no podía ponerse roja ni antes de esta
feature.

### 2.2 Lo que hay ahora

Módulo puro `accesibilidad-movimiento.ts`, función
`inventariarBloquesQueAparecenAnimando(hojas)`, alimentada con el TEXTO REAL de
las **20** hojas del sitio vía `import.meta.glob(..., query: '?raw')` — el mismo
patrón de corpus que `escalaMovimiento.test.ts`, como pedía el judge.

| Cláusula | Puerta |
| --- | --- |
| `:501` el inventario se lee del sitio real | `hojasInspeccionadas === HOJAS_REALES.length` y `> 0`; y la comprobación de visibilidad de @s20 recorre ese inventario real, ya no el literal |
| `:502` el recuento es exactamente 0, declarado por escrito | `recuentoDeBloquesQueAparecenAnimando === 0`, con `hojasInspeccionadas > 0` delante y `pasa === true` |
| `:503` si vuelve a subir, la puerta lo caza | el mismo `toBe(0)` es el disparador; además un `it` con hoja sintética comprueba que el hallazgo llega **nombrado con su hoja y su línea** |

Detalle de diseño que importa: se exige la **propiedad completa** (`animation:`,
`animation-name:`), nunca un prefijo. Si se contara por prefijo, el propio
anulador de `global.scss` (`animation-duration`, `animation-iteration-count`)
dejaría la puerta permanentemente roja **sobre su propia red de seguridad**. Hay
un `it` dedicado a fijar esa distinción.

`visibleSinAnimacion` se deriva del texto: una hoja que declara una animación y
además declara un estado base oculto (`opacity: 0` / `visibility: hidden`) marca
el bloque como no visible. Es deliberadamente **conservador y a nivel de hoja**,
no de regla: emparejar declaración con regla exige un parser de SCSS y la
cascada real, que son competencia del navegador (Decisión 11). El sesgo es hacia
el rojo y está escrito así en el código.

### 2.3 Los rojos, literales

**ROJO B1 — la función no existía.**
`TypeError: inventariarBloquesQueAparecenAnimando is not a function`.

**ROJO B3 — la derivación del estado base.** Con `visibleSinAnimacion` aún fijo
a `true`:

```
AssertionError: expected [ { …(2) } ] to deeply equal [ { …(2) } ]
    {
      "nombre": "/prueba/entrada-oculta.scss:3",
-     "visibleSinAnimacion": false,
+     "visibleSinAnimacion": true,
    },
```

**ROJO B2 — el disparador de `:503`, sobre el SITIO REAL.** Añadí al final de
`src/components/Equipo.module.scss` un bloque de mentira
(`.perturbacionTemporal { animation: aparecer 300ms ease-out; }`) y corrí la
puerta:

```
FAIL … > desde el 20/09/2026 el recuento de bloques que aparecen mediante una animación es exactamente 0 (:502)
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1
```

Retirado el bloque, `git status --porcelain src/components/Equipo.module.scss`
vuelve vacío (idéntico a HEAD) y la puerta vuelve a verde. **Reintroducir una
animación de entrada exige pasar por la puerta humana**: eso es ahora ejecutable,
no una declaración de intenciones.

### 2.4 Declaración de honestidad sobre los ciclos

No todos los `it` de esta parte nacieron rojos, y lo digo en vez de presentarlo
como si sí:

- **Nacieron rojos:** B1 (la función no existía) y B3 (la derivación del estado
  base). Más el B2 fabricado sobre el sitio real.
- **Nacieron verdes por construcción:** los 8 `it` de caracterización que fijan
  el comportamiento del analizador (`animation-name`, el anulador global que NO
  cuenta, el comentario que no cuenta, el espacio antes de los dos puntos, los
  finales de línea CRLF, `visibility: hidden`, la hoja sin estado base oculto, y
  la puerta con 0 hojas que falla cerrada). El paso a verde de B1 implementó el
  barrido real en vez de un `[]` falso, así que estos llegaron cubiertos. **No
  los presento como rojos: los presento como armadura de mutación**, y demuestro
  aparte que muerden (§3).

---

## 3. Que las puertas muerden: 26 mutantes a mano, 26 muertos

`src/lib/accesibilidad-movimiento.ts` es `src/lib/**`, que `stryker.config.json`
muta con **`break = 100`**. **No he corrido Stryker** (es del `mutation_tester`),
pero sí he perturbado el módulo a mano, mutante a mutante, corriendo la suite
tras cada uno:

```
MUERTO  PROPIEDADES -> []                 MUERTO  plantilla propiedad -> ''
MUERTO  ESTADO_BASE -> new Set([])        MUERTO  plantilla nombre -> ''
MUERTO  some->every (aparicion)           MUERTO  SEPARADOR -> ''
MUERTO  some->every (oculto)              MUERTO  ESPACIO -> ''
MUERTO  startsWith->endsWith              MUERTO  FIN_DE_DECLARACION -> ''
MUERTO  quita la negacion !               MUERTO  SIN_ESPACIO -> 'X'
MUERTO  quita .trim()                     MUERTO  SALTO_DE_LINEA -> ''
MUERTO  quita replaceAll(ESPACIO)         MUERTO  pasa -> true
MUERTO  quita replaceAll(FIN)             MUERTO  pasa -> false
MUERTO  indice + 1 -> indice - 1          MUERTO  bloquesInvisibles: quita el !
MUERTO  > -> >=                           MUERTO  pasa de visibilidad -> true
MUERTO  === -> !==                        MUERTO  pasa de visibilidad -> false
MUERTO  && -> ||                          MUERTO  quita .filter()

SUPERVIVIENTES: ninguno
```

**Un superviviente real, y cómo se cerró.** En la primera pasada sobrevivió
`quita .trim()`: `replaceAll(' ', '')` ya quitaba los espacios, así que el
`.trim()` parecía código muerto — y código muerto bajo `break = 100` es rojo
garantizado. No lo borré por comodidad: comprobé que este repositorio tiene
`core.autocrlf = true` y las hojas viajan como `text: auto`, de modo que **un
clon limpio en Windows las recibe con CRLF** y cada línea llegaría con un retorno
de carro pegado al final; sin `trim()`, `opacity:0\r` dejaría de reconocerse como
estado base oculto. El `.trim()` es carga útil, no adorno: le puse el `it` de
finales de línea de Windows que lo cubre y el mutante murió. La constante se
construye por concatenación porque una plantilla de JavaScript normaliza CRLF a
LF y no serviría.

**Aviso al `mutation_tester`:** este módulo gana lógica pura nueva bajo umbral
100. Mis 26 mutantes son un subconjunto razonado, no la lista de StrykerJS: el
veredicto sigue siendo suyo. Los dos puntos que miraría primero son los
literales de cadena (`':'`, `';'`, `' '`, `''`) y el mutador de `BooleanLiteral`
sobre `!declaraUnEstadoBaseOculto(hoja)`; los tres tienen `it` dedicado.

Del lado de `movimiento.spec.ts` no hay mutación (Playwright vive fuera del gate
de Stryker, y el fichero está fuera de `mutate`), y por eso las tres aserciones
nuevas se validaron **perturbando el sitio real** (§1.3), que es el equivalente
honesto.

---

## 4. Dos incidentes que conviene que consten

**4.1 El servidor de `vite preview` zombi dio un falso rojo.**
`playwright.config.ts` tiene `reuseExistingServer: !process.env.CI`. Tras una de
mis perturbaciones quedó vivo en el puerto 4173 un `vite preview` que servía el
`dist/` **perturbado**; la siguiente corrida de `pnpm run test:e2e` lo reutilizó
en vez de reconstruir, y falló con `Expected: 49 / Received: 0`. El código fuente
estaba correcto (`git status` limpio) y un `vite build` fresco producía
`transition-duration:.01ms`. Matando el servidor, la corrida completa dio
**174 passed**. Queda dicho porque es una trampa reutilizable: cualquier agente
que perturbe `src/` y corra Playwright tiene que **matar el preview del puerto
4173** antes de fiarse del resultado.

**4.2 `tsc -b` estuvo roto un rato por un fichero ajeno.** A mitad de sesión
`pnpm run build` falló con
`tests/e2e/urgencias.spec.ts(112,9): error TS6133: 'rotulosAccesiblesTotales' is declared but its value is never read.`
No es mío (es de otra oleada, en edición en paralelo) y no lo toqué; el agente
que lo tenía asignado lo cerró solo. En el estado final `pnpm run typecheck` da
exit 0.

---

## 5. Lo que NO he hecho, a propósito

- **No he tocado el contrato.** `features/accesibilidad.feature` está aprobado
  por Pablo el 20/09/2026; mi trabajo era implementarlo, no reescribirlo.
- **No he corrido Stryker.**
- **No he tocado el aviso menor del judge §3.3** (`accesibilidad.feature:565`,
  el «recuento de módulos» de @s22): el judge lo dejó explícitamente como no
  bloqueante (su punto 8) y está fuera de mis tres ficheros.
- **No he marcado nada como `done`.** Eso es del `craftsman_lead`, tras
  `judge` y `mutation_tester`.

---

## 6. Mapa cláusula → puerta

| Cláusula aprobada | Puerta que la muerde | Rojo que lo demuestra |
| --- | --- | --- |
| `:477` (@s19) el recuento sale de los módulos que declaran movimiento, no del documento entero | `movimiento.spec.ts` — `censo.conMovimientoDeclarado` `> 0` **y** `< totalDeElementos`, con el censo medido sin la preferencia | A1 (`< 429` / `429`) y A2 (`> 0` / `0`) |
| `:501` (@s20) el inventario se lee del sitio real | `accesibilidad-movimiento.test.ts` — `hojasInspeccionadas === HOJAS_REALES.length > 0`; la comprobación de visibilidad recorre el inventario real | B1 (`is not a function`) |
| `:502` (@s20) el recuento es exactamente 0, declarado por escrito | `recuentoDeBloquesQueAparecenAnimando === 0` con anti-vacuidad delante | B2 (`expected 1 to be +0`) |
| `:503` (@s20) si vuelve a subir, la puerta lo caza | el mismo `toBe(0)`, más el `it` que exige hoja y línea del hallazgo | B2, sobre `Equipo.module.scss` real |
