# Enmiendas al contrato `features/rediseno_visual.feature`

> **Las tres enmiendas de este documento las aprobó el humano** (1 y 2 el
> 26/08/2026, 3 el 28/08/2026). No son una reinterpretación del contrato hecha
> desde la implementación: son discrepancias que la implementación **midió**,
> escaló sin resolverlas por su cuenta, y que el humano resolvió. Aquí queda
> el **antes y el después literal** de cada cláusula, para que la enmienda se
> pueda auditar sin abrir el historial de git.
>
> Ninguna enmienda renumera ni reordena escenarios. Los tags `@sNN` se
> conservan tal cual: `@s1`..`@s52` antes y después.
>
> Las tres quedan además registradas en `project-spec.md`, sección «Rediseño
> visual — nueva feature: `rediseno_visual` (feature 24)», con sus Decisiones
> **58**, **59** y **60** en la tabla de decisiones del documento.

---

## Enmienda 1 — @s3 «Los cuatro temas importados valen exactamente lo que declara el prototipo»

### Qué se midió

La cláusula original obligaba a que el valor de cada rol coincidiera carácter a
carácter «salvo en las **tres** desviaciones declaradas de @s6 y @s7». Al
medirlo contra el texto real de
`docs/diseno-claude-design/Veterinaria La Sierra.dc.html` (citado `VLS`) salen
**siete** parejas que no pueden coincidir literalmente, porque el prototipo las
declara con alfa y el sistema declara los veinte roles de color como
hexadecimal opaco:

| # | Variante | Rol del prototipo | Valor en el prototipo | Cita |
| - | -------- | ----------------- | --------------------- | ---- |
| 1 | `clinica` | `--border` | `rgba(15,32,60,.13)` | VLS:20 |
| 2 | `calida` | `--border` | `rgba(120,53,15,.16)` | VLS:28 |
| 3 | `tech` | `--border` | `rgba(148,197,255,.18)` | VLS:36 |
| 4 | `eco` | `--border` | `rgba(4,120,87,.16)` | VLS:44 |
| 5 | `tech` | `--accent-soft` | `rgba(6,182,212,.14)` | VLS:38 |
| 6 | `tech` | `--urg-soft` | `rgba(248,113,113,.16)` | VLS:39 |
| 7 | `calida` | `--muted` | `#8A6C45` | VLS:28 |

La séptima no es de alfa: es el suspenso de contraste que @s6 ya corrige
(4.37 sobre el fondo alterno de su variante, por debajo del 4.5).

Dos mediciones más, que son las que decidieron la enmienda:

- La primera implementación reconcilió el número **apartando** las cuatro
  parejas de `--border` sin comparar nada. El precio: daba por **VERDE**
  `--color-borde: #FF0000` y `--color-borde: #000000`.
- El `--color-borde` de `clinica` valía `#D8E0EA`, que **no** es la composición
  del `rgba(15,32,60,.13)` del prototipo ni sobre `--color-fondo`
  (`mezclar('#F8FAFC', '#0F203C', 0.13)` = `#DADEE3`) ni sobre
  `--color-superficie` (`#E0E2E6`): un número sin derivación trazable que
  **ningún test del repositorio fijaba**.

### Qué decidió el humano

**Derivar el borde y enmendar.** Los cuatro `--color-borde` dejan de ser
desviaciones y pasan a ser derivaciones verificables, con **una sola** regla de
composición para las cuatro variantes, escrita por extenso en
`src/styles/_tokens.scss`. Las desviaciones que quedan se escriben por **lista**
—nombre a nombre y motivo a motivo—, nunca por recuento. Y la comparación de un
rol translúcido exige el valor **compuesto**, no un hexadecimal cualquiera.

### ANTES (literal, 1 línea)

```gherkin
    And el valor coincide carácter a carácter, salvo en las tres desviaciones declaradas de @s6 y @s7
```

### DESPUÉS (literal, 9 líneas)

