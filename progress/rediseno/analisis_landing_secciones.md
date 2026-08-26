# Anatomía por sección del landing de diseño — "Veterinaria La Sierra"

Fuentes leídas (rutas absolutas):

- `C:/Users/User/Desktop/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/docs/diseno-claude-design/Veterinaria La Sierra.dc.html` (830 líneas, leído íntegro, incluido el `<script type="text/x-dc">` de las líneas 505–828).
- `C:/Users/User/Desktop/CenitDigitalProyectosCodigo/GalapavetClinicaVeterinaria/docs/diseno-claude-design/support.js` (runtime de Claude Design; leído lo necesario para `sc-if`, `sc-for`, `style-hover`, `ref` y el ciclo de estado).

Convención de citas: `fichero:linea`. Cuando el fichero es el `.dc.html` del landing lo abrevio como **`landing:NNN`**; `support.js` se cita con su nombre completo.

Regla aplicada en todo el documento: **el `hint-placeholder-count` NO es el conteo real**. En `support.js:611-644` (`walkFor`) el `hintN` sólo se usa cuando `ctx.__streamingNow` es verdadero, es decir, mientras el editor pinta el esqueleto; en render normal se itera el array real (`support.js:634` → `list.map((item, i) => ...)`). Lo mismo con `sc-if`: `support.js:645-659` (`walkIf`) usa `hint-placeholder-val` **sólo** si el valor real es `undefined` **y** hay streaming.

---

## 0. Armazón global (fuera de secciones)

### 0.1 Documento y `<helmet>`

- `landing:1-8`: `<!DOCTYPE html>` + `<head>` con `<meta charset="utf-8">` (`landing:4`), viewport (`landing:5`) y `<script src="./support.js"></script>` (`landing:6`).
- `landing:10-62`: bloque `<helmet>` (el runtime lo reescribe a `<sc-helmet>`, `support.js:377-378`), que aporta:
  - `<title>Veterinaria La Sierra — Clínica veterinaria en Miraflores de la Sierra</title>` (`landing:12`).
  - Preconnect a `fonts.googleapis.com` (`landing:13`) y a `fonts.gstatic.com` con `crossorigin="anonymous"` (`landing:14`).
  - Hoja de Google Fonts con **dos familias**: `Outfit` pesos 400;500;600;700 y `DM Sans` `opsz,wght@9..40,400;9..40,500;9..40,700`, con `display=swap` (`landing:15`).
- **NO CONSTA EN LA FUENTE** ninguna `<meta name="description">`, ningún `og:*`, ningún `canonical` ni ningún JSON-LD en este fichero.

### 0.2 Tokens de paleta (4 temas)

`landing:17` declara el propósito: "Tokens de paleta. 4 propuestas; se conmutan con `[data-tema]` en el elemento raíz."

| Token | `:root` (clinica) `landing:18-25` | `[data-tema='calida']` `landing:26-33` | `[data-tema='tech']` `landing:34-41` | `[data-tema='eco']` `landing:42-49` |
|---|---|---|---|---|
| `--bg` | `#F8FAFC` | `#FFFBF2` | `#0F172A` | `#FFFFFF` |
| `--bg-2` | `#EDF2F9` | `#FEF3C7` | `#152242` | `#EFFDF7` |
| `--card` | `#FFFFFF` | `#FFFDF8` | `#16233F` | `#FFFFFF` |
| `--surface` | `#FBFDFF` | `#FFFDF6` | `#111C34` | `#F7FEFB` |
| `--border` | `rgba(15,32,60,.13)` | `rgba(120,53,15,.16)` | `rgba(148,197,255,.18)` | `rgba(4,120,87,.16)` |
| `--ink` | `#0B1B33` | `#3B2A12` | `#F1F5F9` | `#06301F` |
| `--text` | `#3C4C66` | `#5C4626` | `#C6D2E2` | `#35544A` |
| `--muted` | `#5E6E88` | `#8A6C45` | `#94A3B8` | `#557368` |
| `--primary` | `#1E40AF` | `#B45309` | `#06B6D4` | `#047857` |
| `--primary-strong` | `#1B3796` | `#92400E` | `#0891B2` | `#036049` |
| `--on-primary` | `#FFFFFF` | `#FFFFFF` | `#04212B` | `#FFFFFF` |
| `--accent` | `#10B981` | `#4D7C0F` | `#22D3EE` | `#0EA97B` |
| `--accent-ink` | `#047857` | `#3F6212` | `#67E8F9` | `#065F46` |
| `--accent-soft` | `#E7F8F1` | `#F1F7E3` | `rgba(6,182,212,.14)` | `#D6FBEA` |
| `--urg` | `#DC2626` | `#C2410C` | `#F87171` | `#DC2626` |
| `--urg-soft` | `#FEE9E9` | `#FDEBE0` | `rgba(248,113,113,.16)` | `#FDE9E9` |
| `--shadow` | `0 18px 45px rgba(15,32,60,.10)` | `0 18px 45px rgba(120,53,15,.12)` | `0 22px 55px rgba(0,0,0,.45)` | `0 18px 45px rgba(4,120,87,.12)` |
| `--shadow-sm` | `0 6px 18px rgba(15,32,60,.07)` | `0 6px 18px rgba(120,53,15,.08)` | `0 8px 22px rgba(0,0,0,.35)` | `0 6px 18px rgba(4,120,87,.08)` |

Detalle importante: **no existe selector `:root[data-tema='clinica']`**. La paleta "clinica" ES el `:root` base (`landing:18`). Sin embargo `aplicarTema` sí escribe `data-tema="clinica"` en el `<html>` (`landing:645-646`), atributo que no casa con ninguna regla y por tanto cae al `:root`.

### 0.3 Reset y utilidades

- `*{box-sizing:border-box}` (`landing:50`).
- `html{scroll-behavior:smooth;scroll-padding-top:88px}` (`landing:51`) — los 88 px compensan la cabecera pegajosa.
- `body{margin:0;background:var(--bg);color:var(--text);font-family:'DM Sans',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}` (`landing:52`).
- `img{max-width:100%}` (`landing:53`), `p{text-wrap:pretty}` (`landing:54`).
- `a{color:var(--primary);text-decoration:none;transition:color .3s ease}` (`landing:55`) y `a:hover{color:var(--accent-ink)}` (`landing:56`).
- `input,select,textarea,button{font:inherit}` (`landing:57`).
- `summary::-webkit-details-marker{display:none}` (`landing:58`).
- **Animación única del sistema**: `@keyframes vlsPulso{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.78)}}` (`landing:59`). Es el "punto pulsante" que aparece 4 veces en la página.
- `@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation-duration:.01ms !important;transition-duration:.01ms !important}}` (`landing:60`).

### 0.4 Contenedor raíz

`landing:64`: `<div style="background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden">` — envuelve TODA la página, incluidos el pie y el selector flotante; cierra en `landing:502`.

### 0.5 Props del editor (`data-props`, `landing:505`)

Decodificando el atributo `data-props` de `landing:505`:

- `$preview`: `{ width: 1280 }`.
- `tema`: editor `enum`, opciones `["clinica","calida","tech","eco"]`, default `"clinica"`, sección "Apariencia".
- `mostrarSelectorPaleta`: `boolean`, default `true`, sección "Apariencia".
- `mostrarBarraUrgencias`: `boolean`, default `true`, sección "Contenido".
- `telefonoUrgencias`: `text`, default `"640 22 11 90"`, sección "Contenido".

### 0.6 Estado del componente (`landing:616-624`)

```
state = {
  menuAbierto: false, selectorAbierto: false, tema: 'clinica',
  serviciosAbiertos: {}, equipoAbierto: {},
  paso: 0, mensajes: [{ bot: true, texto: FLUJO[0].bot }], respuestas: {}, borrador: '', chatHecho: false,
  contactoEnviado: false, ancho: 1280,
}
```

Ciclo de vida:

- `componentDidMount` (`landing:626-634`): lee `localStorage.getItem('vls-tema')` dentro de `try/catch`; aplica `guardado || this.props.tema || 'clinica'`; llama a `medir()` y registra `window.addEventListener('resize', this._onResize)`.
- `componentWillUnmount` (`landing:636-638`): quita el listener de resize.
- `medir()` (`landing:640`): `this.setState({ ancho: window.innerWidth })`.
- `aplicarTema(id)` (`landing:642-646`): `document.documentElement.setAttribute('data-tema', id)`, persiste en `localStorage['vls-tema']` con `try/catch` para navegación privada, y guarda `tema` en el estado.
- `alternarClave(campo, clave)` (`landing:648-650`): invierte un booleano dentro de un mapa (`serviciosAbiertos` / `equipoAbierto`) de forma inmutable.
- `panel(abierto)` (`landing:652-655`): devuelve `{ overflow:'hidden', maxHeight: abierto ? '620px' : '0px', opacity: abierto ? 1 : 0, transition:'max-height .3s ease, opacity .3s ease' }`. **Es el mecanismo de acordeón de Servicios y Equipo**.
- `esMovil = s.ancho < 1120` (`landing:685`): el breakpoint es **JavaScript**, no una media query.

Cómo funcionan las directivas (leído en `support.js`):

- `style-hover="..."` NO es un atributo del DOM: `support.js:428-431` lo detecta por el prefijo `style-`, llama a `host.pseudoClass('hover', valor)` y `support.js:1567-1589` (`createPseudoSheet`) inyecta una clase real `.scpN:hover{...}` con las declaraciones pasadas por `importantify(css)` (`support.js:1583`). Es decir, **los hovers ganan a cualquier estilo inline**.
- `ref="{{ pistaGaleria }}"` se pasa tal cual como prop `ref` de React (`support.js:415-443` no lo filtra), y la función `pistaGaleria` guarda el nodo en `this.pista` (`landing:779`).
- `onClick="{{ ... }}"` se mapea a `onClick` de React vía `EVENT_MAP` (`support.js:317-318`).

---

## 1. Barra de urgencias

**Envoltura condicional**: `<sc-if value="{{ barraUrgencias }}" hint-placeholder-val="{{ true }}">` (`landing:66`), cierre en `landing:75`.
El valor real es `barraUrgencias: this.props.mostrarBarraUrgencias ?? true` (`landing:692`), y la prop tiene default `true` (`landing:505`). Hint `true` / real `true`: **coinciden**.

### DOM exacto

```
div (landing:67)
├── span "Urgencias 24 h" (landing:68-71)
│   └── span punto pulsante (landing:69)
├── span "Atención inmediata todos los días del año ·" (landing:72)
└── a href="tel:+34640221190" → {{ telUrgencias }} (landing:73)
```

- No hay `role`, ni `aria-live`, ni landmark. **NO CONSTA EN LA FUENTE** ningún atributo `aria-*` en toda la barra.
- No es `position:sticky`: se desplaza con el scroll (el `position:sticky` sólo está en el `<header>`, `landing:77`).

### Estilos literales

