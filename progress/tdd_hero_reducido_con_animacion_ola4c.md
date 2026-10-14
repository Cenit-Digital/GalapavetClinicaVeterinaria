# TDD — feature 48 `hero_reducido_con_animacion`, ola 4C: specs de navegador, comentarios falsos y configuración de Playwright

> `tdd_craftsman`, 14/10/2026. Contrato firmado por Pablo el 13/10/2026. Esta ola corrige los hallazgos C1-C8 que el panel de
> revisión (el `judge` y cuatro revisores independientes) abrió sobre HEAD `2267262`, en los ficheros de navegador y en
> `playwright.config.ts`. Los otros dos agentes de la ola 4 trabajaban a la vez sobre `src/lib/**` y `src/styles/**`.
>
> **Estado: VERDE en lo mío.** `pnpm run test:e2e` completo UNA vez, con el candado de navegador: **`277 passed (1.2m)`, EXIT 0**
> (la corrida del `judge` fue de 267: +10 son las pruebas nuevas; 0 omitidas, 0 con reintento, `css-presupuesto.spec.ts` presente, 4173
> sin ningún proceso escuchando después). Después de esa corrida hice TRES cambios más (la aserción y la prueba de mordida de @s19 en
> `movimiento.spec.ts`, el botón tardío a 1 s con `existentes` exacto en `hero-reducido.spec.ts`, y un comentario de
> `Hero.module.scss`); por eso añado una corrida DIRIGIDA posterior sobre `hero-reducido`, `movimiento`, `esperar-entrada-terminada`,
> `accesibilidad`, `fidelidad-hero` y `tipografia` contra el `dist/` real: **111 passed**. La corrida completa de cierre es del lead.
> Al final: `pnpm run lint` EXIT 0 (0 errores, 0 avisos), `pnpm run typecheck` EXIT 0, `pnpm exec tsc -p tsconfig.e2e.json --noEmit`
> EXIT 0, y Vitest sobre `medicionEstableSpecsReales`, `puertaNavegadorReal`, `Hero.test.tsx`, `escalaMovimiento`, `movimientoRespetuoso` y
> `accesibilidad-movimiento`: **6 ficheros, 465 pruebas, todo verde** (con la versión de `medicionEstable.ts` que el agente A tenía en el
> árbol a las 12:50). Stryker NO aplica: `tests/e2e/**` y `playwright.config.ts` están fuera de su superficie (`stryker.config.json`:
> `src/lib/**` y `src/**/*-logica.ts`, sin `*.test.*`); no he tocado ningún módulo mutable. Los sabotajes de abajo son a mano y NO sustituyen
> a la mutación.

## 1. Ficheros

**Tocados (míos):** `playwright.config.ts` · `tests/e2e/entrada-del-hero.ts` · `tests/e2e/esperar-entrada-terminada.spec.ts` ·
`tests/e2e/hero-reducido.spec.ts` · `tests/e2e/utilidades.ts` · `tests/e2e/movimiento.spec.ts` · `tests/e2e/accesibilidad.spec.ts` ·
`tests/e2e/fidelidad.spec.ts` · `tests/e2e/fidelidad-cabecera.spec.ts` · `tests/e2e/imagenes.spec.ts` ·
`tests/e2e/despliegue-subpath.spec.ts` · `tests/e2e/tokens-aplicados.spec.ts` · `src/components/Hero.module.scss` (SOLO comentarios:
`git diff` muestra únicamente líneas `//`, 15 añadidas y 3 quitadas).

**Tocado fuera de mi lista, declarado:** `src/lib/diseno/puertaNavegadorReal.test.ts` (un `import ts from 'typescript'` y dos bloques:
la prueba de `forbidOnly` y la guarda de las esperas con tope). Es «el sitio donde viven las pruebas de la configuración» que C6
manda usar y no es ninguno de los módulos nombrados de los otros agentes, pero cae bajo `src/lib/**`: ver «Desvíos».

