import { describe, expect, it } from 'vitest'
import { comprobarMedicionEstable } from './medicionEstable'

/**
 * hero_reducido_con_animacion @s10, EL CABLEADO: la comprobación estática de
 * `medicionEstable.ts` (que tiene sus propias pruebas sobre bloques sintéticos)
 * se aplica aquí a los `*.spec.ts` REALES de `tests/e2e`. Sin este fichero la
 * puerta de @s10 sería una función que nadie llama: un spec nuevo que midiera la
 * portada recién cargada, con la animación en curso, no pondría nada en rojo.
 *
 * Los ficheros se leen del repositorio con `import.meta.glob` y `?raw`, nunca de
 * una lista escrita en esta prueba: un spec nuevo entra solo en la comprobación.
 * Se leen únicamente los `*.spec.ts` (un fichero sin ningún `test(`, como
 * `utilidades.ts`, daría `pasa = false` por la guarda anti-vacuidad).
 */

const SPECS_DE_NAVEGADOR = import.meta.glob('../../../tests/e2e/*.spec.ts', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** El fichero sin ruta ni extensión: «accesibilidad», «fidelidad-hero»… */
function nombreDelSpec(ruta: string): string {
  return (ruta.split('/').pop() ?? ruta).replace(/\.spec\.ts$/, '')
}

const INFORMES = Object.entries(SPECS_DE_NAVEGADOR).map(([ruta, texto]) => ({
  fichero: nombreDelSpec(ruta),
  informe: comprobarMedicionEstable(texto),
}))

/**
 * La lista MÍNIMA de ficheros a los que alcanza la obligación (contrato @s10, «al
 * menos esos y nunca solo esos»), escrita a mano: contados el 13/10/2026 sobre
 * los 27 specs de entonces. Una lista que saliera de la propia comprobación no
 * pondría nada en rojo si la comprobación dejara de alcanzar a un fichero.
 */
const FICHEROS_QUE_ALCANZA_LA_OBLIGACION = [
  'fidelidad-hero',
  'fidelidad-responsive-integral',
  'tipografia',
  'accesibilidad',
] as const

describe('@s10 de hero_reducido_con_animacion: los specs reales de tests/e2e cumplen la regla de la medición estable', () => {
  it('se leen specs de verdad y se inspecciona al menos un bloque test(): la guarda anti-vacuidad', () => {
    const bloquesInspeccionados = INFORMES.reduce((suma, { informe }) => suma + informe.bloquesInspeccionados, 0)

    expect(INFORMES.length).toBeGreaterThan(0)
    expect(bloquesInspeccionados).toBeGreaterThan(0)
  })

  it('ningún bloque test() de ningún spec mide la portada recién cargada con la entrada en curso', () => {
    const incumplimientos = INFORMES.flatMap(({ fichero, informe }) =>
      informe.incumplimientos.map((titulo) => `${fichero}: ${titulo}`),
    )

    expect(incumplimientos).toEqual([])
  })

  it('todos los ficheros leídos pasan la comprobación, ninguno por vacuidad (cada uno tiene bloques)', () => {
    const queNoPasan = INFORMES.filter(({ informe }) => !informe.pasa).map(({ fichero }) => fichero)

    expect(queNoPasan).toEqual([])
  })

  it('la obligación alcanza AL MENOS a los cuatro ficheros de la lista mínima, con algún bloque que la cumple', () => {
    const alcanzados = INFORMES.filter(({ informe }) => informe.bloques.some((bloque) => bloque.veredicto === 'pasa')).map(
      ({ fichero }) => fichero,
    )

    for (const fichero of FICHEROS_QUE_ALCANZA_LA_OBLIGACION) {
      expect(alcanzados, `la obligación de @s10 no alcanza a "${fichero}"`).toContain(fichero)
    }
  })
})
