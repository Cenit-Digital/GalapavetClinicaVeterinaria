# Delta de fidelidad — Sección «Reserva rápida por chat» (`#reservar`)

> Informe de análisis para el `tdd_craftsman`. Fuentes leídas de verdad, no
> supuestas: prototipo `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`
> (citado como `VLS:<línea>`; sección `id="reservar"` en `VLS:254-315`, datos
> del guion en `VLS:602-608` y estilos de burbuja/ventajas en `VLS:752-776`);
> web actual `src/components/ReservaChat.tsx`, `ReservaChat.module.scss`,
> `ReservaChat-logica.ts` y sus tests; `src/lib/site.ts`; `src/styles/_api.scss`
> y `_tokens.scss`; `src/pages/Landing.tsx` + `Landing.module.scss`;
> `features/reserva_chat.feature`, `features/rediseno_visual.feature`
> (@s33, @s34, @s52 y bloque C), `features/datos_negocio.feature`;
> `tests/e2e/geometria-escalas.spec.ts`, `tipografia.spec.ts`,
> `tokens-aplicados.spec.ts`, `datos-reales.spec.ts`, `css-presupuesto.spec.ts`;
> el CSS compilado real en `dist/assets/index-*.css`; y las capturas a 1280 px
> (`diseno_03.png` y=880→1400 + `diseno_04.png` y=0→170 para el prototipo;
> `web_02.png` y=250→870 para la web).
>
> Mapa de tokens prototipo → sistema (para leer las cifras de abajo):
> `--bg`→`--color-fondo` · `--bg-2`→`--color-fondo-alterno` ·
> `--card`→`--color-superficie` · `--surface`→`--color-superficie-elevada` ·
> `--border`→`--color-borde` · `--ink`→`--color-tinta` · `--text`→`--color-texto`
> · `--muted`→`--color-texto-suave` · `--primary`→`--color-primario` ·
> `--on-primary`→`--color-sobre-primario` · `--accent`→`--color-acento` ·
> `--accent-ink`→`--color-acento-tinta` · `--accent-soft`→`--color-acento-suave`
> · `--shadow`→`--sombra-elevada` (0 18px 45px .10) · `--shadow-sm`→`--sombra-reposo`
> (0 6px 18px .07).
>
> REGLA PARA EL CRAFTSMAN: en NINGÚN comentario de `src/` (ni `.tsx` ni
> `.scss`) se escribe el nombre comercial de la clínica ficticia del prototipo,
> su localidad, sus teléfonos ni su correo: `src/lib/diseno/datosDelSitio.test.ts`
> recorre el TEXTO REAL de `src/**` (incluidos comentarios) y falla. Cita el
> prototipo siempre como `VLS:<línea>`.

---

## Anatomía del prototipo

### Sección y rejilla (`VLS:254-255`)

- `<section id="reservar" data-screen-label="Reservar">`:
  `padding: clamp(64px, 9vw, 104px) clamp(18px, 5vw, 28px)`;
  `background: var(--bg-2)` (fondo ALTERNO; en la captura es la banda más
  oscura, `#EDF2F9`, entre Equipo y Galería, que van sobre `--bg`).
- Contenedor: `max-width: 1220px; margin: 0 auto; display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
  gap: clamp(28px, 4vw, 52px); align-items: center`.
  - Sin `@media` propio: dos columnas en cuanto caben 2 × 320 px + gap
    (≈ 700 px de contenedor), una columna por debajo. `align-items: center`
    hace que el bloque de texto quede centrado verticalmente respecto a la
    tarjeta de chat, más alta (en la captura el cintillo empieza a y≈1038
    mientras la tarjeta arranca a y≈990).
  - A 1280 px: columna de texto x≈30→620, tarjeta x≈668→1250 (≈582 px de
    ancho); gap ≈ 51 px.

### Columna izquierda (`VLS:256-271`)

Un `<div>` sin estilos con, en este orden:

1. **Cintillo** `<p>`: `font-size: 12px; letter-spacing: .22em;
   text-transform: uppercase; color: var(--accent-ink); font-weight: 700;
   margin: 0 0 13px` → «Reserva rápida».
2. **Titular** `<h2>`: `font-family: 'Outfit'; font-size: clamp(28px, 4.2vw, 46px);
   line-height: 1.08; letter-spacing: -.015em; font-weight: 600;
   color: var(--ink); margin: 0` → «Pide cita en menos de un minuto» (dos
   líneas a 1280 px).
3. **Párrafo** `<p>`: `font-size: 17px; line-height: 1.7; color: var(--muted);
   max-width: 52ch; margin: 16px 0 0` (dos líneas a 1280 px).
4. **Fila de acciones** `<div>`: `display: flex; flex-wrap: wrap; gap: 12px;
   margin-top: 28px`, con DOS enlaces en la misma fila:
   - **Botón relleno** (`VLS:261`, `href="https://wa.me/…" target="_blank"
     rel="noopener"`): `display: inline-flex; align-items: center;
     justify-content: center; min-height: 48px; padding: 14px 26px;
     border-radius: 999px; background: var(--accent-ink); color: #fff;
     font-weight: 700; font-size: 15px`; hover `filter: brightness(1.1)`.
     Texto «WhatsApp». Ancho en captura ≈ 130 px, alto ≈ 48 px.
   - **Botón contorno** (`VLS:262`, `href="tel:…"`): `display: inline-flex;
     align-items: center; justify-content: center; min-height: 48px;
     padding: 13px 25px; border-radius: 999px; border: 1.5px solid var(--border);
     color: var(--ink); font-weight: 600; font-size: 15px`; hover
     `border-color: var(--primary)`. Texto «Llamar a la clínica». Ancho en
     captura ≈ 182 px: el texto lleva ≈ 25 px de aire a cada lado.
5. **Lista de ventajas** `<ul>` (`VLS:264-270`): `list-style: none;
   margin: 28px 0 0; padding: 0; display: flex; flex-direction: column;
   gap: 11px`. Tres `<li>` (array `ventajasReserva`, `VLS:752-756`, conteo real
   3 = pista 3): `display: flex; align-items: flex-start; gap: 10px;
   font-size: 14.5px; color: var(--text)`. Cada uno abre con un
   **círculo de verificación** `<span>`: `flex-shrink: 0; width: 20px;
   height: 20px; border-radius: 50%; background: var(--accent-soft);
   color: var(--accent-ink); font-size: 12px; font-weight: 700;
   display: flex; align-items: center; justify-content: center;
   margin-top: 1px` con el glifo «✓», seguido del texto de la ventaja. Los tres
   textos del prototipo son promesas de servicio (plazo de confirmación,
   recordatorio por mensajería, cancelación sin coste): ver §4 y §5.

Todo alineado a la izquierda; nada centrado.

### Columna derecha: tarjeta de chat (`VLS:273-314`)

`<div>` tarjeta: `background: var(--card); border: 1px solid var(--border);
border-radius: 22px; overflow: hidden; box-shadow: var(--shadow)` (la sombra
GRANDE, 0 18px 45px .10, en reposo, sin hover); `display: flex;
flex-direction: column; min-height: 470px`. Tres bandas apiladas:

1. **Cabecera de conversación** (`VLS:274-280`): `display: flex;
   align-items: center; gap: 12px; padding: 15px 18px;
   border-bottom: 1px solid var(--border); background: var(--surface)`.
   - Avatar `<span>`: `width: 40px; height: 40px; border-radius: 50%;
     background: var(--primary); color: var(--on-primary); display: flex;
     align-items: center; justify-content: center; font-family: 'Outfit';
     font-weight: 700; font-size: 14px; letter-spacing: .04em`, con las dos
     iniciales del nombre comercial.
   - Bloque de texto: nombre `font-weight: 700; font-size: 14.5px;
     color: var(--ink)`; debajo, estado `font-size: 12px;
     color: var(--accent-ink); display: flex; align-items: center; gap: 6px`
     con punto `width: 7px; height: 7px; border-radius: 50%;
     background: var(--accent)` y el texto «en línea».
   - Alto de la banda en captura ≈ 72 px.
