export function navigation() {
  const header = document.querySelector<HTMLElement>('.header');
  const menu = document.querySelector<HTMLElement>('#menu');
  const trigger = document.querySelector<HTMLButtonElement>('.menu-toggle');
  if (!header || !menu || !trigger) return;
  document.documentElement.classList.add('js-nav');
  const narrow = matchMedia('(max-width: 825px)');
  const setMenu = (open: boolean, focus = false) => {
    menu.dataset.open = String(open);
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (focus) trigger.focus();
  };
  trigger.addEventListener('click', () => setMenu(trigger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', e => {
    if (e.target instanceof Element && e.target.closest('a') && narrow.matches) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.dataset.open === 'true') setMenu(false, true);
  });
  document.addEventListener('pointerdown', e => {
    if (menu.dataset.open === 'true' && e.target instanceof Node && !header.contains(e.target)) setMenu(false);
  });
  narrow.addEventListener('change', () => setMenu(false));
  const progress = header.querySelector<HTMLElement>('.reading span');
  let queued = false;
  const refresh = () => {
    queued = false;
    const position = window.scrollY;
    header.classList.toggle('scrolled', position > (header.classList.contains('scrolled') ? 20 : 42));
    const available = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${available > 0 ? Math.max(0, Math.min(1, position / available)) : 0})`;
  };
  addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(refresh); }
  }, { passive: true });
  addEventListener('resize', refresh, { passive: true });
  refresh();
}
