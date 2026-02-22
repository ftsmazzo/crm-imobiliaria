import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ImoveisController } from './imoveis.controller';
import { ImoveisFotosService } from './imoveis-fotos.service';
import { ImoveisService } from './imoveis.service';

@Module({
  imports: [StorageModule],
  controllers: [ImoveisController],
  providers: [ImoveisService, ImoveisFotosService],
  exports: [ImoveisService, ImoveisFotosService],
})
export class ImoveisModule {}
