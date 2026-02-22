import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ContatosService } from '../contatos/contatos.service';
import { ImoveisService } from '../imoveis/imoveis.service';
import { Public } from '../auth/public.decorator';
import { LeadPublicDto } from './dto/lead-public.dto';

@Public()
@Controller('api/public')
export class PublicController {
  constructor(
    private imoveis: ImoveisService,
    private contatos: ContatosService,
  ) {}

  @Get('imoveis')
  async listarImoveis(
    @Query('cidade') cidade?: string,
    @Query('bairro') bairro?: string,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
  ) {
    const lista = await this.imoveis.findAll(cidade, bairro, tipo, status ?? 'disponivel');
    return lista.map((i) => ({
      id: i.id,
      tipo: i.tipo,
      rua: i.rua,
      numero: i.numero,
      bairro: i.bairro,
      cidade: i.cidade,
      cep: i.cep,
      valorVenda: i.valorVenda?.toString(),
      valorAluguel: i.valorAluguel?.toString(),
      status: i.status,
      codigo: i.codigo,
      descricao: i.descricao,
      qtdQuartos: i.qtdQuartos,
      qtdBanheiros: i.qtdBanheiros,
      area: i.area?.toString(),
    }));
  }

  @Get('imoveis/:id')
  async detalheImovel(@Param('id', ParseUUIDPipe) id: string) {
    const i = await this.imoveis.findOne(id);
    return {
      id: i.id,
      tipo: i.tipo,
      rua: i.rua,
      numero: i.numero,
      bairro: i.bairro,
      cidade: i.cidade,
      cep: i.cep,
      valorVenda: i.valorVenda?.toString(),
      valorAluguel: i.valorAluguel?.toString(),
      status: i.status,
      codigo: i.codigo,
      descricao: i.descricao,
      qtdQuartos: i.qtdQuartos,
      qtdBanheiros: i.qtdBanheiros,
      area: i.area?.toString(),
    };
  }

  @Post('lead')
  async receberLead(@Body() dto: LeadPublicDto) {
    const contato = await this.contatos.create({
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
      origem: 'site',
      observacoes: dto.mensagem ?? undefined,
      estagio: 'novo',
    });
    return { id: contato.id, message: 'Lead recebido com sucesso' };
  }
}
