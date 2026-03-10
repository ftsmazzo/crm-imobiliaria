-- CreateTable
CREATE TABLE "site_config" (
    "id" TEXT NOT NULL,
    "logo_key" TEXT,
    "hero_image_key" TEXT,
    "nome" TEXT,
    "whatsapp" TEXT,
    "endereco" TEXT,
    "creci" TEXT,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

-- Insert single row for site config
INSERT INTO "site_config" ("id", "atualizado_em") VALUES (gen_random_uuid(), NOW());
