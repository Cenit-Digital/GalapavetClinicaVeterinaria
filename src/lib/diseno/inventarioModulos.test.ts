import { describe, expect, it } from 'vitest'
import { ejecutarPuertaDeLiteralesColor } from '../puertaLiteralesColor'
import { INVENTARIO_MODULOS_CON_ESTILOS, comprobarCoLocalizacion } from './inventarioModulos'

describe('@s21 el inventario de módulos con maquetación propia coincide con la lista escrita a mano de 17 nombres', () => {
  it('12 componentes + 5 páginas, sin MetadatosPagina', () => {
    // Literal escrito a mano — NO se obtiene del inventario que se comprueba (patrón doble-de-test-anclado-al-literal).
    const nombresAMano = [
      'Cabecera',
      'CampanasPortada',
      'Equipo',
      'Faq',
      'FormularioContacto',
      'Galeria',
      'Hero',
      'InformacionContacto',
      'PieDePagina',
      'ReservaChat',
      'SelectorPaleta',
      'Servicios',
      'Landing',
      'PaginaBlog',
      'PaginaCampanas',
      'PaginaNoEncontrada',
      'PaginaTienda',
    ]

    const nombresDelInventario = INVENTARIO_MODULOS_CON_ESTILOS.map((modulo) => modulo.nombre)

    expect(nombresDelInventario).toHaveLength(nombresAMano.length)
    for (const nombre of nombresDelInventario) {
      expect(nombresAMano).toContain(nombre)
    }
    for (const nombre of nombresAMano) {
      expect(nombresDelInventario).toContain(nombre)
    }
    expect(nombresDelInventario).not.toContain('MetadatosPagina')
  })
})

describe('@s23 con el inventario de módulos vacío la comprobación de co-localización falla cerrada', () => {
  it('0 módulos comprobados, veredicto suspenso, nunca "pasa" por vacuidad', () => {
    const informe = comprobarCoLocalizacion([], [])

    expect(informe.modulosComprobados).toBe(0)
    expect(informe.pasa).toBe(false)
    expect(informe.faltantes).toEqual([])
    expect(informe.motivo).toMatch(/no se comprobó ningún módulo/i)
  })
})

describe('un módulo del inventario sin su fichero de estilos co-localizado se señala como faltante', () => {
  it('inventario real + un nombre inventado: pasa false, faltantes con ese nombre, comprobados = longitud del inventario', () => {
    const rutasReales = [
      ...Object.keys(import.meta.glob('../../components/*.module.scss')),
      ...Object.keys(import.meta.glob('../../pages/*.module.scss')),
    ]
    const inventarioConAusente = [...INVENTARIO_MODULOS_CON_ESTILOS, { nombre: 'ModuloQueNoExiste', carpeta: 'components' as const }]

    const informe = comprobarCoLocalizacion(inventarioConAusente, rutasReales)

    expect(informe.pasa).toBe(false)
    expect(informe.faltantes).toEqual(['ModuloQueNoExiste'])
    expect(informe.modulosComprobados).toBe(inventarioConAusente.length)
  })
})

describe('@s22 cada nombre del inventario tiene su propio fichero de estilos co-localizado junto a su componente', () => {
  it('los 17 módulos reales tienen su Módulo.module.scss, y se comprobaron los 17', () => {
    const rutasReales = [
      ...Object.keys(import.meta.glob('../../components/*.module.scss')),
      ...Object.keys(import.meta.glob('../../pages/*.module.scss')),
    ]

    const informe = comprobarCoLocalizacion(INVENTARIO_MODULOS_CON_ESTILOS, rutasReales)

    expect(informe.modulosComprobados).toBe(17)
    expect(informe.pasa).toBe(true)
    expect(informe.faltantes).toHaveLength(0)
  })
})

describe('@s24 ningún fichero de estilos del inventario declara un color literal fuera de los tokens', () => {
  it('los 17 ficheros reales pasan la puerta de literales de color ya construida por tokens_marca.feature', () => {
    // Reutiliza `ejecutarPuertaDeLiteralesColor` tal cual (ya `done`, ya probada al 100 % por
    // tokens_marca.feature @s18-@s22): solo se le aplica el inventario REAL de esta feature.
    const ficherosReales = {
      ...import.meta.glob('../../components/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
      ...import.meta.glob('../../pages/*.module.scss', { eager: true, query: '?raw', import: 'default' }),
    } as Record<string, string>

    const ficheros = Object.entries(ficherosReales).map(([ruta, contenido]) => ({ ruta, contenido }))
    const informe = ejecutarPuertaDeLiteralesColor(ficheros)

    expect(informe.ficherosInspeccionados).toBe(17)
    expect(informe.señalados).toHaveLength(0)
    expect(informe.pasa).toBe(true)
  })
})
