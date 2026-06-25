-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DINHEIRO', 'CARTAO_DEBITO', 'CARTAO_CREDITO', 'ASSINATURA', 'CORTESIA', 'OUTRO');

-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "formaPagamento" "FormaPagamento",
ADD COLUMN     "observacaoPagamento" TEXT,
ADD COLUMN     "pagoEm" TIMESTAMP(3),
ADD COLUMN     "valorPagoCentavos" INTEGER;

-- CreateIndex
CREATE INDEX "Agendamento_formaPagamento_idx" ON "Agendamento"("formaPagamento");