**No tocados:** `features/`, `feature_list.json`, `progress/current.md`, `project-spec.md`, `src/styles/**` y el resto de `src/lib/**`.
Sin `git add/commit/stash/switch/reset/checkout/restore` ni push. Finales de línea: todos los ficheros tocados siguen en LF
(0 caracteres `\r`). Scripts de un solo uso, copias previas y datos crudos: `scratchpad/ola4c/`, no el repo.

## 2. Mapa HALLAZGO → test que lo fija (fichero y nombre, sin números de línea)

| Hallazgo | Test que lo fija |
| --- | --- |
| **C1** «las tres empiezan en el mismo instante» era una tautología | `tests/e2e/hero-reducido.spec.ts`, describe «@s5 de hero_reducido_con_animacion: las tres empiezan en el mismo instante (reloj vivo, en el primer "animationstart" del hero)»: «en la portada real, cuando arranca el titular existen las 3 animaciones del hero y las tres comparten un único instante de inicio» · «no incumple nada: un hero sano…» · «incumple: el botón se monta 1 s después (otro commit)…» · «incumple: el botón entra un fotograma antes que el titular: existen las 3, pero con instantes de inicio distintos» · «la auditoría señala cada cláusula por separado…» |
| **C7bis** (surgido al cerrar C7: el registro acotado al hero dejaba sin cubrir a @s19 una animación sobre el velo o la foto del hero) | `tests/e2e/movimiento.spec.ts`, describe «@s19 de accesibilidad…»: «la comprobación muerde: una animación sobre el velo del hero, declarada fuera de "no-preference" y terminada al instante, la ve el contador del documento y no el registro del hero» (portada real con el defecto inyectado) y, en el test real de @s19, la aserción nueva «animationstart de cualquier elemento del documento con "reduce"» |
| **C2** «elementos comprobados» era una tautología | `hero-reducido.spec.ts`, describe «@s7 …: la comprobación muerde (páginas sintéticas)»: «incumple: un segundo enlace en el hero, que "querySelector" no ve, deja el recuento de elementos localizados en 4 y no en 3» · «incumple: el recuento de elementos localizados que no es 3 se señala aunque todo lo demás esté sano» |
| **C3** comentarios falsos («no queda ninguna `animation:`») | Solo comentarios, sin test posible. Comprobación: `git grep -i -e "no queda ninguna" -e "YA NO HAYA NINGUNA" -e "sin ninguna declaraci"` sobre `tests/` ya no devuelve ninguna afirmación falsa (queda un TÍTULO de test, cierto: «no queda ninguna animación ni transición en curso»). Reescritos 5 sitios en 3 ficheros: los cuatro del hallazgo y uno más (ver abajo) |
| **C4** comentario falso de `Hero.module.scss` («para que el foco y su anillo no se vean afectados») | Solo comentario. MEDIDO (sección 5); `Hero.test.tsx` y las puertas que leen la hoja siguen en verde |
| **C5** `waitForFunction` sin `timeout` | `src/lib/diseno/puertaNavegadorReal.test.ts`, describe «las esperas de los specs de navegador real llevan un tope explícito»: «en tests/e2e hay esperas de verdad y ninguna carece de tope» (la prueba sobre los ficheros reales) más 11 filas sintéticas (`it.each`) y «las llamadas se cuentan por el árbol…» |
| **C6** sin `forbidOnly` | `puertaNavegadorReal.test.ts`, «"playwright.config.ts" declara "forbidOnly: true" sin condición de entorno» + medición real (sección 5) |
| **C7** el registro cuenta cualquier animación del documento; el catch relee y tapa el error del tope | `tests/e2e/esperar-entrada-terminada.spec.ts`: «las animaciones de FUERA del hero no cuentan: con dos ajenas ya terminadas, no vuelve hasta que han terminado las tres del hero» · «una animación INFINITA de fuera del hero (un indicador de carga) no impide que la espera termine» · «si la página se pierde al agotarse el tope, el error que se ve sigue siendo el del tope, con el estado ilegible dicho» · y la página del titular aparte, que ahora lleva otro `h1` en una cabecera |
| **C8** duplicación | PARCIAL: `esperarDosFotogramas` extraído a `tests/e2e/utilidades.ts` (era el doble `requestAnimationFrame` duplicado en `movimiento.spec.ts` y dentro de `esperarALosElementosDelHero`). El resto, como deuda: sección 6 |

