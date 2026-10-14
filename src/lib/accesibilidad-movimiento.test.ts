import { describe, expect, it } from 'vitest'
import { calcularSolicitudDeDesplazamiento, prefiereMenosMovimiento } from '../components/Galeria-logica'
import { decidirComportamientoDesplazamiento } from './desplazamiento'
import {
  HOJAS_AUTORIZADAS_A_ANIMAR_LA_ENTRADA,
  ejecutarComprobacionDeVisibilidadSinAnimacion,
  inventariarBloquesQueAparecenAnimando,
  type BloqueQueApareceAnimando,
  type HojaDeEstilos,
} from './accesibilidad-movimiento'
import { ejecutarPuertaDeAnalisisAutomatico, type ResultadoDeAnalisisAutomatico } from './accesibilidad-analisis'

/**
 * @s19 (parcial) — «ningún desplazamiento solicitado por la página es
 * suavizado». La geometría/animación CSS en curso de @s19 se verifica con
 * NAVEGADOR REAL (Decisión 11, project-spec.md; documentado también en
 * `progress/tdd_accesibilidad.md`): esta única cláusula sí es lógica pura, y
 * ya vive — mordida al 100 % — en `Galeria-logica.ts`/`desplazamiento.ts`
 * (features `galeria`/`pagina_blog`/`pagina_campanas`, ya `done`). Aquí se
 * reutiliza, no se reimplementa.
 */
describe('@s19 (parcial, pura) con menos movimiento pedido ningún desplazamiento solicitado es suavizado', () => {
  it('calcularSolicitudDeDesplazamiento con prefiereMenos=true pide un desplazamiento no suave', () => {
    const solicitud = calcularSolicitudDeDesplazamiento(200, 'siguiente', true)

    expect(solicitud).not.toBeNull()
    expect(solicitud?.suave).toBe(false)
  })

  it('decidirComportamientoDesplazamiento con menos movimiento pedido devuelve "auto", nunca "smooth"', () => {
    const comportamiento = decidirComportamientoDesplazamiento(() => ({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      addListener: () => {},
      removeListener: () => {},
    }))

    expect(comportamiento).toBe('auto')
  })
})

/**
 * AVISO SOBRE LOS DOS PRIMEROS `it` (21/09/2026, feature 39, oleada 5). Se
 * alimentan de un literal SINTÉTICO escrito aquí mismo, y hasta hoy eran la
 * única puerta de @s20: por eso la cláusula de @s20 de `accesibilidad.feature`
 * «el inventario de bloques que se recorre se lee del sitio real, nunca de una
 * lista escrita en el propio test» los declaró insuficientes, y el `judge` los
 * marcó como cobertura que no muerde. Se CONSERVAN, pero degradados a lo que de
 * verdad son: tests unitarios de la aritmética del veredicto, que es lógica pura
 * bajo umbral de mutación del 100 %. La PUERTA de @s20 —la que recorre el
 * inventario real y la tabla de hojas sintéticas— son los `describe` de más
 * abajo.
 */
