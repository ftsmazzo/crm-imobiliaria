import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTarefaDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  dataPrevista?: string; // YYYY-MM-DD

  @IsOptional()
  @IsUUID()
  contatoId?: string;

  @IsOptional()
  @IsUUID()
  imovelId?: string;
}
