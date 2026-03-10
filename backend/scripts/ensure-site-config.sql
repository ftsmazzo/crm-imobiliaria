-- Garante que a tabela site_config existe (fallback se a migration não tiver sido aplicada)
CREATE TABLE IF NOT EXISTS "site_config" (
    "id" TEXT NOT NULL,
    "logo_key" TEXT,
    "hero_image_key" TEXT,
    "nome" TEXT,
    "whatsapp" TEXT,
    "endereco" TEXT,
    "creci" TEXT,
    "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- Insere uma linha só se a tabela estiver vazia
INSERT INTO "site_config" ("id", "atualizado_em")
SELECT gen_random_uuid(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "site_config" LIMIT 1);