describe('@s20 (unitario, sobre entradas sintéticas) la aritmética del veredicto de visibilidad sin animación', () => {
  it('todos los bloques declarados visibles sin animación pasan la comprobación', () => {
    const bloques: readonly BloqueQueApareceAnimando[] = [
      { nombre: 'Tarjeta de campaña 1', visibleSinAnimacion: true },
      { nombre: 'Tarjeta de campaña 2', visibleSinAnimacion: true },
    ]

    const informe = ejecutarComprobacionDeVisibilidadSinAnimacion(bloques)

    expect(informe.pasa).toBe(true)
    expect(informe.bloquesComprobados).toBe(2)
    expect(informe.bloquesComprobados).toBeGreaterThan(0)
    expect(informe.bloquesInvisibles).toHaveLength(0)
  })

  it('un bloque que queda invisible sin su animación suspende la comprobación y se nombra', () => {
    const bloques: readonly BloqueQueApareceAnimando[] = [
      { nombre: 'Tarjeta de campaña 1', visibleSinAnimacion: true },
      { nombre: 'Bloque oculto sin animación', visibleSinAnimacion: false },
    ]

    const informe = ejecutarComprobacionDeVisibilidadSinAnimacion(bloques)

    expect(informe.pasa).toBe(false)
    expect(informe.bloquesInvisibles).toEqual(['Bloque oculto sin animación'])
  })

  /**
   * Cambio requerido por `progress/judge_accesibilidad.md` (ronda 1, opción
   * a): la cláusula "el análisis automático de accesibilidad de esa página
   * sigue devolviendo 0 violaciones" no tenía ningún test. Se reutiliza
   * `ejecutarPuertaDeAnalisisAutomatico` (ya existente, ya cubierta por
   * `accesibilidad-analisis.test.ts`, `@s2`-`@s3`) con un
   * `ResultadoDeAnalisisAutomatico` LIMPIO en el contexto de una de las seis
   * páginas del inventario. Esto solo prueba la ARITMÉTICA del veredicto (0
   * violaciones estructuradas ⇒ aprobado): NO ejecuta axe-core de verdad
   * sobre el DOM con la animación desactivada — eso sigue siendo
   * competencia del navegador real (Decisión 11, project-spec.md), igual que
   * el resto de `@s20` que sí es lógica pura consultable.
   */
  it('con menos movimiento pedido, el análisis automático de esa página sigue devolviendo 0 violaciones', () => {
    const resultado: ResultadoDeAnalisisAutomatico = {
      reglasAplicadas: 90,
      informes: [{ pagina: 'Campañas', cargo: true, violaciones: [] }],
    }

    const informe = ejecutarPuertaDeAnalisisAutomatico(resultado)

    expect(informe.violacionesTotales).toBe(0)
    expect(informe.veredicto).toBe('aprobado')
  })
})

/**
 * @s21 (parcial, pura) — «si la preferencia no se puede consultar, se actúa
 * como si se hubiera pedido menos movimiento». Ya está construido y mordido
 * al 100 % en `Galeria-logica.ts` (feature `galeria`, @s8, ya `done`); aquí
 * se reutiliza como el fundamento de esta cláusula, sin reimplementarlo. El
 * resto de @s21 (ninguna animación se reproduce, ningún error de consola con
 * el motor de animaciones real) se verifica con navegador real.
 */
describe('@s21 (parcial, pura) si la consulta de movimiento no está disponible se actúa como si se hubiera pedido menos movimiento', () => {
  it('prefiereMenosMovimiento(undefined) cae cerrado a "true"', () => {
    expect(prefiereMenosMovimiento(undefined)).toBe(true)
  })
})

/**
 * @s22 (parcial, pura) — complemento de @s19/@s20: cuando NO se pidió menos
 * movimiento, la misma lógica que suprime el movimiento NO lo suprime. La
 * animación en curso en sí y su visibilidad al terminar exigen el motor de
 * animaciones real (mismo motivo que @s19).
 */
describe('@s22 (parcial, pura) sin preferencia de menos movimiento el desplazamiento solicitado sí es suavizado', () => {
  it('calcularSolicitudDeDesplazamiento con prefiereMenos=false pide un desplazamiento suave', () => {
    const solicitud = calcularSolicitudDeDesplazamiento(200, 'siguiente', false)

    expect(solicitud).not.toBeNull()
    expect(solicitud?.suave).toBe(true)
  })

  it('decidirComportamientoDesplazamiento sin preferencia de menos movimiento devuelve "smooth"', () => {
    const comportamiento = decidirComportamientoDesplazamiento(() => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      addListener: () => {},
      removeListener: () => {},
    }))

    expect(comportamiento).toBe('smooth')
  })
})

/**
 * EL INVENTARIO REAL (@s20 de `accesibilidad.feature`: «el inventario de bloques
 * que se recorre se lee del sitio real, nunca de una lista escrita en el propio
 * test»). Mismo patrón de corpus que `escalaMovimiento.test.ts`:
 * `import.meta.glob` con `query: '?raw'` sobre el TEXTO de las hojas que el sitio
 * compila de verdad: las 3 globales de `src/styles/`, las 12 de módulo de los
 * componentes y las 5 de las páginas (20 en total).
 */
