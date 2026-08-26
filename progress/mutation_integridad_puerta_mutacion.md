# Mutación — integridad_puerta_mutacion

Estado de la medición global histórica: **FAIL**. No es una evidencia de cierre
de la feature redefinida de configuración.

> El humano autorizó el 26/08/2026 retirar del alcance la recuperación global
> del producto. Esta medición queda preservada como deuda transparente para una
> feature futura; no se modifica ni se usa para certificar la corrección de
> configuración entregada ahora.

## Medición oficial, única y completa

- Comando: `bin/harness mutate`, sin objetivo selectivo; salida `1`.
- Inicio/fin: 26/08/2026 17:42–18:57 (75 min 8 s).
- Precondición comprobada: no había otro proceso de Stryker antes de iniciarla;
  no se lanzó ninguna segunda instancia durante la medición.
- Configuración efectiva: 43 archivos, 2.099 mutantes, runner Vitest,
  `concurrency: 1`, `timeoutMS: 60000`.
- Dry run: 970 tests verdes en 2 min 28 s.
- Informe primario: `reports/mutation/mutation.json` (schema `1.0`).

| Resultado | Cantidad |
| --- | ---: |
| Killed | 2.052 |
| Survived | 35 |
| Timeout | 4 |
| NoCoverage | 8 |
| Runtime/compile errors | 0 |
| Score de mutación | **97,95 %** |
| Umbral `break` | **100 %** |

Stryker terminó con el error real: `Final mutation score 97.95 under breaking
threshold 100`. La puerta `@s3` no cumple el 100 % ni los 0 timeouts; por
consiguiente tampoco puede acreditarse `@s4`.

## Supervivientes que debe tratar TDD

No se declara ningún equivalente: el informe no los clasifica como tales y no
hay una justificación empírica escrita para excluirlos. Los 35 supervivientes
son, por tanto, huecos de prueba hasta que el `tdd_craftsman` demuestre lo
contrario.

| Archivo | IDs y ubicación |
| --- | --- |
| `src/components/Cabecera-logica.ts` | #19, 18:9 |
| `src/components/Faq-logica.ts` | #104, 49:27 |
| `src/components/SelectorPaleta-logica.ts` | #301, 64:7 |
| `src/lib/contraste.ts` | #467, 36:10 |
| `src/lib/telefono.ts` | #1687, 13:24 |
| `src/lib/diseno/rolesDescartados.ts` | #1198, 51:7 |
| `src/lib/diseno/tokensColor.ts` | #1270, 113:34; #1285, 125:10; #1310, 139:41 |
| `src/lib/diseno/escalaTipografica.ts` | #647–657, 74:7/41 y 77:7/41; #659–662, 81:40 y 82:20/28/41 |
| `src/lib/diseno/escenariosHeredados.ts` | #684 y #686, 50:7/46 |
| `src/lib/diseno/hojaGlobal.ts` | #894, 209:16 |
| `src/lib/diseno/inventarioActivosPublicos.ts` | #969–970, 61:50 |
| `src/lib/diseno/movimientoRespetuoso.ts` | #1090, 30:10; #1092, 39:32 |
| `src/pages/PaginaBlog-logica.ts` | #1816 y #1818, 130:7/36 |
| `src/pages/PaginaTienda-logica.ts` | #2090 y #2092, 226:7/41 |

## Timeouts

Los cuatro son de `src/lib/diseno/tokensColor.ts` y están cubiertos; no se
pueden contar como mutantes muertos: #1283 (125:10, operador lógico), #1284
(125:10, condición `true`), #1290 (125:74, bloque vacío) y #1301 (132:5,
asignación `cursor -= UNO`). La regla de la feature exige 0, por lo que son
bloqueantes independientemente del score.

## Sin cobertura y exclusiones

- `NoCoverage`: #1200–1206 de `rolesDescartados.ts` (51:39 y 52–58) y #1420
  de `tokensColor.ts` (315:51). No son equivalentes declarados ni están
  excluidos; requieren decisión basada en evidencia, no ocultarlos.
- Exclusiones de configuración: únicamente `!src/**/*.test.ts` y
  `!src/**/*.test.tsx`, conforme a `@s2`, `@s7` y `@s8`.
- No hubo `RuntimeError` ni `CompileError`. El aviso de Stryker sobre 633
  mutantes estáticos costosos también apareció durante el dry run; es un aviso
  operativo real, no una advertencia de configuración ni una excepción
  admitida por la feature.

## Veredicto y siguiente paso

**FAIL — 97,95 %, 4 timeouts.** No cambiar `feature_list.json` a `done`, no
hacer commit ni push. El siguiente ciclo debe clasificar cada caso con pruebas
reproducibles: añadir los tests que maten los huecos reales y justificar por
escrito, con experimento, cualquier equivalente antes de una nueva medición
oficial.
