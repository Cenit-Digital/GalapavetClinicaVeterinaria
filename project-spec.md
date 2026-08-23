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

## Riesgos abiertos

1. **El cliente no publica email ni redes.** El formulario de contacto no tiene
   destinatario real. Bloquea la integración de envío, no la maqueta.
2. **Sin coordenadas exactas**, el mapa y el JSON-LD se centran por dirección
   postal; conviene confirmarlas con el cliente.
3. **La valoración de Google es un dato vivo.** Si se muestra, va fechada.
4. **Todo el contenido de demo debe sustituirse antes de publicar.** Se entrega
   inventariado para que la sustitución sea mecánica y no se olvide ninguna pieza.
