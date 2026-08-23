# project-spec.md — Web de Galapavet, centro integral veterinario

> Spec conversada (17/08/2026). El acuerdo razonado del proyecto: propósito,
> contrato de cada feature y las **decisiones** con su porqué. De aquí destila
> `gherkin_author` los `features/<name>.feature`, que pasan por la puerta humana
> antes de que se escriba una línea de producción.
>
> Los datos del cliente **no se repiten aquí**: viven verificados y con su fuente
> en [`docs/datos-galapavet.md`](docs/datos-galapavet.md). Este documento decide
> **qué se hace con ellos**.

## Propósito del proyecto

Sustituir la web actual de **Galapavet** (Galapagar, Madrid) por una web piloto
moderna, accesible y 100 % responsive, que sí explique qué animales atienden,
qué servicios prestan y qué venden — las tres carencias que el estudio de
prospección (`Exploración WEB actual.docx`) señala de la web vigente, junto con
tipografía ilegible, fotos pixeladas y SEO inexistente.

**Qué NO es objetivo:**

- No hay backend, ni pasarela de pago, ni CMS. Nada se envía a ningún servidor.
- No se gestionan citas reales: la reserva termina derivando a un canal humano.
- No se inventa ni un solo dato de negocio (ver la Decisión 1).

## El punto de partida y por qué se rehizo el contrato

Esta sesión heredó 13 ficheros `.feature` (68 escenarios) destilados de un
prototipo de Claude Design llamado **«Veterinaria La Sierra»**: una clínica
**ficticia** en Miraflores de la Sierra, con teléfonos, equipo, colegiaciones,
número de registro sanitario y reseñas de Google **inventados**.

El repositorio, el logotipo y el estudio de prospección son de **Galapavet**, un
negocio **real**. Implementar el contrato heredado tal cual habría publicado, a
nombre de una clínica real: dos números de teléfono ajenos en enlaces `tel:`, un
número de registro de centro veterinario fabricado, una valoración de Google
fabricada y un servicio de **urgencias 24 h que la clínica no presta**.

Es el patrón `herencia-del-repo-base-es-deuda-muerta-hasta-que-un-uso-la-justifica`
de la memoria organizacional, en su forma más cara: aquí lo heredado no era un
breakpoint sobrante, era la identidad entera del cliente.

Por eso el contrato se **re-destila** antes de la puerta humana, en vez de
implementarse.

## Contrato general

### Invariantes del proyecto

1. **Ningún dato de negocio aparece en la UI si no está en
   `docs/datos-galapavet.md` con su fuente.** El `judge` rechaza cualquier dato
   que no pueda rastrear hasta ahí.
2. **El dato de negocio se escribe una sola vez** en `src/lib/site.ts` y todas
   sus formas derivadas (`tel:`, `wa.me`, JSON-LD, texto visible) se **calculan**
   de él. Patrón `dato-de-negocio-en-fuente-unica-canonica`.
3. **Cero peticiones automáticas a terceros en el artefacto publicable** salvo
   las declaradas explícitamente en la Decisión 8.
4. **El estado base en CSS es el estado final visible.** El estado oculto vive
   solo dentro del ámbito de la animación. Patrón
   `estado-base-visible-ssg-reduced-motion`.
5. **El estado condicional de un componente vive en un atributo ARIA
   consultable**, nunca en un `className` ternario. Patrón
   `estado-condicional-en-atributo-aria-no-en-clase-css`.
6. **La lógica de decisión vive en módulos puros** (`*-logica.ts`), el `.tsx`
   solo cablea. Patrón `logica-de-decision-en-modulo-puro-no-en-el-jsx`.
7. **Cero errores, cero warnings** en `tsc --noEmit`, `eslint --max-warnings 0`,
   `vite build`, la suite de tests y la consola del navegador.

### Modos de error comunes

- Dato de negocio ausente → **no se renderiza el bloque**; no se rellena con un
  valor plausible.
- Dato de negocio inválido en la fuente única (teléfono que no normaliza) → el
  normalizador **lanza**, no emite un `tel:` a medias. Falla cerrado.
- Preferencia de paleta corrupta en `localStorage` → se cae a la paleta por
  defecto, nunca se escribe basura en el atributo del `<html>`.

## Decisiones (con su porqué)

