import { ForbiddenException, Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Limpa dados de desenvolvimento: imóveis, leads (contatos), interesses, tarefas,
   * documentos de processo, proprietários. Mantém: usuários, site config, tipo documento, empreendimentos.
   */
  async limparParaProducao(user: Usuario): Promise<{ message: string; removidos: Record<string, number> }> {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode executar esta ação');
    }

    const removidos: Record<string, number> = {};

    await this.prisma.$transaction(async (tx) => {
      const tarefas = await tx.tarefa.deleteMany({});
      removidos.tarefas = tarefas.count;

      const interesses = await tx.interesse.deleteMany({});
      removidos.interesses = interesses.count;

      const processoDoc = await tx.processoDocumento.deleteMany({});
      removidos.documentosProcesso = processoDoc.count;

      const contatos = await tx.contato.deleteMany({});
      removidos.contatos = contatos.count;

      const imoveis = await tx.imovel.deleteMany({});
      removidos.imoveis = imoveis.count;

      const proprietarios = await tx.proprietario.deleteMany({});
      removidos.proprietarios = proprietarios.count;
    });

    return {
      message: 'Dados de desenvolvimento removidos. Usuários, configuração do site, tipos de documento e empreendimentos foram mantidos.',
      removidos,
    };
  }
}
