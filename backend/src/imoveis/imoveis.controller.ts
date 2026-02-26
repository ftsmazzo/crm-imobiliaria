import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { ImoveisFotosService } from './imoveis-fotos.service';
import { ImoveisService } from './imoveis.service';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';

@Controller('imoveis')
export class ImoveisController {
  constructor(
    private service: ImoveisService,
    private fotosService: ImoveisFotosService,
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

  @Get()
  findAll(
    @CurrentUser() user: Usuario,
    @Query('cidade') cidade?: string,
    @Query('bairro') bairro?: string,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(cidade, bairro, tipo, status, undefined, user);
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
