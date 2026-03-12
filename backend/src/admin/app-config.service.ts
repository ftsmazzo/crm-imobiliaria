import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const KEY_CRON_DISPARO_AMARELO = 'cron_disparo_amarelo';
const DEFAULT_CRON = '0 9 * * *'; // 9h diário

@Injectable()
export class AppConfigService {
  constructor(private prisma: PrismaService) {}

  async getCronDisparoAmarelo(): Promise<string> {
    const row = await this.prisma.appConfig.findUnique({
      where: { chave: KEY_CRON_DISPARO_AMARELO },
    });
    return row?.valor?.trim() || DEFAULT_CRON;
  }

  async setCronDisparoAmarelo(cronExpression: string): Promise<string> {
    const expr = cronExpression?.trim() || DEFAULT_CRON;
    await this.prisma.appConfig.upsert({
      where: { chave: KEY_CRON_DISPARO_AMARELO },
      create: { chave: KEY_CRON_DISPARO_AMARELO, valor: expr },
      update: { valor: expr },
    });
    return expr;
  }
}
