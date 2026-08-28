import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { Profesional } from '../data/equipo'
import { Equipo } from './Equipo'

/** Centraliza el render de `Equipo` bajo test. */
function renderizarEquipo(props: React.ComponentProps<typeof Equipo> = {}): ReturnType<typeof render> {
  return render(<Equipo {...props} />)
}

/**
 * Listado de prueba con tres profesionales con formación publicada, para
 * comprobar la independencia entre tarjetas (@s8) sin depender de que el
 * catálogo real tenga más de un profesional desplegable.
 */
const LISTADO_TRES_CON_FORMACION: readonly Profesional[] = [
  { nombre: 'Ana Uno', rol: 'Veterinaria', formacion: 'Formación de Ana Uno' },
  { nombre: 'Bea Dos', rol: 'Veterinaria', formacion: 'Formación de Bea Dos' },
  { nombre: 'Ciro Tres', rol: 'Veterinario', formacion: 'Formación de Ciro Tres' },
]

/** Localiza la sección «Equipo» a partir de su encabezado de nivel 2. */
function obtenerSeccionEquipo(): HTMLElement {
  const encabezado = screen.getByRole('heading', { level: 2, name: 'Equipo' })
  const seccion = encabezado.closest('section')
  if (seccion === null) {
    throw new Error('No se encontró el elemento <section> que envuelve el encabezado "Equipo"')
  }
  return seccion
}

/** Localiza la tarjeta de un profesional a partir de su encabezado de nivel 3. */
function obtenerTarjetaDe(nombre: string): HTMLElement {
  const encabezado = screen.getByRole('heading', { level: 3, name: nombre })
  const tarjeta = encabezado.closest('article')
  if (tarjeta === null) {
    throw new Error(`No se encontró el elemento <article> que envuelve el encabezado "${nombre}"`)
  }
  return tarjeta
}

/**
 * Texto que la tarjeta expone a la capa de accesibilidad: su `textContent`
 * menos todo subárbol marcado `aria-hidden="true"`.
 *
 * `textContent` a secas no sirve para contratar esto: `features/equipo.feature:118`
 * exige que el TEXTO ACCESIBLE de la tarjeta de "Joaquín Herranz" se limite a
 * su nombre y su rol, y el avatar de iniciales que impone el rediseño
 * (`features/rediseno_visual.feature`, @s32) es decorativo y viaja con
 * `aria-hidden="true"`: suma a `textContent` («JH…») pero no a lo que anuncia
 * un lector de pantalla. Comparar `textContent` confundía «lo que hay en el
 * DOM» con «lo que se anuncia», que es lo contratado.
 */
function textoAccesibleDe(elemento: HTMLElement): string {
  const copia = elemento.cloneNode(true) as HTMLElement
  for (const decorativo of copia.querySelectorAll('[aria-hidden="true"]')) {
    decorativo.remove()
  }
  return copia.textContent ?? ''
}

describe('@s1 se muestran exactamente los dos profesionales publicados, con su nombre y su rol', () => {
  it('hay un h2 "Equipo", una región accesible "Equipo" y, dentro, exactamente 2 h3 con sus roles', () => {
    renderizarEquipo()

    const seccion = obtenerSeccionEquipo()
    expect(screen.getByRole('region', { name: 'Equipo' })).toBe(seccion)

    const encabezados = within(seccion).getAllByRole('heading', { level: 3 })
    expect(encabezados.map((encabezado) => encabezado.textContent)).toEqual(['Marcos Pérez', 'Joaquín Herranz'])

    const tarjetaMarcos = screen.getByRole('heading', { level: 3, name: 'Marcos Pérez' }).closest('article')
    const tarjetaJoaquin = screen.getByRole('heading', { level: 3, name: 'Joaquín Herranz' }).closest('article')
    expect(tarjetaMarcos).not.toBeNull()
    expect(tarjetaJoaquin).not.toBeNull()
    expect(tarjetaMarcos).toHaveTextContent('Veterinario')
    expect(tarjetaJoaquin).toHaveTextContent('Auxiliar')
  })
})

