import { describe, expect, it } from 'vitest'
import { FAMILIAS_DEL_RESET, comprobarFamiliasDelReset, declaracionesDelSelector, extraerReglas, RUTA_HOJA_GLOBAL, contarImportacionesDeHojaGlobal, selectoresDeDocumentoDeclarados, valorDeclarado, variablesCssUsadas } from './hojaGlobal'

describe('@s12 un fichero de módulo no puede declarar reglas para el documento', () => {
  it('señala los selectores de documento que un módulo declara, en orden de aparición', () => {
    const modulo = ['body {', '  margin: 0;', '}', '', '#root {', '  isolation: isolate;', '}', ''].join('\n')

    expect(selectoresDeDocumentoDeclarados(modulo)).toEqual(['body', '#root'])
  })

  it('un selector que solo CONTIENE el nombre del documento no cuenta como el selector desnudo', () => {
    const modulo = ['.body {', '  color: red;', '}', '#rootModal {', '  z-index: 1;', '}', 'html[data-variante] .htmlish {', '  color: red;', '}', ''].join('\n')

    expect(selectoresDeDocumentoDeclarados(modulo)).toEqual([])
  })

  it('una línea que no abre ningún bloque no aporta ningún selector', () => {
    expect(selectoresDeDocumentoDeclarados('  color: body;\n')).toEqual([])
  })

  it('un mismo selector de documento declarado dos veces se nombra una sola vez', () => {
    const modulo = ['body {', '  margin: 0;', '}', 'body {', '  color: red;', '}', ''].join('\n')

    expect(selectoresDeDocumentoDeclarados(modulo)).toEqual(['body'])
  })

  it('reconoce el selector de documento dentro de una lista de selectores separada por comas', () => {
    expect(selectoresDeDocumentoDeclarados('html, body {\n  height: 100%;\n}\n')).toEqual(['html', 'body'])
  })
})

describe('@s12 recuento de importaciones de la hoja global', () => {
  it('un módulo que no la importa devuelve 0', () => {
    expect(contarImportacionesDeHojaGlobal("import { App } from './App'\n", RUTA_HOJA_GLOBAL)).toBe(0)
  })

  it('una importación por efecto secundario, sin cláusula "from", cuenta como una', () => {
    expect(contarImportacionesDeHojaGlobal("import './styles/global.scss'\n", RUTA_HOJA_GLOBAL)).toBe(1)
  })

  it('una importación con cláusula "from" también cuenta', () => {
    expect(contarImportacionesDeHojaGlobal("import hoja from '../styles/global.scss'\n", RUTA_HOJA_GLOBAL)).toBe(1)
  })

  it('dos importaciones de la misma hoja, escritas con rutas distintas, cuentan como dos', () => {
    const modulo = ["import './styles/global.scss'", "import '@styles/global.scss'", ''].join('\n')

    expect(contarImportacionesDeHojaGlobal(modulo, RUTA_HOJA_GLOBAL)).toBe(2)
  })

  it('la importación de otra hoja del mismo directorio no cuenta', () => {
    expect(contarImportacionesDeHojaGlobal("import './styles/otra-hoja.scss'\n", RUTA_HOJA_GLOBAL)).toBe(0)
  })

  it('una ruta de hoja que no empieza por "src/" se compara tal cual', () => {
    expect(contarImportacionesDeHojaGlobal("import './styles/global.scss'\n", 'styles/global.scss')).toBe(1)
  })

  it('la constante de ruta apunta a la hoja global del proyecto', () => {
    expect(RUTA_HOJA_GLOBAL).toBe('src/styles/global.scss')
  })
})

describe('@s12 el patrón de importación reconoce espaciado y sangría alternativos', () => {
  it('una importación indentada (con espacios antes de "import") sigue contando', () => {
    expect(contarImportacionesDeHojaGlobal("  import './styles/global.scss'\n", RUTA_HOJA_GLOBAL)).toBe(1)
  })

  it('una importación por efecto secundario con dos espacios tras "import" sigue contando', () => {
    expect(contarImportacionesDeHojaGlobal("import  './styles/global.scss'\n", RUTA_HOJA_GLOBAL)).toBe(1)
  })

  it('una importación con dos espacios tras "from" sigue contando', () => {
    expect(contarImportacionesDeHojaGlobal("import hoja from  './styles/global.scss'\n", RUTA_HOJA_GLOBAL)).toBe(1)
  })
})

