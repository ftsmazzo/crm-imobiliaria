import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContatoDto } from './dto/create-contato.dto';
import { UpdateContatoDto } from './dto/update-contato.dto';

@Injectable()
export class ContatosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContatoDto, user?: Usuario) {
    const usuarioResponsavelId =
      dto.usuarioResponsavelId ??
      (user?.role === 'corretor' ? user.id : undefined);
    return this.prisma.contato.create({
      data: {
        nome: dto.nome,
        email: dto.email.toLowerCase().trim(),
        telefone: dto.telefone ?? undefined,
        origem: dto.origem ?? undefined,
        observacoes: dto.observacoes ?? undefined,
        estagio: dto.estagio ?? 'novo',
        usuarioResponsavelId: usuarioResponsavelId ?? undefined,
      },
    });
  }

  async findAll(
    estagio?: string,
    usuarioResponsavelId?: string,
    user?: Usuario,
  ) {
    const where: Prisma.ContatoWhereInput = {};
    if (estagio) where.estagio = estagio;
    if (user?.role === 'corretor') {
      where.usuarioResponsavelId = user.id;
    } else if (usuarioResponsavelId) {
      where.usuarioResponsavelId = usuarioResponsavelId;
    }
    return this.prisma.contato.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: {
        usuarioResponsavel: { select: { id: true, nome: true, email: true } },
        interesses: { include: { imovel: { select: { id: true, codigo: true, tipo: true, bairro: true, cidade: true } } } },
      },
    });
  }

  async findOne(id: string, user?: Usuario) {
    const c = await this.prisma.contato.findUnique({
      where: { id },
      include: {
        usuarioResponsavel: { select: { id: true, nome: true, email: true } },
        interesses: { include: { imovel: { select: { id: true, codigo: true, tipo: true, bairro: true, cidade: true } } } },
        tarefas: true,
      },
    });
    if (!c) throw new NotFoundException('Contato não encontrado');
    if (user?.role === 'corretor' && c.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão para acessar este contato');
    }
    return c;
  }

  async update(id: string, dto: UpdateContatoDto, user?: Usuario) {
    await this.findOne(id, user);
    const data: Prisma.ContatoUpdateInput = {
      ...(dto.nome !== undefined && { nome: dto.nome }),
      ...(dto.email !== undefined && { email: dto.email.toLowerCase().trim() }),
      ...(dto.telefone !== undefined && { telefone: dto.telefone }),
      ...(dto.origem !== undefined && { origem: dto.origem }),
      ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
      ...(dto.estagio !== undefined && { estagio: dto.estagio }),
      ...(dto.usuarioResponsavelId !== undefined && { usuarioResponsavelId: dto.usuarioResponsavelId }),
    };
    if (user?.role === 'gestor' && dto.usuarioResponsavelId === undefined) {
      // gestor pode manter qualquer valor
    } else if (user?.role === 'corretor') {
      delete (data as Record<string, unknown>).usuarioResponsavelId;
    }
    return this.prisma.contato.update({ where: { id }, data });
  }

  async remove(id: string, user?: Usuario) {
    await this.findOne(id, user);
    return this.prisma.contato.delete({ where: { id } });
  }
}
