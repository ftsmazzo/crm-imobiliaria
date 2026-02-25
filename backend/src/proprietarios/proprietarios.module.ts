import { Module } from '@nestjs/common';
import { ProprietariosController } from './proprietarios.controller';
import { ProprietariosService } from './proprietarios.service';

@Module({
  controllers: [ProprietariosController],
  providers: [ProprietariosService],
  exports: [ProprietariosService],
})
export class ProprietariosModule {}
