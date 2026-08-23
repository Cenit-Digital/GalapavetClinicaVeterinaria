/**
 * Puntos de corte declarados en un fichero de estilos: cada `min-width` o
 * `max-width` de una consulta `@media` con anchura en píxeles, leídos del
 * texto REAL del fichero (@s25/@s26 de `sistema_de_diseno_visual.feature`).
 */
const PATRON_PUNTO_DE_CORTE = /@media[^{]*\((?:min|max)-width:\s*(\d+)px\)/g

export function extraerPuntosDeCorteDeclarados(textoScss: string): readonly number[] {
  return [...textoScss.matchAll(PATRON_PUNTO_DE_CORTE)].map((coincidencia) => Number(coincidencia[1] as string))
}
