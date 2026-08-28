// Puerta de contraste de la matriz de uso del sistema de color (@s6, @s7, @s8,
// @s9 y @s11 de `features/rediseno_visual.feature`).
//
// POR QUÉ ESTE FICHERO LEE TEXTO CRUDO Y NO CLASES CSS: los tests de Vitest
// corren con los CSS Modules desactivados a propósito (`vite.config.ts`,
// bloque `test.css.include`), así que una aserción sobre un `className` no
// probaría nada. Todo Then de este fichero se afirma sobre un valor leído del
// TEXTO REAL de un fichero con `import.meta.glob(..., { query: '?raw' })` y
// sobre un ratio calculado con la fórmula real de `src/lib/contraste.ts`.
import { describe, expect, it } from 'vitest'
import { ROLES_DE_COLOR_REDISENO, VARIANTES_REDISENO } from './contratoRedisenho'
import { mezclar } from './mezclaDeColor'
import type { FicheroDeTexto } from './rolesDescartados'
import { declaraTokenEnVariante, leerTokenDeVariante, type EntradaDeMatrizDeUso } from './tokensColor'
import {
  MATRIZ_DE_USO_DEL_SISTEMA,
  comprobarRolesAusentesDelPrototipo,
  contarReglasDeFocoDelPrototipo,
  contarSupresionesDeContornoDelPrototipo,
  ejecutarMatrizDeContrasteDeVariantes,
  ejecutarPuertaDeReconciliacionDeMatriz,
  evaluarParDelPrototipo,
  evaluarParDeVariante,
  evaluarTintaSobreRolDelPrototipo,
  derivarBordeControlDeMarca,
  leerComentarioDelBordeDeControlDeMarca,
  extraerNombresDeRolDelPrototipo,
  leerRgbExpandidoDeRolDelPrototipo,
  leerRolDeTemaDelPrototipo,
  leerTintasLiteralesSobreRolDelPrototipo,
} from './matrizDeContraste'

