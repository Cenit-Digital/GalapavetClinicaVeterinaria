// @s42-@s43 de `features/identidad_visual.feature` (Bloque H: movimiento en
// el sitio real). NAVEGADOR REAL con Playwright, con la preferencia de
// movimiento reducido activada. Ejecuta @s19 de accesibilidad.feature y
// @s34 de sistema_de_diseno_visual.feature (por @s42).
//
// Desde el 14/10/2026 (feature 48, `hero_reducido_con_animacion`) el final del
// fichero añade las cláusulas que accesibilidad.feature @s19 y @s22 ganaron con la
// entrada animada del hero: con `reduce` no hay entrada desde el primer fotograma, y
// sin la preferencia la portada tiene exactamente las 3 animaciones del hero y todo
// queda visible al terminar.
import { expect, test, type Page } from 'playwright/test'
import { leerRegistroDeEntrada, registrarEntradaDelHero } from './entrada-del-hero'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'
import { esperarDosFotogramas, TOPE_DE_UNA_ESPERA_MS } from './utilidades'

/** El navegador serializa `transitionDuration` en SEGUNDOS: mide "1e-05s" para "0.01ms", nunca ese literal. */
const MILISEGUNDOS_POR_SEGUNDO = 1000
/** El techo de la escala reducida: los "0,01 ms" de `global.scss`, más el margen de precisión de coma flotante. */
const TECHO_MS_REDUCIDO = 0.02
/** Marca con la que el censo etiqueta, en el DOM, los elementos a los que una hoja les declara movimiento. */
const ATRIBUTO_DE_MOVIMIENTO_DECLARADO = 'data-movimiento-declarado'

interface LectorDeDuraciones {
  duracionesDeTransicionEnMs: (elemento: Element) => readonly number[]
}

/**
 * Instala en la página el lector de duraciones que usan las DOS pasadas de
 * medición (sin preferencia y con "reduce"). Va en un `addInitScript` y no
 * repetido dentro de cada `page.evaluate` para que las dos midan exactamente
 * lo mismo por construcción: si una se desviara de la otra, el censo dejaría
 * de ser comparable consigo mismo y la comparación no probaría nada.
 */
async function instalarLectorDeDuraciones(page: Page): Promise<void> {
  await page.addInitScript((milisegundosPorSegundo) => {
    ;(window as unknown as LectorDeDuraciones).duracionesDeTransicionEnMs = (elemento: Element): readonly number[] =>
      getComputedStyle(elemento)
        .transitionDuration.split(',')
        .map((valor) => Number.parseFloat(valor) * milisegundosPorSegundo)
  }, MILISEGUNDOS_POR_SEGUNDO)
}

/**
 * Con "reduce" una transición CSS sigue "corriendo" durante sus 0,01 ms: se
 * espera a que el motor de animaciones las marque terminadas antes de contar
 * (no un `waitForTimeout` a ciegas, sino la condición real que interesa).
 */
async function esperarAQueNoQuedeMovimientoEnCurso(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.getAnimations().every((animacion) => animacion.playState !== 'running'),
    undefined,
    { timeout: TOPE_DE_UNA_ESPERA_MS },
  )
}

