/**
 * BrasilAPI – consulta CNPJ gratuita (brasilapi.com.br).
 * GET https://brasilapi.com.br/cnpj/v1/{cnpj}
 * CNPJ com 14 dígitos, com ou sem formatação.
 */

export type BrasilApiCnpjResponse = {
  cnpj: string;
  razao_social: string;
  nome_fantasia?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cep?: string | null;
  municipio?: string | null;
  uf?: string | null;
  ddd_telefone_1?: string | null;
  email?: string | null;
};

export type CnpjFromApi = {
  razaoSocial: string;
  nomeFantasia?: string;
  endereco?: string;
  cep?: string;
  municipio?: string;
  uf?: string;
  telefone?: string;
  email?: string;
};

function onlyDigits(s: string): string {
  return s.replace(/\D/g, '');
}

function montarEndereco(r: BrasilApiCnpjResponse): string {
  const parts = [
    r.logradouro,
    r.numero,
    r.complemento,
    r.bairro,
    r.municipio,
    r.uf ? `UF ${r.uf}` : null,
  ].filter(Boolean);
  return parts.join(', ') || '';
}

/**
 * Busca dados do CNPJ na BrasilAPI. CNPJ pode ser com ou sem máscara.
 * Retorna null se inválido, não encontrado ou erro de rede.
 */
export async function buscarPorCnpj(cnpj: string): Promise<CnpjFromApi | null> {
  const digits = onlyDigits(cnpj);
  if (digits.length !== 14) return null;

  try {
    const res = await fetch(`https://brasilapi.com.br/cnpj/v1/${digits}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data: BrasilApiCnpjResponse = await res.json();
    return {
      razaoSocial: data.razao_social ?? '',
      nomeFantasia: data.nome_fantasia ?? undefined,
      endereco: montarEndereco(data) || undefined,
      cep: data.cep ?? undefined,
      municipio: data.municipio ?? undefined,
      uf: data.uf ?? undefined,
      telefone: data.ddd_telefone_1 ?? undefined,
      email: data.email ?? undefined,
    };
  } catch {
    return null;
  }
}
