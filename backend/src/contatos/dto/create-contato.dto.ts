import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateContatoDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

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