test.describe('@s42 con la preferencia de menos movimiento activa no queda ninguna animación ni transición en curso', () => {
  test('las 6 rutas + interacción: 0 animaciones en curso, ninguna transición != 0.01ms, nada visible se oculta (ejecuta @s19 de accesibilidad.feature y @s34 de sistema_de_diseno_visual.feature)', async ({
    page,
  }) => {
    await instalarLectorDeDuraciones(page)
    await page.emulateMedia({ reducedMotion: 'reduce' })

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)

      // Con movimiento reducido la duración efectiva es 0.01 ms, no cero:
      // medir inmediatamente después de navegar puede capturar ese instante
      // transitorio. Se espera el estado asentado igual que tras interactuar
      // más abajo; no se relaja la aserción de cero animaciones. Lo que esta
      // espera encuentra en `getAnimations()` son TRANSICIONES: desde el
      // 20/09/2026 porque no quedaba ninguna `animation:` en `src/` y, desde la
      // 48, porque la única que hay (la entrada del hero) vive solo dentro de
      // `no-preference` y aquí se emula `reduce` ANTES de navegar.
      await esperarAQueNoQuedeMovimientoEnCurso(page)

      // AVISO (20/09/2026, feature 39; revisado el 14/10/2026, feature 48): desde
      // la feature 39 este 0 no demostraba que el anulador global funcione, porque
      // no había ninguna `animation:` que anular. Desde la 48 SÍ hay una (la entrada
      // del hero), pero esta prueba sigue sin protegerla: ESPERA a que no quede
      // movimiento en curso y SOLO después cuenta, así que una entrada declarada
      // fuera de `no-preference` terminaría igualmente su 0,01 ms y pasaría la
      // espera y el recuento. Esa protección es la de @s19 de accesibilidad, más
      // abajo (primer fotograma, sin esperar), y la de @s6 y @s8 de
      // hero_reducido_con_animacion. Se conserva como antirregresión; quien busque
      // la puerta que prueba el anulador de las TRANSICIONES tiene las de más abajo.
      const animacionesEnCurso = await page.evaluate(
        () => document.getAnimations().filter((animacion) => animacion.playState === 'running').length,
      )
      expect(animacionesEnCurso, `${ruta}: animaciones en curso`).toBe(0)
    }

    // Interacciones reales sobre la portada: selector de paleta, un
    // desplegable de servicios, un ítem del FAQ y las flechas de la galería.
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)

    await page.getByRole('button', { name: 'Cambiar paleta de color' }).click()
    // Se elige a propósito una variante DISTINTA de la predeterminada
    // ("Clínica"): solo un cambio real de tokens dispara las transiciones que
    // este escenario tiene que contar. Con `exact: true` porque el nombre
    // accesible podría ser subcadena de otro de la portada.
    await page.getByRole('button', { name: 'Marca Galapavet', exact: true }).click()

    const botonServicio = page.locator('section', { hasText: 'Servicios' }).getByRole('button').first()
    await botonServicio.click()
    await expect(botonServicio).toHaveAttribute('aria-expanded', 'true')

    const botonFaq = page.getByRole('button', { name: '¿Qué horario tiene la clínica?' })
    await botonFaq.click()
    await expect(botonFaq).toHaveAttribute('aria-expanded', 'true')

    await page.getByRole('button', { name: 'Foto siguiente' }).click()

    await esperarAQueNoQuedeMovimientoEnCurso(page)

    const animacionesTrasInteractuar = await page.evaluate(
      () => document.getAnimations().filter((animacion) => animacion.playState === 'running').length,
    )

    // EL CENSO DEL MOVIMIENTO REALMENTE DECLARADO (@s19, 4ª cláusula del Then,
    // aprobada el 20/09/2026). Se mide SIN la preferencia a propósito: las 8
    // declaraciones `transition:` que quedan en los 6 `.module.scss` viven
    // DENTRO de un `@media (prefers-reduced-motion: no-preference)`, así que
    // bajo "reduce" no aplican y lo único que da duración a un elemento es el
    // anulador global de `global.scss:337-343`, que la aplica sobre `*`.
    // Medido bajo "reduce" —como se hacía hasta el 20/09/2026— el filtro
    // "duración > 0" casaba con el documento ENTERO y el recuento no podía
    // bajar de 1 jamás: la puerta era inerte, y estaba declarada como tal en
    // este mismo fichero. Números medidos en esta máquina el 21/09/2026: bajo
    // "reduce", 429 de 429 elementos; sin la preferencia, 49 de 429 en este
    // punto del escenario (48 de 392 en la portada recién cargada, antes de
    // abrir los dos desplegables).
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    const censo = await page.evaluate((atributo) => {
      const elementos = Array.from(document.querySelectorAll<HTMLElement>('*'))
      const { duracionesDeTransicionEnMs } = window as unknown as LectorDeDuraciones
      const conMovimientoDeclarado = elementos.filter((elemento) =>
        duracionesDeTransicionEnMs(elemento).some((milisegundos) => milisegundos > 0),
      )
      conMovimientoDeclarado.forEach((elemento) => elemento.setAttribute(atributo, ''))

      return { conMovimientoDeclarado: conMovimientoDeclarado.length, totalDeElementos: elementos.length }
    }, ATRIBUTO_DE_MOVIMIENTO_DECLARADO)

    // De vuelta a la preferencia del escenario: los MISMOS elementos del censo
    // —reencontrados por su marca, no recontados— tienen que quedar anulados.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await esperarAQueNoQuedeMovimientoEnCurso(page)

    const medicionBajoReduce = await page.evaluate(
      ([atributo, techoMsReducido]) => {
        const { duracionesDeTransicionEnMs } = window as unknown as LectorDeDuraciones
        const fueraDeEscala = (elemento: Element): boolean =>
          duracionesDeTransicionEnMs(elemento).some((milisegundos) => milisegundos > techoMsReducido)
        // "0.01ms" y no "0" a propósito (`global.scss`): con "0" los eventos
        // "transitionend" no se disparan nunca y algo que espere a uno se
        // queda colgado. Por eso se exige el intervalo ABIERTO por abajo.
        const anuladoSinLlegarACero = (elemento: Element): boolean =>
          duracionesDeTransicionEnMs(elemento).every(
            (milisegundos) => milisegundos > 0 && milisegundos <= techoMsReducido,
          )
        const delCenso = Array.from(document.querySelectorAll<HTMLElement>(`[${atributo}]`))

        return {
          delCensoInspeccionados: delCenso.length,
          delCensoAnuladosSinLlegarACero: delCenso.filter(anuladoSinLlegarACero).length,
          fueraDeEscalaEnTodoElDocumento: Array.from(document.querySelectorAll<HTMLElement>('*')).filter(fueraDeEscala)
            .length,
        }
      },
      [ATRIBUTO_DE_MOVIMIENTO_DECLARADO, TECHO_MS_REDUCIDO] as [string, number],
    )

    expect(animacionesTrasInteractuar, 'animaciones en curso tras interactuar').toBe(0)
    expect(
      medicionBajoReduce.fueraDeEscalaEnTodoElDocumento,
      'transiciones con duración fuera de la escala reducida, en todo el documento',
    ).toBe(0)
    // Las dos caras de la 4ª cláusula del Then de @s19: el recuento tiene
    // sujeto (> 0) Y no es el documento entero (< total). La segunda es la que
    // caza el defecto que este fichero llevaba declarado por escrito: medido
    // bajo "reduce", el censo daba 429 de 429 y las dos se cumplían solas.
    expect(
      censo.conMovimientoDeclarado,
      'elementos con transición DECLARADA por una hoja del sitio (@s19, 4ª cláusula del Then)',
    ).toBeGreaterThan(0)
    expect(
      censo.conMovimientoDeclarado,
      '...y ese recuento NO es el documento entero, que es lo que contaba el anulador de "reduce"',
    ).toBeLessThan(censo.totalDeElementos)
    expect(medicionBajoReduce.delCensoInspeccionados, 'el censo se vuelve a encontrar bajo "reduce"').toBe(
      censo.conMovimientoDeclarado,
    )
    expect(
      medicionBajoReduce.delCensoAnuladosSinLlegarACero,
      'elementos del censo que "reduce" anula a 0,01 ms: todos, y ninguno a 0',
    ).toBe(censo.conMovimientoDeclarado)

    // Nada de lo que se acaba de abrir queda oculto por haberse desactivado
    // el movimiento: los dos desplegables siguen expandidos Y su contenido
    // sigue realmente VISIBLE (no solo con el atributo puesto).
    await expect(botonServicio).toHaveAttribute('aria-expanded', 'true')
    await expect(botonFaq).toHaveAttribute('aria-expanded', 'true')
    const seccionServicios = page.locator('section', { hasText: 'Servicios' }).first()
    await expect(seccionServicios.locator('ul').first()).toBeVisible()
  })

  test('el recuento de rutas efectivamente comprobadas es exactamente 6', () => {
    expect(RUTAS_DEL_INVENTARIO).toHaveLength(6)
  })
})

