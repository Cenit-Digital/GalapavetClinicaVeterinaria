# TDD — lote `datos-reales` (@s49, @s50, @s51, @s52 de `features/rediseno_visual.feature`)

Feature: `rediseno_visual` (id 24, `in_progress`). Bloque G del contrato,
«LOS DATOS SIGUEN SIENDO LOS REALES».

## 0. Ámbito de ficheros (cerrado)

| Fichero | Estado |
| --- | --- |
| `src/lib/diseno/datosDelSitio.ts` | NUEVO |
| `src/lib/diseno/datosDelSitio.test.ts` | NUEVO |
| `src/components/Hero-logica.test.ts` | modificado (se le añaden 3 pruebas; el 1.º test existente se conserva intacto) |
| `src/components/Hero-logica.ts` | **NO tocado** — la derivación ya existía y ninguna prueba roja pidió cambiarla |
| `tests/e2e/datos-reales.spec.ts` | NUEVO |

Nada fuera de esa lista se ha modificado. `src/lib/site.ts`, `src/data/*.ts` y
todos los `.tsx` siguen byte a byte como estaban (`git status` lo confirma:
`src/components/Hero.tsx` sin diff tras los sabotajes).

---

## 1. Mediciones previas (hechas, no supuestas)

Todas sobre el TEXTO REAL de `docs/diseno-claude-design/*.dc.html` y de
`src/data/*.ts`.

| Dato | Medición | Cómo se midió |
| --- | --- | --- |
| Ficheros del prototipo | 4 (`Veterinaria La Sierra.dc.html`, `Blog`, `Campanas`, `Tienda`) | `ls docs/diseno-claude-design` |
| `SERVICIOS` del prototipo | **12** | conteo de entradas del array real en el `<script data-dc-script>` |
| `EQUIPO` del prototipo | **6** | ídem |
| `GALERIA` del prototipo | **9** | ídem |
| Pista de vista previa `servicios` | **6** | `hint-placeholder-count="6"` de `<sc-for list="{{ servicios }}">` |
| Pista de vista previa `equipo` | **6** | ídem |
| Pista de vista previa `galeria` | **5** | ídem |
| `SERVICIOS` real | **5** | `src/data/servicios.ts` |
| `EQUIPO` real | **2** | `src/data/equipo.ts` |
| `GALERIA` real | **6** | `src/data/galeria.ts` — el plan hablaba de 7; **7 era el número de `nombre:` del fichero, y uno de ellos es el de la `interface`**. La medición corrigió el literal escrito a mano en el test (ver ciclo 11). |
| `datosNegocio.horario` | **3** tramos | `src/lib/site.ts` |
| Literales ficticios presentes en el prototipo | 5/5 | `grep -o` sobre los 4 `.dc.html` |
| Frases prohibidas presentes en el prototipo | `24 h` ×14, `24 horas` ×1, `todos los días del año` ×1, `los 365` ×2 | `grep -o -i` |
| Ficheros de `src` (sin tests) que barre la puerta de @s49 | **100** | contador del propio informe |

**Hallazgo clave para @s50:** «la pista de vista previa del editor de diseño»
es, literalmente, el atributo `hint-placeholder-count` que Claude Design deja
en cada `<sc-for>` para rellenar la vista previa cuando aún no hay datos
(`docs/diseno-claude-design/support.js` lo parsea junto a `$preview`). Vale
6 / 6 / 5 y **no coincide** con ninguno de los tres recuentos publicados
(5 / 2 / 6). Esa es la cláusula que la matriz daba por no mordida.

---

## 2. Ciclos Rojo → Verde → Refactor

Se corrieron con `pnpm exec vitest run <fichero>`. Mensaje de fallo LITERAL en
cada rojo.

