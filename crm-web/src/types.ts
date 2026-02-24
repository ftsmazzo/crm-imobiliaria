export type Contato = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  origem: string | null;
  observacoes: string | null;
  estagio: string;
  usuarioResponsavelId: string | null;
  criadoEm: string;
  atualizadoEm: string;
  usuarioResponsavel?: { id: string; nome: string; email: string } | null;
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
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  valorVenda?: number | string | null;
  valorAluguel?: number | string | null;
  valorIptu?: number | string | null;
  valorCondominio?: number | string | null;
  status: string;
  codigo: string | null;
  quadra: string | null;
  lote: string | null;
  descricao: string | null;
  qtdQuartos: number | null;
  qtdBanheiros: number | null;
  qtdSalas: number | null;
  lavabo: number | null;
  area?: number | string | null;
  areaTerreno?: number | string | null;
  anoConstrucao: number | null;
  tipoPiso: string | null;
  empreendimentoId: string | null;
  proprietarioId: string | null;
  usuarioResponsavelId: string | null;
  criadoEm: string;
  atualizadoEm: string;
  empreendimento?: { id: string; nome: string } | null;
  proprietario?: { id: string; nome: string; email: string; telefone?: string | null } | null;
};

export type Tarefa = {
  id: string;
  titulo: string;
  descricao: string | null;
  dataPrevista: string | null;
  concluida: boolean;
  usuarioId: string;
  contatoId: string | null;
  imovelId: string | null;
  criadoEm: string;
  usuario?: { id: string; nome: string };
  contato?: { id: string; nome: string } | null;
  imovel?: { id: string; codigo: string | null } | null;
};

export const ESTAGIOS = ['novo', 'qualificado', 'visita', 'proposta', 'fechado'] as const;
export type Estagio = (typeof ESTAGIOS)[number];
