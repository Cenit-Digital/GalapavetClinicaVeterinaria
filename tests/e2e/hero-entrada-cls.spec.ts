// `features/hero_reducido_con_animacion.feature` @s9, SOLO las dos cláusulas «sin congelar el reloj»:
// el desplazamiento acumulado del contenido (CLS) de la portada y de cada una de las 5 rutas sin
// hero es menor o igual que 0,1. NAVEGADOR REAL con Playwright, fuera del gate de Vitest/Stryker
// (Decisión 11 de `project-spec.md`). La parte de @s9 que congela el reloj y mide a 320, 375 y 1440 px
// en tres instantes vive en `hero-reducido.spec.ts`.
//
// QUÉ ES ESTE ESCENARIO, SIN MAQUILLAJE: una antirregresión global, no el detector de ninguna
// mutación única conocida. Complementa a `imagenes.spec.ts` @s30, que lee el CLS justo tras `load` y
// con el valor por defecto del navegador: la entrada del hero termina unos 1000 ms DESPUÉS de `load`
// (medido: el último `animationend` llega a `load` + 980-1015 ms), así que esa lectura llega antes de
// que la entrada acabe. Aquí la portada se carga con `no-preference` declarado de forma explícita y
// se lee cuando la entrada ha terminado de verdad.
//
// CÓMO SE LEE. El acumulador de `layout-shift` se instala con `addInitScript` ANTES del `goto`. Para
// la portada se espera a `esperarEntradaTerminada` (el registro de `animationend`, no «cuando no quede
// ninguna animación», que devuelve vacío con el hero aún sin montar) y, además, al menos 1500 ms tras
// `load`, más un fotograma. Las 5 rutas sin hero no tienen titular al que anclarse: 1500 ms tras `load`
// y un fotograma más.
import { expect, test, type Page } from 'playwright/test'
import { esperarEntradaTerminada, leerRegistroDeEntrada, registrarEntradaDelHero } from './entrada-del-hero'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

/** El techo del contrato: «menor o igual que 0.1». */
const TECHO_DE_CLS = 0.1
/** La lectura de las rutas sin hero, y el suelo de la de la portada: la entrada dura 940 ms. */
const ESPERA_TRAS_LOAD_MS = 1500
const RUTA_DE_LA_PORTADA = `${SUBPATH_DE_PRODUCCION}/`
const ANIMACIONES_DE_ENTRADA_DEL_HERO = 3
const RUTAS_SIN_HERO = RUTAS_DEL_INVENTARIO.filter(({ ruta }) => ruta !== RUTA_DE_LA_PORTADA)
/** Dónde deja el observador su acumulado, en la `window` de cada documento. */
const CLAVE_DEL_ACUMULADOR = '__clsAcumulado'

/** Lo que el acumulador deja en la `window`: `leer` vuelca lo que el observador aún no hubiera entregado y devuelve el total. */
interface AcumuladorDeCls {
  leer: () => { cls: number; entradas: number }
}

/** Instala el acumulador de `layout-shift` ANTES de que cargue ningún script de la página. */
async function instalarElAcumuladorDeCls(page: Page): Promise<void> {
  await page.addInitScript((clave) => {
    let cls = 0
    let entradas = 0
    const sumar = (lista: PerformanceEntryList): void => {
      for (const entrada of lista as (PerformanceEntry & { hadRecentInput: boolean; value: number })[]) {
        if (!entrada.hadRecentInput) {
          cls += entrada.value
          entradas += 1
        }
      }
    }
    const observador = new PerformanceObserver((lista) => sumar(lista.getEntries()))
    observador.observe({ type: 'layout-shift', buffered: true })
    const acumulador: AcumuladorDeCls = {
      leer: () => {
        sumar(observador.takeRecords())
        return { cls, entradas }
      },
    }
    ;(window as unknown as Record<string, AcumuladorDeCls>)[clave] = acumulador
  }, CLAVE_DEL_ACUMULADOR)
}

interface LecturaDelCls {
  readonly cls: number
  readonly entradas: number
  readonly observadorInstalado: boolean
}

/**
 * Espera `espera` ms contados desde el fin del evento `load`, un fotograma más, y lee el
 * desplazamiento acumulado.
 */
async function leerElClsTrasLaCarga(page: Page, espera: number): Promise<LecturaDelCls> {
  return page.evaluate(
    ([clave, esperaMs]) =>
      new Promise<LecturaDelCls>((resolver) => {
        const acumulador = (window as unknown as Record<string, AcumuladorDeCls | undefined>)[clave]
        const navegacion = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const finDeLoad = Math.max(navegacion.loadEventEnd, navegacion.loadEventStart)
        const restante = Math.max(finDeLoad + esperaMs - performance.now(), 0)
        setTimeout(() => {
          requestAnimationFrame(() => {
            resolver({ ...(acumulador?.leer() ?? { cls: Number.NaN, entradas: 0 }), observadorInstalado: acumulador !== undefined })
          })
        }, restante)
      }),
    [CLAVE_DEL_ACUMULADOR, espera] as const,
  )
}

interface RutaMedida {
  readonly ruta: string
  readonly cls: number
}

