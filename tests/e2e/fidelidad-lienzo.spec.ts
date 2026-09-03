import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_CONTENEDOR_PX = 1220
const TOLERANCIA_PX = 1
const IDS_DE_BANDAS = ['inicio', 'servicios', 'equipo', 'reservar', 'galeria', 'contacto', 'faq']
const RAIZ_DEL_REPOSITORIO = fileURLToPath(new URL('../..', import.meta.url))

interface Caja {
  readonly x: number
  readonly width: number
}

async function cajaDe(page: Page, selector: string): Promise<Caja> {
  return page.locator(selector).evaluate((elemento) => {
    const { x, width } = elemento.getBoundingClientRect()
    return { x, width }
  })
}

function archivosDeModuloBajo(directorio: string): readonly string[] {
  return readdirSync(directorio, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile() && entrada.name.endsWith('.module.scss'))
    .map((entrada) => `${entrada.parentPath}/${entrada.name}`)
}

function sinComentarios(texto: string): string {
  return texto.replaceAll(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
}

test.describe('@s1 de fidelidad_lienzo: bandas a sangre y contenido alineado', () => {
  test('a 1440px las bandas alcanzan la ventana y el contenido reutiliza el ancho de 1220px', async ({ page }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO_PX, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    for (const id of IDS_DE_BANDAS) {
      const caja = await cajaDe(page, `#${id}`)
      expect(caja.x, `banda #${id}`).toBeCloseTo(0, 0)
      expect(caja.width, `banda #${id}`).toBeCloseTo(ANCHO_ESCRITORIO_PX, 0)
    }

    const cajasDeContenido = await Promise.all([
      cajaDe(page, '[data-cabecera-interior]'),
      cajaDe(page, '#servicios > *'),
      cajaDe(page, '#servicios + * > *'),
      cajaDe(page, '#equipo > *'),
      cajaDe(page, '#reservar > *'),
      cajaDe(page, '#contacto > *'),
      cajaDe(page, '#faq > *'),
      cajaDe(page, 'footer > [data-contenedor-principal]'),
    ])

    for (const [indice, caja] of cajasDeContenido.entries()) {
      expect(caja.width, `contenido ${indice}`).toBeCloseTo(ANCHO_CONTENEDOR_PX, 0)
      expect(Math.abs(caja.x - cajasDeContenido[0]!.x), `alineación ${indice}`).toBeLessThanOrEqual(TOLERANCIA_PX)
    }
    expect(await page.locator('[data-a-sangre]').count()).toBe(1)
  })
})

test.describe('@s2 de fidelidad_lienzo: la alternancia de bandas coincide con el contrato', () => {
  test('el fondo principal y el alterno siguen la secuencia exacta tras el hero', async ({ page }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const selectores = ['#servicios', '#servicios + *', '#equipo', '#reservar', '#galeria', '#contacto', '#faq']
    const fondos = await Promise.all(
      selectores.map((selector) => page.locator(selector).evaluate((elemento) => getComputedStyle(elemento).backgroundColor)),
    )

    const sonda = await page.evaluate(() => {
      const elemento = document.createElement('div')
      document.body.append(elemento)
      elemento.style.backgroundColor = 'var(--color-fondo)'
      const fondoPrincipal = getComputedStyle(elemento).backgroundColor
      elemento.style.backgroundColor = 'var(--color-fondo-alterno)'
      const fondoAlterno = getComputedStyle(elemento).backgroundColor
      elemento.remove()
      return { fondoPrincipal, fondoAlterno }
    })

    expect(fondos).toEqual([
      sonda.fondoPrincipal,
      sonda.fondoAlterno,
      sonda.fondoPrincipal,
      sonda.fondoAlterno,
      sonda.fondoPrincipal,
      sonda.fondoAlterno,
      sonda.fondoPrincipal,
    ])
  })
})

test.describe('@s3 de fidelidad_lienzo: CSS Modules no recibe selectores de id', () => {
  test('ningún módulo de estilos declara un selector de id tras retirar las reglas hasheadas', () => {
    const modulos = archivosDeModuloBajo(`${RAIZ_DEL_REPOSITORIO}/src`)
    const selectoresDeId = modulos.filter((ruta) => /^\s*#[A-Za-z][\w-]*/m.test(sinComentarios(readFileSync(ruta, 'utf8'))))

    expect(modulos.length).toBeGreaterThan(0)
    expect(selectoresDeId).toEqual([])
  })
})

test.describe('@s4 de fidelidad_lienzo: la banda se adapta a móvil', () => {
  test('a 320px no hay desbordamiento horizontal y todas las bandas siguen ocupando el viewport', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const dimensiones = await page.evaluate((ids) => ({
      anchoDocumento: document.documentElement.scrollWidth,
      anchoVentana: window.innerWidth,
      bandas: ids.map((id) => {
        const elemento = document.getElementById(id)
        if (elemento === null) throw new Error(`falta la banda #${id}`)
        const { x, width } = elemento.getBoundingClientRect()
        return { id, x, width }
      }),
    }), IDS_DE_BANDAS)

    expect(dimensiones.anchoDocumento).toBeLessThanOrEqual(dimensiones.anchoVentana)
    for (const banda of dimensiones.bandas) {
      expect(banda.x, `banda #${banda.id}`).toBeCloseTo(0, 0)
      expect(banda.width, `banda #${banda.id}`).toBeCloseTo(dimensiones.anchoVentana, 0)
    }
  })
})
