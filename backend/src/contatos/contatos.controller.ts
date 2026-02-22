import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ContatosService } from './contatos.service';
import { CreateContatoDto } from './dto/create-contato.dto';
import { UpdateContatoDto } from './dto/update-contato.dto';

@Controller('contatos')
export class ContatosController {
  constructor(private service: ContatosService) {}

  @Post()
  create(@Body() dto: CreateContatoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('estagio') estagio?: string,
    @Query('usuarioResponsavelId') usuarioResponsavelId?: string,
  ) {
    return this.service.findAll(estagio, usuarioResponsavelId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateContatoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
