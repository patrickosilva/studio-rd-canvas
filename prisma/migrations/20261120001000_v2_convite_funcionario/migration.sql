CREATE TABLE IF NOT EXISTS "ConviteFuncionario" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiraEm" TIMESTAMP(3) NOT NULL,
  "usadoEm" TIMESTAMP(3),
  "criadoPorUsuarioId" TEXT NOT NULL,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ConviteFuncionario_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ConviteFuncionario_tokenHash_key"
ON "ConviteFuncionario"("tokenHash");

CREATE INDEX IF NOT EXISTS "ConviteFuncionario_email_idx"
ON "ConviteFuncionario"("email");

CREATE INDEX IF NOT EXISTS "ConviteFuncionario_expiraEm_idx"
ON "ConviteFuncionario"("expiraEm");

CREATE INDEX IF NOT EXISTS "ConviteFuncionario_usadoEm_idx"
ON "ConviteFuncionario"("usadoEm");