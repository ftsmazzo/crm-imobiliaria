import { Module } from '@nestjs/common';
import { ImoveisModule } from '../imoveis/imoveis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, ImoveisModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
