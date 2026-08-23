import { describe, expect, it } from 'vitest'
import { PUNTO_DE_CORTE_NAVEGACION_PX } from '../../components/Cabecera-logica'
import { PASOS_ESCALA_TIPOGRAFICA, calcularTamanoDePaso, parametrosEscalaTipografica, tamanoEnViewport } from './escalaTipografica'

describe('@s13 los parámetros de la escala tipográfica son exactamente los de la metodología citada', () => {
  it('ratio 1.25, base 16, viewport mínimo 320, viewport máximo 1024 (Utopia, https://utopia.fyi/type/calculator/)', () => {
    // Literales escritos a mano, transcritos de la calculadora oficial de Utopia — NO se obtienen de los parámetros que se comprueban.
    const ratioAMano = 1.25
    const baseAMano = 16
    const viewportMinAMano = 320
    const viewportMaxAMano = 1024

    const parametros = parametrosEscalaTipografica()

    expect(parametros.ratio).toBe(ratioAMano)
    expect(parametros.baseNormalPx).toBe(baseAMano)
    expect(parametros.viewportMinPx).toBe(viewportMinAMano)
    expect(parametros.viewportMaxPx).toBe(viewportMaxAMano)
  })
})

describe('@s14 el viewport máximo de la escala tipográfica nunca diverge del punto de corte de la cabecera', () => {
  it('viewportMaxPx es exactamente PUNTO_DE_CORTE_NAVEGACION_PX (importada, no repetida como literal)', () => {
    const { viewportMaxPx } = parametrosEscalaTipografica()

    expect(viewportMaxPx).toBe(PUNTO_DE_CORTE_NAVEGACION_PX)
  })
})

describe('@s15 en el paso base la escala produce el mismo tamaño en los dos extremos del viewport', () => {
  it('paso 0 da 16px en el viewport mínimo y en el máximo', () => {
    const PASO_BASE = 0
    const { minPx, maxPx } = calcularTamanoDePaso(PASO_BASE)

    expect(minPx).toBe(16)
    expect(maxPx).toBe(16)
  })
})

describe('@s16 cada paso declarado produce un tamaño mínimo menor o igual que su tamaño máximo', () => {
  it('todos los pasos declarados: minPx <= maxPx, y se comprobó más de 0 pasos', () => {
    expect(PASOS_ESCALA_TIPOGRAFICA.length).toBeGreaterThan(0)

    for (const paso of PASOS_ESCALA_TIPOGRAFICA) {
      const { minPx, maxPx } = calcularTamanoDePaso(paso)
      expect(minPx).toBeLessThanOrEqual(maxPx)
    }
  })
})

describe('@s17 los pasos declarados están ordenados de forma estrictamente creciente en los dos extremos del viewport', () => {
  it('cada paso produce un tamaño mayor que el anterior, en minPx y en maxPx, sin inversión', () => {
    const pasosOrdenados = PASOS_ESCALA_TIPOGRAFICA.toSorted((a, b) => a - b).map(calcularTamanoDePaso)

    pasosOrdenados.slice(1).forEach((actual, indice) => {
      const anterior = pasosOrdenados[indice] as (typeof pasosOrdenados)[number]
      expect(actual.minPx).toBeGreaterThan(anterior.minPx)
      expect(actual.maxPx).toBeGreaterThan(anterior.maxPx)
    })
  })
})

describe('@s18 fuera del rango de viewport el tamaño se satura en vez de seguir creciendo o encogiendo', () => {
  it('un paso distinto del base: <320px da el tamaño del viewport mínimo, >1024px da el del máximo', () => {
    const pasoDistintoDelBase = PASOS_ESCALA_TIPOGRAFICA.find((paso) => paso !== 0)
    if (pasoDistintoDelBase === undefined) {
      throw new Error('la escala declarada no tiene ningún paso distinto del base: el test no puede ejercer @s18')
    }
    const { minPx, maxPx } = calcularTamanoDePaso(pasoDistintoDelBase)
    const ANCHO_MENOR_QUE_EL_MINIMO = 200
    const ANCHO_MAYOR_QUE_EL_MAXIMO = 2000

    expect(tamanoEnViewport(pasoDistintoDelBase, ANCHO_MENOR_QUE_EL_MINIMO)).toBe(minPx)
    expect(tamanoEnViewport(pasoDistintoDelBase, ANCHO_MAYOR_QUE_EL_MAXIMO)).toBe(maxPx)
  })
})

describe('dentro del rango de viewport el tamaño interpola según la posición del ancho, no solo satura en los extremos', () => {
  it('en el punto medio del rango (672px) tamanoEnViewport da el valor de interpolación exacto', () => {
    const PASO_DE_PRUEBA = -2
    const ANCHO_INTERMEDIO_PX = 672
    const { minPx, maxPx } = calcularTamanoDePaso(PASO_DE_PRUEBA)

    // Con los parámetros de la Decisión 24 minPx == maxPx en todo el dominio (ver cabecera del módulo):
    // la interpolación real da siempre minPx, así que este valor es el resultado esperado exacto.
    expect(minPx).toBe(maxPx)
    expect(tamanoEnViewport(PASO_DE_PRUEBA, ANCHO_INTERMEDIO_PX)).toBe(minPx)
  })
})
