import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';

@Injectable()
export class ImoveisService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateImovelDto, user?: Usuario) {
    const usuarioResponsavelId =
      dto.usuarioResponsavelId ??
      (user?.role === 'corretor' ? user.id : undefined);
    return this.prisma.imovel.create({
      data: {
        tipo: dto.tipo,
        rua: dto.rua,
        numero: dto.numero,
        bairro: dto.bairro,
        cidade: dto.cidade,
        cep: dto.cep,
        valorVenda: dto.valorVenda != null ? dto.valorVenda : undefined,
        valorAluguel: dto.valorAluguel != null ? dto.valorAluguel : undefined,
        status: dto.status ?? 'disponivel',
        codigo: dto.codigo,
        descricao: dto.descricao,
        qtdQuartos: dto.qtdQuartos,
        qtdBanheiros: dto.qtdBanheiros,
        area: dto.area != null ? dto.area : undefined,
        usuarioResponsavelId: usuarioResponsavelId ?? undefined,
      },
    });
  }

  async findAll(
    cidade?: string,
    bairro?: string,
    tipo?: string,
    status?: string,
    user?: Usuario,
  ) {
    const where: Prisma.ImovelWhereInput = {};
    if (cidade) where.cidade = { contains: cidade, mode: 'insensitive' };
    if (bairro) where.bairro = { contains: bairro, mode: 'insensitive' };
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (user?.role === 'corretor') {
      where.usuarioResponsavelId = user.id;
    }
    return this.prisma.imovel.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: { usuarioResponsavel: { select: { id: true, nome: true } } },
    });
  }

  async findOne(id: string, user?: Usuario) {
    const i = await this.prisma.imovel.findUnique({
      where: { id },
      include: {
        usuarioResponsavel: { select: { id: true, nome: true, email: true } },
        fotos: { orderBy: { ordem: 'asc' } },
        interesses: { include: { contato: { select: { id: true, nome: true, email: true } } } },
        tarefas: true,
      },
    });
    if (!i) throw new NotFoundException('Imóvel não encontrado');
    if (user?.role === 'corretor' && i.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão para acessar este imóvel');
    }
    return i;
  }

  async update(id: string, dto: UpdateImovelDto, user?: Usuario) {
    await this.findOne(id, user);
    const data: Prisma.ImovelUpdateInput = {
      ...(dto.tipo !== undefined && { tipo: dto.tipo }),
      ...(dto.rua !== undefined && { rua: dto.rua }),
      ...(dto.numero !== undefined && { numero: dto.numero }),
      ...(dto.bairro !== undefined && { bairro: dto.bairro }),
      ...(dto.cidade !== undefined && { cidade: dto.cidade }),
      ...(dto.cep !== undefined && { cep: dto.cep }),
      ...(dto.valorVenda !== undefined && { valorVenda: dto.valorVenda }),
      ...(dto.valorAluguel !== undefined && { valorAluguel: dto.valorAluguel }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.codigo !== undefined && { codigo: dto.codigo }),
      ...(dto.descricao !== undefined && { descricao: dto.descricao }),
      ...(dto.qtdQuartos !== undefined && { qtdQuartos: dto.qtdQuartos }),
      ...(dto.qtdBanheiros !== undefined && { qtdBanheiros: dto.qtdBanheiros }),
      ...(dto.area !== undefined && { area: dto.area }),
      ...(dto.usuarioResponsavelId !== undefined && { usuarioResponsavelId: dto.usuarioResponsavelId }),
    };
    if (user?.role === 'corretor') delete (data as Record<string, unknown>).usuarioResponsavelId;
    return this.prisma.imovel.update({ where: { id }, data });
  }

  async remove(id: string, user?: Usuario) {
    await this.findOne(id, user);
    return this.prisma.imovel.delete({ where: { id } });
  }
}