- Contenedor (`landing:67`): `background:var(--urg);color:#fff;font-size:13.5px;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 14px;padding:9px 18px;text-align:center`.
- Etiqueta "Urgencias 24 h" (`landing:68`): `display:inline-flex;align-items:center;gap:8px;font-weight:700`.
- **Punto pulsante** (`landing:69`): `width:8px;height:8px;border-radius:50%;background:#fff;animation:vlsPulso 1.6s ease-in-out infinite`. Es un `<span>` vacío, puramente decorativo.
- Texto secundario (`landing:72`): `opacity:.9`.
- Teléfono (`landing:73`): `color:#fff;text-decoration:underline;font-weight:700`; `href="tel:+34640221190"`.

### Contenido dinámico y huecos de imagen

- `{{ telUrgencias }}` = `this.props.telefonoUrgencias ?? '640 22 11 90'` (`landing:691`).
- El texto visible es la prop editable, pero el `href` (`tel:+34640221190`, `landing:73`) está **hardcodeado**.
- Sin huecos de imagen. El único "icono" es el `<span>` circular de `landing:69`.

---

## 2. Cabecera (nav escritorio + menú móvil)

`<header>` en `landing:77-116`: `position:sticky;top:0;z-index:60;background:color-mix(in srgb, var(--bg) 88%, transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--border)`.
Fila interior `landing:78`: `max-width:1220px;margin:0 auto;padding:12px clamp(16px,4vw,28px);display:flex;align-items:center;justify-content:space-between;gap:16px`.

### 2.1 Logotipo (`landing:79-88`)

- `<a href="#inicio" style="display:flex;align-items:center;gap:11px;color:var(--ink);flex-shrink:0">` (`landing:79`).
- **Cuadro de marca** (`landing:80`): `position:relative;width:38px;height:38px;border-radius:12px;background:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0`.
  - Barra horizontal (`landing:81`): `position:absolute;width:17px;height:4.5px;border-radius:3px;background:var(--on-primary)`.
  - Barra vertical (`landing:82`): `position:absolute;width:4.5px;height:17px;border-radius:3px;background:var(--on-primary)`.
  - Resultado: una **cruz veterinaria construida con dos `<span>`**, sin SVG ni imagen.
- Wordmark (`landing:84`): `display:flex;flex-direction:column;line-height:1.05`.
  - Nombre (`landing:85`): `font-family:'Outfit',sans-serif;font-weight:600;font-size:17px;letter-spacing:-.01em` → "Veterinaria La Sierra".
  - **Cintillo** (`landing:86`): `font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:600` → "Clínica y hospital".

### 2.2 Navegación de escritorio (`landing:90-98`)

- `<nav style="{{ estiloNav }}" aria-label="Navegación principal">` (`landing:90`). `estiloNav` (`landing:695`) = `{ display: esMovil ? 'none' : 'flex', alignItems:'center', gap:'2px' }`.
- `<sc-for list="{{ navPrincipal }}" as="item" hint-placeholder-count="7">` (`landing:91`) → **hint 7, REAL 7** (`landing:702-710`). **Coinciden**.
  - Enlace (`landing:92`): `padding:9px 11px;border-radius:999px;font-size:14px;font-weight:500;color:var(--text);white-space:nowrap;transition:background .3s ease,color .3s ease`; hover: `background:var(--accent-soft);color:var(--accent-ink)`.
- **Botón de urgencias** (`landing:94-96`), `href="#contacto"`: `display:inline-flex;align-items:center;gap:7px;margin-left:6px;padding:9px 15px;border-radius:999px;background:var(--urg);color:#fff;font-size:13.5px;font-weight:700;white-space:nowrap;transition:filter .3s ease`; hover: `filter:brightness(1.08);color:#fff`. Punto pulsante (`landing:95`): `width:7px;height:7px;border-radius:50%;background:#fff;animation:vlsPulso 1.6s ease-in-out infinite`.
- **Botón Tienda** (`landing:97`), `href="./Tienda.dc.html"`: `margin-left:4px;padding:8px 15px;border-radius:999px;border:1.5px solid var(--border);color:var(--ink);font-size:13.5px;font-weight:600;white-space:nowrap;transition:border-color .3s ease`; hover: `border-color:var(--primary);color:var(--ink)`.

Los 7 ítems reales (`landing:702-710`): `#reservar` "Reservar"; `#servicios` "Servicios"; `./Campanas.dc.html` "Campañas"; `#equipo` "Equipo"; `./Blog.dc.html` "Blog"; `#contacto` "Contacto"; `#faq` "FAQ".

### 2.3 Botón hamburguesa (`landing:100-104`)

- `<button type="button" onClick="{{ alternarMenu }}" aria-label="Abrir menú" aria-expanded="{{ menuAbierto }}" style="{{ estiloBotonMenu }}">`.
- `estiloBotonMenu` (`landing:696-698`): `{ display: esMovil ? 'flex' : 'none', width:'46px', height:'46px', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'5px', borderRadius:'12px', border:'1px solid var(--border)', background:'var(--card)', cursor:'pointer' }`.
- Tres `<span>` idénticos (`landing:101`, `102`, `103`): `width:19px;height:2px;border-radius:2px;background:var(--ink);display:block`.
- El `aria-label` es fijo ("Abrir menú") aunque el menú esté abierto; sólo `aria-expanded` es dinámico.

### 2.4 Menú móvil (`landing:107-115`)

- `<sc-if value="{{ menuAbierto }}" hint-placeholder-val="{{ false }}">` (`landing:107`) → real `s.menuAbierto`, inicial `false` (`landing:617`, expuesto en `landing:699`). **Coinciden**.
- Panel (`landing:108`): `border-top:1px solid var(--border);background:var(--bg);padding:14px clamp(16px,4vw,28px) 22px;display:flex;flex-direction:column;gap:4px;max-height:70vh;overflow-y:auto`.
- `<sc-for list="{{ navPrincipal }}" as="item" hint-placeholder-count="7">` (`landing:109`) → **hint 7, REAL 7**.
  - Enlace (`landing:110`): `padding:13px 12px;border-radius:12px;font-size:16px;font-weight:500;color:var(--ink);min-height:46px;display:flex;align-items:center`; hover: `background:var(--accent-soft)`; `onClick="{{ cerrarMenu }}"`.
- Enlace Tienda (`landing:112`): mismo estilo, también con `cerrarMenu`.
- CTA urgencias (`landing:113`), `href="tel:+34640221190"`: `margin-top:8px;padding:14px;border-radius:999px;background:var(--urg);color:#fff;font-weight:700;text-align:center;min-height:48px;display:flex;align-items:center;justify-content:center`; texto "Urgencias 24 h · {{ telUrgencias }}". **No lleva `cerrarMenu`**.
- Comportamiento: `alternarMenu` invierte el estado (`landing:700`); `cerrarMenu` lo pone a `false` (`landing:701`). No se guarda nada en `localStorage`, no hay trampa de foco ni cierre con Escape. **NO CONSTA EN LA FUENTE**.

### 2.5 Huecos de imagen

Ninguno en toda la cabecera.

---

## 3. Hero

`<section id="inicio" data-screen-label="Hero">` en `landing:118-140`.

### Estilo del contenedor (`landing:118`)

`position:relative;min-height:clamp(540px,84vh,780px);display:flex;align-items:center;justify-content:center;overflow:hidden;background-color:#0B1B33;background-image:linear-gradient(180deg,rgba(6,16,32,.62) 0%,rgba(6,16,32,.46) 42%,rgba(6,16,32,.78) 100%),url('https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1800');background-size:cover;background-position:center 42%`

- **La imagen es `background-image`, no un `<img>`**: sin `alt`, sin `loading`, sin `width`/`height`, sin `srcset`. Ancho pedido a Pexels: `w=1800`. Relación de aspecto: **no hay `aspect-ratio`**; el hueco lo define `min-height:clamp(540px,84vh,780px)`.
- Color base `#0B1B33` (idéntico al token `--ink` de la paleta clinica, `landing:20`) + velo de tres paradas encima de la foto.

### Contenido (`landing:119-139`)

Bloque (`landing:119`): `position:relative;z-index:2;max-width:900px;margin:0 auto;padding:clamp(84px,13vw,140px) clamp(18px,6vw,32px) clamp(60px,9vw,92px);text-align:center;display:flex;flex-direction:column;align-items:center`.

- **Píldora de localización** (`landing:120-122`): `display:inline-flex;align-items:center;gap:9px;padding:7px 16px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(6px);color:#fff;font-size:12.5px;font-weight:600;letter-spacing:.1em;text-transform:uppercase` → "Miraflores de la Sierra · Madrid".
  - Punto (`landing:121`): `width:7px;height:7px;border-radius:50%;background:#4ADE80` — **no lleva animación**, a diferencia de los puntos de urgencias.
- `<h1>` (`landing:123`): `font-family:'Outfit',sans-serif;font-weight:600;font-size:clamp(33px,6.4vw,68px);line-height:1.05;letter-spacing:-.02em;color:#fff;margin:22px 0 0;text-shadow:0 2px 24px rgba(0,0,0,.35);max-width:16ch` → "Cuidamos la salud y la felicidad de tu mascota".
- `<p>` (`landing:124`): `font-size:clamp(16px,2.2vw,19.5px);line-height:1.65;color:rgba(255,255,255,.9);max-width:58ch;margin:20px 0 0;text-shadow:0 1px 12px rgba(0,0,0,.35)`.
- Botonera (`landing:125`): `display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-top:32px`.
  - CTA primario (`landing:126`), `href="#reservar"`: `display:inline-flex;align-items:center;justify-content:center;min-height:50px;padding:15px 30px;border-radius:999px;background:var(--primary);color:var(--on-primary);font-weight:700;font-size:15.5px;box-shadow:0 12px 30px rgba(0,0,0,.28);transition:transform .3s ease,filter .3s ease`; hover: `filter:brightness(1.1);transform:translateY(-2px);color:var(--on-primary)`.
  - CTA secundario (`landing:127-129`), `href="tel:+34640221190"`: `display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:50px;padding:15px 26px;border-radius:999px;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.55);backdrop-filter:blur(6px);color:#fff;font-weight:600;font-size:15.5px;transition:background .3s ease`; hover: `background:rgba(255,255,255,.24);color:#fff`. Punto pulsante (`landing:128`): `width:8px;height:8px;border-radius:50%;background:#F87171;animation:vlsPulso 1.6s ease-in-out infinite`.
- **Cifras** (`landing:131`): `display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:18px 26px;width:100%;max-width:720px;margin-top:clamp(38px,6vw,58px);padding-top:26px;border-top:1px solid rgba(255,255,255,.24)` — el separador es ese `border-top` translúcido.
  - `<sc-for list="{{ cifras }}" as="c" hint-placeholder-count="4">` (`landing:132`) → **hint 4, REAL 4** (`landing:712-717`). **Coinciden**.
  - Valor (`landing:134`): `font-family:'Outfit',sans-serif;font-size:clamp(24px,3.4vw,32px);font-weight:600;color:#fff;line-height:1`.
  - Etiqueta (`landing:135`): `font-size:12.5px;color:rgba(255,255,255,.78);margin-top:6px;letter-spacing:.02em`.
  - Datos reales: "+12 años / cuidando la sierra"; "8.400 / mascotas en ficha"; "24 h / urgencias los 365 días"; "4,9 ★ / 327 reseñas en Google" (`landing:713-716`).

