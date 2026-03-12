import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Usuario } from '@prisma/client';
import { EvolutionService } from '../evolution/evolution.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';

/** Prefixo do código por tipo: AP, CA, TR, CAC, TRC, COM */
const TIPO_CODIGO_PREFIX: Record<string, string> = {
  apartamento: 'AP',
  casa: 'CA',
  terreno: 'TR',
  casa_condominio: 'CAC',
  terreno_condominio: 'TRC',
  comercial: 'COM',
};

const PREFIX_DEFAULT = 'IMV';

/** Semáforo de disponibilidade: verde < 15d, amarelo 15–30d, vermelho > 30d desde última verificação (ou criadoEm). */
const DIAS_AMARELO = 15;
const DIAS_VERMELHO = 30;

export type StatusSemaforo = 'verde' | 'amarelo' | 'vermelho';

export function getStatusSemaforo(
  ultimaVerificacao: Date | null,
  criadoEm: Date,
): { status: StatusSemaforo; diasDesdeVerificacao: number } {
  const ref = ultimaVerificacao ?? criadoEm;
  const agora = new Date();
  const dias = Math.floor((agora.getTime() - ref.getTime()) / (24 * 60 * 60 * 1000));
  const status: StatusSemaforo =
    dias >= DIAS_VERMELHO ? 'vermelho' : dias >= DIAS_AMARELO ? 'amarelo' : 'verde';
  return { status, diasDesdeVerificacao: dias };
}

@Injectable()
export class ImoveisService {
  constructor(
    private prisma: PrismaService,
    private evolutionService: EvolutionService,
  ) {}