test.describe('@s43 con la preferencia de menos movimiento activa el desplazamiento hasta un ancla es instantáneo', () => {
  test('"scroll-behavior" computa "auto" con "reduce" y "smooth" sin preferencia declarada', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`${SUBPATH_DE_PRODUCCION}/`)
    const conReduce = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)
    expect(conReduce).toBe('auto')

    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.reload()
    const sinPreferencia = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)
    expect(sinPreferencia).toBe('smooth')
  })
})

// ---------------------------------------------------------------------------
// accesibilidad.feature @s19 (con `reduce`, la entrada del hero no existe) y @s22 (sin la
// preferencia, SÍ existe y termina con todo visible). Desde el 13/10/2026 (feature 48) los dos
// vuelven a tener sujeto: la entrada animada del hero. Los VALORES de esas tres animaciones
// (700 ms, 0/120/240 ms, 40 px, `ease-out`) no se repiten aquí: los fija
// hero_reducido_con_animacion @s5 en `hero-reducido.spec.ts`.
//
// CÓMO SE MIDE SIN CARRERA (exención 1 de @s10 de esa feature). El reloj de animaciones del
// documento se CONGELA ANTES de navegar (`congelarRelojDeAnimaciones`) y después se COLOCA cada
// animación en el instante pedido (`colocarEnElUltimoInstanteActivo`: `currentTime =`). Sin
// congelar, una máquina lenta las daría ya terminadas y, con el relleno `backwards`, una animación
// terminada desaparece de `getAnimations()`: «había 3» daría 0 con el código correcto. Las funciones
// viven AQUÍ y no en `utilidades.ts`: la comprobación estática de @s10 reconoce la exención por el
// texto del bloque `test(` o de una función local de este mismo fichero.
//
// MEDIDO en Chromium 151 (no es documentación oficial): `Animation.setPlaybackRate` a 0 por el
// protocolo de depuración, enviado ANTES del primer `goto`, sobrevive a navegaciones sucesivas de la
// misma página: las animaciones nacen con `currentTime` 0 y siguen ahí 1,2 s de reloj real después.
// ---------------------------------------------------------------------------

