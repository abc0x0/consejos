# Consejos para hija — versión 0.2

Aplicación web progresiva (PWA) para tabletas y teléfonos, desarrollada en **HTML, CSS y JavaScript puro**, sin bibliotecas ni servicios externos obligatorios.

## Novedades de la v0.2

1. **Personalización.** Menú ≡ → Configuración → Nombre (o nombre preferido) y apellidos opcionales → Guardar cambios. El encabezado pasa a decir «Consejos para Sofía» si se escribe «Sofía». El apellido no se muestra en el título. El botón «Borrar datos» restablece el encabezado «Consejos para hija».
2. **Navegación por paneles.** Se muestran, uno a la vez, los cuatro paneles: Consejo bíblico, Consejo de EGW, Reflexión y Puntos de alerta. Los paneles tienen navegación táctil y de teclado (flechas, Inicio, Fin).
3. **Iconos diferenciados.** Libro verde azulado (Biblia), pluma morada (EGW), diálogo ámbar (Reflexión) y triángulo coral (Alertas).
4. **Corrección de etiquetas en la gráfica.** El recuadro de la etapa seleccionada calcula automáticamente su ancho según el texto. Se conserva el nivel 1–5 y las ocho etapas.
5. **Persistencia.** Nombre, apellido, etapa y panel elegido se guardan únicamente en el almacenamiento local del navegador o PWA. No hay transmisión de datos personales a un servidor, registro ni sincronización entre dispositivos.

## Archivos de la aplicación

- `index.html`: estructura de la interfaz, menú y cuadro de configuración.
- `styles.css`: diseño adaptable y floral.
- `app.js`: lógica de gráfica SVG, configuración, navegación, preguntas y PWA.
- `data.js`: banco de contenido religioso, preguntas y alertas para las ocho etapas.
- `manifest.webmanifest`: datos de la aplicación instalable.
- `sw.js`: caché sin conexión (identificador de caché **consejos-v0.2.0**).
- `assets/`: textura floral e íconos de instalación.

## Instalación en tableta (PWA)

El navegador requiere servir la aplicación desde **HTTPS** (o desde `localhost` para pruebas en PC). **Abrir `index.html` directamente sirve para consultarla, pero no para instalar la PWA con caché.**

### Netlify Drop

1. Descomprime `consejos-para-hija-v0.2.zip` en tu computadora.
2. Accede a https://app.netlify.com/drop y publica **el contenido de la carpeta** `consejos-para-hija-v0.2` (o la carpeta misma en la zona de publicación, según lo permita la interfaz).
3. Abre la URL HTTPS que Netlify te proporcione en la tableta.
4. **Android (Chrome):** menú ⋮ → «Instalar aplicación» o «Agregar a pantalla de inicio».
5. **iPad (Safari):** Compartir → «Agregar a pantalla de inicio».
6. Abre la aplicación instalada mientras tengas Internet, para que sus archivos se almacenen en caché. La guía principal quedará disponible sin conexión; los enlaces externos requieren Internet.

### GitHub Pages

1. Sube `index.html`, `styles.css`, `app.js`, `data.js`, `manifest.webmanifest`, `sw.js` y `assets/` al repositorio.
2. Activa Settings → Pages, elige la rama y la carpeta raíz.
3. Abre la URL HTTPS de Pages en la tableta e instala como se indica arriba.

### Actualización desde la v0.1

Para actualizar una aplicación **ya instalada**, despliega los archivos de la v0.2 **en la misma dirección HTTPS y la misma ruta de la v0.1**. El service worker emplea una nueva versión de caché y renueva los archivos al cargar la aplicación con conexión. Si publicas la v0.2 en una URL completamente distinta, el navegador la considera una aplicación separada; no transferirá el nombre ni las preferencias guardadas en la otra URL.

**Nota:** el nombre dinámico se cambia en el encabezado y el título de la pestaña. El nombre visible bajo el icono instalado permanece genérico, «Consejos», pues el manifiesto PWA es compartido y estático.

## Cómo usarla

- Abre **≡ → Configuración** y escribe el nombre preferido. Puedes dejarlo en blanco para conservar el título genérico.
- Selecciona una etapa tocando su punto en la gráfica, el deslizador o las opciones debajo.
- Toca alguno de los cuatro **paneles con iconos de color** para consultar el contenido correspondiente a esa etapa.
- En **Reflexión**, «Mostrar otras preguntas» cambia las cuatro preguntas visibles. Existen 70 en total, distribuidas entre las ocho etapas.
- El panel **Puntos de alerta** muestra las 26 señales distribuidas por etapa.
- Cuando uses otro navegador o dispositivo, deberás volver a ingresar el nombre: no se sincroniza por Internet.

## Consideraciones editoriales y de privacidad

- Los niveles de la gráfica constituyen una interpretación didáctica, no normas numéricas atribuidas a la Biblia ni a Elena G. de White.
- Las ideas de Elena G. de White están expresadas en **paráfrasis**, no se presentan como citas textuales. Cada etapa ofrece capítulo, localizador y URL de consulta. La NVI se cita o resume con referencia y enlace.
- Una señal de alerta no basta para juzgar la fe de una persona. Ante abuso o control, es aconsejable buscar apoyo seguro.
- Los datos personales se conservan en `localStorage`, sin cifrado y únicamente en el navegador de ese dispositivo. **Evita ingresar nombres personales en dispositivos compartidos**; «Borrar datos» permite eliminarlos de la app.

## Fuentes

- Biblia, Nueva Versión Internacional (NVI): https://www.biblegateway.com/versions/Nueva-Version-Internacional-Biblia-NVI/
- Elena G. de White, *El hogar cristiano*: https://m.egwwritings.org/es/book/177/toc
- Elena G. de White, *Mensajes para los jóvenes*: https://m.egwwritings.org/es/book/1769/toc

Los recursos consultados no tienen DOI para estas ediciones digitales; se proporcionan las URLs oficiales o de consulta establecidas en las referencias de la aplicación.
