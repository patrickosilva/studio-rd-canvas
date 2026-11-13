-- CreateEnum
CREATE TYPE "ProvedorIntegracao" AS ENUM ('INTER', 'META');

-- CreateEnum
CREATE TYPE "StatusIntegracao" AS ENUM ('DESCONECTADA', 'CONFIGURANDO', 'CONECTADA', 'ERRO');

-- AlterEnum
ALTER TYPE "ProvedorPagamento" ADD VALUE 'INTER';

-- CreateTable
CREATE TABLE "IntegracaoExterna" (
    "id" TEXT NOT NULL,
    "provedor" "ProvedorIntegracao" NOT NULL,
    "status" "StatusIntegracao" NOT NULL DEFAULT 'DESCONECTADA',
    "nomeConta" TEXT,
    "identificadorExterno" TEXT,
    "configuracaoPublica" JSONB,
    "segredoCriptografado" TEXT,
    "conectadoEm" TIMESTAMP(3),
    "verificadoEm" TIMESTAMP(3),
    "ultimoErro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegracaoExterna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegracaoExterna_provedor_key" ON "IntegracaoExterna"("provedor");

-- CreateIndex
CREATE INDEX "IntegracaoExterna_status_idx" ON "IntegracaoExterna"("status");
