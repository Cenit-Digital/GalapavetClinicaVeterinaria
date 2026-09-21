# Preflight de la cabecera — los cuatro cambios JUNTOS, antes del TDD

> 20/09/2026. Simulación de D1 + D2 + D3 + D4 + G1 aplicados a la vez sobre
> `dist/` servido, medida en Chromium en **siete anchos**. El objetivo es
> descubrir ahora cualquier interacción entre los cambios, en vez de tras cuatro
> oleadas de TDD. **51 comprobaciones, 0 fallos.**

## Qué se simula, y cómo

- **D1** por JS: se elimina el CTA de urgencias de la cabecera.
- **D2** sale solo: al quedar dos hijos visibles, `justify-content: space-between`
  pega el `<nav>` al borde derecho de la columna.
- **D3**, **D4** y **G1** por CSS inyectado:

```css
/* G1 — el interior deja sitio al borde: la cabecera pasa a medir 64 exactos */
[data-cabecera-interior]{ min-height: calc(var(--altura-cabecera) - 1px); }
/* D3 — un paso de la escala entre el nombre y el descriptor */
[data-cabecera-interior] a[href="#inicio"] > span{ gap: 4px; }
/* D4 — patrón INVERTIDO: el enlace conserva 44px, la píldora se dibuja DENTRO */
[data-cabecera-interior] nav a[data-enlace-tienda]{
  position: relative; min-height: 44px; min-width: 44px;
  padding-inline: 15px; border: 0; background: transparent;
  font-weight: 600; color: var(--color-tinta); isolation: isolate;
}
[data-cabecera-interior] nav a[data-enlace-tienda]::before{
  content:''; position:absolute; z-index:-1; inset-inline:0;
  inset-block-start:50%; transform:translateY(-50%); height:35px;
  border:1.5px solid color-mix(in srgb, var(--color-borde-control) 88%, var(--color-fondo));
  border-radius:999px;
}
```

El artesano NO debe copiar estos literales: `1px` es `$ancho-borde-fino`, `4px`
es `espaciado(4)`, `15px` y `35px` deben derivarse de la escala como exige @s6, y
`44px` es `$area-tactil-minima + espaciado(20)` o el token que corresponda. Aquí
van en crudo porque es una inyección de prueba, no el código final.

## Resultados

| Comprobación | 320 | 700 | 1023 | 1024 | 1220 | 1440 | 1600 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `header` alto == `#root padding-block-start` | 64 | 64 | 64 | 64 | 64 | 64 | 64 |
| Solape con el primer contenido | **0** | **0** | **0** | **0** | **0** | **0** | **0** |
| Hueco nombre ↔ descriptor | 4 | 4 | 4 | 4 | 4 | 4 | 4 |
| La marca (40px) cabe en la cabecera | sí | sí | sí | sí | sí | sí | sí |
| Borde derecho del nav == del contenido | — | — | — | 1000 | 1196 | 1330 | 1410 |
| Borde izquierdo de la marca == del contenido | — | — | — | 24 | 24 | 110 | 190 |
| Caja del enlace "Tienda" | — | — | — | 71,8 × 44 | idem | idem | idem |
| Píldora visible de "Tienda" | — | — | — | 35px | 35px | 35px | 35px |
| Control más pequeño del nav | — | — | — | 44 | 44 | 44 | 44 |
| Desbordamiento horizontal | no | no | no | no | no | no | no |
| Errores/avisos de consola | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Lo que este preflight demuestra

1. **G1 funciona y arregla el solape en los siete anchos**, no solo en 1440.
2. **D3 no hace crecer la cabecera**: sigue en 64 con el hueco de 4px dentro.
3. **D2 alinea de verdad**: el nav acaba exactamente donde acaba el contenido de
   las secciones, y la marca empieza exactamente donde empieza, en los cuatro
   anchos de escritorio. La simetría no es una coincidencia de un ancho.
4. **El patrón invertido de D4 resuelve la contradicción**: la caja del propio
   enlace mide 71,8 × 44 —así que `fidelidad-cabecera.spec.ts:70-76` sigue
   pasando SIN tocarlo— mientras la píldora que se ve mide 35px.
5. Ningún cambio introduce desbordamiento ni ruido en consola en ningún ancho.
