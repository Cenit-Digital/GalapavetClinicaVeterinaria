# Judge — integridad_puerta_mutacion

**Veredicto final: APPROVED (alcance redefinido).**

## Revisión final de cierre

El humano autorizó explícitamente el 26/08/2026 el recorte a configuración y
ejecución seca. Se verifica que no se ha ocultado la medición global previa:
permanece registrada como FAIL de producto y no se usa para certificar esta
feature. El diff no toca `src/` ni pruebas de producto.

- `pnpm run test:config`: 5/5 verde; el workflow `Harness CI` lo ejecuta tras
  `bin/harness init`.
- Motor del arnés: 49/49 verde.
- `bin/harness init`: Oxlint sin warnings, TypeScript y 1047/1047 Vitest
  verdes.
- `pnpm exec playwright test --reporter=dot`: 75/75 verde.
- `pnpm run build`: verde; puerta de terceros con 0 hallazgos.
- `pnpm exec stryker run --dryRunOnly`: salida 0, runner Vitest alcanzado y
  970 tests; no se reprodujeron los avisos de plugin, configuración ni patrón
  sin coincidencia que motivaron esta entrega.
- `git diff --check`: verde; no hay cambios en `src/` ni `tests/`.

Los escenarios redefinidos `@s1`–`@s9` tienen evidencia. El contrato de
mutación global anterior fue sustituido con autorización humana y queda como
deuda futura independiente, por lo que no bloquea este cierre de configuración.

---

**Veredicto anterior: APPROVED (antes de la redefinición).**

## Segunda revisión independiente

Se revisaron de nuevo los escenarios `@s1`–`@s9`, la sección y enmienda de
`project-spec.md`, la bitácora TDD, la prueba de configuración, la
configuración final y el diff. No se ejecutó Stryker, para no interferir con
la medición global posterior.

La corrección mínima solicitada está aplicada: `@s2` exige ahora únicamente
las dos exclusiones efectivas de tests. Ya no contradice la enmienda aprobada
ni `@s7`, que exige correctamente que el patrón inerte `.d.ts` no esté
declarado.

## Trazabilidad y alcance

- `@s1` → prueba literal del comando global y `mutation.targets: []`.
- `@s2`, `@s6`, `@s7` y `@s8` → cinco pruebas literales de la configuración
  final, incluidas la lista exacta de patrones, plugin, runner, umbrales y
  límites.
- `@s9` → ejecución seca independiente registrada con salida 0, runner Vitest
  alcanzado, 970 tests y ausencia de los avisos y error previamente observados.
- `@s3`, `@s4` y `@s5` quedan correctamente para sus puertas de ejecución
  posteriores: mutación global, `verify`, regresión del motor y E2E. La feature
  sigue `in_progress` y no puede marcarse `done` hasta que esas evidencias
  completen 0 timeouts y 100 % sobre mutantes no equivalentes.

## Evidencia propia

- `node --test .harness/test/project-config.test.mjs`: **5/5 verde**.
- `git diff --check`: **verde**.
- No hay diff en `src/` ni `tests/`: no se cambió producción ni pruebas de
  producto.
- El comando es exactamente `pnpm exec stryker run`; no contiene `--mutate` ni
  `{{target}}`.
- La superficie mutable exacta, los tres umbrales en 100, `concurrency: 1` y
  `timeoutMS: 60000` permanecen protegidos por aserciones literales.

No quedan objeciones de revisión al pasar a la fase de mutación. Este veredicto
no sustituye la evidencia obligatoria de dicha fase ni la verificación final.
