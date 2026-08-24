# Review — feature 22 (identidad_visual)

## Ronda A

**Alcance revisado:** pasos 1, 2, 3, 4, 5 y 7 de `progress/plan_adaptacion_scss.md`
seccion 5 "ORDEN DE EJECUCION", tal y como los cerro `tdd_craftsman` en
`progress/tdd_identidad_visual.md`. Los pasos 6, 8, 9, 10, 11 y 12 (fuentes
autoalojadas, `public/`+imagenes, Playwright/e2e, maquetacion fina de los 17
`.module.scss`, techo de bytes de CSS, puerta de navegador separada) quedan
explicitamente fuera de esta ronda y de este veredicto: `identidad_visual`
sigue `in_progress`, con mas rondas por delante.

**Veredicto:** APPROVED

## Cobertura de escenarios (@s <-> test), alcance de esta ronda

- @s1 (inventario de 17 tokens): [x] `src/lib/diseno/tokensColor.test.ts` -
  describe `identidad_visual @s1 ...`. Verificado contra el codigo real:
  `INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR` se construye desde
  `ROLES_DE_COLOR`(15)/`ROLES_DE_SOMBRA`(2), no puede desincronizarse en
  silencio del resto del modulo.
- @s2 (68 pares, sin herencia): [x] `tokensColor.test.ts` - describe
  `identidad_visual @s2 ...`, `comprobarInventarioDeTokens` sobre el texto real
  de `_tokens.scss` da `paresComprobados: 68`, `faltantes: []`. Confirmado
  con sabotaje propio (ver mas abajo) que un token ausente en una sola
  variante hace fallar la comprobacion nombrando el par variante/token, no se
  hereda en silencio.
- @s3 (12 roles nuevos de "marca"): [x] `tokensColor.test.ts` - describe
  `identidad_visual @s3 ...`. Los 12 hexadecimales verificados uno a uno contra
  el texto real de `_tokens.scss` y recalculados de forma independiente por
  mi (ver seccion "Verificacion matematica independiente").
- @s4 (mezcla en sRGB, las 8 de "marca"): [x] `src/lib/diseno/mezclaDeColor.test.ts`
  - describe `@s4 ...`. Recalcule las 8 mezclas con mi propio script Node
  (formula base*(1-p) + otro*p, redondeo estandar): las 8 coinciden digito
  a digito.
- @s5 (matriz de uso de "marca" alcanza su minimo WCAG): [x] `tokensColor.test.ts`
  - describe `identidad_visual @s5 ...`. Recalcule los 9 ratios con mi propia
  implementacion de la formula WCAG (independiente de `contraste.ts`): los 9
  valores (12.84, 11.23, 7.99, 5.50, 4.81, 8.53, 9.13, 5.27, 4.97) coinciden
  digito a digito con el `.feature` y con el test.
- @s6 (borde de control >=3:1 contra fondo/fondo-alterno): [x] `tokensColor.test.ts`
  - describe `identidad_visual @s6 ...`. Recalculado por mi: 4.23 y 3.70 en
  "marca"; extendi el calculo yo mismo a las 4 variantes (lima 3.97/3.74,
  verde 4.13/3.90, noche 5.60/5.16): las 4 pasan el umbral 3, aunque solo
  "marca" tiene asercion automatizada explicita en este momento.
- @s7 (borde decorativo nunca identifica un control): [x] `tokensColor.test.ts`
  - describe `identidad_visual @s7 ...`. Ratio 1.56 recalculado, y
  `MATRIZ_DE_USO_MARCA` confirmado sin ninguna fila con rol "borde".
- @s8 (hover del primario mejora el contraste): [x] `tokensColor.test.ts` -
  describe `identidad_visual @s8 ...`. 9.13 a 10.26 recalculado y confirmado
  estrictamente creciente.
- @s9 (en "noche" el morado no es texto/borde/foco): [x] `tokensColor.test.ts`
  - describe `identidad_visual @s9 ...`. Ratio 2.30 recalculado (< 3), y
  confirme que ningun rol de texto/tinta/borde-control/foco de "noche" vale
  #77286B.
