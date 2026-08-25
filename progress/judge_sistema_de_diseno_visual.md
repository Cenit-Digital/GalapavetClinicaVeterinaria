# Review — feature sistema_de_diseno_visual (id 21)

**Fecha:** 23/08/2026 — Ronda 1 (judge)

**Veredicto:** APPROVED

(para la fracción verificable en jsdom, 26/34 escenarios). Los 8 escenarios de navegador real quedan legítimamente pendientes de una sesión posterior -- no son objeto de rechazo, mismo patrón ya aceptado en accesibilidad (id 19, judge Ronda 9 APPROVED con 4 pendientes de navegador real).

## Cobertura de escenarios (@s <-> test)

Bloque A -- colores de las 4 variantes (src/lib/diseno/tokensColor.test.ts):
- @s1: [x] extraerVariantesDeTokens, describe @s1, lee _tokens.scss real via ?raw
- @s2: [x] describe @s2 -- marca #FFFFFF/#77286B, ratio 9.13 recalculado (verificado tambien de forma independiente por mi)
- @s3: [x] describe @s3 -- lima #F8F9E8 (mezcla 10% verificada canal a canal), ratio 8.57
- @s4: [x] describe @s4 -- texto distinto de #B4C718, ratio 1.77 menor que 4.5
- @s5: [x] describe @s5 -- verde #F0F4F1 (mezcla 8%), ratio 5.12
- @s6: [x] describe @s6 -- noche #000000/#FFFFFF, ratio 21.00
- @s7: [x] describe @s7 -- foco noche #B4C718, ratio 11.12 mayor o igual que 3
- @s8: [x] describe @s8 -- morado sobre noche 2.30 menor que 3, ni texto ni foco
- @s9: [x] describe @s9 -- foco marca/lima/verde = 9.13/8.57/8.22, todos mayores o iguales que 3
- @s10: [x] describe @s10 -- lima/blanco 1.89 menor que 3, ningun foco claro = #B4C718
- @s11: [x] describe @s11 -- catalogo vacio, 0 comprobadas, veredicto suspenso
- @s12: [ ] PENDIENTE, navegador real (0% en jsdom -- exige un custom property CSS efectivamente resuelto tras interaccion; documentado explicitamente en progress/tdd_sistema_de_diseno_visual.md)

Bloque B -- escala tipografica (escalaTipografica.test.ts):
- @s13: [x] describe @s13 -- ratio 1.25 / base 16 / viewport 320-1024, literales a mano
- @s14: [x] describe @s14 -- viewportMaxPx === PUNTO_DE_CORTE_NAVEGACION_PX (importada, no repetida)
- @s15: [x] describe @s15 -- paso 0 = 16px en ambos extremos
- @s16: [x] describe @s16 -- min <= max en todos los pasos, mas de 0 comprobados
- @s17: [x] describe @s17 -- orden estrictamente creciente en ambos extremos
- @s18: [x] describe @s18 -- saturacion fuera de 320/1024

Bloque C -- escala de espaciado (escalaEspaciado.test.ts):
- @s19: [x] describe @s19 -- {4,8,12,16,24,32,48,64,96} exactos
- @s20: [x] describe @s20 -- multiplos de 4, dentro de [4,96]

Bloque D -- inventario y co-localizacion (inventarioModulos.test.ts):
- @s21: [x] describe @s21 -- 17 nombres exactos, sin MetadatosPagina
- @s22: [x] describe @s22 -- 17/17 con .module.scss real (import.meta.glob)
- @s23: [x] describe @s23 -- inventario vacio, 0 comprobados, falla cerrado
- @s24: [x] describe @s24 -- 17 ficheros reales, 0 senalados, via ejecutarPuertaDeLiteralesColor reutilizada de tokens_marca (no reescrita)

Bloque E -- punto de corte (puntoDeCorte.test.ts):
- @s25: [x] describe @s25 -- unico punto de corte de Cabecera.module.scss = 1024 = PUNTO_DE_CORTE_NAVEGACION_PX (sabotaje propio reproducido, ver Disciplina TDD)
- @s26: [x] describe @s26 -- 1025 hipotetico discreparia de esMovil(1024)

Bloque F -- area tactil real (cierra accesibilidad @s2/@s7):
- @s27: [ ] PENDIENTE, navegador real (0% en jsdom -- exige getBoundingClientRect real a 1024/1023px; la fraccion pura de esta familia YA esta en @s25/@s26)
- @s28: [ ] PENDIENTE, navegador real (0% -- axe-core con layout real)
- @s29: [ ] PENDIENTE, navegador real (0% -- rectangulos delimitadores reales)

Bloque G -- indicador de foco real (cierra accesibilidad @s17/@s18):
- @s30: [ ] PENDIENTE, navegador real (0%)
- @s31: [ ] PENDIENTE, navegador real (0%)
- @s32: [ ] PENDIENTE, navegador real (0%)

Bloque H -- prefers-reduced-motion:
- @s33: [x] movimientoRespetuoso.test.ts describe @s33 -- 2 tests: ficheros reales (0 incumplimientos) + fichero sintetico sin cobertura (detectado)
- @s34: [ ] PENDIENTE, navegador real (0% -- exige interrogar el motor de animaciones CSS real; @s33 es la fraccion pura completa de esta familia)

Total: 26/34 con test concreto y verde; 8/34 (@s12, @s27-@s32, @s34) son 0% en jsdom por diseno -- todos declarados explicitamente como navegador real en el propio .feature (Decision 11) y ninguno tiene una fraccion residual verificable sin fingir una medicion de layout que jsdom no calcula. Verificado por mi que ningun test usa un mock de getBoundingClientRect/getComputedStyle/getAnimations para fingir esa medicion (grep sin resultados en src/lib/diseno).

## Disciplina TDD

