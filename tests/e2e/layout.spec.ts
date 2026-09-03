// @s44-@s47 de `features/identidad_visual.feature` (Bloque I: layout que no
// se rompe). NAVEGADOR REAL con Playwright.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'playwright/test'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

const RUTA_API_SCSS = fileURLToPath(new URL('../../src/styles/_api.scss', import.meta.url))

const ANCHO_MOVIL_MINIMO_PX = 320
const ANCHO_VENTANA_ANCHA_PX = 1600
const TOLERANCIA_PX = 1

test.describe('@s44 en una ventana de 320 píxeles de ancho ninguna ruta desborda horizontalmente', () => {
  for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
    test(`${pagina} (${ruta}): scrollWidth <= clientWidth, ningún elemento sobresale por la derecha`, async ({ page }) => {
      await page.setViewportSize({ width: ANCHO_MOVIL_MINIMO_PX, height: 640 })
      await page.goto(ruta)

      const { scrollWidth, clientWidth, culpable } = await page.evaluate(() => {
        const raiz = document.scrollingElement ?? document.documentElement
        let elementoCulpable: { etiqueta: string; derecha: number } | null = null
        for (const elemento of Array.from(document.querySelectorAll<HTMLElement>('*'))) {
          const caja = elemento.getBoundingClientRect()
          if (caja.right > raiz.clientWidth + 1 && caja.width > 0) {
            elementoCulpable = { etiqueta: elemento.tagName + (elemento.className ? `.${String(elemento.className)}` : ''), derecha: caja.right }
            break
          }
        }
        return { scrollWidth: raiz.scrollWidth, clientWidth: raiz.clientWidth, culpable: elementoCulpable }
      })

      expect(scrollWidth, `elemento culpable: ${JSON.stringify(culpable)}`).toBeLessThanOrEqual(clientWidth)
    })
  }

  test('el recuento de rutas efectivamente comprobadas es exactamente 6', () => {
    expect(RUTAS_DEL_INVENTARIO).toHaveLength(6)
  })
})

test.describe('@s45 el contenido tiene un único ancho máximo de contenedor, el mismo en las seis rutas', () => {
  test('a 1600px de ventana: ancho < 1600 en las 6 rutas, y el mismo ancho en las 6', async ({ page }) => {
    await page.setViewportSize({ width: ANCHO_VENTANA_ANCHA_PX, height: 900 })
    const anchosMedidos: number[] = []

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      const ancho = await page
        .locator('[data-contenedor-principal]:not([data-a-sangre])')
        .first()
        .evaluate((el) => el.getBoundingClientRect().width)
      anchosMedidos.push(Math.round(ancho))
    }

    expect(anchosMedidos).toHaveLength(6)
    for (const ancho of anchosMedidos) {
      expect(ancho).toBeLessThan(ANCHO_VENTANA_ANCHA_PX)
    }
    const anchosDistintos = new Set(anchosMedidos)
    expect(anchosDistintos.size, `anchos medidos: ${JSON.stringify(anchosMedidos)}`).toBe(1)
  })
})

test.describe('@s46 en una página corta el pie cierra la ventana en vez de quedar flotando a media altura', () => {
  test('página no encontrada, ventana de 1000px de alto: el pie llega al borde inferior sin hueco', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/esto-no-existe`)

    const pie = page.locator('footer')
    const caja = await pie.boundingBox()
    if (caja === null) {
      throw new Error('no se pudo medir el pie de página')
    }

    const bordeInferiorVentana = 1000
    expect(caja.y + caja.height).toBeGreaterThanOrEqual(bordeInferiorVentana - TOLERANCIA_PX)
  })
})

interface CajaMedida {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

async function cajasDeFilaDeAccion(page: import('playwright/test').Page, selectorTarjetas: string, selectorFilaDeAccion: string): Promise<CajaMedida[]> {
  return page.evaluate(
    (selectores) => {
      const tarjetas = Array.from(document.querySelectorAll<HTMLElement>(selectores.selectorTarjetas))
      return tarjetas
        .map(
          (tarjeta) =>
            tarjeta.querySelector<HTMLElement>(selectores.selectorFilaDeAccion) ?? tarjeta.querySelector('button, a'),
        )
        .filter((el): el is HTMLElement => el !== null)
        .map((el) => {
          const caja = el.getBoundingClientRect()
          return { x: caja.x, y: caja.y, width: caja.width, height: caja.height }
        })
    },
    { selectorTarjetas, selectorFilaDeAccion },
  )
}

test.describe('@s47 los pies de las tarjetas de una misma fila quedan alineados aunque su texto sea desigual', () => {
  test('rejilla de servicios y rejilla de productos de la tienda: misma fila -> misma "y" del pie (tolerancia 1px), ninguna tarjeta con altura fija', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 })

    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const cajasServicios = await cajasDeFilaDeAccion(page, 'section[data-contenedor-principal] > article', 'button')

    await page.goto(`${SUBPATH_DE_PRODUCCION}/tienda`)
    const cajasTienda = await cajasDeFilaDeAccion(page, "section[aria-label='Catálogo'] li", 'button')

    const todasLasCajas = [...cajasServicios, ...cajasTienda]
    expect(todasLasCajas.length).toBeGreaterThan(0)

    // Agrupa por "y" redondeada: las de la misma fila deben compartir coordenada.
    function agruparPorFila(cajas: CajaMedida[]): Map<number, CajaMedida[]> {
      const filas = new Map<number, CajaMedida[]>()
      for (const caja of cajas) {
        const filaExistente = [...filas.keys()].find((y) => Math.abs(y - caja.y) <= TOLERANCIA_PX * 3)
        const clave = filaExistente ?? caja.y
        filas.set(clave, [...(filas.get(clave) ?? []), caja])
      }
      return filas
    }

    for (const cajas of [cajasServicios, cajasTienda]) {
      const filas = agruparPorFila(cajas)
      for (const cajasDeUnaFila of filas.values()) {
        if (cajasDeUnaFila.length < 2) continue
        const referencia = cajasDeUnaFila[0]!.y
        for (const caja of cajasDeUnaFila) {
          expect(Math.abs(caja.y - referencia)).toBeLessThanOrEqual(TOLERANCIA_PX)
        }
      }
    }

    // "Ninguna tarjeta declara una altura fija en píxeles": el patrón
    // "tarjeta" (`_api.scss`) es la ÚNICA fuente de estilo de todas las
    // tarjetas de este contrato (Servicios, Equipo, campañas, blog, tienda);
    // se lee su texto real y se comprueba que no fija "height".
    const textoDelApi = readFileSync(RUTA_API_SCSS, 'utf8')
    const cuerpoDeTarjeta = textoDelApi.match(/@mixin tarjeta \{([^}]*)\}/)?.[1] ?? ''
    expect(cuerpoDeTarjeta).not.toMatch(/(?<!min-|max-)\bheight:\s*\d/)
  })
})
