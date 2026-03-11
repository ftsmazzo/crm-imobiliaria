export type InteresseContato = {
  id: string;
  tipo: string;
  observacao: string | null;
  imovelId: string;
  imovel: { id: string; codigo: string | null; tipo: string; bairro: string | null; cidade: string | null };
};

export type Contato = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  origem: string | null;
  observacoes: string | null;
  estagio: string;
  valorDisponivel?: number | string | null;
  usuarioResponsavelId: string | null;
  criadoEm: string;
  atualizadoEm: string;
  usuarioResponsavel?: { id: string; nome: string; email: string } | null;
  interesses?: InteresseContato[];
};

export type Proprietario = {
  id: string;
  nome: string;
  cpf: string | null;
  rg: string | null;
  dataNascimento: string | null;
  estadoCivil: string | null;
  telefone: string | null;
  telefone2: string | null;
  email: string | null;
  endereco: string | null;
  observacoes: string | null;
  tipo: string | null;
  razaoSocial: string | null;
  cnpj: string | null;
  inscricaoEstadual: string | null;
  repLegalNome: string | null;
  repLegalCpf: string | null;
  repLegalContato: string | null;
  repLegalEmail: string | null;
  criadoEm: string;
  atualizadoEm: string;
  _count?: { imoveis: number };
};

export type Empreendimento = {
  id: string;
  nome: string;
  descricao: string | null;
  endereco: string | null;
  criadoEm: string;
  atualizadoEm: string;
  _count?: { imoveis: number };
};

export type Imovel = {
  id: string;
  tipo: string;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  valorVenda?: number | string | null;
  valorAluguel?: number | string | null;
  valorIptu?: number | string | null;
  valorCondominio?: number | string | null;
  status: string;
  destaque?: boolean | null;
  promocao?: boolean | null;
  codigo: string | null;
  quadra: string | null;
  lote: string | null;
  numeroMatricula: string | null;
  numeroIptu: string | null;
  cartorio: string | null;
  tipoListing: string | null;
  subtipo: string | null;
  exibirEnderecoSite: boolean | null;
  descricao: string | null;
  qtdQuartos: number | null;
  qtdBanheiros: number | null;
  qtdSalas: number | null;
  lavabo: number | null;
  qtdVagas: number | null;
  tipoVaga: string | null;
  area?: number | string | null;
  areaTerreno?: number | string | null;
  anoConstrucao: number | null;
  tipoPiso: string | null;
  pontosReferencia: string | null;
  eletrodomesticos: string | null;
  andarUnidade: number | null;
  qtdAndares: number | null;
  totalUnidades: number | null;
  qtdTorres: number | null;
  caracteristicas: string | null;
  empreendimentoId: string | null;
  proprietarioId: string | null;
  usuarioResponsavelId: string | null;
  criadoEm: string;
  atualizadoEm: string;
  empreendimento?: { id: string; nome: string } | null;
  proprietario?: { id: string; nome: string; email: string | null; telefone: string | null } | null;
  /** Contatos que demonstraram interesse neste imóvel (preenchido no GET do imóvel) */
  interesses?: { id: string; contato: { id: string; nome: string; email: string } }[];
  /** Semáforo de disponibilidade: verde < 15d, amarelo 15–30d, vermelho > 30d (preenchido pela API) */
  statusSemaforo?: 'verde' | 'amarelo' | 'vermelho';
  /** Dias desde última verificação ou cadastro */
  diasDesdeVerificacao?: number;
};

export type PrioridadeTarefa = 'baixa' | 'media' | 'alta';

export const PRIORIDADES_TAREFA: PrioridadeTarefa[] = ['baixa', 'media', 'alta'];

export const PRIORIDADE_LABEL: Record<PrioridadeTarefa, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};

export type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  dataPrevista: string | null;
  concluida: boolean;
  prioridade: string | null;
  usuarioId: string;
  contatoId: string | null;
  imovelId: string | null;
  criadoEm: string;
  usuario?: { id: string; nome: string };
  contato?: { id: string; nome: string } | null;
  imovel?: { id: string; codigo: string | null } | null;
};

export const ESTAGIOS = [
  'novo',
  'lead',
  'contato_inicial',
  'qualificado',
  'visita',
  'proposta',
  'fechado',
  'perdido',
  'perdido_remarketing',
] as const;
export type Estagio = (typeof ESTAGIOS)[number];

export const ESTAGIO_LABEL: Record<Estagio, string> = {
  novo: 'Novo',
  lead: 'Lead',
  contato_inicial: 'Contato inicial',
  qualificado: 'Qualificado',
  visita: 'Visita',
  proposta: 'Proposta',
  fechado: 'Fechado',
  perdido: 'Perdido',
  perdido_remarketing: 'Perdido com remarketing',
};
