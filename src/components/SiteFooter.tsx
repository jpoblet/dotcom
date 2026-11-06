import ThemeSwitcher from "@/components/ThemeSwitcher";

interface SiteFooterProps {
  email: string;
  links: { label: string; href: string }[];
}

/**
 * The site footer, fixed to the bottom of the screen on every page
 * (rendered once in layout.tsx): email on the left, theme switcher in the
 * centre, profiles on the right. Pages leave room for it at the bottom.
 */
export default function SiteFooter({ email, links }: SiteFooterProps) {
  return (
    <footer data-site-footer className="fixed bottom-0 left-0 right-0 z-50 bg-background before:pointer-events-none before:absolute before:inset-x-0 before:bottom-full before:h-6 before:bg-gradient-to-t before:from-background before:to-transparent px-4 sm:px-10 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-[calc(1rem+env(safe-area-inset-bottom))] text-[0.6250rem] sm:text-xs text-foreground">
      {/* Phones: spread evenly (a perfectly centred switcher would crop the
          email). Larger screens: switcher exactly in the centre. */}
      <div className="h-11 sm:h-12 flex justify-between items-center gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
        <a
          href={`mailto:${email}`}
          className="justify-self-start font-normal py-2 -my-2 whitespace-nowrap"
        >
          {email}
        </a>
        <ThemeSwitcher />
        <div className="justify-self-end flex gap-2.5 sm:gap-10">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline py-2 -my-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