2. **Zona de mensajes** (`VLS:282-286`): `flex: 1; display: flex;
   flex-direction: column; gap: 10px; padding: 18px; overflow-y: auto;
   max-height: 330px; background: var(--bg)`. Es el «hueco»: con un solo
   mensaje queda ≈ 230 px de fondo `--bg` vacío bajo la burbuja porque la
   tarjeta tiene `min-height: 470px` y esta zona absorbe el sobrante.
   - Burbuja (`VLS:757-765`, estilo calculado por mensaje): `max-width: 84%;
     padding: 11px 15px; font-size: 14.5px; line-height: 1.55`.
     - Asistente: `align-self: flex-start; background: var(--card);
       color: var(--ink); border: 1px solid var(--border);
       border-radius: 16px 16px 16px 5px` (esquina inferior IZQUIERDA
       pequeña = «cola»).
     - Visitante: `align-self: flex-end; background: var(--primary);
       color: var(--on-primary); border: 1px solid transparent;
       border-radius: 16px 16px 5px 16px` (cola inferior DERECHA).
     - Ningún prefijo textual: el autor se distingue SOLO por color y lado.
3. **Pie del widget** (`VLS:288-313`): `padding: 14px 18px 18px;
   border-top: 1px solid var(--border); background: var(--surface);
   display: flex; flex-direction: column; gap: 10px`. Tres estados
   excluyentes + la nota:
   - `hayOpciones` → **chips**: contenedor `display: flex; flex-wrap: wrap;
     gap: 8px`; cada `<button>` `padding: 10px 16px; border-radius: 999px;
     border: 1px solid var(--border); background: var(--card);
     color: var(--ink); font-size: 13.5px; font-weight: 600; cursor: pointer;
     min-height: 44px`; hover `border-color: var(--primary);
     background: var(--accent-soft)`.
   - `hayInput` → **fila de texto** `display: flex; gap: 8px`: `<input>`
     `flex: 1; min-width: 0; min-height: 46px; padding: 12px 15px;
     border-radius: 999px; border: 1px solid var(--border);
     background: var(--card); color: var(--ink); font-size: 14.5px;
     outline: none; aria-label="Tu respuesta"` + `<button aria-label="Enviar">`
     `width: 46px; height: 46px; flex-shrink: 0; border-radius: 50%;
     border: none; background: var(--primary); color: var(--on-primary);
     font-size: 18px` con el glifo «→». Intro envía (`teclaEnvio`,
     `VLS:770`).
   - `chatHecho` → columna `gap: 9px`: enlace ancho completo `display: flex;
     align-items: center; justify-content: center; min-height: 48px;
     padding: 14px; border-radius: 999px; background: var(--accent-ink);
     color: #fff; font-weight: 700; font-size: 14.5px` («Enviar la solicitud
     por WhatsApp», `wa.me` con texto prellenado) + botón secundario tipo
     enlace `background: none; border: none; color: var(--primary);
     font-size: 13.5px; font-weight: 600; text-decoration: underline;
     min-height: 40px` («Pedir otra cita»).
   - **Nota de demostración** `<p>` siempre visible, al final del pie:
     `margin: 0; font-size: 11.5px; color: var(--muted); line-height: 1.5`.

### Proporciones medidas en la captura (1280 px)

- Tarjeta: y≈990→1458 → ≈ 470 px de alto (coincide con `min-height`).
  Cabecera ≈ 72 px; zona de mensajes ≈ 290 px (una burbuja de 2 líneas
  ≈ 70 px + hueco); pie ≈ 108 px (chips 44 px + nota).
- Columna de texto: cintillo y≈1038, h2 1078→1160, párrafo 1180→1230,
  botones 1262→1308, viñetas 1346/1378/1408.

---

## Estado actual de la web

### DOM que pinta `ReservaChat.tsx` (líneas 120-235)

```
section.reservaChat[data-contenedor-principal]
├─ div                                  ← columna de texto
│  ├─ p.eyebrow «Reserva de cita»
│  ├─ h2 «Cuéntanos qué necesita tu mascota»
│  ├─ p «Te guiamos paso a paso…»
│  ├─ a[href=tel:+34910829267] «Llamar a la clínica · 91 082 92 67»
│  ├─ a[href=tel:+34685343149] «Llamar al móvil · 685 34 31 49»
│  └─ ul › 3 li «Lunes a viernes: …» «Sábados: …» «Domingos: Cerrado»
└─ fieldset[aria-label="Asistente de reserva de Galapavet"]   ← tarjeta
   ├─ fieldset.cabeceraChat[aria-label="Cabecera del chat"]
   │  ├─ span[aria-hidden] «G»
   │  └─ div › strong «Asistente de reserva» · p «Galapavet» · p.disponibilidad (span.puntoDisponible + «Disponible»)
   ├─ div[role=log][aria-live=polite] › p × N «Asistente: …» / «Tú: …»
   ├─ (paso servicio | cuando) fieldset[aria-label="Respuestas rápidas"] › button × 6 | × 4
   ├─ (paso animal | nombre) input[aria-label="Tu respuesta"] + button «Enviar respuesta» [aria-disabled]
   ├─ (final) fieldset[aria-label="Resumen de tu solicitud"] › ul › 4 li · a «Llamar para cerrar la cita · 91 082 92 67» · button «Pedir otra cita»
   ├─ (urgencia) a «Llamar a urgencias fuera de horario · 91 851 13 93» · a «Llamar a la clínica · 91 082 92 67» · button «Empezar de nuevo»
   └─ p «Demostración: esta solicitud no se envía a ningún servidor. La cita se cierra por teléfono.»
```

El `id="reservar"`, el fondo de banda (`--color-fondo`, clase `.seccion`) y el
contenedor 1220 px + `padding-block: var(--ritmo-seccion)` los pone el wrapper
de `Landing.tsx:61-63` / `Landing.module.scss:18-27`, no el componente.

### Estilos que pinta `ReservaChat.module.scss`

- `.reservaChat`: `grid; repeat(auto-fit, minmax(min(320px,100%),1fr));
  gap: 32px; align-items: start` (arriba, NO centrado como el prototipo).
- Columna de texto `> div:first-child`: `display: flex; flex-direction: column;
  align-items: flex-start; gap: 12px` → los dos enlaces quedan APILADOS en
  vertical (cada uno en su fila), no en una fila `flex-wrap` como el
  prototipo. `a { @include boton-fantasma }`; `ul` sin viñetas ni marcas,
  color `--color-texto-suave`; `h2` en `paso-tipografico(4)` (mismo `clamp`
  que el prototipo); párrafo `max-width: 42ch`, color suave, `margin-bottom 8`.
- Tarjeta `> fieldset`: `@include tarjeta` (superficie, borde fino, radio
  24 px, `--sombra-reposo`, `overflow: hidden`, columna) + `padding: 24px`
  uniforme + `gap: 16px`; hover forzado a `--sombra-reposo`. SIN `min-height`.
- `.cabeceraChat`: `flex; gap 12; padding-bottom 12; border-bottom fino`;
  avatar 32×32 sobre `--color-acento-suave` con tinta `--color-acento-tinta`
  (patrón de Equipo, no el primario del prototipo); nombre y estado en tres
  líneas de bloque; `.disponibilidad` con punto 8 px `--color-acento`.
- `[role='log']`: `flex column; gap 8; margin-block 16; max-height 320;
  overflow-y auto`; cada `p`: `padding 8px 12px; radius 12px;
  background --color-fondo-alterno` — TODOS iguales, sin lado ni color por
  autor, sin borde ni cola, a todo el ancho.
- `input`: bloque a ancho completo, `margin-bottom 8`, borde de control
  1.5 px, radio 12 px (no píldora), 48 px de alto; el botón «Enviar respuesta»
  va DEBAJO, como `boton-primario` (56 px, ancho de texto), no como botón
  redondo junto al campo.
- `button` por defecto `@include boton-primario` (56 px) para «Enviar
  respuesta», «Pedir otra cita» y «Empezar de nuevo».
- `[aria-label='Respuestas rápidas'] button`: `@include pildora-filtro` +
  `margin-inline-end 8; margin-block-end 8; min-height: 48px` (sin
  contenedor `flex-wrap`; los márgenes hacen de gap).
