# Análisis de contraste WCAG 2.2 — las 5 paletas del sitio

> **Regla de este informe:** cada hexadecimal y cada ratio de aquí es rastreable a
> una línea concreta de un fichero concreto. Ningún color se ha escrito de memoria
> y ningún ratio se ha estimado a ojo. Lo que no está en la fuente se marca como
> **NO CONSTA EN LA FUENTE**.
>
> **Fecha del análisis:** 26/08/2026.

## 0. Método y trazabilidad

### 0.1 Fórmula usada

La del propio repositorio, ejecutada, no reproducida: `src/lib/contraste.ts`.

- Luminancia relativa: `src/lib/contraste.ts:34-47` — linealización de canal con
  umbral `0.03928` (`:9`), divisor `12.92` (`:10`), desplazamiento `0.055` (`:11`),
  divisor `1.055` (`:12`), exponente `2.4` (`:13`); pesos `0.2126 / 0.7152 / 0.0722`
  (`:14-16`).
- Ratio: `src/lib/contraste.ts:63-72` — `(másClara + 0.05) / (másOscura + 0.05)`,
  con `COMPENSACION_LUMINANCIA = 0.05` (`:17`).
- **La función es simétrica** (documentado en `src/lib/contraste.ts:58-62`: «invertir
  los dos argumentos da el mismo resultado»). Consecuencia directa para este
  encargo: *«blanco sobre urg»* y *«urg sobre blanco»* **dan siempre el mismo número**.
  Lo que cambia entre ambos no es el ratio, es qué elemento se rediseña si suspende.
- Umbrales: `src/lib/contraste.ts:83-87` — texto normal **4.5**, texto grande **3**,
  componente de interfaz o borde de foco **3**. Límite **inclusivo**
  (`src/lib/contraste.ts:89-92`).
- Umbral de «texto grande»: `src/lib/contraste.ts:153-154` — 24 px, o 18.66 px en
  negrita.

### 0.2 Mezcla y composición de colores translúcidos

Toda composición de un `rgba()` sobre su fondo, y todo hexadecimal propuesto como
arreglo, se calcula con la función de mezcla del repositorio,
`src/lib/diseno/mezclaDeColor.ts:57-70` (`mezclar(base, otro, porcentaje)`: canal a
canal en sRGB, redondeo estándar — `:46-48`). Componer `rgba(R,G,B,a)` sobre un
fondo opaco `F` es exactamente `mezclar(F, #RRGGBB, a)`.

### 0.3 Fuentes de las 5 paletas

| # | Paleta | `id` | Fuente literal |
| --- | --- | --- | --- |
| 1 | Confianza clínica | `clinica` | `docs/diseno-claude-design/Veterinaria La Sierra.dc.html:18-25` (bloque `:root` sin atributo; el `id` y el nombre, en `:601`) |
| 2 | Orgánica y cálida | `calida` | `…Veterinaria La Sierra.dc.html:26-33` (`:root[data-tema='calida']`); nombre en `:602` |
| 3 | Alta gama | `tech` | `…Veterinaria La Sierra.dc.html:34-41` (`:root[data-tema='tech']`); nombre en `:603` |
| 4 | Relax & eco | `eco` | `…Veterinaria La Sierra.dc.html:42-49` (`:root[data-tema='eco']`); nombre en `:604` |
| 5 | Marca Galapavet | `marca` | `docs/datos-galapavet.md:129-142` (§10, los 4 colores del logo) → derivada rol a rol en `src/styles/_tokens.scss:59-79` (`:root[data-variante='marca']`) |

> Nota de nomenclatura: la paleta 1 **no tiene bloque `[data-tema]` propio** — es el
> `:root` base. Que se llama `clinica` consta en dos sitios: el array de datos
> `PALETAS` (`…dc.html:601`) y el `data-props` del `<script type="text/x-dc">`
> (`…dc.html:505`, `"default":"clinica"`).
>
> El comentario del `<style>` (`…dc.html:17`) declara «4 propuestas». La quinta,
> `marca`, **no está en el prototipo**: viene del repositorio.

### 0.4 Correspondencia de nombres de rol entre prototipo y `marca`

La paleta 5 no usa los mismos nombres de token que las 4 del prototipo. La
equivalencia aplicada, rol a rol:

