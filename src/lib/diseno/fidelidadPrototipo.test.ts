import { describe, expect, it } from 'vitest'
import { mezclar } from './mezclaDeColor'
import { INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR, leerDeclaracionDeVariante } from './tokensColor'
import {
  canalAHexadecimal,
  componerTranslucidoSobreElFondo,
  type CorrespondenciaDeRol,
  DESVIACIONES_DECLARADAS,
  ejecutarPuertaDeFidelidadDelPrototipo,
  esColorTranslucido,
  extraerCuerpoDeBloque,
  extraerParejasTranslucidasDelPrototipo,
  extraerTemasDelPrototipo,
  MOTIVO_TRANSLUCIDO_NO_COMPONIBLE,
  normalizarValorCss,
  ROLES_DEL_SISTEMA_SIN_MODELO_EN_EL_PROTOTIPO,
  TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA,
} from './fidelidadPrototipo'

/**
 * TEXTO REAL del prototipo versionado, leído con `?raw` (regla dura del
 * repositorio: en Vitest los CSS Modules están desactivados, así que una
 * aserción vale solo si sale del texto real del fichero).
 * `vite.config.ts:78` ancla `css.include` a la query `?raw`.
 */
const TEXTO_PROTOTIPO = Object.values(
  import.meta.glob('../../../docs/diseno-claude-design/Veterinaria La Sierra.dc.html', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>,
)[0] as string

/** TEXTO REAL del fichero de tokens del sistema, leído también con `?raw`. */
const TEXTO_TOKENS = Object.values(
  import.meta.glob('../../styles/_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >,
)[0] as string

/** Los cuatro temas del prototipo, en el orden en que los declara (`VLS:18,26,34,42`). */
const TEMAS_ESCRITOS_A_MANO = ['clinica', 'calida', 'tech', 'eco']

/** 4 temas del prototipo x 18 roles por tema: el número de parejas que la puerta debe recorrer. */
const PAREJAS_ESPERADAS = 72

/** `--border` translúcido en los cuatro temas: las cuatro parejas que se DERIVAN por composición (@s3). */
const DERIVACIONES_ESPERADAS = 4

/**
 * Literal escrito A MANO con los dos roles del sistema que el prototipo NO
 * modela: `--color-borde-control` (@s8, «el prototipo no modela este rol») y
 * `--color-foco` (@s9, «el prototipo no declara ninguna regla de foco»).
 */
const ROLES_SIN_MODELO_ESCRITOS_A_MANO = ['--color-borde-control', '--color-foco']

/**
 * Literal escrito A MANO con las TRES desviaciones declaradas: las únicas
 * parejas en las que el sistema NO reproduce el valor del prototipo. Medidas
 * leyendo los dos ficheros; ver el porqué de cada una en `fidelidadPrototipo.ts`.
 */
const DESVIACIONES_ESCRITAS_A_MANO = [
  {
    variante: 'calida',
    rolDelPrototipo: '--muted',
    valorDelPrototipo: '#8A6C45',
    valorDelSistema: '#84663E',
    escenario: '@s6',
  },
  {
    variante: 'tech',
    rolDelPrototipo: '--accent-soft',
    valorDelPrototipo: 'rgba(6,182,212,.14)',
    valorDelSistema: '#12394A',
    escenario: '@s7',
  },
  {
    variante: 'tech',
    rolDelPrototipo: '--urg-soft',
    valorDelPrototipo: 'rgba(248,113,113,.16)',
    valorDelSistema: '#542A37',
    escenario: '@s7',
  },
]

/**
 * Literal escrito A MANO con las seis parejas que el prototipo declara con
 * ALFA. `--border` en los cuatro temas (decisión de rol, no de variante) más
 * los dos translúcidos que solo `tech` usa.
 */
const TOKEN_DEL_SISTEMA_POR_ROL_DEL_PROTOTIPO = new Map(
  TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA.map((fila) => [fila.prototipo, fila.sistema]),
)

const PAREJAS_TRANSLUCIDAS_ESCRITAS_A_MANO = [
  { variante: 'clinica', rolDelPrototipo: '--border' },
  { variante: 'calida', rolDelPrototipo: '--border' },
  { variante: 'tech', rolDelPrototipo: '--border' },
  { variante: 'tech', rolDelPrototipo: '--accent-soft' },
  { variante: 'tech', rolDelPrototipo: '--urg-soft' },
  { variante: 'eco', rolDelPrototipo: '--border' },
]

/**
 * Literal escrito A MANO con las CUATRO derivaciones del borde (ENMIENDA 1 de
 * @s3, `progress/rediseno/enmiendas_contrato.md:57-62`). Cada fila trae, por
 * separado, los tres ingredientes de la MISMA regla de composición y el
 * resultado que debe declarar el sistema:
 *
 *   `--color-borde` = mezclar(`--bg` del tema, color del `rgba()`, alfa del `rgba()`)
 *
 * Ninguno de estos hexadecimales se copia de la implementación: el `rgba()` y
 * el fondo se confrontan contra el TEXTO REAL del prototipo (`VLS:19-20`,
 * `:27-28`, `:35-36`, `:43-44`) y el compuesto se recalcula con `mezclar()`
 * (`src/lib/diseno/mezclaDeColor.ts`), la misma función que @s5 usa para el
 * rojo de urgencia suave.
 */
const DERIVACIONES_DEL_BORDE_ESCRITAS_A_MANO = [
  {
    variante: 'clinica',
    fondoDelPrototipo: '#F8FAFC',
    rgbaDelPrototipo: 'rgba(15,32,60,.13)',
    colorDelRgba: '#0F203C',
    alfaDelRgba: 0.13,
    compuesto: '#DADEE3',
  },
  {
    variante: 'calida',
    fondoDelPrototipo: '#FFFBF2',
    rgbaDelPrototipo: 'rgba(120,53,15,.16)',
    colorDelRgba: '#78350F',
    alfaDelRgba: 0.16,
    compuesto: '#E9DBCE',
  },
  {
    variante: 'tech',
    fondoDelPrototipo: '#0F172A',
    rgbaDelPrototipo: 'rgba(148,197,255,.18)',
    colorDelRgba: '#94C5FF',
    alfaDelRgba: 0.18,
    compuesto: '#273650',
  },
  {
    variante: 'eco',
    fondoDelPrototipo: '#FFFFFF',
    rgbaDelPrototipo: 'rgba(4,120,87,.16)',
    colorDelRgba: '#047857',
    alfaDelRgba: 0.16,
    compuesto: '#D7E9E4',
  },
]

/** El hexadecimal sin derivación trazable que la variante base declaró hasta la ENMIENDA 1. */
const BORDE_SIN_DERIVACION_ANTERIOR_A_LA_ENMIENDA = '#D8E0EA'

/** Las tres tintas arbitrarias que la puerta tiene que rechazar: las dos de @s3 y la de la enmienda. */
const TINTAS_CUALESQUIERA_ESPERADAS = 3

/**
 * Literal escrito A MANO con la tabla de correspondencia prototipo -> sistema
 * (patrón `doble-de-test-anclado-al-literal`): NO se obtiene de la propia
 * tabla que se está comprobando. Derivado de la lectura real de los cuatro
 * bloques de `docs/diseno-claude-design/Veterinaria La Sierra.dc.html:18-49`
 * y contrastado con `src/styles/_tokens.scss`; coincide con la tabla 1.1 de
 * `progress/rediseno/matriz_delta.md:106-125`.
 */
const CORRESPONDENCIA_ESCRITA_A_MANO = [
  { prototipo: '--bg', sistema: '--color-fondo' },
  { prototipo: '--bg-2', sistema: '--color-fondo-alterno' },
  { prototipo: '--card', sistema: '--color-superficie' },
  { prototipo: '--surface', sistema: '--color-superficie-elevada' },
  { prototipo: '--border', sistema: '--color-borde' },
  { prototipo: '--ink', sistema: '--color-tinta' },
  { prototipo: '--text', sistema: '--color-texto' },
  { prototipo: '--muted', sistema: '--color-texto-suave' },
  { prototipo: '--primary', sistema: '--color-primario' },
  { prototipo: '--primary-strong', sistema: '--color-primario-fuerte' },
  { prototipo: '--on-primary', sistema: '--color-sobre-primario' },
  { prototipo: '--accent', sistema: '--color-acento' },
  { prototipo: '--accent-ink', sistema: '--color-acento-tinta' },
  { prototipo: '--accent-soft', sistema: '--color-acento-suave' },
  { prototipo: '--urg', sistema: '--color-urgencia' },
  { prototipo: '--urg-soft', sistema: '--color-urgencia-suave' },
  { prototipo: '--shadow', sistema: '--sombra-elevada' },
  { prototipo: '--shadow-sm', sistema: '--sombra-reposo' },
]

describe('fidelidad del sistema de color respecto del prototipo', () => {
  it('@s3 declara la tabla de correspondencia entre los roles del prototipo y los del sistema', () => {
    expect(TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA).toEqual(CORRESPONDENCIA_ESCRITA_A_MANO)
  })

  it('@s3 la tabla cubre exactamente los roles que los cuatro temas del prototipo declaran de verdad', () => {
    const temas = extraerTemasDelPrototipo(TEXTO_PROTOTIPO)
    expect([...temas.keys()]).toEqual(TEMAS_ESCRITOS_A_MANO)

    const rolesDeLaTabla = TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA.map((fila) => fila.prototipo).toSorted()
    for (const tema of TEMAS_ESCRITOS_A_MANO) {
      const declarados = Object.keys(temas.get(tema) ?? {}).toSorted()
      expect(declarados).toEqual(rolesDeLaTabla)
    }
  })

  it('@s3 cada rol del prototipo tiene su equivalente declarado en el bloque propio de su variante', () => {
    const informe = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, TEXTO_TOKENS)
    expect(informe.rolesSinEquivalente).toEqual([])
    expect(informe.equivalenciasComprobadas).toBe(PAREJAS_ESPERADAS)
  })

  it('@s3 los dos únicos roles del sistema que el prototipo no modela son el borde de control y el foco', () => {
    expect(ROLES_DEL_SISTEMA_SIN_MODELO_EN_EL_PROTOTIPO).toEqual(ROLES_SIN_MODELO_ESCRITOS_A_MANO)

    const conContrapartida = new Set(TABLA_DE_CORRESPONDENCIA_PROTOTIPO_SISTEMA.map((fila) => fila.sistema))
    const derivadosDelInventario = INVENTARIO_DE_ROLES_DEL_SISTEMA_DE_COLOR.filter(
      (token) => !conContrapartida.has(token),
    )
    expect(derivadosDelInventario).toEqual(ROLES_DEL_SISTEMA_SIN_MODELO_EN_EL_PROTOTIPO)
  })

  it('@s3 la forma canónica solo borra formato: mayúsculas del hexadecimal, espacios y ceros de adorno', () => {
    // El prototipo y el sistema escriben el MISMO valor con distinto formato.
    // Pares reales medidos: `VLS:19,24` frente a `_tokens.scss:7,25,26`.
    expect(normalizarValorCss('#f8fafc')).toBe('#F8FAFC')
    expect(normalizarValorCss('0 6px 18px rgba(15,32,60,.07)')).toBe(
      normalizarValorCss('0 6px 18px rgba(15, 32, 60, 0.07)'),
    )
    expect(normalizarValorCss('0 18px 45px rgba(15,32,60,.10)')).toBe(
      normalizarValorCss('0 18px 45px rgba(15, 32, 60, 0.1)'),
    )
    // Y NO borra nada más: dos valores distintos siguen siendo distintos.
    expect(normalizarValorCss('#F8FAFC')).not.toBe(normalizarValorCss('#F8FAFD'))
    expect(normalizarValorCss('0 18px 45px rgba(15,32,60,.10)')).not.toBe(
      normalizarValorCss('0 18px 40px rgba(15,32,60,.10)'),
    )
    expect(normalizarValorCss('rgba(6,182,212,.14)')).not.toBe(normalizarValorCss('rgba(6,182,212,.41)'))
  })

  it('@s3 las desviaciones que quedan se declaran por LISTA, con su nombre y su motivo, sin recuento que las reconcilie', () => {
    // Identidad de la lista entera contra un literal escrito A MANO. No hay
    // ninguna aserción que las CUENTE (@s3, ENMIENDA 1): añadir o quitar una
    // obliga a tocar este literal, y por tanto a enmendar el contrato.
    expect(DESVIACIONES_DECLARADAS).toEqual(DESVIACIONES_ESCRITAS_A_MANO)

    // Cada una trae su motivo trazado al escenario que la autoriza.
    for (const desviacion of DESVIACIONES_DECLARADAS) {
      expect(['@s6', '@s7']).toContain(desviacion.escenario)
    }
  })

  it('@s3 cada desviación declarada es REAL: los dos valores son los que declaran los dos ficheros, y difieren', () => {
    const temas = extraerTemasDelPrototipo(TEXTO_PROTOTIPO)
    let desviacionesComprobadas = 0

    for (const desviacion of DESVIACIONES_DECLARADAS) {
      const token = TOKEN_DEL_SISTEMA_POR_ROL_DEL_PROTOTIPO.get(desviacion.rolDelPrototipo)
      expect(token).toBeDefined()

      const enElPrototipo = temas.get(desviacion.variante)?.[desviacion.rolDelPrototipo]
      const enElSistema = leerDeclaracionDeVariante(TEXTO_TOKENS, desviacion.variante, token!)

      expect(enElPrototipo).toBe(desviacion.valorDelPrototipo)
      expect(enElSistema).toBe(desviacion.valorDelSistema)
      // Una exclusión que no excluye nada sería una excusa capaz de tapar una
      // regresión: se exige que la pareja difiera de verdad.
      expect(normalizarValorCss(desviacion.valorDelPrototipo)).not.toBe(
        normalizarValorCss(desviacion.valorDelSistema),
      )
      desviacionesComprobadas += 1
    }

    // Contador de elementos efectivamente inspeccionados, derivado de la propia
    // lista: si la lista quedara vacía, este `toBeGreaterThan` fallaría cerrado.
    expect(desviacionesComprobadas).toBe(DESVIACIONES_DECLARADAS.length)
    expect(desviacionesComprobadas).toBeGreaterThan(0)
  })

  it('@s3 las seis parejas translúcidas son las que el prototipo declara con alfa, ni una más', () => {
    // Derivadas del TEXTO REAL y confrontadas con un literal escrito A MANO.
    const translucidasDelTextoReal = extraerParejasTranslucidasDelPrototipo(TEXTO_PROTOTIPO)
    expect(translucidasDelTextoReal).toEqual(PAREJAS_TRANSLUCIDAS_ESCRITAS_A_MANO)
    // `--border` es translúcido en los CUATRO temas: por eso es una regla de
    // rol, uniforme, y por eso se DERIVA con una sola fórmula.
    expect(translucidasDelTextoReal.filter((pareja) => pareja.rolDelPrototipo === '--border')).toHaveLength(
      TEMAS_ESCRITOS_A_MANO.length,
    )
    // Las sombras llevan `rgba()` dentro y NO son colores translúcidos.
    expect(translucidasDelTextoReal.filter((pareja) => pareja.rolDelPrototipo.startsWith('--shadow'))).toEqual([])
  })

  it('@s3 el valor coincide carácter a carácter, salvo en las tres desviaciones declaradas', () => {
    const informe = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, TEXTO_TOKENS)

    expect(informe.discrepancias).toEqual([])
    expect(informe.derivacionesVerificadas).toBe(DERIVACIONES_ESPERADAS)
    // El recuento de desviaciones no se escribe a mano: se consume de la LISTA
    // declarada, para que ninguna aserción reconcilie un número (@s3).
    expect(informe.desviacionesVerificadas).toBe(DESVIACIONES_DECLARADAS.length)
    expect(informe.valoresComparados).toBeGreaterThan(0)
    // Ninguna pareja se queda sin mirar: las tres cuentas suman el total.
    expect(informe.valoresComparados + informe.desviacionesVerificadas + informe.derivacionesVerificadas).toBe(
      PAREJAS_ESPERADAS,
    )
    expect(informe.pasa).toBe(true)
  })

  it('@s3 el recuento de roles comparados es mayor que 0, y con un prototipo ilegible la puerta falla cerrada', () => {
    expect(ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, TEXTO_TOKENS).valoresComparados).toBeGreaterThan(0)

    for (const textoIlegible of ['', '<html></html>', ":root{--bg:#F8FAFC;}"]) {
      const informe = ejecutarPuertaDeFidelidadDelPrototipo(textoIlegible, TEXTO_TOKENS)
      expect(informe.pasa).toBe(false)
      expect(informe.valoresComparados).toBe(0)
      expect(informe.equivalenciasComprobadas).toBe(0)
      // Mensaje escrito A MANO: si sale de la propia constante, mutarla no rompería nada.
      expect(informe.motivo).toBe(
        'el texto del prototipo no declara los temas del catálogo de variantes: la puerta falla cerrada en vez de dar cero comparaciones por buenas',
      )
    }
  })

  it('@s3 con la tabla de correspondencia vacía la puerta falla cerrada, no aprueba por vacuidad', () => {
    const informe = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, TEXTO_TOKENS, [])

    expect(informe.pasa).toBe(false)
    expect(informe.equivalenciasComprobadas).toBe(0)
    expect(informe.valoresComparados).toBe(0)
    expect(informe.motivo).toBe(
      'la tabla de correspondencia está vacía: la puerta falla cerrada en vez de dar cero comparaciones por buenas',
    )
  })

  it('@s3 si el prototipo cambiara un solo hexadecimal, la comprobación fallaría', () => {
    // Sabotaje sobre una COPIA EN MEMORIA: el fichero versionado no se toca.
    const prototipoSaboteado = TEXTO_PROTOTIPO.replace('--primary:#1E40AF', '--primary:#1E40AE')
    expect(prototipoSaboteado).not.toBe(TEXTO_PROTOTIPO)

    const informe = ejecutarPuertaDeFidelidadDelPrototipo(prototipoSaboteado, TEXTO_TOKENS)

    expect(informe.pasa).toBe(false)
    expect(informe.discrepancias).toEqual([
      { variante: 'clinica', rolDelPrototipo: '--primary', esperado: '#1E40AE', encontrado: '#1E40AF' },
    ])
    // El original sigue intacto y sigue aprobando.
    expect(TEXTO_PROTOTIPO).toContain('--primary:#1E40AF')
    expect(ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, TEXTO_TOKENS).pasa).toBe(true)
  })

  it('@s3 las exclusiones no son agujeros: tocar una desviación o un translúcido también pone la puerta roja', () => {
    // (a) El sistema "vuelve" al valor del prototipo en la desviación de @s6.
    // Sería una regresión de accesibilidad (4.37 sobre `--color-fondo-alterno`)
    // y la puerta la ve, aunque la pareja esté excluida de la comparación.
    const sinLaCorreccionDeContraste = TEXTO_TOKENS.replaceAll(
      '--color-texto-suave: #84663E',
      '--color-texto-suave: #8A6C45',
    )
    expect(sinLaCorreccionDeContraste).not.toBe(TEXTO_TOKENS)
    const informeA = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, sinLaCorreccionDeContraste)
    expect(informeA.pasa).toBe(false)
    expect(informeA.discrepancias).toEqual([
      { variante: 'calida', rolDelPrototipo: '--muted', esperado: '#84663E', encontrado: '#8A6C45' },
    ])

    // (b) El sistema copia el translúcido del prototipo en vez de componerlo.
    const conElBordeTranslucido = TEXTO_TOKENS.replaceAll(
      '--color-borde: #DADEE3',
      '--color-borde: rgba(15,32,60,.13)',
    )
    expect(conElBordeTranslucido).not.toBe(TEXTO_TOKENS)
    const informeB = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, conElBordeTranslucido)
    expect(informeB.pasa).toBe(false)
    expect(informeB.discrepancias).toEqual([
      {
        variante: 'clinica',
        rolDelPrototipo: '--border',
        esperado: '#DADEE3',
        encontrado: 'rgba(15,32,60,.13)',
      },
    ])
  })

  it('@s3 un rol translúcido NUNCA se da por bueno con un hexadecimal cualquiera: exige el valor COMPUESTO', () => {
    // El agujero medido por el juez el 26/08/2026: la puerta solo comprobaba
    // que el valor del sistema fuese un hexadecimal, así que `#FF0000` y
    // `#000000` pasaban en verde. Sabotaje sobre una COPIA EN MEMORIA; el
    // fichero versionado no se toca.
    let tintasComprobadas = 0

    for (const tinta of ['#FF0000', '#000000', BORDE_SIN_DERIVACION_ANTERIOR_A_LA_ENMIENDA]) {
      const conUnaTintaCualquiera = TEXTO_TOKENS.replaceAll('--color-borde: #DADEE3', `--color-borde: ${tinta}`)
      expect(conUnaTintaCualquiera).not.toBe(TEXTO_TOKENS)

      const informe = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, conUnaTintaCualquiera)

      expect(informe.pasa).toBe(false)
      expect(informe.discrepancias).toEqual([
        { variante: 'clinica', rolDelPrototipo: '--border', esperado: '#DADEE3', encontrado: tinta },
      ])
      tintasComprobadas += 1
    }

    expect(tintasComprobadas).toBe(TINTAS_CUALESQUIERA_ESPERADAS)
    // Y el fichero real sigue intacto y sigue aprobando.
    expect(ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, TEXTO_TOKENS).pasa).toBe(true)
  })

  it('@s3 la derivación se recalcula por variante: la tinta de una NO vale en otra', () => {
    // La regla es una sola, pero el resultado depende del fondo de CADA
    // variante: cruzar dos compuestos legítimos tiene que salir en rojo.
    const conElBordeDeOtraVariante = TEXTO_TOKENS.replaceAll('--color-borde: #273650', '--color-borde: #D7E9E4')
    expect(conElBordeDeOtraVariante).not.toBe(TEXTO_TOKENS)

    const informe = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, conElBordeDeOtraVariante)

    expect(informe.pasa).toBe(false)
    expect(informe.discrepancias).toEqual([
      { variante: 'tech', rolDelPrototipo: '--border', esperado: '#273650', encontrado: '#D7E9E4' },
    ])
  })

  it('@s3 los cuatro "--color-borde" se DERIVAN con UNA sola regla: el rgba del prototipo compuesto sobre el fondo de su variante', () => {
    const temas = extraerTemasDelPrototipo(TEXTO_PROTOTIPO)
    let derivacionesComprobadas = 0

    for (const derivacion of DERIVACIONES_DEL_BORDE_ESCRITAS_A_MANO) {
      const declaracionesDelTema = temas.get(derivacion.variante)
      expect(declaracionesDelTema).toBeDefined()

      // Los dos ingredientes salen del TEXTO REAL del prototipo, no del literal.
      expect(declaracionesDelTema?.['--border']).toBe(derivacion.rgbaDelPrototipo)
      expect(declaracionesDelTema?.['--bg']).toBe(derivacion.fondoDelPrototipo)

      // La MISMA regla para las cuatro, con la función de mezcla del repositorio.
      const compuesto = mezclar(derivacion.fondoDelPrototipo, derivacion.colorDelRgba, derivacion.alfaDelRgba)
      expect(compuesto).toBe(derivacion.compuesto)

      // Y es exactamente lo que el sistema declara.
      expect(leerDeclaracionDeVariante(TEXTO_TOKENS, derivacion.variante, '--color-borde')).toBe(compuesto)
      derivacionesComprobadas += 1
    }

    expect(derivacionesComprobadas).toBe(DERIVACIONES_DEL_BORDE_ESCRITAS_A_MANO.length)
    expect(derivacionesComprobadas).toBe(DERIVACIONES_ESPERADAS)
  })

  it('@s3 el "#D8E0EA" anterior a la enmienda no es la composición, ni sobre el fondo ni sobre la superficie', () => {
    const compuestoSobreElFondo = mezclar('#F8FAFC', '#0F203C', 0.13)
    const compuestoSobreLaSuperficie = mezclar('#FFFFFF', '#0F203C', 0.13)

    expect(compuestoSobreElFondo).toBe('#DADEE3')
    expect(compuestoSobreLaSuperficie).toBe('#E0E2E6')
    expect(BORDE_SIN_DERIVACION_ANTERIOR_A_LA_ENMIENDA).not.toBe(compuestoSobreElFondo)
    expect(BORDE_SIN_DERIVACION_ANTERIOR_A_LA_ENMIENDA).not.toBe(compuestoSobreLaSuperficie)
  })

  it('@s3 la regla de composición del borde queda escrita por extenso en "src/styles/_tokens.scss"', () => {
    expect(TEXTO_TOKENS).toContain('EL BORDE DE LAS CUATRO VARIANTES IMPORTADAS SE DERIVA, NO SE ELIGE')
    expect(TEXTO_TOKENS).toContain(
      'mezclar(fondo de la variante, color del rgba, alfa del rgba)',
    )
  })

  it('@s3 la puerta mira los dos lados: si el sistema se desviara en un rol comparado, también fallaría', () => {
    // La cabecera del contrato (`rediseno_visual.feature:74-75`) pide las dos
    // direcciones: «Si el diseño cambia, el test lo dice. Si el sitio se
    // desvía, el test lo dice».
    const sistemaSaboteado = TEXTO_TOKENS.replaceAll('--color-primario: #1E40AF', '--color-primario: #1E40AE')
    expect(sistemaSaboteado).not.toBe(TEXTO_TOKENS)

    const informe = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, sistemaSaboteado)

    expect(informe.pasa).toBe(false)
    expect(informe.discrepancias).toEqual([
      { variante: 'clinica', rolDelPrototipo: '--primary', esperado: '#1E40AF', encontrado: '#1E40AE' },
    ])
  })

  it('@s3 con la tabla vacía o el prototipo ilegible, ningún rol se cuenta como sin equivalente ni como discrepancia', () => {
    // Refuerzo de mutación: las dos ramas de "falla cerrada" devuelven arrays
    // vacíos, pero hasta ahora ningún test comprobaba su CONTENIDO exacto —
    // solo `pasa` y `motivo`. Un array `["Stryker was here"]` habría pasado
    // en verde igual que `[]`.
    const informeTablaVacia = ejecutarPuertaDeFidelidadDelPrototipo(TEXTO_PROTOTIPO, TEXTO_TOKENS, [])
    expect(informeTablaVacia.rolesSinEquivalente).toEqual([])
    expect(informeTablaVacia.discrepancias).toEqual([])

    const informeIlegible = ejecutarPuertaDeFidelidadDelPrototipo('<html></html>', TEXTO_TOKENS)
    expect(informeIlegible.rolesSinEquivalente).toEqual([])
    expect(informeIlegible.discrepancias).toEqual([])
  })
})

