# Fontanería Alzira

Web estática multipágina en HTML semántico, CSS propio y TypeScript. Vite compila páginas HTML independientes; GSAP, ScrollTrigger y Lenis se cargan como mejoras progresivas. Los iconos son SVG de Lucide insertados durante la generación. Tipografías Manrope e Inter alojadas en el proyecto.

**Estado de entrega: desarrollo privado.** No se ha publicado en Vercel. No se disponía del archivo de referencia visual; se siguió la dirección artística descrita. Las imágenes WebP provisionales son ilustraciones generadas con IA, identificadas en la web. No representan a la empresa, su equipo ni sus trabajos.

## Instalación y ejecución

Node.js 20.19 o superior.

```sh
npm install
npm run dev
```

Para verificar el resultado de producción en local:

```sh
npm run build
npm test
npm run preview
```

`npm run check` ejecuta TypeScript sin emitir código. `npm run generate` regenera las entradas del sitio antes de construir. Si se cambia el contenido o la configuración con el servidor de desarrollo abierto, volver a ejecutar `npm run generate`.

## Organización

| Ubicación | Responsabilidad |
| --- | --- |
| `src/config/business.ts` | Identidad, canales, servicios y zonas aprobadas, privacidad, autorización de publicación, portfolio y reseñas. |
| `src/config/content.ts` | Contenidos y claves de los servicios, municipios y pasos del proceso. |
| `scripts/generate.ts` | Layouts y datos HTML compartidos, metadatos, manifest de rutas, robots, sitemap y configuración de cabeceras. |
| `src/styles/` | Sistema visual, componentes, secciones y reglas responsive. |
| `src/scripts/` | Navegación, acordeón, galería, formulario, animaciones y contrato de medición. |
| `public/images/` | Variantes WebP. Las rutas y el texto alternativo se emiten desde el generador y el catálogo. |
| `dist/` | Archivos de producción. No editar manualmente. |

Los `index.html` de las rutas se regeneran desde las plantillas. No hay un router JavaScript ni una reescritura general hacia la portada. El contenido, los enlaces y los acordeones están en HTML. El locale se centraliza y la capa de generación permite incorporar en el futuro una colección de rutas equivalente `/va/`; el valenciano no está traducido ni activo. Añadir `hreflang` recíproco solo cuando existan páginas equivalentes.

## Datos e imágenes

1. Completar `business.ts` con la identidad oficial, números E.164, correo, horario, urgencias y dominio HTTPS. Introducir solo municipios y servicios aprobados por el titular. Añadir otros registros editando `content.ts`. No dar por cubierta toda Valencia.
2. Colocar el logotipo aprobado en `public/` y asignar su ruta a `logo`. Revisar la marca provisional del favicon.
3. Sustituir las imágenes de `public/images/` con las variantes existentes: `hero` a 640/960/1600 px y resto a 400/640 px. Usar fotografía autorizada, corregir los textos alternativos y revisar el recorte en móvil. Marcar `approvedImages` solo tras verificar todas las fotos y su adecuación al uso. Revisar y aprobar los textos propios (`approvedCopy`), incluidos los accesos y la forma de trabajar.
4. Añadir intervenciones y comparativas solo con material auténtico y autorizado. Completar problema y solución en cada caso. Las reseñas deben proceder del perfil verificado de Google; no se copian de forma automática ni se emite un `AggregateRating` autoatribuido.
5. Cambiar los textos legales desde la configuración o reemplazar los bloques correspondientes por contenido HTML estructurado y revisado. No publicar textos de ejemplo.

## Formulario y medición

El borrador solo valida en el navegador. Los datos no se guardan ni se envían. Los CTA de llamada/WhatsApp, sin números verificados, dirigen a la página de contacto y explican el estado. Con números válidos se generan enlaces `tel:` y `wa.me`, con mensaje específico en cada página de servicio.

Para activar el formulario, configurar `contactEndpoint`, preferiblemente en la misma procedencia (por ejemplo, `/api/contact`). El cliente envía un POST `application/x-www-form-urlencoded` con `name`, `phone`, `town`, `service`, `message` y `privacy`. En peticiones con `Accept: application/json`, el servidor debe devolver `2xx` y `{"ok":true}` únicamente tras aceptar de forma duradera la solicitud. Las respuestas inválidas, expiradas o fallidas no se presentan como éxito. Para peticiones sin JavaScript, el endpoint debe devolver una página accesible de confirmación o error, o una redirección `303` a dicha página.

Validar y normalizar los valores también en el servidor; verificar origen según la arquitectura, aplicar límites de frecuencia y tamaño, controlar el spam y mantener credenciales de correo fuera del cliente. Evitar almacenar el texto o el número en logs de analítica. Si se elige un dominio distinto, configurar CORS y confirmar que el proveedor respeta el contrato de respuesta; no incluir secretos en el código de Vite.

