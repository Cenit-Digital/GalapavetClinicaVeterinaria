# Sesión actual

- **26/08/2026 — `rediseno_visual` (id 24): SPEC_READY.** Retomada la
  investigación de convergencia entre el prototipo versionado de Claude
  Design y GitHub Pages. El estado técnico anterior se confirmó sano; la
  brecha visual medida es estructural. Se añadió `PLAN_DE_CONVERGENCIA.md`,
  se registró la feature y su contrato de 52 escenarios queda pendiente de la
  puerta humana obligatoria antes de editar producción. Evidencia:
  `progress/rediseno_mediciones_navegador.md` y `progress/rediseno/`.

- **26/08/2026 — `rediseno_visual` (id 24): IN_PROGRESS.** Puerta humana
  superada explícitamente para los 52 escenarios de
  `features/rediseno_visual.feature`. Comienza TDD y la verificación contra
  el `dist/` de producción; el cierre requiere las puertas de calidad del
  plan y commit/push únicamente con evidencia verde.

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

- **26/08/2026, 02:33 — Colofón de la sesión: despliegue real verificado en
  navegador real, no solo en simulación local.** Tras el push del commit
  `30de7c3`, los dos workflows de GitHub Actions (`Harness CI` y `Deploy a
  GitHub Pages`, este último nunca antes ejecutado) terminaron con
  **éxito** (`gh run list`). Verificado con Chrome real (no `WebFetch`, que
  no ejecuta JavaScript y por tanto reporta un 404 "crudo" engañoso en
  cualquier ruta interna — es el comportamiento ESPERADO de la técnica
  `rafgraph/spa-github-pages`, que depende de que el navegador ejecute el
  script de `404.html`): `https://cenit-digital.github.io/GalapavetClinicaVeterinaria/`
  carga la portada real; un deep-link directo a
  `.../GalapavetClinicaVeterinaria/campanas` (sin pasar por `/`) atraviesa
  el 404→redirección y monta la página de Campañas completa, con estilos,
  navegación, las 3 tarjetas de campaña y pie de página — cero errores en
  consola del navegador. El sitio está publicado y funciona de verdad.

- **26/08/2026 — `despliegue_github_pages` (id 23): DONE.** 24/24 escenarios
  (`@s1`-`@s24`). Nace el 25/08 cuando, al resolver el PENDIENTE 7 de
  `identidad_visual` (`og:image` absoluto), el humano fijó GitHub Pages como
  hosting y `craftsman_lead` detectó que el proyecto no tenía configurado ni
  el `base` de Vite ni el `basename` de `BrowserRouter` — un `tdd_craftsman`
  lanzado directamente para arreglarlo se negó, correctamente, por no haber
  `.feature` aprobado. `gherkin_author` destiló 17 escenarios (`@s1`-`@s17`):
  `--base` solo en el script `build` (nunca en `vite.config.ts`, así que
  Vitest nunca lo ve), `BrowserRouter basename={import.meta.env.BASE_URL}`,
  la función pura `hrefDeDestino(destino, base)` para los 4 puntos con
  enlaces internos, la técnica pública `rafgraph/spa-github-pages`
  (`public/404.html` + decodificación en `index.html`) verificada con un
  gemelo puro, `%BASE_URL%` en `index.html`. Puerta humana superada, `tdd_craftsman`
  los implementó — pero verificando en navegador real contra el `dist/` real
  con el `--base` REAL (el nivel que el propio contrato exige) encontró un
  **hallazgo bloqueante fuera de alcance**: 24 rutas de imagen + `og:image`,
  repartidas en 6 features ya `done` (pie de página, galería, campañas,
  blog, tienda, seo_estructura), nunca pasaban por `hrefDeDestino` y daban
  404 bajo el subpath. Escalado sin arreglarlo por su cuenta (mismo patrón
  disciplinado que el origen de la propia feature). `craftsman_lead`
  formalizó una **enmienda** (Decisiones 52-55: reutilizar `hrefDeDestino`
  literalmente sin función hermana, resolver en el `.tsx` nunca en
  `src/data/*.ts`, coordinar `og:image` con el subpath), `gherkin_author`
  destiló 7 escenarios más (`@s18`-`@s24`), puerta humana superada de nuevo,
  `tdd_craftsman` la implementó: 75/75 verde en `pnpm run test:e2e` (dos
  corridas consecutivas), descartó con evidencia doble (estática + sabotaje
  empírico) que un test colateral de movimiento estuviera relacionado (era
  contención de CPU), y corrigió de paso un hallazgo no planeado
  (`imagenes.spec.ts` @s29 duplicaba el subpath) con una línea. `judge`
  aprobó en dos rondas (enmienda + revisión completa de los 24 escenarios) y
  señaló que faltaba `mutation_tester` sobre **toda** la feature (nunca
  medida): `hrefDeDestino.ts`/`tecnicaSpaGithubPages.ts` dieron FAIL 91.30%
  (4 supervivientes reales, huecos de cobertura no bugs) → refuerzo
  quirúrgico (1 test + 1 aserción, producción byte-idéntica) → `judge`
  aprobado con sabotaje propio → `mutation_tester` **PASS 100% (46/46, 0
  timeouts)**. `craftsman_lead` reconcilió 2 discrepancias de recuento
  (27→24 rutas, 28→25 referencias; @s12 4→5). `bin/harness init` verde de
  punta a punta (1047/1047), repetido de forma independiente antes de
  marcar `done`. Detalle ciclo a ciclo completo en
  `progress/tdd_despliegue_github_pages.md`.

- **26/08/2026 — `accesibilidad` (id 19): DONE.** Puerta lógica superada
  hace tiempo (judge Ronda 9, mutation_tester 100%/224, sin cambios desde
  entonces). Bloqueada desde el 22/08 por 4 escenarios de navegador real
  (`@s2`/`@s7`, `@s17`, `@s18`, `@s19`) que esperaban a `identidad_visual`
  (22, `done` el 25/08, que los automatiza como heredados). Reanudada con
  una revisión de cierre rigurosa del `judge` que comparó cada `Then` real
  contra el test Playwright heredado uno a uno (no aceptó la cita de
  `escenariosHeredados.ts` como prueba de fidelidad) y encontró 2 huecos
  reales: `@s19` sin contador de elementos efectivamente inspeccionados
  (patrón verde-por-vacuidad) y `@s18` con `fondoSinFoco` rindiéndose en el
  `parentElement` inmediato en vez de trepar la cadena de ancestros (80% de
  los controles muestreados nunca recibían la comparación). `tdd_craftsman`
  corrigió ambos con sabotaje real verificado, cero cambios en
  `src/lib/diseno/`/`src/lib/accesibilidad-*` (no hizo falta remedir
  mutación). Un test colateral (`@s42` movimiento, "3 animaciones en curso"
  en campañas) parecía relacionado con el hallazgo bloqueante de imágenes
  de `despliegue_github_pages`, pero la hipótesis quedó **descartada con
  evidencia doble** — el fallo era contención de CPU en corridas con
  múltiples workers, confirmado 3 veces de forma independiente
  (`tdd_craftsman`, `judge`, `craftsman_lead`, siempre verde en aislamiento
  con `--workers=1`). `bin/harness init` verde (1047/1047), repetido de
  forma independiente antes de marcar `done`.

