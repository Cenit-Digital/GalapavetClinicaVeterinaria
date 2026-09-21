import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_MOVIL_PX = 320
const TOLERANCIA_PX = 1
// Los recuentos que fija `features/pie_de_pagina.feature` @s2 desde el
// 20/09/2026: 4 ("Clínica") + 4 ("Contenido") + 3 ("Contacto") = 11.
const ENLACES_DE_UNA_COLUMNA_LARGA = 4
const ENLACES_DE_LA_COLUMNA_CORTA = 3
const ENLACES_DE_COLUMNA_DEL_PIE = 11
// Blink resuelve las pistas de rejilla y las cajas en LayoutUnit, que es 1/64
// de pixel CSS. Dos pistas `1fr` del MISMO reparto pueden devolver anchos que
// difieren en ese ultimo 1/64: medido a 1440px, 215.203125 frente a 215.1875.
// La tolerancia es ESA unidad de redondeo del motor, no un margen de diseno;
// cualquier diferencia real de maquetacion es ordenes de magnitud mayor y
// sigue cayendo. A 320, 700, 701, 1023 y 1024px la igualdad es exacta.
const TOLERANCIA_SUBPIXEL_PX = 1 / 64

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

async function cargarPie(page: Page, ancho: number): Promise<Locator> {
  await page.setViewportSize({ width: ancho, height: 900 })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  return page.getByRole('contentinfo')
}

async function colorDeToken(page: Page, token: string): Promise<string> {
  return page.evaluate((nombre) => {
    const sonda = document.createElement('span')
    sonda.style.color = `var(${nombre})`
    document.body.append(sonda)
    const color = getComputedStyle(sonda).color
    sonda.remove()
    return color
  }, token)
}

test.describe('@s1 de fidelidad_pie: marca y tres columnas alineadas', () => {
  test('a 1440px la marca y Clínica, Contenido y Contacto comparten fila, la marca es más ancha y logo y Galapavet comparten línea', async ({ page }) => {
    const pie = await cargarPie(page, ANCHO_ESCRITORIO_PX)
    const superior = pie.locator('[data-pie-superior]')
    const marca = superior.locator('[data-pie-marca]')
    const columnas = superior.locator('[data-pie-columna]')
    await expect(columnas).toHaveCount(3)
    await expect(columnas.locator('h3')).toHaveText(['Clínica', 'Contenido', 'Contacto'])

    const cajaMarca = await cajaDe(marca)
    const cajasColumnas = await columnas.evaluateAll((elementos) =>
      elementos.map((elemento) => {
        const { x, y, width, height } = elemento.getBoundingClientRect()
        return { x, y, width, height }
      }),
    )
    for (const caja of cajasColumnas) {
      expect(Math.abs(caja.y - cajaMarca.y)).toBeLessThanOrEqual(TOLERANCIA_PX)
      expect(cajaMarca.width).toBeGreaterThan(caja.width)
    }

    const cabeceraMarca = marca.locator('[data-pie-marca-cabecera]')
    const logo = cabeceraMarca.locator('img')
    const nombre = cabeceraMarca.getByText('Galapavet')
    const cajaLogo = await cajaDe(logo)
    const cajaNombre = await cajaDe(nombre)
    expect(Math.abs(cajaLogo.y + cajaLogo.height / 2 - (cajaNombre.y + cajaNombre.height / 2))).toBeLessThanOrEqual(
      TOLERANCIA_PX,
    )
  })
})

test.describe('@s2 y @s3 de fidelidad_pie: enlaces y barra legal legibles', () => {
  test('los enlaces de columna no se subrayan en reposo, cambian a primario al hover y los legales quedan en línea con aviso solo accesible', async ({ page }) => {
    const pie = await cargarPie(page, ANCHO_ESCRITORIO_PX)
    const enlace = pie.locator('[data-pie-columna]').first().getByRole('link').first()
    expect(await enlace.evaluate((nodo) => getComputedStyle(nodo).textDecorationLine)).toBe('none')
    await enlace.hover()
    expect(await enlace.evaluate((nodo) => getComputedStyle(nodo).color)).toBe(await colorDeToken(page, '--color-primario'))

    const barra = pie.locator('[data-pie-barra-legal]')
    const copyright = barra.getByText(/^© \d{4} Galapavet$/)
    const legales = barra.getByRole('list', { name: 'Enlaces legales' }).getByRole('link')
    await expect(legales).toHaveCount(3)
    const cajaCopyright = await cajaDe(copyright)
    const cajasLegales = await legales.evaluateAll((elementos) =>
      elementos.map((elemento) => {
        const { x, y, width, height } = elemento.getBoundingClientRect()
        return { x, y, width, height }
      }),
    )
    expect(cajasLegales[0]?.x ?? 0).toBeGreaterThan(cajaCopyright.x + cajaCopyright.width)
    for (const caja of cajasLegales) expect(Math.abs(caja.y - cajaCopyright.y)).toBeLessThanOrEqual(TOLERANCIA_PX)
    for (let indice = 0; indice < 3; indice += 1) {
      const legal = legales.nth(indice)
      await expect(legal).toHaveAccessibleName(/se abre en una ventana nueva/)
      const aviso = legal.locator('span')
      const cajaAviso = await cajaDe(aviso)
      expect(cajaAviso.width).toBe(1)
      expect(cajaAviso.height).toBe(1)
      expect(await aviso.evaluate((nodo) => getComputedStyle(nodo).position)).toBe('absolute')
    }
  })
})

