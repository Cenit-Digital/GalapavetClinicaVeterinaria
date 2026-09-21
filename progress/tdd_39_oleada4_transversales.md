# Feature 39 — Oleada 4 de 4: LAS PUERTAS TRANSVERSALES (F1, F2, E4)

> `tdd_craftsman`, 21/09/2026. Contratos: `features/rediseno_visual.feature`
> @s7, @s11, @s14 y @s52; `features/accesibilidad.feature` @s19-@s22 y su nota
> canónica de política de movimiento (sección D).
>
> Estado que dejo: **lint, typecheck, Vitest y los 27 specs de Playwright en
> VERDE**, y con ellos los dos rojos que la oleada 3 dejó vivos a propósito.

---

## 1. Los números, literales

| Medida | Al empezar (lo que me dejó la oleada 3) | Al terminar |
| --- | --- | --- |
| `pnpm run lint` (oxlint) | — | **exit 0**, sin avisos |
| `pnpm run typecheck` (`tsc -b`) | — | **exit 0** |
| `pnpm run test` (Vitest) | 88 ficheros · **1410** tests · 1410 pasan | 88 ficheros · **1410** tests · 1410 pasan, exit 0 |
| `pnpm run test:e2e` (27 specs) | 174 tests · **172 pasan, 2 ROJOS** | **174 · 174 pasan**, exit 0 |
| `pnpm run test:config` | — | 5/5, exit 0 |
| `pnpm run build` | — | exit 0, puerta de terceros incluida |

**POR QUÉ VITEST NO DA LOS 1415 DE MI ENCARGO, Y NO ES UN PROBLEMA.** El 1415
es la línea base **anterior** a la feature 39 (`progress/linea_base_20260920.md`
línea 11). Las oleadas 1-3 retiraron 5 tests al retirar la lógica que
describían, y me entregaron **1410** (así lo dice el punto 3 de
`progress/tdd_39_oleada3_pie.md`). Lo verifiqué **antes** de tocar nada: 88
ficheros / 1410, exit 0.

Mi oleada deja el recuento **exactamente igual, 1410**, y eso es un neto, no un
empate casual: **borro 1 `it`** (`matrizDeContraste.test.ts`, el que se quedaba
sin sujeto) y **añado 1 `it`** (el disparador de @s7). Los dos cambios están
abajo, cada uno con su porqué.

El 167 de Playwright de la línea base tampoco es comparable: las oleadas
anteriores añadieron specs y hoy el total es **174**, en los mismos **27**
ficheros.

---

## 2. Los ciclos Rojo → Verde → Refactor, en orden

### Ciclo 1 — F1: fuera las dos filas huérfanas de la matriz de contraste

Se hizo en **cuatro pasos de rojo y uno de verde**, y en ese orden a propósito:
la fila no se podía borrar antes de que las puertas que la contaban dijeran la
verdad nueva, porque entonces la suite se habría quedado rota entre medias.

**ROJO 1 — el disparador de @s7, escrito primero y verificado en rojo.**
`matrizDeContraste.test.ts`, `it` nuevo al final del bloque de @s7. Afirma las
dos cláusulas nuevas del contrato: el recuento de ficheros de estilos del
inventario que pintan alguna tinta sobre el rojo de urgencia es **0**, y el de
filas de la matriz que lo declaran como fondo también es **0**. Corrido solo:
**1 test rojo de 44**, y el fallo fue exactamente el esperado —
`expected [ { rol: 'sobre-primario', … } ] to deeply equal []` —, es decir: el
barrido de las hojas ya daba 0 (las oleadas 1 y 2 retiraron el SCSS) y lo único
que seguía declarando el par era la matriz.

Para ese `it` hizo falta un corpus nuevo en el fichero de test,
`ESTILOS_REALES_DEL_INVENTARIO`: los `*.module.scss` de `components/` y
`pages/` más `_api.scss` y `global.scss`, leídos con `import.meta.glob(…?raw)`.
Las dos hojas compartidas entran con el criterio que `usoDelAcento.test.ts` ya
tenía escrito —**pueden añadir hallazgos, nunca ocultarlos**—; `_tokens.scss`
se queda fuera porque ahí el rojo se **declara**, no se usa.

**La anti-vacuidad está dentro del propio `it`, y es la parte que importa**:
antes de filtrar por `urgencia` se exige que el corpus tenga ficheros y que el
barrido encuentre parejas de verdad. Sin esas dos líneas, «0 sobre urgencia»
también se cumpliría con el corpus vacío o con un barrido que no mirara nada, y
el disparador sería decorativo.

