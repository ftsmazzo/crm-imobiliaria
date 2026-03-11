import { Module } from '@nestjs/common';
import { EvolutionModule } from '../evolution/evolution.module';
import { ImoveisModule } from '../imoveis/imoveis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { DisparoAmareloCronService } from './disparo-amarelo.cron';

@Module({
  imports: [PrismaModule, ImoveisModule, EvolutionModule],
  controllers: [AdminController],
  providers: [AdminService, DisparoAmareloCronService],
})
export class AdminModule {}
