import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser } from './current-user.decorator';
import { Usuario } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Get('usuarios')
  getUsuarios(@CurrentUser() user: Usuario) {
    return this.auth.getUsuarios(user);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
