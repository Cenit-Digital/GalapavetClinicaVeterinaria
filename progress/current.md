# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso:** reserva_chat (id 7) — arrancando TDD.
- **Fase:** `tdd_craftsman` → `judge` → `mutation_tester` (umbral 1.0)
- **Entregables de `equipo`:** `src/data/equipo.ts` (catálogo,
  `docs/datos-galapavet.md` §4), `src/components/Equipo-logica.ts`
  (`rotuloBoton`, `tieneFormacion`, `profesionalesValidos`),
  `src/components/Equipo.tsx`. `pnpm run test` 137/137 en verde. Ronda 1 del
  `judge` rechazada: @s7 usaba `toHaveTextContent` (subcadena) en vez de
  igualdad exacta para su cláusula "se limita a" — el hueco más peligroso de
  la ronda porque `.tsx` queda fuera del glob de Stryker, así que solo el
  `judge` podía cazarlo. Corregido y cerrado en ronda 2, verificado con
  sabotaje manual.
- **Estado:** `tokens_marca` (id 1), `datos_negocio` (id 2),
  `cabecera_y_navegacion` (id 3), `hero` (id 4), `servicios` (id 5) y
  `equipo` (id 6) cerradas: `done`. Ver bitácora abajo.
- **Entregables de `datos_negocio`:** `src/lib/site.ts` (fuente única),
  `src/lib/telefono.ts` (normalización/derivación de teléfono, falla
  cerrado), `src/lib/puertaTelefonoHardcodeado.ts` (puerta
  anti-teléfono-hardcodeado), `src/lib/site.reimportacion.test.ts` (test
  dedicado para que Stryker atribuya cobertura a los mutantes estáticos de
  `site.ts:10-12`). `pnpm run test` (58/58), `pnpm run lint && pnpm run
  typecheck` y `node .harness/harness.mjs init` en verde.

### 18/08/2026 — tokens_marca (id 1): DONE

`judge`: **APROBADO**. 23/23 escenarios con test concreto verificado uno a
uno contra los ficheros reales (no solo contra la bitácora del
`tdd_craftsman`); disciplina TDD sólida con 2 desviaciones menores
detectadas y remediadas por el propio `tdd_craftsman` (guardas de vacuidad
sin test rojo propio en el instante, verificadas retroactivamente; una
sobre-implementación revertida en refactor). C1-C6 de `CHECKPOINTS.md` en
verde (C5 anotado como pendiente de cierre de sesión, no bloqueante a mitad
de sesión). Detalle en `progress/judge_tokens_marca.md`.

`mutation_tester`: **APROBADO**, 100% sobre mutantes no equivalentes
(129/129; 130 mutantes totales, 1 equivalente genuino excluido con
justificación explícita). Medición OFICIAL independiente (no se confió en
la cifra del `tdd_craftsman`): Stryker vuelto a correr desde cero fichero a
fichero, `--concurrency 1`, 0 timeouts en las tres corridas (columna
leída antes que el score, patrón `informe-de-mutacion-con-timeouts-miente`).
El único superviviente (`src/lib/contraste.ts:36`, `canal <= UMBRAL` →
`canal < UMBRAL`) se verificó computacionalmente sobre los 256 valores
posibles de byte: 0 diferencias de comportamiento — equivalente genuino, no
un hueco de test. Nota de entorno: `node .harness/harness.mjs mutate
<target>` no resuelve el plugin `@stryker-mutator/vitest-runner` en esta
máquina; workaround aplicado por ambos agentes: `pnpm exec stryker run
--mutate <fichero> --plugins @stryker-mutator/vitest-runner`, una corrida a
la vez. Queda para una sesión futura investigar por qué el glob por defecto
de Stryker no resuelve el plugin (no bloquea: el workaround es reproducible
y no modifica configuración). Detalle completo en
`progress/mutation_tokens_marca.md`.

