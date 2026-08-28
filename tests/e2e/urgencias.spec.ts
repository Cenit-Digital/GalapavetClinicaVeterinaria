// @s14 de `features/rediseno_visual.feature`: "El único rótulo de urgencias
// del sitio es el real, con el teléfono real".
//
// Puerta de NAVEGADOR REAL sobre el artefacto construido y servido (`vite
// preview` sobre `dist/`, `playwright.config.ts` → `webServer`), recorriendo
// las SEIS rutas del inventario. En jsdom esto no se puede demostrar: allí
// solo se renderiza un componente aislado, y el escenario habla del sitio
// entero.
//
// POR QUÉ ESTE SPEC SÍ IMPORTA DE `src/`, al contrario que el resto de specs
// de esta carpeta: las tres cláusulas Then de @s14 no dicen "el rótulo es
// 'Urgencias fuera de horario'", dicen "el rótulo es EL QUE DECLARA LA FUENTE
// ÚNICA DE DATOS DE NEGOCIO" y "el enlace se deriva de ESE MISMO número, SIN
// RETIPEARLO". Un literal escrito a mano aquí probaría lo contrario de lo que
// el contrato pide: dejaría pasar un componente que retipea el teléfono, que
// es exactamente el defecto que `progress/rediseno/matriz_trazabilidad.md`
// (@s14) documenta hoy en `tests/e2e/rediseno-visual.spec.ts:46` (se conforma
// con el prefijo `tel:`) y en `src/components/PieDePagina.test.tsx:124` (usa
// el literal 'tel:+34918511393'). El inventario de RUTAS sí sigue siendo el
// literal a mano de `rutas.ts`, como manda ese fichero.
import { expect, test } from 'playwright/test'
import { datosNegocio } from '../../src/lib/site'
import { enlaceLlamada } from '../../src/lib/telefono'
import { RECUENTO_DE_RUTAS, RUTAS_DEL_INVENTARIO } from './rutas'

const ANCHO_ESCRITORIO = 1600
const ALTO_ESCRITORIO = 1000

const { telefonoUrgencias, telefonoClinica, telefonoMovil } = datosNegocio

/** El rótulo real del cliente, leído de la fuente única (`src/lib/site.ts:13`). */
const ROTULO_DE_URGENCIAS = telefonoUrgencias.rotulo ?? ''

/**
 * El `tel:` esperado NO se escribe: se DERIVA aquí del número visible con la
 * misma función del repositorio (`src/lib/telefono.ts:40`). Así, si mañana
 * cambia el teléfono en la fuente única y algún componente lo tiene retipeado,
 * este spec se pone rojo.
 */
const ENLACE_ESPERADO = enlaceLlamada(telefonoUrgencias.textoVisible)

interface MencionDeUrgencias {
  readonly textos: readonly string[]
  readonly etiquetas: readonly string[]
  readonly enlaces: readonly { readonly href: string; readonly nombre: string }[]
  readonly enlacesTelefonicos: number
}

/**
 * Recorre el DOM real de la página y devuelve TODO lo que menciona
 * "urgencias": los nodos de texto, los rótulos accesibles y los enlaces de
 * llamada asociados. No se usa ningún selector escrito a mano de componente:
 * el When del escenario dice "se recorre el TEXTO de las seis rutas buscando
 * la palabra urgencias", así que se busca por texto, no por caja.
 */
