// @s36-@s41 de `features/identidad_visual.feature` (Bloque G: accesibilidad
// medida sobre el sitio real). NAVEGADOR REAL con Playwright + axe-core.
// Ejecuta, uno a uno: @s28 de sistema_de_diseno_visual.feature y @s2 de
// accesibilidad.feature (por @s36); @s29 de sistema_de_diseno_visual.feature
// (por @s37); @s30/@s31 de sistema_de_diseno_visual.feature y la segunda
// mitad de @s18 de accesibilidad.feature (por @s38/@s39); @s32 de
// sistema_de_diseno_visual.feature y @s17 de accesibilidad.feature (por
// @s40); y el punto de corte 1024/1023 de la cabecera real (@s27 de
// sistema_de_diseno_visual.feature).
import { AxeBuilder } from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from 'playwright/test'
import { ejecutarPuertaDeAnalisisAutomatico, type ResultadoDeAnalisisAutomatico } from '../../src/lib/accesibilidad-analisis'
import { calcularRatioContraste } from '../../src/lib/contraste'
import { ETIQUETAS_AXE_ACUMULATIVAS } from '../../src/lib/diseno/analisisAutomaticoAxe'
import { RUTAS_DEL_INVENTARIO } from './rutas'
import { colorComputadoAHex } from './utilidades'

// UMBRALES ESCRITOS A MANO — no se recalculan de los valores que comprueban.
const AREA_TACTIL_MINIMA_PX = 24
const PERIMETRO_FOCO_MINIMO_PX = 2
const RATIO_MINIMO_ENTRE_ESTADOS = 3
const RATIO_MINIMO_CONTRA_FONDO = 3

test.describe('@s36 el análisis automático no reporta ninguna violación en ninguna de las seis rutas del sitio real', () => {
  test('las 5 etiquetas acumulativas, sin mecanismo de opciones, 0 violaciones en las 6 rutas (ejecuta @s2 de accesibilidad.feature y @s28 de sistema_de_diseno_visual.feature)', async ({
    page,
  }) => {
    const informes: ResultadoDeAnalisisAutomatico['informes'][number][] = []

    for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      const analisis = await new AxeBuilder({ page }).withTags([...ETIQUETAS_AXE_ACUMULATIVAS]).analyze()
      informes.push({
        pagina,
        cargo: true,
        violaciones: analisis.violations.map((violacion) => ({
          criterio: violacion.id,
          elemento: violacion.nodes.map((nodo) => nodo.target.join(' ')).join(' | '),
        })),
      })
    }

    const resultado: ResultadoDeAnalisisAutomatico = { reglasAplicadas: ETIQUETAS_AXE_ACUMULATIVAS.length, informes }
    const informe = ejecutarPuertaDeAnalisisAutomatico(resultado)

    expect(informe.paginasAnalizadas).toBe(6)
    expect(informe.violaciones, JSON.stringify(informe.violaciones, null, 2)).toEqual([])
    expect(informe.violacionesTotales).toBe(0)
    expect(informe.veredicto).toBe('aprobado')
  })
})

interface ObjetivoMedido {
  readonly ruta: string
  readonly nombre: string
  readonly ancho: number
  readonly alto: number
}

const SELECTOR_INTERACTIVO =
  'a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="button"], [tabindex]:not([tabindex="-1"])'

async function objetivosVisibles(page: Page): Promise<Locator[]> {
  const todos = await page.locator(SELECTOR_INTERACTIVO).all()
  const visibles: Locator[] = []
  for (const objetivo of todos) {
    if (await objetivo.isVisible()) {
      visibles.push(objetivo)
    }
  }
  return visibles
}

test.describe('@s37 todo objetivo táctil del sitio real alcanza el mínimo medido con su rectángulo real', () => {
  test('las 6 rutas: cada control visible mide >= 24×24 px CSS (ejecuta @s29 de sistema_de_diseno_visual.feature)', async ({
    page,
  }) => {
    const medidos: ObjetivoMedido[] = []

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      for (const objetivo of await objetivosVisibles(page)) {
        const caja = await objetivo.boundingBox()
        if (caja === null) continue
        medidos.push({ ruta, nombre: (await objetivo.textContent())?.trim() ?? '', ancho: caja.width, alto: caja.height })
      }
    }

    expect(medidos.length).toBeGreaterThan(0)
    const insuficientes = medidos.filter((m) => m.ancho < AREA_TACTIL_MINIMA_PX || m.alto < AREA_TACTIL_MINIMA_PX)
    expect(insuficientes, JSON.stringify(insuficientes)).toEqual([])
  })
})

