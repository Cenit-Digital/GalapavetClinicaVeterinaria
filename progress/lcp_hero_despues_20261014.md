# LCP y CLS del hero — «DESPUÉS» de la feature 48 (14/10/2026)

> `tdd_craftsman`, ola 3A. Es la remedida que prometía `progress/lcp_hero_linea_base_20261013.md`
> (apartado «Tras los cambios hay que remedir con el mismo método»), para
> `features/hero_reducido_con_animacion.feature` @s11. La medida la hace el spec
> `tests/e2e/lcp-hero.spec.ts`; los datos de cada pasada salen de su adjunto JSON.
>
> **Resumen.** En la 48 SOLA el candidato final de LCP sigue siendo la foto (`IMG`) en las 20 pasadas, el
> CLS es 0 en todas, y las medianas están muy por debajo de los 2500 ms. Frente a la línea base LOCAL, por
> ejecución: **escritorio, ejecución 1: PEOR** (164 ms frente a 132 ms, +32 ms, +24 %); **escritorio,
> ejecución 2: mejor** (124 ms, −8 ms); **móvil: mejor en las dos ejecuciones** (96 ms frente a 120 ms,
> −24 ms). Que la mediana de escritorio de una de las dos ejecuciones sea peor que la línea base obliga, por
> @s11, a que **la feature NO se cierre sin que Pablo vea el apartado 5 y decida**; este informe no fija
> ninguna tolerancia (el contrato dice que ninguna fuente la da). Que las dos ejecuciones del «después»
> difieran entre sí en 40 ms en escritorio se anota como dato, no como conclusión. El retraso del texto (el
> contrato lo anticipa) SOLO aparece cuando la 49 deje la foto sin poder ser candidata: el apartado 6 lo
> mide con la foto abortada y da ~0,8-0,9 s.

## 1. Entorno declarado

| Dato | Valor |
| --- | --- |
| Tipo de entorno | **LOCAL**: `dist/` construido (`pnpm run build`) y servido con `vite preview --base=/GalapavetClinicaVeterinaria/ --port 4173 --strictPort` en `localhost`, es decir, el `webServer` de `playwright.config.ts`. Sin red real. |
| Navegador | Chromium **151.0.7922.34** headless, Playwright **1.62.1** (medido con `browser.version()`) |
| Sistema | Windows 11 Home 10.0.26300, Node 22.15.0 |
| Limitación | Ninguna de red ni de CPU |
| Fecha y hora (local) | 14/10/2026. Ejecución 1: 07:31:06 → 07:32:12. Ejecución 2: 07:36:08 → 07:37:11 |
| Orden | `pnpm exec playwright test tests/e2e/lcp-hero.spec.ts --workers=1 --reporter=json` (los 20 tests del spec; las pasadas reales son 2 de ellos) |
| Código medido | `HEAD 5baf8ce` más el árbol de trabajo de ese momento. `Hero.tsx` y `Hero.module.scss` son los de `HEAD`; el árbol tenía modificados otros ficheros sin relación con el hero (comentarios de SCSS de otras páginas y specs ajenos) |
| Ruido conocido | Otro agente ejecutaba Vitest en la misma máquina durante las dos ejecuciones (declarado por el `craftsman_lead`). No se midió su efecto; es una fuente de ruido sin cuantificar |

## 2. Método (el de la línea base, apartado 1)

Contexto nuevo por pasada (sin caché), `emulateMedia({ reducedMotion: 'no-preference' })` antes del
`goto`, `PerformanceObserver` de `largest-contentful-paint` con `buffered: true` instalado con
`addInitScript` ANTES del `goto`, `waitUntil: 'networkidle'` más 1,5 s, y el ÚLTIMO candidato. 5 pasadas
por tamaño, en SERIE, y la **mediana**. Medida de laboratorio, no de campo. Diferencias con los scripts
de la línea base, que no cambian el valor: este observador guarda TODOS los candidatos (no solo el último),
comprueba si el candidato está dentro de `#inicio` (el hero), y registra el cierre de cada animación por
fotogramas clave que anima la opacidad. El CLS es la suma de los `layout-shift` sin `hadRecentInput`,
igual que la línea base. Viewport `1440×900` y `390×844`, sin `isMobile` ni táctil (como la línea base).

## 3. Resultado, ejecución 1 (07:31)

