// @s42-@s43 de `features/identidad_visual.feature` (Bloque H: movimiento en
// el sitio real). NAVEGADOR REAL con Playwright, con la preferencia de
// movimiento reducido activada. Ejecuta @s19 de accesibilidad.feature y
// @s34 de sistema_de_diseno_visual.feature (por @s42).
import { expect, test, type Page } from 'playwright/test'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

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
  await page.waitForFunction(() => document.getAnimations().every((animacion) => animacion.playState !== 'running'))
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
      // más abajo; no se relaja la aserción de cero animaciones. Desde el
      // 20/09/2026 lo que esta espera encuentra en `getAnimations()` son
      // TRANSICIONES: no queda ninguna `animation:` en `src/`.
      await esperarAQueNoQuedeMovimientoEnCurso(page)

      // AVISO (20/09/2026, feature 39): este 0 ya no demuestra que el anulador
      // global funcione. Demuestra que no hay nada que anular: el proyecto se
      // quedó sin ninguna declaración `animation:` cuando se retiraron los dos
      // pulsos de urgencias. Se conserva como antirregresión —si vuelve a
      // aparecer una animación que "reduce" no pare, esto se pone rojo—, pero
      // quien busque la puerta que prueba el anulador tiene que mirar las
      // TRANSICIONES de más abajo, que sí tienen sujeto.
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
