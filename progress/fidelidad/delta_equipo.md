# Delta de fidelidad — sección «Equipo»

> Informe de convergencia visual de la sección `#equipo` de la portada contra
> el prototipo aprobado por el cliente
> (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html`, citado
> **VLS:línea**; sección en 209-253, runtime del botón «+» y del panel en
> 649-652 y 738-748, array `EQUIPO` en 559-578). Fecha: 03/09/2026. Escrito
> para que el `tdd_craftsman` implemente sin volver a abrir el prototipo. No
> se ha tocado `src/`, `tests/` ni `features/`.
>
> Fuentes leídas: el HTML del prototipo, las capturas `shots/diseno_02.png`,
> `diseno_03.png`, `web_01.png`, `web_02.png` a 1280 px (y dos recortes de la
> sección hechos sobre `diseno_full.png`/`web_full.png`),
> `src/components/Equipo.tsx`, `Equipo.module.scss`, `Equipo-logica.ts`, sus
> dos tests, `src/data/equipo.ts`, `src/lib/site.ts`, `docs/datos-galapavet.md`
> §4/§7/§9, `src/styles/_api.scss`, `_tokens.scss`, `global.scss`,
> `src/pages/Landing.tsx` + `.module.scss`, el CSS compilado real
> `dist/assets/index-CCVUwotx.css`, `features/equipo.feature`,
> `docs/contrato-heredado/equipo.feature`, `features/rediseno_visual.feature`
> (@s19, @s23, @s24, @s32, @s33, @s44-@s50, @s52), las puertas de
> `src/lib/diseno/` que leen los `.module.scss` (`matrizDeContraste`,
> `movimientoRespetuoso`, `escalaMovimiento`, `usoDelAcento`,
> `rolesDescartados`) y los E2E de `tests/e2e/` que tocan la sección. Los
> deltas hermanos `delta_global.md` (bandeado, `global-3`) y
> `delta_servicios.md` (bug `espaciado(20)`) se citan donde solapan.
>
> Equivalencia de tokens prototipo → sistema (`_tokens.scss`, variante
> `clinica`): `--bg` → `--color-fondo` (#F8FAFC) · `--bg-2` →
> `--color-fondo-alterno` (#EDF2F9) · `--card` → `--color-superficie` (#FFFFFF)
> · `--border` → `--color-borde` (#DADEE3, derivado) · `--ink` →
> `--color-tinta` (#0B1B33) · `--text` → `--color-texto` (#3C4C66) · `--muted`
> → `--color-texto-suave` (#5E6E88) · `--primary` → `--color-primario`
> (#1E40AF) · `--on-primary` → `--color-sobre-primario` · `--accent-ink` →
> `--color-acento-tinta` (#047857) · `--accent-soft` → `--color-acento-suave`
> (#E7F8F1) · `--shadow-sm` → `--sombra-reposo` · `--shadow` →
> `--sombra-elevada`.

## Anatomía del prototipo

Los 6 profesionales del prototipo (VLS:559-578: nombre, rol, foto de Pexels,
`alt`, bio, colegiado, idiomas, 3 `tags` cada uno) son inventados y **ninguno
se porta** (`docs/datos-galapavet.md` §4 y §7). Se porta la **anatomía**.

### 1. Sección y contenedor

| Elemento | Estilo literal | Valor concreto |
| --- | --- | --- |
| `<section id="equipo" data-screen-label="Equipo">` (VLS:209) | `padding:clamp(64px,9vw,104px) clamp(18px,5vw,28px); background:var(--bg)` | relleno vertical fluido 64→104 px; a 1280 px: 9vw = 115,2 → **104 px** arriba y abajo; lateral 28 px; **fondo `--bg`** (el claro, no el alterno) |
| `<div>` contenedor (VLS:210) | `max-width:1220px; margin:0 auto` | 1220 px centrados |
| `@media` propios | ninguno | la respuesta la dan `clamp()` y `auto-fit`/`minmax` |

### 2. Cabecera de sección (centrada)

`<div style="text-align:center;max-width:640px;margin:0 auto">` (VLS:211): un
bloque de **640 px máximo, centrado**, con todo su texto centrado. Dentro, en
este orden:

| Orden | Elemento | Estilo literal (VLS) | Valores |
| --- | --- | --- | --- |
| 1 | `<p>` cintillo «Equipo» (VLS:212) | `font-size:12px; letter-spacing:.22em; text-transform:uppercase; color:var(--accent-ink); font-weight:700; margin:0 0 13px` | 12 px, tracking 0,22 em, versalitas, acento tinta, peso 700, **13 px** de aire por debajo |
| 2 | `<h2>` «Nuestro equipo» (VLS:213) | `font-family:'Outfit'; font-size:clamp(28px,4.2vw,46px); line-height:1.08; letter-spacing:-.015em; font-weight:600; color:var(--ink); margin:0` | a 1280 px: 4,2vw = 53,8 → **46 px**; peso 600; tracking −0,015 em; **color tinta** |
| 3 | `<p>` párrafo (VLS:214) | `font-size:17px; line-height:1.7; color:var(--muted); margin:16px 0 0` | 17 px / 1,7; texto suave; 16 px por encima. Su texto («Seis profesionales colegiados que verás siempre por aquí…») es **FALSO** y está prohibido (`equipo.feature`, cabecera, punto 4) |

En la captura (`diseno_02.png`, y ≈ 1085-1230) la cabecera ocupa ≈150 px de
alto, centrada en el eje de 1280 px; el párrafo cae en dos líneas de ≈630 px.

### 3. Rejilla

`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:26px;margin-top:clamp(36px,5vw,52px);align-items:start">` (VLS:217).

- Columnas: `auto-fit`, mínimo **300 px**, `1fr`. Con 1220 px de contenedor: 3
  columnas de **(1220 − 2·26)/3 = 389,3 px**. Medido en `diseno_02/03.png`:
  tarjetas en x = 31-418, 446-833 y 862-1249 (387-388 px de ancho, 27-29 px de
  hueco).
- Hueco: **26 px**. Separación cabecera → rejilla: `clamp(36px,5vw,52px)` → a
  1280 px: 5vw = 64 → **52 px**.
- `align-items:start`: una tarjeta desplegada crece sola, sin estirar a sus
  vecinas; con todas cerradas y la misma anatomía, todas miden lo mismo.
- 6 tarjetas → 2 filas de 3. Altura medida de una tarjeta cerrada: **≈432 px**
  (y = 293-725 en el recorte), de los cuales ≈291 px son la zona de imagen.

### 4. Tarjeta (`<article>`, VLS:219)

`display:flex; flex-direction:column; background:var(--card); border:1px solid var(--border); border-radius:20px; overflow:hidden; box-shadow:var(--shadow-sm); transition:box-shadow .3s ease` · hover: `box-shadow:var(--shadow)`.

- Radio **20 px**, borde 1 px decorativo, sombra reposo → elevada al pasar el
  puntero (300 ms). Sin `padding` propio: lo llevan sus dos hijos.

**4a. Zona superior de imagen (VLS:220-221)**

`<div style="aspect-ratio:4/3;background:var(--accent-soft);overflow:hidden">`
con `<img loading="lazy" width="800" height="600" style="display:block;width:100%;height:100%;object-fit:cover">`.

- Proporción **4:3** a todo el ancho de la tarjeta (389 px → **292 px** de alto).
- Fondo de reserva `--accent-soft` bajo la foto.
- La foto es de banco (Pexels, `PX()` en VLS:506) y atribuye una cara a un
  nombre: **no se porta** (@s11 de `equipo.feature`, @s32 de
  `rediseno_visual.feature`). Lo que se porta es la **geometría** de la zona.

**4b. Cuerpo (VLS:223)**

`display:flex; flex-direction:column; gap:14px; padding:20px 20px 22px` → tres
bloques apilados con 14 px entre sí: fila de cabecera, panel desplegable, chips.

**4c. Fila de cabecera de la tarjeta (VLS:224-229)**

`display:flex; align-items:center; justify-content:space-between; gap:12px`

| Parte | Estilo literal | Valores |
| --- | --- | --- |
| Columna de texto `<div style="min-width:0">` (VLS:225) | — | a la **izquierda**; `min-width:0` para que un nombre largo se parta sin desbordar |
| `<h3>` nombre (VLS:226) | `font-family:'Outfit'; font-size:20px; font-weight:600; color:var(--ink); margin:0; line-height:1.2` | **20 px**, peso 600, tinta |
| `<span>` cargo (VLS:227) | `display:block; font-size:13px; color:var(--muted); margin-top:3px` | **13 px**, peso normal, texto suave, 3 px bajo el nombre |
| `<button type="button" aria-expanded aria-label>` «+» (VLS:229; estilo `estiloMas` en VLS:745-748) | `flexShrink:0; width:44px; height:44px; borderRadius:50%; border:1px solid var(--border); background: abierto ? var(--primary) : var(--accent-soft); color: abierto ? var(--on-primary) : var(--accent-ink); fontSize:22px; lineHeight:1; display:flex; alignItems:center; justifyContent:center; cursor:pointer; transition:transform .3s ease, background .3s ease, color .3s ease; transform: abierto ? rotate(45deg) : rotate(0deg)` | círculo de **44 px** a la **derecha** de la fila; cerrado: acento suave + acento tinta; abierto: **primario + sobre-primario** y **rota 45°** (el «+» pasa a «×»); glifo de 22 px. `aria-label` (VLS:742): «Ver la biografía de X» / «Ocultar la biografía de X»; en la web ya es «…la formación de X» (`equipo.feature`, cabecera, punto 6) |

**4d. Panel desplegable (VLS:232-239)**

Envoltorio con `estiloPanel` (VLS:649-652): `overflow:hidden; max-height: abierto ? 620px : 0; opacity: abierto ? 1 : 0; transition: max-height .3s ease, opacity .3s ease` — siempre en el DOM (defecto de accesibilidad ya anotado en `progress/rediseno/analisis_landing_secciones.md`, punto 8; la web lo resuelve con render condicional, @s3).
Interior (VLS:233): `padding:14px 0 2px; border-top:1px solid var(--border)` →
**línea superior** de separación y 14 px de aire.

- `<p>` bio (VLS:234): `font-size:14px; line-height:1.7; color:var(--text); margin:0 0 12px`.
- `<dl>` (VLS:235-238) «Colegiada/o» / «Idiomas», `display:grid; grid-template-columns:auto 1fr; gap:6px 12px; font-size:13px`; `dt` texto suave, `dd` texto en 600: **PROHIBIDO** (@s2 de `equipo.feature`). No se porta.

**4e. Chips de especialidad (VLS:242-246)**

`<ul style="display:flex;flex-wrap:wrap;gap:7px;margin:0;padding:0;list-style:none">`
con 3 `<li>` por tarjeta (`hint-placeholder-count="3"`, `p.tags`):
`background:var(--accent-soft); color:var(--accent-ink); font-size:12px; font-weight:600; padding:5px 11px; border-radius:30px`.

- Píldoras **en caja baja** (no versalitas, a diferencia del cintillo y de la
  píldora de categoría de Servicios), 12 px / 600, 5×11 px de relleno, radio
  píldora, 7 px entre sí, a la **izquierda**, al pie de la tarjeta.
- Las etiquetas del prototipo son credenciales inventadas: **no se portan**
  (`equipo.feature`, cabecera, punto 3).

### 5. Qué va centrado y qué a la izquierda

- **Centrado**: solo la cabecera de sección (cintillo, titular, párrafo), en su
  bloque de 640 px.
- **A la izquierda**: todo el interior de la tarjeta (nombre, cargo, panel,
  chips); el botón «+» va a la derecha de su fila por `space-between`.
- La rejilla llena el contenedor de 1220 px de borde a borde.

## Estado actual de la web

### DOM que pinta `src/components/Equipo.tsx`

```
<div id="equipo" class="seccionAlterna">                ← Landing.tsx:60 (fondo --color-fondo-alterno)
  <section aria-label="Equipo" class="equipo" data-contenedor-principal>   ← contenedor 1220 / padding-inline 24 por Landing.module.scss
    <p class="eyebrow">Nuestro equipo</p>
    <h2>Equipo</h2>
    <article class="tarjeta">                          ← Marcos Pérez
      <span aria-hidden="true" class="avatar">MP</span>
      <h3>Marcos Pérez</h3>
      <p>Veterinario</p>
      <button type="button" aria-expanded="false">Ver la formación de Marcos Pérez</button>
      (abierto) <p>Licenciado en veterinaria por la Universidad Complutense de Madrid</p>
    </article>
    <article class="tarjeta">                          ← Joaquín Herranz
      <span aria-hidden="true" class="avatar">JH</span>
      <h3>Joaquín Herranz</h3>
      <p>Auxiliar</p>
    </article>
  </section>
</div>
```

### Estilos reales (`Equipo.module.scss` + CSS compilado en `dist/`)

| Elemento | Declarado | Compilado / efecto |
| --- | --- | --- |
| `.equipo` | `display:grid; grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr)); gap:espaciado(24); align-items:start` | 3 pistas de ≈374 px a 1280 px (1172 px útiles); el cintillo y el `h2` ocupan `1 / -1`, así que la tercera pista no está vacía y `auto-fit` **no la colapsa**: las 2 tarjetas quedan a la izquierda con la tercera columna vacía |
| `.eyebrow` | `@include eyebrow` (12,8 px, tracking 0,12 em, 700, acento tinta, `margin-block-end` 4 px) | alineado a la **izquierda** |
| `h2` | `paso-tipografico(4)` (= `clamp(28px,4.2vw,46px)`), `margin-block-end` 8 px | mismo tamaño/peso/tracking que el prototipo (`global.scss`), pero **color heredado `--color-texto`** (#3C4C66), no tinta; a la izquierda; sin párrafo debajo |
| `.tarjeta` | `@include tarjeta` (superficie, borde fino, radio 24 px, sombra reposo→elevada, `overflow:hidden`, flex columna) + `padding:espaciado(24)` | tarjeta correcta como contenedor, pero **sin zona de imagen**, sin fila nombre/botón, sin chips |
| `.avatar` | `width:$altura-control-grande (56px); aspect-ratio:1; margin:espaciado(20) espaciado(20) 0; border-radius:50%; background:--color-acento-suave; color:--color-acento-tinta; paso-tipografico(1); 700` | compilado: **`margin:0`** (ver defecto 1) → círculo de 56 px pegado a la esquina superior izquierda del relleno |
| `h3` | `paso-tipografico(2)` = **25 px**, `margin-block-end` 4 px | color heredado (no tinta); mayor que los 20 px del diseño |
| `> p:first-of-type` (cargo) | `color:--color-acento-tinta; font-weight:600; margin-block-end:12px` | «Veterinario» en verde y negrita |
| `button` | texto plano, sin borde ni fondo, acento tinta, 600, `margin-block-start:auto`, `align-self:flex-start`, área táctil 24 px | «Ver la formación de Marcos Pérez» como enlace de texto al pie |
| `> p:last-child` | `margin-block-start:12px; color:--color-texto-suave` | pensado para la formación desplegada, pero en la tarjeta de Joaquín el **cargo** es también `:last-child` (ver defecto 2) |

### Lo que se ve en la captura (`web_01.png` y ≈ 1230-1400 y `web_02.png` y ≈ 0-160)

- Cintillo «NUESTRO EQUIPO» y titular «Equipo» a la izquierda, sin párrafo.
- Dos tarjetas blancas de ≈374 px a la izquierda; tercera columna vacía.
- Tarjeta de Marcos: círculo «MP» arriba a la izquierda, «Marcos Pérez» (25 px),
  «Veterinario» en verde negrita y el enlace «Ver la formación de Marcos Pérez».
  Alto ≈197 px.
- Tarjeta de Joaquín: círculo «JH», «Joaquín Herranz», «Auxiliar» en **gris
  regular y más separado** (12 px extra). Alto ≈181 px: **las dos tarjetas
  cerradas tienen alturas distintas**.
- La sección mide 512 px de alto (`web_secciones.json`) frente a 1303 px del
  prototipo (que lleva 6 tarjetas); con la anatomía nueva y 2 tarjetas quedará
  en ≈800 px.
- Fondo de la sección `--color-fondo-alterno` (#EDF2F9); en el prototipo el
  equipo va sobre `--bg` (#F8FAFC).
- Nada cortado, nada desbordado, ninguna imagen rota: el problema es que la
  tarjeta no tiene la geometría del prototipo (sin zona de imagen, sin botón
  redondo, sin chips) y la cabecera no está centrada.

### Defectos verificados

1. **`espaciado(20)` no existe** en `$escala-espaciado` (`_api.scss`: pasos 4,
   8, 12, 16, 24, 32, 48, 64, 96). `map.get` devuelve `null` y Sass omite los
   `null` de la lista: `margin: espaciado(20) espaciado(20) 0` compila a
   **`margin:0`** (`dist/assets/index-CCVUwotx.css`:
   `._avatar_10y5p_49{…margin:0…}`). El desplazamiento del avatar que el fichero
   pretende declarar es letra muerta. Mismo defecto documentado para
   `Servicios.module.scss` en `delta_servicios.md` (servicios-8).
2. **Selectores por posición incoherentes**: `> p:first-of-type` (cargo, verde
   600) y `> p:last-child` (formación, gris) chocan en la tarjeta sin botón:
   el cargo «Auxiliar» de Joaquín recibe las dos reglas y gana la segunda por
   orden de fichero → gris, regular y con `margin-block-start:12px`. Dos
   tarjetas, dos estilos de cargo.
3. **Alturas desiguales** entre tarjetas cerradas (197 vs 181 px): la anatomía
   no es la misma en las dos (una lleva botón, la otra no) y no hay ninguna fila
   de altura mínima que las iguale.

## Diferencias

| id | Qué cambia | Tipo | Prioridad |
| --- | --- | --- | --- |
| equipo-1 | Cabecera de sección en bloque centrado de 640 px: cintillo + titular + párrafo, todo `text-align:center`; hoy cintillo y titular a la izquierda y sin párrafo | estructura | alta |
| equipo-2 | Zona superior de la tarjeta con proporción **4:3** a todo el ancho (panel de marca `--color-primario`) con el círculo de iniciales centrado dentro (96 px, `espaciado(96)`); hoy círculo de 56 px suelto en la esquina | estructura | alta |
| equipo-3 | Fila de cabecera de tarjeta: nombre + cargo a la izquierda y botón redondo «+» (48 px, `$altura-control-media`) a la derecha con `space-between`; hoy botón de texto al pie | estructura | alta |
| equipo-4 | Rejilla de tarjetas con la geometría de 3 columnas del prototipo (`minmax(min(300px,100%),1fr)`), separada de la cabecera; con 2 miembros `auto-fit` estiraría cada tarjeta a ≈573 px y rompería la proporción 4:3 visual, así que se usa **`auto-fill`** (mantiene la pista vacía; tarjetas de ≈373 px) | estructura | alta |
| equipo-5 | Tarjetas cerradas de la **misma altura**: misma anatomía en todas y fila de cabecera con `min-height` = altura del botón (48 px), tenga botón o no | estilo | media |
| equipo-6 | Ficha desplegada (la formación) con **línea superior** `1px --color-borde`, relleno 16/0/4 y texto `--color-texto` 16 px / 1,7; hoy párrafo suelto en texto suave | estructura | media |
| equipo-7 | Fila de **chips** (`ul > li`, caja baja, acento suave/acento tinta, 12,8 px / 600, radio píldora) solo cuando el profesional tenga especialidades publicadas; hoy no existe ni la ruta de render ni el campo de datos (ver «Datos reales necesarios») | estructura | media |
| equipo-8 | `h2` y `h3` en `--color-tinta` (el `--ink` del prototipo); hoy heredan `--color-texto` | estilo | media |
| equipo-9 | Cargo en `--color-texto-suave`, 12,8 px (`paso-tipografico(-1)`), peso normal, 4 px bajo el nombre; hoy acento tinta 600 (y gris en la tarjeta sin botón, defecto 2) | estilo | media |
| equipo-10 | Nombre `h3` a `paso-tipografico(1)` = 20 px, `line-height:1.2`; hoy 25 px (ya recomendado en `progress/rediseno/matriz_delta.md`, Y-04) | estilo | media |
| equipo-11 | Botón «+» con estado abierto: fondo `--color-primario`, glifo `--color-sobre-primario`, `rotate(45deg)`; transiciones 300 ms (`transform`) / 150 ms (`background-color`, `color`) dentro de `prefers-reduced-motion: no-preference` | estilo | media |
| equipo-12 | Cintillo con 12 px de aire por debajo (`margin-block-end: espaciado(12)`; el mixin trae 4 px) y párrafo con 16 px por encima; separación cabecera → rejilla `espaciado(48)` (prototipo: clamp 36-52) | estilo | baja |
| equipo-13 | `margin: espaciado(20) …` compila a `margin:0` (paso inexistente): retirar toda referencia a `espaciado(20)` del módulo | bug | alta |
| equipo-14 | Selectores `> p:first-of-type` / `> p:last-child` sustituidos por clases explícitas del módulo (`.fila`, `.ficha`) para que el cargo se pinte igual en todas las tarjetas | bug | alta |
| equipo-15 | Rótulos invertidos respecto al prototipo: prototipo cintillo «Equipo» + `h2` «Nuestro equipo»; web cintillo «Nuestro equipo» + `h2` «Equipo». Cambiarlos rompe @s1/@s10 de `equipo.feature` (ver conflicto E1) | dato | baja |
| equipo-16 | Párrafo de cabecera: el del prototipo es falso; se propone uno **derivado** del recuento real y del nombre comercial, o dejar el hueco (ver E2) | dato | media |
| equipo-17 | Fondo de sección: prototipo `--bg` (claro), web `--color-fondo-alterno`. Lo decide el bandeado global de `Landing.tsx`/`Landing.module.scss` (@s26 de `tokens-aplicados`): **fuera del alcance de este componente**; ya recogido en `delta_global.md` (global-3, «las 7 bandas van al revés») | estilo | baja |
| equipo-18 | El glifo «+» del botón va `aria-hidden` y el nombre accesible sigue siendo el de `rotuloBoton` («Ver/Ocultar la formación de X»): el prototipo usa el mismo patrón (VLS:229, VLS:742) | estructura | baja |

## Datos reales necesarios

| Campo que pide la anatomía | ¿Existe? | Dónde | Alternativa honesta si no existe |
| --- | --- | --- | --- |
| Nombre del profesional | **Sí** | `src/data/equipo.ts` (`nombre`); `docs/datos-galapavet.md` §4 | — |
| Cargo | **Sí** | `src/data/equipo.ts` (`rol`): «Veterinario», «Auxiliar» | — |
| Texto de la ficha desplegable (el prototipo muestra «bio») | **Parcial**: solo la formación de Marcos Pérez (`formacion`); Joaquín sin formación publicada | `src/data/equipo.ts`; docs §4 | Ya resuelto por el contrato: la ficha es la **formación**; sin formación → sin botón ni ficha (@s7). No se inventa ninguna bio |
| Retrato (`img` + `alt`) | **No** | docs §4 no recoge fotografías; `equipo.feature`, PENDIENTE «RETRATOS DEL EQUIPO» | **Panel de marca** 4:3 (`--color-primario`) con el círculo de iniciales (`inicialesDe`) centrado: misma geometría, cero fotografía (@s11, @s32). Cuando el cliente entregue retratos, el `<img>` sustituirá al círculo dentro del mismo panel |
| Número de colegiado / idiomas (`dl`) | **No** y **prohibido** | docs §7 (FALSOS); @s2 | No se porta el `dl` |
| Chips de especialidad por miembro (`tags`) | **No** | docs §4 no publica especialidades; `equipo.feature`, cabecera, punto 3 | Añadir a `Profesional` el campo opcional `especialidades?: readonly string[]` **sin valor** para los dos reales (dato pendiente del cliente, anotar en docs §9) y renderizar la `<ul>` solo cuando `especialidadesVisibles()` devuelva algo. Hoy ninguna tarjeta pinta chips; la ruta de render queda probada con un listado de prueba, como hace @s8 con la independencia entre tarjetas. Alternativa mínima: no tocar datos y dejar el hueco |
| Párrafo de cabecera («Seis profesionales colegiados…») | **No** (el del prototipo es falso) | `equipo.feature`, cabecera, punto 4 | Texto **derivado** por `resumenDelEquipo(recuento, hayFormacion, nombreComercial)`: recuento = `profesionalesValidos(listado).length` (hoy 2), nombre comercial = `datosNegocio.identidad.nombreComercial` (`src/lib/site.ts`), y la pista «Pulsa el + para ver la formación publicada.» solo si algún profesional tiene formación. Literal propuesto para los datos reales: «2 profesionales en el equipo de Galapavet. Pulsa el + para ver la formación publicada.» (singular «1 profesional…» si el recuento es 1). No afirma colegiación, antigüedad, permanencia ni disponibilidad. Alternativa: omitir el `<p>` (hueco) |
| Recuento de tarjetas (6 en el prototipo) | **Sí** | `EQUIPO.length` = 2 | — (@s50 exige el real) |
| Rótulos «Equipo» / «Nuestro equipo» | No son datos de negocio | Ya presentes en `Equipo.tsx`, invertidos | Ver conflicto E1 |
| Nombre comercial para el párrafo | **Sí** | `src/lib/site.ts` → `datosNegocio.identidad.nombreComercial` | — |

## Conflictos con el contrato vigente

| # | Escenario aprobado | Tensión con el prototipo | Propuesta |
| --- | --- | --- | --- |
| E1 | `features/equipo.feature` **@s1** («encabezado de nivel 2 cuyo nombre accesible es "Equipo"») y **@s10**; test unitario @s33 de `Equipo.test.tsx` (cintillo literal «Nuestro equipo») | El prototipo pone el cintillo «Equipo» y el `h2` «Nuestro equipo» (VLS:212-213); la web los tiene al revés | **Enmendar** (decisión humana): `h2` = «Nuestro equipo», cintillo = «Equipo»; la región conserva `aria-label="Equipo"` (así «existe una región "Equipo"» de @s1 y el ancla `#equipo` del menú siguen valiendo). Justificación: son rótulos neutros, no datos ni promesas; ninguno afirma nada sobre Galapavet; el cambio es de una palabra y es lo primero que el cliente lee en la sección. Si se **respeta** el contrato, todo el resto del plan sigue igual y solo se pierde esa palabra |
| E2 | `equipo.feature`, cabecera, punto 4 (copy «Seis profesionales colegiados» eliminado); `rediseno_visual` **@s49/@s52** (literales del prototipo y afirmaciones) | La anatomía lleva un párrafo bajo el titular | **Respetar** con texto derivado (`resumenDelEquipo`) o hueco; nunca el copy del prototipo. Decisión humana sobre el literal propuesto en «Datos reales necesarios» |
| E3 | `equipo.feature`, cabecera, punto 3 (etiquetas de especialidad eliminadas: «asignarlas sería inventar credenciales») | La anatomía lleva una fila de chips | **Respetar**: chips solo desde un campo real (`especialidades`), hoy vacío → no se pintan. Decisión humana: crear ya la ruta de render (recomendado: cuando el cliente entregue el dato será un cambio de datos, no de código) o no tocar `src/data/equipo.ts` |
| E4 | `equipo.feature` **@s7** («el texto accesible de la tarjeta de "Joaquín Herranz" se limita a "Joaquín Herranz" y "Auxiliar"»; test con igualdad exacta `'Joaquín HerranzAuxiliar'`) | Cualquier texto extra en la tarjeta (chips, relleno, «Sin formación publicada») la rompe | **Respetar**: el párrafo de cabecera vive FUERA de los `article`; el panel de marca no lleva texto accesible (el círculo sigue `aria-hidden`); ningún texto de sustitución en la tarjeta sin formación |
| E5 | `equipo.feature` **@s2** (sin «Colegiad», «Idiomas», «nº») | El panel del prototipo lleva el `dl` | **Respetar**: no se porta. El párrafo derivado no usa «nº» |
| E6 | `equipo.feature` **@s11** y `rediseno_visual` **@s32** («no hay ni una sola imagen en toda la sección»; «avatar con las iniciales… sobre el acento suave de la variante») + test que exige literalmente `background-color: var(--color-acento-suave);` dentro del bloque `.avatar {}` | La zona de imagen del prototipo es una `<img>` | **Respetar**: la zona es un `<div>` sin `<img>`; el círculo `.avatar` conserva el acento suave (el test lo lee en crudo: ningún bloque anidado delante de esa línea); el panel que lo rodea usa `--color-primario` |
| E7 | `rediseno_visual` **@s33** (cintillo con `@include eyebrow` y **sin** `color:` propio en el bloque `.eyebrow {}`; test que lee el SCSS con `?raw`) | La cabecera centrada obliga a tocar el bloque `.eyebrow` | **Respetar**: el bloque solo añade `margin-block-end: espaciado(12);`; el centrado lo hereda del contenedor `.cabecera { text-align: center }` |
| E8 | `rediseno_visual` **@s23** (`tests/e2e/geometria-escalas.spec.ts`: el círculo es `#equipo span[aria-hidden="true"]` **primero**, radio 50 %) y `Equipo.test.tsx` @s7/@s32 (`querySelector('[aria-hidden="true"]')` → iniciales) | Nuevos elementos decorativos (panel, glifo «+») | **Respetar**: el `<div>` del panel **no** lleva `aria-hidden`; el `<span aria-hidden>` del avatar es el primer elemento del `article`; el glifo «+» (`span aria-hidden` dentro del botón) va después en el DOM |
| E9 | `rediseno_visual` **@s24** (`#equipo article` primero con `--sombra-reposo`; alguna tarjeta sube a elevada) y **@s47** de `layout.spec.ts` (`mixin tarjeta` sin `height`) | — | **Respetar**: la tarjeta sigue con `@include tarjeta`; nada declara `height` en la tarjeta |
| E10 | `rediseno_visual` **@s19** (el relleno vertical lo pone solo el wrapper; se mide en `#equipo > *`) | El prototipo lo declara en la sección | **Respetar**: `Equipo.module.scss` no declara `padding-block` |
| E11 | `sistema_de_diseno_visual` @s33 (toda `transition` dentro de `@media (prefers-reduced-motion: …)`, `movimientoRespetuoso.ts`) e `identidad_visual` (escala de movimiento: solo 150 ms y 300 ms, curva `ease-out`, `escalaMovimiento.ts`) | El prototipo usa `.3s ease` para transform/fondo/color | **Respetar**: `transition: transform 300ms ease-out, background-color 150ms ease-out, color 150ms ease-out` dentro del `@media` |
| E12 | `identidad_visual` @s11 matriz de contraste (`matrizDeContraste.ts`, reconciliación contra el texto de cada `.module.scss`: par = último `background-color: var(--color-…)` en vigor + `color: var(--color-…)`) | Pares nuevos | **Respetar**: (acento-tinta, acento-suave) → círculo y botón cerrado, ya en la matriz; (sobre-primario, primario) → botón abierto, ya en la matriz; el panel `--color-primario` **no** lleva ninguna `color:` anidada. Si el craftsman declara `color: var(--color-tinta)` en el `h2` de la cabecera y la puerta reclama el par (tinta, fondo-alterno), se añade a `MATRIZ_DE_USO_DEL_SISTEMA` con su cita (ratio ≥ 9 en las cinco variantes) |
| E13 | Decisión 24 (`estudio_diseno_referencia.md` §3: «No copies estos valores») y `rediseno_visual` @s23 («nunca un número copiado del prototipo») | Los px del prototipo (44, 20, 13, 14, 26, 52, 30…) | **Respetar**: se portan por escala: 44 → `$altura-control-media` (48); 20 (h3) → `paso-tipografico(1)`; 13/12 → `paso-tipografico(-1)`; 14/17 → `paso-tipografico(0)`; 22 → `paso-tipografico(2)`; 26 → `espaciado(24)`; 52 → `espaciado(48)`; 20/22 (relleno) → `espaciado(24)`; 14 (gap) → `espaciado(16)`; 12 → `espaciado(12)`; 3 → `espaciado(4)`; 7 → `espaciado(8)`; 5×11 → `espaciado(4)`/`espaciado(12)`; 30 → `$radio-completo`; 20 (tarjeta) → `$radio-grande`; 1 px → `$ancho-borde-fino`. El único número nuevo es `max-width: 640px` de la cabecera, del mismo tipo que los `860px`/`820px`/`700px` ya declarados en `Faq.module.scss:11` y `Hero.module.scss:64-75` |
| E14 | `rediseno_visual` **@s48** e `identidad_visual` @s49 (`css-presupuesto.spec.ts`: techo 8000 B comprimidos; medido 5791 B) | Más CSS | **Respetar**: +≈900 B en crudo ≈ +200 B comprimidos; volver a medir tras el build |
| E15 | `tokens-aplicados.spec.ts` **@s26** (bandeado sin 3 fondos iguales seguidos) | El prototipo pinta el equipo sobre `--bg` | **Respetar aquí**; el cambio de banda es global y está en `delta_global.md` (global-3) |

## Tests que romperán

### Unitarios (`src/**/*.test.ts(x)`)

| Test | Fichero | Por qué |
| --- | --- | --- |
| `@s1 … hay un h2 "Equipo", una región accesible "Equipo" y, dentro, exactamente 2 h3 con sus roles` | `src/components/Equipo.test.tsx` | Solo si se aprueba **E1**: el `h2` pasa a «Nuestro equipo» y `getByRole('heading', { level: 2, name: 'Equipo' })` deja de resolver. Con E1 rechazada no rompe |
| `@s10 … no hay ningún h2 "Equipo" ni ninguna región "Equipo"` | `Equipo.test.tsx` | Solo con **E1**: el `queryByRole` por nombre «Equipo» debe pasar a «Nuestro equipo» (seguiría verde por vacuidad, pero dejaría de medir lo que dice) |
| `@s33 … hay un <p> con el cintillo, antes del <h2> "Equipo", y no es un encabezado` | `Equipo.test.tsx` | Solo con **E1**: `ROTULO_CINTILLO` tecleado a mano pasa a «Equipo» y el encabezado a «Nuestro equipo» |
| `@s33 … el cintillo usa el mecanismo real de versalitas con acento tinta` | `Equipo.test.tsx` | Rompe si el bloque `.eyebrow {}` declara `color:` o anida un bloque antes del cierre (la regex `/\.eyebrow\s*\{([^}]*)\}/` corta en la primera `}`). Se mantiene plano: `@include eyebrow;` + `margin-block-end` |
| `@s32 … avatar con las iniciales … sobre el acento suave` | `Equipo.test.tsx` | Rompe si `.avatar {}` pierde la línea literal `background-color: var(--color-acento-suave);` o si algún bloque anidado precede a esa línea; también si el primer `[aria-hidden="true"]` de la tarjeta deja de ser el círculo (p. ej. si el panel llevara `aria-hidden`) |
| `@s7 … la tarjeta de Joaquín se limita a su nombre y su rol` (`'Joaquín HerranzAuxiliar'`) | `Equipo.test.tsx` | Rompe si la tarjeta gana texto (chips, relleno) o si el párrafo de cabecera se mete dentro del `article`. Con el plan sigue verde |
| `@s7 … avatar de iniciales con texto propio y oculto` (`'JH'`) | `Equipo.test.tsx` | Rompe si el glifo «+» `aria-hidden` o el panel preceden al avatar en el DOM |
| `@s3-@s6` (nombre accesible del botón) | `Equipo.test.tsx` | **No rompen**: el nombre pasa de texto visible a `aria-label` con el mismo valor de `rotuloBoton` |
| Puertas que leen todos los `.module.scss`: `matrizDeContraste.test.ts` (reconciliación de pares), `movimientoRespetuoso.test.ts`, `escalaMovimiento.test.ts` (150/300 ms, `ease-out`, sin `all`), `usoDelAcento.test.ts` (`--color-acento` solo como relleno), `rolesDescartados.test.ts` (afirmaciones «24 h», «365»…), `inventarioModulos.test.ts` | `src/lib/diseno/*.test.ts` | Rompen solo si el SCSS nuevo viola la regla correspondiente (ver E11, E12). Ninguna requiere cambios de test |
| `Equipo-logica.test.ts` | `src/components/Equipo-logica.test.ts` | No rompe; se amplía con las funciones nuevas |

### E2E (`tests/e2e/*.spec.ts`, contra `dist/`)

| Test | Fichero | Por qué |
| --- | --- | --- |
| `@s23 más de tres valores de radio distintos, con los cinco conceptos nombrados presentes` | `geometria-escalas.spec.ts:468` | `#equipo span[aria-hidden="true"]` **primero** debe seguir siendo el círculo con `50%`. Rompe si el avatar deja de ser `span`, si el panel lleva `aria-hidden` o si el glifo «+» aparece antes en el DOM |
| `@s24 reposo y elevada son dos sombras distintas…` | `geometria-escalas.spec.ts:524` | `#equipo article` primero en `--sombra-reposo`: sigue verde con `@include tarjeta` |
| `@s19 el relleno vertical de "Equipo"… fluido` | `geometria-escalas.spec.ts:197` | Mide `#equipo > *`: rompe si el módulo vuelve a declarar `padding-block` |
| `@s47 los pies de las tarjetas de una misma fila quedan alineados…` | `layout.spec.ts:111` | Selector `section[data-contenedor-principal] > article`: al pasar los `article` a un `<div class="rejilla">`, Equipo sale de la muestra (no rompe). Si se dejaran como hijos directos, solo Marcos tiene botón → una caja por fila → sin aserción |
| `@s34/@s47 … interacción con … una ficha de equipo …` | `red-limpia.spec.ts:133` | `page.locator('section', { hasText: 'Equipo' }).getByRole('button').first()` → el «+» de Marcos. No rompe; cualquier `key` duplicada en los chips o aviso de React sí lo haría (0 avisos) |
| `@s50 los tres listados de la portada muestran el recuento del catálogo real` | `datos-reales.spec.ts:172` | `#equipo article` = 2: no rompe |
| `@s49` literales ficticios / `@s52` afirmaciones | `datos-reales.spec.ts` | Rompen solo si el párrafo de cabecera contiene un literal del prototipo o «24 h»/«365»: el texto derivado no los contiene |
| `@s37 todo objetivo táctil … >= 24×24` y `@s45` axe (30 combinaciones) | `accesibilidad.spec.ts` | Botón de 48×48 con `aria-label`: pasa. Rompe si el `<ul>` se renderiza vacío (regla `list` de axe) → solo se pinta con ≥ 1 `<li>` |
| `@s49 el peso del CSS servido no supera el techo` | `css-presupuesto.spec.ts` | Riesgo bajo (+≈200 B comprimidos sobre 5791 B; techo 8000). Medir tras el build |
| `@s44 las 6 rutas a 320px: sin desbordamiento` | `fidelidad.spec.ts:373` | Rompe si la columna del nombre no lleva `min-width: 0` o si el círculo de 96 px no cabe en el panel (a 320 px la tarjeta mide ≥ 272 px → panel de 204 px de alto: cabe) |
| `movimiento.spec.ts` (0 transiciones ≠ 0,01 ms bajo `reduce`) | `movimiento.spec.ts:9` | Rompe si la `transition` del botón queda fuera del `@media (prefers-reduced-motion: no-preference)` |
| `@s26 … secciones no comparten todas el mismo fondo` | `tokens-aplicados.spec.ts:104` | No se toca el wrapper: no rompe |

## Plan de cambio

Orden pensado para TDD (rojo → verde → refactor) con la lógica pura en
`Equipo-logica.ts` (mutación al 100 %) y el `.tsx` solo cableando. Los pasos 0
y 1 los hace el `craftsman_lead` (contrato y docs); del 2 en adelante el
`tdd_craftsman`.

0. **Puerta humana** (antes de tocar `src/`): decidir E1 (intercambio de
   rótulos), E2 (literal del párrafo derivado o hueco) y E3 (campo
   `especialidades` opcional o nada). Escribir `features/fidelidad_equipo.feature`
   con los escenarios nuevos (cabecera centrada; panel 4:3 con iniciales; fila
   nombre/cargo/«+»; rejilla `auto-fill`; ficha con línea superior; chips solo
   con dato real; párrafo derivado; alturas iguales) y, si procede, la enmienda
   de @s1/@s10 de `equipo.feature` registrada en
   `progress/rediseno/enmiendas_contrato.md` (antes/después literal). Aprobar.
1. **Docs** (`docs/datos-galapavet.md` §9, solo si E3 = sí): añadir el punto
   «Especialidades por profesional» a los datos que el cliente no publica.
2. **`src/data/equipo.ts`** (solo si E3 = sí): `readonly especialidades?: readonly string[]`
   en `Profesional`, con comentario «pendiente del cliente, docs §9»; los dos
   reales quedan sin el campo. Ningún valor.
3. **`src/components/Equipo-logica.test.ts` → `Equipo-logica.ts`** (rojo primero):
   - `especialidadesVisibles(especialidades: readonly string[] | undefined): string[]`:
     `undefined` → `[]`; recorta y descarta cadenas en blanco; conserva el orden.
     Tests: `undefined`, `[]`, `['A', ' ', 'B']` → `['A', 'B']`, `[' C ']` → `['C']`.
   - `hayFormacionPublicada(listado: readonly Profesional[]): boolean`
     (`some(tieneFormacion)`). Tests: listado real (true), listado sin
     formación (false), vacío (false).
   - `resumenDelEquipo(recuento: number, hayFormacion: boolean, nombreComercial: string): string`:
     `1` → «1 profesional en el equipo de X.»; `n ≥ 2` → «n profesionales en el
     equipo de X.»; sufijo « Pulsa el + para ver la formación publicada.» solo
     si `hayFormacion`; `0` → `''`. Tests por valor de cada rama (singular,
     plural, con y sin pista, cero), con cada literal tecleado a mano para que
     la mutación de cadenas muerda.
   - Se conservan `rotuloBoton`, `tieneFormacion`, `inicialesDe`,
     `profesionalesValidos`.
4. **`src/components/Equipo.test.tsx`** (rojo primero) — nuevos `describe` con
   el tag del escenario de `fidelidad_equipo.feature`:
   - Cabecera: dentro de la `section` hay, en este orden, `<p>` cintillo,
     `<h2>`, `<p>` resumen; el resumen con los datos reales es exactamente
     «2 profesionales en el equipo de Galapavet. Pulsa el + para ver la
     formación publicada.» (tecleado a mano); con un listado sin formación no
     contiene «Pulsa el +»; el resumen **no** está dentro de ningún `article`.
   - Tarjeta: el primer hijo del `article` es un `div` (panel) cuyo único
     contenido es el `span aria-hidden` con las iniciales; el `h3` y el `p` del
     cargo van dentro de la fila; el botón contiene un `span aria-hidden` con
     «+» y su nombre accesible sigue siendo «Ver la formación de Marcos Pérez».
   - Chips (si E3): con un listado de prueba `{ especialidades: ['Uno', ' ', 'Dos'] }`
     la tarjeta contiene una `ul` con exactamente 2 `li` («Uno», «Dos»); con el
     listado real no hay ninguna `ul` en la sección; `textoAccesibleDe(Joaquín)`
     sigue siendo `'Joaquín HerranzAuxiliar'`.
   - SCSS en crudo (patrón `?raw` del repo): el bloque `.panel {}` contiene
     `aspect-ratio: 4 / 3;` y `background-color: var(--color-primario);`; el
     bloque `.rejilla {}` contiene `repeat(auto-fill, minmax(min(300px, 100%), 1fr))`;
     `.cabecera {}` contiene `text-align: center;` y `max-width: 640px;`; el
     bloque del botón contiene `border-radius: $radio-circulo;`,
     `width: $altura-control-media;` y `rotate(45deg)` bajo
     `&[aria-expanded='true']`; el fichero no contiene `espaciado(20)`.
   - Si E1: actualizar los literales «Equipo»/«Nuestro equipo» de @s1, @s10 y
     @s33 (y el helper `obtenerSeccionEquipo`).
5. **`src/components/Equipo.tsx`** — DOM objetivo (sin lógica de decisión):

   ```tsx
   <section aria-label="Equipo" className={styles.equipo} data-contenedor-principal>
     <div className={styles.cabecera}>
       <p className={styles.eyebrow}>{ROTULO_CINTILLO}</p>      {/* «Equipo» si E1; hoy «Nuestro equipo» */}
       <h2>{TITULO}</h2>                                          {/* «Nuestro equipo» si E1; hoy «Equipo» */}
       <p>{resumenDelEquipo(validos.length, hayFormacionPublicada(validos), datosNegocio.identidad.nombreComercial)}</p>
     </div>
     <div className={styles.rejilla}>
       {validos.map((p) => <TarjetaProfesional key={p.nombre} profesional={p} />)}
     </div>
   </section>

   // TarjetaProfesional
   <article className={styles.tarjeta}>
     <div className={styles.panel}>
       <span aria-hidden="true" className={styles.avatar}>{inicialesDe(nombre)}</span>
     </div>
     <div className={styles.cuerpo}>
       <div className={styles.fila}>
         <div>
           <h3>{nombre}</h3>
           <p>{rol}</p>
         </div>
         {conFormacion && (
           <button type="button" aria-expanded={abierto} aria-label={rotuloBoton(abierto, nombre)} onClick={…}>
             <span aria-hidden="true">+</span>
           </button>
         )}
       </div>
       {conFormacion && abierto && <div className={styles.ficha}><p>{formacion}</p></div>}
       {chips.length > 0 && <ul className={styles.chips}>{chips.map((c) => <li key={c}>{c}</li>)}</ul>}
     </div>
   </article>
   ```

   `chips = especialidadesVisibles(profesional.especialidades)` (o `[]` si
   E3 = no). Importar `datosNegocio` de `../lib/site`. Sin `id`, sin `padding`
   propio, sin más estado que el `useState` por tarjeta (@s8). El render de la
   formación sigue siendo condicional (no `max-height`), por @s3.
6. **`src/components/Equipo.module.scss`** — reescritura completa (valores por
   escala; ningún `espaciado(20)`; ningún `padding-block`; ninguna `transition`
   fuera de `@media`; en cada bloque `background-color` **antes** que `color`):

   | Clase | Declaraciones |
   | --- | --- |
   | `.equipo` | bloque normal (deja de ser rejilla). Conservar el comentario de cabecera sobre wrapper/padding |
   | `.cabecera` | `max-width: 640px; margin-inline: auto; text-align: center;` |
   | `.cabecera .eyebrow` | `@include eyebrow; margin-block-end: espaciado(12);` (sin `color:`) |
   | `.cabecera h2` | `font-family: var(--fuente-titulares); font-size: paso-tipografico(4); color: var(--color-tinta);` (peso 600, tracking −0,015 em y `line-height` 1,08 ya vienen de `global.scss`) |
   | `.cabecera > p` | `margin-block-start: espaciado(16); font-size: paso-tipografico(0); line-height: 1.7; color: var(--color-texto-suave);` |
   | `.rejilla` | `display: grid; grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); gap: espaciado(24); margin-block-start: espaciado(48); align-items: start;` |
   | `.tarjeta` | `@include tarjeta;` (sin `padding`) |
   | `.panel` | `display: grid; place-items: center; width: 100%; aspect-ratio: 4 / 3; background-color: var(--color-primario);` (sin ninguna `color:` dentro) |
   | `.avatar` | `display: grid; place-items: center; width: espaciado(96); aspect-ratio: 1; border-radius: $radio-circulo; background-color: var(--color-acento-suave); color: var(--color-acento-tinta); font-family: var(--fuente-titulares); font-size: paso-tipografico(3); font-weight: 700;` (bloque plano, hermano de `.panel`, no anidado) |
   | `.cuerpo` | `display: flex; flex-direction: column; gap: espaciado(16); padding: espaciado(24);` |
   | `.fila` | `display: flex; align-items: center; justify-content: space-between; gap: espaciado(12); min-height: $altura-control-media;` |
   | `.fila > div` | `min-width: 0;` |
   | `.fila h3` | `font-family: var(--fuente-titulares); font-size: paso-tipografico(1); line-height: 1.2; color: var(--color-tinta);` |
   | `.fila p` | `margin-block-start: espaciado(4); font-size: paso-tipografico(-1); color: var(--color-texto-suave);` |
   | `.fila button` | `@include foco-visible; @include area-tactil-minima; flex-shrink: 0; display: grid; place-items: center; width: $altura-control-media; height: $altura-control-media; padding: 0; border: $ancho-borde-fino solid var(--color-borde); border-radius: $radio-circulo; background-color: var(--color-acento-suave); color: var(--color-acento-tinta); font-size: paso-tipografico(2); line-height: 1; cursor: pointer;` + `@media (prefers-reduced-motion: no-preference) { transition: transform 300ms ease-out, background-color 150ms ease-out, color 150ms ease-out; }` + `&[aria-expanded='true'] { background-color: var(--color-primario); color: var(--color-sobre-primario); transform: rotate(45deg); }` |
   | `.ficha` | `padding-block: espaciado(16) espaciado(4); border-block-start: $ancho-borde-fino solid var(--color-borde); font-size: paso-tipografico(0); line-height: 1.7; color: var(--color-texto);` |
   | `.chips` | `display: flex; flex-wrap: wrap; gap: espaciado(8); margin: 0; padding: 0; list-style: none;` |
   | `.chips li` | `display: inline-flex; align-items: center; padding-block: espaciado(4); padding-inline: espaciado(12); border-radius: $radio-completo; background-color: var(--color-acento-suave); color: var(--color-acento-tinta); font-size: paso-tipografico(-1); font-weight: 600;` |

   Nota sobre `height` en el botón: es un control, no una tarjeta; la puerta
   @s47 solo inspecciona el `mixin tarjeta`. Nota sobre `max-width: 640px`:
   mismo tipo de medida que `Faq.module.scss:11` y `Hero.module.scss:64`. El
   estado abierto/cerrado vive en `aria-expanded`, nunca en una clase (patrón
   `estado-condicional-en-atributo-aria-no-en-clase-css`).
7. **Matriz de contraste** (`src/lib/diseno/matrizDeContraste.ts`): ejecutar
   `matrizDeContraste.test.ts`; si la reconciliación reclama (tinta,
   fondo-alterno) por el `h2`, añadir la entrada con cita a
   `Equipo.module.scss` (ratio ≥ 9 en las cinco variantes).
8. **Puertas**: `bin\harness.ps1 test` (unitarios + puertas de estilos),
   `pnpm build`, `pnpm test:e2e` (atención a @s23, @s24, @s34, @s44, @s45,
   @s49, @s50), `bin\harness.ps1 mutate src/components/Equipo-logica.ts`
   (100 %). Anotar el peso CSS medido en `progress/tdd_fidelidad_equipo.md`.
9. **Cierre**: `progress/tdd_fidelidad_equipo.md` (ciclos rojo/verde, mapa
   cláusula → aserción), `judge` → `progress/judge_fidelidad_equipo.md`,
   `mutation_tester` → `progress/mutation_fidelidad_equipo.md`; capturas
   antes/después a 1280 px y a 320 px junto al prototipo.

### Riesgos y notas para el craftsman

- `espaciado(20)` también está en `Servicios.module.scss` (h3, píldora, botón,
  lista): mismo defecto, documentado en `delta_servicios.md`. No se toca aquí,
  pero conviene que la puerta de estilos gane un test que prohíba pasos
  inexistentes de `$escala-espaciado` (`map.get` → `null`) en todos los
  `.module.scss`.
- El bandeado de fondos (prototipo: equipo sobre `--bg`) se decide en
  `Landing.module.scss` (`delta_global.md`, global-3); cambiar solo el wrapper
  de `#equipo` a `.seccion` dejaría campañas + equipo + reserva con el mismo
  fondo y rompería @s26.
- Con `auto-fill` y dos miembros, la tercera pista queda vacía a partir de
  ≈980 px de ancho: es la geometría del prototipo (tarjeta de ≈373 px, panel
  de ≈280 px). Si el humano prefiere las dos tarjetas centradas, la alternativa
  es `justify-content: center` con pistas de anchura acotada
  (`repeat(auto-fill, minmax(300px, 373px))`), lo que introduce un número
  nuevo: mejor no, salvo decisión expresa.
- El botón «+» rota con `transform`; bajo `prefers-reduced-motion: reduce`
  cambia de estado sin animar (la consulta global de `global.scss` corta las
  duraciones a 0,01 ms).
- En la variante `tech` el panel de marca es cian (`--color-primario` #06B6D4)
  y el círculo va sobre `--color-acento-suave` #12394A con glifo #67E8F9: se
  ve, pero conviene comprobarlo en la captura de las cinco variantes (@s45).
