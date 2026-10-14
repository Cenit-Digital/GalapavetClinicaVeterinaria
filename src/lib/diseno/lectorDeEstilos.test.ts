import { describe, expect, it } from 'vitest'
import { leerEstilos } from './lectorDeEstilos'

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
    expect(leerEstilos('')).toEqual({ declaraciones: [], fotogramas: [] })
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
    expect(leerEstilos('.a { width: #{ ')).toEqual({ declaraciones: [], fotogramas: [] })
  })
})