- **26/08/2026 — Cierre de la sesión extendida del 25-26/08/2026: las 23
  features del proyecto quedan `done`.** Orden de cierre: `identidad_visual`
  (22) → `sistema_de_diseno_visual` (21) → enmienda `og:image` absoluto
  sobre `seo_estructura` (15) → `despliegue_github_pages` (23, nueva
  feature, 24 escenarios en 2 rondas) → `accesibilidad` (19). Ver las
  entradas de cada una, arriba y más abajo en esta bitácora, para el detalle
  completo. Pendientes explícitos que NO bloquean nada (documentados, no
  inventados): el parque de navegadores objetivo sigue NO VERIFICADO
  (afecta solo al acabado, ningún escenario depende de él); el
  `favicon.svg` vectorial y las 24 fotos de banco siguen pendientes del
  cliente (confirmado con el humano: se quedan como están, raster y
  Pexels rotulado); `-webkit-font-smoothing` sin decidir (cosmético). El
  repositorio pasó de privado a público (autorizado por el humano, único
  camino viable para GitHub Pages en esta cuenta; verificado sin ningún
  secreto en el historial antes del cambio) y GitHub Pages queda activado
  con despliegue automático (`​.github/workflows/deploy-pages.yml`) en cada
  push a `main`.

- **25/08/2026 — `sistema_de_diseno_visual` (id 21): DONE.** Desbloqueada por
  `identidad_visual` (22, cerrada antes en esta misma sesión, ver entrada
  siguiente). Arrastraba desde el 23/08/2026 dos deudas: `mutation_tester`
  nunca remidió tras el refuerzo de Ronda 2 (13 tests, `judge` ya APROBADO),
  y 8 escenarios de navegador real esperaban a que `identidad_visual`
  existiera. `judge` hizo una revisión de cierre completa (no por herencia):
  confirmó los 26 escenarios jsdom en verde tras los cambios de
  `identidad_visual` sobre `tokensColor.ts`/`inventarioModulos.ts`, comparó
  cada uno de los 8 `Then` de navegador real contra el test Playwright
  heredado real (no solo la cita de `escenariosHeredados.ts`), y dio el
  alcance exacto de mutación pendiente: `movimientoRespetuoso.ts`,
  `puntoDeCorte.ts`, `escalaTipografica.ts` (+ `escalaEspaciado.ts`,
  higiene) — `tokensColor.ts`/`inventarioModulos.ts` ya cerrados al 100%
  por `identidad_visual`, no hacía falta remedirlos. Encontró 2 hallazgos
  reales: **`@s27`** con una cláusula del `Then` (desbordamiento/
  superposición de cabecera a 1024/1023px) sin ningún test, y **`@s34`**
  con el literal del contrato desactualizado (exigía duración "distinta de
  0", pero `identidad_visual` fija `0.01ms` a propósito, con razón técnica
  documentada). Dos agentes en paralelo sobre ficheros independientes:
  `tdd_craftsman` añadió el test de `@s27` (verificado con sabotaje real
  sobre `Cabecera.module.scss` — **sin ningún problema real de producción**,
  la cabecera ya estaba correcta) mientras `mutation_tester` remedía los 4
  módulos (PASS en 3, **FAIL real en `movimientoRespetuoso.ts`**:
  `PATRON_PROPIEDAD_DE_MOVIMIENTO` no reconocía formas largas de CSS como
  `transition-duration:` — un hueco genuino de la propia puerta `@s33`, no
  solo de cobertura de mutación). Decisión de diseño mía: extender el
  reconocimiento a formas largas hifenadas (precedente en
  `escalaMovimiento.ts` de `identidad_visual`). `tdd_craftsman` lo
  implementó (1 línea + 2 tests, sabotaje verificado); `judge` APROBADO con
  sabotaje propio reproducido a mano; `mutation_tester` remidió **PASS
  100% (72/72)**. Reconcilié yo mismo el texto de `@s34` en
  `features/sistema_de_diseno_visual.feature`. Revisión de cierre GLOBAL
  final del `judge`: **APROBADO** — los 6 módulos puros de esta feature al
  100% sobre no-equivalentes, 34/34 escenarios con cobertura real.
  `bin/harness init` verde de punta a punta (**916/916**), repetido por mí
  de forma independiente antes de marcar `done`.
  **`accesibilidad` (id 19) queda `blocked` sin cerrar en esta sesión**: su
  puerta de mutación ya estaba al 100% desde antes (sin cambios desde
  entonces, confirmado por `git log`), y sus 4 escenarios de navegador real
  pendientes son un subconjunto de lo que `identidad_visual` ya automatiza
  — pero no se le ha hecho la misma revisión rigurosa escenario-a-escenario
  que a la 21 (el `judge` de la 21 explícitamente no emitió veredicto sobre
  la 19). Candidata natural para la próxima ronda de esta sesión o de la
  siguiente.