/** Texto real de la hoja de tokens del sistema (`src/styles/_tokens.scss`). */
const TEXTO_TOKENS = Object.values(
  import.meta.glob('../../styles/_tokens.scss', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>,
)[0] as string

/** Texto real del prototipo aprobado en Claude Design, la fuente de los cuatro temas importados. */
const TEXTO_PROTOTIPO = Object.values(
  import.meta.glob('../../../docs/diseno-claude-design/Veterinaria La Sierra.dc.html', {
    eager: true,
    query: '?raw',
    import: 'default',
  }) as Record<string, string>,
)[0] as string

describe('las dos lecturas en crudo traen contenido real, nunca una cadena vacía', () => {
  it('los dos ficheros llegan con su texto y con sus anclas, así que ninguna puerta puede aprobar sobre el vacío', () => {
    expect(TEXTO_TOKENS.length).toBeGreaterThan(0)
    expect(TEXTO_TOKENS).toContain(":root[data-variante='marca']")
    expect(TEXTO_PROTOTIPO.length).toBeGreaterThan(0)
    expect(TEXTO_PROTOTIPO).toContain(":root[data-tema='calida']")
  })
})

describe('@s6 la variante cálida corrige el único suspenso de contraste que traía el prototipo', () => {
  it('el texto suave del prototipo sobre su fondo alterno daba 4.37 y habría suspendido el mínimo de 4.5', () => {
    // `muted` y `bg-2` son los nombres que el prototipo da al texto suave y al
    // fondo alterno (`docs/diseno-claude-design/Veterinaria La Sierra.dc.html:26-33`).
    const veredicto = evaluarParDelPrototipo(TEXTO_PROTOTIPO, 'calida', {
      rolDelPrototipo: 'muted',
      fondoDelPrototipo: 'bg-2',
      uso: 'texto normal',
    })

    expect(veredicto.color).toBe('#8A6C45')
    expect(veredicto.fondo).toBe('#FEF3C7')
    expect(veredicto.ratioRedondeado).toBe(4.37)
    expect(veredicto.umbral).toBe(4.5)
    expect(veredicto.veredicto).toBe('suspenso')
  })

  it('el valor declarado en el sistema alcanza al menos 4.5 sobre el fondo alterno de su variante', () => {
    const delPrototipo = evaluarParDelPrototipo(TEXTO_PROTOTIPO, 'calida', {
      rolDelPrototipo: 'muted',
      fondoDelPrototipo: 'bg-2',
      uso: 'texto normal',
    })
    const delSistema = evaluarParDeVariante(TEXTO_TOKENS, 'calida', {
      rol: 'texto-suave',
      fondo: 'fondo-alterno',
      uso: 'texto normal',
    })

    // La desviación declarada respecto del prototipo: el sistema NO copia el
    // `--muted` cálido, lo oscurece hasta pasar SC 1.4.3.
    expect(delSistema.color).not.toBe(delPrototipo.color)
    expect(delSistema.fondo).toBe(delPrototipo.fondo)
    expect(delSistema.umbral).toBe(4.5)
    expect(delSistema.ratio).toBeGreaterThanOrEqual(4.5)
    expect(delSistema.ratio).toBeGreaterThan(delPrototipo.ratio)
    expect(delSistema.veredicto).toBe('aprobado')
  })

  it('ese mismo valor sigue aprobando sobre el fondo y sobre la superficie de su variante', () => {
    const informe = ejecutarMatrizDeContrasteDeVariantes(TEXTO_TOKENS, ['calida'], [
      { rol: 'texto-suave', fondo: 'fondo', uso: 'texto normal' },
      { rol: 'texto-suave', fondo: 'superficie', uso: 'texto normal' },
    ])

    expect(informe.variantesComprobadas).toBe(1)
    expect(informe.parejasComprobadas).toBe(2)
    expect(informe.suspensos).toEqual([])
    expect(informe.veredicto).toBe('aprobado')
  })
})

describe('@s7 la tinta que va encima del color de urgencia nunca es blanca por defecto', () => {
  it('el color de encima es "--color-sobre-primario" de esa misma variante y alcanza 4.5 en las cinco', () => {
    const tintasSobreUrgencia = MATRIZ_DE_USO_DEL_SISTEMA.filter((entrada) => entrada.fondo === 'urgencia')

    // Literal escrito a mano: la matriz no puede declarar NINGUNA otra tinta
    // sobre el fondo de urgencia, y la que declara es la del propio tema.
    expect(tintasSobreUrgencia.map((entrada) => entrada.rol)).toEqual(['sobre-primario'])

    const informe = ejecutarMatrizDeContrasteDeVariantes(TEXTO_TOKENS, VARIANTES_REDISENO, tintasSobreUrgencia)
    expect(informe.variantesComprobadas).toBe(5)
    expect(informe.parejasComprobadas).toBe(5)
    expect(informe.suspensos).toEqual([])
    expect(informe.veredicto).toBe('aprobado')

    const resueltos = VARIANTES_REDISENO.map((variante) => ({
      variante,
      veredicto: evaluarParDeVariante(TEXTO_TOKENS, variante, tintasSobreUrgencia[0] as EntradaDeMatrizDeUso),
    }))
    expect(resueltos).toHaveLength(5)
    for (const { variante, veredicto } of resueltos) {
      expect(veredicto.color).toBe(leerTokenDeVariante(TEXTO_TOKENS, variante, 'sobre-primario'))
      expect(veredicto.umbral).toBe(4.5)
      expect(veredicto.ratio).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('en la variante "tech" ese par da al menos 6, frente al 2.77 que daría el blanco del prototipo', () => {
    const delSistema = evaluarParDeVariante(TEXTO_TOKENS, 'tech', {
      rol: 'sobre-primario',
      fondo: 'urgencia',
      uso: 'texto normal',
    })
    expect(delSistema.ratio).toBeGreaterThanOrEqual(6)

    // El prototipo NO usa su propio `--on-primary` sobre el rojo: escribe
    // blanco literal en los cuatro rótulos de urgencia de su marcado
    // (`Veterinaria La Sierra.dc.html`, líneas 67, 94, 113 y 399). Ese blanco
    // se LEE de su texto real, no se escribe a mano aquí.
    const blancosDelPrototipo = leerTintasLiteralesSobreRolDelPrototipo(TEXTO_PROTOTIPO, 'urg')
    expect(blancosDelPrototipo).toEqual(['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'])

    const conElBlancoDelPrototipo = evaluarTintaSobreRolDelPrototipo(
      TEXTO_PROTOTIPO,
      'tech',
      blancosDelPrototipo[0] as string,
      'urg',
      'texto normal',
    )
    expect(conElBlancoDelPrototipo.ratioRedondeado).toBe(2.77)
    expect(conElBlancoDelPrototipo.veredicto).toBe('suspenso')
    expect(delSistema.ratio).toBeGreaterThan(conElBlancoDelPrototipo.ratio)
  })

  it('omite un estilo que declara el fondo del rol pero no escribe ninguna tinta literal', () => {
    const sinTinta = `<div style="background:var(--urg);font-weight:bold">x</div>`
    expect(leerTintasLiteralesSobreRolDelPrototipo(sinTinta, 'urg')).toEqual([])
  })

  it('reconoce una tinta literal aunque el estilo use espacios alrededor de los dos puntos', () => {
    // El prototipo real siempre escribe "background:var(--urg);color:#fff"
    // sin ningún espacio (medido en las cuatro franjas de urgencia); este
    // caso sintético prueba que el patrón, tal y como declara su propio
    // "\\s*" a ambos lados de "color:", tolera el formato con espacio.
    const conEspacios = `<span style="background: var(--urg); color: #fed">x</span>`
    expect(leerTintasLiteralesSobreRolDelPrototipo(conEspacios, 'urg')).toEqual(['#FFEEDD'])
  })

  it('reconoce una tinta literal que abre el propio atributo style, sin ningún punto y coma antes', () => {
    // El patrón acepta la tinta al PRINCIPIO del valor de "style" (rama "^"
    // de la alternancia) o tras un ";" (rama ";"): los cuatro rótulos reales
    // del prototipo siempre escriben el fondo primero, así que solo un caso
    // sintético con la tinta en primer lugar ejercita la rama "^".
    const tintaAlPrincipio = `<div style="color:#abc;background:var(--urg)">x</div>`
    expect(leerTintasLiteralesSobreRolDelPrototipo(tintaAlPrincipio, 'urg')).toEqual(['#AABBCC'])
  })
})

describe('@s8 el borde de control existe en las cinco variantes y cumple el mínimo de componentes de interfaz', () => {
  it('las cinco variantes declaran el rol y su ratio contra el fondo propio alcanza al menos 3', () => {
    const declarantes = VARIANTES_REDISENO.filter((variante) =>
      declaraTokenEnVariante(TEXTO_TOKENS, variante, '--color-borde-control'),
    )
    // Literal escrito a mano con las cinco variantes: si una dejara de
    // declarar el rol, la lista cambiaría y esta comparación fallaría.
    expect(declarantes).toEqual(['clinica', 'calida', 'tech', 'eco', 'marca'])

    const bordeSobreSuFondo = MATRIZ_DE_USO_DEL_SISTEMA.filter(
      (entrada) => entrada.rol === 'borde-control' && entrada.fondo === 'fondo',
    )
    expect(bordeSobreSuFondo.map((entrada) => entrada.uso)).toEqual(['componente de interfaz o borde de foco'])

    const informe = ejecutarMatrizDeContrasteDeVariantes(TEXTO_TOKENS, VARIANTES_REDISENO, bordeSobreSuFondo)
    expect(informe.variantesComprobadas).toBe(5)
    expect(informe.parejasComprobadas).toBe(5)
    expect(informe.suspensos).toEqual([])
    expect(informe.veredicto).toBe('aprobado')

    const medidos = VARIANTES_REDISENO.map((variante) =>
      evaluarParDeVariante(TEXTO_TOKENS, variante, bordeSobreSuFondo[0] as EntradaDeMatrizDeUso),
    )
    expect(medidos).toHaveLength(5)
    for (const medido of medidos) {
      expect(medido.umbral).toBe(3)
      expect(medido.ratio).toBeGreaterThanOrEqual(3)
    }
  })

  it('el prototipo no modela este rol: su inventario de dieciocho roles no incluye ningún borde de control', () => {
    const rolesDelPrototipo = extraerNombresDeRolDelPrototipo(TEXTO_PROTOTIPO)

    // Literal escrito a mano con los dieciocho nombres que el prototipo
    // declara de verdad (`Veterinaria La Sierra.dc.html:18-49`). Ninguno es un
    // borde de control: el único borde que modela es decorativo.
    expect(rolesDelPrototipo).toEqual([
      '--bg',
      '--bg-2',
      '--card',
      '--surface',
      '--border',
      '--ink',
      '--text',
      '--muted',
      '--primary',
      '--primary-strong',
      '--on-primary',
      '--accent',
      '--accent-ink',
      '--accent-soft',
      '--urg',
      '--urg-soft',
      '--shadow',
      '--shadow-sm',
    ])
    expect(rolesDelPrototipo).toHaveLength(18)

    // Y ese borde decorativo ni siquiera es un hexadecimal: es un `rgba()` de
    // opacidad baja, así que no podría servir de token de control medible.
    expect(() => leerRolDeTemaDelPrototipo(TEXTO_PROTOTIPO, 'calida', 'border')).toThrow(
      'no se encontró el rol "--border" en el tema "calida" del prototipo',
    )
  })

  it('reconoce un rol declarado con espacio antes de los dos puntos', () => {
    // El prototipo real nunca escribe espacio entre el nombre del rol y los
    // dos puntos (medido); este caso sintético prueba que el patrón, tal y
    // como declara su propio "\\s*", tolera ese formato y no solo el
    // compacto que usa el texto real.
    const texto = `:root { --rol-nuevo :#112233; }`
    expect(extraerNombresDeRolDelPrototipo(texto)).toEqual(['--rol-nuevo'])
  })
})

describe('@s8 Enmienda 3: la tercera cláusula nombra el mecanismo real de cada variante', () => {
  it('"clinica", "calida" y "eco" importan el "--muted" del tema de su propia variante del prototipo', () => {
    // Literales escritos a mano, tal y como fija la Enmienda 3
    // (`features/rediseno_visual.feature:282`): el "--muted" de cada tema en
    // `docs/diseno-claude-design/Veterinaria La Sierra.dc.html`. "clinica" es
    // la variante por defecto y su tema en el prototipo es el ":root" base,
    // sin atributo "[data-tema]" (VLS:18-25).
    expect(leerRolDeTemaDelPrototipo(TEXTO_PROTOTIPO, 'clinica', 'muted')).toBe('#5E6E88')
    expect(leerRolDeTemaDelPrototipo(TEXTO_PROTOTIPO, 'calida', 'muted')).toBe('#8A6C45')
    expect(leerRolDeTemaDelPrototipo(TEXTO_PROTOTIPO, 'eco', 'muted')).toBe('#557368')

    // Y ese mismo valor —no uno recalculado— es el que el sistema declara
    // para "--color-borde-control" de cada variante: importado, no derivado.
    for (const variante of ['clinica', 'calida', 'eco'] as const) {
      expect(leerTokenDeVariante(TEXTO_TOKENS, variante, 'borde-control')).toBe(
        leerRolDeTemaDelPrototipo(TEXTO_PROTOTIPO, variante, 'muted'),
      )
    }
  })

  it('"tech" importa el "rgb()" expandido de su "--border" translúcido del prototipo', () => {
    // El tema "tech" declara "--border:rgba(148,197,255,.18)" (VLS:36). El
    // literal viene de la propia Enmienda 3 (`rediseno_visual.feature:283`):
    // el rgb() se expande a hexadecimal SIN componer el alfa sobre el fondo
    // (eso es lo que hace "--color-borde", un rol distinto).
    expect(leerRgbExpandidoDeRolDelPrototipo(TEXTO_PROTOTIPO, 'tech', 'border')).toBe('#94C5FF')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'tech', 'borde-control')).toBe(
      leerRgbExpandidoDeRolDelPrototipo(TEXTO_PROTOTIPO, 'tech', 'border'),
    )
  })

  it('lanza si el rol translúcido pedido no existe en el tema del prototipo', () => {
    expect(() => leerRgbExpandidoDeRolDelPrototipo(TEXTO_PROTOTIPO, 'calida', 'inexistente')).toThrow(
      'no se encontró el rol translúcido "--inexistente" en el tema "calida" del prototipo',
    )
  })

  it('expande a hexadecimal de dos dígitos un canal rgba decimal menor que 16, con el relleno de cero', () => {
    // Los cuatro temas reales del prototipo nunca declaran un canal rgba de
    // un solo dígito hexadecimal (verificado: 148/197/255 de "tech" dan dos
    // dígitos cada uno sin relleno), así que este caso sintético es el único
    // que ejercita el "padStart" de verdad.
    const prototipoSintetico = `:root[data-tema='sintetico'] { --tinte: rgba(5, 10, 255, .4); }`
    expect(leerRgbExpandidoDeRolDelPrototipo(prototipoSintetico, 'sintetico', 'tinte')).toBe('#050AFF')
  })

  it('"marca", que no tiene tema propio en el prototipo, es la ÚNICA variante que deriva el valor por mezcla', () => {
    // Literal escrito a mano, tal y como fija la Enmienda 3
    // (`rediseno_visual.feature:284`): mezclar('#FFFFFF', '#77286B', 0.7) = '#A06997'.
    const derivado = derivarBordeControlDeMarca(TEXTO_TOKENS)
    expect(derivado).toBe('#A06997')

    // Doble anclado: el mismo resultado sale de aplicar `mezclar()` a los DOS
    // literales de la cláusula, y de leer "--color-fondo"/"--color-primario"
    // del TEXTO REAL de "marca" en `_tokens.scss`.
    expect(derivado).toBe(mezclar('#FFFFFF', '#77286B', 0.7))
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'fondo')).toBe('#FFFFFF')
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'primario')).toBe('#77286B')

    // Y ese derivado es exactamente el que el sistema declara: la fórmula no
    // es una curiosidad aparte, es la regla que produjo el valor real.
    expect(leerTokenDeVariante(TEXTO_TOKENS, 'marca', 'borde-control')).toBe(derivado)
  })

  it('"_tokens.scss" escribe por extenso, junto a la declaración de "marca", la regla de mezcla que produce su borde de control', () => {
    // Última fracción de la cláusula (`rediseno_visual.feature:284`): «…con
    // la regla escrita por extenso en "src/styles/_tokens.scss"». No basta
    // con que el VALOR y la FÓRMULA sean ciertos (ya mordido en el `it`
    // anterior): el propio fichero tiene que EXPLICARLO junto a la
    // declaración, el mismo patrón que ya usa para el rojo de urgencia
    // semántico (`_tokens.scss:5-18`, verificado en
    // `tokensColor.test.ts` "el fichero declara por escrito…").
    const comentario = leerComentarioDelBordeDeControlDeMarca(TEXTO_TOKENS)
    expect(comentario).toBeDefined()
    expect(comentario).toContain("mezclar('#FFFFFF', '#77286B', 0.7)")
  })

  it('devuelve undefined si la declaración del borde de control de "marca" no lleva ningún comentario pegado encima', () => {
    // Sabotaje permanente y en memoria (mismo patrón que el resto del
    // fichero): se dobla el TEXTO REAL quitando el bloque de comentarios "//"
    // que hoy precede a "--color-borde-control:#A06997;", sin tocar
    // "_tokens.scss". Sirve para demostrar que la función devuelve
    // "undefined" ante la ausencia real, en vez de lanzar.
    const sinComentario = TEXTO_TOKENS.replace(
      /(?:[ \t]*\/\/[^\n]*\n)+([ \t]*--color-borde-control:\s*#A06997;)/,
      '$1',
    )
    expect(sinComentario).not.toBe(TEXTO_TOKENS)
    expect(sinComentario).toContain('--color-borde-control: #A06997;')
    expect(leerComentarioDelBordeDeControlDeMarca(sinComentario)).toBeUndefined()
  })
})

