import { NovaTarefa } from '@/components/gestao/NovaTarefa';
import { ExportarRelatorio } from '@/components/gestao/ExportarRelatorio';

export default function GestaoPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Painel de Gestão - BEVOX
      </h1>
      
      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        <NovaTarefa />
        <ExportarRelatorio />
      </div>
    </main>
  );
}