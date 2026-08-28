/**
 * Puertas de "los datos siguen siendo los reales" (bloque G de
 * `features/rediseno_visual.feature`, @s49-@s52).
 *
 * Módulo PURO: no lee ficheros ni navega. Recibe textos ya leídos y devuelve
 * informes con CONTADORES, como exige `stryker.config.json` ("una decisión
 * escondida en un `.tsx` no la muerde nadie") y la regla del repositorio
 * contra el "verde-por-vacuidad-en-puerta-de-verificacion".
 */

/** Un fichero cualquiera del que solo importa su texto: `src/**`, `dist/**` o el HTML servido de una ruta. */
export interface FicheroDeTexto {
  readonly ruta: string
  readonly contenido: string
}

// ---------------------------------------------------------------------------
// @s49 — ni un solo literal de la clínica ficticia del prototipo sobrevive.
// ---------------------------------------------------------------------------

/** Un dato de la clínica ficticia del prototipo, con la categoría que nombra la cláusula de @s49 que lo prohíbe. */
export interface LiteralFicticio {
  readonly categoria: string
  readonly literal: string
}

export interface HallazgoFicticio {
  readonly ruta: string
  readonly categoria: string
  readonly forma: string
}

export interface InformeLiteralesFicticios {
  readonly pasa: boolean
  readonly ficherosInspeccionados: number
  readonly literalesBuscados: number
  readonly formasBuscadas: number
  readonly hallazgos: readonly HallazgoFicticio[]
  /** Solo presente cuando la puerta falla cerrada por vacuidad. */
  readonly motivo?: string
}

// El catálogo de datos ficticios NO vive aquí, sino escrito a mano en los
// tests (`datosDelSitio.test.ts` y `tests/e2e/datos-reales.spec.ts`): es el
// "literal escrito a mano" que pide el Given de @s49, y un catálogo dentro de
// `src/` contaminaría el propio barrido que la puerta hace sobre `src/`.

const SIN_HALLAZGOS = 0
const COLECCION_VACIA = 0
const ESPACIO = ' '
const SIN_SEPARADOR = ''

/**
 * Las formas en las que un mismo dato ficticio puede haber sobrevivido: tal y
 * como lo publica el prototipo y sin espacios, que es como un teléfono
 * termina dentro de un `href="tel:..."`. La segunda se DERIVA de la primera;
 * no se retipea (Invariante 2 de `docs/datos-galapavet.md`).
 */
export function formasDeBusqueda(literal: string): readonly string[] {
  const sinEspacios = literal.split(ESPACIO).join(SIN_SEPARADOR)
  return sinEspacios === literal ? [literal] : [literal, sinEspacios]
}

/**
 * Hueco con el que se sustituye una cita permitida. NO es la cadena vacía a
 * propósito: quitar la cita no debe poder soldar los dos trozos vecinos y
 * fabricar una coincidencia que el fichero nunca escribió.
 */
const HUECO = ' '

/**
 * El texto que la puerta inspecciona de verdad: el del fichero, sin las citas
 * permitidas y en minúsculas. Una cita permitida es una referencia al PROPIO
 * fichero versionado del prototipo (su ruta bajo `docs/`), que es la fuente
 * documentada de una comparación, no un dato de la clínica ficticia usado
 * sobre un negocio real.
 */
function textoInspeccionable(contenido: string, citasPermitidas: readonly string[]): string {
  return citasPermitidas.reduce((texto, cita) => texto.split(cita).join(HUECO), contenido).toLowerCase()
}

/**
 * Los dos motivos de fallo cerrado. Nombran el CONTADOR que vale cero y nunca
 * dicen "no se encontró nada": un barrido que no barrió nada no es un verde
 * (defecto "verde-por-vacuidad-en-puerta-de-verificacion" del repositorio).
 */
const MOTIVO_SIN_FICHEROS = 'no se inspeccionó ningún fichero: 0 ficheros inspeccionados'
const MOTIVO_SIN_LITERALES = 'no se buscó ningún dato de la clínica ficticia: 0 literales buscados'

function informeEnBlanco(literales: readonly LiteralFicticio[]): InformeLiteralesFicticios {
  return {
    pasa: false,
    ficherosInspeccionados: COLECCION_VACIA,
    literalesBuscados: literales.length,
    formasBuscadas: COLECCION_VACIA,
    hallazgos: [],
  }
}

/**
 * Busca cada literal de la clínica ficticia —y su forma sin espacios— en el
 * texto de cada fichero, y devuelve un hallazgo por cada aparición.
 */