| Rol del encargo | Token en el prototipo (`.dc.html`) | Token en `marca` (`_tokens.scss`) |
| --- | --- | --- |
| fondo | `--bg` | `--color-fondo` (`:60`) |
| fondo-2 | `--bg-2` | `--color-fondo-alterno` (`:61`) |
| card | `--card` | `--color-superficie` (`:62`) |
| tinta (ink) | `--ink` | `--color-tinta` (`:64`) |
| texto | `--text` | `--color-texto` (`:65`) |
| muted / texto-suave | `--muted` | `--color-texto-suave` (`:66`) |
| primary | `--primary` | `--color-primario` (`:67`) |
| primary-strong | `--primary-strong` | `--color-primario-fuerte` (`:68`) |
| on-primary | `--on-primary` | `--color-sobre-primario` (`:69`) |
| accent-ink | `--accent-ink` | `--color-acento-tinta` (`:70`) |
| accent-soft | `--accent-soft` | `--color-acento-suave` (`:71`) |
| border | `--border` | `--color-borde` (`:73`) |
| urg | `--urg` | **NO EXISTE** — ver §6.3 |

---

## 1. Paleta 1 — «Confianza clínica» (`:root`, `…dc.html:18-25`)

Colores leídos literalmente: `--bg:#F8FAFC`, `--bg-2:#EDF2F9`, `--card:#FFFFFF`
(`:19`); `--border:rgba(15,32,60,.13)`, `--ink:#0B1B33`, `--text:#3C4C66`,
`--muted:#5E6E88` (`:20`); `--primary:#1E40AF`, `--primary-strong:#1B3796`,
`--on-primary:#FFFFFF` (`:21`); `--accent-ink:#047857`, `--accent-soft:#E7F8F1`
(`:22`); `--urg:#DC2626` (`:23`).

| Par | Colores | Ratio | AA 4.5 (texto normal) | AA 3.0 (texto grande / UI) |
| --- | --- | ---: | --- | --- |
| texto / fondo | `#3C4C66` sobre `#F8FAFC` | **8.30** | OK | OK |
| texto / fondo-2 | `#3C4C66` sobre `#EDF2F9` | **7.72** | OK | OK |
| texto / card | `#3C4C66` sobre `#FFFFFF` | **8.69** | OK | OK |
| tinta / fondo | `#0B1B33` sobre `#F8FAFC` | **16.47** | OK | OK |
| tinta / card | `#0B1B33` sobre `#FFFFFF` | **17.23** | OK | OK |
| muted / fondo | `#5E6E88` sobre `#F8FAFC` | **4.94** | OK | OK |
| muted / fondo-2 | `#5E6E88` sobre `#EDF2F9` | **4.60** | OK *(al filo: +0.10)* | OK |
| muted / card | `#5E6E88` sobre `#FFFFFF` | **5.17** | OK | OK |
| on-primary / primary | `#FFFFFF` sobre `#1E40AF` | **8.72** | OK | OK |
| on-primary / primary-strong | `#FFFFFF` sobre `#1B3796` | **10.33** | OK | OK |
| accent-ink / card | `#047857` sobre `#FFFFFF` | **5.48** | OK | OK |
| accent-ink / accent-soft | `#047857` sobre `#E7F8F1` | **4.99** | OK | OK |
| accent-ink / fondo | `#047857` sobre `#F8FAFC` | **5.24** | OK | OK |
| blanco / urg | `#FFFFFF` sobre `#DC2626` | **4.83** | OK | OK |
| urg / blanco | `#DC2626` sobre `#FFFFFF` | **4.83** | OK | OK |
| border / card *(informativo, decorativo, exento)* | `rgba(15,32,60,.13)` sobre `#FFFFFF` → **`#E0E2E6`** | **1.30** | exento | exento |

Sin suspensos. El único punto a vigilar es `muted` sobre `--bg-2`: **4.60**, un
margen de 0.10 sobre el mínimo — cualquier retoque posterior del gris lo tumba.

---

## 2. Paleta 2 — «Orgánica y cálida» (`:root[data-tema='calida']`, `…dc.html:26-33`)

Colores leídos literalmente: `--bg:#FFFBF2`, `--bg-2:#FEF3C7`, `--card:#FFFDF8`
(`:27`); `--border:rgba(120,53,15,.16)`, `--ink:#3B2A12`, `--text:#5C4626`,
`--muted:#8A6C45` (`:28`); `--primary:#B45309`, `--primary-strong:#92400E`,
`--on-primary:#FFFFFF` (`:29`); `--accent-ink:#3F6212`, `--accent-soft:#F1F7E3`
(`:30`); `--urg:#C2410C` (`:31`).

