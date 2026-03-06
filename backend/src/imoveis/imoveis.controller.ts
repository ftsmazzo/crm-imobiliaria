import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { ImoveisDocumentosService } from './imoveis-documentos.service';
import { ImoveisFotosService } from './imoveis-fotos.service';
import { ImoveisService } from './imoveis.service';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';

@Controller('imoveis')
export class ImoveisController {
  constructor(
    private service: ImoveisService,
    private fotosService: ImoveisFotosService,
    private documentosService: ImoveisDocumentosService,
  ) {}

  @Post()
  create(@CurrentUser() user: Usuario, @Body() dto: CreateImovelDto) {
    return this.service.create(dto, user);
  }

  @Post(':id/fotos')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } })) // 10MB
  async uploadFoto(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string },
  ) {
    if (!file?.buffer) throw new Error('Arquivo não enviado');
    return this.fotosService.upload(id, file, user);
  }

  @Get(':id/fotos')
  listFotos(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.fotosService.list(id, user);
  }

  @Delete(':id/fotos/:fotoId')
  removeFoto(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fotoId', ParseUUIDPipe) fotoId: string,
  ) {
    return this.fotosService.remove(id, fotoId, user);
  }

  @Patch(':id/fotos/:fotoId/capa')
  setFotoCapa(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('fotoId', ParseUUIDPipe) fotoId: string,
  ) {
    return this.fotosService.setCapa(id, fotoId, user);
  }

  @Post(':id/documentos')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } })) // 15MB
  async uploadDocumento(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string },
    @Body('tipo') tipo?: string,
  ) {
    if (!file?.buffer) throw new Error('Arquivo não enviado');
    return this.documentosService.upload(id, file, tipo || 'outro', user);
  }

  @Get(':id/documentos')
  listDocumentos(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.documentosService.list(id, user);
  }

  @Get(':id/documentos/:docId/url')
  async getDocumentoUrl(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return { url: await this.documentosService.getViewUrl(id, docId, user) };
  }

  @Delete(':id/documentos/:docId')
  removeDocumento(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return this.documentosService.remove(id, docId, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: Usuario,
    @Query('cidade') cidade?: string,
    @Query('bairro') bairro?: string,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
    @Query('usuarioResponsavelId') usuarioResponsavelId?: string,
    @Query('valorVendaMin') valorVendaMin?: string,
    @Query('valorVendaMax') valorVendaMax?: string,
    @Query('valorAluguelMin') valorAluguelMin?: string,
    @Query('valorAluguelMax') valorAluguelMax?: string,
    @Query('qtdQuartosMin') qtdQuartosMin?: string,
    @Query('areaMin') areaMin?: string,
    @Query('busca') busca?: string,
  ) {
    const opts = {
      ...(usuarioResponsavelId && { usuarioResponsavelId }),
      ...(valorVendaMin !== undefined && valorVendaMin !== '' && { valorVendaMin: Number(valorVendaMin) }),
      ...(valorVendaMax !== undefined && valorVendaMax !== '' && { valorVendaMax: Number(valorVendaMax) }),
      ...(valorAluguelMin !== undefined && valorAluguelMin !== '' && { valorAluguelMin: Number(valorAluguelMin) }),
      ...(valorAluguelMax !== undefined && valorAluguelMax !== '' && { valorAluguelMax: Number(valorAluguelMax) }),
      ...(qtdQuartosMin !== undefined && qtdQuartosMin !== '' && { qtdQuartosMin: Number(qtdQuartosMin) }),
      ...(areaMin !== undefined && areaMin !== '' && { areaMin: Number(areaMin) }),
      ...(busca?.trim() && { busca: busca.trim() }),
    };
    return this.service.findAll(cidade, bairro, tipo, status, undefined, user, opts);
  }

  @Get(':id')
  findOne(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id, user);
  }

  @Put(':id')
  update(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateImovelDto,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id, user);
  }
}
