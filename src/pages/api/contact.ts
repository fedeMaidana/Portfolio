import type { APIRoute } from 'astro';
import { CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, RESEND_API_KEY } from 'astro:env/server';
import { Resend } from 'resend';
import { z } from 'zod';

export const prerender = false;

const ContactSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(150),
    message: z.string().trim().min(1).max(5000),
    botcheck: z.string().optional(),
});

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

const safeHeader = (value: string): string => value.replace(/[\r\n]+/g, ' ').slice(0, 150);

const json = (body: Record<string, unknown>, status: number): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

export const POST: APIRoute = async ({ request }) => {
    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return json({ success: false, error: 'Cuerpo de la solicitud inválido.' }, 400);
    }

    const parsed = ContactSchema.safeParse(payload);
    if (!parsed.success) {
        return json({ success: false, error: 'Revisá los campos e intentá de nuevo.' }, 422);
    }

    const { name, email, message, botcheck } = parsed.data;

    if (botcheck) return json({ success: true }, 200);

    const resend = new Resend(RESEND_API_KEY);

    const { error } = await resend.emails.send({
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        replyTo: email,
        subject: safeHeader(`Nuevo mensaje de ${name}`),
        text: `Nombre: ${name}\nCorreo: ${email}\n\n${message}`,
        html: [
            '<h2>Nuevo mensaje desde maidana.dev</h2>',
            `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p>`,
            `<p><strong>Correo:</strong> ${escapeHtml(email)}</p>`,
            '<p><strong>Mensaje:</strong></p>',
            `<p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
        ].join(''),
    });

    if (error) {
        return json({ success: false, error: 'No se pudo enviar el mensaje.' }, 502);
    }

    return json({ success: true }, 200);
};
