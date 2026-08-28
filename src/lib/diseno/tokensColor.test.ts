import { describe, expect, it } from 'vitest'
import { calcularRatioContraste } from '../contraste'
import { coloresDeMarca } from '../tokens'
import { mezclar } from './mezclaDeColor'
import {
  comprobarInventarioDeTokens,
  extraerVariantesDeTokens,
  INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR,
  leerDeclaracionDeRaizSinAtributo,
  leerDeclaracionDeVariante,
  leerTokenDeRaizSinAtributo,
  leerTokenDeVariante,
  type RolDeColor,
} from './tokensColor'

const TEXTO_TOKENS = Object.values(
  import.meta.glob('../../styles/_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
)[0] as string

const VARIANTES = ['clinica', 'calida', 'tech', 'eco', 'marca']

function ratio(color: string, fondo: string): number {
  return calcularRatioContraste(color, fondo)
}

/** Blanco puro. No es un token: es el extremo de la escala con el que se mezcla (`mezclaDeColor.ts`). */
const BLANCO_PURO = '#FFFFFF'
/** Negro puro, el otro extremo de la escala de mezcla. */
const NEGRO_PURO = '#000000'

const TOTAL_DE_ROLES_APROBADOS_DE_MARCA = 15
const TOTAL_DE_ROLES_DERIVADOS_DE_MARCA = 8
const TOTAL_DE_ROLES_LITERALES_DE_MARCA = 7

/** Proporción con la que `--color-urgencia-suave` de `marca` tiñe el blanco (@s5). */
const DIEZ_POR_CIENTO = 0.1

const TOTAL_DE_TOKENS_DEL_SISTEMA = 20
const TOTAL_DE_VARIANTES = 5
/** Las 5 variantes más el bloque de emergencia sin atributo (@s12). */
const TOTAL_DE_BLOQUES_RAIZ = 6
const PATRON_CUALQUIER_BLOQUE_RAIZ = /:root/g

/**
 * Las variantes cuyo `--color-urgencia` @s5 exige que sea el MISMO rojo que
 * el de `marca`. `calida` y `tech` quedan fuera a propósito: traen su propio
 * rojo del prototipo (`_tokens.scss:70` y `:94`), anclado por @s3.
 */
const VARIANTES_QUE_COMPARTEN_EL_ROJO_DE_URGENCIA = ['clinica', 'eco'] as const
const TOTAL_DE_VARIANTES_QUE_COMPARTEN_EL_ROJO = 2

/**
 * Los QUINCE valores de la variante `marca` que `identidad_visual` dejó
 * aprobados, copiados uno a uno del bloque `:root[data-variante='marca']` tal
 * y como estaba ANTES de este rediseño (`git show
 * 93bdf72:src/styles/_tokens.scss`, líneas 59-79). Literal escrito a mano
 * (patrón `doble-de-test-anclado-al-literal`): NO se obtiene del fichero que
 * comprueba, para que @s4 —«cada uno vale exactamente lo que valía antes de
 * este rediseño»— tenga con qué comparar.
 */
const QUINCE_COLORES_APROBADOS_DE_MARCA: readonly (readonly [RolDeColor, string])[] = [
  ['fondo', '#FFFFFF'],
  ['fondo-alterno', '#F4EEF3'],
  ['superficie', '#FFFFFF'],
  ['superficie-elevada', '#FAF6F9'],
  ['borde', '#DDC9DA'],
  ['borde-control', '#A06997'],
  ['tinta', '#531C4B'],
  ['texto', '#77286B'],
  ['texto-suave', '#925389'],
  ['primario', '#77286B'],
  ['primario-fuerte', '#6B2460'],
  ['sobre-primario', '#FFFFFF'],
  ['acento-tinta', '#48704B'],
  ['acento-suave', '#F6F8E3'],
  ['foco', '#77286B'],
]

/**
 * De dónde sale cada uno de los OCHO roles DERIVADOS de `marca`: la mezcla en
 * sRGB exacta que los produjo, copiada de los comentarios del propio fichero
 * antes del rediseño (`93bdf72:src/styles/_tokens.scss:61-73`) y de la tabla
 * de `progress/plan_adaptacion_scss.md` §3.
 *
 * Aquí se muerde la segunda cláusula de @s4 —«ninguno se ha rederivado ni
 * redondeado»—: el valor del fichero se confronta contra el resultado de
 * ejecutar `mezclar()` DE VERDAD, no contra otro literal. Si alguien cambiara
 * el porcentaje, el color base o el redondeo, el hexadecimal ya no cuadraría.
 */
const OCHO_DERIVACIONES_DE_MARCA: readonly {
  readonly rol: RolDeColor
  readonly base: string
  readonly otro: string
  readonly porcentaje: number
}[] = [
  { rol: 'fondo-alterno', base: BLANCO_PURO, otro: coloresDeMarca.morado, porcentaje: 0.08 },
  { rol: 'superficie-elevada', base: BLANCO_PURO, otro: coloresDeMarca.morado, porcentaje: 0.04 },
  { rol: 'borde', base: BLANCO_PURO, otro: coloresDeMarca.morado, porcentaje: 0.25 },
  { rol: 'borde-control', base: BLANCO_PURO, otro: coloresDeMarca.morado, porcentaje: 0.7 },
  { rol: 'tinta', base: coloresDeMarca.morado, otro: NEGRO_PURO, porcentaje: 0.3 },
  { rol: 'texto-suave', base: coloresDeMarca.morado, otro: BLANCO_PURO, porcentaje: 0.2 },
  { rol: 'primario-fuerte', base: coloresDeMarca.morado, otro: NEGRO_PURO, porcentaje: 0.1 },
  { rol: 'acento-suave', base: BLANCO_PURO, otro: coloresDeMarca.lima, porcentaje: 0.12 },
]

/**
 * Los SIETE roles de `marca` que NO se derivan: valen blanco puro o uno de los
 * tres colores de marca de `src/lib/tokens.ts`, sin mezcla ninguna. Que sigan
 * siendo exactamente esos hexadecimales es la otra mitad de «ninguno se ha
 * rederivado ni redondeado» (@s4): si alguno hubiera pasado por una mezcla,
 * dejaría de coincidir con su fuente.
 */
const SIETE_ROLES_LITERALES_DE_MARCA: readonly (readonly [RolDeColor, string])[] = [
  ['fondo', BLANCO_PURO],
  ['superficie', BLANCO_PURO],
  ['sobre-primario', BLANCO_PURO],
  ['texto', coloresDeMarca.morado],
  ['primario', coloresDeMarca.morado],
  ['foco', coloresDeMarca.morado],
  ['acento-tinta', coloresDeMarca.verdeProfundo],
]

describe('tokens del rediseño', () => {
  it('@s1 inventaría exactamente dieciocho colores y dos sombras', () => {
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR).toHaveLength(20)
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter((token) => token.startsWith('--color-'))).toHaveLength(18)
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter((token) => token.startsWith('--sombra-'))).toHaveLength(2)
    expect(INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR).toEqual(
      expect.arrayContaining(['--color-acento', '--color-urgencia', '--color-urgencia-suave']),
    )
  })

  it('@s2 declara los veinte tokens dentro de cada una de las cinco variantes', () => {
    expect(extraerVariantesDeTokens(TEXTO_TOKENS)).toEqual(VARIANTES)
    const informe = comprobarInventarioDeTokens(TEXTO_TOKENS, VARIANTES, INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR)
    expect(informe.paresComprobados).toBe(100)
    expect(informe.faltantes).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('@s4 preserva los quince colores ya aprobados de marca', () => {
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'fondo')).toBe('#FFFFFF')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'texto')).toBe('#77286B')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'primario')).toBe('#77286B')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'acento-tinta')).toBe('#48704B')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'foco')).toBe('#77286B')
  })

  it('@s4 los QUINCE roles de color de marca valen exactamente lo que valían antes de este rediseño', () => {
    expect(QUINCE_COLORES_APROBADOS_DE_MARCA).toHaveLength(TOTAL_DE_ROLES_APROBADOS_DE_MARCA)

    let rolesComprobados = 0
    for (const [rol, hexadecimalAprobado] of QUINCE_COLORES_APROBADOS_DE_MARCA) {
      expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', rol)).toBe(hexadecimalAprobado)
      rolesComprobados += 1
    }

    // Contador explícito: con la tabla vacía el bucle no afirmaría nada y el
    // test pasaría por vacuidad (`verde-por-vacuidad-en-puerta-de-verificacion`).
    expect(rolesComprobados).toBe(TOTAL_DE_ROLES_APROBADOS_DE_MARCA)
  })

  it('@s4 ninguno de los quince se ha rederivado ni redondeado: los ocho derivados siguen dando la misma mezcla', () => {
    expect(OCHO_DERIVACIONES_DE_MARCA).toHaveLength(TOTAL_DE_ROLES_DERIVADOS_DE_MARCA)

    let derivacionesRecalculadas = 0
    for (const { rol, base, otro, porcentaje } of OCHO_DERIVACIONES_DE_MARCA) {
      expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', rol)).toBe(mezclar(base, otro, porcentaje))
      derivacionesRecalculadas += 1
    }

    expect(derivacionesRecalculadas).toBe(TOTAL_DE_ROLES_DERIVADOS_DE_MARCA)
  })

  it('@s4 los siete roles no derivados de marca siguen siendo blanco puro o un color de marca, sin mezcla', () => {
    expect(SIETE_ROLES_LITERALES_DE_MARCA).toHaveLength(TOTAL_DE_ROLES_LITERALES_DE_MARCA)

    let rolesLiteralesComprobados = 0
    for (const [rol, fuente] of SIETE_ROLES_LITERALES_DE_MARCA) {
      expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', rol)).toBe(fuente)
      rolesLiteralesComprobados += 1
    }

    expect(rolesLiteralesComprobados).toBe(TOTAL_DE_ROLES_LITERALES_DE_MARCA)
    // Ocho derivados + siete literales cubren los quince roles aprobados: no
    // queda ni uno sin aserción, que era justo el agujero de @s4.
    expect(TOTAL_DE_ROLES_DERIVADOS_DE_MARCA + TOTAL_DE_ROLES_LITERALES_DE_MARCA).toBe(
      TOTAL_DE_ROLES_APROBADOS_DE_MARCA,
    )
  })

  it('@s5 añade al tema de marca el acento y los colores semánticos de urgencia', () => {
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'acento')).toBe('#B4C718')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'urgencia')).toBe('#DC2626')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'urgencia-suave')).toBe('#FCE9E9')
  })

  it('@s5 el acento de marca es el MISMO hexadecimal del lima que declara "src/lib/tokens.ts"', () => {
    // No se comparan dos literales: uno se lee del texto real de la hoja y el
    // otro es la fuente única de los colores de marca (`src/lib/tokens.ts:10`).
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'acento')).toBe(coloresDeMarca.lima)
  })

  it('@s5 el rojo de urgencia de marca es el mismo que declaran las variantes "clinica" y "eco"', () => {
    const rojoDeMarca = leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'urgencia')

    let variantesConElMismoRojo = 0
    for (const variante of VARIANTES_QUE_COMPARTEN_EL_ROJO_DE_URGENCIA) {
      expect(leerTokenDeVariante(TEXTO_TOKENS, variante, 'urgencia')).toBe(rojoDeMarca)
      variantesConElMismoRojo += 1
    }

    expect(variantesConElMismoRojo).toBe(TOTAL_DE_VARIANTES_QUE_COMPARTEN_EL_ROJO)
  })

  it('@s5 el urgencia suave de marca es blanco mezclado con ESE rojo al diez por ciento, calculado con mezclar()', () => {
    const rojoDeUrgencia = leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'urgencia')

    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'urgencia-suave')).toBe(
      mezclar(BLANCO_PURO, rojoDeUrgencia, DIEZ_POR_CIENTO),
    )
  })

  it('@s5 el fichero declara por escrito que el rojo de urgencia es semántico y no un cuarto color de marca', () => {
    expect(TEXTO_TOKENS).toContain('color SEMÁNTICO de alerta')
    expect(TEXTO_TOKENS).toContain('no un cuarto color de marca')
  })

  it('@s7 mantiene contraste de texto sobre urgencia en los cinco temas', () => {
    for (const variante of VARIANTES) {
      const encima = leerTokenDeVariante(TEXTO_TOKENS, variante, 'sobre-primario')
      const urgencia = leerTokenDeVariante(TEXTO_TOKENS, variante, 'urgencia')
      expect(ratio(encima, urgencia)).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('@s12 deja clínica como red de seguridad sin JavaScript', () => {
    for (const rol of ['fondo', 'texto', 'foco'] as const) {
      expect(leerTokenDeRaizSinAtributo(TEXTO_TOKENS, rol)).toBe(leerTokenDeVariante(TEXTO_TOKENS, 'clinica', rol))
    }
  })

  it('@s12 el ":root" sin atributo declara los VEINTE tokens con los mismos valores que "clinica"', () => {
    let tokensComparados = 0
    for (const nombreDeToken of INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR) {
      // `leerDeclaracion*` y no `leerToken*`: dos de los veinte son sombras
      // (`0 6px 18px rgba(…)`), que no son un hexadecimal de seis dígitos.
      expect(leerDeclaracionDeRaizSinAtributo(TEXTO_TOKENS, nombreDeToken)).toBe(
        leerDeclaracionDeVariante(TEXTO_TOKENS, 'clinica', nombreDeToken),
      )
      tokensComparados += 1
    }

    expect(tokensComparados).toBe(TOTAL_DE_TOKENS_DEL_SISTEMA)
  })

  it('@s12 ese bloque de emergencia no cuenta como una sexta variante del inventario', () => {
    // El fichero tiene SEIS bloques ":root" (las 5 variantes más la red de
    // seguridad sin atributo) y aun así el inventario de variantes son 5: la
    // afirmación sería vacua si no se comprobara que el sexto bloque existe.
    expect(TEXTO_TOKENS.match(PATRON_CUALQUIER_BLOQUE_RAIZ) ?? []).toHaveLength(TOTAL_DE_BLOQUES_RAIZ)

    const variantes = extraerVariantesDeTokens(TEXTO_TOKENS)
    expect(variantes).toEqual(VARIANTES)
    expect(variantes).toHaveLength(TOTAL_DE_VARIANTES)
  })

  it('lee las sombras sin reinterpretar su valor CSS', () => {
    expect(leerDeclaracionDeVariante(TEXTO_TOKENS, 'tech', '--sombra-elevada')).toContain('rgba(0, 0, 0, 0.45)')
  })
})

/**
 * Los cuatro tests siguientes prueban el rastreo de PROFUNDIDAD de llaves del
 * parser interno (`extraerBloqueDeVariante`) con texto de tokens SINTÉTICO,
 * no el real de `_tokens.scss`: ninguna de las cinco variantes reales
 * contiene una llave anidada ni un bloque roto, así que sus propias ramas de
 * error y su propio propósito (sobrevivir a un `@media`/`&` anidado, según su
 * docstring) quedaban sin ejercitar con solo el texto real.
 */
describe('tokensColor.ts extrae el bloque de una variante siguiendo la profundidad de llaves', () => {
  it('lanza si el texto no declara ningún bloque para la variante pedida', () => {
    expect(() => leerTokenDeVariante('', 'fantasma', 'fondo')).toThrow(
      `no se encontró ningún bloque ":root[data-variante='fantasma']" en el texto de tokens`,
    )
  })

  it('lanza si el encabezado de la variante no va seguido de ninguna llave de apertura', () => {
    const textoSinLlave = `:root[data-variante='sinllave']`
    expect(() => leerTokenDeVariante(textoSinLlave, 'sinllave', 'fondo')).toThrow(
      `no se encontró ningún bloque ":root[data-variante='sinllave']" en el texto de tokens`,
    )
  })

  it('lanza si el bloque de la variante nunca cierra su llave de apertura', () => {
    const textoSinCierre = `:root[data-variante='abierto'] { --color-fondo: #123456;`
    expect(() => leerTokenDeVariante(textoSinCierre, 'abierto', 'fondo')).toThrow(
      `el bloque ":root[data-variante='abierto']" no se cierra: falta la llave de cierre`,
    )
  })

  it('cuenta la apertura Y el cierre de una llave anidada en vez de terminar el bloque en la primera "}"', () => {
    const bloqueConLlaveAnidada = `
:root[data-variante='sintetica'] {
  --color-fondo: #101010;
  @media (prefers-color-scheme: dark) {
    --color-fondo: #202020;
  }
  --color-texto: #303030;
}
`
    // El primer "--color-fondo" que aparece en el bloque es el del propio
    // selector, no el que redeclara la llave anidada de "@media".
    expect(leerTokenDeVariante(bloqueConLlaveAnidada, 'sintetica', 'fondo')).toBe('#101010')
    // Y "--color-texto", declarado DESPUÉS de la llave anidada, solo se
    // encuentra si el parser contó su apertura Y su cierre: con la antigua
    // "primera llave que aparece" el bloque se habría cortado en la "}" que
    // cierra "@media", antes de llegar aquí.
    expect(leerTokenDeVariante(bloqueConLlaveAnidada, 'sintetica', 'texto')).toBe('#303030')
  })

  it('deduplica variantes cuyo selector aparece más de una vez en el texto', () => {
    const textoConSelectorRepetido = `:root[data-variante='clinica'] {}\n:root[data-variante='clinica'] {}\n:root[data-variante='eco'] {}`
    expect(extraerVariantesDeTokens(textoConSelectorRepetido)).toEqual(['clinica', 'eco'])
  })

  it('el bloque devuelto no incluye la llave de cierre ni lo que venga justo después de ella', () => {
    // Si el bloque devuelto se colara UN carácter de más (la propia "}" de
    // cierre), y justo después de esa "}" hubiera un ";" suelto en el texto,
    // una declaración sin su punto y coma DENTRO del bloque parecería
    // completarse con ese ";" de fuera. Este texto sintético pone esa trampa
    // a propósito: "--sombra-reposo" no lleva ";" dentro del bloque, así que
    // solo debe encontrarse si el límite del bloque es exacto.
    const textoConPuntoYComaJustoTrasElCierre = `:root[data-variante='limite'] {\n  --sombra-reposo: 0 6px black\n};`
    expect(() => leerDeclaracionDeVariante(textoConPuntoYComaJustoTrasElCierre, 'limite', '--sombra-reposo')).toThrow(
      'no se encontró el token "--sombra-reposo" para la variante "limite"',
    )
  })
})

/**
 * Los cuatro lectores (`leerTokenDeVariante`/`leerTokenDeRaizSinAtributo` y
 * `leerDeclaracionDeVariante`/`leerDeclaracionDeRaizSinAtributo`) solo se
 * habían ejercitado con roles y tokens que SÍ existen: la rama de "no
 * encontrado" de cada uno, y el mensaje exacto que lanza, quedaba sin cubrir.
 */
describe('tokensColor.ts lanza el mensaje exacto cuando el rol o el token pedido no existe', () => {
  const BLOQUE_DE_VARIANTE_INCOMPLETO = `:root[data-variante='incompleta'] {\n  --color-fondo: #FFFFFF;\n}`
  const BLOQUE_RAIZ_SIN_ATRIBUTO_INCOMPLETO = `:root {\n  --color-fondo: #FFFFFF;\n}`

  it('leerTokenDeVariante lanza si el rol de color pedido no está en el bloque de la variante', () => {
    expect(() => leerTokenDeVariante(BLOQUE_DE_VARIANTE_INCOMPLETO, 'incompleta', 'tinta')).toThrow(
      'no se encontró el token "--color-tinta" para la variante "incompleta"',
    )
  })

  it('leerDeclaracionDeVariante lanza si el token pedido no está en el bloque de la variante', () => {
    expect(() => leerDeclaracionDeVariante(BLOQUE_DE_VARIANTE_INCOMPLETO, 'incompleta', '--sombra-reposo')).toThrow(
      'no se encontró el token "--sombra-reposo" para la variante "incompleta"',
    )
  })

  it('leerDeclaracionDeVariante recorta los espacios sobrantes alrededor del valor declarado', () => {
    const textoConEspacios = `:root[data-variante='conespacios'] {\n  --sombra-reposo:   0 6px 18px black  ;\n}`
    expect(leerDeclaracionDeVariante(textoConEspacios, 'conespacios', '--sombra-reposo')).toBe('0 6px 18px black')
  })

  it('lanza si el texto no declara ningún bloque ":root" sin atributo', () => {
    const textoSoloConVariantes = `:root[data-variante='clinica'] { --color-fondo: #FFFFFF; }`
    expect(() => leerTokenDeRaizSinAtributo(textoSoloConVariantes, 'fondo')).toThrow(
      'no se encontró ningún bloque ":root" sin atributo en el texto de tokens',
    )
  })

  it('reconoce el bloque ":root" sin atributo aunque no haya ESPACIO entre el selector y la llave', () => {
    // El patrón admite CERO o más espacios ("\\s*"), no exactamente uno: un
    // "_tokens.scss" real siempre trae el espacio, así que solo un texto
    // sintético sin él distingue el "*" de una exigencia de "un espacio o más".
    const textoSinEspacio = `:root{--color-fondo: #ABCDEF;}`
    expect(leerTokenDeRaizSinAtributo(textoSinEspacio, 'fondo')).toBe('#ABCDEF')
  })

  it('leerTokenDeRaizSinAtributo lanza si el rol de color pedido no está en el bloque sin atributo', () => {
    expect(() => leerTokenDeRaizSinAtributo(BLOQUE_RAIZ_SIN_ATRIBUTO_INCOMPLETO, 'tinta')).toThrow(
      'no se encontró el token "--color-tinta" en el ":root" sin atributo',
    )
  })

  it('leerDeclaracionDeRaizSinAtributo lanza si el token pedido no está en el bloque sin atributo', () => {
    expect(() => leerDeclaracionDeRaizSinAtributo(BLOQUE_RAIZ_SIN_ATRIBUTO_INCOMPLETO, '--sombra-reposo')).toThrow(
      'no se encontró el token "--sombra-reposo" en el ":root" sin atributo',
    )
  })
})

/**
 * `comprobarInventarioDeTokens` solo se había llamado una vez, con el
 * catálogo real completo (100 pares, todos presentes). Eso basta para probar
 * "aprobado", pero no distingue el "&&" de la guarda de un "||": con las dos
 * mitades de la condición en verdadero a la vez, ambos operadores dan el
 * mismo resultado. Falta un catálogo no vacío con AL MENOS un faltante, que
 * pone una mitad en verdadero y la otra en falso.
 */
describe('comprobarInventarioDeTokens distingue "aprobado" de "con faltantes" en un catálogo no vacío', () => {
  it('aprueba un catálogo no vacío cuando todos los pares (variante, token) están declarados', () => {
    const texto = `:root[data-variante='completa'] {\n  --color-fondo: #FFFFFF;\n  --color-tinta: #000000;\n}`
    const informe = comprobarInventarioDeTokens(texto, ['completa'], ['--color-fondo', '--color-tinta'])
    expect(informe.paresComprobados).toBe(2)
    expect(informe.faltantes).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('no aprueba un catálogo no vacío que tiene al menos un token faltante', () => {
    const texto = `:root[data-variante='parcial'] {\n  --color-fondo: #FFFFFF;\n}`
    const informe = comprobarInventarioDeTokens(texto, ['parcial'], ['--color-fondo', '--color-tinta'])
    expect(informe.paresComprobados).toBe(2)
    expect(informe.faltantes).toEqual([{ variante: 'parcial', token: '--color-tinta' }])
    expect(informe.pasa).toBe(false)
  })

  it('no aprueba un catálogo de variantes vacío, aunque "cero faltantes de cero pares" pareciera dar bueno', () => {
    // Con el catálogo de variantes vacío, "pares" también sale vacío y por
    // tanto "faltantes" también — un "0 de 0" que la guarda de vacuidad debe
    // rechazar explícitamente, no dejar pasar por verdad vacua.
    const informe = comprobarInventarioDeTokens(TEXTO_TOKENS, [], INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR)
    expect(informe.paresComprobados).toBe(0)
    expect(informe.faltantes).toEqual([])
    expect(informe.pasa).toBe(false)
  })
})
