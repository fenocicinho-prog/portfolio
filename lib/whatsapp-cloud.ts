import "server-only";
import { site } from "@/content/site";

export type LeadNotification = {
  id: string;
  name: string;
  whatsapp: string | null;
  email: string | null;
  message: string | null;
};

export type NotificationResult = "sent" | "not-configured" | "failed";

export async function notifyLeadOnWhatsApp(lead: LeadNotification): Promise<NotificationResult> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "portfolio_new_lead";
  const recipient = (process.env.WHATSAPP_ADMIN_TO ?? site.whatsapp).replace(/\D/g, "");
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? "fr";
  const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION ?? "v26.0";

  if (!token || !phoneNumberId || !recipient) return "not-configured";
  if (!/^v\d+\.\d+$/.test(apiVersion) || !/^[a-z0-9_]{1,512}$/.test(templateName)) return "failed";

  const parameters = [
    lead.id,
    lead.name,
    lead.whatsapp || "Non fourni",
    lead.email || "Non fourni",
    lead.message || "Aucun message",
  ].map((text) => ({ type: "text", text: text.slice(0, 1000) }));

  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: `+${recipient}`,
        type: "template",
        template: {
          name: templateName,
          language: { code: language },
          components: [{ type: "body", parameters }],
        },
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("WhatsApp lead notification failed with status", response.status);
      return "failed";
    }
    return "sent";
  } catch {
    console.error("WhatsApp lead notification failed before acceptance");
    return "failed";
  }
}
