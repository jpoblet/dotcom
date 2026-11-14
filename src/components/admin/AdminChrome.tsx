import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { signOut } from "@/app/admin/actions";
import { SiteFooterBar, SiteHeader } from "@/components/SiteChrome";
import { getProfile } from "@/lib/content";
import AdminTabs from "./AdminTabs";

/**
 * The admin's frame: the site's own header (the logo, then the sections
 * where Work / AI Notes sit) and footer bar, around a scrolling page, laid
 * out like the 404 so everything lands in the same place as on the site.
 * Without `signedIn` (the login page) the header holds just a way back.
 */
export default function AdminChrome({
  children,
  signedIn = true,
}: {
  children: React.ReactNode;
  signedIn?: boolean;
}) {
  const { email, links } = getProfile();
  const quiet =
    "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs text-foreground-secondary transition-colors hover:bg-background-inverse/6 hover:text-foreground cursor-pointer";
  return (
    <div
      data-own-chrome
      className="relative flex h-dvh flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      <SiteHeader logoHref="/">
        {signedIn ? (
          <>
            <Suspense>
              <AdminTabs />
            </Suspense>
            <span aria-hidden="true" className="mx-2 hidden h-4 w-px bg-background-inverse/15 sm:block" />
            <Link href="/" className={`${quiet} max-sm:hidden`}>
              Site
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
            <form action={signOut}>
              <button type="submit" title="Sign out" aria-label="Sign out" className={`${quiet} size-8 justify-center px-0`}>
                <LogOut size={14} />
              </button>
            </form>
          </>
        ) : (
          <Link href="/" className={quiet}>
            Back to the site
          </Link>
        )}
      </SiteHeader>
      <main className="relative min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-24 pb-16 sm:px-8 lg:pt-28">
        {children}
      </main>
      <SiteFooterBar email={email} links={links} />
    </div>
  );
}
