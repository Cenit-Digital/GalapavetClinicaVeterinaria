# Mutación — feature `pagina_blog` (id 17) — ronda 2 (re-medición tras aprobación del `judge`, ronda 3 de TDD/judge)

**Contexto:** la medición oficial anterior (conservada íntegra más abajo,
sección "Histórico — medición ronda 1 (FAIL)") midió **99/118 = 83.90%**
bruto (99/116 = 85.34% excluidos 2 mutantes equivalentes ya verificados),
con 17 supervivientes reales, los 17 concentrados en
`src/pages/PaginaBlog-logica.ts` (líneas 27, 66-70, 74, 112). El informe dejó
el cierre explícitamente a `tdd_craftsman`; éste reforzó
`PaginaBlog-logica.test.ts` con 13 tests nuevos dirigidos, cero cambios de
producción (`progress/tdd_pagina_blog.md`, "Ronda 3"), y `judge` aprobó ese
cierre sin pedir cambios (`progress/judge_pagina_blog.md`, veredicto
APPROVED, delegando C7 explícitamente a esta re-medición independiente).
Esta es esa re-medición.

**Veredicto:** PASS

**Score (2 ficheros, bruto):** 113/115 = 98.26%
**Score (excluidos los 2 mutantes equivalentes, ya documentados y
re-verificados sin cambios):** 113/113 = 100.00%
(umbral: 1.0 / 100%, harness.config.json -> mutation.threshold;
stryker.config.json -> thresholds.break = 100)

Timeouts: 0 en las 2 corridas. Columna "# timeout" leida antes que el
score en cada corrida: 0/0. Errors: 0 en las 2 corridas. No cov: 0 en las 2
corridas.

## Alcance de esta ronda

Instruccion explicita de esta medicion: identificar los ficheros
*-logica.ts nuevos o modificados de la feature (leido de
progress/tdd_pagina_blog.md) y, si src/App-logica.ts cambio (anadir
/blog a RUTAS_YA_CON_PAGINA_PROPIA), volver a medirlo tambien.

- src/pages/PaginaBlog-logica.ts -- re-medido integro. Es el unico
  fichero con supervivientes en la ronda 1; la ronda 3 de tdd_craftsman
  reforzo su test (PaginaBlog-logica.test.ts) sin tocar la produccion
  (confirmado: codigo de las lineas 27, 66-70, 74, 112 y 128-134 identico al
  citado en el informe de la ronda 1, releido linea a linea antes de correr
  Stryker).
- src/App-logica.ts -- cambiado por esta feature (git diff --stat HEAD
  confirma 8 lineas tocadas: RUTAS_YA_CON_PAGINA_PROPIA con /blog
  anadido), re-medido tambien, tal como pide el encargo. Sin cambios desde
  la ronda 1 (ya 11/11 = 100% entonces); se repite la medicion oficial de
  todas formas, no se da por buena la cifra anterior sin volver a correrla.

Fuera de alcance esta ronda, por instruccion explicita (no se re-ejecuta,
solo se deja constancia): src/lib/desplazamiento.ts no lleva el sufijo
-logica.ts y no cambio en las rondas 2/3 (progress/tdd_pagina_blog.md,
"Ningun otro fichero de produccion ni de test se toco" salvo lo ya listado
para cada ronda); ya midio 3/3 = 100% en la ronda 1 (ver historico) y no hay
motivo para pensar que ese resultado cambio sin tocar ni el fichero ni sus
tests. src/pages/PaginaBlog.tsx / src/data/blog.ts siguen fuera de la
superficie mutable declarada (.tsx no mutado por StrykerJS; datos de
catalogo, no logica de decision) -- mismo criterio que la ronda 1.

## Verificacion de entorno antes de cada corrida

Get-CimInstance Win32_Process, filtro por linea de comandos que contenga
"stryker" (excluyendo el propio comando de filtrado): 0 procesos antes de
la primera corrida y de nuevo 0 antes de la segunda. Nunca hubo mas de una
corrida de Stryker viva a la vez. --concurrency 1 ya fijado en
stryker.config.json. Ningun fichero de src/ ni de test fue editado
durante esta medicion.

## Como se corrio (2 corridas independientes, secuenciales, nunca en paralelo)

Mismo workaround ya validado en rondas anteriores de este proyecto
(node .harness/harness.mjs mutate <target> falla con "Cannot find
TestRunner plugin vitest"; Stryker no resuelve
@stryker-mutator/vitest-runner via el glob por defecto):

```
pnpm exec stryker run --mutate src/pages/PaginaBlog-logica.ts --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/App-logica.ts --plugins @stryker-mutator/vitest-runner
```

