// `features/hero_reducido_con_animacion.feature` @s2 (los datos que salen del
// hero siguen publicados en el resto de la portada), @s5 (la entrada animada, con
// los valores aprobados), @s6 (con movimiento reducido no se anima nada), @s7 (si
// la animación no corre, todo se ve), @s9 (la entrada no mueve el resto de la
// página: la parte de los tres instantes por tres anchos) y @s12 (el hero es de
// pantalla completa). NAVEGADOR REAL con Playwright, fuera del gate de
// Vitest/Stryker (Decisión 11 de `project-spec.md`), sobre `dist/` servido por
// `vite preview` (`playwright.config.ts`).
//
// Todos cargan la portada con la preferencia de movimiento declarada de forma
// EXPLÍCITA, nunca por omisión.
//
// CÓMO SE MIDE LA ENTRADA SIN QUE DEPENDA DEL RELOJ (@s5, @s7, @s9 y @s12). El
// reloj de animaciones del documento se CONGELA ANTES de navegar
// (`congelarRelojDeAnimaciones`) y después se COLOCA cada animación en el instante
// pedido (`colocarAnimaciones`: `currentTime =`) o se CANCELA (`cancelarAnimaciones`).
// Así las animaciones nacen detenidas en su instante 0, no pueden haber terminado
// cuando se miden y la medida es de temporización y de geometría, no de «lo que se
// vio a los 300 ms». Las dos funciones viven AQUÍ y no en `utilidades.ts`: la
// comprobación estática de @s10 reconoce la exención por el TEXTO del bloque
// `test(` o de una función local de este mismo fichero.
//
// MEDIDO en Chromium 151 (no es documentación oficial): una sesión CDP creada con
// `page.context().newCDPSession(page)` ANTES del primer `goto` y
// `Animation.setPlaybackRate` a 0 SOBREVIVE a navegaciones sucesivas de la misma
// página y a `setViewportSize`; hace falta `Animation.enable`: NO (se midió con y
// sin él); las tres animaciones nacen con `currentTime` 0 y `startTime` 0 y siguen
// ahí tras 1 s de reloj real; y asignar `currentTime` coloca la animación y se
// queda ahí (opacidad 0,999996 y transform de -0,000154 px en `endTime - 1 ms`).
import { expect, test, type Locator, type Page } from 'playwright/test'
import { textoHorario } from '../../src/components/Faq-logica'
import { datosNegocio } from '../../src/lib/site'
import { SUBPATH_DE_PRODUCCION } from './rutas'

const SELECTOR_DEL_HERO = '#inicio [data-a-sangre]'
const PREGUNTA_DE_HORARIO = '¿Qué horario tiene la clínica?'
const PREGUNTA_DE_CITA = '¿Cómo pido cita?'

async function cargarPortada(page: Page, ancho: number, alto: number): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: ancho, height: alto })
  await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
  await page.evaluate(() => document.fonts.ready)
}

// ---------------------------------------------------------------------------
// La entrada animada: tipos, el reloj congelado y la lectura del navegador
// ---------------------------------------------------------------------------

/** Los tres elementos que entran, en su orden de retardo. El botón se mide por el enlace: su opacidad EFECTIVA incluye la de su contenedor. */
type Rol = 'titular' | 'parrafo' | 'boton'
const ROLES: readonly Rol[] = ['titular', 'parrafo', 'boton']
type Instante = 'inicio' | 'mitad' | 'final'

// Los valores aprobados por Pablo el 13/10/2026 (P1) y lo delegado al craftsman.
const DURACION_MS = 700
const RETARDOS_MS: readonly number[] = [0, 120, 240]
const FIN_DE_CADA_ANIMACION_MS: readonly number[] = [700, 820, 940]
const CURVA = 'ease-out'
const RELLENO = 'backwards'
const DESPLAZAMIENTO_PX = 40
const PROPIEDADES_ANIMADAS: readonly string[] = ['opacity', 'transform']
const TOLERANCIA_DE_CAJA_PX = 0.5
const OPACIDAD_MINIMA_AL_FINAL = 0.999
const TOLERANCIA_DE_OPACIDAD_NULA = 1e-6
const ANIMACIONES_DEL_HERO = 3

interface Caja {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

interface MedidaDeUnElemento {
  /** El producto de la opacidad computada del elemento y la de todos sus ancestros hasta la sección. */
  readonly opacidadEfectiva: number
  readonly caja: Caja
  readonly visibilidad: string
  readonly transform: string
  readonly willChange: string
  /** Cuántos ancestros, hasta la sección, tienen una opacidad computada distinta de 1. */
  readonly ancestrosConOpacidadDistintaDe1: number
  readonly ocultoParaElArbol: boolean
  readonly dentroDeLaVentana: boolean
}

interface MedidaDeUnInstante {
  readonly elementos: Readonly<Record<Rol, MedidaDeUnElemento>>
  readonly hero: { readonly top: number; readonly bottom: number; readonly scrollHeight: number; readonly clientHeight: number }
  readonly documento: { readonly anchoDelContenido: number; readonly anchoDeLaVentana: number }
  /** La caja de cada elemento de las secciones posteriores al hero (solo si se pidió). */
  readonly posteriores: readonly Caja[]
}

interface AnimacionLeida {
  readonly rol: Rol | 'otro'
  readonly retardo: number
  readonly duracion: number
  readonly fin: number
  readonly inicio: number | null
  readonly iteraciones: number
  readonly rellenoDelEfecto: string
  readonly rellenoComputado: string
  readonly nombreComputado: string
  readonly curvaComputada: string
  readonly curvasDeLosFotogramas: readonly string[]
  readonly propiedades: readonly string[]
  readonly ultimoFotograma: { readonly opacity: string; readonly transform: string } | undefined
}

/**
 * Congela el reloj de animaciones del documento ANTES de navegar: protocolo de
 * depuración de Chrome, `Animation.setPlaybackRate` con velocidad 0. La sesión se
 * crea antes del `goto` y sobrevive a las navegaciones de esa página (MEDIDO en
 * Chromium 151, ver la cabecera).
 */
async function congelarRelojDeAnimaciones(page: Page): Promise<void> {
  const sesion = await page.context().newCDPSession(page)
  await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })
}

/**
 * Espera a que existan los tres elementos y a que el motor haya tenido ocasión de
 * crear sus animaciones (dos fotogramas: se crean al recalcular los estilos tras
 * insertar el titular). Si la entrada falta, la medida falla en su recuento y no
 * en un tiempo de espera opaco.
 */
async function esperarALosElementosDelHero(page: Page): Promise<void> {
  await page.locator(`${SELECTOR_DEL_HERO} h1`).waitFor()
  await page.evaluate(
    () => new Promise<void>((resolver) => requestAnimationFrame(() => requestAnimationFrame(() => resolver()))),
  )
}

/**
 * Coloca TODAS las animaciones por fotogramas clave de la portada en un instante:
 * el 0 (durante el retardo de las que lo tienen), la mitad de la fase activa de
 * cada una (`retardo + duración / 2`) o el ÚLTIMO INSTANTE DE LA FASE ACTIVA
 * (`endTime - 1 ms`; NO `endTime`: con relleno hacia atrás en `endTime` la
 * animación ya no se aplica y se lee el estilo base).
 */
async function colocarAnimaciones(page: Page, instante: Instante): Promise<void> {
  await esperarALosElementosDelHero(page)
  await page.evaluate((donde) => {
    for (const animacion of document.getAnimations()) {
      if (animacion instanceof CSSAnimation) {
        const tiempos = animacion.effect?.getComputedTiming()
        const retardo = Number(tiempos?.delay ?? 0)
        const duracion = Number(tiempos?.duration ?? 0)
        const fin = Number(tiempos?.endTime ?? 0)
        // Una animación infinita no tiene fin: se coloca al final de su primera vuelta para que la auditoría la señale por sus iteraciones y no el navegador por un instante infinito.
        const ultimo = Number.isFinite(fin) ? fin - 1 : retardo + duracion - 1
        const instantes = { inicio: 0, mitad: retardo + duracion / 2, final: ultimo }
        animacion.currentTime = instantes[donde]
      }
    }
  }, instante)
}

/** Cancela todas las animaciones por fotogramas clave (cada elemento vuelve a lo que dice su hoja SIN animación) y dice cuántas había. */
async function cancelarAnimaciones(page: Page): Promise<number> {
  return page.evaluate(() => {
    const animaciones = document.getAnimations().filter((animacion) => animacion instanceof CSSAnimation)
    for (const animacion of animaciones) {
      animacion.cancel()
    }
    return animaciones.length
  })
}

/** Cuántas animaciones por fotogramas clave (no transiciones) tiene el documento ahora mismo. */
async function contarLasAnimaciones(page: Page): Promise<number> {
  return page.evaluate(
    () => document.getAnimations().filter((animacion) => animacion instanceof CSSAnimation).length,
  )
}

