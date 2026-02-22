/**
 * ViaCEP – API gratuita de consulta de CEP (viacep.com.br).
 * Documentação: https://viacep.com.br/
 * GET https://viacep.com.br/ws/{CEP}/json/ (CEP com 8 dígitos, só números).
 * Resposta com "erro": true quando CEP não existe.
 */

export type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

export type EnderecoFromCep = {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
};

function onlyDigits(s: string): string {
  return s.replace(/\D/g, '');
}

/**
 * Busca endereço pelo CEP. CEP pode ser com ou sem máscara (ex: 01001-000 ou 01001000).
 * Retorna null se CEP inválido, não encontrado ou em caso de erro de rede.
 */
export async function buscarPorCep(cep: string): Promise<EnderecoFromCep | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data: ViaCepResponse = await res.json();
    if (data.erro === true) return null;
    return {
      cep: data.cep ?? digits,
      rua: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
    };
  } catch {
    return null;
  }
}
