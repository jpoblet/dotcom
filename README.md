# jordipoblet.com

Portfolio where visitors ask an AI about me instead of browsing case studies.
Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · three.js.

## Develop

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
| `projects/<slug>.md` | One file per project. Front matter feeds cards and the AI; the body is the case study. `draft: true` keeps it unlinked |

[`src/lib/content.ts`](src/lib/content.ts) loads these files and builds the AI's
knowledge base. No code changes are needed to add or edit content.