describe('@s9 el anillo de foco existe en las cinco variantes y se distingue de su fondo', () => {
  it('las cinco variantes declaran el rol y su ratio contra el fondo propio alcanza al menos 3', () => {
    const declarantes = VARIANTES_REDISENO.filter((variante) =>
      declaraTokenEnVariante(TEXTO_TOKENS, variante, '--color-foco'),
    )
    expect(declarantes).toEqual(['clinica', 'calida', 'tech', 'eco', 'marca'])

    const focoSobreSuFondo = MATRIZ_DE_USO_DEL_SISTEMA.filter(
      (entrada) => entrada.rol === 'foco' && entrada.fondo === 'fondo',
    )
    expect(focoSobreSuFondo.map((entrada) => entrada.uso)).toEqual(['componente de interfaz o borde de foco'])

    const informe = ejecutarMatrizDeContrasteDeVariantes(TEXTO_TOKENS, VARIANTES_REDISENO, focoSobreSuFondo)
    expect(informe.variantesComprobadas).toBe(5)
    expect(informe.parejasComprobadas).toBe(5)
    expect(informe.suspensos).toEqual([])
    expect(informe.veredicto).toBe('aprobado')

    const medidos = VARIANTES_REDISENO.map((variante) =>
      evaluarParDeVariante(TEXTO_TOKENS, variante, focoSobreSuFondo[0] as EntradaDeMatrizDeUso),
    )
    expect(medidos).toHaveLength(5)
    for (const medido of medidos) {
      expect(medido.umbral).toBe(3)
      expect(medido.ratio).toBeGreaterThanOrEqual(3)
    }
  })

  it('el prototipo no declara ninguna regla de foco y además suprime el contorno en seis controles', () => {
    // Literal escrito a mano con los cinco nombres con los que un sistema de
    // diseño podría modelar el anillo de foco. Ninguno existe en el prototipo:
    // el rol es del repositorio y no se importa.
    const informe = comprobarRolesAusentesDelPrototipo(TEXTO_PROTOTIPO, [
      '--foco',
      '--focus',
      '--focus-ring',
      '--ring',
      '--outline',
    ])
    expect(informe.rolesInspeccionados).toBe(5)
    expect(informe.presentes).toEqual([])
    expect(informe.pasa).toBe(true)

    expect(contarReglasDeFocoDelPrototipo(TEXTO_PROTOTIPO)).toBe(0)
    expect(contarSupresionesDeContornoDelPrototipo(TEXTO_PROTOTIPO)).toBe(6)
  })

  it('la puerta de roles ausentes falla cerrada ante una lista de candidatos vacía', () => {
    const informe = comprobarRolesAusentesDelPrototipo(TEXTO_PROTOTIPO, [])

    expect(informe.rolesInspeccionados).toBe(0)
    expect(informe.presentes).toEqual([])
    expect(informe.pasa).toBe(false)
    expect(informe.motivo).toBe('no se inspeccionó ningún rol: la lista de roles candidatos está vacía')
  })

  it('detecta un rol candidato que sí está declarado en el prototipo, entre otros que no lo están', () => {
    // "--bg" SÍ es uno de los dieciocho roles reales del prototipo
    // (verificado arriba); "--focus-ring" no lo es. Con candidatos NO vacíos
    // y al menos uno presente, la puerta debe distinguir el filtro real de
    // uno que ignorase la declaración real (siempre vacío o siempre completo).
    const informe = comprobarRolesAusentesDelPrototipo(TEXTO_PROTOTIPO, ['--bg', '--focus-ring'])

    expect(informe.rolesInspeccionados).toBe(2)
    expect(informe.presentes).toEqual(['--bg'])
    expect(informe.pasa).toBe(false)
  })

  it('cuenta más de cero reglas de foco cuando el texto sí las declara', () => {
    const conFoco = '.btn:focus { outline: 3px solid blue; } a:focus { color: red; }'
    expect(contarReglasDeFocoDelPrototipo(conFoco)).toBeGreaterThan(0)
  })

  it('cuenta una supresión de contorno aunque haya un espacio entre los dos puntos y "none"', () => {
    // El prototipo real siempre escribe "outline:none" sin espacio
    // (medido); este caso sintético prueba que el patrón, tal y como declara
    // su propio "\\s*", tolera el formato con espacio y no solo el compacto.
    const texto = '.btn { outline: none; }'
    expect(contarSupresionesDeContornoDelPrototipo(texto)).toBe(1)
  })
})

