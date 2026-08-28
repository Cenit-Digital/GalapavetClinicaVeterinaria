import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectorPaleta } from './SelectorPaleta'
// Texto REAL de la hoja de estilos (patrón `?raw`, `vite.config.ts:80`: la
// query `?raw` recibe el fichero SIN pasar por el proxy de CSS Modules) para
// anclar @s37 al marcado de la propia regla, no a un literal reinventado.
import textoDeLaHojaDeEstilos from './SelectorPaleta.module.scss?raw'

/** Centraliza el render de `SelectorPaleta` bajo test. */
function renderizarSelectorPaleta(
  props: React.ComponentProps<typeof SelectorPaleta> = {},
): ReturnType<typeof render> {
  return render(<SelectorPaleta {...props} />)
}

describe('@s1 el selector se ofrece cerrado al cargar la página', () => {
  it('existe el botón "Cambiar paleta de color" con aria-expanded "false" y sin panel abierto', () => {
    renderizarSelectorPaleta()

    const boton = screen.getByRole('button', { name: 'Cambiar paleta de color' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('group', { name: 'Paleta de color' })).not.toBeInTheDocument()
  })
})

describe('@s2 abrir el panel lista exactamente las cinco variantes del sistema', () => {
  it('el botón pasa a aria-expanded "true" y el grupo lista los 5 nombres esperados', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()

    const boton = screen.getByRole('button', { name: 'Cambiar paleta de color' })
    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'true')

    const grupo = screen.getByRole('group', { name: 'Paleta de color' })
    const botonesDeVariante = within(grupo).getAllByRole('button')
    expect(botonesDeVariante).toHaveLength(5)

    const nombres = botonesDeVariante.map((elemento) => elemento.textContent ?? '')
    for (const esperado of ['Clínica', 'Cálida', 'Tech', 'Eco', 'Marca Galapavet']) {
      expect(nombres.filter((nombre) => nombre.includes(esperado))).toHaveLength(1)
    }
  })
})

describe('@s3 volver a pulsar el botón flotante cierra el panel', () => {
  it('aria-expanded vuelve a "false" y el grupo deja de existir', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()

    const boton = screen.getByRole('button', { name: 'Cambiar paleta de color' })
    await usuario.click(boton)
    expect(screen.getByRole('group', { name: 'Paleta de color' })).toBeInTheDocument()

    await usuario.click(boton)

    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('group', { name: 'Paleta de color' })).not.toBeInTheDocument()
  })
})

describe('@s4 las muestras de color no ensucian el nombre accesible de la variante', () => {
  it('cada botón de variante trae 3 muestras aria-hidden y su nombre accesible empieza por el nombre de la variante', async () => {
    const usuario = userEvent.setup()
    const { container } = renderizarSelectorPaleta()

    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))

    const grupo = screen.getByRole('group', { name: 'Paleta de color' })
    const botonesDeVariante = within(grupo).getAllByRole('button')
    expect(botonesDeVariante).toHaveLength(5)

    for (const nombre of ['Clínica', 'Cálida', 'Tech', 'Eco', 'Marca Galapavet']) {
      const boton = within(grupo).getByRole('button', { name: new RegExp('^' + nombre) })
      const muestras = boton.querySelector('[data-muestra-variante]')
      expect(muestras?.children).toHaveLength(3)
    }

    expect(container.querySelectorAll('[data-muestra-variante]')).toHaveLength(5)
  })
})

describe('@s5 sin preferencia guardada la variante activa es clínica', () => {
  it('data-variante vale "clinica", el botón "Clínica" está presionado y los otros 4 no', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))

    expect(document.documentElement).toHaveAttribute('data-variante', 'clinica')

    const grupo = screen.getByRole('group', { name: 'Paleta de color' })
    const botonMarca = within(grupo).getByRole('button', { name: /^Clínica/ })
    expect(botonMarca).toHaveAttribute('aria-pressed', 'true')

    const otros = within(grupo)
      .getAllByRole('button')
      .filter((elemento) => elemento !== botonMarca)
    expect(otros).toHaveLength(4)
    for (const boton of otros) {
      expect(boton).toHaveAttribute('aria-pressed', 'false')
    }
  })
})

