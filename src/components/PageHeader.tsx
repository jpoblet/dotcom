import Link from "next/link";
import Logo from "@/components/Logo";

/** Header for content pages (projects). The home page has its own. */
export default function PageHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="Home"
          className="text-foreground hover:opacity-70 transition-opacity duration-200"
        >
          <Logo className="h-9 fill-current" />
        </Link>
        <Link
          href="/projects"
          className="text-xs underline underline-offset-2 hover:opacity-70 transition-opacity duration-200"
        >
          All projects
        </Link>
      </div>
    </header>
  );
}