describe('extraerCuerpoDeBloque: el parser de profundidad de llaves, en aislamiento', () => {
  // Mismo mecanismo, exportado aquí, que `tokensColor.ts:extraerBloqueDeVariante`
  // (`progress/mutation_rediseno_visual.md` §9.1): sus tres ramas —selector
  // ausente, llave anidada de apertura, bloque sin cerrar— nunca se ejercitaban
  // porque el ÚNICO punto de llamada (`extraerTemasDelPrototipo`) filtra antes
  // los selectores que SÍ están presentes, así que la rama de "no encontrado"
  // era inalcanzable desde ahí. Se exporta para poder dirigir el parser sin ese
  // filtro previo.

  it('@s3 lanza si el selector no aparece en el texto', () => {
    expect(() => extraerCuerpoDeBloque('un texto cualquiera, sin selectores', '.no-existe')).toThrow(
      'el prototipo no declara ningún bloque ".no-existe"',
    )
  })

  it('@s3 una llave anidada dentro del bloque no corta la extracción antes de tiempo', () => {
    // Sin incrementar la profundidad al abrir la llave anidada, el bucle
    // pararía en el PRIMER "}" (el que cierra el "@media"), devolviendo un
    // cuerpo truncado que ni siquiera incluye la declaración real de después.
    const CUERPO_CON_LLAVE_ANIDADA = "--a:1;@media (min-width:600px){--b:2;}--c:3;"
    const texto = `:root{${CUERPO_CON_LLAVE_ANIDADA}}`

    expect(extraerCuerpoDeBloque(texto, ':root')).toBe(CUERPO_CON_LLAVE_ANIDADA)
  })

  it('@s3 lanza si el bloque no se cierra', () => {
    expect(() => extraerCuerpoDeBloque(":root{--a:1;", ':root')).toThrow(
      'el bloque ":root" del prototipo no se cierra',
    )
  })
})

