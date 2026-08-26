# Mediciones en navegador real — diseño de Claude Design vs. sitio desplegado

> Fecha de la medición: **26/08/2026**.
> Método: Chromium real vía Playwright 1.62.1 (`node_modules/playwright`),
> viewport 1440×900, `deviceScaleFactor: 1`, espera `networkidle` + 3 s.
> **Ningún valor de este documento está estimado ni leído del CSS**: todos
> salen de `getComputedStyle()` y `getBoundingClientRect()` sobre las dos
> páginas cargadas de verdad.
>
> Esta es la fuente **independiente** que se cruza con la lectura del código
> fuente hecha por los analistas en `progress/rediseno/`. Cuando las dos
> coinciden, el valor entra en el contrato; cuando discrepan, se vuelve a la
> fuente antes de escribir nada.
>
> ## Las dos páginas medidas
>
> - **Diseño**: `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`
>   servido por HTTP local (el runtime `support.js` necesita origen `http:`,
>   no `file:`), tema por defecto `clinica`.
> - **Desplegado**: <https://cenit-digital.github.io/GalapavetClinicaVeterinaria/>,
>   variante activa `marca`, commit `3cb93ec`.

---

## 1. Tokens de color resueltos

Volcado de las custom properties **resueltas** (no declaradas) sobre
`document.documentElement`.

| Rol (diseño) | Diseño `clinica` | Rol (repo) | Desplegado `marca` |
| --- | --- | --- | --- |
| `--bg` | `#F8FAFC` | `--color-fondo` | `#FFFFFF` |
| `--bg-2` | `#EDF2F9` | `--color-fondo-alterno` | `#F4EEF3` |
| `--card` | `#FFFFFF` | `--color-superficie` | `#FFFFFF` |
| `--surface` | `#FBFDFF` | `--color-superficie-elevada` | `#FAF6F9` |
| `--border` | `rgba(15,32,60,.13)` | `--color-borde` | `#DDC9DA` |
| `--ink` | `#0B1B33` | `--color-tinta` | `#531C4B` |
| `--text` | `#3C4C66` | `--color-texto` | `#77286B` |
| `--muted` | `#5E6E88` | `--color-texto-suave` | `#925389` |
| `--primary` | `#1E40AF` | `--color-primario` | `#77286B` |
| `--primary-strong` | `#1B3796` | `--color-primario-fuerte` | `#6B2460` |
| `--on-primary` | `#FFFFFF` | `--color-sobre-primario` | `#FFFFFF` |
| `--accent` | `#10B981` | — | **NO EXISTE** |
| `--accent-ink` | `#047857` | `--color-acento-tinta` | `#48704B` |
| `--accent-soft` | `#E7F8F1` | `--color-acento-suave` | `#F6F8E3` |
| `--urg` | `#DC2626` | — | **NO EXISTE** |
| `--urg-soft` | `#FEE9E9` | — | **NO EXISTE** |
| `--shadow` | `0 18px 45px rgba(15,32,60,.10)` | `--sombra-elevada` | `0 18px 45px rgba(83,28,75,.10)` |
| `--shadow-sm` | `0 6px 18px rgba(15,32,60,.07)` | `--sombra-reposo` | `0 6px 18px rgba(83,28,75,.07)` |
| — | — | `--color-borde-control` | `#A06997` (solo repo) |
| — | — | `--color-foco` | `#77286B` (solo repo) |

**Hallazgo 1.** Al sitio desplegado le faltan **tres roles enteros**
(`--accent`, `--urg`, `--urg-soft`). No es que valgan otra cosa: no existen,
así que ningún módulo puede pintar ni un acento saturado ni nada de urgencias.

**Hallazgo 2.** El repo tiene dos roles que el diseño no modela
(`--color-borde-control`, `--color-foco`). **Se conservan**: los exige
WCAG 2.2 SC 1.4.11 y SC 2.4.7, ya verificados por
`features/identidad_visual.feature`. El sistema unificado tendrá por tanto
**20 roles**, no 18.

