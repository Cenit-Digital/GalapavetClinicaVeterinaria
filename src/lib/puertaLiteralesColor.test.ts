import { describe, expect, it } from 'vitest'
import { ejecutarPuertaDeLiteralesColor } from './puertaLiteralesColor'

describe('@s18 con todos los módulos consumiendo tokens la puerta pasa e informa de cuántos ficheros inspeccionó', () => {
  it('3 ficheros que solo consumen tokens: sin señalados, informa 3 y pasa', () => {
    const ficheros = [
      { ruta: 'src/components/Boton.module.scss', contenido: '.boton {\n  color: $color-texto;\n}\n' },
      { ruta: 'src/components/Tarjeta.module.scss', contenido: '.tarjeta {\n  background: $color-superficie;\n}\n' },
      { ruta: 'src/components/Enlace.module.scss', contenido: '.enlace {\n  border-color: $color-borde;\n}\n' },
    ]

    const informe = ejecutarPuertaDeLiteralesColor(ficheros)

    expect(informe.señalados).toHaveLength(0)
    expect(informe.ficherosInspeccionados).toBe(3)
    expect(informe.pasa).toBe(true)
  })
})

describe('@s19 un módulo que declara un color hexadecimal literal es señalado con su ruta y su línea', () => {
  it('"#B4C718" en la línea 7 se señala con esa ruta y esa línea, y la puerta falla', () => {
    const contenido = ['.tarjeta {', '  display: flex;', '  padding: 1rem;', '  gap: 0.5rem;', '  border: 1px solid;', '  border-radius: 4px;', '  background: #B4C718;', '}', ''].join('\n')
    const ficheros = [{ ruta: 'src/components/Tarjeta.module.scss', contenido }]

    const informe = ejecutarPuertaDeLiteralesColor(ficheros)

    expect(informe.señalados).toContainEqual({ ruta: 'src/components/Tarjeta.module.scss', linea: 7 })
    expect(informe.pasa).toBe(false)
  })
})

describe('@s20 un color literal escrito en forma funcional o con nombre CSS también es señalado', () => {
  it('"rgb(180, 199, 24)" y "white" se señalan los dos, y la puerta falla', () => {
    const ficheros = [
      { ruta: 'src/components/Etiqueta.module.scss', contenido: '.etiqueta {\n  color: rgb(180, 199, 24);\n}\n' },
      { ruta: 'src/components/Panel.module.scss', contenido: '.panel {\n  background: white;\n}\n' },
    ]

    const informe = ejecutarPuertaDeLiteralesColor(ficheros)

    expect(informe.señalados.map((hallazgo) => hallazgo.ruta)).toEqual(
      expect.arrayContaining(['src/components/Etiqueta.module.scss', 'src/components/Panel.module.scss']),
    )
    expect(informe.pasa).toBe(false)
  })

  it('refuerzo mutación: "hsl(88, 79%, 44%)" (forma funcional sin alfa) también se señala', () => {
    const ficheros = [{ ruta: 'src/components/Aviso.module.scss', contenido: '.aviso {\n  color: hsl(88, 79%, 44%);\n}\n' }]

    const informe = ejecutarPuertaDeLiteralesColor(ficheros)

    expect(informe.señalados).toContainEqual({ ruta: 'src/components/Aviso.module.scss', linea: 2 })
    expect(informe.pasa).toBe(false)
  })

  it('refuerzo mutación: un nombre CSS en mayúsculas ("WHITE") también se señala', () => {
    const ficheros = [{ ruta: 'src/components/Fondo.module.scss', contenido: '.fondo {\n  background: WHITE;\n}\n' }]

    const informe = ejecutarPuertaDeLiteralesColor(ficheros)

    expect(informe.señalados).toContainEqual({ ruta: 'src/components/Fondo.module.scss', linea: 2 })
    expect(informe.pasa).toBe(false)
  })
})

describe('@s21 la puerta de literales de color falla si no inspecciona ningún fichero', () => {
  it('con 0 ficheros falla, declara "0 ficheros" y no dice que no encontró literales', () => {
    const informe = ejecutarPuertaDeLiteralesColor([])

    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toContain('0 ficheros')
    expect(informe.motivo).not.toMatch(/no (se )?encontr[oó]/i)
    expect(informe.señalados).toHaveLength(0)
  })
})

describe('@s22 las palabras clave que no fijan un color no se señalan como literales', () => {
  it('"currentColor", "transparent" e "inherit" no se señalan, y la puerta pasa', () => {
    const contenido = ['.icono {', '  fill: currentColor;', '  background: transparent;', '  color: inherit;', '}', ''].join('\n')
    const ficheros = [{ ruta: 'src/components/Icono.module.scss', contenido }]

    const informe = ejecutarPuertaDeLiteralesColor(ficheros)

    expect(informe.señalados).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })
})