| # | @s | ROJO (mensaje literal) | VERDE (cambio mínimo) |
| --- | --- | --- | --- |
| 1 | @s49 | `Error: Failed to resolve import "./datosDelSitio" from "src/lib/diseno/datosDelSitio.test.ts". Does the file exist?` | Se crea el módulo con `ejecutarPuertaDeLiteralesFicticios` (búsqueda literal + `pasa`). |
| 2 | @s49 | `AssertionError: expected true to be false` (`datosDelSitio.test.ts:23`) | `formasDeBusqueda`: además del literal, su forma sin espacios (`918 44 21 60` → `918442160`). |
| 3 | @s49 | `AssertionError: expected [] to deeply equal [ { …(3) } ]` | Búsqueda insensible a la caja, con **dos `toLowerCase()` separados** (uno por lado) para que el mutante `toUpperCase()` no sea equivalente. |
| 4 | @s49 | `AssertionError: expected undefined to be 3` (`ficherosInspeccionados`) | Contadores `ficherosInspeccionados`, `literalesBuscados`, `formasBuscadas`. |
| 5 | @s49 | `AssertionError: expected true to be false` (lista de ficheros vacía) | Fallo cerrado por 0 ficheros y por 0 literales, con `motivo` que **nombra el contador** y nunca dice «no se encontró». |
| 6 | @s49 | `AssertionError: expected undefined to deeply equal [ { …(2) }, …(4) ]` | Catálogo de los 5 datos ficticios + prueba anti-espantapájaros contra el texto real del prototipo. |
| 7 | @s49 | `AssertionError: expected [ …(8) ] to deeply equal []` — el barrido real de `src/` encontró los literales **en el propio módulo** y en `src/lib/diseno/fidelidadPrototipo.ts:4` | (a) El catálogo se saca de `src/` y se escribe A MANO en el test (Given de @s49; además, un catálogo dentro de `src/` contamina el barrido sobre `src/`). (b) Tercer parámetro `citasPermitidas`: se retira del texto la RUTA del prototipo versionado antes de buscar, sustituyéndola por un HUECO (no por la cadena vacía, para no soldar los trozos vecinos). |
| 8 | @s50 | `TypeError: contarEntradasDelCatalogoDelPrototipo is not a function` | Conteo de entradas de un catálogo del prototipo sobre su texto real. |
| 9 | @s50 | (sin rojo: refuerzo de la implementación del ciclo 8) — verificado por sabotaje `CIERRE_DE_CATALOGO -> ''` → `AssertionError: expected +0 to be 12` | — |
| 10 | @s50 | `TypeError: leerPistaDeVistaPrevia is not a function` | Lectura de `hint-placeholder-count` de la etiqueta `<sc-for>` del listado pedido. |
| 11 | @s50 | `TypeError: ejecutarPuertaDeRecuentosReales is not a function`, y después `AssertionError: expected [ 5, 2, 6 ] to deeply equal [ 5, 2, 7 ]` | Puerta de recuentos (`discrepancias` con `procedencia`, contador, fallo cerrado). El segundo rojo **corrigió el literal escrito a mano**: la galería real tiene 6 entradas, no 7. |
| 12 | @s50 | (sin rojo: refuerzo) — verificado por sabotajes F, M18, M32bis, M35, M39 | — |
| 13 | @s51 | (sin rojo: la derivación ya existía; la matriz señalaba que faltaba la ASERCIÓN) — verificado por sabotaje H | Prueba con los catálogos REALES + doble anclado `[5, 2, 6, 3]`. |
| 14 | @s51 | (sin rojo) — verificado por sabotaje H | Fixture de sabotaje: se añade una entrada a CADA una de las 4 fuentes y solo cambia su cifra; contador `[0,1,2,3]`. |
| 15 | @s51 | `TypeError: extraerFragmento is not a function` | `digitosDe` y `extraerFragmento` (ambos fallan cerrado devolviendo `null` si falta una marca). |
| 16 | @s51 | (sin rojo: refuerzo) — verificado por sabotajes G, M13, M14, M15 | — |
| 17 | @s52 | `TypeError: ejecutarPuertaDeAfirmacionesProhibidas is not a function` | Puerta de afirmaciones prohibidas sobre el texto visible de cada ruta. |
| 18 | @s52 | (sin rojo: refuerzo) — verificado por sabotajes J, M20, M21, M50, M51, M55 | — |
| 19 | @s52 | `TypeError: cualificadorDeclaradoDe is not a function` (5 pruebas rojas), y después `AssertionError: expected [ 'todos los días del año', …(1) ] to deeply equal [ 'todos los días del año' ]` | `cualificadorDeclaradoDe` (deriva «fuera de horario» del rótulo REAL de `src/lib/site.ts`), `compromisosDeUrgenciasEn` y `ejecutarPuertaDeCompromisoDeUrgencias`. El segundo rojo documentó que dos cualificadores del catálogo casan con la misma frase, y así se afirma. |

