import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { Usuario } from '@prisma/client';
import { TarefasService } from './tarefas.service';
import { CreateTarefaDto } from './dto/create-tarefa.dto';
import { UpdateTarefaDto } from './dto/update-tarefa.dto';

@Controller('tarefas')
export class TarefasController {
  constructor(private service: TarefasService) {}

  @Post()
  create(@CurrentUser() user: Usuario, @Body() dto: CreateTarefaDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  findAll(
    @Query('usuarioId') usuarioId?: string,
    @Query('dataPrevista') dataPrevista?: string,
  ) {
    return this.service.findAll(usuarioId, dataPrevista);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTarefaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
