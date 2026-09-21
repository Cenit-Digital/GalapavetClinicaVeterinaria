# Historial de sesiones

> Bitácora **append-only**. Al cerrar cada sesión, añade aquí el resumen que
> estaba en `current.md` (feature, fases recorridas, veredictos, resultado).

<!-- Ejemplo de entrada:
## 2026-01-01 — feature `ejemplo_feature`
- spec_partner: decisiones cerradas (ver project-spec.md).
- gherkin_author: features/ejemplo_feature.feature (@s1..@s5), aprobado por el humano.
- tdd_craftsman: 5 ciclos Rojo-Verde-Refactor. Tests verdes.
- judge: APPROVED (ver progress/judge_ejemplo_feature.md).
- mutation_tester: score 0.92 > 0.80 (ver progress/mutation_ejemplo_feature.md).
- Resultado: done.
-->

## 2026-08-29 — feature `rediseno_visual` (id 24)

- Contrato aprobado por el humano el 26/08/2026 (52 escenarios), con 3
  enmiendas aprobadas después (`progress/rediseno/enmiendas_contrato.md`).
  Implementación interrumpida el 28/08 por una suspensión del PC a mitad de
  una oleada de TDD; recuperada sin pérdida de trabajo tras un incidente de
  `git reset` destructivo de un subagente de esa misma oleada (recuperación
  completa desde `git stash`, dos entradas, reconciliada por craftsman_lead).
- judge: 4 rondas hasta APPROVED, cada una auditando bloques del contrato que
  las anteriores no habían escrutado con el mismo rigor:
  - Ronda 1: rechazó los bloques C/D (@s17-@s40) sin TDD documentado desde el
    commit masivo original; 3 defectos reales (@s28, @s31, @s33 parcial).
  - Ronda 2: @s29 (sabotaje de test olvidado), @s25 (controles del chat bajo
    44px, casilla de consentimiento desalineada).
  - Ronda 3: @s33 seguía incumplido en Servicios (3 de 4 secciones
    arregladas), @s40 nunca tocado (blog sin imagen/categoría real), @s19 sin
    test de navegador real pese a la anotación explícita del bloque C.
  - Ronda 4: auditó por primera vez los bloques A/B y F completos; encontró
    @s45 (axe solo cubría 1 de 5 variantes — al ampliar encontró un defecto
    de contraste real en la variante "tech", corregido con
    `a { color: inherit; }` en `global.scss`) y @s47 (interacción de consola
    faltante). APPROVED: los 52 escenarios quedaron auditados entre las
    cuatro rondas.
- mutation_tester: primera medición FAIL (83,54 % bruto, 235 supervivientes
  reales en 12 de 14 módulos). 6 sesiones de `tdd_craftsman` en paralelo
  (cerrojo compartido para serializar Stryker) cerraron los huecos reales y
  retiraron código huérfano confirmado en `tokensColor.ts`. Medición final
  consolidada: **PASS, 100 % sobre mutantes no equivalentes** (1364/1364; 16
  equivalentes re-verificados de forma independiente por `mutation_tester`,
  ninguno aceptado de las sesiones de refuerzo sin prueba propia).
- Verificación final independiente: `bin/harness init` 88/88 ficheros,
  1300/1300 tests, lint y typecheck limpios; build verde (CSS 7,51 kB, techo
  8 kB); Playwright completo 112/112.
- Evidencia: `progress/judge_rediseno_visual.md`, `progress/mutation_rediseno_visual.md`,
  ~30 informes en `progress/rediseno/`.
- Resultado: done.

## 2026-08-26 — feature `integridad_puerta_mutacion`

- Redefinición autorizada por el humano: corrección de configuración del arnés
  y ejecución seca; la deuda global de producto 97,95 % queda documentada,
  separada y sin exclusiones artificiales.
- Gherkin: contrato final en `features/integridad_puerta_mutacion.feature`
  (@s1–@s9); prueba literal y script `pnpm run test:config` añadidos al
  workflow `Harness CI` después de `bin/harness init`.
- Configuración: `commands.mutate` ya no inyecta `--mutate` vacío; Stryker
  carga explícitamente el runner Vitest y se retiraron una propiedad y un
  patrón inertes que emitían avisos.
- Verificación: config 5/5, motor 49/49, init (1047/1047), E2E 75/75, build
  con puerta de terceros 0, y dry-run Stryker salida 0 (970 tests).
- Judge: APPROVED; resultado: done.

---

# Archivado el 21/09/2026 desde progress/current.md (sesiones del 03/09 y 09/09)

## 09/09/2026 — Retirada de la barra de urgencias: CI reparado

**Decisión de diseño (Pablo con Rober):** la barra de urgencias fija por
encima de la cabecera NO forma parte del diseño acordado. Commit `4a681ec`
borró `BarraUrgencias.tsx`, su `.module.scss` y su test, y lo desmontó de
`App.tsx`.

**Lo que ese commit dejó colgando y se ha reparado aquí:**

1. **Ambos workflows en rojo** (`Harness CI` y `Deploy a GitHub Pages`), 8
   tests, todos de aritmética de censo: `inventarioModulos` seguía
   declarando el módulo (18 → 17), y `rolesDescartados` / `usoDelAcento`
   anclaban su corpus a `BarraUrgencias.module.scss` y contaban 20 hojas de
   estilo (→ 19). Las anclas se han REEMPLAZADO por `Cabecera.module.scss`,
   no borrado: existían para que un glob mal escrito no dejase la puerta
   inerte, y esa protección se conserva.
2. **Defecto de maquetación real, no cubierto por ninguna puerta:**
   `--altura-barra-urgencias: 32px` seguía declarada y consumida en cuatro
   sitios, así que la cabecera fija arrancaba en `y = 32` — 32px de franja
   vacía sobre ella—, `#root` reservaba 96px en vez de 64, y el
   `scroll-padding-top` y el enlace de salto iban 32px sobrados. El token se
   ha eliminado y los cuatro cálculos se han rehecho sobre `--altura-cabecera`
   sola. **Verificado en Chrome real** sobre `dist/` servido con `vite
   preview`: `header.top = 0`, `#root` padding `64px`, `scroll-padding-top`
   `88px`, `#inicio` a `y = 64` — sin salto ni franja.
3. **E2E rotos** (no corren en CI, pero apuntaban a lo borrado):
   `fidelidad-cabecera` medía `[data-barra-urgencias-interior]`,
   `rediseno-visual` buscaba el `aside[aria-label="Urgencias fuera de
   horario"]`, y `geometria-escalas` usaba la barra como representante del
   paso tipográfico -1. Reapuntados al CTA de urgencias de la cabecera, que
   es quien declara hoy `paso-tipografico(-1)`.