- Produccion sin test que la pida? NO, con una precision importante: src/components/Cabecera.tsx lineas 60-73 (el useEffect de Escape que cierra el menu movil y devuelve el foco) NO es de esta ronda -- el comentario cita "(@s25)" pero es el @s25 de accesibilidad.feature (id 19, ya judge-aprobado en su Ronda 9, mutacion 100%, ver progress/tdd_accesibilidad.md y progress/judge_accesibilidad.md, ambos sin commitear porque esa feature quedo blocked esperando exactamente esta feature 21). Confirmado con grep -rn "Escape" src: el test real que lo exige es src/accesibilidad-teclado.test.tsx linea 73 (describe @s25 el menu movil se cierra con Escape), no ningun test de sistema_de_diseno_visual. git diff -- src/components/Cabecera.test.tsx da vacio (ni una linea tocada), y progress/tdd_sistema_de_diseno_visual.md no menciona esta logica en ningun punto -- coherente con que pertenece a una ronda anterior, ya juzgada, que quedo sin commitear en el mismo arbol de trabajo. Todo lo demas que SI pertenece a esta ronda (17 diffs de .tsx, _tokens.scss, 6 modulos src/lib/diseno/*.ts, vite.config.ts) tiene su test correspondiente, verificado modulo a modulo arriba.
- Verificacion independiente de git diff --stat -- test.ts test.tsx: solo src/lib/contraste.test.ts cambia (173 inserciones, 2 eliminaciones -- las 2 eliminadas son la linea de import reformateada a multilinea, no una asercion retirada), puramente aditivo para las funciones nuevas de contraste.ts (umbralesDeContraste, esTextoGrande, evaluarParDeContraste, las 3 puertas por uso) -- de nuevo, pertenece a accesibilidad, no a esta feature, y es aditivo puro (no reabre ningun Given/When/Then existente).
- Evidencia de Rojo-Verde-Refactor? SI. progress/tdd_sistema_de_diseno_visual.md documenta 4 sabotajes manuales explicitos (@s14, @s25, @s23/@s11 por inspeccion, @s33) y 1 hallazgo real durante la implementacion (@s24, comentarios en espanol con "red" disparando el patron de color ingles). Reproduje yo mismo, de forma independiente, el sabotaje de @s25: cambie min-width: 1024px a 1023px en Cabecera.module.scss linea 63 y "npx vitest run src/lib/diseno/puntoDeCorte.test.ts" fallo en rojo (expected 2 to be 1); reverti con una copia previa del fichero y confirme verde de nuevo, sin resto en el arbol de trabajo (byte identico al original).

## Calidad

- Patron "matriz de uso" respetado de verdad: tokensColor.ts (leerTokenDeVariante) parsea el texto REAL de _tokens.scss con regex ancladas al selector :root[data-variante='...'] y al patron --color-rol:, nunca duplica un hexadecimal a mano fuera del propio fichero de tokens. Repliqué independientemente el algoritmo de src/lib/contraste.ts en un script del scratchpad y recalcule los 9 pares citados en la cabecera del .feature: los 9 coinciden digito a digito (9.13, 8.57, 1.77, 5.12, 21.00, 11.12, 1.89, 2.30, 8.22), y las 2 mezclas canal a canal (blanco+10% lima = #F8F9E8, blanco+8% verde = #F0F4F1) tambien coinciden.
- Toda la logica de decision vive en src/lib/diseno/*.ts (tokensColor.ts, escalaTipografica.ts, escalaEspaciado.ts, inventarioModulos.ts, puntoDeCorte.ts, movimientoRespetuoso.ts). Verificado que los 17 .tsx tocados (git diff) solo anaden import styles from './X.module.scss' y className={styles.xxx} -- cero logica nueva, cero literal de color/tamano. Los .module.scss solo consumen var(--color-*), paso-tipografico(N), espaciado(N) y los mixins foco-visible/area-tactil-minima de _tokens.scss -- confirmado con grep -rniE de hexadecimales/rgb sobre los 17 ficheros: 0 coincidencias.
- Breakpoint sin divergencia, verificado con sabotaje propio (ver Disciplina TDD arriba): Cabecera.module.scss usa 1024px en sus dos reglas min-width (lineas 39 y 63), identico a PUNTO_DE_CORTE_NAVEGACION_PX (Cabecera-logica.ts linea 10).
- prefers-reduced-motion respetado: unica regla transition real del inventario (Faq.module.scss linea 33) vive literalmente dentro de @media (prefers-reduced-motion: no-preference).
- Guardas de vacuidad correctas (@s11, @s23): ambas siguen el patron ya usado en el resto del proyecto -- fallan cerradas antes de delegar en un every()/filter() que daria verdadero vacuo.
- Nombres y funciones: cortas, un motivo por cambio, vocabulario espanol consistente con el resto del repo. Constantes con nombre (DECIMALES_DE_REDONDEO, CERO_VARIANTES, MULTIPLO_DE_LA_REJILLA), sin numeros magicos sueltos.
- _tokens.scss nunca se importa directamente desde un .tsx (evita el @use circular con additionalData), documentado con el error real de Sass reproducido -- decision de diseno correcta y justificada, no solo afirmada.
- Sin dependencias nuevas: sass-embedded ya estaba en package.json desde el commit inicial del arnes (git log -- vite.config.ts), no la anade esta feature.
- Sin console.log/TODO sin contexto en src/lib/diseno ni src/styles (grep sin resultados).
- Unico hallazgo NO bloqueante: el comentario "(@s25)" en Cabecera.tsx linea 60 es ambiguo entre dos .feature distintos con el mismo tag numerico (accesibilidad.feature @s25 vs sistema_de_diseno_visual.feature @s25) -- cosmetico, no afecta cobertura ni comportamiento, pero conviene desambiguar en un futuro toque de ese fichero.

## Checkpoints

- C1: [x] node .harness/harness.mjs init verde de punta a punta tras repetir la corrida (primera corrida dio timeout de arranque de worker por contencion de CPU, patron ya documentado repetidamente en este proyecto; segunda corrida 699/699 verde, lint y typecheck limpios)
- C2: [x] una sola feature in_progress (sistema_de_diseno_visual, id 21); accesibilidad (id 19) esta blocked, no in_progress
- C3: [x] sin dependencias nuevas, sin literales de color/tamano fuera de tokens, sin debug/TODO sueltos
- C4: [x] cada modulo nuevo de src/lib/diseno/ tiene su test.ts dedicado; los tests leen ficheros reales (?raw), no mocks de sistema de ficheros
- C5: [ ] no aplica a mitad de sesion (feature aun no done)
- C6: [x] .feature con 34 escenarios @s1-@s34, mapa @s -> test completo en progress/tdd_sistema_de_diseno_visual.md, sin produccion sin test que la exija dentro del alcance de esta ronda
- C7: [ ] pendiente de mutation_tester (posterior a este veredicto)

## Cambios requeridos (si aplica)

Ninguno bloqueante. Nota cosmetica no bloqueante ya registrada arriba (ambiguedad del comentario "(@s25)" en Cabecera.tsx, perteneciente a la ronda de accesibilidad, no a esta).

Siguiente paso recomendado: mutation_tester sobre los 6 modulos nuevos de src/lib/diseno/ (y la extension aditiva de src/lib/contraste.ts, si el craftsman_lead decide incluirla en este ciclo o dejarla para el cierre de accesibilidad). Los 8 escenarios de navegador real quedan para la sesion con vite build && vite preview + navegador real ya anunciada por el propio tdd_craftsman.

---

# Review -- feature sistema_de_diseno_visual (id 21) -- Ronda 2 (refuerzo de mutacion)

**Fecha:** 23/08/2026 -- Ronda 2 (judge)

**Veredicto:** APPROVED

## Alcance de esta ronda

tdd_craftsman respondio al FAIL de mutation_tester Ronda 1
(progress/mutation_sistema_de_diseno_visual.md, 132/177 = 74.58% sobre no
equivalentes) anadiendo tests dirigidos a los 45 mutantes sobrevivientes
reales repartidos en 5 de los 6 modulos de src/lib/diseno/. Documentado en
la seccion Ronda 2 -- refuerzo de mutacion de
progress/tdd_sistema_de_diseno_visual.md. No se anade ni retira cobertura
de escenarios @s en esta ronda (sigue 26/34 verificado en jsdom, igual que
Ronda 1); el alcance es exclusivamente matar mutantes con tests, no tocar
comportamiento.

## Verificacion de git diff --stat (cero produccion no justificada)

Los 6 modulos de src/lib/diseno/ son ficheros NUEVOS de esta feature
(directorio entero sin trackear, git status los reporta como untracked
src/lib/diseno/), asi que git diff --stat no puede acotar Ronda 1 vs
Ronda 2 para ellos (no hay commit intermedio). Verificacion independiente
alternativa, en dos pasos:

1. Cotejo linea:columna contra el informe de mutacion Ronda 1. Rele los
   5 ficheros de produccion integros y cruce cada referencia linea:columna
   del informe (tokensColor.ts 27:9, 37:7, 54:7, 82:7, 87:10/38/51;
   inventarioModulos.ts 52:10, 66:72, 70:13, 71:10, 73:18;
   puntoDeCorte.ts linea 6 regex; escalaTipografica.ts 81:22;
   movimientoRespetuoso.ts 19:30, 20:23, 21:40, 27:7, 44:35/105,
   46:9/24, 48:16, 71:33/62, 76:12/30, 80:11) contra el
   contenido actual: las aproximadamente 40 referencias coinciden exactamente,
   caracter a caracter, con el codigo fuente vigente. Un cambio de produccion
   real habria desplazado al menos algunas de estas lineas/columnas; no
   ocurrio en ninguna.
2. mtimes. Los 5 ficheros de produccion tienen mtime posterior al de sus
   .test.ts (por ejemplo escalaTipografica.ts 15:32 vs escalaTipografica.test.ts
   13:59), consistente con el propio relato del tdd_craftsman (cada uno de
   los 44 mutantes se saboteo individualmente en el fichero de produccion
   correspondiente y se revirtio): el mtime se actualiza por el
   sabotaje mas reversion aunque el contenido final sea identico. Confirmado
   por mi de forma independiente (ver sabotajes propios abajo): tras
   sabotear y revertir dos ficheros distintos, diff contra la copia previa a
   mi propio sabotaje dio sin diferencias; mismo patron.

src/lib/contraste.ts y contraste.test.ts SI aparecen en git diff --stat
(+111/+174), pero ya estan investigados y correctamente excluidos por
progress/judge_sistema_de_diseno_visual.md Ronda 1 y por
progress/mutation_sistema_de_diseno_visual.md Ronda 1: pertenecen a la
ronda de accesibilidad (id 19, blocked), no a esta feature ni a esta
ronda; tokensColor.ts solo reutiliza ejecutarPuertaDeContraste tal
cual, sin tocar el fichero. No hay ninguna otra modificacion de produccion
que no este ya justificada.

Conclusion: cero produccion nueva en Ronda 2, confirmado de forma
independiente.

## Verificacion independiente de sabotaje manual (2 tests nuevos)

1. escalaTipografica.ts linea 81 (cambio de (maxPx - minPx) a
   (maxPx + minPx) en el numerador de la pendiente): saboteado a mano,
   npx vitest run src/lib/diseno/escalaTipografica.test.ts dio 1 test en
   rojo exacto (el test del punto medio del rango, 672px: expected 20.48 to
   be 10.24), 6 tests restantes verdes. Revertido con la copia previa; diff
   confirma fichero byte-identico; vuelto a correr, 7/7 verde.
2. inventarioModulos.ts linea 52 (funcion rutaEstiloDe devolviendo cadena
   vacia en vez del literal de plantilla real): saboteado a mano, npx
   vitest run src/lib/diseno/inventarioModulos.test.ts dio 1 test en rojo
   exacto (el test del modulo del inventario sin su fichero de estilos,
   inventario real mas un nombre inventado: expected true to be false), 4
   tests restantes verdes. Revertido con la copia previa; diff confirma
   fichero byte-identico; vuelto a correr, 5/5 verde.

Ambos sabotajes reproducen exactamente el mutante y el test que la bitacora
del tdd_craftsman documenta como el que lo mata, sin desviacion.

## Disciplina TDD

- Produccion sin test que la pida? NO en esta ronda (verificado arriba con
  dos metodos independientes: cotejo linea:columna mas sabotaje propio en 2
  ficheros distintos).
- Evidencia de Rojo-Verde-Refactor? SI. La bitacora documenta, para cada
  uno de los 44 mutantes reales (45 reportados menos 1 reclasificado como
  equivalente), sabotaje individual, confirmacion de rojo con
  vitest run seguido del fichero de test, y reversion, antes de continuar
  con el siguiente. Reproducido de forma independiente por mi en 2 de
  ellos (ver arriba), con resultado identico al documentado.
- El unico mutante reclasificado como equivalente (tokensColor.ts 87:51,
  el literal suspenso mutado a cadena vacia) esta justificado con
  argumento verificable: la unica via real hacia el veredicto suspenso en
  ejecutarComprobacionDeContrasteDeVariantes es la guarda de vacuidad (linea
  82-83, con su propio literal en una posicion de codigo distinta), porque
  ejecutarPuertaDeContraste (contraste.ts, done, fuera de alcance) nunca
  devuelve pasa:false para un catalogo no vacio; solo falla cerrada por
  vacuidad. Lei ejecutarPuertaDeContraste (src/lib/contraste.ts lineas
  130-145) y confirmo que no hay ninguna otra rama que produzca pasa:false
  con catalogo.length mayor que cero: el argumento se sostiene. No se
  duplico logica de aptitud en tokensColor.ts para forzar cobertura de una
  rama que ningun escenario exige; correcto, dado que la Ley 1 (nunca
  produccion sin test que la pida) tambien corta en la otra direccion: no se
  fabrica un test artificial para un camino muerto.

## Calidad

- Los 13 tests nuevos (mas 2 aserciones reforzadas en tests ya existentes de
  @s33 y @s23) siguen el mismo patron ya aprobado en Ronda 1: nombres de
  describe/it descriptivos en espanol, sin duplicar literales fuera de lo
  necesario, con comentarios que documentan el mutante concreto que matan
  (movimientoRespetuoso.test.ts linea 32 documenta explicitamente "deja de
  cubrir una declaracion posterior a su cierre").
- Ningun test usa mocks de sistema de ficheros ni de getBoundingClientRect;
  los ficheros sinteticos (SinCobertura.module.scss, ConReduce..., etc.) son
  literales de texto en memoria, mismo patron ya validado en Ronda 1.
- movimientoRespetuoso.test.ts (104 lineas, 7 "it" dentro de 1 "describe")
  sigue siendo legible y cada test tiene un unico motivo de fallo.
- Sin numeros magicos nuevos sin nombrar en produccion (no hay produccion
  nueva que revisar en esta ronda).

## Checkpoints

- C1: [x] node .harness/harness.mjs init verde de punta a punta, corrida
  independiente: lint limpio, typecheck limpio, 712/712 tests (699 a 712,
  +13, coincide con lo declarado por tdd_craftsman).
- C2: [x] unica feature in_progress (sistema_de_diseno_visual, id 21);
  accesibilidad (id 19) sigue blocked.
- C3: [x] sin dependencias nuevas; sin literales sueltos nuevos (no hay
  produccion nueva en esta ronda).
- C4: [x] los 5 modulos reforzados mantienen su test dedicado; los tests
  nuevos usan texto sintetico en memoria o ficheros reales via query raw,
  nunca mocks de sistema de ficheros.
- C5: [ ] no aplica a mitad de sesion (feature aun no done).
- C6: [x] mapa @s a test sin cambios respecto a Ronda 1 (esta ronda no
  toca escenarios, solo refuerza mutacion); sin produccion sin test que la
  exija, verificado con dos metodos independientes.
- C7: [ ] pendiente de nueva medicion de mutation_tester sobre esta Ronda 2
  (objetivo: 100% sobre no equivalentes, incluida la revision de la
  reclasificacion de tokensColor.ts 87:51).

## Cambios requeridos (si aplica)

Ninguno bloqueante. Siguiente paso: mutation_tester Ronda 2 sobre los 6
modulos de src/lib/diseno/ para confirmar que el score sobre no
equivalentes alcanza el umbral 1.0 de harness.config.json.

---

# Revision de cierre (25/08/2026, tras identidad_visual)

**Encargo:** verificacion de cierre completa de `sistema_de_diseno_visual` (id 21,
`blocked`) pedida directamente por `craftsman_lead`, tras el cierre de
`identidad_visual` (id 22, `done`), que modifico varios de los ficheros
compartidos de `src/lib/diseno/` que esta feature creo y muto. No repite la
revision de la 22 (ya `done`), no toca `src/` ni tests, no emite veredicto sobre
`accesibilidad` (id 19).

**Veredicto de esta revision:** **CHANGES_REQUESTED** -- no por disciplina TDD ni
por cobertura de escenarios jsdom (ambas siguen intactas), sino por dos huecos
concretos: (1) `mutation_tester` nunca remidio 3 de los 6 modulos tras el
refuerzo de Ronda 2 (23/08/2026) -- el hueco que esta feature arrastra desde
entonces, confirmado; (2) un `Then` de `@s27` sin verificacion real en el test
heredado de navegador real, y una discrepancia de literal en `@s34` frente a
una decision de diseno posterior y justificada de `identidad_visual`.

## 1. Los 26 escenarios jsdom de Ronda 1/2 siguen genuinamente en verde

`pnpm exec vitest run` sobre los 6 modulos completos de `src/lib/diseno/`
(`tokensColor.test.ts`, `escalaTipografica.test.ts`, `escalaEspaciado.test.ts`,
`inventarioModulos.test.ts`, `puntoDeCorte.test.ts`,
`movimientoRespetuoso.test.ts`): **6 ficheros, 73/73 tests, verde**. `bin/harness
init` completo repetido por mi de forma independiente: **914/914 tests, lint y
typecheck limpios**.

Una primera corrida de `pnpm run test` completo dio 4 fallos en
`src/accesibilidad-teclado.test.tsx` (`@s26`); repetido ese fichero en
aislamiento, **5/5 verde** -- mismo patron de inestabilidad por contencion de
CPU bajo `userEvent.tab()` ya documentado repetidamente en este proyecto (y
citado tambien por `identidad_visual` en su propia medicion de mutacion de
Ronda A). No pertenece a `sistema_de_diseno_visual.feature` (es `@s26` de
`accesibilidad.feature`, id 19) y `bin/harness init` confirmo verde de punta a
punta en una corrida limpia.

**Confirmado: nada de lo que `identidad_visual` toco en `tokensColor.ts` (Ronda
A) ni en `inventarioModulos.ts` (Ronda C) rompio ningun test de
`sistema_de_diseno_visual.feature`.** Los 26/34 escenarios jsdom (`@s1`-`@s11`,
`@s13`-`@s26`, `@s33`) siguen genuinamente verificados.

## 2. Los 8 escenarios de navegador real, uno a uno contra el Then real de Playwright

Verificado en vivo (no solo leido): `pnpm exec playwright test
tests/e2e/tokens-aplicados.spec.ts tests/e2e/accesibilidad.spec.ts
tests/e2e/movimiento.spec.ts` -> **25/25 passed** (22.4s), coherente con
`test-results/.last-run.json` (`"status": "passed"`, 25/08 13:54) y con el
65/65 documentado por `identidad_visual`.

### @s12 -- variante cambia el color computado en el navegador

Then exacto: "el valor computado del custom property de color de fondo del
ELEMENTO RAIZ cambia a cada uno de los 4 valores... recuento == 4".

Test heredado: `tests/e2e/tokens-aplicados.spec.ts:41-96` (`@s25`). Por cada
una de las 4 variantes, lee el token real con `leerTokenDeVariante` (mismo
modulo, no un literal duplicado), hace clic, espera con `waitForFunction` a
que `getComputedStyle(document.body)` iguale fondo Y texto, y cuenta
`variantesVerificadas === 4`.

Veredicto: cubierto, con una nota cosmetica. El test verifica el color
computado de `document.body`, no literalmente el custom property leido sobre
el elemento raiz (`documentElement`/`:root`). Es una verificacion mas
exigente en espiritu (confirma que el token se aplica de verdad visualmente,
no solo que la variable CSS cambia de valor sin que nada la consuma --
exactamente lo que el patron de memoria "el verde que no funciona" pide) pero
no es literalmente lo que dice el Then. No bloqueante.

### @s27 -- punto de corte de la cabecera real (1024/1023)

Then exacto: "a 1024px la fila de navegacion horizontal esta presente... a
1023px no esta presente y el boton de menu si... NINGUN ELEMENTO DE LA
CABECERA SE DESBORDA NI SE SUPERPONE CON OTRO en ninguno de los dos anchos".

Test heredado: `tests/e2e/accesibilidad.spec.ts:314-325`. Comprueba
visibilidad de `nav`/boton de menu a 1024 y 1023px, nada mas.

Veredicto: **HALLAZGO REAL (no cosmetico). La tercera clausula del Then --
desbordamiento/superposicion de elementos de la cabecera -- no la verifica
ningun test.** Grep de "solap|overlap|desborda|superpone" en `tests/e2e/`
solo encuentra `@s44` (`layout.spec.ts`, desbordamiento horizontal generico
de la RUTA a 320px de ancho -- otro viewport, otro proposito, no la cabecera
a 1024/1023). Ninguna llamada a `boundingBox()` de los elementos de la
cabecera ni comprobacion de solape en este test.

### @s28 -- 0 violaciones de target-size en la portada

Then exacto: "0 violaciones de target-size... sobre la portada".

Test heredado: `accesibilidad.spec.ts:24-51` (`@s36`). Las 5 etiquetas axe
acumuladas (incluye target-size), 0 violaciones, en las 6 rutas (incluida
"/", la portada, `rutas.ts:14`).

Veredicto: cubierto -- superconjunto que exige 0 violaciones de TODAS las
reglas en 6 rutas, lo que implica 0 de target-size en la portada.

### @s29 -- area tactil minima de enlaces reales

Then exacto: "cada enlace de navegacion, de pie de pagina y de telefono mide
>= 24x24px... recuento > 0".

Test heredado: `accesibilidad.spec.ts:74-93` (`@s37`). Mide el `boundingBox`
de TODO control interactivo visible (`a[href], button, input, select,
textarea, [role=button], [tabindex]`) en las 6 rutas, exige 0 insuficientes y
recuento > 0.

Veredicto: cubierto -- superconjunto que incluye los 3 tipos citados.

### @s30/@s31 -- perimetro y contraste del indicador de foco

Then exacto @s30: "area del indicador de foco >= perimetro de 2px CSS de
grosor... recuento > 0". Then exacto @s31: "ratio de contraste entre estado
con foco y sin foco >= 3".

Test heredado: `accesibilidad.spec.ts:97-152` (`@s38`). Calcula
`outlineWidth >= 2`, `outlineStyle !== 'none'`, y
`calcularRatioContraste(outlineColor, fondoSinFoco)` >= 3, en las 6 rutas.

Veredicto: cubierto. El grosor uniforme del outline (mismo valor en todo su
perimetro por definicion CSS) es la verificacion correcta del area minima
descrita en @s30. @s31 tiene un matiz menor: compara el color del anillo
contra el fondo de ANTES de enfocar, no literalmente "los mismos pixeles" en
los dos estados -- interpretacion razonable, no bloqueante.

### @s32 -- la cabecera fija no tapa el control con foco

Then exacto: "al menos parte del rectangulo del control enfocado queda fuera
del rectangulo de la cabecera fija".

Test heredado: `accesibilidad.spec.ts:253-311` (`@s40`). Tabula toda la
pagina, excluye los controles que son la propia cabecera, exige
`integramenteBajoLaCabecera === false` y dentro del viewport, en las 6 rutas.

Veredicto: cubierto.

### @s34 -- sin animacion en curso con menos movimiento

Then exacto: "ningun elemento tiene una animacion en curso... ninguna
transicion se ejecuta con una duracion DISTINTA DE 0".

Test heredado: `movimiento.spec.ts:8-82` (`@s42`). 0 animaciones en curso en
6 rutas + tras interactuar con acordeones/galeria/selector; transiciones con
umbral `TECHO_MS_REDUCIDO = 0.02` (no 0).

Veredicto: **HALLAZGO REAL, no bloqueante pero digno de mencion.**
`global.scss:241-243` fija `transition-duration: 0.01ms` bajo `reduce` (no
`0`), con una justificacion tecnica explicita y correcta
(`transitionend`/`animationend` no se disparan con duracion exactamente 0,
documentado en el propio comentario del fichero). El test heredado verifica
fielmente el comportamiento REAL e intencional del sitio, pero ese
comportamiento CONTRADICE EL LITERAL del Then de @s34 ("distinta de 0"),
escrito el 22/08/2026 antes de que existiera esa decision de diseno. Mismo
patron que otras reconciliaciones de texto ya hechas por craftsman_lead en
cierres anteriores (pagina_campanas/pagina_blog sobre
ensamblaje_landing.feature): no es un defecto de comportamiento, es un texto
Gherkin desactualizado frente a una decision posterior justificada.

### Conclusion del punto 2

7 de los 8 escenarios estan genuinamente satisfechos por el trabajo de
`identidad_visual` (con matices cosmeticos documentados en @s12/@s31 que no
requieren accion). **@s27 tiene un hueco de verificacion real** (la clausula
de desbordamiento/superposicion de la cabecera nunca se comprueba) y **@s34
tiene una discrepancia de texto** entre el .feature de esta feature y una
decision de diseno posterior y ya validada de `identidad_visual`.

`escenariosHeredados.ts`/`escenariosHeredados.test.ts` (@s51 de
`identidad_visual`) solo verifica que los 12 identificadores esten CITADOS
COMO TEXTO en algun `.spec.ts` -- no verifica que el Then que citan sea el
correcto. Confirmado en vivo: es una red de "no olvidar automatizar", no una
prueba de fidelidad de contenido. Por eso esta comparacion escenario a
escenario, no esa cita, es la evidencia real pedida por el encargo.

## 3. Alcance exacto de mutacion pendiente

Confirmado con `git log --oneline -- <fichero>` por fichero (no solo lectura
de bitacoras) y con el contenido integro de
`progress/mutation_identidad_visual.md`:

- `escalaEspaciado.ts` -- NO tocado por `identidad_visual` (ultimo commit
  `6ffd3b7`, WIP previo a la 22). Ya PASS 100% (1/1) desde **Ronda 1** de la
  21 (nunca tuvo supervivientes) -- no requiere refuerzo, remedir es
  opcional/barato.
- `escalaTipografica.ts` -- NO tocado (`6ffd3b7`). **Nunca remedido tras el
  refuerzo de Ronda 2** (1 superviviente real corregido, 0% verificado desde
  entonces).
- `puntoDeCorte.ts` -- NO tocado (`6ffd3b7`). **Nunca remedido tras el
  refuerzo de Ronda 2** (2 supervivientes reales corregidos, 0% verificado
  desde entonces).
- `movimientoRespetuoso.ts` -- NO tocado (`6ffd3b7`). La nota de
  `feature_list.json` ("puede que afecte a este fichero") es INCORRECTA:
  `identidad_visual` creo un fichero NUEVO Y DISTINTO, `escalaMovimiento.ts`
  (@s16 de la 22), sin tocar `movimientoRespetuoso.ts` en absoluto. **Nunca
  remedido tras el refuerzo de Ronda 2** (26 supervivientes reales
  corregidos, el fichero con mas huecos de la Ronda 1, 0% verificado desde
  entonces).
- `tokensColor.ts` -- SI tocado, Ronda A de la 22 (`93bdf72`: lector
  generalizado, 15 roles de color + 2 de sombra). **Ya remedido y PASS** por
  el propio `mutation_tester` de la 22: 192 mutantes totales (184 killed + 4
  timeout investigados como equivalentes genuinos -- "Hit limit reached" en
  el bucle de `extraerBloqueDeVariante`, confirmado con reproduccion
  aislada, no heredado del informe anterior -- , 3 survived + 1 no-cov
  reclasificados como los mismos 5 equivalentes ya conocidos). **100.00%
  sobre no-equivalentes (188/188)**, verificado independientemente por
  `judge` de la 22. No requiere nueva medicion.
- `inventarioModulos.ts` -- SI tocado, Ronda C de la 22 (`9cabe10`:
  `MODULOS_SIN_REPRESENTACION_VISUAL`, `comprobarInventarioCompleto` para
  @s51). **Ya remedido y PASS** por el propio `mutation_tester` de la 22, DOS
  veces (antes y despues de su propio refuerzo de Ronda C): **100.00%
  (58/58)** en ambas mediciones, 0 supervivientes. No requiere nueva
  medicion.

**Veredicto del punto 3, preciso fichero por fichero:** `mutation_tester`
necesita remedir exactamente **3 ficheros** para cerrar la 21 --
`src/lib/diseno/movimientoRespetuoso.ts`, `src/lib/diseno/puntoDeCorte.ts` y
`src/lib/diseno/escalaTipografica.ts` -- los tres nunca remedidos desde el
refuerzo de Ronda 2 (23/08/2026) de esta misma feature, e intactos desde
entonces (confirmado con `git log` por fichero, ningun commit posterior).
`escalaEspaciado.ts` puede incluirse en la misma tanda por higiene del
informe final (1 solo mutante, ya PASS desde Ronda 1, coste minimo) pero no
es estrictamente necesario. `tokensColor.ts` e `inventarioModulos.ts` **NO**
necesitan remedirse: ya estan remedidos sobre su version actual y ampliada,
con PASS 100% sobre no-equivalentes, verificados de forma independiente por
el judge/mutation_tester de `identidad_visual`.

## 4. Los 17 .module.scss tras el rediseno fino de la Ronda C

`@s24` (puerta de literales de color, reutilizada de `tokens_marca`) sigue
verde: forma parte de los 73/73 verificados en el punto 1, ejecutada sobre el
inventario REAL de 17 ficheros via `import.meta.glob`. Verificado ademas de
forma independiente con grep propio (`#[0-9a-fA-F]{3,6}|rgb\(|rgba\(`) sobre
`src/**/*.module.scss`: **0 coincidencias** en los 17 ficheros.

Inspeccion manual de 3 ficheros al azar (`Cabecera.module.scss`,
`Galeria.module.scss`, `FormularioContacto.module.scss`): los tres consumen
exclusivamente `var(--color-*)`, `espaciado(N)`, `paso-tipografico(N)` y los
mixins `foco-visible`/`area-tactil-minima` (mas `tarjeta`/`boton-primario`/
`boton-fantasma`/`hueco-de-imagen`, ya del vocabulario de `identidad_visual`).
`Cabecera.module.scss` sigue con el unico punto de corte 1024px en sus dos
reglas `min-width` (lineas 67 y 111), identico a
`PUNTO_DE_CORTE_NAVEGACION_PX` -- sin divergencia tras el rediseno. `@s33`
(transiciones dentro de `prefers-reduced-motion: no-preference`) tambien
sigue verde sobre el contenido REAL y actual de los 17 ficheros (mismo test
del punto 1).

## Checkpoints de esta revision

- C1: [x] `bin/harness init` verde de punta a punta (914/914, lint/typecheck
  limpios), repetido por mi de forma independiente.
- C2: [x] 0 features `in_progress` en este momento (`identidad_visual` ya
  `done`; la 21 sigue `blocked`).
- C3: [x] sin dependencias nuevas, sin literales de color fuera de tokens
  (verificado con grep propio), sin produccion tocada por mi.
- C4: [x] los 6 modulos de `src/lib/diseno/` de esta feature mantienen test
  dedicado y pasan (73/73).
- C5: no aplica (revision de cierre, no fin de sesion).
- C6: [ ] `@s27` tiene una clausula del Then sin test que la verifique en
  `tests/e2e/`; el resto de los 34 @s tiene cobertura real, con las notas
  cosmeticas de @s12/@s31 y la discrepancia de texto de @s34 documentadas
  arriba.
- C7: [ ] pendiente -- `mutation_tester` debe remedir `movimientoRespetuoso.ts`,
  `puntoDeCorte.ts` y `escalaTipografica.ts` (mas `escalaEspaciado.ts`,
  opcional) antes de poder marcar C7 en verde para esta feature.

## Cambios requeridos para poder aprobar el cierre de la 21

1. **Bloqueante -- mutacion pendiente:** ejecutar `mutation_tester` sobre
   `src/lib/diseno/movimientoRespetuoso.ts`, `src/lib/diseno/puntoDeCorte.ts`
   y `src/lib/diseno/escalaTipografica.ts` (el refuerzo de Ronda 2 nunca se
   remidio). Umbral 1.0 sobre no-equivalentes, igual que el resto del
   proyecto.
2. **Bloqueante -- hueco de test en @s27:** anadir a
   `tests/e2e/accesibilidad.spec.ts` (o a un test dedicado) la verificacion
   de que ningun elemento de la cabecera se desborda ni se superpone con
   otro a 1024px y a 1023px (p. ej. `boundingBox()` de cada hijo directo de
   `header` comparado entre si, en los dos anchos) -- la unica clausula del
   Then de @s27 que hoy no verifica nada.
3. **No bloqueante, recomendado:** reconciliar el texto de @s34
   (`sistema_de_diseno_visual.feature`) con la decision de `identidad_visual`
   de usar 0.01ms en vez de 0 bajo `prefers-reduced-motion: reduce` (razon
   documentada en `global.scss:234-236`), mismo patron de reconciliacion ya
   usado en cierres anteriores del proyecto.
4. **No bloqueante:** ninguna accion sobre @s12/@s31 -- son matices de
   interpretacion razonables del test heredado, no defectos.

## Refuerzo final -- formas largas (25/08/2026)

**Encargo:** revisión puntual y acotada del refuerzo de `tdd_craftsman` sobre
`src/lib/diseno/movimientoRespetuoso.ts:21`, encargado por `craftsman_lead`
para cerrar el único mutante superviviente real que dejó la re-medición de
Ronda 2 (`progress/mutation_sistema_de_diseno_visual.md`, sección
"Re-medicion tras Ronda 2 (25/08/2026)", `movimientoRespetuoso.ts:21:40`).

**Veredicto: APPROVED.**

### Alcance verificado

`git status --porcelain -- src/lib/diseno/` da exactamente 2 ficheros:
`movimientoRespetuoso.ts` y `movimientoRespetuoso.test.ts`. `git diff` de
producción confirma **una sola línea tocada** (línea 21):

```
-const PATRON_PROPIEDAD_DE_MOVIMIENTO = /^\s*(animation|transition)\s*:/
+const PATRON_PROPIEDAD_DE_MOVIMIENTO = /^\s*(animation|transition)(-[\w-]+)?\s*:/
```

Ningún otro fichero de `src/lib/diseno/`, ningún `.module.scss`, ningún otro
`progress/*.md` tocado. Coincide con lo declarado por `tdd_craftsman`.

### Corrección de la regex (verificación propia, no heredada)

Ejecuté un script `node -e` independiente comparando la regex ORIGINAL
(preexistente) contra la FINAL (con el grupo `(-[\w-]+)?`) sobre 12 casos,
incluyendo los dos casos límite que pedía el encargo:

- `border-color: red;` → ninguna de las dos matchea (propiedad no
  relacionada, cero falsos positivos).
- `transitional-property: 1;` → la regex FINAL sigue sin matchear (`false`):
  tras `transition` el siguiente carácter es `a`, no un guion ni espacio ni
  `:`, así que ni el grupo opcional `(-[\w-]+)?` ni `\s*:` pueden avanzar.
  Ningún falso positivo introducido por el cambio.
- `transitionfoo: 1;` → tampoco matchea, mismo razonamiento.
- Formas cortas ya cubiertas (`transition: color 150ms ease;`,
  `animation: none;`) → siguen matcheando igual que antes del cambio (no se
  rompió ninguna cobertura preexistente).
- Formas largas reales (`transition-duration:`, `animation-name:`,
  `transition-timing-function:`) → ahora matchean, que es el comportamiento
  buscado por la decisión de diseño del `craftsman_lead`.
- El caso comentado ya cubierto por un test existente (`// transition: fake`
  en medio de línea) → sigue sin matchear, el ancla `^` no se tocó.

No encontré falsos positivos ni regresiones sobre formas cortas.

### Sabotaje reproducido con mis propias manos (no heredado del informe)

Apliqué el sabotaje exacto documentado por `mutation_tester`
(`movimientoRespetuoso.ts:21:40`, Regex, `\s*` → `\S*` justo antes de los
dos puntos) directamente sobre el fichero real de producción (con un script
que localiza la línea por contenido, la sustituye y escribe el fichero;
copia de seguridad tomada antes en el scratchpad de esta sesión), y corrí
`pnpm exec vitest run src/lib/diseno/movimientoRespetuoso.test.ts`:

- Con el sabotaje aplicado: **8 pasan, 1 falla** -- exactamente el test del
  Ciclo 2 ("una propiedad larga real con un espacio antes de los dos puntos
  también se señala como incumplimiento"), que esperaba
  `incumplimientos: [{ ruta: ..., linea: 2 }]` y recibió `[]`. El resto,
  incluido el test del Ciclo 1 (forma larga sin espacio), sigue en verde
  bajo el mutante -- coincide con el análisis de `tdd_craftsman`: el grupo
  hifenado ya consume el sufijo, así que sin espacio antes de los dos puntos
  `\s*` y `\S*` son indistinguibles; el único caso que distingue es con
  espacio antes de los dos puntos.
- Revertido el sabotaje (restaurada la copia de seguridad): `git diff
  --stat` vuelve a mostrar 1 línea, y la suite del fichero vuelve a 9/9
  verde.

Confirmado con mis propias manos, no por confianza en el informe del
`tdd_craftsman`: el test del Ciclo 2 es el que efectivamente mata este
mutante; sin él, sobrevive.

### Cobertura de @s33 (este refuerzo)

- @s33: [x] ya cubierto antes de este refuerzo (7 tests de Ronda 2); el
  hueco real era de implementación (no reconocía formas largas), no de
  escenario sin test. Los 2 tests nuevos (`movimientoRespetuoso.test.ts:92`
  y `:105`) cierran ese hueco de implementación sin añadir un escenario
  Gherkin nuevo -- correcto, es refuerzo de mutación/regresión sobre un
  escenario ya existente, no una funcionalidad nueva.

### Disciplina TDD

- ¿Producción sin test que la pida? NO -- la línea 21 cambia exactamente
  para satisfacer los dos tests nuevos (Ciclo 1 y Ciclo 2), documentados con
  Rojo confirmado contra el código anterior en
  `progress/tdd_sistema_de_diseno_visual.md:580-655`.
- ¿Evidencia de Rojo→Verde→Refactor? SÍ -- dos ciclos documentados, el
  segundo descubierto durante el propio sabotaje manual (honesto: el primer
  test no bastaba, y `tdd_craftsman` lo detectó y añadió un segundo test en
  vez de darse por satisfecho con el primero).

### Calidad

- Cambio de una línea, sin funciones nuevas, sin números mágicos, nombres
  ya existentes y reveladores (`PATRON_PROPIEDAD_DE_MOVIMIENTO`). No hay
  contrato de errores nuevo que evaluar (es una regex pura, sin I/O). Respeta
  `docs/architecture.md`: sigue siendo una función pura en `src/lib/diseno/`,
  sin nuevas dependencias ni cambios de capa.
- Los 2 tests nuevos siguen el estilo y nivel de detalle del resto del
  fichero (nombres descriptivos en español, un solo motivo de fallo por
  test, sin duplicación relevante).

### Verificación de arnés (repetida por mí, no heredada)

- `pnpm run test`: **916/916** verde.
- `bash bin/harness init`: lint (`oxlint --deny-warnings`) limpio,
  `tsc -b` sin errores, **916/916** tests verdes, "Entorno listo."

### Checkpoints (este refuerzo)

- Cobertura @s33: [x]
- TDD sin producción huérfana: [x]
- Alcance de una sola línea de producción: [x]
- Sabotaje reproducido de forma independiente: [x]
- `bin/harness init` verde: [x]

### Siguiente paso

Pendiente (fuera de mi alcance como judge): nueva re-medición de
`mutation_tester` acotada a `src/lib/diseno/movimientoRespetuoso.ts` para
confirmar 100% sobre mutantes no equivalentes. Los 2 equivalentes ya
aceptados en Ronda 1/2 (`30:10`, `39:32`) no deberían verse afectados, al no
haberse tocado esas líneas.

## Cierre final (25/08/2026)

**Encargo:** revisión de cierre FINAL de `sistema_de_diseno_visual` (id 21, `in_progress`), tras completarse hoy todo lo que mi propia revisión de cierre anterior (sección "Revisión de cierre (25/08/2026, tras identidad_visual)") dejó pendiente: (1) remedición de mutación de `movimientoRespetuoso.ts`, `puntoDeCorte.ts`, `escalaTipografica.ts` (+ `escalaEspaciado.ts`); (2) test para la cláusula 3 de `@s27` (desbordamiento/superposición de cabecera); (3) reconciliación de texto de `@s34`. Verificación 100% independiente, no heredada de las bitácoras: repetí `bin/harness init`, corrí Playwright yo misma sobre los 3 ficheros de e2e relevantes, leí el `git log`/`git status` de cada fichero tocado, y leí el texto exacto de `@s34` y del test nuevo de `@s27`.

**Veredicto:** APPROVED -- lista para `done`.

### 1. Los 6 modulos puros de src/lib/diseno/ al 100% sobre no-equivalentes, confirmado

- escalaEspaciado.ts: PASS 1/1 (100.00%) desde Ronda 1, nunca tuvo supervivientes -- reconfirmado en la remedicion de hoy.
- escalaTipografica.ts: PASS 13/13 (100.00%) sobre no-equivalentes, remedido hoy -- el unico superviviente real de Ronda 1 (81:22) ahora Killed por el test del punto medio del viewport (672px); los 15 restantes son los mismos equivalentes ya verificados algebraica y empiricamente en Ronda 1 (minPx === maxPx en todo el dominio con los parametros de la Decision 24, verificado por mi releyendo escalaTipografica.ts:62).
- puntoDeCorte.ts: PASS 9/9 (100.00%), remedido hoy -- los 2 supervivientes de Ronda 1 (formato "@media screen and (...)" y espaciado alternativo) ahora Killed por los 2 tests sinteticos de Ronda 2. 0 equivalentes.
- movimientoRespetuoso.ts: PASS 72/72 (100.00%) sobre no-equivalentes, en la remedicion final acotada a este unico fichero. El unico mutante real que quedaba tras la Ronda 2 (21:40, variante \S* sobre el sufijo largo hifenado) esta Killed por los 2 tests del "Refuerzo final" que yo misma aprobe hoy con sabotaje propio reproducido en mi ronda anterior. Los 2 supervivientes que quedan (30:10, 39:32) son los mismos equivalentes genuinos de Ronda 1/2, re-verificados por coincidencia exacta de mutatorName+location+replacement contra mutation.json -- confirme yo misma con "git log --oneline -- src/lib/diseno/movimientoRespetuoso.ts" que el unico commit posterior a Ronda 2 (6ffd3b7) es el cambio de una linea del refuerzo, ya revisado por mi en la seccion anterior de este mismo documento.
- tokensColor.ts: PASS 188/188 (100.00%) sobre no-equivalentes, medido por mutation_tester de identidad_visual (id 22, done) sobre su version actual y ampliada (progress/mutation_identidad_visual.md, Ronda A: tokensColor.ts 184 killed + 4 timeout investigados como bucle infinito genuino en extraerBloqueDeVariante -- reproducido con watchdog externo, codigo de salida 124 -- + 5 equivalentes verificados uno a uno con prueba algebraica y script empirico). Confirme con "git log --oneline -3 -- src/lib/diseno/tokensColor.ts" y "git status --porcelain" que el fichero sigue exactamente en el commit 93bdf72 (Ronda A de identidad_visual), sin ningun cambio posterior sin remedir: no hace falta remedirlo de nuevo.
- inventarioModulos.ts: PASS 58/58 (100.00%), medido DOS VECES por mutation_tester de identidad_visual (antes y despues de su propio refuerzo de Ronda C), sin supervivientes en ninguna de las dos. Confirme con "git log --oneline -3 -- src/lib/diseno/inventarioModulos.ts" que el fichero esta en el commit 9cabe10 (Ronda C de identidad_visual), sin cambios posteriores sin remedir.

Los 6 modulos, ahora mismo, estan al 100% sobre mutantes no equivalentes. Ningun fichero pendiente de remedicion.

### 2. Los 34 escenarios de features/sistema_de_diseno_visual.feature, cobertura real y completa

26 escenarios jsdom (@s1-@s11, @s13-@s26, @s33): reconfirmados verdes hoy -- pnpm run test (dentro de bin/harness init) da 916/916, incluidos los 73 tests de los 6 modulos de src/lib/diseno/.

8 escenarios de navegador real (@s12, @s27-@s32, @s34): corri yo misma, de forma independiente (no herede el resultado de las bitacoras), "pnpm exec playwright test tests/e2e/accesibilidad.spec.ts" (14/14 passed) y "pnpm exec playwright test tests/e2e/tokens-aplicados.spec.ts tests/e2e/movimiento.spec.ts" (12/12 passed) -- 26/26 en total, sin fallos.

- @s27 (el hueco que encontre en mi revision anterior): lei el texto exacto del test nuevo en tests/e2e/accesibilidad.spec.ts:371-397 ("ningun elemento de la cabecera se desborda ni se superpone con otro, ni a 1024px ni a 1023px", dentro del mismo describe ya dedicado a @s27). Verifica exactamente la clausula 3 del Then que antes no verificaba nada: mide el boundingBox() de la cabecera y de sus hijos directos visibles a 1024px y a 1023px, comprueba estaContenidoEn (con una tolerancia de subpixel nombrada, TOLERANCIA_SUBPIXEL_PX = 0.5, no un numero magico suelto) y seSuperponen (interseccion de rectangulos AABB estandar) entre cada par de hijos. Corri el test yo misma: verde. La bitacora documenta 2 sabotajes reales (ancho fijo de 2000px, desplazamiento absoluto negativo) que confirman que el test SI detecta un desbordamiento real cuando lo hay -- no me fio solo de la narrativa: la logica de las funciones (estaContenidoEn, seSuperponen) es correcta por lectura directa (comparacion de rectangulos estandar, sin errores de signo ni de eje). Las 3 clausulas de @s27 estan ahora cubiertas.
- @s34 (la reconciliacion de texto): lei features/sistema_de_diseno_visual.feature:518-525. El Then ahora dice literalmente que la duracion de transicion se anula dentro de un bloque prefers-reduced-motion:reduce, y que "el techo real es 0.01ms (no 0 literal), a proposito, para que sigan disparandose los eventos transitionend/animationend que algo pueda estar esperando (ver src/styles/global.scss)". Coincide exactamente con el comportamiento real verificado en global.scss:241-243 y con lo que mide tests/e2e/movimiento.spec.ts (TECHO_MS_REDUCIDO, corri el test yo misma: verde). El texto ya no contradice la decision de diseno de identidad_visual; sigue afirmando algo medible (un techo concreto, no una vaguedad), tal y como exige docs/gherkin.md/CHECKPOINTS.md C6. La edicion es fiel al comportamiento real, no lo enmascara ni lo diluye -- sigue siendo una asercion dura y verificable, solo con el literal correcto.

Los 34/34 escenarios de sistema_de_diseno_visual.feature tienen ahora cobertura real y verde, jsdom y navegador real por igual.

### 3. bin/harness init, repetido de forma independiente

Primera corrida: 4 fallos en src/accesibilidad-teclado.test.tsx (@s26 de accesibilidad.feature, fuera del alcance de esta feature) -- mismo patron de inestabilidad de userEvent.tab() bajo contencion de CPU ya documentado repetidamente en este proyecto (citado tambien por identidad_visual y por mi propia revision de cierre anterior). Verificado en aislamiento (pnpm exec vitest run src/accesibilidad-teclado.test.tsx): 5/5 verde. Repeticion completa de bin/harness init: 916/916 verde, lint y typecheck limpios, "Entorno listo."

### 4. Hallazgos residuales

Ninguno bloqueante. Confirmado:

- "git status --porcelain -- src/lib/diseno/ tests/e2e/accesibilidad.spec.ts features/sistema_de_diseno_visual.feature" da exactamente los 4 ficheros esperados por el encargo de hoy (movimientoRespetuoso.ts, movimientoRespetuoso.test.ts, tests/e2e/accesibilidad.spec.ts, features/sistema_de_diseno_visual.feature), ya revisados en la seccion anterior de este documento ("Refuerzo final -- formas largas" y el propio refuerzo de @s27). Ningun cambio nuevo sin revisar.
- Los ficheros no relacionados con esta feature que aparecen en git status a nivel de repo (public/, src/documento-fuentes.test.ts, src/documento-iconos.test.ts, src/lib/diseno/inventarioActivosPublicos.ts/.test.ts, index.html, package.json, pnpm-lock.yaml, src/components/MetadatosPagina.tsx, src/styles/global.scss, src/styles/hoja-global.test.ts) pertenecen a identidad_visual (id 22, ya done) sin commitear -- fuera del alcance de esta revision, tal y como indica el encargo ("no re-audites identidad_visual").
- No queda ninguna nota de mi revision de cierre anterior sin resolver: los 3 puntos de "Cambios requeridos para poder aprobar el cierre de la 21" (mutacion pendiente, hueco de @s27, reconciliacion de @s34) estan cerrados, verificados uno a uno arriba.

### Checkpoints (esta revision)

- C1: [x] bin/harness init verde de punta a punta (916/916, lint/typecheck limpios), repetido por mi de forma independiente en esta ronda.
- C2: [x] sistema_de_diseno_visual (21) es la unica feature in_progress; accesibilidad (19) sigue blocked, identidad_visual (22) ya done.
- C3: [x] sin dependencias nuevas, sin literales de color/tamano fuera de tokens, sin cambios de produccion sin revisar (el unico cambio de produccion desde mi revision anterior es la linea 21 de movimientoRespetuoso.ts, ya aprobada en la seccion "Refuerzo final -- formas largas" de este mismo documento).
- C4: [x] los 6 modulos de src/lib/diseno/ mantienen test dedicado y pasan (73/73 en jsdom); los 8 escenarios de navegador real tienen su test dedicado en tests/e2e/ (26/26 verificado por mi).
- C5: no aplica (revision de cierre, no fin de sesion -- mismo criterio que mi revision anterior).
- C6: [x] los 34/34 @s de sistema_de_diseno_visual.feature tienen cobertura real: 26 en jsdom (bin/harness init) + 8 en navegador real (tests/e2e/, verificados por mi en esta ronda, incluida la clausula 3 de @s27 y el texto reconciliado de @s34).
- C7: [x] los 6 modulos puros de src/lib/diseno/ estan al 100% sobre mutantes no equivalentes: 4 remedidos hoy (escalaEspaciado.ts 1/1, escalaTipografica.ts 13/13, puntoDeCorte.ts 9/9, movimientoRespetuoso.ts 72/72) + 2 ya confirmados PASS por identidad_visual sobre su version actual (tokensColor.ts 188/188, inventarioModulos.ts 58/58), sin ningun cambio de produccion posterior sin remedir en ninguno de los 6 (confirmado con git log/git status por fichero).

### Veredicto final

APPROVED. sistema_de_diseno_visual (id 21) puede pasar a done. Los 34 escenarios del contrato estan cubiertos y verdes, los 6 modulos puros estan al 100% sobre mutantes no equivalentes, la disciplina TDD se mantiene intacta (ningun codigo de produccion sin test que lo exija, evidencia de ciclos Rojo->Verde en las 3 rondas de esta feature mas los 2 refuerzos puntuales de hoy), y bin/harness init termina verde de punta a punta, verificado de forma independiente por mi en esta misma ronda.