describe('@s6 elegir una variante la aplica de inmediato y traslada la marca de activa', () => {
  it('data-variante pasa a "tech", el botón "Tech" queda presionado y es el único', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })

    await usuario.click(within(grupo).getByRole('button', { name: /^Tech/ }))

    expect(document.documentElement).toHaveAttribute('data-variante', 'tech')
    const presionados = within(grupo)
      .getAllByRole('button')
      .filter((elemento) => elemento.getAttribute('aria-pressed') === 'true')
    expect(presionados).toHaveLength(1)
    expect(presionados[0]).toHaveAccessibleName(/^Tech/)
  })
})

describe('@s7 elegir una variante la guarda en el almacenamiento del navegador', () => {
  it('el almacenamiento local contiene solo la clave "galapavet-variante" con el texto exacto "tech"', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })

    await usuario.click(within(grupo).getByRole('button', { name: /^Tech/ }))

    expect(window.localStorage.getItem('galapavet-variante')).toBe('tech')
    expect(Object.keys(window.localStorage)).toEqual(['galapavet-variante'])
  })
})

describe('@s8 la variante elegida se recuerda en la siguiente visita', () => {
  it('con "eco" ya guardado, data-variante vale "eco" y "Eco" queda presionado al abrir', async () => {
    window.localStorage.setItem('galapavet-variante', 'eco')
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()

    expect(document.documentElement).toHaveAttribute('data-variante', 'eco')

    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })
    expect(within(grupo).getByRole('button', { name: /^Eco/ })).toHaveAttribute('aria-pressed', 'true')
  })
})

describe('@s15 el almacenamiento que lanza al escribir no rompe el cambio de variante', () => {
  it('data-variante cambia, el botón queda presionado y la interacción no lanza', async () => {
    const espiaEscritura = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('cuota excedida')
    })
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })

    await usuario.click(within(grupo).getByRole('button', { name: /^Tech/ }))

    expect(document.documentElement).toHaveAttribute('data-variante', 'tech')
    expect(within(grupo).getByRole('button', { name: /^Tech/ })).toHaveAttribute('aria-pressed', 'true')

    espiaEscritura.mockRestore()
  })
})

describe('@s16 sin variantes en el catálogo el selector no se renderiza', () => {
  it('no existe el botón "Cambiar paleta de color" y data-variante vale "clinica"', () => {
    renderizarSelectorPaleta({ catalogo: [] })

    expect(screen.queryByRole('button', { name: 'Cambiar paleta de color' })).not.toBeInTheDocument()
    expect(document.documentElement).toHaveAttribute('data-variante', 'clinica')
  })
})

// @s37 de `features/rediseno_visual.feature:571-578`. Las otras tres cláusulas
// del escenario («ofrece exactamente cinco variantes», «la activa es la que
// el documento tiene aplicada» y «al elegir una variante el documento la
// aplica y la recuerda para la siguiente visita») ya están cubiertas por los
// tests de arriba, heredados de `selector_paleta.feature` (ya `done`) y
// verificados con sabotaje en su día:
//   - «exactamente cinco variantes»                → @s2 (línea 24)
//   - «la activa es la que el documento tiene aplicada» → @s5 (línea 82), @s6 (línea 104), @s8 (línea 136)
//   - «la aplica y la recuerda para la siguiente visita» → @s6 (aplica), @s7 (guarda, línea 122), @s8
//     (recuerda) de este fichero, y @s9/@s10 de `SelectorPaleta-logica.test.ts` (el gemelo puro que
//     resuelve la variante ANTES del primer pintado)
// No se duplican aquí. La única cláusula sin test propio hasta hoy es la de
// las MUESTRAS, que es lo que sigue.

