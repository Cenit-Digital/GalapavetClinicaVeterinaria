# Datos verificados del cliente — Galapavet

> **Regla de este fichero:** aquí solo entra lo que se ha **verificado contra una
> fuente primaria**, con la fuente citada. Nada inventado, nada "razonable".
> Es el insumo del que se deriva `src/lib/site.ts` (fuente única canónica) y
> contra el que el `judge` contrasta cualquier dato que aparezca en la UI.
>
> **Fecha de verificación:** 17/08/2026.
> **Método:** lectura directa de `https://galapavet.com/` en navegador real
> (texto de página + árbol de accesibilidad + ficha de Google embebida) y
> muestreo de píxeles sobre `logo galapavet.webp`.

## 1. Identidad

| Dato | Valor verificado | Fuente |
| --- | --- | --- |
| Nombre comercial | **Galapavet** | `<title>` y rótulo de cabecera de galapavet.com |
| Descriptor | **Centro integral veterinario** | rótulo bajo el nombre en galapavet.com |
| Localidad | **Galapagar** (Madrid) | «Tú clínica veterinaria en Galapagar.» en galapavet.com |

## 2. NAP (nombre · dirección · teléfono)

| Dato | Valor verificado | Fuente |
| --- | --- | --- |
| Dirección | **Carretera de Torrelodones, 11** | ficha de Google Maps **embebida en la propia galapavet.com** (sección «Donde estamos»), corroborada de forma independiente por la ficha de Páginas Amarillas |
| CP · localidad | **28260 Galapagar, Madrid** | misma ficha embebida |
| Teléfono 1 | **91 082 92 67** | enlace `tel:` de la cabecera de galapavet.com |
| Teléfono 2 | **685 34 31 49** | enlace `tel:` de la cabecera de galapavet.com |
| Urgencias fuera de horario | **91 851 13 93** | enlace `tel:` del pie de galapavet.com, rotulado literalmente «Urgencias fuera de horario. Tlf: 91 851 13 93» |

## 2bis. Datos confirmados por el cliente interno (03/09/2026)

| Dato | Valor | Fuente |
| --- | --- | --- |
| WhatsApp | El móvil **685 34 31 49** atiende WhatsApp | Confirmado por Pablo Hurtado (Cenit Digital, responsable de la cuenta) en la conversación de spec del 03/09/2026 (Decisión 66 de `project-spec.md`). Deroga la reserva de la Decisión 14 y de `datos_negocio.feature` sobre el canal de mensajería. |
| Coordenadas | **40.5772872, −4.0004445** | Nodo público de OpenStreetMap `amenity=veterinary` «Galapavet», osm id 5644506906, en «11, Carretera de Torrelodones, Galapagar» (consultado vía Nominatim el 03/09/2026; datos © OpenStreetMap contributors, ODbL). Coincide con la dirección verificada de §2. Se usan para el pin del mapa estático local (`public/img/mapa/`, Decisión 63) y pueden usarse en el JSON-LD. |

## 3. Horario

Transcrito literalmente de galapavet.com (coincide con el `.docx` de prospección):

- De **lunes a viernes** de **11:00 a 14:00** y de **16:30 a 20:00**
- **Sábados** de **11:00 a 14:00**
- **Domingos cerrados**

> **Consecuencia de diseño (decidida con el cliente el 17/08/2026):** Galapavet
> **no presta un servicio de urgencias 24 h**. Presta *urgencias fuera de
> horario* con un teléfono distinto. Todo el copy heredado del prototipo
> «Veterinaria La Sierra» que anunciaba «Urgencias 24 h · todos los días del
> año» es **falso para este cliente** y no se implementa. Ver §7.

## 4. Equipo

Los **dos únicos** profesionales publicados por el cliente:

| Nombre | Rol | Formación publicada |
| --- | --- | --- |
| **Marcos Pérez** | Veterinario | «Licenciado en veterinaria por la Universidad Complutense de Madrid» |
| **Joaquín Herranz** | Auxiliar | *(no publicada)* |

