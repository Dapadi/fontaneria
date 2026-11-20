export function gallery() {
  document.querySelectorAll<HTMLElement>('[data-compare]').forEach(frame => {
    const range = frame.querySelector<HTMLInputElement>('input[type=range]');
    if (!range) return;
    range.addEventListener('input', () => frame.style.setProperty('--compare',`${range.valueAsNumber}%`));
  });
}