**C3, los cuatro sitios del hallazgo y uno más.** Los que citaba el hallazgo: `fidelidad.spec.ts` (el doc de `aplicarVariante` y el bloque «POR QUÉ SE
CONSERVA EL "reduce"…»), `movimiento.spec.ts` (el comentario del `@s42`) y `accesibilidad.spec.ts` (la espera de `@s40`). El `git grep`
encontró un quinto, que el hallazgo no listaba: el doc de `aplicarVariante` de `accesibilidad.spec.ts` («el proyecto se quedó sin
ninguna declaración `animation:`»). Cada reescritura dice lo cierto y comprobable hoy: desde el 20/09/2026 no había ninguna
declaración `animation:` en `src/`, desde la 48 hay UNA (la entrada del hero) que vive solo dentro de `no-preference`, y en cada sitio
se dice qué preferencia rige en ese momento (en `fidelidad.spec.ts` @s42 el `goto` va ANTES de `emulateMedia(reduce)`: no se escribió
«bajo reduce no hay animación» sin más). Esa afirmación está MEDIDA: sección 5.

## 3. Ciclos Rojo → Verde → Refactor

Las pruebas de navegador se corrieron, mientras otros dos agentes tocaban `src/lib/**`, con un config de un solo uso SIN `webServer`
(`scratchpad/ola4c/pw-sin-servidor.config.mjs`) para no pasar por `pnpm run build` (su `tsc -b` incluye ficheros de los otros agentes);
las pruebas que necesitan el sitio real se corrieron con `vite preview` sobre el `dist/` de `2267262` y, al final, con la corrida
completa de `pnpm run test:e2e`, que construye de cero.

