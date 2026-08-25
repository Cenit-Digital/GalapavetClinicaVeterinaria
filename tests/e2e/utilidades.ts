// Ayudantes compartidos por los specs de navegador real. Viven fuera de
// `src/lib/` a propósito: StrykerJS solo muerde `src/lib/**` y `src/**/*-logica.ts`
// (`stryker.config.json`), y este código es infraestructura de test, no
// lógica de producción — el mismo criterio que ya separa `tools/puerta-terceros.ts`
// del resto de `src/`.

const BASE_HEXADECIMAL = 16

/**
 * Convierte un color computado por el navegador ("rgb(r, g, b)" o
 * "rgba(r, g, b, a)") al hexadecimal de 6 dígitos que exige
 * `calcularRatioContraste` de `src/lib/contraste.ts` (@s38/@s39, que
 * reutilizan esa fórmula real tal cual).
 */
export function colorComputadoAHex(colorComputado: string): string {
  const coincidencia = colorComputado.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/)
  if (!coincidencia) {
    throw new Error(`"${colorComputado}" no es un color "rgb()"/"rgba()" reconocible`)
  }
  const [, r, g, b] = coincidencia
  const doDigitos = (canal: string): string =>
    Math.round(Number(canal)).toString(BASE_HEXADECIMAL).padStart(2, '0')
  return `#${doDigitos(r as string)}${doDigitos(g as string)}${doDigitos(b as string)}`.toUpperCase()
}

/** Si un color computado es transparente ("rgba(0, 0, 0, 0)" o "transparent"). */
export function esTransparente(colorComputado: string): boolean {
  if (colorComputado === 'transparent') {
    return true
  }
  const coincidencia = colorComputado.match(/rgba\([\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)/)
  return coincidencia !== null && Number(coincidencia[1]) === 0
}

export interface RectanguloBase {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** Si `interior` queda completamente contenido dentro de `contenedor` (para "íntegramente bajo la cabecera"). */
export function completamenteDentroDe(interior: RectanguloBase, contenedor: RectanguloBase): boolean {
  return (
    interior.y >= contenedor.y &&
    interior.y + interior.height <= contenedor.y + contenedor.height &&
    interior.x >= contenedor.x &&
    interior.x + interior.width <= contenedor.x + contenedor.width
  )
}

/** Si dos rectángulos se solapan en absoluto (para "al menos parte queda fuera/dentro"). */
export function seSolapan(a: RectanguloBase, b: RectanguloBase): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}
