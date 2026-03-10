import { IsOptional, IsString } from 'class-validator';

export class UpdateSiteConfigDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  creci?: string;
}
