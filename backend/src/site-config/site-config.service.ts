import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const SITE_PREFIX = 'site/';
const PRESIGNED_EXPIRY = 60 * 60 * 24; // 24h

export interface SiteConfigPublic {
  logoUrl: string | null;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
  nome: string | null;
  whatsapp: string | null;
  endereco: string | null;
  creci: string | null;
}

export interface SiteConfigAdmin extends SiteConfigPublic {
  id: string;
  logoKey: string | null;
  heroImageKey: string | null;
  heroVideoKey: string | null;
  atualizadoEm: Date;
}

@Injectable()
export class SiteConfigService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  private async getRow(): Promise<{
    id: string;
    logoKey: string | null;
    heroImageKey: string | null;
    heroVideoKey: string | null;
    nome: string | null;
    whatsapp: string | null;
    endereco: string | null;
    creci: string | null;
    atualizadoEm: Date;
  } | null> {
    try {
      let row = await this.prisma.siteConfig.findFirst({ orderBy: { atualizadoEm: 'desc' } });
      if (!row) {
        row = await this.prisma.siteConfig.create({
          data: {},
        });
      }
      return row;
    } catch {
      return null;
    }
  }

  private emptyPublic(): SiteConfigPublic {
    return {
      logoUrl: null,
      heroImageUrl: null,
      heroVideoUrl: null,
      nome: null,
      whatsapp: null,
      endereco: null,
      creci: null,
    };
  }

  async getPublic(): Promise<SiteConfigPublic> {
    const row = await this.getRow();
    if (!row) return this.emptyPublic();
    const [logoUrl, heroImageUrl, heroVideoUrl] = await Promise.all([
      row.logoKey ? this.storage.getPresignedUrl(row.logoKey, PRESIGNED_EXPIRY).catch(() => null) : null,
      row.heroImageKey ? this.storage.getPresignedUrl(row.heroImageKey, PRESIGNED_EXPIRY).catch(() => null) : null,
      row.heroVideoKey ? this.storage.getPresignedUrl(row.heroVideoKey, PRESIGNED_EXPIRY).catch(() => null) : null,
    ]);
    return {
      logoUrl: logoUrl ?? null,
      heroImageUrl: heroImageUrl ?? null,
      heroVideoUrl: heroVideoUrl ?? null,
      nome: row.nome ?? null,
      whatsapp: row.whatsapp ?? null,
      endereco: row.endereco ?? null,
      creci: row.creci ?? null,
    };
  }

  async getForAdmin(user: Usuario): Promise<SiteConfigAdmin> {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode acessar a configuração do site');
    }
    const row = await this.getRow();
    if (!row) {
      return {
        id: '',
        logoUrl: null,
        heroImageUrl: null,
        heroVideoUrl: null,
        logoKey: null,
        heroImageKey: null,
        heroVideoKey: null,
        nome: null,
        whatsapp: null,
        endereco: null,
        creci: null,
        atualizadoEm: new Date(),
      };
    }
    const [logoUrl, heroImageUrl, heroVideoUrl] = await Promise.all([
      row.logoKey ? this.storage.getPresignedUrl(row.logoKey, PRESIGNED_EXPIRY).catch(() => null) : null,
      row.heroImageKey ? this.storage.getPresignedUrl(row.heroImageKey, PRESIGNED_EXPIRY).catch(() => null) : null,
      row.heroVideoKey ? this.storage.getPresignedUrl(row.heroVideoKey, PRESIGNED_EXPIRY).catch(() => null) : null,
    ]);
    return {
      id: row.id,
      logoUrl: logoUrl ?? null,
      heroImageUrl: heroImageUrl ?? null,
      heroVideoUrl: heroVideoUrl ?? null,
      logoKey: row.logoKey,
      heroImageKey: row.heroImageKey,
      heroVideoKey: row.heroVideoKey,
      nome: row.nome,
      whatsapp: row.whatsapp,
      endereco: row.endereco,
      creci: row.creci,
      atualizadoEm: row.atualizadoEm,
    };
  }

  async update(
    user: Usuario,
    data: { nome?: string; whatsapp?: string; endereco?: string; creci?: string },
  ) {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode alterar a configuração do site');
    }
    const row = await this.getRow();
    if (!row) throw new InternalServerErrorException('Configuração do site indisponível.');
    await this.prisma.siteConfig.update({
      where: { id: row.id },
      data: {
        ...(data.nome !== undefined && { nome: data.nome || null }),
        ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp || null }),
        ...(data.endereco !== undefined && { endereco: data.endereco || null }),
        ...(data.creci !== undefined && { creci: data.creci || null }),
      },
    });
    return this.getForAdmin(user);
  }

  private ext(name: string, mimetype: string): string {
    const m = name?.match(/\.([a-zA-Z0-9]+)$/);
    if (m) return m[1].toLowerCase();
    if (mimetype?.includes('png')) return 'png';
    if (mimetype?.includes('webp')) return 'webp';
    return 'jpg';
  }

  private videoExt(name: string, mimetype: string): string {
    if (mimetype?.includes('webm')) return 'webm';
    if (mimetype?.includes('mp4')) return 'mp4';
    const m = name?.match(/\.([a-zA-Z0-9]+)$/);
    if (m) {
      const e = m[1].toLowerCase();
      if (e === 'webm' || e === 'mp4') return e;
    }
    return 'mp4';
  }

  async uploadLogo(
    user: Usuario,
    file: { buffer: Buffer; mimetype: string; originalname?: string },
  ) {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode alterar a configuração do site');
    }
    const row = await this.getRow();
    if (!row) throw new InternalServerErrorException('Configuração do site indisponível.');
    const ext = this.ext(file.originalname ?? '', file.mimetype);
    const key = `${SITE_PREFIX}logo_${Date.now()}.${ext}`;
    await this.storage.upload(key, file.buffer, file.mimetype || 'image/png');
    if (row.logoKey) {
      await this.storage.remove(row.logoKey).catch(() => {});
    }
    await this.prisma.siteConfig.update({
      where: { id: row.id },
      data: { logoKey: key },
    });
    return this.getForAdmin(user);
  }

  async uploadHero(
    user: Usuario,
    file: { buffer: Buffer; mimetype: string; originalname?: string },
  ) {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode alterar a configuração do site');
    }
    const row = await this.getRow();
    if (!row) throw new InternalServerErrorException('Configuração do site indisponível.');
    const ext = this.ext(file.originalname ?? '', file.mimetype);
    const key = `${SITE_PREFIX}hero_${Date.now()}.${ext}`;
    await this.storage.upload(key, file.buffer, file.mimetype || 'image/jpeg');
    if (row.heroImageKey) {
      await this.storage.remove(row.heroImageKey).catch(() => {});
    }
    await this.prisma.siteConfig.update({
      where: { id: row.id },
      data: { heroImageKey: key },
    });
    return this.getForAdmin(user);
  }

  async removeLogo(user: Usuario): Promise<SiteConfigAdmin> {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode alterar a configuração do site');
    }
    const row = await this.getRow();
    if (!row) throw new InternalServerErrorException('Configuração do site indisponível.');
    if (row.logoKey) {
      await this.storage.remove(row.logoKey).catch(() => {});
    }
    await this.prisma.siteConfig.update({
      where: { id: row.id },
      data: { logoKey: null },
    });
    return this.getForAdmin(user);
  }

  async removeHero(user: Usuario): Promise<SiteConfigAdmin> {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode alterar a configuração do site');
    }
    const row = await this.getRow();
    if (!row) throw new InternalServerErrorException('Configuração do site indisponível.');
    if (row.heroImageKey) {
      await this.storage.remove(row.heroImageKey).catch(() => {});
    }
    await this.prisma.siteConfig.update({
      where: { id: row.id },
      data: { heroImageKey: null },
    });
    return this.getForAdmin(user);
  }

  async uploadHeroVideo(
    user: Usuario,
    file: { buffer: Buffer; mimetype: string; originalname?: string },
  ) {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode alterar a configuração do site');
    }
    const mt = (file.mimetype || '').toLowerCase();
    if (!mt.includes('video/mp4') && !mt.includes('video/webm')) {
      throw new BadRequestException('Envie um vídeo MP4 ou WebM.');
    }
    const row = await this.getRow();
    if (!row) throw new InternalServerErrorException('Configuração do site indisponível.');
    const ext = this.videoExt(file.originalname ?? '', file.mimetype);
    const mime =
      ext === 'webm' ? 'video/webm' : 'video/mp4';
    const key = `${SITE_PREFIX}hero_video_${Date.now()}.${ext}`;
    await this.storage.upload(key, file.buffer, mime);
    if (row.heroVideoKey) {
      await this.storage.remove(row.heroVideoKey).catch(() => {});
    }
    await this.prisma.siteConfig.update({
      where: { id: row.id },
      data: { heroVideoKey: key },
    });
    return this.getForAdmin(user);
  }

  async removeHeroVideo(user: Usuario): Promise<SiteConfigAdmin> {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode alterar a configuração do site');
    }
    const row = await this.getRow();
    if (!row) throw new InternalServerErrorException('Configuração do site indisponível.');
    if (row.heroVideoKey) {
      await this.storage.remove(row.heroVideoKey).catch(() => {});
    }
    await this.prisma.siteConfig.update({
      where: { id: row.id },
      data: { heroVideoKey: null },
    });
    return this.getForAdmin(user);
  }
}
