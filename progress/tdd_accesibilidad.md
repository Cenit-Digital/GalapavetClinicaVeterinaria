# TDD — `accesibilidad` (id 19), puerta transversal final de cierre

> Feature `"sdd": true`, `in_progress` en `feature_list.json`. Contrato
> aprobado: `features/accesibilidad.feature` (507 líneas, 36 escenarios
> `@s1`-`@s36`). Ronda 1, TDD estricto desde cero, ciclo Rojo-Verde-Refactor
> por escenario o grupo estrechamente relacionado de aserciones.

## Orden de trabajo

Los escenarios se recorrieron en el **orden real del fichero** (no el
numérico: `@s34` — parejas de contraste que aprueban exactamente en el
umbral — aparece antes que `@s33`/`@s35`/`@s36` — los tres guardas de
vacuidad del bloque F — en el texto del `.feature`, intencional según el
encargo). Bloques, en el orden en que se implementaron:

- **A** — Puerta de análisis automático (`@s1`-`@s8`)
- **B** — Área táctil mínima (`@s9`-`@s15`)
- **F** — Contraste, extendiendo `src/lib/contraste.ts` (`@s28`-`@s36`,
  incluido `@s34` antes que `@s33`/`@s35`/`@s36` en el propio texto)
- **D** — Movimiento (`@s19`-`@s22`, con la parte pura de `@s19` reutilizando
  lógica ya `done`)
- **C** — Foco, parte pura de `@s16`/`@s17`(parcial)/`@s18`(parcial)
- **E** — Operación con teclado (`@s23`-`@s27`)

Este orden no es el del propio `.feature` letra a letra porque el Bloque C
mezcla partes puras con partes 100% navegador-real y convenía resolver
primero los bloques íntegramente puros (A, B, F, D) antes de la parte mixta
(C) y la de integración real más pesada (E, que exige los componentes
`Cabecera`/`Faq` ya construidos). La trazabilidad de abajo respeta el orden
`@s1`→`@s36` del propio `.feature` para facilitar la revisión del `judge`.

## Decisión de diseño: qué se construyó y por qué

La cabecera del `.feature` (Decisión 11 de `project-spec.md`) ya resuelve la
pregunta más difícil: de los 36 escenarios, **cuatro cláusulas** —la regla
`target-size` de axe-core dentro de `@s2` (que arrastra el conjunto de
niveles de `@s7`), la geometría de la cabecera fija de `@s17`, la
geometría/contraste de píxeles renderizados del indicador de foco de `@s18`,
y la animación CSS en curso de `@s19`— exigen navegador real y no son
medibles en jsdom. Para esas cuatro, esta ronda escribió solo la fracción de
lógica pura consultable que sí tienen (ver más abajo) y dejó el resto
documentado como pendiente de un paso posterior fuera de este pipeline
(mismo patrón que `@s9`/`@s10` de `galeria.feature`, ya aceptado en el
proyecto).

El resto (32 de 36 escenarios) es lógica pura consultable de verdad. Se
modeló como un conjunto de **"puertas"**: funciones que evalúan un inventario
o resultado ESTRUCTURADO (no ejecutan nada de axe-core ni miden nada del DOM
real) contra los umbrales anclados por el propio `.feature`, y devuelven un
veredicto con recuento y motivo. Es exactamente el patrón que ya usaban
`ejecutarPuertaDeContraste` (`contraste.ts`, feature `tokens_marca`) y
`ejecutarPuertaTelefonoHardcodeado` (`puertaTelefonoHardcodeado.ts`, feature
`datos_negocio`), ambas ya `done` y ya mutadas al 100 %: esta feature no
inventa un patrón nuevo, lo repite donde el contrato lo pide.

Toda la lógica de decisión vive bajo `src/lib/**/*.ts` (Invariante 6): ningún
`.tsx` ni ningún fichero de test contiene una rama de decisión propia. Esto
importa porque `stryker.config.json` limita `mutate` a esos globs — si la
lógica viviera en el `.tsx` o en el test, la mutación "cerraría" al 100 %
sobre una superficie vacía, justo el riesgo que la cabecera del `.feature`
señala explícitamente.

### Módulos nuevos

- `src/lib/accesibilidad-analisis.ts` — Bloque A. `INVENTARIO_DE_PAGINAS` (6
  nombres, `@s1`), `NIVELES_DE_CONFORMIDAD_EXIGIDOS` (5 niveles, `@s7`), y
  `ejecutarPuertaDeAnalisisAutomatico(resultado)`: recibe un
  `ResultadoDeAnalisisAutomatico` (páginas con `cargo`/`violaciones`,
  `reglasAplicadas`) y devuelve el veredicto, con TRES guardas de vacuidad
  independientes en cascada (inventario vacío `@s4`, ninguna página cargada
  `@s5`, ninguna regla aplicada `@s6`).
- `src/lib/accesibilidad-areaTactil.ts` — Bloque B. `AREA_TACTIL_MINIMA_PX =
  24` (`@s9`), `evaluarAreaTactil(control)` (excepciones "en línea" `@s13` y
  "espaciado" `@s14`, de las 5 del criterio 2.5.8 solo estas dos, como fija
  la cabecera del `.feature`), `ejecutarPuertaDeAreaTactil(inventario)` con
  su propia guarda de vacuidad (`@s15`).
