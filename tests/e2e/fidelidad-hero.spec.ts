// `features/fidelidad_hero.feature` @s1-@s3 y `features/rediseno_visual.feature`
// @s33 (la puerta del recuento de rótulos en mayúsculas), enmendados por la
// feature 48 (`hero_reducido_con_animacion`). NAVEGADOR REAL con Playwright,
// sobre `dist/` servido por `vite preview` (`playwright.config.ts`).
//
// MEDIR CON LA ENTRADA YA TERMINADA O CON MOVIMIENTO REDUCIDO (@s10 de la 48,
// vía (b)): la portada se carga con `reduce` emulado ANTES del `goto`, dentro de
// `cargarPortada`, así que ninguna caja se mide mientras se mueve. Es el mismo
// estado final que mide la vía (a), porque @s5 y @s7 de la 48 afirman que la
// entrada termina en el estado base.
import { expect, test, type Locator, type Page } from 'playwright/test'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const ANCHO_ESCRITORIO_PX = 1440
const ANCHO_PORTATIL_PX = 1024
const ANCHO_MOVIL_PX = 375
const ANCHO_MINIMO_PX = 320
const ALTO_DE_VENTANA_PX = 900
const TOLERANCIA_DE_BORDE_PX = 1
const TOLERANCIA_DE_CAJA_PX = 2
const AREA_TACTIL_MINIMA_PX = 44

/** El mismo selector de la marca que usa `fidelidad-cabecera.spec.ts`: el enlace de la marca dentro de la cabecera. */
const SELECTOR_MARCA = '[data-cabecera-interior] a[href="#inicio"]'

interface Caja {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

async function cajaDe(locator: Locator): Promise<Caja> {
  return locator.evaluate((elemento) => {
    const { x, y, width, height } = elemento.getBoundingClientRect()
    return { x, y, width, height }
  })
}

/** Carga la portada con movimiento reducido emulado ANTES de navegar y con las fuentes ya resueltas. */
async function cargarPortada(page: Page, ancho: number): Promise<Locator> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: ancho, height: ALTO_DE_VENTANA_PX })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  await page.evaluate(() => document.fonts.ready)
  return page.locator('#inicio [data-a-sangre]')
}

function titularDe(hero: Locator): Locator {
  return hero.getByRole('heading', { level: 1 })
}

function parrafoDe(hero: Locator): Locator {
  return hero.locator('p')
}

function botonDe(hero: Locator): Locator {
  return hero.getByRole('link', { name: 'Reservar cita' })
}

/** Las etiquetas de los elementos visibles de la sección que llevan texto propio o son interactivos. */
async function elementosDeContenidoVisibles(hero: Locator): Promise<readonly string[]> {
  return hero.evaluate((seccion) => {
    const interactivos = 'a, button, input, select, textarea, summary, [tabindex], [contenteditable]'
    const tieneTextoPropio = (elemento: Element): boolean =>
      [...elemento.childNodes].some(
        (nodo) => nodo.nodeType === Node.TEXT_NODE && (nodo.textContent ?? '').trim() !== '',
      )
    return [...seccion.querySelectorAll('*')]
      .filter((elemento) => elemento.checkVisibility() && (tieneTextoPropio(elemento) || elemento.matches(interactivos)))
      .map((elemento) => elemento.tagName)
  })
}

/**
 * Cuenta los elementos de la sección con `text-transform: uppercase` y un
 * espaciado entre letras POSITIVO (el rótulo corto en versalitas), y cuántos
 * recorrió. Va en la página: usa el estilo COMPUTADO, que es lo que ve la
 * persona. Una función sin nada de fuera, para que Playwright la serialice.
 */
