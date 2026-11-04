import type { Metadata } from "next";
import PreferenciasSistema from "@/components/configuracoes/PreferenciasSistema";

export const metadata: Metadata = {
  title: "Preferências do Sistema | BEVOX",
};

export default function ConfiguracoesPage() {
  return <PreferenciasSistema />;
}