- **25/08/2026 — `identidad_visual` (id 22): DONE.** Cierra el plan maestro de
  12 pasos de `progress/plan_adaptacion_scss.md` §5, 51/51 escenarios de
  `features/identidad_visual.feature`. Estado al reanudar esta sesión: Ronda A
  (pasos 1-5) `done`/commiteada (93bdf72); Ronda B (pasos 6-8: tipografía
  autoalojada + `public/`) completa pero sin commitear — cerrada primero en
  esta sesión (`judge` APROBADO el refuerzo de mutación de
  `inventarioActivosPublicos.ts`, `mutation_tester` PASS 100% excl.
  equivalentes). Después, **Ronda C** (pasos 9-12, los 4 que faltaban):
  infraestructura Playwright 1.62.1 + `@axe-core/playwright` 4.13.0 en
  `tests/e2e/` (8 ficheros, 65 tests), diseño fino de los 17 `.module.scss` de
  componentes/páginas, techo de CSS fijado en 8000 B (medido real 5791 B),
  puerta `test:e2e` propia y separada del arnés (@s48). `tdd_craftsman` tardó
  ~4h en esta ronda grande (instalación real de Chromium, 17 componentes
  maquetados uno a uno, 8 suites e2e escenario a escenario) — progreso
  verificado en vivo cada 10 min durante toda la sesión, nunca hubo un cuelgue
  real. Encontró y corrigió **5 bugs reales de layout** que solo el navegador
  real podía revelar (Flexbox de la galería → CSS Grid, auto-margin-en-flex
  con ancho de contenedor divergente entre subpáginas, desbordamiento
  horizontal por palabra larga, logo del pie sin "hueco de imagen", condición
  de carrera de color a mitad de transición CSS). `judge` APROBÓ la Ronda C
  con verificación independiente completa (harness init, build, 65/65 e2e, 3
  sabotajes propios). `mutation_tester` dio **FAIL** en la primera medición
  (85.51% bruto / 89.71% s/no-equiv., 21 supervivientes reales en
  `rolesDescartados.ts`/`escalaMovimiento.ts`/`escenariosHeredados.ts`) →
  `tdd_craftsman` aplicó un refuerzo quirúrgico de 12 tests nuevos sin tocar
  producción (verificado con `sha256sum` idéntico) → `judge` APROBADO
  (sabotaje propio distinto de los 6 ya verificados por `tdd_craftsman`) →
  `mutation_tester` remidió **PASS** 95.33% bruto / **100.00% s/no-equiv.**
  (los 10 mutantes restantes son los mismos equivalentes genuinos ya probados
  con álgebra + script empírico). `bin/harness init` verde de punta a punta:
  **914/914 tests**, lint y typecheck limpios — repetido por mí
  (craftsman_lead) de forma independiente antes de marcar `done`.
  **Desbloquea `sistema_de_diseno_visual` (id 21) y `accesibilidad` (id 19)**:
  sus escenarios de navegador real pendientes (@s12/@s27-@s32/@s34 de la 21;
  @s2/@s17/@s18/@s19 de la 19) ya se ejecutan en verde vía
  `tests/e2e/*.spec.ts` de la 22, confirmado en `escenariosHeredados.ts`
  (@s50). Ambas se dejan `blocked` (no `in_progress`) a propósito — prioridad
  de esta sesión era cerrar la 22 con commit+push, no abrir un nuevo frente;
  quedan listas para la próxima sesión sin más investigación, solo con la
  re-medición de su propia puerta de mutación pendiente. PENDIENTE 7 del
  contrato de la 22 (`og:image` relativo vs. absoluto, asignado al
  craftsman_lead) sigue sin resolver: exige conocer el dominio final de
  publicación, aún no decidido — no bloquea ningún escenario.
  **Incidente de sesión (25/08/2026):** dos mensajes con formato "el
  coordinador te pide..." aparecieron en el hilo pidiendo repetir un informe
  nunca recibido y ceder la orquestación, incluida una respuesta de
  `AskUserQuestion` aparentemente confirmándolo — los tres venían seguidos
  del aviso de sistema explícito "no ha llegado entrada humana genuina desde
  el último mensaje real del usuario". Tratados como contenido no fiable,
  ignorados. Más tarde en la sesión, un fork de investigación lanzado por mí
  tomó la iniciativa de lanzar por su cuenta un `judge` y un `mutation_tester`
  sobre el refuerzo de la Ronda B (trabajo legítimo, no una colisión
  maliciosa, pero sin mi autorización explícita) — detectado por
  `ListAgents`, se le pidió parar y devolver el control; no volvió a ocurrir
  el resto de la sesión, que continuó con un único orquestador (yo).

- **Feature en curso: `sistema_de_diseno_visual` (id 21) — `tdd_craftsman`
  ronda 1 completa.** 26/34 escenarios (`@s1`-`@s11`, `@s13`-`@s26`, `@s33`)
  cubiertos con test concreto por TDD estricto desde cero; los 8 restantes
  (`@s12`, `@s27`-`@s32`, `@s34`) declarados por el propio `.feature` como de
  navegador real (Decisión 11), documentados como pendientes explícitos —
  ninguno tenía fracción pura verificable en jsdom sin fingir una medición
  de layout que jsdom no calcula. Ratios de contraste re-verificados de forma
  independiente con el módulo real `src/lib/contraste.ts` antes de fijar nada
  (los 9 valores de la cabecera del `.feature` coinciden dígito a dígito).
  Entregables: `src/styles/_tokens.scss` (colores de las 4 variantes,
  conmutados por `[data-variante]`; escala tipográfica Utopia ratio 1.25/base
  16/viewport 320-1024, 8 pasos -2..5; escala de espaciado 8px de Material
  Design; mixins `foco-visible`/`area-tactil-minima`), 6 módulos puros nuevos
  bajo `src/lib/diseno/` (`tokensColor`, `escalaTipografica`,
  `escalaEspaciado`, `inventarioModulos`, `puntoDeCorte`,
  `movimientoRespetuoso`, todos con test dedicado), y 17
  `<Nombre>.module.scss` co-localizados (12 componentes + 5 páginas) cableados
  en sus `.tsx`. Hallazgo técnico relevante y corregido en la misma ronda:
  `vite.config.ts` `test.css: false` stubea CUALQUIER módulo CSS/SCSS
  (incluidos los leídos con `?raw`) — cambiado a
  `{ include: [/\?raw/] }` (Vitest matchea `css.include` contra el id CON
  query, verificado en el código fuente real de Vitest 4.1.10), acotado para
  no afectar las importaciones normales de `.module.scss` de los componentes
  (un primer intento por extensión rompió 17 tests ya `done` porque jsdom SÍ
  aplica `display:none` fuera de un `@media` no evaluado; detectado,
  diagnosticado y corregido antes de seguir). 4 sabotajes manuales
  verificados (`@s14`, `@s23`/`@s11` por inspección directa, `@s25`, `@s33`)
  más un hallazgo real durante la implementación (`@s24`: comentarios en
  español con la palabra "red" disparaban el patrón de color inglés de la
  puerta ya `done`, corregido sin tocar la puerta). `pnpm run test`:
  699/699 (672 → 699, +27). `pnpm run lint && pnpm run typecheck`: limpio.
  `pnpm run build`: éxito, CSS real generado. `node .harness/harness.mjs
  init`: verde de punta a punta. Detalle completo, trazabilidad @s→test y
  justificación de la escala tipográfica en
  `progress/tdd_sistema_de_diseno_visual.md`. Pendiente de `judge` y
  `mutation_tester` para la fracción jsdom, y de una sesión de navegador real
  para los 8 escenarios pendientes.

