"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
// ... resto do seu código continua aqui

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Esquema de validação com Zod
const schemaTarefa = z.object({
  titulo: z.string().min(5, 'O título precisa ter pelo menos 5 caracteres.'),
  descricao: z.string().optional(),
  responsavel: z.string().min(1, 'Selecione um responsável da equipe.'),
  dataVencimento: z.string().min(1, 'A data de vencimento é obrigatória.'),
  prioridade: z.enum(['BAIXA', 'MEDIA', 'ALTA'], {
    errorMap: () => ({ message: 'Selecione uma prioridade válida.' })
  }),
});

type DadosTarefa = z.infer<typeof schemaTarefa>;

export function NovaTarefa() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<DadosTarefa>({
    resolver: zodResolver(schemaTarefa),
  });

  const onSubmit = async (data: DadosTarefa) => {
    // Simulação de chamada à API do BEVOX
    console.log('Nova tarefa submetida:', data);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    reset();
    alert('Tarefa criada com sucesso!');
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Nova Tarefa</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            {...register('titulo')}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.titulo ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ex: Atualizar catálogo de vinhos"
          />
          {errors.titulo && <span className="text-red-500 text-xs mt-1">{errors.titulo.message}</span>}
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            {...register('descricao')}
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="Detalhes da tarefa..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Responsável */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
            <select
              {...register('responsavel')}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${errors.responsavel ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Selecione...</option>
              <option value="usuario1">João (Distribuição)</option>
              <option value="usuario2">Maria (Comercial)</option>
            </select>
            {errors.responsavel && <span className="text-red-500 text-xs mt-1">{errors.responsavel.message}</span>}
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
            <input
              type="date"
              {...register('dataVencimento')}
              className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${errors.dataVencimento ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.dataVencimento && <span className="text-red-500 text-xs mt-1">{errors.dataVencimento.message}</span>}
          </div>
        </div>

        {/* Prioridade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
          <select
            {...register('prioridade')}
            className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none ${errors.prioridade ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Selecione...</option>
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Média</option>
            <option value="ALTA">Alta</option>
          </select>
          {errors.prioridade && <span className="text-red-500 text-xs mt-1">{errors.prioridade.message}</span>}
        </div>

        {/* Botão de Submit */}
        <div className="pt-4 text-right">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:bg-blue-400"
          >
            {isSubmitting ? 'Salvando...' : 'Criar Tarefa'}
          </button>
        </div>
      </form>
    </div>
  );
}