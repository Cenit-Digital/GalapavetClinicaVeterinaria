# Estudio de NailsLashStudioWeb — fuentes autoalojadas y prueba del CSS

> **Qué es esto.** Destilación, con `fichero:linea`, de cómo `NailsLashStudioWeb` (misma
> organización, mismo arnés SDD Uncle Bob) resolvió los dos problemas que hoy bloquean a Galapavet:
> (1) tipografía autoalojada que **llega al navegador**, (2) tests que aseveran sobre **estilos**.
>
> **Repo estudiado (clon de solo lectura):**
> `C:/Users/vhurt/AppData/Local/Temp/claude/C--Users-vhurt-OneDrive-Escritorio-Proyectos-CenitDigitalProyectosCodigo-GalapavetClinicaVeterinaria/643fa357-4948-4307-b018-ded0bedc4166/scratchpad/org/NailsLashStudioWeb`
> En adelante las rutas se citan **relativas a esa raíz**. Rutas de Galapavet, cuando aparecen, van
> marcadas con el prefijo `Galapavet/`.
>
> **Limitación global del estudio, declarada:** el clon **no tiene `node_modules/` ni `dist/`**
> (comprobado: `ls node_modules` y `ls dist` → no existen). Por tanto **NO he podido medir por mí
> mismo ni un solo byte de fuente ni un solo byte de CSS compilado**. Todo lo que sea "tamaño de
> woff2" o "forma del CSS de `dist`" en este informe es **medición documentada en el repo por su
> autor**, no verificada por mí: va marcada como tal, una por una.
>
> **Regla de lectura:** lo que sigue distingue **PATRÓN** (estructura reutilizable en Galapavet) de
> **VALOR PROPIO** (dato de ese cliente: familias, hex, pesos). Los valores NO se copian.

---

## 0. Resumen ejecutivo — las 6 piezas del mecanismo

| # | Pieza | Fichero:línea en NailsLash | Estado en Galapavet |
| - | ----- | -------------------------- | ------------------- |
| 1 | Imports de `@fontsource/<familia>/latin-<peso>.css` **en `main.tsx`, antes de la hoja global** | `src/main.tsx:36-41` | **AUSENTE** (no hay `@fontsource` en `package.json`) |
| 2 | Hoja global enganchada desde `main.tsx` | `src/main.tsx:43` (`import './styles/main.scss'`) | **AUSENTE** — es la causa raíz ya identificada |
| 3 | `main.scss` como orquestador de parciales (`@use`) | `src/styles/main.scss:4-8` | `main.scss` no existe |
| 4 | `_tipografia.scss` — **suelo heredable** `body` + `h2,h3`, fichero aparte | `src/styles/_tipografia.scss:1-21` | **AUSENTE** |
| 5 | Puerta de build anti-terceros que **congela el conjunto exacto de `@font-face` del CSS COMPILADO** | `src/lib/puerta-terceros.ts:56-63` + `tools/puerta-terceros.ts:79-100` | **AUSENTE** |
| 6 | Tests `*-estilos.test.ts` que leen los **bytes del `.module.scss`** | 9 ficheros, 139 bloques `it` | Galapavet ya sabe leer `?raw`: es **el mismo nivel**, no uno superior |

**El hallazgo que más importa para Galapavet, y es contraintuitivo:** *NailsLash **NUNCA** compila
Sass dentro de Vitest.* Ningún test del repo aseveran sobre CSS compilado. Lo verificado:

```
grep -rn "sass|compileString|compile\(" src --include=*.test.ts --include=*.test.tsx
→ 2 aciertos, ambos en COMENTARIOS de src/lib/puerta-contraste.test.ts:52 y :431
grep -rn "?raw" src  → 0 aciertos
```

Lo que hacen es **repartir el problema en dos niveles distintos**, y ésa es la lección:

- **Nivel A — el TEXTO FUENTE del `.scss`**, leído con `readFileSync` y parseado contando llaves.
  Barato, corre en cada `vitest run`, cubre "¿la declaración está escrita?".
- **Nivel B — el CSS COMPILADO Y MINIFICADO de `dist/`**, leído por la **puerta de build**
  (`tools/puerta-terceros.ts:75`, `readFileSync(ubicacion,'utf8')` sobre `dist/**/*.css`), que corre
  en `pnpm build` y **rompe el build**. Cubre "¿lo que se publica dice lo que creemos?".
- **Nivel C — Chrome real vía CDP**, manual/semiautomático, fuera de Vitest. Cubre "¿el navegador lo
  PINTA?".

Galapavet hoy tiene solo un embrión del nivel A. **Los niveles B y C son los que faltan, y son los
que en NailsLash cazaron los fallos reales.**

---

## 1. FUENTES AUTOALOJADAS CON `@fontsource`

### 1.1 Los paquetes exactos y su versión

`package.json:34-36` — **en `dependencies`, no en `devDependencies`**:

```json
"dependencies": {
  "@fontsource/gilda-display": "^5.2.8",
  "@fontsource/great-vibes": "^5.2.8",
  "@fontsource/manrope": "^5.2.8",
  ...
}
```

Resuelto en el lockfile a versiones exactas — `pnpm-lock.yaml:497,500,503`:
`@fontsource/gilda-display@5.2.8`, `@fontsource/great-vibes@5.2.8`, `@fontsource/manrope@5.2.8`.
`pnpm-lock.yaml:2873,2875,2877` confirma que los tres tienen **`{}` de dependencias: cero
dependencias transitivas**.

> ⚠️ **VALOR PROPIO, NO PATRÓN.** Manrope / Gilda Display / Great Vibes son las familias del
> prototipo `Opcion-1-Rosa` de ese salón. Galapavet **no las copia**. Lo que se copia es
> `@fontsource/<familia>` en `dependencies` + el criterio de qué fichero importar (§1.3).

> 🔴 **La trampa que ese repo documenta y que Galapavet debe evitar:**
> `progress/f05_verificacion_previa.md:184-186` — *«`@fontsource/dm-sans` y `@fontsource/outfit`
> están en `package.json` y NO se importan en ningún sitio. Son herencia muerta de WebEmpresa. Es la
> lección "no copiar del base" mordiendo por tercera vez: F-03 los tokens, F-04 el JSON-LD, F-05 las
> fuentes.»* Es **exactamente** el fallo de Galapavet con `_tokens.scss`, un escalón más arriba.

### 1.2 Dónde se importan y en qué orden

`src/main.tsx` — el punto de entrada de la app (Vite lo carga desde `index.html:9`):

```
36  import '@fontsource/manrope/latin-400.css'
37  import '@fontsource/manrope/latin-500.css'
38  import '@fontsource/manrope/latin-600.css'
39  import '@fontsource/manrope/latin-700.css'
40  import '@fontsource/gilda-display/latin-400.css'
41  import '@fontsource/great-vibes/latin-400.css'
42
43  import './styles/main.scss'
```

**El orden es PATRÓN y no es cosmético:** los `@font-face` (líneas 36-41) entran **ANTES** de la
hoja global (línea 43) que los USA. En CSS `@font-face` no tiene cascada por orden, pero el orden de
los `import` de Vite fija el orden de concatenación en el CSS emitido, y tener los `@font-face`
delante evita cualquier discusión sobre FOUT/orden de reglas. Comparación estructural directa:

```
NailsLash/src/main.tsx:36-41   @fontsource ×6
NailsLash/src/main.tsx:43      import './styles/main.scss'   ← LA LÍNEA QUE GALAPAVET NO TIENE
WebEmpresa/src/main.tsx:11     import './styles/main.scss'
Galapavet/src/main.tsx         React / ReactDOM / App        ← ninguna hoja global, ninguna fuente
```

Verificado que **no hay ningún otro punto de importación**: `grep -rn "@fontsource" src index.html
vite.config.ts vitest.config.ts` devuelve los 6 imports de `main.tsx:36-41` y, por lo demás, **solo
comentarios** (`src/main.tsx:6,14,17`, `src/lib/puerta-terceros.test.ts:42,221,289,293,585,605,608`,
`src/lib/terceros.test.ts:835`). `index.html` (11 líneas, íntegro) **no lleva ni un `<link>` de
fuente ni un `<style>`**: todo entra por el grafo de módulos.

### 1.3 Qué pesos y qué subconjuntos, y POR QUÉ ese fichero exacto

El comentario de `src/main.tsx:4-35` es el documento de diseño. Transcribo lo sustantivo
(`main.tsx:13-19`):

> ```
> 13  * 🔴 `latin-<peso>.css` Y NADA MÁS — ES LA TRAMPA INVERSA A LA QUE SUGIERE EL NOMBRE [V, medido]:
> 14  *   - `@fontsource/manrope` NO trae todos los pesos: trae SOLO el 400, en los 6 subsets. Faltarían
> 15  *     500/600/700 EN SILENCIO (faux-bold sintético, SIN error en consola).
> 16  *   - `400.css` TAMBIÉN trae los 6 subsets. Solo `latin-<peso>.css` trae uno.
> 17  *   - `@fontsource-variable` NO se usa: solo existe para Manrope (las otras dos dan 404), no tiene
> 18  *     `latin.css`, y RENOMBRA LA FAMILIA a 'Manrope Variable' → si el SCSS dice 'Manrope', la
> 19  *     fuente NO CARGA y cae al fallback SIN NINGÚN ERROR. Si llegara a `dist`, @s29 rompe el build.
> ```

**Las tres reglas de importación, que SÍ son PATRÓN reutilizable:**

1. **Importar `latin-<peso>.css`, uno por peso.** `import '@fontsource/x'` a secas trae *solo el
   400* y en *los 6 subsets*: se pierden los pesos en silencio y se hinchan los subsets.
2. **Un import por peso realmente usado.** `progress/f05_verificacion_previa.md:181-182`: el
   prototipo pedía `wght@300` y **`font-weight: 300` → 0 ocurrencias**, así que el 300 **no se
   importa**. Los pesos son **medidos sobre el diseño**, no heredados.
3. **Nunca `@fontsource-variable`** salvo estudio propio: renombra la familia (`'Manrope Variable'`)
   → fallo silencioso total.

Pesos y uso (**VALOR PROPIO** de NailsLash, `progress/f05_verificacion_previa.md:175-179`):

| Familia | Uso real | Pesos importados |
| --- | --- | --- |
| Manrope | cuerpo, botones, nav | 400, 500, 600, 700 |
| Gilda Display | todos los `h2`/`h3`, precios | 400 |
| Great Vibes | el «Nails Lash» del hero | 400 |

### 1.4 ¿El subconjunto `latin` incluye acentos y la eñe? — **VERIFICADO (documentalmente), y con un límite declarado**

**SÍ para el español, con una salvedad importante y muy relevante para Galapavet.**

Evidencia primaria en el repo, `progress/f05_verificacion_previa.md:211-214`:

> ```
> 211 - **`latin-400.css` NO tiene `unicode-range`** → ese `@font-face` **aplica a TODO el rango**. Si
> 212   aparece un carácter fuera del subset latin, el navegador **no cae a la siguiente fuente**: pinta
> 213   **tofu**, sin error. El latin cubre `U+0000-00FF` (ñ, vocales acentuadas, ¿, ¡) → suficiente
> 214   para español; **pero un nombre con `Ł`, `ř`, `ğ` daría tofu**. → **A-28**.
> ```

