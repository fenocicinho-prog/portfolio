import { NextResponse } from "next/server";
import { systemPrompt } from "@/content/bot";
import { cv } from "@/content/cv";
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

function localReply(question: string): string {
  const q = question.toLocaleLowerCase("fr");
  if (/bonjour|salut|bonsoir|hello/.test(q)) {
    return "Bonjour ! Je peux vous présenter le CV, le parcours, les compétences, les projets et les services de Cicinho Feno. Que souhaitez-vous découvrir ?";
  }
  if (/cyber|s[eé]curit[eé] informatique/.test(q)) {
    return cv.cybersecurity;
  }
  if (/udemy/.test(q)) {
    return `${cv.learningSourceNote} Les sujets abordés étaient : ${cv.learning.topics.join(", ")}.`;
  }
  if (/formation|etude|étude|dipl[oô]me|baccalaur/.test(q)) {
    return `Il a obtenu un ${cv.education.title}. Depuis avril 2024, il apprend le développement web via ${cv.learning.provider} : ${cv.learning.topics.join(", ")}. Ce parcours n’est pas présenté comme un diplôme ou une certification.`;
  }
  if (/appris|apprendre|apprentissage|autodidacte|ia|intelligence artificielle/.test(q)) {
    return `${cv.learning.title} via ${cv.learning.provider} : ${cv.learning.topics.join(", ")}. ${cv.selfDirectedLearning}`;
  }
  if (/comp[eé]tence|technolog|stack|langage/.test(q)) {
    return `Ses compétences indiquées dans le CV sont : ${cv.skills.join(", ")}.`;
  }
  if (/force|qualit[eé]|atout/.test(q)) {
    return `Ses forces mises en avant sont : ${cv.strengths.join("; ")}.`;
  }
  if (/projet|portfolio|r[eé]alisation|mini.?copilot|copilot|livre/.test(q)) {
    return `Le CV présente ${cv.projects.map((project) => `${project.name} (${project.status})`).join(", ")}. Les projets sont détaillés dans la section Projets du portfolio.`;
  }
  if (/prix|tarif|co[uû]t|devis/.test(q)) {
    return "Je ne donne pas de tarif automatique. Décrivez votre besoin dans la section Contact ou écrivez directement sur WhatsApp pour recevoir une proposition adaptée.";
  }
  if (/service|cr[eé]er|site|application|r[eé]servation|restaurant|h[oô]tel|entreprise/.test(q)) {
    return "Cicinho crée des sites web, des applications et des outils métier adaptés aux besoins d’une entreprise : présentation, demandes de contact, réservations ou automatisation. Les démos d’hôtel et de restaurant présentées ici sont fictives.";
  }
  if (/qui es|profil|parcours|comp[eé]tence|cv|recrut/.test(q)) {
    const projects = cv.projects.slice(0, 3).map((project) => project.name).join(", ");
    return `${cv.fullName} (${cv.preferredName}) est ${cv.role.toLocaleLowerCase("fr")} basé à ${cv.location}. Son CV indique un baccalauréat avec mention Bien, des compétences en ${cv.skills.slice(0, 5).join(", ")} et des projets comme ${projects}.`;
  }
  return "Je peux vous présenter les services, les projets et le parcours de Cicinho Feno. Pour une demande personnalisée, décrivez votre besoin et je vous orienterai vers la bonne section du portfolio.";
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

export async function POST(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const h = hits.get(ip);
  if (h && now - h.t < WINDOW) {
    if (h.n >= MAX) return NextResponse.json({ reply: localReply("services") }, { status: 429 });
    h.n++;
  } else hits.set(ip, { n: 1, t: now });

  let body: { sessionId?: unknown; messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ reply: "Je n’ai pas compris le format de votre message." }, { status: 400 });
  }
  const msgs = (Array.isArray(body.messages) ? body.messages : []).slice(-6).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content ?? "").slice(0, 500),
  }));
  if (!msgs.length) return NextResponse.json({ reply: "Posez-moi une question sur le portfolio." }, { status: 400 });

  const sid = isSessionId(body.sessionId) ? body.sessionId : null;
  const meta = { ipHash: hashIp(ip), userAgent: req.headers.get("user-agent") ?? undefined };
  const last = msgs[msgs.length - 1];
  if (sid && last.role === "user") await logChat(sid, "user", last.content, meta);

  const fallback = localReply(last.content);
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    if (sid) await logChat(sid, "assistant", fallback, meta);
    return NextResponse.json({ reply: fallback, source: "local" });
  }

  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.PUBLIC_SITE_URL ?? "https://portfolio-85y757ims-fenoproject.vercel.app",
        "X-Title": "Portfolio Cicinho Feno",
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? "qwen/qwen3-4b:free",
        max_tokens: 500,
        temperature: 0.4,
        messages: [{ role: "system", content: systemPrompt }, ...msgs],
      }),
    });
    const data = (await r.json()) as ProviderResponse;
    const reply = r.ok ? extractReply(data) : "";
    if (!r.ok) console.error("OpenRouter chat error:", data.error?.message ?? `HTTP ${r.status}`);
    const finalReply = reply || fallback;
    if (sid) await logChat(sid, "assistant", finalReply, meta);
    return NextResponse.json({ reply: finalReply, source: reply ? "ai" : "local" });
  } catch (error) {
    console.error("OpenRouter connection error:", error);
    if (sid) await logChat(sid, "assistant", fallback, meta);
    return NextResponse.json({ reply: fallback, source: "local" });
  }
}