> El prototipo traía **6** profesionales inventados, con biografías, números de
> colegiado (`nº 28-7412`…) e idiomas fabricados. **Ninguno se implementa.**

## 5. Servicios (5 bloques, literal)

1. **Cirugía y anestesia** — Cirugía de tejidos blandos · Esterilizaciones ·
   Cirugía oncológica · Cirugía digestiva · Odontología · Anestesia inhalatoria ·
   Monitorización.
2. **Diagnóstico de imagen** — Servicios de radiología y ecografía propios ·
   Ecografía · Eco-cardiografía · Endoscopia.
3. **Medicina general** — Preventiva · Vacunaciones · Desparasitaciones ·
   Chequeo · Identificación con microchip.
4. **Análisis** — Laboratorio de análisis clínicos propio · Perfiles generales ·
   Enfermedades infecciosas y parasitarias (leishmania, leucemia felina…) ·
   Cultivos · Biopsia y citología · Hormonales.
5. **Especialidades** — Odontología · Oftalmología · Traumatología · Endoscopia.

> El prototipo traía **12** servicios inventados (peluquería canina, nutrición y
> etología, animales exóticos, urgencias 24 h, microchip y viajes…). Solo se
> conservan los que el cliente publica. «Identificación con microchip» sí es
> real: está dentro de *Medicina general*.

## 6. Tienda

Categorías publicadas por el cliente: **Piensos · Paseo · Descanso · Juegos**.

> El cliente **no publica ni un solo producto ni un solo precio** — el `.docx` de
> prospección lo señala como el punto más flojo de la web actual («no te muestran
> nada de lo que tienen a la venta»). Cualquier producto o precio concreto sería
> inventado: la tienda se construye sobre estas 4 categorías reales y los
> productos quedan como **dato pendiente del cliente**.

## 7. Datos del prototipo que NO existen y NO se implementan

Verificado uno a uno contra galapavet.com. Todos son invención del prototipo
«Veterinaria La Sierra» y su uso sobre un negocio real sería una afirmación
falsa:

| Dato del prototipo | Estado |
| --- | --- |
| «Urgencias 24 h · todos los días del año» | **FALSO** — domingos cerrado; solo urgencias fuera de horario |
| Teléfonos `918 44 21 60` y `640 22 11 90` | **FALSOS** — no son de Galapavet |
| `hola@veterinarialasierra.es` | **FALSO** |
| «Centro veterinario registrado nº 28/0791» | **NO VERIFICABLE** — no publicado |
| «+12 años cuidando la sierra» | **NO VERIFICABLE** — no publicado |
| «8.400 mascotas en ficha» | **NO VERIFICABLE** — no publicado |
| «4,9 ★ · 327 reseñas en Google» | **FALSO** — ver §8 el dato real |
| 6 profesionales con nº de colegiado e idiomas | **FALSOS** — ver §4 |
| Miraflores de la Sierra · Ctra. de la Sierra, 42 · CP 28792 | **FALSO** — ver §2 |
| Campañas con precios (`49 €`, `−25 %`, `75 €`) | **NO VERIFICABLE** — no publicadas |
| «desde 2013» | **NO VERIFICABLE** — el pie del cliente dice «Galapavet. 2020» |

## 8. Reputación (dato real, con fecha)

La ficha de Google embebida en la propia web del cliente mostraba, el
**17/08/2026**: **4,6 ★ · 189 reseñas**.

> Es un dato **vivo**: cambia con el tiempo. Si se muestra en la web debe ir
> fechado o leerse de una fuente en tiempo real; **no** se hornea como si fuera
> permanente. Alternativa preferida: no mostrar cifra y enlazar a la ficha.

## 9. Datos que el cliente NO publica (pendientes de reunión)

Verificado por ausencia — no están en su web ni en su árbol de enlaces:

- **Email de contacto.** No hay ni un solo `mailto:` en galapavet.com. El valor
  `info@galapavet.com` que devolvió una primera extracción automática **no está
  en la página**: se descarta por no verificado.