| Tamaño | Pasada | LCP (ms) | Elemento LCP | Candidatos | CLS |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | 1 | 208 | `IMG` | 2 (SPAN de la cabecera a 200 → IMG a 208) | 0 |
| 1440×900 | 2 | 184 | `IMG` | 1 | 0 |
| 1440×900 | 3 | 148 | `IMG` | 2 (SPAN 136 → IMG 148) | 0 |
| 1440×900 | 4 | 148 | `IMG` | 2 (SPAN 132 → IMG 148) | 0 |
| 1440×900 | 5 | 164 | `IMG` | 2 (SPAN 148 → IMG 164) | 0 |
| **1440×900** | mediana | **164** | `IMG` en las 5 | | **0 en las 5** |
| 390×844 | 1 | 100 | `IMG` | 2 (SPAN 88 → IMG 100) | 0 |
| 390×844 | 2 | 84 | `IMG` | 1 | 0 |
| 390×844 | 3 | 96 | `IMG` | 2 (SPAN 84 → IMG 96) | 0 |
| 390×844 | 4 | 96 | `IMG` | 2 (SPAN 80 → IMG 96) | 0 |
| 390×844 | 5 | 88 | `IMG` | 1 | 0 |
| **390×844** | mediana | **96** | `IMG` en las 5 | | **0 en las 5** |

## 4. Resultado, ejecución 2 (07:36), para dar idea del ruido entre ejecuciones

| Tamaño | LCP por pasada (ms) | Mediana | Elemento LCP | Candidatos por pasada | CLS |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | 144 · 156 · 112 · 124 · 104 | **124** | `IMG` en las 5 | 2 · 2 · 2 · 2 · 1 | 0 en las 5 |
| 390×844 | 136 · 96 · 104 · 92 · 92 | **96** | `IMG` en las 5 | 2 · 2 · 2 · 2 · 2 | 0 en las 5 |

En todas las pasadas con 2 candidatos, el primero es un `SPAN` **fuera del hero** (área 2665 px² en
escritorio y 2678 en móvil) y el segundo, 0-16 ms después, es la `IMG` **dentro del hero**. El `SPAN` es,
por la estructura de `Cabecera.tsx`, el texto de la marca de la cabecera (el nodo exacto no se ha
inspeccionado). El área de la `IMG` es **1 203 840 px² a 1440×900** (= 1440 × 836: la foto empieza a 64 px,
bajo la cabecera, y por eso su área visible es menor que la ventana y no se descarta) y **304 200 px² a
390×844** (= 390 × 780).

## 5. Comparación con la línea base LOCAL (el mismo entorno)

Solo se compara con la línea base LOCAL de `lcp_hero_linea_base_20261013.md` §2 bis. Las cifras de la web
desplegada (264 ms y 236 ms) son **otro entorno** y no se comparan.

| Tamaño | Antes (LOCAL) | Después, ejecución 1 | Después, ejecución 2 | Lectura |
| --- | --- | --- | --- | --- |
| 1440×900 | 132 ms (pasadas 96-152) | 164 ms (148-208) | 124 ms (104-156) | **Ejecución 1: PEOR (+32 ms, +24 %). Ejecución 2: mejor (−8 ms, −6 %).** Dato, no conclusión: las dos ejecuciones del «después» difieren entre sí en 40 ms. Mismo elemento (`IMG`), mismo CLS (0) |
| 390×844 | 120 ms (pasadas 112-132) | 96 ms (84-100) | 96 ms (92-136) | **Mejor**: −24 ms en las dos ejecuciones. La causa NO se ha investigado y no se afirma ninguna |

**¿Peor, igual o mejor?** Escritorio: **peor en la ejecución 1** (164 ms frente a 132 ms) y mejor en la
ejecución 2 (124 ms). Móvil: **mejor en las dos** (96 ms frente a 120 ms). No se declara «igual»: no hay
tolerancia de regresión que lo permita (el contrato lo dice expresamente), y el hecho de que la dispersión
entre dos ejecuciones sea de 40 ms no la sustituye. Ninguna pasada de las 20 pasa de 208 ms. Cota absoluta
del contrato (mediana ≤ 2500 ms): **se cumple con un margen de más de 15 veces**. **Por @s11, la feature NO
se cierra sin que Pablo vea esta tabla y decida si +32 ms (en una de las dos ejecuciones) es aceptable.**

## 6. Candidatos con animación de opacidad: la cláusula NO aplica en la 48 sola

