import { describe, expect, it } from 'vitest'
import { comprobarMedicionEstable, esFicheroDeTestDePlaywright } from './medicionEstable'

/**
 * hero_reducido_con_animacion @s10, EL CABLEADO: la comprobación estática de
 * `medicionEstable.ts` (que tiene sus propias pruebas sobre bloques sintéticos)
 * se aplica aquí a los ficheros de test REALES de `tests/e2e`. Sin este fichero
 * la puerta de @s10 sería una función que nadie llama: un spec nuevo que midiera
 * la portada recién cargada, con la animación en curso, no pondría nada en rojo.
 *
 * Los ficheros se leen del repositorio con `import.meta.glob` y `?raw`, nunca de
 * una lista escrita en esta prueba: un spec nuevo entra solo en la comprobación.
 * Se leen los ficheros que Playwright EJECUTA (su `testMatch` por defecto: cualquier
 * `.spec` o `.test` con extensión js, ts, mjs, mts, cjs, cts, jsx o tsx en cualquier
 * subcarpeta, que `playwright.config.ts` no cambia) y no solo los `*.spec.ts`
 * planos: un `tests/e2e/hero/x.spec.ts`, un `x.test.ts` o un `x.spec.mts` se
 * ejecutan y tienen que inspeccionarse. Un fichero sin ningún `test(`, como
 * `utilidades.ts`, no entra: daría `pasa = false` por la guarda anti-vacuidad.
 */

const CARPETA_DE_LOS_TESTS = 'tests/e2e/'

/** La misma regla que `esFicheroDeTestDePlaywright`, en la sintaxis de glob de Vite (que exige un literal). */
const SPECS_DE_NAVEGADOR = import.meta.glob('../../../tests/e2e/**/*.{spec,test}.{ts,tsx,js,jsx,mts,cts,mjs,cjs}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** TODO lo que hay bajo `tests/e2e`, sin leerlo: solo los nombres, para comprobar que no queda un test fuera. */
const TODOS_LOS_FICHEROS_DE_E2E = Object.keys(import.meta.glob('../../../tests/e2e/**/*'))

/** El fichero sin la carpeta ni la terminación de test: «accesibilidad», «fidelidad-hero», «hero/portada»… */
function nombreDelSpec(ruta: string): string {
  const relativa = ruta.slice(ruta.indexOf(CARPETA_DE_LOS_TESTS) + CARPETA_DE_LOS_TESTS.length)
  return relativa.replace(/\.(?:spec|test)\.[cm]?[jt]sx?$/, '')
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

describe('@s10 de hero_reducido_con_animacion: los tests reales de tests/e2e cumplen la regla de la medición estable', () => {
  it('se leen specs de verdad y se inspecciona al menos un bloque test(): la guarda anti-vacuidad', () => {
    const bloquesInspeccionados = INFORMES.reduce((suma, { informe }) => suma + informe.bloquesInspeccionados, 0)

    expect(INFORMES.length).toBeGreaterThan(0)
    expect(bloquesInspeccionados).toBeGreaterThan(0)
  })

  it('se leen TODOS los ficheros de test que Playwright ejecuta bajo tests/e2e, también los de subcarpetas, ".test" y módulos', () => {
    const queEjecutaPlaywright = TODOS_LOS_FICHEROS_DE_E2E.filter(esFicheroDeTestDePlaywright).toSorted()

    expect(TODOS_LOS_FICHEROS_DE_E2E.length).toBeGreaterThan(0)
    expect(queEjecutaPlaywright.length).toBeGreaterThan(0)
    expect(Object.keys(SPECS_DE_NAVEGADOR).toSorted()).toEqual(queEjecutaPlaywright)
  })

  it('ningún bloque test() de ningún spec mide la portada recién cargada con la entrada en curso', () => {
    const incumplimientos = INFORMES.flatMap(({ fichero, informe }) =>
      informe.incumplimientos.map((titulo) => `${fichero}: ${titulo}`),
    )

    expect(incumplimientos).toEqual([])
  })

  it('ningún test.only() olvidado deja pasar la batería ejecutando un solo test', () => {
    const conOnly = INFORMES.flatMap(({ fichero, informe }) => informe.bloquesConOnly.map((titulo) => `${fichero}: ${titulo}`))

    expect(conOnly).toEqual([])
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
