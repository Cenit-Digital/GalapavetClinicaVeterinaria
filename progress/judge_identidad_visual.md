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

---

## Ronda B

**Alcance revisado:** paso 6 (tipografia autoalojada: public/fuentes/ +
@font-face + index.html) y paso 8 (public/: los 26 huecos de imagen, el
logo, los tres iconos raster y la imagen de Open Graph) de
progress/plan_adaptacion_scss.md seccion 5, tal y como los cerro tdd_craftsman
en la seccion "RONDA B" de progress/tdd_identidad_visual.md. Escenarios que
esta ronda reclama como cubiertos: @s17, @s18, @s19. Los pasos 9, 10, 11 y 12
siguen fuera; identidad_visual sigue in_progress.

**Veredicto:** APPROVED

### Verificacion contra la REALIDAD del disco (no solo la bitacora)

- .woff2 de public/fuentes/: existen de verdad, con firma de fichero
  real wOF2 (no un stub, verificado leyendo los primeros bytes). ls -l da
  outfit-latin-wght-normal.woff2 = 32292 B y dm-sans-latin-wght-normal.woff2
  = 36932 B, suma 69224 B, recalculada por mi, digito a digito igual a la
  citada en la Decision 32 y al techo de @s22 (fuera de esta ronda, pero el
  numero ya esta fijado y no se ha inflado). Subconjunto latino confirmado
  leyendo el propio unicode-range declarado (global.scss:250,261, identico
  en las dos familias).
- No existe src/styles/_fuentes.scss (verificado con find): los 4
  @font-face viven en src/styles/global.scss, seccion E. Es exactamente la
  misma reconciliacion arquitectura-contra-contrato ya aprobada en la Ronda
  A (D-4): un ?raw sobre un @use a un parcial no devolveria las reglas y
  @s17/@s18 fallarian. No es un defecto, es la aplicacion consistente de
  una decision ya juzgada.
- global.scss seccion E: exactamente 4 @font-face (2 reales + 2 de
  respaldo), unicode-range presente en las 2 reales, grep -n "url(https:"
  y grep -n "@import url(" sobre el fichero dieron 0 coincidencias las dos
  (verificado yo mismo con grep), los 2 de respaldo con
  src: local(Arial), local(ArialMT) -- nunca una URL.
- index.html: exactamente 2 link rel=preload as=font, ambas con
  crossorigin y type=font/woff2 (verificado con grep), ninguna otra
  etiqueta de precarga. favicon.svg NO existe en public/ (test -f confirma
  su ausencia) y su link esta comentado en index.html:11 (fuera de
  textoActivo(), dentro de un comentario HTML).
- Rutas de imagen codigo-disco: muestreadas 13 rutas al azar entre
  src/data/blog.ts, src/data/campanas.ts, src/data/galeria.ts,
  src/data/tienda.ts, MetadatosPagina.tsx (IMAGEN_OPEN_GRAPH) y
  PieDePagina.tsx (SRC_LOGO) contra public/: 13/13 con fichero real
  correspondiente. Ademas corri pnpm exec vitest run
  src/lib/diseno/inventarioActivosPublicos.test.ts yo mismo: 19/19 verdes,
  que es la puerta que compara la totalidad de rutas declaradas contra el
  arbol real de public/.
- Favicon e iconos: favicon.ico contiene 3 streams (16x16, 32x32,
  48x48, verificado con ffprobe); favicon-32.png es 32x32 RGBA;
  apple-touch-icon.png mide EXACTAMENTE 180x180, pix_fmt=rgb24 (sin canal
  alfa, tal y como exige iOS) -- verificado leyendo yo mismo la cabecera
  IHDR del PNG con un script Node y cruzado con ffprobe, coinciden los dos
  metodos independientes.
- Imagen de Open Graph: public/img/og/galapavet.png -- PNG real
  (cabecera 89504e470d0a1a0a), 1200x630 EXACTOS, pix_fmt=rgb24 (sin alfa).
  Inspeccionada visualmente (herramienta Read sobre el propio fichero): es
  la composicion real -- el logo verificado de Galapavet sobre el morado de
  marca #77286B, texto Galapavet y el descriptor con localidad -- no una
  fotografia de banco. MetadatosPagina.tsx:23 la referencia con la
  extension .png correcta.
- Recuentos de alt vacio no rotos: corri yo mismo pnpm exec vitest run
  src/pages/PaginaTienda.test.tsx src/pages/PaginaBlog.test.tsx
  src/components/CampanasPortada.test.tsx src/components/Servicios.test.tsx
  src/components/Equipo.test.tsx -> 111/111 verdes, 5/5 ficheros, sin que
  esta ronda haya tocado ningun .module.scss ni ningun .tsx de componente
  (confirmado con git status --short, ninguna entrada de esos ficheros).
- Licencia y direccion de arte: progress/material_informe_descarga.md
  ya documenta la licencia de Pexels leida de la pagina oficial (uso
  comercial permitido, sin las 5 prohibiciones aplicables) para los 24
  huecos fotograficos. Verifique la coherencia hueco-familia inspeccionando
  dos muestras: campanas/vacunaciones.webp (familia A, clinica -- bata
  azul, sin mascarilla, coincide con la regla dura de la seccion 4.2 de
  plan_imagenes.md) y blog/demo-4.webp (familia C, laboratorio -- bodegon
  de tubos de muestra sobre fondo claro). Ademas cruce bytes: bruno.webp
  (22808 B), vacunaciones.webp (16958 B), demo-4.webp (23104 B) y
  galapavet.png (60580 B) en disco coinciden exactamente con los bytes que
  progress/material_MANIFIESTO.md registro al preparar el material,
  confirmando que la copia a public/ fue byte a byte, no una regeneracion.