```gherkin
    And en todo rol que el prototipo declara opaco el valor coincide carácter a carácter, salvo en las desviaciones que este escenario enumera por su nombre
    And los cuatro "--color-borde" no se apartan de la comparación: se DERIVAN, componiendo el rgba del prototipo sobre el rol de fondo de su propia variante con la función de mezcla del repositorio, "mezclar(fondo de la variante, color del rgba, alfa del rgba)"
    And esa regla de composición es UNA sola para las cuatro variantes y queda escrita por extenso en "src/styles/_tokens.scss", igual que la del rojo de urgencia
    And en "clinica" el valor exigido es el de "mezclar('#F8FAFC', '#0F203C', 0.13)", que da "#DADEE3", de modo que el "#D8E0EA" declarado hasta esta enmienda —que no es la composición ni sobre el fondo ni sobre la superficie— sale en rojo
    And la comparación de un rol que el prototipo declara translúcido nunca se da por buena con un hexadecimal cualquiera: exige el valor COMPUESTO, así que "--color-borde: #FF0000" y "--color-borde: #000000" salen en rojo
    And las desviaciones que quedan se declaran por LISTA, con su nombre y su motivo, y ninguna aserción las cuenta: añadir o quitar una obliga a enmendar este contrato
    And "tech --color-acento-suave" es desviación declarada, porque el prototipo lo escribe con alfa solo en ese tema —"rgba(6,182,212,.14)"— mientras que en "clinica", "calida" y "eco" lo da opaco y el sistema lo copia carácter a carácter: no hay regla uniforme que derivar y el opaco de "tech" lo pone el repositorio
    And "tech --color-urgencia-suave" es desviación declarada por el mismo motivo, sobre "rgba(248,113,113,.16)"
    And "calida --color-texto-suave" es desviación declarada porque el "#8A6C45" del prototipo da 4.37 sobre el fondo alterno de su variante y suspende el mínimo de 4.5 que @s6 exige
```

El resto de cláusulas de @s3 (los dos `Given`, el `When`, el primer `Then`, «el
recuento de roles efectivamente comparados es mayor que 0» y «si el prototipo
cambiara un solo hexadecimal, esta comprobación fallaría») quedan **intactas**.
Se añade por delante del tag un bloque de comentario que documenta la enmienda,
su fecha y su medición.

### Efecto colateral que la enmienda cierra

`progress/rediseno/tdd_fidelidad-prototipo.md` §2.1 devolvió una aclaración
pendiente: de las tres desviaciones, @s6 nombraba la primera y @s7 la familia de
urgencia, pero **`tech --accent-soft` no lo nombraba ninguno de los dos**. Al
escribirse la lista entera dentro de @s3, esa ambigüedad desaparece.

---

## Enmienda 2 — @s33 «Cada sección de la portada abre con su cintillo en versalitas»

### Qué se midió

La cláusula original exigía acento tinta en **todos** los cintillos. Pero el de
la sección de bienvenida va encima del velo fotográfico, y @s29 le exige a ese
texto el mínimo de texto normal (**4.5**). Medido con `src/lib/contraste.ts` en
la parada del **92 %** del velo (`src/components/Hero.module.scss:17`), con la
fotografía de debajo en sus dos extremos (la más oscura y la más clara
posibles):

| Variante | `--color-acento-tinta` (foto oscura / clara) | `--color-sobre-primario` (foto oscura / clara) |
| -------- | -------------------------------------------- | ---------------------------------------------- |
| `clinica` | **3.21** / **2.53** | 17.60 / 13.86 |
| `calida` | **2.04** / **1.52** | 14.43 / 10.76 |
| `tech` | **1.10** / **1.33** | 12.73 / 15.37 |
| `eco` | **1.97** / **1.48** | 15.15 / 11.39 |
| `marca` | **2.40** / **1.81** | 13.63 / 10.28 |

`--color-acento-tinta` **suspende en las cinco variantes por los dos extremos**.
La tinta que sí cumple es la que la propia sección ya declara para el resto de
su texto, `--color-sobre-primario`, que aprueba el 4.5 en las cinco por los dos
extremos (mínimo 10.28).

El bloqueo lo documentó la implementación en
`progress/rediseno/fix_uso_del_acento.md` y lo dejó anotado en
`src/components/Hero.module.scss:44-55`, con la frase «Hasta que el contrato
exceptúe el hero en @s33, manda la cláusula medida» — es decir, escaló la
contradicción en vez de resolverla por su cuenta.

### Qué decidió el humano

**Exceptuar el hero en @s33.** La cláusula pasa a exigir acento tinta en toda
sección con fondo de **token**, y declara por escrito la excepción de la sección
de bienvenida —que va sobre fotografía con velo— con los ratios medidos como
motivo. La excepción queda **medible**, no como nota al pie: el escenario
distingue las secciones con fondo de token de la que va sobre imagen, y afirma
los dos recuentos, de modo que la excepción no puede crecer sin enmendar otra
vez el contrato.

### ANTES (literal, 2 líneas no contiguas)

```gherkin
    And ese rótulo usa el color de acento tinta de la variante activa
```

```gherkin
    And el recuento de secciones efectivamente comprobadas es mayor que 0
```

### DESPUÉS (literal)

