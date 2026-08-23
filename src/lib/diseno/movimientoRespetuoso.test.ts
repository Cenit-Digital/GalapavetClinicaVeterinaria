import { describe, expect, it } from 'vitest'
import { ejecutarPuertaDeMovimientoRespetuoso } from './movimientoRespetuoso'

describe('@s33 toda regla de animación o transición introducida vive dentro de la consulta prefers-reduced-motion', () => {
  it('los ficheros reales del inventario: cada transition/animation vive en no-preference o en reduce, y se comprobó más de 0 ficheros', () => {
    const ficherosReales = {
      ...import.meta.glob('../../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
      ...import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
    } as Record<string, string>
    const ficheros = Object.entries(ficherosReales).map(([ruta, contenido]) => ({ ruta, contenido }))

    const informe = ejecutarPuertaDeMovimientoRespetuoso(ficheros)

    expect(informe.ficherosComprobados).toBeGreaterThan(0)
    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })

  it('una transición fuera de cualquier bloque prefers-reduced-motion se señala como incumplimiento', () => {
    const ficheroSinCobertura = {
      ruta: '/prueba/SinCobertura.module.scss',
      contenido: '.boton {\n  transition: color 150ms ease;\n}\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroSinCobertura])

    expect(informe.ficherosComprobados).toBe(1)
    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/SinCobertura.module.scss', linea: 2 }])
    expect(informe.pasa).toBe(false)
  })

  it('un bloque "reduce" cubre sus declaraciones, pero deja de cubrir una declaración posterior a su cierre', () => {
    const ficheroConReduce = {
      ruta: '/prueba/ConReduce.module.scss',
      contenido: [
        '.acordeon {',
        '  @media (prefers-reduced-motion: reduce) {',
        '    transition: none;',
        '    animation: none;',
        '  }',
        '  transition: color 1s;',
        '}',
        '',
      ].join('\n'),
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroConReduce])

    // Las dos declaraciones dentro del bloque "reduce" están cubiertas; la de la línea 6, tras cerrarlo, no.
    expect(informe.incumplimientos).toEqual([{ ruta: '/prueba/ConReduce.module.scss', linea: 6 }])
    expect(informe.pasa).toBe(false)
  })

  it('un fichero sin ninguna declaración de movimiento no cuenta como comprobado, evaluado en solitario', () => {
    const ficheroSinMovimiento = {
      ruta: '/prueba/SinMovimiento.module.scss',
      contenido: '.tarjeta {\n  color: red;\n}\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroSinMovimiento])

    expect(informe.ficherosComprobados).toBe(0)
    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(false)
  })

  it('la palabra "transition:" en medio de una línea que no es una declaración real no se confunde con una', () => {
    const ficheroConComentario = {
      ruta: '/prueba/ConComentario.module.scss',
      contenido: '.a:hover { color: red; } // transition: fake\n',
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroConComentario])

    expect(informe.ficherosComprobados).toBe(0)
    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(false)
  })

  it('un bloque "no-preference" sin espacio tras los dos puntos también se reconoce como cobertura', () => {
    const ficheroSinEspacio = {
      ruta: '/prueba/SinEspacio.module.scss',
      contenido: ['.a {', '  @media (prefers-reduced-motion:no-preference) {', '    transition: color 1s;', '  }', '}', ''].join('\n'),
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroSinEspacio])

    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })

  it('un bloque "reduce" con dos espacios tras los dos puntos también se reconoce como cobertura', () => {
    const ficheroDosEspacios = {
      ruta: '/prueba/ReduceDosEspacios.module.scss',
      contenido: ['.a {', '  @media (prefers-reduced-motion:  reduce) {', '    animation: none;', '  }', '}', ''].join('\n'),
    }

    const informe = ejecutarPuertaDeMovimientoRespetuoso([ficheroDosEspacios])

    expect(informe.incumplimientos).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })
})
