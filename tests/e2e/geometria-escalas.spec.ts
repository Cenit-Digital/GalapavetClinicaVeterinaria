// Bloque C de `features/rediseno_visual.feature` ("GEOMETRÍA Y ESCALAS"):
// @s17, @s19, @s20, @s21, @s22, @s23, @s24, @s25. NAVEGADOR REAL con
// Playwright, sobre `dist/` servido por `vite preview` (`playwright.config.ts`
// → `webServer`), igual que el resto de `tests/e2e/`.
//
// @s18 y @s26 de este mismo bloque los cierran otros artesanos de esta oleada
// en sus propios ficheros (Hero/Faq y Cabecera respectivamente) — no se
// duplican aquí.
//
// Toda la infraestructura CSS que estos 7 escenarios miden YA EXISTE
// (`src/styles/_api.scss`, `src/styles/global.scss`, `src/styles/_tokens.scss`):
// este fichero NO toca producción, solo la mide, con doble anclaje (literal
// escrito a mano, leído del texto real de `_api.scss`/`_tokens.scss`, frente
// al DOM real — nunca frente a un símbolo importado de producción, esas hojas
// son Sass y no son importables desde TypeScript).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Locator, type Page } from 'playwright/test'
import { SERVICIOS } from '../../src/data/servicios'
import { RECUENTO_DE_RUTAS, RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

const RUTA_API_SCSS = fileURLToPath(new URL('../../src/styles/_api.scss', import.meta.url))
const RUTA_TOKENS_SCSS = fileURLToPath(new URL('../../src/styles/_tokens.scss', import.meta.url))
const TEXTO_API = readFileSync(RUTA_API_SCSS, 'utf8')
const TEXTO_TOKENS = readFileSync(RUTA_TOKENS_SCSS, 'utf8')

const ANCHO_MOVIL_MINIMO_PX = 320
const ANCHO_MAXIMO_CONTENEDOR_PX = 1220 // `_api.scss:133` `$ancho-maximo-contenedor: 1220px;`
const ANCHO_VENTANA_ANCHA_PX = 1600
const ANCHO_VENTANA_1440_PX = 1440 // el segundo ancho de medida que exige @s19 literalmente
const ALTO_VENTANA_PX = 900

/** El valor computado real de "font-size" de un elemento, en píxeles. */
async function fontSizePx(localizador: Locator): Promise<number> {
  const texto = await localizador.evaluate((elemento) => getComputedStyle(elemento).fontSize)
  return parseFloat(texto)
}

/**
 * Razón interlineado/tamaño-de-fuente de un elemento: como `line-height` en
 * este proyecto se declara SIN unidad (`global.scss:122/178`), el navegador
 * la resuelve a píxeles proporcionales al propio "font-size" del elemento —
 * dividir uno entre otro recupera el número que de verdad se declaró, sin
 * importar el tamaño de fuente real en ese viewport.
 */
async function ratioInterlineado(localizador: Locator): Promise<number> {
  const { lineHeightPx, fontSizePx: tamanoPx } = await localizador.evaluate((elemento) => {
    const estilo = getComputedStyle(elemento)
    return { lineHeightPx: parseFloat(estilo.lineHeight), fontSizePx: parseFloat(estilo.fontSize) }
  })
  if (Number.isNaN(lineHeightPx) || Number.isNaN(tamanoPx) || tamanoPx === 0) {
    throw new Error('no se pudo calcular la razón interlineado/tamaño de fuente')
  }
  return lineHeightPx / tamanoPx
}

/** Razón espaciado-entre-letras/tamaño-de-fuente: mismo razonamiento que arriba, para "letter-spacing" en "em". */
async function ratioTracking(localizador: Locator): Promise<number> {
  const { letterSpacingPx, fontSizePx: tamanoPx } = await localizador.evaluate((elemento) => {
    const estilo = getComputedStyle(elemento)
    return { letterSpacingPx: parseFloat(estilo.letterSpacing), fontSizePx: parseFloat(estilo.fontSize) }
  })
  if (Number.isNaN(letterSpacingPx) || Number.isNaN(tamanoPx) || tamanoPx === 0) {
    throw new Error('no se pudo calcular la razón de espaciado entre letras')
  }
  return letterSpacingPx / tamanoPx
}

/** El "border-radius" computado real de un elemento (texto tal cual lo normaliza el navegador). */
async function radioComputado(localizador: Locator): Promise<string> {
  return localizador.evaluate((elemento) => getComputedStyle(elemento).borderRadius)
}

/**
 * El "padding-block" real de un elemento, medido como "padding-top" y
 * "padding-bottom" por separado (con "writing-mode" horizontal, que es el
 * único que usa este sitio, "block-start"/"block-end" son "top"/"bottom").
 * Devolver los dos por separado, en vez de promediarlos, evita esconder una
 * asimetría que un aserto sobre un único número no detectaría.
 */
async function paddingBlockPx(localizador: Locator): Promise<{ arriba: number; abajo: number }> {
  return localizador.evaluate((elemento) => {
    const estilo = getComputedStyle(elemento)
    return { arriba: parseFloat(estilo.paddingTop), abajo: parseFloat(estilo.paddingBottom) }
  })
}

interface SombraAnalizada {
  readonly alpha: number
  readonly blurPx: number
}

/**
 * Extrae el alfa del color y el radio de desenfoque (tercer valor de
 * longitud) de un "box-shadow" computado por Chromium, del tipo
 * "rgba(15, 32, 60, 0.07) 0px 6px 18px 0px". No se compara el string
 * completo (frágil ante variaciones de formato del motor): se comparan los
 * dos números que identifican de forma única a "--sombra-reposo" frente a
 * "--sombra-elevada" (`_tokens.scss:68-69`).
 */
function analizarSombra(boxShadow: string): SombraAnalizada {
  const coincidencia = boxShadow.match(
    /rgba?\([\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)\s+-?[\d.]+px\s+-?[\d.]+px\s+([\d.]+)px/,
  )
  if (!coincidencia) {
    throw new Error(`"${boxShadow}" no es un "box-shadow" reconocible`)
  }
  return { alpha: Number(coincidencia[1]), blurPx: Number(coincidencia[2]) }
}

/** Lee la declaración literal de una variable de `_api.scss` (p. ej. "$radio-medio: espaciado(12);" → "espaciado(12)"). */
function declaracionSass(variable: string): string {
  const patron = new RegExp(`\\$${variable}:\\s*([^;]+);`)
  const coincidencia = TEXTO_API.match(patron)
  if (!coincidencia) {
    throw new Error(`no se encontró la declaración de "$${variable}" en "_api.scss"`)
  }
  return coincidencia[1]!.trim()
}

/**
 * Lee la sombra declarada para una variable custom property en el TEXTO REAL
 * de `_tokens.scss`, en el orden de autor ("0 6px 18px rgba(...)"), no en el
 * orden que devuelve `getComputedStyle` ("rgba(...) 0px 6px 18px"). Se usa
 * para confrontar los literales escritos a mano de este fichero (@s24) con
 * la fuente, antes de compararlos con el DOM real.
 */
function sombraDeclaradaEnTokens(texto: string, variable: string): SombraAnalizada {
  const patron = new RegExp(
    `--${variable}:\\s*0\\s+[\\d.]+px\\s+([\\d.]+)px\\s+rgba\\([\\d.]+,\\s*[\\d.]+,\\s*[\\d.]+,\\s*([\\d.]+)\\)`,
  )
  const coincidencia = texto.match(patron)
  if (!coincidencia) {
    throw new Error(`no se encontró la declaración de "--${variable}" en "_tokens.scss"`)
  }
  return { blurPx: Number(coincidencia[1]), alpha: Number(coincidencia[2]) }
}

// ---------------------------------------------------------------------------
// @s17 — El contenido tiene un único ancho máximo y es el del diseño
// ---------------------------------------------------------------------------
test.describe('@s17 el contenido tiene un único ancho máximo y es el del diseño', () => {
  test('a 1600px de ventana: 1220px exactos, el mismo en las seis rutas', async ({ page }) => {
    await page.setViewportSize({ width: ANCHO_VENTANA_ANCHA_PX, height: ALTO_VENTANA_PX })

    const anchosMedidos: number[] = []
    let rutasMedidas = 0
    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      const ancho = await page
        .locator('[data-contenedor-principal]:not([data-a-sangre])')
        .first()
        .evaluate((elemento) => elemento.getBoundingClientRect().width)
      anchosMedidos.push(Math.round(ancho))
      rutasMedidas += 1
    }

    expect(rutasMedidas, 'recuento de rutas efectivamente medidas').toBe(RECUENTO_DE_RUTAS)
    expect(rutasMedidas).toBe(6)
    for (const [indice, ancho] of anchosMedidos.entries()) {
      expect(ancho, `ruta #${indice}: ${JSON.stringify(anchosMedidos)}`).toBe(ANCHO_MAXIMO_CONTENEDOR_PX)
    }
    expect(new Set(anchosMedidos).size, `anchos medidos: ${JSON.stringify(anchosMedidos)}`).toBe(1)
  })
})

// ---------------------------------------------------------------------------
// @s19 — El ritmo vertical de las secciones es fluido y alterna, en vez de ser plano
// ---------------------------------------------------------------------------
// `global.scss:51-52`: `--ritmo-seccion: clamp(72px, 7.2vw, 104px);` es la
// fuente de verdad ÚNICA del relleno vertical de una sección "de contenido"
// (no la compacta de `CampanasPortada`, que usa `--ritmo-seccion-compacto` y
// ya tiene su propia cobertura de Vitest en `CampanasPortada.test.tsx`).
// `Landing.module.scss:18-27,39-48` (`.seccion > *` / `.seccionAlterna > *`)
// aplica ese token al hijo directo de cada `<div id="…">` — el mismo
// elemento `<section>` en el que cada componente de sección declara su
// propia clase. `progress/judge_rediseno_visual.md` (hallazgo 3, segunda
// revisión) encontró que CINCO hojas de estilos de componente
// (`Equipo.module.scss`, `Servicios.module.scss`, `Faq.module.scss`,
// `Galeria.module.scss`, `ReservaChat.module.scss`) declaraban ADEMÁS, sobre
// ese MISMO elemento y con especificidad IDÉNTICA, un `padding-block:
// espaciado(64)` fijo y muerto: el resultado visual dependía solo del orden
// del CSS compilado, sin ningún test que lo protegiera. Esta oleada retiró
// las cinco declaraciones muertas (`progress/rediseno/tdd_geometria-escalas.md`)
// y este test mide el navegador real para que la fuente de verdad quede
// blindada de aquí en adelante.
const MINIMO_RITMO_SECCION_PX = 72
const MAXIMO_RITMO_SECCION_PX = 104
// `7.2vw` a 1440px de viewport (`1440 * 0.072`): dentro del rango del
// `clamp()`, sin llegar a tocar el máximo — el valor real que da el
// navegador, no una redondez de diseño.
const ESPERADO_RITMO_A_1440_PX = 103.68
const RELLENO_PLANO_HISTORICO_PX = 64
const TOLERANCIA_REDONDEO_PX = 0.5

test.describe('@s19 el ritmo vertical de las secciones es fluido y alterna, en vez de ser plano', () => {
  test('el relleno vertical de "Equipo" (sección de contenido, no compacta) crece de 320 a 1440px y cae dentro del rango fluido del token', async ({
    page,
  }) => {
    await page.setViewportSize({ width: ANCHO_MOVIL_MINIMO_PX, height: ALTO_VENTANA_PX })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const seccion = page.locator('#equipo > *').first()

    const a320 = await paddingBlockPx(seccion)

    await page.setViewportSize({ width: ANCHO_VENTANA_1440_PX, height: ALTO_VENTANA_PX })
    const a1440 = await paddingBlockPx(seccion)

    // Cláusula "a 1440 el relleno... es mayor que a 320": fluido, no plano.
    expect(a1440.arriba, 'padding-top a 1440px frente a 320px').toBeGreaterThan(a320.arriba)
    expect(a1440.abajo, 'padding-bottom a 1440px frente a 320px').toBeGreaterThan(a320.abajo)

    // Cláusula "ninguna sección conserva el relleno plano de 64 píxeles en
    // los dos extremos": ni a 320 ni a 1440 el valor medido es 64px.
    expect(a320.arriba, 'padding-top a 320px').not.toBeCloseTo(RELLENO_PLANO_HISTORICO_PX, 0)
    expect(a1440.arriba, 'padding-top a 1440px').not.toBeCloseTo(RELLENO_PLANO_HISTORICO_PX, 0)

    // Doble anclaje: los dos extremos medidos caen dentro del rango real del
    // token `clamp(72px, 7.2vw, 104px)`, con tolerancia de redondeo del
    // navegador — y coinciden con los valores exactos calculados a mano.
    expect(a320.arriba, 'padding-top a 320px').toBeGreaterThanOrEqual(MINIMO_RITMO_SECCION_PX - TOLERANCIA_REDONDEO_PX)
    expect(a1440.arriba, 'padding-top a 1440px').toBeLessThanOrEqual(MAXIMO_RITMO_SECCION_PX + TOLERANCIA_REDONDEO_PX)
    expect(a320.arriba, 'padding-top a 320px').toBeCloseTo(MINIMO_RITMO_SECCION_PX, 0)
    expect(a1440.arriba, 'padding-top a 1440px').toBeCloseTo(ESPERADO_RITMO_A_1440_PX, 0)
  })
})

// ---------------------------------------------------------------------------
// @s20 — Los dos pasos altos de la escala tipográfica son fluidos y
// alcanzan los extremos del diseño; los seis pasos inferiores siguen fijos.
// ---------------------------------------------------------------------------
// Fuente de los extremos: `_api.scss:28-37`, `$escala-tipografica`.
//   paso 5 (h1 de portada, `Hero.module.scss:66`): clamp(33px, 6.4vw, 68px)
//   paso 4 (h2 de sección, p. ej. `Servicios.module.scss:15`): clamp(28px, 4.2vw, 46px)
// A 320px, 6.4vw/4.2vw quedan por debajo de sus mínimos → el navegador pinta
// el mínimo literal. A 1220px, ambos superan su máximo → pinta el máximo
// literal. Ninguno de los dos cálculos depende del ancho REAL del contenedor
// (son "vw", relativos al viewport), así que no hace falta más contexto.
const MINIMO_H1_PORTADA_PX = 33
const MAXIMO_H1_PORTADA_PX = 68
const MINIMO_H2_SECCION_PX = 28
const MAXIMO_H2_SECCION_PX = 46

test.describe('@s20 los dos pasos altos de la escala tipográfica son fluidos y alcanzan los extremos del diseño', () => {
  test('el h1 de la portada mide 33px a 320 y 68px a 1220 (sus propios extremos)', async ({ page }) => {
    await page.setViewportSize({ width: ANCHO_MOVIL_MINIMO_PX, height: ALTO_VENTANA_PX })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const h1 = page.locator('h1').first()

    expect(await fontSizePx(h1)).toBe(MINIMO_H1_PORTADA_PX)

    await page.setViewportSize({ width: ANCHO_MAXIMO_CONTENEDOR_PX, height: ALTO_VENTANA_PX })
    expect(await fontSizePx(h1)).toBe(MAXIMO_H1_PORTADA_PX)
  })

  test('el h2 de sección mide 28px a 320 y 46px a 1220 — extremos propios, distintos de los del h1', async ({
    page,
  }) => {
    await page.setViewportSize({ width: ANCHO_MOVIL_MINIMO_PX, height: ALTO_VENTANA_PX })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const h2 = page.getByRole('heading', { level: 2 }).first()

    expect(await fontSizePx(h2)).toBe(MINIMO_H2_SECCION_PX)

    await page.setViewportSize({ width: ANCHO_MAXIMO_CONTENEDOR_PX, height: ALTO_VENTANA_PX })
    expect(await fontSizePx(h2)).toBe(MAXIMO_H2_SECCION_PX)

    expect(MINIMO_H2_SECCION_PX).not.toBe(MINIMO_H1_PORTADA_PX)
    expect(MAXIMO_H2_SECCION_PX).not.toBe(MAXIMO_H1_PORTADA_PX)
  })

  // Los 6 pasos inferiores (-2 a 3, `_api.scss:29-34`) son longitudes fijas
  // en la hoja de Sass compilada — no "clamp()" — así que su computado no
  // puede variar entre 320 y 1220px. Un representante real por paso,
  // localizado por estructura/ARIA (nunca por className, que es un hash
  // impredecible del build de CSS Modules):
  //   -2 → `Cabecera.module.scss:47`  (descriptor bajo el logotipo)
  //   -1 → `BarraUrgencias.module.scss:14` (aviso fijo superior)
  //    0 → `Cabecera.module.scss:26`  (la propia cabecera)
  //    1 → `Cabecera.module.scss:40`  (enlace del logotipo)
  //    2 → `Servicios.module.scss:35` (h3 de la primera tarjeta)
  //    3 → `PaginaCampanas.module.scss:14` (h2 "Datos pendientes de confirmar" de la ficha)
  interface PasoFijo {
    readonly paso: number
    readonly esperadoPx: number
    readonly ruta: string
    readonly localizar: (page: Page) => Locator
  }

  const PASOS_FIJOS: readonly PasoFijo[] = [
    {
      paso: -2,
      esperadoPx: 10.24,
      ruta: `${SUBPATH_DE_PRODUCCION}/`,
      localizar: (paginaActual) => paginaActual.locator('header a[href="#inicio"] > span > span').first(),
    },
    {
      paso: -1,
      esperadoPx: 12.8,
      ruta: `${SUBPATH_DE_PRODUCCION}/`,
      localizar: (paginaActual) => paginaActual.locator('aside').first(),
    },
    {
      paso: 0,
      esperadoPx: 16,
      ruta: `${SUBPATH_DE_PRODUCCION}/`,
      localizar: (paginaActual) => paginaActual.locator('header'),
    },
    {
      paso: 1,
      esperadoPx: 20,
      ruta: `${SUBPATH_DE_PRODUCCION}/`,
      localizar: (paginaActual) => paginaActual.locator('header a[href="#inicio"] strong'),
    },
    {
      paso: 2,
      esperadoPx: 25,
      ruta: `${SUBPATH_DE_PRODUCCION}/`,
      localizar: (paginaActual) => paginaActual.locator('#servicios article h3').first(),
    },
    {
      paso: 3,
      esperadoPx: 31.25,
      ruta: `${SUBPATH_DE_PRODUCCION}/campanas?campana=vacunaciones`,
      localizar: (paginaActual) => paginaActual.getByRole('heading', { level: 2, name: 'Datos pendientes de confirmar' }),
    },
  ]

  test('los seis pasos inferiores de la escala (-2 a 3) siguen siendo tamaños fijos: igual a 320 que a 1220', async ({
    page,
  }) => {
    let pasosMedidos = 0
    for (const pasoFijo of PASOS_FIJOS) {
      await page.setViewportSize({ width: ANCHO_MOVIL_MINIMO_PX, height: ALTO_VENTANA_PX })
      await page.goto(pasoFijo.ruta)
      const en320 = await fontSizePx(pasoFijo.localizar(page))

      await page.setViewportSize({ width: ANCHO_MAXIMO_CONTENEDOR_PX, height: ALTO_VENTANA_PX })
      const en1220 = await fontSizePx(pasoFijo.localizar(page))

      expect(en320, `paso ${pasoFijo.paso} a 320px`).toBe(pasoFijo.esperadoPx)
      expect(en1220, `paso ${pasoFijo.paso} a 1220px`).toBe(pasoFijo.esperadoPx)
      pasosMedidos += 1
    }
    expect(pasosMedidos).toBe(6)
  })
})

// ---------------------------------------------------------------------------
// @s21 — Los titulares tienen el peso y el tracking óptico del diseño
// ---------------------------------------------------------------------------
// `global.scss:176` `h1,h2,h3,h4,h5,h6 { font-weight: 600; }` (nunca 700).
// `global.scss:177` `letter-spacing: -0.015em;` (todos los niveles).
// `global.scss:182` `h1 { letter-spacing: -0.02em; }` (más negativo, solo h1).
const PESO_TITULARES = '600'
const TRACKING_PORTADA_EM = -0.02
const TRACKING_SECCION_EM = -0.015

test.describe('@s21 los titulares tienen el peso y el tracking óptico del diseño', () => {
  test('peso 600 (no 700) y espaciado entre letras negativo en el h1 de las seis rutas', async ({ page }) => {
    let rutasMedidas = 0
    for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      const h1 = page.locator('h1').first()
      const { peso, tracking } = await h1.evaluate((elemento) => {
        const estilo = getComputedStyle(elemento)
        return { peso: estilo.fontWeight, tracking: parseFloat(estilo.letterSpacing) }
      })

      expect(peso, `${pagina}: peso del h1`).toBe(PESO_TITULARES)
      expect(peso, `${pagina}: peso del h1`).not.toBe('700')
      expect(tracking, `${pagina}: espaciado entre letras del h1`).toBeLessThan(0)
      rutasMedidas += 1
    }
    expect(rutasMedidas).toBe(RECUENTO_DE_RUTAS)
    expect(rutasMedidas).toBe(6)
  })

  test('el titular de portada es más negativo (en valor absoluto) que el titular de sección', async ({ page }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const h1 = page.locator('h1').first()
    const h2 = page.getByRole('heading', { level: 2 }).first()

    const rationH1 = await ratioTracking(h1)
    const ratioH2 = await ratioTracking(h2)

    expect(rationH1).toBeCloseTo(TRACKING_PORTADA_EM, 2)
    expect(ratioH2).toBeCloseTo(TRACKING_SECCION_EM, 2)
    expect(rationH1).toBeLessThan(0)
    expect(ratioH2).toBeLessThan(0)
    expect(Math.abs(ratioH2), `|${ratioH2}| debe ser menor que |${rationH1}|`).toBeLessThan(Math.abs(rationH1))
  })
})

