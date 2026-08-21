/**
 * Catálogo estático de los destinos internos de las columnas "Clínica" y
 * "Contenido" del pie de página. Fuente: `features/pie_de_pagina.feature`
 * @s3/@s4 — son literales fijos del propio contrato (no dependen de
 * `datosNegocio`), igual que `src/data/navegacion.ts` resuelve un problema
 * equivalente para la cabecera, pero con un conjunto de anclas distinto: la
 * cabecera enlaza 8 destinos en una sola lista, el pie reparte 4+4 en dos
 * columnas propias.
 */
export interface EnlacePieDePagina {
  readonly nombre: string
  readonly destino: string
}

/** Las cuatro secciones de la landing (@s3). */
export const ENLACES_CLINICA: readonly EnlacePieDePagina[] = [
  { nombre: 'Servicios', destino: '#servicios' },
  { nombre: 'Equipo', destino: '#equipo' },
  { nombre: 'Reservar cita', destino: '#reservar' },
  { nombre: 'Galería', destino: '#galeria' },
] as const satisfies readonly EnlacePieDePagina[]

/** Las tres subpáginas y las preguntas frecuentes (@s4). */
export const ENLACES_CONTENIDO: readonly EnlacePieDePagina[] = [
  { nombre: 'Blog', destino: '/blog' },
  { nombre: 'Campañas', destino: '/campanas' },
  { nombre: 'Tienda', destino: '/tienda' },
  { nombre: 'Preguntas frecuentes', destino: '#faq' },
] as const satisfies readonly EnlacePieDePagina[]