/** Mide los tres elementos, el hero y el documento en el estado actual, con sus ancestros hasta la sección. */
async function medirElementos(page: Page, conPosteriores = false): Promise<MedidaDeUnInstante> {
  const selectores = {
    titular: `${SELECTOR_DEL_HERO} h1`,
    parrafo: `${SELECTOR_DEL_HERO} [data-hero-subtitulo]`,
    boton: `${SELECTOR_DEL_HERO} a`,
  }
  return page.evaluate(
    ({ selectorDelHero, selectores: selectoresDeLaPagina, incluirPosteriores }) => {
      const seccion = document.querySelector(selectorDelHero) as HTMLElement
      const cajaDe = (elemento: Element): Caja => {
        const { x, y, width, height } = elemento.getBoundingClientRect()
        return { x, y, width, height }
      }
      const medir = (selector: string): MedidaDeUnElemento => {
        const elemento = document.querySelector(selector) as HTMLElement
        let opacidadEfectiva = 1
        let ancestrosConOpacidadDistintaDe1 = 0
        for (let nodo: Element | null = elemento; nodo !== null; nodo = nodo === seccion ? null : nodo.parentElement) {
          const opacidadPropia = Number(getComputedStyle(nodo).opacity)
          opacidadEfectiva *= opacidadPropia
          if (nodo !== elemento && opacidadPropia !== 1) {
            ancestrosConOpacidadDistintaDe1 += 1
          }
        }
        const caja = cajaDe(elemento)
        const estilo = getComputedStyle(elemento)
        return {
          opacidadEfectiva,
          caja,
          visibilidad: estilo.visibility,
          transform: estilo.transform,
          willChange: estilo.willChange,
          ancestrosConOpacidadDistintaDe1,
          ocultoParaElArbol: elemento.closest('[aria-hidden="true"], [hidden], [inert]') !== null,
          dentroDeLaVentana: caja.x >= 0 && caja.x + caja.width <= window.innerWidth,
        }
      }
      const cajaDelHero = seccion.getBoundingClientRect()
      const posteriores = incluirPosteriores
        ? Array.from(document.body.querySelectorAll('*'))
            .filter(
              (elemento) =>
                !seccion.contains(elemento) &&
                (seccion.compareDocumentPosition(elemento) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
            )
            .map(cajaDe)
        : []
      return {
        elementos: {
          titular: medir(selectoresDeLaPagina.titular),
          parrafo: medir(selectoresDeLaPagina.parrafo),
          boton: medir(selectoresDeLaPagina.boton),
        },
        hero: {
          top: cajaDelHero.top,
          bottom: cajaDelHero.bottom,
          scrollHeight: seccion.scrollHeight,
          clientHeight: seccion.clientHeight,
        },
        documento: { anchoDelContenido: document.documentElement.scrollWidth, anchoDeLaVentana: window.innerWidth },
        posteriores,
      }
    },
    { selectorDelHero: SELECTOR_DEL_HERO, selectores, incluirPosteriores: conPosteriores },
  )
}

/**
 * Lee la temporización, los fotogramas y los valores computados de cada
 * animación por fotogramas clave. La CURVA no se lee del efecto (en una animación
 * CSS su `easing` es `linear`: la curva se aplica a cada tramo entre
 * fotogramas): sale del valor computado de `animation-timing-function` y del
 * `easing` de los fotogramas.
 */
async function leerAnimaciones(page: Page): Promise<readonly AnimacionLeida[]> {
  const selectores = {
    titular: `${SELECTOR_DEL_HERO} h1`,
    parrafo: `${SELECTOR_DEL_HERO} [data-hero-subtitulo]`,
    boton: `${SELECTOR_DEL_HERO} a`,
  }
  return page.evaluate((selectoresDeLaPagina) => {
    const titular = document.querySelector(selectoresDeLaPagina.titular)
    const parrafo = document.querySelector(selectoresDeLaPagina.parrafo)
    const enlace = document.querySelector(selectoresDeLaPagina.boton)
    const rolDe = (destino: Element | null): AnimacionLeida['rol'] => {
      if (destino === null || titular === null || enlace === null) return 'otro'
      if (destino === titular) return 'titular'
      if (destino === parrafo) return 'parrafo'
      // El botón, o el contenedor que lo envuelve (siempre que no envuelva también al titular: eso es la sección).
      return destino === enlace || (destino.contains(enlace) && !destino.contains(titular)) ? 'boton' : 'otro'
    }
    const ajenasALaOpcion = new Set(['offset', 'computedOffset', 'easing', 'composite'])
    return document
      .getAnimations()
      .filter((animacion) => animacion instanceof CSSAnimation)
      .map((animacion) => {
        const efecto = animacion.effect as KeyframeEffect
        const destino = efecto.target
        const tiempos = efecto.getComputedTiming()
        const fotogramas = efecto.getKeyframes()
        const ultimo = fotogramas.find((fotograma) => fotograma.computedOffset === 1)
        const estilo = getComputedStyle(destino as Element)
        return {
          rol: rolDe(destino),
          retardo: Number(tiempos.delay),
          duracion: Number(tiempos.duration),
          fin: Number(tiempos.endTime),
          inicio: typeof animacion.startTime === 'number' ? animacion.startTime : null,
          iteraciones: Number(tiempos.iterations),
          rellenoDelEfecto: String(efecto.getTiming().fill),
          rellenoComputado: estilo.animationFillMode,
          nombreComputado: estilo.animationName,
          curvaComputada: estilo.animationTimingFunction,
          curvasDeLosFotogramas: fotogramas.map((fotograma) => String(fotograma.easing)),
          propiedades: [
            ...new Set(fotogramas.flatMap((fotograma) => Object.keys(fotograma)).filter((clave) => !ajenasALaOpcion.has(clave))),
          ].toSorted(),
          ultimoFotograma: ultimo === undefined ? undefined : { opacity: String(ultimo['opacity']), transform: String(ultimo['transform']) },
        }
      })
  }, selectores)
}

// ---------------------------------------------------------------------------
// Las auditorías: datos medidos -> lista de cláusulas incumplidas. Las usan el
// test real y las páginas sintéticas con defecto (una sola regla: si el test real
// y su prueba de mordida midieran con reglas distintas, la mordida no probaría
// nada del test real).
// ---------------------------------------------------------------------------

function comparar(nombre: string, observado: unknown, esperado: unknown): readonly string[] {
  return JSON.stringify(observado) === JSON.stringify(esperado)
    ? []
    : [`${nombre}: ${JSON.stringify(observado)} y debe ser ${JSON.stringify(esperado)}`]
}

const mismoValorEnTodas = (valor: string): readonly string[] => ROLES.map(() => valor)

/** La mayor diferencia, en px, entre las cuatro medidas de dos cajas. */
function distanciaEntreCajas(a: Caja, b: Caja): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.width - b.width), Math.abs(a.height - b.height))
}

interface CapturaDeLaEntrada {
  readonly animaciones: readonly AnimacionLeida[]
  readonly inicio: MedidaDeUnInstante
  readonly final: MedidaDeUnInstante
  readonly animacionesAntesDeCancelar: number
  /** Medida con las animaciones canceladas: lo que dice la hoja sin animación. */
  readonly cancelado: MedidaDeUnInstante
}

