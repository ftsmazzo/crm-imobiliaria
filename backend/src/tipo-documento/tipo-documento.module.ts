import { Module } from '@nestjs/common';
import { TipoDocumentoController } from './tipo-documento.controller';
import { TipoDocumentoService } from './tipo-documento.service';

@Module({
  controllers: [TipoDocumentoController],
  providers: [TipoDocumentoService],
  exports: [TipoDocumentoService],
})
export class TipoDocumentoModule {}