- @s10 (matriz vacia falla cerrada): [x] `tokensColor.test.ts` - describe
  `identidad_visual @s10 ...`, sobre `ejecutarPuertaDeContraste([])` de
  `contraste.ts` (ya `done`, reutilizada sin tocar).
- @s11 (roles descartados no entran por ninguna puerta): [ ] PENDIENTE,
  declarado explicitamente como tal en la trazabilidad de la bitacora, con
  razon tecnica solida: la mitad del escenario (que "--color-primario-fuerte"
  se use al menos una vez en un fichero de estilos real) exige tocar un
  `.module.scss` de componente, que es el paso 10 del plan - fuera del
  alcance que el propio `craftsman_lead` asigno a esta ronda (pasos 1,2,3,4,5,7).
  No es una omision escondida: esta nombrado en la tabla de trazabilidad de
  `progress/tdd_identidad_visual.md` seccion 3 con su motivo. No bloquea esta
  ronda porque la feature permanece `in_progress` y el propio plan asigna
  explicitamente esa mitad del trabajo a una ronda posterior (paso 10).
- @s12 (existe `global.scss`, importado una vez): [x] `src/styles/hoja-global.test.ts`
  - describe `@s12 ...`, tres tests reales contra el texto de `main.tsx` y de
  todos los modulos de `src/`, mas la prohibicion de reglas de documento en
  `.module.scss`. No vacuo: confirma mas de 0 modulos inspeccionados antes de
  afirmar 0 infractores.
- @s13 (9 familias del reset): [x] `hoja-global.test.ts` - describe `@s13 ...`
  y `src/lib/diseno/hojaGlobal.test.ts` - describe `@s13 ...`. `FAMILIAS_DEL_RESET`
  es un literal de 9 entradas con su declaracion testigo; `comprobarFamiliasDelReset`
  falla cerrado con un inventario vacio.
- @s14 (scroll-padding-top deriva de --altura-cabecera): [x] `hoja-global.test.ts`
  - describe `@s14 ...`. Confirmado contra el codigo real: `global.scss` declara
  `scroll-padding-top: calc(var(--altura-cabecera) + espaciado(16))` y
  `Cabecera.module.scss` declara `min-height: var(--altura-cabecera)` - la
  MISMA variable, ninguna duplicada a mano. El test compara el nombre de
  variable extraido de uno contra el extraido del otro, no solo su presencia.
- @s15 (scroll-behavior opt-in, reduce con 0.01ms): [x] `hoja-global.test.ts`
  - describe `@s15 ...`, apoyado en el campo `ancestros` de `extraerReglas`
  (`hojaGlobal.test.ts` - describe `@s15 cada regla conoce los bloques que la
  contienen`). Sabotaje propio confirmo que cambiar 0.01ms a 0ms rompe el
  test exacto (ver abajo).
- @s16-@s51 (resto del contrato): [ ] Explicitamente fuera de esta ronda, sin
  ninguna pretension de estar cubiertos. No hay ningun @font-face en
  `global.scss` (confirmado leyendo el fichero: `--fuente-texto` sigue en
  system-ui, sans-serif, marcado PROVISIONAL), no hay Playwright instalado,
  no hay `public/` con imagenes. @s17/@s18/@s24 (completo, salvo la condicion
  de produccion)/@s25/@s33(propio de esta feature)/etc. NO estan cubiertos
  por ningun test de esta ronda y el `tdd_craftsman` no pretende que lo
  esten - estan correctamente marcados "FUERA de esta ronda" en la tabla de
  trazabilidad de `progress/tdd_identidad_visual.md` seccion 3. La condicion
  de produccion de @s24 (body con margin 0 en el CSS servido) SI esta presente
  en el codigo (`global.scss`, familia 2 del reset, cubierta por @s13) y
  medida manualmente contra `dist/`, pero su automatizacion en navegador real
  (Playwright, 6 rutas) queda pendiente del paso 9, tal y como la propia
  bitacora documenta sin ambiguedad.

  Nota sobre el encargo recibido para esta revision: la lista de escenarios
  que se me pidio comprobar (aprox @s1-@s15, @s17, @s18, @s24, @s25, la fraccion
  global de @s33...) no coincide exactamente con lo que los pasos 1,2,3,4,5,7
  del plan realmente producen. @s17/@s18 (tipografia autoalojada) pertenecen
  al paso 6, explicitamente fuera de esta ronda; @s24/@s25 completos
  requieren navegador real (paso 9); "la fraccion global de @s33" se refiere
  al @s33 de `sistema_de_diseno_visual.feature` (movimiento respetuoso,
  ya `done`), no al @s33 de `identidad_visual.feature` (que es un escenario
  distinto, sobre codigos de error HTTP) - y esa fraccion SI esta cubierta:
  `src/styles/movimiento-global.test.ts` amplia `ejecutarPuertaDeMovimientoRespetuoso`
  a las 3 hojas globales nuevas. Dejo esta discrepancia anotada explicitamente
  en vez de forzar una lectura que el propio contrato no sostiene.