describe('@s11 ninguna de las cinco variantes suspende su matriz de uso de color', () => {
  it('la matriz declara los veintiún pares (rol, fondo, uso) que el sistema pinta de verdad', () => {
    expect(MATRIZ_DE_USO_DEL_SISTEMA).toHaveLength(21)

    // Ningún par repetido: una fila duplicada inflaría el recuento sin
    // comprobar nada nuevo.
    const claves = MATRIZ_DE_USO_DEL_SISTEMA.map((entrada) => `${entrada.rol} sobre ${entrada.fondo}`)
    expect(new Set(claves).size).toBe(21)

    // Todo rol citado existe en el inventario del sistema.
    for (const entrada of MATRIZ_DE_USO_DEL_SISTEMA) {
      expect(ROLES_DE_COLOR_REDISENO).toContain(`--color-${entrada.rol}`)
      expect(ROLES_DE_COLOR_REDISENO).toContain(`--color-${entrada.fondo}`)
    }

    // "--color-borde" queda fuera a propósito: es decorativo y nunca
    // identifica un control (@s7 de `identidad_visual.feature`).
    expect(MATRIZ_DE_USO_DEL_SISTEMA.map((entrada) => entrada.rol)).not.toContain('borde')

    // Literal escrito a mano con los dos únicos usos WCAG que esta matriz maneja.
    expect([...new Set(MATRIZ_DE_USO_DEL_SISTEMA.map((entrada) => entrada.uso))].toSorted()).toEqual(
      ['componente de interfaz o borde de foco', 'texto normal'],
    )
  })

  it('con una matriz vacía el veredicto es suspenso, no aprobado por vacuidad', () => {
    const informe = ejecutarMatrizDeContrasteDeVariantes(TEXTO_TOKENS, VARIANTES_REDISENO, [])

    expect(informe.veredicto).toBe('suspenso')
    expect(informe.variantesComprobadas).toBe(0)
    expect(informe.parejasComprobadas).toBe(0)
    expect(informe.suspensos).toEqual([])
    expect(informe.motivo).toBe('no se comprobó ninguna pareja: la matriz de uso o el catálogo de variantes está vacío')
  })

  it('con el catálogo de variantes vacío el veredicto también es suspenso', () => {
    const informe = ejecutarMatrizDeContrasteDeVariantes(TEXTO_TOKENS, [], MATRIZ_DE_USO_DEL_SISTEMA)

    expect(informe.veredicto).toBe('suspenso')
    expect(informe.variantesComprobadas).toBe(0)
    expect(informe.parejasComprobadas).toBe(0)
    expect(informe.suspensos).toEqual([])
    expect(informe.motivo).toBe('no se comprobó ninguna pareja: la matriz de uso o el catálogo de variantes está vacío')
  })

  it('resuelta contra las cinco variantes, el veredicto es aprobado y el recuento es exactamente 5', () => {
    const informe = ejecutarMatrizDeContrasteDeVariantes(
      TEXTO_TOKENS,
      VARIANTES_REDISENO,
      MATRIZ_DE_USO_DEL_SISTEMA,
    )

    expect(informe.variantesComprobadas).toBe(5)
    expect(informe.parejasComprobadas).toBe(105)
    expect(informe.suspensos).toEqual([])
    expect(informe.veredicto).toBe('aprobado')
  })

  it('si un solo token bajara del mínimo, la puerta lo señalaría con su variante y su rol', () => {
    // Sabotaje permanente y en memoria: NO se toca `_tokens.scss` (es de otro
    // artesano), se dobla su TEXTO REAL cambiando un único hexadecimal. Sirve
    // para demostrar que esta puerta muerde de verdad y no aprueba por
    // construcción.
    const conBordeRoto = TEXTO_TOKENS.replace(
      /(:root\[data-variante='marca'\][\s\S]*?--color-borde-control:\s*)#[0-9a-fA-F]{6}/,
      '$1#FBF7FA',
    )
    expect(conBordeRoto).not.toBe(TEXTO_TOKENS)

    const informe = ejecutarMatrizDeContrasteDeVariantes(
      conBordeRoto,
      VARIANTES_REDISENO,
      MATRIZ_DE_USO_DEL_SISTEMA,
    )

    expect(informe.parejasComprobadas).toBe(105)
    expect(informe.veredicto).toBe('suspenso')
    expect(informe.suspensos.map(({ variante, rol, fondo }) => `${variante}: ${rol} sobre ${fondo}`)).toEqual([
      'marca: borde-control sobre fondo',
      'marca: borde-control sobre fondo-alterno',
      'marca: borde-control sobre superficie-elevada',
    ])
    for (const suspenso of informe.suspensos) {
      expect(suspenso.umbral).toBe(3)
      expect(suspenso.ratio).toBeLessThan(3)
    }
  })
})

