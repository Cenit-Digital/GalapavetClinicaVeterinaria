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

### Transversales

- **`seo_estructura`** — `lang`, metadatos, Open Graph y JSON-LD con el tipo
  Schema.org correcto para una clínica veterinaria, alimentado por la fuente
  única. Ataca directamente el «SEO inexistente» del estudio de prospección.
- **`accesibilidad`** — Criterios WCAG 2.2 AA verificables: contraste, área
  táctil mínima, foco visible, `prefers-reduced-motion`, y cero violaciones de
  `axe` en cada página.

### Subpáginas

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
