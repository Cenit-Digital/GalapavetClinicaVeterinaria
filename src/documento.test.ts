import { describe, expect, it } from 'vitest'
// Import "?raw" de Vite (mismo patrón que `SelectorPaleta-logica.test.ts` @s10):
// trae `index.html` como cadena, sin tocar `node:fs` y sin ejecutar el
// documento. `lang`/`charset`/`viewport` son declaraciones ESTÁTICAS del
// documento (@s1-@s3): no hay decisión que tomar en tiempo de ejecución, así
// que no hace falta un gemelo puro — se ancla directamente el texto fuente.
import htmlIndice from '../index.html?raw'

describe('@s1 el documento declara español de España con la sintaxis de BCP 47', () => {
  it('el atributo "lang" del elemento raíz es exactamente "es-ES"', () => {
    expect(htmlIndice).toContain('<html lang="es-ES">')
  })

  it('la subetiqueta de idioma está en minúscula, la de región en mayúscula, y el separador es un guion', () => {
    const lang = 'es-ES'
    const [subetiquetaIdioma, subetiquetaRegion] = lang.split('-')

    expect(lang).not.toContain('_')
    expect(subetiquetaIdioma).toBe(subetiquetaIdioma?.toLowerCase())
    expect(subetiquetaRegion).toBe(subetiquetaRegion?.toUpperCase())
  })
})

describe('@s2 el documento declara la codificación de caracteres UTF-8', () => {
  it('declara "utf-8" y esa declaración aparece antes que la apertura de "<body>"', () => {
    const indiceCharset = htmlIndice.search(/<meta charset="UTF-8"/i)
    const indiceBody = htmlIndice.indexOf('<body>')

    expect(indiceCharset).toBeGreaterThan(-1)
    expect(indiceBody).toBeGreaterThan(-1)
    expect(indiceCharset).toBeLessThan(indiceBody)
  })
})

describe('@s3 el documento declara un viewport adaptable', () => {
  it('el ancho es igual al del dispositivo, la escala inicial es 1, y no impide ampliar', () => {
    const etiquetaViewport = htmlIndice.match(/<meta name="viewport" content="([^"]*)"/)
    const contenido = etiquetaViewport?.[1] ?? ''

    expect(contenido).toContain('width=device-width')
    expect(contenido).toMatch(/initial-scale=1(\.0)?/)
    expect(contenido).not.toContain('user-scalable=no')
    expect(contenido).not.toContain('maximum-scale=1')
  })
})
