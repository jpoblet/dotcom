---
name: AI-driven portfolio
# work: a case study from a job. personal: something I made myself. client: a site made for a client.
type: personal
# One sentence shown on project cards and given to the AI.
summary: "The site you're on: a portfolio you talk to, where an AI that knows my work, projects and life answers visitors' questions for me."
company: ""
role: "Design and development"
year: "2025 - 2026"
tags: [AI, Conversational UI, Next.js, Claude, Product design]
# Path under /public, e.g. /images/projects/jordipoblet-com.jpg
thumbnail: "/images/projects/jordipoblet-com.jpg"
# Phone-sized screenshot shown next to the desktop one on the project page.
mobile_image: "/images/projects/jordipoblet-com-mobile.jpg"
# More screenshots of the live site, shown between the sections of the case study.
gallery:
  - "/images/projects/gallery/jordipoblet-com-d1.jpg"
  - "/images/projects/gallery/jordipoblet-com-d2.jpg"
  - "/images/projects/gallery/jordipoblet-com-d3.jpg"
mobile_gallery:
  - "/images/projects/gallery/jordipoblet-com-m1.jpg"
  - "/images/projects/gallery/jordipoblet-com-m2.jpg"
  - "/images/projects/gallery/jordipoblet-com-m3.jpg"
# Colour of the generated cover shown while there is no thumbnail.
accent: "#FF6B6B"
# Logo and background colour for the tile on the projects page.
logo: "/images/logos/jordipoblet-com.svg"
# Transparent single-colour version, for the workspace list.
logo_mark: "/images/logos/marks/jordipoblet-com.svg"
brand_background: "#030712"
# Public URL if the project is live (website, App Store page...). Live projects are
# suggested to visitors while the chat is busy, and the AI can share the link.
live_url: "https://jordipoblet.com"
# While true, the case-study page isn't built and the AI doesn't link to it.
draft: false
---

## The idea

I can't be there to answer everyone who wants to know more about me. And there's far too much about me to fit into a portfolio and a CV: the career, the projects, the reasoning behind them, and the life around them. So I thought: I need a bot that has all the context and answers for me. That's how this site came about.

Yes, it's a bit of an inception: you may well be reading this inside the very chat it describes.

## What it is

Instead of a portfolio you scroll, it's one you talk to. Visitors ask whatever they want to know, and the AI answers in my voice, based on everything I've written about my work, my projects and my life. When a project, my career timeline or my contact details answer the question best, it shows them as cards and panels next to the conversation, with the case studies one click away.

A few details I care about:

- **AI Notes.** As the conversation goes on, a notes panel collects the topics covered and writes a summary that visitors can copy, download or email to themselves. It's built for recruiters who need to share what they've learnt with their team.
- **Follow-up suggestions.** Every answer ends with a couple of questions worth asking next, so nobody gets stuck wondering what to type.
- **Honest limits.** The AI only answers from what I've written. When it doesn't know something, it says so and suggests something else to ask, instead of making things up.
- **Privacy.** Conversations are logged so I can see what people want to know and improve the content, but nothing that identifies a visitor is stored.

## How it's built

I designed and built it myself with Next.js on Vercel, using Claude for the conversation. Everything the AI knows lives in plain Markdown and YAML files, so updating what it knows is as easy as editing a document. Usage limits keep costs predictable, and a private page shows me every question asked, so the content keeps getting better where visitors find gaps.

It's also my clearest example of how I work now: the idea, the product design, the interface and the code, all by one person, with AI as part of both the product and the process.