**REFACTOR final (en verde):** el módulo se reordena en cuatro secciones
contiguas rotuladas `@s49 / @s50 / @s51 / @s52`. Tests, lint y typecheck
vuelven a correr después: 36 verdes, 0 y 0.

### Ciclos que no tuvieron rojo, y por qué

Los ciclos 9, 12, 13, 14, 16 y 18 no produjeron un rojo de compilación ni de
aserción: son las **cláusulas que la matriz declaraba "sin morder" sobre código
que YA existía** (la derivación de `Hero-logica.ts`) o refuerzos de una
implementación que el ciclo anterior escribió de una pieza. `docs/tdd.md` dice
que un test que pasa a la primera no demuestra nada: por eso **cada uno de
ellos se ha verificado rompiendo a propósito el fichero o el dato que vigila**
(sección 4). Ninguno de esos ciclos añadió código de producción.

---

## 3. Mapa cláusula → aserción

### @s49 — Ni un solo literal de la clínica ficticia sobrevive

| Cláusula | Aserción |
| --- | --- |
| *Given* el texto real de todos los ficheros de "src" | `datosDelSitio.test.ts:40-43` (glob `?raw` de `/src/**/*.{ts,tsx,scss}` sin tests) → `datosDelSitio.test.ts:242` |
| *Given* …y el contenido del artefacto de producción | `tests/e2e/datos-reales.spec.ts:94-102` (`dist/**/*.{html,css,js}` leído con `node:fs`) → `datos-reales.spec.ts:117`; y el HTML servido de las 6 rutas → `datos-reales.spec.ts:145` |
| *And* un literal escrito a mano | `datosDelSitio.test.ts:55-61` y, retipeado a mano por segunda vez, `datos-reales.spec.ts:46-52`. Que no sean espantapájaros: `datosDelSitio.test.ts:230` y `datos-reales.spec.ts:136` (los 5 aparecen de verdad en el prototipo) |
| *Then* no aparece el nombre comercial | Categoría `nombre comercial` del catálogo → `datosDelSitio.test.ts:246-248` (`hallazgos` = `[]`) y `datos-reales.spec.ts:125` |
| *And* no aparece su localidad | Categoría `localidad` → mismas aserciones |
| *And* no aparece ninguno de sus teléfonos | Categorías `teléfono` ×2, **cada una con dos formas** (con y sin espacios) → `formasBuscadas` = 9 en `datosDelSitio.test.ts:255` y `datos-reales.spec.ts:132` |
| *And* no aparece su dirección de correo electrónico | Categoría `correo electrónico` → mismas aserciones |
| *And* el recuento de ficheros inspeccionados > 0 | `datosDelSitio.test.ts:250` (`> 0`) + suelo anti-vacuidad `> 90` en `:253`; `datos-reales.spec.ts:129`; fallo cerrado en `datosDelSitio.test.ts:154` y `:168` |

### @s50 — Los recuentos son los reales

| Cláusula | Aserción |
| --- | --- |
| *Given* el sitio construido y servido | `datos-reales.spec.ts:166-169` y `:193-196` (`vite preview` bajo el subpath real) |
| *When* se cuentan los elementos de cada listado | `datos-reales.spec.ts:171-173` (`#servicios article`, `#equipo article`, `#galeria figure`) |
| *Then* bloques de servicio = catálogo real, no los doce | `datos-reales.spec.ts:176` (`= SERVICIOS.length`) y `:183` (`≠ 12`); el 12 se mide contra el prototipo real en `datosDelSitio.test.ts:265-274` |
| *And* profesionales = listado real, no los seis | `datos-reales.spec.ts:177` y `:184`; el 6 medido en `datosDelSitio.test.ts:272` |
| *And* fotografías = catálogo real, no las nueve | `datos-reales.spec.ts:178` y `:185`; el 9 medido en `datosDelSitio.test.ts:273` |
| *And* ningún recuento tomado de la pista de vista previa del editor | `datos-reales.spec.ts:193-229` → `ejecutarPuertaDeRecuentosReales` con `deLaPistaDeVistaPrevia` LEÍDO del `hint-placeholder-count` real; `discrepancias` = `[]`, `listadosInspeccionados` = 3. Lógica y su rojo: `datosDelSitio.test.ts:299`, `:320`, `:332`, `:356`, `:373` |

