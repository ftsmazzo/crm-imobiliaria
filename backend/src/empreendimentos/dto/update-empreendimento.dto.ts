import { IsOptional, IsString } from 'class-validator';

export class UpdateEmpreendimentoDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  endereco?: string;
}