export function ejecutarPuertaDeLiteralesFicticios(
  literales: readonly LiteralFicticio[],
  ficheros: readonly FicheroDeTexto[],
  citasPermitidas: readonly string[],
): InformeLiteralesFicticios {
  if (ficheros.length === COLECCION_VACIA) {
    return { ...informeEnBlanco(literales), motivo: MOTIVO_SIN_FICHEROS }
  }
  if (literales.length === COLECCION_VACIA) {
    return { ...informeEnBlanco(literales), ficherosInspeccionados: ficheros.length, motivo: MOTIVO_SIN_LITERALES }
  }

  const hallazgos = ficheros.flatMap((fichero) => {
    const texto = textoInspeccionable(fichero.contenido, citasPermitidas)
    return literales.flatMap((ficticio) =>
      formasDeBusqueda(ficticio.literal)
        // Dos `toLowerCase()` distintos a propósito, uno por lado: compartirlos
        // en un único ayudante haría EQUIVALENTE el mutante `toUpperCase()`
        // (mismo resultado en ambos lados), y `stryker.config.json` exige matarlos.
        .filter((forma) => texto.includes(forma.toLowerCase()))
        .map((forma) => ({ ruta: fichero.ruta, categoria: ficticio.categoria, forma })),
    )
  })

  const formasBuscadas = literales.flatMap((ficticio) => formasDeBusqueda(ficticio.literal)).length

  return {
    pasa: hallazgos.length === SIN_HALLAZGOS,
    ficherosInspeccionados: ficheros.length,
    literalesBuscados: literales.length,
    formasBuscadas,
    hallazgos,
  }
}

// ---------------------------------------------------------------------------
// @s50 — los recuentos publicados son los del catálogo real, no los del
// prototipo ni los de la pista de vista previa del editor de diseño.
// ---------------------------------------------------------------------------

/** Un catálogo del prototipo se abre así: `const SERVICIOS = [`. */
const APERTURA_DE_CATALOGO_FINAL = ' = ['
const CIERRE_DE_CATALOGO = '\n];'
/** Cada entrada del catálogo empieza en su propia línea, con dos espacios de sangría. */
const APERTURA_DE_ENTRADA = '\n  { '
const TROZO_ANTERIOR_A_LA_PRIMERA_ENTRADA = 1

/**
 * Cuántas entradas tiene un catálogo del prototipo, contadas sobre su TEXTO
 * REAL (`docs/diseno-claude-design/*.dc.html`). `null` si ese catálogo no
 * existe en el texto: quien lo pida decide si eso es un fallo.
 */
export function contarEntradasDelCatalogoDelPrototipo(texto: string, nombre: string): number | null {
  const [, trasLaApertura] = texto.split(`const ${nombre}${APERTURA_DE_CATALOGO_FINAL}`)
  if (trasLaApertura === undefined) {
    return null
  }
  const [cuerpo] = trasLaApertura.split(CIERRE_DE_CATALOGO)
  return (cuerpo as string).split(APERTURA_DE_ENTRADA).length - TROZO_ANTERIOR_A_LA_PRIMERA_ENTRADA
}

const APERTURA_DE_LISTADO_FINAL = ' }}"'
const CIERRE_DE_ETIQUETA = '>'
const ATRIBUTO_DE_PISTA = 'hint-placeholder-count="'
const FIN_DE_ATRIBUTO = '"'

/**
 * El recuento con el que el EDITOR DE DISEÑO rellena la vista previa de un
 * listado del prototipo (`<sc-for list="{{ servicios }}" hint-placeholder-count="6">`):
 * "hint" es literalmente la pista, y no tiene nada que ver con cuántos
 * elementos publica el cliente. `null` si el listado no existe o si su
 * etiqueta no declara la pista.
 */
export function leerPistaDeVistaPrevia(texto: string, nombreDelListado: string): number | null {
  const [, trasLaApertura] = texto.split(`<sc-for list="{{ ${nombreDelListado}${APERTURA_DE_LISTADO_FINAL}`)
  if (trasLaApertura === undefined) {
    return null
  }
  const [etiqueta] = trasLaApertura.split(CIERRE_DE_ETIQUETA)
  const [, trasElAtributo] = (etiqueta as string).split(ATRIBUTO_DE_PISTA)
  if (trasElAtributo === undefined) {
    return null
  }
  return Number(trasElAtributo.split(FIN_DE_ATRIBUTO)[0])
}

/** El recuento de un listado de la portada, con las dos procedencias prohibidas al lado. */
export interface RecuentoDeListado {
  readonly listado: string
  /** Lo que el sitio construido y servido muestra de verdad. */
  readonly publicado: number
  /** Lo que traía el catálogo del prototipo. */
  readonly delPrototipo: number
  /** Lo que pinta el editor de diseño en su vista previa cuando aún no hay datos. */
  readonly deLaPistaDeVistaPrevia: number
}

export interface DiscrepanciaDeRecuento {
  readonly listado: string
  readonly procedencia: string
  readonly recuento: number
}