describe('@s37 la muestra de cada variante lleva el identificador de ESA variante, no uno compartido', () => {
  // Catálogo real de `src/data/variantesPaleta.ts`, copiado a mano id por id
  // (doble anclaje: NO se compara contra el símbolo `variante.id` importado
  // de producción). Si el marcado hardcodeara un único id para las 5
  // muestras, la comparación de la segunda variante en adelante fallaría.
  const VARIANTES_ESPERADAS_EN_ORDEN = [
    { nombre: 'Clínica', id: 'clinica' },
    { nombre: 'Cálida', id: 'calida' },
    { nombre: 'Tech', id: 'tech' },
    { nombre: 'Eco', id: 'eco' },
    { nombre: 'Marca Galapavet', id: 'marca' },
  ] as const
  const TOTAL_DE_VARIANTES = 5

  it('el "data-muestra-variante" de cada botón coincide con el id real de esa variante, y los 5 son distintos entre sí', async () => {
    const usuario = userEvent.setup()
    renderizarSelectorPaleta()
    await usuario.click(screen.getByRole('button', { name: 'Cambiar paleta de color' }))
    const grupo = screen.getByRole('group', { name: 'Paleta de color' })

    const idsEncontrados: string[] = []
    for (const { nombre, id } of VARIANTES_ESPERADAS_EN_ORDEN) {
      const boton = within(grupo).getByRole('button', { name: new RegExp('^' + nombre) })
      const contenedorDeMuestras = boton.querySelector('[data-muestra-variante]')
      expect(contenedorDeMuestras).toHaveAttribute('data-muestra-variante', id)
      idsEncontrados.push(id)
    }

    // Anti-vacuidad: el bucle recorrió las 5, y los 5 ids son distintos entre
    // sí (si estuvieran hardcodeados a uno solo, este `Set` valdría 1).
    expect(idsEncontrados).toHaveLength(TOTAL_DE_VARIANTES)
    expect(new Set(idsEncontrados).size).toBe(TOTAL_DE_VARIANTES)
  })
})

describe('@s37 las muestras se pintan leyendo los tokens de su variante, no un color escrito aparte', () => {
  // Los tres roles que pinta cada muestra, en el ORDEN en que las declara el
  // marcado (`SelectorPaleta.tsx`: primario, acento, urgencia). Literal
  // escrito a mano, confrontado contra el TEXTO REAL de la hoja de estilos.
  const ROLES_ESPERADOS_EN_ORDEN = ['--color-primario', '--color-acento', '--color-urgencia']
  const NUMERO_DE_REGLAS_DE_MUESTRA = 3

  it('las tres reglas ".muestra:nth-child(n)" leen "var(--color-...)" de la variante, ningún hexadecimal escrito a mano', () => {
    const patronReglaDeMuestra = /\.muestra:nth-child\(\d\)\s*\{\s*background-color:\s*var\((--color-[a-z-]+)\)/g
    const coincidencias = [...textoDeLaHojaDeEstilos.matchAll(patronReglaDeMuestra)]

    expect(coincidencias).toHaveLength(NUMERO_DE_REGLAS_DE_MUESTRA)
    expect(coincidencias.map((coincidencia) => coincidencia[1])).toEqual(ROLES_ESPERADOS_EN_ORDEN)

    // Sobre el bloque ".muestras { … }" completo: ningún "#RRGGBB" escrito a
    // mano. Si apareciera uno, sería una lista de colores paralela a los
    // tokens de `_tokens.scss` — justo lo que @s37 prohíbe.
    const indiceDelBloque = textoDeLaHojaDeEstilos.indexOf('.muestras')
    expect(indiceDelBloque).toBeGreaterThan(-1)
    const bloqueDeMuestras = textoDeLaHojaDeEstilos.slice(indiceDelBloque)
    expect(bloqueDeMuestras).not.toMatch(/#[0-9a-fA-F]{6}/)
  })
})
