# Fix — los dos usos ilegales del acento saturado (@s15)

Feature `rediseno_visual` (id 24). Ámbito cerrado: `src/components/BarraUrgencias.module.scss`,
`src/components/BarraUrgencias.tsx` y `src/components/Hero.module.scss`.

**Veredicto: VERDE**, con **UN BLOQUEANTE de contrato declarado** (caso 2, §3).

---

## 0. El rojo de partida

La puerta nueva `src/lib/diseno/usoDelAcento.ts` (@s15) corrió contra el texto real de los
20 ficheros de estilos y devolvió dos usos del acento como `color:`:

```
FAIL src/lib/diseno/usoDelAcento.test.ts > @s15 la puerta corre sobre el texto real ...
AssertionError: expected [ { …(3) }, { …(3) } ] to deeply equal []
+ [
+   { "declaracion": "color: var(--color-acento);", "linea": 19, "ruta": "src/components/BarraUrgencias.module.scss" },
+   { "declaracion": "color: var(--color-acento);", "linea": 46, "ruta": "src/components/Hero.module.scss" }
+ ]
```

La puerta tiene razón y **no se ha tocado**: ni `usoDelAcento.ts` ni su test aparecen en el
diff. Lo que estaba mal era el estilo.

### Dato previo que condiciona las dos decisiones

La tercera cláusula de @s15 («aparece al menos una vez como relleno») **ya estaba satisfecha
antes de este fix**, y no por ninguno de los dos ficheros del rojo:

```
$ grep -rn "var(--color-acento)" src/ --include=*.scss
src/components/BarraUrgencias.module.scss:19:    color: var(--color-acento);      <- ilegal
src/components/Hero.module.scss:46:    color: var(--color-acento);              <- ilegal
src/components/SelectorPaleta.module.scss:69:    background-color: var(--color-acento);   <- relleno legal
```

Es decir: **el argumento «hay que convertir algo en relleno para que la puerta no suspenda por
la tercera cláusula» es falso**. `SelectorPaleta.module.scss:69` ya lo cubre. Esto elimina el
único incentivo estructural a favor de la opción «punto dibujado por CSS» del caso 1, y obliga a
decidir por medición pura.

---

## 1. Cómo se ha medido

Con la fórmula real del repositorio, `src/lib/contraste.ts` →
`calcularRatioContraste` (WCAG 2.2, `luminanciaRelativa` + compensación 0,05), importada
directamente, sin reimplementarla. Los hexadecimales se leen del bloque **propio** de cada
variante de `src/styles/_tokens.scss` (nunca heredado).

Modelo del velo del hero (`Hero.module.scss:15-20`): `color-mix(in srgb, var(--color-tinta) X%,
transparent)` produce el mismo RGB de la tinta con alfa `X`; compuesto sobre lo que hay debajo,
el color efectivo es `X·tinta + (1-X)·debajo`. Debajo hay una **fotografía**, cuyo color no es
conocible, así que se acota por sus dos extremos: foto negra (`#000000`, el compuesto más
oscuro posible) y foto blanca (`#FFFFFF`, el más claro posible). Cualquier fotografía real cae
**entre** esos dos números, así que si el par suspende en los dos extremos, suspende siempre.

Se han medido las **tres paradas declaradas** del degradado (92 %, 72 %, 22 %). El cintillo del
hero vive en el borde izquierdo del contenido (`.contenido { align-items: flex-start }`,
`Hero.module.scss:37`), es decir, en la mitad izquierda del degradado: la zona 92 %–72 %.

---

## 2. CASO 1 — `BarraUrgencias.module.scss:18-20` — RESUELTO

### Los números (ratio contra `--color-urgencia` de la misma variante)

| variante | `--color-urgencia` | `--color-acento` | ratio acento | `--color-sobre-primario` | ratio sobre-primario |
|---|---|---|---|---|---|
| clinica | `#DC2626` | `#10B981` | **1,90** | `#FFFFFF` | **4,83** |
| calida  | `#C2410C` | `#4D7C0F` | **1,04** | `#FFFFFF` | **5,18** |
| tech    | `#F87171` | `#22D3EE` | **1,53** | `#04212B` | **6,04** |
| eco     | `#DC2626` | `#0EA97B` | **1,61** | `#FFFFFF` | **4,83** |
| marca   | `#DC2626` | `#B4C718` | **2,56** | `#FFFFFF` | **4,83** |