### @s51 — Las cuatro cifras se derivan de la fuente única

| Cláusula | Aserción |
| --- | --- |
| *Given* el catálogo de servicios y la fuente única | `Hero-logica.test.ts:34-49` importa `SERVICIOS`, `EQUIPO`, `GALERIA` y `datosNegocio.horario` REALES |
| *When* se construye el modelo de la banda | `Hero-logica.test.ts:35` |
| *Then* cada cifra se calcula a partir de esos datos | `Hero-logica.test.ts:37-42` (por longitud de cada fuente) + doble anclado `[5, 2, 6, 3]` en `:48` |
| *And* cambiar un dato en la fuente única cambia la cifra | `Hero-logica.test.ts:51-78`: se añade una entrada a **cada una** de las 4 fuentes y se exige `valor + 1` solo en su cifra; contador `[0,1,2,3]` en `:77` |
| *And* ninguna cifra está escrita a mano en el componente | `Hero-logica.test.ts:80-100`: se lee el TEXTO REAL de `Hero.tsx` con `?raw`, se extrae la banda `aria-label="Resumen de Galapavet"` y la llamada `construirCifrasBienvenida(...)`, y se exige `digitosDe(...) = []` en ambos, más que la banda contenga `cifra.valor` (anti-vacuidad) y que los 4 argumentos sean los catálogos reales |

### @s52 — El sitio no afirma prestar lo que no presta

| Cláusula | Aserción |
| --- | --- |
| *Given* el sitio construido y servido | `datos-reales.spec.ts:105-114` (`leerTextoVisibleDeLasSeisRutas`) |
| *When* se recorre el texto visible de las seis rutas | `datos-reales.spec.ts:110-112` (`document.body.innerText` en navegador real) + `rutasInspeccionadas = RECUENTO_DE_RUTAS` en `:241` y `:260` |
| *Then* ninguna frase afirma atención las veinticuatro horas | `datos-reales.spec.ts:238-240` con las 4 frases de esa categoría (`24 h`, `24h`, `24 horas`, `veinticuatro horas`); el reclamo literal del prototipo se delata en `datosDelSitio.test.ts:399` |
| *And* ninguna frase afirma atención todos los días del año | Mismas aserciones, categoría `atención todos los días del año` (3 frases) |
| *And* el único compromiso de urgencias es el de la fuente única | `datos-reales.spec.ts:249-264`: el cualificador se DERIVA del rótulo real (`cualificadorDeclaradoDe(datosNegocio.telefonoUrgencias.rotulo)` → `fuera de horario`) y se exige `compromisosEncontrados = ['fuera de horario']` — exactamente uno, y ese. Lógica y sus rojos: `datosDelSitio.test.ts:465`, `:471`, `:485`, `:498`, `:515` |

---

## 4. Sabotaje: 76 puertas rotas a propósito, medidas y restauradas

Metodología: se rompe el fichero o el dato que vigila cada puerta, se corren
**solo** mis dos ficheros de test, y se restaura desde una copia de seguridad.
Al final, `git diff src/components/Hero.tsx` sale vacío.

### Ronda 1 — sabotajes de comportamiento

