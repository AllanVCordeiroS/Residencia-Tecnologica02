import type { Metadata } from "next";
import DashboardContent from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "BEVOX | Dashboard Geral",
  description: "Visão geral operacional da Adega Distribution.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
