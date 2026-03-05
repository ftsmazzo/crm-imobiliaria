import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TipoDocumentoService {
  constructor(private prisma: PrismaService) {}

  async findAll(contexto?: 'imovel' | 'processo') {
    const where = contexto ? { contexto } : {};
    return this.prisma.tipoDocumento.findMany({
      where,
      orderBy: { nome: 'asc' },
    });
  }
}
