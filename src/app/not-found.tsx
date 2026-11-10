import type { Metadata } from "next";
import Link from "next/link";
import DungBeetle from "@/components/DungBeetle";
import MissingPath from "@/components/MissingPath";
import { BallDebris, NightSky } from "@/components/NotFoundScene";
import { SiteFooterBar, SiteHeader } from "@/components/SiteChrome";
import { getProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: `Page not found | ${getProfile().name}`,
};

/**
 * The 404: a dung beetle pushing the "0" of 404 along the ground. They
 * roll their ball backwards, so they never quite see where they're going,
 * which is how the visitor ended up here too.
 */
export default function NotFound() {
  const { email, links } = getProfile();
  return (
    // Laid out like the home page's chat column, so the header and footer
    // land in the same place (data-own-chrome hides the layout's footer).
    <div
      data-own-chrome
      className="relative flex h-dvh flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      <SiteHeader logoHref="/">
        {(
          [
            ["/work", "Work"],
            ["/notes", "AI Notes"],
          ] as const
        ).map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-md px-2.5 py-1.5 text-xs text-foreground-secondary transition-colors hover:bg-background-inverse/6 hover:text-foreground"
          >
            {label}
          </Link>
        ))}
      </SiteHeader>

      <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-24 pb-10 sm:px-8 lg:pt-28">
        <div className="mx-auto flex min-h-full w-full max-w-xl flex-col justify-center gap-10">
          <div className="relative">
            {/* The night sky, from the illustration's ground line up and
                across the whole width of the page. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[9.3%] left-1/2 h-[60dvh] w-screen -translate-x-1/2"
            >
              <NightSky />
            </div>
            <svg
              viewBox="0 0 500 210"
              role="img"
              aria-label="404: a dung beetle pushing the zero like a ball"
              className="nf-scene relative w-full overflow-visible text-foreground"
            >
              <text
                x="10"
                y="190"
                className="fill-current font-mono"
                fontSize="168"
                fontWeight="500"
              >
                4
              </text>
              <text
                x="384"
                y="190"
                className="fill-current font-mono"
                fontSize="168"
                fontWeight="500"
              >
                4
              </text>

              {/* The beetle and its ball, nudging back and forth: it's stuck. */}
              <g className="nf-push">
                {/* The ball, rolling: a ring (the zero) with what it picked
                    up along the way in its hollow (random on each load). */}
                <g className="nf-ball">
                  <circle
                    cx="300"
                    cy="129"
                    r="51"
                    className="fill-none stroke-current"
                    strokeWidth="19"
                  />
                  <BallDebris />
                </g>

                <DungBeetle />
              </g>

              {/* The ground. */}
              <path
                d="M0 190.5h500"
                className="stroke-current"
                strokeWidth="1.5"
                opacity="0.25"
              />
            </svg>
          </div>

          <div className="flex flex-col gap-4">
            <MissingPath />
            <h1 className="text-2xl font-medium tracking-tight text-balance sm:text-3xl">
              You rolled off the path.
            </h1>
            <p className="max-w-md text-base text-foreground-secondary text-pretty">
              Dung beetles push their ball backwards, so they never quite see
              where they&apos;re going. They still get home, steering by the
              Milky Way. This page doesn&apos;t exist, but your way back is just
              here.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <Link
                href="/"
                className="rounded-full bg-background-inverse px-5 py-2.5 text-foreground-inverse transition-opacity hover:opacity-85"
              >
                Back to the chat
              </Link>
              <Link
                href="/work"
                className="underline underline-offset-4 hover:text-foreground-secondary"
              >
                See my work
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooterBar email={email} links={links} />
    </div>
  );
}