  private async getNextCodigoForTipo(tipo: string): Promise<string> {
    const prefix = TIPO_CODIGO_PREFIX[tipo] || PREFIX_DEFAULT;
    const pattern = `${prefix}-%`;
    const list = await this.prisma.imovel.findMany({
      where: { codigo: { not: null } },
      select: { codigo: true },
    });
    let maxNum = 0;
    const prefixMatch = new RegExp(`^${prefix}-(\\d+)$`, 'i');
    for (const row of list) {
      const c = row.codigo?.trim();
      if (!c) continue;
      const m = c.match(prefixMatch);
      if (m) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n) && n > maxNum) maxNum = n;
      }
    }
    return `${prefix}-${String(maxNum + 1).padStart(5, '0')}`;
  }

  async create(dto: CreateImovelDto, user?: Usuario) {
    const usuarioResponsavelId =
      dto.usuarioResponsavelId ??
      (user?.role === 'corretor' ? user.id : undefined);
    let codigo = dto.codigo?.trim() || undefined;
    if (!codigo) {
      codigo = await this.getNextCodigoForTipo(dto.tipo);
    }
    return this.prisma.imovel.create({
      data: {
        tipo: dto.tipo,
        rua: dto.rua,
        numero: dto.numero,
        complemento: dto.complemento,
        bairro: dto.bairro,
        cidade: dto.cidade,
        cep: dto.cep,
        valorVenda: dto.valorVenda != null ? dto.valorVenda : undefined,
        valorAluguel: dto.valorAluguel != null ? dto.valorAluguel : undefined,
        valorIptu: dto.valorIptu != null ? dto.valorIptu : undefined,
        valorCondominio: dto.valorCondominio != null ? dto.valorCondominio : undefined,
        status: dto.status ?? 'disponivel',
        destaque: dto.destaque ?? false,
        promocao: dto.promocao ?? false,
        codigo,
        quadra: dto.quadra,
        lote: dto.lote,
        numeroMatricula: dto.numeroMatricula,
        numeroIptu: dto.numeroIptu,
        cartorio: dto.cartorio,
        tipoListing: dto.tipoListing,
        subtipo: dto.subtipo,
        exibirEnderecoSite: dto.exibirEnderecoSite,
        descricao: dto.descricao,
        qtdQuartos: dto.qtdQuartos,
        qtdBanheiros: dto.qtdBanheiros,
        qtdSalas: dto.qtdSalas,
        lavabo: dto.lavabo,
        qtdVagas: dto.qtdVagas,
        tipoVaga: dto.tipoVaga,
        area: dto.area != null ? dto.area : undefined,
        areaTerreno: dto.areaTerreno != null ? dto.areaTerreno : undefined,
        anoConstrucao: dto.anoConstrucao,
        tipoPiso: dto.tipoPiso,
        pontosReferencia: dto.pontosReferencia,
        eletrodomesticos: dto.eletrodomesticos,
        andarUnidade: dto.andarUnidade,
        qtdAndares: dto.qtdAndares,
        totalUnidades: dto.totalUnidades,
        qtdTorres: dto.qtdTorres,
        caracteristicas: dto.caracteristicas,
        empreendimentoId: dto.empreendimentoId ?? undefined,
        proprietarioId: dto.proprietarioId ?? undefined,
        usuarioResponsavelId: usuarioResponsavelId ?? undefined,
      },
    });
  }

  async findAll(
    cidade?: string,
    bairro?: string,
    tipo?: string,
    status?: string,
    destaque?: boolean,
    user?: Usuario,
    opts?: {
      usuarioResponsavelId?: string;
      valorVendaMin?: number;
      valorVendaMax?: number;
      valorAluguelMin?: number;
      valorAluguelMax?: number;
      qtdQuartosMin?: number;
      areaMin?: number;
      busca?: string;
      statusSemaforo?: StatusSemaforo;
    },
  ) {
    const where: Prisma.ImovelWhereInput = {};
    if (cidade) where.cidade = { contains: cidade, mode: 'insensitive' };
    if (bairro) where.bairro = { contains: bairro, mode: 'insensitive' };
    if (tipo) where.tipo = tipo;
    if (status) where.status = status;
    if (destaque === true) where.destaque = true;
    if (user?.role === 'corretor') {
      where.usuarioResponsavelId = user.id;
    } else if (opts?.usuarioResponsavelId) {
      where.usuarioResponsavelId = opts.usuarioResponsavelId;
    }
    if (opts?.valorVendaMin != null || opts?.valorVendaMax != null) {
      where.valorVenda = {};
      if (opts.valorVendaMin != null) (where.valorVenda as Prisma.DecimalNullableFilter).gte = opts.valorVendaMin;
      if (opts.valorVendaMax != null) (where.valorVenda as Prisma.DecimalNullableFilter).lte = opts.valorVendaMax;
    }
    if (opts?.valorAluguelMin != null || opts?.valorAluguelMax != null) {
      where.valorAluguel = {};
      if (opts.valorAluguelMin != null) (where.valorAluguel as Prisma.DecimalNullableFilter).gte = opts.valorAluguelMin;
      if (opts.valorAluguelMax != null) (where.valorAluguel as Prisma.DecimalNullableFilter).lte = opts.valorAluguelMax;
    }
    if (opts?.qtdQuartosMin != null) where.qtdQuartos = { gte: opts.qtdQuartosMin };
    if (opts?.areaMin != null) where.area = { gte: opts.areaMin };
    if (opts?.busca?.trim()) {
      const term = opts.busca.trim();
      where.OR = [
        { codigo: { contains: term, mode: 'insensitive' } },
        { bairro: { contains: term, mode: 'insensitive' } },
        { cidade: { contains: term, mode: 'insensitive' } },
        { descricao: { contains: term, mode: 'insensitive' } },
        { empreendimento: { nome: { contains: term, mode: 'insensitive' } } },
      ];
    }
    const list = await this.prisma.imovel.findMany({
      where,
      orderBy: { criadoEm: 'desc' },
      include: {
        usuarioResponsavel: { select: { id: true, nome: true } },
        empreendimento: { select: { id: true, nome: true } },
        proprietario: { select: { id: true, nome: true, email: true, telefone: true } },
      },
    });
    const statusSemaforoFilter = opts?.statusSemaforo as StatusSemaforo | undefined;
    return list
      .map((imovel) => {
        const { status, diasDesdeVerificacao } = getStatusSemaforo(
          imovel.ultimaVerificacaoDisponibilidade,
          imovel.criadoEm,
        );
        return {
          ...imovel,
          statusSemaforo: status,
          diasDesdeVerificacao,
        };
      })
      .filter((imovel) => !statusSemaforoFilter || imovel.statusSemaforo === statusSemaforoFilter);
  }

  async findOne(id: string, user?: Usuario) {
    const i = await this.prisma.imovel.findUnique({
      where: { id },
      include: {
        usuarioResponsavel: { select: { id: true, nome: true, email: true } },
        empreendimento: { select: { id: true, nome: true } },
        proprietario: { select: { id: true, nome: true, email: true, telefone: true } },
        fotos: { orderBy: { ordem: 'asc' } },
        documentos: true,
        interesses: { include: { contato: { select: { id: true, nome: true, email: true } } } },
        tarefas: true,
      },
    });
    if (!i) throw new NotFoundException('Imóvel não encontrado');
    if (user?.role === 'corretor' && i.usuarioResponsavelId !== user.id) {
      throw new ForbiddenException('Sem permissão para acessar este imóvel');
    }
    const { status, diasDesdeVerificacao } = getStatusSemaforo(
      i.ultimaVerificacaoDisponibilidade,
      i.criadoEm,
    );
    return { ...i, statusSemaforo: status, diasDesdeVerificacao };
  }

  /** Confirma que o imóvel ainda está disponível; reinicia a contagem do semáforo (volta para verde). */
  async confirmarDisponibilidade(
    id: string,
    user?: Usuario,
    observacao?: string,
  ) {
    const imovel = await this.findOne(id, user);
    const now = new Date();
    const linhaDescricao = `\n\n[${now.toLocaleDateString('pt-BR')}] Imóvel ainda disponível.${observacao ? ` ${observacao}` : ''}`;
    const novaDescricao = (imovel.descricao ?? '').trim() + linhaDescricao;
    await this.prisma.imovel.update({
      where: { id },
      data: {
        ultimaVerificacaoDisponibilidade: now,
        notificacaoAmareloEnviadaEm: null,
        descricao: novaDescricao,
      },
    });
    return this.findOne(id, user);
  }

  /**
   * Processa mensagem (ex.: resposta WhatsApp) para confirmar disponibilidade pelo código do imóvel.
   * Frases aceitas: "confirmar AP-00001", "imóvel ainda disponível AP-00001", "CONFIRMAR AP-00001", etc.
   * Se telefoneRemetente for informado (Evolution envia ao chamar o webhook), envia confirmação: "Status atualizado. Obrigado!"
   * Retorna o imóvel atualizado se encontrado e confirmado.
   */
  async confirmarDisponibilidadePorMensagem(
    texto: string,
    telefoneRemetente?: string,
  ): Promise<{
    ok: boolean;
    imovel?: Awaited<ReturnType<ImoveisService['findOne']>>;
    erro?: string;
  }> {
    const codigo = this.extrairCodigoImovelDaMensagem(texto);
    if (!codigo) {
      return { ok: false, erro: 'Código do imóvel não identificado na mensagem.' };
    }
    const imovel = await this.prisma.imovel.findFirst({
      where: { codigo: { equals: codigo, mode: 'insensitive' } },
    });
    if (!imovel) {
      return { ok: false, erro: `Imóvel com código "${codigo}" não encontrado.` };
    }
    await this.confirmarDisponibilidade(imovel.id, undefined, 'Confirmado via mensagem.');
    const atualizado = await this.findOne(imovel.id);
    if (telefoneRemetente?.trim() && this.evolutionService.isConfigured()) {
      await this.evolutionService.sendText(
        telefoneRemetente.trim(),
        'Status atualizado. Obrigado!',
      );
    }
    return { ok: true, imovel: atualizado };
  }

  private extrairCodigoImovelDaMensagem(texto: string): string | null {
    if (!texto?.trim()) return null;
    const t = texto.trim();
    const padraoCodigo = /\b(AP|CA|TR|CAC|TRC|COM|IMV)-?(\d{1,10})\b/i;
    const match = t.match(padraoCodigo);
    if (!match) return null;
    const prefix = match[1].toUpperCase();
    const num = match[2];
    return `${prefix}-${num}`;
  }

  /**
   * Processa o payload do webhook Evolution API (evento MESSAGES_UPSERT).
   * Aceita: data como objeto ou array; body com key/message no topo; event opcional.
   * Ignora mensagens enviadas por nós (fromMe === true).
   */
  async processarWebhookEvolutionMessagesUpsert(body: Record<string, unknown>): Promise<{
    ok: boolean;
    ignorado?: string;
    erro?: string;
    imovel?: Awaited<ReturnType<ImoveisService['findOne']>>;
  }> {
    const event = String(body?.event ?? body?.type ?? '').toLowerCase();
    if (event && event !== 'messages.upsert' && event !== 'messages_upsert') {
      return { ok: true, ignorado: 'Evento não é messages.upsert' };
    }

    let first: Record<string, unknown> | undefined;
    const data = body?.data;
    if (data != null && typeof data === 'object') {
      const items = Array.isArray(data) ? data : [data];
      first = items[0] as Record<string, unknown> | undefined;
    }
    if (!first && body?.key != null && body?.message != null) {
      first = body as Record<string, unknown>;
    }
    if (!first) {
      return { ok: true, ignorado: 'Payload sem data/key/message' };
    }

    const key = (first.key ?? first) as Record<string, unknown> | undefined;
    const fromMe = key?.fromMe === true;
    if (fromMe) {
      return { ok: true, ignorado: 'Mensagem enviada por nós' };
    }

    const message = (first.message ?? first) as Record<string, unknown> | undefined;
    let texto = '';
    if (typeof message?.conversation === 'string') {
      texto = message.conversation;
    } else if (message?.extendedTextMessage != null && typeof (message.extendedTextMessage as Record<string, unknown>)?.text === 'string') {
      texto = (message.extendedTextMessage as Record<string, unknown>).text as string;
    } else if (message && typeof message === 'object') {
      const ext = message.extendedTextMessage as Record<string, unknown> | undefined;
      if (typeof ext?.text === 'string') texto = ext.text;
    }
    texto = (texto || '').trim();

    const remoteJid = typeof key?.remoteJid === 'string' ? key.remoteJid : '';
    const telefone = remoteJid.replace(/@s\.whatsapp\.net$/i, '').replace(/@.+$/, '').trim() || undefined;

    return this.confirmarDisponibilidadePorMensagem(texto, telefone);
  }

  /**
   * Lista imóveis que viraram amarelo (15+ dias) e ainda não tiveram notificação enviada.
   * Ao disparar, marcar notificacaoAmareloEnviadaEm para não reenviar (até o corretor confirmar e zerar).
   */
  async listarParaDisparoAmarelo(): Promise<
    Array<{ id: string; codigo: string | null; usuarioResponsavel: { id: string; nome: string; telefone: string | null } | null; diasDesdeVerificacao: number }>
  > {
    const list = await this.prisma.imovel.findMany({
      where: {
        status: 'disponivel',
        notificacaoAmareloEnviadaEm: null,
      },
      select: {
        id: true,
        codigo: true,
        criadoEm: true,
        ultimaVerificacaoDisponibilidade: true,
        usuarioResponsavel: { select: { id: true, nome: true, telefone: true } },
      },
    });
    const agora = new Date();
    return list
      .map((imovel) => {
        const ref = imovel.ultimaVerificacaoDisponibilidade ?? imovel.criadoEm;
        const dias = Math.floor((agora.getTime() - ref.getTime()) / (24 * 60 * 60 * 1000));
        return { ...imovel, diasDesdeVerificacao: dias };
      })
      .filter((imovel) => imovel.diasDesdeVerificacao >= DIAS_AMARELO);
  }

  /**
   * Marca que a notificação amarelo foi enviada para o imóvel (para não reenviar).
   * Chamado após o disparo (Evolution API ou outro canal).
   */
  async marcarNotificacaoAmareloEnviada(id: string): Promise<void> {
    await this.prisma.imovel.update({
      where: { id },
      data: { notificacaoAmareloEnviadaEm: new Date() },
    });
  }

  /**
   * Simula X dias sem verificação (para teste em desenvolvimento). Apenas gestor.
   * Define ultimaVerificacaoDisponibilidade = agora - diasAtras e zera notificação enviada.
   * Ex.: diasAtras = 20 → imóvel fica amarelo; 35 → vermelho.
   */
  async simularDiasSemVerificacao(id: string, diasAtras: number, user?: Usuario): Promise<void> {
    if (user?.role !== 'gestor') {
      throw new ForbiddenException('Apenas gestor pode simular dias para teste');
    }
    if (diasAtras < 1 || diasAtras > 365) {
      throw new ForbiddenException('diasAtras deve ser entre 1 e 365');
    }
    await this.findOne(id, user);
    const dataRef = new Date();
    dataRef.setDate(dataRef.getDate() - diasAtras);
    await this.prisma.imovel.update({
      where: { id },
      data: {
        ultimaVerificacaoDisponibilidade: dataRef,
        notificacaoAmareloEnviadaEm: null,
      },
    });
  }

  async update(id: string, dto: UpdateImovelDto, user?: Usuario) {
    await this.findOne(id, user);
    const data: Prisma.ImovelUpdateInput = {
      ...(dto.tipo !== undefined && { tipo: dto.tipo }),
      ...(dto.rua !== undefined && { rua: dto.rua }),
      ...(dto.numero !== undefined && { numero: dto.numero }),
      ...(dto.complemento !== undefined && { complemento: dto.complemento }),
      ...(dto.bairro !== undefined && { bairro: dto.bairro }),
      ...(dto.cidade !== undefined && { cidade: dto.cidade }),
      ...(dto.cep !== undefined && { cep: dto.cep }),
      ...(dto.valorVenda !== undefined && { valorVenda: dto.valorVenda }),
      ...(dto.valorAluguel !== undefined && { valorAluguel: dto.valorAluguel }),
      ...(dto.valorIptu !== undefined && { valorIptu: dto.valorIptu }),
      ...(dto.valorCondominio !== undefined && { valorCondominio: dto.valorCondominio }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.destaque !== undefined && { destaque: dto.destaque }),
      ...(dto.promocao !== undefined && { promocao: dto.promocao }),
      ...(dto.codigo !== undefined && { codigo: dto.codigo }),
      ...(dto.quadra !== undefined && { quadra: dto.quadra }),
      ...(dto.lote !== undefined && { lote: dto.lote }),
      ...(dto.descricao !== undefined && { descricao: dto.descricao }),
      ...(dto.qtdQuartos !== undefined && { qtdQuartos: dto.qtdQuartos }),
      ...(dto.qtdBanheiros !== undefined && { qtdBanheiros: dto.qtdBanheiros }),
      ...(dto.qtdSalas !== undefined && { qtdSalas: dto.qtdSalas }),
      ...(dto.lavabo !== undefined && { lavabo: dto.lavabo }),
      ...(dto.area !== undefined && { area: dto.area }),
      ...(dto.areaTerreno !== undefined && { areaTerreno: dto.areaTerreno }),
      ...(dto.anoConstrucao !== undefined && { anoConstrucao: dto.anoConstrucao }),
      ...(dto.tipoPiso !== undefined && { tipoPiso: dto.tipoPiso }),
      ...(dto.numeroMatricula !== undefined && { numeroMatricula: dto.numeroMatricula }),
      ...(dto.numeroIptu !== undefined && { numeroIptu: dto.numeroIptu }),
      ...(dto.cartorio !== undefined && { cartorio: dto.cartorio }),
      ...(dto.tipoListing !== undefined && { tipoListing: dto.tipoListing }),
      ...(dto.subtipo !== undefined && { subtipo: dto.subtipo }),
      ...(dto.exibirEnderecoSite !== undefined && { exibirEnderecoSite: dto.exibirEnderecoSite }),
      ...(dto.qtdVagas !== undefined && { qtdVagas: dto.qtdVagas }),
      ...(dto.tipoVaga !== undefined && { tipoVaga: dto.tipoVaga }),
      ...(dto.pontosReferencia !== undefined && { pontosReferencia: dto.pontosReferencia }),
      ...(dto.eletrodomesticos !== undefined && { eletrodomesticos: dto.eletrodomesticos }),
      ...(dto.andarUnidade !== undefined && { andarUnidade: dto.andarUnidade }),
      ...(dto.qtdAndares !== undefined && { qtdAndares: dto.qtdAndares }),
      ...(dto.totalUnidades !== undefined && { totalUnidades: dto.totalUnidades }),
      ...(dto.qtdTorres !== undefined && { qtdTorres: dto.qtdTorres }),
      ...(dto.caracteristicas !== undefined && { caracteristicas: dto.caracteristicas }),
      ...(dto.empreendimentoId !== undefined && { empreendimentoId: dto.empreendimentoId?.trim() || null }),
      ...(dto.proprietarioId !== undefined && { proprietarioId: dto.proprietarioId?.trim() || null }),
      ...(dto.usuarioResponsavelId !== undefined && { usuarioResponsavelId: dto.usuarioResponsavelId?.trim() || null }),
    };
    if (user?.role === 'corretor') {
      delete (data as Record<string, unknown>).usuarioResponsavelId;
      delete (data as Record<string, unknown>).destaque; // apenas gestor pode alterar destaque (Fase 2.6)
    }
    return this.prisma.imovel.update({ where: { id }, data });
  }

  async remove(id: string, user?: Usuario) {
    await this.findOne(id, user);
    return this.prisma.imovel.delete({ where: { id } });
  }
}
