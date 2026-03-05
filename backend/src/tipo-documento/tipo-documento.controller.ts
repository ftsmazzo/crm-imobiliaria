import { Controller, Get, Query } from '@nestjs/common';
import { TipoDocumentoService } from './tipo-documento.service';

@Controller('tipo-documento')
export class TipoDocumentoController {
  constructor(private service: TipoDocumentoService) {}

  @Get()
  findAll(@Query('contexto') contexto?: 'imovel' | 'processo') {
    return this.service.findAll(contexto);
  }
}
