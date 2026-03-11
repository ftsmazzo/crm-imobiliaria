import { getToken } from './auth';
import type { Contato, Empreendimento, Imovel, Proprietario, Tarefa } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleRes<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string | string[] };
    const msg = Array.isArray(err.message) ? err.message[0] : err.message || 'Erro na requisição';
    throw new Error(msg);
  }
  return res.json();
}

// Auth
export async function login(email: string, senha: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  return handleRes(res);
}

export type UsuarioListItem = { id: string; nome: string; email?: string; role?: string; ativo?: boolean };

export async function getUsuarios(): Promise<UsuarioListItem[]> {
  const res = await fetch(`${API_URL}/auth/usuarios`, { headers: authHeaders() });
  return handleRes(res);
}

export async function createUsuario(dto: { nome: string; email: string; senha: string; role?: string }) {
  const res = await fetch(`${API_URL}/auth/usuarios`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  return handleRes(res);
}

export async function updateUsuario(id: string, dto: { nome?: string; email?: string; senha?: string; role?: string; ativo?: boolean }) {
  const res = await fetch(`${API_URL}/auth/usuarios/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  return handleRes(res);
}

// Site config (personalização do site público) – apenas gestor
export type SiteConfigAdmin = {
  id: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  logoKey: string | null;
  heroImageKey: string | null;
  nome: string | null;
  whatsapp: string | null;
  endereco: string | null;
  creci: string | null;
  atualizadoEm: string;
};

export async function getSiteConfig(): Promise<SiteConfigAdmin> {
  const res = await fetch(`${API_URL}/site-config`, { headers: authHeaders() });
  return handleRes(res);
}

export async function updateSiteConfig(dto: { nome?: string; whatsapp?: string; endereco?: string; creci?: string }): Promise<SiteConfigAdmin> {
  const res = await fetch(`${API_URL}/site-config`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(dto),
  });
  return handleRes(res);
}

export async function uploadSiteConfigLogo(file: File): Promise<SiteConfigAdmin> {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/site-config/logo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return handleRes(res);
}

export async function uploadSiteConfigHero(file: File): Promise<SiteConfigAdmin> {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/site-config/hero`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return handleRes(res);
}

export async function removeSiteConfigLogo(): Promise<SiteConfigAdmin> {
  const res = await fetch(`${API_URL}/site-config/logo`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleRes(res);
}

export async function removeSiteConfigHero(): Promise<SiteConfigAdmin> {
  const res = await fetch(`${API_URL}/site-config/hero`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleRes(res);
}

export type LimparParaProducaoResult = { message: string; removidos: Record<string, number> };

export async function limparParaProducao(): Promise<LimparParaProducaoResult> {
  const res = await fetch(`${API_URL}/admin/limpar-para-producao`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleRes(res);
}

// Contatos
export async function getContatos(estagio?: string, usuarioResponsavelId?: string): Promise<Contato[]> {
  const q = new URLSearchParams();
  if (estagio) q.set('estagio', estagio);
  if (usuarioResponsavelId) q.set('usuarioResponsavelId', usuarioResponsavelId);
  const query = q.toString() ? `?${q}` : '';
  const res = await fetch(`${API_URL}/contatos${query}`, { headers: authHeaders() });
  return handleRes(res);
}

export async function getContato(id: string): Promise<Contato> {
  const res = await fetch(`${API_URL}/contatos/${id}`, { headers: authHeaders() });
  return handleRes(res);
}

export async function createContato(data: Partial<Contato>): Promise<Contato> {
  const res = await fetch(`${API_URL}/contatos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateContato(id: string, data: Partial<Contato>): Promise<Contato> {
  const res = await fetch(`${API_URL}/contatos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function deleteContato(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/contatos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await handleRes(res);
}

// Interesses (vínculo contato ↔ imóvel)
export async function createInteresse(contatoId: string, imovelId: string) {
  const res = await fetch(`${API_URL}/interesses`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ contatoId, imovelId }),
  });
  return handleRes(res);
}

export async function deleteInteresse(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/interesses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await handleRes(res);
}

// Empreendimentos
export async function getEmpreendimentos(nome?: string): Promise<Empreendimento[]> {
  const q = nome?.trim() ? `?nome=${encodeURIComponent(nome.trim())}` : '';
  const res = await fetch(`${API_URL}/empreendimentos${q}`, { headers: authHeaders() });
  return handleRes(res);
}

export async function getEmpreendimento(id: string): Promise<Empreendimento> {
  const res = await fetch(`${API_URL}/empreendimentos/${id}`, { headers: authHeaders() });
  return handleRes(res);
}

export async function createEmpreendimento(data: { nome: string; descricao?: string; endereco?: string }): Promise<Empreendimento> {
  const res = await fetch(`${API_URL}/empreendimentos`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateEmpreendimento(id: string, data: { nome?: string; descricao?: string; endereco?: string }): Promise<Empreendimento> {
  const res = await fetch(`${API_URL}/empreendimentos/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function deleteEmpreendimento(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/empreendimentos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await handleRes(res);
}

// Proprietários
export async function getProprietarios(): Promise<Proprietario[]> {
  const res = await fetch(`${API_URL}/proprietarios`, { headers: authHeaders() });
  return handleRes(res);
}

export async function getProprietario(id: string): Promise<Proprietario> {
  const res = await fetch(`${API_URL}/proprietarios/${id}`, { headers: authHeaders() });
  return handleRes(res);
}

export async function createProprietario(data: Partial<Proprietario>): Promise<Proprietario> {
  const res = await fetch(`${API_URL}/proprietarios`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateProprietario(id: string, data: Partial<Proprietario>): Promise<Proprietario> {
  const res = await fetch(`${API_URL}/proprietarios/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function deleteProprietario(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/proprietarios/${id}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) await handleRes(res);
}

// Imóveis
export async function getImoveis(params?: {
  cidade?: string;
  bairro?: string;
  tipo?: string;
  status?: string;
  statusSemaforo?: 'verde' | 'amarelo' | 'vermelho';
  usuarioResponsavelId?: string;
  valorVendaMin?: number;
  valorVendaMax?: number;
  valorAluguelMin?: number;
  valorAluguelMax?: number;
  qtdQuartosMin?: number;
  areaMin?: number;
  busca?: string;
}): Promise<Imovel[]> {
  const q = new URLSearchParams();
  if (params?.cidade) q.set('cidade', params.cidade);
  if (params?.bairro) q.set('bairro', params.bairro);
  if (params?.tipo) q.set('tipo', params.tipo);
  if (params?.status) q.set('status', params.status);
  if (params?.statusSemaforo) q.set('statusSemaforo', params.statusSemaforo);
  if (params?.usuarioResponsavelId) q.set('usuarioResponsavelId', params.usuarioResponsavelId);
  if (params?.valorVendaMin != null) q.set('valorVendaMin', String(params.valorVendaMin));
  if (params?.valorVendaMax != null) q.set('valorVendaMax', String(params.valorVendaMax));
  if (params?.valorAluguelMin != null) q.set('valorAluguelMin', String(params.valorAluguelMin));
  if (params?.valorAluguelMax != null) q.set('valorAluguelMax', String(params.valorAluguelMax));
  if (params?.qtdQuartosMin != null) q.set('qtdQuartosMin', String(params.qtdQuartosMin));
  if (params?.areaMin != null) q.set('areaMin', String(params.areaMin));
  if (params?.busca) q.set('busca', params.busca);
  const query = q.toString() ? `?${q}` : '';
  const res = await fetch(`${API_URL}/imoveis${query}`, { headers: authHeaders() });
  return handleRes(res);
}

export async function confirmarDisponibilidadeImovel(id: string, observacao?: string): Promise<Imovel> {
  const res = await fetch(`${API_URL}/imoveis/${id}/confirmar-disponibilidade`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(observacao ? { observacao } : {}),
  });
  return handleRes(res);
}

export async function getImovel(id: string): Promise<Imovel> {
  const res = await fetch(`${API_URL}/imoveis/${id}`, { headers: authHeaders() });
  return handleRes(res);
}

export async function createImovel(data: Partial<Imovel>): Promise<Imovel> {
  const res = await fetch(`${API_URL}/imoveis`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateImovel(id: string, data: Partial<Imovel>): Promise<Imovel> {
  const res = await fetch(`${API_URL}/imoveis/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function deleteImovel(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/imoveis/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await handleRes(res);
}

export type ImovelFoto = { id: string; ordem: number; capa?: boolean; url: string };

export async function getImovelFotos(imovelId: string): Promise<ImovelFoto[]> {
  const token = getToken();
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/fotos`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return handleRes(res);
}

export async function uploadImovelFoto(imovelId: string, file: File): Promise<{ id: string; key: string; ordem: number }> {
  const token = getToken();
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/fotos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return handleRes(res);
}

export async function setImovelFotoCapa(imovelId: string, fotoId: string): Promise<ImovelFoto[]> {
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/fotos/${fotoId}/capa`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return handleRes(res);
}

export async function deleteImovelFoto(imovelId: string, fotoId: string): Promise<void> {
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/fotos/${fotoId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await handleRes(res);
}

export type ImovelDocumento = { id: string; tipo: string; nome: string | null; criadoEm: string; url: string };

export async function getImovelDocumentos(imovelId: string): Promise<ImovelDocumento[]> {
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/documentos`, { headers: authHeaders() });
  return handleRes(res);
}

export async function uploadImovelDocumento(imovelId: string, file: File, tipo: string): Promise<{ id: string; tipo: string; nome: string | null }> {
  const form = new FormData();
  form.append('file', file);
  form.append('tipo', tipo);
  const token = getToken();
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/documentos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return handleRes(res);
}

export async function getImovelDocumentoUrl(imovelId: string, docId: string): Promise<{ url: string }> {
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/documentos/${docId}/url`, { headers: authHeaders() });
  return handleRes(res);
}

export async function deleteImovelDocumento(imovelId: string, docId: string): Promise<void> {
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/documentos/${docId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await handleRes(res);
}

// Tipos de documento (imóvel / processo)
export type TipoDocumento = { id: string; nome: string; contexto: string };

export async function getTiposDocumento(contexto?: 'imovel' | 'processo'): Promise<TipoDocumento[]> {
  const q = contexto ? `?contexto=${contexto}` : '';
  const res = await fetch(`${API_URL}/tipo-documento${q}`, { headers: authHeaders() });
  return handleRes(res);
}

// Documentos do processo (lead/contato)
export type ProcessoDocumento = {
  id: string;
  contatoId: string;
  imovelId: string | null;
  tipoDocumentoId: string | null;
  tipoDocumento: { id: string; nome: string } | null;
  nomeOriginal: string | null;
  criadoEm: string;
  url: string;
};

export async function getContatoDocumentos(contatoId: string): Promise<ProcessoDocumento[]> {
  const res = await fetch(`${API_URL}/contatos/${contatoId}/documentos`, { headers: authHeaders() });
  return handleRes(res);
}

export async function uploadContatoDocumento(
  contatoId: string,
  file: File,
  opts?: { tipoDocumentoId?: string; imovelId?: string },
): Promise<ProcessoDocumento> {
  const form = new FormData();
  form.append('file', file);
  if (opts?.tipoDocumentoId) form.append('tipoDocumentoId', opts.tipoDocumentoId);
  if (opts?.imovelId) form.append('imovelId', opts.imovelId);
  const token = getToken();
  const res = await fetch(`${API_URL}/contatos/${contatoId}/documentos`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return handleRes(res);
}

export async function getContatoDocumentoUrl(contatoId: string, docId: string): Promise<{ url: string }> {
  const res = await fetch(`${API_URL}/contatos/${contatoId}/documentos/${docId}/url`, { headers: authHeaders() });
  return handleRes(res);
}

export async function deleteContatoDocumento(contatoId: string, docId: string): Promise<void> {
  const res = await fetch(`${API_URL}/contatos/${contatoId}/documentos/${docId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await handleRes(res);
}

// Dashboard
export type DashboardStats = {
  contatosPorEstagio: Record<string, number>;
  tarefasAtrasadas: number;
  imoveisPorStatus: Record<string, number>;
  novosLeads: number;
  leadsNoPeriodo?: number;
  imoveisNoPeriodo?: number;
};

export async function getDashboardStats(params?: { dataInicio?: string; dataFim?: string }): Promise<DashboardStats> {
  const q = new URLSearchParams();
  if (params?.dataInicio) q.set('dataInicio', params.dataInicio);
  if (params?.dataFim) q.set('dataFim', params.dataFim);
  const query = q.toString() ? `?${q}` : '';
  const res = await fetch(`${API_URL}/dashboard/estatisticas${query}`, { headers: authHeaders() });
  return handleRes(res);
}

// Tarefas
export async function getTarefas(params?: { usuarioId?: string; dataPrevista?: string }): Promise<Tarefa[]> {
  const q = new URLSearchParams();
  if (params?.usuarioId) q.set('usuarioId', params.usuarioId);
  if (params?.dataPrevista) q.set('dataPrevista', params.dataPrevista);
  const query = q.toString() ? `?${q}` : '';
  const res = await fetch(`${API_URL}/tarefas${query}`, { headers: authHeaders() });
  return handleRes(res);
}

export async function createTarefa(data: {
  titulo: string;
  descricao?: string;
  dataPrevista?: string;
  prioridade?: string;
  contatoId?: string;
  imovelId?: string;
  usuarioId?: string;
}): Promise<Tarefa> {
  const res = await fetch(`${API_URL}/tarefas`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function updateTarefa(id: string, data: Partial<Tarefa>): Promise<Tarefa> {
  const res = await fetch(`${API_URL}/tarefas/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleRes(res);
}

export async function deleteTarefa(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tarefas/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) await handleRes(res);
}