| # | Hallazgo | ROJO (qué falló y por qué) | VERDE (cambio mínimo) | REFACTOR |
| --- | --- | --- | --- | --- |
| 1 | C6 | `puertaNavegadorReal.test.ts`: «declara "forbidOnly: true"…» falló: la config no la tenía | `forbidOnly: true,` en `playwright.config.ts`, sin condición de CI | el comentario de la config |
| 2 | C5 | `en tests/e2e hay esperas… ninguna carece de tope`: **14 llamadas sin tope en 8 ficheros** (los dos nombrados y seis más) | un `{ timeout: TOPE_DE_UNA_ESPERA_MS }` en cada una; la constante, con su porqué, en `utilidades.ts` | `llamadasALaEspera` única (antes dos recorridos del árbol casi iguales) |
| 3 | C7 | 3 pruebas nuevas en rojo, cada una por su razón: `Received: 2` animaciones del hero aún vivas al volver; el tope agotado con `arranques: 4, fines: 3` (una ajena infinita); y el error crudo `Target page, context or browser has been closed` en vez del del tope | `entrada-del-hero.ts`: el registro filtra por `closest('[data-hero-contenido]')`, el titular del ancla es el del hero, constantes con nombre, y `describirElEstadoSiSePuede` | parámetros del navegador en UN objeto serializable |
| 4 | C2 | `tsc` (campo `localizados` inexistente) y, en ejecución, `Expected: 4, Received: undefined` | `localizados` leído en la página ANTES de desreferenciar nada, y la cláusula `elementos localizados…` | — |
| 5 | C1 | `tsc` (8 nombres sin declarar) y 5 `ReferenceError` en ejecución | observador del primer `animationstart` del hero, lectura con tope y `incumplimientosDelMismoInstante`; la línea tautológica y el campo `inicio` de `AnimacionLeida` se quitan | — |
| 6 | C1 | el sabotaje C1d (sección 4) SOBREVIVÍA: el observador sobrescribía su anotación en cada arranque y la prueba leía justo tras el primero | la lectura se hace con la entrada ya terminada (`registrarEntradaDelHero` + `esperarEntradaTerminada`): lo anotado ha de ser el PRIMER arranque aunque después haya más | — |
| 7 | C7 | el sabotaje M7 (sección 4) SOBREVIVÍA: nada exigía que el `h1` del ancla fuera el del hero | la página del titular aparte lleva ahora otro `h1` en una `header`: el ancla ha de esperar al del hero | — |
| 6b | C1 | tras pasar el «botón +300 ms» a 1 s (un rojo falso por el reloj en una máquina cargada), C1d volvió a SOBREVIVIR: con un solo valor anotado, el último arranque (`existentes: 1`) y el primero (`existentes: 2`) dan el mismo fragmento «animaciones del hero que existen» | el test del botón tardío afirma `existentes` EXACTAMENTE 2 | — |
| 7b | C7bis | `ReferenceError: contarLosArranquesDelDocumento is not defined` (la prueba de mordida de @s19, escrita antes que el contador) | `contarLosArranquesDelDocumento`, `leerLosArranquesDelDocumento` e `inyectarUnaAnimacionSobreElVeloDelHero` en `movimiento.spec.ts`, y la aserción en el @s19 real | — |
| 8 | C3, C4 | — (solo comentarios) | cinco comentarios de `tests/e2e` y uno de `Hero.module.scss` | — |
| 9 | C8 | — (refactor en verde) | `esperarDosFotogramas` a `utilidades.ts` | `movimiento.spec.ts` y `hero-reducido.spec.ts` lo importan |

Honestidad sobre los ciclos 6 y 7: eran verdes a la primera para su prueba y los dos sabotajes demostraron que no mordían; cada uno
produjo su prueba o su página nueva y se repitió el sabotaje hasta verlo morir.

## 4. Sabotajes ejecutados (copia previa y `cmp` tras cada restauración; todos «restaurado byte a byte: true»)

### 4.1 C7, el ayudante `entrada-del-hero.ts` contra `esperar-entrada-terminada.spec.ts` (con `--timeout=12000` para acortar las esperas)

Los CUATRO mutantes del contrato siguen muriendo, cada uno con su página, y la variante A del cuarto, que el `judge` midió
SUPERVIVIENTE, ahora MUERE:

| Mutante | Resultado |
| --- | --- |
| «tope inexistente» (`{ timeout: topeMs }` → `{ timeout: 0 }`, 2 sitios) | ROJO exactamente en la de 30 s y la del hero que nunca se monta (`Test timeout of 12000ms exceeded` en vez del mensaje del tope) |
| «sin ancla» (quitar `await esperarAlAncla(...)`) | ROJO (4): montaje tardío, titular aparte, 30 s y nunca se monta (`Received promise resolved instead of rejected`) |
| «espera una sola» (`fines >= registro.arranques` → `fines >= 1`) | ROJO (2): montaje tardío (`Expected: 3, Received: 2`) y contexto |
| «lee `getAnimations()`», variante B (ancla y fin) | ROJO (2): «YA terminadas» (`se agotó el tope de 3000 ms… arranques: 3, fines: 3`) y la del titular aparte |
| **variante A** (solo la espera del fin lee `getAnimations().length === 0`) | **ROJO (1): «una animación INFINITA de fuera del hero…»** (antes sobrevivía 8/8) |
| M5: sin filtro del hero (`esDelHero` siempre cierto) | ROJO (2): las dos de animaciones ajenas (`Received: 2` vivas; `arranques: 4, fines: 3`) |
| M6: relectura del tope sin guardia (el código viejo) | ROJO (1): llega `Target page, context or browser has been closed` y no el mensaje del tope |
| M7: el `h1` del ancla no es el del hero | ROJO (1): «el titular es parte del ancla…» (antes SOBREVIVÍA; ver ciclo 7) |