/** Los tres elementos que entran: el botón se mide por el enlace, porque la animación cuelga de su contenedor. */
const ELEMENTOS_DEL_HERO = {
  titular: '#inicio h1',
  parrafo: '#inicio [data-hero-subtitulo]',
  boton: '#inicio [data-hero-acciones] a',
} as const
const ROLES_DEL_HERO = ['boton', 'parrafo', 'titular'] as const
const ANIMACIONES_DE_ENTRADA_DEL_HERO = 3
const RUTA_DE_LA_PORTADA = `${SUBPATH_DE_PRODUCCION}/`
/** En el último instante activo la curva `ease-out` aún no ha llegado a 1 (medido: 0,999996 y −0,000154 px): una igualdad estricta daría rojo con el código correcto. */
const OPACIDAD_MINIMA_AL_TERMINAR = 0.999
const DESPLAZAMIENTO_MAXIMO_AL_TERMINAR_PX = 0.5
const MARGEN_DEL_ULTIMO_INSTANTE_ACTIVO_MS = 1
/** La entrada completa dura 940 ms: pasado este tiempo desde el primer fotograma, cualquier animación que fuera a arrancar ya ha arrancado. */
const ESPERA_PARA_VER_SI_ALGO_ARRANCA_MS = 1500
/** Dónde deja el observador de fotogramas su anotación del primer fotograma con el titular. */
const CLAVE_DEL_PRIMER_FOTOGRAMA = '__primerFotogramaConElTitular'

async function congelarRelojDeAnimaciones(page: Page): Promise<void> {
  const sesion = await page.context().newCDPSession(page)
  await sesion.send('Animation.setPlaybackRate', { playbackRate: 0 })
}

/** Espera a que el motor haya creado las animaciones de la entrada (se crean al recalcular estilos tras montar el titular). */
async function esperarALasAnimacionesDeLaEntrada(page: Page): Promise<void> {
  await page.waitForFunction(
    (esperadas) => document.getAnimations().filter((animacion) => animacion instanceof CSSAnimation).length >= esperadas,
    ANIMACIONES_DE_ENTRADA_DEL_HERO,
    { timeout: TOPE_DE_UNA_ESPERA_MS },
  )
}

/**
 * El `currentTime` de cada animación por fotogramas clave. Con el reloj CONGELADO antes de navegar es 0 en todas;
 * con el reloj vivo, tras dos fotogramas, ya no. Es la prueba, dentro del propio test, de que la congelación
 * surtió efecto: sin ella, el «0 animaciones» de las otras 5 rutas podría ser una animación ya terminada.
 */
async function tiemposActualesDeLasAnimaciones(page: Page): Promise<readonly number[]> {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((animacion): animacion is CSSAnimation => animacion instanceof CSSAnimation)
      .map((animacion) => Number(animacion.currentTime)),
  )
}

