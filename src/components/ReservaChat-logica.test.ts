import { describe, expect, it } from 'vitest'
import { componerResumen, normalizarRespuesta, puedeRegistrarRespuesta, siguientePaso } from './ReservaChat-logica'

describe('@s21 la lógica pura decide si una respuesta puede registrarse, sin tocar el DOM', () => {
  it('acepta "Nala y Ana Martín" y "  Nala y Ana Martín  ", rechaza "   " (solo espacios)', () => {
    expect(puedeRegistrarRespuesta('Nala y Ana Martín')).toBe(true)
    expect(puedeRegistrarRespuesta('   ')).toBe(false)
    expect(puedeRegistrarRespuesta('  Nala y Ana Martín  ')).toBe(true)
  })

  it('el valor normalizado de "  Nala y Ana Martín  " es exactamente "Nala y Ana Martín", sin espacios al principio ni al final', () => {
    expect(normalizarRespuesta('  Nala y Ana Martín  ')).toBe('Nala y Ana Martín')
  })
})

describe('@s22 la lógica pura compone el resumen final a partir de las tres primeras respuestas, sin tocar el DOM', () => {
  it('el resumen es exactamente "Medicina general · Una gata de 4 años · Entre semana por la mañana"', () => {
    expect(componerResumen('Medicina general', 'Una gata de 4 años', 'Entre semana por la mañana')).toBe(
      'Medicina general · Una gata de 4 años · Entre semana por la mañana',
    )
  })
})

describe('@s23 la lógica pura corta el guion al elegir "Es una urgencia", sin tocar el DOM', () => {
  it('desde "servicio" con "Es una urgencia" el paso siguiente es "urgencia", no "animal"', () => {
    expect(siguientePaso('servicio', 'Es una urgencia')).toBe('urgencia')
  })

  it('desde "urgencia" el paso siguiente no es ni "animal", ni "cuando", ni "nombre"', () => {
    const siguiente = siguientePaso('urgencia', 'cualquier respuesta')
    expect(siguiente).not.toBe('animal')
    expect(siguiente).not.toBe('cuando')
    expect(siguiente).not.toBe('nombre')
  })

  it('refuerzo mutación: desde "animal" el paso siguiente es exactamente "cuando"', () => {
    expect(siguientePaso('animal', 'cualquier respuesta')).toBe('cuando')
  })

  it('refuerzo mutación: desde "cuando" el paso siguiente es exactamente "nombre"', () => {
    expect(siguientePaso('cuando', 'cualquier respuesta')).toBe('nombre')
  })

  it('refuerzo mutación: desde "nombre" el paso siguiente es exactamente "final"', () => {
    expect(siguientePaso('nombre', 'cualquier respuesta')).toBe('final')
  })

  it('refuerzo mutación: desde "final" (estado terminal) el paso siguiente es exactamente "final"', () => {
    expect(siguientePaso('final', 'cualquier respuesta')).toBe('final')
  })

  it('refuerzo mutación: desde "urgencia" (estado terminal) el paso siguiente es exactamente "urgencia"', () => {
    expect(siguientePaso('urgencia', 'cualquier respuesta')).toBe('urgencia')
  })
})
