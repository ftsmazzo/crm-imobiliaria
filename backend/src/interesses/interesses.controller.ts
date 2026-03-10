import { Body, Controller, Delete, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateInteresseDto } from './dto/create-interesse.dto';
import { InteressesService } from './interesses.service';

@Controller('interesses')
export class InteressesController {
  constructor(private service: InteressesService) {}

  @Post()
  create(@CurrentUser() user: Usuario, @Body() dto: CreateInteresseDto) {
    return this.service.create(dto, user);
  }

  @Delete(':id')
  remove(@CurrentUser() user: Usuario, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id, user);
  }
}
