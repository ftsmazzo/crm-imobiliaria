-- Foto de capa do imóvel (para o site): uma por imóvel
ALTER TABLE "imovel_foto" ADD COLUMN "capa" BOOLEAN NOT NULL DEFAULT false;
