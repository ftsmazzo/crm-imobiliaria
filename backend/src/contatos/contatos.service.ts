import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContatoDto } from './dto/create-contato.dto';
import { UpdateContatoDto } from './dto/update-contato.dto';

@Injectable()
export class ContatosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContatoDto) {
    return this.prisma.contato.create({
      data: {
        nome: dto.nome,
        email: dto.email.toLowerCase().trim(),
        telefone: dto.telefone ?? undefined,
        origem: dto.origem ?? undefined,
        observacoes: dto.observacoes ?? undefined,
        estagio: dto.estagio ?? 'novo',
        usuarioResponsavelId: dto.usuarioResponsavelId ?? undefined,
      },
    });
  }

  async findAll(estagio?: string, usuarioResponsavelId?: string) {
    const where: Prisma.ContatoWhereInput = {};
    if (estagio) where.estagio = estagio;
    if (usuarioResponsavelId) where.usuarioResponsavelId = usuarioResponsavelId;
    return this.prisma.contato.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: { usuarioResponsavel: { select: { id: true, nome: true, email: true } } },
    });
  }

  async findOne(id: string) {
    const c = await this.prisma.contato.findUnique({
      where: { id },
      include: {
        usuarioResponsavel: { select: { id: true, nome: true, email: true } },
        interesses: { include: { imovel: { select: { id: true, codigo: true, tipo: true } } } },
        tarefas: true,
      },
    });
    if (!c) throw new NotFoundException('Contato não encontrado');
    return c;
  }

  async update(id: string, dto: UpdateContatoDto) {
    await this.findOne(id);
    return this.prisma.contato.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.origem !== undefined && { origem: dto.origem }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
        ...(dto.estagio !== undefined && { estagio: dto.estagio }),
        ...(dto.usuarioResponsavelId !== undefined && { usuarioResponsavelId: dto.usuarioResponsavelId }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contato.delete({ where: { id } });
  }
}