| Par | Colores | Ratio | AA 4.5 | AA 3.0 |
| --- | --- | ---: | --- | --- |
| texto / fondo | `#5C4626` sobre `#FFFBF2` | **8.62** | OK | OK |
| texto / fondo-2 | `#5C4626` sobre `#FEF3C7` | **7.99** | OK | OK |
| texto / card | `#5C4626` sobre `#FFFDF8` | **8.76** | OK | OK |
| tinta / fondo | `#3B2A12` sobre `#FFFBF2` | **13.33** | OK | OK |
| tinta / card | `#3B2A12` sobre `#FFFDF8` | **13.54** | OK | OK |
| muted / fondo | `#8A6C45` sobre `#FFFBF2` | **4.72** | OK *(al filo)* | OK |
| **muted / fondo-2** | **`#8A6C45` sobre `#FEF3C7`** | **🔴 4.37** | **🔴 SUSPENDE** (falta 0.13) | OK |
| muted / card | `#8A6C45` sobre `#FFFDF8` | **4.79** | OK | OK |
| on-primary / primary | `#FFFFFF` sobre `#B45309` | **5.02** | OK | OK |
| on-primary / primary-strong | `#FFFFFF` sobre `#92400E` | **7.09** | OK | OK |
| accent-ink / card | `#3F6212` sobre `#FFFDF8` | **6.96** | OK | OK |
| accent-ink / accent-soft | `#3F6212` sobre `#F1F7E3` | **6.46** | OK | OK |
| accent-ink / fondo | `#3F6212` sobre `#FFFBF2` | **6.85** | OK | OK |
| blanco / urg | `#FFFFFF` sobre `#C2410C` | **5.18** | OK | OK |
| urg / blanco | `#C2410C` sobre `#FFFFFF` | **5.18** | OK | OK |
| border / card *(informativo, exento)* | `rgba(120,53,15,.16)` sobre `#FFFDF8` → **`#E9DDD3`** | **1.31** | exento | exento |

### 2.1 🔴 Arreglo calculado — `muted` sobre `--bg-2`

`#8A6C45` sobre `#FEF3C7` da **4.37**: suspende texto normal por 0.13. Pasa texto
grande y componentes (3.0), así que **solo es un defecto si ese ocre lleva texto de
cuerpo sobre la banda ámbar**.

Recorrido calculado oscureciendo `--muted` hacia negro con `mezclar()`, paso a paso
(cada línea es un hexadecimal real distinto, no una interpolación teórica):

| Mezcla con negro | Hex | Ratio sobre `#FEF3C7` |
| --- | --- | ---: |
| 0.0 % | `#8A6C45` | 4.37 🔴 |
| 0.5 % | `#896B45` | 4.43 🔴 |
| 1.1 % | `#886B44` | 4.45 🔴 |
| 1.4 % | `#886A44` | 4.50 (justo en el límite inclusivo) |
| **1.9 %** | **`#876A44`** | **4.52 APRUEBA** |

**Propuesta: `#876A44`** (= `--muted` + 1.9 % de negro) → **4.52**. Es el
hexadecimal más cercano al original con margen real. `#886A44` también aprueba
(**4.50**), pero cae *exactamente* sobre el umbral: se descarta por el mismo
criterio que `docs/datos-galapavet.md:175-176` ya aplica al par verde/lima («un
margen de 0,01 se pierde con cualquier ajuste posterior del tono»).

Efecto colateral verificado: `#876A44` sobre `--bg` `#FFFBF2` y sobre `--card`
`#FFFDF8` sube desde 4.72 / 4.79 — ambos siguen aprobando.

**Alternativa descartada (calculada, no supuesta):** aclarar `--bg-2` con blanco en
vez de oscurecer el ocre. Es una palanca inservible aquí — a 11.7 % de blanco
(`#FEF4CE`) el ratio solo ha subido de 4.37 a **4.42**, sigue suspendiendo, y a ese
ritmo el ámbar de la paleta se ha desteñido antes de aprobar.

---

## 3. Paleta 3 — «Alta gama» / `tech` (`:root[data-tema='tech']`, `…dc.html:34-41`)

Colores leídos literalmente: `--bg:#0F172A`, `--bg-2:#152242`, `--card:#16233F`
(`:35`); `--border:rgba(148,197,255,.18)`, `--ink:#F1F5F9`, `--text:#C6D2E2`,
`--muted:#94A3B8` (`:36`); `--primary:#06B6D4`, `--primary-strong:#0891B2`,
`--on-primary:#04212B` (`:37`); `--accent-ink:#67E8F9`,
`--accent-soft:rgba(6,182,212,.14)` (`:38`); `--urg:#F87171`,
`--urg-soft:rgba(248,113,113,.16)` (`:39`).

