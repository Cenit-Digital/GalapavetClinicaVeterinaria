# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **Feature en curso:** seo_estructura (id 15) — pendiente de arrancar
  `tdd_craftsman` ronda 1. Ahora sí tiene páginas reales donde apoyarse
  gracias al cierre de `ensamblaje_landing`.
- **Fase:** `tdd_craftsman` → `judge` → `mutation_tester` (umbral 1.0)
- **`ensamblaje_landing` (id 20): DONE.** 15/15 escenarios, 2 rondas. El
  sitio compila y arranca de verdad por primera vez en el proyecto.
  Entregables: `src/main.tsx` (excepción nombrada si falta `#root`),
  `src/App.tsx` (shell común: `Cabecera` con ancho real y vivo de
  `window.innerWidth`/`resize`, `BrowserRouter`, rutas de subpágina
  derivadas de `ENLACES_NAVEGACION` hacia el catch-all), `src/App-logica.ts`
  (extraído en la ronda 2 por una restricción real de oxlint
  `react-refresh/only-export-components`, no por preferencia —
  `RUTAS_DE_SUBPAGINA`), `src/pages/Landing.tsx` (las 8 secciones en el
  orden de la Decisión 16, con los 7 `id` de ancla asignados por este
  fichero, nunca por los 12 componentes ya `done`, que no se tocaron —
  confirmado con `git diff --stat` vacío sobre `src/components/`),
  `src/pages/PaginaNoEncontrada.tsx`. `judge` ronda 1: **APROBADO**.
  `mutation_tester` ronda 1: **FAIL** 66.67% (18/27, 9 supervivientes: 1 en
  `main.tsx`, 8 en `App.tsx` — limpieza de listener de `resize`, derivación
  de rutas, generación de `<Route>` por subpágina). `tdd_craftsman` ronda de
  refuerzo: mató 8/9 con tests dirigidos (incluida la extracción a
  `App-logica.ts`) y dejó 1 documentado como candidato a equivalente sin
  auto-excluirlo. `judge` ronda 2: **APROBADO**, reprodujo ella misma
  `pnpm run build` + `pnpm run preview` + `curl` reales en su propia sesión
  de revisión (no solo releyó la bitácora). `mutation_tester` ronda 2:
  **PASS** 26/26 = 100% sobre no equivalentes (26/27 en bruto) — el
  superviviente (`App.tsx:29:6`, array de dependencias del `useEffect` de
  resize) verificado como equivalente genuino leyendo el código fuente real
  de `areHookInputsEqual` en `node_modules/react-dom`, no solo argumentado.
  Yo (craftsman_lead) repetí de forma independiente `node .harness/harness.mjs
  init` (343/343 verde), `pnpm run build` (éxito, bundle generado) y
  `pnpm run preview` + `curl` reales sobre `/`, `/campanas`, `/blog`,
  `/tienda` y `/esto-no-existe` (los 5, HTTP 200; el cuerpo de `/` contiene
  de verdad el script anti-FOUC de `selector_paleta`, confirmando que todo
  está realmente ensamblado) antes de marcar `done`. Bitácora ciclo a ciclo
  completa, con trazabilidad @s→test, en `progress/tdd_ensamblaje_landing.md`.

