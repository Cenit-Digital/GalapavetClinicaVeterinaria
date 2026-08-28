// Bloque F de `features/rediseno_visual.feature` ("La puerta que faltaba:
// fidelidad medida contra el diseño"): @s42, @s43 y @s44, en NAVEGADOR REAL
// con Playwright sobre el artefacto de producción.
//
// Por qué un fichero nuevo y no una ampliación de los de `identidad_visual`:
// `tokens-aplicados.spec.ts` (@s25) y `layout.spec.ts` (@s44/@s45) implementan
// el contrato ANTERIOR y siguen siendo válidos tal cual; el rediseño no los
// deroga, les añade una puerta más estricta encima
// (`progress/rediseno/matriz_trazabilidad.md`, tramo @s41-@s48).
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from 'playwright/test'
import { extraerRutasDeImagenDeclaradas } from '../../src/lib/diseno/inventarioActivosPublicos'
import {
  INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR,
  leerDeclaracionDeVariante,
  leerTokenDeVariante,
  type NombreDeToken,
} from '../../src/lib/diseno/tokensColor'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'
import { colorComputadoAHex } from './utilidades'

const RUTA_TOKENS = fileURLToPath(new URL('../../src/styles/_tokens.scss', import.meta.url))
const textoDeTokens = (): string => readFileSync(RUTA_TOKENS, 'utf8')

/**
 * Las cinco variantes con el nombre accesible EXACTO de su botón en el
 * selector de paleta (`src/data/variantesPaleta.ts`). Literal escrito a mano
 * a propósito, igual que `tests/e2e/rutas.ts`: es la versión "de fuera" del
 * catálogo, y si el catálogo cambiara sin avisar, el `click` no encontraría
 * el botón y esta puerta caería en rojo en vez de medir otra cosa.
 */
const VARIANTES_DEL_SELECTOR: readonly { id: string; nombreAccesible: string }[] = [
  { id: 'clinica', nombreAccesible: 'Clínica' },
  { id: 'calida', nombreAccesible: 'Cálida' },
  { id: 'tech', nombreAccesible: 'Tech' },
  { id: 'eco', nombreAccesible: 'Eco' },
  { id: 'marca', nombreAccesible: 'Marca Galapavet' },
]

const RECUENTO_DE_VARIANTES = 5
const RECUENTO_DE_TOKENS_POR_VARIANTE = 20
const RECUENTO_DE_RUTAS = 6

/**
 * Aplica una variante POR LA INTERFAZ REAL (el selector de paleta ya
 * desplegado) y espera a que el documento haya terminado de adoptarla.
 *
 * Dos esperas, las dos deterministas y ninguna a ciegas: primero el atributo
 * que `SelectorPaleta` escribe al montar el efecto
 * (`src/components/SelectorPaleta.tsx:22`), después que no quede ninguna
 * animación en curso — el `body` transiciona "background-color" y "color"
 * (`src/styles/global.scss:290`), así que leer justo tras el `click` puede
 * capturar un valor a mitad de la interpolación. Es la misma espera que
 * `tests/e2e/accesibilidad.spec.ts:305` ya usa y justifica.
 */
async function aplicarVariante(page: Page, variante: { id: string; nombreAccesible: string }): Promise<void> {
  await page.getByRole('button', { name: variante.nombreAccesible, exact: true }).click()
  await page.waitForFunction(
    (esperado) => document.documentElement.getAttribute('data-variante') === esperado,
    variante.id,
  )
  await page.waitForFunction(() => document.getAnimations().every((animacion) => animacion.playState !== 'running'))
}

interface TokenMedido {
  readonly nombre: string
  readonly resuelto: string
  readonly esperado: string
}

interface MedicionDeVariante {
  readonly tokens: readonly TokenMedido[]
  readonly fondoDelCuerpo: string
  readonly textoDelCuerpo: string
}

