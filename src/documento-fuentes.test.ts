/**
 * Aserciones sobre el TEXTO REAL de "index.html" que exigen la precarga de
 * las dos fuentes de marca (@s19 de `identidad_visual.feature`). Mismo patrón
 * que `src/documento.test.ts`: import "?raw" de Vite, sin tocar `node:fs` ni
 * ejecutar el documento.
 */
import { describe, expect, it } from 'vitest'
import htmlIndice from '../index.html?raw'

const PATRON_LINK_PRELOAD = /<link\s+[^>]*rel="preload"[^>]*>/g

function etiquetasDePrecarga(): readonly string[] {
  return [...htmlIndice.matchAll(PATRON_LINK_PRELOAD)].map((coincidencia) => coincidencia[0])
}

describe('@s19 el documento precarga exactamente las dos fuentes, con crossorigin, y nada más', () => {
  it('existen exactamente 2 etiquetas "link" con "rel=preload" y "as=font"', () => {
    const precargasDeFuente = etiquetasDePrecarga().filter((etiqueta) => etiqueta.includes('as="font"'))

    expect(precargasDeFuente).toHaveLength(2)
  })

  it('ambas declaran "type=font/woff2" y el atributo "crossorigin"', () => {
    for (const etiqueta of etiquetasDePrecarga()) {
      expect(etiqueta).toContain('type="font/woff2"')
      expect(etiqueta).toContain('crossorigin')
    }
  })

  it('no existe ninguna otra etiqueta de precarga en el documento', () => {
    expect(etiquetasDePrecarga()).toHaveLength(2)
  })

  it('el documento no contiene ninguna referencia a "fonts.googleapis.com" ni a "fonts.gstatic.com"', () => {
    expect(htmlIndice).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/)
  })
})