- Los enlaces del estado final/urgencia dentro de la tarjeta no reciben
  estilo de botón (solo foco y área táctil): son enlaces de texto sueltos.
- La nota de demostración no tiene regla propia: hereda 16 px y
  `--color-texto`.

### Lo que se ve en la captura (`web_02.png`, y=250→870)

- Banda sobre `--color-fondo` (clara), entre Equipo y Galería (alternas):
  la alternancia está INVERTIDA respecto al prototipo, donde Reservar va sobre
  `--bg-2` y sus vecinas sobre `--bg` (esto lo gobierna `Landing.tsx`, ver
  §3 reserva-2).
- Columna de texto: cintillo y≈351, h2 dos líneas 380→470, párrafo 2 líneas
  493→520, dos píldoras APILADAS a y≈552→598 y 612→658, horario en tres líneas
  planas 683→731 sin marcas.
- **DEFECTO VISIBLE (el «desbordan» del encargo):** en las dos píldoras de
  contorno el texto toca el borde por los dos lados (x≈54 y x≈300): no hay
  relleno horizontal. Causa raíz VERIFICADA en el CSS compilado
  (`dist/assets/index-*.css`, regla `._reservaChat_… >div:first-child a`):
  la declaración `padding-inline` NO EXISTE en la salida. El mixin
  `boton-fantasma` (`src/styles/_api.scss:254`) escribe
  `padding-inline: espaciado(20)`, y `20` no es un paso de `$escala-espaciado`
  (`4, 8, 12, 16, 24, 32, 48, 64, 96`, `_api.scss:46-56`): `map.get` devuelve
  `null` y Sass descarta la declaración en silencio. Afecta a TODOS los
  botones fantasma del sitio (Hero secundario, «Tienda» de la cabecera, botón
  de menú, selector de paleta, «Ver campañas», botones de la galería,
  confirmación del formulario, tarjeta de urgencias) y el mismo `espaciado(20)`
  aparece en 10 declaraciones más de otros módulos (`Equipo.module.scss:49`
  → en `dist` el avatar sale con `margin: 0`; `InformacionContacto.module.scss:59,72`
  → las tarjetas salen sin `padding`; `Servicios.module.scss:45,51,65,69,70`;
  `PaginaBlog.module.scss:70,80`). Ver §7 paso 1 y §Riesgos.
- Tarjeta: x≈657→1226, y≈342→770 (≈ 428 px), pegada ARRIBA (no centrada con el
  texto); sin banda de cabecera ni de pie (todo blanco con 24 px de relleno
  uniforme), avatar 32 px verde suave con «G», tres líneas de cabecera
  («Asistente de reserva» / «Galapavet» / «● Disponible»), separador, UNA
  burbuja gris a todo el ancho con el prefijo «Asistente:», seis chips en dos
  filas, nota de demostración en 16 px del mismo color que el cuerpo. No hay
  «hueco»: la tarjeta termina justo bajo la nota.
- Nada cortado, ninguna imagen (la sección no lleva), ningún bloque vacío;
  el único bug pintado es el relleno ausente de las píldoras.

---

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
| --- | --- | --- | --- |
| reserva-1 | Las dos píldoras de contorno no tienen relleno horizontal: el texto toca los bordes. Causa: `padding-inline: espaciado(20)` en `boton-fantasma` (`_api.scss:254`) se descarta por no existir el paso 20. Prototipo: 25 px por lado (`VLS:262`). | bug | alta |
| reserva-2 | Fondo de banda: prototipo `--bg-2` (alterno), web `--color-fondo` (`Landing.tsx:61`, clase `.seccion`). Toda la alternancia de la portada está invertida respecto al prototipo (prototipo: servicios `bg`, campañas `bg-2`, equipo `bg`, reservar `bg-2`, galería `bg`, contacto `bg-2`, faq `bg`). Cambio de `Landing.tsx`, no de este componente; coordinar con el resto de secciones. | estilo | media |
| reserva-3 | Las acciones de la columna de texto van apiladas en vertical (columna flex) en vez de en UNA fila `flex-wrap; gap: 12px; margin-top: 28px` (`VLS:260`). | estructura | alta |
| reserva-4 | Falta el botón RELLENO (primera acción). Prototipo: verde `--accent-ink` con texto blanco, «WhatsApp». Sustituto honesto: «Llamar a la clínica · 91 082 92 67» como `boton-primario` (`--color-primario` / `--color-sobre-primario`, par ya validado en la matriz de contraste) y «Llamar al móvil · 685 34 31 49» como contorno. Ver §4 y §5 (sin WhatsApp). | estructura | alta |
| reserva-5 | La lista bajo los botones no lleva círculos de verificación (20 px, `--accent-soft`/`--accent-ink`, «✓», `VLS:267`) ni el ritmo `gap 11px; margin-top 28px`. Los tres ítems reales (horario, @s19) deben llevar la marca vía `::before` para no alterar su `textContent`. | estructura | alta |
| reserva-6 | Alineación vertical de la rejilla: prototipo `align-items: center` (texto centrado respecto a la tarjeta alta), web `start`. | estilo | media |
| reserva-7 | Gap de columnas: prototipo `clamp(28px, 4vw, 52px)` (≈ 51 px a 1280), web 32 px fijos. | estilo | baja |
| reserva-8 | Párrafo de intro: prototipo 17 px / 1.7 / `52ch` / `margin-top 16`; web 16 px / 1.5 / `42ch` / `margin-bottom 8`. | estilo | baja |
| reserva-9 | La tarjeta no tiene `min-height` (prototipo 470 px): no existe el «hueco» de la zona de mensajes y la tarjeta se ve ≈ 430 px, compacta y desequilibrada frente a la columna de texto. | estructura | alta |
| reserva-10 | La tarjeta no tiene tres bandas. Prototipo: cabecera `padding 15px 18px; border-bottom; background --surface` / mensajes `padding 18px; background --bg; flex: 1` / pie `padding 14px 18px 18px; border-top; background --surface`. Web: un único relleno uniforme de 24 px y `gap 16`, cabecera solo con `border-bottom`. | estructura | alta |
| reserva-11 | Avatar de la cabecera: prototipo 40 px, `--primary` con tinta `--on-primary`, Outfit 700, `letter-spacing .04em`; web 32 px, `--color-acento-suave`/`--color-acento-tinta`. | estilo | media |
| reserva-12 | Texto de la cabecera: prototipo DOS líneas (nombre 14.5 px 700 tinta + estado 12 px `--accent-ink` con punto 7 px); web TRES líneas, con el nombre real («Galapavet») en segunda posición y el estado en color suave. Propuesta: `strong` «Galapavet» primero, estado en `--color-acento-tinta`, «Asistente de reserva» como tercera línea pequeña. | estilo | media |
| reserva-13 | Burbujas: prototipo diferencia autor por lado y color (asistente izquierda, `--card`+borde, cola `16 16 16 5`; visitante derecha, `--primary`/`--on-primary`, cola `16 16 5 16`; `max-width 84%; padding 11px 15px`). Web: todas iguales, grises, a todo el ancho, sin cola. El prefijo «Asistente:»/«Tú:» se conserva (contrato @s20). | estructura | alta |
| reserva-14 | Chips de respuesta rápida: falta el contenedor `flex; flex-wrap; gap 8px` (hoy márgenes por botón). Estilo de chip ya equivalente (`pildora-filtro`, 48 px). | estilo | baja |
| reserva-15 | Paso de texto libre: prototipo fila `flex; gap 8px` con campo PÍLDORA (`radius 999; min-height 46`) y botón REDONDO 46×46 `--primary` con «→» (`aria-label`). Web: campo con radio 12 px a ancho completo y debajo un botón primario de 56 px con texto «Enviar respuesta». | estructura | alta |
| reserva-16 | Estado final: prototipo enlace de ancho completo relleno (`min-height 48; radius 999`) + secundario tipo enlace subrayado 40 px. Web: enlace de texto suelto + `boton-primario` de 56 px. Sustituto: «Llamar para cerrar la cita · 91 082 92 67» como `boton-primario` a ancho completo (48 px) y «Pedir otra cita» como `boton-fantasma` (ver §5 sobre por qué no un enlace en `--color-primario`). | estructura | media |
| reserva-17 | Estado urgencia (no existe en el prototipo; deriva de Decisión 5): los dos enlaces van sueltos como texto. Propuesta: primero `boton-primario` a ancho completo, segundo `boton-fantasma`, «Empezar de nuevo» `boton-fantasma`. | estilo | media |
| reserva-18 | Resumen final (`fieldset` «Resumen de tu solicitud»): sin estilo propio. Propuesta: panel `background --color-fondo; radius 12px; padding 12px 16px; list-style none; gap 4`. | estilo | baja |
| reserva-19 | Nota de demostración: prototipo 11.5 px `--muted` `line-height 1.5`; web 16 px en `--color-texto`. → `paso-tipografico(-1)` (12.8 px), `--color-texto-suave`, `margin 0`. | estilo | media |
| reserva-20 | Sombra de la tarjeta: prototipo `--shadow` (elevada) en reposo; web `--sombra-reposo` fijada por `tests/e2e/geometria-escalas.spec.ts` @s24 (la tarjeta del chat es una de las 4 «en reposo»). Se RESPETA el test (desviación declarada). | estilo | baja |
| reserva-21 | Radio de la tarjeta 22 px (prototipo) frente a 24 px (`$radio-grande`, mixin `tarjeta`). Decisión 24: manda la escala del repo. Sin cambio. | estilo | baja |
| reserva-22 | Textos de cintillo/h2/párrafo: el prototipo dice «Reserva rápida» / «Pide cita en menos de un minuto» / «…te devolvemos la hora exacta confirmada por WhatsApp. Sin registros y sin esperas al teléfono». Son promesas del prototipo (plazo, canal, cero esperas): NO se copian. Se conservan los textos actuales, que no afirman nada del negocio. | dato | — (sin cambio) |
| reserva-23 | Estado «en línea» de la cabecera: prohibido por `reserva_chat.feature` @s17. Se conserva «Disponible» (color y punto del prototipo, texto propio). | dato | — (sin cambio) |
| reserva-24 | Avatar «LS» (iniciales de la clínica ficticia) → «G». Hoy es un literal `'G'` en el `.tsx`; se deriva con `inicialesDe(datosNegocio.identidad.nombreComercial)` (`Equipo-logica.ts`, ya mordido al 100 %) para no retipear (Invariante 2). | dato | baja |

