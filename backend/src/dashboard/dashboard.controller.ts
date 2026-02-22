import { Controller, Get } from '@nestjs/common';
import { Usuario } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('estatisticas')
  getEstatisticas(@CurrentUser() user: Usuario) {
    return this.service.getStats(user);
  }
}
