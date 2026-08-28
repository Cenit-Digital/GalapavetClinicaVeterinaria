import { describe, expect, it } from 'vitest'
// Import "?raw" de Vite: trae el contenido de `index.html` como cadena, sin
// tocar `node:fs` (este proyecto es una app de navegador, no un script de
// Node) y sin ejecutar el documento — jsdom no ejecuta scripts inline de
// `index.html`, así que este test lee el texto en vez de montarlo (@s10).
import htmlIndice from '../../index.html?raw'
import { VARIANTES_PALETA, type VariantePaleta } from '../data/variantesPaleta'
import {
  buscarDeclaracionesLiteralesDelIdentificador,
  VARIANTE_PREDETERMINADA,
  VARIANTES_REDISENO,
  type FuenteDeProyecto,
} from '../lib/diseno/contratoRedisenho'
import {
  CLAVE_ALMACENAMIENTO_VARIANTE,
  leerVarianteAlmacenada,
  resolverVarianteInicial,
  VARIANTE_POR_DEFECTO,
} from './SelectorPaleta-logica'

/**
 * TODO el código ejecutable del proyecto —los `.ts`/`.tsx` de `src` que no son
 * tests, más el `index.html`— leído como TEXTO REAL con `?raw`. Es el corpus
 * de la puerta de @s10: «el identificador aparece declarado una sola vez en
 * todo el proyecto».
 */
const CODIGO_EJECUTABLE_DEL_PROYECTO: readonly FuenteDeProyecto[] = [
  ...Object.entries(
    import.meta.glob(['../**/*.ts', '../**/*.tsx', '!../**/*.test.ts', '!../**/*.test.tsx'], {
      eager: true,
      query: '?raw',
      import: 'default',
    }) as Record<string, string>,
  ).map(([ruta, texto]) => ({ ruta, texto })),
  { ruta: 'index.html', texto: htmlIndice },
]

/**
 * Los tres puntos que el Given de @s10 enumera, con la clave que
 * `import.meta.glob` les da desde este fichero. El catálogo de variantes es
 * `VARIANTES_REDISENO` (`contratoRedisenho.ts:24`), la única declaración; los
 * otros dos la consumen.
 */
const RUTA_DEL_CATALOGO_DE_VARIANTES = '../lib/diseno/contratoRedisenho.ts'
const RUTA_DE_LA_LOGICA_DEL_SELECTOR = './SelectorPaleta-logica.ts'
const RUTA_DEL_GUION_ANTI_PARPADEO = 'index.html'
/** El catálogo de presentación, que también consume los ids (`variantesPaleta.ts:14-18`). */
const RUTA_DEL_CATALOGO_DE_PRESENTACION = '../data/variantesPaleta.ts'

const TOTAL_DE_PUNTOS_DEL_ESCENARIO = 3
const TOTAL_DE_VARIANTES_NO_PREDETERMINADAS = 4
/** «una sola vez en todo el proyecto» (@s10): ni cero —la fuente única desapareció— ni dos. */
const UNA_SOLA_DECLARACION_ESPERADA = 1

/**
 * Los puntos que CONSUMEN la declaración y por tanto no pueden volver a
 * escribir el identificador. La puerta ancha recorre el proyecto entero, pero
 * afirma sobre estos: medido el 26/08/2026, `fidelidadPrototipo.ts:96` también
 * nombra la variante, y con razón —es la tabla de correspondencia con el tema
 * del prototipo de @s3, un USO del nombre, no una decisión sobre cuál es la
 * predeterminada—, igual que el selector CSS de `_tokens.scss:43`.
 */
const RUTAS_QUE_CONSUMEN_LA_DECLARACION: readonly string[] = [
  RUTA_DE_LA_LOGICA_DEL_SELECTOR,
  RUTA_DEL_GUION_ANTI_PARPADEO,
  RUTA_DEL_CATALOGO_DE_PRESENTACION,
]

/** El fichero `ruta` del corpus. Lanza si no está: una puerta sin material no puede aprobar. */
function fuenteDelCorpus(ruta: string): FuenteDeProyecto {
  const fuente = CODIGO_EJECUTABLE_DEL_PROYECTO.find((candidata) => candidata.ruta === ruta)
  if (fuente === undefined) {
    throw new Error(`el corpus de código ejecutable no contiene "${ruta}"`)
  }
  return fuente
}

