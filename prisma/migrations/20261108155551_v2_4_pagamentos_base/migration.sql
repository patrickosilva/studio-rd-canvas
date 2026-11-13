/*
  Warnings:

  - A unique constraint covering the columns `[providerSubscriptionId]` on the table `AssinaturaCliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[providerPaymentId]` on the table `PagamentoAssinatura` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProvedorPagamento" AS ENUM ('MANUAL', 'MERCADO_PAGO');

-- CreateEnum
CREATE TYPE "StatusConexaoPagamento" AS ENUM ('DESCONECTADA', 'PENDENTE', 'CONECTADA', 'ERRO');

-- AlterTable
ALTER TABLE "AssinaturaCliente" ADD COLUMN     "cancelarAoFimDoCiclo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "percentualComissaoBps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "provedorPagamento" "ProvedorPagamento" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "providerCustomerId" TEXT,
ADD COLUMN     "providerSubscriptionId" TEXT,
ADD COLUMN     "proximaCobrancaEm" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PagamentoAssinatura" ADD COLUMN     "comissaoPlataformaCentavos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "provedorPagamento" "ProvedorPagamento" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "providerPaymentId" TEXT,
ADD COLUMN     "providerStatus" TEXT,
ADD COLUMN     "taxaGatewayCentavos" INTEGER,
ADD COLUMN     "valorLiquidoBarbeariaCentavos" INTEGER;

-- AlterTable
ALTER TABLE "PlanoAssinatura" ADD COLUMN     "providerPlanId" TEXT;

-- CreateTable
CREATE TABLE "ContaRecebedoraPagamento" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL DEFAULT 'STUDIO_RD',
    "provedor" "ProvedorPagamento" NOT NULL DEFAULT 'MERCADO_PAGO',
    "status" "StatusConexaoPagamento" NOT NULL DEFAULT 'DESCONECTADA',
    "providerUserId" TEXT,
    "providerAccountId" TEXT,
    "accessTokenCriptografado" TEXT,
    "refreshTokenCriptografado" TEXT,
    "tokenExpiraEm" TIMESTAMP(3),
    "conectadoEm" TIMESTAMP(3),
    "desconectadoEm" TIMESTAMP(3),
    "ultimoErro" TEXT,
    "comissaoAtiva" BOOLEAN NOT NULL DEFAULT false,
    "percentualComissaoBps" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaRecebedoraPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoWebhookPagamento" (
    "id" TEXT NOT NULL,
    "provedor" "ProvedorPagamento" NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "providerResourceId" TEXT,
    "payloadHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEBIDO',
    "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processadoEm" TIMESTAMP(3),
    "erro" TEXT,

    CONSTRAINT "EventoWebhookPagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContaRecebedoraPagamento_chave_key" ON "ContaRecebedoraPagamento"("chave");

-- CreateIndex
CREATE UNIQUE INDEX "ContaRecebedoraPagamento_providerUserId_key" ON "ContaRecebedoraPagamento"("providerUserId");

-- CreateIndex
CREATE INDEX "ContaRecebedoraPagamento_provedor_status_idx" ON "ContaRecebedoraPagamento"("provedor", "status");

-- CreateIndex
CREATE INDEX "EventoWebhookPagamento_provedor_tipo_recebidoEm_idx" ON "EventoWebhookPagamento"("provedor", "tipo", "recebidoEm");

-- CreateIndex
CREATE INDEX "EventoWebhookPagamento_status_recebidoEm_idx" ON "EventoWebhookPagamento"("status", "recebidoEm");

-- CreateIndex
CREATE UNIQUE INDEX "EventoWebhookPagamento_provedor_providerEventId_key" ON "EventoWebhookPagamento"("provedor", "providerEventId");

-- CreateIndex
CREATE UNIQUE INDEX "AssinaturaCliente_providerSubscriptionId_key" ON "AssinaturaCliente"("providerSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "PagamentoAssinatura_providerPaymentId_key" ON "PagamentoAssinatura"("providerPaymentId");
