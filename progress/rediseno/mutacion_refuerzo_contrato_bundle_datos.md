# Refuerzo de mutación — contratoRedisenho.ts, bundleDeDiseno.ts, datosDelSitio.ts

**Resultado final:** PASS. Mutation score 100.00 % (260/260 mutantes: 260
killed, 0 timeout, 0 survived, 0 no cov, 0 errors) sobre los tres ficheros,
umbral de ruptura 100 alcanzado (`stryker.config.json` → `thresholds.break`).
Corrida completa: `reports/mutation/index.html` y `reports/mutation/mutation.json`
(generados el 28/08/2026 ~21:34, 14 min 34 s de duración, dry run con 284 tests
de la suite completa en verde).

Feature: rediseno_visual (24). Objetivo: matar los 9 mutantes supervivientes que
`progress/mutation_rediseno_visual.md` documenta para estos tres ficheros
(sección "contratoRedisenho.ts", "bundleDeDiseno.ts" y "8. datosDelSitio.ts"),
sin tocar ningún otro fichero de la superficie de mutación.

## Alcance estricto respetado

Solo se tocaron:
- `src/lib/diseno/contratoRedisenho.ts` (revertido tras la verificación manual, sin cambio neto)
- `src/lib/diseno/contratoRedisenho.test.ts`
- `src/lib/diseno/bundleDeDiseno.ts` (revertido tras la verificación manual, sin cambio neto)
- `src/lib/diseno/bundleDeDiseno.test.ts`
- `src/lib/diseno/datosDelSitio.ts` (revertido tras la verificación manual, sin cambio neto)
- `src/lib/diseno/datosDelSitio.test.ts`

Ningún mutante de estos tres ficheros requirió tocar producción: los 8 de
"vacuidad no asertada" eran huecos de aserción en tests YA existentes, y el de
`datosDelSitio.ts:433` necesitó un caso de test nuevo con datos sintéticos. Cero
líneas de producción nuevas.

## Mapa mutante → refuerzo

### contratoRedisenho.ts (2 supervivientes → 0)

- `contratoRedisenho.ts:75:28` (rama de corpus vacío, `ficherosQueDeclaran: []`)
- `contratoRedisenho.ts:84:28` (rama de identificador vacío, `ficherosQueDeclaran: []`)

Refuerzo: en el test `@s10 la puerta de declaración única falla cerrada con el
corpus vacío o el identificador vacío` (`contratoRedisenho.test.ts:175-186`),
se añadió `expect(sinCorpus.ficherosQueDeclaran).toEqual([])` y
`expect(sinIdentificador.ficherosQueDeclaran).toEqual([])`.

Verificación de rojo real (aplicado a mano, uno a la vez, revertido tras cada
comprobación): `ficherosQueDeclaran: ['Stryker was here']` en cada rama por
separado → el test falla con `AssertionError: expected [ 'Stryker was here' ]
to deeply equal []` en la línea exacta de la aserción nueva → confirmado que
detecta ambos mutantes → revertido, suite verde de nuevo (9/9 tests).

### bundleDeDiseno.ts (6 supervivientes → 0)

- `bundleDeDiseno.ts:116:68` y `:116:83` (rama de directorio vacío, `pantallas: []` / `faltantes: []`)
- `bundleDeDiseno.ts:122:18` y `:123:18` (rama sin obligatorios)
- `bundleDeDiseno.ts:131:18` y `:132:18` (rama sin pantallas exigidas)

Refuerzo: en los tres tests de falla cerrada de `ejecutarPuertaDelBundleDeDiseno`
(`bundleDeDiseno.test.ts:79-101`), se añadió `expect(informe.pantallas).toEqual([])`
y `expect(informe.faltantes).toEqual([])` a cada uno.

Verificación de rojo real (mutado a mano una rama a la vez, con
`['Stryker was here']` en los dos campos, revertido tras cada comprobación):
las tres ramas fallan con el mismo patrón de `AssertionError` sobre la
aserción nueva → confirmado que detecta los 6 mutantes → revertido, suite
verde de nuevo (20/20 tests).

