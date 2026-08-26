// Puertas de navegador real del rediseño aprobado. Comprueban el artefacto
// construido en sus seis rutas, no una maqueta ni el servidor de desarrollo.
import { expect, test } from 'playwright/test'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

/**
 * Las cinco variantes con su rótulo accesible REAL, escrito a mano y CON SUS
 * TILDES ("clinica" se rotula "Clínica", "calida" se rotula "Cálida"). El
 * rótulo NO se deriva del id — derivarlo generaba "Clinica"/"Calida", que no
 * casan con ningún botón — ni se importa de `src/data/variantesPaleta.ts`: si
 * se leyera del mismo catálogo que pinta los botones, un renombrado
 * silencioso seguiría en verde. Mismo doble anclado al literal que usa
 * `tokens-aplicados.spec.ts` (@s25).
 */
const VARIANTES: readonly { id: string; nombreAccesible: string }[] = [
  { id: 'clinica', nombreAccesible: 'Clínica' },
  { id: 'calida', nombreAccesible: 'Cálida' },
  { id: 'tech', nombreAccesible: 'Tech' },
  { id: 'eco', nombreAccesible: 'Eco' },
  { id: 'marca', nombreAccesible: 'Marca Galapavet' },
]

test.describe('@s14, @s17, @s20, @s29 y @s50: la producción conserva el nuevo sistema visual', () => {
  for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
    test(`${pagina}: no desborda ni emite errores de consola`, async ({ page }) => {
      const errores: string[] = []
      page.on('console', (mensaje) => {
        if (mensaje.type() === 'error') {
          errores.push(mensaje.text())
        }
      })
      page.on('pageerror', (error) => errores.push(error.message))

      await page.setViewportSize({ width: 1600, height: 1000 })
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')

      const estado = await page.evaluate(() => ({
        anchoDocumento: document.documentElement.scrollWidth,
        anchoVentana: window.innerWidth,
        // Las imágenes `loading=lazy` que siguen fuera del viewport aún no se
        // han solicitado; solo una imagen ya completada con ancho cero prueba
        // una respuesta rota en este punto de la navegación.
        imagenesRotas: [...document.images].filter((imagen) => imagen.complete && imagen.naturalWidth === 0).length,
      }))

      expect(estado.anchoDocumento).toBeLessThanOrEqual(estado.anchoVentana)
      expect(estado.imagenesRotas).toBe(0)
      expect(errores).toEqual([])
    })
  }

  test('la portada materializa hero, barra de urgencias y fotografías locales de servicios', async ({ page }) => {
    await page.setViewportSize({ width: 1600, height: 1000 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const hero = page.locator('#inicio')
    await expect(hero.getByRole('heading', { level: 1 })).toHaveCSS('font-weight', '600')
    await expect(hero.locator('img')).toHaveCount(1)
    await expect(page.locator('#servicios img')).toHaveCount(5)
    await expect(page.locator('aside[aria-label="Urgencias fuera de horario"] a')).toHaveAttribute('href', /^tel:/)

    const rutasDeServicio = await page.locator('#servicios img').evaluateAll((imagenes) => imagenes.map((imagen) => imagen.getAttribute('src')))
    expect(rutasDeServicio).toHaveLength(5)
    for (const ruta of rutasDeServicio) {
      expect(ruta).toMatch(/\/img\/servicios\//)
    }
  })

  test('las cinco variantes se pueden aplicar en la portada sin cambiar el inventario ni introducir overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.getByRole('button', { name: 'Cambiar paleta de color' }).click()

    for (const { id, nombreAccesible } of VARIANTES) {
      // `exact: true` es obligatorio: sin él, "Eco" o "Clínica" casarían como
      // subcadena con otros nombres accesibles de la portada (por ejemplo el
      // ítem del FAQ "¿Qué horario tiene la clínica?").
      await page.getByRole('button', { name: nombreAccesible, exact: true }).click()
      await expect(page.locator('html')).toHaveAttribute('data-variante', id)
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
      expect(overflow).toBe(false)
    }
  })
})
