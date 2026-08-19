import { describe, expect, it, vi } from 'vitest'

/**
 * Refuerzo de mutación para `src/lib/site.ts:10-12` (TELEFONO_CLINICA, TELEFONO_MOVIL,
 * TELEFONO_URGENCIAS), ver `progress/mutation_datos_negocio.md`.
 *
 * Este fichero, a propósito, NO importa `./site` de forma estática a nivel de módulo
 * (a diferencia de `site.test.tsx`, que sí lo hace para sus 21 escenarios). Si una de
 * esas tres constantes se vaciara, `crearTelefono` la pasaría a `enlaceLlamada`, que
 * falla cerrado y lanza AL EVALUAR el módulo. Con un import estático de fichero, ese
 * lanzamiento ocurre antes de que arranque ningún test, tumba el fichero entero
 * ("Failed Suites", 0 tests ejecutados) y Stryker no logra atribuir el mutante a ningún
 * test concreto (`static: true`, `testsCompleted: 0`, `coveredBy: []`) pese a que la
 * suite sí detecta el defecto en la práctica.
 *
 * Aquí, en cambio, el único import de `./site` ocurre DENTRO del cuerpo del test, vía
 * `vi.resetModules()` + `import()` dinámico: si el módulo lanza, el que falla es
 * exactamente este test (su promesa `import()` se rechaza), no el fichero completo. La
 * aserción depende de un valor derivado exportado (`textoVisible`), no solo del throw en
 * tiempo de import.
 */
describe('refuerzo mutación: los tres teléfonos reales siguen siendo el dato real al importar site.ts', () => {
  it('el texto visible de telefonoClinica, telefonoMovil y telefonoUrgencias es el dato real del cliente', async () => {
    vi.resetModules()
    const { datosNegocio } = await import('./site')

    expect(datosNegocio.telefonoClinica.textoVisible).toBe('91 082 92 67')
    expect(datosNegocio.telefonoMovil.textoVisible).toBe('685 34 31 49')
    expect(datosNegocio.telefonoUrgencias.textoVisible).toBe('91 851 13 93')
  })
})