export interface InformeDeRecuentos {
  readonly pasa: boolean
  readonly listadosInspeccionados: number
  readonly discrepancias: readonly DiscrepanciaDeRecuento[]
  readonly motivo?: string
}

const PROCEDENCIA_PROTOTIPO = 'el catálogo del prototipo'
const PROCEDENCIA_PISTA = 'la pista de vista previa del editor de diseño'
const MOTIVO_SIN_LISTADOS = 'no se comparó ningún listado: 0 listados inspeccionados'

function discrepanciasDe(recuento: RecuentoDeListado): readonly DiscrepanciaDeRecuento[] {
  const sospechas = [
    { procedencia: PROCEDENCIA_PROTOTIPO, valor: recuento.delPrototipo },
    { procedencia: PROCEDENCIA_PISTA, valor: recuento.deLaPistaDeVistaPrevia },
  ]
  return sospechas
    .filter((sospecha) => sospecha.valor === recuento.publicado)
    .map((sospecha) => ({ listado: recuento.listado, procedencia: sospecha.procedencia, recuento: recuento.publicado }))
}

/**
 * Comprueba que ningún recuento publicado coincide con el que traía el
 * prototipo ni con el de su pista de vista previa. Falla cerrada si no compara
 * ningún listado.
 */
export function ejecutarPuertaDeRecuentosReales(recuentos: readonly RecuentoDeListado[]): InformeDeRecuentos {
  if (recuentos.length === COLECCION_VACIA) {
    return { pasa: false, listadosInspeccionados: COLECCION_VACIA, discrepancias: [], motivo: MOTIVO_SIN_LISTADOS }
  }

  const discrepancias = recuentos.flatMap(discrepanciasDe)

  return {
    pasa: discrepancias.length === SIN_HALLAZGOS,
    listadosInspeccionados: recuentos.length,
    discrepancias,
  }
}

// ---------------------------------------------------------------------------
// @s51 — ninguna de las cuatro cifras de la bienvenida está escrita a mano en
// el componente.
// ---------------------------------------------------------------------------

const DIGITOS = '0123456789'

/** Los dígitos que aparecen en un texto, en orden. Lista vacía = no hay ni un número escrito. */
export function digitosDe(texto: string): readonly string[] {
  return [...texto].filter((caracter) => DIGITOS.includes(caracter))
}

/**
 * El trozo de texto que hay entre dos marcas, sin incluirlas. `null` si falta
 * cualquiera de las dos: así una marca mal escrita no devuelve nunca un
 * fragmento vacío que pasaría por "aquí no hay nada prohibido".
 */
export function extraerFragmento(texto: string, marcaDeInicio: string, marcaDeFin: string): string | null {
  const [, trasLaMarca] = texto.split(marcaDeInicio)
  if (trasLaMarca === undefined) {
    return null
  }
  const [fragmento, trasElFinal] = trasLaMarca.split(marcaDeFin)
  if (trasElFinal === undefined) {
    return null
  }
  return fragmento as string
}

// ---------------------------------------------------------------------------
// @s52 — el sitio no afirma que preste un servicio que no presta.
// ---------------------------------------------------------------------------

/** Una afirmación de disponibilidad que Galapavet NO puede hacer, con la cláusula de @s52 que la prohíbe. */
export interface AfirmacionProhibida {
  readonly categoria: string
  readonly frase: string
}

/** El texto VISIBLE de una de las seis rutas del sitio construido y servido. */
export interface TextoDeRuta {
  readonly ruta: string
  readonly textoVisible: string
}

export interface HallazgoDeAfirmacion {
  readonly ruta: string
  readonly categoria: string
  readonly frase: string
}

export interface InformeDeAfirmaciones {
  readonly pasa: boolean
  readonly rutasInspeccionadas: number
  readonly afirmacionesBuscadas: number
  readonly hallazgos: readonly HallazgoDeAfirmacion[]
  readonly motivo?: string
}

const MOTIVO_SIN_RUTAS = 'no se recorrió el texto de ninguna ruta: 0 rutas inspeccionadas'
const MOTIVO_SIN_AFIRMACIONES = 'no se buscó ninguna afirmación prohibida: 0 afirmaciones buscadas'

/**
 * Busca cada afirmación prohibida en el texto visible de cada ruta. Falla
 * cerrada si no recorre ninguna ruta o si no busca ninguna afirmación.
 */
