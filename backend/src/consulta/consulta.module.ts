import { Module } from '@nestjs/common';
import { ConsultaController } from './consulta.controller';

@Module({
  controllers: [ConsultaController],
})
export class ConsultaModule {}