test.describe('@s9 de hero_reducido_con_animacion: sin congelar el reloj, el CLS de la portada y de las 5 rutas sin hero no sube de 0,1', () => {
  test('las 6 rutas: la portada, con "no-preference" explícito y la entrada terminada, y las otras 5, 1500 ms después de "load" y un fotograma más', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await instalarElAcumuladorDeCls(page)
    await registrarEntradaDelHero(page)
    const medidas: RutaMedida[] = []

    // La portada: ancla en el registro de la entrada, y nunca antes de 1500 ms tras `load`.
    await page.goto(RUTA_DE_LA_PORTADA)
    await esperarEntradaTerminada(page)
    const registro = await leerRegistroDeEntrada(page)
    const portada = await leerElClsTrasLaCarga(page, ESPERA_TRAS_LOAD_MS)
    expect(portada.observadorInstalado, 'el acumulador de layout-shift no se instaló: un 0 sería un 0 por vacuidad').toBe(true)
    // Anti-vacuidad: con `no-preference` la entrada SE EJECUTÓ y la lectura cayó después de su fin.
    expect(registro.arranques).toBe(ANIMACIONES_DE_ENTRADA_DEL_HERO)
    expect(registro.fines).toBe(ANIMACIONES_DE_ENTRADA_DEL_HERO)
    medidas.push({ ruta: RUTA_DE_LA_PORTADA, cls: portada.cls })

    // Las otras 5: no hay titular al que anclarse, así que la espera es fija.
    for (const { ruta } of RUTAS_SIN_HERO) {
      await page.goto(ruta)
      const lectura = await leerElClsTrasLaCarga(page, ESPERA_TRAS_LOAD_MS)
      expect(lectura.observadorInstalado, `${ruta}: el acumulador de layout-shift no se instaló`).toBe(true)
      medidas.push({ ruta, cls: lectura.cls })
    }

    expect(RUTAS_SIN_HERO).toHaveLength(5)
    expect(medidas.map(({ ruta }) => ruta)).toEqual(RUTAS_DEL_INVENTARIO.map(({ ruta }) => ruta))
    expect(medidas).toHaveLength(6)
    for (const { ruta, cls } of medidas) {
      expect(cls, `${ruta}: desplazamiento acumulado`).toBeLessThanOrEqual(TECHO_DE_CLS)
    }
  })
})

// ---------------------------------------------------------------------------
// La comprobación muerde: páginas sintéticas con un salto de maquetación conocido
// ---------------------------------------------------------------------------

const URL_SINTETICA = 'http://sintetica.test/'
/** Un salto que llega DESPUÉS de la entrada (940 ms) y ANTES de la lectura (1500 ms): una lectura a `load` + 956 ms lo habría perdido. */
const SALTO_TARDIO_MS = 1200
const SALTO_PREVIO_AL_FIN_DE_LA_ENTRADA_MS = 200

function paginaConUnSalto(saltaTrasMs: number | null): string {
  const salto =
    saltaTrasMs === null
      ? ''
      : `window.addEventListener('load', () => setTimeout(() => {
           const hueco = document.createElement('div')
           hueco.style.height = '400px'
           document.body.prepend(hueco)
         }, ${saltaTrasMs}))`
  return `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">
<main style="height:600px;background:#eee"><h1>Contenido que se desplaza</h1></main><script>${salto}</script></body></html>`
}

async function cargarPaginaConUnSalto(page: Page, saltaTrasMs: number | null): Promise<void> {
  await page.route('**/*', (ruta) => ruta.fulfill({ contentType: 'text/html', body: paginaConUnSalto(saltaTrasMs) }))
  await instalarElAcumuladorDeCls(page)
  await page.goto(URL_SINTETICA)
}

test.describe('@s9 de hero_reducido_con_animacion: la medida del CLS muerde (páginas sintéticas)', () => {
  test('una página que no se mueve da 0, y el acumulador estaba instalado', async ({ page }) => {
    await cargarPaginaConUnSalto(page, null)

    const lectura = await leerElClsTrasLaCarga(page, ESPERA_TRAS_LOAD_MS)

    expect(lectura.observadorInstalado).toBe(true)
    expect(lectura.cls).toBe(0)
  })

  test('un salto de maquetación grande mucho antes de la lectura supera el techo de 0,1', async ({ page }) => {
    await cargarPaginaConUnSalto(page, SALTO_PREVIO_AL_FIN_DE_LA_ENTRADA_MS)

    const lectura = await leerElClsTrasLaCarga(page, ESPERA_TRAS_LOAD_MS)

    expect(lectura.cls).toBeGreaterThan(TECHO_DE_CLS)
  })

  test('un salto que llega 1200 ms después de "load", cuando acaba la entrada, también lo ve la lectura de 1500 ms (una de load + 956 ms lo perdería)', async ({
    page,
  }) => {
    await cargarPaginaConUnSalto(page, SALTO_TARDIO_MS)

    const lecturaTemprana = await leerElClsTrasLaCarga(page, 0)
    expect(lecturaTemprana.cls, 'antes del salto no hay nada que ver').toBe(0)
    const lectura = await leerElClsTrasLaCarga(page, ESPERA_TRAS_LOAD_MS)

    expect(lectura.cls).toBeGreaterThan(TECHO_DE_CLS)
  })
})
