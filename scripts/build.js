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

const SHOP = 'https://reconnectandbalance.com/winkel';
const products = {
  argan: [
    { name: 'Arganolie', url: `${SHOP}/arganolieen/arganolie/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/A_2_VB-300x300.jpeg', price: '€ 29,95' },
    { name: '2x Arganolie', url: `${SHOP}/arganolieen/2x-arganolie/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/A_1.2_VB-300x300.jpg', price: '€ 54,95', was: '€ 59,90' },
    { name: '3x Arganolie', url: `${SHOP}/arganolieen/3x-arganolie/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/A_1.3_VB-scaled-1-300x300.jpg', price: '€ 79,95', was: '€ 89,85' },
    { name: 'Arganolie Culinair', url: `${SHOP}/arganolieen/arganolie-culinair/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/C_argan_bewerkt2-scaled-1-300x300.jpg', price: '€ 24,95' },
  ],
  cactus: [
    { name: 'Cactusolie', url: `${SHOP}/cactusolieen/cactusolie/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/C_2_VB-300x300.jpeg', price: '€ 49,95' },
    { name: 'Cactuspoeder', url: `${SHOP}/nopal-poeder/cactuspoeder/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/CP_VB_2-300x300.jpg', price: '€ 22,95' },
  ],
  tincturen: [
    { name: 'Lion’s Mane Tinctuur', url: `${SHOP}/tincturen/lions-mane-tinctuur/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/terracottatcm-tictuur-lions_mane.png-300x300.webp', price: '€ 24,95' },
    { name: 'Reishi Tinctuur', url: `${SHOP}/tincturen/reishi-tinctuur/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/terracottatcm-tictuur-reishi.png-300x300.webp', price: '€ 24,95' },
    { name: 'Times Five Tinctuur', url: `${SHOP}/tincturen/times-five-tinctuur/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/terracottatcm-tictuur-times-five.png-300x300.webp', price: '€ 24,95' },
    { name: 'Cordyceps Tinctuur', url: `${SHOP}/tincturen/cordyceps-tinctuur/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/terracottatcm-tictuur-cordyceps.png-300x300.webp', price: '€ 24,95' },
    { name: 'Chaga Tinctuur', url: `${SHOP}/tincturen/chaga-tinctuur/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/terracottatcm-tictuur-chaga.png-300x300.webp', price: '€ 24,95' },
  ],
  supplementen: [
    { name: 'Hormone Harmony', url: `${SHOP}/voedingssupplement/hormone-harmony/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/Hormone-Harmony-bottle-mockup.png-300x300.webp', price: '€ 49,95' },
    { name: 'Relax', url: `${SHOP}/voedingssupplement/relax/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/Relax-bottle-mockup.png-300x300.webp', price: '€ 49,95' },
    { name: 'Shou Xing', url: `${SHOP}/voedingssupplement/shou-xing/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/Shou-Xing-bottle-mockup.png-300x300.webp', price: '€ 55,00 – € 99,00' },
    { name: 'Amitabha', url: `${SHOP}/voedingssupplement/amitabha/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/Amitabha-bottle-mockup.png-300x300.webp', price: '€ 55,00 – € 99,00' },
    { name: 'Bodhi Zhi', url: `${SHOP}/voedingssupplement/bodhi-zhi/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/BodhiZhi-bottle-mockup.png-300x300.webp', price: '€ 55,00 – € 99,00' },
    { name: 'Rockstar', url: `${SHOP}/voedingssupplement/rockstar/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/Rockstar-bottle-mockup.png-300x300.webp', price: '€ 55,00 – € 99,00' },
    { name: 'Xi’An', url: `${SHOP}/voedingssupplement/xian/`, img: 'https://reconnectandbalance.com/wp-content/uploads/2024/07/Xian-bottle-mockup.png-300x300.webp', price: '€ 55,00 – € 99,00' },
  ],
};
products.nopal = [products.cactus[1]];

const productGrid = list => `<div class="product-grid">${list.map(p => `
  <a class="product" href="${p.url}">
    ${p.was ? '<span class="badge">Aanbieding!</span>' : ''}
    <div class="product-img"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
    <div class="product-info">
      <h3>${p.name}</h3>
      <p class="price">${p.was ? `<del>${p.was}</del> ` : ''}${p.price}</p>
      <span class="more">Bekijk product</span>
    </div>
  </a>`).join('')}
</div>`;

const nav = [
  { label: 'Behandelingen', children: [
    { href: 'holistische-bodyscan.html', label: 'Holistische Bodyscan' },
    { href: 'mycotherapie.html', label: 'Mycotherapie' },
    { href: 'qm-hypnose.html', label: 'QM Hypnose' },
  ] },
  { href: 'linda-vos.html', label: 'Linda' },
  { label: 'Huidverzorging', children: [
    { href: 'arganolie.html', label: 'Arganolie' },
    { href: 'cactusolie.html', label: 'Cactusolie' },
    { href: 'nopal-cactuspoeder.html', label: 'Nopal cactuspoeder' },
  ] },
  { href: 'opleidingen.html', label: 'Opleidingen' },
  { href: 'winkel.html', label: 'Shop' },
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
  return nav.map(item).join('\n      ') + `\n      <a href="contact.html" class="btn btn-line">Afspraak maken</a>`;
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
<body>

<header class="site-header">
  <div class="wrap nav">
    <a href="index.html" class="brand"><img src="https://reconnectandbalance.com/wp-content/uploads/2024/06/Logo_RB_wit_1.png" alt="Reconnect &amp; Balance"></a>
    <nav class="menu" id="menu" aria-label="Hoofdmenu">
      ${renderNav(file)}
    </nav>
    <a href="https://reconnectandbalance.com/winkelwagen/" class="cart" aria-label="Winkelwagen"><svg viewBox="0 0 24 24"><path d="M3 4h2l2.4 11h11.2L21 8H6.2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg></a>
    <button class="burger" aria-label="Menu openen" aria-controls="menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>

<main>
${body}
</main>

${file === 'index.html' ? '' : `<section class="usp">
  <div class="wrap usp-row">
    <div class="usp-item"><svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg><div><h4>Verzenden</h4><p>Verzending door heel Europa</p></div></div>
    <div class="usp-item"><svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/></svg><div><h4>Garantie</h4><p>Niet goed, geld terug garantie</p></div></div>
    <div class="usp-item"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><div><h4>Contact</h4><p>Persoonlijk contact is altijd mogelijk</p></div></div>
  </div>
</section>`}

<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-about">
      <img class="footer-brand" src="https://reconnectandbalance.com/wp-content/uploads/2024/06/Logo_RB_wit_1.png" alt="Reconnect &amp; Balance">
      <p class="footer-tag">Verbinden met jezelf, je hart, je essentie.<br>Holistische praktijk in Den Haag.</p>
    </div>
    <nav class="footer-col" aria-label="Menu">
      <h3 class="footer-heading">Menu</h3>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="linda-vos.html">Linda Vos</a></li>
        <li><a href="opleidingen.html">Opleidingen</a></li>
        <li><a href="winkel.html">Shop</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
    <nav class="footer-col" aria-label="Aanbod">
      <h3 class="footer-heading heading-sand">Aanbod</h3>
      <ul>
        <li><a href="holistische-bodyscan.html">Holistische Bodyscan</a></li>
        <li><a href="mycotherapie.html">Mycotherapie</a></li>
        <li><a href="qm-hypnose.html">QM Hypnose</a></li>
        <li><a href="arganolie.html">Arganolie</a></li>
        <li><a href="cactusolie.html">Cactusolie</a></li>
        <li><a href="nopal-cactuspoeder.html">Nopal cactuspoeder</a></li>
      </ul>
    </nav>
    <section class="footer-col" aria-labelledby="footer-contact">
      <h3 class="footer-heading heading-cream" id="footer-contact">Contact</h3>
      <address>
        <ul>
          <li><a href="mailto:info@reconnectandbalance.com">info@reconnectandbalance.com</a></li>
          <li><a href="tel:+31627977530">+31 6 27 97 75 30</a></li>
          <li><a href="https://wa.me/31627977530">WhatsApp</a></li>
          <li>Richard Holstraat 63<br>2551 HN Den Haag</li>
        </ul>
      </address>
    </section>
    <nav class="footer-col" aria-label="Socials">
      <h3 class="footer-heading">Socials</h3>
      <ul>
        <li><a href="https://www.facebook.com/reconnectandbalance/" target="_blank" rel="noopener">Facebook</a></li>
        <li><a href="http://linkedin.com/in/linda-vos-95005610b" target="_blank" rel="noopener">LinkedIn</a></li>
      </ul>
    </nav>
    <p class="footer-bottom">
      <span>© ${new Date().getFullYear()} Reconnect &amp; Balance</span>
      <span class="footer-legal"><a href="leveringsvoorwaarden.html">Leveringsvoorwaarden &amp; Privacy</a></span>
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
    src = src.slice(meta[0].length).replace(/<!--\s*products:(\w+)\s*-->/g, (_, key) => productGrid(products[key]));
    let html = template(file, meta[1], meta[2], src.trim());
    await downloadImages(html);
    html = html.replace(OLD_UPLOADS, url => `img/${path.basename(url)}`);
    fs.writeFileSync(path.join(OUT, file), html);
    console.log('pagina:', file);
  }
})();