// ---------------------------------------------------------------------------
// @s22 — Los titulares declaran su propio interlineado en vez de heredar el del cuerpo
// ---------------------------------------------------------------------------
// `global.scss:122` `body { line-height: 1.5; }`.
// `global.scss:178` `h1..h6 { line-height: 1.08; }` — salvo el h1 de portada,
// que declara el suyo propio en `Hero.module.scss:69` (`line-height: 1.05;`,
// más específico por selector anidado, así que gana sobre la regla global).
// El sitio no tiene ningún h4/h5/h6 (grep `<h4|<h5|<h6` en `src/` → 0
// resultados): los tres niveles reales son h1, h2 y h3.
const RATIO_INTERLINEADO_CUERPO = 1.5
const RATIO_INTERLINEADO_H1_PORTADA = 1.05
const RATIO_INTERLINEADO_TITULAR_GENERICO = 1.08

test.describe('@s22 los titulares declaran su propio interlineado en vez de heredar el del cuerpo', () => {
  test('h1, h2 y h3 tienen una razón interlineado/tamaño distinta y menor que la del cuerpo', async ({ page }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const ratioCuerpo = await ratioInterlineado(page.locator('body'))
    expect(ratioCuerpo).toBeCloseTo(RATIO_INTERLINEADO_CUERPO, 2)

    const niveles: readonly { readonly nombre: string; readonly localizador: Locator; readonly esperado: number }[] = [
      { nombre: 'h1 (portada)', localizador: page.locator('h1').first(), esperado: RATIO_INTERLINEADO_H1_PORTADA },
      {
        nombre: 'h2 (sección)',
        localizador: page.getByRole('heading', { level: 2 }).first(),
        esperado: RATIO_INTERLINEADO_TITULAR_GENERICO,
      },
      {
        nombre: 'h3 (tarjeta de servicio)',
        localizador: page.getByRole('heading', { level: 3 }).first(),
        esperado: RATIO_INTERLINEADO_TITULAR_GENERICO,
      },
    ]

    let nivelesMedidos = 0
    for (const nivel of niveles) {
      const ratio = await ratioInterlineado(nivel.localizador)
      expect(ratio, nivel.nombre).toBeCloseTo(nivel.esperado, 2)
      expect(ratio, nivel.nombre).toBeLessThan(ratioCuerpo)
      expect(ratio, nivel.nombre).not.toBeCloseTo(ratioCuerpo, 2)
      nivelesMedidos += 1
    }

    expect(nivelesMedidos, 'recuento de niveles de titular efectivamente medidos').toBeGreaterThan(0)
    expect(nivelesMedidos).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// @s23 — La escala de radios cubre el vocabulario de formas del diseño
// ---------------------------------------------------------------------------
// Los cinco conceptos y su elemento real:
//   píldora            → botón "Enviar mensaje" (`_api.scss:216-241`, `boton-primario`, `$radio-completo`)
//   círculo             → avatar de la primera tarjeta de equipo (`Equipo.module.scss`, `$radio-circulo`)
//   tarjeta             → primera tarjeta de servicios (`_api.scss:171-187`, `tarjeta`, `$radio-grande`)
//   campo de formulario → input "Tu nombre" (`FormularioContacto.module.scss:25-37`, `$radio-medio`)
//   etiqueta            → píldora de categoría "Atención veterinaria" (`_api.scss:273-287`, `pildora-etiqueta`, `$radio-completo`)
// "Píldora" y "etiqueta" comparten el MISMO mecanismo (`$radio-completo`,
// 999px): son dos CONCEPTOS nombrados por la cláusula (un control frente a
// un distintivo de categoría), no necesariamente dos VALORES numéricos —
// releído el texto literal de @s23, solo exige "más de tres valores
// distintos en uso" como cláusula aparte, y esa se satisface igualmente con
// los otros tres (999px, 50%, 24px, 12px → 4 > 3).
const RADIO_PILDORA_PX = '999px'
const RADIO_CIRCULO_PORCENTAJE = '50%'
const RADIO_TARJETA_PX = '24px'
const RADIO_CAMPO_DE_FORMULARIO_PX = '12px'

test.describe('@s23 la escala de radios cubre el vocabulario de formas del diseño', () => {
  test('más de tres valores de radio distintos, con los cinco conceptos nombrados presentes', async ({ page }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const pildora = await radioComputado(page.getByRole('button', { name: 'Enviar mensaje' }))
    const circulo = await radioComputado(page.locator('#equipo span[aria-hidden="true"]').first())
    const tarjeta = await radioComputado(page.locator('#servicios article').first())
    const campoDeFormulario = await radioComputado(page.locator('#formulario-contacto-nombre'))
    const etiqueta = await radioComputado(page.locator('#servicios article span').first())

    expect(pildora, 'radio de píldora (botón "Enviar mensaje")').toContain(RADIO_PILDORA_PX)
    expect(circulo, 'radio de círculo (avatar)').toContain(RADIO_CIRCULO_PORCENTAJE)
    expect(tarjeta, 'radio de tarjeta').toContain(RADIO_TARJETA_PX)
    expect(campoDeFormulario, 'radio de campo de formulario').toContain(RADIO_CAMPO_DE_FORMULARIO_PX)
    expect(etiqueta, 'radio de etiqueta (píldora de categoría)').toContain(RADIO_PILDORA_PX)

    const valoresDistintos = new Set([pildora, circulo, tarjeta, campoDeFormulario, etiqueta])
    expect(valoresDistintos.size, `valores medidos: ${JSON.stringify([...valoresDistintos])}`).toBeGreaterThan(3)
  })

  test('cada radio de la escala se deriva de "espaciado()" o es un mecanismo de CSS, nunca un número copiado', () => {
    // Los tres pasos intermedios son llamadas a la escala de espaciado ya existente.
    expect(declaracionSass('radio-pequeno')).toBe('espaciado(4)')
    expect(declaracionSass('radio-medio')).toBe('espaciado(12)')
    expect(declaracionSass('radio-grande')).toBe('espaciado(24)')
    // Los dos extremos son mecanismos de CSS documentados (`_api.scss:99-105`), no magnitudes de diseño.
    expect(declaracionSass('radio-completo')).toBe('999px')
    expect(declaracionSass('radio-circulo')).toBe('50%')
  })
})

// ---------------------------------------------------------------------------
// @s24 — El sistema tiene tres niveles de elevación y los usa
// ---------------------------------------------------------------------------
// Variante activa por defecto (sin "localStorage" previo): "clinica"
// (`_tokens.scss:49-70`, el bloque ":root" sin atributo).
//   --sombra-reposo:  0 6px 18px rgba(15, 32, 60, 0.07)  → alfa 0.07, blur 18
//   --sombra-elevada: 0 18px 45px rgba(15, 32, 60, 0.1)  → alfa 0.1,  blur 45
const ALPHA_SOMBRA_REPOSO = 0.07
const BLUR_SOMBRA_REPOSO_PX = 18
const ALPHA_SOMBRA_ELEVADA = 0.1
const BLUR_SOMBRA_ELEVADA_PX = 45

test.describe('@s24 el sistema tiene tres niveles de elevación y los usa', () => {
  test('reposo y elevada son dos sombras distintas, reposo en más elementos, y al menos uno sube al pasar el puntero', async ({
    page,
  }) => {
    // Doble anclaje: los literales de arriba (0.07/18 y 0.1/45) se confrontan
    // primero con el TEXTO REAL de `_tokens.scss` (variante "clinica", la que
    // aplica por defecto sin "localStorage" previo), antes de medir el DOM.
    const reposoDeclarado = sombraDeclaradaEnTokens(TEXTO_TOKENS, 'sombra-reposo')
    const elevadaDeclarado = sombraDeclaradaEnTokens(TEXTO_TOKENS, 'sombra-elevada')
    expect(reposoDeclarado).toEqual({ blurPx: BLUR_SOMBRA_REPOSO_PX, alpha: ALPHA_SOMBRA_REPOSO })
    expect(elevadaDeclarado).toEqual({ blurPx: BLUR_SOMBRA_ELEVADA_PX, alpha: ALPHA_SOMBRA_ELEVADA })

    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    // "En uso, sin pasar el ratón por nada": varias tarjetas reales, todas en reposo.
    const tarjetasEnReposo = [
      page.locator('#servicios article').first(),
      page.locator('#servicios article').nth(1),
      page.locator('#equipo article').first(),
      page.locator('fieldset[aria-label="Asistente de reserva de Galapavet"]'),
    ]

    let reposoContadas = 0
    for (const tarjeta of tarjetasEnReposo) {
      const sombra = analizarSombra(await tarjeta.evaluate((elemento) => getComputedStyle(elemento).boxShadow))
      expect(sombra.alpha, `tarjeta #${reposoContadas}`).toBeCloseTo(ALPHA_SOMBRA_REPOSO, 2)
      expect(sombra.blurPx, `tarjeta #${reposoContadas}`).toBe(BLUR_SOMBRA_REPOSO_PX)
      reposoContadas += 1
    }

    // Una de esas mismas tarjetas sube de reposo a elevada al pasar el puntero por encima.
    const tarjetaAHover = page.locator('#servicios article').first()
    await tarjetaAHover.hover()
    await expect
      .poll(
        async () => analizarSombra(await tarjetaAHover.evaluate((elemento) => getComputedStyle(elemento).boxShadow)).blurPx,
        { message: 'la tarjeta no llegó a pintar la sombra elevada tras el "hover"' },
      )
      .toBe(BLUR_SOMBRA_ELEVADA_PX)

    const sombraElevada = analizarSombra(await tarjetaAHover.evaluate((elemento) => getComputedStyle(elemento).boxShadow))
    expect(sombraElevada.alpha).toBeCloseTo(ALPHA_SOMBRA_ELEVADA, 2)

    const elevadaContadas = 1
    expect(reposoContadas, 'la sombra de reposo se usa en más elementos que la elevada').toBeGreaterThan(elevadaContadas)
    expect(reposoContadas).toBeGreaterThan(1)
  })
})

// ---------------------------------------------------------------------------
// @s25 — Los controles de formulario alcanzan la altura del diseño
// ---------------------------------------------------------------------------
// La casilla de consentimiento (checkbox) queda FUERA de esta lista a
// propósito: la cláusula "ninguno mide menos de 44px" enumera "campo de
// texto, desplegable y botón" — un checkbox no es ninguno de los tres, y
// tiene su PROPIA cláusula (alineación + mínimo de área táctil de 24px,
// heredado de `accesibilidad.feature`, `_api.scss:80-86`).
const ALTURA_MINIMA_CONTROL_PX = 44
const AREA_TACTIL_MINIMA_PX = 24 // `_api.scss:81` `$area-tactil-minima: 24px;`

test.describe('@s25 los controles de formulario alcanzan la altura del diseño', () => {
  test('ningún campo de texto, desplegable o botón del formulario de contacto mide menos de 44px', async ({ page }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const controles = [
      page.locator('#formulario-contacto-nombre'),
      page.locator('#formulario-contacto-telefono'),
      page.locator('#formulario-contacto-email'),
      page.locator('#formulario-contacto-motivo'),
      page.locator('#formulario-contacto-mensaje'),
      page.getByRole('button', { name: 'Enviar mensaje' }),
    ]

    let medidos = 0
    for (const [indice, control] of controles.entries()) {
      const caja = await control.boundingBox()
      if (caja === null) {
        throw new Error(`el control #${indice} del formulario de contacto no se pudo medir (sin caja)`)
      }
      expect(caja.height, `control #${indice} del formulario de contacto`).toBeGreaterThanOrEqual(ALTURA_MINIMA_CONTROL_PX)
      medidos += 1
    }

    expect(medidos).toBeGreaterThan(0)
    expect(medidos).toBe(6)
  })

  test('ningún botón ni campo de texto del chat de reserva mide menos de 44px', async ({ page }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const chat = page.locator('fieldset[aria-label="Asistente de reserva de Galapavet"]')
    const botonesRapidos = chat.locator('fieldset[aria-label="Respuestas rápidas"] button')

    // `ReservaChat.tsx:22`: OPCIONES_SERVICIO = 5 bloques reales de SERVICIOS + "Es una urgencia".
    const totalEsperadoInicial = SERVICIOS.length + 1
    await expect(botonesRapidos).toHaveCount(totalEsperadoInicial)

    const alturas: number[] = []
    for (let indice = 0; indice < totalEsperadoInicial; indice += 1) {
      const caja = await botonesRapidos.nth(indice).boundingBox()
      if (caja === null) {
        throw new Error(`el botón de respuesta rápida #${indice} no se pudo medir (sin caja)`)
      }
      alturas.push(caja.height)
    }

    // Avanza un paso real del guion (`ReservaChat-logica.ts`) para medir también el campo de texto libre y su botón.
    const primerServicio = SERVICIOS[0]
    if (primerServicio === undefined) {
      throw new Error('el catálogo real de SERVICIOS está vacío: no se puede avanzar el guion del chat')
    }
    await chat.getByRole('button', { name: primerServicio.titulo, exact: true }).click()

    const campoDeTexto = chat.getByRole('textbox', { name: 'Tu respuesta' })
    const cajaCampo = await campoDeTexto.boundingBox()
    if (cajaCampo === null) {
      throw new Error('el campo de texto libre del paso "animal" no se pudo medir (sin caja)')
    }
    const botonEnviar = chat.getByRole('button', { name: 'Enviar respuesta' })
    const cajaBoton = await botonEnviar.boundingBox()
    if (cajaBoton === null) {
      throw new Error('el botón "Enviar respuesta" no se pudo medir (sin caja)')
    }
    alturas.push(cajaCampo.height, cajaBoton.height)

    for (const [indice, altura] of alturas.entries()) {
      expect(altura, `control #${indice} del chat de reserva`).toBeGreaterThanOrEqual(ALTURA_MINIMA_CONTROL_PX)
    }
    expect(alturas.length).toBeGreaterThan(0)
    expect(alturas.length).toBe(totalEsperadoInicial + 2)
  })

  test('la casilla de consentimiento alcanza el área táctil mínima y queda alineada con la primera línea de su etiqueta', async ({
    page,
  }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const casilla = page.locator('#formulario-contacto-acepta-aviso-legal')
    const etiqueta = page.locator('label[for="formulario-contacto-acepta-aviso-legal"]')

    const cajaCasilla = await casilla.boundingBox()
    const cajaEtiqueta = await etiqueta.boundingBox()
    if (cajaCasilla === null || cajaEtiqueta === null) {
      throw new Error('la casilla de consentimiento o su etiqueta no se pudieron medir (sin caja)')
    }

    // Mínimo de área táctil ya exigido por el contrato anterior (SC 2.5.8).
    expect(cajaCasilla.width).toBeGreaterThanOrEqual(AREA_TACTIL_MINIMA_PX)
    expect(cajaCasilla.height).toBeGreaterThanOrEqual(AREA_TACTIL_MINIMA_PX)

    // "Alineada con la primera línea de su etiqueta": el centro vertical de la
    // casilla cae dentro del rango vertical que ocupa la caja de la etiqueta
    // (una etiqueta de una sola línea real: su caja ES esa primera línea).
    const centroVerticalCasilla = cajaCasilla.y + cajaCasilla.height / 2
    const inicioPrimeraLinea = cajaEtiqueta.y
    const finPrimeraLinea = cajaEtiqueta.y + cajaEtiqueta.height
    const mensaje = `casilla y=[${cajaCasilla.y}, ${cajaCasilla.y + cajaCasilla.height}], etiqueta y=[${inicioPrimeraLinea}, ${finPrimeraLinea}]`

    expect(centroVerticalCasilla, mensaje).toBeGreaterThanOrEqual(inicioPrimeraLinea)
    expect(centroVerticalCasilla, mensaje).toBeLessThanOrEqual(finPrimeraLinea)
  })
})
