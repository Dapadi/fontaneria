import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const routes = JSON.parse(readFileSync('.routes.json','utf8'));
const docs = routes.map(route=>readFileSync(`dist/${route}`,'utf8'));
const isDraft = docs[0].includes('noindex,nofollow,noarchive');
const titles = new Set();
for (const [i,html] of docs.entries()) {
  const file = routes[i];
  assert.equal((html.match(/<h1[>\s]/g) || []).length,1,file);
  const title = html.match(/<title>(.+?)<\/title>/)?.[1];
  assert(title && !titles.has(title),`Título no único en ${file}`);
  titles.add(title);
  if (isDraft) {
    assert(html.includes('noindex,nofollow,noarchive'),`Indexación abierta en ${file}`);
    assert(!html.includes('application/ld+json'),`Entidad provisional en ${file}`);
  } else {
    assert(html.includes('rel="canonical"'),`Falta canonical en ${file}`);
    const data = html.match(/<script type="application\/ld\+json">(.+?)<\/script>/)?.[1];
    assert(data && JSON.parse(data)['@graph'].length >= 3,`Falta JSON-LD en ${file}`);
  }
  for (const [,url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    const clean = url.split(/[?#]/)[0];
    const target = clean.endsWith('/') ? `${clean}index.html` : clean;
    assert(existsSync(`dist${target}`),`${file}: URL interna sin destino: ${url}`);
  }
  for (const [,fragment] of html.matchAll(/href="(#[^"]+)"/g)) {
    assert(html.includes(`id="${fragment.slice(1)}"`),`${file}: destino ${fragment} inexistente`);
  }
}
const sitemap = readFileSync('dist/sitemap.xml','utf8');
const robots = readFileSync('dist/robots.txt','utf8');
if (isDraft) {
  assert(!sitemap.includes('<loc>'));
  assert(robots.includes('Disallow: /'));
  assert(readFileSync('vercel.json','utf8').includes('X-Robots-Tag'));
} else {
  assert.equal((sitemap.match(/<loc>/g)||[]).length,routes.length);
  assert(robots.includes('Sitemap: '));
}
console.log(`Verificadas ${routes.length} rutas HTML: títulos, H1, recursos, enlaces y estado de indexación.`);
