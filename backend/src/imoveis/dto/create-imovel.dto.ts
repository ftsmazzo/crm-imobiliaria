import { IsBoolean, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

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
  complemento?: string;

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
  @IsNumber()
  valorIptu?: number;

  @IsOptional()
  @IsNumber()
  valorCondominio?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  quadra?: string;

  @IsOptional()
  @IsString()
  lote?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsInt()
  qtdQuartos?: number;

  @IsOptional()
  @IsInt()
  qtdBanheiros?: number;

  @IsOptional()
  @IsInt()
  qtdSalas?: number;

  @IsOptional()
  @IsInt()
  lavabo?: number;

  @IsOptional()
  @IsNumber()
  area?: number;

  @IsOptional()
  @IsNumber()
  areaTerreno?: number;

  @IsOptional()
  @IsInt()
  anoConstrucao?: number;

  @IsOptional()
  @IsString()
  tipoPiso?: string;

  @IsOptional()
  @IsString()
  numeroMatricula?: string;

  @IsOptional()
  @IsString()
  numeroIptu?: string;

  @IsOptional()
  @IsString()
  cartorio?: string;

  @IsOptional()
  @IsString()
  tipoListing?: string;

  @IsOptional()
  @IsString()
  subtipo?: string;

  @IsOptional()
  @IsBoolean()
  exibirEnderecoSite?: boolean;

  @IsOptional()
  @IsInt()
  qtdVagas?: number;

  @IsOptional()
  @IsString()
  tipoVaga?: string;

  @IsOptional()
  @IsString()
  pontosReferencia?: string;

  @IsOptional()
  @IsString()
  eletrodomesticos?: string;

  @IsOptional()
  @IsInt()
  andarUnidade?: number;

  @IsOptional()
  @IsInt()
  qtdAndares?: number;

  @IsOptional()
  @IsInt()
  totalUnidades?: number;

  @IsOptional()
  @IsInt()
  qtdTorres?: number;

  @IsOptional()
  @IsString()
  caracteristicas?: string;

  @IsOptional()
  @IsString()
  empreendimentoId?: string;

  @IsOptional()
  @IsString()
  proprietarioId?: string;

  @IsOptional()
  @IsString()
  usuarioResponsavelId?: string;
}
