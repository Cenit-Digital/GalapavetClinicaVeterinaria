import { describe, expect, it } from 'vitest'
import { calcularSolicitudDeDesplazamiento, prefiereMenosMovimiento } from '../components/Galeria-logica'
import { decidirComportamientoDesplazamiento } from './desplazamiento'
import { ejecutarComprobacionDeVisibilidadSinAnimacion, type BloqueQueApareceAnimando } from './accesibilidad-movimiento'
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

describe('@s20 con menos movimiento pedido el contenido que se revelaba animándose está visible', () => {
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
