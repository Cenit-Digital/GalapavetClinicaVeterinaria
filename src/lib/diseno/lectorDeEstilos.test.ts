import { describe, expect, it } from 'vitest'
import {
  esLecturaFiable,
  leerEstilos,
  leerFicheros,
  nombreCanonicoDeLaPropiedad,
  rutasSinLecturaFiable,
  valorNormalizado,
  valorSinImportante,
  type EstilosLeidos,
} from './lectorDeEstilos'

/**
 * El lector es la base común de las puertas de movimiento (@s33 de
 * `sistema_de_diseno_visual.feature`, @s8 de `hero_reducido_con_animacion.feature`,
 * @s16 de `identidad_visual.feature` y @s20 de `accesibilidad.feature`): cada
 * caso de aquí es una forma de escribir SCSS que la lectura línea a línea de la
 * que partían esas puertas leía mal.
 */
function leer(lineas: readonly string[]) {
  return leerEstilos([...lineas, ''].join('\n'))
}

describe('lectorDeEstilos: declaraciones y los bloques que las contienen', () => {
  it('una hoja sin ninguna declaración devuelve listas vacías', () => {
    expect(leerEstilos('')).toEqual({ declaraciones: [], fotogramas: [], profundidadFinal: 0, sentenciasNoVerificables: [] })
  })

  it('cada declaración lleva propiedad, valor recortado, línea de arranque y la pila de bloques, del más externo al más interno', () => {
    const estilos = leer([
      '.a {',
      '  color: red;',
      '  @media (prefers-reduced-motion: no-preference) {',
      '    transition:   color 1s ;',
      '  }',
      '}',
    ])

    expect(estilos.declaraciones).toEqual([
      { propiedad: 'color', valor: 'red', linea: 2, bloques: ['regla'] },
      { propiedad: 'transition', valor: 'color 1s', linea: 4, bloques: ['regla', 'no-preference'] },
    ])
  })

  it('una declaración sin punto y coma antes de la llave de cierre también se lee', () => {
    const estilos = leer(['.a {', '  color: red', '}'])

    expect(estilos.declaraciones).toEqual([{ propiedad: 'color', valor: 'red', linea: 2, bloques: ['regla'] }])
  })

  it('una llamada a un mixin con argumentos con nombre ("@include x($p: 1);") no es una declaración', () => {
    const estilos = leer(['.a {', '  @include boton($color: red);', '  color: blue;', '}'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['color'])
  })

  it('un "#" que no abre una interpolación (un color "#fff", un selector "#titulo") no se come lo que le sigue', () => {
    const estilos = leer(['#titulo {', '  color: #fff;', '  transition: color 1s;', '}'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['color', 'transition'])
  })

  it('un "#" pegado al punto y coma ("--marcador: #;") no lo traga: la declaración siguiente se sigue leyendo', () => {
    const estilos = leer(['.a {', '  --marcador: #;', '  color: red;', '}'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['--marcador', 'color'])
  })

  it('un selector que solo CONTIENE "@media" o "@keyframes" entre comillas no es una consulta ni unos fotogramas', () => {
    const estilos = leer([
      '[data-a="@media (prefers-reduced-motion: reduce)"] {',
      '  color: red;',
      '}',
      '[data-b="@keyframes"] {',
      '  color: blue;',
      '}',
    ])

    expect(estilos.fotogramas).toEqual([])
    expect(estilos.declaraciones.map((declaracion) => declaracion.bloques)).toEqual([['regla'], ['regla']])
  })

  it('la línea de una declaración es la de su propiedad aunque el valor y el punto y coma ocupen otras líneas', () => {
    const estilos = leer(['.x {a:', '  1px', '  2px', '  ;', '}'])

    expect(estilos.declaraciones).toEqual([{ propiedad: 'a', valor: '1px\n  2px', linea: 1, bloques: ['regla'] }])
  })

  it('una propiedad de una sola letra que acaba su línea sigue contando en SU línea', () => {
    const estilos = leer(['.x {', '  a', '  : 1px;', '  b', '  : 2px;', '}'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.linea)).toEqual([2, 4])
  })

  it('un encabezado de bloque ("a:hover {") no se confunde con una declaración', () => {
    const estilos = leer(['a:hover {', '  color: red;', '}'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['color'])
  })

  it('una declaración repartida en varias líneas se lee entera y su línea es la de la propiedad', () => {
    const estilos = leer(['.a {', '  transition:', '    transform 300ms ease-out,', '    color 150ms ease-out;', '  color: red;', '}'])

    expect(estilos.declaraciones).toEqual([
      { propiedad: 'transition', valor: 'transform 300ms ease-out,\n    color 150ms ease-out', linea: 2, bloques: ['regla'] },
      { propiedad: 'color', valor: 'red', linea: 5, bloques: ['regla'] },
    ])
  })

  it('un @keyframes con la llave en la línea siguiente se registra en la línea de su "@keyframes"', () => {
    const estilos = leer(['.a {', '  color: red;', '}', '@keyframes entrada', '{', '  to { opacity: 1; }', '}'])

    expect(estilos.fotogramas).toEqual([{ linea: 4, bloques: [] }])
  })

  it('un bloque que abre y cierra en la MISMA línea no deja una llave abierta en la pila', () => {
    const estilos = leer(['@media (prefers-reduced-motion: no-preference) {', '  .a { color: red; }', '}', '.b {', '  color: blue;', '}'])

    expect(estilos.declaraciones).toEqual([
      { propiedad: 'color', valor: 'red', linea: 2, bloques: ['no-preference', 'regla'] },
      { propiedad: 'color', valor: 'blue', linea: 5, bloques: ['regla'] },
    ])
  })

  it('varias declaraciones en una sola línea se leen una a una', () => {
    const estilos = leer(['.a { opacity: 0; animation: x 1s; }'])

    expect(estilos.declaraciones).toEqual([
      { propiedad: 'opacity', valor: '0', linea: 1, bloques: ['regla'] },
      { propiedad: 'animation', valor: 'x 1s', linea: 1, bloques: ['regla'] },
    ])
  })
})

describe('lectorDeEstilos: la consulta de movimiento de cada bloque', () => {
  it('reconoce "no-preference" y "reduce", escritos con cualquier espacio tras los dos puntos, y toda otra consulta es ajena', () => {
    const estilos = leer([
      '@media (prefers-reduced-motion:no-preference) {',
      '  a { color: red; }',
      '}',
      '@media (prefers-reduced-motion:   reduce) {',
      '  a { color: red; }',
      '}',
      '@media (max-width: 560px) {',
      '  a { color: red; }',
      '}',
      '@media (prefers-reduced-motion: reduced) {',
      '  a { color: red; }',
      '}',
    ])

    expect(estilos.declaraciones.map((declaracion) => declaracion.bloques[0])).toEqual([
      'no-preference',
      'reduce',
      'media-ajena',
      'media-ajena',
    ])
  })

  it('una consulta compuesta que menciona "reduce" sigue siendo "reduce"', () => {
    const estilos = leer(['@media (prefers-reduced-motion: reduce) and (min-width: 700px) {', '  a { color: red; }', '}'])

    expect(estilos.declaraciones[0]?.bloques[0]).toBe('reduce')
  })

  it('el encabezado del @media puede ocupar varias líneas', () => {
    const estilos = leer(['@media (min-width: 700px) and', '  (prefers-reduced-motion: no-preference) {', '  a { color: red; }', '}'])

    expect(estilos.declaraciones[0]?.bloques[0]).toBe('no-preference')
  })

  it('un selector que MENCIONA una consulta sin ser un @media no es una consulta', () => {
    const estilos = leer(['.prefers-reduced-motion\\: no-preference {', '  color: red;', '}'])

    expect(estilos.declaraciones[0]?.bloques).toEqual(['regla'])
  })
})

describe('lectorDeEstilos: los @keyframes', () => {
  it('registra cada @keyframes con su línea y los bloques que lo contienen, y las declaraciones de dentro lo llevan en su pila', () => {
    const estilos = leer([
      '@keyframes raiz {',
      '  from { opacity: 0; }',
      '}',
      '@media (prefers-reduced-motion: reduce) {',
      '  @keyframes dentro {',
      '    to {',
      '      opacity: 1;',
      '    }',
      '  }',
      '}',
    ])

    expect(estilos.fotogramas).toEqual([
      { linea: 1, bloques: [] },
      { linea: 5, bloques: ['reduce'] },
    ])
    expect(estilos.declaraciones).toEqual([
      { propiedad: 'opacity', valor: '0', linea: 2, bloques: ['keyframes', 'regla'] },
      { propiedad: 'opacity', valor: '1', linea: 7, bloques: ['reduce', 'keyframes', 'regla'] },
    ])
  })

  it('un selector que contiene la palabra "keyframes" sin ser un @keyframes no cuenta', () => {
    const estilos = leer(['.keyframes {', '  color: red;', '}'])

    expect(estilos.fotogramas).toEqual([])
    expect(estilos.declaraciones[0]?.bloques).toEqual(['regla'])
  })
})

describe('lectorDeEstilos: comentarios', () => {
  it('un comentario "//" antes de un @media no impide reconocerlo', () => {
    const estilos = leer([
      '// Nota: esto es solo un comentario; con punto y coma y { llaves }.',
      '@media (prefers-reduced-motion: no-preference) {',
      '  a { color: red; }',
      '}',
    ])

    expect(estilos.declaraciones).toEqual([{ propiedad: 'color', valor: 'red', linea: 3, bloques: ['no-preference', 'regla'] }])
  })

  it('un comentario "//" al final de una línea de código no cuenta, aunque lleve "transition: x;"', () => {
    const estilos = leer(['.a:hover { color: red; } // transition: fake;'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['color'])
  })

  it('un comentario de bloque, aunque ocupe varias líneas y lleve llaves y puntos y coma, no cuenta y no corre los números de línea', () => {
    const estilos = leer([
      '/* antes:',
      '   .x { animation: y 1s; }',
      '   @media (prefers-reduced-motion: no-preference) {',
      '*/',
      '.a {',
      '  color: red; /* y esto { } ; tampoco */',
      '  color: blue;',
      '}',
    ])

    expect(estilos.declaraciones).toEqual([
      { propiedad: 'color', valor: 'red', linea: 6, bloques: ['regla'] },
      { propiedad: 'color', valor: 'blue', linea: 7, bloques: ['regla'] },
    ])
  })

  it('una "//" que no empieza un comentario (dentro de una URL) no se recorta: la declaración siguiente se sigue leyendo', () => {
    const estilos = leer(['.a {', '  background: url(http://ejemplo.test/x.png); transition: color 1s;', '}'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['background', 'transition'])
  })

  it('un comentario entre dos fragmentos de un valor no los pega: sigue habiendo un blanco entre ellos', () => {
    const estilos = leer(['.a {', '  margin: 1px/* separador */2px;', '}'])

    expect(estilos.declaraciones[0]?.valor).toMatch(/^1px\s+2px$/)
  })

  it('una "//" pegada al inicio de la hoja es un comentario', () => {
    const estilos = leer(['// {', '.a { color: red; }'])

    expect(estilos.declaraciones).toEqual([{ propiedad: 'color', valor: 'red', linea: 2, bloques: ['regla'] }])
  })
})

describe('lectorDeEstilos: interpolación de Sass', () => {
  it('una interpolación "#{…}" dentro de un valor no abre ningún bloque y el valor se lee entero', () => {
    const estilos = leer(['.a {', '  transition: color #{$duracion} ease-out;', '  width: min(100% - #{espaciado(48)}, 900px);', '}'])

    expect(estilos.declaraciones).toEqual([
      { propiedad: 'transition', valor: 'color #{$duracion} ease-out', linea: 2, bloques: ['regla'] },
      { propiedad: 'width', valor: 'min(100% - #{espaciado(48)}, 900px)', linea: 3, bloques: ['regla'] },
    ])
  })

  it('una interpolación con llaves anidadas se consume entera', () => {
    const estilos = leer(['.a {', '  width: #{map-get((a: 1), a)}px;', '  color: red;', '}'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['width', 'color'])
  })

  it('una interpolación sin cerrar no cuelga la lectura', () => {
    expect(leerEstilos('.a { width: #{ ')).toEqual({
      declaraciones: [],
      fotogramas: [],
      profundidadFinal: 1,
      sentenciasNoVerificables: [],
    })
  })
})

/**
 * B7 de la revisión independiente de la feature 48: `lineaDe` hacía `slice` y
 * `split` del texto ENTERO por cada sentencia, así que el coste crecía con el
 * cuadrado del tamaño de la hoja (medido: 20.000 declaraciones, 371 KB, 8 s). La
 * cota de aquí es holgada a propósito (el lector lineal tarda decenas de
 * milisegundos): solo separa lo lineal de lo cuadrático, no mide el rendimiento.
 */
const DECLARACIONES_DE_LA_HOJA_GRANDE = 20_000
const COTA_DE_LA_LECTURA_LINEAL_MS = 2_000
const LINEAS_POR_REGLA = 3

describe('lectorDeEstilos: el coste de leer una hoja grande es lineal', () => {
  it('lee 20.000 declaraciones en menos de 2 s y cada una lleva SU línea', () => {
    const hoja = Array.from({ length: DECLARACIONES_DE_LA_HOJA_GRANDE }, (_, orden) => `.r${orden} {\n  color: red;\n}\n`).join('')
    const antes = performance.now()

    const estilos = leerEstilos(hoja)

    expect(performance.now() - antes).toBeLessThan(COTA_DE_LA_LECTURA_LINEAL_MS)
    expect(estilos.declaraciones).toHaveLength(DECLARACIONES_DE_LA_HOJA_GRANDE)
    expect(estilos.declaraciones.at(-1)?.linea).toBe(DECLARACIONES_DE_LA_HOJA_GRANDE * LINEAS_POR_REGLA - 1)
  })
})

/**
 * B1 de la revisión independiente de la feature 48 (silencios #3, typescript #3).
 * Cada caso se lee con los dos finales de línea, el de Unix y el de Windows
 * (`core.autocrlf = true` los entrega así en un clon limpio en Windows), y los dos
 * resultados tienen que ser IDÉNTICOS.
 */
function leerConLfYCrlf(lineas: readonly string[]) {
  const conLf = leerEstilos([...lineas, ''].join('\n'))
  const conCrlf = leerEstilos([...lineas, ''].join('\r\n'))
  expect(conCrlf).toEqual(conLf)
  return conLf
}

describe('lectorDeEstilos B1(a): una "//" pegada a ";", "{" o "}" también abre un comentario', () => {
  it.each([
    ['pegada a un punto y coma', ['.m { color: red;// nota', '  animation: x 900ms 77ms; }'], ['color', 'animation']],
    ['pegada a una llave de apertura', ['.m {// nota', '  animation: x 900ms 77ms; }'], ['animation']],
    ['pegada a una llave de cierre', ['.m { .n { color: red; }// nota', '  animation: x 900ms 77ms; }'], ['color', 'animation']],
  ])('%s: la declaración de la línea siguiente se sigue leyendo', (_caso, lineas, propiedades) => {
    const estilos = leerConLfYCrlf(lineas)

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(propiedades)
    expect(estilos.declaraciones.at(-1)).toMatchObject({ propiedad: 'animation', valor: 'x 900ms 77ms', linea: 2 })
  })
})

describe('lectorDeEstilos: los finales de línea de Windows dan la misma lectura que los de Unix', () => {
  it('una declaración de varias líneas lleva el MISMO valor con CRLF que con LF, sin retornos de carro dentro', () => {
    const estilos = leerConLfYCrlf(['.a {', '  transition:', '    transform 300ms ease-out,', '    color 150ms ease-out;', '}'])

    expect(estilos.declaraciones[0]?.valor).toBe('transform 300ms ease-out,\n    color 150ms ease-out')
  })
})

describe('lectorDeEstilos B1(b)(c): una cadena entrecomillada es texto, nunca estructura', () => {
  it.each([
    ['comillas dobles', '"ver // mas"'],
    ['comillas simples', "'ver // mas'"],
  ])('una "//" con blanco delante DENTRO de una cadena (%s) no abre un comentario: el valor llega entero y la declaración siguiente se lee', (_caso, cadena) => {
    const estilos = leerConLfYCrlf([`.a { content: ${cadena};`, '  animation: x 700ms ease-out; }'])

    expect(estilos.declaraciones).toEqual([
      { propiedad: 'content', valor: cadena, linea: 1, bloques: ['regla'] },
      { propiedad: 'animation', valor: 'x 700ms ease-out', linea: 2, bloques: ['regla'] },
    ])
  })

  it('un "/*" dentro de una cadena no abre un comentario de bloque', () => {
    const estilos = leerConLfYCrlf(['.a { content: "/* no es un comentario";', '  animation: x 700ms; }'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['content', 'animation'])
  })

  it.each([
    ['una llave de apertura', '"{"'],
    ['una llave de cierre', '"}"'],
    ['las dos, con un punto y coma', '"{;}"'],
  ])('%s dentro de una cadena no desordena la pila: lo que viene DESPUÉS de cerrar la consulta se lee en la raíz', (_caso, cadena) => {
    const estilos = leerConLfYCrlf([
      '@media (prefers-reduced-motion: no-preference) {',
      `  .b::before { content: ${cadena}; }`,
      '}',
      '.m { animation: x 900ms 77ms; }',
    ])

    expect(estilos.declaraciones.map((declaracion) => declaracion.bloques)).toEqual([['no-preference', 'regla'], ['regla']])
    expect(estilos.declaraciones[1]).toMatchObject({ propiedad: 'animation', valor: 'x 900ms 77ms', linea: 4 })
  })

  it('una comilla dentro de un comentario no abre una cadena: ni la de "//" ni la de "/* */"', () => {
    const estilos = leerConLfYCrlf([
      "// no se lo digas a nadie, que don't cuenta",
      '.a { color: red; /* y "esto" tampoco */',
      '  animation: x 700ms; }',
    ])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['color', 'animation'])
  })

  it('una comilla escapada DENTRO de la cadena no la cierra', () => {
    const estilos = leerConLfYCrlf(['.a { content: "dice \\"{\\" y no cierra"; animation: x 700ms; }'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['content', 'animation'])
    expect(estilos.declaraciones[0]?.valor).toBe('"dice \\"{\\" y no cierra"')
  })

  it('una cadena con una comilla del otro tipo dentro ("it\'s") sigue siendo una sola cadena', () => {
    const estilos = leerConLfYCrlf(['.a { content: "it\'s {"; animation: x 700ms; }'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['content', 'animation'])
  })
})

describe('lectorDeEstilos B1(c): la barra invertida escapa el carácter que le sigue', () => {
  it.each([
    ['una llave de apertura en un selector', '.a\\{ { color: red; }'],
    ['una llave de cierre en un selector', '.a\\} { color: red; }'],
    ['una comilla doble en un selector', '.a\\" { color: red; }'],
    ['una comilla simple en un selector', ".a\\' { color: red; }"],
  ])('%s no abre ni cierra nada: lo que viene después de la consulta se lee en la raíz', (_caso, regla) => {
    const estilos = leerConLfYCrlf([
      '@media (prefers-reduced-motion: no-preference) {',
      `  ${regla}`,
      '}',
      '.m { animation: x 900ms 77ms; }',
    ])

    expect(estilos.declaraciones.map((declaracion) => declaracion.bloques)).toEqual([['no-preference', 'regla'], ['regla']])
    expect(estilos.profundidadFinal).toBe(0)
  })
})

describe('lectorDeEstilos B1(d): la profundidad final de la pila dice si las llaves cuadran', () => {
  it('una hoja equilibrada acaba con profundidad 0', () => {
    const estilos = leerConLfYCrlf(['.a {', '  .b { color: red; }', '}'])

    expect(estilos.profundidadFinal).toBe(0)
  })

  it('una llave de apertura sin cerrar deja profundidad 1 y lo leído hasta ahí sigue disponible', () => {
    const estilos = leerConLfYCrlf(['.a {', '  color: red;'])

    expect(estilos.profundidadFinal).toBe(1)
    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['color'])
  })

  it('una llave de apertura sin cerrar dentro de otra deja profundidad 2', () => {
    const estilos = leerConLfYCrlf(['@media (max-width: 1px) {', '  .a {', '    color: red;'])

    expect(estilos.profundidadFinal).toBe(2)
  })

  it.each([
    ['una llave de cierre de más al final', ['.a { color: red; }', '}'], 1],
    ['dos llaves de cierre de más', ['}', '}'], 2],
    ['una llave de cierre de más seguida de una regla completa', ['}', '.a { color: red; }'], 1],
    ['una llave de cierre de más y una de apertura sin cerrar no se compensan', ['}', '.a {'], 2],
  ])('%s: ninguna hoja con llaves que no cuadran puede parecer en orden', (_caso, lineas, profundidad) => {
    const estilos = leerConLfYCrlf(lineas)

    expect(estilos.profundidadFinal).toBe(profundidad)
  })
})

describe('lectorDeEstilos B1(e): lo que el lector no sabe leer se declara, no se descarta en silencio', () => {
  it.each([
    ['la interpolación es el nombre entero', '#{$p}: x 900ms 77ms;'],
    ['la interpolación abre el nombre', '#{$p}-delay: 77ms;'],
    ['la interpolación cierra el nombre', 'animation-#{$p}: x;'],
    ['la interpolación va en medio del nombre', 'animation-#{$p}-delay: 77ms;'],
    ['hay dos interpolaciones en el nombre', '#{$a}-#{$b}: x;'],
  ])('%s: la sentencia se declara no verificable, con su línea, y no se confunde con la declaración vecina', (_caso, sentencia) => {
    const estilos = leerConLfYCrlf(['.a {', `  ${sentencia}`, '  color: red;', '}'])

    expect(estilos.sentenciasNoVerificables).toEqual([{ linea: 2 }])
    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['color'])
  })

  it('una sentencia con interpolación en el nombre y sin punto y coma antes de la llave de cierre también se declara', () => {
    const estilos = leerConLfYCrlf(['.a { color: red;', '  #{$p}: x }'])

    expect(estilos.sentenciasNoVerificables).toEqual([{ linea: 2 }])
  })

  it('una propiedad personalizada con interpolación en el nombre (--#{$n}) nunca es de movimiento: no se declara', () => {
    const estilos = leerConLfYCrlf(['.a {', '  --#{$n}: 1s;', '}'])

    expect(estilos.sentenciasNoVerificables).toEqual([])
    expect(estilos.declaraciones).toEqual([])
  })

  it('una interpolación en el VALOR no hace no verificable la sentencia', () => {
    const estilos = leerConLfYCrlf(['.a {', '  transition: color #{$duracion} ease-out;', '}'])

    expect(estilos.sentenciasNoVerificables).toEqual([])
    expect(estilos.declaraciones).toHaveLength(1)
  })

  it('una interpolación en un selector o en el encabezado de un bloque no hace no verificable nada', () => {
    const estilos = leerConLfYCrlf(['.boton-#{$tipo}:hover {', '  color: red;', '}'])

    expect(estilos.sentenciasNoVerificables).toEqual([])
    expect(estilos.declaraciones).toHaveLength(1)
  })

  it.each([
    ['comillas dobles', '"abc'],
    ['comillas simples', "'abc"],
  ])('una cadena con %s que no se cierra en su línea se declara no verificable, con la línea de la comilla', (_caso, cadena) => {
    const estilos = leerConLfYCrlf(['.a {', '  color: red;', `  content: ${cadena};`, '  animation: x 900ms 77ms; }'])

    expect(estilos.sentenciasNoVerificables).toEqual([{ linea: 3 }])
  })

  it('las cadenas bien cerradas, también las que llevan la comilla del otro tipo o una comilla escapada, no se declaran', () => {
    const estilos = leerConLfYCrlf(['.a { content: "it\'s"; font-family: \'Outfit\', "DM Sans"; }'])

    expect(estilos.sentenciasNoVerificables).toEqual([])
  })

  it('una hoja que no tiene nada que no sepa leer devuelve la lista vacía', () => {
    expect(leerEstilos('.a { color: red; }')).toEqual(expect.objectContaining({ sentenciasNoVerificables: [] }))
  })
})

const HOJA_FIABLE: EstilosLeidos = { declaraciones: [], fotogramas: [], profundidadFinal: 0, sentenciasNoVerificables: [] }

describe('esLecturaFiable: una hoja se da por leída solo si no queda nada sin cuadrar ni sin leer', () => {
  it('una hoja equilibrada y sin sentencias no verificables es fiable', () => {
    expect(esLecturaFiable(HOJA_FIABLE)).toBe(true)
  })

  it.each([1, 2, 7])('una profundidad final de %i la deja sin fiar', (profundidadFinal) => {
    expect(esLecturaFiable({ ...HOJA_FIABLE, profundidadFinal })).toBe(false)
  })

  it('una sola sentencia no verificable la deja sin fiar, aunque las llaves cuadren', () => {
    expect(esLecturaFiable({ ...HOJA_FIABLE, sentenciasNoVerificables: [{ linea: 4 }] })).toBe(false)
  })

  it('con las dos cosas a la vez tampoco es fiable', () => {
    expect(esLecturaFiable({ ...HOJA_FIABLE, profundidadFinal: 1, sentenciasNoVerificables: [{ linea: 4 }] })).toBe(false)
  })

  it('la lectura de una hoja real con llaves que cuadran es fiable, y la de la misma hoja sin su última llave no', () => {
    expect(esLecturaFiable(leerEstilos('.a { color: red; }'))).toBe(true)
    expect(esLecturaFiable(leerEstilos('.a { color: red;'))).toBe(false)
    expect(esLecturaFiable(leerEstilos('.a { #{$p}: red; }'))).toBe(false)
  })
})

describe('lectorDeEstilos B5: el nombre canónico de una propiedad no depende de las mayúsculas ni del prefijo de fabricante', () => {
  it.each([
    ['animation', 'animation'],
    ['ANIMATION', 'animation'],
    ['Transition-Delay', 'transition-delay'],
    ['-webkit-animation', 'animation'],
    ['-webkit-transition', 'transition'],
    ['-moz-transition-duration', 'transition-duration'],
    ['-ms-animation-delay', 'animation-delay'],
    ['-o-animation', 'animation'],
    ['-khtml-opacity', 'opacity'],
    ['-WEBKIT-Animation', 'animation'],
  ])('"%s" se lee como "%s"', (escrito, canonico) => {
    expect(nombreCanonicoDeLaPropiedad(escrito)).toBe(canonico)
  })

  it('una propiedad personalizada ("--animation") o con un solo guion ("-animation") no pierde nada: no tiene prefijo de fabricante', () => {
    expect(nombreCanonicoDeLaPropiedad('--animation')).toBe('--animation')
    expect(nombreCanonicoDeLaPropiedad('-animation')).toBe('-animation')
  })

  it('un guion en medio del nombre no es un prefijo: "mi-animation" y "a-b-c" quedan como están', () => {
    expect(nombreCanonicoDeLaPropiedad('mi-animation')).toBe('mi-animation')
    expect(nombreCanonicoDeLaPropiedad('a-b-c')).toBe('a-b-c')
  })
})

describe('lectorDeEstilos: el valor sin "!important" y el valor normalizado', () => {
  it.each([
    ['0', '0'],
    ['0 !important', '0'],
    ['0!important', '0'],
    ['hidden  !  important', 'hidden'],
    ['none !IMPORTANT', 'none'],
    ['x 900ms ease-out   !important', 'x 900ms ease-out'],
    ['hidden !important  ', 'hidden'],
  ])('"%s" sin su "!important" es "%s"', (escrito, sin) => {
    expect(valorSinImportante(escrito)).toBe(sin)
  })

  it('un "!important" que no está al final no se toca', () => {
    expect(valorSinImportante('a !important b')).toBe('a !important b')
  })

  it('el valor normalizado va en minúsculas y sin "!important"', () => {
    expect(valorNormalizado('HIDDEN !Important')).toBe('hidden')
    expect(valorNormalizado('None')).toBe('none')
  })
})

/**
 * B2 de la revisión de la feature 48 (typescript #4, silencios #4a, vacuidad H5).
 * El clasificador de `@media` miraba si el TEXTO contenía "prefers-reduced-motion:
 * no-preference", y una consulta que también se cumple con movimiento reducido
 * (`not`, `or`, una coma, un `and` con la condición contraria) daba por
 * "no-preference" lo que no lo es. Aquí cada consulta se lee de verdad: solo es
 * "no-preference" la que es exactamente esa condición, a lo sumo unida con `and`
 * a otras.
 */
function tipoDeLaConsulta(consulta: string): string | undefined {
  const estilos = leerConLfYCrlf([`${consulta} {`, '  .a { color: red; }', '}'])
  return estilos.declaraciones[0]?.bloques[0]
}

describe('lectorDeEstilos B2: solo es "no-preference" la consulta que es exactamente esa condición', () => {
  it.each([
    '@media (prefers-reduced-motion: no-preference)',
    '@media (prefers-reduced-motion:no-preference)',
    '@media ( prefers-reduced-motion : no-preference )',
    '@media (PREFERS-REDUCED-MOTION: NO-PREFERENCE)',
    '@MEDIA (prefers-reduced-motion: no-preference)',
    '@media(prefers-reduced-motion: no-preference)',
    '@media screen and (prefers-reduced-motion: no-preference)',
    '@media only screen and (prefers-reduced-motion: no-preference)',
    '@media (min-width: 700px) and (prefers-reduced-motion: no-preference) and (max-width: 900px)',
    '@media (prefers-reduced-motion: no-preference) and (prefers-reduced-motion: no-preference)',
  ])('"%s" es no-preference', (consulta) => {
    expect(tipoDeLaConsulta(consulta)).toBe('no-preference')
  })

  it.each([
    '@media (prefers-reduced-motion: reduce)',
    '@media (prefers-reduced-motion:reduce)',
    '@media ( prefers-reduced-motion : reduce )',
    '@media (PREFERS-REDUCED-MOTION: REDUCE)',
    '@MEDIA (prefers-reduced-motion: reduce)',
    '@media screen and (prefers-reduced-motion: reduce) and (min-width: 700px)',
  ])('"%s" es reduce', (consulta) => {
    expect(tipoDeLaConsulta(consulta)).toBe('reduce')
  })

  it.each([
    '@media not (prefers-reduced-motion: no-preference)',
    '@media not all and (prefers-reduced-motion: no-preference)',
    '@media (not (prefers-reduced-motion: no-preference))',
    '@media (prefers-reduced-motion: no-preference), (max-width: 560px)',
    '@media (prefers-reduced-motion: no-preference),print',
    '@media (prefers-reduced-motion: no-preference) or (min-width: 0)',
    '@media (prefers-reduced-motion: no-preference) OR (min-width: 0)',
    '@media (prefers-reduced-motion: no-preference) and (prefers-reduced-motion: reduce)',
    '@media (prefers-reduced-motion: reduce) and (prefers-reduced-motion: no-preference)',
    '@media (prefers-reduced-motion: no-preference) and (min-width: #{$punto})',
    '@media not (prefers-reduced-motion: reduce)',
    '@media (prefers-reduced-motion: reduce), print',
    '@media (prefers-reduced-motion: reduce) or (min-width: 1px)',
    '@media (prefers-reduced-motion: #{$valor})',
    '@media (prefers-reduced-motion: reduced)',
    '@media (prefers-reduced-motion)',
    '@media (max-width: 560px)',
    '@media print',
  ])('"%s" es media-ajena: no se puede dar por cubierta ni por reducida', (consulta) => {
    expect(tipoDeLaConsulta(consulta)).toBe('media-ajena')
  })

  it.each(['x-not', 'not-x', 'notation', 'denot', 'x-or', 'or-x', 'orientation', 'color', 'min-color'])(
    'una característica llamada "%s" no es un "not" ni un "or": la consulta sigue siendo no-preference',
    (nombre) => {
      expect(tipoDeLaConsulta(`@media (${nombre}: 1) and (prefers-reduced-motion: no-preference)`)).toBe('no-preference')
    },
  )

  it('"@mediaquery" no es un @media', () => {
    expect(tipoDeLaConsulta('@mediaquery (prefers-reduced-motion: no-preference)')).toBe('regla')
  })
})

describe('lectorDeEstilos B2: los fotogramas con prefijo de fabricante o en mayúsculas también son fotogramas', () => {
  it.each(['@keyframes', '@-webkit-keyframes', '@-moz-keyframes', '@KEYFRAMES', '@-WEBKIT-Keyframes', '@keyframes  '])(
    '"%s entrada" se registra como @keyframes y sus declaraciones llevan el bloque "keyframes"',
    (arranque) => {
      const estilos = leerConLfYCrlf(['@media (prefers-reduced-motion: reduce) {', `  ${arranque} entrada {`, '    to { opacity: 1; }', '  }', '}'])

      expect(estilos.fotogramas).toEqual([{ linea: 2, bloques: ['reduce'] }])
      expect(estilos.declaraciones[0]?.bloques).toEqual(['reduce', 'keyframes', 'regla'])
    },
  )

  it('"@keyframesx" no es un @keyframes', () => {
    expect(leerEstilos('@keyframesx entrada { to { opacity: 1; } }').fotogramas).toEqual([])
  })
})

describe('lectorDeEstilos: leer varios ficheros y nombrar los que no se pueden leer enteros', () => {
  const FICHEROS = [
    { ruta: '/prueba/uno.scss', contenido: '.a { color: red; }' },
    { ruta: '/prueba/dos.scss', contenido: '.b {\n  color: blue;\n' },
    { ruta: '/prueba/tres.scss', contenido: '.c { #{$p}: x; }' },
    { ruta: '/prueba/cuatro.scss', contenido: '.d { color: green; }' },
  ]

  it('leerFicheros lee cada fichero con su ruta y en el mismo orden', () => {
    const leidos = leerFicheros(FICHEROS)

    expect(leidos.map((leido) => leido.ruta)).toEqual(['/prueba/uno.scss', '/prueba/dos.scss', '/prueba/tres.scss', '/prueba/cuatro.scss'])
    expect(leidos[0]?.estilos).toEqual(leerEstilos('.a { color: red; }'))
    expect(leidos[1]?.estilos.profundidadFinal).toBe(1)
  })

  it('rutasSinLecturaFiable nombra solo las hojas sin lectura fiable, en el orden en que llegan', () => {
    expect(rutasSinLecturaFiable(leerFicheros(FICHEROS))).toEqual(['/prueba/dos.scss', '/prueba/tres.scss'])
  })

  it('sin ningún fichero no hay nada que nombrar', () => {
    expect(leerFicheros([])).toEqual([])
    expect(rutasSinLecturaFiable([])).toEqual([])
  })
})

/**
 * Casos que pidió la prueba de mutación (Stryker, ola 4B): cada uno separa el
 * lector de una variante suya con un defecto, y cada uno es una forma legítima de
 * escribir SCSS.
 */
describe('lectorDeEstilos: casos que fijan el lexer de comentarios y cadenas', () => {
  it('un comentario de bloque sin cerrar llega hasta el final de la hoja, como en CSS: lo que sigue no se lee', () => {
    const estilos = leerConLfYCrlf(['.a { color: red; }', '/* nota sin cerrar', '.b { animation: x 1s; }'])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['color'])
    expect(estilos.profundidadFinal).toBe(0)
  })

  it.each([
    ['comillas dobles', '"'],
    ['comillas simples', "'"],
  ])('una cadena con %s puede seguir en la línea siguiente con una barra invertida al final de la línea, y sus llaves no cuentan', (_caso, comilla) => {
    const estilos = leerConLfYCrlf([`.a { content: ${comilla}uno\\`, `dos {${comilla}; animation: x 1s; }`])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['content', 'animation'])
    expect(estilos.declaraciones[0]?.valor).toBe(`${comilla}uno\\\ndos {${comilla}`)
    expect(estilos.declaraciones[1]).toMatchObject({ propiedad: 'animation', linea: 2 })
    expect(estilos.profundidadFinal).toBe(0)
    expect(estilos.sentenciasNoVerificables).toEqual([])
  })

  it.each([
    ['comillas dobles', '"'],
    ['comillas simples', "'"],
  ])('una cadena con %s que lleva su propia comilla escapada y una llave detrás no se cierra en la comilla escapada', (_caso, comilla) => {
    const estilos = leerConLfYCrlf([`.a { content: ${comilla}dice \\${comilla}{\\${comilla} y sigue${comilla}; animation: x 1s; }`])

    expect(estilos.declaraciones.map((declaracion) => declaracion.propiedad)).toEqual(['content', 'animation'])
    expect(estilos.profundidadFinal).toBe(0)
    expect(estilos.sentenciasNoVerificables).toEqual([])
  })

  it('una barra invertida al final de una línea FUERA de una cadena no escapa el salto de línea: las líneas siguen contando', () => {
    const estilos = leerConLfYCrlf(['.a\\', '{', '  color: red;', '}'])

    expect(estilos.declaraciones).toEqual([{ propiedad: 'color', valor: 'red', linea: 3, bloques: ['regla'] }])
  })
})
