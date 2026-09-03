// @s27-@s31 de `features/identidad_visual.feature` (Bloque E: imágenes
// locales y la carpeta `public/`). NAVEGADOR REAL con Playwright.
import { expect, test, type Page } from 'playwright/test'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

const CADENA_BANCO_DE_IMAGENES = 'unsplash'

/**
 * Chromium solo dispara "loading=lazy" cuando el elemento entra cerca del
 * viewport, y el umbral de distancia no es determinista entre corridas: en
 * vez de simular scroll (probado, no fiable en la ruta "/", la más larga),
 * se fuerza "eager" en todas las imágenes diferidas y se espera a que el
 * navegador termine de decodificarlas ("img.complete"). No cambia lo que
 * @s30 comprueba (lee el atributo "loading" ANTES de esta llamada, en su
 * propio "describe", nunca después).
 */
async function cargarImagenesDiferidas(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((imagen) => imagen.setAttribute('loading', 'eager'))
  })
  await page.waitForFunction(() => Array.from(document.images).every((imagen) => imagen.complete))
}

test.describe('@s27 no hay ni una sola imagen rota en ninguna ruta del sitio real', () => {
  for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
    test(`${pagina} (${ruta}): toda "naturalWidth" > 0, ningún origen remoto`, async ({ page, baseURL }) => {
      await page.goto(ruta)
      await cargarImagenesDiferidas(page)

      const imagenes = await page.evaluate(() =>
        Array.from(document.images).map((imagen) => ({
          src: imagen.getAttribute('src') ?? '',
          naturalWidth: imagen.naturalWidth,
        })),
      )

      expect(imagenes.length).toBeGreaterThan(0)
      const rotas = imagenes.filter((imagen) => imagen.naturalWidth === 0)
      expect(rotas, `imágenes rotas en ${ruta}: ${JSON.stringify(rotas)}`).toEqual([])

      for (const imagen of imagenes) {
        expect(imagen.src.startsWith('http://')).toBe(false)
        expect(imagen.src.startsWith('https://')).toBe(false)
        expect(imagen.src.startsWith('//')).toBe(false)
        expect(imagen.src.toLowerCase()).not.toContain(CADENA_BANCO_DE_IMAGENES)
      }
      expect(baseURL).toBeTruthy()
    })
  }
})

test.describe('@s28 el icono del sitio responde y deja de dar 404', () => {
  test('favicon.ico, favicon-32.png (200) y apple-touch-icon.png (200, 180×180); el vector sigue comentado', async ({
    page,
    request,
    baseURL,
  }) => {
    const respuestaIco = await request.get(`${SUBPATH_DE_PRODUCCION}/favicon.ico`)
    expect(respuestaIco.status()).toBe(200)

    const respuesta32 = await request.get(`${SUBPATH_DE_PRODUCCION}/favicon-32.png`)
    expect(respuesta32.status()).toBe(200)

    const respuestaApple = await request.get(`${SUBPATH_DE_PRODUCCION}/apple-touch-icon.png`)
    expect(respuestaApple.status()).toBe(200)

    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const dimensionesApple = await page.evaluate(async (url) => {
      const imagen = new Image()
      imagen.src = url
      await imagen.decode()
      return { width: imagen.naturalWidth, height: imagen.naturalHeight }
    }, `${baseURL}apple-touch-icon.png`)
    expect(dimensionesApple).toEqual({ width: 180, height: 180 })

    // Ninguna etiqueta de icono ACTIVA del documento apunta a un 404.
    const enlacesDeIcono = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"], link[rel="apple-touch-icon"]')).map(
        (enlace) => enlace.getAttribute('href'),
      ),
    )
    for (const href of enlacesDeIcono) {
      if (href === null) continue
      const respuesta = await request.get(href)
      expect(respuesta.status(), `${href} respondió ${respuesta.status()}`).toBeLessThan(400)
    }

    // El icono vectorial aún no existe (PENDIENTE 8 del contrato): su <link> sigue comentado.
    const html = await request.get(`${SUBPATH_DE_PRODUCCION}/`).then((r) => r.text())
    expect(html).toContain('<!-- <link rel="icon" type="image/svg+xml"')
    expect(html).not.toMatch(/<link rel="icon" type="image\/svg\+xml"[^>]*>(?!.*-->)/)
  })
})

test.describe('@s29 la imagen de compartición existe, tiene el tamaño que exigen las redes y no es una foto de banco', () => {
  test('og:image responde 200, mide 1200×630, es PNG y no viene del banco de imágenes', async ({
    page,
    request,
    baseURL,
  }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const contenidoOgImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    if (contenidoOgImage === null) {
      throw new Error('no se encontró la etiqueta "og:image"')
    }
    expect(contenidoOgImage.toLowerCase()).not.toContain(CADENA_BANCO_DE_IMAGENES)

    // "og:image" es una URL ABSOLUTA (exigencia de ogp.me, enmienda del
    // 25/08/2026 de `seo_estructura.feature` @s20): declara el dominio REAL
    // de publicación, que hoy no sirve nada (GitHub Pages aún no activado).
    // Esta verificación sigue "pidiendo ese fichero" (el `When` de @s29)
    // pero contra el servidor LOCAL de `dist/` que arranca este mismo
    // fichero de configuración, tomando de la URL absoluta solo su ruta.
    // Esa ruta YA incluye el subpath (enmienda 26/08/2026 de
    // `despliegue_github_pages.feature`, Decisión 55): "baseURL" TAMBIÉN lo
    // incluye (`playwright.config.ts`), así que componer la URL local con
    // "baseURL" a secas duplicaría el subpath — se usa solo su origen.
    const rutaOgImage = new URL(contenidoOgImage).pathname
    const respuesta = await request.get(rutaOgImage)
    expect(respuesta.status()).toBe(200)
    expect(respuesta.headers()['content-type']).toBe('image/png')

    const origenPropio = new URL(baseURL ?? 'http://localhost:4173').origin
    const dimensiones = await page.evaluate(async (url) => {
      const imagen = new Image()
      imagen.src = url
      await imagen.decode()
      return { width: imagen.naturalWidth, height: imagen.naturalHeight }
    }, `${origenPropio}${rutaOgImage}`)
    expect(dimensiones).toEqual({ width: 1200, height: 630 })
  })
})