Marcado `done` en `feature_list.json` por el `craftsman_lead`, tras leer
ambos informes completos (ninguna de las dos puertas se dio por buena solo
por el resumen devuelto). Arranca `datos_negocio` (id 2) — única feature
`in_progress`, respetando `one_feature_at_a_time`.

Fix previo aplicado antes del primer test rojo (fuera de `src/lib`, sin cambio
de comportamiento): `src/test/setup.ts:75-82` — `Element.prototype.scrollTo` /
`scrollBy` usaban `vi.fn<Element['scrollTo']>()`, que TypeScript rechaza
(TS2322, overloads). Sustituido por `vi.fn<(x?: number | ScrollToOptions, y?:
number) => void>() as unknown as Element['scrollTo']` — tipa el mock con una
firma no sobrecargada (satisface la regla oxlint `require-mock-type-parameters`)
y castea a través de `unknown` hacia el tipo real. `pnpm run lint && pnpm run
typecheck` verde antes de escribir ningún test.

## Contexto de arranque

- `init` del arnés: **verde** (exit 0). Nota: en esta máquina no hay `pwsh`; el
  motor se invoca con `node .harness/harness.mjs <comando>`.
- Memoria organizacional sincronizada: **20 patrones** en `.memoria-cache/`.
  Aplicables a esta sesión y ya leídos:
  - `arquitectura/dato-de-negocio-en-fuente-unica-canonica` → `src/lib/site.ts`.
  - `arquitectura/logica-de-decision-en-modulo-puro-no-en-el-jsx`.
  - `arquitectura/logica-pre-pintado-inline-se-espeja-en-gemelo-puro-testeable`
    → aplica al selector de paleta (`data-tema` + `localStorage`).
  - `testing/estado-condicional-en-atributo-aria-no-en-clase-css`.
  - `testing/doble-de-test-anclado-al-literal-no-al-simbolo`.
  - `testing/informe-de-mutacion-con-timeouts-miente` → leer `# timeout` **antes**
    del score; `--concurrency 1`; jamás dos Stryker a la vez.
  - `testing/revision-adversarial-del-contrato-antes-de-la-puerta-humana`
    → obligatoria **antes** de la puerta humana de esta sesión.
  - `testing/verde-por-vacuidad-en-puerta-de-verificacion`.
  - `testing/verificacion-en-vivo-en-navegador-real-caza-el-verde-que-no-funciona`.
  - `animacion/estado-base-visible-ssg-reduced-motion`.
  - `arquitectura/herencia-del-repo-base-es-deuda-muerta-hasta-que-un-uso-la-justifica`
    → **clave aquí**: los 13 `.feature` heredados son exactamente eso.

## Bitácora

### 17/08/2026 — Hallazgo bloqueante: el contrato heredado no es de este cliente

Los 13 `.feature` de `features/` (68 escenarios) estaban destilados del prototipo
de Claude Design **«Veterinaria La Sierra»**, una clínica **ficticia** en
Miraflores de la Sierra. El repo, el logo (`logo galapavet.webp`) y el `.docx`
de prospección son de **Galapavet**, clínica **real** en Galapagar.

El `README_TRASPASO.md` de la sesión anterior ya había levantado la mano sobre
esta discrepancia y la dejó explícitamente pendiente de confirmar.

Implementar el contrato tal cual habría publicado, sobre un negocio real:
teléfonos de terceros en enlaces `tel:`, un número de registro sanitario
fabricado, una valoración de Google fabricada y un servicio de urgencias 24 h
que la clínica **no presta** (cierra domingos).

**Resuelto con el humano (4 decisiones):**

1. **Marca y datos → Galapavet real.** Se re-destilan los `.feature` con los
   datos verificados. Lo no verificable se elimina; nada se inventa.
2. **Urgencias → se elimina el reclamo «24 h».** Además, por indicación
   expresa, **se suprimen dos elementos completos**: la barra superior roja de
   urgencias y el bloque rojo destacado «Urgencias 24 h / Llamar ahora» del
   panel de contacto. El teléfono de urgencias fuera de horario sí se conserva
   dentro de los datos de contacto, con su rótulo real.