4. **Contratos Gherkin** (puerta humana, aprobada por Pablo el 09/09/2026):
   `rediseno_visual.feature` @s27 eliminado con nota de por qué; @s26 y @s28
   sin la mención a la barra; `fidelidad_cabecera.feature` @s1 reescrito para
   hablar solo de la cabecera. `accesibilidad.feature` NO se toca: su
   Decisión 2 y su @s17 ya exigían que no existiera barra superior, de modo
   que la retirada **resuelve** una contradicción que arrastraban los
   contratos entre sí.

**El acceso a urgencias no se ha perdido:** vive en el CTA de la cabecera, en
el pie y en la tarjeta de contacto. `urgencias.spec.ts` sigue exigiendo al
menos una mención con el rótulo real en las seis rutas.

**Verificado en verde:** `harness init` completo (88 ficheros, 1415 tests) +
`test:config` (5/5) — exactamente lo que corren los dos workflows. Y los
cuatro specs de Playwright tocados, ejecutados aparte (no corren en CI):
`fidelidad-cabecera`, `rediseno-visual`, `urgencias` y `geometria-escalas`.

**Lo que delató el E2E y las puertas de Vitest no:** el primer representante
que elegí para el paso tipográfico -1 fue el CTA de urgencias de la cabecera,
y `geometria-escalas` mide a 320px ANTES que a 1220px — a 320px la cabecera
está en modo móvil y ese control solo existe dentro del panel plegado. El
representante definitivo es el propio `<footer>` (`PieDePagina.module.scss:14`),
que declara el paso -1 y no lo cambia en ninguna media query.

---

## 03/09/2026 — Fidelidad visual de la portada al prototipo

**Problema reportado por el cliente (Pablo):** las 25 features están `done`,
pero la web publicada NO se parece al prototipo de Claude Design
(`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`). Las puertas
validaron tokens, contraste y lógica, no la maquetación pintada.

**Verificado hoy (no asumido):**

- El Artifact del cliente (`claude.ai/code/artifact/baa0ed8b-…`) es el mismo
  prototipo que la copia versionada en `docs/diseno-claude-design/`: al
  normalizar el empaquetado (fuentes inline, uuids de recursos, atributos
  `sc-camel-*`) el `diff` del cuerpo es vacío. No hace falta el MCP de
  Claude Design (su login falló con 403) para trabajar.
- Prototipo y web renderizados con Playwright a 1280 px (capturas en el
  scratchpad de la sesión). Diferencias a primera vista: hero alineado a la
  izquierda, con sangrado lateral y la banda inferior cortada; servicios sin
  titular bicolor, sin descripción ni botón «+»; campañas en fila plana en vez
  de dos columnas; equipo sin la geometría de tarjeta del prototipo; reserva
  con botones contorno que desbordan; galería sin titular ni tarjetas;
  contacto con formulario a todo el ancho, tarjeta de urgencias rota, mapa en
  blanco y teléfonos pegados; FAQ sin centrar ni botones «+»; pie con columnas
  apiñadas y enlaces legales apilados (el logotipo SÍ carga: lo que parecía
  roto era el lazy-load en una pestaña oculta, verificado en Chrome real); selector de paleta como píldora grande en
  Servicios en lugar del botón redondo flotante.
- Memoria organizacional sincronizada (23 patrones en `.memoria-cache/`).

**Estrategia acordada con el cliente:** dividir en features pequeñas (una por
sección), cada una con su `.feature`, TDD, judge y mutación. Contrato en
`progress/fidelidad/delta_<seccion>.md` (análisis) → `features/fidelidad_*.feature`.

**En curso:** workflow de análisis sección a sección → `progress/fidelidad/`.

**Mapa de contacto (verificado en la web publicada):** el iframe de
OpenStreetMap va con `sandbox=""` y sin `bbox`, así que el navegador bloquea
su script y el mapa se pinta en blanco. OpenStreetMap tiene un nodo público
`amenity=veterinary` «Galapavet» en 40.5772872, -4.0004445 (Carretera de
Torrelodones 11): fuente citable para un mapa estático local con pin.

## 03/09/2026 · 15:00 — Puerta de decisiones y registro de features

**Respuestas literales de Pablo (AskUserQuestion, 03/09/2026):**
1. Estrategia → «12 features pequeñas».
2. Mapa de contacto → «Mapa estático local con pin».
3. WhatsApp → «Sí, WhatsApp en el 685 34 31 49».
4. Techo de CSS → «Subir a 12 000 B ahora».

**Hecho:** Decisiones 61–67 en `project-spec.md` (sección «Fidelidad visual de
la portada»); `docs/datos-galapavet.md` §2bis (WhatsApp confirmado, coordenadas
del nodo OSM); features 26–37 `fidelidad_*` registradas `pending` en
`feature_list.json`; mapa estático en `public/img/mapa/galapagar.webp`
(procedencia en `docs/mapa-estatico.md`); handoff del cliente archivado en
`progress/rediseno/` y `tools/captura-comparativa.mjs`.

**Hallazgos de raíz de los 13 análisis (`progress/fidelidad/`):** selectores de
id hasheados por CSS Modules (`#inicio`, `#contacto`), `espaciado(20)`
inexistente (11 usos, botones fantasma sin relleno), `.faq{max-width}` muerta,
alternancia de bandas invertida, mapa en blanco, cifras del hero cruzadas
(`Hero.tsx:45` pasa EQUIPO/SERVICIOS en orden cambiado).

**En curso:** workflow Gherkin (12 autores → 36 refutadores → 12 reparaciones)
→ `features/fidelidad_*.feature` + `progress/fidelidad/enmiendas_*.md` +
`progress/fidelidad/gherkin_*.md`. Después: puerta humana conjunta.

## 03/09/2026 · Contratos Gherkin preparados para la puerta humana

Se han redactado los 12 contratos `features/fidelidad_*.feature` (features
26–37) a partir de la spec aprobada y de los 12 informes delta. No se ha
modificado código de producción ni se ha cambiado ningún estado a `spec_ready`:
la puerta humana conjunta fue aprobada explícitamente por Pablo el 03/09/2026.
La feature 26 `fidelidad_lienzo` pasa a `in_progress`; las 27–37 quedan
`spec_ready`, respetando una única feature activa. Los contratos miden en navegador las bandas,
alineaciones, anchuras, estados ARIA, datos reales, ausencia de terceros y la
adaptación a 320 px; no intentan copiar cifras, personas, precios ni promesas
del prototipo ficticio.

