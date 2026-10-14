import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { calcularRatioContraste } from '../lib/contraste'
import { leerEstilos } from '../lib/diseno/lectorDeEstilos'
import { leerTokenDeVariante } from '../lib/diseno/tokensColor'
import * as datosDelSitio from '../lib/diseno/datosDelSitio'
import { mezclar } from '../lib/diseno/mezclaDeColor'
import { Hero } from './Hero'

/** Centraliza el render de `Hero` bajo test: la portada lo monta sin ninguna prop (hero_reducido_con_animacion @s1). */
function renderizarHero(): ReturnType<typeof render> {
  return render(React.createElement(Hero))
}

/** El TEXTO REAL de `Hero.module.scss`, leído en crudo: @s29/@s38 verifican la HOJA, no el proxy de CSS Modules que Vitest sirve en su lugar. */
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

/** El TEXTO REAL de `Hero.tsx`, leído en crudo. */
const TEXTO_REAL_DE_HERO = (
  import.meta.glob('/src/components/Hero.tsx', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['/src/components/Hero.tsx'] as string

/** La LISTA REAL de ficheros de `src` (solo sus rutas: ninguno se evalúa) y el texto de todas las hojas SCSS. */
const RUTAS_REALES_DE_SRC = Object.keys(import.meta.glob('/src/**/*'))
const HOJAS_SCSS_REALES = import.meta.glob('/src/**/*.scss', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** La configuración REAL de la prueba de mutación, de la que sale la superficie que muta. */
const CONFIGURACION_REAL_DE_STRYKER = (
  import.meta.glob('/stryker.config.json', { eager: true, query: '?raw', import: 'default' }) as Record<
    string,
    string
  >
)['/stryker.config.json'] as string

/** Los elementos que cuentan como «interactivos» al recorrer la sección (hero_reducido_con_animacion @s1). */
const SELECTOR_DE_INTERACTIVOS = 'a, button, input, select, textarea, summary, [tabindex], [contenteditable]'
/** Los elementos de lista, de lista de definiciones, de término y de definición que la sección no puede contener. */
const SELECTOR_DE_LISTAS = 'ul, ol, li, dl, dt, dd'
const PALABRAS_QUE_NO_SON_DEL_HERO = ['galapagar', 'madrid', 'llamar', 'lunes', 'sábados', 'domingos'] as const

/** Si el elemento tiene un nodo de texto propio, no vacío: lo que escribe él y no sus hijos. */
function tieneTextoPropio(elemento: Element): boolean {
  return [...elemento.childNodes].some(
    (nodo) => nodo.nodeType === Node.TEXT_NODE && (nodo.textContent ?? '').trim() !== '',
  )
}

/**
 * Recorre TODA la sección y devuelve el nombre de cada cláusula de
 * hero_reducido_con_animacion @s1 que incumple, más el recuento de elementos
 * recorridos (la guarda contra el verde por vacuidad: una sección vacía no
 * incumpliría nada). Lista vacía = la sección cumple el contrato.
 */
function auditarContenidoDelHero(seccion: Element): { incumplidas: readonly string[]; recorridos: number } {
  const elementos = [...seccion.querySelectorAll('*')]
  const conTextoOInteractivos = elementos.filter(
    (elemento) => tieneTextoPropio(elemento) || elemento.matches(SELECTOR_DE_INTERACTIVOS),
  )
  const imagenes = [...seccion.querySelectorAll('img')]
  const texto = (seccion.textContent ?? '').toLowerCase()
  const incumplidas: string[] = []

  if (conTextoOInteractivos.map((elemento) => elemento.tagName).join() !== 'H1,P,A') {
    incumplidas.push('exactamente un titular, un párrafo y un enlace con texto o interactivos')
  }
  if (seccion.querySelectorAll('h1,h2,h3,h4,h5,h6').length !== 1) incumplidas.push('exactamente 1 encabezado')
  if (seccion.querySelectorAll('p').length !== 1) incumplidas.push('exactamente 1 párrafo')
  if (seccion.querySelectorAll('a').length !== 1) incumplidas.push('exactamente 1 enlace')
  if (imagenes.length !== 1 || imagenes[0]?.getAttribute('alt') !== '') {
    incumplidas.push('exactamente 1 imagen y decorativa')
  }
  if (seccion.querySelector(SELECTOR_DE_LISTAS) !== null) incumplidas.push('ningún elemento de lista')
  if (/\d/.test(texto) || PALABRAS_QUE_NO_SON_DEL_HERO.some((palabra) => texto.includes(palabra))) {
    incumplidas.push('ningún dígito ni palabra de ubicación, llamada u horario')
  }

  return { incumplidas, recorridos: elementos.length }
}

describe('@s1 de hero_reducido_con_animacion: la sección de bienvenida contiene exactamente un titular, un párrafo y un botón de reserva', () => {
  /** La sección tal como la monta la portada, más lo que cada prueba de mordida le añade o le quita. */
  function seccionRenderizada(): Element {
    const { container } = renderizarHero()
    return container.querySelector('section') as Element
  }

  function conAnadido(html: string): Element {
    const seccion = seccionRenderizada()
    ;(seccion.querySelector('[data-hero-contenido]') as Element).insertAdjacentHTML('afterbegin', html)
    return seccion
  }

  it('la sección real cumple todas las cláusulas y se recorren elementos de verdad', () => {
    const informe = auditarContenidoDelHero(seccionRenderizada())

    expect(informe.incumplidas).toEqual([])
    expect(informe.recorridos).toBeGreaterThan(0)
  })

  it('el encabezado, el párrafo y el enlace tienen el nombre, el texto y el destino exactos, y la imagen es decorativa', () => {
    renderizarHero()

    expect(screen.getAllByRole('heading')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Cuidamos la salud y la felicidad de tu mascota',
    )
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Reservar cita' })).toHaveAttribute('href', '#reservar')
    expect(document.querySelectorAll('img')).toHaveLength(1)
    expect(document.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('vuelve la píldora de ubicación: el recuento de párrafos pasa a 2 y aparece "Galapagar"', () => {
    const informe = auditarContenidoDelHero(conAnadido('<p>Galapagar · Madrid</p>'))

    expect(informe.incumplidas).toContain('exactamente 1 párrafo')
    expect(informe.incumplidas).toContain('ningún dígito ni palabra de ubicación, llamada u horario')
  })

  it('vuelve el botón «Llamar»: el recuento de enlaces pasa a 2', () => {
    const informe = auditarContenidoDelHero(conAnadido('<a href="tel:+34910829267">Llamar</a>'))

    expect(informe.incumplidas).toContain('exactamente 1 enlace')
    expect(informe.incumplidas).toContain('exactamente un titular, un párrafo y un enlace con texto o interactivos')
  })

  it('vuelve la franja de horario: aparece una lista de definiciones y un dígito', () => {
    const informe = auditarContenidoDelHero(
      conAnadido('<dl><div><dt>Sábados</dt><dd>11:00 a 14:00</dd></div></dl>'),
    )

    expect(informe.incumplidas).toContain('ningún elemento de lista')
    expect(informe.incumplidas).toContain('ningún dígito ni palabra de ubicación, llamada u horario')
  })

  it('vuelve la banda de cifras: aparece un elemento de lista y un dígito', () => {
    const informe = auditarContenidoDelHero(conAnadido('<ul><li><strong>5</strong><span>Servicios</span></li></ul>'))

    expect(informe.incumplidas).toContain('ningún elemento de lista')
    expect(informe.incumplidas).toContain('ningún dígito ni palabra de ubicación, llamada u horario')
  })

  it('vuelve un dígito suelto en un párrafo: la cláusula del dígito lo caza sin enumerarlo', () => {
    const informe = auditarContenidoDelHero(conAnadido('<span>+12 años</span>'))

    expect(informe.incumplidas).toContain('ningún dígito ni palabra de ubicación, llamada u horario')
  })

  it('se quita el botón o el párrafo: el recuento de elementos con texto o interactivos baja de 3 a 2', () => {
    const sinBoton = seccionRenderizada()
    sinBoton.querySelector('a')?.remove()
    const sinParrafo = seccionRenderizada()
    sinParrafo.querySelector('p')?.remove()

    expect(auditarContenidoDelHero(sinBoton).incumplidas).toContain('exactamente 1 enlace')
    expect(auditarContenidoDelHero(sinParrafo).incumplidas).toContain('exactamente 1 párrafo')
  })

  it('una segunda imagen, o una imagen con texto alternativo, deja de ser "exactamente 1 imagen decorativa"', () => {
    const conSegundaImagen = conAnadido('<img src="/x.webp" alt="" />')
    const conAlternativo = seccionRenderizada()
    conAlternativo.querySelector('img')?.setAttribute('alt', 'Clínica')

    expect(auditarContenidoDelHero(conSegundaImagen).incumplidas).toContain('exactamente 1 imagen y decorativa')
    expect(auditarContenidoDelHero(conAlternativo).incumplidas).toContain('exactamente 1 imagen y decorativa')
  })
})

/**
 * Extrae el bloque `{...}` que sigue a la primera aparición de `cabecera` en
 * `texto`, siguiendo la profundidad de llaves (mismo mecanismo que
 * `extraerBloqueDeVariante` de `tokensColor.ts`, necesario porque una regla
 * anida sus propios selectores y una `[^}]*` se cortaría en la primera llave
 * interior).
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

/** Quita los comentarios de bloque y de línea: un comentario que cuenta POR QUÉ se retiró algo no es un resto. */
function sinComentarios(texto: string): string {
  return texto.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1')
}

/** Los restos de lo retirado que aún declara o importa el texto de `Hero.tsx` (hero_reducido_con_animacion @s3). */
function restosEnElComponente(texto: string): readonly string[] {
  const codigo = sinComentarios(texto)
  const restos: Array<[string, RegExp]> = [
    ['enlaceLlamada', /\benlaceLlamada\b/],
    ['construirCifrasBienvenida', /\bconstruirCifrasBienvenida\b/],
    ['FranjaHorario', /\bFranjaHorario\b/],
    ['UBICACION', /\bUBICACION\b/],
    ['importa un catálogo de servicios, de equipo o de galería', /from\s+['"][^'"]*\/data\/(servicios|equipo|galeria)['"]/],
    ['importa el módulo puro de la bienvenida', /from\s+['"][^'"]*Hero-logica['"]/],
    ['prop telefono', /\btelefono\b/],
    ['prop horario', /\bhorario\b/],
    ['data-hero-ubicacion', /data-hero-ubicacion/],
    ['data-hero-cifras', /data-hero-cifras/],
  ]
  return restos.filter(([, patron]) => patron.test(codigo)).map(([nombre]) => nombre)
}

/** Los bloques `@media` de una hoja, con sus llaves balanceadas (la cabecera de cada uno incluida). */
function bloquesMedia(codigo: string): readonly string[] {
  const bloques: string[] = []
  for (const coincidencia of codigo.matchAll(/@media[^{]*\{/g)) {
    const inicio = coincidencia.index
    let profundidad = 1
    let cursor = inicio + coincidencia[0].length
    while (cursor < codigo.length && profundidad > 0) {
      if (codigo[cursor] === '{') profundidad += 1
      if (codigo[cursor] === '}') profundidad -= 1
      cursor += 1
    }
    bloques.push(codigo.slice(inicio, cursor))
  }
  return bloques
}

/** Los restos de lo retirado que aún declara la hoja `Hero.module.scss` (hero_reducido_con_animacion @s3). */
function restosEnLaHoja(texto: string): readonly string[] {
  const codigo = sinComentarios(texto)
  const restos: Array<[string, RegExp]> = [
    ['selector ubicacion', /\.ubicacion\b/],
    ['selector puntoUbicacion', /\.puntoUbicacion\b/],
    ['selector cifras', /\.cifras\b/],
    ['regla para dl', /(^|[\s,>+~}{])dl\b/m],
    ['regla para a:not(:first-child)', /a:not\(:first-child\)/],
  ]
  const delSelector = restos.filter(([, patron]) => patron.test(codigo)).map(([nombre]) => nombre)
  const delMedia = bloquesMedia(codigo)
    .filter((bloque) => /cifras|ubicacion|puntoUbicacion|\bdl\b/.test(bloque) || bloque.includes('561px'))
    .map((bloque) => `@media con restos: ${bloque.split('{')[0]?.trim()}`)
  return [...delSelector, ...delMedia]
}

/** La superficie que muta Stryker: las dos globs positivas de su configuración, aplicadas a la lista real de ficheros. */
function ficherosQueMutaStryker(): readonly string[] {
  const { mutate } = JSON.parse(CONFIGURACION_REAL_DE_STRYKER) as { mutate: readonly string[] }
  expect(mutate.filter((patron) => !patron.startsWith('!'))).toEqual(['src/lib/**/*.ts', 'src/**/*-logica.ts'])
  return RUTAS_REALES_DE_SRC.filter(
    (ruta) =>
      !ruta.endsWith('.test.ts') &&
      !ruta.endsWith('.test.tsx') &&
      ((ruta.startsWith('/src/lib/') && ruta.endsWith('.ts')) || ruta.endsWith('-logica.ts')),
  )
}

describe('@s3 de hero_reducido_con_animacion: lo que solo existía para la píldora, el botón de llamada, la franja y las cifras desaparece del código', () => {
  it('no existe ningún fichero cuyo nombre empiece por "Hero-logica" y la superficie de mutación no contiene ninguno', () => {
    const ficheros = RUTAS_REALES_DE_SRC.filter((ruta) => (ruta.split('/').at(-1) ?? '').startsWith('Hero-logica'))
    const superficie = ficherosQueMutaStryker()

    expect(RUTAS_REALES_DE_SRC.length).toBeGreaterThan(0)
    expect(superficie.length).toBeGreaterThan(0)
    expect(ficheros).toEqual([])
    expect(superficie.filter((ruta) => ruta.includes('Hero-logica'))).toEqual([])
  })

  it('"Hero.tsx" no conserva ningún identificador, importación, prop ni atributo de lo retirado', () => {
    expect(TEXTO_REAL_DE_HERO.length).toBeGreaterThan(0)
    expect(restosEnElComponente(TEXTO_REAL_DE_HERO)).toEqual([])
  })

  it('"Hero.module.scss" no conserva ningún selector, regla ni "@media" de lo retirado', () => {
    expect(TEXTO_REAL_DEL_MODULO.length).toBeGreaterThan(0)
    expect(restosEnLaHoja(TEXTO_REAL_DEL_MODULO)).toEqual([])
  })

  it('"digitosDe" y "extraerFragmento" ya no se exportan desde "datosDelSitio.ts"', () => {
    const exportaciones = Object.keys(datosDelSitio)

    expect(exportaciones.length).toBeGreaterThan(0)
    expect(exportaciones).not.toContain('digitosDe')
    expect(exportaciones).not.toContain('extraerFragmento')
  })

  it('el mixin "boton-fantasma" conserva al menos un consumidor fuera de "Hero.module.scss"', () => {
    const consumidores = Object.entries(HOJAS_SCSS_REALES).filter(
      ([ruta, texto]) => !ruta.endsWith('/Hero.module.scss') && sinComentarios(texto).includes('@include boton-fantasma'),
    )

    expect(Object.keys(HOJAS_SCSS_REALES).length).toBeGreaterThan(0)
    expect(consumidores.length).toBeGreaterThan(0)
  })

  describe('la comprobación de restos muerde: cada resto sintético se detecta y un comentario no dispara nada', () => {
    it.each([
      ["import { enlaceLlamada } from '../lib/telefono'", 'enlaceLlamada'],
      ["import { construirCifrasBienvenida } from './Hero-logica'", 'construirCifrasBienvenida'],
      ["import { construirCifrasBienvenida } from './Hero-logica'", 'importa el módulo puro de la bienvenida'],
      ['export interface FranjaHorario {}', 'FranjaHorario'],
      ['const UBICACION = 1', 'UBICACION'],
      ["import { SERVICIOS } from '../data/servicios'", 'importa un catálogo de servicios, de equipo o de galería'],
      ["import { EQUIPO } from '../data/equipo'", 'importa un catálogo de servicios, de equipo o de galería'],
      ["import { GALERIA } from '../data/galeria'", 'importa un catálogo de servicios, de equipo o de galería'],
      ['telefono?: string | null', 'prop telefono'],
      ['horario?: readonly unknown[]', 'prop horario'],
      ['<p data-hero-ubicacion>', 'data-hero-ubicacion'],
      ['<ul data-hero-cifras>', 'data-hero-cifras'],
    ])('el componente con «%s» deja el resto «%s»', (linea, resto) => {
      expect(restosEnElComponente(linea)).toContain(resto)
    })

    it.each([
      ['.ubicacion { color: red }', 'selector ubicacion'],
      ['.puntoUbicacion { width: 7px }', 'selector puntoUbicacion'],
      ['.cifras { display: grid }', 'selector cifras'],
      ['.contenido dl { margin: 0 }', 'regla para dl'],
      ['dl { margin: 0 }', 'regla para dl'],
      ['.acciones { a:not(:first-child) { color: red } }', 'regla para a:not(:first-child)'],
      [
        '@media (min-width: 561px) and (max-width: 700px) { .contenido { gap: 0 } }',
        '@media con restos: @media (min-width: 561px) and (max-width: 700px)',
      ],
      ['@media (max-width: 560px) { .cifras { gap: 0 } }', '@media con restos: @media (max-width: 560px)'],
      ['@media (max-width: 560px) { .contenido { dl { gap: 0 } } }', '@media con restos: @media (max-width: 560px)'],
    ])('la hoja con «%s» deja el resto «%s»', (regla, resto) => {
      expect(restosEnLaHoja(regla)).toContain(resto)
    })

    it('los comentarios que cuentan por qué se retiró algo no cuentan como restos, ni en el componente ni en la hoja', () => {
      expect(restosEnElComponente('// se retiró enlaceLlamada y UBICACION\n/* data-hero-cifras */')).toEqual([])
      expect(restosEnLaHoja('// .cifras y dl se retiraron\n/* a:not(:first-child) */\n.hero { color: red }')).toEqual([])
    })

    it('un "dl" dentro de otra palabra o de un valor no es una regla para "dl"', () => {
      expect(restosEnLaHoja('.hero { background: model; width: 10px }')).toEqual([])
    })
  })
})

/** Solo las declaraciones que un bloque escribe directamente: descarta lo que contienen sus reglas anidadas. */
function declaracionesPropias(bloque: string): string {
  let profundidad = 0
  let propias = ''
  for (const caracter of bloque) {
    if (caracter === '{') profundidad += 1
    else if (caracter === '}') profundidad -= 1
    else if (profundidad === 0) propias += caracter
  }
  return propias
}

/**
 * Lo que la hoja incumple de hero_reducido_con_animacion @s12 en su parte de
 * CSS: la altura de la sección es `min-height: 100svh` en TODOS los anchos
 * (nunca un `height` fijo, que recortaría en una ventana baja, ni un `clamp`,
 * ni una regla estrecha que la anule). La medición real es de navegador
 * (`tests/e2e/hero-reducido.spec.ts`); esta es la parte que se lee de la hoja.
 */
function incumplimientosDeLaAlturaCompleta(hoja: string): readonly string[] {
  const codigo = sinComentarios(hoja)
  const propias = declaracionesPropias(extraerBloqueCss(codigo, '.hero {'))
  const incumplidas: string[] = []

  if (!/(^|[\s;])min-height:\s*100svh\s*;/.test(propias)) incumplidas.push('".hero" no declara "min-height: 100svh"')
  if (/(^|[\s;])height\s*:/.test(propias)) incumplidas.push('".hero" declara un "height" fijo')
  if (/aspect-ratio\s*:/.test(propias)) incumplidas.push('".hero" declara "aspect-ratio"')
  if (/clamp\(\s*560px/.test(codigo)) incumplidas.push('queda el "clamp(560px, 84svh, 784px)"')
  if (/min-height:\s*0\b/.test(codigo)) incumplidas.push('una regla anula "min-height" a "0"')
  if (/max-width:\s*560px/.test(codigo)) incumplidas.push('queda la regla estrecha de 560 px')

  return incumplidas
}

describe('@s12 de hero_reducido_con_animacion: la sección de bienvenida es de pantalla completa (lo que se lee de la hoja)', () => {
  it('".hero" declara "min-height: 100svh", sin altura fija, sin "aspect-ratio", sin "clamp" y sin regla estrecha que la anule', () => {
    expect(incumplimientosDeLaAlturaCompleta(TEXTO_REAL_DEL_MODULO)).toEqual([])
  })

  it.each([
    ['.hero { min-height: clamp(560px, 84svh, 784px); }', '".hero" no declara "min-height: 100svh"'],
    ['.hero { min-height: clamp(560px, 84svh, 784px); }', 'queda el "clamp(560px, 84svh, 784px)"'],
    ['.hero { height: 100svh; overflow: hidden; }', '".hero" declara un "height" fijo'],
    ['.hero { height: 100svh; }', '".hero" no declara "min-height: 100svh"'],
    ['.hero { min-height: 100svh; aspect-ratio: 16 / 9; }', '".hero" declara "aspect-ratio"'],
    [
      '.hero { min-height: 100svh; }\n@media (max-width: 560px) { .hero { min-height: 0; } }',
      'una regla anula "min-height" a "0"',
    ],
    ['.hero { min-height: 100svh; }\n@media (max-width: 560px) { .x { gap: 0 } }', 'queda la regla estrecha de 560 px'],
    ['.hero { min-height: 100vh; }', '".hero" no declara "min-height: 100svh"'],
  ])('la hoja «%s» incumple «%s»', (hoja, incumplimiento) => {
    expect(incumplimientosDeLaAlturaCompleta(hoja)).toContain(incumplimiento)
  })

  it('un "height" dentro de una regla anidada de ".hero" (la foto a todo el alto) no cuenta como altura de la sección', () => {
    expect(incumplimientosDeLaAlturaCompleta('.hero { min-height: 100svh; > img { height: 100%; } }')).toEqual([])
  })

  it('un comentario que cita lo retirado no cuenta', () => {
    expect(
      incumplimientosDeLaAlturaCompleta('// antes: clamp(560px, 84svh, 784px)\n.hero { min-height: 100svh; }'),
    ).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// hero_reducido_con_animacion @s5-@s8: la entrada animada, en lo que se lee de la
// hoja. Los valores medidos con el motor de animaciones (duración, retardos,
// caja en cada instante) los fija `tests/e2e/hero-reducido.spec.ts`; esta es la
// parte que se lee del TEXTO, que da el aviso en el segundo en que alguien toca
// la hoja y no necesita navegador.
// ---------------------------------------------------------------------------

/** Una regla `selector { interior }` de primer nivel de un texto; `interior` conserva sus reglas anidadas. */
interface ReglaLeida {
  readonly selector: string
  readonly interior: string
}

/**
 * Las reglas de primer nivel de un texto SCSS, con las llaves balanceadas. Sin
 * comentarios y con las interpolaciones `#{...}` opacas: sus llaves no abren
 * ningún bloque (`.contenido` usa una).
 */
function reglasDe(texto: string): readonly ReglaLeida[] {
  const codigo = sinComentarios(texto).replace(/#\{[^}]*\}/g, 'interpolacion')
  const reglas: ReglaLeida[] = []
  let profundidad = 0
  let encabezado = ''
  let interior = ''
  for (const caracter of codigo) {
    if (caracter === '{') {
      interior = profundidad === 0 ? '' : interior + caracter
      profundidad += 1
    } else if (caracter === '}') {
      profundidad -= 1
      if (profundidad === 0) {
        reglas.push({ selector: encabezado.trim().replace(/\s+/g, ' '), interior })
        encabezado = ''
      } else {
        interior += caracter
      }
    } else if (profundidad > 0) {
      interior += caracter
    } else {
      // Una sentencia sin bloque (`@use ...;`) no es el encabezado de la regla que le sigue.
      encabezado = caracter === ';' ? '' : encabezado + caracter
    }
  }
  return reglas
}

/** Las declaraciones `propiedad: valor` que un bloque escribe directamente, con los blancos normalizados. */
function declaracionesEscritasEn(interior: string): readonly string[] {
  return declaracionesPropias(interior)
    .split(';')
    .map((sentencia) => sentencia.trim().replace(/\s+/g, ' '))
    .filter((sentencia) => /^[\w-]+\s*:/.test(sentencia))
    .toSorted()
}

const CONSULTA_SIN_PREFERENCIA = '@media (prefers-reduced-motion: no-preference)'
const PREFIJO_DE_FOTOGRAMAS = '@keyframes '

/** Los tres elementos que entran, en su orden de retardo: el titular, el párrafo y el CONTENEDOR del botón (nunca el enlace). */
const ENTRADAS_DEL_HERO = [
  { selector: '.contenido h1', retardo: '0ms' },
  { selector: '.subtitulo', retardo: '120ms' },
  { selector: '.acciones', retardo: '240ms' },
] as const

/** Parte desplazado 40 px a la IZQUIERDA y transparente; termina en su sitio, opaco y sin transformación. */
const FOTOGRAMAS_DE_LA_ENTRADA: Readonly<Record<string, readonly string[]>> = {
  from: ['opacity: 0', 'transform: translateX(-40px)'],
  to: ['opacity: 1', 'transform: none'],
}

function distintas(declaradas: readonly string[], esperadas: readonly string[]): boolean {
  return declaradas.join('; ') !== esperadas.toSorted().join('; ')
}

/** Lo que `hoja` incumple de la entrada animada del hero (@s5-@s8), en lo que se lee del texto. */
function incumplimientosDeLaEntrada(hoja: string): readonly string[] {
  const reglas = reglasDe(hoja)
  const consultas = reglas.filter((regla) => regla.selector === CONSULTA_SIN_PREFERENCIA)
  if (consultas.length !== 1) {
    return [`hay ${consultas.length} bloques "${CONSULTA_SIN_PREFERENCIA}" de primer nivel y debe haber 1`]
  }
  const dentro = reglasDe(consultas[0]?.interior ?? '')
  const fotogramas = [...reglas, ...dentro].filter((regla) => regla.selector.startsWith(PREFIJO_DE_FOTOGRAMAS))
  const nombre = (fotogramas[0]?.selector ?? PREFIJO_DE_FOTOGRAMAS).slice(PREFIJO_DE_FOTOGRAMAS.length)
  const pasos = reglasDe(fotogramas[0]?.interior ?? '')
  const incumplidas: string[] = []

  if (fotogramas.length !== 1) incumplidas.push(`hay ${fotogramas.length} "@keyframes" y debe haber 1`)
  if (pasos.length !== 2) incumplidas.push(`los fotogramas tienen ${pasos.length} pasos y deben tener 2: "from" y "to"`)
  for (const [paso, esperadas] of Object.entries(FOTOGRAMAS_DE_LA_ENTRADA)) {
    const declaradas = declaracionesEscritasEn(pasos.find((regla) => regla.selector === paso)?.interior ?? '')
    if (distintas(declaradas, esperadas)) {
      incumplidas.push(`el fotograma "${paso}" declara [${declaradas.join('; ')}] y debe declarar [${esperadas.join('; ')}]`)
    }
  }

  for (const { selector, retardo } of ENTRADAS_DEL_HERO) {
    const declaradas = declaracionesEscritasEn(dentro.find((regla) => regla.selector === selector)?.interior ?? '')
    const esperadas = [`animation: ${nombre} 700ms ease-out backwards`, `animation-delay: ${retardo}`]
    if (distintas(declaradas, esperadas)) {
      incumplidas.push(`"${selector}" declara [${declaradas.join('; ')}] y debe declarar [${esperadas.join('; ')}]`)
    }
  }
  const selectoresEsperados = new Set<string>(ENTRADAS_DEL_HERO.map((entrada) => entrada.selector))
  const deMas = dentro
    .filter((regla) => !regla.selector.startsWith(PREFIJO_DE_FOTOGRAMAS) && !selectoresEsperados.has(regla.selector))
    .map((regla) => regla.selector)
  if (deMas.length > 0) incumplidas.push(`dentro de "no-preference" hay reglas de más: ${deMas.join(', ')}`)

  // El estado BASE, fuera de la consulta y de los fotogramas, es el estado final visible (Invariante 4, @s7).
  const fuera = reglas
    .filter((regla) => regla !== consultas[0] && !regla.selector.startsWith(PREFIJO_DE_FOTOGRAMAS))
    .map((regla) => `${regla.selector} {${regla.interior}}`)
    .join('\n')
  const restos: Array<[string, RegExp]> = [
    ['declara una animación fuera de "no-preference"', /\banimation[\w-]*\s*:/],
    ['deja "opacity: 0" en el estado base', /\bopacity\s*:\s*0(?![\d.])/],
    ['deja "visibility: hidden" en el estado base', /\bvisibility\s*:\s*hidden/],
    ['deja un "transform: translate" en el estado base', /\btransform\s*:\s*translate/],
  ]
  incumplidas.push(...restos.filter(([, patron]) => patron.test(fuera)).map(([resto]) => resto))
  if (/\bwill-change\b/.test(sinComentarios(hoja))) incumplidas.push('declara "will-change"')

  return incumplidas
}

interface CambiosEnLaHoja {
  readonly animacion?: string
  readonly retardos?: readonly [string, string, string]
  readonly desde?: string
  readonly hasta?: string
  readonly dentroDeMas?: string
  readonly fuera?: string
  readonly enReduce?: string
  readonly consulta?: string
  readonly fotogramasEnLaRaiz?: boolean
}

/** Una hoja sintética con la entrada bien escrita; cada sabotaje cambia UNA cosa de ella. */
function hojaConEntrada(cambios: CambiosEnLaHoja = {}): string {
  const {
    animacion = 'entrada 700ms ease-out backwards',
    retardos = ['0ms', '120ms', '240ms'],
    desde = 'opacity: 0; transform: translateX(-40px);',
    hasta = 'opacity: 1; transform: none;',
    dentroDeMas = '',
    fuera = '',
    enReduce = '',
    consulta = CONSULTA_SIN_PREFERENCIA,
    fotogramasEnLaRaiz = false,
  } = cambios
  const fotogramas = `@keyframes entrada { from { ${desde} } to { ${hasta} } }`
  return `
.hero { min-height: 100svh; ${fuera} }
.contenido h1 { margin: 0; }
${fotogramasEnLaRaiz ? fotogramas : ''}
${consulta} {
  .contenido h1 { animation: ${animacion}; animation-delay: ${retardos[0]}; }
  .subtitulo { animation: ${animacion}; animation-delay: ${retardos[1]}; }
  .acciones { animation: ${animacion}; animation-delay: ${retardos[2]}; }
  ${dentroDeMas}
  ${fotogramasEnLaRaiz ? '' : fotogramas}
}
${enReduce}
`
}

describe('@s5-@s8 de hero_reducido_con_animacion: la entrada animada, en lo que se lee de la hoja del hero', () => {
  it('la hoja real declara la entrada de los tres elementos con los valores aprobados, solo dentro de "no-preference", y deja el estado base visible', () => {
    expect(reglasDe(TEXTO_REAL_DEL_MODULO).length).toBeGreaterThan(0)
    expect(incumplimientosDeLaEntrada(TEXTO_REAL_DEL_MODULO)).toEqual([])
  })

  it('el lector común de las puertas de movimiento ve en la hoja real tres "animation", tres "animation-delay" y unos fotogramas, todo dentro de "no-preference"', () => {
    const { declaraciones, fotogramas } = leerEstilos(TEXTO_REAL_DEL_MODULO)
    const deAnimacion = declaraciones.filter((declaracion) => declaracion.propiedad.startsWith('animation'))

    expect(deAnimacion.map((declaracion) => declaracion.propiedad).toSorted()).toEqual([
      'animation',
      'animation',
      'animation',
      'animation-delay',
      'animation-delay',
      'animation-delay',
    ])
    expect(deAnimacion.every((declaracion) => declaracion.bloques.includes('no-preference'))).toBe(true)
    expect(fotogramas).toHaveLength(1)
    expect(fotogramas[0]?.bloques.includes('no-preference')).toBe(true)
  })

  it('una hoja sintética bien escrita no incumple nada (la base de los sabotajes), con los fotogramas dentro de la consulta o en la raíz', () => {
    expect(incumplimientosDeLaEntrada(hojaConEntrada())).toEqual([])
    expect(incumplimientosDeLaEntrada(hojaConEntrada({ fotogramasEnLaRaiz: true }))).toEqual([])
  })

  it.each<[string, CambiosEnLaHoja, string]>([
    ['duración de 1250 ms en vez de 700 ms', { animacion: 'entrada 1250ms ease-out backwards' }, 'animation: entrada 1250ms ease-out backwards'],
    ['curva "ease" en vez de "ease-out"', { animacion: 'entrada 700ms ease backwards' }, 'animation: entrada 700ms ease backwards'],
    ['relleno "both" en vez de "backwards"', { animacion: 'entrada 700ms ease-out both' }, 'animation: entrada 700ms ease-out both'],
    ['relleno "forwards" en vez de "backwards"', { animacion: 'entrada 700ms ease-out forwards' }, 'animation: entrada 700ms ease-out forwards'],
    ['sin relleno', { animacion: 'entrada 700ms ease-out' }, 'animation: entrada 700ms ease-out]'],
    ['una animación "infinite"', { animacion: 'entrada 700ms ease-out backwards infinite' }, 'backwards infinite'],
    ['retardo del párrafo de 150 ms en vez de 120 ms', { retardos: ['0ms', '150ms', '240ms'] }, 'animation-delay: 150ms'],
    ['retardo del titular de 120 ms en vez de 0 ms', { retardos: ['120ms', '120ms', '240ms'] }, '".contenido h1" declara'],
    ['retardos en orden inverso', { retardos: ['240ms', '120ms', '0ms'] }, 'animation-delay: 240ms'],
    ['el desplazamiento parte de la DERECHA (40 px) y no de la izquierda', { desde: 'opacity: 0; transform: translateX(40px);' }, 'translateX(40px)'],
    ['el desplazamiento es del 100 % y no de 40 px', { desde: 'opacity: 0; transform: translateX(-100%);' }, 'translateX(-100%)'],
    ['un fotograma inicial que ya es opaco', { desde: 'opacity: 1; transform: translateX(-40px);' }, 'el fotograma "from"'],
    ['una propiedad de más en los fotogramas (width)', { desde: 'opacity: 0; transform: translateX(-40px); width: 0;' }, 'width: 0'],
    ['una propiedad de más en los fotogramas (margin-left)', { hasta: 'opacity: 1; transform: none; margin-left: 0;' }, 'margin-left: 0'],
    ['el último fotograma deja la opacidad a 0', { hasta: 'opacity: 0; transform: none;' }, 'el fotograma "to"'],
    ['el último fotograma deja un desplazamiento residual', { hasta: 'opacity: 1; transform: translateX(0.3px);' }, 'translateX(0.3px)'],
    ['la entrada vive en una consulta que no es "no-preference"', { consulta: '@media (max-width: 560px)' }, 'bloques "@media (prefers-reduced-motion: no-preference)"'],
    ['una cuarta animación sobre el enlace del botón', { dentroDeMas: '.acciones a { animation: entrada 700ms ease-out backwards; }' }, '.acciones a'],
    ['"will-change" en un estado base', { fuera: 'will-change: transform;' }, 'declara "will-change"'],
    ['opacidad 0 en el estado base', { fuera: 'opacity: 0;' }, 'deja "opacity: 0" en el estado base'],
    ['visibilidad oculta en el estado base', { fuera: 'visibility: hidden;' }, 'deja "visibility: hidden" en el estado base'],
    ['un desplazamiento en el estado base', { fuera: 'transform: translateX(-40px);' }, 'deja un "transform: translate" en el estado base'],
    ['una animación en la raíz del fichero', { fuera: 'animation: entrada 700ms ease-out backwards;' }, 'declara una animación fuera de "no-preference"'],
    [
      'una animación dentro de "reduce"',
      { enReduce: '@media (prefers-reduced-motion: reduce) { .subtitulo { animation: entrada 700ms ease-out backwards; } }' },
      'declara una animación fuera de "no-preference"',
    ],
  ])('una hoja con %s incumple', (_descripcion, cambios, fragmento) => {
    expect(incumplimientosDeLaEntrada(hojaConEntrada(cambios)).join('\n')).toContain(fragmento)
  })

  it('"opacity: 0.5" y "will-change" dentro de un comentario no son una opacidad 0 ni un "will-change"', () => {
    const comentario = '// will-change: transform'
    expect(incumplimientosDeLaEntrada(hojaConEntrada({ fuera: `opacity: 0.5;\n${comentario}\n` }))).toEqual([])
  })
})

describe('@s1 se muestra el titular principal', () => {
  it('el h1 tiene el nombre accesible exacto y no aparece "Miraflores de la Sierra"', () => {
    const { container } = renderizarHero()

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cuidamos la salud y la felicidad de tu mascota' }),
    ).toBeInTheDocument()
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

describe('@s13 la sección de bienvenida no carga recursos de terceros por atributos DOM', () => {
  it('ningún elemento declara "src"/"srcset" que empiece por "http"', () => {
    const { container } = renderizarHero()

    for (const elemento of container.querySelectorAll('[src], [srcset]')) {
      expect(elemento.getAttribute('src') ?? '').not.toMatch(/^http/)
      expect(elemento.getAttribute('srcset') ?? '').not.toMatch(/^http/)
    }
  })

  it('el destino de cada enlace empieza por "#" (ya no queda ningún "tel:") y hay al menos uno', () => {
    renderizarHero()

    const enlaces = screen.queryAllByRole('link')
    expect(enlaces.length).toBeGreaterThan(0)
    for (const enlace of enlaces) {
      expect((enlace.getAttribute('href') ?? '').startsWith('#')).toBe(true)
    }
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
  it('"--color-sobre-primario" contra el velo de "--color-tinta" al 76 % supera 4,5 con la fotografía en sus dos extremos', () => {
    // Mismo método que `progress/rediseno/fix_uso_del_acento.md` §1 y §3.2: el
    // velo es "color-mix(in srgb, var(--color-tinta) 76%, transparent)" en la
    // parada central donde cae el bloque de lectura, compuesto sobre una
    // fotografía cuyo color real no es conocible en jsdom — se acota por sus
    // dos extremos posibles (negro y blanco puros, `mezclar` reproduce la
    // composición alfa canal a canal): si el texto cumple contra los dos,
    // cumple con cualquier fotografía real de por medio. El h1 y el párrafo
    // heredan la tinta de ".hero" con "color: inherit", así que
    // "--color-sobre-primario" es la pareja real, no una suposición. La
    // feature 49 reescribe este contraste con píxeles reales.
    const UMBRAL_TEXTO_NORMAL = 4.5 // Mínimo WCAG 2.2 AA para texto normal (Enmienda 2 del contrato).
    const PARADA_CENTRAL_DEL_VELO = 0.76
    const NEGRO = '#000000'
    const BLANCO = '#FFFFFF'
    const variantes = ['clinica', 'calida', 'tech', 'eco', 'marca'] as const

    for (const variante of variantes) {
      const tinta = leerTokenDeVariante(TEXTO_REAL_DE_TOKENS, variante, 'tinta')
      const sobrePrimario = leerTokenDeVariante(TEXTO_REAL_DE_TOKENS, variante, 'sobre-primario')

      const veloSobreNegro = mezclar(NEGRO, tinta, PARADA_CENTRAL_DEL_VELO)
      const veloSobreBlanco = mezclar(BLANCO, tinta, PARADA_CENTRAL_DEL_VELO)

      expect(calcularRatioContraste(sobrePrimario, veloSobreNegro)).toBeGreaterThanOrEqual(UMBRAL_TEXTO_NORMAL)
      expect(calcularRatioContraste(sobrePrimario, veloSobreBlanco)).toBeGreaterThanOrEqual(UMBRAL_TEXTO_NORMAL)
    }
  })
})

/**
 * Reparación del 03/09/2026 (oleada B): `accesibilidad.spec.ts` @s38/@s39
 * midieron el anillo de foco de los botones de la bienvenida a 1,98:1
 * contra el fondo que hay bajo el anillo — `--color-tinta`, el `background-color`
 * de `.hero` (`Hero.module.scss`), que es lo que el navegador encuentra al
 * trepar desde el control (los píxeles de la fotografía y del velo `::after`
 * no son ancestros). El anillo global `--color-foco` está pensado para los
 * fondos claros de página; sobre el velo oscuro el anillo semántico correcto
 * es `--color-sobre-primario`, la misma tinta ya validada que pinta el texto
 * del hero. Tras la feature 48 queda UN solo botón, «Reservar cita».
 */
describe('@s38/@s39 de accesibilidad: el anillo de foco de la acción contrasta contra el velo de tinta, en las cinco variantes', () => {
  it('el botón cambia el color del anillo a "--color-sobre-primario" bajo ":focus-visible"', () => {
    const bloqueAcciones = extraerBloqueCss(sinComentarios(TEXTO_REAL_DEL_MODULO), '.acciones {')
    const bloqueBoton = extraerBloqueCss(bloqueAcciones, 'a {')
    const bloqueFoco = extraerBloqueCss(bloqueBoton, '&:focus-visible {')

    expect(bloqueFoco).toContain('outline-color: var(--color-sobre-primario);')
  })

  it('"--color-sobre-primario" alcanza 3 contra "--color-tinta" y contra el velo al 76 % sobre negro y sobre blanco', () => {
    const UMBRAL_COMPONENTE_DE_INTERFAZ = 3 // Mínimo WCAG 2.2 AA para un anillo de foco (SC 2.4.11 / 1.4.11).
    const PARADA_CENTRAL_DEL_VELO = 0.76
    const NEGRO = '#000000'
    const BLANCO = '#FFFFFF'
    const variantes = ['clinica', 'calida', 'tech', 'eco', 'marca'] as const

    for (const variante of variantes) {
      const tinta = leerTokenDeVariante(TEXTO_REAL_DE_TOKENS, variante, 'tinta')
      const sobrePrimario = leerTokenDeVariante(TEXTO_REAL_DE_TOKENS, variante, 'sobre-primario')

      expect(calcularRatioContraste(sobrePrimario, tinta)).toBeGreaterThanOrEqual(UMBRAL_COMPONENTE_DE_INTERFAZ)
      expect(calcularRatioContraste(sobrePrimario, mezclar(NEGRO, tinta, PARADA_CENTRAL_DEL_VELO))).toBeGreaterThanOrEqual(
        UMBRAL_COMPONENTE_DE_INTERFAZ,
      )
      expect(calcularRatioContraste(sobrePrimario, mezclar(BLANCO, tinta, PARADA_CENTRAL_DEL_VELO))).toBeGreaterThanOrEqual(
        UMBRAL_COMPONENTE_DE_INTERFAZ,
      )
    }
  })
})