Sin `aria-*` en toda la sección. **NO CONSTA EN LA FUENTE**.

---

## 4. Servicios

`<section id="servicios" data-screen-label="Servicios">` en `landing:142-181`: `padding:clamp(64px,9vw,104px) clamp(18px,5vw,28px);background:var(--bg)`. Contenedor `landing:143`: `max-width:1220px;margin:0 auto`.

### 4.1 Cabecera de sección

- **Cintillo (eyebrow)** (`landing:144`): `font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent-ink);font-weight:700;margin:0 0 13px` → "Lo que hacemos". Es el patrón que se repite en Campañas (`186`), Equipo (`212`), Reservar (`257`), Galería (`320`), Contacto (`348`) y FAQ (`427`).
- `<h2>` (`landing:145`): `font-family:'Outfit',sans-serif;font-size:clamp(28px,4.2vw,46px);line-height:1.08;letter-spacing:-.015em;font-weight:600;color:var(--ink);margin:0;max-width:20ch`, con `<em style="font-style:normal;color:var(--primary)">de principio a fin</em>` (el `<em>` se usa como resalte de color, no como énfasis tipográfico).
- `<p>` (`landing:146`): `font-size:17px;line-height:1.7;color:var(--muted);max-width:62ch;margin:16px 0 0`; contiene `<strong style="color:var(--accent-ink)">+</strong>` y afirma "**Doce especialidades** bajo el mismo techo".

### 4.2 Rejilla y tarjeta

- Rejilla (`landing:148`): `display:grid;grid-template-columns:repeat(auto-fit,minmax(min(310px,100%),1fr));gap:22px;margin-top:clamp(36px,5vw,54px)`.
- `<sc-for list="{{ servicios }}" as="s" hint-placeholder-count="6">` (`landing:149`) → **hint 6, CONTEO REAL 12** (array `SERVICIOS`, `landing:508-557`; ítems en `509, 513, 517, 521, 525, 529, 533, 537, 541, 545, 549, 553`).
- `<article>` (`landing:150`): `display:flex;flex-direction:column;background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);transition:transform .3s ease,box-shadow .3s ease`; hover: `transform:translateY(-4px);box-shadow:var(--shadow)`.
- **Hueco de imagen** (`landing:151`): `position:relative;aspect-ratio:16/10;background:var(--bg-2);overflow:hidden`.
  - `<img src="{{ s.img }}" alt="{{ s.alt }}" loading="lazy" width="800" height="500" style="display:block;width:100%;height:100%;object-fit:cover" />` (`landing:152`). 800/500 = 16/10 → **`width`/`height` coherentes con el `aspect-ratio`**. URL: `PX(x.img, 800)` (`landing:721`).
- **Píldora de categoría** (`landing:153`): `position:absolute;left:14px;top:14px;padding:6px 12px;border-radius:999px;background:var(--card);color:var(--accent-ink);font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase`.
- Cuerpo (`landing:155`): `display:flex;flex-direction:column;flex:1;padding:22px 22px 20px`.
- `<h3>` (`landing:156`): `font-family:'Outfit',sans-serif;font-size:21px;font-weight:600;line-height:1.15;color:var(--ink);margin:0`.
- `<p>` (`landing:157`): `font-size:14.5px;line-height:1.65;color:var(--muted);margin:9px 0 0`.

### 4.3 Panel plegable

- `<div style="{{ s.estiloPanel }}">` (`landing:159`) = `panel(abierto)` (`landing:652-655`, asignado en `landing:726`): `overflow:hidden; maxHeight: '620px' | '0px'; opacity: 1 | 0; transition:'max-height .3s ease, opacity .3s ease'`.
- Interior (`landing:160`): `padding-top:16px;margin-top:16px;border-top:1px solid var(--border)`.
- Detalle (`landing:161`): `font-size:14px;line-height:1.7;color:var(--text);margin:0 0 12px`.
- `<ul>` (`landing:162`): `list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px`.
- `<sc-for list="{{ s.incluye }}" as="linea" hint-placeholder-count="3">` (`landing:163`) → **hint 3, REAL 3 en los 12 servicios** (`landing:512, 516, 520, 524, 528, 532, 536, 540, 544, 548, 552, 556`). **Coinciden**.
- `<li>` (`landing:164`): `display:flex;align-items:flex-start;gap:9px;font-size:13.5px;color:var(--text)`.
- **Check circular** (`landing:165`): `flex-shrink:0;width:17px;height:17px;margin-top:1px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center` con el carácter `✓`.

### 4.4 Botón de despliegue

- `<button type="button" onClick="{{ s.alternar }}" aria-expanded="{{ s.abierto }}">` (`landing:172`): `display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;margin-top:auto;padding:14px 4px 0;background:none;border:none;border-top:1px solid var(--border);cursor:pointer;color:var(--accent-ink);font-size:13.5px;font-weight:700;text-align:left;min-height:48px`.
- Rótulo dinámico (`landing:723`): `abierto ? 'Ocultar detalle' : 'Ver qué incluye'`.
- **Icono "+"** (`landing:174`) con `{{ s.estiloMas }}` (`landing:727-729`): `{ flexShrink:0, width:'30px', height:'30px', borderRadius:'50%', background:'var(--accent-soft)', color:'var(--accent-ink)', fontSize:'19px', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center', transition:'transform .3s ease', transform: abierto ? 'rotate(45deg)' : 'rotate(0deg)' }` → el "+" gira 45° y se lee como "×".

### 4.5 Comportamiento y estado

`alternar: () => this.alternarClave('serviciosAbiertos', i)` (`landing:724`) escribe en el mapa `serviciosAbiertos` (`landing:619`), indexado por posición. **No es exclusivo**: pueden abrirse las 12 tarjetas a la vez. No se persiste nada.

### 4.6 Los 12 servicios reales (categoría / título / id Pexels)

1. Medicina / Consulta general / 6235241 (`landing:509`)
2. Prevención / Vacunación / 6235233 (`landing:513`)
3. Quirófano / Cirugía / 1350593 (`landing:517`)
4. Diagnóstico / Diagnóstico por imagen / 6816861 (`landing:521`)
5. Laboratorio / Análisis clínicos / 4269363 (`landing:525`)
6. Especialidad / Dermatología / 6816858 (`landing:529`)
7. Especialidad / Odontología / 220938 (`landing:533`)
8. Exóticos / Animales exóticos / 4498185 (`landing:537`)
9. Bienestar / Peluquería canina / 4269356 (`landing:541`)
10. Bienestar / Nutrición y etología / 2253275 (`landing:545`)
11. Urgencias / Urgencias 24 h / 5732461 (`landing:549`)
12. Trámites / Microchip y viajes / 4587998 (`landing:553`)

---

## 5. Campañas

`<section id="campanas" data-screen-label="Campañas">` en `landing:183-207`: `padding:clamp(56px,8vw,90px) clamp(18px,5vw,28px);background:var(--bg-2)` — **única sección con paddings verticales cortos** (56/90 frente a 64/104 del resto).
Rejilla de dos columnas (`landing:184`): `max-width:1220px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:clamp(24px,4vw,44px);align-items:center`.

### 5.1 Columna de texto (`landing:185-190`)

- Cintillo (`landing:186`) "Campañas", mismo estilo que `landing:144`.
- `<h2>` (`landing:187`): `font-family:'Outfit',sans-serif;font-size:clamp(26px,3.6vw,40px);line-height:1.1;letter-spacing:-.015em;font-weight:600;color:var(--ink);margin:0` → **escala menor que el resto de h2** (26–40 px frente a 28–46 px).
- `<p>` (`landing:188`): `font-size:16.5px;line-height:1.7;color:var(--muted);max-width:52ch;margin:14px 0 26px`.
- CTA (`landing:189`), `href="./Campanas.dc.html"`: `display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:14px 26px;border-radius:999px;background:var(--primary);color:var(--on-primary);font-weight:700;font-size:15px;transition:filter .3s ease,transform .3s ease`; hover: `filter:brightness(1.1);transform:translateY(-2px);color:var(--on-primary)`. Texto "Ver campañas activas →" (la flecha es un carácter, no un icono).

### 5.2 Columna de tarjetas (`landing:191-205`)

- Rejilla (`landing:191`): `display:grid;grid-template-columns:repeat(auto-fit,minmax(min(210px,100%),1fr));gap:14px`.
- `<sc-for list="{{ campanas }}" as="c" hint-placeholder-count="3">` (`landing:192`) → **hint 3, REAL 3** (`landing:732-736`). **Coinciden**.
- Tarjeta = enlace completo `<a href="./Campanas.dc.html">` (`landing:193`): `display:block;background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;box-shadow:var(--shadow-sm);transition:transform .3s ease`; hover: `transform:translateY(-3px)`. Radio 16 px, menor que los 20 px de Servicios/Equipo/Galería.
- **Hueco de imagen** (`landing:194`): `aspect-ratio:16/9;background:var(--bg-2);overflow:hidden`; `<img src alt loading="lazy" style="display:block;width:100%;height:100%;object-fit:cover" />` — **sin `width`/`height` declarados**. URL `PX(id, 600)` (`landing:733-735`).
- Cuerpo (`landing:195`): `padding:14px 16px 16px`; fila de meta (`landing:196`): `display:flex;align-items:center;gap:8px;flex-wrap:wrap`.
- **Píldora de estado** (`landing:197`): `padding:4px 10px;border-radius:999px;background:var(--accent-soft);color:var(--accent-ink);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase`.
- Vigencia (`landing:198`): `font-size:12px;color:var(--muted)`.
- `<h3>` (`landing:200`): `font-family:'Outfit',sans-serif;font-size:17px;font-weight:600;color:var(--ink);margin:10px 0 4px`.
- Precio (`landing:201`): `<p style="font-size:13.5px;color:var(--muted);margin:0"><strong style="color:var(--primary);font-size:16px">{{ c.precio }}</strong> {{ c.nota }}</p>`.

### 5.3 Las 3 campañas reales (`landing:733-735`)

1. "Vacunación anual 2026" / estado "Activa" / "Hasta el 30 de septiembre" / **49 €** / "con revisión incluida" / Pexels 6235233.
2. "Salud dental" / "Activa" / "Todo octubre" / **−25 %** / "en limpieza con ultrasonidos" / Pexels 220938.
3. "Chequeo senior" / "Plazas limitadas" / "Mayores de 8 años" / **75 €** / "analítica + ecografía" / Pexels 733416.

La píldora usa el mismo par de colores para "Activa" y para "Plazas limitadas" (`landing:197`): no hay diferenciación cromática por estado.

---

## 6. Equipo

`<section id="equipo" data-screen-label="Equipo">` en `landing:209-252`: `padding:clamp(64px,9vw,104px) clamp(18px,5vw,28px);background:var(--bg)`.

