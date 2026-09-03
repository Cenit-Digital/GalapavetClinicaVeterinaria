import { expect, test, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_TABLETA_PX = 768
const ANCHOS_TELEFONO_PX = [320, 360, 375, 390, 414] as const
const ANCHOS_INTERMEDIOS_PX = [480, 600, 768, 820, 900] as const
const TOLERANCIA_PX = 1

async function cargarPortada(page: Page, ancho: number): Promise<void> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
}

test.describe('@s3 de fidelidad_responsive_integral: regímenes del pie', () => {
  test('a 768px el pie redistribuye la marca y sus tres columnas en dos pistas legibles', async ({ page }) => {
    await cargarPortada(page, ANCHO_TABLETA_PX)

    const columnas = await page.locator('[data-pie-superior]').evaluate((elemento) => {
      const estilo = getComputedStyle(elemento)
      return estilo.gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length
    })

    expect(columnas).toBe(2)
  })

  test('el pie usa una, dos y cuatro pistas en los límites 700/701/1023/1024 sin perder enlaces', async ({ page }) => {
    for (const [ancho, pistasEsperadas] of [
      [700, 1],
      [701, 2],
      [1023, 2],
      [1024, 4],
    ] as const) {
      await cargarPortada(page, ancho)

      const pie = page.getByRole('contentinfo')
      const pistas = await pie.locator('[data-pie-superior]').evaluate((elemento) =>
        getComputedStyle(elemento).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
      )
      expect(pistas, `pistas a ${ancho}px`).toBe(pistasEsperadas)
      await expect(pie.getByRole('link')).toHaveCount(15)
    }
  })
})

test.describe('@s1 de fidelidad_responsive_integral: teléfonos', () => {
  test('cada teléfono conserva las secciones críticas sin recorte, overflow ni errores de consola', async ({ page }) => {
    const errores: string[] = []
    page.on('console', (mensaje) => {
      if (mensaje.type() === 'error') errores.push(mensaje.text())
    })

    for (const ancho of ANCHOS_TELEFONO_PX) {
      await cargarPortada(page, ancho)
      const selectores = ['#inicio', '[data-reserva-acciones]', '#contacto form', '#faq', 'footer']
      const medidas = await page.evaluate((selectoresDeSeccion) => {
        const secciones = selectoresDeSeccion.map((selector) => {
          const elemento = document.querySelector<HTMLElement>(selector)
          if (elemento === null) throw new Error(`falta ${selector}`)
          const caja = elemento.getBoundingClientRect()
          return {
            selector,
            izquierda: caja.left,
            derecha: caja.right,
            anchoDesplazable: elemento.scrollWidth,
            anchoVisible: elemento.clientWidth,
          }
        })
        return {
          documento: document.documentElement.scrollWidth,
          ventana: window.innerWidth,
          secciones,
        }
      }, selectores)

      expect(medidas.documento, `documento a ${ancho}px`).toBeLessThanOrEqual(medidas.ventana + TOLERANCIA_PX)
      for (const seccion of medidas.secciones) {
        expect(seccion.izquierda, `${seccion.selector} empieza dentro a ${ancho}px`).toBeGreaterThanOrEqual(-TOLERANCIA_PX)
        expect(seccion.derecha, `${seccion.selector} termina dentro a ${ancho}px`).toBeLessThanOrEqual(medidas.ventana + TOLERANCIA_PX)
        expect(seccion.anchoDesplazable, `${seccion.selector} no recorta contenido a ${ancho}px`).toBeLessThanOrEqual(
          seccion.anchoVisible + TOLERANCIA_PX,
        )
      }
      await expect(page.getByRole('link', { name: 'WhatsApp', exact: true })).toBeVisible()
      await expect(page.locator('#contacto form')).toBeVisible()
      await expect(page.locator('#faq button')).toHaveCount(5)
      await expect(page.getByRole('contentinfo')).toBeVisible()
    }

    expect(errores).toEqual([])
  })
})

