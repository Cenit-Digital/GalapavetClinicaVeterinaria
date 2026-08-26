# Análisis de anatomía — las tres subpáginas del diseño

Fecha: 2026-08-26 · Autor: subagente de análisis (solo lectura)

## 0. Alcance, fuentes y método

Ficheros leídos íntegros, incluido el `<script type="text/x-dc">` final con los arrays de datos:

- `docs/diseno-claude-design/Tienda.dc.html` — 308 líneas
- `docs/diseno-claude-design/Campanas.dc.html` — 339 líneas
- `docs/diseno-claude-design/Blog.dc.html` — 383 líneas

Fuente de contraste para la sección 5 (qué comparten con el landing y dónde divergen):

- `docs/diseno-claude-design/Veterinaria La Sierra.dc.html` — leídas las zonas de cabecera (60-135), pie y selector de paleta (440-505) y datos (601-620, 690-720, 790-830).

Regla aplicada: **todo conteo de lista procede del array de datos del `<script>`, no del atributo `hint-placeholder-count`**, que es una mera pista del editor. En la sección 4 se tabulan hint vs. conteo real. Cuando un dato no aparece en la fuente se escribe **NO CONSTA EN LA FUENTE**.

Todas las citas siguen el formato `fichero:línea`. Rutas relativas a `docs/diseno-claude-design/`.

---

## 1. Tienda.dc.html

### 1.1 Envoltorio, `<helmet>` y hoja de estilo

| Elemento | Cita | Valor literal |
|---|---|---|
| `<title>` | `Tienda.dc.html:12` | `Tienda — Veterinaria La Sierra` |
| Preconnect fuentes | `Tienda.dc.html:13-14` | `fonts.googleapis.com`, `fonts.gstatic.com` (crossorigin) |
| Familias | `Tienda.dc.html:15` | `Outfit` 400;500;600;700 + `DM Sans` opsz 9..40 en 400;500;700, `display=swap` |
| Tokens base `:root` | `Tienda.dc.html:17-24` | `--bg:#F8FAFC; --bg-2:#EDF2F9; --card:#FFFFFF; --surface:#FBFDFF; --border:rgba(15,32,60,.13); --ink:#0B1B33; --text:#3C4C66; --muted:#5E6E88; --primary:#1E40AF; --on-primary:#FFFFFF; --accent:#10B981; --accent-ink:#047857; --accent-soft:#E7F8F1; --urg:#DC2626; --shadow:0 18px 45px rgba(15,32,60,.10); --shadow-sm:0 6px 18px rgba(15,32,60,.07)` |
| Paleta `calida` | `Tienda.dc.html:25` | una sola línea comprimida, `--primary:#B45309`, `--accent:#4D7C0F`, `--urg:#C2410C` |
| Paleta `tech` | `Tienda.dc.html:26` | `--bg:#0F172A`, `--primary:#06B6D4`, `--on-primary:#04212B`, `--urg:#F87171` |
| Paleta `eco` | `Tienda.dc.html:27` | `--bg:#FFFFFF`, `--primary:#047857`, `--accent-soft:#D6FBEA` |
| Reset | `Tienda.dc.html:28-35` | `*{box-sizing:border-box}`, `html{scroll-behavior:smooth;scroll-padding-top:88px}`, `body{margin:0;background:var(--bg);color:var(--text);font-family:'DM Sans',system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}`, `img{max-width:100%}`, `p{text-wrap:pretty}`, `a{color:var(--primary);text-decoration:none;transition:color .3s ease}`, `a:hover{color:var(--accent-ink)}`, `input,select,textarea,button{font:inherit}` |
| Animación | `Tienda.dc.html:36` | `@keyframes vlsPulso{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.78)}}` — **declarada pero nunca usada en esta página** (no hay ninguna referencia a `vlsPulso` fuera de la línea 36) |
| Movimiento reducido | `Tienda.dc.html:37` | `@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{animation-duration:.01ms !important;transition-duration:.01ms !important}}` |
| Contenedor raíz | `Tienda.dc.html:41` | `background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden` |
| Props del editor | `Tienda.dc.html:174` | solo `{"$preview":{"width":1280}}` |

### 1.2 Estructura DOM por secciones

```
div raíz (41)
├── header sticky (43-65)
│   ├── a logotipo (45-54)
│   ├── nav principal (55-59)  ← sc-for navPrincipal
│   └── button Cesta (60-63)
├── section cabecera de página (67-73)
│   ├── nav migas «Ruta» (69)
│   ├── h1 (70)
│   └── p entradilla (71)
├── section filtros de categoría (75-81)  ← sc-for categorias
├── section rejilla de productos (83-105)  ← sc-for productos
├── section garantías (107-116)  ← sc-for garantias
├── sc-if carritoAbierto → cajón lateral de cesta (118-157)
└── footer (159-170)
```

No hay `<main>`, ni `id` de sección, ni `data-screen-label` en toda la página (0 coincidencias de `data-screen-label`, 0 de ` id="`).

### 1.3 Cabecera (`Tienda.dc.html:43-65`)

- `<header>`: `position:sticky;top:0;z-index:60;background:color-mix(in srgb, var(--bg) 88%, transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--border)` (`43`).
- Fila interior: `max-width:1220px;margin:0 auto;padding:12px clamp(16px,4vw,28px);display:flex;align-items:center;justify-content:space-between;gap:14px` (`44`). **`gap:14px`**, frente a `16px` en Campañas, Blog y el landing.
- Logotipo (`45-54`): enlaza a `./Veterinaria%20La%20Sierra.dc.html`. Isotipo = cuadrado `38×38`, `border-radius:12px`, `background:var(--primary)` (`46`) con dos barras absolutas que forman una cruz: `17px×4.5px` (`47`) y `4.5px×17px` (`48`), ambas `border-radius:3px;background:var(--on-primary)`.
- Rótulo: `Veterinaria La Sierra` en `'Outfit'` 600 / `17px` / `letter-spacing:-.01em` (`51`) y bajorótulo **`Tienda de la clínica`** en `10.5px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);font-weight:600` (`52`).
- `<nav aria-label="Navegación principal">` con estilo calculado `{{ estiloNav }}` (`55`) = `{display: esMovil ? 'none' : 'flex', alignItems:'center', gap:'2px'}` (`249`).
- Enlaces de nav (`57`): `padding:9px 11px;border-radius:999px;font-size:14px;font-weight:500;color:var(--text);white-space:nowrap;transition:background .3s ease`, hover `background:var(--accent-soft);color:var(--accent-ink)`.
- Botón **Cesta** (`60-63`): `display:inline-flex;align-items:center;gap:9px;min-height:44px;padding:11px 18px;border-radius:999px;border:1.5px solid var(--border);background:var(--card);color:var(--ink);font-size:14px;font-weight:600;cursor:pointer;flex-shrink:0;transition:border-color .3s ease`, hover `border-color:var(--primary)`, `aria-label="Ver la cesta"`. Sin `aria-expanded` ni `aria-controls`.
- Contador (`62`): estilo calculado en `259-262` = `minWidth:24px;height:24px;padding:0 7px;borderRadius:999px;fontSize:12.5px;fontWeight:700;display:inline-flex;alignItems:center;justifyContent:center`, con `background:'var(--primary)'` y `color:'var(--on-primary)'` cuando `unidades > 0`, y `background:'var(--bg-2)'` / `color:'var(--muted)'` cuando es 0.

### 1.4 Cabecera de página (`Tienda.dc.html:67-73`)

- `<section style="padding:clamp(44px,6vw,76px) clamp(18px,5vw,28px) clamp(24px,3vw,36px)">` (`67`); interior `max-width:1220px;margin:0 auto` (`68`).
- Migas: `<nav style="font-size:13px;color:var(--muted);margin-bottom:18px" aria-label="Ruta">` con `Inicio` → `./Veterinaria%20La%20Sierra.dc.html` y separador ` · ` y `Tienda` en `color:var(--ink);font-weight:600` (`69`).
- `h1` (`70`): `font-family:'Outfit',sans-serif;font-size:clamp(30px,5vw,54px);line-height:1.06;letter-spacing:-.02em;font-weight:600;color:var(--ink);margin:0;max-width:19ch`. Texto literal: `Solo vendemos lo que recetamos`.
- Entradilla (`71`): `font-size:17.5px;line-height:1.7;color:var(--muted);max-width:60ch;margin:18px 0 0`. Texto: `Catálogo corto y elegido por el equipo clínico. Reservas online y recoges en la clínica; si vives en el municipio, te lo acercamos sin coste.`
- **No hay kicker/eyebrow** sobre el h1 (Campañas sí lo tiene, `Campanas.dc.html:74`).

### 1.5 Filtros (`Tienda.dc.html:75-81`)

- Sección: `padding:0 clamp(18px,5vw,28px) clamp(20px,3vw,30px)` (`75`); contenedor `max-width:1220px;margin:0 auto;display:flex;flex-wrap:wrap;gap:9px` (`76`).
- `sc-for list="{{ categorias }}"` con `hint-placeholder-count="5"` (`77`) y un `<button type="button" onClick="{{ c.elegir }}" style="{{ c.estilo }}">{{ c.nombre }}</button>` (`78`).
- Estilo calculado (`271-276`): `padding:10px 18px;borderRadius:999px;minHeight:44px;cursor:pointer;fontSize:13.5px;fontWeight:600;transition:'background .3s ease, color .3s ease, border-color .3s ease'`; activo → `background:var(--primary);color:var(--on-primary);border:1px solid var(--primary)`; inactivo → `background:var(--card);color:var(--text);border:1px solid var(--border)`.
- La lista **no es un array literal**: se deriva en `239` con `['Todo'].concat(PRODUCTOS.map(p=>p.categoria).filter((c,i,a)=>a.indexOf(c)===i))`.
- Ni `aria-pressed`, ni `role="tablist"`, ni `<fieldset>`: son botones sueltos sin estado expuesto a la API de accesibilidad.

### 1.6 Tarjeta de producto (`Tienda.dc.html:83-105`)