/** hero_reducido_con_animacion @s5: los valores aprobados de la entrada. */
function incumplimientosDeLosValoresAprobados(captura: CapturaDeLaEntrada): readonly string[] {
  const { inicio, final, cancelado } = captura
  const animaciones = captura.animaciones.toSorted((a, b) => a.retardo - b.retardo)
  const de = <T,>(leer: (animacion: AnimacionLeida) => T): T[] => animaciones.map(leer)
  const incumplidas: string[] = [
    ...comparar('hay animaciones', animaciones.length, ANIMACIONES_DEL_HERO),
    ...comparar('destinos por orden de retardo', de((a) => a.rol), ROLES),
    ...comparar('duraciones', de((a) => a.duracion), ROLES.map(() => DURACION_MS)),
    ...comparar('retardos', de((a) => a.retardo), RETARDOS_MS),
    ...comparar('instantes de fin', de((a) => a.fin), FIN_DE_CADA_ANIMACION_MS),
    // DOCUMENTAL, NO es una puerta: con el reloj congelado `startTime` vale 0 para CUALQUIER animación, también
    // para una que nazca 400 ms después de `load` (MEDIDO en Chromium 151), así que esta cláusula se cumple por
    // construcción y ninguna hoja de estilos puede ponerla en rojo. Los tres elementos se montan en el mismo
    // commit, y esa es la garantía real de que «empiezan en el mismo instante».
    ...comparar('empiezan en el mismo instante', new Set(de((a) => a.inicio)).size, 1),
    ...comparar('curva computada', de((a) => a.curvaComputada), mismoValorEnTodas(CURVA)),
    ...comparar('curvas de los fotogramas', de((a) => [...new Set(a.curvasDeLosFotogramas)]), ROLES.map(() => [CURVA])),
    ...comparar('iteraciones', de((a) => a.iteraciones), ROLES.map(() => 1)),
    ...comparar('relleno del efecto', de((a) => a.rellenoDelEfecto), mismoValorEnTodas(RELLENO)),
    ...comparar('relleno computado', de((a) => a.rellenoComputado), mismoValorEnTodas(RELLENO)),
    ...comparar('propiedades animadas', de((a) => a.propiedades), ROLES.map(() => PROPIEDADES_ANIMADAS)),
    ...comparar('último fotograma (offset 1)', de((a) => a.ultimoFotograma), ROLES.map(() => ({ opacity: '1', transform: 'none' }))),
  ]

  for (const rol of ROLES) {
    const base = cancelado.elementos[rol]
    const alPrincipio = inicio.elementos[rol]
    const alFinal = final.elementos[rol]
    if (alPrincipio.opacidadEfectiva > TOLERANCIA_DE_OPACIDAD_NULA) {
      incumplidas.push(`${rol}: en el instante 0 la opacidad efectiva es ${alPrincipio.opacidadEfectiva} y debe ser 0`)
    }
    const desplazamientoInicial = base.caja.x - alPrincipio.caja.x
    if (Math.abs(desplazamientoInicial - DESPLAZAMIENTO_PX) > TOLERANCIA_DE_CAJA_PX) {
      incumplidas.push(`${rol}: en el instante 0 la caja está ${desplazamientoInicial} px a la izquierda de su sitio y debe estar ${DESPLAZAMIENTO_PX}`)
    }
    if (Math.abs(base.caja.y - alPrincipio.caja.y) > TOLERANCIA_DE_CAJA_PX) {
      incumplidas.push(`${rol}: en el instante 0 la caja cambia de altura (${base.caja.y} frente a ${alPrincipio.caja.y})`)
    }
    if (alFinal.opacidadEfectiva < OPACIDAD_MINIMA_AL_FINAL) {
      incumplidas.push(`${rol}: en el último instante activo la opacidad efectiva es ${alFinal.opacidadEfectiva} y debe ser al menos ${OPACIDAD_MINIMA_AL_FINAL}`)
    }
    const desplazamientoFinal = Math.abs(alFinal.caja.x - base.caja.x)
    if (desplazamientoFinal >= TOLERANCIA_DE_CAJA_PX) {
      incumplidas.push(`${rol}: en el último instante activo la caja sigue ${desplazamientoFinal} px de su sitio y debe estar a menos de ${TOLERANCIA_DE_CAJA_PX}`)
    }
    if (base.ancestrosConOpacidadDistintaDe1 !== 0) {
      incumplidas.push(`${rol}: con las animaciones canceladas ${base.ancestrosConOpacidadDistintaDe1} ancestros tienen una opacidad distinta de 1`)
    }
    if (base.willChange !== 'auto') {
      incumplidas.push(`${rol}: con las animaciones canceladas declara "will-change: ${base.willChange}"`)
    }
  }
  return incumplidas
}

/** hero_reducido_con_animacion @s7: si la animación no corre, el estado base es el final y es visible. */
function incumplimientosDeLaCancelacion(
  captura: Pick<CapturaDeLaEntrada, 'final' | 'cancelado' | 'animacionesAntesDeCancelar'>,
): readonly string[] {
  const { final, cancelado } = captura
  const incumplidas: string[] = [...comparar('animaciones en curso antes de cancelar', captura.animacionesAntesDeCancelar, ANIMACIONES_DEL_HERO)]
  incumplidas.push(...comparar('elementos comprobados', Object.keys(cancelado.elementos).length, ANIMACIONES_DEL_HERO))

  for (const rol of ROLES) {
    const sinAnimacion = cancelado.elementos[rol]
    if (Math.abs(sinAnimacion.opacidadEfectiva - 1) > TOLERANCIA_DE_OPACIDAD_NULA) {
      incumplidas.push(`${rol}: cancelada la animación la opacidad efectiva es ${sinAnimacion.opacidadEfectiva} y debe ser 1`)
    }
    if (sinAnimacion.visibilidad !== 'visible') {
      incumplidas.push(`${rol}: cancelada la animación su visibilidad es "${sinAnimacion.visibilidad}"`)
    }
    if (sinAnimacion.transform !== 'none') {
      incumplidas.push(`${rol}: cancelada la animación su transform es "${sinAnimacion.transform}" y debe ser "none"`)
    }
    if (sinAnimacion.ancestrosConOpacidadDistintaDe1 !== 0) {
      incumplidas.push(`${rol}: cancelada la animación ${sinAnimacion.ancestrosConOpacidadDistintaDe1} ancestros tienen una opacidad distinta de 1`)
    }
    if (sinAnimacion.ocultoParaElArbol) {
      incumplidas.push(`${rol}: cancelada la animación está oculto para el árbol de accesibilidad`)
    }
    if (!sinAnimacion.dentroDeLaVentana) {
      incumplidas.push(`${rol}: cancelada la animación queda fuera de la pantalla`)
    }
    const distancia = distanciaEntreCajas(sinAnimacion.caja, final.elementos[rol].caja)
    if (distancia > TOLERANCIA_DE_CAJA_PX) {
      incumplidas.push(`${rol}: su caja cancelada difiere ${distancia} px de la del último instante activo`)
    }
  }
  return incumplidas
}

// ---------------------------------------------------------------------------
// Páginas sintéticas: la MORDIDA de cada comprobación. Cada defecto se cuela en
// una hoja de estilos de un hero de la misma forma que el real, se mide con las
// mismas funciones y la misma auditoría, y tiene que salir en rojo.
// ---------------------------------------------------------------------------

const ORIGEN_SINTETICO = 'http://sintetica.test'