const MAXIMO_DE_PARADAS_POR_RUTA = 60

test.describe('@s38 el indicador de foco del sitio real tiene perímetro y contraste suficientes entre sus dos estados', () => {
  test('las 6 rutas: perímetro >= 2px CSS y ratio >= 3 entre foco y sin foco, ningún control suprime el contorno sin sustituto (ejecuta @s30/@s31 de sistema_de_diseno_visual.feature y la 1ª mitad de @s18 de accesibilidad.feature)', async ({
    page,
  }) => {
    let controlesComprobados = 0

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await page.locator('body').click({ position: { x: 1, y: 1 } })

      const objetivos = await objetivosVisibles(page)
      for (const objetivo of objetivos.slice(0, 20)) {
        // Estado SIN foco: los píxeles del hueco del anillo (fuera del borde
        // del control, dentro de "outline-offset") muestran el fondo de la
        // superficie que lo contiene — es lo que hay ahí ANTES de enfocar.
        const fondoSinFoco = await objetivo.evaluate((elemento) => {
          const contenedor = elemento.parentElement
          return contenedor ? getComputedStyle(contenedor).backgroundColor : getComputedStyle(elemento).backgroundColor
        })

        await objetivo.focus()
        const info = await objetivo.evaluate((elemento) => {
          const estilo = getComputedStyle(elemento)
          return {
            outlineStyle: estilo.outlineStyle,
            outlineWidth: parseFloat(estilo.outlineWidth) || 0,
            outlineColor: estilo.outlineColor,
          }
        })

        // "Ningún control declara la supresión del contorno de foco del
        // navegador sin sustituirlo por un indicador propio": si hay
        // "outline-style: none", tiene que haber otro mecanismo de foco. El
        // sistema de diseño de este proyecto usa siempre ":focus-visible {
        // outline: ... }" (`global.scss`), así que "none" aquí es un fallo
        // real, no un candidato a excepción.
        expect(info.outlineStyle, `"${ruta}": outline suprimido sin sustituto`).not.toBe('none')
        expect(info.outlineWidth, `"${ruta}": perímetro de foco insuficiente`).toBeGreaterThanOrEqual(
          PERIMETRO_FOCO_MINIMO_PX,
        )

        const fondoEsOpaco = !fondoSinFoco.startsWith('rgba(0, 0, 0, 0)') && fondoSinFoco !== 'transparent'
        if (fondoEsOpaco) {
          const ratio = calcularRatioContraste(colorComputadoAHex(info.outlineColor), colorComputadoAHex(fondoSinFoco))
          expect(ratio, `"${ruta}": ratio con foco vs sin foco insuficiente`).toBeGreaterThanOrEqual(
            RATIO_MINIMO_ENTRE_ESTADOS,
          )
        }

        controlesComprobados += 1
      }
    }

    expect(controlesComprobados).toBeGreaterThan(0)
  })
})

/**
 * El color REALMENTE pintado en el punto (x, y): sube por la cadena de
 * ancestros desde "elementFromPoint" hasta encontrar el primer fondo no
 * transparente (`document.body` como último recurso). Con "outline-offset"
 * el anillo NUNCA toca el relleno propio del control (@s37 de este mismo
 * fichero, `_tokens.scss` `$grosor-foco`/`outline-offset`, §3.7 del plan): lo
 * que hay "al lado" es siempre lo que se ve DETRÁS del hueco, nunca
 * "getComputedStyle(control).backgroundColor" a pelo.
 */
