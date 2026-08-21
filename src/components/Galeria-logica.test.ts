import { describe, expect, it } from 'vitest'
import type { EntradaGaleria } from '../data/galeria'
import {
  calcularSolicitudDeDesplazamiento,
  entradasValidas,
  prefiereMenosMovimiento,
  SEPARACION_ENTRE_TARJETAS_PX,
} from './Galeria-logica'

describe('SEPARACION_ENTRE_TARJETAS_PX (apoyo de implementación, no escenario de negocio)', () => {
  it('el valor declarado es exactamente 18 píxeles, escrito a mano y no derivado del símbolo', () => {
    expect(SEPARACION_ENTRE_TARJETAS_PX).toBe(18)
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