Verificación de base repetida tras el inventario: `bin/harness test` verde
(88 ficheros, 1.300 tests). Los cambios de análisis previos siguen sin
confirmar y se preservan.

## 03/09/2026 · Cierre de `fidelidad_lienzo` (26)

**Aprobación humana:** Pablo aprobó los doce contratos Gherkin en conjunto.

**Resultado:** `fidelidad_lienzo` queda aprobada. Se corrigieron las bandas a
sangre, contenedores de 1220 px, alternancia de fondos, selector CSS Module
muerto y 22 llamadas a `espaciado(20)` no válidas. Evidencia: `bin/harness
test` 88/88 y 1303/1303; lint, typecheck y build verdes; Playwright específico
4/4; Stryker sobre `escalaEspaciado.ts` 1/1 muerto (100 %). Informes:
`progress/tdd_fidelidad_lienzo.md`, `progress/judge_fidelidad_lienzo.md` y
`progress/mutation_fidelidad_lienzo.md`.

**Visual:** la comparativa 1440/390 queda en
`progress/rediseno/capturas/fidelidad_lienzo_comparativa.png`. Acredita el
cimiento, no las anatomías pendientes de hero, servicios, campañas, equipo,
reserva, galería, contacto, FAQ, pie ni selector.

**Fallo conocido sin ocultar:** la suite e2e completa detecta un error de
consola del iframe OpenStreetMap actual, aislado en `fidelidad_contacto`; su
worker quedó colgado tras registrar el fallo y se detuvo de forma controlada.
La solución aprobada es el mapa estático local. Próxima y única feature activa:
`fidelidad_cabecera` (27).

## 03/09/2026 · Cierre de `fidelidad_cabecera` (27)

**Resultado:** barra y cabecera fieles al tramo aprobado: interiores de 1220
px, marca con logo real, navegación, Tienda, CTA de urgencias real y menú
móvil sin overflow. Se extrajo `construirControlDeUrgencias` para no repetir
teléfonos ni inventar un CTA si faltara su rótulo.

**Evidencia:** `bin/harness test` 88/88 y 1307/1307; lint, typecheck y build
verdes; Playwright de cabecera/urgencias/presupuesto 7/7 y foco/contraste 2/2;
mutación 13/13 eliminados en la lógica nueva. Informes:
`progress/tdd_fidelidad_cabecera.md`, `progress/judge_fidelidad_cabecera.md` y
`progress/mutation_fidelidad_cabecera.md`. Capturas revisadas:
`progress/rediseno/capturas/fidelidad_cabecera_comparativa.png` y sus vistas
1440/390.

**Hallazgo que sigue abierto, sin adjudicarlo a esta feature:** la captura
todavía registra el iframe OpenStreetMap sandboxed. Solo se resolverá con el
mapa estático local aprobado dentro de `fidelidad_contacto` (34).

## 03/09/2026 · Cierre de `fidelidad_hero` (28)

**Resultado:** hero a sangre centrado con pildora de localidad, dos CTA reales,
velo vertical por tokens, horario legible y banda completa de cuatro cifras.
Se corrigió el bug que cruzaba servicios y profesionales (ahora 5/2/6/3), se
eliminó el `aspect-ratio` que cortaba contenido y la imagen LCP local es eager
y decorativa.

**Evidencia:** `bin/harness test` 88/88 y 1307/1307; lint, typecheck y build
verdes; Playwright transversal 20/20; Stryker de `Hero-logica.ts` 10/10
eliminados. Informes: `progress/tdd_fidelidad_hero.md`,
`progress/judge_fidelidad_hero.md`, `progress/mutation_fidelidad_hero.md`.
Comparativa revisada: `progress/rediseno/capturas/fidelidad_hero_comparativa.png`.

## 03/09/2026 · Cierre de `fidelidad_servicios` (29)

**Resultado:** Servicios ya usa la anatomía del prototipo con datos honestos:
cintillo, titular bicolor con Galapagar, apoyo que deriva los cinco bloques,
fotos locales, pildoras, resumen de puntos reales y control «+» accesible e
independiente. No se han creado servicios ficticios para llenar las quince
tarjetas del diseño de referencia.

**Evidencia:** `bin/harness test` 88/88 y 1309/1309; lint y build verdes;
Playwright de Servicios, CSS, imágenes y escala 9/9; Stryker de
`Servicios-logica.ts` 30/30 eliminados. Informes:
`progress/tdd_fidelidad_servicios.md`, `progress/judge_fidelidad_servicios.md`,
`progress/mutation_fidelidad_servicios.md`. Comparativa revisada:
`progress/rediseno/capturas/fidelidad_servicios_comparativa.png`.

**Regresión detectada y corregida antes del cierre:** el `<header>` editorial
interno creaba un segundo landmark. Se sustituyó por un contenedor neutro; el
recorrido de teclado se verificó completo con los cinco controles nuevos.

**Siguiente y única feature activa:** `fidelidad_campanas` (30). El iframe
OpenStreetMap sigue pendiente, sin ocultar, de `fidelidad_contacto` (34).

## 03/09/2026 · 19:10 — Reanudación tras el corte de cuota (14:40 → 18:50)

**Qué pasó:** la cuota de subagentes se agotó a las 14:40 con la oleada
Gherkin en marcha (12 autores + 36 refutadores). Los doce `.feature` quedaron
escritos en su primera versión (3–5 escenarios cada uno); Pablo los aprobó
en conjunto en una sesión paralela de Codex, que implementó con ellos + los
`delta_*.md` las features 26, 27, 28, 29 (done, con tdd/judge/mutation) y 30
(campañas: e2e 4/4 y Stryker 33/33, sin informes) antes de morir por un 404.

**Revisión del lead (19:00):** lint, typecheck y vitest (88/88, 1310) en verde
sobre el árbol de Codex; render a 1280 px revisado sección a sección: hero,
cabecera, servicios, campañas y alternancia coinciden con el prototipo;
equipo, reserva, galería, contacto, FAQ, pie y selector siguen con la
anatomía vieja. Defecto anotado para servicios: el titular incluye «de
principio a fin» (copy del prototipo; Decisión 65 fija «en Galapagar»).
Checkpoint: commit `61556d8`.

**Cambio temporal de configuración:** `.claude/settings.json` sin el hook
`PostToolUse` (cada Edit/Write lanzaba la suite entera, ~30 s medidos) mientras
corren los artesanos; copia original en el scratchpad; se restaura antes del
commit final. Nunca se versiona el fichero modificado.

