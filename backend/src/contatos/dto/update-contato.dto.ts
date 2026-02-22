import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateContatoDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  origem?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  estagio?: string;

  @IsOptional()
  @IsUUID()
  usuarioResponsavelId?: string;
}
