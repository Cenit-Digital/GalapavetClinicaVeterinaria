import { describe, expect, it } from 'vitest'
import {
  AREA_TACTIL_MINIMA_PX,
  ejecutarPuertaDeAreaTactil,
  evaluarAreaTactil,
  type ControlInteractivo,
} from './accesibilidad-areaTactil'

describe('@s9 el área táctil mínima exigida es exactamente 24 píxeles CSS en ambos lados', () => {
  it('el literal 24, escrito a mano, coincide con el mínimo de ancho y de alto que exige la puerta', () => {
    // Literal escrito a mano (patrón `doble-de-test-anclado-al-literal-no-al-simbolo`):
    // no se obtiene de `AREA_TACTIL_MINIMA_PX`.
    const minimoEscritoAMano = 24

    expect(AREA_TACTIL_MINIMA_PX).toBe(minimoEscritoAMano)
  })
})

describe('@s10 todo control interactivo alcanza el área táctil mínima', () => {
  it('mide todos los controles del inventario, ninguno queda sin medir y todos alcanzan el mínimo', () => {
    // El inventario real de controles con área declarada por página está
    // PENDIENTE de que `tokens_marca` fije la escala de espaciado (ya
    // anotado PENDIENTE en `Galeria-logica.ts`); se demuestra aquí el
    // comportamiento del evaluador con un inventario de ejemplo, con la
    // misma forma que tendrá el real (Invariante 6: valor DECLARADO, no
    // medido del render).
    const inventario: readonly ControlInteractivo[] = [
      { nombre: 'Botón "Abrir menú"', anchoPx: 44, altoPx: 44 },
      { nombre: 'Enlace del logotipo', anchoPx: 32, altoPx: 32 },
      { nombre: 'Botón "Añadir a la cesta"', anchoPx: 24, altoPx: 24 },
    ]

    const informe = ejecutarPuertaDeAreaTactil(inventario)

    expect(informe.controlesMedidos).toBe(3)
    expect(informe.controlesMedidos).toBeGreaterThan(0)
    expect(informe.pasa).toBe(true)
  })
})

describe('@s11 un control que se queda un píxel por debajo del mínimo suspende la puerta', () => {
  it('23x24, sin excepción, veredicto suspenso con el valor medido y el exigido', () => {
    const control: ControlInteractivo = { nombre: 'Botón estrecho', anchoPx: 23, altoPx: 24 }

    const veredicto = evaluarAreaTactil(control)

    expect(veredicto.veredicto).toBe('suspenso')
    expect(veredicto.anchoMedido).toBe(23)
    expect(veredicto.exigido).toBe(24)
  })

  it('refuerzo mutación: ancho suficiente pero alto insuficiente también suspende (las dos dimensiones son obligatorias, no basta una)', () => {
    const control: ControlInteractivo = { nombre: 'Botón bajo', anchoPx: 24, altoPx: 23 }

    const veredicto = evaluarAreaTactil(control)

    expect(veredicto.veredicto).toBe('suspenso')
  })

  it('refuerzo mutación: un inventario mixto suspende la puerta e identifica solo el control que falla', () => {
    const estrecho: ControlInteractivo = { nombre: 'Botón estrecho', anchoPx: 23, altoPx: 24 }
    const conforme: ControlInteractivo = { nombre: 'Botón conforme', anchoPx: 44, altoPx: 44 }

    const informe = ejecutarPuertaDeAreaTactil([estrecho, conforme])

    expect(informe.pasa).toBe(false)
    expect(informe.suspensos).toHaveLength(1)
    expect(informe.suspensos[0]?.control.nombre).toBe('Botón estrecho')
  })
})

describe('@s12 un control que mide exactamente el mínimo aprueba la puerta', () => {
  it('24x24 aprueba sin ninguna excepción ni violación', () => {
    const control: ControlInteractivo = { nombre: 'Botón justo', anchoPx: 24, altoPx: 24 }

    const veredicto = evaluarAreaTactil(control)

    expect(veredicto.veredicto).toBe('aprobado')
    expect(veredicto.excepcionAplicada).toBeUndefined()
    expect(Object.hasOwn(veredicto, 'excepcionAplicada')).toBe(false)
    expect(Object.hasOwn(veredicto, 'diametroEmpleadoPx')).toBe(false)
  })
})

describe('@s13 un enlace dentro de una frase queda exento por la excepción «en línea»', () => {
  it('menor de 24x24 y en línea: aprobado por la excepción "en línea", declarada en el informe', () => {
    const enlace: ControlInteractivo = { nombre: 'Enlace en frase', anchoPx: 16, altoPx: 18, enLinea: true }

    const veredicto = evaluarAreaTactil(enlace)

    expect(veredicto.veredicto).toBe('aprobado')
    expect(veredicto.excepcionAplicada).toBe('en línea')
  })

  it('esa excepción no se aplica a un control que no está en línea', () => {
    const control: ControlInteractivo = { nombre: 'Botón pequeño', anchoPx: 16, altoPx: 18, enLinea: false }

    const veredicto = evaluarAreaTactil(control)

    expect(veredicto.excepcionAplicada).not.toBe('en línea')
    expect(veredicto.veredicto).toBe('suspenso')
  })
})

describe('@s14 un control pequeño con separación suficiente queda exento por la excepción de espaciado', () => {
  it('menor de 24x24 con la excepción de espaciado: aprobado, y el diámetro empleado es exactamente 24', () => {
    const control: ControlInteractivo = {
      nombre: 'Icono con separación',
      anchoPx: 20,
      altoPx: 20,
      cumpleExcepcionEspaciado: true,
    }

    const veredicto = evaluarAreaTactil(control)

    expect(veredicto.veredicto).toBe('aprobado')
    expect(veredicto.excepcionAplicada).toBe('espaciado')
    expect(veredicto.diametroEmpleadoPx).toBe(24)
  })
})

describe('@s15 con el inventario de controles interactivos vacío la puerta falla cerrada', () => {
  it('0 controles medidos, suspenso, declara que no midió ninguno, pese a 0 violaciones', () => {
    const informe = ejecutarPuertaDeAreaTactil([])

    expect(informe.controlesMedidos).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toMatch(/ningún control/)
    expect(informe.suspensos).toEqual([])
  })
})