- Sección: `padding:0 clamp(18px,5vw,28px) clamp(56px,8vw,90px)` (`83`).
- Rejilla (`84`): `max-width:1220px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:22px`.
- `<article>` (`86`): `display:flex;flex-direction:column;background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);transition:transform .3s ease,box-shadow .3s ease`; `style-hover="transform:translateY(-4px);box-shadow:var(--shadow)"`.
- Marco de imagen (`87`): `position:relative;aspect-ratio:4/3;background:var(--bg-2);overflow:hidden`. **Relación de aspecto 4:3.**
- `<img>` (`88`): `loading="lazy"`, `display:block;width:100%;height:100%;object-fit:cover`; `src` = `PX(p.img, 700)` (`282`) → `https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w=700` (`175`).
- Etiqueta condicional: `sc-if value="{{ p.tieneEtiqueta }}"` (`89`, hint `false`); `tieneEtiqueta = !!p.etiqueta` (`283`). Estilo (`90`): `position:absolute;right:14px;top:14px;padding:5px 12px;border-radius:999px;background:var(--accent-ink);color:#fff;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase`. Esquina **superior derecha** (en Campañas el badge va a la izquierda).
- Cuerpo (`93`): `display:flex;flex-direction:column;flex:1;padding:18px 20px 20px`.
- Categoría (`94`): `font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-ink)`.
- `h2` (`95`): `font-family:'Outfit',sans-serif;font-size:18px;font-weight:600;line-height:1.2;color:var(--ink);margin:8px 0 0`.
- Descripción (`96`): `font-size:13.5px;line-height:1.6;color:var(--muted);margin:7px 0 16px`.
- Pie de tarjeta (`97`): `display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:14px;border-top:1px solid var(--border)`.
- Precio (`98`): `font-family:'Outfit',sans-serif;font-size:22px;font-weight:600;color:var(--ink)`, formateado con `EUR()` (`176`) → `n.toFixed(2).replace('.', ',') + ' €'`.
- Botón añadir (`99`), estilo calculado en `286-291`: `minHeight:44px;padding:11px 18px;borderRadius:999px;cursor:pointer;fontSize:13.5px;fontWeight:700;whiteSpace:nowrap;transition:'background .3s ease, color .3s ease'`; con `n>0` → `border:1px solid var(--accent-ink);background:var(--accent-soft);color:var(--accent-ink)`; con `n===0` → `border:1px solid var(--primary);background:var(--primary);color:var(--on-primary)`.
- Rótulo del botón (`284`): `n > 0 ? 'En la cesta · ' + n : 'Añadir'`.

### 1.7 Garantías (`Tienda.dc.html:107-116`)

- Sección `padding:0 clamp(18px,5vw,28px) clamp(64px,9vw,100px)` (`107`); rejilla `repeat(auto-fit,minmax(min(240px,100%),1fr));gap:18px` (`108`).
- Tarjeta (`110`): `background:var(--bg-2);border-radius:18px;padding:22px 24px` — **sin borde y sin sombra**, a diferencia de las de producto.
- Título (`111`): `font-family:'Outfit',sans-serif;font-size:17px;font-weight:600;color:var(--ink)`. Texto (`112`): `font-size:14px;line-height:1.65;color:var(--muted);margin-top:7px`.
- Datos en `205-209`: 3 elementos (`Elegido por el equipo clínico`, `Recogida en clínica en 24 h`, `Dietas con seguimiento`). Sin iconografía.

### 1.8 Cajón de cesta (`Tienda.dc.html:118-157`)

- `sc-if value="{{ carritoAbierto }}"` (`118`, hint `false`); contenedor `position:fixed;inset:0;z-index:80;display:flex;justify-content:flex-end` (`119`).
- Velo: `<button>` a pantalla completa `position:absolute;inset:0;border:none;background:rgba(6,16,32,.45);cursor:pointer` con `aria-label="Cerrar la cesta"` (`120`).
- Panel `<aside>` (`121`): `position:relative;width:min(420px,100%);height:100%;background:var(--card);border-left:1px solid var(--border);box-shadow:var(--shadow);display:flex;flex-direction:column`. **Sin `role="dialog"`, sin `aria-modal`, sin trampa de foco, sin cierre con `Esc`** (NO CONSTA EN LA FUENTE ningún manejador de teclado).
- Cabecera del cajón (`122`): `padding:20px 22px;border-bottom:1px solid var(--border)`; título `Tu cesta` en `'Outfit'` 600/19px (`123`); botón cerrar `40×40`, `border-radius:50%`, `border:1px solid var(--border);background:var(--surface);color:var(--ink);font-size:16px` con glifo `✕` (`124`).
- Cuerpo desplazable (`127`): `flex:1;overflow-y:auto;padding:18px 22px;display:flex;flex-direction:column;gap:14px`.
- **Estado vacío** (`128-130`): `sc-if value="{{ cestaVacia }}"` con hint `true`; `cestaVacia = ids.length === 0` (`266`). Párrafo `font-size:14.5px;line-height:1.7;color:var(--muted);margin:12px 0 0` con el texto `Todavía no has añadido nada. Elige productos del catálogo y aquí verás el resumen para recoger en la clínica.` (`129`). **Es el único estado vacío de las tres páginas.**
- Línea de cesta (`131-144`): fila `display:flex;gap:13px;align-items:center` (`132`); miniatura `width:62px;height:62px;border-radius:12px;object-fit:cover;flex-shrink:0` → **relación 1:1**, `src = PX(p.img, 200)` (`296`), **sin `loading="lazy"`** (`133`); nombre `14.5px/600/var(--ink)` (`135`); línea `{{ l.precio }} · {{ l.subtotal }}` en `13px/var(--muted)` (`136`); controles `−` / contador / `+` en círculos de `34×34` con `border:1px solid var(--border);background:var(--surface)` y `aria-label` propios (`139-141`).
- Pie del cajón (`147-154`): `padding:18px 22px 22px;border-top:1px solid var(--border);background:var(--surface)`; fila total `display:flex;align-items:baseline;justify-content:space-between;margin-bottom:14px` (`148`); rótulo `Total estimado` en `14px/var(--muted)` (`149`); importe en `'Outfit'` 600/`26px`/`var(--ink)` (`150`).
- CTA (`152`): `<a href="./Veterinaria%20La%20Sierra.dc.html#contacto">` con `display:flex;align-items:center;justify-content:center;min-height:50px;padding:15px;border-radius:999px;background:var(--primary);color:var(--on-primary);font-weight:700;font-size:15px`, hover `filter:brightness(1.1)`. Texto: `Reservar y recoger en clínica`. **No hay checkout**: el flujo termina en el ancla de contacto del landing.
- Descargo (`153`): `Demostración: no se procesa ningún pago. Te confirmamos disponibilidad por teléfono.`

### 1.9 Pie (`Tienda.dc.html:159-170`)

- `<footer style="background:var(--card);border-top:1px solid var(--border);padding:clamp(40px,6vw,60px) clamp(18px,5vw,28px) 26px">` (`159`).
- Fila única (`160`): `max-width:1220px;margin:0 auto;display:flex;flex-wrap:wrap;gap:20px 32px;align-items:center;justify-content:space-between`.
- Marca en texto (`161`), sin isotipo. Enlaces (`163-166`): `Inicio`, `Blog`, `Campañas`, `Contacto` — cada uno `color:var(--muted)` con hover `color:var(--primary)`.
- Copyright (`168`): `© 2026 · Ctra. de la Sierra 42, Miraflores de la Sierra` en `12.5px/var(--muted)`.

### 1.10 Comportamiento interactivo (script `Tienda.dc.html:174-306`)

| Comportamiento | Cita | Detalle |
|---|---|---|
| Estado inicial | `212` | `{ categoria:'Todo', cesta:{}, carritoAbierto:false, ancho:1280 }` |
| Lectura de tema | `215-217` | lee `localStorage.getItem('vls-tema')` dentro de `try/catch` y hace `document.documentElement.setAttribute('data-tema', guardado \|\| 'clinica')`. **Nunca escribe** en `localStorage` |
| Medición responsive | `218-225` | `medir()` guarda `window.innerWidth`; alta y baja del listener `resize` (`220`, `223`) |
| Umbral móvil | `238` | `esMovil = s.ancho < 1080` |
| Alta/baja de unidades | `227-234` | `sumar(id, delta)`; `Math.max(0, …)`; si queda 0 se hace `delete cesta[id]` |
| Filtro | `240` | `visibles = PRODUCTOS.filter(p => s.categoria==='Todo' \|\| p.categoria===s.categoria)` |
| Totales | `242-246` | `unidades` = suma de cantidades; `total` = suma de `precio*cantidad` |
| Abrir/cerrar cesta | `263-264` | `alternarCarrito`, `cerrarCarrito` |
| Formato de precio | `176` | `EUR(n)` → coma decimal + ` €` |
| Constructor de imagen | `175` | `PX(id,w)` → URL de Pexels con `auto=compress&cs=tinysrgb&w={w}` |

**Ausencias interactivas verificadas:** no hay botón de menú móvil, no hay panel móvil, no hay CTA de reserva en cabecera, no hay selector de paleta, no hay barra superior de urgencias, no hay ningún `tel:` ni `mailto:` en toda la página, no hay paginación ni «cargar más». NO CONSTA EN LA FUENTE ningún control de ordenación, búsqueda ni rango de precio.

### 1.11 Conteos reales (array `PRODUCTOS`, `Tienda.dc.html:178-203`)

**12 productos.** Orden e identificadores:

