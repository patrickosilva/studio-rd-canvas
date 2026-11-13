ALTER TABLE "Agendamento"
  ADD COLUMN IF NOT EXISTS "precoOriginalCentavos" INTEGER,
  ADD COLUMN IF NOT EXISTS "descontoCupomCentavos" INTEGER,
  ADD COLUMN IF NOT EXISTS "valorFinalCentavos" INTEGER,
  ADD COLUMN IF NOT EXISTS "cupomCodigo" TEXT;

ALTER TABLE "UsoCupom"
  ADD COLUMN IF NOT EXISTS "precoOriginalCentavos" INTEGER,
  ADD COLUMN IF NOT EXISTS "valorFinalCentavos" INTEGER;

CREATE INDEX IF NOT EXISTS "Agendamento_cupomCodigo_idx"
ON "Agendamento"("cupomCodigo");