export function ejecutarPuertaDeAfirmacionesProhibidas(
  afirmaciones: readonly AfirmacionProhibida[],
  textos: readonly TextoDeRuta[],
): InformeDeAfirmaciones {
  if (textos.length === COLECCION_VACIA) {
    return {
      pasa: false,
      rutasInspeccionadas: COLECCION_VACIA,
      afirmacionesBuscadas: afirmaciones.length,
      hallazgos: [],
      motivo: MOTIVO_SIN_RUTAS,
    }
  }
  if (afirmaciones.length === COLECCION_VACIA) {
    return {
      pasa: false,
      rutasInspeccionadas: textos.length,
      afirmacionesBuscadas: COLECCION_VACIA,
      hallazgos: [],
      motivo: MOTIVO_SIN_AFIRMACIONES,
    }
  }

  const hallazgos = textos.flatMap((texto) =>
    afirmaciones
      // Dos `toLowerCase()` separados, uno por lado, por el mismo motivo que en
      // `ejecutarPuertaDeLiteralesFicticios`: compartirlos volvería equivalente
      // al mutante `toUpperCase()`.
      .filter((afirmacion) => texto.textoVisible.toLowerCase().includes(afirmacion.frase.toLowerCase()))
      .map((afirmacion) => ({ ruta: texto.ruta, categoria: afirmacion.categoria, frase: afirmacion.frase })),
  )

  return {
    pasa: hallazgos.length === SIN_HALLAZGOS,
    rutasInspeccionadas: textos.length,
    afirmacionesBuscadas: afirmaciones.length,
    hallazgos,
  }
}

/** La palabra en plural con la que se enuncia un COMPROMISO de urgencias («Urgencias fuera de horario»). */
const PALABRA_DE_COMPROMISO = 'urgencias'
const SEPARADOR_DEL_CUALIFICADOR = ' '
const UN_UNICO_COMPROMISO = 1
const PRIMER_COMPROMISO = 0
const MOTIVO_SIN_CUALIFICADORES = 'no se buscó ningún cualificador de urgencias: 0 cualificadores buscados'

/**
 * El cualificador del compromiso que declara la fuente única: de
 * «Urgencias fuera de horario» (`src/lib/site.ts` → `ROTULO_URGENCIAS`) sale
 * «fuera de horario». Se DERIVA del rótulo real; no se retipea.
 */
export function cualificadorDeclaradoDe(rotulo: string): string | null {
  const [, cualificador] = rotulo.toLowerCase().split(`${PALABRA_DE_COMPROMISO}${SEPARADOR_DEL_CUALIFICADOR}`)
  return cualificador ?? null
}

/**
 * Los cualificadores de disponibilidad que siguen a la palabra "urgencias" en
 * un texto visible. Solo cuenta lo que va DESPUÉS de la palabra: un
 * "fuera de horario" suelto en otra frase no es un compromiso de urgencias.
 */
export function compromisosDeUrgenciasEn(texto: string, cualificadores: readonly string[]): readonly string[] {
  const [, ...ventanas] = texto.toLowerCase().split(PALABRA_DE_COMPROMISO)
  return [
    ...new Set(
      ventanas.flatMap((ventana) =>
        cualificadores.filter((cualificador) =>
          ventana.startsWith(`${SEPARADOR_DEL_CUALIFICADOR}${cualificador.toLowerCase()}`),
        ),
      ),
    ),
  ]
}

export interface InformeDeCompromisoDeUrgencias {
  readonly pasa: boolean
  readonly rutasInspeccionadas: number
  readonly cualificadoresBuscados: number
  readonly compromisosEncontrados: readonly string[]
  readonly motivo?: string
}

/**
 * El ÚNICO compromiso de urgencias que puede aparecer en las seis rutas es el
 * que declara la fuente única. Falla cerrada sin rutas, sin cualificadores, y
 * también cuando no aparece ningún compromiso: un sitio en el que la palabra
 * nunca aparece no ha demostrado nada.
 */
export function ejecutarPuertaDeCompromisoDeUrgencias(
  cualificadores: readonly string[],
  cualificadorDeclarado: string,
  textos: readonly TextoDeRuta[],
): InformeDeCompromisoDeUrgencias {
  if (textos.length === COLECCION_VACIA) {
    return {
      pasa: false,
      rutasInspeccionadas: COLECCION_VACIA,
      cualificadoresBuscados: cualificadores.length,
      compromisosEncontrados: [],
      motivo: MOTIVO_SIN_RUTAS,
    }
  }
  if (cualificadores.length === COLECCION_VACIA) {
    return {
      pasa: false,
      rutasInspeccionadas: textos.length,
      cualificadoresBuscados: COLECCION_VACIA,
      compromisosEncontrados: [],
      motivo: MOTIVO_SIN_CUALIFICADORES,
    }
  }

  const compromisosEncontrados = [
    ...new Set(textos.flatMap((texto) => compromisosDeUrgenciasEn(texto.textoVisible, cualificadores))),
  ]

  return {
    pasa:
      compromisosEncontrados.length === UN_UNICO_COMPROMISO &&
      compromisosEncontrados[PRIMER_COMPROMISO] === cualificadorDeclarado,
    rutasInspeccionadas: textos.length,
    cualificadoresBuscados: cualificadores.length,
    compromisosEncontrados,
  }
}