> **Esta es la paleta oscura**: el fondo es `#0F172A` y la tinta es casi blanca
> (`#F1F5F9`), al revés que las otras cuatro. Y **tiene dos tokens en `rgba()`**
> (`--border` y `--accent-soft`), que **no se pueden evaluar tal cual**: un color
> translúcido no tiene ratio propio; solo lo tiene el color resultante de
> componerlo sobre el fondo que hay debajo. Composiciones hechas explícitamente
> (con `mezclar()`, §0.2):

| Token translúcido | Compuesto sobre | Resultado opaco |
| --- | --- | --- |
| `--border: rgba(148,197,255,.18)` | `--card` `#16233F` | **`#2D4062`** |
| `--border: rgba(148,197,255,.18)` | `--bg` `#0F172A` | **`#273650`** |
| `--accent-soft: rgba(6,182,212,.14)` | `--card` `#16233F` | **`#143854`** |
| `--accent-soft: rgba(6,182,212,.14)` | `--bg` `#0F172A` | **`#0E2D42`** |
| `--urg-soft: rgba(248,113,113,.16)` | `--card` `#16233F` | **`#3A2F47`** |

| Par | Colores | Ratio | AA 4.5 | AA 3.0 |
| --- | --- | ---: | --- | --- |
| texto / fondo | `#C6D2E2` sobre `#0F172A` | **11.66** | OK | OK |
| texto / fondo-2 | `#C6D2E2` sobre `#152242` | **10.24** | OK | OK |
| texto / card | `#C6D2E2` sobre `#16233F` | **10.19** | OK | OK |
| tinta / fondo | `#F1F5F9` sobre `#0F172A` | **16.30** | OK | OK |
| tinta / card | `#F1F5F9` sobre `#16233F` | **14.24** | OK | OK |
| muted / fondo | `#94A3B8` sobre `#0F172A` | **6.96** | OK | OK |
| muted / fondo-2 | `#94A3B8` sobre `#152242` | **6.11** | OK | OK |
| muted / card | `#94A3B8` sobre `#16233F` | **6.08** | OK | OK |
| on-primary / primary | `#04212B` sobre `#06B6D4` | **6.88** | OK | OK |
| on-primary / primary-strong | `#04212B` sobre `#0891B2` | **4.54** | OK *(al filo: +0.04)* | OK |
| accent-ink / card | `#67E8F9` sobre `#16233F` | **10.76** | OK | OK |
| accent-ink / accent-soft **compuesto sobre card** | `#67E8F9` sobre `#143854` | **8.41** | OK | OK |
| accent-ink / accent-soft **compuesto sobre fondo** | `#67E8F9` sobre `#0E2D42` | **9.84** | OK | OK |
| accent-ink / fondo | `#67E8F9` sobre `#0F172A` | **12.32** | OK | OK |
| **blanco / urg** | **`#FFFFFF` sobre `#F87171`** | **🔴 2.77** | **🔴 SUSPENDE** | **🔴 SUSPENDE** |
| **urg / blanco** | **`#F87171` sobre `#FFFFFF`** | **🔴 2.77** | **🔴 SUSPENDE** | **🔴 SUSPENDE** |
| border / card *(informativo, exento)* | `rgba(148,197,255,.18)` sobre `#16233F` → **`#2D4062`** | **1.50** | exento | exento |
| border / fondo *(informativo, exento)* | `rgba(148,197,255,.18)` sobre `#0F172A` → **`#273650`** | **1.47** | exento | exento |

### 3.1 🔴 Los dos pares de urgencia de `tech` — el peor fallo del catálogo

**No es un fallo de milésimas: 2.77 frente a 4.5, y ni siquiera llega al 3.0 de
texto grande.** Y **son usos reales del prototipo**, no hipótesis:

- `…dc.html:67` — barra superior: `background:var(--urg);color:#fff`.
- `…dc.html:94` — botón de cabecera: `background:var(--urg);color:#fff`.
- `…dc.html:113` — CTA del menú móvil: `background:var(--urg);color:#fff`.
- `…dc.html:399` — bloque de urgencias: `background:var(--urg);color:#fff`.
- `…dc.html:404` — botón invertido: `background:#fff;color:var(--urg)`.

Es decir: **el par que suspende es exactamente el que la maqueta usa cinco veces**,
y en `tech` acaba pintando texto blanco sobre un rojo claro pensado para fondo
oscuro. En las otras tres paletas del prototipo el mismo patrón aprueba
(4.83 / 5.18 / 4.83), porque su `--urg` es un rojo saturado y oscuro; `tech` aclaró
el rojo para que se leyera sobre `#0F172A` **y con ello rompió el par con blanco**.

