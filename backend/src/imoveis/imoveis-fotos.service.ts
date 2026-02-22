import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ImoveisFotosService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  async upload(
    imovelId: string,
    file: { buffer: Buffer; mimetype: string; originalname: string },
    user?: Usuario,
  ) {
    const imovel = await this.prisma.imovel.findUnique({ where: { id: imovelId } });
    if (!imovel) throw new NotFoundException('Imóvel não encontrado');
    if (user?.role === 'corretor' && imovel.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão');
    }
    const count = await this.prisma.imovelFoto.count({ where: { imovelId } });
    const ext = file.originalname?.split('.').pop() || 'jpg';
    const key = `imoveis/${imovelId}/${Date.now()}.${ext}`;
    await this.storage.upload(key, file.buffer, file.mimetype || 'image/jpeg');
    return this.prisma.imovelFoto.create({
      data: { imovelId, key, ordem: count },
    });
  }

  async list(imovelId: string, user?: Usuario) {
    const imovel = await this.prisma.imovel.findUnique({
      where: { id: imovelId },
      include: { fotos: { orderBy: { ordem: 'asc' } } },
    });
    if (!imovel) throw new NotFoundException('Imóvel não encontrado');
    if (user?.role === 'corretor' && imovel.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão');
    }
    const fotos = await Promise.all(
      imovel.fotos.map(async (f) => ({
        id: f.id,
        ordem: f.ordem,
        url: await this.storage.getPresignedUrl(f.key),
      })),
    );
    return fotos;
  }

  async remove(imovelId: string, fotoId: string, user?: Usuario) {
    const foto = await this.prisma.imovelFoto.findFirst({
      where: { id: fotoId, imovelId },
      include: { imovel: true },
    });
    if (!foto) throw new NotFoundException('Foto não encontrada');
    if (user?.role === 'corretor' && foto.imovel.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão');
    }
    await this.storage.remove(foto.key);
    await this.prisma.imovelFoto.delete({ where: { id: fotoId } });
    return { ok: true };
  }

  async getPresignedUrlsForImovel(imovelId: string): Promise<{ id: string; url: string }[]> {
    const fotos = await this.prisma.imovelFoto.findMany({
      where: { imovelId },
      orderBy: { ordem: 'asc' },
    });
    return Promise.all(
      fotos.map(async (f) => ({
        id: f.id,
        url: await this.storage.getPresignedUrl(f.key),
      })),
    );
  }
}
