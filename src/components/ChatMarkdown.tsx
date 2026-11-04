import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";

const components: Components = {
  a({ href = "", children }) {
    // Site pages (e.g. /projects/okasewa) navigate in-app; everything else
    // opens in a new tab. No prefetch: answers can mention many pages.
    if (href.startsWith("/")) {
      return (
        <Link href={href} prefetch={false}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};

/**
 * Renders an AI reply. react-markdown never renders raw HTML, so model
 * output can't inject markup or scripts into the page.
 */
export default function ChatMarkdown({ text }: { text: string }) {
  return <ReactMarkdown components={components}>{text}</ReactMarkdown>;
}