const HOJAS_REALES: readonly HojaDeEstilos[] = [
  ...Object.entries(
    import.meta.glob('../styles/*.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
  ),
  ...Object.entries(
    import.meta.glob('../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
  ),
  ...Object.entries(
    import.meta.glob('../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
      string,
      string
    >,
  ),
].map(([ruta, contenido]) => ({ ruta, contenido }))

const HOJA_CON_ENTRADA_VISIBLE = `.tarjeta {
  animation: aparecer 300ms ease-out;
}
`

const HOJA_CON_ENTRADA_INVISIBLE_POR_VISIBILITY = `.tarjeta {
  visibility: hidden;
  animation: aparecer 300ms ease-out;
}
`

const HOJA_CON_ANIMATION_NAME = `.tarjeta {
  animation-name: aparecer;
}
`

const HOJA_CON_EL_ANULADOR_GLOBAL = `@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
  }
}
`

const HOJA_CON_ANIMATION_SOLO_EN_UN_COMENTARIO = `.tarjeta {
  /* antes: animation: aparecer 300ms ease-out; */
}
`

const HOJA_CON_ESPACIO_ANTES_DE_LOS_DOS_PUNTOS = `.tarjeta {
  animation : aparecer 300ms ease-out;
}
`

/**
 * Este repositorio tiene `core.autocrlf = true` y las hojas viajan como `text:
 * auto`, así que un clon limpio en Windows las recibe con finales de línea
 * CRLF. El análisis tiene que dar lo mismo con un retorno de carro pegado al
 * final de cada línea: se construye por concatenación porque una plantilla de
 * JavaScript normaliza CRLF a LF.
 */
const FIN_DE_LINEA_DE_WINDOWS = '\r\n'
const HOJA_CON_FINALES_DE_LINEA_DE_WINDOWS = [
  '.tarjeta {',
  '  opacity: 0;',
  '  animation: aparecer 300ms ease-out;',
  '}',
  '',
].join(FIN_DE_LINEA_DE_WINDOWS)

const HOJA_CON_ENTRADA_OCULTA = `.tarjeta {
  opacity: 0;
  animation: aparecer 300ms ease-out;
}
`

// LA LISTA DE HOJAS AUTORIZADAS, ESCRITA A MANO: «solo la del hero». NO se obtiene de la constante del módulo
// que se comprueba (patrón doble-de-test-anclado-al-literal).
const LISTA_AUTORIZADA_A_MANO: readonly string[] = ['/components/Hero.module.scss']

const RUTA_DE_LA_HOJA_DEL_HERO = '/prueba/components/Hero.module.scss'
const RUTA_DE_OTRA_HOJA = '/prueba/components/Servicios.module.scss'

const FOTOGRAMAS_DE_ENTRADA_EN_VARIAS_LINEAS = [
  '  @keyframes entrada {',
  '    from {',
  '      opacity: 0;',
  '      transform: translateX(-40px);',
  '    }',
  '    to {',
  '      opacity: 1;',
  '      transform: none;',
  '    }',
  '  }',
]

const FOTOGRAMAS_DE_ENTRADA_EN_UNA_LINEA_CADA_UNO = [
  '  @keyframes entrada {',
  '    from { opacity: 0; transform: translateX(-40px); }',
  '    to { opacity: 1; transform: none; }',
  '  }',
]

function hojaConAnimacion(opciones: {
  readonly fotogramas?: readonly string[]
  readonly estadoBase?: readonly string[]
  readonly despues?: readonly string[]
}): string {
  return [
    '@media (prefers-reduced-motion: no-preference) {',
    ...(opciones.fotogramas ?? FOTOGRAMAS_DE_ENTRADA_EN_VARIAS_LINEAS),
    '',
    '  .titular {',
    ...(opciones.estadoBase ?? []).map((linea) => `    ${linea}`),
    '    animation: entrada 700ms ease-out backwards;',
    '  }',
    '}',
    ...(opciones.despues ?? []),
    '',
  ].join('\n')
}

describe('@s20 el inventario de bloques que aparecen animando se lee del sitio real y desde el 13/10/2026 solo puede ser el del hero', () => {
  it('el inventario sale del texto real de las hojas del sitio —las 20— y no de una lista del test', () => {
    const inventario = inventariarBloquesQueAparecenAnimando(HOJAS_REALES)

    expect(HOJAS_REALES.length).toBe(20)
    expect(inventario.hojasInspeccionadas).toBe(HOJAS_REALES.length)
  })

  it('la lista de hojas autorizadas a declarar una animación de entrada es exactamente la del hero (literal escrito a mano)', () => {
    expect(HOJAS_AUTORIZADAS_A_ANIMAR_LA_ENTRADA).toEqual(LISTA_AUTORIZADA_A_MANO)
  })

  it('sobre las hojas reales ninguna aparición animada queda fuera de la hoja del hero ni queda invisible sin su animación', () => {
    // Lo "mayor que 0" —que la animación del hero exista de verdad— lo exige la ola que la escribe: hoy ninguna
    // hoja real la declara. Lo que se afirma desde ya, y seguirá cierto con la animación correcta, es el resto.
    const inventario = inventariarBloquesQueAparecenAnimando(HOJAS_REALES)
    const visibilidad = ejecutarComprobacionDeVisibilidadSinAnimacion(inventario.bloques)

    expect(inventario.bloquesFueraDeLasHojasAutorizadas).toEqual([])
    expect(visibilidad.bloquesComprobados).toBe(inventario.recuentoDeBloquesQueAparecenAnimando)
    expect(visibilidad.bloquesInvisibles).toEqual([])
  })

  it('un bloque animado cuya hoja declara un estado base oculto NO se da por visible sin su animación', () => {
    const hojaConEntradaOculta: HojaDeEstilos = {
      ruta: '/prueba/entrada-oculta.scss',
      contenido: HOJA_CON_ENTRADA_OCULTA,
    }

    const inventario = inventariarBloquesQueAparecenAnimando([hojaConEntradaOculta])

    expect(inventario.bloques).toEqual([{ nombre: '/prueba/entrada-oculta.scss:3', visibleSinAnimacion: false }])
  })

  it('una animación fuera de la hoja del hero se caza y nombra la hoja y la línea: cualquier otra exige su propia puerta humana', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '/prueba/reintroducida.scss', contenido: HOJA_CON_ENTRADA_VISIBLE },
    ])

    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(1)
    expect(inventario.bloques).toEqual([{ nombre: '/prueba/reintroducida.scss:2', visibleSinAnimacion: true }])
    expect(inventario.bloquesFueraDeLasHojasAutorizadas).toEqual(['/prueba/reintroducida.scss:2'])
    expect(inventario.pasa).toBe(false)
  })

  it('"visibility: hidden" también deja el estado base oculto', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '/prueba/oculta-por-visibility.scss', contenido: HOJA_CON_ENTRADA_INVISIBLE_POR_VISIBILITY },
    ])

    expect(inventario.bloques).toEqual([
      { nombre: '/prueba/oculta-por-visibility.scss:3', visibleSinAnimacion: false },
    ])
  })

  it('"animation-name" cuenta como aparición animada igual que "animation"', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '/prueba/animation-name.scss', contenido: HOJA_CON_ANIMATION_NAME },
    ])

    expect(inventario.bloques).toEqual([{ nombre: '/prueba/animation-name.scss:2', visibleSinAnimacion: true }])
  })

  it('el anulador global de "reduce" apaga movimiento, no lo crea: no cuenta como aparición animada', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '/prueba/anulador.scss', contenido: HOJA_CON_EL_ANULADOR_GLOBAL },
    ])

    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(0)
    expect(inventario.bloques).toEqual([])
  })

  it('"animation" dentro de un comentario no cuenta como aparición animada', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '/prueba/comentario.scss', contenido: HOJA_CON_ANIMATION_SOLO_EN_UN_COMENTARIO },
    ])

    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(0)
  })

  it('"animation" con un espacio antes de los dos puntos sigue contando', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '/prueba/espacio.scss', contenido: HOJA_CON_ESPACIO_ANTES_DE_LOS_DOS_PUNTOS },
    ])

    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(1)
  })

  it('una hoja con finales de línea de Windows se analiza igual: el estado base oculto se sigue viendo', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '/prueba/crlf.scss', contenido: HOJA_CON_FINALES_DE_LINEA_DE_WINDOWS },
    ])

    expect(inventario.bloques).toEqual([{ nombre: '/prueba/crlf.scss:3', visibleSinAnimacion: false }])
  })

  it('con 0 hojas la puerta falla cerrada, nunca "pasa" por vacuidad', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([])

    expect(inventario.hojasInspeccionadas).toBe(0)
    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(0)
    expect(inventario.pasa).toBe(false)
  })
})

