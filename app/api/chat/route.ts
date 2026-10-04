import { NextResponse } from "next/server";
import { systemPrompt } from "@/content/bot";
import { clientIp, hashIp, isSessionId, logChat } from "@/lib/db";

// Limite simple par visiteur (en mémoire : protection de base, pas absolue).
const hits = new Map<string, { n: number; t: number }>();
const WINDOW = 10 * 60_000;
const MAX = 20;

export async function POST(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const h = hits.get(ip);
  if (h && now - h.t < WINDOW) {
    if (h.n >= MAX) return NextResponse.json({ reply: "Trop de messages pour le moment. Écrivez-moi sur WhatsApp." }, { status: 429 });
    h.n++;
  } else hits.set(ip, { n: 1, t: now });

  let body: { sessionId?: unknown; messages?: { role?: string; content?: unknown }[] };
  try { body = await req.json(); } catch { return NextResponse.json({ reply: "Message invalide." }, { status: 400 }); }
  const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-6).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, 500),
  }));
  if (!msgs.length) return NextResponse.json({ reply: "Posez-moi une question." }, { status: 400 });

  // Historique : on enregistre la question du visiteur, puis la réponse du bot.
  const sid = isSessionId(body.sessionId) ? body.sessionId : null;
  const meta = { ipHash: hashIp(ip), userAgent: req.headers.get("user-agent") ?? undefined };
  const last = msgs[msgs.length - 1];
  if (sid && last.role === "user") await logChat(sid, "user", last.content, meta);

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return NextResponse.json({ reply: "Le chat n'est pas encore activé. Écrivez-moi sur WhatsApp." });

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? "qwen/qwen3-4b:free",
        max_tokens: 300,
        temperature: 0.4,
        messages: [{ role: "system", content: systemPrompt }, ...msgs],
      }),
    });
    const data = await r.json();
    const raw: string | undefined = data?.choices?.[0]?.message?.content;
    const reply = raw?.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (reply && sid) await logChat(sid, "assistant", reply, meta);
    return NextResponse.json({ reply: reply || "Je n'ai pas pu répondre. Écrivez-moi sur WhatsApp." });
  } catch {
    return NextResponse.json({ reply: "Connexion impossible. Écrivez-moi sur WhatsApp." });
  }
}
