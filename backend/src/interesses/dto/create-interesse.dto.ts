import { IsString, IsUUID } from 'class-validator';

export class CreateInteresseDto {
  @IsString()
  @IsUUID()
  contatoId: string;

  @IsString()
  @IsUUID()
  imovelId: string;
}
