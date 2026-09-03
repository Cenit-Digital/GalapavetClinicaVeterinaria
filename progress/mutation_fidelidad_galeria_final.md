# Mutación final — fidelidad_galeria (33)

Comando aislado sobre el código final:

```
pnpm exec stryker run --mutate src/components/Galeria-logica.ts --plugins @stryker-mutator/vitest-runner --concurrency 1
```

Resultado: **31/31 eliminados, 100,00 %; 0 supervivientes, 0 timeouts, 0 sin
cobertura y 0 errores**. La corrida inicial ejecutó 229 pruebas y la medición
acabó en 2 min 39 s.
