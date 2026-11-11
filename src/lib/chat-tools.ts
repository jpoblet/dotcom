/**
 * Display tools for the chat. Claude calls them to show a rich block (a
 * project card, the career timeline, a contact card, the music card) under
 * its reply. Most only decide what the visitor sees, from the knowledge
 * base; show_music also fetches live listening data from Last.fm and hands
 * it to Claude in the tool result. Server-only.
 */
import type Anthropic from "@anthropic-ai/sdk";
import {
  getCardProjects,
  getExperience,
  getProfile,
  getProjects,
  toProjectCard,
} from "./content";
import { getMusic, isLastfmConfigured } from "./lastfm";
import type { MusicData, Widget } from "./widgets";

type Tool = Anthropic.Beta.BetaTool;

const NO_INPUT: Tool["input_schema"] = {
  type: "object",
  properties: {},
  required: [],
  additionalProperties: false,
};

/**
 * Tool definitions. Deterministic for a given /content (sorted slugs, fixed
 * order) so they stay inside the prompt cache.
 */
export function buildTools(): Tool[] {
  const first = getProfile().name.split(" ")[0];
  const slugs = getCardProjects().map((p) => p.slug);
  const allSlugs = getProjects().map((p) => p.slug).sort();
  const tools: Tool[] = [];

  if (slugs.length > 0) {
    tools.push({
      name: "show_project",
      description: `Show the visitor a card for one of ${first}'s projects: name, summary, thumbnail, and a link to the case study when one is published. Use it when the visitor asks about a specific project, or when a project is the best answer to their question. One call per project, at most three per reply.`,
      input_schema: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            enum: slugs,
            description: "The project's slug from the knowledge base.",
          },
        },
        required: ["slug"],
        additionalProperties: false,
      },
      strict: true,
      eager_input_streaming: true,
    });
  }

  tools.push(
    {
      name: "show_timeline",
      description: `Show the visitor ${first}'s career timeline: every role, company and dates, newest first. Use it when the visitor asks where ${first} has worked, about the career path, or for an overview of experience.`,
      input_schema: NO_INPUT,
      strict: true,
      eager_input_streaming: true,
    },
    {
      name: "show_contact",
      description: `Show the visitor a contact card with ${first}'s email and public profiles. Use it when the visitor wants to get in touch, hire, collaborate, or asks how to reach ${first}.`,
      input_schema: NO_INPUT,
      strict: true,
      eager_input_streaming: true,
    },
  );

  // Only when Last.fm is set up (fixed per deployment, so still cacheable).
  if (isLastfmConfigured()) {
    tools.push({
      name: "show_music",
      description: `Show the visitor a card with what ${first} has been listening to lately, live from Last.fm: most played artists over the last three months, genres, recent tracks and what's playing right now. Use it when the visitor asks about ${first}'s music taste, favourite artists, bands or genres, or what he's listening to. The tool result gives you the data to talk about.`,
      input_schema: NO_INPUT,
      strict: true,
      eager_input_streaming: true,
    });
  }

  tools.push({
    name: WRAP_UP,
    description: `Call once per reply, as the very last thing, after your written answer. It does two things: offers the visitor two or three follow-up questions as tappable chips, and records the topics this reply covered in the visitor's notes. Skip it when you are declining an off-topic request.`,
    input_schema: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: { type: "string" },
          description: `Two or three follow-up questions, written as the visitor would ask them: short (under 60 characters), in the visitor's language, about something the knowledge base can answer and that hasn't been covered yet. Once the conversation is underway, make one of them personal (travels, sport, life outside work) so the visitor discovers more than the CV.`,
        },
        topics: {
          type: "array",
          description: `The one to three topics this reply was about, for the visitor's notes. Reuse the exact same label when a topic comes up again.`,
          items: {
            type: "object",
            properties: {
              label: {
                type: "string",
                description: `Two to four words naming the topic, e.g. "Africa overland trip", "Rillet", "What The Flag".`,
              },
              note: {
                type: "string",
                description: `One sentence (under 160 characters) of what the visitor learned, in the third person about ${first}, in the visitor's language. Only facts from your reply.`,
              },
              project: {
                type: "string",
                enum: ["", ...allSlugs],
                description: "The project's slug when the topic is one of the projects, otherwise an empty string.",
              },
            },
            required: ["label", "note", "project"],
            additionalProperties: false,
          },
        },
      },
      required: ["questions", "topics"],
      additionalProperties: false,
    },
    strict: true,
    eager_input_streaming: true,
  });

  return tools;
}

