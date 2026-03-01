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

export type UsuarioListItem = { id: string; nome: string };

export async function getUsuarios(): Promise<UsuarioListItem[]> {
  const res = await fetch(`${API_URL}/auth/usuarios`, { headers: authHeaders() });
  return handleRes(res);
}

// Contatos
export async function getContatos(estagio?: string): Promise<Contato[]> {
  const q = estagio ? `?estagio=${encodeURIComponent(estagio)}` : '';
  const res = await fetch(`${API_URL}/contatos${q}`, { headers: authHeaders() });
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

// Empreendimentos
export async function getEmpreendimentos(): Promise<Empreendimento[]> {
  const res = await fetch(`${API_URL}/empreendimentos`, { headers: authHeaders() });
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
export async function getImoveis(params?: { cidade?: string; bairro?: string; tipo?: string; status?: string }): Promise<Imovel[]> {
  const q = new URLSearchParams();
  if (params?.cidade) q.set('cidade', params.cidade);
  if (params?.bairro) q.set('bairro', params.bairro);
  if (params?.tipo) q.set('tipo', params.tipo);
  if (params?.status) q.set('status', params.status);
  const query = q.toString() ? `?${q}` : '';
  const res = await fetch(`${API_URL}/imoveis${query}`, { headers: authHeaders() });
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

export type ImovelFoto = { id: string; ordem: number; url: string };

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

export async function deleteImovelFoto(imovelId: string, fotoId: string): Promise<void> {
  const res = await fetch(`${API_URL}/imoveis/${imovelId}/fotos/${fotoId}`, {
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
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_URL}/dashboard/estatisticas`, { headers: authHeaders() });
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
