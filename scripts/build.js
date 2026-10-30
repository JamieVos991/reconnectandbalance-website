// Bouwt de website: src/pages/*.html + sjabloon -> site/*.html
// Afbeeldingen van de oude site worden eenmalig gedownload naar site/img/.
// Gebruik: node scripts/build.js
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PAGES = path.join(ROOT, 'src', 'pages');
const OUT = path.join(ROOT, 'site');
const IMG_OUT = path.join(OUT, 'img');
const OLD_UPLOADS = /https:\/\/reconnectandbalance\.com\/wp-content\/uploads\/[^"')\s]+/g;

const nav = [
  { label: 'Behandelingen', children: [
    { href: 'holistische-bodyscan.html', label: 'Holistische Bodyscan' },
    { href: 'mycotherapie.html', label: 'Mycotherapie' },
    { href: 'qm-hypnose.html', label: 'QM Hypnose' },
    { href: 'biofotonentherapie.html', label: 'Biofotonentherapie' },
  ] },
  { href: 'tarieven.html', label: 'Tarieven' },
  { href: 'linda-vos.html', label: 'Linda' },
  { href: 'opleidingen.html', label: 'Opleidingen' },
];

function renderNav(current) {
  const item = n => {
    if (!n.children) return `<a href="${n.href}"${n.href === current ? ' class="active" aria-current="page"' : ''}>${n.label}</a>`;
    const open = n.children.some(c => c.href === current);
    return `<div class="dropdown${open ? ' active' : ''}">
        <button type="button" class="dropdown-toggle" aria-expanded="false">${n.label}<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4"/></svg></button>
        <div class="dropdown-menu">${n.children.map(item).join('')}</div>
      </div>`;
  };
  return nav.map(item).join('\n      ') + `\n      <a href="contact.html" class="btn btn-line menu-cta">Afspraak maken</a>`;
}

const template = (file, title, description, body) => `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title === 'Home' ? 'Reconnect & Balance' : `${title} · Reconnect & Balance`}</title>
<meta name="description" content="${description}">${file === 'styleguide.html' ? '\n<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="img/Logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body${file === 'index.html' ? ' class="home"' : ''}>

<header class="site-header">
  <div class="wrap nav">
    <a href="index.html" class="brand"><img class="logo-light" src="https://reconnectandbalance.com/wp-content/uploads/2024/06/Logo_RB_wit_1.png" alt="Reconnect &amp; Balance"><img class="logo-dark" src="img/Logo.png" alt=""></a>
    <nav class="menu" id="menu" aria-label="Hoofdmenu">
      ${renderNav(file)}
    </nav>
    <a href="contact.html" class="btn btn-line nav-cta">Afspraak maken</a>
    <button class="burger" aria-label="Menu openen" aria-controls="menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>

<main>
${body}
</main>

<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-about">
      <img class="footer-brand" src="https://reconnectandbalance.com/wp-content/uploads/2024/06/Logo_RB_wit_1.png" alt="Reconnect &amp; Balance">
      <p class="footer-tag">Verbinden met jezelf, je hart, je essentie.<br>Holistische praktijk in Den Haag.</p>
    </div>
    <nav class="footer-col" aria-label="Menu">
      <h2 class="footer-heading">Menu</h2>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="linda-vos.html">Linda Vos</a></li>
        <li><a href="tarieven.html">Tarieven</a></li>
        <li><a href="opleidingen.html">Opleidingen</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="Aanbod">
      <h2 class="footer-heading heading-sand">Aanbod</h2>
      <ul>
        <li><a href="holistische-bodyscan.html">Holistische Bodyscan</a></li>
        <li><a href="mycotherapie.html">Mycotherapie</a></li>
        <li><a href="qm-hypnose.html">QM Hypnose</a></li>
        <li><a href="biofotonentherapie.html">Biofotonentherapie</a></li>
      </ul>
    </nav>
    <section class="footer-col" aria-labelledby="footer-contact">
      <h2 class="footer-heading heading-cream" id="footer-contact">Contact</h2>
      <address>
        <ul>
          <li><a href="mailto:info@reconnectandbalance.com">info@reconnectandbalance.com</a></li>
          <li><a href="tel:+31627977530">+31 6 27 97 75 30</a></li>
          <li><a href="https://wa.me/31627977530">WhatsApp</a></li>
        </ul>
      </address>
    </section>
    <nav class="footer-col" aria-label="Socials">
      <h2 class="footer-heading">Socials</h2>
      <ul>
        <li><a href="https://www.facebook.com/reconnectandbalance/" target="_blank" rel="noopener">Facebook</a></li>
        <li><a href="http://linkedin.com/in/linda-vos-95005610b" target="_blank" rel="noopener">LinkedIn</a></li>
      </ul>
    </nav>
    <p class="footer-bottom">
      <span>© ${new Date().getFullYear()} Reconnect &amp; Balance</span>
      <span>Made in NL by <a href="https://lychees.studio" target="_blank" rel="noopener">Lychees.studio</a></span>
    </p>
  </div>
</footer>

<script src="main.js"></script>
</body>
</html>
`;

async function downloadImages(html) {
  fs.mkdirSync(IMG_OUT, { recursive: true });
  const urls = [...new Set(html.match(OLD_UPLOADS) || [])];
  for (const url of urls) {
    const dest = path.join(IMG_OUT, path.basename(url));
    if (fs.existsSync(dest)) continue;
    const res = await fetch(url);
    if (!res.ok) { console.warn('  ! niet gevonden:', url); continue; }
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log('  afbeelding:', path.basename(url));
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const asset of ['style.css', 'main.js']) fs.copyFileSync(path.join(ROOT, 'src', asset), path.join(OUT, asset));

  for (const file of fs.readdirSync(PAGES).filter(f => f.endsWith('.html'))) {
    let src = fs.readFileSync(path.join(PAGES, file), 'utf8');
    const meta = src.match(/^<!--\s*title:\s*(.*?)\s*\|\s*(.*?)\s*-->/);
    if (!meta) throw new Error(`${file}: eerste regel moet <!-- title: ... | ... --> zijn`);
    src = src.slice(meta[0].length);
    let html = template(file, meta[1], meta[2], src.trim());
    await downloadImages(html);
    html = html.replace(OLD_UPLOADS, url => `img/${path.basename(url)}`);
    fs.writeFileSync(path.join(OUT, file), html);
    console.log('pagina:', file);
  }
})();
