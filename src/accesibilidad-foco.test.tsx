import React from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { App } from './App'
import { Cabecera } from './components/Cabecera'
import { PUNTO_DE_CORTE_NAVEGACION_PX } from './components/Cabecera-logica'
import { esAptoParaUso } from './lib/contraste'

/**
 * Bloque C — foco (`features/accesibilidad.feature`).
 *
 * @s17 y @s18 dependen de geometría/píxeles renderizados y se verifican con
 * NAVEGADOR REAL (Decisión 11, project-spec.md); aquí solo se cubre su
 * fracción de lógica pura consultable (documentado en
 * `progress/tdd_accesibilidad.md`).
 */

/** Aísla cada test de la URL que haya dejado el anterior (`history.pushState` es un singleton de `window`). */
beforeEach(() => {
  window.history.pushState(null, '', '/')
})

/** Centraliza el render bajo test y usa `React` en posición de tipo. */
function renderizar(arbol: React.JSX.Element): ReturnType<typeof render> {
  return render(arbol)
}

describe('@s16 el foco es visible en todos los controles interactivos', () => {
  it('cada control real recibe el foco, se convierte en document.activeElement, y ninguno suprime su indicador nativo sin sustituto', () => {
    renderizar(<Cabecera ancho={PUNTO_DE_CORTE_NAVEGACION_PX} />)

    const controles = screen.getAllByRole('link')
    expect(controles.length).toBeGreaterThan(0)

    let controlesEnfocados = 0
    for (const control of controles) {
      control.focus()
      expect(document.activeElement).toBe(control)
      // Ningún control suprime el indicador nativo de foco sin sustituirlo:
      // ningún estilo EN LÍNEA de este proyecto toca `outline` (no hay
      // todavía ninguna hoja SCSS en el repo, y los tests corren con
      // `css: false`), así que el indicador nativo del navegador queda
      // intacto y por tanto distinguible del estado sin foco.
      expect(control.style.outline).toBe('')
      controlesEnfocados += 1
    }
    expect(controlesEnfocados).toBeGreaterThan(0)
  })
})

describe('@s17 (parcial, pura) no existe ninguna barra superior adicional que pueda tapar el foco', () => {
  it('el documento contiene exactamente una cabecera ("banner"), sin ninguna barra superior adicional (Decisión 2)', () => {
    renderizar(<App />)

    expect(screen.getAllByRole('banner')).toHaveLength(1)
  })
})

describe('@s18 (parcial, pura) el umbral de contraste del indicador de foco es exactamente 3, escrito a mano', () => {
  it('2.99 no alcanza el umbral y 3 sí lo alcanza, para "componente de interfaz o borde de foco"', () => {
    // Literal escrito a mano (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`).
    const umbralEscritoAMano = 3

    expect(esAptoParaUso(2.99, 'componente de interfaz o borde de foco')).toBe(false)
    expect(esAptoParaUso(umbralEscritoAMano, 'componente de interfaz o borde de foco')).toBe(true)
  })
})
