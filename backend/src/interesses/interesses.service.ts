import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInteresseDto } from './dto/create-interesse.dto';

@Injectable()
export class InteressesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInteresseDto, user: Usuario) {
    const [contato, imovel] = await Promise.all([
      this.prisma.contato.findUnique({ where: { id: dto.contatoId } }),
      this.prisma.imovel.findUnique({ where: { id: dto.imovelId } }),
    ]);
    if (!contato) throw new NotFoundException('Contato não encontrado');
    if (!imovel) throw new NotFoundException('Imóvel não encontrado');

    if (user.role === 'corretor') {
      const podeContato = contato.usuarioResponsavelId === user.id;
      const podeImovel = imovel.usuarioResponsavelId === user.id;
      if (!podeContato && !podeImovel) {
        throw new ForbiddenException('Sem permissão para vincular interesse neste contato ou imóvel');
      }
    }

    return this.prisma.interesse.create({
      data: {
        contatoId: dto.contatoId,
        imovelId: dto.imovelId,
        tipo: 'interesse',
      },
      include: {
        contato: { select: { id: true, nome: true, email: true } },
        imovel: { select: { id: true, codigo: true, tipo: true, bairro: true, cidade: true } },
      },
    });
  }

  async remove(id: string, user: Usuario) {
    const interesse = await this.prisma.interesse.findUnique({
      where: { id },
      include: {
        contato: true,
        imovel: true,
      },
    });
    if (!interesse) throw new NotFoundException('Interesse não encontrado');

    if (user.role === 'corretor') {
      const podeContato = interesse.contato.usuarioResponsavelId === user.id;
      const podeImovel = interesse.imovel.usuarioResponsavelId === user.id;
      if (!podeContato && !podeImovel) {
        throw new ForbiddenException('Sem permissão para remover este interesse');
      }
    }

    await this.prisma.interesse.delete({ where: { id } });
    return { ok: true };
  }
}
