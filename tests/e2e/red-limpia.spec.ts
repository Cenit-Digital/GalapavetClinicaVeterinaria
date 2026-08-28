// @s32-@s34 de `features/identidad_visual.feature` (Bloque F: red limpia,
// cero terceros, cero 404, cero ruido en consola). NAVEGADOR REAL con
// Playwright.
import { expect, test } from 'playwright/test'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

/** La única excepción declarada del proyecto: el mapa embebido de "InformacionContacto.tsx" (Invariante 3). */
const DOMINIO_DEL_MAPA_EMBEBIDO = 'openstreetmap.org'
const DOMINIOS_PROHIBIDOS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'unsplash.com']

test.describe('@s32 cargar cualquier ruta no dispara ni una sola petición a un tercero', () => {
  test('las 6 rutas: ningún dominio prohibido, el único externo es el del mapa, imágenes del visitante en el propio origen', async ({
    page,
    baseURL,
  }) => {
    const peticiones: { ruta: string; url: string }[] = []
    page.on('request', (peticion) => peticiones.push({ ruta: page.url(), url: peticion.url() }))

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')
    }

    expect(peticiones.length).toBeGreaterThan(0)

    const origenPropio = new URL(baseURL ?? 'http://localhost:4173').origin
    const dominiosExternos = new Set(
      peticiones
        .map((peticion) => new URL(peticion.url))
        .filter((url) => url.origin !== origenPropio)
        .map((url) => url.hostname),
    )

    for (const prohibido of DOMINIOS_PROHIBIDOS) {
      for (const dominio of dominiosExternos) {
        expect(dominio.endsWith(prohibido)).toBe(false)
      }
    }

    const dominiosNoDelMapa = [...dominiosExternos].filter((dominio) => !dominio.endsWith(DOMINIO_DEL_MAPA_EMBEBIDO))
    expect(dominiosNoDelMapa, `dominios externos inesperados: ${JSON.stringify(dominiosNoDelMapa)}`).toEqual([])

    // Toda imagen real del visitante (no el marco del mapa, un "iframe") sale del propio origen.
    const imagenesDeOtroOrigen = peticiones.filter(
      (peticion) => /\.(webp|png|jpe?g|svg)(\?|$)/i.test(peticion.url) && !peticion.url.startsWith(origenPropio),
    )
    expect(imagenesDeOtroOrigen).toEqual([])
  })
})

test.describe('@s33 ninguna ruta produce una respuesta de error al cargarse', () => {
  test('las 6 rutas: ninguna respuesta del propio origen >= 400', async ({ page, baseURL }) => {
    const origenPropio = new URL(baseURL ?? 'http://localhost:4173').origin
    const respuestas: { ruta: string; url: string; status: number }[] = []

    page.on('response', (respuesta) => {
      if (respuesta.url().startsWith(origenPropio)) {
        respuestas.push({ ruta: page.url(), url: respuesta.url(), status: respuesta.status() })
      }
    })

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')
    }

    expect(respuestas.length).toBeGreaterThan(0)
    const errores = respuestas.filter((respuesta) => respuesta.status >= 400)
    expect(errores, `respuestas de error: ${JSON.stringify(errores)}`).toEqual([])
  })
})

/**
 * HALLAZGO REAL (no un ajuste a ciegas): el `sandbox=""` del mapa embebido
 * (`InformacionContacto.tsx`, feature 10 ya `done` — el permiso MÁS
 * restrictivo que sigue mostrando el mapa) hace que Chromium escriba
 * "Blocked script execution in '<url del mapa>'..." en la consola de la
 * PÁGINA cuando el propio iframe de OpenStreetMap intenta correr su script
 * interno y el sandbox lo bloquea. Es la CONSECUENCIA CORRECTA de sandboxear
 * el único tercero admitido del proyecto (@s32), no un error de esta
 * feature: añadir "allow-scripts" lo callaría, pero ampliaría el permiso del
 * único punto de la página que toca un origen ajeno, y por una razón
 * puramente cosmética. Se filtra por texto, documentado, no silenciado sin
 * más.
 */
const PATRON_MENSAJE_DEL_MAPA_SANDBOXED = /openstreetmap\.org/i

function esRuidoConocidoDelMapa(texto: string): boolean {
  return PATRON_MENSAJE_DEL_MAPA_SANDBOXED.test(texto)
}

test.describe('@s34 ninguna ruta escribe un error ni un aviso en la consola del navegador', () => {
  test('las 6 rutas + interacción con el selector de paleta, un desplegable de servicios, una ficha de equipo y un ítem del FAQ: 0 errores, 0 avisos, 0 excepciones', async ({
    page,
  }) => {
    const mensajesDeError: string[] = []
    const mensajesDeAviso: string[] = []
    const excepciones: string[] = []

    page.on('console', (mensaje) => {
      if (esRuidoConocidoDelMapa(mensaje.text())) {
        return
      }
      if (mensaje.type() === 'error') {
        mensajesDeError.push(mensaje.text())
      }
      if (mensaje.type() === 'warning') {
        mensajesDeAviso.push(mensaje.text())
      }
    })
    page.on('pageerror', (error) => excepciones.push(error.message))

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')
    }

    // Interacciones reales sobre la portada: selector de paleta, un desplegable de servicios, un ítem del FAQ.
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.getByRole('button', { name: 'Cambiar paleta de color' }).click()
    // Se elige a propósito una variante DISTINTA de la predeterminada
    // ("Clínica"): solo un cambio real de tokens ejercita el repintado que
    // podría ensuciar la consola. Con `exact: true` porque el nombre accesible
    // podría ser subcadena de otro de la portada.
    await page.getByRole('button', { name: 'Marca Galapavet', exact: true }).click()

    const botonServicio = page.locator('section', { hasText: 'Servicios' }).getByRole('button').first()
    await botonServicio.click()

    // Ficha de equipo: el botón `aria-expanded` que alterna la formación
    // publicada (`Equipo.tsx:36-38`, @s3/@s7 de `equipo.feature`). Mismo
    // patrón de localización por estructura que el desplegable de servicios.
    const botonEquipo = page.locator('section', { hasText: 'Equipo' }).getByRole('button').first()
    await botonEquipo.click()

    const botonFaq = page.getByRole('button', { name: '¿Qué horario tiene la clínica?' })
    await botonFaq.click()

    expect(mensajesDeError, `errores de consola: ${JSON.stringify(mensajesDeError)}`).toEqual([])
    expect(mensajesDeAviso, `avisos de consola: ${JSON.stringify(mensajesDeAviso)}`).toEqual([])
    expect(excepciones, `excepciones no capturadas: ${JSON.stringify(excepciones)}`).toEqual([])
  })
})