function recogerMenciones(): MencionDeUrgencias {
  const PATRON_URGENCIAS = /urgencias/i
  const ETIQUETAS_SIN_TEXTO_VISIBLE = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE'])

  const textos: string[] = []
  const recorrido = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let nodo = recorrido.nextNode(); nodo !== null; nodo = recorrido.nextNode()) {
    const etiquetaDelPadre = nodo.parentElement?.tagName ?? ''
    const texto = (nodo.textContent ?? '').trim()
    if (!ETIQUETAS_SIN_TEXTO_VISIBLE.has(etiquetaDelPadre) && PATRON_URGENCIAS.test(texto)) {
      textos.push(texto)
    }
  }

  const etiquetas = [...document.querySelectorAll('[aria-label]')]
    .map((elemento) => elemento.getAttribute('aria-label') ?? '')
    .filter((etiqueta) => PATRON_URGENCIAS.test(etiqueta))

  const enlacesTelefonicos = [...document.querySelectorAll('a[href^="tel:"]')]
  const enlaces = enlacesTelefonicos
    .map((enlace) => {
      const propia = enlace.getAttribute('aria-label') ?? enlace.textContent ?? ''
      const contenedor = enlace.closest('[aria-label]')?.getAttribute('aria-label') ?? ''
      return { href: enlace.getAttribute('href') ?? '', nombre: `${propia} ${contenedor}`.trim() }
    })
    .filter((enlace) => PATRON_URGENCIAS.test(enlace.nombre))

  return { textos, etiquetas, enlaces, enlacesTelefonicos: enlacesTelefonicos.length }
}

test.describe('@s14: el único rótulo de urgencias del sitio es el real, con el teléfono real', () => {
  test('los tres teléfonos de la fuente única son distintos entre sí', () => {
    // Sin esto, "el teléfono no es el de la clínica ni el móvil" sería una
    // comprobación vacía: pasaría sola si los tres números coincidieran.
    const enlaces = [ENLACE_ESPERADO, enlaceLlamada(telefonoClinica.textoVisible), enlaceLlamada(telefonoMovil.textoVisible)]

    expect(new Set(enlaces).size).toBe(3)
    expect(ROTULO_DE_URGENCIAS).not.toBe('')
  })

  test('las seis rutas rotulan las urgencias con el dato real y enlazan al teléfono real', async ({ page }) => {
    await page.setViewportSize({ width: ANCHO_ESCRITORIO, height: ALTO_ESCRITORIO })

    let rutasRecorridas = 0
    let mencionesTotales = 0
    let enlacesDeUrgenciaComprobados = 0

    for (const { pagina, ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)
      await page.waitForLoadState('networkidle')

      const menciones = await page.evaluate(recogerMenciones)
      rutasRecorridas += 1

      // Cada ruta tiene que decir algo de urgencias: la barra superior y el
      // pie viven en el shell común (`src/App.tsx:56` y `:69`). Cero menciones
      // significaría que este barrido no está mirando nada.
      expect(menciones.textos.length, `${pagina}: ninguna mención de urgencias`).toBeGreaterThan(0)
      mencionesTotales += menciones.textos.length

      for (const texto of menciones.textos) {
        // El rótulo que aparece es EXACTAMENTE el de la fuente única.
        expect(texto, `${pagina}: texto de urgencias sin el rótulo real`).toContain(ROTULO_DE_URGENCIAS)
        // Y el número que lo acompaña no es el de la clínica ni el móvil.
        expect(texto).not.toContain(telefonoClinica.textoVisible)
        expect(texto).not.toContain(telefonoMovil.textoVisible)
      }

      for (const etiqueta of menciones.etiquetas) {
        expect(etiqueta, `${pagina}: rótulo accesible de urgencias distinto del real`).toBe(ROTULO_DE_URGENCIAS)
      }

      expect(menciones.enlaces.length, `${pagina}: ningún enlace de llamada a urgencias`).toBeGreaterThan(0)
      for (const enlace of menciones.enlaces) {
        // Derivado del número visible con la función del repositorio, no retipeado.
        expect(enlace.href, `${pagina}: el enlace de urgencias no deriva del número real`).toBe(ENLACE_ESPERADO)
        expect(enlace.href).not.toBe(enlaceLlamada(telefonoClinica.textoVisible))
        expect(enlace.href).not.toBe(enlaceLlamada(telefonoMovil.textoVisible))
        enlacesDeUrgenciaComprobados += 1
      }
    }

    expect(rutasRecorridas).toBe(RECUENTO_DE_RUTAS)
    expect(rutasRecorridas).toBe(6)
    expect(mencionesTotales).toBeGreaterThan(0)
    expect(enlacesDeUrgenciaComprobados).toBeGreaterThan(0)
  })
})
