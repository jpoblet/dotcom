# jordipoblet.com

Portfolio where visitors ask an AI about me instead of browsing case studies.
Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · three.js.

## Develop

The chat calls Claude, so you need an Anthropic API key
([console.anthropic.com](https://console.anthropic.com)). Create `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

On Vercel, add the same variable under Project → Settings → Environment Variables.

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build
```

## Editing content

Everything the site and the AI know about me lives in [`content/`](content):

| File | What it holds |
| --- | --- |
| `profile.yaml` | Name, title, contact, social links, languages, skills |
| `experience.yaml` | Work history, newest first (`end: Present` marks the current role) |
| `education.yaml` | Education, newest first |
| `about/*.md` | Longer writing (summary, background, personal, travels...). Files are read in filename order; the `title` front matter becomes the section heading |
| `projects/<slug>.md` | One file per project. Front matter feeds cards and the AI; the body is the case study (empty `##` sections are hidden). `type` groups it under Work (`work`), Personal projects (`personal`) or Other websites (`client`). Thumbnails go in `/public`, e.g. `/images/projects/medal.jpg` |

**Years that update themselves:** in any Markdown body, `{{years_since:2016-11}}`
(or `{{years_since:2011}}`) becomes the number of whole years since that date.
`{{duration:2011-11/2019-04}}` becomes the time between two dates in words
("about seven and a half years"); use `now` as the end for something ongoing.
Work history durations are worked out from `start` and `end` automatically.

**Publishing a project:** set `draft: false`. That builds `/projects/<slug>`,
lists it on `/projects`, and lets the AI link to it. Drafts are previewable
with `npm run dev` (marked "Draft") but return 404 in production. The AI still
reads a draft's summary and body; it just never links to a page for it.

[`src/lib/content.ts`](src/lib/content.ts) loads these files and builds the AI's
knowledge base. No code changes are needed to add or edit content.

## How the chat works

[`src/app/api/chat/route.ts`](src/app/api/chat/route.ts) sends the conversation
to Claude Opus 5.5 with the knowledge base in the system prompt and streams the
reply back as newline-delimited JSON. The knowledge base is prompt-cached, so
repeat visits within a few minutes read it at a fraction of the input price.
In development the server logs token and cache usage for every reply.

The AI also has display tools ([`src/lib/chat-tools.ts`](src/lib/chat-tools.ts)):
`show_project`, `show_timeline` and `show_contact` render a project card, the
career timeline or a contact card under its reply
([`src/components/ChatWidgets.tsx`](src/components/ChatWidgets.tsx)).
Project pages link back to the chat with `/?ask=...`, which asks the question
on arrival.

## Rate limiting

[`src/lib/rate-limit.ts`](src/lib/rate-limit.ts) limits the chat with Upstash
Redis (connected through the Vercel Marketplace, which sets the env vars):
15 messages per visitor per hour, 50 per visitor per day and 300 per day
site-wide (resets at 00:00 UTC). Visitors are identified by a salted hash of
their IP. Without Redis configured (e.g. locally) or if it's unreachable, the
chat is not limited and the problem is logged.

All notices shown for limits, errors and refusals live in
[`src/lib/notices.ts`](src/lib/notices.ts).

## Chat log and analytics

**Chat log.** Every question is stored in Upstash Redis with its reply, the
cards and follow-ups shown, how it was asked (typed, starter chip, follow-up
chip, project page), the visitor's country and city, and a random id per
conversation. No IP addresses. Entries never expire. Rate-limited questions
only count in the totals. See [`src/lib/chat-log.ts`](src/lib/chat-log.ts).

**Reading it.** Open `/admin` and log in with any username and the
`ADMIN_PASSWORD` environment variable. Without that variable, `/admin`
returns 404. It shows monthly and all-time totals and every conversation,
newest first.

**Analytics.** [Umami](https://cloud.umami.is) (cookieless) records visits on
the live domains only, plus these events: `Chat question` (with its
`source`) and `Project card shown` (with the `project`). The website id is in
[`src/app/layout.tsx`](src/app/layout.tsx).