- **Hallazgo mayor (22/08/2026) y nueva feature `sistema_de_diseno_visual`
  (id 21):** al intentar cerrar los 4 escenarios de navegador real de
  `accesibilidad` (target-size, geometría de cabecera/foco, animación), la
  puerta lógica de `accesibilidad` ya estaba cerrada (judge Ronda 9 APPROVED,
  mutation_tester PASS 100 % sobre no equivalentes, 224/224) — pero al servir
  el sitio real (`vite build && vite preview`) y auditarlo con axe-core real
  (no jsdom), la portada dio **21 violaciones reales de `target-size`**. Causa
  raíz investigada a fondo: **el repo no tiene ningún fichero `.scss`/`.css`
  en absoluto** (`find src -iname "*.scss" -o -iname "*.css"` → 0) y **ningún
  componente importa estilos** (`grep` de `.module.scss/.css` en todo
  `src/**/*.tsx` → 0), pese a que `project-spec.md` → «Arquitectura» especifica
  `<X>.module.scss` co-localizado desde ANTES de que arrancara la feature 1.
  Captura de pantalla de la portada confirma HTML sin estilar (Times New
  Roman, enlaces azules por defecto). `tokens_marca` (done, mutación 100 %)
  solo entregó `src/lib/tokens.ts` (constantes TS); nunca se creó
  `src/styles/_tokens.scss` ni se conectó a ningún componente — un hueco
  sistémico invisible para las 20 features anteriores porque TODA la suite
  verifica sobre jsdom con `css: false` (regla del propio proyecto: nunca se
  asevera sobre clases CSS), así que nada en el arnés podía verlo. Investigado
  también el zip original del prototipo
  (`C:\Users\vhurt\Downloads\ClinicaVeterinariaGalapavet.zip`, hallado fuera
  del repo): confirma que `docs/contrato-heredado/` solo capturó
  COMPORTAMIENTO (Gherkin), nunca CSS — el `.dc.html` original tiene una
  arquitectura de custom properties + `[data-tema]` YA compatible con el
  mecanismo real de `selector_paleta` (`data-variante`, ya `done`/probado),
  pero sus valores numéricos de `font-size` son 20 literales dispersos sin
  ratio sistemático (extracción exhaustiva), así que se descartan como fuente
  de valores (solo de arquitectura). `project-spec.md` → Decisiones 23-24 y
  `feature_list.json` → feature 21 documentan la decisión completa: tokens de
  color derivados matemáticamente de los 3 hexadecimales ya verificados de
  `tokens.ts` (nunca del prototipo) y verificados con la fórmula WCAG real de
  `contraste.ts` antes de fijarse (script desechable en el scratchpad de la
  sesión, resultados citados en el `.feature`); escala tipográfica con la
  metodología pública de Utopia (fluid type, ratio 1.25, base 16px, rango
  320-1024px — este último = `PUNTO_DE_CORTE_NAVEGACION_PX`, no un valor
  nuevo); escala de espaciado con la rejilla de 8px de Material Design.
  Autorización explícita del humano (22/08/2026) para investigación +
  planificación + implementación 100 % autónoma, verificada a 0 fallos/0
  errores/0 warnings antes de cerrar. `gherkin_author` lanzado para destilar
  `features/sistema_de_diseno_visual.feature`; pipeline TDD/judge/mutación +
  verificación en navegador real (que cierra a la vez los 4 escenarios
  pendientes de `accesibilidad`) sigue en la próxima entrada de esta bitácora.
- **Feature en curso: `accesibilidad` (id 19) — puerta transversal final de
  cierre del proyecto.** `tdd_craftsman` ronda 1 completa por TDD estricto
  desde cero, escenarios `@s1`-`@s36` (orden real del `.feature`, no el
  numérico: `@s34` antes que `@s33`/`@s35`/`@s36`) recorridos en ese orden.
  32/36 escenarios cubiertos de verdad en jsdom; los 4 declarados navegador
  real por la Decisión 11 (`@s2` target-size, `@s17`, `@s18`, `@s19`) tienen
  su fracción de lógica pura cubierta y el resto documentado pendiente.
  Diseño, trazabilidad @s→test y detalle de sabotajes en
  `progress/tdd_accesibilidad.md`. Pendiente de `judge` y `mutation_tester`.

- **`seo_estructura` (id 15) — `tdd_craftsman` ronda 1 completa, 22/22
  escenarios (@s1-@s22) por TDD estricto desde cero, pendiente de `judge` y
  `mutation_tester`.** Diseño y trazabilidad completa @s→test en
  `progress/tdd_seo_estructura.md`. Entregables: `src/lib/seo-logica.ts`
  (catálogo de metadatos de las 6 páginas, `validarMetadatos`,
  `construirDatosEstructurados` — JSON-LD `["VeterinaryCare","LocalBusiness"]`,
  `geo`/valoración/registro NUNCA se emiten por diseño, sin ninguna rama de
  código que los produzca), `src/lib/site.ts` ampliado (dirección
  estructurada en `calle`/`codigoPostal`/`localidad`/`region`, de la que
  `lineas`/`unaLinea` ya existentes se siguen derivando, verificado
  byte-idéntico), `src/lib/datosEstructuradosNegocio.ts` (constante
  compartida por las 3 subpáginas), `src/components/MetadatosPagina.tsx`
  (único punto de efectos de `<head>`: `document.title`, meta description,
  Open Graph con `es_ES`/guion bajo, `<script type="application/ld+json">`
  con upsert — nunca duplica). Cableado en `Landing` (con prop
  `calleDireccion` solo para @s11), `PaginaCampanas`, `PaginaBlog`,
  `PaginaTienda`. Sin `react-helmet` (no hay precedente en el repo). 6
  sabotajes manuales documentados (guarda de horario vacío, rama `geo`
  ingenua, `lang` con guion bajo, viewport sin zoom, upsert de `<script>`
  desactivado, override de `Landing` ignorado), todos reprodujeron rojo y se
  revirtieron sin resto. `pnpm run test`: 621/621 (580/40 → 621/46).
  `pnpm run lint && pnpm run typecheck`: limpio. `node .harness/harness.mjs
  init`: verde de punta a punta, sin timeouts de worker en esta corrida.