- Puertas del arnes, ejecutadas por mi: pnpm run test -> 866/866 verdes,
  65 ficheros. pnpm run lint -> limpio. pnpm run typecheck -> limpio.
  pnpm run build -> limpio, con la puerta de terceros en verde (2
  archivo(s) de dist/ inspeccionados, ninguna referencia a un dominio de
  terceros). Repeti las comprobaciones sobre dist/ a mano: dist/fuentes/
  con los dos .woff2 (69224 B), dist/favicon.ico, dist/favicon-32.png,
  dist/apple-touch-icon.png, dist/img/ con 25 ficheros, grep -c
  font-family dist/assets/*.css -> 1 (una sola linea, CSS minificado --
  coincide con la bitacora, que usa el mismo -c), grep -o @font-face -> 4,
  grep -r fonts.googleapis o fonts.gstatic dist/ -> 0, grep -ril
  pexels dist/ -> 0. bin/harness init -> exit 0, lint+typecheck+866/866
  tests en verde. Puerta anti-terceros de la Ronda A sigue viva y en verde:
  nada de esta ronda anade una peticion externa en tiempo de ejecucion.
- feature_list.json: identidad_visual es la unica feature in_progress,
  consistente con C2.

### Sabotajes manuales propios

1. Fichero de fuente ausente. Renombre temporalmente
   public/fuentes/outfit-latin-wght-normal.woff2 (con copia de seguridad
   aparte) y corri inventarioActivosPublicos.test.ts: el test "ninguna ruta
   de fuente declarada carece de fichero real" fallo nombrando exactamente
   /fuentes/outfit-latin-wght-normal.woff2 en rutasFaltantes. Restaurado el
   fichero (mismo tamano, 32292 B, confirmado de nuevo con ls -l), 19/19
   verde otra vez.
2. URL de tercero inyectada en un @font-face real. Sustitui en
   src/styles/global.scss el src del @font-face de Outfit por una URL de
   fonts.gstatic.com (con copia de seguridad del fichero completo). pnpm
   exec vitest run src/styles/hoja-global.test.ts fallo exactamente en el
   test de @s17 "el origen de ambas es una ruta local que empieza por
   /fuentes/... nunca una URL de fonts.googleapis.com ni de
   fonts.gstatic.com". Restaurado el fichero byte a byte (confirmado con
   grep -n fonts.gstatic sin coincidencias tras restaurar), 32/32 verde
   de nuevo. git status --short tras los dos sabotajes no dejo ningun
   rastro fuera del diff legitimo de esta ronda.

### Disciplina TDD

- Produccion sin test que la pida? NO. Cada ciclo de la seccion RONDA B
  de progress/tdd_identidad_visual.md documenta rojo antes de verde: Ciclo
  2 (@s17, 6 it rojos antes de escribir los @font-face reales), Ciclo 3
  (@s18, 4 it rojos antes de los 2 respaldos), Ciclo 5
  (inventarioActivosPublicos.test.ts rojo por Failed to resolve import
  antes de que el modulo existiera), Ciclo 6 (el propio Ciclo 5 destapo
  /img/og/galapavet.webp como unica ruta faltante, y ESO forzo el cambio de
  extension en MetadatosPagina.tsx:23, no al reves), Ciclo 7 (@s19, 2/4 it
  rojos antes de las 2 precargas) y Ciclo 8 (iconos, 4/4 it rojos antes de
  tocar index.html). Verifique que la cuenta de tests cuadra: 822 (cierre
  Ronda A + refuerzo mutacion) + 44 nuevos = 866, y corri yo mismo la suite
  completa para confirmarlo.
- Evidencia de Rojo-Verde-Refactor? SI. Ademas de los rojos citados arriba,
  hay un refactor documentado y verificado (Ciclo 9: .sort() a .toSorted()
  en inventarioActivosPublicos.ts por regla de lint, con re-ejecucion del
  test correspondiente tras el cambio).
- Ningun .module.scss de componente fue tocado en esta ronda (verificado
  con git status --short), consistente con que el paso 10 sigue fuera de
  alcance y con que @s11 sigue PENDIENTE de forma honesta, sin forzarlo.

### Calidad

- src/lib/diseno/inventarioActivosPublicos.ts (66 lineas): modulo puro sin
  node:fs, funciones cortas de un solo motivo (extraerConPatron,
  extraerRutasDeImagenDeclaradas, extraerRutasDeFuenteDeclaradas,
  compararRutasDeclaradasConFicherosReales), sin numeros magicos
  (CERO_RUTAS nombrado), patron fail-closed consistente con
  ejecutarPuertaDeContraste y ejecutarPuertaDeTerceros ya aprobados en la
  Ronda A. Vive en src/lib/diseno/, coherente con docs/architecture.md.
- src/documento-fuentes.test.ts y src/documento-iconos.test.ts: mismo
  patron que src/documento.test.ts ya existente (?raw de index.html), sin
  duplicar logica de parseo, con comentario de cabecera que declara
  explicitamente que NO cubren (la comprobacion de red real, deferida al
  paso 9).
- src/components/MetadatosPagina.tsx: diff de una sola linea de valor mas
  comentario que cita @s29 y plan_imagenes.md; no toca nada mas del
  fichero.
- index.html: diff acotado y comentado con su porque (cita MDN sobre
  crossorigin, cita @s28 sobre el favicon vectorial pendiente); ninguna
  etiqueta sin justificar.
- package.json: las dos fuentes entran como devDependency, no como
  dependencia de produccion -- correcto, porque solo se usan para extraer
  los .woff2 verificados a public/; el runtime nunca importa el paquete.
- Ningun literal de color nuevo, ningun .module.scss tocado: el alcance se
  mantiene disciplinadamente dentro de fuentes + public/, sin fuga hacia el
  paso 10.
- Nota menor, no bloqueante: la bitacora describe el reparto interno de
  inventarioActivosPublicos.test.ts como 14 unitarios + 5 de integracion,
  pero el conteo real de bloques it es 15 unitarios (7+4+4) + 4 de
  integracion (2+2). El total, 19, coincide con el verde real que corri yo
  mismo -- es una imprecision de redaccion en la narrativa, no una brecha
  de cobertura.

### Checkpoints (CHECKPOINTS.md), evaluados sobre el estado actual del repo

- C1 (arnes completo): [x] bin/harness init termina exit 0 (ejecutado por
  mi).
- C2 (estado coherente): [x] identidad_visual es la unica feature
  in_progress en feature_list.json.
- C3 (arquitectura respetada): [x] modulo nuevo en src/lib/diseno/, sin
  capas no justificadas; sin TODOs sueltos ni logs de depuracion.
- C4 (verificacion real): [x] cada modulo nuevo tiene test dedicado; los
  tests leen texto real (?raw) o el arbol real de public/ y dist/, no mocks
  de sistema de ficheros -- confirmado con los dos sabotajes propios.
- C5 (cierre de sesion): [ ] no evaluado -- esta ronda no cierra la
  feature; identidad_visual sigue in_progress con los pasos 9-12 por
  delante (correcto para esta etapa).
- C6 (contrato Gherkin): [x] los tres escenarios que esta ronda reclama
  (@s17, @s18, @s19) tienen su mapa @s->test completo y verificado por mi
  contra el codigo real; los que no reclama (@s20-@s51 salvo la condicion
  de produccion de @s27-@s29) estan marcados como pendientes explicitos, no
  escondidos.
- C7 (mutacion): [ ] no aplica todavia a esta ronda -- corresponde al
  mutation_tester, despues de esta aprobacion.

### Cambios requeridos

Ninguno bloqueante para esta ronda. Para rondas futuras, quedan anotados (ya
reconocidos por la propia bitacora, no son hallazgos nuevos):

1. Los textoAlternativoImagen de 4 de las 6 fotos del blog no describen
   literalmente la foto finalmente elegida (documentado en
   progress/material_MANIFIESTO.md seccion 10.5 y reconocido en la seccion
   5 de la Ronda B de la bitacora). No bloquea esta ronda porque no lo
   exige ningun @sN de esta ronda, pero conviene resolverlo antes del paso
   10 o de publicar.
2. La automatizacion en navegador real de @s17-@s19 (familia computada,
   peso servido con 200, CLS del intercambio) y de @s27-@s34 (imagenes, red
   limpia, consola) sigue pendiente del paso 9 (Playwright). La condicion
   de produccion que esta ronda si puede verificar sin navegador (ficheros
   reales, rutas correctas, dimensiones correctas) queda cumplida y
   verificada por mi.

---

## Ronda de verificacion — REFUERZO MUTACION 1 (Ronda B)

**Veredicto:** APPROVED

Alcance de esta ronda: revision puntual del refuerzo minimo que `tdd_craftsman`
aplico tras el FAIL de `mutation_tester` sobre `src/lib/diseno/inventarioActivosPublicos.ts`
(1 superviviente real en la linea 18, regex `PATRON_RUTA_DE_IMAGEN` mutada de
`jpe?g` a `jpeg`). No repite la revision completa de la Ronda B ya aprobada
arriba; solo juzga el diff de este refuerzo puntual.

### 1. Produccion NO tocada

`git diff HEAD -- src/lib/diseno/inventarioActivosPublicos.ts` no produce
salida. Comprobado ademas que el fichero es enteramente nuevo respecto a
HEAD, con git show HEAD del fichero devolviendo "fatal: path ... exists on
disk, but not in HEAD": no hay commit previo contra el que diferenciar
dentro de este repo, porque toda la Ronda B sigue sin commitear. Por eso la
comprobacion real de "no tocado en ESTE refuerzo" no puede apoyarse en git
diff a secas y se hizo por lectura directa: lei el fichero completo (66
lineas) y coincide byte a byte con lo que la propia bitacora de mutacion
cita como "el texto ... leido linea a linea en esta sesion coincide
exactamente con el que analizo la medicion previa" (linea 18 con jpe?g,
ternario de pasa en la linea 61) -- ver progress/mutation_identidad_visual.md
lineas 788-792. tdd_craftsman afirma en progress/tdd_identidad_visual.md
lineas 1138-1139 que "Ningun fichero de src/ fuera de
inventarioActivosPublicos.test.ts fue tocado"; mi lectura directa del
fichero de produccion lo confirma de forma independiente, no por herencia.

### 2. Sabotaje propio (reproduccion del mutante real)

Hice mi propio sabotaje quirurgico, sin fiarme del ya documentado por
mutation_tester ni por tdd_craftsman:

1. Copie src/lib/diseno/inventarioActivosPublicos.ts a un fichero de
   respaldo en el scratchpad de sesion.
2. Edite la linea 18 con un script Node desechable, cambiando la regex real
   (que acepta jpg y jpeg via la alternancia jpe?g) a la version mutante
   que solo acepta jpeg (confirmado con lectura de la linea tras el
   cambio).
3. Corri npx vitest run src/lib/diseno/inventarioActivosPublicos.test.ts
   con el mutante activo: 20/21 verdes, 1 rojo -- exactamente el test
   "extrae una ruta /img/... con extension .jpg (sin e), la mitad corta de
   la alternancia jpe?g" (linea ~25 del test), con AssertionError:
   expected [] to deeply equal [ /img/galeria/ejemplo.jpg ]. El test
   companero de .jpeg (linea ~29) sigue en verde con el mutante activo, tal
   y como predice la propia bitacora del tdd_craftsman (lineas 1112-1115:
   "el segundo ... no distingue por si solo al mutante").
4. Restaure el fichero desde el respaldo y confirme con diff contra el
   respaldo que el resultado es identico ("IDENTICAL - no diff"), con sed
   mostrando de nuevo jpe?g en la linea 18, y con git status --short
   mostrando el fichero de nuevo como sin trackear (??) sin marca de
   modificacion residual.
5. Corri de nuevo la suite del fichero sin el mutante: 21/21 verdes.

Conclusion: el test nuevo mata realmente al mutante que mutation_tester
reporto como superviviente real; el test companero de .jpeg no lo mata
(esperado, documentado, no es el que carga con el peso de la mutacion). Sin
sabotaje, los 21 tests -- incluidos los 2 nuevos -- existen de verdad y
pasan (no es una afirmacion de la bitacora sin comprobar).

### 3. Calidad del refuerzo

- Los 2 tests nuevos (inventarioActivosPublicos.test.ts lineas 25-31)
  siguen el mismo patron y estilo que los 7 tests ya existentes del mismo
  describe('extraerRutasDeImagenDeclaradas', ...) (lineas 6-24): mismo
  formato de nombre descriptivo, mismo expect(...).toEqual([...]), sin
  literales magicos nuevos (las rutas de ejemplo son cadenas literales
  descriptivas, igual que en el resto del bloque), sin logica nueva
  duplicada -- son puramente datos de entrada distintos sobre la misma
  funcion publica ya cubierta.
- No hay produccion nueva: PATRON_RUTA_DE_IMAGEN no cambio, ninguna funcion
  nueva, ningun export nuevo.
- No hay fuga de alcance: el refuerzo no toca ningun otro fichero de src/,
  index.html, public/ ni package.json (confirmado con git status
  --porcelain antes y despues de mi propia verificacion: el set de
  ficheros modificados/sin trackear es el mismo que antes de esta ronda).

### 4. Verificacion agregada

- npx vitest run src/lib/diseno/inventarioActivosPublicos.test.ts (sin
  sabotaje): 21/21 verdes.
- npx vitest run (suite completa): 868/868 verdes, 65 ficheros -- coincide
  exactamente con lo que cita tdd_craftsman en
  progress/tdd_identidad_visual.md linea 1136 y con lo que remidio
  mutation_tester de forma independiente en
  progress/mutation_identidad_visual.md linea 827 ("868/868 verdes, 65
  ficheros").
- bin/harness init (bash, este equipo no tiene pwsh en PATH): verde de
  punta a punta -- entorno OK, ficheros base OK, feature_list.json valido,
  lint (oxlint --deny-warnings) sin errores, typecheck (tsc -b) sin
  errores, test 868/868 verdes.
- Nota de trazabilidad: progress/mutation_identidad_visual.md ya contiene
  una seccion "Ronda B" (posterior a la que documenta el FAIL original,
  conservada mas abajo como "Medicion previa de Ronda B") donde el propio
  mutation_tester remidio Stryker sobre este mismo refuerzo y reporto PASS
  (31/33 = 93.94% bruto, 100.00% excluyendo los 2 mutantes equivalentes ya
  verificados en la ronda anterior; el superviviente real de la linea 18
  ya no aparece). Esta ronda de judge no sustituye esa medicion de Stryker
  -- la reconozco como ya hecha e independientemente verificada por
  mutation_tester -- sino que verifica, con medios propios (sabotaje
  manual + ejecucion directa de vitest), que el comportamiento que Stryker
  mide efectivamente se sostiene, sin aceptar ninguna de las dos bitacoras
  por herencia.

### Checkpoints (CHECKPOINTS.md), reevaluados SOLO en lo que este refuerzo puntual afecta

- C1 (arnes completo): [x] bin/harness init termina en verde, ejecutado por
  mi en esta ronda.
- C2 (estado coherente): [x] identidad_visual sigue siendo la unica feature
  in_progress (sin cambios respecto a la Ronda B).
- C3 (arquitectura respetada): [x] el refuerzo no anade ningun modulo ni
  dependencia; el unico fichero tocado es un .test.ts en la misma capa que
  ya tenia sus tests.
- C4 (verificacion real): [x] reconfirmado con sabotaje manual propio
  (seccion 2 arriba) que el test nuevo distingue produccion real de
  produccion mutada, sin mocks.
- C5 (cierre de sesion): [ ] no aplica -- sigue sin corresponder a esta
  ronda puntual, identidad_visual continua in_progress con los pasos 9-12
  por delante (igual que en la Ronda B).
- C6 (contrato Gherkin): [x] este refuerzo no reclama ningun @sN nuevo --
  extraerRutasDeImagenDeclaradas ya estaba cubierta por @s27-@s29 desde la
  Ronda B (ver seccion "Cobertura de escenarios" arriba); es cobertura de
  MUTACION de una rama de regex, no cobertura de comportamiento nueva.
  Ningun escenario queda sin test.
- C7 (mutacion): [x] mutation_tester remidio Stryker sobre este mismo
  refuerzo y reporto PASS (100.00% s/no-equiv., ver
  progress/mutation_identidad_visual.md seccion "Ronda B", linea ~765).
  Verificado por mi de forma independiente en la seccion 2 arriba (el
  mutante real que causo el FAIL original ya no sobrevive).

### Cambios requeridos

Ninguno. Refuerzo minimo, quirurgico, sin tocar produccion, que mata el
unico superviviente real documentado por mutation_tester sin introducir
alcance nuevo ni deuda de calidad. Los pendientes de la Ronda B (pasos
9-12, alt-text de 4 fotos del blog) siguen anotados arriba y no son
competencia de este refuerzo puntual.

---

## Ronda C

**Alcance revisado:** pasos 9, 10, 11 y 12 de `progress/plan_adaptacion_scss.md`
S5 (infraestructura Playwright 1.62.1 + `@axe-core/playwright` 4.13.0 en
`tests/e2e/`, diseno fino de los 17 `.module.scss`, techo de bytes del CSS
servido, puerta `test:e2e` separada del arranque de sesion), tal y como los
cerro `tdd_craftsman` en la seccion "RONDA C" de
`progress/tdd_identidad_visual.md` (linea 1141 en adelante). Cubre los 34
escenarios que quedaban pendientes tras las Rondas A y B: @s11, @s16,
@s20-@s49 y @s50-@s51. Con esta ronda, los 51 escenarios de
`identidad_visual.feature` quedan con al menos un test concreto.

**Veredicto:** APPROVED

## Cobertura de escenarios (@s <-> test)

Verifiqué la tabla de trazabilidad de la sección 2 de la bitácora contra el
código real, abriendo los ficheros citados (no acepté la tabla por
herencia). Los 34 escenarios de esta ronda:

- @s11: [x] `src/lib/diseno/rolesDescartados.ts`/`.test.ts` — 7 tests, cubren
  las 5 aserciones del `Then` una a una (sin "urg"/"urgencia", sin
  "--color-acento" a secas, `--color-primario-fuerte` declarado Y usado,
  recuento > 0, falla cerrado con 0 ficheros), más 3 sabotajes sintéticos
  propios del `tdd_craftsman` dentro del propio fichero de test.
- @s16: [x] `src/lib/diseno/escalaMovimiento.ts`/`.test.ts` — literal a mano
  vs. la escala declarada, barrido de los 18 ficheros reales del inventario,
  detección de duración sintética fuera de escala con ruta/línea, detección
  de "all", falla cerrado con 0 ficheros.
- @s20-@s23 (tipografía en navegador real): [x] `tests/e2e/tipografia.spec.ts`.
  Reproducido por mí: 6/6 rutas en DM Sans/Outfit, 2 .woff2 <= 69224 B,
  alto de respaldo estable con fuentes bloqueadas.
- @s24-@s26 (tokens aplicados): [x] `tests/e2e/tokens-aplicados.spec.ts`.
  @s25 usa page.waitForFunction esperando el color computado FINAL de las
  dos propiedades a la vez (no data-variante ni un waitForTimeout a
  ciegas) — verificado leyendo el código, ver también hallazgo 5 más abajo.
- @s27-@s31 (imágenes/public/): [x] `tests/e2e/imagenes.spec.ts`. @s28
  confirma que el link del favicon vectorial sigue comentado
  (expect(html).toContain('<!-- <link rel="icon" ...')); @s30 documenta
  explícitamente por qué la cláusula "si existe" del encabezado queda vacía
  (Hero.tsx no declara img), en vez de simularla.
- @s32-@s34 (red limpia): [x] `tests/e2e/red-limpia.spec.ts`. El filtro del
  ruido de consola del mapa sandboxed está acotado por dominio
  (openstreetmap.org) y documentado como consecuencia correcta de
  sandbox="" (Invariante 3), no un silenciado ciego.
- @s35: [x] `src/lib/diseno/analisisAutomaticoAxe.ts`/`.test.ts` — literal a
  mano de las 5 etiquetas, confirma que accesibilidad.spec.ts usa
  withTags([...ETIQUETAS_AXE_ACUMULATIVAS]) y nunca .options(, y que
  wcag22aa (la única que trae target-size) está presente.
- @s36-@s41 (accesibilidad en navegador real): [x]
  `tests/e2e/accesibilidad.spec.ts`. @s39 mide el color REALMENTE pintado
  con elementFromPoint subiendo por ancestros (no
  getComputedStyle(control).backgroundColor, que con outline-offset
  siempre da el color del propio control, no el de al lado) — documentado
  como corrección de diseño de la propia prueba. @s40 excluye los controles
  con closest('header') no nulo de la comprobación de "tapado por la
  cabecera", con justificación correcta (la cabecera no puede taparse a sí
  misma). El punto de corte 1024/1023 heredado se verifica en un describe
  propio sin @sN dedicado, tal y como declara la tabla.
- @s42-@s43 (movimiento): [x] `tests/e2e/movimiento.spec.ts`. Compara
  transitionDuration NUMÉRICAMENTE (el navegador serializa 0.01ms como
  1e-05s) en vez de por texto — detalle correcto y nada trivial.
- @s44-@s47 (layout): [x] `tests/e2e/layout.spec.ts`. Ver hallazgos y
  sabotajes propios más abajo.
- @s48: [x] `src/lib/diseno/puertaNavegadorReal.test.ts` — lee el TEXTO REAL
  de package.json/harness.config.json/playwright.config.ts, nunca
  importa los símbolos que comprueba; confirma que harness.config.json
  commands.test sigue siendo exactamente "pnpm run test".
- @s49: [x] `tests/e2e/css-presupuesto.spec.ts`. Verifiqué el número a mano
  (5791 B) directamente contra el servidor real (ver sección de comandos
  abajo): coincide byte a byte.
- @s50: [x] `src/lib/diseno/escenariosHeredados.ts`/`.test.ts` — literal a
  mano de los 12 identificadores, comprobación con frontera de palabra
  (@s2 no se confunde con @s27/@s25), falla cerrado con lista vacía.
- @s51: [x] `src/lib/diseno/inventarioModulos.ts`/`.test.ts` (ampliado) —
  comprobarInventarioCompleto es el complemento correcto de
  comprobarCoLocalizacion (antes solo comprobaba inventario->ficheros; ahora
  también ficheros->inventario), con test de "componente inventado" y de
  MetadatosPagina fuera del inventario.

Ningún @s de esta ronda queda sin test. Los @s1-@s10, @s12-@s15, @s17-@s19 no
son objeto de esta ronda (ya aprobados en Rondas A/B) y no los repito.

## Verificación independiente contra la REALIDAD (no solo la bitácora)

- bin/harness init (ejecutado por mí, dos veces, una al inicio y otra
  al final tras revertir mis propios sabotajes): verde de punta a punta,
  902/902 tests, 70 ficheros (no 76 como afirma la bitácora en su
  sección 7 — recuento propio con find src -name "*.test.ts" -o -name
  "*.test.tsx" | wc -l da 70; ver nota no bloqueante más abajo).
- pnpm run build (ejecutado por mí, varias veces): éxito, CSS
  48.41 kB / gzip 5.84 kB, JS 280.29 kB / gzip 88.45 kB, puerta de
  terceros en verde — cifras idénticas a las que cita la bitácora en su
  sección 7.
- pnpm exec playwright test (ejecutado por mí, de forma independiente):
  65/65 verdes, 8 ficheros, sin .only/.skip, coincide con la
  afirmación de la bitácora.
- Verificación byte a byte del techo de CSS (@s49): levanté yo mismo
  vite preview en un puerto aparte, pedí la hoja de la portada con
  Accept-Encoding: gzip y medí el cuerpo con wc -c: 5791 bytes
  exactos, coincidiendo dígito a dígito con el número que la bitácora dice
  haber medido y que css-presupuesto.spec.ts declara como origen del techo
  de 8000 B.
- Derivaciones del PENDIENTE 3 y 4 del contrato (radio/borde/altura de
  control/ancho de contenedor, sección 4 de la bitácora): abrí
  src/styles/_api.scss línea a línea. radio-pequeno/-medio/-grande son
  literalmente espaciado(4)/espaciado(12)/espaciado(24) (valores YA
  existentes de escala-espaciado, no números nuevos);
  ancho-borde-fino/-control son espaciado(4)/4 y x1.5 de eso mismo;
  altura-control-pequena/-media/-grande son area-tactil-minima +
  espaciado(16|24|32) = 40/48/56px; ancho-maximo-contenedor: 1024px es
  literalmente el valor de PUNTO_DE_CORTE_NAVEGACION_PX
  (src/components/Cabecera-logica.ts:10, confirmado con grep). Ninguna
  cifra está inventada ni copiada del prototipo heredado.
- .oxlintrc.json y .gitignore: diffs confirmados exactamente como
  los describe la bitácora (override de tests/e2e/** con las 2 reglas
  citadas; entradas de test-results/, playwright-report/, blob-report/).
- playwright.config.ts/tsconfig.e2e.json: confirmado que usan
  import ... from 'playwright/test' (no @playwright/test, que no está
  instalado — package.json solo trae playwright@1.62.1), retries: 0,
  webServer.command construye y sirve dist/ con vite preview --port
  4173 --strictPort, nunca el dev server.
- git status: limpio de artefactos de Playwright (test-results/ no
  aparece pese a haber corrido la suite varias veces), consistente con el
  .gitignore nuevo.

## Sabotajes manuales propios (no repetidos de la bitácora, revertidos después)

Reproduje 2 de los 5 "hallazgos reales" de la sección 5 de la bitácora con
mi propio sabotaje, sin fiarme de la narrativa:

1. Bug del titular de una sola palabra (@s44, hallazgo 3). Quité la
   línea "overflow-wrap: break-word;" de la regla de encabezados de
   src/styles/global.scss (línea 171), reconstruí (pnpm run build) y
   corrí "pnpm exec playwright test tests/e2e/layout.spec.ts -g Ficha de
   campaña": rojo exacto — scrollWidth 333 vs clientWidth 320
   (Expected: <= 320, Received: 333), el mismo par de cifras que ya
   documentaba la bitácora. Revertido con la copia de seguridad; diff
   confirmó fichero idéntico al original; reconstruí de nuevo y el test
   volvió a verde con el hash de CSS original (index-CDvoeGa7.css).
2. Bug de Flexbox de la galería (@s44, hallazgo 1). Sustituí
   ".galeria { display: grid; grid-template-columns: auto 1fr auto; ... }"
   por el "display: flex; flex-direction: column; align-items: center;
   flex-wrap: wrap;" que la propia bitácora cita como el estado ORIGINAL
   defectuoso (src/components/Galeria.module.scss), reconstruí y corrí
   "pnpm exec playwright test tests/e2e/layout.spec.ts -g Landing":
   rojo exacto — elemento culpable "P" con borde derecho en 1544px,
   la MISMA cifra (dígito a dígito) que la bitácora cita como medida en vivo
   el 23/08/2026. Revertido con copia de seguridad, diff confirmó
   idéntico; reconstruido, vuelto a verde, suite completa de
   layout.spec.ts 10/10.
   - Nota honesta sobre un sabotaje mío que NO reprodujo nada: antes de este
     segundo sabotaje probé a quitar solo ".pista { min-width: 0; }"
     manteniendo el resto en grid — el test siguió en verde. Leyendo
     la especificación de CSS Sizing (tamaño mínimo automático de un ítem de
     rejilla/flex: si overflow no es visible en el eje relevante, el
     mínimo automático ya es 0), esto es coherente con que
     "overflow-x: auto" en .pista probablemente ya fuerza ese mínimo a 0
     en Chromium 151 por sí solo — la declaración explícita puede ser
     defensiva/redundante más que estrictamente necesaria hoy. No es un
     defecto del producto (el CSS final es correcto y la declaración
     explícita es una práctica razonable de robustez entre navegadores),
     pero sí matiza ligeramente la frase de la bitácora "sin esto la columna
     1fr crecía hasta caber la pista entera" — lo verifiqué activamente en
     lugar de asumirla, y el sabotaje que sí reproduce el bug real (el punto
     2 de arriba, sobre .galeria) confirma que el rediseño a rejilla en su
     conjunto sí es necesario y sí corrige el defecto medido.

Ambos ficheros (global.scss, Galeria.module.scss) quedaron confirmados
idénticos a su estado antes de mi intervención (diff sin salida) tras
revertir, y pnpm run build volvió a producir el mismo hash de CSS
(index-CDvoeGa7.css) que antes de sabotear.

## Disciplina TDD

- ¿Producción sin test que la pida? Encontré un caso concreto y citable:
  tests/e2e/utilidades.ts:43-55 exporta completamenteDentroDe y
  seSolapan (con su interfaz RectanguloBase), pero ningún fichero del
  repositorio los importa ni los llama — confirmé con
  "grep -rn completamenteDentroDe|seSolapan" sobre todo el repo: la única
  coincidencia es su propia declaración. noUnusedLocals/noUnusedParameters
  de tsconfig.e2e.json no los detecta porque están exportados (superficie
  pública, no variable local). El propio comentario de seSolapan dice "para
  al menos parte queda fuera/dentro" — exactamente lo que @s40 necesita —
  pero accesibilidad.spec.ts (líneas 295-299) reimplementa esa misma lógica
  en línea (integramenteBajoLaCabecera) en vez de usar la utilidad
  compartida ya escrita para ese propósito. Es código muerto real, no solo
  "bajo cobertura": nace de una extracción especulativa (para reutilizar
  entre los .spec.ts) de la que solo colorComputadoAHex y
  esTransparente acabaron adoptándose. No afecta a ningún @s (ninguno
  depende de estas dos funciones) y vive en infraestructura de test, no en
  dist/, así que no lo considero bloqueante para esta ronda — lo listo
  como cambio requerido, no como motivo de rechazo. El resto de la producción
  de esta ronda (los 5 módulos nuevos de src/lib/diseno/, los 17
  .module.scss, las 3 escalas y 9 mixins de _api.scss) la contrasté
  contra su test correspondiente y no encontré más código sin test que lo
  exija.
- ¿Evidencia de Rojo->Verde->Refactor? SÍ. La sección 1 de la bitácora
  documenta el orden real (paso 12 antes que 9, con justificación), y la
  sección 5 documenta 5 ciclos rojo->verde con cifras medidas en vivo (no
  supuestas) — 2 de los 5 los reproduje yo mismo de forma independiente (ver
  arriba) con resultados coincidentes dígito a dígito.

## Calidad

- tests/e2e/accesibilidad.spec.ts: el fichero más grande y más delicado de
  la ronda. Las 2 "correcciones de diseño de la propia prueba" (@s39 con
  elementFromPoint, @s40 excluyendo closest('header')) están razonadas y
  verificadas contra el comportamiento real, no ajustadas a ciegas para que
  el test pase. Único hallazgo: la duplicación de lógica geométrica con
  tests/e2e/utilidades.ts señalada arriba.
- src/styles/_api.scss: sección E/F nuevas bien separadas de la sección
  B/C/D ya aprobada en Ronda A; cada paso de radio/borde/altura tiene su
  comentario de derivación citando la escala de origen — sin números
  mágicos. Los 9 mixins de componente son la única fuente de estilo
  compartido; confirmé con grep -n "height:" sobre los 17 .module.scss
  reales que ninguna tarjeta declara una altura fija en píxeles fuera del
  propio mixin (solo height: 100% y alturas de icono/chip no relacionadas
  con tarjetas).
- tests/e2e/imagenes.spec.ts, layout.spec.ts, movimiento.spec.ts,
  red-limpia.spec.ts: funciones cortas, nombres reveladores en español
  consistentes con el resto del repo, comentarios que explican el por qué
  (p. ej. por qué se fuerza loading="eager" para medir CLS, por qué se
  compara transitionDuration numéricamente y no por texto).
- src/lib/diseno/rolesDescartados.ts, escalaMovimiento.ts,
  analisisAutomaticoAxe.ts, escenariosHeredados.ts: mismo patrón ya
  aprobado en Rondas A/B (interfaz de informe + función pura + literal a
  mano en el test, patrón doble-de-test-anclado-al-literal), sin
  duplicación apreciable entre ellos.
- Arquitectura respetada: tests/e2e/ vive fuera de src/ a propósito
  (nunca lo muerde StrykerJS, stryker.config.json solo cubre src/lib/**
  y src/**/*-logica.ts) — mismo criterio ya usado para tools/. Ningún
  módulo puro nuevo importa Playwright ni axe-core (analisisAutomaticoAxe.ts
  solo declara el catálogo de etiquetas, confirmado leyendo el fichero
  completo).

