# Mutación — feature `pagina_campanas` (id 16)

**Contexto:** ronda 2. Sustituye la ronda 1 de este mismo fichero (conservada
en el historial de git, veredicto FAIL 93.75%). `judge` aprobó
`progress/judge_pagina_campanas.md` (ronda 2, veredicto **APPROVED**), que
delega explícitamente el checkpoint C7 (mutación) a esta medición.
`progress/tdd_pagina_campanas.md` ("Ronda 2 — refuerzo de mutación") documenta
8 tests nuevos (R2.1 a R2.7) dirigidos exactamente a los 8 mutantes
sobrevivientes reales de la ronda 1, cada uno verificado por sabotaje manual,
con git diff de PaginaCampanas-logica.ts vacío (cero cambios de produccion en
esa ronda).

**Veredicto:** PASS

**Score (feature completa, 3 ficheros, bruto):** 130/131 = 99.24%
**Score (feature completa, excluido el unico mutante equivalente):** 130/130 = 100%
(umbral: 1.0 / 100%, harness.config.json -> mutation.threshold;
stryker.config.json -> thresholds.break = 100)

**Timeouts: 0 en las 3 corridas.** Columna # timeout leida antes que el
score en cada corrida (patron informe-de-mutacion-con-timeouts-miente):
0/0/0 -- ninguna corrida necesito repetirse a --concurrency 1 (ya fijado a 1
por defecto en stryker.config.json). Errors: 0 en las 3 corridas.
# no cov: 0 en las 3 corridas.

## Alcance — identificación de ficheros (leído de progress/tdd_pagina_campanas.md)

Ficheros *-logica.ts nuevos o modificados por esta feature, cruzados contra
`git diff --stat HEAD` propio (no solo la bitácora) y contra el glob mutate
de stryker.config.json (src/lib/**/*.ts + src/**/*-logica.ts, .tsx excluido a
proposito -- StrykerJS no muta JSX):

- src/pages/PaginaCampanas-logica.ts (nuevo, git status lo marca `??`) --
  construirCatalogoCampanas, guardas de fallo cerrado, resolverVista,
  otrasCampanas, decidirComportamientoDesplazamiento. Es el objetivo
  principal de esta ronda: aqui viven los 8 tests de refuerzo (R2.1-R2.7).
- src/App-logica.ts (modificado, git diff --stat HEAD: +18/-4) --
  RUTAS_YA_CON_PAGINA_PROPIA + RUTAS_DE_SUBPAGINA extendido para excluir
  /campanas del catch-all. Confirmado sin cambios de produccion desde la
  ronda 1 (ningun test de refuerzo de ronda 2 lo toca) -- se remide de todas
  formas por completitud, tal como pide el encargo.
- src/components/Cabecera-logica.ts (modificado, git diff --stat HEAD:
  +10/-0) -- anade esPaginaActual. Confirmado sin cambios de produccion desde
  la ronda 1. Se remide igual, por completitud.

Confirmado explicitamente excluido de esta medicion (verificado de nuevo en
esta ronda, no solo heredado de la ronda 1): `git diff --stat HEAD -- src/components/CampanasPortada-logica.ts`
no muestra ninguna diferencia: el fichero sigue intacto, 0 lineas tocadas por
pagina_campanas. Ya tiene su propia medicion aprobada al 100% bajo la feature
campanas_portada (id 9, progress/mutation_campanas_portada.md, ronda 2). No
se remide aqui porque no hay superficie nueva o modificada que lo justifique.

src/data/campanas.ts queda fuera del glob mordible (no es *-logica.ts ni
vive en src/lib) -- mismo criterio ya aplicado y documentado en
progress/mutation_campanas_portada.md para equipo.ts/servicios.ts/
galeria.ts/campanas.ts: dato de catalogo, no logica de decision propia del
proyecto.

## Cómo se corrió (3 corridas independientes, nunca en paralelo)

Verificado antes de la primera corrida y entre cada una
(Get-CimInstance Win32_Process, filtro por linea de comandos completa con
"stryker"): sin ninguna corrida de Stryker viva salvo la que se acababa de
lanzar; los node.exe ajenos eran tooling del IDE (acp-agents/codex-acp),
confirmados por su linea de comandos completa, no procesos de esta prueba.