| # | `id` | Categoría | Precio | Etiqueta | Pexels `img` | Línea |
|---|---|---|---|---|---|---|
| 1 | `pienso-adulto` | Alimentación | 62.9 | `Más vendido` | 1490908 | `179-180` |
| 2 | `humedo-gato` | Alimentación | 21.5 | *(vacía)* | 209037 | `181-182` |
| 3 | `renal` | Dietas veterinarias | 74.0 | `Con receta` | 733416 | `183-184` |
| 4 | `articular` | Dietas veterinarias | 38.9 | *(vacía)* | 1938126 | `185-186` |
| 5 | `pipetas` | Antiparasitarios | 34.5 | `Campaña` | 2253275 | `187-188` |
| 6 | `collar` | Antiparasitarios | 29.9 | *(vacía)* | 58997 | `189-190` |
| 7 | `cepillo` | Higiene | 14.9 | *(vacía)* | 220938 | `191-192` |
| 8 | `champu` | Higiene | 18.4 | *(vacía)* | 2607544 | `193-194` |
| 9 | `transportin` | Accesorios | 44.0 | *(vacía)* | 617278 | `195-196` |
| 10 | `arnes` | Accesorios | 27.5 | *(vacía)* | 356378 | `197-198` |
| 11 | `juguete` | Accesorios | 12.9 | *(vacía)* | 1108099 | `199-200` |
| 12 | `feromonas` | Higiene | 32.0 | *(vacía)* | 1741205 | `201-202` |

- **Etiquetas reales: 3 de 12** (`Más vendido`, `Con receta`, `Campaña`); las otras 9 llevan `etiqueta: ''` y por tanto no pintan el badge (`283`, `89`).
- **Categorías derivadas: 6 botones** = `Todo` + `Alimentación`, `Dietas veterinarias`, `Antiparasitarios`, `Higiene`, `Accesorios` (`239`).
- Reparto por categoría: Alimentación 2, Dietas veterinarias 2, Antiparasitarios 2, Higiene **3** (`cepillo`, `champu`, `feromonas`), Accesorios **3**.
- `GARANTIAS`: **3** (`205-209`).
- `lineas` en el arranque: **0** (`cesta:{}` en `212`, mapeo en `294-299`).
- `navPrincipal`: **5** (`250-256`): Servicios, Campañas, Blog, Contacto, Reservar.

---

## 2. Campanas.dc.html

### 2.1 Envoltorio y estilos

- `<title>Campañas de salud — Veterinaria La Sierra</title>` (`Campanas.dc.html:12`).
- Bloque `<style>` **byte a byte idéntico** al de Tienda: mismos tokens (`17-27`) y mismo reset (`28-37`). Aquí `vlsPulso` (`36`) **sí se usa**, en el punto pulsante de la píldora de urgencias (`60`).
- Props del editor: solo `{"$preview":{"width":1280}}` (`204`).

### 2.2 Estructura DOM por secciones

```
div raíz (41)
├── header sticky (43-66)
│   ├── a logotipo (45-54)
│   ├── nav (55-63) → sc-for navPrincipal + píldora Urgencias + píldora Tienda
│   └── a CTA móvil «Reservar» (64)
├── sc-if enListado (69-103)                  ← VISTA A
│   ├── section cabecera con fondo bg-2 (71-78): migas, kicker, h1, entradilla
│   └── section rejilla de campañas (80-101)  ← sc-for campanas
├── sc-if enFicha (106-187)                   ← VISTA B
│   ├── section hero de ficha (108-114)
│   ├── section cuerpo 2 columnas (116-168)
│   │   ├── columna principal: entradilla, cuerpo, «Qué incluye» (ul), «Cómo funciona» (ol), «Para quién es», letra pequeña
│   │   └── aside sticky con la tarjeta de precio (149-166)
│   └── section «Otras campañas abiertas» (170-185) ← sc-for otras
└── footer (189-200)
```

Las dos vistas son **mutuamente excluyentes** (`enListado: !ficha` / `enFicha: !!ficha`, `310-311`). Hay dos `<h1>` en el fichero (`75` y `112`) pero nunca coexisten en el DOM.

### 2.3 Cabecera (`Campanas.dc.html:43-66`)

Idéntica a Tienda en el `<header>` (`43`) salvo:

- Fila interior con `gap:16px` (`44`), no 14.
- Bajorótulo: **`Campañas de salud`** (`52`).
- Tras el `sc-for` de nav hay dos elementos fijos:
  - Píldora **Urgencias** (`59-61`): `<a href="tel:+34640221190">` con `display:inline-flex;align-items:center;gap:7px;margin-left:6px;padding:9px 15px;border-radius:999px;background:var(--urg);color:#fff;font-size:13.5px;font-weight:700;white-space:nowrap`, hover `filter:brightness(1.08);color:#fff`; punto pulsante `width:7px;height:7px;border-radius:50%;background:#fff;animation:vlsPulso 1.6s ease-in-out infinite` (`60`).
  - Píldora **Tienda** (`62`): `<a href="./Tienda.dc.html">` con `margin-left:4px;padding:8px 15px;border-radius:999px;border:1.5px solid var(--border);color:var(--ink);font-size:13.5px;font-weight:600;white-space:nowrap`, hover `border-color:var(--primary)`.
- CTA móvil (`64`): `<a href="./Veterinaria%20La%20Sierra.dc.html#reservar" style="{{ estiloCtaMovil }}">Reservar</a>`; estilo en `298-300`: `display: esMovil ? 'inline-flex' : 'none'`, `minHeight:44px;padding:11px 20px;borderRadius:999px;background:var(--primary);color:var(--on-primary);fontWeight:700;fontSize:14px;whiteSpace:nowrap`.
- **No hay menú hamburguesa ni panel móvil**: por debajo de 1080 px solo quedan logotipo y el botón «Reservar».

### 2.4 Vista A — listado

**Cabecera de página (`71-78`).** Sección con **fondo diferenciado**: `padding:clamp(48px,7vw,84px) clamp(18px,5vw,28px) clamp(32px,4vw,48px);background:var(--bg-2)` (`71`) — es la única cabecera de las tres con fondo propio.

- Migas (`73`): mismo patrón que Tienda, con `Campañas` como hoja.
- Kicker (`74`): `font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent-ink);font-weight:700;margin:0 0 13px`, texto `Campañas`.
- `h1` (`75`): `font-family:'Outfit',sans-serif;font-size:clamp(30px,5vw,54px);line-height:1.06;letter-spacing:-.02em;font-weight:600;color:var(--ink);margin:0;max-width:18ch`. Texto: `Prevenir cuesta menos que curar`.
- Entradilla (`76`): `font-size:17.5px;line-height:1.7;color:var(--muted);max-width:60ch;margin:18px 0 0`. Texto: `Cuatro campañas abiertas ahora mismo, con precio cerrado, plazas limitadas y todo incluido: sin sorpresas en la factura.` — **el número «Cuatro» está escrito a mano en la copia y coincide con las 4 del array (`207-267`)**.

**Tarjeta de campaña (`80-99`).**

- Sección `padding:clamp(36px,5vw,56px) clamp(18px,5vw,28px) clamp(64px,9vw,100px)` (`80`); rejilla `repeat(auto-fit,minmax(min(300px,100%),1fr));gap:24px` (`81`) — mínimo **300px** frente a los 260px de Tienda.
- `<article>` (`83`): igual que Tienda pero con `border-radius:22px` (Tienda usa 20px) y el mismo hover `translateY(-4px)`.
- Marco de imagen (`84`): `position:relative;aspect-ratio:16/9;background:var(--bg-2);overflow:hidden`. **Relación 16:9.**
- `<img loading="lazy">` (`85`) con `src = PX(c.img, 900)` (`321`).
- Badge de estado (`86`), estilo calculado en `323-326`: `position:absolute;left:16px;top:16px;padding:6px 13px;borderRadius:999px;fontSize:10.5px;fontWeight:700;letterSpacing:.1em;textTransform:uppercase`. **Depende de una comparación literal**: `c.estado === 'Activa'` → `background:'var(--accent-ink)'; color:'#fff'`; cualquier otro valor → `background:'var(--card)'; color:'var(--ink)'`. Esquina **superior izquierda**.
- Cuerpo (`88`): `display:flex;flex-direction:column;flex:1;padding:24px`.
- Vigencia (`89`): `font-size:12px;color:var(--muted)`.
- `h2` (`90`): `'Outfit'` 600/`24px`/`line-height:1.15`/`margin:8px 0 0`.
- Resumen (`91`): `font-size:15px;line-height:1.65;color:var(--muted);margin:10px 0 18px`.
- Bloque de precio (`92-95`): fila `display:flex;align-items:baseline;gap:10px;margin-top:auto;padding-top:16px;border-top:1px solid var(--border)`; precio en `'Outfit'` 600/**30px**/`color:var(--primary)`/`line-height:1` (`93`); precio anterior `font-size:13px;color:var(--muted);text-decoration:line-through` (`94`).
- CTA de tarjeta (`96`): `<button>` a ancho completo, `margin-top:16px;min-height:48px;padding:14px;border-radius:999px;border:none;background:var(--primary);color:var(--on-primary);font-weight:700;font-size:14.5px;cursor:pointer;transition:filter .3s ease`, hover `filter:brightness(1.1)`. Texto fijo: `Ver la ficha de la campaña`.

### 2.5 Vista B — ficha

**Hero (`108-114`).**

- `<section>` (`108`): `position:relative;min-height:clamp(320px,42vh,440px);display:flex;align-items:flex-end;background-color:#0B1B33;background-image:{{ fondoFicha }};background-size:cover;background-position:center 45%`.
- `fondoFicha` (`315-317`): `linear-gradient(180deg,rgba(6,16,32,.35) 0%,rgba(6,16,32,.82) 100%), url(PX(ficha.img, 1600))`; si no hay ficha, `'none'`. **Imagen de fondo, no `<img>`: sin `alt` y sin `loading`.** La relación de aspecto la fija el `min-height` + `cover`, no un `aspect-ratio`.
- Botón volver (`110`): `display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:10px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.14);backdrop-filter:blur(6px);color:#fff;font-size:13.5px;font-weight:600;cursor:pointer;margin-bottom:20px`. Texto `← Todas las campañas`.
- Píldora estado+vigencia (`111`): `padding:6px 13px;border-radius:999px;background:#fff;color:var(--urg);font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase`, contenido `{{ ficha.estado }} · {{ ficha.vigencia }}`. **Aquí el color es siempre `--urg`, sin la lógica condicional del badge del listado.**
- `h1` (`112`): `'Outfit'` 600/`clamp(30px,5.4vw,56px)`/`line-height:1.05`/`letter-spacing:-.02em`/`color:#fff`/`margin:16px 0 0`/`max-width:18ch`/`text-shadow:0 2px 22px rgba(0,0,0,.4)`.