El contrato pide, para un candidato con animación de opacidad, el instante de CIERRE de su animación y el
de LCP. **En la 48 sola ninguna de las 20 pasadas tiene un candidato animado**: el candidato final es
siempre la `IMG`, que no se anima, y el `SPAN` de la cabecera tampoco. El motivo es el algoritmo de LCP: el
navegador solo emite un candidato nuevo cuando el elemento pintado es MÁS GRANDE que el último, y la foto
(1 203 840 px² en escritorio, 304 200 en móvil) es mucho mayor que el titular (107 598 px² medidos en
escritorio) y que el párrafo (38 808 px² en móvil), así que ni el titular ni el párrafo llegan a ser
candidatos, anímense o no. (MEDIDO; el texto de la especificación del algoritmo no se ha podido consultar
sin internet: **sin verificar en documentación oficial**.)

### Experimento complementario (NO es el sitio tal como se entrega)

Para ver lo que la feature 49 expondrá, se midió el hero REAL, con su CSS real, **abortando la petición de
la foto** (`route.abort()` sobre `clinica.webp`) para que la foto no sea candidata. Script de un solo uso
fuera del repositorio; `vite preview` propio en el 4191, cerrado al acabar. 5 pasadas por tamaño, mismo
método. Cierre = `animationend` de la animación de opacidad que cubre al candidato.

| Tamaño | Candidato final por pasada: LCP / cierre de su animación (ms) | Mediana del LCP |
| --- | --- | --- |
| 1440×900 | `H1` 820 / 815,6 · 792 / 783,4 · 824 / 804,9 · 840 / 835,1 · 852 / 845,2 | **824 ms** |
| 390×844 | `P` 932 / 926,7 · 944 / 922,5 · 904 / 898,0 · 928 / 910,3 · 908 / 904,7 (el `H1` llega antes: 784-812 ms) | **928 ms** |

El candidato animado llega entre **2 y 22 ms después del cierre de su animación** (los 15 candidatos
animados de las 10 pasadas, incluido el `H1` de móvil), y no en su primer fotograma: el texto con fundido
cuenta al terminar la animación. Frente
a la línea base LOCAL, eso es unas **6,2 veces** (escritorio, 824 / 132) y unas **7,7 veces** (móvil,
928 / 120), en línea con lo que anticipaba el contrato (~800-850 y ~930 ms), y sigue por debajo de 2500 ms.
Que la 49 lo haga aceptable es decisión de Pablo, que debe verlo con estas cifras.

## 7. La medida solo vale con `backwards`, y lo que NO ve (MEDIDO en Chromium 151, páginas sintéticas)

Páginas sintéticas con un titular animado como el del hero (700 ms, `ease-out`), servidas con `route` y
visitadas con un `goto` real. Observación de 3 cargas por caso; «ventana» es la espera tras `networkidle`.

| Caso | Resultado | Cláusula que falla |
| --- | --- | --- |
| `backwards`, sin retardo, con cabecera | `H1` a 776-788 ms; cierre de su animación 769,6-783,1 ms | ninguna (control sano) |
| `both` o `forwards`, sin retardo, **sin** otro contenido | 0 candidatos | recuento |
| `both` o `forwards`, sin retardo, **con** cabecera | último candidato = cabecera (`both`: a ~28 ms) | elemento (el último candidato no está en el hero) |
| Página sin contenido pintable | 0 candidatos | recuento |
| `backwards` con 3 s de retardo, ventana de 1,5 s, sin cabecera | 0 candidatos (la lectura se hace a ~2030-2075 ms de la navegación; `networkidle` a ~515-560 ms) | recuento |
| ídem, con cabecera | último candidato = cabecera, a 24-36 ms | elemento |
| ídem, **sin** cabecera y con ventana de 4 s | `H1` a 3724-3732 ms | mediana > 2500 |
| Portada REAL con `clinica.webp` retenida 3 s | último candidato `IMG` en las 3 cargas; el test solo comprueba que la mediana pasa de 2500 ms (el valor exacto no se registra) | mediana > 2500 |