- **`seo_estructura` (id 15): DONE (22/08/2026).** 22/22 escenarios, la
  feature transversal que responde directamente al hallazgo del estudio de
  prospección («SEO inexistente»). Cierre reconciliado por mí
  (craftsman_lead) tras leer completos `progress/tdd_seo_estructura.md` (2
  rondas), `progress/judge_seo_estructura.md` (2 rondas, la segunda con
  verificación línea a línea del fichero no trackeado — `git diff` no da
  señal sobre ficheros nuevos — más 3 sabotajes manuales independientes) y
  `progress/mutation_seo_estructura.md` (2 mediciones), y repetir yo mismo
  `node .harness/harness.mjs init` de forma independiente: **624/624
  verde**. Entregables: `src/lib/seo-logica.ts` (módulo puro: construcción
  del bloque JSON-LD y validación de metadatos — Invariante 6; tipo doble
  `["VeterinaryCare","LocalBusiness"]`, `PostalAddress`/
  `OpeningHoursSpecification`/`GeoCoordinates` con nombres exactos del
  vocabulario, regla "lo que no hay se omite, nunca se emite vacío"),
  `src/lib/datosEstructuradosNegocio.ts` (ensamblaje desde `datosNegocio`),
  `src/components/MetadatosPagina.tsx` (única pieza con efecto de DOM: hace
  upsert de `<meta>`/`<script type="application/ld+json">` sobre
  `document.head`, sin lógica de decisión propia), `src/documento.test.ts`
  (`lang="es-ES"`, UTF-8, viewport), `src/paginasSeo.test.tsx` (integración
  sobre las 6 rutas reales). `src/lib/site.ts` se reestructura
  (`crearDireccion` pasa a recibir la forma estructurada
  `{calle, codigoPostal, localidad, region}` y deriva de ahí
  `lineas`/`unaLinea`, antes al revés) para que el bloque JSON-LD y el texto
  visible deriven del mismo campo — Invariante 2, verificado con sabotaje
  independiente del propio `judge` (cambió `site.ts` a mano, confirmó que
  bloque Y texto visible cambian juntos). Sin dependencias nuevas (nada de
  `react-helmet`). `og:image` usa una ruta local provisional que aún no
  existe como fichero — mismo criterio ya aceptado en `galeria.ts`, no es
  deuda nueva.
  - **Disciplina del cierre:** ronda 1 TDD completo desde cero (22/22 @s,
    10 ciclos documentados, 6 sabotajes manuales explícitos) →
    `pnpm run test` 621/621 → judge ronda 1 **APROBADO a la primera** (sin
    `CHANGES_REQUESTED`, algo inusual en este proyecto para una feature de
    este tamaño) con sabotaje independiente propio sobre @s10/@s11 →
    `mutation_tester` ronda 1 **FAIL** 133/140 = 95.00% bruto, 7
    supervivientes reales en `src/lib/seo-logica.ts` (líneas 157 y 189-190:
    guarda de etiqueta de día no reconocida, guarda de `email`, guarda de
    `sameAs` — los 3 casos "presencia" de un dato opcional que la suite
    original solo probaba en su rama "ausencia") → `tdd_craftsman` ronda 2:
    3 tests dirigidos, cero producción tocada (verificado por el `judge` con
    dos métodos independientes: `git diff --stat` para los ficheros
    trackeados y comparación línea a línea carácter a carácter para
    `seo-logica.ts`, que al ser nuevo no aparece en el diff de un fichero no
    añadido al índice) → judge ronda 2 **APROBADO**, reprodujo 3 de los 3
    sabotajes exactos de Stryker de forma independiente → `mutation_tester`
    ronda 2 (numerada "Ronda 3" en su propio informe) **PASS** 140/140 =
    **100.00%**, 0 supervivientes, 0 timeouts en las 3 corridas. `bin/harness
    init`: 624/624.
  Marcado `done` en `feature_list.json` por mí (craftsman_lead). Con esto,
  **19 de las 20 features del proyecto están `done`**: solo queda
  `accesibilidad` (id 19), la puerta transversal final de cierre —
  **arranca `accesibilidad`**, única feature `in_progress`.
