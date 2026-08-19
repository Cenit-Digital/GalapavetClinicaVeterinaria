import { describe, expect, it } from 'vitest'
import { profesionalesValidos, rotuloBoton, tieneFormacion } from './Equipo-logica'

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
