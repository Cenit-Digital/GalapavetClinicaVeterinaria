import { describe, expect, it, vi } from 'vitest'
import type { EntradaGaleria } from '../data/galeria'
import {
  calcularSolicitudDeDesplazamiento,
  entradasValidas,
  prefiereMenosMovimiento,
  SEPARACION_ENTRE_TARJETAS_PX,
} from './Galeria-logica'

describe('SEPARACION_ENTRE_TARJETAS_PX (apoyo de implementación, no escenario de negocio)', () => {
  // ENMIENDA (fidelidad_galeria @s3, 03/09/2026): la separación aprobada de
  // 18 px se re-mide sobre la escala del repo, como preveía la cabecera de
  // `galeria.feature` (PENDIENTE 3): el `gap` real de la pista es
  // `espaciado(16)` y el paso de desplazamiento debe ser "ancho + separación
  // efectiva", así que la constante pasa a 16. Ver
  // `progress/fidelidad/enmiendas_fidelidad_galeria.md`.
  it('el valor declarado es exactamente 16 píxeles (el paso espaciado(16) de la pista), escrito a mano y no derivado del símbolo', () => {
    expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(16)
  })
})

describe('calcularSolicitudDeDesplazamiento (apoyo de @s5)', () => {
  it('"siguiente" pide una distancia positiva de exactamente ancho + separación, suavizada', () => {
    const solicitud = calcularSolicitudDeDesplazamiento(240, 'siguiente', false)
    expect(solicitud?.distanciaPx).toBe(240 + SEPARACION_ENTRE_TARJETAS_PX)
  })
})

describe('calcularSolicitudDeDesplazamiento (apoyo de @s6)', () => {
  it('"anterior" pide la misma magnitud en negativo', () => {
    const solicitud = calcularSolicitudDeDesplazamiento(240, 'anterior', false)
    expect(solicitud?.distanciaPx).toBe(-(240 + SEPARACION_ENTRE_TARJETAS_PX))
  })
})

describe('calcularSolicitudDeDesplazamiento (apoyo de @s7)', () => {
  it('con preferencia de menos movimiento, la solicitud no es suave', () => {
    expect(calcularSolicitudDeDesplazamiento(240, 'siguiente', true)?.suave).toBe(false)
  })
})

describe('prefiereMenosMovimiento (apoyo de @s7)', () => {
  it('devuelve el "matches" de la consulta "(prefers-reduced-motion: reduce)"', () => {
    const consultarMedios = ((consulta: string) => ({
      matches: consulta === '(prefers-reduced-motion: reduce)',
    })) as typeof window.matchMedia

    expect(prefiereMenosMovimiento(consultarMedios)).toBe(true)
  })
})

describe('calcularSolicitudDeDesplazamiento (apoyo de @s10)', () => {
  it('con ancho de tarjeta 0 (sin medida real) no hay solicitud de desplazamiento: devuelve null', () => {
    expect(calcularSolicitudDeDesplazamiento(0, 'siguiente', false)).toBeNull()
  })
})

describe('entradasValidas (apoyo de @s17)', () => {
  it('descarta las entradas con el nombre en blanco y conserva el resto en su orden', () => {
    const catalogo: readonly EntradaGaleria[] = [
      { nombre: 'Nala y Coco', pie: 'Primera vacunación', src: '/a.webp' },
      { nombre: '   ', pie: 'Pie huérfano', src: '/b.webp' },
      { nombre: 'Bruno', pie: 'Alta tras cirugía de rodilla', src: '/c.webp' },
    ]

    const validas = entradasValidas(catalogo)

    expect(validas.map((entrada) => entrada.nombre)).toEqual(['Nala y Coco', 'Bruno'])
  })
})

describe('prefiereMenosMovimiento (apoyo de @s8)', () => {
  it('si no hay función de consulta disponible, cae a "prefiere menos" (falla cerrado hacia sin suavizado)', () => {
    expect(prefiereMenosMovimiento(undefined)).toBe(true)
  })
})

describe('prefiereMenosMovimiento (apoyo de @s7)', () => {
  it('con una consulta disponible que NO empareja, respeta al sistema y devuelve false: no cae al valor seguro', () => {
    const consultarMedios = (() => ({ matches: false })) as unknown as typeof window.matchMedia

    expect(prefiereMenosMovimiento(consultarMedios)).toBe(false)
  })
})

/**
 * Refuerzo de mutación para la constante de módulo `CONSULTA_MENOS_MOVIMIENTO`
 * (`Galeria-logica.ts:68`), ver `progress/mutation_fidelidad_galeria.md`.
 *
 * Una constante evaluada al cargar el módulo es un mutante *estático*: cuando
 * la medición se acota con `--testFiles`, StrykerJS planifica esos mutantes con
 * `mutantActivation: 'runtime'` (activa el mutante en un `beforeAll`, ya
 * importado el módulo), así que el literal vaciado nunca llega a evaluarse y el
 * mutante sobrevive aunque la suite lo detectaría. El módulo tiene que
 * RE-EVALUARSE dentro del cuerpo del test: mismo patrón que
 * `src/lib/site.reimportacion.test.ts` para los teléfonos reales.
 *
 * La aserción va contra la consulta EXACTA tecleada a mano, no contra la
 * constante importada (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`,
 * `feature_list.json` → `rules.notas`).
 */
describe('refuerzo de mutación: la consulta de medios se re-evalúa dentro del test (apoyo de @s7/@s8)', () => {
  it('pregunta al sistema exactamente por "(prefers-reduced-motion: reduce)"', async () => {
    vi.resetModules()
    const { prefiereMenosMovimiento: recargada } = await import('./Galeria-logica')
    const consultasPreguntadas: string[] = []
    const consultarMedios = ((consulta: string) => {
      consultasPreguntadas.push(consulta)
      return { matches: true }
    }) as unknown as typeof window.matchMedia

    expect(recargada(consultarMedios)).toBe(true)
    expect(consultasPreguntadas).toEqual(['(prefers-reduced-motion: reduce)'])
  })
})
