import { Module } from '@nestjs/common';
import { ContatosModule } from '../contatos/contatos.module';
import { ImoveisModule } from '../imoveis/imoveis.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicController } from './public.controller';

@Module({
  imports: [ImoveisModule, ContatosModule, PrismaModule],
  controllers: [PublicController],
})
export class PublicModule {}
