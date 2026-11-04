// Menu (mobiel), dropdowns, scroll-animaties en het contactformulier
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
// Pas na het laden vloeiend scrollen, anders animeert het herstellen van de positie bij een refresh
window.addEventListener('load', () => setTimeout(() => document.documentElement.classList.add('ready'), 100));

const header = document.querySelector('.site-header');
const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 10 || menu.classList.contains('open'));
window.addEventListener('scroll', setHeader, { passive: true });
setHeader();

// Met het menu open blijft de focus in het menu; de pagina erachter is dan niet bereikbaar
const achterMenu = document.querySelectorAll('.skip, main, footer');
const menuItems = () => [...menu.querySelectorAll('a, button')].filter(el => el.offsetParent);
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  achterMenu.forEach(el => { el.inert = open; });
  if (open) menuItems()[0]?.focus();
  setHeader();
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !menu.classList.contains('open')) return;
  const items = menuItems();
  if (!e.shiftKey && document.activeElement === burger) { e.preventDefault(); items[0]?.focus(); }
  else if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); burger.focus(); }
});
// Breder venster: geen mobiel menu meer, dus ook geen afgesloten pagina
window.addEventListener('resize', () => { if (window.innerWidth > 940 && menu.classList.contains('open')) burger.click(); });

document.querySelectorAll('.dropdown').forEach(dd => {
  // Na Escape blijft het menu dicht tot de muis of focus de dropdown verlaat
  const reopen = () => dd.classList.remove('closed');
  dd.addEventListener('mouseleave', reopen);
  dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) reopen(); });
});
document.querySelectorAll('.dropdown-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const dd = btn.parentElement;
    dd.classList.remove('closed');
    const open = dd.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    document.querySelectorAll('.dropdown.open').forEach(o => { if (o !== dd) o.classList.remove('open'); });
  });
});
// Escape sluit open dropdowns en het mobiele menu
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll('.dropdown.open,.dropdown:focus-within,.dropdown:hover').forEach(dd => {
    dd.classList.remove('open');
    dd.classList.add('closed');
    const btn = dd.querySelector('.dropdown-toggle');
    btn.setAttribute('aria-expanded', false);
    if (dd.contains(document.activeElement)) btn.focus();
  });
  if (menu.classList.contains('open')) { burger.click(); burger.focus(); }
});
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown') && window.innerWidth > 940) {
    document.querySelectorAll('.dropdown.open').forEach(o => o.classList.remove('open'));
  }
});

const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Het contactformulier verstuurt via de Worker (worker/), met Turnstile tegen spam
const MAIL_FALLBACK = 'Versturen lukt nu niet. Mail ons gerust op <a href="mailto:info@reconnectandbalance.com">info@reconnectandbalance.com</a>.';
// Concept blijft bewaard in de browser van de bezoeker, zodat een refresh niets wist
const CONCEPT = 'contact-concept';
const CONCEPT_VELDEN = ['naam', 'email', 'telefoon', 'behandeling', 'bericht'];
const conceptLezen = () => { try { return JSON.parse(localStorage.getItem(CONCEPT)) || {}; } catch { return {}; } };
const conceptOpslaan = form => {
  try { localStorage.setItem(CONCEPT, JSON.stringify(Object.fromEntries(CONCEPT_VELDEN.map(n => [n, form.elements[n].value])))); } catch {}
};
const conceptWissen = () => { try { localStorage.removeItem(CONCEPT); } catch {} };

// Na verzenden: de hele kaart (titel en formulier) maakt plaats voor een duidelijke bevestiging
function toonSucces(form, email) {
  const kaart = form.closest('.form-card') || form;
  kaart.classList.add('form-success');
  kaart.innerHTML = `
    <span class="success-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
    <h2 class="contact-title" tabindex="-1">Bericht verstuurd</h2>
    <p>Bedankt! Je bericht is goed aangekomen. Linda neemt zo snel mogelijk contact met je op via <strong class="success-mail"></strong>.</p>
    <div class="actions"><a href="index.html" class="btn btn-gold">Terug naar home</a></div>`;
  kaart.querySelector('.success-mail').textContent = email;
  kaart.querySelector('h2').focus();
}

document.querySelectorAll('form.contact-form').forEach(form => {
  const status = form.querySelector('.form-status');
  const btn = form.querySelector('button[type="submit"]');
  const concept = conceptLezen();
  CONCEPT_VELDEN.forEach(n => { if (typeof concept[n] === 'string') form.elements[n].value = concept[n]; });
  form.addEventListener('input', () => conceptOpslaan(form));
  form.addEventListener('change', () => conceptOpslaan(form));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.querySelector('[name="_gotcha"]').value) return;
    btn.disabled = true;
    btn.textContent = 'Versturen…';
    status.textContent = '';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) {
        conceptWissen();
        toonSucces(form, form.elements.email.value);
        return;
      }
      const data = await res.json().catch(() => null);
      if (data?.errors?.[0]?.message) status.textContent = data.errors[0].message;
      else status.innerHTML = MAIL_FALLBACK;
    } catch {
      status.innerHTML = MAIL_FALLBACK;
    }
    window.turnstile?.reset(); // een token werkt maar één keer
    btn.disabled = false;
    btn.textContent = 'Versturen';
  });
});
