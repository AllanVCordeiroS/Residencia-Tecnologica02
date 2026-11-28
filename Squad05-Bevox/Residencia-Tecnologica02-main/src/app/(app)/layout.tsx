import type { ReactNode } from "react";
import AppShell from "@/components/layout/AppShell";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/providers/AuthProvider";
import { requireServerSession } from "@/server/auth/session";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await requireServerSession();
  return <AuthProvider initialSession={session}><AppShell footer={<Footer />}>{children}</AppShell></AuthProvider>;
}
