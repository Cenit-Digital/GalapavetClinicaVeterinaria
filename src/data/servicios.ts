/**
 * Catálogo estático de los cinco bloques de servicio que Galapavet publica
 * realmente, con su desglose literal. Fuente: `docs/datos-galapavet.md` §5
 * (verificado el 17/08/2026 contra galapavet.com) y
 * `features/servicios.feature` @s1/@s4-@s8. El orden es el que publica el
 * cliente; queda PENDIENTE confirmar con él ese orden (ver cabecera del
 * `.feature`). "Odontología" y "Endoscopia" aparecen en dos bloques cada una
 * porque así los publica el cliente: no se deduplican (Aviso de
 * `features/servicios.feature`).
 */
export interface BloqueServicio {
  readonly titulo: string
  readonly puntos: readonly string[]
}

export const SERVICIOS: readonly BloqueServicio[] = [
  {
    titulo: 'Cirugía y anestesia',
    puntos: [
      'Cirugía de tejidos blandos',
      'Esterilizaciones',
      'Cirugía oncológica',
      'Cirugía digestiva',
      'Odontología',
      'Anestesia inhalatoria',
      'Monitorización',
    ],
  },
  {
    titulo: 'Diagnóstico de imagen',
    puntos: ['Servicios de radiología y ecografía propios', 'Ecografía', 'Eco-cardiografía', 'Endoscopia'],
  },
  {
    titulo: 'Medicina general',
    puntos: ['Preventiva', 'Vacunaciones', 'Desparasitaciones', 'Chequeo', 'Identificación con microchip'],
  },
  {
    titulo: 'Análisis',
    puntos: [
      'Laboratorio de análisis clínicos propio',
      'Perfiles generales',
      'Enfermedades infecciosas y parasitarias (leishmania, leucemia felina…)',
      'Cultivos',
      'Biopsia y citología',
      'Hormonales',
    ],
  },
  {
    titulo: 'Especialidades',
    puntos: ['Odontología', 'Oftalmología', 'Traumatología', 'Endoscopia'],
  },
] as const satisfies readonly BloqueServicio[]
