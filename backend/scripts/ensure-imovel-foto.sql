-- Garante que a tabela imovel_foto existe (fallback se a migration estiver em estado inconsistente)
CREATE TABLE IF NOT EXISTS "imovel_foto" (
    "id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "imovel_foto_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'imovel_foto_imovel_id_fkey') THEN
    ALTER TABLE "imovel_foto" ADD CONSTRAINT "imovel_foto_imovel_id_fkey"
    FOREIGN KEY ("imovel_id") REFERENCES "imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