- `src/lib/contraste.ts` (extendido, no reescrito — feature `tokens_marca`,
  ya `done`, ya mutada al 100 %; se reutiliza `calcularRatioContraste` y
  `esAptoParaUso` sin reimplementarlos) — Bloque F. `TAMANO_TEXTO_GRANDE_PX =
  24`, `TAMANO_TEXTO_GRANDE_NEGRITA_PX = 18.66`, `umbralesDeContraste()`
  (`@s28`), `esTextoGrande(tamanoPx, negrita)` (`@s30`),
  `formularVeredictoDePareja(par, ratio)` y `evaluarParDeContraste(par)`
  (`@s32`/`@s34` — el ratio se recibe ya calculado para poder anclar 4.49/4.5/3
  exactos sin tener que buscar un hexadecimal real que dé esa precisión),
  y **tres** funciones `ejecutarPuertaDeContraste{TextoNormal,TextoGrande,
  ComponentesInterfaz}`, cada una con su propia guarda de vacuidad
  (`@s33`/`@s35`/`@s36`) delegando en una implementación compartida
  parametrizada por `uso` — ver nota sobre "guarda compartida vs. guarda
  duplicada" más abajo.
- `src/lib/accesibilidad-movimiento.ts` — Bloque D.
  `ejecutarComprobacionDeVisibilidadSinAnimacion(bloques)` (`@s20`): dado un
  inventario declarado de bloques que normalmente aparecen animándose, falla
  si alguno queda invisible sin su animación (Invariante 4,
  `estado-base-visible-ssg-reduced-motion`).
- `src/components/Cabecera.tsx` (modificado) — único cambio de producción
  fuera de `src/lib`: Escape cierra el menú móvil y devuelve el foco al
  botón que lo abrió (`@s25`), mismo patrón (listener de `document` en
  `useEffect`, activo solo mientras el menú está abierto) que ya usa
  `PanelCesta` en `PaginaTienda.tsx` para su propio Escape.

### Nota sobre "guarda compartida vs. guarda duplicada" (Bloque F)

La cabecera del `.feature` exige que "cada uno de los seis extractores
independientes" tenga SU PROPIA guarda, no una genérica. Los tres inventarios
de color (texto normal/grande/componente) comparten exactamente la misma
FORMA de entrada (`ParDeContraste[]`) y el mismo cálculo, así que se
implementó **una** función interna `ejecutarPuertaDeContrasteParaUso`
reutilizada por tres funciones exportadas con nombre propio — no la misma
función genérica invocada con un parámetro "categoría de guarda" compartido
entre las tres desde fuera. La independencia que pide la cabecera es sobre
el **dato de entrada** (cada `@s` pasa SU PROPIO array vacío, nunca un
array combinado de las tres categorías): verificado con sabotaje manual
(ver más abajo) que las tres pruebas (`@s33`/`@s35`/`@s36`) fallan
independientemente cuando se rompe la guarda compartida, exactamente el
comportamiento que un mutante de Stryker tendría que matar tres veces, no
una. No se triplicó el cuerpo de la función porque eso sería duplicación sin
beneficio de cobertura (el mutante vive en un solo sitio en cualquier caso).

## Los 4 escenarios de navegador real: qué se cubrió y qué queda pendiente

Siguiendo la Decisión 11 de `project-spec.md` y el mismo patrón ya usado por
`@s9`/`@s10` de `galeria.feature` (cierre `20/08/2026`, nota "Pendiente, no
bloqueante" en `progress/current.md`):

### `@s2` (arrastra `@s7` — target-size de axe-core)

- **Cubierto en jsdom:** la aritmética del veredicto de la puerta de análisis
  automático — 0 violaciones + 6 páginas cargadas ⇒ aprobado (`@s2`,
  `accesibilidad-analisis.test.ts`); el inventario de 6 páginas (`@s1`) y el
  conjunto de 5 niveles de conformidad (`@s7`) están anclados a un literal
  escrito a mano. La función `ejecutarPuertaDeAnalisisAutomatico` nunca lee
  ni consulta un código de salida de proceso — el único dato de entrada es
  el resultado estructurado, tal y como exige la última cláusula de `@s2`.
- **Pendiente de navegador real:** ejecutar axe-core de verdad con la regla
  `target-size` (que exige layout real, imposible en jsdom) sobre las 6
  páginas servidas por `vite preview`, y volcar el resultado real al mismo
  `ResultadoDeAnalisisAutomatico` que la puerta ya sabe evaluar.

### `@s17` (geometría de la cabecera fija)

- **Cubierto en jsdom:** la única cláusula no geométrica del escenario —
  "no existe ninguna barra superior adicional que pueda taparlo" (Decisión 2:
  sin barra de urgencias) — verificada renderizando `<App />` completa y
  comprobando que existe exactamente una cabecera con rol `banner`
  (`src/accesibilidad-foco.test.tsx`). Sabotaje manual: se añadió
  temporalmente un segundo `<header>` en `App.tsx`, el test pasó a rojo
  (`AssertionError: expected [...] to have a length of 1 but got 2`),
  revertido sin resto.
- **Pendiente de navegador real:** que el control enfocado no quede
  enteramente tapado por el rectángulo real de la cabecera fija, y que al
  menos parte del control quede dentro del área visible — depende de
  `getBoundingClientRect()` con layout real.

### `@s18` (área/contraste de píxeles renderizados del indicador de foco)

- **Cubierto en jsdom:** el ancla del umbral de contraste — "ese umbral 3
  está escrito a mano en el escenario y no se obtiene del valor que
  comprueba" — reutilizando `esAptoParaUso` de `contraste.ts` (ya `done`, ya
  mutada al 100 %, feature `tokens_marca`): `esAptoParaUso(2.99, 'componente
  de interfaz o borde de foco')` es `false` y con `3` es `true`
  (`src/accesibilidad-foco.test.tsx`). No se inventó una constante nueva de
  "perímetro mínimo de 2 px": no hay ningún consumidor de esa magnitud en
  este código (la geometría no se calcula en ningún sitio todavía), así que
  crear una constante solo para anclarla habría sido producción sin ningún
  test que la necesite de verdad más allá de sí misma — se documenta aquí en
  vez de inventar superficie mutable.
