import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ImoveisController } from './imoveis.controller';
import { ImoveisDocumentosService } from './imoveis-documentos.service';
import { ImoveisFotosService } from './imoveis-fotos.service';
import { ImoveisService } from './imoveis.service';

@Module({
  imports: [StorageModule],
  controllers: [ImoveisController],
  providers: [ImoveisService, ImoveisFotosService, ImoveisDocumentosService],
  exports: [ImoveisService, ImoveisFotosService, ImoveisDocumentosService],
})
export class ImoveisModule {}