- **RESUELTA (21/08/2026): la pausa de la cadena `spec_ready` que bloqueaba
  `seo_estructura` (id 15).** `src/main.tsx` NO EXISTÍA (`index.html`
  referenciaba `/src/main.tsx`, roto). No había `App.tsx` ni enrutado:
  ninguno de los 14 componentes `done` de entonces (Cabecera, Hero,
  Servicios, Equipo, ReservaChat, Galeria, CampanasPortada,
  InformacionContacto, FormularioContacto, Faq, PieDePagina, SelectorPaleta)
  estaba ensamblado en una página real — `pnpm run build`/`pnpm run dev`
  habrían fallado. Ninguno de los 19 `.feature` cubría este ensamblaje
  (confirmado por grep); ya lo había señalado `servicios` al cerrar
  ("pendiente legítimo de una feature de ensamblado de página con su propio
  test") pero nunca se convirtió en feature real. `seo_estructura` exige
  las "seis páginas publicadas" (inicio, campañas, ficha de campaña, blog,
  artículo de blog, tienda) — imposible de satisfacer sin este ensamblaje
  Y sin `pagina_campanas`/`pagina_blog`/`pagina_tienda` (16-18, aún
  `spec_ready`). Presentado al humano con 3 opciones (spec+Gherkin nuevos /
  reordenar asumiendo que 16-18 incluyen el ensamblaje / spike desechable
  para ver qué hay). **Elegida: spec + Gherkin nuevos primero**, respetando
  la disciplina SDD del proyecto (nunca se salta la puerta humana).
  `spec_partner` destiló 8 decisiones nuevas (15-22) en `project-spec.md`,
  todas trazadas a contratos ya aprobados, verificadas por mí contra los
  ficheros fuente antes de aceptarlas. `gherkin_author` produjo
  `features/ensamblaje_landing.feature` (15 escenarios); el humano lo aprobó
  tal cual, incluido el orden de trabajo Equipo→ReservaChat→Galería con una
  sola fuente. Pipeline completo hasta `done` (ver bullet de arriba). Pausa
  cerrada — `seo_estructura` retoma como feature en curso.
- **`selector_paleta` (id 14): DONE.** 16 escenarios, 2 rondas. Ronda 1:
  `tdd_craftsman` completo desde cero — `src/data/variantesPaleta.ts`
  (catálogo de las 4 variantes reales de marca), `SelectorPaleta-logica.ts`
  (`resolverVarianteInicial` — gemelo puro del script anti-destello;
  `leerVarianteAlmacenada`/`guardarVarianteElegida` — envoltorios
  `try/catch` de `localStorage`), `SelectorPaleta.tsx` (solo cablea),
  `index.html` (script inline anti-FOUC en `<head>`, espejo literal escrito
  a mano de `resolverVarianteInicial`, precede al `<script type="module">`).
  `judge` ronda 1: **CHANGES_REQUESTED** — el campo `nota` del catálogo era
  producción sin ningún `@s` que lo exigiera (Ley 1). `tdd_craftsman` ronda
  2: lo retira sin ciclo Rojo nuevo (remediación válida, razonada). `judge`
  ronda 2: **APROBADO**, repitió el protocolo completo desde cero, no solo
  el punto corregido. `mutation_tester`: **PASS**, 16/17 = 94.12% en bruto,
  1 superviviente (`stored !== null` → `true`) documentado como equivalente
  genuino (verificado matemática y empíricamente: `idsDelCatalogo` nunca
  produce `null`, así que `includes(null)` siempre es `false`) — 100% sobre
  mutantes no equivalentes. No se inventó ningún token CSS para la variante
  "noche": ese PENDIENTE sigue siendo exclusivo de `tokens_marca`. `bin/harness
  init` verde: 310/310. Yo (craftsman_lead) releí `progress/tdd_selector_paleta.md`,
  `progress/judge_selector_paleta.md` y `progress/mutation_selector_paleta.md`
  completos y repetí `node .harness/harness.mjs init` de forma independiente
  antes de marcar `done`.
- **`pie_de_pagina` (id 13): DONE.** 15/15 escenarios por TDD estricto
  desde cero, ronda única (judge y mutación aprobados a la primera).
  Entregables: `src/data/pieDePaginaEnlaces.ts`
  (`ENLACES_CLINICA`/`ENLACES_CONTENIDO`), `src/data/paginasLegales.ts`
  (`PAGINAS_LEGALES`), `src/components/PieDePagina-logica.ts`
  (`construirEnlacesLegales`, `textoCopyright`, `construirEnlacesContacto`,
  reutiliza `construirEnlaceTelefono` de `InformacionContacto-logica.ts`),
  `src/components/PieDePagina.tsx` (solo cablea). 4 escenarios "verde a la
  primera" (@s6, @s7, @s8, @s14) verificados con sabotaje manual/grep
  independiente. `textoCopyright` recibe la fecha como parámetro (nunca
  `Date.now()` implícito en la lógica pura; el borde de sistema en
  `PieDePagina.tsx` inyecta `new Date()` por defecto). @s15 depende del
  mismo `enlaceLlamada` que falla cerrado en el resto del proyecto, sin
  duplicar la validación. `judge`: **APROBADO** (15/15 escenarios, 1 nota
  cosmética no bloqueante: el Given de @s15 en el `.feature` describe "91
  851 13" como de "ocho dígitos" cuando tiene 7 — pendiente de
  `gherkin_author` en una pasada futura, no afecta cobertura).
  `mutation_tester`: **PASS** 21/21 = 100% sobre `PieDePagina-logica.ts`
  (único fichero mordible de la feature), cero supervivientes, verificado
  contra `mutation.json` crudo. `bin/harness init` verde: 294/294 tests. Yo
  (craftsman_lead) releí `progress/tdd_pie_de_pagina.md`,
  `progress/judge_pie_de_pagina.md` y `progress/mutation_pie_de_pagina.md`
  completos y repetí `node .harness/harness.mjs init` de forma
  independiente antes de marcar `done`.
- **`faq` (id 12): DONE.** Reanudada a mitad de ronda 1 (@s1-@s3 ya
  existían en disco de una sesión previa, con 3 placeholders literales
  `'Respuesta'` en el catálogo). `tdd_craftsman` completó @s4-@s13 (10
  ciclos Rojo-Verde-Refactor, 3 "verde a la primera" verificados con
  sabotaje manual y reversión: @s7, @s9, @s10), sustituyendo los 3
  placeholders solo cuando un test rojo real lo exigió; reutilizó
  `SERVICIOS` de `servicios.ts` para los 5 títulos de @s4 (nunca los
  retipeó) y `construirEnlaceTelefono` de `informacion_contacto` para los
  `tel:`. `judge` ronda 1: **APROBADO** (13/13 escenarios cubiertos).
  `mutation_tester` ronda 1: **FAIL** 82.22% (74/90, 16 no-killed sobre
  `Faq-logica.ts`: formato de listado en español nunca verificado por
  `textContent` exacto, ramas 0/1 de `enumerar` sin cobertura,
  `segmentosDeRespuesta` sin verificar por estructura exacta). `tdd_craftsman`
  ronda 2: creó `Faq-logica.test.ts` (7 tests dirigidos, mismo patrón que
  `Galeria-logica.test.ts`/`CampanasPortada-logica.test.ts`, cero producción
  tocada) y documentó por adelantado que `Faq-logica.ts:49` sería un
  mutante equivalente genuino (propiedad de `Array.prototype.join` con 0/1
  elementos). `judge` ronda 2: **APROBADO**, re-verificó los 13 escenarios
  contra el código real. `mutation_tester` ronda 2: **PASS** 89/90 = 98.89%
  en bruto, 100% sobre mutantes no equivalentes — confirmó L49 como
  equivalente por partida doble (matemática + script empírico), mismo
  protocolo que `telefono.ts:13` y `contraste.ts:36`. `bin/harness init`
  verde: 276/276 tests. Lanzada y cerrada vía workflow con reintento
  acotado (rondas 1-2); yo (craftsman_lead) releí `progress/tdd_faq.md`,
  `progress/judge_faq.md` y `progress/mutation_faq.md` completos y repetí
  `node .harness/harness.mjs init` de forma independiente antes de marcar
  `done` — no me fié del resumen estructurado del workflow.
- **`formulario_contacto` (id 11): DONE.** `tdd_craftsman` ronda 1 (14/14
  escenarios) → `judge` ronda 1 APROBADO (5 sabotajes propios) →
  `mutation_tester` ronda 1 FAIL 94.44% (34/36, 2 supervivientes en el
  patrón de email: anclas `^`/`$` sin morder) → `tdd_craftsman` refuerzo (2
  tests dirigidos, cero producción) → `judge` ronda 2 APROBADO (reprodujo
  los 2 mutantes muertos + 4 sabotajes cruzados adicionales) →
  `mutation_tester` PASS 100% (36/36). Entregables:
  `src/components/FormularioContacto-logica.ts` (`validarCampos`,
  `emailTieneFormatoValido`, `formularioEsValido`),
  `src/components/FormularioContacto.tsx` (reutiliza `datosNegocio` y
  `construirEnlaceTelefono` de `InformacionContacto-logica.ts`, sin
  reescribir ningún `tel:` a mano). 256/256 tests totales.
- **`informacion_contacto` (id 10): DONE.** `tdd_craftsman` ronda 1 (16/16
  escenarios, 4 "verde a la primera" verificados con sabotaje) → `judge`
  APROBADO (sabotaje independiente confirmando que los 3 bloques opcionales
  fallan cerrado de forma desacoplada; confirmó que las 4 cláusulas Decisión
  11 de @s9/@s10 están declaradas, no simuladas) → `mutation_tester` PASS
  100% (2/2). Entregables: `src/components/InformacionContacto-logica.ts`
  (`construirEnlaceTelefono`, deriva `tel:` con `enlaceLlamada`, falla
  cerrado), `InformacionContacto.tsx` (props inyectables con sentinela
  `null`/valor por defecto de `datosNegocio`, mapa con `loading="lazy"`).
  232/232 tests.
- **Sesión de fondo `a5629bbc` (nota permanente):** no hay comando de CLI
  para desactivarla; el daemon la respawnea tras cada `Stop-Process`. Antes
  de cada operación de escritura importante se comprueba `claude agents
  --json --cwd <repo>` y se termina si tiene `pid` activo, para minimizar la
  ventana de colisión. No es un fix permanente, es mitigación continua.
- **`campanas_portada` (id 9): DONE.** `tdd_craftsman` ronda 1 (21/21
  escenarios, descartó y reconstruyó el borrador huérfano de la colisión) →
  `judge` ronda 1 APROBADO (7 sabotajes propios) → `mutation_tester` ronda 1
  FAIL 85.71% (18/21, 3 supervivientes: `throw undefined` no detectado por
  `toThrowError(regex)` en dos guardas de error, y `.trim()` sin cubrir en
  el filtro de títulos) → `tdd_craftsman` refuerzo (3 tests dirigidos, cero
  producción) → `judge` re-aprobó → `mutation_tester` PASS 100% (21/21).
  216/216 tests totales. Nota: en esta ronda mi propio script de workflow
  tuvo un bug de detección (regex que exigía "APPROVED" al inicio exacto de
  la respuesta del subagente, que a veces trae preámbulo) y creyó que el
  judge había rechazado cuando en realidad había aprobado — corregido
  releyendo el fichero real antes de actuar, no confiando en el resumen del
  workflow.
- **Incidente de sesión duplicada (20/08/2026):** durante el cierre de
  `galeria` se detectó una segunda sesión de Claude Code (`session_id`
  `b665d482-...`, PIDs 41304/49832, `--fork-session --resume`) trabajando en
  paralelo sobre este mismo repo con el mismo protocolo — de ahí ediciones
  casi simultáneas e idénticas sobre `feature_list.json`/`progress/current.md`
  y un sabotaje "fantasma" detectado por el `tdd_craftsman` de `galeria`
  ronda 2. Confirmado que esa sesión quedó interrumpida dos veces por el
  usuario (~16:30 UTC) y no era esta sesión (esta es el PID 17528,
  verificado por árbol de procesos). Terminada (`Stop-Process -Force`) para
  eliminar la colisión de escritura concurrente, autorizado explícitamente
  por el usuario. Dejó 3 ficheros sin trazar de `campanas_portada`
  (`CampanasPortada.tsx`, `CampanasPortada.test.tsx`, `src/data/campanas.ts`)
  sin `progress/tdd_campanas_portada.md` que documente ciclos Rojo→Verde —
  mismo caso que el borrador descartado de `galeria`: se instruye al
  `tdd_craftsman` de esta feature a aplicar el mismo criterio (sin bitácora
  que demuestre disciplina TDD, reconstruir por TDD estricto desde cero).
- **Segunda colisión de escritura, esta vez sobre `progress/tdd_campanas_portada.md`
  (20/08/2026, durante el propio ciclo TDD de `campanas_portada`):** el
  `tdd_craftsman` que ejecutó esta ronda detectó que su propia bitácora se
  sobrescribió en disco mientras la escribía, con una narrativa distinta (otra
  instancia proponía **conservar** el borrador huérfano verificándolo por
  sabotaje, en vez de descartarlo). `tasklist` mostró 13 procesos `claude.exe`
  simultáneos, sin forma fiable de distinguir subagentes legítimos de la
  colisión. Sin herramienta para terminar procesos ajenos, el `tdd_craftsman`
  continuó con el mandato explícito recibido (descartar y reconstruir) y dejó
  ambas notas en el propio `progress/tdd_campanas_portada.md` (sección "Aviso
  de colisión de escritura" y la nota final de la segunda sesión, que se
  retiró sin tocar `src/`). Revisar si hace falta repetir la comprobación de
  procesos que se hizo para `galeria` antes de dar por buena esta ronda.
- **Entregables de `campanas_portada`:** `src/data/campanas.ts` (catálogo de
  demo, 3 entradas, sin precio/vigencia), `src/components/CampanasPortada-logica.ts`
  (`construirModeloCampanas`: falla cerrado ante precio/vigencia
  declarados, descarta títulos vacíos y solo-espacios), `src/components/CampanasPortada.tsx`
  (`construirModeloSeguro` envuelve la llamada en `try/catch`, mismo modo de
  error "dato ausente → no se renderiza el bloque"). 21/21 escenarios,
  trazabilidad completa en `progress/tdd_campanas_portada.md`. 216/216 tests
  totales, 100% mutación.
- **Entregables de `galeria`:** `src/data/galeria.ts` (catálogo de demo,
  rutas locales), `src/components/Galeria-logica.ts` (`entradasValidas`,
  `calcularSolicitudDeDesplazamiento`, `prefiereMenosMovimiento`,
  `SEPARACION_ENTRE_TARJETAS_PX`), `src/components/Galeria.tsx`. `pnpm run
  test` 192/192 en verde. Ronda 1 del `judge` rechazada:
  `SEPARACION_ENTRE_TARJETAS_PX` se reimportaba en los tests para *calcular*
  el valor esperado — tautología, un mutante que cambiara la constante
  mutaba ambos lados igual. Verificado en vivo (24/24 seguían en verde tras
  el sabotaje). Corregido en ronda 2 con una aserción de apoyo anclada al
  literal `18` (mismo patrón que `Cabecera-logica.test.ts`), 100% mutación.
  **Pendiente, no bloqueante:** verificación en navegador real de las
  cláusulas de @s9/@s10 no medibles en jsdom (scroll físico, Decisión 11).
- **Estado:** `tokens_marca` (id 1), `datos_negocio` (id 2),
  `cabecera_y_navegacion` (id 3), `hero` (id 4), `servicios` (id 5),
  `equipo` (id 6), `reserva_chat` (id 7), `galeria` (id 8),
  `campanas_portada` (id 9), `informacion_contacto` (id 10) y
  `formulario_contacto` (id 11) cerradas:
  `done`. Ver bitácora abajo.
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

### 20/08/2026 — reserva_chat (id 7): DONE

Cerrada en 3 rondas — la más compleja hasta ahora (23 escenarios). `tdd_craftsman`
ronda 1: `src/components/ReservaChat-logica.ts` (4 funciones puras) +
`ReservaChat.tsx`. `judge` ronda 1: **CHANGES_REQUESTED**, dos hallazgos
reales, ninguno cosmético: (1) `reiniciar()` reseteaba `respuestas` sin
ningún test que lo exigiera (Ley 1) — verificado que sin esa línea 25/25
tests seguían en verde, y que era un bug de datos real: completar el guion
dos veces con respuestas distintas podía arrastrar campos de la primera
solicitud a la segunda; (2) @s16 tenía un bucle `for` sobre una colección
vacía (0 elementos), confirmado con sabotaje que el cuerpo nunca se
ejecutaba. Ambos fuera del alcance de `mutation_tester` (`.tsx` excluido del
glob de Stryker) — solo el `judge` podía cazarlos, mismo patrón que
`servicios`/`equipo`.

`tdd_craftsman` ronda 2: añade un test real de dos vueltas del guion con
datos distintos (mata el bug de `reiniciar()`) y sustituye el bucle vacío
por `toHaveLength(0)`. `judge` ronda 2: **APROBADO**. `mutation_tester`
mide por primera vez: **FAIL**, 20/32 = 62.50%, 12 supervivientes reales
(0 equivalentes, verificado con script de divergencia). Causa raíz única:
`siguientePaso` es una máquina de estados de 6 casos, pero `ReservaChat.tsx`
solo la invoca para 1 de las 4 transiciones reales del guion; las otras 3
hardcodean `setPaso(...)` directo. El informe dejó explícitamente como
decisión de diseño (no suya) elegir entre reforzar solo los tests o hacer
que la producción realmente pase por `siguientePaso` en las 4 transiciones.

`tdd_craftsman` ronda 3 elige reforzar solo los tests (5 aserciones
directas/positivas en `ReservaChat-logica.test.ts`), razonando que forzar el
cableado de producción sin un rojo de comportamiento que lo exigiera habría
sido footgun de la Ley 1 en sentido contrario. `judge` ronda 3: **APROBADO**,
confirmó con `git diff --stat` que el único fichero tocado fue el de test y
reprodujo uno de los 5 sabotajes de forma independiente. `mutation_tester`:
**APROBADO**, 100% (32/32), confirmado cruzando los 12 ids antes
supervivientes contra `mutation.json` (todos `Killed`, `killedBy` apuntando
a los tests nuevos). `pnpm run test` 167/167.

Marcado `done` en `feature_list.json` por el `craftsman_lead`, tras leer
`progress/judge_reserva_chat.md` y `progress/mutation_reserva_chat.md`
completos. Arranca `galeria` (id 8) — única feature `in_progress`,
respetando `one_feature_at_a_time`.

### 20/08/2026 — galeria (id 8): DONE

Cerrada en 2 rondas (17 escenarios). `tdd_craftsman` ronda 1:
`src/data/galeria.ts` + `Galeria-logica.ts` (3 funciones puras +
`SEPARACION_ENTRE_TARJETAS_PX`) + `Galeria.tsx`. `judge` ronda 1:
**CHANGES_REQUESTED** — patrón `doble-de-test-anclado-al-literal-no-al-simbolo`:
`SEPARACION_ENTRE_TARJETAS_PX` se reimportaba en ambos ficheros de test para
*calcular* el valor esperado (`240 + SEPARACION_ENTRE_TARJETAS_PX`), igual
que `calcularSolicitudDeDesplazamiento` lo calcula en producción —
tautología. Verificado en vivo: mutar la constante a mano (`18` → `65`)
dejaba los 24 tests en verde. Comparado contra el precedente ya aprobado del
propio proyecto (`Cabecera-logica.test.ts`, que sí ancla
`PUNTO_DE_CORTE_NAVEGACION_PX` a un literal).

`tdd_craftsman` ronda 2: añade una aserción de apoyo
(`expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(18)`), rotulada explícitamente
como apoyo de implementación, no escenario de negocio (el valor es
provisional hasta que `tokens_marca` fije la escala de espaciado). `judge`
ronda 2: **APROBADO**, reprodujo el sabotaje de forma independiente con un
marcador distinto al del `tdd_craftsman` y confirmó exactamente 1 test en
rojo. `mutation_tester`: **APROBADO**, 100% (31/31) sobre
`Galeria-logica.ts`, confirmado contra `mutation.json` crudo. `pnpm run
test` 192/192.

Pendiente explícito, no bloqueante para C6/C7: la verificación en navegador
real de las cláusulas de @s9/@s10 no medibles en jsdom (scroll físico,
`prefers-reduced-motion` con layout real) — Decisión 11, declarada en el
propio `.feature`, no oculta.

Marcado `done` en `feature_list.json` por el `craftsman_lead`, tras leer
`progress/judge_galeria.md` y `progress/mutation_galeria.md` completos.
Arranca `campanas_portada` (id 9) — única feature `in_progress`, respetando
`one_feature_at_a_time`.
