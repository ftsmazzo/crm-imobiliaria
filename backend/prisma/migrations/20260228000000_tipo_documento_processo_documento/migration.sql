-- CreateTable
CREATE TABLE "tipo_documento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "contexto" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tipo_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processo_documento" (
    "id" TEXT NOT NULL,
    "contato_id" TEXT NOT NULL,
    "imovel_id" TEXT,
    "tipo_documento_id" TEXT,
    "key" TEXT NOT NULL,
    "nome_original" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processo_documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "processo_documento_contato_id_idx" ON "processo_documento"("contato_id");
CREATE INDEX "processo_documento_imovel_id_idx" ON "processo_documento"("imovel_id");

-- AddForeignKey
ALTER TABLE "processo_documento" ADD CONSTRAINT "processo_documento_contato_id_fkey" FOREIGN KEY ("contato_id") REFERENCES "Contato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_documento" ADD CONSTRAINT "processo_documento_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "processo_documento" ADD CONSTRAINT "processo_documento_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipo_documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed tipos de documento (imóvel e processo)
INSERT INTO "tipo_documento" ("id", "nome", "contexto", "criado_em") VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'IPTU', 'imovel', CURRENT_TIMESTAMP),
  ('a1b2c3d4-0001-4000-8000-000000000002', 'Autorização', 'imovel', CURRENT_TIMESTAMP),
  ('a1b2c3d4-0001-4000-8000-000000000003', 'Outro (imóvel)', 'imovel', CURRENT_TIMESTAMP),
  ('a1b2c3d4-0002-4000-8000-000000000001', 'Proposta', 'processo', CURRENT_TIMESTAMP),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Contrato', 'processo', CURRENT_TIMESTAMP),
  ('a1b2c3d4-0002-4000-8000-000000000003', 'Laudo', 'processo', CURRENT_TIMESTAMP),
  ('a1b2c3d4-0002-4000-8000-000000000004', 'Outro (processo)', 'processo', CURRENT_TIMESTAMP);