`bin/harness mutate src/pages/PaginaCampanas-logica.ts` probado primero tal
cual (sin workaround): falla con "Cannot find TestRunner plugin vitest" --
mismo problema conocido y ya documentado en la ronda 1 de esta misma feature
y en progress/mutation_campanas_portada.md, progress/mutation_ensamblaje_landing.md,
etc. Workaround ya validado en este proyecto, usado para las 3 corridas:

```
pnpm exec stryker run --mutate src/pages/PaginaCampanas-logica.ts --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/App-logica.ts --plugins @stryker-mutator/vitest-runner
pnpm exec stryker run --mutate src/components/Cabecera-logica.ts --plugins @stryker-mutator/vitest-runner
```

--concurrency 1 ya fijado en stryker.config.json. Ningun fichero de
configuracion ni de src/ o de test fue tocado durante esta medicion.

## Resultado por fichero (medición oficial, ronda 2)

| Fichero | total | killed | survived | # timeout | # no cov | # errors | score |
| --- | --- | --- | --- | --- | --- | --- | --- |
| src/pages/PaginaCampanas-logica.ts | 97 | 97 | 0 | 0 | 0 | 0 | 100.00% |
| src/App-logica.ts | 10 | 10 | 0 | 0 | 0 | 0 | 100.00% |
| src/components/Cabecera-logica.ts | 24 | 23 | 1 | 0 | 0 | 0 | 95.83% |
| Total feature (bruto) | 131 | 130 | 1 | 0 | 0 | 0 | 99.24% |
| Total feature (excluido el equivalente) | 130 | 130 | 0 | - | - | - | 100% |

---

## src/pages/PaginaCampanas-logica.ts -- 97/97 = 100%

Cero mutantes sobrevivientes. Los 8 huecos reales documentados en la ronda 1
(errorPuntoNoPublicado body vaciado; defaults de id/bloque/imagen de
normalizarCampana; .trim() del filtro de titulo; .trim() de idParam; default
'' de idParam con campana ausente) estan todos matados por los 8 tests de
refuerzo R2.1-R2.7 de progress/tdd_pagina_campanas.md, confirmado por esta
corrida independiente (no delegada al relato de tdd_craftsman): el resumen
clear-text y reports/mutation/mutation.json de esta corrida muestran 97/97
killed, 0 survived, 0 NoCoverage.

