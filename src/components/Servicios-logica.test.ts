import { describe, expect, it } from 'vitest'
import { nombreAccesibleBoton, puntosVisibles, rotuloBoton, tieneDesglose } from './Servicios-logica'

describe('rotuloBoton devuelve el rótulo visible según el estado de expansión (apoyo de @s2/@s10)', () => {
  it('colapsado (false) es "Ver qué incluye"', () => {
    expect(rotuloBoton(false)).toBe('Ver qué incluye')
  })

  it('desplegado (true) es "Ocultar detalle"', () => {
    expect(rotuloBoton(true)).toBe('Ocultar detalle')
  })
})

describe('puntosVisibles descarta los puntos en blanco (apoyo de @s16)', () => {
  it('una cadena en blanco entre puntos reales queda fuera, el resto conserva su orden', () => {
    expect(puntosVisibles(['Uno', '   ', 'Dos'])).toEqual(['Uno', 'Dos'])
  })
})

describe('tieneDesglose (apoyo de @s15)', () => {
  it('un desglose sin ningún punto real es falso', () => {
    expect(tieneDesglose([])).toBe(false)
  })

  it('un desglose con al menos un punto real es verdadero, aunque haya blancos mezclados', () => {
    expect(tieneDesglose(['   ', 'Uno'])).toBe(true)
  })
})

describe('nombreAccesibleBoton compone un nombre accesible distinto por tarjeta (apoyo de @s14)', () => {
  it('concatena el rótulo y el título del bloque separados por " de "', () => {
    expect(nombreAccesibleBoton('Ver qué incluye', 'Medicina general')).toBe('Ver qué incluye de Medicina general')
  })
})
