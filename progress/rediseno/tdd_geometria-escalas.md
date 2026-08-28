# TDD — Hallazgo 3 de la segunda revisión del `judge` (@s19, ritmo vertical fluido)

Sesión encargada por `craftsman_lead` tras `progress/judge_rediseno_visual.md`
(segunda revisión, CHANGES_REQUESTED). Esta nota es también la que resuelve la
cita rota de `tests/e2e/geometria-escalas.spec.ts:8-9` ("ver
`progress/rediseno/tdd_geometria-escalas.md`"), que apuntaba a un fichero que
no existía.

## El defecto, tal y como lo dejó el judge

`features/rediseno_visual.feature:379-385` (@s19) exige, con la herramienta
explícita del bloque C ("navegador real, Playwright, sobre el artefacto de
producción"): medir el `padding-block` de una sección de contenido a 320px y
a 1440px de ancho de ventana, que sea fluido (mayor a 1440 que a 320), que al
menos una sección declare un relleno menor que las demás (ya cubierto por
`CampanasPortada.test.tsx`, describe `@s19`, para la variante compacta), y
que ninguna sección conserve el relleno plano histórico de 64px en los dos
extremos.

Antes de esta sesión no existía NINGÚN test de navegador real para esta
cláusula (el único test de `@s19` en todo el repo era el de Vitest de
`CampanasPortada.test.tsx`, que solo compara literales de `global.scss`
contra el `?raw` del propio `.module.scss`, sin medir nunca un
`getComputedStyle` real). Además, CINCO hojas de estilos de componente
declaraban, sobre el MISMO elemento que ya recibe `padding-block:
var(--ritmo-seccion)` desde `Landing.module.scss:18-27,39-48` (`.seccion >
*` / `.seccionAlterna > *`, con especificidad idéntica, una clase cada
regla), un `padding-block: espaciado(64);` fijo y muerto:

- `src/components/Equipo.module.scss:8`
- `src/components/Servicios.module.scss:10`
- `src/components/Faq.module.scss:5`
- `src/components/Galeria.module.scss:20`
- `src/components/ReservaChat.module.scss:9`

## Paso 1 — Verificación propia de la fuente de verdad (antes de tocar nada)

Leí `src/pages/Landing.module.scss` (líneas 1-17: el propio comentario de
cabecera documenta que "el CONTENEDOR... ese trabajo lo hace este único
punto", refiriéndose a `.seccion > *`/`.seccionAlterna > *`) y
`src/pages/Landing.tsx` (líneas 51-73): confirmé que las 5 secciones citadas
son hijas directas de un `<div id="…" className={styles.seccion |
seccionAlterna}>`, y que su propio `<section>`/elemento raíz es exactamente
el "hijo directo" que ese selector universal `> *` alcanza. Es decir: las 5
declaraciones locales de `padding-block: espaciado(64)` compiten, sin
ninguna razón documentada, contra la que el propio wrapper ya declara como su
responsabilidad única.

Después de retirar las 5 líneas (paso 3) confirmé la hipótesis con un
sabotaje real en navegador (ver paso 2 abajo) y con la suite `e2e` completa
en verde tras el cambio (paso 5): el comportamiento visible no cambia (el
wrapper YA ganaba la cascada antes de mi cambio, tal y como había medido el
`judge`), solo desaparece el código muerto y la fragilidad de que cualquier
reordenación de imports o un aumento de especificidad lo volcara sin aviso.

## Paso 2 — Escribir el test de navegador real (RED que pasa a la primera, y por qué no basta con eso)

Añadí en `tests/e2e/geometria-escalas.spec.ts` (líneas ~168-225) el bloque
`test.describe('@s19 el ritmo vertical de las secciones es fluido y alterna,
en vez de ser plano', …)`, que navega a `Equipo` (`#equipo > *`, sección "de
contenido" no compacta) a 320px y luego a 1440px de ventana, mide
`padding-top`/`padding-bottom` computados por separado (helper
`paddingBlockPx`, líneas 74-85), y comprueba:

- el relleno a 1440px es mayor que a 320px (fluido, no plano);
- ninguno de los dos extremos es 64px (relleno plano histórico);
- los dos valores caen dentro de `clamp(72px, 7.2vw, 104px)` con tolerancia
  de redondeo, y coinciden con los literales calculados a mano (72px a 320,
  103.68px a 1440 — `1440 * 0.072`).

Lo ejecuté **antes** de tocar ninguna hoja de estilos (con las 5
declaraciones muertas todavía presentes):

```
pnpm exec playwright test tests/e2e/geometria-escalas.spec.ts --workers=1 --reporter=list -g "@s19"
…
✓ 1 tests\e2e\geometria-escalas.spec.ts:197:3 › @s19 … (180ms)
1 passed (8.2s)
```

**Pasó a la primera.** Esto confirma exactamente el diagnóstico del `judge`:
hoy el wrapper ya gana la cascada por accidente de orden de bundle, así que
el sitio real ya se comporta bien — pero ningún test lo protegía. Siguiendo
la regla del propio protocolo ("un test que pasa a la primera no demuestra
nada: ajústalo o sospecha"), no me conformé con esto: sabotee producción
para demostrar que el test SÍ tiene poder de discriminación real.

### Sabotaje real (documentado y revertido)

Añadí temporalmente `!important` a la línea muerta de `Equipo.module.scss`
(`padding-block: espaciado(64) !important;`), forzando que la regla local
ganara la cascada por especificidad efectiva, y repetí el mismo comando:

```
pnpm exec playwright test tests/e2e/geometria-escalas.spec.ts --workers=1 --reporter=list -g "@s19"
…
✘ 1 tests\e2e\geometria-escalas.spec.ts:197:3 › @s19 …

  Error: padding-top a 1440px frente a 320px
  expect(received).toBeGreaterThan(expected)
  Expected: > 64
  Received:   64
```

El test detecta de inmediato el relleno plano si la regla muerta gana. Con
esto demostrado, revertí el sabotaje (quité el `!important`) y, en el mismo
cambio, retiré la línea entera `padding-block: espaciado(64);` de
`Equipo.module.scss` — ya no como sabotaje, sino como la corrección real.

## Paso 3 — Retirar las cinco declaraciones muertas

Retiradas, cada una la única línea `padding-block: espaciado(64);` de su
regla raíz, sin tocar nada más de cada fichero:

- `src/components/Equipo.module.scss` (línea 8 original)
- `src/components/Servicios.module.scss` (línea 10 original — mismo fichero
  que el Hallazgo 1; confirmado que sigue así tras añadir el cintillo)
- `src/components/Faq.module.scss` (línea 5 original)
- `src/components/Galeria.module.scss` (línea 20 original)
- `src/components/ReservaChat.module.scss` (línea 9 original)

En los cinco añadí una frase al comentario de cabecera ya existente
("El fondo/color de esta sección los pinta el wrapper de
`Landing.module.scss`…") explicando que el relleno vertical también es
responsabilidad única de ese wrapper, y por qué antes no lo era (declaración
muerta, retirada tras este hallazgo), con referencia a este mismo informe —
para que nadie la reintroduzca por descuido.

## Paso 4 — Grep de cierre sobre TODO `src/components/` y `src/pages/`

```
grep -rn "padding-block: espaciado(64)" src/
src\pages\PaginaTienda.module.scss:3:  padding-block: espaciado(64);
src\pages\PaginaBlog.module.scss:3:  padding-block: espaciado(64);
src\pages\PaginaCampanas.module.scss:3:  padding-block: espaciado(64);
```

Solo quedan las 3 páginas independientes (`PaginaTienda`, `PaginaBlog`,
`PaginaCampanas`). Verifiqué que NO son una sexta instancia del mismo
defecto: su raíz es un `<main id="contenido-principal"
className={styles.pagina}>` (`grep -n "className={styles.pagina}"` en los
tres `.tsx`, confirmado con `<main>` en los tres), no un hijo de
`Landing.module.scss` (`.seccion`/`.seccionAlterna` solo envuelve secciones
de la portada `/`, `Landing.tsx`). Cada una de esas tres páginas ya declara
su propio `@include contenedor;` — es su ÚNICA fuente de `padding-block`, sin
ningún wrapper compitiendo por la misma propiedad del mismo elemento. No hay
ninguna sexta instancia del defecto de clase.

## Paso 5 — Corregir la cita rota

`tests/e2e/geometria-escalas.spec.ts:1-9` decía literalmente: "@s19 no está
en el lote asignado (ver `progress/rediseno/tdd_geometria-escalas.md`)" —
fichero que no existía. Corregido: la cabecera ahora lista `@s19` entre los
escenarios cubiertos por este fichero y ya no cita ningún informe fantasma
(este mismo fichero es, precisamente, el informe que faltaba).

## Paso 6 — Verificación final con evidencia real

- `pnpm run build` (fresco, tras retirar las 5 líneas): verde, CSS
  60.69 kB / gzip 7.50 kB.
- `pnpm exec playwright test tests/e2e/geometria-escalas.spec.ts --workers=1 --reporter=list`:
  **14/14 tests verdes** (los 7 escenarios del bloque C, incluido el nuevo
  @s19).
- `pnpm exec playwright test --workers=1 --reporter=list` (suite `e2e`
  completa): **110/110 verdes** — sin ninguna regresión en `layout.spec.ts`
  ni `rediseno-visual.spec.ts`, que son los que más dependían del alto de
  estas 5 secciones.
- `pnpm exec vitest run` (suite completa): 1229 tests verdes, **1 test rojo
  preexistente y fuera de mi alcance** — ver "Nota sobre un fallo NO mío" más
  abajo.
- `pnpm run lint`: limpio (0 avisos, `oxlint --deny-warnings`).
- `pnpm run typecheck`: limpio (`tsc -b`, 0 errores).

### Nota sobre un fallo NO mío, encontrado durante la verificación final

`pnpm exec vitest run` reporta un test rojo preexistente, ajeno a los dos
hallazgos de esta sesión:

```
FAIL src/imagenes-hrefDeDestino.test.ts > @s19 los seis componentes que
pintan una imagen local llaman a hrefDeDestino… > "PaginaBlog.tsx" llama a
"hrefDeDestino" en sus dos puntos de renderizado de imagen…
AssertionError: expected 3 to be 2
```

Confirmado con `git status`/`git diff --stat` que **no es mío**:
`src/pages/PaginaBlog.tsx`, `src/pages/PaginaBlog.module.scss`,
`src/pages/PaginaBlog.test.tsx` y `src/imagenes-hrefDeDestino.test.ts`
aparecen modificados en el árbol de trabajo SIN que yo los haya tocado en
ningún momento de esta sesión (mi `Edit`/`Write` solo tocó los 8 ficheros de
mi alcance permitido: `Servicios.tsx`, `Servicios.module.scss`,
`Servicios.test.tsx`, `Equipo.module.scss`, `Faq.module.scss`,
`Galeria.module.scss`, `ReservaChat.module.scss`,
`tests/e2e/geometria-escalas.spec.ts`). Por el contenido del diff (imagen +
categoría añadidas a `PaginaBlog.module.scss`/`.tsx`/`.test.tsx`), todo
apunta a que es trabajo en curso, sin terminar de sincronizar, de otra sesión
sobre el HALLAZGO 2 del mismo informe del judge (@s40, el blog) — que
explícitamente NO es mi encargo de hoy y cuyos ficheros no están en mi
alcance permitido ("Si necesitas tocar cualquier otro fichero fuera de esta
lista, PARA y explica el motivo en vez de editarlo"). No lo toco. Se lo
señalo al `craftsman_lead` para que lo enrute a quien esté cerrando el
Hallazgo 2.

## Mapa cláusula @s19 → test

| Cláusula de @s19 | Test |
|---|---|
| "se mide el relleno vertical... a 320 píxeles... y a 1440" | `tests/e2e/geometria-escalas.spec.ts` @s19, mide `#equipo > *` a los dos anchos |
| "a 1440 el relleno de una sección de contenido es mayor que a 320" | mismo test, `expect(a1440.arriba).toBeGreaterThan(a320.arriba)` (+ `abajo`) |
| "al menos una sección declara un relleno vertical menor que las demás, como... campañas" | `CampanasPortada.test.tsx`, describe `@s19` (ya existente, variante compacta) — no duplicado aquí |
| "ninguna sección conserva el relleno plano de 64 píxeles en los dos extremos" | mismo test nuevo, `expect(...).not.toBeCloseTo(64, 0)` en los dos extremos |

## Ficheros tocados en esta sesión (Hallazgo 3)

- `tests/e2e/geometria-escalas.spec.ts` — nuevo test `@s19`, helper
  `paddingBlockPx`, constante `ANCHO_VENTANA_1440_PX`, cabecera corregida.
- `src/components/Equipo.module.scss` — retirada la línea muerta.
- `src/components/Servicios.module.scss` — retirada la línea muerta (además
  del cambio del Hallazgo 1, ver `fix_s33_servicios_eyebrow.md`).
- `src/components/Faq.module.scss` — retirada la línea muerta.
- `src/components/Galeria.module.scss` — retirada la línea muerta.
- `src/components/ReservaChat.module.scss` — retirada la línea muerta.
- `src/pages/Landing.module.scss` — solo leído, no tocado: es la fuente de
  verdad confirmada, no hacía falta modificarlo.

## Estado

Hallazgo 3: **resuelto**. @s19 tiene ahora un test de navegador real (con
sabotaje documentado que demuestra su poder de discriminación), las 5
declaraciones muertas están retiradas, el grep de cierre no encontró una
sexta instancia, y la cita rota está corregida. Suite `e2e` completa e2e y
`geometria-escalas.spec.ts` en verde; `vitest`/`lint`/`typecheck`/`build`
verdes salvo el test preexistente y fuera de mi alcance documentado arriba.
