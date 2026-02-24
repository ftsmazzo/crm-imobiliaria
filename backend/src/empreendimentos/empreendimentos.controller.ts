import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { EmpreendimentosService } from './empreendimentos.service';
import { CreateEmpreendimentoDto } from './dto/create-empreendimento.dto';
import { UpdateEmpreendimentoDto } from './dto/update-empreendimento.dto';

@Controller('empreendimentos')
export class EmpreendimentosController {
  constructor(private service: EmpreendimentosService) {}

  @Post()
  create(@CurrentUser() _user: Usuario, @Body() dto: CreateEmpreendimentoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(
    @CurrentUser() _user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmpreendimentoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() _user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
