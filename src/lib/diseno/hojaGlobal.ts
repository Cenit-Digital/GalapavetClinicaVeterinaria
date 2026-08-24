/**
 * Puerta de ENGANCHE de la capa base (@s12 de `identidad_visual.feature`).
 *
 * Existe por una avería concreta y medida: `src/styles/_tokens.scss` declaraba
 * los tokens, `vite.config.ts` los inyectaba en cada `.module.scss`… y ningún
 * fichero aplicaba nada al documento, porque `src/main.tsx` no importaba
 * ninguna hoja global. Resultado medido sobre `dist/` el 23/08/2026: 0
 * apariciones de `font-family` y 0 reglas para `html` o `body`. Un parcial que
 * existe pero no está enganchado es CSS muerto, y ninguna de las 712 pruebas
 * verdes podía verlo.
 */

/** Ruta, desde la raíz del repositorio, de la única hoja global del documento. */
export const RUTA_HOJA_GLOBAL = 'src/styles/global.scss'

const PREFIJO_DE_CODIGO_FUENTE = 'src/'

/**
 * Toda importación de un módulo, con o sin cláusula `from`: la hoja global se
 * importa por su efecto secundario (`import './styles/global.scss'`), sin
 * enlazar ningún símbolo.
 */
const PATRON_IMPORTACION = /^\s*import\s+(?:[^'"]*\sfrom\s+)?['"]([^'"]+)['"]/gm

function sufijoResoluble(rutaDeLaHoja: string): string {
  return rutaDeLaHoja.startsWith(PREFIJO_DE_CODIGO_FUENTE) ? rutaDeLaHoja.slice(PREFIJO_DE_CODIGO_FUENTE.length) : rutaDeLaHoja
}

/**
 * Cuántas veces el texto de un módulo importa la hoja indicada. Compara por
 * sufijo de ruta, así que reconoce igual `./styles/global.scss`,
 * `../styles/global.scss` y el alias `@styles/global.scss`.
 */
export function contarImportacionesDeHojaGlobal(textoDeModulo: string, rutaDeLaHoja: string): number {
  const sufijo = sufijoResoluble(rutaDeLaHoja)
  return [...textoDeModulo.matchAll(PATRON_IMPORTACION)].filter((coincidencia) => (coincidencia[1] as string).endsWith(sufijo)).length
}

/**
 * Los tres selectores cuya salud NO puede depender de que un componente
 * concreto se monte: solo la hoja global puede declararlos (@s12).
 */
export const SELECTORES_DE_DOCUMENTO: readonly string[] = ['html', 'body', '#root']

const SIN_COINCIDENCIA = -1

/**
 * Cuáles de los tres selectores de documento declara un texto SCSS, en orden
 * de aparición y sin repetir. Compara el selector COMPLETO, así que ni `.body`
 * ni `#rootModal` ni `html[data-variante]` cuentan como el selector desnudo.
 */
export function selectoresDeDocumentoDeclarados(textoScss: string): readonly string[] {
  const declarados: string[] = []
  for (const regla of extraerReglas(textoScss)) {
    for (const candidato of SELECTORES_DE_DOCUMENTO) {
      if (regla.selectores.includes(candidato) && !declarados.includes(candidato)) {
        declarados.push(candidato)
      }
    }
  }
  return declarados
}

/** Una regla concreta que una familia del reset exige encontrar en la hoja global. */
export interface ReglaExigida {
  /** Todos estos selectores tienen que estar alcanzados por la MISMA regla. */
  readonly selectores: readonly string[]
  /** Todas estas declaraciones tienen que vivir en el bloque de esa misma regla. */
  readonly declaraciones: readonly string[]
}

export interface FamiliaDelReset {
  readonly numero: number
  readonly descripcion: string
  readonly reglasExigidas: readonly ReglaExigida[]
}

const ENCABEZADOS: readonly string[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/**
 * Literal escrito a mano: las NUEVE familias de reglas de la Decisión 29
 * (`project-spec.md:110`), que @s13 enumera una a una. No es un reset de
 * terceros: cada familia arregla un defecto medido y se justifica por sí sola.
 */
export const FAMILIAS_DEL_RESET: readonly FamiliaDelReset[] = [
  {
    numero: 1,
    descripcion: 'el modelo de caja predecible alcanza también a los pseudoelementos',
    reglasExigidas: [{ selectores: ['*', '*::before', '*::after'], declaraciones: ['box-sizing: border-box'] }],
  },
  {
    numero: 2,
    descripcion: 'el cuerpo deja de arrastrar el margen de 8px de la hoja del agente de usuario',
    reglasExigidas: [{ selectores: ['body'], declaraciones: ['margin: 0'] }],
  },
  {
    numero: 3,
    descripcion: 'los márgenes de bloque en "em" que colapsan se anulan: el ritmo vertical lo gobierna la escala de espaciado',
    reglasExigidas: [{ selectores: [...ENCABEZADOS, 'p', 'blockquote', 'figure', 'dl', 'dd'], declaraciones: ['margin-block: 0'] }],
  },
  {
    numero: 4,
    descripcion: 'los controles heredan tipografía y color: la spec de renderizado se los reasigna al sistema',
    reglasExigidas: [{ selectores: ['input', 'button', 'textarea', 'select'], declaraciones: ['font: inherit', 'color: inherit'] }],
  },
  {
    numero: 5,
    descripcion: 'los medios dejan de tener el hueco de la línea base y nunca desbordan su contenedor',
    reglasExigidas: [{ selectores: ['img', 'picture', 'video', 'canvas', 'svg'], declaraciones: ['display: block', 'max-width: 100%'] }],
  },
  {
    numero: 6,
    descripcion: 'el cuerpo aplica de verdad los tokens del documento: alto, interlineado, fondo, color y familia, a la vez',
    reglasExigidas: [
      {
        selectores: ['body'],
        declaraciones: ['min-height: 100svh', 'line-height: 1.5', 'background-color: var(--color-fondo)', 'color: var(--color-texto)', 'font-family: var(--fuente-texto)'],
      },
    ],
  },
  {
    numero: 7,
    descripcion: 'el ajuste automático de tamaño de texto al girar el móvil no reescala la tipografía',
    reglasExigidas: [{ selectores: ['html'], declaraciones: ['-webkit-text-size-adjust: 100%'] }],
  },
  {
    numero: 8,
    descripcion: 'el contenedor de montaje crea su propio contexto de apilamiento',
    reglasExigidas: [{ selectores: ['#root'], declaraciones: ['isolation: isolate'] }],
  },
  {
    numero: 9,
    descripcion: 'los titulares equilibran sus líneas y la prosa evita la línea huérfana, nunca sobre "body" por su coste de rendimiento',
    reglasExigidas: [
      { selectores: ENCABEZADOS, declaraciones: ['text-wrap: balance'] },
      { selectores: ['p', 'li'], declaraciones: ['text-wrap: pretty'] },
    ],
  },
]

/** Una regla CSS ya troceada: su lista de selectores, las declaraciones de su bloque y los bloques que la contienen. */
export interface ReglaLeida {
  readonly selectores: readonly string[]
  readonly declaraciones: readonly string[]
  /** Los selectores/encabezados de los bloques que envuelven esta regla, de fuera hacia dentro (@s15). */
  readonly ancestros: readonly string[]
}

interface ReglaEnConstruccion {
  readonly selectores: readonly string[]
  readonly declaraciones: string[]
  readonly ancestros: readonly string[]
}

const PATRON_COMENTARIO_DE_LINEA = /\/\/.*$/
/**
 * Interpolación de Sass dentro de un valor (`#{espaciado(16)}`). Sus llaves
 * NO abren ni cierran un bloque: sin deshacerlas, una declaración con
 * interpolación se leería como el comienzo de una regla nueva.
 */
const PATRON_INTERPOLACION_SASS = /#\{([^}]*)\}/g
const PATRON_ESPACIOS = /\s+/g
const FIN_DE_DECLARACION = ';'
const SEPARADOR_DE_SELECTORES = ','
const TEXTO_VACIO = ''

function normalizar(fragmento: string): string {
  return fragmento.trim().replace(PATRON_ESPACIOS, ' ')
}

function trocearSelectores(fragmento: string): readonly string[] {
  return fragmento
    .split(SEPARADOR_DE_SELECTORES)
    .map(normalizar)
    .filter((selector) => selector !== TEXTO_VACIO)
}

/**
 * Trocea el texto de una hoja SCSS en reglas, siguiendo la profundidad de
 * bloques `{ }` línea a línea, igual que hace la puerta de movimiento ya
 * existente (`movimientoRespetuoso.ts`). Reconoce listas de selectores
 * repartidas en varias líneas, que es como se escribe un reset legible.
 */
export function extraerReglas(textoScss: string): readonly ReglaLeida[] {
  const reglas: ReglaEnConstruccion[] = []
  const pila: ReglaEnConstruccion[] = []
  let selectoresPendientes = TEXTO_VACIO

  for (const lineaConComentario of textoScss.split('\n')) {
    const linea = lineaConComentario.replace(PATRON_COMENTARIO_DE_LINEA, TEXTO_VACIO).replace(PATRON_INTERPOLACION_SASS, '$1')
    const indiceDeApertura = linea.indexOf('{')

    if (indiceDeApertura !== SIN_COINCIDENCIA) {
      const regla = {
        selectores: trocearSelectores(`${selectoresPendientes}${SEPARADOR_DE_SELECTORES}${linea.slice(0, indiceDeApertura)}`),
        declaraciones: [],
        ancestros: pila.map((ancestro) => ancestro.selectores.join(`${SEPARADOR_DE_SELECTORES} `)),
      }
      reglas.push(regla)
      pila.push(regla)
      selectoresPendientes = TEXTO_VACIO
    } else if (linea.includes('}')) {
      pila.pop()
      selectoresPendientes = TEXTO_VACIO
    } else if (normalizar(linea).endsWith(FIN_DE_DECLARACION)) {
      const declaracion = normalizar(linea).slice(0, -FIN_DE_DECLARACION.length)
      pila.at(-1)?.declaraciones.push(normalizar(declaracion))
      selectoresPendientes = TEXTO_VACIO
    } else if (normalizar(linea) !== TEXTO_VACIO) {
      selectoresPendientes = `${selectoresPendientes}${SEPARADOR_DE_SELECTORES}${linea}`
    }
  }

  return reglas
}

function reglaCumple(regla: ReglaLeida, exigida: ReglaExigida): boolean {
  return (
    exigida.selectores.every((selector) => regla.selectores.includes(selector)) &&
    exigida.declaraciones.every((declaracion) => regla.declaraciones.includes(declaracion))
  )
}

export interface InformeDelReset {
  readonly pasa: boolean
  readonly familiasComprobadas: number
  readonly familiasAusentes: readonly FamiliaDelReset[]
}

const CERO_FAMILIAS = 0

/**
 * Busca cada familia del inventario en el texto real de la hoja global (@s13).
 * Falla cerrada con un inventario vacío: "ninguna familia falta" de un
 * inventario sin familias sería verde por vacuidad, que es exactamente el
 * defecto que esta feature existe para destapar.
 */
export function comprobarFamiliasDelReset(textoScss: string, familias: readonly FamiliaDelReset[]): InformeDelReset {
  const reglas = extraerReglas(textoScss)
  const familiasAusentes = familias.filter((familia) => !familia.reglasExigidas.every((exigida) => reglas.some((regla) => reglaCumple(regla, exigida))))

  return {
    pasa: familias.length > CERO_FAMILIAS && familiasAusentes.length === CERO_FAMILIAS,
    familiasComprobadas: familias.length,
    familiasAusentes,
  }
}

/**
 * Todas las declaraciones que un selector recibe en un texto SCSS, en orden de
 * documento. Sirve para las prohibiciones: @s13 exige que `text-wrap: pretty`
 * NO se declare sobre `body`, porque MDN avisa de su coste de rendimiento.
 */
export function declaracionesDelSelector(textoScss: string, selector: string): readonly string[] {
  return extraerReglas(textoScss)
    .filter((regla) => regla.selectores.includes(selector))
    .flatMap((regla) => regla.declaraciones)
}

const SEPARADOR_DE_DECLARACION = ': '
const PATRON_VARIABLE_CSS = /var\((--[\w-]+)\)/g

/**
 * El valor declarado de una propiedad para un selector, o `undefined` si ese
 * selector no la declara. Compara el nombre COMPLETO de la propiedad, así que
 * `scroll-padding` no encuentra el valor de `scroll-padding-top`.
 */
export function valorDeclarado(textoScss: string, selector: string, propiedad: string): string | undefined {
  const prefijo = `${propiedad}${SEPARADOR_DE_DECLARACION}`
  const declaracion = declaracionesDelSelector(textoScss, selector).find((candidata) => candidata.startsWith(prefijo))
  return declaracion?.slice(prefijo.length)
}

/** Los nombres de las custom properties que un valor consume vía `var(…)`, en orden. */
export function variablesCssUsadas(valor: string): readonly string[] {
  return [...valor.matchAll(PATRON_VARIABLE_CSS)].map((coincidencia) => coincidencia[1] as string)
}