function contarRotulosEnMayusculas(seccion: Element): { recorridos: number; enMayusculas: number } {
  const elementos = [seccion, ...seccion.querySelectorAll('*')]
  const enMayusculas = elementos.filter((elemento) => {
    const estilo = getComputedStyle(elemento)
    return estilo.textTransform === 'uppercase' && Number.parseFloat(estilo.letterSpacing) > 0
  })
  return { recorridos: elementos.length, enMayusculas: enMayusculas.length }
}

/**
 * Los fondos de imagen de un tercero que declaran las reglas aplicadas a la
 * sección: el `background-image` COMPUTADO de cada elemento y de sus dos
 * pseudoelementos, y el texto de cada regla de las hojas de estilo que le afecta
 * (`hero.feature` @s14). El valor computado siempre sale como URL absoluta, así
 * que «de un tercero» es «de un origen distinto del de la página» o «de
 * images.pexels.com», no «empieza por http». Devuelve también cuántas hojas y
 * cuántos elementos recorrió, para que un recuento 0 no pase por limpio. Sin nada
 * de fuera: Playwright serializa la función.
 */
function auditarFondosDeTerceros(seccion: Element): { hojas: number; elementos: number; terceros: string[] } {
  const terceros: string[] = []
  const urlsDe = (valor: string): string[] =>
    [...valor.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((coincidencia) => coincidencia[1] as string)
  const esDeTercero = (url: string): boolean => {
    try {
      return new URL(url, location.href).origin !== location.origin || url.includes('images.pexels.com')
    } catch {
      return true
    }
  }

  const elementos = [seccion, ...seccion.querySelectorAll('*')]
  for (const elemento of elementos) {
    for (const pseudoelemento of [null, '::before', '::after']) {
      const computado = getComputedStyle(elemento, pseudoelemento).backgroundImage
      terceros.push(...urlsDe(computado).filter(esDeTercero))
    }
  }

  const reglasDeTodasLasHojas = (reglas: CSSRuleList, acumuladas: CSSRule[] = []): CSSRule[] => {
    for (const regla of reglas) {
      acumuladas.push(regla)
      if (regla instanceof CSSGroupingRule) {
        reglasDeTodasLasHojas(regla.cssRules, acumuladas)
      }
    }
    return acumuladas
  }
  const afectaALaSeccion = (selector: string): boolean => {
    try {
      const sinPseudoelemento = selector.replace(/::?(before|after)/g, '')
      return seccion.matches(sinPseudoelemento) || seccion.querySelector(sinPseudoelemento) !== null
    } catch {
      return false
    }
  }
  for (const hoja of document.styleSheets) {
    for (const regla of reglasDeTodasLasHojas(hoja.cssRules)) {
      if ('selectorText' in regla && afectaALaSeccion(regla.selectorText as string)) {
        terceros.push(...urlsDe(regla.cssText).filter(esDeTercero))
      }
    }
  }

  return { hojas: document.styleSheets.length, elementos: elementos.length, terceros }
}

test.describe('@s14 de hero: ninguna hoja de estilo de la sección apunta a un fondo de imagen de un tercero', () => {
  test('las reglas aplicadas a la bienvenida no declaran ningún origen externo ni "images.pexels.com", y se inspeccionan hojas y elementos de verdad', async ({
    page,
  }) => {
    const hero = await cargarPortada(page, ANCHO_ESCRITORIO_PX)

    const { hojas, elementos, terceros } = await hero.evaluate(auditarFondosDeTerceros)

    expect(hojas).toBeGreaterThan(0)
    expect(elementos).toBeGreaterThan(0)
    expect(terceros).toEqual([])
  })

  test('la comprobación muerde: un fondo de "images.pexels.com", de otro origen o con "//" se detecta en el valor computado y en la regla', async ({
    page,
  }) => {
    // Sin red: las peticiones de las imágenes de prueba no deben salir del navegador. El hero sintético se
    // monta DENTRO de la portada real, para que la página tenga el origen del sitio (en una página en
    // blanco no lo tiene y una ruta propia contaría como de un tercero).
    await page.route(/pexels|example\.com/, (ruta) => ruta.abort())
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.evaluate((html) => {
      document.body.innerHTML = html
    }, `
      <style>
        .a { background-image: url(https://images.pexels.com/foto.jpg); }
        .b::after { content: ''; background-image: url("//cdn.example.com/b.png"); }
        .c { background-image: url(/img/propia.webp); }
      </style>
      <section><div class="a"></div><p class="b"></p><span class="c"></span></section>`)

    const { terceros } = await page.locator('section').evaluate(auditarFondosDeTerceros)

    expect(terceros.length).toBeGreaterThanOrEqual(2)
    expect(terceros.some((url) => url.includes('images.pexels.com'))).toBe(true)
    expect(terceros.some((url) => url.includes('cdn.example.com'))).toBe(true)
    expect(terceros.some((url) => url.includes('/img/propia.webp'))).toBe(false)
  })
})

test.describe('@s1 de fidelidad_hero: titular, párrafo y una única acción, alineados a la izquierda', () => {
  test('a 1440px los tres únicos elementos de contenido arrancan a ras de la marca de la cabecera, con "text-align" no centrado y la acción con relleno', async ({
    page,
  }) => {
    const hero = await cargarPortada(page, ANCHO_ESCRITORIO_PX)
    const titular = titularDe(hero)
    const parrafo = parrafoDe(hero)
    const boton = botonDe(hero)

    expect(await elementosDeContenidoVisibles(hero)).toEqual(['H1', 'P', 'A'])

    const marca = await cajaDe(page.locator(SELECTOR_MARCA))
    for (const [nombre, elemento] of [
      ['titular', titular],
      ['párrafo', parrafo],
      ['botón', boton],
    ] as const) {
      const caja = await cajaDe(elemento)
      expect(
        Math.abs(caja.x - marca.x),
        `${nombre}: borde izquierdo ${caja.x} frente al de la marca ${marca.x}`,
      ).toBeLessThanOrEqual(TOLERANCIA_DE_BORDE_PX)
    }

    for (const elemento of [titular, parrafo]) {
      const alineacion = await elemento.evaluate((nodo) => getComputedStyle(nodo).textAlign)
      expect(['start', 'left']).toContain(alineacion)
    }
  })

  for (const ancho of [ANCHO_PORTATIL_PX, ANCHO_MOVIL_PX]) {
    test(`a ${ancho}px los tres comparten borde izquierdo y es el del contenido de la sección de servicios`, async ({
      page,
    }) => {
      const hero = await cargarPortada(page, ancho)
      const servicios = await cajaDe(page.locator('#servicios > *'))

      for (const elemento of [titularDe(hero), parrafoDe(hero), botonDe(hero)]) {
        const caja = await cajaDe(elemento)
        expect(Math.abs(caja.x - servicios.x)).toBeLessThanOrEqual(TOLERANCIA_DE_BORDE_PX)
      }
    })
  }

  test('la botonera tiene exactamente una acción hacia "#reservar", con relleno horizontal y sin cortar su texto, y la sección conserva su ancho completo', async ({
    page,
  }) => {
    const hero = await cargarPortada(page, ANCHO_ESCRITORIO_PX)
    const acciones = hero.locator('[data-hero-acciones]')

    await expect(acciones.getByRole('link')).toHaveCount(1)
    await expect(hero.getByRole('link')).toHaveCount(1)
    const boton = botonDe(acciones)
    await expect(boton).toHaveAttribute('href', '#reservar')
    const caja = await cajaDe(boton)
    const relleno = await boton.evaluate((elemento) => getComputedStyle(elemento).paddingInlineStart)
    expect(caja.width).toBeGreaterThan(AREA_TACTIL_MINIMA_PX)
    expect(Number.parseFloat(relleno)).toBeGreaterThan(0)
    expect(await boton.evaluate((elemento) => elemento.scrollWidth <= elemento.clientWidth)).toBe(true)

    const cajaHero = await cajaDe(hero)
    expect(cajaHero.x).toBeCloseTo(0, 0)
    expect(cajaHero.width).toBe(ANCHO_ESCRITORIO_PX)
  })
})

test.describe('@s2 de fidelidad_hero: el hero se ve completo, sin recortar contenido ni mostrar ninguna cifra', () => {
  test('el botón termina dentro del hero, el hero no recorta en vertical y su texto no contiene ningún dígito', async ({
    page,
  }) => {
    const hero = await cargarPortada(page, ANCHO_ESCRITORIO_PX)

    const cajaHero = await cajaDe(hero)
    const cajaBoton = await cajaDe(botonDe(hero))
    expect(cajaBoton.y + cajaBoton.height).toBeLessThanOrEqual(cajaHero.y + cajaHero.height + TOLERANCIA_DE_CAJA_PX)
    expect(await hero.evaluate((elemento) => elemento.scrollHeight <= elemento.clientHeight)).toBe(true)

    const texto = await hero.evaluate((elemento) => elemento.textContent ?? '')
    expect(texto.trim().length).toBeGreaterThan(0)
    expect(texto).not.toMatch(/\d/)
    expect(await hero.evaluate((elemento) => (elemento as HTMLElement).innerText)).not.toMatch(/\d/)
  })
})

test.describe('@s3 de fidelidad_hero: el hero se adapta a móvil sin ocultar la acción ni crear una barra horizontal', () => {
  test('a 320px el titular, el párrafo y el botón son visibles y alcanzables, caben de 0 a 320 y el documento no desborda', async ({
    page,
  }) => {
    const hero = await cargarPortada(page, ANCHO_MINIMO_PX)

    for (const elemento of [titularDe(hero), parrafoDe(hero), botonDe(hero)]) {
      await expect(elemento).toBeVisible()
      const caja = await cajaDe(elemento)
      expect(caja.x).toBeGreaterThanOrEqual(0)
      expect(caja.x + caja.width).toBeLessThanOrEqual(ANCHO_MINIMO_PX)
    }
    // "Alcanzable": una pulsación de prueba llega al botón (visible, estable y sin nada encima).
    await botonDe(hero).click({ trial: true })

    const dimensiones = await page.evaluate(() => ({
      documento: document.documentElement.scrollWidth,
      ventana: window.innerWidth,
    }))
    expect(dimensiones.documento).toBeLessThanOrEqual(dimensiones.ventana)
  })
})

test.describe('@s33 de rediseno_visual: la bienvenida no lleva ningún rótulo corto en mayúsculas', () => {
  test('dentro de la sección de bienvenida hay 0 elementos con "text-transform: uppercase" y espaciado entre letras positivo', async ({
    page,
  }) => {
    const hero = await cargarPortada(page, ANCHO_ESCRITORIO_PX)

    const { recorridos, enMayusculas } = await hero.evaluate(contarRotulosEnMayusculas)

    expect(recorridos).toBeGreaterThan(0)
    expect(enMayusculas).toBe(0)
  })

  test('la comprobación muerde: sobre un hero sintético que aún lleve el rótulo de ubicación el recuento sale mayor que 0, y un titular con espaciado negativo no cuenta', async ({
    page,
  }) => {
    await page.setContent(`
      <section>
        <p style="text-transform: uppercase; letter-spacing: 0.1em">Rótulo corto</p>
        <h1 style="letter-spacing: -0.02em">Titular</h1>
        <p style="text-transform: uppercase; letter-spacing: normal">Mayúsculas sin espaciado</p>
        <p style="letter-spacing: 0.1em">Espaciado sin mayúsculas</p>
      </section>`)

    const { recorridos, enMayusculas } = await page.locator('section').evaluate(contarRotulosEnMayusculas)

    expect(recorridos).toBeGreaterThan(0)
    expect(enMayusculas).toBe(1)
  })
})
