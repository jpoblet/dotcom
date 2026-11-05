/**
 * Display tools for the chat. Claude calls them to show a rich block (a
 * project card, the career timeline, a contact card) under its reply. They
 * don't fetch anything new - everything is already in the knowledge base -
 * they only decide what the visitor sees. Server-only.
 */
import type Anthropic from "@anthropic-ai/sdk";
import {
  getCardProjects,
  getExperience,
  getProfile,
  toProjectCard,
} from "./content";
import type { Widget } from "./widgets";

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

  tools.push({
    name: SUGGEST_FOLLOW_UPS,
    description: `Offer the visitor two or three follow-up questions as tappable chips under your reply. Call it once per reply, as the very last thing, after your written answer. Write each question as the visitor would ask it, short (under 60 characters), in the visitor's language, about something the knowledge base can actually answer and that hasn't been covered yet. Skip it when you are declining an off-topic request.`,
    input_schema: {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: { type: "string" },
          description: "Two or three short follow-up questions.",
        },
      },
      required: ["questions"],
      additionalProperties: false,
    },
    strict: true,
    eager_input_streaming: true,
  });

  return tools;
}

export const SUGGEST_FOLLOW_UPS = "suggest_follow_ups";

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

export interface ToolOutcome {
  widget?: Widget;
  /** What Claude is told happened. */
  result: string;
  isError?: boolean;
}

/** Runs a display tool. Inputs are validated here, not trusted. */
export function runTool(name: string, input: unknown): ToolOutcome {
  switch (name) {
    case "show_project": {
      const slug = (input as { slug?: unknown } | null)?.slug;
      const project = getCardProjects().find((p) => p.slug === slug);
      if (!project) {
        return { result: `Unknown project slug: ${String(slug)}`, isError: true };
      }
      return {
        widget: { kind: "project", project: toProjectCard(project) },
        result: `The card for "${project.name}" is now shown to the visitor below your reply.`,
      };
    }
    case "show_timeline":
      return {
        widget: {
          kind: "timeline",
          roles: getExperience().map(({ company, role, start, end }) => ({
            company,
            role,
            start,
            end,
          })),
        },
        result: "The career timeline is now shown to the visitor below your reply.",
      };
    case "show_contact": {
      const { email, links } = getProfile();
      return {
        widget: { kind: "contact", email, links },
        result: "The contact card is now shown to the visitor below your reply.",
      };
    }
    default:
      return { result: `Unknown tool: ${name}`, isError: true };
  }
}
