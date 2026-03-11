import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AdminService } from './admin.service';

/**
 * Cron diário: dispara notificação amarela para imóveis há 15+ dias sem verificação.
 * Roda às 9h (horário do servidor). Configure EVOLUTION_* para envio via WhatsApp.
 */
@Injectable()
export class DisparoAmareloCronService {
  constructor(private adminService: AdminService) {}

  @Cron('0 9 * * *')
  async handleDisparoAmarelo() {
    try {
      const result = await this.adminService.executarDisparoAmarelo();
      if (result.enviados > 0 || result.semTelefone > 0 || result.erros > 0) {
        console.log(
          `[DisparoAmarelo] enviados=${result.enviados} semTelefone=${result.semTelefone} erros=${result.erros}`,
        );
      }
    } catch (err) {
      console.error('[DisparoAmarelo] erro:', err);
    }
  }
}
