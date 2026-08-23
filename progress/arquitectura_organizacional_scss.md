# Arquitectura SCSS de la organización — qué copió Galapavet y qué se dejó

> Hallazgo del 23/08/2026, siguiendo la pista del propio `github.md` del zip de
> diseño (`Downloads/ClinicaVeterinariaGalapavet.zip`), que declara como fuentes
> de referencia `Cenit-Digital/WebEmpresa` (rama `main`, `src/components` +
> `src/styles`) y `Cenit-Digital/NailsLashStudioWeb`.
>
> Ambos repositorios son **públicos**. Se han clonado en superficie desde el
> remoto para leerlos; las copias locales del equipo están en
> `Proyectos/CenitDigitalProyectosCodigo/{WebEmpresa,NailsLashStudioWeb}`.

## La causa raíz, en dos líneas

```
WebEmpresa/src/main.tsx:11   import './styles/main.scss'
Galapavet/src/main.tsx       import React / ReactDOM / App  ← ninguna hoja
```

**Galapavet no importa ninguna hoja de estilos global.** No es que la hoja esté
mal: es que no existe y nadie la carga. Todo lo demás se deriva de esto.

El mecanismo que Galapavet sí tiene —`vite.config.ts` →
`css.preprocessorOptions.scss.additionalData: '@use "tokens" as *;'`— inyecta los
tokens **dentro de cada `.module.scss`**, lo cual sirve para que un módulo pueda
usar `paso-tipografico()` o `espaciado()`, pero **no produce ni una sola regla
global**. Por eso `body` conserva Times New Roman, fondo transparente y el
margen de 8 px del navegador.

## Lo que tiene WebEmpresa y Galapavet no

| Fichero | Líneas | ¿En Galapavet? | Qué hace |
| --- | --- | --- | --- |
| `src/styles/main.scss` | 4 | **NO** | Punto de entrada global. Sólo `@use` de los otros. |
| `src/styles/_reset.scss` | 38 | **NO** | Reset moderno mínimo. |
| `src/styles/_base.scss` | 70 | **NO** | Estilos base de elemento **sobre los tokens**. |
| `src/styles/_tokens.scss` | 126 | sí (134) | Custom properties. |

`main.scss` entero:

```scss
@use 'tokens';
@use 'reset';
@use 'base';
@use 'logo-draw';
```

Y `_base.scss` abre con exactamente lo que falta en Galapavet:

```scss
body {
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

Incluye además `:focus-visible` global, `.skip-link` (saltar al contenido) y
`.prose` para las páginas de texto legal. Y un comentario que vale su peso en
oro: `main` **no** restringe ancho ni añade sangrado, porque las secciones van a
sangre completa y cada una lleva su propio `.inner` con `max-width` + gutter;
si `main` añadiera `max-width`/`padding` duplicaría el gutter y recortaría las
bandas de color de sección.

## El sistema de tokens de la organización

`WebEmpresa/src/styles/_tokens.scss` declara **20 roles de color** más medidas,
radios y ritmo, con tema oscuro conmutado por `:root[data-theme='dark']`
(Galapavet usa `:root[data-variante]`, mismo mecanismo, distinto atributo).

Tipografía declarada ahí:

```scss
--font-display: 'Outfit', system-ui, -apple-system, sans-serif;  /* titulares */
--font-sans:    'DM Sans', system-ui, -apple-system, sans-serif; /* texto */
```

**Son exactamente las dos familias del prototipo de diseño y las que exige la
Decisión 24 de `project-spec.md`.** El estándar de la casa y el diseño coinciden.

Medidas y escalas:

```scss
--maxw: 1180px;
--gutter: clamp(18px, 5vw, 26px);
--section-y: clamp(56px, 9vw, 84px);
--radius: 20px; --radius-md: 16px; --radius-sm: 12px; --radius-pill: 999px;
--shadow: 0 18px 45px rgba(0,0,0,.12);
```

Roles: `--color-primary`, `--color-on-primary`, `--color-secondary`,
`--color-accent`, `--color-bg`, `--color-bg-2`, `--color-band`,
`--color-band-border`, `--color-surface`, `--color-surface-2`,
`--color-card-bg`, `--color-border`, `--color-text`, `--color-text-soft`,
`--color-text-faint`, `--color-tag-ink`, `--color-tag-bg`, `--color-danger`,
`--color-success`, `--shadow`.

Galapavet tiene **3**. Ese es el hueco, y ya no hay que inventárselo: hay un
conjunto probado del que partir, adaptando los valores al morado `#77286B` y el
lima `#B4C718` de la marca real y verificando cada par con
`src/lib/contraste.ts`.