Los eventos `whatsapp`, `call`, `quote_click` y `form_submit` están preparados. No hay SDK ni cookies de analítica. Un integrador puede asignar `window.fontaneriaAnalytics = { hasConsent, track }` después de revisar la privacidad. El evento solo se emite si `hasConsent()` devuelve `true`; el payload se limita a evento y ruta, sin texto ni datos personales del formulario.

## Vercel y publicación

1. Mantener `mode: 'draft'` hasta recibir aprobación. Utilizar la compilación local o un entorno de acceso restringido. `noindex` no sustituye a los controles de acceso.
2. Importar el repositorio en Vercel, preset Vite, build `npm run build`, salida `dist`. Mantener `vercel.json` junto a `package.json`. El borrador bloquea compilaciones cuyo `VERCEL_ENV` es `production`; el modo `live` bloquea compilaciones en `preview`.
3. En la rama de lanzamiento, completar los datos, pasar `mode` a `live` y ejecutar `npm run generate`. Incluir el `vercel.json` regenerado antes de importar o volver a desplegar: Vercel lee sus cabeceras antes de ejecutar el build. Asegurar que los despliegues auxiliares estén protegidos y no se añadan a los índices.
4. Ejecutar `npm ci`, `npm run build` y `npm test`. Probar el dominio final, redirecciones, enlaces de contacto, formulario con recepción real y políticas. No retirar protecciones por defecto hasta autorizar la publicación.

## Checklist de publicación, SEO y GEO

- [ ] Confirmar datos de contacto, titularidad, urgencias, horario, servicios, municipios, identidad gráfica y material fotográfico.
- [ ] Validar textos legales, tratamiento de solicitudes, analítica y, cuando aplique, gestión del consentimiento y revocación.
- [ ] Activar solo rutas útiles y verificadas; comprobar títulos, descripciones, canonical, Open Graph y migas.
- [ ] Comprobar `robots.txt`, el sitemap con el dominio definitivo y que las cabeceras coinciden con el modo. El borrador entrega `noindex`, robots cerrado y sitemap vacío.
- [ ] Validar el JSON-LD real. `Plumber` representa la entidad de negocio, especialización de `LocalBusiness` y `Organization`; se emiten también `WebSite`, `WebPage`, `Service`, `BreadcrumbList` y `FAQPage` cuando proceden. La presencia de FAQ no garantiza un formato enriquecido ni citación.
- [ ] Mantener los datos de entidad coherentes con Google Business Profile, Bing Places y otros perfiles oficiales. Revisar áreas, dirección pública cuando proceda, horario, descripciones y enlaces oficiales. No presentar reseñas o métricas inventadas.
- [ ] Decidir si se autoriza `OAI-SearchBot` para búsqueda. `allowOaiSearch` está desactivado por defecto. `GPTBot`, `Google-Extended` y `CCBot` se bloquean explícitamente. No se incluye `llms.txt`: no es requisito.
- [ ] Tras autorización, enviar el sitemap a Search Console y Bing Webmaster Tools. Revisar Core Web Vitals reales al disponer de tráfico y repetir las pruebas de accesibilidad y rendimiento con los recursos definitivos.

## Pendiente de integración o aprobación

Identidad definitiva y dominio, fotografías reales, titularidad fiscal y legal, canales y horarios, coberturas y catálogo final, sistema de envío, perfil y reseñas, proyectos y textos comerciales. La galería y las comparativas se habilitan al añadir proyectos con medios reales. No se incluye un backend ni conexión a un proveedor; no se necesitan claves para construir el proyecto.

## Verificación de esta entrega

- TypeScript, build de Vite y comprobación de las 22 rutas con `npm test`.
- Chromium/Playwright: navegación y enlaces, diseño sin desbordamiento en páginas representativas a 320, 375, 390, 768, 1024, 1440 y 2560 px, menú con teclado, acordeón con y sin JavaScript, preferencia de movimiento reducido, selección de servicio desde su ficha y validación del formulario sin peticiones POST.
- Axe no detectó infracciones automáticas en las nueve plantillas representativas probadas en móvil y escritorio. Esto no equivale a una certificación de conformidad.
- Lighthouse móvil sobre la portada compilada localmente: rendimiento 98/100, accesibilidad 100/100, buenas prácticas 100/100 y SEO 66/100. La única comprobación SEO fallida fue el bloqueo intencionado de indexación. LCP de laboratorio: 2,37 s; CLS: 0; TBT: 19 ms. No son datos de campo y TBT no sustituye a INP. Repetir la auditoría sobre el dominio y los recursos de producción.
