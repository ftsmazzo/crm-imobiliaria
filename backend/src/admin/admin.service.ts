import { ForbiddenException, Injectable } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { EvolutionService } from '../evolution/evolution.service';
import { ImoveisService } from '../imoveis/imoveis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private imoveisService: ImoveisService,
    private evolutionService: EvolutionService,
  ) {}

  /**
   * Limpa dados de desenvolvimento: imóveis, leads (contatos), interesses, tarefas,
   * documentos de processo, proprietários. Mantém: usuários, site config, tipo documento, empreendimentos.
   */
  async limparParaProducao(user: Usuario): Promise<{ message: string; removidos: Record<string, number> }> {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode executar esta ação');
    }

    const removidos: Record<string, number> = {};

    await this.prisma.$transaction(async (tx) => {
      const tarefas = await tx.tarefa.deleteMany({});
      removidos.tarefas = tarefas.count;

      const interesses = await tx.interesse.deleteMany({});
      removidos.interesses = interesses.count;

      const processoDoc = await tx.processoDocumento.deleteMany({});
      removidos.documentosProcesso = processoDoc.count;

      const contatos = await tx.contato.deleteMany({});
      removidos.contatos = contatos.count;

      const imoveis = await tx.imovel.deleteMany({});
      removidos.imoveis = imoveis.count;

      const proprietarios = await tx.proprietario.deleteMany({});
      removidos.proprietarios = proprietarios.count;
    });

    return {
      message: 'Dados de desenvolvimento removidos. Usuários, configuração do site, tipos de documento e empreendimentos foram mantidos.',
      removidos,
    };
  }

  /** Monta o texto da mensagem que será enviada ao corretor (WhatsApp). */
  private mensagemDisparoAmarelo(codigo: string | null, id: string, diasDesdeVerificacao: number): string {
    const cod = codigo || id.slice(0, 8);
    return (
      `*Imóvel ${cod}* está há ${diasDesdeVerificacao} dias sem verificação de disponibilidade.\n\n` +
      `Confirme se ainda está disponível. Para confirmar pelo WhatsApp, responda:\n*confirmar ${cod}*`
    );
  }

  /** Lista imóveis amarelos (15+ dias) sem notificação enviada, com preview da mensagem. Apenas gestor. */
  async disparoAmareloPendentes(user: Usuario) {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode listar pendentes de disparo');
    }
    const list = await this.imoveisService.listarParaDisparoAmarelo();
    return list.map((item) => ({
      ...item,
      mensagem: this.mensagemDisparoAmarelo(item.codigo, item.id, item.diasDesdeVerificacao),
    }));
  }

  /** Marca notificação amarelo como enviada para o imóvel. Apenas gestor. */
  async marcarNotificacaoAmareloEnviada(user: Usuario, imovelId: string) {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode marcar notificação enviada');
    }
    await this.imoveisService.marcarNotificacaoAmareloEnviada(imovelId);
    return { ok: true };
  }

  /**
   * Executa o disparo de notificação amarela: lista imóveis pendentes, envia WhatsApp
   * ao corretor responsável (se tiver telefone e Evolution configurada) e marca como enviada.
   * Chamado pelo cron diário ou manualmente.
   */
  async executarDisparoAmarelo(): Promise<{ enviados: number; semTelefone: number; erros: number }> {
    const pendentes = await this.imoveisService.listarParaDisparoAmarelo();
    let enviados = 0;
    let semTelefone = 0;
    let erros = 0;

    if (!this.evolutionService.isConfigured()) {
      return { enviados: 0, semTelefone: pendentes.length, erros: 0 };
    }

    for (const item of pendentes) {
      const telefone = item.usuarioResponsavel?.telefone?.trim();
      if (!telefone) {
        semTelefone++;
        continue;
      }
      const texto = this.mensagemDisparoAmarelo(item.codigo, item.id, item.diasDesdeVerificacao);
      const ok = await this.evolutionService.sendText(telefone, texto);
      if (ok) {
        await this.imoveisService.marcarNotificacaoAmareloEnviada(item.id);
        enviados++;
      } else {
        erros++;
      }
    }

    return { enviados, semTelefone, erros };
  }

  /**
   * Configura na Evolution API o webhook MESSAGES_UPSERT para a URL do nosso backend.
   * Assim, quando o corretor responder no WhatsApp, a Evolution chama nosso endpoint e o status atualiza.
   * Exige PUBLIC_BACKEND_URL no .env do backend (ex.: https://cmr-imobiliaria-backend.90qhxz.easypanel.host).
   */
  async configurarWebhookEvolution(user: Usuario): Promise<{ ok: boolean; message?: string; erro?: string }> {
    if (user.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode configurar o webhook');
    }
    const base = process.env.PUBLIC_BACKEND_URL?.trim();
    if (!base) {
      return {
        ok: false,
        erro: 'Configure PUBLIC_BACKEND_URL no servidor (ex.: https://seu-backend.easypanel.host) e reinicie o backend.',
      };
    }
    const webhookUrl = base.replace(/\/$/, '') + '/imoveis/webhook/evolution-messages-upsert';
    return this.evolutionService.setWebhook(webhookUrl);
  }
}