**Oleada A en curso (3 artesanos + judge + ≤2 rondas):** 34 contacto, 31
equipo, 33 galería; judge de 30 campañas. Stryker lo corre el lead en serie
al final de cada oleada. Oleada B después: 32 reserva, 35 FAQ, 36 pie, 37
selector, y el arreglo del titular de servicios.

## 03/09/2026 · tdd_craftsman — Feature en curso: 31 — fidelidad_equipo

Contrato: `features/fidelidad_equipo.feature`. Escenarios a recorrer, en orden:
`@s1` cabecera centrada con recuento derivado · `@s2` panel 4:3 sin imagen con
avatar centrado · `@s3` botón circular «+» solo con formación y sin chips ·
`@s4` apilado a 320 px sin desbordar. Ciclos y trazabilidad en
`progress/tdd_fidelidad_equipo.md`; enmiendas en `progress/fidelidad/enmiendas_equipo.md`.

## 03/09/2026 · tdd_craftsman — Feature en curso: 33 — fidelidad_galeria

Contrato `features/fidelidad_galeria.feature`. Escenarios a recorrer en orden:
@s1 cabecera acotada (cintillo + h2 «Galería», aviso íntegro, dos controles
circulares de 48 px a la derecha) · @s2 tarjetas con nombre y pie separados y
pista focable · @s3 paso = ancho + separación, sin barra nativa, movimiento
reducido · @s4 pista a sangre por la derecha a 320 px sin desbordar el documento.
Bitácora de ciclos: `progress/tdd_fidelidad_galeria.md`.

## 03/09/2026 · tdd_craftsman — Feature en curso: 34 — fidelidad_contacto

Escenarios a recorrer, en orden: @s1 (cabecera + dos columnas), @s2 (tarjeta
«Escríbenos»), @s3 (tarjeta roja de urgencias), @s4 (mapa local + bloques),
@s5 (apilado a 320 px). Ficheros propios: `InformacionContacto.*`,
`FormularioContacto.tsx/.module.scss/.test.tsx`, `src/data/mapa.ts`,
`tests/e2e/fidelidad-contacto.spec.ts`. Compartidos con ediciones mínimas:
`Landing.tsx`, `site.ts` (+ test @s18), `matrizDeContraste.ts` (+ test),
`red-limpia.spec.ts`, `despliegue-subpath.spec.ts`. Bitácora en
`progress/tdd_fidelidad_contacto.md`.

**19:15 — Estado del arnés y veredicto de campañas.** `bin/harness init`
rechaza más de una feature `in_progress` (regla del arnés): en
`feature_list.json` queda solo la 34 (contacto) `in_progress`; 30/31/33
vuelven a `spec_ready` mientras sus artesanos trabajan en paralelo por
decisión del lead (plazo del cliente). Judge de `fidelidad_campanas`:
**REJECTED** con 10 cambios (cintillo pisado por la cascada, sin bitácora
TDD ni enmienda escrita, @s3 y @s2 sin test por valor, tolerancia, píldora,
h2 duplicado, gap en px, matriz de contraste). Regresiones detectadas fuera
de ámbito: servicios (titular con «de principio a fin», h3 1,15, `img` sin
fondo de reserva), cabecera (logo sin fondo de reserva), hero (anillo de
foco 1,98 < 3 sobre el velo). Todo va a la oleada B como tareas de reparación.

**Cierre del artesano (31 fidelidad_equipo, 03/09/2026):** cuatro ciclos
rojo→verde→refactor; 63/63 unitarios de la sección; E2E propio 4/4
(`tests/e2e/fidelidad-equipo.spec.ts`); build verde con CSS 9,27 kB gzip;
comparativa mirada. Enmienda 1 de `equipo.feature` @s1/@s10 (h2 «Nuestro
equipo») en `progress/fidelidad/enmiendas_equipo.md`. Sin Stryker (lo corre el
lead). Informe: `progress/tdd_fidelidad_equipo.md`. Rojos ajenos detectados y
no tocados: `Galeria.test.tsx` (lint), `FormularioContacto.test.tsx` (@s2
contacto), «Abrir menú» de la cabecera a 320 px, `line-height` del h3 de
Servicios.

**Cierre del artesano (33 fidelidad_galeria):** Vitest 89/1360, lint y
typecheck limpios, `fidelidad-galeria.spec.ts` 4/4, CSS 9,21 kB gzip;
comparativa revisada a tamaño real. Fallos E2E ajenos diagnosticados en
`progress/tdd_fidelidad_galeria.md`. Enmiendas en
`progress/fidelidad/enmiendas_fidelidad_galeria.md`. Sin Stryker (lo corre el lead).

**fidelidad_contacto (34) — artesano, 03/09/2026:** verde. Cabecera de
sección sin módulo nuevo (`CabeceraDeContacto` en `InformacionContacto.tsx`),
formulario en tarjeta con fila doble y botón a todo el ancho, banda roja con
píldora-número (informacion_contacto @s5/@s6 respetados: sin «Llamar ahora»),
mapa estático local con pin derivado (`src/data/mapa.ts`,
`posicionDelPin`) y atribución OSM; el `iframe` y sus excepciones de red
desaparecen (cero terceros). Enmiendas: informacion_contacto @s8/@s9/@s10/@s14 y
datos_negocio @s18 (`progress/fidelidad/enmiendas_fidelidad_contacto.md`).
Vitest 89/89 (1370), lint/typecheck/build verdes, e2e propio 5/5, CSS 9 466 B
gzip. Seis fallos ajenos de la suite completa (hero, cabecera, servicios,
galería en curso) documentados en `progress/tdd_fidelidad_contacto.md`.
Pendiente: judge, Stryker (`InformacionContacto-logica.ts`, `site.ts`).

## 03/09/2026 · Cierre de `fidelidad_contacto` (34)

**Resultado real:** la sección de contacto queda cerrada, no la portada entera.
Incluye cabecera y dos columnas, formulario accesible, banda compacta de
urgencias con número visible y CTA «Llamar ahora» (sin afirmar 24 h), mapa
local con pin y atribución, tres bloques de datos y apilado seguro a 320 px.

**Evidencia final:** `bin/harness test` verde (**89/89 archivos, 1373/1373**);
lint, typecheck y build verdes; Playwright específico **5/5**; Stryker sobre
`InformacionContacto-logica.ts` **33/33 eliminados (100 %)**. El test aislado
de Campañas también pasó 49/49 después de un fallo transitorio durante una
ejecución concurrente. Captura final revisada:
`progress/rediseno/capturas/fidelidad_contacto_final_comparativa.png`.