---

## Datos reales necesarios

| Pieza de la anatomía | Dato que pide | ¿Existe? Dónde | Si no existe: alternativa honesta |
| --- | --- | --- | --- |
| Avatar de la cabecera | Iniciales del nombre comercial | SÍ: `datosNegocio.identidad.nombreComercial` = «Galapavet» (`site.ts:72,76-80`); `inicialesDe()` en `src/components/Equipo-logica.ts:31-38` devuelve «G» | — |
| Nombre en la cabecera | Nombre comercial | SÍ: `site.ts` (mismo dato) | — |
| Estado «en línea» + punto | Presencia humana en tiempo real | NO existe y @s17 lo prohíbe | «Disponible» (ya implementado, @s34 lo fija): el guion corre en el navegador y está disponible siempre que carga la página; no afirma que haya nadie conectado |
| Botón relleno «WhatsApp» (fila de acciones) y enlace «Enviar la solicitud por WhatsApp» (estado final) | Número de WhatsApp Business confirmado | NO. `site.ts:84-87` deja `telefonoMovil.enlaceMensajeria()` listo (formato `wa.me`, `datos_negocio.feature` @s5/@s6), pero `docs/datos-galapavet.md` §9 y la cabecera de `datos_negocio.feature:37-40` dicen que el cliente NO publica canal de mensajería y que ninguna sección muestra botón hasta que lo confirme; Decisión 14 separa dos incógnitas (¿usa WhatsApp? ¿con qué número?) | El hueco del botón relleno lo ocupa la llamada verificada: «Llamar a la clínica · 91 082 92 67» (`boton-primario`); el contorno pasa a «Llamar al móvil · 685 34 31 49». En el estado final, «Llamar para cerrar la cita · 91 082 92 67» a ancho completo. Nombres accesibles y `href` fijados por @s12/@s18 |
| Tres «ventajas» con check | Plazo de confirmación, recordatorio, política de cancelación | NO: `docs/datos-galapavet.md` §9 (no publicados); `reserva_chat.feature` @s19 prohíbe «en menos de 2 horas», «Recordatorio», «sin coste» | La lista con marcas se rellena con los TRES tramos de horario reales (`datosNegocio.horario`, `site.ts:31-35`), exactamente los `li` que @s19 ya exige. La marca «✓» va en CSS (`::before`) para no tocar el `textContent` |
| Chips del primer paso | Servicios publicados | SÍ: `SERVICIOS` en `src/data/servicios.ts` (5 bloques) + «Es una urgencia» (`OPCION_URGENCIA`) | — |
| Chips del paso «cuándo» | Ventanas en que la clínica abre | SÍ (derivadas del horario, fijadas por @s4 como literales) | — |
| Teléfono de urgencias (rama urgencia) | Teléfono + rótulo | SÍ: `datosNegocio.telefonoUrgencias` («Urgencias fuera de horario», `site.ts:12-13,88`) | — |
| Cintillo, h2, párrafo | Copy de sección | Texto de proyecto (no es dato de negocio). Los del prototipo prometen plazo/canal | Se mantienen «Reserva de cita» / «Cuéntanos qué necesita tu mascota» / «Te guiamos paso a paso para preparar tu solicitud con los datos que necesita la clínica.» |
| Nota de demostración | Aviso de que nada se envía | SÍ, literal fijado por @s17 en el componente (`AVISO_DEMO`) | — |
| Fondo de banda `--bg-2` | Rol de color | SÍ: `--color-fondo-alterno` (`_tokens.scss`), clase `.seccionAlterna` de `Landing.module.scss` | Cambio en `Landing.tsx` (coordinado, reserva-2) |

Ningún dato nuevo hay que inventar; ningún dato pendiente bloquea la
maquetación.

---

## Conflictos con el contrato vigente

1. **`reserva_chat.feature` @s18 y @s12 (sin `wa.me`, sin «WhatsApp» en ningún
   nombre accesible de la sección) + `datos_negocio.feature` cabecera:37-40 +
   `project-spec.md` Decisión 14** frente al botón verde «WhatsApp» y al
   enlace «Enviar la solicitud por WhatsApp» del prototipo (`VLS:261,305`).
   → **Respetar.** La forma (un botón relleno + un contorno en fila; un
   botón relleno a ancho completo en el estado final) se replica con las
   llamadas verificadas. El día que el cliente resuelva las dos incógnitas,
   el `href` del botón relleno pasa a `telefonoMovil.enlaceMensajeria(resumen)`
   sin tocar la maquetación.
2. **`reserva_chat.feature` @s19** (exactamente 3 `listitem` con los tramos
   de horario y prohibición de «en menos de 2 horas», «Recordatorio», «sin
   coste») frente a `ventajasReserva` (`VLS:752-756`) y frente a la redacción
   de **`rediseno_visual.feature` @s34** («una lista de VENTAJAS con marcas de
   verificación»). → **Respetar @s19** (la lista es el horario) y **enmendar
   la redacción de @s34** a «una lista con marcas de verificación, cuyos
   ítems son los tramos de horario reales que fija reserva_chat @s19»: hoy la
   cláusula, leída literalmente, pediría inventar ventajas. Nota semántica:
   una marca «✓» junto a «Domingos: Cerrado» es aceptable (la lista afirma
   «esto es el horario verificado», no «esto es un beneficio»); si el humano
   lo prefiere, el tercer ítem puede llevar un círculo sin glifo, pero
   entonces hay que escribirlo en el contrato.
3. **`reserva_chat.feature` @s17** («no aparece el texto "en línea"») frente a
   la cabecera del prototipo (`VLS:278`). → **Respetar**: «Disponible» con el
   punto `--color-acento` y la tinta `--color-acento-tinta` del prototipo.
