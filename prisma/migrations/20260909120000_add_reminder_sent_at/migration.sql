-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN "reminderSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Agendamento_status_reminderSentAt_inicio_idx" ON "Agendamento"("status", "reminderSentAt", "inicio");
