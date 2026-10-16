type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: unknown } }>;
};

const MALAGASY_MARKERS = new Set([
  "aho", "ianao", "izy", "izahay", "isika", "inona", "aiza", "oviana",
  "ahoana", "manao", "salama", "azafady", "misaotra", "mba", "te", "satria",
  "fa", "dia", "ny", "amin", "amin'ny", "ho", "tsy", "eny", "tsia", "manampy",
  "fomba", "firy", "taona", "andro", "izao", "rahampitso", "omaly", "tsara",
  "lehibe", "kely", "misy", "afaka", "tiako", "mbola", "efa", "tonga",
]);

function words(text: string): string[] {
  return text.toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Heuristique locale : aucun appel réseau pour les langues courantes. */
export function isLikelyMalagasy(text: string): boolean {
  const tokens = words(text);
  if (tokens.length < 2) return false;
  const hits = tokens.filter((token) => MALAGASY_MARKERS.has(token)).length;
  return hits >= 2 || (hits >= 1 && tokens.length <= 8);
}

function extractText(data: ChatCompletionResponse): string {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.map((part) => {
      if (typeof part === "string") return part;
      if (part && typeof part === "object" && "text" in part) return String((part as { text?: unknown }).text ?? "");
      return "";
    }).join("").trim();
  }
  return "";
}

export async function translateMalagasy(text: string, direction: "to_english" | "to_malagasy"): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || !text.trim()) return text;
  const instruction = direction === "to_english"
    ? "Translate this Malagasy visitor message into concise natural English for another AI. Preserve the exact intent, names, URLs, numbers and code. Output only the translation."
    : "Translate this assistant response into natural Malagasy. Preserve Markdown, links, URLs, numbers, code and technical names. Output only the translation.";
  const response = await fetch(process.env.OPENROUTER_URL ?? "https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.PUBLIC_SITE_URL ?? "https://portfolio-fenoproject.vercel.app",
      "X-Title": "Portfolio Cicinho Feno — traduction",
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_TRANSLATOR_MODEL ?? process.env.OPENROUTER_MODEL ?? "openrouter/auto",
      messages: [{ role: "system", content: instruction }, { role: "user", content: text }],
      temperature: 0,
      max_tokens: Math.min(420, Math.max(120, Math.ceil(text.length * 1.15))),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(7_000),
  });
  if (!response.ok) throw new Error(`Translator HTTP ${response.status}`);
  const translated = extractText((await response.json()) as ChatCompletionResponse);
  return translated.replace(/^```(?:text|markdown)?\s*/i, "").replace(/\s*```$/i, "").trim() || text;
}
