import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ContatosService } from './contatos.service';
import { CreateContatoDto } from './dto/create-contato.dto';
import { UpdateContatoDto } from './dto/update-contato.dto';

@Controller('contatos')
export class ContatosController {
  constructor(private service: ContatosService) {}

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