| # | Decisión | Alternativas descartadas | Motivo |
| - | -------- | ------------------------ | ------ |
| 1 | **Dos clases de contenido con reglas distintas.** (a) *Afirmación sobre el negocio* (nombre, dirección, teléfonos, horario, equipo, titulaciones, precios, valoraciones, nº de registro): **solo dato verificado**; si no lo hay, el bloque se omite o se marca `PENDIENTE`. (b) *Contenido editorial y de catálogo de la demo* (artículos del blog, fichas de producto, tarjetas de campaña): se construye como **demo rotulada como tal**, sin precios ni credenciales fabricados. | Inventar datos "plausibles" para que la web se vea llena. Dejar la web vacía y sin nada que enseñar. | El encargo es una **web piloto para enseñar al cliente** (así lo plantea el estudio de prospección). Una demo vacía no cumple su función; una demo con teléfonos y precios falsos es un riesgo real para un negocio real. La línea que separa ambas cosas es si el texto **afirma un hecho sobre Galapavet**. |
| 2 | **Se elimina todo el reclamo «Urgencias 24 h».** Se suprimen por completo la barra superior roja y el bloque rojo «Urgencias 24 h · Llamar ahora» del panel de contacto. El teléfono de urgencias fuera de horario se conserva dentro de los datos de contacto con su rótulo real. | Mantener «24 h» (el contrato heredado). Quitar toda mención a urgencias. | Galapavet cierra los domingos y rotula literalmente «Urgencias fuera de horario». Anunciar 24 h sería falso. Quitarlo del todo escondería un dato útil y real. Decisión tomada por el humano el 17/08/2026. |
| 3 | **Los 12 servicios inventados se sustituyen por los 5 bloques reales**, conservando el patrón de interacción aprobado (tarjeta con `+` que despliega el detalle). | Mantener 12 tarjetas rellenando con servicios inventados. Mantener 12 con 7 vacías. | El valor de la sección era la interacción y la claridad, no el número. Los 5 bloques reales traen su propio desglose publicado (entre 4 y 7 puntos cada uno), que alimenta el panel desplegable sin inventar nada. |
| 4 | **El equipo pasa de 6 profesionales inventados a los 2 reales.** La rejilla se adapta a 2 tarjetas sin quedar rota. | Rellenar hasta 6 con personas inventadas. Eliminar la sección. | Inventar profesionales con número de colegiado es la invención más grave de todas. Dos tarjetas bien resueltas comunican más confianza que seis falsas. |
| 5 | **El chat de reserva se conserva íntegro** (es la pieza más trabajada del prototipo) adaptando el guion a los servicios reales, y **la incoherencia de «Es una urgencia» se corrige**: elegir urgencia deriva de inmediato al teléfono de urgencias en vez de seguir preguntando día y franja. | Conservar la incoherencia "tal cual está implementada" (lo que hizo el contrato heredado). | El contrato heredado documentó la incoherencia y la dejó marcada «a confirmar con Pablo». Confirmada: en producción, preguntarle a alguien con una urgencia qué día le viene mejor es un defecto de producto, no una decisión de diseño. |
| 6 | **El formulario de contacto no envía nada y lo dice.** Aviso explícito, simétrico al que ya tiene el chat de reserva. | Conectar a Formspree/EmailJS (requiere clave que no tenemos). `mailto:` (depende del cliente de correo del visitante). | Decisión del humano el 17/08/2026. Sin backend no se puede prometer un envío; el aviso mantiene el contrato honesto y deja la integración para cuando el cliente elija proveedor. |
| 7 | **Los enlaces legales del pie apuntan a las páginas legales reales del cliente**, no al marcador `#faq` del prototipo. | Dejar `#faq` (el contrato heredado). Crear páginas legales propias. | Galapavet ya publica `aviso-legal`, `politica-de-cookies` y `personalizar-cookies`. Redactar textos legales nuevos sería inventar contenido jurídico. |
| 8 | **El selector de 4 paletas se conserva, pero deja de ser un catálogo de propuestas ajenas y pasa a ser variaciones de la marca real** (morado `#77286B` + lima `#B4C718`), incluida una variante oscura. Se aplica antes del primer pintado con un script inline espejado por un gemelo puro testeable. | Mantener las 4 paletas del prototipo (azul cobalto, terracota, cian neón, esmeralda), ninguna de las cuales es la marca del cliente. Eliminar el selector. | El cliente **ya tiene** identidad visual; ofrecerle cuatro paletas que no son la suya es trabajo tirado. Como variaciones de su marca sí sirve: le enseña opciones de aplicación sin traicionar el logo. El anti-destello sigue el patrón `logica-pre-pintado-inline-se-espeja-en-gemelo-puro-testeable`. |
| 9 | **Las imágenes remotas de Pexels se sustituyen por imágenes locales optimizadas.** | Mantener las URLs remotas de `images.pexels.com` (lo que hace el prototipo). | Cada imagen remota es una petición automática a un tercero que filtra la IP del visitante (RGPD/LSSI) y un punto de fallo ajeno. Patrón `puerta-anti-terceros-prohibe-peticiones-no-cadenas-externas`. El mapa embebido es la **única** excepción, y se declara. |
| 10 | **Stack: pnpm + Vite + React + TypeScript + SCSS Modules**, con Vitest + Testing Library para tests y StrykerJS para mutación. | Otros stacks. | Lo pide el humano y coincide exactamente con el adaptador `node.md` del propio arnés y con los dos repos de referencia de la agencia (`WebEmpresa`, `NailsLashStudioWeb`), de los que se hereda arquitectura de tokens y patrones de componente — **re-midiendo cada valor heredado**, no copiándolo a ciegas. |
| 11 | **Cláusulas no medibles en jsdom (contraste de píxeles renderizados, geometría de foco tapado, target-size de axe-core con layout real, animación CSS en curso, origen real de una hoja de estilo, disparo real de una petición diferida): se verifican con navegador real** (extensión Claude in Chrome / skill `browser-automation`), fuera del gate de Vitest/Stryker, declarado explícitamente en el escenario. Cuando la cláusula SÍ admita reformularse como lógica pura consultable, esa vía sigue siendo preferente. | Forzar la medición dentro de jsdom (imposible). Eliminar la cláusula del contrato (pierde el requisito). Dejar la ambigüedad silenciosa (lo que hacía el contrato heredado, y que la revisión adversarial cazó como bloqueante). | El proyecto ya dispone de la herramienta de navegador real; usarla como método de verificación explícito y declarado es más honesto que fingir que Vitest lo cubre o que borrar el requisito. Decisión tomada por el humano el 18/08/2026. |
| 12 | **Los precios de `pagina_tienda` se mantienen como contenido de demo, con rótulo explícito e inequívoco de "precio de ejemplo, no real"** (mismo patrón literal que el aviso de demo de `campanas_portada.feature:108`). Es contenido editorial/catálogo bajo la Decisión 1(b), distinto del dato pendiente §9 (precio real de campaña) que `pagina_campanas.feature` protege prohibiendo el carácter «€»: son dos campos distintos con reglas distintas, no una contradicción a igualar. | Eliminar los precios de la tienda. Igualar la regla de `pagina_tienda` a la de `pagina_campanas` (prohibir «€» también en la tienda). | El humano ya asume que los precios de la tienda son de ejemplo; lo que exige el contrato es que ese rótulo sea inequívoco, no que desaparezcan. Decisión tomada por el humano el 18/08/2026. |
| 13 | **`seo_estructura` amplía su alcance de 4 a 6 páginas**, incluyendo las dos vistas de detalle (ficha de campaña individual, artículo de blog individual), coherente con que `accesibilidad.feature` ya audita 6. | Dejar el alcance en 4 páginas (lo que hacía el contrato heredado). | Las vistas de detalle son páginas reales con URL propia; dejarlas sin metadatos propios es el mismo «SEO inexistente» que el proyecto existe para corregir. Decisión tomada por el humano el 18/08/2026. |
| 14 | **Se confirma WhatsApp (`wa.me`) como canal humano de cierre en `reserva_chat`**, pero el contrato debe distinguir dos pendientes separados, no uno solo: (1) si el cliente usa WhatsApp en absoluto, y (2) en caso afirmativo, cuál es el número correcto del canal — puede no coincidir con el número de voz (685 34 31 49) que hoy es la única cifra verificada. | Descartar WhatsApp del guion. Dar por bueno el número de voz también como canal de WhatsApp (lo que presuponía el contrato re-destilado). | El cliente puede usar un número distinto para WhatsApp Business; asumir que es el mismo que el de voz sin haberlo verificado es fabricar un dato, aunque quede rotulado PENDIENTE. Decisión tomada por el humano el 18/08/2026. |
| 15 | **Nace `ensamblaje_landing`, la feature que faltaba**: `src/main.tsx` (punto de entrada, monta la app en `#root`) → `src/App.tsx` (shell común a TODAS las rutas: `Cabecera`, el enrutado, `PieDePagina` y `SelectorPaleta`) → `src/pages/Landing.tsx` (composición de la landing en una sola página). Ninguna de las 14 features ya `done` la cubre: cada una construyó y probó su componente en aislamiento, pero nadie los ha ensamblado — el proyecto no compila (`index.html` referencia un `/src/main.tsx` que no existe). | Seguir sin `src/pages/` y componer todo dentro de un `App.tsx` monolítico. Repartirlo entre las 3 futuras features de subpágina en vez de fijarlo una sola vez. | Este documento ya declaraba la carpeta `src/pages/` en «Arquitectura» sin que ninguna feature la poblara. `pagina_campanas`/`pagina_blog`/`pagina_tienda` (16-18, ya `spec_ready`) necesitan ese mismo patrón de ensamblado — y el propio criterio de aceptación de `pagina_campanas` en `feature_list.json` («la página comparte cabecera y pie con la landing») exige que `Cabecera`/`PieDePagina` vivan en el shell común, no dentro de `Landing.tsx`. |
| 16 | **Orden de la landing, verificado contra el prototipo heredado, no inventado**: `Hero` (`#inicio`) → `Servicios` (`#servicios`) → `CampanasPortada` (sin ancla propia) → `Equipo` (`#equipo`) → `ReservaChat` (`#reservar`) → `Galeria` (`#galeria`) → Contacto (`#contacto`, Decisión 18) → `Faq` (`#faq`), con `Cabecera` fija arriba y `PieDePagina` al cierre, fuera del flujo de secciones. | El orden sugerido en el encargo de esta conversación (Hero, Servicios, Equipo, ReservaChat, Galeria, CampanasPortada, InformacionContacto, FormularioContacto, Faq), que no coincide con el del prototipo. | Dos fuentes ya en el repo, y ya usadas para aprobar el resto del contrato, coinciden: la tabla de `docs/contrato-heredado/README_TRASPASO.md` (servicios, campañas, equipo, reserva_chat, galería, formulario_contacto, informacion_contacto, faq, en ese orden) y los rangos de línea que cada `.feature` cita de `Veterinaria La Sierra.dc.html` en su propia cabecera (servicios ~142-181, campañas ~183-206, contacto 346-425, faq ~424-442, pie 444-478). Confianza alta en Hero→Servicios→Campañas y en que Contacto es una sola sección; confianza media en el tramo Equipo→ReservaChat→Galería (ver PREGUNTA ABIERTA 1 de `ensamblaje_landing`). |
| 17 | **El `id` de cada ancla lo asigna `Landing.tsx`, nunca el propio componente de sección.** Ninguno de los 12 componentes ya `done` declara su propio `id`; cada uno expone como mucho un `aria-label` de landmark. El ensamblador envuelve (o inyecta el `id` en) exactamente los que tienen ancla contratada: `Hero`, `Servicios`, `Equipo`, `ReservaChat`, `Galeria`, la sección Contacto y `Faq`. `CampanasPortada` y `SelectorPaleta` no reciben `id`. | Añadir el `id` dentro de cada componente ahora que hace falta un destino real. | Ya hay un veredicto del `judge` sobre exactamente este punto: en la ronda 1 de `servicios` rechazó `id="servicios"` dentro de `Servicios.tsx` por Ley 1 (ningún escenario de esa feature lo pedía), y `progress/current.md` dejó anotado que el destino es «un pendiente legítimo de una feature de ensamblado de página con su propio test». Volver a meterlo en el componente reabriría ese veredicto ya cerrado. |
| 18 | **`FormularioContacto` e `InformacionContacto` no son dos secciones de la landing: son las dos mitades de UNA — «Contacto» (`id="contacto"`)** —, con el formulario primero e `InformacionContacto` después (columna derecha, según su propia cita de fuente). | Tratarlas como dos secciones independientes, cada una con su propio hueco en el orden de la landing (lo que asumía el encargo original de esta conversación, que las listaba como dos entradas separadas). | Las cabeceras de ambos `.feature` citan la MISMA sección del prototipo heredado, `id="contacto"` (`formulario_contacto.feature`: líneas 346-390; `informacion_contacto.feature`: «columna derecha», líneas 401-425 — rango posterior y contiguo). Además solo hay un destino `#contacto` en todo el contrato ya aprobado (`cabecera_y_navegacion.feature` @s5, `pie_de_pagina.feature` @s5), nunca dos; tratarlas como secciones separadas obligaría a inventar un segundo ancla que ningún escenario pide. |
| 19 | **El enrutador es `<BrowserRouter>` de `react-router` (^8.3.0, ya en `package.json`), no `<HashRouter>`.** | `HashRouter`, que no exige configurar el hosting estático para servir `index.html` en cualquier ruta. | `HashRouter` enruta por el fragmento de la URL. Las anclas `#inicio`, `#servicios`, `#equipo`, `#reservar`, `#galeria`, `#contacto` y `#faq` ya son literales fijados en dos contratos `done` (`cabecera_y_navegacion.feature`, `pie_de_pagina.feature`) como navegación DENTRO de la misma página. Adoptar `HashRouter` las convertiría en rutas del enrutador y rompería ambos contratos ya cerrados. El coste de `BrowserRouter` (el hosting debe reescribir cualquier ruta desconocida a `index.html`) se deja anotado como riesgo de despliegue, no como bloqueo de esta feature (ver «Riesgos abiertos»). |
| 20 | **Las rutas `/campanas`, `/blog` y `/tienda` que registra el router se derivan de `src/data/navegacion.ts` (`ENLACES_NAVEGACION`), no se retipean como literales nuevos en `App.tsx`.** | Escribir las tres cadenas de ruta directamente en la configuración del router, igual que están escritas en `navegacion.ts`. | Mismo patrón que ya exige el Invariante 2 de este documento para los datos de negocio (`dato-de-negocio-en-fuente-unica-canonica`), aplicado a rutas: dos declaraciones independientes de la misma cadena `/tienda` es la forma exacta en que este proyecto ya ha visto divergir un contrato (ver la reparación de `campanas_portada`/`pagina_campanas` del 18/08/2026). |
| 21 | **Si el documento no contiene ningún elemento con `id="root"`, el punto de entrada falla con una excepción nombrada y explícita** (mensaje que menciona `root`), en vez de una aserción de tipos silenciosa (`document.getElementById('root')!`) que reventaría más tarde con un error críptico de React. | El idiom habitual de la plantilla de Vite, `document.getElementById('root')!`, que confía en TypeScript y no falla con un mensaje propio si `index.html` cambia. | Es el mismo principio que ya rige todo el proyecto (`docs/architecture.md`, principio 3: «errores explícitos… excepciones nombradas… no valores nulos silenciosos») y el mismo patrón de «falla cerrado» que usa `enlaceLlamada` con un teléfono inválido. |
| 22 | **`App.tsx` (o un módulo dedicado) es responsable de darle a `Cabecera` un `ancho` real y vivo**: lee `window.innerWidth`, se suscribe a `resize`, y arranca con un valor inicial que caiga en la rama móvil antes de la primera medición (coherente con `esMovil`/@s14 de `cabecera_y_navegacion.feature`, ya aprobado y ya `done`). | Dejarlo sin resolver, asumiendo que ya lo hacía `cabecera_y_navegacion`. | No lo hace: sus tests inyectan `ancho` como prop de control, nunca lo conectan a `window.innerWidth`. Es exactamente el tipo de cableado que ninguna feature de sección puede hacer por sí sola (mide algo del navegador real, no del componente); sin él, `Cabecera` no tiene forma de recibir un `ancho` verdadero en producción — sería otro «pendiente de ensamblado» silencioso, igual que el de las anclas. |
| 23 | **Nace `sistema_de_diseno_visual` (feature 21): implementa la arquitectura visual que este mismo documento ya especifica desde el principio** (`<X>.module.scss` co-localizado por componente, `src/styles/_tokens.scss` como fuente de tokens — sección «Arquitectura», más abajo) **y que ninguna de las 19 features anteriores ejecutó**: el repo, a día 22/08/2026, no tiene ni un solo fichero `.scss`/`.css` ni un solo componente que importe estilos (confirmado por `find src -iname "*.scss" -o -iname "*.css"` → 0, y `grep` de imports de `.module.scss/.css` en todo `src/**/*.tsx` → 0). El sitio real, servido con `vite build && vite preview` y auditado con axe-core real sobre `target-size`, falla: 21 violaciones solo en la portada (enlaces de navegación/pie/teléfono por debajo de 24×24 px CSS). Se detectó al intentar cerrar los 4 escenarios de navegador real de `accesibilidad` (id 19), que dependen de que exista una maquetación real que auditar. Ámbito: (a) tokens reales en `src/styles/_tokens.scss` — colores de las 4 variantes de paleta como *custom properties* CSS conmutadas por `[data-variante]` (mecanismo YA implementado y probado por `selector_paleta`, `document.documentElement.setAttribute('data-variante', id)`, `index.html:30`), escala tipográfica y escala de espaciado (los dos «PENDIENTE, no se fija aquí» que la cabecera de `tokens_marca.feature` dejó explícitamente para «cuando se midan sobre el diseño»); (b) `<X>.module.scss` por cada componente/página ya `done`, maquetando lo que su propio `.feature` ya describe en prosa (p. ej. «en escritorio se ven todos los enlaces en horizontal» de `cabecera_y_navegacion.feature`) sin reabrir ningún contrato de comportamiento; (c) verificación en navegador real (build de producción, no dev server) que cierra a la vez esta feature y los 4 escenarios pendientes de `accesibilidad`. | Dejar los 4 escenarios de `accesibilidad` como «pendiente, no bloqueante» igual que el precedente de `galeria` @s9/@s10. Maquetar solo lo mínimo para que pase axe, sin sistema de tokens real. | El precedente de `galeria` aplica a una cláusula aislada (scroll físico) que no depende de que exista ningún otro fichero; aquí la ausencia es estructural y transversal a las 19 features — dejarla "pendiente" indefinidamente significa que el entregable real para el cliente no tiene ningún diseño visual, pese a que `tokens_marca`/`selector_paleta` están `done`. Decisión tomada por el humano el 22/08/2026 (autorización explícita de investigación + planificación + implementación autónoma). |
| 24 | **Fuente del sistema de tokens de valor (tipografía, espaciado, radio, sombra): NO se reutilizan los valores del prototipo heredado `Veterinaria La Sierra.dc.html`** (`font-size` disperso en 20 valores distintos entre 10px y 26px, sin ratio sistemático — confirmado por extracción exhaustiva de todos los `font-size:` del fichero), **solo su arquitectura general** (custom properties CSS conmutadas por atributo de raíz, tipografía de Google Fonts en dos familias, `clamp()` para tamaños fluidos, patrón de `prefers-reduced-motion` que anula duración de animación/transición globalmente). Los valores numéricos se fijan con una escala sistemática y citable: tipografía con el método de escala fluida de Utopia (https://utopia.fyi/type/calculator/, ratio 1.25 "tercera mayor", base 16px, rango de viewport 320-1024px — este último idéntico a `PUNTO_DE_CORTE_NAVEGACION_PX` de `Cabecera-logica.ts`, no un valor nuevo), espaciado con la rejilla de 8px de Material Design (https://m3.material.io/foundations/layout/understanding-layout/spacing, pasos 4/8/12/16/24/32/48/64/96). Los colores de las 4 variantes se derivan ÚNICAMENTE de los tres hexadecimales ya verificados de `tokens.ts` (nunca de los colores del prototipo, que Decisión 8 ya descartó por no ser de la marca), mezclados con blanco/negro puro y verificados con la fórmula WCAG real de `contraste.ts` antes de fijarse — nunca a ojo. | Reconstruir a mano el tramo de valores del prototipo. Inventar una escala sin cita. | «No inventes nada»: cada número de esta feature debe poder trazarse a una fórmula pública o a un dato ya verificado. El prototipo demuestra la ARQUITECTURA (fue leída y adaptada de `WebEmpresa`/`NailsLashStudioWeb`, según `github.md` del zip original, `Downloads/ClinicaVeterinariaGalapavet.zip`), no los NÚMEROS (que ni siquiera él sigue un sistema). Decisión tomada por el humano el 22/08/2026. |
| 25 | **Nace `identidad_visual` (feature 22): la capa que convierte «la web tiene tokens» en «la web se ve».** Diagnóstico medido el 23/08/2026 sobre el `dist/` de producción con navegador real, no estimado: **0 apariciones de `font-family` en todo el CSS generado** (`getComputedStyle(body).fontFamily` devuelve «Times New Roman», la del navegador); **0 reglas para `html` o `body`** (el `body` conserva el margen de 8 px de la hoja del agente de usuario, que la propia especificación HTML fija en «a default value of **8px**», <https://html.spec.whatwg.org/multipage/rendering.html>); 124 reglas CSS en todo el sitio; solo 3 roles de color; y **la carpeta `public/` no existe**, así que las 26 rutas de imagen del código, el logo del pie y el favicon dan 404. Ámbito de la feature: (a) el sistema completo de roles de color en las 4 variantes; (b) la capa base global (reset, `html`/`body`, tipografía, `scroll-padding-top`); (c) la tipografía autoalojada; (d) `public/` con las imágenes locales; (e) la maquetación real de cada componente y página al nivel del prototipo de referencia, con libertad para **mejorar** lo que el prototipo hace regular; (f) Playwright + axe-core como motor de verificación en navegador real. | Ampliar el contrato de la feature 21 en vez de abrir una feature nueva. Dar la 21 por buena y dejar el aspecto para «una pasada de diseño» sin contrato ni escenarios. | La feature 21 está `in_progress` con su Gherkin **ya aprobado por la puerta humana**, y su alcance excluye el diseño **expresamente**: «Pixel-perfect de diseño creativo, ilustraciones o iconografía a medida […] queda fuera» (`features/sistema_de_diseno_visual.feature:160-168`), y deja «los roles de color más allá de fondo/texto/foco» como PENDIENTE explícito (`:182-189`). La 21 hizo lo que se le pidió; el hueco es del contrato, no de su ejecución. Reabrir un contrato aprobado para inyectarle un alcance nuevo es justo lo que este proyecto no hace (mismo criterio que la Decisión 17 con el veredicto del `judge` sobre `id="servicios"`). Y el hueco es invisible para las 712 pruebas actuales porque **corren en jsdom, que no calcula layout**: los CSS Modules devuelven un proxy y solo `import.meta.glob(…, {query:'?raw'})` recibe texto real (`vite.config.ts:46-65`). Decisión tomada por el humano el 23/08/2026. |
| 26 | **El sistema de roles de color pasa de 3 a 17 (15 de color + 2 de sombra), con nombre en español, coherente con los tres que ya existen** (`--color-fondo`, `--color-texto`, `--color-foco`, `src/styles/_tokens.scss:39-64`) **y definido en las 4 variantes, incluida `noche`.** Cada rol nuevo se **deriva por mezcla en sRGB** del morado `#77286B`, el lima `#B4C718` o el verde profundo `#48704B` de `src/lib/tokens.ts` con blanco o negro puro, y **no se fija hasta pasar por la fórmula real de `src/lib/contraste.ts`** con la matriz de uso que dice qué se pinta sobre qué. Los valores de la variante `marca` quedan fijados en la tabla de la sección «`identidad_visual`» de este documento (recalculados aquí de forma independiente con la fórmula de `contraste.ts`); los de `lima`, `verde` y `noche` quedan **PENDIENTE del `tdd_craftsman`**, que los fija con la misma puerta, no a ojo. | Seguir con 3 roles y resolver cada superficie con un literal en el `.module.scss` que la necesite. Copiar los 18 roles del prototipo de referencia tal cual. | Con 3 roles no hay forma de bandear la página ni de dar jerarquía: ocho secciones seguidas con el mismo fondo y todo el texto del mismo color es exactamente el síntoma que se está corrigiendo. Y los literales están **prohibidos por prueba**: `puertaLiteralesColor.ts:27-30,56` señala cualquier `#hex`, `rgb()/rgba()/hsl()/hsla()` y los 16 nombres de color CSS en `src/components/*.module.scss` y `src/pages/*.module.scss`, así que un color sin token no tiene dónde vivir. Copiar los 18 del prototipo tampoco vale: 2 de ellos son el rojo de «Urgencias 24 h» (servicio que Galapavet no presta, Decisión 2), 1 está declarado y usado 0 veces, y su `--border` está a **1.30:1**, por debajo del 3:1 que SC 1.4.11 exige cuando el borde es lo único que identifica un control. |
| 27 | **Cuatro roles del prototipo se descartan explícitamente, y el hover del botón primario usa un token propio en vez de un filtro.** Se descartan `--urg` y `--urg-soft` (con todo lo que los usa: barra superior roja, CTA rojo de cabecera, botón rojo del menú móvil y tarjeta roja de urgencias), `--primary-strong` (declarado 4 veces, usado 0) y `--accent` «a secas» (3 usos, todos decorativos). En su lugar se declara `--color-primario-fuerte` = morado + 10 % negro = `#6B2460`, **verificado: blanco encima da 10.26:1**, mejor que el 9.13:1 del morado base. | Portar los 4 roles «por si acaso». Hacer el hover con `filter: brightness(1.1)`, que es lo que hace el prototipo en sus 4 botones. | `--urg`/`--urg-soft` son el color de un servicio que **no existe** en Galapavet: la Decisión 2 ya suprimió el reclamo entero, y darle un rol de color propio lo reintroduciría por la puerta de atrás. `brightness(1.1)` **aclara** el morado, y al aclararlo el contraste del blanco encima **baja** — un hover que empeora la accesibilidad. Un token oscurecido la mejora y además es un valor auditable por la puerta de contraste, cosa que un filtro CSS no es. |
| 28 | **Nace `src/styles/global.scss`, una hoja global de verdad, importada una sola vez desde `src/main.tsx` (`import './styles/global.scss'`).** No sustituye a `_tokens.scss` ni a los `<X>.module.scss`: es la tercera capa, la del **documento** (reset, `html`, `body`, `@font-face`, `scroll-padding-top`). | Seguir confiando en `css.preprocessorOptions.scss.additionalData` (`vite.config.ts:31`), que ya inyecta `@use "tokens" as *;` en cada `.scss`. Poner el reset en un `<style>` dentro de `index.html`. Meter las reglas de `html`/`body` dentro de un `.module.scss` cualquiera. | `additionalData` **no produce una hoja global**: hace que cada módulo *pueda usar* los tokens, no que alguien los *aplique* al documento — de ahí que `--color-fondo` y `--color-texto` existan, resuelvan (el `h1` computa a `rgb(119,40,107)`) y aun así el `body` sea transparente y negro. Un `<style>` en `index.html` quedaría fuera del grafo de Sass, sin acceso a `paso-tipografico()`/`espaciado()` y sin pasar por las puertas de texto del repo. Y colgar `html`/`body` de un `.module.scss` ataría la salud del documento entero a que ese componente concreto se monte. Nota medida: los bloques `:root[data-variante]` **no se duplican** hoy en el bundle (`grep -o "data-variante" dist/assets/*.css` → **4**, uno por variante), así que añadir una capa global no introduce duplicación de tokens. |
| 29 | **El contenido de la capa base es un reset propio, explícito y justificado regla a regla**, no una dependencia de terceros: `box-sizing: border-box` en `*`; `body { margin: 0 }` y márgenes de bloque a 0 en encabezados, `p`, `blockquote`, `figure`, `dl`, `dd`; `input, button, textarea, select { font: inherit; color: inherit }`; `img, picture, video, canvas, svg { display: block; max-width: 100% }`; `body { min-height: 100svh; line-height: 1.5; background: var(--color-fondo); color: var(--color-texto); font-family: var(--tipo-texto) }`; `html { -webkit-text-size-adjust: 100% }`; `#root { isolation: isolate }`; `text-wrap: balance` en titulares y `pretty` en `p`/`li`. | Instalar `modern-normalize`/`the-new-css-reset` como dependencia. No poner reset y confiar en la hoja del agente de usuario. | Cada una de esas reglas arregla un defecto **medido**, y las tres que arreglan el diagnóstico de raíz son `body { margin: 0 }` (el 8 px es de la hoja del agente de usuario, spec HTML), `body { background / color }` (los tokens existían y nadie los aplicaba) y `font: inherit` en los controles (la spec de *rendering* resetea la familia de los controles al sistema, así que sin esa regla **los botones y campos del formulario seguirían sin usar la tipografía de marca aunque el `body` sí la use**). `line-height: 1.5` es además el mínimo de SC 1.4.12 Text Spacing (AA). Una dependencia de reset traería reglas que nadie de este proyecto puede justificar, y este repo exige que cada valor sea trazable. `text-wrap: pretty` se aplica a párrafos y elementos de lista, **no a `body`**, porque MDN avisa de que «has a negative performance impact — use cautiously». |
| 30 | **`scroll-padding-top` en `html` es un requisito de accesibilidad, no una corrección cosmética, y su valor sale de la misma variable que dimensiona la cabecera** (`calc(var(--altura-cabecera) + …)`), nunca de un número repetido a mano. | Dejar que cada ancla se resuelva con `scroll-margin` puesto a mano en el destino (lo que hoy hace `Landing.module.scss:7`). Ajustar el desplazamiento con JavaScript. | Es la **técnica suficiente C43 del W3C** (<https://www.w3.org/WAI/WCAG22/Techniques/css/C43>) para **SC 2.4.11 Focus Not Obscured (Minimum), nivel AA**, y el documento de entendimiento del criterio nombra literalmente el caso de este sitio: «Typical types of content that can overlap focused items are sticky footers, **sticky headers**, and non-modal dialogs». Con cabecera fija y enlace «Saltar al contenido», sin ella el destino aterriza debajo de la cabecera y el foco queda tapado. **No hay ninguna regla de axe para 2.4.11**: se verifica con un test de Playwright escrito a mano (enfocar cada tabulable y comprobar que su rectángulo no queda íntegramente bajo la cabecera). |
| 31 | **El movimiento se declara por *opt-in*, con dos duraciones y curva de salida.** `scroll-behavior: smooth` vive **dentro** de `@media (prefers-reduced-motion: no-preference)`, no se declara y se revoca después; y la escala de movimiento es de **dos pasos: 150 ms** para cambios de color, borde y fondo, y **300 ms** para transformaciones y sombras, con `ease-out` en lugar de `ease`. | La forma del prototipo: declarar el movimiento por defecto y anularlo en `reduce` con `*{transition-duration:.01ms !important}` (`Veterinaria La Sierra.dc.html:60`). Una única duración `.3s ease` para todo, que es lo que hace el prototipo en sus 35 declaraciones de `transition`. | La disciplina del repo es más estricta que la del prototipo y ya está probada: `movimientoRespetuoso.ts:19-21,44` exige que **cada** `transition`/`animation` esté anidada dentro de un `@media` de `prefers-reduced-motion`, leyendo el texto real línea a línea. El *opt-in* hace además que el estado por defecto —el que ve quien no ha configurado nada— sea el seguro, sin depender de que una segunda regla gane la cascada. Sobre las dos duraciones: 300 ms está bien para una tarjeta que se eleva, pero se percibe como retardo en un cambio de color de enlace; Material Design 3 recomienda 100-200 ms para cambios pequeños y 250-400 ms para elementos grandes (<https://m3.material.io/styles/motion/easing-and-duration/tokens-specs>). Se mantiene el corte general en `reduce` con `0.01ms` (no `0`) para que sigan disparándose `transitionend`/`animationend` y no se rompa la lógica de React que pudiera depender de ellos. |
| 32 | **Tipografía: Outfit (titulares y datos numéricos) + DM Sans (texto corrido), en su versión VARIABLE, subconjunto `latin` únicamente, autoalojadas en `public/fuentes/` y servidas con `@font-face` propio.** Peso total medido: Outfit `latin` variable **32 292 B** + DM Sans `latin` variable **36 932 B** = **≈ 68 KB** para todos los pesos 100-900. Ambas son **SIL Open Font License 1.1**, verificado leyendo el `LICENSE` de los ficheros descargados (`Outfitio/Outfit-Fonts` y `googlefonts/dm-fonts`, empaquetadas por Fontsource 5.3.0). | Cargarlas desde `fonts.googleapis.com`, que es lo que hace el prototipo (`Veterinaria La Sierra.dc.html:13-15`). Usar ficheros estáticos, uno por peso. Servir también el subconjunto `latin-ext`. | Google Fonts es una petición automática a un tercero que filtra la IP del visitante: **lo prohíbe la Decisión 9** y el patrón `puerta-anti-terceros-prohibe-peticiones-no-cadenas-externas`; la OFL permite explícitamente redistribuir la fuente junto con la web, así que autoalojar es un uso previsto de la licencia. La variable gana a las estáticas **ya a partir de tres pesos** (Outfit 400+600+700 = 42 232 B frente a 32 292 B de la variable, que además regala los intermedios). Y `latin-ext` no se sirve porque se comprobó por script que el rango `latin` cubre **todos** los caracteres que esta web necesita (ñ, Ñ, ¿, ¡, «», ·, —, …, comillas tipográficas, €, º, ª, ç): ahorra 33 036 B de peso muerto. El `unicode-range` **sí** se declara aunque solo haya un subconjunto: sin él el navegador descarga la fuente aunque la página no use ningún glifo suyo. |
| 33 | **El anti-CLS de la tipografía es `font-display: swap` más una `@font-face` de respaldo con métricas ajustadas, y la precarga lleva `crossorigin` obligatorio.** Los cuatro valores están **calculados con la fórmula de Capsize** (`sizeAdjust = (xWidthAvg_web/upm_web) / (xWidthAvg_fallback/upm_fallback)`) y se escriben a mano en el SCSS: Outfit → `size-adjust: 99.8204%`, `ascent-override: 100.18%`, `descent-override: 26.0468%`; DM Sans → `size-adjust: 104.531%`, `ascent-override: 94.9001%`, `descent-override: 29.6563%`. Dos `<link rel="preload" as="font" type="font/woff2" crossorigin>` en `index.html`, uno por familia, y **nada más precargado**. `@capsizecss/*` **no entra como dependencia** del proyecto. | `font-display: optional`, que evita el salto sin necesidad de métricas ajustadas. `font-display: block`. Precargar sin `crossorigin`. Meter `@capsizecss/*` como dependencia y calcular las métricas en tiempo de build. | `swap` garantiza que el texto sea **legible desde el primer pintado** (con `block` se pinta invisible durante el periodo de bloqueo); su único defecto es el salto de layout al cambiar de fuente, y eso es exactamente lo que neutralizan las métricas ajustadas. `optional` evita el salto pero a cambio de que en conexión lenta la fuente de marca sencillamente no se use: para una web de clínica que se visita una vez, eso significa que buena parte de los visitantes nunca vería la tipografía de marca. El `crossorigin` es obligatorio **aunque el fichero sea del mismo origen** — cita literal de MDN: «The attribute needs to be set to match the resource's CORS and credentials mode, **even when the fetch is not cross-origin**» —; sin él el navegador **descarga el fichero dos veces** y la precarga resulta contraproducente. Y Capsize no entra como dependencia porque su salida es **estática**: se calculó una vez, los seis números están arriba, y una dependencia más es superficie que mantener. |
| 34 | **Se crea `public/` con `fuentes/` e `img/`, y las 24 fotografías son de banco (Pexels), DESCARGADAS y servidas en local, convertidas con el `ffmpeg` que ya está instalado en la máquina, con `srcset`/`sizes` y `width`/`height` siempre.** Anchos 480/800/1200/1600 según familia, `-quality 82 -preset picture -vf scale=W:-2:flags=lanczos`. La imagen del hero va `loading="eager"` + `fetchpriority="high"` (es el LCP); el resto, `loading="lazy"` + `decoding="async"`. Todas quedan **inventariadas como contenido de demostración a sustituir** (ver «Riesgos abiertos», punto 5). | Mantener las URL remotas de `images.pexels.com` (lo que hace el prototipo). Dejar los 404 y maquetar sobre huecos vacíos. Instalar ImageMagick o `sharp` como dependencia del proyecto. | Las remotas ya están prohibidas por la Decisión 9, y además **las pruebas ya lo vigilan**: cualquier ruta que empiece por `http://`/`https://`/`//` o que contenga la cadena «pexels» revienta la suite (`PaginaTienda.test.tsx:167-181`, `PaginaBlog.test.tsx:566-581`, `CampanasPortada.test.tsx:178-192`, `Servicios.test.tsx:398-416`). La licencia de Pexels (<https://www.pexels.com/license/>) permite uso comercial sin atribución obligatoria, y ninguna de sus cinco prohibiciones toca lo que hace esta web. ImageMagick **no está instalado** (verificado); `ffmpeg 8.1.1` **sí, y con `libwebp` compilado dentro**, así que no hay que instalar nada — y de regalo **borra los metadatos EXIF/GPS** (verificado con `ffprobe`), lo que importa de verdad cuando lleguen las fotos reales hechas con móvil en la clínica. `width`/`height` pasan de recomendables a imprescindibles con `loading="lazy"`, porque una imagen sin cargar mide 0×0. Un único banco para las 24 fotos: mezclar bancos produce un collage, porque cada uno tiene su sesgo de contraste, temperatura y grano. |
| 35 | **La imagen de Open Graph NO lleva foto de banco: se compone con el logo real sobre el morado de marca**, 1200×630 px (Meta: «Use images that are at least 1200 x 630 pixels… keep your images as close to 1.91:1 aspect ratio as possible», <https://developers.facebook.com/docs/sharing/webmasters/images/>), con el nombre y el `descriptorConLocalidad` que ya existe como dato, y sin texto en los 60 px de borde. Se genera en **PNG**, no en WebP. | Usar una de las fotos de stock de clínica. Mantener el `.webp` que hoy declara `MetadatosPagina.tsx:18`. | Es la imagen que representa al negocio cuando alguien comparte el enlace por WhatsApp o Facebook: poner ahí la clínica de otro es la mentira más cara de todo el inventario, porque es la que más se lee como «esto es Galapavet». Y sobre el formato: la documentación oficial de Meta **no declara qué formatos acepta** (NO VERIFICADO que WebP funcione en los rastreadores de Meta/WhatsApp/LinkedIn), así que se elige el formato del que no hay duda. Cambiar la extensión toca `src/`, así que lo hace el `tdd_craftsman` por TDD, no el orquestador a mano. Queda además una contradicción real que **no se arregla a escondidas**: ver PREGUNTA ABIERTA 1 de la sección `identidad_visual`. |
| 36 | **Favicon: se genera un juego raster derivado del logo de 201×201 px (`favicon.ico` 16/32/48, `favicon-32.png`, `apple-touch-icon.png` de 180×180 sin alfa y con fondo blanco), y se pide al cliente el vector para poder emitir el `favicon.svg` que `index.html:6` ya declara.** El `<link>` del SVG se deja comentado hasta que llegue el vector; los `<link>` raster se declaran ya. | Vectorizar automáticamente el logo raster para producir un `favicon.svg` ahora. Dejar el 404 hasta que llegue el vector. | No se puede derivar un SVG fiel de un raster de 201×201 con degradados y solapes (el verde `#48704B` nace de la superposición lima/morado, `docs/datos-galapavet.md:138`): la vectorización automática produce cientos de trazados y un resultado sucio, es decir, un logotipo falseado de un negocio real. Los 201 px de origen alcanzan de sobra para 16/32/48 y para los 180 del icono de iOS, y MDN documenta que declarar varios `<link rel="icon">` es progresivo y seguro («If the most appropriate icon is later found to be inappropriate… the browser proceeds to the next-most appropriate»). El `apple-touch-icon` va **sin alfa y con fondo blanco** porque iOS no respeta la transparencia y la pinta negra. Límite duro anotado: para un icono de 512×512 de manifiesto PWA hará falta sí o sí el vector. |
| 37 | **Motor de verificación en navegador real: Playwright 1.62.1 + `@axe-core/playwright` 4.13.0, con los e2e en `tests/e2e/`, un tercer proyecto `tsconfig.e2e.json`, `retries: 0`, y midiendo SIEMPRE el `dist/` de producción vía `vite preview --port 4173 --strictPort`, nunca el servidor de desarrollo.** Los navegadores no se descargan solos (verificado: `playwright@1.62.1` **no tiene script de instalación**), así que `pnpm exec playwright install --only-shell chromium` se documenta como paso explícito. | Seguir usando solo la extensión de navegador manual que autoriza la Decisión 11. Eliminar del contrato las cláusulas que jsdom no puede medir. Meter los e2e en `src/` junto al resto de tests. | La Decisión 11 fue correcta pero deja la verificación **atada a una sesión humana**: los 8 escenarios de navegador real de la feature 21 y los 4 de la 19 no se pueden volver a comprobar solos, y por tanto no protegen de una regresión. Playwright los convierte en una puerta repetible sin cambiar el criterio (la Decisión 11 sigue vigente para lo que aún no se automatice). `tests/e2e/` da la separación de Vitest **por construcción y sin tocar `vite.config.ts`**, porque su `include` ya está anclado a `src/**` (`vite.config.ts:44`) — verificado ejecutándolo: `vitest list` no recoge el fichero, `oxlint --deny-warnings` sale EXIT=0 y `tsc -b` sale EXIT=0. `tsconfig.e2e.json` debe ser un proyecto **separado**, no una extensión de `tsconfig.app.json`, porque este declara `vitest/globals` (`tsconfig.app.json:6`) y esos `test`/`expect` globales colisionan con los **importados** de `@playwright/test`; y hace falta porque hoy `tests/` está fuera del typecheck (demostrado: `tsc -b` pasa con un import irresoluble) y Playwright *«does not check the types»*. `retries: 0` contradice a propósito el `retries: 2` que Playwright recomienda para CI: el contrato de este repo es «0 fallos, 0 errores, 0 warnings», y un reintento convierte un test inestable en verde escondiendo justo lo que esta feature existe para destapar. Y se mide `dist/` porque es la única forma de que el diagnóstico («0 `font-family` en el CSS generado») sea reproducible como test. |
| 38 | **La puerta de navegador real es un comando propio y separado (`pnpm run test:e2e`), que NO entra en `harness.config.json → commands.test` ni, por tanto, en `bin/harness init`.** `bin/harness test` sigue siendo `pnpm run test` (`vitest run`) y `bin/harness mutate` sigue siendo StrykerJS sobre `src/lib/**/*.ts` + `src/**/*-logica.ts`. La feature no se cierra sin las tres puertas: Vitest, mutación **y** e2e verde. | Meter `playwright test` dentro de `commands.test` para que `bin/harness init` lo ejecute todo de una vez. Dejar el e2e como paso opcional «cuando dé tiempo». | Meterlo en `commands.test` haría que `bin/harness init` —el arranque de **toda** sesión— exigiera un Chromium de cientos de MB descargado (416 MB medidos en esta máquina para el Chromium completo) y un `vite build` completo en cada verificación de entorno: convertiría el paso barato de orientación en el más caro del repo. Además StrykerJS usa `vitest` como *runner* (`stryker.config.json:5`) y arrastraría el e2e dentro de **cada** ejecución de mutante, que es inviable. Dejarlo opcional, en cambio, sería volver al problema de origen: nadie mira lo que no es una puerta. La solución es que sea una puerta **explícita y propia**, con su línea en el informe de cierre. `oxlint --deny-warnings` y `tsc -b` sí cubren `tests/e2e/` desde el primer día (ver Decisión 37), así que el código e2e no queda sin verificar. |
| 39 | **Las etiquetas que se le pasan a axe son las cinco acumulativas `['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']`, y NO se usa `.options()`.** | Pasar solo `wcag22aa`. Activar `target-size` a mano con `.options({ rules: { 'target-size': { enabled: true } } })`. Confiar en el conjunto de reglas por defecto de axe. | En axe-core 4.13.0 la regla `target-size` viene **`enabled: false` por defecto**, así que el conjunto por defecto **no la ejecuta** — y es la única regla que cubre SC 2.5.8, el criterio con 21 violaciones medidas en la portada. Se verificó por dos vías independientes que `withTags(['wcag22aa'])` **sí** la ejecuta: leyendo la fuente instalada (`axe.js:20541-20581`, donde `rule.enabled !== false` solo se consulta cuando `include.length === 0`) y ejecutándolo de verdad. Pero `wcag22aa` es la **única** etiqueta que trae `target-size` y `target-size` es la **única** regla con esa etiqueta: pasarla a secas perdería todo lo demás, de ahí la lista acumulativa. `.options()` se evita porque el README del paquete dice que *«Will override any other configured options»* y podría anular las etiquetas; como no hace falta, la duda es irrelevante. |
| 40 | **Corrección de nivel WCAG que este documento asume: SC 2.4.13 Focus Appearance es AAA, no AA.** El obligatorio en AA es **2.4.7 Focus Visible** más **1.4.11 Non-text Contrast** para el contraste del propio indicador. Se decide **cumplir 2.4.13 igualmente** (perímetro ≥ 2 px CSS y ≥ 3:1 entre el estado enfocado y el no enfocado) pero **rotulándolo como AAA**, no vendiéndolo como AA. | Seguir citándolo como AA (como hacían la Decisión 11 y algún escenario de `accesibilidad.feature`). Rebajarlo a 2.4.7 a secas y no cumplir 2.4.13. | Afirmar un nivel de conformidad que no corresponde es exactamente el tipo de afirmación no verificada que este proyecto prohíbe, y aquí el error iba a favor nuestro. Cumplirlo sale prácticamente gratis: `_tokens.scss:119-126` ya declara `outline: $grosor-foco solid var(--color-foco)` con `$grosor-foco: 2px` y `outline-offset: 2px`. Lo único que hay que añadir es comprobar que `--color-foco` pasa 3:1 contra **ambos** fondos adyacentes (el del componente y el de la página), no solo contra uno. |
| 41 | **La feature 22 no reabre ni un solo escenario de la 21 ni de la 19: construye la maquetación real que hace que los 8 escenarios de navegador real de la 21 (@s12, @s27, @s28, @s29, @s30, @s31, @s32, @s34) y los 4 de la 19 (@s2, @s17, @s18, @s19) puedan pasar de verdad, y los automatiza.** El orden de cierre es: 21 `done` con sus puertas unitarias → 22 construye maquetación y capa base → los 12 escenarios de navegador real se ejecutan como e2e de Playwright → 19 sale de `blocked`. | Cerrar la 19 marcando esos 4 escenarios como «pendiente, no bloqueante», con el precedente de `galeria` @s9/@s10. Copiar los 12 escenarios dentro del `.feature` de la 22. | El precedente de `galeria` aplica a una cláusula aislada (scroll físico) que no depende de que exista ningún otro fichero; aquí la dependencia es estructural: los 12 escenarios no fallaban por estar mal escritos, fallaban porque **no había maquetación que auditar**. Y copiarlos sería duplicar un contrato ya aprobado por la puerta humana, que es la vía conocida a que las dos copias diverjan (misma razón que la Decisión 20 da para las rutas). La 22 los **ejecuta**; la 21 y la 19 los **poseen**. |

## Arquitectura

```
visitante ──→ páginas (src/pages/)
                 │
                 ├─→ componentes (src/components/)   ← solo cablean
                 │        │
                 │        └─→ lógica pura (src/components/*-logica.ts, src/lib/)
                 │                 ← toda decisión mordible por mutación
                 │
                 └─→ datos (src/data/) + fuente única de negocio (src/lib/site.ts)
```

- `src/lib/site.ts` — **fuente única** del NAP, horario y enlaces derivados.
- `src/data/*.ts` — catálogos estáticos tipados (servicios, equipo, FAQ, blog,
  productos, campañas), con `as const` + `satisfies`.
- `src/components/<X>.tsx` + `<X>.module.scss` + `<X>.test.tsx` co-locados.
- `src/styles/_tokens.scss` — tokens de marca; nada de valores sueltos en los
  módulos.
- `src/styles/global.scss` — la capa del **documento**: reset, `html`/`body`,
  `@font-face` y `scroll-padding-top`. Se importa una sola vez, desde
  `src/main.tsx` (Decisión 28). No sustituye a las otras dos capas.
- `public/fuentes/` + `public/img/` — fuentes autoalojadas e imágenes locales.
  Los ficheros de `public/` no llevan hash y se copian tal cual a `dist/`
  (Decisiones 32, 34).
- `tests/e2e/` + `playwright.config.ts` + `tsconfig.e2e.json` — la puerta de
  verificación en navegador real, deliberadamente **fuera** de `src/` para que
  Vitest y Playwright no se pisen (Decisiones 37, 38).

## Especificación por feature

El detalle escenario a escenario vive en `features/<name>.feature`. Aquí va el
propósito y el contorno de cada una; el orden es el de implementación, porque las
dos primeras son cimiento de todas las demás.

### Cimientos

- **`tokens_marca`** — La paleta real derivada del logo, la escala tipográfica y
  el espaciado, como tokens SCSS. Incluye la **verificación de contraste WCAG AA
  calculada**, no supuesta: el lima `#B4C718` no se usa para texto sobre blanco
  sin haber medido su ratio.
- **`datos_negocio`** — `src/lib/site.ts`. El dato se escribe una vez y los
  enlaces (`tel:`, `wa.me`, `mailto:` si algún día hay email) se derivan. El
  normalizador de teléfono **falla cerrado**.

### Landing (una sección, una feature)

`cabecera_y_navegacion` · `hero` · `servicios` · `equipo` · `reserva_chat` ·
`galeria` · `campanas_portada` · `informacion_contacto` · `formulario_contacto` ·
`faq` · `pie_de_pagina` · `selector_paleta`

Todas parten del contrato heredado —la **interacción** aprobada se respeta— y le
cambian los **datos** por los reales, con las supresiones de la Decisión 2.

### Ensamblaje — nueva feature: `ensamblaje_landing`

> **No estaba en las 19 features originales.** Las 14 features `done` construyeron
> y probaron 12 componentes en aislamiento; ninguna los ha ensamblado. `index.html`
> referencia `/src/main.tsx`, que no existe; no hay `App.tsx`; no hay enrutado;
> `pnpm run build` falla. El hueco ya estaba anotado explícitamente al cerrar
> `servicios` («pendiente legítimo de una feature de ensamblado de página con su
> propio test, no un defecto de servicios»), pero nunca se convirtió en una
> feature real hasta esta conversación. Todavía no tiene `id` en
> `feature_list.json` — lo añade `craftsman_lead` al aceptar este spec.

**Propósito** — Que la web de Galapavet exista de verdad: un punto de entrada que
monta la aplicación, una landing que compone sus 8 secciones ancladas y
`CampanasPortada` en el orden real del contrato heredado, y un enrutador que hace
de `/`, `/campanas`, `/blog` y `/tienda` destinos reales — sin construir el
contenido que ya tienen asignado sus propias features.

**Comportamiento**

- `src/main.tsx` monta `<App />` sobre el elemento `#root` de `index.html`. Si
  `#root` no existe, falla con una excepción nombrada (Decisión 21) — no monta
  nada a medias.
- `src/App.tsx` es el shell común a **todas** las rutas: renderiza `Cabecera`
  (con un `ancho` real y vivo, derivado de `window.innerWidth` y actualizado en
  cada `resize` — Decisión 22), el enrutado (`<BrowserRouter>`, Decisión 19),
  `PieDePagina` y `SelectorPaleta`, en ese orden relativo (cabecera arriba; pie
  y selector fuera del contenido propio de cada ruta). Es lo que exige el
  propio criterio de aceptación de `pagina_campanas` («la página comparte
  cabecera y pie con la landing»).
- `src/pages/Landing.tsx` es el contenido de la ruta `/`: compone, en orden,
  `Hero` (`id="inicio"`) → `Servicios` (`id="servicios"`) → `CampanasPortada`
  (sin ancla) → `Equipo` (`id="equipo"`) → `ReservaChat` (`id="reservar"`) →
  `Galeria` (`id="galeria"`) → una sección Contacto (`id="contacto"`) que anida
  `FormularioContacto` seguido de `InformacionContacto` → `Faq` (`id="faq"`).
  Ver Decisión 16 (orden) y Decisión 18 (Contacto es una sola sección).
- El `id` de cada ancla lo asigna `Landing.tsx`, nunca el propio componente
  (Decisión 17).
- El enrutador registra `/` → `Landing`, y las rutas de subpágina que declara
  `src/data/navegacion.ts` (Decisión 20) — su contenido y su alcance exacto
  quedan en la PREGUNTA ABIERTA 2, más abajo.

**Contrato**

- Entrada: ninguna explícita del visitante más allá de la URL con la que llega
  (`pathname`) y el ancho real de su ventana.
- Salida: el árbol DOM montado en `#root`; para la ruta `/`, el conjunto de
  landmarks/secciones y anclas descrito arriba.
- Estado de error: solo el de `#root` ausente (Decisión 21). Ningún componente
  compuesto adquiere un estado de error nuevo por el hecho de ensamblarse: cada
  uno ya falla cerrado por su propio contrato, ya aprobado y ya `done`.
- Fuera del glob de mutación de Stryker (`src/lib/**/*.ts` + `src/**/*-logica.ts`,
  `stryker.config.json`), igual que el resto de `.tsx` del proyecto: el orden,
  los `id` de ancla y las rutas se verifican por tests de integración explícitos
  (renderizar la app entera y comprobar el árbol accesible) y por sabotaje
  manual del `judge`, no por Stryker.
- No es responsabilidad de esta feature: el contenido de `/campanas`, `/blog`
  ni `/tienda` (features 16-18, ya `spec_ready` con su propio Gherkin
  aprobado); ni el `<title>`/metadatos por ruta (`seo_estructura`, feature 15).

**Casos límite**

1. `#root` no existe en el documento → el punto de entrada lanza una excepción
   nombrada que menciona `root`; no se monta nada.
2. Cada una de las 7 anclas (`#inicio`, `#servicios`, `#equipo`, `#reservar`,
   `#galeria`, `#contacto`, `#faq`) existe **exactamente una vez** en el
   documento de la ruta `/` — ni ausente ni duplicada.
3. Ningún elemento con `id="campanas"` existe en el documento: `CampanasPortada`
   no tiene ancla contratada; sus tarjetas y su botón navegan a `/campanas`
   (ruta), no a un ancla de la landing.
4. La ventana cambia de tamaño, con el menú móvil abierto o cerrado: `Cabecera`
   reacciona al nuevo `ancho` real (reutiliza el comportamiento ya contratado
   por `cabecera_y_navegacion.feature` @s11, ahora accionado por un evento de
   `resize` real, no por un cambio de prop inyectado a mano en un test).
5. `SelectorPaleta` se renderiza en cualquier punto del árbol sin alterar el
   orden de las 8 secciones con ancla — su posición no es parte de este
   contrato de orden.
6. Navegar a una ruta no registrada por el enrutador (deep-link o clic) no deja
   una pantalla en blanco indistinguible de un fallo — comportamiento exacto
   sujeto a la PREGUNTA ABIERTA 2.
7. El proyecto compila (`vite build`) y arranca (`vite dev`/`preview`) con
   `main.tsx`, `App.tsx` y `Landing.tsx` en su sitio — el hecho que motivó esta
   feature.

**PREGUNTA ABIERTA**

1. **Orden exacto Equipo → ReservaChat → Galería.** La Decisión 16 lo fija en
   ese orden, pero con **una sola** fuente (la tabla de
   `docs/contrato-heredado/README_TRASPASO.md`); a diferencia de
   Hero→Servicios→Campañas y de que Contacto es una sola sección (dos fuentes
   independientes cada una), este tramo no tiene una segunda cita que lo
   confirme, porque el `.dc.html` original no está en el repositorio. Se toma
   como orden de trabajo; requiere confirmación explícita antes de que
   `gherkin_author` lo convierta en escenario — mismo criterio de prudencia que
   el `PENDIENTE` ya existente en `servicios.feature` sobre el orden de sus 5
   bloques.
2. **`/campanas`, `/blog` y `/tienda`: ¿catch-all genérico o placeholder a
   medida?** Recomendación de este documento: un único `<Route path="*">` con
   un estado «página no encontrada» honesto y accesible (con enlace de vuelta a
   `/`), que cubre las tres hasta que sus propias features (16, 17, 18, ya
   `spec_ready`) añadan su propia `<Route>` por encima. Alternativa: un
   placeholder «Próximamente» a medida por ruta — este documento la descarta
   porque duplicaría/tiraría trabajo que esas tres features ya tienen aprobado
   con su propio contrato, pero la deja como PREGUNTA ABIERTA (no como
   Decisión) porque el encargo de esta conversación pedía explícitamente que la
   cerrara el humano, no `spec_partner` en solitario.
3. **Nombre accesible del contenedor `id="contacto"`.** Sus dos hijos
   (`FormularioContacto`, `InformacionContacto`) ya tienen su propio
   `aria-label` (`"Escríbenos"`, `"Información de contacto"`). Si el contenedor
   necesita además su propio landmark con nombre accesible «Contacto» — para
   que el destino del ancla se anuncie como tal — o si basta con el `id` sin
   rol ni nombre propio, se deja abierto, salvo que entre en conflicto con los
   dos `aria-label` ya aprobados.

### Transversales

- **`seo_estructura`** — `lang`, metadatos, Open Graph y JSON-LD con el tipo
  Schema.org correcto para una clínica veterinaria, alimentado por la fuente
  única. Ataca directamente el «SEO inexistente» del estudio de prospección.
- **`accesibilidad`** — Criterios WCAG 2.2 AA verificables: contraste, área
  táctil mínima, foco visible, `prefers-reduced-motion`, y cero violaciones de
  `axe` en cada página.

### Subpáginas

> Dependen del enrutador y el shell común que fija `ensamblaje_landing` (ver esa
> sección, arriba) para tener una ruta real donde montarse y una cabecera/pie
> compartidos. Hasta que cada una aterrice, su ruta puede estar cubierta solo
> por el catch-all de `ensamblaje_landing` (PREGUNTA ABIERTA 2 de esa sección).

- **`pagina_campanas`** — Listado de campañas + ficha. Contenido de campaña
  derivado de servicios que la clínica **sí** presta; precios y fechas quedan
  `PENDIENTE`, no se inventan.
- **`pagina_blog`** — Listado con filtro por categoría y vista de artículo.
  Contenido editorial de demo, rotulado como tal.
- **`pagina_tienda`** — Rejilla de productos sobre las **4 categorías reales**
  (Piensos, Paseo, Descanso, Juegos), con cesta local. Sin precios inventados y
  sin pasarela de pago.

### Identidad visual — nueva feature: `identidad_visual` (feature 22)

> **Por qué existe.** El 23/08/2026 se midió el `dist/` de producción con un
> navegador real: **0 apariciones de `font-family` en todo el CSS generado**
> (`getComputedStyle(body).fontFamily` = «Times New Roman»), **0 reglas para
> `html` o `body`**, 124 reglas CSS en total, 3 roles de color y **ninguna
> carpeta `public/`** — de modo que las 26 rutas de imagen del código, el logo
> del pie y el favicon dan 404. La feature 21 hizo lo que su contrato pedía;
> el hueco es del contrato: excluye el diseño expresamente
> (`features/sistema_de_diseno_visual.feature:160-168`) y deja los roles de
> color más allá de fondo/texto/foco como PENDIENTE (`:182-189`). Y ninguna de
> las 712 pruebas podía verlo, porque **corren en jsdom, que no calcula
> layout** (`vite.config.ts:46-65`). Ver Decisión 25.

**Propósito** — Que la web de Galapavet **se vea**: que tenga la tipografía, el
color, el ritmo y las imágenes de un sitio terminado, al nivel del prototipo de
referencia y mejorando lo que este hace regular, y que esa capa visual sea
**comprobable en un navegador real**, no solo en jsdom.

**Comportamiento**

1. **Roles de color completos.** El sistema pasa de 3 roles a **15 de color +
   2 de sombra**, con nombre en español, definidos en las 4 variantes ya
   fijadas por `selector_paleta` (`marca`, `lima`, `verde`, `noche`) como
   *custom properties* conmutadas por `[data-variante]` sobre el elemento raíz
   — el mecanismo que `index.html:30` y `SelectorPaleta.tsx:21` ya aplican
   antes del primer pintado. Cada rol se **deriva** por mezcla en sRGB del
   morado `#77286B`, el lima `#B4C718` o el verde profundo `#48704B`
   (`src/lib/tokens.ts:8-12`) con blanco o negro puro, y se verifica con la
   fórmula real de `src/lib/contraste.ts` **antes** de fijarse.
2. **Capa base global.** Nace `src/styles/global.scss`, importada una sola vez
   desde `src/main.tsx`: reset explícito, reglas de `html`/`body`, las
   `@font-face` de las dos familias autoalojadas y el `scroll-padding-top` de
   la cabecera fija (Decisiones 28, 29, 30).
3. **Tipografía autoalojada.** Outfit para titulares y datos numéricos, DM Sans
   para texto corrido, ambas variables, subconjunto `latin`, servidas desde
   `public/fuentes/` (Decisiones 32, 33).
4. **Imágenes locales.** Se crea `public/` y se llenan los 26 huecos hoy en 404
   (Decisiones 34, 35, 36), inventariados como contenido de demostración.
5. **Maquetación real** de cada componente y página ya `done`, siguiendo los
   patrones de `progress/estudio_diseno_referencia.md` §4 y el bandeado alterno
   de secciones que hoy no existe.
6. **Verificación en navegador real** con Playwright + axe-core sobre el
   `dist/` de producción (Decisiones 37, 38, 39).

**Contrato**

- **Entradas:** el atributo `data-variante` del elemento raíz (4 valores ya
  fijados), el ancho real de la ventana y las preferencias del sistema
  (`prefers-reduced-motion`, y `prefers-color-scheme` **no** — la paleta la
  elige el visitante, no el sistema).
- **Salidas:** el CSS servido en `dist/`; los `.woff2` y las imágenes de
  `public/`; y el veredicto de las tres puertas.
- **Estados de error / condiciones de fallo:** una violación de axe con
  cualquiera de las cinco etiquetas de la Decisión 39; un rol de color que no
  alcance su mínimo de la matriz de uso; un literal de color en un
  `.module.scss`; una `transition`/`animation` fuera de un `@media` de
  `prefers-reduced-motion`; una respuesta 404 de imagen o de fuente; una
  petición a un tercero distinta del mapa embebido ya declarado.
- **Fuera del glob de mutación de Stryker**, como todo el CSS y los `.tsx`: lo
  mordible sigue viviendo en `src/lib/**` y `src/**/*-logica.ts`.
- **No es responsabilidad de esta feature:** cambiar el árbol accesible, los
  atributos ARIA, los textos o los datos de ningún componente ya `done`; ni
  añadir escenarios nuevos de comportamiento a las features 1-21.

**Qué NO entra (alcance excluido, explícito)**

1. **Ningún dato ni contenido del prototipo de referencia.** Ni sus 12
   servicios, ni sus 6 profesionales con colegiaciones, ni su número de
   registro sanitario, ni su valoración de Google, ni sus teléfonos, ni su
   servicio de urgencias 24 h. Se toma **solo la arquitectura visual**. La
   única fuente de contenido es `docs/datos-galapavet.md` y `src/data/`.
2. **Ningún color del prototipo.** La paleta la fija la Decisión 8; los roles
   nuevos se derivan de los tres hexadecimales de marca, nunca del prototipo.
3. **Fotografías del equipo.** `src/data/equipo.ts` no declara ningún campo de
   imagen y `Equipo.test.tsx:184` exige cero `img` en la sección. La ausencia
   de retratos es la conducta correcta, no un hueco pendiente: poner caras de
   banco junto a los nombres de dos personas reales sería suplantación.
4. **Imágenes en Servicios y en el listado del blog.** Ambas están prohibidas
   por prueba (`Servicios.test.tsx:402`, `PaginaBlog.test.tsx:164`), aunque el
   prototipo sí las lleve.
5. **Rediseño de la interacción.** Ningún componente cambia de patrón: el FAQ
   sigue siendo `<button aria-expanded aria-controls>` y **no** pasa a
   `<details name>`; las tarjetas de blog y campañas siguen siendo `<Link>` y
   **no** vuelven a `<button>` como en el prototipo.
6. **Iconografía a medida, ilustración original y animación decorativa nueva**
   más allá de las transiciones funcionales de la Decisión 31.
7. **Un manifiesto PWA**, que exigiría un icono de 512×512 y por tanto el
   vector que aún no tenemos (Decisión 36).
8. **El `logo`/`image` del JSON-LD**: ampliaría el contrato de `seo_estructura`
   (feature 15, ya `done`). Se deja anotado, no se hace de tapadillo.

**Roles de color — variante `marca` (fondo blanco)**

Ratios recalculados el 23/08/2026 con la fórmula de `src/lib/contraste.ts`
(mismos pesos de luminancia relativa, misma compensación 0,05). Los valores de
control coinciden dígito a dígito con los ya aprobados por `tokens_marca`
(morado/blanco 9,13 · verde/blanco 5,68 · lima/blanco 1,89), lo que confirma
que el cálculo usa la misma fórmula. **El `tdd_craftsman` debe re-verificarlos
él mismo con el módulo real antes de fijarlos**, leyendo el texto de
`_tokens.scss` (patrón ya establecido en `src/lib/diseno/tokensColor.ts:50-58`),
no dando esta tabla por buena.

| Rol | Valor | Derivación | Verificación |
| --- | ----- | ---------- | ------------ |
| `--color-fondo` *(ya existe)* | `#FFFFFF` | ya fijado por `tokens_marca` | — |
| `--color-fondo-alterno` | `#F4EEF3` | blanco + 8 % morado | texto morado encima **7,99** |
| `--color-superficie` | `#FFFFFF` | — | tinta encima **12,84** |
| `--color-superficie-elevada` | `#FAF6F9` | blanco + 4 % morado | morado encima **8,53** |
| `--color-tinta` | `#531C4B` | morado + 30 % negro | sobre blanco **12,84**; sobre `#F4EEF3` **11,23** |
| `--color-texto` *(ya existe)* | `#77286B` | morado de marca | sobre blanco **9,13**; sobre `#F4EEF3` **7,99** |
| `--color-texto-suave` | `#925389` | morado + 20 % blanco | sobre blanco **5,50**; sobre `#F4EEF3` **4,81** (≥ 4,5) |
| `--color-primario` | `#77286B` | morado de marca | blanco encima **9,13** |
| `--color-primario-fuerte` | `#6B2460` | morado + 10 % negro | blanco encima **10,26** (hover, Decisión 27) |
| `--color-sobre-primario` | `#FFFFFF` | — | ver fila anterior |
| `--color-acento-tinta` | `#48704B` | verde profundo de marca, ya verificado | sobre blanco **5,68**; sobre `#F6F8E3` **5,27**; sobre `#F4EEF3` **4,97** |
| `--color-acento-suave` | `#F6F8E3` | blanco + 12 % lima | verde encima **5,27** |
| `--color-borde-control` | `#A06997` | blanco + 70 % morado | sobre blanco **4,23**; sobre `#F4EEF3` **3,70** (≥ 3, SC 1.4.11) |
| `--color-borde` | `#DDC9DA` | blanco + 25 % morado | **1,56** — decorativo: solo donde el borde NO identifica un control |
| `--color-foco` *(ya existe)* | `#77286B` | ya fijado | ≥ 7,99 sobre todas las superficies claras |
| `--sombra-reposo` / `--sombra-elevada` | dos pasos, sombra teñida con el color de la tinta | mucho difuminado, poca opacidad | sin requisito de contraste; viven en `_tokens.scss` porque los `rgba()` están prohibidos en los `.module.scss` |

Dos roles del prototipo con nombre parecido **se separan a propósito**:
`--color-borde` (decorativo: perímetro de tarjeta, que ya se distingue por
fondo y sombra) y `--color-borde-control` (≥ 3:1, porque el borde de un campo o
de un botón fantasma **es** lo que identifica el control). El prototipo los
tiene fundidos en uno solo a **1,30:1**, y por eso sus controles fantasma
incumplen SC 1.4.11.

**Variante `noche` (fondo `#000000`) — punto de partida verificado**

El morado **no sirve** contra negro puro (2,30:1, ya documentado en
`_tokens.scss:62`). Valores verificados que sí funcionan: superficie `#1A1A1A`
(blanco encima **17,40**, lima encima **9,22**), acento suave `#1B1E04` = negro
+ 15 % lima (lima encima **9,01**), acento tinta = lima `#B4C718` (**11,12**
sobre negro), borde de control `#737373` (**4,43** sobre negro, **3,67** sobre
`#1A1A1A`). Las variantes `lima` (`#F8F9E8`) y `verde` (`#F0F4F1`) admiten los
mismos valores que `marca` con margen (morado sobre `#F8F9E8` = **8,57**, sobre
`#F0F4F1` = **8,22**). **La tabla completa de las tres variantes restantes es
trabajo del `tdd_craftsman`** y sale de la puerta de contraste, no de aquí.

**Casos límite**

1. **Variante `noche`.** Todo rol nuevo se redefine ahí; ninguno se hereda de
   `marca`. Un rol que exista en `marca` y falte en `noche` es un fallo, no una
   omisión tolerable.
2. **Fuente que no llega** (red lenta o bloqueada): el texto se pinta con la
   familia de respaldo desde el primer instante y el intercambio **no mueve un
   solo píxel**, gracias a las métricas ajustadas (Decisión 33).
3. **Imagen que no carga o que aún no ha cargado:** el hueco conserva su
   relación de aspecto con fondo `--color-fondo-alterno`; no colapsa a 0×0 ni
   desplaza el contenido (de ahí `width`/`height` obligatorios).
4. **`prefers-reduced-motion: reduce`:** ninguna animación ni transición queda
   en curso, y `scroll-behavior` vuelve a `auto`. Verificable de verdad con
   `test.use({ reducedMotion: 'reduce' })`.
5. **Página muy corta** (por ejemplo la 404): el pie no debe quedar flotando a
   media altura. Enlaza con el PENDIENTE ya anotado en la feature 21 sobre si
   `App.tsx` necesita fichero de estilos propio.
6. **Ventana en el punto de corte exacto (1024 px):** la rama que decide
   `esMovil()` en JS y la que maqueta el CSS deben coincidir. El punto de corte
   es **uno solo**, `PUNTO_DE_CORTE_NAVEGACION_PX = 1024`
   (`Cabecera-logica.ts`), verificado por `puntoDeCorte.ts:6`; el prototipo usa
   1120 en la portada y 1080 en las subpáginas, y eso **no se copia**.
7. **Texto largo dentro de una tarjeta:** los pies de tarjeta de una misma fila
   siguen alineados (patrón `margin-top: auto` + `border-top`), sin recortes ni
   alturas fijas.
8. **Cero peticiones a terceros** distintas del mapa embebido ya declarado:
   ninguna a `fonts.googleapis.com`, `fonts.gstatic.com` ni
   `images.pexels.com`, y **cero respuestas 404** de imagen o de fuente. Es
   justo lo que ninguna prueba de jsdom podía ver.
9. **Componente nuevo:** si la maquetación exige crear un componente compartido
   (por ejemplo un `Boton`), hay que **añadirlo al inventario** de
   `src/lib/diseno/inventarioModulos.ts:16-36` o la puerta falla.

**PREGUNTAS ABIERTAS**

1. **`og:image` relativo contra la especificación de Open Graph.**
   `MetadatosPagina.tsx:18` emite `/img/og/galapavet.webp`, una ruta relativa,
   pero <https://ogp.me/> define el tipo `URL` como «All valid URLs that
   utilize the http:// or https:// protocols», es decir **absoluta** — mientras
   que `MetadatosPagina.test.tsx:82-83` exige exactamente lo contrario
   (`expect(ogImagen.startsWith('/')).toBe(true)` y
   `expect(ogImagen).not.toMatch(/^https?:\/\//)`). Es una contradicción real
   entre el contrato escrito y el estándar: hoy la imagen de compartición
   probablemente **no se resuelve en ningún rastreador**. Resolverla exige
   enmendar un escenario de `seo_estructura` (feature 15, ya `done`) y conocer
   el dominio final de publicación, que este documento no tiene. **No se
   arregla a escondidas dentro de la feature 22.** Le toca al `craftsman_lead`
   decidir si abre una reparación de la 15 o si se difiere hasta que haya
   dominio.
2. **Parque de navegadores objetivo.** No está declarado en ningún sitio del
   repositorio, y cuatro piezas del prototipo dependen de ello:
   `color-mix(in srgb, …)` y `backdrop-filter` (la cabecera translúcida:
   **sin soporte queda translúcida e ilegible**, así que necesita plan de
   degradación), `text-wrap: pretty` e `interpolate-size: allow-keywords`.
   **NO VERIFICADO.** Debe fijarlo el humano antes de que el `tdd_craftsman`
   los use; mientras no esté fijado, cada uno lleva su respaldo sólido.
3. **`-webkit-font-smoothing: antialiased`.** No está estandarizada, solo
   funciona en macOS y **adelgaza** el texto. Puede estar justificada acotada a
   la variante `noche` (texto claro sobre fondo oscuro), pero eso solo se puede
   decidir **con la fuente ya instalada y mirándolo**, no antes. Se deja
   abierta; por defecto, no se pone.
4. **Peso real de `chromium --only-shell` en disco.** El Chromium completo mide
   **416 MB** medidos en esta máquina; el shell headless será menor, pero la
   cifra exacta está **NO VERIFICADA** porque no se instaló para no alterar la
   máquina sin permiso. Solo afecta al coste, no al diseño.

## Riesgos abiertos

1. **El cliente no publica email ni redes.** El formulario de contacto no tiene
   destinatario real. Bloquea la integración de envío, no la maqueta.
2. **Sin coordenadas exactas**, el mapa y el JSON-LD se centran por dirección
   postal; conviene confirmarlas con el cliente.
3. **La valoración de Google es un dato vivo.** Si se muestra, va fechada.
4. **Todo el contenido de demo debe sustituirse antes de publicar.** Se entrega
   inventariado para que la sustitución sea mecánica y no se olvide ninguna pieza.
5. **Ninguna de las 24 fotografías de esta web es de Galapavet.** Son imágenes
   de banco (Pexels, licencia de uso comercial sin atribución obligatoria,
   verificada en <https://www.pexels.com/license/>), elegidas para que el
   diseño se pueda ver terminado. **No muestran las instalaciones de
   Galapagar, ni a su equipo, ni a sus pacientes, ni sus productos.** El único
   material gráfico real que la web contiene es **el logotipo**. Los avisos que
   ya se ven en pantalla (`Galeria.tsx:51-55`, `CampanasPortada.tsx:38-42`, y
   los propios de tienda y blog) **no se quitan hasta que llegue el material
   real**: son lo que evita que una foto de banco se lea como una afirmación
   sobre el negocio. Orden de sustitución, de más urgente a menos:
   1. **Galería (6 fotos) — URGENTE.** Es el peor caso: cada foto va rotulada
      con un nombre propio y un episodio clínico («Bruno · Alta tras cirugía de
      rodilla»), así que una foto de banco pone la mascota de un desconocido
      bajo una historia clínica inventada, atribuida a una clínica real.
      Además, las fotos reales de pacientes exigen el **consentimiento expreso
      de cada familia**, que hoy no consta (`src/data/galeria.ts:2-8`).
      Sustituir con material cedido y consentido, o **retirar la sección
      entera** — retirarla es una opción perfectamente válida.
   2. **Campañas (3 fotos) — ALTA.** Se leen como «así trabajamos nosotros».
      Se sustituyen a la vez que se confirmen las campañas reales, cuyo precio,
      vigencia y condiciones siguen pendientes (`src/data/campanas.ts:1-16`).
   3. **Imagen de compartición / Open Graph — ALTA, pero ya resuelta de raíz.**
      No lleva foto de banco: se compone con el logo real sobre el morado de
      marca (Decisión 35). Mejorable a futuro con una foto real de la fachada;
      hoy no miente.
   4. **Fondo del hero — MEDIA, y depende del encuadre.** Un **exterior** con
      una mascota no afirma nada; un **interior de clínica** se lee como
      «nuestras instalaciones» y sube a ALTA. Se elige exterior mientras no
      haya fotos propias.
   5. **Blog (6 fotos) — MEDIA.** Ilustran artículos ya rotulados como
      demostración. El `alt` se ajusta **a lo que se ve en la foto elegida**,
      nunca al revés: hoy hay al menos dos `textoAlternativoImagen` que
      describen escenas que ninguna foto disponible muestra.
   6. **Tienda (8 fotos) — BAJA.** Objetos genéricos, sin personas ni
      instalaciones que suplantar, y con los precios ya marcados como ejemplo.
6. **El favicon depende de material que el cliente aún no ha entregado.** No
   existe un vector del logotipo, y no se puede derivar uno fiel del raster de
   201×201 px. Hasta que llegue, el sitio se sirve con un juego raster derivado
   del logo (Decisión 36) y **no puede tener manifiesto PWA**, que exigiría un
   icono de 512×512. **Acción para el humano: pedir a Galapavet el original en
   `.ai`/`.svg`/`.pdf` de quien le hizo la marca.**
7. **La imagen de Open Graph no se resuelve hoy en ningún rastreador**, porque
   se emite como ruta relativa contra lo que exige la especificación de Open
   Graph, y una prueba ya `done` fija ese comportamiento. Ver PREGUNTA ABIERTA
   1 de la sección `identidad_visual`; requiere conocer el dominio final de
   publicación.
8. **El parque de navegadores objetivo no está declarado en ninguna parte del
   repositorio.** Cuatro piezas de la capa visual dependen de ello, y la más
   cara es `backdrop-filter`: sin soporte, la cabecera translúcida queda
   ilegible. Ver PREGUNTA ABIERTA 2 de la sección `identidad_visual`.