interface PeticionDeToken {
  readonly nombre: string
  readonly esSombra: boolean
  readonly declarado: string
}

/**
 * Lee los VEINTE tokens tal y como el navegador los RESUELVE, no como los
 * escribe el fichero: cada token se hace pasar por una propiedad CSS real
 * ("color" para los 18 de color, "box-shadow" para las 2 sombras) sobre una
 * sonda, y se compara con lo que produce esa MISMA propiedad alimentada con
 * el texto declarado en `_tokens.scss`. Así la comparación es inmune a la
 * minificación de Lightning CSS, que reescribe "#FFFFFF" como "#fff" y
 * "rgba(15, 32, 60, 0.07)" como "#0f203c12" (medido sobre "dist/assets/*.css")
 * — un `getPropertyValue('--color-…')` a pelo compararía textos distintos que
 * significan lo mismo.
 *
 * Dos guardas contra el verde por vacuidad, las dos necesarias:
 *   - el padre de la sonda pinta "rgb(1, 2, 3)", un color que NINGÚN token del
 *     sistema declara: un `var(--token)` inválido es "invalid at
 *     computed-value time" y hace que "color" herede del padre, así que un
 *     token roto se delataría como #010203 en vez de colarse como el color
 *     del cuerpo;
 *   - la sonda declara "transition: none". Sin eso, el bloque
 *     `prefers-reduced-motion: reduce` de `global.scss:301` deja
 *     "transition-duration: 0.01ms" sobre "*" con "transition-property: all",
 *     y leer el estilo justo tras asignarlo devuelve el valor INICIAL de la
 *     interpolación — medido en vivo: "box-shadow" salía
 *     "rgba(0, 0, 0, 0) 0px 0px 0px 0px" en las cinco variantes.
 */
async function medirTokensResueltos(page: Page, peticiones: readonly PeticionDeToken[]): Promise<MedicionDeVariante> {
  return page.evaluate((lista) => {
    const padre = document.createElement('div')
    padre.style.color = 'rgb(1, 2, 3)'
    padre.style.transition = 'none'
    const sonda = document.createElement('div')
    sonda.style.transition = 'none'
    padre.append(sonda)
    document.body.append(padre)

    const tokens = lista.map((peticion) => {
      const propiedad = peticion.esSombra ? 'box-shadow' : 'color'
      const leer = (): string =>
        peticion.esSombra ? getComputedStyle(sonda).boxShadow : getComputedStyle(sonda).color

      sonda.style.setProperty(propiedad, `var(${peticion.nombre})`)
      const resuelto = leer()
      sonda.style.setProperty(propiedad, peticion.declarado)
      const esperado = leer()
      sonda.style.removeProperty(propiedad)

      return { nombre: peticion.nombre, resuelto, esperado }
    })

    const estiloDelCuerpo = getComputedStyle(document.body)
    const medicion = {
      tokens,
      fondoDelCuerpo: estiloDelCuerpo.backgroundColor,
      textoDelCuerpo: estiloDelCuerpo.color,
    }
    padre.remove()
    return medicion
  }, peticiones)
}

