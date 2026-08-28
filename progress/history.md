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

## 2026-08-29 — feature `rediseno_visual` (id 24)

- Contrato aprobado por el humano el 26/08/2026 (52 escenarios), con 3
  enmiendas aprobadas después (`progress/rediseno/enmiendas_contrato.md`).
  Implementación interrumpida el 28/08 por una suspensión del PC a mitad de
  una oleada de TDD; recuperada sin pérdida de trabajo tras un incidente de
  `git reset` destructivo de un subagente de esa misma oleada (recuperación
  completa desde `git stash`, dos entradas, reconciliada por craftsman_lead).
- judge: 4 rondas hasta APPROVED, cada una auditando bloques del contrato que
  las anteriores no habían escrutado con el mismo rigor:
  - Ronda 1: rechazó los bloques C/D (@s17-@s40) sin TDD documentado desde el
    commit masivo original; 3 defectos reales (@s28, @s31, @s33 parcial).
  - Ronda 2: @s29 (sabotaje de test olvidado), @s25 (controles del chat bajo
    44px, casilla de consentimiento desalineada).
  - Ronda 3: @s33 seguía incumplido en Servicios (3 de 4 secciones
    arregladas), @s40 nunca tocado (blog sin imagen/categoría real), @s19 sin
    test de navegador real pese a la anotación explícita del bloque C.
  - Ronda 4: auditó por primera vez los bloques A/B y F completos; encontró
    @s45 (axe solo cubría 1 de 5 variantes — al ampliar encontró un defecto
    de contraste real en la variante "tech", corregido con
    `a { color: inherit; }` en `global.scss`) y @s47 (interacción de consola
    faltante). APPROVED: los 52 escenarios quedaron auditados entre las
    cuatro rondas.
- mutation_tester: primera medición FAIL (83,54 % bruto, 235 supervivientes
  reales en 12 de 14 módulos). 6 sesiones de `tdd_craftsman` en paralelo
  (cerrojo compartido para serializar Stryker) cerraron los huecos reales y
  retiraron código huérfano confirmado en `tokensColor.ts`. Medición final
  consolidada: **PASS, 100 % sobre mutantes no equivalentes** (1364/1364; 16
  equivalentes re-verificados de forma independiente por `mutation_tester`,
  ninguno aceptado de las sesiones de refuerzo sin prueba propia).
- Verificación final independiente: `bin/harness init` 88/88 ficheros,
  1300/1300 tests, lint y typecheck limpios; build verde (CSS 7,51 kB, techo
  8 kB); Playwright completo 112/112.
- Evidencia: `progress/judge_rediseno_visual.md`, `progress/mutation_rediseno_visual.md`,
  ~30 informes en `progress/rediseno/`.
- Resultado: done.

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