**ROJO 2 — el primer `it` de @s7, reescrito para que no dependa de la matriz.**
Leía el par con `MATRIZ_DE_USO_DEL_SISTEMA.filter(…)`; al borrar la fila se
habría quedado recorriendo una lista vacía. Ahora el par se escribe **a mano**
(`PAR_DE_TINTA_SOBRE_URGENCIA`) y los dos colores se siguen leyendo del texto
real de `_tokens.scss`, variante a variante. Gana dos aserciones que antes no
tenía: el **fondo** resuelto también se compara contra
`leerTokenDeVariante(…, 'urgencia')`, y se exige `veredicto === 'aprobado'` en
las cinco. Este paso **no** estaba rojo ni antes ni después: es la mitad del
pivote de @s7 («de qué se pinta» a «qué sigue siendo apto»), y lo dejo dicho en
vez de presentarlo como un rojo que no fue.

**NO caí en la trampa de vacuidad que el contrato avisa**: `:114` no se ha
«reparado» a `.toEqual([])`. Ese `it` sigue afirmando contraste sobre los cinco
tokens reales.

**ROJO 3 — los cuatro recuentos, en el mismo paso.** 25 → **23** filas, 25 →
**23** claves únicas, y 125 → **115** parejas en **los dos sitios** (el test del
recorrido completo y el del sabotaje). El `:463` de las claves únicas estaba
**enmascarado** por el `:446` de las filas, como avisaba el contrato: los dos se
cambiaron a la vez, así que no hubo segunda vuelta.

**ROJO 4 — el último `describe`.** Su título («la matriz refleja la píldora de
urgencias de contacto…») dejó de ser cierto en su primera mitad. Reescrito
entero a «la matriz no declara ningún fondo de urgencia, ni el rojo fuerte ni su
variante suave», con la historia de sus dos cambios de título escrita encima.
Dentro:
- la aserción que exigía la fila `urgencia` sobre `sobre-primario` se **invierte**
  a «ninguna fila declara `urgencia` como fondo»;
- la de `urgencia-suave` se **conserva**, y se escribe lo que es: una
  antirregresión **trivial** —ese rol no ha tenido nunca fila—, que se queda
  porque el token sigue declarado en las cinco variantes;
- el `it` «esa fila aprueba 4.5 en las cinco variantes» se **BORRA**, en el
  mismo paso que la fila. No se «repara» a 0 ni a `'suspenso'`: eso solo
  duplicaría la guarda de fallo cerrado sobre la matriz vacía que ya prueban los
  dos `it` de @s11.

Tras los cuatro pasos, corrido el fichero: **5 tests rojos de 43**. Cuadra con
los 6 que el contrato midió: las 6 aserciones rojas vivían en 6 `it`, y uno de
esos `it` es justo el que borré en vez de repararlo.

**VERDE — una sola retirada, atómica.** `matrizDeContraste.ts`: fuera la fila
`{ rol: 'sobre-primario', fondo: 'urgencia' }` con su cita a
`Cabecera.module.scss`, y fuera `{ rol: 'urgencia', fondo: 'sobre-primario' }`
con su bloque de procedencia de tres líneas. **43 de 43 en verde.**

**REFACTOR (en verde).**
- Docblock del módulo: decía «Cubre @s6, @s7, @s8, @s9 y @s11». Lo que he
  escrito no es «ya no cubre @s7», porque **sería falso**: @s7 sigue usando
  `evaluarParDeVariante` y la puerta de reconciliación de este mismo módulo. Lo
  que dejó de hacer es **declarar** su pareja, y eso es lo que dice ahora.
- Comentario de sección de la matriz: «El rojo de urgencia entra AQUÍ, nunca con
  blanco literal (@s7)» → reescrito a que entraba ahí hasta el 20/09/2026 y a
  que @s7 lo custodia ahora sobre los **tokens**.
- **Entrada del 20/09/2026 en el histórico del recuento**, junto a las de 22, 24
  y 25: 25 → 23, con la decisión de Pablo y su motivo. Un recuento sin historia
  es el que nadie sabe por qué cambió.
- Nota sobre los dos casos sintéticos de la reconciliación (`@s11`): siguen
  verdes y siguen probando lo suyo —la matriz que se les pasa se escribe a mano
  en cada `it`—, pero su ejemplo ya no retrata ninguna decisión viva. Se deja
  dicho en vez de reanclarlo: tocar el caso sintético cambiaría lo que ejercita.

