import { IsOptional, IsString } from 'class-validator';

export class CreateEmpreendimentoDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  endereco?: string;
}
