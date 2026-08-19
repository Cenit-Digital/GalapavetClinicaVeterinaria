import { describe, expect, it } from 'vitest'
import { ejecutarPuertaTelefonoHardcodeado } from './puertaTelefonoHardcodeado'

/**
 * Todos los ficheros de código de la web, salvo los ficheros de test (@s19):
 * el propio código fuente real del repositorio en este momento de la sesión,
 * leído en crudo por Vite (sin `node:fs`: `tsconfig.app.json` no incluye los
 * tipos de Node y no se toca por ser configuración, no producción).
 */
const FICHEROS_DE_CODIGO_REALES = import.meta.glob(
  ['/src/**/*.{ts,tsx}', '!/src/**/*.test.{ts,tsx}', '!/src/test/**'],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

describe('@s19 ningún módulo de la web escribe un teléfono a mano fuera de la fuente única', () => {
  it('la única coincidencia real está en site.ts, y no aparecen los teléfonos falsos del prototipo heredado', () => {
    const ficheros = Object.entries(FICHEROS_DE_CODIGO_REALES).map(([ruta, contenido]) => ({ ruta, contenido }))

    const informe = ejecutarPuertaTelefonoHardcodeado(ficheros)

    expect(informe.hallazgos.length).toBeGreaterThan(0)
    expect(informe.hallazgos.every((hallazgo) => hallazgo.ruta.endsWith('/lib/site.ts'))).toBe(true)
    // refuerzo mutación: hay exactamente 3 teléfonos reales en site.ts (clínica, móvil, urgencias);
    // sin la bandera global del patrón, `match()` solo encontraría el primero.
    expect(informe.hallazgos).toHaveLength(3)
    // refuerzo mutación: con hallazgos reales, la puerta no debe pasar.
    expect(informe.pasa).toBe(false)

    for (const contenido of Object.values(FICHEROS_DE_CODIGO_REALES)) {
      expect(contenido).not.toContain('640221190')
      expect(contenido).not.toContain('918442160')
    }
  })

  it('refuerzo mutación: con ficheros inspeccionados pero sin ningún hallazgo, la puerta pasa', () => {
    // Distingue el mutante `pasa: false` (siempre falla) del comportamiento real: el otro test
    // de este bloque tiene hallazgos (3 teléfonos reales) y por tanto `pasa` correcto ya es
    // `false`, así que ese caso no basta para matar un mutante que hardcodea `false` siempre.
    const ficheros = [{ ruta: '/src/lib/ejemplo.ts', contenido: 'ningún teléfono en este fichero' }]

    const informe = ejecutarPuertaTelefonoHardcodeado(ficheros)

    expect(informe.hallazgos).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })
})

describe('@s20 la puerta anti-teléfono-hardcodeado falla si no inspecciona ningún fichero', () => {
  it('con 0 ficheros falla, declara "0 ficheros" y no informa de que no encontró ningún teléfono hardcodeado', () => {
    const informe = ejecutarPuertaTelefonoHardcodeado([])

    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toContain('0 ficheros')
    expect(informe.motivo).not.toMatch(/no encontr/i)
    expect(informe.hallazgos).toHaveLength(0)
  })
})