Contexto medido de ese mismo `#F87171` dentro de su paleta (aquí sí funciona):

| Par | Ratio | Veredicto |
| --- | ---: | --- |
| `--urg` `#F87171` sobre `--bg` `#0F172A` | **6.45** | aprueba como texto |
| `--urg` `#F87171` sobre `--card` `#16233F` | **5.64** | aprueba como texto |
| `--urg` `#F87171` sobre `--urg-soft` compuesto `#3A2F47` | **4.53** | aprueba al filo |

**Arreglo A (recomendado) — no tocar el rojo, invertir la tinta.** `tech` ya hace
justo eso con su primario: `--on-primary` es **oscuro** (`#04212B`, `…dc.html:37`),
no blanco. Aplicar la misma regla al rojo:

| Tinta sobre `#F87171` | Ratio | AA 4.5 |
| --- | ---: | --- |
| **`#04212B`** (el `--on-primary` que la paleta ya declara) | **6.04** | APRUEBA |
| `#0F172A` (el `--bg` de la paleta) | **6.45** | APRUEBA |
| `#000000` | **7.59** | APRUEBA |

Coste: cero colores nuevos — `#04212B` **ya está en la paleta**. Y conserva el rojo
claro que la paleta necesita para leerse sobre su propio fondo oscuro.

**Arreglo B (si el blanco sobre rojo es innegociable) — oscurecer `--urg`.**
Recorrido calculado oscureciendo `#F87171` hacia negro:

| Mezcla con negro | Hex | Ratio contra `#FFFFFF` |
| --- | --- | ---: |
| 22.5 % | `#C05858` | 4.40 🔴 |
| 23.2 % | `#BE5757` | 4.48 🔴 |
| **23.5 %** | **`#BE5656`** | **4.51 APRUEBA** |

**Propuesta: `#BE5656`** → **4.51** con blanco, en ambos sentidos (la función es
simétrica). **Pero este arreglo tiene un precio medido y hay que decirlo:**
`#BE5656` sobre el `--bg` `#0F172A` cae a **3.96** y sobre `--card` `#16233F` a
**3.46** — sigue aprobando texto grande y UI (3.0), pero **deja de aprobar texto
normal en su propia paleta**, que es donde el rojo vive. Por eso el arreglo A es el
recomendado: el B cambia un suspenso por otro.

---

## 4. Paleta 4 — «Relax & eco» (`:root[data-tema='eco']`, `…dc.html:42-49`)

Colores leídos literalmente: `--bg:#FFFFFF`, `--bg-2:#EFFDF7`, `--card:#FFFFFF`
(`:43`); `--border:rgba(4,120,87,.16)`, `--ink:#06301F`, `--text:#35544A`,
`--muted:#557368` (`:44`); `--primary:#047857`, `--primary-strong:#036049`,
`--on-primary:#FFFFFF` (`:45`); `--accent-ink:#065F46`, `--accent-soft:#D6FBEA`
(`:46`); `--urg:#DC2626` (`:47`).

> En esta paleta `--bg` y `--card` son **el mismo blanco** `#FFFFFF` (`:43`): los
> pares «sobre fondo» y «sobre card» dan por fuerza el mismo número.

| Par | Colores | Ratio | AA 4.5 | AA 3.0 |
| --- | --- | ---: | --- | --- |
| texto / fondo | `#35544A` sobre `#FFFFFF` | **8.34** | OK | OK |
| texto / fondo-2 | `#35544A` sobre `#EFFDF7` | **7.97** | OK | OK |
| texto / card | `#35544A` sobre `#FFFFFF` | **8.34** | OK | OK |
| tinta / fondo | `#06301F` sobre `#FFFFFF` | **14.48** | OK | OK |
| tinta / card | `#06301F` sobre `#FFFFFF` | **14.48** | OK | OK |
| muted / fondo | `#557368` sobre `#FFFFFF` | **5.20** | OK | OK |
| muted / fondo-2 | `#557368` sobre `#EFFDF7` | **4.97** | OK | OK |
| muted / card | `#557368` sobre `#FFFFFF` | **5.20** | OK | OK |
| on-primary / primary | `#FFFFFF` sobre `#047857` | **5.48** | OK | OK |
| on-primary / primary-strong | `#FFFFFF` sobre `#036049` | **7.57** | OK | OK |
| accent-ink / card | `#065F46` sobre `#FFFFFF` | **7.68** | OK | OK |
| accent-ink / accent-soft | `#065F46` sobre `#D6FBEA` | **6.90** | OK | OK |
| accent-ink / fondo | `#065F46` sobre `#FFFFFF` | **7.68** | OK | OK |
| blanco / urg | `#FFFFFF` sobre `#DC2626` | **4.83** | OK | OK |
| urg / blanco | `#DC2626` sobre `#FFFFFF` | **4.83** | OK | OK |
| border / card *(informativo, exento)* | `rgba(4,120,87,.16)` sobre `#FFFFFF` → **`#D7E9E4`** | **1.26** | exento | exento |

