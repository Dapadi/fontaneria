type EventName = 'whatsapp' | 'call' | 'quote_click' | 'form_submit';
type EventData = { event: EventName; page: string };
declare global {
  interface Window {
    fontaneriaAnalytics?: {
      hasConsent: () => boolean;
      track: (event: EventData) => void;
    };
  }
}
export function track(event: EventName) {
  // Inactive unless a reviewed consent and analytics integration is explicitly installed.
  try {
    const integration = window.fontaneriaAnalytics;
    if (integration?.hasConsent() === true) integration.track({ event, page: location.pathname });
  } catch {
    // Analytics failures must never interrupt navigation or contact.
  }
}
export function analytics() {
  document.addEventListener('click', e => {
    if (!(e.target instanceof Element)) return;
    const event = e.target.closest<HTMLElement>('[data-event]')?.dataset.event;
    if (event === 'whatsapp' || event === 'call' || event === 'quote_click') track(event);
  });
}