**Cuerpo a dos columnas (`116-168`).**

- Sección `padding:clamp(40px,6vw,72px) clamp(18px,5vw,28px) clamp(64px,9vw,100px)` (`116`).
- Rejilla (`117`): `max-width:1220px;margin:0 auto;display:grid;grid-template-columns:{{ columnasFicha }};gap:clamp(28px,4vw,48px);align-items:start`; `columnasFicha` = `'1.6fr 1fr'` si `ancho >= 940`, si no `'1fr'` (`293`, `313`).
- Entradilla (`119`): `font-size:clamp(17px,2.2vw,20px);line-height:1.65;color:var(--ink);margin:0 0 26px;font-weight:500`.
- Cuerpo (`120`): `font-size:16px;line-height:1.8;color:var(--text);margin:0 0 34px` — **un solo párrafo por campaña**, no un array de bloques (a diferencia del Blog).
- `h2` «Qué incluye» (`122`) y lista (`123`): `list-style:none;margin:0 0 34px;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:12px`.
  - `<li>` (`125`): `display:flex;align-items:flex-start;gap:11px;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 16px;font-size:14.5px;line-height:1.55;color:var(--text)`; check (`126`): círculo `20×20`, `background:var(--accent-soft);color:var(--accent-ink);font-size:12px;font-weight:700;margin-top:1px`, glifo `✓`.
- `h2` «Cómo funciona» (`131`) y `<ol>` (`132`): `list-style:none;margin:0 0 34px;padding:0;display:flex;flex-direction:column;gap:14px;counter-reset:paso` — declara `counter-reset:paso` pero **la numeración se pinta a mano** desde el dato `p.n` (`135`), el contador CSS no se usa.
  - Numeral (`135`): círculo `32×32`, `background:var(--primary);color:var(--on-primary)`, `'Outfit'` 700/`14px`.
  - Título de paso (`137`): `font-weight:700;color:var(--ink);font-size:15.5px`; texto (`138`): `font-size:14.5px;line-height:1.65;color:var(--muted);margin-top:3px`.
- `h2` «Para quién es» (`144`) + párrafo `font-size:16px;line-height:1.8;color:var(--text);margin:0 0 24px` (`145`).
- Letra pequeña (`146`): `font-size:12.5px;line-height:1.7;color:var(--muted);margin:0;padding:16px 18px;background:var(--bg-2);border-radius:14px`.

**Tarjeta de precio en `<aside>` (`149-166`).**

- `estiloAside` (`314`): `{position:'sticky', top:'104px'}` si `ancho >= 940`, si no `{}`.
- Caja (`150`): `background:var(--card);border:1px solid var(--border);border-radius:22px;padding:26px;box-shadow:var(--shadow)`.
- Rótulo (`151`): `font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-ink);margin-bottom:12px`, texto `Precio de campaña`.
- Precio (`153`): `'Outfit'` 600/**46px**/`color:var(--ink)`/`line-height:1`; tachado (`154`): `font-size:15px;color:var(--muted);text-decoration:line-through`.
- Píldora de ahorro (`156`): `display:inline-block;margin-top:12px;padding:6px 12px;border-radius:999px;background:var(--accent-soft);color:var(--accent-ink);font-size:12.5px;font-weight:700`.
- `<dl>` (`157-161`): `display:grid;grid-template-columns:auto 1fr;gap:10px 14px;margin:22px 0;padding:20px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border);font-size:14px`; tres pares: `Vigencia`, `Duración`, `Plazas`.
- CTA primario (`162`): `<a href="./Veterinaria%20La%20Sierra.dc.html#reservar">`, `min-height:52px;padding:15px;border-radius:999px;background:var(--primary);color:var(--on-primary);font-weight:700;font-size:15.5px`.
- CTA secundario (`163`): `<a href="tel:+34918442160">` con `min-height:48px;margin-top:10px;padding:13px;border-radius:999px;border:1.5px solid var(--border);color:var(--ink);font-weight:600;font-size:14.5px`; texto `Llamar al 918 44 21 60`.
- Descargo (`164`): `Sin pago por adelantado. Confirmamos la hora por WhatsApp.`

**«Otras campañas abiertas» (`170-185`).**

- `h2` (`172`): `'Outfit'` 600/`24px`/`margin:0 0 20px`.
- Rejilla (`173`): `repeat(auto-fit,minmax(min(240px,100%),1fr));gap:16px`.
- Cada item es un `<button>` (`175`): `display:flex;gap:14px;align-items:center;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:12px;cursor:pointer;transition:border-color .3s ease`, hover `border-color:var(--primary)`.
- Miniatura (`176`): `width:74px;height:66px;flex-shrink:0;border-radius:11px;object-fit:cover`, `loading="lazy"`, `src = PX(c.img, 300)` (`331`). **Relación fija ≈ 37:33 (1,12:1)**, distinta del 16:9 de la tarjeta grande.
- Título (`178`): `'Outfit'` 600/`16px`/`line-height:1.2`; línea secundaria `{{ o.precio }} · {{ o.vigencia }}` en `13px/var(--muted)` (`179`).

### 2.6 Pie (`Campanas.dc.html:189-200`)

Idéntico en estilos al de Tienda (`189-190` = `159-160`), pero el juego de enlaces es **`Inicio`, `Blog`, `Tienda`, `Contacto`** (`193-196`): cambia `Campañas` por `Tienda`, porque Campañas es la página actual.

### 2.7 Comportamiento interactivo (script `Campanas.dc.html:204-337`)

| Comportamiento | Cita | Detalle |
|---|---|---|
| Estado | `270` | `{ activa: null, ancho: 1280 }` |
| Tema | `272-275` | lee `localStorage['vls-tema']`, aplica `data-tema`; **no escribe** |
| Responsive | `276-283` | `medir()` + listener `resize`, baja en `281` |
| Umbrales | `292-293` | `esMovil = ancho < 1080`; `ancha = ancho >= 940` |
| Abrir ficha | `285-288` | `abrir(id)` → `setState({activa:id})` + `window.scrollTo({top:0,behavior:'smooth'})` |
| Volver | `318` | `setState({activa:null})` + scroll suave arriba |
| Selección de ficha | `294` | `CAMPANAS.find(c => c.id === s.activa) \|\| null` |
| Otras campañas | `329-332` | `CAMPANAS.filter(c => !ficha \|\| c.id !== ficha.id)` |

**Notas de comportamiento:** el cambio listado↔ficha es puramente estado de cliente: **no hay cambio de URL, ni `history.pushState`, ni ancla**; recargar devuelve siempre al listado. Tampoco hay `aria-live` ni gestión de foco tras el intercambio de vistas. No hay paginación ni filtro por estado. **No existe ningún estado vacío** en esta página: NO CONSTA EN LA FUENTE.

### 2.8 Conteos reales (array `CAMPANAS`, `Campanas.dc.html:207-267`)

**4 campañas.**

| # | `id` | Estado | Vigencia | Precio / antes | Pexels `img` | `incluye` | `pasos` | Líneas |
|---|---|---|---|---|---|---|---|---|
| 1 | `vacunacion` | `Activa` | `Hasta el 30 de septiembre` | `49 €` / `78 €` | 6235233 | **6** | **3** | `208-221` |
| 2 | `dental` | `Activa` | `Todo octubre` | `−25 %` / `sobre tarifa` | 220938 | **6** | **3** | `223-236` |
| 3 | `senior` | `Plazas limitadas` | `Todo el año` | `75 €` / `132 €` | 733416 | **6** | **3** | `238-251` |
| 4 | `antiparasitaria` | `Empieza en marzo` | `De marzo a noviembre` | `119 €` / `164 €` | 1490908 | **6** | **3** | `253-266` |

- `incluye` real = **6 ítems en las cuatro** (`214`, `229`, `244`, `259`).
- `pasos` real = **3 en las cuatro** (`215-219`, `230-234`, `245-249`, `260-264`).
- `otras` en vista de ficha = **3** (4 − la activa, `329`). En vista de listado el valor calculado sería 4, pero la sección que lo consume vive dentro de `sc-if enFicha` (`106`) y no se pinta.
- `navPrincipal` = **6** (`301-308`): Reservar, Servicios, Equipo, Blog, Contacto, FAQ.
- Solo **2 de 4** campañas tienen `estado === 'Activa'`, así que **2 badges salen en verde (`--accent-ink` sobre blanco) y 2 en claro (`--card` sobre `--ink`)** (`324-325`).

---

## 3. Blog.dc.html

### 3.1 Envoltorio y estilos

- `<title>Blog — Veterinaria La Sierra</title>` (`Blog.dc.html:12`).
- Bloque `<style>` idéntico al de Tienda y Campañas (`17-37`); `vlsPulso` se usa en la píldora de urgencias (`60`).
- Props del editor: solo `{"$preview":{"width":1280}}` (`196`).

### 3.2 Estructura DOM por secciones

```
div raíz (41)
├── header sticky (43-66)  ← idéntico a Campañas salvo el bajorótulo
├── sc-if enListado (69-126)                     ← VISTA A
│   ├── section cabecera (71-82): migas, h1, entradilla, sc-for categorias
│   ├── section artículo destacado (84-104)
│   └── section rejilla de artículos (106-124)   ← sc-for articulos
├── sc-if enArticulo (129-179)                   ← VISTA B
│   ├── article cabecera del post (131-146): volver, kicker, h1, entradilla, firma
│   ├── div imagen grande (148-150)
│   └── div cuerpo 760px (152-177): sc-for post.cuerpo, CTA, «Sigue leyendo»
└── footer (181-192)
```

Dos `<h1>` en el fichero (`74` y `135`), mutuamente excluyentes (`352-353`).

