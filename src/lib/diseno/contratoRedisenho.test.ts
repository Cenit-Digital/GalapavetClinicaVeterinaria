import { describe, expect, it } from 'vitest'
import {
  ROLES_DE_COLOR_REDISENO,
  ROLES_DE_SOMBRA_REDISENO,
  VARIANTES_REDISENO,
  VARIANTE_PREDETERMINADA,
  buscarDeclaracionesLiteralesDelIdentificador,
} from './contratoRedisenho'
import { INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR } from './tokensColor'

/**
 * Literal escrito A MANO con los veinte nombres de token del sistema de color
 * (@s1: «un literal escrito a mano con los veinte nombres de token
 * esperados»). Patrón `doble-de-test-anclado-al-literal`: NO se deriva de
 * ninguna de las dos listas que confronta, se teclea aquí y se compara contra
 * las dos. El orden es el que declara `src/styles/_tokens.scss:7-26`, la hoja
 * que implementa el sistema.
 */
const VEINTE_NOMBRES_DE_TOKEN_ESPERADOS = [
  '--color-fondo',
  '--color-fondo-alterno',
  '--color-superficie',
  '--color-superficie-elevada',
  '--color-borde',
  '--color-borde-control',
  '--color-tinta',
  '--color-texto',
  '--color-texto-suave',
  '--color-primario',
  '--color-primario-fuerte',
  '--color-sobre-primario',
  '--color-acento',
  '--color-acento-tinta',
  '--color-acento-suave',
  '--color-urgencia',
  '--color-urgencia-suave',
  '--color-foco',
  '--sombra-reposo',
  '--sombra-elevada',
]

/**
 * Las tres entradas que este rediseño AÑADE al sistema anterior. Existían
 * prohibidas por nombre en `features/identidad_visual.feature:465-474` (@s11,
 * ya `done`) y este contrato las readmite (cabecera de
 * `features/rediseno_visual.feature:51-60`).
 */
const TRES_ROLES_NUEVOS_DEL_REDISENO = ['--color-acento', '--color-urgencia', '--color-urgencia-suave']

/**
 * Los diecisiete nombres del sistema ANTERIOR, copiados uno a uno del literal
 * que enumera `features/identidad_visual.feature:148` (@s1 de aquel contrato,
 * ya `done`), en su mismo orden. Sirve para la última cláusula de @s1:
 * «los diecisiete nombres que ya existían siguen presentes, ninguno
 * renombrado».
 */
const DIECISIETE_NOMBRES_DEL_SISTEMA_ANTERIOR = [
  '--color-fondo',
  '--color-fondo-alterno',
  '--color-superficie',
  '--color-superficie-elevada',
  '--color-tinta',
  '--color-texto',
  '--color-texto-suave',
  '--color-primario',
  '--color-primario-fuerte',
  '--color-sobre-primario',
  '--color-acento-tinta',
  '--color-acento-suave',
  '--color-borde-control',
  '--color-borde',
  '--color-foco',
  '--sombra-reposo',
  '--sombra-elevada',
]

const TOTAL_DE_TOKENS_DEL_SISTEMA = 20
const TOTAL_DE_ROLES_DE_COLOR = 18
const TOTAL_DE_ROLES_DE_SOMBRA = 2
const TOTAL_DE_TOKENS_DEL_SISTEMA_ANTERIOR = 17
const TOTAL_DE_ROLES_NUEVOS = 3
const TRES_FICHEROS_DE_EJEMPLO = 3

