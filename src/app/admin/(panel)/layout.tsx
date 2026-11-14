import type { Metadata } from "next";
import AdminChrome from "@/components/admin/AdminChrome";

// Private (see src/proxy.ts): never indexed.
export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}
