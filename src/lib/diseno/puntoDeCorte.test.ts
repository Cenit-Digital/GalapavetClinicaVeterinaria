import { describe, expect, it } from 'vitest'
import { PUNTO_DE_CORTE_NAVEGACION_PX, esMovil } from '../../components/Cabecera-logica'
import { extraerPuntosDeCorteDeclarados } from './puntoDeCorte'

const TEXTO_CABECERA_SCSS = Object.values(
  import.meta.glob('../../components/Cabecera.module.scss', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>,
)[0] as string

describe('@s25 el punto de corte usado por la maquetación de la cabecera es exactamente el mismo que usa su lógica en JS', () => {
  it('el único punto de corte declarado en Cabecera.module.scss es 1024, igual que PUNTO_DE_CORTE_NAVEGACION_PX', () => {
    const puntosDeCorte = extraerPuntosDeCorteDeclarados(TEXTO_CABECERA_SCSS)

    expect(puntosDeCorte.length).toBeGreaterThan(0)
    expect(new Set(puntosDeCorte).size).toBe(1)
    expect(puntosDeCorte[0]).toBe(PUNTO_DE_CORTE_NAVEGACION_PX)
  })
})

describe('@s26 un punto de corte de CSS un píxel distinto del de JS deja un ancho con las dos ramas en desacuerdo', () => {
  it('esMovil(1024) decide escritorio, pero un punto de corte de CSS de 1025 seguiría aplicando la maquetación de móvil', () => {
    const puntoDeCorteCssHipotetico = PUNTO_DE_CORTE_NAVEGACION_PX + 1
    const anchoDePrueba = 1024

    expect(esMovil(anchoDePrueba)).toBe(false)
    expect(anchoDePrueba < puntoDeCorteCssHipotetico).toBe(true)
  })
})

describe('extraerPuntosDeCorteDeclarados tolera variaciones razonables de formato CSS en @media', () => {
  it('un @media con tipo de medio explícito antes del paréntesis también se reconoce', () => {
    const textoConTipoDeMedio = '@media screen and (min-width: 500px) { .a { color: red; } }'

    expect(extraerPuntosDeCorteDeclarados(textoConTipoDeMedio)).toEqual([500])
  })

  it('espaciado distinto tras los dos puntos (sin espacio o con dos espacios) también se reconoce', () => {
    const sinEspacio = '@media (min-width:500px) { .a { color: red; } }'
    const dosEspacios = '@media (min-width:  500px) { .a { color: red; } }'

    expect(extraerPuntosDeCorteDeclarados(sinEspacio)).toEqual([500])
    expect(extraerPuntosDeCorteDeclarados(dosEspacios)).toEqual([500])
  })
})