### datosDelSitio.ts (1 superviviente → 0)

- `datosDelSitio.ts:433:7` (`compromisosEncontrados[PRIMER_COMPROMISO] === cualificadorDeclarado` -> `true`)

El test real de @s52 (`el único compromiso de urgencias del sitio real es el
que declara la fuente única`) no distingue este mutante porque su único
compromiso encontrado YA coincide con el declarado.

Refuerzo: test NUEVO `falla si el único compromiso encontrado no coincide con
el declarado por la fuente única` (`datosDelSitio.test.ts`, justo antes del
test de "falla si aparece un segundo compromiso..."). Usa un texto SINTÉTICO
("Urgencias permanentes, siempre atendemos") donde solo el cualificador
"permanentes" del catálogo `CUALIFICADORES` casa como prefijo tras la palabra
"urgencias" (ninguno de los demás ocho cualificadores es prefijo de ese
texto), produciendo `compromisosEncontrados.length === 1` pero distinto del
cualificador declarado ("fuera de horario"). Espera `pasa: false`.

Verificación de rojo real (mutado a mano: la condición completa reemplazada
por `compromisosEncontrados.length === UN_UNICO_COMPROMISO && true`, revertido
tras la comprobación): el test nuevo falla con `expected true to be false` en
`expect(informe.pasa).toBe(false)` → confirmado que detecta el mutante →
revertido, suite verde de nuevo (33/33 tests).

## Trazabilidad @s → test

- @s10 (`contratoRedisenho.feature`, puerta de declaración única, falla
  cerrada) → `contratoRedisenho.test.ts:175` reforzado con las dos
  aserciones de `ficherosQueDeclaran`.
- @s41 (bundle de diseño, falla cerrada tres veces) → los tres tests de
  `bundleDeDiseno.test.ts:79-101` reforzados con `pantallas`/`faltantes`.
- @s52 (el sitio no afirma un compromiso de urgencias que no sostiene) →
  test nuevo en `datosDelSitio.test.ts` con datos sintéticos.

## Verificación final

1. `pnpm exec vitest run src/lib/diseno/contratoRedisenho.test.ts
   src/lib/diseno/bundleDeDiseno.test.ts src/lib/diseno/datosDelSitio.test.ts`
   → 3 ficheros, 62 tests, verde.
2. `pnpm exec vitest run` (suite completa): el repositorio tiene 5 agentes
   hermanos trabajando EN PARALELO sobre el resto de la superficie de
   mutación (misma tarea, otros ficheros), así que la suite completa osciló
   entre roja y verde según su propio ciclo Rojo-Verde-Refactor durante toda
   la sesión. Confirmado repetidas veces que las fallas observadas NUNCA
   correspondían a mis tres ficheros (siempre `rolesDescartados.ts`,
   `SelectorPaleta-logica.ts`, `matrizDeContraste.ts` u otros ficheros fuera
   de mi alcance, con mensajes de aserción que coinciden exactamente con los
   mutantes manuales descritos para esos ficheros en
   `progress/mutation_rediseno_visual.md`). Capturada una corrida 100% verde
   (1289/1289 tests, 88/88 ficheros) inmediatamente antes de tomar el turno
   de Stryker.
3. `pnpm run lint` (`oxlint --deny-warnings`): el comando de proyecto completo
   falló una vez por un mutante manual en curso de un hermano en
   `SelectorPaleta-logica.ts:65` (fuera de mi alcance). Acotado a mis seis
   ficheros (`pnpm exec oxlint --deny-warnings <mis 6 ficheros>`): exit 0,
   limpio.
4. `pnpm run typecheck` (`tsc -b`): el comando de proyecto completo falló una
   vez por el mismo mutante manual en curso de un hermano en
   `SelectorPaleta-logica.ts` (errores TS2345/TS2322 en esas líneas exactas,
   fuera de mi alcance). No hay ningún error de typecheck en mis tres
   ficheros ni en sus tests.