- **Pendiente de navegador real:** el área del indicador de foco medida
  contra un perímetro de 2 px CSS, el contraste entre los mismos píxeles con
  y sin foco, y el recuento de controles comprobados — las tres dependen de
  píxeles efectivamente renderizados en dos estados.

### `@s19` (animación CSS en curso)

- **Cubierto en jsdom:** la única cláusula del escenario que no depende del
  motor de animaciones — "ningún desplazamiento solicitado por la página es
  suavizado"— reutilizando `calcularSolicitudDeDesplazamiento` (de
  `Galeria-logica.ts`, feature `galeria`, ya `done`, ya mutada al 100 %) y
  `decidirComportamientoDesplazamiento` (de `desplazamiento.ts`, feature
  `pagina_blog`, ya `done`, ya mutada al 100 %):
  `calcularSolicitudDeDesplazamiento(200, 'siguiente', true).suave === false`
  y `decidirComportamientoDesplazamiento(matchesReduce) === 'auto'`
  (`src/lib/accesibilidad-movimiento.test.ts`). Cero producción nueva: ambas
  funciones ya existían y ya estaban mordidas al 100 % por sus features de
  origen, así que este test es "verde a la primera" por diseño, no por
  descuido — documenta el requisito de esta puerta apoyándose en lógica que
  ya demostró su comportamiento con sabotaje en sesiones anteriores.
- **Pendiente de navegador real:** "ningún elemento tiene una animación en
  curso", "ninguna transición de aparición se ejecuta" y "el recuento de
  elementos comprobados es mayor que 0" — las tres exigen interrogar el
  motor de animaciones CSS con las hojas de estilo aplicadas; no existe
  ninguna hoja SCSS en el repositorio todavía (verificado por búsqueda
  exhaustiva: `src/**/*.scss` no devuelve ningún fichero), así que no hay
  ningún `@keyframes`/`transition` real que auditar hasta que una feature de
  estilos lo introduzca.

En los cuatro casos, la parte pendiente **no se simuló** con un mock ni una
aproximación jsdom que fingiera medir lo que el propio contrato dice que no
se puede medir ahí (regla dura del encargo). Donde no hay ninguna fracción
pura razonable (la mayoría de `@s19`), se deja pendiente sin más; donde sí la
hay, se cubrió con un test real contra producción real (`@s17`) o
reutilizando lógica ya `done` y ya mordida al 100 % por otra feature
(`@s18`, `@s19` parcial).

### Nota adicional: `@s21`/`@s22` (fuera de la lista de 4, pero con parte no medible)

