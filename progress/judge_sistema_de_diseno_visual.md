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
