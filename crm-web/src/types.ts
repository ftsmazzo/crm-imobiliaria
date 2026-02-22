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
  status: string;
  codigo: string | null;
  descricao: string | null;
  qtdQuartos: number | null;
  qtdBanheiros: number | null;
  area?: number | string | null;
  usuarioResponsavelId: string | null;
  criadoEm: string;
  atualizadoEm: string;
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
