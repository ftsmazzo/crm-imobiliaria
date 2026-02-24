import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpreendimentoDto } from './dto/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dto/update-empreendimento.dto';

@Injectable()
export class EmpreendimentosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmpreendimentoDto) {
    return this.prisma.empreendimento.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao ?? undefined,
        endereco: dto.endereco ?? undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.empreendimento.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { imoveis: true } } },
    });
  }

  async findOne(id: string) {
    const e = await this.prisma.empreendimento.findUnique({
      where: { id },
      include: { imoveis: { select: { id: true, codigo: true, tipo: true } } },
    });
    if (!e) throw new NotFoundException('Empreendimento não encontrado');
    return e;
  }

  async update(id: string, dto: UpdateEmpreendimentoDto) {
    await this.findOne(id);
    return this.prisma.empreendimento.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
        ...(dto.endereco !== undefined && { endereco: dto.endereco }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.empreendimento.delete({ where: { id } });
  }
}