/** Instala el acumulador de "layout-shift" ANTES de que cargue cualquier script de la página (@s30). */
async function instalarAcumuladorDeCls(page: Page): Promise<void> {
  await page.addInitScript(() => {
    ;(window as unknown as { clsAcumulado: number }).clsAcumulado = 0
    new PerformanceObserver((lista) => {
      for (const entrada of lista.getEntries() as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
        if (!entrada.hadRecentInput) {
          ;(window as unknown as { clsAcumulado: number }).clsAcumulado += entrada.value
        }
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })
}

const TECHO_CLS = 0.1

test.describe('@s30 cada imagen declara sus dimensiones y la carga no desplaza el contenido', () => {
  for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
    test(`${pagina} (${ruta}): width+height en todas, lazy+async salvo el encabezado, CLS <= 0.1`, async ({ page }) => {
      await instalarAcumuladorDeCls(page)
      await page.goto(ruta)
      await page.waitForLoadState('load')

      const infoImagenes = await page.evaluate(() =>
        Array.from(document.images).map((imagen) => ({
          width: imagen.getAttribute('width'),
          height: imagen.getAttribute('height'),
          loading: imagen.getAttribute('loading'),
          decoding: imagen.getAttribute('decoding'),
          fetchPriority: imagen.getAttribute('fetchpriority'),
          esImagenDeHero: imagen.matches('#inicio img'),
          esImagenDeCabecera: imagen.matches('header img'),
        })),
      )

      for (const info of infoImagenes) {
        expect(info.width, JSON.stringify(info)).not.toBeNull()
        expect(info.height, JSON.stringify(info)).not.toBeNull()
        expect(info.decoding, JSON.stringify(info)).toBe('async')
        if (info.esImagenDeHero) {
          expect(info.loading, JSON.stringify(info)).toBe('eager')
          expect(info.fetchPriority, JSON.stringify(info)).toBe('high')
        } else if (info.esImagenDeCabecera) {
          expect(info.loading, JSON.stringify(info)).toBe('eager')
          expect(info.fetchPriority, JSON.stringify(info)).toBeNull()
        } else {
          expect(info.loading, JSON.stringify(info)).toBe('lazy')
        }
      }

      // La portada declara una única imagen LCP eager y con prioridad alta;
      // el resto sigue diferido. Las rutas de subpágina no tienen imagen hero.
      const cls = await page.evaluate(() => (window as unknown as { clsAcumulado: number }).clsAcumulado)
      expect(cls).toBeLessThanOrEqual(TECHO_CLS)
    })
  }

  test('el recuento de rutas efectivamente medidas es exactamente 6', () => {
    expect(RUTAS_DEL_INVENTARIO).toHaveLength(6)
  })
})

test.describe('@s31 una imagen que aún no ha cargado reserva su hueco en vez de colapsar', () => {
  test('con "/img/" bloqueado, cada hueco mide alto > 0, respeta su relación de aspecto y se pinta con "--color-fondo-alterno"', async ({
    page,
  }) => {
    await page.route('**/img/**', (ruta) => ruta.abort())
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    const colorEsperado = await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--color-fondo-alterno').trim())

    const huecos = await page.evaluate((hexEsperado) => {
      const aHex = (valor: string): string => {
        const coincidencia = valor.match(/rgba?\((\d+), (\d+), (\d+)/)
        if (coincidencia === null) return valor
        const [, r, g, b] = coincidencia
        return `#${[r, g, b].map((canal) => Number(canal).toString(16).padStart(2, '0')).join('')}`.toUpperCase()
      }
      return Array.from(document.images).map((imagen) => {
        const caja = imagen.getBoundingClientRect()
        const estilo = getComputedStyle(imagen)
        const anchoDeclarado = Number(imagen.getAttribute('width'))
        const altoDeclarado = Number(imagen.getAttribute('height'))
        return {
          alto: caja.height,
          relacionMedida: caja.width / caja.height,
          relacionDeclarada: anchoDeclarado / altoDeclarado,
          fondo: aHex(estilo.backgroundColor),
          fondoEsperadoHex: hexEsperado.startsWith('#') ? hexEsperado.toUpperCase() : aHex(hexEsperado),
        }
      })
    }, colorEsperado)

    expect(huecos.length).toBeGreaterThan(0)
    for (const hueco of huecos) {
      expect(hueco.alto).toBeGreaterThan(0)
      expect(Math.abs(hueco.relacionMedida - hueco.relacionDeclarada)).toBeLessThanOrEqual(0.05)
      expect(hueco.fondo).toBe(hueco.fondoEsperadoHex)
    }
  })
})
