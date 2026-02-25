const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export type ImovelFotoPublic = { id: string; url: string };

export type ImovelPublic = {
  id: string;
  tipo: string;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  cep: string | null;
  exibirEnderecoSite?: boolean;
  valorVenda: string | null;
  valorAluguel: string | null;
  valorIptu?: string | null;
  valorCondominio?: string | null;
  status: string;
  codigo: string | null;
  descricao: string | null;
  qtdQuartos: number | null;
  qtdBanheiros: number | null;
  qtdSalas?: number | null;
  lavabo?: number | null;
  area: string | null;
  areaTerreno?: string | null;
  qtdVagas?: number | null;
  tipoVaga?: string | null;
  anoConstrucao?: number | null;
  tipoPiso?: string | null;
  pontosReferencia?: string | null;
  eletrodomesticos?: string | null;
  andarUnidade?: number | null;
  caracteristicas?: string | null;
  fotos?: ImovelFotoPublic[];
};

export type LeadPayload = {
  nome: string;
  email: string;
  telefone?: string;
  mensagem?: string;
  imovelId?: string;
  origem?: string;
};

export async function getImoveis(params?: {
  cidade?: string;
  bairro?: string;
  tipo?: string;
  status?: string;
}): Promise<ImovelPublic[]> {
  const q = new URLSearchParams();
  if (params?.cidade) q.set('cidade', params.cidade);
  if (params?.bairro) q.set('bairro', params.bairro);
  if (params?.tipo) q.set('tipo', params.tipo);
  if (params?.status) q.set('status', params.status);
  const query = q.toString() ? `?${q}` : '';
  const res = await fetch(`${API_URL}/api/public/imoveis${query}`);
  if (!res.ok) throw new Error('Erro ao carregar imóveis');
  return res.json();
}

export async function getImovel(id: string): Promise<ImovelPublic> {
  const res = await fetch(`${API_URL}/api/public/imoveis/${id}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Imóvel não encontrado');
    throw new Error('Erro ao carregar imóvel');
  }
  return res.json();
}

export async function enviarLead(data: LeadPayload): Promise<{ id: string; message: string }> {
  const res = await fetch(`${API_URL}/api/public/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (body as { message?: string })?.message || 'Erro ao enviar mensagem';
    throw new Error(msg);
  }
  return body as { id: string; message: string };
}