---

## 2. Geometría

| Propiedad | Diseño | Desplegado | Δ |
| --- | --- | --- | --- |
| `max-width` de contenedor | **1220 px** | 1024 px | −196 px |
| Contenedores secundarios | 900 px (hero), 860 px (FAQ) | ninguno | faltan 2 |
| Padding vertical de sección | **104 px** (90 px en campañas) | 64 px, plano | sin ritmo |
| Padding horizontal de sección | 28 px | 24 px | −4 px |
| Radios distintos en uso | **9**: `50%`, `999px`, `20px`, `30px`, `22px`, `16px`, `12px`, `11px`, `3px` | **3**: `999px`, `24px`, `12px` | faltan 6 |
| Radio de tarjeta | **20 px** (×29 elementos) | 24 px (×19) | +4 px |
| Sombras distintas | **3** | **1** | sin elevación |
| Elementos con sombra de reposo | 32 | 12 | −20 |
| ¿Desborde horizontal a 1440 px? | no | no | ok |

## 3. Tipografía computada

| Elemento | Diseño | Desplegado |
| --- | --- | --- |
| `h1` | Outfit **68 px** / lh 71,4 / tracking **−1,36 px** / peso **600** | Outfit 48,83 px / lh 53,71 / tracking normal / peso **700** |
| `h2` | Outfit **46 px** / lh 49,68 / tracking −0,69 px / peso 600 | Outfit 39,06 px / lh **58,59** / tracking normal / peso 700 |
| `h3` | Outfit 21 px / lh 24,15 / peso 600 | Outfit 25 px / lh 37,5 / peso 700 |
| Párrafo destacado | DM Sans 19,5 px / lh 32,17 | DM Sans 10,24 px (es el cintillo) / lh 12,29 |

Dos diferencias de fondo, no de matiz:

1. El diseño usa **peso 600** en todos los titulares y **tracking óptico
   negativo** (`-.02em` en `h1`, `-.015em` en `h2`). El sitio usa peso 700 sin
   tracking: por eso los titulares se ven más «gordos» y más anchos.
2. El interlineado de `h2` del sitio (58,59 px sobre 39,06 px = **1,5**) es el
   `line-height` global heredado del `body`; el diseño lo baja a **1,08**. Un
   titular de dos líneas ocupa un 39 % más de alto del que debería.

## 4. Alturas de control

| Control | Diseño | Desplegado | Mínimo WCAG SC 2.5.8 |
| --- | --- | --- | --- |
| `input` de texto | **46 px** | **28 px** | 24 px |
| `select` | **46 px** | **25 px** | 24 px |
| `textarea` | 110 px | 96 px | 24 px |
| `summary` del FAQ | 70 px | — | 24 px |

Los campos del formulario pasan el mínimo de accesibilidad por 1-4 px. Pasan,
pero explican por qué la captura del formulario se ve descuadrada: un
`checkbox` de 18 px junto a campos de 28 px no puede alinearse bien.

## 5. Cómo reproducir estas mediciones

Los dos scripts usados viven en el directorio de trabajo temporal de la
sesión y no se versionan (son instrumentos, no producto). Lo que sí es
reproducible es el procedimiento:

1. Servir el diseño por HTTP: `python -m http.server` dentro de
   `docs/diseno-claude-design/` y abrir `/Veterinaria La Sierra.dc.html`.
   `support.js` no arranca desde `file:`.
2. Cargar cada página con Playwright, esperar `networkidle` + 3 s (el runtime
   del prototipo pinta en dos pasadas).
3. Volcar `getComputedStyle(document.documentElement)` para las custom
   properties, y `getBoundingClientRect()` para la geometría.

Toda cifra de `features/rediseno_visual.feature` que provenga de aquí lo cita
como «medido en navegador, `progress/rediseno_mediciones_navegador.md` §N».

---

## 6. La escala tipográfica del diseño, medida en 5 anchos de viewport

