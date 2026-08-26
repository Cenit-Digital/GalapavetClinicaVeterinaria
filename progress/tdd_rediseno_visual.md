# TDD — rediseno_visual

## Ronda 1: sistema y apertura

- ROJO: `src/lib/diseno/contratoRedisenho.test.ts` no pudo importar el
  contrato nuevo. VERDE: `contratoRedisenho.ts` declara roles, variantes y la
  puerta cerrada de afirmaciones vacías.
- ROJO: `src/data/variantesPaleta.test.ts` recibió cuatro variantes. VERDE:
  el catálogo ahora declara `clinica`, `calida`, `tech`, `eco` y `marca`.
- ROJO: `src/components/BarraUrgencias.test.tsx` no pudo importar el
  componente. VERDE: la barra usa el rótulo y `tel:` de `datosNegocio`.
- ROJO: `src/components/Hero-logica.test.ts` no pudo importar el módulo.
  VERDE: las cuatro cifras se derivan de los catálogos reales.

## Trazabilidad parcial

- @s1, @s2, @s4, @s5, @s7, @s12 → `tokensColor.test.ts` y
  `contratoRedisenho.test.ts`.
- @s10, @s37 → `variantesPaleta.test.ts`, `SelectorPaleta-logica.test.ts` y
  `SelectorPaleta.test.tsx`.
- @s13 → `rolesDescartados.test.ts` y `contratoRedisenho.test.ts`.
- @s27 → `BarraUrgencias.test.tsx`.
- @s29, @s30, @s51 → `Hero-logica.test.ts`; la fidelidad visual queda
  pendiente de Playwright contra `dist/`.

## Evidencia de esta ronda

- `tsc -b` y `oxlint --deny-warnings src` limpios al terminar la ronda.
- Build de Vite generado correctamente; Rolldown emite un aviso de diagnóstico
  de rendimiento de `vite:css` que no se ha silenciado. Pendiente de análisis
  antes de declarar un cierre sin avisos.
