import { describe, expect, it } from 'vitest'
import { DATOS_ESTRUCTURADOS_NEGOCIO } from './datosEstructuradosNegocio'

describe('DATOS_ESTRUCTURADOS_NEGOCIO se calcula una vez a partir de la fuente única real (soporte de @s12)', () => {
  it('declara el nombre, la dirección y el teléfono reales de Galapavet', () => {
    expect(DATOS_ESTRUCTURADOS_NEGOCIO.name).toBe('Galapavet')

    const direccion = DATOS_ESTRUCTURADOS_NEGOCIO.address as Record<string, unknown>
    expect(direccion.streetAddress).toBe('Carretera de Torrelodones, 11')
    expect(direccion.postalCode).toBe('28260')

    const soloDigitos = String(DATOS_ESTRUCTURADOS_NEGOCIO.telephone).replace(/\D/g, '')
    expect(soloDigitos.endsWith('910829267')).toBe(true)
  })
})
