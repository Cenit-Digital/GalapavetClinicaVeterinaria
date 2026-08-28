import { describe, expect, it } from 'vitest'
import {
  compromisosDeUrgenciasEn,
  contarEntradasDelCatalogoDelPrototipo,
  cualificadorDeclaradoDe,
  digitosDe,
  ejecutarPuertaDeLiteralesFicticios,
  ejecutarPuertaDeAfirmacionesProhibidas,
  ejecutarPuertaDeCompromisoDeUrgencias,
  ejecutarPuertaDeRecuentosReales,
  extraerFragmento,
  leerPistaDeVistaPrevia,
  type LiteralFicticio,
} from './datosDelSitio'
import { EQUIPO } from '../../data/equipo'
import { GALERIA } from '../../data/galeria'
import { SERVICIOS } from '../../data/servicios'
import { datosNegocio } from '../site'

/**
 * El TEXTO REAL de los cuatro ficheros del prototipo versionado del que salen
 * TODOS los datos de la clínica ficticia («Veterinaria La Sierra»,
 * `docs/diseno-claude-design/*.dc.html`). Se lee en crudo con Vite, igual que
 * `src/lib/puertaTelefonoHardcodeado.test.ts:10` lee el código de `src/`.
 */
const PROTOTIPO = import.meta.glob('/docs/diseno-claude-design/*.dc.html', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** El fichero principal del bundle, el de la portada de la clínica ficticia. */
const RUTA_DEL_PROTOTIPO_PRINCIPAL = '/docs/diseno-claude-design/Veterinaria La Sierra.dc.html'

/**
 * El TEXTO REAL de todos los ficheros de `src` salvo los de test: código,
 * datos y hojas de estilo. Los ficheros de test se excluyen porque varios
 * (este incluido) citan a propósito los literales ficticios para prohibirlos.
 */
const FICHEROS_REALES_DE_SRC = import.meta.glob(
  ['/src/**/*.{ts,tsx,scss}', '!/src/**/*.test.{ts,tsx}', '!/src/test/**'],
  { eager: true, query: '?raw', import: 'default' },
) as Record<string, string>

/**
 * Los datos de la clínica ficticia del prototipo, uno por cada cláusula "Then"
 * de @s49: nombre comercial, localidad, sus dos teléfonos y su correo
 * electrónico. Los cinco están verificados como FALSOS para Galapavet en
 * `docs/datos-galapavet.md` §7.
 *
 * ESCRITOS A MANO AQUÍ (Given de @s49: «un literal escrito a mano con los
 * datos de la clínica ficticia»), y NO en `src/`: un catálogo dentro de `src/`
 * contaminaría el propio barrido que esta puerta hace sobre `src/`.
 */
const LITERALES_DE_LA_CLINICA_FICTICIA: readonly LiteralFicticio[] = [
  { categoria: 'nombre comercial', literal: 'Veterinaria La Sierra' },
  { categoria: 'localidad', literal: 'Miraflores de la Sierra' },
  { categoria: 'teléfono', literal: '918 44 21 60' },
  { categoria: 'teléfono', literal: '640 22 11 90' },
  { categoria: 'correo electrónico', literal: 'hola@veterinarialasierra.es' },
]

/**
 * La única aparición del nombre ficticio que `src/` puede contener: la RUTA
 * del prototipo versionado en el repositorio, que los módulos de verificación
 * del rediseño citan en su cabecera para documentar contra qué comparan (p. ej.
 * `src/lib/diseno/fidelidadPrototipo.ts:4`). Es la referencia a una fuente, no
 * un dato de negocio publicado sobre un cliente real.
 */
const CITA_DEL_PROTOTIPO_VERSIONADO = 'docs/diseno-claude-design/Veterinaria La Sierra.dc.html'

const SIN_CITAS_PERMITIDAS: readonly string[] = []

/**
 * Los cualificadores de disponibilidad que pueden seguir a la palabra
 * "urgencias". El primero es el ÚNICO que Galapavet puede sostener
 * (`docs/datos-galapavet.md` §2/§3); los demás son los reclamos del prototipo
 * «Veterinaria La Sierra», declarados FALSOS en §7. Escritos a mano.
 */
const CUALIFICADORES: readonly string[] = [
  'fuera de horario',
  '24 h',
  '24h',
  '24 horas',
  'veinticuatro horas',
  'todos los días del año',
  'todos los días',
  'los 365 días',
  'permanentes',
]

describe('@s49 ni un solo literal de la clínica ficticia del prototipo sobrevive en el sitio', () => {
  it('encuentra el nombre comercial de la clínica ficticia en el texto de un fichero', () => {
    const informe = ejecutarPuertaDeLiteralesFicticios(
      [{ categoria: 'nombre comercial', literal: 'Veterinaria La Sierra' }],
      [{ ruta: '/src/components/Ficticio.tsx', contenido: 'Bienvenido a Veterinaria La Sierra' }],
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.pasa).toBe(false)
    expect(informe.hallazgos).toEqual([
      { ruta: '/src/components/Ficticio.tsx', categoria: 'nombre comercial', forma: 'Veterinaria La Sierra' },
    ])
  })

  it('busca también la forma sin espacios del literal, que es como un teléfono acaba en un "tel:"', () => {
    const informe = ejecutarPuertaDeLiteralesFicticios(
      [{ categoria: 'teléfono', literal: '918 44 21 60' }],
      [{ ruta: '/src/components/Ficticio.tsx', contenido: 'href="tel:+34918442160"' }],
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.pasa).toBe(false)
    expect(informe.hallazgos).toEqual([
      { ruta: '/src/components/Ficticio.tsx', categoria: 'teléfono', forma: '918442160' },
    ])
  })

  it('encuentra el literal aunque el fichero lo escriba en otra caja de letras', () => {
    const informe = ejecutarPuertaDeLiteralesFicticios(
      [{ categoria: 'nombre comercial', literal: 'Veterinaria La Sierra' }],
      [{ ruta: '/src/data/heredado.ts', contenido: 'const CLINICA = "VETERINARIA LA SIERRA"' }],
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.hallazgos).toEqual([
      { ruta: '/src/data/heredado.ts', categoria: 'nombre comercial', forma: 'Veterinaria La Sierra' },
    ])
  })

  it('declara cuántos ficheros inspeccionó, cuántos literales buscó y cuántas formas derivó de ellos', () => {
    const informe = ejecutarPuertaDeLiteralesFicticios(
      [
        { categoria: 'nombre comercial', literal: 'Veterinaria La Sierra' },
        { categoria: 'correo electrónico', literal: 'hola@veterinarialasierra.es' },
      ],
      [
        { ruta: '/src/uno.ts', contenido: 'Galapavet' },
        { ruta: '/src/dos.ts', contenido: 'Galapagar' },
        { ruta: '/src/tres.ts', contenido: '91 082 92 67' },
      ],
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.pasa).toBe(true)
    expect(informe.hallazgos).toEqual([])
    expect(informe.ficherosInspeccionados).toBe(3)
    expect(informe.literalesBuscados).toBe(2)
    // "Veterinaria La Sierra" aporta dos formas (con y sin espacios) y el correo
    // electrónico solo una, porque no tiene ningún espacio que quitar.
    expect(informe.formasBuscadas).toBe(3)
  })

  it('falla cerrada si no inspecciona ningún fichero, y no dice que no encontró nada', () => {
    const informe = ejecutarPuertaDeLiteralesFicticios(
      [{ categoria: 'nombre comercial', literal: 'Veterinaria La Sierra' }],
      [],
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.pasa).toBe(false)
    expect(informe.ficherosInspeccionados).toBe(0)
    expect(informe.hallazgos).toEqual([])
    expect(informe.motivo).toContain('0 ficheros')
    expect(informe.motivo).not.toMatch(/no encontr/i)
  })

  it('falla cerrada si no busca ningún literal, aunque tenga ficheros que inspeccionar', () => {
    const informe = ejecutarPuertaDeLiteralesFicticios(
      [],
      [{ ruta: '/src/uno.ts', contenido: 'Galapavet' }],
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.pasa).toBe(false)
    expect(informe.literalesBuscados).toBe(0)
    expect(informe.formasBuscadas).toBe(0)
    expect(informe.hallazgos).toEqual([])
    expect(informe.motivo).toContain('0 literales')
    expect(informe.motivo).not.toMatch(/no encontr/i)
  })

  it('con ficheros y literales reales pero sin ninguna coincidencia, la puerta pasa y no declara motivo', () => {
    const informe = ejecutarPuertaDeLiteralesFicticios(
      [{ categoria: 'localidad', literal: 'Miraflores de la Sierra' }],
      [{ ruta: '/src/uno.ts', contenido: 'Galapagar, Madrid' }],
      SIN_CITAS_PERMITIDAS,
    )

    expect(informe.pasa).toBe(true)
    expect(informe.motivo).toBeUndefined()
  })

  it('una cita a la ruta del prototipo versionado no es un hallazgo, pero el nombre suelto sí lo es', () => {
    const literales = [{ categoria: 'nombre comercial', literal: 'Veterinaria La Sierra' }]

    const conCita = ejecutarPuertaDeLiteralesFicticios(
      literales,
      [{ ruta: '/src/lib/diseno/citador.ts', contenido: `// compara contra ${CITA_DEL_PROTOTIPO_VERSIONADO}` }],
      [CITA_DEL_PROTOTIPO_VERSIONADO],
    )
    const sinRuta = ejecutarPuertaDeLiteralesFicticios(
      literales,
      [{ ruta: '/src/lib/diseno/citador.ts', contenido: '// compara contra Veterinaria La Sierra.dc.html' }],
      [CITA_DEL_PROTOTIPO_VERSIONADO],
    )

    expect(conCita.hallazgos).toEqual([])
    expect(conCita.pasa).toBe(true)
    expect(sinRuta.hallazgos).toEqual([
      { ruta: '/src/lib/diseno/citador.ts', categoria: 'nombre comercial', forma: 'Veterinaria La Sierra' },
    ])
  })

  it('quitar la cita permitida deja un hueco: no suelda los dos trozos vecinos en una coincidencia falsa', () => {
    const informe = ejecutarPuertaDeLiteralesFicticios(
      [{ categoria: 'localidad', literal: 'Miraflores de la Sierra' }],
      [
        {
          ruta: '/src/lib/diseno/citador.ts',
          contenido: `Miraflores de la${CITA_DEL_PROTOTIPO_VERSIONADO} Sierra`,
        },
      ],
      [CITA_DEL_PROTOTIPO_VERSIONADO],
    )

    expect(informe.hallazgos).toEqual([])
  })

  it('cada literal del catálogo existe de verdad en el texto del prototipo: ninguno es un espantapájaros', () => {
    const textosDelPrototipo = Object.values(PROTOTIPO)
    const literalesComprobados = LITERALES_DE_LA_CLINICA_FICTICIA.filter((ficticio) =>
      textosDelPrototipo.some((texto) => texto.includes(ficticio.literal)),
    )

    // Los 4 ficheros ".dc.html" del bundle de Claude Design, contados a mano.
    expect(textosDelPrototipo).toHaveLength(4)
    expect(literalesComprobados).toEqual(LITERALES_DE_LA_CLINICA_FICTICIA)
    expect(literalesComprobados).toHaveLength(5)
  })

  it('el texto real de todos los ficheros de "src" no conserva ningún dato de la clínica ficticia', () => {
    const ficheros = Object.entries(FICHEROS_REALES_DE_SRC).map(([ruta, contenido]) => ({ ruta, contenido }))

    const informe = ejecutarPuertaDeLiteralesFicticios(LITERALES_DE_LA_CLINICA_FICTICIA, ficheros, [
      CITA_DEL_PROTOTIPO_VERSIONADO,
    ])

    expect(informe.hallazgos).toEqual([])
    expect(informe.pasa).toBe(true)
    // La cláusula literal del escenario: "el recuento de ficheros efectivamente
    // inspeccionados es mayor que 0".
    expect(informe.ficherosInspeccionados).toBeGreaterThan(0)
    // Y su suelo anti-vacuidad: el barrido de hoy son 100 ficheros reales de
    // código, datos y estilos (medido el 26/08/2026); un glob que dejara de
    // resolver caería muy por debajo de 90 sin llegar a 0.
    expect(informe.ficherosInspeccionados).toBeGreaterThan(90)
    expect(informe.literalesBuscados).toBe(5)
    // 4 literales con espacios aportan 2 formas cada uno y el correo aporta 1.
    expect(informe.formasBuscadas).toBe(9)
  })
})

describe('@s50 los recuentos que el sitio muestra son los reales, no los del prototipo', () => {
  it('cuenta las entradas reales de cada catálogo del prototipo: doce, seis y nueve, como dice el contrato', () => {
    const texto = PROTOTIPO[RUTA_DEL_PROTOTIPO_PRINCIPAL] as string

    // Doce, seis y nueve están escritos A MANO: son los tres recuentos que el
    // propio @s50 nombra ("no los doce", "no los seis", "no las nueve"). Se
    // confrontan con la MEDICIÓN del texto real del prototipo.
    expect(contarEntradasDelCatalogoDelPrototipo(texto, 'SERVICIOS')).toBe(12)
    expect(contarEntradasDelCatalogoDelPrototipo(texto, 'EQUIPO')).toBe(6)
    expect(contarEntradasDelCatalogoDelPrototipo(texto, 'GALERIA')).toBe(9)
  })

  it('devuelve null cuando el catálogo pedido no existe en el texto, en vez de un cero que parecería un recuento', () => {
    const texto = PROTOTIPO[RUTA_DEL_PROTOTIPO_PRINCIPAL] as string

    expect(contarEntradasDelCatalogoDelPrototipo(texto, 'CAMPANAS')).toBeNull()
    expect(contarEntradasDelCatalogoDelPrototipo('', 'SERVICIOS')).toBeNull()
  })

  it('cuenta solo las entradas de su propio catálogo, no las del siguiente', () => {
    const texto = ['const UNO = [', "  { a: 1 },", "  { a: 2 },", '];', 'const DOS = [', "  { b: 1 },", '];'].join('\n')

    expect(contarEntradasDelCatalogoDelPrototipo(texto, 'UNO')).toBe(2)
    expect(contarEntradasDelCatalogoDelPrototipo(texto, 'DOS')).toBe(1)
  })

  it('no confunde un catálogo con otro cuyo nombre empieza igual', () => {
    // "UNO" es prefijo de "UNOS": sin la apertura " = [" en la marca de
    // búsqueda, se contarían las entradas de "UNOS".
    const texto = ['const UNOS = [', '  { a: 0 },', '  { a: 9 },', '];', 'const UNO = [', '  { a: 1 },', '];'].join('\n')

    expect(contarEntradasDelCatalogoDelPrototipo(texto, 'UNO')).toBe(1)
    expect(contarEntradasDelCatalogoDelPrototipo(texto, 'UNOS')).toBe(2)
  })

  it('lee la pista de vista previa que el editor de diseño deja en cada listado del prototipo', () => {
    const texto = PROTOTIPO[RUTA_DEL_PROTOTIPO_PRINCIPAL] as string

    // `hint-placeholder-count` es, literalmente, la "pista" ("hint") con la que
    // el editor de Claude Design rellena la VISTA PREVIA de un `<sc-for>`
    // cuando todavía no hay datos. Medido sobre el texto real del prototipo.
    expect(leerPistaDeVistaPrevia(texto, 'servicios')).toBe(6)
    expect(leerPistaDeVistaPrevia(texto, 'equipo')).toBe(6)
    expect(leerPistaDeVistaPrevia(texto, 'galeria')).toBe(5)
  })

  it('devuelve null si el listado no existe o si su etiqueta no lleva pista de vista previa', () => {
    expect(leerPistaDeVistaPrevia(PROTOTIPO[RUTA_DEL_PROTOTIPO_PRINCIPAL] as string, 'inventado')).toBeNull()
    expect(leerPistaDeVistaPrevia('<sc-for list="{{ servicios }}" as="s">', 'servicios')).toBeNull()
    // La pista tiene que ser un atributo DE ESA etiqueta: un texto suelto por
    // detrás del cierre ">" no cuenta.
    expect(
      leerPistaDeVistaPrevia('<sc-for list="{{ servicios }}" as="s">texto hint-placeholder-count="99" fin', 'servicios'),
    ).toBeNull()
  })

  it('distingue el listado pedido de otro cuyo nombre empieza igual, y lee la pista entera', () => {
    // "servicios" es prefijo de "serviciosDestacados": sin el ' }}"' de cierre
    // en la marca, se leería la pista del listado equivocado. Y la pista de dos
    // cifras se lee ENTERA, no su primer dígito.
    const texto =
      '<sc-for list="{{ serviciosDestacados }}" hint-placeholder-count="7">' +
      '<sc-for list="{{ servicios }}" hint-placeholder-count="12">'

    expect(leerPistaDeVistaPrevia(texto, 'servicios')).toBe(12)
    expect(leerPistaDeVistaPrevia(texto, 'serviciosDestacados')).toBe(7)
  })

  it('los tres recuentos reales de la portada no coinciden ni con el prototipo ni con su pista de vista previa', () => {
    const texto = PROTOTIPO[RUTA_DEL_PROTOTIPO_PRINCIPAL] as string
    const recuentos = [
      { listado: 'servicios', publicado: SERVICIOS.length, nombreEnElPrototipo: 'SERVICIOS', listaDelPrototipo: 'servicios' },
      { listado: 'equipo', publicado: EQUIPO.length, nombreEnElPrototipo: 'EQUIPO', listaDelPrototipo: 'equipo' },
      { listado: 'galería', publicado: GALERIA.length, nombreEnElPrototipo: 'GALERIA', listaDelPrototipo: 'galeria' },
    ].map(({ listado, publicado, nombreEnElPrototipo, listaDelPrototipo }) => ({
      listado,
      publicado,
      delPrototipo: contarEntradasDelCatalogoDelPrototipo(texto, nombreEnElPrototipo) as number,
      deLaPistaDeVistaPrevia: leerPistaDeVistaPrevia(texto, listaDelPrototipo) as number,
    }))

    const informe = ejecutarPuertaDeRecuentosReales(recuentos)

    expect(informe.pasa).toBe(true)
    expect(informe.discrepancias).toEqual([])
    expect(informe.listadosInspeccionados).toBe(3)
    // Los recuentos REALES, escritos a mano y confrontados con `src/data/*.ts`:
    // 5 servicios y 2 profesionales (`docs/datos-galapavet.md` §5 y §4) y las
    // 6 fotografías de demostración del catálogo de galería.
    expect(recuentos.map((recuento) => recuento.publicado)).toEqual([5, 2, 6])
  })

  it('delata un recuento tomado del prototipo y otro tomado de la pista de vista previa, por separado', () => {
    const informe = ejecutarPuertaDeRecuentosReales([
      { listado: 'servicios', publicado: 12, delPrototipo: 12, deLaPistaDeVistaPrevia: 6 },
      { listado: 'equipo', publicado: 6, delPrototipo: 6, deLaPistaDeVistaPrevia: 6 },
      { listado: 'galería', publicado: 5, delPrototipo: 9, deLaPistaDeVistaPrevia: 5 },
    ])

    expect(informe.pasa).toBe(false)
    expect(informe.discrepancias).toEqual([
      { listado: 'servicios', procedencia: 'el catálogo del prototipo', recuento: 12 },
      { listado: 'equipo', procedencia: 'el catálogo del prototipo', recuento: 6 },
      { listado: 'equipo', procedencia: 'la pista de vista previa del editor de diseño', recuento: 6 },
      { listado: 'galería', procedencia: 'la pista de vista previa del editor de diseño', recuento: 5 },
    ])
    expect(informe.listadosInspeccionados).toBe(3)
  })

  it('falla cerrada si no compara ningún listado, y no dice que no encontró ninguna discrepancia', () => {
    const informe = ejecutarPuertaDeRecuentosReales([])

    expect(informe.pasa).toBe(false)
    expect(informe.listadosInspeccionados).toBe(0)
    expect(informe.discrepancias).toEqual([])
    expect(informe.motivo).toContain('0 listados')
    expect(informe.motivo).not.toMatch(/no encontr/i)
  })
})

describe('@s51 las cuatro cifras de la bienvenida se derivan de la fuente única, sin retipear', () => {
  it('enumera los dígitos que aparecen en un texto, y devuelve lista vacía si no hay ninguno', () => {
    expect(digitosDe('Urgencias 24 h los 365 días')).toEqual(['2', '4', '3', '6', '5'])
    expect(digitosDe('<strong>{cifra.valor}</strong>')).toEqual([])
    expect(digitosDe('')).toEqual([])
  })

  it('extrae el trozo entre dos marcas y devuelve null si falta cualquiera de las dos', () => {
    expect(extraerFragmento('antes<ul>medio</ul>después', '<ul>', '</ul>')).toBe('medio')
    expect(extraerFragmento('antes<ul>medio</ul>', 'no-existe', '</ul>')).toBeNull()
    expect(extraerFragmento('antes<ul>medio sin cierre', '<ul>', '</ul>')).toBeNull()
  })
})

describe('@s52 el sitio no afirma en ningún sitio que preste un servicio que no presta', () => {
  it('delata el reclamo literal del prototipo, y lo clasifica en sus dos categorías', () => {
    const informe = ejecutarPuertaDeAfirmacionesProhibidas(
      [
        { categoria: 'atención las veinticuatro horas', frase: '24 h' },
        { categoria: 'atención todos los días del año', frase: 'todos los días del año' },
      ],
      [{ ruta: '/', textoVisible: 'Urgencias 24 h · todos los días del año' }],
    )

    expect(informe.pasa).toBe(false)
    expect(informe.hallazgos).toEqual([
      { ruta: '/', categoria: 'atención las veinticuatro horas', frase: '24 h' },
      { ruta: '/', categoria: 'atención todos los días del año', frase: 'todos los días del año' },
    ])
    expect(informe.rutasInspeccionadas).toBe(1)
    expect(informe.afirmacionesBuscadas).toBe(2)
  })

  it('el compromiso REAL de Galapavet no dispara ninguna afirmación prohibida', () => {
    const informe = ejecutarPuertaDeAfirmacionesProhibidas(
      [
        { categoria: 'atención las veinticuatro horas', frase: '24 h' },
        { categoria: 'atención todos los días del año', frase: 'todos los días del año' },
      ],
      [
        { ruta: '/', textoVisible: 'Urgencias fuera de horario · 91 851 13 93' },
        { ruta: '/tienda', textoVisible: 'Lunes a viernes de 11:00 a 14:00 y de 16:30 a 20:00' },
      ],
    )

    expect(informe.pasa).toBe(true)
    expect(informe.hallazgos).toEqual([])
    expect(informe.rutasInspeccionadas).toBe(2)
    expect(informe.motivo).toBeUndefined()
  })

  it('encuentra la afirmación aunque la ruta la escriba en otra caja de letras', () => {
    const informe = ejecutarPuertaDeAfirmacionesProhibidas(
      [{ categoria: 'atención todos los días del año', frase: 'todos los días del año' }],
      [{ ruta: '/blog', textoVisible: 'ABIERTO TODOS LOS DÍAS DEL AÑO' }],
    )

    expect(informe.hallazgos).toEqual([
      { ruta: '/blog', categoria: 'atención todos los días del año', frase: 'todos los días del año' },
    ])
  })

  it('falla cerrada sin rutas y sin afirmaciones, y en ninguno de los dos casos dice que no encontró nada', () => {
    const sinRutas = ejecutarPuertaDeAfirmacionesProhibidas([{ categoria: 'x', frase: '24 h' }], [])
    const sinAfirmaciones = ejecutarPuertaDeAfirmacionesProhibidas([], [{ ruta: '/', textoVisible: 'Galapavet' }])

    expect(sinRutas.pasa).toBe(false)
    expect(sinRutas.rutasInspeccionadas).toBe(0)
    expect(sinRutas.afirmacionesBuscadas).toBe(1)
    expect(sinRutas.hallazgos).toEqual([])
    expect(sinRutas.motivo).toContain('0 rutas')
    expect(sinRutas.motivo).not.toMatch(/no encontr/i)

    expect(sinAfirmaciones.pasa).toBe(false)
    expect(sinAfirmaciones.rutasInspeccionadas).toBe(1)
    expect(sinAfirmaciones.afirmacionesBuscadas).toBe(0)
    expect(sinAfirmaciones.hallazgos).toEqual([])
    expect(sinAfirmaciones.motivo).toContain('0 afirmaciones')
    expect(sinAfirmaciones.motivo).not.toMatch(/no encontr/i)
  })

  it('deriva el compromiso declarado del rótulo de la fuente única, sin retiparlo', () => {
    // El rótulo REAL de `src/lib/site.ts` (`ROTULO_URGENCIAS`), no una copia.
    expect(cualificadorDeclaradoDe(datosNegocio.telefonoUrgencias.rotulo as string)).toBe('fuera de horario')
    expect(cualificadorDeclaradoDe('Atención veterinaria general')).toBeNull()
  })

  it('recoge el cualificador que sigue a la palabra "urgencias", y solo ese', () => {
    expect(compromisosDeUrgenciasEn('Urgencias fuera de horario · 91 851 13 93', CUALIFICADORES)).toEqual([
      'fuera de horario',
    ])
    // "fuera de horario" ANTES de la palabra no cuenta: solo lo que la sigue.
    expect(compromisosDeUrgenciasEn('Atendemos fuera de horario y también urgencias 24 h', CUALIFICADORES)).toEqual([
      '24 h',
    ])
    expect(compromisosDeUrgenciasEn('Es una urgencia, llama al 91 851 13 93', CUALIFICADORES)).toEqual([])
    // Ni siquiera cuando el texto ANTERIOR a la palabra empieza, él mismo, por
    // un cualificador: el trozo previo a la primera aparición no es ventana.
    expect(compromisosDeUrgenciasEn(' fuera de horario. Atendemos urgencias 24 h', CUALIFICADORES)).toEqual(['24 h'])
  })

  it('el único compromiso de urgencias del sitio real es el que declara la fuente única', () => {
    const informe = ejecutarPuertaDeCompromisoDeUrgencias(CUALIFICADORES, 'fuera de horario', [
      { ruta: '/', textoVisible: 'Urgencias fuera de horario · 91 851 13 93' },
      { ruta: '/tienda', textoVisible: 'Llamar a urgencias fuera de horario' },
    ])

    expect(informe.pasa).toBe(true)
    expect(informe.compromisosEncontrados).toEqual(['fuera de horario'])
    expect(informe.rutasInspeccionadas).toBe(2)
    expect(informe.cualificadoresBuscados).toBe(CUALIFICADORES.length)
    expect(informe.motivo).toBeUndefined()
  })

  it('falla si el único compromiso encontrado no coincide con el declarado por la fuente única', () => {
    // Dato SINTÉTICO (no el sitio real): "permanentes" es el único
    // cualificador del catálogo que casa con este texto, así que
    // compromisosEncontrados tiene longitud 1 — pero no es "fuera de
    // horario", el cualificador que declara la fuente única. Distingue la
    // comparación real de un mutante que la sustituye por `true`.
    const informe = ejecutarPuertaDeCompromisoDeUrgencias(CUALIFICADORES, 'fuera de horario', [
      { ruta: '/', textoVisible: 'Urgencias permanentes, siempre atendemos' },
    ])

    expect(informe.compromisosEncontrados).toEqual(['permanentes'])
    expect(informe.pasa).toBe(false)
  })

  it('falla si aparece un segundo compromiso, y falla también si el único que aparece no es el declarado', () => {
    const conSegundoCompromiso = ejecutarPuertaDeCompromisoDeUrgencias(CUALIFICADORES, 'fuera de horario', [
      { ruta: '/', textoVisible: 'Urgencias fuera de horario · 91 851 13 93' },
      { ruta: '/blog', textoVisible: 'Urgencias 24 h para cualquier imprevisto' },
    ])
    const conOtroCompromiso = ejecutarPuertaDeCompromisoDeUrgencias(CUALIFICADORES, 'fuera de horario', [
      { ruta: '/', textoVisible: 'Urgencias todos los días del año' },
    ])

    expect(conSegundoCompromiso.pasa).toBe(false)
    expect(conSegundoCompromiso.compromisosEncontrados).toEqual(['fuera de horario', '24 h'])
    expect(conOtroCompromiso.pasa).toBe(false)
    // Los DOS cualificadores del catálogo casan con esa frase, y los dos se
    // informan: "todos los días del año" y su prefijo "todos los días".
    expect(conOtroCompromiso.compromisosEncontrados).toEqual(['todos los días del año', 'todos los días'])
  })

  it('falla cerrada si el sitio no menciona ni una sola vez el compromiso de urgencias', () => {
    const sinMenciones = ejecutarPuertaDeCompromisoDeUrgencias(CUALIFICADORES, 'fuera de horario', [
      { ruta: '/', textoVisible: 'Galapavet, centro integral veterinario' },
    ])
    const sinRutas = ejecutarPuertaDeCompromisoDeUrgencias(CUALIFICADORES, 'fuera de horario', [])
    const sinCualificadores = ejecutarPuertaDeCompromisoDeUrgencias([], 'fuera de horario', [
      { ruta: '/', textoVisible: 'Urgencias fuera de horario' },
    ])

    expect(sinMenciones.pasa).toBe(false)
    expect(sinMenciones.compromisosEncontrados).toEqual([])
    expect(sinRutas.pasa).toBe(false)
    expect(sinRutas.rutasInspeccionadas).toBe(0)
    expect(sinRutas.cualificadoresBuscados).toBe(CUALIFICADORES.length)
    expect(sinRutas.compromisosEncontrados).toEqual([])
    expect(sinRutas.motivo).toContain('0 rutas')
    expect(sinCualificadores.pasa).toBe(false)
    expect(sinCualificadores.rutasInspeccionadas).toBe(1)
    expect(sinCualificadores.cualificadoresBuscados).toBe(0)
    expect(sinCualificadores.compromisosEncontrados).toEqual([])
    expect(sinCualificadores.motivo).toContain('0 cualificadores')
  })
})
