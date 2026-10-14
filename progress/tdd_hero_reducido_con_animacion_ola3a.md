# TDD — feature 48 `hero_reducido_con_animacion`, ola 3A: la prueba y la medida del LCP (@s11)

> `tdd_craftsman`, 14/10/2026. Contrato firmado por Pablo el 13/10/2026:
> `features/hero_reducido_con_animacion.feature` @s11. Esta ola NO toca `src/`: el sujeto de @s11 (el hero ya
> animado) existía desde la ola 2. Lo que se escribe son un spec de navegador y dos informes.
>
> **Estado: VERDE.** `pnpm exec playwright test tests/e2e/lcp-hero.spec.ts --workers=1`: **20 pasadas, 0 fallos**
> (dos ejecuciones, 1 min cada una, con el árbol final) y, con los trabajadores por defecto y `--repeat-each=3`
> junto a otros cinco specs de navegador, **297 pasadas, 0 fallos** (sección 8). Lint, `tsc -b` y
> `tsc -p tsconfig.e2e.json` limpios.
> Stryker NO ejecutado (regla de la ola). Los tests están sometidos a SABOTAJE A MANO (sección 4), que NO es una
> prueba de mutación y no la sustituye.

## 1. Ficheros

**Nuevos:** `tests/e2e/lcp-hero.spec.ts` · `progress/lcp_hero_despues_20261014.md` · este informe.
**No tocados:** `src/`, `medicionEstable.ts` y su test, `features/`, `feature_list.json`, `progress/current.md`,
`project-spec.md`, y todo lo del otro agente. Sin `git add/commit`. Los scripts de un solo uso y los datos
crudos (`medida1.json`, `medida2.json`, `sin_foto.cjs`, `sint1.cjs`) están en el scratchpad, no en el repo.

## 2. Qué hace el spec (20 tests, 3 grupos)

| Grupo | Tests | Qué demuestra |
| --- | --- | --- |
| La medida REAL | 2 (uno por tamaño: 1440×900 y 390×844) | 5 cargas EN SERIE con el método de la línea base; `valorarLasCargas` da `[]`; adjunta el JSON de cada pasada. `test.setTimeout(120 s)` propio. NO usa `esperarEntradaTerminada` |
| La medida MUERDE | 11 (10 sintéticos + 1 sobre la portada real) | Se pone en rojo con: titular con 3 s de retardo (con la espera del método, sin y con cabecera; con una espera de 5 s), `both` y `forwards` (sin y con cabecera), página vacía, y la portada REAL con la foto retenida 3 s. Más un control sano y el registro del cierre de la animación |
| La valoración aislada | 7 | Cada cláusula y sus bordes (recuento, elemento, mediana, `≤` en 2500 / 2501, mediana par, ninguna carga con candidato) sin navegador |

Las TRES cláusulas están escritas UNA sola vez, en `valorarLasCargas`: la medida real y las pruebas de que
muerden usan la misma función (si no, las pruebas comprobarían una copia). Cláusulas: (1) cada carga tiene
≥ 1 candidato; (2) el último candidato está dentro del hero (`#inicio`); (3) la mediana de los instantes del
último candidato es ≤ 2500 ms. Las cargas de los tests sintéticos y de la portada con la foto retenida van en
PARALELO (3 por caso) a propósito; las de la medida real, en serie.

## 3. Ciclos Rojo-Verde-Refactor

El primer ROJO fue un fallo de compilación (Ley 2): `tsc -b` incluye `tests/e2e`, así que una función sin
declarar rompe `pnpm run build` y por tanto el `webServer` de Playwright (exit 2, «Process from
config.webServer was not able to start»). Para tener ROJOS por aserción, cada ciclo parte de una función que
compila y devuelve algo deliberadamente falso.

| Ciclo | `@s11` | Test que falla primero | Cambio mínimo |
| --- | --- | --- | --- |
| 1 | base | `cinco cargas dentro del umbral… no dan ningún fallo` (el stub devolvía `['sin implementar']`) | `valorarLasCargas` devuelve `[]` |
| 2 | recuento > 0 | `una carga sin ningún candidato observado es un fallo que nombra esa carga` | un fallo por carga sin candidatos |
| 3 | elemento esperado | `un último candidato que no está en el hero… es un fallo` | `fallosDeUnaCarga` comprueba `enElHero` |
| 4 | mediana ≤ 2500 | `la mediana por encima de 2500 ms es un fallo, y una sola carga lenta… no lo es` | `mediana` y `fallosDeLaMediana` |
| 5 | bordes | `el umbral es «menor o igual»`, `…número par…`, `sin ningún candidato en ninguna carga…` | ninguno: **pasaron a la primera**; se comprobaron con los sabotajes S3, S4 y S6 |
| 6 | la medida | `una portada sana, con el relleno "backwards"… da cargas válidas…` (el stub de `medirCarga` devolvía 0 candidatos) | `instalarLaObservacion`, `medirCarga` |
| 7 | cierre de la animación | `el titular con fundido cuenta al TERMINAR su animación…` | ninguno: pasó a la primera con lo del ciclo 6; comprobado con S7 |
| 8 | puerta que muerde | los 8 casos sintéticos (retardo de 3 s en tres variantes, `both` y `forwards` con y sin cabecera, vacía) | ninguno: **pasaron a la primera**, como caracterizaciones del hueco medido en `sint1.cjs` antes de escribirlos; comprobados con S1, S2, S5 y S6 |
| 9 | la medida real | las dos pasadas reales y la de la foto retenida | ninguno: pasaron a la primera; comprobado con S5 (selector del hero erróneo: se ponen en rojo las dos reales) |
| REFACTOR | | con la barra verde: reordenado en secciones, constantes con nombre, `servirPaginaSintetica`, regex de fallos como constantes, `toSorted` y renombrado de una variable sombreada (oxlint) | los 20 siguen verdes |

