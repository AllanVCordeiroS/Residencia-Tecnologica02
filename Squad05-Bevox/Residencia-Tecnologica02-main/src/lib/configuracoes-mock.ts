import type {
  CodigoMoeda,
  MetodoPagamentoPadrao,
  MetodoRecebimentoPadrao,
  OpcaoSelect,
  ParametrosFinanceiros,
  RegraDiasNaoUteis,
} from '@/types/configuracoes';

export const OPCOES_MOEDA_BASE: OpcaoSelect<CodigoMoeda>[] = [
  { valor: 'BRL', rotulo: 'BRL - Real Brasileiro' },
  { valor: 'USD', rotulo: 'USD - Dólar Americano' },
  { valor: 'EUR', rotulo: 'EUR - Euro' },
];

export const SIMBOLO_POR_MOEDA: Record<CodigoMoeda, string> = {
  BRL: 'R$',
  USD: 'US$',
  EUR: '€',
};

export const OPCOES_PRAZO_FORNECEDORES: OpcaoSelect<number>[] = [
  { valor: 7, rotulo: '7 dias' },
  { valor: 15, rotulo: '15 dias' },
  { valor: 30, rotulo: '30 dias' },
  { valor: 45, rotulo: '45 dias' },
  { valor: 60, rotulo: '60 dias' },
];

export const OPCOES_REGRA_DIAS_NAO_UTEIS: OpcaoSelect<RegraDiasNaoUteis>[] = [
  { valor: 'proximo_dia_util', rotulo: 'Pagar no próximo dia útil' },
  { valor: 'dia_util_anterior', rotulo: 'Pagar no dia útil anterior' },
  { valor: 'manter_data', rotulo: 'Manter a data original' },
];

export const OPCOES_METODO_PAGAMENTO: OpcaoSelect<MetodoPagamentoPadrao>[] = [
  { valor: 'pix_boleto_ted', rotulo: 'PIX, Boleto Bancário, TED' },
  { valor: 'pix_boleto', rotulo: 'PIX, Boleto Bancário' },
  { valor: 'ted_doc', rotulo: 'TED, DOC' },
  { valor: 'cartao_corporativo', rotulo: 'Cartão Corporativo' },
];

export const OPCOES_METODO_RECEBIMENTO: OpcaoSelect<MetodoRecebimentoPadrao>[] = [
  { valor: 'boleto_faturado_30_60', rotulo: 'Boleto Faturado (30/60d)' },
  { valor: 'pix_a_vista', rotulo: 'PIX à Vista' },
  { valor: 'cartao_credito', rotulo: 'Cartão de Crédito' },
];

export const parametrosFinanceirosMock: ParametrosFinanceiros = {
  configuracaoGeral: {
    moedaBase: 'BRL',
    simboloMonetario: 'R$',
    simboloMonetarioAlternativo: 'R$',
    conversaoAutomaticaAtiva: true,
    moedas: [
      {
        id: 'moeda-usd',
        codigo: 'USD',
        bandeira: '🇺🇸',
        taxaConversao: 5.15,
        dataAvaliacaoHistorica: '2026-08-13T14:30:00-03:00',
      },
      {
        id: 'moeda-eur',
        codigo: 'EUR',
        bandeira: '🇪🇺',
        taxaConversao: 5.6,
        dataAvaliacaoHistorica: '2026-08-12T11:15:00-03:00',
      },
    ],
  },
  categorias: [
    { id: 'cat-receitas-vendas', nome: 'Receitas de Vendas' },
    { id: 'cat-receitas-servicos', nome: 'Receitas de Serviços' },
    { id: 'cat-cmv', nome: 'Custo das Mercadorias Vendidas (CMV)' },
    { id: 'cat-desp-operacionais', nome: 'Despesas Operacionais' },
    { id: 'cat-desp-financeiras', nome: 'Despesas Financeiras' },
    { id: 'cat-desp-administrativas', nome: 'Despesas Administrativas' },
  ],
  regras: {
    prazoPadraoFornecedoresDias: 30,
    regraDiasNaoUteis: 'proximo_dia_util',
    multaAtrasoPercentual: 2,
    jurosMoraMensalPercentual: 1,
  },
  integracoes: {
    vincularVendasClientesAutomaticamente: true,
    exigirCentroCustoLancamentos: true,
    metodoPagamentoPadrao: 'pix_boleto_ted',
    metodoRecebimentoPadrao: 'boleto_faturado_30_60',
  },
};

const aguardar = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function buscarParametrosFinanceiros(): Promise<ParametrosFinanceiros> {
  await aguardar(150);
  return structuredClone(parametrosFinanceirosMock);
}

export async function salvarParametrosFinanceiros(
  dados: ParametrosFinanceiros,
): Promise<{ sucesso: true; dados: ParametrosFinanceiros }> {
  await aguardar(700);
  return { sucesso: true, dados: structuredClone(dados) };
}
