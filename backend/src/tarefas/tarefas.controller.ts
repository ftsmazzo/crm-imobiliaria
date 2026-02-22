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
    @CurrentUser() user: Usuario,
    @Query('usuarioId') usuarioId?: string,
    @Query('dataPrevista') dataPrevista?: string,
  ) {
    return this.service.findAll(user, usuarioId, dataPrevista);
  }

  @Get(':id')
  findOne(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id, user);
  }

  @Put(':id')
  update(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTarefaDto,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id, user);
  }
}