### 3.3 Cabecera (`Blog.dc.html:43-66`)

Calcada de Campañas (`43-66`), con dos diferencias literales:

- Bajorótulo: **`Blog de salud animal`** (`52`).
- El `sc-for` de nav declara `hint-placeholder-count="6"` (`56`) y el array real también tiene 6 (`343-350`), pero **con distinto contenido**: aquí aparece `Campañas` y desaparece `Blog`.

Píldora de urgencias `tel:+34640221190` (`59-61`), píldora `Tienda` (`62`) y CTA móvil `Reservar` (`64`) son idénticos a Campañas.

### 3.4 Vista A — listado

**Cabecera de página (`71-82`).**

- Sección `padding:clamp(44px,6vw,76px) clamp(18px,5vw,28px) clamp(28px,4vw,40px)` (`71`) — **sin fondo propio** (Campañas sí lo tiene).
- Migas (`73`) con `Blog` como hoja.
- `h1` (`74`): mismo patrón tipográfico que las otras dos pero `max-width:20ch`. Texto: `Lo que contamos en consulta, por escrito`.
- Entradilla (`75`): `font-size:17.5px;line-height:1.7;color:var(--muted);max-width:62ch;margin:18px 0 0` — **62ch**, frente a 60ch en Tienda y Campañas.
- **Los filtros viven dentro de la cabecera**, no en su propia sección: `display:flex;flex-wrap:wrap;gap:9px;margin-top:26px` (`76`), con `sc-for categorias` (`77`) y el mismo botón/estilo calculado que Tienda (`78`; estilo en `358-363`, idéntico al de `Tienda.dc.html:271-276`).

**Artículo destacado (`84-104`).**

- Sección `padding:0 clamp(18px,5vw,28px) clamp(28px,4vw,44px)` (`84`).
- Es un **único `<button>`** con estilo calculado `estiloDestacado` (`86`; definido en `366-368`): `display:'grid'`, `gridTemplateColumns: ancha ? '1.1fr 1fr' : '1fr'`, `width:'100%'`, `background:'var(--card)'`, `border:'1px solid var(--border)'`, `borderRadius:'24px'`, `overflow:'hidden'`, `boxShadow:'var(--shadow-sm)'`, `cursor:'pointer'`, `padding:0`, `textAlign:'left'`. **Sin `style-hover`**: es la única tarjeta de las tres páginas sin realce al pasar el ratón.
- Marco de imagen (`87`): `display:block;aspect-ratio:16/10;background:var(--bg-2);overflow:hidden`. **Relación 16:10.**
- `<img>` (`88`): `display:block;width:100%;height:100%;object-fit:cover`, `src = PX(p.img, 800)` (`336`). **Sin `loading="lazy"`** (correcto por ser contenido sobre el pliegue).
- Columna de texto (`90`): `display:flex;flex-direction:column;justify-content:center;padding:clamp(24px,4vw,44px);text-align:left`.
- Píldora `Destacado` (`92`): `padding:5px 12px;border-radius:999px;background:var(--accent-soft);color:var(--accent-ink);font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase`.
- Metadatos (`93`): `{{ destacado.categoria }} · {{ destacado.lectura }}` en `12.5px/var(--muted)`.
- Titular (`95`): **`<span>`**, no encabezado: `'Outfit'` 600/`clamp(23px,3.2vw,34px)`/`line-height:1.15`/`color:var(--ink)`/`margin:14px 0 0`.
- Entradilla (`96`): `font-size:16px;line-height:1.7;color:var(--muted);margin:14px 0 0`.
- Firma (`97-100`): avatar de iniciales `34×34`, `border-radius:50%`, `background:var(--primary);color:var(--on-primary);font-weight:700;font-size:12px` (`98`), seguido de `{{ destacado.autor }} · {{ destacado.fecha }}` en `13.5px/var(--muted)`.

**Tarjeta de artículo (`106-124`).**

- Sección `padding:0 clamp(18px,5vw,28px) clamp(64px,9vw,100px)` (`106`); rejilla `repeat(auto-fit,minmax(min(300px,100%),1fr));gap:24px` (`107`) — igual que Campañas.
- Cada tarjeta es un **`<button>`** (`109`): `display:flex;flex-direction:column;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:20px;overflow:hidden;box-shadow:var(--shadow-sm);cursor:pointer;padding:0;transition:transform .3s ease,box-shadow .3s ease`, hover `transform:translateY(-4px);box-shadow:var(--shadow)`.
- Marco de imagen (`110`): `aspect-ratio:16/10`; `<img loading="lazy">` con `PX(p.img, 800)` (`111`, `336`).
- Cuerpo (`113`): `display:flex;flex-direction:column;flex:1;padding:20px 22px 22px`.
- Categoría (`114`): `font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent-ink)` — **11px**, frente a los 10.5px de la tarjeta de producto (`Tienda.dc.html:94`).
- Titular (`115`): **`<span>`**, `'Outfit'` 600/`19.5px`/`line-height:1.2`/`margin:9px 0 0`.
- Entradilla (`116`): `font-size:14.5px;line-height:1.65;color:var(--muted);margin:9px 0 18px`.
- Pie (`117-119`): `display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:14px;border-top:1px solid var(--border);font-size:12.5px;color:var(--muted)` con autor a la izquierda y tiempo de lectura a la derecha. **Sin fecha** (la fecha solo aparece en el destacado y en la vista de artículo).

### 3.5 Vista B — artículo

- Cabecera (`131`): `<article style="padding:clamp(28px,4vw,44px) clamp(18px,5vw,28px) 0">` con caja de **760px** (`132`).
- Botón volver (`133`): `min-height:44px;padding:10px 18px;border-radius:999px;border:1px solid var(--border);background:var(--card);color:var(--ink);font-size:13.5px;font-weight:600;cursor:pointer`, hover `border-color:var(--primary)`. Texto `← Todos los artículos`. **Estilo distinto al de Campañas** (allí es translúcido sobre el hero, `Campanas.dc.html:110`).
- Kicker de categoría (`134`): `font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-ink);margin:26px 0 12px`.
- `h1` (`135`): `'Outfit'` 600/`clamp(28px,4.6vw,48px)`/`line-height:1.08`/`letter-spacing:-.02em`.
- Entradilla (`136`): `font-size:clamp(17px,2.2vw,20px);line-height:1.65;color:var(--muted);margin:18px 0 0`.
- Firma (`137-144`): fila `display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:26px 0 0;padding:18px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)`; avatar `42×42` (`138`); nombre `14.5px/700/var(--ink)` (`140`); rol `13px/var(--muted)` (`141`); `{{ post.fecha }} · {{ post.lectura }}` empujado con `margin-left:auto` (`143`).
- **Imagen grande (`148-150`)**: contenedor `max-width:1080px;margin:clamp(26px,4vw,40px) auto 0;padding:0 clamp(18px,5vw,28px)`; `<img>` con `display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:22px;box-shadow:var(--shadow)`, `src = PX(post.img, 1400)` (`372`). **Relación 16:9 y sin `loading="lazy"`.** Es más ancha (1080) que la columna de texto (760).
- Cuerpo (`152`): `max-width:760px;margin:0 auto;padding:clamp(30px,4vw,48px) clamp(18px,5vw,28px) clamp(48px,7vw,80px)`.
- Bloques (`153-155`): `sc-for list="{{ post.cuerpo }}"` y **cada bloque se pinta como `<div style="{{ b.estilo }}">`** (`154`), sea párrafo, encabezado o cita. Estilos en `estiloBloque()` (`313-324`):
  - `h` → `fontFamily:"'Outfit',sans-serif"; fontSize:'clamp(21px,2.8vw,26px)'; fontWeight:600; color:'var(--ink)'; lineHeight:1.2; margin:'38px 0 14px'` (`315-316`).
  - `q` → `fontFamily:"'Outfit',sans-serif"; fontSize:'clamp(19px,2.5vw,23px)'; fontWeight:500; lineHeight:1.45; color:'var(--ink)'; margin:'32px 0'; padding:'4px 0 4px 22px'; borderLeft:'3px solid var(--accent)'` (`319-321`).
  - `p` (por defecto) → `fontSize:'17px'; lineHeight:1.8; color:'var(--text)'; margin:'0 0 18px'` (`323`).
- CTA intermedio (`157-163`): caja `margin-top:40px;padding:24px;border-radius:20px;background:var(--bg-2);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px`; titular `'Outfit'` 600/`19px` con el texto `¿Te ha surgido una duda con tu mascota?` (`159`); botón `min-height:48px;padding:14px 26px;border-radius:999px;background:var(--primary);color:var(--on-primary);font-weight:700;font-size:15px` hacia `#reservar` del landing (`162`).
- «Sigue leyendo» (`165-176`): `h2` `'Outfit'` 600/`22px`/`margin:48px 0 18px` (`165`); rejilla `repeat(auto-fit,minmax(min(230px,100%),1fr));gap:14px` (`166`); cada item es `<button>` `display:flex;gap:13px;align-items:center;text-align:left;background:var(--card);border:1px solid var(--border);border-radius:16px;padding:11px;cursor:pointer;transition:border-color .3s ease` (`168`); miniatura `width:70px;height:62px;flex-shrink:0;border-radius:11px;object-fit:cover`, `loading="lazy"`, `PX(p.img, 300)` (`169`, `376`) → **relación ≈ 35:31 (1,13:1)**, casi la del bloque «otras» de Campañas (74×66) pero **no idéntica**; título `'Outfit'` 600/`15px`/`line-height:1.25` (`171`) y tiempo de lectura `12.5px/var(--muted)` (`172`).

### 3.6 Pie (`Blog.dc.html:181-192`)

Idéntico en estilos; enlaces **`Inicio`, `Campañas`, `Tienda`, `Contacto`** (`185-188`), sustituyendo `Blog` por `Tienda`.

### 3.7 Comportamiento interactivo (script `Blog.dc.html:196-379`)

