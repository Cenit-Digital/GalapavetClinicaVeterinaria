// Puertas de navegador real de `features/fidelidad_cabecera.feature` (@s1-@s7).
// Miden el artefacto construido y servido, nunca una maqueta.
import { expect, test, type Page } from 'playwright/test'
import { calcularRatioContraste } from '../../src/lib/contraste'
import { RECUENTO_DE_RUTAS, RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'
import { colorComputadoAHex } from './utilidades'

const ANCHO_ESCRITORIO = 1440
const ANCHO_CONTENEDOR = 1220

/**
 * Tolerancia de las comparaciones HORIZONTALES de @s1 (bordes izquierdo y
 * derecho contra el contenido de las secciones). @s4 NO la hereda: ver el
 * comentario de `TOLERANCIA_VERTICAL_MAXIMA`, más abajo.
 */
const TOLERANCIA = 1

// UMBRALES ESCRITOS A MANO — se confrontan contra lo que el navegador mide, y
// nunca se derivan de la escala de producción que comprueban (patrón
// `doble-de-test-anclado-al-literal-no-al-simbolo`).
const OBJETIVO_DE_PULSACION_PX = 44
const SEPARACION_ENTRE_NOMBRE_Y_DESCRIPTOR_PX = 4
const ALTURA_DE_CONTROL_MEDIA_PX = 48
const TECHO_DE_LA_PILDORA_PX = 36
const MINIMO_DE_AREA_TACTIL_PX = 24
const RATIO_MINIMO_DE_COMPONENTE = 3
const PASOS_DE_LA_ESCALA_TIPOGRAFICA_PX = [10.24, 12.8, 16, 20, 25, 31.25]
const DESTINOS_DEL_PANEL = 8
const TELEFONO_DE_URGENCIAS = 'tel:+34918511393'

const SELECTOR_INTERIOR = '[data-cabecera-interior]'
const SELECTOR_MARCA = `${SELECTOR_INTERIOR} a[href="#inicio"]`
const SELECTOR_ENLACE_DE_TIENDA = `${SELECTOR_INTERIOR} nav a[data-enlace-tienda]`

/** Las cinco variantes con su rótulo accesible REAL, escrito a mano y con sus tildes. */
const VARIANTES: readonly { id: string; nombreAccesible: string }[] = [
  { id: 'clinica', nombreAccesible: 'Clínica' },
  { id: 'calida', nombreAccesible: 'Cálida' },
  { id: 'tech', nombreAccesible: 'Tech' },
  { id: 'eco', nombreAccesible: 'Eco' },
  { id: 'marca', nombreAccesible: 'Marca Galapavet' },
]

interface Caja {
  readonly x: number
  readonly width: number
  readonly height: number
  readonly right: number
}

async function cajaDe(page: Page, selector: string): Promise<Caja> {
  return page.locator(selector).evaluate((elemento) => {
    const { x, width, height, right } = elemento.getBoundingClientRect()
    return { x, width, height, right }
  })
}

test.describe('@s1 de fidelidad_cabecera: la cabecera alineada con el contenido', () => {
  test('a 1440px comparte la columna de 1220px, termina donde termina el contenido y separa el nombre de su descriptor', async ({
    page,
  }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const [cabecera, servicios, navegacion] = await Promise.all([
      cajaDe(page, SELECTOR_INTERIOR),
      cajaDe(page, '#servicios > *'),
      cajaDe(page, `${SELECTOR_INTERIOR} nav`),
    ])

    expect(cabecera.width, 'cabecera: ancho').toBeCloseTo(ANCHO_CONTENEDOR, 0)
    expect(Math.abs(cabecera.x - servicios.x), 'cabecera: alineación').toBeLessThanOrEqual(TOLERANCIA)

    // D2 (20/09/2026): la navegación termina EXACTAMENTE donde termina el
    // contenido de las secciones, en espejo con la marca, que arranca donde
    // ese contenido arranca. Se compara contra el borde derecho MEDIDO de
    // `#servicios > *`, nunca contra el 1330 que da hoy a 1440px: escribirlo
    // a mano ataría la puerta a un único ancho de ventana.
    const marca = await cajaDe(page, SELECTOR_MARCA)
    expect(Math.abs(navegacion.right - servicios.right), 'navegación: borde derecho').toBeLessThanOrEqual(TOLERANCIA)
    expect(Math.abs(marca.x - servicios.x), 'marca: borde izquierdo').toBeLessThanOrEqual(TOLERANCIA)

    // La cabecera es la franja fija COMPLETA: arranca en el borde superior
    // del área visible, sin ninguna franja anclada por encima.
    const inicioDeLaCabecera = await page
      .locator('header')
      .evaluate((elemento) => elemento.getBoundingClientRect().top)
    expect(inicioDeLaCabecera).toBeCloseTo(0, 0)

    // D3 (20/09/2026): hasta hoy las dos cajas se TOCABAN (0,00 px medidos) y
    // el contrato bendecía el defecto con la palabra "compacto".
    const separacion = await page.locator(SELECTOR_MARCA).evaluate((enlace) => {
      const nombre = enlace.querySelector('strong')
      const descriptor = nombre?.nextElementSibling
      if (!nombre || !descriptor) {
        throw new Error('la marca no expone el nombre y su descriptor como cajas hermanas')
      }
      return descriptor.getBoundingClientRect().top - nombre.getBoundingClientRect().bottom
    })
    expect(separacion, 'marca: hueco entre el nombre y el descriptor').toBeCloseTo(
      SEPARACION_ENTRE_NOMBRE_Y_DESCRIPTOR_PX,
      1,
    )

    await expect(page.locator(`${SELECTOR_MARCA} img`)).toHaveAttribute('src', /\/img\/logo-galapavet\.webp$/)
    await expect(page.locator(SELECTOR_MARCA)).toContainText('Galapavet')
    await expect(page.locator(SELECTOR_MARCA)).toContainText('Centro integral veterinario')

    const textoDeLaPagina = await page.locator('body').innerText()
    expect(textoDeLaPagina).not.toMatch(/urgencias\s+24\s*h|24h|todos los días del año/i)
  })
})

test.describe('@s2 de fidelidad_cabecera: acciones de escritorio', () => {
  test('la fila contiene los ocho enlaces y la tienda, con destinos reales y objetivos de pulsación válidos', async ({
    page,
  }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const navegacion = page.getByRole('navigation', { name: 'Navegación principal' })
    const enlaces = navegacion.getByRole('link')
    await expect(enlaces).toHaveCount(DESTINOS_DEL_PANEL)
    await expect(navegacion.locator('ul')).toHaveCSS('flex-direction', 'row')

    const tienda = navegacion.getByRole('link', { name: 'Tienda', exact: true })
    await expect(tienda).toHaveAttribute('href', /\/tienda$/)

    // D1: ningún control de la fila tiene un destino que empiece por "tel:".
    await expect(page.locator(`${SELECTOR_INTERIOR} a[href^="tel:"]`)).toHaveCount(0)

    const controles = await enlaces.all()
    // Guarda anti-vacuidad: el bucle de abajo recorre los OCHO enlaces, nunca
    // una lista vacía que lo dejaría pasando sin medir nada.
    expect(controles.length, 'controles medidos').toBe(DESTINOS_DEL_PANEL)
    for (const [indice, control] of controles.entries()) {
      const caja = await control.evaluate((elemento) => {
        const { width, height } = elemento.getBoundingClientRect()
        return { width, height }
      })
      expect(caja.width, `control ${indice}: ancho`).toBeGreaterThanOrEqual(OBJETIVO_DE_PULSACION_PX)
      expect(caja.height, `control ${indice}: alto`).toBeGreaterThanOrEqual(OBJETIVO_DE_PULSACION_PX)
    }

    await page.setViewportSize({ width: 1024, height: 900 })
    await expect(navegacion).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})

test.describe('@s3 de fidelidad_cabecera: menú móvil', () => {
  test('a 320px abre, ofrece ocho enlaces focalizables, cierra al navegar y no crea overflow', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const boton = page.getByRole('button', { name: 'Abrir menú' })
    await boton.click()
    await expect(boton).toHaveAttribute('aria-expanded', 'true')

    const idPanel = await boton.getAttribute('aria-controls')
    expect(idPanel).toBeTruthy()
    const enlaces = page.locator(`#${idPanel} a`)
    // D1: el panel pasa de nueve enlaces a ocho — es la ÚNICA puerta de D1
    // sobre el panel móvil.
    await expect(enlaces).toHaveCount(DESTINOS_DEL_PANEL)
    await expect(page.locator(`#${idPanel} a[href^="tel:"]`)).toHaveCount(0)
    expect(await enlaces.evaluateAll((elementos) => elementos.every((elemento) => elemento.tabIndex >= 0))).toBe(true)

    await page.locator(`#${idPanel}`).getByRole('link', { name: 'Servicios', exact: true }).click()
    await expect(boton).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator(`#${idPanel}`)).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  })
})

test.describe('@s4 de fidelidad_cabecera: la franja fija mide exactamente el hueco que el documento reserva bajo ella', () => {
  test('el alto renderizado de la cabecera, borde incluido, iguala el relleno superior de #root y #inicio arranca justo debajo', async ({
    page,
  }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const medidas = await page.evaluate(() => {
      const cabecera = document.querySelector('header')
      const contenedorDePagina = document.querySelector('#root')
      const primerContenido = document.querySelector('#inicio')
      const marca = document.querySelector('[data-cabecera-interior] a[href="#inicio"]')
      if (!cabecera || !contenedorDePagina || !primerContenido || !marca) {
        throw new Error('falta alguna de las cuatro cajas que @s4 compara')
      }
      const cajaDeLaCabecera = cabecera.getBoundingClientRect()
      const estiloDeLaCabecera = getComputedStyle(cabecera)
      return {
        alto: cajaDeLaCabecera.height,
        bordeInferior: cajaDeLaCabecera.bottom,
        grosorDelBordeFino: Number.parseFloat(estiloDeLaCabecera.borderBlockEndWidth),
        huecoReservado: Number.parseFloat(getComputedStyle(contenedorDePagina).paddingBlockStart),
        huecoReservadoDeclarado: getComputedStyle(contenedorDePagina).paddingBlockStart,
        tokenDeAlturaDeCabecera: getComputedStyle(document.documentElement)
          .getPropertyValue('--altura-cabecera')
          .trim(),
        arranqueDelPrimerContenido: primerContenido.getBoundingClientRect().top,
        altoDelBloqueDeMarca: marca.getBoundingClientRect().height,
      }
    })

    /**
     * @s4 se comprueba SIN tolerancia. La red contra el redondeo subpíxel que
     * el contrato permite es ESTRICTAMENTE MENOR que el grosor del borde fino
     * —medio borde— y se deriva del propio borde MEDIDO, nunca del `TOLERANCIA
     * = 1` de las comparaciones horizontales de @s1: en una comparación
     * VERTICAL, un píxel de holgura absorbe un borde entero, que es
     * exactamente el defecto que este escenario existe para cazar.
     */
    expect(medidas.grosorDelBordeFino, 'la cabecera declara un borde inferior medible').toBeGreaterThan(0)
    const TOLERANCIA_VERTICAL_MAXIMA = medidas.grosorDelBordeFino / 2

    expect(Math.abs(medidas.alto - medidas.huecoReservado), 'alto de la franja contra el hueco reservado').toBeLessThan(
      TOLERANCIA_VERTICAL_MAXIMA,
    )
    expect(
      Math.abs(medidas.arranqueDelPrimerContenido - medidas.bordeInferior),
      'primer contenido contra el borde inferior de la cabecera',
    ).toBeLessThan(TOLERANCIA_VERTICAL_MAXIMA)

    // La igualdad se consigue en la FRANJA: ni el token de altura ni el hueco
    // que el contenedor de la página reserva se mueven. Por el otro camino
    // @s4 volvería a pasar en verde dejando descuadrados a los demás
    // consumidores de `--altura-cabecera`.
    expect(medidas.tokenDeAlturaDeCabecera, 'el token de altura sigue siendo el hueco reservado').toBe(
      medidas.huecoReservadoDeclarado,
    )

    expect(medidas.altoDelBloqueDeMarca, 'el bloque de marca cabe en la franja').toBeLessThanOrEqual(medidas.alto)
  })
})

test.describe('@s5 de fidelidad_cabecera: la cabecera no ofrece ningún acceso a urgencias en ninguna ruta', () => {
  test('en las seis rutas publicadas: sin "tel:", sin nombre accesible ni texto con "Urgencias"', async ({ page }) => {
    let rutasRecorridas = 0

    for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      const cabecera = page.locator('header')
      await expect(cabecera, `${pagina}: cabecera única`).toHaveCount(1)

      // Guarda anti-vacuidad: la cabecera de cada ruta tiene enlaces de
      // verdad, así que las tres comprobaciones de abajo miran algo.
      const enlaces = cabecera.getByRole('link')
      expect(await enlaces.count(), `${pagina}: la cabecera no tiene ningún enlace`).toBeGreaterThan(0)

      await expect(cabecera.locator('a[href^="tel:"]'), `${pagina}: enlace de llamada en la cabecera`).toHaveCount(0)
      await expect(
        cabecera.getByRole('link', { name: /Urgencias/i }),
        `${pagina}: enlace de urgencias en la cabecera`,
      ).toHaveCount(0)
      await expect(
        cabecera.getByRole('button', { name: /Urgencias/i }),
        `${pagina}: botón de urgencias en la cabecera`,
      ).toHaveCount(0)
      expect(await cabecera.innerText(), `${pagina}: texto de urgencias en la cabecera`).not.toMatch(/urgencias/i)

      rutasRecorridas += 1
    }

    expect(rutasRecorridas, 'rutas recorridas').toBe(RECUENTO_DE_RUTAS)
  })

  /**
   * Última cláusula de @s5, enmendada el 20/09/2026 (segunda tanda): el
   * armazón común de las seis rutas se queda SIN ninguna llamada a urgencias.
   *
   * AVISO DE SECUENCIA: esta cláusula NO la satisface la oleada de la
   * cabecera. El enlace que queda vivo es el del PIE (`PieDePagina-logica.ts`,
   * montado en `App.tsx`), que retira E2 en su propia oleada — un fichero que
   * esta oleada tiene prohibido tocar. Nace en rojo a propósito y se pone en
   * verde cuando aterrice la oleada del pie.
   */
  test('fuera de la cabecera y sin interactuar, el armazón común tampoco ofrece la llamada a urgencias (E2)', async ({
    page,
  }) => {
    let rutasRecorridas = 0

    for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await expect(
        page.locator(`a[href="${TELEFONO_DE_URGENCIAS}"]`),
        `${pagina}: llamada a urgencias visible sin interactuar`,
      ).toHaveCount(0)
      rutasRecorridas += 1
    }

    expect(rutasRecorridas, 'rutas recorridas').toBe(RECUENTO_DE_RUTAS)
  })
})