test.describe('@s2 de fidelidad_responsive_integral: tabletas', () => {
  test('los anchos intermedios conservan controles y secciones dentro de la ventana', async ({ page }) => {
    const errores: string[] = []
    page.on('console', (mensaje) => {
      if (mensaje.type() === 'error') errores.push(mensaje.text())
    })

    for (const ancho of ANCHOS_INTERMEDIOS_PX) {
      await cargarPortada(page, ancho)
      const informe = await page.evaluate(() => {
        const esVisible = (elemento: HTMLElement): boolean => {
          const estilo = getComputedStyle(elemento)
          const caja = elemento.getBoundingClientRect()
          return estilo.visibility !== 'hidden' && estilo.display !== 'none' && caja.width > 1 && caja.height > 1
        }
        const medir = (elemento: HTMLElement) => {
          const caja = elemento.getBoundingClientRect()
          return {
            etiqueta: elemento.tagName.toLowerCase(),
            izquierda: caja.left,
            derecha: caja.right,
            anchoDesplazable: elemento.scrollWidth,
            anchoVisible: elemento.clientWidth,
          }
        }
        return {
          documento: document.documentElement.scrollWidth,
          ventana: window.innerWidth,
          controles: [...document.querySelectorAll<HTMLElement>('a, button, input, select, textarea')].filter(esVisible).map(medir),
          secciones: ['#servicios', '#equipo', '#reservar', '#contacto', '#faq', 'footer']
            .map((selector) => document.querySelector<HTMLElement>(selector))
            .filter((elemento): elemento is HTMLElement => elemento !== null)
            .map(medir),
        }
      })

      expect(informe.documento, `documento a ${ancho}px`).toBeLessThanOrEqual(informe.ventana + TOLERANCIA_PX)
      for (const elemento of [...informe.controles, ...informe.secciones]) {
        expect(elemento.izquierda, `${elemento.etiqueta} empieza dentro a ${ancho}px`).toBeGreaterThanOrEqual(-TOLERANCIA_PX)
        expect(elemento.derecha, `${elemento.etiqueta} termina dentro a ${ancho}px`).toBeLessThanOrEqual(
          informe.ventana + TOLERANCIA_PX,
        )
        expect(elemento.anchoDesplazable, `${elemento.etiqueta} no recorta a ${ancho}px`).toBeLessThanOrEqual(
          elemento.anchoVisible + TOLERANCIA_PX,
        )
      }
    }

    expect(errores).toEqual([])
  })
})

test.describe('@s4 de fidelidad_responsive_integral: límite de cabecera', () => {
  test('1023px conserva el menú móvil y 1024px pasa a navegación horizontal sin solapes', async ({ page }) => {
    for (const [ancho, movil] of [
      [1023, true],
      [1024, false],
    ] as const) {
      await cargarPortada(page, ancho)
      const cabecera = page.locator('[data-cabecera-interior]')
      const menu = cabecera.getByRole('button', { name: 'Abrir menú' })
      const navegacion = cabecera.getByRole('navigation', { name: 'Navegación principal' })
      if (movil) {
        await expect(menu).toBeVisible()
        await expect(navegacion).toHaveCount(0)
      } else {
        await expect(menu).toHaveCount(0)
        await expect(navegacion).toBeVisible()
      }

      const cajas = await cabecera.locator(':scope > *').evaluateAll((elementos) =>
        elementos.map((elemento) => {
          const { x, y, width, height } = elemento.getBoundingClientRect()
          return { x, y, width, height }
        }),
      )
      for (let indice = 0; indice < cajas.length; indice += 1) {
        const caja = cajas[indice]!
        expect(caja.x, `inicio de control ${indice} a ${ancho}px`).toBeGreaterThanOrEqual(-TOLERANCIA_PX)
        expect(caja.x + caja.width, `fin de control ${indice} a ${ancho}px`).toBeLessThanOrEqual(ancho + TOLERANCIA_PX)
        for (const posterior of cajas.slice(indice + 1)) {
          const seSolapan = caja.x < posterior.x + posterior.width && posterior.x < caja.x + caja.width && caja.y < posterior.y + posterior.height && posterior.y < caja.y + caja.height
          expect(seSolapan, `solape de cabecera a ${ancho}px`).toBe(false)
        }
      }
    }
  })
})

