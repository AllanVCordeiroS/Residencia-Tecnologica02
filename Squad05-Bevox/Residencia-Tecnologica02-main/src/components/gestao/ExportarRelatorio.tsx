"use client";

import React, { useState } from 'react';

export function ExportarRelatorio() {
// ... resto do seu código continua aqui

  const [isExporting, setIsExporting] = useState(false);
  const [periodo, setPeriodo] = useState('7d');

  const handleExport = async (formato: 'PDF' | 'CSV') => {
    setIsExporting(true);
    // Lógica para chamar o endpoint de exportação do BEVOX
    console.log(`Gerando relatório da Adega em ${formato} para os últimos ${periodo}...`);
    
    // Simulando tempo de geração de arquivo
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsExporting(false);
    alert(`Relatório ${formato} gerado e baixado com sucesso!`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Exportar Indicadores</h2>
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Selecione o período e o formato para baixar os relatórios de vendas e gestão B2B.
      </p>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Período de Análise</label>
        <select 
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
          <option value="mes_atual">Mês Atual</option>
          <option value="trimestre">Último Trimestre</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleExport('CSV')}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar CSV
        </button>

        <button
          onClick={() => handleExport('PDF')}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Gerar PDF
        </button>
      </div>

      {isExporting && (
        <div className="mt-4 text-center text-sm text-blue-600 animate-pulse">
          Processando relatório, aguarde...
        </div>
      )}
    </div>
  );
}