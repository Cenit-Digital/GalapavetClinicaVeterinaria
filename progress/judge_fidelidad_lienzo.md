# Review — feature 26 `fidelidad_lienzo`

**Veredicto: APPROVED** — 03/09/2026.

## Contrato frente a implementación

- **@s1:** las ocho bandas ancladas miden el viewport a 1440 px; sus hijos,
  incluida la cabecera y el pie, miden 1220 px y comparten el mismo borde
  izquierdo (tolerancia de 1 px). Hero queda declarado explícitamente como
  excepción a sangre.
- **@s2:** Playwright compara el color computado de servicios, campañas,
  equipo, reserva, galería, contacto y FAQ contra los dos tokens del tema. La
  secuencia exacta es principal/alterno/principal/alterno/principal/alterno/
  principal.
- **@s3:** no hay selectores de id en los SCSS Modules; la prueba recursiva de
  escala no admite llamadas con pasos inexistentes. Los 22 `espaciado(20)`
  localizados se han reemplazado por 16 o 24 px válidos.
- **@s4:** a 320 px no hay overflow; el build da CSS gzip de 7,61 kB, bajo el
  techo aprobado de 12.000 B. La puerta de terceros inspecciona `dist/` y
  encuentra cero dominios externos.

## Evidencia ejecutada

- `bin/harness test`: **88 archivos, 1.303 tests, verde**.
- `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`: verde.
- `pnpm exec playwright test tests/e2e/fidelidad-lienzo.spec.ts`: **4/4
  verde** sobre el build de producción.
- `pnpm exec stryker run --mutate src/lib/diseno/escalaEspaciado.ts`:
  **100 % (1/1 muerto)**.
- Comparativa de navegador almacenada en
  `progress/rediseno/capturas/fidelidad_lienzo_comparativa.png` (1440 y 390
  px): confirma la corrección del lienzo, no declara resueltas las secciones
  posteriores.

## Regresión conocida, aislada

La corrida global de Playwright registró el error de consola del iframe actual
de OpenStreetMap, bloqueado por `sandbox`. Es el defecto ya especificado para
`fidelidad_contacto` (mapa estático local aprobado por Pablo), no una regresión
de esta feature. La corrida se detuvo al quedar un worker colgado tras ese
fallo; no se ha marcado como verde ni se ha silenciado. Se repetirá completa al
cerrar contacto.

No hay cambios fuera del cimiento, de sus tests, ni de las correcciones
necesarias de contratos antiguos que buscaban selectores CSS Modules muertos.
