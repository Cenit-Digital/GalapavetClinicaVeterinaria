// @s13-@s16 de `features/despliegue_github_pages.feature` (Bloques I/J: el
// prefijo de los assets y de `public/`, y la puerta de terceros, sobre el
// `dist/` real construido con "vite build --base=/GalapavetClinicaVeterinaria/"
// y servido con "vite preview --base=/GalapavetClinicaVeterinaria/" —
// `playwright.config.ts` → `webServer` ya arranca ambos así, Decisión 51).
// @s17 (la puerta completa "pnpm run test:e2e" sigue en verde) no añade un
// test propio: lo demuestra la propia ejecución completa de este comando en
// verde, documentada en `progress/tdd_despliegue_github_pages.md`.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from 'playwright/test'
import { DOMINIOS_DE_TERCEROS_PROHIBIDOS, ejecutarPuertaDeTerceros, type ArchivoDeSalida } from '../../src/lib/diseno/puertaTerceros'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

const PUERTO_DE_PREVIEW = 4173
const URL_ESPERADA = `http://localhost:${PUERTO_DE_PREVIEW}${SUBPATH_DE_PRODUCCION}/`
const RAIZ_DEL_REPO = fileURLToPath(new URL('../..', import.meta.url))

const ANCLAS_DE_LA_LANDING = ['inicio', 'servicios', 'equipo', 'reservar', 'galeria', 'contacto', 'faq'] as const

/** El mapa embebido (Invariante 3, único tercero admitido) escribe un aviso de consola al sandbox — no es un error de esta feature (mismo criterio que `red-limpia.spec.ts` @s34). */
const PATRON_MENSAJE_DEL_MAPA_SANDBOXED = /openstreetmap\.org/i

test.describe('@s13 el sitio construido y servido bajo el subpath real carga el mismo árbol que en local', () => {
  test(`carga "${URL_ESPERADA}": monta #root, las 7 anclas existen, todo responde 200, sin errores de consola`, async ({
    page,
    baseURL,
  }) => {
    expect(baseURL).toBe(URL_ESPERADA)

    const mensajesDeError: string[] = []
    page.on('console', (mensaje) => {
      if (mensaje.type() === 'error' && !PATRON_MENSAJE_DEL_MAPA_SANDBOXED.test(mensaje.text())) {
        mensajesDeError.push(mensaje.text())
      }
    })
    page.on('pageerror', (error) => mensajesDeError.push(error.message))

    const respuestasDeAssets: number[] = []
    page.on('response', (respuesta) => {
      if (new URL(respuesta.url()).pathname.includes('/assets/')) {
        respuestasDeAssets.push(respuesta.status())
      }
    })

    const respuestaDocumento = await page.goto(URL_ESPERADA)
    expect(respuestaDocumento?.status()).toBe(200)
    await page.waitForLoadState('networkidle')

    const raizMontada = await page.evaluate(() => (document.getElementById('root')?.childElementCount ?? 0) > 0)
    expect(raizMontada).toBe(true)

    const anclasExistentes = await page.evaluate(
      (ids) => ids.map((id) => document.getElementById(id) !== null),
      ANCLAS_DE_LA_LANDING as unknown as string[],
    )
    expect(anclasExistentes).toEqual(ANCLAS_DE_LA_LANDING.map(() => true))

    expect(respuestasDeAssets.length).toBeGreaterThan(0)
    for (const status of respuestasDeAssets) {
      expect(status).toBe(200)
    }

    expect(mensajesDeError, `errores de consola: ${JSON.stringify(mensajesDeError)}`).toEqual([])
  })
})

test.describe('@s14 el favicon, el apple-touch-icon y los dos preloads de fuente resuelven bajo el subpath', () => {
  const FICHEROS_BAJO_EL_SUBPATH = [
    `${SUBPATH_DE_PRODUCCION}/favicon.ico`,
    `${SUBPATH_DE_PRODUCCION}/favicon-32.png`,
    `${SUBPATH_DE_PRODUCCION}/apple-touch-icon.png`,
    `${SUBPATH_DE_PRODUCCION}/fuentes/outfit-latin-wght-normal.woff2`,
    `${SUBPATH_DE_PRODUCCION}/fuentes/dm-sans-latin-wght-normal.woff2`,
  ] as const

  test('las 5 respuestas tienen código de estado 200, pedidas directamente bajo el subpath', async ({ request }) => {
    for (const fichero of FICHEROS_BAJO_EL_SUBPATH) {
      const respuesta = await request.get(fichero)
      expect(respuesta.status(), `${fichero} respondió ${respuesta.status()}`).toBe(200)
    }
    expect(FICHEROS_BAJO_EL_SUBPATH).toHaveLength(5)
  })

  test('el documento real, al cargar, no pide ninguna de esas rutas sin el subpath', async ({ page }) => {
    const rutasPedidas: string[] = []
    page.on('request', (peticion) => rutasPedidas.push(new URL(peticion.url()).pathname))

    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.waitForLoadState('networkidle')

    const RUTAS_SIN_SUBPATH = FICHEROS_BAJO_EL_SUBPATH.map((fichero) => fichero.replace(SUBPATH_DE_PRODUCCION, ''))
    for (const rutaSinSubpath of RUTAS_SIN_SUBPATH) {
      expect(rutasPedidas).not.toContain(rutaSinSubpath)
    }
  })
})

