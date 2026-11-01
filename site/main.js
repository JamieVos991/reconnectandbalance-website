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

document.querySelectorAll('.dropdown-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const dd = btn.parentElement;
    const open = dd.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    document.querySelectorAll('.dropdown.open').forEach(o => { if (o !== dd) o.classList.remove('open'); });
  });
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