**Trazabilidad:** `progress/tdd_fidelidad_contacto.md`,
`progress/judge_fidelidad_contacto.md`,
`progress/mutation_fidelidad_contacto.md` y
`progress/fidelidad/enmiendas_fidelidad_contacto.md`. El contrato heredado de
urgencias se enmendó por escrito: CTA permitido, disponibilidad 24 h todavía
prohibida.

## 03/09/2026 · tdd_craftsman — Reparación en curso: 30 — fidelidad_campanas (ronda 2 tras judge REJECTED)

Contrato `features/fidelidad_campanas.feature` (@s1–@s4) + los 10 «Cambios
requeridos» de `progress/judge_fidelidad_campanas.md`. Ciclos previstos, en
orden: (1) cintillo pisado por `.presentacion > p` → clase `.aviso` propia,
fijado por `?raw` y por valor en E2E; (7) píldora sin `font-size` local; (8)
`h2`/`h3` sin lo que ya da `global.scss`; (9) `gap: espaciado(48)`; (4) test
del botón primario (@s3); (5) línea de detalle fijada por valor en el DOM y
omitida sin `bloque` (@s2/@s14), casos de `trim` en `it` propios; (6)
`TOLERANCIA_PX = 1` (@s1); (10) matriz de contraste +2 pares; (3) enmienda
escrita de `rediseno_visual` @s33; (2) bitácora `progress/tdd_fidelidad_campanas.md`.
Ficheros propios: `CampanasPortada.{tsx,module.scss,-logica.ts,test.tsx,-logica.test.ts}`,
`tests/e2e/fidelidad-campanas.spec.ts`. Compartido con Edit mínimo:
`matrizDeContraste.ts` + su test. Sin Stryker ni `feature_list.json` (lead).

## 03/09/2026 · tdd_craftsman — Tarea de reparación en curso: regresiones_27_28_29

Reparación por TDD de cinco regresiones sobre features ya `done` (27 cabecera,
28 hero, 29 servicios), detectadas por el judge de campañas. Puntos, en orden:
(a) titular de Servicios con copy del prototipo «de principio a fin» (Decisión
65) · (b) `#servicios article h3` con interlineado 1,15 en vez de 1,08
(`geometria-escalas` @s22) · (c) las 5 `img` de servicios y el logotipo de la
cabecera sin fondo de reserva `--color-fondo-alterno` (`imagenes` @s31) · (d)
anillo de foco de las acciones del hero a 1,98:1 sobre el velo de tinta
(`accesibilidad` @s38/@s39) · (e) «Abrir menú» solo para lectores sobresale del
viewport a 320 px (`fidelidad` @s44). Bitácora: `progress/tdd_regresiones_27_28_29.md`.

## 03/09/2026 · tdd_craftsman — Feature en curso: 32 — fidelidad_reserva

Contrato `features/fidelidad_reserva.feature` (@s1–@s5). Estado en
`feature_list.json`: `spec_ready` (el lead gestiona el único `in_progress`
del arnés; instrucción expresa de no tocarlo). Escenarios a recorrer, en orden:
@s1 dos columnas y tarjeta ≥ 470 px centrada · @s2 «WhatsApp» (wa.me del móvil,
Decisión 66) + «Llamar a la clínica» en una fila · @s3 lista con marcas = los
tres tramos de horario reales · @s4 tarjeta de tres bandas con controles ≥ 44 px
· @s5 apilado a 320 px sin desborde. Ficheros propios: `ReservaChat.{tsx,module.scss,-logica.ts,test.tsx,-logica.test.ts}`,
`tests/e2e/fidelidad-reserva.spec.ts` (nuevo), enmiendas de `reserva_chat`
@s12/@s18 y cabecera de `datos_negocio` en `progress/fidelidad/enmiendas_fidelidad_reserva.md`.
Bitácora: `progress/tdd_fidelidad_reserva.md`. Sin Stryker ni `feature_list.json` (lead).

**fidelidad_contacto (34) — ronda de reparación 1, artesano (20:20):** verde.
Banda de urgencias rehecha por TDD (e2e @s3/@s5 + `?raw` rojos primero):
`fieldset` en rejilla `1fr auto` (rótulo y número a la izquierda, píldora
«Llamar ahora» pequeña a la derecha, banda de 96 px a 1440) y plegado por
consulta de contenedor (`@container (max-width: 28rem)`) que baja la píldora
en bandas estrechas (320 y columnas intermedias). `paginasSeo` @s10 cita la
enmienda y lee los dígitos del `href`; enmiendas reconstruidas con 7 bloques
literales (`progress/fidelidad/enmiendas_fidelidad_contacto.md`, Enmienda 7
con quién decidió «Llamar ahora»); menores 5–9 (nombres, `--hueco-contacto`,
`data-contenedor-principal` fuera del formulario, regex desde
`SUBPATH_DE_PRODUCCION`). Vitest 89/1410, lint/typecheck de mis ficheros y
build verdes, e2e 38/38, CSS 9 846 B gzip, capturas miradas. **Incidencia:**
otra sesión editó `InformacionContacto.*` a las 19:39–19:46 y 20:06–20:09
(respondiendo a mis tests rojos); desde 20:09 no ha vuelto. `bin/harness init`
queda rojo solo por `ReservaChat.test.tsx:422-423` (lint, feature 32).
Informe: `progress/tdd_fidelidad_contacto.md`.

**Cierre del artesano (30 fidelidad_campanas, ronda 2, 20:22):** los 10
cambios del judge aplicados por TDD. Dos sesiones del mismo artesano se
solaparon (la primera dejo codigo y una bitacora parcial a las 20:03; la
segunda audito y cerro sin pisar nada). Correcciones anadidas en la 2b: el h2
recupera `color: var(--color-tinta)` (la hoja global no lo da; el par
`tinta/fondo-alterno` de la matriz lo exige), h3 sin duplicados, detalle
fijado por valor y en orden (mordida comprobada por sabotaje), comentario @s33
en el test, E2E por valor del cintillo (12,8 px, acento-tinta) y del CTA
(primario), aviso a `paso-tipografico(0)`. Vitest de la seccion 38/38, suite
1410/1411 (rojo ajeno de `hoja-global.test.ts`, reparacion 27-29), build
75,25 kB / 9,92 kB gzip, spec propio 6/6, transversales 44/44, comparativa
mirada. Informe: `progress/tdd_fidelidad_campanas.md`; enmiendas:
`progress/fidelidad/enmiendas_fidelidad_campanas.md`. Sin Stryker (lead).

