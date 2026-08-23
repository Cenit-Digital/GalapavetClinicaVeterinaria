import { describe, expect, it } from 'vitest'
import {
  ejecutarPuertaDeAnalisisAutomatico,
  INVENTARIO_DE_PAGINAS,
  NIVELES_DE_CONFORMIDAD_EXIGIDOS,
  type ResultadoDeAnalisisAutomatico,
} from './accesibilidad-analisis'

/**
 * Un `ResultadoDeAnalisisAutomatico` con 6 páginas cargadas, sin violaciones,
 * y con reglas aplicadas: el caso "todo limpio" que reutilizan varios tests.
 */
function resultadoLimpio(): ResultadoDeAnalisisAutomatico {
  return {
    reglasAplicadas: 90,
    informes: INVENTARIO_DE_PAGINAS.map((pagina) => ({ pagina, cargo: true, violaciones: [] })),
  }
}

describe('@s1 el inventario de páginas auditadas es exactamente la lista escrita a mano', () => {
  it('contiene exactamente los 6 nombres del literal escrito a mano, ni más ni menos', () => {
    // Literal escrito a mano en el propio test (patrón
    // `doble-de-test-anclado-al-literal-no-al-simbolo`): no se deriva de
    // `INVENTARIO_DE_PAGINAS`, así que un mutante que vacíe o altere ese
    // array no puede pasar este test por casualidad.
    const nombresEscritosAMano = ['Landing', 'Campañas', 'Ficha de campaña', 'Blog', 'Artículo del blog', 'Tienda']

    expect(INVENTARIO_DE_PAGINAS).toHaveLength(6)
    for (const nombre of nombresEscritosAMano) {
      expect(INVENTARIO_DE_PAGINAS).toContain(nombre)
    }
    for (const nombre of INVENTARIO_DE_PAGINAS) {
      expect(nombresEscritosAMano).toContain(nombre)
    }
  })
})

describe('@s2 cada página del inventario pasa el análisis automático sin ninguna violación', () => {
  it('con 0 violaciones y las 6 páginas cargadas, el veredicto es aprobado y se leyó el informe (no un código de salida)', () => {
    const informe = ejecutarPuertaDeAnalisisAutomatico(resultadoLimpio())

    expect(informe.violacionesTotales).toBe(0)
    expect(informe.paginasAnalizadas).toBe(6)
    expect(informe.veredicto).toBe('aprobado')
    // La función nunca recibe ni consulta un código de salida de proceso: el
    // único dato de entrada es el `ResultadoDeAnalisisAutomatico` estructurado.
  })
})

describe('@s3 una sola violación en una sola página suspende la puerta y la identifica', () => {
  it('nombra la página, el criterio, el elemento, y sigue contando 6 páginas analizadas', () => {
    const conViolacion: ResultadoDeAnalisisAutomatico = {
      reglasAplicadas: 90,
      informes: INVENTARIO_DE_PAGINAS.map((pagina) => ({
        pagina,
        cargo: true,
        violaciones: pagina === 'Blog' ? [{ criterio: 'button-name', elemento: 'button.icono-buscar' }] : [],
      })),
    }

    const informe = ejecutarPuertaDeAnalisisAutomatico(conViolacion)

    expect(informe.veredicto).toBe('suspenso')
    expect(informe.violaciones).toEqual([{ pagina: 'Blog', criterio: 'button-name', elemento: 'button.icono-buscar' }])
    expect(informe.paginasAnalizadas).toBe(6)
  })
})

describe('@s4 con el inventario de páginas vacío la puerta falla cerrada', () => {
  it('suspenso, declara el inventario vacío, y nunca afirma que no haya violaciones', () => {
    const informe = ejecutarPuertaDeAnalisisAutomatico({ reglasAplicadas: 90, informes: [] })

    expect(informe.veredicto).toBe('suspenso')
    expect(informe.motivo).toMatch(/vacío/)
    expect(informe.motivo).not.toMatch(/violacion/i)
    expect(informe.violaciones).toEqual([])
    expect(informe.paginasNoCargadas).toEqual([])
  })
})

describe('@s5 si no se analiza ninguna página de verdad la puerta falla cerrada aunque el inventario no esté vacío', () => {
  it('con 6 entradas y ninguna cargada, 0 páginas analizadas, suspenso, informe declara 0 de 6', () => {
    const resultado: ResultadoDeAnalisisAutomatico = {
      reglasAplicadas: 90,
      informes: INVENTARIO_DE_PAGINAS.map((pagina) => ({ pagina, cargo: false, violaciones: [] })),
    }

    const informe = ejecutarPuertaDeAnalisisAutomatico(resultado)

    expect(informe.paginasAnalizadas).toBe(0)
    expect(informe.veredicto).toBe('suspenso')
    expect(informe.motivo).toContain('0 páginas de las 6 esperadas')
    expect(informe.violaciones).toEqual([])
  })
})

describe('@s6 si el análisis no aplica ninguna regla la puerta falla cerrada', () => {
  it('0 reglas aplicadas suspende la puerta pese a 0 violaciones', () => {
    const informe = ejecutarPuertaDeAnalisisAutomatico({ ...resultadoLimpio(), reglasAplicadas: 0 })

    expect(informe.veredicto).toBe('suspenso')
    expect(informe.motivo).toMatch(/ninguna regla/)
    expect(informe.violaciones).toEqual([])
  })
})

describe('@s7 el conjunto de niveles de conformidad exigidos es exactamente el escrito a mano', () => {
  it('contiene exactamente los 5 niveles del literal escrito a mano, ni más ni menos', () => {
    const nivelesEscritosAMano = ['WCAG 2.0 A', 'WCAG 2.0 AA', 'WCAG 2.1 A', 'WCAG 2.1 AA', 'WCAG 2.2 AA']

    expect(NIVELES_DE_CONFORMIDAD_EXIGIDOS).toHaveLength(5)
    for (const nivel of nivelesEscritosAMano) {
      expect(NIVELES_DE_CONFORMIDAD_EXIGIDOS).toContain(nivel)
    }
    for (const nivel of NIVELES_DE_CONFORMIDAD_EXIGIDOS) {
      expect(nivelesEscritosAMano).toContain(nivel)
    }
  })
})

describe('@s8 una página que no se puede cargar suspende la puerta en vez de contarse como limpia', () => {
  it('nombra la página no cargada, y no la cuenta ni entre las analizadas ni como sin violaciones', () => {
    const conFalloDeCarga: ResultadoDeAnalisisAutomatico = {
      reglasAplicadas: 90,
      informes: INVENTARIO_DE_PAGINAS.map((pagina) => ({ pagina, cargo: pagina !== 'Tienda', violaciones: [] })),
    }

    const informe = ejecutarPuertaDeAnalisisAutomatico(conFalloDeCarga)

    expect(informe.veredicto).toBe('suspenso')
    expect(informe.paginasNoCargadas).toEqual(['Tienda'])
    expect(informe.paginasAnalizadas).toBe(5)
    expect(informe.violaciones.some((violacion) => violacion.pagina === 'Tienda')).toBe(false)
  })
})