Es la paleta más holgada del prototipo: **ningún par por debajo de 4.83**, y el peor
de todos (los dos de urgencia) tiene 0.33 de margen. Sin suspensos.

---

## 5. Paleta 5 — Marca Galapavet (`src/styles/_tokens.scss:59-79`)

Origen documental: `docs/datos-galapavet.md:129-142` — morado **`#77286B`** (`:136`),
verde lima **`#B4C718`** (`:137`), verde profundo **`#48704B`** (`:138`), blanco
`#FFFFFF` (`:139`), obtenidos por muestreo de píxeles sobre `logo galapavet.webp`
(`docs/datos-galapavet.md:130-131`).

Derivación rol a rol leída literalmente de `src/styles/_tokens.scss`:
`--color-fondo:#FFFFFF` (`:60`), `--color-fondo-alterno:#F4EEF3` (`:61`),
`--color-superficie:#FFFFFF` (`:62`), `--color-superficie-elevada:#FAF6F9` (`:63`),
`--color-tinta:#531C4B` (`:64`), `--color-texto:#77286B` (`:65`),
`--color-texto-suave:#925389` (`:66`), `--color-primario:#77286B` (`:67`),
`--color-primario-fuerte:#6B2460` (`:68`), `--color-sobre-primario:#FFFFFF` (`:69`),
`--color-acento-tinta:#48704B` (`:70`), `--color-acento-suave:#F6F8E3` (`:71`),
`--color-borde-control:#A06997` (`:72`), `--color-borde:#DDC9DA` (`:73`).

> Ningún token de esta paleta lleva `rgba()`: los 14 roles de color son
> hexadecimales opacos. No hay nada que componer aquí.

| Par | Colores | Ratio | AA 4.5 | AA 3.0 |
| --- | --- | ---: | --- | --- |
| texto / fondo | `#77286B` sobre `#FFFFFF` | **9.13** | OK *(también AAA)* | OK |
| texto / fondo-2 | `#77286B` sobre `#F4EEF3` | **7.99** | OK | OK |
| texto / card | `#77286B` sobre `#FFFFFF` | **9.13** | OK | OK |
| tinta / fondo | `#531C4B` sobre `#FFFFFF` | **12.84** | OK | OK |
| tinta / card | `#531C4B` sobre `#FFFFFF` | **12.84** | OK | OK |
| texto-suave / fondo | `#925389` sobre `#FFFFFF` | **5.50** | OK | OK |
| texto-suave / fondo-2 | `#925389` sobre `#F4EEF3` | **4.81** | OK | OK |
| texto-suave / card | `#925389` sobre `#FFFFFF` | **5.50** | OK | OK |
| sobre-primario / primario | `#FFFFFF` sobre `#77286B` | **9.13** | OK | OK |
| sobre-primario / primario-fuerte | `#FFFFFF` sobre `#6B2460` | **10.26** | OK | OK |
| acento-tinta / card | `#48704B` sobre `#FFFFFF` | **5.68** | OK | OK |
| acento-tinta / acento-suave | `#48704B` sobre `#F6F8E3` | **5.27** | OK | OK |
| acento-tinta / fondo | `#48704B` sobre `#FFFFFF` | **5.68** | OK | OK |
| blanco / urg | — | **NO CONSTA EN LA FUENTE** | — | — |
| urg / blanco | — | **NO CONSTA EN LA FUENTE** | — | — |
| borde / card *(informativo, exento)* | `#DDC9DA` sobre `#FFFFFF` | **1.56** | exento | exento |

**Extra medido (fuera del encargo, relevante):** `--color-borde-control` `#A06997`
sobre `#FFFFFF` da **4.23**. No es texto: es el borde de un control, sujeto al
umbral 3.0 de SC 1.4.11 — **aprueba con holgura**. Sobre el fondo alterno `#F4EEF3`
da **3.70**, también aprueba. El propio fichero lo declara así en
`src/styles/_tokens.scss:72`. **Marcarlo en rojo sería un falso positivo**: solo
suspendería si alguien lo usara como color de texto de cuerpo.