### 6.1 Cabecera centrada (`landing:211-215`)

`text-align:center;max-width:640px;margin:0 auto` (`landing:211`); cintillo "Equipo" (`landing:212`); `<h2>` con la escala estándar 28–46 px (`landing:213`) → "Nuestro equipo"; `<p>` (`landing:214`) `font-size:17px;line-height:1.7;color:var(--muted);margin:16px 0 0` que afirma "**Seis** profesionales colegiados".

### 6.2 Rejilla y ficha

- Rejilla (`landing:217`): `display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:26px;margin-top:clamp(36px,5vw,52px);align-items:start` — el `align-items:start` impide que al abrir una biografía crezcan las tarjetas hermanas.
- `<sc-for list="{{ equipo }}" as="p" hint-placeholder-count="6">` (`landing:218`) → **hint 6, REAL 6** (array `EQUIPO`, `landing:559-578`; ítems en `560, 563, 566, 569, 572, 575`). **Coinciden**.
- `<article>` (`landing:219`): `display:flex;flex-direction:column;background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);transition:box-shadow .3s ease`; hover: `box-shadow:var(--shadow)` (sin `translateY`, a diferencia de Servicios).
- **Hueco de retrato** (`landing:220`): `aspect-ratio:4/3;background:var(--accent-soft);overflow:hidden`.
  - `<img src="{{ p.img }}" alt="{{ p.alt }}" loading="lazy" width="800" height="600" style="display:block;width:100%;height:100%;object-fit:cover" />` (`landing:221`). 800/600 = 4/3 → **coherente**. URL `PX(x.img, 800)` (`landing:741`).
- Cuerpo (`landing:223`): `display:flex;flex-direction:column;gap:14px;padding:20px 20px 22px`.
- Fila nombre + botón (`landing:224`): `display:flex;align-items:center;justify-content:space-between;gap:12px`; bloque de texto (`landing:225`) `min-width:0`.
  - `<h3>` (`landing:226`): `font-family:'Outfit',sans-serif;font-size:20px;font-weight:600;color:var(--ink);margin:0;line-height:1.2`.
  - Rol (`landing:227`): `display:block;font-size:13px;color:var(--muted);margin-top:3px`.
- **Botón "+"** (`landing:229`): `onClick="{{ p.alternar }}" aria-expanded="{{ p.abierto }}" aria-label="{{ p.aria }}"`, estilo `{{ p.estiloMas }}` (`landing:744-747`): `{ flexShrink:0, width:'44px', height:'44px', borderRadius:'50%', border:'1px solid var(--border)', background: abierto ? 'var(--primary)' : 'var(--accent-soft)', color: abierto ? 'var(--on-primary)' : 'var(--accent-ink)', fontSize:'22px', lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'transform .3s ease, background .3s ease, color .3s ease', transform: abierto ? 'rotate(45deg)' : 'rotate(0deg)' }`.
  - `aria` dinámico (`landing:742`): `abierto ? 'Ocultar la biografía de <nombre>' : 'Ver la biografía de <nombre>'`.
- **Panel plegable** (`landing:232`) con `{{ p.estiloPanel }}` = `panel(abierto)` (`landing:743`); interior (`landing:233`): `padding:14px 0 2px;border-top:1px solid var(--border)`.
  - Bio (`landing:234`): `font-size:14px;line-height:1.7;color:var(--text);margin:0 0 12px`.
  - **Lista de definición** `<dl>` (`landing:235`): `display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0;font-size:13px`; `<dt>` (`landing:236-237`) `color:var(--muted)`; `<dd>` `margin:0;color:var(--text);font-weight:600`. Pares: "Colegiada/o" → `{{ p.colegiado }}`; "Idiomas" → `{{ p.idiomas }}`.
- **Tags** (`landing:242`): `display:flex;flex-wrap:wrap;gap:7px;margin:0;padding:0;list-style:none`.
  - `<sc-for list="{{ p.tags }}" as="t" hint-placeholder-count="3">` (`landing:243`) → **hint 3, REAL 3 en las 6 fichas** (`landing:562, 565, 568, 571, 574, 577`). **Coinciden**.
  - `<li>` (`landing:244`): `background:var(--accent-soft);color:var(--accent-ink);font-size:12px;font-weight:600;padding:5px 11px;border-radius:30px`.
- Orden DOM: los tags van **después** del panel (`landing:242` tras `240`), así que al abrir la biografía las etiquetas se empujan hacia abajo.

### 6.3 Las 6 fichas reales (nombre / rol / colegiado / idiomas / Pexels)

1. Dra. Elena Vargas / Directora clínica · Medicina interna / nº 28-7412 / Español · Inglés / 4269363 (`landing:560-562`)
2. Dr. Marcos Nieto / Cirujano jefe / nº 28-8130 / Español · Portugués / 7469496 (`landing:563-565`)
3. Dra. Lucía Ferrer / Dermatología y alergias / nº 28-9055 / Español · Valenciano · Inglés / 6816858 (`landing:566-568`)
4. Sergio Ibáñez / Auxiliar técnico veterinario / ATV nº 4471 / Español · Inglés / 6234600 (`landing:569-571`)
5. Dra. Nadia Olmo / Animales exóticos / nº 28-9612 / Español · Francés / 4498185 (`landing:572-574`)
6. Paula Guzmán / Peluquería y bienestar / Certificación ANPP / Español / 6235241 (`landing:575-577`)

---

## 7. Reservar (chat)

`<section id="reservar" data-screen-label="Reservar">` en `landing:254-315`: `padding:clamp(64px,9vw,104px) clamp(18px,5vw,28px);background:var(--bg-2)`.
Rejilla (`landing:255`): `max-width:1220px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:clamp(28px,4vw,52px);align-items:center`.

### 7.1 Columna izquierda (`landing:256-271`)

- Cintillo "Reserva rápida" (`landing:257`); `<h2>` (`landing:258`) escala estándar; `<p>` (`landing:259`) `font-size:17px;line-height:1.7;color:var(--muted);max-width:52ch;margin:16px 0 0`.
- Botonera (`landing:260`): `display:flex;flex-wrap:wrap;gap:12px;margin-top:28px`.
  - **WhatsApp** (`landing:261`), `href="https://wa.me/34640221190" target="_blank" rel="noopener"`: `display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:14px 26px;border-radius:999px;background:var(--accent-ink);color:#fff;font-weight:700;font-size:15px;transition:filter .3s ease`; hover: `filter:brightness(1.1);color:#fff`.
  - **Llamar a la clínica** (`landing:262`), `href="tel:+34918442160"`: `display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:13px 25px;border-radius:999px;border:1.5px solid var(--border);color:var(--ink);font-weight:600;font-size:15px;transition:border-color .3s ease`; hover: `border-color:var(--primary);color:var(--ink)`.
- Lista de ventajas (`landing:264`): `list-style:none;margin:28px 0 0;padding:0;display:flex;flex-direction:column;gap:11px`.
  - `<sc-for list="{{ ventajasReserva }}" as="v" hint-placeholder-count="3">` (`landing:265`) → **hint 3, REAL 3** (`landing:752-756`). **Coinciden**. Textos: "Confirmamos la hora exacta en menos de 2 horas"; "Recordatorio por WhatsApp la víspera de la cita"; "Cambios y cancelaciones sin coste hasta 6 h antes".
  - `<li>` (`landing:266`): `display:flex;align-items:flex-start;gap:10px;font-size:14.5px;color:var(--text)`.
  - **Check circular** (`landing:267`): `flex-shrink:0;width:20px;height:20px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-top:1px` — 20 px, frente a los 17 px del check de Servicios (`landing:165`).

### 7.2 Tarjeta de chat (`landing:273-313`)

- Contenedor (`landing:273`): `background:var(--card);border:1px solid var(--border);border-radius:22px;overflow:hidden;box-shadow:var(--shadow);display:flex;flex-direction:column;min-height:470px`.
- Cabecera (`landing:274`): `display:flex;align-items:center;gap:12px;padding:15px 18px;border-bottom:1px solid var(--border);background:var(--surface)`.
  - **Avatar de iniciales** (`landing:275`): `width:40px;height:40px;border-radius:50%;background:var(--primary);color:var(--on-primary);display:flex;align-items:center;justify-content:center;font-family:'Outfit',sans-serif;font-weight:700;font-size:14px;letter-spacing:.04em`, contenido literal "LS". No es una foto ni una imagen: es un `<span>` con texto.
  - Nombre (`landing:277`): `font-weight:700;font-size:14.5px;color:var(--ink)`.
  - **Indicador "en línea"** (`landing:278`): `font-size:12px;color:var(--accent-ink);display:flex;align-items:center;gap:6px` + punto `width:7px;height:7px;border-radius:50%;background:var(--accent)` — **sin animación**.
- **Hilo de mensajes** (`landing:282`): `flex:1;display:flex;flex-direction:column;gap:10px;padding:18px;overflow-y:auto;max-height:330px;background:var(--bg)`. Sin `role="log"` ni `aria-live`. **NO CONSTA EN LA FUENTE**.
  - `<sc-for list="{{ mensajes }}" as="m" hint-placeholder-count="2">` (`landing:283`) → **hint 2, REAL 1 en el estado inicial** (`mensajes:[{bot:true,texto:FLUJO[0].bot}]`, `landing:621`). El array crece en ejecución: `avanzar()` añade 2 mensajes por turno (usuario + bot) — `landing:661-670`.
  - **Burbuja** (`landing:284`) con `{{ m.estilo }}` (`landing:757-765`): `{ maxWidth:'84%', padding:'11px 15px', fontSize:'14.5px', lineHeight:1.55, alignSelf: bot ? 'flex-start' : 'flex-end', background: bot ? 'var(--card)' : 'var(--primary)', color: bot ? 'var(--ink)' : 'var(--on-primary)', border: bot ? '1px solid var(--border)' : '1px solid transparent', borderRadius: bot ? '16px 16px 16px 5px' : '16px 16px 5px 16px' }`. La "colita" es la esquina de 5 px, invertida según el emisor.
- **Pie de composición** (`landing:288`): `padding:14px 18px 18px;border-top:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;gap:10px`.

#### Estado A — opciones (`landing:289-295`)

- `<sc-if value="{{ hayOpciones }}" hint-placeholder-val="{{ true }}">`: real `!s.chatHecho && !!actual && !!actual.opciones` (`landing:766`); en el paso 0 es `true`. **Coinciden**.
- Fila (`landing:290`): `display:flex;flex-wrap:wrap;gap:8px`.
- `<sc-for list="{{ opciones }}" as="o" hint-placeholder-count="3">` (`landing:291`) → **hint 3, CONTEO REAL VARIABLE**: 4 en el paso `servicio`, 3 en `especie`, 3 en `dia`, 3 en `franja`, 0 en `nombre` (que muestra input). Fuente: `FLUJO`, `landing:608-614`.
- Botón de opción (`landing:292`): `padding:10px 16px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--ink);font-size:13.5px;font-weight:600;cursor:pointer;min-height:44px;transition:border-color .3s ease,background .3s ease`; hover: `border-color:var(--primary);background:var(--accent-soft)`.

