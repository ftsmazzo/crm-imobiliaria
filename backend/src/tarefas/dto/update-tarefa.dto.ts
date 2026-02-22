import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTarefaDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  dataPrevista?: string;

  @IsOptional()
  @IsBoolean()
  concluida?: boolean;

  @IsOptional()
  @IsUUID()
  contatoId?: string;

  @IsOptional()
  @IsUUID()
  imovelId?: string;
}
