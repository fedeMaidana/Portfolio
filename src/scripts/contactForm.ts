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

interface FieldErrors {
    name: string;
    emailRequired: string;
    emailInvalid: string;
    message: string;
}

const ERRORS: Record<Lang, FieldErrors> = {
    es: {
        name: 'Ingresá tu nombre.',
        emailRequired: 'Ingresá tu correo.',
        emailInvalid: 'Ingresá un correo válido.',
        message: 'Escribí tu mensaje.',
    },
    en: {
        name: 'Enter your name.',
        emailRequired: 'Enter your email.',
        emailInvalid: 'Enter a valid email.',
        message: 'Write your message.',
    },
    fr: {
        name: 'Saisissez votre nom.',
        emailRequired: 'Saisissez votre e-mail.',
        emailInvalid: 'Saisissez un e-mail valide.',
        message: 'Écrivez votre message.',
    },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FIELDS = ['name', 'email', 'message'] as const;
type FieldName = (typeof FIELDS)[number];

type FieldInput = HTMLInputElement | HTMLTextAreaElement;

function pageLang(): Lang {
    const lang = document.documentElement.lang;
    return lang === 'en' || lang === 'fr' ? lang : 'es';
}

function setStatus(el: HTMLElement | null, kind: '' | 'ok' | 'error', message: string): void {
    if (!el) return;
    el.textContent = message;
    el.dataset.kind = kind;
}

function fieldEls(
    form: HTMLFormElement,
    name: FieldName
): { input: FieldInput; error: HTMLElement } | null {
    const input = form.querySelector<FieldInput>(`[name="${name}"]`);
    const error = form.querySelector<HTMLElement>(`#cf-${name}-error`);
    return input && error ? { input, error } : null;
}

function errorFor(input: FieldInput, errors: FieldErrors): string {
    const value = input.value.trim();
    switch (input.name) {
        case 'name':
            return value ? '' : errors.name;
        case 'email':
            if (!value) return errors.emailRequired;
            return EMAIL_RE.test(value) ? '' : errors.emailInvalid;
        case 'message':
            return value ? '' : errors.message;
        default:
            return '';
    }
}

function setFieldError(input: FieldInput, error: HTMLElement, msg: string): void {
    if (msg) {
        input.setAttribute('aria-invalid', 'true');
        error.textContent = msg;
    } else {
        input.removeAttribute('aria-invalid');
        error.textContent = '';
    }
}

function isFormValid(form: HTMLFormElement): boolean {
    const errors = ERRORS[pageLang()];
    return FIELDS.every((name) => {
        const els = fieldEls(form, name);
        return els ? errorFor(els.input, errors) === '' : true;
    });
}

function updateButtonState(form: HTMLFormElement): void {
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!button) return;
    button.setAttribute('aria-disabled', isFormValid(form) ? 'false' : 'true');
}

function validateForm(form: HTMLFormElement): boolean {
    const errors = ERRORS[pageLang()];
    let firstInvalid: FieldInput | null = null;

    for (const name of FIELDS) {
        const els = fieldEls(form, name);
        if (!els) continue;
        const msg = errorFor(els.input, errors);
        setFieldError(els.input, els.error, msg);
        if (msg && !firstInvalid) firstInvalid = els.input;
    }

    firstInvalid?.focus();
    return firstInvalid === null;
}

function clearErrors(form: HTMLFormElement): void {
    for (const name of FIELDS) {
        const els = fieldEls(form, name);
        if (els) setFieldError(els.input, els.error, '');
    }
}

async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const status = form.querySelector<HTMLElement>('.form-status');
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const label = form.querySelector<HTMLElement>('.btn-label');
    if (!button) return;

    if (!validateForm(form)) {
        setStatus(status, '', '');
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
            clearErrors(form);
            updateButtonState(form);
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

    updateButtonState(form);

    for (const name of FIELDS) {
        const els = fieldEls(form, name);
        if (!els) continue;
        els.input.addEventListener('input', () => {
            updateButtonState(form);
            if (els.input.getAttribute('aria-invalid') !== 'true') return;
            setFieldError(els.input, els.error, errorFor(els.input, ERRORS[pageLang()]));
        });
    }
}

initContactForm();
document.addEventListener('astro:page-load', initContactForm);
