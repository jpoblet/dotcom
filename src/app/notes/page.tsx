import type { Metadata } from "next";
import HomePage from "@/components/workspace/HomePage";
import { getProfile } from "@/lib/content";

const { name } = getProfile();

export const metadata: Metadata = {
  title: `AI Notes | ${name}`,
};

// The home page, with the side panel open on the AI Notes tab.
export default function NotesPage() {
  return <HomePage initialView={{ tab: "notes" }} />;
}
