# TDD — fidelidad_selector_paleta (37)

Contrato aprobado: `features/fidelidad_selector_paleta.feature`.

## Cambio de fidelidad

- El disparador pasó de una píldora con texto a un botón circular fijo de 52 px, con nombre accesible exacto y disco tricolor decorativo.
- El panel queda sobre el disparador, tiene rótulo visible y cinco opciones; el estado activo permanece en `aria-pressed`.
- El panel se limita al viewport de 320 px y la regla global de movimiento reducido conserva la duración técnica de 0,01 ms para no cancelar eventos del navegador.

## Evidencia actual

- `pnpm exec vitest run src/components/SelectorPaleta.test.tsx src/components/SelectorPaleta-logica.test.ts` — 23/23.
- `pnpm run build` — verde; CSS servido 10,37 kB gzip, bajo el límite aprobado de 12 kB.
- `pnpm exec playwright test tests/e2e/fidelidad-selector-paleta.spec.ts --workers=1` — 3/3.
- No se modificó `SelectorPaleta-logica.ts` ni su prueba durante este ajuste visual; su trazabilidad TDD original está en `progress/tdd_selector_paleta.md`.