## Verificacion matematica independiente (no me fio del numero que cita la bitacora)

Reimplemente la formula de contraste WCAG (luminancia relativa, gamma sRGB) y
la formula de mezcla (base*(1-p) + otro*p, redondeo estandar) en un script
Node desechable, y las aplique directamente a los valores REALES de
`src/styles/_tokens.scss`, sin copiar ningun numero de la bitacora:

- Las 8 mezclas de @s4 (marca) y las 13 mezclas adicionales de
  lima/verde/noche (fondo, fondo-alterno, tinta, primario-fuerte, acento-suave,
  borde-control, borde, y las 4 propias de "noche" con sus polos invertidos)
  coinciden digito a digito con los 21 hexadecimales declarados en
  `_tokens.scss`.
- Los ratios de contraste de las 4 variantes (tinta/fondo, tinta/fondo-alterno,
  texto/fondo-alterno, texto-suave/fondo, texto-suave/fondo-alterno,
  texto/superficie-elevada, sobre-primario/primario, sobre-primario/primario-fuerte,
  acento-tinta/acento-suave, acento-tinta/fondo-alterno, borde-control/fondo,
  borde-control/fondo-alterno, borde/fondo, foco/fondo) coinciden con los
  comentarios del propio `_tokens.scss` y, en el caso de "marca", con los 13
  valores que el `.feature` clava a mano en @s5-@s9. Las 4 variantes
  alcanzan el minimo de 4.5:1 en todos los pares de texto y 3:1 en
  borde-control contra sus dos fondos - verificado por mi para las 4, no solo
  para "marca" (que es la unica con asercion automatizada de matriz completa
  en este momento; lima/verde/noche tienen cobertura parcial via
  `leerTokenDeVariante` + tests puntuales, pero su matriz de uso completa
  queda como PENDIENTE 1 del propio contrato, correctamente anotado como tal).
- El `--color-borde` decorativo de las 4 variantes queda consistentemente por
  debajo de 3:1 (1.56/1.47/1.22/1.47), confirmando que la exencion de @s7 es
  real y no un truco de "marca" unicamente.

Ningun hexadecimal ni ratio de `_tokens.scss` esta inventado o mal derivado.

## Disciplina TDD

- Produccion sin test que la pida? NO detectado. Revise
  `src/lib/diseno/hojaGlobal.ts`, `tokensColor.ts`, `mezclaDeColor.ts`,
  `puertaTerceros.ts`, `tools/puerta-terceros.ts`, `src/styles/_tokens.scss`,
  `_api.scss`, `global.scss` linea a linea contra sus tests correspondientes;
  cada funcion publica tiene cobertura directa. `tools/puerta-terceros.ts`
  (el "humilde" que cablea node:fs) no tiene test propio, consistente con
  el patron ya aceptado en el repo para `src/main.tsx` (excluido de cobertura
  en `vite.config.ts` -> `coverage.exclude`) - la logica de decision vive en
  el modulo puro `puertaTerceros.ts`, que si esta testeado.
- Evidencia de Rojo->Verde->Refactor? SI. `progress/tdd_identidad_visual.md`
  documenta 6 ciclos con su rojo verificado (mensajes de error reales
  citados, no supuestos), su verde minimo, y su refactor cuando aplica.
  Encontre consistencia entre lo narrado y el codigo real en todos los
  ficheros que inspeccione.

