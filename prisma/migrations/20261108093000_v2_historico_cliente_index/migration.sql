-- V2.1: otimiza a consulta paginada do histÃ³rico de atendimentos do cliente.
CREATE INDEX IF NOT EXISTS "Agendamento_clienteId_inicio_idx"
ON "Agendamento"("clienteId", "inicio");