test.describe('@s4 de fidelidad_pie: apilado móvil', () => {
  test('a 320px el logotipo local queda cargado y la marca y columnas se apilan sin desbordar', async ({ page }) => {
    const pie = await cargarPie(page, ANCHO_MOVIL_PX)
    const logo = pie.locator('[data-pie-marca] img')
    await logo.scrollIntoViewIfNeeded()
    await expect(logo).toHaveJSProperty('naturalWidth', 201)
    const cajas = await pie.locator('[data-pie-superior] > *').evaluateAll((elementos) =>
      elementos.map((elemento) => ({ y: elemento.getBoundingClientRect().y, x: elemento.getBoundingClientRect().x })),
    )
    expect(cajas[1]?.y ?? 0).toBeGreaterThan(cajas[0]?.y ?? 0)
    const medidas = await page.evaluate(() => ({ documento: document.documentElement.scrollWidth, ventana: window.innerWidth }))
    expect(medidas.documento).toBeLessThanOrEqual(medidas.ventana + TOLERANCIA_PX)
  })
})

// ============================================================================
// @s2 de `pie_de_pagina`: las tres cláusulas de las LEYES DE UI/UX
// ============================================================================
// Añadidas el 20/09/2026 con E2 (hallazgo A-4 de
// `progress/auditoria_orquestador_20260920.md`). El pie queda 4-4-3 y Pablo lo
// ratificó CON UNA CONDICIÓN: que siga cumpliendo las leyes de UI/UX. Las
// mediciones que demuestran que hoy las cumple están en
// `progress/pie_4-4-3_leyes_uiux_20260920.md`; estos tres tests las convierten
// en puerta, para que nadie "arregle" la asimetría estrechando la columna
// corta, cambiándole el espaciado o dando otro estilo a sus tres enlaces.
//
// Los seis anchos son los DOS LADOS de cada punto de corte del pie
// (`PieDePagina.module.scss:139` y `:156`) y sus extremos.
//
// TODO ES COMPARATIVO: columna contra columna, último contra primero, columna
// corta contra sus hermanas. Nunca contra un número escrito a mano, porque el
// ancho de columna cambia con el viewport y con la tipografía y un test que lo
// congele miente. El SCSS del pie NO se toca: esto es una red, no un encargo.
const ANCHOS_DE_PUNTO_DE_CORTE_PX = [320, 700, 701, 1023, 1024, 1440] as const

const TITULOS_DE_COLUMNA = ['Clínica', 'Contenido', 'Contacto'] as const

/** La columna que E2 deja con 3 enlaces, frente a sus dos hermanas de 4. */
const TITULO_DE_LA_COLUMNA_CORTA = 'Contacto'

interface MedidaDeColumna {
  readonly titulo: string
  readonly ancho: number
  readonly anchoDesplazable: number
  readonly anchoVisible: number
  readonly separaciones: readonly number[]
  readonly estilosDeEnlace: readonly string[]
  readonly altosMinimos: readonly number[]
}

/**
 * Mide las tres columnas de enlaces del pie en el ancho dado: su caja, su
 * desbordamiento, la separación vertical entre elementos consecutivos de su
 * lista, y el par tamaño-color y el alto mínimo de cada enlace.
 */
async function medirColumnasDelPie(page: Page, ancho: number): Promise<MedidaDeColumna[]> {
  const pie = await cargarPie(page, ancho)
  return pie.locator('[data-pie-columna]').evaluateAll((columnas) =>
    columnas.map((columna) => {
      const elementos = [...columna.querySelectorAll('li')]
      const cajas = elementos.map((elemento) => elemento.getBoundingClientRect())
      const enlaces = elementos.map((elemento) => elemento.querySelector('a'))
      const estilos = enlaces.map((enlace) => (enlace === null ? null : getComputedStyle(enlace)))
      return {
        titulo: columna.querySelector('h3')?.textContent ?? '',
        ancho: columna.getBoundingClientRect().width,
        anchoDesplazable: columna.scrollWidth,
        anchoVisible: columna.clientWidth,
        separaciones: cajas.slice(1).map((caja, indice) => caja.top - (cajas[indice]?.bottom ?? 0)),
        estilosDeEnlace: estilos.map((estilo) => (estilo === null ? 'sin enlace' : `${estilo.fontSize}|${estilo.color}`)),
        altosMinimos: estilos.map((estilo) => (estilo === null ? Number.NaN : Number.parseFloat(estilo.minHeight))),
      }
    }),
  )
}