describe('@s2 ningún dato de colegiación ni de idiomas aparece en la sección', () => {
  it('el texto de la sección no contiene "Colegiad", "Idiomas" ni "nº"', () => {
    renderizarEquipo()

    const seccion = obtenerSeccionEquipo()

    expect(seccion.textContent).not.toContain('Colegiad')
    expect(seccion.textContent).not.toContain('Idiomas')
    expect(seccion.textContent).not.toContain('nº')
  })
})

describe('@s3 la tarjeta de un profesional con formación publicada arranca colapsada', () => {
  it('hay un botón "Ver la formación de Marcos Pérez" con aria-expanded "false" y la formación no es accesible', () => {
    renderizarEquipo()

    const boton = screen.getByRole('button', { name: 'Ver la formación de Marcos Pérez' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByText('Licenciado en veterinaria por la Universidad Complutense de Madrid'),
    ).not.toBeInTheDocument()
  })
})

describe('@s4 desplegar la tarjeta muestra exactamente la formación publicada', () => {
  it('tras pulsar el botón se ve el texto de la formación y aria-expanded pasa a "true"', async () => {
    const usuario = userEvent.setup()
    renderizarEquipo()

    await usuario.click(screen.getByRole('button', { name: 'Ver la formación de Marcos Pérez' }))

    expect(screen.getByText('Licenciado en veterinaria por la Universidad Complutense de Madrid')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ocultar la formación de Marcos Pérez' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})

describe('@s5 el nombre accesible del botón cambia al desplegar', () => {
  it('tras desplegar, existe el botón "Ocultar…" y ya no existe ningún botón "Ver…"', async () => {
    const usuario = userEvent.setup()
    renderizarEquipo()

    await usuario.click(screen.getByRole('button', { name: 'Ver la formación de Marcos Pérez' }))

    expect(screen.getByRole('button', { name: 'Ocultar la formación de Marcos Pérez' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Ver la formación de Marcos Pérez' })).not.toBeInTheDocument()
  })
})

describe('@s6 volver a pulsar colapsa la tarjeta y restituye el nombre accesible', () => {
  it('tras desplegar y volver a pulsar, aria-expanded vuelve a "false", la formación deja de ser accesible y vuelve el botón "Ver…"', async () => {
    const usuario = userEvent.setup()
    renderizarEquipo()

    await usuario.click(screen.getByRole('button', { name: 'Ver la formación de Marcos Pérez' }))
    await usuario.click(screen.getByRole('button', { name: 'Ocultar la formación de Marcos Pérez' }))

    const boton = screen.getByRole('button', { name: 'Ver la formación de Marcos Pérez' })
    expect(boton).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByText('Licenciado en veterinaria por la Universidad Complutense de Madrid'),
    ).not.toBeInTheDocument()
  })
})

describe('@s7 un profesional sin formación publicada no ofrece botón de desplegar', () => {
  it('la sección tiene exactamente 1 botón, el de Marcos Pérez, y la tarjeta de Joaquín se limita a su nombre y su rol', () => {
    renderizarEquipo()

    const botones = screen.getAllByRole('button')
    expect(botones).toHaveLength(1)
    expect(botones[0]).toHaveAccessibleName('Ver la formación de Marcos Pérez')

    // Igualdad exacta, no `toContain`: si mañana la tarjeta colase un número de
    // colegiado, un idioma o cualquier relleno anunciable, esta línea cae (@s2).
    expect(textoAccesibleDe(obtenerTarjetaDe('Joaquín Herranz'))).toBe('Joaquín HerranzAuxiliar')
  })

  // Muerde el vínculo con @s32 de `features/rediseno_visual.feature`: el avatar
  // de iniciales es obligatorio y decorativo. Sin esta prueba, borrarlo o
  // quitarle el `aria-hidden` dejaría verde la aserción de arriba por motivos
  // equivocados (no habría nada que descontar, o se descontaría texto real).
  it('la tarjeta de Joaquín trae el avatar de iniciales con texto propio y oculto a la accesibilidad', () => {
    renderizarEquipo()

    const avatar = obtenerTarjetaDe('Joaquín Herranz').querySelector('[aria-hidden="true"]')

    expect(avatar).not.toBeNull()
    expect(avatar).toHaveAttribute('aria-hidden', 'true')
    expect(avatar?.textContent).toBe('JH')
  })
})

describe('@s8 cada tarjeta con formación se despliega de forma independiente de las demás', () => {
  it('desplegar "Bea Dos" no afecta a "Ana Uno" ni a "Ciro Tres"', async () => {
    const usuario = userEvent.setup()
    renderizarEquipo({ listado: LISTADO_TRES_CON_FORMACION })

    await usuario.click(screen.getByRole('button', { name: 'Ver la formación de Bea Dos' }))

    expect(screen.getByRole('button', { name: 'Ocultar la formación de Bea Dos' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Ver la formación de Ana Uno' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Ver la formación de Ciro Tres' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})

describe('@s9 un profesional sin nombre no se renderiza y no arrastra al resto', () => {
  it('con un tercer profesional de nombre vacío, la sección solo tiene 2 h3 y 2 tarjetas, las de Marcos y Joaquín', () => {
    const listadoConNombreVacio: readonly Profesional[] = [
      { nombre: 'Marcos Pérez', rol: 'Veterinario', formacion: 'Formación de Marcos Pérez' },
      { nombre: 'Joaquín Herranz', rol: 'Auxiliar' },
      { nombre: '', rol: 'Auxiliar' },
    ]
    renderizarEquipo({ listado: listadoConNombreVacio })

    const encabezados = screen.getAllByRole('heading', { level: 3 })
    expect(encabezados.map((encabezado) => encabezado.textContent)).toEqual(['Marcos Pérez', 'Joaquín Herranz'])
    expect(document.querySelectorAll('article')).toHaveLength(2)
  })
})

describe('@s10 con el listado de profesionales vacío la sección no se renderiza', () => {
  it('no hay ningún h2 "Equipo" ni ninguna región "Equipo"', () => {
    renderizarEquipo({ listado: [] })

    expect(screen.queryByRole('heading', { level: 2, name: 'Equipo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Equipo' })).not.toBeInTheDocument()
  })
})

describe('@s11 sin retratos verificados ninguna tarjeta muestra una fotografía del profesional', () => {
  it('la sección no contiene ningún elemento con rol de imagen', () => {
    renderizarEquipo()

    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })
})

/**
 * `features/rediseno_visual.feature` @s32/@s33 (bloque D), añadidos tras el
 * rechazo del `judge` (`progress/judge_rediseno_visual.md`): "@s33 TEST
 * INEXISTENTE y CODIGO QUE INCUMPLE... Equipo.tsx:54". @s32 ya lo cumplía el
 * código (avatar de iniciales, sin fotografía) pero sin un test propio de
 * este contrato ni sabotaje que lo demostrara; @s33 no existía en absoluto.
 * Detalle de ciclos, sabotajes y mapa cláusula→aserción en
 * `progress/rediseno/tdd_equipo.md`.
 */

/** El texto REAL de la hoja de estilos de `Equipo`, leído en crudo por Vite (nunca el símbolo `styles` importado: ese es un proxy en jsdom, `vite.config.ts:61-79`). */
const TEXTO_REAL_DE_EQUIPO_SCSS = (
  import.meta.glob('./Equipo.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['./Equipo.module.scss'] as string

describe('@s32 cada tarjeta del equipo lleva un avatar de iniciales, nunca una fotografía', () => {
  it('no hay ni una sola imagen en toda la sección', () => {
    renderizarEquipo()

    const seccion = obtenerSeccionEquipo()
    expect(seccion.querySelectorAll('img')).toHaveLength(0)
    expect(within(seccion).queryAllByRole('img')).toHaveLength(0)
  })

  it('cada tarjeta muestra un avatar con las iniciales del nombre real, sobre el acento suave de la variante', () => {
    renderizarEquipo()

    // Doble anclaje: las iniciales van tecleadas a mano, confrontadas con el
    // avatar real de la tarjeta — nunca calculadas llamando a `inicialesDe`.
    const avatarMarcos = obtenerTarjetaDe('Marcos Pérez').querySelector('[aria-hidden="true"]')
    const avatarJoaquin = obtenerTarjetaDe('Joaquín Herranz').querySelector('[aria-hidden="true"]')
    expect(avatarMarcos?.textContent).toBe('MP')
    expect(avatarJoaquin?.textContent).toBe('JH')

    // jsdom no aplica el SCSS compilado (`vite.config.ts:61-79`): el "sobre el
    // acento suave de la variante" se verifica en el TEXTO REAL de la hoja de
    // estilos, sobre el bloque ".avatar" concreto.
    const bloqueAvatar = /\.avatar\s*\{([^}]*)\}/.exec(TEXTO_REAL_DE_EQUIPO_SCSS)?.[1] ?? ''
    expect(bloqueAvatar).toContain('background-color: var(--color-acento-suave);')
  })

  it('cada tarjeta muestra el nombre y el rol reales', () => {
    renderizarEquipo()

    expect(obtenerTarjetaDe('Marcos Pérez')).toHaveTextContent('Veterinario')
    expect(obtenerTarjetaDe('Joaquín Herranz')).toHaveTextContent('Auxiliar')
  })

  it('la ficha ampliada solo aparece en quien tiene formación publicada', () => {
    renderizarEquipo()

    expect(screen.getByRole('button', { name: 'Ver la formación de Marcos Pérez' })).toBeInTheDocument()
    expect(within(obtenerTarjetaDe('Joaquín Herranz')).queryByRole('button')).not.toBeInTheDocument()
  })

  it('ninguna tarjeta muestra número de colegiado ni idiomas', () => {
    renderizarEquipo()

    const texto = obtenerSeccionEquipo().textContent ?? ''
    expect(texto).not.toContain('Colegiad')
    expect(texto).not.toContain('Idiomas')
    expect(texto).not.toContain('nº')
  })
})

describe('@s33 la sección de equipo abre con su cintillo en versalitas', () => {
  /** El texto tecleado a mano del cintillo — nunca importado de `Equipo.tsx`. */
  const ROTULO_CINTILLO = 'Nuestro equipo'

  it('hay un <p> con el cintillo, antes del <h2> "Equipo", y no es un encabezado', () => {
    renderizarEquipo()

    const seccion = obtenerSeccionEquipo()
    const encabezado = screen.getByRole('heading', { level: 2, name: 'Equipo' })
    const cintillo = within(seccion).getByText(ROTULO_CINTILLO)

    expect(cintillo.tagName).toBe('P')
    // `compareDocumentPosition` sobre el encabezado, visto DESDE el cintillo:
    // "FOLLOWING" (4) significa que el encabezado va DESPUÉS del cintillo en
    // el documento, es decir, que el cintillo lo precede.
    const posicionRelativa = cintillo.compareDocumentPosition(encabezado)
    expect(posicionRelativa === Node.DOCUMENT_POSITION_FOLLOWING).toBe(true)
    expect(screen.queryByRole('heading', { name: ROTULO_CINTILLO })).not.toBeInTheDocument()
  })

  it('el cintillo usa el mecanismo real de versalitas con acento tinta, sin excepción de color', () => {
    // El fondo de "Equipo" lo pinta un ROL DE COLOR del sistema
    // (`src/pages/Landing.tsx:58-60`, `.seccionAlterna` -> `--color-fondo-alterno`),
    // no una fotografía a sangre como el Hero: @s33 exige aquí el
    // "--color-acento-tinta" POR DEFECTO del mixin "eyebrow"
    // (`src/styles/_api.scss:324-332`), sin la excepción medida de la
    // Enmienda 2 que solo aplica al Hero (`Hero.module.scss:43-58`).
    const bloqueEyebrow = /\.eyebrow\s*\{([^}]*)\}/.exec(TEXTO_REAL_DE_EQUIPO_SCSS)?.[1] ?? ''
    expect(bloqueEyebrow).toContain('@include eyebrow;')
    // Ninguna declaración "color:" propia (a diferencia de la excepción del
    // Hero, `Hero.module.scss:58`): el cintillo hereda el "--color-acento-tinta"
    // que ya trae el mixin, sin sobrescribirlo.
    expect(bloqueEyebrow).not.toMatch(/(?<![a-z-])color\s*:/)
  })
})
