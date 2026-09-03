# Mutación — fidelidad_reserva (32)

Comando aislado sobre el código final:

```
pnpm exec stryker run --mutate src/components/ReservaChat-logica.ts --plugins @stryker-mutator/vitest-runner --concurrency 1
```

Resultado: **41/41 eliminados, 100,00 %; 0 supervivientes, 0 timeouts, 0 sin
cobertura y 0 errores**. La corrida inicial ejecutó 176 pruebas y la medición
acabó en 3 min 22 s. Esta medición sustituye como evidencia de cierre a las
mediciones históricas de `mutation_reserva_chat.md`.