/** A qué elemento del hero pertenece cada animación por fotogramas clave (las transiciones no cuentan); `otro:<etiqueta>` si no es exactamente uno. */
async function rolesDeLasAnimaciones(page: Page): Promise<readonly string[]> {
  return page.evaluate((selectores) => {
    const elementos = Object.entries(selectores).map(([rol, selector]) => ({ rol, elemento: document.querySelector(selector) }))
    return document
      .getAnimations()
      .filter((animacion): animacion is CSSAnimation => animacion instanceof CSSAnimation)
      .map((animacion) => {
        const objetivo = animacion.effect instanceof KeyframeEffect ? animacion.effect.target : null
        const quienes = elementos.filter(({ elemento }) => elemento !== null && objetivo?.contains(elemento) === true)
        return quienes.length === 1 ? (quienes[0] as { rol: string }).rol : `otro:${objetivo?.tagName ?? 'sin objetivo'}`
      })
  }, ELEMENTOS_DEL_HERO)
}

/**
 * El nombre de animación computado de cada uno de los tres: distinto de `none` quiere decir que su hoja
 * le declara movimiento. Se lee el del elemento o, si es `none`, el del primer ancestro hasta la sección
 * que lo declare: el botón no se anima él, se anima su contenedor, y su opacidad EFECTIVA incluye la de ese
 * contenedor igual que su movimiento.
 */
async function nombresDeAnimacionComputados(page: Page): Promise<Readonly<Record<string, string>>> {
  return page.evaluate(
    (selectores) =>
      Object.fromEntries(
        Object.entries(selectores).map(([rol, selector]) => {
          const elemento = document.querySelector(selector) as Element
          const seccion = elemento.closest('section')
          let nombre = 'none'
          for (let nodo: Element | null = elemento; nodo !== null && nombre === 'none'; nodo = nodo === seccion ? null : nodo.parentElement) {
            nombre = getComputedStyle(nodo).animationName
          }
          return [rol, nombre]
        }),
      ),
    ELEMENTOS_DEL_HERO,
  )
}

/** Lleva cada animación al ÚLTIMO INSTANTE DE SU FASE ACTIVA (`endTime` menos 1 ms), no a `endTime`: con relleno hacia atrás, en `endTime` ya no se aplica y se leería el estilo base. */
async function colocarEnElUltimoInstanteActivo(page: Page): Promise<void> {
  await page.evaluate((margenMs) => {
    for (const animacion of document.getAnimations()) {
      if (animacion instanceof CSSAnimation) {
        animacion.currentTime = Number(animacion.effect?.getComputedTiming().endTime) - margenMs
      }
    }
  }, MARGEN_DEL_ULTIMO_INSTANTE_ACTIVO_MS)
}

interface MedidaDeUnElementoDelHero {
  /** El producto de la opacidad del elemento y la de todos sus ancestros hasta la sección de bienvenida: la opacidad no se hereda en el valor computado, pero sí en lo que se ve. */
  readonly opacidadEfectiva: number
  readonly x: number
}

async function medirLosTresElementos(page: Page): Promise<Readonly<Record<string, MedidaDeUnElementoDelHero>>> {
  return page.evaluate(
    (selectores) =>
      Object.fromEntries(
        Object.entries(selectores).map(([rol, selector]) => {
          const elemento = document.querySelector(selector) as Element
          const seccion = elemento.closest('section')
          let opacidadEfectiva = 1
          for (let nodo: Element | null = elemento; nodo !== null; nodo = nodo === seccion ? null : nodo.parentElement) {
            opacidadEfectiva *= Number(getComputedStyle(nodo).opacity)
          }
          return [rol, { opacidadEfectiva, x: elemento.getBoundingClientRect().x }]
        }),
      ),
    ELEMENTOS_DEL_HERO,
  )
}

interface UltimoFotograma {
  readonly rol: string
  readonly opacity: unknown
  readonly transform: unknown
}

/** El fotograma de offset 1 de cada animación, leído con `getKeyframes()`: la ÚNICA lectura que fija la exactitud («1» y `none`). */
async function ultimosFotogramasDeLaEntrada(page: Page): Promise<readonly UltimoFotograma[]> {
  return page.evaluate((selectores) => {
    const elementos = Object.entries(selectores).map(([rol, selector]) => ({ rol, elemento: document.querySelector(selector) }))
    return document
      .getAnimations()
      .filter((animacion): animacion is CSSAnimation => animacion instanceof CSSAnimation)
      .map((animacion) => {
        const efecto = animacion.effect instanceof KeyframeEffect ? animacion.effect : null
        const objetivo = efecto?.target ?? null
        const rol = elementos.find(({ elemento }) => elemento !== null && objetivo?.contains(elemento) === true)?.rol ?? 'otro'
        const ultimo = (efecto?.getKeyframes() ?? []).find((fotograma) => fotograma.computedOffset === 1)
        return { rol, opacity: ultimo?.opacity, transform: ultimo?.transform }
      })
  }, ELEMENTOS_DEL_HERO)
}

