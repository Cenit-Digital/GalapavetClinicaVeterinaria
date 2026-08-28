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

## Nota sobre el resto de la trazabilidad (@s2-@s52), añadida por craftsman_lead

Este fichero solo documenta la Ronda 1 (13 de 52 escenarios). Deliberadamente
no se ha regenerado como mapa único @s1-@s52: la trazabilidad del resto de la
feature vive repartida en `progress/rediseno/*.md` (un informe por lote de
TDD, cada uno con su propia matriz cláusula→test, mensajes de fallo
literales y, donde aplica, sabotaje real documentado) y en las tres rondas de
`progress/judge_rediseno_visual.md`, que auditan escenario a escenario contra
el TEXTO VIVO del `.feature` y el código real — no contra ningún resumen
intermedio. Ese es el patrón que las tres revisiones del `judge` han aceptado
y seguido explícitamente (incluida su propia recomendación de desconfiar de
`progress/rediseno/matriz_trazabilidad.md`, ya retirado por quedar
desactualizado). Para saber qué test cubre un `@sNN` concreto, la fuente
fiable es: `grep -rn "@sNN" progress/rediseno/ features/rediseno_visual.feature`
seguido de una lectura del test citado, no este fichero.