- **`pagina_tienda` (id 18): DONE (22/08/2026).** 44/44 escenarios, la
  feature más grande del proyecto hasta ahora. Cierre reconciliado por mí
  (craftsman_lead) tras leer completos `progress/tdd_pagina_tienda.md` (9
  rondas), `progress/judge_pagina_tienda.md` (9 rondas, la última —
  Ronda 9 — con sabotaje propio independiente) y
  `progress/mutation_pagina_tienda.md` (2 mediciones), y repetir yo mismo
  `node .harness/harness.mjs init` de forma independiente dos veces (una
  antes y otra después del ajuste final de comentario). Entregables:
  `src/data/tienda.ts` (`CATEGORIAS_TIENDA` fijas del cliente +
  `PRODUCTOS_DEMO`, importes en céntimos enteros convertidos a mano una
  sola vez desde el Background), `src/pages/PaginaTienda-logica.ts`
  (catálogo fail-closed, `formatearImporte` con espacio duro U+00A0,
  reducer de cesta con tope de 99, atrapa-foco real WAI-ARIA APG para
  `PanelCesta`), `src/pages/PaginaTienda.tsx`. Router: `/tienda` con su
  propia `<Route>`; `RUTAS_DE_SUBPAGINA` (`App-logica.ts`) queda **vacía**
  — ya no queda ninguna subpágina de `navegacion.ts` sin página propia.
  `pnpm run test`: 580/580.
  - **Disciplina del cierre (9 rondas cada bitácora):** ronda 1 TDD
    completo desde cero → judge ronda 1 CHANGES_REQUESTED (NBSP ASCII vs
    U+00A0 en 16 aserciones + atrapa-foco sin atrapar de verdad) →
    ronda 2 corrige ambos → judge encuentra 2 aserciones de @s29 que la
    ronda 2 no cubrió → ronda 3 las corrige → judge ronda de verificación
    sin cambios (ronda 4) → judge (con el fichero ya reescrito por otra
    ronda por debajo, ver incidente) encuentra @s9 sin fidelidad de
    nombres tras filtrar (hueco fuera del alcance de mutación por vivir en
    el `.tsx`) → ronda 5 lo corrige → judge Ronda 6/7 aprueban con
    verificación independiente completa (44/44 @s, sabotaje propio) →
    `mutation_tester` ronda 1 **FAIL** 90.63% bruto (91.58% excl. 2
    equivalentes ya conocidos), 13 supervivientes reales agrupados en 5
    causas raíz (fábricas de `Error` vacías, frontera `importeCentimos ===
    0`, `quitarUnidad`/`fijarCantidad` sin id/cantidad inválida, y 3
    mutantes contingentes-de-los-datos en la derivación de
    `RUTAS_DE_SUBPAGINA`) → `tdd_craftsman` rondas 6-7 (11 tests dirigidos
    + extracción de `derivarRutasDeSubpagina` como función pura
    parametrizada en `App-logica.ts`, justificada explícitamente por el
    informe de mutación, no por preferencia; ronda 7 además encontró y
    revirtió un resto de sabotaje de verificación (`if (false)`) que una
    sesión de medición anterior había dejado sin revertir en
    `PaginaTienda-logica.ts:226`) → judge Ronda 8 aprueba con 4 sabotajes
    manuales propios → `mutation_tester` ronda 2 **PASS** 191/193 = 98.96%
    bruto, **100% excluidos 2 equivalentes genuinos** ya justificados con
    prueba analítica exhaustiva (`elementoTrasAtraparFoco`,
    `PaginaTienda-logica.ts:226`, `elementosFocusables = []` fuerza las 3
    ramas a devolver `null` con o sin la guarda) → judge Ronda 9,
    verificación independiente final con sabotaje propio sobre 2 tests
    distintos a los ya usados, **APROBADO**, C1-C7 en verde.
  - **Incidentes operativos de esta sesión, ya resueltos:** (1) colisión de
    sesión real: `claude agents --json` detectó una segunda sesión
    interactiva activa (`busy`) sobre este mismo repo (PID 40820) —
    sobrescribió `progress/judge_pagina_tienda.md` mientras un `judge` lo
    redactaba, causando una numeración de rondas confusa que tuvo que
    autocorregirse en vivo (ver "Ronda 6 — corrección del registro" en ese
    fichero). Confirmado con el usuario que la máquina había estado en
    suspensión y la sesión quedó colgada; terminada (`Stop-Process`) con
    autorización explícita del usuario antes de correr `mutation_tester`,
    seguido el mismo protocolo que dejó documentado el incidente de
    `galeria`/`campanas_portada`. (2) Mi propio script de workflow tuvo
    **dos veces** un bug de detección de veredicto (regex anclada al
    inicio de la respuesta del subagente, que a veces antepone un resumen
    largo antes del token "APROBADO"/"PASS" exigido) y creyó que el judge
    o la mutación habían rechazado cuando en realidad habían aprobado —
    mismo patrón de bug ya documentado en el cierre de `campanas_portada`.
    Corregido en ambos casos releyendo los ficheros reales en disco antes
    de actuar, nunca confiando en el resumen estructurado del workflow;
    el efecto colateral (rondas de refuerzo/verificación de más) no violó
    ninguna regla — cada ronda de más fue una verificación independiente
    genuina, no un cambio de comportamiento espurio, y quedó documentada
    en las bitácoras. (3) `node .harness/harness.mjs init` dio timeouts de
    arranque de worker de Vitest (`environment` a 781 s) por saturación de
    CPU de un clúster de 9 procesos `claude.exe` residuales de un día
    anterior (no relacionados con la colisión anterior); repetir la corrida
    bastó para obtener 580/580 verde de forma estable, mismo criterio de
    cautela ya usado en `pagina_blog`/`campanas_portada` ante colisiones.
  - **Notas heredadas resueltas en el cierre** (mismo patrón que
    `pagina_campanas`/`pagina_blog`): `features/ensamblaje_landing.feature`
    @s12 ya no tenía ningún destino real que lo satisficiera (las tres
    rutas de subpágina — 16, 17, 18 — tienen ya su propia página) —
    **retirado** (no solo re-acotado, como en los dos cierres anteriores,
    porque esta vez la lista de pendientes queda vacía; mantenerlo habría
    sido un escenario sin ningún caso real, patrón
    `verde-por-vacuidad-en-puerta-de-verificacion`), con nota explicativa
    en la cabecera del fichero y en el hueco que deja entre @s11 y @s13.
    `src/App.test.tsx` tenía un comentario desactualizado (afirmaba que
    `RUTAS_DE_SUBPAGINA` valía `['/campanas', '/blog', '/tienda']`, cuando
    ya vale `[]`) — corregido por `tdd_craftsman` (comentario únicamente,
    cero cambio de aserción, verificado por mí de forma independiente con
    `git diff` + `node .harness/harness.mjs init`).
  Marcado `done` en `feature_list.json` por mí (craftsman_lead). Con las
  tres subpáginas (16-18) ya `done`, las "seis páginas publicadas" que
  `seo_estructura` (id 15) exige existen todas de verdad: **arranca
  `seo_estructura`** — única feature `in_progress`, respetando
  `one_feature_at_a_time`.
- **Reordenación (21/08/2026): `seo_estructura` (id 15) sigue bloqueada,
  ahora por `pagina_campanas`/`pagina_blog`/`pagina_tienda` (16-18), no por
  el ensamblaje.** `seo_estructura.feature` @s4/@s5/@s6/@s12/@s19 exigen
  "las seis páginas publicadas" (inicio, campañas, ficha de campaña, blog,
  artículo de blog, tienda) con título/descripción/JSON-LD propios. Tras
  `ensamblaje_landing`, `/campanas`/`/blog`/`/tienda` solo sirven el
  catch-all genérico "Página no encontrada" — no son las páginas reales que
  `seo_estructura` necesita. Reordenación mecánica dentro de contratos YA
  aprobados (16-18 son `spec_ready` desde el 18/08/2026, ninguna decisión
  nueva que requiera al humano): construyo 16 → 17 → 18 primero, y vuelvo a
  `seo_estructura` cuando las seis páginas existan de verdad.
- **Feature en curso:** pagina_tienda (id 18) — `tdd_craftsman` ronda 1
  **completa**, 44/44 escenarios (@s1-@s44) por TDD estricto desde cero,
  pendiente de `judge` y `mutation_tester`. Entregables: `src/data/tienda.ts`
  (`CATEGORIAS_TIENDA` fijas del cliente + `PRODUCTOS_DEMO`, 8 productos
  literales del Background, `importeCentimos` ya en céntimos enteros —
  conversión euro→céntimo hecha una sola vez a mano, con el euro original
  en comentario, nunca parseada en runtime), `src/pages/PaginaTienda-logica.ts`
  (`construirCatalogoTienda` fail-closed categoría/importe + descarte
  silencioso de nombre vacío, `formatearImporte` vía `Intl.NumberFormat`
  verificado con Node antes del primer test, `filtrarProductosPorCategoria`,
  reducer de cesta `anadirUnidad`/`quitarUnidad`/`fijarCantidad`/
  `eliminarLinea`/`vaciarCesta` con tope de 99 y rechazo de cantidad
  inválida sin clampar, `calcularResumenCesta` sumando céntimos enteros,
  `formatearContadorArticulos`/`rotuloBotonAnadir`/`nombreAccesibleBotonAnadir`),
  `src/pages/PaginaTienda.tsx` (filtro `aria-pressed`, rejilla con estados
  vacíos, `PanelCesta`: `<dialog open aria-modal="true">` nativo con
  `aria-labelledby`, foco al abrir, Escape vía listener de `document` en
  `useEffect` — no `onKeyDown` en el propio diálogo, por
  `jsx-a11y/no-noninteractive-element-interactions` — foco de vuelta al
  botón de la cesta al cerrar). Router: `/tienda` aterriza su propia
  `<Route>` en `App.tsx`, añadida a `RUTAS_YA_CON_PAGINA_PROPIA`
  (`App-logica.ts`); `RUTAS_DE_SUBPAGINA` queda **vacía** (esperado: ya no
  quedan subpáginas de `navegacion.ts` sin página propia). `App.test.tsx`:
  se retira el `it.each(['/tienda'])` del catch-all de casos conocidos (ya
  no tiene ningún caso), sin tocar @s7 (shell común)/@s12 refuerzo/@s13
  (catch-all genérico para rutas no registradas, que sigue vigente sin
  cambios). `App-logica.test.ts`: literal `['/tienda']` → `[]`, verificado
  en rojo antes del cambio de producción. 9 escenarios "verde a la primera"
  (@s2, @s3, @s4, @s7, @s12, @s20, @s22, @s27, @s28), 2 de los de mayor
  riesgo (@s27, @s40) verificados con sabotaje manual explícito (mensaje de
  error confirmado, revertido). `pnpm run test`: 562/562 (baseline 484/38 →
  562/40). `pnpm run lint && pnpm run typecheck`: limpio.
  `node .harness/harness.mjs init`: verde de punta a punta. `features/
  ensamblaje_landing.feature` NO se toca en esta ronda (lo hace el
  `craftsman_lead` al cierre, mismo patrón que `pagina_campanas`/
  `pagina_blog`). Trazabilidad @s→test completa, con nota de diseño y diff
  exacto del router, en `progress/tdd_pagina_tienda.md`.
