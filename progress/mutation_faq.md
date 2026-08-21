# Mutación — feature `faq` (id 12)

**Contexto:** re-medición tras `progress/judge_faq.md` ronda 2, veredicto
**APPROVED**, "Cambios requeridos: Ninguno". C7 quedaba pendiente en esa
ronda del `judge` a la espera de que `mutation_tester` repitiera la medición
oficial sobre `src/components/Faq-logica.ts` tras el refuerzo de
`src/components/Faq-logica.test.ts` (7 tests nuevos, `progress/tdd_faq.md`
sección "Ronda 2"), motivado por el FAIL anterior de esta misma medición
(82.22%, 16 mutantes no-killed). Esta es esa re-medición.

**Veredicto:** PASS

**Score:** 89/90 = 98.89% en bruto; con el único mutante superviviente
documentado como equivalente genuino (ver abajo) excluido del denominador,
89/89 = 100% sobre mutantes no equivalentes (umbral: 1.0 en
harness.config.json -> mutation.threshold; stryker.config.json ->
thresholds.break = 100).

**Timeouts: 0.** Columna "# timeout" leída antes que el score: 0 en la
única corrida -- no hizo falta repetir a --concurrency 1 (ya fijado por
defecto en stryker.config.json).

**Mutantes no-killed: 1** (1 Survived, 0 NoCoverage, 0 Timeout, 0 Errors).
1 equivalente (ver justificación).

## Alcance -- por qué un solo fichero

Ficheros de producción de esta feature (git status --short +
progress/tdd_faq.md seccion "Entregables de esta ronda" y "Ronda 2"):
Faq-logica.ts, Faq.tsx y (nuevo en la ronda 2) Faq-logica.test.ts. Ningún
otro *-logica.ts recibió cambios de producción reales para faq: git log
--oneline -- src/components/InformacionContacto-logica.ts src/lib/site.ts
src/data/servicios.ts no muestra ningún commit de esta ronda (los tres
siguen igual que en las features informacion_contacto / datos_negocio /
servicios, ya cerradas); Faq-logica.ts/Faq.tsx reutilizan
construirEnlaceTelefono, TramoHorario, EnlaceTelefono, SERVICIOS,
datosNegocio pero no se editan.

Cruzado contra el glob mutate de stryker.config.json (src/lib/**/*.ts +
src/**/*-logica.ts, .tsx excluido a propósito por la limitación conocida de
StrykerJS con JSX, mismo criterio ya aplicado en el resto de features de
este proyecto): solo Faq-logica.ts cae dentro de la superficie mutable
declarada. Faq.tsx y Faq-logica.test.ts quedan fuera (el segundo por ser el
propio test, excluido explícitamente por !src/**/*.test.ts).

## Verificación de entorno previa (concurrencia)

Get-CimInstance Win32_Process -Filter "Name='node.exe'" antes de arrancar: 3
procesos node.exe, los tres del entorno de agentes de JetBrains
(acp-agents...codex-acp, codex.js app-server), ninguno con stryker ni
vitest en la línea de comandos. Cero corridas de Stryker activas. Se lanzó
una única corrida, un único fichero mordible, sin ninguna otra corrida de
Stryker en paralelo durante los 15 min 3 s que tardó.

## Comando usado

bin/harness mutate src/components/Faq-logica.ts (es decir, pnpm exec
stryker run --mutate src/components/Faq-logica.ts tal cual declara
harness.config.json) se probó primero y falló de inmediato: en esta máquina
Stryker no resuelve el plugin @stryker-mutator/vitest-runner vía el glob
por defecto pese a estar instalado (mensaje: Cannot find TestRunner plugin
"vitest". In fact, no TestRunner plugins were loaded.) -- mismo workaround
ya validado y documentado en la ronda 1 de este mismo informe y en
progress/mutation_galeria.md / progress/mutation_informacion_contacto.md.
Se repitió con el plugin explícito, único fichero:

pnpm exec stryker run --mutate src/components/Faq-logica.ts --plugins @stryker-mutator/vitest-runner

Dry run inicial: 20 tests verdes en 22 s (269 previos + 7 de refuerzo de la
ronda 2 = 276 totales en el repo; 20 son los que cubren Faq-logica.ts). 90
mutantes instrumentados sobre 1 fichero fuente (mismo total que la ronda 1
-- el refuerzo fue solo de tests, cero producción tocada). concurrency: 1
(fijado en stryker.config.json). Duración: 15 minutos 3 segundos.

## Resultado (medición oficial)

```
---------------|------------------|----------|-----------|------------|----------|----------|
               | % Mutation score |          |           |            |          |          |
File           |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
---------------|--------|---------|----------|-----------|------------|----------|----------|
All files      |  98.89 |   98.89 |       89 |         0 |          1 |        0 |        0 |
 Faq-logica.ts |  98.89 |   98.89 |       89 |         0 |          1 |        0 |        0 |
---------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score 98.89 under breaking threshold 100, setting exit code to 1 (failure).
```

Verificación independiente, no fiada solo del resumen clear-text: se leyó
reports/mutation/mutation.json directamente con un script Node.js que
recorre files['src/components/Faq-logica.ts'].mutants y agrega por status:

```
{ Killed: 89, Survived: 1 }
```

89 + 1 = 90, coincide exactamente con el resumen clear-text y con el total
de mutantes instrumentados (idéntico a la ronda 1: el refuerzo no cambió el
número de mutantes, solo cuántos mueren). Ni Timeout ni NoCoverage ni
RuntimeError aparecen en el objeto agregado -- los 4 NoCoverage y los 12
Survived de la ronda 1 (16 en total) quedan Killed en esta ronda salvo uno.

Detalle del único no-killed, leído del propio mutation.json:

```json
{
  "id": "29",
  "status": "Survived",
  "mutatorName": "StringLiteral",
  "line": 49,
  "col": 27,
  "replacement": "\"Stryker was here!\""
}
```

## Mutante superviviente -- análisis de equivalencia

- src/components/Faq-logica.ts:49 StringLiteral -- elementos.join('') pasa
  a elementos.join("Stryker was here!"), dentro de la rama
  if (elementos.length <= 1) { return elementos.join('') } de la función
  enumerar (líneas 47-50). El único test que la suite reporta ejercitando
  esta rama es "textoServicios ... con un único título no antepone ningún
  separador ni conector (rama de la lista de longitud 1)", del refuerzo de
  la ronda 2 -- y ese test, correctamente, no distingue el mutante.

Es un mutante equivalente genuino, verificado de forma independiente por
partida doble antes de excluirlo:

1. Matemáticamente: dentro de esta rama, elementos.length es 0 o 1.
   Array.prototype.join(separador) nunca aplica el separador cuando el
   array tiene 0 o 1 elementos: [].join(x) === '' para cualquier x (no hay
   huecos entre elementos que rellenar), y [y].join(x) === String(y) para
   cualquier x (un único elemento no tiene vecino con el que unirse). Es
   una propiedad del lenguaje (ECMA-262 Array.prototype.join), no del
   código de este proyecto.
2. Empíricamente, en esta misma medición: node -e aislado confirma
   [].join('') === [].join('Stryker was here!') ("" === "") y
   ['Unico'].join('') === ['Unico'].join('Stryker was here!') ("Unico" ===
   "Unico"). Y sobre el propio proyecto: los 20 tests que ejercitan
   Faq-logica.ts (incluidos los 2 tests de textoServicios que sí cubren
   ambas ramas de enumerar, con 1 y con 3+ títulos) siguen en verde con el
   mutante aplicado -- ningún input observable de enumerar o textoServicios
   (las únicas dos funciones que llaman a esta línea, directa o
   indirectamente) puede producir una salida distinta entre el original y
   el mutado.

No hay ningún input construible, dentro del dominio de la función tal como
se usa en este proyecto (listas de 0 o 1 elementos en esa rama), que
distinga el comportamiento observable. Se excluye del cómputo del umbral
por esta justificación explícita -- mismo protocolo y mismo criterio ya
aplicado y aceptado en este proyecto para src/lib/telefono.ts:13
(progress/mutation_datos_negocio.md) y src/lib/contraste.ts:36
(progress/mutation_tokens_marca.md). No se excluye por comodidad: se llegó
a esta conclusión con verificación propia, independiente del análisis ya
hecho por tdd_craftsman (progress/tdd_faq.md, sección "Hallazgo propio:
L49") y por judge (progress/judge_faq.md, checkpoint C7), que apuntaban en
la misma dirección -- este informe no se limita a copiar esa conclusión, la
re-verifica desde cero con su propio script y su propia lectura del
mutation.json.

## Comparación con la ronda 1 (progress/tdd_faq.md seccion "Ronda 2")

Los 16 mutantes no-killed de la medición anterior (Grupos A, B, C, D) se
reducen a 1 (el equivalente L49 de este informe, que ya formaba parte del
Grupo B). Los 15 restantes quedan Killed por los 7 tests nuevos de
Faq-logica.test.ts, exactamente como predijo la tabla de
progress/tdd_faq.md ("15/16 mutantes cerrados con test dirigido... 1/16
documentado como equivalente"). No hay discrepancia entre lo predicho por
el tdd_craftsman/judge y la medición oficial de esta ronda.

## Mutantes equivalentes excluidos

- src/components/Faq-logica.ts:49 (StringLiteral, join('') ->
  join("Stryker was here!")) -- ver análisis de equivalencia arriba.

## Conclusión

src/components/Faq-logica.ts -- único fichero de la feature faq (id 12)
dentro del glob mordible de stryker.config.json -- alcanza 89/90 = 98.89%
en bruto; excluyendo el único mutante equivalente genuino documentado
arriba, 100% sobre mutantes no equivalentes, que sí satisface el umbral 1.0
de harness.config.json -> mutation.threshold. C7 queda satisfecho. No se
editó ningún fichero de src/ ni de test durante esta medición (regla dura
de este rol: mide, no talla).

### Para craftsman_lead

faq (id 12) puede marcarse done: judge ya aprobó (progress/judge_faq.md,
APPROVED) y esta medición confirma la mutación por encima del umbral, con
el único superviviente documentado como equivalente genuino y no ignorado
ni oculto.