describe('fidelidad del sistema de color: refuerzo de mutación de las ramas no ejercitadas (§9 del informe de mutación)', () => {
  it('@s3 el valor de una declaración se recorta al leerlo del bloque, no solo al normalizarlo después', () => {
    // `leerDeclaraciones` (interno) tiene su PROPIO `.trim()`, independiente
    // del de `normalizarValorCss`. Un valor con espacio antes del ";" prueba
    // que se recorta en el punto de lectura.
    const temas = extraerTemasDelPrototipo(":root{--bg:#fff ;}")
    expect(temas.get('clinica')?.['--bg']).toBe('#fff')
  })

  it('@s3 la declaración se reconoce aunque haya espacio alrededor de los dos puntos', () => {
    const temas = extraerTemasDelPrototipo(":root{ --bg : #fff ; }")
    expect(temas.get('clinica')?.['--bg']).toBe('#fff')
  })

  it('@s3 normalizarValorCss recorta espacios en los extremos antes de reconocer el hexadecimal', () => {
    expect(normalizarValorCss('  #f8fafc  ')).toBe('#F8FAFC')
  })

  it('@s3 normalizarValorCss tolera hexadecimales cortos y largos, dobles espacios y formatos decimales distintos', () => {
    // Los límites del cuantificador {3,8} de PATRON_HEXADECIMAL.
    expect(normalizarValorCss('#fff')).toBe('#FFF')
    expect(normalizarValorCss('#ffffffff')).toBe('#FFFFFFFF')
    // El mismo número con distinto formato decimal, y un entero con cero de relleno.
    expect(normalizarValorCss('rgba(6,182,212,.140)')).toBe(normalizarValorCss('rgba(6, 182, 212, 0.14)'))
    expect(normalizarValorCss('rgba(007,32,60,.07)')).toBe('rgba(7,32,60,0.07)')
  })

  it('@s3 normalizarValorCss produce la forma canónica EXACTA: un solo espacio entre tokens, comas y paréntesis sin espacio', () => {
    // Aserción de literal exacto, no comparación relativa entre dos llamadas:
    // una comparación relativa no distingue una función que borrase TODOS los
    // espacios (en vez de solo colapsar los repetidos) de la correcta, porque
    // ambos lados de la comparación se verían igual de "vacíos".
    expect(normalizarValorCss('0 6px 18px rgba(15, 32, 60, 0.07)')).toBe('0 6px 18px rgba(15,32,60,0.07)')
    expect(normalizarValorCss('0   6px   18px   rgba( 15 , 32 , 60 , .07 )')).toBe('0 6px 18px rgba(15,32,60,0.07)')
  })

  it('@s3 normalizarValorCss no reconoce como hexadecimal un valor con texto antes o después del "#..."', () => {
    // Ancla el "^" y el "$" del patrón: sin ellos, un "#fff" en medio de
    // cualquier cadena se colaría como si toda la cadena fuese un hexadecimal.
    expect(normalizarValorCss('junk#fff')).toBe('junk#fff')
    expect(normalizarValorCss('#fffjunk')).toBe('#fffjunk')
  })

  it('@s3 esColorTranslucido recorta espacios en los extremos antes de reconocer "rgba("', () => {
    expect(esColorTranslucido('  rgba(15,32,60,.13)  ')).toBe(true)
    expect(esColorTranslucido('  no es translúcido')).toBe(false)
  })

  it('@s3 un tema que no declara un rol de la tabla no lo cuenta como translúcido', () => {
    // Alcanza la rama `declaraciones[fila.prototipo] ?? ''` de
    // `extraerParejasTranslucidasDelPrototipo` con el valor realmente ausente.
    const texto = ":root{--bg:#fff;}:root[data-tema='calida']{--bg:#eee;--border:rgba(1,2,3,.5);}"

    expect(extraerParejasTranslucidasDelPrototipo(texto)).toEqual([
      { variante: 'calida', rolDelPrototipo: '--border' },
    ])
  })

  it('@s3 canalAHexadecimal siempre da los dígitos en mayúsculas', () => {
    expect(canalAHexadecimal('15')).toBe('0F')
    expect(canalAHexadecimal('255')).toBe('FF')
  })

  it('@s3 componerTranslucidoSobreElFondo recorta espacios en el rgba y en el fondo', () => {
    const compuestoConEspacios = componerTranslucidoSobreElFondo('  #F8FAFC  ', '  rgba(15,32,60,.13)  ')
    expect(compuestoConEspacios).toBe(componerTranslucidoSobreElFondo('#F8FAFC', 'rgba(15,32,60,.13)'))
    expect(compuestoConEspacios).toBe('#DADEE3')
  })

  it('@s3 componerTranslucidoSobreElFondo tolera espaciado alterno dentro del rgba', () => {
    expect(componerTranslucidoSobreElFondo('#F8FAFC', 'rgba( 15 , 32 , 60 , .13 )')).toBe('#DADEE3')
  })

  it('@s3 componerTranslucidoSobreElFondo falla si el rgba es inválido, aunque el fondo sea un hexadecimal válido', () => {
    // Mitad izquierda del OR: `partes === null` con un fondo que SÍ pasa.
    expect(componerTranslucidoSobreElFondo('#F8FAFC', 'rgba(999,999,999)')).toBeNull()
  })

  it('@s3 componerTranslucidoSobreElFondo falla si el fondo no es un hexadecimal de seis dígitos, aunque el rgba sea válido', () => {
    // Mitad derecha del OR: el rgba SÍ pasa, pero el fondo no.
    expect(componerTranslucidoSobreElFondo('no-es-hex', 'rgba(15,32,60,.13)')).toBeNull()
    expect(componerTranslucidoSobreElFondo('#FFF', 'rgba(15,32,60,.13)')).toBeNull()
  })

  it('@s3 componerTranslucidoSobreElFondo no reconoce un rgba con texto antes o después como válido', () => {
    // Ancla el "^" y el "$" de PATRON_COLOR_CON_ALFA: sin ellos, un
    // "rgba(...)" válido en medio de una cadena más larga se colaría.
    expect(componerTranslucidoSobreElFondo('#F8FAFC', 'junk rgba(15,32,60,.13)')).toBeNull()
    expect(componerTranslucidoSobreElFondo('#F8FAFC', 'rgba(15,32,60,.13) junk')).toBeNull()
  })

  it('@s3 componerTranslucidoSobreElFondo no reconoce un fondo con texto antes o después como hexadecimal válido', () => {
    // Ancla el "^" y el "$" de PATRON_HEXADECIMAL_DE_SEIS.
    expect(componerTranslucidoSobreElFondo('junk#F8FAFC', 'rgba(15,32,60,.13)')).toBeNull()
    expect(componerTranslucidoSobreElFondo('#F8FAFCjunk', 'rgba(15,32,60,.13)')).toBeNull()
  })

  it('@s3 el canal alfa del rgba exige dígitos, no cualquier carácter, y admite un entero sin punto decimal', () => {
    // El grupo del alfa es `(\d*\.?\d+)`: el "\d*" inicial no admite letras,
    // y el "\.?" es opcional, así que un alfa entero ("1", sin punto) es
    // tan válido como uno decimal.
    expect(componerTranslucidoSobreElFondo('#F8FAFC', 'rgba(15,32,60,X13)')).toBeNull()
    expect(componerTranslucidoSobreElFondo('#F8FAFC', 'rgba(15,32,60,1)')).not.toBeNull()
  })

  it('@s3 el selector del tema base es literalmente ":root", no cualquier texto que contenga una llave', () => {
    // Si SELECTOR_DEL_TEMA_BASE fuera "" en vez de ":root", el `indexOf`
    // encontraría la PRIMERA llave del texto entero, no la del bloque real.
    const textoConLlaveAntesDelRoot = ".otro-selector-cualquiera{color:red;}:root{--bg:#fff;}"

    const temas = extraerTemasDelPrototipo(textoConLlaveAntesDelRoot)

    expect(temas.get('clinica')?.['--bg']).toBe('#fff')
  })

  it('@s3 cuando el compuesto no se puede calcular, el motivo exacto es MOTIVO_TRANSLUCIDO_NO_COMPONIBLE', () => {
    // Dos temas sintéticos que declaran un `--border` translúcido pero SIN
    // `--bg`: `componerTranslucidoSobreElFondo` no puede calcular nada y la
    // puerta tiene que dar el motivo exacto, no una discrepancia cualquiera.
    const textoPrototipo =
      ":root{--border:rgba(15,32,60,.13);}:root[data-tema='calida']{--border:rgba(120,53,15,.16);}"
    const tabla: readonly CorrespondenciaDeRol[] = [{ prototipo: '--border', sistema: '--color-borde' }]

    const informe = ejecutarPuertaDeFidelidadDelPrototipo(textoPrototipo, TEXTO_TOKENS, tabla)

    // Mensaje escrito A MANO, igual que el resto del fichero: si saliera de
    // la propia constante importada, mutar la constante no rompería nada.
    const MOTIVO_ESCRITO_A_MANO = 'el valor compuesto sobre el fondo de su variante'
    expect(MOTIVO_TRANSLUCIDO_NO_COMPONIBLE).toBe(MOTIVO_ESCRITO_A_MANO)

    expect(informe.discrepancias).toEqual([
      {
        variante: 'clinica',
        rolDelPrototipo: '--border',
        esperado: MOTIVO_ESCRITO_A_MANO,
        encontrado: leerDeclaracionDeVariante(TEXTO_TOKENS, 'clinica', '--color-borde'),
      },
      {
        variante: 'calida',
        rolDelPrototipo: '--border',
        esperado: MOTIVO_ESCRITO_A_MANO,
        encontrado: leerDeclaracionDeVariante(TEXTO_TOKENS, 'calida', '--color-borde'),
      },
    ])
    expect(informe.derivacionesVerificadas).toBe(2)
    expect(informe.pasa).toBe(false)
  })

  it('@s3 un rol sin equivalente en el sistema se registra con su contenido exacto, y por sí solo basta para que la puerta no apruebe', () => {
    // Distingue la mitad "rolesSinEquivalente" de la condición compuesta de
    // `pasa` (línea ~552): parejas > 0, discrepancias === 0, pero
    // rolesSinEquivalente !== 0.
    const textoPrototipo = ":root{--bg:#fff;}:root[data-tema='calida']{--bg:#eee;}"
    const textoTokensSinBorde =
      ":root[data-variante='clinica']{--color-fondo:#fff;}:root[data-variante='calida']{--color-fondo:#eee;}"
    const tabla: readonly CorrespondenciaDeRol[] = [{ prototipo: '--bg', sistema: '--color-borde' }]

    const informe = ejecutarPuertaDeFidelidadDelPrototipo(textoPrototipo, textoTokensSinBorde, tabla)

    expect(informe.rolesSinEquivalente).toEqual([
      { variante: 'clinica', rolDelPrototipo: '--bg', rolDelSistema: '--color-borde' },
      { variante: 'calida', rolDelPrototipo: '--bg', rolDelSistema: '--color-borde' },
    ])
    expect(informe.discrepancias).toEqual([])
    expect(informe.pasa).toBe(false)
  })

  it('@s3 si el prototipo no declara un rol comparado, el valor esperado de la discrepancia es cadena vacía, no un texto cualquiera', () => {
    // Distingue el `?? ''` de la línea ~523 (`enElPrototipo`): un rol que el
    // sistema SÍ declara, pero que el tema del prototipo no trae.
    const textoPrototipo = ":root{--bg:#fff;}:root[data-tema='calida']{--bg:#eee;}"
    const tabla: readonly CorrespondenciaDeRol[] = [{ prototipo: '--text', sistema: '--color-texto' }]

    const informe = ejecutarPuertaDeFidelidadDelPrototipo(textoPrototipo, TEXTO_TOKENS, tabla)

    expect(informe.rolesSinEquivalente).toEqual([])
    expect(informe.discrepancias).toEqual([
      {
        variante: 'clinica',
        rolDelPrototipo: '--text',
        esperado: '',
        encontrado: leerDeclaracionDeVariante(TEXTO_TOKENS, 'clinica', '--color-texto'),
      },
      {
        variante: 'calida',
        rolDelPrototipo: '--text',
        esperado: '',
        encontrado: leerDeclaracionDeVariante(TEXTO_TOKENS, 'calida', '--color-texto'),
      },
    ])
  })
})