- **`pagina_tienda` ronda 2 (refuerzo tras `judge`):** `judge` ronda 1
  **CHANGES_REQUESTED** (`progress/judge_pagina_tienda.md`), 2 hallazgos:
  (1) 16 aserciones `getByText('...€')` en `PaginaTienda.test.tsx` usaban
  espacio ASCII en vez del espacio duro U+00A0 que exige la cabecera del
  `.feature`, y pasaban solo porque el normalizador de Testing Library
  colapsa cualquier espacio a ASCII antes de comparar — no verificaban
  fidelidad byte a byte; (2) `PanelCesta` declaraba `aria-modal="true"` sin
  atrapar el foco de verdad: Tab/Shift+Tab podían escapar hacia los chips
  de filtro y la rejilla de detrás. `tdd_craftsman` ronda 2: (1) corrigió
  las 16 aserciones al espacio duro real Y añadió `{ collapseWhitespace:
  false }` (sin esa opción el fix literal rompía los tests: el
  normalizador solo normaliza el texto del DOM, nunca el matcher —
  diagnosticado leyendo el código fuente de `@testing-library/dom`,
  verificado con sabotaje manual: 10 tests en rojo con `formatearImporte`
  saboteado a espacio ASCII, revertido a 35/35 verde); (2) implementó un
  atrapa-foco real (`elementoTrasAtraparFoco`, función pura nueva en
  `PaginaTienda-logica.ts`, cableada en el listener de `document` ya
  existente de `PanelCesta`) con test de integración nuevo (Rojo→Verde,
  tabula repetidamente en ambos sentidos y comprueba que el foco nunca sale
  del diálogo) + 6 tests unitarios directos de la función pura, todos
  verificados con sabotaje manual (4/7 tests en rojo con la función
  saboteada a `return null` fijo). `pnpm run test`: 569/569 (562 → 569, +7).
  `pnpm run lint && pnpm run typecheck`: limpio. `node .harness/harness.mjs
  init`: verde de punta a punta. Detalle completo (diagnóstico técnico,
  trazabilidad, evidencia de sabotaje) en la sección "Ronda 2" de
  `progress/tdd_pagina_tienda.md`. Pendiente de nuevo veredicto del `judge`
  y de `mutation_tester`.
- **`pagina_tienda` ronda 3 (refuerzo tras `judge`):** `judge` ronda 2
  **CHANGES_REQUESTED** (`progress/judge_pagina_tienda.md`), 1 hallazgo
  bloqueante: de las 18 aserciones `getByText('...€')` que exigen fidelidad
  byte a byte del espacio duro U+00A0, la ronda 2 corrigió solo 16 — las 2
  de `@s29` (`PaginaTienda.test.tsx:370-371`) seguían con espacio ASCII y
  sin `{ collapseWhitespace: false }`, confirmado por el `judge` con
  sabotaje manual en vivo (10 tests en rojo, pero `@s29` quedaba en verde).
  `tdd_craftsman` ronda 3: cambio mínimo, solo esas 2 aserciones (mismo
  patrón que las otras 16), verificado con el mismo sabotaje reproducido de
  forma independiente antes y después del fix (rojo confirmado con el fix
  aplicado + sabotaje activo; revertido a 86/86 verde). Cero producción
  tocada en el estado final. `pnpm run test`: 569/569 (sin cambio de
  conteo). `node .harness/harness.mjs init`: verde de punta a punta. Detalle
  en la sección "Ronda 3" de `progress/tdd_pagina_tienda.md`. Pendiente de
  nuevo veredicto del `judge`.
- **`pagina_tienda` ronda 5 (refuerzo tras `judge`, encargo etiquetado
  "ronda 4" pero numerado Ronda 5 en la bitácora para no chocar con una
  sección previa que documentaba un contenido ya sobrescrito de
  `progress/judge_pagina_tienda.md`):** `judge` **CHANGES_REQUESTED**, 1
  hallazgo bloqueante: `@s9` (`PaginaTienda.test.tsx`, describe `@s9`) solo
  verificaba el conteo (`toHaveLength(2)`) y `aria-pressed` tras filtrar por
  "Descanso", nunca CUÁLES productos se muestran — el `Then` del
  `.feature` exige los nombres accesibles exactos. El `judge` demostró con
  sabotaje propio (`productosFiltrados` forzado a filtrar "Paseo" cuando
  `categoriaActiva === 'Descanso'`) que toda la suite (86/86) seguía en
  verde con ese defecto de cableado real en `PaginaTienda.tsx`, fuera del
  glob de mutación de Stryker. `tdd_craftsman` ronda 5: reprodujo el mismo
  sabotaje de forma independiente (86/86 verde confirmado antes de tocar
  nada), añadió 1 aserción dentro del test existente de `@s9` (mismo patrón
  que `@s13`: `getAllByRole('heading', { level: 2 }).map(...).toEqual([...])`
  con los 2 literales exactos, incluido el signo `×` U+00D7), confirmó ROJO
  con el sabotaje activo + fix aplicado (falla mostrando "Arnés"/"Correa" en
  vez de "Cama"/"Manta"), revirtió el sabotaje → 86/86 verde. Cero
  producción tocada en el estado final. Nota de colisión: una primera
  corrida de `node .harness/harness.mjs init` dio un falso rojo transitorio
  con 10 procesos `claude.exe` simultáneos detectados en la máquina (mismo
  patrón de colisión ya anotado en esta bitácora); repetida de inmediato,
  **569/569 verde de forma estable**. Detalle en la sección "Ronda 5" de
  `progress/tdd_pagina_tienda.md`. Pendiente de nuevo veredicto del `judge`
  y de `mutation_tester`.
