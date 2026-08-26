export interface CifraBienvenida {
  readonly valor: number
  readonly etiqueta: string
}

export function construirCifrasBienvenida(
  servicios: readonly unknown[],
  profesionales: readonly unknown[],
  fotos: readonly unknown[],
  franjasHorarias: readonly unknown[],
): readonly CifraBienvenida[] {
  return [
    { valor: servicios.length, etiqueta: 'Servicios' },
    { valor: profesionales.length, etiqueta: 'Profesionales' },
    { valor: fotos.length, etiqueta: 'Fotos de galería' },
    { valor: franjasHorarias.length, etiqueta: 'Franjas horarias' },
  ]
}