## Calidad

- `src/styles/_tokens.scss`: solo custom properties CSS, cero
  @function/@mixin (confirmado leyendo el fichero completo y con
  `src/styles/tokens-api.test.ts`, que ademas fallo como se esperaba cuando
  yo mismo sabotee el literal - ver abajo). Comentario por token con su
  derivacion y ratio: buena trazabilidad, sin numeros magicos sin
  justificar.
- `src/styles/_api.scss`: solo funciones/mixins de Sass, cero CSS propio
  (confirmado).
- `vite.config.ts:37`: additionalData es el literal exacto '@use "api" as *;'
  con salto de linea, no compuesto via variable (confirmado y sometido a
  sabotaje propio).
- `src/components/Cabecera.module.scss:13`: `min-height: var(--altura-cabecera)`
  - consume la misma variable que `global.scss` sin duplicar el numero.
- `src/styles/global.scss`: secciones rotuladas A-D, cada regla del reset
  justificada por comentario con su defecto medido. `:focus-visible` real
  (outline 2px solid var(--color-foco), outline-offset 2px), nunca
  outline none. Patron de movimiento correcto: el bloque
  no-preference CONTIENE scroll-behavior smooth y la transition del
  body (opt-in), nunca al reves; el bloque reduce solo anula duraciones
  con 0.01ms (no 0ms), sin !important ni declarar-y-revocar.
- `tools/puerta-terceros.ts` enganchado SOLO a `package.json` ->
  `scripts.build` (tsc -b && vite build && node ... tools/puerta-terceros.ts);
  `scripts.dev` sigue siendo "vite" sin la puerta - confirmado leyendo
  `package.json` linea a linea.
- Ningun literal de color (hex, rgb/rgba, hsl/hsla, ni nombres CSS comunes)
  fuera de `_tokens.scss` en ninguno de los 17 `.module.scss` del proyecto -
  confirmado con grep exhaustivo, 0 resultados.
- Nombres reveladores en espanol consistentes con el resto del repo
  (`leerTokenDeVariante`, `comprobarInventarioDeTokens`,
  `ejecutarPuertaDeTerceros`...), funciones cortas con un solo motivo de
  cambio, sin duplicacion apreciable (`leerTokenDelBloque` extraido en el
  Ciclo 2 evita duplicar la regex entre `leerTokenDeVariante` y
  `leerTokenDeRaizSinAtributo`).
- Arquitectura respetada: `src/lib/diseno/` para modulos puros,
  `src/styles/` para SCSS, `tools/` para el script de infraestructura con su
  propio tsconfig include, sin capas nuevas no justificadas.

## Comandos ejecutados por mi, de forma independiente, ahora mismo

- `pnpm run typecheck` -> limpio (exit 0).
- `pnpm run lint` -> limpio, oxlint --deny-warnings (exit 0).
- `pnpm run test` -> 796/796 verdes, 62 ficheros (ejecutado varias veces; en
  corridas con alta contencion de la maquina -hasta 28 procesos node.exe
  simultaneos detectados con tasklist, de otras sesiones, no de esta
  revision- aparecieron entre 1 y 5 fallos SIEMPRE confinados a
  `src/accesibilidad-teclado.test.tsx` (timeouts de userEvent.tab()), un
  fichero que esta ronda NO toca (feature 19, ya done) y que pasa 5/5 en
  aislamiento. Es exactamente la misma inestabilidad, con la misma causa
  raiz, que la propia bitacora ya documenta de forma transparente en su
  seccion 1 y 3. Con la maquina en reposo (2 procesos node.exe), la corrida
  es 796/796 estable, confirmada dos veces, la ultima via `bin/harness init`).
- `pnpm run build` -> exito, `dist/assets/index-DYgsknih.css` generado, la
  puerta de terceros se ejecuta al final y pasa: "Puerta de terceros: 2
  archivo(s) de dist/ inspeccionados, ninguna referencia a un dominio de
  terceros."
- `bin/harness init` (via `bash bin/harness`) -> verde de punta a punta:
  entorno OK, ficheros base OK, `feature_list.json` valido, lint sin
  errores, 796/796 tests.