### 4.2 C1 y C2 sobre `hero-reducido.spec.ts`

| Sabotaje | Resultado |
| --- | --- |
| C1a: sin la cláusula de instantes distintos | ROJO (2): «un fotograma antes» y la auditoría por cláusula |
| C1b: sin la cláusula del recuento | ROJO (2): «1 s después» y la auditoría por cláusula |
| C1c: el instante ausente no se ve (`every(...)` → `true`) | ROJO (1): la auditoría por cláusula, la fila `[null, null, null]` (con un recuento correcto y un solo valor «nulo» el resto da verde) |
| C1d: el observador sobrescribe en cada arranque | ROJO (1): «1 s después» (`Expected: 2, Received: 1`), tras añadir la espera del ciclo 6 y la afirmación exacta del ciclo 6b |
| C2a: la cláusula vuelve a contar las claves del objeto | ROJO (2): el segundo enlace y la fila sintética |
| C2b: `localizados` cuenta con `querySelector` | ROJO (1): el segundo enlace (`Expected: 4, Received: 3`) |

### 4.2bis C7bis, sobre `movimiento.spec.ts` (@s19 real)

| Sabotaje | Resultado |
| --- | --- |
| El @s19 real con la animación sobre el velo INYECTADA (`inyectarUnaAnimacionSobreElVeloDelHero` antes del `goto`) | ROJO en la aserción nueva: `Expected: 0, Received: 1` en «animationstart de cualquier elemento del documento». Las anteriores (nombres, recuento del primer fotograma y registro del hero) PASAN: justo el hueco que se cerraba |
| El @s19 real sin instalar `contarLosArranquesDelDocumento` | ROJO: `Expected: 0, Received: undefined` (el contador ausente no se lee como «0 arranques») |

### 4.3 C5 y C6

| Sabotaje | Resultado |
| --- | --- |
| C5 S1: `POSICION_DE_LAS_OPCIONES` 2 → 1 | ROJO (5), incluida la prueba sobre los ficheros reales |
| C5 S2: `declaraUnTope` siempre cierto | ROJO (2): «un tope de 0…» y «unas opciones sin tope» |
| C5 S3: se admite `timeout: 0` | ROJO (2) |
| C5 S4: no se mira el NOMBRE de la propiedad | ROJO (1): «unas opciones sin tope» |
| C6: `forbidOnly: !!process.env.CI,` y `// forbidOnly: true,` | ROJO en los dos (la línea ha de estar sola y viva) |

## 5. Mediciones (MEDIDO por mí en Chromium 151 / Playwright 1.62.1; no es documentación oficial)

- **C6, `forbidOnly`.** Config de un solo uso que LEE el `forbidOnly` de la real: con él, un `test.only` (junto a un test que falla)
  da `Error: item focused with '.only' is not allowed due to the 'forbidOnly' option` y EXIT 1; con `forbidOnly: false` (el
  estado de antes) da `1 passed`, EXIT 0, y el test rojo no se ejecuta. Y sobre el proyecto real: un `test.only` provisional en
  `tests/e2e/layout.spec.ts` + `pnpm exec playwright test layout` → mismo error y EXIT 1; restaurado con `cmp`; `git grep "\.only("`
  sobre `tests/` y `src/` solo devuelve TEXTO de pruebas del agente A.
