-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "termosAceitosEm" TIMESTAMP(3),
ADD COLUMN     "termosVersaoAceita" TEXT;

-- CreateTable
CREATE TABLE "EventoSeguranca" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "chaveHash" TEXT,
    "sucesso" BOOLEAN,
    "rota" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventoSeguranca_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventoSeguranca_tipo_chaveHash_criadoEm_idx" ON "EventoSeguranca"("tipo", "chaveHash", "criadoEm");

-- CreateIndex
CREATE INDEX "EventoSeguranca_tipo_criadoEm_idx" ON "EventoSeguranca"("tipo", "criadoEm");

-- CreateIndex
CREATE INDEX "EventoSeguranca_criadoEm_idx" ON "EventoSeguranca"("criadoEm");