## Checkpoints (CHECKPOINTS.md), evaluados sobre el estado actual del repo

- C1 (arnés completo): [x] bin/harness init termina exit 0, ejecutado por
  mí dos veces (antes y después de mis sabotajes).
- C2 (estado coherente): [x] identidad_visual sigue siendo la única
  feature in_progress en feature_list.json.
- C3 (arquitectura respetada): [x] sin logs de depuración ni TODOs sin
  contexto en los ficheros nuevos (grep confirmado); tests/e2e/ fuera de
  src/, coherente con docs/architecture.md y con el glob de mutación.
- C4 (verificación real): [x] cada módulo puro nuevo tiene test dedicado que
  lee texto real o ejecuta contra el navegador real; ninguno usa mocks de
  sistema de ficheros. Confirmado con 2 sabotajes manuales propios que
  reproducen exactamente las cifras que la bitácora afirma haber medido.
- C5 (cierre de sesión): [ ] no evaluado — esta ronda no cierra la feature
  ni la sesión; corresponde a mutation_tester a continuación y luego al
  craftsman_lead para el cierre completo (incluye el PENDIENTE 7,
  og:image relativo, explícitamente fuera de mi alcance en este encargo).
- C6 (contrato Gherkin): [x] los 34 escenarios de esta ronda tienen su mapa
  @s -> test completo y verificado por mí contra el código real; ninguno
  queda sin test. Con las Rondas A y B ya aprobadas, los 51 escenarios de
  identidad_visual.feature quedan cubiertos.
