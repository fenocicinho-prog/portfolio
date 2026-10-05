// Alertes Telegram : le site t'écrit directement sur ton compte à chaque nouvelle demande.
// Variables d'environnement : TELEGRAM_BOT_TOKEN (donné par @BotFather) et TELEGRAM_CHAT_ID (ton identifiant).

export const telegramEnabled = () =>
  Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// N'échoue jamais : un souci Telegram ne doit pas empêcher le visiteur d'envoyer sa demande.
// (On attend la réponse, avec un délai maximum, car sur Vercel une requête non attendue peut être coupée.)
export async function sendTelegram(html: string): Promise<boolean> {
  if (!telegramEnabled()) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: html.slice(0, 4000),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!r.ok) console.error("telegram: refusé par l'API, code", r.status);
    return r.ok;
  } catch {
    console.error("telegram: envoi impossible"); // volontairement sans détail (l'URL contient le token)
    return false;
  }
}

export function leadMessage(l: {
  name: string;
  whatsapp: string | null;
  email: string | null;
  message: string | null;
  saved: boolean;
}): string {
  const site = process.env.PUBLIC_SITE_URL;
  const lines: (string | null)[] = [
    "🔔 <b>Nouvelle demande depuis le portfolio</b>",
    "",
    `👤 <b>${esc(l.name)}</b>`,
    l.whatsapp ? `📱 WhatsApp : <a href="https://wa.me/${l.whatsapp.replace(/\D/g, "")}">${esc(l.whatsapp)}</a>` : null,
    l.email ? `✉️ E-mail : ${esc(l.email)}` : null,
    l.message ? `\n💬 ${esc(l.message)}` : null,
    "",
    l.saved
      ? site ? `✅ Enregistrée · <a href="${site.replace(/\/$/, "")}/admin">Ouvrir l'admin</a>` : "✅ Enregistrée dans l'admin"
      : "⚠️ Non enregistrée en base de données (base injoignable) : garde ce message !",
  ];
  return lines.filter((x) => x !== null).join("\n");
}
