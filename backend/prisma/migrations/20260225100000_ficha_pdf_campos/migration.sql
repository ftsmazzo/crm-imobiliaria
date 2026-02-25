-- Proprietario: novos campos PF/PJ e representante legal
ALTER TABLE "proprietario" ADD COLUMN "rg" VARCHAR(20);
ALTER TABLE "proprietario" ADD COLUMN "data_nascimento" DATE;
ALTER TABLE "proprietario" ADD COLUMN "estado_civil" VARCHAR(20);
ALTER TABLE "proprietario" ADD COLUMN "telefone2" TEXT;
ALTER TABLE "proprietario" ADD COLUMN "tipo" TEXT DEFAULT 'PF';
ALTER TABLE "proprietario" ADD COLUMN "razao_social" TEXT;
ALTER TABLE "proprietario" ADD COLUMN "cnpj" VARCHAR(18);
ALTER TABLE "proprietario" ADD COLUMN "inscricao_estadual" TEXT;
ALTER TABLE "proprietario" ADD COLUMN "rep_legal_nome" TEXT;
ALTER TABLE "proprietario" ADD COLUMN "rep_legal_cpf" VARCHAR(14);
ALTER TABLE "proprietario" ADD COLUMN "rep_legal_contato" TEXT;
ALTER TABLE "proprietario" ADD COLUMN "rep_legal_email" TEXT;

-- Imovel: campos da ficha PDF
ALTER TABLE "Imovel" ADD COLUMN "complemento" VARCHAR(100);
ALTER TABLE "Imovel" ADD COLUMN "numero_matricula" TEXT;
ALTER TABLE "Imovel" ADD COLUMN "numero_iptu" VARCHAR(30);
ALTER TABLE "Imovel" ADD COLUMN "cartorio" VARCHAR(100);
ALTER TABLE "Imovel" ADD COLUMN "tipo_listing" TEXT;
ALTER TABLE "Imovel" ADD COLUMN "subtipo" VARCHAR(80);
ALTER TABLE "Imovel" ADD COLUMN "exibir_endereco_site" BOOLEAN DEFAULT true;
ALTER TABLE "Imovel" ADD COLUMN "qtd_vagas" INTEGER;
ALTER TABLE "Imovel" ADD COLUMN "tipo_vaga" TEXT;
ALTER TABLE "Imovel" ADD COLUMN "pontos_referencia" VARCHAR(200);
ALTER TABLE "Imovel" ADD COLUMN "eletrodomesticos" TEXT;
ALTER TABLE "Imovel" ADD COLUMN "andar_unidade" INTEGER;
ALTER TABLE "Imovel" ADD COLUMN "qtd_andares" INTEGER;
ALTER TABLE "Imovel" ADD COLUMN "total_unidades" INTEGER;
ALTER TABLE "Imovel" ADD COLUMN "qtd_torres" INTEGER;
ALTER TABLE "Imovel" ADD COLUMN "caracteristicas" TEXT;
