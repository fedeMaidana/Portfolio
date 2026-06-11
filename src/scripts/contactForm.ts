const ENDPOINT = '/api/contact';

interface ContactResponse {
    success?: boolean;
    error?: string;
}

function setStatus(el: HTMLElement | null, kind: '' | 'ok' | 'error', message: string): void {
    if (!el) return;
    el.textContent = message;
    el.dataset.kind = kind;
}

async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const status = form.querySelector<HTMLElement>('.form-status');
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const label = form.querySelector<HTMLElement>('.btn-label');
    if (!button) return;

    // Validación nativa: deja que el navegador marque los campos requeridos.
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const originalLabel = label?.textContent ?? 'Enviar mensaje';
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus(status, '', '');
    button.disabled = true;
    if (label) label.textContent = 'Enviando…';

    try {
        const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = (await res.json()) as ContactResponse;

        if (res.ok && result.success) {
            form.reset();
            setStatus(status, 'ok', '¡Listo! Te respondo en menos de 24h.');
        } else {
            setStatus(
                status,
                'error',
                result.error ?? 'No se pudo enviar. Probá de nuevo o escribime por LinkedIn.'
            );
        }
    } catch {
        setStatus(status, 'error', 'Falló la conexión. Revisá tu red e intentá otra vez.');
    } finally {
        button.disabled = false;
        if (label) label.textContent = originalLabel;
    }
}

function initContactForm(): void {
    const form = document.getElementById('contact-form') as HTMLFormElement | null;
    if (!form || form.dataset.bound === 'true') return;

    form.dataset.bound = 'true';
    form.addEventListener('submit', handleSubmit);
}

initContactForm();
document.addEventListener('astro:page-load', initContactForm);