#### Estado B — entrada de texto (`landing:297-302`)

- `<sc-if value="{{ hayInput }}" hint-placeholder-val="{{ false }}">`: real `!s.chatHecho && !!actual && !actual.opciones` (`landing:768`) → sólo verdadero en el paso `nombre`. **Coinciden**.
- Fila (`landing:298`): `display:flex;gap:8px`.
- `<input value="{{ borrador }}" onChange="{{ escribir }}" onKeyDown="{{ teclaEnvio }}" placeholder="{{ marcador }}" aria-label="Tu respuesta">` (`landing:299`): `flex:1;min-width:0;min-height:46px;padding:12px 15px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--ink);font-size:14.5px;outline:none`. Marcador real: `'Ej. Nala y Ana Martín'` (`landing:613`) con respaldo `'Escribe aquí…'` (`landing:769`).
- Botón de envío (`landing:300`): `aria-label="Enviar"`, `width:46px;height:46px;flex-shrink:0;border-radius:50%;border:none;background:var(--primary);color:var(--on-primary);font-size:18px;cursor:pointer`, contenido textual `→`.
- No hay `<form>`: el envío con teclado lo resuelve `teclaEnvio` comprobando `e.key === 'Enter'` (`landing:772`).

#### Estado C — chat terminado (`landing:304-309`)

- `<sc-if value="{{ chatHecho }}" hint-placeholder-val="{{ false }}">`: real `s.chatHecho`, inicial `false` (`landing:621`, `landing:774`). **Coinciden**.
- Enlace WhatsApp (`landing:306`), `href="{{ hrefWhatsapp }}" target="_blank" rel="noopener"`: `display:flex;align-items:center;justify-content:center;min-height:48px;padding:14px;border-radius:999px;background:var(--accent-ink);color:#fff;font-weight:700;font-size:14.5px`; hover: `filter:brightness(1.1);color:#fff`.
- "Pedir otra cita" (`landing:307`): `background:none;border:none;color:var(--primary);font-size:13.5px;font-weight:600;text-decoration:underline;cursor:pointer;min-height:40px`.

#### Aviso permanente (`landing:311`)

`margin:0;font-size:11.5px;color:var(--muted);line-height:1.5` → "Demostración: la solicitud no se envía a ningún servidor hasta que pulsas WhatsApp."

### 7.3 Lógica del chat

- `FLUJO` (`landing:608-614`), **5 pasos reales**:
  1. `servicio` — "Hola, soy el asistente de Veterinaria La Sierra. ¿Qué necesita tu mascota?" con **4 opciones**: Consulta general, Vacunación, Peluquería, Es una urgencia (`landing:609`).
  2. `especie` — "Entendido. ¿Con qué animal vienes?" con **3 opciones**: Perro, Gato, Exótico (`landing:610`).
  3. `dia` — "Perfecto. ¿Qué día te viene mejor?" con **3 opciones**: Entre semana, Este fin de semana, Lo antes posible (`landing:611`).
  4. `franja` — "¿Y en qué franja horaria?" con **3 opciones**: Por la mañana, Por la tarde, Me da igual (`landing:612`).
  5. `nombre` — "Ya casi está. ¿Cómo os llamáis tu mascota y tú?", **sin opciones**, con `marcador: 'Ej. Nala y Ana Martín'` (`landing:613`).
- `avanzar(valor)` (`landing:657-670`): guarda la respuesta bajo `FLUJO[paso].clave`; añade la burbuja del usuario y, si queda paso, la del bot; si no, compone el resumen "Gracias, <nombre>. Anotado: <servicio> · <especie> · <dia> · <franja>. Te confirmamos la hora exacta por WhatsApp en menos de 2 horas." y pone `chatHecho:true` (`landing:668-669`).
- `enviarTexto()` (`landing:672-676`): descarta el borrador vacío tras `trim()`.
- `hrefWhatsapp` (`landing:775`): `https://wa.me/34640221190?text=<mensaje>`, con el mensaje codificado en `landing:687-689`.
- `reiniciarChat` (`landing:776`): vuelve a `paso:0`, `mensajes` al saludo inicial, `respuestas:{}`, `borrador:''`, `chatHecho:false`.
- **Nada del chat se persiste**: sólo el tema usa `localStorage` (`landing:644`).

### 7.4 Huecos de imagen

Ninguno en toda la sección. El avatar es tipográfico (`landing:275`).

---

## 8. Galería

`<section id="galeria" data-screen-label="Galería">` en `landing:317-343`: `padding:clamp(64px,9vw,104px) 0;background:var(--bg);overflow:hidden` — **padding lateral 0**, para que la pista sangre a borde completo.

### 8.1 Cabecera y controles (`landing:318-328`)

- Fila (`landing:318`): `max-width:1220px;margin:0 auto;padding:0 clamp(18px,5vw,28px);display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:18px`.
- Cintillo "Galería" (`landing:320`); `<h2>` (`landing:321`) "Galería · Nuestros peludos"; `<p>` (`landing:322`) `font-size:16.5px;line-height:1.7;color:var(--muted);max-width:56ch;margin:14px 0 0`.
- Controles (`landing:324`): `display:flex;gap:10px`.
  - **Atrás** (`landing:325`): `onClick="{{ galeriaAtras }}" aria-label="Foto anterior"`, `width:48px;height:48px;border-radius:50%;border:1.5px solid var(--border);background:var(--card);color:var(--ink);font-size:17px;cursor:pointer;transition:border-color .3s ease`; hover: `border-color:var(--primary)`; contenido `←`.
  - **Adelante** (`landing:326`): idéntico, con `aria-label="Foto siguiente"` y `→`.

### 8.2 Pista y tarjeta

- Pista (`landing:330`): `ref="{{ pistaGaleria }}"`, `display:flex;gap:18px;margin-top:clamp(28px,4vw,42px);padding:6px clamp(18px,5vw,28px) 22px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch`. Sin `role`, sin `tabindex`, sin `aria-label`. **NO CONSTA EN LA FUENTE**.
- `<sc-for list="{{ galeria }}" as="g" hint-placeholder-count="5">` (`landing:331`) → **hint 5, CONTEO REAL 9** (array `GALERIA`, `landing:580-590`; ítems en `581-589`).
- `<figure>` (`landing:332`): `flex:0 0 clamp(240px,32vw,360px);margin:0;scroll-snap-align:start;background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm)`.
- **Hueco de imagen** (`landing:333`): `aspect-ratio:4/3;background:var(--bg-2);overflow:hidden`.
  - `<img src="{{ g.img }}" alt="{{ g.alt }}" loading="lazy" style="display:block;width:100%;height:100%;object-fit:cover;transition:transform .3s ease" style-hover="transform:scale(1.05)" />` (`landing:334`) — **sin `width`/`height` declarados**. URL `PX(g.img, 700)` (`landing:778`).
- `<figcaption>` (`landing:336`): `padding:14px 16px 16px`.
  - Nombre (`landing:337`): `display:block;font-family:'Outfit',sans-serif;font-size:16px;font-weight:600;color:var(--ink)`.
  - Pie (`landing:338`): `display:block;font-size:13px;color:var(--muted);margin-top:3px`.

### 8.3 Comportamiento

`desplazarGaleria(direccion)` (`landing:678-684`): toma `this.pista.firstElementChild`, calcula `paso = ancho de la tarjeta + 18` (los 18 px del `gap` de `landing:330`) y ejecuta `pista.scrollBy({left: paso*direccion, behavior:'smooth'})`. Sin bucle ni índice: **los botones nunca se deshabilitan**, aunque en los extremos el scroll ya no avance. `pistaGaleria` es un callback ref que guarda el nodo en `this.pista` (`landing:779`).

### 8.4 Los 9 elementos reales (nombre / pie / Pexels)

1. Nala y Coco / "Primera vacunación · 9 semanas" / 1108099 (`landing:581`)
2. Sombra / "Revisión anual · gato de 6 años" / 617278 (`landing:582`)
3. Bruno / "Alta tras cirugía de rodilla" / 1938126 (`landing:583`)
4. Turrón / "Control de peso · −1,8 kg" / 1741205 (`landing:584`)
5. Rocco / "Chequeo senior · 11 años" / 733416 (`landing:585`)
6. Lola / "Peluquería y revisión de piel" / 2607544 (`landing:586`)
7. Kiwi / "Microchip y pasaporte" / 58997 (`landing:587`)
8. Duna / "Limpieza dental" / 209037 (`landing:588`)
9. Nieve / "Desparasitación trimestral" / 356378 (`landing:589`)

---

## 9. Contacto

`<section id="contacto" data-screen-label="Contacto">` en `landing:345-422`: `padding:clamp(64px,9vw,104px) clamp(18px,5vw,28px);background:var(--bg-2)`.

- Cabecera (`landing:347`): `max-width:640px` **alineada a la izquierda** (a diferencia de Equipo y FAQ, que la centran). Cintillo "Contacto" (`landing:348`); `<h2>` "Estamos a un paseo de casa" (`landing:349`); `<p>` (`landing:350`) `font-size:17px;line-height:1.7;color:var(--muted);margin:16px 0 0`.
- Rejilla (`landing:353`): `display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:clamp(24px,3vw,34px);margin-top:clamp(32px,4.5vw,48px);align-items:start`.

### 9.1 Formulario (`landing:354-396`)

Tarjeta (`landing:354`): `background:var(--card);border:1px solid var(--border);border-radius:22px;padding:clamp(22px,3vw,32px);box-shadow:var(--shadow-sm)`.

**Estado "enviado"** — `<sc-if value="{{ contactoEnviado }}" hint-placeholder-val="{{ false }}">` (`landing:355`); real `s.contactoEnviado`, inicial `false` (`landing:623`, `landing:783`). **Coinciden**.
- Bloque (`landing:356`): `text-align:center;padding:26px 6px`.
- **Disco de éxito** (`landing:357`): `width:56px;height:56px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);font-size:26px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px` con `✓`.
- `<h3>` (`landing:358`): `font-family:'Outfit',sans-serif;font-size:21px;font-weight:600;color:var(--ink);margin:0 0 8px` → "Mensaje recibido".
- `<p>` (`landing:359`): `font-size:14.5px;color:var(--muted);margin:0 0 18px;line-height:1.6`, con `{{ telUrgencias }}` interpolado.
- Botón (`landing:360`): `background:none;border:none;color:var(--primary);font-weight:600;font-size:14px;text-decoration:underline;cursor:pointer;min-height:44px` → "Enviar otro mensaje".

