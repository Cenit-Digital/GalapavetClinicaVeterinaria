import { esAncla } from '../components/Cabecera-logica'

/** Quita la barra final de "base" para que concatenarla con "destino" (que ya empieza por "/") nunca produzca "//" (@s5). */
function sinBarraFinal(base: string): string {
  return base.endsWith('/') ? base.slice(0, -1) : base
}

/**
 * Resuelve el "href" real de un destino interno bajo la base de despliegue
 * vigente (Decisión 47/48). Un destino ancla (`esAncla`, reutilizada de
 * `Cabecera-logica.ts`, ya "done") nunca pasa por el prefijo: navega dentro
 * del propio documento, no cambia de página. `base` por defecto lee
 * `import.meta.env.BASE_URL` una única vez, aquí — nunca dentro de cada
 * componente que la consume (descartado explícitamente por la Decisión 48).
 *
 * Uso dual (enmienda 26/08/2026, Decisión 53): la misma función, sin ninguna
 * variación de firma ni de comportamiento, resuelve tanto el "href" de un
 * `<a>` (Decisión 48, `Cabecera`/`PieDePagina`/`CampanasPortada`/
 * `PaginaNoEncontrada`) como el "src" de un `<img>` servida desde
 * `public/img/` (`PieDePagina`/`Galeria`/`CampanasPortada`/`PaginaCampanas`/
 * `PaginaBlog`/`PaginaTienda`) y la URL de `og:image`
 * (`MetadatosPagina.tsx`): en los tres casos es "un destino interno que
 * empieza por `/` y no es un ancla", sin ninguna función hermana.
 */
export function hrefDeDestino(destino: string, base: string = import.meta.env.BASE_URL): string {
  if (esAncla(destino)) {
    return destino
  }
  return `${sinBarraFinal(base)}${destino}`
}
