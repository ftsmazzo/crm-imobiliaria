import { Injectable, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { AdminService } from './admin.service';
import { AppConfigService } from './app-config.service';

const JOB_NAME = 'disparo-amarelo';

/**
 * Cron configurável: dispara notificação amarela para imóveis há 15+ dias sem verificação.
 * O agendamento é definido em AppConfig (chave cron_disparo_amarelo). Padrão: 9h diário.
 * Pode ser alterado em Administração para teste (ex.: a cada 1 minuto).
 */
@Injectable()
export class DisparoAmareloCronService implements OnModuleInit {
  constructor(
    private adminService: AdminService,
    private appConfig: AppConfigService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async onModuleInit() {
    await this.reschedule();
  }

  /**
   * (Re)agenda o job com a expressão cron atual do banco. Chamado na inicialização e ao atualizar a config no admin.
   */
  async reschedule(): Promise<{ cronExpression: string }> {
    const cronExpression = await this.appConfig.getCronDisparoAmarelo();
    try {
      if (this.schedulerRegistry.doesExist('cron', JOB_NAME)) {
        const existing = this.schedulerRegistry.getCronJob(JOB_NAME);
        existing.stop();
        this.schedulerRegistry.deleteCronJob(JOB_NAME);
      }
    } catch {
      // ignore
    }
    const job = new CronJob(
      cronExpression,
      () => this.runDisparo(),
      null,
      true,
    );
    this.schedulerRegistry.addCronJob(JOB_NAME, job);
    return { cronExpression };
  }

  private async runDisparo() {
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
