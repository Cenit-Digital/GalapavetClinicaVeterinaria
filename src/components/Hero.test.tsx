import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { calcularRatioContraste } from '../lib/contraste'
import { leerTokenDeVariante } from '../lib/diseno/tokensColor'
import { mezclar } from '../lib/diseno/mezclaDeColor'
import { Hero } from './Hero'

/** Centraliza el render de `Hero` bajo test. */
function renderizarHero(props: React.ComponentProps<typeof Hero> = {}): ReturnType<typeof render> {
  return render(<Hero {...props} />)
}

/** El TEXTO REAL de `Hero.tsx`, leído en crudo (mismo patrón que `Hero-logica.test.ts`). */
const TEXTO_REAL_DE_HERO = (
  import.meta.glob('/src/components/Hero.tsx', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['/src/components/Hero.tsx'] as string

/** El TEXTO REAL de `Hero.module.scss`, leído en crudo: @s18/@s29/@s30 verifican la HOJA, no el proxy de CSS Modules que Vitest sirve en su lugar. */
const TEXTO_REAL_DEL_MODULO = (
  import.meta.glob('/src/components/Hero.module.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['/src/components/Hero.module.scss'] as string

/** El TEXTO REAL de `_tokens.scss`, para leer `--color-tinta`/`--color-sobre-primario` de cada variante (@s29). */
const TEXTO_REAL_DE_TOKENS = (
  import.meta.glob('/src/styles/_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['/src/styles/_tokens.scss'] as string

/** El TEXTO REAL de `_api.scss`, para leer `$ancho-maximo-contenedor` (@s18). */
const TEXTO_REAL_DE_LA_API = (
  import.meta.glob('/src/styles/_api.scss', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['/src/styles/_api.scss'] as string

describe('@s1 se muestran la ubicación real y el titular principal', () => {
  it('el h1 tiene el nombre accesible exacto, se ve "Galapagar · Madrid" y no aparece "Miraflores de la Sierra"', () => {
    const { container } = renderizarHero()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cuidamos la salud y la felicidad de tu mascota' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Galapagar · Madrid')).toBeInTheDocument()
    expect(container).not.toHaveTextContent('Miraflores de la Sierra')
  })
})

describe('@s2 el texto descriptivo solo nombra servicios que el cliente presta', () => {
  it('contiene los cinco servicios reales y no contiene "urgencias" ni "24 h"', () => {
    const { container } = renderizarHero()

    for (const servicio of [
      'medicina general',
      'cirugía y anestesia',
      'diagnóstico de imagen',
      'análisis',
      'especialidades',
    ]) {
      expect(container).toHaveTextContent(servicio)
    }
    expect(container).not.toHaveTextContent('urgencias')
    expect(container).not.toHaveTextContent('24 h')
  })
})

describe('@s3 el botón principal lleva a la sección de reserva', () => {
  it('el enlace "Reservar cita" apunta exactamente a "#reservar"', () => {
    renderizarHero()

    expect(screen.getByRole('link', { name: 'Reservar cita' })).toHaveAttribute('href', '#reservar')
  })
})

describe('@s4 el botón secundario inicia una llamada al teléfono real de la clínica', () => {
  it('el enlace "Llamar 91 082 92 67" apunta exactamente a "tel:+34910829267"', () => {
    renderizarHero()

    expect(screen.getByRole('link', { name: 'Llamar 91 082 92 67' })).toHaveAttribute('href', 'tel:+34910829267')
  })
})

describe('@s5 el número visible y el destino de la llamada no pueden divergir', () => {
  it('los dígitos del nombre accesible y los del destino, sin el prefijo "34", son ambos "910829267"', () => {
    renderizarHero()

    const enlace = screen.getByRole('link', { name: /^Llamar/ })
    const digitosDelNombre = (enlace.textContent ?? '').replace(/\D/g, '')
    const digitosDelDestino = (enlace.getAttribute('href') ?? '').replace('tel:+34', '')

    expect(digitosDelNombre).toBe('910829267')
    expect(digitosDelDestino).toBe('910829267')
  })
})

describe('@s6 la franja inferior muestra el horario real de atención', () => {
  it('exactamente 3 entradas: "Lunes a viernes", "Sábados" y "Domingos" con sus horas', () => {
    renderizarHero()

    const rotulos = screen.getAllByRole('term')
    expect(rotulos).toHaveLength(3)

    expect(screen.getByText('Lunes a viernes').nextElementSibling).toHaveTextContent(
      '11:00 a 14:00 y 16:30 a 20:00',
    )
    expect(screen.getByText('Sábados').nextElementSibling).toHaveTextContent('11:00 a 14:00')
    expect(screen.getByText('Domingos').nextElementSibling).toHaveTextContent('Cerrado')
  })
})

describe('@s7 no aparece ninguna cifra de reputación, antigüedad ni volumen', () => {
  it('el texto de la sección no contiene ninguna de las cifras inventadas del prototipo heredado', () => {
    const { container } = renderizarHero()

    for (const cifra of ['12 años', '8.400', '327', '4,9', '4,6', 'reseñas', '★']) {
      expect(container).not.toHaveTextContent(cifra)
    }
  })
})

describe('@s8 la sección de bienvenida no anuncia urgencias', () => {
  it('sin "24 h", sin "Urgencias" y sin ningún enlace a "tel:+34918511393"', () => {
    const { container } = renderizarHero()

    expect(container).not.toHaveTextContent('24 h')
    expect(container).not.toHaveTextContent('Urgencias')
    for (const enlace of screen.getAllByRole('link')) {
      expect(enlace.getAttribute('href')).not.toBe('tel:+34918511393')
    }
  })
})

describe('@s9 sin teléfono en la fuente única no se renderiza el botón de llamada', () => {
  it('no existe ningún enlace "tel:" y sigue existiendo "Reservar cita"', () => {
    renderizarHero({ telefono: null })

    for (const enlace of screen.getAllByRole('link')) {
      expect(enlace.getAttribute('href')).not.toMatch(/^tel:/)
    }
    expect(screen.getByRole('link', { name: 'Reservar cita' })).toBeInTheDocument()
  })
})

describe('@s10 sin horario en la fuente única no se renderiza la franja inferior', () => {
  it('se muestran exactamente 0 entradas de horario y siguen existiendo el h1 y "Reservar cita"', () => {
    renderizarHero({ horario: null })

    expect(screen.queryAllByRole('term')).toHaveLength(0)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cuidamos la salud y la felicidad de tu mascota' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reservar cita' })).toBeInTheDocument()
  })
})

describe('@s11 un teléfono que no normaliza falla cerrado, sin enlace a medias', () => {
  it('renderizar con el teléfono "91 082 92" lanza y no llega a existir ningún enlace "tel:"', () => {
    expect(() => renderizarHero({ telefono: '91 082 92' })).toThrow('91 082 92')
    expect(document.querySelector('a[href^="tel:"]')).toBeNull()
  })
})

describe('@s30 la píldora de ubicación se deriva de la fuente única, nunca escrita a mano', () => {
  it('el texto real de Hero.tsx no contiene los literales "Galapagar" ni "Madrid": los toma de "datosNegocio.direccion"', () => {
    // Doble anclaje: el fichero SOURCE (no el DOM ya renderizado) no puede
    // contener los literales de localidad/provincia; si los contiene, es que
    // se han retecleado en vez de derivarse de `src/lib/site.ts` (@s30).
    expect(TEXTO_REAL_DE_HERO).not.toContain('Galapagar')
    expect(TEXTO_REAL_DE_HERO).not.toContain('Madrid')
    expect(TEXTO_REAL_DE_HERO).toContain('datosNegocio.direccion')
  })
})

describe('@s13 la sección de bienvenida no carga recursos de terceros por atributos DOM', () => {
  it('ningún elemento declara "src"/"srcset" que empiece por "http" y todo destino empieza por "#" o "tel:"', () => {
    const { container } = renderizarHero()

    for (const elemento of container.querySelectorAll('[src], [srcset]')) {
      expect(elemento.getAttribute('src') ?? '').not.toMatch(/^http/)
      expect(elemento.getAttribute('srcset') ?? '').not.toMatch(/^http/)
    }
    for (const enlace of screen.getAllByRole('link')) {
      const destino = enlace.getAttribute('href') ?? ''
      expect(destino.startsWith('#') || destino.startsWith('tel:')).toBe(true)
    }
  })
})

/**
 * Extrae el bloque `{...}` que sigue a la primera aparición de `cabecera` en
 * `texto`, siguiendo la profundidad de llaves (mismo mecanismo que
 * `extraerBloqueDeVariante` de `tokensColor.ts`, necesario porque `.cifras`
 * anida sus propios selectores `li`/`strong`/`span` y una `[^}]*` se cortaría
 * en la primera llave interior).
 */
function extraerBloqueCss(texto: string, cabecera: string): string {
  const indiceCabecera = texto.indexOf(cabecera)
  if (indiceCabecera === -1) {
    throw new Error(`no se encontró "${cabecera}" en el texto real de Hero.module.scss`)
  }
  const indiceLlaveApertura = texto.indexOf('{', indiceCabecera)
  let profundidad = 1
  let cursor = indiceLlaveApertura + 1
  while (cursor < texto.length && profundidad > 0) {
    if (texto[cursor] === '{') profundidad += 1
    if (texto[cursor] === '}') profundidad -= 1
    cursor += 1
  }
  return texto.slice(indiceLlaveApertura + 1, cursor - 1)
}

describe('@s30 la banda de cuatro cifras queda separada por una línea, no pegada al bloque de encima', () => {
  it('el bloque ".cifras" de Hero.module.scss declara su propio "border-block-start" con un token, nunca "none"', () => {
    const bloqueCifras = extraerBloqueCss(TEXTO_REAL_DEL_MODULO, '.cifras {')

    expect(bloqueCifras).not.toContain('border-block-start: none')
    expect(bloqueCifras).toMatch(
      /border-block-start:\s*\$ancho-borde-fino solid color-mix\(in srgb, var\(--color-sobre-primario\) 45%, transparent\);/,
    )
  })
})

describe('@s18 la bienvenida declara su propio ancho máximo, menor que el general del contenedor', () => {
  it('".contenido" fija un máximo en píxeles, leído del texto real, menor que "$ancho-maximo-contenedor" de la API', () => {
    // Doble anclaje: el ancho general sale del TEXTO REAL de `_api.scss`
    // (`$ancho-maximo-contenedor: 1220px;`, `_api.scss:133`), nunca de un
    // "1220" retecleado a mano; el ancho propio sale del TEXTO REAL de
    // Hero.module.scss, no del proxy de CSS Modules que Vitest sirve.
    const anchoGeneralDeApi = Number(TEXTO_REAL_DE_LA_API.match(/\$ancho-maximo-contenedor:\s*(\d+)px;/)?.[1])
    const bloqueContenido = extraerBloqueCss(TEXTO_REAL_DEL_MODULO, '.contenido {')
    const anchoPropioDeHero = Number(bloqueContenido.match(/width:\s*min\([^,]+,\s*(\d+)px\)/)?.[1])

    expect(anchoGeneralDeApi).toBeGreaterThan(0)
    expect(anchoPropioDeHero).toBeGreaterThan(0)
    expect(anchoPropioDeHero).toBeLessThan(anchoGeneralDeApi)
  })
})

describe('@s29 el velo de la sección de bienvenida sale de tokens de color, nunca de un hexadecimal escrito a mano', () => {
  it('"&::after" deriva su fondo de "var(--color-tinta)" con "color-mix", sin ningún "#" literal', () => {
    const bloqueVelo = extraerBloqueCss(TEXTO_REAL_DEL_MODULO, '&::after {')

    expect(bloqueVelo).toContain('var(--color-tinta)')
    expect(bloqueVelo).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })
})

describe('@s29 el texto de la bienvenida alcanza el mínimo de contraste de texto normal contra el velo, en las cinco variantes', () => {
  it('"--color-sobre-primario" contra el velo de "--color-tinta" al 92 % supera 4,5 con la fotografía en sus dos extremos', () => {
    // Mismo método que `progress/rediseno/fix_uso_del_acento.md` §1 y §3.2: el
    // velo es "color-mix(in srgb, var(--color-tinta) 92%, transparent)" en su
    // parada izquierda (`Hero.module.scss:17`), compuesto sobre una
    // fotografía cuyo color real no es conocible en jsdom — se acota por sus
    // dos extremos posibles (negro y blanco puros, `mezclar` reproduce la
    // composición alfa canal a canal): si el texto cumple contra los dos,
    // cumple con cualquier fotografía real de por medio. El h1 y el párrafo
    // heredan la tinta de ".hero" con "color: inherit" (`Hero.module.scss:7`),
    // así que "--color-sobre-primario" es la pareja real, no una suposición.
    const UMBRAL_TEXTO_NORMAL = 4.5 // Mínimo WCAG 2.2 AA para texto normal (Enmienda 2 del contrato).
    const PARADA_IZQUIERDA_DEL_VELO = 0.92
    const NEGRO = '#000000'
    const BLANCO = '#FFFFFF'
    const variantes = ['clinica', 'calida', 'tech', 'eco', 'marca'] as const

    for (const variante of variantes) {
      const tinta = leerTokenDeVariante(TEXTO_REAL_DE_TOKENS, variante, 'tinta')
      const sobrePrimario = leerTokenDeVariante(TEXTO_REAL_DE_TOKENS, variante, 'sobre-primario')

      const veloSobreNegro = mezclar(NEGRO, tinta, PARADA_IZQUIERDA_DEL_VELO)
      const veloSobreBlanco = mezclar(BLANCO, tinta, PARADA_IZQUIERDA_DEL_VELO)

      expect(calcularRatioContraste(sobrePrimario, veloSobreNegro)).toBeGreaterThanOrEqual(UMBRAL_TEXTO_NORMAL)
      expect(calcularRatioContraste(sobrePrimario, veloSobreBlanco)).toBeGreaterThanOrEqual(UMBRAL_TEXTO_NORMAL)
    }
  })
})

describe('@s29 la sección de bienvenida reserva su alto antes de que la imagen decodifique, sin desplazar el contenido de debajo', () => {
  it('".hero" fija "aspect-ratio" y un "min-height" en píxeles', () => {
    const bloqueHero = extraerBloqueCss(TEXTO_REAL_DEL_MODULO, '.hero {')

    expect(bloqueHero).toMatch(/aspect-ratio:\s*16\s*\/\s*9;/)
    expect(bloqueHero).toMatch(/min-height:\s*\d+px;/)
  })
})

describe('@s30 la píldora de ubicación, los dos botones y la banda de cuatro cifras conviven en el mismo render', () => {
  it('hay una píldora de localidad, exactamente dos enlaces de acción y una lista de exactamente cuatro cifras', () => {
    renderizarHero()

    expect(screen.getByText('Galapagar · Madrid')).toBeInTheDocument()

    const botones = screen.getAllByRole('link')
    expect(botones).toHaveLength(2)
    expect(botones[0]).toHaveAccessibleName('Reservar cita')
    expect(botones[1]).toHaveAccessibleName(/^Llamar/)

    // "within" acota la búsqueda de las cuatro cifras a la propia lista (por
    // su nombre accesible), en vez de contar "listitem" en todo el documento.
    const bandaDeCifras = screen.getByRole('list', { name: 'Resumen de Galapavet' })
    expect(within(bandaDeCifras).getAllByRole('listitem')).toHaveLength(4)
  })
})