/** Cancela todas las animaciones por fotogramas clave: cada elemento vuelve a lo que dice su hoja SIN animación (su estado base). */
async function cancelarLasAnimaciones(page: Page): Promise<void> {
  await page.evaluate(() => {
    for (const animacion of document.getAnimations()) {
      if (animacion instanceof CSSAnimation) {
        animacion.cancel()
      }
    }
  })
}

interface PrimerFotogramaConElTitular {
  readonly instante: number
  readonly nombres: Readonly<Record<string, string>>
  readonly animaciones: number
}

/** Instala, ANTES de que cargue la página, un observador que anota el primer fotograma en que existe el titular: sin esperar a que cese ningún movimiento. */
async function observarElPrimerFotogramaConElTitular(page: Page): Promise<void> {
  await page.addInitScript(
    ({ selectores, clave }) => {
      const ventana = window as unknown as Record<string, PrimerFotogramaConElTitular | null>
      ventana[clave] = null
      const anotar = (): void => {
        if (document.querySelector('h1') === null) {
          requestAnimationFrame(anotar)
          return
        }
        ventana[clave] = {
          instante: performance.now(),
          // El del elemento o, si es `none`, el del primer ancestro hasta la sección que lo declare (el botón se anima por su contenedor).
          nombres: Object.fromEntries(
            Object.entries(selectores).map(([rol, selector]) => {
              const elemento = document.querySelector(selector) as Element
              const seccion = elemento.closest('section')
              let nombre = 'none'
              for (let nodo: Element | null = elemento; nodo !== null && nombre === 'none'; nodo = nodo === seccion ? null : nodo.parentElement) {
                nombre = getComputedStyle(nodo).animationName
              }
              return [rol, nombre]
            }),
          ),
          animaciones: document.getAnimations().filter((animacion) => animacion instanceof CSSAnimation).length,
        }
      }
      requestAnimationFrame(anotar)
    },
    { selectores: ELEMENTOS_DEL_HERO, clave: CLAVE_DEL_PRIMER_FOTOGRAMA },
  )
}

/** Dónde deja el contador su cuenta de TODOS los `animationstart` del documento, de cualquier elemento y pseudoelemento. */
const CLAVE_DE_LOS_ARRANQUES_DEL_DOCUMENTO = '__arranquesDeAnimacionDelDocumento'

/** Instala, ANTES de que cargue la página, un contador de `animationstart` sin filtrar por objetivo: el registro del hero solo cuenta lo que cuelga de su contenedor. */
async function contarLosArranquesDelDocumento(page: Page): Promise<void> {
  await page.addInitScript((clave) => {
    const ventana = window as unknown as Record<string, number>
    ventana[clave] = 0
    window.addEventListener(
      'animationstart',
      () => {
        ventana[clave] = (ventana[clave] ?? 0) + 1
      },
      true,
    )
  }, CLAVE_DE_LOS_ARRANQUES_DEL_DOCUMENTO)
}

async function leerLosArranquesDelDocumento(page: Page): Promise<number> {
  return page.evaluate((clave) => (window as unknown as Record<string, number>)[clave] as number, CLAVE_DE_LOS_ARRANQUES_DEL_DOCUMENTO)
}

/**
 * El DEFECTO de la prueba de mordida, inyectado en la portada real (la hoja del repositorio no se toca): una animación
 * de 1 ms sobre el velo de la sección del hero, fuera de toda consulta de movimiento.
 */
async function inyectarUnaAnimacionSobreElVeloDelHero(page: Page): Promise<void> {
  await page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const estilo = document.createElement('style')
      estilo.textContent = '@keyframes velo-de-prueba { from { opacity: 0.5 } } #inicio section::after { animation: velo-de-prueba 1ms }'
      document.head.append(estilo)
    })
  })
}