| Comportamiento | Cita | Detalle |
|---|---|---|
| Estado | `296` | `{ abierto: null, categoria: 'Todos', ancho: 1280 }` |
| Tema | `298-301` | lee `localStorage['vls-tema']`, aplica `data-tema`; **no escribe** |
| Responsive | `302-309` | `medir()` + listener `resize`, baja en `307` |
| Umbrales | `328-329` | `esMovil = ancho < 1080`; **`ancha = ancho >= 900`** (Campañas usa 940) |
| Abrir artículo | `311` | `setState({abierto:id})` + `scrollTo` suave arriba |
| Volver | `374` | `setState({abierto:null})` + `scrollTo` suave arriba |
| Categorías derivadas | `331` | `['Todos'].concat(POSTS.map(p=>p.categoria).filter(único))` |
| Filtro | `332` | `visibles = POSTS.filter(p => s.categoria==='Todos' \|\| p.categoria===s.categoria)` |
| Destacado | `333` | `visibles[0] \|\| POSTS[0]` — **con red de seguridad**: nunca queda vacío |
| Resto | `334` | `visibles.slice(1)` |
| Constructor de tarjeta | `336` | `Object.assign({}, p, { img: PX(p.img,800), abrir: () => this.abrir(p.id) })` |
| Relacionados | `375-376` | `POSTS.filter(p => !post \|\| p.id !== post.id).slice(0,3)` — **por orden del array, no por categoría** |
| Helpers de bloque | `199-201` | `P(texto)`, `H(texto)`, `Q(texto)` → `{tipo,texto}` |

**Estado vacío alcanzable y no cubierto:** al filtrar por una categoría con un solo artículo (por ejemplo `Salud`, `Gatos`, `Cachorros` o `Urgencias`), `visibles.length === 1`, el destacado lo consume y `articulos` queda a **0** (`333-334`, `370`); la sección `106-124` se pinta con su `padding` pero **sin ninguna tarjeta y sin mensaje**. NO CONSTA EN LA FUENTE ningún estado vacío para esa rejilla.

**Ausencias verificadas:** sin paginación ni «cargar más», sin buscador, sin etiquetas/tags, sin `aria-live` en el cambio de vista, sin cambio de URL al abrir un artículo, sin índice de contenidos, sin botones de compartir. Los relacionados **no dependen de la categoría del post abierto**.

### 3.8 Conteos reales (array `POSTS`, `Blog.dc.html:203-293`)

**6 artículos.**

| # | `id` | Categoría | Autor / rol | Fecha | Lectura | Pexels `img` | Bloques de `cuerpo` | Líneas |
|---|---|---|---|---|---|---|---|---|
| 1 | `dolor` | Salud | Dra. Elena Vargas · Directora clínica · Medicina interna (`EV`) | 4 de agosto de 2026 | 6 min | 733416 | **10** (P,H,P,P,Q,H,P,H,P,P) | `204-219` |
| 2 | `vacunas` | Prevención | Dra. Elena Vargas (`EV`) | 21 de julio de 2026 | 8 min | 6235233 | **8** (P,H,P,Q,H,P,H,P) | `221-234` |
| 3 | `leishmania` | Prevención | Dr. Marcos Nieto · Cirujano jefe (`MN`) | 9 de julio de 2026 | 5 min | 1490908 | **6** (P,H,P,Q,H,P) | `236-247` |
| 4 | `gato-agua` | Gatos | Dra. Lucía Ferrer · Dermatología y alergias (`LF`) | 28 de junio de 2026 | 4 min | 617278 | **6** (P,H,P,Q,H,P) | `249-260` |
| 5 | `cachorro` | Cachorros | Sergio Ibáñez · Auxiliar técnico veterinario (`SI`) | 14 de junio de 2026 | 5 min | 1108099 | **6** (P,H,P,Q,H,P) | `262-273` |
| 6 | `urgencias` | Urgencias | Dr. Marcos Nieto (`MN`) | 30 de mayo de 2026 | 6 min | 5732461 | **12** (P,H,P,H,P,H,P,Q,H,P,H,P) | `275-292` |

- **Categorías derivadas: 6 botones** = `Todos` + `Salud`, `Prevención`, `Gatos`, `Cachorros`, `Urgencias` (`331`). `Prevención` es la única con 2 artículos; las otras cuatro tienen 1.
- Con el filtro por defecto `Todos`: **1 destacado (`dolor`) + 5 tarjetas** en la rejilla (`333-334`).
- `relacionados` = **3** (`375-376`).
- `navPrincipal` = **6** (`343-350`): Reservar, Servicios, Campañas, Equipo, Contacto, FAQ.
- Autores distintos: **4** (Elena Vargas ×2, Marcos Nieto ×2, Lucía Ferrer ×1, Sergio Ibáñez ×1).

---

## 4. Conteos reales frente a `hint-placeholder-count`

> Recordatorio: el `hint` es la pista de maquetación del editor. Lo que se pinta en tiempo de ejecución es la longitud del array.

| Página | Línea | Lista | Hint | **Real** | ¿Coincide? |
|---|---|---|---|---|---|
| Tienda | `56` | `navPrincipal` | 5 | **5** (`250-256`) | sí |
| Tienda | `77` | `categorias` | 5 | **6** (`239`) | **NO** |
| Tienda | `85` | `productos` | 6 | **12** (`178-203`) | **NO** |
| Tienda | `109` | `garantias` | 3 | **3** (`205-209`) | sí |
| Tienda | `131` | `lineas` | 0 | **0** al arrancar (`212`) | sí |
| Tienda | `89` | `p.tieneEtiqueta` (`sc-if`) | `false` | **3 de 12 en `true`** (`179`,`183`,`187`) | parcial |
| Tienda | `118` | `carritoAbierto` (`sc-if`) | `false` | `false` (`212`) | sí |
| Tienda | `128` | `cestaVacia` (`sc-if`) | `true` | `true` al arrancar (`266`) | sí |
| Campañas | `56` | `navPrincipal` | 6 | **6** (`301-308`) | sí |
| Campañas | `82` | `campanas` | 4 | **4** (`207-267`) | sí |
| Campañas | `124` | `ficha.incluye` | 4 | **6** en las 4 campañas (`214`,`229`,`244`,`259`) | **NO** |
| Campañas | `133` | `ficha.pasos` | 3 | **3** en las 4 | sí |
| Campañas | `174` | `otras` | 3 | **3** en vista de ficha (`329`) | sí |
| Campañas | `69` | `enListado` (`sc-if`) | `true` | `true` (`activa:null`, `270`) | sí |
| Campañas | `106` | `enFicha` (`sc-if`) | `false` | `false` al arrancar | sí |
| Blog | `56` | `navPrincipal` | 6 | **6** (`343-350`) | sí |
| Blog | `77` | `categorias` | 5 | **6** (`331`) | **NO** |
| Blog | `108` | `articulos` | 6 | **5** con filtro `Todos` (`334`) | **NO** |
| Blog | `153` | `post.cuerpo` | 6 | **6, 8, 10 o 12 según el post** | **NO** |
| Blog | `167` | `relacionados` | 3 | **3** (`375-376`) | sí |
| Blog | `69` | `enListado` (`sc-if`) | `true` | `true` (`abierto:null`, `296`) | sí |
| Blog | `129` | `enArticulo` (`sc-if`) | `false` | `false` al arrancar | sí |

**Resumen: 5 listas con hint desalineado** (Tienda `categorias` y `productos`; Blog `categorias`, `articulos` y `post.cuerpo`) más el `incluye` de Campañas a 4 cuando el dato son 6. Quien dimensione la maquetación desde el hint construirá una rejilla para la mitad de las tarjetas de tienda.

## 4bis. Relaciones de aspecto e imágenes — tabla comparada

| Página | Elemento | Cita | Relación / tamaño | `object-fit` | `loading` | Ancho pedido a Pexels |
|---|---|---|---|---|---|---|
| Tienda | tarjeta de producto | `87-88` | `aspect-ratio:4/3` | `cover` | `lazy` | `w=700` (`282`) |
| Tienda | línea de cesta | `133` | `62px × 62px` (**1:1**), radio 12px | `cover` | *(ninguno)* | `w=200` (`296`) |
| Campañas | tarjeta de campaña | `84-85` | `aspect-ratio:16/9` | `cover` | `lazy` | `w=900` (`321`) |
| Campañas | hero de ficha | `108`, `315-317` | sin `aspect-ratio`; `min-height:clamp(320px,42vh,440px)`, `background-size:cover`, `background-position:center 45%` | *(fondo CSS)* | n/a | `w=1600` |
| Campañas | miniatura «otras» | `176` | `74px × 66px` (**≈1,12:1**), radio 11px | `cover` | `lazy` | `w=300` (`331`) |
| Blog | destacado | `87-88` | `aspect-ratio:16/10` | `cover` | *(ninguno)* | `w=800` (`336`) |
| Blog | tarjeta de artículo | `110-111` | `aspect-ratio:16/10` | `cover` | `lazy` | `w=800` (`336`) |
| Blog | imagen grande del post | `149` | `aspect-ratio:16/9`, radio 22px, `box-shadow:var(--shadow)` | `cover` | *(ninguno)* | `w=1400` (`372`) |
| Blog | miniatura «sigue leyendo» | `169` | `70px × 62px` (**≈1,13:1**), radio 11px | `cover` | `lazy` | `w=300` (`376`) |

Constructor común de URL: `PX(id,w)` en `Tienda.dc.html:175`, `Campanas.dc.html:205` y `Blog.dc.html:197`, con el patrón `https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?auto=compress&cs=tinysrgb&w={w}` — **idéntico en las tres**.

**Cinco relaciones distintas para cinco familias de tarjeta (4:3, 16:9, 16:10, 1:1 y dos miniaturas fijas casi cuadradas que ni siquiera coinciden entre sí).** Ningún `<img>` de las tres páginas declara `width`/`height` intrínsecos, y ninguno usa `srcset` ni `sizes`: NO CONSTA EN LA FUENTE.

