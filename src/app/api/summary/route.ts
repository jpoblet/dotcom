import Anthropic from "@anthropic-ai/sdk";
import type { NextRequest } from "next/server";
import { getProfile, getProjects, hasPage, projectPath } from "@/lib/content";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const MODEL = "claude-opus-5-5";
const MAX_MESSAGES = 40;
const MAX_CHARS = 30000;

interface Body {
  messages?: { role?: unknown; content?: unknown }[];
  topics?: { label?: unknown; note?: unknown }[];
}

function buildSystemPrompt(origin: string): string {
  const profile = getProfile();
  const first = profile.name.split(" ")[0];
  const links = getProjects()
    .map((p) => {
      const path = hasPage(p) ? projectPath(p) : undefined;
      const page = path ? `${origin}${path}` : "";
      return `- ${p.name}: ${[page && `case study ${page}`, p.liveUrl && `live at ${p.liveUrl}`].filter(Boolean).join(", ") || "no link"}`;
    })
    .join("\n");
  return `You write the notes a visitor would have taken while chatting with ${profile.name} (${profile.title}) on ${first}'s portfolio site, where an AI answers as ${first}.

Write an executive summary of the conversation below, for the visitor to keep:
- Start with a one-line title (Markdown "# ") and one sentence on who ${first} is.
- Then "## What we talked about": one short bullet per topic, the key facts only, in the third person about ${first}.
- Then "## Worth a look": the case studies and live sites that came up, as Markdown links (only from the list below, only if they came up).
- End with "## Get in touch": ${profile.email}${profile.links.length ? ` and ${profile.links.map((l) => `[${l.label}](${l.href})`).join(", ")}` : ""}.
- Only facts stated in the conversation. Concise and plain: no emojis, no filler, no sign-off. Write in the language the visitor used.

Links you may use:
${links}`;
}

export async function POST(request: NextRequest) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") && typeof m.content === "string",
    )
    .slice(-MAX_MESSAGES);
  if (!messages.some((m) => m.role === "user")) {
    return Response.json({ error: "Nothing to summarise yet" }, { status: 400 });
  }

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Visitor" : "Jordi (AI)"}: ${m.content}`)
    .join("\n\n")
    .slice(-MAX_CHARS);
  const topics = (Array.isArray(body.topics) ? body.topics : [])
    .filter((t) => typeof t.label === "string" && typeof t.note === "string")
    .slice(0, 30)
    .map((t) => `- ${t.label}: ${t.note}`)
    .join("\n");

  // Counts as a message against the visitor's limits.
  const limit = await checkRateLimit(request);
  if (!limit.allowed) {
    return Response.json(
      { error: "You've reached the chat's limit for now. Try again a bit later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      output_config: { effort: "low" },
      system: buildSystemPrompt(request.nextUrl.origin),
      messages: [
        {
          role: "user",
          content: `<conversation>\n${transcript}\n</conversation>${topics ? `\n\n<topics>\n${topics}\n</topics>` : ""}\n\nWrite the notes.`,
        },
      ],
    });
    const summary = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();
    if (!summary) throw new Error("Empty summary");
    return Response.json({ summary });
  } catch (error) {
    console.error("[summary] Claude request failed:", error);
    return Response.json(
      { error: "Couldn't write the notes right now. Try again in a minute." },
      { status: 502 },
    );
  }
}
