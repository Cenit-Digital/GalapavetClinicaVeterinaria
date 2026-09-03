# Mutación — feature 26 `fidelidad_lienzo`

Fecha: 03/09/2026.

## Alcance

La producción modificada por la feature es SCSS y JSX. La configuración de
Stryker del repositorio muta exclusivamente `src/lib/**/*.ts` y módulos
`*-logica.ts`, porque no muta JSX ni CSS de forma fiable. El único módulo puro
relacionado cuya prueba se reforzó es `src/lib/diseno/escalaEspaciado.ts`.

## Corrida real

```text
pnpm exec stryker run --mutate src/lib/diseno/escalaEspaciado.ts \
  --plugins @stryker-mutator/vitest-runner
```

Resultado: **1/1 mutante muerto, 0 supervivientes, 0 sin cobertura, 0
timeouts; 100,00 %**. Stryker informó que el 100 % alcanza el umbral `break:
100` de `stryker.config.json`.

La fidelidad visual que Stryker no puede instrumentar queda cubierta por las
cuatro pruebas Playwright del contrato, ejecutadas sobre `dist/`, no sobre el
servidor de desarrollo.
