import type { Metadata } from "next";
import {
  type BarRow,
  HeadLink,
  HourChart,
  KeyValues,
  OUTCOME_LABELS,
  PageHead,
  RangePicker,
  RankedBars,
  SOURCE_LABELS,
  SectionHead,
  Stat,
  Timeline,
  cardLabel,
  countryName,
  formatNumber,
  formatShare,
  formatTime,
} from "@/components/admin/ui";
import { isRedisConfigured } from "@/lib/chat-log";
import { getProjects } from "@/lib/content";
import { analyticsWindow, loadRange, parseRange, summarise } from "@/lib/admin-insights";
import { topicLabel } from "@/lib/question-topics";
import { getAnalytics } from "@/lib/umami";

export const dynamic = "force-dynamic";
// Sorting new questions into topics can take a few seconds.
export const maxDuration = 60;
export const metadata: Metadata = { title: "Dashboard" };

type Props = { searchParams: Promise<{ range?: string }> };

export default async function Dashboard({ searchParams }: Props) {
  const range = parseRange((await searchParams).range);
  const loaded = await loadRange(range);
  const s = summarise(loaded);
  const analytics = await getAnalytics(...analyticsWindow(loaded));
  const projects = new Map(getProjects().map((p) => [p.slug, p.name]));
  const withRange = (path: string, extra = "") => `${path}?range=${range.id}${extra}`;

  const topicRows: BarRow[] = s.byTopic.map((t) => ({
    key: t.key,
    label: topicLabel(t.key),
    count: t.count,
    href: withRange("/admin/questions", `&topic=${t.key}`),
  }));
  const countryRows: BarRow[] = s.countries.map((c) => ({
    key: c.key,
    code: c.key === "unknown" ? "··" : c.key,
    label: countryName(c.key),
    count: c.count,
  }));
  const cityRows: BarRow[] = s.cities.map((c) => {
    const [city, country] = c.key.split("|");
    return { key: c.key, code: country || "··", label: city, count: c.count };
  });

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHead title="Dashboard" subtitle={`What visitors asked the chat · ${range.days ? `last ${range.label}` : "all time"}`}>
        <RangePicker path="/admin" current={range} />
      </PageHead>

      {!isRedisConfigured() && (
        <p className="mt-8 rounded-md bg-background-secondary px-4 py-3 text-sm text-foreground-secondary">
          Redis isn&apos;t configured here, so nothing is being logged. The live site has the data.
        </p>
      )}
      {loaded.truncated && (
        <p className="mt-8 text-xs text-foreground-secondary">Showing the most recent {formatNumber(loaded.entries.length)} questions only.</p>
      )}

      <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
        <Stat label="Questions" value={formatNumber(s.questions)} change={s.questionsChange} />
        <Stat label="Conversations" value={formatNumber(s.conversations)} change={s.conversationsChange} />
        <Stat
          label="Questions per conversation"
          value={formatNumber(s.perConversation, 1)}
          note="How far people go"
        />
        <Stat label="Typed their own" value={formatShare(s.typedShare)} note="The rest tapped a suggestion" />
        <Stat
          label="Answered well"
          value={formatShare(s.answeredShare)}
          note={`${formatNumber(s.gaps.length)} it couldn't really answer`}
        />
        {analytics ? (
          <Stat
            label="Visitors"
            value={formatNumber(analytics.visitors)}
            note={
              analytics.visitors
                ? `${formatShare(Math.min(1, s.conversations / analytics.visitors))} of them started a chat`
                : undefined
            }
          />
        ) : (
          <Stat label="Visitors" value="–" note="Add UMAMI_API_KEY to see site traffic" />
        )}
      </dl>

      <section className="mt-16">
        <SectionHead title={s.timeline.monthly ? "Questions per month" : "Questions per day"} aside={formatNumber(s.questions)} />
        <Timeline points={s.timeline.points} monthly={s.timeline.monthly} />
      </section>

      <div className="mt-16 grid gap-x-12 gap-y-16 lg:grid-cols-2">
        <section>
          <SectionHead title="What they ask about" aside={<HeadLink href={withRange("/admin/questions")}>All questions</HeadLink>} />
          <RankedBars rows={topicRows} total={s.questions} limit={13} />
        </section>

        <section>
          <SectionHead title="Where they chat from" aside={`${s.countries.filter((c) => c.key !== "unknown").length} countries`} />
          <RankedBars rows={countryRows} total={s.conversations} limit={8} empty="No locations yet." />
          {cityRows.length > 0 && (
            <>
              <h3 className="mt-8 text-xs text-foreground-secondary">Cities</h3>
              <RankedBars rows={cityRows} total={s.conversations} limit={5} />
            </>
          )}
        </section>

        <section>
          <SectionHead title="When they chat" aside="Barcelona time" />
          <HourChart hours={s.hours} />
        </section>

        <section>
          <SectionHead title="How they ask" />
          <RankedBars
            rows={s.sources.map((r) => ({ key: r.key, label: SOURCE_LABELS[r.key] ?? r.key, count: r.count }))}
            total={s.questions}
          />
          <h3 className="mt-8 text-xs text-foreground-secondary">How it went</h3>
          <KeyValues
            rows={s.outcomes.map((r) => ({
              label: OUTCOME_LABELS[r.key] ?? r.key,
              value: `${formatNumber(r.count)} · ${formatShare(r.count / Math.max(1, s.questions))}`,
            }))}
          />
        </section>
      </div>

      <section className="mt-16">
        <SectionHead
          title="Couldn't really answer"
          aside={s.gaps.length > 0 && <HeadLink href={withRange("/admin/questions", "&topic=gaps")}>See all {s.gaps.length}</HeadLink>}
        />
        {s.gaps.length === 0 ? (
          <p className="mt-4 text-sm text-foreground-secondary">Nothing missing: every question got a proper answer.</p>
        ) : (
          <ul className="divide-y divide-background-inverse/8">
            {s.gaps.slice(0, 6).map((entry) => (
              <li key={`${entry.conversationId}${entry.at}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-6">
                <span className="shrink-0 font-mono text-xs tabular-nums text-foreground-secondary sm:w-28">{formatTime(entry.at)}</span>
                <span className="min-w-0 flex-1 text-sm">{entry.question || "(question not kept)"}</span>
                <span className="shrink-0 text-xs text-foreground-secondary">
                  {entry.outcome === "answered" ? "Didn't know" : OUTCOME_LABELS[entry.outcome]}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-foreground-secondary">
          Answers where the chat said it didn&apos;t know, plus errors and refusals: good candidates for the next content update.
        </p>
      </section>

      <div className="mt-16 grid gap-x-12 gap-y-16 lg:grid-cols-2">
        <section>
          <SectionHead title="Projects shown in answers" />
          <RankedBars
            rows={s.cards.map((c) => ({ key: c.key, label: cardLabel(c.key, projects), count: c.count }))}
            total={0}
            empty="No cards shown yet."
          />
        </section>

        <section>
          <SectionHead title="Site traffic" aside={analytics ? `${formatNumber(analytics.pageviews)} page views` : undefined} />
          {analytics ? (
            <>
              <RankedBars
                rows={analytics.paths.map((p) => ({ key: p.x ?? "", label: <span className="font-mono text-xs">{p.x ?? "(none)"}</span>, count: p.y }))}
                total={analytics.pageviews}
                limit={6}
              />
              {analytics.events.length > 0 && (
                <>
                  <h3 className="mt-8 text-xs text-foreground-secondary">What they did</h3>
                  <RankedBars rows={analytics.events.map((e) => ({ key: e.x ?? "", label: e.x ?? "(none)", count: e.y }))} total={0} limit={6} />
                </>
              )}
              {analytics.countries.length > 0 && (
                <>
                  <h3 className="mt-8 text-xs text-foreground-secondary">All visitors, by country</h3>
                  <RankedBars
                    rows={analytics.countries.map((c) => ({ key: c.x ?? "", code: c.x ?? "··", label: countryName(c.x ?? ""), count: c.y }))}
                    total={analytics.visitors}
                    limit={6}
                  />
                </>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-foreground-secondary">
              Page views, visitors and clicks come from Umami. Add a Umami Cloud API key as UMAMI_API_KEY in Vercel to see them here.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