La primera pasa a ser cuatro cláusulas:

```gherkin
    And las secciones se reparten en dos grupos por un criterio medible: las que pintan su fondo con un rol de color del sistema y la que lo pinta con la fotografía a sangre de @s29
    And en toda sección cuyo fondo es un rol de color del sistema ese rótulo usa el color de acento tinta de la variante activa
    And la sección de bienvenida queda exceptuada, y su cintillo usa "--color-sobre-primario", la misma tinta que esa sección ya declara para el resto de su texto
    And el motivo de la excepción es medido y queda escrito: sobre la parada del 92 % del velo, "--color-acento-tinta" da 3.21 · 2.04 · 1.10 · 1.97 · 2.40 en "clinica", "calida", "tech", "eco" y "marca" con la fotografía más oscura, y 2.53 · 1.52 · 1.33 · 1.48 · 1.81 con la más clara, y suspende el mínimo de 4.5 de texto normal en las cinco
    And "--color-sobre-primario" sobre ese mismo velo da 17.60 · 14.43 · 12.73 · 15.15 · 13.63 con la fotografía más oscura y 13.86 · 10.76 · 15.37 · 11.39 · 10.28 con la más clara, y aprueba el 4.5 en las cinco por los dos extremos
```

Y la del recuento pasa a afirmar los **dos** grupos:

```gherkin
    And el recuento de secciones con fondo de token efectivamente comprobadas es mayor que 0, y el de secciones sobre fotografía es exactamente 1
```

El `Given`, el `When`, el primer `Then` («cada una lleva por delante un rótulo
corto en mayúsculas con espaciado entre letras») y «el rótulo no es un
encabezado, para no romper la jerarquía de niveles» quedan **intactos**. Se
añade por delante del tag un bloque de comentario que documenta la enmienda, su
fecha y su medición.

---

## Enmienda 3 — @s8 «El borde de control existe en las cinco variantes y cumple el mínimo de componentes de interfaz»

### Qué se midió

La cláusula original afirmaba que `--color-borde-control` «se deriva por
mezcla del primario con el fondo de cada variante, con la regla escrita en el
propio fichero». Medido recorriendo `mezclar(fondo, primario, p)` para `p` de
0 % a 100 % con la función real `src/lib/diseno/mezclaDeColor.ts`
(`progress/rediseno/tdd_matriz-de-contraste.md`, sección «BLOQUEANTE 2»):

| Variante | `--color-borde-control` | ¿Es mezcla de fondo y primario? |
| --- | --- | --- |
| clinica | `#5E6E88` | NO — es el `--muted` del prototipo |
| calida | `#8A6C45` | NO — es el `--muted` del prototipo |
| tech | `#94C5FF` | NO — es el `rgb()` del `--border` del prototipo (`rgba(148,197,255,.18)`) |
| eco | `#557368` | NO — es el `--muted` del prototipo |
| marca | `#A06997` | SÍ — `mezclar('#FFFFFF', '#77286B', 0.7)` |

Y `_tokens.scss` **no contiene ninguna regla escrita** de derivación para este
rol.

La parte medible de @s8 **sí está y sigue cubierta**: las cinco variantes
declaran el rol y su ratio de contraste alcanza el mínimo de 3 contra su
propio fondo (medido: clinica 4.94 · calida 4.72 · tech 9.94 · eco 5.20 ·
marca 4.23), y «el prototipo no modela este rol» también está cubierto
(inventario de 18 roles del prototipo, ninguno es borde de control). Lo único
que falla es la afirmación sobre el MECANISMO de derivación.

### Qué decidió el humano

Preguntado directamente: «¿Cómo resuelvo este bloqueante: (a) enmendar el
contrato para que @s8 diga lo que el sistema realmente hace —importa el valor
propio del prototipo por variante (ya verificado y testeado), salvo en
"marca" donde sí es una mezcla genuina—, sin cambiar ningún hexadecimal ya
aprobado; o (b) rederivar los 4 valores por mezcla, cambiando el aspecto
visual de los 4 bordes de control sin ninguna ganancia medible de
contraste?». **El humano eligió la opción (a): enmendar el contrato.** No se
toca ningún valor de color ya aprobado ni testeado; @s8 pasa a describir con
precisión lo que el sistema hace de verdad: las cuatro variantes importadas
del prototipo declaran el valor que ya trae su propio tema, y solo `marca`
—que no tiene tema propio en el prototipo— deriva por mezcla del primario con
el fondo, con la regla escrita en `_tokens.scss`.

### ANTES (literal, 1 línea)