Ratificado como decisión formal en `src/main.tsx:26-30` (puerta humana A-28, 2026-07-17):

> ```
> 26  * ✅ A-28 (puerta humana, 2026-07-17): SOLO subset `latin` (cubre U+0000-00FF: todo el español).
> 27  * EL LÍMITE, DECLARADO: `latin-400.css` NO tiene `unicode-range` [V], así que ese `@font-face`
> 28  * aplica a TODO el rango — un nombre con `Ł`/`ř`/`ğ` PINTA TOFU, sin error y sin aviso. Es decisión
> 29  * de PRODUCTO tomada a conciencia. `latin-ext` entrará el día que exista un nombre REAL que lo
> 30  * exija, y ENTRARÁ CON SU ESCENARIO.
> ```

Y repetido en `src/lib/puerta-terceros.ts:45-48`.

**Traducción para Galapavet.** `U+0000-00FF` (Latin-1 Supplement) contiene `á é í ó ú ü ñ Ñ ¿ ¡ Á É
Í Ó Ú Ü`: **todo el castellano de la web de una clínica veterinaria de Galapagar está cubierto**. El
riesgo residual es **exactamente el mismo** que asumió NailsLash: un nombre propio con diacrítico
eslavo/turco (`Ł`, `ř`, `ğ`) o un nombre de mascota exótico **pinta tofu sin ningún error de
consola**, porque **sin `unicode-range` el navegador no hace fallback a la siguiente familia del
stack**. Es un riesgo de *producto*, y en NailsLash se cerró en **puerta humana**, no por criterio
de un agente.

> ⚠️ **NO VERIFICADO POR MÍ:** no he podido abrir `node_modules/@fontsource/*/latin-400.css` para
> confirmar con mis propios ojos que carece de `unicode-range` (no hay `node_modules` en el clon).
> Lo doy por **documentado y medido por el autor de F-05**, con tres citas independientes en el repo
> (`f05_verificacion_previa.md:198,211`, `main.tsx:27`, `puerta-terceros.ts:47`). **Galapavet debe
> re-medirlo al instalar**: es un `grep -c unicode-range node_modules/@fontsource/<familia>/latin-400.css`.

### 1.5 Cómo se declaran las familias en los tokens y cómo se heredan

**HALLAZGO IMPORTANTE, y es lo contrario de lo que se esperaría:** en NailsLash **las familias NO
viven en `_tokens.scss`**. Verificado leyendo `src/styles/_tokens.scss` íntegro (75 líneas): declara
**solo color** (`--bg`, `--surface`, `--text`, `--ink`, `--accent`, `--line`, `--header-bg`,
`--header-blur`, `--estado-en-linea`…). **No hay ni un `--font-*`.**

El nombre de familia se escribe **literal, entrecomillado, en cada punto de uso**:

| Dónde | Línea | Declaración |
| --- | --- | --- |
| Suelo del cuerpo | `src/styles/_tipografia.scss:11` | `font-family: 'Manrope', system-ui, sans-serif;` |
| Suelo de encabezados | `src/styles/_tipografia.scss:20` | `font-family: 'Gilda Display', serif;` |
| Cabecera | `src/components/cabecera.module.scss:26` | `font-family: 'Manrope', system-ui, sans-serif;` |
| Marca de la cabecera | `src/components/cabecera.module.scss:36` | `font-family: 'Gilda Display', serif;` |
| Pregunta del FAQ | `src/components/faq.module.scss:37` | `font-family: 'Gilda Display', serif;` |
| Título de sección (demo) | `src/styles/_demo.scss:80` | `font-family: 'Gilda Display', serif;` |
| Rótulo del hero | `src/components/hero.module.scss:76` (`.letras`) | `'Great Vibes', cursive` |
| «Studio» del hero | `src/components/hero.module.scss:150` (`.heroStudio`) | `'Manrope', sans-serif` |

**La herencia es el mecanismo, y está razonada explícitamente** —
`src/styles/_tipografia.scss:3-6`:

> ```
> 3  // Suelo HEREDABLE del cuerpo: el `body` fija la fuente que todo descendiente sin `font-family`
> 4  // propia hereda. Arregla la deuda de F-07 (el cuerpo caía en la serif por defecto del UA). El
> 5  // stack copia a mano el de la casa (eyebrow / cabecera / pie), pero cada feature es dueña de su
> 6  // declaración: aquí NO se tocan ficheros `done`.
> ```

Y la **duplicación es deliberada**, no un descuido — `features/tipografia_global.feature:206-207`:

> *«Riesgo residual DECLARADO (no bug): redundancia (body Manrope + cabecera Manrope + eyebrow
> Manrope); es deliberada —cada feature es dueña de su declaración y no se tocan ficheros `done`—.»*

La consistencia no la garantiza un token compartido: la garantiza **una allowlist aseverada por
test** (`src/styles/tipografia-global.test.ts:172-198`, §3.4).

**Valoración para Galapavet:** este es un punto donde **cabe mejorar sobre el patrón**. Galapavet ya
tiene `src/lib/tokens.ts` y `vite.config.ts` inyecta tokens con `additionalData`; declarar
`--fuente-titulo` / `--fuente-cuerpo` como custom properties sería *superior* a repetir el literal.
**Pero cuidado**: si se hace, la aserción anti-tautología (§3.4) debe seguir anclándose contra el
**literal del nombre de familia escrito a mano**, nunca contra el símbolo importado.

### 1.6 Cuánto pesa cada fichero de fuente en el build — **NO VERIFICADO por mí**

No hay `node_modules/` ni `dist/` en el clon. **No he medido ni un byte.** Lo que el repo
**documenta como medido** por su autor:

| Dato | Cita | Estado |
| --- | --- | --- |
| **6 imports → 6 woff2 → 119.540 bytes en total** | `src/main.tsx:5-6`, `progress/f05_verificacion_previa.md:194` | Documentado `[V, medido a la unidad sobre @fontsource 5.2.8 instalado]`. **No verificado por mí.** |
| El woff2 **más pequeño** mide **6.192 B** | `progress/f05_verificacion_previa.md:233` | Documentado. Importa porque `build.assetsInlineLimit` = **4096 B**: por debajo, Vite **inlinea a `data:` y NO deja fichero en `dist/assets`**. |
| Great Vibes 400 woff2 = **42.800 bytes**, HTTP 200 | `progress/verificacion_viva_hero_marca.md:41` | Medido en vivo por el autor. Repetido como «43 KB woff2» en `:104`. **No verificado por mí.** |
| Cada `@font-face` de `@fontsource` emite **woff2 Y woff** → **12 ficheros en `dist` para 6 pares** | `progress/f05_verificacion_previa.md:208-210`, `src/lib/puerta-terceros.ts:40-43` | Documentado. **Coste de `dist`, no de red** (el navegador solo baja el woff2). |
| Los `.woff2` van **comprimidos con Brotli** | `progress/f05_verificacion_previa.md:493` | Documentado. |

**Consecuencia de diseño que Galapavet debe heredar tal cual** (`src/lib/puerta-terceros.ts:40-43`):

> ```
> 40  * 🔴 SE CUENTAN PARES, NO FICHEROS, por dos razones medidas [V]: cada `@font-face` emite `woff2` Y
> 41  * `woff` → 12 ficheros para 6 pares; y un `.woff2` de <4096 B NO DEJA FICHERO: se inlinea a
> 42  * `data:` (@s17). Contar ficheros da 12 hoy y otra cosa mañana, por razones que NO tienen NADA que
> 43  * ver con terceros.
> ```

Es decir: **cualquier puerta que cuente FICHEROS de fuente es frágil por construcción**. Se cuentan
**pares `[familia, peso]` leídos del CSS**.

---

## 2. LA PUERTA ANTI-TERCEROS

### 2.1 Arquitectura: decisor puro + humilde de cableado

Dos ficheros, y el reparto es el patrón de la casa:

- **`src/lib/puerta-terceros.ts`** (303 líneas) — **decisor puro**. `src/lib/puerta-terceros.ts:5-7`:
  *«Recibe los BYTES CRUDOS de `dist/` y el TEXTO de `vite.config.ts`, y devuelve `{codigoSalida,
  lineas}`. NO lee ficheros, NI el reloj, NI `process.env`.»* Está **testeado (783 líneas de test) y
  mutado**.
- **`tools/puerta-terceros.ts`** (114 líneas) — **humilde**. Cablea `node:fs` y `node:process`. Sin
  test propio y fuera de `mutate`, pero **sus dos decisiones se anclan desde tests que LEEN ESE
  FICHERO** (@s39 y @s40) — `tools/puerta-terceros.ts:10-12`.

Enganche: `package.json:23` (script `build`) encadena **cinco** puertas tras `vite-react-ssg build`:

```
vite-react-ssg build && node … tools/puerta-cascaron.ts && node … tools/puerta-placeholders.ts
                     && node … tools/puerta-contraste.ts && node … tools/puerta-terceros.ts
                     && node … tools/puerta-anclas.ts
```

**Solo en `pnpm build` (producción), nunca en `dev`** — `tools/puerta-terceros.ts:4-7`: *«LA PUERTA
SEPARA "VER" DE "PUBLICAR": en local, mientras se porta el diseño, una petición a Google Fonts es
legítima un rato. Lo que es imposible es PUBLICARLA.»*

### 2.2 Qué prohíbe exactamente, y con qué aserciones

`ejecutarPuertaDeTerceros` (`src/lib/puerta-terceros.ts:251-265`) → `inspeccionarArtefacto`
(`:267-303`) concatena **tres** familias de violación (`:294-298`):

**(a) Orígenes externos en el artefacto** — `detectarOrigenesExternos(recursos, allowlist)` de
`src/lib/terceros.ts`. Alcance: **solo `.html` y `.css`** de `dist/`
(`tools/puerta-terceros.ts:58`, `const ES_HTML_O_CSS = /\.(html|css)$/i`). Allowlist de producción =
**`[]`, ni un origen** (`tools/puerta-terceros.ts:98`, con 14 líneas de comentario explicando por
qué está vacía).

**(b) La `base` de `vite.config.ts`** — `violacionesDeBase` (`:217-223`). Lee la config **como
TEXTO, sin evaluarla** (`tools/puerta-terceros.ts:82-83`: *«un `import` de la config EJECUTARÍA
código y no vería `--base`»*). Invariante (`:213-215`): `base` debe **no declararse** o empezar por
`/` **sin** empezar por `//`. Razón medida
(`progress/f05_verificacion_previa.md:238-248`): un `base: 'https://cdn.evil.example/x/'` **reescribe
TODOS los `url()` del CSS** y mete un tercero sin que nadie lo escriba. *«La puerta debe aseverar la
CONFIG, no solo la salida.»*

**(c) El conjunto de `@font-face`** — `violacionesDeFuentes` (`:232-249`). **Es lo que interesa a
Galapavet.**