## Sabotajes manuales propios (nuevos, no repetidos de la bitacora), revertidos despues

1. `src/styles/global.scss`: cambie `animation-duration: 0.01ms` /
   `transition-duration: 0.01ms` (dentro de @media prefers-reduced-motion
   reduce) a 0ms. Resultado: `hoja-global.test.ts` -> 1 test rojo exacto
   (expected 'animation-duration: 0ms' to contain '0.01ms'), los otros 14
   de ese fichero siguieron verdes. Revertido byte a byte; vuelto a 15/15
   verde.
2. `src/styles/_tokens.scss`: borre la linea `--color-borde: #D7E0D7;`
   del bloque `:root[data-variante='verde']`. Resultado: `tokensColor.test.ts`
   -> 1 test rojo exacto en `identidad_visual @s2 ...`
   (faltantes: variante verde, token --color-borde), 37/38
   siguieron verdes. Revertido; vuelto a 38/38 verde.
3. `vite.config.ts`: cambie el additionalData de literal de comilla simple
   con \n escapado por una forma equivalente en tiempo de ejecucion pero NO
   literal como texto exacto (comilla simple con backslash-n cambiada a
   backtick con salto de linea real). Resultado: `tokens-api.test.ts` -> 1
   test rojo exacto sobre la comprobacion de literalidad, 6/7 siguieron
   verdes. Revertido; vuelto a 7/7 verde.

Los tres sabotajes mordieron exactamente donde debian, con el mensaje de
error correcto, y ninguno dejo rastro tras revertir (git status/git diff
--stat confirmados limpios frente al estado de partida de esta ronda).

## Checkpoints (CHECKPOINTS.md), evaluados sobre el estado actual del repo

- C1 (arnes completo): [x] `bin/harness init` termina exit 0.
- C2 (estado coherente): [x] `identidad_visual` es la unica feature
  in_progress en `feature_list.json`; no hay basura de sesiones anteriores
  apreciable en el alcance revisado.
- C3 (arquitectura respetada): [x] modulos nuevos en `src/lib/diseno/` y
  `src/styles/`, sin capas no justificadas; sin TODOs sueltos ni logs de
  debug en el codigo de produccion de esta ronda.
- C4 (verificacion real): [x] cada modulo nuevo tiene test dedicado; los
  tests leen texto real (?raw) o CSS real de dist/, no mocks de sistema
  de ficheros.
- C5 (cierre de sesion): [ ] no evaluado - esta ronda no cierra la
  feature ni la sesion completa; `identidad_visual` sigue in_progress con
  mas pasos por delante (correcto para esta etapa).
- C6 (contrato Gherkin): [x] parcial y correctamente delimitado - los
  escenarios que esta ronda reclama como cubiertos (@s1-@s10, @s12-@s15)
  tienen su mapa @s -> test completo en `progress/tdd_identidad_visual.md`
  seccion 3, y ninguno de los que reclama esta sin test. Los que NO reclama
  (@s11, @s16-@s51) estan explicitamente marcados como pendientes, no
  escondidos.
- C7 (mutacion): [ ] no aplica todavia a esta ronda - corresponde al
  `mutation_tester`, despues de esta aprobacion.

## Cambios requeridos

Ninguno bloqueante para esta ronda. Para rondas futuras, quedan anotados
(ya reconocidos por la propia bitacora, no son hallazgos nuevos):

1. @s11 requiere tocar un `.module.scss` real (paso 10) para poder
   comprobar que `--color-primario-fuerte` se usa; retomarlo en esa ronda.
2. La matriz de uso completa de lima/verde/noche (equivalente a
   `MATRIZ_DE_USO_MARCA`) no tiene todavia una puerta de contraste
   automatizada propia - hoy solo tiene cobertura puntual
   (`leerTokenDeVariante` + tests dirigidos) y mi verificacion manual
   independiente. No bloquea esta ronda (el propio contrato lo deja como
   PENDIENTE 1, asignado al `tdd_craftsman` "con la misma puerta de
   contraste de @s5"), pero conviene cerrarlo antes de dar la feature por
   terminada.
