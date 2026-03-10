import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ContatosService } from '../contatos/contatos.service';
import { ImoveisFotosService } from '../imoveis/imoveis-fotos.service';
import { ImoveisService } from '../imoveis/imoveis.service';
import { PrismaService } from '../prisma/prisma.service';
import { SiteConfigService } from '../site-config/site-config.service';
import { Public } from '../auth/public.decorator';
import { LeadPublicDto } from './dto/lead-public.dto';
import { LeadRateLimitGuard } from './lead-rate-limit.guard';

@Public()
@Controller('api/public')
export class PublicController {
  constructor(
    private imoveis: ImoveisService,
    private contatos: ContatosService,
    private fotosService: ImoveisFotosService,
    private prisma: PrismaService,
    private siteConfig: SiteConfigService,
  ) {}

  @Get('imoveis')
  async listarImoveis(
    @Query('cidade') cidade?: string,
    @Query('bairro') bairro?: string,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
    @Query('destaque') destaque?: string,
  ) {
    const lista = await this.imoveis.findAll(
      cidade,
      bairro,
      tipo,
      status ?? 'disponivel',
      destaque === 'true' ? true : undefined,
      undefined,
    );
    const result = await Promise.all(
      lista.map(async (i) => {
        let fotos: { id: string; url: string; capa?: boolean }[] = [];
        try {
          fotos = await this.fotosService.getPresignedUrlsForImovel(i.id);
        } catch {
          // MinIO/storage falhou: site continua mostrando imóvel sem fotos
        }
        return {
          id: i.id,
          tipo: i.tipo,
          rua: i.rua,
          numero: i.numero,
          bairro: i.bairro,
          cidade: i.cidade,
          cep: i.cep,
          exibirEnderecoSite: i.exibirEnderecoSite ?? true,
          valorVenda: i.valorVenda?.toString(),
          valorAluguel: i.valorAluguel?.toString(),
          status: i.status,
          codigo: i.codigo,
          descricao: i.descricao,
          qtdQuartos: i.qtdQuartos,
          qtdBanheiros: i.qtdBanheiros,
          area: i.area?.toString(),
          // fotos já vêm ordenadas: capa primeiro, depois ordem (para carousel no site)
          fotos: fotos.map((f) => ({ id: f.id, url: f.url, capa: f.capa })),
        };
      }),
    );
    return result;
  }

  @Get('imoveis/:id')
  async detalheImovel(@Param('id', ParseUUIDPipe) id: string) {
    const i = await this.imoveis.findOne(id);
    if (i.status !== 'disponivel') {
      throw new NotFoundException('Imóvel não disponível');
    }
    let fotos: { id: string; url: string; capa?: boolean }[] = [];
    try {
      fotos = await this.fotosService.getPresignedUrlsForImovel(i.id);
    } catch {
      // MinIO/storage falhou: detalhe continua sem fotos
    }
    return {
      id: i.id,
      tipo: i.tipo,
      rua: i.rua,
      numero: i.numero,
      bairro: i.bairro,
      cidade: i.cidade,
      cep: i.cep,
      exibirEnderecoSite: i.exibirEnderecoSite ?? true,
      valorVenda: i.valorVenda?.toString(),
      valorAluguel: i.valorAluguel?.toString(),
      valorIptu: i.valorIptu?.toString(),
      valorCondominio: i.valorCondominio?.toString(),
      status: i.status,
      codigo: i.codigo,
      descricao: i.descricao,
      qtdQuartos: i.qtdQuartos,
      qtdBanheiros: i.qtdBanheiros,
      qtdSalas: i.qtdSalas,
      lavabo: i.lavabo,
      area: i.area?.toString(),
      areaTerreno: i.areaTerreno?.toString(),
      qtdVagas: i.qtdVagas,
      tipoVaga: i.tipoVaga,
      anoConstrucao: i.anoConstrucao,
      tipoPiso: i.tipoPiso,
      pontosReferencia: i.pontosReferencia,
      eletrodomesticos: i.eletrodomesticos,
      andarUnidade: i.andarUnidade,
      caracteristicas: i.caracteristicas,
      empreendimento: i.empreendimento ? { id: i.empreendimento.id, nome: i.empreendimento.nome } : null,
      fotos: fotos.map((f) => ({ id: f.id, url: f.url, capa: f.capa })),
    };
  }

  @Get('site-config')
  getSiteConfig() {
    return this.siteConfig.getPublic();
  }

  @Post('lead')
  @UseGuards(LeadRateLimitGuard)
  async receberLead(@Body() dto: LeadPublicDto) {
    const emailNorm = dto.email.toLowerCase().trim();

    // 1º registro: Contato (pessoa/lead) – buscar por e-mail para não duplicar; se já existir, reutilizar
    let contato = await this.prisma.contato.findFirst({
      where: { email: emailNorm },
      orderBy: { criadoEm: 'desc' },
    });
    if (!contato) {
      contato = await this.contatos.create(
        {
          nome: dto.nome,
          email: dto.email,
          telefone: dto.telefone,
          origem: dto.origem ?? 'site',
          observacoes: dto.mensagem ?? undefined,
          estagio: 'novo',
        },
        undefined,
      );
    } else {
      // Atualiza dados do contato existente com as informações mais recentes
      await this.prisma.contato.update({
        where: { id: contato.id },
        data: {
          nome: dto.nome,
          telefone: dto.telefone ?? contato.telefone ?? undefined,
          observacoes: dto.mensagem
            ? [contato.observacoes, dto.mensagem].filter(Boolean).join('\n---\n')
            : contato.observacoes,
        },
      });
    }

    // 2º registro: Interesse (lead ligado ao imóvel) – sempre criar quando houver imovelId
    if (dto.imovelId) {
      await this.prisma.interesse.create({
        data: {
          contatoId: contato.id,
          imovelId: dto.imovelId,
          tipo: 'interesse',
          observacao: dto.mensagem ?? undefined,
        },
      });
    }

    return { id: contato.id, message: 'Lead recebido com sucesso' };
  }
}
