// Menu (mobiel), dropdowns, scroll-animaties en het contactformulier
const burger = document.querySelector('.burger');
const menu = document.getElementById('menu');
// Pas na het laden vloeiend scrollen, anders animeert het herstellen van de positie bij een refresh
window.addEventListener('load', () => setTimeout(() => document.documentElement.classList.add('ready'), 100));

const header = document.querySelector('.site-header');
const setHeader = () => header.classList.toggle('scrolled', window.scrollY > 10 || menu.classList.contains('open'));
window.addEventListener('scroll', setHeader, { passive: true });
setHeader();

burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
  setHeader();
});

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
document.querySelectorAll('form.contact-form').forEach(form => {
  const status = form.querySelector('.form-status');
  const btn = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (form.querySelector('[name="_gotcha"]').value) return;
    btn.disabled = true;
    btn.textContent = 'Versturen…';
    status.textContent = '';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) {
        form.innerHTML = '<p class="form-thanks">Bedankt voor je bericht!</p><p>Ik neem zo snel mogelijk contact met je op.</p>';
        form.setAttribute('tabindex', '-1');
        form.focus();
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
