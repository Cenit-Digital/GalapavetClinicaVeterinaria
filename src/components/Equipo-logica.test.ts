import { describe, expect, it, vi } from 'vitest'
import {
  especialidadesVisibles,
  hayFormacionPublicada,
  inicialesDe,
  profesionalesValidos,
  recuentoEnLetra,
  resumenDelEquipo,
  rotuloBoton,
  tieneFormacion,
} from './Equipo-logica'

/**
 * Devuelve el módulo RE-EVALUADO dentro del cuerpo del test, no la instancia
 * que se importó al cargar el fichero.
 *
 * Sus constantes de módulo (`RECUENTOS_EN_LETRA` en `Equipo-logica.ts:51`,
 * `PISTA_DE_FORMACION` en `:58`) se evalúan al importar, así que StrykerJS las
 * clasifica como mutantes *estáticos*: acotando la medición con `--testFiles`
 * los planifica con `mutantActivation: 'runtime'` (activa el mutante en un
 * `beforeAll`, con el módulo ya importado) y el literal vaciado no llega a
 * evaluarse nunca — el mutante sobrevive aunque la aserción lo detectaría.
 * Volver a importar aquí dentro sí lo evalúa. Mismo patrón que
 * `src/lib/site.reimportacion.test.ts` para los teléfonos reales; ver
 * `progress/mutation_fidelidad_equipo.md`.
 */
async function recargarEquipoLogica() {
  vi.resetModules()
  return import('./Equipo-logica')
}

describe('rotuloBoton devuelve el nombre accesible del botón según el estado (apoyo de @s3/@s4/@s5/@s6)', () => {
  it('colapsado (false) es "Ver la formación de <nombre>"', () => {
    expect(rotuloBoton(false, 'Marcos Pérez')).toBe('Ver la formación de Marcos Pérez')
  })

  it('desplegado (true) es "Ocultar la formación de <nombre>"', () => {
    expect(rotuloBoton(true, 'Marcos Pérez')).toBe('Ocultar la formación de Marcos Pérez')
  })
})

describe('tieneFormacion (apoyo de @s3/@s7)', () => {
  it('un profesional con formación publicada es verdadero', () => {
    expect(tieneFormacion('Licenciado en veterinaria por la Universidad Complutense de Madrid')).toBe(true)
  })

  it('un profesional sin formación publicada (undefined) es falso', () => {
    expect(tieneFormacion(undefined)).toBe(false)
  })
})

describe('inicialesDe toma la primera letra de las dos primeras palabras del nombre real (apoyo de @s32)', () => {
  it('con nombre y un apellido, devuelve las dos iniciales, nunca solo la primera', () => {
    expect(inicialesDe('Marcos Pérez')).toBe('MP')
  })

  it('con nombre y apellido distintos, devuelve las iniciales de ambos', () => {
    expect(inicialesDe('Joaquín Herranz')).toBe('JH')
  })

  it('con dos apellidos, se queda solo con el nombre y el PRIMER apellido, no con el segundo', () => {
    expect(inicialesDe('Ana María López García')).toBe('AM')
  })

  it('con una sola palabra, devuelve solo esa inicial, sin reventar', () => {
    expect(inicialesDe('Fideo')).toBe('F')
  })

  it('con espacios sobrantes en los extremos, descarta las cadenas vacías del split en vez de tomarlas como palabra', () => {
    expect(inicialesDe('  Ana María')).toBe('AM')
  })

  it('con dos o más espacios seguidos entre palabras, sigue tomando la primera letra de cada palabra real, no de un hueco', () => {
    expect(inicialesDe('Ana   María')).toBe('AM')
  })

  it('con dos espacios seguidos, la segunda inicial es la del apellido, nunca la de un hueco', () => {
    expect(inicialesDe('Marcos  Pérez')).toBe('MP')
  })

  it('con un tabulador como separador, también devuelve las dos iniciales reales', () => {
    expect(inicialesDe('Marcos\tPérez')).toBe('MP')
  })
})

describe('profesionalesValidos descarta los profesionales sin nombre (apoyo de @s9)', () => {
  it('un profesional con nombre vacío entre dos válidos queda fuera, el resto conserva su orden', () => {
    expect(
      profesionalesValidos([
        { nombre: 'Uno', rol: 'Rol' },
        { nombre: '', rol: 'Rol' },
        { nombre: 'Dos', rol: 'Rol' },
      ]),
    ).toEqual([
      { nombre: 'Uno', rol: 'Rol' },
      { nombre: 'Dos', rol: 'Rol' },
    ])
  })
})

/**
 * `features/fidelidad_equipo.feature` @s1: el párrafo de la cabecera deriva
 * su recuento del listado real y nunca copia el copy del prototipo («Seis
 * profesionales colegiados que verás siempre por aquí»). Cada literal va
 * tecleado a mano para que la mutación de cadenas muerda.
 */