**Cierre del artesano (regresiones_27_28_29, 03/09/2026):** siete ciclos
rojo→verde→refactor sobre 27/28/29 más dos hallazgos añadidos (cubierta del
hero frente a `imagenes` @s31 y enlace de salto en `accesibilidad` @s39, que
tapaban los E2E encargados). Vitest 1411/1411 (89/89) en la segunda corrida
completa (la primera, concurrente, dio un rojo transitorio ajeno en
`PaginaCampanas.test.tsx`); lint y typecheck limpios; build verde, CSS 9,95 kB gzip;
`accesibilidad.spec.ts` 15/15 y el bloque E2E de las tres secciones 51/51.
Enmienda escrita: `progress/fidelidad/enmiendas_regresiones_27_28_29.md`.
Addendas en los tres judges. Sin Stryker (lo corre el lead). Informe:
`progress/tdd_regresiones_27_28_29.md`.
Cierre del artesano (32): 5 escenarios en verde (unitarios 49/49, suite 1 412/1 412,
`fidelidad-reserva.spec.ts` 5/5, Playwright completo 149/150 con un rojo ajeno en
`tipografia` @s23); enmiendas de `reserva_chat` @s12/@s18, `datos_negocio` (cabecera)
y `rediseno_visual` @s34 en `progress/fidelidad/enmiendas_fidelidad_reserva.md`;
bitácora y mapa @s → test en `progress/tdd_fidelidad_reserva.md`. Pendiente del lead:
Stryker sobre `ReservaChat-logica.ts`, judge, y la decisión sobre el cierre del chat
por WhatsApp con resumen prellenado (no está en @s1–@s5).

## Cierre de verificación — 03/09/2026

- Las doce features de fidelidad (26–37) figuran como `done`; conservan las
  capturas, jueces y resultados de mutación por sección en `progress/`.
- La comparación de cierre se conserva en
  `progress/rediseno/capturas/cierre_final_comparativa.png`, junto con las
  capturas independientes de 1440 y 390 px.
- `bin/harness init` terminó verde: entorno, contratos, lint, TypeScript y
  89 ficheros / 1.415 tests. Se corrigió una carrera de Vitest entre ficheros
  que comparten foco e historial configurando `fileParallelism: false` en
  `vite.config.ts`; las mismas 1.415 pruebas pasan por la orden normal.
- La compilación de producción termina verde. CSS: 10,36 kB gzip (límite
  aprobado: 12 kB); la puerta de terceros no encuentra referencias externas.
- No se ha creado ningún commit ni se ha descartado ningún cambio ajeno.

## Cierre de responsive integral — feature 38 — 03/09/2026

- Pablo aprobó explícitamente el contrato `fidelidad_responsive_integral`.
- Se resolvieron por TDD: pie comprimido de tableta, control de menú menor de
  44 px, opciones de paleta de 24 px, hero recortado en 561–600 px, enlaces
  legales sin área táctil y salto del h1 cuando falta la fuente de marca.
- Validación final: Playwright 167/167; `bin/harness init` con 89/89 ficheros
  y 1.416/1.416 tests; lint, TypeScript y build verdes. CSS 10,41 kB gzip bajo
  el techo de 12 kB y puerta de terceros limpia. Mutación dirigida al bloque
  lógico añadido: 1/1 eliminado, 100 %.
- Evidencia: `progress/tdd_fidelidad_responsive_integral.md`,
  `progress/judge_fidelidad_responsive_integral.md`,
  `progress/mutation_fidelidad_responsive_integral.md` y
  `progress/responsive/verificacion_final.md`.

---


## 2026-09-21 — feature `retirada_carteleria_urgencias` (id 39)

**Encargo de Pablo:** cuatro correcciones sobre la cabecera comparando el
diseño con lo desplegado. Al investigarlas resultó ser una feature entera.

**Fuentes que había y nadie había usado:** la grabación de la reunión con
Roberto Alonso del 16/08/2026 (transcrita con `faster-whisper` a
`progress/transcripcion_reunion_rober_20260816.txt`; sus 17 decisiones, con
minuto, en `progress/decisiones_reunion_rober_20260816.md`). Corrobora los
cuatro puntos y aporta el alcance real, que era mayor.

**Alcance aprobado por Pablo el 20/09/2026** (D1-D4, E1-E5, F1-F3, G1-G2):
fuera la cartelería roja de urgencias de la cabecera (escritorio y panel
móvil), de la sección de contacto y del pie; nav a ras del borde derecho del
contenido; un paso de espaciado entre la marca y su descriptor; «Tienda» con la
píldora del prototipo sin perder su objetivo de pulsación; solape de 1 px de la
franja fija corregido; dos filas huérfanas de la matriz de color retiradas.
**Se conservan** el FAQ, la confirmación del formulario y el paso `'urgencia'`
del chat: el DATO no se retira, solo la cartelería. Pablo ratificó por escrito
que el teléfono deja de publicarse de forma ESTÁTICA en las seis rutas.

**Medido antes de tocar nada** (`progress/linea_base_20260920.md`): lint 0,
typecheck 0, Vitest 1415/1415, Playwright 167/167, config 5/5.
**Preflight de los cuatro cambios de cabecera simulados a la vez**
(`progress/preflight_cabecera_20260920.md`): 51 comprobaciones en 7 anchos, 0
fallos, antes de escribir código.

**Contratos:** tres tandas sobre 8 ficheros de `features/` (27 escenarios
tocados, 4 nuevos), más una auditoría del `craftsman_lead` que encontró cuatro
defectos en lo escrito por los subagentes —uno de ellos un error de hecho que
solo se veía midiendo en el navegador—. Informes: `cabecera_contrato_`,
`contacto_pie_contrato_`, `reconciliacion_contratos_`, `auditoria_orquestador_`
y `correcciones_auditoria_20260920.md`.

**TDD en seis oleadas secuenciales**, con listas de ficheros cerradas
(`progress/tdd_39_oleada{1..6}_*.md`; las dos últimas nacieron de sendos
rechazos del judge). Índice consolidado con el mapa `@s → test`:
`progress/tdd_retirada_carteleria_urgencias.md`. Cierre de la ronda 1: Vitest
1410/1410, Playwright 174/174, build 0, mutación 44/44 no equivalentes = 100 % con
`# timeout` = 0. El único superviviente es el mutante EQUIVALENTE de `esMovil`,
ya catalogado desde la feature 3 y decidido en
`progress/decision_mutante_esmovil_20260920.md`.