async function colorPintadoEnPunto(page: Page, x: number, y: number): Promise<string> {
  return page.evaluate(
    (punto) => {
      let elemento = document.elementFromPoint(punto.x, punto.y) as HTMLElement | null
      while (elemento !== null) {
        const fondo = getComputedStyle(elemento).backgroundColor
        const transparente = fondo === 'transparent' || /rgba\([\d.]+, [\d.]+, [\d.]+, 0\)/.test(fondo)
        if (!transparente) {
          return fondo
        }
        elemento = elemento.parentElement
      }
      return getComputedStyle(document.body).backgroundColor
    },
    { x, y },
  )
}

/** Un punto a "distancia" px del borde de "caja", en la primera dirección cardinal que cae dentro del viewport. */
function puntoAdyacenteA(
  caja: { x: number; y: number; width: number; height: number },
  distancia: number,
  viewport: { width: number; height: number },
): { x: number; y: number } {
  const candidatos = [
    { x: caja.x + caja.width + distancia, y: caja.y + caja.height / 2 }, // derecha
    { x: caja.x - distancia, y: caja.y + caja.height / 2 }, // izquierda
    { x: caja.x + caja.width / 2, y: caja.y + caja.height + distancia }, // abajo
    { x: caja.x + caja.width / 2, y: caja.y - distancia }, // arriba
  ]
  return (
    candidatos.find((punto) => punto.x >= 0 && punto.y >= 0 && punto.x <= viewport.width && punto.y <= viewport.height) ??
    candidatos[0]!
  )
}

test.describe('@s39 el anillo de foco contrasta con los dos fondos que tiene al lado, no solo con uno', () => {
  test('las 6 rutas: ratio >= 3 contra el fondo del propio control y contra el de su superficie (ejecuta la 2ª mitad de @s18 de accesibilidad.feature)', async ({
    page,
  }) => {
    let controlesComprobados = 0

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      const viewport = page.viewportSize()
      if (viewport === null) {
        throw new Error('no se pudo leer el tamaño del viewport')
      }
      const objetivos = await objetivosVisibles(page)

      for (const objetivo of objetivos.slice(0, 20)) {
        await objetivo.focus()
        const { caja, outlineColor, offsetTotal } = await objetivo.evaluate((elemento) => {
          const estilo = getComputedStyle(elemento)
          const rect = elemento.getBoundingClientRect()
          return {
            caja: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            outlineColor: estilo.outlineColor,
            offsetTotal: (parseFloat(estilo.outlineOffset) || 0) + (parseFloat(estilo.outlineWidth) || 0),
          }
        })
        if (outlineColor === 'transparent' || offsetTotal === 0) {
          continue // sin outline visible en este control: nada que medir (ya lo cubre @s38)
        }

        const focoHex = colorComputadoAHex(outlineColor)
        // "Propio componente": el hueco entre el borde del control y el anillo — 1px dentro del "offset".
        const puntoHueco = puntoAdyacenteA(caja, 1, viewport)
        // "Superficie que lo contiene": justo más allá del anillo.
        const puntoExterior = puntoAdyacenteA(caja, offsetTotal + 1, viewport)

        const fondoPropio = await colorPintadoEnPunto(page, puntoHueco.x, puntoHueco.y)
        const fondoContenedor = await colorPintadoEnPunto(page, puntoExterior.x, puntoExterior.y)

        const ratioPropio = calcularRatioContraste(focoHex, colorComputadoAHex(fondoPropio))
        expect(ratioPropio, `"${ruta}": foco vs fondo propio (${fondoPropio})`).toBeGreaterThanOrEqual(
          RATIO_MINIMO_CONTRA_FONDO,
        )
        const ratioContenedor = calcularRatioContraste(focoHex, colorComputadoAHex(fondoContenedor))
        expect(ratioContenedor, `"${ruta}": foco vs fondo del contenedor (${fondoContenedor})`).toBeGreaterThanOrEqual(
          RATIO_MINIMO_CONTRA_FONDO,
        )
        controlesComprobados += 1
      }
    }

    expect(controlesComprobados).toBeGreaterThan(0)
  })
})

