import { NextResponse } from "next/server";
import { systemPrompt } from "@/content/bot";
import { clientIp, hashIp, isSessionId, logChat } from "@/lib/db";

// Limite simple par visiteur (en mémoire : protection de base, pas absolue).
const hits = new Map<string, { n: number; t: number }>();
const WINDOW = 10 * 60_000;
const MAX = 20;

type ChatMessage = { role?: string; content?: unknown };
type ProviderResponse = {
  choices?: Array<{ message?: { content?: unknown } }>;
  error?: { message?: string };
};
type PromptMessage = { role: "system" | "user" | "assistant"; content: string };

function unavailableReply(configured: boolean): string {
  if (!configured) {
    return "L’assistant IA de Cicinho n’est pas encore configuré. Vous pouvez découvrir son parcours, ses projets et ses services dans les sections du portfolio. Pour parler d’un projet, utilisez le formulaire Contact ou écrivez-lui sur WhatsApp.";
  }
  return "Je ne peux pas générer une réponse personnalisée pour le moment. Vous pouvez consulter les sections CV, Projets et Services du portfolio. Pour une demande, contactez Cicinho sur WhatsApp ou via le formulaire Contact.";
}

function rateLimitReply(): string {
  return "Le chat a reçu beaucoup de questions récemment et fait une courte pause. Vous pouvez découvrir le parcours, les projets et les services dans le portfolio. Pour une demande urgente, contactez Cicinho sur WhatsApp ou via le formulaire Contact.";
}

function extractReply(data: ProviderResponse): string {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "string" ? part : (part as { text?: unknown })?.text))
      .filter((part): part is string => typeof part === "string")
      .join("\n")
      .replace(/<think>[\s\S]*?<\/think>/g, "")
      .trim();
  }
  return "";
}

function sentenceParts(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]+(?:[”\"’')\]]*)|[^.!?]+$/g) ?? [])
    .map((part) => part.trim())
    .filter(Boolean);
}

function conciseReply(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  const sentences = sentenceParts(compact);
  return sentences.length > 5 ? sentences.slice(0, 5).join(" ") : compact;
}

async function requestOpenRouter(apiKey: string, model: string, messages: PromptMessage[]) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.PUBLIC_SITE_URL ?? "https://portfolio-85y757ims-fenoproject.vercel.app",
      "X-Title": "Portfolio Cicinho Feno",
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      temperature: 0.65,
      messages,
    }),
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });
  const data = (await response.json()) as ProviderResponse;
  if (!response.ok) {
    console.error("OpenRouter chat error:", data.error?.message ?? `HTTP ${response.status}`);
    return "";
  }
  return extractReply(data);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const hit = hits.get(ip);
  if (hit && now - hit.t < WINDOW) {
    if (hit.n >= MAX) return NextResponse.json({ reply: rateLimitReply(), source: "fallback" }, { status: 429 });
    hit.n++;
  } else {
    hits.set(ip, { n: 1, t: now });
  }

  let body: { sessionId?: unknown; messages?: ChatMessage[] };
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object") throw new Error("invalid body");
    body = parsed as { sessionId?: unknown; messages?: ChatMessage[] };
  } catch {
    return NextResponse.json({ reply: "Je n’ai pas compris le format de votre message. Posez une question sur le parcours, les projets ou les services de Cicinho. Je vous orienterai vers les bonnes informations du portfolio." }, { status: 400 });
  }

  const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-6).map((message) => ({
    role: message.role === "assistant" ? "assistant" as const : "user" as const,
    content: String(message.content ?? "").slice(0, 500),
  }));
  if (!msgs.length || !msgs.some((message) => message.role === "user")) {
    return NextResponse.json({ reply: "Posez votre question sur le parcours, les projets ou les services de Cicinho. L’assistant IA vous répondra à partir des informations du portfolio. Vous pouvez aussi consulter directement ses sections CV et Projets." }, { status: 400 });
  }

  const sid = isSessionId(body.sessionId) ? body.sessionId : null;
  const meta = { ipHash: hashIp(ip), userAgent: req.headers.get("user-agent") ?? undefined };
  const lastUserMessage = [...msgs].reverse().find((message) => message.role === "user");
  if (sid && lastUserMessage) await logChat(sid, "user", lastUserMessage.content, meta);

  const apiKey = process.env.OPENROUTER_API_KEY;
  const fallback = unavailableReply(Boolean(apiKey));
  if (!apiKey) {
    if (sid) await logChat(sid, "assistant", fallback, meta);
    return NextResponse.json({ reply: fallback, source: "fallback" }, { status: 503 });
  }

  const model = process.env.OPENROUTER_MODEL ?? "qwen/qwen3-4b:free";
  const prompt: PromptMessage[] = [{ role: "system", content: systemPrompt }, ...msgs];

  try {
    const rawReply = await requestOpenRouter(apiKey, model, prompt);
    let reply = conciseReply(rawReply);
    let count = sentenceParts(reply).length;

    // If the model ignored the 3-sentence minimum, ask it to reformulate once.
    if (count > 0 && count < 3) {
      const reformulation: PromptMessage[] = [
        { role: "system", content: `${systemPrompt}\n\nFormat obligatoire : reformule la réponse en exactement 3 phrases courtes.` },
        ...msgs,
        { role: "assistant", content: rawReply },
        { role: "user", content: "Reformule ta réponse précédente en exactement trois phrases courtes, claires et naturelles. Garde uniquement les faits pertinents du portfolio, sans liste." },
      ];
      const revised = await requestOpenRouter(apiKey, model, reformulation);
      if (revised) reply = conciseReply(revised);
      count = sentenceParts(reply).length;
    }

    const finalReply = count >= 3 && count <= 5 ? reply : fallback;
    if (sid) await logChat(sid, "assistant", finalReply, meta);
    return NextResponse.json({ reply: finalReply, source: finalReply === fallback ? "fallback" : "ai" });
  } catch (error) {
    console.error("OpenRouter connection error:", error instanceof Error ? error.name : "unknown error");
    if (sid) await logChat(sid, "assistant", fallback, meta);
    return NextResponse.json({ reply: fallback, source: "fallback" });
  }
}