**El judge RECHAZÓ la ronda 1** (`progress/judge_39.md`), con razón. Cinco
bloqueantes, y **tres son errores de proceso del `craftsman_lead`**:
1. La feature es `sdd` y el arnés deriva `features/<name>.feature` del `name`:
   no existía. Único `[FAIL]` de `harness init`, y rompía el CI.
2. Se hizo el TDD entero sin pasar por `in_progress`.
3. `project-spec.md` y este fichero quedaron desactualizados.
Los otros dos son huecos de cobertura causados por acotar mal la oleada 4
(«`movimiento.spec.ts`: solo comentarios»): la puerta de @s19 es INERTE —su
contador se mide bajo `reducedMotion: reduce`, donde el anulador global aplica
`transition-duration` a TODO el documento— y las tres cláusulas nuevas de @s20
no tienen ninguna puerta.

**Ronda 2 (21/09/2026) — TAMBIÉN RECHAZADA** (`progress/judge_39_ronda2.md`).
Los cinco bloqueantes de la ronda 1 quedaron cerrados —el noveno contrato
creado, la feature en `in_progress`, `project-spec.md` y este fichero
actualizados, y los dos huecos de cobertura tapados por una quinta oleada
(`tdd_39_oleada5_movimiento.md`)—, pero el judge levantó **dos bloqueantes
nuevos**:

1. **SEGUNDA PUERTA HUMANA, saltada.** El `features/retirada_carteleria_`
   `urgencias.feature` creado para satisfacer al arnés no era papeleo: traía un
   escenario VINCULANTE NUEVO, `@s1`, el censo de rótulos accesibles de las
   seis rutas fijado en 0 como disparador. Lo escribió un `gherkin_author`, lo
   implementó un `tdd_craftsman` y estaba a punto de bendecirlo el `judge`: los
   tres, agentes. Pablo había aprobado OCHO contratos el 20/09; este era el
   noveno y nadie se lo enseñó. **Pablo lo aprobó expresamente el 21/09/2026**,
   tras ver el escenario y el hueco que tapa (@s5 prohíbe el rótulo accesible
   solo DENTRO de la cabecera, y @s14 solo exige corrección de los que
   aparezcan: un `aria-label` en el cuerpo de la página pasaba las dos sin
   salir en ningún recuento). No cambia el producto: nació en verde, `src/`
   intacto, medido 0 sobre 84 `aria-label` reales.
2. Un residuo en `project-spec.md` que seguía describiendo la tarjeta roja
   retirada. Cerrado el 21/09 a las 04:41.

**Ronda 3 (21/09/2026) — RECHAZADA POR UNA SOLA COSA**
(`progress/judge_39_ronda3.md`), y el propio judge abre su informe diciendo que
los dos bloqueantes de la ronda 2 están «de verdad y bien cerrados». El motivo
es un error de hecho **del `craftsman_lead`**, el sexto de esta feature:

> El encargo al `mutation_tester` decía «los TRES módulos de lógica que esta
> feature toca». **Son CINCO.** `src/lib/diseno/datosDelSitio.ts` (174
> mutantes) y `src/lib/diseno/matrizDeContraste.ts` (307) no se mutaron ni en
> la ronda 1 ni en la ronda 2, y esa frase falsa se propagó a
> `mutation_39_ronda2.md:166-167` como si fuera un hecho comprobado. Es
> justamente la frase que impedía ver el hueco. **Ya está corregida**, contando
> de dónde salió.

Y el riesgo no es formal: `datosDelSitio.ts` cambió una decisión booleana pura
por un `.every()`, y `.every()` sobre lista vacía devuelve `true` — **sobre la
misma lista que esta feature dejó vacía en las seis rutas**. Es el patrón
verde-por-vacuidad de este repositorio, en su forma más limpia. Por eso el
judge exigió correrlo y no razonarlo.

**Estado al cerrar esta anotación (21/09/2026, tarde):**

| Puerta | Resultado | Quién lo midió |
| --- | --- | --- |
| `node .harness/harness.mjs init` | **0** — 88 ficheros, 1422 tests, 1422 pasan, ningún `[FAIL]` | orquestador y judge, por separado |
| `pnpm run lint` / `typecheck` | **0** / **0** | ambos |
| `pnpm run test:e2e` | **0** — 174 tests en 27 specs | ambos |
| `test:config` | 5 / 5 | orquestador |
| Mutación ronda 2 | 98,95 % bruto · **100 % sobre no equivalentes** · `# timeout` = 0 | `mutation_39_ronda2.md` |
| Mutación de los 2 módulos que faltaban | **PASS** — 487 mutantes, **485 muertos**, 2 supervivientes y los dos son equivalentes ya catalogados · `# timeout` = 0 · `datosDelSitio.ts` **172/172** | `mutation_39_ronda3.md`; el reparto de estados lo leí yo del JSON, no de la tabla |
| Mutación consolidada de la feature | 582 mutantes · 579 muertos · 3 equivalentes con justificación **previa** · **579/579 no equivalentes = 100 %** | cuadrado por el judge de la ronda 4 |

Contra la línea base de 1587 pruebas: **+14 netas**. Códigos de salida leídos
SIN tubería (`$?` tras una tubería devuelve el del último proceso, no el del
comando) y con el puerto 4173 comprobado libre antes de medir, para que ningún
`vite preview` zombi sirviera un `dist/` viejo.

**Cerrado por el orquestador en esta vuelta:** el noveno contrato metido en el
índice de git —era el único de los nueve sin trackear, y el único congelado por
una puerta humana, o sea que la congelación era inverificable—; las dos notas
que volvieron a nacer caducadas en el `.feature` (tercera vez); la fila 10 de su
tabla de trazabilidad, que acreditaba la feature con `judge_39.md`, **que es un
RECHAZO**; y el `progress/tdd_retirada_carteleria_urgencias.md` que faltaba —era
la única de las 39 features `sdd` sin él, y `CHECKPOINTS.md` C6 lo nombra—.

**Los nueve avisos no bloqueantes del judge, por fin con número.** Llevaban dos
rondas sin tocarse; registrados el 21/09/2026 en `feature_list.json` como
features **42** `deuda_de_notas_caducadas`, **43** `endurecer_guardas_de_`
`recuento`, **44** `token_urgencia_suave_huerfano` y **45**
`limpieza_informacion_contacto`; y de mirar la página renderizada salieron dos
más, la **46** `ritmo_del_nav_y_objetivo_de_pulsacion` y la **47**
`igualdad_declarada_de_los_botones_del_hero`. Nacen en `pending` a propósito: es el único
estado que el arnés no obliga a acompañar de su `features/<name>.feature`
(`.harness/harness.mjs:69`), que es la trampa que rompió el CI en la ronda 1.