- **Redes sociales.** La web tiene una sección «Síguenos en las redes» pero
  **sin ningún enlace**. Los perfiles que devolvió una primera extracción
  automática no aparecen enlazados: se descartan por no verificados.
- ~~Coordenadas geográficas exactas~~ — resueltas el 03/09/2026 con el nodo público de OpenStreetMap (§2bis).
- **Precios y productos** de la tienda.
- **Años de actividad** y número de registro del centro.
- **Especialidades por profesional.** El prototipo asignaba tres etiquetas a
  cada miembro; galapavet.com no publica ninguna. El campo opcional
  `especialidades` de `src/data/equipo.ts` queda sin valor hasta que el
  cliente las confirme (`fidelidad_equipo` @s3).

## 10. Marca visual

Colores extraídos por **muestreo de píxeles** sobre `logo galapavet.webp`
(201×201 px, píxeles opacos, recuento por frecuencia):

| Color | Hex | Papel en el logo |
| --- | --- | --- |
| Morado | **#77286B** | cruz veterinaria inferior |
| Verde lima | **#B4C718** | silueta animal y cruz superior |
| Verde profundo | **#48704B** | zona de superposición lima sobre morado |
| Blanco | `#FFFFFF` | fondo del disco |

Coinciden con lo que el `.docx` de prospección declara: «Sus colores principales
son el morado y el verde», y con el render real de galapavet.com.

### 10.1 Contraste medido (WCAG 2.2)

Calculado con la fórmula oficial de luminancia relativa
(<https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum>), no estimado.
Umbrales: **4,5:1** texto normal · **3:1** texto grande y componentes de
interfaz · **7:1** AAA.

| Pareja | Ratio | Texto normal | Texto grande / UI |
| --- | ---: | --- | --- |
| Morado `#77286B` sobre blanco | **9,13:1** | ✅ (también AAA) | ✅ |
| Blanco sobre morado `#77286B` | **9,13:1** | ✅ (también AAA) | ✅ |
| Negro sobre lima `#B4C718` | **11,12:1** | ✅ (también AAA) | ✅ |
| Verde `#48704B` sobre blanco | **5,68:1** | ✅ | ✅ |
| Blanco sobre verde `#48704B` | **5,68:1** | ✅ | ✅ |
| Lima `#B4C718` sobre morado `#77286B` | **4,84:1** | ✅ | ✅ |
| Verde `#48704B` sobre lima `#B4C718` | **3,01:1** | ❌ | ⚠️ pasa por 0,01 |
| **Lima `#B4C718` sobre blanco** | **1,89:1** | ❌ | ❌ |
| **Blanco sobre lima `#B4C718`** | **1,89:1** | ❌ | ❌ |

**La consecuencia de diseño más importante del proyecto:** el lima de la marca
**no sirve para texto ni para bordes sobre blanco**. No falla por poco: 1,89:1
frente al 3:1 mínimo. Su uso correcto es el que le da el propio logotipo — **color
de relleno y de superficie**, con texto oscuro encima (negro sobre lima da
11,12:1). Cualquier uso del lima como color de texto o de borde sobre fondo claro
es un defecto de accesibilidad, no una preferencia estética.

Si en algún momento hiciera falta el lima **como texto sobre blanco**, la
variante oscurecida más cercana que sí cumple AA es **`#6C770E` (4,90:1)**
—el lima al 60 % de luminosidad—. Se deja documentada, no aplicada: no se usa
hasta que un escenario la pida.

El par `verde sobre lima` pasa el 3:1 por una centésima. **No se usa**: un margen
de 0,01 se pierde con cualquier ajuste posterior del tono.

## 11. Enlaces legales reales del cliente

Existen y son públicos — sustituyen al marcador `#faq` del prototipo:

- `https://galapavet.com/aviso-legal`
- `https://galapavet.com/politica-de-cookies`
- `https://galapavet.com/personalizar-cookies`

## 12. Nota sobre el proveedor actual

La web vigente la firma `oglobalservices.es` y su pie declara «Galapavet. 2020».
Es contexto de prospección, no un dato a publicar.
