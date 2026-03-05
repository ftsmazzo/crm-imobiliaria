import { Module } from '@nestjs/common';
import { ProcessoDocumentoModule } from '../processo-documento/processo-documento.module';
import { ContatosController } from './contatos.controller';
import { ContatosService } from './contatos.service';

@Module({
  imports: [ProcessoDocumentoModule],
  controllers: [ContatosController],
  providers: [ContatosService],
  exports: [ContatosService],
})
export class ContatosModule {}