/**
 * LA TABLA DEL CONTRATO (8 filas). «Veredicto» es el de la puerta ENTERA: el
 * inventario (todas las apariciones son de una hoja autorizada y hay al menos
 * una) y la comprobación de visibilidad (ninguna queda invisible sin su
 * animación). Cada fila afirma además cuántos bloques señala como invisibles.
 */
interface FilaDeLaTabla {
  readonly fila: string
  readonly ruta: string
  readonly contenido: string
  readonly veredicto: 'pasa' | 'incumple'
  readonly bloquesInvisibles: number
}

const TABLA_DE_FILAS: readonly FilaDeLaTabla[] = [
  {
    fila: 'hoja del hero con unos fotogramas cuyo "from" parte de opacidad 0, repartidos en varias líneas, y un bloque animado cuyo estado base no oculta nada',
    ruta: RUTA_DE_LA_HOJA_DEL_HERO,
    contenido: hojaConAnimacion({}),
    veredicto: 'pasa',
    bloquesInvisibles: 0,
  },
  {
    fila: 'la misma, con los bloques "from" y "to" de los fotogramas escritos cada uno en una sola línea',
    ruta: RUTA_DE_LA_HOJA_DEL_HERO,
    contenido: hojaConAnimacion({ fotogramas: FOTOGRAMAS_DE_ENTRADA_EN_UNA_LINEA_CADA_UNO }),
    veredicto: 'pasa',
    bloquesInvisibles: 0,
  },
  {
    fila: 'la primera, pero el bloque animado declara además opacidad 0 en su estado base',
    ruta: RUTA_DE_LA_HOJA_DEL_HERO,
    contenido: hojaConAnimacion({ estadoBase: ['opacity: 0;'] }),
    veredicto: 'incumple',
    bloquesInvisibles: 1,
  },
  {
    fila: 'la primera, pero el bloque animado declara además visibilidad oculta en su estado base',
    ruta: RUTA_DE_LA_HOJA_DEL_HERO,
    contenido: hojaConAnimacion({ estadoBase: ['visibility: hidden;'] }),
    veredicto: 'incumple',
    bloquesInvisibles: 1,
  },
  {
    fila: 'un bloque animado cuyo estado base declara opacidad 0, todo escrito en una sola línea',
    ruta: RUTA_DE_LA_HOJA_DEL_HERO,
    contenido: ['.titular { opacity: 0; animation: entrada 700ms ease-out backwards; }', ''].join('\n'),
    veredicto: 'incumple',
    bloquesInvisibles: 1,
  },
  {
    fila: 'la primera, pero otro bloque de la misma hoja, sin animación, declara opacidad 0',
    ruta: RUTA_DE_LA_HOJA_DEL_HERO,
    contenido: hojaConAnimacion({ despues: ['.otro {', '  opacity: 0;', '}'] }),
    veredicto: 'incumple',
    bloquesInvisibles: 1,
  },
  {
    fila: 'la primera, pero declarada en una hoja que no es la del hero',
    ruta: RUTA_DE_OTRA_HOJA,
    contenido: hojaConAnimacion({}),
    veredicto: 'incumple',
    bloquesInvisibles: 0,
  },
  {
    fila: 'hoja del hero con unos fotogramas cuyo "from" parte de visibilidad oculta, y un bloque animado cuyo estado base no oculta nada',
    ruta: RUTA_DE_LA_HOJA_DEL_HERO,
    contenido: hojaConAnimacion({
      fotogramas: ['  @keyframes entrada {', '    from {', '      visibility: hidden;', '    }', '    to {', '      visibility: visible;', '    }', '  }'],
    }),
    veredicto: 'pasa',
    bloquesInvisibles: 0,
  },
]

