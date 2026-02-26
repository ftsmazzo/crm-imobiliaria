import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ContatosService } from '../contatos/contatos.service';
import { ImoveisFotosService } from '../imoveis/imoveis-fotos.service';
import { ImoveisService } from '../imoveis/imoveis.service';
import { PrismaService } from '../prisma/prisma.service';
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
        let fotos: { id: string; url: string }[] = [];
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
          fotos: fotos.map((f) => ({ id: f.id, url: f.url })),
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
    let fotos: { id: string; url: string }[] = [];
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
      fotos: fotos.map((f) => ({ id: f.id, url: f.url })),
    };
  }

  @Post('lead')
  @UseGuards(LeadRateLimitGuard)
  async receberLead(@Body() dto: LeadPublicDto) {
    const contato = await this.contatos.create(
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