### Ciclo 2 — E4/@s52: la puerta de compromiso de urgencias, de afirmativa a negativa

**ROJO.** `datosDelSitio.test.ts`: el `it` «falla cerrada si el sitio no menciona
ni una sola vez el compromiso» **se invierte** y se renombra. Un sitio con
rutas, con catálogo de cualificadores y **sin ninguna mención** ahora
**APRUEBA**. Se le añaden `rutasInspeccionadas`, `cualificadoresBuscados` y
`motivo === undefined`, que es lo que distingue «no hay ninguno» de «no se ha
buscado». Corrido: **1 rojo de 33**.

**VERDE.** `datosDelSitio.ts`, una línea de decisión:

- antes: `compromisosEncontrados.length === UN_UNICO_COMPROMISO && compromisosEncontrados[PRIMER_COMPROMISO] === cualificadorDeclarado`
- ahora: `compromisosEncontrados.every((compromiso) => compromiso === cualificadorDeclarado)`

**Las dos constantes que se quedaban sin uso se borran en el mismo paso**
(`UN_UNICO_COMPROMISO`, `PRIMER_COMPROMISO`), como manda la regla de no dejar
código vivo sin puerta. Las dos guardas de fallo cerrado —sin rutas y sin
cualificadores— **no se tocan**. **33 de 33 en verde.**

**Sobre la mutación, que es el aviso que traía el contrato**: `informe.pasa` es
lógica pura bajo umbral 100. La nueva expresión queda cubierta por cuatro tests
que ya existían más el invertido: `every → some` muere con el caso vacío
(`some` daría `false` donde se espera `true`); `=== → !==` muere con el caso del
compromiso declarado; sustituirla por `true` muere con el caso de
«urgencias 24 h»; por `false`, con el caso vacío. No me consta ejecutada la
mutación: **no la he corrido**, es del `mutation_tester`.

**El spec de navegador**, `datos-reales.spec.ts`: la aserción
`compromisosEncontrados` `toEqual([cualificadorDeclarado])` pasa a
`filter(distinto del declarado)` `toEqual([])`, con el test renombrado y la
anti-vacuidad explícita (6 rutas, catálogo > 0).

### Ciclo 3 — E4/@s14: `urgencias.spec.ts`, de presencia a corrección

**Fuera** las cuatro aserciones de presencia: la textual y la de enlace por
ruta, y los dos agregados globales. **Dentro, íntegras**, las de corrección: el
rótulo exacto de la fuente única, que no sea el teléfono de la clínica ni el
móvil, el rótulo accesible sin palabras añadidas y el `tel:` derivado con
`enlaceLlamada` en vez de retipeado. **Íntegro** también el recorrido de las
seis rutas y el primer test (los tres teléfonos distintos entre sí).

**La cláusula-disparador que pide @s14**: `mencionesTotales` es exactamente
**0**, y añado el mismo disparador sobre `enlacesDeUrgenciaComprobados`, también
**0**. Los dos son **medidos**, no deducidos.

**VERIFICADO QUE EL DISPARADOR MUERDE, no supuesto.** Un disparador que nace
verde no demuestra nada si nadie comprueba que puede ponerse rojo: invertí las
dos aserciones a `toBe(1)`, corrí el spec y **falló** con
`Expected: 1 / Received: 0` en la línea del recuento. Restaurado acto seguido y
vuelto a comprobar en el fichero. Ese es el rojo que este ciclo sí podía tener.

### Ciclo 4 — F2: el proyecto se queda con cero `animation:`

**MEDIDO HOY, fichero a fichero, antes de escribir ningún comentario**:
`grep` sobre `src/` devuelve **0 declaraciones `animation:`** y **0
`@keyframes`**, y **13 `transition:`** — **8 en 6 módulos** (Cabecera · Equipo ·
Faq ×2 · Galeria · ReservaChat · Servicios ×2) y **5 en las hojas compartidas**
(`global.scss:326` · `_api.scss:181, :235, :265, :308`). Confirma el dato del
contrato y desmiente el «10 en 7 módulos» de la segunda tanda.

Reapuntados **solo comentarios**, que es lo que mi lista de ficheros permite:

- `fidelidad.spec.ts` — el bloque que justificaba el `reduce` por «la animación
  infinita del punto del CTA de urgencias (`Cabecera.module.scss:188`,
  `pulso-urgencias`)». Ese `@keyframes` ya no existe. Texto nuevo: la emulación
  **se conserva** porque `getAnimations()` también devuelve **transiciones** y el
  `body` transiciona `background-color`/`color`, así que `aplicarVariante` sigue
  necesitándola para no leer un valor a mitad de interpolación. Corregida además
  la cita `global.scss:301` → `:337-343` y `:290` → `:326`.
