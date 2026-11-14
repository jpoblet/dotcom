import type { Metadata } from "next";
import AdminChrome from "@/components/admin/AdminChrome";
import { safeAdminPath } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in | Admin",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string }> };

/** Signing in, laid out like the home page's opening: the name, then the box. */
export default async function LoginPage({ searchParams }: Props) {
  const next = (await searchParams).next;
  return (
    <AdminChrome signedIn={false}>
      <div className="mx-auto flex min-h-full w-full max-w-[42rem] flex-col justify-center pb-16">
        <h1 className="font-mono text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-balance sm:text-6xl">
          Welcome back
        </h1>
        <p className="mt-3 font-mono text-base text-foreground-secondary">
          What visitors ask the chat, and where they come from
        </p>
        <LoginForm next={next ? safeAdminPath(next) : undefined} />
      </div>
    </AdminChrome>
  );
}
