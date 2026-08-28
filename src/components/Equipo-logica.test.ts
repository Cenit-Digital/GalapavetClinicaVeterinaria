import { describe, expect, it } from 'vitest'
import { inicialesDe, profesionalesValidos, rotuloBoton, tieneFormacion } from './Equipo-logica'

describe('rotuloBoton devuelve el nombre accesible del botón según el estado (apoyo de @s3/@s4/@s5/@s6)', () => {
  it('colapsado (false) es "Ver la formación de <nombre>"', () => {
    expect(rotuloBoton(false, 'Marcos Pérez')).toBe('Ver la formación de Marcos Pérez')
  })

  it('desplegado (true) es "Ocultar la formación de <nombre>"', () => {
    expect(rotuloBoton(true, 'Marcos Pérez')).toBe('Ocultar la formación de Marcos Pérez')
  })
})

describe('tieneFormacion (apoyo de @s3/@s7)', () => {
  it('un profesional con formación publicada es verdadero', () => {
    expect(tieneFormacion('Licenciado en veterinaria por la Universidad Complutense de Madrid')).toBe(true)
  })

  it('un profesional sin formación publicada (undefined) es falso', () => {
    expect(tieneFormacion(undefined)).toBe(false)
  })
})

describe('inicialesDe toma la primera letra de las dos primeras palabras del nombre real (apoyo de @s32)', () => {
  it('con nombre y un apellido, devuelve las dos iniciales, nunca solo la primera', () => {
    expect(inicialesDe('Marcos Pérez')).toBe('MP')
  })

  it('con nombre y apellido distintos, devuelve las iniciales de ambos', () => {
    expect(inicialesDe('Joaquín Herranz')).toBe('JH')
  })

  it('con dos apellidos, se queda solo con el nombre y el PRIMER apellido, no con el segundo', () => {
    expect(inicialesDe('Ana María López García')).toBe('AM')
  })

  it('con una sola palabra, devuelve solo esa inicial, sin reventar', () => {
    expect(inicialesDe('Fideo')).toBe('F')
  })

  it('con espacios sobrantes en los extremos, descarta las cadenas vacías del split en vez de tomarlas como palabra', () => {
    expect(inicialesDe('  Ana María')).toBe('AM')
  })

  it('con dos o más espacios seguidos entre palabras, sigue tomando la primera letra de cada palabra real, no de un hueco', () => {
    expect(inicialesDe('Ana   María')).toBe('AM')
  })
})

describe('profesionalesValidos descarta los profesionales sin nombre (apoyo de @s9)', () => {
  it('un profesional con nombre vacío entre dos válidos queda fuera, el resto conserva su orden', () => {
    expect(
      profesionalesValidos([
        { nombre: 'Uno', rol: 'Rol' },
        { nombre: '', rol: 'Rol' },
        { nombre: 'Dos', rol: 'Rol' },
      ]),
    ).toEqual([
      { nombre: 'Uno', rol: 'Rol' },
      { nombre: 'Dos', rol: 'Rol' },
    ])
  })
})
