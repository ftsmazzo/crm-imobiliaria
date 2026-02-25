-- CreateTable
CREATE TABLE "proprietario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" VARCHAR(14),
    "telefone" TEXT,
    "email" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proprietario_pkey" PRIMARY KEY ("id")
);

-- Clear old FK to Contato (proprietario_id pointed to Contato) before switching to Proprietario
UPDATE "Imovel" SET "proprietario_id" = NULL WHERE "proprietario_id" IS NOT NULL;

-- Drop old FK to Contato
ALTER TABLE "Imovel" DROP CONSTRAINT IF EXISTS "Imovel_proprietario_id_fkey";

-- Add new FK to Proprietario
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_proprietario_id_fkey" FOREIGN KEY ("proprietario_id") REFERENCES "proprietario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
