import { describe, expect, it } from 'vitest'
import { categoriaDeServicio, nombreAccesibleBoton, puntosVisibles, resumenDeServicio, rotuloBoton, tieneDesglose } from './Servicios-logica'

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

describe('@s2 de fidelidad_servicios: resumen verificable de una tarjeta', () => {
  it('une solo los dos primeros puntos publicados y descarta los vacíos', () => {
    expect(resumenDeServicio(['  ', 'Cirugía de tejidos blandos', 'Esterilizaciones', 'Odontología'])).toBe(
      'Cirugía de tejidos blandos · Esterilizaciones',
    )
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

/**
 * `features/rediseno_visual.feature:495` (@s31) exige que la píldora de
 * categoría esté "derivada del propio título del bloque". Antes de esta
 * función, `Servicios.tsx:26` escribía el literal fijo "Atención veterinaria"
 * para las 5 tarjetas: ninguna derivación posible con un valor constante.
 */
describe('categoriaDeServicio deriva la píldora de categoría a partir del título del bloque (apoyo de @s31)', () => {
  it('toma la primera palabra significativa de cada uno de los 5 títulos reales del catálogo', () => {
    expect(categoriaDeServicio('Cirugía y anestesia')).toBe('Cirugía')
    expect(categoriaDeServicio('Diagnóstico de imagen')).toBe('Diagnóstico')
    expect(categoriaDeServicio('Medicina general')).toBe('Medicina')
    expect(categoriaDeServicio('Análisis')).toBe('Análisis')
    expect(categoriaDeServicio('Especialidades')).toBe('Especialidades')
  })

  it('dos títulos distintos producen píldoras de categoría distintas: no puede ser un literal fijo', () => {
    expect(categoriaDeServicio('Medicina general')).not.toBe(categoriaDeServicio('Análisis'))
  })

  it('con un espacio inicial en el título, la píldora sigue siendo la palabra real, no una cadena vacía', () => {
    expect(categoriaDeServicio(' Cirugía y anestesia')).toBe('Cirugía')
  })

  it('acepta cualquier separador de espacio y devuelve vacío cuando no existe ninguna palabra', () => {
    expect(categoriaDeServicio('Cirugía\t y anestesia')).toBe('Cirugía')
    expect(categoriaDeServicio(' \t ')).toBe('')
  })
})
