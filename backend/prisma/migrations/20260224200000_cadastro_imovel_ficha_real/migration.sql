-- CreateTable
CREATE TABLE "empreendimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "endereco" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empreendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imovel_documento" (
    "id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "nome" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imovel_documento_pkey" PRIMARY KEY ("id")
);

-- AlterTable Imovel: new columns (table "Imovel" from initial migration)
ALTER TABLE "Imovel" ADD COLUMN "valor_iptu" DECIMAL(14,2);
ALTER TABLE "Imovel" ADD COLUMN "valor_condominio" DECIMAL(14,2);
ALTER TABLE "Imovel" ADD COLUMN "quadra" TEXT;
ALTER TABLE "Imovel" ADD COLUMN "lote" TEXT;
ALTER TABLE "Imovel" ADD COLUMN "qtd_salas" INTEGER;
ALTER TABLE "Imovel" ADD COLUMN "lavabo" INTEGER DEFAULT 0;
ALTER TABLE "Imovel" ADD COLUMN "area_terreno" DECIMAL(10,2);
ALTER TABLE "Imovel" ADD COLUMN "ano_construcao" INTEGER;
ALTER TABLE "Imovel" ADD COLUMN "tipo_piso" TEXT;
ALTER TABLE "Imovel" ADD COLUMN "empreendimento_id" TEXT;
ALTER TABLE "Imovel" ADD COLUMN "proprietario_id" TEXT;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_empreendimento_id_fkey" FOREIGN KEY ("empreendimento_id") REFERENCES "empreendimento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "Contato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imovel_documento" ADD CONSTRAINT "imovel_documento_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
