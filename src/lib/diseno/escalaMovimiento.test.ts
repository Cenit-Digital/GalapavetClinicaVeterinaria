import { describe, expect, it } from 'vitest'
import {
  type FicheroEstilos,
  ejecutarPuertaDeEscalaDeMovimiento,
  escalaDeMovimientoDeclarada,
} from './escalaMovimiento'

function ficheroDeEstilos(ruta: string, contenido: string): FicheroEstilos {
  return { ruta, contenido }
}

const FICHEROS_REALES: readonly FicheroEstilos[] = [
  ...Object.entries(
    import.meta.glob('../../styles/global.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
  ),
  ...Object.entries(
    import.meta.glob('../../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
  ),
  ...Object.entries(
    import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
  ),
].map(([ruta, contenido]) => ficheroDeEstilos(ruta, contenido))

describe('identidad_visual @s16 la escala de movimiento declara exactamente dos duraciones y una curva de salida', () => {
  it('la escala contiene exactamente 150 y 300 ms, y la curva es exactamente "ease-out"', () => {
    // Literal escrito a mano — NO se obtiene de la escala que se comprueba (patrón doble-de-test-anclado-al-literal).
    const escalaAMano = { duraciones: [150, 300], curva: 'ease-out' }

    const escala = escalaDeMovimientoDeclarada()

    expect(escala.duracionesMs).toEqual(escalaAMano.duraciones)
    expect(escala.curva).toBe(escalaAMano.curva)
  })

  it('ninguna declaración de transición/animación de los 18 ficheros reales usa una duración fuera de {150, 300, 0.01}ms', () => {
    expect(FICHEROS_REALES.length).toBeGreaterThan(0)

    const informe = ejecutarPuertaDeEscalaDeMovimiento(FICHEROS_REALES)

    expect(informe.ficherosInspeccionados).toBe(FICHEROS_REALES.length)
    expect(informe.duracionesFueraDeEscala).toEqual([])
  })

  it('ninguna declaración real anima la palabra clave "all"', () => {
    const informe = ejecutarPuertaDeEscalaDeMovimiento(FICHEROS_REALES)

    expect(informe.usosDePalabraClaveAll).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('con 0 ficheros la puerta falla cerrada, nunca "pasa" por vacuidad', () => {
    const informe = ejecutarPuertaDeEscalaDeMovimiento([])

    expect(informe.ficherosInspeccionados).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.duracionesFueraDeEscala).toEqual([])
    expect(informe.usosDePalabraClaveAll).toEqual([])
  })

  it('señala una duración sintética de 400ms fuera de la escala, con su ruta y línea', () => {
    const ficheroSintetico = ficheroDeEstilos('/prueba/fuera-de-escala.scss', 'body {\n  transition: color 400ms ease-out;\n}\n')

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.duracionesFueraDeEscala).toEqual([{ ruta: '/prueba/fuera-de-escala.scss', linea: 2, valorMs: 400 }])
    expect(informe.pasa).toBe(false)
  })

  it('señala una transición sintética que anima "all"', () => {
    const ficheroSintetico = ficheroDeEstilos('/prueba/anima-todo.scss', 'body {\n  transition: all 150ms ease-out;\n}\n')

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: '/prueba/anima-todo.scss', linea: 2 }])
    expect(informe.pasa).toBe(false)
  })

  it('una línea "-delay" (nunca "-duration") queda fuera del análisis aunque lleve una duración fuera de escala', () => {
    const ficheroSintetico = ficheroDeEstilos('/prueba/con-delay.scss', 'body {\n  animation-delay: 500ms;\n}\n')

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.duracionesFueraDeEscala).toEqual([])
  })

  it('"transition"/"animation" dentro de un comentario, sin estar al inicio de la línea, no cuenta como línea de movimiento', () => {
    const ficheroSintetico = ficheroDeEstilos(
      '/prueba/comentario.scss',
      'body {\n  /* antes: transition: 999ms */\n}\n',
    )

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.duracionesFueraDeEscala).toEqual([])
  })

  it('una línea "transition" con un espacio antes de los dos puntos sigue contando como línea de movimiento', () => {
    const ficheroSintetico = ficheroDeEstilos(
      '/prueba/espacio-antes-de-los-dos-puntos.scss',
      'body {\n  transition : color 400ms;\n}\n',
    )

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.duracionesFueraDeEscala).toEqual([
      { ruta: '/prueba/espacio-antes-de-los-dos-puntos.scss', linea: 2, valorMs: 400 },
    ])
  })

  it('"all" tras "transition" con un espacio antes de los dos puntos sigue detectándose', () => {
    const ficheroSintetico = ficheroDeEstilos('/prueba/all-espacio-antes-de-los-dos-puntos.scss', 'body {\n  transition : all 150ms;\n}\n')

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.usosDePalabraClaveAll).toEqual([
      { ruta: '/prueba/all-espacio-antes-de-los-dos-puntos.scss', linea: 2 },
    ])
  })

  it('"all" pegado a los dos puntos, sin ningún espacio, sigue detectándose', () => {
    const ficheroSintetico = ficheroDeEstilos('/prueba/all-sin-espacio.scss', 'body {\n  transition:all 150ms;\n}\n')

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: '/prueba/all-sin-espacio.scss', linea: 2 }])
  })

  it('"all" como uno más de una lista de propiedades separada por comas (alternativa B), sin espacio tras la coma', () => {
    const ficheroSintetico = ficheroDeEstilos(
      '/prueba/all-en-lista-sin-espacio.scss',
      'body {\n  transition: color 150ms,all 300ms;\n}\n',
    )

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: '/prueba/all-en-lista-sin-espacio.scss', linea: 2 }])
  })

  it('"all" como uno más de una lista de propiedades separada por comas (alternativa B), con un espacio tras la coma', () => {
    const ficheroSintetico = ficheroDeEstilos(
      '/prueba/all-en-lista-con-espacio.scss',
      'body {\n  transition: color 150ms, all 300ms;\n}\n',
    )

    const informe = ejecutarPuertaDeEscalaDeMovimiento([ficheroSintetico])

    expect(informe.usosDePalabraClaveAll).toEqual([{ ruta: '/prueba/all-en-lista-con-espacio.scss', linea: 2 }])
  })
})
