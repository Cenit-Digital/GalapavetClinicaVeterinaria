import { describe, expect, it } from 'vitest'
import type { EnlaceTelefono, TramoHorario } from './InformacionContacto-logica'
import { segmentosDeRespuesta, textoHorario, textoServicios } from './Faq-logica'

/**
 * Refuerzo de mutación (ronda 2, `progress/mutation_faq.md`): tests directos
 * sobre las funciones puras exportadas de `Faq-logica.ts`, sin pasar por el
 * `.tsx`. Ninguno corresponde a un escenario nuevo del `.feature`; cada uno
 * cierra huecos de aserción/cobertura concretos que dejó la primera medición
 * de mutación. Mapa mutante -> test en `progress/tdd_faq.md`.
 */

describe('textoHorario (refuerzo mutación, apoyo de @s2)', () => {
  it('compone el texto completo con las comas entre tramos y el punto final, tramo a tramo, literal exacto', () => {
    const horario: readonly TramoHorario[] = [
      { dias: 'Lunes a viernes', horas: '11:00 a 14:00 y 16:30 a 20:00' },
      { dias: 'Sábados', horas: '11:00 a 14:00' },
      { dias: 'Domingos', horas: 'Cerrado' },
    ]

    expect(textoHorario(horario)).toBe(
      'El horario es de lunes a viernes de 11:00 a 14:00 y de 16:30 a 20:00, de sábados de 11:00 a 14:00, domingos cerrado.',
    )
  })
})

describe('textoServicios (refuerzo mutación, apoyo de @s4)', () => {
  it('con tres o más títulos, enumera con coma entre los intermedios y " y " antes del último, literal exacto', () => {
    const servicios = [{ titulo: 'Uno' }, { titulo: 'Dos' }, { titulo: 'Tres' }]

    expect(textoServicios(servicios)).toBe('Ofrecemos Uno, Dos y Tres.')
  })

  it('con un único título no antepone ningún separador ni conector (rama de la lista de longitud 1)', () => {
    expect(textoServicios([{ titulo: 'Único' }])).toBe('Ofrecemos Único.')
  })
})

describe('segmentosDeRespuesta (refuerzo mutación, apoyo de @s3/@s5)', () => {
  const enlace: EnlaceTelefono = { textoVisible: '111', href: 'tel:+111' }

  it('trunca el fragmento de antes y el de después exactamente en los límites del número, sin duplicarlo', () => {
    expect(segmentosDeRespuesta('Llama al 111 ahora.', [enlace])).toEqual(['Llama al ', enlace, ' ahora.'])
  })

  it('excluye el enlace ya consumido al procesar el resto: una segunda aparición del mismo número queda como texto plano', () => {
    expect(segmentosDeRespuesta('Tel 111 y tel 111.', [enlace])).toEqual(['Tel ', enlace, ' y tel 111.'])
  })

  it('si el número está al principio del texto, no antepone ningún fragmento de texto vacío', () => {
    expect(segmentosDeRespuesta('111 es el teléfono.', [enlace])).toEqual([enlace, ' es el teléfono.'])
  })

  it('si el número es lo último del texto, no añade ningún fragmento de texto final', () => {
    expect(segmentosDeRespuesta('Llama al 111', [enlace])).toEqual(['Llama al ', enlace])
  })
})