Hallazgo adicional respecto a la ronda 1 (documentado por transparencia, no
cambia el veredicto): la ronda 1 habia excluido como "equivalente genuino" un
par de mutantes en la linea 115 (return { tipo: 'listado' } -> return {} /
return { tipo: '' }, ids 75/76), con una verificacion independiente por
busqueda de consumidores que concluia que ningun punto de
PaginaCampanas.tsx compara vista.tipo === 'listado' explicitamente. En esta
corrida esos dos mutantes ya no sobreviven: aparecen como killed. Explicacion
mas probable, verificada contra la bitacora: el test nuevo R2.7
(resolverVista([], null), describe "refuerzo... resolverVista trata un
parametro campana completamente ausente...") llama directamente a
resolverVista y compara el objeto devuelto con toEqual({ tipo: 'listado' })
-- una asercion de igualdad profunda sobre el valor de retorno completo, no
solo sobre el efecto observable en el DOM a traves del unico consumidor. Con
los mutantes de la linea 115 activos, esa comparacion falla ({}/{tipo:''} no
son iguales a {tipo:'listado'}), asi que el test los mata como efecto
colateral de cubrir la linea 113. No hace falta invocar la excepcion de
equivalencia para estos dos mutantes en esta ronda: estan muertos, sin
ambiguedad.

---

## src/App-logica.ts -- 10/10 = 100%

Sin cambios respecto a la ronda 1 (fichero no tocado en el refuerzo de ronda
2): remedido por completitud, mismo resultado -- 10/10, sin supervivientes.
RUTAS_YA_CON_PAGINA_PROPIA y el .filter() extendido de RUTAS_DE_SUBPAGINA,
matados por el test unico y exacto de src/App-logica.test.ts (comparacion
estricta contra el literal ['/blog', '/tienda']).

---

## src/components/Cabecera-logica.ts -- 23/24 = 95.83% bruto, 23/23 = 100% excluido el equivalente

Sin cambios respecto a la ronda 1 (fichero no tocado en el refuerzo de ronda
2, y esPaginaActual -- soporte directo de @s1 de esta feature -- sigue al
100%): remedido por completitud, mismo resultado exacto que la ronda 1,
incluido el unico superviviente.

### Mutante equivalente -- 1, re-verificado y excluido

#### src/components/Cabecera-logica.ts:18 -- esMovil, guarda de ancho no medible (EqualityOperator)

```
export function esMovil(anchoVentana: number): boolean {
  if (!(anchoVentana > 0)) {
    return true
  }
  return anchoVentana < PUNTO_DE_CORTE_NAVEGACION_PX
}
```

Mutante: la comparacion estricta anchoVentana > 0 de la guarda pasa a ser
no-estricta (anchoVentana >= 0). PUNTO_DE_CORTE_NAVEGACION_PX vale 1024.

Verificacion independiente por analisis exhaustivo de todo el dominio de
number (re-confirmada en esta ronda contra el codigo fuente actual, linea
por linea -- no se dio por buena la justificacion de la ronda 1 sin releer el
fichero):

- Negativo (p. ej. -5): ambas variantes de la guarda entran, ambas retornan
  verdadero. Igual.
- Cero exacto: la guarda original entra (retorna verdadero); la guarda
  mutada NO entra, pero cae a la linea siguiente, que compara cero contra
  1024 y tambien da verdadero. Igual, por camino distinto.
- Entre cero y 1024 (p. ej. 500): ninguna variante entra en la guarda; ambas
  caen a la misma comparacion final, mismo resultado. Igual.
- 1024 o mas (p. ej. 2000): ninguna variante entra en la guarda; ambas caen
  a la misma comparacion final, mismo resultado. Igual.
- NaN: toda comparacion con NaN es falsa, asi que la negacion de la guarda es
  verdadera en ambas variantes por igual. Igual.

La razon estructural no cambio: PUNTO_DE_CORTE_NAVEGACION_PX es positivo, asi
que la rama de repliegue ya evalua a verdadero para el ancho cero por si
sola -- el unico valor donde las dos comparaciones difieren en abstracto, y
ahi coinciden en el resultado por camino alternativo. No hay ningun valor de
anchoVentana en todo el dominio de number para el que las dos variantes de
esMovil devuelvan resultados distintos. Mutante equivalente genuino,
excluido del score con esta justificacion matematica exhaustiva -- mismo
mutante, mismo fichero sin cambios y mismo razonamiento que la ronda 1 de
esta feature y que el precedente de progress/mutation_ensamblaje_landing.md
(mutante del array de dependencias del useEffect de resize). No se abusa de
la via de exclusion: es el unico mutante excluido de las 131 mutaciones
medidas en esta ronda, con prueba exhaustiva del dominio completo, no una
afirmacion sin verificar.

---

## Conclusión

PASS. Score de la feature sobre mutantes no-equivalentes: 130/130 = 100%,
cumple el umbral de harness.config.json -> mutation.threshold (1.0). C7
(progress/judge_pagina_campanas.md) queda satisfecho. Ningun fichero de src/
ni de test fue editado durante esta medicion (regla dura de este rol: mide,
no talla).

Los 8 mutantes sobrevivientes reales de la ronda 1
(src/pages/PaginaCampanas-logica.ts: huecos de errorPuntoNoPublicado,
normalizarCampana x3, filtro de titulo, resolverVista x3) estan todos
matados por los 8 tests de refuerzo de progress/tdd_pagina_campanas.md
("Ronda 2"), confirmado por esta corrida independiente, sin ningun cambio de
produccion. Queda 1 mutante excluido como equivalente genuino, ya presente y
justificado en la ronda 1, re-verificado en esta ronda contra el codigo
fuente actual (src/components/Cabecera-logica.ts:18).

Recomendación para craftsman_lead: con judge en APPROVED y mutacion en PASS
(100% sobre no-equivalentes), la feature pagina_campanas (id 16) cumple las
dos puertas de cierre; puede marcarse done en feature_list.json. Queda
pendiente, no bloqueante para esta feature, la accion de seguimiento ya
anotada por judge en progress/judge_pagina_campanas.md ("Cambios
requeridos", punto 1): una pasada de gherkin_author sobre
features/ensamblaje_landing.feature (@s12 y su cabecera) para retirar
/campanas de la lista de rutas que "sirven el catch-all", ya que el texto
Gherkin de esa feature ajena (ya done) quedo desactualizado por este cambio
pre-aprobado a nivel de spec.
