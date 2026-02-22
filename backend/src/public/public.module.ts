import { Module } from '@nestjs/common';
import { ContatosModule } from '../contatos/contatos.module';
import { ImoveisModule } from '../imoveis/imoveis.module';
import { PublicController } from './public.controller';

@Module({
  imports: [ImoveisModule, ContatosModule],
  controllers: [PublicController],
})
export class PublicModule {}
