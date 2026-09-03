# Mutación — `fidelidad_campanas` (30)

Objetivo: `src/components/CampanasPortada-logica.ts`.

Comando ejecutado:

```text
pnpm exec stryker run --mutate src/components/CampanasPortada-logica.ts --testFiles src/components/CampanasPortada-logica.test.ts --concurrency 1
```

Resultado de la ejecución final: 33 mutantes generados, 33 eliminados, 0
supervivientes y 0 timeouts — **100 %**. Los casos separados de bloque vacío,
ausente y de solo espacios muerden la condición y el `trim` de
`detalleDeCampana`.
