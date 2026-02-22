import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ImoveisService } from './imoveis.service';
import { CreateImovelDto } from './dto/create-imovel.dto';
import { UpdateImovelDto } from './dto/update-imovel.dto';

@Controller('imoveis')
export class ImoveisController {
  constructor(private service: ImoveisService) {}

  @Post()
  create(@CurrentUser() user: Usuario, @Body() dto: CreateImovelDto) {
    return this.service.create(dto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: Usuario,
    @Query('cidade') cidade?: string,
    @Query('bairro') bairro?: string,
    @Query('tipo') tipo?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(cidade, bairro, tipo, status, user);
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
