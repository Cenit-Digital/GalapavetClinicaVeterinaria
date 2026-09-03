# Judge — fidelidad_responsive_integral (feature 38)

## Revisión

- El alcance se limita a cuatro módulos SCSS, un contrato Gherkin, una prueba
  Playwright y trazabilidad de la feature. No se añadieron dependencias ni se
  alteraron datos publicados.
- La composición de escritorio se conserva: la comparación visual a 1440 px
  mantiene la jerarquía y las bandas de la referencia. Las diferencias frente
  al prototipo son datos reales deliberados: cinco servicios, dos miembros de
  equipo y campañas sin precios ficticios.
- En móvil y tableta se redistribuye contenido en lugar de ocultarlo. El único
  scroll horizontal permitido sigue siendo la pista de galería, focalizable.
- Los límites se miden de forma exacta: pie 700/701/1023/1024 y cabecera
  1023/1024. El barrido de 81 anchos cubre 320–1600 px cada 16 px.
- Dos puertas existentes que inicialmente fallaron se repararon, no se
  silenciaron: área táctil de enlaces legales y estabilidad del h1 sin fuentes.

## Evidencia

- `pnpm exec playwright test`: **167/167** verdes.
- `bin/harness init`: lint, TypeScript y **89/89 ficheros, 1.416/1.416 tests** verdes.
- `pnpm run build`: CSS gzip **10,41 kB** (techo 12 kB), JavaScript gzip
  92,71 kB y puerta de terceros sin hallazgos.
- Capturas inspeccionadas: `progress/rediseno/capturas/responsive_integral_1440.png`,
  `responsive_integral_390.png` y `responsive_integral_comparativa.png`.
- Mutación dirigida al único bloque TypeScript añadido durante la reparación
  del arnés: 1/1 mutante eliminado, 100 %.

## Veredicto

**APPROVED.** La feature puede marcarse `done`.
