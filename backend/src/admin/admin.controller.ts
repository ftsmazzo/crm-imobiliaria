import { Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ImoveisService } from '../imoveis/imoveis.service';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    private admin: AdminService,
    private imoveisService: ImoveisService,
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
}
