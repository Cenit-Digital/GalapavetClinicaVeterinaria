/**
 * Listado estático de los profesionales que Galapavet publica realmente.
 * Fuente: `docs/datos-galapavet.md` §4 (verificado el 17/08/2026 contra
 * galapavet.com) y `features/equipo.feature` @s1. `formacion` queda
 * `undefined` cuando el cliente no la ha publicado (Joaquín Herranz):
 * no se rellena con un valor plausible.
 */
export interface Profesional {
  readonly nombre: string
  readonly rol: string
  readonly formacion?: string
}

export const EQUIPO: readonly Profesional[] = [
  {
    nombre: 'Marcos Pérez',
    rol: 'Veterinario',
    formacion: 'Licenciado en veterinaria por la Universidad Complutense de Madrid',
  },
  {
    nombre: 'Joaquín Herranz',
    rol: 'Auxiliar',
  },
] as const satisfies readonly Profesional[]
