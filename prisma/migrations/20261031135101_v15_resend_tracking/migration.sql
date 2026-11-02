/*
  Warnings:

  - A unique constraint covering the columns `[resendEmailId]` on the table `TokenRedefinicaoSenha` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TokenRedefinicaoSenha" ADD COLUMN     "emailStatus" TEXT,
ADD COLUMN     "emailStatusAtualizadoEm" TIMESTAMP(3),
ADD COLUMN     "resendEmailId" TEXT,
ADD COLUMN     "resendMessageId" TEXT;

-- CreateTable
CREATE TABLE "EventoWebhookResend" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "resendEmailId" TEXT,
    "recebidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoWebhookResend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventoWebhookResend_eventoId_key" ON "EventoWebhookResend"("eventoId");

-- CreateIndex
CREATE INDEX "EventoWebhookResend_resendEmailId_idx" ON "EventoWebhookResend"("resendEmailId");

-- CreateIndex
CREATE INDEX "EventoWebhookResend_tipo_recebidoEm_idx" ON "EventoWebhookResend"("tipo", "recebidoEm");

-- CreateIndex
CREATE INDEX "EventoWebhookResend_recebidoEm_idx" ON "EventoWebhookResend"("recebidoEm");

-- CreateIndex
CREATE UNIQUE INDEX "TokenRedefinicaoSenha_resendEmailId_key" ON "TokenRedefinicaoSenha"("resendEmailId");
