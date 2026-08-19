import { describe, expect, it } from 'vitest'
import { ejecutarPuertaDeContraste } from './contraste'
import { catalogoDeContraste, coloresDeMarca } from './tokens'

describe('@s1 los tres colores de marca se declaran con el hexadecimal exacto del logo', () => {
  it('declara el morado, el lima y el verde profundo con su hexadecimal exacto', () => {
    expect(coloresDeMarca.morado).toBe('#77286B')
    expect(coloresDeMarca.lima).toBe('#B4C718')
    expect(coloresDeMarca.verdeProfundo).toBe('#48704B')
  })

  it('declara exactamente 3 colores de marca, ni uno más ni uno menos', () => {
    expect(Object.keys(coloresDeMarca)).toHaveLength(3)
  })
})

describe('@s16 toda pareja color/fondo declarada alcanza el mínimo del uso que declara', () => {
  it('la puerta pasa e informa del ratio de cada pareja del catálogo del proyecto', () => {
    const informe = ejecutarPuertaDeContraste(catalogoDeContraste)

    expect(informe.pasa).toBe(true)
    expect(informe.parejasEvaluadas).toBeGreaterThan(0)

    const porUso = (uso: string) => informe.parejas.filter((par) => par.uso === uso)

    const textoNormal = porUso('texto normal')
    expect(textoNormal.length).toBeGreaterThan(0)
    expect(textoNormal.every((par) => par.ratio >= 4.5)).toBe(true)

    const textoGrande = porUso('texto grande')
    expect(textoGrande.length).toBeGreaterThan(0)
    expect(textoGrande.every((par) => par.ratio >= 3)).toBe(true)

    const componente = porUso('componente de interfaz o borde de foco')
    expect(componente.length).toBeGreaterThan(0)
    expect(componente.every((par) => par.ratio >= 3)).toBe(true)
  })

  it('el catálogo no declara ningún uso para la pareja "#48704B" sobre "#B4C718"', () => {
    const parExcluida = catalogoDeContraste.find(
      (par) => par.color === '#48704B' && par.fondo === '#B4C718',
    )
    expect(parExcluida).toBeUndefined()
  })

  it('refuerzo mutación: el catálogo declara exactamente 3 parejas de "texto normal", 1 de "texto grande" y 1 de "componente de interfaz o borde de foco"', () => {
    const informe = ejecutarPuertaDeContraste(catalogoDeContraste)
    const porUso = (uso: string) => informe.parejas.filter((par) => par.uso === uso)

    expect(porUso('texto normal')).toHaveLength(3)
    expect(porUso('texto grande')).toHaveLength(1)
    expect(porUso('componente de interfaz o borde de foco')).toHaveLength(1)
  })
})