4. **`reserva_chat.feature` @s20** (cada mensaje empieza por «Asistente:» /
   «Tú:») frente a las burbujas del prototipo, que distinguen autor solo por
   color y lado. → **Respetar**: el prefijo se mantiene dentro del mismo `<p>`
   (puede envolverse en un `<span>` para pintarlo más pequeño; el
   `textContent` no cambia) y ADEMÁS se añade lado + color por autor mediante
   `data-autor="asistente|visitante"` (atributo de datos, patrón ya usado en
   `InformacionContacto.tsx` `data-tarjeta-de` y `Cabecera.tsx`
   `data-enlace-tienda`; Invariante 5: nunca una clase).
5. **`reserva_chat.feature` @s5/@s6/@s7** (botón con nombre accesible
   «Enviar respuesta» y `aria-disabled`) frente al botón redondo «→» del
   prototipo. → **Sin conflicto real**: el nombre accesible va en
   `aria-label="Enviar respuesta"` y el glifo «→» en un `span aria-hidden`.
   Todos los tests usan `getByRole('button', { name: 'Enviar respuesta' })`.
6. **`rediseno_visual.feature` @s24 y `tests/e2e/geometria-escalas.spec.ts:520-530`**
   (la tarjeta del chat es una de las «en reposo»: alfa .07, blur 18) frente a
   `box-shadow: var(--shadow)` (elevada) del prototipo (`VLS:273`).
   → **Respetar** (mantener `--sombra-reposo` y el hover neutralizado). La
   diferencia es sutil; si el humano quiere la elevada, hay que cambiar la
   lista del test e2e, no el contrato.
7. **`rediseno_visual.feature` @s11 (`src/lib/diseno/matrizDeContraste.ts`,
   21 pares, reconciliada contra el TEXTO REAL de cada `.module.scss`)**:
   toda declaración `color: var(--color-X)` que vaya dentro de un bloque con
   `background-color: var(--color-Y)` declarado ANTES en el mismo fichero
   debe ser un par de la matriz. → **Respetar sin ampliar la matriz**: las
   bandas de cabecera y pie se pintan con `--color-superficie` (no con
   `--color-superficie-elevada`, que en el prototipo difiere en 4 unidades de
   azul y no tiene pares con `tinta`/`texto-suave`/`acento-tinta`), las
   burbujas usan (`tinta`, `superficie`) y (`sobre-primario`, `primario`), el
   check (`acento-tinta`, `acento-suave`), la nota (`texto-suave`,
   `superficie`). Consecuencia: «Pedir otra cita» NO puede ser un enlace en
   `--color-primario` sobre superficie (par no validado) → `boton-fantasma`.
8. **`rediseno_visual.feature` @s15** (`--color-acento` solo como relleno) →
   Respetado: solo el punto de «Disponible».
9. **`project-spec.md` Decisión 24 / cabecera de `rediseno_visual.feature`
   («no copies estos valores»; manda la escala del repo)** → Desviaciones
   declaradas: radio tarjeta 22→24 (`$radio-grande`), colas 16/5→12/4
   (`$radio-medio`/`$radio-pequeno`), rellenos 15·18→16, 11·15→12·16,
   14·18·18→12·16·16, gaps 10·11→8·12, `min-height` 470→480 (5 × 96),
   avatar 40 = `$altura-control-pequena`, botón redondo 46→48
   (`$altura-control-media`), fuentes 14.5→16 (`paso 0`), 13.5/12/11.5→12.8
   (`paso -1`), 17→16, gap de columnas `clamp(28,4vw,52)`→`clamp(24px, 4vw, 48px)`.
10. **`sistema_de_diseno_visual.feature` @s33 (`src/lib/diseno/movimientoRespetuoso.ts`)**:
    toda `transition` nueva del módulo va dentro de
    `@media (prefers-reduced-motion: no-preference)`.
11. **`escalaEspaciado.test.ts` (9 pasos, a mano)**: el arreglo de reserva-1
    NO añade un paso 20 a la escala; cambia el mixin a `espaciado(24)`
    (prototipo 25/26 px → 24). Es un cambio de `src/styles/_api.scss` que
    afecta a todos los botones fantasma del sitio (los ARREGLA a todos).
12. **`tokens-aplicados.spec.ts` @s26** (8 bandas, ≥ 2 fondos, ninguna
    transparente, nunca 3 iguales seguidas) frente a reserva-2: invertir la
    alternancia completa en `Landing.tsx` la respeta; invertir SOLO esta
    sección rompería la regla de «3 seguidas» (equipo alterna → reservar
    alterna → galería alterna). → Decisión para el lead, fuera de este
    componente.

---

## Tests que romperán

### Unitarios (`src/**/*.test.ts(x)`)

Ninguno rompe si se sigue el plan al pie de la letra; los siguientes están
EN RIESGO y fijan condiciones de la implementación:

| Test | Por qué |
| --- | --- |
| `ReservaChat.test.tsx` › `@s25 los botones de "Respuestas rápidas" alcanzan la altura mínima…` | Lee el SCSS con `?raw` y busca el bloque cuya cabecera literal es `[aria-label='Respuestas rápidas'] button {` con `min-height: $altura-control-media;` dentro. ROMPE si el selector se anida (`[aria-label='Respuestas rápidas'] { button { … } }`) o se renombra. Mantener el bloque plano con esa cabecera exacta y añadir un bloque HERMANO `[aria-label='Respuestas rápidas'] {` para `display: flex; flex-wrap; gap`. |
| `ReservaChat.test.tsx` › `@s19 … exactamente los 3 tramos de horario` | `getAllByRole('listitem').map(textContent)` debe ser EXACTAMENTE los 3 textos. ROMPE si el «✓» se mete como nodo (`<span aria-hidden>✓</span>`). Ir por CSS `::before` (`content: '✓' / ''`). |
| `ReservaChat.test.tsx` › `@s20 … empieza por "Asistente:" o "Tú:"` y todos los `toHaveTextContent('Asistente: …')` de @s1/@s2/@s4/@s5/@s6/@s7/@s8/@s10/@s11/@s13/@s14/@s16 | ROMPEN si el prefijo sale del `<p>` o se oculta. Mantener `Asistente: `/`Tú: ` como texto del mismo `<p>` (un `<span>` interior es válido: no cambia `textContent`). |
| `ReservaChat.test.tsx` › `@s1`, `@s13`, `@s16` (`getAllByRole('button')` → exactamente 6) | ROMPEN si en el paso «servicio» se renderiza cualquier botón extra (p. ej. un botón de enviar permanente). Solo los 6 chips. |
| `ReservaChat.test.tsx` › `@s34` (`getByText('G', { selector: '[aria-hidden="true"]' })`, `getByText('Galapavet')`, `getByText('Disponible')`, sin «en línea») | ROMPE si el avatar deja de ser exactamente «G» (`inicialesDe('Galapavet')` = «G», correcto) o si «Galapavet» se fusiona en un elemento con más texto (p. ej. «Galapavet · Disponible»). Mantener tres elementos con texto exacto. |
| `ReservaChat.test.tsx` › `@s18` (`getAllByRole('link')` sin `wa.me`, sin `mailto`, sin «WhatsApp» en nombre) | ROMPE si se añade el enlace de mensajería. No se añade. |
| `ReservaChat.test.tsx` › `@s12`/`@s13`/`@s16` (`within(widget).queryAllByRole('link')` = 0 tras reiniciar) | ROMPEN si se añade un enlace permanente dentro del `fieldset` del chat. No se añade. |
| `src/lib/diseno/matrizDeContraste.test.ts` › `@s11 la matriz se reconcilia con el TEXTO REAL…` | ROMPE ante cualquier par (tinta, fondo) nuevo en `ReservaChat.module.scss` (ver §5.7) o si `color:` se escribe ANTES que `background-color:` dentro del mismo bloque (el escáner es secuencial por líneas). |
| `src/lib/diseno/matrizDeContraste.test.ts` › `expect(MATRIZ_DE_USO_DEL_SISTEMA).toHaveLength(21)` | ROMPE si se amplía la matriz sin actualizar el literal. No ampliar. |
| `src/lib/puertaLiteralesColor.test.ts` | ROMPE ante `#hex`, `rgb()`, `hsl()` o nombres de color en el `.module.scss`. `transparent` está permitido. |
| `src/lib/diseno/usoDelAcento.test.ts` (@s15) | ROMPE si `--color-acento` va como `color:` o en un borde. Solo `background-color` del punto. |
| `src/styles/movimiento-global.test.ts` / `movimientoRespetuoso.test.ts` (@s33 sistema) | ROMPE si una `transition` queda fuera del `@media (prefers-reduced-motion: no-preference)`. |
| `src/lib/diseno/escalaEspaciado.test.ts` (@s19/@s20 sistema) | ROMPE si se añade `20: 20px` a `$escala-espaciado` / `ESCALA_DE_ESPACIADO_PX`. Arreglar el mixin, no la escala. |
| `src/lib/diseno/inventarioModulos.test.ts` (@s51 identidad) | ROMPE si se crea un componente nuevo con `.module.scss` propio (p. ej. `BurbujaMensaje.tsx`). No crear componentes: todo dentro de `ReservaChat`. |
| `src/lib/diseno/datosDelSitio.test.ts` | ROMPE si un comentario de `src/` escribe el nombre, la localidad, un teléfono o el correo de la clínica ficticia. Citar `VLS:<línea>`. |
| `src/pages/Landing.test.tsx` › `@s4` | ROMPE si el componente declara `id="reservar"`. No lo declara. |
| `src/lib/puertaTelefonoHardcodeado.test.ts` | ROMPE si algún teléfono se escribe a mano en el `.tsx`. Todo sale de `datosNegocio`. |

