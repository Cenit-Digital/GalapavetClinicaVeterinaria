import { construirDatosEstructurados } from './seo-logica'
import { datosNegocio } from './site'

/**
 * Bloque de datos estructurados calculado UNA vez a partir de la fuente única
 * real (`datosNegocio`), compartido por las páginas que no necesitan
 * sustituir ningún dato para su propio test (@s12: los seis bloques declaran
 * el mismo negocio). `Landing` es la única página que construye el suyo
 * aparte, porque @s11 exige poder sustituir la calle para la prueba de
 * coherencia entre lo visible y el bloque.
 */
export const DATOS_ESTRUCTURADOS_NEGOCIO: Record<string, unknown> = construirDatosEstructurados({
  nombreComercial: datosNegocio.identidad.nombreComercial,
  direccion: datosNegocio.direccion,
  telefonoClinica: datosNegocio.telefonoClinica.textoVisible,
  horario: datosNegocio.horario,
  email: datosNegocio.email,
  redesSociales: datosNegocio.redesSociales,
})
