import React from 'react'
import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { MetadatosPagina } from './MetadatosPagina'

const METADATOS_DE_PRUEBA = { clave: 'prueba', titulo: 'Título de prueba', descripcion: 'Descripción de prueba' }
const DATOS_ESTRUCTURADOS_DE_PRUEBA = { '@context': 'https://schema.org', '@type': ['VeterinaryCare'], name: 'Prueba' }

/** Centraliza el render y usa `React` en posición de tipo (mismo patrón que `PieDePagina.test.tsx`). */
function renderizarMetadatosPagina(props: React.ComponentProps<typeof MetadatosPagina>): ReturnType<typeof render> {
  return render(<MetadatosPagina {...props} />)
}

function metaPorNombre(nombre: string): HTMLMetaElement | null {
  return document.head.querySelector(`meta[name="${nombre}"]`)
}

function metaPorPropiedad(propiedad: string): HTMLMetaElement | null {
  return document.head.querySelector(`meta[property="${propiedad}"]`)
}

beforeEach(() => {
  document.documentElement.setAttribute('lang', 'es-ES')
})

describe('MetadatosPagina fija document.title y la meta description (soporte de @s4/@s5)', () => {
  it('document.title y el contenido de meta[name="description"] son los de la página recibida', () => {
    renderizarMetadatosPagina({ metadatos: METADATOS_DE_PRUEBA, datosEstructurados: DATOS_ESTRUCTURADOS_DE_PRUEBA })

    expect(document.title).toBe('Título de prueba')
    expect(metaPorNombre('description')?.getAttribute('content')).toBe('Descripción de prueba')
  })
})

describe('@s7 cada página publica un único bloque de datos estructurados y es JSON válido', () => {
  it('hay exactamente un <script type="application/ld+json"> y su contenido parsea al objeto recibido', () => {
    renderizarMetadatosPagina({ metadatos: METADATOS_DE_PRUEBA, datosEstructurados: DATOS_ESTRUCTURADOS_DE_PRUEBA })

    const scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts).toHaveLength(1)

    const analizar = (): unknown => JSON.parse(scripts[0]?.textContent ?? '')
    expect(analizar).not.toThrow()
    expect(analizar()).toEqual(DATOS_ESTRUCTURADOS_DE_PRUEBA)
  })

  it('al montar dos páginas sucesivas (navegación) sigue habiendo exactamente un script, con el contenido de la última', () => {
    const primeraVista = renderizarMetadatosPagina({
      metadatos: METADATOS_DE_PRUEBA,
      datosEstructurados: DATOS_ESTRUCTURADOS_DE_PRUEBA,
    })
    primeraVista.unmount()

    const otrosMetadatos = { clave: 'otra', titulo: 'Otro título', descripcion: 'Otra descripción' }
    const otrosDatosEstructurados = { '@context': 'https://schema.org', '@type': ['VeterinaryCare'], name: 'Otra' }
    renderizarMetadatosPagina({ metadatos: otrosMetadatos, datosEstructurados: otrosDatosEstructurados })

    const scripts = document.head.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts).toHaveLength(1)
    expect(JSON.parse(scripts[0]?.textContent ?? '')).toEqual(otrosDatosEstructurados)
    expect(document.title).toBe('Otro título')
  })
})

describe('@s20 Open Graph se declara con el separador de locale que exige su especificación', () => {
  it('declara título, tipo, imagen y url no vacíos, locale "es_ES" con guion bajo, e imagen servida en local', () => {
    renderizarMetadatosPagina({ metadatos: METADATOS_DE_PRUEBA, datosEstructurados: DATOS_ESTRUCTURADOS_DE_PRUEBA })

    const ogTitulo = metaPorPropiedad('og:title')?.getAttribute('content') ?? ''
    const ogTipo = metaPorPropiedad('og:type')?.getAttribute('content') ?? ''
    const ogImagen = metaPorPropiedad('og:image')?.getAttribute('content') ?? ''
    const ogUrl = metaPorPropiedad('og:url')?.getAttribute('content') ?? ''
    const ogLocale = metaPorPropiedad('og:locale')?.getAttribute('content') ?? ''

    for (const valor of [ogTitulo, ogTipo, ogImagen, ogUrl]) {
      expect(valor.trim()).not.toBe('')
    }

    expect(ogLocale).toBe('es_ES')
    expect(ogLocale).not.toBe(document.documentElement.getAttribute('lang'))

    // ogp.me exige que "og:image" sea una URL ABSOLUTA (tipo "URL"), no una
    // ruta relativa (enmienda del 25/08/2026, PENDIENTE 7 de
    // `identidad_visual.feature`). El dominio real es el de GitHub Pages,
    // verificado por el humano con `gh api repos/Cenit-Digital/
    // GalapavetClinicaVeterinaria` (org "Cenit-Digital", repo
    // "GalapavetClinicaVeterinaria"): el host de la Page es siempre el
    // owner en minúsculas, "cenit-digital.github.io".
    expect(ogImagen).toMatch(/^https:\/\//)
    expect(ogImagen.startsWith('https://cenit-digital.github.io/')).toBe(true)
  })
})