3. **Alcance → landing + Blog + Campañas + Tienda.** Las 3 subpáginas no tenían
   contrato: hay que destilarlas de sus `.dc.html` y pasarlas por la puerta.
4. **Formulario de contacto → demo sin backend**, con aviso explícito de que no
   se envía nada a ningún servidor (simetría con el chat de reserva).

### 17/08/2026 — Verificación de datos del cliente

Escrito `docs/datos-galapavet.md` con todo lo verificado y **su fuente**.
Dos alucinaciones de una extracción automática cazadas y descartadas:
`info@galapavet.com` y los perfiles de redes sociales — **no existen** en la web
del cliente (comprobado en el árbol de enlaces del navegador real).

Dirección confirmada por dos fuentes independientes (ficha de Google embebida en
la propia web del cliente + Páginas Amarillas):
**Carretera de Torrelodones, 11 · 28260 Galapagar, Madrid**.

Paleta real extraída por muestreo de píxeles del logo:
morado `#77286B` · lima `#B4C718` · verde profundo `#48704B`.

### 18/08/2026 — Revisión adversarial del contrato completa, con verificación independiente

Repetida la revisión adversarial (el intento previo murió por límite de sesión con
24/27 agentes caídos: verde por vacuidad, no verde real). Esta vez: **15 agentes
vivos de 15** (5 grupos × 3 lentes: satisfacibilidad/mensurabilidad, fidelidad a
la fuente primaria, mutación/verde-por-vacuidad) sobre los 19 `.feature` / 387
escenarios. Informes completos en `progress/revision/L{1,2,3}_G{1..5}.md`.

**Incidente de integridad de datos, detectado y corregido:** al reanudar el
primer intento (`resumeFromRunId`), 4 de los 15 agentes se re-ejecutaron en vez
de servirse de caché, y sus resultados degradaron (p.ej. 12 hallazgos → 1) y
sobrescribieron en disco la versión rica de la primera ejecución, porque el
propio agente tiene herramienta `Write` sobre la misma ruta que usa el
orquestador. Resuelto quedándose con la **primera aparición** de cada clave en
`journal.jsonl` (fuente de verdad), no con "última escritura gana". Anotado
como aviso para cualquier reanudación futura de un workflow con agentes que
escriben a disco.

133 hallazgos alegados (+ 3 medidos directamente por el craftsman_lead sin
delegar, en `progress/revision/L0_lead_medido.md`). Siguiendo el patrón
`revision-adversarial-del-contrato-antes-de-la-puerta-humana`: **verificación
independiente** con 19 agentes (uno por fichero `.feature`), instruidos a
REFUTAR antes de confirmar, releyendo cada cita contra la fuente primaria.

**Resultado: 86 CONFIRMADOS (18 bloqueantes · 61 graves · 7 menores), 42
refutados.** Consolidado en `progress/revision/CONFIRMADOS.md`; detalle por
fichero en `progress/revision/VEREDICTO_<fichero>.md`.

Uno de los 3 hallazgos propios del craftsman_lead (`wa.me` como cita fabricada)
**fue refutado** por el verificador de `datos_negocio.feature`: es un PENDIENTE
de formato explícitamente acotado y coordinado con `reserva_chat.feature`, no
una cita fabricada. Corregido en la síntesis final.

**Clústeres sistémicos entre los 18 bloqueantes** (no son 18 defectos sueltos,
son ~4 patrones repetidos):