test.describe('@s42 los tokens que el navegador resuelve coinciden con los que el fichero declara, en las cinco variantes', () => {
  test('las 5 variantes × 20 tokens: cada valor resuelto equivale al declarado, y el cuerpo pinta los de la variante activa', async ({
    page,
  }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    // La animación infinita de la barra de urgencias
    // (`BarraUrgencias.module.scss:32`) nunca deja quieto a
    // `document.getAnimations()`: con "reduce", `global.scss:301` la limita a
    // una iteración de 0.01ms y la espera de `aplicarVariante` sí converge.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.getByRole('button', { name: 'Cambiar paleta de color' }).click()

    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR).toHaveLength(RECUENTO_DE_TOKENS_POR_VARIANTE)

    let variantesVerificadas = 0
    let tokensVerificados = 0

    for (const variante of VARIANTES_DEL_SELECTOR) {
      await aplicarVariante(page, variante)

      const peticiones = INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.map((nombre: NombreDeToken) => ({
        nombre,
        esSombra: nombre.startsWith('--sombra-'),
        declarado: leerDeclaracionDeVariante(textoDeTokens(), variante.id, nombre),
      }))
      const medicion = await medirTokensResueltos(page, peticiones)

      expect(medicion.tokens).toHaveLength(RECUENTO_DE_TOKENS_POR_VARIANTE)
      for (const token of medicion.tokens) {
        const contexto = `variante "${variante.id}", token "${token.nombre}"`
        // Ni el valor resuelto ni el declarado pueden ser el valor inicial de
        // su propiedad: eso significaría que el token no existe y que la
        // comparación sería un empate entre dos nadas.
        expect(token.esperado, `${contexto}: el fichero declara un valor que el navegador no entiende`).not.toBe('none')
        expect(token.resuelto, `${contexto}: el navegador no resuelve el token`).not.toBe('none')
        expect(token.resuelto, `${contexto}: el token no está declarado y se hereda del padre`).not.toBe('rgb(1, 2, 3)')
        expect(token.resuelto, `${contexto}: resuelto ≠ declarado`).toBe(token.esperado)
        tokensVerificados += 1
      }

      expect(colorComputadoAHex(medicion.fondoDelCuerpo), `variante "${variante.id}": fondo del cuerpo`).toBe(
        leerTokenDeVariante(textoDeTokens(), variante.id, 'fondo'),
      )
      expect(colorComputadoAHex(medicion.textoDelCuerpo), `variante "${variante.id}": texto del cuerpo`).toBe(
        leerTokenDeVariante(textoDeTokens(), variante.id, 'texto'),
      )
      variantesVerificadas += 1
    }

    expect(variantesVerificadas).toBe(RECUENTO_DE_VARIANTES)
    expect(tokensVerificados).toBe(RECUENTO_DE_VARIANTES * RECUENTO_DE_TOKENS_POR_VARIANTE)
  })
})

// ---------------------------------------------------------------------------
// @s43 — imágenes del rediseño: ni rotas, ni remotas, ni fuera del inventario
// ---------------------------------------------------------------------------

const RAIZ_DEL_REPO = fileURLToPath(new URL('../..', import.meta.url))

/** Los ficheros de producción donde una ruta "/img/…" puede estar declarada como literal. */
function ficherosFuenteQueDeclaranImagenes(): readonly string[] {
  const directorios = ['src/data', 'src/components', 'src/pages']
  return directorios.flatMap((directorio) =>
    readdirSync(`${RAIZ_DEL_REPO}${directorio}`)
      .filter((nombre) => /\.tsx?$/.test(nombre) && !nombre.includes('.test.'))
      .map((nombre) => `${RAIZ_DEL_REPO}${directorio}/${nombre}`),
  )
}

/**
 * El inventario DECLARADO de rutas de imagen: se recalcula del texto real de
 * los ficheros fuente con la misma función pura que ya usa la puerta de
 * activos (`src/lib/diseno/inventarioActivosPublicos.ts`, 100 % mordida por
 * mutación), nunca de una lista retecleada que pueda quedarse atrás — que es
 * justo lo que le pasó al literal de 24 rutas de `despliegue-subpath.spec.ts`,
 * anterior a las fotografías del rediseño.
 */
function inventarioDeclaradoDeImagenes(): readonly string[] {
  const textos = ficherosFuenteQueDeclaranImagenes().map((ruta) => readFileSync(ruta, 'utf8'))
  return extraerRutasDeImagenDeclaradas(textos)
}