**Límite que conviene que Pablo y el `craftsman_lead` conozcan** (también en la cabecera del spec). Con el
método tal como lo fija el contrato (`networkidle` + 1,5 s) la observación termina a unos 2 s de la
navegación. Un retardo de entrada de 3 s NO se ve: sin otro contenido da 0 candidatos y con la cabecera
delante el último candidato es la cabecera, a ~30 ms. La cláusula «mediana ≤ 2500 ms» solo salta si el
candidato se llega a observar (o si la propia red retiene `networkidle`). Por eso el spec lleva TRES
cláusulas juntas (recuento, elemento, mediana). El «un titular con retardo de 3 s da 3852 ms» del
contrato **no se reproduce con la espera de 1,5 s**: salió 3724-3732 ms con 4 s de espera, en una página
sintética. Con `both` o `forwards` y otro contenido estático (en la 48 sola, la foto), ninguna cláusula de
este spec lo distingue: lo ve la del relleno computado de `hero-reducido.spec.ts` (@s5).

## 8. Puertas y verificación de esta medida

- `pnpm exec playwright test tests/e2e/lcp-hero.spec.ts --workers=1`: **20 pasadas, 0 fallos**, dos veces (1 min cada una).
- `pnpm run lint` 0 errores y 0 avisos; `pnpm run typecheck` (`tsc -b`) y `pnpm exec tsc -p tsconfig.e2e.json --noEmit`: exit 0.
- `pnpm exec vitest run src/lib/diseno/medicionEstableSpecsReales.test.ts` (la comprobación estática de @s10 sobre
  todos los specs, con `lcp-hero.spec.ts` presente): 4 pasadas. No se tocó `medicionEstable.ts`.
- 4173 libre al terminar; ningún proceso mío abierto.

## 9. Qué falta, y de quién es la decisión

**Pablo debe ver los apartados 5 y 10 antes de que la 48 se cierre** (@s11 lo exige cuando una mediana es peor): en
escritorio la ejecución 1 de 3A salió peor que la línea base (+32 ms) con otro agente midiendo en paralelo, y con la
máquina en reposo (apartado 10) las cuatro medianas salen igual o mejores. Además, antes de cerrar la 49, debe ver el apartado 6 (824 ms
en escritorio y 928 ms en móvil con la foto fuera de juego, frente a 132 y 120 ms) y el límite del apartado 7. Las cláusulas «lo verifica el judge» de @s11 (elemento por carga, cierre de la
animación, comparación del mismo entorno, regresión) quedan escritas aquí para su lectura.

## 10. Remedida del `craftsman_lead` con la máquina en reposo (14/10/2026, 08:27-08:30)

Las dos ejecuciones de los apartados 3 y 4 se hicieron mientras OTRO agente ejecutaba Vitest en la misma
máquina (declarado en el apartado 1: ruido sin cuantificar). Para quitar esa fuente de ruido, el lead repitió
la medida real DOS veces con la máquina en reposo (sin ningún agente ni otra tarea en marcha: 4173 libre antes,
ningún proceso node ajeno) y con el mismo spec, el mismo método y el mismo entorno LOCAL (`dist/` servido con
`vite preview`, Chromium 151.0.7922.34, Windows 11): `pnpm exec playwright test tests/e2e/lcp-hero.spec.ts
--workers=1 --reporter=json`, 20 pasadas en cada ejecución (2 medidas reales de 5 cargas y 18 pruebas de que la
medida muerde), 0 fallos.

| Tamaño | Antes (LOCAL) | Reposo, ejecución 1 | Reposo, ejecución 2 | Elemento | CLS |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | **132 ms** (96-152) | **116 ms** (176 · 164 · 116 · 96 · 108) | **128 ms** (168 · 128 · 116 · 144 · 124) | `IMG` en las 10 | 0 en las 10 |
| 390×844 | **120 ms** (112-132) | **96 ms** (124 · 96 · 92 · 96 · 104) | **104 ms** (96 · 104 · 100 · 132 · 144) | `IMG` en las 10 | 0 en las 10 |

**Lectura.** Con la máquina en reposo ninguna de las cuatro medianas es peor que la línea base local: escritorio
−16 ms y −4 ms; móvil −24 ms y −16 ms. La subida de +32 ms del apartado 3 (ejecución 1 de 3A) coincide con la
carga de Vitest en paralelo y no se reproduce. La conclusión del apartado 5 se mantiene y se refuerza: **en la 48
sola no hay regresión de LCP**; el candidato sigue siendo la foto, que no se anima, y la cláusula del cierre de la
animación no aplica (apartado 6). Los datos crudos están en el scratchpad de la sesión (`lcp_q1.json`,
`lcp_q2.json`), no en el repositorio.