5. Mutación real acotada a los tres ficheros (`stryker run --mutate
   src/lib/diseno/contratoRedisenho.ts,src/lib/diseno/bundleDeDiseno.ts,
   src/lib/diseno/datosDelSitio.ts`), coordinada con el cerrojo compartido
   `C:\Users\vhurt\AppData\Local\Temp\claude-stryker-mutex.lock` indicado por
   craftsman_lead (creado antes de cada intento, borrado al terminar, o al
   confirmar que no quedaba proceso huérfano tras un timeout de la propia
   herramienta). Cuatro intentos previos no completaron: dos fallaron en el
   dry run porque un hermano tenía la suite completa roja en ese instante
   exacto (`SelectorPaleta-logica.test.ts` y luego `matrizDeContraste.test.ts`,
   ninguno de mis ficheros, liberado el cerrojo de inmediato en ambos casos);
   uno se cortó por el límite de tiempo de la propia herramienta de shell tras
   adquirir el cerrojo (confirmado sin proceso Stryker huérfano antes de
   liberar el cerrojo); y uno más esperó ~30 minutos a que un hermano
   terminara su propia corrida legítima de Stryker sobre
   `matrizDeContraste.ts` (307 mutantes, confirmado con la lista de procesos
   que era una corrida real, no un cerrojo abandonado).

   La corrida que sí completó (lanzada en segundo plano para no toparse con
   el límite de tiempo de la herramienta, con la suite completa en verde
   —1289/1289— justo antes de adquirir el cerrojo):

   ```
   ----------------------|------------------|----------|-----------|------------|----------|----------|
                         | % Mutation score |          |           |            |          |          |
   File                  |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
   ----------------------|--------|---------|----------|-----------|------------|----------|----------|
   All files             | 100.00 |  100.00 |      260 |         0 |          0 |        0 |        0 |
    bundleDeDiseno.ts    | 100.00 |  100.00 |       58 |         0 |          0 |        0 |        0 |
    contratoRedisenho.ts | 100.00 |  100.00 |       28 |         0 |          0 |        0 |        0 |
    datosDelSitio.ts     | 100.00 |  100.00 |      174 |         0 |          0 |        0 |        0 |
   ----------------------|--------|---------|----------|-----------|------------|----------|----------|
   Final mutation score of 100.00 is greater than or equal to break threshold 100
   ```

   260/260 mutantes (58 de `bundleDeDiseno.ts` — 6 del refuerzo + 52 que ya
   mataban los tests previos —, 28 de `contratoRedisenho.ts` — 2 del refuerzo
   + 26 previos —, 174 de `datosDelSitio.ts` — 1 del refuerzo + 173 previos).
   0 survived, 0 no cov, 0 timeout, 0 errors: los 9 mutantes objetivo quedan
   matados y ninguno de los 251 ya cubiertos regresó a superviviente. Cerrojo
   liberado inmediatamente después de leer el resultado.

## Nota para craftsman_lead

Confirmado en varias ocasiones durante esta sesión que las fallas
transitorias del comando de proyecto completo (`pnpm exec vitest run`,
`pnpm run lint`, `pnpm run typecheck`) no se debían a mis cambios sino al
trabajo simultáneo de los agentes hermanos sobre `rolesDescartados.ts`,
`SelectorPaleta-logica.ts` y `matrizDeContraste.ts`. El propio dry run de
Stryker requiere la suite COMPLETA en verde (no solo los ficheros mutados),
así que cualquier corrida futura de `stryker run` en este repositorio
compartido seguirá siendo sensible a este mismo efecto mientras haya sesiones
concurrentes activas — más allá del cerrojo de exclusión mutua ya aplicado,
que solo serializa las corridas de Stryker entre sí, no la salud de la suite
completa en el instante en que cada dry run arranca.