/**
 * La(s) imagen(es) que hacen de FONDO de la sección de bienvenida. Se
 * resuelven del documento vivo, sin suponer la técnica: se mira el
 * "background-image" del propio elemento y de sus dos pseudoelementos, y
 * también las `<img>` colocadas detrás del contenido (posicionadas y con
 * "z-index" negativo), que es como está montada hoy (`Hero.module.scss:23-31`:
 * `position: absolute; z-index: -2; object-fit: cover`). Si el rediseño
 * cambiara a un `background-image` de CSS, esta puerta seguiría midiendo lo
 * mismo sin tocarla.
 */
async function urlsDeFondoDeLaBienvenida(page: Page): Promise<readonly string[]> {
  return page.evaluate(() => {
    const bienvenida = Array.from(document.querySelectorAll('section')).find(
      (seccion) => seccion.querySelector('h1') !== null,
    )
    if (bienvenida === undefined) {
      throw new Error('no se encontró la sección de bienvenida: ninguna "section" contiene el "h1" de la página')
    }

    const urls: string[] = []
    for (const pseudoelemento of [null, '::before', '::after']) {
      const declaracion = getComputedStyle(bienvenida, pseudoelemento).backgroundImage
      for (const coincidencia of declaracion.matchAll(/url\("?([^")]+)"?\)/g)) {
        urls.push(coincidencia[1] as string)
      }
    }
    for (const imagen of Array.from(bienvenida.querySelectorAll('img'))) {
      const estilo = getComputedStyle(imagen)
      const estaPosicionada = estilo.position === 'absolute' || estilo.position === 'fixed'
      const estaDetrasDelContenido = Number(estilo.zIndex) < 0
      if (estaPosicionada && estaDetrasDelContenido) {
        urls.push(imagen.src)
      }
    }
    return urls
  })
}

