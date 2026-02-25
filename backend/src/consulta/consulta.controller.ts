import { Controller, Get, Param } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

const BRASILAPI_CNPJ = 'https://brasilapi.com.br/cnpj/v1';

function onlyDigits(s: string): string {
  return s.replace(/\D/g, '');
}

@Controller('consulta')
export class ConsultaController {
  /**
   * Proxy para consulta CNPJ (BrasilAPI). Evita CORS no front e centraliza a chamada.
   * GET /consulta/cnpj/:cnpj (14 dígitos, com ou sem formatação).
   */
  @Get('cnpj/:cnpj')
  async cnpj(@CurrentUser() _user: Usuario, @Param('cnpj') cnpj: string) {
    const digits = onlyDigits(cnpj);
    if (digits.length !== 14) {
      return { ok: false, message: 'CNPJ deve ter 14 dígitos' };
    }
    try {
      const res = await fetch(`${BRASILAPI_CNPJ}/${digits}`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        if (res.status === 404) return { ok: false, message: 'CNPJ não encontrado' };
        return { ok: false, message: 'Serviço temporariamente indisponível' };
      }
      const data = await res.json();
      const parts = [
        data.logradouro,
        data.numero,
        data.complemento,
        data.bairro,
        data.municipio,
        data.uf ? `UF ${data.uf}` : null,
      ].filter(Boolean);
      return {
        ok: true,
        razaoSocial: data.razao_social ?? '',
        nomeFantasia: data.nome_fantasia ?? undefined,
        endereco: parts.length ? parts.join(', ') : undefined,
        cep: data.cep ?? undefined,
        municipio: data.municipio ?? undefined,
        uf: data.uf ?? undefined,
        telefone: data.ddd_telefone_1 ?? undefined,
        email: data.email ?? undefined,
      };
    } catch {
      return { ok: false, message: 'Erro ao consultar CNPJ' };
    }
  }
}