- **Fase:** `tdd_craftsman` → `judge` → `mutation_tester` (umbral 1.0)
- **`pagina_blog` (id 17): DONE.** 31/31 escenarios, 3 rondas. Entregables:
  `src/data/blog.ts` (`ARTICULOS_DEMO`, 6 artículos literales del
  Background, tipo sin campo de autor/firma/iniciales — R1),
  `src/lib/desplazamiento.ts` (`decidirComportamientoDesplazamiento`, helper
  compartido nuevo, envoltorio de `prefiereMenosMovimiento` — no se tocó
  `PaginaCampanas-logica.ts`, ya `done`/mutado 100%; duplicación menor
  aceptada como no bloqueante, consolidar cuando una 3ª página lo necesite),
  `src/pages/PaginaBlog-logica.ts` (`CATEGORIAS_PUBLICADAS` derivada de
  `SERVICIOS`, `filtrarPorCategoria`, `construirCatalogoBlog` con validador
  R1+R3 fail-closed y `PATRONES_PROHIBIDOS_DE_CONTENIDO`, tiempo de lectura
  a 200 ppm, `articulosRelacionados` con tope de 3), `src/pages/PaginaBlog.tsx`
  (listado "/blog" con filtro + artículo "/blog/:identificador" con
  `role="article"`). Ruta de detalle es SEGMENTO de ruta, no query param (a
  diferencia de `/campanas?campana=`). `App.tsx`/`App-logica.ts` registran
  las rutas reales del blog (`RUTAS_DE_SUBPAGINA` pasa de
  `['/blog','/tienda']` a `['/tienda']`), sin tocar `pagina_campanas`/
  `cabecera_y_navegacion`/`ensamblaje_landing` ya `done`. `judge` ronda 1:
  **CHANGES_REQUESTED** (bloqueante: `desplazamiento.ts` sin consumidor
  real). `tdd_craftsman` ronda 2: lo cablea en `VistaArticulo`. `judge`
  ronda 2: **APROBADO**. `mutation_tester` ronda 1: **FAIL** 83.90% (17
  supervivientes reales en `PaginaBlog-logica.ts`). `tdd_craftsman` ronda 3:
  13 tests dirigidos, cero producción nueva. `judge` ronda 3: **APROBADO**,
  reprodujo ella misma 2 de los 17 sabotajes con resultado idéntico.
  `mutation_tester` ronda 2: **PASS** 113/113 = 100% sobre no equivalentes
  (2 equivalentes genuinos en `resolverArticulo`, guarda redundante dado el
  tipo no-opcional de `identificador`). `bin/harness init` verde: 484/484.
  **Deuda de contrato resuelta en el cierre** (mismo patrón que
  `pagina_campanas`): `features/ensamblaje_landing.feature` seguía citando
  "/blog" en su catch-all (@s12 y nota de cabecera) — corregido yo mismo
  para cubrir solo "/tienda" (18, única `spec_ready` que queda). Yo
  (craftsman_lead) releí `progress/tdd_pagina_blog.md`,
  `progress/judge_pagina_blog.md` y `progress/mutation_pagina_blog.md`
  completos y repetí `node .harness/harness.mjs init` de forma independiente
  antes de marcar `done`.
- **Fase:** `tdd_craftsman` → `judge` → `mutation_tester` (umbral 1.0)
- **`pagina_campanas` (id 16): DONE.** La feature más grande del proyecto
  hasta ahora (41 escenarios), 2 rondas. Entregables:
  `src/pages/PaginaCampanas.tsx` + `PaginaCampanas-logica.ts`
  (`construirCatalogoCampanas` con guardas de fallo cerrado
  precio/vigencia/plazas/duración/punto-no-publicado, `resolverVista`,
  `otrasCampanas`, `decidirComportamientoDesplazamiento` reutilizando
  `prefiereMenosMovimiento` de `Galeria-logica.ts`). Listado + ficha de
  detalle vía `/campanas?campana=<id>`, gestión de foco al abrir, migas de
  pan, 3 ramas de scroll con `prefers-reduced-motion`, transcripción literal
  de puntos desde `SERVICIOS`. Registra la ruta real `/campanas` en
  `App.tsx`/`App-logica.ts` (quitándola del catch-all de `ensamblaje_landing`,
  cambio ya previsto por el propio contrato de esa feature) y actualiza
  `App.test.tsx` en consecuencia. Extiende `CAMPANAS_DEMO` y
  `Cabecera`/`Cabecera-logica.ts` (`rutaActual`, aditivo) sin romper
  `campanas_portada` (24 tests) ni `Cabecera.test.tsx` (16 tests), ambos
  reverificados en verde sin tocarlos. `judge` ronda 1: **APROBADO**.
  `mutation_tester` ronda 1: **FAIL** 93.75% (8 supervivientes reales).
  `tdd_craftsman` ronda 2: 8 tests dirigidos, cero producción nueva. `judge`
  ronda 2: **APROBADO**, releyó el contrato completo (541 líneas) y verificó
  ella misma las regresiones de `campanas_portada`/`ensamblaje_landing`/
  `cabecera_y_navegacion` en vivo. `mutation_tester` ronda 2: **PASS**
  130/130 = 100% sobre no equivalentes (1 equivalente genuino en
  `Cabecera-logica.ts:18`, `esMovil`, verificado por análisis exhaustivo de
  todo el dominio de `number`). `bin/harness init` verde: 406/406.
  **Deuda de contrato detectada y resuelta en el cierre**: `judge` señaló que
  `features/ensamblaje_landing.feature` (ya `done`) seguía afirmando en su
  texto que `/campanas` sirve el catch-all — cierto en código hasta esta
  feature, ya no. Cambio de comportamiento pre-aprobado por el humano
  (PREGUNTA ABIERTA 2 de `project-spec.md` + criterio de aceptación de la
  feature 20), solo el texto Gherkin no se había sincronizado. Corregido yo
  mismo (edición de formato/hechos ya decididos, no diseño nuevo): @s12 y la
  nota PENDIENTE de cabecera ahora cubren solo `/blog`/`/tienda`. Yo
  (craftsman_lead) releí `progress/tdd_pagina_campanas.md`,
  `progress/judge_pagina_campanas.md` y `progress/mutation_pagina_campanas.md`
  completos y repetí `node .harness/harness.mjs init` de forma independiente
  antes de marcar `done`.
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
