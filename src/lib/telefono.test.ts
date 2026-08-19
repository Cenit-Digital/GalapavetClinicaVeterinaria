import { describe, expect, it } from 'vitest'
import { enlaceLlamada, enlaceMensajeria, normalizarTelefono } from './telefono'

describe('@s7 tres formas de escribir el mismo número producen el mismo número internacional', () => {
  it('"91 082 92 67", "910829267" y "+34 910 82 92 67" normalizan a "+34910829267"', () => {
    const escrituras = ['91 082 92 67', '910829267', '+34 910 82 92 67']

    const normalizadas = escrituras.map((escritura) => normalizarTelefono(escritura))

    for (const normalizada of normalizadas) {
      expect(normalizada).toBe('+34910829267')
      expect(normalizada).not.toBe('')
    }
  })
})

describe('@s8 un teléfono con menos de nueve dígitos hace fallar al normalizador', () => {
  it('"91 082 92" lanza un error que cita el valor recibido, cita "9 dígitos" y no produce ningún "tel:"', () => {
    let enlace: string | undefined

    expect(() => {
      enlace = enlaceLlamada('91 082 92')
    }).toThrow('91 082 92')

    expect(() => enlaceLlamada('91 082 92')).toThrow('9 dígitos')
    expect(enlace).toBeUndefined()
  })

  it('refuerzo mutación: un teléfono con más de nueve dígitos también hace fallar al normalizador', () => {
    expect(() => normalizarTelefono('91 082 92 67 8')).toThrow('9 dígitos')
  })

  it('refuerzo mutación: lo lanzado es una instancia real de Error, no un valor vacío', () => {
    // `expect` fuera del catch (no condicional a que se lance o no), por
    // `vitest/no-conditional-expect`: si `enlaceLlamada` no lanzara, `error`
    // seguiría siendo `undefined` y la siguiente aserción fallaría igual.
    let error: unknown

    try {
      enlaceLlamada('91 082 92')
    } catch (e) {
      error = e
    }

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toContain('91 082 92')
  })
})

describe('@s9 un teléfono vacío hace fallar al normalizador en vez de emitir un enlace a medias', () => {
  it('"" lanza un error que indica que el teléfono recibido está vacío y no produce ningún "tel:+34"', () => {
    let enlace: string | undefined

    expect(() => {
      enlace = enlaceLlamada('')
    }).toThrow(/vac[íi]o/i)

    expect(enlace).toBeUndefined()
  })
})

describe('@s10 un teléfono con letras hace fallar al normalizador', () => {
  it('"91O82 92 67" (la "O" no es un cero) lanza un error que cita el valor recibido y no produce ningún "tel:"', () => {
    let enlace: string | undefined

    expect(() => {
      enlace = enlaceLlamada('91O82 92 67')
    }).toThrow('91O82 92 67')

    expect(enlace).toBeUndefined()
  })
})

describe('@s11 un teléfono con prefijo internacional distinto del español hace fallar al normalizador', () => {
  it('"+33 1 23 45 67 89" lanza un error y no produce ninguna cadena que empiece por "tel:+34"', () => {
    let enlace: string | undefined

    expect(() => {
      enlace = enlaceLlamada('+33 1 23 45 67 89')
    }).toThrow(/no válido/i)

    expect(enlace).toBeUndefined()
  })
})

describe('@s12 el enlace de mensajería también falla cerrado ante un teléfono que no valida', () => {
  it('"685 34 31" con texto "Hola" lanza un error de teléfono no válido y no produce ninguna cadena que empiece por "https://wa.me/"', () => {
    let enlace: string | undefined

    expect(() => {
      enlace = enlaceMensajeria('685 34 31', 'Hola')
    }).toThrow('685 34 31')

    expect(enlace).toBeUndefined()
  })
})
