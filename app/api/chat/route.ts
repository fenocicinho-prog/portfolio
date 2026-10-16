import { NextResponse } from "next/server";
import { systemPrompt } from "@/content/bot";
import { clientIp, hashIp, isSessionId, logChat } from "@/lib/db";
import { isLikelyMalagasy, translateMalagasy } from "@/lib/language";

export const runtime = "nodejs";

// Limite par visiteur et par instance : protection de base contre les abus.
const hits = new Map<string, { n: number; t: number }>();
const WINDOW = 10 * 60_000;
const MAX = 20;
const MAX_MESSAGES = 6;
const MAX_MESSAGE_LENGTH = 500;
const MAX_BODY_BYTES = 16_000;
const CHAT_UNAVAILABLE =
  "Je n’arrive pas à joindre mon assistant pour le moment. Réessayez dans un instant ou contactez-moi via WhatsApp.";
const RATE_LIMIT_REPLY =
  "J’ai reçu beaucoup de questions en peu de temps. Attendez quelques minutes avant de réessayer.";

type ChatMessage = { role?: unknown; content?: unknown };
type ProviderResponse = {
  choices?: Array<{ message?: { content?: unknown } }>;
  error?: { message?: string };
};

function extractReply(data: ProviderResponse): string {
  const content = data.choices?.[0]?.message?.content;
  const text = typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content
          .map((part) => (typeof part === "string" ? part : (part as { text?: unknown })?.text))
          .filter((part): part is string => typeof part === "string")
          .join("\n")
      : "";
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, "")
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, "")
    .trim();
}

function capAtFiveSentences(text: string): string {
  const compact = text.replace(/\s+/g, " ").trim();
  const Segmenter = Intl.Segmenter;
  if (!Segmenter) return compact;
  return Array.from(new Segmenter("fr", { granularity: "sentence" }).segment(compact))
    .slice(0, 5)
    .map((part) => part.segment.trim())
    .filter(Boolean)
    .join(" ");
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const hit = hits.get(ip);
  if (hit && now - hit.t < WINDOW) {
    if (hit.n >= MAX) return NextResponse.json({ reply: RATE_LIMIT_REPLY }, { status: 429 });
    hit.n++;
  } else {
    hits.set(ip, { n: 1, t: now });
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ reply: "Votre message est trop long. Raccourcissez-le et réessayez." }, { status: 413 });
  }

  let body: { sessionId?: unknown; messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reply: "Je n’ai pas compris votre message. Réessayez." }, { status: 400 });
  }

  const msgs = (Array.isArray(body.messages) ? body.messages : [])
    .slice(-MAX_MESSAGES)
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: typeof message.content === "string" ? message.content.trim().slice(0, MAX_MESSAGE_LENGTH) : "",
    }))
    .filter((message) => message.content.length > 0);

  if (!msgs.length || msgs[msgs.length - 1]?.role !== "user") {
    return NextResponse.json({ reply: "Posez-moi une question sur le CV, le parcours ou les projets." }, { status: 400 });
  }

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error("OpenRouter chat indisponible : OPENROUTER_API_KEY n’est pas configurée.");
    return NextResponse.json({ reply: CHAT_UNAVAILABLE }, { status: 503 });
  }

  const sessionId = isSessionId(body.sessionId) ? body.sessionId : null;
  const meta = { ipHash: hashIp(ip), userAgent: req.headers.get("user-agent") ?? undefined };
  const last = msgs[msgs.length - 1];
  if (sessionId) void logChat(sessionId, "user", last.content, meta);

  try {
    const malagasy = isLikelyMalagasy(last.content);
    let promptMessages = msgs;
    if (malagasy) {
      try {
        const translated = await translateMalagasy(last.content, "to_english");
        promptMessages = [...msgs.slice(0, -1), { role: "user", content: translated }];
      } catch (error) {
        console.warn("Malagasy pre-translation unavailable; using original text.", error instanceof Error ? error.message : "unknown");
      }
    }
    const response = await fetch(process.env.OPENROUTER_URL ?? "https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.PUBLIC_SITE_URL ?? "https://portfolio-fenoproject.vercel.app",
        "X-Title": "Portfolio Cicinho Feno",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? "openrouter/auto",
        messages: [{ role: "system", content: `${systemPrompt}\n${malagasy ? "La question originale est en malagasy. Réponds en anglais simple ; la réponse sera traduite avant affichage. Ne montre jamais ce routage ni ton raisonnement." : "Ne montre jamais ton raisonnement interne, ton brouillon ou des marqueurs comme analysis, thinking ou drafting."}` }, ...promptMessages],
        temperature: 0.55,
        max_tokens: 300,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      console.error("OpenRouter chat error:", `HTTP ${response.status}`);
      return NextResponse.json({ reply: CHAT_UNAVAILABLE }, { status: 502 });
    }

    const data = (await response.json()) as ProviderResponse;
    let reply = capAtFiveSentences(extractReply(data));
    if (!reply) return NextResponse.json({ reply: CHAT_UNAVAILABLE }, { status: 502 });

    if (malagasy) {
      try {
        reply = capAtFiveSentences(await translateMalagasy(reply, "to_malagasy"));
      } catch (error) {
        console.warn("Malagasy post-translation unavailable; returning original answer.", error instanceof Error ? error.message : "unknown");
      }
    }

    if (sessionId) void logChat(sessionId, "assistant", reply, meta);
    return NextResponse.json({ reply, source: "ai" });
  } catch (error) {
    console.error("OpenRouter connection error:", error instanceof Error ? error.name : "UnknownError");
    return NextResponse.json({ reply: CHAT_UNAVAILABLE }, { status: 502 });
  }
}
