-- CreateTable
CREATE TABLE "imovel_foto" (
    "id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imovel_foto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "imovel_foto" ADD CONSTRAINT "imovel_foto_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