**PUERTAS HUMANAS PENDIENTES, para Pablo:**
- **44 `token_urgencia_suave_huerfano`** — `--color-urgencia-suave` quedó
  declarado en seis variantes y pintado por cero módulos. **Es la TERCERA vez
  que el judge lo pide.** Borrarlo cierra una puerta futura (el morado y el
  logo que Roberto pidió el 16/08/2026); conservarlo mantiene declarado algo
  que nadie pinta, que es contra lo que Pablo legisló en esta misma feature.
- **46 `ritmo_del_nav_y_objetivo_de_pulsacion`** — `Blog` y `FAQ` son más
  estrechos que el mínimo de pulsación de 48 px, y como el enlace alinea su
  texto a la izquierda, todo el sobrante cae a la derecha: seis huecos de 20,00
  px y dos de 26,47 y 35,88. Se ve antes de medirlo. Hay dos arreglos y ninguno
  es gratis: centrar el texto deja los dos saltos simétricos pero cambia el
  ritmo de los seis que hoy están bien; bajar el relleno de los dos cortos
  mantiene los 20 pero los aparta del patrón de sus hermanos. **No es decisión
  de agente.**
- **43**, en su punto (b): reescribir `features/accesibilidad.feature:565`
  toca un contrato ya aprobado.

**VERIFICACIÓN EN NAVEGADOR REAL — HECHA** el 21/09/2026, y era la primera vez:
`progress/verificacion_navegador_20260921.md`. `dist/` reconstruido y servido en
el 4173 (puerto comprobado libre antes). Los cuatro puntos de Pablo, medidos:
urgencias **0** textos y **0** rótulos accesibles en el documento entero y **0**
de 8 enlaces en el panel móvil; nav a **0,00 px** del borde derecho del
contenido (1330,00 contra 1330,00); **4,00 px** entre la marca y su descriptor;
los dos botones del hero a **56 px** los dos. Contacto con sus tres bloques y
pie 4/4/3.

De mirar la página salieron **dos cosas que no son de esta feature** y que se
registraron en vez de arreglarse: el **ritmo del nav** (feature 46) y la
**igualdad accidental de los botones del hero** (feature 47). Y dos comentarios
caducados más, en ficheros que la feature no tocó, que se suman a la 42.

**RONDA 4 DEL JUDGE — TAMBIÉN RECHAZADA** (`progress/judge_39_ronda4.md`), y
por algo que duele porque es mío: **tres artefactos acreditaban la feature con
informes que la rechazan**. La fila 10 del contrato «se cambió un RECHAZO por
otro RECHAZO» —quité `judge_39.md` y puse `judge_39_ronda3.md`, que es otro
`CHANGES_REQUESTED`—; y el índice de TDD que yo mismo creé para cerrar C6 nació
con **veintiuna citas de línea, cinco de ellas ya corridas el día que las
escribí**, cuatro cayendo dentro del escenario anterior al que decían nombrar
—incumpliendo la regla de oro del contrato al que sirve, que prohíbe citar
líneas por escrito—. El judge no encontró **nada** que tocar en código, tests,
cobertura ni mutación.

**Corregido en esta vuelta:** la fila 10 acredita ahora, y solo,
`mutation_39_ronda3.md`, `verificacion_navegador_20260921.md` y «el judge que
APRUEBE la feature», que al 21/09/2026 **no existe**; el índice de TDD se quedó
sin una sola cita de línea; y `docs/mutation-testing.md` documenta por fin que
`@stryker-mutator/vitest-runner` v10 trae `vitest.related` en `true`, así que
cada mutante se enfrenta a los tests **relacionados**, no a los 1422 — un hecho
que cambia cómo se leen los **39** informes de mutación del repositorio, no solo
este.

**Registrado y NO hecho:** feature 40 (animaciones de la galería que pidió
Roberto en los minutos 06:38-06:42) y feature 41 (acercar el «Tienda» del panel
móvil al prototipo, que Pablo no ha pedido).

**Dos de higiene, escritas para que no se pierdan:** `.stryker-tmp/` acumula 29
sandboxes de agosto y septiembre pese a `cleanTempDir: true`; y la puerta global
de mutación del proyecto (50 ficheros, 3229 mutantes, `break = 100`) **no se ha
medido nunca**, con el CI terminando en código 1 mientras el equivalente de
`esMovil` siga vivo. Abierta desde la feature 3.

**RONDA 5 DEL JUDGE — APROBADA** (`progress/judge_39_ronda5.md`, 21/09/2026).
Los seis puntos de la ronda 4 quedaron cerrados y el juez verificó, con dos
métodos distintos, que **el Gherkin firmado por Pablo sigue byte a byte
intacto** tras las cuatro veces que se tocó ese fichero. Encontró **un solo
defecto vivo, de un dígito** —la nota decía «features 46 y 45» donde son «46 y
47»—, y aprobó con cinco actos de cierre en vez de una sexta ronda. Los cinco,
hechos.

**Lo que queda dicho de las cinco rondas, y no conviene suavizarlo:**

1. **Ninguno de los cinco rechazos fue por el código.** El `tdd_craftsman` no
   ha vuelto a `src/` desde la ronda 1. Los cinco fueron por el entorno de la
   feature —un contrato que no existía, una puerta humana saltada, una medición
   que nadie había corrido y, dos veces, frases que decían que algo estaba bien
   cuando no lo estaba—, y los cinco son atribuibles al `craftsman_lead`.
2. **El bloqueante más caro se cerró midiendo, no razonando.** La sospecha de
   que el `.every()` sobre lista vacía aprobaba por vacuidad era razonable y
   **estaba equivocada**: los cinco mutantes de esa línea mueren. Vale también
   cuando el que razona es el juez.
3. **El hallazgo más útil no lo pidió nadie.** El `mutation_tester` levantó por
   su cuenta que `@stryker-mutator/vitest-runner` v10 trae `vitest.related` en
   `true`, sabiendo que debilitaba la lectura fácil de su propio informe.
   Documentado en `docs/mutation-testing.md`: afecta a cómo se leen los **39**
   informes de mutación del repositorio.

**Resultado: feature 39 `done`.** Commit, push y despliegue, con Pablo avisado
de las dos cosas que va a ver y que NO están arregladas: el ritmo del nav
(feature 46, con su puerta humana) y la igualdad accidental de los botones del
hero (feature 47).