- C7 (mutación): [ ] no aplica todavía — corresponde al mutation_tester
  tras esta aprobación.

## Cambios requeridos

Ninguno bloqueante para esta ronda. Para la siguiente pasada (no impide
avanzar a mutation_tester):

1. (menor, no bloqueante) tests/e2e/utilidades.ts:43-55 —
   completamenteDentroDe y seSolapan están exportadas pero no las llama
   ningún test de tests/e2e/*.spec.ts (confirmado con grep sobre todo el
   repo). O se eliminan, o se cablean donde ya existe lógica duplicada
   equivalente (accesibilidad.spec.ts:295-299, el cálculo de
   integramenteBajoLaCabecera de @s40 es funcionalmente lo mismo que
   completamenteDentroDe).
2. (cosmético, no bloqueante) progress/tdd_identidad_visual.md sección
   7 afirma "902/902 verdes, 76 ficheros"; el recuento real (find src -name
   "*.test.ts" -o -name "*.test.tsx" | wc -l, y confirmado por la propia
   salida de pnpm run test) es 70 ficheros, no 76. El número de tests
   (902) es correcto y coincide con lo que corrí yo mismo dos veces. Mismo
   tipo de imprecisión de redacción ya señalada como no bloqueante en la
   Ronda B (sección "Nota menor").
3. La nota que ya hace la propia bitácora sobre ".pista { min-width: 0; }"
   ("sin esto la columna 1fr crecía hasta caber la pista entera") merece
   matizarse: mi sabotaje aislado de esa única declaración no reprodujo el
   defecto (ver sección de sabotajes arriba) — probablemente porque
   overflow-x: auto ya fija el mínimo automático a 0 en Chromium. No
   afecta al veredicto: el rediseño completo a display: grid sí es
   necesario y sí corrige el bug real, verificado por mí de forma
   independiente.

---

## Refuerzo mutación Ronda C

**Alcance revisado:** el refuerzo puntual que `tdd_craftsman` aplico tras el
**FAIL** de `mutation_tester` sobre la Ronda C (`progress/mutation_identidad_visual.md`
seccion "Ronda C": 183/214 = 85.51% bruto, 89.71% s/no-equiv., 21 mutantes
supervivientes reales en 3 ficheros -- `rolesDescartados.ts` 7,
`escalaMovimiento.ts` 10, `escenariosHeredados.ts` 4). Bitacora del refuerzo:
`progress/tdd_identidad_visual.md` seccion "Refuerzo mutacion Ronda C" (ultima
seccion del fichero). No repito la revision completa de la Ronda C ya
aprobada arriba (veredicto APPROVED); solo juzgo el diff de este refuerzo
puntual: 12 tests nuevos en 3 .test.ts, cero produccion tocada.

**Veredicto:** APPROVED

### 1. Produccion NO tocada -- verificado con hash, no por herencia

Lei los tres ficheros de produccion completos y calcule sha256sum yo
mismo, sin aceptar los prefijos que cita la bitacora sin comprobarlos:

24343da7c80c7d2de81bf7e38670fe3494ed662266ee7bde8274aaf8448ece58  src/lib/diseno/rolesDescartados.ts
8a480da65bbb8d065a6e9eb027e38dff73f3741ad687830820fc398e64bc6442  src/lib/diseno/escalaMovimiento.ts
e5836fdf996912d5d8497451f2707d309422b86126a2f82bc31539c474ae43a4  src/lib/diseno/escenariosHeredados.ts

Coinciden digito a digito con los prefijos citados en
progress/tdd_identidad_visual.md (24343da7..., 8a480da6..., e5836fdf...).
git status --porcelain sobre los tres: los tres siguen "??" (sin trackear),
ninguno con marca "M" -- consistente con que toda la Ronda C sigue sin
commitear y con que este refuerzo no dejo ningun cambio de produccion.
Ademas compare linea a linea el contenido de los tres ficheros contra las
citas literales (numero de linea + expresion) de progress/mutation_identidad_visual.md
seccion "Ronda C": rolesDescartados.ts:33 (PATRON_PRIMARIO_FUERTE_DECLARADO),
:51 (guarda todos.length === CERO_FICHEROS), :63 (.some(...)), :69
(pasa: A && B && C && D); escalaMovimiento.ts:56 (PATRON_LINEA_DE_MOVIMIENTO),
:60 (PATRON_PALABRA_CLAVE_ALL), :76 (guardian de analizarFichero),
:98 (guarda de 0 ficheros); escenariosHeredados.ts:50-51 (guarda) y :57
(pasa: A && B) -- byte a byte iguales a como las analizo mutation_tester,
mismos numeros de linea, mismas expresiones exactas.

### 2. Trazabilidad de los 21 mutantes reales -- comprobada uno a uno, no solo citada

Recorri los 21 supervivientes reales de progress/mutation_identidad_visual.md
seccion "Ronda C" y los cruce contra la tabla de progress/tdd_identidad_visual.md
seccion "Refuerzo mutacion Ronda C":

- rolesDescartados.ts (7/7): id 27 (.some -> .every, linea 63) equivale al
  test "con resultados MIXTOS..."; ids 35-39 (los 5 mutantes de
  pasa: A&&B&&C&&D, linea 69) equivalen al unico test "urgencia declarada Y
  primario-fuerte declarado y usado a la vez..."; id 8 (\s* -> \S* antes de
  ":", linea 33) equivale al test "declarado con un espacio antes de los dos
  puntos". Repeti yo mismo el algebra de los 5 mutantes de la linea 69
  contra los valores reales del test (A=false, B=true, C=true, D=true ->
  original pasa=false; los 5 mutantes dan true cada uno) y confirme con mi
  propio sabotaje (ver seccion 4) que el mecanismo es real, no solo
  teorico.
- escalaMovimiento.ts (10/10): ids 34-35 (guardian de analizarFichero,
  linea 76) equivalen al test "-delay... queda fuera del analisis"; ids
  56-57 (campos no comprobados en "0 ficheros", linea 98) equivalen a las 2
  aserciones anadidas al test existente; ids 4 y 9
  (PATRON_LINEA_DE_MOVIMIENTO, linea 56) equivalen a los tests
  "comentario..." y "espacio antes de los dos puntos"; ids 17, 18, 20, 21
  (PATRON_PALABRA_CLAVE_ALL, linea 60) equivalen a los 4 tests de "all"
  (espacio antes de los dos puntos / pegado a los dos puntos / lista sin
  espacio / lista con espacio). Verifique por mi cuenta, leyendo la regex
  real (src/lib/diseno/escalaMovimiento.ts:60), que los dos tests de la
  alternativa B (,\s*all\b) realmente distinguen los ids 20 y 21 entre si
  (uno depende de 0 espacios tras la coma, el otro de 1) -- ver tambien la
  nota tecnica en la seccion 3.
- escenariosHeredados.ts (4/4): el mutante de noCitados: [] en la guarda
  (linea 51) equivale a la asercion anadida al test existente "con la lista
  de declarados vacia"; los 3 mutantes de pasa: A && B (linea 57) equivalen
  a los 2 tests nuevos "con menos de doce identificadores..." (A=true,
  B=false) y "con exactamente doce... uno inventado" (A=false, B=true).
  Repeti el algebra yo mismo: el mutante LogicalOperator (A&&B -> A OR B)
  muere con cualquiera de los dos tests; el mutante A->true (deja pasa=B)
  solo muere con el segundo test (A=false, B=true: original false, mutante
  true); el mutante B->true (deja pasa=A) solo muere con el primero
  (A=true, B=false: original false, mutante true) -- los dos tests juntos
  matan los 3, ninguno por separado. Coincide exactamente con la afirmacion
  de la bitacora.

Ningun mutante de los 21 queda sin un test que lo apunte. 7+10+4=21, cuadra
con el total del informe de mutacion.

### 3. Nota tecnica de la alternativa B de PATRON_PALABRA_CLAVE_ALL -- verificada, no aceptada por su palabra

Confirme por lectura directa de src/lib/diseno/escalaMovimiento.ts:56
(PATRON_LINEA_DE_MOVIMIENTO = /^\s*(?:animation|transition)(?:-duration)?\s*:/)
que el ejemplo que sugeria el informe de mutacion
("transition-property: color, all;") en efecto no pasa el guardian real:
tras (?:animation|transition), la unica continuacion valida antes del ":"
obligatorio es (?:-duration)? (opcional) -- "-property" no coincide con
"-duration", asi que el grupo opcional se salta y el patron exige ":"
inmediatamente (salvo espacios), pero el siguiente caracter real es "-"
(de "-property"); la busqueda anclada falla. Confirme el resultado
razonando sobre la gramatica de la regex, coherente con lo que el propio
tdd_craftsman dice haber comprobado con script antes de escribir el test.
Lei los dos tests que realmente escribio (escalaMovimiento.test.ts:137-157,
"transition: color 150ms,all 300ms;" y "transition: color 150ms, all 300ms;")
y confirme que ambos SI pasan el guardian ("transition:" sin sufijo,
coincide directamente) y SI alcanzan la alternativa B a traves de la lista
separada por comas del valor. Hice mi propio sabotaje sobre esta linea
concreta (ver seccion 4) para no quedarme solo con el razonamiento.

### 4. Sabotajes manuales propios

Reproduje 1 de los 6 sabotajes que el tdd_craftsman documenta
(rolesDescartados.ts:33, id 8, para confirmar que el mecanismo narrado es
real) y anadi 1 sabotaje propio sobre un mutante DISTINTO de los 6 ya
documentados, tal y como exige el encargo:

1. Reproduccion, rolesDescartados.ts:33 (id 8): cambie
   PATRON_PRIMARIO_FUERTE_DECLARADO de \s* a \S* antes de los dos puntos
   con sed, corri rolesDescartados.test.ts con el mutante activo: 1 test
   rojo exacto ("--color-primario-fuerte declarado con un espacio antes de
   los dos puntos sigue contando como declarado", expected false to be
   true), los demas siguieron verdes. Revertido; sha256sum identico al
   original.
2. Sabotaje propio, rolesDescartados.ts:69, mutante id 38 (LogicalOperator,
   A&&B -> A OR B, deja pasa = (A OR B) && C && D) -- NO esta entre los 6
   que el tdd_craftsman dice haber verificado a mano (esos son ids 27, 39,
   8, 34-35, 20, y el de la linea 51/57 de escenariosHeredados.ts). Apliqué
   el cambio con sed sobre el fichero real (linea 69: "=== CERO_FICHEROS &&"
   -> "=== CERO_FICHEROS ||"), corri
   "pnpm exec vitest run src/lib/diseno/rolesDescartados.test.ts": 3 tests
   rojos ("con 0 ficheros la puerta falla cerrada", "'--color-primario-fuerte'
   declarado pero nunca usado hace fallar la puerta", y el test disenado
   exactamente para este grupo de mutantes, "urgencia declarada Y
   primario-fuerte declarado y usado a la vez hace fallar la puerta" ->
   AssertionError: expected true to be false), 8 verdes. Reverti el
   fichero desde una copia de respaldo (scratchpad de sesion); sha256sum
   tras revertir: 24343da7c80c7d2de81bf7e38670fe3494ed662266ee7bde8274aaf8448ece58,
   identico al original; git status --porcelain volvio a mostrar el
   fichero como "??" sin marca de modificacion residual. Re-ejecute
   rolesDescartados.test.ts sin el mutante: 11/11 verde de nuevo.

Los dos sabotajes mordieron exactamente donde debian, con el mensaje de
error correcto, y ninguno dejo rastro tras revertir.

### 5. Calidad del refuerzo

- Lei los 3 .test.ts completos (rolesDescartados.test.ts,
  escalaMovimiento.test.ts, escenariosHeredados.test.ts). Los 12 tests
  nuevos siguen el mismo estilo que el resto de cada fichero: nombres
  descriptivos en espanol que citan el caso exacto, sin literales magicos
  sin explicar, sin logica nueva duplicada -- son datos de entrada
  distintos sobre funciones publicas ya cubiertas por @s11/@s16/@s50.
- No hay produccion nueva: ninguna funcion, export ni regex cambiada; solo
  se anadieron bloques it(...) y 2 aserciones (escalaMovimiento.test.ts
  lineas 65-66, escenariosHeredados.test.ts en el test de lista vacia).
- Sin fuga de alcance: git status --porcelain no muestra ningun otro
  fichero de src/ afectado por este refuerzo puntual (los M/?? de otros
  ficheros del arbol pertenecen a trabajo previo de la Ronda C, ya juzgado
  arriba, no a este refuerzo).

### 6. Verificacion agregada, ejecutada por mi de forma independiente

- pnpm exec vitest run src/lib/diseno/rolesDescartados.test.ts (sin
  sabotaje, tras revertir): 11/11 verde.
- pnpm run test (suite completa): primera corrida, 4 fallos confinados a
  src/accesibilidad-teclado.test.tsx (la misma inestabilidad de
  userEvent.tab() bajo contencion de maquina ya documentada por
  tdd_craftsman/judge en rondas anteriores de esta misma feature -- ese
  fichero es de la feature 19, ya done, y esta ronda no lo toca).
  Confirmado en aislamiento: pnpm exec vitest run
  src/accesibilidad-teclado.test.tsx -> 5/5 verde. Repetida la suite
  completa: 914/914 verdes, 70 ficheros, dos veces seguidas.
- bash bin/harness init: verde de punta a punta -- entorno OK, lint
  (oxlint --deny-warnings) sin errores, typecheck (tsc -b) sin errores,
  914/914 tests.

### Checkpoints (CHECKPOINTS.md), reevaluados SOLO en lo que este refuerzo puntual afecta

- C1 (arnes completo): [x] bin/harness init termina exit 0, ejecutado por
  mi en esta ronda.
- C2 (estado coherente): [x] identidad_visual sigue siendo la unica feature
  in_progress.
- C3 (arquitectura respetada): [x] el refuerzo no anade ningun modulo ni
  dependencia; los unicos ficheros tocados son los 3 .test.ts ya existentes
  en la misma capa.
- C4 (verificacion real): [x] reconfirmado con 2 sabotajes manuales propios
  (uno reproducido, uno sobre un mutante distinto de los 6 ya documentados)
  que los tests nuevos distinguen produccion real de produccion mutada, sin
  mocks.
- C5 (cierre de sesion): [ ] no aplica -- sigue sin corresponder a este
  refuerzo puntual; identidad_visual continua in_progress.
- C6 (contrato Gherkin): [x] este refuerzo no reclama ningun @sN nuevo --
  @s11/@s16/@s50 ya estaban cubiertos desde la Ronda C; es cobertura de
  MUTACION, no comportamiento nuevo. Ningun escenario queda sin test.
- C7 (mutacion): [ ] no aplica todavia a este veredicto -- corresponde a una
  nueva medicion de mutation_tester sobre estos mismos 3 ficheros, despues
  de esta aprobacion.

### Cambios requeridos

Ninguno. Refuerzo minimo y quirurgico: 12 tests nuevos que matan, uno a
uno, los 21 mutantes reales que mutation_tester reporto en la Ronda C, sin
tocar produccion (hash identico, confirmado por mi) y sin introducir
alcance nuevo. Queda pendiente la remedicion de mutation_tester sobre
rolesDescartados.ts, escalaMovimiento.ts y escenariosHeredados.ts.