```gherkin
    And el prototipo no modela este rol, así que su valor se deriva por mezcla del primario con el fondo de cada variante, con la regla escrita en el propio fichero
```

### DESPUÉS (literal, 5 líneas)

```gherkin
    And el prototipo no modela este rol: su inventario de dieciocho roles no incluye ningún borde de control
    And por eso cada variante lo resuelve a su manera, y esa manera se declara aquí por su nombre, no por una regla única para las cinco
    And "clinica", "calida" y "eco" importan el valor que ya trae el "--muted" del tema de su propia variante en el prototipo versionado "docs/diseno-claude-design/Veterinaria La Sierra.dc.html": "#5E6E88", "#8A6C45" y "#557368" respectivamente
    And "tech" importa el mismo rol de otra fuente de su propio tema: el "rgb()" del "--border" translúcido del prototipo, "rgba(148,197,255,.18)", que da "#94C5FF"
    And "marca", que no tiene tema propio en el prototipo, es la ÚNICA variante donde el valor SÍ se deriva por mezcla del primario con el fondo, "mezclar('#FFFFFF', '#77286B', 0.7)" = "#A06997", con la regla escrita por extenso en "src/styles/_tokens.scss"
```

El resto de cláusulas de @s8 (el `Given`, el `When`, «las cinco variantes
declaran ese rol» y «el ratio alcanza al menos 3 en las cinco») quedan
**intactas**. Se añade por delante del tag un bloque de comentario que
documenta la enmienda, su fecha y su medición.

### Efecto colateral que la enmienda cierra

`progress/rediseno/tdd_matriz-de-contraste.md` §5, BLOQUEANTE 2, quedaba
abierto sin decisión de contrato posible desde la implementación. Con esta
enmienda el bloqueante se cierra: no hace falta rederivar ningún hexadecimal
ya aprobado. `matrizDeContraste.test.ts` (mapa cláusula → aserción de ese
mismo informe, §2, fila @s8) ya cubre la existencia del rol y su ratio ≥ 3 en
las cinco, y el inventario de 18 roles del prototipo; queda pendiente para el
`tdd_craftsman` añadir la comprobación de la segunda mitad de la cláusula —que
`clinica`, `calida` y `eco` importan el `--muted` de su propio tema, que
`tech` importa el `rgb()` de su `--border`, y que `marca` deriva por
mezcla— igual que ya hizo para @s3 con `fidelidadPrototipo.test.ts`.

---

## Lo que estas enmiendas NO hacen

- **No tocan `src/` ni `tests/`.** Escribir las cláusulas es el contrato;
  cumplirlas es trabajo del `tdd_craftsman`, en Rojo → Verde → Refactor.
- **No renumeran ni reordenan escenarios**, ni tocan ningún escenario que no sea
  @s3, @s8 y @s33.
- **No hablan de clases CSS** en ningún `Then`: la regla dura de
  `features/identidad_visual.feature:156-165` sigue vigente, porque los tests
  corren con los CSS Modules desactivados.
- **No reabren la decisión.** Las tres las tomó el humano —1 y 2 el
  26/08/2026, 3 el 28/08/2026— y aquí solo quedan redactadas y trazadas.

## Trabajo que estas enmiendas dejan pedido

Queda para el `tdd_craftsman`, y no está hecho al escribir este documento:

1. Los cuatro `--color-borde` de `clinica`, `calida`, `tech` y `eco` **cambian
   de valor**: hoy valen `#D8E0EA`, `#E8D7BA`, `#405474` y `#C6E4D7`, y ninguno
   es la composición que @s3 pasa a exigir.
2. La regla de composición hay que **escribirla por extenso** en
   `src/styles/_tokens.scss`, junto a la que ya documenta el rojo de urgencia.
3. La comprobación de fidelidad tiene que **dejar de apartar** las cuatro
   parejas de `--border` y pasar a compararlas contra el valor compuesto.
4. El cintillo del hero (`src/components/Hero.module.scss`) puede dejar de estar
   marcado como BLOQUEANTE: el contrato ya lo exceptúa.
5. `matrizDeContraste.test.ts` tiene que **añadir la aserción** de la segunda
   mitad de la cláusula 3 de @s8 (Enmienda 3): que `clinica`, `calida` y `eco`
   importan el `--muted` de su propio tema del prototipo, que `tech` importa
   el `rgb()` de su `--border`, y que `marca` deriva por
   `mezclar('#FFFFFF', '#77286B', 0.7)`. El BLOQUEANTE 2 de
   `progress/rediseno/tdd_matriz-de-contraste.md` §5 puede dejar de estar
   marcado como tal: el contrato ya lo resuelve.
