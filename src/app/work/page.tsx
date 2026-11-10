import type { Metadata } from "next";
import HomePage from "@/components/workspace/HomePage";
import { getProfile } from "@/lib/content";

const { name } = getProfile();

export const metadata: Metadata = {
  title: `Work | ${name}`,
};

// The home page, with the side panel open on the Work tab.
export default function WorkPage() {
  return <HomePage initialView={{ tab: "work" }} />;
}
