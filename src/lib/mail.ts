// src/lib/mail.ts
import "server-only";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || "Beatmemo <no-reply@beatmemo.com.ar>";

interface MailInput { to: string; subject: string; html: string; text?: string }

/** Best-effort: nunca tira. Si falla, logueamos y seguimos. */
export async function sendMail({ to, subject, html }: MailInput): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[mail] RESEND_API_KEY sin configurar; se omite el envío a", to);
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo: "info@beatmemo.com", // respuestas a un buzón real de Ferozo
    });
    if (error) { console.error("[mail] Resend:", error); return false; }
    return true;
  } catch (e) {
    console.error("[mail] falló el envío a", to, e);
    return false;
  }
}