Duracion: PaginaBlog-logica.ts 5 min 14 s (104 mutantes, ~11.62 tests por
mutante de media); App-logica.ts 2 min 12 s (11 mutantes, ~9.00 tests por
mutante).

## Resultado por fichero

| Fichero | total | killed | survived | # timeout | # no cov | # errors | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| src/pages/PaginaBlog-logica.ts | 104 | 102 | 2 | 0 | 0 | 0 | 98.08% |
| src/App-logica.ts | 11 | 11 | 0 | 0 | 0 | 0 | 100.00% |
| Total ronda (bruto) | 115 | 113 | 2 | 0 | 0 | 0 | 98.26% |
| Total ronda (excluidos 2 equivalentes) | 113 | 113 | 0 | - | - | - | 100.00% |

---

## src/App-logica.ts -- 11/11 = 100%

Cero supervivientes, igual que en la ronda 1. RUTAS_YA_CON_PAGINA_PROPIA
extendido con /blog sigue matado por el test unico y exacto de
src/App-logica.test.ts (comparacion estricta contra el literal
['/tienda']).

## src/pages/PaginaBlog-logica.ts -- 102/104 = 98.08% bruto, 102/102 = 100.00% excluidos los 2 equivalentes

Los 17 supervivientes reales de la ronda 1 (grupos A/B/C del informe
historico: patrones de PATRONES_PROHIBIDOS_DE_CONTENIDO sin espacio y
telefonos cortos, normalizarCategoriaSeleccionada sin recorte/repliegue
exacto, separador de .join(' ') y espaciado irregular de
split(/\s+/)) pasan todos a Killed en esta corrida -- confirmado
directamente en la salida clear-text de Stryker (ninguno de los 17
aparece en la lista [Survived] de esta corrida; solo aparecen los 2
mutantes ya documentados como equivalentes, ver abajo). Los 13 tests nuevos
de la ronda 3 de tdd_craftsman (PaginaBlog-logica.test.ts, 3 describes
de refuerzo citando cada id del informe historico por numero) hacen el
trabajo que el informe de la ronda 1 pedia.

### Los 2 supervivientes de esta corrida son los mismos 2 equivalentes ya excluidos en la ronda 1 -- re-verificados sin cambios

```
[Survived] ConditionalExpression
src/pages/PaginaBlog-logica.ts:130:7
-     if (identificador === undefined) {
+     if (false) {

[Survived] BlockStatement
src/pages/PaginaBlog-logica.ts:130:36
-     if (identificador === undefined) {
-       return undefined
-     }
+     if (identificador === undefined) {}
```

Mismos ids (mutador ConditionalExpression/BlockStatement, linea 130),
mismo codigo exacto (resolverArticulo, lineas 128-134, releidas antes de
esta corrida y confirmadas byte a byte iguales al citado en el historico de
mas abajo). Justificacion de equivalencia ya escrita y verificada en la
ronda 1 (demostracion exhaustiva del dominio completo apoyada en el tipo
identificador: string no-opcional de ArticuloDemo): se mantiene sin
cambios, no hay codigo ni tipo nuevo que reabra el analisis. No se abusa de
la via de exclusion: son los mismos 2 mutantes ya justificados, no 2
mutantes nuevos.

---

## Conclusion

PASS. Score bruto de esta ronda: 113/115 = 98.26%; excluidos los 2
equivalentes genuinos (ya documentados en la ronda 1, re-verificados sin
cambios en esta), 113/113 = 100.00%, igual al umbral de
harness.config.json -> mutation.threshold (1.0 / 100%). 0 timeouts en
las 2 corridas, asi que el resultado es de fiar tal cual (no hace falta
repetir a --concurrency 1, ya esta fijado por defecto). Los 17 mutantes
reales que documento la ronda 1 (todos en src/pages/PaginaBlog-logica.ts)
estan confirmados Killed por esta medicion independiente, no solo por la
bitacora de tdd_craftsman.

src/lib/desplazamiento.ts queda fuera del alcance de esta ronda (no
-logica.ts, sin cambios desde la ronda 1, donde midio 3/3 = 100% -- ver
historico). Si se quisiera el score "feature completa" con los 3 ficheros
sumados (como hizo la ronda 1), seria 113 + 3 = 116 killed / 115 + 3 = 118
total = 98.31% bruto, 116/116 = 100.00% excluidos los 2 equivalentes --
mismo veredicto PASS, no cambia la conclusion.

No he tocado ningun fichero de src/ ni de test durante esta medicion
(regla dura de este rol: mide, no talla).

### Para craftsman_lead

