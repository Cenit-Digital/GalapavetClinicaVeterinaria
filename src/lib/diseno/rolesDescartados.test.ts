import { describe, expect, it } from 'vitest'
import { type FicheroDeTexto, ejecutarPuertaDeRolesDescartados } from './rolesDescartados'

function unicoTexto(ficheros: Record<string, string>, descripcion: string): string {
  const [texto] = Object.values(ficheros)
  if (texto === undefined) {
    throw new Error(`no se pudo leer el texto real de ${descripcion}`)
  }
  return texto
}

const textoDeTokens = (): FicheroDeTexto => ({
  ruta: '/styles/_tokens.scss',
  contenido: unicoTexto(
    import.meta.glob('../../styles/_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
    '"src/styles/_tokens.scss"',
  ),
})

const ficherosDeEstilosReales = (): readonly FicheroDeTexto[] =>
  Object.entries({
    ...(import.meta.glob('../../components/*.module.scss', {
      eager: true,
      query: '?raw',
      import: 'default',
    }) as Record<string, string>),
    ...(import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >),
  }).map(([ruta, contenido]) => ({ ruta, contenido }))

describe('identidad_visual @s11 los cuatro roles descartados no entran en el sistema por ninguna puerta', () => {
  it('no existe ningún token cuyo nombre contenga "urgencia" ni "urg"', () => {
    const informe = ejecutarPuertaDeRolesDescartados(textoDeTokens(), ficherosDeEstilosReales())

    expect(informe.tokensDeUrgencia).toEqual([])
  })

  it('no existe ningún token "--color-acento" a secas, distinto de "-tinta" y "-suave"', () => {
    const informe = ejecutarPuertaDeRolesDescartados(textoDeTokens(), ficherosDeEstilosReales())

    expect(informe.tokenAcentoASecasEncontrado).toBe(false)
  })

  it('"--color-primario-fuerte" está declarado Y se usa al menos una vez en un fichero de estilos real', () => {
    const informe = ejecutarPuertaDeRolesDescartados(textoDeTokens(), ficherosDeEstilosReales())

    expect(informe.primarioFuerteDeclarado).toBe(true)
    expect(informe.primarioFuerteUsado).toBe(true)
    expect(informe.pasa).toBe(true)
  })

  it('el recuento de ficheros efectivamente inspeccionados es mayor que 0', () => {
    const informe = ejecutarPuertaDeRolesDescartados(textoDeTokens(), ficherosDeEstilosReales())

    expect(informe.ficherosInspeccionados).toBeGreaterThan(0)
  })

  it('con 0 ficheros la puerta falla cerrada', () => {
    const informe = ejecutarPuertaDeRolesDescartados({ ruta: '', contenido: '' }, [])

    // Un `_tokens.scss` vacío SÍ cuenta como fichero inspeccionado (siempre se pasa el propio "tokens"):
    // la vacuidad real de esta puerta es "ni tokens ni estilos", que aquí se fuerza con contenido vacío.
    expect(informe.pasa).toBe(false)
  })

  it('detecta un token sintético "--color-urgencia" declarado en los tokens', () => {
    const tokensConUrgencia: FicheroDeTexto = {
      ruta: '/prueba/_tokens.scss',
      contenido: ':root { --color-urgencia: #ff0000; }',
    }

    const informe = ejecutarPuertaDeRolesDescartados(tokensConUrgencia, [])

    expect(informe.tokensDeUrgencia).toEqual(['--color-urgencia'])
    expect(informe.pasa).toBe(false)
  })

  it('detecta un token sintético "--color-acento" a secas, sin confundirlo con "--color-acento-tinta"', () => {
    const tokensConAcentoASecas: FicheroDeTexto = {
      ruta: '/prueba/_tokens.scss',
      contenido: ':root { --color-acento: #00ff00; --color-acento-tinta: #00ff00; --color-acento-suave: #eee; }',
    }

    const informe = ejecutarPuertaDeRolesDescartados(tokensConAcentoASecas, [])

    expect(informe.tokenAcentoASecasEncontrado).toBe(true)
  })

  it('"--color-primario-fuerte" declarado pero nunca usado hace fallar la puerta', () => {
    const tokensConPrimarioFuerte: FicheroDeTexto = {
      ruta: '/prueba/_tokens.scss',
      contenido: ':root { --color-primario-fuerte: #6B2460; }',
    }

    const informe = ejecutarPuertaDeRolesDescartados(tokensConPrimarioFuerte, [
      { ruta: '/prueba/Boton.module.scss', contenido: '.boton { color: var(--color-texto); }' },
    ])

    expect(informe.primarioFuerteDeclarado).toBe(true)
    expect(informe.primarioFuerteUsado).toBe(false)
    expect(informe.pasa).toBe(false)
  })

  it('con resultados MIXTOS entre ficheros, basta con que UNO tenga el acento a secas ("--color-acento" en al menos uno de varios)', () => {
    const tokensSinAcento: FicheroDeTexto = { ruta: '/prueba/_tokens.scss', contenido: '' }

    const informe = ejecutarPuertaDeRolesDescartados(tokensSinAcento, [
      { ruta: '/prueba/ConAcento.module.scss', contenido: ':root { --color-acento: #00ff00; }' },
      { ruta: '/prueba/SinAcento.module.scss', contenido: '.boton { color: red; }' },
    ])

    expect(informe.tokenAcentoASecasEncontrado).toBe(true)
  })

  it('urgencia declarada Y primario-fuerte declarado y usado a la vez hace fallar la puerta (ninguna condición se salta a la otra)', () => {
    const tokensConUrgenciaYPrimarioFuerte: FicheroDeTexto = {
      ruta: '/prueba/_tokens.scss',
      contenido: ':root { --color-urgencia: #fff; --color-primario-fuerte: #6B2460; }',
    }

    const informe = ejecutarPuertaDeRolesDescartados(tokensConUrgenciaYPrimarioFuerte, [
      { ruta: '/prueba/Boton.module.scss', contenido: '.boton { background: var(--color-primario-fuerte); }' },
    ])

    expect(informe.pasa).toBe(false)
  })

  it('"--color-primario-fuerte" declarado con un espacio antes de los dos puntos sigue contando como declarado', () => {
    const tokensConEspacioAntesDeLosDosPuntos: FicheroDeTexto = {
      ruta: '/prueba/_tokens.scss',
      contenido: ':root { --color-primario-fuerte : #6B2460; }',
    }

    const informe = ejecutarPuertaDeRolesDescartados(tokensConEspacioAntesDeLosDosPuntos, [])

    expect(informe.primarioFuerteDeclarado).toBe(true)
  })
})
