import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProcessoDocumentoService } from '../processo-documento/processo-documento.service';
import { ContatosService } from './contatos.service';
import { CreateContatoDto } from './dto/create-contato.dto';
import { UpdateContatoDto } from './dto/update-contato.dto';

@Controller('contatos')
export class ContatosController {
  constructor(
    private service: ContatosService,
    private processoDocumentosService: ProcessoDocumentoService,
  ) {}

  @Post()
  create(@CurrentUser() user: Usuario, @Body() dto: CreateContatoDto) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: Usuario,
    @Query('estagio') estagio?: string,
    @Query('usuarioResponsavelId') usuarioResponsavelId?: string,
  ) {
    return this.service.findAll(estagio, usuarioResponsavelId, user);
  }

  @Get(':id/documentos')
  listDocumentos(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.processoDocumentosService.list(id, user);
  }

  @Post(':id/documentos')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } })) // 15MB
  async uploadDocumento(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string },
    @Body('tipoDocumentoId') tipoDocumentoId?: string,
    @Body('imovelId') imovelId?: string,
  ) {
    if (!file?.buffer) throw new Error('Arquivo não enviado');
    return this.processoDocumentosService.upload(id, file, tipoDocumentoId, imovelId, user);
  }

  @Get(':id/documentos/:docId/url')
  async getDocumentoUrl(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return { url: await this.processoDocumentosService.getViewUrl(id, docId, user) };
  }

  @Delete(':id/documentos/:docId')
  removeDocumento(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('docId', ParseUUIDPipe) docId: string,
  ) {
    return this.processoDocumentosService.remove(id, docId, user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id, user);
  }

  @Put(':id')
  update(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContatoDto,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id, user);
  }
}
