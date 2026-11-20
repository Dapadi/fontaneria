import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { business as b } from '../src/config/business';
import { services, zones, extraZones, steps, values } from '../src/config/content';

const live = b.mode === 'live';
const esc = (s: string) => s.replace(/[&<>"']/g, v => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[v]!));
const domain = b.domain.replace(/\/+$/, '');
const serviceList = live ? services.filter(s => b.confirmedServices.includes(s.id)) : services;
const zoneList = live ? zones.filter(z => b.confirmedZones.includes(z.id)) : zones;
const name = esc(b.name);
const phoneValid = /^\+[1-9]\d{7,14}$/;
const https = (s: string) => { try { return new URL(s).protocol === 'https:'; } catch { return false; } };
const endpointValid = (s: string) => /^\/(?!\/)[a-zA-Z0-9/_-]+$/.test(s) || https(s);
const required = {
  'dominio HTTPS sin ruta': https(domain) && new URL(domain).origin === domain,
  'nombre y emplazamiento': Boolean(b.name.trim() && b.locality.trim() && b.region.trim()),
  'teléfono y WhatsApp E.164': phoneValid.test(b.phone) && phoneValid.test(b.whatsapp),
  'correo y horario': /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email) && Boolean(b.hours.trim()),
  'condiciones de urgencias': Boolean(b.emergency.trim()),
  'servicios y zonas confirmados': serviceList.length > 0 && zoneList.length > 0,
  'textos e imágenes aprobados': b.approvedCopy && b.approvedImages,
  'identidad gráfica definitiva': Boolean(b.logo) && b.logo !== '/favicon.svg',
  'textos legales definitivos': Object.values(b.legal).every(v => v.trim().length > 0),
  'endpoint de contacto': endpointValid(b.contactEndpoint),
};
const blockers = Object.entries(required).filter(([, ok]) => !ok).map(([s]) => s);
if (live && blockers.length) throw new Error(`Publicación bloqueada: ${blockers.join(', ')}.`);
if (!live && process.env.VERCEL_ENV === 'production') throw new Error('El borrador no se puede desplegar en producción.');
if (live && process.env.VERCEL_ENV === 'preview') throw new Error('No se genera una compilación indexable en un entorno Preview de Vercel.');

const iconCache = new Map<string, string>();
const ic = (n: string) => {
  if (!iconCache.has(n)) {
    iconCache.set(n, readFileSync(`node_modules/lucide/icons/${n}.svg`, 'utf8')
      .replace('<svg', '<svg aria-hidden="true" focusable="false"'));
  }
  return iconCache.get(n)!;
};
const mark = () => `<span class="brand-mark"><img src="${esc(b.logo || '/favicon.svg')}" width="42" height="42" alt=""></span>`;
const brand = () => `<a class="brand" href="/">${mark()}<span><strong>${name}</strong><small>ALZIRA · LA RIBERA</small></span></a>`;
const sign = (s: string) => `<span class="eyebrow"><span></span>${s}</span>`;
const whatsapp = (service?: string) => {
  const message = service
    ? `Hola, necesito un fontanero en Alzira. Me gustaría consultar sobre ${service.toLocaleLowerCase('es')}. ¿Podríais ayudarme?`
    : 'Hola, necesito un fontanero en Alzira. ¿Podríais ayudarme?';
  return phoneValid.test(b.whatsapp) ? `https://wa.me/${b.whatsapp.slice(1)}?text=${encodeURIComponent(message)}` : '/contacto/#canales';
};
const tel = phoneValid.test(b.phone) ? `tel:${b.phone}` : '/contacto/#canales';
const button = (text: string, href: string, kind = 'primary', icon = 'arrow-up-right', event = '') =>
  `<a class="button ${kind}" href="${esc(href)}"${event ? ` data-event="${event}"` : ''}>${icon ? ic(icon) : ''}<span>${text}</span></a>`;
const wa = (label = 'Escríbenos por WhatsApp', service?: string) => button(label,whatsapp(service),'primary','message-circle',phoneValid.test(b.whatsapp) ? 'whatsapp' : '');
const call = (label = 'Llámanos ahora') => button(label,tel,'outline','phone',phoneValid.test(b.phone) ? 'call' : '');
const quote = () => button('Pide tu presupuesto','/contacto/#presupuesto','primary','arrow-up-right','quote_click');
const pending = (s: string) => `<p class="note">${ic('info')}<span>${s}</span></p>`;
const primaryNav = [
  ['Inicio','/'],['Servicios','/servicios/'],['Trabajos','/trabajos/'],['Sobre nosotros','/sobre-nosotros/'],['Opiniones','/#opiniones'],['Contacto','/contacto/']
];
type Crumb = [string,string];
const breadcrumbs = (end: string, parent?: Crumb): Crumb[] => [['Inicio','/'],...(parent ? [parent] : []),[end,'']];
const crumbs = (trail: Crumb[]) => `<nav class="crumbs" aria-label="Ruta de navegación"><ol>${trail.map(([label,url]) => `<li>${url ? `<a href="${url}">${label}</a>${ic('chevron-right')}` : `<span aria-current="page">${label}</span>`}</li>`).join('')}</ol></nav>`;
function header(path: string) {
  return `<a class="skip" href="#contenido">Saltar al contenido</a>
  <div class="topbar"><div class="wrap topbar-inner"><a href="/zonas/">${ic('map-pin')} Alzira, Valencia · La Ribera</a><a href="/contacto/#canales">${ic('message-circle')} Atención y presupuestos ${ic('arrow-up-right')}</a></div></div>
  <header class="header"><div class="reading" aria-hidden="true"><span></span></div><div class="wrap nav-wrap">
  ${brand()}<nav id="menu" aria-label="Navegación principal">${primaryNav.map(([label,url]) => `<a href="${url}"${url===path ? ' aria-current="page"' : ''}>${label}</a>`).join('')}<a class="menu-quote" href="/contacto/#presupuesto" data-event="quote_click">Pide tu presupuesto ${ic('arrow-up-right')}</a></nav>
  <div class="nav-actions"><a class="icon-link" href="${tel}" aria-label="Teléfono"${phoneValid.test(b.phone) ? ' data-event="call"' : ''}>${ic('phone')}</a>${quote()}</div>
  <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu" aria-label="Abrir menú"><span class="open-icon">${ic('menu')}</span><span class="close-icon">${ic('x')}</span></button></div></header>`;
}
function footer() {
  return `<footer class="footer"><div class="wrap"><div class="footer-grid">
    <div>${brand()}<p>Fontanería en Alzira, Valencia.</p>${b.email ? `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : ''}${b.phone ? `<a href="${tel}">${esc(b.phone)}</a>` : ''}</div>
    <div><h2>Servicios</h2>${serviceList.slice(0,4).map(s=>`<a href="/servicios/${s.id}/">${s.title}</a>`).join('')}</div>
    <div><h2>Localidades</h2>${zoneList.map(z=>`<a href="/zonas/${z.id}/">${z.name}</a>`).join('')}<a href="/zonas/">Ver zonas</a></div>
    <div><h2>Información</h2><a href="/sobre-nosotros/">Sobre nosotros</a><a href="/trabajos/">Trabajos</a><a href="/blog/">Blog</a><a href="/contacto/">Contacto</a></div>
    </div><div class="footer-bottom"><span>© ${name}</span><nav aria-label="Información legal"><a href="/aviso-legal/">Aviso legal</a><a href="/privacidad/">Privacidad</a><a href="/cookies/">Cookies</a></nav>${!live ? '<span class="draft-label">Versión de desarrollo</span>' : ''}</div></div></footer>
    <a class="float-wa" href="${esc(whatsapp())}" aria-label="WhatsApp"${phoneValid.test(b.whatsapp) ? ' data-event="whatsapp"' : ''}>${ic('message-circle')}</a>
    <div class="mobile-actions" aria-label="Acciones de contacto">${call('Llamar')}${wa('WhatsApp')}</div>`;
}
const photo = (file: string, alt: string, classes = '', hero = false) => {
  const src = `/images/${file}`;
  return `<img class="${classes}" src="${src}-${hero ? 960 : 640}.webp" srcset="${src}-${hero ? '640.webp 640w, '+src+'-960.webp 960w, '+src+'-1600.webp 1600w' : '400.webp 400w, '+src+'-640.webp 640w'}" sizes="${hero ? '(max-width: 760px) 100vw, 70vw' : classes === 'card-image' ? '(max-width: 960px) 44vw, (max-width: 1480px) 22vw, 313px' : '(max-width: 760px) 90vw, 43vw'}" width="${hero ? 1600 : 640}" height="${hero ? 900 : file === 'equipo' ? 853 : 360}" alt="${alt}" ${hero ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"'}>`;
};
const illustrative = () => !b.approvedImages ? `<figcaption>Imagen ilustrativa · generada con IA</figcaption>` : '';
const title = (eyebrow: string, h: string, p = '') => `<div class="section-title" data-reveal>${sign(eyebrow)}<h2>${h}</h2>${p ? `<p>${p}</p>` : ''}</div>`;
const serviceCards = () => `<div class="cards" data-stagger>${serviceList.map((s,i)=>`<article class="service-card"><div class="card-media">${photo(s.image,s.alt,'card-image')}</div><div class="card-body"><span class="card-icon">${ic(s.icon)}</span><span class="card-index" aria-hidden="true">${String(i+1).padStart(2,'0')} /</span><h3><a href="/servicios/${s.id}/">${s.title}</a></h3><p>${s.desc}</p><span class="card-arrow">${ic('arrow-up-right')}</span></div></article>`).join('')}</div>${!b.approvedImages ? '<p class="image-note">Imágenes ilustrativas generadas con IA. No muestran intervenciones del negocio.</p>' : ''}`;
const serviceSection = () => `<section id="servicios" class="section services"><div class="wrap"><div class="section-toolbar">${title('NUESTROS SERVICIOS','¿En qué podemos ayudarte?','Soluciones de fontanería adaptadas a tu hogar, comunidad o negocio.')}${button('Ver todos los servicios','/servicios/','outline')}</div>${serviceCards()}${!live ? pending('Catálogo provisional. Los servicios se confirmarán antes de publicar.') : ''}</div></section>`;

const landmarks = [['Alzira',39.15121,-0.43466],['Carcaixent',39.12097,-0.44728],['Algemesí',39.19076,-0.43575],['Guadassuar',39.18333,-0.47806]] as const;
const map = () => `<figure class="map"><div class="map-canvas"><svg viewBox="0 0 540 300" role="img" aria-labelledby="map-title"><title id="map-title">Ubicación relativa de Alzira, Algemesí, Carcaixent y Guadassuar; no representa el área de servicio</title><defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#d5e4f4"/></pattern></defs><rect width="540" height="300" fill="url(#grid)"/><path d="M506 55V23m-6 10 6-10 6 10" fill="none" stroke="#496580"/><text x="506" y="74" text-anchor="middle">N</text>${landmarks.map(([label,lat,lon])=>{
  const x = 280 + (lon + 0.43466)*2250*Math.cos(39.15*Math.PI/180), y = 150 - (lat-39.15121)*2250;
  return label === 'Alzira' ? `<g transform="translate(${x},${y})"><circle r="26" fill="#cce4fb"/><circle r="13" fill="#005bbb"/><circle r="4" fill="white"/><text class="map-major" x="34" y="7">${label}</text></g>` : `<g transform="translate(${x},${y})"><circle r="4" fill="#357ab7"/><text x="${label==='Guadassuar'?-10:12}" y="5" ${label==='Guadassuar'?'text-anchor="end"':''}>${label}</text></g>`;
}).join('')}</svg><span class="map-key">${ic('map-pin')} LA RIBERA ALTA · VALENCIA</span></div><figcaption>Mapa de referencia, no de cobertura. Coordenadas: <a href="https://mapcarta.com/17389936">Mapcarta</a> y <a href="https://en.wikipedia.org/wiki/Guadassuar">Wikipedia</a>.</figcaption></figure>`;
const zoneLinks = () => `<ul class="zone-list">${zoneList.map(z=>`<li><a href="/zonas/${z.id}/">${ic('map-pin')}${z.name}${ic('arrow-up-right')}</a></li>`).join('')}</ul>`;
const area = () => `<section id="zonas" class="section soft"><div class="wrap split area">${map()}<div>${title('ZONA DE ACTUACIÓN','Tu fontanero en Alzira y La Ribera.','Consulta la disponibilidad indicando tu localidad y el tipo de trabajo.')} ${zoneLinks()}${!live ? `<p class="image-note">Cobertura pendiente de confirmar. Otras localidades en revisión: ${extraZones.join(', ')}.</p>` : ''}<a class="text-link" href="/contacto/">¿No encuentras tu localidad? Consúltanos ${ic('arrow-up-right')}</a></div></div></section>`;
const about = () => `<section class="section"><div class="wrap split about"><figure class="editorial-photo" data-photo>${photo('equipo','Profesional revisando una conexión de agua en un baño')}${illustrative()}</figure><div>${title('SOBRE NOSOTROS','Personas de confianza.<br>Trabajos bien hechos.')}<p>Una reparación empieza por entender qué ha pasado. La idea es explicarte qué opciones hay, qué se puede reparar y qué conviene sustituir, antes de tocar la instalación.</p><p>Al terminar, comprobamos que todo funciona y comentamos contigo qué conviene vigilar después.</p>${button('Conoce nuestra forma de trabajar','/sobre-nosotros/','outline')}</div></div></section>`;
const differences = () => `<section class="section soft"><div class="wrap">${title('NUESTRA FORMA DE TRABAJAR','¿Por qué elegirnos?')}<div class="value-grid" data-stagger>${values.map(([t,p,i])=>`<article><span class="card-icon">${ic(i)}</span><h3>${t}</h3><p>${p}</p></article>`).join('')}</div></div></section>`;
const workflow = () => `<section class="section process"><div class="wrap">${title('ASÍ TRABAJAMOS','Solucionar tu problema es más fácil de lo que piensas.')}<div class="timeline"><div class="timeline-line" aria-hidden="true"><span></span></div><ol>${steps.map(([t,p,i],n)=>`<li><span class="step-icon">${ic(i)}</span><p class="step-n">PASO 0${n+1}</p><h3>${t}</h3><p>${p}</p></li>`).join('')}</ol></div></div></section>`;
const works = () => `<section class="section works"><div class="wrap"><div class="section-toolbar">${title('TRABAJOS REALIZADOS','Trabajos de fontanería.')}${button('Ver trabajos','/trabajos/','outline')}</div>${projectList()}</div></section>`;
function projectList() {
  if (!b.projects.length) return `<div class="empty">${ic('images')}<div><h3>${live ? 'Todavía no hay casos publicados' : 'Galería en preparación'}</h3><p>Aquí se mostrarán intervenciones documentadas con fotografías y explicaciones del trabajo realizado.</p></div></div>`;
  return `<div class="gallery" data-gallery tabindex="0" role="region" aria-label="Galería de proyectos">${b.projects.map(p=>`<article><img loading="lazy" width="640" height="360" src="${esc(p.image)}" alt="${esc(p.alt)}"><span class="step-n">${esc(p.category)} · ${esc(p.town)}</span><h3>${esc(p.title)}</h3><p><strong>Problema:</strong> ${esc(p.problem)}</p><p><strong>Solución:</strong> ${esc(p.solution)}</p>${p.before && p.after ? `<div class="comparison" data-compare><img loading="lazy" width="640" height="360" src="${esc(p.before)}" alt="Antes: ${esc(p.alt)}"><img loading="lazy" width="640" height="360" src="${esc(p.after)}" alt="Después: ${esc(p.alt)}"><label>Mostrar imagen después <input type="range" min="0" max="100" value="50"></label></div>` : ''}</article>`).join('')}</div>`;
}
const reviews = () => `<section id="opiniones" class="section soft"><div class="wrap">${title('OPINIONES','Opiniones de clientes.')}${b.reviews ? `<p>Valoración en Google: <strong>${b.reviews.rating}/5</strong> · ${b.reviews.count} reseñas</p><div class="value-grid">${b.reviews.entries.map(r=>`<article><blockquote>${esc(r.text)}</blockquote><p>${esc(r.author)} · <time datetime="${esc(r.date)}">${esc(r.date)}</time></p><a href="${esc(r.url)}">Leer en Google</a></article>`).join('')}</div>` : `<div class="empty">${ic('messages-square')}<div><h3>Sin opiniones verificadas para mostrar</h3><p>Publicaremos opiniones cuando podamos enlazarlas a un perfil verificado.</p></div></div>`}${b.googleProfile ? `<a class="text-link" href="${esc(b.googleProfile)}">Ver perfil en Google ${ic('arrow-up-right')}</a>` : ''}</div></section>`;
const confirmed = (id: string, yes: string) => live ? b.confirmedServices.includes(id) ? yes : 'No figura en nuestro catálogo de servicios. Consulta antes de contratar.' : 'Es un servicio propuesto. La disponibilidad está pendiente de confirmación.';
const faqItems = [
  ['¿Qué servicios ofrece un fontanero en Alzira?', live ? `${name} ofrece estos servicios: ${serviceList.map(x=>x.title.toLowerCase()).join(', ')}.` : 'Un fontanero puede reparar fugas, desatascar desagües o intervenir en instalaciones de agua. El catálogo de Fontanería Alzira está pendiente de confirmación.'],
  ['¿Cómo puedo solicitar un presupuesto?',live ? 'Contacta por teléfono, WhatsApp o el formulario e indica la localidad, el problema y cuándo empezó.':'Los canales de presupuesto están pendientes de activación. Para prepararlo, anota la localidad, el problema y cuándo empezó.'],
  ['¿En qué localidades trabajáis?',live ? `La cobertura confirmada incluye: ${zoneList.map(x=>x.name).join(', ')}.` : 'El proyecto tiene su base en Alzira. La cobertura en La Ribera está pendiente de confirmación.'],
  ['¿Reparáis fugas de agua?',confirmed('reparacion-fugas','Sí. Indícanos dónde notas la pérdida y si aparece al abrir el grifo o de forma continua.')],
  ['¿Realizáis desatascos?',confirmed('desatascos','Sí. Dinos qué desagüe está afectado y si el agua también retrocede en otros puntos.')],
  ['¿Instaláis sanitarios y grifería?',live ? [confirmed('reformas-banos','Instalamos sanitarios.'),confirmed('griferia','Instalamos grifería.')].join(' ') : 'La instalación de sanitarios y grifería está pendiente de confirmación.'],
  ['¿Trabajáis con comunidades de propietarios?',confirmed('mantenimiento','Sí. Indica qué elemento común está afectado y quién gestiona el acceso.')],
  ['¿Qué debo hacer si tengo una fuga de agua en casa?','Cierra la llave de paso si puedes acceder con seguridad. Evita tocar enchufes o aparatos mojados y no desmontes la instalación. Si hay peligro inmediato para las personas, llama al 112.'],
  ['¿Ofrecéis atención urgente?',live ? esc(b.emergency) : 'La disponibilidad para urgencias no está confirmada. No se anuncia servicio 24 horas.'],
  ['¿Cómo puedo contactar con vosotros?',live ? `Llama al ${esc(b.phone)}, escribe por WhatsApp o usa el formulario de contacto.` : 'Consulta el estado de los canales en la página de contacto. Todavía no se reciben llamadas, mensajes ni formularios desde esta versión.'],
];
const faqs = () => `<section id="preguntas" class="section"><div class="wrap faq-layout">${title('PREGUNTAS FRECUENTES','Antes de llamar.','Respuestas a las dudas más habituales sobre servicios, cobertura y presupuestos.')}<div class="accordion" data-accordion>${faqItems.map(([q,a])=>`<details name="faq"><summary>${q}${ic('plus')}</summary><p>${a}</p></details>`).join('')}</div></div></section>`;

const contact = (standalone = false) => `<section id="presupuesto" class="section contact"><div class="wrap contact-grid"><div id="canales">${standalone ? '<h2>Canales de contacto</h2>' : title('CONTACTO Y PRESUPUESTOS','¿Necesitas un fontanero? Estamos para ayudarte.')}<p>Describe qué ocurre, desde cuándo y en qué localidad. Esa información ayuda a valorar el trabajo antes de concertar una visita.</p>
  <div class="contact-actions">${b.whatsapp ? wa('WhatsApp') : `<span class="button primary inactive">${ic('message-circle')} WhatsApp pendiente</span>`}${b.phone ? call('Llamar') : `<span class="button outline inactive">${ic('phone')} Teléfono pendiente</span>`}</div>
  <dl class="contact-data"><div><dt>${ic('map-pin')} Zona</dt><dd>${live ? zoneList.map(z=>z.name).join(', ') : 'Alzira · La Ribera (cobertura por confirmar)'}</dd></div>${b.address ? `<div><dt>${ic('map-pin')} Dirección</dt><dd>${esc(b.address)}, ${esc(b.locality)} (${esc(b.region)})</dd></div>` : ''}<div><dt>${ic('clock')} Horario</dt><dd>${esc(b.hours || 'Pendiente de confirmar')}</dd></div><div><dt>${ic('mail')} Correo</dt><dd>${b.email ? `<a href="mailto:${esc(b.email)}">${esc(b.email)}</a>` : 'Pendiente de configurar'}</dd></div></dl>
  </div><div class="form-panel"><h2>Pide tu presupuesto</h2>${!live ? pending('Formulario de desarrollo. No se envían ni almacenan los datos.') : ''}
  <form id="contact-form" data-endpoint="${esc(live ? b.contactEndpoint : '')}" ${live ? `action="${esc(b.contactEndpoint)}"` : ''} method="post">
  <div class="form-grid"><label>Nombre<input name="name" autocomplete="name" required minlength="2" maxlength="100"></label><label>Teléfono<input name="phone" type="tel" autocomplete="tel" required inputmode="tel" maxlength="22"></label><label>Localidad<input name="town" autocomplete="address-level2" required minlength="2" maxlength="100"></label><label>Servicio requerido<select name="service" required><option value="">Selecciona una opción</option>${serviceList.map(s=>`<option value="${s.id}">${s.title}</option>`).join('')}<option value="otro">Otro / No lo sé</option></select></label></div>
  <label>Descripción del problema<textarea name="message" required minlength="10" maxlength="2000" rows="4"></textarea></label><div class="privacy-check"><input id="privacy-accept" name="privacy" type="checkbox" required value="yes"><label for="privacy-accept">He leído la <a href="/privacidad/">política de privacidad</a>.</label></div>
  <button type="submit" class="button primary" ${live ? '' : 'disabled data-draft-submit'}>${ic('arrow-up-right')}<span>${live ? 'Enviar solicitud' : 'Comprobar formulario'}</span></button><p class="form-status" aria-live="polite" role="status"></p>
  <noscript><p>${live ? 'El formulario se puede enviar con la validación del navegador.' : 'Activa JavaScript si quieres probar la validación local. No se realizará ningún envío.'}</p></noscript></form></div></div></section>`;

const hero = () => `<section class="hero" aria-labelledby="main-title">
   <div class="hero-media">${photo('hero','Imagen ilustrativa de un fontanero revisando un sifón bajo el fregadero', 'hero-image',true)}${!b.approvedImages ? '<span class="photo-credit">Imagen ilustrativa · IA</span>' : ''}</div>
   <div class="wrap hero-wrap"><div class="hero-copy">
     <div data-hero>${sign('FONTANERÍA EN ALZIRA Y LA RIBERA')}</div>
     <h1 id="main-title">Tu fontanero<br> de confianza<br> en <span>Alzira.</span></h1>
     <p data-hero>Reparamos, instalamos y mantenemos la fontanería de tu hogar, comunidad o negocio. Soluciones profesionales sin complicaciones.</p>
     <div class="hero-actions" data-hero>${wa()}${call()}</div>
     <div class="hero-proof" data-hero>${b.trust.length ? b.trust.map(x=>`<span>${ic('circle-check')}${esc(x)}</span>`).join('') : `<span>${ic('map-pin')}Alzira, Valencia</span><span>${ic('info')}Canales de contacto por activar</span>`}</div>
   </div></div>
   </section>`;
const trustStrip = () => `<div class="intro-strip"><div class="wrap">${[['house','Hogares','Cocinas, baños e instalaciones'],['building-2','Comunidades','Fontanería de zonas comunes'],['store','Negocios','Reparaciones e instalaciones']].map(([i,t,p])=>`<div>${ic(i)}<span><strong>${t}</strong><small>${p}</small></span></div>`).join('')}</div></div>`;

type Page = { path: string; title: string; description: string; body: string; trail?: Crumb[]; service?: typeof services[number]; homepage?: boolean };
const pages: Page[] = [];
function page(path: string, heading: string, description: string, content: string, opt: {tag?: string; parent?: Crumb; aside?: string; service?: typeof services[number]; cta?: string; title?: string} = {}) {
  const trail = breadcrumbs(heading,opt.parent);
  const body = `<section class="subhero"><div class="wrap">${crumbs(trail)}<div class="${opt.aside ? 'split subhero-split' : ''}"><div>${sign(opt.tag || esc(b.name.toLocaleUpperCase('es')))}<h1>${heading}</h1><p>${description}</p>${opt.cta || ''}</div>${opt.aside || ''}</div></div></section>${content}`;
  pages.push({path,title:opt.title || `${heading} | ${b.name}`,description,body,trail,service:opt.service});
}
const prose = (h: string,p:string,more = '') => `<section class="section"><div class="wrap prose"><h2>${h}</h2><p>${p}</p>${more}</div></section>`;
pages.push({path:'/',title:live ? `Fontanero en Alzira | ${b.name}` : 'Fontanero en Alzira | Reparaciones e instalaciones',description:live ? `Fontanería en Alzira: ${serviceList.slice(0,3).map(s=>s.title.toLocaleLowerCase('es')).join(', ')}. Consulta cobertura y solicita presupuesto.` : 'Fontanería en Alzira y La Ribera. Consulta soluciones de reparación de fugas, instalaciones y mantenimiento para viviendas, comunidades y negocios.',homepage:true,body:hero()+trustStrip()+serviceSection()+area()+about()+differences()+works()+workflow()+reviews()+faqs()+contact()});
page('/servicios/','Servicios de fontanería','Soluciones de fontanería para viviendas, comunidades y negocios.',`<section class="section"><div class="wrap">${title('CATÁLOGO','¿En qué podemos ayudarte?')}${serviceCards()}${!live ? pending('Servicios propuestos, pendientes de confirmación.') : ''}</div></section>`,{tag:'REPARACIÓN · INSTALACIÓN · MANTENIMIENTO'});
for (const s of serviceList) {
  page(`/servicios/${s.id}/`,s.title,s.desc,prose(s.heading,s.body,`<h2>Servicios relacionados</h2><ul>${serviceList.filter(o=>o.id!==s.id).slice(0,3).map(o=>`<li><a href="/servicios/${o.id}/">${o.title}</a></li>`).join('')}</ul>`),
    {tag:live ? 'SERVICIO EN ALZIRA' : 'SERVICIO PROPUESTO',parent:['Servicios','/servicios/'],aside:`<figure class="sub-photo">${photo(s.image,s.alt)}${illustrative()}</figure>`,service:s,cta:`<div class="hero-actions">${wa('Consultar por WhatsApp',s.title)}${button('Pide tu presupuesto',`/contacto/?servicio=${s.id}#presupuesto`,'outline','arrow-up-right','quote_click')}</div>`,title:`${s.title} en Alzira | ${b.name}`});
}
page('/zonas/','Zonas de actuación','Consulta la disponibilidad de fontanería según la dirección del inmueble.',area(),{tag:'ALZIRA Y LA RIBERA'});
for(const z of zoneList) page(`/zonas/${z.id}/`,`Fontanería en ${z.name}`,live ? `Servicio de fontanería en ${z.name}. Confirma el desplazamiento y la intervención cuando solicites el presupuesto.` : `${z.name} figura en la propuesta de cobertura. La disponibilidad está pendiente de confirmación.`,prose('Datos útiles al describir la incidencia',z.body,`<a class="text-link" href="/zonas/">Consultar otras localidades ${ic('arrow-up-right')}</a>`),{tag:'ZONA DE ACTUACIÓN',parent:['Zonas','/zonas/'],cta:`<div class="hero-actions">${quote()}</div>`});
page('/trabajos/','Trabajos realizados','Una selección de intervenciones de fontanería, con el problema y la solución documentados.',`<section class="section"><div class="wrap">${title('GALERÍA','Intervenciones documentadas')}${projectList()}</div></section>`);
page('/sobre-nosotros/','Sobre nosotros','Una forma de trabajar que empieza por escuchar, explicar las opciones y acordar la intervención.',about()+differences()+workflow());
page('/contacto/','Contacto y presupuestos','Indica tu localidad y qué necesitas para preparar la solicitud.',contact(true));
page('/blog/','Guías de fontanería','Consejos prácticos para describir una avería y preparar una intervención.',
  `<section class="section"><div class="wrap prose">
  <article id="fuga-de-agua"><h2>Qué hacer al detectar una fuga</h2><p>Si puedes llegar con seguridad a la llave de paso, ciérrala sin forzarla. No toques enchufes ni aparatos mojados. Si hay un peligro inmediato para las personas, llama al 112. Consulta <a href="https://www.112cv.gva.es/es/conoce-el-1-1-2">cuándo usar el 112 en la Comunitat Valenciana</a>.</p><p>Cuando sea seguro, anota de dónde parece salir el agua y si la pérdida cambia al cerrar la llave. Una foto del punto accesible ayuda más que desmontar la instalación.</p></article>
  <article id="comparar-presupuestos"><h2>Cómo comparar presupuestos de fontanería</h2><p>Compara el alcance antes de comparar el total. Pregunta qué piezas, desplazamiento, retirada de materiales e impuestos incluye cada presupuesto. Si hace falta abrir un acceso, aclara si se incluye reponer el acabado y cómo se aprueban trabajos adicionales.</p></article>
  <a class="text-link" href="/#preguntas">Ver preguntas frecuentes ${ic('arrow-up-right')}</a></div></section>`);
page('/aviso-legal/','Aviso legal',live ? 'Información del titular de este sitio.' : 'Documento provisional, pendiente de validación por el titular.',prose('Titularidad',esc(b.legal.notice || 'Antes de publicar deben completarse la identidad fiscal y los datos de contacto del titular, así como las condiciones de uso.')));
page('/privacidad/','Política de privacidad',live ? 'Tratamiento de datos personales y ejercicio de derechos.' : 'Documento provisional, pendiente de revisión antes de recibir solicitudes.',prose('Datos personales',esc(b.legal.privacy || 'En esta versión el formulario valida datos solo en el navegador. No guarda, envía ni registra los valores introducidos. Antes de habilitarlo se informará del responsable, la base jurídica, los destinatarios, la conservación y el ejercicio de derechos.')));
page('/cookies/','Política de cookies',live ? 'Información sobre almacenamiento y tecnologías de medición.' : 'Información sobre el funcionamiento de la versión de desarrollo.',prose('Cookies y medición',esc(b.legal.cookies || 'El código de esta versión no instala cookies ni activa un proveedor de analítica. Si se incorpora medición, se revisará la política y se solicitará consentimiento cuando corresponda.')));

function schema(p: Page) {
  if (!live) return undefined;
  const orgId = `${domain}/#empresa`, siteId = `${domain}/#sitio`;
  const website = {'@type':'WebSite','@id':siteId,url:`${domain}/`,name:b.name,inLanguage:b.locale,publisher:{'@id':orgId}};
  const entity = {'@type':'Plumber','@id':orgId,name:b.name,url:`${domain}/`,description:pages[0].description,telephone:b.phone,email:b.email,
    logo:new URL(b.logo,domain).href,image:`${domain}/images/hero-1600.webp`,
    areaServed:zoneList.map(z=>({'@type':'City',name:z.name})),...(b.address ? {address:{'@type':'PostalAddress',streetAddress:b.address,addressLocality:b.locality,addressRegion:b.region,addressCountry:'ES'}} : {}),
    ...(b.hoursStructured.length ? {openingHoursSpecification:b.hoursStructured.map(h=>({'@type':'OpeningHoursSpecification',...h}))} : {}),
    ...(b.sameAs.length || b.googleProfile ? {sameAs:[...b.sameAs,...(b.googleProfile ? [b.googleProfile] : [])]} : {}),
    hasOfferCatalog:{'@type':'OfferCatalog',name:'Servicios de fontanería',itemListElement:serviceList.map(s=>({'@type':'Offer',itemOffered:{'@type':'Service',name:s.title,url:`${domain}/servicios/${s.id}/`}}))}};
  const url = `${domain}${p.path}`;
  const webPage = {'@type':p.homepage ? ['WebPage','FAQPage'] : 'WebPage','@id':`${url}#pagina`,url,name:p.title,description:p.description,inLanguage:b.locale,isPartOf:{'@id':siteId},about:{'@id':orgId},...(p.trail ? {breadcrumb:{'@id':`${url}#migas`}} : {}),
    ...(p.homepage ? {mainEntity:faqItems.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))} : {}),
    ...(p.service ? {mainEntity:{'@id':`${url}#servicio`}} : {})};
  return {'@context':'https://schema.org','@graph':[website,entity,webPage,
    ...(p.trail ? [{'@type':'BreadcrumbList','@id':`${url}#migas`,itemListElement:p.trail.map(([n,u],i)=>({'@type':'ListItem',position:i+1,name:n,item:u ? `${domain}${u}` : url}))}] : []),
    ...(p.service ? [{'@type':'Service','@id':`${url}#servicio`,name:p.service.title,description:p.service.desc,url,provider:{'@id':orgId},areaServed:entity.areaServed}] : [])]};
}
function doc(p: Page) {
  const data = schema(p);
  return `<!doctype html>
<html lang="${esc(b.locale)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#ffffff">
<title>${esc(p.title)}</title><meta name="description" content="${esc(p.description)}"><meta name="robots" content="${live ? 'index,follow' : 'noindex,nofollow,noarchive'}">
<meta property="og:type" content="website"><meta property="og:locale" content="${esc(b.locale.replace('-','_'))}"><meta property="og:title" content="${esc(p.title)}"><meta property="og:description" content="${esc(p.description)}"><meta property="og:site_name" content="${name}">
${live ? `<link rel="canonical" href="${domain}${p.path}"><meta property="og:url" content="${domain}${p.path}"><meta property="og:image" content="${domain}/images/hero-1600.webp">` : ''}
${data ? `<script type="application/ld+json">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>` : ''}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
${p.homepage ? '<link rel="preload" as="image" fetchpriority="high" href="/images/hero-960.webp" imagesrcset="/images/hero-640.webp 640w, /images/hero-960.webp 960w, /images/hero-1600.webp 1600w" imagesizes="(max-width: 760px) 100vw, 70vw">' : ''}
<link rel="stylesheet" href="/src/styles/main.css"><script type="module" src="/src/scripts/main.ts"></script>
</head><body>${header(p.path)}<main id="contenido" tabindex="-1">${p.body}</main>${footer()}</body></html>`;
}
for (const dir of ['servicios','zonas','trabajos','sobre-nosotros','contacto','blog','aviso-legal','privacidad','cookies']) rmSync(dir,{recursive:true,force:true});
const output = pages.map(p=>`${p.path.slice(1)}index.html`);
pages.forEach((p,i)=>{mkdirSync(dirname(output[i]),{recursive:true});writeFileSync(output[i],doc(p));});
writeFileSync('.routes.json',JSON.stringify(output,null,2));
writeFileSync('public/robots.txt',live ? `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: Google-Extended\nDisallow: /\n\nUser-agent: CCBot\nDisallow: /\n\nUser-agent: OAI-SearchBot\n${b.allowOaiSearch ? 'Allow' : 'Disallow'}: /\n\nSitemap: ${domain}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
writeFileSync('public/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${live ? pages.map(p=>`\n  <url><loc>${esc(domain+p.path)}</loc></url>`).join('') : ''}\n</urlset>\n`);
writeFileSync('vercel.json',JSON.stringify({
  framework:'vite', buildCommand:'npm run build', outputDirectory:'dist', trailingSlash:true,
  headers:[{source:'/(.*)',headers:[
    ...(!live ? [{key:'X-Robots-Tag',value:'noindex, nofollow, noarchive'}] : []),
    {key:'X-Content-Type-Options',value:'nosniff'},
    {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
  ]},{source:'/assets/(.*)',headers:[{key:'Cache-Control',value:'public, max-age=31536000, immutable'}]}],
},null,2)+'\n');
console.log(`HTML: ${pages.length} páginas (${b.mode}).`);