Honestidad sobre los ciclos 5, 8 y 9: «un test que pasa a la primera no demuestra nada». Por eso el sabotaje.

## 4. Sabotaje a mano (cada uno revertido y el spec restaurado byte a byte)

| # | Sabotaje | Resultado |
| --- | --- | --- |
| S1 | `enElHero` siempre `true` | 3 en rojo: retardo de 3 s con cabecera, `both` con cabecera, `forwards` con cabecera |
| S2 | la espera ignora el parámetro (siempre 1,5 s) | 1 en rojo: la de espera larga |
| S3 | umbral con `>=` | 1 en rojo: el de `≤` en 2500 |
| S4 | mediana par = la menor de las dos centrales | 1 en rojo: el de la mediana par |
| S5 | selector del hero `#otro` | 12 en rojo, **incluidas las dos medidas reales** y la de la foto retenida |
| S6 | sin fallo de recuento | 6 en rojo (los de 0 candidatos) |
| S7 | el cierre de la animación no se registra | 1 en rojo: el del cierre |

NO cubierto por sabotaje, y por qué: `emulateMedia({ reducedMotion: 'no-preference' })` (el valor por defecto
de Chromium headless en esta máquina ya es `no-preference`: quitarlo no cambia ningún resultado; es disciplina
del contrato, no un comportamiento que un test pueda separar aquí), `waitUntil: 'networkidle'` (ningún test separa `networkidle` de `load` en esta página) y el contexto nuevo por carga (sin caché: no hay forma de observar la
caché desde el spec).

## 5. Trazabilidad `@s11` → test (nombre, nunca número de línea)

| Cláusula de @s11 | Test |
| --- | --- |
| 5 cargas a 1440×900 y 5 a 390×844, método de la línea base, sin `esperarEntradaTerminada` | `la portada real a escritorio 1440x900, 5 cargas en serie…` y `la portada real a móvil 390x844, 5 cargas en serie…` |
| el recuento de candidatos es > 0 en cada carga | las dos medidas reales (`valorarLasCargas`); `una carga sin ningún candidato observado es un fallo…`; `con el relleno "both"/"forwards" el titular animado nunca llega a ser candidato…`; `una página sin ningún contenido pintable…` |
| la mediana de cada tamaño es ≤ 2500 ms | las dos medidas reales; `la mediana por encima de 2500 ms es un fallo…`; `el umbral es «menor o igual»…`; `con una espera más larga que la del método, el titular con 3 s de retardo SÍ se ve…`; `sobre la portada REAL, con su foto retenida 3 s…` |
| solo válida con `backwards`; con `both`/`forwards` el titular nunca es candidato | `con el relleno "both" y una cabecera con texto…`, `con el relleno "forwards" y una cabecera con texto…` (más los de 0 candidatos). La comprobación del relleno computado vive en `hero-reducido.spec.ts` @s5: aquí solo está documentada |
| no se exige que el candidato sea la imagen | la valoración no mira la etiqueta; `una portada sana…` tiene como candidato final un `H1` y pasa |
| el informe dice el elemento en cada carga | `progress/lcp_hero_despues_20261014.md` §3-§4 (lo verifica el `judge`) |
| el texto con fundido cuenta al terminar la animación; el informe registra cierre y LCP | `el titular con fundido cuenta al TERMINAR su animación…` (el registro); informe §6 (lo verifica el `judge`) |
| medianas y elementos junto a la línea base del mismo entorno, sin comparar entornos | informe §5 (lo verifica el `judge`) |
| si la mediana de después es peor, el informe lo dice y la feature NO se cierra sin Pablo | informe §5: escritorio **peor en la ejecución 1 (+32 ms, +24 %)** y mejor en la 2 (−8 ms); móvil mejor en las dos (−24 ms). **Pablo debe verlo antes de cerrar la 48** (lo verifica el `judge`) |

## 6. La comprobación estática de @s10 con el spec presente

