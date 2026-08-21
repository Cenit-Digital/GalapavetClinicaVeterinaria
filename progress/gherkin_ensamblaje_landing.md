# Destilación de features/ensamblaje_landing.feature

Fuente: `project-spec.md` §"Ensamblaje — nueva feature: ensamblaje_landing"
(Propósito, Comportamiento, Contrato, Casos límite 1-7, PREGUNTA ABIERTA 1-3) +
Decisiones 15-22, y `feature_list.json` → feature 20 (`status: "pending"`, 6
criterios de aceptación).

## Qué se destiló

15 escenarios (`@s1`-`@s15`), en este orden:

1. `@s1`/`@s2` — `src/main.tsx`: monta en `#root`; sin `#root`, excepción
   nombrada que menciona "root" (Decisión 21).
2. `@s3` — las 8 secciones en el orden de trabajo del contrato heredado
   (Hero→Servicios→CampanasPortada→Equipo→ReservaChat→Galeria→Contacto→Faq) y
   las 7 anclas (`#inicio`, `#servicios`, `#equipo`, `#reservar`, `#galeria`,
   `#contacto`, `#faq`) exactamente una vez, ninguna duplicada ni ausente.
   Título del escenario deja explícito que el tramo Equipo→ReservaChat→Galería
   es orden de trabajo PENDIENTE de confirmar (ver más abajo).
3. `@s4` — el `id` de cada ancla lo asigna `Landing.tsx`, nunca el propio
   componente: se renderizan los 8 componentes aislados (como en su propio
   test ya aprobado) y se comprueba que ninguno lleva el `id` por sí mismo.
4. `@s5` — `CampanasPortada` sin `id="campanas"`, sus tarjetas y botón siguen
   apuntando a `/campanas`.
5. `@s6` — el contenedor `id="contacto"` agrupa `FormularioContacto` +
   `InformacionContacto` sin landmark ni nombre accesible propio (Decisión 18 +
   PREGUNTA ABIERTA 3, cerrada por el humano).
6. `@s7`/`@s8` — shell común (`Cabecera`, `PieDePagina`, `SelectorPaleta`) en
   `/`, `/campanas`, `/blog`, `/tienda`; `BrowserRouter` (no `HashRouter`): las
   anclas de sección navegan dentro de la misma página (pathname estable, solo
   cambia el fragmento).
7. `@s9`/`@s10`/`@s11` — `Cabecera` recibe `ancho` real de `window.innerWidth`:
   rama correcta en el montaje, actualización en `resize` real, y valor inicial
   que cae en rama móvil antes de la primera medición (Decisión 22, reutiliza
   `esMovil`/@s1/@s14 de `cabecera_y_navegacion.feature`, ya `done`).
8. `@s12`/`@s13` — `/campanas`, `/blog`, `/tienda` (derivadas de
   `src/data/navegacion.ts`) y cualquier otra ruta no registrada sirven el
   mismo catch-all "Página no encontrada" con enlace "Volver al inicio" → `/`
   (PREGUNTA ABIERTA 2, cerrada por el humano: catch-all único, no
   placeholders a medida).
9. `@s14` — `SelectorPaleta` no altera el orden de las 8 secciones ancladas.
10. `@s15` — `vite build` y `vite preview` funcionan, declarado explícitamente
    fuera del gate de Vitest/Stryker (Decisión 11: no medible en jsdom).

## Ficheros aprobados citados como fuente (sin redefinir su contrato)

`hero.feature`, `servicios.feature`, `campanas_portada.feature`,
`equipo.feature`, `reserva_chat.feature`, `galeria.feature`,
`formulario_contacto.feature`, `informacion_contacto.feature`, `faq.feature`,
`cabecera_y_navegacion.feature`, `pie_de_pagina.feature`,
`selector_paleta.feature` — cada nombre/rol accesible que `ensamblaje_landing`
usa en sus `Then` (p. ej. región "Equipo", grupo "Asistente de reserva de
Galapavet", botón "Cambiar paleta de color") se toma literal de esos ficheros,
no se inventa. También `docs/contrato-heredado/README_TRASPASO.md` (tabla de
ficheros generados) y `src/data/navegacion.ts` (`ENLACES_NAVEGACION`).

## PENDIENTE que queda explícito en la cabecera del .feature (a confirmar por el humano en ESTA puerta)

1. **Orden Equipo → ReservaChat → Galería (`@s3`)** — descansa en una sola
   fuente, `docs/contrato-heredado/README_TRASPASO.md`; el `.dc.html` original
   no está en el repo, así que no hay una segunda cita independiente que lo
   confirme (a diferencia de Hero→Servicios→Campañas y de que Contacto es una
   sola sección, que sí la tienen). Se toma como orden de TRABAJO, mismo
   criterio de prudencia que el `PENDIENTE` ya existente en `servicios.feature`
   sobre el orden de sus 5 bloques. **No se ha dado por aprobado**: si el
   humano no lo confirma en esta puerta, `@s3` se reabre antes de TDD.
2. Catch-all único para `/campanas`, `/blog`, `/tienda` (PREGUNTA ABIERTA 2) y
   contenedor `id="contacto"` sin nombre accesible propio (PREGUNTA ABIERTA 3):
   ambas ya cerradas por el humano en la conversación que originó este
   `.feature`, documentadas en la cabecera para trazabilidad, no reabiertas.

## No es responsabilidad de este .feature

Contenido de `/campanas`, `/blog`, `/tienda` (features 16-18, `spec_ready`);
`<title>`/metadatos por ruta (`seo_estructura`, feature 15, `spec_ready`).

## Estado

`feature_list.json` feature 20 sigue en `"pending"` — el cambio a
`spec_ready` lo hace `craftsman_lead` tras la puerta de aprobación humana
sobre `features/ensamblaje_landing.feature`, no este agente.