**Estado "pendiente"** — `<sc-if value="{{ contactoPendiente }}" hint-placeholder-val="{{ true }}">` (`landing:363`); real `!s.contactoEnviado` (`landing:784`). **Coinciden**.
- `<form onSubmit="{{ enviarContacto }}" style="display:flex;flex-direction:column;gap:16px">` (`landing:364`). **Sin `action` ni `method`**; `enviarContacto` hace `e.preventDefault()` y sólo conmuta el estado (`landing:785`).
- `<h3>` (`landing:365`): `font-family:'Outfit',sans-serif;font-size:20px;font-weight:600;color:var(--ink);margin:0` → "Escríbenos".
- Fila de dos campos (`landing:366`): `display:grid;grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr));gap:14px`.
- Patrón de campo: `<label style="display:flex;flex-direction:column;gap:7px;font-size:13px;font-weight:600;color:var(--ink)">Etiqueta <control></label>` (`landing:367-372`, `374-376`, `377-385`, `386-388`). Los controles van **envueltos** por el `<label>`; ninguno tiene `id` ni `for`.
- Estilo común de control (`landing:368`, `371`, `375`, `378`): `min-height:46px;padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--surface);color:var(--ink);font-size:14.5px;font-weight:400;outline:none`.
- Campos reales:
  - `nombre` — `required`, placeholder "Ana Martín" (`landing:368`).
  - `telefono` — `required`, `type="tel"`, placeholder "600 000 000" (`landing:371`).
  - `email` — `required`, `type="email"`, placeholder "ana@correo.es" (`landing:375`).
  - `motivo` — `<select>` (`landing:378`) con **5 `<option>` escritas a mano en el HTML** (`landing:379-383`): "Pedir cita", "Consulta sobre un tratamiento", "Campañas y precios", "Historial y documentación", "Otro". **No provienen de ningún array de datos.**
  - `mensaje` — `<textarea rows="4">` (`landing:387`), placeholder "Nombre y edad de tu mascota, y qué le pasa.", estilo `padding:12px 14px;border-radius:12px;border:1px solid var(--border);background:var(--surface);color:var(--ink);font-size:14.5px;font-weight:400;outline:none;resize:vertical;min-height:110px`.
- **Consentimiento** (`landing:389-392`): `<label>` `display:flex;align-items:flex-start;gap:10px;font-size:12.5px;color:var(--muted);line-height:1.5;font-weight:400`; checkbox `required` (`landing:390`) `margin-top:3px;width:18px;height:18px;flex-shrink:0;accent-color:var(--primary)`; el texto cita "la política de privacidad" **sin enlace** (`landing:391`).
- **Botón de envío** (`landing:393`): `min-height:50px;padding:15px;border-radius:999px;border:none;background:var(--primary);color:var(--on-primary);font-weight:700;font-size:15px;cursor:pointer;transition:filter .3s ease`; hover: `filter:brightness(1.1)`.
- Sin `aria-live` ni `role="status"` en el cambio de estado. **NO CONSTA EN LA FUENTE**.

### 9.2 Tarjeta de urgencias (`landing:399-405`)

- Contenedor (`landing:399`): `background:var(--urg);color:#fff;border-radius:20px;padding:22px 24px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px`.
- **Cintillo con punto pulsante** (`landing:401`): `display:flex;align-items:center;gap:9px;font-size:11.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;opacity:.92` + `<span style="width:8px;height:8px;border-radius:50%;background:#fff;animation:vlsPulso 1.6s ease-in-out infinite">` → "Urgencias 24 h".
- Teléfono (`landing:402`): `font-family:'Outfit',sans-serif;font-size:26px;font-weight:600;margin-top:6px` con `{{ telUrgencias }}`.
- Botón (`landing:404`), `href="tel:+34640221190"` (hardcodeado): `min-height:46px;padding:13px 22px;border-radius:999px;background:#fff;color:var(--urg);font-weight:700;font-size:14.5px;display:inline-flex;align-items:center`; hover: `color:var(--urg);filter:brightness(.95)` → "Llamar ahora".

### 9.3 Mapa y datos (`landing:407-418`)

- Tarjeta (`landing:407`): `background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm)`.
- **Mapa** (`landing:408`): `<iframe title="Mapa de Veterinaria La Sierra" src="https://www.openstreetmap.org/export/embed.html?bbox=-3.7838%2C40.8055%2C-3.7528%2C40.8195&layer=mapnik&marker=40.8125%2C-3.7683" loading="lazy" style="display:block;width:100%;height:240px;border:0">`. **Altura fija de 240 px, sin `aspect-ratio`**. Marcador en 40.8125, −3.7683; `bbox` −3.7838/40.8055/−3.7528/40.8195.
- Rejilla de datos (`landing:409`): `display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:18px;padding:20px 22px 22px`.
- `<sc-for list="{{ datosContacto }}" as="d" hint-placeholder-count="4">` (`landing:410`) → **hint 4, REAL 4** (`landing:787-792`). **Coinciden**.
  - Rótulo (`landing:412`): `font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-ink);margin-bottom:6px`.
  - Línea 1 (`landing:413`): `font-size:14.5px;line-height:1.6;color:var(--ink);font-weight:500`.
  - Línea 2 (`landing:414`): `font-size:13.5px;line-height:1.6;color:var(--muted)`.
- Los 4 bloques reales (`landing:788-791`):
  1. "Dirección" / "Ctra. de la Sierra, 42" / "28792 Miraflores de la Sierra, Madrid".
  2. "Teléfonos" / "918 44 21 60 · clínica" / "640 22 11 90 · urgencias 24 h".
  3. "Horario" / "L–V 9:00–14:00 y 16:30–20:30" / "Sábados 10:00–14:00 · domingos urgencias".
  4. "Email" / "hola@veterinarialasierra.es" / "Respondemos el mismo día".
- Ninguno de esos datos es enlace: son `<div>` de texto plano (`landing:413-414`), sin `tel:` ni `mailto:`.

---

## 10. FAQ

`<section id="faq" data-screen-label="FAQ">` en `landing:424-442`: `padding:clamp(64px,9vw,104px) clamp(18px,5vw,28px);background:var(--bg)`.

- Contenedor (`landing:425`): `max-width:860px;margin:0 auto` — **el más estrecho de la página** (el resto usa 1220 px).
- Cabecera centrada (`landing:426`); cintillo "FAQ" (`landing:427`); `<h2>` "Preguntas frecuentes" (`landing:428`). No hay párrafo de apoyo.
- Lista (`landing:430`): `margin-top:clamp(28px,4vw,40px);border-top:1px solid var(--border)`.
- `<sc-for list="{{ faq }}" as="f" hint-placeholder-count="5">` (`landing:431`) → **hint 5, CONTEO REAL 6** (array `FAQ`, `landing:592-599`; ítems en `593-598`). `faq: FAQ` sin transformación (`landing:794`).
- `<details name="faq" style="border-bottom:1px solid var(--border)">` (`landing:432`) — el atributo **`name` compartido convierte el acordeón en exclusivo** (un panel abierto a la vez), función nativa del navegador, sin JavaScript.
- `<summary>` (`landing:433`): `display:flex;align-items:center;justify-content:space-between;gap:20px;padding:20px 4px;cursor:pointer;color:var(--ink);font-family:'Outfit',sans-serif;font-size:clamp(16px,2.1vw,19px);font-weight:500;list-style:none;min-height:48px`. El marcador nativo se elimina con `list-style:none` aquí y con `summary::-webkit-details-marker{display:none}` en `landing:58`.
- **Icono "+"** (`landing:435`): `flex-shrink:0;width:30px;height:30px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);font-size:19px;line-height:1;display:flex;align-items:center;justify-content:center`. **No existe ninguna regla `details[open]`**: el icono es idéntico abierto y cerrado, y no rota (a diferencia de Servicios y Equipo).
- Respuesta (`landing:437`): `margin:0;padding:0 4px 24px;color:var(--text);line-height:1.75;font-size:15.5px;max-width:70ch`.

### Las 6 preguntas reales (`landing:593-598`)

1. "¿Cada cuánto tengo que vacunar a mi perro o gato?" (`landing:593`)
2. "¿Cuándo debo desparasitar y con qué frecuencia?" (`landing:594`)
3. "¿Qué pasa en la primera visita?" (`landing:595`)
4. "¿Cómo funcionan las urgencias 24 h?" (`landing:596`) — su respuesta repite "640 22 11 90" como **texto literal dentro del dato**, no vía `{{ telUrgencias }}`.
5. "¿Tenéis planes de salud o financiación?" (`landing:597`)
6. "¿Atendéis conejos, hurones o aves?" (`landing:598`)

Sin huecos de imagen.

---

## 11. Pie de página

`<footer>` en `landing:444-475`: `background:var(--card);border-top:1px solid var(--border);padding:clamp(48px,7vw,72px) clamp(18px,5vw,28px) 28px`. Sin `role` ni `aria-label`.

### 11.1 Fila superior (`landing:445-466`)

- Contenedor (`landing:445`): `max-width:1220px;margin:0 auto;display:flex;flex-wrap:wrap;gap:32px`.
- **Bloque de marca** (`landing:446`): `flex:1 1 260px;min-width:0`.
  - Logo (`landing:447`): `display:flex;align-items:center;gap:11px;margin-bottom:14px`.
    - Cuadro (`landing:448`): `position:relative;width:36px;height:36px;border-radius:11px;background:var(--primary);display:flex;align-items:center;justify-content:center` — 2 px menor y con radio 11 px, frente a 38 px / 12 px de la cabecera (`landing:80`).
    - Barras (`landing:449`, `450`): `width:16px;height:4px` y `width:4px;height:16px`, ambas `border-radius:3px;background:var(--on-primary)`.
  - Wordmark (`landing:452`): `font-family:'Outfit',sans-serif;font-weight:600;font-size:17px;color:var(--ink)`. **Aquí no hay cintillo "Clínica y hospital"** (sí lo hay en la cabecera, `landing:86`).
  - Descripción (`landing:454`): `font-size:14px;line-height:1.7;color:var(--muted);margin:0;max-width:34ch` → "Clínica veterinaria en Miraflores de la Sierra. Medicina preventiva, cirugía y urgencias 24 h desde 2013."
- `<sc-for list="{{ columnasPie }}" as="col" hint-placeholder-count="3">` (`landing:456`) → **hint 3, REAL 3** (`landing:796-807`). **Coinciden**.
  - Columna (`landing:457`): `flex:1 1 170px;min-width:0`.
  - Título (`landing:458`): `font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);margin-bottom:14px`.
  - `<ul>` (`landing:459`): `list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px`.
  - `<sc-for list="{{ col.enlaces }}" as="e" hint-placeholder-count="4">` (`landing:460`) → **hint 4, REAL 4 en las tres columnas** (`landing:798-799`, `801-802`, `804-806`). **Coinciden**.
  - Enlace (`landing:461`): `font-size:14px;color:var(--muted)`; hover: `color:var(--primary)`.

Las 3 columnas reales (`landing:796-807`):
1. **"Clínica"**: Servicios (`#servicios`), Equipo (`#equipo`), Reservar cita (`#reservar`), Galería (`#galeria`).
2. **"Contenido"**: Blog (`./Blog.dc.html`), Campañas (`./Campanas.dc.html`), Tienda (`./Tienda.dc.html`), Preguntas frecuentes (`#faq`).
3. **"Contacto"**: 918 44 21 60 (`tel:+34918442160`), Urgencias 24 h (`tel:+34640221190`), hola@veterinarialasierra.es (`mailto:`), Cómo llegar (`#contacto`).