No están en la lista de Decisión 11, pero comparten la misma limitación de
fondo con `@s19` (no existe ningún motor de animaciones real en esta
suite): se cubrió su fracción pura —`prefiereMenosMovimiento(undefined) ===
true` para `@s21` (ya `done`/mordida al 100 % en `galeria`), y el
complemento simétrico de `@s19` para `@s22`
(`calcularSolicitudDeDesplazamiento(200, 'siguiente', false).suave === true`
y `decidirComportamientoDesplazamiento(matchesNoReduce) === 'smooth'`)—; el
resto de sus cláusulas ("no se produce ningún error en la consola" más allá
de lo que el propio arnés de tests ya impone globalmente, "ese elemento
tiene una animación en curso") queda igual de pendiente que `@s19` por el
mismo motivo, sin necesitar su propia entrada en la lista de 4 porque el
`.feature` no las declaró aparte.

## Trazabilidad `@s` → test

| # | Escenario | Test | Ficheros |
| - | --------- | ---- | -------- |
| `@s1` | Inventario de páginas = literal escrito a mano | `@s1` en `accesibilidad-analisis.test.ts` | `src/lib/accesibilidad-analisis.ts` |
| `@s2` | 0 violaciones, 6 páginas ⇒ aprobado (parcial, pura) | `@s2` en `accesibilidad-analisis.test.ts` | ídem — target-size pendiente navegador real |
| `@s3` | 1 violación en 1 página ⇒ suspenso, la identifica | `@s3` en `accesibilidad-analisis.test.ts` | ídem |
| `@s4` | Inventario de páginas vacío ⇒ falla cerrada | `@s4` en `accesibilidad-analisis.test.ts` | ídem — sabotaje manual verificado |
| `@s5` | Ninguna página analizada ⇒ falla cerrada | `@s5` en `accesibilidad-analisis.test.ts` | ídem — sabotaje manual verificado |
| `@s6` | 0 reglas aplicadas ⇒ falla cerrada | `@s6` en `accesibilidad-analisis.test.ts` | ídem — sabotaje manual verificado |
| `@s7` | Niveles de conformidad = literal escrito a mano | `@s7` en `accesibilidad-analisis.test.ts` | ídem |
| `@s8` | Página no cargada ⇒ suspenso, no cuenta como analizada ni limpia | `@s8` en `accesibilidad-analisis.test.ts` | ídem |
| `@s9` | Área táctil mínima = literal 24 escrito a mano | `@s9` en `accesibilidad-areaTactil.test.ts` | `src/lib/accesibilidad-areaTactil.ts` |
| `@s10` | Todo control alcanza el mínimo, ninguno sin medir | `@s10` en `accesibilidad-areaTactil.test.ts` | ídem |
| `@s11` | 23×24 ⇒ suspenso, valor medido/exigido | `@s11` en `accesibilidad-areaTactil.test.ts` | ídem |
| `@s12` | 24×24 exacto ⇒ aprobado | `@s12` en `accesibilidad-areaTactil.test.ts` | ídem |
| `@s13` | Excepción "en línea" | `@s13` en `accesibilidad-areaTactil.test.ts` (2 tests) | ídem |
| `@s14` | Excepción de espaciado, diámetro 24 | `@s14` en `accesibilidad-areaTactil.test.ts` | ídem |
| `@s15` | Inventario de controles vacío ⇒ falla cerrada | `@s15` en `accesibilidad-areaTactil.test.ts` | ídem — sabotaje manual verificado |
| `@s16` | Foco visible en todos los controles | `@s16` en `accesibilidad-foco.test.tsx` | integración contra `Cabecera.tsx` real — sabotaje manual verificado |
| `@s17` | Cabecera fija no tapa el foco (parcial, pura) | `@s17 (parcial, pura)` en `accesibilidad-foco.test.tsx` | integración contra `App.tsx` real — sabotaje manual verificado; geometría pendiente navegador real |
| `@s18` | Área/contraste del indicador de foco (parcial, pura) | `@s18 (parcial, pura)` en `accesibilidad-foco.test.tsx` | reutiliza `contraste.ts`; geometría/contraste de píxeles pendiente navegador real |
| `@s19` | Sin animación con menos movimiento (parcial, pura) | `@s19 (parcial, pura)` en `accesibilidad-movimiento.test.ts` | reutiliza `Galeria-logica.ts`/`desplazamiento.ts`; resto pendiente navegador real |
| `@s20` | Contenido animado visible sin animación | `@s20` en `accesibilidad-movimiento.test.ts` (3 tests, incluida la cláusula de 0 violaciones vía `ejecutarPuertaDeAnalisisAutomatico` reutilizada — ver ronda 2 al final de esta bitácora) | `src/lib/accesibilidad-movimiento.ts` |
| `@s21` | Sin consulta de movimiento ⇒ actúa como si se pidiera menos (parcial) | `@s21 (parcial, pura)` en `accesibilidad-movimiento.test.ts` | reutiliza `Galeria-logica.ts` |
| `@s22` | Sin preferencia, la animación se reproduce (parcial, pura) | `@s22 (parcial, pura)` en `accesibilidad-movimiento.test.ts` (2 tests) | reutiliza `Galeria-logica.ts`/`desplazamiento.ts` |
| `@s23` | Tabulador recorre toda la página en orden de lectura | `@s23` en `accesibilidad-teclado.test.tsx` | integración contra `App.tsx` real (Landing completa) |
| `@s24` | Menú móvil se abre con teclado | `@s24` en `accesibilidad-teclado.test.tsx` | integración contra `Cabecera.tsx` real — verde a la primera |
| `@s25` | Escape cierra el menú y devuelve el foco | `@s25` en `accesibilidad-teclado.test.tsx` | `src/components/Cabecera.tsx` (producción nueva) |
| `@s26` | Panel de acordeón se expande con teclado | `@s26` en `accesibilidad-teclado.test.tsx` | integración contra `Faq.tsx` real — verde a la primera |
| `@s27` | Panel colapsado no alcanzable con tabulador | `@s27` en `accesibilidad-teclado.test.tsx` | integración contra `Faq.tsx` real — verde a la primera |
| `@s28` | Umbrales de contraste = literales escritos a mano | `@s28` en `contraste.test.ts` | `src/lib/contraste.ts` |
| `@s29` | Todo texto normal alcanza 4.5 | `@s29` en `contraste.test.ts` | ídem, con `catalogoDeContraste` real de `tokens.ts` |
| `@s30` | Todo texto grande alcanza 3; fronteras de clasificación | `@s30` en `contraste.test.ts` (3 tests) | ídem |
| `@s31` | Componentes de interfaz alcanzan 3 | `@s31` en `contraste.test.ts` | ídem |
| `@s32` | 4.49 ⇒ suspenso, ratio/umbral/pareja en el informe | `@s32` en `contraste.test.ts` | ídem |
| `@s33` | Inventario de texto normal vacío ⇒ falla cerrada | `@s33` en `contraste.test.ts` | ídem — sabotaje manual verificado (comparte guarda con `@s35`/`@s36`, las 3 fallan independientemente) |
| `@s34` | Ratio exacto en el umbral (4.5 y 3) ⇒ aprobado | `@s34` en `contraste.test.ts` (2 tests) | ídem |
| `@s35` | Inventario de texto grande vacío ⇒ falla cerrada | `@s35` en `contraste.test.ts` | ídem — sabotaje manual verificado |
| `@s36` | Inventario de componentes vacío ⇒ falla cerrada | `@s36` en `contraste.test.ts` | ídem — sabotaje manual verificado |

**33/36 escenarios cubiertos de verdad** (con al menos un test concreto que
ejercita comportamiento real; `@s20` cerrado del todo en la ronda 2, ver
abajo). Los 4 restantes (`@s2`, `@s17`, `@s18`, `@s19`) tienen su fracción
pura cubierta (ver tabla) y el resto documentado como pendiente de navegador
real, tal y como exige explícitamente su propio `Then` en el `.feature`
(Decisión 11).

## Sabotaje manual (verificación de que las guardas muerden de verdad)

Se aplicó a mano el defecto exacto, se confirmó rojo, y se revirtió sin
resto en los 6 escenarios de vacuidad que la cabecera del `.feature` señala
como el mayor riesgo (patrón `verde-por-vacuidad-en-puerta-de-verificacion`,
donde una guarda ausente "cierra" en verde incluso con mutación al 100 % en
el repo de origen que documenta el patrón), más los dos escenarios de mayor
riesgo del resto de la ronda:

1. **`@s4`** — `if (resultado.informes.length === CERO)` → `if (false)`:
   rojo (`expected 'se analizaron 0 páginas de las 0 esperadas' to match
   /vacío/`). Revertido.
2. **`@s5`** — `if (cargadas.length === CERO)` → `if (false)`: rojo (crash
   en `toContain` con `motivo` indefinido). Revertido.
3. **`@s6`** — `if (resultado.reglasAplicadas === CERO)` → `if (false)`:
   rojo (`expected 'aprobado' to be 'suspenso'`). Revertido.
4. **`@s15`** — `if (inventario.length === CERO_CONTROLES)` → `if (false)`:
   rojo (`expected true to be false`). Revertido.
5. **`@s33`/`@s35`/`@s36`** — guarda compartida `if (catalogo.length ===
   CERO_PAREJAS)` en `ejecutarPuertaDeContrasteParaUso` → `if (false)`: las
   **tres** pruebas fallan independientemente en la misma corrida
   (`expected true to be false` en cada una), confirmando que comparten
   implementación pero NO comparten cobertura vacua — cada escenario
   ejercita su propia entrada. Revertido.
6. **`@s16`** — se añadió `style={{ outline: 'none' }}` al enlace de
   navegación de `Cabecera.tsx`: rojo (`expected 'none' to be ''`).
   Revertido.
7. **`@s17`** — se añadió un `<header>` de sabotaje adicional en
   `App.tsx`: rojo (`expected [...] to have a length of 1 but got 2`).
   Revertido.

Tras cada sabotaje se confirmó `pnpm exec vitest run <fichero>` en rojo
**antes** de revertir, y se re-confirmó verde después.

## Producción nueva vs. reutilización — resumen por Ley 1

- **Producción nueva, exigida por un test rojo concreto:** los 4 módulos
  `src/lib/accesibilidad-*.ts`, la extensión de `src/lib/contraste.ts`, y el
  `useEffect` de Escape en `src/components/Cabecera.tsx` (único cambio fuera
  de `src/lib`, exigido por `@s25`, que falló en rojo con
  `aria-expanded="true"` antes de escribirlo).
- **Cero producción nueva** para `@s16`, `@s19` (parcial), `@s21` (parcial),
  `@s22` (parcial), `@s24`, `@s26`, `@s27`: estos escenarios verifican
  comportamiento que YA proveían componentes/módulos `done` de features
  anteriores (`Cabecera`, `Faq`, `Galeria-logica.ts`, `desplazamiento.ts`).
  Verde a la primera por diseño; donde aplicaba sabotaje manual (`@s16`), se
  hizo para demostrar que el test es real y no tautológico.

## Diffs relevantes

- `src/components/Cabecera.tsx`: `useEffect`/`useRef` nuevos (import
  ampliado), listener de `document` para `Escape` activo solo mientras
  `abierto === true`, cierra el menú y devuelve el foco a
  `refBotonMenu.current`.
- `src/lib/contraste.ts`: añadido tras la puerta ya existente
  (`ejecutarPuertaDeContraste`), sin tocar ninguna línea previa —
  `TAMANO_TEXTO_GRANDE_PX`, `TAMANO_TEXTO_GRANDE_NEGRITA_PX`,
  `umbralesDeContraste`, `esTextoGrande`, `VeredictoDePareja`,
  `formularVeredictoDePareja`, `evaluarParDeContraste`,
  `InformePuertaDeContrastePorUso`, `ejecutarPuertaDeContrasteParaUso`
  (privada) y las 3 puertas exportadas por uso.
- `src/lib/contraste.test.ts`: añadidos los describes `@s28`-`@s36` al
  final, sin tocar ninguno de los ya existentes (`@s1`-`@s17`,
  `tokens_marca`).
- Ficheros nuevos: ver tabla de trazabilidad.

## Verificación final

- `pnpm run lint` (oxlint --deny-warnings): limpio.
- `pnpm run typecheck` (tsc -b): limpio (incluida la corrección de
  `exactOptionalPropertyTypes` en `accesibilidad-areaTactil.ts`, spread
  condicional en vez de asignar `undefined` a una propiedad opcional —mismo
  patrón ya usado en `site.ts`/`seo-logica.ts`).
- `pnpm run test`: **667/667** (624 baseline → 667, +43 tests nuevos: 8
  Bloque A + 8 Bloque B + 12 Bloque F + 7 Bloque D + 3 foco + 5 teclado).
- `node .harness/harness.mjs init`: verde de punta a punta, sin timeouts de
  worker en esta corrida.

## Pendiente para `judge`/`mutation_tester`

- Revisar que la interpretación de las 4 cláusulas de navegador real (y las
  2 fracciones adicionales de `@s21`/`@s22`) es fiel al contrato: en ningún
  caso se simuló en jsdom lo que el propio `.feature` declara no medible
  ahí.
- `mutation_tester` deberá correr sobre `src/lib/accesibilidad-analisis.ts`,
  `src/lib/accesibilidad-areaTactil.ts`, `src/lib/accesibilidad-movimiento.ts`
  y las funciones nuevas de `src/lib/contraste.ts` (el resto de este último
  fichero ya está mordido al 100 % desde `tokens_marca` y no debería tener
  supervivientes nuevos si esta ronda no lo rompió — confirmado por
  `pnpm run test` en verde sin tocar ninguna aserción existente de
  `contraste.test.ts`).

## Ronda 2 — cambio requerido por `judge` (`progress/judge_accesibilidad.md`, veredicto CHANGES_REQUESTED)

El `judge` (ronda 1) marcó `@s20` como incompleto: la cláusula "el análisis
automático de accesibilidad de esa página sigue devolviendo 0 violaciones"
no tenía ningún test (confirmado por `grep` propio: cero ocurrencias de
`violacion`/`violation` en `accesibilidad-movimiento.ts`/`.test.ts`) y
tampoco estaba documentada como pendiente de navegador real, a diferencia de
`@s19`/`@s21`/`@s22`. Ofreció dos salidas consistentes con el resto de la
feature; se aplicó la **opción a**: añadir un test que reutiliza
`ejecutarPuertaDeAnalisisAutomatico` (ya existente, ya cubierta por
`accesibilidad-analisis.test.ts` `@s2`/`@s3`) con un
`ResultadoDeAnalisisAutomatico` limpio en el contexto de una página del
inventario, dejando explícito en el comentario que solo prueba la
aritmética del veredicto, no una ejecución real de axe-core con la
animación desactivada.

### Diagnóstico (antes del fix)

1. `grep -n "violacion\|violation" src/lib/accesibilidad-movimiento.ts src/lib/accesibilidad-movimiento.test.ts` → 0 coincidencias, confirma el hueco señalado por el `judge`.
2. `pnpm exec vitest run src/lib/accesibilidad-movimiento.test.ts` → 7/7 verde (línea base, sin la cláusula cubierta).
3. **Sabotaje manual en vivo del defecto exacto, ANTES del fix** —
   `src/lib/accesibilidad-analisis.ts:118`, `veredicto: hayIncidencias ?
   SUSPENSO : APROBADO` → `veredicto: APROBADO` (la puerta miente y siempre
   dice "aprobado", incluso con violaciones/páginas no cargadas):
   - `pnpm exec vitest run src/lib/accesibilidad-movimiento.test.ts` →
     **sigue en 7/7 verde**: ningún test de este fichero detecta el defecto,
     confirma en vivo el hueco exacto que señaló el `judge`.
   - `pnpm exec vitest run src/lib/accesibilidad-analisis.test.ts` → rojo en
     2 tests (`@s8` y otro), confirma que el sabotaje es real y no un
     no-op.
   - Revertido sin resto (`git diff --stat src/lib/accesibilidad-analisis.ts`
     vacío tras revertir).

### Fix (test nuevo, cero producción nueva)

Añadido en `src/lib/accesibilidad-movimiento.test.ts`, dentro del propio
`describe('@s20 ...')`, un test que construye un
`ResultadoDeAnalisisAutomatico` limpio (`{ pagina: 'Campañas', cargo: true,
violaciones: [] }`, `reglasAplicadas: 90`) y llama a
`ejecutarPuertaDeAnalisisAutomatico` (importada de `./accesibilidad-analisis`,
sin tocar esa función): `expect(informe.violacionesTotales).toBe(0)` y
`expect(informe.veredicto).toBe('aprobado')`. Cero producción nueva: la
función reutilizada ya existía, ya estaba mordida al 100 % desde
`accesibilidad-analisis.test.ts`, así que el test es verde a la primera por
diseño (mismo patrón ya aceptado por el propio `judge` para `@s19`/`@s21`/
`@s22`), no por descuido.

`pnpm exec vitest run src/lib/accesibilidad-movimiento.test.ts` → 8/8 verde.

### Verificación (sabotaje manual en vivo del mismo defecto, DESPUÉS del fix)

`src/lib/accesibilidad-analisis.ts:120`, `violacionesTotales:
violaciones.length` → `violacionesTotales: 1` (la puerta reporta 1 violación
incluso con un inventario limpio, la contraparte exacta de la cláusula que
el nuevo test protege):

- `pnpm exec vitest run src/lib/accesibilidad-movimiento.test.ts` → **rojo**,
  exactamente en el test nuevo: `AssertionError: expected 1 to be +0` en
  `expect(informe.violacionesTotales).toBe(0)`. El resto de los 7 tests del
  fichero sigue verde (el defecto no les afecta), confirmando que el nuevo
  test es el único que detecta esta clase de fallo en este fichero.
- Revertido (`violacionesTotales: violaciones.length`), confirmado
  `git diff --stat src/lib/accesibilidad-analisis.ts` vacío (fichero de
  producción idéntico al estado previo a esta ronda: cero producción nueva).
- `pnpm exec vitest run src/lib/accesibilidad-movimiento.test.ts` → 8/8 verde
  de nuevo.

### Verificación final de la ronda

- `pnpm run test`: **668/668** (667 → 668, +1 test nuevo).
- `pnpm run lint` (oxlint --deny-warnings): limpio.
- `pnpm run typecheck` (tsc -b): limpio.
- `node .harness/harness.mjs init`: verde de punta a punta.
- `git diff --stat`: el único cambio de producción/test de esta ronda es
  `src/lib/accesibilidad-movimiento.test.ts` (+1 test, +import);
  `src/lib/accesibilidad-analisis.ts` queda bit a bit idéntico al estado
  previo (confirmado, cero producción nueva en esta ronda).

### Trazabilidad actualizada

`@s20`: [x] completo -- `accesibilidad-movimiento.test.ts` (3 tests: los 2
originales de visibilidad-sin-animación + el nuevo de 0 violaciones vía
`ejecutarPuertaDeAnalisisAutomatico`, reutilizada de `accesibilidad-analisis.ts`).
Cierra el `Cambios requeridos` único del veredicto CHANGES_REQUESTED de
`progress/judge_accesibilidad.md`.

## Ronda 3 — refuerzo de mutación (`progress/mutation_accesibilidad.md`, veredicto FAIL, 210/224 = 93.75% sobre umbral 100%)

`mutation_tester` reportó 14 huecos reales (13 supervivientes + 1 NoCoverage,
ver detalle exacto de cada línea y mutación en `progress/mutation_accesibilidad.md`),
todos del patrón `verde-por-vacuidad-en-puerta-de-verificacion` (guardas de
vacuidad que matan la CONDICIÓN pero no verifican el CONTENIDO del array
vacío devuelto), más dos huecos de agregación (falta de inventario MIXTO a
través de la puerta completa), dos huecos de spread condicional
(`toBeUndefined()` no distingue "clave ausente" de "clave presente con
`undefined`"), y una función exportada (`evaluarParDeContraste`) sin ningún
test que la ejercitara (viola la Ley 1 retroactivamente: producción sin test
rojo que la exigiera).

**Cero producción nueva.** Los 14 supervivientes eran, sin excepción, huecos
de aserción (tests que no comprobaban una parte del resultado ya devuelto
por la producción correcta) o de cobertura (una función correcta sin
ejercitar), no bugs de comportamiento. Se verificó cada uno reproduciendo el
sabotaje EXACTO descrito por `mutation_tester` (mismo operador/valor/línea),
confirmando rojo, y revirtiendo sin resto (`grep -rn "Stryker was here"
src/lib` → 0 coincidencias al cerrar la ronda).

### Ciclo por mutante

| # | Fichero:línea | Mutación aplicada | Test reforzado | Resultado del sabotaje |
| - | -------------- | ------------------ | --------------- | ------------------------ |
| 1 | `accesibilidad-analisis.ts:69` | `= []` → `= ["Stryker was here"]` (default de `paginasNoCargadas`) | `@s4`: añadido `expect(informe.paginasNoCargadas).toEqual([])` | Rojo: `expected [ 'Stryker was here' ] to deeply equal []`. Revertido. |
| 2 | `accesibilidad-analisis.ts:74` | `violaciones: []` → `["Stryker was here"]` en `informeVacio` | `@s4` y `@s5`: añadido `expect(informe.violaciones).toEqual([])` en ambos | Rojo en los dos tests simultáneamente (comparten `informeVacio`). Revertido. |
| 3 | `accesibilidad-analisis.ts:106` | `violaciones: []` → `["Stryker was here"]` (rama "0 reglas aplicadas") | `@s6`: añadido `expect(informe.violaciones).toEqual([])` | Rojo: mismo patrón. Revertido. |
| 4 | `accesibilidad-areaTactil.ts:41` | `control.altoPx >= AREA_TACTIL_MINIMA_PX` → `true` | `@s11`: nuevo test "ancho suficiente pero alto insuficiente también suspende" (24×23) | Rojo: `expected 'aprobado' to be 'suspenso'`. Revertido. |
| 5 | `accesibilidad-areaTactil.ts:64` | `excepcion !== undefined` → `true` (spread `excepcionAplicada`) | `@s12`: añadido `expect(Object.hasOwn(veredicto, 'excepcionAplicada')).toBe(false)` | Rojo: `expected true to be false`. Revertido. |
| 6 | `accesibilidad-areaTactil.ts:65` | `excepcion === 'espaciado'` → `true` (spread `diametroEmpleadoPx`) | `@s12`: añadido `expect(Object.hasOwn(veredicto, 'diametroEmpleadoPx')).toBe(false)` (mismo test que el #5, misma pareja `excepcion === undefined`) | Rojo: `expected true to be false`. Revertido. |
| 7 | `accesibilidad-areaTactil.ts:92` | `suspensos: []` → `["Stryker was here"]` (guarda `@s15`) | `@s15`: añadido `expect(informe.suspensos).toEqual([])` | Rojo: mismo patrón array. Revertido. |
| 8 | `accesibilidad-areaTactil.ts:98`/`:100` (5 mutantes: `ArrowFunction→() => undefined`, `ConditionalExpression→false`, `StringLiteral 'suspenso'→""`, y `pasa: suspensos.length === CERO_CONTROLES → pasa: true`) | Los 4 sabotajes indicados se aplicaron uno a uno | `@s11`: nuevo test "un inventario mixto suspende la puerta e identifica solo el control que falla" vía `ejecutarPuertaDeAreaTactil([estrecho, conforme])` | Los 4 sabotajes, aplicados y revertidos por separado, dieron rojo en el mismo test (`expected true to be false` / `informe.pasa`). Revertidos uno a uno. |
| 9 | `contraste.ts:225` | `parejas: []` → `["Stryker was here"]` (guarda compartida) | `@s33`/`@s35`/`@s36`: añadido `expect(informe.parejas).toEqual([])` en los tres | Rojo en los tres tests simultáneamente (comparten `ejecutarPuertaDeContrasteParaUso`). Revertido. |
| 10 | `contraste.ts:229` | `parejas.every(...)` → `parejas.some(...)` | `@s29`: nuevo test "un catálogo con una pareja apta y otra no apta suspende la puerta completa" con catálogo mixto (`#77286B`/`#FFFFFF` apta, `#B4C718`/`#FFFFFF` no apta) vía `ejecutarPuertaDeContrasteTextoNormal` | Rojo: `expected true to be false` en `informe.pasa`. Revertido. |
| 11 | `contraste.ts:203` (`evaluarParDeContraste`, NoCoverage) | Sabotaje de comportamiento real: `calcularRatioContraste(par.color, par.fondo)` → `calcularRatioContraste(par.fondo, par.fondo)` (ratio siempre 1, la función deja de calcular el contraste real) | Nuevo test "negro sobre blanco para texto normal: ratio 21 (redondeado) y veredicto aprobado, igual que `@s2`" llamando directamente a `evaluarParDeContraste` | Rojo: `expected 1 to be 21`. Revertido. Confirma que la función, antes sin ningún test, sí compone correctamente `calcularRatioContraste` + `formularVeredictoDePareja` — no era un bug, solo cobertura ausente (Ley 1 retroactiva: se añade el test que debió existir, cero cambio de producción). |

### Verificación de que no queda ninguna sabotaje sin revertir

`grep -rn "Stryker was here" src/lib` → 0 coincidencias tras cerrar los 11
ciclos (los mutantes 5 y 6 comparten un único test reforzado en `@s12`, y los
4 sabotajes del grupo 8 comparten el nuevo test de inventario mixto en
`@s11`: 14 mutantes reales, 11 ciclos de sabotaje distintos).

### Tests nuevos añadidos (resumen)

- `src/lib/accesibilidad-analisis.test.ts`: 0 tests nuevos, 5 aserciones
  añadidas a `@s4` (×2), `@s5` (×1), `@s6` (×1) — 8/8 tests, todos ya
  existentes, reforzados.
- `src/lib/accesibilidad-areaTactil.test.ts`: +2 tests (`@s11`: alto
  insuficiente con ancho suficiente; `@s11`: inventario mixto vía la puerta
  completa) y 3 aserciones añadidas a `@s12` (×2) y `@s15` (×1) — 8→10 tests.
- `src/lib/contraste.test.ts`: +2 tests (`@s29`: catálogo mixto;
  `evaluarParDeContraste`: composición real ratio+veredicto) y 3 aserciones
  añadidas a `@s33`/`@s35`/`@s36` (una cada uno) — 32→34 tests.

### Verificación final de la ronda

- `pnpm exec vitest run src/lib/accesibilidad-analisis.test.ts
  src/lib/accesibilidad-areaTactil.test.ts src/lib/contraste.test.ts` →
  52/52 verde (48 → 52, +4 tests nuevos).
- `node .harness/harness.mjs init` → verde de punta a punta: lint limpio,
  typecheck limpio, **672/672** tests (668 → 672, +4).
- `git diff --stat` / `grep -rn "Stryker was here" src/lib`: ninguna de las
  tres producciones (`accesibilidad-analisis.ts`, `accesibilidad-areaTactil.ts`,
  `contraste.ts`) tiene cambio de producción persistente en esta ronda; todo
  el sabotaje se aplicó y revirtió en memoria de trabajo, uno a la vez,
  confirmado por commit posterior con diff exclusivamente de test.

### Trazabilidad `mutante → test` (para `mutation_tester`, ronda 2 de mutación)

Los 14 huecos de `progress/mutation_accesibilidad.md` (sección "Mutantes
sobrevivientes") quedan, cada uno, con al menos una aserción nueva que lo
detecta (tabla de arriba). Pendiente: `mutation_tester` debe re-ejecutar
Stryker sobre los 3 ficheros (`accesibilidad-analisis.ts`,
`accesibilidad-areaTactil.ts`, `contraste.ts`) para confirmar 100% sobre
mutantes no equivalentes (el único equivalente ya excluido,
`contraste.ts:36`, no se tocó en esta ronda).