- **C5, el mensaje.** Un predicado que nunca se cumple, con test de 3 s: SIN tope falla con `page.waitForFunction: Test timeout of 3000ms
  exceeded` (sí nombra la llamada, pero tras consumir TODO el presupuesto del test: 60 s en el proyecto, y sin distinguir
  una espera de otra); CON tope de 500 ms falla a los 0,6 s con `TimeoutError: page.waitForFunction: Timeout 500ms exceeded`.
  Honestidad: el beneficio medido es «falla pronto y como TimeoutError de la espera», no «el mensaje antes no decía nada».
  El valor por defecto 0 de `timeout` lo citan los tipos de `playwright-core` (lo leyó el revisor; yo medí el efecto).
- **C1.** Portada real, reloj vivo: `{"existentes":3,"inicios":[117.797…,117.797…,117.797…]}`. Página sana: 3 con un solo valor.
  Botón +300 ms (medido así; el test usa 1 s por holgura): `existentes: 2`. Botón un fotograma antes: `existentes: 3`, `inicios: [27.214, 27.214, 10.548]`. 50 de 50 pasadas
  (`--repeat-each=10`), sin intermitencia.
- **C3.** `emulateMedia(reduce)` DESPUÉS del `goto` sobre la portada real retira la entrada de inmediato: `{"antes":3,"justoDespues":0,
  "dosFotogramas":0}` (3 de 3 ejecuciones).
- **C4.** Reloj de animaciones congelado a mitad de la entrada del botón, `dist/` real: el enlace, enfocado con Tab, cumple
  `:focus-visible`; su opacidad propia es 1 y la de su contenedor 0,684643; el anillo declarado es `solid 2px rgb(255,255,255)`. El PÍXEL del
  anillo (canal rojo máximo en la franja a la izquierda del botón) sale a **184** a mitad de la entrada y a **254** con la entrada
  terminada: el anillo SÍ se atenúa. La vía de navegación de cliente que lo provoca en un uso real la reprodujo el revisor de
  accesibilidad sobre una réplica sintética; yo no la reproduje sobre la app.
- **C7.** Páginas sintéticas: con dos animaciones ajenas ya terminadas y el hero montado a 1200 ms, el código viejo volvía con 2
  animaciones del hero aún vivas (esperando su retardo con relleno `backwards`); con una ajena infinita no terminaba nunca.

## 6. C8, lo que NO se hace y por qué (deuda anotada)

Hecho: `esperarDosFotogramas` en `utilidades.ts` (era el doble `requestAnimationFrame` de `movimiento.spec.ts` y el de
`esperarALosElementosDelHero`; queda otro, ajeno, en `fidelidad-responsive-integral.spec.ts`, que no he tocado).

NO hecho, y seguro de no hacerlo ahora:

- `congelarRelojDeAnimaciones` (idéntico en `hero-reducido.spec.ts` y `movimiento.spec.ts`): la comprobación estática de @s10 lo
  reconoce POR NOMBRE y por el literal `Animation.setPlaybackRate`; el agente A la está endureciendo a la vez y moverlo pone en juego
  esa regla. Se queda dentro de cada spec, como pide el contrato.
- `colocarAnimaciones` / `colocarEnElUltimoInstanteActivo` y `cancelarAnimaciones` / `cancelarLasAnimaciones`: son los marcadores
  (`currentTime =` y `.cancel(`) que `PATRON_COLOCA` solo ve en cuerpos locales del mismo fichero.
- El recorrido de opacidad por ancestros (4 copias) y los selectores de los tres elementos: viven DENTRO de `page.evaluate` (se
  serializan y no pueden importar nada) y contienen `getComputedStyle(...).opacity`, `[data-hero-` y `h1`, justo los literales que
  la comprobación estática busca para saber que un bloque «mide el hero»: sacarlos a un módulo dejaría esos bloques en `exento`
  por vacuidad, sin ponerlos en rojo.
- Partir `hero-reducido.spec.ts` (ahora 1500+ líneas) en un fichero por escenario: lo recomendó el revisor, y es la limpieza correcta
  para DESPUÉS de que la 49 y el agente A hayan terminado, no a la vez.