1. **Imposible de medir en jsdom** (6 escenarios, 3 ficheros): `accesibilidad.feature`
   @s2 (axe con target-size WCAG 2.2 AA), @s17 (foco tapado/dentro del viewport),
   @s18 (contraste de píxeles renderizados), @s19 (animación en curso);
   `informacion_contacto.feature` @s9 (tipografía, con `test.css:false`) y @s10
   (carga diferida del mapa: jsdom nunca dispara la petición, `IntersectionObserver`
   inerte en `src/test/setup.ts`); `galeria.feature` @s9/@s10 (`scrollLeft` físico).
   **Decisión de arquitectura de test, no una errata**: o se reescriben como lógica
   pura consultable, o se asume que esas cláusulas se verifican fuera de Vitest.
2. **Verde por vacuidad sin guarda de conteo**: `pagina_tienda` @s5, `pagina_blog`
   @s27, `accesibilidad` @s30.
3. **Mutante inmortal / frontera nunca probada exacta**: `pagina_blog` @s22 y
   Background/@s13, `galeria` (todo el catálogo vía doble, nunca el real),
   `accesibilidad` @s32, `tokens_marca` @s16.
4. **`pagina_tienda` fabrica ~60 importes en euros para el catálogo de demo**,
   violando la Decisión 1(b) de `project-spec.md` ("sin precios ni credenciales
   fabricados") y contradiciendo `docs/datos-galapavet.md` §6 (precios
   pendientes del cliente). Es el hallazgo de mayor impacto de negocio de toda
   la revisión.
5. **`accesibilidad.feature` no exige que su lógica viva en `src/lib` /
   `*-logica.ts`**: bajo `stryker.config.json` (mutate limitado a esos globs),
   la puerta transversal de cierre del proyecto podría certificar 100% de
   mutación sobre superficie vacía.

**Pendiente antes de reparar:** el humano decide sobre 4 puntos de diseño
(no son erratas mecánicas): (a) estrategia de test para lo no medible en jsdom,
(b) qué hacer con los precios fabricados de la tienda, (c) alcance de SEO para
las vistas de detalle (hallazgo propio `H-LEAD-3`, sin verificar por pares:
`accesibilidad` audita 6 páginas, `seo_estructura` solo pide metadatos a 4),
(d) confirmar/descartar el matiz de WhatsApp en `reserva_chat.feature`.
Después: reparación mecánica del resto vía `gherkin_author`, y la puerta
humana sobre el contrato ya reparado.

### 18/08/2026 — Las 4 decisiones de diseño, resueltas

Registradas como Decisiones 11-14 en `project-spec.md`:

1. **Cláusulas no medibles en jsdom → navegador real.** El proyecto dispone de
   la extensión Claude in Chrome / skill `browser-automation`; se usa como
   método de verificación explícito y declarado (fuera del gate de
   Vitest/Stryker) para lo que jsdom no puede medir (contraste de píxeles
   renderizados, geometría de foco, target-size de axe con layout real,
   animación CSS, origen real de hoja de estilo, petición diferida real).
   Cuando exista vía de reformular como lógica pura, esa sigue siendo
   preferente.
2. **Precios de `pagina_tienda` → se quedan, pero con rótulo inequívoco de
   demo** ("precio de ejemplo, no real"), mismo patrón que el aviso de
   `campanas_portada.feature:108`. Es contenido editorial (Decisión 1(b)),
   campo distinto del precio real pendiente §9 que protege `pagina_campanas`
   prohibiendo «€» — no hay que igualar ambas reglas.
3. **`seo_estructura` → se amplía de 4 a 6 páginas**, incluidas las vistas de
   detalle de campaña y de artículo de blog.
4. **WhatsApp en `reserva_chat` → confirmado**, pero el contrato debe separar
   "¿usa WhatsApp?" de "¿cuál es el número del canal?" — no puede asumirse
   que sea el mismo que el de voz (685 34 31 49) sin verificarlo.

**Siguiente paso:** reparación de los 17 ficheros con hallazgos CONFIRMADOS
(de 19; `cabecera_y_navegacion.feature` y `formulario_contacto.feature` no
tuvieron ninguno) vía `gherkin_author`, uno por fichero, seguida de una
verificación de que cada CONFIRMADO quedó atendido. Lanzado como workflow —
ver el resultado en la próxima entrada de esta bitácora.

