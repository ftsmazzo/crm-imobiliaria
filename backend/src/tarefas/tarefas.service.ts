import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTarefaDto } from './dto/create-tarefa.dto';
import { UpdateTarefaDto } from './dto/update-tarefa.dto';

@Injectable()
export class TarefasService {
  constructor(private prisma: PrismaService) {}

  async create(usuarioId: string, dto: CreateTarefaDto) {
    return this.prisma.tarefa.create({
      data: {
        titulo: dto.titulo,
        descricao: dto.descricao,
        dataPrevista: dto.dataPrevista ? new Date(dto.dataPrevista) : undefined,
        usuarioId,
        contatoId: dto.contatoId,
        imovelId: dto.imovelId,
      },
    });
  }

  async findAll(user: Usuario, usuarioId?: string, dataPrevista?: string) {
    const where: Prisma.TarefaWhereInput = {};
    if (user.role === 'corretor') {
      where.usuarioId = user.id;
    } else if (usuarioId) {
      where.usuarioId = usuarioId;
    }
    if (dataPrevista) where.dataPrevista = new Date(dataPrevista);
    return this.prisma.tarefa.findMany({
      where,
      orderBy: [{ dataPrevista: 'asc' }, { criadoEm: 'desc' }],
      include: {
        usuario: { select: { id: true, nome: true } },
        contato: { select: { id: true, nome: true } },
        imovel: { select: { id: true, codigo: true } },
      },
    });
  }

  async findOne(id: string, user?: Usuario) {
    const t = await this.prisma.tarefa.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, nome: true, email: true } },
        contato: true,
        imovel: true,
      },
    });
    if (!t) throw new NotFoundException('Tarefa não encontrada');
    if (user?.role === 'corretor' && t.usuarioId !== user.id) {
      throw new ForbiddenException('Sem permissão para acessar esta tarefa');
    }
    return t;
  }

  async update(id: string, dto: UpdateTarefaDto, user?: Usuario) {
    await this.findOne(id, user);
    return this.prisma.tarefa.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.dataPrevista !== undefined && { dataPrevista: dto.dataPrevista ? new Date(dto.dataPrevista) : null }),
        ...(dto.concluida !== undefined && { concluida: dto.concluida }),
        ...(dto.contatoId !== undefined && { contatoId: dto.contatoId }),
        ...(dto.imovelId !== undefined && { imovelId: dto.imovelId }),
      },
    });
  }

  async remove(id: string, user?: Usuario) {
    await this.findOne(id, user);
    return this.prisma.tarefa.delete({ where: { id } });
  }
}