describe('el lector del prototipo falla ruidosamente, nunca en silencio', () => {
  it('lanza si le piden un tema que el prototipo no declara', () => {
    expect(() => leerRolDeTemaDelPrototipo(TEXTO_PROTOTIPO, 'inexistente', 'bg')).toThrow(
      `no se encontró ningún bloque ":root[data-tema='inexistente']" en el texto del prototipo`,
    )
  })

  it('lanza si el bloque del tema aparece pero se queda sin cerrar', () => {
    expect(() => leerRolDeTemaDelPrototipo(`:root[data-tema='calida'] --bg:#FFFFFF;`, 'calida', 'bg')).toThrow(
      `el bloque ":root[data-tema='calida']" del prototipo no se cierra: falta la llave de cierre`,
    )
  })

  it('lanza si el bloque abre pero nunca cierra, incluso con una llave de cierre suelta en otro sitio', () => {
    // Distingue la mitad IZQUIERDA del OR: la apertura SÍ se encuentra
    // (falso), la ausencia de cierre es lo único que debe disparar el throw.
    expect(() =>
      leerRolDeTemaDelPrototipo(`:root[data-tema='calida'] { --bg:#FFFFFF;`, 'calida', 'bg'),
    ).toThrow(`el bloque ":root[data-tema='calida']" del prototipo no se cierra: falta la llave de cierre`)
  })

  it('lanza si el bloque nunca llega a abrir, incluso con una llave de cierre suelta en otro sitio', () => {
    // Distingue la mitad DERECHA del OR: la apertura NO se encuentra
    // (verdadero) por sí sola, sin depender de que también falte el cierre.
    expect(() =>
      leerRolDeTemaDelPrototipo(`:root[data-tema='calida'] --bg:#FFFFFF; }`, 'calida', 'bg'),
    ).toThrow(`el bloque ":root[data-tema='calida']" del prototipo no se cierra: falta la llave de cierre`)
  })
})

