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

// Het formulier opent het e-mailprogramma van de bezoeker met het bericht al ingevuld
document.querySelectorAll('form.mail-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const keuze = d.get('behandeling');
    const intro = keuze ? `Behandeling: ${keuze}\n\n` : '';
    const body = `${intro}${d.get('bericht')}\n\n${d.get('naam')}\n${d.get('email')}\n${d.get('telefoon') || ''}`;
    const subject = keuze ? `${keuze}: bericht via de website` : form.dataset.subject || 'Bericht via de website';
    location.href = `mailto:info@reconnectandbalance.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
});