export const WRAP_UP = "wrap_up";

export interface Topic {
  label: string;
  note: string;
  /** Project slug, when the topic is a project. */
  project?: string;
}

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

/** Cleans the follow-up questions Claude suggested (never trusted as-is). */
export function parseFollowUps(input: unknown): string[] {
  const raw = (input as { questions?: unknown } | null)?.questions;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((q): q is string => typeof q === "string")
    .map((q) => q.replace(/\s+/g, " ").trim())
    .filter((q) => q.length > 0 && q.length <= 100)
    .slice(0, 3);
}

/** Cleans the topics Claude recorded for the visitor's notes. */
export function parseTopics(input: unknown): Topic[] {
  const raw = (input as { topics?: unknown } | null)?.topics;
  if (!Array.isArray(raw)) return [];
  const slugs = new Set(getProjects().map((p) => p.slug));
  return raw
    .map((item) => {
      const { label, note, project } = (item ?? {}) as Record<string, unknown>;
      const slug = clean(project, 80);
      return {
        label: clean(label, 60),
        note: clean(note, 240),
        ...(slugs.has(slug) ? { project: slug } : {}),
      };
    })
    .filter((topic) => topic.label && topic.note)
    .slice(0, 3);
}

export interface ToolOutcome {
  widget?: Widget;
  /** What Claude is told happened. */
  result: string;
  isError?: boolean;
}

const ago = (ms: number) => {
  const minutes = Math.round((Date.now() - ms) / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 48 ? `${hours} h ago` : `${Math.round(hours / 24)} days ago`;
};

/** The listening data, as Claude reads it in the tool result. */
function describeMusic(music: MusicData): string {
  const month = new Date(music.since).toLocaleString("en-GB", { month: "long", year: "numeric" });
  return [
    music.nowPlaying
      ? `Playing right now: "${music.nowPlaying.name}" by ${music.nowPlaying.artist}.`
      : "",
    `Most played artists, last three months: ${music.topArtists.map((a) => `${a.name} (${a.plays})`).join(", ")}.`,
    music.genres.length ? `Genres, from those artists' tags: ${music.genres.join(", ")}.` : "",
    music.recent.length
      ? `Recently played: ${music.recent.map((t) => `"${t.name}" by ${t.artist}${t.playedAt ? `, ${ago(t.playedAt)}` : ""}`).join("; ")}.`
      : "",
    `Scrobbling on Last.fm since ${month}: ${music.totalPlays} plays so far, so this shows recent listening, not a lifetime of it.`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Runs a display tool. Inputs are validated here, not trusted. */
export async function runTool(name: string, input: unknown): Promise<ToolOutcome> {
  switch (name) {
    case "show_project": {
      const slug = (input as { slug?: unknown } | null)?.slug;
      const project = getCardProjects().find((p) => p.slug === slug);
      if (!project) {
        return { result: `Unknown project slug: ${String(slug)}`, isError: true };
      }
      return {
        widget: { kind: "project", project: toProjectCard(project) },
        result: `The card for "${project.name}" is now shown to the visitor below your reply. It doesn't replace your answer: write a full reply to the question, and mention what the card is for (e.g. it links to the case study).`,
      };
    }
    case "show_timeline":
      return {
        widget: {
          kind: "timeline",
          roles: getExperience().map(({ company, role, start, end, website }) => ({
            company,
            role,
            start,
            end,
            ...(website ? { website } : {}),
          })),
        },
        result: "The career timeline is now shown to the visitor below your reply. It doesn't replace your answer: write a full reply to the question and mention the timeline below.",
      };
    case "show_contact": {
      const { email, links } = getProfile();
      return {
        widget: { kind: "contact", email, links },
        result: "The contact card is now shown to the visitor below your reply. It doesn't replace your answer: write a full reply and say the card below has the ways to reach you.",
      };
    }
    case "show_music": {
      const music = await getMusic();
      if (!music) {
        return {
          result: "Last.fm couldn't be reached, so there's no music card this time. Answer from the knowledge base and don't mention the card.",
          isError: true,
        };
      }
      return {
        widget: { kind: "music", music },
        result: `The music card is now shown to the visitor below your reply, live from Last.fm. Here's what it shows:\n${describeMusic(music)}\n\nAnswer in your own words as ${getProfile().name.split(" ")[0]}: what you've had on lately and the thread running through it. Stick to what the data shows and what the knowledge base says; don't invent memories or opinions about specific artists. Mention the card below in passing.`,
      };
    }
    default:
      return { result: `Unknown tool: ${name}`, isError: true };
  }
}