### E2E (`tests/e2e/*.spec.ts`, contra `dist/`)

| Test | Por qué |
| --- | --- |
| `geometria-escalas.spec.ts` › `@s24 … reposo y elevada son dos sombras distintas…` | Mide `box-shadow` de `fieldset[aria-label="Asistente de reserva de Galapavet"]` y exige alfa .07 / blur 18. ROMPE si se pone `--sombra-elevada` (prototipo). Mantener reposo + `&:hover { box-shadow: var(--sombra-reposo) }`. |
| `geometria-escalas.spec.ts` › `@s25 … ningún botón ni campo de texto del chat de reserva mide menos de 44px` | Mide los 6 chips, el `textbox` «Tu respuesta» y el botón «Enviar respuesta» tras pulsar el primer servicio. ROMPE si el botón redondo mide 46 (prototipo) en vez de ≥ 44… no rompe, pero se fija en 48 (`$altura-control-media`) por coherencia; ROMPE si el campo píldora pierde `min-height`. |
| `tipografia.spec.ts` › `@s21 … del chat de reserva usa "DM Sans" u "Outfit"` | Recorre `input, textarea, select, button` bajo `#reservar`. No rompe (heredan `font: inherit` de `global.scss:96-102`); el avatar en Outfit no es un control. |
| `css-presupuesto.spec.ts` › `@s49 … <= 8000 B` | **RIESGO REAL.** `encodedBodySize` de la hoja de la portada servida por `vite preview`. Medido hoy: `dist/assets/index-*.css` = 60 706 B sin comprimir / ≈ 7 523 B gzip (margen ≈ 6 %). Este rediseño añade ≈ 1.2-1.8 KB de SCSS (≈ 250-400 B gzip). Puede superar el techo. Mitigación en §7 paso 9. |
| `accesibilidad.spec.ts` (axe, 5 variantes, `wcag22aa`) | ROMPE si el botón redondo queda sin nombre (poner `aria-label`), si el `::before` del check lleva texto sin alternativa (`content: '✓' / ''`), o si algún control baja de 24 px. Los pares de color nuevos vienen todos de la matriz validada. |
| `layout.spec.ts` / `fidelidad.spec.ts` › `@s44` (320 px sin desbordamiento) | ROMPE si la fila `input + botón` no lleva `min-width: 0` en el `input`, si la fila de acciones no lleva `flex-wrap: wrap`, o si un `fieldset` conserva el `min-inline-size: min-content` por defecto del agente de usuario con chips largos. Añadir `min-inline-size: 0` a los `fieldset`. |
| `tokens-aplicados.spec.ts` › `@s26` | ROMPE solo si se invierte el fondo de ESTA sección sin invertir el resto (3 alternas seguidas). Coordinar reserva-2 en `Landing.tsx` para toda la portada o no tocarlo. |
| `datos-reales.spec.ts` › `@s49`/`@s52` | ROMPEN si el `dist/` contiene literales de la clínica ficticia o «24 h»/«todos los días». El plan no añade texto visible nuevo. |
| `despliegue-subpath.spec.ts` (ancla `reservar`) | No rompe: el `id` sigue en `Landing.tsx`. |
| `red-limpia.spec.ts` (@s46) | No rompe: sin recursos externos (el «✓» y el «→» son glifos de la fuente/sistema; nada de iconos remotos). |

---

## Plan de cambio

Orden pensado para que cada paso deje la suite en verde y el diff sea
auditable. Ficheros tocables: `src/styles/_api.scss` (paso 1),
`src/components/ReservaChat-logica.ts` + `.test.ts` (paso 2),
`src/components/ReservaChat.tsx` (pasos 3-6), `src/components/ReservaChat.module.scss`
(pasos 3-8), `src/components/ReservaChat.test.tsx` (tests nuevos), un spec e2e
nuevo `tests/e2e/fidelidad-reserva.spec.ts` (paso 10). `Landing.tsx` solo si el
lead aprueba reserva-2 para toda la portada.

1. **Arreglar la causa raíz de reserva-1 en `src/styles/_api.scss:254`:**
   `padding-inline: espaciado(20)` → `padding-inline: espaciado(24)` dentro de
   `@mixin boton-fantasma`. (Prototipo: 25 px en `VLS:262`; el paso más
   cercano de la escala es 24, el mismo que ya usa `boton-primario`.)
   - **Test nuevo (unitario, ROJO primero):** en `src/styles/tokens-api.test.ts`
     (o fichero hermano `src/styles/api-espaciado.test.ts`) un `describe` que
     lea `_api.scss` con `?raw` (patrón `cuerpoDelBloque` de
     `ReservaChat.test.tsx:490-504`) y afirme que el cuerpo de
     `@mixin boton-fantasma {` contiene `padding-inline: espaciado(24);` y NO
     contiene `espaciado(20)`.
   - **Guarda pura opcional (recomendada, decisión del lead):** en
     `src/lib/diseno/escalaEspaciado.ts` añadir
     `pasosDeEspaciadoNoDeclarados(textoScss: string): readonly { linea: number; paso: number }[]`
     que extraiga cada `espaciado(N)` y devuelva los N ausentes de
     `ESCALA_DE_ESPACIADO_PX`; test con literal a mano (`espaciado(20)` →
     señalado; `espaciado(24)` → limpio; texto vacío → lista vacía) y un test
     de reconciliación sobre `import.meta.glob('/src/**/*.scss', { query: '?raw' })`.
     AVISO: ese test de reconciliación saldrá en ROJO por las 10 declaraciones
     de `Equipo`, `InformacionContacto`, `Servicios` y `PaginaBlog` listadas en
     §2 (todas se descartan hoy en el CSS compilado): o se corrigen en el mismo
     lote de «capa base» o la guarda se pospone a la sección que las posea.
   - Verificación e2e (paso 10): `getComputedStyle(a).paddingInlineStart === '24px'`
     en los dos enlaces de la columna de texto.

2. **Lógica pura (`ReservaChat-logica.ts`)** — mordible por Stryker:
   - `export type AutorDeMensaje = 'asistente' | 'visitante'`.
   - `export function rotularMensaje(autor: AutorDeMensaje, texto: string): string`
     → `Asistente: ${texto}` / `Tú: ${texto}` (sustituye a `mensajeAsistente`/
     `mensajeVisitante` del `.tsx`, que hoy son lógica sin morder).
   - Opcional: `export const AUTOR_ASISTENTE: AutorDeMensaje = 'asistente'` /
     `AUTOR_VISITANTE` para que el `.tsx` no escriba literales.
   - **Tests nuevos en `ReservaChat-logica.test.ts`** (`describe('@s20 …')`):
     `rotularMensaje('asistente', 'Hola')` es exactamente `'Asistente: Hola'`;
     `rotularMensaje('visitante', 'Nala y Ana Martín')` es exactamente
     `'Tú: Nala y Ana Martín'`; ambos empiezan por el prefijo con dos puntos y
     un espacio (mata mutantes de literal y de plantilla).