```
SABOTAJE A · @s49: un literal ficticio dentro de src/
     × el texto real de todos los ficheros de "src" no conserva ningún dato de la clínica ficticia
AssertionError: expected [ { …(3) } ] to deeply equal []
SABOTAJE B · @s49: se quita el fallo cerrado por 0 ficheros
     × falla cerrada si no inspecciona ningún fichero, y no dice que no encontró nada
AssertionError: expected true to be false // Object.is equality
SABOTAJE C · @s49: la búsqueda deja de ser insensible a la caja          -> 3 failed
SABOTAJE D · @s50: se afloja la marca de entrada del catálogo             -> 34 passed  (EQUIVALENTE, ver abajo)
SABOTAJE E · @s50: la pista de vista previa se lee del atributo equivocado
AssertionError: expected NaN to be 6 // Object.is equality
SABOTAJE F · @s50: la puerta de recuentos invierte su comparación         -> 2 failed
SABOTAJE G · @s51: digitosDe deja de mirar el texto
AssertionError: expected [] to deeply equal [ '2', '4', '3', '6', '5' ]
SABOTAJE H · @s51: una cifra se escribe a mano en la lógica               -> 3 failed
AssertionError: expected [ 5, 2, 9, 3 ] to deeply equal [ 5, 2, 10, 3 ]
SABOTAJE I · @s51: se escribe una cifra a mano en el componente (Hero.tsx)
AssertionError: expected [ '1', '2' ] to deeply equal []
SABOTAJE J · @s52: la puerta de afirmaciones deja de buscar               -> 2 failed
SABOTAJE K · @s52: la palabra del compromiso pierde el plural             -> 4 failed
SABOTAJE L · @s52: se admite más de un compromiso de urgencias
AssertionError: expected true to be false // Object.is equality
RESTAURADO — comprobación final:      Tests  34 passed (34)
```

`SABOTAJE D` (`'\n  { '` → `'\n  {'`) **no** puso nada en rojo: sobre el texto
real del prototipo, que siempre escribe `{ ` con espacio, es una mutación
EQUIVALENTE. No es un mutante que StrykerJS genere (su `StringLiteral` mutator
solo produce `''`), y esa variante sí muere: `M6 APERTURA_DE_ENTRADA -> ''` →
2 rojos.

### Rondas 2-4 — cobertura de clases de mutante de StrykerJS

Se rompieron, una a una, **todas** las clases de mutante que
`@stryker-mutator/instrumenter@10.0.0` genera sobre este módulo (leído su
código real: `StringLiteral`, `BooleanLiteral`, `ArrayDeclaration`,
`ObjectLiteral`, `ArithmeticOperator`, `EqualityOperator`, `LogicalOperator`,
`ConditionalExpression`, `BlockStatement` y `MethodExpression` —
`toLowerCase↔toUpperCase`, `startsWith↔endsWith`, `filter` eliminado). 60
sabotajes. Resultado final: **60/60 en rojo**. Los seis que sobrevivieron en la
primera pasada se corrigieron añadiendo pruebas, y luego murieron:

| Superviviente | Prueba que lo mata ahora |
| --- | --- |
| `APERTURA_DE_CATALOGO_FINAL -> ''` | `datosDelSitio.test.ts:290` — «no confunde un catálogo con otro cuyo nombre empieza igual» (`UNO` vs `UNOS`) |
| `CIERRE_DE_ETIQUETA -> '<'` | `datosDelSitio.test.ts:315-317` — la pista tiene que ser atributo DE ESA etiqueta, no texto suelto detrás del `>` |
| `const [, ...ventanas]` → sin `rest` | `datosDelSitio.test.ts:481` — el trozo previo a la primera aparición no es ventana |
| `hallazgos: []` (rama de fallo cerrado) → con basura | `datosDelSitio.test.ts:163`, `:178`, `:453`, `:461` |
| `APERTURA_DE_LISTADO_FINAL -> ''` | `datosDelSitio.test.ts:320-330` — `servicios` vs `serviciosDestacados` |
| `FIN_DE_ATRIBUTO -> '"'` → `''` | `datosDelSitio.test.ts:328` — la pista de DOS cifras (`12`) se lee entera, no su primer dígito |

Muestra de la última ronda (todas rojas):