- `movimiento.spec.ts` — tres comentarios: (a) que lo que la espera encuentra
  hoy son transiciones; (b) que el `0` de animaciones en curso **ya no demuestra
  que el anulador global funcione, demuestra que no hay nada que anular**, y se
  conserva solo como antirregresión; (c) el defecto del contador de
  `elementosConTransicionDeclarada`, escrito entero en su sitio (ver §4).
- `accesibilidad.spec.ts` — las dos notas de los escenarios de movimiento, con
  la cita `global.scss:290` → `:326` y el mismo aviso de «transiciones, no
  animaciones».

**Las cinco esperas `getAnimations().every(…)` y las llamadas a
`emulateMedia({reducedMotion:'reduce'})` se CONSERVAN**, como ordena el
contrato. No son inertes: las transiciones sí entran en `document.getAnimations()`.

---

## 3. El mapa `@s → test`

| Escenario | Puerta que lo cubre | Estado |
| --- | --- | --- |
| `rediseno_visual` @s7 (par apto) | `matrizDeContraste.test.ts`, 1.º `it` de @s7 (tokens reales ×5) | verde |
| `rediseno_visual` @s7 (tech ≥ 6 vs 2.77) | `matrizDeContraste.test.ts`, 2.º `it` de @s7 — **no tocado** | verde |
| `rediseno_visual` @s7 (los dos recuentos = 0 + disparador) | `matrizDeContraste.test.ts`, `it` **nuevo** | verde (nació rojo) |
| `rediseno_visual` @s7 (fuera de la matriz) | `tokensColor.test.ts:229-235` — **no tocado** | verde |
| `rediseno_visual` @s11 (23 filas / 23 claves / 115 parejas) | `matrizDeContraste.test.ts`, bloque de @s11 | verde |
| `rediseno_visual` @s11 (reconciliación con el texto real) | mismo fichero, bloque de reconciliación | verde |
| `rediseno_visual` @s14 (corrección de lo que aparezca) | `urgencias.spec.ts`, bucles de rótulo, etiqueta y enlace | verde |
| `rediseno_visual` @s14 (6 rutas, nunca lista vacía) | `urgencias.spec.ts`, `rutasRecorridas` | verde |
| `rediseno_visual` @s14 (recuento estático = 0, disparador) | `urgencias.spec.ts`, 2 aserciones finales | verde, **bite comprobado** |
| `rediseno_visual` @s52 (ningún compromiso distinto) | `datosDelSitio.test.ts` ×5 + `datos-reales.spec.ts` | verde |
| `rediseno_visual` @s52 (6 rutas y catálogo > 0) | `datos-reales.spec.ts` | verde |
| `accesibilidad` @s19/@s21 (nada se mueve con `reduce`) | `movimiento.spec.ts` (@s42), comentarios reapuntados | verde |
| `accesibilidad` @s22 (sin la preferencia el sitio SÍ se mueve) | `movimiento.spec.ts:117-120`, `accesibilidad-movimiento.test.ts:113-134`, `Equipo.test.tsx:498-507` — **las tres, no tocadas** | verdes |

---

## 4. Lo que NO he tocado, y a quién le toca

Ninguna de estas cosas está en mi lista de ficheros. Las dejo escritas en vez de
hacerlas, como manda el encargo.

1. **`tests/e2e/movimiento.spec.ts:79-94` — el defecto de verdad de @s19, sin
   arreglar.** El contador `elementosConTransicionDeclarada` se mide **bajo**
   `emulateMedia({reducedMotion:'reduce'})`, y bajo `reduce` el anulador global
   aplica `transition-duration: 0.01ms` sobre `*`: el filtro «duración > 0» casa
   con **todos** los elementos del documento, siempre. Su `>= 1` no puede
   ponerse rojo. Lo mismo con `transicionesFueraDeEscala`. La cláusula nueva de
   @s19 («ese recuento se obtiene de los elementos que declaran movimiento en
   los módulos que lo declaran de verdad») **exige arreglarlo**, y eso es código,
   no comentario: mi lista dice «movimiento.spec.ts (solo comentarios)». **He
   dejado el defecto escrito en su propia línea**, con el porqué, para que quien
   lo abra no vuelva a leerlo como si no fuera uno.