/** El literal de ids que el guion anti-parpadeo de `index.html` declara. */
const PATRON_IDS_DEL_GUION_ANTI_PARPADEO = /IDS_NO_PREDETERMINADOS\s*=\s*\[([^\]]*)\]/
const PATRON_COMILLAS_EXTERIORES = /^['"]|['"]$/g

/**
 * Los ids de variante que el guion anti-parpadeo lista, extraídos del TEXTO
 * REAL de `index.html`. Lanza si el guion ya no los declara, en vez de
 * devolver una lista vacía que aprobaría por vacuidad (@s10).
 */
function extraerIdsDeVarianteDelGuionAntiParpadeo(html: string): readonly string[] {
  const coincidencia = html.match(PATRON_IDS_DEL_GUION_ANTI_PARPADEO)
  if (coincidencia === null) {
    throw new Error('el guion anti-parpadeo de "index.html" ya no declara "IDS_NO_PREDETERMINADOS"')
  }

  return (coincidencia[1] as string)
    .split(',')
    .map((crudo) => crudo.trim().replace(PATRON_COMILLAS_EXTERIORES, ''))
    .filter((id) => id.length > 0)
}

/** Doble de `Storage` cuyo `getItem` lanza, como pide @s14. */
const ALMACENAMIENTO_QUE_LANZA_AL_LEER = {
  getItem(): string | null {
    throw new Error('almacenamiento no disponible')
  },
}

/** Un script `<script atributos>contenido</script>` extraído de `index.html`. */
interface ScriptEncontrado {
  readonly atributos: string
  readonly contenido: string
  readonly indice: number
}

/** Todos los `<script>` de `html`, en orden de aparición, con sus atributos crudos y su posición. */
function extraerScripts(html: string): readonly ScriptEncontrado[] {
  const patron = /<script([^>]*)>([\s\S]*?)<\/script>/g
  const encontrados: ScriptEncontrado[] = []
  for (const coincidencia of html.matchAll(patron)) {
    encontrados.push({
      atributos: coincidencia[1] ?? '',
      contenido: coincidencia[2] ?? '',
      indice: coincidencia.index,
    })
  }
  return encontrados
}

describe('@s9 la variante guardada se resuelve antes del primer pintado', () => {
  it('con "tech" guardado bajo la clave del selector, resuelve exactamente "tech" y ese valor es el que se escribiría en data-variante', () => {
    window.localStorage.setItem(CLAVE_ALMACENAMIENTO_VARIANTE, 'tech')

    const resuelto = resolverVarianteInicial(
      window.localStorage.getItem(CLAVE_ALMACENAMIENTO_VARIANTE),
      VARIANTES_PALETA,
    )

    expect(resuelto).toBe('tech')

    document.documentElement.setAttribute('data-variante', resuelto)
    expect(document.documentElement.getAttribute('data-variante')).toBe('tech')
  })
})

describe('@s10 el script de arranque precede al paquete de la aplicación', () => {
  it('el script en línea que escribe data-variante aparece antes que el módulo de la app, sin defer/async/src', () => {
    const scripts = extraerScripts(htmlIndice)

    const indiceModulo = htmlIndice.indexOf('<script type="module" src="/src/main.tsx">')
    expect(indiceModulo).toBeGreaterThan(-1)

    const scriptAntiDestello = scripts.find((script) => script.contenido.includes('data-variante'))

    expect(scriptAntiDestello).toBeDefined()
    expect(scriptAntiDestello?.indice).toBeLessThan(indiceModulo)
    expect(scriptAntiDestello?.atributos).not.toMatch(/\bdefer\b/)
    expect(scriptAntiDestello?.atributos).not.toMatch(/\basync\b/)
    expect(scriptAntiDestello?.atributos).not.toMatch(/\bsrc=/)
  })
})

describe('@s11 un identificador desconocido cae a la variante por defecto', () => {
  it('con un identificador corrupto guardado, resuelve exactamente "clinica"', () => {
    const resuelto = resolverVarianteInicial('no-existe', VARIANTES_PALETA)

    expect(resuelto).toBe('clinica')
    expect(resuelto).not.toBe('no-existe')
  })
})

describe('@s12 una preferencia vacía cae a la variante por defecto', () => {
  it('con cadena vacía guardada, resuelve exactamente "clinica"', () => {
    const resuelto = resolverVarianteInicial('', VARIANTES_PALETA)

    expect(resuelto).toBe('clinica')
  })
})

describe('@s13 un valor corrupto no llega nunca al atributo del documento', () => {
  it('con texto corrupto guardado, resuelve exactamente "clinica", uno de los 5 identificadores del catálogo', () => {
    const resuelto = resolverVarianteInicial('{"tema":"noche', VARIANTES_PALETA)

    expect(resuelto).toBe('clinica')
    expect(['clinica', 'calida', 'tech', 'eco', 'marca']).toContain(resuelto)
  })
})

describe('resolverVarianteInicial distingue "stored es null" de "stored no está en el catálogo", nunca solo del resultado de un `.includes`', () => {
  /**
   * `idsDelCatalogo(catalogo).includes(stored)` con `stored === null` da
   * `false` para CUALQUIER catálogo real (los ids son siempre `string`, y
   * `.includes` no coacciona tipos), así que un test con un catálogo normal
   * no puede distinguir "el guardián `stored !== null` cortó antes de
   * llamar a `.includes`" de "`.includes` se llamó y dio `false` por sí
   * mismo". Para ejercitar el guardián en sí (y no una coincidencia de
   * `.includes`), este catálogo sintético fuerza, a propósito y solo en
   * tiempo de ejecución (nunca lo permitiría el tipo `VariantePaleta.id:
   * string`), un id literalmente `null`.
   */
  const CATALOGO_CON_ID_NULO = [{ id: null, nombre: 'Corrupto' }] as unknown as readonly VariantePaleta[]

  it('con stored === null, nunca resuelve a un id del catálogo, aunque el catálogo contenga un id literalmente null', () => {
    const resuelto = resolverVarianteInicial(null, CATALOGO_CON_ID_NULO)

    expect(resuelto).toBe(VARIANTE_POR_DEFECTO)
    expect(resuelto).not.toBeNull()
  })
})

describe('@s14 el almacenamiento que lanza al leer no impide cargar la página', () => {
  it('leerVarianteAlmacenada no propaga la excepción y resolverVarianteInicial resuelve "clinica"', () => {
    let lanzado: unknown
    let bruto: string | null = 'valor no alcanzado'
    try {
      bruto = leerVarianteAlmacenada(ALMACENAMIENTO_QUE_LANZA_AL_LEER)
    } catch (error) {
      lanzado = error
    }

    expect(lanzado).toBeUndefined()
    expect(bruto).toBeNull()
    expect(resolverVarianteInicial(bruto, VARIANTES_PALETA)).toBe('clinica')
  })
})

describe('@s10 la variante por defecto está declarada en un único sitio y los otros dos puntos la consumen', () => {
  it('de los TRES puntos que el escenario nombra, solo el catálogo de variantes escribe el identificador', () => {
    const informe = buscarDeclaracionesLiteralesDelIdentificador(
      [
        fuenteDelCorpus(RUTA_DEL_CATALOGO_DE_VARIANTES),
        fuenteDelCorpus(RUTA_DE_LA_LOGICA_DEL_SELECTOR),
        fuenteDelCorpus(RUTA_DEL_GUION_ANTI_PARPADEO),
      ],
      VARIANTE_PREDETERMINADA,
    )

    expect(informe.ficherosInspeccionados).toBe(TOTAL_DE_PUNTOS_DEL_ESCENARIO)
    expect(informe.ficherosQueDeclaran).toEqual([RUTA_DEL_CATALOGO_DE_VARIANTES])
    expect(informe.pasa).toBe(true)
  })

  it('en TODO el código ejecutable el identificador se declara UNA sola vez, y es el catálogo quien lo declara', () => {
    const informe = buscarDeclaracionesLiteralesDelIdentificador(CODIGO_EJECUTABLE_DEL_PROYECTO, VARIANTE_PREDETERMINADA)

    expect(informe.ficherosInspeccionados).toBeGreaterThan(TOTAL_DE_PUNTOS_DEL_ESCENARIO)
    // La cláusula literal de @s10 es «el identificador aparece declarado una
    // sola vez en TODO el proyecto». Se afirma como identidad de la lista
    // entera, no con un `toContain` que dejaría pasar a un segundo declarante.
    expect(informe.ficherosQueDeclaran).toEqual([RUTA_DEL_CATALOGO_DE_VARIANTES])
    expect(informe.ficherosQueDeclaran).toHaveLength(UNA_SOLA_DECLARACION_ESPERADA)
    expect(informe.pasa).toBe(true)

    let puntosDeConsumoComprobados = 0
    for (const rutaQueConsume of RUTAS_QUE_CONSUMEN_LA_DECLARACION) {
      expect(informe.ficherosQueDeclaran).not.toContain(rutaQueConsume)
      puntosDeConsumoComprobados += 1
    }

    expect(puntosDeConsumoComprobados).toBe(RUTAS_QUE_CONSUMEN_LA_DECLARACION.length)
  })

  it('la lógica del selector consume esa declaración: su valor ES el del catálogo, no una copia', () => {
    expect(VARIANTE_POR_DEFECTO).toBe(VARIANTE_PREDETERMINADA)
    expect(VARIANTE_PREDETERMINADA).toBe(VARIANTES_REDISENO[0])
    expect(resolverVarianteInicial(null, VARIANTES_PALETA)).toBe(VARIANTE_PREDETERMINADA)
  })

  it('el guion anti-parpadeo consume esa declaración: lista exactamente las variantes NO predeterminadas', () => {
    const idsDelGuion = extraerIdsDeVarianteDelGuionAntiParpadeo(htmlIndice)
    const noPredeterminadas = VARIANTES_REDISENO.filter((id) => id !== VARIANTE_PREDETERMINADA)

    expect(idsDelGuion).toEqual(noPredeterminadas)
    expect(idsDelGuion).toHaveLength(TOTAL_DE_VARIANTES_NO_PREDETERMINADAS)
    expect(idsDelGuion).not.toContain(VARIANTE_PREDETERMINADA)
  })
})