test.describe('@s15 dist/404.html es una copia verbatim de public/404.html, sin pasar por el procesamiento de Vite', () => {
  test('el contenido de "dist/404.html" es idéntico, carácter a carácter, al de "public/404.html"', () => {
    const textoPublic404 = readFileSync(`${RAIZ_DEL_REPO}/public/404.html`, 'utf8')
    const textoDist404 = readFileSync(`${RAIZ_DEL_REPO}/dist/404.html`, 'utf8')

    expect(textoDist404).toBe(textoPublic404)
  })
})

const ES_CSS_O_HTML = /\.(css|html)$/i

/** Mismo criterio que `tools/puerta-terceros.ts`: solo CSS y HTML de "dist/", el mismo artefacto que sirve "vite preview" en esta puerta. */
function leerArchivosDelArtefacto(): readonly ArchivoDeSalida[] {
  return readdirSync(`${RAIZ_DEL_REPO}/dist`, { recursive: true, withFileTypes: true })
    .filter((entrada) => entrada.isFile() && ES_CSS_O_HTML.test(entrada.name))
    .map((entrada) => {
      const ruta = `${entrada.parentPath}/${entrada.name}`.replaceAll('\\', '/')
      return { ruta, contenido: readFileSync(ruta, 'utf8') }
    })
}

test.describe('@s16 el build completo con el nuevo --base sigue pasando la puerta de terceros sin hallazgos', () => {
  // "pnpm run build" ya se ejecutó de punta a punta ANTES de que este test
  // (o cualquier otro de este fichero) pudiera arrancar: es el propio
  // "webServer.command" de `playwright.config.ts` ("pnpm run build && vite
  // preview --base=...", encadenado con "&&"). Si "tsc -b", "vite build
  // --base=..." o "node tools/puerta-terceros.ts" hubieran fallado con
  // código != 0, la cadena "&&" habría abortado antes de arrancar "vite
  // preview", y Playwright nunca habría podido servir NINGÚN test de esta
  // puerta — llegar hasta aquí ya demuestra el código de salida 0. Releer el
  // mismo "dist/" con la misma lógica pura (`ejecutarPuertaDeTerceros`, ya
  // "done") confirma además el segundo "Then": 0 hallazgos.
  test('la cadena del script "build" aborta ante cualquier fallo (encadenada con "&&"), y "pnpm run build" ya terminó con éxito para que este test exista', () => {
    const scriptBuild = readFileSync(`${RAIZ_DEL_REPO}/package.json`, 'utf8')
    const { scripts } = JSON.parse(scriptBuild) as { scripts: Record<string, string> }

    expect(scripts.build).toContain('tsc -b && vite build --base=/GalapavetClinicaVeterinaria/ && node')
  })

  test('el informe de la puerta de terceros sobre ese mismo "dist/" declara 0 hallazgos', () => {
    const informe = ejecutarPuertaDeTerceros(leerArchivosDelArtefacto(), DOMINIOS_DE_TERCEROS_PROHIBIDOS)

    expect(informe.pasa).toBe(true)
    expect(informe.hallazgos).toEqual([])
  })

  test('ni "dist/404.html" ni el script de decodificación de "dist/index.html" añaden ninguna referencia a un dominio de terceros', () => {
    const textoDist404 = readFileSync(`${RAIZ_DEL_REPO}/dist/404.html`, 'utf8')
    const textoDistIndex = readFileSync(`${RAIZ_DEL_REPO}/dist/index.html`, 'utf8')

    for (const dominio of DOMINIOS_DE_TERCEROS_PROHIBIDOS) {
      expect(textoDist404).not.toContain(dominio)
      expect(textoDistIndex).not.toContain(dominio)
    }
  })
})

