import { describe, expect, it } from 'vitest'
import { mezclar } from './mezclaDeColor'

const BLANCO = '#FFFFFF'
const NEGRO = '#000000'
const MORADO = '#77286B'
const LIMA = '#B4C718'

describe('@s4 cada rol nuevo de "marca" es una mezcla en sRGB de un color de marca con blanco o con negro puro', () => {
  it('recalcula, canal a canal y con redondeo estándar, las ocho mezclas de la tabla de derivaciones', () => {
    expect(mezclar(BLANCO, MORADO, 0.08)).toBe('#F4EEF3')
    expect(mezclar(BLANCO, MORADO, 0.04)).toBe('#FAF6F9')
    expect(mezclar(MORADO, NEGRO, 0.3)).toBe('#531C4B')
    expect(mezclar(MORADO, BLANCO, 0.2)).toBe('#925389')
    expect(mezclar(MORADO, NEGRO, 0.1)).toBe('#6B2460')
    expect(mezclar(BLANCO, LIMA, 0.12)).toBe('#F6F8E3')
    expect(mezclar(BLANCO, MORADO, 0.7)).toBe('#A06997')
    expect(mezclar(BLANCO, MORADO, 0.25)).toBe('#DDC9DA')
  })
})

describe('mezclar valida el formato hexadecimal de sus dos colores', () => {
  it('lanza si "base" no es un hexadecimal de 6 dígitos', () => {
    expect(() => mezclar('#FFF', NEGRO, 0.5)).toThrow(/no es un color hexadecimal válido/)
  })

  it('lanza si "otro" no es un hexadecimal de 6 dígitos', () => {
    expect(() => mezclar(BLANCO, 'red', 0.5)).toThrow(/no es un color hexadecimal válido/)
  })

  it('lanza si "base" tiene basura ANTES del "#", aunque los 6 dígitos que siguen sean válidos', () => {
    expect(() => mezclar('X#FFFFFF', NEGRO, 0.5)).toThrow(/no es un color hexadecimal válido/)
  })

  it('lanza si "otro" tiene basura DESPUÉS de los 6 dígitos, aunque empiece con un "#" válido', () => {
    expect(() => mezclar(BLANCO, '#FFFFFFX', 0.5)).toThrow(/no es un color hexadecimal válido/)
  })
})

describe('mezclar rellena con el cero inicial cualquier canal que quede en un solo dígito hexadecimal', () => {
  it('mezclando dos colores que dan un canal de un solo dígito hex, el resultado conserva el cero de relleno', () => {
    // #010101 mezclado consigo mismo, a cualquier porcentaje, da siempre #010101: cada canal
    // resuelve a 1 (0x01), un solo dígito hex sin el cero de relleno de `padStart`.
    expect(mezclar('#010101', '#010101', 0.5)).toBe('#010101')
  })
})

describe('mezclar en los extremos del porcentaje', () => {
  it('0% de "otro" devuelve "base" tal cual', () => {
    expect(mezclar(MORADO, BLANCO, 0)).toBe(MORADO)
  })

  it('100% de "otro" devuelve "otro" tal cual', () => {
    expect(mezclar(MORADO, BLANCO, 1)).toBe(BLANCO)
  })
})
