import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ProprietariosService } from './proprietarios.service';
import { CreateProprietarioDto } from './dto/create-proprietario.dto';
import { UpdateProprietarioDto } from './dto/update-proprietario.dto';

@Controller('proprietarios')
export class ProprietariosController {
  constructor(private service: ProprietariosService) {}

  @Post()
  create(@CurrentUser() _user: Usuario, @Body() dto: CreateProprietarioDto) {
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
    @Body() dto: UpdateProprietarioDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() _user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
