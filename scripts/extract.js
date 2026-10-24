// Haalt de inhoud (teksten, koppen, lijsten, afbeeldingen) uit de gedownloade WordPress-pagina's in _bron/
// en schrijft een opgeschoonde versie naar content/<pagina>.html
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const SRC = path.join(__dirname, '..', '_bron');
const OUT = path.join(__dirname, '..', 'content');
fs.mkdirSync(OUT, { recursive: true });

const KEEP = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'a', 'img', 'br', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 'span', 'div', 'figure', 'del', 'ins', 'bdi', 'form', 'label', 'input', 'textarea', 'button', 'select', 'option']);

for (const file of fs.readdirSync(SRC).filter(f => f.endsWith('.html'))) {
  const $ = cheerio.load(fs.readFileSync(path.join(SRC, file), 'utf8'));
  // Alleen de pagina-secties, niet de header/footer van het thema
  const sections = $('.et_pb_section').filter((_, el) => !/_tb_(header|footer)/.test($(el).attr('class') || ''));
  const root = sections.length ? sections : $('#main-content');
  const $c = cheerio.load('<main></main>');
  root.each((_, el) => $c('main').append($(el).clone()));

  $c('script, style, noscript, svg, iframe').remove();
  $c('*').each((_, el) => {
    const tag = el.tagName && el.tagName.toLowerCase();
    if (!tag || tag === 'main') return;
    if (!KEEP.has(tag)) { $c(el).replaceWith($c(el).contents()); return; }
    const keepAttrs = {};
    const a = el.attribs || {};
    if (tag === 'img') {
      keepAttrs.src = a['data-src'] || a.src;
      keepAttrs.alt = a.alt || '';
    }
    if (tag === 'a' && a.href) keepAttrs.href = a.href;
    if (['input', 'textarea', 'select', 'button', 'label'].includes(tag)) {
      for (const k of ['type', 'name', 'placeholder', 'for', 'id', 'value']) if (a[k]) keepAttrs[k] = a[k];
    }
    el.attribs = keepAttrs;
  });
  // Lege divs/spans uitpakken, lege paragrafen weg
  let html = $c('main').html();
  for (let i = 0; i < 6; i++) {
    html = html
      .replace(/<(span|div)>\s*<\/\1>/g, '')
      .replace(/<p>(\s|&nbsp;|<br>)*<\/p>/g, '');
  }
  html = html.replace(/<\/?span>/g, '').replace(/\n\s*\n+/g, '\n');
  fs.writeFileSync(path.join(OUT, file), html.trim());
  console.log(file, html.length);
}