## 7. Desvíos del contrato y avisos

1. **«Las tres empiezan en el mismo instante» (@s5) se mide con el reloj VIVO**, no congelado, y en un bloque aparte: el Given de @s5
   dice «reloj congelado», que es justo lo que la hace imposible de fallar. Es la prueba que el `judge` midió en su hallazgo H3.
   La cláusula SOLO vale para el primer arranque del hero (el titular, retardo 0): lo dice su comentario.
2. **El registro de `entrada-del-hero.ts` ya no cuenta animaciones de fuera de `[data-hero-contenido]`**, tal como pidió el lead, y
   ESO ABRÍA UN HUECO REAL EN @s19 que cerré (C7bis). La cláusula «ni en curso ni terminada» de @s19 descansaba en tres cosas: los
   nombres de animación (solo los tres elementos y sus ancestros), el recuento del primer fotograma (solo lo que sigue vivo) y el
   registro de eventos (lo único que recuerda lo ya terminado). Una animación de 1 ms sobre el velo (`section::after`, cuyo evento
   tiene por objetivo la propia sección) o sobre la foto, declarada fuera de `no-preference`, escapaba de las tres. Lo cierra un
   contador de `animationstart` de TODO el documento en @s19, con su prueba de mordida. @s5 no tenía el hueco: cuenta todas las
   animaciones del documento y exige 3. El ayudante sigue acotado al hero.
3. **`src/lib/diseno/puertaNavegadorReal.test.ts`** (bajo `src/lib/**`) lo he tocado yo: dos bloques añadidos al final. Si el lead
   prefiere que no cohabite con los módulos de los otros agentes, se pueden mover tal cual a un fichero propio.
4. **C5 se ha extendido a TODO `tests/e2e`** (8 ficheros, 14 llamadas) y no solo a `movimiento.spec.ts` y `accesibilidad.spec.ts`: la
   guarda no puede ser razonablemente parcial. Si el lead prefiere el alcance estricto, es revertir seis ficheros de una línea cada uno
   y limitar la guarda.
5. **La guarda de C5 usa el compilador de TypeScript** (`import ts from 'typescript'`, ya dependencia de desarrollo; ninguna
   dependencia nueva) para leer el árbol y no el texto. `tsc -b` y `vitest` lo aceptan.
6. **C7:** NO queda ningún mutante del contrato sin morir: no hay desvío que anotar en ese punto.
7. **El `tdd_craftsman` NO marca nada `done`.** Queda para el `judge` y el `mutation_tester` tras las olas 4A y 4B.

## 8. Sin verificar en documentación oficial

- Que el valor por defecto de `timeout` en `page.waitForFunction` sea 0 y el de `forbidOnly` sea `false` (solo medí el EFECTO de los
  dos, y la lectura de los tipos de `playwright-core` es del revisor).
- Que `startTime` coincida para animaciones creadas en el mismo fotograma (lo medí, 50 de 50; no leí la especificación de Web
  Animations).
- Que la opacidad de un contenedor se componga sobre el anillo de foco de sus descendientes por especificación (lo medí con un píxel;
  no leí CSS Color/CSS Compositing).
- Que `animationstart` dispare en el fotograma posterior a la creación de la animación y antes de los callbacks de
  `requestAnimationFrame` (lo que explica el sintético «un fotograma antes»: medido, no leído en la especificación HTML).

## 9. Para el cierre del lead

- Antes de cerrar la 48 conviene repetir `pnpm run test:e2e` con TODO el árbol junto (esta corrida se hizo con el árbol de los tres
  agentes tal como estaba a esa hora, y salió limpia).
- Quien lea `hero-reducido.spec.ts` encontrará DOS bloques de `@s5`: el de los valores aprobados (reloj congelado) y el del mismo
  instante (reloj vivo).
