#!/usr/bin/env node
/**
 * Gathers everything the quarterly content-update interview needs, as one
 * JSON document on stdout (see .claude/skills/content-update/SKILL.md):
 *
 * - since:     the date of the last update (content/updates/log.md)
 * - site:      what visitors asked the chat since then, the answers it
 *              couldn't give, and Umami analytics (from /admin/signals on
 *              the live site; needs ADMIN_PASSWORD)
 * - articles:  Medium articles published since then (they already appear
 *              on the site; listed so the interview can mention them)
 * - todo:      the open to-do list (content/updates/todo.md)
 *
 * Usage: npm run content-signals [-- --since=YYYY-MM-DD]
 * ADMIN_PASSWORD comes from the environment or .env.local. SITE_URL
 * defaults to the live site.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.dirname(path.dirname(new URL(import.meta.url).pathname));
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function envLocal(name) {
  try {
    const line = read(".env.local")
      .split("\n")
      .find((l) => l.startsWith(`${name}=`));
    return line?.slice(name.length + 1).replace(/^["']|["']$/g, "").trim() || undefined;
  } catch {
    return undefined;
  }
}

// The latest "## YYYY-MM-DD" heading in the log, unless --since is given.
const arg = process.argv.find((a) => a.startsWith("--since="))?.slice(8);
const logged = read("content/updates/log.md").match(/^## (\d{4}-\d{2}-\d{2})/m)?.[1];
const since = arg ?? logged ?? new Date(Date.now() - 92 * 864e5).toISOString().slice(0, 10);

// www: the bare domain redirects, and fetch drops the password on redirect.
const site = (process.env.SITE_URL ?? "https://www.jordipoblet.com").replace(/\/$/, "");
const password = process.env.ADMIN_PASSWORD ?? envLocal("ADMIN_PASSWORD");

async function siteSignals() {
  if (!password) return { error: "ADMIN_PASSWORD isn't set, so the chat log and analytics were skipped." };
  try {
    const response = await fetch(`${site}/admin/signals?since=${since}`, {
      headers: { Authorization: `Basic ${Buffer.from(`admin:${password}`).toString("base64")}` },
    });
    if (!response.ok) return { error: `${site}/admin/signals answered ${response.status}.` };
    return await response.json();
  } catch (error) {
    return { error: `Couldn't reach ${site}: ${error.message}` };
  }
}

// The Medium profile from profile.yaml, read from its RSS feed.
async function newArticles() {
  const handle = read("content/profile.yaml").match(/medium\.com\/(@[\w.-]+)/)?.[1];
  if (!handle) return [];
  try {
    const xml = await (await fetch(`https://medium.com/feed/${handle}`)).text();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .map(([, item]) => ({
        title: item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim(),
        url: item.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim(),
        date: new Date(item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? 0).toISOString().slice(0, 10),
      }))
      .filter((article) => article.date >= since);
  } catch (error) {
    return { error: `Couldn't read the Medium feed: ${error.message}` };
  }
}

const [siteData, articles] = await Promise.all([siteSignals(), newArticles()]);
console.log(
  JSON.stringify(
    { since, today: new Date().toISOString().slice(0, 10), site: siteData, articles, todo: read("content/updates/todo.md") },
    null,
    2,
  ),
);
