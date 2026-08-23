import { describe, expect, it } from 'vitest'
import {
  calcularRatioContraste,
  ejecutarPuertaDeContraste,
  ejecutarPuertaDeContrasteComponentesInterfaz,
  ejecutarPuertaDeContrasteTextoGrande,
  ejecutarPuertaDeContrasteTextoNormal,
  esAptoParaUso,
  esTextoGrande,
  evaluarAptitudPareja,
  evaluarParDeContraste,
  formularVeredictoDePareja,
  umbralesDeContraste,
  type ParDeContraste,
} from './contraste'
import { catalogoDeContraste } from './tokens'

describe('@s2 el cálculo devuelve el ratio máximo conocido para negro sobre blanco', () => {
  it('negro sobre blanco da 21.00', () => {
    const ratio = calcularRatioContraste('#000000', '#FFFFFF')
    expect(Number(ratio.toFixed(2))).toBe(21)
  })

  it('refuerzo mutación: un canal bajo pero no nulo distingue dividir de multiplicar en la rama gamma lineal', () => {
    // #000000 (el único caso que ejercita la rama gamma lineal en esta suite) tiene
    // canal=0, donde canal/12.92 y canal*12.92 dan el mismo resultado (0). #010101
    // tiene canal=1 (dentro del umbral 0.03928 ≈ byte 10), donde sí difieren.
    const ratio = calcularRatioContraste('#010101', '#FFFFFF')
    expect(Number(ratio.toFixed(2))).toBe(20.87)
  })
})

