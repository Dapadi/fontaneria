import { track } from './analytics';
export function contact() {
  const form = document.querySelector<HTMLFormElement>('#contact-form');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('.form-status')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const fields = [...form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea')];
  const endpoint = form.dataset.endpoint;
  const requested = new URLSearchParams(location.search).get('servicio');
  const select = form.elements.namedItem('service') as HTMLSelectElement;
  if (requested && Array.from(select.options).some(o => o.value === requested)) select.value = requested;
  form.noValidate = true;
  submit.disabled = false;
  for (const field of fields) field.addEventListener('input', () => {
    field.setCustomValidity('');
    field.removeAttribute('aria-invalid');
    status.textContent = '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submit.disabled) return;
    status.textContent = '';
    let invalid: typeof fields[number] | undefined;
    for (const field of fields) {
      const value = field.value.trim();
      field.setCustomValidity('');
      if (['town','name'].includes(field.name) && value.length < 2) field.setCustomValidity('Introduce al menos 2 caracteres.');
      if (field.name === 'message' && value.length < 10) field.setCustomValidity('Describe el problema con al menos 10 caracteres.');
      if (field.name === 'phone' && (!/^\+?[\d ()-]+$/.test(value) || !/^\d{9,15}$/.test(value.replace(/\D/g,'')))) field.setCustomValidity('Introduce un teléfono válido de 9 a 15 dígitos.');
      if (!field.validity.valid) {
        field.setAttribute('aria-invalid','true');
        invalid ||= field;
      } else field.removeAttribute('aria-invalid');
    }
    if (invalid) {
      status.textContent = 'Revisa los campos señalados antes de continuar.';
      invalid.focus();
      invalid.reportValidity();
      return;
    }
    if (!endpoint) {
      status.textContent = 'Validación correcta. Esta versión no envía ni guarda los datos.';
      return;
    }
    submit.disabled = true;
    status.textContent = 'Enviando solicitud…';
    try {
      const payload = new URLSearchParams();
      for (const [key,value] of new FormData(form)) if (typeof value === 'string') payload.set(key, value.trim());
      const response = await fetch(endpoint, {method:'POST',body:payload,headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000),credentials:'same-origin'});
      if (!response.ok || (await response.json())?.ok !== true) throw new Error('Delivery not confirmed');
      form.reset();
      status.textContent = 'Solicitud recibida. Gracias por contarnos qué necesitas.';
      track('form_submit');
    } catch {
      status.textContent = 'No se ha podido confirmar la recepción. Inténtalo de nuevo o usa otro canal de contacto.';
    } finally { submit.disabled = false; }
  });
}