### 2.3 Cómo lee el CSS para comprobarlo — el mecanismo, línea a línea

**Este es el único punto de todo el repo donde se asevera sobre CSS REALMENTE COMPILADO.**

1. **Enumerar** — `tools/puerta-terceros.ts:67-77`:
   ```ts
   readdirSync(DIRECTORIO_ARTEFACTO, { recursive: true, withFileTypes: true })
     .filter((entrada) => entrada.isFile() && ES_HTML_O_CSS.test(entrada.name))
     .map((entrada) => ({
        ubicacion, tipo: ES_CSS.test(entrada.name) ? 'css' : 'html',
        contenido: readFileSync(ubicacion, 'utf8'),
     }))
   ```
   `DIRECTORIO_ARTEFACTO = 'dist'` (`:26`). Es decir: **`readFileSync` sobre los `.css` que Vite ya
   compiló y minificó**. No hay Sass en juego: Sass ya corrió dentro de `vite build`.

2. **Extraer los bloques** — `src/lib/puerta-terceros.ts:117`:
   ```ts
   const BLOQUE_FONT_FACE = /@font-face([^}]*)\}/g
   ```
   Comentario in situ: *«Sirve para las dos formas reales, `@font-face {` y la minificada
   `@font-face{`»*.

3. **Trocear declaraciones** — `:120` `const DECLARACION = /([a-z-]+):([^;}]*)/g`, consumido por
   `declaracionesDe` (`:128-136`) que devuelve un `Map<string,string>`.

4. **Derivar el par** — `parDelBloque` (`:153-160`):
   ```ts
   return [ sinComillas(String(declaraciones.get('font-family'))).trim(),
            Number(String(declaraciones.get('font-weight'))) ]
   ```
   `String(...)` en vez de `?? ''` es deliberado (`:145-148`): *«un `@font-face` sin `font-family` o
   sin `font-weight` NO SE ADIVINA — da un par que no casa con ninguno esperado y ROMPE EL BUILD.
   […] ANTE LA DUDA: BUILD ROTO, NUNCA BUILD VERDE.»*

5. **Comparar por doble inclusión** — `violacionesDeFuentes` (`:232-249`): recorre los esperados
   acusando `falta el par (…)` y luego los encontrados acusando `sobra el par (…)`. **Igualdad de
   conjuntos, no "contiene".**

**El [I] que se midió en lugar de suponerse** — `src/lib/puerta-terceros.test.ts:580-589`:

> ```
> 580  * 🔴 EL [I] QUE EL CONTRATO MANDA MEDIR EN EL PRIMER TEST, Y SE HA MEDIDO — CONTRA UN BUILD REAL,
> 581  * NO SUPUESTO. El resultado: **VITE SÍ QUITA LAS COMILLAS**. Forma REAL de `dist/assets/*.css`
> 582  * [V, medido hoy sobre `pnpm build`]:
> 583  *     @font-face{font-family:Manrope;font-style:normal;font-display:swap;font-weight:400;
> 584  *                src:url(/assets/manrope-latin-400-normal-PaqtzbVb.woff2) format("woff2"),…}
> 585  * y `font-family:Gilda Display` — SIN comillas y CON el espacio. El `@fontsource` de origen declara
> 586  * `font-family: 'Manrope';` CON comillas: LAS DOS FORMAS SON REALES Y LAS DOS SE MIDEN.
> 587  * → LA COMPARACIÓN ES SOBRE EL NOMBRE DESTOKENIZADO Y SIN COMILLAS. `'Gilda Display'` LLEVA UN
> 588  *   ESPACIO, y por eso es la familia elegida: es donde una destokenización ingenua (partir por
> 589  *   espacios) SE ROMPE. EL [I] ERA UN RIESGO REAL, NO TEÓRICO.
> ```

Y el test `@s37` (`src/lib/puerta-terceros.test.ts:637-656`) **pega el CSS minificado real de
`dist/` literalmente en el test**, con sus hashes y todo, y comprueba que la puerta lo reconoce:

```
639  '@font-face{font-family:Manrope;font-style:normal;font-display:swap;font-weight:400;src:url(/assets/manrope-latin-400-normal-PaqtzbVb.woff2) format("woff2"),url(/assets/manrope-latin-400-normal-8tf8FM3T.woff) format("woff")}' +
...
644  '@font-face{font-family:Great Vibes;font-style:normal;font-display:swap;font-weight:400;src:url(/assets/great-vibes-latin-400-normal-q5-78SH_.woff2) format("woff2")}'
```

Con la advertencia (`:631-635`): *«Si Vite cambiara de minificador y esta forma dejara de
reconocerse, LA GUARDA DE @s29 SE CAERÍA EN EL BUILD REAL CON LA SUITE VERDE.»*

### 2.4 `galeria-estilos.test.ts:309` y `resenas-estilos.test.ts:307` — el mecanismo y por qué es robusto

**Aclaración necesaria de terminología:** esas dos líneas **NO congelan** el conjunto de
`@font-face`. Son **guardas de no-introducción** en la hoja de cada componente. Quien congela el
conjunto exacto es `PARES_DE_FUENTE_ESPERADOS`. El mecanismo es una **pinza de tres piezas**, y
juntas sí forman un congelador robusto.

**Pieza 1 — la guarda local, en cada `.module.scss` nuevo.**

`src/components/galeria-estilos.test.ts:309-316`:
```ts
309  it('@s15 no aparece ningún url(https:// ni @import url(, y no se añade ni se quita ninguna @font-face', () => {
310    // La puerta de terceros: el conjunto de `@font-face` es EXACTO (6) y tocarlo mata el build.
311    const hoja = scss()
312
313    expect(hoja).not.toMatch(/url\(\s*['"]?https?:/i)
314    expect(hoja).not.toContain('@import url(')
315    expect(hoja).not.toContain('@font-face')
316  })
```

`src/components/resenas-estilos.test.ts:307-313` es **idéntico byte a byte** salvo la etiqueta `@s9`.
`src/styles/tipografia-global.test.ts:200-206` hace lo mismo sobre el partial global, con un matiz
superior: aplica primero `sinComentarios()` (`:28-30`), *«Sobre el CÓDIGO (sin comentarios): una
directiva real es código, jamás prosa comentada.»*

**Pieza 2 — la lista declarada, anclada contra literal escrito a mano.**

`src/lib/puerta-terceros.ts:56-63`:
```ts
export const PARES_DE_FUENTE_ESPERADOS: readonly ParDeFuente[] = [
  ['Manrope', 400], ['Manrope', 500], ['Manrope', 600], ['Manrope', 700],
  ['Gilda Display', 400], ['Great Vibes', 400],
]
```
Y su ancla, `src/lib/puerta-terceros.test.ts:685-699` (`@s38`), que **repite los seis pares a mano**.
El razonamiento anti-tautología (`:675-679`):

> *«🔴 ESTO NO ES TAUTOLOGÍA — ES LO CONTRARIO: se ancla contra un LITERAL ESCRITO A MANO, NO contra
> el símbolo importado. Importar la constante PARA COMPARARLA CONSIGO MISMA sería tautología;
> importarla PARA FIJARLA contra seis pares escritos a mano es lo que impide que alguien la vacíe
> sin que nada se ponga rojo.»*

**Pieza 3 — la guarda anti-vacuidad**, `src/lib/puerta-terceros.ts:274-279`: si
`paresEsperados.length === 0` → **exit 1**. Y un nivel más abajo, `:287-292`: si `recursos.length
=== 0` → **exit 1**. Motivo (`:27-29`):

> *«Sin guarda, `dist/` vacío → 0 orígenes → build VERDE → "protegidos". 0 FALLOS SOBRE 0 FUENTES NO
> ES ESTAR PROTEGIDO: ES NO HABER MIRADO.»*

**Por qué el conjunto es robusto — cinco razones, todas citables:**

1. **Es igualdad de conjuntos, no un mínimo.** `src/lib/puerta-terceros.ts:36-38`: *«POR QUÉ LISTA
   DECLARADA Y NO `MINIMO_DE_PARES = 18` […]: (1) CRECE CON EL DISEÑO, nadie tiene que acordarse de
   subir un número; (2) un mínimo sería frágil POR UNA RAZÓN AJENA A LA FEATURE — el nº de ficheros
   CSS de `dist` es chunking y hash de Vite.»*
2. **Se cuentan pares, no ficheros** (§1.6): inmune al doble woff2/woff y al inlining `data:`.
3. **Se mide sobre el ARTEFACTO, no sobre los `import` de `src/`** —
   `src/lib/puerta-terceros.ts:228-230`: *«Un test que leyera los `import` de `src/` sería ciego a un
   `@font-face` que entre por cualquier otra vía.»*
4. **Falla cerrada.** `:254-264`: cualquier excepción → `codigoSalida: 1` con el motivo. *«Una
   puerta que se traga su propia excepción y devuelve `[]` es PEOR que no tener puerta, porque
   además da confianza.»*
5. **Sobrevive a la minificación** (`@s37`, §2.3), que es donde el 90 % de las guardas ingenuas se
   rompen.

**Efecto neto:** con esas tres piezas, meter Google Fonts, cambiar a `@fontsource-variable`, colar
un peso 300, o borrar la lista **rompen `pnpm build`**. Y las guardas locales (`galeria:309`,
`resenas:307`) hacen que el error salte **en el test de la feature culpable**, no doscientas líneas
más tarde en la puerta.

---

## 3. LA TÉCNICA `*-estilos.test.ts` — el corazón del estudio

### 3.1 Cómo obtienen la hoja dentro de Vitest — **el código exacto**

**Con `node:fs`. Punto.** No hay import de Vite, ni `?raw`, ni `?inline`, ni `sass.compileString`.
Cabecera idéntica en los cinco `*-estilos.test.ts`:

```ts
// src/components/hero-estilos.test.ts:1-23
1   import { readFileSync } from 'node:fs'
2
3   import { describe, expect, it } from 'vitest'
...
20  const RUTA_SCSS = 'src/components/hero.module.scss'
21
22  function scss(): string {
23    return readFileSync(RUTA_SCSS, 'utf8')
24  }
```

La ruta va **escrita a mano, no importada** — `src/styles/cascara-global.test.ts:27`: *«La ruta va
escrita A MANO, no importada del código que vigila (anti-tautología, F-03 @s11).»*

**El parser: contador de llaves.** Es la pieza reutilizable de verdad
(`src/components/hero-estilos.test.ts:26-57`, duplicada literalmente en `galeria-estilos.test.ts:22-51`,
`resenas-estilos.test.ts`, `equipo-estilos.test.ts:18-47`, `contacto-estilos.test.ts:21-53`):

```ts
26  /**
27   * El cuerpo (entre llaves) del PRIMER bloque cuyo encabezado casa `encabezado`, contando llaves
28   * para respetar el anidamiento (@keyframes/@media). Robusto al reformateo de prettier (no depende
29   * de saltos de línea). Devuelve null si no hay bloque.
30   */
31  function cuerpoDelBloque(fuente: string, encabezado: RegExp): string | null {
32    const cabeza = encabezado.exec(fuente)
33    if (cabeza === null) return null
34    const apertura = fuente.indexOf('{', cabeza.index)
...
41    let profundidad = 0
42    for (let i = apertura; i < fuente.length; i++) {
43      if (fuente[i] === '{') profundidad += 1
44      else if (fuente[i] === '}') {
45        profundidad -= 1
46        if (profundidad === 0) return fuente.slice(apertura + 1, i)
47      }
48    }
49    return null
50  }
```

Encima de él, una escalera de ayudantes por dominio:

| Helper | Fichero:línea | Qué extrae |
| --- | --- | --- |
| `reglaBase(clase)` | `hero-estilos.test.ts:60-66` | cuerpo de `.<clase> {` (la **primera**, no la del `@media`) |
| `cuerpoKeyframe(nombre)` | `hero-estilos.test.ts:74-80` | cuerpo de `@keyframes <nombre>` |
| `fotograma(cuerpo, '0%')` | `hero-estilos.test.ts:69-71` | fotograma dentro del keyframe |
| `porDistancia(ambito, n)` | `galeria-estilos.test.ts:73-79` | bloque `[data-distancia='n']` |
| `magnitud(cuerpo, prop)` | `galeria-estilos.test.ts:80+` | valor **numérico** de `--<prop>` → permite comparar (`<`, `>`) |
| `reglaDelMando(clase)` | `galeria-estilos.test.ts:334-336` | regla de **grupo con comas** (`.a, .b, .c {`) |
| `reglas(fuente)` | `tipografia-global.test.ts:41-74` | **todas** las reglas de nivel superior como `{selector, cuerpo}` |
| `selectoresDe(sel)` | `tipografia-global.test.ts:77-79` | lista de selectores: `"h2, h3"` → `['h2','h3']` |
| `sinComentarios(fuente)` | `tipografia-global.test.ts:28-30` | quita `/*…*/` y `//…` antes de parsear |

`tipografia-global.test.ts` es el **más avanzado** de todos: no busca subcadenas, **enumera las
reglas y compara la LISTA de selectores normalizada** (`reglaExacta`, `:82-86`). Eso permite afirmar
cosas como *«hay EXACTAMENTE UNA regla que nombra h2 y/o h3»* (`:112-121`), que un `toMatch` jamás
podría.

### 3.2 ¿CSS compilado o texto fuente? — **TEXTO FUENTE, sin excepción, dentro de Vitest**

**Texto fuente del `.scss`.** Verificado exhaustivamente:

- `grep -rn "sass|compileString|compile("` sobre todos los `*.test.ts(x)` → **0 llamadas reales**.
- `grep -rn "?raw"` sobre `src/` → **0**.
- `vitest.config.ts:15` → **`css: false`**. Las CSS Modules **ni se procesan** en tests.
- `feature_list.json` → `rules.notas`: *«Prohibido consultar por clase CSS en los tests
  (`css:false` → `styles.card` es undefined): por rol, nombre accesible, texto o `data-*`.»*
- `src/components/equipo-estilos.test.ts:10`: *«Se asevera por BYTES, JAMÁS con `toHaveClass`
  (`css:false` en vitest).»*

El CSS compilado **solo** se toca fuera de Vitest, en `tools/puerta-terceros.ts:75` (§2.3) — y esa
puerta sí entra en la suite, pero **indirectamente**: `src/pages/home-horneado.test.ts:23-33` ejecuta
el `pnpm build` REAL en `beforeAll` y aseveran `codigoSalida === 0` (`:106-108`). Es decir:

> **El CSS compilado se prueba EJECUTANDO EL BUILD DESDE UN TEST y exigiendo exit 0.**
> Ése es el puente entre el nivel A y el nivel B. Y tiene su precio declarado:
> `vitest.config.ts:10-14` pone **`fileParallelism: false`** porque *«en paralelo, dos builds se
> pisan el artefacto […] Serializar los ficheros hace el build-based DETERMINISTA ("un informe con
> flakiness MIENTE")»*. Y `home-horneado.test.ts:12-16` prohíbe que ese fichero importe nada de
> `src/lib/`, o Stryker lo re-ejecutaría por cada mutante → decenas de builds → timeouts.

### 3.3 Qué CLASE de propiedad se puede afirmar así, y cuál NO

**SÍ se puede afirmar (todo esto sale de la lectura del texto):**

| Clase | Ejemplo real |
| --- | --- |
| **Presencia** de una declaración | `expect(reglaBase('letras')).toMatch(/font-family\s*:/)` — `hero-estilos:645-649` |
| **AUSENCIA** de una declaración | `expect(scss()).not.toMatch(/clip-path\s*:/)` — `hero-estilos:105` |
| **Valor literal** de una propiedad | `border: 1px solid var(--border-interactive)` — `galeria-estilos:377` |
| **Token usado**, y no otro | `not.toMatch(/color:\s*var\(--accent\)\s*[;}]/)` — `equipo-estilos:63` |
| **Relaciones numéricas** entre valores | móvil `< ` escritorio para giro/z/y — `galeria-estilos:252-258` |
| **Cotas** | `Math.abs(giro) < 90` para los 8 giros — `galeria-estilos:274-281` |
| **Unidad** de un valor | `stroke-dasharray: 100;` sin `%` — `hero-estilos:696-698` |
| **Estructura del selector**: cuántas reglas, qué tipos, especificidad **por forma** | `tipografia-global:112-121, 253-260` |
| **Existencia de un `@media`** y su contenido | `hero-estilos:667-679` |
| **Que el partial esté ENGANCHADO** a `main.scss` | `tipografia-global:137`, `cascara-global:73` |
| **Higiene**: `!important`, `@import`, `@font-face`, `url(https:` | `tipografia-global:200-206, 241-251` |

**NO se puede afirmar — exige layout/pintado real. Y el repo lo dice, en cada sitio:**

| Lo que NO se puede | Cita |
| --- | --- |
| **Qué fuente PINTA el navegador** | `hero-estilos.test.ts:620` (transcrito en §3.5) |
| **Prominencia / tamaño percibido** | `contacto-estilos.test.ts:10-13`: *«Leer la `@media` PRUEBA que el tratamiento móvil EXISTE, NO que el objetivo sea PROMINENTE […]: el byte del SCSS no mide eso.»* |
| **Resolución real de especificidad** | `contacto-estilos.test.ts:76-77`: *«LEER el SCSS es un PROXY de que el selector encierra la exclusión (la resolución real […] se acredita a ojo): el byte no la ejecuta.»* |
| **Gesto táctil / scroll** | `galeria-estilos.test.ts:321-323`: *«jsdom no puede verlo (no hay táctil ni scroll reales): se asevera por BYTES.»* |
| **Que una animación corra y termine** | `hero-estilos.test.ts:659`: *«la sincronía punta↔tinta se RE-VERIFICA EN VIVO con Chrome (jsdom no anima)»* |
| **Contraste real compuesto**, LCP, reflow | `progress/verificacion_viva_hero_marca.md:98-102` |
| **`@font-face` cargado** | `features/tipografia_global.feature:213-215` |

**La palabra clave del repo para esto es «PROXY».** Un test de bytes es un *proxy de existencia*, y
lo escriben así en el propio comentario para que nadie confunda verde con funciona.

### 3.4 La regla transversal: ANTI-TAUTOLOGÍA

Aparece en **todos** los `*-estilos.test.ts` y es lo que los hace morder.
`hero-estilos.test.ts:16-18`:

> *«Los esperados (los valores del CSS, el límite 1,2 s, el token `--ink`) van ESCRITOS A MANO
> (anti-tautología): se LEEN del SCSS, jamás se importan como símbolo.»*

`tipografia-global.test.ts:16-18`:

> *«ANTI-TAUTOLOGÍA (regla dura): TODO nombre de fuente esperado —«'Manrope'», «'Gilda Display'» y la
> allowlist {Manrope, Gilda Display, Great Vibes}— va ESCRITO A MANO aquí, JAMÁS importado de
> `main.tsx`, `site.ts` ni de ningún símbolo para compararse contra sí mismo.»*

Y su aplicación más potente, la **allowlist de familias**
(`src/styles/tipografia-global.test.ts:169-198`), que cierra el vector que casi todo el mundo olvida:

```ts
172    const ALLOWLIST_FAMILIAS = ['Manrope', 'Gilda Display', 'Great Vibes']
173    const GENERICOS = ['system-ui', 'sans-serif', 'serif', 'cursive']
...
188    it('@s5 el ÚNICO identificador SIN comillas admitido es un genérico CSS (Georgia, Cormorant… se rechazan)', () => {
189      // VECTOR SIN COMILLAS: CSS admite `font-family: Georgia`. Comprobar solo las entrecomilladas
190      // dejaría escapar una familia no horneada de una palabra escrita desnuda.
```

Con **guarda anti-vacuidad en cada aserción** (`:179`, `:193`: `expect(x.length).toBeGreaterThan(0)`).

### 3.5 `hero-estilos.test.ts:617-620` — la frontera, transcrita entera

El bloque completo, `src/components/hero-estilos.test.ts:614-625`:

```
614  /**
615   * @s17 — AMPLIACIÓN 2026-07-18 (acceptance 7). La verificación EN VIVO con Chrome cazó que el titular
616   * salía en la fuente por defecto del UA («Times New Roman»), NO en Great Vibes: `.heroMarca`/
617   * `.heroStudio` NO declaraban `font-family` → HEREDABAN la del cuerpo. El `@font-face` de Great Vibes
618   * y Manrope YA está horneado por F-05 (`src/main.tsx`); el hero simplemente NO la pedía. ESTE test
619   * asevera SOLO que el SCSS PIDE la fuente (bytes del `.module.scss`, como @s1/@s3/@s9). Que el
620   * NAVEGADOR la APLIQUE se RE-VERIFICA EN VIVO con Chrome, NO aquí (jsdom no carga @font-face [V]).
621   *
622   * Anti-tautología: los nombres esperados «Great Vibes» y «Manrope» van ESCRITOS A MANO (como el 1,2 s
623   * de @s4), NUNCA importados de site.ts ni de ningún símbolo. Regex robusta a comillas simples/dobles
624   * y al whitespace de prettier.
625   */
```

Y los tres tests que gobierna (`:626-655`), de los cuales el tercero es el que Galapavet necesita
copiar mentalmente:

```ts
649  it('@s17 NINGUNA de las dos reglas base se queda SIN font-family (la ausencia fue el fallo cazado en vivo)', () => {
650    // Presencia EXPLÍCITA: es justo lo que faltaba (heredar la del cuerpo → «Times New Roman»).
651    for (const clase of ['letras', 'heroStudio']) {
652      expect(reglaBase(clase), `${clase} debe NOMBRAR su propia font-family, no heredarla`).toMatch(
653        /font-family\s*:/,
654      )
655    }
656  })
```

**La misma frontera, escrita como contrato Gherkin** —
`features/tipografia_global.feature:209-215`:

```
209  # ---------------------------------------------------------------------------
210  # (B) Se RE-VERIFICA EN VIVO con Chrome tras el TDD — sobre `dist/` servido (build SSG real + CDP),
211  # NUNCA jsdom. Eje [NV], mismo estatuto que el número LCP de F-07 (C-2). PROHIBIDO fingir con jsdom.
212  # Estos escenarios NO son puerta unitaria: son la fase EN VIVO que estrenó F-07.
213  # 🔴 BLINDAJE (reparación menor): @s8/@s9 NO viven en `tipografia-global.test.ts` ni en jsdom. jsdom no
214  # carga @font-face, no descarga fuentes ni pinta [V]; ejecutarlos ahí sería FINGIR. Van SOLO por Chrome
215  # real/CDP sobre `dist/`, tras las cinco puertas verdes.
216  # ---------------------------------------------------------------------------
```

Y en la cabecera del propio fichero de test — `src/styles/tipografia-global.test.ts:11-14`:

> *«Este fichero implementa SOLO @s1..@s7 (SIN jsdom como navegador, SIN pintar). Los @s8/@s9 son
> `@verificacion-viva` (`font-family` COMPUTADO real, `document.fonts.check`): los cierra el LEAD con
> Chrome/CDP sobre `dist/`, NUNCA aquí — jsdom no carga `@font-face`, no descarga fuentes ni pinta.»*

**Ésta es la frontera exacta que Galapavet necesita trazar, en tres capas:**

| Capa | Instrumento | Qué demuestra | Puerta |
| --- | --- | --- | --- |
| A | `readFileSync` del `.scss` + parser de llaves | La declaración **está escrita** | `vitest run` |
| B | `readFileSync` de `dist/**/*.css` desde `tools/puerta-*.ts`, invocado en `pnpm build`; y un test que corre el build y exige exit 0 | Lo **publicado** dice lo que creemos | `pnpm build` |
| C | Chrome real vía CDP sobre `dist/` servido | El navegador lo **pinta** | escenario `@verificacion-viva`, cerrado por el lead |

### 3.6 Cuántos tests de estilo hay y qué cubren

**9 ficheros, 139 bloques `it` declarados** (contados con `grep -cE "^[[:space:]]*(it|it\.each)"`;
alguno es `it.each`, así que los casos ejecutados son más):

| Fichero | Líneas | `it` | Qué cubre |
| --- | ---: | ---: | --- |
| `src/components/hero-estilos.test.ts` | 698 | 37 | Estado base visible, ocultación solo en el 0 % del keyframe, `clamp()`, `--ink` como color, **`font-family` del rótulo (@s17)**, `prefers-reduced-motion`, `offset-path`, unidades del `stroke-dasharray`, cero `url(https:` |
| `src/components/galeria-estilos.test.ts` | 483 | 34 | Escenario 3D por `[data-distancia]`, `@media` móvil suaviza, único breakpoint 640px, giros `< 90°`, `transition:none` / `pointer-events:none` en la oculta, `touch-action: pan-y`, mandos 2.75rem (44 px), `color-mix` al 85 %, tokens de borde y glifo, **guarda anti-`@font-face` (:309)** |
| `src/components/resenas-estilos.test.ts` | 420 | 32 | Mismo carrusel aplicado a reseñas; **guarda anti-`@font-face` (:307)** |
| `src/styles/tipografia-global.test.ts` | 262 | 14 | `body` = Manrope, regla **conjunta** `h2,h3` = Gilda, enganche en `main.scss`, ausencia de `font-family` prohibida, **allowlist de familias (con y sin comillas)**, `h1` excluido, cero `!important`, solo selectores de tipo |
| `src/components/equipo-estilos.test.ts` | 122 | 10 | `aspect-ratio: 4/3`, `--accent-dark` en vez de `--accent`, estado activo por `&[aria-pressed='true']` (no por clase), bordes `--border-interactive`, estrellas `--accent-2` |
| `src/styles/cascara-global.test.ts` | 75 | 4 | Existe `:focus-visible`, **no** es `outline:none/0`, `scroll-padding-top > 0`, enganche en `main.scss` |
| `src/styles/scroll-padding-cabecera.test.ts` | 65 | 3 | `scroll-padding-top` en `html`, `>= 76px` (altura re-medida de la cabecera, escrita a mano), **no** es el `5rem` heredado |
| `src/components/contacto-estilos.test.ts` | 90 | 3 | `@media` móvil trata `.telefono`, no se atribuye umbral a SC 2.5.8, regresión de especificidad `.datos a:not(:global(.demo-btn))` |
| `src/components/contacto-fuente.test.ts` | 37 | 2 | (No es CSS: lee los bytes del `.tsx`.) El host de Instagram no está horneado en el componente |

**Lo que NO tiene test de estilos, y es dato:** `cabecera.module.scss` (203 líneas),
`faq.module.scss` (67), `reserva.module.scss` (176), `catalogo`, `destacados`, `ofertas`,
`_demo.scss` (173). **No todo `.module.scss` lleva su `*-estilos.test.ts`**: se escriben donde hubo
una decisión visual **razonada y frágil**, no por sistema.

---

## 4. VERIFICACIÓN EN VIVO

### 4.1 ¿Automatizada o manual? — **Semiautomática, fuera del repo, cerrada por el humano/lead**

**No hay Playwright ni Puppeteer en el proyecto.** Verificado:
`grep -rn "playwright|puppeteer"` sobre `*.json/*.ts/*.md/*.yaml` → los únicos aciertos son
**documentación de skills de terceros** (`.agents/skills/nodejs-best-practices/SKILL.md:284`,
`.agents/skills/vitest/references/*`), una **mención hipotética** en
`docs/research/legal-cookies.md:271` (*«Reproducible con `claude-in-chrome` o Playwright»*), y
`pnpm-lock.yaml:2377,2393` — que es `@vitest/browser-playwright` como **peer OPCIONAL de vitest**,
**no instalado como dependencia del proyecto** (no figura en `package.json`).

**Las herramientas reales, citadas en `progress/verificacion_viva_hero_marca.md:8-12`:**

> ```
>  8  > **Método.** `dist/` de producción (build con las 5 puertas verdes) servido por `vite preview`
>  9  > (:8908) y medido con **Chrome real headless vía CDP con visibilidad forzada** — reproducible en
> 10  > `.experimentos-tmp/f07-verificacion-viva/measure-lcp.mjs`. (La pestaña de la extensión cargó en
> 11  > **background**, donde Chrome no registra el LCP ni avanza las animaciones; por eso la medición
> 12  > fiable se hace con visibilidad forzada. Mismo motor Chrome, resultado determinista.)
> ```

Y en la re-verificación, **dos vías independientes que deben coincidir**
(`progress/verificacion_viva_hero_marca.md:79-83`):

> *«`pnpm build` fresco (exit 0, las 5 puertas) → `dist/` servido por `vite preview` (:4173) → medido
> de DOS formas independientes que coinciden: (a) la **extensión de Chrome del humano** sobre la
> pestaña real; (b) **Chrome headless vía CDP con visibilidad forzada**
> (`.experimentos-tmp/f07-verificacion-viva/measure-lcp.mjs`, URL 8908→4173), que mide el LCP fiable
> que la pestaña de fondo no registra.»*

> ⚠️ **`.experimentos-tmp/` está git-ignored** (`verificacion_viva_hero_marca.md:67-68`): **el script
> `measure-lcp.mjs` NO está en el repo**. No he podido leerlo. **NO VERIFICADO**: su contenido
> exacto. Lo que sí consta es qué mide (tabla siguiente).

### 4.2 Qué se mide en vivo — y el fallo que SOLO esto cazó

`progress/verificacion_viva_hero_marca.md:29-49`, íntegro en lo esencial:

> ```
> 29  ## 🔴 El fallo que SOLO la verificación en vivo cazó: el titular NO usa la fuente de marca
> 31  **Medido:** `document.fonts.check('142px "Great Vibes"')` → **`false`**; el titular «Nails Lash»
> 32  computa `font-family: "Times New Roman"` (el fallback serif del UA), **no Great Vibes**.
> 34  **Causa raíz (es del CÓDIGO, no del entorno):** `src/components/hero.module.scss` **no declara
> 35  `font-family` para el titular**. […]
> 40  **Verificado que NO es un problema de servido:** el `@font-face` de Great Vibes **sí** está en el CSS
> 41  de `dist/`, y su `.woff2` **se sirve** (HTTP 200, 42.800 bytes). La fuente está disponible; **el hero
> 42  simplemente no la pide**, porque el CSS del titular no la nombra.
> 44  **Por qué NINGUNA puerta lo cazó, y por qué esto justifica la fase con Chrome:** los tests unitarios
> 45  leen el SCSS y aseveran `clip-path`/`animation`/`@media`; el `judge` midió el HTML crudo (estructura,
> 46  `--ink`, sin inline); la mutación cubrió la derivación de `NOMBRE`. **Ninguno mira qué fuente PINTA
> 47  el titular** — eso solo se ve en un navegador que renderiza. Es «verde ≠ funciona» en estado puro.
> ```

**Éste es LITERALMENTE el problema de Galapavet: «Times New Roman» en el navegador con la suite en
verde.** Con una diferencia agravante: en NailsLash el `@font-face` **sí** estaba en `dist` y solo
faltaba pedirlo; en Galapavet **no hay `@font-face` en absoluto** (0 apariciones de `font-family` en
el CSS generado).

**El sondeo concreto** (`verificacion_viva_hero_marca.md:87-102`) mide, por rama:

- `document.fonts.check('142px "Great Vibes"')` → `true`/`false`
- `getComputedStyle(el).fontFamily` de elementos concretos
- estado en `document.fonts` (`loaded` / `unloaded`)
- LCP y si el elemento LCP es el `<h1>` (`lcp_inH1`)
- `scrollWidth == clientWidth` a 320px (reflow, SC 1.4.10)
- `getAnimations()` bajo `prefers-reduced-motion: reduce` → debe ser `[]`
- `PerformanceResourceTiming` → `n_externas: 0` (invariante F-05)
- color computado = `rgb(142,51,85)` = `--ink`
- consola: 0 errores / 0 warnings de la página
- captura visual

Ramas medidas: **normal 1280 · reduced-motion 1280 · reflow 320**.

### 4.3 El segundo hallazgo de esa sesión — y es, palabra por palabra, el de Galapavet

`progress/verificacion_viva_hero_marca.md:134-137`:

> ```
> 134  2. **El `body` global no fija `font-family`** en `src/styles/` (grep = 0): todo el texto que no lo
> 135     declare sale en la serif por defecto del UA (visible en la captura: «Servicios», el cuerpo). NO es
> 136     F-07 (el titular del hero SÍ queda correcto) y no hay feature/spec aprobada para la tipografía
> 137     global del cuerpo. Candidato a su propia feature. **Deuda declarada, no reparada.**
> ```

**Esa deuda declarada se convirtió en la feature F-21 `tipografia_global`**, que es el §6 de este
informe.

### 4.4 Cómo se declara la frontera en el contrato Gherkin

Los escenarios de verificación viva llevan **etiqueta propia** y **no son puerta unitaria**:

- `features/tipografia_global.feature:218` → `@s8 @verificacion-viva`
- `features/tipografia_global.feature:239` → `@s9 @verificacion-viva`

Ejemplo de redacción (`features/tipografia_global.feature:219-225`), útil como plantilla:

```gherkin
@s8 @verificacion-viva
Scenario: [VERIFICACIÓN EN VIVO CON CHROME, NO jsdom] el navegador PINTA de verdad Manrope en el cuerpo y Gilda Display en un `<h2>`, y descarga por PRIMERA VEZ el woff2 autohospedado de Gilda Display
  Given el `dist/` de producción (build SSG real con las cinco puertas verdes) servido y abierto en Chrome real vía CDP
  When se computa el "font-family" del "document.body" y el de un "<h2>" real de la página, y se consulta "document.fonts"
  Then el "font-family" computado de "document.body" resuelve al stack de Manrope y "document.fonts.check('16px Manrope')" es "true"
  And el "font-family" computado de un "<h2>" real […] resuelve al stack de Gilda Display y "document.fonts.check('24px Gilda Display')" es "true"
  And la petición del woff2 […] va a una ruta "/assets/…" del propio sitio, SIN esquema "http(s)://" y SIN dominio de terceros
  And los nombres "Manrope" y "Gilda Display" pasados a "document.fonts.check(...)" se escriben A MANO en el script de verificación, NO se importan de ningún símbolo
```

Y un matiz de precisión que evita un falso negativo — `features/tipografia_global.feature:246`:

> *«se descargan SOLO los pesos realmente USADOS […]; un peso horneado que NINGUNA regla usada
> invoque —p. ej. Manrope 500/600— puede NO descargarse, y no descargarlo NO es un fallo»*

Fundamento citado en `src/main.tsx:32-34`: *«F-05 HORNEA los `@font-face`; NO ESCRIBE NI UN
`font-family` DE USO […] mientras nada referencie una familia, el navegador no descarga su woff2
(css-fonts-4 §4.8.1 [V])»*.

**Importante para Galapavet:** la puerta de terceros exige el `@font-face` **en el CSS**, no la
descarga. Son dos cosas distintas y confundirlas produce alarmas falsas.

### 4.5 Otras huellas de verificación en vivo

`grep -rln "Chrome|CDP"` sobre `*.md/*.feature/*.json` (sin `node_modules`) da **37 ficheros**. Los
de proceso, no de skills:

`features/cero_terceros.feature`, `features/galeria_carrusel.feature`, `features/hero.feature`,
`features/hero_marca.feature`, `features/tipografia_global.feature`; `feature_list.json`;
`progress/f05_verificacion_previa.md`, `f06_verificacion_previa.md`, `f07_verificacion_previa.md`,
`verificacion_viva_hero_marca.md`, `hallazgos_hero_caligrafia.md`, `hero_caligrafia_lenta_diseno.md`,
`galeria_coverflow_diseno.md`, `judge_hero_marca.md`, `judge_tipografia_global.md`,
`judge_galeria_carrusel_v2.md`, `judge_hero_caligrafia_lenta.md`, `mutation_hero_marca.md`,
`tdd_hero_marca.md`, `tdd_tipografia_global.md`, `tdd_galeria_carrusel.md`, `tdd_contacto.md`,
`spec_draft_tipografia_global.md`, `history.md`, `NAILSLASHSTUDIO_HANDOFF.md`, `project-spec.md`.

**Conclusión:** la verificación en vivo **no está automatizada en CI ni en `pnpm test`**. Es una
**fase del proceso**, ejecutada por el lead con `vite preview` + Chrome/CDP + la extensión del
humano, cuyo **resultado se escribe en `progress/*.md`** y es lo que cierra los escenarios
`@verificacion-viva`. La regla que la sostiene está en `docs/verification.md:3-4`: *«el agente no
dice "funciona", lo demuestra»*.

---

## 5. LOS PATRONES `*.module.scss`

Contexto que hace comparables las dos webs: NailsLash tiene **2.249 líneas de SCSS** repartidas en 12
`.module.scss` + `_demo.scss`. Galapavet acaba de crear sus `.module.scss` (16 ficheros nuevos, sin
commitear) y su CSS compilado tiene **124 reglas totales**.

| `.module.scss` | Líneas | Reglas de nivel superior | Tokens consumidos |
| --- | ---: | ---: | --- |
| `equipo.module.scss` | **329** | 32 | `--accent`, `--accent-2`, `--accent-dark`, `--accent-soft`, `--bg`, `--border-interactive`, `--ink`, `--line`, `--muted`, `--on-accent`, `--surface`, `--text` (12) |
| `resenas.module.scss` | 325 | — | (carrusel, ídem galería) |
| `galeria.module.scss` | **297** | 17 | `--accent`, `--accent-dark`, `--accent-soft`, `--border-interactive`, `--line`, `--muted`, `--surface`, `--surface2` + **locales** `--escala`, `--giro`, `--opacidad`, `--s`, `--x`, `--y`, `--z` |
| `hero.module.scss` | **242** | 18 (4 `@keyframes`) | **solo 2**: `--ink`, `--duracion-caligrafia` |
| `cabecera.module.scss` | **203** | 14 | `--accent-dark`, `--border-interactive`, `--header-bg`, `--header-blur`, `--ink`, `--line`, `--muted`, `--on-accent` (8) |
| `reserva.module.scss` | **176** | 16 | `--accent`, `--accent-dark`, `--accent-soft`, `--bg`, `--border-interactive`, `--estado-en-linea`, `--ink`, `--line`, `--on-accent`, `--surface`, `--text` (11) |
| `faq.module.scss` | **67** | 8 | `--accent-dark`, `--ink`, `--line`, `--text` (4) |

### 5.1 `faq.module.scss` — el patrón mínimo, íntegro (67 líneas)

Es el mejor punto de partida para Galapavet: acordeón con `<details>/<summary>` nativos, 4 tokens,
sin JS.

```scss
 1  // FAQ en acordeón (capa visual del DEMO). Look del prototipo Opcion-1-Rosa: acordeón sobrio con
 2  // signo +/− a la derecha. Usa <details>/<summary> nativos (respuestas siempre en el DOM).
 4  .contenedor { max-width: 840px; margin-inline: auto; padding-inline: 2.5rem; }
10  @media (max-width: 640px) { .contenedor { padding-inline: 1.5rem; } }
16  .centro { text-align: center; }
20  .lista { margin-top: 2.125rem; border-top: 1px solid var(--line); }
25  .item { border-bottom: 1px solid var(--line); }
29  .pregunta {
30    display: flex; justify-content: space-between; align-items: center;
33    gap: 1.25rem; padding: 1.375rem 0.25rem; cursor: pointer;
36    color: var(--ink);
37    font-family: 'Gilda Display', serif;
38    font-size: 1.1875rem; // 19px
39    list-style: none;
42    &::-webkit-details-marker { display: none; }      // oculta el triángulo por defecto
47    &::after { content: '+'; color: var(--accent-dark); font-size: 1.625rem; line-height: 1; flex-shrink: 0; }
54  }
56  .item[open] .pregunta::after { content: '\2013'; }  // «–»
60  .respuesta { margin: 0; padding: 0 0.25rem 1.625rem; color: var(--text); line-height: 1.7; max-width: 700px; font-size: 1rem; }
```

**Cinco rasgos que son PATRÓN, no valor:**
1. **Comentario de cabecera que cita la fuente del diseño** y la técnica (`<details>` nativo).
2. **Contenedor con `max-width` + `margin-inline:auto` + `padding-inline`**, y **un solo
   breakpoint** (640px) que solo reduce el padding.
3. **Todo color sale de un token.** Cero hex sueltos. Motivo, `galeria-estilos.test.ts:371-372`:
   *«La puerta de contraste solo lee `_tokens.scss`: un color inventado aquí sería INVISIBLE para
   ella.»*
4. **`font-size` en `rem` con el px en comentario** (`1.1875rem; // 19px`) — trazabilidad al diseño.
5. **El estado abierto se lee del atributo nativo** `[open]`, nunca de una clase de React.

### 5.2 `cabecera.module.scss` — cabecera sticky translúcida

`src/components/cabecera.module.scss:12-27`:

```scss
12  .cabecera {
13    position: sticky; top: 0; z-index: 50;
16    display: flex; align-items: center; justify-content: space-between;
19    gap: 1rem; flex-wrap: wrap;
21    padding-block: 0.9375rem;   // 15px
22    padding-inline: 2.5rem;     // 40px
23    background: var(--header-bg);
24    backdrop-filter: var(--header-blur);
25    border-bottom: 1px solid var(--line);
26    font-family: 'Manrope', system-ui, sans-serif;
27  }
35  .marca { font-family: 'Gilda Display', serif; font-size: 1.1875rem; letter-spacing: 0.06em;
40           text-transform: lowercase; text-decoration: none; color: var(--ink); }
```

**Dos decisiones de cabecera que son PATRÓN puro** (`cabecera.module.scss:3-6`):

> *«🔴 EL EJE RESPONSIVE LO DECIDE CSS PURO (`@media`), NO JS: evita el patrón de memoria
> `red-css-para-rama-solo-js-en-ssg` (bajo SSG un `useIsMobile` hornea la rama de escritorio y en
> móvil desborda hasta que hidrata). El estado abierto/cerrado va en `aria-expanded` (atributo
> CONSULTABLE), NUNCA en un className condicional (medido INMATABLE bajo la regla
> anti-clase-CSS).»*

Y **la translucidez está tokenizada** (`--header-bg`, `--header-blur`) porque su valor **está atado a
una puerta de contraste** — `_tokens.scss:52-70`: el 88 % no es estético, *«LA PUERTA LEE ESTE 88 % Y
RECALCULA: bajarlo pone @s17/@s18 en rojo»*.

**Nota estructural relevante:** en NailsLash **la cabecera y el pie comparten fichero**
(`cabecera.module.scss:130-202` contiene `.pie`, `.pieContenido`, `.pieMarca`, `.pieCols`,
`.pieCol`, `.pieLegal`), porque son **una sola feature** (F-06 `header_nav_footer`). Galapavet los
tiene separados (`Cabecera` y `PieDePagina`): no es un problema, pero explica el reparto.

### 5.3 `hero.module.scss` — el más grande y el que MENOS tokens usa

242 líneas, 18 reglas, **4 `@keyframes`** (`escribir` :98, `recorrer` :104, `aparecer` :110,
`retirarse` :119, `revelarStudio` :162) y **solo dos** custom properties: `--ink` y
`--duracion-caligrafia`. Estructura: `.eyebrow` → `.escena` → `.rotulo` (SVG) → `.letras` (`<text>`)
→ `.trazo` (máscara) → `.aplicador` (pincel) → `.heroMarca` / `.titulo` / `.heroStudio` → `.control`
→ `@media (prefers-reduced-motion: reduce)` (:230).

**Lo aplicable a Galapavet, aunque su hero sea otro:**
- **`clamp()` para el tamaño, `height: auto`, `overflow: visible`, y NUNCA `max-width: %`**
  (`hero-estilos.test.ts:571-576`): *«Medido: con `max-width: 100%` el rótulo caía a 102 px y el hero
  entero a 48 px»*.
- **El estado base es el estado FINAL VISIBLE**; lo oculto vive **solo** dentro del keyframe
  (`hero-estilos.test.ts:83-108`). Si el JS falla o el CSS no carga, **se ve**, no se queda invisible.
- **`@media (prefers-reduced-motion: reduce)` con `animation: none` + `display:none` del decorado**.
- **En SVG el color es `fill`, no `color`** (`hero-estilos.test.ts:653-657`) — trampa real.
- **En SVG hay que declarar `font-family` en el `<text>`**, no basta con heredar.

### 5.4 `galeria.module.scss` / `resenas.module.scss` — el patrón de custom properties LOCALES

Aquí está la técnica más transferible de todo el repo. El carrusel 3D **no escribe estilos por
tarjeta**: define **variables locales por `[data-distancia]`** y una sola `transform` que las
consume.

```scss
 95  .tarjeta { … }
     // dentro: [data-distancia='0'|'1'|'2'|'3'] { --giro; --x; --y; --z; --escala; --opacidad; }
245  @media (max-width: 640px) { … los mismos data-distancia con valores MENORES … }
292  @media (prefers-reduced-motion: reduce) { .tarjeta { transition: none; } }
```

**Y eso es lo que permite testear relaciones, no solo valores** — `galeria-estilos.test.ts:80+`
define `magnitud(cuerpo, 'giro')` que devuelve un **número**, y con él:

```ts
252  for (const distancia of [1, 2, 3]) {
254    const pequeno = porDistancia(movil, distancia)
256    expect(Math.abs(magnitud(pequeno,'giro'))).toBeLessThan(Math.abs(magnitud(grande,'giro')))
```

**Lección de diseño:** *si escribes los valores del diseño como custom properties con nombre, puedes
aseverar propiedades matemáticas sobre ellos leyendo el texto fuente.* Si los escribes incrustados en
un `transform: rotateY(-34deg) translateX(...)`, solo puedes hacer `toMatch` de una cadena.

### 5.5 `equipo.module.scss` y `reserva.module.scss`

- **`equipo`** (329 líneas, 32 reglas): tarjeta con `.foto { aspect-ratio: 4/3; background:
  var(--accent-soft); }` (el hueco de imagen **tiene forma y color de token aunque no haya foto** —
  relevante para Galapavet, cuyas 26 rutas de imagen dan 404), rejilla, chips, selector de día/hora,
  confirmación, mini-carrusel de reseñas. **El estado activo se colorea desde
  `&[aria-pressed='true']`, no desde una clase** (`equipo-estilos.test.ts:66-80`): *«El estado activo
  del día NO vive en un `className` condicional (inmatable con `css:false`): se colorea desde
  `&[aria-pressed='true']` DENTRO de `.dia`, la misma fuente que el árbol de accesibilidad.»*
- **`reserva`** (176 líneas, 16 reglas): chat simulado — `.chat`, `.chatCabecera`, `.avatar`,
  `.enLinea` (token `--estado-en-linea`), `.hilo`, `.burbujaUsuario` / `.burbujaBot`, `.chipChat`,
  `.entrada`, `.reiniciar`. **No tiene `reserva-estilos.test.ts`.**

### 5.6 `_demo.scss` — la capa que Galapavet no tiene y que explica el margen de 8px

`src/styles/_demo.scss` (173 líneas) es una **capa visual global** declarada explícitamente como *«NO
es una feature del pipeline»* (`:2`). Y contiene **exactamente** lo que a Galapavet le falta:

```scss
12  body {
13    background: var(--bg);
14    color: var(--text);
15    margin: 0;              ← EL MARGEN DE 8px DEL UA, ANULADO AQUÍ
16  }
19  @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
25  ::selection { background: var(--accent); color: var(--on-accent); }
32  .demo-seccion { padding-block: 5.75rem; border-top: 1px solid var(--line); }
37  .demo-seccion--alt { background: var(--surface2); border-top: none; }
46  .demo-contenedor { max-width: 1200px; margin-inline: auto; padding-inline: 2.5rem; }
52  @media (max-width: 640px) { .demo-contenedor { padding-inline: 1.5rem; } }
59  .demo-encabezado { max-width: 620px; margin-bottom: 2.375rem; }
69  .demo-eyebrow { text-transform: uppercase; letter-spacing: 0.28em; font-size: 0.75rem;
74                  font-weight: 600; color: var(--accent-dark); }
78  .demo-titulo { font-family: 'Gilda Display', serif; font-weight: 400;
82                 font-size: clamp(1.875rem, 4vw, 2.875rem); line-height: 1.06; color: var(--ink); }
87  .demo-intro { color: var(--text); line-height: 1.65; }
```

> 🔴 **NailsLash NO tiene `_reset.scss`.** Verificado: `src/styles/` contiene exactamente
> `main.scss`, `_base.scss`, `_demo.scss`, `_tipografia.scss`, `_tokens.scss`. El "reset" son **tres
> declaraciones** (`_demo.scss:12-16`) más `html { scroll-padding-top }` en `_base.scss:40-42`. La
> observación de Galapavet *«0 reglas para `html` o `body`; body conserva el margen de 8px»* se
> resuelve con **esas cuatro líneas**, no con un reset de 200.

**El reparto completo de la hoja global** (`src/styles/main.scss`, 13 líneas, íntegro):

```scss
 1  // Punto de entrada de los estilos globales. El parcial _reset llega con la feature de
 2  // maquetación; _tokens es de F-03 y _base es la cáscara global de F-04 (@s11). _tipografia es la
 3  // capa tipográfica global de F-21 (cuerpo Manrope, encabezados Gilda Display).
 4  @use 'tokens';
 5  @use 'base';
 6  @use 'tipografia';
 7  // Capa visual del DEMO (rama demo/lunes-prototipo): aplica el look del prototipo Opcion-1-Rosa.
 8  @use 'demo';
 9
10  // Un solo esquema de color: este proyecto no tiene tema oscuro (decisión 5).
11  :root {
12    color-scheme: light;
13  }
```

**Y el enganche está ASEVERADO por test, dos veces**, porque es el fallo que Galapavet ha sufrido:

- `src/styles/cascara-global.test.ts:70-74` — *«Sin esto, `_base.scss` podría cumplir todo lo
  anterior y NO LLEGAR AL SITIO: los tests verdes sobre un fichero que nadie importa son el verde por
  vacuidad de esta feature.»*
- `src/styles/tipografia-global.test.ts:133-138` — *«ANTI-VACUIDAD […]: un `_tipografia.scss`
  perfecto que nadie importa NO llega al sitio (el cuerpo seguiría en Times New Roman) = verde por
  vacuidad»*.

> **Falta la pieza equivalente para `main.tsx`.** Ni NailsLash asevera que `main.tsx` importe
> `./styles/main.scss`; simplemente ahí sí está (`main.tsx:43`). **Para Galapavet, ése es el test
> número uno a escribir**, porque es exactamente el eslabón que se rompió.

---

## 6. `_tipografia.scss` — 21 líneas, y el razonamiento del "suelo heredable"

### 6.1 El fichero, íntegro

`src/styles/_tipografia.scss` (21 líneas, sin recortar):

```scss
 1  // Tipografía GLOBAL del documento (F-21). Contrato: features/tipografia_global.feature.
 2  //
 3  // Suelo HEREDABLE del cuerpo: el `body` fija la fuente que todo descendiente sin `font-family`
 4  // propia hereda. Arregla la deuda de F-07 (el cuerpo caía en la serif por defecto del UA). El
 5  // stack copia a mano el de la casa (eyebrow / cabecera / pie), pero cada feature es dueña de su
 6  // declaración: aquí NO se tocan ficheros `done`.
 7  //
 8  // Solo fuentes YA horneadas por F-05 (Manrope · Gilda Display · Great Vibes): ni @import ni
 9  // @font-face nuevos, ningún tercero.
10  body {
11    font-family: 'Manrope', system-ui, sans-serif;
12  }
13
14  // Suelo de TIPO de los encabezados de sección. Regla CONJUNTA `h2, h3` (una sola, dos selectores),
15  // no dos reglas. Es un selector de TIPO (0,0,1): NO matchea `h1` (el titular del hero, F-07, queda
16  // intacto) y cualquier CLASE futura (p. ej. los precios de F-09) lo derrota. El `h3` se asevera por
17  // lectura aunque hoy no exista ningún `<h3>` en el artefacto; se verifica en vivo el día que exista.
18  h2,
19  h3 {
20    font-family: 'Gilda Display', serif;
21  }
```

### 6.2 Por qué es un fichero APARTE

**Tres razones, todas citables, y las tres aplican a Galapavet con sus 19 features `done`:**

**(1) Porque es una FEATURE PROPIA, nacida de una deuda declarada.** No es refactor: es F-21
`tipografia_global`, con su `features/tipografia_global.feature` (254 líneas), su
`progress/tdd_tipografia_global.md`, su `judge_tipografia_global.md` y su test dedicado. Su origen
está fechado: `progress/verificacion_viva_hero_marca.md:134-137` (§4.3). **Meter esas 4 líneas
dentro de `_base.scss` habría sido tocar un fichero de una feature `done` sin escenario.**

**(3 y decisiva) — NO SE TOCAN FICHEROS `done`.** Es la frase literal de `_tipografia.scss:5-6`:

> *«El stack copia a mano el de la casa (eyebrow / cabecera / pie), **pero cada feature es dueña de su
> declaración: aquí NO se tocan ficheros `done`**.»*

Aseverado como test — `src/styles/tipografia-global.test.ts:222-237`:

```ts
222  it('@s6 el partial no declara ninguna regla que aplique a h1 ni a las clases del titular del hero', () => {
224    const clasesHero = ['.heroMarca', '.heroStudio', '.titulo']
226    for (const regla of reglas(partial())) {
227      expect(selectoresDe(regla.selector), 'ninguna regla del partial matchea h1').not.toContain('h1')
229      for (const clase of clasesHero) {
230        expect(regla.selector, `el partial no debe declarar ${clase}`).not.toContain(clase)
235  it('@s6 el partial NO edita ni referencia hero.module.scss (F-07 está `done`)', () => {
236    expect(partial()).not.toMatch(/hero\.module/)
```

Y como contrato — `features/tipografia_global.feature:187`:

> *«el partial NO edita ni referencia "src/components/hero.module.scss" (F-07 está `done`: su
> tipografía de marca la fija @s17 de hero_marca.feature)»*

**(2) Porque la separación de capas hace la operación SEGURA POR CONSTRUCCIÓN.**

### 6.3 "Suelo, no techo" — el razonamiento completo

`features/tipografia_global.feature:193-207`, transcrito:

```gherkin
193  @s7
194  Scenario: la capa global es un SUELO, no un TECHO — el partial no usa `!important`, así que toda declaración `font-family` propia (cabecera, eyebrow, hero) sigue ganando
195    Given el partial "src/styles/_tipografia.scss" con sus reglas "body" y "h2, h3"
196    When un test comprueba la fuerza de esas reglas
197    Then ninguna declaración "font-family" del partial lleva "!important"
198    And el `body` fija su fuente por HERENCIA (la fuerza más débil): cualquier descendiente con "font-family" propia —".eyebrow", ".heroMarca", ".heroStudio" (F-07), ".cabecera", ".pie" (F-06)— la sobrescribe, tenga la especificidad que tenga
199    And el selector de tipo "h2, h3" (0,0,1) es derrotado por cualquier CLASE futura (0,1,0), p. ej. la de los precios de F-09
200    # 🔴 EL PUNTO QUE PIDIÓ PABLO (spec §5): la dirección de la cascada es SEGURA por construcción. El
201    # `body` NO puede derrotar al hero ni al header porque la HERENCIA solo rellena donde NINGUNA regla
202    # matchea; el `h2, h3` es el selector más débil tras la herencia. NADA existente se pisa.
203    # 🔴 CASO LÍMITE (spec §4.5): un futuro `<h2>` con clase propia (F-09) GANA al selector de tipo `h2`
204    # —el global es un SUELO, no un techo—; sin colisión, es exactamente el comportamiento buscado. El
205    # `!important` sería la única forma de romper esto: por eso el test PROHÍBE su presencia en el partial.
206    # Riesgo residual DECLARADO (no bug): redundancia (body Manrope + cabecera Manrope + eyebrow Manrope);
207    # es deliberada —cada feature es dueña de su declaración y no se tocan ficheros `done`—.
```

**El argumento en una frase:** *la herencia solo rellena donde NINGUNA regla matchea, y `h2, h3` es
(0,0,1) —el selector más débil que existe tras la herencia—, así que **añadir esta capa no puede
pisar nada de lo ya hecho**.* Es lo que convierte un cambio global en una operación de riesgo cero
sobre 19 features `done`.

Los tres tests que lo blindan (`src/styles/tipografia-global.test.ts:240-261`):

```ts
241  it('@s7 ninguna declaración font-family del partial lleva !important', …)
249  it('@s7 el partial no usa !important en ninguna parte', …)
253  it('@s7 las reglas del partial usan solo selectores de TIPO (sin clase ni id): body por herencia, h2/h3 (0,0,1)', () => {
256    for (const regla of reglas(partial())) {
257      expect(regla.selector, `${regla.selector} debe ser un selector de tipo, sin clase ni id`).not.toMatch(/[.#]/)
```

Esa última aserción es elegante: **prohíbe `.` y `#` en cualquier selector del partial**. Es
imposible que la capa global suba de especificidad sin poner el test en rojo.

### 6.4 Por qué `h2, h3` y no `h1, h2, h3` — la frontera con lo `done`

`_tipografia.scss:14-17` y `features/tipografia_global.feature:188-191`:

> *«🔴 FRONTERA DURA (spec §2 y §5). El `h2, h3` es un selector de TIPO (0,0,1) que NO matchea `h1`:
> el `<h1>` del hero conserva Great Vibes/Manrope de F-07 sin que esta feature lo roce. DESLINDE para
> que nadie "amplíe" el selector a `h1, h2, h3` y pise el titular.»*

Y **una regla conjunta, no dos** (`_tipografia.scss:14-15`), aseverado contando reglas
(`tipografia-global.test.ts:108-121`): *«Que sea exactamente UNA regla mencionando h2/h3 es lo que lo
garantiza: una regla separada `h3 {…}` haría length 2.»*

Detalle honesto y muy en el espíritu de la casa (`_tipografia.scss:16-17`): *«El `h3` se asevera por
lectura aunque hoy no exista ningún `<h3>` en el artefacto; se verifica en vivo el día que exista.»*

---

## 7. Traducción operativa a Galapavet

> Esto es **lectura del patrón**, no una propuesta de implementación aprobada. Cualquier cambio en
> `src/` va por TDD con el `tdd_craftsman`, y las decisiones de producto (familias, subsets) van a
> puerta humana.

**Orden de dependencia, tal y como NailsLash lo construyó:**

1. **`@fontsource/<familia>` en `dependencies`**, un import `latin-<peso>.css` por peso realmente
   usado, **en `src/main.tsx`, antes** de la hoja global. Nunca `@fontsource-variable`, nunca
   `@fontsource/x` a secas. → §1.2, §1.3.
2. **`src/styles/main.scss`** con `@use 'tokens'; @use 'base'; @use 'tipografia';` (+ la capa visual
   que corresponda) y **`import './styles/main.scss'` en `main.tsx`**. ← **es la línea que falta**.
3. **`_base.scss`**: `html { scroll-padding-top }`, `:focus-visible`. **`_demo.scss` o equivalente**:
   `body { background; color; margin: 0 }` ← **mata el margen de 8px**. → §5.6.
4. **`_tipografia.scss`** aparte: `body { font-family: <cuerpo>, system-ui, sans-serif }` y regla
   **conjunta** `h2, h3 { font-family: <titulos>, serif }`. **Sin `!important`, sin `.` ni `#`, sin
   tocar `h1`.** Es la operación segura sobre las 19 features `done`. → §6.
5. **Tests de nivel A** (`readFileSync` + contador de llaves), con **anti-vacuidad**: cada partial
   debe estar `@use`-ado desde `main.scss`, y **`main.scss` debe estar importado desde `main.tsx`**
   (este último test NailsLash no lo tiene y Galapavet lo necesita). → §3.
6. **Puerta de nivel B**: `tools/puerta-terceros.ts` que lea `dist/**/*.css`, extraiga los pares
   `[familia, peso]` de los `@font-face` y los compare **por igualdad de conjuntos** con una lista
   declarada y anclada contra literal escrito a mano; más guarda anti-vacuidad y `base` de
   `vite.config.ts`. Enganchada a `pnpm build`. → §2.
7. **Escenarios `@verificacion-viva`** para lo que jsdom no puede: `document.fonts.check(...)`,
   `getComputedStyle(...).fontFamily`, cero peticiones externas, reflow a 320px. Cerrados por el lead
   con Chrome/CDP sobre `dist/` servido, y **escritos en `progress/`**. → §4.

**El subconjunto latino:** `U+0000-00FF` cubre `ñ Ñ` y todas las vocales acentuadas más `¿ ¡`. Es
**suficiente para el castellano de Galapavet**. El límite (tofu silencioso ante `Ł`/`ř`/`ğ` por
ausencia de `unicode-range`) es **decisión de producto** y en NailsLash pasó por **puerta humana**
(A-28). Debe re-medirse al instalar: `grep -c unicode-range node_modules/@fontsource/<familia>/latin-400.css`.

---

## 8. Lagunas de este estudio — lo que NO he podido verificar

| # | Laguna | Por qué | Cómo cerrarla |
| - | ------ | ------- | ------------- |
| 1 | **Ningún byte de fuente medido por mí** (los 119.540 B, el mínimo de 6.192 B, los 42.800 B de Great Vibes) | No hay `node_modules/` en el clon | `pnpm install` + `ls -l node_modules/@fontsource/*/files/*.woff2` |
| 2 | **Ausencia de `unicode-range` en `latin-<peso>.css`** no confirmada con mis ojos | Ídem | `grep -c unicode-range node_modules/@fontsource/<familia>/latin-400.css` |
| 3 | **La forma real del CSS de `dist/`** (minificado, sin comillas) | No hay `dist/` en el clon | `pnpm build && grep -o "@font-face{[^}]*}" dist/assets/*.css` |
| 4 | **`measure-lcp.mjs`**, el sondeo CDP | Vive en `.experimentos-tmp/`, **git-ignored** (`verificacion_viva_hero_marca.md:67-68`) | Reescribirlo desde la lista de lo que mide (§4.2) |
| 5 | **`font-display: swap` por defecto en `@fontsource` 5.2.8** (176/176 `@font-face`) | Documentado en `f05_verificacion_previa.md:199-201`, que además **advierte** de que *«es un hecho MEDIDO, no documentado — la doc oficial no lo menciona; un bump de versión podría cambiarlo»* | Medir tras instalar |
| 6 | **Que la suite de NailsLash esté hoy en verde** | No la he ejecutado (sin `node_modules`) | `pnpm install && pnpm test` |
| 7 | **`resenas-estilos.test.ts` leído solo parcialmente** (líneas 295-330 de 420) | Priorización | Lectura completa si hiciera falta |
| 8 | **El contraste real** de cualquier color: no he ejecutado la puerta de contraste | Fuera de alcance | — |

---

## 9. Índice de ficheros citados (todos en el clon de NailsLashStudioWeb)

**Fuentes y estilos globales**
`package.json:23,34-36` · `pnpm-lock.yaml:497,500,503,2873-2877` · `index.html:1-11` ·
`src/main.tsx:1-49` (bloque doctrinal `:4-35`, imports `:36-41`, hoja global `:43`) ·
`src/styles/main.scss:1-13` · `src/styles/_tokens.scss:1-75` · `src/styles/_base.scss:1-42` ·
`src/styles/_tipografia.scss:1-21` · `src/styles/_demo.scss:1-90` (`body` en `:12-16`)

**Puerta anti-terceros**
`src/lib/puerta-terceros.ts:1-303` (lista `:56-63`, regex `:117,120`, `parDelBloque:153-160`,
`violacionesDeFuentes:232-249`, guardas `:274-292`) · `tools/puerta-terceros.ts:1-114`
(filtro `:58`, lector `:63-77`, allowlist `:98`) · `src/lib/puerta-terceros.test.ts:580-700`
(`@s37` `:591-657`, `@s38` `:685-700`) · `src/lib/terceros.ts`

**Tests de estilo**
`src/components/hero-estilos.test.ts` (698 l.; parser `:26-57`, `@s17` `:614-657`, `@demo` `:659-698`) ·
`src/components/galeria-estilos.test.ts` (483 l.; helpers `:53-80`, guarda fuentes `:309-316`) ·
`src/components/resenas-estilos.test.ts` (420 l.; guarda fuentes `:307-313`) ·
`src/components/equipo-estilos.test.ts` (122 l.) · `src/components/contacto-estilos.test.ts` (90 l.) ·
`src/components/contacto-fuente.test.ts` (37 l.) · `src/styles/tipografia-global.test.ts` (262 l.) ·
`src/styles/cascara-global.test.ts` (75 l.) · `src/styles/scroll-padding-cabecera.test.ts` (65 l.)

**Configuración y proceso**
`vite.config.ts:19-28` · `vitest.config.ts:1-24` (`css: false` `:15`, `fileParallelism:false` `:14`) ·
`vitest.setup.ts:1` · `harness.config.json` · `feature_list.json` (`rules.notas`) ·
`docs/verification.md:1-177` · `src/pages/home-horneado.test.ts:1-120`

**Contratos y bitácora**
`features/tipografia_global.feature:100,155,180-254` · `features/hero_marca.feature:124,457,468` ·
`features/cero_terceros.feature` · `progress/f05_verificacion_previa.md:171-262,483-520` ·
`progress/verificacion_viva_hero_marca.md:1-143`