3. **DOM del `.tsx` — columna de texto (reserva-3/4/5/24):**
   - Envolver los dos `EnlaceLlamada` en `<div className={styles.acciones}>`;
     el primero recibe `className={styles.primario}` (o se selecciona con
     `a:first-child`). Textos y `href` intactos (@s18).
   - `ul` → `className={styles.horario}`; los `li` sin cambios (@s19).
   - Avatar: `{inicialesDe(datosNegocio.identidad.nombreComercial)}`
     importando `inicialesDe` de `./Equipo-logica`.
   - **Test nuevo (`ReservaChat.test.tsx`, `describe('@fid-reserva-3 …')`):**
     los dos enlaces de llamada comparten un mismo elemento padre que NO es el
     padre del `h2` (`enlace1.parentElement === enlace2.parentElement` y
     `!== h2.parentElement`); el primero es «Llamar a la clínica · 91 082 92 67».

4. **DOM del `.tsx` — cabecera del chat (reserva-11/12):** reordenar a
   `<strong>Galapavet</strong>` (desde `datosNegocio.identidad.nombreComercial`),
   `<p className={styles.disponibilidad}>` (punto + «Disponible»),
   `<p>Asistente de reserva</p>`. Mismo `fieldset aria-label="Cabecera del chat"`
   y mismo `span aria-hidden` del avatar (@s34).
   - **Test nuevo:** dentro de la cabecera, el primer elemento de texto es el
     nombre comercial y «Disponible» va antes que «Asistente de reserva»
     (comparar `compareDocumentPosition`).

5. **DOM del `.tsx` — historial (reserva-13):** `interface Mensaje { id; texto;
   autor: AutorDeMensaje }`; `agregarMensajes` recibe `{ autor, texto }[]`;
   render `<p key data-autor={mensaje.autor}>{mensaje.texto}</p>` (el texto ya
   rotulado con `rotularMensaje`). Sin `<span>` salvo que se quiera reducir el
   prefijo: si se usa, `<p data-autor><span>Asistente:</span> …</p>` con el
   `textContent` idéntico.
   - **Test nuevo (`describe('@fid-reserva-13 …')`):** tras pulsar «Medicina
     general», `historial.children[0]` y `[2]` tienen `data-autor="asistente"`
     y `[1]` tiene `data-autor="visitante"`; los tres textos siguen empezando
     por «Asistente:»/«Tú:» (doble anclaje con @s20).

6. **DOM del `.tsx` — pie del widget (reserva-10/15/16/17/18/19):**
   - Envolver TODO lo que va después del `role="log"` (respuestas rápidas,
     fila de texto, resumen + enlaces + botones, nota) en
     `<div className={styles.pie}>`.
   - Paso animal/nombre: `<div className={styles.filaDeTexto}><input …/>
     <button type="button" aria-label="Enviar respuesta" aria-disabled=…
     onClick=…><span aria-hidden="true">→</span></button></div>`.
   - Estado final: `EnlaceLlamada` con `className={styles.primario}`; el
     botón «Pedir otra cita» con `className={styles.secundario}`.
   - Estado urgencia: primer enlace `styles.primario`, segundo y «Empezar de
     nuevo» `styles.secundario`.
   - Nota: `<p className={styles.aviso}>`.
   - **Tests nuevos:** (a) en el paso animal, el botón «Enviar respuesta» tiene
     `aria-label="Enviar respuesta"` y contiene un hijo `aria-hidden="true"`
     cuyo texto es «→», y su `parentElement` es el mismo que el del `textbox`;
     (b) la nota de demostración y el grupo «Respuestas rápidas» comparten
     padre, y ese padre es distinto del padre del `role="log"`.

7. **SCSS (`ReservaChat.module.scss`) — reescritura completa.** Reglas duras:
   tokens solo; `background-color` ANTES que `color` en cada bloque; ninguna
   `transition` fuera de `@media (prefers-reduced-motion: no-preference)`;
   conservar el bloque literal `[aria-label='Respuestas rápidas'] button {`
   con `min-height: $altura-control-media;`. Esqueleto (valores ya en la
   escala del repo; desviaciones del prototipo en §5.9):

   ```scss
   .reservaChat {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
     gap: clamp(#{espaciado(24)}, 4vw, #{espaciado(48)});   // VLS:255 clamp(28px,4vw,52px)
     align-items: center;                                     // VLS:255

     fieldset { border: none; padding: 0; margin: 0; min-inline-size: 0; }
   }

   .texto {                              // antes `> div:first-child`
     .eyebrow { @include eyebrow; margin: 0; }
     h2 { margin: 0; font-family: var(--fuente-titulares); font-size: paso-tipografico(4); }
     > p:not(.eyebrow) { max-width: 52ch; margin: espaciado(16) 0 0; line-height: 1.7; color: var(--color-texto-suave); }  // VLS:259
   }

   .acciones {                           // VLS:260
     display: flex; flex-wrap: wrap; gap: espaciado(12); margin-block-start: espaciado(24);
     a { @include boton-fantasma; min-height: $altura-control-media; }             // VLS:262 (48px)
     a.primario, a:first-child { @include boton-primario; min-height: $altura-control-media; }  // VLS:261 (48px)
   }

   .horario {                            // VLS:264-270
     list-style: none; margin: espaciado(24) 0 0; padding: 0;
     display: flex; flex-direction: column; gap: espaciado(12);
     li { display: flex; align-items: flex-start; gap: espaciado(8); color: var(--color-texto); }
     li::before {
       content: '✓' / '';                // decorativo: no entra en textContent (@s19) ni en el árbol accesible
       flex-shrink: 0; width: $altura-control-pequena / 2; aspect-ratio: 1;   // 20px, VLS:267
       display: grid; place-items: center; margin-block-start: 1px;
       border-radius: $radio-circulo;
       background-color: var(--color-acento-suave);
       color: var(--color-acento-tinta);
       font-size: paso-tipografico(-1); font-weight: 700;
     }
   }

   .panel {                              // el fieldset del chat, VLS:273
     @include tarjeta;                   // superficie, borde, radio 24, sombra reposo, overflow hidden, columna
     min-height: 480px;                  // VLS:273 470px → 5 × espaciado(96)
     &:hover { box-shadow: var(--sombra-reposo); }   // e2e @s24
   }

   .cabeceraChat {                       // VLS:274
     display: flex; align-items: center; gap: espaciado(12);
     padding: espaciado(16);
     border-block-end: $ancho-borde-fino solid var(--color-borde);
     background-color: var(--color-superficie);        // VLS:274 --surface (ver §5.7)
     > span {                            // avatar, VLS:275
       display: grid; place-items: center; flex-shrink: 0;
       width: $altura-control-pequena; aspect-ratio: 1; border-radius: $radio-circulo;
       background-color: var(--color-primario);
       color: var(--color-sobre-primario);
       font-family: var(--fuente-titulares); font-weight: 700; letter-spacing: 0.04em;
     }
     strong { display: block; color: var(--color-tinta); }
     p { display: block; margin: 0; font-size: paso-tipografico(-1); color: var(--color-texto-suave); }
     .disponibilidad { display: flex; align-items: center; gap: espaciado(4); color: var(--color-acento-tinta); }
     .puntoDisponible { flex-shrink: 0; width: espaciado(8); height: espaciado(8); border-radius: $radio-circulo; background-color: var(--color-acento); }
   }

   [role='log'] {                        // VLS:282
     flex: 1; display: flex; flex-direction: column; gap: espaciado(8);
     padding: espaciado(16); max-height: 320px; overflow-y: auto;
     background-color: var(--color-fondo);
     p {                                 // VLS:757-765
       max-width: 84%; margin: 0; padding: espaciado(12) espaciado(16);
       align-self: flex-start;
       border: $ancho-borde-fino solid var(--color-borde);
       border-radius: $radio-medio $radio-medio $radio-medio $radio-pequeno;
       background-color: var(--color-superficie);
       color: var(--color-tinta);
       &[data-autor='visitante'] {
         align-self: flex-end;
         border-color: transparent;
         border-radius: $radio-medio $radio-medio $radio-pequeno $radio-medio;
         background-color: var(--color-primario);
         color: var(--color-sobre-primario);
       }
     }
   }

   .pie {                                // VLS:288
     display: flex; flex-direction: column; gap: espaciado(8);
     padding: espaciado(12) espaciado(16) espaciado(16);
     border-block-start: $ancho-borde-fino solid var(--color-borde);
     background-color: var(--color-superficie);
   }

   [aria-label='Respuestas rápidas'] { display: flex; flex-wrap: wrap; gap: espaciado(8); }   // VLS:290
   [aria-label='Respuestas rápidas'] button {          // ← cabecera LITERAL exigida por @s25 (test ?raw)
     @include pildora-filtro;
     min-height: $altura-control-media;
     @media (prefers-reduced-motion: no-preference) { transition: border-color 150ms ease-out, background-color 150ms ease-out; }
     &:hover { border-color: var(--color-primario); background-color: var(--color-acento-suave); }   // VLS:292
   }

   .filaDeTexto {                        // VLS:298
     display: flex; gap: espaciado(8);
     input {
       @include foco-visible; flex: 1; min-width: 0; min-height: $altura-control-media;
       padding-inline: espaciado(16); border: $ancho-borde-control solid var(--color-borde-control);
       border-radius: $radio-completo; background-color: var(--color-superficie-elevada); color: inherit;
     }
     button {                            // VLS:300: 46×46 → 48×48
       @include foco-visible; flex-shrink: 0; width: $altura-control-media; height: $altura-control-media;
       padding: 0; border: none; border-radius: $radio-circulo;
       background-color: var(--color-primario); color: var(--color-sobre-primario);
       font-size: paso-tipografico(1); cursor: pointer;
       &[aria-disabled='true'] { cursor: not-allowed; }
     }
   }

   .primario { @include boton-primario; width: 100%; min-height: $altura-control-media; }   // VLS:305 (48px, ancho completo)
   .secundario { @include boton-fantasma; width: 100%; }                                      // VLS:306 (ver §5.7)
   [aria-label='Resumen de tu solicitud'] ul { list-style: none; margin: 0; padding: espaciado(12) espaciado(16); border-radius: $radio-medio; background-color: var(--color-fondo); }
   .aviso { margin: 0; font-size: paso-tipografico(-1); line-height: 1.5; color: var(--color-texto-suave); }   // VLS:312
   ```

   Notas: `.acciones a.primario` con dos `@include` en el mismo fichero
   duplica ~350 B; si el presupuesto de CSS (paso 9) aprieta, agrupar
   `.acciones a:first-child, .primario { @include boton-primario }` y
   `.acciones a:not(:first-child), .secundario { @include boton-fantasma }`.
   El `width: $altura-control-pequena / 2` debe escribirse con
   `math.div($altura-control-pequena, 2)` (Sass moderno): 20 px.

   - **Tests nuevos `?raw` (mismo patrón que @s25):** (a) el bloque
     `li::before {` contiene `content: '✓' / '';` (la alternativa vacía es
     lo que lo mantiene fuera del árbol accesible); (b) el bloque
     `[data-autor='visitante']` contiene `align-self: flex-end;` y
     `background-color: var(--color-primario);`; (c) el bloque `.panel {`
     contiene `min-height:` y `box-shadow: var(--sombra-reposo)` en su hover;
     (d) el bloque `.cabeceraChat > span {` contiene
     `background-color: var(--color-primario);`.

