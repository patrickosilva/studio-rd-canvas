-- CreateEnum
CREATE TYPE "StatusAssinatura" AS ENUM ('ATIVA', 'PAUSADA', 'CANCELADA', 'EXPIRADA');

-- CreateTable
CREATE TABLE "PlanoAssinatura" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "precoCentavos" INTEGER NOT NULL,
    "cortesPorCiclo" INTEGER NOT NULL,
    "duracaoDias" INTEGER NOT NULL DEFAULT 30,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanoAssinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssinaturaCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "planoId" TEXT NOT NULL,
    "status" "StatusAssinatura" NOT NULL DEFAULT 'ATIVA',
    "inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vigenciaInicio" TIMESTAMP(3) NOT NULL,
    "vigenciaFim" TIMESTAMP(3) NOT NULL,
    "saldoCortes" INTEGER NOT NULL,
    "renovaAutomaticamente" BOOLEAN NOT NULL DEFAULT false,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssinaturaCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsoAssinatura" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "agendamentoId" TEXT NOT NULL,
    "quantidadeCortes" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsoAssinatura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagamentoAssinatura" (
    "id" TEXT NOT NULL,
    "assinaturaId" TEXT NOT NULL,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "valorCentavos" INTEGER NOT NULL,
    "pagoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagamentoAssinatura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanoAssinatura_nome_key" ON "PlanoAssinatura"("nome");

-- CreateIndex
CREATE INDEX "PlanoAssinatura_ativo_idx" ON "PlanoAssinatura"("ativo");

-- CreateIndex
CREATE INDEX "AssinaturaCliente_clienteId_idx" ON "AssinaturaCliente"("clienteId");

-- CreateIndex
CREATE INDEX "AssinaturaCliente_planoId_idx" ON "AssinaturaCliente"("planoId");

-- CreateIndex
CREATE INDEX "AssinaturaCliente_status_idx" ON "AssinaturaCliente"("status");

-- CreateIndex
CREATE INDEX "AssinaturaCliente_vigenciaFim_idx" ON "AssinaturaCliente"("vigenciaFim");

-- CreateIndex
CREATE UNIQUE INDEX "UsoAssinatura_agendamentoId_key" ON "UsoAssinatura"("agendamentoId");

-- CreateIndex
CREATE INDEX "UsoAssinatura_assinaturaId_idx" ON "UsoAssinatura"("assinaturaId");

-- CreateIndex
CREATE INDEX "PagamentoAssinatura_assinaturaId_idx" ON "PagamentoAssinatura"("assinaturaId");

-- CreateIndex
CREATE INDEX "PagamentoAssinatura_formaPagamento_idx" ON "PagamentoAssinatura"("formaPagamento");

-- CreateIndex
CREATE INDEX "PagamentoAssinatura_pagoEm_idx" ON "PagamentoAssinatura"("pagoEm");

-- AddForeignKey
ALTER TABLE "AssinaturaCliente" ADD CONSTRAINT "AssinaturaCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssinaturaCliente" ADD CONSTRAINT "AssinaturaCliente_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "PlanoAssinatura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoAssinatura" ADD CONSTRAINT "UsoAssinatura_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "AssinaturaCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsoAssinatura" ADD CONSTRAINT "UsoAssinatura_agendamentoId_fkey" FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagamentoAssinatura" ADD CONSTRAINT "PagamentoAssinatura_assinaturaId_fkey" FOREIGN KEY ("assinaturaId") REFERENCES "AssinaturaCliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;