```
M42bis APERTURA_DE_LISTADO_FINAL -> ''                Tests  1 failed | 35 passed (36)
M43bis FIN_DE_ATRIBUTO -> ''                          Tests  1 failed | 35 passed (36)
M32bis discrepancias vacias -> con basura             Tests  1 failed | 35 passed (36)
M34bis hallazgo ficticio -> objeto vacio              Tests  4 failed | 32 passed (36)
M36bis hallazgo de afirmacion -> objeto vacio         Tests  2 failed | 34 passed (36)
M45 se ignoran las citas permitidas                   Tests  2 failed | 34 passed (36)
M46 textoInspeccionable -> toUpperCase                Tests  3 failed | 33 passed (36)
M47 cualificadorDeclaradoDe -> toUpperCase            Tests  1 failed | 35 passed (36)
M48 cualificador del catalogo -> toUpperCase          Tests  3 failed | 33 passed (36)
M49 texto de compromisos -> toUpperCase               Tests  3 failed | 33 passed (36)
M50 texto visible -> toUpperCase                      Tests  2 failed | 34 passed (36)
M51 frase prohibida -> toUpperCase                    Tests  2 failed | 34 passed (36)
M52 formasDeBusqueda deja de quitar espacios          Tests  3 failed | 33 passed (36)
M53 puerta de literales invierte pasa                 Tests  6 failed | 30 passed (36)
M54 puerta de recuentos invierte pasa                 Tests  2 failed | 34 passed (36)
M55 puerta de afirmaciones invierte pasa              Tests  2 failed | 34 passed (36)
--- final ---
      Tests  36 passed (36)
```

---

## 5. Salida literal de la verificación obligatoria

### 5.1 `pnpm exec vitest run src/lib/diseno/datosDelSitio.test.ts src/components/Hero-logica.test.ts`

```
 RUN  v4.1.10 C:/Users/vhurt/OneDrive/Escritorio/Proyectos/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria

 Test Files  2 passed (2)
      Tests  36 passed (36)
   Start at  20:55:51
   Duration  1.92s (transform 444ms, setup 584ms, import 528ms, tests 23ms, environment 2.01s)
```

### 5.2 `pnpm run lint && pnpm run typecheck`

```
lint exit=0

> galapavet-web@0.0.0 lint C:\...\GalapavetClinicaVeterinaria
> oxlint --deny-warnings

typecheck exit=0

> galapavet-web@0.0.0 typecheck C:\...\GalapavetClinicaVeterinaria
> tsc -b
```

0 y 0.

### 5.3 Suite completa (`pnpm exec vitest run`) — contexto

```
 Test Files  1 failed | 86 passed (87)
      Tests  1 failed | 1116 passed (1117)
```

El único fallo es **de otro lote**, no de este:
`src/lib/diseno/usoDelAcento.test.ts > @s15 la puerta corre sobre el texto real
de los ficheros de estilos > el acento no se pinta como texto ni como borde, y
sí se pinta al menos una vez como relleno`. Ese fichero (`usoDelAcento.ts/.test.ts`)
no está en mi ámbito y no lo he tocado. Mis 36 pruebas están verdes.

### 5.4 Comandos NO ejecutados (prohibidos por el orquestador)

`pnpm run build`, `pnpm exec playwright test`, `vite preview` y
`pnpm exec stryker run`. `tests/e2e/datos-reales.spec.ts` queda escrito y
verificado con `oxlint --deny-warnings` (0) y `tsc -b` sobre
`tsconfig.e2e.json` (0).

---

## 6. Qué mide cada aserción del spec de Playwright (no ejecutado)

