import { ForbiddenException, Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

const SITE_PREFIX = 'site/';
const PRESIGNED_EXPIRY = 60 * 60 * 24; // 24h

export interface SiteConfigPublic {
  logoUrl: string | null;
  heroImageUrl: string | null;
  nome: string | null;
  whatsapp: string | null;
  endereco: string | null;
  creci: string | null;
}

export interface SiteConfigAdmin extends SiteConfigPublic {
  id: string;
  logoKey: string | null;
  heroImageKey: string | null;
  atualizadoEm: Date;
}

@Injectable()
export class SiteConfigService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  private async getRow() {
    let row = await this.prisma.siteConfig.findFirst({ orderBy: { atualizadoEm: 'desc' } });
    if (!row) {
      row = await this.prisma.siteConfig.create({
        data: {},
      });
    }
    return row;
  }

  async getPublic(): Promise<SiteConfigPublic> {
    const row = await this.getRow();
    const [logoUrl, heroImageUrl] = await Promise.all([
      row.logoKey ? this.storage.getPresignedUrl(row.logoKey, PRESIGNED_EXPIRY).catch(() => null) : null,
      row.heroImageKey ? this.storage.getPresignedUrl(row.heroImageKey, PRESIGNED_EXPIRY).catch(() => null) : null,
    ]);
    return {
      logoUrl: logoUrl ?? null,
      heroImageUrl: heroImageUrl ?? null,
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
    const [logoUrl, heroImageUrl] = await Promise.all([
      row.logoKey ? this.storage.getPresignedUrl(row.logoKey, PRESIGNED_EXPIRY).catch(() => null) : null,
      row.heroImageKey ? this.storage.getPresignedUrl(row.heroImageKey, PRESIGNED_EXPIRY).catch(() => null) : null,
    ]);
    return {
      id: row.id,
      logoUrl: logoUrl ?? null,
      heroImageUrl: heroImageUrl ?? null,
      logoKey: row.logoKey,
      heroImageKey: row.heroImageKey,
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

  async uploadLogo(
    user: Usuario,
    file: { buffer: Buffer; mimetype: string; originalname?: string },
  ) {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode alterar a configuração do site');
    }
    const row = await this.getRow();
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
}
