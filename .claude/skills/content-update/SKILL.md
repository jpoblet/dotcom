---
name: content-update
description: Quarterly content update for jordipoblet.com. Gathers what visitors asked the chat (and what it couldn't answer), site analytics, new articles and the open to-do list, interviews Jordi with a short personalised set of questions, then updates the content files and publishes them to main. Use when Jordi asks to update the site's content or context, or when the quarterly reminder runs.
---

# Quarterly content update

The site's AI chat answers as Jordi from the files in `content/`. This
keeps them current: find what's missing or out of date, ask Jordi a few
sharp questions, write the answers into the content, publish.

Jordi usually answers from the Claude app on his iPhone, often by voice.
Keep everything you send him short and readable on a phone.

## 1. Gather the signals

```bash
npm run content-signals
```

It prints one JSON document:

- `since`: the last update (top entry of `content/updates/log.md`).
- `site.chat`: what visitors asked since then. `gaps` are replies where
  the chat said it didn't know, or that failed: the best source of
  questions. The `unsure` flag only catches English phrasing and the chat
  replies in the visitor's language, so read every reply in `typed`
  yourself and spot the ones that dodged or didn't know (e.g. "techno
  isn't something I've ever thought about", or a polite deflection in
  Italian). `typed` are questions people wrote themselves (starters and
  follow-up chips are the site's own suggestions, so they say less).
  `cardsShown` shows which projects people looked at.
- `site.analytics`: Umami page views, top pages and events (`Project
  opened`, `Chat question`, `Notes written`...). `null` without
  `UMAMI_API_KEY` on the site; just leave it out then.
- `articles`: Medium articles published since then.
- `todo`: the open to-do list.

If `site.error` says ADMIN_PASSWORD isn't set, carry on with the rest and
mention it in your report.

Then read the content itself: `content/profile.yaml`,
`content/experience.yaml`, `content/education.yaml`, every file in
`content/about/` and `content/projects/`. Look for facts that age:
"currently", "now", "this year", "aiming for", "no users yet", "planning
to", "looking for", dates that have passed, durations, job-search status,
the book's progress, the status of each personal project.

## 2. Write the interview

Five to eight questions, never more. Rank the candidates and keep the
best:

1. **Gaps visitors hit.** Cluster `gaps` and `typed` by topic; a topic
   asked several times that the content doesn't cover is the strongest
   question. Quote the count ("4 visitors asked about...").
2. **Facts that went stale.** Anything time-bound from the read-through.
3. **To-do items.** At most two or three, the ones that matter most for
   recruiters. Don't repeat the whole list.
4. **One open question** at the end: anything new since `since` (role,
   launches, numbers, talks, life).

Each question gets one short line saying why you're asking, so Jordi sees
it's specific to him. Make questions concrete ("Last time the book had
reached chapter X: where is it now?"), not generic ("Any updates?").

Send it like this, then stop and wait for his answers:

> **Content update, [Month Year]**
> Since [since], [N] people chatted with your site ([short highlight from
> analytics or the log, if there is one]). A few questions to keep it
> current. Answer in any order, by voice is fine, and say "skip" to any.
>
> 1. [Question]
>    *Why: [one line]*
> ...

If the signals turn up nothing worth asking beyond the open question,
send just that one.

## 3. Update the content

When he answers:

- **Write in his voice**, first person, like the existing files: warm,
  direct, plain words, British spelling ("learnt", "programme"). Turn
  messy dictation into clean prose without adding anything.
- **Only what he said.** Never invent facts, numbers, dates or opinions.
  If an answer is ambiguous, ask one follow-up rather than guess.
- **Put it where it belongs**: update the existing file and section that
  covers the topic; create a new `content/about/NN-topic.md` only for a
  genuinely new topic (next free number, `title:` front matter).
- **Out of the content**: pay and salary expectations, health details
  beyond what's already there, anything about other people they wouldn't
  want public. Skip it and tell him why.
- **Skipped or unanswered questions** stay in (or go into)
  `content/updates/todo.md`. Delete to-do items that are now covered.
- **New articles** already show on the site; only touch content if an
  article changes something (e.g. the dung beetle article being out means
  `about/08-dung-beetles.md` should say it's published).
- Add an entry at the top of `content/updates/log.md`: today's date as
  `## YYYY-MM-DD`, what changed in a few lines, what was deferred.

## 4. Check and publish

```bash
npm run typecheck && npm run lint && npm run build
```

Fix anything that fails. Then check the scope:

```bash
git status --porcelain
```

**Only files under `content/` may have changed.** If they all are,
publish straight away, without asking:

- Work on `main`. Never create a branch.
- Commit with a message like `Content update, February 2027` and a short
  body listing what changed, then `git push origin main`. Vercel deploys
  from main.

If anything outside `content/` changed (code, styles, images in
`public/`, config), don't push. Tell Jordi what changed and why, and wait
for his go-ahead.

## 5. Report

Reply with a short summary he can read on his phone: what's now on the
site, what went back on the to-do list, and anything you left out and
why. Mention that the site redeploys in a minute or two.