Barrido de **todos** los elementos con nodo de texto propio, a 320, 375, 768,
1220 y 1440 px, contando cuántos elementos usan cada tamaño computado.

### 6.1 El diseño NO tiene escala tipográfica

Aparecen **34 tamaños de fuente distintos**. Los más usados no siguen ninguna
progresión geométrica:

| Tamaño | Nº de elementos | Tamaño | Nº de elementos |
| ---: | ---: | ---: | ---: |
| 13,5 px | 64 | 12 px | 32 |
| 13 px | 44 | 14,5 px | 27 |
| 11 px | 39 | 16 px | 24 |
| 14 px | 39 | 19 px | 18-24 |

Esto **confirma la Decisión 24** del proyecto («No copies estos valores»): el
prototipo es una maqueta, no un sistema. Copiar sus 34 tamaños sería importar
su desorden.

### 6.2 Solo 7 tamaños son fluidos

De los 34, únicamente estos cambian con el ancho de la ventana:

| Rol | 320 px | 768 px | 1220 px | Declaración en el prototipo |
| --- | ---: | ---: | ---: | --- |
| `h1` del hero | 33 | 49,15 | **68** | `clamp(33px,6.4vw,68px)` |
| `h2` de sección | 28 | 32,26 | **46** | `clamp(28px,4.2vw,46px)` |
| `h2` secundario | 26 | 26,11 | **40** | `clamp(26px,3.6vw,40px)` |
| Título de ficha | 24 | 27,65 | **32** | `clamp(24px,3.4vw,32px)` |
| Párrafo del hero | 16 | 16,13 | **19,5** | `clamp(16px,2.2vw,19.5px)` |
| `summary` del FAQ | 16 | 16,9 | **19** | `clamp(16px,2.1vw,19px)` |

### 6.3 La escala del repo ya casi encaja: solo fallan los dos pasos altos

Cruce de `$escala-tipografica` (`src/styles/_api.scss:37-46`, ratio 1,25,
base 16 px) con los tamaños del diseño:

| Paso | Valor del repo | Equivalente en el diseño | Δ | Veredicto |
| ---: | ---: | ---: | ---: | --- |
| −2 | 10,24 | 10,5 | 0,26 | ✅ encaja |
| −1 | 12,8 | 12,5 / 13 | ≤0,3 | ✅ encaja |
| 0 | 16 | 16 | 0 | ✅ exacto |
| 1 | 20 | 19 / 19,5 / 20 | ≤1 | ✅ encaja |
| 2 | 25 | 24 / 26 | ≤1 | ✅ encaja |
| 3 | 31,25 | 32 | 0,75 | ✅ encaja |
| **4** | **39,06 FIJO** | **28 → 46 fluido** | **−6,94 en el techo** | ❌ |
| **5** | **48,83 FIJO** | **33 → 68 fluido** | **−19,17 en el techo** | ❌ |

**Conclusión medida.** El titular de la portada se ve 19 px más pequeño que el
del diseño **no porque la escala esté mal, sino porque sus dos pasos altos son
tamaños fijos en vez de `clamp()` fluidos**. La corrección es convertir los
pasos 4 y 5 en fluidos con los extremos del diseño, sin tocar los seis pasos
inferiores, que ya coinciden dentro de 1 px.

### 6.4 Las otras dos diferencias de titular, medidas

| Propiedad | Diseño | Repo | Corrección |
| --- | --- | --- | --- |
| `font-weight` de titulares | **600** | 700 | bajar a 600 |
| `letter-spacing` de `h1` | **−0,02em** (−1,36 px a 68 px) | `normal` | declarar tracking óptico negativo |
| `letter-spacing` de `h2` | **−0,015em** (−0,69 px a 46 px) | `normal` | ídem |
| `line-height` de `h2` | **1,08** | 1,5 (heredado del `body`) | declarar interlineado propio de titular |

El interlineado es el más visible de los cuatro: un `h2` de dos líneas ocupa
hoy un **39 % más de alto** del que le corresponde.