### 18/08/2026 — Reparación del contrato completa, contrato listo para la puerta humana

Workflow de reparación (17 `gherkin_author` + 17 verificadores de solo
lectura, 34 agentes) completo: **14/17 ficheros OK** a la primera. 3
necesitaron una segunda pasada porque la verificación cazó problemas reales
que la reparación introdujo:

- `pagina_campanas.feature` y `campanas_portada.feature`: al corregir el aviso
  de demo de `pagina_campanas` ("no publica" → "no ha confirmado ninguna
  campaña", más fiel a `docs/datos-galapavet.md` §7), quedó una divergencia de
  copy con su hermano `campanas_portada.feature`, que no se había tocado.
  Además `campanas_portada.feature` perdió cobertura real: el nuevo `@s18`
  cerraba el plano de render solo para el eje de precio inválido, no para el
  de vigencia inválida, pese a que el resumen de la reparación afirmaba lo
  contrario.
- `selector_paleta.feature`: cerró la referencia circular con
  `tokens_marca.feature` solo desde su lado, dejando una contradicción
  literal (cada fichero afirmaba que el otro era el dueño de los tokens
  exactos de la variante "noche").

Las 3 se corrigieron con 2 agentes `gherkin_author` de seguimiento (uno para
el par campañas, otro para `tokens_marca.feature`), instruidos con el
diagnóstico exacto ya hecho. Verificado a mano tras la corrección: el copy ya
coincide entre los dos ficheros de campañas, `@s21` cierra el hueco de
vigencia, y `tokens_marca.feature` ya no remite la decisión de vuelta a
`selector_paleta.feature`.

**Los 19 `.feature` (`features/`) quedan listos para la puerta humana de
aprobación.** Siguiente paso: que el humano revise el contrato reparado y lo
apruebe (o pida cambios) antes de que arranque el TDD de la primera feature
(`tokens_marca`, cimiento del resto).

### 18/08/2026 — Puerta humana superada, arranca el TDD

El humano aprobó las 19 features tal cual quedaron reparadas. Las 19 pasan de
`pending` a `spec_ready` en `feature_list.json`; `tokens_marca` (id 1,
cimiento) pasa a `in_progress` — respetando la regla dura
`one_feature_at_a_time` de `harness.config.json`.

`node .harness/harness.mjs init` (no hay `pwsh` en esta máquina) encontró 2
problemas antes de tocar código:

1. **`tsconfig.app.json`** usaba `baseUrl` deprecado (TS5101) bajo
   `moduleResolution: "bundler"`. Corregido yo mismo (fichero de
   configuración, fuera de `src/` y de los tests): se quita `baseUrl`, los
   `paths` se resuelven igual relativos al propio fichero.
2. **`src/test/setup.ts:78-79`** tiene un error de tipos preexistente:
   `vi.fn<Element['scrollTo']>()` no tipa bien un método con overloads. Es un
   fix de tipos puro, sin cambio de comportamiento — pero vive dentro de
   `src/`, así que **no lo toco yo**: se lo encargo a `tdd_craftsman` como
   paso previo a su primer test rojo de `tokens_marca`.

`pnpm run test` falla con "No test files found" — esperable, es el estado
antes de escribir el primer test de la primera feature; lo resuelve el propio
ciclo TDD, no un fix aparte.

Lanzado como workflow: `tdd_craftsman` → `judge` → `mutation_tester` para
`tokens_marca`, con reintentos acotados si el judge rechaza o si la mutación
no alcanza el umbral (`1.0` en `harness.config.json`). Yo marco `done` en
`feature_list.json` solo si ambas puertas quedan superadas — ningún subagente
lo hace por su cuenta.

### 19/08/2026 — datos_negocio (id 2): DONE

`judge`: **APROBADO** (segunda revisión, tras la ronda de refuerzo de
mutación). Releídos los 21 escenarios y verificados específicamente los 5
tests nuevos de esta ronda uno a uno contra el código real: ninguno vacío,
ninguno anclado a la constante de producción reimportada en vez del literal
escrito a mano. Cero producción nueva (Ley 3 respetada: los 9 mutantes eran
huecos de aserción, no defectos de comportamiento). `bin/harness init` en
verde, 58/58 tests. Detalle en `progress/judge_datos_negocio.md`.

`mutation_tester`: **APROBADO**, 100% sobre mutantes no equivalentes
(95/95; 96 mutantes totales, 1 equivalente ya verificado en la ronda
anterior y no retocado — `telefono.ts:13`, sin cambio de comportamiento
observable para ninguna entrada, verificado en su momento con 100 000
cadenas aleatorias). Medición OFICIAL independiente repetida desde cero,
fichero a fichero, `--concurrency 1`, 0 timeouts. Punto crítico resuelto con
evidencia cruda de la herramienta (no solo verificación manual): los 3
mutantes estáticos de `site.ts:10-12` (constantes de teléfono vaciadas)
pasaron de `testsCompleted: 0` a `testsCompleted: 1`, atribuidos al nuevo
`src/lib/site.reimportacion.test.ts` (lee `mutation.json` directamente,
confirma `coveredBy`/`killedBy` apuntando al test correcto) — la limitación
de atribución de cobertura del plugin de Stryker para mutantes estáticos que
lanzan en tiempo de import quedó resuelta sin declarar ninguna excepción de
umbral en `docs/mutation-testing.md`. Detalle completo en
`progress/mutation_datos_negocio.md`.

Primera medición de mutación (antes de esta ronda) había dado **FAIL**:
86/96 = 89.58%, 9 mutantes supervivientes reales. Corregido por
`tdd_craftsman` con 6 ciclos de refuerzo (R1-R6, ver
`progress/tdd_datos_negocio.md`), cada uno con el mutante exacto aplicado a
mano, ROJO confirmado, revertido a VERDE — sin tocar ninguno de los tres
módulos de producción. Lanzado como workflow acotado a 3 rondas
(`tdd_craftsman` → `judge` → `mutation_tester`, con reintento si alguna
puerta rechaza); cerró en la ronda 1.

Marcado `done` en `feature_list.json` por el `craftsman_lead`, tras leer
`progress/judge_datos_negocio.md` y `progress/mutation_datos_negocio.md`
completos (ninguna de las dos puertas se dio por buena solo por el resumen
de una línea que devuelve el subagente). Arranca `cabecera_y_navegacion`
(id 3) — única feature `in_progress`, respetando `one_feature_at_a_time`.

### 19/08/2026 — cabecera_y_navegacion (id 3): DONE

Primer componente del proyecto (`src/components/Cabecera.tsx` +
`Cabecera-logica.ts` + `src/data/navegacion.ts`). Ciclo con 3 rondas hasta
cerrar, cada rechazo con hallazgo real, no ruido:

- **Ronda 1** (`tdd_craftsman` verde, 15/15 escenarios): `judge` dio
  **CHANGES_REQUESTED** — @s11 ("ensanchar la ventana con el menú abierto
  no deja el panel colgado") solo verificaba 2 de sus 3 cláusulas. El
  `judge` lo confirmó mutando `Cabecera.tsx` a mano y viendo los 23 tests
  seguir en verde con el bug reintroducido: hueco real, no burocracia.
- **Ronda 2**: `tdd_craftsman` cierra @s11 (solo test, cero producción
  tocada). `judge` **APROBADO**. `mutation_tester` mide por primera vez:
  **FAIL**, 14/16 = 87.50% sobre no equivalentes — 2 huecos reales en
  `esAncla` (`Cabecera-logica.ts:33-34`). Verificado con evidencia fuerte,
  no solo con el estado final del test: leyó el código fuente de jsdom y
  confirmó con un script empírico que la navegación nativa de ancla dispara
  `hashchange` y la ruta `pushState` no, una diferencia observable real que
  ningún test miraba. El tercer superviviente (línea 18, `esMovil`, `> 0`
  vs `>= 0`) se verificó como equivalente genuino sobre el dominio completo
  de `number` (incluido `NaN`).
- **Ronda 3**: `tdd_craftsman` añade 2 tests directos de unidad sobre
  `esAncla`, sin tocar producción; verificado matando los 2 mutantes
  exactos antes de revertir. `judge` **APROBADO**, reproduciendo él mismo
  ambos mutantes de forma independiente en vez de fiarse del relato.
  `mutation_tester` re-mide: **PASS**, 16/16 = 100% sobre no equivalentes
  (el mutante de la línea 18 se cita sin re-derivar, código sin cambios
  desde la ronda anterior). `pnpm run test` 84/84.

Marcado `done` en `feature_list.json` por el `craftsman_lead`, tras leer
`progress/judge_cabecera_y_navegacion.md` y
`progress/mutation_cabecera_y_navegacion.md` completos. Arranca `hero`
(id 4) — única feature `in_progress`, respetando `one_feature_at_a_time`.

Fix propio (fuera de `src/`, sin cambio de comportamiento): `bin/harness.ps1`
usaba `Join-Path $PSScriptRoot '..' '.harness' 'harness.mjs'` con más de dos
segmentos, sintaxis que PowerShell 7+ acepta pero que PowerShell 5.1 (esta
máquina) rechaza (`Join-Path` de 5.1 solo admite `-Path`/`-ChildPath`).
Encadenados 3 `Join-Path` en su lugar. Verificado: `bin\harness.ps1 status`
corre limpio ahora.

### 19/08/2026 — hero (id 4): DONE

Cerrada en una sola ronda. `tdd_craftsman`: 12/13 escenarios por TDD
estricto (`src/components/Hero.tsx`, reutiliza `enlaceLlamada`/`datosNegocio`
de `datos_negocio` sin reimplementar nada); @s14 fuera del gate de Vitest
por Decisión 11 (origen real de hoja de estilo, se verifica en navegador
real), declarado explícitamente en el propio `.feature`, no una laguna.

`judge`: **APROBADO**. No se fió del relato — hizo verificación
independiente propia con mutación manual sobre los 3 puntos de mayor
riesgo (texto de reputación/urgencias inventado, guardas de ausencia de
teléfono/horario, `enlaceLlamada` fallando cerrado sin `try/catch`),
confirmando en cada caso exactamente los tests que debían romperse y
ninguno más, revirtiendo byte a byte. `bin\harness.ps1 init` verde, 96/96.

`mutation_tester`: **APROBADO**, 100% (16/16). Hallazgo propio relevante:
tanto `tdd_craftsman` como `judge` habían asumido "superficie 0 mordible"
para `Hero.tsx` por quedar fuera del glob por defecto de
`stryker.config.json` (los `.tsx` no se mutan por defecto). El
`mutation_tester` no dio esa premisa por buena y corrió igualmente el
comando `--mutate src/components/Hero.tsx` (que sobreescribe el glob) —
Stryker sí generó 16 mutantes reales sobre lógica JS/TS legítima (textos,
guardas, `.map` del horario), los 16 murieron. `src/lib/telefono.ts` /
`site.ts` no se tocaron en esta sesión (confirmado por fecha de
modificación) y conservan su medición oficial de `datos_negocio` (100%).

Marcado `done` en `feature_list.json` por el `craftsman_lead`, tras leer
`progress/judge_hero.md` y `progress/mutation_hero.md` completos. Arranca
`servicios` (id 5) — única feature `in_progress`, respetando
`one_feature_at_a_time`.

### 19/08/2026 — servicios (id 5): DONE

Cerrada en 2 rondas. `tdd_craftsman` ronda 1: 19/19 escenarios,
`src/data/servicios.ts` + `Servicios-logica.ts` (4 funciones puras) +
`Servicios.tsx`. `judge` ronda 1: **CHANGES_REQUESTED** — hallazgo real de
Ley 1 (producción sin test que la pida): `Servicios.tsx:49-50` traía
`id="servicios"` / `aria-labelledby="servicios-titulo"` / `id="servicios-titulo"`
sin que ningún `@s` ni test los exigiera. Verificado por el propio `judge`
con mutación manual (quitarlos a mano → 19/19 seguían en verde) antes de
rechazar, citando el precedente del propio proyecto (`Hero.tsx` no añade
`id` sin test; `Cabecera.tsx` sí prueba explícitamente su literal de
anclaje `href="#inicio"`).

`tdd_craftsman` ronda 2: retira los 3 atributos, cero producción nueva.
`judge` ronda 2: **APROBADO**, con `grep` recursivo sobre todo `src/`
confirmando que no queda ningún residuo del hallazgo de ronda 1.
`mutation_tester`: **APROBADO**, 100% (21/21) sobre
`src/components/Servicios-logica.ts` (único fichero mordible; `Servicios.tsx`
fuera del glob por diseño, mismo criterio que `Hero.tsx`/`Cabecera.tsx`).
`pnpm run test` 121/121.

Nota para el futuro, no bloqueante: el enlace `href="#servicios"` de
`src/data/navegacion.ts:16` (feature `cabecera_y_navegacion`) sigue sin
destino con `id` en el DOM — pendiente legítimo de una feature de ensamblado
de página con su propio test, no un defecto de `servicios`.

Marcado `done` en `feature_list.json` por el `craftsman_lead`, tras leer
`progress/judge_servicios.md` y `progress/mutation_servicios.md` completos.
Arranca `equipo` (id 6) — única feature `in_progress`, respetando
`one_feature_at_a_time`.

### 19/08/2026 — equipo (id 6): DONE

Cerrada en 2 rondas. `tdd_craftsman` ronda 1: 11/11 escenarios,
`src/data/equipo.ts` + `Equipo-logica.ts` (3 funciones puras) +
`Equipo.tsx`. `judge` ronda 1: **CHANGES_REQUESTED** — hallazgo de alto
riesgo, no cosmético: `Equipo.test.tsx:130` verificaba la cláusula "se
limita a" de @s7 (la tarjeta de un profesional sin formación no muestra
nada más) con `toHaveTextContent('...')`, que hace coincidencia de
subcadena, no igualdad — pasaría igual si se colara contenido inventado.
El `judge` señaló que era la única puerta capaz de cazarlo, porque
`stryker.config.json` excluye `.tsx` del mutador.

`tdd_craftsman` ronda 2: cambia esa única línea a igualdad exacta sobre
`textContent`, cero producción tocada. `judge` ronda 2: **APROBADO**,
repitió el protocolo completo desde cero (no solo el punto corregido) y
verificó el cierre con sabotaje manual (insertó contenido extra en la
tarjeta, confirmó que exactamente el test de @s7 se ponía rojo, revirtió).
`mutation_tester`: **APROBADO**, 100% (17/17) sobre `Equipo-logica.ts`,
confirmado leyendo `mutation.json` crudo. Nota honesta del `mutation_tester`:
no pudo descartar por inspección de procesos que hubiera una corrida de
Stryker concurrente (el sandbox bloqueó `Get-CimInstance`/`wmic`), pero
razonó con la huella de memoria y 0 timeouts que la corrida era válida —
documentado como reserva, no ocultado. `pnpm run test` 137/137.

Marcado `done` en `feature_list.json` por el `craftsman_lead`, tras leer
`progress/judge_equipo.md` y `progress/mutation_equipo.md` completos.
Arranca `reserva_chat` (id 7) — única feature `in_progress`, respetando
`one_feature_at_a_time`.
