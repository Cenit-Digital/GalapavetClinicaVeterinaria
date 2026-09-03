# Verificación final — fidelidad visual

Fecha: 03/09/2026

## Evidencia ejecutada

- `bin/harness init`: verde. Valida entorno, contratos, lint, TypeScript y
  89 ficheros / 1.415 pruebas.
- `pnpm run build`: verde. El CSS de producción mide 10,36 kB gzip, dentro del
  límite aprobado de 12 kB. La puerta de terceros no detecta dominios externos.
- Las 13 especificaciones Playwright de fidelidad habían completado 51 de 51
  escenarios antes de esta comprobación. El cambio posterior afecta únicamente
  al aislamiento de los ficheros de Vitest, no al código servido.
- Capturas de cierre: `progress/rediseno/capturas/cierre_final_1440.png`,
  `cierre_final_390.png` y `cierre_final_comparativa.png`.

## Estabilidad del arnés

La ejecución concurrente de Vitest producía falsos rojos en pruebas que
modifican de forma intencional el foco y el historial del navegador. La prueba
aislada de los dos ficheros afectados pasó 54/54 y la suite completa con
`--no-file-parallelism` pasó 1.415/1.415. Se fijó ese comportamiento con
`fileParallelism: false` en `vite.config.ts`; después, tanto `pnpm run test`
como `bin/harness init` pasaron 1.415/1.415.