describe('recuentoEnLetra escribe en letra los recuentos cortos de la cabecera (apoyo de @s1 de fidelidad_equipo)', () => {
  it('1 se escribe "Un"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(1)).toBe('Un')
  })

  it('2 se escribe "Dos"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(2)).toBe('Dos')
  })

  it('3 se escribe "Tres"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(3)).toBe('Tres')
  })

  it('4 se escribe "Cuatro"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(4)).toBe('Cuatro')
  })

  it('5 se escribe "Cinco"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(5)).toBe('Cinco')
  })

  it('6 se escribe "Seis"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(6)).toBe('Seis')
  })

  it('7 se escribe "Siete"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(7)).toBe('Siete')
  })

  it('8 se escribe "Ocho"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(8)).toBe('Ocho')
  })

  it('9 se escribe "Nueve"', async () => {
    const { recuentoEnLetra: recuentoEnLetraRecargado } = await recargarEquipoLogica()

    expect(recuentoEnLetraRecargado(9)).toBe('Nueve')
  })

  it('a partir de diez se escribe en cifra, sin inventar una palabra', () => {
    expect(recuentoEnLetra(10)).toBe('10')
  })
})

describe('resumenDelEquipo deriva el párrafo de la cabecera del recuento real (apoyo de @s1 de fidelidad_equipo)', () => {
  it('con dos profesionales y formación publicada, cuenta en letra e invita a pulsar el +', () => {
    expect(resumenDelEquipo(2, true, 'Galapavet')).toBe(
      'Dos profesionales en el equipo de Galapavet. Pulsa el + para ver la formación publicada.',
    )
  })

  it('sin ninguna formación publicada, no invita a pulsar un + que no existe', () => {
    expect(resumenDelEquipo(2, false, 'Galapavet')).toBe('Dos profesionales en el equipo de Galapavet.')
  })

  it('con un solo profesional, concuerda en singular', () => {
    expect(resumenDelEquipo(1, false, 'Galapavet')).toBe('Un profesional en el equipo de Galapavet.')
  })

  it('con diez o más, mantiene el plural con la cifra', () => {
    expect(resumenDelEquipo(10, false, 'Galapavet')).toBe('10 profesionales en el equipo de Galapavet.')
  })

  it('sin profesionales, no hay párrafo que derivar', () => {
    expect(resumenDelEquipo(0, false, 'Galapavet')).toBe('')
  })

  it('el nombre comercial viene de fuera: nunca lo teclea la función', () => {
    expect(resumenDelEquipo(2, false, 'Otra clínica')).toBe('Dos profesionales en el equipo de Otra clínica.')
  })

  it('el párrafo completo, pista de formación incluida, es exactamente el texto esperado', async () => {
    const { resumenDelEquipo: resumenDelEquipoRecargado } = await recargarEquipoLogica()

    expect(resumenDelEquipoRecargado(2, true, 'Galapavet')).toBe(
      'Dos profesionales en el equipo de Galapavet. Pulsa el + para ver la formación publicada.',
    )
  })
})

describe('hayFormacionPublicada decide si la cabecera puede invitar a pulsar el + (apoyo de @s1 de fidelidad_equipo)', () => {
  it('es verdadero si al menos un profesional tiene formación publicada', () => {
    expect(
      hayFormacionPublicada([
        { nombre: 'Uno', rol: 'Rol' },
        { nombre: 'Dos', rol: 'Rol', formacion: 'Formación de Dos' },
      ]),
    ).toBe(true)
  })

  it('es falso si ninguno la tiene', () => {
    expect(
      hayFormacionPublicada([
        { nombre: 'Uno', rol: 'Rol' },
        { nombre: 'Dos', rol: 'Rol' },
      ]),
    ).toBe(false)
  })

  it('es falso con el listado vacío', () => {
    expect(hayFormacionPublicada([])).toBe(false)
  })
})

/**
 * `fidelidad_equipo` @s3: la fila de chips solo se pinta desde un campo real.
 * Los dos profesionales publicados no lo tienen (`docs/datos-galapavet.md`
 * §9): con ellos la función devuelve la lista vacía y no hay chips.
 */
describe('especialidadesVisibles solo deja pasar especialidades reales del campo opcional (apoyo de @s3 de fidelidad_equipo)', () => {
  it('sin el campo (undefined) no hay ninguna: es el caso de los dos profesionales reales', () => {
    expect(especialidadesVisibles(undefined)).toEqual([])
  })

  it('con la lista vacía, ninguna', () => {
    expect(especialidadesVisibles([])).toEqual([])
  })

  it('descarta las cadenas en blanco y conserva el orden del resto', () => {
    expect(especialidadesVisibles(['Uno', ' ', 'Dos'])).toEqual(['Uno', 'Dos'])
  })

  it('recorta los espacios sobrantes de cada especialidad', () => {
    expect(especialidadesVisibles([' Tres '])).toEqual(['Tres'])
  })
})