// ---------------------------------------------------------------------------
// @s23 (enmienda 26/08/2026, Decisiones 52-55): las 24 rutas de imagen reales
// (Decisión 53, mismo literal escrito a mano que @s18 de
// `src/lib/hrefDeDestino.test.ts`) más "og:image" resuelven con 200 bajo el
// subpath real — mismo nivel de verificación que @s13/@s14.
// ---------------------------------------------------------------------------

/**
 * Las 24 rutas de imagen crudas reales (sin el subpath, tal y como las
 * declaran `PieDePagina.tsx`/`galeria.ts`/`campanas.ts`/`blog.ts`/
 * `tienda.ts`). Literal escrito a mano, no importado de `src/data/*.ts`
 * (patrón "doble-de-test-anclado-al-literal-no-al-simbolo",
 * `feature_list.json` → `rules.notas`).
 */
const RUTAS_DE_IMAGEN_CRUDAS = [
  '/img/logo-galapavet.webp',
  '/img/galeria/nala-y-coco.webp',
  '/img/galeria/bruno.webp',
  '/img/galeria/luna.webp',
  '/img/galeria/toby.webp',
  '/img/galeria/milo.webp',
  '/img/galeria/kira.webp',
  '/img/campanas/vacunaciones.webp',
  '/img/campanas/chequeo.webp',
  '/img/campanas/odontologia.webp',
  '/img/blog/demo-1.webp',
  '/img/blog/demo-2.webp',
  '/img/blog/demo-3.webp',
  '/img/blog/demo-4.webp',
  '/img/blog/demo-5.webp',
  '/img/blog/demo-6.webp',
  '/img/tienda/pienso-perro-adulto.webp',
  '/img/tienda/pienso-gato-esterilizado.webp',
  '/img/tienda/arnes-talla-m.webp',
  '/img/tienda/correa-2m.webp',
  '/img/tienda/cama-talla-m.webp',
  '/img/tienda/manta-60x40.webp',
  '/img/tienda/mordedor-caucho.webp',
  '/img/tienda/pelota-con-sonido.webp',
] as const

/** Mismo forzado de carga diferida que `tests/e2e/imagenes.spec.ts` @s27: Chromium solo dispara "lazy" cerca del viewport, y el umbral no es determinista entre corridas. */
async function cargarImagenesDiferidas(page: Page): Promise<void> {
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((imagen) => imagen.setAttribute('loading', 'eager'))
  })
  await page.waitForFunction(() => Array.from(document.images).every((imagen) => imagen.complete))
}

test.describe('@s23 las imágenes de las 6 features y og:image resuelven con 200 bajo el subpath real', () => {
  test('las 25 rutas responden 200 bajo el subpath, ninguna imagen renderizada queda con naturalWidth 0, sin errores de red', async ({
    page,
    request,
  }) => {
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const contenidoOgImage = await page.locator('meta[property="og:image"]').getAttribute('content')
    if (contenidoOgImage === null) {
      throw new Error('no se encontró la etiqueta "og:image"')
    }
    const rutaOgImage = new URL(contenidoOgImage).pathname

    const rutasBajoElSubpath = RUTAS_DE_IMAGEN_CRUDAS.map((ruta) => `${SUBPATH_DE_PRODUCCION}${ruta}`)
    const todasLasRutas = [...rutasBajoElSubpath, rutaOgImage]
    expect(todasLasRutas).toHaveLength(25)

    for (const ruta of todasLasRutas) {
      const respuesta = await request.get(ruta)
      expect(respuesta.status(), `${ruta} respondió ${respuesta.status()}`).toBe(200)
    }

    const mensajesDeErrorDeRed: string[] = []
    page.on('console', (mensaje) => {
      if (mensaje.type() === 'error' && /Failed to load resource/i.test(mensaje.text())) {
        mensajesDeErrorDeRed.push(mensaje.text())
      }
    })

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await cargarImagenesDiferidas(page)

      const imagenesRotas = await page.evaluate(() =>
        Array.from(document.images)
          .filter((imagen) => imagen.naturalWidth === 0)
          .map((imagen) => imagen.getAttribute('src')),
      )
      expect(imagenesRotas, `imágenes rotas en ${ruta}`).toEqual([])
    }

    expect(mensajesDeErrorDeRed, `errores de red: ${JSON.stringify(mensajesDeErrorDeRed)}`).toEqual([])
  })

  test('el recuento de rutas de imagen efectivamente comprobadas es exactamente 25', () => {
    expect(RUTAS_DE_IMAGEN_CRUDAS.length + 1).toBe(25)
  })
})