### 5.1 Cotejo con lo que ya estaba documentado

Los ratios calculados aquí **coinciden exactamente** con los que ya afirmaban las
fuentes, lo que confirma que ambas partes usan la misma fórmula:

| Ratio | Este informe | Ya afirmado en | Coincide |
| --- | ---: | --- | --- |
| morado / blanco | 9.13 | `docs/datos-galapavet.md:153` | sí |
| blanco / morado | 9.13 | `docs/datos-galapavet.md:154` | sí |
| verde `#48704B` / blanco | 5.68 | `docs/datos-galapavet.md:156` | sí |
| tinta `#531C4B` / fondo | 12.84 | `src/styles/_tokens.scss:64` | sí |
| texto-suave `#925389` / fondo | 5.50 | `src/styles/_tokens.scss:66` | sí |
| texto / fondo-alterno | 7.99 | `src/styles/_tokens.scss:61` | sí |
| acento-tinta / acento-suave | 5.27 | `src/styles/_tokens.scss:71` | sí |
| blanco / primario-fuerte | 10.26 | `src/styles/_tokens.scss:68` | sí |
| borde-control / fondo | 4.23 | `src/styles/_tokens.scss:72` | sí |
| borde / fondo | 1.56 | `src/styles/_tokens.scss:73` | sí |

---

## 6. Hallazgos

### 6.1 🔴 H1 — `calida`: `--muted` sobre `--bg-2` suspende (4.37)

`#8A6C45` (`…dc.html:28`) sobre `#FEF3C7` (`…dc.html:27`) = **4.37 < 4.5**. Aprueba
texto grande y UI. **Arreglo calculado: `--muted:#876A44`** (4.52). Detalle y
alternativa descartada en §2.1.

### 6.2 🔴 H2 y 🔴 H3 — `tech`: los dos pares de urgencia suspenden (2.77)

`#F87171` (`…dc.html:39`) contra blanco = **2.77**, en los dos sentidos (la fórmula
es simétrica, `src/lib/contraste.ts:58-62`). **No alcanza ni el 3.0 de texto
grande.** Y es el patrón que la maqueta usa cinco veces
(`…dc.html:67, 94, 113, 399, 404`). **Arreglo recomendado: tinta oscura sobre el
rojo** — `#04212B`, el `--on-primary` que la propia paleta ya declara
(`…dc.html:37`) → **6.04**. El arreglo alternativo (oscurecer `--urg` a `#BE5656`)
aprueba con blanco (4.51) pero **rompe el rojo contra su propio fondo oscuro**
(3.96). Detalle en §3.1.

### 6.3 ⚠️ H4 — `marca` no tiene token de urgencia: 2 pares NO EVALUABLES

`src/styles/_tokens.scss` **no declara ningún `--color-urgencia` ni `--urg`** en
ninguna de sus variantes: **NO CONSTA EN LA FUENTE**. No es un olvido, es una
supresión deliberada y verificable — `src/lib/diseno/rolesDescartados.ts:1-10` la
declara textualmente: «ningún token de "urgencia" (Galapavet no presta urgencias
24 h — un color de urgencia reintroduciría por la puerta de atrás el servicio que la
Decisión 2 ya suprimió)», y hay una puerta automática que lo vigila
(`src/lib/diseno/rolesDescartados.ts:29-30`, patrón que caza cualquier custom
property con «urg» en el nombre).

Concuerda con `docs/datos-galapavet.md:39-43` («Galapavet **no presta un servicio de
urgencias 24 h**») y con `docs/datos-galapavet.md:94` («Urgencias 24 h · todos los
días del año» = **FALSO**).

**Consecuencia para el rediseño:** los pares «blanco/urg» y «urg/blanco» de la
paleta 5 **no se pueden calcular y no deben crearse para poder calcularlos**.
Inventar aquí un rojo de urgencia sería reintroducir un servicio falso.

### 6.4 ⚠️ H5 — Cuatro márgenes al filo (aprueban, pero sin colchón)

| Paleta | Par | Ratio | Margen sobre 4.5 |
| --- | --- | ---: | ---: |
| `tech` | on-primary `#04212B` / primary-strong `#0891B2` | 4.54 | **+0.04** |
| `clinica` | muted `#5E6E88` / bg-2 `#EDF2F9` | 4.60 | +0.10 |
| `calida` | muted `#8A6C45` / bg `#FFFBF2` | 4.72 | +0.22 |
| `calida` | muted `#8A6C45` / card `#FFFDF8` | 4.79 | +0.29 |

