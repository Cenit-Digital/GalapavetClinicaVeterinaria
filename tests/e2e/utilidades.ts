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
  const coincidenciaRgb = colorComputado.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/)
  if (coincidenciaRgb) {
    const [, r, g, b] = coincidenciaRgb
    return aHexadecimal(r as string, g as string, b as string)
  }

  // Chrome serializa `color-mix()` como CSS Color 4. Sus canales sRGB son
  // valores normalizados (0..1), a diferencia de los de `rgb()`.
  const coincidenciaSrgb = colorComputado.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
  if (coincidenciaSrgb) {
    const [, r, g, b] = coincidenciaSrgb
    return aHexadecimal(Number(r) * 255, Number(g) * 255, Number(b) * 255)
  }

  throw new Error(`"${colorComputado}" no es un color CSS reconocible`)
}

function aHexadecimal(r: string | number, g: string | number, b: string | number): string {
  const dosDigitos = (canal: string | number): string =>
    Math.round(Number(canal)).toString(BASE_HEXADECIMAL).padStart(2, '0')
  return `#${dosDigitos(r)}${dosDigitos(g)}${dosDigitos(b)}`.toUpperCase()
}

/** Si un color computado es transparente ("rgba(0, 0, 0, 0)" o "transparent"). */
export function esTransparente(colorComputado: string): boolean {
  if (colorComputado === 'transparent') {
    return true
  }
  const coincidencia = colorComputado.match(/rgba\([\d.]+,\s*[\d.]+,\s*[\d.]+,\s*([\d.]+)\)/)
  if (coincidencia !== null) {
    return Number(coincidencia[1]) === 0
  }
  const coincidenciaSrgb = colorComputado.match(/color\(srgb\s+[\d.]+\s+[\d.]+\s+[\d.]+\s*\/\s*([\d.]+)\)/)
  return coincidenciaSrgb !== null && Number(coincidenciaSrgb[1]) === 0
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
