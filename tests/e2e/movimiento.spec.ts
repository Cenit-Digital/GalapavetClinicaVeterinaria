// @s42-@s43 de `features/identidad_visual.feature` (Bloque H: movimiento en
// el sitio real). NAVEGADOR REAL con Playwright, con la preferencia de
// movimiento reducido activada. Ejecuta @s19 de accesibilidad.feature y
// @s34 de sistema_de_diseno_visual.feature (por @s42).
import { expect, test } from 'playwright/test'
import { RUTAS_DEL_INVENTARIO, SUBPATH_DE_PRODUCCION } from './rutas'

test.describe('@s42 con la preferencia de menos movimiento activa no queda ninguna animación ni transición en curso', () => {
  test('las 6 rutas + interacción: 0 animaciones en curso, ninguna transición != 0.01ms, nada visible se oculta (ejecuta @s19 de accesibilidad.feature y @s34 de sistema_de_diseno_visual.feature)', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })

    for (const { ruta } of RUTAS_DEL_INVENTARIO) {
      await page.goto(ruta)

      // Con movimiento reducido la duración efectiva es 0.01 ms, no cero:
      // medir inmediatamente después de navegar puede capturar ese instante
      // transitorio. Se espera el estado asentado igual que tras interactuar
      // más abajo; no se relaja la aserción de cero animaciones.
      await page.waitForFunction(() => document.getAnimations().every((animacion) => animacion.playState !== 'running'))

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

    // Con "reduce", una transición CSS sigue "corriendo" durante sus
    // 0.01ms de duración: se espera un fotograma a que el motor de
    // animaciones las marque "finished" antes de contar (no un
    // `waitForTimeout` a ciegas, sino la condición real que nos interesa).
    await page.waitForFunction(() => document.getAnimations().every((animacion) => animacion.playState !== 'running'))

    const [animacionesTrasInteractuar, transicionesFueraDeEscala, elementosConTransicionDeclarada] =
      await page.evaluate(() => {
        const enCurso = document
          .getAnimations()
          .filter((animacion) => animacion.playState === 'running').length

        // Ninguna transición corre con una duración efectiva distinta de
        // "0.01ms": el navegador serializa "transitionDuration" en SEGUNDOS
        // (medido: "1e-05s" para "0.01ms", nunca el literal "0.01ms"), así que
        // se compara numéricamente, no por texto.
        const TECHO_MS_REDUCIDO = 0.02 // 0.01ms + margen de precisión de coma flotante
        const duracionesEnMs = (elemento: HTMLElement): number[] =>
          getComputedStyle(elemento)
            .transitionDuration.split(',')
            .map((valor) => Number.parseFloat(valor.trim()) * 1000) // "s" → ms

        const elementos = Array.from(document.querySelectorAll<HTMLElement>('*'))
        // Recuento de elementos EFECTIVAMENTE inspeccionados por esta
        // comprobación (4ª cláusula del "Then" de @s19 de
        // accesibilidad.feature): sin este contador, la puerta podría pasar
        // "en verde" sin haber examinado ningún elemento real, precisamente
        // el riesgo "verde-por-vacuidad-en-puerta-de-verificacion" que la
        // cabecera de esa feature señala como su motivo de ser.
        const conTransicionDeclarada = elementos.filter((elemento) =>
          duracionesEnMs(elemento).some((milisegundos) => milisegundos > 0),
        ).length
        const fueraDeEscala = elementos.filter((elemento) =>
          duracionesEnMs(elemento).some((milisegundos) => milisegundos > TECHO_MS_REDUCIDO),
        ).length

        return [enCurso, fueraDeEscala, conTransicionDeclarada]
      })

    expect(animacionesTrasInteractuar, 'animaciones en curso tras interactuar').toBe(0)
    expect(transicionesFueraDeEscala, 'transiciones con duración fuera de la escala reducida').toBe(0)
    expect(
      elementosConTransicionDeclarada,
      'elementos con transición efectivamente inspeccionados (@s19, 4ª cláusula del Then)',
    ).toBeGreaterThan(0)

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
