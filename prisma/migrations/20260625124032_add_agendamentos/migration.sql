-- CreateEnum
CREATE TYPE "StatusAgendamento" AS ENUM ('SOLICITADO', 'CONFIRMADO', 'RECUSADO', 'CANCELADO_CLIENTE', 'CANCELADO_FUNCIONARIO', 'CONCLUIDO', 'FALTOU');

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "status" "StatusAgendamento" NOT NULL DEFAULT 'SOLICITADO',
    "observacaoCliente" TEXT,
    "observacaoInterna" TEXT,
    "motivoRecusa" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Agendamento_clienteId_idx" ON "Agendamento"("clienteId");

-- CreateIndex
CREATE INDEX "Agendamento_profissionalId_idx" ON "Agendamento"("profissionalId");

-- CreateIndex
CREATE INDEX "Agendamento_servicoId_idx" ON "Agendamento"("servicoId");

-- CreateIndex
CREATE INDEX "Agendamento_status_idx" ON "Agendamento"("status");

-- CreateIndex
CREATE INDEX "Agendamento_inicio_idx" ON "Agendamento"("inicio");

-- CreateIndex
CREATE INDEX "Agendamento_profissionalId_inicio_idx" ON "Agendamento"("profissionalId", "inicio");

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
