import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateImovelDto {
  @IsString()
  tipo: string;

  @IsOptional()
  @IsString()
  rua?: string;

  @IsOptional()
  @IsString()
  numero?: string;

  @IsOptional()
  @IsString()
  bairro?: string;

  @IsOptional()
  @IsString()
  cidade?: string;

  @IsOptional()
  @IsString()
  cep?: string;

  @IsOptional()
  @IsNumber()
  valorVenda?: number;

  @IsOptional()
  @IsNumber()
  valorAluguel?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsNumber()
  qtdQuartos?: number;

  @IsOptional()
  @IsNumber()
  qtdBanheiros?: number;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsString()
  usuarioResponsavelId?: string;
}
