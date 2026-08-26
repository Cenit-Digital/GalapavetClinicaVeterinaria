# Historial de sesiones

> Bitácora **append-only**. Al cerrar cada sesión, añade aquí el resumen que
> estaba en `current.md` (feature, fases recorridas, veredictos, resultado).

<!-- Ejemplo de entrada:
## 2026-01-01 — feature `ejemplo_feature`
- spec_partner: decisiones cerradas (ver project-spec.md).
- gherkin_author: features/ejemplo_feature.feature (@s1..@s5), aprobado por el humano.
- tdd_craftsman: 5 ciclos Rojo-Verde-Refactor. Tests verdes.
- judge: APPROVED (ver progress/judge_ejemplo_feature.md).
- mutation_tester: score 0.92 > 0.80 (ver progress/mutation_ejemplo_feature.md).
- Resultado: done.
-->

## 2026-08-26 — feature `integridad_puerta_mutacion`

- Redefinición autorizada por el humano: corrección de configuración del arnés
  y ejecución seca; la deuda global de producto 97,95 % queda documentada,
  separada y sin exclusiones artificiales.
- Gherkin: contrato final en `features/integridad_puerta_mutacion.feature`
  (@s1–@s9); prueba literal y script `pnpm run test:config` añadidos al
  workflow `Harness CI` después de `bin/harness init`.
- Configuración: `commands.mutate` ya no inyecta `--mutate` vacío; Stryker
  carga explícitamente el runner Vitest y se retiraron una propiedad y un
  patrón inertes que emitían avisos.
- Verificación: config 5/5, motor 49/49, init (1047/1047), E2E 75/75, build
  con puerta de terceros 0, y dry-run Stryker salida 0 (970 tests).
- Judge: APPROVED; resultado: done.
