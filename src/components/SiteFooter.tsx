interface SiteFooterProps {
  email: string;
  links: { label: string; href: string }[];
  /** Positioning and vertical padding, which differ per page. */
  className?: string;
}

export default function SiteFooter({ email, links, className = "" }: SiteFooterProps) {
  return (
    <footer
      className={`bg-background px-5 sm:px-10 text-[0.6250rem] sm:text-xs text-foreground ${className}`}
    >
      <div className="flex flex-row gap-2 sm:gap-8 justify-between items-center">
        <a href={`mailto:${email}`} className="font-normal py-2 -my-2">
          {email}
        </a>
        <div className="flex gap-6 sm:gap-10">
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
