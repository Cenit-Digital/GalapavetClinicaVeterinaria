/**
 * Aserciones sobre el TEXTO REAL de "index.html" para los iconos del sitio
 * (paso 8 de `plan_adaptacion_scss.md`, condición de producción de @s28 de
 * `identidad_visual.feature`: la comprobación de red — 200 y dimensiones —
 * es NAVEGADOR REAL y queda fuera de esta ronda; aquí solo se comprueba que
 * el documento declara los iconos raster reales y que el vectorial, que
 * todavía no existe, queda comentado en vez de apuntar a un fichero 404).
 * Mismo patrón que `src/documento.test.ts`: import "?raw" de Vite.
 */
import { describe, expect, it } from 'vitest'
import htmlIndice from '../index.html?raw'

const PATRON_COMENTARIO_HTML = /<!--[\s\S]*?-->/g

/** El texto del documento sin sus comentarios: lo que el navegador interpreta de verdad. */
function textoActivo(): string {
  return htmlIndice.replace(PATRON_COMENTARIO_HTML, '')
}

describe('(paso 8 del plan) el documento declara los iconos raster reales y deja comentado el vectorial que aún no existe', () => {
  it('la etiqueta del icono vectorial "/favicon.svg" no está activa: vive dentro de un comentario', () => {
    expect(textoActivo()).not.toContain('/favicon.svg')
    expect(htmlIndice).toContain('/favicon.svg')
  })

  it('declara un icono que apunta a "/favicon.ico"', () => {
    expect(textoActivo()).toMatch(/<link\s+[^>]*href="\/favicon\.ico"[^>]*>/)
  })

  it('declara un icono PNG de 32x32 que apunta a "/favicon-32.png"', () => {
    const etiqueta = textoActivo().match(/<link\s+[^>]*href="\/favicon-32\.png"[^>]*>/)?.[0]

    expect(etiqueta).toBeDefined()
    expect(etiqueta).toContain('type="image/png"')
  })

  it('declara el icono de iOS "apple-touch-icon" que apunta a "/apple-touch-icon.png"', () => {
    const etiqueta = textoActivo().match(/<link\s+[^>]*rel="apple-touch-icon"[^>]*>/)?.[0]

    expect(etiqueta).toBeDefined()
    expect(etiqueta).toContain('href="/apple-touch-icon.png"')
  })
})
