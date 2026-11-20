export function accordion() {
  document.querySelectorAll<HTMLElement>('[data-accordion]').forEach(group => {
    group.querySelectorAll('details').forEach(detail => {
      detail.addEventListener('toggle', () => {
        if (detail.open) group.querySelectorAll('details[open]').forEach(other => {
          if (other !== detail) (other as HTMLDetailsElement).open = false;
        });
      });
    });
  });
}
