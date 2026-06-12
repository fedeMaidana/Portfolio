const ENDPOINT = '/api/contact';

interface ContactResponse {
    success?: boolean;
    error?: string;
}

type Lang = 'es' | 'en' | 'fr';

const MESSAGES: Record<Lang, { sending: string; ok: string; error: string; network: string }> = {
    es: {
        sending: 'Enviando…',
        ok: '¡Listo! Te respondo en menos de 24h.',
        error: 'No se pudo enviar. Probá de nuevo o escribime por LinkedIn.',
        network: 'Falló la conexión. Revisá tu red e intentá otra vez.',
    },
    en: {
        sending: 'Sending…',
        ok: "Done! I'll get back to you within 24h.",
        error: "Couldn't send the message. Try again or reach me on LinkedIn.",
        network: 'Connection failed. Check your network and try again.',
    },
    fr: {
        sending: 'Envoi…',
        ok: 'C’est fait ! Je vous réponds en moins de 24h.',
        error: 'Échec de l’envoi. Réessayez ou écrivez-moi sur LinkedIn.',
        network: 'La connexion a échoué. Vérifiez votre réseau et réessayez.',
    },
};

function pageLang(): Lang {
    const lang = document.documentElement.lang;
    return lang === 'en' || lang === 'fr' ? lang : 'es';
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

    const messages = MESSAGES[pageLang()];
    const originalLabel = label?.textContent ?? '';
    const payload = Object.fromEntries(new FormData(form).entries());

    setStatus(status, '', '');
    button.disabled = true;
    if (label) label.textContent = messages.sending;

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
            setStatus(status, 'ok', messages.ok);
        } else {
            setStatus(status, 'error', messages.error);
        }
    } catch {
        setStatus(status, 'error', messages.network);
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
