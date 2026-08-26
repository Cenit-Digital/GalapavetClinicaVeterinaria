# Handoff — rediseño visual

Fecha: 26/08/2026. Feature activa: `rediseno_visual` (id 24, `in_progress`).

## Estado entregado en este commit

- Se incorporó el sistema visual de cinco variantes (`clinica`, `calida`,
  `tech`, `eco`, `marca`) y veinte roles por variante.
- La portada usa el nuevo hero, la barra de urgencias con el teléfono real,
  tarjetas de servicios con recursos locales, la reserva rediseñada y avatares
  de iniciales para no atribuir retratos de stock al equipo real.
- Las seis rutas comparten las correcciones de jerarquía, tipografía, ritmo,
  foco, formularios y contenedor.
- El build de producción más reciente terminó correctamente: TypeScript,
  Vite y la puerta de terceros pasaron sin advertencias.

## Validación ya comprobada

- Vitest: `Hero`, `Servicios`, `ReservaChat`, `BarraUrgencias`, selector de
  paleta, contrato de tokens, inventario de módulos y puerta de afirmaciones
  clínicas pasaron en ejecuciones aisladas.
- `oxlint --deny-warnings src tests/e2e` y `tsc -b --pretty false` pasaron.
- E2E de accesibilidad: las puertas de análisis automático, objetivos táctiles
  y contraste del foco fueron corregidas y pasaron de forma aislada.
- `pnpm run build` pasó; el CSS servido comprimido queda en 7.17 kB, por debajo
  del límite E2E de 8 kB.

## Pendiente obligatorio antes de declarar la feature terminada

1. Ejecutar `pnpm.cmd exec playwright test --workers=1 --reporter=list` sobre
   un build recién generado. La pasada completa se interrumpió al detectar
   regresiones; se corrigieron, pero la última corrección del fondo de reserva
   del hero aún no se ha repetido contra `tests/e2e/imagenes.spec.ts`.
2. Ejecutar la mutación de los módulos nuevos/modificados. La primera prueba de
   Stryker no produjo informe final por el límite de sesión; también se corrigió
   la advertencia de configuración `"_comment_concurrency"`.
3. Si ambas puertas pasan, actualizar `feature_list.json` a `done` y cerrar
   `progress/current.md` conforme a `AGENTS.md`.

## Comandos seguros para retomar

```powershell
pnpm.cmd run build
pnpm.cmd exec playwright test --workers=1 --reporter=list
pnpm.cmd exec stryker run --mutate src/lib/diseno/contratoRedisenho.ts
pnpm.cmd exec stryker run --mutate src/lib/diseno/tokensColor.ts
pnpm.cmd exec stryker run --mutate src/lib/diseno/rolesDescartados.ts
pnpm.cmd exec stryker run --mutate src/components/Hero-logica.ts
```

En PowerShell se usa `pnpm.cmd` porque la política de ejecución de esta máquina
bloquea el shim `pnpm.ps1`. No incluir el archivo local
`Clarificación de alcance y datos clínicos-handoff.zip`: es un insumo no
versionado, no parte del producto.