/** Un hero con la estructura del real (`#inicio > section[data-a-sangre]`) y una sección posterior; `css` es el defecto. */
function paginaSintetica(css: string): string {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>hero sintético</title>
<style>
  body { margin: 0; }
  #inicio section { position: relative; display: grid; align-items: center; min-height: 100svh; overflow: hidden; }
  [data-hero-contenido] { padding: 32px 24px; }
  h1 { margin: 0; font-size: 33px; }
  [data-hero-subtitulo] { margin: 16px 0 0; }
  [data-hero-acciones] { display: flex; margin-top: 32px; }
  #posterior { padding: 48px 24px; }
  ${css}
</style></head>
<body>
  <div id="inicio"><section data-a-sangre><div data-hero-contenido>
    <h1>Titular</h1>
    <p data-hero-subtitulo>Párrafo descriptivo de la clínica.</p>
    <div data-hero-acciones><a href="#reservar">Reservar cita</a></div>
  </div></section></div>
  <section id="posterior"><h2>Otra sección</h2><p>Contenido posterior al hero.</p></section>
</body></html>`
}

async function cargarPaginaSintetica(page: Page, css: string, ancho = 1440, alto = 900): Promise<void> {
  await page.route(`${ORIGEN_SINTETICO}/**`, (ruta) => ruta.fulfill({ contentType: 'text/html', body: paginaSintetica(css) }))
  await page.setViewportSize({ width: ancho, height: alto })
  await page.goto(`${ORIGEN_SINTETICO}/`)
}

interface OpcionesDeLaEntrada {
  readonly duracion?: string
  readonly curva?: string
  readonly relleno?: string
  readonly iteraciones?: string
  readonly retardos?: readonly [string, string, string]
  readonly desde?: string
  readonly hasta?: string
  readonly destinoDelBoton?: string
  readonly consulta?: string
  readonly extra?: string
  readonly fueraDeLaConsulta?: string
}

const CONSULTA_SIN_PREFERENCIA = '(prefers-reduced-motion: no-preference)'

/** La entrada BIEN escrita, dentro de `no-preference`, con la forma de la real; cada defecto cambia UNA cosa. */
function cssDeLaEntrada(opciones: OpcionesDeLaEntrada = {}): string {
  const {
    duracion = '700ms',
    curva = 'ease-out',
    relleno = 'backwards',
    iteraciones = '',
    retardos = ['0ms', '120ms', '240ms'],
    desde = 'opacity: 0; transform: translateX(-40px);',
    hasta = 'opacity: 1; transform: none;',
    destinoDelBoton = '[data-hero-acciones]',
    consulta = CONSULTA_SIN_PREFERENCIA,
    extra = '',
    fueraDeLaConsulta = '',
  } = opciones
  const animacion = (retardo: string): string => `animation: entrada ${duracion} ${curva} ${retardo} ${relleno} ${iteraciones};`
  return `
  @media ${consulta} {
    @keyframes entrada { from { ${desde} } to { ${hasta} } }
    h1 { ${animacion(retardos[0])} }
    [data-hero-subtitulo] { ${animacion(retardos[1])} }
    ${destinoDelBoton} { ${animacion(retardos[2])} }
    ${extra}
  }
  ${fueraDeLaConsulta}`
}

/** La misma secuencia que hacen los tests reales, para las páginas sintéticas. */
async function capturarLaEntrada(page: Page): Promise<CapturaDeLaEntrada> {
  await colocarAnimaciones(page, 'inicio')
  const animaciones = await leerAnimaciones(page)
  const inicio = await medirElementos(page)
  await colocarAnimaciones(page, 'final')
  const final = await medirElementos(page)
  const animacionesAntesDeCancelar = await cancelarAnimaciones(page)
  const cancelado = await medirElementos(page)
  return { animaciones, inicio, final, animacionesAntesDeCancelar, cancelado }
}

// ---------------------------------------------------------------------------
// @s2 — ningún dato se pierde
// ---------------------------------------------------------------------------

/** Los tres datos, leídos de la fuente única de datos de negocio: nunca de una lista escrita en el test. */
const TELEFONO_PRINCIPAL = datosNegocio.telefonoClinica.textoVisible
const DIGITOS_DEL_TELEFONO = TELEFONO_PRINCIPAL.replace(/\D/g, '')
const TRAMOS_DE_HORARIO = datosNegocio.horario
const LOCALIDAD = datosNegocio.direccion.localidad

interface DatosABuscar {
  readonly digitosDelTelefono: string
  readonly tramos: readonly { readonly dias: string; readonly horas: string }[]
  readonly localidad: string
}

const DATOS_A_BUSCAR: DatosABuscar = {
  digitosDelTelefono: DIGITOS_DEL_TELEFONO,
  tramos: TRAMOS_DE_HORARIO,
  localidad: LOCALIDAD,
}

/**
 * Cuántas veces aparece cada uno de los tres datos DENTRO de un elemento. Lee
 * `textContent` y compara sin distinguir mayúsculas: la píldora del hero antiguo
 * pintaba la localidad con `text-transform: uppercase`, y su `innerText` salía
 * «GALAPAGAR · MADRID», así que un recuento sensible a mayúsculas sobre
 * `innerText` daría 0 con el defecto presente (un 0 por vacuidad). Sin nada de
 * fuera: Playwright serializa la función.
 */
function contarApariciones(
  elemento: Element,
  datos: DatosABuscar,
): { telefono: number; horario: number; localidad: number } {
  const texto = (elemento.textContent ?? '').toLowerCase()
  const digitos = texto.replace(/\D/g, '')
  const enlacesDeLlamada = elemento.querySelectorAll('a[href^="tel:"]').length
  const coincidencias = (haystack: string, aguja: string): number => haystack.split(aguja).length - 1
  const tramosPresentes = datos.tramos.filter(
    (tramo) => texto.includes(tramo.dias.toLowerCase()) || texto.includes(tramo.horas.toLowerCase()),
  )
  return {
    telefono: coincidencias(digitos, datos.digitosDelTelefono) + enlacesDeLlamada,
    horario: tramosPresentes.length,
    localidad: coincidencias(texto, datos.localidad.toLowerCase()),
  }
}

/** Abre una pregunta del acordeón excluyente (cierra la que hubiera abierta) y devuelve su respuesta. */
async function abrirRespuestaDelFaq(page: Page, pregunta: string): Promise<Locator> {
  await page.getByRole('button', { name: pregunta }).click()
  const respuesta = page.locator('#faq').locator(`section[aria-label="${pregunta}"]`)
  await expect(respuesta).toBeVisible()
  return respuesta
}

/** Cuántos enlaces de llamada dentro del ámbito se reconocen por sus dígitos, tanto en el nombre visible como en el destino. */
async function contarEnlacesDelTelefono(ambito: Locator): Promise<number> {
  return ambito.locator('a[href^="tel:"]').evaluateAll(
    (enlaces, digitos) =>
      enlaces.filter(
        (enlace) =>
          (enlace.textContent ?? '').replace(/\D/g, '') === digitos &&
          (enlace.getAttribute('href') ?? '').replace(/\D/g, '').endsWith(digitos),
      ).length,
    DIGITOS_DEL_TELEFONO,
  )
}

test.describe('@s2 de hero_reducido_con_animacion: los datos que salen del hero siguen publicados en el resto de la portada', () => {
  test('dentro de la bienvenida el recuento de cada dato es 0, y fuera siguen el teléfono, los tres tramos de horario y la localidad', async ({
    page,
  }) => {
    await cargarPortada(page, 1440, 900)

    // Dentro del hero: cero apariciones de cada dato.
    const dentro = await page.locator(SELECTOR_DEL_HERO).evaluate(contarApariciones, DATOS_A_BUSCAR)
    expect(dentro).toEqual({ telefono: 0, horario: 0, localidad: 0 })
    expect(await page.locator(SELECTOR_DEL_HERO).evaluate((hero) => (hero.textContent ?? '').length)).toBeGreaterThan(0)

    // Teléfono principal, como enlace de llamada reconocido por sus dígitos.
    const contacto = page.getByRole('region', { name: 'Información de contacto' })
    const pie = page.locator('footer')
    const enContacto = await contarEnlacesDelTelefono(contacto)
    const enElPie = await contarEnlacesDelTelefono(pie)
    const respuestaDeCita = await abrirRespuestaDelFaq(page, PREGUNTA_DE_CITA)
    const enLaRespuestaDeCita = await contarEnlacesDelTelefono(respuestaDeCita)
    expect(enContacto).toBeGreaterThan(0)
    expect(enElPie).toBeGreaterThan(0)
    expect(enLaRespuestaDeCita).toBeGreaterThan(0)

    // Los tres tramos de horario, con coincidencia literal con la fuente única, en Contacto y en la columna de Reservar.
    for (const tramo of TRAMOS_DE_HORARIO) {
      const enContactoPorPareja = await contacto
        .locator('dl > div')
        .evaluateAll(
          (filas, buscado) =>
            filas.filter(
              (fila) =>
                fila.querySelector('dt')?.textContent === buscado.dias &&
                fila.querySelector('dd')?.textContent === buscado.horas,
            ).length,
          tramo,
        )
      const enReservarPorPareja = await page
        .locator('#reservar [data-reserva-horario] li')
        .evaluateAll(
          (filas, buscado) =>
            filas.filter(
              (fila) => (fila.textContent ?? '').includes(buscado.dias) && (fila.textContent ?? '').includes(buscado.horas),
            ).length,
          tramo,
        )
      expect(enContactoPorPareja, `Contacto: ${tramo.dias}`).toBeGreaterThan(0)
      expect(enReservarPorPareja, `Reservar: ${tramo.dias}`).toBeGreaterThan(0)
    }

    // El FAQ es un acordeón excluyente: se abre una, se lee, se abre la otra y se lee la suya.
    const respuestaDeHorario = await abrirRespuestaDelFaq(page, PREGUNTA_DE_HORARIO)
    const textoDeHorario = (await respuestaDeHorario.textContent()) ?? ''
    expect(textoDeHorario.toLowerCase()).toContain(textoHorario(TRAMOS_DE_HORARIO).toLowerCase())

    // La localidad, en la dirección de Contacto y en la descripción del pie.
    const direccion = (await contacto.getByRole('group', { name: 'Dirección' }).textContent()) ?? ''
    const descripcionDelPie = (await page.locator('footer [data-pie-marca]').textContent()) ?? ''
    expect(direccion.toLowerCase()).toContain(LOCALIDAD.toLowerCase())
    expect(descripcionDelPie.toLowerCase()).toContain(LOCALIDAD.toLowerCase())
  })

  test('la comprobación muerde: sobre un hero sintético que aún lleve la píldora, la franja y el botón de llamada, cada recuento sale mayor que 0', async ({
    page,
  }) => {
    // El hero ANTIGUO, construido con los datos de la fuente única. La píldora
    // pinta la localidad en mayúsculas con CSS, como la real.
    const franja = TRAMOS_DE_HORARIO.map((tramo) => `<div><dt>${tramo.dias}</dt><dd>${tramo.horas}</dd></div>`).join('')
    await page.setContent(`
      <section>
        <p style="text-transform: uppercase">${LOCALIDAD} · ${datosNegocio.direccion.region}</p>
        <h1>Titular</h1>
        <div><a href="#reservar">Reservar cita</a><a href="tel:+34${DIGITOS_DEL_TELEFONO}">Llamar ${TELEFONO_PRINCIPAL}</a></div>
        <dl>${franja}</dl>
      </section>`)

    const hero = page.locator('section')
    const recuentos = await hero.evaluate(contarApariciones, DATOS_A_BUSCAR)

    expect(recuentos.telefono).toBeGreaterThan(0)
    expect(recuentos.horario).toBe(TRAMOS_DE_HORARIO.length)
    expect(recuentos.localidad).toBeGreaterThan(0)
    // La trampa que evita leer `textContent`: lo que se VE sale en mayúsculas.
    expect(await hero.evaluate((nodo) => (nodo as HTMLElement).innerText)).toContain(LOCALIDAD.toUpperCase())
  })

  test('la comprobación muerde por separado: cada dato suelto en un hero sintético se detecta', async ({ page }) => {
    for (const [dato, html] of [
      ['telefono', `<p>Llámanos al ${TELEFONO_PRINCIPAL}</p>`],
      ['horario', `<p>${TRAMOS_DE_HORARIO[0]?.dias}</p>`],
      ['localidad', `<p>${LOCALIDAD}</p>`],
    ] as const) {
      await page.setContent(`<section>${html}</section>`)
      const recuentos = await page.locator('section').evaluate(contarApariciones, DATOS_A_BUSCAR)
      expect(recuentos[dato], `un hero con solo «${dato}» debe contarlo`).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// @s12 — el hero es de pantalla completa
// ---------------------------------------------------------------------------

interface TamanoDeVentana {
  readonly ancho: number
  readonly alto: number
}

/** Los cinco tamaños habituales: la sección mide exactamente el alto de la ventana. */
const TAMANOS_HABITUALES: readonly TamanoDeVentana[] = [
  { ancho: 1440, alto: 900 },
  { ancho: 1024, alto: 768 },
  { ancho: 768, alto: 1024 },
  { ancho: 375, alto: 812 },
  { ancho: 320, alto: 900 },
]
/** El tamaño bajo: el contenido más la cabecera no caben y la sección debe crecer en vez de recortar. */
const TAMANO_BAJO: TamanoDeVentana = { ancho: 812, alto: 300 }
const TOLERANCIA_DE_ALTURA_PX = 0.5
const TOLERANCIA_DE_CENTRADO_PX = 1
const TOTAL_DE_TAMANOS = 6

interface MedidaDelHero {
  readonly seccionTop: number
  readonly seccionBottom: number
  readonly contenidoTop: number
  readonly contenidoBottom: number
  readonly alturaDeLaCabecera: number
  readonly scrollHeight: number
  readonly clientHeight: number
}

/** La caja del contenido va del borde superior del titular al borde inferior del botón. */
async function medirElHero(page: Page): Promise<MedidaDelHero> {
  return page.locator(SELECTOR_DEL_HERO).evaluate((seccion) => {
    const cajaDe = (selector: string): DOMRect => (seccion.querySelector(selector) as Element).getBoundingClientRect()
    const titular = cajaDe('h1')
    const boton = cajaDe('a')
    const caja = seccion.getBoundingClientRect()
    const alturaDeLaCabecera = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--altura-cabecera'),
    )
    return {
      seccionTop: caja.top,
      seccionBottom: caja.bottom,
      contenidoTop: titular.top,
      contenidoBottom: boton.bottom,
      alturaDeLaCabecera,
      scrollHeight: seccion.scrollHeight,
      clientHeight: seccion.clientHeight,
    }
  })
}

/** Se «recorta» si el contenido sobresale de la sección por abajo o por arriba, o si la sección desborda su propio alto. */
function recortaContenido(medida: MedidaDelHero): boolean {
  return (
    medida.contenidoBottom > medida.seccionBottom + TOLERANCIA_DE_ALTURA_PX ||
    medida.contenidoTop < medida.seccionTop ||
    medida.scrollHeight > medida.clientHeight
  )
}

test.describe('@s12 de hero_reducido_con_animacion: la sección de bienvenida mide al menos la altura de la ventana, exactamente esa cuando el contenido cabe, y su contenido se centra en vertical', () => {
  test('en los cinco tamaños habituales mide exactamente la altura de la ventana (900 y no 756 a 1440x900; la de la ventana también a 375 y a 320), no recorta y centra su contenido bajo la cabecera', async ({
    page,
  }) => {
    let tamanosMedidos = 0

    // El Given de @s12: el reloj de animaciones congelado ANTES de navegar y las animaciones colocadas en el
    // último instante de su fase activa. La entrada solo desplaza en horizontal, pero así la medida no tiene carrera.
    await congelarRelojDeAnimaciones(page)

    for (const { ancho, alto } of TAMANOS_HABITUALES) {
      await cargarPortada(page, ancho, alto)
      await colocarAnimaciones(page, 'final')
      const medida = await medirElHero(page)
      const tamano = `${ancho}x${alto}`
      const alturaDeLaSeccion = medida.seccionBottom - medida.seccionTop

      expect(Math.abs(alturaDeLaSeccion - alto), `${tamano}: la sección mide ${alturaDeLaSeccion}`).toBeLessThanOrEqual(
        TOLERANCIA_DE_ALTURA_PX,
      )
      expect(recortaContenido(medida), `${tamano}: el hero no recorta contenido`).toBe(false)

      // La zona libre empieza a la altura de la cabecera por debajo del borde superior de la sección.
      const huecoSuperior = medida.contenidoTop - (medida.seccionTop + medida.alturaDeLaCabecera)
      const huecoInferior = medida.seccionBottom - medida.contenidoBottom
      expect(medida.alturaDeLaCabecera, `${tamano}: altura de la cabecera leída`).toBeGreaterThan(0)
      expect(
        Math.abs(huecoSuperior - huecoInferior),
        `${tamano}: hueco superior ${huecoSuperior} frente al inferior ${huecoInferior}`,
      ).toBeLessThanOrEqual(TOLERANCIA_DE_CENTRADO_PX)
      tamanosMedidos += 1
    }

    await cargarPortada(page, TAMANO_BAJO.ancho, TAMANO_BAJO.alto)
    await colocarAnimaciones(page, 'final')
    const medidaBaja = await medirElHero(page)
    // Premisa: si el contenido dejara de superar la ventana a 812x300, el escenario fallaría en voz alta.
    const alturaDelContenido = medidaBaja.contenidoBottom - medidaBaja.contenidoTop
    expect(alturaDelContenido + medidaBaja.alturaDeLaCabecera).toBeGreaterThan(TAMANO_BAJO.alto)
    // La sección CRECE (`min-height`, no `height`): al menos la ventana, y sin recortar.
    expect(medidaBaja.seccionBottom - medidaBaja.seccionTop).toBeGreaterThanOrEqual(TAMANO_BAJO.alto)
    expect(recortaContenido(medidaBaja), 'a 812x300 el hero no recorta contenido').toBe(false)
    tamanosMedidos += 1

    expect(tamanosMedidos).toBe(TOTAL_DE_TAMANOS)
  })
})

// ---------------------------------------------------------------------------
// @s5 — la entrada animada, con los valores que Pablo aprobó
// ---------------------------------------------------------------------------

test.describe('@s5 de hero_reducido_con_animacion: con movimiento permitido los tres elementos entran escalonados con los valores aprobados', () => {
  test('hay exactamente 3 animaciones con la duración, los retardos, la curva, el relleno y las propiedades aprobados, y en el instante 0 y en el último activo están donde deben', async ({
    page,
  }) => {
    await congelarRelojDeAnimaciones(page)
    await cargarPortada(page, 1440, 900)

    await colocarAnimaciones(page, 'inicio')
    const animaciones = await leerAnimaciones(page)
    const inicio = await medirElementos(page)
    await colocarAnimaciones(page, 'final')
    const final = await medirElementos(page)
    const animacionesAntesDeCancelar = await cancelarAnimaciones(page)
    const cancelado = await medirElementos(page)

    // Anti-vacuidad: las tres leídas de verdad y con destinos reconocidos.
    expect(animaciones).toHaveLength(ANIMACIONES_DEL_HERO)
    expect(animaciones.every((animacion) => animacion.rol !== 'otro')).toBe(true)
    expect(
      incumplimientosDeLosValoresAprobados({ animaciones, inicio, final, animacionesAntesDeCancelar, cancelado }),
    ).toEqual([])
  })
})

const CASOS_DE_LA_ENTRADA_QUE_CUMPLEN: ReadonlyArray<readonly [string, OpcionesDeLaEntrada]> = [
  ['la entrada bien escrita', {}],
  ['la animación colgada del enlace del botón en vez de su contenedor', { destinoDelBoton: '[data-hero-acciones] a' }],
]

const DEFECTOS_DE_LOS_VALORES: ReadonlyArray<readonly [string, OpcionesDeLaEntrada, string]> = [
  ['una duración de 1250 ms en vez de 700 ms', { duracion: '1250ms' }, 'duraciones'],
  ['un retardo de 150 ms en el párrafo en vez de 120 ms', { retardos: ['0ms', '150ms', '240ms'] }, 'retardos'],
  ['el relleno "both" en vez de "backwards"', { relleno: 'both' }, 'relleno computado'],
  ['el relleno "forwards" en vez de "backwards"', { relleno: 'forwards' }, 'relleno computado'],
  ['sin relleno: el párrafo esperaría visible en su sitio durante su retardo', { relleno: '' }, 'en el instante 0 la opacidad efectiva'],
  ['la curva "ease" en vez de "ease-out"', { curva: 'ease' }, 'curva computada'],
  ['una animación "infinite"', { iteraciones: 'infinite' }, 'iteraciones'],
  ['el desplazamiento parte de la DERECHA', { desde: 'opacity: 0; transform: translateX(40px);' }, 'en el instante 0 la caja está'],
  ['el desplazamiento es del 100 % y no de 40 px', { desde: 'opacity: 0; transform: translateX(-100%);' }, 'en el instante 0 la caja está'],
  [
    'se anima también el ancho',
    { desde: 'opacity: 0; transform: translateX(-40px); width: 10px;', hasta: 'opacity: 1; transform: none; width: 200px;' },
    'propiedades animadas',
  ],
  [
    'se anima margin-left en vez de transform',
    { desde: 'opacity: 0; margin-left: -40px;', hasta: 'opacity: 1; margin-left: 0;' },
    'propiedades animadas',
  ],
  ['el último fotograma deja la opacidad a 0', { hasta: 'opacity: 0; transform: none;' }, 'último fotograma'],
  ['el último fotograma deja un desplazamiento residual de 0,3 px', { hasta: 'opacity: 1; transform: translateX(0.3px);' }, 'último fotograma'],
  ['un "will-change" permanente en el titular', { extra: 'h1 { will-change: transform; }' }, 'will-change'],
  ['un ancestro a media opacidad', { extra: '[data-hero-contenido] { opacity: 0.5; }' }, 'ancestros tienen una opacidad distinta de 1'],
  ['una cuarta animación, sobre la sección', { extra: '#inicio section { animation: entrada 700ms ease-out backwards; }' }, 'hay animaciones'],
  ['falta la animación del botón', { destinoDelBoton: '.ninguno' }, 'hay animaciones'],
  ['los retardos en orden inverso', { retardos: ['240ms', '120ms', '0ms'] }, 'destinos por orden de retardo'],
]

test.describe('@s5 de hero_reducido_con_animacion: la comprobación muerde (páginas sintéticas con el reloj congelado antes de navegar)', () => {
  for (const [descripcion, opciones] of CASOS_DE_LA_ENTRADA_QUE_CUMPLEN) {
    test(`no incumple nada: ${descripcion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await congelarRelojDeAnimaciones(page)
      await cargarPaginaSintetica(page, cssDeLaEntrada(opciones))

      const captura = await capturarLaEntrada(page)

      expect(captura.animaciones).toHaveLength(ANIMACIONES_DEL_HERO)
      expect(incumplimientosDeLosValoresAprobados(captura)).toEqual([])
      expect(incumplimientosDeLaCancelacion(captura)).toEqual([])
    })
  }

  for (const [descripcion, opciones, fragmento] of DEFECTOS_DE_LOS_VALORES) {
    test(`incumple: ${descripcion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await congelarRelojDeAnimaciones(page)
      await cargarPaginaSintetica(page, cssDeLaEntrada(opciones))

      const captura = await capturarLaEntrada(page)

      expect(incumplimientosDeLosValoresAprobados(captura).join('\n')).toContain(fragmento)
    })
  }
})

// ---------------------------------------------------------------------------
// @s7 — si la animación no corre, el contenido se ve en su sitio
// ---------------------------------------------------------------------------

test.describe('@s7 de hero_reducido_con_animacion: si la animación no se ejecuta, el titular, el párrafo y el botón quedan visibles en su sitio', () => {
  test('cancelando las animaciones los tres tienen opacidad 1, visibilidad visible, transform none y la caja del último instante activo', async ({
    page,
  }) => {
    await congelarRelojDeAnimaciones(page)
    await cargarPortada(page, 1440, 900)

    await colocarAnimaciones(page, 'final')
    const final = await medirElementos(page)
    const animacionesAntesDeCancelar = await cancelarAnimaciones(page)
    const cancelado = await medirElementos(page)

    expect(animacionesAntesDeCancelar).toBe(ANIMACIONES_DEL_HERO)
    expect(incumplimientosDeLaCancelacion({ final, animacionesAntesDeCancelar, cancelado })).toEqual([])
    // El árbol de accesibilidad: `getByRole` no encuentra lo que está oculto para él (aria-hidden, display none, visibility hidden).
    const hero = page.locator(SELECTOR_DEL_HERO)
    await expect(hero.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(hero.locator('[data-hero-subtitulo]')).toBeVisible()
    await expect(hero.getByRole('link', { name: 'Reservar cita' })).toBeVisible()
  })
})

const DEFECTOS_DEL_ESTADO_BASE: ReadonlyArray<readonly [string, OpcionesDeLaEntrada, string]> = [
  ['opacity: 0 en el estado base del titular', { fueraDeLaConsulta: 'h1 { opacity: 0; }' }, 'la opacidad efectiva es 0'],
  ['visibility: hidden en el estado base del párrafo', { fueraDeLaConsulta: '[data-hero-subtitulo] { visibility: hidden; }' }, 'su visibilidad es "hidden"'],
  ['un transform en el estado base del titular', { fueraDeLaConsulta: 'h1 { transform: translateX(-40px); }' }, 'su transform es'],
  [
    'un transform en el estado base del contenedor del botón (el enlace no lo declara: lo ve la caja)',
    { fueraDeLaConsulta: '[data-hero-acciones] { transform: translateX(-40px); }' },
    'su caja cancelada difiere',
  ],
  ['opacity: 0 en un contenedor de los tres', { fueraDeLaConsulta: '[data-hero-contenido] { opacity: 0; }' }, 'ancestros tienen una opacidad distinta de 1'],
  ['un párrafo desplazado fuera de la pantalla', { fueraDeLaConsulta: '[data-hero-subtitulo] { margin-left: -500px; }' }, 'queda fuera de la pantalla'],
  ['la animación del botón falta: no había 3 antes de cancelar', { destinoDelBoton: '.ninguno' }, 'animaciones en curso antes de cancelar'],
]

test.describe('@s7 de hero_reducido_con_animacion: la comprobación muerde (páginas sintéticas)', () => {
  for (const [descripcion, opciones, fragmento] of DEFECTOS_DEL_ESTADO_BASE) {
    test(`incumple: ${descripcion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await congelarRelojDeAnimaciones(page)
      await cargarPaginaSintetica(page, cssDeLaEntrada(opciones))

      const captura = await capturarLaEntrada(page)

      expect(incumplimientosDeLaCancelacion(captura).join('\n')).toContain(fragmento)
    })
  }

  test('incumple: un elemento oculto para el árbol de accesibilidad (aria-hidden), que ninguna hoja de estilos puede provocar', () => {
    const sano: MedidaDeUnElemento = {
      opacidadEfectiva: 1,
      caja: { x: 24, y: 100, width: 300, height: 40 },
      visibilidad: 'visible',
      transform: 'none',
      willChange: 'auto',
      ancestrosConOpacidadDistintaDe1: 0,
      ocultoParaElArbol: false,
      dentroDeLaVentana: true,
    }
    const instante = (parrafo: MedidaDeUnElemento): MedidaDeUnInstante => ({
      elementos: { titular: sano, parrafo, boton: sano },
      hero: { top: 0, bottom: 900, scrollHeight: 900, clientHeight: 900 },
      documento: { anchoDelContenido: 1440, anchoDeLaVentana: 1440 },
      posteriores: [],
    })
    const captura = { final: instante(sano), cancelado: instante(sano), animacionesAntesDeCancelar: ANIMACIONES_DEL_HERO }

    expect(incumplimientosDeLaCancelacion(captura)).toEqual([])
    expect(
      incumplimientosDeLaCancelacion({ ...captura, cancelado: instante({ ...sano, ocultoParaElArbol: true }) }).join('\n'),
    ).toContain('oculto para el árbol de accesibilidad')
  })
})

// ---------------------------------------------------------------------------
// @s6 — con movimiento reducido no se anima nada y los tres se ven desde el primer fotograma
// ---------------------------------------------------------------------------

interface FotogramaAnotado {
  readonly opacidades: Readonly<Record<Rol, number>>
  readonly ancestrosConOpacidadDistintaDe1: number
  readonly animaciones: number
  readonly nombres: Readonly<Record<Rol, string>>
  readonly retardos: Readonly<Record<Rol, string>>
  readonly cajas: Readonly<Record<Rol, Caja>>
}

interface RegistroDeFotogramas {
  readonly fotogramas: readonly FotogramaAnotado[]
  readonly iniciosDeAnimacion: number
}

/** Durante cuánto tiempo, desde que arranca la navegación, el observador anota fotogramas. */
const VENTANA_DEL_REGISTRO_MS = 3000
/** «Sus cajas coinciden con las que tienen 2 segundos después». */
const DOS_SEGUNDOS_MS = 2000

/**
 * Instala, ANTES de que cargue la página, un observador que anota cada fotograma
 * pintado desde el primero en el que existe el hero. Se anota dentro de
 * `requestAnimationFrame`: el estilo que se lee ahí es el que se va a pintar en
 * ese fotograma. Medir después de un `waitForLoadState` llegaría tarde y vería ya
 * el estado final. Cuenta también los `animationstart`, que se disparan aunque la
 * animación ya haya terminado cuando se lee.
 */
async function instalarObservadorDeFotogramas(page: Page): Promise<void> {
  const selectores = {
    titular: `${SELECTOR_DEL_HERO} h1`,
    parrafo: `${SELECTOR_DEL_HERO} [data-hero-subtitulo]`,
    boton: `${SELECTOR_DEL_HERO} a`,
  }
  await page.addInitScript(
    ({ selectorDelHero, selectores: selectoresDeLaPagina, ventanaMs }) => {
      const registro = { fotogramas: [] as FotogramaAnotado[], iniciosDeAnimacion: 0 }
      Object.assign(window, { registroDeFotogramas: registro })
      document.addEventListener(
        'animationstart',
        () => {
          registro.iniciosDeAnimacion += 1
        },
        true,
      )
      const anotar = (): void => {
        const seccion = document.querySelector(selectorDelHero)
        const titular = document.querySelector(selectoresDeLaPagina.titular)
        const parrafo = document.querySelector(selectoresDeLaPagina.parrafo)
        const boton = document.querySelector(selectoresDeLaPagina.boton)
        if (seccion !== null && titular !== null && parrafo !== null && boton !== null) {
          let ancestrosConOpacidadDistintaDe1 = 0
          const opacidadEfectiva = (elemento: Element): number => {
            let efectiva = 1
            for (let nodo: Element | null = elemento; nodo !== null; nodo = nodo === seccion ? null : nodo.parentElement) {
              const propia = Number(getComputedStyle(nodo).opacity)
              efectiva *= propia
              if (nodo !== elemento && propia !== 1) {
                ancestrosConOpacidadDistintaDe1 += 1
              }
            }
            return efectiva
          }
          const caja = (elemento: Element): Caja => {
            const { x, y, width, height } = elemento.getBoundingClientRect()
            return { x, y, width, height }
          }
          const nombre = (elemento: Element): string => getComputedStyle(elemento).animationName
          const retardo = (elemento: Element): string => getComputedStyle(elemento).animationDelay
          registro.fotogramas.push({
            opacidades: { titular: opacidadEfectiva(titular), parrafo: opacidadEfectiva(parrafo), boton: opacidadEfectiva(boton) },
            ancestrosConOpacidadDistintaDe1,
            animaciones: document.getAnimations().filter((animacion) => animacion instanceof CSSAnimation).length,
            nombres: { titular: nombre(titular), parrafo: nombre(parrafo), boton: nombre(boton) },
            retardos: { titular: retardo(titular), parrafo: retardo(parrafo), boton: retardo(boton) },
            cajas: { titular: caja(titular), parrafo: caja(parrafo), boton: caja(boton) },
          })
        }
        if (performance.now() < ventanaMs) {
          requestAnimationFrame(anotar)
        }
      }
      requestAnimationFrame(anotar)
    },
    { selectorDelHero: SELECTOR_DEL_HERO, selectores, ventanaMs: VENTANA_DEL_REGISTRO_MS },
  )
}

async function leerElRegistroDeFotogramas(page: Page): Promise<RegistroDeFotogramas> {
  return page.evaluate(() => (window as unknown as { registroDeFotogramas: RegistroDeFotogramas }).registroDeFotogramas)
}

/** hero_reducido_con_animacion @s6: con `reduce` no hay animación en ningún fotograma y todo se ve desde el primero. */
function incumplimientosDelMovimientoReducido(
  registro: RegistroDeFotogramas,
  cajasDosSegundosDespues: Readonly<Record<Rol, Caja>>,
): readonly string[] {
  const [primero] = registro.fotogramas
  if (primero === undefined) {
    return ['no se anotó ningún fotograma']
  }
  const incumplidas: string[] = []
  const conAnimacion = registro.fotogramas.filter((fotograma) => fotograma.animaciones > 0).length
  if (conAnimacion > 0) {
    incumplidas.push(`${conAnimacion} fotogramas tienen una animación por fotogramas clave en curso`)
  }
  if (registro.iniciosDeAnimacion > 0) {
    incumplidas.push(`se disparó "animationstart" ${registro.iniciosDeAnimacion} veces`)
  }
  if (primero.ancestrosConOpacidadDistintaDe1 !== 0) {
    incumplidas.push(`en el primer fotograma ${primero.ancestrosConOpacidadDistintaDe1} ancestros tienen una opacidad distinta de 1`)
  }
  for (const rol of ROLES) {
    if (primero.opacidades[rol] !== 1) {
      incumplidas.push(`${rol}: en el primer fotograma la opacidad efectiva es ${primero.opacidades[rol]} y debe ser 1`)
    }
    const distancia = distanciaEntreCajas(primero.cajas[rol], cajasDosSegundosDespues[rol])
    if (distancia > TOLERANCIA_DE_CAJA_PX) {
      incumplidas.push(`${rol}: en el primer fotograma su caja difiere ${distancia} px de la que tiene 2 s después`)
    }
    const conOtroNombre = registro.fotogramas.filter((fotograma) => fotograma.nombres[rol] !== 'none').length
    if (conOtroNombre > 0) {
      incumplidas.push(`${rol}: el nombre de animación computado no es "none" en ${conOtroNombre} fotogramas`)
    }
    const conRetardo = registro.fotogramas.filter((fotograma) => fotograma.retardos[rol] !== '0s').length
    if (conRetardo > 0) {
      incumplidas.push(`${rol}: el retardo de animación computado no es 0 s en ${conRetardo} fotogramas`)
    }
  }
  return incumplidas
}

function cajasDe(medida: MedidaDeUnInstante): Readonly<Record<Rol, Caja>> {
  return {
    titular: medida.elementos.titular.caja,
    parrafo: medida.elementos.parrafo.caja,
    boton: medida.elementos.boton.caja,
  }
}

test.describe('@s6 de hero_reducido_con_animacion: con movimiento reducido no se anima nada y los tres elementos se ven desde el primer fotograma', () => {
  test('con "reduce" emulado antes de navegar ningún fotograma tiene una animación en curso, los tres se ven en el primero, sin nombre de animación ni retardo', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await instalarObservadorDeFotogramas(page)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    await page.waitForTimeout(DOS_SEGUNDOS_MS)

    const registro = await leerElRegistroDeFotogramas(page)
    const dosSegundosDespues = await medirElementos(page)

    expect(registro.fotogramas.length).toBeGreaterThan(0)
    expect(incumplimientosDelMovimientoReducido(registro, cajasDe(dosSegundosDespues))).toEqual([])
  })

  test('la misma carga con "no-preference" y el reloj congelado antes de navegar encuentra las 3 animaciones: la consulta discrimina y no está muerta', async ({
    page,
  }) => {
    await congelarRelojDeAnimaciones(page)
    await cargarPortada(page, 1440, 900)
    await esperarALosElementosDelHero(page)

    expect(await contarLasAnimaciones(page)).toBe(ANIMACIONES_DEL_HERO)
  })
})

const CASOS_DE_REDUCE_QUE_CUMPLEN: ReadonlyArray<readonly [string, OpcionesDeLaEntrada]> = [
  ['la entrada bien escrita, solo dentro de no-preference', {}],
]

const DEFECTOS_DE_REDUCE: ReadonlyArray<readonly [string, OpcionesDeLaEntrada, string]> = [
  ['la animación y sus fotogramas fuera de no-preference: hay una animación en curso', { consulta: 'all' }, 'animación por fotogramas clave en curso'],
  ['la animación fuera de no-preference: el nombre computado deja de ser "none"', { consulta: 'all' }, 'nombre de animación computado'],
  ['la animación fuera de no-preference: el primer fotograma sale con opacidad 0', { consulta: 'all' }, 'opacidad efectiva'],
  [
    'el retardo declarado fuera de no-preference, con la animación dentro',
    { fueraDeLaConsulta: '[data-hero-subtitulo] { animation-delay: 120ms; }' },
    'retardo de animación computado',
  ],
  ['opacity: 0 en el estado base del titular', { fueraDeLaConsulta: 'h1 { opacity: 0; }' }, 'opacidad efectiva'],
  ['opacity: 0 en un contenedor de los tres', { fueraDeLaConsulta: '[data-hero-contenido] { opacity: 0; }' }, 'ancestros tienen una opacidad distinta de 1'],
]

/** La carga de @s6 sobre una página sintética: la misma secuencia que la del test real. */
async function capturarElMovimientoReducido(
  page: Page,
  css: string,
): Promise<{ registro: RegistroDeFotogramas; despues: MedidaDeUnInstante }> {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await instalarObservadorDeFotogramas(page)
  await cargarPaginaSintetica(page, css)
  await page.waitForTimeout(DOS_SEGUNDOS_MS)
  return { registro: await leerElRegistroDeFotogramas(page), despues: await medirElementos(page) }
}

test.describe('@s6 de hero_reducido_con_animacion: la comprobación muerde (páginas sintéticas con "reduce" emulado)', () => {
  for (const [descripcion, opciones] of CASOS_DE_REDUCE_QUE_CUMPLEN) {
    test(`no incumple nada: ${descripcion}`, async ({ page }) => {
      const { registro, despues } = await capturarElMovimientoReducido(page, cssDeLaEntrada(opciones))

      expect(registro.fotogramas.length).toBeGreaterThan(0)
      expect(incumplimientosDelMovimientoReducido(registro, cajasDe(despues))).toEqual([])
    })
  }

  for (const [descripcion, opciones, fragmento] of DEFECTOS_DE_REDUCE) {
    test(`incumple: ${descripcion}`, async ({ page }) => {
      const { registro, despues } = await capturarElMovimientoReducido(page, cssDeLaEntrada(opciones))

      expect(incumplimientosDelMovimientoReducido(registro, cajasDe(despues)).join('\n')).toContain(fragmento)
    })
  }

  test('incumple: la consulta muerta (un "no-preference" que nunca se cumple) no se encuentra con el reloj congelado', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await congelarRelojDeAnimaciones(page)
    await cargarPaginaSintetica(page, cssDeLaEntrada({ consulta: '(min-width: 99999px)' }))
    await esperarALosElementosDelHero(page)

    expect(await contarLasAnimaciones(page)).not.toBe(ANIMACIONES_DEL_HERO)
  })
})

// ---------------------------------------------------------------------------
// @s9 — la entrada no mueve el resto de la página ni crea una barra horizontal
// (la parte de los TRES INSTANTES por TRES ANCHOS, con el reloj congelado; las
// dos cláusulas de CLS sin congelar son de otro spec)
// ---------------------------------------------------------------------------

/** Los tres anchos del contrato, cada uno con una ventana de un alto habitual. */
const ANCHOS_DE_LA_ENTRADA: readonly TamanoDeVentana[] = [
  { ancho: 320, alto: 900 },
  { ancho: 375, alto: 812 },
  { ancho: 1440, alto: 900 },
]
const INSTANTES_MEDIDOS_POR_ANCHO = 3
const TOTAL_DE_CASOS_DE_LA_ENTRADA = 9

function comoMedidaDelHero(medida: MedidaDeUnInstante): MedidaDelHero {
  const { titular, boton } = medida.elementos
  return {
    seccionTop: medida.hero.top,
    seccionBottom: medida.hero.bottom,
    contenidoTop: titular.caja.y,
    contenidoBottom: boton.caja.y + boton.caja.height,
    alturaDeLaCabecera: 0,
    scrollHeight: medida.hero.scrollHeight,
    clientHeight: medida.hero.clientHeight,
  }
}

/** hero_reducido_con_animacion @s9: sin barra horizontal, sin recorte vertical y sin que se mueva nada de debajo, en los tres instantes. */
function incumplimientosDeLaEstabilidad(instantes: Readonly<Record<Instante, MedidaDeUnInstante>>): readonly string[] {
  const incumplidas: string[] = []
  for (const nombre of ['inicio', 'mitad', 'final'] as const) {
    const medida = instantes[nombre]
    if (medida.documento.anchoDelContenido > medida.documento.anchoDeLaVentana) {
      incumplidas.push(
        `${nombre}: el contenido desplazable mide ${medida.documento.anchoDelContenido} y la ventana ${medida.documento.anchoDeLaVentana}`,
      )
    }
    if (recortaContenido(comoMedidaDelHero(medida))) {
      incumplidas.push(`${nombre}: el hero recorta contenido`)
    }
  }
  const referencia = instantes.inicio
  const altoDeReferencia = referencia.hero.bottom - referencia.hero.top
  for (const nombre of ['mitad', 'final'] as const) {
    const otra = instantes[nombre]
    const alto = otra.hero.bottom - otra.hero.top
    if (Math.abs(alto - altoDeReferencia) > TOLERANCIA_DE_CAJA_PX) {
      incumplidas.push(`${nombre}: el alto del hero es ${alto} y en el instante 0 era ${altoDeReferencia}`)
    }
    if (otra.posteriores.length !== referencia.posteriores.length) {
      incumplidas.push(
        `${nombre}: hay ${otra.posteriores.length} elementos posteriores y en el instante 0 había ${referencia.posteriores.length}`,
      )
      continue
    }
    const movidas = otra.posteriores.filter(
      (caja, indice) => distanciaEntreCajas(caja, referencia.posteriores[indice] as Caja) > TOLERANCIA_DE_CAJA_PX,
    )
    if (movidas.length > 0) {
      incumplidas.push(`${nombre}: ${movidas.length} cajas de las secciones posteriores se han movido respecto al instante 0`)
    }
  }
  return incumplidas
}

test.describe('@s9 de hero_reducido_con_animacion: durante la entrada no hay barra horizontal y el resto de la página no se mueve', () => {
  test('a 320, 375 y 1440 px y en el instante 0, la mitad y el último instante activo: sin desbordamiento, sin recorte y con las secciones posteriores quietas', async ({
    page,
  }) => {
    await congelarRelojDeAnimaciones(page)
    let casosMedidos = 0

    for (const { ancho, alto } of ANCHOS_DE_LA_ENTRADA) {
      await cargarPortada(page, ancho, alto)
      await page.waitForLoadState('networkidle')

      await colocarAnimaciones(page, 'inicio')
      const inicio = await medirElementos(page, true)
      await colocarAnimaciones(page, 'mitad')
      const mitad = await medirElementos(page, true)
      await colocarAnimaciones(page, 'final')
      const final = await medirElementos(page, true)
      casosMedidos += INSTANTES_MEDIDOS_POR_ANCHO

      // Anti-vacuidad: hay algo posterior que comparar, y la entrada se vio de verdad en el instante 0.
      expect(inicio.posteriores.length, `${ancho}x${alto}: elementos posteriores al hero`).toBeGreaterThan(0)
      expect(inicio.elementos.titular.opacidadEfectiva, `${ancho}x${alto}: el titular al principio`).toBeLessThan(1)
      expect(incumplimientosDeLaEstabilidad({ inicio, mitad, final }), `${ancho}x${alto}`).toEqual([])
    }

    expect(casosMedidos).toBe(TOTAL_DE_CASOS_DE_LA_ENTRADA)
    expect(ANCHOS_DE_LA_ENTRADA).toHaveLength(TOTAL_DE_CASOS_DE_LA_ENTRADA / INSTANTES_MEDIDOS_POR_ANCHO)
  })
})

const DEFECTOS_DE_LA_ESTABILIDAD: ReadonlyArray<readonly [string, OpcionesDeLaEntrada, string]> = [
  [
    'un recorrido hacia la derecha sin recorte',
    { desde: 'opacity: 0; transform: translateX(120vw);', extra: '#inicio section { overflow: visible; }' },
    'el contenido desplazable mide',
  ],
  [
    'una animación que cambia el alto del hero y mueve lo que hay debajo',
    {
      desde: 'opacity: 0; margin-bottom: 400px;',
      hasta: 'opacity: 1; margin-bottom: 0;',
      extra: '#inicio section { min-height: 100px; }',
    },
    'el alto del hero es',
  ],
  [
    'una animación que mueve las secciones posteriores sin cambiar el alto del hero',
    {
      extra:
        '#posterior { animation: sube 700ms ease-out backwards; } @keyframes sube { from { margin-top: 80px; } to { margin-top: 0; } }',
    },
    'cajas de las secciones posteriores se han movido',
  ],
  ['un hero de alto fijo que recorta su contenido', { extra: '#inicio section { min-height: 0; height: 120px; }' }, 'el hero recorta contenido'],
]

test.describe('@s9 de hero_reducido_con_animacion: la comprobación muerde (páginas sintéticas a 375 px)', () => {
  const ventana = { ancho: 375, alto: 812 }

  test('no incumple nada: la entrada bien escrita', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await congelarRelojDeAnimaciones(page)
    await cargarPaginaSintetica(page, cssDeLaEntrada(), ventana.ancho, ventana.alto)

    await colocarAnimaciones(page, 'inicio')
    const inicio = await medirElementos(page, true)
    await colocarAnimaciones(page, 'mitad')
    const mitad = await medirElementos(page, true)
    await colocarAnimaciones(page, 'final')
    const final = await medirElementos(page, true)

    expect(inicio.posteriores.length).toBeGreaterThan(0)
    expect(incumplimientosDeLaEstabilidad({ inicio, mitad, final })).toEqual([])
  })

  for (const [descripcion, opciones, fragmento] of DEFECTOS_DE_LA_ESTABILIDAD) {
    test(`incumple: ${descripcion}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' })
      await congelarRelojDeAnimaciones(page)
      await cargarPaginaSintetica(page, cssDeLaEntrada(opciones), ventana.ancho, ventana.alto)

      await colocarAnimaciones(page, 'inicio')
      const inicio = await medirElementos(page, true)
      await colocarAnimaciones(page, 'mitad')
      const mitad = await medirElementos(page, true)
      await colocarAnimaciones(page, 'final')
      const final = await medirElementos(page, true)

      expect(incumplimientosDeLaEstabilidad({ inicio, mitad, final }).join('\n')).toContain(fragmento)
    })
  }
})
