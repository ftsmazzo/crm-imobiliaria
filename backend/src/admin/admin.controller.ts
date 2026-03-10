import { Controller, Post } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Post('limpar-para-producao')
  limparParaProducao(@CurrentUser() user: Usuario) {
    return this.admin.limparParaProducao(user);
  }
}