## Cómo autoaloja las fuentes la organización

`NailsLashStudioWeb` **no descarga `.woff2` a mano ni los mete en `public/`**.
Usa `@fontsource` (paquetes npm que traen los `.woff2` y sus `@font-face` ya
escritos), versión 5.2.8, y lo blinda con una **puerta anti-terceros** que es
código de test real, no una nota:

- `src/lib/puerta-terceros.test.ts` conoce la forma exacta que emite
  `@fontsource`: `font-display: swap` y
  `src: url(…woff2) format('woff2'), url(…woff) format('woff')`.
- `galeria-estilos.test.ts:309` y `resenas-estilos.test.ts:307` afirman que en
  la hoja **no aparece `url(https://` ni `@import url(`**, y que el conjunto de
  `@font-face` es **exacto** (6): tocarlo mata el build.
- `hero-estilos.test.ts:617-620` documenta que jsdom **no carga `@font-face`**,
  y que por eso el hecho de que el navegador aplique la fuente **se re-verifica
  en vivo con Chrome, no en jsdom**.

Esto último es literalmente el problema de Galapavet, ya resuelto en la casa un
mes antes. Corresponde con el patrón de memoria organizacional
`testing/verificacion-en-vivo-en-navegador-real-caza-el-verde-que-no-funciona.md`,
que ya está en `.memoria-cache/` de este propio repositorio.

## Qué se adapta y qué NO se copia

**Se adapta:**

1. El fichero `src/styles/main.scss` con `@use 'tokens'; @use 'reset'; @use 'base';`
   y **la línea que falta en `src/main.tsx`** que lo importa.
2. La separación `_reset.scss` / `_base.scss` / `_tokens.scss`.
3. El conjunto de roles, con nombres en español coherentes con los 3 que ya
   existen (`--color-fondo`, `--color-texto`, `--color-foco`).
4. Las medidas: `--maxw`, `--gutter`, `--section-y` y los 4 radios.
5. `@fontsource/outfit` + `@fontsource/dm-sans` para autoalojar, con la puerta
   anti-terceros portada como test.
6. `.skip-link` y el `:focus-visible` global.

**No se copia:**

- Los **valores** de color: los de WebEmpresa son verde bosque y limón (marca de
  Cénit Digital), y los de NailsLash rosa/bosque. Galapavet tiene su morado y su
  lima, ya verificados en `src/lib/tokens.ts`.
- Los **alias deprecados** que WebEmpresa arrastra (`--color-soft`,
  `--color-brand`, `--color-brand-mint`), marcados en su propio fichero como «no
  usar en código nuevo». Es exactamente el patrón
  `arquitectura/herencia-del-repo-base-es-deuda-muerta-hasta-que-un-uso-la-justifica.md`.
- `scroll-behavior: smooth` del `_reset.scss` de WebEmpresa **sin** su guarda de
  `prefers-reduced-motion`: en Galapavet eso incumpliría el contrato de
  movimiento respetuoso que ya está cerrado.
- `--font-display`/`--font-sans` con ese nombre: en Galapavet los tokens van en
  español.

## Verificación pendiente

- **NO VERIFICADO**: que existan los paquetes `@fontsource/outfit` y
  `@fontsource/dm-sans` con los pesos que hacen falta y con subconjunto latino
  con acentos y eñe. Lo confirma la investigación técnica antes de fijarlo.
- **NO VERIFICADO**: si `additionalData` seguirá siendo necesario una vez exista
  `main.scss`, o si duplica los tokens. Hoy inyecta `@use "tokens" as *;` en
  **cada** `.module.scss`; con Sass moderno un `@use` repetido no duplica la
  salida CSS, pero conviene medir el tamaño del bundle antes y después.