### 11.2 Barra legal (`landing:467-474`)

- Contenedor (`landing:467`): `max-width:1220px;margin:36px auto 0;padding-top:20px;border-top:1px solid var(--border);display:flex;flex-wrap:wrap;gap:10px 22px;align-items:center;justify-content:space-between;font-size:12.5px;color:var(--muted)`.
- Copyright (`landing:468`): "© 2026 Veterinaria La Sierra · Centro veterinario registrado nº 28/0791".
- Enlaces (`landing:469-473`): contenedor `display:flex;flex-wrap:wrap;gap:16px`; "Aviso legal" (`landing:470`), "Privacidad" (`landing:471`), "Cookies" (`landing:472`), los tres con `style="color:var(--muted)"`, hover `color:var(--primary)` y **`href="#faq"`**.

Sin huecos de imagen en el pie.

---

## 12. Selector de paleta flotante

`<sc-if value="{{ mostrarSelector }}" hint-placeholder-val="{{ true }}">` (`landing:477`) → real `this.props.mostrarSelectorPaleta ?? true` (`landing:693`), prop con default `true` (`landing:505`). **Coinciden**.

- Anclaje (`landing:478`): `position:fixed;right:clamp(14px,3vw,26px);bottom:clamp(14px,3vw,26px);z-index:90;display:flex;flex-direction:column;align-items:flex-end;gap:10px`. Su `z-index:90` está por encima del `z-index:60` de la cabecera (`landing:77`).
- **Panel** — `<sc-if value="{{ selectorAbierto }}" hint-placeholder-val="{{ false }}">` (`landing:479`); real `s.selectorAbierto`, inicial `false` (`landing:617`, `landing:809`). **Coinciden**.
  - Caja (`landing:480`): `background:var(--card);border:1px solid var(--border);border-radius:18px;box-shadow:var(--shadow);padding:14px;width:min(268px,calc(100vw - 32px))`.
  - Rótulo (`landing:481`): `font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin-bottom:10px` → "Paleta de color".
  - Lista (`landing:482`): `display:flex;flex-direction:column;gap:7px`.
  - `<sc-for list="{{ paletas }}" as="p" hint-placeholder-count="4">` (`landing:483`) → **hint 4, REAL 4** (array `PALETAS`, `landing:601-606`; ítems `602-605`). **Coinciden**.
  - Botón de paleta (`landing:484`) con `{{ p.estilo }}` (`landing:816-820`): `{ display:'flex', alignItems:'center', gap:'11px', width:'100%', padding:'10px 12px', borderRadius:'12px', cursor:'pointer', minHeight:'48px', textAlign:'left', background: activa ? 'var(--accent-soft)' : 'transparent', border: activa ? '1.5px solid var(--primary)' : '1.5px solid var(--border)', transition:'background .3s ease, border-color .3s ease' }`.
  - **Tríada de muestras** (`landing:485-487`): contenedor `display:flex;gap:4px;flex-shrink:0`; cada muestra viene de `sw(c)` (`landing:813`): `{ width:'14px', height:'14px', borderRadius:'50%', background:c, border:'1px solid rgba(0,0,0,.12)' }`.
  - Textos (`landing:488-491`): nombre `font-size:13.5px;font-weight:700;color:var(--ink)`; nota `font-size:11.5px;color:var(--muted)`.
- **Botón burbuja** (`landing:497`): `onClick="{{ alternarSelector }}" aria-label="Cambiar paleta de color"`, `width:52px;height:52px;border-radius:50%;border:1px solid var(--border);background:var(--card);box-shadow:var(--shadow);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0`.
  - **Disco cónico** (`landing:498`): `width:24px;height:24px;border-radius:50%;background:conic-gradient(var(--primary) 0 33%, var(--accent) 33% 66%, var(--urg) 66% 100%)` — se recolorea solo al cambiar de tema.
  - **No lleva `aria-expanded`** (compárese con el botón hamburguesa, `landing:100`). **NO CONSTA EN LA FUENTE**.

### Las 4 paletas reales (`landing:602-605`)

| id | nombre | nota | muestras (`c[0]`, `c[1]`, `c[2]`) |
|---|---|---|---|
| `clinica` | "Confianza clínica" | "Azul cobalto · verde menta" | `#1E40AF`, `#10B981`, `#F8FAFC` |
| `calida` | "Orgánica y cálida" | "Terracota · oliva · crema" | `#D97706`, `#4D7C0F`, `#FEF3C7` |
| `tech` | "Alta gama" | "Azul marino · cian neón" | `#0F172A`, `#06B6D4`, `#64748B` |
| `eco` | "Relax & eco" | "Esmeralda · menta clara" | `#047857`, `#A7F3D0`, `#FFFFFF` |

### Comportamiento

`alternarSelector` invierte `selectorAbierto` (`landing:810`); `p.elegir` llama a `aplicarTema(p.id)` (`landing:812`), que escribe `data-tema` en `<html>` y persiste en `localStorage['vls-tema']` (`landing:642-646`). **El panel no se cierra al elegir**, no hay cierre con Escape ni al pulsar fuera. **NO CONSTA EN LA FUENTE**.

---

## 13. Tabla maestra: hint vs. CONTEO REAL

| Lista (`sc-for`) | Línea del `sc-for` | `hint-placeholder-count` (pista del editor) | **CONTEO REAL** | Fuente del dato |
|---|---|---|---|---|
| `navPrincipal` (nav escritorio) | 91 | 7 | **7** | `landing:702-710` |
| `navPrincipal` (menú móvil) | 109 | 7 | **7** | `landing:702-710` |
| `cifras` (hero) | 132 | 4 | **4** | `landing:712-717` |
| `servicios` | 149 | 6 | **12** | `landing:508-557` |
| `s.incluye` (por servicio) | 163 | 3 | **3** (×12) | `landing:512,516,520,524,528,532,536,540,544,548,552,556` |
| `campanas` | 192 | 3 | **3** | `landing:732-736` |
| `equipo` | 218 | 6 | **6** | `landing:559-578` |
| `p.tags` (por persona) | 243 | 3 | **3** (×6) | `landing:562,565,568,571,574,577` |
| `ventajasReserva` | 265 | 3 | **3** | `landing:752-756` |
| `mensajes` (chat) | 283 | 2 | **1** inicial (crece +2 por turno) | `landing:621`, `661-670` |
| `opciones` (chat) | 291 | 3 | **4 / 3 / 3 / 3 / 0** según el paso | `landing:609-613` |
| `galeria` | 331 | 5 | **9** | `landing:580-590` |
| `datosContacto` | 410 | 4 | **4** | `landing:787-792` |
| `faq` | 431 | 5 | **6** | `landing:592-599` |
| `columnasPie` | 456 | 3 | **3** | `landing:796-807` |
| `col.enlaces` (por columna) | 460 | 4 | **4** (×3) | `landing:798-799, 801-802, 804-806` |
| `paletas` | 483 | 4 | **4** | `landing:601-606` |

`sc-if` — hint vs. valor real inicial:

| Condición | Línea | `hint-placeholder-val` | Valor real inicial | Fuente |
|---|---|---|---|---|
| `barraUrgencias` | 66 | `true` | `true` | `landing:692` + props `landing:505` |
| `menuAbierto` | 107 | `false` | `false` | `landing:617` |
| `hayOpciones` | 289 | `true` | `true` (paso 0) | `landing:766` |
| `hayInput` | 297 | `false` | `false` (paso 0) | `landing:768` |
| `chatHecho` | 304 | `false` | `false` | `landing:621` |
| `contactoEnviado` | 355 | `false` | `false` | `landing:623` |
| `contactoPendiente` | 363 | `true` | `true` | `landing:784` |
| `mostrarSelector` | 477 | `true` | `true` | `landing:693` + props `landing:505` |
| `selectorAbierto` | 479 | `false` | `false` | `landing:617` |

---

## 14. Tabla maestra: huecos de imagen

| Hueco | Líneas | `aspect-ratio` | `width`/`height` en el `<img>` | `loading` | Ancho pedido a Pexels |
|---|---|---|---|---|---|
| Hero (fondo CSS) | 118 | — (usa `min-height:clamp(540px,84vh,780px)`) | no aplica (`background-image`) | no aplica | `w=1800` |
| Servicios | 151-152 | `16/10` | `800` × `500` — coherente | `lazy` | `PX(x.img, 800)` (`landing:721`) |
| Campañas | 194 | `16/9` | **ausentes** | `lazy` | `PX(id, 600)` (`landing:733-735`) |
| Equipo | 220-221 | `4/3` | `800` × `600` — coherente | `lazy` | `PX(x.img, 800)` (`landing:741`) |
| Galería | 333-334 | `4/3` | **ausentes** | `lazy` | `PX(g.img, 700)` (`landing:778`) |
| Mapa (`iframe`) | 408 | — (`height:240px` fijo) | `width:100%` / `height:240px` por CSS | `lazy` | no aplica |

Constructor de URL: `PX = (id, w) => https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}` (`landing:506`).

---

## 15. Inventario de elementos visuales recurrentes