### La decisión, y por qué NO la otra

Las dos salidas que planteaba el encargo:

**(a) Convertir el `●` en una forma dibujada por CSS con `background-color: var(--color-acento)`
— DESCARTADA.** El acento contra la superficie roja de la barra da **1,90 · 1,04 · 1,53 · 1,61 ·
2,56**: por debajo de 3 en las cinco variantes, y en `calida` un 1,04 que es literalmente
indistinguible del fondo. Un «indicador pulsante» (@s27) que no se distingue de la barra sobre
la que vive **no indica nada**: la única señal que quedaría es el parpadeo, y el parpadeo es
justo lo que @s27 obliga a apagar con `prefers-reduced-motion`. Con la preferencia activa el
indicador desaparecería de facto. Además, el argumento de que esta opción «aporta el relleno que
pide la tercera cláusula de @s15» no se sostiene: ese relleno ya existe (§0). Y habría exigido
tocar `BarraUrgencias.tsx` para quitar el carácter (si no, se pintaría carácter *y* fondo),
ampliando el diff sin ganar nada medible.

**(b) Pintar el carácter con `--color-sobre-primario` — ELEGIDA.** Da **4,83 · 5,18 · 6,04 ·
4,83 · 4,83**: aprueba texto normal (4,5) en las cinco, y en `tech` da 6,04 ≥ 6, exactamente el
umbral que @s7 exige por escrito («en la variante "tech" ese par da al menos 6, frente al 2,77
que daría el blanco del prototipo»). Es además la fila que la matriz de uso **ya declara** para
este mismo fichero: `src/lib/diseno/matrizDeContraste.ts:268`
(`{ rol: 'sobre-primario', fondo: 'urgencia', uso: 'texto normal' }` // `BarraUrgencias.module.scss:12-13`).

### Cómo se ha implementado

El cambio mínimo no es *escribir* `color: var(--color-sobre-primario)` en el `span`: es
**borrar la declaración**, porque `.barra` ya declara `color: var(--color-sobre-primario)` en
`:13` y el `span` la hereda. Escribirla otra vez sería duplicar el token en el mismo bloque.

```scss
  span {
    @media (prefers-reduced-motion: no-preference) {
      animation: pulso 1.6s ease-in-out infinite;
    }
  }
```

### Cómo quedan los cuatro escenarios

- **@s15** ✅ el acento deja de ser un valor de `color:`. La puerta lo confirma.
- **@s7** ✅ ya no hay nada pintado sobre `--color-urgencia` que no sea `--color-sobre-primario`
  de esa misma variante. Antes el `span` lo contradecía frontalmente; el fix no solo repara
  @s15, **repara también una infracción de @s7 que nadie había señalado**. Y sigue sin haber
  blanco literal: sale del token (`puertaLiteralesColor` verde).
- **@s27** ✅ el indicador **sigue existiendo** (`BarraUrgencias.tsx:10` intacto, `aria-hidden`)
  y **sigue pulsando**: la `animation` no se ha tocado y sigue dentro de
  `@media (prefers-reduced-motion: no-preference)`, así que deja de animarse con la preferencia
  activa. `movimientoRespetuoso.test.ts` sigue verde. **`BarraUrgencias.tsx` y
  `BarraUrgencias.test.tsx` NO se han modificado**: la opción elegida no lo necesitaba.
- **@s29** — no aplica a este fichero.

CSS emitido (compilado con `sass` + `--load-path=src/styles`): el bloque `span` solo emite el
`@media`; el punto hereda la tinta de la barra.

---

## 3. CASO 2 — `Hero.module.scss:44-47` — RESUELTO, PERO **BLOQUEANTE DE CONTRATO**

### 3.1 Los cinco números que pedía el encargo

Ratio de `--color-acento-tinta` de cada variante contra el color **efectivo** del velo, en la
parada del **92 %** (la que cubre el borde izquierdo, donde vive el cintillo), con la foto de
debajo en sus dos extremos. **Umbral exigido por @s29: 4,5 (texto normal).**

| variante | `--color-tinta` | `--color-acento-tinta` | velo/foto negra | ratio | velo/foto blanca | ratio | veredicto |
|---|---|---|---|---|---|---|---|
| clinica | `#0B1B33` | `#047857` | `#0A192F` | **3,21** | `#1F2D43` | **2,53** | ❌ |
| calida  | `#3B2A12` | `#3F6212` | `#362711` | **2,04** | `#4B3B25` | **1,52** | ❌ |
| tech    | `#F1F5F9` | `#67E8F9` | `#DEE1E5` | **1,10** | `#F2F6F9` | **1,33** | ❌ |
| eco     | `#06301F` | `#065F46` | `#062C1D` | **1,97** | `#1A4131` | **1,48** | ❌ |
| marca   | `#531C4B` | `#48704B` | `#4C1A45` | **2,40** | `#612E59` | **1,81** | ❌ |

**Suspende en las CINCO variantes, y en los dos extremos de foto.** El máximo absoluto de toda
la tabla es 3,21 (clinica), un 29 % por debajo del mínimo.

Por si alguien quisiera argumentar que el cintillo cae más a la derecha, las otras dos paradas:

| variante | parada 72 % (negra / blanca) | parada 22 % (negra / blanca) |
|---|---|---|
| clinica | 3,39 / 1,26 | 3,71 / 3,43 |
| calida  | 2,30 / 1,26 | 2,80 / **4,61** |
| tech    | 1,50 / 1,36 | **8,35** / 1,42 |
| eco     | 2,17 / 1,29 | 2,60 / **4,93** |
| marca   | 2,75 / 1,03 | 3,49 / 3,70 |

En **toda la mitad izquierda** (92 %–72 %), que es donde el cintillo está, no hay un solo valor
que llegue a 4,5. Los tres valores que sí superan el umbral están en la parada del **22 %** —el
extremo derecho del degradado, donde no hay texto— y encima solo con una foto en un extremo
imposible (blanca pura o negra pura). No son un permiso: son el ruido del método.

**Conclusión: `--color-acento-tinta` es inutilizable en el hero. No se fuerza.**

### 3.2 El rol que SÍ cumple

`--color-sobre-primario`, contra el mismo velo y los mismos extremos:

| variante | parada 92 % (negra / blanca) | parada 72 % (negra / blanca) |
|---|---|---|
| clinica | **17,60 / 13,86** | 18,58 / 6,90 |
| calida  | **14,43 / 10,76** | 16,28 / 5,61 |
| tech    | **12,73 / 15,37** | 7,68 / 15,67 |
| eco     | **15,15 / 11,39** | 16,70 / 5,95 |
| marca   | **13,63 / 10,28** | 15,61 / 5,54 |

Aprueba 4,5 en las cinco variantes, en los dos extremos de foto y en las dos paradas de la
mitad izquierda. El peor caso de toda la tabla es 5,54 (marca, 72 %, foto blanca), aún un 23 %
por encima del mínimo.

No es un rol nuevo ni inventado: **es el que `.hero` ya declara en `Hero.module.scss:7**
(`color: var(--color-sobre-primario)`) y el que el titular (`:52`), el párrafo (`:62`) y el
botón secundario (`:83`) ya consumen con `color: inherit`. El cintillo era el único hijo del
hero que se salía.

### 3.3 Contra qué cláusula se argumenta — **BLOQUEANTE**

> **@s33** (`features/rediseno_visual.feature:447`): *«And ese rótulo usa el color de acento
> tinta de la variante activa»*.

Esta cláusula **no se puede cumplir en el hero sin incumplir @s29**:

> **@s29** (`:408`): *«And el texto que va encima alcanza el mínimo de contraste de texto normal
> contra el velo»*.

Argumentación de por qué manda @s29 y no @s33:

1. **@s29 es la cláusula medida; @s33 es la cláusula general.** @s29 fija un umbral numérico
   (4,5) contra un fondo concreto (el velo) y el repositorio tiene la función que lo calcula.
   @s33 nombra un rol. Cuando una regla de nombre choca con una regla de umbral verificable,
   la que se puede refutar con números es la que manda — es exactamente la lección que la
   cabecera de este contrato (`:52-60`) ya aprendió con la enmienda: *«se permite el token y se
   vigila su USO»*.
2. **El `When` de @s33 no alcanza al hero.** Dice *«se recorren las secciones con titular
   propio»*, y sus tres fondos son `--color-fondo`, `--color-fondo-alterno` y
   `--color-superficie`, que es justo donde la matriz de uso ya valida `acento-tinta`
   (`matrizDeContraste.ts:271-273`). El hero no es una de esas secciones: lleva el `h1` del
   documento, no un `h2` de sección, y es **el único módulo del sitio que pinta texto sobre una
   fotografía**. @s29 existe precisamente porque el hero es el caso excepcional.
3. **El propio contrato ya tiene el precedente.** @s7 establece que sobre un relleno saturado la
   tinta es SIEMPRE `--color-sobre-primario` de esa variante. El velo del hero es un relleno
   saturado de `--color-tinta` al 92 %. Aplicar `--color-sobre-primario` no es una excepción
   inventada: es la misma regla, aplicada al mismo tipo de fondo.

**Lo que se pide al contrato (acción del `craftsman_lead`, no de este agente):** enmendar @s33
para exceptuar el cintillo del hero, con una redacción del tipo *«ese rótulo usa el color de
acento tinta de la variante activa, salvo el cintillo de la sección de bienvenida, que va sobre
el velo y usa el color sobre-primario de su variante por @s29»*. **Mientras esa enmienda no
exista, @s33 queda formalmente incumplido en un punto (el cintillo del hero) y este informe lo
declara BLOQUEANTE.** No se ha inventado comportamiento: se ha aplicado la única salida que deja
la suite verde sin violar un umbral WCAG medido, y se ha dejado escrito en el propio fichero.

### 3.4 Cómo se ha implementado

```scss
  > p:first-child {
    @include eyebrow;
    border-color: currentColor;
    color: inherit;
  }
```

`color: inherit` y no `color: var(--color-sobre-primario)` por dos motivos: (a) el hero ya lo
declara en `:7` y reescribirlo duplicaría el token en el mismo fichero; (b) es exactamente el
mecanismo que ya usan `h1`, el párrafo y el botón secundario del mismo bloque — un solo patrón,
no dos. El CSS compilado confirma que la declaración cae **después** del `color:
var(--color-acento-tinta)` que inyecta el mixin `eyebrow` (`_api.scss:331`), misma
especificidad, así que gana:

```css
.contenido > p:first-child {
  ...
  color: var(--color-acento-tinta);
  border-color: currentColor;
  color: inherit;
}
```

**Observación no corregida (fuera del rojo):** `border-color: currentColor` (`:45`) es una
declaración inerte — el cintillo no declara `border-style` ni `border-width`, así que no pinta
nada, antes y después de este fix. Se deja intacta para que el diff sea exactamente el del rojo;
si el `craftsman_lead` quiere limpiarla, es una decisión aparte.

---

## 4. Reglas duras del repositorio — comprobadas

- **Sin hexadecimales a mano en `.module.scss`.** Los dos cambios usan `inherit` y herencia; cero
  literales. `puertaLiteralesColor.test.ts` verde, y la puerta real sobre los 18 módulos
  (`inventarioModulos.test.ts`) también. Cuidado añadido: esa puerta **no filtra comentarios** y
  prohíbe los 16 nombres de color CSS y cualquier `#XXXXXX` — por eso los comentarios nuevos
  citan **ratios**, nunca hexadecimales.
- **Nada afirmado sobre `className`.** No se ha tocado ningún test de componente; los CSS Modules
  siguen desactivados en Vitest.
- **Comentarios en español, explicando el PORQUÉ y citando la fuente.** Los dos bloques nuevos
  citan `@s7`/`@s15`/`@s29`/`@s33`, `BarraUrgencias.tsx:10`, `matrizDeContraste.ts:268`,
  `Hero.module.scss:7` y `:15-20`, y publican los ratios medidos.
- **La puerta no se ha debilitado.** `src/lib/diseno/usoDelAcento.ts` y
  `usoDelAcento.test.ts` no aparecen en el diff.
- **No se ha ejecutado** `pnpm run build`, `vite build`, `playwright test`, `vite preview` ni
  `stryker run`.

---

## 5. Verificación (salida literal)

### 5.1 Los tres ficheros del encargo

```
$ pnpm exec vitest run src/lib/diseno/usoDelAcento.test.ts src/components/BarraUrgencias.test.tsx src/lib/puertaLiteralesColor.test.ts

 RUN  v4.1.10 C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria


 Test Files  3 passed (3)
      Tests  17 passed (17)
   Start at  21:17:14
   Duration  3.69s (transform 2.35s, setup 1.38s, import 2.43s, tests 276ms, environment 4.65s)
```

### 5.2 La suite entera

```
$ pnpm run test

> galapavet-web@0.0.0 test C:\Users\vhurt\OneDrive\Escritorio\Proyectos\CenitDigitalProyectosCodigo\GalapavetClinicaVeterinaria
> vitest run


 RUN  v4.1.10 C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria


 Test Files  87 passed (87)
      Tests  1117 passed (1117)
   Start at  21:16:23
   Duration  37.80s (transform 25.92s, setup 140.62s, import 50.98s, tests 79.36s, environment 464.40s)
```

### 5.3 Lint y typecheck

```
$ pnpm run lint

> galapavet-web@0.0.0 lint C:\Users\vhurt\OneDrive\Escritorio\Proyectos\CenitDigitalProyectosCodigo\GalapavetClinicaVeterinaria
> oxlint --deny-warnings

codigo de salida lint: 0

$ pnpm run typecheck

> galapavet-web@0.0.0 typecheck C:\Users\vhurt\OneDrive\Escritorio\Proyectos\CenitDigitalProyectosCodigo\GalapavetClinicaVeterinaria
> tsc -b

codigo de salida typecheck: 0
```

`oxlint --deny-warnings` no imprime resumen cuando no hay hallazgos: los 0 errores y 0
advertencias son el código de salida 0 con salida vacía.

### 5.4 Comprobación extra: el SCSS compila

Como `pnpm run build` está prohibido en esta sesión, los dos módulos se han compilado
aisladamente con el mismo preámbulo que inyecta `vite.config.ts`
(`additionalData: '@use "api" as *;'`) y el mismo `loadPaths`:

```
--- BarraUrgencias ---
compila OK
--- Hero ---
compila OK
```

---

## 6. Nota para el orquestador: una inestabilidad AJENA a este fix

Durante la verificación, `src/accesibilidad-teclado.test.tsx` (@s23/@s26/@s27 de
`accesibilidad.feature`) falló de forma **intermitente** en tres pasadas de la suite completa,
siempre con `Error: Test timed out in 5000ms` dentro de bucles de `userEvent.tab()`.

Se ha comprobado que **no lo causa este fix**:

1. Ese fichero no lee ninguno de los dos `.module.scss` tocados (los CSS Modules están
   desactivados en Vitest: devuelven un proxy; el texto real solo lo leen las puertas de
   `src/lib/diseno/**`).
2. Ejecutado en aislamiento pasa siempre: 5/5 en dos intentos consecutivos.
3. **A/B explícito:** revirtiendo los dos ficheros al estado anterior y relanzando la suite
   completa, el fallo de `accesibilidad-teclado.test.tsx` **seguía apareciendo** (2 fallos: el de
   la puerta del acento, esperado, más este).
4. Con `pnpm exec vitest run --maxWorkers=4` (menos contención de CPU) la suite da
   **87/87 ficheros y 1117/1117 tests** en verde.

Causa: contención de CPU por otros agentes trabajando en el mismo árbol. La pasada de §5.2 es
una ejecución limpia de `pnpm run test` con los 1117 tests verdes. **Recomendación**: si el
`judge` o el `mutation_tester` ven ese fichero en rojo, no es una regresión de este fix; puede
merecer un `testTimeout` propio para esos bucles de tabulación.

---

## 7. Diff completo

```diff
--- a/src/components/BarraUrgencias.module.scss
+++ b/src/components/BarraUrgencias.module.scss
@@ -15,9 +15,19 @@
   font-weight: 700;
   text-align: center;

+  // El indicador pulsante es el punto decorativo de `BarraUrgencias.tsx:10`
+  // (`aria-hidden`, sin papel semántico). NO declara tinta propia: hereda la
+  // de la barra (:13), porque @s7 exige que lo que se pinta sobre
+  // --color-urgencia sea SIEMPRE --color-sobre-primario de esa misma variante,
+  // y @s15 prohíbe el acento saturado como valor de "color".
+  //
+  // Medido con `src/lib/contraste.ts` contra --color-urgencia de cada variante
+  // (clinica · calida · tech · eco · marca): --color-sobre-primario da
+  // 4,83 · 5,18 · 6,04 · 4,83 · 4,83, la fila que la matriz de uso ya declara
+  // (`src/lib/diseno/matrizDeContraste.ts:268`). El acento daba
+  // 1,90 · 1,04 · 1,53 · 1,61 · 2,56: por debajo de 3 en las cinco, así que
+  // convertirlo en forma rellena habría dejado un indicador que no indica.
   span {
-    color: var(--color-acento);
-
     @media (prefers-reduced-motion: no-preference) {
       animation: pulso 1.6s ease-in-out infinite;
     }

--- a/src/components/Hero.module.scss
+++ b/src/components/Hero.module.scss
@@ -40,10 +40,22 @@
   margin-inline: auto;
   padding-block: clamp(80px, 9vw, 144px);

+  // BLOQUEANTE declarado en `progress/rediseno/fix_uso_del_acento.md`: @s33
+  // pide --color-acento-tinta para el cintillo de cada sección, pero ESTE
+  // cintillo va encima del velo del hero (:15-20) y @s29 exige que el texto
+  // sobre el velo alcance 4,5 (texto normal). Medido con `src/lib/contraste.ts`
+  // en la parada de 92 %, con la foto de debajo en sus dos extremos (la más
+  // oscura y la más clara posibles), --color-acento-tinta da
+  // 3,21/2,53 · 2,04/1,52 · 1,10/1,33 · 1,97/1,48 · 2,40/1,81 en clinica ·
+  // calida · tech · eco · marca: SUSPENDE en las cinco. La tinta que sí cumple
+  // es --color-sobre-primario —la que .hero ya declara (:7) y que el titular y
+  // el párrafo consumen con "inherit"—, con 17,60/13,86 · 14,43/10,76 ·
+  // 12,73/15,37 · 15,15/11,39 · 13,63/10,28. Hasta que el contrato exceptúe el
+  // hero en @s33, manda la cláusula medida.
   > p:first-child {
     @include eyebrow;
     border-color: currentColor;
-    color: var(--color-acento);
+    color: inherit;
   }
```

`src/components/BarraUrgencias.tsx` y `src/components/BarraUrgencias.test.tsx`: **sin cambios**.

---

## 8. Resumen para el `craftsman_lead`

| # | Fichero | Decisión | Escenarios que honra | Pendiente |
|---|---|---|---|---|
| 1 | `BarraUrgencias.module.scss:18-20` | El `●` hereda `--color-sobre-primario` (se borra la declaración). Descartada la forma rellena: el acento da 1,04-2,56 sobre el rojo, por debajo de 3 en las cinco variantes | @s15 ✅ · @s7 ✅ (además repara una infracción no señalada) · @s27 ✅ (sigue pulsando, sigue apagándose con reduced-motion) | — |
| 2 | `Hero.module.scss:44-47` | `color: inherit` (= `--color-sobre-primario`). `--color-acento-tinta` suspende 4,5 en las CINCO variantes (máx. 3,21) | @s15 ✅ · @s29 ✅ | **@s33 BLOQUEANTE**: hay que enmendar el contrato para exceptuar el cintillo del hero |
