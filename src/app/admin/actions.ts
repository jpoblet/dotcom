"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  isValidPassword,
  safeAdminPath,
  sessionToken,
} from "@/lib/admin-auth";

export type LoginState = { error?: string };

/** A short pause on every attempt makes guessing the password slow. */
const pause = () => new Promise((resolve) => setTimeout(resolve, 600));

export async function signIn(_state: LoginState, form: FormData): Promise<LoginState> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return { error: "The admin isn't set up here: ADMIN_PASSWORD is missing." };

  await pause();
  const given = String(form.get("password") ?? "");
  if (!given || !(await isValidPassword(given, password))) {
    return { error: "That's not the password. Try again." };
  }

  (await cookies()).set(ADMIN_COOKIE, await sessionToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  redirect(safeAdminPath(form.get("next")));
}

export async function signOut() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