test.describe('@s43 ninguna imagen nueva del rediseño está rota ni viene de un origen remoto', () => {
  test('la imagen de fondo de la sección de bienvenida responde 200 y es una imagen del inventario declarado', async ({
    page,
    request,
  }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const urls = await urlsDeFondoDeLaBienvenida(page)
    // Exactamente una: cero significaría que la bienvenida perdió su
    // fotografía a sangre y nadie se enteró (el hueco del contrato que este
    // escenario viene a tapar).
    expect(urls, `imágenes de fondo encontradas: ${JSON.stringify(urls)}`).toHaveLength(1)

    const rutaDeLaImagen = new URL(urls[0] as string).pathname
    const respuesta = await request.get(rutaDeLaImagen)
    expect(respuesta.status(), `"${rutaDeLaImagen}" respondió ${respuesta.status()}`).toBe(200)
    expect(respuesta.headers()['content-type']).toMatch(/^image\//)

    const rutaSinSubpath = rutaDeLaImagen.slice(SUBPATH_DE_PRODUCCION.length)
    expect(inventarioDeclaradoDeImagenes()).toContain(rutaSinSubpath)
  })

  test('el recuento de rutas de imagen efectivamente comprobadas coincide con el inventario declarado', async ({
    request,
  }) => {
    const inventario = inventarioDeclaradoDeImagenes()
    expect(inventario.length, 'el inventario declarado está vacío: la puerta no comprobaría nada').toBeGreaterThan(0)

    const rotas: { ruta: string; status: number }[] = []
    let rutasComprobadas = 0
    for (const ruta of inventario) {
      const respuesta = await request.get(`${SUBPATH_DE_PRODUCCION}${ruta}`)
      if (respuesta.status() !== 200) {
        rotas.push({ ruta, status: respuesta.status() })
      }
      rutasComprobadas += 1
    }

    expect(rotas, `rutas de imagen que no responden 200: ${JSON.stringify(rotas)}`).toEqual([])
    expect(rutasComprobadas).toBe(inventario.length)
  })
})

// ---------------------------------------------------------------------------
// @s44 — nada sobresale por la derecha en la ventana más estrecha
// ---------------------------------------------------------------------------

const ANCHO_MOVIL_MINIMO_PX = 320
const ALTO_MOVIL_PX = 640
/** Chromium devuelve rectángulos con decimales: sin esto, un borde que cae justo en el límite contaría como desborde. */
const TOLERANCIA_SUBPIXEL_PX = 1

interface InformeDeDesborde {
  readonly elementosInspeccionados: number
  readonly culpables: readonly { etiqueta: string; derecha: number }[]
}

/**
 * Todo elemento visible cuyo borde derecho pasa del ancho visible, EXCEPTO los
 * que cuelgan de un contenedor con desplazamiento horizontal propio.
 *
 * Esa excepción no es una rendija: es la diferencia entre "contenido que se
 * sale y se pierde" y "contenido que el visitante alcanza deslizando". La
 * galería de la portada es un carrusel real (`Galeria.module.scss`, la pista
 * con `overflow-x: auto`) y a 320px sus seis fichas viven entre x=570 y
 * x=1594 POR DISEÑO — medido en vivo. Sin la excepción, esta puerta marcaría
 * como error el único patrón de la página pensado para desbordar.
 */
async function medirDesbordesPorLaDerecha(page: Page): Promise<InformeDeDesborde> {
  return page.evaluate((tolerancia) => {
    const raiz = document.scrollingElement ?? document.documentElement
    const limite = raiz.clientWidth + tolerancia

    const cuelgaDeUnCarruselHorizontal = (elemento: Element): boolean => {
      let ancestro = elemento.parentElement
      while (ancestro !== null) {
        const desbordeHorizontal = getComputedStyle(ancestro).overflowX
        if (desbordeHorizontal === 'auto' || desbordeHorizontal === 'scroll') {
          return true
        }
        ancestro = ancestro.parentElement
      }
      return false
    }

    const culpables: { etiqueta: string; derecha: number }[] = []
    let elementosInspeccionados = 0
    for (const elemento of Array.from(document.querySelectorAll('*'))) {
      const estilo = getComputedStyle(elemento)
      if (estilo.display === 'none' || estilo.visibility === 'hidden') {
        continue
      }
      const caja = elemento.getBoundingClientRect()
      if (caja.width === 0 && caja.height === 0) {
        continue
      }
      if (cuelgaDeUnCarruselHorizontal(elemento)) {
        continue
      }
      elementosInspeccionados += 1
      if (caja.right > limite) {
        culpables.push({ etiqueta: elemento.tagName.toLowerCase(), derecha: Math.round(caja.right) })
      }
    }
    return { elementosInspeccionados, culpables }
  }, TOLERANCIA_SUBPIXEL_PX)
}

test.describe('@s44 ninguna ruta desborda en horizontal en la ventana más estrecha, con el diseño nuevo', () => {
  test('las 6 rutas a 320px: scrollWidth <= clientWidth y ningún elemento sobresale por la derecha', async ({ page }) => {
    await page.setViewportSize({ width: ANCHO_MOVIL_MINIMO_PX, height: ALTO_MOVIL_PX })

    let rutasComprobadas = 0
    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')

      const { scrollWidth, clientWidth } = await page.evaluate(() => {
        const raiz = document.scrollingElement ?? document.documentElement
        return { scrollWidth: raiz.scrollWidth, clientWidth: raiz.clientWidth }
      })
      expect(scrollWidth, `"${ruta}": la página se desplaza en horizontal`).toBeLessThanOrEqual(clientWidth)

      const informe = await medirDesbordesPorLaDerecha(page)
      expect(informe.elementosInspeccionados, `"${ruta}": no se inspeccionó ningún elemento`).toBeGreaterThan(0)
      expect(
        informe.culpables,
        `"${ruta}": elementos que sobresalen por la derecha — ${JSON.stringify(informe.culpables)}`,
      ).toEqual([])

      rutasComprobadas += 1
    }

    expect(rutasComprobadas).toBe(RECUENTO_DE_RUTAS)
    expect(RUTAS_DEL_INVENTARIO).toHaveLength(RECUENTO_DE_RUTAS)
  })
})
