import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ProcessoDocumentoService } from './processo-documento.service';

@Module({
  imports: [StorageModule],
  providers: [ProcessoDocumentoService],
  exports: [ProcessoDocumentoService],
})
export class ProcessoDocumentoModule {}
