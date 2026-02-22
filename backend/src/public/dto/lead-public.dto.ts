import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class LeadPublicDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  mensagem?: string;

  @IsOptional()
  @IsUUID()
  imovelId?: string;

  @IsOptional()
  @IsString()
  origem?: string; // site, encomende, anuncie, etc.
}
