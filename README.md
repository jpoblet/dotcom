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
| `projects/<slug>.md` | One file per project. Front matter feeds cards and the AI; the body is the case study (empty `##` sections are hidden). Thumbnails go in `/public`, e.g. `/images/projects/medal.jpg` |

**Publishing a project:** set `draft: false`. That builds `/projects/<slug>`,
lists it on `/projects`, and lets the AI link to it. Drafts are previewable
with `npm run dev` (marked "Draft") but return 404 in production.

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
