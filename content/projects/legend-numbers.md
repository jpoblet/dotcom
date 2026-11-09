---
name: Legend Numbers
# work: a case study from a job. personal: something I made myself. client: a site made for a client.
type: personal
# One sentence shown on project cards and given to the AI.
summary: "A Chrome extension that spots shirt numbers on any website and, on hover, shows the sporting legends who wore them."
company: ""
role: "Founder, design and development"
year: "2026"
tags: [Chrome extension, Sport, Data curation, Privacy first]
# Path under /public, e.g. /images/projects/legend-numbers.jpg
thumbnail: "/images/projects/legend-numbers.jpg"
# Phone-sized screenshot shown next to the desktop one on the project page.
mobile_image: "/images/projects/legend-numbers-mobile.jpg"
# More screenshots of the live site, shown between the sections of the case study.
gallery:
  - "/images/projects/gallery/legend-numbers-d1.jpg"
  - "/images/projects/gallery/legend-numbers-d2.jpg"
  - "/images/projects/gallery/legend-numbers-d3.jpg"
mobile_gallery:
  - "/images/projects/gallery/legend-numbers-m2.jpg"
  - "/images/projects/gallery/legend-numbers-m3.jpg"
  - "/images/projects/gallery/legend-numbers-m4.jpg"
# Colour of the generated cover shown while there is no thumbnail.
accent: "#16A34A"
# Logo and background colour for the tile on the projects page.
logo: "/images/logos/legend-numbers.png"
# Transparent single-colour version, for the workspace list.
logo_mark: "/images/logos/marks/legend-numbers-symbol.png"
brand_background: "#13161D"
# Public URL if the project is live (website, App Store page...). Live projects are
# suggested to visitors while the chat is busy, and the AI can share the link.
live_url: "https://legendnumbers.com"
# While true, the case-study page isn't built and the AI doesn't link to it.
draft: false
---

## What it is

Legend Numbers turns any number on any website into a small piece of sporting history. Numbers that belong to a legend get a subtle dotted underline, and hovering one shows a card with three players who made that shirt number famous: their kit, flag and a fact about them. It currently covers football and basketball (including the NBA and the EuroLeague), with more sports coming.

## How it's built

I designed and built the extension, its landing page and the curated data behind it, which is drawn from Wikidata and weighted by fame so the real legends come first. The tricky part is knowing when a number is a shirt number and not a date, a price or a score, which the extension works out without changing anything on the page. It has no backend and collects no data.
