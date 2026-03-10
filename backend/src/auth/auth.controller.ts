import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { Usuario } from '@prisma/client';
import { AuthService } from './auth.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('usuarios')
  getUsuarios(@CurrentUser() user: Usuario) {
    return this.auth.getUsuarios(user);
  }

  @Post('usuarios')
  createUsuario(@CurrentUser() user: Usuario, @Body() dto: CreateUsuarioDto) {
    return this.auth.createUsuario(dto, user);
  }

  @Patch('usuarios/:id')
  updateUsuario(
    @CurrentUser() user: Usuario,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.auth.updateUsuario(id, dto, user);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
