import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_MOVIL_PX = 320
const TOLERANCIA_PX = 1
const ANCHO_MAXIMO_LISTA_PX = 860
const PREGUNTAS_PUBLICADAS = [
  '¿Qué horario tiene la clínica?',
  '¿Cómo pido cita?',
  '¿Qué servicios ofrecéis?',
  '¿Qué hago si mi animal necesita atención fuera del horario?',
  '¿Cada cuánto hay que vacunar a un perro o a un gato?',
] as const

interface Caja {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

async function cajaDe(locator: Locator): Promise<Caja> {
  const caja = await locator.boundingBox()
  if (caja === null) throw new Error('el elemento no tiene caja visible')
  return caja
}

async function cargarFaq(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.locator('#faq section[aria-label="Preguntas frecuentes"]')
}

test.describe('@s1 de fidelidad_faq: cabecera y lista centradas', () => {
  test('a 1440px el cintillo y el título se centran y la lista ocupa como máximo 860px con márgenes iguales', async ({ page }) => {
    const seccion = await cargarFaq(page, ANCHO_ESCRITORIO_PX)
    const cabecera = seccion.locator('[data-faq-cabecera]')
    const lista = seccion.locator('[data-faq-lista]')
    const cajaSeccion = await cajaDe(seccion)
    const cajaLista = await cajaDe(lista)

    await expect(cabecera.getByText('FAQ')).toHaveText('FAQ')
    await expect(cabecera.getByRole('heading', { level: 2 })).toHaveText('Preguntas frecuentes')
    expect(cajaLista.width).toBeLessThanOrEqual(ANCHO_MAXIMO_LISTA_PX)
    expect(Math.abs(cajaLista.x - cajaSeccion.x - (cajaSeccion.width - cajaLista.width) / 2)).toBeLessThanOrEqual(
      TOLERANCIA_PX,
    )
    for (const elemento of [cabecera.getByText('FAQ'), cabecera.getByRole('heading', { level: 2 })]) {
      const centro = await elemento.evaluate((nodo) => {
        const rango = document.createRange()
        rango.selectNodeContents(nodo)
        const caja = rango.getBoundingClientRect()
        return caja.x + caja.width / 2
      })
      expect(Math.abs(centro - (cajaSeccion.x + cajaSeccion.width / 2))).toBeLessThanOrEqual(TOLERANCIA_PX)
    }
  })
})

test.describe('@s2 y @s3 de fidelidad_faq: indicador decorativo y acordeón accesible', () => {
  test('cada pregunta conserva su nombre accesible, pinta el círculo + a la derecha y al abrirlo rota sin alterar ese nombre', async ({ page }) => {
    const seccion = await cargarFaq(page, ANCHO_ESCRITORIO_PX)
    const botones = seccion.getByRole('button')
    await expect(botones).toHaveCount(PREGUNTAS_PUBLICADAS.length)

    const primero = botones.first()
    await expect(primero).toHaveAccessibleName(PREGUNTAS_PUBLICADAS[0])
    const cerrado = await primero.evaluate((nodo) => {
      const estilo = getComputedStyle(nodo, '::after')
      return { contenido: estilo.content, ancho: estilo.width, alto: estilo.height, radio: estilo.borderRadius, transformacion: estilo.transform }
    })
    expect(cerrado.contenido).toContain('+')
    expect(cerrado.ancho).toBe('30px')
    expect(cerrado.alto).toBe('30px')
    expect(cerrado.radio).toBe('50%')

    await primero.focus()
    await page.keyboard.press('Enter')
    await expect(primero).toHaveAttribute('aria-expanded', 'true')
    await expect(primero).toHaveAccessibleName(PREGUNTAS_PUBLICADAS[0])
    await expect(seccion.getByRole('region', { name: PREGUNTAS_PUBLICADAS[0] })).toBeVisible()
    const abierto = await primero.evaluate((nodo) => getComputedStyle(nodo, '::after').transform)
    expect(abierto).not.toBe(cerrado.transformacion)

    const segundo = botones.nth(1)
    await segundo.focus()
    await page.keyboard.press('Enter')
    await expect(segundo).toHaveAttribute('aria-expanded', 'true')
    await expect(primero).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('@s4 de fidelidad_faq: datos publicados y móvil', () => {
  test('a 320px aparecen exactamente las cinco preguntas publicadas y el documento no desborda', async ({ page }) => {
    const seccion = await cargarFaq(page, ANCHO_MOVIL_PX)
    await expect(seccion.getByRole('button')).toHaveText([...PREGUNTAS_PUBLICADAS])
    const medidas = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }))
    expect(medidas.documento).toBeLessThanOrEqual(medidas.ventana + TOLERANCIA_PX)
  })
})