function veredictoDeLaPuerta(hojas: readonly HojaDeEstilos[]): { pasa: boolean; bloquesInvisibles: number } {
  const inventario = inventariarBloquesQueAparecenAnimando(hojas)
  const visibilidad = ejecutarComprobacionDeVisibilidadSinAnimacion(inventario.bloques)
  return { pasa: inventario.pasa && visibilidad.pasa, bloquesInvisibles: visibilidad.bloquesInvisibles.length }
}

describe('@s20 (tabla de 8 filas del contrato): el veredicto de la puerta sobre cada hoja sintética', () => {
  it('la tabla tiene exactamente las 8 filas del contrato', () => {
    expect(TABLA_DE_FILAS).toHaveLength(8)
  })

  it.each(TABLA_DE_FILAS)('$veredicto: $fila', ({ ruta, contenido, veredicto, bloquesInvisibles }) => {
    const resultado = veredictoDeLaPuerta([{ ruta, contenido }])

    expect(resultado.pasa).toBe(veredicto === 'pasa')
    expect(resultado.bloquesInvisibles).toBe(bloquesInvisibles)
  })
})

describe('@s20: el estado base invisible y la hoja autorizada, más allá de la tabla', () => {
  it('una hoja del hero sin ninguna animación NO pasa: el recuento "mayor que 0" se declara por escrito, no se aprueba en silencio', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: RUTA_DE_LA_HOJA_DEL_HERO, contenido: '.titular {\n  color: red;\n}\n' },
    ])

    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(0)
    expect(inventario.bloquesFueraDeLasHojasAutorizadas).toEqual([])
    expect(inventario.pasa).toBe(false)
  })

  it('la hoja del hero con su animación pasa, y nombra cada aparición con su hoja y su línea', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: RUTA_DE_LA_HOJA_DEL_HERO, contenido: hojaConAnimacion({}) },
    ])

    expect(inventario.bloques).toEqual([{ nombre: `${RUTA_DE_LA_HOJA_DEL_HERO}:14`, visibleSinAnimacion: true }])
    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(1)
    expect(inventario.bloquesFueraDeLasHojasAutorizadas).toEqual([])
    expect(inventario.pasa).toBe(true)
  })

  it('con varias hojas solo se señalan las apariciones de las que NO son la del hero, y el estado base de una no afecta a la otra', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: RUTA_DE_LA_HOJA_DEL_HERO, contenido: hojaConAnimacion({}) },
      { ruta: '/prueba/components/Galeria.module.scss', contenido: HOJA_CON_ENTRADA_OCULTA },
      { ruta: '/prueba/components/Equipo.module.scss', contenido: '.a {\n  opacity: 0;\n}\n' },
    ])

    expect(inventario.hojasInspeccionadas).toBe(3)
    expect(inventario.bloquesFueraDeLasHojasAutorizadas).toEqual(['/prueba/components/Galeria.module.scss:3'])
    expect(inventario.bloques).toEqual([
      { nombre: `${RUTA_DE_LA_HOJA_DEL_HERO}:14`, visibleSinAnimacion: true },
      { nombre: '/prueba/components/Galeria.module.scss:3', visibleSinAnimacion: false },
    ])
    expect(inventario.pasa).toBe(false)
  })

  it('solo el fichero del hero está autorizado: otro con el mismo nombre en otra carpeta, o con el nombre como sufijo, no', () => {
    for (const ruta of [
      '/prueba/pages/Hero.module.scss',
      '/prueba/components/PaginaHero.module.scss',
      'Hero.module.scss',
      '/prueba/components/Hero.module.scss.bak',
    ]) {
      const inventario = inventariarBloquesQueAparecenAnimando([{ ruta, contenido: hojaConAnimacion({}) }])

      expect(inventario.bloquesFueraDeLasHojasAutorizadas).toEqual([`${ruta}:14`])
    }
    // Y la forma que produce `import.meta.glob`, con su prefijo relativo, sí lo es.
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '../components/Hero.module.scss', contenido: hojaConAnimacion({}) },
    ])
    expect(inventario.bloquesFueraDeLasHojasAutorizadas).toEqual([])
  })

  it('una opacidad 0 o una visibilidad oculta DENTRO de unos fotogramas no es un estado base, esté donde esté anidado el @keyframes', () => {
    const hoja = [
      '@keyframes raiz {',
      '  from {',
      '    opacity: 0;',
      '  }',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  @keyframes dentro {',
      '    to {',
      '      visibility: hidden;',
      '    }',
      '  }',
      '}',
      '.a {',
      '  animation: raiz 1s;',
      '}',
      '',
    ].join('\n')

    const inventario = inventariarBloquesQueAparecenAnimando([{ ruta: RUTA_DE_LA_HOJA_DEL_HERO, contenido: hoja }])

    expect(inventario.bloques).toEqual([{ nombre: `${RUTA_DE_LA_HOJA_DEL_HERO}:14`, visibleSinAnimacion: true }])
  })

  it('una opacidad 0 FUERA de los fotogramas señala el bloque aunque esté dentro de una consulta, de otro bloque o repartida en varias líneas', () => {
    const casos: readonly (readonly string[])[] = [
      ['@media (prefers-reduced-motion: reduce) {', '  .x {', '    opacity: 0;', '  }', '}'],
      ['.x {', '  opacity:', '    0;', '}'],
      ['.x { opacity:0 }'],
      ['.x {', '  visibility:', '    hidden', '}'],
    ]

    for (const caso of casos) {
      const hoja = [...caso, '.animado {', '  animation: entrada 700ms;', '}', ''].join('\n')

      const inventario = inventariarBloquesQueAparecenAnimando([{ ruta: RUTA_DE_LA_HOJA_DEL_HERO, contenido: hoja }])

      expect(inventario.bloques.map((bloque) => bloque.visibleSinAnimacion)).toEqual([false])
    }
  })

  it('una opacidad distinta de 0 o una visibilidad distinta de oculta no es un estado base invisible', () => {
    const hoja = ['.x {', '  opacity: 0.5;', '  visibility: visible;', '  opacity: 1;', '}', '.animado {', '  animation: entrada 700ms;', '}', ''].join('\n')

    const inventario = inventariarBloquesQueAparecenAnimando([{ ruta: RUTA_DE_LA_HOJA_DEL_HERO, contenido: hoja }])

    expect(inventario.bloques.map((bloque) => bloque.visibleSinAnimacion)).toEqual([true])
  })

  it('otras propiedades con el valor 0 u "hidden" ("margin: 0", "overflow: hidden") no ocultan nada', () => {
    const hoja = ['.x {', '  margin: 0;', '  overflow: hidden;', '  opacity-extra: 0;', '  visibility-extra: hidden;', '}', '.animado {', '  animation: entrada 700ms;', '}', ''].join('\n')

    const inventario = inventariarBloquesQueAparecenAnimando([{ ruta: RUTA_DE_LA_HOJA_DEL_HERO, contenido: hoja }])

    expect(inventario.bloques.map((bloque) => bloque.visibleSinAnimacion)).toEqual([true])
  })

  it('varias apariciones animadas de una misma hoja se cuentan una a una, cada una con su línea', () => {
    const hoja = ['.a {', '  animation: uno 1s;', '}', '.b {', '  animation-name: dos;', '}', ''].join('\n')

    const inventario = inventariarBloquesQueAparecenAnimando([{ ruta: RUTA_DE_LA_HOJA_DEL_HERO, contenido: hoja }])

    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(2)
    expect(inventario.bloques.map((bloque) => bloque.nombre)).toEqual([`${RUTA_DE_LA_HOJA_DEL_HERO}:2`, `${RUTA_DE_LA_HOJA_DEL_HERO}:5`])
  })
})
