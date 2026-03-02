import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

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
  @IsIn(['baixa', 'media', 'alta'])
  prioridade?: string;

  @IsOptional()
  @IsUUID()
  contatoId?: string;

  @IsOptional()
  @IsUUID()
  imovelId?: string;
}
