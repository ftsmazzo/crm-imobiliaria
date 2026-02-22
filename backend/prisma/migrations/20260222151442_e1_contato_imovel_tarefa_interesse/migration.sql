-- CreateTable
CREATE TABLE "Contato" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "origem" TEXT,
    "observacoes" TEXT,
    "estagio" TEXT NOT NULL DEFAULT 'novo',
    "usuario_responsavel_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Imovel" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "rua" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "cep" TEXT,
    "valor_venda" DECIMAL(14,2),
    "valor_aluguel" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'disponivel',
    "codigo" TEXT,
    "descricao" TEXT,
    "qtd_quartos" INTEGER,
    "qtd_banheiros" INTEGER,
    "area" DECIMAL(10,2),
    "usuario_responsavel_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Imovel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_prevista" DATE,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "usuario_id" TEXT NOT NULL,
    "contato_id" TEXT,
    "imovel_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interesse" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'interesse',
    "valor" DECIMAL(14,2),
    "status" TEXT,
    "observacao" TEXT,
    "contato_id" TEXT NOT NULL,
    "imovel_id" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interesse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Contato" ADD CONSTRAINT "Contato_usuario_responsavel_id_fkey" FOREIGN KEY ("usuario_responsavel_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Imovel" ADD CONSTRAINT "Imovel_usuario_responsavel_id_fkey" FOREIGN KEY ("usuario_responsavel_id") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_contato_id_fkey" FOREIGN KEY ("contato_id") REFERENCES "Contato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "Imovel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interesse" ADD CONSTRAINT "Interesse_contato_id_fkey" FOREIGN KEY ("contato_id") REFERENCES "Contato"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interesse" ADD CONSTRAINT "Interesse_imovel_id_fkey" FOREIGN KEY ("imovel_id") REFERENCES "Imovel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
