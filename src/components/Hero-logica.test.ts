import { describe, expect, it } from 'vitest'
import { EQUIPO } from '../data/equipo'
import { GALERIA } from '../data/galeria'
import { SERVICIOS } from '../data/servicios'
import { digitosDe, extraerFragmento } from '../lib/diseno/datosDelSitio'
import { datosNegocio } from '../lib/site'
import { construirCifrasBienvenida } from './Hero-logica'

/** El TEXTO REAL del componente que cablea las cifras, leído en crudo por Vite. */
const TEXTO_REAL_DE_HERO = (
  import.meta.glob('/src/components/Hero.tsx', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>
)['/src/components/Hero.tsx'] as string

/** El nombre accesible REAL de la banda de cifras, escrito a mano (`Hero.tsx`). */
const NOMBRE_DE_LA_BANDA_DE_CIFRAS = 'Resumen de Galapavet'
const MARCA_DE_LA_BANDA_DE_CIFRAS = `aria-label="${NOMBRE_DE_LA_BANDA_DE_CIFRAS}">`

/** La entrada de más con la que se sabotea una fuente para ver si su cifra la sigue. */
const ENTRADA_ANADIDA = 'entrada añadida a la fuente única'

describe('cifras de bienvenida', () => {
  it('@s51 deriva cada cifra de los catálogos reales sin valores escritos a mano', () => {
    expect(construirCifrasBienvenida(['a', 'b'], ['c'], ['d', 'e', 'f'], ['g', 'h'])).toEqual([
      { valor: 2, etiqueta: 'Servicios' },
      { valor: 1, etiqueta: 'Profesionales' },
      { valor: 3, etiqueta: 'Fotos de galería' },
      { valor: 2, etiqueta: 'Franjas horarias' },
    ])
  })

  it('@s51 con el catálogo de servicios y la fuente única REALES, cada cifra es la longitud de su fuente', () => {
    const cifras = construirCifrasBienvenida(SERVICIOS, EQUIPO, GALERIA, datosNegocio.horario)

    expect(cifras).toEqual([
      { valor: SERVICIOS.length, etiqueta: 'Servicios' },
      { valor: EQUIPO.length, etiqueta: 'Profesionales' },
      { valor: GALERIA.length, etiqueta: 'Fotos de galería' },
      { valor: datosNegocio.horario.length, etiqueta: 'Franjas horarias' },
    ])
    // Doble anclado al literal: los cuatro recuentos REALES escritos a mano —
    // 5 servicios y 2 profesionales (`docs/datos-galapavet.md` §5 y §4), 6
    // fotografías de demostración y los 3 tramos de horario que publica el
    // cliente (§3, con los domingos cerrados). Ninguno se lee de la propia
    // lista que se está comprobando.
    expect(cifras.map((cifra) => cifra.valor)).toEqual([5, 2, 6, 3])
  })

  it('@s51 cambiar un dato en cualquiera de las cuatro fuentes cambia SOLO la cifra correspondiente', () => {
    const fuentesReales: readonly (readonly unknown[])[] = [SERVICIOS, EQUIPO, GALERIA, datosNegocio.horario]
    const valoresBase = construirCifrasBienvenida(SERVICIOS, EQUIPO, GALERIA, datosNegocio.horario).map(
      (cifra) => cifra.valor,
    )
    const fuentesSaboteadas: number[] = []

    for (const indice of fuentesReales.keys()) {
      // Se añade UNA entrada a UNA sola fuente; las otras tres se dejan intactas.
      const fuenteSaboteada = (posicion: number): readonly unknown[] => {
        const fuente = fuentesReales[posicion] as readonly unknown[]
        return posicion === indice ? fuente.concat([ENTRADA_ANADIDA]) : fuente
      }

      const valores = construirCifrasBienvenida(
        fuenteSaboteada(0),
        fuenteSaboteada(1),
        fuenteSaboteada(2),
        fuenteSaboteada(3),
      ).map((cifra) => cifra.valor)

      expect(valores).toEqual(valoresBase.map((valor, posicion) => (posicion === indice ? valor + 1 : valor)))
      fuentesSaboteadas.push(indice)
    }

    // Contador anti-vacuidad: las CUATRO fuentes se han saboteado de verdad.
    expect(fuentesSaboteadas).toEqual([0, 1, 2, 3])
  })

  it('@s51 ninguna cifra está escrita a mano en el componente: ni un dígito en la banda ni en la llamada', () => {
    const bandaDeCifras = extraerFragmento(TEXTO_REAL_DE_HERO, MARCA_DE_LA_BANDA_DE_CIFRAS, '</ul>')
    const argumentos = extraerFragmento(TEXTO_REAL_DE_HERO, 'construirCifrasBienvenida(', ')')

    // La banda existe de verdad y es la que pinta las cifras (anti-vacuidad:
    // un fragmento vacío también estaría "sin dígitos").
    expect(bandaDeCifras).toContain('cifra.valor')
    expect(argumentos).not.toBeNull()

    // Ni la banda ni los argumentos contienen un solo dígito: el componente no
    // retipea ningún recuento, solo cablea las cuatro fuentes.
    expect(digitosDe(bandaDeCifras as string)).toEqual([])
    expect(digitosDe(argumentos as string)).toEqual([])

    // Y las cuatro fuentes que recibe son los catálogos reales y el horario de
    // la fuente única, no listas fabricadas dentro del componente.
    const fuentesPasadas = ['SERVICIOS', 'EQUIPO', 'GALERIA', 'horario'].filter((fuente) =>
      (argumentos as string).includes(fuente),
    )
    expect(fuentesPasadas).toEqual(['SERVICIOS', 'EQUIPO', 'GALERIA', 'horario'])
  })
})
