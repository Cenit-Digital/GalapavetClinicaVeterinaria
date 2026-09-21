# Línea base del arnés — 20/09/2026, antes de tocar una sola línea de `src/`

Medida con los códigos de salida REALES (un `$?` después de un pipe devuelve el
del último comando de la tubería, no el del que interesa: el primer intento de
esta medición tenía ese defecto y se rehízo).

| Puerta | Comando | Resultado |
| --- | --- | --- |
| Lint | `pnpm run lint` (`oxlint --deny-warnings`) | **exit 0** |
| Tipos | `pnpm run typecheck` (`tsc -b`) | **exit 0** |
| Unitarias | `pnpm run test` (`vitest run`) | **88 ficheros · 1415 tests · 1415 pasan** (199 s) |
| Config del arnés | `pnpm run test:config` | **5 / 5** |
| Navegador real | `pnpm run test:e2e` (27 specs de Playwright) | **167 tests · 167 pasan** (49 s) |

**Total: 1587 pruebas en verde, 0 fallos, 0 avisos.**

## Por qué existe este documento

Pablo exige cerrar con «0 fallos, 0 errores, 0 warnings». Sin una foto de
partida esa frase no se puede demostrar: si al final algo está en rojo, no hay
forma de distinguir lo que ha roto esta tanda de lo que ya venía roto. Con esta
foto, sí.

Importa especialmente que los **167 de Playwright estén en verde HOY**, porque
`.github/workflows/harness-ci.yml` NO los ejecuta (solo corre build, vitest y
test:config). Los tres informes de contrato de esta sesión avisan de que los
rojos de Playwright serían «silenciosos». Con esta medición dejan de poder
serlo: hay un número contra el que comparar.

## Cómo reproducirla

El servidor de `vite preview` debe levantarse DESDE POWERSHELL (Git Bash
convierte `--base=/X/` en una ruta de Windows y lo rompe) y escucha solo en
IPv6, así que se ataca por `localhost`, nunca por `127.0.0.1`:

    pnpm exec vite preview --base=/GalapavetClinicaVeterinaria/ --port 4173 --strictPort

`playwright.config.ts` reutiliza ese servidor si ya está arriba
(`reuseExistingServer: !process.env.CI`), de modo que la medición se hace sobre
el `dist/` construido, no sobre el servidor de desarrollo.