El de `tech` es el crítico: **0.04 de margen** en el estado hover/activo del botón
principal. Es el mismo criterio que `docs/datos-galapavet.md:175-176` ya aplicó para
descartar un par que pasaba por 0.01.

### 6.5 ℹ️ H6 — Ningún `--border` de ninguna de las 5 paletas llega a 3:1

| Paleta | Border resuelto sobre card | Ratio |
| --- | --- | ---: |
| `clinica` | `rgba(15,32,60,.13)` → `#E0E2E6` | 1.30 |
| `calida` | `rgba(120,53,15,.16)` → `#E9DDD3` | 1.31 |
| `tech` | `rgba(148,197,255,.18)` → `#2D4062` | 1.50 |
| `eco` | `rgba(4,120,87,.16)` → `#D7E9E4` | 1.26 |
| `marca` | `#DDC9DA` (opaco) | 1.56 |

Es **correcto y exento**: son bordes decorativos, no bordes de control ni
indicadores de estado (SC 1.4.11 solo exige 3:1 a lo que transmite información).
`src/styles/_tokens.scss:73` ya lo declara así («decorativo, EXENTO»), y por eso
`marca` mantiene un **segundo** token, `--color-borde-control` `#A06997` (4.23),
para los bordes que sí significan algo.

**La regla que se deriva:** en las 4 paletas del prototipo **no existe ese segundo
token**. Si el rediseño reutiliza `--border` para el borde de un `input`, de un
`select` o de una tarjeta seleccionable, **suspende SC 1.4.11 en las cuatro**. La
paleta 5 es la única que trae ya resuelto ese desdoblamiento.

---

## 7. Resumen ejecutivo

| Paleta | Pares evaluados | Suspensos | Al filo | Veredicto |
| --- | ---: | ---: | ---: | --- |
| 1 · `clinica` | 15 + 1 exento | **0** | 1 | apta |
| 2 · `calida` | 15 + 1 exento | **1** 🔴 | 2 | apta con 1 corrección |
| 3 · `tech` | 15 + 2 exentos | **2** 🔴 | 1 | 🔴 no apta sin corregir la urgencia |
| 4 · `eco` | 15 + 1 exento | **0** | 0 | apta, la más holgada del prototipo |
| 5 · `marca` | 13 + 2 NO CONSTAN + 1 exento | **0** | 0 | apta (mínimo real 4.81) |

**3 suspensos en total**, todos en el prototipo heredado, ninguno en la marca real:

1. 🔴 `calida` · muted sobre bg-2 · 4.37 → **`#876A44`** (4.52).
2. 🔴 `tech` · blanco sobre urg · 2.77 → **tinta `#04212B` sobre el rojo** (6.04).
3. 🔴 `tech` · urg sobre blanco · 2.77 → mismo par, misma corrección.

**La paleta de marca (5) es la única sin un solo suspenso y sin un solo par al
filo**: su mínimo es 4.81 (`--color-texto-suave` sobre `--color-fondo-alterno`) y
tiene el desdoblamiento borde-decorativo / borde-de-control que a las otras cuatro
les falta. No necesita ninguna corrección.

---

## 8. Nota metodológica: qué NO se ha comprobado

- **No se ha auditado el uso real de cada par en el marcado.** Este informe mide la
  paleta, no la maqueta. La única excepción es `--urg` en `tech`, donde sí se
  localizaron los cinco usos concretos (§3.1) porque el par suspendía.
- **`--surface` y `--accent` (a secas) quedan fuera del encargo**, que pidió 16
  pares nominados. Sus valores constan en §1-§5 para quien los necesite.
- **Discrepancia observada, no evaluada:** el swatch decorativo del selector de
  paletas para `calida` declara `#D97706` (`…dc.html:602`), que **no es** el
  `--primary` `#B45309` de esa paleta (`…dc.html:29`). Es un color de muestra en el
  array de datos, no un token; no afecta a ningún par de este informe.
- **Los tres tonos oscuros de `tech` (`--bg`, `--bg-2`, `--card`) son casi
  indistinguibles entre sí** (10.19 vs 10.24 de ratio para el mismo texto). No es un
  fallo WCAG — WCAG no exige contraste entre superficies adyacentes — pero explica
  por qué en esa paleta las tarjetas dependen tanto de un `--border` que solo llega
  a 1.50.