pagina_blog (id 17) tiene ahora judge APPROVED (ronda 3) y mutacion
por encima del umbral (100% excluidos los 2 equivalentes justificados, C7
satisfecho). No quedan puertas tecnicas pendientes de este ciclo. Recordatorio
heredado del propio judge (hallazgo no bloqueante, sin relacion con
mutacion): sincronizar features/ensamblaje_landing.feature (linea ~101)
para que deje de citar /blog entre las rutas que sirven el catch-all
generico, mismo patron ya resuelto al cerrar pagina_campanas -- corresponde
a craftsman_lead al aceptar esta feature, no a este rol.

---

## Historico -- medicion ronda 1 (FAIL), conservada para trazabilidad

Contexto: progress/judge_pagina_blog.md (ronda 2 de judge) aprobo la
feature con veredicto APPROVED, delegando explicitamente el checkpoint
C7 (mutacion) a esta medicion ("C7: No ejecutado en esta ronda -- corresponde
a mutation_tester tras la aprobacion del judge. No aplica todavia.").
Esta fue esa medicion, ronda 1.

Veredicto: FAIL

Score (feature completa, 3 ficheros, bruto): 99/118 = 83.90%
Score (excluidos los 2 mutantes equivalentes): 99/116 = 85.34%
(umbral: 1.0 / 100%)

Timeouts: 0 en las 3 corridas. Errors: 0 en las 3 corridas. No cov: 0 en
las 3 corridas.

### Alcance -- identificacion de ficheros (ronda 1)

- src/pages/PaginaBlog-logica.ts (nuevo) -- objetivo principal, 19
  supervivientes.
- src/App-logica.ts (modificado) -- RUTAS_YA_CON_PAGINA_PROPIA
  extendido con /blog.
- src/lib/desplazamiento.ts (nuevo, sin sufijo -logica.ts, incluido
  por decision propia del rol con justificacion explicita: produccion nueva,
  logica de decision real, dentro del glob mutable de
  stryker.config.json).

### Resultado por fichero (ronda 1)

| Fichero | total | killed | survived | # timeout | # no cov | # errors | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| src/pages/PaginaBlog-logica.ts | 104 | 85 | 19 | 0 | 0 | 0 | 81.73% |
| src/App-logica.ts | 11 | 11 | 0 | 0 | 0 | 0 | 100.00% |
| src/lib/desplazamiento.ts | 3 | 3 | 0 | 0 | 0 | 0 | 100.00% |
| Total feature (bruto) | 118 | 99 | 19 | 0 | 0 | 0 | 83.90% |
| Total feature (excluidos 2 equivalentes) | 116 | 99 | 17 | - | - | - | 85.34% |

### Los 17 supervivientes reales de la ronda 1 (resumen; detalle completo con lineas y ejemplos en el commit historico de este fichero, seccion original)

- Grupo A (13 supervivientes, lineas 66-70) -- PATRONES_PROHIBIDOS_DE_CONTENIDO
  demasiado permisivo con separadores opcionales y cuantificadores: ids
  24/25/26 (precio euro), 28/30/33/35/40/43 (telefono), 45/46/47 (porcentaje),
  49 (24h).
- Grupo B (2 supervivientes, linea 27) -- normalizarCategoriaSeleccionada:
  id 2 (.trim() eliminado), id 4 (valor de repliegue '' mutado).
- Grupo C (2 supervivientes, lineas 74 y 112) -- calculo de tiempo de
  lectura: id 53 (join(' ') a join('')), id 74
  (split(/\s+/) a split(/\s/)).

Los 17 quedaron todos confirmados Killed en la re-medicion de arriba
(ronda 2 de esta medicion), tras el refuerzo de 13 tests en la ronda 3 de
tdd_craftsman.

### Mutantes equivalentes (ronda 1) -- 2, verificados y excluidos

src/pages/PaginaBlog-logica.ts:130 -- guarda redundante de
resolverArticulo (id 86 ConditionalExpression, id 88 BlockStatement).
Demostracion exhaustiva del dominio completo apoyada en el tipo
(identificador: string, nunca opcional en ArticuloDemo): con o sin la
guarda, el resultado observable es identico para cualquier identificador y
cualquier catalogo construidos legitimamente. Re-verificados sin cambios
en la ronda 2 de esta medicion (mismos ids, misma linea, mismo codigo).

### Conclusion (ronda 1)

FAIL. Score bruto de la feature: 99/118 = 83.90%; excluidos los 2
equivalentes genuinos, 99/116 = 85.34%. Ambos muy por debajo del umbral.
Correspondia a tdd_craftsman escribir los tests rojos que maten los 17
mutantes reales -- resuelto en la ronda 3 de TDD, confirmado por la
re-medicion PASS de arriba.