- **Punto pulsante** (`animation:vlsPulso 1.6s ease-in-out infinite`) — 4 apariciones: barra de urgencias, 8 px blanco (`landing:69`); CTA de urgencias del nav, 7 px blanco (`landing:95`); CTA de urgencias del hero, 8 px `#F87171` (`landing:128`); tarjeta de urgencias de Contacto, 8 px blanco (`landing:401`).
- **Puntos NO pulsantes** — 2: píldora del hero, 7 px `#4ADE80` (`landing:121`); estado "en línea" del chat, 7 px `var(--accent)` (`landing:278`).
- **Cintillo (eyebrow) canónico** `font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent-ink);font-weight:700;margin:0 0 13px` — 7 apariciones: `144, 186, 212, 257, 320, 348, 427`.
- **Variantes del cintillo**: 12.5 px/`.1em` píldora del hero (`landing:120`); 11.5 px/`.14em` tarjeta de urgencias (`landing:401`); 11 px/`.14em` títulos de columna del pie (`landing:458`); 10.5 px/`.16em` cintillo del logo (`landing:86`); 10.5 px/`.14em` rótulos de datos de contacto (`landing:412`) y del selector (`landing:481`); 10.5 px/`.1em` píldora de categoría de servicio (`landing:153`); 10 px/`.08em` píldora de estado de campaña (`landing:197`).
- **Píldoras / `border-radius:999px`**: `120, 92, 94, 97, 113, 126, 127, 153, 189, 197, 261, 262, 292, 299, 306, 393, 404`.
- **Check circular `✓`**: 17 px en Servicios (`landing:165`), 20 px en ventajas de Reservar (`landing:267`), 56 px en la confirmación de Contacto (`landing:357`). Los tres con `background:var(--accent-soft);color:var(--accent-ink)`.
- **Botón "+" circular**: 30 px en Servicios, rota 45° (`landing:727-729`); 44 px en Equipo, rota 45° y pasa a `--primary` (`landing:744-747`); 30 px en FAQ, **no rota** (`landing:435`).
- **Avatares**: sólo uno, tipográfico — "LS" 40 px en la cabecera del chat (`landing:275`). No hay avatares fotográficos.
- **Separadores**: `border-top:1px solid rgba(255,255,255,.24)` en las cifras del hero (`landing:131`); `border-top:1px solid var(--border)` en panel de servicio (`160`), botón de servicio (`172`), panel de equipo (`233`), pie del chat (`288`), rejilla FAQ (`430`) y barra legal (`467`); `border-bottom:1px solid var(--border)` en la cabecera (`77`), la cabecera del chat (`274`) y cada `<details>` (`432`).
- **Radios**: 22 px (chat `273`, formulario `354`), 20 px (servicios `150`, equipo `219`, galería `332`, urgencias de contacto `399`, mapa `407`), 18 px (panel del selector `480`), 16 px (campañas `193`), 12 px (controles del formulario `368/371/375/378/387`, botón hamburguesa `697`, botones de paleta `817`), 11–12 px (cuadros de logo `448` / `80`), 30 px (tags de equipo `244`), 999 px (píldoras y CTA), 50 % (puntos, avatar, botones circulares).
- **Sombras**: sólo `var(--shadow-sm)`, `var(--shadow)` y dos literales del hero — `0 12px 30px rgba(0,0,0,.28)` en el CTA (`landing:126`) y los `text-shadow` de `h1`/`p` (`landing:123-124`).
- **Iconografía**: **cero SVG en todo el fichero**. Todos los "iconos" son caracteres de texto (`✓`, `+`, `→`, `←`, `★`) o formas CSS (cruz del logo `landing:81-82` y `449-450`, disco cónico `landing:498`, puntos circulares).
- **`style-hover`**: 24 usos, en las líneas `92, 94, 97, 110, 112, 126, 127, 150, 189, 193, 219, 261, 262, 292, 306, 325, 326, 334, 393, 404, 461, 470, 471, 472`.

---

## 16. Hallazgos

1. **`servicios`: el hint dice 6 y el array real tiene 12** (`landing:149` vs. `landing:508-557`). El propio copy de la sección dice "Doce especialidades" (`landing:146`): 12 es el número correcto y el hint es el que engaña.
2. **`galeria`: el hint dice 5 y el array real tiene 9** (`landing:331` vs. `landing:580-590`).
3. **`faq`: el hint dice 5 y el array real tiene 6** (`landing:431` vs. `landing:592-599`).
4. **`mensajes` del chat: el hint dice 2 y el estado inicial real tiene 1** (`landing:283` vs. `landing:621`).
5. **`opciones` del chat: el hint dice 3, pero el conteo real varía por paso**: 4 (`servicio`), 3, 3, 3 y 0 en `nombre`, que muestra input en vez de botones (`landing:291` vs. `landing:609-613`).
6. **Las otras 12 listas sí coinciden hint = real**: `navPrincipal` (7, en sus dos usos), `cifras` (4), `s.incluye` (3), `campanas` (3), `equipo` (6), `p.tags` (3), `ventajasReserva` (3), `datosContacto` (4), `columnasPie` (3), `col.enlaces` (4), `paletas` (4). Detalle en §13.
7. **Las imágenes de Campañas (`landing:194`) y Galería (`landing:334`) no declaran `width`/`height`**, a diferencia de Servicios (800×500, `landing:152`) y Equipo (800×600, `landing:221`). El `aspect-ratio` del contenedor mitiga el CLS, pero la declaración intrínseca falta.
8. **Los paneles plegados de Servicios y Equipo siguen en el árbol de accesibilidad**: `panel()` sólo aplica `maxHeight:'0px'` + `opacity:0` + `overflow:hidden` (`landing:652-655`); no hay `hidden`, `inert` ni `display:none`, así que el contenido cerrado sigue siendo enfocable y legible por lector de pantalla.
9. **El botón hamburguesa mantiene `aria-label="Abrir menú"` aunque el menú esté abierto** (`landing:100`); sólo `aria-expanded` es dinámico. Equipo sí alterna el `aria-label` (`landing:742`), así que el patrón existe en el fichero pero no se aplica aquí.
10. **Ningún control desplegable declara `aria-controls`** ni los paneles tienen `id`: menú móvil (`landing:100` → `107`), servicios (`landing:172` → `159`), equipo (`landing:229` → `232`), selector de paleta (`landing:497` → `479`).
11. **El botón del selector de paleta no tiene `aria-expanded`** (`landing:497`), y los botones de paleta no tienen `aria-pressed` ni `role="radio"`: la selección activa sólo se comunica visualmente (`landing:816-820`).
12. **El breakpoint escritorio/móvil es JavaScript, no CSS**: `esMovil = s.ancho < 1120` (`landing:685`), con estado inicial `ancho:1280` (`landing:623`). Hasta que `componentDidMount` ejecuta `medir()` (`landing:631`), el primer pintado asume escritorio.
13. **El `href` de urgencias está hardcodeado a `tel:+34640221190` en cinco puntos** (`landing:73`, `113`, `127`, `404`, `805`), mientras el texto visible sale de la prop `telefonoUrgencias` (`landing:691`). Cambiar la prop desincroniza texto y enlace.
14. **La respuesta de FAQ sobre urgencias repite "640 22 11 90" como literal dentro del dato** (`landing:596`), fuera del sistema de props.
15. **Los tres enlaces legales del pie apuntan a `#faq`**: "Aviso legal", "Privacidad" y "Cookies" (`landing:470-472`). Son marcadores de posición, no destinos legales.
16. **La casilla de consentimiento del formulario menciona la política de privacidad sin enlazarla** (`landing:391`).
17. **El formulario de contacto no tiene `action` ni `method`** y su `onSubmit` sólo hace `preventDefault()` y conmuta estado (`landing:364`, `landing:785`): es una maqueta sin backend, igual que el chat, que lo declara explícitamente (`landing:311`).
18. **Ningún control del formulario tiene `id`/`for`**: dependen del anidamiento dentro del `<label>` (`landing:367-392`). Las 5 opciones del `<select name="motivo">` están escritas a mano en el HTML (`landing:379-383`) y no en ningún array de datos.
19. **El bloque de confirmación del formulario y el hilo del chat no tienen `aria-live`/`role="status"`** (`landing:356`, `landing:282`): el cambio de estado no se anuncia.
20. **El "+" de la FAQ no cambia al abrir** (`landing:435`): no existe ninguna regla `details[open]`. En Servicios y Equipo sí rota 45° (`landing:729`, `landing:747`).
21. **El acordeón de la FAQ es exclusivo por el atributo `name="faq"` de `<details>`** (`landing:432`), función nativa reciente; en navegadores sin soporte se abrirán varios paneles a la vez.
22. **La pista de la galería no tiene rol, `tabindex` ni etiqueta** (`landing:330`), y `desplazarGaleria` no deshabilita los botones en los extremos (`landing:678-684`): al final del carrusel el botón "→" queda sin efecto pero sigue activo.
23. **El hero usa `background-image` en lugar de `<img>`** (`landing:118`): no hay `alt`, ni `fetchpriority`, ni `srcset`; se pide un único archivo de 1800 px de ancho.
24. **No existe enlace de navegación a `#galeria`** ni en el nav de escritorio ni en el móvil (`landing:702-710`); sólo aparece en la columna "Clínica" del pie (`landing:799`).
25. **La paleta `clinica` no tiene selector propio**: es el `:root` base (`landing:18-25`), mientras `aplicarTema` escribe `data-tema="clinica"` (`landing:645`), atributo que no casa con ninguna regla.
26. **La muestra de color 1 de la paleta `calida` (`#D97706`, `landing:603`) no coincide con su `--primary` real (`#B45309`, `landing:29`)**.
27. **`localStorage['vls-tema']` tiene prioridad sobre la prop `tema` del editor** (`landing:628-630`): un tema guardado en el navegador ignora lo elegido en el panel de propiedades. Lecturas y escrituras van en `try/catch` para navegación privada (`landing:628`, `landing:644`).
28. **`style-hover` no es CSS inline**: `support.js:428-431` lo convierte en una clase generada y `support.js:1583` marca sus declaraciones con `importantify`, de modo que los estados hover ganan a cualquier `style` inline. Hay 24 usos en el fichero (§15).
29. **Imágenes reutilizadas entre secciones** (mismo id de Pexels en huecos distintos): `1108099` en el hero (`landing:118`) y en la galería (`landing:581`); `6235241` en Servicios (`landing:509`) y en Equipo (`landing:575`); `4269363` en Servicios (`landing:525`) y en Equipo (`landing:560`); `6816858` en Servicios (`landing:529`) y en Equipo (`landing:566`); `4498185` en Servicios (`landing:537`) y en Equipo (`landing:572`); `6235233` en Servicios (`landing:513`) y en Campañas (`landing:733`); `220938` en Servicios (`landing:533`) y en Campañas (`landing:734`); `733416` en Galería (`landing:585`) y en Campañas (`landing:735`).
30. **La barra de urgencias no es pegajosa** (`landing:67`, sin `position`), mientras la cabecera sí lo es (`position:sticky;top:0;z-index:60`, `landing:77`). El `scroll-padding-top:88px` de `landing:51` está calibrado sólo para la cabecera.
31. **Los datos de contacto de la tarjeta del mapa no son accionables**: dirección, teléfonos y email se pintan como `<div>` de texto (`landing:413-414`), sin `tel:`, `mailto:` ni enlace de "cómo llegar", pese a que el pie sí los enlaza (`landing:804-806`).
32. **La píldora de estado de campañas usa el mismo par de colores para "Activa" y "Plazas limitadas"** (`landing:197`): no hay variante cromática por estado.
33. **La sección Campañas rompe la escala del resto**: su `h2` es `clamp(26px,3.6vw,40px)` (`landing:187`) frente al `clamp(28px,4.2vw,46px)` de Servicios, Equipo, Reservar, Galería, Contacto y FAQ (`landing:145, 213, 258, 321, 349, 428`), y sus paddings verticales son `clamp(56px,8vw,90px)` frente a `clamp(64px,9vw,104px)` (`landing:183`).
34. **No hay ningún SVG en el fichero**: toda la iconografía es texto (`✓ + → ← ★`) o formas CSS (cruz del logo `landing:81-82`, disco cónico `landing:498`).
35. **El `<head>` no lleva metadatos de SEO ni sociales**: no consta `meta description`, `og:*`, `twitter:*`, `canonical` ni JSON-LD en `landing:10-62`.
36. **El enlace de urgencias del menú móvil no cierra el menú**: los demás enlaces llevan `onClick="{{ cerrarMenu }}"` (`landing:110`, `112`), pero el CTA de urgencias no (`landing:113`).

**Total: 36 hallazgos.**