2. **`src/lib/accesibilidad-movimiento.test.ts:41-53` — las cláusulas nuevas de
   @s20.** «El inventario se lee del sitio real, nunca de una lista escrita en el
   propio test» y «el recuento es exactamente 0 y la puerta lo declara» no tienen
   hoy puerta: la única que había la alimenta un literal sintético de dos
   entradas del propio test. Fichero fuera de mi lista.
3. **`features/accesibilidad.feature` — el «10 `transition` en 7 módulos».** Mi
   encargo lo situaba en `:375` y me pedía corregirlo. **No hacía falta y no lo
   he tocado**: fui a mirarlo y la tercera tanda ya lo había corregido; en el
   fichero de hoy la frase solo sobrevive **citada** en `:398-399` y `:526`, y
   las dos veces rotulada como FALSA, con el número bueno (8 en 6) al lado.
   Además es un `.feature`, es decir contrato, y no es mío. Único desajuste
   menor que sí queda: la nota cita `Cabecera:127` y hoy la `transition` está en
   `:144` (la oleada 1 movió el fichero).
4. **`src/components/Hero.test.tsx:330`** — su comentario cita «el CTA de
   urgencias de `Cabecera.module.scss` sobre su rojo» como precedente. Con F1 ese
   precedente desaparece **también** de la matriz. Fichero fuera de mi lista; el
   test sigue verde.
5. **`--color-urgencia-suave` se queda huérfano.** Ningún fichero de `src/` lo
   pinta ya, pero sigue declarado en las cinco variantes y congelado por
   `rediseno_visual` @s1/@s2, `contratoRedisenho.ts` y el mapeo `--urg-soft` de
   `fidelidadPrototipo.ts`. Por la misma lógica de Pablo —que lo declarado sea lo
   que se pinta— es el hilo siguiente. **Puerta humana, no decisión de artesano.**
6. **La puerta de reconciliación de la matriz sigue sin detectar filas
   huérfanas**: solo busca el caso contrario (lo pintado que la matriz no
   declara). F1 retiró lo que había caído dentro de ese agujero; no lo cierra.
   Mi `it` nuevo lo tapa **solo para el fondo `urgencia`**, no en general.
7. **`escalaMovimiento.test.ts:43`** — su anti-vacuidad cuenta **ficheros**, no
   declaraciones: seguiría verde con el proyecto a cero movimiento. No lo rompe
   F2 y no es de mi lista.
8. **`feature_list.json`** — no lo he tocado. La 39 sigue en `spec_ready`. No me
   corresponde moverla, y no hay nada que dar por `done` hasta que pasen el
   `judge` y el `mutation_tester`.
9. **`progress/current.md`** — no lo he tocado: lo comparten las cuatro oleadas.

---

## 5. Ficheros que he tocado, uno a uno

| Fichero | Qué |
| --- | --- |
| `src/lib/diseno/matrizDeContraste.ts` | −2 filas (con sus comentarios de procedencia); docblock y comentario de sección reapuntados |
| `src/lib/diseno/matrizDeContraste.test.ts` | corpus real de estilos; @s7 reescrito + `it` nuevo del disparador; 23/23/115; último `describe` reescrito y un `it` borrado; entrada del 20/09/2026 en el histórico; nota sobre los sintéticos |
| `src/lib/diseno/datosDelSitio.ts` | `pasa` de afirmativo a negativo; 2 constantes muertas borradas; docblock reescrito |
| `src/lib/diseno/datosDelSitio.test.ts` | el `it` de fallo cerrado invertido y renombrado, con 3 aserciones nuevas |
| `tests/e2e/urgencias.spec.ts` | 4 aserciones de presencia fuera; disparador de recuento 0 ×2; cabecera y títulos reapuntados |
| `tests/e2e/datos-reales.spec.ts` | @s52 de afirmativo a negativo, con anti-vacuidad explícita |
| `tests/e2e/fidelidad.spec.ts` | 2 comentarios (el del `reduce` y el de `aplicarVariante`) |
| `tests/e2e/movimiento.spec.ts` | 3 comentarios, uno de ellos el defecto del punto 1 de §4 |
| `tests/e2e/accesibilidad.spec.ts` | 2 comentarios de los escenarios de movimiento |

Ni un fichero fuera de esa lista. Sin ficheros temporales ni logs de depuración:
el único artefacto de la comprobación del disparador (`test-results/`, ignorado
por git) es salida de Playwright y se regenera en cada corrida.
