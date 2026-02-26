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
        complemento: dto.complemento,
        bairro: dto.bairro,
        cidade: dto.cidade,
        cep: dto.cep,
        valorVenda: dto.valorVenda != null ? dto.valorVenda : undefined,
        valorAluguel: dto.valorAluguel != null ? dto.valorAluguel : undefined,
        valorIptu: dto.valorIptu != null ? dto.valorIptu : undefined,
        valorCondominio: dto.valorCondominio != null ? dto.valorCondominio : undefined,
        status: dto.status ?? 'disponivel',
        destaque: dto.destaque ?? false,
        codigo: dto.codigo,
        quadra: dto.quadra,
        lote: dto.lote,
        numeroMatricula: dto.numeroMatricula,
        numeroIptu: dto.numeroIptu,
        cartorio: dto.cartorio,
        tipoListing: dto.tipoListing,
        subtipo: dto.subtipo,
        exibirEnderecoSite: dto.exibirEnderecoSite,
        descricao: dto.descricao,
        qtdQuartos: dto.qtdQuartos,
        qtdBanheiros: dto.qtdBanheiros,
        qtdSalas: dto.qtdSalas,
        lavabo: dto.lavabo,
        qtdVagas: dto.qtdVagas,
        tipoVaga: dto.tipoVaga,
        area: dto.area != null ? dto.area : undefined,
        areaTerreno: dto.areaTerreno != null ? dto.areaTerreno : undefined,
        anoConstrucao: dto.anoConstrucao,
        tipoPiso: dto.tipoPiso,
        pontosReferencia: dto.pontosReferencia,
        eletrodomesticos: dto.eletrodomesticos,
        andarUnidade: dto.andarUnidade,
        qtdAndares: dto.qtdAndares,
        totalUnidades: dto.totalUnidades,
        qtdTorres: dto.qtdTorres,
        caracteristicas: dto.caracteristicas,
        empreendimentoId: dto.empreendimentoId ?? undefined,
        proprietarioId: dto.proprietarioId ?? undefined,
        usuarioResponsavelId: usuarioResponsavelId ?? undefined,
      },
    });
  }

  async findAll(
    cidade?: string,
    bairro?: string,
    tipo?: string,
    status?: string,
    destaque?: boolean,
    user?: Usuario,
  ) {
    const where: Prisma.ImovelWhereInput = {};
    if (cidade) where.cidade = { contains: cidade, mode: 'insensitive' };
    if (bairro) where.bairro = { contains: bairro, mode: 'insensitive' };
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (destaque === true) where.destaque = true;
    if (user?.role === 'corretor') {
      where.usuarioResponsavelId = user.id;
    }
    return this.prisma.imovel.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: {
        usuarioResponsavel: { select: { id: true, nome: true } },
        empreendimento: { select: { id: true, nome: true } },
        proprietario: { select: { id: true, nome: true, email: true, telefone: true } },
      },
    });
  }

  async findOne(id: string, user?: Usuario) {
    const i = await this.prisma.imovel.findUnique({
      where: { id },
      include: {
        usuarioResponsavel: { select: { id: true, nome: true, email: true } },
        empreendimento: { select: { id: true, nome: true } },
        proprietario: { select: { id: true, nome: true, email: true, telefone: true } },
        fotos: { orderBy: { ordem: 'asc' } },
        documentos: true,
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
      ...(dto.complemento !== undefined && { complemento: dto.complemento }),
      ...(dto.bairro !== undefined && { bairro: dto.bairro }),
      ...(dto.cidade !== undefined && { cidade: dto.cidade }),
      ...(dto.cep !== undefined && { cep: dto.cep }),
      ...(dto.valorVenda !== undefined && { valorVenda: dto.valorVenda }),
      ...(dto.valorAluguel !== undefined && { valorAluguel: dto.valorAluguel }),
      ...(dto.valorIptu !== undefined && { valorIptu: dto.valorIptu }),
      ...(dto.valorCondominio !== undefined && { valorCondominio: dto.valorCondominio }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.destaque !== undefined && { destaque: dto.destaque }),
      ...(dto.codigo !== undefined && { codigo: dto.codigo }),
      ...(dto.quadra !== undefined && { quadra: dto.quadra }),
      ...(dto.lote !== undefined && { lote: dto.lote }),
      ...(dto.descricao !== undefined && { descricao: dto.descricao }),
      ...(dto.qtdQuartos !== undefined && { qtdQuartos: dto.qtdQuartos }),
      ...(dto.qtdBanheiros !== undefined && { qtdBanheiros: dto.qtdBanheiros }),
      ...(dto.qtdSalas !== undefined && { qtdSalas: dto.qtdSalas }),
      ...(dto.lavabo !== undefined && { lavabo: dto.lavabo }),
      ...(dto.area !== undefined && { area: dto.area }),
      ...(dto.areaTerreno !== undefined && { areaTerreno: dto.areaTerreno }),
      ...(dto.anoConstrucao !== undefined && { anoConstrucao: dto.anoConstrucao }),
      ...(dto.tipoPiso !== undefined && { tipoPiso: dto.tipoPiso }),
      ...(dto.numeroMatricula !== undefined && { numeroMatricula: dto.numeroMatricula }),
      ...(dto.numeroIptu !== undefined && { numeroIptu: dto.numeroIptu }),
      ...(dto.cartorio !== undefined && { cartorio: dto.cartorio }),
      ...(dto.tipoListing !== undefined && { tipoListing: dto.tipoListing }),
      ...(dto.subtipo !== undefined && { subtipo: dto.subtipo }),
      ...(dto.exibirEnderecoSite !== undefined && { exibirEnderecoSite: dto.exibirEnderecoSite }),
      ...(dto.qtdVagas !== undefined && { qtdVagas: dto.qtdVagas }),
      ...(dto.tipoVaga !== undefined && { tipoVaga: dto.tipoVaga }),
      ...(dto.pontosReferencia !== undefined && { pontosReferencia: dto.pontosReferencia }),
      ...(dto.eletrodomesticos !== undefined && { eletrodomesticos: dto.eletrodomesticos }),
      ...(dto.andarUnidade !== undefined && { andarUnidade: dto.andarUnidade }),
      ...(dto.qtdAndares !== undefined && { qtdAndares: dto.qtdAndares }),
      ...(dto.totalUnidades !== undefined && { totalUnidades: dto.totalUnidades }),
      ...(dto.qtdTorres !== undefined && { qtdTorres: dto.qtdTorres }),
      ...(dto.caracteristicas !== undefined && { caracteristicas: dto.caracteristicas }),
      ...(dto.empreendimentoId !== undefined && { empreendimentoId: dto.empreendimentoId }),
      ...(dto.proprietarioId !== undefined && { proprietarioId: dto.proprietarioId }),
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
