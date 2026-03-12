import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ImoveisService } from '../imoveis/imoveis.service';
import { AdminService } from './admin.service';
import { DisparoAmareloCronService } from './disparo-amarelo.cron';

@Controller('admin')
export class AdminController {
  constructor(
    private admin: AdminService,
    private imoveisService: ImoveisService,
    private disparoAmareloCron: DisparoAmareloCronService,
  ) {}

  @Post('limpar-para-producao')
  limparParaProducao(@CurrentUser() user: Usuario) {
    return this.admin.limparParaProducao(user);
  }

  /** Lista imóveis que estão amarelos (15+ dias) e ainda não tiveram notificação enviada. Para uso do cron/disparo (Evolution, etc.). */
  @Get('disparo-amarelo-pendentes')
  disparoAmareloPendentes(@CurrentUser() user: Usuario) {
    return this.admin.disparoAmareloPendentes(user);
  }

  /** Marca que a notificação amarelo foi enviada para o imóvel (evita reenviar). Chamado após disparo. */
  @Post('imoveis/:id/notificacao-amarelo-enviada')
  marcarNotificacaoAmareloEnviada(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.admin.marcarNotificacaoAmareloEnviada(user, id);
  }

  /** Dispara agora as notificações amarelas (imóveis 15+ dias). Apenas gestor. Útil para testar sem esperar o cron. */
  @Post('disparo-amarelo/executar')
  executarDisparoAmarelo(@CurrentUser() user: Usuario) {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode executar o disparo');
    }
    return this.admin.executarDisparoAmarelo();
  }

  /** Configura na Evolution API o webhook MESSAGES_UPSERT para a URL deste backend (usa PUBLIC_BACKEND_URL). */
  @Post('configurar-webhook-evolution')
  configurarWebhookEvolution(@CurrentUser() user: Usuario) {
    return this.admin.configurarWebhookEvolution(user);
  }

  /** Retorna a expressão cron atual do disparo amarelo (ex.: "0 9 * * *" = 9h diário). Apenas gestor. */
  @Get('config/cron-disparo-amarelo')
  getCronDisparoAmarelo(@CurrentUser() user: Usuario) {
    return this.admin.getCronDisparoAmarelo(user);
  }

  /** Atualiza a expressão cron do disparo amarelo e reagenda o job. Apenas gestor. Ex.: "*/1 * * * *" = a cada 1 min (teste). */
  @Put('config/cron-disparo-amarelo')
  async setCronDisparoAmarelo(
    @CurrentUser() user: Usuario,
    @Body() body: { cronExpression: string },
  ) {
    await this.admin.setCronDisparoAmarelo(user, body?.cronExpression ?? '');
    return this.disparoAmareloCron.reschedule();
  }
}
