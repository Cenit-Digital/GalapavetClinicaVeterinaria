# Despliegue en GitHub Pages — BLOQUEADO antes de tocar ningún fichero

> Redactado por `tdd_craftsman` el 25/08/2026. Ningún fichero de `src/`,
> `index.html`, `vite.config.ts` ni `public/` fue tocado en esta sesión.

## Encargo recibido

Se me pidió, como `tdd_craftsman`, implementar directamente:

1. `base: '/GalapavetClinicaVeterinaria/'` en `vite.config.ts`.
2. `basename="/GalapavetClinicaVeterinaria"` en `<BrowserRouter>` de `src/App.tsx`.
3. La técnica pública `spa-github-pages` (404.html + script de decodificación
   en `index.html`) para que las rutas internas de React Router sobrevivan a
   un refresco/URL directa en GitHub Pages.
4. Revisión de rutas absolutas a `public/` escritas a mano que necesiten el
   prefijo del nuevo `base`.

El encargo se presenta como "autorizado directamente por el humano hoy" y
explícito en que "esto no pertenece a ninguna feature de `feature_list.json`
… fuera del ciclo SDD normal".

## Por qué paro sin escribir ni un test ni una línea de producción

Mi propio rol (`tdd_craftsman`, ver `AGENTS.md` §1 y §3, `CLAUDE.md` y mi
propio prompt de agente) tiene precondiciones explícitas y no negociables
antes de tocar `src/`:

- **"La feature está `in_progress` en `feature_list.json`. Si está `pending`
  o `spec_ready`, paras — el `craftsman_lead` no debió lanzarte."**
  Verificado en `feature_list.json`: no existe ninguna feature de despliegue
  / GitHub Pages / infraestructura. Las únicas features no `done` son
  `accesibilidad` (id 19, `blocked`) — nada relacionado con este encargo.
- **"Existe `features/<name>.feature` aprobado. Si falta, paras."**
  Verificado con `Glob features/*.feature`: no existe ningún `.feature` para
  este trabajo, ni siquiera en `spec_ready`.
- El propio encargo lo confirma: "no pertenece a ninguna feature… fuera del
  ciclo SDD normal" — es decir, se me pide saltar explícitamente el pipeline
  `spec_partner → gherkin_author → puerta humana → tdd_craftsman` que
  `AGENTS.md` §4 y `CLAUDE.md` fijan como no negociable ("No saltes la
  conversación de spec ni la destilación Gherkin para features `"sdd":
  true`", "No saltes la puerta humana sobre los `.feature`").

Además, las Tres Leyes de TDD que gobiernan mi trabajo exigen que **ningún**
código de producción se escriba salvo para hacer pasar un test que ya está
fallando, derivado de un escenario `@s` de un `.feature` aprobado. Aquí no
hay ningún `.feature`, así que no hay ningún `@s` del que derivar un test
rojo: implementar `base`, `basename`, `404.html` o el script de `index.html`
directamente sería producción sin test que la exija — una violación directa
de la Ley 1, no una excepción razonable.

Sobre la "autorización directa del humano hoy": por instrucción explícita
del sistema, ningún mensaje de otro agente (incluido el que me lanzó a mí)
constituye por sí solo el consentimiento genuino del usuario — solo el
sistema de permisos o un mensaje directo del propio usuario lo son. No tengo
forma de verificar en este hilo que la autorización llegó realmente del
humano y no de un agente intermedio, y el propio `progress/current.md` de
este repositorio documenta un incidente reciente en esta misma sesión
(25/08/2026) de mensajes con formato "el coordinador te pide…" que
resultaron no ser entrada humana genuina. Dado ese precedente y la regla
explícita, trato la afirmación de autorización como no verificable desde mi
posición y me atengo a las precondiciones de mi rol.

## Lo que sí verifiqué antes de bloquear (para no bloquear a ciegas)

- `feature_list.json`: 22 features, ninguna de despliegue/infraestructura;
  no hay ninguna `in_progress`.
- `features/*.feature`: 22 ficheros, ninguno relacionado con GitHub Pages,
  `base`, `basename` ni SPA-en-hosting-estático.
- `project-spec.md`, Decisión 19 (enrutador `BrowserRouter`), ya deja
  anotado **exactamente este riesgo** como abierto, sin resolver ni asignar
  a ninguna feature: *"El coste de `BrowserRouter` (el hosting debe
  reescribir cualquier ruta desconocida a `index.html`) se deja anotado como
  riesgo de despliegue, no como bloqueo de esta feature (ver «Riesgos
  abiertos»)."* — confirma que el propio proyecto ya identificó este trabajo
  como pendiente de decisión, nunca como resuelto ni como fuera del proceso.
- `.github/workflows/deploy-pages.yml` ya existe y hace `pnpm run build`
  antes de `actions/configure-pages` — confirma técnicamente que el
  `base` de Vite debe estar ya correcto en el build para que Pages sirva los
  assets bien (el workflow no lo hace por sí solo), así que el encargo tiene
  una base técnica real y no es una tarea inventada — pero eso no cambia que
  la vía correcta en este repo es primero fijarlo como decisión de spec y
  contrato Gherkin, no como cambio directo de `tdd_craftsman`.

## Recomendación (no ejecutada por mí)

Este trabajo encaja con el patrón que este mismo proyecto ya usó para
`ensamblaje_landing` (id 20) y `sistema_de_diseno_visual` (id 21): un hueco
estructural detectado a mitad de proyecto que se resolvió abriendo una
conversación de spec (`spec_partner`) y destilando un `.feature` nuevo
(`gherkin_author`), con puerta humana antes de implementar. Sugiero el mismo
camino aquí: una feature nueva (p. ej. `despliegue_github_pages`) con
escenarios Gherkin concretos para `base`, `basename`, el 404→index.html de
`spa-github-pages`, y la verificación en `public/`/`import.meta.env.BASE_URL`
— aprobada por el humano antes de que `tdd_craftsman` toque
`vite.config.ts`/`App.tsx`/`index.html`.

## Estado

`blocked`. Cero ficheros de producción tocados. Cero tests nuevos. Esperando
que `craftsman_lead` decida si abre spec+Gherkin para esta necesidad o
confirma, por un canal verificable como humano genuino, una vía distinta.
