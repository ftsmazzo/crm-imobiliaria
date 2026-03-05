import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const PDF_MIME = 'application/pdf';

@Injectable()
export class ProcessoDocumentoService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  private async checkContatoAcesso(contatoId: string, user?: Usuario) {
    const contato = await this.prisma.contato.findUnique({ where: { id: contatoId } });
    if (!contato) throw new NotFoundException('Contato não encontrado');
    if (user?.role === 'corretor' && contato.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão para este contato');
    }
    return contato;
  }

  async upload(
    contatoId: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
    tipoDocumentoId?: string,
    imovelId?: string,
    user?: Usuario,
  ) {
    await this.checkContatoAcesso(contatoId, user);
    const isPdf =
      file.mimetype?.toLowerCase() === PDF_MIME ||
      file.originalname?.toLowerCase()?.endsWith('.pdf');
    if (!isPdf) throw new BadRequestException('Apenas arquivos PDF são aceitos.');
    const ext = (file.originalname?.split('.').pop() || 'pdf').toLowerCase() === 'pdf' ? 'pdf' : 'pdf';
    const key = `documentos/processo/${contatoId}/${Date.now()}-${(file.originalname || 'doc').replace(/[^a-zA-Z0-9.-]/g, '_')}.${ext}`;
    await this.storage.upload(key, file.buffer, file.mimetype?.toLowerCase()?.includes('pdf') ? PDF_MIME : file.mimetype || PDF_MIME);
    return this.prisma.processoDocumento.create({
      data: {
        contatoId,
        imovelId: imovelId || undefined,
        tipoDocumentoId: tipoDocumentoId || undefined,
        key,
        nomeOriginal: file.originalname || undefined,
      },
      include: { tipoDocumento: { select: { id: true, nome: true } } },
    });
  }

  async list(contatoId: string, user?: Usuario) {
    await this.checkContatoAcesso(contatoId, user);
    const docs = await this.prisma.processoDocumento.findMany({
      where: { contatoId },
      orderBy: { criadoEm: 'desc' },
      include: { tipoDocumento: { select: { id: true, nome: true } } },
    });
    const withUrls = await Promise.all(
      docs.map(async (d) => ({
        id: d.id,
        contatoId: d.contatoId,
        imovelId: d.imovelId,
        tipoDocumentoId: d.tipoDocumentoId,
        tipoDocumento: d.tipoDocumento,
        nomeOriginal: d.nomeOriginal,
        criadoEm: d.criadoEm,
        url: await this.storage.getPresignedUrl(d.key).catch(() => ''),
      })),
    );
    return withUrls;
  }

  async getViewUrl(contatoId: string, documentoId: string, user?: Usuario): Promise<string> {
    await this.checkContatoAcesso(contatoId, user);
    const doc = await this.prisma.processoDocumento.findFirst({
      where: { id: documentoId, contatoId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    return this.storage.getPresignedUrl(doc.key);
  }

  async remove(contatoId: string, documentoId: string, user?: Usuario) {
    await this.checkContatoAcesso(contatoId, user);
    const doc = await this.prisma.processoDocumento.findFirst({
      where: { id: documentoId, contatoId },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    await this.storage.remove(doc.key);
    await this.prisma.processoDocumento.delete({ where: { id: documentoId } });
    return { ok: true };
  }
}
