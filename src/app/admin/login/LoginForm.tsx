"use client";

import { useActionState } from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";
import { type LoginState, signIn } from "../actions";

/** The password, in a field drawn like the chat's "Ask me anything" box. */
export default function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <form action={action} className="mt-12">
      <input type="hidden" name="next" value={next ?? ""} />
      <label
        className={`group/field flex items-center gap-2 rounded-2xl border bg-background py-2 pr-2 pl-4 transition-[border-color,box-shadow] duration-200 cursor-text focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-background-inverse)_7%,transparent)] ${
          state.error
            ? "border-background-inverse/60"
            : "border-background-inverse/20 focus-within:border-background-inverse/60"
        }`}
      >
        <span className="sr-only">Password</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Password"
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "login-error" : undefined}
          className="block min-h-10 min-w-0 flex-1 bg-transparent py-2 pl-1.5 text-base placeholder:text-foreground-secondary focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Sign in"
          title="Sign in"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background-inverse text-background transition-opacity hover:opacity-90 cursor-pointer disabled:cursor-default disabled:opacity-60"
        >
          {pending ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowUp size={17} strokeWidth={2.25} />}
        </button>
      </label>
      <p id="login-error" role="alert" className="mt-3 min-h-6 pl-5 text-xs text-foreground-secondary">
        {state.error}
      </p>
    </form>
  );
}
