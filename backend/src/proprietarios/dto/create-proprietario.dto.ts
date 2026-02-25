import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateProprietarioDto {
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  dataNascimento?: string; // ISO date

  @IsOptional()
  @IsString()
  estadoCivil?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  telefone2?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @IsString()
  tipo?: string; // PF ou PJ

  @IsOptional()
  @IsString()
  razaoSocial?: string;

  @IsOptional()
  @IsString()
  cnpj?: string;

  @IsOptional()
  @IsString()
  inscricaoEstadual?: string;

  @IsOptional()
  @IsString()
  repLegalNome?: string;

  @IsOptional()
  @IsString()
  repLegalCpf?: string;

  @IsOptional()
  @IsString()
  repLegalContato?: string;

  @IsOptional()
  @IsString()
  repLegalEmail?: string;
}