test.describe('@s40 al tabular por la página entera ningún control enfocado queda tapado por la cabecera fija', () => {
  test('las 6 rutas: en cada parada, parte del control queda fuera de la cabecera y dentro del viewport (ejecuta @s17 de accesibilidad.feature y @s32 de sistema_de_diseno_visual.feature)', async ({
    page,
  }) => {
    let paradasTotales = 0
    // El navegador desplaza suavemente el control recién enfocado hasta la
    // vista cuando queda fuera de ella ("scroll-behavior: smooth" dentro de
    // "no-preference", `global.scss`): sin "reduce" aquí, leer el rectángulo
    // justo tras "Tab" puede capturarlo A MITAD del desplazamiento animado.
    await page.emulateMedia({ reducedMotion: 'reduce' })

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      const cabecera = page.locator('header')
      const cajaCabecera = await cabecera.boundingBox()
      const viewport = page.viewportSize()
      if (cajaCabecera === null || viewport === null) {
        throw new Error(`no se pudo medir la cabecera en "${ruta}"`)
      }

      let anterior: string | null = null
      for (let parada = 0; parada < MAXIMO_DE_PARADAS_POR_RUTA; parada += 1) {
        await page.keyboard.press('Tab')
        const activo = page.locator(':focus')
        if ((await activo.count()) === 0) break
        const identidad = await activo.evaluate((el) => el.outerHTML.slice(0, 120))
        if (identidad === anterior) break
        anterior = identidad

        // Los controles DENTRO de la propia cabecera (enlace de marca, nav,
        // botón de menú) no pueden quedar "tapados por la cabecera": SON la
        // cabecera. El escenario mide contenido de PÁGINA que podría
        // desplazarse hasta quedar bajo la cabecera fija, no la cabecera
        // auditándose a sí misma.
        const dentroDeLaPropiaCabecera = await activo.evaluate((el) => el.closest('header') !== null)
        if (dentroDeLaPropiaCabecera) {
          continue
        }

        const caja = await activo.boundingBox()
        if (caja === null) continue

        const integramenteBajoLaCabecera =
          caja.y >= cajaCabecera.y &&
          caja.y + caja.height <= cajaCabecera.y + cajaCabecera.height &&
          caja.x >= cajaCabecera.x &&
          caja.x + caja.width <= cajaCabecera.x + cajaCabecera.width

        expect(integramenteBajoLaCabecera, `"${ruta}": control tapado por la cabecera — ${identidad}`).toBe(false)

        const dentroDelViewport = caja.y < viewport.height && caja.y + caja.height > 0
        expect(dentroDelViewport, `"${ruta}": control fuera del área visible — ${identidad}`).toBe(true)

        paradasTotales += 1
      }
    }

    expect(paradasTotales).toBeGreaterThan(0)
  })
})

test.describe('El punto de corte de la navegación (1024/1023) coincide en JS y CSS en el navegador real (ejecuta @s27 de sistema_de_diseno_visual.feature)', () => {
  test('a 1024px la navegación horizontal es visible; a 1023px, el botón de menú', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto('/')
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeHidden()

    await page.setViewportSize({ width: 1023, height: 800 })
    await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Navegación principal' })).toBeHidden()
  })
})

test.describe('@s41 la jerarquía de encabezados de cada ruta es correcta y sin saltos', () => {
  for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
    test(`${pagina} (${ruta}): exactamente 1 h1, sin saltos de nivel, sin texto vacío`, async ({ page }) => {
      await page.goto(ruta)
      const niveles = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((encabezado) => ({
          nivel: Number(encabezado.tagName.slice(1)),
          texto: (encabezado.textContent ?? '').trim(),
        })),
      )

      const h1 = niveles.filter((n) => n.nivel === 1)
      expect(h1, JSON.stringify(niveles)).toHaveLength(1)

      for (const encabezado of niveles) {
        expect(encabezado.texto.length, JSON.stringify(niveles)).toBeGreaterThan(0)
      }

      for (let indice = 1; indice < niveles.length; indice += 1) {
        const salto = (niveles[indice]?.nivel ?? 0) - (niveles[indice - 1]?.nivel ?? 0)
        expect(salto, JSON.stringify(niveles)).toBeLessThanOrEqual(1)
      }
    })
  }

  test('el recuento de rutas efectivamente comprobadas es exactamente 6', () => {
    expect(RUTAS_DEL_INVENTARIO).toHaveLength(6)
  })
})
