import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const TIPOS_IMOVEL_DOC = ['iptu', 'autorizacao', 'outro'] as const;
const PDF_MIME = 'application/pdf';

@Injectable()
export class ImoveisDocumentosService {
  private readonly logger = new Logger(ImoveisDocumentosService.name);

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async upload(
    imovelId: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
    tipo: string,
    user?: Usuario,
  ) {
    const imovel = await this.prisma.imovel.findUnique({ where: { id: imovelId } });
    if (!imovel) throw new NotFoundException('Imóvel não encontrado');
    if (user?.role === 'corretor' && imovel.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão');
    }
    const isPdf = file.mimetype?.toLowerCase() === PDF_MIME || file.originalname?.toLowerCase()?.endsWith('.pdf');
    if (!isPdf) throw new BadRequestException('Apenas arquivos PDF são aceitos. Envie um arquivo .pdf');
    const tipoNorm = TIPOS_IMOVEL_DOC.includes(tipo as (typeof TIPOS_IMOVEL_DOC)[number]) ? tipo : 'outro';
    const ext = (file.originalname?.split('.').pop() || 'pdf').toLowerCase() === 'pdf' ? 'pdf' : 'pdf';
    const key = `imoveis/${imovelId}/documentos/${Date.now()}-${tipoNorm}.${ext}`;
    const contentType = file.mimetype?.toLowerCase()?.includes('pdf') ? PDF_MIME : file.mimetype || PDF_MIME;
    await this.storage.upload(key, file.buffer, contentType);
    return this.prisma.imovelDocumento.create({
      data: {
        imovelId,
        key,
        tipo: tipoNorm,
        nome: file.originalname || undefined,
      },
    });
  }

  async list(imovelId: string, user?: Usuario) {
    const imovel = await this.prisma.imovel.findUnique({
      where: { id: imovelId },
      include: { documentos: true },
    });
    if (!imovel) throw new NotFoundException('Imóvel não encontrado');
    if (user?.role === 'corretor' && imovel.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão');
    }
    const docs = imovel.documentos;
    try {
      const withUrls = await Promise.all(
        docs.map(async (d) => ({
          id: d.id,
          tipo: d.tipo,
          nome: d.nome,
          criadoEm: d.criadoEm,
          url: await this.storage.getPresignedUrl(d.key),
        })),
      );
      return withUrls;
    } catch (err) {
      this.logger.warn(`Documentos imóvel ${imovelId}: MinIO falhou`, err);
      return docs.map((d) => ({
        id: d.id,
        tipo: d.tipo,
        nome: d.nome,
        criadoEm: d.criadoEm,
        url: '',
      }));
    }
  }

  async getViewUrl(imovelId: string, documentoId: string, user?: Usuario): Promise<string> {
    const doc = await this.prisma.imovelDocumento.findFirst({
      where: { id: documentoId, imovelId },
      include: { imovel: true },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    if (user?.role === 'corretor' && doc.imovel.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão');
    }
    return this.storage.getPresignedUrl(doc.key);
  }

  async remove(imovelId: string, documentoId: string, user?: Usuario) {
    const doc = await this.prisma.imovelDocumento.findFirst({
      where: { id: documentoId, imovelId },
      include: { imovel: true },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    if (user?.role === 'corretor' && doc.imovel.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão');
    }
    await this.storage.remove(doc.key);
    await this.prisma.imovelDocumento.delete({ where: { id: documentoId } });
    return { ok: true };
  }
}