describe('@s11 la matriz se reconcilia con el TEXTO REAL de las hojas de estilo', () => {
  it('señala la pareja que un fichero de estilos pinta de verdad y la matriz no declara', () => {
    const estilos: readonly FicheroDeTexto[] = [
      {
        ruta: 'src/components/BarraUrgencias.module.scss',
        contenido: [
          '.barra {',
          '  background-color: var(--color-urgencia);',
          '  color: var(--color-sobre-primario);',
          '',
          '  span {',
          '    color: var(--color-acento);',
          '  }',
          '}',
        ].join('\n'),
      },
    ]

    const informe = ejecutarPuertaDeReconciliacionDeMatriz(estilos, [
      { rol: 'sobre-primario', fondo: 'urgencia', uso: 'texto normal' },
    ])

    expect(informe.paresSinRepresentar).toEqual([
      {
        tinta: 'acento',
        fondo: 'urgencia',
        ruta: 'src/components/BarraUrgencias.module.scss',
        linea: 6,
      },
    ])
    expect(informe.pasa).toBe(false)
  })

  it('aprueba cuando el fichero de estilos solo pinta parejas ya representadas en la matriz', () => {
    const estilos: readonly FicheroDeTexto[] = [
      {
        ruta: 'src/synthetic/Representado.module.scss',
        contenido: [
          '.franja {',
          '  background-color: var(--color-urgencia);',
          '  color: var(--color-sobre-primario);',
          '}',
        ].join('\n'),
      },
    ]

    const informe = ejecutarPuertaDeReconciliacionDeMatriz(estilos, [
      { rol: 'sobre-primario', fondo: 'urgencia', uso: 'texto normal' },
    ])

    expect(informe.paresSinRepresentar).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('sigue la anidación de bloques con una pila: un selector interior no contamina el fondo del exterior', () => {
    // Fichero SINTÉTICO con un bloque anidado dentro de otro, cada uno con su
    // propio "background-color": ejercita el push al abrir el selector
    // interior y el pop al cerrarlo, restaurando el fondo del exterior para
    // la declaración de tinta que viene DESPUÉS del bloque anidado. También
    // mezcla formato compacto sin espacio ("background-color:var(...)",
    // "color:var(...)") y espaciado ancho ("color:   var(...)", tres
    // espacios) porque ningún fichero real de este repositorio varía el
    // espaciado alrededor de esos dos puntos (mismo patrón de hueco que el
    // resto de la feature).
    const anidado: FicheroDeTexto = {
      ruta: 'src/synthetic/Anidado.module.scss',
      contenido: [
        '.exterior {',
        '  background-color: var(--color-fondo);',
        '  .interior {',
        '    background-color:var(--color-superficie);',
        '    color:var(--color-texto);',
        '  }',
        '  color:   var(--color-acento);',
        '}',
      ].join('\n'),
    }

    const informe = ejecutarPuertaDeReconciliacionDeMatriz([anidado], [])

    expect(informe.paresSinRepresentar).toEqual([
      { tinta: 'texto', fondo: 'superficie', ruta: 'src/synthetic/Anidado.module.scss', linea: 5 },
      { tinta: 'acento', fondo: 'fondo', ruta: 'src/synthetic/Anidado.module.scss', linea: 7 },
    ])
    expect(informe.pasa).toBe(false)
  })

  it('una tinta declarada antes de cualquier "background-color" no se señala: todavía no hay fondo vigente', () => {
    const sinFondoPrevio: FicheroDeTexto = {
      ruta: 'src/synthetic/SinFondo.module.scss',
      contenido: ['color: var(--color-acento);'].join('\n'),
    }

    const informe = ejecutarPuertaDeReconciliacionDeMatriz([sinFondoPrevio], [])

    expect(informe.paresSinRepresentar).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('una llave de cierre suelta, sin ninguna apertura previa, no dispara la pila hacia un fondo fantasma', () => {
    // La pila arranca vacía: un "}" sin un "{" antes debe restaurar
    // "undefined" (nada), no un residuo. Si arrancara con algo dentro, la
    // tinta que sigue se marcaría con un fondo que el fichero nunca declaró.
    const cierreSuelto: FicheroDeTexto = {
      ruta: 'src/synthetic/CierreSuelto.module.scss',
      contenido: ['}', 'color: var(--color-acento);'].join('\n'),
    }

    const informe = ejecutarPuertaDeReconciliacionDeMatriz([cierreSuelto], [])

    expect(informe.paresSinRepresentar).toEqual([])
    expect(informe.pasa).toBe(true)
  })

  it('un rol candidato que coincide pero con un fondo distinto al declarado NO representa la pareja', () => {
    // La matriz declara "texto" pero sobre "fondo", no sobre "superficie":
    // si la comprobación ignorase el campo "fondo", esta pareja pasaría por
    // representada solo por coincidir el rol.
    const fondoDistinto: FicheroDeTexto = {
      ruta: 'src/synthetic/FondoDistinto.module.scss',
      contenido: ['.tarjeta {', '  background-color: var(--color-superficie);', '  color: var(--color-texto);', '}'].join(
        '\n',
      ),
    }

    const informe = ejecutarPuertaDeReconciliacionDeMatriz(
      [fondoDistinto],
      [{ rol: 'texto', fondo: 'fondo', uso: 'texto normal' }],
    )

    expect(informe.paresSinRepresentar).toEqual([
      { tinta: 'texto', fondo: 'superficie', ruta: 'src/synthetic/FondoDistinto.module.scss', linea: 3 },
    ])
    expect(informe.pasa).toBe(false)
  })

  it('un "background-color" que no abre la línea (tras un comentario pegado) no fija ningún fondo vigente', () => {
    // El patrón está anclado al INICIO de la línea a propósito (comentario de
    // producción, líneas 496-498): esta línea sintética escribe
    // "background-color:" precedido de un comentario "/* … */" pegado, algo
    // que ningún fichero real de este repositorio hace, así que solo un caso
    // sintético prueba que el ancla realmente se respeta.
    const conPrefijo: FicheroDeTexto = {
      ruta: 'src/synthetic/ConPrefijo.module.scss',
      contenido: ['/* nota */background-color:var(--color-x);', 'color: var(--color-acento);'].join('\n'),
    }

    const informe = ejecutarPuertaDeReconciliacionDeMatriz([conPrefijo], [])

    expect(informe.paresSinRepresentar).toEqual([])
    expect(informe.pasa).toBe(true)
  })
})
