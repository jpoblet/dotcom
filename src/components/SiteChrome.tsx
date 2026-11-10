import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Logo from "@/components/Logo";
import ThemeSwitcher from "@/components/ThemeSwitcher";

/**
 * The header and footer of the home page's chat column, shared with pages
 * that stand on their own (the 404), so the logo and the footer sit in
 * exactly the same place everywhere.
 */

/**
 * Floating over the content; the logo left, `children` right. Transparent
 * on desktop; on phones and tablets it has the page background, fading
 * out below, so scrolled text doesn't run under the logo and controls.
 */
export function SiteHeader({ logoHref, children }: { logoHref?: string; children?: React.ReactNode }) {
  const logo = <Logo className="vt-logo h-12 fill-current shrink-0" />;
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between gap-3 px-4 sm:px-6 max-lg:bg-background max-lg:after:pointer-events-none max-lg:after:absolute max-lg:after:inset-x-0 max-lg:after:top-full max-lg:after:h-6 max-lg:after:bg-gradient-to-b max-lg:after:from-background max-lg:after:to-transparent">
      {logoHref ? (
        <Link href={logoHref} aria-label="Home">
          {logo}
        </Link>
      ) : (
        logo
      )}
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}

/**
 * Email, profiles and the theme. Layered above what's behind it, so the
 * theme menu, which opens upwards, can always be clicked.
 */
export function SiteFooterBar({ email, links }: { email: string; links: { label: string; href: string }[] }) {
  return (
    <div className="relative z-30 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 pb-3 text-xs text-foreground-secondary">
      <a href={`mailto:${email}`} className="vt-foot-start truncate hover:text-foreground">
        {email}
      </a>
      <div className="vt-foot-end flex items-center gap-3">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group/link inline-flex items-center hover:text-foreground"
          >
            {link.label}
            {/* Opens elsewhere. */}
            <ArrowUpRight size={13} aria-hidden="true" className="ml-0.5 transition-transform duration-200 group-hover/link:-translate-y-px group-hover/link:translate-x-px" />
          </a>
        ))}
        <ThemeSwitcher />
      </div>
    </div>
  );
}
