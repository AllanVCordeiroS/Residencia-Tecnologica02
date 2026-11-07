import PainelOperacional from "@/components/operacoes/PainelOperacional";
import { obterDadosOperacionais } from "@/services/operacional";

export const metadata = { title: "BEVOX | Central de Operações" };

export default async function CentralOperacoesPage() {
  const dados = await obterDadosOperacionais();
  return <PainelOperacional dados={dados} />;
}