test.describe('@s19 de accesibilidad: con la preferencia de menos movimiento la entrada del hero no existe desde el primer fotograma', () => {
  test('con "reduce" emulado antes de navegar, en el primer fotograma con el titular los tres elementos tienen animation-name "none" y no hay ninguna animación por fotogramas clave, ni en curso ni terminada', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await registrarEntradaDelHero(page)
    await contarLosArranquesDelDocumento(page)
    await observarElPrimerFotogramaConElTitular(page)
    await page.goto(RUTA_DE_LA_PORTADA)

    await page.waitForFunction((clave) => (window as unknown as Record<string, unknown>)[clave] !== null, CLAVE_DEL_PRIMER_FOTOGRAMA, {
      timeout: TOPE_DE_UNA_ESPERA_MS,
    })
    const primerFotograma = await page.evaluate(
      (clave) => (window as unknown as Record<string, PrimerFotogramaConElTitular>)[clave] as PrimerFotogramaConElTitular,
      CLAVE_DEL_PRIMER_FOTOGRAMA,
    )
    // «Tampoco los ya terminados»: una animación de 0,01 ms ya ha terminado cuando alguien la busca. Solo los contadores de eventos la recuerdan.
    await page.waitForFunction(
      ([instante, espera]) => performance.now() >= (instante as number) + (espera as number),
      [primerFotograma.instante, ESPERA_PARA_VER_SI_ALGO_ARRANCA_MS] as const,
      // Esta espera dura 1500 ms A PROPÓSITO: el tope tiene que ser mayor que ella con holgura.
      { timeout: TOPE_DE_UNA_ESPERA_MS },
    )

    expect(primerFotograma.nombres).toEqual({ titular: 'none', parrafo: 'none', boton: 'none' })
    expect(primerFotograma.animaciones).toBe(0)
    expect((await leerRegistroDeEntrada(page)).arranques, 'animationstart de los elementos del hero con "reduce"').toBe(0)
    expect(await leerLosArranquesDelDocumento(page), 'animationstart de cualquier elemento del documento con "reduce"').toBe(0)
  })

  // El registro de `entrada-del-hero.ts` cuenta SOLO lo que cuelga de `[data-hero-contenido]` (así la cabecera de la
  // feature 49 o un indicador de carga no lo desordenan). El evento de un `::after` tiene como objetivo su propio
  // elemento, y la sección no cuelga de su contenedor: una animación sobre el velo o sobre la foto del hero,
  // declarada fuera de `no-preference`, que termine al instante bajo `reduce`, escaparía de las tres cosas que miden
  // «ni en curso ni terminada» (los nombres, que solo miran a los tres elementos y sus ancestros; el recuento del
  // primer fotograma, porque ya terminó; y el registro). Por eso @s19 cuenta además TODOS los `animationstart`
  // del documento, de cualquier elemento y pseudoelemento. Este test lo demuestra sobre la portada real con el defecto
  // inyectado, sin tocar la hoja del repositorio.
  test('la comprobación muerde: una animación sobre el velo del hero, declarada fuera de "no-preference" y terminada al instante, la ve el contador del documento y no el registro del hero', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await registrarEntradaDelHero(page)
    await contarLosArranquesDelDocumento(page)
    await inyectarUnaAnimacionSobreElVeloDelHero(page)
    await page.goto(RUTA_DE_LA_PORTADA)

    await page.waitForFunction((clave) => ((window as unknown as Record<string, number>)[clave] ?? 0) > 0, CLAVE_DE_LOS_ARRANQUES_DEL_DOCUMENTO, {
      timeout: TOPE_DE_UNA_ESPERA_MS,
    })

    expect(await leerLosArranquesDelDocumento(page), 'animationstart de cualquier elemento del documento').toBeGreaterThan(0)
    expect((await leerRegistroDeEntrada(page)).arranques, 'animationstart de los elementos del hero').toBe(0)
  })
})