Identificadores de Pexels reutilizados entre páginas: **733416** (Tienda `renal`, Campañas `senior`, Blog `dolor`), **1490908** (Tienda `pienso-adulto`, Campañas `antiparasitaria`, Blog `leishmania`), **220938** (Tienda `cepillo`, Campañas `dental`), **6235233** (Campañas `vacunacion`, Blog `vacunas`), **617278** (Tienda `transportin`, Blog `gato-agua`), **1108099** (Tienda `juguete`, Blog `cachorro`, y también el hero del landing en `Veterinaria La Sierra.dc.html:118`).

---

## 5. Qué comparten las tres con el landing y dónde divergen

### 5.1 Lo idéntico

1. **Familias y carga de fuentes**: mismos `preconnect` y misma URL de Google Fonts en `Tienda:13-15`, `Campanas:13-15`, `Blog:13-15` y `Veterinaria La Sierra.dc.html:13-15`.
2. **Las cuatro paletas y sus valores**: `clinica` (base), `calida`, `tech`, `eco`, conmutadas con `:root[data-tema='…']` — `Tienda:17-27`, `Campanas:17-27`, `Blog:17-27`, landing `18-49`.
3. **Reset y utilidades globales**: `*{box-sizing}`, `scroll-padding-top:88px`, tipografía de `body`, `p{text-wrap:pretty}`, transición de enlaces, `@keyframes vlsPulso`, bloque `prefers-reduced-motion` — `Tienda:28-37` ≡ landing `50-60` salvo dos líneas (ver 5.2).
4. **Contenedor raíz**: `background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden` — `Tienda:41`, `Campanas:41`, `Blog:41`, landing `64`.
5. **Cabecera pegajosa**: mismo `style` literal en las cuatro — `Tienda:43`, `Campanas:43`, `Blog:43`, landing `77`.
6. **Isotipo**: mismo cuadrado `38×38` radio 12 con la cruz de `17×4.5` y `4.5×17` — `Tienda:46-49`, `Campanas:46-49`, `Blog:46-49`, landing `80-83`.
7. **`estiloNav`**: `{display: esMovil ? 'none':'flex', alignItems:'center', gap:'2px'}` — `Tienda:249`, `Campanas:297`, `Blog:339`, landing (bloque `renderVals`, `690-720`).
8. **Umbral `esMovil = ancho < 1080`** y el par `medir()` + listener `resize` con baja en `componentWillUnmount` — `Tienda:218-225,238`, `Campanas:276-283,292`, `Blog:302-309,328`.
9. **Píldora de urgencias y píldora Tienda en el nav**: mismos estilos en `Campanas:59-62`, `Blog:59-62` y landing `94-97`.
10. **Enlaces de pie con `color:var(--muted)` y hover `color:var(--primary)`** — `Tienda:163-166`, `Campanas:193-196`, `Blog:185-188`, landing `461`, `470-472`.
11. **Constructor `PX(id,w)` de Pexels** — `Tienda:175`, `Campanas:205`, `Blog:197`, landing `506`.
12. **Migas de pan** con el mismo patrón `Inicio · <hoja>` y `aria-label="Ruta"` en las tres subpáginas (`Tienda:69`, `Campanas:73`, `Blog:73`). El landing **no** tiene migas.

### 5.2 Divergencias

**a) Tokens.** El `:root` del landing declara dos variables que las tres subpáginas **omiten**: `--primary-strong` (landing `21`, `29`, `37`, `45`) y `--urg-soft` (landing `23`, `31`, `39`, `47`). En las subpáginas esas líneas se comprimen a `--primary:#1E40AF; --on-primary:#FFFFFF;` y `--urg:#DC2626;` (`Tienda:20,22`). Además el landing incluye `summary::-webkit-details-marker{display:none}` (`58`), que las subpáginas no necesitan y no llevan.

**b) Barra superior de urgencias.** Existe solo en el landing (`66-75`): `background:var(--urg);color:#fff;font-size:13.5px` con punto pulsante y `tel:+34640221190`. **Ninguna de las tres subpáginas la tiene.**

**c) Navegación móvil.** El landing tiene botón hamburguesa (`100-104`, `estiloBotonMenu`) y panel desplegable con los 7 enlaces + Tienda + botón de urgencias (`107-115`). Campañas y Blog lo sustituyen por un único CTA «Reservar» (`Campanas:64`, `Blog:64`). **Tienda no tiene nada**: por debajo de 1080 px el `<nav>` se oculta (`Tienda:249`) y en la cabecera solo quedan el logotipo y el botón «Cesta» — **la navegación desaparece por completo en móvil**.

**d) Contenido del nav.** Cuatro juegos distintos:

| Página | Elementos | Cita |
|---|---|---|
| Landing | Reservar, Servicios, Campañas, Equipo, Blog, Contacto, FAQ (**7**) | bloque `navPrincipal`, `702` y siguientes |
| Tienda | Servicios, Campañas, Blog, Contacto, Reservar (**5**) | `250-256` |
| Campañas | Reservar, Servicios, Equipo, Blog, Contacto, FAQ (**6**) | `301-308` |
| Blog | Reservar, Servicios, Campañas, Equipo, Contacto, FAQ (**6**) | `343-350` |

Cada página omite su propio enlace, pero **Tienda además pierde `Equipo` y `FAQ` y coloca `Reservar` al final** en vez de al principio.

**e) Destino del logotipo.** Landing → `#inicio` (`79`); las tres subpáginas → `./Veterinaria%20La%20Sierra.dc.html` (`Tienda:45`, `Campanas:45`, `Blog:45`).

**f) Bajorótulo del logotipo.** `Clínica y hospital` (landing `86`) · `Tienda de la clínica` (`Tienda:52`) · `Campañas de salud` (`Campanas:52`) · `Blog de salud animal` (`Blog:52`).

**g) Píldora de urgencias.** En el landing apunta a `#contacto` (`94`); en Campañas y Blog apunta a `tel:+34640221190` (`59`). Tienda no la lleva. Además, Campañas usa un segundo teléfono, `tel:+34918442160` (`163`), que no aparece en Blog ni en Tienda.

**h) Pie de página.** Dos piezas distintas:

| Rasgo | Landing | Las tres subpáginas |
|---|---|---|
| `padding` | `clamp(48px,7vw,72px) … 28px` (`444`) | `clamp(40px,6vw,60px) … 26px` (`Tienda:159`) |
| Estructura | bloque de marca + 3 columnas `sc-for columnasPie` + fila legal (`445-474`) | una sola fila `flex` (`Tienda:160`) |
| Isotipo | sí, versión `36×36` radio 11 (`448-451`) | no, solo el nombre en texto (`Tienda:161`) |
| Descriptor | párrafo de 34ch (`454`) | ninguno |
| Enlaces | 12, en 3 columnas (bloque `columnasPie`, `796` y siguientes) | 4 |
| Legal | `Aviso legal`, `Privacidad`, `Cookies` (`470-472`) | ninguno |
| Copyright | `© 2026 Veterinaria La Sierra · Centro veterinario registrado nº 28/0791` (`468`) | `© 2026 · Ctra. de la Sierra 42, Miraflores de la Sierra` (`Tienda:168`, `Campanas:198`, `Blog:190`) |

El pie de las tres subpáginas es **idéntico entre sí salvo el juego de 4 enlaces**, que rota para excluir la página actual.

**i) Selector de paleta.** Vive **solo en el landing** (`477-501`): botón flotante `52×52` con `conic-gradient(var(--primary) 0 33%, var(--accent) 33% 66%, var(--urg) 66% 100%)` (`497-498`) y panel `width:min(268px,calc(100vw - 32px))` (`480`) con las 4 opciones de `PALETAS` (`601-606`) y sus tres muestras de color de `14×14` (`486`, y `sw()` en el bloque `paletas`). El landing **escribe** la elección: `document.documentElement.setAttribute('data-tema', id)` + `localStorage.setItem('vls-tema', id)` (`640-641`).

Las cuatro paletas del selector, con sus muestras (`601-606`): `clinica` — «Confianza clínica», `Azul cobalto · verde menta`, `['#1E40AF','#10B981','#F8FAFC']`; `calida` — «Orgánica y cálida», `Terracota · oliva · crema`, `['#D97706','#4D7C0F','#FEF3C7']`; `tech` — «Alta gama», `Azul marino · cian neón`, `['#0F172A','#06B6D4','#64748B']`; `eco` — «Relax & eco», `Esmeralda · menta clara`, `['#047857','#A7F3D0','#FFFFFF']`.

Las tres subpáginas solo **leen**: `localStorage.getItem('vls-tema')` y aplican `data-tema` (`Tienda:215-217`, `Campanas:272-275`, `Blog:298-301`). Consecuencia funcional: **la paleta se hereda pero no se puede cambiar desde ninguna subpágina**; si el usuario entra directamente a Tienda, Campañas o Blog sin haber pasado por el landing, se queda con `clinica` y sin ningún control para cambiarla.

**j) Props del editor.** El landing declara cuatro (`tema` enum, `mostrarSelectorPaleta`, `mostrarBarraUrgencias`, `telefonoUrgencias`) en `data-props` (`505`). Las tres subpáginas declaran **solo** `{"$preview":{"width":1280}}` (`Tienda:174`, `Campanas:204`, `Blog:196`), de modo que nada de su contenido es configurable desde el panel del editor.

**k) `data-screen-label` e `id` de sección.** El landing etiqueta sus secciones (`118`, `142`, `183`, `209`, `254`, `317`, `345`, `424`) con `id` + `data-screen-label`. Las tres subpáginas tienen **0 ocurrencias** de ambos: sus secciones no son direccionables ni aparecen etiquetadas en el editor.

**l) Umbral secundario.** El landing y Tienda solo usan `esMovil` (1080). Campañas añade `ancha = ancho >= 940` (`293`) y Blog `ancha = ancho >= 900` (`329`): **dos puntos de ruptura distintos para el mismo gesto** (pasar de una a dos columnas).