8. **Fondo de banda (reserva-2)** — SOLO si el lead lo aprueba para toda la
   portada: en `Landing.tsx` intercambiar `styles.seccion` ↔
   `styles.seccionAlterna` en las 7 anclas (servicios → seccion, equipo →
   seccion, reservar → seccionAlterna, galeria → seccion, contacto →
   seccionAlterna, faq → seccion; `#inicio` va sobre fotografía; campañas
   pinta su propio fondo y debe pasar a alterno para conservar «nunca 3
   iguales»). Test: `tokens-aplicados.spec.ts` @s26 ya lo vigila; añadir en
   `Landing.test.tsx` un test que lea la clase del wrapper de `#reservar`… NO
   (prohibido aseverar sobre clases): verificar en e2e que
   `getComputedStyle(#reservar).backgroundColor` es el hex de
   `--color-fondo-alterno` de la variante activa.

9. **Presupuesto de CSS (`css-presupuesto.spec.ts`, techo 8 000 B):** medir
   ANTES (`pnpm run build`, servir con `vite preview`, leer
   `encodedBodySize`) y DESPUÉS. Si supera: (a) fusionar los `@include`
   duplicados como se indica en el paso 7; (b) retirar de este módulo las
   reglas que el wrapper ya cubre; (c) como último recurso, proponer al
   humano subir el techo con la medición en la mano (el spec dice que es un
   trinquete «escrito a mano», nunca se recalcula solo).

10. **E2E nuevo `tests/e2e/fidelidad-reserva.spec.ts`** (navegador real sobre
    `dist/`, 1280×900, portada), cubre `rediseno_visual.feature` @s34 —hoy sin
    test de navegador— y reserva-1/3/6/9/10/13/15:
    - dos columnas: `boundingBox` de la columna de texto y del `fieldset`
      del chat con `x` distintos y `y` solapadas; a 320 px, apilados;
    - las dos píldoras de la columna de texto: `paddingInlineStart === '24px'`
      y ancho de caja ≥ ancho del texto + 48;
    - `fieldset[aria-label="Asistente de reserva de Galapavet"]`:
      `borderRadius === '24px'`, `boxShadow` con blur 18 (reutilizar
      `analizarSombra` de `geometria-escalas`), `boundingBox().height >= 480`;
    - avatar: `width === height === 40`, `borderRadius === '50%'`,
      `backgroundColor` = hex de `--color-primario` de la variante activa;
    - tras pulsar el primer servicio: el `p` del visitante tiene
      `alignSelf === 'flex-end'` y su `backgroundColor` es el primario; el del
      asistente `flex-start`;
    - el botón «Enviar respuesta»: caja 48×48, `borderRadius === '50%'`, en
      la misma fila (misma `y`) que el `textbox`;
    - la nota de demostración sigue visible en los tres estados (@s34
      cláusula 4, ya cubierta en unitario por @s17; aquí basta el inicial).

11. **Cierre:** `bin\harness.ps1 test`, `pnpm exec oxlint --deny-warnings src
    tests/e2e`, `tsc -b`, `pnpm run build`, `pnpm exec playwright test
    --workers=1 --reporter=list`, `bin\harness.ps1 mutate` (Stryker sobre
    `ReservaChat-logica.ts` y, si se añadió, `escalaEspaciado.ts`, al 100 %).
    Informe en `progress/tdd_fidelidad_reserva.md`.

### Riesgos y notas para el lead

- **Bug transversal (reserva-1):** `espaciado(20)` no existe y Sass lo
  descarta en silencio. Además del mixin `boton-fantasma`, hay 10 usos en
  `Equipo`, `InformacionContacto`, `Servicios` y `PaginaBlog` que hoy pintan
  `margin: 0`/sin `padding` (verificado en `dist`: `._avatar_… {margin:0}` y
  `[data-tarjeta-de=urgencia]` sin `padding`). Conviene un lote de «capa base»
  con `@error` en `espaciado()` para pasos desconocidos (o la guarda pura del
  paso 1) ANTES de las features de sección, para que ninguna las herede.
- **Presupuesto de CSS al 94 %** (≈ 7 523 B gzip de 8 000): cualquier sección
  que añada SCSS puede romper `css-presupuesto.spec.ts`; medir en cada lote.
- **Alternancia de fondos invertida** respecto al prototipo en TODA la portada
  (reserva-2): decisión única en `Landing.tsx`, no por sección.
- **Botón redondo «→» sin texto visible:** cumple los tests y axe
  (`aria-label`), pero pierde la etiqueta visible «Enviar respuesta». Si el
  humano prefiere texto visible, mantener el botón como píldora
  `boton-primario` de 48 px en la misma fila que el campo: mismo DOM, otra
  regla SCSS; los tests del plan no cambian.
- **Marca «✓» junto a «Domingos: Cerrado»:** semánticamente discutible; ver
  §5.2.