describe('@s13 el inventario de familias de reglas del reset es el de la Decisión 29', () => {
  /** Literal escrito a mano: la declaración que identifica a cada una de las nueve familias, en su orden. */
  const DECLARACION_TESTIGO_DE_CADA_FAMILIA: readonly string[] = [
    'box-sizing: border-box',
    'margin: 0',
    'margin-block: 0',
    'font: inherit',
    'display: block',
    'min-height: 100svh',
    '-webkit-text-size-adjust: 100%',
    'isolation: isolate',
    'text-wrap: balance',
  ]

  it('el inventario declara exactamente nueve familias, numeradas de 1 a 9', () => {
    expect(FAMILIAS_DEL_RESET.map((familia) => familia.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('cada familia del inventario exige la declaración testigo escrita a mano para su posición', () => {
    const testigos = FAMILIAS_DEL_RESET.map((familia) => familia.reglasExigidas.flatMap((regla) => regla.declaraciones))

    DECLARACION_TESTIGO_DE_CADA_FAMILIA.forEach((testigo, indice) => {
      expect(testigos[indice]).toContain(testigo)
    })
  })
})

describe('@s13 la puerta que busca cada familia de reglas en el texto de la hoja', () => {
  const hojaConSoloUnaFamilia = ['body {', '  margin: 0;', '}', ''].join('\n')

  it('nombra las familias que faltan y suspende', () => {
    const informe = comprobarFamiliasDelReset(hojaConSoloUnaFamilia, FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes.map((familia) => familia.numero)).toEqual([1, 3, 4, 5, 6, 7, 8, 9])
    expect(informe.pasa).toBe(false)
  })

  it('cuenta como comprobadas todas las familias del inventario, no solo las que encuentra', () => {
    expect(comprobarFamiliasDelReset(hojaConSoloUnaFamilia, FAMILIAS_DEL_RESET).familiasComprobadas).toBe(9)
  })
})

describe('@s13 cada familia del inventario declara su descripción exacta, en su posición', () => {
  /** Literal escrito a mano: la descripción completa de cada una de las nueve familias, en su orden. */
  const DESCRIPCION_DE_CADA_FAMILIA: readonly string[] = [
    'el modelo de caja predecible alcanza también a los pseudoelementos',
    'el cuerpo deja de arrastrar el margen de 8px de la hoja del agente de usuario',
    'los márgenes de bloque en "em" que colapsan se anulan: el ritmo vertical lo gobierna la escala de espaciado',
    'los controles heredan tipografía y color: la spec de renderizado se los reasigna al sistema',
    'los medios dejan de tener el hueco de la línea base y nunca desbordan su contenedor',
    'el cuerpo aplica de verdad los tokens del documento: alto, interlineado, fondo, color y familia, a la vez',
    'el ajuste automático de tamaño de texto al girar el móvil no reescala la tipografía',
    'el contenedor de montaje crea su propio contexto de apilamiento',
    'los titulares equilibran sus líneas y la prosa evita la línea huérfana, nunca sobre "body" por su coste de rendimiento',
  ]

  it('las nueve descripciones, en orden, son exactamente las de la Decisión 29', () => {
    expect(FAMILIAS_DEL_RESET.map((familia) => familia.descripcion)).toEqual(DESCRIPCION_DE_CADA_FAMILIA)
  })
})

describe('@s13 comprobarFamiliasDelReset exige el selector correcto, no solo la declaración correcta', () => {
  it('una regla que declara la propiedad exigida sobre un selector DISTINTO no satisface la familia', () => {
    const hojaConSelectoresIncorrectos = [
      'div {', '  box-sizing: border-box;', '}',
      'span {', '  margin: 0;', '}',
      'article {', '  margin-block: 0;', '}',
      'div {', '  font: inherit;', '  color: inherit;', '}',
      'div {', '  display: block;', '  max-width: 100%;', '}',
      'div {',
      '  min-height: 100svh;',
      '  line-height: 1.5;',
      '  background-color: var(--color-fondo);',
      '  color: var(--color-texto);',
      '  font-family: var(--fuente-texto);',
      '}',
      'div {', '  -webkit-text-size-adjust: 100%;', '}',
      'div {', '  isolation: isolate;', '}',
      'div {', '  text-wrap: balance;', '}',
      'p, li {', '  text-wrap: pretty;', '}',
      '',
    ].join('\n')

    const informe = comprobarFamiliasDelReset(hojaConSelectoresIncorrectos, FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes.map((familia) => familia.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('la family 9 exige TODOS los encabezados h1-h6 en la misma regla que "text-wrap: balance", no cualquier selector', () => {
    // Segunda sub-regla de la family 9 (p, li) correcta a propósito: aísla la comprobación en los encabezados.
    const hoja = ['div {', '  text-wrap: balance;', '}', '', 'p, li {', '  text-wrap: pretty;', '}', ''].join('\n')

    const informe = comprobarFamiliasDelReset(hoja, FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes.map((familia) => familia.numero)).toContain(9)
  })

  it('la family 9 exige el selector "p, li" para "text-wrap: pretty", no cualquier otro selector', () => {
    // Primera sub-regla de la family 9 (encabezados) correcta a propósito: aísla la comprobación en "p, li".
    const hoja = ['h1, h2, h3, h4, h5, h6 {', '  text-wrap: balance;', '}', '', 'span {', '  text-wrap: pretty;', '}', ''].join('\n')

    const informe = comprobarFamiliasDelReset(hoja, FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes.map((familia) => familia.numero)).toContain(9)
  })

  it('la family 9 exige las DOS sub-reglas a la vez: encabezados completos pero sin "text-wrap: pretty" en p/li sigue ausente', () => {
    const hoja = ['h1, h2, h3, h4, h5, h6 {', '  text-wrap: balance;', '}', '', 'p, li {', '  color: black;', '}', ''].join('\n')

    const informe = comprobarFamiliasDelReset(hoja, FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes.map((familia) => familia.numero)).toContain(9)
  })

  it('la family 1 exige los TRES selectores ("*", "*::before", "*::after") en la misma regla, no solo alguno de ellos', () => {
    const hojaConSoloUnoDeLosTres = ['* {', '  box-sizing: border-box;', '}', ''].join('\n')

    const informe = comprobarFamiliasDelReset(hojaConSoloUnoDeLosTres, FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes.map((familia) => familia.numero)).toContain(1)
  })

  it('la family 4 exige las DOS declaraciones ("font: inherit" y "color: inherit") en la misma regla, no solo alguna de ellas', () => {
    const hojaConSoloUnaDeLasDos = ['input, button, textarea, select {', '  font: inherit;', '}', ''].join('\n')

    const informe = comprobarFamiliasDelReset(hojaConSoloUnaDeLasDos, FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes.map((familia) => familia.numero)).toContain(4)
  })
})

describe('@s13 "pasa" refleja exactamente si TODAS las familias del inventario están satisfechas', () => {
  it('con las nueve familias satisfechas, "pasa" es true', () => {
    const hojaConLasNueveFamilias = [
      '*, *::before, *::after {', '  box-sizing: border-box;', '}',
      'body {', '  margin: 0;', '}',
      'h1, h2, h3, h4, h5, h6, p, blockquote, figure, dl, dd {', '  margin-block: 0;', '}',
      'input, button, textarea, select {', '  font: inherit;', '  color: inherit;', '}',
      'img, picture, video, canvas, svg {', '  display: block;', '  max-width: 100%;', '}',
      'body {',
      '  min-height: 100svh;',
      '  line-height: 1.5;',
      '  background-color: var(--color-fondo);',
      '  color: var(--color-texto);',
      '  font-family: var(--fuente-texto);',
      '}',
      'html {', '  -webkit-text-size-adjust: 100%;', '}',
      '#root {', '  isolation: isolate;', '}',
      'h1, h2, h3, h4, h5, h6 {', '  text-wrap: balance;', '}',
      'p, li {', '  text-wrap: pretty;', '}',
      '',
    ].join('\n')

    const informe = comprobarFamiliasDelReset(hojaConLasNueveFamilias, FAMILIAS_DEL_RESET)

    expect(informe.familiasAusentes).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('con el catálogo de familias vacío, "pasa" es false, nunca true por vacuidad', () => {
    const informe = comprobarFamiliasDelReset('body { margin: 0; }\n', [])

    expect(informe.pasa).toBe(false)
    expect(informe.familiasComprobadas).toBe(0)
  })
})

describe('@s13 lectura de todas las declaraciones que un selector recibe', () => {
  const hoja = ['body {', '  margin: 0;', '}', '', 'p, li {', '  text-wrap: pretty;', '}', '', 'body {', '  color: red;', '}', ''].join('\n')

  it('reúne las declaraciones de todas las reglas que alcanzan al selector', () => {
    expect(declaracionesDelSelector(hoja, 'body')).toEqual(['margin: 0', 'color: red'])
  })

  it('un selector que ninguna regla alcanza no recibe ninguna declaración', () => {
    expect(declaracionesDelSelector(hoja, 'html')).toEqual([])
  })

  it('un selector dentro de una lista recibe las declaraciones de esa regla', () => {
    expect(declaracionesDelSelector(hoja, 'li')).toEqual(['text-wrap: pretty'])
  })
})

describe('@s14 lectura del valor declarado de una propiedad y de las variables que consume', () => {
  const hoja = ['html {', '  scroll-padding-top: calc(var(--altura-cabecera) + 16px);', '}', ''].join('\n')

  it('devuelve el valor declarado de la propiedad buscada', () => {
    expect(valorDeclarado(hoja, 'html', 'scroll-padding-top')).toBe('calc(var(--altura-cabecera) + 16px)')
  })

  it('una propiedad que el selector no declara no tiene valor', () => {
    expect(valorDeclarado(hoja, 'html', 'scroll-behavior')).toBeUndefined()
  })

  it('no confunde una propiedad cuyo nombre empieza igual', () => {
    expect(valorDeclarado(hoja, 'html', 'scroll-padding')).toBeUndefined()
  })

  it('nombra las variables CSS que un valor consume', () => {
    expect(variablesCssUsadas('calc(var(--altura-cabecera) + var(--hueco))')).toEqual(['--altura-cabecera', '--hueco'])
  })

  it('un valor sin ninguna variable no consume ninguna', () => {
    expect(variablesCssUsadas('80px')).toEqual([])
  })
})

describe('interpolación de Sass dentro de un valor', () => {
  it('una declaración con "#{…}" no se confunde con la apertura de un bloque', () => {
    const hoja = ['html {', '  scroll-padding-top: calc(var(--alto) + #{espaciado(16)});', '}', ''].join('\n')

    expect(valorDeclarado(hoja, 'html', 'scroll-padding-top')).toBe('calc(var(--alto) + espaciado(16))')
  })
})

describe('los comentarios de línea "//" se recortan antes de trocear declaraciones y selectores', () => {
  it('un comentario "//" de más de un carácter se recorta completo, no solo el primer carácter', () => {
    const hoja = ['body {', '  color: red; // comentario largo de prueba', '}', ''].join('\n')

    expect(declaracionesDelSelector(hoja, 'body')).toEqual(['color: red'])
  })

  it('con un final de línea CRLF (retorno de carro "\\r" incrustado tras dividir por "\\n"), el comentario NO se recorta y la declaración queda sin reconocer', () => {
    const hojaConCrlf = 'body {\r\n  color: red; // comentario\r\n}\r\n'

    expect(declaracionesDelSelector(hojaConCrlf, 'body')).toEqual([])
  })
})

describe('varios espacios consecutivos se colapsan a uno solo al normalizar', () => {
  it('una declaración con espacios múltiples tras los dos puntos se normaliza a un único espacio', () => {
    const hoja = ['body {', '  margin:   0;', '}', ''].join('\n')

    expect(declaracionesDelSelector(hoja, 'body')).toEqual(['margin: 0'])
  })
})

describe('@s15 cada regla conoce los bloques que la contienen', () => {
  const hoja = ['@media (prefers-reduced-motion: no-preference) {', '  html {', '    scroll-behavior: smooth;', '  }', '}', '', 'html {', '  color: red;', '}', ''].join('\n')

  it('una regla anidada nombra el bloque que la contiene', () => {
    const [, anidada] = extraerReglas(hoja)

    expect(anidada?.ancestros).toEqual(['@media (prefers-reduced-motion: no-preference)'])
  })

  it('una regla de primer nivel no tiene ningún ancestro, ni siquiera tras cerrarse un bloque anterior', () => {
    const [, , posterior] = extraerReglas(hoja)

    expect(posterior?.ancestros).toEqual([])
  })
})

describe('un selector partido en dos líneas por una línea en blanco no deja fragmentos vacíos, y un ancestro compuesto se une con ", "', () => {
  it('el selector compuesto no arrastra fragmentos vacíos, y el ancestro anidado se lee unido por ", "', () => {
    const hoja = ['h1,', '', 'h2 {', '  .anidada {', '    color: red;', '  }', '}', ''].join('\n')

    const [ancestroCompuesto, anidada] = extraerReglas(hoja)

    expect(ancestroCompuesto?.selectores).toEqual(['h1', 'h2'])
    expect(anidada?.ancestros).toEqual(['h1, h2'])
  })
})