test.describe('@s22 de accesibilidad: sin la preferencia de menos movimiento el sitio sí se mueve, solo en la portada, y todo queda visible al terminar', () => {
  test('con el reloj congelado antes de navegar la portada tiene exactamente las 3 animaciones por fotogramas clave del hero: titular, párrafo y botón, con movimiento declarado en los tres', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await congelarRelojDeAnimaciones(page)
    await page.goto(RUTA_DE_LA_PORTADA)
    await esperarALasAnimacionesDeLaEntrada(page)

    const roles = await rolesDeLasAnimaciones(page)
    const nombres = await nombresDeAnimacionComputados(page)

    expect(roles.toSorted()).toEqual([...ROLES_DEL_HERO])
    for (const rol of ROLES_DEL_HERO) {
      expect(nombres[rol], `${rol}: el nombre de animación computado sin la preferencia`).not.toBe('none')
    }
  })

  test('con el reloj congelado antes de navegar en cada una de las 5 rutas sin hero, ninguna tiene una animación por fotogramas clave; la portada, medida igual, sí tiene 3', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await congelarRelojDeAnimaciones(page)

    // El control: con el MISMO reloj congelado la portada da 3, y las 3 siguen en su instante 0 dos fotogramas después.
    // Sin él, un 0 en las otras rutas podría ser una animación corta ya terminada.
    await page.goto(RUTA_DE_LA_PORTADA)
    await esperarALasAnimacionesDeLaEntrada(page)
    await esperarDosFotogramas(page)
    expect(await rolesDeLasAnimaciones(page)).toHaveLength(ANIMACIONES_DE_ENTRADA_DEL_HERO)
    expect(await tiemposActualesDeLasAnimaciones(page), 'el reloj de animaciones no está congelado').toEqual([0, 0, 0])

    const rutasSinHero = RUTAS_DEL_INVENTARIO.filter(({ ruta }) => ruta !== RUTA_DE_LA_PORTADA)
    for (const { ruta } of rutasSinHero) {
      await page.goto(ruta)
      await page.locator('h1').first().waitFor()
      await esperarDosFotogramas(page)
      expect(await rolesDeLasAnimaciones(page), `${ruta}: animaciones por fotogramas clave`).toEqual([])
    }
    expect(rutasSinHero).toHaveLength(5)

    // La congelación sobrevivió a las 5 navegaciones: la portada, otra vez, tiene sus 3 a `currentTime` 0 (si el reloj se hubiera
    // soltado por el camino, las otras rutas se habrían medido con el reloj vivo).
    await page.goto(RUTA_DE_LA_PORTADA)
    await esperarALasAnimacionesDeLaEntrada(page)
    await esperarDosFotogramas(page)
    expect(await tiemposActualesDeLasAnimaciones(page), 'el reloj se soltó durante las navegaciones').toEqual([0, 0, 0])
  })

  test('en el último instante de su fase activa (endTime − 1 ms) los tres tienen opacidad efectiva >= 0,999 y desplazamiento < 0,5 px, y su último fotograma declara opacity "1" y transform "none"', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await congelarRelojDeAnimaciones(page)
    await page.goto(RUTA_DE_LA_PORTADA)
    await esperarALasAnimacionesDeLaEntrada(page)
    // Anti-vacuidad, y lo que la comprobación estática de @s10 lee (textual) para saber que este bloque mide
    // el hero: existe el titular. Los selectores van escritos aquí, no solo en `ELEMENTOS_DEL_HERO`.
    await expect(page.locator('#inicio h1'), 'sin titular no hay nada que medir').toHaveCount(1)
    await colocarEnElUltimoInstanteActivo(page)

    const alTerminar = await medirLosTresElementos(page)
    const ultimosFotogramas = await ultimosFotogramasDeLaEntrada(page)
    await cancelarLasAnimaciones(page)
    const base = await medirLosTresElementos(page)

    for (const rol of ROLES_DEL_HERO) {
      const medida = alTerminar[rol] as MedidaDeUnElementoDelHero
      const medidaBase = base[rol] as MedidaDeUnElementoDelHero
      expect(medida.opacidadEfectiva, `${rol}: opacidad efectiva en el último instante activo`).toBeGreaterThanOrEqual(OPACIDAD_MINIMA_AL_TERMINAR)
      expect(Math.abs(medida.x - medidaBase.x), `${rol}: desplazamiento horizontal respecto a su caja sin animación`).toBeLessThan(
        DESPLAZAMIENTO_MAXIMO_AL_TERMINAR_PX,
      )
      expect(medidaBase.opacidadEfectiva, `${rol}: con la animación cancelada queda visible`).toBe(1)
    }
    expect(ultimosFotogramas.map(({ rol }) => rol).toSorted()).toEqual([...ROLES_DEL_HERO])
    for (const fotograma of ultimosFotogramas) {
      expect(fotograma.opacity, `${fotograma.rol}: opacidad del fotograma de offset 1`).toBe('1')
      expect(fotograma.transform, `${fotograma.rol}: transform del fotograma de offset 1`).toBe('none')
    }
  })
})