| Aserción | Qué mide | Contra qué dato lo compara |
| --- | --- | --- |
| `datos-reales.spec.ts:125-133` | El TEXTO de cada fichero `.html`/`.css`/`.js` de `dist/`, leído con `node:fs` tras el `pnpm run build` que el propio `webServer` de Playwright encadena | Los 5 literales ficticios escritos a mano, ×9 formas de búsqueda. `hallazgos` debe ser `[]`, `ficherosInspeccionados > 0`, `formasBuscadas = 9` |
| `datos-reales.spec.ts:136-143` | Presencia de cada literal en el texto real del prototipo | El propio catálogo: los 5 tienen que estar, o el barrido no prueba nada |
| `datos-reales.spec.ts:145-163` | `page.content()` (DOM serializado) de las 6 rutas servidas | Los mismos 5 literales; `ficherosInspeccionados` = `RECUENTO_DE_RUTAS` (6) |
| `datos-reales.spec.ts:171-173` | `locator.count()` de `#servicios article`, `#equipo article` y `#galeria figure` en la portada construida a 1600×1000 | `SERVICIOS.length` (5), `EQUIPO.length` (2), `GALERIA.length` (6) — importados de `src/data/*.ts` |
| `datos-reales.spec.ts:183-185` | Los mismos tres recuentos | Los del prototipo escritos a mano: 12, 6, 9 (medidos en el test unitario) |
| `datos-reales.spec.ts:206-229` | Los mismos tres recuentos, contra las DOS procedencias prohibidas | `contarEntradasDelCatalogoDelPrototipo` y `leerPistaDeVistaPrevia` sobre el fichero real del prototipo: 12/6/9 y 6/6/5. `discrepancias = []`, `listadosInspeccionados = 3` |
| `datos-reales.spec.ts:238-247` | `document.body.innerText` de las 6 rutas (texto VISIBLE, no HTML: los comentarios del código nunca llegan) | Las 7 frases prohibidas escritas a mano. `hallazgos = []`, `rutasInspeccionadas = 6`, `afirmacionesBuscadas = 7`, y cada ruta con texto de longitud > 0 |
| `datos-reales.spec.ts:250-264` | Los cualificadores que siguen a la palabra «urgencias» en el texto visible de las 6 rutas | El cualificador DERIVADO del rótulo de `src/lib/site.ts` (`Urgencias fuera de horario` → `fuera de horario`). Debe ser el único: `compromisosEncontrados = ['fuera de horario']` |

Comportamiento esperado sobre el sitio actual, con las fuentes ya leídas:
`BarraUrgencias` (shell, presente en las 6 rutas) pinta
`Urgencias fuera de horario · 91 851 13 93`, y el pie pinta el mismo rótulo;
`ReservaChat` dice «Es una urgencia» en **singular**, que la puerta no cuenta
como compromiso a propósito (un compromiso se enuncia en plural). Ninguna ruta
publica `24 h`, `365` ni `todos los días` en texto visible: las únicas
apariciones de esas cadenas en `src/` están en **comentarios** de
`Faq-logica.ts:65` y `PaginaBlog-logica.ts:62`, que no llegan al navegador.

---

## 7. Decisiones de diseño que el `judge` debe revisar

1. **`citasPermitidas` en la puerta de @s49.** El barrido de `src/` habría
   fallado por `src/lib/diseno/fidelidadPrototipo.ts:4`, que cita en su
   cabecera la RUTA del prototipo versionado. Se admite exactamente esa ruta
   (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`) y nada más: el
   nombre suelto sigue siendo hallazgo (`datosDelSitio.test.ts:194`), y en
   `dist/` no se admite ninguna cita (`SIN_CITAS_PERMITIDAS`). La sustitución
   deja un HUECO, no la cadena vacía, para no soldar los trozos vecinos
   (`datosDelSitio.test.ts:215`).
2. **El catálogo de literales ficticios vive en los tests, no en `src/`.** Es
   el «literal escrito a mano» que pide el Given, y dentro de `src/`
   contaminaría el propio barrido. Se retipea dos veces (unitario y e2e) a
   propósito, como `tests/e2e/rutas.ts` hace con el inventario de rutas.
3. **«Pista de vista previa» = `hint-placeholder-count`.** Es la lectura
   literal de la cláusula, y es medible sobre el fichero real del prototipo.
4. **El compromiso de urgencias se detecta por la palabra en PLURAL.** «Es una
   urgencia» (opción del chat) no es un compromiso de disponibilidad; si se
   contase, la puerta daría un rojo falso sobre texto que no afirma nada.
5. **`Hero-logica.ts` no se ha tocado.** La derivación ya era correcta; lo que
   faltaba —y es lo que se ha añadido— eran las aserciones que la matriz
   señalaba: catálogos reales, fixture de sabotaje por fuente, y la lectura
   `?raw` de `Hero.tsx`.
