// @s24-@s26 de `features/identidad_visual.feature` (Bloque D: los tokens,
// efectivamente aplicados al documento). NAVEGADOR REAL con Playwright.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { leerTokenDeVariante } from '../../src/lib/diseno/tokensColor'
import { expect, test } from 'playwright/test'
import { RUTAS_DEL_INVENTARIO } from './rutas'
import { colorComputadoAHex, esTransparente } from './utilidades'

const RUTA_TOKENS = fileURLToPath(new URL('../../src/styles/_tokens.scss', import.meta.url))
const textoDeTokens = (): string => readFileSync(RUTA_TOKENS, 'utf8')

test.describe('@s24 el cuerpo del documento deja de arrastrar el margen por defecto del navegador', () => {
  for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
    test(`${pagina} (${ruta}): margen 0 en los 4 lados, fondo no transparente`, async ({ page }) => {
      await page.goto(ruta)
      const margen = await page.evaluate(() => {
        const estilo = getComputedStyle(document.body)
        return {
          top: estilo.marginTop,
          right: estilo.marginRight,
          bottom: estilo.marginBottom,
          left: estilo.marginLeft,
          fondo: estilo.backgroundColor,
        }
      })

      expect(margen.top).toBe('0px')
      expect(margen.right).toBe('0px')
      expect(margen.bottom).toBe('0px')
      expect(margen.left).toBe('0px')
      expect(esTransparente(margen.fondo)).toBe(false)
    })
  }

  test('el recuento de rutas efectivamente comprobadas es exactamente 6', () => {
    expect(RUTAS_DEL_INVENTARIO).toHaveLength(6)
  })
})

test.describe('@s25 en las 4 variantes el documento pinta de verdad el fondo y el texto de la variante activa (ejecuta @s12 de sistema_de_diseno_visual.feature)', () => {
  const VARIANTES: readonly { id: string; nombreAccesible: string }[] = [
    { id: 'marca', nombreAccesible: 'Marca Galapavet' },
    { id: 'lima', nombreAccesible: 'Lima de superficie' },
    { id: 'verde', nombreAccesible: 'Verde profundo' },
    { id: 'noche', nombreAccesible: 'Marca en oscuro' },
  ]

  test(`las ${VARIANTES.length} variantes: fondo y texto computados del body equivalen a los tokens declarados`, async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Cambiar paleta de color' }).click()

    let variantesVerificadas = 0
    for (const variante of VARIANTES) {
      const [fondoEsperado, textoEsperado] = [
        leerTokenDeVariante(textoDeTokens(), variante.id, 'fondo'),
        leerTokenDeVariante(textoDeTokens(), variante.id, 'texto'),
      ]

      await page.getByRole('button', { name: variante.nombreAccesible }).click()
      // El "body" de "global.scss" transiciona "background-color" Y "color"
      // a la vez, 150ms dentro de "no-preference" (Decisión 31): se espera a
      // que AMBOS lleguen a su valor final computado (no a un
      // `waitForTimeout` a ciegas ni solo al atributo "data-variante", que
      // cambia antes de que la transición termine).
      await page.waitForFunction(
        ({ fondoHex, textoHex }) => {
          const aHex = (valor: string): string | null => {
            const coincidencia = valor.match(/rgba?\((\d+), (\d+), (\d+)/)
            if (coincidencia === null) {
              return null
            }
            const [, r, g, b] = coincidencia
            return `#${[r, g, b].map((canal) => Number(canal).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
          }
          const estilo = getComputedStyle(document.body)
          return aHex(estilo.backgroundColor) === fondoHex && aHex(estilo.color) === textoHex
        },
        { fondoHex: fondoEsperado, textoHex: textoEsperado },
      )

      const { fondoComputado, textoComputado } = await page.evaluate(() => {
        const estilo = getComputedStyle(document.body)
        return { fondoComputado: estilo.backgroundColor, textoComputado: estilo.color }
      })

      expect(colorComputadoAHex(fondoComputado)).toBe(fondoEsperado)
      expect(colorComputadoAHex(textoComputado)).toBe(textoEsperado)
      variantesVerificadas += 1
    }

    expect(variantesVerificadas).toBe(4)
  })
})

test.describe('@s26 la landing tiene ritmo: sus secciones no comparten todas el mismo fondo', () => {
  const SELECTORES_DE_SECCION = ['#inicio', '#servicios', '#equipo', '#reservar', '#galeria', '#contacto', '#faq']

  test('8 secciones (7 anclas + campañas sin ancla), al menos 2 fondos distintos, ninguna transparente, sin 3 consecutivas iguales', async ({
    page,
  }) => {
    await page.goto('/')

    const fondos: string[] = []
    for (const selector of SELECTORES_DE_SECCION) {
      fondos.push(await page.locator(selector).evaluate((elemento) => getComputedStyle(elemento).backgroundColor))
    }
    // La sección de campañas no tiene ancla propia (Given del escenario): se localiza por su
    // posición real en el documento, entre "#servicios" y "#equipo" (Landing.tsx).
    const fondoCampanas = await page
      .locator('#servicios')
      .locator('xpath=following-sibling::*[1]')
      .evaluate((elemento) => getComputedStyle(elemento).backgroundColor)
    fondos.splice(2, 0, fondoCampanas)

    expect(fondos).toHaveLength(8)
    for (const fondo of fondos) {
      expect(esTransparente(fondo)).toBe(false)
    }

    const fondosDistintos = new Set(fondos)
    expect(fondosDistintos.size).toBeGreaterThanOrEqual(2)

    for (let indice = 0; indice + 2 < fondos.length; indice += 1) {
      const tresSeguidas = fondos[indice] === fondos[indice + 1] && fondos[indice + 1] === fondos[indice + 2]
      expect(tresSeguidas, `secciones ${indice}-${indice + 2} comparten el mismo fondo 3 veces seguidas`).toBe(false)
    }
  })
})