test.describe('@s6 de fidelidad_cabecera: el acceso "Tienda" baja a la píldora del prototipo sin perder su objetivo de pulsación', () => {
  test('la píldora visible cabe bajo el techo de la escala mientras la caja del enlace conserva 44×44', async ({
    page,
  }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const medidas = await page.locator(SELECTOR_ENLACE_DE_TIENDA).evaluate((enlace) => {
      const estilo = getComputedStyle(enlace)
      const pildora = getComputedStyle(enlace, '::before')
      const caja = enlace.getBoundingClientRect()
      // La superficie VISIBLE de la píldora es su caja de BORDE, y con
      // `box-sizing: border-box` (reset global) eso es exactamente lo que
      // `getComputedStyle` devuelve en `height` para el pseudo-elemento.
      // MEDIDO en Chromium antes de fijar esta línea: sumarle además los dos
      // bordes daba 37 px y contaba dos veces el mismo perímetro.
      const altoVisibleDeLaPildora = Number.parseFloat(pildora.height)
      const resolver = (token: string): string => {
        const sonda = document.createElement('span')
        sonda.style.color = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
        document.body.appendChild(sonda)
        const resuelto = getComputedStyle(sonda).color
        sonda.remove()
        return resuelto
      }
      return {
        anchoDelObjetivo: caja.width,
        altoDelObjetivo: caja.height,
        altoVisibleDeLaPildora,
        colorDelTexto: estilo.color,
        tintaFuerte: resolver('--color-tinta'),
        colorDeTextoNormal: resolver('--color-texto'),
        tamanoDeLetra: Number.parseFloat(estilo.fontSize),
      }
    })

    expect(medidas.altoVisibleDeLaPildora, 'píldora: alto visible').toBeLessThan(ALTURA_DE_CONTROL_MEDIA_PX)
    expect(medidas.altoVisibleDeLaPildora, 'píldora: techo de la escala').toBeLessThanOrEqual(TECHO_DE_LA_PILDORA_PX)
    expect(medidas.altoVisibleDeLaPildora, 'píldora: mínimo de área táctil').toBeGreaterThanOrEqual(
      MINIMO_DE_AREA_TACTIL_PX,
    )

    expect(medidas.anchoDelObjetivo, 'objetivo de pulsación: ancho').toBeGreaterThanOrEqual(OBJETIVO_DE_PULSACION_PX)
    expect(medidas.altoDelObjetivo, 'objetivo de pulsación: alto').toBeGreaterThanOrEqual(OBJETIVO_DE_PULSACION_PX)

    expect(medidas.colorDelTexto, 'tienda: tinta fuerte').toBe(medidas.tintaFuerte)
    expect(medidas.colorDelTexto, 'tienda: no el color de texto normal').not.toBe(medidas.colorDeTextoNormal)

    expect(PASOS_DE_LA_ESCALA_TIPOGRAFICA_PX, 'tienda: tamaño de letra de la escala').toContain(medidas.tamanoDeLetra)
  })
})