describe('contrato del rediseño visual', () => {
  it('@s1 declara los dieciocho roles de color y los dos de sombra', () => {
    expect(ROLES_DE_COLOR_REDISENO).toHaveLength(TOTAL_DE_ROLES_DE_COLOR)
    expect(ROLES_DE_SOMBRA_REDISENO).toHaveLength(TOTAL_DE_ROLES_DE_SOMBRA)
    expect([...ROLES_DE_COLOR_REDISENO, ...ROLES_DE_SOMBRA_REDISENO]).toEqual(
      expect.arrayContaining(TRES_ROLES_NUEVOS_DEL_REDISENO),
    )
  })

  it('@s1 confronta el literal escrito a mano de veinte nombres con las DOS listas que el proyecto declara', () => {
    // El literal se protege a sí mismo antes de servir de patrón: si alguien
    // le quitara entradas para «arreglar» el test, esta guarda lo delata
    // (patrón `verde-por-vacuidad-en-puerta-de-verificacion`).
    expect(VEINTE_NOMBRES_DE_TOKEN_ESPERADOS).toHaveLength(TOTAL_DE_TOKENS_DEL_SISTEMA)
    expect(new Set(VEINTE_NOMBRES_DE_TOKEN_ESPERADOS).size).toBe(TOTAL_DE_TOKENS_DEL_SISTEMA)

    // Las dos listas de producción son declaraciones INDEPENDIENTES del mismo
    // inventario: `contratoRedisenho.ts:1-22` a mano y `tokensColor.ts:76`
    // derivada de los tipos `RolDeColor`/`RolDeSombra`. Confrontar cada una
    // con el literal impide renombrar un token en las dos a la vez y seguir
    // en verde.
    expect([...ROLES_DE_COLOR_REDISENO, ...ROLES_DE_SOMBRA_REDISENO]).toEqual(VEINTE_NOMBRES_DE_TOKEN_ESPERADOS)
    expect([...INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR]).toEqual(VEINTE_NOMBRES_DE_TOKEN_ESPERADOS)
  })

  it('@s1 el inventario tiene veinte entradas: dieciocho de color y dos de sombra', () => {
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR).toHaveLength(TOTAL_DE_TOKENS_DEL_SISTEMA)
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter((token) => token.startsWith('--color-'))).toHaveLength(
      TOTAL_DE_ROLES_DE_COLOR,
    )
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter((token) => token.startsWith('--sombra-'))).toHaveLength(
      TOTAL_DE_ROLES_DE_SOMBRA,
    )
  })

  it('@s1 las tres entradas nuevas respecto del sistema anterior son el acento y los dos roles de urgencia', () => {
    const nuevas = INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter(
      (token) => !DIECISIETE_NOMBRES_DEL_SISTEMA_ANTERIOR.includes(token),
    )

    expect(nuevas).toEqual(TRES_ROLES_NUEVOS_DEL_REDISENO)
    expect(nuevas).toHaveLength(TOTAL_DE_ROLES_NUEVOS)
  })

  it('@s1 los diecisiete nombres que ya existían siguen presentes, ninguno renombrado', () => {
    expect(DIECISIETE_NOMBRES_DEL_SISTEMA_ANTERIOR).toHaveLength(TOTAL_DE_TOKENS_DEL_SISTEMA_ANTERIOR)

    const heredadosQueSiguenPresentes = DIECISIETE_NOMBRES_DEL_SISTEMA_ANTERIOR.filter((token) =>
      INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.includes(token as (typeof INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR)[number]),
    )

    expect(heredadosQueSiguenPresentes).toEqual(DIECISIETE_NOMBRES_DEL_SISTEMA_ANTERIOR)
    expect(heredadosQueSiguenPresentes).toHaveLength(TOTAL_DE_TOKENS_DEL_SISTEMA_ANTERIOR)
  })

  it('@s10 fija clínica como variante predeterminada dentro del catálogo de cinco', () => {
    expect(VARIANTE_PREDETERMINADA).toBe('clinica')
    expect(VARIANTES_REDISENO).toEqual(['clinica', 'calida', 'tech', 'eco', 'marca'])
  })

  it('@s10 la puerta de declaración única aprueba cuando un solo fichero escribe el identificador como literal', () => {
    const informe = buscarDeclaracionesLiteralesDelIdentificador(
      [
        { ruta: 'catalogo.ts', texto: "export const VARIANTES = ['clinica', 'calida']" },
        { ruta: 'consumidor.ts', texto: 'export const POR_DEFECTO = VARIANTES[0]' },
        // Una ruta de imagen que CONTIENE la palabra no es una declaración del
        // identificador: el literal tiene que ser la cadena entera
        // (`src/components/Hero.tsx:48` es exactamente este caso).
        { ruta: 'imagen.ts', texto: "hrefDeDestino('/img/hero/clinica.webp')" },
      ],
      'clinica',
    )

    expect(informe.ficherosInspeccionados).toBe(TRES_FICHEROS_DE_EJEMPLO)
    expect(informe.ficherosQueDeclaran).toEqual(['catalogo.ts'])
    expect(informe.pasa).toBe(true)
  })

  it('@s10 la puerta de declaración única suspende y nombra a los ficheros cuando el identificador se repite', () => {
    const informe = buscarDeclaracionesLiteralesDelIdentificador(
      [
        { ruta: 'catalogo.ts', texto: "export const VARIANTES = ['clinica', 'calida']" },
        { ruta: 'copia.html', texto: 'var IDS = ["clinica", "calida"]' },
      ],
      'clinica',
    )

    expect(informe.ficherosQueDeclaran).toEqual(['catalogo.ts', 'copia.html'])
    expect(informe.pasa).toBe(false)
  })

  it('@s10 la puerta de declaración única falla cerrada con el corpus vacío o el identificador vacío', () => {
    const sinCorpus = buscarDeclaracionesLiteralesDelIdentificador([], 'clinica')
    expect(sinCorpus.pasa).toBe(false)
    expect(sinCorpus.ficherosInspeccionados).toBe(0)
    expect(sinCorpus.ficherosQueDeclaran).toEqual([])
    expect(sinCorpus.motivo).toMatch(/corpus/)

    const sinIdentificador = buscarDeclaracionesLiteralesDelIdentificador([{ ruta: 'a.ts', texto: "''" }], '')
    expect(sinIdentificador.pasa).toBe(false)
    expect(sinIdentificador.ficherosQueDeclaran).toEqual([])
    expect(sinIdentificador.motivo).toMatch(/identificador/)
  })
})