**m) Densidad tipográfica de la cabecera de página.** Landing: `h1` `clamp(33px,6.4vw,68px)` sobre hero oscuro (`123`). Las tres subpáginas: `h1` `clamp(30px,5vw,54px)` sobre fondo claro (`Tienda:70`, `Campanas:75`, `Blog:74`) — salvo el `h1` del hero de ficha de Campañas, `clamp(30px,5.4vw,56px)` sobre foto (`Campanas:112`).

**n) Jerarquía de encabezados.** Tienda: 1 `h1` + 12 `h2` (uno por producto, `95`). Campañas: 1 `h1` visible + 1 `h2` por tarjeta (`90`) en listado, o 4 `h2` de sección en ficha (`122`,`131`,`144`,`172`). Blog: 1 `h1` + **ningún `h2` en el listado** (los titulares son `<span>`, `95` y `115`) y un solo `h2` en la vista de artículo (`165`), donde además **los subtítulos del cuerpo se pintan como `<div>`** (`154`). Tres criterios distintos para el mismo problema.

---

## 6. Hallazgos

Numerados para poder referenciarlos en las features del rediseño. Cada uno es verificable en la cita indicada.

| # | Página | Hallazgo | Cita |
|---|---|---|---|
| H-01 | Tienda | El array real tiene **12 productos**, no los 6 del hint; la maquetación debe dimensionarse para 12 | `178-203` vs `85` |
| H-02 | Tienda | Los filtros son **6 botones** derivados del dato, no 5 | `239` vs `77` |
| H-03 | Tienda | Por debajo de 1080 px **desaparece toda la navegación**: no hay hamburguesa, ni panel, ni CTA móvil; solo logotipo y «Cesta» | `249`, `43-65` |
| H-04 | Tienda | Es la única página sin ningún enlace `tel:` ni `mailto:` y sin píldora de urgencias | 0 ocurrencias en el fichero completo |
| H-05 | Las 3 | **No existe paginación** en ninguna de las tres, ni «cargar más», ni buscador, ni ordenación | NO CONSTA EN LA FUENTE |
| H-06 | Tienda | El **único estado vacío de las tres páginas** es el de la cesta; la rejilla filtrada no tiene ninguno | `128-130` |
| H-07 | Blog | Filtrar por una categoría de un solo artículo deja la rejilla `articulos` a **0 tarjetas sin mensaje alguno** (el destacado se come el único post) | `333-334`, `370`, `106-124` |
| H-08 | Blog | El destacado tiene red de seguridad `visibles[0] \|\| POSTS[0]`: nunca puede quedar vacío, lo que enmascara H-07 | `333` |
| H-09 | Campañas | `ficha.incluye` son **6 ítems en las cuatro campañas**, no 4 | `214`,`229`,`244`,`259` vs `124` |
| H-10 | Blog | `post.cuerpo` varía entre **6 y 12 bloques** según el artículo (6/8/10/12); el hint fija 6 | `208-218` (10), `225-233` (8), `279-291` (12) vs `153` |
| H-11 | Blog | Con el filtro por defecto la rejilla pinta **5 tarjetas**, no 6: el primer post se consume como destacado | `334`, `370` vs `108` |
| H-12 | Blog | Los subtítulos y las citas del artículo se pintan como **`<div>` con estilo inline**, sin `<h2>` ni `<blockquote>`: el artículo no tiene estructura semántica interna | `154`, `313-324` |
| H-13 | Blog | Los titulares de las tarjetas del listado son **`<span>`**, no encabezados, a diferencia de Tienda (`h2`) y Campañas (`h2`) | `95`, `115` vs `Tienda:95`, `Campanas:90` |
| H-14 | Blog | «Sigue leyendo» **no está relacionado**: toma los 3 primeros posts del array excluyendo el actual, sin mirar la categoría | `375-376` |
| H-15 | Campañas | El badge de estado depende de la comparación literal `estado === 'Activa'`; con los datos actuales **2 de 4 campañas salen con el badge claro** | `324-325`, datos `238`,`253` |
| H-16 | Campañas | En el hero de ficha la píldora usa siempre `color:var(--urg)`, ignorando la lógica de estado del listado | `111` vs `324-325` |
| H-17 | Campañas / Blog | El intercambio listado↔ficha/artículo es **estado de cliente puro**: sin URL, sin `history`, sin ancla, sin `aria-live`, sin devolución de foco; solo `scrollTo` suave | `Campanas:285-288,318`; `Blog:311,374` |
| H-18 | Tienda | El cajón de cesta es un `sc-if` sin `role="dialog"`, `aria-modal`, trampa de foco ni cierre con `Esc`; el botón que lo abre no tiene `aria-expanded` | `118-157`, `60` |
| H-19 | Tienda | El recorrido de compra **termina en `#contacto` del landing**: no hay checkout ni confirmación, y así lo declara el propio descargo | `152-153` |
| H-20 | Tienda / Blog | Los filtros son botones sueltos sin `aria-pressed`, `role="tablist"` ni agrupación: el estado activo solo existe visualmente | `Tienda:78,271-276`; `Blog:78,358-363` |
| H-21 | Las 3 | Las tres **leen** `localStorage['vls-tema']` pero **ninguna escribe**: la paleta solo se puede cambiar en el landing | `Tienda:215-217`; `Campanas:272-275`; `Blog:298-301` vs landing `640-641` |
| H-22 | Las 3 | Ninguna incluye el **selector de paleta flotante** del landing | landing `477-501`; 0 ocurrencias en las tres |
| H-23 | Las 3 | Los `:root` de las subpáginas **omiten `--primary-strong` y `--urg-soft`**, presentes en las cuatro paletas del landing | `Tienda:20,22` vs landing `21,23` |
| H-24 | Las 3 | Ninguna lleva la **barra superior de urgencias** del landing | landing `66-75` |
| H-25 | Las 3 | El **pie es una pieza distinta** del landing: una sola fila, sin isotipo, sin columnas, sin aviso legal ni nº de registro, y con un copyright de texto diferente | `Tienda:159-170` vs landing `444-475` |
| H-26 | Las 3 | Cada nav tiene **un juego distinto de enlaces** (7 / 5 / 6 / 6) y Tienda además pierde `Equipo` y `FAQ` y mueve `Reservar` al final | `Tienda:250-256`; `Campanas:301-308`; `Blog:343-350` vs landing `702` y siguientes |
| H-27 | Las 3 | Ninguna declara `data-screen-label` ni `id` de sección; el landing etiqueta las suyas | 0 ocurrencias vs landing `118`,`142`,`183`,`209`,`254`,`317`,`345`,`424` |
| H-28 | Las 3 | Ninguna declara props de editor más allá de `$preview`; el landing expone 4 | `Tienda:174`; `Campanas:204`; `Blog:196` vs landing `505` |
| H-29 | Las 3 | **Cinco relaciones de aspecto distintas** para las familias de tarjeta: 4:3 (Tienda), 16:9 (Campañas), 16:10 (Blog), 1:1 (cesta) y dos miniaturas fijas que ni siquiera coinciden entre sí (74×66 y 70×62) | `Tienda:87,133`; `Campanas:84,176`; `Blog:87,110,149,169` |
| H-30 | Las 3 | Ningún `<img>` declara `width`/`height` intrínsecos ni `srcset`/`sizes`; el ancho se fija a mano en la llamada a `PX()` con siete valores distintos (200, 300, 700, 800, 900, 1400, 1600) | `Tienda:282,296`; `Campanas:321,331`; `Blog:336,372,376` |
| H-31 | Blog / Tienda | Tres imágenes **sin `loading="lazy"`**: destacado (justificable), imagen grande del post y miniatura de línea de cesta | `Blog:88,149`; `Tienda:133` |
| H-32 | Campañas | El hero de ficha es una **imagen de fondo CSS**, sin `alt` y sin control de carga, mientras el mismo dato sí tiene `alt` en el listado | `108`, `315-317` vs `85` |
| H-33 | Campañas / Blog | Umbrales de dos columnas **incoherentes** entre páginas hermanas: 940 px en Campañas y 900 px en Blog, con `esMovil` a 1080 en ambas | `Campanas:293` vs `Blog:329` |
| H-34 | Campañas | El `<ol>` declara `counter-reset:paso` pero la numeración se pinta a mano desde el dato `p.n`: el contador CSS es código muerto | `132` vs `135`, datos `216-218` |
| H-35 | Tienda | `@keyframes vlsPulso` está declarado pero **no se usa en toda la página** (no hay píldora de urgencias que lo consuma) | `36`, 0 usos posteriores |
| H-36 | Las 3 | El bloque `<style>`, la cabecera y el pie están **duplicados literalmente** en los cuatro ficheros: cualquier cambio de marca exige tocar cuatro sitios | `Tienda:17-37,43-65,159-170` ≡ `Campanas:17-37,43-66,189-200` ≡ `Blog:17-37,43-66,181-192` |
| H-37 | Las 3 | El diseño reutiliza **6 identificadores de Pexels en varias páginas** (733416, 1490908, 220938, 6235233, 617278, 1108099), y 1108099 es además el hero del landing: la misma foto se repite con `alt` distintos | `Tienda:180,184,192,196,200`; `Campanas:210,225,240,255`; `Blog:207,224,239,252,265`; landing `118` |
| H-38 | Las 3 | Ninguna define `<main>`; las únicas regiones con `aria-label` son el nav principal y la miga de pan | 0 ocurrencias de `<main` en los tres ficheros |

---

## 7. Cierre

Las tres subpáginas comparten un **mismo esqueleto declarado cuatro veces** (tokens, reset, cabecera pegajosa, isotipo, pie) y divergen en casi todo lo que se apoya sobre él: el juego de enlaces, la navegación móvil, la relación de aspecto de las tarjetas, la jerarquía de encabezados, el umbral de dos columnas y la presencia o ausencia del control de paleta. Los seis desalineamientos entre `hint-placeholder-count` y los arrays reales (H-01, H-02, H-09, H-10, H-11 y el `incluye` de Campañas) son la trampa más inmediata para quien maquete leyendo el HTML sin abrir el `<script>`.