test.describe('@s7 de fidelidad_cabecera: el borde del acceso "Tienda" se suaviza sin bajar del mínimo de contraste de componente', () => {
  test('en las cinco variantes contrasta menos que el borde de control pero nunca por debajo de 3:1', async ({
    page,
  }) => {
    // Los botones de contorno transicionan `border-color` 150 ms al cambiar de
    // variante (mixin `boton-fantasma`, dentro de `no-preference`). Sin esto,
    // la primera variante —la que ya estaba pintada al cargar— pasaba y las
    // cuatro siguientes se medían A MEDIA TRANSICIÓN: MEDIDO, `calida` daba
    // cero botones con el borde de control. Bajo `reduce` esa transición no
    // llega a declararse, así que el color es final en cuanto cambia el
    // atributo. Mismo recurso que `fidelidad.spec.ts` para que `aplicarVariante`
    // converja; no cambia ningún color, solo los quita del aire.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.getByRole('button', { name: 'Cambiar paleta de color' }).click()

    let variantesVerificadas = 0

    for (const { id, nombreAccesible } of VARIANTES) {
      await page.getByRole('button', { name: nombreAccesible, exact: true }).click()
      await expect(page.locator('html')).toHaveAttribute('data-variante', id)
      await page.waitForFunction(() => document.getAnimations().every((animacion) => animacion.playState === 'finished'))

      const colores = await page.locator(SELECTOR_ENLACE_DE_TIENDA).evaluate((enlace) => {
        const resolver = (token: string): string => {
          const sonda = document.createElement('span')
          sonda.style.color = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
          document.body.appendChild(sonda)
          const resuelto = getComputedStyle(sonda).color
          sonda.remove()
          return resuelto
        }
        const bordeDeControl = resolver('--color-borde-control')
        // Los demás botones de contorno del sitio: cualquier control que
        // siga pintando EXACTAMENTE el borde de control del sistema.
        const otrosBotonesDeContorno = [...document.querySelectorAll('a, button')].filter((elemento) => {
          if (elemento.matches('[data-enlace-tienda]')) return false
          const estilo = getComputedStyle(elemento)
          return estilo.borderTopStyle === 'solid' && estilo.borderTopColor === bordeDeControl
        }).length
        return {
          bordeDeLaPildora: getComputedStyle(enlace, '::before').borderTopColor,
          bordeDeControl,
          fondo: resolver('--color-fondo'),
          otrosBotonesDeContorno,
        }
      })

      const hexDelFondo = colorComputadoAHex(colores.fondo)
      const ratioDeLaPildora = calcularRatioContraste(colorComputadoAHex(colores.bordeDeLaPildora), hexDelFondo)
      const ratioDelBordeDeControl = calcularRatioContraste(colorComputadoAHex(colores.bordeDeControl), hexDelFondo)

      expect(ratioDeLaPildora, `${id}: la píldora contrasta menos que el borde de control`).toBeLessThan(
        ratioDelBordeDeControl,
      )
      expect(ratioDeLaPildora, `${id}: mínimo de contraste de componente`).toBeGreaterThanOrEqual(
        RATIO_MINIMO_DE_COMPONENTE,
      )
      expect(
        colores.otrosBotonesDeContorno,
        `${id}: los demás botones de contorno conservan su borde de control`,
      ).toBeGreaterThan(0)

      variantesVerificadas += 1
    }

    expect(variantesVerificadas, 'variantes verificadas').toBe(VARIANTES.length)
  })
})
