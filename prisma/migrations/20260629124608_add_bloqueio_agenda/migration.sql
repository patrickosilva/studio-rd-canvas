-- CreateTable
CREATE TABLE "BloqueioAgenda" (
    "id" TEXT NOT NULL,
    "profissionalId" TEXT,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloqueioAgenda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BloqueioAgenda_profissionalId_idx" ON "BloqueioAgenda"("profissionalId");

-- CreateIndex
CREATE INDEX "BloqueioAgenda_inicio_idx" ON "BloqueioAgenda"("inicio");

-- CreateIndex
CREATE INDEX "BloqueioAgenda_fim_idx" ON "BloqueioAgenda"("fim");

-- CreateIndex
CREATE INDEX "BloqueioAgenda_ativo_idx" ON "BloqueioAgenda"("ativo");

-- CreateIndex
CREATE INDEX "BloqueioAgenda_profissionalId_inicio_idx" ON "BloqueioAgenda"("profissionalId", "inicio");

-- AddForeignKey
ALTER TABLE "BloqueioAgenda" ADD CONSTRAINT "BloqueioAgenda_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
