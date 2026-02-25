import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProprietarioDto } from './dto/create-proprietario.dto';
import { UpdateProprietarioDto } from './dto/update-proprietario.dto';

@Injectable()
export class ProprietariosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProprietarioDto) {
    return this.prisma.proprietario.create({
      data: {
        nome: dto.nome,
        cpf: dto.cpf ?? undefined,
        rg: dto.rg ?? undefined,
        dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : undefined,
        estadoCivil: dto.estadoCivil ?? undefined,
        telefone: dto.telefone ?? undefined,
        telefone2: dto.telefone2 ?? undefined,
        email: dto.email ?? undefined,
        endereco: dto.endereco ?? undefined,
        observacoes: dto.observacoes ?? undefined,
        tipo: dto.tipo ?? 'PF',
        razaoSocial: dto.razaoSocial ?? undefined,
        cnpj: dto.cnpj ?? undefined,
        inscricaoEstadual: dto.inscricaoEstadual ?? undefined,
        repLegalNome: dto.repLegalNome ?? undefined,
        repLegalCpf: dto.repLegalCpf ?? undefined,
        repLegalContato: dto.repLegalContato ?? undefined,
        repLegalEmail: dto.repLegalEmail ?? undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.proprietario.findMany({
      orderBy: { nome: 'asc' },
      include: { _count: { select: { imoveis: true } } },
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.proprietario.findUnique({
      where: { id },
      include: { imoveis: { select: { id: true, codigo: true, tipo: true } } },
    });
    if (!p) throw new NotFoundException('Proprietário não encontrado');
    return p;
  }

  async update(id: string, dto: UpdateProprietarioDto) {
    await this.findOne(id);
    return this.prisma.proprietario.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.cpf !== undefined && { cpf: dto.cpf }),
        ...(dto.rg !== undefined && { rg: dto.rg }),
        ...(dto.dataNascimento !== undefined && { dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : null }),
        ...(dto.estadoCivil !== undefined && { estadoCivil: dto.estadoCivil }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.telefone2 !== undefined && { telefone2: dto.telefone2 }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.endereco !== undefined && { endereco: dto.endereco }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
        ...(dto.tipo !== undefined && { tipo: dto.tipo }),
        ...(dto.razaoSocial !== undefined && { razaoSocial: dto.razaoSocial }),
        ...(dto.cnpj !== undefined && { cnpj: dto.cnpj }),
        ...(dto.inscricaoEstadual !== undefined && { inscricaoEstadual: dto.inscricaoEstadual }),
        ...(dto.repLegalNome !== undefined && { repLegalNome: dto.repLegalNome }),
        ...(dto.repLegalCpf !== undefined && { repLegalCpf: dto.repLegalCpf }),
        ...(dto.repLegalContato !== undefined && { repLegalContato: dto.repLegalContato }),
        ...(dto.repLegalEmail !== undefined && { repLegalEmail: dto.repLegalEmail }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.proprietario.delete({ where: { id } });
  }
}
