import { describe, expect, it } from 'vitest'
import { ESCENARIOS_HEREDADOS_DECLARADOS, comprobarEscenariosHeredadosCitados } from './escenariosHeredados'

function textosDePruebasDeNavegador(): readonly string[] {
  const ficheros = import.meta.glob('../../../tests/e2e/*.spec.ts', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>
  const textos = Object.values(ficheros)
  if (textos.length === 0) {
    throw new Error('no se encontró ningún fichero real en "tests/e2e"')
  }
  return textos
}

describe('identidad_visual @s50 la suite de navegador real declara, uno a uno, los doce escenarios heredados que ejecuta', () => {
  it('la suite declara exactamente los doce identificadores heredados de la Decisión 41', () => {
    // Literal escrito a mano — NO se obtiene de la lista que se comprueba (patrón doble-de-test-anclado-al-literal).
    const identificadoresAMano = [
      '@s12',
      '@s27',
      '@s28',
      '@s29',
      '@s30',
      '@s31',
      '@s32',
      '@s34',
      '@s2',
      '@s17',
      '@s18',
      '@s19',
    ]

    expect(ESCENARIOS_HEREDADOS_DECLARADOS).toEqual(identificadoresAMano)
  })

  it('el recuento de escenarios heredados declarados es exactamente 12', () => {
    expect(ESCENARIOS_HEREDADOS_DECLARADOS).toHaveLength(12)
  })

  it('cada uno de los doce está citado desde al menos una prueba real de "tests/e2e"', () => {
    const informe = comprobarEscenariosHeredadosCitados(ESCENARIOS_HEREDADOS_DECLARADOS, textosDePruebasDeNavegador())

    expect(informe.declarados).toBe(12)
    expect(informe.noCitados).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('un identificador heredado inventado, ausente del texto real, hace fallar la comprobación', () => {
    const informe = comprobarEscenariosHeredadosCitados(
      [...ESCENARIOS_HEREDADOS_DECLARADOS, '@s99'],
      textosDePruebasDeNavegador(),
    )

    expect(informe.noCitados).toEqual(['@s99'])
    expect(informe.pasa).toBe(false)
  })

  it('con la lista de declarados vacía, la comprobación falla cerrada', () => {
    const informe = comprobarEscenariosHeredadosCitados([], textosDePruebasDeNavegador())

    expect(informe.declarados).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.noCitados).toEqual([])
  })

  it('con menos de doce identificadores, aunque estén TODOS citados, la comprobación no pasa', () => {
    const subconjuntoCitado = ['@s12', '@s27']

    const informe = comprobarEscenariosHeredadosCitados(subconjuntoCitado, textosDePruebasDeNavegador())

    expect(informe.noCitados).toEqual([])
    expect(informe.pasa).toBe(false)
  })

  it('con exactamente doce identificadores pero uno inventado en vez de uno real, la comprobación no pasa', () => {
    const doceConUnoInventado = [...ESCENARIOS_HEREDADOS_DECLARADOS.slice(1), '@s99']

    const informe = comprobarEscenariosHeredadosCitados(doceConUnoInventado, textosDePruebasDeNavegador())

    expect(doceConUnoInventado).toHaveLength(12)
    expect(informe.pasa).toBe(false)
  })

  it('"@s2" no se da por citado dentro de "@s27" ni de "@s25" (frontera de palabra)', () => {
    const textosSinteticos = ['esto cita @s27 y también @s25, ninguno de los dos es el escenario buscado']

    const informe = comprobarEscenariosHeredadosCitados(['@s2'], textosSinteticos)

    expect(informe.noCitados).toEqual(['@s2'])
  })
})
