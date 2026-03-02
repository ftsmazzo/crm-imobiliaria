import { Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type DashboardStats = {
  contatosPorEstagio: Record<string, number>;
  tarefasAtrasadas: number;
  imoveisPorStatus: Record<string, number>;
  novosLeads: number;
  leadsNoPeriodo?: number;
  imoveisNoPeriodo?: number;
};

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(
    user: Usuario,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<DashboardStats> {
    const baseContato = user.role === 'corretor' ? { usuarioResponsavelId: user.id } : {};
    const baseImovel = user.role === 'corretor' ? { usuarioResponsavelId: user.id } : {};
    const baseTarefa = user.role === 'corretor' ? { usuarioId: user.id } : {};

    const periodoContato =
      dataInicio && dataFim
        ? { criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim) } }
        : {};
    const periodoImovel =
      dataInicio && dataFim
        ? { criadoEm: { gte: new Date(dataInicio), lte: new Date(dataFim) } }
        : {};

    const [contatos, imoveis, tarefasAtrasadas, novosLeads, leadsNoPeriodo, imoveisNoPeriodo] = await Promise.all([
      this.prisma.contato.groupBy({
        by: ['estagio'],
        where: baseContato,
        _count: { id: true },
      }),
      this.prisma.imovel.groupBy({
        by: ['status'],
        where: baseImovel,
        _count: { id: true },
      }),
      this.prisma.tarefa.count({
        where: {
          ...baseTarefa,
          concluida: false,
          dataPrevista: { lt: new Date() },
        },
      }),
      this.prisma.contato.count({
        where: { ...baseContato, estagio: 'novo' },
      }),
      dataInicio && dataFim
        ? this.prisma.contato.count({
            where: { ...baseContato, ...periodoContato },
          })
        : Promise.resolve(undefined),
      dataInicio && dataFim
        ? this.prisma.imovel.count({
            where: { ...baseImovel, ...periodoImovel },
          })
        : Promise.resolve(undefined),
    ]);

    const contatosPorEstagio: Record<string, number> = {};
    for (const row of contatos) {
      contatosPorEstagio[row.estagio] = row._count.id;
    }

    const imoveisPorStatus: Record<string, number> = {};
    for (const row of imoveis) {
      imoveisPorStatus[row.status] = row._count.id;
    }

    return {
      contatosPorEstagio,
      tarefasAtrasadas,
      imoveisPorStatus,
      novosLeads,
      leadsNoPeriodo: leadsNoPeriodo ?? undefined,
      imoveisNoPeriodo: imoveisNoPeriodo ?? undefined,
    };
  }
}