`pnpm exec vitest run src/lib/diseno/medicionEstableSpecsReales.test.ts`: **4 pasadas, en verde** con
`lcp-hero.spec.ts` ya dentro. No hizo falta excepción ni tocar `medicionEstable.ts`: ningún bloque `test(` del
spec usa ninguna llamada de la lista cerrada de medir (`getBoundingClientRect`, `boundingBox`,
`scrollHeight`…, `getComputedStyle`, `AxeBuilder`, capturas), así que la comprobación los da por «exentos». El
área del candidato sale de `entry.size`, nunca de la geometría de la caja.

## 7. Desvíos y límites del contrato (resumen; el detalle medido, en `lcp_hero_despues_20261014.md` §7)

1. **La ventana de observación del método (`networkidle` + 1,5 s ≈ 2,0 s desde la navegación) no alcanza a
   ver una entrada que acabe más tarde.** MEDIDO: con un retardo de 3 s, 0 candidatos (sin otro contenido) o el
   texto de la cabecera a ~30 ms; el titular solo aparece, a 3724-3732 ms, con una espera de 4 s. Por tanto
   «la mediana ≤ 2500 ms» NO puede ponerse en rojo por un retardo de entrada de más de ~2 s; solo lo atrapan el
   recuento y el elemento, y solo en las condiciones dichas. El «un retardo de 3 s da 3852 ms» del contrato no
   se reproduce con la espera de 1,5 s. Arreglarlo exige cambiar el contrato (p. ej. un suelo de observación),
   decisión del `craftsman_lead` y de Pablo.
2. **«El elemento esperado» (el último candidato está dentro de `#inicio`) es mi interpretación.** El
   contrato dice «no se exige que el candidato sea la imagen: puede ser el titular o el párrafo»; la cláusula
   respeta eso (cualquier elemento del hero vale) y añade que el candidato no sea la cabecera. Se apoya en el
   encargo («…o el elemento esperado FALLA») y es lo que atrapa `both`/`forwards` y el retardo cuando hay
   cabecera.
3. **`both`/`forwards` con otro contenido estático dentro del hero (en la 48 sola, la foto) no lo ve ninguna
   cláusula de este spec**: solo lo ve el relleno computado de `hero-reducido.spec.ts` @s5. Es lo que dice el
   contrato («la comprobación del relleno ya vive en @s5»), pero conviene saberlo.
4. El contrato dice que `both`/`forwards` deja la lista de candidatos «vacía o en el texto de la cabecera y
   hace fallar la cláusula del recuento». Con el texto de la cabecera presente el recuento NO falla (hay un
   candidato); falla la del elemento. Sin otro contenido, sí falla el recuento.
5. Un test por tamaño, no uno con las 10 cargas: cada uno lleva su propio `setTimeout` de 120 s y falla por
   separado. Las cargas de cada test van en serie, como pide el encargo.
6. **Sin verificar en documentación oficial** (sin internet; solo MEDIDO en Chromium 151): que un candidato
   nuevo de LCP exige un área mayor que el anterior (por eso el titular nunca desbancaría a la foto), que el
   texto con opacidad animada cuenta al terminar la animación, el paso 7 del algoritmo (descartar un
   elemento que cubre la ventana) y los 2500 ms como umbral «bueno» de campo (citados del contrato).
7. `tsc -b` incluye `tests/e2e`: un spec que no compila rompe `pnpm run build` y el `webServer` entero. Es
   cierto para cualquier spec nuevo, y explica que el primer ROJO fuera un exit 2 de arranque.

8. **La mediana de escritorio de la ejecución 1 es PEOR que la línea base LOCAL** (164 ms frente a 132 ms,
   +32 ms, +24 %); la de la ejecución 2 es mejor (124 ms). Por @s11 la 48 no se cierra sin que Pablo lo vea. No
   se usa la dispersión entre ejecuciones (40 ms) como tolerancia: nadie ha fijado una.

## 8. Estabilidad con varios trabajadores

Las ejecuciones verdes anteriores (las dos de la medida real) eran con `--workers=1`. Como `pnpm run test:e2e` corre este spec
junto a los de otros ficheros y con 0 reintentos, se repitió con el número de trabajadores por defecto de
Playwright, `--repeat-each=3`, junto a `hero-reducido`, `movimiento`, `hero-entrada-cls`,
`esperar-entrada-terminada` y `fidelidad-hero`: **297 pasadas, 0 fallos, exit 0, 1,4 min**, de las cuales 60
son las de `lcp-hero.spec.ts` (20 × 3). **No se ejecutó `pnpm run test:e2e` completo en esta ola**: el árbol
tiene specs de otro agente a medias; queda como pendiente para el cierre.

## 9. Procesos y limpieza

4173 libre al terminar; el `vite preview` del experimento (4191) lo lanzó y cerró el propio script; ningún
`node` ni Chromium mío queda. `test-results/` (ignorado por git) lo regenera cada ejecución de Playwright.
Otro agente ejecutaba Vitest en paralelo durante las dos medidas reales: ruido sin cuantificar.
