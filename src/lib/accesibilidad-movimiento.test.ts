import { describe, expect, it } from 'vitest'
import { calcularSolicitudDeDesplazamiento, prefiereMenosMovimiento } from '../components/Galeria-logica'
import { decidirComportamientoDesplazamiento } from './desplazamiento'
import {
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
 * única puerta de @s20: por eso `features/accesibilidad.feature:501` los
 * declaró insuficientes —«el inventario de bloques que se recorre se lee del
 * sitio real, nunca de una lista escrita en el propio test»— y el `judge`
 * los marcó como cobertura que no muerde. Se CONSERVAN, pero degradados a lo
 * que de verdad son: tests unitarios de la aritmética del veredicto, que es
 * lógica pura bajo umbral de mutación del 100 %. La PUERTA de @s20 —la que
 * recorre el inventario real— es el último `describe` de este fichero.
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
 * EL INVENTARIO REAL (`features/accesibilidad.feature:501`, @s20): «el
 * inventario de bloques que se recorre se lee del sitio real, nunca de una
 * lista escrita en el propio test». Mismo patrón de corpus que
 * `escalaMovimiento.test.ts`: `import.meta.glob` con `query: '?raw'` sobre el
 * TEXTO de las hojas que el sitio compila de verdad — las 17 de módulo, más
 * las globales de `src/styles/`.
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
 * CRLF. El análisis parte por el salto de línea, de modo que cada línea
 * llegaría con un retorno de carro pegado al final: si el normalizador dejara
 * de recortarlo, el estado base oculto dejaría de reconocerse. Se construye
 * por concatenación porque una plantilla de JavaScript normaliza CRLF a LF.
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

describe('@s20 el inventario de bloques que aparecen animando se lee del sitio real y hoy vale exactamente 0', () => {
  it('el inventario sale del texto real de las hojas del sitio, no de una lista del test (:501)', () => {
    const inventario = inventariarBloquesQueAparecenAnimando(HOJAS_REALES)

    expect(HOJAS_REALES.length).toBeGreaterThan(0)
    expect(inventario.hojasInspeccionadas).toBe(HOJAS_REALES.length)
  })

  it('un bloque animado cuya hoja declara un estado base oculto NO se da por visible sin su animación', () => {
    const hojaConEntradaOculta: HojaDeEstilos = {
      ruta: '/prueba/entrada-oculta.scss',
      contenido: HOJA_CON_ENTRADA_OCULTA,
    }

    const inventario = inventariarBloquesQueAparecenAnimando([hojaConEntradaOculta])

    expect(inventario.bloques).toEqual([{ nombre: '/prueba/entrada-oculta.scss:3', visibleSinAnimacion: false }])
  })

  it('desde el 20/09/2026 el recuento de bloques que aparecen mediante una animación es exactamente 0 (:502)', () => {
    const inventario = inventariarBloquesQueAparecenAnimando(HOJAS_REALES)

    expect(inventario.hojasInspeccionadas).toBeGreaterThan(0)
    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(0)
    expect(inventario.bloques).toEqual([])
    expect(inventario.pasa).toBe(true)
  })
  it('la comprobación de visibilidad de @s20 recorre el inventario REAL del sitio, no un literal del test (:501)', () => {
    const inventario = inventariarBloquesQueAparecenAnimando(HOJAS_REALES)

    const informe = ejecutarComprobacionDeVisibilidadSinAnimacion(inventario.bloques)

    expect(informe.bloquesComprobados).toBe(inventario.recuentoDeBloquesQueAparecenAnimando)
    expect(informe.bloquesInvisibles).toEqual([])
  })

  it('si el recuento vuelve a subir, la puerta lo caza y nombra la hoja y la línea (:503)', () => {
    const inventario = inventariarBloquesQueAparecenAnimando([
      { ruta: '/prueba/reintroducida.scss', contenido: HOJA_CON_ENTRADA_VISIBLE },
    ])

    expect(inventario.recuentoDeBloquesQueAparecenAnimando).toBe(1)
    expect(inventario.bloques).toEqual([{ nombre: '/prueba/reintroducida.scss:2', visibleSinAnimacion: true }])
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
    expect(inventario.pasa).toBe(true)
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
