import type { ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";
import Footer from "@/components/layout/Footer";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell footer={<Footer />}>{children}</AppShell>;
}