describe('@s3 el morado de marca sobre blanco alcanza 9.13', () => {
  it('morado sobre blanco da 9.13 y cumple el mínimo de texto normal', () => {
    const ratio = calcularRatioContraste('#77286B', '#FFFFFF')
    expect(Number(ratio.toFixed(2))).toBe(9.13)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
})

describe('@s4 invertir color y fondo no cambia el ratio', () => {
  it('blanco sobre morado da el mismo 9.13 que morado sobre blanco', () => {
    const ratio = calcularRatioContraste('#FFFFFF', '#77286B')
    expect(Number(ratio.toFixed(2))).toBe(9.13)
  })
})

describe('@s5 el hexadecimal en minúsculas produce el mismo ratio que en mayúsculas', () => {
  it('morado y blanco en minúsculas dan 9.13, igual que en mayúsculas', () => {
    const ratio = calcularRatioContraste('#77286b', '#ffffff')
    expect(Number(ratio.toFixed(2))).toBe(9.13)
  })
})

describe('@s6 el verde lima sobre blanco no es apto para ningún uso de texto ni de interfaz', () => {
  it('lima sobre blanco da 1.89 y no es apto para ningún uso', () => {
    const { ratio, apta } = evaluarAptitudPareja('#B4C718', '#FFFFFF')

    expect(Number(ratio.toFixed(2))).toBe(1.89)
    expect(apta['texto normal']).toBe(false)
    expect(apta['texto grande']).toBe(false)
    expect(apta['componente de interfaz o borde de foco']).toBe(false)
  })
})

describe('@s7 el verde lima sobre el morado de marca sí es apto para texto normal', () => {
  it('lima sobre morado da 4.84 y es apto para texto normal', () => {
    const { ratio, apta } = evaluarAptitudPareja('#B4C718', '#77286B')

    expect(Number(ratio.toFixed(2))).toBe(4.84)
    expect(apta['texto normal']).toBe(true)
  })
})

describe('@s8 el verde profundo sobre lima sirve para texto grande pero no para texto normal', () => {
  it('verde profundo sobre lima da 3.01: apto para grande y componente, no para normal', () => {
    const { ratio, apta } = evaluarAptitudPareja('#48704B', '#B4C718')

    expect(Number(ratio.toFixed(2))).toBe(3.01)
    expect(apta['texto grande']).toBe(true)
    expect(apta['componente de interfaz o borde de foco']).toBe(true)
    expect(apta['texto normal']).toBe(false)
  })
})

describe('@s9 un ratio exactamente igual al mínimo de texto normal se considera apto', () => {
  it('4.5 es apto para texto normal (límite inclusivo)', () => {
    expect(esAptoParaUso(4.5, 'texto normal')).toBe(true)
  })
})

describe('@s10 un ratio inmediatamente por debajo del mínimo de texto normal no es apto', () => {
  it('4.49 no es apto para texto normal', () => {
    expect(esAptoParaUso(4.49, 'texto normal')).toBe(false)
  })
})

describe('@s11 un ratio exactamente igual al mínimo de componente de interfaz se considera apto', () => {
  it('3.0 es apto para componente de interfaz o borde de foco (límite inclusivo)', () => {
    expect(esAptoParaUso(3.0, 'componente de interfaz o borde de foco')).toBe(true)
  })
})

describe('@s23 un ratio exactamente igual al mínimo de texto grande se considera apto', () => {
  it('3.0 es apto para texto grande (límite inclusivo)', () => {
    expect(esAptoParaUso(3.0, 'texto grande')).toBe(true)
  })
})

describe('@s12 un hexadecimal con caracteres no hexadecimales hace fallar el cálculo', () => {
  it('lanza un error que cita el valor rechazado "#ZZ286B"', () => {
    expect(() => calcularRatioContraste('#ZZ286B', '#FFFFFF')).toThrow('#ZZ286B')
  })

  it('refuerzo mutación: un fondo inválido también hace fallar el cálculo aunque el color sea válido', () => {
    expect(() => calcularRatioContraste('#77286B', '#ZZZZZZ')).toThrow('#ZZZZZZ')
  })

  it('refuerzo mutación: basura antes de 6 dígitos hex válidos hace fallar el cálculo', () => {
    expect(() => calcularRatioContraste('X#77286B', '#FFFFFF')).toThrow(/no es un color hexadecimal válido/)
  })

  it('refuerzo mutación: basura después de 6 dígitos hex válidos hace fallar el cálculo', () => {
    expect(() => calcularRatioContraste('#77286BXY', '#FFFFFF')).toThrow(/no es un color hexadecimal válido/)
  })
})

describe('@s13 un hexadecimal de longitud incorrecta hace fallar el cálculo', () => {
  it('"#B4C71" (5 dígitos) lanza un error y no devuelve ratio', () => {
    expect(() => calcularRatioContraste('#B4C71', '#FFFFFF')).toThrow(/no es un color hexadecimal válido/)
  })
})

describe('@s14 la forma abreviada de tres dígitos se rechaza en vez de interpretarse', () => {
  it('"#FFF" lanza un error en vez de interpretarse como blanco', () => {
    expect(() => calcularRatioContraste('#FFF', '#77286B')).toThrow(/no es un color hexadecimal válido/)
  })
})

describe('@s15 una cadena vacía hace fallar el cálculo', () => {
  it('la cadena vacía lanza un error', () => {
    expect(() => calcularRatioContraste('', '#FFFFFF')).toThrow(/no es un color hexadecimal válido/)
  })
})

describe('@s17 la puerta de contraste falla si el catálogo de parejas está vacío', () => {
  it('falla cerrada, declara que evaluó 0 parejas y no informa ninguna conforme', () => {
    const informe = ejecutarPuertaDeContraste([])

    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toContain('0 parejas')
    expect(informe.parejas).toHaveLength(0)
  })
})

describe('@s28 los umbrales de contraste exigidos son exactamente los del criterio', () => {
  it('4.5, 3, 24 y 18.66 escritos a mano coinciden con lo que consulta la puerta', () => {
    // Literales escritos a mano (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`):
    // no se obtienen de `umbralesDeContraste()`.
    const umbralTextoNormalEscritoAMano = 4.5
    const umbralTextoGrandeEscritoAMano = 3
    const tamanoTextoGrandeEscritoAMano = 24
    const tamanoTextoGrandeNegritaEscritoAMano = 18.66

    const umbrales = umbralesDeContraste()

    expect(umbrales.textoNormal).toBe(umbralTextoNormalEscritoAMano)
    expect(umbrales.textoGrande).toBe(umbralTextoGrandeEscritoAMano)
    expect(umbrales.tamanoTextoGrandePx).toBe(tamanoTextoGrandeEscritoAMano)
    expect(umbrales.tamanoTextoGrandeNegritaPx).toBe(tamanoTextoGrandeNegritaEscritoAMano)
  })
})

describe('@s29 todo texto normal alcanza el contraste mínimo frente a su fondo', () => {
  it('todas las parejas de texto normal del catálogo real alcanzan 4.5, y ninguna queda sin calcular', () => {
    const parejasDeTextoNormal = catalogoDeContraste.filter((par) => par.uso === 'texto normal')

    const informe = ejecutarPuertaDeContrasteTextoNormal(parejasDeTextoNormal)

    expect(informe.pasa).toBe(true)
    expect(informe.parejasEvaluadas).toBe(parejasDeTextoNormal.length)
    expect(informe.parejasEvaluadas).toBeGreaterThan(0)
    expect(informe.parejas.every((par) => par.ratio >= 4.5)).toBe(true)
  })

  it('refuerzo mutación: un catálogo con una pareja apta y otra no apta suspende la puerta completa (no basta con que UNA sea apta)', () => {
    const catalogoMixto: ParDeContraste[] = [
      { color: '#77286B', fondo: '#FFFFFF', uso: 'texto normal' },
      { color: '#B4C718', fondo: '#FFFFFF', uso: 'texto normal' },
    ]

    const informe = ejecutarPuertaDeContrasteTextoNormal(catalogoMixto)

    expect(informe.pasa).toBe(false)
    expect(informe.parejasEvaluadas).toBe(2)
  })
})

describe('@s30 todo texto grande alcanza el contraste mínimo frente a su fondo', () => {
  it('las parejas de texto grande del catálogo real alcanzan 3, y el recuento es mayor que 0', () => {
    const parejasDeTextoGrande = catalogoDeContraste.filter((par) => par.uso === 'texto grande')

    const informe = ejecutarPuertaDeContrasteTextoGrande(parejasDeTextoGrande)

    expect(informe.pasa).toBe(true)
    expect(informe.parejasEvaluadas).toBeGreaterThan(0)
    expect(informe.parejas.every((par) => par.ratio >= 3)).toBe(true)
  })

  it('23px sin negrita no es texto grande, pero 24px sin negrita sí lo es', () => {
    expect(esTextoGrande(23, false)).toBe(false)
    expect(esTextoGrande(24, false)).toBe(true)
  })

  it('18px en negrita no es texto grande, pero 18.66px en negrita sí lo es', () => {
    expect(esTextoGrande(18, true)).toBe(false)
    expect(esTextoGrande(18.66, true)).toBe(true)
  })
})

describe('@s31 los componentes de interfaz y sus estados alcanzan el contraste mínimo frente a lo que los rodea', () => {
  it('las parejas de componente de interfaz del catálogo real alcanzan 3, y el recuento es mayor que 0', () => {
    const parejasDeComponente = catalogoDeContraste.filter(
      (par) => par.uso === 'componente de interfaz o borde de foco',
    )

    const informe = ejecutarPuertaDeContrasteComponentesInterfaz(parejasDeComponente)

    expect(informe.pasa).toBe(true)
    expect(informe.parejasEvaluadas).toBeGreaterThan(0)
    expect(informe.parejas.every((par) => par.ratio >= 3)).toBe(true)
  })
})

describe('@s32 una pareja que se queda justo por debajo del umbral suspende la puerta', () => {
  it('4.49 para texto normal: suspenso, indica el ratio 4.49 y el umbral 4.5, y nombra la pareja', () => {
    const par: ParDeContraste = { color: '#ABABAB', fondo: '#FFFFFF', uso: 'texto normal' }

    const veredicto = formularVeredictoDePareja(par, 4.49)

    expect(veredicto.veredicto).toBe('suspenso')
    expect(veredicto.ratio).toBe(4.49)
    expect(veredicto.umbral).toBe(4.5)
    expect(veredicto.color).toBe('#ABABAB')
    expect(veredicto.fondo).toBe('#FFFFFF')
  })
})

describe('@s34 una pareja que alcanza exactamente el umbral exigido aprueba la puerta', () => {
  it('ratio exactamente 4.5 para texto normal aprueba', () => {
    const par: ParDeContraste = { color: '#000000', fondo: '#FFFFFF', uso: 'texto normal' }

    const veredicto = formularVeredictoDePareja(par, 4.5)

    expect(veredicto.veredicto).toBe('aprobado')
  })

  it('ratio exactamente 3 para texto grande aprueba', () => {
    const par: ParDeContraste = { color: '#000000', fondo: '#FFFFFF', uso: 'texto grande' }

    const veredicto = formularVeredictoDePareja(par, 3)

    expect(veredicto.veredicto).toBe('aprobado')
  })
})

describe('@s33 con el inventario de parejas de color de texto normal vacío la puerta falla cerrada', () => {
  it('0 parejas calculadas, suspenso, declara que no calculó ninguna de texto normal', () => {
    const informe = ejecutarPuertaDeContrasteTextoNormal([])

    expect(informe.parejasEvaluadas).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toContain('texto normal')
    expect(informe.parejas).toEqual([])
  })
})

describe('@s35 con el inventario de parejas de color de texto grande vacío la puerta falla cerrada', () => {
  it('0 parejas calculadas, suspenso, declara que no calculó ninguna de texto grande', () => {
    const informe = ejecutarPuertaDeContrasteTextoGrande([])

    expect(informe.parejasEvaluadas).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toContain('texto grande')
    expect(informe.parejas).toEqual([])
  })
})

describe('@s36 con el inventario de componentes de interfaz vacío la puerta falla cerrada', () => {
  it('0 elementos calculados, suspenso, declara que no calculó ningún componente de interfaz', () => {
    const informe = ejecutarPuertaDeContrasteComponentesInterfaz([])

    expect(informe.parejasEvaluadas).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toContain('componente de interfaz')
    expect(informe.parejas).toEqual([])
  })
})

describe('evaluarParDeContraste compone el cálculo real del ratio con el veredicto de la pareja', () => {
  it('negro sobre blanco para texto normal: ratio 21 (redondeado) y veredicto aprobado, igual que @s2', () => {
    const par: ParDeContraste = { color: '#000000', fondo: '#FFFFFF', uso: 'texto normal' }

    const veredicto = evaluarParDeContraste(par)

    expect(Number(veredicto.ratio.toFixed(2))).toBe(21)
    expect(veredicto.veredicto).toBe('aprobado')
    expect(veredicto.umbral).toBe(4.5)
    expect(veredicto.color).toBe('#000000')
    expect(veredicto.fondo).toBe('#FFFFFF')
  })
})
