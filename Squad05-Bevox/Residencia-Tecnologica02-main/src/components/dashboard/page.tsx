// SEUS IMPORTS ANTIGOS FICAM AQUI:
import Image from "next/image";
import Link from "next/link";
// ... outros imports do seu projeto ...

// ADICIONE OS IMPORTS NOVOS AQUI:
import { NovaTarefa } from '@/components/gestao/NovaTarefa';
import { ExportarRelatorio } from '@/components/gestao/ExportarRelatorio';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      
      {/* --------------------------------------------------- */}
      {/* SUA PARTE ANTIGA CONTINUA INTACTA AQUI EM CIMA */}
      <h1 className="text-3xl font-bold">Meu Dashboard Original</h1>
      <div className="conteudo-antigo-da-sua-tela">
         <p>Aqui ficam os gráficos, tabelas e cards que eu já tinha feito...</p>
      </div>
      {/* --------------------------------------------------- */}


      {/* --------------------------------------------------- */}
      {/* SUA PARTE NOVA SENDO ADICIONADA (Ex: no final da página) */}
      <section className="mt-12 pt-8 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Gestão de Tarefas e Relatórios
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <NovaTarefa />
          <ExportarRelatorio />
        </div>
      </section>
      {/* --------------------------------------------------- */}

    </main>
  );
}