test.describe('@s5 de fidelidad_responsive_integral: controles dinámicos', () => {
  test('el menú móvil tiene un objetivo táctil de al menos 44px a 320px', async ({ page }) => {
    await cargarPortada(page, 320)

    const caja = await page.getByRole('button', { name: 'Abrir menú' }).boundingBox()
    if (caja === null) throw new Error('el botón de menú no tiene caja visible')

    expect(caja.width).toBeGreaterThanOrEqual(44)
    expect(caja.height).toBeGreaterThanOrEqual(44)
  })

  test('los paneles de menú y paleta se contienen y conservan el recorrido de teclado', async ({ page }) => {
    for (const ancho of [320, 768, 1024] as const) {
      await cargarPortada(page, ancho)
      const selector = page.locator('[data-selector-paleta]')
      const disparador = selector.getByRole('button', { name: 'Cambiar paleta de color' })
      await disparador.click()
      const panelPaleta = selector.getByRole('group', { name: 'Paleta de color' })
      const cajaPaleta = await panelPaleta.boundingBox()
      if (cajaPaleta === null) throw new Error('el panel de paleta no tiene caja visible')
      expect(cajaPaleta.x, `paleta a ${ancho}px`).toBeGreaterThanOrEqual(-TOLERANCIA_PX)
      expect(cajaPaleta.x + cajaPaleta.width, `paleta a ${ancho}px`).toBeLessThanOrEqual(ancho + TOLERANCIA_PX)
      await page.keyboard.press('Tab')
      await expect(panelPaleta.getByRole('button').first()).toBeFocused()
      const tamanosDePaleta = await panelPaleta.getByRole('button').evaluateAll((botones) =>
        botones.map((boton) => {
          const { width, height } = boton.getBoundingClientRect()
          return { width, height }
        }),
      )
      for (const tamano of tamanosDePaleta) {
        expect(tamano.width, `opción de paleta a ${ancho}px`).toBeGreaterThanOrEqual(44)
        expect(tamano.height, `opción de paleta a ${ancho}px`).toBeGreaterThanOrEqual(44)
      }

      if (ancho < 1024) {
        const menu = page.getByRole('button', { name: 'Abrir menú' })
        await menu.click()
        const idPanel = await menu.getAttribute('aria-controls')
        if (idPanel === null) throw new Error('el menú no declara aria-controls')
        const panelMenu = page.locator(`#${idPanel}`)
        const cajaMenu = await panelMenu.boundingBox()
        if (cajaMenu === null) throw new Error('el panel de menú no tiene caja visible')
        expect(cajaMenu.x, `menú a ${ancho}px`).toBeGreaterThanOrEqual(-TOLERANCIA_PX)
        expect(cajaMenu.x + cajaMenu.width, `menú a ${ancho}px`).toBeLessThanOrEqual(ancho + TOLERANCIA_PX)
        await menu.focus()
        await page.keyboard.press('Tab')
        await expect(panelMenu.getByRole('link').first()).toBeFocused()
      }
    }
  })
})

test.describe('@s6 de fidelidad_responsive_integral: barrido de anchos', () => {
  test('cada 16px entre 320 y 1600 no aparece una franja con overflow, elementos fugados ni errores de consola', async ({ page }) => {
    const errores: string[] = []
    page.on('console', (mensaje) => {
      if (mensaje.type() === 'error') errores.push(mensaje.text())
    })

    await cargarPortada(page, 320)
    for (let ancho = 320; ancho <= 1600; ancho += 16) {
      await page.setViewportSize({ width: ancho, height: 900 })
      await page.evaluate(
        () =>
          new Promise<void>((resolver) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolver()))
          }),
      )
      const informe = await page.evaluate(() => {
        const fueraDeVentana = [...document.querySelectorAll<HTMLElement>('body *')]
          .filter((elemento) => {
            const estilo = getComputedStyle(elemento)
            const caja = elemento.getBoundingClientRect()
            return (
              estilo.display !== 'none' &&
              estilo.visibility !== 'hidden' &&
              estilo.position !== 'fixed' &&
              caja.width > 1 &&
              caja.height > 1 &&
              (caja.left < -1 || caja.right > window.innerWidth + 1) &&
              elemento.closest('[data-galeria-contenido]') === null
            )
          })
          .map((elemento) => {
            const clases = [...elemento.classList].join('.')
            return `${elemento.tagName.toLowerCase()}${elemento.id === '' ? '' : `#${elemento.id}`}${clases === '' ? '' : `.${clases}`}`
          })
        return {
          documento: document.documentElement.scrollWidth,
          ventana: window.innerWidth,
          fueraDeVentana,
        }
      })
      expect(informe.documento, `documento a ${ancho}px`).toBeLessThanOrEqual(informe.ventana + TOLERANCIA_PX)
      expect(informe.fueraDeVentana, `elementos fuera a ${ancho}px`).toEqual([])
    }

    expect(errores).toEqual([])
  })
})