test.describe('@s2 de pie_de_pagina: Ley de Proximidad y Ley de Conectividad Uniforme', () => {
  test('en los seis anchos las tres columnas miden lo mismo entre sí, ninguna desborda y la separación entre enlaces es idéntica en las tres', async ({
    page,
  }) => {
    for (const ancho of ANCHOS_DE_PUNTO_DE_CORTE_PX) {
      const columnas = await medirColumnasDelPie(page, ancho)
      expect(columnas.map((columna) => columna.titulo), `columnas a ${ancho}px`).toEqual([...TITULOS_DE_COLUMNA])

      const anchoDeReferencia = columnas[0]?.ancho ?? 0
      expect(anchoDeReferencia, `la columna de referencia tiene ancho a ${ancho}px`).toBeGreaterThan(0)

      const separaciones: number[] = []
      for (const columna of columnas) {
        expect(
          Math.abs(columna.ancho - anchoDeReferencia),
          `"${columna.titulo}" mide lo mismo que sus hermanas a ${ancho}px`,
        ).toBeLessThanOrEqual(TOLERANCIA_SUBPIXEL_PX)
        expect(columna.anchoDesplazable, `"${columna.titulo}" no desborda su columna a ${ancho}px`).toBeLessThanOrEqual(
          columna.anchoVisible + TOLERANCIA_PX,
        )
        expect(columna.separaciones.length, `"${columna.titulo}" tiene enlaces consecutivos a ${ancho}px`).toBeGreaterThan(0)
        separaciones.push(...columna.separaciones)
      }

      const separacionDeReferencia = separaciones[0] ?? 0
      expect(separacionDeReferencia, `la separación entre enlaces es visible a ${ancho}px`).toBeGreaterThan(0)
      for (const separacion of separaciones) {
        expect(
          Math.abs(separacion - separacionDeReferencia),
          `separación idéntica en las tres columnas a ${ancho}px`,
        ).toBeLessThanOrEqual(TOLERANCIA_SUBPIXEL_PX)
      }
    }
  })
})

test.describe('@s2 de pie_de_pagina: Ley de la Semejanza', () => {
  test('en los seis anchos los 11 enlaces comparten un único par tamaño-color y el último de cada lista se dibuja como el primero de esa lista', async ({
    page,
  }) => {
    for (const ancho of ANCHOS_DE_PUNTO_DE_CORTE_PX) {
      const columnas = await medirColumnasDelPie(page, ancho)

      const estilos = columnas.flatMap((columna) => columna.estilosDeEnlace)
      expect(estilos.length, `enlaces de columna a ${ancho}px`).toBe(ENLACES_DE_COLUMNA_DEL_PIE)
      expect(new Set(estilos).size, `pares tamaño-color distintos a ${ancho}px`).toBe(1)

      for (const columna of columnas) {
        const primero = columna.estilosDeEnlace.at(0)
        const ultimo = columna.estilosDeEnlace.at(-1)
        expect(ultimo, `el último de "${columna.titulo}" se dibuja como el primero a ${ancho}px`).toBe(primero)
      }
    }
  })
})

test.describe('@s2 de pie_de_pagina: Ley de Fitts', () => {
  test('en los seis anchos los 11 enlaces comparten alto mínimo y el de la columna corta no es menor que el de sus hermanas de 4', async ({
    page,
  }) => {
    for (const ancho of ANCHOS_DE_PUNTO_DE_CORTE_PX) {
      const columnas = await medirColumnasDelPie(page, ancho)

      const altos = columnas.flatMap((columna) => columna.altosMinimos)
      expect(altos.length, `enlaces de columna a ${ancho}px`).toBe(ENLACES_DE_COLUMNA_DEL_PIE)
      const altoDeReferencia = altos[0] ?? 0
      expect(altoDeReferencia, `el alto mínimo es un objetivo real a ${ancho}px`).toBeGreaterThan(0)
      for (const alto of altos) {
        expect(alto, `alto mínimo compartido a ${ancho}px`).toBe(altoDeReferencia)
      }

      const corta = columnas.find((columna) => columna.titulo === TITULO_DE_LA_COLUMNA_CORTA)
      const hermanas = columnas.filter((columna) => columna.titulo !== TITULO_DE_LA_COLUMNA_CORTA)
      expect(corta?.altosMinimos.length, `la columna corta a ${ancho}px`).toBe(ENLACES_DE_LA_COLUMNA_CORTA)
      expect(hermanas.length, `las columnas hermanas a ${ancho}px`).toBe(2)

      const altoMinimoDeLaCorta = Math.min(...(corta?.altosMinimos ?? []))
      const altoMaximoDeLasHermanas = Math.max(...hermanas.flatMap((columna) => columna.altosMinimos))
      for (const hermana of hermanas) {
        expect(hermana.altosMinimos.length, `"${hermana.titulo}" conserva sus 4 enlaces a ${ancho}px`).toBe(
          ENLACES_DE_UNA_COLUMNA_LARGA,
        )
      }
      expect(altoMinimoDeLaCorta, `perder un ítem no encoge el objetivo a ${ancho}px`).toBeGreaterThanOrEqual(
        altoMaximoDeLasHermanas,
      )
    }
  })
})
