# Limpieza de los dos hallazgos NO bloqueantes del `judge` (2ª revisión)

Fuente: `progress/judge_rediseno_visual.md`. Dos tareas independientes,
sin ciclo TDD (código muerto a borrar / comentario a corregir, no
comportamiento nuevo).

## Tarea 1 — código muerto en `contratoRedisenho.ts`

**Grep de verificación** (antes de tocar nada):

```
grep -rn "buscarAfirmacionesClinicasProhibidas" src/
```

Resultado: únicamente dos coincidencias, ambas en `src/lib/diseno/`:

- `contratoRedisenho.ts:101` — su propia declaración.
- `contratoRedisenho.test.ts:7` (import) y `:187-192` (el test que la
  ejercita).

Ningún componente, página ni otra puerta del contrato la invoca. El `judge`
tenía razón: es un duplicado de `ejecutarPuertaDeAfirmacionesFalsas`
(`src/lib/diseno/rolesDescartados.ts`), que SÍ tiene el arreglo Unicode de
límite de palabra (`comoAfirmacionDePalabraSuelta`, `rolesDescartados.ts:79-82`)
y que es la que de verdad ejecuta la puerta @s13 en el runtime del proyecto.
`buscarAfirmacionesClinicasProhibidas` seguía usando `String.includes` en
crudo — el mismo patrón que causó el falso positivo con `"365"` dentro de
`"273650"` (`_tokens.scss`, Enmienda 1) antes de que se corrigiera en
`rolesDescartados.ts`.

**Borrado**:

- `src/lib/diseno/contratoRedisenho.ts:101-111` — la función completa. No
  declaraba ningún tipo ni constante propios (usaba `string`/`readonly
  string[]` genéricos), así que no quedó nada huérfano que limpiar.
- `src/lib/diseno/contratoRedisenho.test.ts` — el import de
  `buscarAfirmacionesClinicasProhibidas` y el bloque
  `it('@s13 encuentra afirmaciones clínicas prohibidas y falla cerrada ante
  una lista vacía', …)`. El escenario `@s13` real sigue cubierto — y mejor
  cubierto — por los tests de `rolesDescartados.test.ts` contra
  `ejecutarPuertaDeAfirmacionesFalsas`, que es la función que de verdad se
  usa.

## Tarea 2 — comentario obsoleto en `Hero.module.scss`

`src/components/Hero.module.scss:43-54` (antes de editar) describía la
excepción del hero a `--color-acento-tinta` como un "BLOQUEANTE" a la
espera de que "el contrato exceptúe el hero en @s33" — un "hasta que"
provisional. Pero la Enmienda 2 del contrato
(`features/rediseno_visual.feature:509-538`, aprobada por el humano el
26/08/2026) YA exceptuó el hero de forma permanente y medible: `@s33`
(línea 536) fija explícitamente que "la sección de bienvenida queda
exceptuada, y su cintillo usa `--color-sobre-primario`". El código en sí
era correcto (usa `--color-sobre-primario`, no `--color-acento-tinta`);
solo el comentario inducía a pensar que seguía siendo un bloqueante
pendiente de resolución de contrato.

**Cambio**: reescrito el comentario para describir el estado real y
permanente — cita la Enmienda 2 y su rango de líneas en el `.feature`
(`@s33`, 509-538) como fuente de la decisión, en vez de hablar de un
"hasta que" que ya se cumplió. Se conservan íntegras las diez cifras de
contraste medidas, que siguen siendo la justificación técnica del porqué.
No se tocó ni una línea de código SCSS, solo el comentario.

## Verificación final

- `pnpm exec vitest run` (suite completa, tras el borrado):
  primera pasada mostró 4 fallos en `src/accesibilidad-teclado.test.tsx`
  (foco de teclado / acordeón FAQ, fichero no tocado por esta tarea).
  Investigado antes de insistir: `pnpm exec vitest run
  src/accesibilidad-teclado.test.tsx` en aislamiento → 5/5 verde. Repetida
  la suite completa una segunda vez → **88 ficheros / 1228 tests, 100%
  verde**. Confirmado: intermitencia preexistente por interferencia entre
  suites (temporización de foco en jsdom), no una regresión introducida
  por este cambio — mi grep de la Tarea 1 era correcto.
- `pnpm run lint` (`oxlint --deny-warnings`) → limpio, sin salida.
- `pnpm run typecheck` (`tsc -b`) → limpio, sin salida.
- `pnpm exec vitest run src/components/Hero.test.tsx` → 19/19 verde tras
  el cambio de comentario.

## Alcance

Solo se tocaron los tres ficheros autorizados:
`src/lib/diseno/contratoRedisenho.ts`,
`src/lib/diseno/contratoRedisenho.test.ts`,
`src/components/Hero.module.scss`.

No se ejecutó ningún comando git de escritura.
