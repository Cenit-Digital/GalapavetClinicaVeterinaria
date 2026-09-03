# Sesión actual

> Estado vivo de la sesión en curso. Los subagentes escriben aquí su progreso
> (regla anti-teléfono-descompuesto). Al cerrar la sesión, mueve el resumen a
> `history.md` y deja este archivo con solo esta plantilla.

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
